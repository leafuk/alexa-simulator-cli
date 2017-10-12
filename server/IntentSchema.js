var fileUtil = require("./FileUtil");

"use strict";
var IntentSchema = (function () {
    function IntentSchema(schemaJSON) {
        this.schemaJSON = schemaJSON;
    }
    IntentSchema.fromFile = function (file, callback) {
        fileUtil.FileUtil.readFile(file, function (data) {
            if (data !== null) {
                var json = null;
                try {
                    json = JSON.parse(data.toString());
                    var schema = new IntentSchema(json);
                    callback(schema);
                }
                catch (e) {
                    callback(null, "Bad JSON!!: " + e.message);
                }
            }
            else {
                var error = "File not found: " + file;
                callback(null, error);
            }
        });
    };

    IntentSchema.fromJSON = function (schemaJSON) {
        return new IntentSchema(schemaJSON);
    };

    IntentSchema.prototype.intents = function () {
        var intentArray = [];
        for (var _i = 0, _a = this.schemaJSON.intents; _i < _a.length; _i++) {
            var intentJSON = _a[_i];
            var intent = new Intent(intentJSON.name);
            if (intentJSON.slots !== undefined && intentJSON.slots !== null) {
                for (var _b = 0, _c = intentJSON.slots; _b < _c.length; _b++) {
                    var slotJSON = _c[_b];
                    intent.addSlot(new IntentSlot(slotJSON.name, slotJSON.type));
                }
            }
            if (intentJSON.samples !== undefined && intentJSON.samples !== null) {
                for (var _b = 0, _c = intentJSON.samples; _b < _c.length; _b++) {
                    var sample = _c[_b];
                    intent.addSample(sample);
                }
            }
            intentArray.push(intent);
        }

        return intentArray;
    };

    IntentSchema.prototype.intent = function (intentString) {
        var intent = null;
        for (var _i = 0, _a = this.intents(); _i < _a.length; _i++) {
            var o = _a[_i];
            if (o.name === intentString) {
                intent = o;
                break;
            }
        }

        return intent;
    };

    IntentSchema.prototype.hasIntent = function (intentString) {
        return this.intent(intentString) !== null;
    };



    /**
     * Returns an uttered intentName tuple for the phrase
     * The uttered intentName has the intentName name and slot information
     * @param phraseString
     * @returns {UtteredIntent}
     */
    IntentSchema.prototype.intentForUtterance = function (phraseString) {
        var phrase = new Phrase(phraseString);
        var matchedIntent = null;
        for (var _i = 0, _a = this.intents(); _i < _a.length; _i++) {
            var intent = _a[_i];
            var samples = intent.samples;

            if (samples){
                for (var _b = 0, samples_1 = samples; _b < samples_1.length; _b++) {
                    var sample = samples_1[_b];
                    if (phrase.matchesUtterance(sample)) {
                        matchedIntent = new UtteredIntent(intent.name, phraseString, new Phrase(sample));
                        break;
                    }
                }
                if (matchedIntent !== null) {
                    break;
                }
            }
        }
        return matchedIntent;
    };

    return IntentSchema;
}());

exports.IntentSchema = IntentSchema;

var Intent = (function () {
    function Intent(name) {
        this.name = name;
        this.builtin = false;
        this.slots = null;
        if (this.name.indexOf("AMAZON") !== -1) {
            this.builtin = true;
        }
        this.samples = null;
    }

    Intent.prototype.addSlot = function (slot) {
        if (this.slots === null) {
            this.slots = [];
        }
        this.slots.push(slot);
    };

    Intent.prototype.addSample = function(sample) {
        if (this.samples === null) {
            this.samples = [];
        }
        this.samples.push(sample);
    }

    return Intent;
}());

exports.Intent = Intent;

var IntentSlot = (function () {
    function IntentSlot(name, type) {
        this.name = name;
        this.type = type;
    }
    
    return IntentSlot;
}());

exports.IntentSlot = IntentSlot;

/**
 * Helper class for handling phrases - breaks out the slots within a phrase
 */
var Phrase = (function () {
    function Phrase(phrase) {
        this.phrase = phrase;
        this.slots = [];
        this.normalizedPhrase = null;
        this.normalizeSlots(this.phrase);
    }

    /**
     * Takes a phrase like "This is a {Slot}" and turns it into "This is a {}"
     * This is so we can compare the sample utterances (which have names that tie off to the slot names defined in the
     *  intent schema) with the actual utterance, which have values in the slot positions (as opposed to the names)
     * @param utterance
     */
    Phrase.prototype.normalizeSlots = function (utterance) {
        // Slots are indicated by {braces}
        var slotlessUtterance = "";
        var index = 0;
        var done = false;
        while (!done) {
            var startSlotIndex = utterance.indexOf("{", index);
            if (startSlotIndex !== -1) {
                var endSlotIndex = utterance.indexOf("}", startSlotIndex);
                // Get the contents of the slot and put it in an array
                var slotValue = utterance.substr(startSlotIndex + 1, endSlotIndex - (startSlotIndex + 1));
                this.slots.push(slotValue);
                slotlessUtterance += utterance.substr(index, startSlotIndex - index + 1) + "}";
                index = endSlotIndex + 1;
            }
            else {
                slotlessUtterance += utterance.substr(index);
                done = true;
            }
        }
        this.normalizedPhrase = slotlessUtterance;
    };

    Phrase.prototype.matchesUtterance = function (otherPhraseString) {
        return this.matches(new Phrase(otherPhraseString));
    };

    Phrase.prototype.matches = function (otherPhrase) {
        return this.normalizedPhrase.toLowerCase() === otherPhrase.normalizedPhrase.toLowerCase();
    };

    return Phrase;
}());

exports.Phrase = Phrase;

/**
 * Object to hold tuple of intentName name, utterance, and the matched phrase
 *
 * Helpful for handling slots
 */
var UtteredIntent = (function () {
    function UtteredIntent(intentName, utterance, matchedPhrase) {
        this.intentName = intentName;
        this.utterance = utterance;
        this.matchedPhrase = matchedPhrase;
    }

    UtteredIntent.prototype.slotCount = function () {
        return this.matchedPhrase.slots.length;
    };

    // UtteredIntent.prototype.intentName = function () {
    //     return this.matchedPhrase;
    // };

    UtteredIntent.prototype.slotName = function (index) {
        return this.matchedPhrase.slots[index];
    };

    UtteredIntent.prototype.slotValue = function (index) {
        return new Phrase(this.utterance).slots[index];
    };

    UtteredIntent.prototype.toJSON = function () {
        var json = {};
        for (var i = 0; i < this.slotCount(); i++) {
            json[this.slotName(i)] = this.slotValue(i);
        }
        return json;
    };

    return UtteredIntent;
}());

exports.UtteredIntent = UtteredIntent;

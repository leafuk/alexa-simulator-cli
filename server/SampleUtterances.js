"use strict";
var fileUtil = require("./FileUtil");

var SampleUtterances = (function () {
    function SampleUtterances() {
        this.samples = {};
    }
    SampleUtterances.fromFile = function (file, callback) {
        fileUtil.FileUtil.readFile(file, function (data) {
            if (data !== null) {
                var sampleUtterances = new SampleUtterances();
                try {
                    sampleUtterances.parseFlatFile(data.toString());
                    callback(sampleUtterances);
                }
                catch (e) {
                    callback(null, e.message);
                }
            }
            else {
                var error = "File not found: " + file;
                callback(null, error);
            }
        });
    };

    SampleUtterances.fromJSON = function (sampleUtterancesJSON) {
        var sampleUtterances = new SampleUtterances();
        for (var _i = 0, _a = Object.keys(sampleUtterancesJSON); _i < _a.length; _i++) {
            var intent = _a[_i];
            sampleUtterances.samples[intent] = sampleUtterancesJSON[intent];
        }
        return sampleUtterances;
    };

    /**
     * To handle the case when what is said does not match any sample utterance
     */
    SampleUtterances.prototype.defaultUtterance = function () {
        // Just grab the first sample for now
        var firstIntent = Object.keys(this.samples)[0];
        return this.samples[firstIntent][0];
    };
    
    /**
     * Returns an uttered intentName tuple for the phrase
     * The uttered intentName has the intentName name and slot information
     * @param phraseString
     * @returns {UtteredIntent}
     */
    SampleUtterances.prototype.intentForUtterance = function (phraseString) {
        var phrase = new Phrase(phraseString);
        var matchedIntent = null;
        for (var _i = 0, _a = Object.keys(this.samples); _i < _a.length; _i++) {
            var intent = _a[_i];
            var samples = this.samples[intent];
            for (var _b = 0, samples_1 = samples; _b < samples_1.length; _b++) {
                var sample = samples_1[_b];
                if (phrase.matchesUtterance(sample)) {
                    matchedIntent = new UtteredIntent(intent, phraseString, new Phrase(sample));
                    break;
                }
            }
            if (matchedIntent !== null) {
                break;
            }
        }
        return matchedIntent;
    };

    SampleUtterances.prototype.hasIntent = function (intent) {
        return intent in this.samples;
    };

    SampleUtterances.prototype.parseFlatFile = function (fileData) {
        var lines = fileData.split("\n");
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (line.trim().length === 0) {
                // We skip blank lines - which is what Alexa does
                continue;
            }
            var index = line.indexOf(" ");
            if (index === -1) {
                throw Error("Invalid sample utterance: " + line);
            }
            var intent = line.substr(0, index);
            var sample = line.substr(index).trim();
            var intentSamples = [];
            if (intent in this.samples) {
                intentSamples = this.samples[intent];
            }
            else {
                this.samples[intent] = intentSamples;
            }
            intentSamples.push(sample);
        }
    };

    return SampleUtterances;
}());

exports.SampleUtterances = SampleUtterances;

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
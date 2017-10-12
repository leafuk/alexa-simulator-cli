var IntentSchema = require('./IntentSchema');
var SampleUtterances = require('./SampleUtterances');

"use strict";
/**
 * Parses and interprets an interaction model
 * Takes in intentName schema and sample utterances from files
 * Then can take a phrase and create an intentName request based on it
 */
var InteractionModel = function (intentSchema, sampleUtterances) {
        this.intentSchema = intentSchema;
        this.sampleUtterances = sampleUtterances;
    }
    
    InteractionModel.fromFiles = function (intentSchemaFile, sampleUtterancesFile, callback) {
        var callbackCount = 0;
        var callbackError = null;
        var intentSchema = null;
        var sampleUtterances = null;
        // Collect responses from the two callbacks
        var done = function (schema, utterances, error) {
            callbackCount++;
            if (schema !== undefined && schema !== null) {
                intentSchema = schema;
            }
            if (utterances !== undefined && utterances !== null) {
                sampleUtterances = utterances;
            }
            if (error !== undefined && error !== null) {
                callbackError = error;
            }
            // All done!
            if (callbackCount === 1) {
                if (callbackError !== null) {
                    callback(null, callbackError);
                }
                else {
                    callback(new InteractionModel(intentSchema, sampleUtterances));
                }
            }
        };

        IntentSchema.IntentSchema.fromFile(intentSchemaFile, function (schema, error) {
            if (error !== undefined && error !== null) {
                console.error("Error loading Intent Schema!");
                console.error("Cause: " + error);
                console.error();
            }

            done(schema, null, error);
        });
        
        // SampleUtterances.SampleUtterances.fromFile(sampleUtterancesFile, function (utterances, error) {
        //     if (error !== undefined && error !== null) {
        //         console.error("Error loading Sample Utterances!");
        //         console.error("Cause: " + error);
        //         console.error();
        //     }
            
        //     done(null, utterances, error);
        // });
    };

    InteractionModel.prototype.intentForUtterance = function (utterance) {
        return this.intentSchema.intentForUtterance(utterance);
    };

    InteractionModel.prototype.hasIntent = function (intent) {
        return this.intentSchema.hasIntent(intent);
    };

exports.InteractionModel = InteractionModel;

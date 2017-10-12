'use strict';

const express = require('express');
const lambdaLocal = require('lambda-local');
var bodyParser = require('body-parser');

var interactionModel = require('./InteractionModel');
var fileUtil = require('./FileUtil');

const app = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.post('/alexa', (req, res) => {
    var event = req.body;

    runLambda(event, res);
});

app.post('/speech', (req, res) => {
    var speech = req.body.speech;
    var requestSession = req.body.session;

    interactionModel.InteractionModel.fromFiles(
        './speechAssets/IntentSchema.json', 
        './speechAssets/SampleUtterances.txt', 
        function(model, err) {
            if(err){
                res.json(err);
            }

            var intent = model.intentForUtterance(speech);

            var intentModel = {
                "name": {},
                "slots": {}
            };

            if(intent === null) {
                if(model.hasIntent(speech)) {
                    // Map the speech directly to intent, as it's a valid intent
                    intentModel.name = speech;
                } else {
                    return res.status(500).send('Utterance not supported');
                }
            } else {
                var slots = {}
                for(var i = 0; i < intent.slotCount(); i++){
                    slots[intent.slotName(i)] = {
                        "name": intent.slotName(i),
                        "value": intent.slotValue(i)
                    }
                }

                intentModel.name = intent.intentName;
                intentModel.slots = slots;
            }

            fileUtil.FileUtil.readFile('./server/IntentRequestBase.json', (data) => {
                if(data === null) { 
                    return res.json({response: 'error'})
                }

                var event = JSON.parse(data.toString());

                event.session = requestSession;
                event.request.intent = intentModel;
                event.request.timestamp = new Date().toISOString();

                runLambda(event, res);
            });
    });
});

app.listen(3010, () => {
  console.log('Express server started on port 3010'); // eslint-disable-line
});

var runLambda = function(event, res){
    lambdaLocal.execute({
        event: event,
        lambdaPath: './src/index.js',
        timeoutMs: 3000,
        callback: function(err, data) {
            if (err) {
                return res.status(500).json(err);
            } else {
                return res.status(200).json({request: event, response: data});
            }
        }
    });
}
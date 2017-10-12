const lambdaLocal = require('lambda-local');
var winston = require('winston');
var colors = require('colors');

winston.remove(winston.transports.Console)

var interactionModel = require('./server/InteractionModel');
var fileUtil = require('./server/FileUtil');

const vorpal = require('vorpal')();

module.exports = { 
    start: function(skill, skillName, interactionModelPath) {
        vorpal
            .command('start', 'Invokes the LaunchRequest')
            .action(function (args, cb) {
                fileUtil.FileUtil.readFile(__dirname + '/server/requestBase.json', (data) => {
                    if(data === null) { 
                        console.log(JSON.stringify({response: 'requests is null'}));
                        cb();
                        return;
                    }

                    var event = JSON.parse(data.toString()).launch;

                    //event.session = requestSession;
                    event.request.timestamp = new Date().toISOString();

                    executeLambda(event, skill, function(err, res){
                        console.log('YAY! Here\'s the response'.bgGreen.black);
                        console.log(res);
                        cb();
                    });
                });
            })

        vorpal
            .command('stop', 'Invokes an AMAZON.StopIntent')
            .action(function (args, cb){
                parseSpeech('AMAZON.StopIntent', interactionModelPath, skill, cb);
            });

        vorpal
            .command('cancel', 'Invokes an AMAZON.CancelIntent')
            .action(function (args, cb){
                parseSpeech('AMAZON.CancelIntent', interactionModelPath, skill, cb);
            });

        vorpal
            .command('say <words...>', 'Invokes the Intent matching the supplied utterance')
            .action(function (args, cb) {
                parseSpeech(args.words.join(' '), interactionModelPath, skill, cb);
            });

        console.log('Skill: ' + skillName);

        vorpal
        .delimiter('Enter utterance:'.bgCyan.black)
        .show();
    }
}

var executeLambda = function(event, lambdaPath, cb) {
    lambdaLocal.execute({
        event: event,
        lambdaPath: lambdaPath, //process.argv[2],
        lambdaHandler: 'handler',
        timeoutMs: 3000,
        mute: true,
        environment: {
            'DEBUG': (process.env.DEBUG) ? process.env.DEBUG : 'skill'
        },
        callback: function(error, data) {
            cb(error, data);
        }
    });
}

var parseSpeech = function(speech, interactionModelPath, skill, cb) {
    if(!interactionModel || !interactionModel.InteractionModel) {
        console.log('no interaction model');
        cb();
    }

    interactionModel.InteractionModel.fromFiles(
        interactionModelPath,
        null, 
        function(model, err) {
            if(err){
                console.log(err);
                cb();
                return;
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
                    console.log('Utterance not supported'.bgRed);
                    cb();
                    return;
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

            fileUtil.FileUtil.readFile(__dirname + '/server/requestBase.json', (data) => {
                if(data === null) { 
                    console.log(JSON.stringify({response: 'error'}));
                    cb();
                    return;
                }

                var event = JSON.parse(data.toString()).intent;

                //event.session = requestSession;
                event.request.intent = intentModel;
                event.request.timestamp = new Date().toISOString();

                executeLambda(event, skill, function(err, res){
                    console.log(err);
                    console.log('YAY! Here\'s the response'.bgGreen.black);
                    console.log(res);
                    cb();
                });
            });
    });
}
const colors = require('colors');
const va = require("./lib/src/Index");
const vorpal = require('vorpal')();

var _consoleLog = console.log;
var DEBUG = console.log;
console.log = function() {};

var alexa = null;

module.exports = { 
    start: function(skill, skillName, interactionModelPath, verbose) {

        alexa = createVirtualAlexa(interactionModelPath, skill, verbose);

        alexa.verboseMode(verbose);

        vorpal
            .command('start', 'Invokes the LaunchRequest')
            .action(function (args, cb) {
                alexa.launch()
                    .then((payload) => success(verbose, payload))
                    .catch(error)
                    .then(() => {
                        cb();
                    });
            })

        vorpal
            .command('stop', 'Invokes an AMAZON.StopIntent')
            .action(function (args, cb){
                say('AMAZON.StopIntent', cb);
            });

        vorpal
            .command('cancel', 'Invokes an AMAZON.CancelIntent')
            .action(function (args, cb) {
                say('AMAZON.CancelIntent', cb);
            });

        vorpal
            .command('start over', 'Invokes an AMAZON.StartOverIntent')
            .action(function(args, cb){
                say('AMAZON.StartOverIntent', cb);
            });

        vorpal
            .command('repeat', 'Invokes an AMAZON.RepeatIntent')
            .action(function(args, cb){
                say('AMAZON.RepeatIntent', cb);
            });

        vorpal
            .command('next', 'Invokes an AMAZON.NextIntent')
            .action(function(args, cb) {
                say('AMAZON.NextIntent', cb);
            });
            
        vorpal
            .command('previous', 'Invokes an AMAZON.PreviousIntent')
            .action(function(args, cb) {
                say('AMAZON.PreviousIntent', cb);
            });

        vorpal
            .command('say <words...>', 'Invokes the Intent matching the supplied utterance')
            .action(function (args, cb) {
                say(args.words.join(' '), cb);
            });

        vorpal
            .command('token <token>', 'Sets the Access Token with the supplied value')
            .action(function(args, cb) {
                alexa.context().setAccessToken(args.token);
                DEBUG('Access Token set to: ' + args.token + ''.grey);
                cb();
            })

        DEBUG('Skill: ' + skillName);

        vorpal
            .delimiter('Enter utterance'.bgCyan.black)
            .show();
        
        var say = function(utterance, cb) {
            alexa.utter(utterance)
                .then((payload) => success(verbose, payload))
                .catch(error)
                .then(() => {
                    cb();
                });
        }
    }
}

var success = function(verbose, payload) {
    if(verbose) {
        DEBUG(JSON.stringify(payload, null, 4));
    }

    DEBUG(payload.response.outputSpeech.ssml.green);

    return new Promise(function (fulfill, reject) {
        fulfill(payload);
    });
}

var error = function(error) {
    DEBUG('BOOO! There was a problem:'.bgRed.white);
    DEBUG(error);
}

var createVirtualAlexa = function(interactionModelPath, skill) {
    return va.VirtualAlexa.Builder()
        .handler(skill.replace('.js', '.handler')) // Lambda function file and name
        .interactionModelFile(interactionModelPath)
        .applicationID('amzn1.ask.skill.9a451d2a-4788-482c-ad08-b7af959061b4')
        .create();
}
const colors = require('colors');
const va = require("virtual-alexa");
const vorpal = require('vorpal')();

var _consoleLog = console.log;
var DEBUG = console.log;
console.log = function() {};

module.exports = { 
    start: function(skill, skillName, interactionModelPath) {
        
        const alexa = va.VirtualAlexa.Builder()
            .handler(skill.replace('.js', '.handler')) // Lambda function file and name
            .interactionModelFile(interactionModelPath)
            .applicationID('amzn1.ask.skill.9a451d2a-4788-482c-ad08-b7af959061b4')
            .create();
            
        vorpal
            .command('start', 'Invokes the LaunchRequest')
            .action(function (args, cb) {
                alexa.launch()
                    .then(success)
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
            .action(function (args, cb){
                say('AMAZON.CancelIntent', cb);
            });

        vorpal
            .command('say <words...>', 'Invokes the Intent matching the supplied utterance')
            .action(function (args, cb) {
                say(args.words.join(' '), cb);
            });

        DEBUG('Skill: ' + skillName);

        vorpal
            .delimiter('Enter utterance (or ask for \'help\')'.bgCyan.black)
            .show();
        
        var say = function(utterance, cb) {
            alexa.utter(utterance)
                .then(success)
                .catch(error)
                .then(() => {
                    cb();
                });
        }
    }
}

var success = function(payload) {
    DEBUG('YAY! Here\'s the response'.bgGreen.black);
    DEBUG(payload.response.outputSpeech.ssml);
}

var error = function(error) {
    DEBUG('BOOO! There was a problem:'.bgRed.black);
    DEBUG(error);
}
const colors = require('colors');
const va = require('virtual-alexa');
const vorpal = require('vorpal')();
const Spinner = require('cli-spinner').Spinner;

var spinner = new Spinner('%s');
spinner.setSpinnerString(7);

var _consoleLog = console.log;
var DEBUG = console.log;

var alexa = null;

module.exports = { 
    start: function(skill, skillName, interactionModelPath, verbose) {

        alexa = createVirtualAlexa(interactionModelPath, skill);

        vorpal
            .command('start', 'Invokes the LaunchRequest')
            .action(function (args, cb) {
                spinner.start();

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
                intend('AMAZON.StopIntent', cb);
            });

        vorpal
            .command('cancel', 'Invokes an AMAZON.CancelIntent')
            .action(function (args, cb) {
                intend('AMAZON.CancelIntent', cb);
            });

        vorpal
            .command('start again', 'Invokes an AMAZON.StartOverIntent')
            .action(function(args, cb){
                intend('AMAZON.StartOverIntent', cb);
            });

        vorpal
            .command('repeat', 'Invokes an AMAZON.RepeatIntent')
            .action(function(args, cb){
                intend('AMAZON.RepeatIntent', cb);
            });

        vorpal
            .command('next', 'Invokes an AMAZON.NextIntent')
            .action(function(args, cb) {
                intend('AMAZON.NextIntent', cb);
            });
            
        vorpal
            .command('previous', 'Invokes an AMAZON.PreviousIntent')
            .action(function(args, cb) {
                intend('AMAZON.PreviousIntent', cb);
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
            });

        vorpal
            .command('appid <id>', 'Sets the application ID for requests')
            .action(function(args, cb) {
                alexa = createVirtualAlexa(interactionModelPath, skill, args.id);
                DEBUG('Application ID set to: ' + args.id + ''.grey);
                cb();
            });

        DEBUG('Skill: ' + skillName);

        vorpal
            .delimiter('Enter utterance'.bgCyan.black)
            .show();

        var intend = function(utterance, cb) {
                spinner.start();
                
                alexa.intend(utterance)
                    .then((payload) => success(verbose, payload))
                    .catch(error)
                    .then(() => {
                        cb();
                    });
            }
        
        var say = function(utterance, cb) {
            spinner.start();
            
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
    spinner.stop(true);

    if(verbose) {
        DEBUG(JSON.stringify(payload, null, 4));
    }

    DEBUG(payload.response.outputSpeech.ssml.green);

    return new Promise(function (fulfill, reject) {
        fulfill(payload);
    });
}

var error = function(error) {
    spinner.stop(true);

    DEBUG('BOOO! There was a problem:'.bgRed.white);
    DEBUG(error);
}

var createVirtualAlexa = function(interactionModelPath, skill, applicationId) {
    return va.VirtualAlexa.Builder()
        .handler(skill.replace('.js', '.handler')) // Lambda function file and name
        .interactionModelFile(interactionModelPath)
        .applicationID(applicationId ? applicationId : 'amzn1.ask.skill.9a451d2a-4788-482c-ad08-b7af959061b4')
        .create();
}
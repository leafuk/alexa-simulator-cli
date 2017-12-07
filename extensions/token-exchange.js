//const vorpal = require('vorpal');
module.exports = { 
    'start': function(vorpal, alexa, spinner) {
        vorpal
            .command('ext', 'Invokes the LaunchRequest')
            .action(function (args, cb) {
                spinner.start();

                alexa.launch()
                    .then((payload) => {
                        spinner.stop();
                        console.log(payload.response.outputSpeech.ssml);
                    })
                    .catch((error => console.log(error)))
                    .then(() => {
                        spinner.stop();
                        cb();
                    });
            })
    }
}    
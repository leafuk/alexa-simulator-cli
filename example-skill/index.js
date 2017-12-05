var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);

    if ('undefined' === typeof process.env.DEBUG) {
        alexa.appId = 'ABCD';
    }

    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        setTimeout(()=> this.emit('HelloWorldIntent'), 1000);
    },

    'HelloWorldIntent': function () {
        this.emit(':ask', 'Hello World!!!!', 'Hello?');
    },

    'AMAZON.CancelIntent': function() {
        this.emit(':tell', 'Cancelled.');
    },

    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'Stopped.');
    },

    'PersonBirthdayIntent': function() {
        var person = this.event.request.intent.slots.person.value;
        this.emit(':tell', person + '\'s birthday is in 2 days.');
    },

    'Unhandled': function() {
        this.emit(':tell', 'Unhandled.');
    }
 };
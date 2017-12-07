var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);

    if ('undefined' === typeof process.env.DEBUG) {
        alexa.appId = 'ABCD';
    }

    alexa.registerHandlers(handlers);
    setTimeout(()=> alexa.execute(), 1000);
};

var handlers = {
    'LaunchRequest': function () {
        // simulate some latency to allow the spinner to show
        setTimeout(()=> this.emit('HelloWorldIntent'), 1000);
    },

    'HelloWorldIntent': function () {
        this.emit(':ask', 'Hello World!!!!', 'Hello?');
    },

    'AMAZON.CancelIntent': function() {
        this.emit(':tell', 'Cancelled.');
    },
    
    'AMAZON.StartOverIntent': function() {
        this.emit(':ask', 'Starting again.', 'How can I help?');
    },
    
    'AMAZON.RepeatIntent': function() {
        this.emit(':ask', 'I\'m repeating myself.', 'How can I help?');
    },
    
    'AMAZON.NextIntent': function() {
        this.emit(':tell', 'Skipping to next item.');
    },
    
    'AMAZON.PreviousIntent': function() {
        this.emit(':tell', 'Skipping to previous item.');
    },
    
    'AMAZON.YesIntent': function() {
        this.emit(':tell', 'You said yes.');
    },
    
    'AMAZON.NoIntent': function() {
        this.emit(':tell', 'You said no.');
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
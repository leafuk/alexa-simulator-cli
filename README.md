# alexa-sim
A command line interface for simulating Alexa calls against node-based Lambda skills

## Installation
### Clone the repo

```
git clone https://github.com/leafuk/alexa-simulator-cli.git
```

### Install globally
```
cd alexa-simulator-cli

npm install -g
```

#### To allow local changes to be used globally (if you want to further develop the sim)
```
npm link
```

## To run for a specific skill
```
cd /path-to-skill

alexa-sim
```

Ensure that your skill package.json has a "main" property set to the entry point of your lambda.
```
{
    "main": "src/index.js"
}
```

Your skill will need to have a local copy of the interaction model to allow the sim to parse your commands into intents. The sim will look for this at the root of your skill by default (`/path-to-skill/interactionModel.js`).

If the interactionModel is not located at the root, you can specify the path and filename by including the `-i` flag (interactionModel)
```
alexa-sim -i speechAssets/interactionModel.json
```

### Specifying a path for the skill
You can also run the sim from location, and specify the path to your skill explicitly using the '-p' flag (path)
```
alexa-sim -p /projects/skill-proj
```

#### Verbose mode
For more detailed info, include the verbose flag (`-v`)
```
alexa-sim -v
```

#### Debug mode
You can set "debug" environment variable to a value of "DEBUG" by including the '-d' flag (debug)
```
alexa-sim -d
```

# Using the simulator
This tool is intended to simulate the calls made by the Alexa Voice Service, by building JSON requests based on the commands you give. 

It utilises the interaction model for your skill so it can convert sentences into intents.

Let's say that you're developing a skill that can manage the birthdays of people you know.  You have an intent called "PersonsBirthdayIntent" which contains a slot value for the person that is being enquired about. You can type in the command that you expect your user to say (such as "when is Jenny's birthday"), and the simulator will build an intent request based on your interaction model by setting the intent name to "PersonsBirthdayIntent" and setting the "person" slot value to "Jenny".

## Commands
`start`

This will create and trigger a launch request for your skill.


`say ...`

The say command is the one which takes whatever you type after the word "say" and converts it into an intent.

For example, you can type `say when is tom's birthday`, and the simulate will build the appropriate intent request and call your lambda function.


`stop`

Creates an intent request for "AMAZON.StopIntent". You can also use `say stop`


`token ...`

Set the access token to the supplied value for any subsequent requests. This allows you to call your skill while supplying a real access token. `token 1bNDh273r.hdbdt7wj2jb.293...` (shortened for brevity).


`appid ...`

Set the application ID to the supplied value. If you have application ID checks in your skill, you can supply a valid ID by calling this command. `appid amzn1.ask.skill.9a451d2a-4788-482c-ad08-b7af959061b4`.
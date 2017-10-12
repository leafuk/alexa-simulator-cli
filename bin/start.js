#!/usr/bin/env node

'use strict';

var ArgumentParser = require('argparse').ArgumentParser;
var nodemon = require('nodemon');
var path = require('path');
var fs = require('fs');
var parser = new ArgumentParser();
var colors = require('colors');
var spawn = require("child_process").spawn

parser.addArgument(
  [ '-p', '--path' ],
  {
    help: 'Path to Alexa skill'
  }
);

var args = parser.parseArgs();

var path = args.path ? args.path : process.cwd();

try {
  var skillPackageConf = require(path + '/package.json');
} catch (err) {
  console.error('Package.json not found.'.red);
  process.exit(1);
}

if (!skillPackageConf.main) {
  console.error('Main script file not found.'.red);
  process.exit(1);
}

var mainScriptFile = skillPackageConf.main;

try {
    var interactionModel = require(path + '/interactionModel.json');
} catch (err) {
    console.log('Interaction Model not found.'.red);
    console.log('Please ensure an Interaction Model is saved at the root of your app, with a name of "interactionModel.json".'.bgRed);
    process.exit(1);
}

try {
  var mainScript = require(path + '/' + mainScriptFile);
} catch (error) {
  console.error('Problem with main script file.'.red);
  console.log(error);
  process.exit(1);
}

var server = require(__dirname + '/../server.js');

server.start(path  + '/' + mainScriptFile, skillPackageConf.name, path + '/interactionModel.json')

// nodemon({
//   nodeArgs: (process.env.REMOTE_DEBUG) ? ['--debug'] : [],
//   script: __dirname + '/../server.js',
//   args: [path  + '/' + mainScriptFile, skillPackageConf.name, path + '/interactionModel.json'],
//   env: {
//     'DEBUG': (process.env.DEBUG) ? process.env.DEBUG : 'skill'
//   }
// });

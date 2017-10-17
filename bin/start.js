#!/usr/bin/env node

'use strict';

var ArgumentParser = require('argparse').ArgumentParser;
var colors = require('colors');
var relative = require('relative');

//var path = require('path');
var fs = require('fs');

var parser = new ArgumentParser();

parser.addArgument(
  [ '-p', '--path' ],
  {
    help: 'Path to Alexa skill'
  }
);

parser.addArgument(
  [ '-v' ],
  {
    action: 'storeTrue',
    dest:   'verbose',
    help:   'verbose mode'
  }
);

var args = parser.parseArgs();

var path = args.path ? args.path : process.cwd();

var verbose = args.verbose ? true : false;

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

var relativePathToSkill = relative(process.cwd(), path  + '/' + mainScriptFile);

server.start(relativePathToSkill, skillPackageConf.name, path + '/interactionModel.json', verbose);
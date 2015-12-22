#!/usr/bin/env node

/**
 * test -- Initiates the testing cycle and sets `./test/src` as the files to execute. Istanbul is used for code
 * coverage and tests are run with Mocha and results are uploaded to Codecov.io
 */

var sh = require('./sh');

var mochaOption = " ./test/src/*.js";

if (process.env.TRAVIS)
{
   // Presently Istanbul doesn't support JSPM tests.
   //sh.exec('babel-node ./node_modules/.bin/istanbul cover _mocha --report lcovonly -- --bail ' + mochaOption
   // + ' && cat ./coverage/lcov.info | ./node_modules/codecov.io/bin/codecov.io.js');

   sh.exec('babel-node ./node_modules/.bin/istanbul cover _mocha --report lcovonly -- --bail ' + mochaOption);
}
else if(process.argv.indexOf('--coverage') !== -1)
{
   sh.exec('babel-node ./node_modules/.bin/istanbul cover _mocha --report lcovonly -- --bail ' + mochaOption);
}
else
{
   sh.exec('babel-node ./node_modules/.bin/mocha --compilers js:babel-core/register -- ' + mochaOption);
}
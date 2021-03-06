![typhonjs-core-backbone-events](http://i.imgur.com/kPGtJnx.png)

[![Backbone](https://img.shields.io/badge/backbone-1.2.3-yellowgreen.svg?style=flat)](https://github.com/jashkenas/backbone)
[![Documentation](http://js.docs.typhonrt.org/typhonjs/typhonjs-core-backbone-events/badge.svg)](http://js.docs.typhonrt.org/typhonjs/typhonjs-core-backbone-events/)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-backbone/typhonjs-core-backbone-events/blob/master/LICENSE)
[![Gitter](https://img.shields.io/gitter/room/typhonjs/TyphonJS.svg)](https://gitter.im/typhonjs/TyphonJS)

[![Build Status](https://travis-ci.org/typhonjs-backbone/typhonjs-core-backbone-events.svg)](https://travis-ci.org/typhonjs-backbone/typhonjs-core-backbone-events)
[![Coverage](https://img.shields.io/codecov/c/github/typhonjs-backbone/typhonjs-core-backbone-events.svg)](https://codecov.io/github/typhonjs-backbone/typhonjs-core-backbone-events)
[![Dependency Status](https://www.versioneye.com/user/projects/56e8e67d4e714c0034fed4f2/badge.svg?style=flat)](https://www.versioneye.com/user/projects/56e8e67d4e714c0034fed4f2)

Separates 'Events' support from [backbone-es6](https://github.com/typhonjs-backbone/backbone-es6) in addition to adding TyphonJS extensions found in [TyphonEvents](https://github.com/typhonjs-backbone/typhonjs-core-backbone-events/blob/master/src/TyphonEvents.js). The events dispatch functionality is useful well outside the context of Backbone and is utilized across several TyphonJS repos.

TyphonEvents adds new functionality for triggering events. The following are new trigger mechanisms:

- `triggerDefer` - Defers invoking `trigger`.
- `triggerFirst` - Only invokes the first target matched and passes back any result to the callee.
- `triggerResults` - Invokes all targets matched and passes back an array of results in an array to the callee.
- `triggerThen` - Invokes all targets matched and adds any returned results through `Promise.all` which returns
a single promise to the callee.

[mainEventbus.js](https://github.com/typhonjs-backbone/typhonjs-core-backbone-events/blob/master/src/mainEventbus.js) provides a standardized instance of TyphonEvents which serves as the name implies a main eventbus. In several TyphonJS repos it is mapped via JSPM to 'mainEventbus' such that one can import it via `import eventbus from 'mainEventbus';`

A [typhonjs-core-logging](https://github.com/typhonjs-common/typhonjs-core-logging) enabled version of TyphonEvents is available in the [typhonjs-core-backbone-events-logged](https://github.com/typhonjs-common/typhonjs-core-backbone-events-logged) repo.

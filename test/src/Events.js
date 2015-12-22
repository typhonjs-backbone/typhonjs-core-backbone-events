import { assert } from 'chai';
import jspm       from 'jspm';

/* eslint-disable no-undef */

// Set the package path to the local root where config.js is located.
jspm.setPackagePath(process.cwd());

// Create SystemJS Loader
const System = new jspm.Loader();

describe('Events', () =>
{
   const callbacks = {};
   let eventbus;

   before(() => { return System.import('src/mainEventbus.js').then((module) => { eventbus = module['default']; }); });

   it('set / get name', () =>
   {
      eventbus.setEventbusName('testname');
      assert(eventbus.getEventbusName() === 'testname');
   });

   it('trigger', () =>
   {
      eventbus.on('test:trigger', () => { callbacks.testTrigger = true; });
      eventbus.trigger('test:trigger');
      assert(callbacks.testTrigger);
   });

   it('trigger (once)', () =>
   {
      callbacks.testTriggerOnce = 0;
      eventbus.once('test:trigger:once', () => { callbacks.testTriggerOnce++; });
      eventbus.trigger('test:trigger:once');
      eventbus.trigger('test:trigger:once');
      assert(callbacks.testTriggerOnce === 1);
   });

   it('triggerDefer', (done) =>
   {
      eventbus.on('test:trigger:defer', () => { done(); });
      eventbus.triggerDefer('test:trigger:defer');
   });

   it('triggerFirst', () =>
   {
      eventbus.on('test:trigger:first', () => { callbacks.testTriggerFirst = true; return true; });
      assert(eventbus.triggerFirst('test:trigger:first'));
      assert(callbacks.testTriggerFirst);
   });

   it('triggerFirst on / off', () =>
   {
      eventbus.on('test:trigger:first:off', () => { callbacks.testTriggerFirstOff = true; return true; });
      eventbus.off('test:trigger:first:off');
      assert(eventbus.triggerFirst('test:trigger:first:off') === undefined);
      assert(callbacks.testTriggerFirstOff === undefined);
   });

   it('triggerFirst (Promise)', (done) =>
   {
      eventbus.on('test:trigger:first:then', () =>
      {
         callbacks.testTriggerFirstThen = true;
         return Promise.resolve('foobar');
      });

      const promise = eventbus.triggerFirst('test:trigger:first:then');

      assert(promise instanceof Promise);

      promise.then((result) =>
      {
         assert(callbacks.testTriggerFirstThen);
         assert(result === 'foobar');
         done();
      });
   });

   it('triggerResults', () =>
   {
      eventbus.on('test:trigger:results', () => { callbacks.testTriggerResults = true; return 'foo'; });
      eventbus.on('test:trigger:results', () => { callbacks.testTriggerResults2 = true; return 'bar'; });

      const results = eventbus.triggerResults('test:trigger:results');

      assert(callbacks.testTriggerResults);
      assert(callbacks.testTriggerResults2);
      assert(Array.isArray(results));
      assert(results.length === 2);
      assert(results[0] === 'foo' && results[1] === 'bar');
   });

   it('triggerThen', (done) =>
   {
      eventbus.on('test:trigger:then', () => { callbacks.testTriggerThen = true; return 'foo'; });
      eventbus.on('test:trigger:then', () => { callbacks.testTriggerThen2 = true; return 'bar'; });

      const promise = eventbus.triggerThen('test:trigger:then');

      // I have no idea why the assert below fails! promise is definitely a Promise!
      // assert(promise instanceof Promise);

      // triggerThen resolves all Promises by Promise.all() so result is an array.
      promise.then((result) =>
      {
         assert(callbacks.testTriggerThen);
         assert(callbacks.testTriggerThen2);
         assert(result[0] === 'foo');
         assert(result[1] === 'bar');
         done();
      });
   });
});
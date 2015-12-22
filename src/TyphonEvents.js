'use strict';

import _       from 'underscore';
import Events  from './Events.js';

/**
 * TyphonEvents adds new functionality for trigger events. The following are new trigger mechanisms:
 *
 * Please refer to the Events documentation for all inherited functionality.
 *
 * `triggerDefer` - Defers invoking `trigger`.
 *
 * `triggerFirst` - Only invokes the first target matched and passes back any result to the callee.
 *
 * `triggerResults` - Invokes all targets matched and passes back an array of results in an array to the callee.
 *
 * `triggerThen` - Invokes all targets matched and adds any returned results through `Promise.all` which returns
 *  a single promise to the callee.
 */
export default class TyphonEvents extends Events
{
   /**
    * Returns the current eventbusName.
    *
    * @returns {string|*}
    */
   getEventbusName()
   {
      return this._eventbusName;
   }

   /**
    * Sets the eventbus name.
    *
    * @param {string}   name - The name for this eventbus.
    */
   setEventbusName(name)
   {
      this._eventbusName = name;
   }

   /**
    * Defers invoking `trigger`.
    *
    * @returns {TyphonEvents}
    */
   triggerDefer()
   {
      setTimeout(() => { super.trigger(...arguments); }, 0);

      return this;
   }

   /**
    * Provides `trigger` functionality that only invokes the first target matched and passes back any result to
    * the callee.
    *
    * @param {string}   name  - Event name(s)
    * @returns {*}
    */
   triggerFirst(name)
   {
      if (!this._events) { return null; }

      const length = Math.max(0, arguments.length - 1);
      const args = new Array(length);
      for (let i = 0; i < length; i++) { args[i] = arguments[i + 1]; }

      return s_EVENTS_API(s_TRIGGER_API, s_TRIGGER_FIRST_EVENTS, this._events, name, void 0, args);
   }

   /**
    * Provides `trigger` functionality, but collects any returned results from invoked targets in an array and passes
    * back this array to the callee.
    *
    * @param {string}   name  - Event name(s)
    * @returns {Array<*>}
    */
   triggerResults(name)
   {
      if (!this._events) { return []; }

      const length = Math.max(0, arguments.length - 1);
      const args = new Array(length);
      for (let i = 0; i < length; i++) { args[i] = arguments[i + 1]; }

      return s_EVENTS_API(s_TRIGGER_API, s_TRIGGER_RESULTS_EVENTS, this._events, name, void 0, args);
   }

   /**
    * Provides `trigger` functionality, but collects any returned Promises from invoked targets and returns a
    * single Promise generated by `Promise.all`. This is a very useful mechanism to invoke asynchronous operations
    * over an eventbus.
    *
    * @param {string}   name  - Event name(s)
    * @returns {Promise}
    */
   triggerThen(name)
   {
      if (!this._events) { Promise.all([]); }

      const length = Math.max(0, arguments.length - 1);
      const args = new Array(length);
      for (let i = 0; i < length; i++) { args[i] = arguments[i + 1]; }

      return s_EVENTS_API(s_TRIGGER_API, s_TRIGGER_THEN_EVENTS, this._events, name, void 0, args);
   }
}

// Private / internal methods ---------------------------------------------------------------------------------------

/**
 * Regular expression used to split event strings.
 * @type {RegExp}
 */
const s_EVENT_SPLITTER = /\s+/;

/**
 * Iterates over the standard `event, callback` (as well as the fancy multiple space-separated events `"change blur",
 * callback` and jQuery-style event maps `{event: callback}`).
 *
 * @param {function} iteratee       - Trigger API
 * @param {function} iterateeTarget - Internal function which is dispatched to.
 * @param {Array<*>} events         - Array of stored event callback data.
 * @param {string}   name           - Event name(s)
 * @param {function} callback       - callback
 * @param {Object}   opts           - Optional parameters
 * @returns {*}
 */
const s_EVENTS_API = (iteratee, iterateeTarget, events, name, callback, opts) =>
{
   let i = 0, names;

   if (name && typeof name === 'object')
   {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) { opts.context = callback; }
      for (names = _.keys(name); i < names.length; i++)
      {
         events = s_EVENTS_API(iteratee, iterateeTarget, events, names[i], name[names[i]], opts);
      }
   }
   else if (name && s_EVENT_SPLITTER.test(name))
   {
      // Handle space separated event names by delegating them individually.
      for (names = name.split(s_EVENT_SPLITTER); i < names.length; i++)
      {
         events = iteratee(iterateeTarget, events, names[i], callback, opts);
      }
   }
   else
   {
      // Finally, standard events.
      events = iteratee(iterateeTarget, events, name, callback, opts);
   }

   return events;
};

/**
 * Handles triggering the appropriate event callbacks.
 *
 * @param {function} iterateeTarget - Internal function which is dispatched to.
 * @param {Array<*>} objEvents      - Array of stored event callback data.
 * @param {string}   name           - Event name(s)
 * @param {function} cb             - callback
 * @param {Array<*>} args           - Arguments supplied to a trigger method.
 * @returns {*}
 */
const s_TRIGGER_API = (iterateeTarget, objEvents, name, cb, args) =>
{
   let result;

   if (objEvents)
   {
      const events = objEvents[name];
      let allEvents = objEvents.all;
      if (events && allEvents) { allEvents = allEvents.slice(); }
      if (events) { result = iterateeTarget(events, args); }
      if (allEvents) { result = iterateeTarget(allEvents, [name].concat(args)); }
   }

   return result;
};

/**
 * A difficult-to-believe, but optimized internal dispatch function for triggering events. Tries to keep the usual
 * cases speedy (most internal Backbone events have 3 arguments). This method stop event propagation after the first
 * target is invoked. It also passes back a return value from the target.
 *
 * @param {Array<*>} events   -  Array of stored event callback data.
 * @param {Array<*>} args     -  Arguments supplied to `triggerFirst`.
 * @returns {*}
 */
const s_TRIGGER_FIRST_EVENTS = (events, args) =>
{
   let ev, i = -1;
   const a1 = args[0], a2 = args[1], a3 = args[2], l = events.length;

   let result;

   switch (args.length)
   {
      case 0:
         while (++i < l)
         {
            result = (ev = events[i]).callback.call(ev.ctx);

            // If we received a valid result return immediately.
            if (!_.isUndefined(result))
            {
               return result;
            }
         }
         return;
      case 1:
         while (++i < l)
         {
            result = (ev = events[i]).callback.call(ev.ctx, a1);

            // If we received a valid result return immediately.
            if (!_.isUndefined(result))
            {
               return result;
            }
         }
         return;
      case 2:
         while (++i < l)
         {
            result = (ev = events[i]).callback.call(ev.ctx, a1, a2);

            // If we received a valid result return immediately.
            if (!_.isUndefined(result))
            {
               return result;
            }
         }
         return;
      case 3:
         while (++i < l)
         {
            result = (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);

            // If we received a valid result return immediately.
            if (!_.isUndefined(result))
            {
               return result;
            }
         }
         return;
      default:
         while (++i < l)
         {
            result = (ev = events[i]).callback.apply(ev.ctx, args);

            // If we received a valid result return immediately.
            if (!_.isUndefined(result))
            {
               return result;
            }
         }
         return;
   }
};

/**
 * A difficult-to-believe, but optimized internal dispatch function for triggering events. Tries to keep the usual
 * cases speedy (most internal Backbone events have 3 arguments). This dispatch method passes back an array with
 * all results returned by any invoked targets.
 *
 * @param {Array<*>} events   -  Array of stored event callback data.
 * @param {Array<*>} args     -  Arguments supplied to `triggerResults`.
 * @returns {Array<*>}
 */
const s_TRIGGER_RESULTS_EVENTS = (events, args) =>
{
   let ev, i = -1;
   const a1 = args[0], a2 = args[1], a3 = args[2], l = events.length;

   let result;
   const results = [];

   switch (args.length)
   {
      case 0:
         while (++i < l)
         {
            result = (ev = events[i]).callback.call(ev.ctx);

            // If we received a valid result return immediately.
            if (!_.isUndefined(result))
            {
               results.push(result);
            }
         }
         return results;
      case 1:
         while (++i < l)
         {
            result = (ev = events[i]).callback.call(ev.ctx, a1);

            // If we received a valid result return immediately.
            if (!_.isUndefined(result))
            {
               results.push(result);
            }
         }
         return results;
      case 2:
         while (++i < l)
         {
            result = (ev = events[i]).callback.call(ev.ctx, a1, a2);

            // If we received a valid result return immediately.
            if (!_.isUndefined(result))
            {
               results.push(result);
            }
         }
         return results;
      case 3:
         while (++i < l)
         {
            result = (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);

            // If we received a valid result return immediately.
            if (!_.isUndefined(result))
            {
               results.push(result);
            }
         }
         return results;
      default:
         while (++i < l)
         {
            result = (ev = events[i]).callback.apply(ev.ctx, args);

            // If we received a valid result return immediately.
            if (!_.isUndefined(result))
            {
               results.push(result);
            }
         }
         return results;
   }
};

/**
 * A difficult-to-believe, but optimized internal dispatch function for triggering events. Tries to keep the usual
 * cases speedy (most internal Backbone events have 3 arguments). This dispatch method uses ES6 Promises and adds
 * any returned results to an array which is added to a Promise.all construction which passes back a Promise which
 * waits until all Promises complete. Any target invoked may return a Promise or any result. This is very useful to
 * use for any asynchronous operations.
 *
 * @param {Array<*>} events   -  Array of stored event callback data.
 * @param {Array<*>} args     -  Arguments supplied to `triggerThen`.
 * @returns {Promise}
 */
const s_TRIGGER_THEN_EVENTS = (events, args) =>
{
   let ev, i = -1;
   const a1 = args[0], a2 = args[1], a3 = args[2], l = events.length;

   let result;
   const results = [];

   try
   {
      switch (args.length)
      {
         case 0:
            while (++i < l)
            {
               result = (ev = events[i]).callback.call(ev.ctx);

               // If we received a valid result add it to the promises array.
               if (!_.isUndefined(result))
               {
                  results.push(result);
               }
            }
            break;

         case 1:
            while (++i < l)
            {
               result = (ev = events[i]).callback.call(ev.ctx, a1);

               // If we received a valid result add it to the promises array.
               if (!_.isUndefined(result))
               {
                  results.push(result);
               }
            }
            break;

         case 2:
            while (++i < l)
            {
               result = (ev = events[i]).callback.call(ev.ctx, a1, a2);

               // If we received a valid result add it to the promises array.
               if (!_.isUndefined(result))
               {
                  results.push(result);
               }
            }
            break;

         case 3:
            while (++i < l)
            {
               result = (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);

               // If we received a valid result add it to the promises array.
               if (!_.isUndefined(result))
               {
                  results.push(result);
               }
            }
            break;

         default:
            while (++i < l)
            {
               result = (ev = events[i]).callback.apply(ev.ctx, args);

               // If we received a valid result add it to the promises array.
               if (!_.isUndefined(result))
               {
                  results.push(result);
               }
            }
            break;
      }
   }
   catch(error)
   {
      return Promise.reject(error);
   }

   return Promise.all(results);
};
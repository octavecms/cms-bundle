/*
 * Run CSS transitions on elements
 */

import $ from 'common/jquery';
import 'util/animation/jquery.transitionend';
import map from 'lodash/map';
import filter from 'lodash/filter';

const OUT_ANIMATION_SUFFIXES = ['-out', '-disappear'];
const REGEX_IS_OUT_ANIMATION = new RegExp(`(${ OUT_ANIMATION_SUFFIXES.join('|') })`);

let stopSchedule = null;


function each (arr, fn) {
	for (let i = 0, ii = arr.length; i < ii; i++) fn(arr[i]);
}

function transitionCall (callbacks, $element, index, callback) {
    const callbacksCloned = [].concat(callbacks);

	while (callbacksCloned && callbacksCloned.length) {
		let fn = callbacksCloned.shift();
		let response = fn($element, index);

		if (response && response.then) {
			response.then(transitionCall.bind(this, callbacksCloned, $element, index, callback));

			// Encountered a promise, stop futher execution until promise is resolved
			return;
		}
	}

	callback();
}

function transition (options, element, index) {
	const $element = $(element);
	const promise  = $.Deferred();

	transitionCall(options.before, $element, index, () => {

		if (options.transition.length) {
			requestAnimationFrame(() => {

				// Delay before transition, there always should be at least some
				// delay for CSS animations to be animated properly
				setTimeout(() => {
					transitionCall(options.transition, $element, index, () => {
						// Wait till transition ends
						$element.transitionend().done(() => {
							transitionCall(options.after, $element, index, () => {
								promise.resolve();
							});
						});
					});
				}, options.delay);

			});
		} else {
			promise.resolve();
		}

	});

	return promise.promise();
}


$.fn.transition = function () {
	// Arguments are options or sequence names
	const args = [...arguments];

	// Last argument can be a callback function
	const lastarg  = args[args.length - 1];
	const callback = typeof lastarg === 'function' ? lastarg : null;

	let options = {
		before: [],
		transition: [],
		after: [],
		delay: 16
	};

	// Marge all transitions into single options arrays
	for (let i = 0, ii = args.length; i < ii; i++) {
		let obj = args[i];

		if (typeof obj === 'string') {
            // generate a sequence if it doesn't exist
            if (!(obj in $.transition.sequences)) {
                $.transition.sequences[obj] = $.transition.generateSequence(obj);
            }

			// string -> object
            obj = $.transition.sequences[obj];
        }

        if ($.isPlainObject(obj)) {
            // obj -> array
            obj = [obj];
        }


        if ($.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                if ($.isPlainObject(obj[i])) {
                    if (obj[i].before)     options.before.push(obj[i].before);
                    if (obj[i].transition) options.transition.push(obj[i].transition);
                    if (obj[i].after)      options.after.push(obj[i].after);
                    if (obj[i].delay)      options.delay = Math.max(options.delay, obj[i].delay);
                }
            }
        }
    }

	// Call callback when transitions for all elements complete
	$.when.apply($, $.map(this, transition.bind(this, options))).done(callback);

	return this;
};


/*
 * Stop transition and trigger callback when done
 */

$.fn.transitionstop = function (callback) {
    // By triggering 'transitionend' event all current animations will
    // enter 'after' phase
    this.trigger('transitionend');

    if (typeof callback === 'function') {
        if (stopSchedule) {
            stopSchedule.push(callback);
        } else {
            stopSchedule = [callback];

            // We batch callbacks because if there is more than 1 then
            // they will be out of sync
            $.when().then(() => {
                let schedule = stopSchedule;
                stopSchedule = null;

                // Small delay to make sure animations are complete and
                // in case transitionend callbacks use promises those promises
                // are actually called before we trigger transitionstop callbacks
                requestAnimationFrame(function () {
                    each(schedule, fn => fn());
                });
            });
        }
    }

    return this;
};


/*
 * Predefined animation sequences
 */

$.transition = {
	sequences: {}
};


/*
 * Predefined animation sequence generation utility functions
 */

$.transition.generateSequenceIn = function (...animations) {
    return map(animations, (name) => {
        if (typeof name === 'string') {
            return {
                'before':     $el => $el.addClass(`animation animation--${ name } animation--${ name }--inactive disable-transitions`).removeClass('is-hidden is-invisible is-invisible--js is-invisible--md-up-js'),
                'transition': $el => $el.removeClass(`animation--${ name }--inactive disable-transitions`).addClass(`animation--${ name }--active`),
                'after':      $el => $el.removeClass(`animation animation--${ name } animation--${ name }--active`),
            };
        } else {
            return name;
        }
    });
};

$.transition.generateSequenceOut = function (...animations) {
    return map(animations, (name) => {
        if (typeof name === 'string') {
            return {
                'before':     $el => $el.addClass(`animation animation--${ name } animation--${ name }--inactive disable-transitions`),
                'transition': $el => $el.removeClass(`animation--${ name }--inactive disable-transitions`).addClass(`animation--${ name }--active`),
                'after':      $el => $el.removeClass(`animation animation--${ name } animation--${ name }--active`).addClass('is-hidden')
            };
        } else {
            return name;
        }
    });
};

$.transition.generateSequence = function (...animations) {
    const animationsIn  = filter(animations, (name) => typeof name === 'string' && !REGEX_IS_OUT_ANIMATION.test(name));
    const animationsOut  = filter(animations, (name) => typeof name === 'string' && REGEX_IS_OUT_ANIMATION.test(name));
    const animationsRaw = filter(animations, (name) => typeof name !== 'string');

    return [].concat(
        $.transition.generateSequenceIn(...animationsIn),
        $.transition.generateSequenceOut(...animationsOut),
        animationsRaw
    );
};

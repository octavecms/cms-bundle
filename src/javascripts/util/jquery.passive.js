/**
 * jQuery plugin to add/remove passive listeners
 *
 * @example
 *     $(window).onpassive('scroll.namespace', function () {});
 *     $(window).offpassive('.namespace', function () {});
 */

import $ from 'common/jquery';
import intersection from 'lodash/intersection';


// From jQuery source
const rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );
const rtypenamespace = /^([^.]*)(?:\.(.+)|)/;


/*
 * Detect browser support for passive events
 */
let supportsPassive = false;
try {
    var opts = Object.defineProperty({}, 'passive', {
        get: function() {
            return supportsPassive = true;
        }
    });
    window.addEventListener('test', null, opts);
} catch (e) {
    //
}


/*
 * Split event name into event types and namespaces
 */
function getBindingInfo (eventName, callback) {
    const types = eventName.match(rnothtmlwhite) || [''];
    const events = [];

    for (let i = 0; i < types.length; i++) {
        const tmp = rtypenamespace.exec(types[i]) || [];

        events.push({
            'type': tmp[1],
            'namespaces': (tmp[ 2 ] || '').split('.').sort(),
            'callback': callback
        });
    }

    return events;
}



function addPassiveEventListener (element, event) {
    const passiveevents = $._data(element, 'passiveevents') || [];
    passiveevents.push(event);
    $._data(element, 'passiveevents', passiveevents);

    element.addEventListener(event.type, event.callback, {
        'passive': true
    });
}



function removePassiveEventListener (element, event) {
    const passiveevents = $._data(element, 'passiveevents') || [];

    for (let i = passiveevents.length - 1; i >= 0; i--) {
        if (event.type && passiveevents[i].type !== event.type) {
            continue;
        }
        if (event.callback && passiveevents[i].callback !== event.callback) {
            continue;
        }

        if (event.namespaces && intersection(event.namespaces, passiveevents[i].namespaces).length !== event.namespaces.length) {
            continue;
        }

        element.removeEventListener(passiveevents[i].type, passiveevents[i].callback, {
            'passive': true
        });

        passiveevents.splice(i, 1);
        $._data(element, 'passiveevents', passiveevents);
    }
}


if (supportsPassive) {
    /**
     * Add passive event listener
     * Supports namespaces and multiple events as eventName argument
     *
     * @param {string} eventName
     * @param {function} callback
     */
    $.fn.onpassive = function (eventName, callback) {
        const events = getBindingInfo(eventName, callback);
        let count = 0;

        for (let i = 0; i < events.length; i++) {
            const event = events[i];

            if (event.type) {
                for (let k = 0; k < this.length; k++) {
                    addPassiveEventListener(this[k], event);
                    count++;
                }
            }
        }

        // When jQuery events are removed also remove
        // custom passive events
        if (count) {
            this.on('destroyed', this.offpassive.bind(this, eventName, callback));
        }

        return this;
    };

    /**
     * Remove passive event listener
     * Supports namespaces and multiple events as eventName argument
     *
     * @param {string} eventName
     * @param {function} ?callback
     */
    $.fn.offpassive = function (eventName, callback) {
        const events = getBindingInfo(eventName, callback);

        for (let i = 0; i < events.length; i++) {
            const event = events[i];

            for (let k = 0; k < this.length; k++) {
                removePassiveEventListener(this[k], event);
            }
        }

        return this;
    };
} else {
    // Fallback to default methods
    $.fn.onpassive = $.fn.on;
    $.fn.offpassive = $.fn.off;
}

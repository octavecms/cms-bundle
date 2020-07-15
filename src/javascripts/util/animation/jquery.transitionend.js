import $ from 'common/jquery';

const REGEX_DURATION = /([\d.]+)(ms|s)/g;
let uniqueId = 0;

function getDuration (duration) {
    let maxDuration = 0;

    if (duration) {
        String(duration).replace(REGEX_DURATION, (_, durationStr, unit) => {
            let durationValue = parseFloat(durationStr) || 0;

            if (unit === 's') {
                durationValue *= 1000;
            }

            maxDuration = Math.max(maxDuration, durationValue);
        });
    }

    return maxDuration;
}

$.fn.transitionduration = function (default_duration) {
    let transition = getDuration($(this).css('transition-duration'));
    if (transition) transition += getDuration($(this).css('transition-delay'));

    let animation = getDuration($(this).css('animation-duration'));
    if (animation) animation += getDuration($(this).css('animation-delay'));

    return Math.max(transition, animation, default_duration || 0, 0);
};

/**
 * Returns promise, which is resolved when all elements have finishsed
 * their transitions and animations
 */
$.fn.transitionend = function () {
    return $.when.apply($, $.map(this, function (element) {
        const $element = $(element);
        const ns = 'ns' + (++uniqueId);
        const event = `webkitTransitionEnd.${ ns } transitionend.${ ns } webkitAnimationEnd.${ ns } animationend.${ ns }`;
        const deferred = $.Deferred();
        const duration = $element.transitionduration();

        const timer = setTimeout(() => {
            $element.off(event);
            deferred.resolve();
        }, duration + 16 /* 1 frame */);

        $element.on(event, function (e) {
            if ($element.is(e.target)) {
                clearTimeout(timer);
                $element.off(event);
                deferred.resolve();
            }
        });

        return deferred.promise();
    }));
};


/**
 * Returns promise, which is resolved when all elements and their children have
 * finishsed their animations
 */
$.fn.animationend = function () {
    return $.when.apply($, $.map(this, function (element) {
        const $element = $(element);
        const uid = ++uniqueId;
        const eventStart = 'webkitAnimationStart.ns' + uid + ' ' + 'animationstart.ns' + uid;
        const eventEnd = 'webkitAnimationEnd.ns' + uid + ' ' + 'animationend.ns' + uid;
        const deferred = $.Deferred();

        let pending = 0;

        $element.on(eventStart, (e) => {
            const $target = $(e.target);

            // Infinite animations won't stop, we are not interested in them
            if ($target.css('animationIterationCount') !== 'infinite') {
                pending++;
            }
        });

        $element.on(eventEnd, function () {
            pending--;

            if (pending <= 0) {
                $element.off(eventStart).off(eventEnd);
                deferred.resolve();
            }
        });

        return deferred.promise();
    }));
};

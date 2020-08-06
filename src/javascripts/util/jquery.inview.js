/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

import each from 'lodash/each';
import 'util/jquery.destroyed';
import detect from 'util/detect';
import namespace from 'util/namespace';


/**
 * Detects when element becomes visible / hidden
 */
export default class InView {

    static get Defaults () {
        return {
            // Callback for when element enters viewport
            'enter': null,
            // Callback for when element leaves viewport
            'leave': null,
            // Destroy listeners after element enters viewport
            'destroyOnEnter': false,
            // Destroy lsteners after element leaves viewport
            'destroyOnLeave': false,
            // IntersectionObserver threshold, % of element which needs to be visible to be
            // considered in viewport
            'threshold': 0,
            // IntersectionObserver margin, distance from element to the viewport
            'distance': 0
        };
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.isIntersecting = false;
        this.ns = namespace();
        this.enter = typeof options.enter === 'function' ? [options.enter] : [];
        this.leave = typeof options.leave === 'function' ? [options.leave] : [];

        $container.on(`destroyed.${ this.ns }`, this.destroy.bind(this));

        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            'rootMargin': typeof options.distance === 'number' ? `${ options.distance }px 0px` : options.distance,
            'threshold': options.threshold
        });

        this.observer.observe($container.get(0));
    }

    setOptions (options) {
        if (options && typeof options.enter === 'function') {
            this.enter.push(options.enter);

            if (this.isIntersecting) {
                options.enter(this.$container);
            }
        }
        if (options && typeof options.leave === 'function') {
            this.leave.push(options.leave);
        }
    }

    destroy () {
        if (this.observer) {
            const observer = this.observer;

            this.observer = null;
            observer.disconnect();
        }
    }

    handleIntersection (intersections) {
        let isIntersecting = intersections[0].isIntersecting;

        if (!isIntersecting && detect.isEdge()) {
            // Edge reports incorrectly
            const rect = intersections[0].boundingClientRect;
            const root = intersections[0].rootBounds;

            if (rect.width && rect.height) {
                if ((rect.top > 0 && rect.top < root.height) || (rect.top + rect.height > 0 && rect.top + rect.height < root.height) || (rect.top < 0 && rect.top + rect.height > root.height)) {
                    if ((rect.left > 0 && rect.left < root.width) || (rect.left + rect.width > 0 && rect.left + rect.width < root.width) || (rect.left < 0 && rect.left + rect.width > root.width)) {
                        isIntersecting = true;
                    }
                }
            }
        }

        if (this.isIntersecting !== isIntersecting) {
            this.isIntersecting = isIntersecting;

            if (isIntersecting && this.options.enter) {
                each(this.enter, (fn) => fn(this.$container));
            } else if (!isIntersecting && this.options.leave) {
                each(this.leave, (fn) => fn(this.$container));
            }

            if (isIntersecting && this.options.destroyOnEnter) {
                this.destroy();
            } else if (!isIntersecting && this.options.destroyOnLeave) {
                this.destroy();
            }
        }
    }
}

$.fn.inview = createPlugin(InView, {
    'namespace': 'inview'
});

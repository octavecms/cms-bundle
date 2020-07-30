/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';

import 'util/jquery.passive';
import 'util/jquery.destroyed';
import namespace from 'util/namespace';
import { eq } from 'lodash';


function buildThresholdList(numSteps) {
    let thresholds = [0];
  
    for (let i = 1.0; i <= numSteps; i++) {
        let ratio = i / numSteps;
        thresholds.push(ratio);
    }
  
    return thresholds;
}

/**
 * Automatically add classname to the navigation links based on scroll position
 * to indicate which link is currently active in the viewport
 */
class ScrollSpy {

    static get Defaults () {
        return {
            'rootClassName': 'scrollspy-root',
            'classNameActive': 'is-active'
        };
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$links = $container.find('a[href^="#"]').addBack('a[href^="#"]');
        this.$root = $(`<div class="${ options.rootClassName }" />`).appendTo(document.body);
        this.constraints = [];
        this.activeIndex = 0;
        this.ns = namespace();

        $container.on('destroyed', this.destroy.bind(this));

        // // Global events
        $(window)
            .onpassive(`resize.${ this.ns }`, this.refresh.bind(this))
            .onpassive(`scroll.${ this.ns }`, this.update.bind(this));

        $(document)
            .on(`appear.${ this.ns }`, this.refresh.bind(this))

        this.refresh();
    }

    /**
     * Update constraints
     */
    refresh () {
        const $links = this.$links;
        const constraints = this.constraints = [];
        const scroll = $(window).scrollTop();
        const rootTop = this.$root.get(0).getBoundingClientRect().top;

        for (let i = 0; i < $links.length; i++) {
            const href = $links.eq(i).attr('href');
            const $target = $(href);

            if ($target.length) {
                const box = $target.get(0).getBoundingClientRect();
                
                constraints.push({
                    index: i,
                    target: $target,
                    from: box.top + scroll - rootTop,
                    to: box.top + scroll + box.height - rootTop,
                });
            }
        }

        this.update();
    }

    /**
     * Update links
     */
    update () {
        const constraints = this.constraints;
        const scroll = $(window).scrollTop();

        for (let i = 0; i < constraints.length; i++) {
            if (constraints[i].from < scroll && constraints[i].to > scroll) {
                this.setActive(constraints[i].index);
                return;
            }
        }
    }

    /**
     * Set active link
     * 
     * @param {number} index Link index
     * @protected
     */
    setActive (index) {
        if (index !== this.activeIndex) {
            const classNameActive = this.options.classNameActive;

            this.$links.eq(this.activeIndex).removeClass(classNameActive)
            this.$links.eq(index).addClass(classNameActive)
            this.activeIndex = index;
        }
    }

    /**
     * Cleanup global events
     * 
     * @protected
     */
    destroy () {
        $(window).add(document).off(`.${ this.ns }`);
    }
}

$.fn.scrollspy = createPlugin(ScrollSpy);

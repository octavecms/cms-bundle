/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';


/**
 * Sticky header, when header becomes sticky adds classname to it
 */
class StickyHeader {

    static get Defaults () {
        return {
            'stickyClassName': 'is-sticky'
        };
    }

    constructor ($container, opts) {
        this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.isSticky = false;

        // Observe when element becomes sticky
        this.observer = new IntersectionObserver(this.handleStickyStateChange.bind(this), {
            threshold: 1,
            rootMargin: '0px 50px 0px 50px',
        });

        this.observer.observe($container.get(0))

        $container.on('destroyed', this.destroy.bind(this));
    }

    handleStickyStateChange (event) {
        const isSticky = event[0].intersectionRatio < 1;
        
        if (isSticky !== this.isSticky) {
            this.isSticky = isSticky;
            this.$container.toggleClass(this.options.stickyClassName, isSticky);
        }
    }

    destroy () {
        this.observer.disconnect();
        this.observer = null;
    }
}

$.fn.stickyHeader = createPlugin(StickyHeader);

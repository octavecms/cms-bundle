/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

import ResponsiveComponent from 'components/responsive-component';


/**
 * Sample responsive component which is enabled when
 * browser viewport size matches CSS defined media query and disabled
 * when it stops matching
 */
class Sample extends ResponsiveComponent {

    static get Defaults () {
        return assign({}, ResponsiveComponent.Defaults, {
            // Overwrite responsive component default options and add other
            // default options...

            // Media query for which component is enabled
            'enableMq': 'md-up'
        });
    }

    /**
     * Initialize components
     * Called during constructor
     *
     * @protected
     */
    init () {
        const $container = this.$container;
        const options = this.options;

        this.$someElement = $container.find('.js-some-element');
    }

    /**
     * Callback when component is enabled
     */
    enable () {
        if (super.enable()) {
            // Add listeners, set styles, etc.
            const ns = this.ns;

            this.$someElement.on(`click.${ ns }`, this.handleClick.bind(this));
            $(window).on(`scroll.${ ns }`, this.handleScroll.bind(this));
        }
    }

    /**
     * Callback when component is disabled
     * Also called during destroy
     */
    disable () {
        if (super.disable()) {
            // Remove listeners, remove styles, etc.
            const ns = this.ns;

            this.$someElement.off(`.${ ns }`);
            $(window).off(`.${ ns }`);
        }
    }

    /**
     * Remove listeners, cleanup
     */
    destroy () {
        super.destroy();
        // Do some cleanup which we didn't do in the disable()
    }

    // handleClick, handleScroll, ...
}

$.fn.sample = createPlugin(Sample);

/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import 'util/jquery.inview';
import createPlugin from 'jquery-plugin-generator';

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


/**
 * Sample component
 */
class RichTextEditor {

    static get Defaults () {
        return {};
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.ns = namespace();

        $container.on('destroyed', this.destroy.bind(this));

        $container.inview({
            enter: this.createEditor.bind(this),
            destroyOnEnter: true,
            destroyOnLeave: true,
        });
    }

    createEditor () {

    }

    destroy () {
        // Cleanup global events
        $(window).add(document).off(`.${ this.ns }`);
    }
}

$.fn.richtexteditor = createPlugin(RichTextEditor);

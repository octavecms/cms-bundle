/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';

import createStore from 'media/util/store';
import getInitialState from 'visual-editor/modules/get-initial-state';
import VisualEditorIframe from 'visual-editor/components/iframe';

import 'util/jquery.destroyed';


const SELECTOR_IFRAME = '.js-visual-editor-iframe';
const SELECTOR_LOADER = '.js-visual-editor-loader';
const SELECTOR_LANGUAGE = 'input[name="visual-editor-language"]';


/**
 * VisualEditor shows preview of the page and allows to order blocks and
 * open other editors
 */
class VisualEditor {

    static get Defaults () {
        return {};
    }

    constructor ($container, opts) {
        this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$iframe = $container.find(SELECTOR_IFRAME);
        this.$loader = $container.find(SELECTOR_LOADER);
        this.$language = $container.find(SELECTOR_LANGUAGE);

        $container.on('destroyed', this.destroy.bind(this));

        this.create();
    }

    create () {
        const store = this.store = createStore(getInitialState(this.options));

        // Iframe
        this.iframe = new VisualEditorIframe(this.$iframe, store);

        // Loading state
        store.loading.on('change', (isLoading) => {
            this.$loader.toggleClass('d-none', !isLoading);
        });

        // Language
        this.$language.on('change', () => {
            const language = this.$language.filter(':checked').val();
            store.language.set(language);
        });
    }

    destroy () {
        this.store.destroy();
        this.store = null;

        this.iframe.destroy();
        this.iframe = null;
    }
}

$.fn.visualEditor = createPlugin(VisualEditor);

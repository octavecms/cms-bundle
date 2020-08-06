/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

import createStore from 'media/util/store';
import getInitialState from 'visual-editor/modules/get-initial-state';
import VisualEditorIframe from 'visual-editor/components/iframe';
import VisualEditorControls from 'visual-editor/components/controls';
import VisualEditorAddSection from 'visual-editor/components/add-section';

import { setLanguage } from 'visual-editor/modules/actions';

import 'util/jquery.destroyed';


const SELECTOR_IFRAME = '.js-visual-editor-iframe';
const SELECTOR_LOADER = '.js-visual-editor-loader';
const SELECTOR_LANGUAGE = 'input[name="visual-editor-language"]';
const SELECTOR_CONTROLS = '.js-visual-editor-controls';
const SELECTOR_ADD_SECTION = '.js-visual-editor-add';


/**
 * VisualEditor shows preview of the page and allows to order blocks and
 * open other editors
 */
class VisualEditor {

    static get Defaults () {
        return {};
    }

    constructor ($container, opts) {
        this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$iframe = $container.find(SELECTOR_IFRAME);
        this.$loader = $container.find(SELECTOR_LOADER);
        this.$language = $container.find(SELECTOR_LANGUAGE);
        this.$controls = $container.find(SELECTOR_CONTROLS);
        this.$addsection = $container.find(SELECTOR_ADD_SECTION);

        $container.on('destroyed', this.destroy.bind(this));

        this.create();
    }

    create () {
        const store = this.store = createStore(getInitialState(this.options));
        window.store = store;
        window.ve = this;

        // Iframe
        this.iframe = new VisualEditorIframe(this.$iframe, store, this);

        // Controls
        this.controls = new VisualEditorControls(this.$controls, store, this);

        // Add section
        this.addsection = new VisualEditorAddSection(this.$addsection, store, this);

        // Loading state
        store.loading.on('change', (isLoading) => {
            this.$loader.toggleClass('d-none', !isLoading);
        });

        // Language
        this.$language.on('change', () => {
            const language = this.$language.filter(':checked').val();
            setLanguage(store, language);
        });
    }

    destroy () {
        if (this.store) {
            this.store.destroy();
            this.store = null;
        }
        if (this.iframe) {
            this.iframe.destroy();
            this.iframe = null;
        }
    }

    getItems () {
        return this.iframe.getItems();
    }
    getItem (id) {
        return this.iframe.getItem(id);
    }
    getLists () {
        return this.iframe.getLists();
    }
    getList (id) {
        return this.iframe.getList(id);
    }
}

$.fn.visualEditor = createPlugin(VisualEditor);

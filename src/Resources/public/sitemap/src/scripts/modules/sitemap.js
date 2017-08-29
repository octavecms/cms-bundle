import map from 'lodash/map';

import createStore from '../modules/store';

import SitemapTreeView from '../components/treeview';
import SitemapForm from '../components/form';


/**
 * Top level component
 */

const SELECTOR_TREE_VIEW = '[data-widget="sitemap-treeview"]';
const SELECTOR_SITEMAP_ADD = '[data-widget="sitemap-add"]';
const SELECTOR_SITEMAP_FORM = '[data-widget="sitemap-form"]';

const SITEMAP_NAMESPACE = 'sitemap';


class Sitemap {

    static get defaultOptions () {
        return {};
    }

    constructor (element, options) {
        this.$element = $(element);
        this.options = $.extend(true, this.constructor.defaultOptions, this.options, options);

        this._init();
        this._initToolbar();
    }

    _init () {
        const store = this.store = createStore();
        const $element = this.$element;

        // @TODO Remove, this is for debug only
        window.store = store;

        const $form = this.$form = $element.find(SELECTOR_SITEMAP_FORM);
        this.form = new SitemapForm($form, {'store': store});

        const $treeView = this.$treeView = $element.find(SELECTOR_TREE_VIEW);
        this.treeView = new SitemapTreeView($treeView, {'store': store, 'temporaryform': this.form});
    }

    _initToolbar () {
        this.$element.find(SELECTOR_SITEMAP_ADD)
            .addClass('sitemap-add')
            .draggable({
                scope             : 'sitemapitem',
                helper            : 'clone',
                placeholder       : 'sort-highlight',
                zIndex            : 999999
            });
    }

    destroy () {
        this.treeView.destroy();
        this.$element.off(`.${ SITEMAP_NAMESPACE }`).removeData(SITEMAP_NAMESPACE);
        this.store.destroy();

        this.$treeView = this.$element = void 0;
        this.treeView = this.store = this.options = void 0;
    }
}


$.bridget(SITEMAP_NAMESPACE, Sitemap);
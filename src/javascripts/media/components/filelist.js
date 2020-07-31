import $ from 'util/jquery';
import 'util/template/jquery.template';
import namespace from 'util/namespace';
import debounce from 'media/utils/debounce-raf';

import { loadFiles } from 'media/modules/actions-files';

// import 'util/jquery.destroyed';
// import namespace from 'util/namespace';


/**
 * File list component
 */
export default class MediaFileList {

    static get Defaults () {
        return {
            store: null
        };
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.store = options.store;
        this.ns = namespace();

        // Initialize template
        $container.template({'removeSiblings': true});

        // Render
        this.render();

        // Prevent multiple calls to render during since store change
        this.render = debounce(this.render.bind(this));

        this.events();
        this.reload();
    }

    events () {
        const store = this.store;
        const $container = this.$container;
        const ns = this.ns;

        // On file list change re-render
        store.files.grid.on(`change.${ ns }`, this.render.bind(this));
        
        store.files.loading.on(`change.${ ns }`, (loading) => {
            if (loading) {
                this.render();
            }
        });

        // store.folders.selected.on(`change.${ ns }`, this.reload.bind(this));

        // store.files.list['*'].on(`change.${ ns }`, (newValue, prevValue) => {
        //     if (newValue && prevValue) {
        //         if (prevValue.expanded !== newValue.expanded) {
        //             this.getElement(newValue.id).toggleClass('tree__item--expanded', newValue.expanded);
        //         }
        //         if (prevValue.name !== newValue.name) {
        //             this.getElement(newValue.id, SELECTOR_TITLE).text(newValue.name);
        //         }
        //         if (prevValue.disabled !== newValue.disabled) {
        //             this.getElement(newValue.id).toggleClass('tree__item--disabled', newValue.disabled);
        //         }
        //     }
        // });
        // store.files.selected.on(`change.${ ns }`, (newValue, prevValue) => {
        //     this.getElement(prevValue, SELECTOR_ELEMENT).removeClass('tree-item--active');
        //     this.getElement(newValue, SELECTOR_ELEMENT).addClass('tree-item--active');
        // });
    }

    reload () {
        loadFiles(this.store, this.store.folders.selected.get());
    }

    render () {
        const store = this.store;
        const files = store.files.grid.get();
        
        this.$container.template('replace', {
            'store': store,
            'items': files,
            'selected': store.files.selected.get(),
            'loading': store.files.loading.get(),
        });
    }

    /**
     * Returns id from element
     * 
     * @param {object} $element Element
     * @returns {string} Element id
     */
    getId ($element) {
        return $($element).closest('.js-tree-view-item').data('id');
    }

    /**
     * Returns element from id
     * 
     * @param {string} id Element id
     * @returns {object} Element
     */
    getElement (id, selector) {
        const $element = this.$container.find(`.js-tree-view-item[data-id="${ id }"]`);
        return selector ? $element.find(selector).eq(0) : $element;
    }
}
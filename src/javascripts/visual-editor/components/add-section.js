import each from 'lodash/each';
import difference from 'lodash/difference';

import { addSection } from 'visual-editor/modules/actions';

const SELECTOR_ADD_TEMPLATE = '.js-visual-editor-add-template';
const SELECTOR_ADD_ITEM = '.js-visual-editor-add-item';
const SELECTOR_ADD_ITEM_CONTROL = '.js-visual-editor-add-item-control';


export default class VisualEditorAddSection {
    constructor ($container, store, visualEditor) {
        this.$container = $container;
        this.$template = $container.find(SELECTOR_ADD_TEMPLATE).template();
        this.store = store;
        this.visualEditor = visualEditor;

        // Each section / list controls
        this.controls = {};

        this.create();
    }

    create () {
        const store = this.store;
        const $container = this.$container;

        // Add / remove controls on change
        store.sections.list.on('change', (newValue, prevValue) => {
            const newValueKeys = Object.keys(newValue);
            const prevValueKeys = Object.keys(prevValue);
            const added = difference(newValueKeys, prevValueKeys);
            const removed = difference(prevValueKeys, newValueKeys);

            each(added, (id) => {
                this.addControls({
                    'id': newValue[id].id,
                    'parent': newValue[id].parent,
                    'reference': newValue[id].id,
                    'position': 'top',
                });
            });
            each(removed, this.removeControls.bind(this));
        });

        // Show / hide controls on visibility change
        store.sections.list['*'].on('change', (newValue, prevValue) => {
            if (newValue && prevValue) {
                if (newValue.visible !== prevValue.visible) {
                    this.controls[newValue.id].element.toggleClass('d-none', !newValue.visible);
                }
            }
        });

        // Add control for lists
        store.iframe.html.on('change', () => {
            const $lists = this.visualEditor.getLists();

            for (let i = 0; i < $lists.length; i++) {
                const $list = $lists.eq(i);
                const id = $list.data('id');

                this.addControls({
                    'id': id ,
                    'parent': id,
                    'reference': null,
                    'position': 'bottom', 
                });
            }
        });

        // While loading page hide controls
        store.loading.on('change', (isLoading) => {
            const controls = this.controls;

            for (let key in controls) {
                controls[key].element.toggleClass('d-none', isLoading);
            }
        });

        store.iframe.offsets.on('change', this.updateControlsPositions.bind(this));
        store.iframe.heights.on('change', this.updateControlsPositions.bind(this));
        store.iframe.scroll.on('change', this.updateControlsPositions.bind(this));

        this.$container.on('click returnkey', SELECTOR_ADD_ITEM_CONTROL, this.addSection.bind(this));
    }

    addControls (item) {
        const html = this.$template.template('compile', {'loading': store.loading.get(), ...item});
        const $control = $(html).appendTo(this.$container).app();

        this.controls[item.id] = {
            'element': $control,
            ...item
        };
    }

    removeControls (id) {
        const controls = this.controls;

        if (id in controls) {
            controls[id].element.remove();
            delete(controls[id]);
        }
    }

    updateControlsPositions () {
        const store = this.store;
        const offsets = store.iframe.offsets.get();
        const heights = store.iframe.heights.get();
        const scroll = store.iframe.scroll.get();
        const controls = this.controls;

        for (let id in controls) {
            const control = controls[id];
            let   offset = offsets[id] - scroll;

            if (control.position === 'top') {
                offset = offsets[id] - scroll;
            } else {
                offset = offsets[id] + heights[id] - scroll;
            }

            control.element.css('transform', `translateY(${ offset }px)`);
        }
    }
    
    /**
     * Add section
     * 
     * @param {object} event Event
     * @protected
     */
    addSection (event) {
        const $target = $(event.target);
        const $dropdown = $target.closest(`[data-${ $.app.settings.namespace }~="dropdown"]`);
        const $item = $target.closest(SELECTOR_ADD_ITEM_CONTROL);
        
        const type = $item.data('type');
        const parent = $item.data('parent');
        let   reference = $item.data('reference');

        if (!store.sections.list[reference].get()) {
            // Reference is a list
            reference = null;
        }

        addSection(this.store, parent, reference, type);
        event.preventDefault();

        $dropdown.dropdown('hide');
    }

    getControlsList (id, selector = '') {
        return this.$container.find(`${ SELECTOR_ADD_ITEM }[data-id="${ id }"] ${ selector }`.trim());
    }

    getControlsItem (id, selector = '') {
        return this.$container.find(`${ SELECTOR_ADD_ITEM }[data-id="${ id }"] ${ selector }`.trim());
    }
}
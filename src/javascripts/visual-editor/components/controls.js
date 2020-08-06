import each from 'lodash/each';
import difference from 'lodash/difference';
import assign from 'lodash/assign';

import { removeSection, moveSectionUp, moveSectionDown, updateSection } from 'visual-editor/modules/actions';

const CLASS_CONTROLS_HOVERED = 'visual-editor-controls--hovered';

const SELECTOR_CONTROL_TEMPLATE = '.js-visual-editor-controls-template';
const SELECTOR_CONTROL_ITEM = '.js-visual-editor-controls-item';
const SELECTOR_MOVE_UP = '.js-visual-editor-controls-up';
const SELECTOR_MOVE_DOWN = '.js-visual-editor-controls-down';
const SELECTOR_DELETE = '.js-visual-editor-controls-delete';
const SELECTOR_PUBLISHED = '.js-visual-editor-controls-published';


export default class VisualEditorControls {
    constructor ($container, store, visualEditor) {
        this.$container = $container;
        this.$template = $container.find(SELECTOR_CONTROL_TEMPLATE).template();
        this.store = store;
        this.visualEditor = visualEditor;

        // Each section controls
        this.controls = {};

        this.create();
    }

    create () {
        const store = this.store;
        const $container = this.$container;

        store.sections.list.on('change', (newValue, prevValue) => {
            const newValueKeys = Object.keys(newValue);
            const prevValueKeys = Object.keys(prevValue);
            const added = difference(newValueKeys, prevValueKeys);
            const removed = difference(prevValueKeys, newValueKeys);

            each(added, this.addControls.bind(this));
            each(removed, this.removeControls.bind(this));
        });

        store.sections.list['*'].on('change', (newValue, prevValue) => {
            if (newValue && prevValue) {
                // Update published input
                if (prevValue.published !== newValue.published) {
                    this.updatePublishedInput(newValue.id, newValue.published);
                }
                // Show / hide section
                if (newValue.visible !== prevValue.visible) {
                    this.controls[newValue.id].toggleClass('d-none', !newValue.visible);
                }
            }
        });

        // On order change enable / disable order change buttons
        store.sections.order.on('change', (newValue, prevValue) => {
            if (newValue[0] !== prevValue[0]) {
                this.getControlsItem(prevValue[0], SELECTOR_MOVE_UP).removeClass('is-disabled');
                this.getControlsItem(newValue[0], SELECTOR_MOVE_UP).addClass('is-disabled');
            }
            if (newValue[newValue.length - 1] !== prevValue[prevValue.length - 1]) {
                this.getControlsItem(prevValue[prevValue.length - 1], SELECTOR_MOVE_DOWN).removeClass('is-disabled');
                this.getControlsItem(newValue[newValue.length - 1], SELECTOR_MOVE_DOWN).addClass('is-disabled');
            }
        });

        // 
        store.iframe.hovered.on('change', (newValue, prevValue) => {
            if (prevValue) {
                this.getControlsItem(prevValue).removeClass(CLASS_CONTROLS_HOVERED);
            }
            if (newValue) {
                this.getControlsItem(newValue).addClass(CLASS_CONTROLS_HOVERED);
            }
        });

        store.iframe.offsets.on('change', this.updateControlsPositions.bind(this));
        store.iframe.scroll.on('change', this.updateControlsPositions.bind(this));

        $container.on('click returnkey', SELECTOR_DELETE, (event) => {
            removeSection(store, this.getId(event));
            event.preventDefault();
        });

        $container.on('click returnkey', SELECTOR_MOVE_UP, (event) => {
            moveSectionUp(store, this.getId(event));
            event.preventDefault();
        });

        $container.on('click returnkey', SELECTOR_MOVE_DOWN, (event) => {
            moveSectionDown(store, this.getId(event));
            event.preventDefault();
        });

        $container.on('change', SELECTOR_PUBLISHED, (event) => {
            updateSection(store, this.getId(event), $(event.target).prop('checked'));
            event.preventDefault();
        });
    }

    addControls (id) {
        const order = this.store.sections.order.get();
        const index = order.indexOf(id);
        const item = this.store.sections.list[id].get();
        const html = this.$template.template('compile', assign({
            'first': index === 0,
            'last': index === order.length - 1
        }, item));

        const $control = $(html).appendTo(this.$container).app();

        this.controls[id] = $control;
    }

    removeControls (id) {
        if (id in this.controls) {
            this.controls[id].remove();
            delete(this.controls[id]);
        }
    }

    updatePublishedInput (id, published) {
        const $input = this.visualEditor.getItem(id).find(SELECTOR_PUBLISHED);

        if ($input.prop('checked') !== published) {
            $input.prop('checked', published).change();
        }
    }

    updateControlsPositions () {
        const store = this.store;
        const offsets = store.iframe.offsets.get();
        const scroll = store.iframe.scroll.get();
        const ids = store.sections.order.get();
        const controls = this.controls;

        each(ids, (id) => {
            if (id in controls) {
                const control = controls[id];
                const offset = offsets[id] - scroll;
    
                control.css('transform', `translateY(${ offset }px)`);
            }
        });
    }

    getId (event) {
        return $(event.target).closest('[data-id]').data('id');
    }

    getControlsItem (id, selector = '') {
        return this.$container.find(`${ SELECTOR_CONTROL_ITEM }[data-id="${ id }"] ${ selector }`.trim());
    }
}
import { loadPage } from 'visual-editor/modules/actions';
import pollTimer from 'visual-editor/modules/poll-timer';

import { animateElement } from 'visual-editor/modules/animation';


const CLASS_LIST = 'cms-section-list';
const CLASS_LIST_ITEM = 'cms-section-item';
const CLASS_LIST_ITEM_HIDDEN = 'cms-section-item--hidden';
const SELECTOR_LIST = `.${ CLASS_LIST }`;
const SELECTOR_LIST_ITEM = `.${ CLASS_LIST_ITEM }`;

const MOVE_ANIMATION_DURATION = 200;
const SHOW_ANIMATION_DURATION = 200;


export default class VisualEditorIframe {
    constructor ($container, store) {
        this.store = store;
        this.$container = $container;
        this.offsetElements = [];
        this.events();
    }

    events () { 
        const store = this.store;

        store.loading.on('change', (isLoading) => {
            this.$container.toggleClass('d-none', isLoading);
        });

        store.iframe.html.on('change', (html) => {
            this.$container.get(0).contentDocument.write(html);
            this.initIframeContent();
        });

        store.sections.order.on('change', this.updateSectionOrder.bind(this));

        store.sections.list['*'].on('change', (newValue, prevValue) => {
            if (newValue && prevValue) {
                if (newValue.visible !== prevValue.visible) {
                    this.getItem(newValue.id).toggleClass(CLASS_LIST_ITEM_HIDDEN, !newValue.visible);
                    this.checkTimer.burst();
                }
            }
        });
        
        store.sections.list['*'].on('remove', (newValue, prevValue) => {
            this.getItem(prevValue.id).remove();
            this.updateOffsetElements();

        });

        // Insert new section
        store.insert['*'].on('add', this.insertSection.bind(this));

        // Load page
        loadPage(store, store.id.get(), store.language.get());

        // Re-check offsets once a second
        this.checkTimer = pollTimer(250, this.checkOffsets.bind(this));
    }

    /**
     * Udpate offsets and returns true if any of the offsets changed, otherwise false
     */
    checkOffsets () {
        const offsets = this.updateOffsets();

        // If there was a change return true and poll timer will go into
        // fast poll mode
        return offsets ? true : false;
    }

    updateOffsets () {
        const store = this.store;
        const prevOffsets = store.iframe.offsets.get();
        const prevHeights = store.iframe.heights.get();
        const nextOffsets = {};
        const nextHeights = {};
        const iframe = this.$container.get(0);
        const scroll = $(iframe.contentWindow).scrollTop();
        const elements = this.offsetElements;
        let changed = false;

        for (let i = 0; i < elements.length; i++) {
            const rect = elements[i].getBoundingClientRect();
            const id = $(elements[i]).data('id');

            nextOffsets[id] = rect.top + scroll;
            nextHeights[id] = rect.height;

            if (prevOffsets[id] !== nextOffsets[id] || prevHeights[id] !== nextHeights[id]) {
                changed = true;
            }
        }

        if (changed) {
            store.iframe.offsets.set(nextOffsets);
            store.iframe.heights.set(nextHeights);

            return nextOffsets;
        } else {
            return null;
        }
    }

    initIframeContent () {
        // On scroll save scroll position
        $(this.$container.get(0).contentWindow).on('scroll', () => {
            this.store.iframe.scroll.set($(this.$container.get(0).contentWindow).scrollTop());
        });

        // Save hovered position
        $(this.$container.get(0).contentWindow).on('mousemove', () => {
            this.store.iframe.scroll.set($(this.$container.get(0).contentWindow).scrollTop());
        });

        this.updateOffsetElements();
    }

    /**
     * Insert new section with data received from server
     * 
     * @param {object} item Section data
     */
    insertSection (item) {
        const $item = $(item.html);
        const order = [].concat(store.sections.order.get());

        if (item.reference) {
            const $reference = this.getItem(item.reference);
            $reference.before($item);

            const refIndex = order.indexOf(item.reference);
            order.splice(refIndex, 0, item.id);
            delete(item.reference);
        } else {
            const $parent = this.getList(item.parent);
            $parent.append($item);
            order.push(item.id);
        }

        // Animate element into view
        animateElement($item, {
            'height': 0,
            'duration': SHOW_ANIMATION_DURATION
        });

        delete(item.html);

        // Initialize $.fn.app
        const win = this.$container.get(0).contentWindow;
        if (win && win.jQuery && win.jQuery.fn && win.jQuery.fn.app) {
            win.jQuery($item.get(0)).app();
        }

        store.sections.list[item.id].set(item);
        store.sections.order.set(order);
        store.insert[item.id].remove();

        this.updateOffsetElements();
    }

    updateOffsetElements () {
        this.offsetElements = this.getItems().add(this.getLists()).toArray();
        this.updateOffsets();
        this.checkTimer.burst();
    }

    updateSectionOrder (order) {
        const prevOffsets = this.store.iframe.offsets.get();

        for (let i = 0; i < order.length; i++) {
            const id = order[i];
            const item = this.store.sections.list[id].get();

            if (item) {
                const $item = this.getItem(item.id);
                const $list = this.getList(item.parent);

                $list.append($item);
            }
        }

        // Animate elements
        const newOffsets = this.updateOffsets();
        if (newOffsets) {
            for (let i = 0; i < order.length; i++) {
                const id = order[i];
                const diff = prevOffsets[id] - newOffsets[id];

                animateElement(this.getItem(id), {
                    'transform': `translateY(${ diff }px)`,
                    'duration': MOVE_ANIMATION_DURATION
                });
            }
        }

        this.checkTimer.burst();
    }

    getItems () {
        return $(this.$container.get(0).contentDocument).find(SELECTOR_LIST_ITEM);
    }

    getItem (id) {
        if (id) {
            return $(this.$container.get(0).contentDocument).find(`${ SELECTOR_LIST_ITEM }[data-id="${ id }"]`);
        } else {
            return $();
        }
    }

    getLists () {
        return $(this.$container.get(0).contentDocument).find(`${ SELECTOR_LIST }`);
    }

    getList (id) {
        if (id) {
            return $(this.$container.get(0).contentDocument).find(`${ SELECTOR_LIST }[data-id="${ id }"]`);
        } else {
            return $();
        }
    }

    destroy () {
        this.checkTimer.destroy();
    }
}
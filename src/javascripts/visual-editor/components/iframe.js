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
            this.$container.toggleClass('is-invisible', isLoading);
        });

        store.iframe.html.on('change', this.initIframeContent.bind(this));

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

        store.iframe.mouse.on('change', this.updateHoveredItem.bind(this));

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

    /**
     * Initialize iframe content
     * 
     * @param {string} html Iframe HTML
     */
    initIframeContent (html) {
        if (!html) return;
        
        this.offsetElements = [];

        // Set HTML
        this.$container.get(0).src = 'about:blank';

        const doc = this.$container.get(0).contentDocument;
        doc.open();
        doc.write(html);
        doc.close();

        // Wait till it's loaded
        this.$container.on('load', () => {
            const win = this.$container.get(0).contentWindow;
            const doc = this.$container.get(0).contentDocument;

            win.addEventListener('scroll', this.handleIframeScroll.bind(this), false);
            win.addEventListener('mousemove', this.handleIframeMouseMove.bind(this), false);
            doc.addEventListener('click', this.handleIframeClick.bind(this), false);
    
            this.updateOffsetElements();

            // Show iframe
            this.store.loading.set(false);
        });
    }

    /**
     * Save scroll position
     * 
     * @param {object} event Event
     */
    handleIframeScroll () {
        this.store.iframe.scroll.set($(this.$container.get(0).contentWindow).scrollTop());
    }

    /**
     * Save mouse position to allow detect hovered element
     * 
     * @param {object} event Event
     */
    handleIframeMouseMove (event) {
        this.store.iframe.mouse.set({
            'x': event.pageX,
            'y': event.pageY
        });
    }

    /**
     * Propagate click event outside the iframe for dropdown and other elements to be able to listen for them
     * 
     * @param {object} event Event
     */
    handleIframeClick (event) {
        this.$container.trigger(jQuery.Event('click', event));
        this.checkTimer.burst();
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

        // Animate element into view
        animateElement($item, {
            'height': 0,
            'duration': SHOW_ANIMATION_DURATION
        });
    }

    /**
     * Update list of offset elements
     */
    updateOffsetElements () {
        this.offsetElements = this.getItems().add(this.getLists()).toArray();

        if (this.checkOffsets()) {
            this.updateHoveredItem();
            this.checkTimer.burst();
        }
    }

    /**
     * Update section element order
     * 
     * @param {array} order List of section ids
     */
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

    updateHoveredItem () {
        const store = this.store;
        const offsets = store.iframe.offsets.get();
        const heights = store.iframe.heights.get();
        const mouse = store.iframe.mouse.get();
        let   hovered = null;

        for (let id in offsets) {
            if (store.sections.list[id].has()) {
                if (mouse.y > offsets[id] && mouse.y < offsets[id] + heights[id]) {
                    hovered = id;
                    break;
                }
            }
        }

        if (store.iframe.hovered.get() !== hovered) {
            store.iframe.hovered.set(hovered);
        }
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
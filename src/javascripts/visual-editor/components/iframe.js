import { loadPage } from 'visual-editor/modules/actions';
import pollTimer from 'visual-editor/modules/poll-timer';


const CLASS_LIST = 'cms-section-list';
const CLASS_LIST_ITEM = 'cms-section-item';
const SELECTOR_LIST = `.${ CLASS_LIST }`;
const SELECTOR_LIST_ITEM = `.${ CLASS_LIST_ITEM }`;


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

        store.iframe.offsets.on('change', (offsets) => {
            console.log('Offsets changed', offsets);
        });

        store.iframe.scroll.on('change', (scroll) => {
            console.log('Scroll changed', scroll);
        });

        store.language.on('change', (language) => {
            loadPage(this.store);
        });

        loadPage(this.store);

        // Re-check offsets once a second
        this.checkTimer = pollTimer(250, this.checkOffsets.bind(this));
    }

    checkOffsets () {
        const store = this.store;
        const nextOffsets = [];
        const nextHeights = [];
        const iframe = this.$container.get(0);
        const scroll = $(iframe.contentWindow).scrollTop();
        const elements = this.offsetElements;

        for (let i = 0; i < elements.length; i++) {
            const rect = elements[i].getBoundingClientRect();
            nextOffsets.push(rect.top + scroll);
            nextHeights.push(rect.height);
        }

        store.iframe.offsets.set(nextOffsets);
        store.iframe.heights.set(nextHeights);
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

    updateOffsetElements () {
        this.offsetElements = $(this.$container.get(0).contentDocument).find(SELECTOR_LIST_ITEM).toArray();
        this.checkOffsets();
    }

    destroy () {
        this.checkTimer.destroy();
    }
}
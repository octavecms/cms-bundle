/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';

import 'util/jquery.destroyed';
import 'components/modal';


// Modal object cache
const ajaxModalCache = {};


/**
 * AjaxModal loader, one for each url
 */
class AjaxModalLoader {

    constructor (url) {
        this.url = url;
        this.loading = false;
        this.loaded = false;
        this.inserted = false;
        this.insertOnLoad = false;
        this.openOnLoad = false;
        this.$modal = null;
        this.modalArgs = null;
    }

    /**
     * Destructor
     */
    destroy () {
        AjaxModalLoader.remove(this.url);
    }

    /**
     * Open modal
     */
    open (...args) {
        this.modalArgs = args;

        if (this.loading) {
            this.openOnLoad = true;
            this.insertOnLoad = true;
        } else if (!this.loaded) {
            this.openOnLoad = true;
            this.insertOnLoad = true;
            this.load();
        } else if (!this.inserted) {
            // It's already loaded, but not inserted into DOM yet
            this.openOnLoad = true;
            this.insertModal(this.loaded);
        } else {
            // Reset trigger element and show modal
            const modalArgs = this.modalArgs;
            this.modalArgs = [];

            this.$modal.modal('show', ...modalArgs);
        }
    }

    /**
     * Load modal
     */
    load () {
        if (!this.loading && !this.loaded) {
            this.loading = true;

            fetch(this.url)
                .then((response) => response.text())
                .then((html) => {
                    this.loading = false;
                    this.loaded = html;

                    if (this.insertOnLoad) {
                        this.insertModal(html);
                    } else {
                        // Preload CSS
                        html.replace(/<link[^>]+(rel="stylesheet"|rel='stylesheet')[^>]*>/g, (stylesheet) => {
                            const href = stylesheet.match(/href=(?:"([^"]+)"|'([^']+)')/);
                            if (href) {
                                $(`<link rel="preload" as="style" href="${ href[1] || href[2] }" />`).appendTo('head');
                            }
                        });

                        // Preload JS
                        html.replace(/<script[^>]+src=(?:"([^"]+)"|'([^']+)')[^>]*>/g, (stylesheet, srcA, srcB) => {
                            $(`<link rel="preload" as="script" href="${ srcA || srcB }" />`).appendTo('head');
                        });
                    }
                });
        }
    }

    /**
     * Insert modal content into the DOM
     * 
     * @param {string} html Modal HTML
     * @protected
     */
    insertModal (html) {
        if (!this.inserted) {
            this.insertOnLoad = false;
            this.inserted = true;

            // Find modal
            const $elements = $(html).appendTo(document.body).app();

            this.$modal = $elements.filter((_, element) => {
                return $.app.hasPlugin(element, 'modal');
            });
            
            // When modal element is removed from DOM clean up cache
            this.$modal.on('destroyed', this.destroy.bind(this));
    
            if (this.openOnLoad) {
                this.openOnLoad = false;

                requestAnimationFrame(() => {
                    this.open(this.modalArgs);
                });
            }
        }
    }


    static get (url) {
        if (!(url in ajaxModalCache)) {
            ajaxModalCache[url] = new AjaxModalLoader(url);
        }
        return ajaxModalCache[url];
    }

    static load (url, ...args) {
        const loader = AjaxModalLoader.get(url);
        loader.load.apply(loader, args);
    }

    static open (url, ...args) {
        const loader = AjaxModalLoader.get(url);
        loader.open.apply(loader, args);
    }

    static remove (url) {
        delete(ajaxModalCache[url]);
    }
}


/**
 * Ajax modal trigger
 */
class AjaxModalTrigger {

    static get Defaults () {
        return {};
    }

    constructor ($container, opts) {
        this.options = $.extend({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.ajaxUrl = $container.attr('href');
        
        $container
            .on('focus mouseenter', this.load.bind(this))
            .on('click returnkey', this.open.bind(this));
    }

    /**
     * Open modal
     * 
     * @param {object} [event] Event
     */
    open (event) {
        if (event) {
            event.preventDefault();
        }

        AjaxModalLoader.open(this.ajaxUrl, this.$container);
    }

    /**
     * Load modal content
     * 
     * @protected
     */
    load () {
        AjaxModalLoader.load(this.ajaxUrl);
    }
}

$.fn.ajaxModalTrigger = createPlugin(AjaxModalTrigger);

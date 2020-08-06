/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';

import filter from 'lodash/filter';
import isPlainObject from 'lodash/isPlainObject';

import 'util/jquery.destroyed';
import 'components/modal';


// Modal object cache
const ajaxModalCache = {};

// Preload cache
const preloadCache = {};


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
        this.modalArgs = null;
    }

    /**
     * Remove modal from the DOM, that will trigger destroy
     */
    remove () {
        this.$modal.remove();
        this.$modal = null;
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

            const $modal = this.$modal;
            const plugins = $.app.getPlugins($modal);

            // Call modal
            $modal.modal('show', ...modalArgs);

            // Set plugin options
            const pluginOptions = filter(modalArgs, isPlainObject)[0] || {};

            for (let i = 0; i < plugins.length; i++) {
                // We already called modal 'show' method, modal doesn't have setOptions anyway
                if (plugins[i] !== 'modal') {
                    // Calling plugin again will call 'setOptions' method on a plugin if it exists
                    $modal[plugins[i]](pluginOptions);
                }
            }
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
                            if (href && !preloadCache[href]) {
                                preloadCache[href] = true;
                                $(`<link rel="preload" as="style" href="${ href[1] || href[2] }" />`).appendTo('head');
                            }
                        });

                        // Preload JS
                        html.replace(/<script[^>]+src=(?:"([^"]+)"|'([^']+)')[^>]*>/g, (stylesheet, srcA, srcB) => {
                            const href = srcA || srcB;
                            if (href && !preloadCache[href]) {
                                preloadCache[href] = true;
                                $(`<link rel="preload" as="script" href="${ href }" />`).appendTo('head');
                            }
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

            // When modal is hidden, remove it from the DOM
            this.$modal.on('modal-hidden', this.remove.bind(this));
            
            // When modal element is removed from DOM clean up cache
            this.$modal.on('destroyed', this.destroy.bind(this));
    
            if (this.openOnLoad) {
                this.openOnLoad = false;

                requestAnimationFrame(() => {
                    this.open.apply(this, this.modalArgs);
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

    setOptions (options) {
        $.extend(this.options, options);
    }

    /**
     * Open modal
     * 
     * @param {object} [event] Event
     */
    open (event) {
        if (event && event.isDefaultPrevented()) {
            return;
        }
        if (event) {
            event.preventDefault();
        }

        AjaxModalLoader.open(this.ajaxUrl, this.$container, this.options);
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

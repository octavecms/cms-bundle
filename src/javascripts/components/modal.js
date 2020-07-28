import $ from 'jquery';
import createPlugin from 'jquery-plugin-generator';
import debounce from 'lodash/debounce';
import detect from 'util/detect';
import namespace from 'util/namespace';
import 'util/jquery.destroyed';
import 'util/jquery.returnkey';

const IS_IOS = detect.isIOS();
const IS_ANDROID_PHONE = detect.isAndroid() && detect.isPhone();

let activeModal = null;


/**
 * Modal
 */
export default class Modal {

    static get Defaults () {
        return {
            // Classname added to the trigger element when modal is open
            'triggerActiveClassName': null,

            // Automatically close modal when clicking outside of it
            'autoClose': true,

            // CSS selector clicking on which won't automatically close modal
            'autoCloseIgnoreSelector': '.js-modal-ignore-auto-close',

            // Close button selector
            'closeSelector': '.js-modal-close',

            // Classname added to the modal
            'className': 'modal',

            // Hidden modal classname
            'classNameHidden': 'd-none',

            // CSS animations used to show / hide modal
            'animationNameIn': 'animation--modal-in',
            'animationNameOut': 'animation--modal-out',

            // Classname added to the <html> elemenet when modal is open
            'htmlScrollClassName': 'with-modal',

            // Prevent page behind the modal scrolling on iOS
            'preventIOSScroll': true,

            // jQuery event name which is triggered when modal is about to be shown
            'eventShowName': 'modal-show',

            // jQuery event name which is triggered after modal is shown
            'eventShowedName': 'modal-showed',

            // jQuery event name which is triggered when modal is about to be hidden
            'eventHideName': 'modal-hide',

            // Prevent multiple modals from being open at the same time
            // If one modal will open another one will close
            'onePerPage': true,

            // If in modal content is a form, then reset form values after modal
            // has been hidden
            'resetFormOnClose': true,

            // Automatically attach modalTrigger to elements with href="#ID_OF_MODAL"
            'attachTriggers': true
        };
    }

    constructor ($container, opts) {
        this.options     = $.extend({}, this.constructor.Defaults, opts);
        this.$container  = $container;
        this.$ignoreClick = $container.find(this.options.autoCloseIgnoreSelector);

        if (!this.$ignoreClick.length) {
            this.$ignoreClick = this.$container;
        }

        $container.addClass(this.options.className);
        $container.attr('tabindex', 0).attr('role', 'dialog').attr('aria-hidden', 'true');

        this.bodyScrollPosition = null;
        this.namespace = namespace();
        this.triggerNamespace = namespace();
        this.visible = !$container.hasClass(this.options.classNameHidden);
        this.$trigger = $();

        // // Clean up global events to prevent memory leaks and errors, if pages are dynamically loaded using JS
        // // Requires util/jquery.destroyed.js */
        $container.on('destroyed', this.destroy.bind(this));

        if (this.visible) {
            this.update();
            this.attachModalListeners();
            this.afterModalShow();
        }

        // Attach click listeners to the trigger elements
        if (this.options.attachTriggers) {
            const id = $container.attr('id');

            if (id) {
                $(document).on(`click.${ this.triggerNamespace } returnkey.${ this.triggerNamespace }`, `a[href="#${ id }"]`, this.handleDocumentLinkClick.bind(this));
            }
        }
    }

    destroy () {
        if (this.visible) {
            this.resetFixForIOS();
            this.resetFixForAndroid();
        }

        $(document).off(`.${ this.namespace }`).off(`.${ this.triggerNamespace }`);
        $('html').removeClass(this.options.htmlScrollClassName);

        this.$trigger = $();
    }

    /**
     * Update modal state
     */
    update () {
        // Disable smooth scrolling
        if (this.visible && $.fn.scroller) {
            $('body').scroller('setDisabled', true);
        }

        this.updateScrollableContent();

        // Enable smooth scrolling
        if (!this.visible && $.fn.scroller) {
            $('body').scroller('setDisabled', false);
        }
    }

    /**
     * To make sure scrolling works properly in modal we disable main content
     * scrolling with classname and we add 'padding-right' to the main content to
     * make sure it doesn't visually move because scrollbar disappears.
     *
     * @protected
     */
    updateScrollableContent () {
        const options = this.options;

        if (this.visible) {
            $('html')
                .addClass(options.htmlScrollClassName)
                .get(0).offsetWidth;
        } else {
            $('html')
                .removeClass(options.htmlScrollClassName)
                .get(0).offsetWidth;
        }

        if (!IS_IOS && (!$.isCustomScroll || !$.isCustomScroll())) {
            // Instanly scroll to the correct place, needed for Firefox which
            // resets scroll to top once we add / remove 'htmlScrollClassName'
            $('html, body')
                .scrollTop(this.bodyScrollPosition);
        }
    }

    /**
     * Called before modal hide animation starts
     *
     * @protected
     */
    beforeModalHide () {
    }

    /**
     * Called before modal show animation starts
     *
     * @protected
     */
    beforeModalShow () {
    }

    /**
     * Called after modal has been hidden
     *
     * @protected
     */
    afterModalHide () {
        // Reset forms
        if (this.options.resetFormOnClose) {
            const $forms = this.$container.find('form');

            $forms.each((index, form) => {
                form.reset();
                $(form).find('input,textarea,select').not('[type="submit"],[type="button"]').change();
            });
        }
    }

    /**
     * Called after modal has been shown
     *
     * @protected
     */
    afterModalShow () {
        // Focus modal for accessability, unless currently input is
        // focused
        if (!$(document.activeElement).is('input, textarea, select')) {
            this.$container.focus();
        }

        this.initFixForIOS();
        this.initFixForAndroid();
        this.$container.trigger(this.options.eventShowedName, {'instance': this});
    }

    /**
     * Show modal
     *
     * @param {object} [$trigger] Trigger element, optional
     */
    show ($trigger) {
        if (!this.visible) {
            const options = this.options;
            const animationName = options.animationNameIn;

            this.$trigger = $trigger || this.$trigger;
            this.visible = true;

            // Close previous modal
            if (options.onePerPage) {
                if (activeModal) {
                    activeModal.hide();
                }

                // Set active modal
                activeModal = this;
            }

            // Make sure previous animation has completed
            this.$container.transitionstop(() => {
                // Save initial scroll position when modal was opened
                this.bodyScrollPosition = $(window).scrollTop();

                // Open new modal
                this.$container.transition({
                    'before':     $el => $el.addClass(`${ animationName } ${ animationName }--inactive disable-transitions`).removeClass(options.classNameHidden).attr('aria-hidden', 'false'),
                    'transition': $el => $el.removeClass(`${ animationName }--inactive disable-transitions`),
                    'after':      $el => $el.removeClass(`${ animationName }`)
                }, {
                    'before':      () => this.beforeModalShow(),
                    'after':       () => this.afterModalShow()
                });

                if (options.triggerActiveClassName) {
                    this.$trigger.addClass(options.triggerActiveClassName);
                }

                // Update scrollbars, popover stuff
                this.update();

                this.$container.trigger(options.eventShowName, {'instance': this});

                this.attachModalListeners();
            });
        }
    }

    /**
     * Hide modal
     */
    hide () {
        if (this.visible) {
            if (this === activeModal) {
                activeModal = null;
            }

            const options = this.options;
            const animationName = options.animationNameOut;

            this.visible = false;

            this.$container.transitionstop(() => {
                this.$container.transition({
                    'before':     () => this.beforeModalHide(),
                    'after':      ()  => this.afterModalHide()
                }, {
                    'before':     $el => $el.addClass(`${ animationName }`),
                    'transition': $el => $el.addClass(`${ animationName }--active`),
                    'after':      $el => $el.removeClass(`${ animationName } ${ animationName }--active`).addClass(options.classNameHidden).attr('aria-hidden', 'true')
                }, {
                    'before':     ()  => {
                        this.resetFixForIOS();
                        this.resetFixForAndroid();
                    }
                });

                if (options.triggerActiveClassName) {
                    this.$trigger.removeClass(options.triggerActiveClassName);
                }

                this.update();

                this.$container.trigger(options.eventHideName, {'instance': this});

                this.detachModalListeners();
            });
        }
    }

    /**
     * Attach modal event listeners
     *
     * @protected
     */
    attachModalListeners () {
        this.$container.on(`click.${ this.namespace } returnkey.${ this.namespace }`, this.options.closeSelector, debounce(this.hide.bind(this), 60));

        // If user clicks outside the modal then hide it
        if (this.options.autoClose) {
            $(document).on(`click.${ this.namespace }`, this.handleDocumentClick.bind(this));
            $(document).on(`keydown.${ this.namespace }`, this.handleDocumentKey.bind(this));
        }
    }

    /**
     * Detach modal event listeners
     *
     * @protected
     */
    detachModalListeners () {
        this.$container.off(`click.${ this.namespace }`);
        $(document).off(`click.${ this.namespace } keydown.${ this.namespace }`);
    }

    /**
     * Toggle modal visibility
     *
     * @param {object} [$trigger] Trigger element, optional
     */
    toggle ($trigger) {
        if (this.visible) {
            this.hide();
        } else {
            this.show($trigger);
        }
    }

    /**
     * Clicking outside the modal or trigger should close this modal
     *
     * @param {event} event Event
     * @protected
     */
    handleDocumentClick (event) {
        const $trigger = $(event.target);

        if (!$trigger.closest(this.$trigger).length && !$trigger.closest(this.$ignoreClick).length) {
            this.hide();
        }
    }

    /**
     * Escape key closes this modal
     *
     * @param {event} event Event
     * @protected
     */
    handleDocumentKey (event) {
        if (event.which === 27 && !$(document.activeElement).is('input,textarea,select')) {
            this.hide();
        }
    }

    /**
     * On link click which has href with id of the modal, open modal
     *
     * @param {event} event Event
     * @protected
     */
    handleDocumentLinkClick (event) {
        if (!event.isDefaultPrevented()) {
            event.preventDefault();

            this.show($(event.curentTarget));
        }
    }


    /*
     * iOS input focus and resize issue
     * ----------------------------------------------------
     */

    /**
     * Update content size on browser resize
     *
     * @protected
     */
    handleResizeForIOS (event) {
        const $container = this.$container;
        const $main      = $('.js-page-content');

        if (event === false) {
            $container.css('height', '');
            $main.css('height', '');
        } else {
            $container.css('height', window.innerHeight);
            $main.css('height', window.innerHeight).scrollTop(this.bodyScrollPosition);

            // Reset scroll
            $(window).scrollTop(0);
        }
    }

    /**
     * Fix for cursor being outside the input on iOS
     * Hide main content to prevent it being larger than modal
     *
     * @protected
     */
    initFixForIOS () {
        if (IS_IOS && this.options.preventIOSScroll) {
            const $main = $('.js-page-content');

            // Just make sure modal is not inside main content
            if (!this.$container.closest($main).length) {
                // Position fixed and move so that it looks as if nothing changed
                // but prevent main content from being scrollable
                $main.css({
                    'position': 'fixed',
                    'top': 0,
                    'left': 0,
                    'overflow': 'hidden',
                    'width': '100%',
                    'height': window.innerHeight,
                });

                $('html, body').css({'height': 'auto', 'min-height': '0px'});
            }

            $(window).scrollTop(0);

            // Update size
            this.handleResizeForIOS(true);
            $(window).on(`resize.${ this.namespace }`, this.handleResizeForIOS.bind(this));
        }
    }

    /**
     * Revert iOS fix
     *
     * @protected
     */
    resetFixForIOS () {
        if (IS_IOS && this.options.preventIOSScroll) {
            $('.js-page-content').css({
                'position': '',
                'top': '',
                'overflow': '',
                'width': '',
                'height': '',
            }).scrollTop(0);

            $('html, body').css({'height': '', 'min-height': ''});

            $(window).scrollTop(this.bodyScrollPosition);
            this.bodyScrollPosition = null;

            // Restore size
            this.handleResizeForIOS(false);
            $(window).off(`resize.${ this.namespace }`);
        }
    }


    /*
     * Android input focus fix
     * After focus input is out of view on Android
     * ----------------------------------------------------
     */

    handleResizeForAndroid () {
        const tagName = document.activeElement.tagName;

        if (tagName == 'INPUT' || tagName == 'TEXTAREA' || tagName == 'SELECT') {
            setTimeout(function () {
                document.activeElement.scrollIntoViewIfNeeded();
            }, 0);
        }
    }

    initFixForAndroid () {
        if (IS_ANDROID_PHONE) {
            $(window).on(`resize.${ this.namespace }`, this.handleResizeForAndroid.bind(this));
            $(window).on(`scroll.${ this.namespace }`, this.handleResizeForAndroid.bind(this));

            $(window).scrollTop(0);
        }
    }

    resetFixForAndroid () {
        if (IS_ANDROID_PHONE) {
            $(window).off(`resize.${ this.namespace } scroll.${ this.namespace }`);

            $(window).scrollTop(this.bodyScrollPosition);
            this.bodyScrollPosition = null;
        }
    }
}


$.fn.modal = createPlugin(Modal, {
    'api': ['show', 'hide', 'toggle', 'instance'] // list of methods available using .modal('METHOD_NAME')
});


$.fn.modalTrigger = createPlugin(function ($element, opts) {
    const href = $element.attr('href');
    const options = $.extend({
        // Modal CSS selector, can be used instead of 'href'
        'target': href && href.match(/^#[a-z0-9][a-z0-9-_]*$/) ? href : '',

        // Event name which will trigger modal, eg. 'mouseover', 'click'
        'event': 'click returnkey',

        // jQuery plugin name which is used for modal element
        'plugin': 'modal',

        // Optional selector which to use to detect event instead of element
        // to which modalTrigger is attached to
        'selector': null,
    }, opts);

    if (options.event === 'mouseenter' && !detect.hasHoverSupport()) {
        options.event = 'click returnkey';
    }

    let eventName = options.event;

    $element.on(eventName, options.selector, (event) => {
        if (!event.isDefaultPrevented()) {
            event.preventDefault();

            const $target = $(options.target).eq(0);
            $target[options.plugin]('toggle', $element);
        }
    });
});

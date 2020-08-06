/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

import 'util/animation/jquery.transition';
import 'util/jquery.destroyed';
import detect from 'util/detect';
import namespace from 'util/namespace';
import { createPopper } from '@popperjs/core';


const MOUSE_LEAVE_DELAY = 200;


/**
 * Tooltip component
 */
class Tooltip {

    static get Defaults () {
        return {
            // Popper placement
            'placement': '',

            // CSS selectors
            'textSelector': '.js-tooltip-text',

            // Allow HTML in the tooltip
            'html': false,

            // Events which trigger tooltip
            'trigger': 'click',

            // Event names
            'eventShow': 'show.tooltip',
            'eventShown': 'shown.tooltip',
            'eventHide': 'hide.tooltip',
            'eventHidden': 'hidden.tooltip',

            // Animations
            'animationIn': 'tooltip-in',
            'animationOut': 'tooltip-out',

            // Disabled classname
            'classNameOpen': 'is-open',
            'classNameDisabled': 'is-disabled',

            // Tooltip template
            'template': '<div class="tooltip ui-gray" role="tooltip"><div class="tooltip__arrow"></div><div class="tooltip__inner js-tooltip-text"></div></div>'
        };
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        
        if (options.trigger === 'hover' && !detect.hasHoverSupport()) {
            options.trigger = 'click';
        }
        
        this.ns = namespace();
        this.$container = $container;
        this.$tooltip = null;
        this.mouseLeaveTimer = null;
        this.popper = null;
        this.open = false;
        
        // Events
        $container
            .on('destroyed', this.handleDestroy.bind(this))
            .on('keydown', this.handleToggleKey.bind(this));

        if (options.trigger === 'hover') {
            $container
                .on('click', this.show.bind(this))
                .on('focus', this.show.bind(this))
                .on('blur', this.hide.bind(this))
                .on('mouseenter', this.handleMouseEnter.bind(this));
            
            $container
                .on('mouseleave', this.handleMouseLeave.bind(this));
        } else {
            $container
                .on('click', this.toggle.bind(this));
        }
    }

    /**
     * Returns tooltip element or creates a tooltip if it exists
     */
    getTooltipElement () {
        if (!this.$tooltip) {
            const $tooltip = this.$tooltip = $(this.options.template);
            const $text = $tooltip.find(this.options.textSelector);
            const text = this.$container.attr('title');

            if (this.options.html) {
                $text.html(text);
            } else {
                $text.text(text);
            }

            // Hide
            $tooltip.addClass('d-none');

            // Add to the document
            $(document.body).append($tooltip);

            // Events
            if (this.options.trigger === 'hover') {
                $tooltip
                    .on('mouseenter', this.handleMouseEnter.bind(this))
                    .on('mouseleave', this.handleMouseLeave.bind(this));
            }
        }

        return this.$tooltip;
    }

    /**
     * Show tooltip
     */
    show () {
        if (!this.isDisabled() && !this.open) {
            const { eventShow, classNameOpen } = this.options;
            const ns = this.ns;

            // Trigger event and show dropdown only if event wasn't prevented
            const showEventObject = $.Event(eventShow);
            this.$container.trigger(showEventObject);

            if (!showEventObject.isDefaultPrevented()) {
                this.open = true;

                this.$container.addClass(classNameOpen);

                this.getTooltipElement();
                this.createPopper();

                // ARIA
                const id = namespace();
                this.$container.attr('aria-describedby', id);
                this.$tooltip.attr('id', id);
    
                this.$tooltip.transitionstop(() => {
                    this.$tooltip.transition(this.options.animationIn, {
                        'before': this.onShow.bind(this, event),
                        'after': this.onShown.bind(this, event),
                    });
                });

                // Add event listeners
                $(document)
                    .on(`click.${ ns }`, this.handleDocumentClick.bind(this))

                // Prevent clicking on a button from submitting a form or link navigation
                if (event && event.type === 'click') {
                    event.preventDefault();
                }
            }
        }
    }

    /**
     * Update popper position
     * 
     * @param {jQuery.Event} [event] Optional event 
     * @protected
     */
    onShow (event) {
        this.updatePopper();
    }

    /**
     * After tooltip has been shown trigger 'shown' event
     * 
     * @param {jQuery.Event} [event] Optional event 
     * @protected
     */
    onShown (event) {
        const { eventShown } = this.options;
        this.$container.trigger(eventShown);
    }

    /**
     * Hide dropdown
     */
    hide (event) {
        if (!this.isDisabled() && this.open) {
            const { eventHide, classNameOpen } = this.options;
            const ns = this.ns;
            const hideEventObject = $.Event(eventHide);
            this.$container.trigger(hideEventObject);

            if (!hideEventObject.isDefaultPrevented()) {
                this.open = false;

                this.$container.removeClass(classNameOpen);

                this.$tooltip.transitionstop(() => {
                    this.$tooltip.transition(this.options.animationOut, {
                        'after': this.onHidden.bind(this, event),
                    });
                });

                $(document).off(`.${ ns }`);

                // Prevent clicking on a button from submitting a form or link navigation
                if (event && event.type === 'click') {
                    event.preventDefault();
                }
            }
        }
    }

    /**
     * After dropdown has been hidden trigger 'hidden' event and reset
     * indicator
     * 
     * @param {jQuery.Event} [event] Optional event 
     * @protected
     */
    onHidden (event) {
        const { eventHidden } = this.options;

        this.$container.removeAttr('aria-describedby');
        this.$container.trigger(eventHidden);
    }

    /**
     * Toggle dropdown
     */
    toggle (event) {
        if (this.open) {
            this.hide(event);
        } else {
            this.show(event);
        }
    }

    /**
     * Returns true if dropdown is disabled
     * 
     * @returns {boolean} True if disabled, otherwise false
     * @protected
     */
    isDisabled () {
        const $container = this.$container;
        return $container.hasClass(this.options.classNameDisabled) || $container.prop('disabled');
    }

    /**
     * Clean up dropdown
     * 
     * @protected
     */
    handleDestroy () {
        // Cleanup global events
        $(window).add(document).off(`.${ this.ns }`);
    }



    /**
     * Popper
     * ------------------------------------------------------------------------
     */

    /**
     * Create popper
     * 
     * @protected
     */
    createPopper () {
        if (!this.popper) {
            const $tooltip = this.getTooltipElement();

            // Show tooltip for poppoer to be able to read position
            $tooltip.removeClass('d-none').addClass('is-invisible');

            this.popper = createPopper(this.$container.get(0), $tooltip.get(0), {
                placement: this.options.placement,
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: ({ placement }) => {
                                if (placement.indexOf('start') !== -1) {
                                    return [-16, 16];
                                } else if (placement.indexOf('end') !== -1) {
                                    return [16, 16];
                                } else {
                                    return [0, 16];
                                }
                            },
                        },
                    },
                ],
            });

            requestAnimationFrame(() => {
                $tooltip.addClass('d-none').removeClass('is-invisible');
            });
        }
    }

    /**
     * Update popper position
     * 
     * @protected
     */
    updatePopper () {
        this.popper.update();
    }

    
    /**
     * Click mode
     * ------------------------------------------------------------------------
     */


    /**
     * Handle key press on the toggle element
     * 
     * @param {jQuery.Event} event Event
     * @protected
     */
    handleToggleKey (event) {
        if (!this.open && event.key === 'Enter') {
            this.show(event);      
            event.preventDefault();          
        } else if (this.open && event.key === 'Escape') {
            this.hide(event);      
            event.preventDefault();          
        }
    }

    /**
     * Handle click on document
     * Close dropdown if necessary
     * 
     * @param {jQuery.Event} event Event
     * @protected
     */
    handleDocumentClick (event) {
        const $target = $(event.target);
        
        if (!$target.closest(this.$container).length && !$target.closest(this.$tooltip).length) {
            this.hide();
        }
    }


    /**
     * Hover mode
     * ------------------------------------------------------------------------
     */

     /**
      * On mouse enter reset leave timer or show the menu
      * 
      * @protected
      */
    handleMouseEnter () {
        if (this.mouseLeaveTimer) {
            clearTimeout(this.mouseLeaveTimer);
            this.mouseLeaveTimer = null;
        }

        this.show();
    }

    /**
      * On mouse leave wait before hiding menu
      * 
      * @protected
      */
    handleMouseLeave () {
        this.mouseLeaveTimer = setTimeout(() => {
            this.mouseLeaveTimer = null;
            this.hide();
        }, MOUSE_LEAVE_DELAY);
    }

}

$.fn.tooltip = createPlugin(Tooltip);

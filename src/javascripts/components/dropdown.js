/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';

import 'util/animation/jquery.transition';
import 'util/jquery.destroyed';
import detect from 'util/detect';
import namespace from 'util/namespace';
import { createPopper } from '@popperjs/core';


const MOUSE_LEAVE_DELAY = 200;


/**
 * Dropdown component
 */
class Dropdown {

    static get Defaults () {
        return {
            // Popper placement
            'placement': '',

            'menuToggleSelector': '.dropdown__toggle',
            'menuSelector': '.dropdown__menu',
            'menuContentSelector': '.dropdown__menu__content',
            'arrowSelector': '.dropdown__menu__arrow',
            'itemSelector': '.dropdown__item',

            // Dropdown position classnames
            'classNamePositionUp': 'dropdown--up',
            'classNamePositionRight': 'dropdown--right',
            'classNamePositionLeft': 'dropdown--left',

            // Toggle mode, either 'click' or 'hover'
            'toggleMode': 'click',

            // Event names
            'eventShow': 'show.dropdown',
            'eventShown': 'shown.dropdown',
            'eventHide': 'hide.dropdown',
            'eventHidden': 'hidden.dropdown',

            // State classnames
            'classNameOpen': 'is-open',
            'classNameDisabled': 'is-disabled',
            'classNameActive': 'is-active',
            'classNameFocused': 'is-focused',

            'classNameToggleActive': 'is-active',

            'classNameIndicator': 'dropdown__menu__indicator',
            'classNameIndicatorDropdown': 'dropdown__menu__indicator--dropdown',
        };
    }

    constructor ($container, opts) {
        const options = this.options = $.extend({}, this.constructor.Defaults, opts);

        if (options.toggleMode === 'hover' && !detect.hasHoverSupport()) {
            options.toggleMode = 'click';
        }

        this.$container = $container;
        this.$toggle = $container.children(options.menuToggleSelector);
        this.$menu = $container.children(options.menuSelector);
        this.$menuContent = this.$menu.children(options.menuContentSelector);
        this.$arrow = this.$menuContent.children(options.arrowSelector);
        this.$indicator = $(`<div class="${ options.classNameIndicator }"></div>`).prependTo(this.$menuContent);
        this.indicatorPositioned = false;

        this.$focused = null;
        this.mouseLeaveTimer = null;
        this.popper = false;

        this.ns = namespace();
        this.open = $container.attr('aria-expanded') == 'true';
        this.placement =
            options.placement || (
                $container.hasClass(options.classNamePositionUp) ? 'top-start' :
                $container.hasClass(options.classNamePositionRight) ? 'right-start' : 
                $container.hasClass(options.classNamePositionLeft) ? 'left-start' : 'bottom-start'
            );
        
        this.position =
            this.placement.indexOf('bottom') !== -1 ? 'bottom' :
            this.placement.indexOf('top') !== -1 ? 'top' :
            this.placement.indexOf('left') !== -1 ? 'left' : 'right';
            
        // Clean up global events to prevent memory leaks and errors, if pages are dynamically loaded using JS
        // Needed only if attaching listeners to document, window, body or element outside the #ajax-page-loader-wrapper
        // Requires util/jquery.destroyed.js */
        $container.on('destroyed', this.handleDestroy.bind(this));

        // // Global events
        // $(window).on(`resize.${ this.ns }`, this.handleResize.bind(this));
        
        this.$toggle
            .on('keydown', this.handleToggleKey.bind(this));

        if (options.toggleMode === 'hover') {
            this.$toggle
                .on('click', this.show.bind(this))
                .on('mouseenter', this.handleMouseEnter.bind(this));
            
            this.$container
                .on('mouseleave', this.handleMouseLeave.bind(this));
        } else {
            this.$toggle
                .on('click', this.toggle.bind(this));
        }
    }

    /**
     * Toggle dropdown
     */
    toggle (event) {
        if (this.open) {
            this.hide();
        } else {
            this.show(event);
        }
    }

    /**
     * Show dropdown
     * 
     * @param {jQuery.Event} [event] Optional event 
     */
    show (event) {
        if (!this.isDisabled() && !this.open) {
            const { eventShow, eventShown, itemSelector, classNameOpen, classNameToggleActive } = this.options;
            const namespace = this.ns;
            const showEventObject = $.Event(eventShow);
            this.$container.trigger(showEventObject);

            if (!showEventObject.isDefaultPrevented()) {
                this.open = true;

                this.$container.addClass(classNameOpen);
                this.$toggle.addClass(classNameToggleActive).attr('aria-expanded', true);

                this.createPopper();
    
                this.$menu.transitionstop(() => {
                    
                    this.$menu.transition(`dropdown-in`, {
                        'before': () => {
                            this.updatePopper();

                            if (event && event.type === 'keydown') {
                                // Dropdown was opened using keyboard, focus active item
                                // or first item we have
                                if (!this.focusActiveItem()) {
                                    this.focusFirstItem();
                                }
                            } else {
                                // Dropdown was opened using mouse, focus only if there is
                                // an active item
                                this.focusActiveItem();
                            }
                        },
                        'after': () => {
                            this.$container.trigger(eventShown);
                        }
                    });
                });

                $(document)
                    .on(`click.${ namespace }`, this.handleDocumentClick.bind(this))
                    .on(`keydown.${ namespace }`, this.handleDocumentKey.bind(this));

                this.$menu
                    .on(`focus.${ namespace } mouseenter.${ namespace }`, itemSelector, this.handleItemMouseEnter.bind(this))
                    .on(`keydown.${ namespace }`, itemSelector, this.handleKey.bind(this));
            }
        }
    }

    /**
     * Hide dropdown
     */
    hide () {
        if (!this.isDisabled() && this.open) {
            const { eventHide, eventHidden, classNameOpen, classNameToggleActive } = this.options;
            const namespace = this.ns;
            const event = $.Event(eventHide);
            this.$container.trigger(event);

            if (!event.isDefaultPrevented()) {
                this.open = false;

                this.$container.removeClass(classNameOpen);
                this.$toggle.removeClass(classNameToggleActive).attr('aria-expanded', false);

                this.$menu.transitionstop(() => {
                    this.$menu.transition(`dropdown-out`, {
                        'after': () => {
                            this.$container.trigger(eventHidden);
                            this.positionIndicator(null);

                            // Unfocus item
                            if (this.$focused) {
                                this.blurItem(this.$focused);
                                this.positionIndicator();
                            }
                        }
                    });
                });

                // Focused element inside the dropdown
                if ($(document.activeElement).closest(this.$menu).length) {
                    this.$toggle.get(0).focus();
                }

                $(document).off(`.${ namespace }`);
                this.$menu.off(`.${ namespace }`);
            }
        }
    }

    /**
     * Returns list of all items
     * 
     * @returns {jQuery} List of all items
     * @protected
     */
    getItems () {
        const { itemSelector, menuSelector, classNameDisabled } = this.options;
        const $menu = this.$menu;
        return $menu.find(itemSelector).not($menu.find(`${ menuSelector} ${ itemSelector }`)).not(`.${ classNameDisabled }`);
    }

    /**
     * Returns active item
     * 
     * @returns {jQuery} Active item
     * @protected
     */
    getActiveItem () {
        return this.getItems().filter(`.${ this.options.classNameActive }`);
    }

    /**
     * Returns next item
     * 
     * @param {jQuery} $item Item for which to return next item
     * @returns {jQuery} Next item
     * @protected
     */
    getNextItem ($item) {
        const $items = this.getItems();

        if ($item && $item.length) {
            const index = $items.index($item);
            const nextIndex = index === -1 ? 0 : (index + 1) % $items.length;
            return $items.eq(nextIndex);
        }  else {
            return $items.eq(0);
        }
    }

    /**
     * Returns previous item
     * 
     * @param {jQuery} $item Item for which to return previous item
     * @returns {jQuery} Previous item
     * @protected
     */
    getPreviousItem ($item) {
        const $items = this.getItems();

        if ($item && $item.length) {
            const index = $items.index($item);
            const previousIndex = index === -1 ? 0 : (index + $items.length - 1) % $items.length;
            return $items.eq(previousIndex);
        }  else {
            return $items.eq(-1);
        }
    }

    /**
     * Focus item element
     * 
     * @param {jQuery} $item Item element
     */
    focusItem ($item) {
        const { classNameFocused } = this.options;
        
        if (this.$focused && this.$focused.length && !this.$focused.is($item)) {
            this.blurItem(this.$focused);
        }
        
        if ($item && $item.length) {
            if (!this.$focused || !this.$focused.is($item)) {
                this.$focused = $item;
                this.positionIndicator($item);
                $item.addClass(classNameFocused);
            }

            if (document.activeElement !== $item.get(0)) {
                $item.get(0).focus();
            }
        }
    }

    /**
     * Remove focus from item element
     * 
     * @param {jQuery} $item Item element
     */
    blurItem ($item) {
        const { classNameFocused, menuToggleSelector } = this.options;
        
        $item.removeClass(classNameFocused);
        
        if ($item.is(menuToggleSelector)) {
            const $dropdown = $item.parent();
            if ($.app.hasPlugin($dropdown, 'dropdown')) {
                $dropdown.dropdown('hide');
            }
        }
        
        if (this.$focused && this.$focused.is($item)) {
            this.$focused = null;
        }
    }

    /**
     * Focus active item in the list
     * 
     * @returns {boolean} True if active item was focused, otherwise false
     */
    focusActiveItem () {
        const $active = this.getActiveItem();

        if ($active.length) {
            this.focusItem($active);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Focus first item in the list
     */
    focusFirstItem () {
        const $first = this.getItems().eq(0);

        if ($first.length) {
            this.focusItem($first);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Focus last item in the list
     */
    focusLastItem () {
        const $last = this.getItems().eq(-1);

        if ($last.length) {
            this.focusItem($last);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Focus next item in the list
     */
    focusNextItem () {
        const $nextItem = this.getNextItem(this.$focused);

        if ($nextItem.length) {
            this.focusItem($nextItem);
        }
    }

    /**
     * Focus previous item in the list
     */
    focusPreviousItem () {
        const $previousItem = this.getPreviousItem(this.$focused);

        if ($previousItem.length) {
            this.focusItem($previousItem);
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
     * Handle mouseover the item
     * 
     * @param {object} event Event
     * @protected
     */
    handleItemMouseEnter (event) {
        const $items = this.getItems();
        const $item = $(event.target);

        if ($items.index($item) !== -1) {
            this.focusItem($item);
        }
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
     * Keyboard navigation
     * ------------------------------------------------------------------------
     */

    /**
     * Handle key press on one of the items
     * 
     * @param {jQuery.Event} event Event
     * @protected
     */
    handleKey (event) {
        const $item = $(event.target);

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            const $items = this.getItems();

            if ($items.index($item) !== -1) {
                if (event.key === 'ArrowDown') {
                    this.focusNextItem();
                } else {
                    this.focusPreviousItem();
                }

                event.preventDefault();
            }               
        } else if (event.key === 'Escape') {
            this.hide();
        } else if ((this.position === 'left' && event.key === 'ArrowRight') || (this.position === 'right' && event.key === 'ArrowLeft')) {
            this.hide(); 
        }
    }

    /**
     * Handle key press on the toggle element
     * 
     * @param {jQuery.Event} event Event
     * @protected
     */
    handleToggleKey (event) {
        if (!this.open) {
            if (
                (this.position === 'bottom' && event.key === 'ArrowDown') ||
                (this.position === 'top' && event.key === 'ArrowUp') ||
                (this.position === 'left' && event.key === 'ArrowLeft') ||
                (this.position === 'right' && event.key === 'ArrowRight') ||
                (event.key === 'Enter')
             ) {
                this.show(event);      
                event.preventDefault();          
            }
        }
    }

    /**
     * Handle key press on the document element
     * 
     * @param {jQuery.Event} event Event
     * @protected
     */
    handleDocumentKey (event) {
        // Dropdown is open, but none of the elements inside of it are focused, so
        // keyboard events are not captured
        if (this.open && !$(event.target).closest(this.$menu).length) {
            if (!this.$focused) {
                if (event.key === 'ArrowDown') {
                    this.focusFirstItem();
                    event.preventDefault();
                } else if (event.key === 'ArrowUp') {
                    this.focusLastItem();
                    event.preventDefault();
                }
            }
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
        
        if (!$target.closest(this.$container).length) {
            this.hide();
        }
    }


    /**
     * Indicator
     * ------------------------------------------------------------------------
     */

    /**
     * Position indicator below the item
     * 
     * @param {jQuery} $item Item element
     * @protected
     */
    positionIndicator ($item) {
        if ($item && $item.length) {
            const menuBox = this.$menuContent.get(0).getBoundingClientRect();
            const itemBox = $item.get(0).getBoundingClientRect();
    
            this.$indicator
                .toggleClass(this.options.classNameIndicatorDropdown, $item.parent().hasClass('dropdown'))
                .css({
                    'width': itemBox.width,
                    'height': itemBox.height,
                    'transform': `translate(${ itemBox.left - menuBox.left }px, ${ itemBox.top - menuBox.top }px)`,
                    'opacity': 1
                });
            
            if (!this.indicatorPositioned) {
                this.$indicator.css('transition', 'none');

                requestAnimationFrame(() => {
                    this.$indicator.css('transition', '');
                });
            }
            this.indicatorPositioned = true;
        } else {
            this.$indicator
                .css({
                    'opacity': 0
                });

            this.indicatorPositioned = false;
        }
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
            const $menu = this.$menu;
            const isSubDropdown = !!this.$container.parent().closest('.dropdown').length;

            // Show menu for poppoer to be able to read position
            $menu.removeClass('d-none').addClass('is-invisible');

            this.popper = createPopper(this.$toggle.get(0), $menu.get(0), {
                placement: this.placement,
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: ({ placement }) => {
                                if (isSubDropdown) {
                                    return [placement.indexOf('start') !== -1 ? -24 : 24, 24];
                                } else {
                                    return [placement.indexOf('start') !== -1 ? -16 : 16, 16];
                                }
                            },
                        },
                    },
                ],
            });

            requestAnimationFrame(() => {
                $menu.addClass('d-none').removeClass('is-invisible');
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
        this.placement = this.popper.state.placement;
        this.position =
            this.placement.indexOf('bottom') !== -1 ? 'bottom' :
            this.placement.indexOf('top') !== -1 ? 'top' :
            this.placement.indexOf('left') !== -1 ? 'left' : 'right';
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

$.fn.dropdown = createPlugin(Dropdown);

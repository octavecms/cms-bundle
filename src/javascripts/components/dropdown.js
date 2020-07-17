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
            'menuToggle': '.dropdown__toggle',
            'menuSelector': '.dropdown__menu',
            'menuContentSelector': '.dropdown__menu__content',
            'arrowSelector': '.dropdown__menu__arrow',
            'itemSelector': '.dropdown__item',

            // Dropdown position classnames
            'classNamePositionUp': 'dropdown--up',
            'classNamePositionRight': 'dropdown--right',
            'classNamePositionLeft': 'dropdown--left',

            // Events which trigger toggle
            'showTrigger': 'click returnkey',

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
        this.$toggle = $container.children(options.menuToggle);
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
        this.position =
            $container.hasClass(options.classNamePositionUp) ? 'top' :
            $container.hasClass(options.classNamePositionRight) ? 'right' : 
            $container.hasClass(options.classNamePositionLeft) ? 'left' : 'bottom';
        this.placement =
            $container.hasClass(options.classNamePositionUp) ? 'top-start' :
            $container.hasClass(options.classNamePositionRight) ? 'right-start' : 
            $container.hasClass(options.classNamePositionLeft) ? 'left-start' : 'bottom-start';

        // Clean up global events to prevent memory leaks and errors, if pages are dynamically loaded using JS
        // Needed only if attaching listeners to document, window, body or element outside the #ajax-page-loader-wrapper
        // Requires util/jquery.destroyed.js */
        $container.on('destroyed', this.handleDestroy.bind(this));

        // // Global events
        // $(window).on(`resize.${ this.ns }`, this.handleResize.bind(this));
        
        this.$toggle
            .on('click', this.toggle.bind(this))
            .on('keydown', this.handleToggleKey.bind(this));

        if (options.toggleMode === 'hover') {
            this.$toggle
                .on('mouseenter', this.handleMouseEnter.bind(this));
            
            this.$container
                .on('mouseleave', this.handleMouseLeave.bind(this));
        }
    }

    toggle () {
        if (this.open) {
            this.hide();
        } else {
            this.show();
        }
    }

    show () {
        if (!this.isDisabled() && !this.open) {
            const { eventShow, eventShown, itemSelector, classNameOpen } = this.options;
            const namespace = this.ns;
            const event = $.Event(eventShow);
            this.$container.trigger(event);

            if (!event.isDefaultPrevented()) {
                this.open = true;

                this.$container.addClass(classNameOpen);
                this.$toggle.attr('aria-expanded', true);

                this.createPopper();
    
                this.$menu.transitionstop(() => {
                    
                    this.$menu.transition(`dropdown-in`, {
                        'before': () => {
                            this.updatePopper();
                            this.focusActiveItem();
                        },
                        'after': () => {
                            this.$container.trigger(eventShown);
                        }
                    });
                });

                $(document).on(`click.${ namespace }`, this.handleDocumentClick.bind(this));

                this.$menu
                    .on(`focus.${ namespace } mouseenter.${ namespace }`, itemSelector, this.handleItemMouseEnter.bind(this))
                    .on(`keydown.${ namespace }`, itemSelector, this.handleKey.bind(this));
            }
        }
    }

    hide () {
        if (!this.isDisabled() && this.open) {
            const { eventHide, eventHidden, classNameOpen } = this.options;
            const namespace = this.ns;
            const event = $.Event(eventHide);
            this.$container.trigger(event);

            if (!event.isDefaultPrevented()) {
                this.open = false;

                this.$container.removeClass(classNameOpen);
                this.$toggle.attr('aria-expanded', false);

                this.$menu.transitionstop(() => {
                    this.$menu.transition(`dropdown-out`, {
                        'after': () => {
                            this.$container.trigger(eventHidden);
                            this.positionIndicator(null);
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

    getItems () {
        const { itemSelector, menuSelector, classNameDisabled } = this.options;
        const $menu = this.$menu;
        return $menu.find(itemSelector).not($menu.find(`${ menuSelector} ${ itemSelector }`)).not(`.${ classNameDisabled }`);
    }
    getActiveItem () {
        return this.getItems().filter(`.${ this.options.classNameActive }`);
    }
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

    blurItem ($item) {
        const { classNameFocused, menuToggle } = this.options;
        
        $item.removeClass(classNameFocused);
        
        if ($item.is(menuToggle)) {
            const $dropdown = $item.parent();
            if ($.app.hasPlugin($dropdown, 'dropdown')) {
                $dropdown.dropdown('hide');
            }
        }
        
        if (this.$focused && this.$focused.is($item)) {
            this.$focused = null;
        }
    }

    focusActiveItem () {
        const $active = this.getActiveItem();
        const $focus = $active.length ? $active : this.getItems().eq(0);

        this.focusItem($focus);
    }

    focusNextItem () {
        const $nextItem = this.getNextItem(this.$focused);

        if ($nextItem.length) {
            this.focusItem($nextItem);
        }
    }

    focusPreviousItem () {
        const $previousItem = this.getPreviousItem(this.$focused);

        if ($previousItem.length) {
            this.focusItem($previousItem);
        }
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
     * Handle key press on one of the items
     * 
     * @param {object} event Event
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
            }               
        } else if (event.key === 'Escape') {
            this.hide();
        } else if ((this.position === 'left' && event.key === 'ArrowRight') || (this.position === 'right' && event.key === 'ArrowLeft')) {
            this.hide(); 
        }
    }

    handleToggleKey (event) {
        if (!this.open) {
            if (
                (this.position === 'bottom' && event.key === 'ArrowDown') ||
                (this.position === 'top' && event.key === 'ArrowUp') ||
                (this.position === 'left' && event.key === 'ArrowLeft') ||
                (this.position === 'right' && event.key === 'ArrowRight')
             ) {
                this.show();                
            }
        }
    }

    handleDocumentClick (event) {
        const $target = $(event.target);
        
        if (!$target.closest(this.$container).length) {
            this.hide();
        }
    }


    /**
     * Indicator
     */

    /**
     * Position indicator below the item
     * 
     * @param {object} $item Item element
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
                    'transform': `translate(${ itemBox.left - menuBox.left }px, ${ itemBox.top - menuBox.top }px)`
                });
            
            if (!this.indicatorPositioned) {
                this.$indicator.css('transition', 'none');

                requestAnimationFrame(() => {
                    this.$indicator.css('transition', '');
                });
            }
            this.indicatorPositioned = true;
        } else {
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
            const isSubDropdown = !!this.$container.parent().closest('.dropdown').length;

            this.popper = createPopper(this.$toggle.get(0), this.$menu.get(0), {
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

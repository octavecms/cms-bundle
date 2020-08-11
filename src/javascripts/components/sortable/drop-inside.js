import Sortable from "sortablejs";

function DropInsidePlugin () {
    let dragEl;
    let dropInsideEl;
    let isDragging = false;
    let holdTimer = null;

    /**
     * Sortable DropInside plugin
     * Plugin detect when item is dropped inside the target
     * 
     * @param {Sortable} sortable Sortable instance
     * @param {HTMLElement} el Element
     * @param {object} options Sortable options
     */
    function DropInside (sortable, el, options) {
        if (options.dropInside) {
            this.target = null;
            this.isRoot = !el.parentElement.matches(options.draggable);
            this.rootEl = null;
            
            if (typeof options.onDropInside === 'function') {
                el.addEventListener('dropInside', options.onDropInside, false);
            }
            if (typeof options.onDropHold === 'function') {
                el.addEventListener('dropHold', options.onDropHold, false);
            }

            // Detect leave event
            if (this.isRoot) {
                this.dragLeave = this.dragLeave.bind(this);
                el.addEventListener('dragleave', this.dragLeave, false);

                this.dragEnd = this.dragEnd.bind(this);
                document.addEventListener('dragend', this.dragEnd, false);
            }
        }
    }

    DropInside.prototype = {
        /**
         * Destructor, clean up events when plugin is destroyed
         */
        destroy () {
            this.sortable.el.removeEventListener('dragleave', this.dragLeave, false);
            document.removeEventListener('dragend', this.dragEnd, false);
        },

        delayStartGlobal(event) {
            dragEl = event.dragEl;
            dropInsideEl = null;
            isDragging = true;
        },

        dragLeave (event) {
            if (this.sortable.nativeDraggable && isDragging) {
                let related = event.relatedTarget;

                while (related && related !== document.body) {
                    if (related === this.sortable.el) {
                        return;
                    } else {
                        related = related.parentNode;
                    }
                }

                // Draggable left the area
                this.setTarget(null);
            }
        },

        dragOver (event) {
            if (this.options.dropInside) {
                let target = event.target;

                if (target === this.sortable.el) {
                    // Dropping inside the root list, ignoring it
                    target = null;
                }

                // Make sure we are not dropping inside the child element
                if (target) {
                    let parent = target.parentElement;
                    while (parent && parent !== document.body) {
                        if (parent === event.dragEl) {
                            return;
                        } else {
                            parent = parent.parentElement;
                        }
                    }
                }

                this.setTarget(target);
            }
        },

        dragEnd (event) {
            this.drop(event);
            this.nulling();
        },

        setTarget (target) {
            if (target !== dragEl && target !== dropInsideEl) {
                // Unset styles
                const dropInsideClass = this.options.dropInsideClass;

                if (dropInsideEl) {
                    dropInsideEl.classList.remove(dropInsideClass);
                }
                if (target) {
                    target.classList.add(dropInsideClass);
                }

                if (holdTimer) {
                    clearTimeout(holdTimer);
                    holdTimer = null;
                }

                if (target && this.options.holdTimeout) {
                    holdTimer = setTimeout(this.triggerHold.bind(this), this.options.holdTimeout);
                }

                dropInsideEl = target;
            }
        },

        drop (event) {
            if (this.options.dropInside) {
                const dropInsideClass = this.options.dropInsideClass;
                
                if (dropInsideEl) {
                    dropInsideEl.classList.remove(dropInsideClass);
                    this.dispatchEvent('dropInside', {
                        originalEvent: event,
                        sortable: this.sortable,
                        rootEl: this.sortable.el,
                    });
                }
            }
        },

        triggerHold (event) {
            this.dispatchEvent('dropHold', {
                originalEvent: event,
                sortable: this.sortable,
                rootEl: this.sortable.el,
            });
        },

        /**
         * Cleanup
         */
        nulling () {
            dragEl = null;
            dropInsideEl = null;
            isDragging = false;

            if (holdTimer) {
                clearTimeout(holdTimer);
                holdTimer = null;
            }
        },

        /**
         * Trigger event on sortable
         * 
         * @param {string} name Event name
         * @param {object} evt Event
         * @protected
         */
        dispatchEvent (name, { originalEvent: originalEvt, rootEl, sortable }) {
            const evt = new CustomEvent(name, {
                bubbles: true,
                cancelable: true
            });

            evt.rootEl = rootEl;
            evt.dropInsideEl = dropInsideEl;
            evt.targetEl = dragEl;
            evt.dragEl = dragEl;
            evt.originalEvt = originalEvt;
            evt.sortable = sortable;

            rootEl.dispatchEvent(evt);
        },
    };

	return Object.assign(DropInside, {
		// Static methods & properties
        pluginName: 'dropInside',
    });
}


export default DropInsidePlugin;
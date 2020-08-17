/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';
import namespace from 'util/namespace';


/**
 * Plugin which updates tooltip text and shows / hides content when
 * section active state changes
 */
class ActiveState {

    static get Defaults () {
        return {
            'inputSelector':   '.js-active-state-input',
            'tooltipSelector': '.js-active-state-tooltip',
            'hiddenSelector':  '.js-active-state-hidden-active',
            'visibleSelector': '.js-active-state-visible-active',

            'setActiveSelector': '.js-active-state-set-active',
            'setInactiveSelector': '.js-active-state-set-inactive',

            // URL which to use to save data
            'saveUrl': null
        };
    }

    constructor ($container, opts) {
        this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$input = $();
        this.$tooltip = $();
        this.$hidden = $();
        this.$visible = $();
        this.$setActive = $();
        this.$setInactive = $();
        this.ns = namespace();
        this.savedState = null;
        this.refresh();
    }

    /**
     * Re-attach listeners and find elements
     */
    refresh () {
        const ns = this.namespace;
        const options = this.options;
        const $container = this.$container;

        this.$tooltip = $container.find(options.tooltipSelector);
        this.$hidden = $container.find(options.hiddenSelector);
        this.$visible = $container.find(options.visibleSelector);

        this.$input.off(`.${ ns }`);
        this.$input = $container.find(options.inputSelector);
        this.$input.on(`change.${ ns }`, this.update.bind(this));

        this.$setActive.off(`.${ ns }`);
        this.$setActive = $container.find(options.setActiveSelector);
        this.$setActive.on(`click.${ ns } returnkey.${ ns }`, this.setState.bind(this, true));

        this.$setInactive.off(`.${ ns }`);
        this.$setInactive = $container.find(options.setInactiveSelector);
        this.$setInactive.on(`click.${ ns } returnkey.${ ns }`, this.setState.bind(this, false));

        this.savedState = this.$input.prop('checked');
    }

    /**
     * Update state
     */
    update () {
        const state = this.$input.prop('checked');

        this.updateTooltip(state);

        this.$hidden.toggleClass('d-none', state);
        this.$visible.toggleClass('d-none', !state);

        this.save();
    }

    /**
     * Update tooltip text
     *
     * @param {boolean} state Active state
     * @protected
     */
    updateTooltip (state) {
        const $tooltip = this.$tooltip;

        if ($tooltip.length) {
            const text = state ? $tooltip.data('activeStateActiveText') : $tooltip.data('activeStateInactiveText');
            $tooltip.tooltip('setContent', text);
        }
    }

    /**
     * Change active state
     *
     * @param {boolean} state State
     * @param {JQuery.ChangeEvent} [event] Event
     */
    setState (state, event) {
        const prevState = this.$input.prop('checked');

        if (prevState !== state) {
            this.$input.prop('checked', state).change();
        }

        if (event) {
            event.preventDefault();
        }
    }

    /**
     * Save
     */
    save () {
        const url = this.options.saveUrl;

        if (url) {
            const $input = this.$input;
            const checked = $input.prop('checked');

            if (checked !== this.savedState) {
                const name = $input.attr('name');
                const id = $input.val();
                const data = {
                    id: id
                };

                data[name] = checked ? 1 : 0;

                $.ajax({
                    'url': url,
                    'method': 'GET',
                    'data': data
                })
                    .done((response) => {
                        if (response && response.status) {
                            this.savedState = checked;
                        } else {
                            this.handleSaveFailure();
                        }
                    })
                    .fail(this.handleSaveFailure.bind(this));
            }
        }
    }

    handleSaveFailure () {
        this.$input.prop('checked', this.savedState).change();
    }
}

$.fn.activeState = createPlugin(ActiveState);

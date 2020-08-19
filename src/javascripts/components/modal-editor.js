import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

import 'util/jquery.destroyed';
import 'components/modal';

import getFormValues, { getInputValue } from 'util/form/get-form-values';
import Modal from 'components/modal';
import { setInputValue } from '../util/form/set-form-values';


// Data property which holds list of input names from which to read modal form values
const TRIGGER_SOURCE_INPUT_DATA_PROPERTY = 'modal-editor-source-inputs';

// Regex to find last part of the input name "aaa[bbb][ccc]" => "ccc"
const REGEX_NAME_PART = /\[(.+?)]$/;


/**
 * Modal editor which is for editing values stored in inputs
 *
 * When modal is open values from the inputs are read, json decoded and modal inputs values are set
 * When modal is saved modal input values are json encoded and saved into inputs
 */
export default class ModalEditor extends Modal {

    static get Defaults () {
        return assign({}, Modal.Defaults, {
            // Save button selector
            'saveSelector': '.js-modal-save',
        });
    }

    /**
     * Attach modal event listeners
     *
     * @protected
     */
    attachModalListeners () {
        super.attachModalListeners();

        // Save modal on special save button click
        this.$container.on(`click.${ this.namespace } returnkey.${ this.namespace }`, this.options.saveSelector, this.handleSaveClick.bind(this));
    }

    /**
     * Called before modal show animation starts
     *
     * @protected
     */
    beforeModalShow () {
        super.beforeModalShow();

        const values = this.getFormValuesForEditor();
        setFormValues(this.$container, values);
    }

    /**
     * Save and close
     *
     * @protected
     */
    handleSaveClick (event) {
        if (!event.isDefaultPrevented()) {
            event.preventDefault();
            this.hideDebounced();

            const values = getFormValues(this.$container);
            this.saveFormValuesFromEditor(values);
        }
    }

    /**
     * Returns values from the inputs, decodes using JSON where needed
     *
     * @returns {object} Input values
     * @Protected
     */
    getFormValuesForEditor () {
        const $inputs = this.getSourceFormInputs();
        const values = {};

        for (let i = 0; i < $inputs.length; i++) {
            const $input = $inputs.eq(i);
            const value = getInputValue($input);
            const name = this.getFormInputNamePart($input);
            values[name] = value;
        }

        return values;
    }

    /**
     * Saves values into the inputs by encoding them as JSON where needed
     *
     * @param {object} values Input values
     * @protected
     */
    saveFormValuesFromEditor (values) {
        const $inputs = this.getSourceFormInputs();

        for (let i = 0; i < $inputs.length; i++) {
            const $input = $inputs.eq(i);
            const name = this.getFormInputNamePart($input);

            setInputValue($input, values[name]);
        }
    }

    /**
     * Returns list of inputs from which to read modal editor form values
     *
     * @returns {JQuery} List of inputs
     * @protected
     */
    getSourceFormInputs () {
        const $trigger = this.$trigger;
        const inputSelectors = $trigger.data(TRIGGER_SOURCE_INPUT_DATA_PROPERTY);
        let   $inputs = $();

        if (inputSelectors && inputSelectors.length) {
            for (let i = 0; i < inputSelectors.length; i++) {
                $inputs = $inputs.add($(`[name="${ inputSelectors[i] }"]`));
            }
        }

        return $inputs;
    }

    /**
     * Returns last part of the input name, "aaa[bbb][ccc]" -> "ccc"
     *
     * @param {JQuery} $input Input
     * @returns {string} Last part of the input name
     * @protected
     */
    getFormInputNamePart ($input) {
        const name = $input.attr('name');
        const namePart = name.match(REGEX_NAME_PART);

        return namePart ? namePart[1] : name;
    }

}


$.fn.modalEditor = createPlugin(ModalEditor, {
    'api': ['show', 'hide', 'toggle', 'instance'] // list of methods available using .modal('METHOD_NAME')
});

/**
 * Ajax form
 *
 * Form is validated on client-side and then data is sent to server-side, after
 * which either error messages are shown or success message is shown
 *
 * For validation is used https://jqueryvalidation.org/ plugin
 */

import $ from 'util/jquery';
import assign from 'lodash/assign';

import each from 'lodash/each';
import reduce from 'lodash/reduce';
import debounce from 'lodash/debounce';
import createPlugin from 'jquery-plugin-generator';

import 'util/jquery.serializeobject';
import 'util/animation/jquery.transition';
import 'components/jquery.transition-sequences';
import 'components/form/jquery-validation';


/*
 * Define default error messages which are not in $.validator by default
 *
 * IMPORTANT, DO NOT USE FOR LOCALIZATION!!!
 * For localization define window.LOCALES.errors in .html
 */
assign($.validator.messages, {
    'tel': 'Please enter a valid phone number.',

    // Error message when connection is down
    'generic': 'Connection error, please try again!',

    // Error message when server responds with >= 400 error code
    'genericCode': 'Error occured, please try again!'
}, $.validator.messages, window.LOCALES && window.LOCALES.errors);


export default class AjaxForm {

    static get Defaults () {
        return {
            // Whether to use ajax to submit form
            'useAjax': true,

            // If form was submitted and ajax responded with success, then
            // redirect page to this URL
            'successRedirectUrl': false,

            // If form was submitted and ajax responded with success, then
            // reload page
            'successReload': false,

            // Automatically save on input change
            'autoSave': false,

            // Animations
            'animationIn': 'fade-in',
            'animationOut': 'fade-out'
        };
    }


    constructor ($form, opts = {}) {
        this.options       = assign({}, this.constructor.Defaults, opts);

        this.$form         = $form;
        this.$errorMessage = $form.find('.js-form-error-message');

        this.customValidators = [];
        this.customResponseHandlers = [];
        this.isLoading = false;
        this.formName  = $form.attr('name') || '';

        $form.on('reset', this.reset.bind(this));

        if (this.options.autoSave) {
            $form.on('change', debounce(this.submit.bind(this), 250));
        }

        if ($.fn.validate) {
            this.validator = $form.validate(assign({
                submitHandler: this.onsuccess.bind(this),
                invalidHandler: this.onerror.bind(this),
                errorPlacement: this.errorPlacement.bind(this),
                highlight: this.errorHighlight.bind(this),
                unhighlight: this.errorUnhighlight.bind(this)
            }, this.getValidationOptions()));
        } else {
            // jQuery validation plugin is missing
            $form.on('submit', (event) => {
                if (this.options.useAjax) {
                    event.preventDefault();
                }

                this.submit();
            });
        }
    }

    /**
     * Returns validation options for form validator
     * See http://jqueryvalidation.org/
     *
     * @returns {object} Validation rules
     * @protected
     */
    getValidationOptions () {
        return {
            'rules': {}
        };
    }

    /**
     * Returns form values
     *
     * @returns {object} Form values
     * @protected
     */
    getFormValues () {
        const $form = this.$form;
        const values = $form.serializeObject();

        // If values needs to be transformed, it should be done here
        return values;
    }

    /**
     * Returns form data object
     *
     * @returns {FormData} Form data
     * @protected
     */
    getFormData () {
        return new FormData(this.$form.get(0));
    }


    /**
     * Reset form
     */
    reset () {
        if (this.validator) {
            this.validator.resetForm();
        }

        this.hideSuccessMessage();
        this.hideGenericErrorMessage();
    }

    /**
     * Disable form
     */
    disable () {
        const $form  = this.$form;

        // Select elements don't have "readonly" attribute
        $form.find('input, select, textarea').prop('readonly', true).addClass('readonly');
        $form.find('button[type="submit"], input[type="submit"]').prop('disabled', true);
    }

    /**
     * Enable form
     */
    enable () {
        const $form  = this.$form;

        // Select elements don't have "readonly" attribute
        $form.find('input, select, textarea').prop('readonly', false).removeClass('readonly');
        $form.find('button[type="submit"], input[type="submit"]').prop('disabled', false);
    }


    /*
     * Client-side validation
     * -----------------------------------------------
     */

    /**
     * Handle form submit / client-side validation success
     *
     * @param {object} form Form element
     * @protected
     */
    onsuccess () {
        if (this.isLoading) return; // prevent double submit
        this.setLoading(true);

        const $form = this.$form;
        let   valid = $form.valid();

        if (valid) {
            // perform custom validation
            valid = this.validate();
        } else {
            // jquery-validation failed
            valid = $.Deferred().reject();
        }

        valid
            .then(() => {
                this.setLoading(false);
                this.hideGenericErrorMessage();
                this.submit();
            })
            .catch((...errors) => {
                const errorMessages = reduce(errors, (acc, val) => assign(acc, val), {});

                if (!$.isEmptyObject(errorMessages)) {
                    this.setErrors(errorMessages);
                }

                this.showGenericErrorMessage();
                this.hideSuccessMessage();
                this.setLoading(false);
            });
    }

    /**
     * Handle form validation error
     *
     * @param {object} form Form element
     * @protected
     */
    onerror () {
        this.hideGenericErrorMessage();
    }

    /**
     * Custom validation
     *
     * @returns {object} Promise which will resolve on success and reject on failure
     * @protected
     */
    validate () {
        const validators = this.customValidators;
        const values = this.getFormValues();
        let   results = [];

        for (let i = 0; i < validators.length; i++) {
            let result = validators[i](values, this);

            if (!result) {
                // Validation failed
                results.push($.Deferred().reject());
                break;
            } else if (result && result.then) {
                // Response is a promise
                results.push(result);

                if (result.state() === 'rejected') {
                    // Show error in the console
                    result.catch((err) => {
                        if (err) {
                            console.error(err);
                        }
                    });

                    // Validation failed, stop
                    break;
                }
            } else if (result && typeof result === 'object') {
                // Response is a list of errors
                results.push($.Deferred().reject(result));
                break;
            }
        }

        return $.when.apply(null, results);
    }

    /**
     * Add custom validation method
     *
     * @param {function} validator Validation function
     */
    addCustomValidator (validator) {
        this.customValidators.push(validator);
    }


    /*
     * Loading state
     * -----------------------------------------------
     */


    /**
     * Set loading state
     *
     * @param {boolean} state Loading state
     */
    setLoading (state) {
        this.isLoading = state;
    }


    /*
     * Server-side validation
     * -----------------------------------------------
     */


    /**
     * Submit form data to server
     */
    submit () {
        if (this.isLoading) return; // prevent double submit

        const $form  = this.$form;
        const values = this.getFormValues();
        const url    = $form.attr('action');
        const method = $form.attr('method');
        const isGET = method.toLowerCase() !== 'post';

        this.setLoading(true);
        this.disable();

        if (this.options.useAjax) {
            $.ajax({
                'url': url,
                'method': method,
                'dataType': 'json',

                // Support for files
                'contentType': isGET ? 'application/x-www-form-urlencoded; charset=UTF-8' : false,
                'processData': isGET ? true : false,
                'data':        isGET ? values : this.getFormData(),
            })
                .always(this.handleResponseComplete.bind(this))
                .done(this.handleResponseSuccess.bind(this, values))
                .fail(this.handleResponseFailure.bind(this, values));
        } else {
            $form.get(0).submit();
        }
    }

    /**
     * Handle response from server
     *
     * @protected
     */
    // eslint-disable-next-line no-unused-vars
    handleResponseComplete (request, response) {
        this.setLoading(false);
        this.enable();
    }

    /**
     * Handle successful request to server
     *
     * @param {object} request Request data
     * @param {object} response Server response
     * @protected
     */
    handleResponseSuccess (request, response) {
        if (response.status) {
            // Custom response handlers
            each(this.customResponseHandlers, handler => {
                handler(request, response, null, this);
            });

            this.handleSuccess(request, response);
        } else {
            let errors = response.errors || response.error || [];

            if (typeof errors === 'string') {
                errors = [{'message': errors}];
            }

            // Custom response handlers
            each(this.customResponseHandlers, handler => {
                handler(request, response, errors, this);
            });

            this.handleErrorResponse(errors);
        }
    }

    /**
     * Handle failed request to server
     *
     * @param {object} request Request data
     * @param {object} response Server response
     * @protected
     */
    handleResponseFailure (request, response) {
        const code = response.status;
        let message;

        if (code >= 400) {
            message = $.validator.messages.genericCode || '';
        } else {
            message = $.validator.messages.generic || '';
        }

        // Custom response handlers
        each(this.customResponseHandlers, handler => {
            handler(request, response, null, this);
        });

        this.showGenericErrorMessage(message.replace('${code}', code));
    }

    /**
     *  Handle request errors
     *
     * @param {array} errors Errors
     * @protected
     */
    handleErrorResponse (errors) {
        const $form    = this.$form;
        let genericErr = '';

        // Convert format
        const err = reduce(errors, (err, error) => {

            if (error.id && error.id != this.formName) {
                const name = this.getInputName(error.id);

                // Validate that such input exists, otherwise error will be thrown
                if ($form.find('[name="' + name + '"]').length) {
                    err[name] = error.message;
                } else if ($form.find('[name="' + error.id + '"]').length) {
                    err[error.id] = error.message;
                }
            } else {
                // Message not associated with any input
                genericErr = error.message;
            }

            return err;
        }, {});

        // Show generic error
        if (genericErr) {
            this.showGenericErrorMessage(genericErr);
        }

        // Show error messages
        this.setErrors(err);
    }

    /**
     * Returns full input name
     *
     * @param {string} id Input id or name
     * @returns {string} Input name
     */
    getInputName (id) {
        const formName = this.formName;
        let   name     = id;

        if (formName) {
            name = formName + '[' + id.replace(/^([^[]+)/, '$1]');
        }

        return name;
    }

    /**
     * Handle success
     *
     * @param {object} request Request data
     * @param {object} response Server response
     * @protected
     */
    handleSuccess (request, response) {
        const options = this.options;

        if (options.successRedirectUrl) {
            // Redirect
            document.location = options.successRedirectUrl;
        } else if (options.successReload) {
            // Reload
            document.location.reload();
        } else {
            // Show success message
            this.showSuccessMessage(request, response);
            this.$form.trigger('submit:success');
        }
    }

    /**
     * Add custom response handler method
     *
     * @param {function} handler Handler function
     */
    addCustomResponseHandler (handler) {
        this.customResponseHandlers.push(handler);
    }


    /*
     * Errors
     * -----------------------------------------------
     */

    /**
     * Handle form validation error placement
     * Place error message into DOM
     *
     * @param {object} error Error element
     * @param {object} input Input element
     * @protected
     */
    errorPlacement (error, input) {
        input.closest('.form-control').after(error);
    }

    /**
     * Returns actual error element
     *
     * @param {object} error Error element
     * @returns {object} Actual error element
     * @protected
     */
    getErrorElement (element) {
        const $element = $(element);

        if ($element.is('select') && $element.next('.selectivity-input, .nice-select').length) {
            return $element.next();
        } else {
            return $element.closest('.form-control');
        }
    }

    /**
     * Returns input label element
     *
     * @param {object} error Error element
     * @returns {object} Label element
     * @protected
     */
    getLabelElement (element) {
        return $(element.form).find('label[for="' + element.id + '"]').not('.error');
    }

    /**
     * Show error highlight on element
     *
     * @param {object} element Element
     * @param {string} errorClass Error classname
     * @param {string} validClass Valid classname
     * @protected
     */
    errorHighlight (element, errorClass, validClass) {
        const $element = this.getErrorElement(element);
        const $label   = this.getLabelElement(element);
        const $row     = $element.closest('.form-group, .form-row');

        $row.removeClass('has-success').addClass('has-error');
        $element.addClass('form-control--' + errorClass).removeClass('form-control--' + validClass);
        $label.removeClass('form-label--' + errorClass);
    }

    /**
     * Hide error highlight on element
     *
     * @param {object} element Element
     * @param {string} errorClass Error classname
     * @param {string} validClass Valid classname
     * @protected
     */
    errorUnhighlight (element, errorClass, validClass) {
        const $element = this.getErrorElement(element);
        const $label   = this.getLabelElement(element);
        const $row     = $element.closest('.form-group, .form-row');

        $row.removeClass('has-error').addClass('has-success');
        $element.removeClass('form-control--' + errorClass).addClass('form-control--' + validClass);
        $label.removeClass('form-label--' + errorClass);
    }

    /**
     * Show generic error message
     *
     * @protected
     */
    showGenericErrorMessage (message) {
        this.$errorMessage
            .html(message)
            .removeClass('is-hidden');
    }

    /**
     * Hide generic error message
     *
     * @protected
     */
    hideGenericErrorMessage () {
        this.$errorMessage.addClass('is-hidden');
    }

    /**
     * Show custom error messages on input
     *
     * @param {array} errors List of errors
     * @protected
     */
    setErrors (errors) {
        if (this.validator) {
            this.validator.showErrors(errors);
        }
    }


    /*
     * Success message
     * -----------------------------------------------
     */

    /**
     * Smoothly transition between screens
     *
     * @param {object} $hide Element which to hide
     * @param {object} $show Element which to show
     * @protected
     */
    transitionScreens ($hide, $show) {
        const $form  = this.$form;
        const heightFrom = $hide.css('overflow', 'hidden').outerHeight();
        const heightTo   = $show.removeClass('is-hidden').css('overflow', 'hidden').outerHeight();
        const width      = $show.outerWidth();

        // We need to re-read height to make sure browser actually applies "is-hidden" styles
        $hide.css('overflow', '');
        $show.addClass('is-hidden').css('overflow', '').outerHeight();

        $show.add($hide).transitionstop(() => {
            // Fade in + height
            $show.transition(this.options.animationIn, {
                'before':     $content => $content.addClass('animation--height').css('height', heightFrom),
                'transition': $content => $content.css('height', heightTo),
                'after':      $content => $content.removeClass('animation--height').css('height', '')
            });

            // Fade out
            const formPosition = $form.css('position') === 'static' ? 'relative' : '';
            const contentPosition = [$hide.css('left'), $hide.css('right')];
            const contentWidth = contentPosition[0] === 'auto' && contentPosition[1] === 'auto' ? width : '';

            $hide.transition(this.options.animationOut, {
                'before':     $content => {
                    $form.css({'position': formPosition});
                    $content.css({'position': 'absolute', 'top': 0, 'left': contentPosition[0], 'right': contentPosition[1], 'width': contentWidth});
                },
                'after':      $content => {
                    $form.css({'position': '', 'overflow': ''});
                    $content.css({'position': '', 'left': '', 'right': ''});

                    // ARIA
                    $show.attr('aria-hidden', false).trigger('appear');
                    $hide.attr('aria-hidden', true);
                }
            });
        });
    }

    /**
     * Show success message and hide content
     *
     * @protected
     */
    showSuccessMessage () {
        const $form  = this.$form;
        const $hide  = $form.find('.js-form-content');
        const $show  = $form.find('.js-form-success');

        this.transitionScreens($hide, $show);
    }

    /**
     * Hide sucess message and show content
     *
     * @protected
     */
    hideSuccessMessage () {
        const $form = this.$form;
        const $hide = $form.find('.js-form-success');
        const $show = $form.find('.js-form-content');
        const isSuccessHidden = $hide.hasClass('is-hidden');

        if (isSuccessHidden) return;

        $hide.addClass('is-hidden');
        $show.removeClass('is-hidden');
    }

}


/*
 * Create jQuery plugin from class
 */

$.fn.ajaxForm = createPlugin(AjaxForm, {
    // 'api': [ // API methods
    //     'reset', 'enable', 'disable',
    //     'addCustomResponseHandler', 'addCustomValidator',
    //     'instance'
    // ]
});

/* eslint no-control-regex: "off" */
import $ from 'util/jquery';
import 'jquery-validation';


/*
 * Additional and improved validation methods
 */


 /**
  * International email address validation method
  * Automatically validated for inputs with `type="email"`
  */
$.validator.methods.email = function (value, element) {
    const EMAIL_VALIDATION_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:(?:[\u00A0-\uD7FF\uE000-\uFFFF-a-z0-9](?:[\u00A0-\uD7FF\uE000-\uFFFF-a-z0-9-]*[\u00A0-\uD7FF\uE000-\uFFFF-a-z0-9])?\.)+[\u00A0-\uD7FF\uE000-\uFFFF-a-z0-9](?:[\u00A0-\uD7FF\uE000-\uFFFF-a-z0-9-]*[\u00A0-\uD7FF\uE000-\uFFFF-a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;
    return this.optional( element ) || EMAIL_VALIDATION_REGEX.test( value );
};

/**
 * Simple phone number validation method
 * Automatically validated for inputs with `type="tel"`
 */
$.validator.methods.tel = function (value, element) {
    const PHONE_VALIDATION_REGEX = /^(\+)?[\d\s-]+$/;
    return this.optional( element ) || PHONE_VALIDATION_REGEX.test( value );
};

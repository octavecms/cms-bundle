import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';


/**
 * Update number of remaining characters on input change
 *
 * @example
 *     <div class="form-control form-control--input" data-plugin="inputMaxLength">
 *         ...
 *     </div>
 */

$.fn.inputMaxLength = createPlugin(function ($element) {
    const $text = $element.find('.js-input-max-length-text');
    const $input = $element.find('input[maxlength], textarea[maxlength]');

    const update = function () {
        const remaining = parseInt($input.attr('maxlength')) - $input.val().length;
        $text.text(remaining);
    }

    $input.on('change input', update);
    update();
});

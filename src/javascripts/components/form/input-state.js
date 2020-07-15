import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';


/**
 * While input is focused 'is-focused' class is added to it
 * If input value is not empty then 'is-not-empty' class is added to it
 *
 * @example
 *     <div class="form-control form-control--input form-control--float" data-plugin="inputState">
 *         ...
 *     </div>
 */

$.fn.inputState = createPlugin(function ($element) {
    function updateInput ($input) {
        $element.toggleClass('is-focused', $input.is(document.activeElement));

        if ($input.is('input[type="date"]')) {
            // Date input always shows a pattern
            $element.toggleClass('is-not-empty', true);
        } else if ($input.is('input, select, textarea')) {
            // Check value only for inputs; ignore [tabindex]
            $element.toggleClass('is-not-empty', !!$input.val());
        }
    }
    function update () {
        $element.find('input, select, textarea, [tabindex]').each((index, element) => {
            // eslint-disable-next-line no-unused-vars
            const tmp = element.value;
            updateInput($(element));
        });
    }
    function updateDelayed () {
        setTimeout(update, 16);
    }
    function getInput (e) {
        if ($(e.target).is('input, select, textarea')) {
            return $(e.target);
        } else if ($(e.currentTarget).is('input, select, textarea')) {
            return $(e.target);
        } else {
            return $element.find('input, select, textarea');
        }
    }

    $element.on('input change focus blur', 'input, select, textarea, [tabindex]', (e) => {
        updateInput(getInput(e));
    });

    $element.closest('form').on('reset', updateDelayed);

    updateDelayed();
    update();
});

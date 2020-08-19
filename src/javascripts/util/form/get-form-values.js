import 'util/jquery.serializeobject';
import set from 'lodash/set';


const IMAGE_NAME_ATTR = 'data-image-name';

function getImageValue ($container, name) {
    const $image = $container.find(`[${ IMAGE_NAME_ATTR }="${ name }"]`);

    if ($image.length) {
        return $image.image('getValue');
    } else {
        return;
    }
}

function convertInputNameToDotNotation (name) {
    return name
        .split('[').join('.')
        .split(']').join('');
}


/**
 * Returns input value
 *
 * @param {*} $input
 * @param {*} value
 */
export function getInputValue ($input) {
    let value = $input.val();

    if ($input.is(':checkbox') || $input.is(':radio')) {
        if (!$input.is(':checked')) {
            value = false;
        }
    } else {
        let decoded;

        try {
            decoded = JSON.parse(value);
            return decoded;
        } catch (err) {}
    }

    return value;
}

/**
 * Returns form values
 * Image values are returned as objects instead of just id
 *
 * @param {JQuery} $container Container element
 */
export default function getFormValues ($container) {
    const values = $container.serializeObject();
    const $images = $container.find(`[${ IMAGE_NAME_ATTR }]`);

    // Unchecked checkbox values set to "false" instead of not including them
    const $checkboxes = $container.find('input:checkbox:not(:checked)');
    for (let i = 0; i < $checkboxes.length; i++) {
        const name = $checkboxes.eq(i).attr('name');
        set(values, convertInputNameToDotNotation(name), false);
    }

    // Images
    for (let i = 0; i < $images.length; i++) {
        const name = $images.eq(i).attr(IMAGE_NAME_ATTR);
        const value = getImageValue($container, name);

        if (typeof value !== 'undefined') {
            set(values, convertInputNameToDotNotation(name), value);
        }
    }

    return values;
}

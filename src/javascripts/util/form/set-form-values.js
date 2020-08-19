import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';


function setImageValue ($container, name, value) {
    const $image = $container.find(`[data-image-name="${ name }"]`);

    if ($image.length) {
        $image.image('setValue', value);
        return true;
    } else {
        return false;
    }
}

function setCollectionValue ($container, name, value) {
    const $collection = $container.find(`[data-collection-name="${ name }"]`);

    if ($collection.length) {
        $collection.collection('setValues', value);
        return true;
    } else {
        return false;
    }
}

export function setInputValue ($input, value) {
    if ($input.is(':checkbox')) {
        let checked = false;
        if (value === true || value === false) {
            // Input can't have a value of true or false, so it's indication
            // whether or not it should be checked
            checked = value;
        } else {
            const inputValue = $input.val();
            checked = value.toString() === inputValue;
        }

        let isChecked = $input.prop('checked');
        if (isChecked !== checked) {
            $input.prop('checked', checked).change();
        }
    } else if ($input.is(':radio')) {
        let $changed = $();

        for (let i = 0; i < $input.length; i++) {
            let isSelected = value.toString() === $input.eq(i).val();
            let wasSelected = $input.eq(i).prop('checked');

            if (isSelected !== wasSelected) {
                $changed = $changed.add($input.eq(i));
                $input.eq(i).prop('checked', isSelected);
            }
        }

        $changed.change();
    } else {
        const strValue = isArray(value) || isPlainObject(value) ? JSON.stringify(value) : value.toString();

        if ($input.val() !== strValue) {
            $input.val(strValue).change();
        }
    }
}

/**
 * Set form values
 * Populates collections
 *
 * @param {JQuery} $container Container element
 * @param {object} values Values
 * @param {string} [namePrefix] Name prefix for inputs
 */
export default function setFormValues ($container, values, namePrefix = '') {
    for (let name in values) {
        const fullName = namePrefix ? `${ namePrefix }[${ name }]` : name;
        const value = values[name];

        if (setCollectionValue($container, fullName, value)) {
            // Collection value was set
        } else if (setImageValue($container, fullName, value)) {
            // Image input value was set
        } else {
            const $input = $container.find(`input[name="${ fullName }"], select[name="${ fullName }"], textarea[name="${ fullName }"]`);

            if ($input.length) {
                setInputValue($input, value);
            } else if (isArray(value) || isPlainObject(value)) {
                setFormValues($container, value, fullName);
            }
        }
    }
}


window.setFormValues = setFormValues;

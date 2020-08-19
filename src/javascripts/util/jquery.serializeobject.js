import $ from 'util/jquery';

import map from 'lodash/map';
import each from 'lodash/each';
import isObject from 'lodash/isObject';



const NAME_REPLACE_BRACKETS_REGEX = /\[([^[]*)\]/g;


function convertSequentialKeysToArray (values) {
    if ($.isPlainObject(values)) {
        const keys = Object.keys(values);

        if (keys.length) {
            // Itterate sub-properties
            each(values, (value, key) => {
                if ($.isPlainObject(value)) {
                    values[key] = convertSequentialKeysToArray(value);
                }
            });

            for (let i = 0; i < keys.length; i++) {
                if (keys.indexOf(String(i)) === -1) {
                    // one of the keys is not a number or some key is missing
                    return values;
                }
            }

            return map(values, value => value);
        }
    }

    return values;
}

function set (object, path, value) {
    if (!isObject(object)) {
        return object;
    }

    let index = -1;
    let length = path.length;
    let lastIndex = length - 1;
    let nested = object;

    while (nested != null && ++index < length) {
        let key = path[index];
        let newValue = value;

        if (index != lastIndex) {
            let objValue = nested[key];
            newValue = isObject(objValue)
                ? objValue
                : (!isNaN(path[index + 1]) || !path[index + 1] ? [] : {});
        }


        if (Array.isArray(nested) && isNaN(key)) {
            // Part of the name is "[]"
            nested.push(newValue);
        } else {
            nested[key] = newValue;
        }

        nested = nested[key];
    }

    return object;
}


/*
 * Serialize form values into an object
 */
$.fn.serializeObject = function () {
    const $serializable = this.filter('form, input, select, textarea');
    const $additional = this.not('form, input, select, textarea').find('input, select, textarea');
    const arr = $serializable.add($additional).serializeArray();
    const values = {};

    each(arr, item => {
        let namePath = item.name.replace(NAME_REPLACE_BRACKETS_REGEX, '§$1').split('§');
        set(values, namePath, item.value);
    });

    return convertSequentialKeysToArray(values);
};

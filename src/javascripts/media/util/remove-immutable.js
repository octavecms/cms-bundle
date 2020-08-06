import isArray from 'lodash/isArray';
import clone from 'lodash/clone';
import has from 'lodash/has';
import assign from 'lodash/assign';

export default function removeImmutable (source, keyString) {
    if (has(source, keyString)) {
        const keys = isArray(keyString) ? keyString : keyString.split('.');
        const cloned = assign({}, source);
        let object = cloned;

        for (let i = 0; i < keys.length; i++) {
            if (i == keys.length - 1) {
                delete(object[keys[i]]);
            } else {
                object[keys[i]] = clone(object[keys[i]]);
            }
            object = object[keys[i]];
        }

        return cloned;
    } else {
        return source;
    }
}
import isArray from 'lodash/isArray';
import clone from 'lodash/clone';
import assign from 'lodash/assign';

export default function setImmutable (source, keyString, value) {
    const keys = isArray(keyString) ? keyString : keyString.split('.');
    const cloned = assign({}, source);
    let object = cloned;

    for (let i = 0; i < keys.length; i++) {
        object[keys[i]] = (i == keys.length - 1 ? value : clone(object[keys[i]]));
        object = object[keys[i]];
    }

    return cloned;
}
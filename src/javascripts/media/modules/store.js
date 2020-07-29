import get from 'lodash/get';
import difference from 'lodash/difference';
import setImmutable from '../utils/set-immutable';
import removeImmutable from '../utils/remove-immutable';

const EVENT_CHANGE = 'change';
const EVENT_ADD = 'add';
const EVENT_REMOVE = 'remove';


class Store {
    constructor (state) {
        this.state = state || {};
        this.proxies = {};
        this.listeners = {};
    }

    get (path, defaultValue) {
        return get(this.state, path, defaultValue);
    }

    has (path) {
        return this.get(path) !== undefined;
    }

    set (path, value) {
        const prevState = this.state;
        this.state = setImmutable(this.state, path, value);
        this.trigger(path, prevState, this.state);
    }

    remove (path) {
        const prevState = this.state;
        this.state = removeImmutable(this.state, path);
        this.trigger(path, prevState, this.state);
    }

    on (path, event, listener) {
        const listeners = this.listeners;
        const eventParts = event.split('.');
        const eventName = eventParts[0];
        const eventNS = eventParts.slice(1);

        listeners[path] = listeners[path] || {};
        listeners[path][eventName] = listeners[path][eventName] || [];
        listeners[path][eventName].push({
            fn: listener,
            ns: eventNS,
        });
    }

    off (path, event, listener) {
        const listeners = this.listeners;
        const eventParts = event.split('.');
        const eventName = eventParts[0];
        const eventNS = eventParts.slice(1);

        if (path in listeners && eventName in listeners[path]) {
            const eventListeners = listeners[path][eventName];

            for (let i = eventListeners.length - 1; i >= 0; i--) {
                if (listener && eventListeners[i].fn !== listener) {
                    continue;
                } else if (eventNS.length && difference(eventNS, eventListeners[i].ns).length) {
                    continue;
                }

                eventListeners.splice(i, 1);
            }
        }
    }

    triggerListeners (listeners, prevValue, newValue) {
        if (listeners && listeners.length) {
            for (let i = 0; i < listeners.length; i++) {
                listeners[i].fn(newValue, prevValue);
            }
        }
    }

    trigger (path, prevState, newState) {
        const listeners = this.listeners;

        for (let listenerPath in listeners) {
            if (listenerPath === path || (path + '.').indexOf(listenerPath) === 0) {
                const prevValue = get(prevState, listenerPath);
                const newValue = get(newState, listenerPath);

                if (prevValue !== newValue) {
                    this.triggerListeners(listeners[listenerPath][EVENT_CHANGE], prevValue, newValue);

                    if (typeof prevValue === 'undefined') {
                        this.triggerListeners(listeners[listenerPath][EVENT_ADD], prevValue, newValue);
                    }
                    if (typeof newValue === 'undefined') {
                        this.triggerListeners(listeners[listenerPath][EVENT_REMOVE], prevValue, newValue);
                    }
                }
            } 
        }
    }
}


function traverserGet (store, path, target, name, receiver) {
    if (Reflect.has(target, name)) {
        return Reflect.get(target, name, receiver);
    } else {
        if (name === 'get' || name === 'set' || name === 'has' || name === 'remove' || name === 'on' || name === 'off') {
            return store[name].bind(store, path);
        } else {
            // Create a new proxy
            const fullPath = path ? path + '.' + name : name;
    
            store.proxies[fullPath] = new Proxy(store.proxies, {
                get: traverserGet.bind(null, store, fullPath)
            });
        
            return store.proxies[fullPath];
        }
    }
}

export default function createStore (state) {
    const store = new Store(state);
    const proxy = new Proxy(store.proxies, {
        get: traverserGet.bind(null, store, '')
    });

    proxy.store = store;
    return proxy;
}
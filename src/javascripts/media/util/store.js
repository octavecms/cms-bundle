import get from 'lodash/get';
import difference from 'lodash/difference';
import setImmutable from 'media/util/set-immutable';
import removeImmutable from 'media/util/remove-immutable';
import debounce from 'media/util/debounce-raf';
import compare from 'media/util/compare';
import each from 'lodash/each';

const EVENT_CHANGE = 'change';
const EVENT_ADD = 'add';
const EVENT_REMOVE = 'remove';


class Store {
    constructor (state) {
        this.state = state || {};
        this.prevState = this.state;
        this.proxies = {};
        this.listeners = {};
        this.triggerQueue = [];
        this.triggerCallQueue = debounce(this.triggerCallQueue.bind(this));
    }

    destroy () {
        this.state = null;
        this.proxies = null;
        this.listeners = null;
    }

    get (path, defaultValue) {
        if (path) {
            return get(this.state, path, defaultValue);
        } else {
            return this.state;
        }
    }

    has (path) {
        return this.get(path) !== undefined;
    }

    set (path, value) {
        this.state = setImmutable(this.state, path, value);
        this.trigger(path);
        return this;
    }

    remove (path) {
        this.state = removeImmutable(this.state, path);
        this.trigger(path);
        return this;
    }

    on (path, event, listener) {
        const listeners = this.listeners;
        const eventParts = event.split('.');
        const eventName = eventParts[0];
        const eventNS = eventParts.slice(1);

        if (!listeners[path]) {
            // Create regular expression from path
            const regex = '^' + path
                .split('.').join('\\.')
                .split('*').join('[^.]*');
            
            listeners[path] = listeners[path] || {
                regex: new RegExp(regex),
            };
        }

        listeners[path][eventName] = listeners[path][eventName] || [];
        listeners[path][eventName].push({
            fn: listener,
            ns: eventNS,
        });

        return this.off.bind(this, path, event, listener);
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
        return this;
    }

    triggerListeners (listeners, prevValue, newValue) {
        if (listeners && listeners.length) {
            for (let i = 0; i < listeners.length; i++) {
                listeners[i].fn(newValue, prevValue);
            }
        }
    }

    triggerCallQueue () {
        const queue = this.triggerQueue;
        const prevState = this.prevState;
        const newState = this.state;

        this.triggerQueue = [];
        this.prevState = newState;

        each(queue, (path) => {
            const listeners = this.listeners;

            for (let id in listeners) {
                const listener = listeners[id];
                const pathMatch = (path + '.').match(listener.regex);
                
                if (pathMatch) {
                    const statePath = pathMatch[0];
                    const prevValue = get(prevState, statePath);
                    const newValue = get(newState, statePath);
                    
                    if (!compare(prevValue, newValue)) {
                        this.triggerListeners(listener[EVENT_CHANGE], prevValue, newValue);

                        if (typeof prevValue === 'undefined') {
                            this.triggerListeners(listener[EVENT_ADD], prevValue, newValue);
                        }
                        if (typeof newValue === 'undefined') {
                            this.triggerListeners(listener[EVENT_REMOVE], prevValue, newValue);
                        }
                    }
                } 
            }
        });
    }

    trigger (path) {
        this.triggerQueue.push(path);
        this.triggerCallQueue();
    }
}


function traverserGet (store, path, target, name, receiver) {
    const fullPath = path ? path + '.' + name : name;

    if (store.proxies[fullPath]) {
        return store.proxies[fullPath];
    } else {
        if (name === 'get' || name === 'set' || name === 'has' || name === 'remove' || name === 'on' || name === 'off') {
            return store[name].bind(store, path);
        } else {
            // Create a new proxy
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
    proxy.destroy = store.destroy.bind(store);
    return proxy;
}
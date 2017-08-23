/*
 * Media tree, grid list state
 */

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import get from 'lodash/get';

import reducers from './reducers';
import getInitialState from './get-initial-state';


const storeExtensions = {
    subscribePath (path, callback) {
        const store = this;
        let value = get(this.getState(), path);

        return this.subscribe(() => {
            const newvalue = get(this.getState(), path);
            if (newvalue !== value) {
                const prevvalue = value;
                value = newvalue;

                callback(newvalue, prevvalue, store);
            }
        });
    },

    destroy () {
        // @TODO
    }
};

export default function (state) {
    const store = createStore(
        reducers,
        getInitialState(state),
        applyMiddleware(
            thunkMiddleware
        )
    );

    return $.extend(store, storeExtensions);
}
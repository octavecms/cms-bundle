/*
 * Media tree, grid list state
 */

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import get from 'lodash/get';

import reducers from './reducers';
import { setGridList, fetchFilesIfNeeded } from './actions';
import initialState from './initial-state';


const store = createStore(
    reducers,
    initialState,
    applyMiddleware(
        thunkMiddleware
    )
);

store.subscribePath = function (path, callback) {
    let value = get(this.getState(), path);

    return this.subscribe(() => {
        const newvalue = get(this.getState(), path);
        if (newvalue !== value) {
            const prevvalue = value;
            value = newvalue;

            callback(newvalue, prevvalue, store);
        }
    });
};

$(() => {
    function handleCategoryChange (nextValue, prevValue) {
        const state = store.getState();
        const list  = state.categories[state.categoryId];

        if (list) {
            store.dispatch(setGridList([].concat(list)));
        }
    }

    store.subscribePath('categoryId', handleCategoryChange);
    store.subscribePath('categories', handleCategoryChange);

    store.dispatch(fetchFilesIfNeeded(store.getState().categoryId));
});

export default store;
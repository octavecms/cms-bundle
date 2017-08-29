/*
 * action types
 */

import uniq from 'lodash/uniq';
import map from 'lodash/map';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import reduce from 'lodash/reduce';
import filter from 'lodash/filter';
import without from 'lodash/without';
import indexOf from 'lodash/indexOf';
import get from 'lodash/get';

import setImmutable from '../utils/set-immutable';
import removeImmutable from '../utils/remove-immutable';

import {
    SET_TREE_LOADING,
    RECEIVE_PAGE, MOVED_PAGE, REMOVE_PAGE,
    ADD_TEMPORARY_PAGE, REMOVE_TEMPORARY_PAGE
} from './actions';


/*
 * action creators
 */

function removeTemporaryPage (state) {
    const temp = state.tree.pages.temporary;

    if (temp) {
        // Remove from parent
        const parent = state.tree.pages[temp.parent];
        state = setImmutable(state, ['tree', 'pages', parent.id, 'children'], without(parent.children, 'temporary'));

        // Remove temporary page itself
        state = removeImmutable(state, 'tree.pages.temporary');
        state = setImmutable(state, ['tree', 'temporary'], false);
    }

    return state;
}


function treeReducer (state, action) {
    switch (action.type) {
        case SET_TREE_LOADING:
            return setImmutable(state, 'tree.loading', action.loading);
        default:
            return state;
    }
}

function pageReducer (state, action) {
    let temp;
    let parentChildren;
    let parent;

    switch (action.type) {
        case RECEIVE_PAGE:
            parentChildren = state.tree.pages[action.page.parent].children || [];

            state = setImmutable(state, ['tree', 'pages', action.page.id], action.page);
            state = setImmutable(state, ['tree', 'pages', action.page.parent, 'children'], [].concat(parentChildren, action.page.id));

            state = removeTemporaryPage(state);

            return state;
        case MOVED_PAGE:
            parentChildren = state.tree.pages[action.parent].children || [];

            const prevParent = state.tree.pages[action.id].parent;
            const prevParentChildren = state.tree.pages[prevParent].children || [];

            state = setImmutable(state, ['tree', 'pages', prevParent, 'children'], without(prevParentChildren, action.id));
            state = setImmutable(state, ['tree', 'pages', action.parent, 'children'], [].concat(parentChildren, action.id));
            state = setImmutable(state, ['tree', 'pages', action.id, 'parent'], action.parent);

            return state;
        case REMOVE_PAGE:
            const page = state.tree.pages[action.id];

            state = removeImmutable(state, ['tree', 'pages', action.id], null);

            if (page.parent) {
                // Remove from parents children list
                let children = without(state.tree.pages[page.parent].children, page.id);
                state = setImmutable(state, ['tree', 'pages', page.parent, 'children'], children);
            }

            return state;
        case ADD_TEMPORARY_PAGE:
            temp = state.tree.pages.temporary;

            if (temp) {
                // Remove from parent
                parent = state.tree.pages[temp.parent];
                state = setImmutable(state, ['tree', 'pages', parent.id, 'children'], without(parent.children, 'temporary'));
            }

            state = setImmutable(state, 'tree.pages.temporary', {
                'id': 'temporary',
                'parent': action.parent,
                'name': '',
                'active': false,
                'readonly': true
            });

            parent = state.tree.pages[action.parent];
            state = setImmutable(state, ['tree', 'pages', action.parent, 'children'], [].concat(parent.children, 'temporary'));
            state = setImmutable(state, ['tree', 'temporary'], true);

            return state;
        case REMOVE_TEMPORARY_PAGE:
            return removeTemporaryPage(state);
        default:
            return state;
    }
}


export default (state, action) => {
    return reduce([

        treeReducer,
        pageReducer

    ], (state, reducer) => reducer(state, action), state);
};
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
    ADD_TEMPORARY_PAGE, REMOVE_TEMPORARY_PAGE,
    SET_ERROR_MESSAGE, HIDE_ERROR_MESSAGE
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

function insertPage (state, parent, id, reference, position) {
    let children = [].concat(state.tree.pages[parent].children);
    let index = indexOf(children, reference);

    if (position === 'before') {
        children.splice(index, 0, id);
    } else {
        children.splice(index + 1, 0, id);
    }

    return setImmutable(state, ['tree', 'pages', parent, 'children'], children);
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
    let reference;

    switch (action.type) {
        case RECEIVE_PAGE:
            parentChildren = state.tree.pages[action.page.parent].children || [];

            state = setImmutable(state, ['tree', 'pages', action.page.id], action.page);
            state = setImmutable(state, ['tree', 'pages', action.page.parent, 'children'], [].concat(parentChildren, action.page.id));

            state = removeTemporaryPage(state);

            return state;
        case MOVED_PAGE:
            reference = state.tree.pages[action.reference];
            parent    = reference;

            if (action.position === 'before' || action.position === 'after') {
                parent = state.tree.pages[reference.parent];
            }

            const prevParent = state.tree.pages[action.id].parent;
            const prevParentChildren = state.tree.pages[prevParent].children || [];

            state = setImmutable(state, ['tree', 'pages', prevParent, 'children'], without(prevParentChildren, action.id));
            state = setImmutable(state, ['tree', 'pages', action.id, 'parent'], parent.id);

            if (action.position === 'before' || action.position === 'after') {
                state = insertPage(state, parent.id, action.id, reference.id, action.position);
            } else {
                state = setImmutable(state, ['tree', 'pages', parent.id, 'children'], [].concat(parent.children, action.id));
            }

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
            reference = state.tree.pages[action.reference];
            parent    = reference;

            if (action.position === 'before' || action.position === 'after') {
                parent = state.tree.pages[reference.parent];
            }

            // Remove existing temporary page from parent
            temp = state.tree.pages.temporary;

            if (temp) {
                let tempparent = state.tree.pages[temp.parent];
                state = setImmutable(state, ['tree', 'pages', tempparent.id, 'children'], without(tempparent.children, 'temporary'));
            }

            // Create temporary page
            state = setImmutable(state, 'tree.pages.temporary', {
                'id': 'temporary',
                'parent': parent.id,
                'name': '',
                'active': false,
                'readonly': true,
                'type': action.pageType,

                'reference': action.reference,
                'position': action.position
            });

            state = setImmutable(state, ['tree', 'temporary'], true);

            if (action.position === 'before' || action.position === 'after') {
                state = insertPage(state, parent.id, 'temporary', reference.id, action.position);
            } else {
                state = setImmutable(state, ['tree', 'pages', parent.id, 'children'], [].concat(parent.children, 'temporary'));
            }

            return state;
        case REMOVE_TEMPORARY_PAGE:
            return removeTemporaryPage(state);
        default:
            return state;
    }
}

function errorReducer (state, action) {
    switch (action.type) {
        case SET_ERROR_MESSAGE:
            let newState = state;
            newState = setImmutable(newState, 'error.message', action.message);
            newState = setImmutable(newState, 'error.visible', true);

            return newState;
        case HIDE_ERROR_MESSAGE: 
            return setImmutable(state, 'error.visible', false);
        default:
            return state;
    }

}


export default (state, action) => {
    return reduce([

        treeReducer,
        pageReducer,
        errorReducer

    ], (state, reducer) => reducer(state, action), state);
};
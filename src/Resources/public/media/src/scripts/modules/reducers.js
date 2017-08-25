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

import setImmutable from '../utils/set-immutable';
import removeImmutable from '../utils/remove-immutable';

import {
    SET_GRID_LIST, SET_GRID_LOADING,
    DELETE_SELECTED_ITEMS, UNSET_SELECTED_ITEM, SET_SELECTED_ITEM, TOGGLE_SELECTED_ITEM, ADD_SELECTED_ITEMS, REMOVE_SELECTED_ITEMS, UNSET_ALL_SELECTED_ITEMS,
    SET_DRAGGING_ITEMS,
    UPDATED_FILE, RECEIVE_FILES, REMOVE_FILES, MOVED_FILES,
    RECEIVE_FOLDER, MOVED_FOLDER, REMOVE_FOLDER, INVALIDATE_FOLDER,
    SET_OPENED_ITEM, TOGGLE_OPENED_ITEM,
    SET_CATEGORY
} from './actions';


/*
 * action creators
 */

function gridReducer (state, action) {
    switch (action.type) {
        case SET_GRID_LIST:
            return setImmutable(state, 'grid.files', action.ids || []);
        case SET_GRID_LOADING:
            return setImmutable(state, 'grid.loading', action.loading);
        default:
            return state;
    }
}

function dragReducer (state, action) {
    switch (action.type) {
        case SET_DRAGGING_ITEMS:
            return setImmutable(state, 'grid.dragging', action.ids);
        default:
            return state;
    }
}

function selectedReducer (state, action) {
    let selected;

    switch (action.type) {
        case MOVED_FILES:
        case UNSET_SELECTED_ITEM:
            return setImmutable(state, 'selected', {});
        case SET_SELECTED_ITEM:
            selected = {};
            selected[action.id] = 1;
            return setImmutable(state, 'selected', selected);
        case TOGGLE_SELECTED_ITEM:
            const isSelected = state.selected[action.id];
            return setImmutable(state, ['selected', action.id], isSelected ? 0 : 1);
        case ADD_SELECTED_ITEMS:
            selected = $.extend({}, state.selected);

            selected = reduce(action.ids, (selected, id) => {
                selected[id] = 1;
                return selected;
            }, selected);

            return setImmutable(state, 'selected', selected);
        case REMOVE_SELECTED_ITEMS:
            selected = $.extend({}, state.selected);

            selected = reduce(action.ids, (selected, id) => {
                delete(selected[id]);
                return selected;
            }, selected);

            return setImmutable(state, 'selected', selected);
        case UNSET_ALL_SELECTED_ITEMS:
            return setImmutable(state, 'selected', {});
        default:
            return state;
    }
}

function openedReducer (state, action) {
    switch (action.type) {
        case SET_OPENED_ITEM:
            return setImmutable(state, 'opened', action.id);
        case TOGGLE_OPENED_ITEM:
            return setImmutable(state, 'opened', state.opened === action.id ? null : action.id);
        default:
            return state;
    }
};

function categoryReducer (state, action) {
    switch (action.type) {
        case SET_CATEGORY:
            state = setImmutable(state, 'opened', null);
            state = setImmutable(state, 'selected', {});
            state = setImmutable(state, 'categoryId', action.id);

            return state;
        default:
            return state;
    }
}

function folderReducer (state, action) {
    let parentChildren;

    switch (action.type) {
        case RECEIVE_FOLDER:
            parentChildren = state.tree.folders[action.folder.parent].children || [];

            state = setImmutable(state, ['tree', 'folders', action.folder.id], action.folder);
            state = setImmutable(state, ['tree', 'folders', action.folder.parent, 'children'], [].concat(parentChildren, action.folder.id));

            return state;
        case MOVED_FOLDER:
            parentChildren = state.tree.folders[action.parent].children || [];

            const prevParent = state.tree.folders[action.id].parent;
            const prevParentChildren = state.tree.folders[prevParent].children || [];

            state = setImmutable(state, ['tree', 'folders', prevParent, 'children'], without(prevParentChildren, action.id));
            state = setImmutable(state, ['tree', 'folders', action.parent, 'children'], [].concat(parentChildren, action.id));
            state = setImmutable(state, ['tree', 'folders', action.id, 'parent'], action.parent);

            return state;
        case INVALIDATE_FOLDER:
            // Reset category cache
            state = removeImmutable(state, ['categories', action.id], null);
            return state;
        case REMOVE_FOLDER:
            const folder = state.tree.folders[action.id];

            state = removeImmutable(state, ['tree', 'folders', action.id], null);
            state = removeImmutable(state, ['categories', action.id], null);

            if (folder.parent) {
                // Remove from parents children list
                let children = without(state.tree.folders[folder.parent].children, folder.id);
                state = setImmutable(state, ['tree', 'folders', folder.parent, 'children'], children);
            }

            return state;
        default:
            return state;
    }
}

function fileReducer (state, action) {
    let filesList;
    let filesLeft;
    let ids;

    switch (action.type) {
        case UPDATED_FILE:
            // File list as object indexed by ids
            if (action.file.parent === state.categoryId) {
                state = setImmutable(state, ['files', action.file.id], action.file);
            }

            return state;
        case RECEIVE_FILES:
            // File list as object indexed by ids
            filesList = reduce(action.files, (files, file) => { files[file.id] = file; return files; }, {});
            state = setImmutable(state, 'files', filesList);

            // Set categories, but files are only ids
            let categories = {};
            categories[action.categoryId] = map(action.files, file => file.id);
            state = setImmutable(state, ['categories'], categories);

            return state;
        case REMOVE_FILES:
            ids = action.ids;

            filesLeft = filter(state.files, (file) => indexOf(ids, file.id) === -1 ? true : false);
            filesList = reduce(filesLeft, (files, file) => { files[file.id] = file; return files; }, {});
            state = setImmutable(state, 'files', filesList);

            // Set categories, but in categories structure files are only ids
            state = setImmutable(state, ['categories', state.categoryId], map(filesLeft, file => file.id));

            return state;
        case MOVED_FILES:
            ids = action.ids;
            const parentId = action.parentId;

            // We have info about new parent children, invalidate that info which will force  so that
            // list is forced to be reloaded
            if (parentId in state.categories) {
                state = setImmutable(state, ['categories', parentId], null);
            }

            // Remove files
            filesLeft = filter(state.files, (file) => indexOf(ids, file.id) === -1 ? true : false);
            filesList = reduce(filesLeft, (files, file) => { files[file.id] = file; return files; }, {});
            state = setImmutable(state, 'files', filesList);

            // Set categories, but in categories structure files are only ids
            state = setImmutable(state, ['categories', state.categoryId], map(filesLeft, file => file.id));

        default:
            return state;
    }
}


export default (state, action) => {
    return reduce([

        gridReducer,
        dragReducer,
        selectedReducer,
        openedReducer,
        categoryReducer,
        folderReducer,
        fileReducer

    ], (state, reducer) => reducer(state, action), state);
};
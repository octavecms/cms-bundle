import map from 'lodash/map';


/*
 * action types
 */

export const SET_GRID_LIST = 'SET_GRID_LIST';
export const SET_GRID_LOADING = 'SET_GRID_LOADING';

export const SET_DRAGGING_ITEMS = 'SET_DRAGGING_ITEMS';
export const DELETE_SELECTED_ITEMS = 'DELETE_SELECTED_ITEMS';
export const UNSET_SELECTED_ITEM = 'UNSET_SELECTED_ITEM';
export const SET_SELECTED_ITEM = 'SET_SELECTED_ITEM';
export const TOGGLE_SELECTED_ITEM = 'TOGGLE_SELECTED_ITEM';
export const ADD_SELECTED_ITEMS = 'ADD_SELECTED_ITEMS';
export const REMOVE_SELECTED_ITEMS = 'REMOVE_SELECTED_ITEMS';
export const UNSET_ALL_SELECTED_ITEMS = 'UNSET_ALL_SELECTED_ITEMS';

export const RECEIVE_FOLDER = 'RECEIVE_FOLDER';
export const MOVED_FOLDER = 'MOVED_FOLDER';

export const REQUEST_FILES = 'REQUEST_FILES';
export const RECEIVE_FILES = 'RECEIVE_FILES';
export const REMOVE_FILES = 'REMOVE_FILES';
export const MOVED_FILES = 'MOVED_FILES';

export const SET_OPENED_ITEM = 'SET_OPENED_ITEM'
export const TOGGLE_OPENED_ITEM = 'TOGGLE_OPENED_ITEM'

export const SET_CATEGORY = 'SET_CATEGORY';


/*
 * Selected items
 */

export function setSelectedItem (id) {
    return { type: SET_SELECTED_ITEM, id };
}

export function toggleSelectedItem (id) {
    return { type: TOGGLE_SELECTED_ITEM, id };
}

export function addSelectedItems (ids) {
    return { type: ADD_SELECTED_ITEMS, ids };
}

export function removeSelectedItems (ids) {
    return { type: REMOVE_SELECTED_ITEMS, ids };
}


/*
 * Folders
 */

function receiveFolder (json) {
    return {
        type: RECEIVE_FOLDER,
        folder: json.data
    };
}

export function addFolder(name) {
    return (dispatch) => {
        dispatch(setGridLoading(true));

        return fetch('/bundles/videinfracms/media/json/add-folder.json', {
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            'body': decodeURIComponent($.param({'name': name}))
        })
            .then(response => response.json())
            .then(json => {
                dispatch(setGridLoading(false));
                dispatch(receiveFolder(json));
            })
    };
}


function movedFolder (id, parent) {
    return {
        type: MOVED_FOLDER,
        id,
        parent
    };
}

export function moveFolder(id, parent) {
    return (dispatch) => {
        dispatch(setGridLoading(true));

        return fetch('/bundles/videinfracms/media/json/move-folder.json', {
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            'body': decodeURIComponent($.param({id, parent}))
        })
            .then(response => response.json())
            .then(json => {
                dispatch(setGridLoading(false));
                dispatch(movedFolder(id, parent));
            })
    };
}


/*
 * Files
 */

function requestFiles (categoryId) {
    return {
        type: REQUEST_FILES,
        categoryId
    };
}

function receiveFiles (categoryId, json) {
    return {
        type: RECEIVE_FILES,
        categoryId,
        files: json.data
    };
}

function fetchFiles (categoryId) {
    return (dispatch) => {
        dispatch(requestFiles(categoryId));
        dispatch(setGridLoading(true));

        return fetch(`/bundles/videinfracms/media/json/files.json?category=${ encodeURIComponent(categoryId) }`)
            .then(response => response.json())
            .then(json => {
                dispatch(setGridLoading(false));
                dispatch(receiveFiles(categoryId, json));
            })
    };
}


export function fetchFilesIfNeeded (categoryId) {
    return (dispatch, getState) => {
        if (!getState().categories[categoryId]) {
            return dispatch(fetchFiles(categoryId));
        } else {
            return Promise.resolve();
        }
    };
}


/*
 * Delete files
 */


function removeFiles (ids) {
    return { type: REMOVE_FILES, ids };
}


export function deleteSelectedListItems () {
    return (dispatch, getState) => {
        const ids = map(getState().selected, (value, key) => key);

        if (ids.length) {
            const confirmation = confirm('Are you sure you want to delete the selected assets?');

            if (confirmation) {
                dispatch(setGridLoading(true));

                return fetch('/bundles/videinfracms/media/json/delete-files.json', {
                    'method': 'POST',
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                    'body': decodeURIComponent($.param({'files': ids}))
                })
                    .then(response => response.json())
                    .then(json => {
                        dispatch(setGridLoading(false));
                        dispatch(removeFiles(ids));
                    });
            }
        }

        return Promise.resolve();
    };
};


/*
 * Move files
 */

export function moveFiles(ids, parentId) {

}


/*
 * action creators
 */

export function setGridLoading (loading) {
    return { type: SET_GRID_LOADING, loading };
};

export function setGridList (ids) {
    return { type: SET_GRID_LIST, ids };
};

export function unsetSelectedListItem (id) {
    return { type: UNSET_SELECTED_ITEM, id };
};

export function unsetAllSelectedListItems () {
    return { type: UNSET_ALL_SELECTED_ITEMS };
}

export function setSelectedListItem (id) {
    return { type: SET_SELECTED_ITEM, id };
};

export function toggleSelectedListItem (id) {
    return { type: TOGGLE_SELECTED_ITEM, id };
};

export function addSelectedListItems (ids) {
    return { type: ADD_SELECTED_ITEMS, ids };
};

export function setOpenedListItem (id) {
    return { type: SET_OPENED_ITEM, id };
};

export function toggleOpenedListItem (id) {
    return { type: TOGGLE_OPENED_ITEM, id };
};

export function setCategory (id) {
    return { type: SET_CATEGORY, id };
};

export function setDraggingListItems (ids) {
    return { type: SET_DRAGGING_ITEMS, ids };
};
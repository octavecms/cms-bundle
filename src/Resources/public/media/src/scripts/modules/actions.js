import map from 'lodash/map';
import each from 'lodash/each';
import uniq from 'lodash/uniq';

import { isEmpty } from 'utils/folders';
import 'whatwg-fetch';


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
export const REMOVE_FOLDER = 'REMOVE_FOLDER';
export const INVALIDATE_FOLDER = 'INVALIDATE_FOLDER';

export const UPDATED_FILE = 'UPDATED_FILE';
export const REQUEST_FILES = 'REQUEST_FILES';
export const RECEIVE_FILES = 'RECEIVE_FILES';
export const REMOVE_FILES = 'REMOVE_FILES';
export const MOVED_FILES = 'MOVED_FILES';

export const SET_OPENED_ITEM = 'SET_OPENED_ITEM'
export const TOGGLE_OPENED_ITEM = 'TOGGLE_OPENED_ITEM'

export const SET_CATEGORY = 'SET_CATEGORY';

export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE';
export const HIDE_ERROR_MESSAGE = 'HIDE_ERROR_MESSAGE';


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

export function addFolder(name, parent) {
    return (dispatch) => {
        dispatch(setGridLoading(true));

        return fetch(API_ENDPOINTS.folderAdd, {
            'method': 'POST',
            'credentials': 'same-origin',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            'body': decodeURIComponent($.param({
                'name': name,
                'parent': parent
            }))
        })
            .then(response => response.json())
            .then(json => {
                dispatch(setGridLoading(false));
                
                if (json && json.status) {
                    dispatch(receiveFolder(json));
                } else if (json && json.message) {
                    dispatch(setErrorMessage(json.message));
                }

                return json;
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

        return fetch(API_ENDPOINTS.folderMove, {
            'method': 'POST',
            'credentials': 'same-origin',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            'body': decodeURIComponent($.param({id, parent}))
        })
            .then(response => response.json())
            .then(json => {
                dispatch(setGridLoading(false));

                if (json && json.status) {
                    dispatch(movedFolder(id, parent));
                } else if (json && json.message) {
                    dispatch(setErrorMessage(json.message));
                }

                return json;
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
        files: map(json.data, (file) => {
            // Add icon to the file data
            if (!file.image && !file.icon) {
                const extension = file.filename.replace(/^.*\./, '');

                if (['doc', 'docm', 'docx', 'dot', 'dotm', 'dotx'].indexOf(extension) !== 1) {
                    file.icon = 'fa-file-word-o';
                } else if (['xls', 'xlsb', 'xlsm', 'xlsx'].indexOf(extension) !== 1) {
                    file.icon = 'fa-file-excel-o';
                } else if (['pptx', 'pptm', 'ppt', 'potx', 'potm', 'pot', 'ppsx', 'pps'].indexOf(extension) !== 1) {
                    file.icon = 'fa-file-powerpoint-o';
                } else if (['pdf'].indexOf(extension) !== 1) {
                    file.icon = 'fa-file-pdf-o';
                } else if (['webm', 'avi', 'mp4', 'wmv', 'ogg', 'mpg', 'mpv', 'mpe'].indexOf(extension) !== 1) {
                    file.icon = 'fa-file-video-o';
                } else if (['mp3', 'oga', 'm4p', 'm4a', 'm4b', 'wav'].indexOf(extension) !== 1) {
                    file.icon = 'fa-file-audio-o';
                } else {
                    file.icon = 'fa-file-o';
                }
            }
            
            return file;
        })
    };
}

export function fetchFiles (categoryId) {
    return (dispatch) => {
        dispatch(requestFiles(categoryId));
        dispatch(setGridLoading(true));

        return fetch(`${ API_ENDPOINTS.filesList }?category=${ encodeURIComponent(categoryId) }`, {
            'credentials': 'same-origin'
        })
            .then(response => response.json())
            .then(json => {
                dispatch(setGridLoading(false));
                
                if (json && json.status) {
                    dispatch(receiveFiles(categoryId, json));
                } else if (json && json.message) {
                    dispatch(setErrorMessage(json.message));
                }

                return json;
            })
    };
}


/*
 * Delete files
 */


function removeFiles (ids) {
    return { type: REMOVE_FILES, ids };
}

function removeFolder (id) {
    return { type: REMOVE_FOLDER, id };
}


export function deleteSelectedListItems () {
    return (dispatch, getState) => {
        // Ids as array (numbers instead of string)
        const state = getState();
        const ids = map(state.selected, (value, key) => !isNaN(key) ? parseInt(key) : key);

        if (ids.length) {
            const message = (ids.length === 1 ?
                `Are you sure you want to delete the selected asset?` :
                `Are you sure you want to delete the selected ${ ids.length } assets?`);

            if (confirm(message)) {
                dispatch(setGridLoading(true));

                return fetch(API_ENDPOINTS.filesRemove, {
                    'method': 'POST',
                    'credentials': 'same-origin',
                    'headers': {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                    },
                    'body': decodeURIComponent($.param({'files': ids}))
                })
                    .then(response => response.json())
                    .then(json => {
                        dispatch(setGridLoading(false));
                        
                        if (json && json.status) {
                            dispatch(unsetAllSelectedListItems());
                            dispatch(removeFiles(ids));
                        } else if (json && json.message) {
                            dispatch(setErrorMessage(json.message));
                        }

                        return json;
                    });
            }
        } else if (state.categoryId !== state.tree.root) {
            const folderId = state.categoryId;
            const folderData = state.tree.folders[folderId];

            // Only if there are no files in the folder
            if (isEmpty(folderId, state)) {
                const confirmation = confirm(`Are you sure you want to delete the selected folder "${ folderData.name }"?`);

                if (confirmation) {
                    dispatch(setGridLoading(true));

                    return fetch(API_ENDPOINTS.folderRemove, {
                        'method': 'POST',
                        'credentials': 'same-origin',
                        'headers': {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                        },
                        'body': decodeURIComponent($.param({'folder': folderId}))
                    })
                        .then(response => response.json())
                        .then(json => {
                            dispatch(setGridLoading(false));
                            
                            if (json && json.status) {
                                dispatch(setCategory(folderData.parent));
                                dispatch(fetchFiles(folderData.parent));
                                dispatch(removeFolder(folderId));
                            } else if (json && json.message) {
                                dispatch(setErrorMessage(json.message));
                            }

                            return json;
                        });
                }
            } else {
                alert(`Can't delete folder "${ folderData.name }", because it's not empty!`);
            }
        }

        return Promise.resolve();
    };
};


/*
 * Upload files
 */

export function uploadedFiles (files) {
    return (dispatch, getState) => {
        const parents = uniq(map(files, file => file.parent));
        const categoryId = getState().categoryId;

        // Invalidate parent folders
        each(parents, parent => {
            dispatch(invalidateFolder(parent));

            if (parent == categoryId) {
                dispatch(fetchFiles(categoryId));
            }
        });
    };
}


/*
 * Replace files
 */

export function updatedFile (file) {
    return {
        type: UPDATED_FILE,
        file: file
    };
}


/*
 * Move files
 */

function movedFiles (ids, parentId) {
    return { type: MOVED_FILES, ids, parentId };
}

export function moveFiles(ids, parentId) {
    return (dispatch, getState) => {
        // Ids as array (numbers instead of string)
        const state = getState();
        const ids = map(state.selected, (value, key) => !isNaN(key) ? parseInt(key) : key);

        if (ids.length) {
            dispatch(setGridLoading(true));

            return fetch(API_ENDPOINTS.filesMove, {
                'method': 'POST',
                'credentials': 'same-origin',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                'body': decodeURIComponent($.param({'files': ids, 'parent': parentId}))
            })
                .then(response => response.json())
                .then(json => {
                    dispatch(setGridLoading(false));
                    
                    if (json && json.status) {
                        dispatch(movedFiles(ids, parentId));
                    } else if (json && json.message) {
                        dispatch(setErrorMessage(json.message));
                    }

                    return json;
                });
        }

        return Promise.resolve();
    };
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

export function invalidateFolder (id) {
    return { type: INVALIDATE_FOLDER, id };
};


/**
 * Set error message
 */

export function setErrorMessage (message) {
    return { type: SET_ERROR_MESSAGE, message };
}

export function hideErrorMessage () {
    return { type: HIDE_ERROR_MESSAGE };
}

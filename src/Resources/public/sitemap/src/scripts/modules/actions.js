import map from 'lodash/map';
import each from 'lodash/each';
import uniq from 'lodash/uniq';

import { isEmpty } from '../utils/hierarchy';
import 'whatwg-fetch';


/*
 * action types
 */

export const SET_TREE_LOADING = 'SET_TREE_LOADING';

export const RECEIVE_PAGE = 'RECEIVE_PAGE';
export const MOVED_PAGE = 'MOVED_PAGE';
export const REMOVE_PAGE = 'REMOVE_PAGE';

export const ADD_TEMPORARY_PAGE = 'ADD_TEMPORARY_PAGE';
export const REMOVE_TEMPORARY_PAGE = 'REMOVE_TEMPORARY_PAGE';


/*
 * Folders
 */

function receivePage (json) {
    return {
        type: RECEIVE_PAGE,
        page: json.data
    };
}

export function addPage(data) {
    return (dispatch) => {
        dispatch(setTreeLoading(true));

        return fetch(API_ENDPOINTS.pageAdd, {
            'method': 'POST',
            'credentials': 'same-origin',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            'body': decodeURIComponent($.param(data))
        })
            .then(response => response.json())
            .then(json => {
                // Add item to the list
                dispatch(setTreeLoading(false));

                if (json && json.status) {
                    dispatch(receivePage(json));

                    // Open edit page
                    const treeview = $('[data-widget="sitemap-treeview"]').data('treeview');
                    const url = treeview.getEditUrl(json.data);

                    if (url) {
                        document.location = url;
                    }
                }
            })
    };
}


function movedPage (id, reference, position) {
    return {
        type: MOVED_PAGE,
        id,
        reference,
        position
    };
}

export function movePage(id, reference, position) {
    return (dispatch) => {
        dispatch(setTreeLoading(true));

        return fetch(API_ENDPOINTS.pageMove, {
            'method': 'POST',
            'credentials': 'same-origin',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            'body': decodeURIComponent($.param({id, reference, position}))
        })
            .then(response => response.json())
            .then(json => {
                dispatch(setTreeLoading(false));

                if (json && json.status) {
                    dispatch(movedPage(id, reference, position));
                }
            })
    };
}


/*
 * Delete page
 */


function removePage (id) {
    return { type: REMOVE_PAGE, id };
}


export function deletePage (id) {
    return (dispatch, getState) => {
        const message = `Are you sure you want to delete the selected page?`;

        if (confirm(message)) {
            dispatch(setTreeLoading(true));

            return fetch(API_ENDPOINTS.pageRemove, {
                'method': 'POST',
                'credentials': 'same-origin',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                'body': decodeURIComponent($.param({'id': id}))
            })
                .then(response => response.json())
                .then(json => {
                    dispatch(setTreeLoading(false));

                    if (json && json.status) {
                        dispatch(removePage(id));
                    }
                });
        }

        return Promise.resolve();
    };
};


/**
 * Add / remove temporary page
 */

export function addTemporaryPage (reference, position, pageType) {
    return { type: ADD_TEMPORARY_PAGE, reference, position, pageType };
}

export function removeTemporaryPage () {
    return { type: REMOVE_TEMPORARY_PAGE };
}


/*
 * action creators
 */

export function setTreeLoading (loading) {
    return { type: SET_TREE_LOADING, loading };
};
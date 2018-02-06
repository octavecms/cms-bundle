import map from 'lodash/map';
import reduce from 'lodash/reduce';


function transformTreeBranch (folders) {
    let folderList = [];

    map(folders, (folder) => {
        folderList.push(folder);

        if (folder.children) {
            folderList.push(...transformTreeBranch(folder.children));
            folder.children = map(folder.children, folder => folder.id);
        }
    });

    return folderList;
}

function transformTreeRoot (state) {
    if (state.tree.root) {
        const folders = state.tree.folders.concat(transformTreeBranch([state.tree.root]));
        state.tree.folders = reduce(folders, (list, folder) => { list[folder.id] = folder; return list; }, {});
        state.tree.root = state.tree.root.id;
    }

    return state;
}

export default function (state) {
    return transformTreeRoot($.extend(true, {
        'tree': {
            // Root folder id; if an object is passed from MEDIA_INITIAL_STATE, then it will be transformed into 'folders'
            'root': null,

            'folders': [
                // {...folder information..}
            ]
        },

        // Opened category / folder id
        'categoryId': 0,

        // List of files in each category
        'categories': {
            // categoryId: [...list of file ids...]
        },

        // List of all known files
        'files': {
            // fileId: {...file information...}
        },

        // List of files in grid, matches categories[categoryId]
        'grid': {
            'loading': true,

            'dragging': [
                // ...list of file ids which are being dragged...
            ],

            'files': [
                // ...list of file ids...
            ]
        },

        // List of selected file ids
        'selected': {
            // fileId: 1
        },

        // Allow selecting multiple files
        'multiselect': true,

        // ID of opened file
        'opened': null,

        // Error message
        'error': {
            'visible': false,
            'message': '' 
        }
    }, window.MEDIA_INITIAL_STATE, state));
};
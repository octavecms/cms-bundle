module.exports = {
    'folders': {
        // Root folder id; if an object is passed from MEDIA_INITIAL_STATE, then it will be transformed into 'list'
        'root': null,

        // Opened folder id
        'selected': null,

        // List of all folders
        'list': {},

        // Folder tree, why do we need it???
        // 'tree': {}
    },

    'files': {
        // List of all known files
        'list': {},

        // List of file ids in the current folder grid
        'grid': [],

        // Selected file ids
        'selected': [],

        // Files list is loading
        'loading': true,

        // Search filter
        'searchFilter': '',
    },

    // Allow selecting multiple files
    'multiselect': true,

    // Error message
    'error': {
        'visible': false,
        'message': '' 
    }
};
import get from 'lodash/get';
import { getStaticState } from './actions-static-state';


export default function getInitialState (state) {
    const initialState = $.extend(true, {
        'folders': {
            // Root folder id; if an object is passed from MEDIA_INITIAL_STATE, then it will be transformed into 'list'
            'root': null,
    
            // Opened folder id
            'selected': 'root',
    
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

        // Allow selecting files
        'select': false,
    
        // Allow selecting multiple files (including folders)
        'multiselect': true,

        // Show root folder in the tree
        'showroot': true,

        // File filter, eg. 'images' to load only images
        'filter': null,
    
        // Error message
        'error': {
            'visible': false,
            'message': '' 
        }
    }, window.MEDIA_INITIAL_STATE, state);

    // Convert root from object into an id and move folders into a list
    if (initialState.folders.root && typeof initialState.folders.root === 'object') {
        const traverseTree = (node) => {
            node.disabled = node.disabled || false;
            node.loading = node.loading || false;
            node.expanded = node.expanded || false;
            
            initialState.folders.list[node.id] = node;

            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    traverseTree(node.children[i]);
                    node.children[i] = node.children[i].id;
                }
            }
        }

        traverseTree(initialState.folders.root);
        initialState.folders.root = initialState.folders.root.id;
    }

    // Validate and set selected folder id
    const staticSelectedFolder = get(getStaticState, ['folders', 'selected']);

    if (staticSelectedFolder && staticSelectedFolder in initialState.folders.list) {
        initialState.folders.selected = staticSelectedFolder;
    }

    // Auto-expand root
    if (initialState.folders.list.root) {
        initialState.folders.list.root.expanded = true;
    }

    return initialState;
}
import extend from 'lodash/extend';

export default function getInitialState (state) {
    const initialState = extend({
        // Page id
        'id': null,

        // Sections
        'sections': {
            // Section data
            'list': {},

            // Order, list of ids
            'order': []
        },

        // Iframe
        'iframe': {
            // Page initial html
            'html': '',

            // Iframe scroll position
            'scroll': 0,

            // Mouse position
            'mouse': {
                'x': 0,
                'y': 0
            },

            // Hovered section id
            'hovered': null,

            // Iframe section offsets and height
            'offsets': {},
            'heights': {},
        },

        // List of items which needs to be inserted into DOM
        // Insertion is done by VisualEditorIframe, so we set them here
        'insert': {

        },

        // Language
        'language': 'ru',

        // Loading state
        'loading': true
    }, window.VISUAL_EDITOR_INITIAL_STATE, state);

    return initialState;
}
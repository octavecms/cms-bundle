export default function getInitialState (state) {
    const initialState = $.extend(true, {
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

            // Iframe section offsets and height
            'offsets': [],
            'heights': [],

            // Selected section id
            'selected': null
        },

        // Language
        'language': 'ru',

        // Loading state
        'loading': true
    }, window.VISUAL_EDITOR_INITIAL_STATE, state);

    return initialState;
}
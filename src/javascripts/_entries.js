/*
* All files listed in here are created / compiled and additionally
* shared.js is automatically created, which contains all common JS (chunks / modules imported from more than 1 entry files).
*/
module.exports = {
    'admin': [
        './components/common/init',
        './components/dropdown',
        './components/tooltip',
        './components/accordion',
        './components/tabs',
        './components/form/select2',
        './components/form/input-max-length',
        './components/form/datetimepicker/datetimepicker',
        './components/form/image',
        './components/form/image-list',
        './components/form/number',
        './components/form/richtexteditor',
        './components/form/ajax-form',
        './components/sortable-list',
        './components/collection',
        './components/data-table',
        './components/modal',
        './components/ajax-modal-trigger',
        './components/section-title',
        './components/editable',
        './components/sticky-header',
        './components/scrollspy',
        './modules/active-state',
    ],
    'example-grid': [
        './components/common/init',
        './example-grid',
    ],

    // Media gallery
    'media': [
        './components/common/init',
        './components/lazy-load',
        './media/components/media',
    ],

    // Visual editor gallery
    'visual-editor': [
        './components/common/init',
        './visual-editor/components/visual-editor',
    ],
};

import MediaTreeView from './components/treeview';
import MediaGridList from './components/gridlist';
import uploader from './components/uploader';

import store from './modules/store';
import { addFolder, deleteSelectedListItems } from './modules/actions';


// Debug
window.store = store;


$(function () {
    uploader.init({'store': store});

    $('[data-widget="media-treeview"]').each(function () {
        new MediaTreeView($(this), {'store': store});
    });

    $('[data-widget="media-gridlist"]').each(function () {
        new MediaGridList($(this), {'store': store});

        $(this).on('click', '.js-media-remove', function (e) {
            store.dispatch(deleteSelectedListItems());
        });

        uploader.registerDropZone($(this), {
            'info': function () {
                return {
                    'parent': store.getState().categoryId
                };
            }
        });
    });

    $('.js-media-remove').on('click', function (e) {
        e.preventDefault();
        store.dispatch(deleteSelectedListItems());
    });

    $('.js-media-add-folder').on('click', function (e) {
        e.preventDefault();
        const name = prompt('Enter name of the folder');
        const parent = store.getState().categoryId;
        store.dispatch(addFolder(name, parent));
    });

    // Upload button
    uploader.registerButton($('.js-media-upload-file'), {
        'info': function (e) {
            return {
                'parent': store.getState().categoryId
            };
        }
    });
});
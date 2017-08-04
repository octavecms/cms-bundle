import MediaTreeView from './components/treeview';
import MediaGridList from './components/gridlist';

import store from './modules/store';
import { addFolder, deleteSelectedListItems } from './modules/actions';
window.store = store; // @TODO Remove global


$(function () {
    $('[data-widget="media-treeview"]').each(function () {
        new MediaTreeView($(this), {'store': store});
    });

    $('[data-widget="media-gridlist"]').each(function () {
        new MediaGridList($(this), {'store': store});
    });

    $('.js-media-remove').on('click', function (e) {
        e.preventDefault();
        store.dispatch(deleteSelectedListItems());
    });

    $('.js-media-add-folder').on('click', function (e) {
        e.preventDefault();
        const name = prompt('Enter name of the folder');
        store.dispatch(addFolder(name));
    });

    $('.js-media-upload-file').on('click', function (e) {
        e.preventDefault();
    });
});
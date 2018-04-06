import 'lib/jquery.clean-data';
import 'lib/promise-polyfill';
import 'modules/sitemap';

$(function () {
    $('[data-widget="sitemap"]').sitemap();
});
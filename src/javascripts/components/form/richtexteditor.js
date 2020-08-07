/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';
import 'util/jquery.inview';

import 'util/jquery.destroyed';
import namespace from 'util/namespace';

import tinymce from 'tinymce';
import 'tinymce/themes/silver/index';
import 'components/form/tinycme/icons';
import 'tinymce/plugins/code/index';
import 'tinymce/plugins/link/index';
import 'tinymce/plugins/lists/index'
import 'tinymce/plugins/paste/index';
import 'tinymce/plugins/table/index';
import 'tinymce/plugins/quickbars/index';
import 'tinymce/plugins/image/index';


/**
 * Sample component
 */
class RichTextEditor {

    static get Defaults () {
        return {
            contentCSS: '/assets/stylesheets/example-page-visual-editor.css',
            contentStyles: {},
        };
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.ns = namespace();

        $container.on('destroyed', this.destroy.bind(this));

        $container.inview({
            enter: this.createEditor.bind(this),
            destroyOnEnter: true,
            destroyOnLeave: true,
        });
    }

    createEditor () {
        const contentCSS = ['/assets/stylesheets/richtexteditor-inject.css'];

        if (this.options.contentCSS) {
            contentCSS.push(this.options.contentCSS);
        }

        tinymce.init({
            selector: `#${ this.$container.attr('id') }`,
            min_height: 400,
            // statusbar: false,
            branding: false,
            elementpath: false,
            skin: false,
            skin_url: null,

            // Plugins
            plugins: 'code link lists paste table quickbars image lists',
            
            // Styles{ title: 'Heading 4', format: 'h4' },
            content_css: contentCSS.concat(','),
            // content_style: this.options.contentStyles,

            style_formats: [
                { title: 'Paragraph', format: 'p' },
                { title: 'Heading 1', format: 'h1' },
                { title: 'Heading 2', format: 'h2' },
                { title: 'Heading 3', format: 'h3' },
                { title: 'Heading 4', format: 'h4' },

                // { title: 'Custom format', format: 'customformat' },
                { title: 'Custom format', inline: 'span', styles: { color: '#00ff00', fontSize: '20px' }, attributes: { title: 'My custom format'} , classes: 'example1' },
                { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' },
                { title: 'Image formats' },
                { title: 'Image Left', selector: 'img', styles: { 'float': 'left', 'margin': '0 10px 0 10px' } },
                { title: 'Image Right', selector: 'img', styles: { 'float': 'right', 'margin': '0 0 10px 10px' } },
            ],

            // Quick toolbar
            quickbars_selection_toolbar: 'bold | italic | styleselect | quicklink',
            quickbars_insert_toolbar: 'quickimage quicktable numlist bullist',
            quickbars_image_toolbar: 'alignleft aligncenter alignright',

            // Toolbar
            toolbar: '',
            // toolbar: 'styleselect bold italic',
            // toolbar_mode: 'floating',
            // toolbar: 'styleselect bold italic link lists code',

            // Menu:
            menubar: '',

            // Vertical resize
            resize: true,

            // Content filtering
            invalid_elements: 'script,style,link',

            valid_styles: {
                // Disable all inline CSS
                // see https://www.tiny.cloud/docs/configure/content-filtering/#valid_styles
                '*': ''
            },

            setup: (editor) => {
                window.editor = editor;

                // editor.ui.registry.addContextToolbar('lists', {
                //     predicate: function (node) {
                //         console.log(node);
                //         return false;
                //         // return node.nodeName.toLowerCase() === 'p'
                //     },
                //     items: 'alignleft aligncenter alignright',
                //     position: 'node',
                //     scope: 'node'
                // });
            }

        });
    }

    destroy () {
        // Cleanup global events
        $(window).add(document).off(`.${ this.ns }`);
    }

    ckToTinyStyles () {
        
    }
}

$.fn.richtexteditor = createPlugin(RichTextEditor);

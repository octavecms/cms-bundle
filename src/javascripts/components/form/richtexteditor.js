/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';
import 'util/jquery.inview';

import 'util/jquery.destroyed';
import namespace from 'util/namespace';

import tinymce from 'tinymce';
import 'tinymce/themes/silver/index';
import 'components/form/tinymce/icons';
import 'tinymce/plugins/code/index';
import 'tinymce/plugins/link/index';
import 'tinymce/plugins/lists/index'
import 'tinymce/plugins/paste/index';
import 'tinymce/plugins/table/index';
import 'tinymce/plugins/quickbars/index';
import 'tinymce/plugins/image/index';

import setupQuickLinkMediaLibraryLink from 'components/form/tinymce/quicklink-media-library';
import setupQuickBarsMediaLibraryImage from 'components/form/tinymce/quickbars-media-library';


/**
 * Sample component
 */
class RichTextEditor {

    static get Defaults () {
        return {
            body_class: '',
            content_css: [],
            content_style: '',

            style_formats: [],

            // Content filtering
            // https://www.tiny.cloud/docs/configure/content-filtering/#invalid_elements
            invalid_elements: 'script,style,link',

            // https://www.tiny.cloud/docs/configure/content-filtering/#invalid_styles
            // invalid_styles: {},
            
            // https://www.tiny.cloud/docs/configure/content-filtering/#valid_elements
            // valid_elements: '',

            // https://www.tiny.cloud/docs/configure/content-filtering/#extended_valid_elements
            // extended_valid_elements: '',

            // https://www.tiny.cloud/docs/configure/content-filtering/#valid_classes
            // valid_classes: {},

            // Disable all inline CSS, see https://www.tiny.cloud/docs/configure/content-filtering/#valid_styles
            valid_styles: {
                '*': ''
            },
        };
    }

    constructor ($container, opts) {
        console.log($container, opts);

        this.options = assign({}, this.constructor.Defaults, opts);
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
        const options = {...this.options};
        let id = this.$container.attr('id');

        if (!id) {
            id = namespace();
            this.$container.attr('id', id)
        }

        // Content CSS
        const contentCSS = [
            '/assets/stylesheets/richtexteditor-inject.css'
        ].concat(options.content_css).join(',');
        delete(options.content_css);

        // Style formats
        const formats = {...options.formats};
        delete(options.formats);

        const styleFormats = [
            { title: 'Paragraph', format: 'p' },
            { title: 'Heading 1', format: 'h1' },
            { title: 'Heading 2', format: 'h2' },
            { title: 'Heading 3', format: 'h3' },
            { title: 'Heading 4', format: 'h4' },
            { title: 'Heading 5', format: 'h5' },
        ].concat(options.style_formats)
        delete(options.style_formats);

        tinymce.init({
            selector: `#${ id }`,
            min_height: 460,
            branding: false,
            elementpath: false,
            skin: false,
            skin_url: null,

            // Plugins
            plugins: 'code link lists paste table quickbars image lists',

            // Styles
            body_class: '',
            content_css: contentCSS,
            content_style: '',

            formats: formats,
            style_formats: styleFormats,
            style_formats_autohide: true,

            // Quick toolbar
            quickbars_selection_toolbar: 'bold | italic | quicklink | styleselect',
            quickbars_insert_toolbar: 'quickimage-ml-insert | quicktable | numlist | bullist',
            quickbars_image_toolbar: 'quickimage-ml-replace | quicklink',

            // Hide toolbar, we use quickbar
            toolbar: '',
            // toolbar: 'styleselect bold italic',
            // toolbar_mode: 'floating',
            // toolbar: 'styleselect bold italic link lists code',

            // Hide menu, we use quickbar
            menubar: '',

            // Vertical resize
            resize: true,

            setup: (editor) => {
                window.editor = editor;
                
                setTimeout(() => {
                    setupQuickLinkMediaLibraryLink(editor);
                    setupQuickBarsMediaLibraryImage(editor);
                });
            },
            
            // Merge with options
            ...options
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

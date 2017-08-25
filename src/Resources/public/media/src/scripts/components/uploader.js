import fileupload from 'blueimp-file-upload';

import { uploadedFiles, updatedFile } from '../modules/actions';


let UID = 0;


class Uploader {
    static getInstance () {
        return Uploader.instance || (Uploader.instance = new Uploader());
    }

    constructor () {
        this.options = {};
        this.$input = null;
        this.uploadZones = {};
        this.activeUploadZone = null;
        this.dropTimeout = null;

        this.uploadComplete = [];
        this.$progress = $('.js-media-gridlist-progress');
        this.create();
    }

    setOptions (options) {
        this.options = $.extend(this.options, options);
        this.store   = this.options.store;
    }

    create () {
        this.$input = $('<input class="media-out-of-screen" type="file" name="files[]" multiple="multiple" />').appendTo('body');
        this.$input.fileupload({
            url: API_ENDPOINTS.filesUpload,
            dataType: 'json',
            done: this.handleFileUploadComplete.bind(this),
            progressall: this.handleFileUploadProgress.bind(this),
            submit: this.handleFileSubmit.bind(this),
            add: this.handleFileUpload.bind(this)
        });

        // Disable global drag / drop of files
        $(document).bind('dragover', this.handleDropZoneDragOver.bind(this));
        $(document).bind('drop dragover', this.handleGlobalDragOver.bind(this));
    }


    /*
     * Upload progress
     */

    handleAllFileUploadComplete () {
        const uploadComplete = this.uploadComplete;

        this.uploadComplete = [];
        this.store.dispatch(uploadedFiles(uploadComplete));
    }

    handleFileUploadComplete (e, data) {
        if (data.info && data.info.replace) {
            // Was replacing file
            this.store.dispatch(updatedFile(data.result.files[0]));
        } else {
            this.uploadComplete = this.uploadComplete.concat(data.result.files);
        }

        // Check if this was the last file
        if (this.$input.fileupload('active') === 1) {
            this.handleAllFileUploadComplete();
        }
    }

    handleFileUploadProgress (e, data) {
        const progress = data.loaded / data.total;

        this.$progress.removeClass('media-gridlist-progress--hidden')
            .children().css('width', progress * 100 + '%');

        if (progress === 1) {
            // Done
            setTimeout(this.hideUploadProgress.bind(this), 500);
        }
    }

    hideUploadProgress () {
        this.$progress.addClass('media-gridlist-progress--hidden');
    }


    /*
     * Drag / drop zones
     */


    handleGlobalDragOver (e) {
        e.preventDefault();
    }

    handleDropZoneDragOver (e) {
        const $dropZones = this.$input.fileupload('option', 'dropZone');

        if (this.dropTimeout) {
            clearTimeout(this.dropTimeout);
        } else {
            $dropZones.addClass('dropzone--in');
        }

        var $hoveredDropZone = $(e.target).closest($dropZones);

        $dropZones.not($hoveredDropZone).removeClass('dropzone--hover');
        $hoveredDropZone.addClass('dropzone--hover');

        this.dropTimeout = setTimeout(this.resetDropZones.bind(this), 100);
        this.activeUploadZone = $hoveredDropZone.data('dropZone');
    }

    resetDropZones () {
        const $dropZones = this.$input.fileupload('option', 'dropZone');
        this.dropTimeout = null;
        $dropZones.removeClass('dropzone--in dropzone--hover');
    }

    /**
     * Change url
     */
    handleFileSubmit (e, data) {
        // For file replace we use different url
        data.url = data.info && data.info.replace ? API_ENDPOINTS.filesReplace : API_ENDPOINTS.filesUpload;
    }

    /**
     * Before file uploaded we want to add additional data
     * to the request
     */
    handleFileUpload (e, data) {
        let info = null;

        if (!data.files[0].uploading) {
            data.files[0].uploading = true; // Prevent duplicate request

            if (data.info) {
                // Uploading using a "Browse" button, data is passed in using data.info
                info = data.info;
            } else if (this.activeUploadZone) {
                // Uploading file using drag and drop, data is in uploadZone map
                info = this.uploadZones[this.activeUploadZone];
            }

            if (info) {
                data.formData = (typeof info === 'function' ? info() : info);
                data.submit();
            }
        }
    }


    /*
     * Add / remove drop zones
     */


    registerDropZone ($element, data) {
        const options = $.extend({'info': {}}, data);
        const $dropZones = this.$input.fileupload('option', 'dropZone');
        const uid = ++UID;

        this.uploadZones[uid] = options.info;
        $element.data('dropZone', uid);
        $element.addClass('dropzone');

        this.$input.fileupload('option', 'dropZone', $dropZones.add($element));
    }

    unregisterDropZone ($element) {
        const $dropZones = this.$input.fileupload('option', 'dropZone');
        const uploadZones  = this.uploadZones;

        $element.each(function () {
            const uid = $(this).data('dropZone');
            if (uid && uid in uploadZones) {
                delete(uploadZones[uid]);
            }
        });

        $element.removeData('dropZone');
        $element.removeClass('dropzone');

        this.$input.fileupload('option', 'dropZone', $dropZones.not($element));
    }


    /*
     * Add / remove buttons
     */


    registerButton ($element, data) {
        const options = $.extend({'multiple': true, 'info': {}}, data);
        const $input = $(`<input class="media-out-of-screen" type="file" name="files[]" ${ options.multiple ? 'multiple="multiple"' : '' } />`);

        $element
            .addClass('media-upload-button')
            .append($input);

        $input.on('change', () => {
            const files = $input.get(0).files || [{name: this.value}];

            this.$input.fileupload('add', {
                files: files,
                fileInput: $input,
                info: options.info
            });
        });
    }

    unregisterButton ($element) {
        $element
            .removeClass('media-upload-button')
            .find('input').off('change').remove();
    }
}


export default {
    init (options) {
        Uploader.getInstance().setOptions(options);
    },
    registerDropZone ($element, data) {
        Uploader.getInstance().registerDropZone($element, data);
    },
    unregisterDropZone ($element) {
        Uploader.getInstance().unregisterDropZone($element);
    },
    registerButton ($element, data) {
        Uploader.getInstance().registerButton($element, data);
    },
    unregisterButton ($element) {
        Uploader.getInstance().unregisterButton($element);
    },
};
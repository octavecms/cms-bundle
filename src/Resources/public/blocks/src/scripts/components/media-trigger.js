const MEDIA_NAMESPACE = 'media';
const TRIGGER_NAMESPACE = 'mediaTrigger';


class MediaTrigger {

    static get defaultOptions () {
        return {
            'onselect': null
        };
    }

    constructor (element, options) {
        this.$element = $(element);
        this.options = $.extend(true, this.constructor.defaultOptions, this.options, options);

        this._init();
    }

    _init () {
        this.$element.on(`click.${ TRIGGER_NAMESPACE }`, this.open.bind(this));
        this.$modal = null;
        this.initialized = false;
    }

    _getModal () {
        if (!this.$modal) {
            this.$modal = $(`
                <div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                                <h4 class="modal-title"></h4>
                            </div>
                            <div class="modal-body js-modal-body">
                            </div>
                        </div>
                    </div>
                </div>`)
                    .appendTo('body');
        }

        return this.$modal;
    }

    destroy () {
        this.$element.off(`.${ TRIGGER_NAMESPACE }`).removeData(TRIGGER_NAMESPACE);
        this.$element = this.options = null;
    }

    _getMediaContent () {
        const mediaContent = $.Deferred();

        $.ajax('/admin/media/list?select_mode=1', {
            'dataType': 'html'
        }).done((html) => {
            const $html = $(html);
            const $content = $html.filter(':not(link, script, text)');
            const $meta = $html.filter('link, script');

            if (!this.initialized) {
                // Add CSS / JS only once
                this.initialized = true;
                $('head').append($meta);
            }

            mediaContent.resolve($content);
        });

        return mediaContent.promise();
    }

    _handleFileSelect (info) {
        this.$modal.modal('hide');

        if (typeof this.options.onselect === 'function') {
            this.options.onselect(info);
        }
    }

    open () {
        this._getMediaContent().done(($html) => {
            const $modal = this._getModal();
            const $body  = $modal.find('.js-modal-body');
            const $content = $html.clone();
            const $footer = $content.find('.modal-footer').remove();

            $body.append($content);
            $footer.insertAfter($body);

            $modal.modal();

            $modal.media({
                'multiselect': false,
                'selectmode': true,
                'onselect': this._handleFileSelect.bind(this)
            });

            // When modal is closed destroy media
            $modal.one('hidden.bs.modal', () => {
                $modal.media('destroy');
                $content.remove();
                $footer.remove();
            });
        });
    }
}


$.bridget(TRIGGER_NAMESPACE, MediaTrigger);
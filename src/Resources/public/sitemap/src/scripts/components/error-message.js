import { hideErrorMessage } from 'modules/actions';


export default class ErrorMessage {

    static get defaultOptions () {
        return {
            store: null
        };
    }

    constructor ($container, options) {
        this.$container = $container;
        this.$text = $container.find('[data-message-text]');
        this.options = $.extend({}, this.constructor.defaultOptions, options);

        const store = this.store = this.options.store;

        store.subscribePath('error.message', this.handleMessageChange.bind(this));
        store.subscribePath('error.visible', this.handleVisibilityChange.bind(this));

        $container.on('hidden.bs.modal', this.handleModalClose.bind(this));
    }

    handleModalClose () {
        this.store.dispatch(hideErrorMessage());
    }

    handleVisibilityChange (visible) {
        if (visible) {
            this.$container.modal('show');
        } else {
            this.$container.modal('hide');
        }
    }

    handleMessageChange (message) {
        this.$text.text(message);
    }
}
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';


/**
 * Set section title to input value
 */
class SectionTitle {

    static get Defaults () {
        return {
            'titleSelector': '.js-section-title-text'
        };
    }

    constructor ($container, opts) {
        const options = this.options = assign({}, this.constructor.Defaults, opts);
        this.$container = $container;
        this.$title = $container.find(options.titleSelector);
        this.title = this.$title.text();

        $container.on('change input', 'input, textarea, select', this.update.bind(this));
        this.update();
    }

    getTitle () {
        // First search for title
        const $container = this.$container;
        const $title = $container.find('[name*="[title]"]');
    
        if ($title.length) {
            return $title.val().replace(/(<([^>]+)>)/ig,"");
        }
    
        // Use any input we can find
        const $inputs = $container.find('input, textarea, select');
    
        for (let i = 0; i < $inputs.length; i++) {
            const $input = $inputs.eq(i);
            const inputValue = $input.val();
            let title = '';
    
            if ($input.is('textarea, [type="text"], [type="email"], [type="tel"], [type="url"], [type="date"], [type="number"]')) {
                title = inputValue;
            } else if ($input.is('.form-control-image input[type="hidden"]')) {
                // Image
                title = $input.closest('.form-control-image').find('.js-section-title-source').text() || inputValue;
            } else if ($input.is('select')) {
                title = $input.find('option').filter((_, option) => {
                    return option.value === inputValue;
                }).text();
            }
    
            title = title.replace(/.*\//, '').substr(0, 255);
    
            if (title) {
                return title;
            }
        }
    
        return '';
    }

    update () {
        const title = this.getTitle();

        if (title !== this.title) {
            const $title = this.$title;

            if (this.title && !title) {
                $title.parent().addClass('d-none');
            } else if (!this.title && title) {
                $title.parent().removeClass('d-none');
            }

            this.title = title;
            this.$title.text(title);

        }
    }
}

$.fn.sectionTitle = createPlugin(SectionTitle);

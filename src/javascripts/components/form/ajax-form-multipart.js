/* eslint no-unused-vars: ["off"] */
import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import assign from 'lodash/assign';

import map from 'lodash/map';
import AjaxForm from 'components/form/ajax-form';


/**
 * Form consisting of multiple parts / sections with accordion
 */
class AjaxFormMultipart extends AjaxForm {

    static get Defaults () {
        return assign({}, AjaxForm.Defaults, {
            'toggleButtonSelector': '.js-form-section-toggle',
            'backButtonSelector': '.js-form-section-back',
            'controller': 'accordion'
        });
    }

    constructor ($container, opts) {
        super($container, opts);

        if (this.options.controller === 'accordion') {
            this.controller = new MultipartAccordionAdapter(this.$form);
        } else {
            throw new Error(`Unsupported AjaxFormMultipart controller "${ this.options.controller }"`);
        }

        this.sections = map(Array(this.controller.getSectionCount()), (_section, index) => {
            return {
                'isValid': false
            };
        });

        $container.find(this.options.toggleButtonSelector).on('click', this.handleSectionToggle.bind(this));
        $container.find(this.options.backButtonSelector).on('click', this.sectionBack.bind(this));
    }

    submit () {
        if (this.isLoading) return; // prevent double submit

        if (this.sectionNext() !== false) {
            super.submit();
        }
    }

    handleSectionToggle (event) {
        const id = this.controller.getSectionIdByElement($(event.target));
        const index = this.controller.getSectionIndex(id);
        const activeIndex = this.controller.getActiveSectionIndex();
        const sections = this.sections;

        if (activeIndex > index) {
            // Changing to one of the previous sections, allow
        } else if (this.validateSection(activeIndex)) {
            if (sections[index - 1].isValid) {
                // Previous section (comparing to the one we try to open) is valid, allow opening
            } else {
                // Current section is valid, open next invalid section or the one user wants to open
                for (let i = 0; i < sections.length; i++) {
                    if (!sections[i].isValid || i === index) {
                        event.preventDefault();
                        this.controller.openSection(this.controller.getSectionId(i));
                        break;
                    }
                }
            }
        } else {
            // Current section is not valid, don't allow changing sections
            event.preventDefault();
        }
    }

    sectionBack () {
        const index = this.controller.getActiveSectionIndex();

        if (index > 0) {
            this.controller.openSection(this.controller.getSectionId(index - 1));
        }
    }

    /**
     * Validate currently opened section
     */
    validateSection (index) {
        const $inputs = this.controller.getSectionElement(this.controller.getSectionIndex(index)).find('input, select, textarea');

        if ($($inputs).valid()) {
            this.markSectionValid(index);
            return true;
        } else {
            this.markSectionInvalid(index);
            return false;
        }
    }

    markSectionValid (index) {
        this.sections[index].isValid = true;
    }
    markSectionInvalid (index) {
        const sections = this.sections;

        for (let i = index; i < sections.length; i++) {
            sections[i].isValid = false;
        }
    }

    sectionNext (event) {
        const index = this.controller.getActiveSectionIndex();

        if (this.validateSection(index)) {
            if (index < this.controller.getSectionCount() - 1) {
                // Open next section
                this.controller.openSection(this.controller.getSectionId(index + 1));
                return false;
            } else {
                // Submit form
                return true;
            }
        } else {
            return false;
        }
    }
}


class MultipartAccordionAdapter {
    constructor ($container) {
        this.$container = $container;
    }

    getSectionElement (id) {
        return this.$container.accordion('getContent', id);
    }
    getSectionIds () {
        return this.$container.accordion('getAllIds');
    }
    getSectionCount () {
        return this.getSectionIds().length;
    }
    getSectionId (index) {
        return this.getSectionIds()[index];
    }
    getSectionIdByElement ($element) {
        return this.$container.accordion('getId', $element);
    }
    getSectionIndex (id) {
        const ids = this.getSectionIds();
        return ids.indexOf(id);
    }
    getActiveSectionIndex () {
        const id = this.$container.accordion('getAllActiveIds');
        return this.getSectionIndex(id[0]);
    }
    openSection (id) {
        this.$container.accordion('open', id);
    }
}


$.fn.ajaxFormMultipart = createPlugin(AjaxFormMultipart, {
    // 'api': ['reset', 'enable', 'disable', 'addCustomResponseHandler', 'addCustomValidator'] // API methods
});

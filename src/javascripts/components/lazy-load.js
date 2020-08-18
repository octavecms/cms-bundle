import $ from 'util/jquery';
import createPlugin from 'jquery-plugin-generator';
import VanillaLazyLoad from 'vanilla-lazyload';
import assign from 'lodash/assign';

class LazyLoad {

    static get Defaults() {
        return {

            // IMG/IFRAME selector
            selector: '.js-lazy'
        };
    }

    constructor($scrollContainer, opts) {
        this.options = assign({}, this.constructor.Defaults, opts);

        this.lazyLoad = new VanillaLazyLoad({
            container: $scrollContainer[0],
            elements_selector: this.options.selector
        });

        $scrollContainer.on('destroyed', this.destroy.bind(this));
    }

    update() {
        this.lazyLoad.update();
    }

    loadAll() {
        this.lazyLoad.loadAll();
    }

    destroy() {
        this.lazyLoad.destroy();
    }
}

$.fn.lazyLoad = createPlugin(LazyLoad);

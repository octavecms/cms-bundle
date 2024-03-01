import $ from 'lib/jquery';

(function () {
    const original_shared_setup = Admin.shared_setup;

    Admin.shared_setup = function (element) {
        original_shared_setup.apply(this, Array.from(arguments));
        this.setup_box_widget(element);
    };
    Admin.shared_setup.original = original_shared_setup;

    Admin.setup_box_widget = function (element) {
        $(element).find('.box').addBack('.box').boxWidget();
    };
})();
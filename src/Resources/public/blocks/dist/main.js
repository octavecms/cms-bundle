!function e(t,n,i){function a(o,u){if(!n[o]){if(!t[o]){var l="function"==typeof require&&require;if(!u&&l)return l(o,!0);if(r)return r(o,!0);var s=new Error("Cannot find module '"+o+"'");throw s.code="MODULE_NOT_FOUND",s}var c=n[o]={exports:{}};t[o][0].call(c.exports,function(e){var n=t[o][1][e];return a(n?n:e)},c,c.exports,e,t,n,i)}return n[o].exports}for(var r="function"==typeof require&&require,o=0;o<i.length;o++)a(i[o]);return a}({1:[function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{"default":e}}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),o=e("jquery"),u=i(o),l='[data-widget="blocks-list"]',s='[data-widget="blocks-add"]',c='input[type="hidden"][name*="[order]"]',d=function(){function e(t){a(this,e),this.$container=t,this.index=t.find(c).length,t.addClass("blocks-list").sortable({placeholder:"sort-highlight",handle:".box-header",forcePlaceholderSize:!0,zIndex:999999,axis:"y",update:this.handleBlockAdd.bind(this),stop:this.updateBlockOrder.bind(this)}),t.on("click",'[data-widget="block-remove"]',this.handleBlockRemove.bind(this))}return r(e,[{key:"updateList",value:function(){this.$container.sortable("refresh"),this.updateBlockOrder()}},{key:"updateBlockOrder",value:function(){var e=this.$container.find(c);e.each(function(e,t){(0,u["default"])(t).val(e)})}},{key:"generateBlockHTML",value:function(e){var t=this.index++;return e.replace(/__name__/g,t)}},{key:"handleBlockAdd",value:function(e,t){var n=t.item.data("prototype");t.item.is(s)&&n&&(t.item.replaceWith(this.generateBlockHTML(n)),this.updateList())}},{key:"handleBlockRemove",value:function(e){var t=(0,u["default"])(e.target).closest(this.$container.children());t.length&&t.slideUp("fast",function(){t.remove(),this.updateList()}.bind(this))}}]),e}();(0,u["default"])(function(){(0,u["default"])(l).each(function(){new d((0,u["default"])(this))}),(0,u["default"])(s).addClass("blocks-add").draggable({connectToSortable:(0,u["default"])(l),helper:"clone",placeholder:"sort-highlight",zIndex:999999})})},{jquery:5}],2:[function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{"default":e}}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),o=e("jquery"),u=i(o),l="maxlength",s="input[maxlength], textarea[maxlength]",c=function(){function e(t,n){a(this,e),this.element=(0,u["default"])(t),this.options=u["default"].extend(!0,{maxlength:parseInt(this.element.attr("maxlength"),10)||512},this.options,n),this._init()}return r(e,[{key:"_init",value:function(){var e=this.element;e.on("input change",this.update.bind(this)),e.one("remove",this.destroy.bind(this)),this._render()}},{key:"_render",value:function(){var e=this.options.maxlength-this.element.val().length;this.group=(0,u["default"])('<div class="input-group"></div>'),this.addon=(0,u["default"])('<span class="input-group-addon" style="width: 1%;"></span>').text(e),this.group.insertAfter(this.element).append(this.element).append(this.addon)}},{key:"destroy",value:function(){this.element.off("."+l).removeData(l)}},{key:"update",value:function(){var e=this.options.maxlength-this.element.val().length;this.addon.text(e)}}]),e}();u["default"].bridget(l,c),(0,u["default"])(function(){(0,u["default"])(s).initialize(function(){(0,u["default"])(this)[l]()})})},{jquery:5}],3:[function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{"default":e}}var a=e("jquery"),r=i(a);r["default"].cleanData=function(e){return function(t){for(var n=void 0,i=0;null!=(n=t[i]);i++)try{var a=r["default"]._data(n,"events");a&&a.remove&&(0,r["default"])(n).triggerHandler("remove")}catch(o){}e(t)}}(r["default"].cleanData)},{jquery:5}],4:[function(e,t,n){"use strict";!function(e){var t=function(e,t){this.selector=e,this.callback=t},n=[];n.initialize=function(n,i){var a=[],r=function(){a.indexOf(this)==-1&&(a.push(this),e(this).each(i))};e(n).each(r),this.push(new t(n,r))};var i=new MutationObserver(function(t){for(var i=0;i<n.length;i++)e(n[i].selector).each(n[i].callback)});i.observe(document.documentElement,{childList:!0,subtree:!0,attributes:!0}),e.fn.initialize=function(e){n.initialize(this.selector,e)},e.initialize=function(e,t){n.initialize(e,t)}}(jQuery)},{}],5:[function(e,t,n){"use strict";t.exports=window.jQuery},{}],6:[function(e,t,n){"use strict";e("./lib/jquery.clean-data"),e("./lib/jquery.initialize"),e("./components/input.max-length"),e("./components/block-list")},{"./components/block-list":1,"./components/input.max-length":2,"./lib/jquery.clean-data":3,"./lib/jquery.initialize":4}]},{},[6]);
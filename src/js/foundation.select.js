/**
 * Foundation select by Samuel Moncarey
 * Licensed under MIT Open Source
 */

!function ($) {
    "use strict";

    /**
     * Select module.
     * @module foundation.select
     * @requires foundation.util.keyboard
     * @requires foundation.dropdown
     * @requires foundation.perfectScrollbar
     */

    class Select {

        constructor(select, options) {
            this.$select = select;

            if (!this.$select.is('select')) {
                console.warn('The select can only be used on a <select> element.');
                return;
            }

            this.options = $.extend({}, Select.defaults, this.$select.data(), options);

            if (this.$select.prop('multiple')) this._initMultiple();
            else this._init();

            Foundation.registerPlugin(this, 'Select');
            Foundation.Keyboard.register('Select', {
                'SPACE': 'open',
                'ESCAPE': 'close',
                'TAB': 'tab',
                'SHIFT_TAB': 'tab',
                'ARROW_UP': 'select_up',
                'ARROW_DOWN': 'select_down',
            });

        }

        /**
         * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
         * @function
         * @private
         */
        _initMultiple() {
            const _this = this;
            let $id = Foundation.GetYoDigits(6, 'select'),
                $label = $(`label[for="${this.$select.attr('id')}"]`),
                $wrapper = $('<div class="select-wrapper">'),
                $container = $('<div class="select-container">'),
                $scroll = $('<div data-perfect-scrollbar>');

            this.$select.wrap($wrapper);
            this.$select.after($container);

            this.$element = $(`<div id="${$id}" class="multiple-select" tabindex="0">`);
            this.$element.append($scroll);
            $container.append(this.$element);
            $label.attr('for', $id);

            this.$list = $('<ul>');
            $scroll.append(this.$list);

            this.$options = {};
            this.$autoSelect = [];
            this.$select.find('option').each(this._setOption.bind(this));

            this.$element.attr('placeholder', this.options.placeholder);

            $container.foundation();

            this._eventsMultiple();

            if (this.$autoSelect.length) {
                $.each(this.$autoSelect, (index, value) => {
                    _this.$options[value].find('a').trigger('click');
                });
            }
        }

        _init() {
            const _this = this;
            let $id = Foundation.GetYoDigits(6, 'select'),
                $ddId = Foundation.GetYoDigits(6, 'select-dropdown'),
                $label = $(`label[for="${this.$select.attr('id')}"]`),
                $wrapper = $('<div class="select-wrapper">'),
                $container = $('<div class="select-container">');

            this.$select.wrap($wrapper);
            this.$select.after($container);

            this.$element = $(`<input type="text" id="${$id}" data-toggle="${$ddId}" readonly>`);
            $container.append(this.$element);
            $label.attr('for', $id);

            this.$selectTriangle = $(`<i class="select-triangle fa ${this.options.iconClass}" data-toggle="${$ddId}">`);
            $container.append(this.$selectTriangle);

            this.$scroll = $('<div data-perfect-scrollbar>');
            this.$dropdown = $('<div>');
            this.$dropdown.attr({
                'id': $ddId,
                'class': 'select-dropdown',
                'data-dropdown': '',
                'data-v-offset': 0,
                'data-h-offset': 0,
                'data-close-on-click': true
            });
            this.$dropdown.append(this.$scroll);
            $container.append(this.$dropdown);

            this.$list = $('<ul>');
            this.$scroll.append(this.$list);

            this.$options = {};
            this.$autoSelect = [];
            this.$select.find('option').each(this._setOption.bind(this));

            this.$element.attr('placeholder', this.options.placeholder);

            $container.foundation();

            this._events();

            if (this.$autoSelect.length) {
                $.each(this.$autoSelect, (index, value) => {
                    _this.$options[value].find('a').trigger('click');
                });
            }
        }

        _setOption(index, option) {
            let value = $(option).val(), text = $(option).text();
            if (value == '') {
                this.options.placeholder = this.options.placeholder == '' ? text : this.options.placeholder;
                return;
            }
            if ($(option).is(':selected')) {
                this.$autoSelect[this.$autoSelect.length] = value;
            }
            this.$options[value] = $(`<li><a data-value="${value}">${text}</a></li>`).appendTo(this.$list);
        }

        _selectArrowDown(e) {
            e.preventDefault();
            const $selected = $(this.$list.find('a.selected')[this.$list.find('a.selected').length -1]);
            let $option;

            if ($selected.parent().is(':last-child')) {
                $option = $selected;
            }
            else if ($selected.length > 0) {
                $option = $selected.parent().next().find('a');
            }
            else {
                $option = this.$list.find('li:first-child a');
            }
            this.$select.val($option.data('value'));
            this.$element.val($option.text());
            this.$list.find('li a').removeClass('selected');
            $option.addClass('selected');

            if (this.$dropdown.hasClass('is-open')) {
                this.$scroll.foundation('scrollToElement', $option);
            }
        }

        _selectArrowUp(e) {
            e.preventDefault();
            const $selected = $(this.$list.find('a.selected')[this.$list.find('a.selected').length -1]);
            let $option;
            if ($selected.parent().is(':first-child')) return;
            if ($selected.length > 0) {
                $option = $selected.parent().prev().find('a');
            }
            else {
                $option = this.$list.find('li:last-child a');
            }
            this.$select.val($option.data('value'));
            this.$element.val($option.text());
            this.$list.find('li a').removeClass('selected');
            $option.addClass('selected');

            if (this.$dropdown.hasClass('is-open')) {
                this.$scroll.foundation('scrollToElement', $option);
            }
        }

        /**
         * Adds event listeners to the element utilizing the triggers utility library.
         * @function
         * @private
         */
        _eventsMultiple() {
            const _this = this;
            this.$element
                .add(this.$dropdown)
                .off('keybord.zf.dropdown')
                .on('keydown.zf.select', (e) => {
                    Foundation.Keyboard.handleKey(e, 'Select', {
                        select_down: () => _this._selectArrowDown(e),
                        select_up: () => _this._selectArrowUp(e)
                    });
                });

            $.each(this.$options, (index, option) => {
                var $target = $(option).find('a');
                $target.on('click', _this.select.bind(_this));
            });

        }

        /**
         * Adds event listeners to the element utilizing the triggers utility library.
         * @function
         * @private
         */
        _events() {
            const _this = this;
            this.$element
                .off('mousewheel.zf.select')
                .on('mousewheel.zf.select', (e) => {
                    if (e.originalEvent.deltaY > 0) _this._selectArrowDown(e);
                    else _this._selectArrowUp(e);
                })
                .add(this.$dropdown)
                .off('keybord.zf.dropdown')
                .on('keydown.zf.select', (e) => {
                    Foundation.Keyboard.handleKey(e, 'Select', {
                        open: () => {
                            if ($target.is(_this.$element)) {
                                _this.$dropdown.trigger('open');
                                _this.$dropdown.attr('tabindex', -1).focus();
                                e.preventDefault();
                            }
                        },
                        select_down: () => _this._selectArrowDown(e),
                        select_up: () => _this._selectArrowUp(e),
                        tab: () => {
                            _this.$dropdown.trigger('close');
                        },
                        close: () => {
                            _this.$dropdown.trigger('close');
                            _this.$element.focus();
                        }
                    });
                });

            $.each(this.$options, (index, option) => {
                var $target = $(option).find('a');
                $target.on('click', _this.select.bind(_this));
            });

        }

        select(e) {
            e.preventDefault();

            const $option = $(e.currentTarget),
                  _this = this;
            let unselect = false;

            if (this.$select.is('select[multiple]') && (e.ctrlKey || e.isTrigger)) {
                if (e.ctrlKey) {
                    $.each(this.$select.val(), function (index, value) {
                        if ($option.data('value') == value) {
                            let tempValue = _this.$select.val();
                            tempValue.splice(index, 1);
                            _this.$select.val(tempValue);
                            unselect = true;
                        }
                    });
                }
                if (!unselect) this.$select.val(($.isArray(this.$select.val()) ? this.$select.val():[]).concat($option.data('value')));
            }
            else if (this.$select.is('select[multiple]')) {
                this.$select.val($option.data('value'));
                this.$list.find('li a').removeClass('selected');
            }
            else {
                this.$select.val($option.data('value'));
                this.$element.val($option.text());
                this.$list.find('li a').removeClass('selected');
                this.$dropdown.trigger('close');
            }
            if (!unselect) $option.addClass('selected');
            else $option.removeClass('selected');
            this.$element.trigger('selected.zf.select');
            this.$select.trigger('change');
            this.$element.focus();
        }

        /**
         * Destroys the select.
         * @function
         */
        destroy() {
            this.$wrapper.after(this.$select.detach());
            this.$wrapper.remove();

            Foundation.unregisterPlugin(this);
        }

        static get defaults() {
            return {
                iconClass: 'fa-caret-down',
                placeholder: '',
                value: ''
            };
        }
    }

    // Window exports
    Foundation.plugin(Select, 'Select');

} (jQuery);

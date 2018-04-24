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
                $scroll = $('<div data-perfect-scrollbar data-theme="foundation-select">');

            this.$select.wrap($wrapper);
            this.$select.after($container);

            this.$element = $(`<div id="${$id}" class="multiple-select" tabindex="0">`);

            if (this.options.multiDisplayList) {
                this.$listDisplay = this._buildListDisplay($id);
                this.$element.append(this.$listDisplay);
            }

            this.$element.append($scroll);
            $container.append(this.$element);
            $label.attr('for', $id);

            this.$list = $('<ul>');
            $scroll.append(this.$list);

            this.$options = {};
            this.$autoSelect = [];
            this.$select.find('> *').each((index, option) => {
                if ($(option).is('optgroup')) {
                    _this._addGroup($(option), _this.$list);
                }
                if ($(option).is('option')) {
                    _this._addOption($(option), _this.$list);
                }
            });

            this.$element.attr('placeholder', this.options.placeholder);

            $container.foundation();

            this._eventsMultiple();

            if (this.$autoSelect.length) {
                $.each(this.$autoSelect, (index, value) => {
                    _this.$options[value].find('a').trigger('click');
                });
            }
        }

        _buildListDisplay($id) {
            let $display = $(`<div id="${$id}-display" class="list-display">`),
                $scroll = $('<div data-perfect-scrollbar data-suppress-scroll-y="true" data-use-both-wheel-axes="true" data-theme="foundation-multiselect-display">'),
                $list = $('<ul>');

            $list.append($(`<li>&nbsp;</li>`));
            $scroll.append($list);
            $display.append($scroll);
            return $display;
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
                'data-v-offset': this.options.dropdownOffset,
                'data-h-offset': 0,
                'data-close-on-click': true,
                'data-position': 'bottom',
                'data-alignment': 'right'
            });
            this.$dropdown.append(this.$scroll);
            $container.append(this.$dropdown);

            this.$list = $('<ul>');
            this.$scroll.append(this.$list);

            this.$options = {};
            this.$autoSelect = [];
            this._setPlaceholderOption();
            this.$select.find('> *').each((index, option) => {
                if ($(option).is('optgroup')) {
                    _this._addGroup($(option), _this.$list);
                }
                if ($(option).is('option')) {
                    _this._addOption($(option), _this.$list);
                }
            });

            this.$element.attr('placeholder', this.options.placeholder);

            $container.foundation();

            this._events();

            if (this.$autoSelect.length) {
                $.each(this.$autoSelect, (index, value) => {
                    _this.$options[value].find('a').trigger('click');
                });
            }
        }
      
        _setPlaceholderOption() {
            let hasEmptyOption;
            this.$select.find('option').each((index, option) => {
                if ($(option).val() == '') hasEmptyOption = true
            });
            if (!hasEmptyOption && this.options.placeholder != '') {
                this.$select.prepend($(`<option value="">${this.options.placeholder}</option>`));
            }
        }
        _addGroup($group, $parent) {
            let _this = this,
                label = $group.attr('label'),
                $groupItem = $('<li class="group-item">'),
                $groupLabel = $(`<a class="group-label">${label}</a>`),
                $groupOptions = $('<ul class="group-list">');

            $groupItem.append($groupLabel);
            $groupItem.append($groupOptions);
            $parent.append($groupItem);

            $group.find('> *').each((index, option) => {
                _this._addOption($(option), $groupOptions);
            });
        }

        _addOption($option, $parent) {
            let value = $option.val(),
                text = $option.text();
            if (value == '') {
                this.options.placeholder = this.options.placeholder == '' ? text : this.options.placeholder;
                return;
            }
            if ($option.is(':selected')) {
                this.$autoSelect[this.$autoSelect.length] = value;
            }
            this.$options[value] = $(`<li><a data-value="${value}">${text}</a></li>`).appendTo($parent);
        }

        _selectArrowDown(e) {
            e.preventDefault();
            const $selected = $(this.$list.find('a.selected')[0]);
            let $option;

            if ($selected.parent().is(':last-child')) {
                $option = $selected;

                if ($selected.parent().parent().is('.group-list') && !$selected.parents('.group-item').is(':last-child')) {
                    let $nextItem = $selected.parents('.group-item').next();
                    if ($nextItem.is('li:not(.group-item)')) $option = $nextItem.find('a');
                    if ($nextItem.is('.group-item')) $option = $nextItem.find('a + ul li:first-child a');
                }
            }
            else if ($selected.length > 0) {
                let $nextItem = $selected.parent().next();
                if ($nextItem.is('li:not(.group-item)')) $option = $nextItem.find('a');
                if ($nextItem.is('.group-item')) $option = $nextItem.find('a + ul li:first-child a');
            }
            else {
                $option = $(this.$list.find('li:first-child a')[0]);
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
            if ($selected.parent().is(':first-child')) {
                $option = $selected;

                if ($selected.parent().parent().is('.group-list') && !$selected.parents('.group-item').is(':first-child')) {
                    let $nextItem = $selected.parents('.group-item').prev();
                    if ($nextItem.is('li:not(.group-item)')) $option = $nextItem.find('a');
                    if ($nextItem.is('.group-item')) $option = $nextItem.find('a + ul li:last-child a');
                }
            }
            if ($selected.length > 0) {
                let $nextItem = $selected.parent().prev();
                if ($nextItem.is('li:not(.group-item)')) $option = $nextItem.find('a');
                if ($nextItem.is('.group-item')) $option = $nextItem.find('a + ul li:last-child a');
            }
            else {
                $option = $(this.$list.find('li:last-child a')[this.$list.find('li:last-child a').length -1]);
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
                let $target = $(option).find('a');
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
                    if (_this.$element.is(':focus') && _this.options.mousewheel) {
                        if (e.originalEvent.deltaY > 0) _this._selectArrowDown(e);
                        else _this._selectArrowUp(e);
                    }
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

            this.$dropdown.on('show.zf.dropdown', () => { _this.$element.focus(); });

            $.each(this.$options, (index, option) => {
                let $target = $(option).find('a');
                $target.on('click', _this.select.bind(_this));
            });

        }

        select(e) {
            e.preventDefault();

            const $option = $(e.currentTarget),
                  _this = this;
            let unselect = false;

            if (this.$select.is('select[multiple]')
                && (((e.ctrlKey || e.isTrigger) && this.options.multiSelectMethod === 'default')
                    || this.options.multiSelectMethod === 'mouse-only'))
            {
                if (e.ctrlKey || this.options.multiSelectMethod === 'mouse-only') {
                    $.each(this.$select.val(), (index, value) => {
                        if ($option.data('value') == value) {
                            let tempValue = _this.$select.val();
                            tempValue.splice(index, 1);
                            _this.$select.val(tempValue);
                            unselect = true;
                        }
                    });
                }
                if (!unselect) {
                    this.$select.val(($.isArray(this.$select.val()) ? this.$select.val():[]).concat($option.data('value')));
                    this._setListDisplayItem($option, false);
                }
                else {
                    let $list = this.$listDisplay.find('ul');
                    $list.find(`li[data-value="${$option.data('value')}"]`).remove();
                }
            }
            else if (this.$select.is('select[multiple]')) {
                this.$select.val($option.data('value'));
                this.$list.find('li a').removeClass('selected');
                if (this.options.multiDisplayList) {
                    this._setListDisplayItem($option, true);
                }
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

        _unSelect(e) {
            const _this = this;
            let $item = $(e.currentTarget).parent(),
                $option = this.$list.find(`a[data-value="${$item.data('value')}"]`),
                $list = this.$listDisplay.find('ul');

            $.each(this.$select.val(), (index, value) => {
                if ($option.data('value') == value) {
                    let tempValue = _this.$select.val();
                    tempValue.splice(index, 1);
                    _this.$select.val(tempValue);
                }
            });

            $list.find(`li[data-value="${$option.data('value')}"]`).remove();
            $option.removeClass('selected');
            this.$element.trigger('selected.zf.select');
            this.$select.trigger('change');
            this.$element.focus();
        }

        _setListDisplayItem($option, empty) {
            let $list = this.$listDisplay.find('ul'),
                label = this.$list.find(`a[data-value="${$option.data('value')}"]`).text(),
                $unselect = $('<a data-unselect>&times;</a>'),
                $item = $(`<li data-value="${$option.data('value')}">${label}</li>`);
            if (empty) {
                $list.empty();
                $list.append($(`<li>&nbsp;</li>`));
            }
            $item.append($unselect);
            $list.append($item);

            $unselect.on('click', this._unSelect.bind(this));
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
                value: '',
                mousewheel: true,
                dropdownOffset: 0,
                multiSelectMethod: 'default', //default|mouse-only
                multiDisplayList: true,
            };
        }
    }

    // Window exports
    Foundation.plugin(Select, 'Select');

} (jQuery);

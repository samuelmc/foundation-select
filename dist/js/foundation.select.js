'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

    var Select = function () {
        function Select(select, options) {
            _classCallCheck(this, Select);

            this.$select = select;

            if (!this.$select.is('select')) {
                console.warn('The select can only be used on a <select> element.');
                return;
            }

            this.options = $.extend({}, Select.defaults, this.$select.data(), options);

            if (this.$select.prop('multiple')) this._initMultiple();else this._init();

            Foundation.registerPlugin(this, 'Select');
            Foundation.Keyboard.register('Select', {
                'SPACE': 'open',
                'ESCAPE': 'close',
                'TAB': 'tab',
                'SHIFT_TAB': 'tab',
                'ARROW_UP': 'select_up',
                'ARROW_DOWN': 'select_down'
            });
        }

        /**
         * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
         * @function
         * @private
         */


        _createClass(Select, [{
            key: '_initMultiple',
            value: function _initMultiple() {
                var _this = this;
                var $id = Foundation.GetYoDigits(6, 'select'),
                    $label = $('label[for="' + this.$select.attr('id') + '"]'),
                    $wrapper = $('<div class="select-wrapper">'),
                    $container = $('<div class="select-container">'),
                    $scroll = $('<div data-perfect-scrollbar data-theme="foundation-select">');

                this.$select.wrap($wrapper);
                this.$select.after($container);

                this.$element = $('<div id="' + $id + '" class="multiple-select" tabindex="0">');

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
                this.$select.find('> *').each(function (index, option) {
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
                    $.each(this.$autoSelect, function (index, value) {
                        _this.$options[value].find('a').trigger('click');
                    });
                }
            }
        }, {
            key: '_buildListDisplay',
            value: function _buildListDisplay($id) {
                var $display = $('<div id="' + $id + '-display" class="list-display">'),
                    $scroll = $('<div data-perfect-scrollbar data-suppress-scroll-y="true" data-use-both-wheel-axes="true" data-theme="foundation-multiselect-display">'),
                    $list = $('<ul>');

                $list.append($('<li>&nbsp;</li>'));
                $scroll.append($list);
                $display.append($scroll);
                return $display;
            }
        }, {
            key: '_init',
            value: function _init() {
                var _this = this;
                var $id = Foundation.GetYoDigits(6, 'select'),
                    $ddId = Foundation.GetYoDigits(6, 'select-dropdown'),
                    $label = $('label[for="' + this.$select.attr('id') + '"]'),
                    $wrapper = $('<div class="select-wrapper">'),
                    $container = $('<div class="select-container">');

                this.$select.wrap($wrapper);
                this.$select.after($container);

                this.$element = $('<input type="text" id="' + $id + '" data-toggle="' + $ddId + '" readonly>');
                $container.append(this.$element);
                $label.attr('for', $id);

                this.$selectTriangle = $('<i class="select-triangle fa ' + this.options.iconClass + '" data-toggle="' + $ddId + '">');
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
                this.$select.find('> *').each(function (index, option) {
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
                    $.each(this.$autoSelect, function (index, value) {
                        _this.$options[value].find('a').trigger('click');
                    });
                }
            }
        }, {
            key: '_setPlaceholderOption',
            value: function _setPlaceholderOption() {
                var hasEmptyOption = void 0;
                this.$select.find('option').each(function (index, option) {
                    if ($(option).val() == '') hasEmptyOption = true;
                });
                if (!hasEmptyOption && this.options.placeholder != '') {
                    this.$select.prepend($('<option value="">' + this.options.placeholder + '</option>'));
                }
            }
        }, {
            key: '_addGroup',
            value: function _addGroup($group, $parent) {
                var _this = this,
                    label = $group.attr('label'),
                    $groupItem = $('<li class="group-item">'),
                    $groupLabel = $('<a class="group-label">' + label + '</a>'),
                    $groupOptions = $('<ul class="group-list">');

                $groupItem.append($groupLabel);
                $groupItem.append($groupOptions);
                $parent.append($groupItem);

                $group.find('> *').each(function (index, option) {
                    _this._addOption($(option), $groupOptions);
                });
            }
        }, {
            key: '_addOption',
            value: function _addOption($option, $parent) {
                var value = $option.val(),
                    text = $option.text();
                if (value == '') {
                    this.options.placeholder = this.options.placeholder == '' ? text : this.options.placeholder;
                    return;
                }
                if ($option.is(':selected')) {
                    this.$autoSelect[this.$autoSelect.length] = value;
                }
                this.$options[value] = $('<li><a data-value="' + value + '">' + text + '</a></li>').appendTo($parent);
            }
        }, {
            key: '_selectArrowDown',
            value: function _selectArrowDown(e) {
                e.preventDefault();
                var $selected = $(this.$list.find('a.selected')[0]);
                var $option = void 0;

                if ($selected.parent().is(':last-child')) {
                    $option = $selected;

                    if ($selected.parent().parent().is('.group-list') && !$selected.parents('.group-item').is(':last-child')) {
                        var $nextItem = $selected.parents('.group-item').next();
                        if ($nextItem.is('li:not(.group-item)')) $option = $nextItem.find('a');
                        if ($nextItem.is('.group-item')) $option = $nextItem.find('a + ul li:first-child a');
                    }
                } else if ($selected.length > 0) {
                    var _$nextItem = $selected.parent().next();
                    if (_$nextItem.is('li:not(.group-item)')) $option = _$nextItem.find('a');
                    if (_$nextItem.is('.group-item')) $option = _$nextItem.find('a + ul li:first-child a');
                } else {
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
        }, {
            key: '_selectArrowUp',
            value: function _selectArrowUp(e) {
                e.preventDefault();
                var $selected = $(this.$list.find('a.selected')[this.$list.find('a.selected').length - 1]);
                var $option = void 0;
                if ($selected.parent().is(':first-child')) {
                    $option = $selected;

                    if ($selected.parent().parent().is('.group-list') && !$selected.parents('.group-item').is(':first-child')) {
                        var $nextItem = $selected.parents('.group-item').prev();
                        if ($nextItem.is('li:not(.group-item)')) $option = $nextItem.find('a');
                        if ($nextItem.is('.group-item')) $option = $nextItem.find('a + ul li:last-child a');
                    }
                }
                if ($selected.length > 0) {
                    var _$nextItem2 = $selected.parent().prev();
                    if (_$nextItem2.is('li:not(.group-item)')) $option = _$nextItem2.find('a');
                    if (_$nextItem2.is('.group-item')) $option = _$nextItem2.find('a + ul li:last-child a');
                } else {
                    $option = $(this.$list.find('li:last-child a')[this.$list.find('li:last-child a').length - 1]);
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

        }, {
            key: '_eventsMultiple',
            value: function _eventsMultiple() {
                var _this = this;
                this.$element.add(this.$dropdown).off('keybord.zf.dropdown').on('keydown.zf.select', function (e) {
                    Foundation.Keyboard.handleKey(e, 'Select', {
                        select_down: function select_down() {
                            return _this._selectArrowDown(e);
                        },
                        select_up: function select_up() {
                            return _this._selectArrowUp(e);
                        }
                    });
                });

                $.each(this.$options, function (index, option) {
                    var $target = $(option).find('a');
                    $target.on('click', _this.select.bind(_this));
                });
            }

            /**
             * Adds event listeners to the element utilizing the triggers utility library.
             * @function
             * @private
             */

        }, {
            key: '_events',
            value: function _events() {
                var _this = this;
                this.$element.off('mousewheel.zf.select').on('mousewheel.zf.select', function (e) {
                    if (_this.$element.is(':focus') && _this.options.mousewheel) {
                        if (e.originalEvent.deltaY > 0) _this._selectArrowDown(e);else _this._selectArrowUp(e);
                    }
                }).add(this.$dropdown).off('keybord.zf.dropdown').on('keydown.zf.select', function (e) {
                    Foundation.Keyboard.handleKey(e, 'Select', {
                        open: function open() {
                            if ($target.is(_this.$element)) {
                                _this.$dropdown.trigger('open');
                                _this.$dropdown.attr('tabindex', -1).focus();
                                e.preventDefault();
                            }
                        },
                        select_down: function select_down() {
                            return _this._selectArrowDown(e);
                        },
                        select_up: function select_up() {
                            return _this._selectArrowUp(e);
                        },
                        tab: function tab() {
                            _this.$dropdown.trigger('close');
                        },
                        close: function close() {
                            _this.$dropdown.trigger('close');
                            _this.$element.focus();
                        }
                    });
                });

                this.$dropdown.on('show.zf.dropdown', function () {
                    _this.$element.focus();
                });

                $.each(this.$options, function (index, option) {
                    var $target = $(option).find('a');
                    $target.on('click', _this.select.bind(_this));
                });
            }
        }, {
            key: 'select',
            value: function select(e) {
                e.preventDefault();

                var $option = $(e.currentTarget),
                    _this = this;
                var unselect = false;

                if (this.$select.is('select[multiple]') && ((e.ctrlKey || e.isTrigger) && this.options.multiSelectMethod === 'default' || this.options.multiSelectMethod === 'mouse-only')) {
                    if (e.ctrlKey || this.options.multiSelectMethod === 'mouse-only') {
                        $.each(this.$select.val(), function (index, value) {
                            if ($option.data('value') == value) {
                                var tempValue = _this.$select.val();
                                tempValue.splice(index, 1);
                                _this.$select.val(tempValue);
                                unselect = true;
                            }
                        });
                    }
                    if (!unselect) {
                        this.$select.val(($.isArray(this.$select.val()) ? this.$select.val() : []).concat($option.data('value')));
                        this._setListDisplayItem($option, false);
                    } else {
                        var $list = this.$listDisplay.find('ul');
                        $list.find('li[data-value="' + $option.data('value') + '"]').remove();
                    }
                } else if (this.$select.is('select[multiple]')) {
                    this.$select.val($option.data('value'));
                    this.$list.find('li a').removeClass('selected');
                    if (this.options.multiDisplayList) {
                        this._setListDisplayItem($option, true);
                    }
                } else {
                    this.$select.val($option.data('value'));
                    this.$element.val($option.text());
                    this.$list.find('li a').removeClass('selected');
                    this.$dropdown.trigger('close');
                }
                if (!unselect) $option.addClass('selected');else $option.removeClass('selected');
                this.$element.trigger('selected.zf.select');
                this.$select.trigger('change');
                this.$element.focus();
            }
        }, {
            key: '_unSelect',
            value: function _unSelect(e) {
                var _this = this;
                var $item = $(e.currentTarget).parent(),
                    $option = this.$list.find('a[data-value="' + $item.data('value') + '"]'),
                    $list = this.$listDisplay.find('ul');

                $.each(this.$select.val(), function (index, value) {
                    if ($option.data('value') == value) {
                        var tempValue = _this.$select.val();
                        tempValue.splice(index, 1);
                        _this.$select.val(tempValue);
                    }
                });

                $list.find('li[data-value="' + $option.data('value') + '"]').remove();
                $option.removeClass('selected');
                this.$element.trigger('selected.zf.select');
                this.$select.trigger('change');
                this.$element.focus();
            }
        }, {
            key: '_setListDisplayItem',
            value: function _setListDisplayItem($option, empty) {
                var $list = this.$listDisplay.find('ul'),
                    label = this.$list.find('a[data-value="' + $option.data('value') + '"]').text(),
                    $unselect = $('<a data-unselect>&times;</a>'),
                    $item = $('<li data-value="' + $option.data('value') + '">' + label + '</li>');
                if (empty) {
                    $list.empty();
                    $list.append($('<li>&nbsp;</li>'));
                }
                $item.append($unselect);
                $list.append($item);

                $unselect.on('click', this._unSelect.bind(this));
            }

            /**
             * Destroys the select.
             * @function
             */

        }, {
            key: 'destroy',
            value: function destroy() {
                this.$wrapper.after(this.$select.detach());
                this.$wrapper.remove();

                Foundation.unregisterPlugin(this);
            }
        }], [{
            key: 'defaults',
            get: function get() {
                return {
                    iconClass: 'fa-caret-down',
                    placeholder: '',
                    value: '',
                    mousewheel: true,
                    dropdownOffset: 0,
                    multiSelectMethod: 'default', //default|mouse-only
                    multiDisplayList: true
                };
            }
        }]);

        return Select;
    }();

    // Window exports


    Foundation.plugin(Select, 'Select');
}(jQuery);
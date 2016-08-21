
!function ($) {
    "use strict";
    
    class Select {
        
        constructor(select, options) {
            this.$select = select;

            if (!this.$select.is('select')) {
                console.warn('The select can only be used on a <select> element.');
                return;
            }

            this.options = $.extend({}, Select.defaults, this.$select.data(), options);
            this._init();

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
        _init() {
            var $id = Foundation.GetYoDigits(6, 'select'),
                $ddId = Foundation.GetYoDigits(6, 'select-dropdown'),
                $label = $(`label[for="${this.$select.attr('id')}"]`),
                $wrapper = $('<div class="select-wrapper">'),
                $container = $('<div class="select-container">'),
                $scroll = $('<div class="select-dropdown-scroll-container" data-perfect-scrollbar>');

            this.$select.wrap($wrapper);
            this.$select.after($container);

            this.$element = $('<input>');
            this.$element.attr({
                'type': 'text',
                'id': $id,
                'readonly': '',
                'data-toggle': $ddId
            });
            $container.append(this.$element);
            $label.attr('id', $id);

            this.$selectTriangle = $('<i>');
            this.$selectTriangle.attr({
                'class': 'select-triangle fa fa-caret-down',
                'data-toggle': $ddId
            });
            $container.append(this.$selectTriangle);

            this.$dropdown = $('<div>');
            this.$dropdown.attr({
                'id': $ddId,
                'class': 'select-dropdown',
                'data-dropdown': '',
                'data-v-offset': 0,
                'data-h-offset': 0,
                'data-close-on-click': true
            });
            this.$dropdown.append($scroll);
            $container.append(this.$dropdown);

            this.$list = $('<ul>');
            $scroll.append(this.$list);

            this.$options = [];
            this.$autoSelect = false;
            this.$select.find('option').each(this._setOption.bind(this));

            this.$element.attr('placeholder', this.options.placeholder);

            $container.foundation();

            this._events();

            if (this.$autoSelect !== false) this.$options[this.$autoSelect].trigger('click');
        }

        _setOption(index, option) {
            if ($(option).val() == '') {
                this.options.placeholder = this.options.placeholder == '' ? $(option).text() : this.options.placeholder;
                return;
            }
            if ($(option).val() == this.options.value || $(option).attr('selected')) this.$autoSelect = index;
            this.$options[index] = $(`<li><a data-value="${$(option).val()}">${$(option).text()}</a></li>`).appendTo(this.$list);
        }

        /**
         * Adds event listeners to the element utilizing the triggers utility library.
         * @function
         * @private
         */
        _events() {
            var _this = this;
            this.$element
                .add(this.$dropdown)
                .off('keybord.zf.dropdown')
                .on('keydown.zf.select', function(e) {
                    Foundation.Keyboard.handleKey(e, 'Select', {
                        open: function() {
                            if ($target.is(_this.$element)) {
                                _this.$dropdown.trigger('open');
                                _this.$dropdown.attr('tabindex', -1).focus();
                                e.preventDefault();
                            }
                        },
                        select_down: function () {
                            var $selected = _this.$list.find('a.selected'),
                                $option;
                            if ($selected.length > 0 && !$selected.parent().is(':last-child')) {
                                $option = $selected.parent().next().find('a');
                            }
                            else {
                                $option = _this.$list.find('li:first-child a');
                            }
                            _this.$select.val($option.data('value'));
                            _this.$element.val($option.text());
                            _this.$list.find('li a').removeClass('selected');
                            $option.addClass('selected');
                            e.preventDefault();

                        },
                        select_up: function () {
                            var $selected = _this.$list.find('a.selected'),
                                $option;
                            if ($selected.length > 0 && !$selected.parent().is(':first-child')) {
                                $option = $selected.parent().prev().find('a');
                            }
                            else {
                                $option = _this.$list.find('li:last-child a');
                            }
                            _this.$select.val($option.data('value'));
                            _this.$element.val($option.text());
                            _this.$list.find('li a').removeClass('selected');
                            $option.addClass('selected');
                            e.preventDefault();

                        },
                        tab: function() {
                            _this.$dropdown.trigger('close');
                        },
                        close: function() {
                            _this.$dropdown.trigger('close');
                            _this.$element.focus();
                        }
                    });
                });

            $.each(this.$options, function () {
                var $target = $(this).find('a');
                $target.on('click', _this.select.bind(_this));
            });

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

        select(e) {
            e.preventDefault();
            var $option = $(e.currentTarget);
            this.$select.val($option.data('value'));
            this.$element.val($option.text());
            this.$list.find('li a').removeClass('selected');
            $option.addClass('selected');
            this.$dropdown.trigger('close');
            this.$element.focus();
        }
    }

    Select.defaults = {
        /**
         * Number of pixels between the select pane and the triggering element on open.
         * @option
         * @example 1
         */
        vOffset: 0,
        /**
         * Number of pixels between the select pane and the triggering element on open.
         * @option
         * @example 1
         */
        hOffset: 0,
        /**
         * Class applied to adjust open position. JS will test and fill this in.
         * @option
         * @example 'top'
         */
        positionClass: 'bottom',
        /**
         * Allows a click on the body to close the select.
         * @option
         * @example false
         */
        closeOnClick: true,
        placeholder: '',
        value: ''
    };

    // Window exports
    Foundation.plugin(Select, 'Select');

} (jQuery);

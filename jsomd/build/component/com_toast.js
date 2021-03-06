;(function(root, factory) {
    root.babelComponent.toast = factory();
}(this, function() {
    var name = 'toast';
    var optStr = name + 'Opt';
    var instanceStr = name + 'Instance';

    var Toast = function(item, options) {
        this.element = item;
        this._init(options);
    };

    Toast.prototype = {
        version:'1.0.0',
        playID: -1,
        node:   '',
        _init: function(options) {
            var self = this;
            var item = this.element;
            var settings = this._getSettings(item);
            var merageSettings = settings ? settings : $.fn.toast.defaults;
            settings = $.extend({}, merageSettings, options);
            var domConfig = self._initDomConfig();
            settings = $.extend({}, settings, domConfig);
            self._setSettings(item, settings);
            self._renderHandler();
        },
        _initDomConfig: function() {
            var self = this;
            var item = this.element;
            var domConfig = {};
            var dataValue;
            for (var i in $.fn.toast.defaults) {
                dataValue = item.attr('data-' + i);
                if(dataValue) {
                    domConfig[i] = dataValue;
                }
            }
            return domConfig;
        },
        _renderHandler: function() {
            var self = this;
            var item = this.element;
            if($('#J_toast').length > 0) {
                self.node = $('.jdui_toast');
                return;
            }
            var settings = self._getSettings(item);

            var html =  '<div id="J_toast" class="jdui_toast animated fadeIn">' +
                        '<span class="jdui_icon"></span>' +
                        '<div class="jdui_text"></div>' +
                        '</div>';
            self.node = $(html);
            self.node.addClass(settings.conCls);
            self.node.find('.jdui_text').html(settings.content);
            if (settings.iconCls) {
                self.node.find('.jdui_icon').addClass(settings.iconCls);
            } else {
                self.node.find('.jdui_icon').attr('class', 'jdui_icon');
            }
            $('body').append(self.node);
        },
        _getSettings: function(item) {
            return item.data(optStr);
        },
        _setSettings: function(item, options) {
            item.data(optStr, options);
        },
        show: function(options) {
            var self = this;
            var item = this.element;
            var settings = self._getSettings(item);
            if(options) {
                settings = $.extend({}, settings, options);
            }
            self._setSettings(item, settings);
            self.node.attr('class', 'jdui_toast animated fadeIn');  
            self.node.addClass(settings.conCls);
            self.node.find('.jdui_text').html(settings.content);
            self.node.find('.jdui_icon').attr('class', 'jdui_icon');    
            if (settings.iconCls) {
                self.node.find('.jdui_icon').addClass(settings.iconCls);
            }
            if (self.node.css('display') !== 'none') {
                return;
            } else {
                self.node.css({
                   'display' : 'inline-block'
                });
                setTimeout(function() {
                    self.node.css({
                        'opacity': 1,
                        '-webkit-transform': 'translate3d(-50%, -30px, 0)',
                        'transform': 'translate3d(-50%, -30px, 0)'
                    });
                }, 50);
            }

            clearTimeout(self.playID);
            self.playID = setTimeout(function() {
                self.node.css({
                    'opacity': 0,
                    '-webkit-transform': 'translate3d(-50%, 0, 0)',
                    'transform': 'translate3d(-50%, 0, 0)'
                });
                setTimeout(function() {
                    self.node.css({
                        'display' : 'none'
                    });
                }, 50);
            }, settings.showTime);
        },
        hide: function() {
            var self = this;
            clearTimeout(self.playID);
            setTimeout(function(){
                self.node.css({
                    'opacity': 0,
                    '-webkit-transform': 'translate3d(-50%, 0, 0)',
                    'transform': 'translate3d(-50%, 0, 0)'
                });
                setTimeout(function() {
                    self.node.css({
                        'display' : 'none'
                    });
                }, 50);
            }, 300);
        }
    };

    var methods = {
        init: function(options) {
            this.each(function() {
                var $this = $(this);
                if (!$this.data(instanceStr)) {
                    $this.data(instanceStr, new Toast($this, options));
                }
            });
        },
        instance: function() {
            var arr = [];
            this.each(function() {
                arr.push($(this).data(instanceStr));
            });
            return arr;
        },
        show: function(config) {
            var $this = $(this);
            var instance = $this.data(instanceStr);
            if(instance) {
                instance.show(config);
            }
        },
        hide: function() {
            var $this = $(this);
            var instance = $this.data(instanceStr);
            if(instance){
                instance.hide();
            }
        }
    };

    $.fn.toast = function(){
        var method = arguments[0];
        if (methods[method]) {
            if (!this.data(instanceStr)) {
                console.error('please init toast first');
                return;
            }
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof(method) === 'object' || !method) {
            method = methods.init;
        } else {
            console.error('Method ' + method + ' does not exist on zepto.tab');
            return this;
        }
        return method.apply(this, arguments);
    };

    $.fn.toast.defaults = {
        content:    '提示信息',
        conCls:     '',
        iconCls:    '',
        showTime:   2000
    };

    return Toast;

}));
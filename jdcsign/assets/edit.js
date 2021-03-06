//edit
$(function() {
  //utils
  //二次包装接口 - localst
  var LS = window.localStorage
  window.LS = {
    set: function(key, value) {
      //fixed iPhone/iPad 'QUOTA_EXCEEDED_ERR' bug
      if (this.get(key) !== undefined)
        this.remove(key);
      LS.setItem(key, value);
      this.length = LS.length;
    },
    //查询不存在的key时，有的浏览器返回null，这里统一返回undefined
    get: function(key) {
      var v = LS.getItem(key);
      return v === null ? undefined : v;
    },
    remove: function(key) {
      LS.removeItem(key);
      this.length = LS.length;
    },
    clear: function() {
      LS.clear();
      this.length = 0;
    },
    //本地存储数据遍历，callback接受两个参数 key 和 value，如果返回false则终止遍历
    each: function(callback) {
      var list = this.obj(),
        fn = callback || function() {},
        key;
      for (key in list)
        if (fn.call(this, key, this.get(key)) === false)
          break;
    },
    //返回一个对象描述的localStorage副本
    obj: function() {
      var list = {},
        i = 0,
        n, key;
      if (LS.isVirtualObject) {
        list = LS.key(-1);
      } else {
        n = LS.length;
        for (; i < n; i++) {
          key = LS.key(i);
          list[key] = this.get(key);
        }
      }
      return list;
    },
    length: LS.length
  };


  //main
  var edit = {
    inputArr: $('.edit input'),
    isGenerate: false,
    cropObj: {},
    init: function() {
      var me = this;
      me.resizeView();
      me.bindHandler();
      me.renderLocalData();
    },
    resizeView: function() {
      var me = this;
      //clean
      $('body').attr('style', '');
      //resize
      var bodyOffset = $('body').css('padding-bottom');
      bodyOffset = Number(bodyOffset.replace('px', ''));
      var totalH = $(document).height();
      var bodyH = $('body').height() + bodyOffset;
      if (bodyH < totalH) {
        $('body').height(totalH - bodyOffset);
      }
      $('.feedback').css('display', 'block');
    },
    bindHandler: function() {
      var me = this;
      me.inputArr.on('input propertychange', function() {
        var data = $(this).val();
        //preview
        var preStr = $(this).attr('data-preview');
        var preveiwNode = $('.preview ' + preStr);
        preveiwNode.show();
        preveiwNode.parent().show();
        preveiwNode.text(data);
      });
      me.inputArr.on('blur', function() {
        var data = $(this).val();
        //preview
        var preStr = $(this).attr('data-preview');
        var preveiwNode = $('.preview ' + preStr);
        //exclude
        if (preStr && preStr.match('mood')) {
          return;
        }
        if (preStr && preStr.match('name')) {
          if (data.length == 0) {
            preveiwNode.hide();
          }
          return;
        }
        if (data.length == 0) {
          preveiwNode.parent().hide();
        }
      });
      //jobType
      $('#J_jobType').on('change', function() {
        var cls = $(this).val();
        cls = 'team-icon ' + cls;
        $('.team-icon').attr('class', cls);
      });
      //teamType
      $('#J_teamType').on('change', function() {
        var str = $(this).find('option:selected').text();
        $('.team-type').text(str);
      });
      $('#J_teamOther input:checkbox').on('change', function() {
        var check = $(this).prop('checked');
        $('#J_teamType').prop('disabled', check);
        $('#J_teamOther input:text').prop('disabled', !check);
        //data
        if (check) {
          $('#J_teamOther input:text').trigger('propertychange');
        } else {
          $('#J_teamType').change();
        }
      });
      //phoneNum
      $('#J_phoneNum').on('blur', function() {
        var str = $(this).val();
        var first = 3,
          second = 7,
          third = 11;
        var maxLen = third + 2;
        if (str.length < third || str.length == maxLen) {
          return;
        }
        var formatStr = str.substring(0, first) + "-" +
          str.substring(first, second) + "-" +
          str.substring(second, str.length);
        $(this).val(formatStr);
        $(this).trigger('propertychange');
      });
      //clear
      $('#J_clearContact').on('click', function(e) {
        var contactArr = $('.edit .input-contact');
        contactArr.val('');
        contactArr.trigger('blur');
      });
      //generate
      $('#J_getSignImg').on('click', function(e) {
        e.preventDefault();
        if (me.isGenerate) {
          return;
        }
        //disabled
        me.isGenerate = true;
        $(this).text('正在生成签名...');
        $(this).addClass('disabled');
        me.generateImg();
        me.generateData();
      });
      //upload avastar
      $('.file_image').fileupload({
        url: 'uploadPic.php',
        dataType: 'json',
        autoUpload: true,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxFileSize: 5000000, // 5 MB
        start: function(e) {
          $(this).parents('.upload-button').addClass('disabled');
          $(this).hide();
        },
        done: function(e, data) {
          var result = data.result;
          if (result.status == 'success') {
            var node = $('.avatar img');
            if ($(this).attr('name') == 'upload_logo') {
              node = $('.logo img');
              me.renderImage(result.url, node);
            } else { //avatar
              me.renderCropPopup(result);
              me.showCrop(result);
            }
          } else {
            alert(result.msg);
          }
          $(this).parents('.upload-button').removeClass('disabled');
          $(this).show();
        }
      });
      //avatar-default
      $('#J_avatarDefault img').on('click', function() {
        var url = $(this).attr('src');
        var node = $('.avatar img');
        me.renderImage(url, node);
      });
      //crop-event
      $('#J_imageCropPopup').on('click', function(e) {
        var target = $(e.target);
        if (target.hasClass('popup')) {
          //close
          $('#J_imageCropPopup .btn-close').click();
        }
      });
      $('#J_imageCropPopup .btn-close').on('click', function(e) {
        $('#J_imageCropPopup').stop().fadeOut(200);
      });
      $('#J_imageCropPopup .btn-confirm').on('click', function(e) {
        var data = $('#J_imgTarget').data('cropData');
        if (!data || data.w == 0) {
          $('#J_imageCropPopup .alert').fadeIn();
          return;
        }
        var imgUrl = $('#J_imgTarget').attr('src');
        //send data
        $.ajax({
          url: 'uploadPic.php',
          type: 'POST',
          dataType: 'json',
          data: {
            type: 'crop',
            data: data,
            img: imgUrl
          },
          success: function(data) {
            console.log(data, data.url);
            var node = $('.avatar img');
            me.renderImage(data.url, node);
          }
        });
        //close
        $('#J_imageCropPopup .btn-close').click();
      });

      //logo-default
      $('#J_logoDefault img').on('click', function() {
        var url = $(this).attr('src');
        var node = $('.logo img');
        me.renderImage(url, node);
      });
      //commponent
      $('.dropdown-toggle').on('click', function() {
        //clean
        $('.dropdown-menu').hide();
        //
        var parent = $(this).parent();
        var toggle = $(this).attr('data-toggle');
        var menuNode = parent.find('.' + toggle + '-menu');
        menuNode.toggle();
      });
      $('body').on('click', function(e) {
        var target = $(e.target);
        if (target.hasClass('dropdown-toggle') || $(e.target).parents('.dropdown-toggle').length > 0) {
          return;
        } else {
          $('.dropdown-menu').hide();
        }
      });
    },
    renderImage: function(url, node) {
      var time = new Date().getTime();
      node.attr("src", url + "?t=" + time);
    },
    generateImg: function() {
      var me = this;
      var url = 'generateSign.php';
      $.ajax({
        url: url,
        type: 'POST',
        data: {
          content: $('.sign-content').html()
        },
        success: function(data) {
          me.renderSignImg(data);
          me.recoverBtn();
          setTimeout(function() {
            me.resizeView();
          }, 450);
        }
      });
    },
    renderSignImg: function(url) {
      var me = this;
      var node = $('.result');
      if (node.length == 0) {
        node = $('<div class="result clearfix">' +
          '<h4>生成图片<em>（在下方图片上点击右键“保存”即可）</em></h4>' +
          '<span class="col-sm-2"></span>' +
          '<div class="col-sm-10"><img src="' + url + '"></div>' +
          '</div>');
        node.css('display', 'none');
        node.insertBefore('.preview');
        setTimeout(function() {
          node.slideDown(300);
        }, 100);
      }
      node.find('img').attr('src', url);
    },
    recoverBtn: function() {
      var me = this;
      me.isGenerate = false;
      var node = $('#J_getSignImg');
      node.text('生成签名');
      node.removeClass('disabled');
    },
    generateData: function(){
      var me = this;
      var data = {};
      //input
      var inputArr = me.inputArr.filter('[type="text"]');
      var item, name, inputData = {};
      for(var i=0, len=inputArr.length; i<len; i++){
        item = $(inputArr[i]);
        name = item.attr('data-preview');
        inputData[name] = $(name).text();
      }
      data.input = inputData;
      //img
      data.img = {
        avatar : $('.avatar img').attr('src'),
        icon: $('.avatar .team-icon').attr('class').replace('team-icon',''),
        logo: $('.logo img').attr('src'),
      }
      //save
      window.LS.set('sign', JSON.stringify(data));
    },
    renderLocalData: function(){
      var me = this;
      var data = window.LS.get('sign');
      data = JSON.parse(data);
      //input
      var inputData = data.input;
      var item, text;
      for(item in inputData){
        text = inputData[item];
        if(item == '.team-type'){
          $('#J_teamType').val(text);
          if($('#J_teamType').val() == text){
            $(item).text(text);
            continue;
          }
          $('#J_teamOther input:checkbox').prop('checked', true);
          $('#J_teamOther input:checkbox').change();
        }
        $(item).text(text);
        $('input[data-preview="'+item+'"]').val(text);
      }
      //img
      var imgData = data.img
      $('.avatar img').attr('src', imgData.avatar);
      $('.avatar .team-icon').addClass(imgData.icon);
      $('.logo img').attr('src',imgData.logo);
      $('#J_jobType').val(imgData.icon.replace(' ',''));
    },
    renderCropPopup: function(data) {
      var me = this;
      $('#J_imageCropPopup .crop-container img').attr({
        src: data.url,
        width: data.width,
        height: data.height,
        style: ''
      });
      me.cropObj.cropW = data.width;
      me.cropObj.cropH = data.height;
    },
    showCrop: function(data) {
      var me = this;
      //jcrop
      if (me.cropObj.jcropApi) {
        me.cropObj.jcropApi.destroy();
      }
      //select-area
      var posArr = [0,0,data.width,data.height];
      if(data.width>data.height){
        posArr[0] = parseInt((data.width-data.height)/2);
        posArr[2] = data.height
      }else{
        posArr[1] = parseInt((data.height-data.width)/2);
        posArr[3] = data.width
      }

      $('#J_imgTarget').Jcrop({
        setSelect:   posArr,
        aspectRatio: 1,
        onChange: me.showCropPreveiw,
        onSelect: me.showCropPreveiw,
        onRelease: function() {
          $('.crop-preview').stop().fadeOut();
        }
      }, function() {
        me.cropObj.jcropApi = this;
      });
      //show
      $('#J_imageCropPopup').stop().show();
      $('#J_imageCropPopup .alert').stop().hide();
      $('.crop-preview').stop().hide();
    },
    // showCropPreveiw:
    showCropPreveiw: function(coords) {
      var me = edit;
      //preview
      if (parseInt(coords.w) > 0) {
        var rx = 75 / coords.w;
        var ry = 75 / coords.h;

        $('.crop-preview img').css({
          width: Math.round(rx * me.cropObj.cropW) + 'px',
          height: Math.round(ry * me.cropObj.cropH) + 'px',
          marginLeft: '-' + Math.round(rx * coords.x) + 'px',
          marginTop: '-' + Math.round(ry * coords.y) + 'px'
        });
        $('.crop-preview').show();
      }
      //data
      $('#J_imgTarget').data('cropData', coords);
    }
  };
  //init
  edit.init();


});
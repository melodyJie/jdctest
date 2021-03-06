$(function(){


var lottery = {
    touchEvent: 'tap',
    cookieStr : 'jdcshChristmas',
    dataObj: null,
    bakDataObj: null,
    userObj: null,
    isPlaying: false,
    totalTime: 5000,
    timeID: -1,
    itemID: -1,
    itemW: 141,
    init: function(){
        var me = this;
        //init
        me.initData();
        me.bindHandler();
    },
    initData: function(){
        var me = this;
        me.getUserCookie();
        me.getjsonData();
        //animate
        setTimeout(function(){
            me.switchStatus();
        }, 600);
    },
    initRenderData: function(){
        var me = this;
        var num = me.dataObj.winners;
        $('.bottom .txt .num').text(num);
    },
    bindHandler: function(){
        var me = this;
        //login
        $('#J_login .btn-submit').on(me.touchEvent, function(e){
            //verify
            var vaule = $('#J_login input').val();
            var errmsg = $('#J_login .msg');
            var userIndex = null;
            if(vaule.length == 0){
                errmsg.text('你还没有输入姓名哦');
                errmsg.show();
            }else{
                userIndex = me.getItemData(vaule);
                if(userIndex != null){
                    other.hidePopup();
                    me.userObj = me.dataObj.items[userIndex];
                    me.setUserCookie();
                    me.switchStatus();
                    $('#J_login input').blur();
                    document.activeElement.blur();  //bugfix-hide keyboard
                }else{
                    errmsg.text('输错啦 再想一想');
                    errmsg.show();
                }
            }
        });
    },
    switchStatus: function(){
        var me = this;
        //login
        if(!me.userObj){//nologin
            other.showPopup('login');
        }else{
            //for test
            // $('#J_login input').val('wisteria');
            // $('#J_login .btn-submit').trigger('tap');
            //
            if(me.userObj.giftforID != -1){
                me.showLotteryResult(me.userObj.giftforID);
            }else{
                $('#J_bottom .btn').fadeIn();
                me.renderItemsList();   //preRender
            }
        }
        //lottery-start
        $('#J_bottom .btn').on(me.touchEvent, function(e){
            if(me.isPlaying){
                return;
            }
            //vars
            $('#J_avatar').addClass('no-default');
            $('#J_bottom .btn span').addClass('dn');
            $('#J_bottom .playing').removeClass('dn');
            me.isPlaying = true;
            me.itemsPlay();
            me.getLotteryData();
            //playing
            var time = me.totalTime/1000;
            $('.playing .num').attr('class', 'num num'+time);
            me.timeID = setInterval(function(){
                time --;
                if(time == 0){
                    clearInterval(me.timeID);
                    me.lotteryEnd();
                }
                $('.playing .num').attr('class', 'num num'+time);
                //clear
            }, 1000);
        });
    },
    //getjsonData
    getjsonData: function(){
        var me = this;
        $.ajax({
            url: 'data.php',
            data: {type: 'get'},
            success: function(data){
                me.dataObj = data;
                me.bakDataObj = $.extend(true, {}, data);
                me.initRenderData();
            }
        });
    },
    getLotteryData: function(){
        var me = this;
        $.ajax({
            url: 'data.php',
            data: {type: 'lottery', index: me.userObj.index},
            success: function(data){
                if(data.status == 'success'){
                    me.userObj.giftforID = data.giftforID;
                    me.dataObj.winners++;
                }else{
                    alert(data.msg);
                }
            }
        });
    },
    lotteryEnd: function(){
        var me = this;
        //widget
        me.isPlaying = false;
        $('#J_bottom .playing').addClass('dn');
        //
        me.itemsStop();
        me.showLotteryResult(me.userObj.giftforID);
        me.initRenderData();
        me.setUserCookie();
    }, 
    //cookie
    getUserCookie: function(){
        var me = this;
        var obj = $.fn.cookie(me.cookieStr);
        if(obj){
            obj = $.parseJSON(obj);
        }
        me.userObj = obj;
    },
    setUserCookie: function(){
        var me = this;
        var str = JSON.stringify(me.userObj);
        $.fn.cookie(me.cookieStr, str, { expires: 30 });
    },
    cleanUserCookie: function(){
        var me = this;
        $.fn.cookie(me.cookieStr, null);
    },
    getItemData: function(name){
        var me = this;
        var arr = me.dataObj.items;
        var item, itemIndex;
        for(var i=0, len=arr.length; i<len; i++){
            item = arr[i];
            //不区分大小写
            if(item.name.toLowerCase() == name.toLowerCase()){
                break;
            }
        }
        itemIndex = i<len ? i : null;
        return itemIndex;
    },
    renderItemsList: function(){
        var me = this;
        var listNode = $('#J_avatar ul');
        var randomArr = me.shuffleArray(me.bakDataObj.items);
        var node, item;
        listNode.html('');
        for(var i=0, len=randomArr.length; i<len; i++){
            item = randomArr[i];
            node = $('<li><img src="'+item.avatar+'"></li>');
            listNode.append(node);
        }
        listNode.css('width', len*me.itemW);
    },
    itemsPlay: function(){
        var me = this;
        $('#J_avatar ul').removeClass('dn');
        //init
        var max = $('#J_avatar ul').width();
        var count = 0;
        var itemW = me.itemW;
        me.itemsStop();
        //playing
        me.itemID = setInterval(function(){
            count += itemW;
            count = count >= max ? 0 : count;
            $('#J_avatar ul').css({
                '-webkit-transform': 'translateX(-'+count+'px);'
            });
        },120);
    },
    itemsStop: function(){
        var me = this;
        clearInterval(me.itemID);
    },
    showLotteryResult: function(index){
        var me = this;
        var result = me.dataObj.items[index];
        var imgurl = result.avatar;
        $('#J_avatar').addClass('no-default');
        $('#J_avatar ul').attr('style', '')
                        .removeClass('dn');
        $('#J_avatar img').first().attr('src', imgurl);
        $('#J_bottom .btn').addClass('dn');
        $('#J_bottom .result').fadeIn();
        $('#J_bottom .result .giftfor-name').text(result.name);
        $('.light').addClass('animate');
    },
    shuffleArray: function(array) {//utils-shuffle
        for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        }
        return array;
    }
};


//other
var other = {
    touchEvent: 'tap',
    init: function(){
        var me = this;
        me.bindHandler();
    },
    bindHandler: function(){
        var me = this;
        $('#J_rule').on(me.touchEvent, function(e){
            var cls = $(this).attr('class');
            me.showPopup(cls);
            //test
            lottery.cleanUserCookie();
        });
        $('.overlay').on(me.touchEvent, function(e){
            var popNode = $('#J_popup');
            if(popNode.hasClass('showlogin')){
                return;
            }
            me.hidePopup();
        });
        $('#J_popup .btn-close').on(me.touchEvent, me.hidePopup);
    },
    showPopup: function(type){
        var popNode = $('#J_popup');
        popNode.attr('class','popup show'+type);
        popNode.addClass('animate');
        //overlay
        $('.overlay').addClass('animate');
    },
    hidePopup: function(){
        var popNode = $('#J_popup');
        popNode.removeClass('animate');
        //overlay
        $('.overlay').removeClass('animate');
    }
};

//init
lottery.init();
other.init();


//forTest
var generateData = {
    maxNum: 37,
    tempArr: [],
    init: function(){
        var me = this;
        me.generateArray();
    },
    generateArray: function(){
        var me = this;
        var arr1 = [];
        var nameArr = ["chilton","朱帅","Ada","BoBo","gina","Hee","kk","lan","Melody","only","Peter","samshang","shady","Vivienne","Yvn小胡","陈蕾","陈巧","大宾","大黄","丁丁","多多","胡伟伟","姜敬国","金璐","咖喱","李佳奇","聂孝","沙沙","万苇","王陈琳","魏丽华","武艺嫱","潇潇","小王子","于奇","张莹莹","周雪妮"];
        var obj;
        for(var i=0; i<me.maxNum; i++){
            arr1.push(i);
            obj = {
                "index": i,
                "name": nameArr[i],
                "avatar": "pic2\/"+i+".jpg",
                "giftforID": -1
              }
            me.tempArr.push(obj);
        }
        console.log(JSON.stringify(me.tempArr));
    }
};
// generateData.init();


});
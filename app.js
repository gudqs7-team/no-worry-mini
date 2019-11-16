const config = require('./config')
const req = require('./util/req.js');

App({
  onLaunch(opts) {
    // on lanch
    var sys = wx.getSystemInfoSync();
    global.height = sys.windowHeight;
    global.width = sys.windowWidth;
    global.isIpx = sys.model.indexOf('iPhone X') !== -1;
    global.maxCartCount = 10;
    
    this.initLogin();
  },
  onShow(opts) {
    console.log('App Show', opts)
  },
  onHide() {
    console.log('App Hide')
  },
  globalData: {
    hasLogin: false,
    openid: null,
    user: {

    }
  },
  initLogin(){
    var that = this;
    var openId = this.getOpenIdByLocal();
    var user = this.getUserInfoByLocal();
    var token = this.getTokenByLocal();
    
    if (!openId || openId == ''){
      that.getOpenId()
    } else {
      global.openId = openId;
      global.user = user;
      global.token = token;
    }
  },
  getOpenId(callback){
    var that = this;
    wx.login({
      success(data) {
        var code = data.code;
        req.post('/api/user/login', {
          code: code,
        }, function(){

        }, function(res) {
          console.log('login: ', res)
          if (res.success) {
            var token = res.other;
            res = res.data;
            var openId = null;
            var user = null;
            if (typeof res === 'object') {
              openId = res.openId;
              user = res;
            } else {
              openId = res;
            }
            that.saveToLocal(openId, user, token);
            if (callback) {
              callback(openId, user, token);
            }
          }
        })
      }
    })
  },
  getOpenIdByLocal(){
    return wx.getStorageSync('__open_id__');
  },
  getUserInfoByLocal() {
    var userStr = wx.getStorageSync('__user__');
    if (userStr && userStr != '') {
      return JSON.parse(userStr)
    }
    return null;
  },
  saveToLocal(openId, user, token){
    if (openId && openId != '') {
      global.openId = openId;
      wx.setStorageSync('__open_id__', openId)
    }
    if (user && user != '') {
      global.user = user;
      wx.setStorageSync('__user__', JSON.stringify(user));
    }
    if (token && token != '') {
      global.token = token;
      wx.setStorageSync('__token__', token)
    }
  },
  getTokenByLocal(){
    return wx.getStorageSync('__token__');
  },
  payByOrderId(orderId, callback){
    var that = this;
    var openId = global.user.openId;
    req.post('/api/pay/makeOrder', {
      orderType: 1,
      otherOrderId: orderId,
      openId: openId,
      memo: '解忧零食铺外卖'
    }, function (pay) {
      wx.showLoading({
        title: 'Loading...',
      });
      wx.requestPayment({
        timeStamp: pay.timeStamp || '',
        nonceStr: pay.nonceStr || '',
        package: pay.package || '',
        signType: 'MD5',
        paySign: pay.paySign || '',
        success(res) {
          wx.hideLoading();
          if (callback) {
            callback(orderId, true);
          } else {
            that.jumpDetail(id);
          }
        },
        fail(res) {
          wx.hideLoading();
          if (callback) {
            callback(orderId, false);
          } else {
            that.jumpDetail(id);
          }
        }
      })
    });
  },
  jumpDetail(id) {
    wx.navigateTo({
      url: '/page/order/detail/detail?id=' + id,
    })
  },
  cancelOrder(id, callback) {
    var that = this;
    wx.showModal({
      title: '',
      content: '确认取消订单吗?',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: 'Loading...',
          });
          req.post('/api/user/buyOrder/cancel', {orderId: id}, function(data){
            wx.hideLoading();
            wx.showToast({
              title: '取消成功!',
            });
            if(callback){
              callback(id);
            } else {
              that.jumpDetail(id);
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})

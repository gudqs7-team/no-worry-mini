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
  }
})

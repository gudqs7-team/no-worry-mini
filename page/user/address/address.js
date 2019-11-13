var req = require("../../../util/req.js");

Page({
  data: {
    width: global.width,
    height: (global.height) * 2,
    isIpx: global.isIpx,
    addressList: [
    ]
  },
  onLoad: function (options) {
    this.initAddrList();
  },
  initAddrList() {
    var that = this;
    wx.showLoading({
      title: 'Loading....',
    });
    req.post('/api/user/userAddress/list', {}, function(data) {
      wx.hideLoading();
      that.setData({
        addressList: data
      })
    });
  }
})
var req = require("../../../util/req.js");

Page({
  data: {
    width: global.width,
    height: (global.height) * 2,
    isIpx: global.isIpx,
    addressList: [
    ],
    canClick: false,
    init: false
  },
  onLoad: function (options) {
    if (options && options.choseId) {
      this.setData({
        canClick: true
      });
    }
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
        addressList: data,
        init: true
      })
    });
  },
  goAddAddress(){
    console.log('go');
    var that = this;
    wx.navigateTo({
      url: '/page/user/address/edit/edit',
      events: {
        saveSuccess: function (data) {
          console.log('save success: ', data);
          that.initAddrList();
        }
      }
    });
  },
  goEditAddress(e){
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/page/user/address/edit/edit?id='+id,
      events: {
        saveSuccess: function (data) {
          console.log('edit success: ', data);
          that.initAddrList();
        }
      }
    })
  },
  choseAddr(e){
    if (!this.data.canClick) {
      return false;
    }
    var id = e.currentTarget.dataset.id;
    var that = this;
    console.log('chose addr')
    const eventChannel = that.getOpenerEventChannel();
    if (eventChannel && eventChannel.emit) {
      eventChannel.emit('choseId', { id: id});
      wx.navigateBack({});
    }
  }
})
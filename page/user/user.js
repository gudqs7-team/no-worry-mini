// page/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: global.user
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  goAddress(e) {
    console.log('go address ', e)
    wx.navigateTo({
      url: '/page/user/address/address'
    });
  },
  goOrder(e) {
    console.log('go order ', e)
    wx.navigateTo({
      url: '/page/order/order'
    });
  }
})
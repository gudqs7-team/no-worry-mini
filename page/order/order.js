var req = require("../../util/req.js");
var app = getApp();
Page({
  data: {
    width: global.width,
    isIpx: global.isIpx,
    orderList: [
    ],
    orderStatusMap: {
      '0': '未支付',
      '1': '已支付',
      '2': '已取消',
      '3': '已退款'
    }
  },
  onShow: function () {
    this.initOrderList();
  },
  onPullDownRefresh() {
    this.initOrderList();
  },
  initOrderList() {
    wx.showLoading({
      title: 'Loading...',
    });
    var that = this;
    req.post('/api/user/buyOrder/list', {pageSize: 100}, function(data) {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      that.setData({
        orderList: data
      });
    })
  },
  goPay(e) {
    var id = e.currentTarget.dataset.id;
    console.log('gopay: ', id, e);
    app.payByOrderId(id);
  },
  cancelOrder(e) {
    var id = e.currentTarget.dataset.id;
    console.log('cancel', id)
    app.cancelOrder(id);
  },
  jumpDetail(e) {
    var id = e.currentTarget.dataset.id;
    console.log('jump detail', id, e);
    wx.navigateTo({
      url: '/page/order/detail/detail?id=' + id,
    })
  }
})
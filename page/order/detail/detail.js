var req = require("../../../util/req.js");
var app = getApp();
Page({
  data: {
    width: global.width,
    height: (global.height - 48) * 2 - 100,
    isIpx: global.isIpx,
    defaultAddr: '',
    contactName: '',
    contactPhone: '',
    goods: [
    ],
    totalPrice: 0,
    totalPriceText: '0',
    order: {

    },
    choseAddressId: 0,
    noAddress: true,
    orderStatusMap: {
      '0': '未支付',
      '1': '已支付',
      '2': '已取消',
      '3': '已退款'
    }
  },
  onLoad: function (options) {
    if (!options.id){
      wx.showToast({
        title: 'Loading Error',
      })
      return false;
    }
    var orderId = options.id;
    var that = this;
    wx.showLoading({
      title: 'Loading...',
    });
    req.post('/api/user/buyOrder/get', {orderId: orderId}, function(data) {
      wx.hideLoading();
      that.setData({
        order: data
      });
      that.initAddressInfo(data.addressId);
      that.initCarGoods(data.orderDetails);
    });
    
  },
  initAddressInfo(addressId) {
    var that = this;
    var url = '/api/user/userAddress/getDefault';
    var data = {};
    if (addressId !== 0) {
      url = '/api/user/userAddress/get';
      data = { id: addressId }
    }
    req.post(url, data, function (data) {
      if (data) {
        that.setData({
          defaultAddr: data.area + data.detailAddress,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          choseAddressId: data.addressId,
          noAddress: false
        });
      } else {
        that.setData({
          noAddress: true
        });
      }
    });
  },
  initCarGoods(data) {
    var that = this;
    var carList = [];
    var sumPrice = 0;
    for (var i = 0; i < data.length; i++) {
      var car = data[i] || {};
      carList.push({
        snackName: car.snackName,
        snackPrice: car.snackPrice,
        snackPriceText: (car.snackPrice / 100).toFixed(1),
        snackPic: car.snackPic || '',
        count: car.buyCount
      });
      sumPrice += car.snackPrice * car.buyCount;
    }
    that.setData({
      goods: carList,
      totalPrice: sumPrice,
      totalPriceText: (sumPrice / 100).toFixed(1)
    });
  },
  goPay() {
    var orderId = this.data.order.orderId;
    if (!orderId) {
      return false;
    }
    app.payByOrderId(orderId);
  },
  cancelOrder() {
    var orderId = this.data.order.orderId;
    if (!orderId) {
      return false;
    }
    app.cancelOrder(orderId);
  }
})
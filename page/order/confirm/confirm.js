var req = require("../../../util/req.js");

Page({
  data: {
    width: global.width,
    height: (global.height - 48) * 2 - 100,
    isIpx: global.isIpx,
    defaultAddr: '南昌大学共青学院 113 栋 1301',
    contactName: '李四',
    contactPhone: '18943218879',
    goods: [
      {
        snackName: '怡宝 550ml',
        snackPrice: 100,
        snackPriceText: '1.0',
        count: 3,
        snackPic: 'https://baidu.com'
      }, {
        snackName: '怡宝 550ml',
        snackPrice: 100,
        snackPriceText: '1.0',
        count: 3,
        snackPic: 'https://baidu.com'
      }, {
        snackName: '怡宝 550ml',
        snackPrice: 100,
        snackPriceText: '1.0',
        count: 3,
        snackPic: 'https://baidu.com'
      }
    ],
    totalPrice: 300,
    totalPriceText: '3.0',
    orderMemo: ''
  },
  onLoad: function (options) {
    this.initCarGoods();
  },
  initCarGoods() {
    wx.showLoading({
      title: 'Loading....',
    });
    var that = this;
    var carList = that.data.goods || [];
    var sumPrice = 0;
    req.post('/api/snack/car/list', {}, function(data) {
      wx.hideLoading();
      for (var i = 0; i<data.length; i++) {
        var car = data[i] || {};
        carList.push({
          snackName: car.snackName,
          snackPrice: car.snackPrice,
          snackPriceText: (car.snackPrice / 100).toFixed(1),
          snackPic: car.snackPic || '',
          count: car.count
        });
        sumPrice += car.snackPrice * car.count;
      }
      that.setData({
        goods: carList,
        totalPrice: sumPrice,
        totalPriceText: (sumPrice / 100).toFixed(1)
      });
    });
  }
})
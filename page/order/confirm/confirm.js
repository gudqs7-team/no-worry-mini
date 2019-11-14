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
    ],
    totalPrice: 300,
    totalPriceText: '3.0',
    orderMemo: '',
    choseAddressId: 0
  },
  onLoad: function (options) {
    this.initAddressInfo(0);
    this.initCarGoods();
  },
  initAddressInfo(addressId) {
    var that = this;
    var url = '/api/user/userAddress/getDefault';
    var data = {};
    if (addressId !== 0) {
      url = '/api/user/userAddress/get';
      data = { id: addressId }
    }
    req.post(url, data, function(data) {
      that.setData({
        defaultAddr: data.area + data.detailAddress,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        choseAddressId: data.addressId
      });  
    });
  },
  initCarGoods() {
    wx.showLoading({
      title: 'Loading....',
    });
    var that = this;
    var carList = [];
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
  },
  goChoseAddr(e){
    var that = this;
    wx.navigateTo({
      url: '/page/user/address/address?choseId=' + this.data.choseAddressId,
      events: {
        choseId: function (data) {
          var id = data.id;
          that.initAddressInfo(id);
        }
      }
    })
  }
})
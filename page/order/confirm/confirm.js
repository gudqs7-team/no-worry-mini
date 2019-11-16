var req = require("../../../util/req.js");

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
    orderMemo: '',
    choseAddressId: 0,
    noAddress: true,
    doPay: false
  },
  onLoad: function (options) {
    // this.initAddressInfo(0);
    // this.initCarGoods();
  },
  onShow(e) {
    console.log('show: ', e);
    this.initAddressInfo(0);
    this.initCarGoods(function(data){
      console.log('callback: ', data);
      if (data.length <= 0 && !doPay){
        wx.navigateBack();
      }
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
    req.post(url, data, function(data) {
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
  initCarGoods(callback) {
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
      if (callback) {
        callback(data);
      }
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
  },
  goAddAddress(){
    var that = this;
    wx.navigateTo({
      url: '/page/user/address/edit/edit?form=order',
      events: {
        choseId: function (data) {
          console.log('chose data: ', data);
          var id = data.id;
          that.initAddressInfo(id);
        }
      }
    })
  },
  inputChange(e) {
    console.log('change:', e);
    var name = e.currentTarget.dataset.name;
    var val = e.detail.value;
    var data = {};
    data[name] = val;
    this.setData(data);
  },
  goPay() {
    var that = this;
    var addressId = this.data.choseAddressId;
    if (this.data.totalPrice <= 0) {
      wx.showToast({
        title: '购物车为空!',
      })
      return false;
    }
    if (addressId === 0) {
      wx.showToast({
        title: '请选择地址!',
      })
      return false;
    }
    wx.showLoading({
      title: 'Loading...',
    });
    this.setData({
      doPay: true
    });
    var orderMemo = this.data.orderMemo;
    console.log('pay: ', addressId, orderMemo);
    req.post('/api/user/buyOrder/make', {
      addressId: addressId,
      orderMemo: orderMemo
    }, function(order) {
      var orderId = order.orderId;
      var openId = global.user.openId;
      req.post('/api/pay/makeOrder', {
        orderType: 1,
        otherOrderId: orderId,
        openId: openId,
        memo: '解忧零食铺外卖'
      }, function(pay) {
        wx.requestPayment({
          timeStamp: pay.timeStamp || '',
          nonceStr: pay.nonceStr || '',
          package: pay.package || '',
          signType: 'MD5',
          paySign: pay.paySign ||'',
          success(res) {
            wx.hideLoading();
            wx.showToast({
              title: '支付成功',
            });
            that.jumpDetail(orderId);
          },
          fail(res) {
            wx.hideLoading();
            wx.showToast({
              title: '未支付',
            });
            that.jumpDetail(orderId);
          }
        })
      });
    })
  },
  jumpDetail(id) {
    wx.redirectTo({
      url: '/page/order/detail/detail?id=' + id,
    })
  }
})
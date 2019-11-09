var req = require("../../util/req.js");

var app = getApp();
Page({
  data: {
    width: global.width,
    height: (global.height - 48) * 2 - 100,
    isIpx: global.isIpx,
    maxCartCount: global.maxCartCount,
    needLogin: global.needLogin,
    loginNow: false,
    typeMap: {
    },
    typeList: [
    ],
    activeTypeId: 0,
    goods: {
    },
    goodsMap: {

    },
    cartList: [
    ],
    showCart: false,
    cartTotalCount: 0,
    cartTotalPrice: 0,
    cartTypeMap: {
    },
    cartSnackMap: {
    }
  },
  onLoad(e) {
    wx.showLoading({
      title: 'Loading...',
    });
    var that = this;
    console.log('on load..', e);
    req.post('/api/snack/snackType/list', {}, function(data){
      that.initTypeMap(data);
      that.setData({
        typeList: data
      })
      var typeId = that.data.activeTypeId;
      that.initTypeGoods(typeId, null);
    })
    // init cart
    req.post('/api/snack/car/list', {}, function(data){
      that.initCart(data);
    });
    console.log('load: ', global)
    if (global.user == null) {
      app.getOpenId(function(openId, user){
        if (user == null) {
          that.setData({
            loginNow: true
          })
        }
      });
    }
    
  },
  initCart(data) {
    var that = this;
    var sum = 0;
    var sumPrice = 0;
    var cartSnackMap = this.data.cartSnackMap || {};
    for (var i = 0; i<data.length; i++) {
      var car = data[i];
      var count = car.count;
      sum += count;
      sumPrice += car.snackPrice * count;
      car.snackPriceText = (car.snackPrice/100).toFixed(1)
      cartSnackMap[car.snackId] = count;
    }
    var totalPrice = (sumPrice / 100).toFixed(1)
    that.setData({
      cartList: data,
      cartTotalPrice: totalPrice,
      cartTotalCount: sum,
      cartSnackMap: cartSnackMap
    })
  },
  initTypeMap(data) {
    var typeMap = {}
    var cartTypeMap = {}
    var activeTypeId = 0;
    for (var i = 0; i < data.length; i++) {
      var type = data[i];
      var typeId = type.snackTypeId;
      if (i === 0) {
        activeTypeId = typeId;
      }
      typeMap[typeId] = type.snackTypeName;
      cartTypeMap[typeId] = 0;
    }
    this.setData({
      activeTypeId: activeTypeId,
      typeMap: typeMap,
      cartTypeMap: cartTypeMap
    })
  },
  initTypeGoods(typeId, searchName) {
    var goods = this.data.goods || {};
    var goodsData = goods[typeId];
    if (goodsData && goodsData.length > 0) {
      return;
    }
    var that = this;
    var reqData = {
      snackTypeId: typeId
    };
    if (searchName && searchName != '') {
      reqData.snackName = searchName;
    }
    wx.showLoading({
      title: 'Loading',
    });
    req.post('/api/snack/snack/list', reqData, function(data){
      wx.hideLoading();
      that.initGoods(typeId, data);
      wx.hideLoading();
    })
  },
  initGoods(typeId, data) {
    var goods = this.data.goods || {};
    var goodsMap = this.data.goodsMap || {};
    goods[typeId] = data;
    var cartSnackMap = this.data.cartSnackMap || {};
    for (var i = 0; i< data.length; i++) {
      var snack = data[i];
      var id = snack.snackId;
      snack.snackPriceText = (snack.snackPrice/100).toFixed(1);
      cartSnackMap[id] = cartSnackMap[id] || 0;
      goodsMap[id] = snack;
    }
    this.setData({
      goods: goods,
      goodsMap: goodsMap,
      cartSnackMap: cartSnackMap
    });
  },
  changeType(e){
    var typeId = e.target.dataset.id;
    this.setData({
      activeTypeId: typeId
    })
    this.initTypeGoods(typeId, null);
  },
  addSnack(e) {
    var id = e.target.dataset.id;
    var cartSnackMap = this.data.cartSnackMap;
    var count = cartSnackMap[id] || 0;
    if (count === 0) {
      this.addToCartList(id);
    } else {
      this.updateCartCount(id, count+1);
    }
    if (count >= global.maxCartCount) {
      wx.showToast({
        title: '不能再加了'
      });
      return;
    }
    count += 1;
    cartSnackMap[id] = count;
    this.setData({
      cartSnackMap: cartSnackMap
    });
    this.updateCarTotal();
  },
  substractSnack(e) {
    var id = e.target.dataset.id;
    var cartSnackMap = this.data.cartSnackMap;
    var count = cartSnackMap[id] || 0;
    count -= 1;
    if (count === 0) {
      this.deleteFromCartList(id);
    } else {
      this.updateCartCount(id, count);
    }
    cartSnackMap[id] = count;
    this.setData({
      cartSnackMap: cartSnackMap
    });
    this.updateCarTotal();
  },
  updateCarTotal(){
    var that = this;
    var data = that.data.cartList;
    var cartSnackMap = that.data.cartSnackMap;
    var sum = 0;
    var sumPrice = 0;
    for (var i = 0; i < data.length; i++) {
      var car = data[i];
      var count =  cartSnackMap[car.snackId] || 0;
      sum += count;
      sumPrice += car.snackPrice * count;
    }
    var totalPrice = (sumPrice / 100).toFixed(1)
    that.setData({
      cartTotalPrice: totalPrice,
      cartTotalCount: sum
    });
  },
  updateCartCount(id, count) {
    req.post('/api/snack/car/update', {
      snackId: id, 
      count: count
    }, function(data) {
      console.log('update count : ', data)
    })
  },
  addToCartList(id) {
    var goodsMap = this.data.goodsMap;
    var cartSnackMap = this.data.cartSnackMap;
    var snack = goodsMap[id];
    var cartList = this.data.cartList;
    var car = {
      snackId: id,
      snackName: snack.snackName,
      snackPrice: snack.snackPrice,
      count: 1
    };
    req.post('/api/snack/car/add', car, function(data){
      wx.showToast({
        title: '添加成功',
      })
    });
    car.snackPriceText = (car.snackPrice/100).toFixed(1);
    cartList.push(car);
    this.setData({
      cartList: cartList
    })
  },
  deleteFromCartList(id) {
    req.post('/api/snack/car/delete', {
      snackId: id
    }, function(data) {
      console.log('delete: ', data);
    })

    var cartList = this.data.cartList;
    for (var i = 0; i < cartList.length; i++) {
      var car = cartList[i];
      if (car.snackId == id) {
        cartList.splice(i, 1);
      }
    }
    this.setData({
      cartList: cartList
    })
  },
  emptyCart(e) {
    var that = this;
    var totalCount = this.data.cartTotalCount;
    if (totalCount <= 0){
      wx.showToast({
        title: '已经是空的了',
      });
      return;
    };
    req.post('/api/snack/car/empty', {}, function(){
      wx.showToast({
        title: '已清空'
      });
      that.setData({
        cartList: [],
        cartSnackMap: {},
        cartTotalCount: 0,
        cartTotalPrice: 0,
        showCart: false
      })
    });
  },
  closeCart(){
    this.setData({
      showCart: false
    })
  },
  toggleCartList(){
    console.log(global);
    var showCart = this.data.showCart == false;
    console.log('toggle: ', this.data.showCart, showCart);
    this.setData({
      showCart: showCart
    })
  },
  getUserInfo(e) {
    var that = this;
    wx.showLoading({
      title: '登录中...',
    });
    console.log('login: ', e);
    var detail = e.detail;
    req.post('/api/user/update', {
      encryptedData: detail.encryptedData,
      iv: detail.iv,
      openId: global.openId
    }, function(data) {

    }, function (res) {
      wx.hideLoading();
      console.log('update :: ', res);
      if (res.success) {
        var token = res.other;
        var user = res.data;
        var openId = user.openId;
        app.saveToLocal(openId, user, token);
        
        that.setData({
          loginNow: false
        });
      }
    })
  },
  goBuyOrder(e) {
    console.log('order');
    e.stopProg
  },
  onShareAppMessage() {
    return {
      title: '解忧零食铺',
      desc: '快来看看吧',
      path: '/page/index/index'
    }
  }, 
  closeDialog(){
    this.setData({
      loginNow: false
    })
  }
});
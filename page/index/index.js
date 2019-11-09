var req = require("../../util/req.js");

Page({
  data: {
    width: global.width,
    height: (global.height - 48) * 2 - 100,
    isIpx: global.isIpx,
    maxCartCount: global.maxCartCount,
    typeMap: {
    },
    typeList: [
    ],
    activeTypeId: 0,
    goods: {
    },
    cartList: [
      {
        cartId: 1,
        snackName: '伊利纯牛奶 215ml',
        snackPrice: '9.9',
      },
      {
        cartId: 1,
        snackName: '伊利纯牛奶 215ml',
        snackPrice: '9.9',
      }
    ],
    showCart: false,
    cartTypeMap: {
    },
    cartSnackMap: {
      "2": 3
    }
  },
  onLoad(e) {
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
    var that = this;
    var reqData = {
      snackTypeId: typeId
    };
    if (searchName && searchName != '') {
      reqData.snackName = searchName;
    }
    req.post('/api/snack/snack/list', reqData, function(data){
      that.initGoods(typeId, data);
    })
  },
  initGoods(typeId, data) {
    var goods = this.data.goods || {};
    goods[typeId] = data;
    var cartSnackMap = this.data.cartSnackMap || {};
    for (var i = 0; i< data.length; i++) {
      var snack = data[i];
      var id = snack.snackId;
      cartSnackMap[id] = 0;
    }
    this.setData({
      goods: goods,
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
    })
  },
  substractSnack(e) {
    var id = e.target.dataset.id;
    var cartSnackMap = this.data.cartSnackMap;
    var count = cartSnackMap[id] || 0;
    count -= 1;
    if (count === 0) {
      this.deleteFromCartList(id);
    }
    cartSnackMap[id] = count;
    this.setData({
      cartSnackMap: cartSnackMap
    })
  },
  addToCartList(id) {
    
  },
  deleteFromCartList(id) {

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
  }
});
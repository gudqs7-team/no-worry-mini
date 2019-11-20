var req = require("../../util/req.js");

var app = getApp();
Page({
  data: {
    width: global.width,
    height: (global.height) * 2 - 200,
    isIpx: global.isIpx,
    maxCartCount: global.maxCartCount,
    startPriceFen: 50,
    needLogin: false,
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
    //type count
    cartTypeMap: {
    },
    cartSnackMap: {
    },
    goodsToView: 'toview',
    typeToView: 'toview',
    desc: {

    },
    sortBy: {

    },
    searchName: ''
  },
  onShow() {
    var that = this;
    wx.showLoading({
      title: 'Loading...',
    })
    req.post('/api/snack/car/list', {}, function (data) {
      wx.hideLoading();
      that.initCart(data);
    });
  },
  onLoad(e) {
    wx.showLoading({
      title: 'Loading...',
    });
    var that = this;
    console.log('on load..', e);
    req.post('/api/snack/snackType/list', {}, function(data){
      wx.hideLoading();
      that.initTypeMap(data);
      that.setData({
        typeList: data
      })
      var typeId = that.data.activeTypeId;
    })
    console.log('load: ', global)
    if (global.user == null) {
      app.getOpenId(function(openId, user){
        if (user == null) {
          that.setData({
            needLogin: true
          })
        }
      });
    }

    this.setData({
      search: this.search.bind(this)
    })
  },
  search(value) {
    console.log('search: ', value);
    return new Promise((resolve, reject) => {
      var backList = [{
        text: value,
        value: value
      }];
      req.getOther('https://suggest.taobao.com/sug?code=utf-8&q='+value+'&area=b2c&code=utf-8&k=1&bucketid=9&src=tmall_pc', {}, function(){}, function(data) {
        var sugs = data.result;
        var max = sugs.length < 3 ? sugs.length : 3;
        for (var i = 0; i < max; i++) {
          var sug = sugs[i];
          var sugVal = sug[0];
          backList.push({
            text: sugVal,
            value: sugVal
          });
        }
      });
      resolve(backList);
    });
  },
  selectResult(e){
    console.log('select: ', e);
    var item = e.detail.item;
    var name = item.value;
    this.setData({
      searchName: name
    });
    var typeList = this.data.typeList;
    var typeMap = this.data.typeMap;

    var type = {
      snackTypeId: -1,
      snackTypeName: '搜索结果'
    };
    if (!typeMap['-1']) {
      typeList.push(type);
    }
    
    typeMap['-1'] = type.snackTypeName;
    this.setData({
      typeList: typeList,
      typeMap: typeMap,
      activeTypeId: -1
    });
    this.initTypeGoods(-1);
    e.detail.obj.hideInput();
  },
  initCart(data) {
    var that = this;
    var sum = 0;
    var sumPrice = 0;
    var cartSnackMap = {};
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
  calcCartCount() {
    var data = this.data.cartList;
    var cartSnackMap = {};
    var cartTypeMap = {};
    for (var i = 0; i < data.length; i++) {
      var car = data[i];
      var count = car.count;
      cartSnackMap[car.snackId] = count;
      var good = this.data.goodsMap[car.snackId];
      var typeSc = cartTypeMap[good.snackTypeId] || 0;
      cartTypeMap[good.snackTypeId] = typeSc + count;
    }
    this.setData({
      cartSnackMap: cartSnackMap,
      cartTypeMap: cartTypeMap
    });
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
      var last = false;
      if (i === data.length - 1) {
        last = true;
      }
      this.initTypeGoods(typeId, last);
    }
    this.setData({
      activeTypeId: activeTypeId,
      typeMap: typeMap,
      cartTypeMap: cartTypeMap
    })
  },
  initTypeGoods(typeId, last) {
    var goods = this.data.goods || {};
    var goodsData = goods[typeId];
    if (goodsData && goodsData.length > 0 && typeId !== -1) {
      this.setData({
        goodsToView: 'type-' + typeId
      });
      return true;
    }
    this.initGoods(typeId, last);
  },
  initGoods(typeId, last) {
    var that = this;
    wx.showLoading({
      title: 'Loading',
    });

    var reqData = {};
    if (typeId && typeId != -1) {
      reqData.snackTypeId = typeId;
    }
    var sortBy = that.data.sortBy[typeId] || 'displayOrder';
    var desc = that.data.desc[typeId] || '0';
    reqData.sortBy = sortBy;
    reqData.desc = desc == '1';

    var search = this.data.searchName;
    if (search && typeId == -1) {
      reqData.snackName = search.trim();
    }
    req.post('/api/snack/snack/list', reqData, function (data) {
      var goods = that.data.goods || {};
      var goodsMap = that.data.goodsMap || {};
      goods[typeId] = data;
      var cartSnackMap = that.data.cartSnackMap || {};
      for (var i = 0; i < data.length; i++) {
        var snack = data[i];
        var id = snack.snackId;
        snack.snackPriceText = (snack.snackPrice / 100).toFixed(1);
        cartSnackMap[id] = cartSnackMap[id] || 0;
        goodsMap[id] = snack;
      }
      that.setData({
        goods: goods,
        goodsMap: goodsMap,
        cartSnackMap: cartSnackMap
      });
      wx.hideLoading();
      if (last) {
        setTimeout(function(){
          var query = wx.createSelectorQuery();
          var heightArr = [];
          var sumHeight = 0;
          query.selectAll('.type-div').boundingClientRect(function (n) {
            n.forEach((res) => {
              sumHeight += res.height;
              heightArr.push(sumHeight)
            });
            that.heightArr = heightArr;
          }).exec();
          that.calcCartCount();
        }, 500);
      }
    });

  },
  onScroll(e) {
    let scrollTop = e.detail.scrollTop;
    let scrollArr = this.heightArr;

    var typeIndex = -1;
    for (var i = 0; i < scrollArr.length; i++) {
      var leftX = 0;
      if (i !== 0){
        leftX = scrollArr[i - 1];
      }
      var flag = scrollTop >= leftX && scrollTop < scrollArr[i];
      if (flag) {
        typeIndex = i;
        break;
      }
    }
    if (typeIndex != -1) {
      var activeId = this.data.typeList[typeIndex].snackTypeId;
      this.setData({
        activeTypeId: activeId,
        typeToView: 'type-'+activeId
      });
    }

  },
  sortBySales(e) {
    var that = this;
    var typeId = e.currentTarget.dataset.id;
    var sortByMap = that.data.sortBy;
    var descMap = that.data.desc;
    var sortBy = that.data.sortBy[typeId];
    var desc = that.data.desc[typeId];


    sortByMap[typeId] = sortBy === 'snackSale' ? 'displayOrder' : 'snackSale';
    descMap[typeId] = '1';
    this.setData({
      sortBy: sortByMap,
      desc: descMap
    });
    this.initGoods(typeId);
  },
  sortByPrice(e) {
    var that = this;
    var typeId = e.currentTarget.dataset.id;
    var sortByMap = that.data.sortBy;
    var descMap = that.data.desc;
    var sortBy = that.data.sortBy[typeId];
    var desc = that.data.desc[typeId];
    var descbool = desc == '1';

    var nextDesc = '0';
    if (desc) {
      var ascbool = desc == '0';
      if (ascbool && sortBy != 'displayOrder') {
        nextDesc = '1';
      }
    }

    var nextSort = 'snackPrice';
    if (sortBy) {
      if ((sortBy == 'snackPrice') && (desc == '1')) {
        nextSort = 'displayOrder';
      }
    }
    
    console.log('sort price: ', sortBy, desc, nextSort, nextDesc);
    
    sortByMap[typeId] = nextSort;
    descMap[typeId] = nextDesc;
    this.setData({
      sortBy: sortByMap,
      desc:  descMap
    });
    this.initGoods(typeId);
  },
  changeType(e){
    var typeId = e.target.dataset.id;
    this.setData({
      activeTypeId: typeId
    })
    this.initTypeGoods(typeId, null);
  },
  checkLogin() {
    var needLogin = this.data.needLogin;
    if (needLogin) {
      this.setData({
        loginNow: true
      });
      return false;
    }
    return true;
  },
  addSnack(e) {
    if (!this.checkLogin()) {
      return false;
    }
    var id = e.target.dataset.id;
    var cartSnackMap = this.data.cartSnackMap;
    var cartTypeMap = this.data.cartTypeMap;
    var count = cartSnackMap[id] || 0;
    var goods = this.data.goodsMap[id];
    var biggerThenCount = goods.snackStock > 10 ? global.maxCartCount : goods.snackStock;
    if (count >= biggerThenCount) {
      wx.showToast({
        title: '不能再加了'
      });
      return false;
    }
    if (count === 0) {
      this.addToCartList(id);
    } else {
      this.updateCartCount(id, count+1);
    }
    
    count += 1;
    cartSnackMap[id] = count;
    var typeSc = cartTypeMap[goods.snackTypeId] || 0;
    cartTypeMap[goods.snackTypeId] = typeSc + 1;
    this.setData({
      cartSnackMap: cartSnackMap,
      cartTypeMap: cartTypeMap
    });
    this.updateCarTotal();
  },
  substractSnack(e) {
    var id = e.target.dataset.id;
    var cartSnackMap = this.data.cartSnackMap;
    var cartTypeMap = this.data.cartTypeMap;
    var count = cartSnackMap[id] || 0;
    var good = this.data.goodsMap[id];
    count -= 1;
    if (count === 0) {
      this.deleteFromCartList(id);
    } else {
      this.updateCartCount(id, count);
    }
    cartSnackMap[id] = count;
    var typeSc = cartTypeMap[good.snackTypeId] || 1;
    cartTypeMap[good.snackTypeId] = typeSc - 1;
    this.setData({
      cartSnackMap: cartSnackMap,
      cartTypeMap: cartTypeMap
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
      snackPic: snack.snackPic,
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
    if (!this.checkLogin()) {
      return false;
    }
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
        cartTypeMap: {},
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
          loginNow: false,
          needLogin: false
        });
      }
    })
  },
  goBuyOrder(e) {
    if (!this.checkLogin()) {
      return false;
    }
    console.log('order');
    wx.navigateTo({
      url: '/page/order/confirm/confirm'
    });
  },
  goUserPage(e) {
    if (!this.checkLogin()) {
      return false;
    }
    console.log('gouser ', e)
    wx.navigateTo({
      url: '/page/user/user'
    });
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

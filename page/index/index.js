Page({
  data: {
    width: global.width,
    height: (global.height - 48) * 2 - 100,
    isIpx: global.isIpx,
    typeMap: {
      "1": "精选饮料",
      "2": "精选饮料2",
      "3": "精选饮料3",
      "5": "精选饮料5"
    },
    typeList: [
      {
        snackTypeId: 1,
        snackTypeName: '精选饮料精选饮料',
        nowCount: 2
      }, {
        snackTypeId: 2,
        snackTypeName: '精选饮料1',
        nowCount: 2
      }, {
        snackTypeId: 3,
        snackTypeName: '精选饮料2',
        nowCount: 2
      }, {
        snackTypeId: 4,
        snackTypeName: '精选饮料3',
        nowCount: 99
      }, {
        snackTypeId: 5,
        snackTypeName: '精选饮料5',
        nowCount: 99
      }
    ],
    activeTypeId: 3,
    goods: {
      "1": [
        {
          snackName: '伊利纯牛奶 205ml 伊利纯牛奶 205ml',
          snackPrice: '9.9',
          snackStock: 8,
          snackSale: 32
        },
        {
          snackName: '伊利纯牛奶 205ml',
          snackPrice: '9.9',
          snackStock: 8,
          snackSale: 32
        },
        {
          snackName: '伊利纯牛奶 205ml',
          snackPrice: '9.9',
          snackStock: 8,
          snackSale: 32
        }
      ],
      "2": [
        {
          snackName: '伊利纯牛奶 205ml',
          snackPrice: '9.9'
        },
        {
          snackName: '伊利纯牛奶 205ml',
          snackPrice: '9.9'
        },
        {
          snackName: '伊利纯牛奶 205ml',
          snackPrice: '9.9'
        }
      ]
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
    showCart: false
  },
  changeType(e){
    console.log('change', e);
    var typeId = e.target.dataset.id;
    this.setData({
      activeTypeId: typeId
    })
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
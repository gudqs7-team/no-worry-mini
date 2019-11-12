var req = require("../../../util/req.js");

Page({
  data: {
    width: global.width,
    height: (global.height) * 2,
    isIpx: global.isIpx,
    addressList: [
      {
        contactName: '李四',
        contactPhone: '17677729932',
        defaultAddress: '1',
        detailAddress: '43 栋 302',
        area: '三峡大学'
      }, {
        contactName: '李四',
        contactPhone: '17677729932',
        defaultAddress: '1',
        detailAddress: '43 栋 302',
        area: '三峡大学'
      }, {
        contactName: '李四',
        contactPhone: '17677729932',
        defaultAddress: '1',
        detailAddress: '43 栋 302',
        area: '三峡大学'
      }
    ]
  },
  onLoad: function (options) {
    
    this.initAddrList();
  },
  initAddrList() {
    var that = this;
    req.post('/api/user/userAddress/list', {}, function(data) {
      that.setData({
        addressList: data
      })
    });
  }
})
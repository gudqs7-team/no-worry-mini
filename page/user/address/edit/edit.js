var req = require("../../../../util/req.js");

Page({

  data: {
    contactName: '',
    contactPhone: '',
    detailCount: '',
    detailDoor: '',
    defaultAddress: 0,
    addressId: 0,
    needJump: false,
    detailCountList: [
      '6栋',
      '7栋',
      '8栋',
      '9栋',
      '10栋',
      '其他(备注说明)'
    ],
    detailCountIndex: 0
  },
  onLoad: function (options) {
    var that = this;
    if (options.form && options.form == 'order') {
      that.setData({
        needJump: true,
        defaultAddress: 1
      });
    }
    console.log('load: ', options);
    var id = options.id;
    if (id) {
      req.post('/api/user/userAddress/get', {id: id}, function(data) {
        var detailDoor = '', detailCount = '';
        var detailArr = data.detailAddress.split('栋');
        if (detailArr.length >= 2) {
          detailCount = (detailArr[0] || '').trim();
          detailDoor = (detailArr[1] || '').trim();
        }
        that.setData({
          addressId: id,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          detailCount: detailCount,
          detailDoor: detailDoor,
          defaultAddress: data.defaultAddress
        })
      })
    }
  },
  save() {
    var defaultAddress = this.data.defaultAddress;
    var detailAddress = this.data.detailCount.replace(/栋/g, '').trim() + '栋 '+ this.data.detailDoor.trim();
    var data = {
      contactName: this.data.contactName,
      contactPhone: this.data.contactPhone,
      detailAddress: detailAddress,
      defaultAddress: defaultAddress
    };
    if (this.data.addressId !==0){
      data.addressId = this.data.addressId;
    }
    console.log(data);
    wx.showLoading({
      title: '保存中...',
    });
    var that = this;
    req.post('/api/user/userAddress/save', data, function(data){
      wx.hideLoading();
      const eventChannel = that.getOpenerEventChannel();
      if (eventChannel && eventChannel.emit) {
        if (that.data.needJump) {
          var id = data.addressId;
          eventChannel.emit('choseId', { id: id });
        } else {
          eventChannel.emit('saveSuccess', { data: 'test' });
        }
      }
      wx.navigateBack({});
    });
  },
  deleteAddr(e) {
    var that = this;
    if (this.data.addressId !== 0) {
      var addressId = this.data.addressId;
      wx.showLoading({
        title: '删除中...',
      })
      req.post('/api/user/userAddress/delete', {addressId: addressId}, function() {
        wx.hideLoading();
        const eventChannel = that.getOpenerEventChannel();
        if (eventChannel && eventChannel.emit) {
          eventChannel.emit('saveSuccess', { data: 'test' });
        }
        wx.navigateBack();
      });
    }
  },
  changeDefaultAddress(e) {
    var val = e.detail.value[0] || '0';
    this.setData({
      defaultAddress: parseInt(val)
    });
  },
  inputChange(e) {
    console.log('change:' , e);
    var name = e.currentTarget.dataset.name;
    var val = e.detail.value;
    var data = {};
    data[name] = val;
    this.setData(data);
  },
  bindDC(e) {
    console.log('dc', e);
    var countIndex = parseInt(e.detail.value);
    var count = this.data.detailCountList[countIndex];
    this.setData({
      detailCountIndex: countIndex,
      detailCount: count
    });
  }
})
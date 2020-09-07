var req = require("../../../../util/req.js");

Page({

  data: {
    contactName: '',
    contactPhone: '',
    detailCount: '6',
    detailDoor: '',
    defaultAddress: 0,
    addressId: 0,
    needJump: false,
    detailCountList: [
      '6栋',
      '7栋',
      '8栋',
      '9栋',
      '10栋'
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
        var countIndex = 0;
        for (var i = 0; i < that.data.detailCountList.length; i++) {
          var item = that.data.detailCountList[i];
          if (item == (detailCount + '栋')) {
            countIndex = i;
            break;
          }
        }
        that.setData({
          addressId: id,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          detailCount: that.data.detailCountList[countIndex],
          detailDoor: detailDoor,
          defaultAddress: data.defaultAddress,
          detailCountIndex: countIndex
        })
      })
    }
  },
  save() {
    var defaultAddress = this.data.defaultAddress;
    var dong = this.data.detailCount;
    if (dong == '6') {
      wx.showToast({
        title: '6栋暂停服务',
      });
      return false;
    }
    var detailAddress = this.data.detailCount.replace(/栋/g, '').trim() + '栋 '+ this.data.detailDoor.trim();
    var data = {
      contactName: this.data.contactName,
      contactPhone: this.data.contactPhone,
      detailAddress: detailAddress,
      defaultAddress: defaultAddress
    };
    if (!data.contactName || data.contactName == '') {
      wx.showToast({
        title: '请输入联系人',
      });
      return false;
    }
    if (!data.contactPhone || data.contactPhone == '') {
      wx.showToast({
        title: '请输入手机号',
      });
      return false;
    }
    var door = this.data.detailDoor;
    if (!door || door == '') {
      wx.showToast({
        title: '请输入宿舍门号',
      });
      return false;
    }

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
    wx.showModal({
      title: '',
      content: '确认删除地址吗?',
      success(res) {
        if (that.data.addressId !== 0) {
          var addressId = that.data.addressId;
          wx.showLoading({
            title: '删除中...',
          })
          req.post('/api/user/userAddress/delete', { addressId: addressId }, function () {
            wx.hideLoading();
            const eventChannel = that.getOpenerEventChannel();
            if (eventChannel && eventChannel.emit) {
              eventChannel.emit('saveSuccess', { data: 'test' });
            }
            wx.navigateBack();
          });
        }
      }
    });
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
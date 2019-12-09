// page/kefu/kefu.js
Page({
  data: {
    phoneList: [
      {
        dong: '6',
        phone: '14796894561'
      }, {
        dong: '7',
        phone: '17636311807'
      }, {
        dong: '8',
        phone: '17687930531'
      }, {
        dong: '9',
        phone: '13635955374'
      }, {
        dong: '10',
        phone: '18279827443'
      }
    ]
  },
  onLoad: function (options) {

  },
  copyPhone(e) {
    console.log('copy: ', e);
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})
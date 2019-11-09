
var reqHost = 'https://wap.jzxcxin.xyz/noworry';

var ajax = function(options) {
  var token = global.token || '7123456';
  var url = options.url || '404';
  var reqData = options.data || {};

  wx.request({
    url: reqHost + url,
    method: options.method,
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': token
    },
    dataType: 'json',
    data: reqData,
    success: function (res) {
      if (res.statusCode === 200) {
        if (options.success) {
          options.success(res.data);
        }
        
        var data = res.data;
        if (data && data.success) {
          if (options.callback) {
            options.callback(data.data);
          }
        }
      }else {
        options.fail || options.fail(res);
      }
    }
  })
}

var get = function(url, data, callback) {
  ajax({
    url: url,
    method: 'GET',
    data: data,
    callback: callback
  })
}

var post = function(url, data, callback) {
  ajax({
    url: url, 
    method: 'POST',
    data: data,
    callback: callback
  })
}


module.exports = {
  reqHost: reqHost,
  ajax: ajax,
  get: get,
  post: post
}

// var reqHost = 'https://wap.jzxcxin.xyz/noworry';
var reqHost = 'http://localhost:9797';

var app = getApp();

var ajax = function(options, retry) {
  var token = global.token;
  var url = options.url || '404';
  if (url !== '/api/user/login' && (!token || token == '')) {
    if (retry > 30) {
      console.log('=== retry to much!!! ===')
      return;
    }
    setTimeout(function(){
      console.log('retry: ', retry || 0, url)
      ajax(options, (retry || 0 ) + 1);
    }, 500)
    return;
  }
  var reqData = options.data || {};
  var reqUrl = reqHost + url;
  if (options.realUrl) {
    reqUrl = options.realUrl;
  }
  wx.request({
    url: reqUrl,
    method: options.method,
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': token || 'first none token'
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
        if (options.fail) {
          options.fail(res);
        }
      }
    }
  })
}

var getOther = function(url, data, callback, success) {
  ajax({
    realUrl: url,
    method: 'GET',
    data: data,
    callback: callback,
    success: success
  });
}

var get = function (url, data, callback, success) {
  ajax({
    url: url,
    method: 'GET',
    data: data,
    callback: callback,
    success: success
  })
}

var post = function(url, data, callback, success) {
  ajax({
    url: url, 
    method: 'POST',
    data: data,
    callback: callback,
    success: success
  })
}


module.exports = {
  reqHost: reqHost,
  ajax: ajax,
  get: get,
  post: post,
  getOther: getOther
}
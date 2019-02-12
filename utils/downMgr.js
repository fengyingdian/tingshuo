/**
 * 下载一个文件
 */
function downLoadFile(obj) {
  //console.log("downLoadFile begin: ", obj)
  let success = obj.success
  let fail = obj.fail
  let id = obj.id
  let url = obj.url

  const downloadTask = wx.downloadFile({
    url: obj.url,
    success: function (res) {
      success({
        id: id,
        url: res.tempFilePath,
      })
    },
    fail: function (e) {
      fail(e)
    }
  })

  downloadTask.onProgressUpdate((res) => {
    obj.that.setData({
      loadingTitle: id,
      loadingCount: res.progress,
    })
  })
}

/**
 * 多文件批量下载，必须所有文件下载成功才算返回成功
 */
function downLoadFiles(obj) {
  //console.log("downLoadFiles begin: ", obj)
  let success = obj.success
  let fail = obj.fail
  let urls = obj.urls
  var resMap = {}
  var length = 0
  let urlsLength = urls.size
  //console.log("downLoadFiles begin: ", urls)
  for (var item of urls) {
    //console.log("downLoadFiles loop: ", item[0], item[1])
    downLoadFile({
      id: item[0],
      url: item[1],
      that: obj.that,
      success: function (res) {
        //console.log(res)
        resMap[res.id] = res.url
        length = length + 1
        //console.log("add: (%s, %s), size: %d/%d, ", res.id, res.url, length, urlsLength)
        if (length == urlsLength) { 
          if (success) {
            success(resMap)
          }
        }
      },
      fail: function (e) {
        urlsLength = urlsLength - 1
        if (length == urlsLength) {
          if (fail) {
            fail(resMap)
          }
        }
        fail(e)
      }
    })
  }
  //console.log("downLoadFiles end: ", obj)
}

module.exports = {
  downLoadFiles: downLoadFiles,
  downLoadFile: downLoadFile
}
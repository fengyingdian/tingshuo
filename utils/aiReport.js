const getScore = param => {
  var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJndWVzdCIsInN1YiI6InNwZWVjaHhfbWRkIiwiU2lnbmVkQnkiOiJqc3pob25nIiwibkNsaWVudElEIjoxNTM0MzE1MjA1LCJFbmdsaXNoTGV2ZWwiOjMsIm5NYXhDb25jdXJyZW50VXNlciI6MCwiUHVibGlzaGVyTmFtZSI6ImJlaWRhdGluZ3NodW8iLCJGZWVkQmFja1R5cGUiOjYsImlzcyI6ImF1dGgwIiwibkdCX1VTIjowLCJleHAiOjE1Mzk1MzI4MDV9.f84FB5dff5C-4DYOJjlbc-8_AknQEV31xxdyEZ6rAAE"
  var text = param.content
  wx.uploadFile({
    url: "https://t02.io.speechx.cn:8443/MDD_Server/mdd_v18",
    filePath: param.tempFilePath,
    header: {
      Authorization: `Bearer ${token}`,
    },
    name: 'myWavfile',
    formData: {
      word_name: `${text}`,
      user_id: "tingshouPKU",
    },
    success: function (res) {
      console.log("getScore: ", res)
      if (param.that.getScoreReadyCallback) {
        param.that.getScoreReadyCallback(res)
      }
    },
    fail: function (res) {

    }
  })
}

const getTempFileName = tempFilePath => {
  return tempFilePath.substring(13, tempFilePath.length-4)
}

module.exports = {
  getScore: getScore,
  getTempFileName: getTempFileName, 
}

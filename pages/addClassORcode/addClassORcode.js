// pages/addClassORcode/addClassORcode.js
const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    imageSrc: "../image/button/add5.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  //https://www.abceea.com/static/group/
  onLoad: function (options) {
    console.log("onLoad", options)
    let that = this
    that.setData({
      classId: options.classId
    })
  },

  addORCodeImage: function () {
    let that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths[0]
        that.setData({
          imageSrc: tempFilePaths,
        })
      }
    })
  },
  
  tapConfirm: function () {
    let that = this
    console.log(that.data.imageSrc)
    if (that.data.imageSrc == "../image/button/add5.png") {
      wx.showToast({
        title: '二维码为空',
      })
      return
    } 

    wx.showLoading({
      title: '提交中...',
    })
    var urlParam = "?type=1501"
      + "&classId=" + that.data.classId
      + "&usrId=" + app.globalData.miniId

    console.log("url1: ", app.url + urlParam)
    console.log("file1: ", that.data.imageSrc)
    wx.uploadFile({
      url: app.url + urlParam,
      filePath: that.data.imageSrc,
      name: 'addClassORcode',
      header: {
        'content-type': 'multipart/text'
      },
      success: function (res) {
        console.log("1501: ", res)
        var data = JSON.parse(res.data)
        console.log("1501: ", data)
        if (data.res == "success") {
          wx.showToast({
            title: '提交成功',
          })
          wx.navigateBack({
            delta: 1,
          })
        } else if (data.res == "wrong type") {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '当前只支持png和jpg格式的图片哦',
          })
        }else {
          wx.showToast({
            title: '提交失败',
          })
        }
      },
      fail: function (res) {
        console.log(res)
        wx.showModal({
          title: '请求失败提示',
          content: "请检查网络状态",
          showCancel: false,
          success: function (res) {
          }
        })
        wx.hideToast()
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})
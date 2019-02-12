//usrInfo.js
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const trans = require('../../utils/trans.js')
const app = getApp()

Page({
  data: {
    setting2: [
      { name: "Ta的打卡", image: "../image/button/punch2.png", tapFun: "tapMyPunch" },
      { name: "Ta的点评", image: "../image/button/commentText.png", tapFun: "tapMyComment" },
    ]
  },

  onLoad: function (option) {
    console.log(option)
    let that = this
    that.setData({
      height: app.globalData.windowHeight - 50,
      showPage: false,
    })
    if (app.globalData.miniId > 0) {
      that.loading(option)
    } else {
      app.miniIdReadyCallback = res => {
        console.log("1000 2: ", res)
        app.globalData.miniId = res.data.miniId
        app.globalData.userInfo = res.data.userInfo
        if (app.globalData.miniId < 1) {
          wx.showModal({
            title: '提示',
            content: '系统检测到您未正常登陆，请点击授权/刷新用户信息',
            showCancel: false,
            success: function (res) {
            },
          })
        } else {
          that.loading(option)
        }
      }
    }
  },

  loading: function (option) {
    let that = this
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1003,
        usrId: option.hostId,
      },
      success: function (res) {
        console.log("res:", res)
        if (res.data.res == "success") {
          that.setData({
            miniId: util.formatNumber09(app.globalData.miniId),
            userInfo: app.globalData.userInfo,
            hostInfo: res.data.userInfo,
            showPage: true,
          })
        } else if (res.data.res == "not existed"){
          wx.showModal({
            title: '提示',
            content: '用户不存在',
            showCancel: false,
          })
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  }, 

  tapMyFlower: function (event) {
    wx.navigateTo({
      url: '../myFlowers/myFlowers'
    })
  },

  tapMyPunch: function (event) {
    let that = this
    wx.navigateTo({
      url: '../usrPunchList/usrPunchList?punchHostId=' + that.data.hostInfo[8],
    })
  },

  tapMyComment: function (event) {
    let that = this
    wx.navigateTo({
      url: '../usrCommentList/usrCommentList?commentHostId=' + that.data.hostInfo[8],
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
    wx.showShareMenu({
      withShareTicket: true
    })
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
    wx.stopPullDownRefresh()
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

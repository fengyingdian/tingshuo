//index.js

const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const trans = require('../../utils/trans.js')
const app = getApp()

Page({
  data: {
    setting1: [
      {
        name: "刷新信息",
        image: "../image/button/refresh.png",
        openType: "getUserInfo",
        bind: "getUserInfo",
        bk: "rgb(255,246,237)",
        color: "rgb(235,171,97)",
        tap: ""
      },
      {
        name: "设置权限",
        image: "../image/button/authorization.png",
        openType: "openSetting",
        bk: "rgb(253,249,237)",
        color: "rgb(222,171,67)",
        bind: "",
        tap: ""
      },
      {
        name: "修改昵称",
        image: "../image/button/nickName.png",
        openType: "",
        bk: "rgb(255,246,237)",
        color: "rgb(235,151,97)",
        bind: "",
        tap: "tapModifyName"
      },
    ],
    setting2: [
      //{ name: "我的小红花", image: "../image/button/flower.png", tapFun:"tapMyFlower" },
      { name: "预约点评", image: "../image/button/commentBook.png", tapFun: "tapCommentBook" },
      { name: "我的打卡", image: "../image/button/punch2.png", tapFun: "tapMyPunch" },
      { name: "我的点评", image: "../image/button/commentText.png", tapFun: "tapMyComment" },
      { name: "加入我们", image: "../image/button/join.png", tapFun: "tapApplyPosition" },
    ]
  },

  onLoad: function () {
    console.log('onLoadadsffffffffffffffffffffffffffffffffffffffffffffffffffffff')

    let that = this
    that.setData({
      height: app.globalData.windowHeight - 50,
      showCharge: false
    })
    if (app.globalData.miniId > 0) {
      that.loading()
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
          that.loading()
        }
      }
    }
  },

  loading: function (e) {
    console.log('loadingdasdasdsd')
    let that = this
    that.setData({
      miniId: util.formatNumber09(app.globalData.miniId),
      userInfo: app.globalData.userInfo,
    })

    if (app.globalData.miniId == 1 || app.globalData.miniId == 2) {
      that.setData({
        showCharge: true,
      })
    }
  },

  getUserInfo: function (e) {
    console.log("getUserInfo: ", e)
    let that = this
    if (e.detail.errMsg == "getUserInfo:ok") {
      app.globalData.userInfo = {
        nickName: util.varifyStr(e.detail.userInfo.nickName),
        gender: e.detail.userInfo.gender,
        city: util.varifyStr(e.detail.userInfo.city),
        province: util.varifyStr(e.detail.userInfo.province),
        country: util.varifyStr(e.detail.userInfo.country),
        language: e.detail.userInfo.language,
        imageSrc: e.detail.userInfo.avatarUrl,
      }

      https.getUserInfo({
        app: app,
        url: '/pages/home/home',
      })
    } else {
      wx.showToast({
        title: '获取用户信息失败！',
      })
    }
  },

  tapMyFlower: function (event) {
    wx.navigateTo({
      url: '../myFlowers/myFlowers'
    })
  },

  tapCommentBook: function (event) {
    wx.navigateTo({
      url: '../myCommentBook/myCommentBook'
    })
  },

  tapApplyPosition: function (event) {
    wx.navigateTo({
      url: '../applyPosition/applyPosition'
    })
  },

  tapModifyName: function (event) {
    wx.navigateTo({
      url: '../modifyUsrInfo/modifyUsrInfo?nickName=' + app.globalData.userInfo.nickName,
    })
  },

  tapMyPunch: function (event) {
    wx.navigateTo({
      url: '../usrPunchList/usrPunchList?punchHostId=' + app.globalData.miniId,
    })
  },

  tapMyComment: function (event) {
    wx.navigateTo({
      url: '../usrCommentList/usrCommentList?commentHostId=' + app.globalData.miniId,
    })
  },

  tapPersonalInfo: function (event) {

  },

  tapChargeFlower: function (event) {
    wx.navigateTo({
      url: '../chargeFlower/chargeFlower'
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
    console.log('onLoadadsffffffffffffffffffffffffffffffffffffffffffffffffffffff')
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
    this.onLoad()
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

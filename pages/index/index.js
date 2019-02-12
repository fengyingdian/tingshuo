/**course.js**/
const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const https2 = require('../../utils/https2.js')
const trans = require('../../utils/trans.js')

Page({
  data: {
    broadcastStatus: 0,
  },
  
  onLoad: function (option) {
    wx.showShareMenu({
      withShareTicket: true
    })

    let that = this
    that.setData({
      showPage: false,
      width: app.globalData.windowWidth,
      height: app.globalData.windowHeight,
      bottomTips: "Make each day count.",
    })

    if (app.globalData.miniId < 1) {
      console.log("1000 1: ", app.globalData.miniId)
      app.miniIdReadyCallback = res => {
        console.log("1000 2: ", res)
        app.globalData.miniId = res.data.miniId
        app.globalData.userInfo = res.data.userInfo

        if (app.globalData.miniId < 1) {
          wx.showModal({
            title: '提示',
            content: '系统检测到您未正常登陆，请返回我的->授权/刷新用户信息',
            showCancel: false,
            success: function (res) {
              wx.switchTab({
                url: '../home/home'
              })
            },
          })
        } else {
          console.log("loading1")
          that.loading()
        }
      }
    }else{
      console.log("loading2")
      that.loading()
    }
  },

  loading: function () {
    this.setData({
      height: app.globalData.windowHeight - 50,
      width: app.globalData.windowWidth,
      userInfo: app.globalData.userInfo,
    })
    console.log("loading:", app)
    if (app.globalData.userInfo.imageSrc == "../image/button/tourist.jpg"){
      this.setData({
        isShowTop: false,
      })
    }else{
      this.setData({
        isShowTop: true,
      })
    }

    https2.getCourse({
      data: app.globalData,
      that: this,
    })
  },

  tapHead: function(event) {
    var content = "hi," + app.globalData.userInfo.nickName + " 欢迎回来，开始今天的挑战吧~"
    trans.textToVoice(content)
  },

  tapOneCourse: function (e) {
    console.log("tapOneCourse:", e.currentTarget.dataset.date)

    var curDate = e.currentTarget.dataset.date
    wx.navigateTo({
      url: '../everyday/everyday' + "?date=" + curDate + "&classType=" + "None"  
    })

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
        url: ''
      })

    } else {
      console.log("tapJoinGroup")
      wx.navigateTo({
        url: '/packageA/wxGroupInfo/index'
      })
    }
  },

  tapOneCourse1: function (event) {
    wx.showModal({
      title: '提示',
      content: '该课程只针对会员开放',
      showCancel: false,
    })
  },

  tapOneCourse2: function (event) {
    wx.showModal({
      title: '提示',
      content: '该课程只针对会员开放',
      showCancel: false,
    })
  },

  tapAllCourse: function(){
    wx.navigateTo({
      url: '../courseList/courseList'
    })
  },

  tapBreak: function (event) {
    console.log("tapBreak:")
    let that = this
    var course = that.data.course
    if (course.length > 0){
      var oneCourse = course[0]
      wx.navigateTo({
        url: '../everyday/everyday' + "?date=" + oneCourse[1] + "&classType=" + "None"
      }) 
    }
  },

  getUserInfo: function(e) {
    console.log("getUserInfo: ", e)
    let that = this
    if (e.detail.errMsg == "getUserInfo:ok"){
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
        url: '/packageA/wxGroupInfo/index'
      })

      app.getUserInfoReadyCallback = res => {
        var content = app.globalData.userInfo.nickName + "欢迎你回来！"
        trans.textToVoice(content)
      }
    }else{
      console.log("tapJoinGroup")
      wx.navigateTo({
        url: '/packageA/wxGroupInfo/index'
      }) 
    }
  },

  tapBroadcast: function (e) {
    console.log(e)
  },

  tapPunchRanking: function () {
    wx.navigateTo({
      url: '../rank/rank' + "?index=0"
    }) 
  },

  tapCommentRanking: function () {
    wx.navigateTo({
      url: '../rank/rank' + "?index=1"
    }) 
  },

  tapTrans: function () {
    wx.navigateTo({
      url: '../trans/trans'
    }) 
  },

  tapIdentify: function () {
    wx.showModal({
      title: '提示',
      content: '该功能正在开发中，请耐心等待',
      showCancel: false,
    })
  },

  tapMan2robot: function () {
    wx.navigateTo({
      url: '../man2robot/man2robot'
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
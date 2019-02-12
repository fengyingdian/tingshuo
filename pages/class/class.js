// pages/class/class.js

const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const https1 = require('../../utils/https1.js')

var select = 1

Page({
  /**
   * 页面的初始数据
   */
  data: {
    items: [
      { name: 1, value: '美音', checked: 'true'},
      { name: 2, value: '英音', checked: 'false'},
    ],
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
    ]
  },

  //
  onLoad: function (option) {
    wx.showShareMenu({
      withShareTicket: true
    })

    let that = this
    that.setData({
      showPage: false,
    })

    if (app.globalData.miniId < 1) {
      app.miniIdReadyCallback = res => {
        console.log("1000 2: ", res)
        app.globalData.miniId = res.data.miniId
        app.globalData.userInfo = res.data.userInfo

        if (app.globalData.miniId < 1) {
          wx.showModal({
            title: '提示',
            content: '系统检测到您未正常登陆，请返回首页授权/刷新用户信息',
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
    let that = this
    that.select = 1

    that.setData({
      height: app.globalData.windowHeight - 50,
      usrId: app.globalData.miniId,
    })

    that.setData({
      showType: 0,
    })

    https1.getClass({
      usrId: app.globalData.miniId,
      that: that,
    })
  },

  tapAddClass: function (event) {
    wx.navigateTo({
      url: '../addClass/addClass'
    })
  },

  tapOneClass: function (event) {
    console.log(event.currentTarget.id)
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1503,
        usrId: app.globalData.miniId,
        classId: event.currentTarget.id,
      },
      success: function (res) {
        console.log("1503: ", res)
        if (res.data.res == "success"){
          if (res.data.usrClassInfo[5] == 2) {
            var url = "../classInfo/classInfo?id=" + event.currentTarget.id
            wx.navigateTo({
              url: url,
            })
          } else if (res.data.usrClassInfo[5] == 0) {
            wx.showModal({
              title: '提示',
              content: 'Opps~您被该班级淘汰啦~',
              showCancel: false,
              success: function(){
                var url = "../classInfo/classInfo?id=" + event.currentTarget.id
                wx.navigateTo({
                  url: url,
                })
              }
            })
          } else if (res.data.usrClassInfo[5] == 3) {
            var url = "../classInfo/classInfo?id=" + event.currentTarget.id
            wx.navigateTo({
              url: url,
            })
          } else if (res.data.usrClassInfo[5] == 1){
            wx.showToast({
              title: '即将进入班级',
            })
            var url = "../oneClass/oneClass?id=" + event.currentTarget.id
             + "&loadType=1&select=0&sub=0"
            wx.navigateTo({
              url: url,
            })
          }
        } else if (res.data.res == "fail"){
          var url = "../classInfo/classInfo?id=" + event.currentTarget.id
          wx.navigateTo({
            url: url,
          })
        }
      },
      fail: function(res){
        console.log("1503: ", res)
      }
    })
  },

  //
  joinClassVIP: function (event) {
    let that = this
    https1.getClasses({
      usrId: app.globalData.miniId,
      that: that,
    })
    that.getClassReadyCallback = res => {
      console.log("res:", res)
      if (res.data.grade.length > 0){
        if (res.data.classData.length == 0){
          console.log("classData:", res.data.classData)
          that.setData({
            showType: 1,
          })
        }else{
          for (var i = 0; i < res.data.classData.length; ++i){
            if (res.data.classData[i][1] == "VIPTrain"){
              var date = new Date()
              date.setDate(date.getDate() + 1)
              console.log(date)
              var curDate = util.dateDir(date)
              console.log(curDate)
              wx.showLoading({
                title: '正在进入班级...',
              })
              wx.navigateTo({
                url: '../punchClock/punchClock' + "?date=" + curDate + "&classType=" + "VIPTrain"
              })
              break
            }
          }
          if (i == res.data.classData.length){
            that.setData({
              showType: 1,
            })
          }
        }
      } else if (res.data.grade.length == 0){
        wx.showModal({
          title: '提示',
          content: '申请职务成功之后才能进入VIP集训营哦！',
        })
      }
    }
  },

  //
  tapReturn: function (event) {
    this.setData({
      showType: 0
    })
  },

  //
  tapConfirm: function (event) {
    let that = this
    https.applyVIPClass({
      usrId: app.globalData.miniId,
      select: this.select,
      that: that,
    })
  },

  //
  radioChange: function (e) {
    console.log('value: ', e.detail.value)
    this.select = e.detail.value 
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
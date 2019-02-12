// pages/rank/rank.js
const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const https1 = require('../../utils/https1.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    titles: [
      { name: "打卡排行" },
      { name: "点评排行" },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    wx.showShareMenu({
      withShareTicket: true
    })

    let that = this
    that.setData({
      showPage: false,
      select: option.index
    })

    if (app.globalData.miniId < 1) {
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
    } else {
      console.log("loading2")
      that.loading()
    }
  },

  loading: function (options) {
    let that = this
    https1.getRankData({
      usrId: app.globalData.miniId,
      that: that,
    })
  }, 

  tapTitle: function (options) {
    console.log("tapTopTitle:", options)
    let that = this
    that.setData({
      select: options.currentTarget.id,
    })
  }, 

  tapOneUsr: function (event) {
    console.log("tapOneUsr: ", event)
    wx.navigateTo({
      url: '../usrInfo/usrInfo?hostId=' + event.currentTarget.dataset.usrid,
    })
  },

  tapOnePunch: function (event) {
    console.log("tapOnePunch: ", event)
    wx.navigateTo({
      url: '../usrPunchList/usrPunchList?punchHostId=' + event.currentTarget.dataset.usrid,
    })
  },

  tapOneComment: function (event) {
    console.log("tapOneComment: ", event)
    wx.navigateTo({
      url: '../usrCommentList/usrCommentList?commentHostId=' + event.currentTarget.dataset.usrid,
    })
  },

  tapFlower: function (event) {
    console.log("tapFlower: ", event.currentTarget.dataset)
    let that = this
    var usrId = event.currentTarget.dataset.usrid
    var name = event.currentTarget.dataset.name
    var image = event.currentTarget.dataset.image
    that.setData({
      rewardId: usrId,
      rewardName: name,
      rewardImage: image,
      rewardCount: 5,
      showReward: true,
    })
  },

  slider2change: function (e) {
    console.log('value: ', e)
    let that = this
    that.setData({
      rewardCount: e.detail.value.toFixed(0),
    })
  },

  tapPick: function () {
    let that = this
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 7001,
        usrId: app.globalData.miniId,
        toUsrId: that.data.rewardId,
        count: that.data.rewardCount,
      },
      success: function (res) {
        console.log("7001: ", res)
        if (res.data.res == "NE") {
          wx.showModal({
            title: '小红花不足',
            content: '剩余小红花：' + res.data.sum.toString() + '朵',
            showCancel: false,
          })
        } else if (res.data.res == "success") {
          wx.showModal({
            title: '打赏成功',
            content: '剩余小红花：' + res.data.sum.toString() + '朵',
            showCancel: false,
          })
          that.setData({
            showReward: false,
          })
        } else {
          wx.showToast({
            title: '未知错误',
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '网络错误',
        })
      }
    })
  },

  tapCancelPick: function () {
    let that = this
    that.setData({
      showReward: false,
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
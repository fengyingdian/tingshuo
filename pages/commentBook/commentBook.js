// pages/commentBook/commentBook.js
const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const https1 = require('../../utils/https1.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    wx.hideShareMenu()
    wx.showLoading()

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
          that.loading(option)
        }
      }
    } else {
      console.log("loading2")
      that.loading(option)
    }
  },

  loading: function (option) {
    console.log("loading:", option)
    let that = this
    https1.getCanBookList({
      usrId: app.globalData.miniId,
      punchId: option.punchId,
      that: that,
    })
  }, 

  slider2change: function (e) {
    console.log('value: ', e)
    var id = parseInt(e.currentTarget.id) 
    let that = this
    that.data.canBookList[id][16] = e.detail.value.toFixed(0) / 50
    that.setData({
      canBookList:that.data.canBookList,
    })
  },

  slider2changing: function (e) {
    console.log('value: ', e)
    var id = parseInt(e.currentTarget.id)
    let that = this
    that.data.canBookList[id][16] = e.detail.value.toFixed(0) / 50
    that.setData({
      canBookList: that.data.canBookList,
    })
  },

  tapPick: function (event) {
    console.log("tapPick: ", event.currentTarget.dataset)
    if (app.globalData.miniId == event.currentTarget.dataset.usrid){
      wx.showToast({
        title: '哇~太自恋啦！',
      })
    }
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定要预约点评吗？',
      success: function(res){
        if (res.confirm){
          wx.request({
            url: 'https://www.abceea.com/test',
            data: {
              type: 7200,
              usrId: app.globalData.miniId,
              toUsrId: event.currentTarget.dataset.usrid,
              punchId: that.data.punchId,
              count: event.currentTarget.dataset.count,
            },
            success: function (res) {
              console.log("7200: ", res)
              if (res.data.res == "NE") {
                wx.showModal({
                  title: '小红花不足',
                  content: '剩余小红花：' + res.data.sum.toString() + '朵',
                  showCancel: false,
                })
              } else if (res.data.res == "success") {
                wx.showModal({
                  title: '预约成功',
                  content: '剩余小红花：' + res.data.sum.toString() + '朵',
                  showCancel: false,
                })
                that.setData({
                  showReward: false,
                })
              } else if (res.data.res == "existed") {
                wx.showToast({
                  title: '已经预约过啦~',
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
        }
      }
    })
  },

  tapOneUsr: function (event) {
    console.log("tapOneUsr: ", event)
    wx.navigateTo({
      url: '../usrInfo/usrInfo?hostId=' + event.currentTarget.dataset.usrid,
    })
  },

  tapOnePunch: function(event){
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
// pages/myCommentBook/myCommentBook.js
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const trans = require('../../utils/trans.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTitiles: [
      { name: "预约" },
      { name: "被预约" }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      showPage: false,
      titleSelected: 0,
    })
    that.loading(options)
  },

  loading: function (options) {
    let that = this
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 7300,
        usrId: app.globalData.miniId,
      },
      success: function (res) {
        console.log("7300: ", res)
        if (res.data.res == "success") {
          wx.hideLoading()
          if (res.data.events1.length <= 0 && res.data.events2.length <= 0 ){
            wx.showToast({
              title: '您还没有记录',
            })
            return
          }
          that.setData({
            showPage: true,
            events1: res.data.events1.reverse(),
            events2: res.data.events2.reverse(),
          })
        } else {
          wx.showToast({
            title: '未知错误',
          })
        }
      },
      false: function (res) {
        wx.showToast({
          title: '网络错误',
        })
      },
    })
  },

  tapTopTitle: function (options) {
    console.log("tapTopTitle:", options)
    let that = this
    that.setData({
      titleSelected: options.currentTarget.id,
    })
  },

  tapOnePunch: function (event) {
    console.log("tapOnePunch: ", event)

    var dataOption = event.currentTarget.dataset
    var urlvalue = '../recordShow/recordShow?punchId=' + dataOption.punchid
      + '&date=' + dataOption.date + '&classType=0&loadType=1'
    console.log("urlvalue:", urlvalue)

    wx.navigateTo({
      url: urlvalue
    })
  },

  tapRefuse: function (event) {
    console.log("tapRefuse: ", event)
    var dataOption = event.currentTarget.dataset
    var punchId = event.currentTarget.dataset.punchid
    var bookUsrId = event.currentTarget.dataset.usrid
    var index = event.currentTarget.dataset.index
    var count = event.currentTarget.dataset.count
    var toUsrId = app.globalData.miniId
    var usrId = app.globalData.miniId
    console.log(usrId, bookUsrId, toUsrId, punchId)
    let that = this
    that.modifyEvent({
      usrId: usrId,
      punchId: punchId,
      bookUsrId: bookUsrId,
      toUsrId: toUsrId,
      count: count,
      index: index,
      eventCode: 30002,
      eventStatus: "已拒绝",
    })
  },

  tapAccept: function (event) {
    wx.showModal({
      title: '提示',
      content: '请一定在点评之后再确认哦~',
      showCancel: false,
    })
    console.log("tapAccept: ", event)
    var dataOption = event.currentTarget.dataset
    var punchId = event.currentTarget.dataset.punchid
    var bookUsrId = event.currentTarget.dataset.usrid
    var index = event.currentTarget.dataset.index
    var count = event.currentTarget.dataset.count
    var toUsrId = app.globalData.miniId
    var usrId = app.globalData.miniId
    console.log(usrId, bookUsrId, toUsrId, punchId)
    let that = this
    that.modifyEvent({
      usrId: usrId,
      punchId: punchId,
      bookUsrId: bookUsrId,
      toUsrId: toUsrId,
      count: count,
      index: index,
      eventCode: 30001,
      eventStatus: "已点评",
    })
  },

  modifyEvent: function (event) {
    let that = this
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 7201,
        usrId: event.usrId,
        bookUsrId: event.bookUsrId,
        toUsrId: event.toUsrId,
        punchId: event.punchId,
        eventCode: event.eventCode,
        count: event.count,
      },
      success: function (res) {
        console.log("7201: ", res)
        if (res.data.res == "success") {
          that.data.events2[event.index].eventCode = event.eventCode
          that.data.events2[event.index].eventStatus = event.eventStatus
          that.setData({
            events2: that.data.events2,
          })
        } else {
          wx.showToast({
            title: '未知错误',
          })
        }
      },
      false: function (res) {
        wx.showToast({
          title: '网络错误',
        })
      },
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
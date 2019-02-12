// pages/chargeFlower/chargeFlower.js
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const trans = require('../../utils/trans.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    usrId: 1,
    count: 1000,
  },

  usrIdInput: function (event) {
    let that = this
    that.setData({
      usrId: event.detail.value
    })
  },

  countInput: function (event) {
    let that = this
    that.setData({
      count: event.detail.value
    })
  },

  tapConfirm: function (event) {
    let that = this
    if (app.globalData.miniId != 1 && app.globalData.miniId != 2) {
      wx.showModal({
        title: '提示',
        content: '您尚不具备该权限！',
      })
    }
    console.log("tapConfirm: ", that.data.usrId, that.data.count)
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 7000,
        usrId: app.globalData.miniId,
        chargeUsrId: that.data.usrId,
        count: that.data.count,
      },
      success: function (res) {
        console.log("7000: ", res)
        if (res.data.res == "success") {
          wx.showModal({
            title: '充值成功',
            content: res.data.name + '余额' + res.data.sum.toString() + "朵小红花",
            showCancel: false,
          })
        } else if (res.data.res == "no usr") {
          wx.showToast({
            title: '用户不存在',
          })
        } else{
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.miniId != 1 && app.globalData.miniId != 2){
      wx.navigateBack({
        delta: 0,
      })
    }
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
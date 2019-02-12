// pages/modifyUsrInfo/modifyUsrInfo.js
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const check = require('../../utils/check.js')
const app = getApp()

var inputContent = ""

Page({
  /**
   * 页面的初始数据
   */
  data: {
    nickName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.inputContent = options.nickName
    this.setData({
      nickName: options.nickName,
    })
  },

  //
  codeInput: function (event) {
    this.inputContent = event.detail.value
    console.log("Input: ", this.inputContent)
  },

  tapConfirm: function (event) {
    this.inputContent = util.varifyStr(this.inputContent)
    if (this.inputContent == app.globalData.userInfo.nickName){
      wx.showToast({
        title: '跟原名重复',
        icon: 'none',
        duration: 1000,
      })
      return
    }

    app.globalData.userInfo.nickName = this.inputContent

    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1001,
        usrId: app.globalData.miniId,
        id: app.globalData.miniId,
        nickName: app.globalData.userInfo.nickName,
        gender: app.globalData.userInfo.gender,
        city: app.globalData.userInfo.city,
        province: app.globalData.userInfo.province,
        country: app.globalData.userInfo.country,
        language: app.globalData.userInfo.language,
        imageSrc: app.globalData.userInfo.imageSrc,
      },
      success: function (res) {
        console.log("res:", res)
        if (res.data["res"] == "success") {
          wx.showToast({
            title: '修改成功',
          })
          wx.reLaunch({
            url: '/pages/home/home',
          })
        } else {
          wx.showToast({
            title: '修改失败',
          })
        }
      },
      fail: function (e) {
        console.log("1001: fail: ", e)
        wx.showToast({
          title: '网络错误',
        })
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
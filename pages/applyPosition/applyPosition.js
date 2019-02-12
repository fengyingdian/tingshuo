// pages/applyPosition/applyPosition.js
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    items: [
      { name: "professor", value: '课件老师', checked: 'true' },
      { name: "teacher", value: '点评老师', checked: 'false' },
      { name: "monitor", value: '班长', checked: 'false' },
      { name: "monitorAssistant", value: '纠音助手', checked: 'false' },
      { name: "secretary", value: '支书', checked: 'false' },
      { name: "editor", value: '编辑', checked: 'false' },
      { name: "teacherAssistant", value: '助教', checked: 'false' },
    ],
    inputContent: "",
    roleType: "professor"
  },

  codeInput: function (event) {
    console.log('value: ', event.detail.value)
    var inputContent = event.detail.value
    let that = this
    that.setData({
      inputContent: inputContent,
    })
  },

  radioChange: function(e) {
    console.log('value: ', e.detail.value)
    var roleType = e.detail.value
    let that = this
    that.setData({
      roleType: roleType,
    })
  },

  tapConfirm: function (event) {
    let that = this 
    if (that.data.inputContent == "") {
      wx.showToast({
        title: '空白邀请码',
        duration: 1000,
      })
      return
    }
    console.log("tapConfirm: ", app.globalData.miniId, that.data.roleType, that.data.inputContent)

    https.applyRole({
      usrId: app.globalData.miniId,
      role: that.data.roleType,
      code: that.data.inputContent,
      that: that,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.inputContent = ""
    wx.setNavigationBarTitle({
      title: "加入我们"
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
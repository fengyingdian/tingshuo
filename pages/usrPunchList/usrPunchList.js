// pages/usrPunchList/usrPunchList.js
const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')

Page({
  data: {
  },

  onLoad: function (option) {
    console.log("usrPunchList-onLoad: ", option)

    wx.showShareMenu({
      withShareTicket: true
    })

    let that = this
    that.setData({
      showPage: false,
      punches: null,
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
          that.loading(option)
        }
      }
    } else {
      console.log("loading2")
      that.loading(option)
    }
  },

  loading: function (option) {
    let that = this
    that.setData({
      height: app.globalData.windowHeight - 50,
    })

    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1205,
        punchHostId: option.punchHostId,
        usrId: app.globalData.miniId,
        that: that,
      },
      success: function (res) {
        console.log("res:", res)
        if (res.data.res == "success"){
          var data = res.data.data.reverse()
          var usrInfo = res.data.usrInfo
          if (data.length == 0){
            wx.showModal({
              title: '提示',
              content: '没有打卡数据',
              showCancel: false,
            })
            that.setData({
              punches: null,
              showPage: true,
            })
          }else{
            that.setData({
              usrImage: usrInfo[7],
              punches: data,
              showPage: true,
            })
          }
        }else{
          wx.showToast({
            title: '数据错误',
          })          
        }
      },
      fail: function( res ){
        wx.showToast({ 
          title: '网络错误',
        })
      }
    })
  },
  
  tapOnePunch: function(event){
    console.log("tapOnePunch: ", event)

    var dataOption = event.currentTarget.dataset
    var urlvalue = '../recordShow/recordShow?punchId=' + dataOption.punchid
      + '&date=' + dataOption.date + '&classType=0&loadType=1'
    console.log("urlvalue:", urlvalue)

    wx.navigateTo({
      url: urlvalue
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
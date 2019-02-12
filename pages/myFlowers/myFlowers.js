// pages/myFlowers/myFlowers.js
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const trans = require('../../utils/trans.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this 
    that.setData({
      showflowerList: false,
    })
    wx.showLoading()
    that.loading(options)
  },

  loading: function (options) {
    let that = this
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 7100,
        usrId: app.globalData.miniId,
      },
      success: function (res) {
        console.log("7100: ", res)
        if (res.data.res == "success") {
          var eventCode = {
            10000: "充值",
            10001: "打卡",
            10002: "语音点评",
            10003: "文字点评",
            10004: "点赞",
            10005: "被打赏",
            20001: "删除打卡",
            20002: "删除语音点评",
            20003: "删除文字点评",
            20004: "取消点赞",
            20005: "打赏",
          }
          var eventList = []
          var events = res.data.events.reverse()
          for (var i = 0; i < events.length; i++){
            var oneEvent = {
              "code": events[i][2],
              "codeName": eventCode[events[i][2]],
              "count": events[i][3]>0?"+" + events[i][3].toString() : events[i][3],
              "time": util.formatTime(new Date(events[i][4]*1000))
            }
            eventList.push(oneEvent)
          }
          that.setData({
            eventList: eventList,
            showflowerList: true,
            sum: res.data.sum[1],
          })
          wx.hideLoading()
        }else {
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

  tapPreViewORcode: function () {
    wx.previewImage({
      urls: ['https://www.abceea.com/static/others/go_for_dreams_ORcode.jpg'],
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
// pages/punchClock/index.js
const util = require('../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lastingTime:20,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.setData({
      date: options.date,
      courseId: options.courseid, 
      content: options.content.replace("^", "?"),
      imageSrc: app.globalData.userInfo.imageSrc,
      audioSrc: null,
      showPlay: false,
      rock: false,
      status: 0,
      showPage: true,
    })
    app.getRecordAuth()
  },

  tapStart: function(e){
    console.log("punchClock-tapStart: ", e.detail)

    this._startAudio()

    this._startConfirm()

    this.setData({
      rock: true,
      status: 0,
    })
  },

  tapStop: function (e) {
    console.log("punchClock-tapStop: ", e.detail.tempFilePath)
    this.setData({
      audioSrc: e.detail.tempFilePath,
    })

    this._animationAudio()

    this._animationConfirm()

    this.setData({
      rock: false
    })

    //this._animationPage()
  },

  uploadFile: function (e) {
    console.log("uploadFile2")
    //this.setData({
    //  showPage: false,
    //})
  },

  uploadFinished: function (e) {
    console.log("uploadFinished2")
    this.setData({
      showPage: true,
    })
  },

  getReport: function (e) {
    console.log("getReport:", e.detail)
    this.setData({
      hasAiReport: true,
      aiReport: e.detail.aiReport,
    })
  },

  tapConfirm: function () {
    this._send()
  },

  _send: function () {
    let that = this
    if (that.data.hasPunched) {
      wx.showModal({
        title: '发布提示',
        content: '确定要删除之前的打卡，发布新的打卡吗？',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              status: 0,
              showPage: false,
            })
            that._sendAudio()
          }
        }
      })
    } else {
      wx.showModal({
        title: '发布提示',
        content: '确定要发布打卡吗？',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              status: 0,
              showPage: false,
            })
            that._sendAudio()
          }
        }
      })
    }
  },

  _sendAudio: function () {
    let that = this
    var time = util.formatTime(new Date())

    var urlParam = "?type=1200" + "&courseId=" + that.data.courseId
      + "&usrId=" + app.globalData.miniId
      + "&date=" + that.data.date
      + "&practice=0"
      + "&thumb=0"
      + "&class=" + that.data.classType

    if (that.data.hasAiReport) {
      urlParam = urlParam + "&score=" + that.data.aiReport.score
    }

    wx.uploadFile({
      url: app.url + urlParam,
      filePath: that.data.audioSrc,
      name: 'punch',
      header: {
        'content-type': 'multipart/text'
      },
      success: function (res) {
        console.log("1200: ", res)
        var data = JSON.parse(res.data)
        console.log("1200: ", data)
        if (data.res == "success") {
          if (app.punchClockReturnCallback) {
            app.punchClockReturnCallback()
          }
          wx.navigateBack({
            delta: 1,
          })
        } else {
          wx.showToast({
            title: '未知错误',
          })
        }
      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          title: '网络错误',
        })
      }
    })
  },

  _startAudio: function () {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear',
    })
    animation.opacity(0).scale(0.5, 0.5).step()
    this.setData({
      animationData: animation.export()
    })
  },

  _startConfirm: function () {
    var animation = wx.createAnimation({
      duration: 2000,
      timingFunction: 'linear',
    })
    animation.translateY(2000).opacity(0).step()
    this.setData({
      animationConfirm: animation.export()
    })
  },

  _animationAudio: function(){
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear',
    })
    if (this.data.showPlay == false) {
      this.setData({
        showPlay: true,
      })
      animation.opacity(1).scale(1, 1).step()
      this.setData({
        animationData: animation.export()
      })
    } else {
      animation.opacity(1).scale(1, 1).step()
      this.setData({
        animationData: animation.export()
      })
    }
  },

  _animationConfirm: function () {
    var animation = wx.createAnimation({
      duration: 2000,
      timingFunction: 'linear',
    })
    animation.opacity(1).scale(1, 1).step()
    this.setData({
      animationConfirm: animation.export()
    })
  },

  _animationPage: function () {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear',
    })
    animation.skewX(180).step()
    this.setData({
      animationPage: animation.export()
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
    //wx.startPullDownRefresh()
    //setTimeout(function () {
    //  wx.stopPullDownRefresh()
    //}.bind(this), 100)
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
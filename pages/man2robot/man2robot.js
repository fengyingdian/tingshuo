// pages/man2robot/man2robot.js
const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const https2 = require('../../utils/https2.js')

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
    let that = this
    that.setData({
      showPage: false,
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
          that.loading()
        }
      }
    } else {
      console.log("loading2")
      that.loading()
    }  
  },

  loading: function () {
    let that = this
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        usrId: 1,
        type: 2001,
        title: "demo",
        name: "demo",
      },
      success: function (res) {
        console.log("2001:", res)
        if (res.data.res == "success"){
          that.setData({
            contents: res.data.contents,
            title: res.data.title,
            name: res.data.name,
            showPage: true,
          })

          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.obeyMuteSwitch = false

          that.innerAudioContext.onStop(res => {
            that.playAnimationEnd()
          })

          that.innerAudioContext.onPlay((res) => {
            that.playAnimationStart(that.data.selected)
          })

          that.innerAudioContext.onEnded((res) => {
            console.log("onEnded1")
            if (that.data.sequence) {
              if (that.data.selected < that.data.contents.length - 1) {
                that.setData({
                  selected: that.data.selected + 1
                })
                var src = "https://www.abceea.com/static/dialog/"
                  + that.data.title + "/" + that.data.name + "/" + that.data.contents[that.data.selected][4]

                that.innerAudioContext.src = src
                that.innerAudioContext.play()
                that.innerAudioContext.onPlay((res) => {
                  that.playAnimationStart(that.data.selected)
                })
              } else {
                that.playAnimationEnd()
              }
            } else {
              that.playAnimationEnd()
            }
          })
        }else{
          wx.showToast({
            title: '未知错误',
          })
        }
      },
      fail: function (res) {
        console.log("2001:", res)
        wx.showToast({
          title: '网络错误',
        })
      },
    })
  },

  tapAudioSequencePlay: function (event) {
    console.log("tapAudioSequencePlay: ", event)
    let that = this
    that.setData({
      sequence: true,
      selected: 0
    })

    var src = "https://www.abceea.com/static/dialog/" 
      + that.data.title + "/" + that.data.name + "/" + that.data.contents[0][4] 

    that.innerAudioContext.src = src
    that.innerAudioContext.play()
  },

  tapAudioSequenceStop: function (event) {
    let that = this
    that.innerAudioContext.stop()
  },

  tapAudioPlay: function (event) {
    console.log("tapAudioPlay: ", event)
    let that = this
    let play_path = event.currentTarget.dataset.audiosrc
    var selected = event.currentTarget.dataset.selected

    if (!play_path) {
      console.warn("no translate voice path")
      return
    }
    console.log("playing: ", that.data.playType, that.data.selected)
    if (that.data.playType == 'playing' && that.data.selected != -1 && that.data.selected == selected){
      that.innerAudioContext.stop()
      that.playAnimationEnd()
      return
    }

    that.setData({
      sequence: false,
      selected: selected,
    })
    that.innerAudioContext.src = play_path
    that.innerAudioContext.play()
  },

  playAnimationStart: function (selected) {
    let that = this
    that.setData({
      playType: 'playing',
    })
  },

  playAnimationEnd: function () {
    let that = this
    that.setData({
      sequence: false,
      playType: 'wait',
      selected: -1,
    })
  },

  tapRolePlay: function () {
    wx.navigateTo({
      url: '../man2robotPlay/man2robotPlay'
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
    console.log("onHide1")
    let that = this
    that.innerAudioContext.stop()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onUnload1")
    let that = this
    that.innerAudioContext.stop()
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
// pages/practice/practice.js
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const check = require('../../utils/check.js')
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
    console.log("option: ", options)
    wx.showLoading()
    let that = this
    var key1 = options.date + '-pracitice'
    var value1 = wx.getStorageSync(key1)
    console.log("value1: ", value1)
    if (value1) {
      that.setData({
        practiceTime: value1.practiceTime,
        practiceLeft: value1.practiceLeft,
        practiceSum: value1.practiceSum,
        delayTime: value1.delayTime,
        delayLeft: value1.delayTime,
      })
    }else{
      var key2 = 'default-pracitice'
      var value2 = wx.getStorageSync(key2)
      console.log("value2: ", value2)
      if (value2) {
        that.setData({
          practiceTime: value2.practiceTime,
          practiceLeft: value2.practiceTime,
          practiceSum: value2.practiceSum,
          delayTime: value2.delayTime,
          delayLeft: value2.delayTime,
        })
      } else {
        var value = {
          practiceTime: 50,
          practiceLeft: 50,
          practiceSum: 0,
          delayTime: 5,
          delayLeft: 5,
        }
        that.setData(value)
        this.setStorage()
      }
    }

    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1102,
        date: options.date,
        usrId: app.globalData.miniId,
        class: options.classType,
      },
      success: function (res) {
        console.log("1102: ", res)
        if (res.data.res == "success") {
          var dataStorageSync = wx.getStorageSync("EverydayEnglishDateVideo" + options.date)
          console.log("dataStorageSync: ", dataStorageSync)
          if (dataStorageSync) {
            that.setData({
              videoSrc: 'https://www.abceea.com/static/class/' + options.date + '/a.mp4',
            })
          }else{
            that.setData({
              videoSrc: 'https://www.abceea.com/static/class/' + options.date + '/a.mp4',
            })
          }

          that.setData({
            playState: 1,
            ended: 0,
            practiceType: options.practiceType,
            date: options.date,
            content: res.data.courseData[2]
          })
          wx.hideLoading()

          if (that.data.practiceSum > 0){
            var time = that.data.practiceSum.toString()
            wx.showModal({
              title: '提示',
              content: '您已练习'+time+'次，继续加油哦！',
              showCancel: false,
            })
          }else{
            wx.showModal({
              title: '提示',
              content: '您还没有练习过这段，加油哦！',
              showCancel: false,
            })
          }
        }else{
          wx.showModal({
            title: '警告',
            content: '服务器异常',
            showCancel: false,
          })
        }
      },
      fail: function(res){
        wx.showModal({
          title: '警告',
          content: '网络异常',
        })
      }
    })
  },

  slider2changeDelayTime: function (e) {
    var curval = e.detail.value.toFixed(0)
    console.log("value: ", curval)

    if(this.data.ended == 1){
      var cost = this.data.delayTime - this.data.delayLeft
      var delayLeft = curval - cost
      if (delayLeft < 0) {
        delayLeft = 0
      }
      this.setData({
        delayLeft: delayLeft,
      })
    }else
    {
      this.setData({
        delayLeft: curval,
      })
    }

    this.setData({
      delayTime: curval,
    })

    this.setStorage()
  },

  slider2changingDelayTime: function (e) {
    var curval = e.detail.value.toFixed(0)
    console.log("value: ", curval)

    if (this.data.ended == 1) {
      var cost = this.data.delayTime - this.data.delayLeft
      var delayLeft = curval - cost
      if (delayLeft < 0){
        delayLeft = 0
      }  
      this.setData({
        delayLeft: delayLeft,
      })
    } else {
      this.setData({
        delayLeft: curval,
      })
    }

    this.setData({
      delayTime: curval,
    })

    this.setStorage()
  },

  slider2change: function (e) {
    var curval = e.detail.value.toFixed(0)
    console.log("value: ", curval)
    
    var practiced = this.data.practiceTime - this.data.practiceLeft
    var practiceLeft = curval - practiced
    if (practiceLeft < 0) {
      practiceLeft = 0
    }

    this.setData({
      practiceTime: curval,
      practiceLeft: practiceLeft,
    })

    this.setStorage()
  },

  slider2changing: function (e) {
    var curval = e.detail.value.toFixed(0)
    console.log("value: ", curval)

    var practiced = this.data.practiceTime - this.data.practiceLeft
    var practiceLeft = curval - practiced
    if (practiceLeft < 0){
      practiceLeft = 0
    }

    this.setData({
      practiceTime: curval,
      practiceLeft: practiceLeft,
    })

    this.setStorage()
  },

  videoPlayCallback: function () {
    console.log("videoPlayCallback")
    this.tapPlay()
  },

  videoEndedCallback: function () {
    console.log("videoEndedCallback")

    this.setData({
      ended: 1
    })

    var idInterval = setInterval(function () {
      this.setData({
        idInterval: idInterval,
      })
      if (this.data.playState == 1 && this.data.ended == 1) {
        if (this.data.delayLeft > 0) {
          this.setData({
            delayLeft: this.data.delayLeft - 1
          })
          wx.showToast({
            title: this.data.delayLeft.toString(),
          })
        } else {
          clearInterval(idInterval)
          this.setData({
            delayLeft: this.data.delayTime
          })
          this.setData({
            ended: 0
          })
          this.setData({
            practiceLeft: this.data.practiceLeft - 1,
            practiceSum: this.data.practiceSum + 1,
          })
          this.setStorage()
          if (this.data.practiceLeft < 1) {
            let that = this
            that.setData({
              practiceTime: that.data.practiceTime,
              practiceLeft: that.data.practiceTime,
            })
            that.videoContext.pause()
            that.setData({
              playState: 0,
            })
            console.log("end: ", this.data.practiceLeft)
            wx.showModal({
              title: '提示',
              content: '恭喜你已经完成练习！',
            })
          }else{
            let that = this
            that.videoContext.play()
          }
        }
      }
    }.bind(this), 1000)
  },

  tapPlay: function () {
    console.log("tapPlay")
    clearInterval(this.data.idInterval)

    this.videoContext.play()
    this.setData({
      playState: 1,
    })
    this.setData({
      delayLeft: this.data.delayTime
    })
    this.setData({
      ended: 0
    })
  },

  tapPause: function () {
    console.log("tapPause")
    wx.showToast({
      title: '已暂停',
    })
    this.videoContext.pause()
    this.setData({
      playState: 0,
    })
  },

  tapReset: function () {
    console.log("tapReset")
    this.setData({
      practiceTime: this.data.practiceTime,
      practiceLeft: this.data.practiceTime,
    })
    this.videoContext.pause()
    this.setData({
      playState: 0,
    })
    this.setStorage()
  },
  
  setStorage: function() {
    var value = {
      practiceTime: this.data.practiceTime,
      practiceLeft: this.data.practiceLeft,
      practiceSum: this.data.practiceSum,
      delayTime: this.data.delayTime,
      delayLeft: this.data.delayTime,
    }
    
    var key1 = this.data.date + '-pracitice'
    wx.setStorageSync(key1, value)

    value.practiceSum = 0
    var key2 = 'default-pracitice'
    wx.setStorageSync(key2, value)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo')
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
    console.log("onHide: ", this.data.idInterval)
    clearInterval(this.data.idInterval)

    var value = {
      practiceTime: this.data.practiceTime,
      practiceLeft: this.data.practiceLeft,
      practiceSum: this.data.practiceSum,
      delayTime: this.data.delayTime,
      delayLeft: this.data.delayTime,
    }
    this.setData(value)
    this.setStorage()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onUnload: ", this.data.idInterval)
    clearInterval(this.data.idInterval)

    this.setStorage()
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
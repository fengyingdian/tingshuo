// pages/Everyday/Everyday.js
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const https2 = require('../../utils/https2.js')
const check = require('../../utils/check.js')
const app = getApp()

//////////////////////////////////////////////
//音频上下文
const backgroundAudioManager = wx.getBackgroundAudioManager()
backgroundAudioManager.obeyMuteSwitch = false

Page({
  /**
   * 页面的初始数据
   */
  data: {
    state: 1, //1-初始化
    srcPlayPause: app.image.playGreen,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    console.log("option: ", option)

    let that = this
    that.setData({
      leftMinute: "00",
      leftSecond: "00",
      rightMinute: "00",
      rightSecond: "00",
      showPage: false,
    })

    wx.showShareMenu({
      withShareTicket: true
    })

    that.setData({
      height: app.globalData.windowHeight,
      recordWidth: 0.9*app.globalData.windowWidth,
      date: option.date,
    })

    if (app.globalData.miniId < 1) {
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
          that.loading(option)
        }
      }
    } else {
      that.loading(option)
    }
  },

  loading: function (option) {
    let that = this
    https.getCoursePunches({
      date: option.date,
      usrId: app.globalData.miniId,
      class: option.classType,
      that: that,
      onLoad: 1,
    })

    that.getCoursePunchesReadyCallback = res => {
      backgroundAudioManager.src = that.data.audioSrc
      backgroundAudioManager.title = that.data.content

      backgroundAudioManager.onPlay((res) => {
        console.log("backgroundAudioManager play1")
        that.setData({
          srcPlayPause: app.image.pauseGreen,
        })
        console.log("backgroundAudioManager play2")
      })

      backgroundAudioManager.onPause(() => {
        console.log("backgroundAudioManager pause1")
        var right = backgroundAudioManager.duration.toFixed(0)
        that.setData({
          rightMinute: util.formatNumber02(parseInt(right / 60)),
          rightSecond: util.formatNumber02(right - parseInt(right / 60) * 60),
          srcPlayPause: app.image.playGreen,
        })
      })

      backgroundAudioManager.onWaiting((res) => {
        console.log("onWaiting")
      })

      backgroundAudioManager.onCanplay((res) => {
        if (that.data.state) {
          that.setData({
            state: 0
          })
          console.log("canPlay 0")
          backgroundAudioManager.pause()
        } else {
          console.log("canPlay 1")
        }
      })

      backgroundAudioManager.onTimeUpdate((res) => {
        console.log("backgroundAudioManager in", backgroundAudioManager.currentTime.toFixed(0))
        var left = backgroundAudioManager.currentTime.toFixed(0)
        that.setData({
          leftMinute: util.formatNumber02(parseInt(left / 60)),
          leftSecond: util.formatNumber02(left - parseInt(left / 60) * 60),
        })
        if (backgroundAudioManager.duration != null) {
          var right = backgroundAudioManager.duration.toFixed(0)
          var sliderValue = left * 100 / right
          that.setData({
            sliderValue: sliderValue,
            rightMinute: util.formatNumber02(parseInt(right / 60)),
            rightSecond: util.formatNumber02(right - parseInt(right / 60) * 60),
          })
        }
      })

      backgroundAudioManager.onEnded((res) => {
        console.log("end")
        backgroundAudioManager.src = that.data.audioSrc
        backgroundAudioManager.title = that.data.content
      })

      backgroundAudioManager.onError((res) => {
        console.log("onError: ", res)
      })

      that.setData({
        showPage: true,
      })

      setTimeout(function(){
        that._animation()
      }.bind(that), 1000)
    }
  },

  //讲解按钮
  tapPlayPause: function (option) {
    let that = this
    if (that.data.srcPlayPause == app.image.playGreen) {
      backgroundAudioManager.play()
    }
    else{
      backgroundAudioManager.pause()
    }
  },

  //改变滑块位置中
  sliderChanging: function (e) {
    console.log("Changing")

    console.log("pause")
    backgroundAudioManager.pause()

    var right = backgroundAudioManager.duration.toFixed(0)
    var curval = e.detail.value * right / 100
    console.log("seek ", "right: ", right, "value: ", e.detail.value, "left: ", curval)

    var left = curval.toFixed(0)
    this.setData({
      leftMinute: util.formatNumber02(parseInt(left / 60)),
      leftSecond: util.formatNumber02(left - parseInt(left / 60) * 60),
    })
  },

  //改变滑块位置后
  sliderChange: function (e) {
    console.log("Changed")

    var right = backgroundAudioManager.duration.toFixed(0)
    var curval = e.detail.value * right / 100
    var left = curval.toFixed(0)
    this.setData({
      leftMinute: util.formatNumber02(parseInt(left / 60)),
      leftSecond: util.formatNumber02(left - parseInt(left / 60) * 60),
    })

    console.log("seek ", "right: ", right, "value: ", e.detail.value, "left: ", curval)
    backgroundAudioManager.seek(curval)

    console.log("play")
    backgroundAudioManager.play()

    if (this.data.srcPlayPause == app.image.playGreen) {
      this.setData({
        srcPlayPause: app.image.pauseGreen,
      })
    }
  },

  practice: function () {
    backgroundAudioManager.pause()
    let that = this
    if (this.data.hasVideo != "yes") {
      wx.showToast({
        title: '没有练习视频',
      })
      return
    }
    var urlvalue = '../practice/practice?date=' + that.data.date + '&classType=' + that.data.classType + '&practiceType=1'
    console.log("urlvalue:", urlvalue)
    wx.navigateTo({
      url: urlvalue
    })
  },

  punchCard: function () {
    var urlvalue = '../punchCard/punchCard?date=' + this.data.date + '&classType=' + this.data.classType
    console.log("urlvalue:", urlvalue)
    wx.navigateTo({
      url: urlvalue
    })
  },

  tapPunchNew: function () {
    let that = this
    app.punchClockReturnCallback = res => {
      that.getCoursePunchesRefreshCallback = res => {
        wx.showToast({
          title: "奖励5朵小红花",
          image: '../image/button/flower4.png',
          duration: 1000,
        })
      }

      https.getCoursePunches({
        date: that.data.date,
        usrId: app.globalData.miniId,
        class: that.data.classType,
        that: that,
        onLoad: 2,
      })
    }

    backgroundAudioManager.pause()
    var content = this.data.content.replace("?","^")
    var urlvalue = '../punchClock/index'
      + '?courseid=' + this.data.courseId
      + '&date=' + this.data.date
      + '&content=' + content

    console.log("urlvalue:", urlvalue)
    wx.navigateTo({
      url: urlvalue
    })
  },

  tapCommentBooking: function (option) {
    var dataOption = option.currentTarget.dataset
    console.log("dataOption: ", dataOption)
    var urlvalue = '../commentBook/commentBook?punchId=' + dataOption.punchid
    wx.navigateTo({
      url: urlvalue
    })
  },

  tapPunchTitles: function (option) {
    console.log("tapPunchTitles:", option)
    var punches = option.currentTarget.dataset.data
    for (var i = 0; i < punches.length; i++) {
      punches[i]["index"] = util.formatNumber02(i + 1)
    }

    this.setData({
      punches: punches,
      punchTitle: option.currentTarget.dataset.title,
      punchSize: punches.length,
      select: option.currentTarget.id,
    })
  },

  tapBtnDelete: function (option) {
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除打卡吗？打卡相关的评论也会被删除哦！',
      success: function (res) {
        if (res.confirm) {
          console.log("1204: confirm", that.data.records[0].data)
          console.log("tapBtnDelete-formId: ", option.detail.formId)
          var punchId = -1
          for (var i = 0; i < that.data.records[0].data.length; i++) {
            if (that.data.records[0].data[i].usrId == app.globalData.miniId) {
              punchId = that.data.records[0].data[i].punchId
              break
            }
          }
          if (punchId == -1) {
            wx.showToast({
              title: '打卡错误',
            })
            console.log("error: tapBtnDelete")
            return
          }

          //获取课件内容
          wx.request({
            url: 'https://www.abceea.com/test',
            data: {
              type: 1204,
              punchId: punchId,
              courseId: that.data.courseId,
              usrId: app.globalData.miniId,
              formId: option.detail.formId,
              date: that.data.date,
              class: that.data.classType,
            },
            success: function (res) {
              console.log("1204: ", res)
              if (res.data.res == "success") {
                wx.showToast({
                  title: '删除成功！',
                })
                https.getCoursePunchesSuccess({
                  data: res.data,
                  that: that,
                  usrId: app.globalData.miniId,
                  class: that.data.classType,
                })
              } else {
                wx.showToast({
                  title: '删除失败！',
                })
              }
            },
            fail: function (res) {
              console.log(res)
              wx.showModal({
                title: '提示',
                content: "网络请求失败，请确保网络是否正常",
                showCancel: false,
                success: function (res) {
                }
              })
              wx.hideToast()
            }
          })
        } else if (res.cancel) {
          console.log("1204: cancel")
        }
      }
    })
  },

  tapRecord: function (option) {
    var dataOption = option.currentTarget.dataset
    console.log("tapRecord-option: ", option)

    if (dataOption.punchid == "") {
      console.log("error: tapRecord: ", dataOption.punchid)
      wx.showToast({
        title: 'punchId为空',
      })
      return
    }
    else {
      console.log("punchId: ", dataOption.punchid)
    }

    var urlvalue = '../recordShow/recordShow?punchId=' + dataOption.punchid
      + '&date=' + this.data.date + '&classType=' + this.data.classType + '&loadType=1'
    console.log("urlvalue:", urlvalue)

    wx.navigateTo({
      url: urlvalue
    })
  },

  _animation: function () {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    animation.translateY(-1000).opacity(1).step()
    this.setData({
      animation: animation.export()
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
    let that = this
    that.setData({
      showPage: false,
    })

    that.getCoursePunchesRefreshCallback = res => {
      wx.stopPullDownRefresh()
      that.setData({
        showPage: true,
      })
    }

    https.getCoursePunches({
      date: that.data.date,
      usrId: app.globalData.miniId,
      class: that.data.classType,
      that: that,
      onLoad: 2,
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log("punch-share:", res)
    if (res.from === 'button') {
      console.log("punch-share: button: ", res.target)
    }

    var url = "/pages/everyday/everyday?" + "date=" + this.data.date + "&classType=" + this.data.classType
    console.log("url:", url)
    return {
      title: '快来跟我一起学习吧！',
      path: url,
      success(res) {
        if (res.shareTickets) {
          wx.getShareInfo({
            shareTicket: res.shareTickets[0],
            success(res1) {
              wx.login({
                success: res2 => {
                  console.log("login-code:", res2.code)
                  wx.request({
                    url: 'https://www.abceea.com/test',
                    data: {
                      type: 9001,
                      code: res2.code,
                      errMsg: res1.errMsg,
                      encryptedData: res1.encryptedData,
                      iv: res1.iv,
                    },
                    success: function (res3) {
                      console.log("9001 ", res3)
                    },
                    fail: function (res3) {
                      console.log("9001 ", res3)
                    }
                  })
                }
              })
            },
            fail() { },
            complete() { }
          });
        }
      },
      fail(e) {
      },
      complete() { }
    }
  }
})
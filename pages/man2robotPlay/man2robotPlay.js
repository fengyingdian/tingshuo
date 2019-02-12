// pages/man2robotPlay/man2robotPlay.js
const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const https2 = require('../../utils/https2.js')

//////////////////////////////////////////////
//同声传译插件
const plugin = requirePlugin("WechatSI")
const manager = plugin.getRecordRecognitionManager()

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
        if (res.data.res == "success") {
          var roles = {}
          for (var i = 0; i < res.data.contents.length; i++){
            var content = res.data.contents[i]
            roles[content[1]] = content[1]
          }

          that.setData({
            contents: res.data.contents,
            roles: roles,
            title: res.data.title,
            name: res.data.name,
            showPage: true,
            showType: 0,
          })

          //音频播放
          that.innerAudioContext = wx.createInnerAudioContext()
          that.innerAudioContext.obeyMuteSwitch = false

          that.innerAudioContext.onStop(res => {
            that.playAnimationEnd()
          })

          that.innerAudioContext.onPlay((res) => {
            that.playAnimationStart(that.data.selected)
          })

          that.innerAudioContext.onEnded((res) => {
            console.log("selected:", that.data.selected, that.data.contents.length)
            if (that.data.showType == 3){
              if (that.data.sequence) {
                if (that.data.selected < that.data.contents.length - 1) {
                  that.setData({
                    selected: that.data.selected + 1
                  })
                  that.tapAudioSequencePlayFun()
                } else if (that.data.selected == that.data.contents.length - 1) {
                  that.tapAudioRecordStop()
                }
              }else{
                that.tapAudioRecordStop()
              }
            } else if (that.data.showType == 2){
              if (that.data.selected < that.data.contents.length - 1) {
                that.setData({
                  selected: that.data.selected + 1
                })
                that.tapAudioRecordPlay()
              } else if (that.data.selected == that.data.contents.length - 1) {
                that.setData({
                  showType: 3
                })
                that.tapAudioRecordStop()
              }
            }
          })
        } else {
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

  tapSelectRole: function (event) {
    console.log("tapSelectRole: ", event)
    let that = this
    that.setData({
      selectedRole: event.currentTarget.dataset.role,
      selected: 0,
      showType: 1,
    })

    setTimeout(function () {
      that.setData({
        showType: 2,
      })
      that.tapAudioRecordPlay()
    }, 3000)
  },

  tapAudioSequencePlay: function (event) {
    console.log("tapAudioSequencePlay: ", event)
    let that = this
    that.setData({
      sequence: true,
      selected: 0
    })
    that.tapAudioSequencePlayFun()
  },

  tapAudioSequencePlayFun: function (event) {
    let that = this
    var content = that.data.contents[that.data.selected]
    var src = null
    if (content[1] == that.data.selectedRole) {
      src = content[4]
    } else {
      src = "https://www.abceea.com/static/dialog/"
        + that.data.title + "/" + that.data.name + "/" + content[4]
    }
    that.innerAudioContext.src = src
    that.innerAudioContext.play()
  },

  tapAudioRecordPlay: function () {
    let that = this
    var content = that.data.contents[that.data.selected]
    if (content[1] == that.data.selectedRole){
      wx.showToast({
        title: "请按住说话",
        image: '/image/no_voice.png',
        duration: 1000,
      })
    }else{
      var src = "https://www.abceea.com/static/dialog/"
        + that.data.title + "/" + that.data.name + "/" + that.data.contents[that.data.selected][4]
      that.innerAudioContext.src = src
      that.innerAudioContext.play()
    }
  },

  tapAudioRecordStop: function (event) {
    let that = this
    that.innerAudioContext.stop()
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

  //开始录音
  tapBtnRecord: function (option) {
    let that = this
    clearInterval(that.data.idInterval)
    that.setData({
      recording: true,
      recordSecondCount: 0,
      recordSecondShow: util.formatNumber02(0),
      recordTimeShow: true
    })
    app.RRMErrorCallback = res => {
      console.log("tapBtnRecord.RRMErrorCallback")
      clearInterval(that.data.idInterval)
      if (res.retcode == -30003) {
        that.showRecordEmptyTip()
      } else if (res.retcode == -30002) {
        let detail = option.detail || {}
        let buttonItem = detail.buttonItem || {}
        manager.start({
          lang: buttonItem.lang,
        })
        manager.stop()
        that.setData({
          bottomButtonDisabled: false,
          recording: false,
          recordTimeShow: false,
        })
      }
    }
    that.recordSart(option)
  },

  recordSart: function (option) {
    let that = this
    console.log('recorder start')
    let detail = option.detail || {}
    let buttonItem = detail.buttonItem || {}
    manager.start({
      lang: buttonItem.lang,
    })
    var idInterval = setInterval(function () {
      console.log("record inerval: ", that.data.recordSecondCount)
      if (that.data.recordSecondCount >= 10) {
        console.log("record inerval-stop")
        that.tapBtnStop()
      }
      that.setData({
        recordSecondCount: that.data.recordSecondCount + 1,
        recordSecondShow: util.formatNumber02(that.data.recordSecondCount + 1),
      })
    }.bind(that), 1000)
    that.setData({
      idInterval: idInterval,
    })
  },

  //停止录音
  tapBtnStop: function (option) {
    console.log("tapBtnStop")
    let that = this
    if (that.data.recordSecondCount < 1) {
      clearInterval(that.data.idInterval)
      that.setData({
        recordSecondCount: 0,
        recordSecondShow: util.formatNumber02(0),
        recordTimeShow: true,
      })
      that.setData({
        recordResType: 0,
      })
    } else {
      that.setData({
        recordResType: 1,
      })
      wx.showLoading()
      clearInterval(that.data.idInterval)
      that.setData({
        recordTimeShow: false,
      })
    }
    app.RRMStopCallback = res => {
      console.log("manager.onStop1: ", res)
      var text = res.result
      if (text == '') {
        that.showRecordEmptyTip()
        if (that.data.recordResType != 0) {
          that.setData({
            recordResType: 0,
          })
        }
      } else {
        if (that.data.recordResType == 0) {
          wx.showToast({
            title: '时长小于1秒',
          })
        }
      }

      if (that.data.recordResType == 1) {
        that.data.contents[that.data.selected][4] = res.tempFilePath
        if (that.data.selected < that.data.contents.length - 1) {
          that.setData({
            selected: that.data.selected + 1
          })
          that.tapAudioRecordPlay()
        } else if (that.data.selected == that.data.contents.length - 1) {
          that.setData({
            showType: 3
          })
          that.tapAudioRecordStop()
        }
      }
      that.setData({
        bottomButtonDisabled: false,
        recording: false,
        recordTimeShow: false,
      })
      wx.hideLoading()
    }

    if (!this.data.recording) {
      console.warn("has finished!")
      return
    }

    manager.stop()
    this.setData({
      bottomButtonDisabled: true,
    })
  },

  //识别内容为空时的反馈
  showRecordEmptyTip: function () {
    this.setData({
      recording: false,
      bottomButtonDisabled: false,
      recordTimeShow: false,
    })
    wx.showToast({
      title: "请按住说话",
      image: '/image/no_voice.png',
      duration: 1000,
    })
  },

  tapAudioPlay: function (event) {
    console.log("tapAudioPlay: ", event)
    let that = this
    var selected = event.currentTarget.dataset.selected

    console.log("playing: ", that.data.playType, that.data.selected)
    if (that.data.playType == 'playing' && that.data.selected != -1 && that.data.selected == selected) {
      that.innerAudioContext.stop()
      that.playAnimationEnd()
      return
    }

    that.setData({
      sequence: false,
      selected: selected,
    })

    var content = that.data.contents[that.data.selected]
    var src = null
    if (content[1] == that.data.selectedRole) {
      src = content[4]
    } else {
      src = "https://www.abceea.com/static/dialog/"
        + that.data.title + "/" + that.data.name + "/" + content[4]
    }

    that.innerAudioContext.src = src
    that.innerAudioContext.play()
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
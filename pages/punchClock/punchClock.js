//pages/punchClock/punchClock.js

const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const check = require('../../utils/check.js')
const aiReport = require('../../utils/aiReport.js')
const app = getApp()

//////////////////////////////////////////////
//临时路径
var tempFilePath = ""
//临时录音文件播放
const tempRecordAudio = wx.createInnerAudioContext()
tempRecordAudio.obeyMuteSwitch = false

//////////////////////////////////////////////
//同声传译插件
const plugin = requirePlugin("WechatSI")
const manager = plugin.getRecordRecognitionManager()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    content: "",
    imageSrc: "",
    audioSrc: "",
    videoSrc: "",
    amIPASrc: "",
    brIPASrc: "",
    huaSrc: "",
    zhengSrc: "",
    classType: "",
    role: "",
    courseId: -1,
    punchId: -1,

    //记录底部状态
    bottomType: 1, //没有打过卡状态1，录音中状态2，录音完成状态3,完成打卡状态4 

    //讲解音频图标
    srcPlayPause: app.image.playGreen,
    //录音播放停止图标
    btnSrcPlayPause: app.image.playGreen,

    //录音图标
    btnSrcRecord: app.image.record,
    //停止录音图标
    btnSrcStop: app.image.stop,
    //发布图标
    btnSrcSend: app.image.send,
    //取消图标
    btnSrcCancel: app.image.cancel,
    //
    height: app.globalData.windowHeight - 50 - 120,
    //
    state: 1, //1-初始化
    //打卡记录
    records: null,
    //正在录音
    recording: false,
    //底部按钮disabled
    bottomButtonDisabled: false,
    //显示计时
    recordTimeShow: false,
    // 
    hasAiReport: false,
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

    that.setData({
      loadingTitle: "(｡ì _ í｡)努力加载ing",
      loadingCount: 0,
      recordSecondCount: 0,
      recordSecondShow: util.formatNumber02(0),
    })

    that.tempFilePath = ""

    wx.showShareMenu({
      withShareTicket: true
    })
  
    that.setData({
      height: app.globalData.windowHeight - 50 - 120,
      date: option.date,
      classType: option.classType,
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
      tempRecordAudio.onStop((res) => {
        that.setData({
          tempRecordSecond: -1,
          btnSrcPlayPause: app.image.playGreen,
        })
      })

      that.setData({
        showPage: true,
        width: app.globalData.windowWidth,
      })
      app.getRecordAuth()
    }
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  //开始录音
  tapBtnRecord: function (option) {
    let that = this
    tempRecordAudio.stop()
    clearInterval(that.data.idInterval)
    that.setData({
      recording: true,
      recordSecondCount: 0,
      recordSecondShow: util.formatNumber02(0),
      recordTimeShow: true,
      hasAiReport: false,
      bottomType: 1,
    })
    app.RRMErrorCallback = res => {
      console.log("tapBtnRecord.RRMErrorCallback")
      clearInterval(that.data.idInterval)
      if (res.retcode == -30003 || -30011){
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

  recordSart: function (option){
    let that = this
    console.log('recorder start')
    let detail = option.detail || {}
    let buttonItem = detail.buttonItem || {}
    manager.start({
      lang: buttonItem.lang,
    })
    var idInterval = setInterval(function () {
      console.log("record inerval: ", that.data.recordSecondCount)
      if (that.data.recordSecondCount >= 18) {
        console.log("record inerval-stop")
        that.tapBtnStop()
        wx.showModal({
          title: '提示',
          content: '录音时长已到',
          showCancel: false,
        })
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
        if (that.data.recordResType != 0){
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
      that.tempFilePath = res.tempFilePath
      tempRecordAudio.src = res.tempFilePath
      that.setData({
        currentText: text,
      })
      if (that.data.recordResType == 1) {
        that.setData({
          srcPlayPause: app.image.playGreen,
          btnSrcPlayPause: app.image.playGreen,
          bottomType: 2,
        })
      }
      that.setData({
        bottomButtonDisabled: false,
        recording: false,
        recordTimeShow: false,
      })
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

  tapAiReport: function(){
    let that = this
    that.setData({
      showAiReportLoading: true
    })

    app.getAiReportReadyCallback = res => {
      that.setData({
        hasAiReport: true,
        aiReport: res,
      })
      console.log("getAiReportReadyCallback: ", res)
    }

    var tempFileName = aiReport.getTempFileName(that.tempFilePath)
    if (that.data.hasAiReport == false) {
      console.log("way1")
      that.upLoadTempFile(tempFileName)
    }else{
      console.log("way2")
      wx.navigateTo({
        url: '../aiReport/aiReport' + "?date=" + that.data.date + "&path=" + app.globalData.miniId + "_" + tempFileName + "&hostId=" + app.globalData.miniId
      })
      that.setData({
        showAiReportLoading: false
      })
    }
  },

  //上传临时录音文件
  upLoadTempFile: function (tempFileName) {
    let that = this
    var urlParam = "?type=1201" + "&courseId=" + that.data.courseId
      + "&usrId=" + app.globalData.miniId
      + "&date=" + that.data.date
      + "&path=" + tempFileName

    wx.uploadFile({
      url: app.url + urlParam,
      filePath: that.tempFilePath,
      name: 'punch',
      header: {
        'content-type': 'multipart/text'
      },
      success: function (res) {
        console.log("1201: ", res)
        var data = JSON.parse(res.data)
        if (data.res == "success") {
          that.setData({
            showAiReportLoading: false
          })
          wx.navigateTo({
            url: '../aiReport/aiReport' + "?date=" + that.data.date + "&path=" + app.globalData.miniId + "_" + tempFileName + "&hostId=" + app.globalData.miniId                  }) 
        } else {
          wx.showToast({
            title: '未知错误',
          })
        }
        that.setData({
          showPage: true
        })
      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          title: '网络错误',
        })
      }
    })
  },

  //发布
  tapBtnSend: function (option) {
    //停止播放录音
    tempRecordAudio.stop()
    console.log("tempFilePath: ", this.tempFilePath)

    let that = this
    if (that.data.myPunch){
      wx.showModal({
        title: '发布提示',
        content: '确定要删除之前的打卡，发布新的打卡吗？',
        success: function (res) {
          if (res.confirm) {
            option.thumb = "&thumb=0"
            that.sendAudio(option)
          }
        }
      })
    }else{
      wx.showModal({
        title: '发布提示',
        content: '确定要发布打卡吗？',
        success: function (res) {
          if (res.confirm) {
            option.thumb = "&thumb=0"
            that.sendAudio(option)
          }
        }
      })
    }
  },

  //上传音频
  sendAudio: function (option) {
    let that = this
    that.setData({
      showPage:false
    })
    var time = util.formatTime(new Date())
    console.log("time: ", time)

    var currentText = util.varifyStr(that.data.currentText)
    var urlParam = "?type=1200" + "&courseId=" + that.data.courseId
      + "&usrId=" + app.globalData.miniId
      + "&formId=" + option.detail.formId
      + "&date=" + that.data.date 
      + "&practice=0"  
      + "&class=" + that.data.classType
      + option.thumb

    if (that.data.hasAiReport){
      urlParam = urlParam + "&score=" + that.data.aiReport.score
    }
      
    console.log("url1: ", app.url + urlParam)
    console.log("file1: ", that.tempFilePath)
    wx.uploadFile({
      url: app.url + urlParam,
      filePath: that.tempFilePath,
      name: 'punch',
      header: {
        'content-type': 'multipart/text'
      },
      success: function (res) {
        console.log("1200: ", res)
        var data = JSON.parse(res.data)
        console.log("1200: ", data)
        if (data.res == "success") {
          that.setData({
            showPage: true,
            bottomType: 1,
          })
          wx.showToast({
            title: "奖励5朵小红花",
            image: '../image/button/flower4.png',
            duration: 1000,
          })
          https.getCoursePunchesSuccess({
            data: data,
            that: that,
            usrId: app.globalData.miniId,
            class: that.data.classType,
          })
        } else {
          wx.showToast({
            title: '未知错误',
          })
          that.setData({
            showPage: true
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

  //取消
  tapBtnCancel: function (option) {
    //console.log("tapBtnCancel-formId: ", option.detail.formId)
    //https.saveFormId({
    //  usrId: app.globalData.miniId,
    //  formId: option.detail.formId
    //})
    
    //停止播放录音
    tempRecordAudio.stop()
    //
    this.setData({
      bottomType: 1,
    })
  },

  //删除打卡
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

  //播放/停止录音文件
  tapBtnPlay: function (option) {
    let that = this
    if (that.data.btnSrcPlayPause == app.image.playGreen) {
      //播放录音
      tempRecordAudio.play()
      tempRecordAudio.onPlay(() => {
        console.log('play', tempRecordAudio.src)
        tempRecordAudio.onTimeUpdate((res) => {
          console.log("tempRecordAudio in: ", tempRecordAudio.currentTime.toFixed(0))
          that.setData({
            tempRecordSecond: tempRecordAudio.currentTime.toFixed(0),
          })
        })
      })
      tempRecordAudio.onEnded((res) => {
        that.setData({
          tempRecordSecond: -1,
          btnSrcPlayPause: app.image.playGreen,
        })
      })
      tempRecordAudio.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })
      //
      that.setData({
        btnSrcPlayPause: app.image.stopGreen,
      })
    }
    else {
      //停止播放录音
      tempRecordAudio.stop()
    }
  },

  /**
   * 生命周期函数--监听页面加载
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
    console.log("onHide1")
    let that = this
    if (that.data.bottomType == 1){
      console.log("onHide2")
      clearInterval(that.data.idInterval)
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onUnload1")
    let that = this
    if (that.data.bottomType == 1) {
      console.log("onUnload2")
      that.tapBtnStop()
    }
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
    console.log("onReachBottom")
  },

  //选择显示图片
  tapPreviewImage: function (option) {
    console.log("tapPreviewImageon:", option)
    wx.previewImage({
      urls: [option.currentTarget.dataset.src]
    })
  },

  //选择显示打卡内容
  tapPunchTitles: function (option) {
    console.log("tapPunchTitles:", option)
    var punches = option.currentTarget.dataset.data
    for (var i = 0; i < punches.length; i++){
      punches[i]["index"] = util.formatNumber02(i + 1)
    }

    this.setData({
      punches: punches,
      punchTitle: option.currentTarget.dataset.title,
      punchSize: punches.length,
      select: option.currentTarget.id,
    })
  },

  //返回首页
  tapReturnHome: function () {
    wx.showModal({
      title: '提示',
      content: '确定要回到首页吗？',
      success: function (res) {
        if (res.confirm) {
          console.log("onReturnHome")
          wx.switchTab({
            url: '../index/index'
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  tapCommentBooking: function (option) {
    tempRecordAudio.stop()
    var dataOption = option.currentTarget.dataset
    console.log("dataOption: ", dataOption)
    var urlvalue = '../commentBook/commentBook?punchId=' + dataOption.punchid
    wx.navigateTo({
      url: urlvalue
    })
  },

  videoErrorCallback: function(res) {
    console.log("videoErrorCallback: ", res)
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log("punch-share:", res)
    if (res.from === 'button') {
      console.log("punch-share: button: ", res.target)
    }

    var url = "/pages/punchClock/punchClock?"+"date=" + this.data.date+"&classType="+ this.data.classType
    console.log("url:", url)
    return {
      title: '留下点儿回忆行不行？',
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
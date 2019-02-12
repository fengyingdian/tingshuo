// pages/punchClock/punchClock.js

const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const check = require('../../utils/check.js')
const trans = require('../../utils/trans.js')
const app = getApp()

//////////////////////////////////////////////
//音频上下文
const innerAudioContext = wx.createInnerAudioContext()
innerAudioContext.obeyMuteSwitch = false

//////////////////////////////////////////////
//评论音频上下文
const commentAudio = wx.createInnerAudioContext()
commentAudio.obeyMuteSwitch = false
//记录上一个评论音频位置
var lastCommentAudio = -9

//////////////////////////////////////////////
//临时路径
var tempFilePath = ""
//临时录音文件上下文
const tempRecordAudio = wx.createInnerAudioContext()
tempRecordAudio.obeyMuteSwitch = false

//////////////////////////////////////////////
//记录文本框输入
var inputContent = ""

//////////////////////////////////////////////
//同声传译插件
const plugin = requirePlugin("WechatSI")
const manager = plugin.getRecordRecognitionManager()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    //讲解音频图标
    srcPlay: app.image.play,
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

    //发送
    srcImg3: app.image.send,
    //记录底部状态
    bottomType: 0, //语音点评1，录音中状态2，录音完成状态3，文字点评4
    //
    classType: "",
    //
    loadType: "",
    //
    height: app.globalData.windowHeight - 50 - 35,
    //
    actionSheetHidden: true,
    //
    profile: {
      name: "nickname",
      content: "My mama always said, life is like a box of chocolates. You never know what you're gonna get.",
    },
    //
    comments: null,
    //正在录音
    recording: false,
    //底部按钮disabled
    bottomButtonDisabled: false,
    //显示计时
    recordTimeShow: false, 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    console.log("punchClock: ", option)
    wx.showShareMenu({
      withShareTicket: true
    })

    //重置数据
    let that = this
    that.lastCommentAudio = -9
    that.tempFilePath = ""
    that.inputContent = ""
    
    console.log("height: ", app.globalData.windowHeight)
    that.setData({
      height: app.globalData.windowHeight,
      classType: option.classType,
      loadType: option.loadType,
    })

    console.log("userInfo:", app.globalData.userInfo)
    console.log("miniId:", app.globalData.miniId)
    console.log("option:", option)

    that.setData({
      recordSecondCount: 0,
      recordSecondShow: util.formatNumber02(0),
    })

    that.setData({
      punchMinute: -1,
      punchSecond: -1,
      showPage: false,
      loadingTitle: "加载项目",
      loadingCount: 0,
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
        }else{
          that.loading(option)
        }
      }
    }else{
      that.loading(option)
    }
  },

  loading: function(option) {
    let that = this
    https.getPunchComments({
      punchId: option.punchId,
      date: option.date,
      classType: option.classType,
      loadType: option.loadType,
      usrId: app.globalData.miniId,
      that: that,
      onLoad: 1,
    })

    that.gePunchCommentsReadyCallback = res => {
      that.setData({
        profile: res.data.usr,
        recordTimeShow: false,
      })
      innerAudioContext.src = that.data.profile.audio
      console.log("音频：", that.data.profile.audio)

      innerAudioContext.stop()
      innerAudioContext.onStop((res) => {
        that.setData({
          srcPlay: app.image.play,
          punchMinute: -1,
          punchSecond: -1,
        })
      })

      innerAudioContext.onError((res) => {
        console.log("innerAudioContext onError: ", res)
      })

      innerAudioContext.onTimeUpdate((res) => {
        var seconds = innerAudioContext.currentTime.toFixed(0)
        that.setData({
          punchMinute: util.formatNumber02(parseInt(seconds / 60)),
          punchSecond: util.formatNumber02(seconds - parseInt(seconds / 60) * 60),
        })
      })

      innerAudioContext.onPlay(() => {
        that.setData({
          srcPlay: app.image.stop
        })
      })

      innerAudioContext.onEnded((res) => {
        console.log("end")
        that.setData({
          srcPlay: app.image.play,
          punchMinute: -1,
          punchSecond: -1,
        })
      })

      commentAudio.onPlay((res) => {
      })

      commentAudio.stop()
      commentAudio.onStop((res) => {
        console.log("commentAudio stop1: ", that.lastCommentAudio)
        if (that.lastCommentAudio != -9) {
          that.data.comments[that.lastCommentAudio].imagePlay = app.image.playGreen
          that.data.comments[that.lastCommentAudio].second = -1
          that.setData({
            comments: that.data.comments,
          })
        }
      })

      commentAudio.onTimeUpdate((res) => {
        //console.log("onTimeUpdate:", that.lastCommentAudio)
        if (commentAudio.currentTime) {
          console.log("onTimeUpdate:", commentAudio.currentTime)
          that.data.comments[that.lastCommentAudio].second = commentAudio.currentTime.toFixed(0)
          that.setData({
            comments: that.data.comments
          })
        }
        //console.log(commentAudio.currentTime, commentAudio.duration)
        //if (commentAudio.currentTime >= commentAudio.duration-1){
        //  console.log("last one: ", commentAudio.currentTime, commentAudio.duration)
        //  commentAudio.stop()
        //}
      })

      commentAudio.onEnded((res) => {
        console.log("commentAudio.onEnded1")
        var data = {}
        if (that.lastCommentAudio != -9) {
          console.log("commentAudio.onEnded2:", that.lastCommentAudio)
          that.data.comments[that.lastCommentAudio].imagePlay = app.image.playGreen
          that.data.comments[that.lastCommentAudio].second = -1
          that.setData({
            comments: that.data.comments,
          })
          that.lastCommentAudio = -9
        }
      })

      tempRecordAudio.stop()
      tempRecordAudio.onStop(() => {
        console.log('tempRecordAudio stop')
        that.setData({
          tempRecordSecond: -1,
          btnSrcPlayPause: app.image.playGreen,
        })
      })

      var date = that.data.profile.date
      var dateName = date.substr(0, 4) + "-" + date.substr(4, 2) + "-" + date.substr(6, 2) 

      that.setData({
        dateName: dateName,
        showPage: true,
      })

      wx.hideLoading()
      app.getRecordAuth()
    }
  },

  //播放用户配音
  tapPlay: function (option) {
    console.log("tapPlay:", option)
    let that = this
    commentAudio.stop()
    tempRecordAudio.stop()

    if (that.data.srcPlay == app.image.stop) {
      console.log("customer stop", that.data.srcPlay)
      innerAudioContext.stop()
    }
    else {
      console.log("customer play", that.data.profile.audio)
      innerAudioContext.src = that.data.profile.audio
      innerAudioContext.play()
      setTimeout(function() {
        innerAudioContext.play()
        innerAudioContext.seek(0)
      }, 100)
    }
  },

  //文字点评
  tapBtnText: function (option) {
    let that = this
    console.log("tapBtnText-formId", option.detail.formId)
    https.saveFormId({
      usrId: app.globalData.miniId,
      formId: option.detail.formId
    })

    that.setData({
      toUsrName: option.currentTarget.dataset.tousrname,
      toUsrId: option.currentTarget.dataset.tousrid,
    })

    that.setData({
      bottomType: 3
    })
  },

  //取消文字点评
  tapBtnTextCancel: function (option) {
    let that = this
    that.setData({
      bottomType: 0
    })
  },

  //显示录音按钮
  tapBtnRecordShow: function (option) {
    innerAudioContext.stop()
    commentAudio.stop()
    tempRecordAudio.stop()
    let that = this
    that.setData({
      bottomType: 1,
      toUsrName: option.currentTarget.dataset.tousrname,
      toUsrId: option.currentTarget.dataset.tousrid,
    })
  },

  //隐藏录音按钮
  tapBtnRecordHide: function (option) {
    let that = this
    that.setData({
      bottomType: 0,
    })
  },

  //语音评论
  tapBtnRecord: function (option) {
    innerAudioContext.stop()
    commentAudio.stop()
    tempRecordAudio.stop()
    
    let that = this
    console.log("tapBtnRecord", option)
    https.saveFormId({
      usrId: app.globalData.miniId,
      formId: option.detail.formId,
    })

    clearInterval(that.data.idInterval)
    that.setData({
      recording: true,
      recordSecondCount: 0,
      recordSecondShow: util.formatNumber02(0),
      recordTimeShow: true,
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
    console.log('recorder start')
    let that = this
    let detail = option.detail || {}
    let buttonItem = detail.buttonItem || {}
    console.log("tapBtnRecord-buttonItem", buttonItem)
    manager.start({
      lang: buttonItem.lang,
    })

    var idInterval = setInterval(function () {
      console.log("record inerval: ", that.data.recordSecondCount)
      if (that.data.recordSecondCount >= 58) {
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
    if (that.data.recordSecondCount < 3) {
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
        if (that.data.recordResType != 0) {
          that.setData({
            recordResType: 0,
          })
        }
      } else {
        if (that.data.recordResType == 0) {
          wx.showToast({
            title: '时长小于3秒',
          })
        }
      }
      that.tempFilePath = res.tempFilePath
      tempRecordAudio.src = res.tempFilePath
      that.setData({
        currentText: text,
      })
      if (that.data.recordResType == 1) {
        wx.hideLoading()
        that.setData({
          srcPlayPause: app.image.play,
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

  //取消录音
  tapBtnRecordCancel: function (option) {
    let that = this
    console.log("tapBtnRecordCancel-formId", option.detail.formId)
    https.saveFormId({
      usrId: app.globalData.miniId,
      formId: option.detail.formId
    })

    that.setData({
      btnSrcPlayPause: app.image.playGreen,
      bottomType: 0,
    })
  },

  //播放/停止录音文件
  tapBtnPlay: function (option) {
    let that = this

    innerAudioContext.stop()
    commentAudio.stop()

    if (that.data.btnSrcPlayPause == app.image.playGreen) {
      tempRecordAudio.play()
      tempRecordAudio.onPlay(() => {
        console.log('play', tempRecordAudio.src)
        tempRecordAudio.onTimeUpdate((res) => {
          console.log("tempRecordAudio in")
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
      tempRecordAudio.stop()
      that.setData({
        tempRecordSecond: -1,
        btnSrcPlayPause: app.image.playGreen,
      })
    }
  },

  //发布
  tapBtnSend: function (option) {
    console.log("tapBtnSend-formId", option.detail.formId)
    let that = this
    that.setData({
      showPage: false,
    })

    tempRecordAudio.stop()

    var pageData = that.data.profile
    console.log("pageData: ", pageData)

    var currentText = util.varifyStr(that.data.currentText)
    var urlParam = "?type=1300" + "&punchId=" + pageData.punchId + "&toUsrId="
      + that.data.toUsrId + "&usrId=" + app.globalData.miniId
      + "&date=" + pageData.date + "&formId=" + option.detail.formId
      + '&classType=' + that.data.classType + '&loadType=' + 2
      + "&content=" + currentText

    console.log("url: ", app.url + urlParam)
    console.log("tempFilePath: ", that.tempFilePath)

    wx.uploadFile({
      url: app.url + urlParam,
      filePath: that.tempFilePath,
      name: 'comment',
      header: {
        'content-type': 'multipart/form-data'
      },
      success: function (res) {
        console.log("1300: ", res)
        var resData = JSON.parse(res.data)
        if (resData.res == "success") {
          that.getPunchCommentsVoiceCallback = res => {
            wx.showToast({
              title: "奖励3朵小红花",
              image: '../image/button/flower4.png',
              duration: 1000,
            })
          }
          https.getPunchCommentsSuccess({
            data: resData,
            that: that,
            usrId: app.globalData.miniId,
            punchId: that.data.profile.punchId,
            punchHostId: that.data.profile.usrId,
            callback: 1,
          })
        } else if (resData.res == "deleted") {
          wx.showModal({
            title: '提示',
            content: '该打卡已经被删除，请返回刷新',
            success: function (res) {
              console.log("1", that.data.loadType, that.data.classType)
              if (that.data.loadType == 1) {
                wx.navigateBack({
                  delta: 1
                })
              } else if (that.data.loadType == 2) {
                wx.reLaunch({
                  url: '../punchClock/punchClock?date=' + that.data.profile.date 
                  + '&classType=' + that.data.classType + '&loadType=' + that.data.loadType,
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '发布失败',
          })
          that.setData({
            showPage: true,
          })
        }
      },
      fail: function (res) {
        console.log("1300: fail", res)
        wx.showModal({
          title: '提示',
          content: "发布失败",
          showCancel: false,
          success: function (res) {
          }
        })
        that.setData({
          showPage: true,
        })
      }
    })

    //底部必须变成初始状态
    that.setData({
      bottomType: 0,
    })
  },

  //文字框输入
  commentTextInput: function (event) {
    let that = this
    this.inputContent = event.detail.value
    console.log("Input: ", this.inputContent)
  },

  //文字框发送按钮
  tapBtnTextSend: function (event) {
    console.log("tapBtnTextSend-formId: ", event.detail.formId)
    console.log("text send: ", this.inputContent)
    console.log("profile: ", this.data.profile)

    let that = this
    if (that.inputContent == null || that.inputContent == "") {
      wx.showToast({
        title: '内容不能为空',
      })
      return
    }

    that.inputContent = util.varifyStr(that.inputContent)
    console.log("content:", that.inputContent)
    if (that.inputContent == null || that.inputContent == "") {
      wx.showToast({
        title: '内容不能为空',
      })
      return
    }

    that.setData({
      bottomType: 4,
    })

    //
    var pageData = this.data.profile
    console.log("pageData:", pageData)
    
    that.setData({
      showPage: false,
    })

    //评论文字
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1300,
        date: pageData.date,
        punchId: pageData.punchId,
        usrId: app.globalData.miniId,
        content: that.inputContent,                      
        formId: event.detail.formId,                     
        toUsrId: that.data.toUsrId,        
        classType: that.data.classType,
        loadType: 2,
      },
      success: function (res) {
        console.log("1300: ", res)
        if (res.data.res == "success"){
          that.getPunchCommentsTextCallback = res => {
            console.log("test2")
            wx.showToast({
              title: "奖励2朵小红花",
              image: '../image/button/flower4.png',
              duration: 1000,
            })
          }
          https.getPunchCommentsSuccess({
            data: res.data,
            that: that,
            usrId: app.globalData.miniId,
            punchId: that.data.profile.punchId,
            punchHostId: that.data.profile.usrId,
            callback: 2,
          })
        } else if (res.data.res == "deleted") {
          wx.showModal({
            title: '提示',
            content: '该打卡已经被删除，请返回刷新',
            success: function (res) {
              console.log("1", that.data.loadType, that.data.classType)
              if (that.data.loadType == 1) {
                wx.navigateBack({
                  delta: 1
                })
              } else if (that.data.loadType == 2) {
                wx.reLaunch({
                  url: '../punchClock/punchClock?date=' + that.data.profile.date
                  + '&classType=' + that.data.classType + '&loadType=' + that.data.loadType,
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '发布失败',
          })
          that.setData({
            showPage: true,
          })
        }
      },
      fail: function (res) {
        console.log("1300: fail", res)
        wx.showModal({
          title: '提示',
          content: "发布失败",
          showCancel: false,
          success: function (res) {
          }
        })
        that.setData({
          showPage: true,
        })
      }
    })
  },

  //删除评论
  tapCommentDelete: function (option) {
    console.log("tapCommentDelete-formId: ", option.detail.formId)
    let that = this
    that.setData({
      showPage: false,
    })

    var dataOption = option.currentTarget.dataset
    console.log("dataOption: ", dataOption)
    console.log("lastCommentAudio: ", that.lastCommentAudio)
    //停止播放录音
    tempRecordAudio.stop()
    //停止评论录音
    commentAudio.stop()
    //重置数据
    if (that.lastCommentAudio != -9){
      that.data.comments[that.lastCommentAudio].imagePlay = app.image.playGreen
      that.data.comments[that.lastCommentAudio].second = -1
      that.setData({
        comments: that.data.comments,
      })
      that.lastCommentAudio = -9
    }
    //删除评论
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1305,
        punchId: that.data.profile.punchId,
        commentId: dataOption.commentid,
        date: that.data.profile.date,
        usrId: app.globalData.miniId,
        formId: option.detail.formId,
      },
      success: function (res) {
        console.log("1305:", res)
        if (res.data.res == "success"){
          https.getPunchCommentsSuccess({
            data: res.data,
            that: that,
            usrId: app.globalData.miniId,
            punchId: that.data.profile.punchId,
            punchHostId: that.data.profile.usrId,
            callback: 3,
          })
        } else if (res.data.res == "deleted") {
          wx.showModal({
            title: '提示',
            content: '该打卡已经被删除，请返回刷新',
            success: function (res) {
              console.log("1", that.data.loadType, that.data.classType)
              if (that.data.loadType == 1) {
                wx.navigateBack({
                  delta: 1
                })
              } else if (that.data.loadType == 2) {
                wx.reLaunch({
                  url: '../punchClock/punchClock?date=' + that.data.profile.date
                  + '&classType=' + that.data.classType + '&loadType=' + that.data.loadType,
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '删除失败',
          })
          that.setData({
            showPage: true,
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '删除失败',
        })
        that.setData({
          showPage: true,
        })
      }
    })
  },

  //取消
  tapBtnCancel: function (option) {
    let that = this
    console.log("tapBtnCancel-formId: ", option.detail.formId)
    https.saveFormId({
      usrId: app.globalData.miniId,
      formId: option.detail.formId
    })

    //停止播放录音
    tempRecordAudio.stop()
    //
    that.setData({
      bottomType: 0,
    })
  },

  //点击播放点评录音
  tapCommentAudio: function (option) {
    let that = this

    tempRecordAudio.stop()
    innerAudioContext.stop()

    that.setData({
      tempRecordSecond: -1,
      btnSrcPlayPause: app.image.playGreen,
    })

    //得到当前id
    var id = option.currentTarget.id
    console.log("id: ", id)
    //重置上一个音频
    if (that.lastCommentAudio != -9 && id != that.lastCommentAudio){
      console.log("commentAudio stop2: ", that.lastCommentAudio)
      if (that.lastCommentAudio != -9) {
        that.data.comments[that.lastCommentAudio].imagePlay = app.image.playGreen
        that.data.comments[that.lastCommentAudio].second = -1
        that.setData({
          comments: that.data.comments,
        })
      }
    }
    //控制当前音频
    if (id == that.lastCommentAudio && that.data.comments[that.lastCommentAudio].imagePlay == app.image.stopGreen){
      commentAudio.stop()
      console.log("commentAudio stop3: ", that.lastCommentAudio)
      if (that.lastCommentAudio != -9) {
        that.data.comments[that.lastCommentAudio].imagePlay = app.image.playGreen
        that.data.comments[that.lastCommentAudio].second = -1
        that.setData({
          comments: that.data.comments,
        })
      }
    } else if (id == that.lastCommentAudio && that.data.comments[that.lastCommentAudio].imagePlay == app.image.playGreen) {
      that.data.comments[id].imagePlay = app.image.stopGreen
      that.data.comments[id].second = -1
      that.setData({
        comments: that.data.comments
      })
      commentAudio.autoplay = true
      commentAudio.src = that.data.comments[that.lastCommentAudio].content
      console.log("play1:", that.lastCommentAudio, commentAudio.src)
      commentAudio.play()
    } else {
      commentAudio.stop()
      that.data.comments[id].imagePlay = app.image.stopGreen
      that.data.comments[id].second = -1
      that.setData({
        comments: that.data.comments
      })
      setTimeout(function () {
        that.lastCommentAudio = id
        commentAudio.autoplay = true
        commentAudio.src = that.data.comments[that.lastCommentAudio].content
        commentAudio.play()
        console.log("play2:", that.lastCommentAudio, commentAudio.src)
      }, 100)
    }
  },

  tapCommentUser: function (option) {
    console.log(option)
    let that = this
    if (option.currentTarget.dataset.usrid == that.data.profile.usrId){
      wx.navigateTo({
        url: '../usrInfo/usrInfo?hostId=' + option.currentTarget.dataset.usrid,
      })
      return
    }
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1202,
        usrId: option.currentTarget.dataset.usrid,
        courseId: that.data.profile.courseId,
      },
      success: function (res) {
        console.log("1202: ", res)
        if (res.data.res == "success"){
          var punchId = res.data.punchData[5]
          var urlvalue = '../recordShow/recordShow?punchId=' + punchId
            + '&date=' + that.data.profile.date
            + '&classType=' + that.data.classType
            + '&loadType=' + that.data.loadType
          wx.navigateTo({
            url: urlvalue
          })
        } else if (res.data.res == "wrong usrId"){
          wx.showToast({
            title: 'usrId错误',
          })
        }else{
          wx.showToast({
            icon: "none",
            title: '未打卡',
          })
          wx.navigateTo({
            url: '../usrInfo/usrInfo?hostId=' + option.currentTarget.dataset.usrid,
          })
        }
      },
      fail: function (res) {
        console.log("1202: ", res)
        wx.showToast({
          title: '网络错误',
        })
      }
    }) 
  },

  tapToText: function (option) {
    console.log("tapToText: ", option)
    var index = option.currentTarget.id
    let that = this
    var showTextContent = that.data.comments[index].showTextContent
    if (showTextContent == false){
      that.data.comments[index].showTextContent = true
      that.data.comments[index].showTextTitle = "收起"
    }else{
      that.data.comments[index].showTextContent = false
      that.data.comments[index].showTextTitle = "转文字"
    }
    that.setData({
      comments: that.data.comments,
    })
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    let that = this 
    console.log("onHide1")
    innerAudioContext.stop()
    commentAudio.stop()
    tempRecordAudio.stop()
    if (that.data.bottomType == 1) {
      console.log("onHide2")
      clearInterval(that.data.idInterval)
      that.setData({
        bottomType: 0
      })
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that = this 
    console.log("onUnload1")
    innerAudioContext.stop()
    commentAudio.stop()
    tempRecordAudio.stop()
    if (that.data.bottomType == 1){
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

    https.getPunchComments({
      punchId: that.data.profile.punchId,
      date: that.data.profile.date,
      usrId: app.globalData.miniId,
      classType: that.data.classType,
      loadType: that.data.loadType,
      that: that,
      onLoad: 2,
    })

    that.getPunchCommentsRefreshCallback = res => {
      wx.stopPullDownRefresh()
      that.setData({
        showPage: true,
      })
    }
  },

  tapOneUsr: function (event) {
    console.log("tapOneUsr: ", event)
    wx.navigateTo({
      url: '../usrInfo/usrInfo?hostId=' + event.currentTarget.dataset.usrid,
    })
  },

  tapCommentExpand: function (event) {
    let that = this
    var id = event.currentTarget.id
    if (that.data.comments[id].expand){
      that.data.comments[id].expand = false
      that.data.comments[id].expandImage = "../image/button/expand.png"
    }else{
      that.data.comments[id].expand = true
      that.data.comments[id].expandImage = "../image/button/retreat.png"
    }
    that.setData({
      comments: that.data.comments,
    }) 
  },

  tapFlower: function (event) {
    console.log("tapFlower: ", event.currentTarget.dataset)
    let that = this 
    var usrId = event.currentTarget.dataset.usrid
    var name = event.currentTarget.dataset.name
    var image = event.currentTarget.dataset.image
    that.setData({
      rewardId: usrId,
      rewardName: name,
      rewardImage: image, 
      rewardCount: 5,
      showReward: true,
    })
  },

  slider2change: function (e) {
    console.log('value: ', e)
    let that = this
    that.setData({
      rewardCount: e.detail.value.toFixed(0),
    })
  },

  tapPick: function () {
    let that = this
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 7001,
        usrId: app.globalData.miniId,
        toUsrId: that.data.rewardId,
        count: that.data.rewardCount,
      },
      success: function (res) {
        console.log("7001: ", res)
        if (res.data.res == "NE"){
          wx.showModal({
            title: '小红花不足',
            content: '剩余小红花：' + res.data.sum.toString() + '朵',
            showCancel: false,
          })
        } else if (res.data.res == "success"){
          wx.showModal({
            title: '打赏成功',
            content: '剩余小红花：' + res.data.sum.toString() + '朵',
            showCancel: false,
          })
          that.setData({
            showReward: false,
          })
        }else{
          wx.showToast({
            title: '未知错误',
          })
        }
      },
      fail: function (res){
        wx.showToast({
          title: '网络错误',
        })
      }
    })
  },

  tapCancelPick: function () {
    let that = this
    that.setData({
      showReward: false,
    })
  },

  tapThumbUpPunch: function (event) {
    console.log("tapThumbUpPunch: ", event)
    let that = this
    var status = 0
    if (that.data.profile.hasThumb){
      that.data.profile.hasThumb = false
      that.data.profile.thumb--
    }else{
      that.data.profile.hasThumb = true
      that.data.profile.thumb++
      status = 1
    }
    that.setData({
      profile: that.data.profile 
    })
    console.log(status)
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1206,
        usrId: app.globalData.miniId,
        punchId: event.currentTarget.dataset.punchid,
        status: status,
      },
      success: function (res) {
        console.log("1206: ", res)
      }
    })
  },

  tapThumbUpComment: function (event) {
    console.log("tapThumbUpComment: ", event)
    let that = this
    var status = 0
    if (that.data.comments[event.currentTarget.id].hasThumb) {
      that.data.comments[event.currentTarget.id].hasThumb = false
      that.data.comments[event.currentTarget.id].thumb--
    } else {
      that.data.comments[event.currentTarget.id].hasThumb = true
      that.data.comments[event.currentTarget.id].thumb++
      status = 1
    }
    that.setData({
      comments: that.data.comments,
    })
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1307,
        usrId: app.globalData.miniId,
        commentId: event.currentTarget.dataset.commentid,
        status: status,
      },
      success: function (res) {
        console.log("1307: ", res)
      }
    })
  },

  tapAudioTextHide: function () {
    let that = this
    that.setData({
      showAudioText: false
    })
  },

  tapAudioTextShow: function () {
    let that = this
    that.setData({
      showAudioText: true
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  //返回首页
  tapReturnHome: function () {
    let that = this 
    wx.showModal({
      title: '提示',
      content: '确定要回到首页吗？' ,
      success: function(res) {
        if (res.confirm){
          console.log("onReturnHome")
          wx.switchTab({
            url: '../index/index'
          })
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this 

    console.log("onShareAppMessage:", res)
    if (res.from === 'button') {
      console.log("onShareAppMessage: button: ",res.target)
    }

    var data = this.data.profile

    var url = "pages/recordShow/recordShow?" + "date=" + data.date
      + "&punchId=" + data.punchId + "&classType=" + this.data.classType + '&loadType=2'
    console.log("url:", url)

    var imageUrl = "https://www.abceea.com/static/others/recordShow.png"

    return {
      title: '大神求点评！',
      path: url,
      imageUrl: imageUrl,
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
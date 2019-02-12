//app.js
const util = require('./utils/util.js')
const https = require('./utils/https.js')

//"#5D5855",
//"#333238",

const updateManager = wx.getUpdateManager()

updateManager.onCheckForUpdate(function (res) {
  console.log("hasUpdate:", res.hasUpdate)
})

updateManager.onUpdateReady(function () {
  wx.showModal({
    title: '更新提示',
    content: '发现新版本一只~要重启听说咯~',
    showCancel: false,
    success: function (res) {
      updateManager.applyUpdate()
      wx.showToast({
        title: '新版本已经应用',
      })
    }
  })
})

updateManager.onUpdateFailed(function () {
  wx.showToast({
    title: '新版本下载失败',
  })
})

App({
  onLaunch: function (ops) {
    console.log("app.onLaunch", ops)
    if (ops.scene == 1044) {
      console.log("ops.scene-1044: ", ops)
      wx.getShareInfo({
        shareTicket: ops.shareTicket,
        success: function (res) {
          //console.log("wx.getShareInfo: success")
          console.log(res.encryptedData)
        },
        fail: function (res) {
          //console.log("wx.getShareInfo: fail")
        },
        complete: function (res) {
          //console.log("wx.getShareInfo: complete")
        },
      })
    }

    //删除缓存数据
    try {
      var res = wx.getStorageInfoSync()
      console.log(res.keys)
      for (var i = 0; i < res.keys.length; i++){
        var str = res.keys[i]
        if (str.indexOf("EverydayEnglishDateVideo") >= 0){
          wx.removeStorageSync(str)
        } 
        if (str.indexOf("EverydayEnglishDatePunch") >= 0) {
          wx.removeStorageSync(str)
        } 
      }
    } catch (e) {
      
    }

    //得到屏幕高度
    let that = this
    if (this.globalData.windowHeight <= 0){
      try {
        wx.getSystemInfo({
          success: function (res) {
            console.log(res)
            that.globalData.windowHeight = res.windowHeight
            that.globalData.windowWidth = res.windowWidth
            if (res.system.indexOf("iOS") == 0){
              that.globalData.system = "iOS"
            }
            //console.log("system: ", that.globalData.system)
          }
        })
      } catch (e) { }
    }

    //如果miniId为空需要重新获取用户数据
    if (this.globalData.miniId < 0){
      https.login(this)
    }
  },

  onShow: function () {
    try {
      var timeStamp1 = wx.getStorageSync('sessionHideTimeStamp')
      var timeStamp2 = new Date().getTime()
      console.log(timeStamp2, timeStamp1)
      if (timeStamp2 - timeStamp1 > 1000*60*5) {
        wx.reLaunch({
          url: './index',
        })
      }
    } catch (e) {
    }

    var timeStamp = new Date().getTime()
    try {
      wx.setStorageSync('sessionHideTimeStamp', timeStamp)
    } catch (e) {
    }

    console.log("app.onShow")
    wx.checkSession({
      success: function(){
      },
      fail: function(){
        wx.showModal({
          title: '提示',
          content: '会话过期将重启程序，请谅解',
          showCancel: false,
          success: function () {
            console.log("checkSession.fail")
            wx.reLaunch({
              url: './index',
            })
          }
        })
      }
    })
  },

  onHide: function () {
    var timeStamp = new Date().getTime()
    try {
      wx.setStorageSync('sessionHideTimeStamp', timeStamp)
    } catch (e) {
    }
  },

  // 权限询问
  getRecordAuth: function () {
    wx.getSetting({
      success(res) {
        console.log("succ")
        console.log(res)
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              console.log("succ auth")
            }, fail() {
              console.log("fail auth")
            }
          })
        } else {
          console.log("record has been authed")
        }
      }, fail(res) {
        console.log("fail")
        console.log(res)
      }
    })
  },

  getScoreRange: function (score) {
    var num = parseInt(score)
    if (num < 6){
      return 0
    } else if (num < 7) {
      return 6
    } else if (num < 8) {
      return 7
    } else if (num < 9) {
      return 8
    } else{
      return 9
    }  
  },

  getScoreColor: function (score) {
    var num = parseFloat(score)
    if (num < 6) {
      return 'rgb(237,28,36)'
    } else if (num < 7.8) {
      return 'rgb(255,127,39)'
    } else if (num < 9) {
      return 'rgb(255,201,14)'
    } else {
      return 'rgb(34,177,76)'
    }
  },

  getScoreColorOpc: function (score) {
    var num = parseFloat(score)
    if (num < 6) {
      return 'rgba(237,28,36,0.7)'
    } else if (num < 7.8) {
      return 'rgba(255,127,39,0.7)'
    } else if (num < 9) {
      return 'rgba(255,201,14,0.7)'
    } else {
      return 'rgba(34,177,76,0.7)'
    }
  },

  //
  globalData: {
    //用户信息
    userInfo: null,
    //用户id
    miniId: -1,
    //视窗高度
    windowHeight: -1, 
    //视窗宽度
    windowWidth: -1, 
    //操作系统
    system: "Android",
  },

  //
  image: {                            
    play:   "../image/button/play.png",
    pause:  "../image/button/pause.png",
    record: "../image/button/record.png",
    text:   "../image/button/text.png",
    stop:   "../image/button/stop.png",
    send:   "../image/button/send.png", 
    cancel: "../image/button/cancel.png",
    thumb1: "../image/button/thumb1.png",
    thumb2: "../image/button/thumb2.png",
    playGreen: "../image/button/playGreen.png",
    stopGreen: "../image/button/stopGreen.png",
    pauseGreen: "../image/button/pauseGreen.png",
    cancelGreen: "../image/button/cancelGreen.png",
  },

  url: "https://www.abceea.com/test"
})
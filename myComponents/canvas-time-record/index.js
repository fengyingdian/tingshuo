// myComponents/canvas-time/index.js
const app = getApp()
app.getRecordAuth()

Component({
  properties: {
    lastingTime: {
      type: Number,
      value: 20,
    },
  },

  data: {
    isActiveFromHide: false,
  },

  pageLifetimes: {

  },

  attached: function () {

  },

  ready: function () {
    this.recorderManager = wx.getRecorderManager()
    this.recorderManager.onError((res) => {
      console.log(res)
      if (res.errMsg == "operateRecorder:fail auth deny") {
        wx.showModal({
          title: '提示',
          content: '您未授权录音权限，请返回"首页->设置权限"授权并重启程序即可',
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../../pages/index/index'
              })
            } else {
              return
            }
          },
        })
      } else if (res.errMsg == "operateRecorder:fail recorder not start") {
        console.log(res.errMsg)
      } else {
        //wx.showToast({
        // title: "error",
        //})
        console.log(res.errMsg)
      }
    })
  },

  detached: function () {
    console.log("canvas-time-record-detached")
    this.recorderManager.stop()
  },

  pageLifetimes: {
    show: function () { 
      console.log("canvas-time-record-show")
      if (this.data.isActiveFromHide){
        this.recorderManager.stop()
      }
    },

    hide: function () {
      console.log("canvas-time-record-hide")
      this.setData({
        isActiveFromHide: true
      })
    },
  },

  methods: {
    onRecord: function (e) {
      console.log("canvas-time-record-onRecord:", e)
    },

    onStart: function (e) {
      console.log("canvas-time-record-onStart:", e)
      this.recorderManager.onStart(() => {
        console.log('recorder start')
      })
      this.recorderManager.start({
        duration: 40000,//指定录音的时长，单位 ms
      })
      var myEventDetail = {}
      var myEventOption = {}
      this.triggerEvent('start', myEventDetail, myEventOption)
    },

    onStop: function (e) {
      this.recorderManager.onStop((res) => {
        console.log("canvas-time-record-onStop:", res.tempFilePath);
        var myEventDetail = { "tempFilePath": res.tempFilePath}
        var myEventOption = { "yes": 1 }
        this.triggerEvent('stop', myEventDetail, myEventOption)
      })
      this.recorderManager.stop()
    },
  },
})
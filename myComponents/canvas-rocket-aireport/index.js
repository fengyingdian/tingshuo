// myComponents/canvas-time/index.js
const util = require('../../utils/util.js')
const aiReport = require('../../utils/aiReport.js')
const app = getApp()

var wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
var Shape = require("../../utils/wxdraw.min.js").Shape;
var AnimationFrame = require("../../utils/wxdraw.min.js").AnimationFrame;

Component({
  properties: {
    audioSrc: String,
    date: String,
    courseId: Number,
    hasAiReport: Boolean,
    rock: { 
      type: String, 
      value: true,
      observer: function (newVal, oldVal, changedPath) {
        console.log("canvas-rocket.observer", newVal, oldVal, changedPath, this)
        if (newVal == "true"){
          console.log("canvas-rocket.observer1:", this.data.audioSrc, this.data.date, this.data.courseId)
          this._start()
        }else{
          console.log("canvas-rocket.observer2:", this.data.audioSrc, this.data.date, this.data.courseId)
          this._stop()
        }
      }
    },
  },

  data: {
    timer: null,
    isActiveFromHide: false,
  },

  pageLifetimes: {
    show: function () {
    },

    hide: function () {
    }
  },

  detached: function () {

  },

  ready: function () {
    console.log("canvas-rocket.ready")

    var context = wx.createCanvasContext('rocketCanvas', this)
    this.wxCanvas = new wxDraw(context, 0, 0, 50, 140)

    this._createImage()
    this._createText()

    this.img.animate({ "y": "-=5"}, { easing: "swingTo", duration: 500 }).animate({ "y": "+=5"}, { easing: "swingFrom", duration: 500 }).start(true)
  },

  methods: {
    onTap: function () {
      console.log("canvas-rocket.onTap: ", this.data.rock)
      this._rock()
    },

    _createImage: function () {
      this.img = new Shape('image', { x: 25, y: 70, w: 50, h: 100, file: "../../pages/image/button/rocket.png" }, 'fill', true)
      this.wxCanvas.add(this.img)
    },

    _createText: function () {
      this.text = new Shape('text', { x: 25, y: 130, text: "AI测评", fillStyle: "red", align: "center", textBaseline: 'middle'},'fill', true)
      this.wxCanvas.add(this.text)
    },

    _rock: function () {
      this._start()

      setTimeout(function () {
        this._aiReport()
      }.bind(this), 500)

      setTimeout(function(){
        this._stop()
      }.bind(this), 1000)
    },

    _start: function(){
      console.log("canvas-rocket._start")
      this.img.destroy()
      this._createImage()
      this.img.animate({ "y": "-=200" }, { easing: "linear", duration: 500 }).start(1)
      this.text.updateText("")
    },

    _stop: function () {
      this.img.destroy()
      this._createImage()
      this.img.animate({ "y": "-=5" }, { easing: "swingTo", duration: 500 }).animate({ "y": "+=5" }, { easing: "swingFrom", duration: 500 }).start(true)
      this.text.updateText("AI测评")
    },

    _aiReport: function () {
      let that = this
      app.getAiReportReadyCallback = res => {
        that.setData({
          hasAiReport: true,
          aiReport: res,
        })
        var myEventDetail = {"aiReport": res}
        var myEventOption = {}
        that.triggerEvent('getReport', myEventDetail, myEventOption)
      }
      var tempFileName = aiReport.getTempFileName(that.data.audioSrc)
      if (that.data.hasAiReport == false) {
        console.log("way1", tempFileName, that.data.audioSrc)
        that._upLoadTempFile(tempFileName)
      } else {
        console.log("way2")
        wx.navigateTo({
          url: '../aiReport/aiReport' 
          + "?date=" + that.data.date 
          + "&path=" + app.globalData.miniId + "_" + tempFileName 
          + "&hostId=" + app.globalData.miniId
        })
      }
    },

    _upLoadTempFile: function (tempFileName) {
      let that = this
      var urlParam = "?type=1201" 
        + "&courseId=" + that.data.courseId
        + "&usrId=" + app.globalData.miniId
        + "&date=" + that.data.date
        + "&path=" + tempFileName
      console.log(tempFileName)
      wx.uploadFile({
        url: app.url + urlParam,
        filePath: that.data.audioSrc,
        name: 'punch',
        header: {
          'content-type': 'multipart/text'
        },
        success: function (res) {
          console.log("1201: ", res)
          var data = JSON.parse(res.data)
          if (data.res == "success") {
            wx.navigateTo({
              url: '../aiReport/aiReport' + "?date=" + that.data.date + "&path=" + app.globalData.miniId + "_" + tempFileName + "&hostId=" + app.globalData.miniId
            })
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
        },
        complete:function(res){
        }
      })
    },
  }
})
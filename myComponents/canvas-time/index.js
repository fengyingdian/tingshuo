// myComponents/canvas-time/index.js
const util = require('../../utils/util.js')
var wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
var Shape = require("../../utils/wxdraw.min.js").Shape;
var AnimationFrame = require("../../utils/wxdraw.min.js").AnimationFrame;

Component({
  properties: {
    lastingTime: { 
      type: Number, 
      value: 20,
    },
    satus: {
      type: Number,
      value: 0,
    },
    seconds: {
      type: Number,
      value: 19,
    },
  },

  data: {
    timer: null,
    isActiveFromHide: false,
  },

  pageLifetimes: {
    show: function () {
      console.log("canvas-time-show")
      if (this.data.isActiveFromHide) {
        this.setData({
          satus: 0
        })
        clearInterval(this.data.timer)
        this._destroy()
        this._create()

        this.circle2.updateOption({ eA: this.data.seconds / this.data.lastingTime * 2 * Math.PI })
        this.circle2.animate({ eA: 4 * Math.PI }, { easing: "linear", duration: 2000 })
        this.circle2.start(1)
      }
    },

    hide: function () {
      console.log("canvas-time-hide")
      this.setData({
        isActiveFromHide: true
      })
    }
  },

  detached: function () {
    this.wxCanvas.clear()
  },

  ready: function () {
    var context = wx.createCanvasContext('secondCanvas', this)

    this.wxCanvas = new wxDraw(context, 0, 0, 400, 500);

    this._create()

    this.circle2.animate({ eA: 4 * Math.PI }, { easing: "linear", duration: 1000 })
    this.circle2.start(1)
  },

  methods: {
    onTime: function () {
      console.log("canvas-time-onTime")
      if (this.data.satus == 0){
        this.setData({
          satus: 1
        })
        this._start()

        var myEventDetail = { "yes": 1 }
        var myEventOption = { "yes": 1 }
        this.triggerEvent('start', myEventDetail, myEventOption)
      }else{
        this.setData({
          satus: 0
        })
        clearInterval(this.data.timer)
        this._destroy()
        this._create()

        this.circle2.updateOption({ eA: this.data.seconds / this.data.lastingTime * 2 * Math.PI })
        this.circle2.animate({ eA: 4 * Math.PI }, { easing: "linear", duration: 2000 })
        this.circle2.start(1)

        var myEventDetail = { "yes": 1}
        var myEventOption = { "yes": 1}
        this.triggerEvent('stop', myEventDetail, myEventOption)
      }
    },

    _create: function () {
      this.circle0 = new Shape('circle', { x: 150, y: 150, r: 50, sA: 0 * Math.PI, eA: 0 * Math.PI, fillStyle: "#22b14c" }, 'fill', true)
      this.wxCanvas.add(this.circle0)

      this.text = new Shape('text', { x: 150, y: 150, text: "START", fontSize: 20, fillStyle: "white", align: "center", textBaseline: 'middle' }, 'stroke', true)
      this.wxCanvas.add(this.text)

      this.circle1 = new Shape('circle', { x: 150, y: 150, r: 120, sA: 0 * Math.PI, eA: 0 * Math.PI, strokeStyle: "ghostwhite", rotate: 0, lineWidth: 1 }, 'stroke', true)
      this.wxCanvas.add(this.circle1)

      this.circle2 = new Shape('circle', { x: 150, y: 150, r: 120, sA: 0 * Math.PI, eA: 0 * Math.PI, strokeStyle: "grey", rotate: 0, lineWidth: 1 }, 'stroke', true)
      this.wxCanvas.add(this.circle2)

      this.setData({
        seconds: this.data.lastingTime,
      })
      this.setData({
        secondsText: util.formatNumber02(this.data.seconds),
      })
    },

    _destroy: function(){
      this.circle0.destroy()
      this.circle1.destroy()
      this.circle2.destroy()
      this.text.destroy()
    },

    _start: function(){
      this._timer()

      this.circle0.animate({ r: 52 }, { easing: "linear", duration: 1000 })
      this.circle0.animate({ r: 50 }, { easing: "linear", duration: 1000 })
      this.circle0.start(this.data.lastingTime / 2)

      this.text.updateText("STOP")

      this.circle2.updateOption({ eA: 0 * Math.PI })
      this.circle2.animate({ eA: 4 * Math.PI }, { easing: "linear", duration: this.data.lastingTime * 2000 })
      this.circle2.start(1)
    },

    _timer: function(){
      var timer = setInterval( function(){
        if (this.data.seconds <= 1){
          clearInterval(this.data.timer)
          this._destroy()
          this._create()
          this.setData({
            satus: 0
          })
          var myEventDetail = { "yes": 1 }
          var myEventOption = { "yes": 1 }
          this.triggerEvent('stop', myEventDetail, myEventOption)
        }else{
          this.setData({
            seconds: this.data.seconds - 1
          })
          this.setData({
            secondsText: util.formatNumber02(this.data.seconds),
          })
        }
      }.bind(this), 1000)

      this.setData({
        timer: timer
      })
    }
  },
})
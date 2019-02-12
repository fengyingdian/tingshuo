// myComponents/canvas-time/index.js
const util = require('../../utils/util.js')
var wxDraw = require("../../utils/wxdraw.min.js").wxDraw;
var Shape = require("../../utils/wxdraw.min.js").Shape;
var AnimationFrame = require("../../utils/wxdraw.min.js").AnimationFrame;

Component({
  properties: {
    rock: { 
      type: String, 
      value: true,
      observer: function (newVal, oldVal, changedPath) {
        console.log("canvas-rocket.observer", newVal, oldVal, changedPath, this)
        if (newVal == "true"){
          console.log("canvas-rocket.observer1")
          this._start()
        }else{
          console.log("canvas-rocket.observer2")
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
    this.wxCanvas = new wxDraw(context, 0, 0, 50, 220)

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
      this.img = new Shape('image', { x: 25, y: 150, w: 50, h: 100, file: "../../pages/image/button/rocket.png" }, 'fill', true)
      this.wxCanvas.add(this.img)
    },

    _createText: function () {
      this.text = new Shape('text', { x: 25, y: 210, text: "loading", fillStyle: "grey", align: "center", textBaseline: 'middle'},'fill', true)
      this.wxCanvas.add(this.text)
    },

    _rock: function () {
      this._start()

      setTimeout(function(){
        this._stop()
      }.bind(this), 1000)
    },

    _start: function(){
      console.log("canvas-rocket._start")
      this.img.destroy()
      this._createImage()
      this.img.animate({ "y": "-=300" }, { easing: "linear", duration: 500 }).start(1)
      this.text.updateText("")
    },

    _stop: function () {
      this.img.destroy()
      this._createImage()
      this.img.animate({ "y": "-=5" }, { easing: "swingTo", duration: 500 }).animate({ "y": "+=5" }, { easing: "swingFrom", duration: 500 }).start(true)
      this.text.updateText("loading")
    },
  }
})
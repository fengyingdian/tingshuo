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
    this.wxCanvas = new wxDraw(context, 0, 0, 200, 270)

    this._createImage()
    this._createText()

    this.img.animate({ "y": "-=10" }, { easing: "swingTo", duration: 1000 }).animate({ "y": "+=10" }, { easing: "swingFrom", duration: 1000 }).start(true)
  },

  methods: {
    onTap: function () {
      console.log("canvas-rocket.onTap: ", this.data.rock)
      this._rock()
    },

    _createImage: function () {
      this.img = new Shape('image', { x: 104, y: 215, w: 50, h: 50, file: "../../pages/image/button/cat2.png" }, 'fill', true)
      this.wxCanvas.add(this.img)
    },

    _createText: function () {
      this.text = new Shape('text', { x: 100, y: 240, text: "loading", fillStyle: "grey", align: "center", textBaseline: 'middle', fontSize: 12},'fill', true)
      this.wxCanvas.add(this.text)
    },

    _rock: function () {

    },

    _start: function(){

    },

    _stop: function () {

    },
  }
})
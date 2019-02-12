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
    image: String,
  },

  data: {
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
    console.log("canvas-pick.ready")

    var context = wx.createCanvasContext('rocketCanvas', this)
    this.wxCanvas = new wxDraw(context, 0, 0, 120, 120)

    this._createImage()

    this.img.animate({ "y": "-=10" }, { easing: "linear", duration: 500 }).animate({ "y": "+=10" }, { easing: "linear", duration: 500 }).start(true)
  },

  methods: {
    onTap: function () {
      console.log("canvas-rocket.onTap: ", this.data.rock)
      this._rock()
    },

    _createImage: function () {
      this.img = new Shape('image', { x: 25, y: 35, w: 50, h: 50, file:this.data.image }, 'fill', true)
      this.wxCanvas.add(this.img)
    },

    _rock: function () {

    },

    _start: function(){

    },

    _stop: function () {

    },
  }
})
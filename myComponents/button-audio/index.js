Component({
  properties: {
    imageSrc: String,
    audioSrc: String,
    audioTitle: String,
    status: {
      type: Number,
      value: 0,
      observer: function (newVal, oldVal, changedPath) {
        console.log("button-audio.observer", newVal, oldVal, changedPath)
        if (newVal == "1") {
          this.akAudio.src = this.data.audioSrc
          this.akAudio.title = this.data.audioTitle
          this.akAudio.play()
        } else {
          this.akAudio.stop()
        }
      }
    },
  },

  observer: function (newVal, oldVal, changedPath) {
    console.log("button-audio.observer", newVal, oldVal, changedPath)
  },

  data:{
    animationData:{},
  },

  pageLifetimes: {
    show: function () { 
      console.log("button-audio.show")
    },
    hide: function () { },
  },
  
  attached: function () { 
    console.log("button-audio.attached")
  }, 

  ready: function () { 
    console.log("button-audio.ready")
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linear',
    })
    this.akAudio = wx.createInnerAudioContext()
    this.akAudio.onEnded((res) => {
      this.setData({
        status: 0,
      })
    })

    var i = 0
    var idInterval = setInterval(function () {
      if (this.data.status == 1) {
        i = i + 1
        animation.rotate(i * 5).step()
        this.setData({
          animationData: animation.export()
        })
      }
    }.bind(this), 500)

    this.setData({
      idInterval: idInterval,
    })

    var myEventDetail = {}
    var myEventOption = {}
    this.triggerEvent('broadcast', myEventDetail, myEventOption)
  },

  methods: {
    onPlay: function () {
      if (this.data.status == 0) {
        this.setData({
          status:1,
        })
        this.akAudio.src = this.data.audioSrc
        this.akAudio.title = this.data.audioTitle
        this.akAudio.play()
      } else {
        this.setData({
          status: 0,
        })
        this.akAudio.stop()
      }
    }
  },

  _play:function(){
    
  }
})
Component({
  properties: {
    imageSrc: String,
    audioSrc: String,
    audioTitle: String,
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
    var i = 0
    var idInterval = setInterval(function () {
      const akAudio = wx.getBackgroundAudioManager()
      //console.log("akAudio.paused:", akAudio.paused)
      if (akAudio.paused != undefined && akAudio.paused == false) {
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
    onBroadcast: function () {
      console.log("onBroadcast")
      const akAudio = wx.getBackgroundAudioManager()
      if (akAudio.paused == undefined || akAudio.paused == true) {
        akAudio.src = this.data.audioSrc
        akAudio.title = this.data.audioTitle
        akAudio.play()
      } else {
        akAudio.stop()
      }
    }
  },
})
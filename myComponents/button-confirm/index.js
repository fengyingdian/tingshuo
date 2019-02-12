Component({
  properties: {
  },

  data: {
    animationData: {},
  },

  attached: function () {
  },

  ready: function () {
  },

  methods: {
    onTap: function () {
      var myEventDetail = {}
      var myEventOption = {}
      this.triggerEvent('tap', myEventDetail, myEventOption)
    }
  },
})
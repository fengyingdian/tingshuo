const util = require('../../utils/util.js')
const app = getApp()

Component({
  properties: {
    date: String,
    classType: String,
    item: null,
    width: Number,
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
      if (this.data.item.punchId == "") {
        wx.showToast({
          title: 'punchId为空',
        })
        return
      }
      else {
        console.log("punchId: ", this.data.punchId)
      }

      var urlvalue = '../../pages/recordShow/recordShow?punchId=' + this.data.item.punchId
        + '&date=' + this.data.date + '&loadType=1'
      console.log(urlvalue)
      wx.navigateTo({
        url: urlvalue
      })

      var myEventDetail = {}
      var myEventOption = {}
      this.triggerEvent('tap', myEventDetail, myEventOption)
    }
  },
})
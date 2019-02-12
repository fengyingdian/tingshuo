/**course.js**/
const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')

Page({
  data: {
  },
  
  onLoad: function (option) {
    wx.showShareMenu({
      withShareTicket: true
    })

    let that = this
    that.setData({
      showPage: false,
      punches: null,
      words: null,
      bottomTips: "Make each day count.",
    })

    if (app.globalData.miniId < 1) {
      console.log("1000 1: ", app.globalData.miniId)
      app.miniIdReadyCallback = res => {
        console.log("1000 2: ", res)
        app.globalData.miniId = res.data.miniId
        app.globalData.userInfo = res.data.userInfo

        if (app.globalData.miniId < 1) {
          wx.showModal({
            title: '提示',
            content: '系统检测到您未正常登陆，请返回我的->授权/刷新用户信息',
            showCancel: false,
            success: function (res) {
              wx.switchTab({
                url: '../home/home'
              })
            },
          })
        } else {
          console.log("loading1")
          that.loading()
        }
      }
    }else{
      console.log("loading2")
      that.loading()
    }
  },

  loading: function () {
    this.setData({
      height: app.globalData.windowHeight - 50,
      userInfo: app.globalData.userInfo,
    })
    console.log(app)

    https.getCourse({
      data: app.globalData,
      that: this,
    })

    wx.setNavigationBarTitle({
      title: '每日一句-闯关',
    })
  },

  tapCourseSubTitle: function (event) {
    let that = this
    var select = that.data.courseTitlesSelect
    var subSelect = event.currentTarget.id
    var subTitles = that.data.courseTitles[select].subTitles
    that.setData({
      courseSubTitles: subTitles,
      courseSubTitlesSelect: subSelect,
      calendar: subTitles[subSelect].calendar,
      courses: subTitles[subSelect].data
    })

    //我的打卡
    if (subSelect == 1){
      if (subTitles[subSelect].hasOwnProperty("punches")) {
        that.setData({
          punches: subTitles[subSelect].punches
        })
        var date = new Date()
        https.activeCourseDay({
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          that: that,
        })
      } else {
        that.setData({
          punches: null
        })
      }
    } else {
      that.setData({
        punches: null
      })
    }

    //我的单词
    if (subSelect == 2) {
      if (subTitles[1].hasOwnProperty("punches")){
        var punches = subTitles[1].punches
        var collector = {}
        for (var i = 0; i < punches.length; i++){
          collector = util.sentence2words({
            str: punches[i][2],
            collector: collector,
          })
        }
        var list = []
        for (var key1 in collector) {
          var temp = {
            key: key1,
            count: collector[key1]
          }
          list.push(temp)
        }

        if (list.length > 0){
          var compare = function (x, y) {
            if (x.key < y.key) {
              return -1
            } else if (x.key > y.key) {
              return 1;
            } else {
              return 0;
            }
          }
          list = list.sort(compare)
          that.setData({
            words: list
          })
        }else{
          that.setData({
            words: null
          })
        }
      }
    } else {
      that.setData({
        words: null
      })
    }
  },

  tapOneCourse: function (event) {
    console.log("tapOneCourse:", event.currentTarget.dataset.date)

    var curDate = event.currentTarget.dataset.date
    wx.navigateTo({
      url: '../everyday/everyday' + "?date=" + curDate + "&classType=" + "None"  
    })
  },

  dayClick: function (event) {
    console.log(event.detail)
    var curDate = event.detail.year.toString() 
    + util.formatNumber02(event.detail.month) 
    + util.formatNumber02(event.detail.day)

    let that = this
    var courseTitles = that.data.courseTitles 
    var courseTitlesSelect = that.data.courseTitlesSelect
    var courses = courseTitles[courseTitlesSelect].subTitles[0].data
    for (var key in courses){
      if (courses[key][1] == curDate){
        wx.navigateTo({
          url: '../everyday/everyday' + "?date=" + curDate + "&classType=" + "None"
        })
        break
      }
    }
  },

  next: function (event) {
    console.log(event.detail)
    https.activeCourseDay({
      year: event.detail.currentYear,
      month: event.detail.currentMonth,
      that: this,
    })
  },

  prev: function (event) {
    console.log(event.detail)
    https.activeCourseDay({
      year: event.detail.currentYear,
      month: event.detail.currentMonth,
      that: this,
    })
  },

  dateChange: function (event) {
    console.log(event.detail)
    https.activeCourseDay({
      year: event.detail.currentYear,
      month: event.detail.currentMonth,
      that: this,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.onLoad()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
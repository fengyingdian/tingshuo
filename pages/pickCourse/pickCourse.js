// pages/pickCourse/pickCourse.js
const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onLoad: function (options) {
    console.log(options)
    wx.hideShareMenu()
    
    if (options.loadType == 2) {
      wx.switchTab({
        url: '../class/class',
      })
    }

    let that = this
    that.setData({
      showType: 0,
      showPage: false,
      classId: options.classId,
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
            content: '系统检测到您未正常登陆，请返回首页授权/刷新用户信息',
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
    } else {
      console.log("loading2")
      that.loading()
    }
  },

  loading: function () {
    https.getCourse({
      data: app.globalData,
      that: this,
    })

    this.setData({
      selectCourse: {},
      date: util.formatDate(new Date()),
    })
  },

  tapCourseTitle: function (event) {
    let that = this
    var select = event.currentTarget.id
    var subTitles = that.data.courseTitles[select].subTitles
    that.setData({
      courseTitlesSelect: select,
      courses: subTitles[0].data
    })
    if (that.data.courses.length == 0) {
      that.setData({
        bottomTips: "Opps~课程还未上架~请耐心等待~",
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

  tapSelectCourse: function (event) {
    let that = this
    console.log("tapSelectCourse1:", event.currentTarget.id, event.currentTarget.dataset.id)
    var id = event.currentTarget.id
    var courseId = event.currentTarget.dataset.id
    var select = that.data.courseTitlesSelect
    var subTitles = that.data.courseTitles[select].subTitles
    var selectCourse = that.data.selectCourse
    if (subTitles[0].data[id][15] == 0){
      var count = 0
      for (var key in selectCourse) {
        if (selectCourse[key].select == 1) {
          count++
        }
      }
      if (count > 2) {
        wx.showToast({
          title: '最多选择3个',
        })
        return
      }
      console.log("tapSelectCourse2:", subTitles[0].data[id], courseId, selectCourse[courseId]) 
      subTitles[0].data[id][15] = 1
      selectCourse[courseId] = {
        id: courseId,
        select: 1,
        name: event.currentTarget.dataset.name,
        image: event.currentTarget.dataset.image,
        content: event.currentTarget.dataset.content,
        }
    }else{
      console.log("tapSelectCourse3:", subTitles[0].data[id], courseId, selectCourse[courseId]) 
      subTitles[0].data[id][15] = 0
      selectCourse[courseId] = {
        id: courseId,
        select: 0,
        name: event.currentTarget.dataset.name,
        image: event.currentTarget.dataset.image,
        content: event.currentTarget.dataset.content,
      }
    }

    that.setData({
      courses: subTitles[0].data,
      selectCourse: selectCourse,
    })
    console.log("tapSelectCourse4:", that.data.courses, that.data.selectCourse) 
  },

  tapNext: function () {
    let that = this
    var selectCourse = that.data.selectCourse
    var count = 0
    for (var key in selectCourse){
      if (selectCourse[key].select == 1){
        count++
      }
    }
    if (count == 0){
      wx.showToast({
        title: '未选择课程',
      })
    }else{
      that.setData({
        showType: 1,
      })
    }
  },

  bindDateChange: function (e) {
    console.log('bindDateChange', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },

  tapPre: function () {
    this.setData({
      showType: 0,
    })
  },

  tapConfirm: function () {
    let that = this
    var data = {
      type: 1505,
      usrId: app.globalData.miniId,
      classId: that.data.classId, 
      postDate: that.data.date,
    }
    var selectCourse = that.data.selectCourse
    var count = 0
    for (var key in selectCourse) {
      if (selectCourse[key].select == 1) {
        count++
        data["courseId" + count.toString()] = selectCourse[key].id
      }
    }
    data["count"] = count
    console.log("data:", data)

    wx.request({
      url: 'https://www.abceea.com/test',
      data: data,
      success: function (res) {
        console.log("1505: ", res)
        if (res.data.res == "success"){
          if (app.addClassReadyCallback) {
            app.addClassReadyCallback(res)
          }
          wx.navigateBack({
            delta: 1,
          })
        }
        else if (res.data.res == "existed"){
          wx.showModal({
            title: '提示',
            content: '该课件已经选过啦~',
            showCancel: false,
          })
        }
      },
      fail: function (res) {
        console.log("1505: ", res)
        wx.showToast({
          title: '网络错误',
        })
      },
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
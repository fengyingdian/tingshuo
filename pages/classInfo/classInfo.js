// pages/classInfo/classInfo.js

const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const https1 = require('../../utils/https1.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    accents: ["美音", "英音", "混音"],
    admittances: ["无需审核", "需要审核"]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.hideShareMenu()
    if (app.globalData.miniId < 1) {
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
          that.loading(options)
        }
      }
    } else {
      console.log("loading2")
      that.loading(options)
    }
  },

  loading: function (options) {
    console.log("classInfo-options: ", options)
    let that = this
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1504,
        usrId: app.globalData.miniId,
        classId: options.id,
      },
      success: function (res) {
        console.log("1504: ", res)
        if (res.data.res == "success") {
          that.setData({
            name: res.data.classInfo[1],
            classId: res.data.classInfo[5],
            accent: that.data.accents[res.data.classInfo[2]-1],
            admittance: that.data.admittances[res.data.classInfo[7]],
            tempClassImageSrc: "https://www.abceea.com/static/group/" + res.data.classInfo[5].toString() + "/c",
            punchLimit: res.data.classInfo[8],
            memberLimit: res.data.classInfo[3],
            memberCount: res.data.usrClass.length,
          })
        } else if (res.data.res == "fail") {
          console.log("1504: ", res)
        }
      },
      fail: function (res) {
        console.log("1504: ", res)
      }
    })
  },

  tapConfirm: function () {
    let that = this
    var status = 1
    if (that.data.admittance == that.data.admittances[1]){
      status = 2
    }
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1507,
        usrId: app.globalData.miniId,
        classId: that.data.classId,
        status: status,
        loadType: 1,
      },
      success: function (res) {
        console.log("1507: ", res)
        if (res.data.res == "success") {
          if(status == 1){
            var url = "../oneClass/oneClass?id=" + that.data.classId + "&loadType=1&select=0&sub=0"
            wx.navigateTo({
              url: url,
            })
          }else{
            wx.showModal({
              title: '提示',
              content: '申请提交~就等管理员批准啦~',
              showCancel: false,
            })
          }
        } else if (res.data.res == "deleted") {
          wx.showToast({
            title: '该班级已被注销',
          })
          wx.navigateBack({
            delta: 1,
          })
        } else if (res.data.res == "existed") {
          wx.showModal({
            title: '提示',
            content: '小可爱你已经申请过啦~',
            showCancel: false,
          })
        } else if (res.data.res == "tickOff") {
          wx.showModal({
            title: '提示',
            content: '小可爱你之前已经被淘汰啦~',
            showCancel: false,
          })
        }
      }
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
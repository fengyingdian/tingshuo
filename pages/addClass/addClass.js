// pages/createClass/createClass.js
//记录验证码输入
const app = getApp()
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
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
          that.loading()
        }
      }
    } else {
      console.log("loading2")
      that.loading()
    }
  },

  loading: function(){
    let that = this
    that.setData({
      name: "",
      accents: [
        { name: "美音", value: 1, checked: "true" },
        { name: "英音", value: 2, checked: "false" },
        { name: "混音", value: 3, checked: "false" }],
      accent: 1,
      admittances: [
        { name: "无需审核", value: 0, checked: "true" },
        { name: "需要审核", value: 1, checked: "false" }],
      admittance: 0,
      tempClassImageSrc: "../image/button/add5.png",
      punchLimit: 0,
      memberLimit: 50,
    })
  },

  tapConfirm: function (event) {
    let that = this
    if (that.data.name.length < 1){
      wx.showToast({
        title: '名称为空',
      })
      return
    } 
    console.log(that.data.tempClassImageSrc)
    if (that.data.tempClassImageSrc == "../image/button/add5.png") {
      wx.showToast({
        title: '头像为空',
      })
      return
    } 

    that.funSend()
  },

  funSend: function () {
    wx.showLoading({
      title: '创建中...',
    })
    let that = this
    var urlParam = "?type=1500" 
      + "&name=" + that.data.name
      + "&sName=" + that.data.name 
      + "&classType=" + that.data.accent 
      + "&admittance=" + that.data.admittance 
      + "&maxCount=" + that.data.memberLimit 
      + "&punchLimit=" + that.data.punchLimit
      + "&info=" + ""
      + "&coverSrc=" + "" 
      + "&usrId=" + app.globalData.miniId

    console.log("url1: ", app.url + urlParam)
    console.log("file1: ", that.data.tempClassImageSrc)
    wx.uploadFile({
      url: app.url + urlParam,
      filePath: that.data.tempClassImageSrc,
      name: 'addClass',
      header: {
        'content-type': 'multipart/text'
      },
      success: function (res) {
        console.log("1500: ", res)
        var data = JSON.parse(res.data)
        console.log("1500: ", data)
        if (data.res == "success") {
          wx.showToast({
            title: '创建成功',
          })
          wx.reLaunch({
            url: '../class/class'
          })
        } else if (data.res == "wrong type") {
          wx.showModal({
            title: '提示',
            content: '当前只支持png和jpg格式的图片哦',
          })
        } else if (data.res == "existed") {
          wx.showToast({
            title: '该小组已存在',
          })
        } else{
          wx.showToast({
            title: '创建失败',
          })
        }
      },
      fail: function (res) {
        console.log(res)
        wx.showModal({
          title: '请求失败提示',
          content: "请检查网络状态",
          showCancel: false,
          success: function (res) {
          }
        })
        wx.hideToast()
      }
    })
  },

  codeInput: function (event) {
    console.log('value: ', event.detail.value)
    this.setData({
      name: event.detail.value
    })
  },

  addClassImage: function(){
    let that = this
    wx.chooseImage({
      count: 1, 
      sizeType: ['original'],
      sourceType: ['album', 'camera'], 
      success: function (res) {
        var tempFilePaths = res.tempFilePaths[0]
        that.setData({
          tempClassImageSrc: tempFilePaths,
        })
      }
    })
  },

  radioChangeAccent: function (e) {
    console.log('value: ', e.detail.value)
    this.setData({
      accent: e.detail.value
    })
  },

  radioChangeAdmittance: function (e) {
    console.log('value: ', e.detail.value)
    this.setData({
      admittance: e.detail.value
    })
  },

  slider2changePunch: function (e) {
    console.log('value: ', e.detail.value)
    var curval = e.detail.value.toFixed(0)
    this.setData({
      punchLimit: curval,
    })
  },

  slider2changingPunch: function (e) {
    console.log('value: ', e.detail.value)
    var curval = e.detail.value.toFixed(0)
    this.setData({
      punchLimit: curval,
    })
  },

  slider2changeMember: function (e) {
    console.log('value: ', e.detail.value)
    var curval = e.detail.value.toFixed(0)
    this.setData({
      memberLimit: curval,
    })
  },

  slider2changingMember: function (e) {
    console.log('value: ', e.detail.value)
    var curval = e.detail.value.toFixed(0)
    this.setData({
      memberLimit: curval,
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
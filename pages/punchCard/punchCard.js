// pages/punchCard/punchCard.js
const util = require('../../utils/util.js')
const https = require('../../utils/https.js')
const check = require('../../utils/check.js')
const app = getApp()

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
    wx.showLoading({
      title: '加载中',
    })
    let that = this
    var key = options.date + '-pracitice'
    var value = wx.getStorageSync(key)
    if (value){
      that.setData({
        practiceSum: value.practiceSum
      })      
    }else{
      that.setData({
        practiceSum: 0
      })   
    }
    
    that.setData({ 
      showPage: false
    })
    if (app.globalData.miniId < 1) {
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
        }else{
          that.funLoading(options)
        }
      }
    }else{
      that.funLoading(options)
    }
  },

  funLoading: function (options) {
    let that = this
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1107,
        date: options.date,
        usrId: app.globalData.miniId,
        class: options.classType,
      },
      success: function (res) {
        console.log("1107: ", res)
        if (res.data.res == "success") {
          var practiceTime = 0
          for (var i = 0; i < res.data.punchTime.length; i++){
            if (res.data.punchTime[i][6] == 0){
              practiceTime += Math.random() * 10
            }
          }
          
          that.setData({
            date: res.data.courseData[1],
            content: res.data.courseData[2],
            punchTime: res.data.punchTime.length,
            commentTime: res.data.commentTime.length,
            practiceTime: practiceTime.toFixed(2),
            name: app.globalData.userInfo.nickName,
          })
          wx.getSystemInfo({
            success: function (systemInfo) {
              that.setData({
                width: systemInfo.screenWidth - 100,
              })
              wx.getImageInfo({
                src: app.globalData.userInfo.imageSrc,
                success: function (resInfo1) {
                  console.log(resInfo1)
                  that.setData({
                    headImage: resInfo1,
                  })
                  wx.getImageInfo({
                    src: 'https://www.abceea.com/static/others/tingshuoORcode.jpg',
                    success: function (resInfo2) {
                      console.log(resInfo2)
                      that.setData({
                        bottomImage: resInfo2,
                      })

                      that.tapDraw()
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
  },

  random: function (n) {
    var rnd= "";
    for(var i= 0;i<n;i++)
      rnd += Math.floor(Math.random() * 10);
    return rnd;
  },

  tapDraw: function (event) {
    let that = this
    that.setData({
      showPage: true
    })
    wx.showLoading({
      title: '正在生成',
    })
    that.funDraw()
    that.funDraw()
  },

  funDraw: function () {
    let that = this
    var punchTime = that.data.punchTime
    var practiceTime = that.data.practiceTime

    const ctx = wx.createCanvasContext('myCanvas')
    ctx.setGlobalAlpha(1)
    ctx.setFillStyle("white")
    ctx.fillRect(0, 0, that.data.width, 1000)
    ctx.save()

    var avatarurl_x = that.data.width / 2 - 30
    var avatarurl_y = 20
    var avatarurl_width = 60
    var avatarurl_heigth = 60
    {
      ctx.beginPath()
      ctx.arc(avatarurl_width / 2 + avatarurl_x, avatarurl_heigth / 2 + avatarurl_y, avatarurl_width / 2, 0, Math.PI * 2, false)
      ctx.clip()
      ctx.drawImage(that.data.headImage.path, avatarurl_x, avatarurl_y, avatarurl_width, avatarurl_heigth)
      ctx.restore()
    }

    ctx.beginPath()
    {
      ctx.setFillStyle("black")
      ctx.font = 'normal normal 14px sans-serif'
      ctx.setTextAlign('center')
      ctx.fillText(app.globalData.userInfo.nickName, 0.5 * that.data.width, 100)
    }

    {
      ctx.setFontSize(16)
      ctx.fillText("打卡天数", 0.25 * that.data.width, 130)
      ctx.fillText("练习时间", 0.75 * that.data.width, 130)
      ctx.font = 'normal bold 30px cursive'
      ctx.fillText(punchTime, 0.25 * that.data.width, 170)
      ctx.fillText(practiceTime, 0.75 * that.data.width, 170)
      ctx.setFillStyle("grey")
      ctx.font = 'normal normal 16px sans-serif'
      ctx.fillText("Days", 0.25 * that.data.width, 195)
      ctx.fillText("Minutes", 0.75 * that.data.width, 195)
    }

    {
      ctx.moveTo(10, 215)
      ctx.lineTo(that.data.width - 10, 215)
      ctx.stroke()
    }

    {
      ctx.setFillStyle("rgb(75,191,168)")
      ctx.font = 'normal normal 18px sans-serif'
      ctx.fillText("今日晨读", 0.5 * that.data.width, 250)
      
    }

    var countRow = 0
    {
      var tempStrs = util.sliceStrBySpace(that.data.content)
      var tempRow = ""
      ctx.setFillStyle("black")
      ctx.font = 'italic normal 16px sans-serif'
      for (var i = 0; i < tempStrs.length; i++) {
        tempRow = tempRow + tempStrs[i]
        var metrics = ctx.measureText(tempRow)
        if ((metrics.width > that.data.width - 100) || i == tempStrs.length - 1) {
          countRow++
          //console.log(metrics, that.data.width - 100, tempRow)
          ctx.fillText(tempRow, 0.5 * that.data.width, 255 + countRow * 24)
          tempRow = ""
        }
      }
    }
    
    if (that.data.practiceSum > 0) {
      ctx.setFillStyle()
      ctx.setFillStyle("grey")
      ctx.font = 'normal normal 12px sans-serif'
      ctx.fillText("练习" + that.data.practiceSum.toString() + "次", 0.5 * that.data.width, 280 + countRow * 24)
      var bottomHeight = that.data.bottomImage.height * that.data.width / that.data.bottomImage.width
      ctx.drawImage(that.data.bottomImage.path, 0, 300 + countRow * 24, that.data.width, bottomHeight)
      that.setData({ height: 300 + countRow * 24 + bottomHeight })
    } else {
      var bottomHeight = that.data.bottomImage.height * that.data.width / that.data.bottomImage.width
      ctx.drawImage(that.data.bottomImage.path, 0, 280 + countRow * 24, that.data.width, bottomHeight)
      that.setData({ height: 280 + countRow * 24 + bottomHeight })
    }
    ctx.draw()

    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        fileType: 'jpg',
        success: function (res) {
          that.setData({
            imagePath: res.tempFilePath,
          })
          wx.showToast({
            title: '完成绘制',
          })
        },
        fail: function (res) {
          console.log(res)
        }
      })
    }, 1000)
  },

  tapSave: function (event) {
    let that = this
    console.log("1:", that.data.imagePath)
    wx.saveImageToPhotosAlbum({
      filePath: that.data.imagePath,
      success(res) {
        wx.showToast({
          title: '保存成功',
        })
      },
      fail(res){
        console.log(res)
      }
    })
  },

  tapSend: function (event) {

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
  onShareAppMessage: function (res) {
    console.log("punch-share:", res)
    if (res.from === 'button') {
      console.log("punch-share: button: ", res.target)
    }
    var url = "/pages/punchCard/punchCard?" + "date=" + this.data.date + "&classType=" + this.data.classType
    console.log("url:", url)
    return {
      title: '这是我的学习成绩单，请签收！',
      path: url,
      success(res) {
        if (res.shareTickets) {
          wx.getShareInfo({
            shareTicket: res.shareTickets[0],
            success(res1) {
              wx.login({
                success: res2 => {
                  console.log("login-code:", res2.code)
                  wx.request({
                    url: 'https://www.abceea.com/test',
                    data: {
                      type: 9001,
                      code: res2.code,
                      errMsg: res1.errMsg,
                      encryptedData: res1.encryptedData,
                      iv: res1.iv,
                    },
                    success: function (res3) {
                      console.log("9001 ", res3)
                    },
                    fail: function (res3) {
                      console.log("9001 ", res3)
                    }
                  })
                }
              })
            },
            fail() { },
            complete() { }
          });
        }
      },
      fail(e) {
      },
      complete() { }
    }
  }
})
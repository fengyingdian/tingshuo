// pages/aiReport/aiReport.js
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
    console.log("onLoad:", options)
    let that = this
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
        } else {
          that.loading(options)
        }
      }
    } else {
      that.loading(options)
    }
  },

  loading: function (options) {
    let that = this
    that.setData({
      width: app.globalData.windowWidth,
      height:0,
      date: options.date,
      path: options.path,
      hostId: options.hostId,
    })

    that.getScore()
  },

  getScore: function (event) {
    let that = this
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1207,
        date: that.data.date,
        path: that.data.path,
        usrId: app.globalData.miniId,
        hostId: that.data.hostId,
      },
      success: function (res) {
        console.log("1207: ", res)
        if (res.data.res = "success"){
          that.setData({
            score: res.data.score,
            course: res.data.course,
            host: res.data.host,
          })
          wx.getImageInfo({
            src: res.data.host[7],
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
                  that.setData({
                    showPage: true,
                  })
                  that.drawReport()
                  that.drawReport()
                },
                fail: function (res) {
                  wx.showModal({
                    title: '提示',
                    content: 'AI老师有点儿忙，请重新发起测评！',
                    showCancel: false,
                  })
                },
              })
            },
            fail: function (res) {
              wx.showModal({
                title: '提示',
                content: 'AI老师有点儿忙，请重新发起测评！',
                showCancel: false,
              })
            },
          })
        }else{
          wx.showModal({
            title: '提示',
            content: 'AI老师有点儿忙，请重新发起测评！',
            showCancel: false,
          })
        }
      },
      fail: function (res) {
         wx.showToast({
           title: '网络错误',
         })
      },
    })
  },

  drawReport: function () {
    let that = this
    let score = that.data.score
    var w = 0.8*that.data.width
    var r = 0.3 * w
    var t = 120
    var m = 20
    var b = 200

    const ctx = wx.createCanvasContext('myCanvas')
    ctx.setGlobalAlpha(1)
    ctx.setFillStyle("white")
    ctx.fillRect(0, 0, w, 2000)
    ctx.save()

    var avatarurl_x = w / 2 - 30
    var avatarurl_y = 20
    var avatarurl_width = 60
    var avatarurl_heigth = 60
    {
      ctx.beginPath()
      ctx.arc(avatarurl_width / 2 + avatarurl_x, avatarurl_heigth / 2 + avatarurl_y, avatarurl_width / 2, 0, Math.PI * 2, false)
      ctx.clip()
      ctx.drawImage(that.data.headImage.path, avatarurl_x, avatarurl_y, avatarurl_width, avatarurl_heigth)
      ctx.stroke()
      ctx.restore()
    }
    ctx.beginPath()
    {
      ctx.setFillStyle("black")
      ctx.setTextAlign('center')
      ctx.setFontSize(14)
      ctx.fillText(that.data.host[1], 0.5 * w, 100)
    }

    //色带
    ctx.drawImage("../image/button/colors.png", m, t, w - 2*m, 40)
    ctx.setTextAlign('left')
    ctx.setFillStyle('white')
    ctx.fillText("0", m + 5, t + 36)
    ctx.fillText("6", m + 5 + (w - 2 * m) * 2 / 6, t + 36)
    ctx.fillText("7.8", m + 5 + (w - 2 * m) * 3.8 / 6, t + 36)
    ctx.fillText("9", m + 5 + (w - 2 * m) * 5 / 6, t + 36)

    //雷达圈
    ctx.beginPath()
    ctx.arc(0.5 * w, r + b, r, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#D2D2D2')
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(0.5 * w, r + b, 0.75 * r, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#D2D2D2')
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(0.5 * w, r + b, 0.625 * r, 2 * Math.PI)
    ctx.setLineWidth(0.25 * r)
    ctx.setStrokeStyle('rgba(210, 210, 210, 0.3)')
    ctx.stroke()
    ctx.setLineWidth(1)

    ctx.beginPath()
    ctx.arc(0.5 * w, r + b, 0.5 * r, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#D2D2D2')
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(0.5 * w, r + b, 0.25 * r, 0, 2 * Math.PI)
    ctx.setStrokeStyle('#D2D2D2')
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(0.5 * w, r + b, 0.125 * r, 2 * Math.PI)
    ctx.setLineWidth(0.25 * r)
    ctx.setStrokeStyle('rgba(210, 210, 210, 0.3)')
    ctx.stroke()
    ctx.setLineWidth(1)

    //
    ctx.beginPath()
    ctx.moveTo(0.5 * w, b)
    ctx.lineTo(0.5 * w - 0.866 * r, 1.5 * r + b)
    ctx.moveTo(0.5 * w - 0.866 * r, 1.5 * r + b)
    ctx.lineTo(0.5 * w + 0.866 * r, 1.5 * r + b)
    ctx.moveTo(0.5 * w + 0.866 * r, 1.5 * r + b)
    ctx.lineTo(0.5 * w, b)
    ctx.setStrokeStyle('#D2D2D2')
    ctx.stroke()

    //
    ctx.beginPath()
    ctx.moveTo(0.5 * w, r + b)
    ctx.lineTo(0.5 * w, b)
    ctx.moveTo(0.5 * w, r + b)
    ctx.lineTo(0.5 * w - 0.866 * r, 1.5 * r + b)
    ctx.moveTo(0.5 * w, r + b)
    ctx.lineTo(0.5 * w + 0.866 * r, 1.5 * r + b)
    ctx.setStrokeStyle('#D2D2D2')
    ctx.stroke()

    var overall = score.detail_score.overall
    var integrity = score.detail_score.integrity
    var segment = score.detail_score.segment
    var fluency = score.detail_score.fluency

    ctx.beginPath()
    ctx.moveTo(0.5 * w, b + (1 - integrity / 10) * r)
    ctx.lineTo(0.5 * w - 0.866 * (segment / 10) * r, r + b + (segment / 10) * 0.5 * r)
    ctx.lineTo(0.5 * w + 0.866 * (fluency / 10) * r, r + b + (fluency / 10) * 0.5 * r)
    ctx.setFillStyle(app.getScoreColorOpc(overall))
    ctx.fill()

    ctx.setFontSize(12)
    ctx.setFillStyle('rgb(180, 180, 180)')
    ctx.setTextAlign('center')
    ctx.fillText('准确度 ' + integrity, 0.5 * w, b - 10)
    ctx.setTextAlign('right')
    ctx.fillText('完整度 ' + segment, 0.5 * w - 0.866 * r, 1.5 * r + b + 20)
    ctx.setTextAlign('left')
    ctx.fillText('流畅度 ' + fluency, 0.5 * w + 0.866 * r, 1.5 * r + b + 20)

    ctx.setFontSize(30)
    ctx.setTextAlign('center')
    ctx.setFillStyle("white")
    ctx.fillText(overall, 0.5 * w, r + b + 10)

    var tempStrs = score.words
    {
      var countRow = 0
      var metrics = 0
      ctx.setFillStyle("black")
      ctx.setTextAlign('left')
      ctx.font = 'normal bold 20px sans-serif'
      for (var i = 0; i < tempStrs.length; i++) {
        ctx.setFillStyle(app.getScoreColor(tempStrs[i].score))
        ctx.fillText(tempStrs[i].name + " ", 20 + metrics, b + 0.6 * w + 40 + countRow * 28)
        metrics = metrics + ctx.measureText(tempStrs[i].name + " ").width
        if ((metrics > w - 80) || i == tempStrs.length - 1) {
          countRow++
          metrics = 0
        }
      }
    }
    var bottomHeight = that.data.bottomImage.height * w / that.data.bottomImage.width
    ctx.drawImage(that.data.bottomImage.path, 0, 0.6 * w + b + 40 + countRow * 28, w, bottomHeight)
    ctx.setFontSize(12)
    that.setData({
      height: 0.6 * w + b + 40 + countRow * 28 + bottomHeight
    })
    ctx.draw()

    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        fileType: 'jpg',
        success: function (res) {
          console.log(res)
          that.setData({
            imagePath: res.tempFilePath,
            showButton: true,
          })
          var callbackRes = {
            imagePath: res.tempFilePath,
            score: overall,
          }
          if (app.getAiReportReadyCallback) {
            app.getAiReportReadyCallback(callbackRes)
          }
        },
        fail: function (res) {
          console.log(res)
        }
      })
    }, 1000)
  },

  tapSave: function (event) {
    let that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.imagePath,
      success(res) {
        wx.showToast({
          title: '保存成功',
        })
      },
      fail(res) {
        console.log(res)
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
  onShareAppMessage: function (res) {
    console.log("punch-share:", res)
    if (res.from === 'button') {
      console.log("punch-share: button: ", res.target)
    }
    let that = this
    var url = "/pages/aiReport/aiReport" + "?date=" + that.data.date + "&path=" + that.data.path + "&hostId=" + that.data.hostId
    var imageUrl = "https://www.abceea.com/static/others/aiReportPage.png"

    return {
      title: 'AI老师真的来了！！！快看我的测评报告！',
      path: url,
      imageUrl: imageUrl,
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
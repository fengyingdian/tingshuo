// pages/oneClass/oneClass.js
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
    admittances: ["无需审核", "需要审核"],
    topTitles: [
      { name: "打卡列表" },
      { name: "课件列表" },
      { name: "班级信息" },
      { name: "班级成员" },
    ],
    topMemberTitiles: [
      { name: "参与中" },
      { name: "待审核" },
      { name: "已淘汰" },
    ],
    setting1: [
      {
        name: "上传班级二维码",
        image: "../image/button/ORCode.png",
        bk: "rgb(255,246,237)",
        color: "rgb(235,171,97)",
        tap: "tapUploadORcode"
      },
    ],
    setting2: [
      {
        name: "查看班级二维码",
        image: "../image/button/ORCode.png",
        bk: "rgb(255,246,237)",
        color: "rgb(235,171,97)",
        tap: "tapCheckORcode"
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("oneClass-onLoad: ", options)
    let that = this
    that.setData({
      showPage: false,
    })
    console.log("options: ", options)

    wx.showShareMenu({
      withShareTicket: true
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
    https1.getClassData({
      classId: options.id,
      usrId: app.globalData.miniId,
      select: options.select,
      sub: options.sub,
      loadType: options.loadType,
      that: that,
    })
  }, 

  tapTopTitle: function (options) {
    console.log("tapTopTitle:", options)
    let that = this
    that.setData({
      titleSelected: options.currentTarget.id,
    })
  },

  tapAddCourse: function (options) {
    console.log("tapAddCourse:", options)
    let that = this
    if (that.data.usrInfo[4] < 7) {
      wx.showModal({
        title: '提示',
        content: '小可爱你没有此权限哦~',
        showCancel: false,
      })
      return
    }

    wx.navigateTo({
      url: '../pickCourse/pickCourse?classId=' + that.data.classId + "&loadType=1",
    })

    app.addClassReadyCallback = res => {
      console.log("addClassReadyCallback: ", res)
      that.onLoad({
        id: that.data.classId,
        loadType: 1,
        select: that.data.titleSelected,
        sub: that.data.memberTitleSelected,
      })
    }
  },

  bindDateChange: function (e) {
    console.log('bindDateChange', e.detail.value)
    let that = this
    that.setData({
      date: e.detail.value
    })

    https1.setPunchList({
      that: that,
      date: that.data.date,
    })
  },

  tapRecord: function (option) {
    var dataOption = option.currentTarget.dataset
    console.log("dataOption: ", dataOption)

    if (dataOption.punchid == "") {
      console.log("error: tapRecord: ", dataOption.punchid)
      wx.showToast({
        title: 'punchId为空',
      })
      return
    }
    else {
      console.log("punchId: ", dataOption.punchid)
    }

    var urlvalue = '../recordShow/recordShow?punchId=' + dataOption.punchid
      + '&date=' + dataOption.date + '&classType=0' + '&loadType=1'
    console.log("urlvalue:", urlvalue)

    wx.navigateTo({
      url: urlvalue
    })
  },

  tapTopMemberTitle: function (options) {
    console.log("tapTopTitle:", options)
    let that = this
    that.setData({
      memberTitleSelected: options.currentTarget.id,
    })
    if (that.data.memberTitleSelected == 0){
      that.setData({
        members: that.data.memberIn
      })
    } else if (that.data.memberTitleSelected == 1) {
      that.setData({
        members: that.data.memberWait
      })
    } else if (that.data.memberTitleSelected == 2) {
      that.setData({
        members: that.data.memberOut
      })
    }
  },

  tapGetOutMember: function (options) {
    console.log("tapGetOutMember: ", options.currentTarget.id)
    var usrLevel = options.currentTarget.dataset.level
    let that = this
    if (that.data.usrInfo[4] <= usrLevel) {
      wx.showModal({
        title: '提示',
        content: '小可爱你没有此权限哦~',
        showCancel: false,
      })
      return
    }
    var usrId = options.currentTarget.id
    wx.showModal({
      title: '提示',
      content: '确定要淘汰吗？',
      success: function (res) {
        if (res.confirm){
          https1.modifyClassUsrStatus({
            usrId: app.globalData.miniId,
            classUsrId: usrId,
            classId: that.data.classId, 
            status: 0,
            level: 0,
            that: that,
          })
        }
      },
    })
  },

  tapGetInMember: function (options) {
    console.log("tapGetInMember: ", options.currentTarget.id)
    let that = this
    if (that.data.usrInfo[4] < 7) {
      wx.showModal({
        title: '提示',
        content: '小可爱你没有此权限哦~',
        showCancel: false,
      })
      return
    }
    var usrId = options.currentTarget.id
    wx.showModal({
      title: '提示',
      content: '请确定要操作吗？',
      success: function (res) {
        if (res.confirm) {
          https1.modifyClassUsrStatus({
            usrId: app.globalData.miniId,
            classUsrId: usrId,
            classId: that.data.classId,
            status: 1,
            level: 0,
            that: that,
          })
        }
      },
    })
  },

  tapOneCourse: function (options) {
    console.log("tapOneCourse:", options.currentTarget.dataset.date)

    var curDate = options.currentTarget.dataset.date
    wx.navigateTo({
      url: '../everyday/everyday' + "?date=" + curDate + "&classType=" + "None"
    })
  },

  tapDeleteCourse: function (options) {
    console.log("tapDeleteCourse:", options)
    let that = this
    if (that.data.usrInfo[4] < 7) {
      wx.showModal({
        title: '提示',
        content: '小可爱你没有此权限哦~',
        showCancel: false,
      })
      return
    }

    var classCourseId = options.currentTarget.dataset.id
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: "1509",
        usrId: app.globalData.miniId,
        id: classCourseId,
      },
      success: function (res) {
        console.log("1509: ", res)
        if (res.data.res == "success") {
          var index = options.currentTarget.id
          var arry = that.data.courseDatas
          if (index > -1) {
            arry.splice(index, 1);
          } else {
            wx.showModal({
              title: '提示',
              content: '数据错误',
              showCancel: false,
            })
            return
          }
          that.setData({
            courseDatas: arry
          })
          https1.setPunchList({
            that: that,
            date: that.data.date,
          })
          wx.showToast({
            title: '删除成功！',
          })
        } else if (res.data.res == "not existed"){
          wx.showToast({
            title: 'Opps~课件丢啦~',
          })
        } else{
          wx.showModal({
            title: '提示',
            content: '数据错误',
            showCancel: false,
          })
        }
      }
    })
  },

  tapDeleteClass: function () {
    let that = this
    if (that.data.usrInfo[4] != 9) {
      wx.showModal({
        title: '提示',
        content: '小可爱你没有此权限哦~',
        showCancel: false,
      })
      return
    }

    wx.showModal({
      title: '提示',
      content: '确定要删除班级吗？',
      success: function(res){
        if (res.confirm){
          wx.request({
            url: 'https://www.abceea.com/test',
            data: {
              type: "1510",
              usrId: that.data.usrInfo[0],
              classId: that.data.usrInfo[1],
            },
            success: function (res) {
              console.log("1510: ", res)
              if (res.data.res == "deleted") {
                wx.showModal({
                  title: '提示',
                  content: 'Opps~班级已经被解散啦~',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      wx.reLaunch({
                        url: '../class/class',
                      })
                    }
                  }
                })
              } else if (res.data.res == "success") {
                wx.showModal({
                  title: '提示',
                  content: '班级解散成功！',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      wx.reLaunch({
                        url: '../class/class',
                      })
                    }
                  }
                })
              } else {
                wx.showToast({
                  title: '错误',
                })
              }
            },
            fail: function (res) {
              console.log("1510: ", res)
            }
          })
        }
      }
    })
  },

  tapQuitClass: function () {
    console.log("tapQuitClass")
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定要退出班级吗？',
      success: function (res) {
        if (res.confirm) {
          https1.modifyClassUsrStatus({
            usrId: app.globalData.miniId,
            classUsrId: app.globalData.miniId,
            classId: that.data.classId,
            status: 3,
            level: 0,
            that: that,
          })
          wx.reLaunch({
            url: '../class/class',
          })
        }
      },
    })
  },

  tapUploadORcode: function () {
    console.log("tapUploadORcode")
    let that = this
    var classId = that.data.classId 
    wx.navigateTo({
      url: '../addClassORcode/addClassORcode?classId=' + classId,
    })
  },

  tapCheckORcode: function () {
    console.log("tapCheckORcode")
    let that = this
    var classId = that.data.classId
    var imageSrc = "https://www.abceea.com/static/group/"+classId + "/o"
    wx.previewImage({
      urls: [imageSrc],
      success: function(res) {
        console.log(res)
      },
      fail: function(res) {
        console.log(res)
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
    let that = this
    that.onLoad({
      id: that.data.classId,
      select: that.data.titleSelected,
      sub: that.data.memberTitleSelected,
      loadType: 1,
    })
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
    var url = "/pages/oneClass/oneClass?"
      + "id=" + that.data.classId 
      + "&select=" + that.data.titleSelected 
      + "&sub=" + that.data.memberTitleSelected 
      + "&loadType=2" 

    var imageUrl = "https://www.abceea.com/static/others/classShare.png"
    var title = that.data.name + '(' + that.data.accent + ')' + '：小伙伴快来加入吧~' 

    console.log("url:", url)
    return {
      title: title,
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
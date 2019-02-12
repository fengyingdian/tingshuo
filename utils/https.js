const util = require('./util.js')
const downMgr = require('./downMgr.js')
const app = getApp()

const login = param =>{
  wx.login({
    success: res => {
      wx.request({
        url: 'https://www.abceea.com/test',
        data: {
          type: 1000,
          code: res.code
        },
        success: function (resData) {
          console.log("1000 1", resData)
          param.globalData.miniId = resData.data.miniId
          param.globalData.userInfo = resData.data.userInfo
          if (param.miniIdReadyCallback) {
            param.miniIdReadyCallback(resData)
          }
        },
        fail: function (resData) {
          wx.showToast({
            title: '网络错误',
          })
          console.log("1000 2", resData)
        },
      })
    }
  })
}

const getUserInfo = param =>{
  if (param.app.globalData.miniId > 0) {
    wx.request({
      url: 'https://www.abceea.com/test',
      data: {
        type: 1001,
        usrId: param.app.globalData.miniId,
        id: param.app.globalData.miniId,
        nickName: param.app.globalData.userInfo.nickName,
        gender: param.app.globalData.userInfo.gender,
        city: param.app.globalData.userInfo.city,
        province: param.app.globalData.userInfo.province,
        country: param.app.globalData.userInfo.country,
        language: param.app.globalData.userInfo.language,
        imageSrc: param.app.globalData.userInfo.imageSrc,
      },
      success: function (res) {
        console.log("res:", res)
        if (res.data["res"] == "success") {
          //wx.showToast({
          //  title: '授权成功',
          //})
          console.log("1001: modifyUsr: ", param.app.globalData.userInfo)
          wx.navigateTo({
            url: param.url,
          })
        } else {
          //wx.showToast({
          //  title: '授权失败',
          //})
        }
        if (param.app.getUserInfoReadyCallback) {
          param.app.getUserInfoReadyCallback()
        }
      },
      fail: function (e) {
        console.log("1001: fail: ", e)
        wx.showToast({
          title: '网络错误',
        })
      }
    })
  } else {
    wx.login({
      success: res => {
        console.log("loginCode:", res.code)
        wx.request({
          url: 'https://www.abceea.com/test',
          data: {
            type: 1002,
            code: res.code,
            usrId: param.app.globalData.miniId,
            id: param.app.globalData.miniId,
            nickName: param.app.globalData.userInfo.nickName,
            gender: param.app.globalData.userInfo.gender,
            city: param.app.globalData.userInfo.city,
            province: param.app.globalData.userInfo.province,
            country: param.app.globalData.userInfo.country,
            language: param.app.globalData.userInfo.language,
            imageSrc: param.app.globalData.userInfo.imageSrc,
          },
          success: function (resData) {
            if (resData.data["res"] == "success") {
              wx.showToast({
                title: '授权成功',
              })
              console.log("1002", resData)
              param.app.globalData.miniId = resData.data.miniId
              param.app.globalData.userInfo = resData.data.userInfo
              param.that.setData({
                miniId: util.formatNumber09(param.app.globalData.miniId),
                userInfo: param.app.globalData.userInfo,
              })
            }else{
              wx.showToast({
                title: '授权失败',
              })
            }
          },
          fail: function (resData) {
            wx.showToast({
              title: '网络错误',
            })
            console.log("1000 2", resData)
          },
        })
      }
    })
  }
}

const getCourse = param => {
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: "0001",
      usrId: param.data.miniId, //用来检验是否有权限查看所有课件
    },
    success: function (res) {
      console.log("0001: ", res)
      if (res.data.res == "success"){
        var courseTitles = res.data.courseTitles
        if (res.data.hasOwnProperty("topShows")) {
          console.log("res.data.hasOwnProperty(topShows): ture:", res.data.topShows)
          param.that.setData({
            topShows: res.data.topShows
          })
        } else {
          console.log("res.data.hasOwnProperty(topShows): false")
        }
        param.that.setData({
          courseTitles: courseTitles,
          courseTitlesSelect: 0,
          courseSubTitles: courseTitles[0].subTitles,
          courseSubTitlesSelect: 0,
          calendar: courseTitles[0].subTitles[0].calendar,
          courses: courseTitles[0].subTitles[0].data.reverse(),
        })
        param.that.setData({
          showPage: true,
        })
        wx.hideLoading()
      }else{
        console.log("0001: ", res)
        wx.showToast({
          title: '未知错误',
        })
      }
    },
    fail: function (res) {
      console.log("0001: ", res)
      wx.showToast({
        title: '网络错误',
      })
    }
  })
}

const activeCourseDay = param => {
  const currentYear = param.year
  const currentMonth = param.month
  const punches = param.that.data.punches
  const length = punches.length
  var courseData = []
  for (var i = 0; i < length; i++) {
    var date = punches[i][1]
    var year = parseInt(date.slice(0, 4))
    if (year != currentYear) {
      continue
    }
    var month = parseInt(date.slice(4, 6))
    if (month == currentMonth) {
      courseData.push({
        month: "current",
        day: parseInt(date.slice(6, 8)),
        color: "black",
        background: "rgb(194,253,233)",
      })
    }
  }
  param.that.setData({
    courseData: courseData,
  })
}

const applyRole = param => {
  console.log("param:", param)
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: 1400,
      usrId: param.usrId,
      role: param.role,
      code: param.code,
    },
    success: function (res) {
      console.log("C: ", res)
      if (res.data.res == "success"){
        wx.showToast({
          title: '注册成功',
        })
        param.that.setData({
          showType: 0
        })
      }else{
        wx.showToast({
          title: '注册失败',
        })
      }
    },
    fail: function (res) {
      console.log("1400: ", res)
    }
  })
}

const applyVIPClass = param => {
  console.log("param:", param)
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: 1502,
      usrId: param.usrId,
      classType: param.select,
    },
    success: function (res) {
      console.log("1502: ", res)
      if (res.data.res == "success") {
        wx.showToast({
          title: '进入班级成功',
        })
        param.that.setData({
          showType: 0,
        })
        var date = new Date()
        date.setDate(date.getDate() + 1)
        var curDate = util.dateDir(date)
        wx.navigateTo({
          url: '../punchClock/punchClock' + "?date=" + curDate + "&class=" + "VIPTrain"
        })
      } else {
        wx.showToast({
          title: '进入班级失败',
        })
      }
    },
    fail: function (res) {
      console.log("1502: ", res)
    }
  })
}

const getCoursePunches = param => {
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: 1105,
      date: param.date,
      usrId: param.usrId,
      class: param.class,
    },
    success: function (res) {
      console.log("1105: ", res)
      if (res.data.res == "success") {
        getCoursePunchesSuccess({
          data: res.data,
          that: param.that,
          usrId: param.usrId,
          class: param.class,
        })

        if (param.onLoad == 2) {
          if (param.that.getCoursePunchesRefreshCallback) {
            param.that.getCoursePunchesRefreshCallback(res)
          }
          return
        }

        var dateName = param.date.substr(0, 4) + "-" + param.date.substr(4, 2) + "-"  + param.date.substr(6, 2) 

        param.that.setData({
          dateName: dateName,
          date: param.date,
          content: res.data.courseData[2],
          audioSrc: res.data.courseData[4],
          hasVideo: res.data.courseData[5],
          courseId: res.data.courseData[10],
        })
        
        if (res.data.usrGrade == []) {
          param.that.setData({
            role: "None"
          })
        } else {
          param.that.setData({
            role: res.data.usrGrade[1]
          })
        }

        //是否有缓存
        var dataStorageSync = wx.getStorageSync("EverydayEnglishDateVideo" + param.date)
        console.log("dataStorageSync: ", dataStorageSync)
        if (dataStorageSync){
          param.that.setData({
            videoSrc: dataStorageSync,
          })
          if (param.onLoad == 1) {
            if (param.that.getCoursePunchesReadyCallback) {
              param.that.getCoursePunchesReadyCallback(res)
            }
          }
          return
        }

        //下载开始
        let urls = new Map() 
        //if (res.data.courseData[5] == "yes"){
        //  urls.set("video", "https://www.abceea.com/static/class/" + param.date+"/a.mp4")
        //}

        if (urls.size > 0){
          console.log("下载开始", urls)
          downMgr.downLoadFiles({
            urls: urls,
            that: param.that,
            success: function (resDown) {
              console.log("downMgr.downLoadFiles: ", resDown)
              param.that.setData({
                videoSrc: resDown["video"],
              })
              try {
                wx.setStorageSync("EverydayEnglishDateVideo" + param.date, resDown["video"])
              } catch (e) {
                console.log("setStorageSync fail: ", e)
              }

              if (param.onLoad == 1) {
                if (param.that.getCoursePunchesReadyCallback) {
                  param.that.getCoursePunchesReadyCallback(res)
                }
              }
            },
            fail: function (e) {
            }
          })
        }else{
          param.that.setData({
            videoSrc: "https://www.abceea.com/static/class/" + param.date + "/a.mp4",
          })
          if (param.onLoad == 1) {
            if (param.that.getCoursePunchesReadyCallback) {
              param.that.getCoursePunchesReadyCallback(res)
            }
          } 
        }
      }else{
        wx.showToast({
          title: '课件错误',
        })
      }
    }
  })
}

const getCoursePunchesSuccess = param => {
  var data = param.data
  console.log("getCoursePunchesSuccess:", data)
  var date = data.courseData[1]
  if (data) {
    var punchData = data.punchData
    var myPunch = null
    if (typeof punchData != "string") {
      //循环一遍刷选出老师点评，班长点评，是否纠助点评过
      for (var i = 0; i < punchData.length; i++) {
        //param.urls.set("punch" + punchData[i]["punchId"], "https://www.abceea.com/static/class/" + date + "/" + punchData[i]["punchId"] + "/punch.m4a")
        punchData[i]["index"] = util.formatNumber02(i+1)
        if (punchData[i].comments != "None") {
          //是否老师点评过
          var b1 = false
          //是否班长点评过
          var b2 = false
          //是否纠助点评过
          var b3 = false
          //
          for (var j = 0; j < punchData[i].comments.length; j++) {
            if ((punchData[i].comments[j].role == "teacher" ||
                 punchData[i].comments[j].role == "professor") && b1 == false){
              b1 = true
            }
            if (punchData[i].comments[j].role == "monitor" && b2 == false) {
              b2 = true
            }
            if (punchData[i].comments[j].role == "monitorAssistant" && b3 == false) {
              b3 = true
            }
          }
          if (b1 == true) { 
            punchData[i]["TCC"] = 1
          }else{
            punchData[i]["TCC"] = 0
          }
          if (b2 == true) { 
            punchData[i]["MOC"] = 1
          }else{
            punchData[i]["MOC"] = 0
          }
          if (b3 == true) {
            punchData[i]["MAC"] = 1 
          }else{
            punchData[i]["MAC"] = 0
          }
        }else{
          punchData[i]["TCC"] = 0
          punchData[i]["MOC"] = 0
          punchData[i]["MAC"] = 0
        }
        punchData[i]["scoreColor"] = getScoreColor(punchData[i]["score"])

        //我是不是已经打卡
        if (punchData[i].usrId == param.usrId) {
          myPunch = punchData[i]
          console.log("myPunch: ", punchData[i])
        }
      }
    }
    console.log("punchData: ", punchData)
    
    //发音示范
    var teacherPunches = []
    //已阅
    var hasCommented = []
    //未阅
    var notCommented = []
    if (typeof punchData != "string") {
      for (var i = 0; i < punchData.length; i++) {
        //老师的打卡
        if (punchData[i].role == "teacher" || punchData[i].role == "professor") {
          teacherPunches.push(punchData[i])
        }

        //循环一遍刷选出我的点评和未点评
        if (punchData[i].comments != "None") {
          for (var j = 0; j < punchData[i].comments.length; j++) {
            if (punchData[i].comments[j].usrId == param.usrId) {
              hasCommented.push(punchData[i])
              break
            }
          }
          if (j == punchData[i].comments.length) {
            notCommented.push(punchData[i])
          }
        }else{
          notCommented.push(punchData[i])
        }
      }
    }

    console.log("teacherPunches: ", teacherPunches)  
    console.log("hasCommented: ", hasCommented)
    console.log("notCommented: ", notCommented)

    var records = [{ title: "全部", data: punchData },
      { title: "示范", data: teacherPunches },
    { title: "已评", data: hasCommented },
    { title: "未评", data: notCommented }]

    param.that.setData({
      records: records,
      punches: punchData,
      punchTitle: "全部",
      punchSize: punchData.length,
      select: 0,
    })

    param.that.setData({
      myPunch: myPunch,
    })
  }
}

const getScoreColor = score =>  {
  var num = parseFloat(score)
  if (num < 6) {
    return 'rgb(237,28,36)'
  } else if (num < 7.8) {
    return 'rgb(255,127,39)'
  } else if (num < 9) {
    return 'rgb(255,201,14)'
  } else {
    return 'rgb(34,177,76)'
  }
}

const getPunchComments = param => {
  console.log("param: ", param)
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: 1304,
      date: param.date,
      punchId: param.punchId,
      usrId: param.usrId,
    },
    success: function (res) {
      console.log("1304: ", res)
      if (res.data.res == "success") {
        var canShowAudioText = false
        if (res.data.usr.audioText != "-" && res.data.usr.audioText != ""){
          canShowAudioText = true
        }
        param.that.setData({
          profile: res.data.usr,
          showAudioText: false,
          canShowAudioText: canShowAudioText,
        })

        let urlsPunch = new Map()
        var key = "EverydayEnglishDatePunch" + param.punchId.toString()
        var value = wx.getStorageSync(key)
        if (value)
        {
          var punchContent = value["punch"]
          if (punchContent){
            res.data.usr.audio = punchContent
          }
          
          if (typeof res.data.commentData != "string") {
            var commentData = res.data.commentData
            for (var i = 0; i < commentData.length; i++) {
              commentData[i]["canDelete"] = false
              commentData[i]["expand"] = false
              commentData[i]["expandImage"] = "../image/button/expand.png"
              commentData[i]["showText"] = false
              commentData[i]["showTextTitle"] = "转文字"
              commentData[i]["showTextContent"] = false
              if (commentData[i]["usrId"] == param.usrId) {
                commentData[i]["canDelete"] = true
              }
              commentData[i]["showToUsr"] = true
              if (commentData[i]["toUsrId"] == res.data.usr.usrId || commentData[i]["toUsrId"] == 0) {
                commentData[i]["showToUsr"] = false
              }
              if (commentData[i].contentType > 1) {
                commentData[i]["imagePlay"] = "../image/button/playGreen.png"
                commentData[i]["second"] = -1
                if (commentData[i]["contentText"] != "-") {
                  commentData[i]["showText"] = true
                }
                var oneComment = value[commentData[i]["commentId"]] 
                if (oneComment){
                  commentData[i]["content"] = oneComment 
                }else{
                  urlsPunch.set(commentData[i]["commentId"], commentData[i]["content"])
                }
              }
            }
          }
        }else{
          urlsPunch.set("punch", "https://www.abceea.com/static/class/" + param.date + "/" + param.punchId.toString() + "/punch.m4a")
          if (typeof res.data.commentData != "string") {
            var commentData = res.data.commentData
            for (var i = 0; i < commentData.length; i++) {
              commentData[i]["canDelete"] = false
              commentData[i]["expand"] = false
              commentData[i]["expandImage"] = "../image/button/expand.png"
              commentData[i]["showText"] = false
              commentData[i]["showTextTitle"] = "转文字"
              commentData[i]["showTextContent"] = false
              if (commentData[i]["usrId"] == param.usrId) {
                commentData[i]["canDelete"] = true
              }
              commentData[i]["showToUsr"] = true
              if (commentData[i]["toUsrId"] == res.data.usr.usrId || commentData[i]["toUsrId"] == 0) {
                commentData[i]["showToUsr"] = false
              }
              if (commentData[i].contentType > 1) {
                if (commentData[i]["contentText"] != "-") {
                  commentData[i]["showText"] = true
                }
                commentData[i]["imagePlay"] = "../image/button/playGreen.png"
                commentData[i]["second"] = -1
                urlsPunch.set(commentData[i]["commentId"], commentData[i]["content"])
              }
            }
          }
        }

        if (urlsPunch.size > 0){
          downMgr.downLoadFiles({
            urls: urlsPunch,
            that: param.that,
            success: function (resDown) {
              console.log("downMgr.getPunchComments1: ", resDown)
              var resPunch = resDown["punch"]
              if (resPunch){
                res.data.usr.audio = resPunch
              }
              var saveData = {
                "punch": res.data.usr.audio,
              } 
              if (typeof res.data.commentData != "string") {
                var commentData = res.data.commentData
                for (var i = 0; i < commentData.length; i++) {
                  if (commentData[i].contentType > 1) { 
                    var commentId = commentData[i]["commentId"]
                    var temp = resDown[commentId]
                    if (temp){
                      commentData[i]["content"] = temp 
                    }
                    saveData[commentId] = commentData[i]["content"]
                  }
                }
              }
              param.that.setData({
                comments: commentData,
              })
              try {
                wx.setStorageSync(key, saveData)
              } catch (e) {
                console.log("setStorageSync fail: ", e)
              }
              if (param.onLoad == 1) {
                if (param.that.gePunchCommentsReadyCallback) {
                  param.that.gePunchCommentsReadyCallback(res)
                }
              } else if (param.onLoad == 2) {
                if (param.that.getPunchCommentsRefreshCallback) {
                  param.that.getPunchCommentsRefreshCallback(res)
                }
              }
            },
            fail: function (e) {
            }
          })
        }else{
          var punchContent = value["punch"]
          if (!punchContent) {
            wx.showToast({
              title: '读取错误！',
            })
          }

          var saveData = {
            "punch": punchContent,
          }

          if (typeof res.data.commentData != "string") {
            var commentData = res.data.commentData
            for (var i = 0; i < commentData.length; i++) {
              if (commentData[i].contentType > 1) {
                var commentId = commentData[i]["commentId"]
                var oneComment = value[commentId]
                if (oneComment) {
                  commentData[i]["content"] = oneComment
                }
                saveData[commentId] = commentData[i]["content"]
              }
            }
          }

          param.that.setData({
            comments: commentData,
          })

          try {
            wx.setStorageSync(key, saveData)
          } catch (e) {
            console.log("setStorageSync fail: ", e)
          }

          if (param.onLoad == 1) {
            if (param.that.gePunchCommentsReadyCallback) {
              param.that.gePunchCommentsReadyCallback(res)
            }
          } else if (param.onLoad == 2) {
            if (param.that.getPunchCommentsRefreshCallback) {
              param.that.getPunchCommentsRefreshCallback(res)
            }
          }
        }
      } else if (res.data.res == "deleted") {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '该打卡已经被删除，请返回刷新',
          success: function (res) {
            if (param.loadType == 1){
              wx.navigateBack({
                delta: 1
              })
            } else if (param.loadType == 2) {
              wx.reLaunch({
                url: '../punchClock/punchClock?date=' + param.date 
                + '&classType=' + param.classType + '&loadType='+param.loadType,
              })
            }
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '打卡错误',
        })
      }
    }
  })
}

const getPunchCommentsSuccess = param => {
  let urlsPunch = new Map()
  var key = "EverydayEnglishDatePunch" + param.punchId.toString()
  var value = wx.getStorageSync(key)
  if (value) {
    if (typeof param.data.commentData != "string") {
      var commentData = param.data.commentData
      for (var i = 0; i < commentData.length; i++) {
        commentData[i]["canDelete"] = false
        commentData[i]["expand"] = false
        commentData[i]["expandImage"] = "../image/button/expand.png"
        commentData[i]["showText"] = false
        commentData[i]["showTextTitle"] = "转文字"
        commentData[i]["showTextContent"] = false
        if (commentData[i]["usrId"] == param.usrId) {
          commentData[i]["canDelete"] = true
        }
        commentData[i]["showToUsr"] = true
        if (commentData[i]["toUsrId"] == param.punchHostId || commentData[i]["toUsrId"]==0) {
          commentData[i]["showToUsr"] = false
        }
        if (commentData[i].contentType > 1) {
          commentData[i]["imagePlay"] = "../image/button/playGreen.png"
          commentData[i]["second"] = -1
          if (commentData[i]["contentText"] != "-"){
            commentData[i]["showText"] = true
          }
          var oneComment = value[commentData[i]["commentId"]]
          if (oneComment) {
            commentData[i]["content"] = oneComment
          } else {
            urlsPunch.set(commentData[i]["commentId"], commentData[i]["content"])
          }
        }
      }
    }
  } else {
    wx.showToast({
      title: '刷新错误！',
    })
  }

  if (urlsPunch.size > 0) {
    downMgr.downLoadFiles({
      urls: urlsPunch,
      that: param.that,
      success: function (resDown) {
        console.log("downMgr.getPunchComments1: ", resDown)
        var punchContent = value["punch"]
        if (!punchContent) {
          wx.showToast({
            title: '读取错误！',
          })
        }
        var saveData = {
          "punch": punchContent,
        }

        if (typeof param.data.commentData != "string") {
          var commentData = param.data.commentData
          for (var i = 0; i < commentData.length; i++) {
            if (commentData[i].contentType > 1) {
              var commentId = commentData[i]["commentId"]
              var temp = resDown[commentId]
              if (temp) {
                commentData[i]["content"] = temp
              }
              saveData[commentId] = commentData[i]["content"]
            }
          }
        }
        param.that.setData({
          comments: commentData,
        })
        try {
          wx.setStorageSync(key, saveData)
        } catch (e) {
          console.log("setStorageSync fail: ", e)
        }

        wx.hideLoading()
        param.that.setData({
          showPage: true,
        })
        if (param.callback == 1){
          if (param.that.getPunchCommentsVoiceCallback) {
            param.that.getPunchCommentsVoiceCallback()
          }
        } else if (param.callback == 2){
          if (param.that.getPunchCommentsTextCallback) {
            param.that.getPunchCommentsTextCallback()
          }
        }
      },
      fail: function (e) {
      }
    })
  } else {
    var punchContent = value["punch"]
    if (!punchContent) {
      wx.showToast({
        title: '读取错误！',
      })
    }

    var saveData = {
      "punch": punchContent,
    }

    if (typeof param.data.commentData != "string") {
      var commentData = param.data.commentData
      for (var i = 0; i < commentData.length; i++) {
        if (commentData[i].contentType > 1) {
          var commentId = commentData[i]["commentId"]
          var oneComment = value[commentId]
          if (oneComment) {
            commentData[i]["content"] = oneComment
          }
          saveData[commentId] = commentData[i]["content"]
        }
      }
    }
    param.that.setData({
      comments: commentData,
    })

    try {
      wx.setStorageSync(key, saveData)
    } catch (e) {
      console.log("setStorageSync fail: ", e)
    }

    wx.hideLoading()
    param.that.setData({
      showPage: true,
    })

    if (param.callback == 1) {
      if (param.that.getPunchCommentsVoiceCallback) {
        param.that.getPunchCommentsVoiceCallback()
      }
    } else if (param.callback == 2) {
      if (param.that.getPunchCommentsTextCallback) {
        param.that.getPunchCommentsTextCallback()
      }
    }
  }
}

const saveFormId = param =>{
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: 9002,
      usrId: param.usrId, 
      formId: param.formId,
    },
    success: function (res) {
      console.log("9002: ", res)
    },
    fail: function (res) {
      console.log("9002: ", res)
    }
  }) 
}

module.exports = {
  login: login,
  getUserInfo: getUserInfo,
  getCourse: getCourse,
  applyRole: applyRole,
  applyVIPClass: applyVIPClass, 
  saveFormId: saveFormId,
  getCoursePunches: getCoursePunches,
  getCoursePunchesSuccess: getCoursePunchesSuccess,
  getPunchComments: getPunchComments,
  getPunchCommentsSuccess: getPunchCommentsSuccess,
  activeCourseDay: activeCourseDay,
}

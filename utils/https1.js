const util = require('./util.js')
const downMgr = require('./downMgr.js')

const getClass = param => {
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: "0002",
      usrId: param.usrId,
    },
    success: function (res) {
      console.log("0002: ", res)
      if (res.data.res == "success") {
        var classes = res.data.calsses
        if (res.data.hasOwnProperty("topShows")) {
          console.log("res.data.hasOwnProperty(topShows): ture:", res.data.topShows)
          if (res.data.topShows != []) {
            param.that.setData({
              topShows: res.data.topShows
            })
          }
        } else {
          console.log("res.data.hasOwnProperty(topShows): false")
        }
        param.that.setData({
          classes: classes,
        })
        analyseClasses({
          classes: classes,
          usrId: param.usrId,
          that: param.that,
        })

        param.that.setData({
          showPage: true,
        })
        wx.hideLoading()
      } else {
        console.log("0002: ", res)
        wx.showToast({
          title: '错误1！',
        })
      }
    },
    fail: function (res) {
      console.log("0002: ", res)
      wx.showToast({
        title: '错误2！',
      })
    }
  })
}

const analyseClasses = param => {
  var classes = param.classes
  var usrId = param.usrId
  var myClass = []
  for (var i = 0; i < classes.length; i++){
    var classInfo = classes[i].classInfo
    if (classInfo[10] == usrId){
      var temp = classes[i]
      if (temp.classInfo[1].length > 8){
        temp.classInfo[1] = temp.classInfo[1].substring(0,8)+"..."
      }
      temp.classInfo.push("创始人")
      temp.classInfo.push("rgb(255,127,39)")
      myClass.push(temp)
      continue
    }
    var classUsrs = classes[i].classUsrs
    for (var j=0; j<classUsrs.length; j++){
      var oneUsr = classUsrs[j]
      if (oneUsr[0] == usrId){
        var temp = classes[i]
        if (temp.classInfo[1].length > 8) {
          temp.classInfo[1] = temp.classInfo[1].substring(0, 8) + "..."
        }
        temp.classInfo.push("参与中")
        temp.classInfo.push("rgb(4, 190, 1)")
        myClass.push(temp)
        break
      }
    }
  }
  if (myClass.length > 0){
    param.that.setData({
      myClass: myClass,
    })    
  }else{
    param.that.setData({
      myClass: false,
    })   
  }
  console.log("myClass: ", myClass)
}

const getClasses = param => {
  console.log("param:", param)
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: 1501,
      usrId: param.usrId,
    },
    success: function (res) {
      console.log("1501: ", res)
      if (param.that.getClassReadyCallback) {
        param.that.getClassReadyCallback(res)
      }
    },
    fail: function (res) {
      console.log("1501: ", res)
    }
  })
}

const getClassData = param => {
  console.log("getClassData: ", param)
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: 1506,
      usrId: param.usrId,
      classId: param.classId,
      loadType: param.loadType,
    },
    success: function (res) {
      console.log("1506: ", res)
      if (res.data.res == "success"){
        param.that.setData({
          classInfo: res.data.classInfo,
          classUsrs: res.data.classUsrs,
          usrInfo: res.data.usrInfo,
          courseDatas: res.data.courseDatas.reverse(),
        })

        param.that.setData({
          name: res.data.classInfo[1],
          classId: res.data.classInfo[5],
          accent: param.that.data.accents[res.data.classInfo[2] - 1],
          admittance: param.that.data.admittances[res.data.classInfo[7]],
          tempClassImageSrc: "https://www.abceea.com/static/group/" + res.data.classInfo[5].toString() + "/c",
          punchLimit: res.data.classInfo[8],
        })

        var date = util.formatDate(new Date())
        setPunchList({
          that: param.that,
          date: date,
        })
        param.that.setData({
          titleSelected: param.select,
          memberTitleSelected: param.sub,
          showPage: true,
          classId: param.classId,
        })
        var memberIn = []
        var memberWait = []
        var memberOut = []
        for (var i = 0; i < res.data.classUsrs.length; i++){
          var temp = res.data.classUsrs[i]
          if (temp[5] == 1){
            memberIn.push(temp)
          } else if (temp[5] == 2){
            memberWait.push(temp)
          } else if (temp[5] == 0) {
            memberOut.push(temp)
          }
        }
        param.that.setData({
          memberIn: memberIn,
          memberWait: memberWait,
          memberOut: memberOut,
          memberLimit: res.data.classInfo[3],
          memberCount: memberIn.length,
        })
        if (param.that.data.memberTitleSelected == 0) {
          param.that.setData({
            members: param.that.data.memberIn
          })
        } else if (param.that.data.memberTitleSelected == 1) {
          param.that.setData({
            members: param.that.data.memberWait
          })
        } else if (param.that.data.memberTitleSelected == 2) {
          param.that.setData({
            members: param.that.data.memberOut
          })
        }
        wx.setNavigationBarTitle({
          title: res.data.classInfo[1]
        })
        if (param.that.data.usrInfo[4] == 9){
          param.that.setData({
            setting: param.that.data.setting1
          })
        }else{
          param.that.setData({
            setting: param.that.data.setting2
          })
        }
        wx.hideLoading()
      } else if (res.data.res == "tickOff"){
        wx.showModal({
          title: '提示',
          content: '小可爱你之前已经被淘汰过啦',
          showCancel: false,
          success: function(){
            wx.reLaunch({
              url: '../class/class',
            })
          }
        })
      } else if (res.data.res == "no") {
        wx.showModal({
          title: '提示',
          content: '小可爱该班级需要先申请哦',
          showCancel: false,
          success: function () {
            wx.reLaunch({
              url: '../classInfo/classInfo?id=' + param.classId,
            })
          }
        })
      }else{
        wx.showToast({
          title: '进入班级失败',
        })
      }
    },
    fail: function (res) {
      console.log("1506: ", res)
      wx.showToast({
        title: '网络错误',
      })
    },
  })
}

const setPunchList = param => {
  console.log("setPunchList: ", param)
  let that = param.that
  var date = param.date
  that.setData({
    date: date,
  })
  var courses = that.data.courseDatas
  if (courses.length < 1) {
    that.setData({
      showTips: "Opps~还没有同学打卡哦~",
      punchList: null
    })
  }
  var punchList = []
  for (var i = 0; i < courses.length; i++) {
    if (courses[i].courseData[18] == date) {
      punchList.push(courses[i])
    }
  }
  if (punchList.length < 1) {
    that.setData({
      showTips: "Opps~今天还没有同学打卡哦~",
      punchList: null
    })
  } else {
    that.setData({
      punchList: punchList,
    })
  }
}

const modifyClassUsrStatus = param => {
  console.log("modifyClassUsrStatus: ", param)
  var date = util.formatPreDate(new Date())
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: "1508",
      usrId: param.usrId,
      classUsrId: param.classUsrId,
      classId: param.classId,
      status: param.status,
      level: param.level,
    },
    success: function (res) {
      console.log("1508: ", res)
      if (res.data.res == "success") {
        var memberIn = []
        var memberWait = []
        var memberOut = []
        for (var i = 0; i < res.data.classUsrs.length; i++) {
          var temp = res.data.classUsrs[i]
          if (temp[5] == 1) {
            memberIn.push(temp)
          } else if (temp[5] == 2) {
            memberWait.push(temp)
          } else if (temp[5] == 0) {
            memberOut.push(temp)
          }
        }
        param.that.setData({
          memberIn: memberIn,
          memberWait: memberWait,
          memberOut: memberOut,
          memberCount: memberIn.length,
        })
        if (param.that.data.memberTitleSelected == 0) {
          param.that.setData({
            members: param.that.data.memberIn
          })
        } else if (param.that.data.memberTitleSelected == 1) {
          param.that.setData({
            members: param.that.data.memberWait
          })
        } else if (param.that.data.memberTitleSelected == 2) {
          param.that.setData({
            members: param.that.data.memberOut
          })
        }
      } else {
        console.log("1508: ", res)
        wx.showToast({
          title: '操作失败',
        })
      }
    },
    fail: function (res) {
      console.log("1508: ", res)
    },
  })
}

const getRankData = param => {
  console.log("getRnakData: ", param)
  var curDate = new Date()
  var preDate = new Date(curDate.getTime() - 24 * 60 * 60 * 1000)
  var date = util.formatDate(preDate)
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: "0005",
      usrId: param.usrId,
      date: date,
    },
    success: function (res) {
      console.log("0005: ", res)
      if (res.data.res == "success") {
        param.that.setData({
          punchRank: res.data.punchRank,
          commentRank: res.data.commentRank,
        })
      }else{
        param.that.setData({
          showTips: "Opps~榜单跑路啦~"
        })
      }
      param.that.setData({
        showPage: true,
      })
      wx.hideLoading()
    },
    fail: function (res) {
      console.log("0005: ", res)
    },
  })
}

const getCanBookList = param => {
  console.log("getCanBookList: ", param)
  var date = util.formatPreDate(new Date())
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: "0003",
      usrId: param.usrId,
      date: date,
    },
    success: function (res) {
      console.log("0003: ", res)
      if (res.data.res == "success") {
        param.that.setData({
          canBookList: res.data.data,
          punchId: param.punchId,
        })
      } else {
        param.that.setData({
          canBookList: null,
          punchId: param.punchId,
          showTips: "Opps~没找到可点评的大佬呢~"
        })
      }
      param.that.setData({
        showPage: true,
      })
      wx.hideLoading()
    },
    fail: function (res) {
      console.log("0003: ", res)
    },
  })
}

module.exports = {
  getClass: getClass,
  getClasses: getClasses,
  analyseClasses: analyseClasses,
  getClassData: getClassData,
  modifyClassUsrStatus: modifyClassUsrStatus, 
  setPunchList: setPunchList,
  getRankData: getRankData,
  getCanBookList: getCanBookList,
}

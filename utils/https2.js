const util = require('./util.js')
const downMgr = require('./downMgr.js')

const getCourse = param => {
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: "0000",
      usrId: param.data.miniId, //用来检验是否有权限查看所有课件
    },
    success: function (res) {
      console.log("0000: ", res)
      if (res.data.res == "success"){
        var course = res.data.course[0].data.reverse().slice(0,4)
        var newCourse = []
        for (var i = 0; i < course.length;i++){
          var oneCourse = course[i]
          var date = oneCourse[1]
          var title = date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8) 
          oneCourse.push(title)
          newCourse.push(oneCourse)
        }
        param.that.setData({
          course: newCourse, 
          course1: res.data.course[1].data,
          course2: res.data.course[2].data,
        })
        wx.hideLoading()
        param.that.setData({
          showPage: true,
        })
      }else{
        console.log("0000: ", res)
        wx.showToast({
          title: '错误1！',
        })
      }
    },
    fail: function (res) {
      console.log("0000: ", res)
      wx.showToast({
        title: '错误2！',
      })
    }
  })
}

const getEveryday = param => {
  wx.request({
    url: 'https://www.abceea.com/test',
    data: {
      type: 1106,
      date: param.date,
      usrId: param.usrId,
      class: param.class,
    },
    success: function (res) {
      console.log("1106: ", res)
      if (res.data.res == "success") {
        param.that.setData({
          courseData: res.data.courseData,
          date: param.date,
          classType: param.class,
        })
        if (param.that.getEverydayCallback) {
          param.that.getEverydayCallback(res)
        }
      }else{
        wx.showToast({
          title: '未知错误',
        })
      }
    },
    fail: function(res) {
      wx.showToast({
        title: '网络错误',
      })
    }
  })
}

module.exports = {
  getCourse: getCourse,
  getEveryday: getEveryday,
}

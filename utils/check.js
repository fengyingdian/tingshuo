const checkUsr = param =>{
  if (param.miniId < 1) {
    wx.showToast({
      title: '您未正常登陆，请返回首页授权用户信息',
      icon: 'none',
      duration: 100000,
      success: function (res) {
        console.log("onReturnHome")
        wx.redirectTo({
          url: '../index/index'
        })
      },
      fail: function (res) {
        return
      }
    })
  }
}

module.exports = {
  checkUsr: checkUsr,

}
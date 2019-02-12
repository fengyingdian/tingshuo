// packageA/wxGroupInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  tapPreviewImage: function (option) {
    console.log("tapPreviewImage:", option)
    wx.previewImage({
      urls: [option.currentTarget.dataset.src]
    })
  },

  tapReturn: function (option) {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  tapSaveImage: function (option) {
    let that = this
    wx.getImageInfo({
      src: 'https://www.abceea.com/static/others/go_for_dreams_ORcode.jpg',
      success: function (res) {
        console.log(res)
        that.setData({
          image: res,
        })

        that.tapSave()
      }
    })
  },

  tapSave: function () {
    let that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.image.path,
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
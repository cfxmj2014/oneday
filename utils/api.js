const app = getApp()
const { ajaxData, href, text } = app.globalData.config

module.exports = {
  API: (ajaxData, callback) => {
    const reqData = ajaxData.data ? JSON.stringify(ajaxData.data) : JSON.stringify({})

    const data = {
      reqData: reqData,
    }

    wx.request({
      url: ajaxData.url,
      data: data,
      success: function (res) {
        console.log('res.data:', res.data)
        callback && callback(res.data)
      },
      fail: function(res) {
        wx.showToast({
          title: text.serverError,
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
}
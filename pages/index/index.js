const {API} = require('../../utils/api.js')

const app = getApp()
const { ajaxData, href, text } = app.globalData.config
const { screenWidth, screenHeight, pixelRatio} = wx.getSystemInfoSync()

Page({
  data: {
    topBgUrl: '',
    copyright: '',
    todayData: {},
    isCopyrightHidden: true
  },
  onLoad: function () {
    this.fetchImgData()
    this.fetchTodayData()
  },
  onReady: function () {
    setTimeout(() => {
      this.setData({
        isCopyrightHidden: false
      })
    }, 1000)
  },
  onShareAppMessage: function () {
    return {
      title: text.shareTitle,
      path: '/pages/index/index'
    }
  },
  fetchImgData: function() {
    API(ajaxData.getTopImg, data => {
      if (data.images.length > 0) {
        this.setData({
          topBgUrl: `http://s.cn.bing.net${data.images[0].url}`,
          copyright: data.images[0].copyright,
        })
      }
    })
  },
  fetchTodayData: function() {
    API(ajaxData.today, data => {
      if (data) {
        try {
          const slogan = wx.getStorageSync('slogan')
          const suitable = wx.getStorageSync('suitable')
          const avoid = wx.getStorageSync('avoid')
          const time = wx.getStorageSync('time')
          // const testDate = wx.getStorageSync('testDate')

          if (time === data.time) {
            data.slogan = slogan
            data.suitable = suitable
            data.avoid = avoid
          }

          this.setData({
            todayData: data
          })
        } catch (e) {
          console.log(e)
        }

        try {
          wx.setStorageSync('slogan', data.slogan)
          wx.setStorageSync('suitable', data.suitable)
          wx.setStorageSync('avoid', data.avoid)
          wx.setStorageSync('time', data.time)
          // wx.setStorageSync('testDate', data.testDate)
        } catch (e) {
          console.log(e)
        }
      }

      // this.generalShareImg(this.data.todayData)
    })
  },
  bindImageTap: function() {
    wx.previewImage({
      urls: [this.data.topBgUrl],
    })
  },
  bindShareTap: function() {
    this.generalShareImg(this.data.todayData)
  },
  generalShareImg: function(data) {
    const ctx = wx.createCanvasContext('share-canvas', this)

    wx.showLoading({
      title: '生成图片中',
      mask: true
    })

    new Promise(resolve => {
      wx.getImageInfo({
        src: href.topImg,
        success: res => {
          ctx.drawImage(res.path, 0, 0, screenWidth, 210)
          resolve()
        }
      })
    }).then(() => new Promise(resolve => {
      ctx.rect(0, 210, screenWidth, 470)
      ctx.setFillStyle('#fff')
      ctx.fill()

      ctx.beginPath()
      ctx.rect(20, 156, screenWidth*0.893, 409)
      ctx.setFillStyle('#fff')
      ctx.setShadow(0, 5, 25, 'rgba(0, 42, 110, 0.15)')
      ctx.fill()

      ctx.setFontSize(15)
      ctx.setTextAlign('center')
      ctx.setFillStyle('#444')
      ctx.fillText(`${data.year}年${data.month}月`, screenWidth / 2, 195)

      ctx.setFontSize(12)
      ctx.setTextAlign('center')
      ctx.setFillStyle('#444')
      ctx.fillText(data.lunar, screenWidth / 2, 215)

      ctx.setFontSize(100)
      ctx.setTextAlign('center')
      ctx.setFillStyle('#444')
      ctx.fillText(data.day, screenWidth / 2, 315)

      ctx.setFontSize(15)
      ctx.setTextAlign('center')
      ctx.setFillStyle('#444')
      ctx.fillText(data.week, screenWidth / 2, 350)

      ctx.drawImage('/assets/quo-left.png', 45, 390, 11, 11)

      const lineNum = screenWidth > 320 ? 14 : 11

      if (data.slogan.length > lineNum) {
        const text1 = data.slogan.substring(0, lineNum)
        const text2Temp = data.slogan.substring(lineNum, data.slogan.length)
        const text2 = text2Temp.length > lineNum ? `${text2Temp.substring(0, lineNum)}...` : text2Temp

        ctx.setFontSize(17)
        ctx.setTextAlign('center')
        ctx.setFillStyle('#333')
        ctx.fillText(text1, screenWidth / 2, 405, 247)

        ctx.setFontSize(17)
        ctx.setTextAlign('center')
        ctx.setFillStyle('#333')
        ctx.fillText(text2, screenWidth / 2, 432, 247)
      } else {
        ctx.fillText(data.slogan, screenWidth / 2, 405, 247)
      }

      ctx.drawImage('/assets/quo-right.png', screenWidth * 0.85, 408, 11, 11)

      ctx.beginPath()
      ctx.rect(47.5, 465, screenWidth * 0.747, 1)
      ctx.setFillStyle('#C7C7C7')
      ctx.fill()

      ctx.beginPath()
      ctx.rect(47.5, 468, screenWidth * 0.747, 0.5)
      ctx.setFillStyle('#C7C7C7')
      ctx.fill()

      ctx.drawImage('/assets/yi-icon.png', 60, 492, 30, 30)

      ctx.beginPath()
      ctx.rect(100, 505, 4, 4)
      ctx.setFillStyle('#4B4B4B')
      ctx.fill()

      ctx.setFontSize(screenWidth > 320 ? 17 : 14)
      ctx.setFillStyle('#333')
      ctx.fillText(data.suitable, 110 + (data.suitable.length * 17) / 2, 513)

      ctx.drawImage('/assets/ji-icon.png', screenWidth > 320 ? 210 : 190, 492, 30, 30)

      ctx.beginPath()
      ctx.rect(screenWidth > 320 ? 250 : 230, 505, 4, 4)
      ctx.setFillStyle('#4B4B4B')
      ctx.fill()

      ctx.setFontSize(screenWidth > 320 ? 17 : 14)
      ctx.setFillStyle('#333')
      ctx.fillText(data.avoid, (screenWidth > 320 ? 260 : 235) + (data.avoid.length * 17) / 2, 513)

      ctx.drawImage('/assets/qrcode.png', screenWidth / 2 - 40, 575, 80, 80)

      ctx.setFontSize(12)
      ctx.setTextAlign('center')
      ctx.setFillStyle('#333')
      ctx.fillText(text.shareTitle2, screenWidth / 2, 670)

      ctx.draw()
  
      setTimeout(() => resolve(), 1000)
    })).then(() => {
      wx.hideLoading()

      wx.canvasToTempFilePath({
        canvasId: 'share-canvas',
        x: 0,
        y: 0,
        width: screenWidth,
        height: 736,
        success: res => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.showToast({
                title: '生成图片成功',
                duration: 2000
              })
            }
          })
        },
        fail: () => {
          wx.showToast({
            title: '生成图片失败',
            duration: 2000
          })
        }
      }, this)
    })
  }
})

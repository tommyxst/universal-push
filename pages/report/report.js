Page({
  data: {
    reportData: {}
  },

  onLoad(options) {
    if (options.data) {
      this.setData({
        reportData: JSON.parse(decodeURIComponent(options.data))
      })
    }
  },

  onShareAppMessage() {
    return {
      title: '我的神经激活报告',
      path: `/pages/report/report?data=${encodeURIComponent(JSON.stringify(this.data.reportData))}`,
      imageUrl: '/images/share-cover.png'
    }
  }
})

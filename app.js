App({
  onLaunch() {
    // 设置基础库版本
    if (wx.getSystemInfoSync().SDKVersion < '3.0.2') {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请升级到最新微信版本后重试。',
        showCancel: false
      })
    }
  },
  globalData: {
    userInfo: null,
    currentTask: null,
    taskList: []
  }
})

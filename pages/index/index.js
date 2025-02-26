// pages/index/index.js
const app = getApp()

Page({
  data: {
    tasks: [],
    showCreate: false,
    newTask: {
      title: '',
      pressure: 50
    }
  },

  onLoad() {
    // 从全局数据中获取任务列表
    this.setData({
      tasks: app.globalData.taskList.map(task => ({
        ...task,
        pressureColor: this.getPressureColor(task.pressure)
      }))
    })
  },

  // 显示创建面板
  showCreatePanel() {
    this.setData({
      showCreate: true,
      newTask: {
        title: '',
        pressure: 50
      }
    })
  },

  // 隐藏创建面板
  hideCreatePanel() {
    this.setData({
      showCreate: false
    })
  },

  // 监听标题输入
  onTitleInput(e) {
    this.setData({
      'newTask.title': e.detail.value
    })
  },

  // 创建新任务
  createTask() {
    const { title, pressure } = this.data.newTask
    if (!title.trim()) {
      wx.showToast({
        title: '请输入任务名称',
        icon: 'none'
      })
      return
    }

    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      pressure,
      pressureColor: this.getPressureColor(pressure)
    }

    // 更新全局和页面数据
    app.globalData.taskList.push(newTask)
    this.setData({
      tasks: [...this.data.tasks, newTask],
      showCreate: false
    })
  },

  // 跳转到任务详情
  goToDetail(e) {
    const taskId = e.currentTarget.dataset.id
    const task = this.data.tasks.find(t => t.id === taskId)
    if (task) {
      app.globalData.currentTask = task
      wx.navigateTo({
        url: '/pages/task-detail/task-detail'
      })
    }
  },

  // 根据压力值获取颜色
  getPressureColor(pressure) {
    if (pressure <= 30) return '#2ed573'
    if (pressure <= 70) return '#ffa502'
    return '#ff4757'
  }
})
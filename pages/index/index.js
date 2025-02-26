// pages/index/index.js
const app = getApp()

Page({
  data: {
    tasks: [],
    showCreate: false,
    newTask: {
      title: '',
      description: '',
      pressure: 50,
      dueDate: ''
    }
  },

  onLoad() {
    // 从本地存储获取任务列表
    const storedTasks = wx.getStorageSync('tasks') || [];
    app.globalData.taskList = storedTasks;
    
    this.setData({
      tasks: storedTasks.map(task => {
        const daysLeft = task.dueDate ? this.calculateDaysLeft(task.dueDate) : undefined;
        return {
          ...task,
          pressureColor: this.getPressureColor(task.pressure),
          daysLeft
        };
      })
    })
  },

  // 计算剩余天数
  calculateDaysLeft(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // 显示创建面板
  showCreatePanel() {
    this.setData({
      showCreate: true,
      newTask: {
        title: '',
        description: '',
        pressure: 50,
        dueDate: ''
      }
    })
  },

  // 监听标题输入
  onTitleInput(e) {
    const value = e.detail.value.slice(0, 50)
    this.setData({
      'newTask.title': value
    })
  },

  // 监听详情输入
  onDescriptionInput(e) {
    const value = e.detail.value.slice(0, 200)
    this.setData({
      'newTask.description': value
    })
  },

  // 监听日期选择
  onDateChange(e) {
    this.setData({
      'newTask.dueDate': e.detail.value
    })
  },

  // 创建新任务
  createTask() {
    const { title, description, pressure, dueDate } = this.data.newTask
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
      description: description.trim(),
      pressure,
      dueDate,
      pressureColor: this.getPressureColor(pressure),
      daysLeft: dueDate ? this.calculateDaysLeft(dueDate) : undefined
    }

    // 更新全局数据、本地存储和页面数据
    const updatedTasks = [...app.globalData.taskList, newTask];
    app.globalData.taskList = updatedTasks;
    wx.setStorageSync('tasks', updatedTasks);
    
    this.setData({
      tasks: [...this.data.tasks, newTask],
      showCreate: false
    })
  },

  // 隐藏创建面板
  hideCreatePanel() {
    this.setData({
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
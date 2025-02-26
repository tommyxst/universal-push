// pages/index/index.js
const app = getApp()

Page({
  data: {
    tasks: [],
    showCreate: false,
    newTask: {
      title: '',
      description: '',
      pressure: 0,
      dueDate: ''
    },
    showPressureButton: false,
    calculatingPressure: false,
    minDate: new Date().toISOString().split('T')[0]
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
        pressure: 0,
        dueDate: ''
      }
    })
  },
  // 监听标题输入
  onTitleInput(e) {
    const value = e.detail.value.slice(0, 50)
    this.setData({
      'newTask.title': value,
      showPressureButton: value.trim() !== '' || this.data.newTask.description.trim() !== ''
    })
  },
  // 监听详情输入
  onDescriptionInput(e) {
    const value = e.detail.value.slice(0, 200)
    this.setData({
      'newTask.description': value,
      showPressureButton: value.trim() !== '' || this.data.newTask.title.trim() !== ''
    })
  },
  // 监听日期选择
  onDateChange(e) {
    this.setData({
      'newTask.dueDate': e.detail.value
    })
  },
  // 计算压力值
  async calculatePressure() {
    if (!this.data.newTask.title.trim()) {
      wx.showToast({
        title: '请先输入任务标题',
        icon: 'none'
      })
      return
    }
    this.setData({ calculatingPressure: true })
    try {
      const { title, description, dueDate } = this.data.newTask
      const daysLeft = dueDate ? this.calculateDaysLeft(dueDate) : '未设置'
      
      const content = `任务主题：${title} 任务详情：${description} 任务截止日期：${daysLeft}天后`
      
      const response = await wx.request({
        url: 'https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions',
        method: 'POST',
        header: {
          'Authorization': 'Bearer 22d71beb-dfc1-45bb-b500-9e23fe012b7f',
          'Content-Type': 'application/json'
        },
        data: {
          model: 'bot-20250226110555-5jxzx',
          stream: false,
          stream_options: { include_usage: true },
          messages: [
            {
              role: 'user',
              content: content
            }
          ]
        },
        success: (response) => {
          console.log('response', response)
          const answerContent = response.data.choices[0].message.content
          const jsonStr = answerContent.slice(answerContent.indexOf('{'), answerContent.lastIndexOf('}')+1)
          const result = JSON.parse(jsonStr)
          const pressure = result.points
    
          this.setData({
            'newTask.pressure': pressure,
            calculatingPressure: false
          })
        }
      })
      
    } catch (error) {
      console.error('计算压力值失败：', error)
      wx.showToast({
        title: '压力计算失败，请重试',
        icon: 'none'
      })
      this.setData({ calculatingPressure: false })
    }
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
      showCreate: false,
      showPressureButton: false,
      newTask: {
        title: '',
        description: '',
        pressure: 0,
        dueDate: ''
      }
    })
  },
  // 隐藏创建面板
  hideCreatePanel() {
    this.setData({
      showCreate: false,
      showPressureButton: false,
      newTask: {
        title: '',
        description: '',
        pressure: 0,
        dueDate: ''
      }
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
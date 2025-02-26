// pages/task-detail/task-detail.js
const app = getApp()

Page({
  data: {
    task: null,
    subtasks: [],
    loading: false,
    progress: {
      completed: 0,
      total: 0
    },
    showFirework: false,
    allCompleted: false
  },
  onLoad() {
    const currentTask = app.globalData.currentTask
    if (currentTask) {
      this.setData({
        task: currentTask,
        allCompleted: currentTask.completed
      })
      
      // 从本地存储读取子任务
      const storedSubtasks = wx.getStorageSync(`subtasks_${currentTask.id}`)
      if (storedSubtasks) {
        const completedCount = storedSubtasks.filter(task => task.completed).length
        this.setData({
          subtasks: storedSubtasks,
          progress: {
            completed: completedCount,
            total: storedSubtasks.length
          },
          allCompleted: completedCount === storedSubtasks.length
        })
      }
    }
  },
  // 计算任务完成天数
  calculateDaysToComplete(date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    const diffTime = targetDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  // 拆解任务
  async decomposeTask() {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      const { title, description, dueDate } = this.data.task
      const content = `任务主题：${title} 任务详情：${description} 任务截止日期：${dueDate || '未设置'}`
      
      const response = await wx.request({
        url: 'https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions',
        method: 'POST',
        header: {
          'Authorization': 'Bearer {YOUR_API_KEY}',
          'Content-Type': 'application/json'
        },
        data: {
          model: 'bot-20250226192410-mncbt',
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
          const answerContent = response.data.choices[0].message.content
          const jsonStr = answerContent.slice(answerContent.indexOf('['), answerContent.lastIndexOf(']')+1)
          const result = JSON.parse(jsonStr)

          const subtasks = result.map((item, index) => ({
            id: Date.now() + index,
            title: item.subTask,
            duration: this.calculateDaysToComplete(item.date),
            completed: false
          }))

          // 保存到本地存储
          wx.setStorageSync(`subtasks_${this.data.task.id}`, subtasks)

          this.setData({
            loading: false,
            subtasks,
            progress: {
              completed: 0,
              total: subtasks.length
            }
          })
        }
      })
    } catch (error) {
      console.error('任务拆解失败：', error)
      wx.showToast({
        title: '任务拆解失败，请重试',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  // 开始休息
  startBreak() {
    wx.showToast({
      title: '开始3分钟呼吸引导',
      icon: 'none',
      duration: 2000
    })
  },
  // 完成子任务
  completeSubtask(e) {
    const { id } = e.currentTarget.dataset
    const { subtasks, progress, task } = this.data
    
    // 找到当前点击的子任务
    const targetSubtask = subtasks.find(task => task.id === id)
    // 反转完成状态
    const updatedSubtasks = subtasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    )

    const completedCount = updatedSubtasks.filter(task => task.completed).length
    const allCompleted = completedCount === subtasks.length

    // 更新全局状态和本地存储
    const tasks = app.globalData.taskList || []
    const updatedTasks = tasks.map(t => 
      t.id === task.id ? { ...t, completed: allCompleted } : t
    )
    app.globalData.taskList = updatedTasks
    wx.setStorageSync('tasks', updatedTasks)

    // 更新子任务本地存储
    wx.setStorageSync(`subtasks_${task.id}`, updatedSubtasks)

    this.setData({
      subtasks: updatedSubtasks,
      progress: {
        ...progress,
        completed: completedCount
      },
      allCompleted
    })
  },
  onUnload() {
    // 获取页面实例并刷新数据
    const pages = getCurrentPages()
    const indexPage = pages.find(page => page.route === 'pages/index/index')
    if (indexPage) {
      indexPage.onLoad()
    }
  }
})
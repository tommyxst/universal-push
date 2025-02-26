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
        task: currentTask
      })
    }
  },

  // 拆解任务
  async decomposeTask() {
    if (this.data.loading) return

    this.setData({ loading: true })

    // 模拟任务拆解过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟生成子任务
    const subtasks = [
      { id: 1, title: '明确项目目标和范围', duration: 15 },
      { id: 2, title: '收集需求和用户反馈', duration: 20 },
      { id: 3, title: '创建项目时间线', duration: 12 },
      { id: 4, title: '分配任务和资源', duration: 18 },
      { id: 5, title: '制定风险管理计划', duration: 25 }
    ]

    this.setData({
      loading: false,
      subtasks,
      progress: {
        completed: 0,
        total: subtasks.length
      }
    })
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
    
    const updatedSubtasks = subtasks.map(task => 
      task.id === id ? { ...task, completed: true } : task
    )

    const completedCount = updatedSubtasks.filter(task => task.completed).length
    const allCompleted = completedCount === subtasks.length

    // 更新全局状态
    if (allCompleted) {
      const tasks = app.globalData.tasks || []
      const updatedTasks = tasks.map(t => 
        t.id === task.id ? { ...t, completed: true } : t
      )
      app.globalData.tasks = updatedTasks
    }

    this.setData({
      subtasks: updatedSubtasks,
      progress: {
        ...progress,
        completed: completedCount
      },
      allCompleted
    })

    // 延迟显示烟花效果
    setTimeout(() => {
      this.setData({ showFirework: true })
      // 2.5秒后重置烟花状态
      setTimeout(() => {
        this.setData({ showFirework: false })
      }, 2500)
    }, 100)
  }
})
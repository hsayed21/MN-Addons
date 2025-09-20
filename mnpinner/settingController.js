/**
 * MNPinner 设置控制器
 * 基于 MNAi 成熟架构重写，提供完整的配置管理界面
 * 
 * 特性：
 * - 支持拖拽移动和缩放
 * - Tab 切换系统
 * - 响应式布局
 * - 与 main.js 完美集成
 */

// 定义控制器类 - 继承自 UIViewController
let pinnerSettingController = JSB.defineClass('pinnerSettingController : UIViewController<UIWebViewDelegate>', {
  
  // ==================== 生命周期方法 ====================
  
  viewDidLoad: function() {
    try {
      // 初始化基础属性
      self.init()
      
      // 设置初始框架
      self.view.frame = {x: 100, y: 100, width: 500, height: 400}
      self.view.layer.cornerRadius = 12
      self.currentFrame = self.view.frame
      self.lastFrame = self.view.frame
      
      // 创建主界面
      self.createMainView()
      
      // 添加手势
      self.addGestures()
      
      // 加载配置
      self.loadConfiguration()
      
    } catch (error) {
      MNUtil.showHUD("Error in viewDidLoad: " + error.message)
      if (typeof pinnerUtils !== 'undefined') {
        pinnerUtils.addErrorLog(error, "viewDidLoad")
      }
    }
  },
  
  viewWillLayoutSubviews: function() {
    try {
      self.layoutSubviews()
    } catch (error) {
      MNUtil.log({error: error, context: "viewWillLayoutSubviews"})
    }
  },
  
  // ==================== UI 创建方法 ====================
  
  createMainView: function() {
    
    // 主容器视图
    self.containerView = UIView.new()
    self.containerView.backgroundColor = MNUtil.hexColorAlpha("#f1f6ff", 0.95)
    self.containerView.layer.cornerRadius = 12
    self.view.addSubview(self.containerView)
    
    // 创建控制按钮
    self.createControlButtons()
    
    // 创建 Tab 栏
    self.createTabBar()
    
    // 创建内容视图
    self.createContentViews()
  },
  
  createControlButtons: function() {
    
    // 移动条（顶部中央）
    self.moveButton = UIView.new()
    self.moveButton.backgroundColor = MNUtil.hexColorAlpha("#3a81fb", 0.3)
    self.moveButton.layer.cornerRadius = 8
    self.view.addSubview(self.moveButton)
    
    // 关闭按钮（右上角）
    self.closeButton = UIButton.buttonWithType(0)
    self.closeButton.setTitleForState("✕", 0)
    self.closeButton.titleLabel.font = UIFont.boldSystemFontOfSize(20)
    self.closeButton.setTitleColorForState(UIColor.redColor(), 0)
    self.closeButton.addTargetActionForControlEvents(self, "closeButtonTapped:", 1<<6)
    self.view.addSubview(self.closeButton)
  },
  
  createTabBar: function() {
    
    // Tab 配置（数据驱动）
    self.tabs = [
      {name: "promptTab", title: "Prompts", view: "promptView", color: "#457bd3"},
      {name: "modelTab", title: "Model", view: "modelView", color: "#9bb2d6"},
      {name: "syncTab", title: "Sync", view: "syncView", color: "#9bb2d6"}
    ]
    
    // Tab 容器（支持横向滚动）
    self.tabScrollView = UIScrollView.new()
    self.tabScrollView.backgroundColor = MNUtil.hexColorAlpha("#ffffff", 0.1)
    self.tabScrollView.alwaysBounceHorizontal = true
    self.tabScrollView.showsHorizontalScrollIndicator = false
    self.containerView.addSubview(self.tabScrollView)
    
    // 创建 Tab 按钮
    let x = 10
    self.tabs.forEach((tab, index) => {
      // 创建按钮
      let button = UIButton.buttonWithType(0)
      button.tag = index
      button.setTitleForState(tab.title, 0)
      button.titleLabel.font = index === 0 ? 
        UIFont.boldSystemFontOfSize(16) : 
        UIFont.systemFontOfSize(16)
      button.backgroundColor = MNUtil.hexColorAlpha(tab.color, index === 0 ? 0.9 : 0.6)
      button.layer.cornerRadius = 10
      button.addTargetActionForControlEvents(self, "tabTapped:", 1<<6)
      
      // 计算尺寸和位置
      let size = button.sizeThatFits({width: 100, height: 40})
      button.frame = {x: x, y: 10, width: size.width + 20, height: 30}
      x += size.width + 25
      
      self.tabScrollView.addSubview(button)
      
      // 保存引用
      self[tab.name] = button
    })
    
    // 设置滚动内容大小
    self.tabScrollView.contentSize = {width: x, height: 50}
  },
  
  createContentViews: function() {
    
    // 为每个 Tab 创建对应的内容视图
    self.tabs.forEach((tab, index) => {
      let view = UIView.new()
      view.backgroundColor = MNUtil.hexColorAlpha("#ffffff", 0.1)
      view.hidden = (index !== 0)  // 只显示第一个
      
      // 根据不同视图添加内容
      self.createContentForView(view, tab.view)
      
      self.containerView.addSubview(view)
      self[tab.view] = view
    })
  },
  
  createContentForView: function(view, viewName) {
    
    // 添加标题
    let titleLabel = UILabel.new()
    titleLabel.textAlignment = 1  // NSTextAlignmentCenter
    titleLabel.font = UIFont.boldSystemFontOfSize(18)
    titleLabel.frame = {x: 20, y: 20, width: 200, height: 30}
    
    switch(viewName) {
      case "promptView":
        titleLabel.text = "Prompt 配置"
        view.addSubview(titleLabel)
        
        // 添加示例按钮
        let saveButton = self.createStyledButton("保存 Prompt", "#4CAF50")
        saveButton.frame = {x: 20, y: 60, width: 120, height: 35}
        saveButton.addTargetActionForControlEvents(self, "savePrompt:", 1<<6)
        view.addSubview(saveButton)
        
        let newButton = self.createStyledButton("新建 Prompt", "#2196F3")
        newButton.frame = {x: 150, y: 60, width: 120, height: 35}
        newButton.addTargetActionForControlEvents(self, "newPrompt:", 1<<6)
        view.addSubview(newButton)
        
        // 添加文本输入框
        let textView = UITextView.new()
        textView.backgroundColor = MNUtil.hexColorAlpha("#ffffff", 0.3)
        textView.layer.cornerRadius = 8
        textView.font = UIFont.systemFontOfSize(14)
        textView.text = "在这里输入你的 Prompt..."
        textView.frame = {x: 20, y: 110, width: 350, height: 100}
        view.addSubview(textView)
        self.promptTextView = textView
        
        break
        
      case "modelView":
        titleLabel.text = "模型设置"
        view.addSubview(titleLabel)
        
        // 模型选择按钮
        let modelButton = self.createStyledButton("选择模型: GPT-4", "#9b59b6")
        modelButton.frame = {x: 20, y: 60, width: 200, height: 35}
        modelButton.addTargetActionForControlEvents(self, "selectModel:", 1<<6)
        view.addSubview(modelButton)
        self.modelButton = modelButton
        
        // Temperature 滑块
        let tempLabel = UILabel.new()
        tempLabel.text = "Temperature: 0.7"
        tempLabel.frame = {x: 20, y: 110, width: 200, height: 30}
        view.addSubview(tempLabel)
        
        let slider = UISlider.new()
        slider.minimumValue = 0
        slider.maximumValue = 1
        slider.value = 0.7
        slider.frame = {x: 20, y: 145, width: 300, height: 30}
        slider.addTargetActionForControlEvents(self, "temperatureChanged:", 1<<12)
        view.addSubview(slider)
        self.temperatureSlider = slider
        self.temperatureLabel = tempLabel
        
        break
        
      case "syncView":
        titleLabel.text = "同步设置"
        view.addSubview(titleLabel)
        
        // 同步按钮
        let syncButton = self.createStyledButton("立即同步", "#e74c3c")
        syncButton.frame = {x: 20, y: 60, width: 150, height: 35}
        syncButton.addTargetActionForControlEvents(self, "syncNow:", 1<<6)
        view.addSubview(syncButton)
        
        // 自动同步开关
        let switchLabel = UILabel.new()
        switchLabel.text = "自动同步"
        switchLabel.frame = {x: 20, y: 110, width: 100, height: 30}
        view.addSubview(switchLabel)
        
        let switchControl = UISwitch.new()
        switchControl.on = false
        switchControl.frame = {x: 130, y: 110, width: 60, height: 30}
        switchControl.addTargetActionForControlEvents(self, "autoSyncToggled:", 1<<12)
        view.addSubview(switchControl)
        self.autoSyncSwitch = switchControl
        
        break
    }
  },
  
  // ==================== 事件处理方法 ====================
  
  tabTapped: function(button) {
    let index = button.tag
    
    // 更新所有 Tab 的样式和视图
    self.tabs.forEach((tab, i) => {
      let tabButton = self[tab.name]
      let contentView = self[tab.view]
      
      if (i === index) {
        // 激活状态
        tabButton.backgroundColor = MNUtil.hexColorAlpha(tab.color, 0.9)
        tabButton.titleLabel.font = UIFont.boldSystemFontOfSize(16)
        contentView.hidden = false
        
        // 可选：添加切换动画
        contentView.alpha = 0
        UIView.animateWithDurationAnimations(0.2, function() {
          contentView.alpha = 1
        })
      } else {
        // 非激活状态
        tabButton.backgroundColor = MNUtil.hexColorAlpha(tab.color, 0.6)
        tabButton.titleLabel.font = UIFont.systemFontOfSize(16)
        contentView.hidden = true
      }
    })
  },
  
  closeButtonTapped: function() {
    self.hide()
  },
  
  savePrompt: function() {
    let text = self.promptTextView ? self.promptTextView.text : ""
    
    if (text && text.trim() !== "") {
      // 保存到配置
      if (typeof pinnerConfig !== 'undefined') {
        if (!pinnerConfig.prompts) {
          pinnerConfig.prompts = {}
        }
        let key = "prompt_" + Date.now()
        pinnerConfig.prompts[key] = {
          title: "Prompt " + Object.keys(pinnerConfig.prompts).length,
          content: text
        }
        pinnerConfig.save()
        MNUtil.showHUD("✅ Prompt 已保存")
      } else {
        MNUtil.showHUD("⚠️ 配置未初始化")
      }
    } else {
      MNUtil.showHUD("请输入 Prompt 内容")
    }
  },
  
  newPrompt: function() {
    if (self.promptTextView) {
      self.promptTextView.text = ""
      MNUtil.showHUD("新建 Prompt")
    }
  },
  
  selectModel: function(button) {
    let models = ["GPT-4", "GPT-3.5", "Claude", "Gemini"]
    let currentIndex = models.findIndex(m => button.titleForState(0).includes(m))
    let nextIndex = (currentIndex + 1) % models.length
    button.setTitleForState("选择模型: " + models[nextIndex], 0)
    
    // 保存配置
    if (typeof pinnerConfig !== 'undefined') {
      if (!pinnerConfig.config) {
        pinnerConfig.config = {}
      }
      pinnerConfig.config.model = models[nextIndex]
      pinnerConfig.save()
    }
  },
  
  temperatureChanged: function(slider) {
    let value = slider.value.toFixed(2)
    if (self.temperatureLabel) {
      self.temperatureLabel.text = "Temperature: " + value
    }
    
    // 保存配置
    if (typeof pinnerConfig !== 'undefined') {
      if (!pinnerConfig.config) {
        pinnerConfig.config = {}
      }
      pinnerConfig.config.temperature = parseFloat(value)
      pinnerConfig.save()
    }
  },
  
  syncNow: function() {
    MNUtil.showHUD("🔄 正在同步...")
    
    // 模拟同步
    MNUtil.delay(1).then(() => {
      if (typeof pinnerConfig !== 'undefined') {
        pinnerConfig.load()
        MNUtil.showHUD("✅ 同步完成")
      } else {
        MNUtil.showHUD("❌ 同步失败")
      }
    })
  },
  
  autoSyncToggled: function(switchControl) {
    let isOn = switchControl.on
    
    if (typeof pinnerConfig !== 'undefined') {
      if (!pinnerConfig.config) {
        pinnerConfig.config = {}
      }
      pinnerConfig.config.autoSync = isOn
      pinnerConfig.save()
      MNUtil.showHUD(isOn ? "✅ 自动同步已开启" : "❌ 自动同步已关闭")
    }
  },
  
  // ==================== 手势处理 ====================
  
  addGestures: function() {
    
    // 移动手势
    let panGesture = UIPanGestureRecognizer.new()
    panGesture.addTargetAction(self, "onMoveGesture:")
    self.moveButton.addGestureRecognizer(panGesture)
    
    // 缩放手势（通过右下角）
    let resizeGesture = UIPanGestureRecognizer.new()
    resizeGesture.addTargetAction(self, "onResizeGesture:")
    self.closeButton.addGestureRecognizer(resizeGesture)
  },
  
  onMoveGesture: function(gesture) {
    
    if (gesture.state === 1) { // UIGestureRecognizerStateBegan
      // 记录初始位置
      self.originalLocation = gesture.locationInView(MNUtil.studyView)
      self.originalFrame = self.view.frame
    }
    
    if (gesture.state === 2) { // UIGestureRecognizerStateChanged
      // 计算位置差值
      let currentLocation = gesture.locationInView(MNUtil.studyView)
      let dx = currentLocation.x - self.originalLocation.x
      let dy = currentLocation.y - self.originalLocation.y
      
      // 更新位置
      let frame = self.view.frame
      frame.x = self.originalFrame.x + dx
      frame.y = self.originalFrame.y + dy
      
      // 添加边界约束
      let studyFrame = MNUtil.studyView ? MNUtil.studyView.bounds : {width: 1024, height: 768}
      frame.x = Math.max(0, Math.min(frame.x, studyFrame.width - frame.width))
      frame.y = Math.max(0, Math.min(frame.y, studyFrame.height - frame.height))
      
      self.view.frame = frame
    }
    
    if (gesture.state === 3) { // UIGestureRecognizerStateEnded
      // 保存最终位置
      self.currentFrame = self.view.frame
    }
  },
  
  onResizeGesture: function(gesture) {
    
    if (gesture.state === 1) { // UIGestureRecognizerStateBegan
      self.originalFrame = self.view.frame
    }
    
    if (gesture.state === 2) { // UIGestureRecognizerStateChanged
      let translation = gesture.translationInView(self.view)
      let frame = self.originalFrame
      
      // 调整大小，设置最小尺寸
      frame.width = Math.max(350, frame.width + translation.x)
      frame.height = Math.max(250, frame.height + translation.y)
      
      self.view.frame = frame
    }
    
    if (gesture.state === 3) { // UIGestureRecognizerStateEnded
      self.currentFrame = self.view.frame
      self.layoutSubviews()
    }
  },
  
  // ==================== 布局方法 ====================
  
  layoutSubviews: function() {
    let bounds = self.view.bounds
    let width = bounds.width
    let height = bounds.height
    
    // 容器视图
    self.containerView.frame = bounds
    
    // 移动条
    self.moveButton.frame = {x: width/2 - 50, y: 5, width: 100, height: 16}
    
    // 关闭按钮
    self.closeButton.frame = {x: width - 35, y: 5, width: 30, height: 30}
    
    // Tab 栏
    self.tabScrollView.frame = {x: 0, y: 30, width: width, height: 50}
    
    // 内容区域
    let contentY = 80
    let contentHeight = height - 90
    
    self.tabs.forEach(tab => {
      if (self[tab.view]) {
        self[tab.view].frame = {x: 10, y: contentY, width: width - 20, height: contentHeight}
      }
    })
  },
  
  // ==================== 配置管理 ====================
  
  loadConfiguration: function() {
    
    // 加载配置
    if (typeof pinnerConfig !== 'undefined') {
      pinnerConfig.load()
      
      // 恢复设置
      if (pinnerConfig.config) {
        // 模型设置
        if (pinnerConfig.config.model && self.modelButton) {
          self.modelButton.setTitleForState("选择模型: " + pinnerConfig.config.model, 0)
        }
        
        // Temperature 设置
        if (pinnerConfig.config.temperature && self.temperatureSlider) {
          self.temperatureSlider.value = pinnerConfig.config.temperature
          if (self.temperatureLabel) {
            self.temperatureLabel.text = "Temperature: " + pinnerConfig.config.temperature
          }
        }
        
        // 自动同步设置
        if (pinnerConfig.config.autoSync !== undefined && self.autoSyncSwitch) {
          self.autoSyncSwitch.on = pinnerConfig.config.autoSync
        }
      }
    }
  },
  
  // ==================== 公共接口方法 ====================
  
  show: function() {
    
    // 添加到主视图 - 修复：使用正确的 MNUtil.studyView
    if (MNUtil.studyView) {
      MNUtil.studyView.addSubview(self.view)
    }
    
    // 显示动画
    self.view.alpha = 0
    self.view.hidden = false
    UIView.animateWithDurationAnimations(0.3, function() {
      self.view.alpha = 1
    })
  },
  
  hide: function() {
    
    // 隐藏动画
    UIView.animateWithDurationAnimationsCompletion(0.3, function() {
      self.view.alpha = 0
    }, function(finished) {
      self.view.hidden = true
      self.view.removeFromSuperview()
    })
  },
  
  switchView: function(viewName) {
    
    // 找到对应的 Tab 索引
    let index = self.tabs.findIndex(tab => tab.view === viewName)
    if (index !== -1) {
      let button = self[self.tabs[index].name]
      if (button) {
        self.tabTapped(button)
      }
    }
  },
  
  // ==================== 工具方法 ====================
  
  createStyledButton: function(title, color) {
    let button = UIButton.buttonWithType(0)
    button.setTitleForState(title, 0)
    button.titleLabel.font = UIFont.systemFontOfSize(14)
    button.backgroundColor = MNUtil.hexColorAlpha(color || "#3498db", 0.8)
    button.layer.cornerRadius = 8
    return button
  },
  
  // ==================== 初始化 ====================
  
  init: function() {
    // 初始化代码
  }
});

// 配置管理对象（如果还没有定义）
if (typeof pinnerConfig === 'undefined') {
  var pinnerConfig = {
    config: {},
    prompts: {},
    currentPrompt: null,
    
    save: function() {
      NSUserDefaults.standardUserDefaults().setObjectForKey(this.config, "MNPinner_config")
      NSUserDefaults.standardUserDefaults().setObjectForKey(this.prompts, "MNPinner_prompts")
      NSUserDefaults.standardUserDefaults().synchronize()
    },
    
    load: function() {
      this.config = NSUserDefaults.standardUserDefaults().objectForKey("MNPinner_config") || {}
      this.prompts = NSUserDefaults.standardUserDefaults().objectForKey("MNPinner_prompts") || {}
    }
  }
}

// // 导出
// if (typeof module !== 'undefined') {
//   module.exports = pinnerSettingController
// }
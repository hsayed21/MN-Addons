/**
 * MNPinner 设置控制器
 * 提供插件的偏好设置界面
 */

/** @return {settingController} */
const getSettingController = () => self

var settingController = JSB.defineClass('settingController : UIViewController', {

  /**
   * 视图加载完成
   */
  viewDidLoad: function() {
    try {
      self.init()

      // 初始化视图尺寸
      self.view.frame = {x: 50, y: 50, width: 380, height: 480}
      self.lastFrame = self.view.frame
      self.currentFrame = self.view.frame

      // 视图样式
      self.view.layer.shadowOffset = {width: 0, height: 0}
      self.view.layer.shadowRadius = 15
      self.view.layer.shadowOpacity = 0.5
      self.view.layer.shadowColor = UIColor.colorWithWhiteAlpha(0.5, 1)
      self.view.layer.cornerRadius = 11
      self.view.layer.opacity = 1.0
      self.view.layer.borderColor = MNUtil.hexColorAlpha("#9bb2d6", 0.8)
      self.view.layer.borderWidth = 1
      self.view.backgroundColor = UIColor.whiteColor()

      // 创建 UI 组件
      if (!self.settingView) {
        self.createSettingView()
      }

      // 创建顶部控制按钮
      self.createButton("closeButton", "closeTapped:")
      self.closeButton.setTitleForState('✕', 0)
      self.closeButton.titleLabel.font = UIFont.systemFontOfSize(16)
      MNButton.setColor(self.closeButton, "#ff3b30", 0.5)
      self.closeButton.width = 30
      self.closeButton.height = 30

      self.createButton("moveButton")
      MNButton.setColor(self.moveButton, "#3a81fb", 0.5)
      self.moveButton.width = 280
      self.moveButton.height = 25
      self.moveButton.setTitleForState('⚙️ MNPinner 设置', 0)
      self.moveButton.titleLabel.font = UIFont.boldSystemFontOfSize(14)

      // 添加手势
      MNButton.addPanGesture(self.moveButton, self, "onMoveGesture:")

      // 布局
      self.settingViewLayout()

    } catch (error) {
      pinnerUtils.addErrorLog(error, "settingController:viewDidLoad")
      MNUtil.showHUD("设置视图加载失败: " + error.message)
    }
  },

  /**
   * 布局子视图
   */
  viewWillLayoutSubviews: function() {
    self.settingViewLayout()
  }
})

/**
 * 初始化方法
 * 将视图添加到 studyView 层级（不使用模态呈现）
 */
settingController.prototype.init = function() {
  MNUtil.studyView.addSubview(this.view)
  this.view.hidden = true
}

/**
 * 创建设置视图
 */
settingController.prototype.createSettingView = function() {
  try {
    // 主容器
    self.settingView = new UIView()
    self.settingView.backgroundColor = UIColor.clearColor()
    self.view.addSubview(self.settingView)

    // 创建滚动视图
    self.scrollView = new UIScrollView()
    self.scrollView.backgroundColor = UIColor.clearColor()
    self.scrollView.showsVerticalScrollIndicator = true
    self.settingView.addSubview(self.scrollView)

    // 内容容器
    self.contentView = new UIView()
    self.contentView.backgroundColor = UIColor.clearColor()
    self.scrollView.addSubview(self.contentView)

    // 创建设置项
    self.createSettingItems()

  } catch (error) {
    pinnerUtils.addErrorLog(error, "createSettingView")
  }
}

/**
 * 创建所有设置项
 */
settingController.prototype.createSettingItems = function() {
  try {
    self.settingButtons = []
    let yOffset = 20
    const itemHeight = 50
    const spacing = 10

    // 获取当前设置
    let settings = pinnerConfig.settings || pinnerConfig.getDefaultSettings()

    // 1. Pin 卡片时询问标题
    yOffset += self.createSettingItem(
      "Pin 卡片时询问标题",
      "alwaysAskCardTitle",
      settings.alwaysAskCardTitle,
      yOffset
    ) + spacing

    // 2. Pin 页面时询问标题
    yOffset += self.createSettingItem(
      "Pin 页面时询问标题",
      "alwaysAskPageTitle",
      settings.alwaysAskPageTitle,
      yOffset
    ) + spacing

    // 3. 默认视图模式
    yOffset += self.createSelectorItem(
      "默认视图模式",
      "defaultViewMode",
      settings.defaultViewMode,
      ["pin", "task"],
      ["📌 Pin 视图", "✅ Task 视图"],
      yOffset
    ) + spacing

    // 4. 默认打开分区
    yOffset += self.createSelectorItem(
      "默认打开分区",
      "defaultSection",
      settings.defaultSection,
      ["focus", "midway", "toOrganize", "taskToday", "taskTomorrow"],
      ["⭐ Focus", "🎯 中间知识", "📋 待整理", "📅 今日任务", "📆 明日任务"],
      yOffset
    ) + spacing

    // 5. 分隔线
    yOffset += 10
    let separator = new UIView()
    separator.backgroundColor = MNUtil.hexColorAlpha("#cccccc", 0.5)
    separator.frame = {x: 20, y: yOffset, width: 340, height: 1}
    self.contentView.addSubview(separator)
    yOffset += 20

    // 6. 导出配置
    yOffset += self.createActionButton(
      "📤 导出配置",
      "exportConfig:",
      yOffset
    ) + spacing

    // 7. 导入配置
    yOffset += self.createActionButton(
      "📥 导入配置",
      "importConfig:",
      yOffset
    ) + spacing

    // 8. 重置设置
    yOffset += self.createActionButton(
      "🔄 重置为默认设置",
      "resetSettings:",
      yOffset
    ) + spacing

    // 设置 contentView 的高度
    self.contentView.frame = {x: 0, y: 0, width: 380, height: yOffset + 20}
    self.scrollView.contentSize = {width: 380, height: yOffset + 20}

  } catch (error) {
    pinnerUtils.addErrorLog(error, "createSettingItems")
  }
}

/**
 * 创建设置项（开关类型）
 * @returns {number} 项目高度
 */
settingController.prototype.createSettingItem = function(title, key, value, yOffset) {
  const itemHeight = 50

  // 容器
  let container = new UIView()
  container.backgroundColor = MNUtil.hexColorAlpha("#f5f5f5", 1.0)
  container.layer.cornerRadius = 8
  container.frame = {x: 20, y: yOffset, width: 340, height: itemHeight}
  self.contentView.addSubview(container)

  // 标题标签
  let label = new UILabel()
  label.text = title
  label.font = UIFont.systemFontOfSize(14)
  label.textColor = UIColor.blackColor()
  label.frame = {x: 15, y: 0, width: 250, height: itemHeight}
  container.addSubview(label)

  // 开关按钮
  let toggleButton = new UIButton()
  toggleButton.settingKey = key
  toggleButton.setTitleForState(value ? '☑️' : '☐', 0)
  toggleButton.titleLabel.font = UIFont.systemFontOfSize(24)
  toggleButton.addTargetActionForControlEvents(
    self,
    "toggleSetting:",
    1 << 6  // UIControlEventTouchUpInside
  )
  toggleButton.frame = {x: 280, y: 10, width: 50, height: 30}
  container.addSubview(toggleButton)

  self.settingButtons.push({key: key, button: toggleButton})

  return itemHeight
}

/**
 * 创建选择器设置项
 * @returns {number} 项目高度
 */
settingController.prototype.createSelectorItem = function(title, key, currentValue, values, labels, yOffset) {
  const itemHeight = 50

  // 容器
  let container = new UIView()
  container.backgroundColor = MNUtil.hexColorAlpha("#f5f5f5", 1.0)
  container.layer.cornerRadius = 8
  container.frame = {x: 20, y: yOffset, width: 340, height: itemHeight}
  self.contentView.addSubview(container)

  // 标题标签
  let label = new UILabel()
  label.text = title
  label.font = UIFont.systemFontOfSize(14)
  label.textColor = UIColor.blackColor()
  label.frame = {x: 15, y: 0, width: 180, height: itemHeight}
  container.addSubview(label)

  // 当前值标签
  let valueLabel = new UILabel()
  let currentIndex = values.indexOf(currentValue)
  valueLabel.text = labels[currentIndex] || labels[0]
  valueLabel.font = UIFont.systemFontOfSize(13)
  valueLabel.textColor = MNUtil.hexColorAlpha("#666666", 1.0)
  valueLabel.textAlignment = 2  // Right
  valueLabel.frame = {x: 180, y: 0, width: 100, height: itemHeight}
  container.addSubview(valueLabel)

  // 点击按钮
  let button = new UIButton()
  button.settingKey = key
  button.settingValues = values
  button.settingLabels = labels
  button.valueLabel = valueLabel
  button.backgroundColor = UIColor.clearColor()
  button.addTargetActionForControlEvents(
    self,
    "selectSetting:",
    1 << 6
  )
  button.frame = {x: 0, y: 0, width: 340, height: itemHeight}
  container.addSubview(button)

  self.settingButtons.push({key: key, button: button, valueLabel: valueLabel})

  return itemHeight
}

/**
 * 创建操作按钮
 * @returns {number} 按钮高度
 */
settingController.prototype.createActionButton = function(title, selector, yOffset) {
  const buttonHeight = 44

  let button = new UIButton()
  button.setTitleForState(title, 0)
  button.titleLabel.font = UIFont.systemFontOfSize(14)
  button.setTitleColorForState(UIColor.whiteColor(), 0)
  button.backgroundColor = MNUtil.hexColorAlpha("#007AFF", 1.0)
  button.layer.cornerRadius = 8
  button.addTargetActionForControlEvents(
    self,
    selector,
    1 << 6
  )
  button.frame = {x: 20, y: yOffset, width: 340, height: buttonHeight}
  self.contentView.addSubview(button)

  return buttonHeight
}

/**
 * 布局所有视图
 */
settingController.prototype.settingViewLayout = function() {
  try {
    let viewFrame = self.view.bounds
    let width = viewFrame.width
    let height = viewFrame.height

    // 顶部按钮区域
    self.moveButton.frame = {x: (width - 280) / 2, y: 10, width: 280, height: 25}
    self.closeButton.frame = {x: width - 40, y: 10, width: 30, height: 30}

    // 设置视图区域
    self.settingView.frame = {x: 0, y: 45, width: width, height: height - 45}
    self.scrollView.frame = {x: 0, y: 0, width: width, height: height - 45}

  } catch (error) {
    pinnerUtils.addErrorLog(error, "settingViewLayout")
  }
}

/**
 * 切换开关设置
 */
settingController.prototype.toggleSetting = function(button) {
  try {
    let key = button.settingKey
    let settings = pinnerConfig.settings || pinnerConfig.getDefaultSettings()

    // 切换值
    settings[key] = !settings[key]

    // 更新按钮显示
    button.setTitleForState(settings[key] ? '☑️' : '☐', 0)

    // 保存设置
    pinnerConfig.settings = settings
    pinnerConfig.saveSettings()

    MNUtil.showHUD(settings[key] ? "✅ 已启用" : "☐ 已禁用")

  } catch (error) {
    pinnerUtils.addErrorLog(error, "toggleSetting")
    MNUtil.showHUD("切换设置失败")
  }
}

/**
 * 选择设置值
 */
settingController.prototype.selectSetting = function(button) {
  try {
    let key = button.settingKey
    let values = button.settingValues
    let labels = button.settingLabels
    let valueLabel = button.valueLabel

    let settings = pinnerConfig.settings || pinnerConfig.getDefaultSettings()
    let currentValue = settings[key]
    let currentIndex = values.indexOf(currentValue)

    // 构建选择菜单
    let commandTable = []
    for (let i = 0; i < values.length; i++) {
      let isSelected = (i === currentIndex)
      commandTable.push({
        title: (isSelected ? '✓ ' : '   ') + labels[i],
        object: self,
        selector: 'updateSelectorSetting:',
        param: {
          key: key,
          value: values[i],
          label: labels[i],
          valueLabel: valueLabel
        }
      })
    }

    // 显示弹出菜单
    self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable, 200, 1)

  } catch (error) {
    pinnerUtils.addErrorLog(error, "selectSetting")
    MNUtil.showHUD("选择设置失败")
  }
}

/**
 * 更新选择器设置值
 */
settingController.prototype.updateSelectorSetting = function(param) {
  try {
    if (self.popoverController) {
      self.popoverController.dismissPopoverAnimated(true)
      self.popoverController = null
    }

    let settings = pinnerConfig.settings || pinnerConfig.getDefaultSettings()
    settings[param.key] = param.value

    // 更新显示标签
    param.valueLabel.text = param.label

    // 保存设置
    pinnerConfig.settings = settings
    pinnerConfig.saveSettings()

    MNUtil.showHUD("✅ 已更新")

  } catch (error) {
    pinnerUtils.addErrorLog(error, "updateSelectorSetting")
    MNUtil.showHUD("更新设置失败")
  }
}

/**
 * 导出配置
 */
settingController.prototype.exportConfig = function(button) {
  try {
    // 显示导出选项
    let commandTable = [
      {title: '📋 导出到剪贴板', object: self, selector: 'doExportConfig:', param: "clipboard"},
      {title: '📁 导出到文件', object: self, selector: 'doExportConfig:', param: "file"},
      {title: '📝 导出到当前卡片', object: self, selector: 'doExportConfig:', param: "currentNote"}
    ]

    self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable, 250, 2)

  } catch (error) {
    pinnerUtils.addErrorLog(error, "exportConfig")
  }
}

/**
 * 执行导出
 */
settingController.prototype.doExportConfig = function(param) {
  try {
    if (self.popoverController) {
      self.popoverController.dismissPopoverAnimated(true)
      self.popoverController = null
    }

    switch (param) {
      case "clipboard":
        pinnerConfig.exportToClipboard()
        break
      case "file":
        pinnerConfig.exportToFile()
        break
      case "currentNote":
        pinnerConfig.exportToCurrentNote()
        break
    }

  } catch (error) {
    pinnerUtils.addErrorLog(error, "doExportConfig")
  }
}

/**
 * 导入配置
 */
settingController.prototype.importConfig = function(button) {
  try {
    // 显示导入选项
    let commandTable = [
      {title: '📋 从剪贴板导入', object: self, selector: 'doImportConfig:', param: "clipboard"},
      {title: '📁 从文件导入', object: self, selector: 'doImportConfig:', param: "file"},
      {title: '📝 从当前卡片导入', object: self, selector: 'doImportConfig:', param: "currentNote"}
    ]

    self.popoverController = MNUtil.getPopoverAndPresent(button, commandTable, 250, 2)

  } catch (error) {
    pinnerUtils.addErrorLog(error, "importConfig")
  }
}

/**
 * 执行导入
 */
settingController.prototype.doImportConfig = function(param) {
  try {
    if (self.popoverController) {
      self.popoverController.dismissPopoverAnimated(true)
      self.popoverController = null
    }

    let success = false
    switch (param) {
      case "clipboard":
        success = pinnerConfig.importFromClipboard()
        break
      case "file":
        pinnerConfig.importFromFile().then(result => {
          if (result) {
            self.refreshSettings()
          }
        })
        return
      case "currentNote":
        success = pinnerConfig.importFromCurrentNote()
        break
    }

    if (success) {
      self.refreshSettings()
    }

  } catch (error) {
    pinnerUtils.addErrorLog(error, "doImportConfig")
  }
}

/**
 * 重置设置
 */
settingController.prototype.resetSettings = function(button) {
  try {
    // 确认对话框
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "重置设置",
      "确定要重置所有设置为默认值吗？",
      0,
      "取消",
      ["确定"],
      (alert, buttonIndex) => {
        if (buttonIndex === 1) {
          // 重置
          pinnerConfig.settings = pinnerConfig.getDefaultSettings()
          pinnerConfig.saveSettings()

          // 刷新界面
          self.refreshSettings()

          MNUtil.showHUD("✅ 已重置为默认设置")
        }
      }
    )

  } catch (error) {
    pinnerUtils.addErrorLog(error, "resetSettings")
  }
}

/**
 * 刷新设置显示
 */
settingController.prototype.refreshSettings = function() {
  try {
    let settings = pinnerConfig.settings || pinnerConfig.getDefaultSettings()

    for (let item of self.settingButtons) {
      let key = item.key
      let value = settings[key]

      if (item.valueLabel) {
        // 选择器类型
        let button = item.button
        let values = button.settingValues
        let labels = button.settingLabels
        let index = values.indexOf(value)
        item.valueLabel.text = labels[index] || labels[0]
      } else {
        // 开关类型
        item.button.setTitleForState(value ? '☑️' : '☐', 0)
      }
    }

  } catch (error) {
    pinnerUtils.addErrorLog(error, "refreshSettings")
  }
}

/**
 * 拖动手势
 */
settingController.prototype.onMoveGesture = function(gesture) {
  try {
    let location = gesture.locationInView(self.view.window)
    let translation = gesture.translationInView(self.view)

    if (gesture.state === 1) {  // Began
      self.initialCenter = self.view.center
    } else if (gesture.state === 2) {  // Changed
      let newCenter = {
        x: self.initialCenter.x + translation.x,
        y: self.initialCenter.y + translation.y
      }
      self.view.center = newCenter
    }

  } catch (error) {
    pinnerUtils.addErrorLog(error, "onMoveGesture")
  }
}

/**
 * 关闭按钮点击
 */
settingController.prototype.closeTapped = function(button) {
  try {
    self.hide()
  } catch (error) {
    pinnerUtils.addErrorLog(error, "closeTapped")
  }
}

/**
 * 创建按钮
 */
settingController.prototype.createButton = function(name, selector) {
  try {
    self[name] = new UIButton()
    if (selector) {
      self[name].addTargetActionForControlEvents(
        self,
        selector,
        1 << 6  // UIControlEventTouchUpInside
      )
    }
    self.view.addSubview(self[name])
  } catch (error) {
    pinnerUtils.addErrorLog(error, "createButton")
  }
}

/**
 * 显示设置面板
 * 使用直接视图管理模式（参考 mntoolbar）
 */
settingController.prototype.show = function(frame) {
  try {
    // 将设置视图置于最前
    MNUtil.studyView.bringSubviewToFront(this.view)

    // 如果提供了 frame，应用新位置
    if (frame) {
      this.view.frame = frame
      this.currentFrame = frame
      this.lastFrame = frame
    }

    // 淡入动画
    this.view.layer.opacity = 0.2
    this.view.hidden = false

    MNUtil.animate(() => {
      this.view.layer.opacity = 1.0
    }, 0.2).then(() => {
      this.view.layer.borderWidth = 1
      this.view.layer.opacity = 1.0
    })

  } catch (error) {
    pinnerUtils.addErrorLog(error, "settingController.show")
    MNUtil.showHUD("显示设置失败: " + error.message)
  }
}

/**
 * 隐藏设置面板
 */
settingController.prototype.hide = function() {
  try {
    let preFrame = this.view.frame
    let preOpacity = this.view.layer.opacity

    // 淡出动画
    MNUtil.animate(() => {
      this.view.layer.opacity = 0.2
    }, 0.2).then(() => {
      this.view.hidden = true
      this.view.layer.opacity = preOpacity
      this.view.frame = preFrame
      this.currentFrame = preFrame
    })

  } catch (error) {
    pinnerUtils.addErrorLog(error, "settingController.hide")
    MNUtil.showHUD("隐藏设置失败: " + error.message)
  }
}

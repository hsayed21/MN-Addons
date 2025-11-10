/**
 * 文献管理插件的工具类
 * 提供视图控制器管理和辅助功能
 */
class pinnerUtils {
  static init(mainPath) {
    try {
      this.mainPath = mainPath
      this.errorLog = []
    } catch (error) {
      MNLog.error(error, "pinnerUtils:init")
    }
  }
  static addErrorLog(error, source, info){
    MNUtil.showHUD("MN Pinner Error ("+ source +"): "+error)
    let tem = {source:source, time:(new Date(Date.now())).toString()}
    if (error.detail) {
      tem.error = {message: error.message, detail:error.detail}
    } else {
      tem.error = error.message
    }
    if (info) {
      tem.info = info
    }
    this.errorLog.push(tem)
    MNUtil.copy(this.errorLog)
    if (typeof MNUtil.log !== 'undefined') {
      MNUtil.log({
        source:"MN Pinner",
        level:"error",
        message:source,
        detail:tem,
      })
    }
  }

  static log(log, source){
    let tem = {source:source, time:(new Date(Date.now())).toString(), log:log}
    if (typeof MNUtil.log !== 'undefined') {
      MNUtil.log({
        source:"MN Pinner",
        level:"log",
        message:source,
        detail:tem,
      })
    }
  }
  /**
   * 获取插件文件夹路径
   * @param {string} fullPath - 完整文件路径
   * @returns {string} 文件夹路径
   */
  static getExtensionFolder(fullPath) {
      // 找到最后一个'/'的位置
      let lastSlashIndex = fullPath.lastIndexOf('/');
      // 从最后一个'/'之后截取字符串，得到文件名
      let fileName = fullPath.substring(0,lastSlashIndex);
      return fileName;
  }

  /**
   * 检查 MNUtils 框架是否已安装
   * @param {string} fullPath - 插件的完整路径
   * @returns {boolean} MNUtils 是否存在
   */
  static checkMNUtilsFolder(fullPath){
    let extensionFolder = this.getExtensionFolder(fullPath)
    let folderExist = MNUtil.isfileExists(extensionFolder+"/marginnote.extension.mnutils/main.js")
    if (!folderExist) {
      pinnerUtils.showHUD("MN Pinner: Please install 'MN Utils' first!",5)
    }
    return folderExist
  }

  /**
   * 检查并创建视图控制器（单例模式）
   * 
   * 这是整个视图系统的核心方法，负责：
   * 1. 创建视图控制器实例（只创建一次）
   * 2. 确保视图被添加到正确的父视图中
   * 
   * 技术要点：
   * - pinnerController.new() 会创建 UIViewController 实例
   * - 创建时会自动调用 viewDidLoad 生命周期方法
   * - studyView 是 MarginNote 的主学习视图，所有插件视图都应添加到这里
   */
  static checkPinnerController(){
    // 单例模式：如果控制器不存在则创建
    if (!this.pinnerController) {
      // 创建视图控制器实例
      // 这会触发 webviewController.js 中的 viewDidLoad 方法
      this.pinnerController = pinnerController.new();
      // 初始状态设为隐藏，等待用户手动打开
      this.pinnerController.view.hidden = true
    }
    // 确保视图在正确的父视图中
    // 这是必要的，因为视图可能被其他操作移除
    if (!MNUtil.isDescendantOfStudyView(this.pinnerController.view)) {
      // 将视图添加到 studyView（MarginNote 的主视图容器）
      // addSubview 是 iOS UIView 的标准方法
      MNUtil.studyView.addSubview(this.pinnerController.view)
    }
  }

  /**
   * 同时设置视图的 frame 和 currentFrame
   * 
   * 为什么需要两个 frame 属性？
   * - view.frame：iOS 标准属性，决定视图的实际位置和大小
   * - currentFrame：自定义属性，用于记录当前位置，在动画时使用
   * 
   * @param {pinnerController} target - 视图控制器对象
   * @param {Object} frame - 位置和大小 {x, y, width, height}
   */
  static setFrame(target,frame){
    target.view.frame = frame
    target.currentFrame = frame
  }

  /**
   * 确保视图在正确的父视图中
   * 
   * 这个方法解决了一个常见问题：
   * 插件视图可能因为各种原因（窗口切换、内存管理等）从父视图中移除
   * 在显示视图前，必须确保它在正确的容器中
   * 
   * @param {UIView} view - 需要确保的视图对象
   */
  static ensureView(view){
    // 检查视图是否在 studyView 的子视图树中
    if (!MNUtil.isDescendantOfStudyView(view)) {
      // 如果不在，先隐藏它（避免闪烁）
      view.hidden = true
      // 然后添加到 studyView 中
      MNUtil.studyView.addSubview(view)
    }
  }

  /**
   * 便捷方法：Pin 卡片到指定分区
   * @param {string} noteId - 卡片ID（必需）
   * @param {Object} options - 配置选项（可选）
   *   @param {string} options.section - 分区名称（默认 "focus"）
   *   @param {string|number} options.position - 位置：'top', 'bottom' 或索引（默认 "top"）
   *   @param {string} options.title - 卡片标题（默认自动获取卡片的标题）
   * @returns {boolean} 是否添加成功
   *
   * 使用示例：
   *   pinnerUtils.pinCard(noteId)
   *   pinnerUtils.pinCard(noteId, { section: "midway" })
   *   pinnerUtils.pinCard(noteId, { section: "toOrganize", position: "bottom" })
   *   pinnerUtils.pinCard(noteId, { title: "自定义标题", section: "focus" })
   */
  static pinCard(noteId, options = {}) {
    try {
      const {
        section = "focus",
        position = "top",
        title = null
      } = options

      // 如果没有提供标题，尝试获取卡片的标题
      let finalTitle = title
      if (!finalTitle) {
        let note = MNNote.new(noteId)
        finalTitle = note ? note.noteTitle : "未命名卡片"
      }

      // 创建 Card Pin 数据
      let cardPin = pinnerConfig.createCardPin(noteId, finalTitle)

      // 添加到指定分区
      return pinnerConfig.addPin(cardPin, section, position)
    } catch (error) {
      this.addErrorLog(error, "pinnerUtils:pinCard")
      return false
    }
  }

  /**
   * 便捷方法：Pin 页面到指定分区
   * @param {string} docMd5 - 文档MD5（必需）
   * @param {number} pageIndex - 页码（从0开始，必需）
   * @param {Object} options - 配置选项（可选）
   *   @param {string} options.section - 分区名称（默认 "focus"）
   *   @param {string|number} options.position - 位置：'top', 'bottom' 或索引（默认 "top"）
   *   @param {string} options.title - 自定义标题（默认自动生成 "第 X 页"）
   *   @param {string} options.note - 备注信息（默认空）
   * @returns {boolean} 是否添加成功
   *
   * 使用示例：
   *   pinnerUtils.pinPage(docMd5, 5)  // 自动标题 "第 6 页"
   *   pinnerUtils.pinPage(docMd5, 5, { section: "midway" })
   *   pinnerUtils.pinPage(docMd5, 5, { title: "重要章节", section: "midway" })
   *   pinnerUtils.pinPage(docMd5, 5, { section: "toOrganize", position: "bottom", note: "备注" })
   */
  static pinPage(docMd5, pageIndex, options = {}) {
    try {
      const {
        section = "focus",
        position = "top",
        title = null,
        note = ""
      } = options

      // 如果没有提供标题，自动生成 "第 X 页"
      let finalTitle = title || `第 ${pageIndex + 1} 页`

      // 创建 Page Pin 数据
      let pagePin = pinnerConfig.createPagePin(docMd5, pageIndex, finalTitle, note)

      // 添加到指定分区
      return pinnerConfig.addPin(pagePin, section, position)
    } catch (error) {
      this.addErrorLog(error, "pinnerUtils:pinPage")
      return false
    }
  }
}


/**
 * 分区配置注册中心
 * 集中管理所有视图分区的配置信息
 *
 * 核心职责：
 * 1. 定义所有分区的元数据（名称、图标、颜色等）
 * 2. 提供配置查询接口
 * 3. 支持动态添加/删除分区
 */
class SectionRegistry {
  /**
   * 所有分区的配置信息
   * 使用 Map 而不是普通对象，避免原型链问题
   */
  static sections = new Map([
    // Pin 视图分区
    ["focus", {
      key: "focus",
      displayName: "Focus",
      viewMode: "pin",
      color: "#457bd3",
      icon: "📌",
      order: 1,
      description: "重点关注的卡片"
    }],
    ["midway", {
      key: "midway",
      displayName: "中间知识",
      viewMode: "pin",
      color: "#61afef",
      icon: "📚",
      order: 2,
      description: "待进一步处理的知识"
    }],
    ["toOrganize", {
      key: "toOrganize",
      displayName: "待整理",
      viewMode: "pin",
      color: "#98c379",
      icon: "📥",
      order: 3,
      description: "需要整理的零散内容"
    }],
    ["class", {
      key: "class",
      displayName: "Class",
      viewMode: "pin",
      color: "#e5c07b",
      icon: "🎓",
      order: 4,
      description: "课程相关内容"
    }],
    ["exerciseClass", {
      key: "exerciseClass",
      displayName: "习题课",
      viewMode: "pin",
      color: "#e5c07b",
      icon: "🎓",
      order: 5,
      description: "习题课"
    }],

    // Task 视图分区
    ["taskToday", {
      key: "taskToday",
      displayName: "Today",
      viewMode: "task",
      color: "#e06c75",
      icon: "📅",
      order: 1,
      description: "今天要处理的任务"
    }],
    ["taskTomorrow", {
      key: "taskTomorrow",
      displayName: "Tomorrow",
      viewMode: "task",
      color: "#d19a66",
      icon: "📆",
      order: 2,
      description: "明天的任务"
    }],
    ["taskThisWeek", {
      key: "taskThisWeek",
      displayName: "This Week",
      viewMode: "task",
      color: "#c678dd",
      icon: "📊",
      order: 3,
      description: "本周任务"
    }],
    ["taskTodo", {
      key: "taskTodo",
      displayName: "TODO",
      viewMode: "task",
      color: "#56b6c2",
      icon: "✅",
      order: 4,
      description: "待办事项"
    }],
    ["taskDailyTask", {
      key: "taskDailyTask",
      displayName: "日拱一卒",
      viewMode: "task",
      color: "#98c379",
      icon: "🏃",
      order: 5,
      description: "每日坚持的任务"
    }],

    ["custom1", {
      key: "custom1",
      displayName: "Custom 1",
      viewMode: "custom",
      color: "#98c379",
      icon: "🏃",
      order: 1,
      description: "默认自定义分区 1"
    }]
  ])

  /**
   * 获取单个分区配置
   * @param {string} key - 分区键名
   * @returns {Object|null} 配置对象，不存在返回 null
   */
  static getConfig(key) {
    return this.sections.get(key) || null
  }

  /**
   * 获取指定视图模式的所有分区配置（按 order 排序）
   * @param {string} mode - 视图模式：'pin' 或 'task'
   * @returns {Array} 配置对象数组
   */
  static getAllByMode(mode) {
    return Array.from(this.sections.values())
      .filter(section => section.viewMode === mode)
      .sort((a, b) => a.order - b.order)
  }

  /**
   * 获取所有分区键名（按 order 排序）
   * @param {string} mode - 可选，指定视图模式
   * @returns {Array<string>} 分区键名数组
   */
  static getOrderedKeys(mode = null) {
    let configs = mode
      ? this.getAllByMode(mode)
      : Array.from(this.sections.values()).sort((a, b) => {
          // 先按 viewMode 排序（pin < task），再按 order 排序
          if (a.viewMode !== b.viewMode) {
            return a.viewMode === 'pin' ? -1 : 1
          }
          return a.order - b.order
        })
    return configs.map(c => c.key)
  }

  /**
   * 获取分区的显示名称
   * @param {string} key - 分区键名
   * @returns {string} 显示名称，不存在返回键名本身
   */
  static getDisplayName(key) {
    let config = this.getConfig(key)
    return config ? config.displayName : key
  }

  /**
   * 检查分区是否存在
   * @param {string} key - 分区键名
   * @returns {boolean}
   */
  static has(key) {
    return this.sections.has(key)
  }

  /**
   * 添加新分区（动态扩展）
   * @param {Object} config - 分区配置对象
   * @returns {boolean} 是否添加成功
   */
  static addSection(config) {
    if (!config.key) {
      pinnerUtils.log("添加分区失败：缺少 key", "SectionRegistry:addSection")
      return false
    }
    if (this.sections.has(config.key)) {
      pinnerUtils.log(`分区 ${config.key} 已存在`, "SectionRegistry:addSection")
      return false
    }

    // 填充默认值
    let fullConfig = {
      displayName: config.key,
      viewMode: "pin",
      color: "#abb2bf",
      icon: "📋",
      order: 999,
      description: "",
      ...config
    }

    this.sections.set(config.key, fullConfig)
    pinnerUtils.log(`成功添加分区：${config.key}`, "SectionRegistry:addSection")
    return true
  }

  /**
   * 删除分区（谨慎使用）
   * @param {string} key - 分区键名
   * @returns {boolean} 是否删除成功
   */
  static removeSection(key) {
    if (!this.sections.has(key)) {
      return false
    }
    this.sections.delete(key)
    pinnerUtils.log(`已删除分区：${key}`, "SectionRegistry:removeSection")
    return true
  }

  /**
   * 获取配置版本（用于数据迁移）
   * @returns {string}
   */
  static getVersion() {
    return "1.0.0"
  }

  /**
   * 获取所有分区的配置（用于导出）
   * @returns {Array} 所有分区配置的数组
   */
  static getAllConfigs() {
    return Array.from(this.sections.values())
  }

  /**
   * 应用导入的分区配置（批量更新）
   * @param {Array} configs - 配置数组
   * @returns {Object} {success: boolean, updated: number, message: string}
   */
  static applySectionConfigs(configs) {
    try {
      if (!Array.isArray(configs)) {
        return {
          success: false,
          updated: 0,
          message: "配置数据格式错误"
        }
      }

      let updated = 0
      configs.forEach(config => {
        if (config.key && this.sections.has(config.key)) {
          let existingConfig = this.sections.get(config.key)
          // 只更新可修改的属性
          this.sections.set(config.key, {
            ...existingConfig,
            displayName: config.displayName || existingConfig.displayName,
            color: config.color || existingConfig.color,
            icon: config.icon || existingConfig.icon,
            order: config.order !== undefined ? config.order : existingConfig.order,
            description: config.description !== undefined ? config.description : existingConfig.description
          })
          updated++
        }
      })

      // 保存到存储
      this.saveToStorage()

      pinnerUtils.log(`应用导入配置成功，更新了 ${updated} 个分区`, "SectionRegistry:applySectionConfigs")

      return {
        success: true,
        updated: updated,
        message: `成功导入 ${updated} 个分区的配置`
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "SectionRegistry:applySectionConfigs")
      return {
        success: false,
        updated: 0,
        message: "导入配置失败: " + error.message
      }
    }
  }

  /**
   * 保存配置到 NSUserDefaults
   * 只保存可修改的属性：displayName, color, icon, order, description
   */
  static saveToStorage() {
    try {
      let configs = this.getAllConfigs().map(config => ({
        key: config.key,
        displayName: config.displayName,
        color: config.color,
        icon: config.icon,
        order: config.order,
        description: config.description,
        viewMode: config.viewMode  // 保存 viewMode 用于验证
      }))

      let jsonData = JSON.stringify(configs)
      NSUserDefaults.standardUserDefaults().setObjectForKey(jsonData, "MNPinner_sectionConfigs")

      pinnerUtils.log(`配置已保存到存储，共 ${configs.length} 个分区`, "SectionRegistry:saveToStorage")
      return true
    } catch (error) {
      pinnerUtils.addErrorLog(error, "SectionRegistry:saveToStorage")
      return false
    }
  }

  /**
   * 从 NSUserDefaults 加载配置
   * 如果存储中没有数据，则使用代码中的默认配置
   */
  static loadFromStorage() {
    try {
      let jsonData = NSUserDefaults.standardUserDefaults().objectForKey("MNPinner_sectionConfigs")

      if (!jsonData) {
        pinnerUtils.log("存储中无配置数据，使用默认配置", "SectionRegistry:loadFromStorage")
        return true
      }

      let configs = JSON.parse(jsonData)
      if (!Array.isArray(configs)) {
        pinnerUtils.log("配置数据格式错误，使用默认配置", "SectionRegistry:loadFromStorage")
        return false
      }

      // 应用加载的配置
      configs.forEach(config => {
        if (this.sections.has(config.key)) {
          let existingConfig = this.sections.get(config.key)
          // 只更新可修改的属性，保留 key 和 viewMode
          this.sections.set(config.key, {
            ...existingConfig,
            displayName: config.displayName,
            color: config.color,
            icon: config.icon,
            order: config.order,
            description: config.description
          })
        }
      })

      pinnerUtils.log(`从存储加载配置成功，共 ${configs.length} 个分区`, "SectionRegistry:loadFromStorage")
      return true
    } catch (error) {
      pinnerUtils.addErrorLog(error, "SectionRegistry:loadFromStorage")
      return false
    }
  }

  /**
   * 重置为默认配置（代码中定义的配置）
   * 删除 NSUserDefaults 中的数据，然后重新加载
   */
  static resetToDefault() {
    try {
      NSUserDefaults.standardUserDefaults().removeObjectForKey("MNPinner_sectionConfigs")

      // 重新初始化 sections Map（恢复代码中的默认值）
      // 由于 Map 是静态定义的，我们需要手动重置每个值
      this.sections = new Map([
        // Pin 视图分区
        ["focus", {
          key: "focus",
          displayName: "Focus",
          viewMode: "pin",
          color: "#457bd3",
          icon: "📌",
          order: 1,
          description: "重点关注的卡片"
        }],
        ["midway", {
          key: "midway",
          displayName: "中间知识",
          viewMode: "pin",
          color: "#61afef",
          icon: "📚",
          order: 2,
          description: "待进一步处理的知识"
        }],
        ["toOrganize", {
          key: "toOrganize",
          displayName: "待整理",
          viewMode: "pin",
          color: "#98c379",
          icon: "📥",
          order: 3,
          description: "需要整理的零散内容"
        }],
        ["class", {
          key: "class",
          displayName: "Class",
          viewMode: "pin",
          color: "#e5c07b",
          icon: "🎓",
          order: 4,
          description: "课程相关内容"
        }],

        // Task 视图分区
        ["taskToday", {
          key: "taskToday",
          displayName: "Today",
          viewMode: "task",
          color: "#e06c75",
          icon: "📅",
          order: 1,
          description: "今天要处理的任务"
        }],
        ["taskTomorrow", {
          key: "taskTomorrow",
          displayName: "Tomorrow",
          viewMode: "task",
          color: "#d19a66",
          icon: "📆",
          order: 2,
          description: "明天的任务"
        }],
        ["taskThisWeek", {
          key: "taskThisWeek",
          displayName: "This Week",
          viewMode: "task",
          color: "#c678dd",
          icon: "📊",
          order: 3,
          description: "本周任务"
        }],
        ["taskTodo", {
          key: "taskTodo",
          displayName: "TODO",
          viewMode: "task",
          color: "#56b6c2",
          icon: "✅",
          order: 4,
          description: "待办事项"
        }],
        ["taskDailyTask", {
          key: "taskDailyTask",
          displayName: "日拱一卒",
          viewMode: "task",
          color: "#98c379",
          icon: "🏃",
          order: 5,
          description: "每日坚持的任务"
        }],

        // Custom 视图分区
        ["custom1", {
          key: "custom1",
          displayName: "自定义 1",
          viewMode: "custom",
          color: "#98c379",
          icon: "📌",
          order: 1,
          description: "自定义分区 1"
        }],
        ["custom2", {
          key: "custom2",
          displayName: "自定义 2",
          viewMode: "custom",
          color: "#61afef",
          icon: "📌",
          order: 2,
          description: "自定义分区 2"
        }],
        ["custom3", {
          key: "custom3",
          displayName: "自定义 3",
          viewMode: "custom",
          color: "#c678dd",
          icon: "📌",
          order: 3,
          description: "自定义分区 3"
        }],
        ["custom4", {
          key: "custom4",
          displayName: "自定义 4",
          viewMode: "custom",
          color: "#e5c07b",
          icon: "📌",
          order: 4,
          description: "自定义分区 4"
        }],
        ["custom5", {
          key: "custom5",
          displayName: "自定义 5",
          viewMode: "custom",
          color: "#56b6c2",
          icon: "📌",
          order: 5,
          description: "自定义分区 5"
        }]
      ])

      pinnerUtils.log("配置已重置为默认值", "SectionRegistry:resetToDefault")
      return true
    } catch (error) {
      pinnerUtils.addErrorLog(error, "SectionRegistry:resetToDefault")
      return false
    }
  }
}


class pinnerConfig {
  // 路径和定时器
  static mainPath
  static dataDir
  static backUpTimer

  // 数据存储 - 不直接初始化，在 init 中赋值
  static sections       // {focus: [], midway: []}
  static config         // {version, modifiedTime, lastSyncTime}
  static settings       // 设置项 {alwaysAskCardTitle, alwaysAskPageTitle, defaultViewMode, defaultSection}
  static previousConfig // 用于备份上一次的配置

  // 默认设置
  static getDefaultSettings() {
    return {
      alwaysAskCardTitle: false,   // Pin卡片时是否总是询问标题
      alwaysAskPageTitle: false,   // Pin页面时是否总是询问标题
      defaultViewMode: "pin",      // 默认视图模式: pin/task
      defaultSection: "focus"      // 默认打开的分区
    }
  }

  /**
   * 默认分区数据结构（从 SectionRegistry 动态生成）
   * 使用 getter 避免多窗口共享问题
   * @returns {Object} 分区数据对象，每个分区初始化为空数组
   */
  static get defaultSections() {
    let sections = {}

    // 从 SectionRegistry 获取所有分区键名
    let allKeys = SectionRegistry.getOrderedKeys()

    // 初始化所有分区为空数组
    allKeys.forEach(key => {
      sections[key] = []
    })

    // 保留已废弃的分区用于数据迁移
    sections.pages = []  // 旧的文档页面分区（已废弃，但需保留用于数据迁移）

    return sections
  }
  
  // 会造成 iPad 闪退，先去掉
  // static defaultConfig = {
  //   version: "1.0.0",
  //   modifiedTime: 0,
  //   lastSyncTime: null,
  //   autoImport: false,  // 预留自动导入功能
  //   autoExport: false,  // 预留自动导出功能
  // }
  
  /**
   * 初始化配置管理
   * @param {string} mainPath - 插件主路径
   */
  static init(mainPath) {
    try {
      if (mainPath) {
        this.mainPath = mainPath
      }

      // 初始化配置
      this.config = {
        version: "1.0.0",
        source: "focus",  // 默认显示的分区
        pageTitlePresets: []  // 页面标题预设短语（默认空列表）
      }

      // 尝试读取新格式数据
      let sections = NSUserDefaults.standardUserDefaults().objectForKey("MNPinner_sections")

      if (!sections) {
        // 没有新格式，检查旧格式并迁移
        let tempPins = NSUserDefaults.standardUserDefaults().objectForKey("MNPinner_temporaryPins")

        if (tempPins && tempPins.length > 0) {
          // 执行数据迁移：旧的临时卡片迁移到中间知识
          this.sections = {
            focus: [],              // 新的focus分区初始为空
            midway: tempPins        // 旧的临时卡片迁移到中间知识
          }

          pinnerUtils.log("数据迁移：将临时卡片迁移到中间知识分区", "pinnerConfig:init")

          // 保存迁移后的数据
          this.save()

          // 清理旧数据
          NSUserDefaults.standardUserDefaults().removeObjectForKey("MNPinner_temporaryPins")
          NSUserDefaults.standardUserDefaults().removeObjectForKey("MNPinner_permanentPins")
        } else {
          // 全新安装，初始化空数据
          this.sections = this.defaultSections
          this.save()
        }
      } else {
        // 已有新格式数据，直接使用
        this.sections = sections

        // 合并新增的分区（向后兼容）
        let defaultSecs = this.defaultSections
        let hasNewSection = false
        for (let key in defaultSecs) {
          if (!this.sections[key]) {
            this.sections[key] = defaultSecs[key]
            hasNewSection = true
            pinnerUtils.log(`Added new section: ${key}`, "pinnerConfig:init")
          }
        }

        // 如果有新增分区，保存一次
        if (hasNewSection) {
          this.save()
          pinnerUtils.log("Saved new sections to storage", "pinnerConfig:init")
        }
      }

      // 数据迁移：为现有 Card 数据添加 type 字段
      let needMigration = false
      for (let section in this.sections) {
        // pages 分区单独处理
        if (section === "pages") {
          this.sections[section] = this.sections[section].map(pin => {
            if (!pin.type) {
              needMigration = true
              return this.createPagePin(pin.docMd5, pin.pageIndex, pin.title, pin.note)
            }
            return pin
          })
          continue
        }

        // 其他分区（Card 类型）
        this.sections[section] = this.sections[section].map(pin => {
          if (!pin.type) {
            needMigration = true
            return this.createCardPin(pin.noteId, pin.title)
          }
          return pin
        })
      }

      if (needMigration) {
        this.save()
        pinnerUtils.log("Migrated pins to new format with type field", "pinnerConfig:init")
      }

      // 数据迁移：将 pages 分区的数据迁移到 toOrganize 分区
      if (this.sections.pages && this.sections.pages.length > 0) {
        let pagesCount = this.sections.pages.length

        // 将所有 Page 数据转移到待整理分区
        if (!this.sections.toOrganize) {
          this.sections.toOrganize = []
        }
        this.sections.toOrganize.push(...this.sections.pages)

        // 清空 pages 分区
        this.sections.pages = []

        // 保存迁移结果
        this.save()

        // 提示用户
        MNUtil.showHUD(`已将 ${pagesCount} 个页面卡片迁移到"待整理"分区`)
        pinnerUtils.log(`Migrated ${pagesCount} pages to toOrganize section`, "pinnerConfig:init")
      }

      // 数据迁移：将 dailyTask 分区的数据迁移到 taskDailyTask 分区
      if (this.sections.dailyTask && this.sections.dailyTask.length > 0) {
        let dailyTaskCount = this.sections.dailyTask.length

        // 将所有数据转移到 Task 视图的日拱一卒分区
        if (!this.sections.taskDailyTask) {
          this.sections.taskDailyTask = []
        }
        this.sections.taskDailyTask.push(...this.sections.dailyTask)

        // 清空旧的 dailyTask 分区
        delete this.sections.dailyTask

        // 保存迁移结果
        this.save()

        // 提示用户
        MNUtil.showHUD(`已将 ${dailyTaskCount} 个卡片迁移到 Task 视图的"日拱一卒"分区`)
        pinnerUtils.log(`Migrated ${dailyTaskCount} items from dailyTask to taskDailyTask section`, "pinnerConfig:init")
      }

      // 加载设置项
      let savedSettings = NSUserDefaults.standardUserDefaults().objectForKey("MNPinner_settings")
      if (savedSettings) {
        // 合并保存的设置和默认设置（向后兼容）
        this.settings = Object.assign({}, this.getDefaultSettings(), savedSettings)
      } else {
        // 使用默认设置
        this.settings = this.getDefaultSettings()
        this.saveSettings()
      }

      // 加载配置项
      let savedConfig = NSUserDefaults.standardUserDefaults().objectForKey("MNPinner_config")
      if (savedConfig) {
        // 合并已保存的配置（向后兼容新增字段）
        this.config = Object.assign({}, this.config, savedConfig)

        // 为旧版配置添加新字段
        let needUpdate = false
        if (!this.config.pageTitlePresets) {
          this.config.pageTitlePresets = []
          needUpdate = true
        }

        if (needUpdate) {
          this.save()
          pinnerUtils.log("Updated config with new fields", "pinnerConfig:init")
        }
      }

      // 加载图片资源
      this.closeImage = this.mainPath + "/close.png"
      this.resizeImage = this.mainPath + "/resize.png"

      // 加载分区配置（从 NSUserDefaults 恢复用户自定义）
      SectionRegistry.loadFromStorage()

      // 初始化自定义视图配置
      this.ensureCustomConfig()

      pinnerUtils.log("pinnerConfig initialized with sections and settings", "pinnerConfig:init")
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:init")
    }
  }

  /**
   * 确保自定义视图的数据结构存在
   * 在初始化时调用，保证 custom1-custom5 分区数据完整
   */
  static ensureCustomConfig() {
    try {
      let customKeys = ["custom1", "custom2", "custom3", "custom4", "custom5"]
      let needSave = false

      customKeys.forEach(key => {
        if (!this.sections[key]) {
          this.sections[key] = []
          needSave = true
          pinnerUtils.log(`Initialized custom section: ${key}`, "pinnerConfig:ensureCustomConfig")
        }
      })

      if (needSave) {
        this.save()
        pinnerUtils.log("Saved custom sections to storage", "pinnerConfig:ensureCustomConfig")
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:ensureCustomConfig")
    }
  }

  /**
   * 检查并创建数据目录
   */
  static checkDataDir() {
    if (MNUtil.initialized) {
      return
    }
    let extensionPath = subscriptionUtils.extensionPath
    if (extensionPath) {
      let dataPath = extensionPath+"/data"
      if (MNUtil.isfileExists(dataPath)) {
        return
      }
      MNUtil.createFolderDev(dataPath)
    }
  }
  
  /**
   * 检查本地配置是否存在
   * @param {string} key - 配置键名
   */
  static isLocalConfigExists(key) {
    let value = NSUserDefaults.standardUserDefaults().objectForKey(key)
    if (value && Object.keys(value).length > 0) {
      return true
    }
    return false
  }
  
  /**
   * 检查备份文件是否存在
   */
  static isBackUpConfigExists() {
    if (MNUtil.isfileExists(this.backUpFile)) {
      let backupConfig = MNUtil.readJSON(this.backUpFile)
      if (backupConfig && Object.keys(backupConfig).length > 0) {
        return true
      }
    }
    return false
  }
  
  /**
   * 获取数据，如果不存在则使用默认值
   * @param {string} key - 存储键名
   * @param {any} defaultValue - 默认值
   * @param {string} backUpFile - 备份文件路径（可选）
   */
  static getByDefault(key, defaultValue, backUpFile) {
    let value = NSUserDefaults.standardUserDefaults().objectForKey(key)
    
    if (value === undefined) {
      // 如果不存在，检查备份文件
      if (backUpFile && MNUtil.isfileExists(backUpFile)) {
        let backupConfig = MNUtil.readJSON(backUpFile)
        if (backupConfig && Object.keys(backupConfig).length > 0) {
          MNUtil.log("backupConfig.readFromBackupFile")
          return backupConfig
        }
      }
      // 使用默认值并保存
      NSUserDefaults.standardUserDefaults().setObjectForKey(defaultValue, key)
      return defaultValue
    }
    return value
  }
  
  /**
   * 获取配置项
   * @param {string} key - 配置键名
   */
  static getConfig(key) {
    return this.config[key]
  }
  
  /**
   * 设置配置项
   * @param {string} key - 配置键名
   * @param {any} value - 配置值
   */
  static setConfig(key, value) {
    this.config[key] = value
    // this.save("MNPinner_config")
  }
  
  /**
   * 保存数据到本地存储
   * @param {string} sectionName - 特定分区名，undefined 则保存所有
   */
  static save(sectionName) {
    try {
      // 保存整个sections对象
      NSUserDefaults.standardUserDefaults().setObjectForKey(this.sections, "MNPinner_sections")

      // 保存配置
      NSUserDefaults.standardUserDefaults().setObjectForKey(this.config, "MNPinner_config")

      // 为了向后兼容，清理旧的key
      NSUserDefaults.standardUserDefaults().removeObjectForKey("MNPinner_temporaryPins")
      NSUserDefaults.standardUserDefaults().removeObjectForKey("MNPinner_permanentPins")

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:save")
    }
  }

  /**
   * 保存设置项
   */
  static saveSettings() {
    try {
      NSUserDefaults.standardUserDefaults().setObjectForKey(this.settings, "MNPinner_settings")
      pinnerUtils.log("Settings saved", "pinnerConfig:saveSettings")
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:saveSettings")
    }
  }

  /**
   * 导入后保存
   */
  static saveAfterImport() {
    this.save(undefined, true, true)  // 忽略自动导出，立即同步
  }
  
  /**
   * 备份到 JSON 文件
   */
  static backUp() {
    try {
      pinnerUtils.log("Backing up data", "pinnerConfig:backUp")
      let totalConfig = this.getAllConfig()
      MNUtil.writeJSON(this.backUpFile, totalConfig)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:backUp")
    }
  }
  
  /**
   * 获取所有配置（统一命名）
   */
  static getAllConfig() {
    return {
      sections: this.sections,
      config: this.config,
      settings: this.settings,
      sectionConfigs: SectionRegistry.getAllConfigs(),  // 分区配置
      version: "1.2.0"  // 版本号升级
    }
  }
  
  /**
   * 验证配置格式（统一命名）
   * 支持 1.0.0, 1.1.0, 1.2.0 版本
   * 支持 Card Pin 和 Page Pin 两种类型
   */
  static isValidTotalConfig(data) {
    if (!data || typeof data !== 'object') return false

    // 验证 pin 数据格式（支持 Card 和 Page 类型）
    let validatePins = (pins) => {
      if (!Array.isArray(pins)) return true
      return pins.every(pin => {
        if (!pin || typeof pin !== 'object') return false

        // Card 类型：必须有 noteId 和 title
        if (pin.type === "card" || !pin.type) {
          return 'noteId' in pin && 'title' in pin
        }

        // Page 类型：必须有 docMd5, pageIndex, title
        if (pin.type === "page") {
          return 'docMd5' in pin && 'pageIndex' in pin && 'title' in pin
        }

        return false
      })
    }

    // 支持 1.2.0 版本
    if (data.version === "1.2.0") {
      if (!data.sections || typeof data.sections !== 'object') return false
      // 验证所有分区的数据格式
      for (let section in data.sections) {
        if (!validatePins(data.sections[section])) return false
      }
      return true
    }

    // 支持 1.1.0 版本
    if (data.version === "1.1.0") {
      if (!data.sections || typeof data.sections !== 'object') return false
      // 验证所有分区
      for (let section in data.sections) {
        if (!validatePins(data.sections[section])) return false
      }
      return true
    }

    // 支持 1.0.0 版本（原有逻辑保留，但改为动态验证所有分区）
    if (data.version === "1.0.0") {
      if (!data.sections || typeof data.sections !== 'object') return false
      for (let section in data.sections) {
        if (!validatePins(data.sections[section])) return false
      }
      return true
    }

    // 旧版本格式（兼容）
    if (data.temporaryPins) {
      if (data.temporaryPins && !validatePins(data.temporaryPins)) return false
      return true
    }

    return false
  }
  
  /**
   * 导入配置
   */
  static importConfig(newConfig) {
    try {
      if (!this.isValidTotalConfig(newConfig)) {
        MNUtil.showHUD("Invalid config format")
        return false
      }

      // 保存当前配置作为备份
      this.previousConfig = this.getAllConfig()

      // 判断版本并导入
      if (newConfig.version === "1.2.0") {
        // 1.2.0 版本格式（包含 sectionConfigs）
        this.sections = newConfig.sections || this.defaultSections
        this.config = newConfig.config || { version: "1.2.0", source: "focus" }
        this.settings = newConfig.settings || this.getDefaultSettings()

        // 应用分区配置（如果存在）
        if (newConfig.sectionConfigs) {
          let result = SectionRegistry.applySectionConfigs(newConfig.sectionConfigs)
          if (result.success) {
            pinnerUtils.log(result.message, "pinnerConfig:importConfig")
          }
        }
      } else if (newConfig.version === "1.1.0") {
        // 最新版本格式（包含settings）
        this.sections = newConfig.sections || this.defaultSections
        this.config = newConfig.config || { version: "1.1.0", source: "focus" }
        this.settings = newConfig.settings || this.getDefaultSettings()
      } else if (newConfig.version === "1.0.0") {
        // 1.0.0 版本格式（无settings）
        this.sections = newConfig.sections || this.defaultSections
        this.config = newConfig.config || { version: "1.0.0", source: "focus" }
        this.settings = this.getDefaultSettings()  // 使用默认设置
      } else {
        // 旧版本格式，执行迁移
        this.sections = {
          focus: [],
          midway: newConfig.temporaryPins || []
        }
        this.config = { version: "1.1.0", source: "focus" }
        this.settings = this.getDefaultSettings()
      }

      // 保存
      this.save()
      this.saveSettings()

      MNUtil.showHUD("导入成功!")
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:importConfig")
      return false
    }
  }
  
  /**
   * 导出配置到文件
   */
  static exportToFile() {
    try {
      // 更新最后同步时间
      this.config.lastSyncTime = Date.now()

      let fileName = "MNPinner_" + new Date().toISOString().slice(0,10) + ".json"
      let filePath = MNUtil.tempPath + "/" + fileName

      // 使用 MNUtil.writeJSON 写文件（与 mnchatglm 实现一致）
      MNUtil.writeJSON(filePath, this.getAllConfig())
      MNUtil.saveFile(filePath, "public.json")

      MNUtil.showHUD("✅ 已导出到文件")

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:exportToFile")
    }
  }

  /**
   * 从文件导入配置
   */
  static async importFromFile() {
    try {
      // ✅ 使用数组参数 + await（参考 MNToolbar/MNTask 实现）
      let path = await MNUtil.importFile(["public.json"])

      if (!path) {
        MNUtil.showHUD("未选择文件")
        return false
      }

      // ✅ 使用 MNUtil.readJSON 高级 API
      let config = MNUtil.readJSON(path)
      let success = this.importConfig(config)

      if (success) {
        MNUtil.showHUD("✅ 导入成功")
      }

      return success
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:importFromFile")
      MNUtil.showHUD("❌ 文件导入失败")
      return false
    }
  }

  /**
   * 导出配置到剪贴板
   */
  static exportToClipboard() {
    try {
      let data = this.getAllConfig()
      MNUtil.copyJSON(data)
      MNUtil.showHUD("✅ 已复制到剪贴板")
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:exportToClipboard")
    }
  }

  /**
   * 从剪贴板导入配置
   */
  static importFromClipboard() {
    try {
      let jsonText = MNUtil.clipboardText
      if (!jsonText) {
        MNUtil.showHUD("剪贴板为空")
        return false
      }

      let data = JSON.parse(jsonText)
      return this.importConfig(data)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:importFromClipboard")
      MNUtil.showHUD("剪贴板数据格式错误")
      return false
    }
  }

  /**
   * 导出配置到当前卡片
   */
  static exportToCurrentNote() {
    try {
      let focusNote = MNNote.getFocusNote()
      if (!focusNote) {
        MNUtil.showHUD("请先选中一张卡片")
        return
      }

      let data = this.getAllConfig()
      MNUtil.undoGrouping(() => {
        focusNote.noteTitle = "MNPinner_Config"
        focusNote.excerptText = "```JSON\n" + JSON.stringify(data, null, 2) + "\n```"
        focusNote.excerptTextMarkdown = true
      })
      MNUtil.showHUD("✅ 已导出到当前卡片")
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:exportToCurrentNote")
    }
  }

  /**
   * 从当前卡片导入配置
   */
  static importFromCurrentNote() {
    try {
      let focusNote = MNNote.getFocusNote()
      if (!focusNote) {
        MNUtil.showHUD("请先选中一张卡片")
        return false
      }

      if (focusNote.noteTitle !== "MNPinner_Config") {
        MNUtil.showHUD("请选中标题为 'MNPinner_Config' 的卡片")
        return false
      }

      let data = this.extractJSONFromMarkdown(focusNote.excerptText)
      if (!data) {
        MNUtil.showHUD("无法解析 JSON 数据")
        return false
      }

      return this.importConfig(data)
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:importFromCurrentNote")
      return false
    }
  }

  /**
   * 从 Markdown 中提取 JSON
   * @param {string} markdown - Markdown 文本
   * @returns {Object|undefined} 解析后的 JSON 对象
   */
  static extractJSONFromMarkdown(markdown) {
    try {
      // 使用正则表达式匹配被 ```JSON``` 包裹的内容
      const regex = /```JSON([\s\S]*?)```/g;
      const matches = regex.exec(markdown);

      // 提取匹配结果中的 JSON 字符串部分，并去掉多余的空格和换行符
      if (matches && matches[1]) {
        const jsonString = matches[1].trim();
        return JSON.parse(jsonString);
      } else {
        return undefined;
      }
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:extractJSONFromMarkdown")
      return undefined
    }
  }

  // ========== Pin 操作方法 ==========

  /**
   * 创建 Card 类型的 Pin 数据
   * @param {string} noteId - 卡片ID
   * @param {string} title - 卡片标题
   * @returns {Object} Pin 数据对象
   */
  static createCardPin(noteId, title) {
    return {
      type: "card",
      noteId: noteId,
      title: title || "未命名卡片"
    }
  }

  /**
   * 创建 Page 类型的 Pin 数据
   * @param {string} docMd5 - 文档 MD5
   * @param {number} pageIndex - 页码（从 0 开始）
   * @param {string} title - 自定义标题
   * @param {string} note - 备注
   * @returns {Object} Pin 数据对象
   */
  static createPagePin(docMd5, pageIndex, title, note) {
    return {
      type: "page",
      docMd5: docMd5,
      pageIndex: pageIndex,
      title: title || `第${pageIndex + 1}页`,
      note: note || "",
      pinnedAt: Date.now()
    }
  }

  /**
   * 统一的 Pin 添加方法（支持 Card 和 Page 类型）
   * @param {Object} pinData - Pin 数据对象（必须包含 type 字段）
   * @param {string} section - 分区名称
   * @param {string|number} position - 位置：'top', 'bottom' 或具体索引
   * @returns {boolean} 是否添加成功
   */
  static addPin(pinData, section = "midway", position = "bottom") {
    try {
      if (!this.sections[section]) {
        pinnerUtils.addErrorLog("Invalid section: " + section, "pinnerConfig:addPin")
        return false
      }

      if (!pinData.type) {
        pinnerUtils.addErrorLog("Pin data must have a type field", "pinnerConfig:addPin")
        return false
      }

      let pins = this.sections[section]

      // 根据 type 进行去重检查
      let isDuplicate = false
      if (pinData.type === "card") {
        isDuplicate = pins.find(p => p.type === "card" && p.noteId === pinData.noteId)
      } else if (pinData.type === "page") {
        isDuplicate = pins.find(p =>
          p.type === "page" &&
          p.docMd5 === pinData.docMd5 &&
          p.pageIndex === pinData.pageIndex
        )
      }

      if (isDuplicate) {
        // MNUtil.showHUD("已存在")
        return false
      }

      // 根据 position 参数插入到指定位置
      if (position === "top") {
        pins.unshift(pinData)  // 插入到开头
      } else if (position === "bottom") {
        pins.push(pinData)  // 插入到末尾
      } else if (typeof position === "number" || !isNaN(Number(position))) {
        let index = Number(position)
        // 确保索引在有效范围内
        if (index < 0) index = 0
        if (index > pins.length) index = pins.length
        pins.splice(index, 0, pinData)  // 插入到指定位置
      } else {
        // 无效的 position 参数，默认添加到末尾
        pins.push(pinData)
      }

      // 保存
      this.save()

      // let typeName = pinData.type === "card" ? "卡片" : "页面"
      // pinnerUtils.log(`Added ${pinData.type} pin at position ${position} to ${section}: ${pinData.title}`, "pinnerConfig:addPin")
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:addPin")
      return false
    }
  }

  /**
   * 在指定位置添加卡片
   * @param {string} noteId - 卡片ID
   * @param {string} title - 卡片标题
   * @param {string} section - 分区名称
   * @param {string|number} position - 位置：'top', 'bottom' 或具体索引
   * @returns {boolean} 是否添加成功
   */
  static addPinAtPosition(noteId, title, section = "midway", position = "bottom") {
    try {
      if (!this.sections[section]) {
        pinnerUtils.addErrorLog("Invalid section: " + section, "pinnerConfig:addPinAtPosition")
        return false
      }

      let pins = this.sections[section]

      // 检查是否已存在
      if (pins.find(p => p.noteId === noteId)) {
        MNUtil.showHUD("卡片已存在")
        return false
      }

      // 创建新的 pin 对象
      let newPin
      let note = MNNote.new(noteId)
      if (!note) { return }
      let parsedTitle = KnowledgeBaseTemplate.parseNoteTitle(note)
      switch (KnowledgeBaseTemplate.getNoteType(note)) {
        case "定义":
        case "命题":
        case "例子":
        case "反例":
        case "问题":
          newPin = this.createCardPin(
            noteId,
            parsedTitle.type + ": " + KnowledgeBaseTemplate.getFirstTitleLinkWord(note) || "未命名卡片"
          )
          break;
        default:
          // 使用工厂方法创建 Card Pin
          newPin = this.createCardPin(noteId, title)
          break;
      }

      // 根据 position 参数插入到指定位置
      if (position === "top") {
        pins.unshift(newPin)  // 插入到开头
      } else if (position === "bottom") {
        pins.push(newPin)  // 插入到末尾
      } else if (typeof position === "number" || !isNaN(Number(position))) {
        let index = Number(position)
        // 确保索引在有效范围内
        if (index < 0) index = 0
        if (index > pins.length) index = pins.length
        pins.splice(index, 0, newPin)  // 插入到指定位置
      } else {
        // 无效的 position 参数，默认添加到末尾
        pins.push(newPin)
      }

      // 保存
      this.save()

      pinnerUtils.log(`Added pin at position ${position} to ${section}: ${title}`, "pinnerConfig:addPinAtPosition")
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:addPinAtPosition")
      return false
    }
  }

  /**
   * 将已存在的卡片移动到指定位置
   * @param {string} noteId - 卡片ID
   * @param {string} section - 分区名称
   * @param {string} position - 位置：'top' 或 'bottom'
   * @returns {boolean} 是否移动成功
   */
  static movePinToPosition(noteId, section, position) {
    try {
      if (!this.sections[section]) {
        pinnerUtils.addErrorLog("Invalid section: " + section, "pinnerConfig:movePinToPosition")
        return false
      }

      let pins = this.sections[section]

      // 查找卡片索引
      let currentIndex = pins.findIndex(p => p.noteId === noteId)
      if (currentIndex === -1) {
        MNUtil.showHUD("卡片不存在")
        return false
      }

      let targetIndex
      if (position === "top") {
        targetIndex = 0
      } else if (position === "bottom") {
        targetIndex = pins.length - 1
      } else {
        return false
      }

      // 如果已经在目标位置，不需要移动
      if (currentIndex === targetIndex) {
        return true
      }

      // 移动卡片
      let [item] = pins.splice(currentIndex, 1)
      pins.splice(targetIndex, 0, item)

      // 保存
      this.save()

      if (pinnerUtils.pinnerController && !pinnerUtils.pinnerController.view.hidden) {
        pinnerUtils.pinnerController.refreshView(section + "View")
      }

      pinnerUtils.log(`Moved pin to ${position} in ${section}`, "pinnerConfig:movePinToPosition")
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:movePinToPosition")
      return false
    }
  }

  /**
   * 在 Pin 数组中查找 Pin 的索引
   * @private
   * @param {Array} pins - Pin 数组
   * @param {Object} pin - 要查找的 Pin 对象
   * @returns {number} 索引，未找到返回 -1
   */
  static findPinIndex(pins, pin) {
    if (pin.type === "card") {
      return pins.findIndex(p => p.type === "card" && p.noteId === pin.noteId)
    } else if (pin.type === "page") {
      return pins.findIndex(p =>
        p.type === "page" &&
        p.docMd5 === pin.docMd5 &&
        p.pageIndex === pin.pageIndex
      )
    }
    // 兼容没有 type 字段的旧数据（默认为 card）
    return pins.findIndex(p => p.noteId === pin.noteId)
  }

  /**
   * 删除 Pin（支持 Card 和 Page 类型）
   * @param {Object|string} pinOrId - Pin 对象或 noteId（兼容旧版）
   * @param {string} section - 分区名称
   */
  static removePin(pinOrId, section) {
    try {
      // 兼容旧版：如果传入的是字符串，视为 noteId（Card 类型）
      let pin = pinOrId
      if (typeof pinOrId === 'string') {
        pin = { type: "card", noteId: pinOrId }
      }

      // 如果没有指定分区，在所有分区中查找并删除
      if (!section) {
        for (let sec in this.sections) {
          let pins = this.sections[sec]
          let index = this.findPinIndex(pins, pin)
          if (index !== -1) {
            pins.splice(index, 1)
            this.save()
            pinnerUtils.log(`Removed ${pin.type} pin from ${sec}`, "pinnerConfig:removePin")
            return true
          }
        }
        return false
      }

      // 指定分区删除
      if (!this.sections[section]) return false

      let pins = this.sections[section]
      let index = this.findPinIndex(pins, pin)

      if (index === -1) {
        return false
      }

      pins.splice(index, 1)
      this.save()

      pinnerUtils.log(`Removed ${pin.type} pin from ${section}`, "pinnerConfig:removePin")
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:removePin")
      return false
    }
  }

  /**
   * 在 Pin 数组中查找 Pin 的索引
   * @private
   * @param {Array} pins - Pin 数组
   * @param {Object} pin - 要查找的 Pin 对象
   * @returns {number} 索引，未找到返回 -1
   */
  static findPinIndex(pins, pin) {
    if (pin.type === "card") {
      return pins.findIndex(p => p.type === "card" && p.noteId === pin.noteId)
    } else if (pin.type === "page") {
      return pins.findIndex(p =>
        p.type === "page" &&
        p.docMd5 === pin.docMd5 &&
        p.pageIndex === pin.pageIndex
      )
    }
    // 兼容没有 type 字段的旧数据（默认为 card）
    return pins.findIndex(p => p.noteId === pin.noteId)
  }
  
  /**
   * 移动 Pin 顺序
   * @param {number} oldIndex - 原位置
   * @param {number} newIndex - 新位置
   * @param {string} section - 分区名称
   */
  static movePin(oldIndex, newIndex, section) {
    try {
      MNLog.log("=== movePin 数据层开始 ===")
      MNLog.log(`参数: oldIndex=${oldIndex}, newIndex=${newIndex}, section=${section}`)

      if (!this.sections[section]) {
        MNLog.log(`错误: section '${section}' 不存在`)
        MNLog.log(`可用的 sections: ${Object.keys(this.sections).join(', ')}`)
        return false
      }

      let pins = this.sections[section]
      MNLog.log(`分区 '${section}' 中有 ${pins.length} 个 pins`)

      if (oldIndex < 0 || oldIndex >= pins.length ||
          newIndex < 0 || newIndex >= pins.length) {
        MNLog.log(`错误: 索引越界 (oldIndex=${oldIndex}, newIndex=${newIndex}, length=${pins.length})`)
        return false
      }

      MNLog.log(`移动前的 pin: ${JSON.stringify(pins[oldIndex])}`)
      let [item] = pins.splice(oldIndex, 1)
      pins.splice(newIndex, 0, item)
      MNLog.log(`移动后位置 ${newIndex} 的 pin: ${JSON.stringify(pins[newIndex])}`)

      this.save()
      MNLog.log("数据已保存")

      return true

    } catch (error) {
      MNLog.log(`movePin 异常: ${error.message}`)
      MNUtil.copyJSON(error)
      pinnerUtils.addErrorLog(error, "pinnerConfig:movePin")
      return false
    }
  }

  /**
   * 更新 Pin 的 noteId（用于将空白卡片转换为真实卡片）
   * @param {string} section - 分区名称
   * @param {string} oldNoteId - 旧的 noteId（空白卡片 ID）
   * @param {string} newNoteId - 新的 noteId（真实卡片 ID）
   * @returns {boolean} - 是否更新成功
   */
  static updatePinId(section, oldNoteId, newNoteId) {
    try {
      if (!this.sections[section]) {
        pinnerUtils.addErrorLog(`Invalid section: ${section}`, "pinnerConfig:updatePinId")
        return false
      }

      let pins = this.sections[section]
      let pin = pins.find(p => p.noteId === oldNoteId)

      if (!pin) {
        pinnerUtils.addErrorLog(`Pin not found: ${oldNoteId}`, "pinnerConfig:updatePinId")
        return false
      }

      // 更新 noteId
      pin.noteId = newNoteId

      // 确保 pin 有 type 字段（防御性编程，兼容旧数据）
      if (!pin.type) {
        pin.type = "card"
      }

      // 保存
      this.save()

      pinnerUtils.log(`Updated pin ID from ${oldNoteId} to ${newNoteId} in ${section}`, "pinnerConfig:updatePinId")
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:updatePinId")
      return false
    }
  }

  /**
   * 清空分区
   * @param {string} section - 分区名称
   */
  static async clearPins(section) {
    try {
      if (!this.sections[section]) return false

      let sectionName = section === 'focus' ? 'Focus' : '中间知识'
      let confirm = await MNUtil.confirm(`清空 ${sectionName} 分区的所有卡片？`, "")
      if (!confirm) return false

      this.sections[section] = []
      this.save()

      if (pinnerUtils.pinnerController && !pinnerUtils.pinnerController.view.hidden) {
        pinnerUtils.pinnerController.refreshView(section + "View")
      }
      MNUtil.showHUD(`已清空 ${sectionName}`)
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:clearPins")
      return false
    }
  }
  
  /**
   * 获取分区卡片
   * @param {string} section - 分区名称
   */
  static getPins(section) {
    return this.sections[section] || []
  }

  /**
   * 转移 Pin 到其他分区（支持 Card 和 Page 类型）
   * @param {Object|string} pinOrId - Pin 对象或 noteId（兼容旧版）
   * @param {string} fromSection - 源分区
   * @param {string} toSection - 目标分区
   */
  static transferPin(pinOrId, fromSection, toSection) {
    try {
      if (!this.sections[fromSection] || !this.sections[toSection]) {
        pinnerUtils.addErrorLog("Invalid section", "pinnerConfig:transferPin")
        return false
      }

      // 兼容旧版：如果传入的是字符串，视为 noteId（Card 类型）
      let pin = pinOrId
      if (typeof pinOrId === 'string') {
        pin = { type: "card", noteId: pinOrId }
      }

      let fromPins = this.sections[fromSection]
      let toPins = this.sections[toSection]

      let index = this.findPinIndex(fromPins, pin)
      if (index === -1) return false

      // 检查目标分区是否已存在
      if (this.findPinIndex(toPins, pin) !== -1) {
        MNUtil.showHUD("目标分区已存在")
        return false
      }

      // 执行转移（使用实际的 pin 对象）
      let actualPin = fromPins[index]
      fromPins.splice(index, 1)
      toPins.push(actualPin)

      this.save()

      let toSectionName = pinnerConfig.getSectionDisplayName(toSection)
      MNUtil.showHUD(`已转移到 ${toSectionName}`)
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:transferPin")
      return false
    }
  }
  
  /**
   * 更新 Pin 的标题
   * @param {string} noteId - 笔记ID
   * @param {string} newTitle - 新标题
   * @param {string} section - 分区名称（可选，不指定则在所有分区中查找）
   */
  static updatePinTitle(noteId, newTitle, section) {
    try {
      // 如果指定了分区
      if (section && this.sections[section]) {
        let pins = this.sections[section]
        let pin = pins.find(p => p.noteId === noteId)

        if (!pin) return false

        pin.title = newTitle
        this.save()
        return true
      }

      // 没有指定分区，在所有分区中查找
      for (let sec in this.sections) {
        let pins = this.sections[sec]
        let pin = pins.find(p => p.noteId === noteId)

        if (pin) {
          pin.title = newTitle
          this.save()
          pinnerUtils.log(`Updated pin title in ${sec}: ${newTitle}`, "pinnerConfig:updatePinTitle")
          return true
        }
      }

      return false

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:updatePinTitle")
      return false
    }
  }

  /**
   * 更新 Pin 的 noteId（保持标题不变）
   * @param {string} section - 分区名称
   * @param {string} oldNoteId - 原卡片ID
   * @param {string} newNoteId - 新卡片ID
   * @returns {{success: boolean, message: string}} 返回操作结果
   */
  static updatePinNoteId(section, oldNoteId, newNoteId) {
    try {
      if (!this.sections[section]) {
        return { success: false, message: "无效的分区" }
      }

      let pins = this.sections[section]

      // 检查新卡片是否已在分区中
      if (pins.find(p => p.noteId === newNoteId)) {
        return { success: false, message: "新卡片已在该分区中" }
      }

      // 查找要更新的 pin
      let pin = pins.find(p => p.noteId === oldNoteId)
      if (!pin) {
        return { success: false, message: "找不到要更新的卡片" }
      }

      // 只更新 noteId，保持 title 不变
      pin.noteId = newNoteId
      this.save()

      pinnerUtils.log(`Updated pin noteId in ${section}: ${oldNoteId} -> ${newNoteId}`, "pinnerConfig:updatePinNoteId")
      return { success: true, message: "已更新为当前卡片" }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:updatePinNoteId")
      return { success: false, message: `更新失败: ${error.message}` }
    }
  }

  /**
   * 获取所有分区名称
   */
  static getSectionNames() {
    return Object.keys(this.sections)
  }

  /**
   * 获取分区显示名称（从 SectionRegistry 获取）
   * @param {string} section - 分区键名
   * @returns {string} 显示名称，不存在则返回键名本身
   */
  static getSectionDisplayName(section) {
    // 特殊处理已废弃的分区
    if (section === 'pages') {
      return 'Pages'
    }

    // 从 SectionRegistry 获取显示名称
    return SectionRegistry.getDisplayName(section)
  }

  // ========== 页面标题预设管理方法 ==========

  /**
   * 获取页面标题预设列表
   * @returns {Array<string>} 预设短语数组
   */
  static getPageTitlePresets() {
    return this.config.pageTitlePresets || []
  }

  /**
   * 设置页面标题预设列表（完整替换）
   * @param {Array<string>} presets - 预设短语数组
   */
  static setPageTitlePresets(presets) {
    this.config.pageTitlePresets = presets
    this.save()
  }

  /**
   * 添加页面标题预设
   * @param {string} preset - 预设短语
   */
  static addPageTitlePreset(preset) {
    if (!preset || typeof preset !== 'string') {
      return
    }

    // 去除首尾空白
    preset = preset.trim()
    if (!preset) {
      return
    }

    // 去重
    if (!this.config.pageTitlePresets.includes(preset)) {
      this.config.pageTitlePresets.push(preset)
      this.save()
    }
  }

  /**
   * 删除页面标题预设
   * @param {number} index - 预设索引
   */
  static removePageTitlePreset(index) {
    if (index >= 0 && index < this.config.pageTitlePresets.length) {
      this.config.pageTitlePresets.splice(index, 1)
      this.save()
    }
  }

  /**
   * 更新页面标题预设
   * @param {number} index - 预设索引
   * @param {string} newPreset - 新的预设短语
   */
  static updatePageTitlePreset(index, newPreset) {
    if (!newPreset || typeof newPreset !== 'string') {
      return
    }

    newPreset = newPreset.trim()
    if (!newPreset) {
      return
    }

    if (index >= 0 && index < this.config.pageTitlePresets.length) {
      this.config.pageTitlePresets[index] = newPreset
      this.save()
    }
  }

  // ========== 页面 Pin 操作方法 ==========

  /**
   * 确保 pages 数组存在（防御性编程）
   * @private
   */
  static ensurePagesArray() {
    if (!this.sections.pages) {
      this.sections.pages = []
    }
  }

  /**
   * 获取文档信息（包含文档对象和页码范围）
   * @param {string} docMd5 - 文档 MD5
   * @returns {{doc: Object|null, pageCount: number, lastPageIndex: number}} 文档信息对象
   */
  static getDocInfo(docMd5) {
    let doc = MNUtil.getDocById(docMd5)
    if (!doc) {
      return { doc: null, pageCount: 0, lastPageIndex: -1 }
    }
    let pageCount = doc.pageCount
    let lastPageIndex = pageCount - 1
    return { doc, pageCount, lastPageIndex }
  }

  /**
   * 添加文档页面到 Pages 分区
   * @param {string} docMd5 - 文档 MD5
   * @param {number} pageIndex - 页码（从 0 开始）
   * @param {string} title - 自定义标题（可选）
   * @param {string} note - 备注（可选）
   * @returns {boolean} 是否添加成功
   */
  static addPagePin(docMd5, pageIndex, title, note) {
    try {
      this.ensurePagesArray()
      let pages = this.sections.pages

      // 检查是否已存在（相同文档+页码）
      if (pages.find(p => p.docMd5 === docMd5 && p.pageIndex === pageIndex)) {
        MNUtil.showHUD("该页面已存在")
        return false
      }

      // 获取文档信息
      let docInfo = this.getDocInfo(docMd5)
      if (!docInfo.doc) {
        MNUtil.showHUD("文档不存在")
        return false
      }

      let defaultTitle = `${docInfo.doc.pathFile.lastPathComponent} - 第${pageIndex + 1}页`

      // 创建新的页面 pin
      let newPagePin = {
        type: "page",
        docMd5: docMd5,
        pageIndex: pageIndex,
        title: title || defaultTitle,
        note: note || "",
        pinnedAt: Date.now()
      }

      // 添加到列表开头（最新的在最上面）
      pages.unshift(newPagePin)

      // 保存
      this.save()

      pinnerUtils.log(`Added page pin: ${newPagePin.title}`, "pinnerConfig:addPagePin")
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:addPagePin")
      return false
    }
  }

  /**
   * 删除页面 Pin
   * @param {string} docMd5 - 文档 MD5
   * @param {number} pageIndex - 页码
   * @returns {boolean} 是否删除成功
   */
  static removePagePin(docMd5, pageIndex) {
    try {
      this.ensurePagesArray()
      let pages = this.sections.pages
      let index = pages.findIndex(p => p.docMd5 === docMd5 && p.pageIndex === pageIndex)

      if (index === -1) {
        return false
      }

      pages.splice(index, 1)
      this.save()

      pinnerUtils.log(`Removed page pin: ${docMd5} page ${pageIndex}`, "pinnerConfig:removePagePin")
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:removePagePin")
      return false
    }
  }

  /**
   * 更新页面 Pin 的标题
   * @param {string} docMd5 - 文档 MD5
   * @param {number} pageIndex - 页码
   * @param {string} newTitle - 新标题
   * @param {string} section - 分区名称（可选，不指定则在所有分区中查找）
   * @returns {boolean} 是否更新成功
   */
  static updatePagePinTitle(docMd5, pageIndex, newTitle, section) {
    try {
      // 如果指定了分区
      if (section && this.sections[section]) {
        let pins = this.sections[section]
        let pagePin = pins.find(p => (!p.type || p.type === "page") && p.docMd5 === docMd5 && p.pageIndex === pageIndex)

        if (!pagePin) return false

        pagePin.title = newTitle
        this.save()

        pinnerUtils.log(`Updated page pin title in ${section}: ${newTitle}`, "pinnerConfig:updatePagePinTitle")
        return true
      }

      // 没有指定分区，在所有分区中查找
      for (let sec in this.sections) {
        let pins = this.sections[sec]
        let pagePin = pins.find(p => (!p.type || p.type === "page") && p.docMd5 === docMd5 && p.pageIndex === pageIndex)

        if (pagePin) {
          pagePin.title = newTitle
          this.save()
          pinnerUtils.log(`Updated page pin title in ${sec}: ${newTitle}`, "pinnerConfig:updatePagePinTitle")
          return true
        }
      }

      return false

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:updatePagePinTitle")
      return false
    }
  }

  /**
   * 更新页面 Pin 的备注
   * @param {string} docMd5 - 文档 MD5
   * @param {number} pageIndex - 页码
   * @param {string} newNote - 新备注
   * @returns {boolean} 是否更新成功
   */
  static updatePagePinNote(docMd5, pageIndex, newNote) {
    try {
      this.ensurePagesArray()
      let pages = this.sections.pages
      let pagePin = pages.find(p => p.docMd5 === docMd5 && p.pageIndex === pageIndex)

      if (!pagePin) return false

      pagePin.note = newNote
      this.save()

      pinnerUtils.log(`Updated page pin note`, "pinnerConfig:updatePagePinNote")
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:updatePagePinNote")
      return false
    }
  }

  /**
   * 智能更新标题中的页数
   * 支持多种格式: 第x页, p.x, Page x
   * @param {string} title - 原标题
   * @param {number} newPageIndex - 新页码（从0开始）
   * @returns {string|null} 更新后的标题，如果没有匹配到页数格式则返回 null
   * @private
   */
  static _updateTitlePageNumber(title, newPageIndex) {
    const displayPageNum = newPageIndex + 1 // 转换为显示页码（从1开始）

    const patterns = [
      // 中文格式: 第5页, 第 5 页
      {
        regex: /第\s*(\d+)\s*页/,
        format: (n) => `第${n}页`
      },
      // 小写p格式: p.5, p.123
      {
        regex: /p\.\s*(\d+)/i,
        format: (n) => `p.${n}`
      },
      // Page格式: Page 5, Page 123
      {
        regex: /Page\s+(\d+)/i,
        format: (n) => `Page ${n}`
      }
    ]

    for (let pattern of patterns) {
      if (pattern.regex.test(title)) {
        return title.replace(pattern.regex, pattern.format(displayPageNum))
      }
    }

    return null // 没有匹配到页数格式
  }

  /**
   * 更新页面 Pin 的页码（用于更新阅读进度）
   * 智能功能:
   * - 如果标题中包含页数（第x页/p.x/Page x），则更新页数
   * - 如果标题中没有页数，则只更新底层 pageIndex
   * @param {string} docMd5 - 文档 MD5
   * @param {number} oldPageIndex - 原页码
   * @param {number} newPageIndex - 新页码
   * @param {string} section - 分区名称（可选，不指定则在所有分区中查找）
   * @returns {object} 返回 {success: boolean, message: string}
   */
  static updatePagePinPageIndex(docMd5, oldPageIndex, newPageIndex, section) {
    try {
      // 如果指定了分区
      if (section && this.sections[section]) {
        let pins = this.sections[section]
        let pagePin = pins.find(p => (!p.type || p.type === "page") && p.docMd5 === docMd5 && p.pageIndex === oldPageIndex)

        if (!pagePin) {
          return { success: false, message: "未找到对应的页面 Pin" }
        }

        if (oldPageIndex === newPageIndex) {
          return { success: false, message: "页码未改变，无需更新" }
        }

        // 检查新页码是否在有效范围内
        let docInfo = this.getDocInfo(docMd5)
        if (!docInfo.doc) {
          return { success: false, message: "文档不存在" }
        }
        if (newPageIndex < 0 || newPageIndex > docInfo.lastPageIndex) {
          return { success: false, message: `页码超出范围（0-${docInfo.lastPageIndex}）` }
        }

        // 更新页码
        pagePin.pageIndex = newPageIndex
        pagePin.pinnedAt = Date.now()

        // 智能更新标题中的页数
        if (pagePin.title) {
          let newTitle = this._updateTitlePageNumber(pagePin.title, newPageIndex)
          if (newTitle) {
            pagePin.title = newTitle
            pinnerUtils.log(`Updated title: ${pagePin.title}`, "pinnerConfig:updatePagePinPageIndex")
          }
        }

        this.save()

        pinnerUtils.log(`Updated page pin pageIndex in ${section}: ${oldPageIndex} -> ${newPageIndex}`, "pinnerConfig:updatePagePinPageIndex")
        return { success: true, message: `已更新到第${newPageIndex + 1}页` }
      }

      // 没有指定分区，在所有分区中查找
      for (let sec in this.sections) {
        let pins = this.sections[sec]
        let pagePin = pins.find(p => (!p.type || p.type === "page") && p.docMd5 === docMd5 && p.pageIndex === oldPageIndex)

        if (pagePin) {
          if (oldPageIndex === newPageIndex) {
            return { success: false, message: "页码未改变，无需更新" }
          }

          let docInfo = this.getDocInfo(docMd5)
          if (!docInfo.doc) {
            return { success: false, message: "文档不存在" }
          }
          if (newPageIndex < 0 || newPageIndex > docInfo.lastPageIndex) {
            return { success: false, message: `页码超出范围（0-${docInfo.lastPageIndex}）` }
          }

          pagePin.pageIndex = newPageIndex
          pagePin.pinnedAt = Date.now()

          // 智能更新标题中的页数
          if (pagePin.title) {
            let newTitle = this._updateTitlePageNumber(pagePin.title, newPageIndex)
            if (newTitle) {
              pagePin.title = newTitle
              pinnerUtils.log(`Updated title: ${pagePin.title}`, "pinnerConfig:updatePagePinPageIndex")
            }
          }

          this.save()

          pinnerUtils.log(`Updated page pin pageIndex in ${sec}: ${oldPageIndex} -> ${newPageIndex}`, "pinnerConfig:updatePagePinPageIndex")
          return { success: true, message: `已更新到第${newPageIndex + 1}页` }
        }
      }

      return { success: false, message: "未找到对应的页面 Pin" }

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:updatePagePinPageIndex")
      return { success: false, message: `更新失败: ${error.message}` }
    }
  }

  /**
   * 获取所有页面 Pins
   * @returns {Array} 页面 pins 数组
   */
  static getPagePins() {
    this.ensurePagesArray()
    return this.sections.pages
  }

  /**
   * 移动页面 Pin 的顺序
   * @param {number} oldIndex - 原位置
   * @param {number} newIndex - 新位置
   * @returns {boolean} 是否移动成功
   */
  static movePagePin(oldIndex, newIndex) {
    try {
      this.ensurePagesArray()
      let pages = this.sections.pages

      if (oldIndex < 0 || oldIndex >= pages.length ||
          newIndex < 0 || newIndex >= pages.length) {
        return false
      }

      let [item] = pages.splice(oldIndex, 1)
      pages.splice(newIndex, 0, item)

      this.save()

      // ✅ 移除自动刷新，让调用方（UI 层）控制刷新
      // if (pinnerUtils.pinnerController && !pinnerUtils.pinnerController.view.hidden) {
      //   pinnerUtils.pinnerController.refreshView("pagesView")
      // }
      return true

    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:movePagePin")
      return false
    }
  }

}
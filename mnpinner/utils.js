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
}


class pinnerConfig {
  // 路径和定时器
  static mainPath
  static dataDir
  static backUpTimer
  
  // 数据存储 - 不直接初始化，在 init 中赋值
  static temporaryPins  // [{noteId, title, pinnedAt}, ...]
  static permanentPins  // [{noteId, title, pinnedAt}, ...]
  static config         // {version, modifiedTime, lastSyncTime}
  static previousConfig // 用于备份上一次的配置
  
  // 默认值通过 getter 返回，避免多窗口共享问题
  static get defaultTemporaryPins() {
    return []
  }
  
  static get defaultPermanentPins() {
    return []
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
      this.checkDataDir()
      this.dataDir = this.mainPath + "/data"
      this.backUpFile = this.dataDir + "/MNPinner_totalConfig.json"
      
      // 初始化加载流程（参考 mnai）
      if (!this.isLocalConfigExists("MNPinner_config") && this.isBackUpConfigExists()) {
        pinnerUtils.log("不存在本地配置但存在备份，从备份恢复")
        let backupConfig = MNUtil.readJSON(this.backUpFile)
        this.importConfig(backupConfig)
      } else {
        pinnerUtils.log("直接初始化配置数据")
        
        // 直接初始化默认配置，避免 getByDefault 的兼容性问题
        this.config = {
          version: "1.0.0",
          modifiedTime: 0,
          lastSyncTime: null,
          autoImport: false,
          autoExport: false,
        }
        
        // 尝试从 NSUserDefaults 读取已存储的配置
        let storedConfig = NSUserDefaults.standardUserDefaults().objectForKey('MNPinner_config')
        if (storedConfig && typeof storedConfig === 'object' && !Array.isArray(storedConfig)) {
          this.config = storedConfig
        }
        
        // Pins 仍使用 getByDefault（它们返回数组，没有问题）
        this.temporaryPins = this.getByDefault('MNPinner_temporaryPins', this.defaultTemporaryPins)
        this.permanentPins = this.getByDefault('MNPinner_permanentPins', this.defaultPermanentPins)
      }
      
      // 加载图片资源
      this.closeImage = this.mainPath + "/close.png"
      
      pinnerUtils.log("pinnerConfig initialized", "pinnerConfig:init")
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:init")
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
    this.save("MNPinner_config")
  }
  
  /**
   * 保存数据到本地存储
   * @param {string} key - 特定键名，undefined 则保存所有
   * @param {boolean} ignoreExport - 是否忽略自动导出（预留）
   * @param {boolean} synchronize - 是否同步到磁盘
   */
  static save(key, ignoreExport = false, synchronize = true) {
    try {
      if (key === undefined) {
        // 保存所有数据
        this.config.modifiedTime = Date.now()
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.config, "MNPinner_config")
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.temporaryPins, "MNPinner_temporaryPins")
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.permanentPins, "MNPinner_permanentPins")
        
        // 触发自动导出（预留功能）
        if (!ignoreExport && this.getConfig("autoExport")) {
          // this.export(false)
        }
      } else {
        // 保存特定项
        switch(key) {
          case "MNPinner_temporaryPins":
            NSUserDefaults.standardUserDefaults().setObjectForKey(this.temporaryPins, key)
            this.config.modifiedTime = Date.now()
            NSUserDefaults.standardUserDefaults().setObjectForKey(this.config, "MNPinner_config")
            break
          case "MNPinner_permanentPins":
            NSUserDefaults.standardUserDefaults().setObjectForKey(this.permanentPins, key)
            this.config.modifiedTime = Date.now()
            NSUserDefaults.standardUserDefaults().setObjectForKey(this.config, "MNPinner_config")
            break
          case "MNPinner_config":
            this.config.modifiedTime = Date.now()
            NSUserDefaults.standardUserDefaults().setObjectForKey(this.config, key)
            break
          default:
            pinnerUtils.addErrorLog("Unknown key: " + key, "pinnerConfig:save")
            break
        }
      }
      
      // 同步到磁盘
      if (synchronize) {
        NSUserDefaults.standardUserDefaults().synchronize()
      }
      
      // 设置备份定时器（1秒后执行）
      if (this.backUpTimer) {
        this.backUpTimer.invalidate()
      }
      this.backUpTimer = NSTimer.scheduledTimerWithTimeInterval(1, false, function() {
        pinnerConfig.backUp()
      })
      
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:save")
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
      temporaryPins: this.temporaryPins,
      permanentPins: this.permanentPins,
      config: this.config
    }
  }
  
  /**
   * 验证配置格式（统一命名）
   */
  static isValidTotalConfig(data) {
    if (!data || typeof data !== 'object') return false
    
    // 检查必要字段
    if (!Array.isArray(data.temporaryPins) && !Array.isArray(data.permanentPins)) {
      return false
    }
    
    // 验证 pin 数据格式 (只需要 noteId 和 title)
    let validatePins = (pins) => {
      if (!Array.isArray(pins)) return true
      return pins.every(pin => 
        pin && typeof pin === 'object' && 
        'noteId' in pin && 'title' in pin
      )
    }
    
    if (data.temporaryPins && !validatePins(data.temporaryPins)) return false
    if (data.permanentPins && !validatePins(data.permanentPins)) return false
    
    return true
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
      
      // 保留本地的自动导入/导出设置
      let autoImport = this.getConfig("autoImport")
      let autoExport = this.getConfig("autoExport")
      
      // 导入新配置
      this.temporaryPins = newConfig.temporaryPins || this.defaultTemporaryPins
      this.permanentPins = newConfig.permanentPins || this.defaultPermanentPins
      this.config = newConfig.config || this.defaultConfig
      
      // 恢复本地设置
      this.config.autoImport = autoImport
      this.config.autoExport = autoExport
      this.config.lastSyncTime = Date.now()
      
      // 保存并刷新
      this.saveAfterImport()
      
      MNUtil.showHUD("Import success!")
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
      
      let data = JSON.stringify(this.getAllConfig(), null, 2)
      let fileData = NSString.stringWithString(data).dataUsingEncoding(4)
      let fileName = "MNPinner_export_" + new Date().toISOString().slice(0,10) + ".json"
      let filePath = MNUtil.tempPath + "/" + fileName
      
      fileData.writeToFileAtomically(filePath, false)
      MNUtil.saveFile(filePath, "public.json")
      
      MNUtil.showHUD("Exported to file")
      
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:exportToFile")
    }
  }
  
  /**
   * 从文件导入配置
   */
  static importFromFile() {
    try {
      MNUtil.importFile("public.json", (filePath) => {
        if (!filePath) {
          MNUtil.showHUD("No file selected")
          return
        }
        
        let fileData = NSData.dataWithContentsOfFile(filePath)
        let jsonString = NSString.alloc().initWithDataEncoding(fileData, 4)
        let data = JSON.parse(jsonString)
        
        this.importConfig(data)  // 使用 importConfig 而不是 importData
      })
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:importFromFile")
    }
  }
  
  // ========== Pin 操作方法 ==========
  
  /**
   * 添加 Pin
   * @param {string} noteId - 笔记ID
   * @param {string} title - 标题
   * @param {boolean} isTemporary - 是否为临时固定
   */
  static addPin(noteId, title, isTemporary = true) {
    try {
      let pins = isTemporary ? this.temporaryPins : this.permanentPins
      
      // 检查是否已存在
      if (pins.find(p => p.noteId === noteId)) {
        MNUtil.showHUD("Already pinned")
        return false
      }
      
      // 添加新的 pin
      pins.push({
        noteId: noteId,
        title: title || "Untitled"
      })
      
      // 保存
      this.save(isTemporary ? "MNPinner_temporaryPins" : "MNPinner_permanentPins")
      
      pinnerUtils.log(`Added ${isTemporary ? 'temporary' : 'permanent'} pin: ${title}`, "pinnerConfig:addPin")
      return true
      
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:addPin")
      return false
    }
  }
  
  /**
   * 删除 Pin
   * @param {string} noteId - 笔记ID
   * @param {boolean} isTemporary - 是否为临时固定
   */
  static removePin(noteId, isTemporary = true) {
    try {
      let pins = isTemporary ? this.temporaryPins : this.permanentPins
      let index = pins.findIndex(p => p.noteId === noteId)
      
      if (index === -1) {
        return false
      }
      
      pins.splice(index, 1)
      this.save(isTemporary ? "MNPinner_temporaryPins" : "MNPinner_permanentPins")
      
      pinnerUtils.log(`Removed ${isTemporary ? 'temporary' : 'permanent'} pin`, "pinnerConfig:removePin")
      return true
      
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:removePin")
      return false
    }
  }
  
  /**
   * 移动 Pin 顺序
   * @param {number} oldIndex - 原位置
   * @param {number} newIndex - 新位置
   * @param {boolean} isTemporary - 是否为临时固定
   */
  static movePin(oldIndex, newIndex, isTemporary = true) {
    try {
      let pins = isTemporary ? this.temporaryPins : this.permanentPins
      
      if (oldIndex < 0 || oldIndex >= pins.length || 
          newIndex < 0 || newIndex >= pins.length) {
        return false
      }
      
      let [item] = pins.splice(oldIndex, 1)
      pins.splice(newIndex, 0, item)
      
      this.save(isTemporary ? "MNPinner_temporaryPins" : "MNPinner_permanentPins")
      return true
      
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:movePin")
      return false
    }
  }
  
  /**
   * 清空 Pins
   * @param {boolean} isTemporary - 是否为临时固定
   */
  static clearPins(isTemporary = true) {
    try {
      if (isTemporary) {
        this.temporaryPins = []
        this.save("MNPinner_temporaryPins")
      } else {
        this.permanentPins = []
        this.save("MNPinner_permanentPins")
      }
      
      MNUtil.showHUD(`Cleared ${isTemporary ? 'temporary' : 'permanent'} pins`)
      return true
      
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:clearPins")
      return false
    }
  }
  
  /**
   * 获取 Pins
   * @param {boolean} isTemporary - 是否为临时固定
   */
  static getPins(isTemporary = true) {
    return isTemporary ? this.temporaryPins : this.permanentPins
  }
  
  /**
   * 从临时转为永久
   * @param {string} noteId - 笔记ID
   */
  static makePermanent(noteId) {
    try {
      let index = this.temporaryPins.findIndex(p => p.noteId === noteId)
      if (index === -1) return false
      
      let pin = this.temporaryPins[index]
      
      // 检查永久列表是否已存在
      if (this.permanentPins.find(p => p.noteId === noteId)) {
        MNUtil.showHUD("Already in permanent pins")
        return false
      }
      
      // 移动到永久列表
      this.temporaryPins.splice(index, 1)
      this.permanentPins.push(pin)
      
      this.save()
      
      MNUtil.showHUD("Moved to permanent pins")
      return true
      
    } catch (error) {
      pinnerUtils.addErrorLog(error, "pinnerConfig:makePermanent")
      return false
    }
  }
}
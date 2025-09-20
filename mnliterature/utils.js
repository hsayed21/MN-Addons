/**
 * 文献管理插件的工具类
 * 提供视图控制器管理和辅助功能
 */
class literatureUtils {
  static init(mainPath) {
    try {
      this.mainPath = mainPath
      this.errorLog = []
    } catch (error) {
      MNLog.error(error, "literatureUtils:init")
    }
  }
  static addErrorLog(error, source, info){
    MNUtil.showHUD("MN Literature Error ("+ source +"): "+error)
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
        source:"MN Literature",
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
        source:"MN Literature",
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
      literatureUtils.showHUD("MN Literature: Please install 'MN Utils' first!",5)
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
   * - literatureController.new() 会创建 UIViewController 实例
   * - 创建时会自动调用 viewDidLoad 生命周期方法
   * - studyView 是 MarginNote 的主学习视图，所有插件视图都应添加到这里
   */
  static checkLiteratureController(){
    // 单例模式：如果控制器不存在则创建
    if (!this.literatureController) {
      // 创建视图控制器实例
      // 这会触发 webviewController.js 中的 viewDidLoad 方法
      this.literatureController = literatureController.new();
      // 初始状态设为隐藏，等待用户手动打开
      this.literatureController.view.hidden = true
    }
    // 确保视图在正确的父视图中
    // 这是必要的，因为视图可能被其他操作移除
    if (!MNUtil.isDescendantOfStudyView(this.literatureController.view)) {
      // 将视图添加到 studyView（MarginNote 的主视图容器）
      // addSubview 是 iOS UIView 的标准方法
      MNUtil.studyView.addSubview(this.literatureController.view)
    }
  }

  /**
   * 同时设置视图的 frame 和 currentFrame
   * 
   * 为什么需要两个 frame 属性？
   * - view.frame：iOS 标准属性，决定视图的实际位置和大小
   * - currentFrame：自定义属性，用于记录当前位置，在动画时使用
   * 
   * @param {literatureController} target - 视图控制器对象
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


class literatureNetwork {
  /**
   * 通过事件通知调用 MNAI（更高级）
   * @param {string} text - 要处理的文本
   * @returns {Promise<string|null>} AI 生成的结果文本，失败返回 null
   * 
   * @description
   * 使用 NSNotificationCenter 广播机制调用 MNAI 插件。
   * 发送请求后会轮询等待 AI 生成完成，最多等待 30 秒。
   * 
   * MNAI 插件会监听 "customChat" 事件，通过 customAsk 方法处理请求。
   * 生成的内容最终存储在 chatAIUtils.notifyController.lastResponse 中。
   * 
   * @example
   * const result = await LiteraturePluginIntegration.callMNAIWithNotification("请帮我翻译这段文字");
   * if (result) {
   *   console.log("AI 结果：", result);
   * }
   */
  static async callMNAIWithNotification(text) {
    try {
      // 检查 MNAI 是否已加载
      if (typeof chatAIUtils === "undefined") {
        MNUtil.showHUD("❌ 请先安装并打开 MNAI 插件");
        return null;
      }
      
      MNUtil.showHUD("正在发送到 AI 处理...");
      
      // 发送请求到 MNAI
      MNUtil.postNotification("customChat", {
        user: text
      });
      
      // 等待一小段时间让 MNAI 开始处理
      await MNUtil.delay(0.5);
      
      // 轮询等待结果
      const maxAttempts = 60;  // 最多等待 30 秒（60 * 0.5）
      const pollInterval = 0.5; // 每 0.5 秒检查一次
      let AIResult = null;
      
      for (let i = 0; i < maxAttempts; i++) {
        // 检查 notifyController 是否存在
        if (chatAIUtils && chatAIUtils.notifyController) {
          const controller = chatAIUtils.notifyController;
          
          // 优先检查 lastResponse（生成完成后的最终结果）
          // MNAI 在 finish() 中会将 response 保存到 lastResponse 然后清空 response
          if (controller.lastResponse && controller.lastResponse.trim()) {
            MNUtil.showHUD("✅ 获取到 AI 结果");
            MNUtil.log("获取到 lastResponse: " + controller.lastResponse.substring(0, 50) + "...");
            
            // 延迟 0.5 秒后自动关闭通知窗口
            // 让用户有时间看到成功提示
            if (controller.checkAutoClose) {
              controller.checkAutoClose(true, 0.5);
            } else if (controller.hide) {
              // 备用：如果 checkAutoClose 不可用，直接调用 hide
              setTimeout(() => {
                controller.hide();
              }, 500);
            }
            AIResult = controller.lastResponse
            controller.lastResponse = "";
            return AIResult;
          }
          
          // 备用检查：在某些情况下 response 可能还未被清空
          // 这种情况较少见，但保留以防万一
          if (!controller.connection && controller.response && controller.response.trim()) {
            MNUtil.showHUD("✅ 获取到 AI 结果（备用）");
            MNUtil.log("获取到 response: " + controller.response.substring(0, 50) + "...");
            
            // 同样关闭窗口
            if (controller.checkAutoClose) {
              controller.checkAutoClose(true, 0.5);
            } else if (controller.hide) {
              setTimeout(() => {
                controller.hide();
              }, 500);
            }
            
            AIResult = controller.lastResponse
            controller.lastResponse = "";
            return AIResult;
          }
        }
        // 继续等待
        await MNUtil.delay(pollInterval);
      }

      // 超时
      MNUtil.showHUD("❌ 获取 AI 结果超时（30秒）");
      return null;
      
    } catch (error) {
      MNUtil.showHUD("❌ 调用 MNAI 失败: " + error.message);
      return null;
    }
  }
}


class literatureConfig {
  static mainPath
  static init(mainPath) {
    try {
      this.mainPath = mainPath

      this.closeImage = this.mainPath + "/close.png"
    } catch (error) {
      MNLog.error(error, "literatureConfig:init")
    }
  }
}
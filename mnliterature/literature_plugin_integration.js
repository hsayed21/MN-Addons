// literature_plugin_integration.js
// 学习如何调用 MNOCR 和 MNAI 插件

/**
 * @class LiteraturePluginIntegration
 * @description 通过调用其他插件（MNOCR、MNAI）实现 OCR 和 AI 功能
 * 
 * 提供了与其他 MarginNote 插件协作的接口，包括：
 * - 调用 MNOCR 插件进行 OCR 识别
 * - 调用 MNAI 插件进行 AI 处理
 * - 通过 URL Scheme 与其他插件通信
 * - 通过事件通知系统进行插件间通信
 * 
 * @requires MNOCR 插件（用于 OCR 功能）
 * @requires MNAI 插件（用于 AI 处理）
 * 
 * @example
 * // 使用 MNOCR 进行 OCR
 * const result = await LiteraturePluginIntegration.ocrWithPlugin(imageData);
 * 
 * // 选择 OCR 源并识别
 * await LiteraturePluginIntegration.ocrWithSourceSelection();
 * 
 * // 调用 MNAI 处理文本
 * await LiteraturePluginIntegration.callMNAIWithURLScheme(text, "ask");
 */
class LiteraturePluginIntegration {
  
  // ============ 调用 MNOCR 插件 ============
  
  /**
   * 检查并调用 MNOCR 进行 OCR
   * @param {NSData} imageData - 图片数据
   * @returns {Promise<string>} OCR 结果文本
   */
  static async ocrWithPlugin(imageData) {
    try {
      // 检查 MNOCR 插件是否存在
      if (typeof ocrNetwork === "undefined") {
        MNUtil.showHUD("❌ 请先安装 MNOCR 插件");
        return null;
      }
      
      MNUtil.showHUD("使用 MNOCR 识别中...");
      
      // 调用 MNOCR 的 OCR 功能
      // 参数说明：
      // - imageData: 图片数据
      // - source: OCR 源（"Doc2X", "SimpleTex", "GPT-4o" 等）
      // - buffer: 是否缓存结果（true/false）
      const ocrResult = await ocrNetwork.OCR(imageData, "GPT-4o", true);
      
      if (ocrResult) {
        MNUtil.showHUD("✅ OCR 识别成功");
        return ocrResult;
      } else {
        MNUtil.showHUD("❌ OCR 识别失败");
        return null;
      }
      
    } catch (error) {
      MNUtil.showHUD("❌ 调用 MNOCR 失败: " + error.message);
      return null;
    }
  }
  
  /**
   * 选择 OCR 源并识别
   * @returns {Promise<void>}
   * 
   * @description
   * 显示 OCR 源选择对话框，让用户选择使用哪个 OCR 引擎，
   * 然后使用选中的引擎进行识别，并将结果设置为卡片标题。
   * 
   * 支持的 OCR 源：
   * - Doc2X：专业文档识别
   * - SimpleTex：数学公式识别
   * - GPT-4o：OpenAI 视觉模型
   * - GLM-4V：智谱 AI 视觉模型
   * - Claude 3.5：Anthropic 视觉模型
   * 
   * @example
   * await LiteraturePluginIntegration.ocrWithSourceSelection();
   */
  static async ocrWithSourceSelection() {
    const focusNote = MNNote.getFocusNote();
    if (!focusNote) {
      MNUtil.showHUD("请先选择一个卡片");
      return;
    }
    
    // 获取图片
    let imageData = MNUtil.getDocImage(true, true);
    if (!imageData) {
      imageData = MNNote.getImageFromNote(focusNote);
    }
    
    if (!imageData) {
      MNUtil.showHUD("未找到图片");
      return;
    }
    
    // OCR 源选项（与 MNOCR 保持一致）
    const sources = [
      { name: "Doc2X - 专业文档", value: "Doc2X" },
      { name: "SimpleTex - 数学公式", value: "SimpleTex" },
      { name: "GPT-4o - OpenAI", value: "GPT-4o" },
      { name: "GLM-4V - 智谱AI", value: "glm-4v-flash" },
      { name: "Claude 3.5", value: "claude-3-5-sonnet-20241022" }
    ];
    
    const sourceNames = sources.map(s => s.name);
    const selected = await MNUtil.userSelect("选择 OCR 引擎", "", sourceNames);
    
    if (selected === 0) return;  // 用户取消
    
    const selectedSource = sources[selected - 1];
    
    // 调用 MNOCR
    if (typeof ocrNetwork !== "undefined") {
      const result = await ocrNetwork.OCR(imageData, selectedSource.value, true);
      if (result) {
        MNUtil.undoGrouping(() => {
          focusNote.noteTitle = result;
        });
        MNUtil.showHUD("✅ 已设置为标题");
      }
    } else {
      MNUtil.showHUD("请安装 MNOCR 插件");
    }
  }
  
  // ============ 调用 MNAI 插件 ============
  
  /**
   * 通过 URL Scheme 调用 MNAI
   * @param {string} text - 要处理的文本
   * @param {string} action - 动作类型 (ask/vision/prompt)
   * @returns {Promise<void>}
   * 
   * @description
   * 使用 URL Scheme 调用 MNAI 插件进行文本处理。
   * 支持三种模式：
   * - ask：直接提问模式
   * - vision：视觉识别模式（需要配合图片）
   * - prompt：执行预设的 prompt
   * 
   * URL Scheme 格式：
   * marginnote4app://addon/mnchatai?action=xxx&user=xxx&prompt=xxx
   * 
   * @example
   * // 直接提问
   * await LiteraturePluginIntegration.callMNAIWithURLScheme("什么是机器学习？", "ask");
   * 
   * // 执行翻译 prompt
   * await LiteraturePluginIntegration.callMNAIWithURLScheme("Hello World", "prompt");
   */
  static async callMNAIWithURLScheme(text, action = "ask") {
    // MNAI 支持的 URL Scheme 格式：
    // marginnote4app://addon/mnchatai?action=xxx&user=xxx&prompt=xxx
    
    const encodedText = encodeURIComponent(text);
    
    // 不同的调用方式
    switch (action) {
      case "ask":
        // 直接提问
        const askUrl = `marginnote4app://addon/mnchatai?action=ask&mode=vision&user=${encodedText}`;
        MNUtil.openURL(askUrl);
        break;
        
      case "vision":
        // 视觉识别模式
        const visionUrl = `marginnote4app://addon/mnchatai?action=ask&user=${encodedText}&mode=vision`;
        MNUtil.openURL(visionUrl);
        break;
        
      case "prompt":
        // 执行特定 prompt
        const promptName = "翻译成中文";  // MNAI 中预设的 prompt 名称
        const promptUrl = `marginnote4app://addon/mnchatai?action=executeprompt&prompt=${encodeURIComponent(promptName)}&user=${encodedText}`;
        MNUtil.openURL(promptUrl);
        break;
    }
    
    MNUtil.showHUD("已发送到 MNAI 处理");
  }
  
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
      
      for (let i = 0; i < maxAttempts; i++) {
        // 检查 notifyController 是否存在
        if (chatAIUtils && chatAIUtils.notifyController) {
          const controller = chatAIUtils.notifyController;
          
          // 优先检查 lastResponse（生成完成后的最终结果）
          // MNAI 在 finish() 中会将 response 保存到 lastResponse 然后清空 response
          if (controller.lastResponse && controller.lastResponse.trim()) {
            MNUtil.showHUD("✅ 获取到 AI 结果");
            MNUtil.log("获取到 lastResponse: " + controller.lastResponse.substring(0, 50) + "...");
            return controller.lastResponse;
          }
          
          // 备用检查：在某些情况下 response 可能还未被清空
          // 这种情况较少见，但保留以防万一
          if (!controller.connection && controller.response && controller.response.trim()) {
            MNUtil.showHUD("✅ 获取到 AI 结果（备用）");
            MNUtil.log("获取到 response: " + controller.response.substring(0, 50) + "...");
            return controller.response;
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
  
  /**
   * 完整流程：OCR + AI 处理
   * @returns {Promise<void>}
   * 
   * @description
   * 完整的 OCR 到 AI 处理流程：
   * 1. 获取当前选中的卡片和图片
   * 2. 使用 MNOCR 插件进行 OCR 识别
   * 3. 显示处理选项对话框（直接使用、翻译、总结、解释）
   * 4. 根据用户选择调用相应的处理方法
   * 
   * @requires MNOCR 插件必须已安装
   * @requires MNAI 插件必须已安装（如果选择 AI 处理）
   * 
   * @example
   * await LiteraturePluginIntegration.ocrThenAI();
   */
  static async ocrThenAI() {
    try {
      // 获取卡片和图片
      const focusNote = MNNote.getFocusNote();
      if (!focusNote) {
        MNUtil.showHUD("请先选择一个卡片");
        return;
      }
      
      let imageData = MNUtil.getDocImage(true, true);
      if (!imageData) {
        imageData = MNNote.getImageFromNote(focusNote);
      }
      
      if (!imageData) {
        MNUtil.showHUD("未找到图片");
        return;
      }
      
      // 步骤1：使用 MNOCR 识别
      if (typeof ocrNetwork === "undefined") {
        MNUtil.showHUD("请安装 MNOCR 插件");
        return;
      }
      
      MNUtil.showHUD("正在识别文字...");
      const ocrText = await ocrNetwork.OCR(imageData, "GPT-4o", true);
      
      if (!ocrText) {
        MNUtil.showHUD("OCR 识别失败");
        return;
      }
      
      // 步骤2：选择 AI 处理方式
      const actions = [
        "直接使用 OCR 结果",
        "翻译成中文",
        "总结要点",
        "解释内容"
      ];
      
      const selected = await MNUtil.userSelect("选择处理方式", ocrText.substring(0, 50) + "...", actions);
      
      switch (selected) {
        case 0:  // 取消
          return;
          
        case 1:  // 直接使用
          MNUtil.undoGrouping(() => {
            focusNote.noteTitle = ocrText;
          });
          MNUtil.showHUD("✅ 已设置为标题");
          break;
          
        case 2:  // 翻译
          this.callMNAIWithURLScheme(ocrText, "prompt");
          break;
          
        case 3:  // 总结
        case 4:  // 解释
          this.callMNAIWithURLScheme(ocrText, "ask");
          break;
      }
      
    } catch (error) {
      MNUtil.showHUD("❌ 处理失败: " + error.message);
    }
  }
}

// 导出供其他文件使用
if (typeof module !== 'undefined') {
  module.exports = LiteraturePluginIntegration;
}
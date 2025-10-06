// literature_standalone_ocr.js
// 学习如何独立实现网络请求

/**
 * @class LiteratureStandaloneOCR
 * @description 独立的 OCR 和 AI 处理类，不依赖其他插件
 * 
 * 提供了完整的网络请求封装和 OCR/AI 功能实现，包括：
 * - 网络请求的创建和发送
 * - 免费和付费 OCR API 调用
 * - AI 文本处理（翻译、总结等）
 * - 批量处理功能
 * 
 * @example
 * // OCR 识别并设置为标题
 * await LiteratureStandaloneOCR.ocrToTitle();
 * 
 * // OCR 识别后翻译
 * await LiteratureStandaloneOCR.ocrAndTranslate();
 * 
 * // 批量 OCR 处理
 * await LiteratureStandaloneOCR.batchOCR();
 */
class LiteratureStandaloneOCR {
  
  // ============ 核心网络请求封装 ============
  
  /**
   * 创建网络请求
   * @param {string} url - 请求地址
   * @param {Object} options - 请求选项
   * @returns {NSMutableURLRequest} 请求对象
   */
  static createRequest(url, options = {}) {
    const request = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
    
    // 设置请求方法（GET/POST）
    request.setHTTPMethod(options.method || "POST");
    
    // 设置超时时间
    request.setTimeoutInterval(options.timeout || 30);
    
    // 设置请求头
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "MarginNote/4.0",
      ...options.headers  // 合并自定义请求头
    };
    request.setAllHTTPHeaderFields(headers);
    
    // 设置请求体
    if (options.body) {
      const jsonData = NSJSONSerialization.dataWithJSONObjectOptions(options.body, 1);
      request.setHTTPBody(jsonData);
    }
    
    return request;
  }
  
  /**
   * 发送请求并获取响应
   * @param {NSMutableURLRequest} request - 请求对象
   * @returns {Promise<Object>} 响应数据
   * @throws {Error} 网络错误或解析错误
   * 
   * @description
   * 使用 NSURLConnection 发送异步网络请求，并返回解析后的 JSON 数据。
   * 自动处理错误和记录日志。
   * 
   * @example
   * const request = LiteratureStandaloneOCR.createRequest(url, options);
   * const response = await LiteratureStandaloneOCR.sendRequest(request);
   */
  static async sendRequest(request) {
    return new Promise((resolve, reject) => {
      NSURLConnection.sendAsynchronousRequestQueueCompletionHandler(
        request,
        NSOperationQueue.mainQueue(),
        (response, data, error) => {
          // 错误处理
          if (error && error.localizedDescription) {
            MNUtil.addErrorLog(error, "LiteratureStandaloneOCR.sendRequest");
            reject(new Error(error.localizedDescription));
            return;
          }
          
          // 解析响应
          try {
            const result = NSJSONSerialization.JSONObjectWithDataOptions(data, 1<<0);
            resolve(result);
          } catch (parseError) {
            MNUtil.addErrorLog(parseError, "LiteratureStandaloneOCR.sendRequest");
            reject(new Error("解析响应失败"));
          }
        }
      );
    });
  }
  
  // ============ OCR 实现 ============
  
  /**
   * 使用免费 API 的 OCR
   * @param {NSData} imageData - 图片数据
   * @returns {Promise<string|null>} OCR 结果文本，失败返回 null
   * @throws {Error} 网络请求失败或 API 错误
   * 
   * @description
   * 使用免费的 GLM-4V-Flash 模型进行 OCR 识别。
   * 自动压缩图片以减少传输大小。
   * 
   * @example
   * const imageData = MNUtil.getDocImage(true, true);
   * const ocrText = await LiteratureStandaloneOCR.freeOCR(imageData);
   * if (ocrText) {
   *   focusNote.noteTitle = ocrText;
   * }
   */
  static async freeOCR(imageData) {
    try {
      MNUtil.waitHUD("正在识别文字...");
      
      // 免费 API 配置（来自 mnutils）
      const apiKey = 'sk-S2rXjj2qB98OiweU46F3BcF2D36e4e5eBfB2C9C269627e44';
      const baseUrl = typeof subscriptionConfig !== 'undefined' && subscriptionConfig.config 
        ? subscriptionConfig.config.url 
        : 'https://sub.flynotes.cn';
      const url = baseUrl + '/v1/chat/completions';
      
      // 压缩图片并转换为 base64
      const compressedImageData = UIImage.imageWithData(imageData).jpegData(0.5);
      const imageBase64 = compressedImageData.base64Encoding();
      
      // 构建请求
      const request = this.createRequest(url, {
        method: "POST",
        timeout: 60,
        headers: {
          "Authorization": `Bearer ${apiKey}`
        },
        body: {
          model: "glm-4v-flash",
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: "请识别并输出图片中的所有文字，保持原始格式和换行"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`
                }
              }
            ]
          }],
          temperature: 0.3,
          max_tokens: 2000
        }
      });
      
      // 发送请求
      const response = await this.sendRequest(request);
      
      MNUtil.stopHUD();
      
      // 提取结果
      if (response && response.choices && response.choices[0]) {
        const text = response.choices[0].message.content;
        return this.cleanOCRText(text);
      }
      
      return null;
      
    } catch (error) {
      MNUtil.stopHUD();
      MNUtil.addErrorLog(error, "LiteratureStandaloneOCR.freeOCR");
      MNUtil.showHUD("❌ OCR 失败: " + error.message);
      throw error;
    }
  }
  
  /**
   * 使用付费 API（需要用户自己的 key）
   * @param {NSData} imageData - 图片数据
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @returns {Promise<string>} OCR 结果
   */
  static async paidOCR(imageData, apiKey, model = "gpt-4-vision-preview") {
    try {
      MNUtil.waitHUD(`使用 ${model} 识别中...`);
      
      // OpenAI API 配置
      const url = 'https://api.openai.com/v1/chat/completions';
      
      // 压缩图片并转换为 base64
      const compressedImageData = UIImage.imageWithData(imageData).jpegData(0.7);
      const imageBase64 = compressedImageData.base64Encoding();
      
      const request = this.createRequest(url, {
        method: "POST",
        timeout: 60,
        headers: {
          "Authorization": `Bearer ${apiKey}`
        },
        body: {
          model: model,
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this image, maintaining the original format."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "high"  // 高精度识别
                }
              }
            ]
          }],
          max_tokens: 4096
        }
      });
      
      const response = await this.sendRequest(request);
      
      MNUtil.stopHUD();
      
      if (response && response.choices && response.choices[0]) {
        return response.choices[0].message.content;
      }
      
      return null;
      
    } catch (error) {
      MNUtil.stopHUD();
      MNUtil.addErrorLog(error, "LiteratureStandaloneOCR.paidOCR");
      MNUtil.showHUD("❌ OCR 失败: " + error.message);
      throw error;
    }
  }
  
  // ============ AI 处理 ============
  
  /**
   * AI 文本处理（翻译、总结等）
   * @param {string} text - 要处理的文本
   * @param {string} instruction - 处理指令
   * @returns {Promise<string>} 处理结果
   */
  static async processTextWithAI(text, instruction) {
    try {
      MNUtil.waitHUD("AI 处理中...");
      
      const apiKey = 'sk-S2rXjj2qB98OiweU46F3BcF2D36e4e5eBfB2C9C269627e44';
      const url = 'https://sub.flynotes.cn/v1/chat/completions';
      
      const request = this.createRequest(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        },
        body: {
          model: "glm-4v-flash",
          messages: [
            {
              role: "system",
              content: instruction  // 例如："请将以下内容翻译成中文"
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }
      });
      
      const response = await this.sendRequest(request);
      
      MNUtil.stopHUD();
      
      if (response && response.choices && response.choices[0]) {
        return response.choices[0].message.content;
      }
      
      return null;
      
    } catch (error) {
      MNUtil.stopHUD();
      MNUtil.addErrorLog(error, "LiteratureStandaloneOCR.processTextWithAI");
      MNUtil.showHUD("❌ AI 处理失败: " + error.message);
      throw error;
    }
  }
  
  // ============ 工具函数 ============
  
  /**
   * 清理 OCR 文本
   * @param {string} text - 原始文本
   * @returns {string} 清理后的文本
   */
  static cleanOCRText(text) {
    return text
      .replace(/```/g, '')           // 去掉代码块标记
      .replace(/\$\$\s*/g, '')        // 去掉数学公式标记
      .replace(/\s*\$\$/g, '')
      .replace(/\\\[/g, '')           // 去掉 LaTeX 标记
      .replace(/\\\]/g, '')
      .trim();
  }
  
  /**
   * 获取 API Key
   * @returns {string} API Key
   */
  static getAPIKey() {
    // 从 mnutils 获取统一的 API Key
    if (typeof subscriptionConfig !== 'undefined' && subscriptionConfig.APIKey) {
      return subscriptionConfig.APIKey;
    }
    
    // 从本地存储获取
    const savedKey = NSUserDefaults.standardUserDefaults().objectForKey("LiteratureAPIKey");
    return savedKey;
  }
  
  /**
   * 设置 API Key
   * @returns {Promise<string>} 设置的 API Key
   */
  static async setAPIKey() {
    const key = await MNUtil.input("设置 API Key", "请输入你的 API Key");
    if (key) {
      NSUserDefaults.standardUserDefaults().setObjectForKey(key, "LiteratureAPIKey");
      MNUtil.showHUD("✅ API Key 已保存");
      return key;
    }
    return null;
  }
  
  // ============ 完整功能示例 ============
  
  /**
   * 完整的 OCR 到标题功能
   */
  static async ocrToTitle() {
    try {
      // 获取卡片
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
      
      // 执行 OCR
      const ocrText = await this.freeOCR(imageData);
      
      if (ocrText) {
        MNUtil.undoGrouping(() => {
          focusNote.noteTitle = ocrText;
        });
        MNUtil.showHUD("✅ 已设置为标题");
      } else {
        MNUtil.showHUD("❌ OCR 失败");
      }
      
    } catch (error) {
      MNUtil.showHUD("❌ 错误: " + error.message);
    }
  }
  
  /**
   * OCR + AI 处理
   */
  static async ocrAndTranslate() {
    try {
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
      
      // 步骤1：OCR
      const ocrText = await this.freeOCR(imageData);
      if (!ocrText) {
        MNUtil.showHUD("OCR 失败");
        return;
      }
      
      // 步骤2：选择处理方式
      const actions = [
        "原文",
        "翻译成中文",
        "翻译成英文",
        "总结要点",
        "简化解释"
      ];
      
      const selected = await MNUtil.userSelect("选择处理方式", ocrText.substring(0, 50) + "...", actions);
      
      let finalText = ocrText;
      
      switch (selected) {
        case 0:  // 取消
          return;
        case 1:  // 原文
          break;
        case 2:  // 翻译中文
          finalText = await this.processTextWithAI(ocrText, "请将以下内容翻译成中文，保持专业术语准确");
          break;
        case 3:  // 翻译英文
          finalText = await this.processTextWithAI(ocrText, "Please translate the following into English");
          break;
        case 4:  // 总结
          finalText = await this.processTextWithAI(ocrText, "请用3-5句话总结以下内容的要点");
          break;
        case 5:  // 解释
          finalText = await this.processTextWithAI(ocrText, "请用简单易懂的语言解释以下内容");
          break;
      }
      
      if (finalText) {
        MNUtil.undoGrouping(() => {
          focusNote.noteTitle = finalText;
        });
        MNUtil.showHUD("✅ 处理完成");
      }
      
    } catch (error) {
      MNUtil.showHUD("❌ 错误: " + error.message);
    }
  }
  
  /**
   * 批量 OCR 处理
   */
  static async batchOCR() {
    const focusNotes = MNNote.getFocusNotes();
    if (focusNotes.length === 0) {
      MNUtil.showHUD("请选择要处理的卡片");
      return;
    }
    
    let successCount = 0;
    
    for (let i = 0; i < focusNotes.length; i++) {
      const note = focusNotes[i];
      const imageData = MNNote.getImageFromNote(note);
      
      if (imageData) {
        try {
          MNUtil.showHUD(`处理中 ${i+1}/${focusNotes.length}`);
          const ocrText = await this.freeOCR(imageData);
          
          if (ocrText) {
            MNUtil.undoGrouping(() => {
              note.noteTitle = ocrText;
            });
            successCount++;
          }
        } catch (error) {
          // 单个失败不影响其他
        }
      }
    }
    
    MNUtil.showHUD(`✅ 完成 ${successCount}/${focusNotes.length}`);
  }
}

// 导出供其他文件使用
if (typeof module !== 'undefined') {
  module.exports = LiteratureStandaloneOCR;
}
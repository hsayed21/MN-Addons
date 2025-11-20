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

  // ==================== 作者名称处理函数 ====================

  /**
   * 判断字符串的语言类型
   * @param {string} input - 输入字符串
   * @returns {string} "Chinese" 或 "English"
   */
  static languageOfString(input) {
    const chineseRegex = /[\u4e00-\u9fa5]/;
    if (chineseRegex.test(input)) {
      return "Chinese";
    } else {
      return "English";
    }
  }

  /**
   * 将字符串首字母大写
   * @param {string} string - 输入字符串
   * @returns {string} 首字母大写的字符串
   */
  static camelizeString(string) {
    return string[0].toUpperCase() + string.slice(1);
  }

  /**
   * 生成英文名称的各种变体
   * @param {string} name - 英文名称
   * @returns {Object} 包含各种名称变体的对象
   */
  static getAbbreviationsOfEnglishName(name) {
    const namePartsArr = name.split(" ");
    const namePartsNum = namePartsArr.length;
    const Name = {};

    if (namePartsNum < 2) {
      Name.original = name;
      return Name;
    }

    const firstPart = namePartsArr[0];
    const lastPart = namePartsArr[namePartsNum - 1];

    if (namePartsNum === 2) {
      // 例：Kangwei Xia
      Name.original = name;
      Name.reverse = lastPart + ", " + firstPart; // Xia, Kangwei
      Name.abbreviateFirstpart = firstPart[0] + ". " + lastPart; // K. Xia
      Name.abbreviateFirstpartAndReverseAddComma = lastPart + ", " + firstPart[0] + "."; // Xia, K.
    } else if (namePartsNum === 3) {
      // 例：Louis de Branges
      const middlePart = namePartsArr[1];
      Name.original = name;
      Name.removeMiddlepart = firstPart + " " + lastPart; // Louis Branges
      Name.abbreviateFirstpart = firstPart[0] + ". " + middlePart + " " + lastPart; // L. de Branges
      Name.abbreviateFirstpartAndReverseAddComma = middlePart + " " + lastPart + ", " + firstPart[0] + "."; // de Branges, L.
      Name.abbreviateFirstpartAndRemoveMiddlepart = firstPart[0] + ". " + lastPart; // L. Branges
    } else {
      // 4个及以上部分，只生成基础变体
      Name.original = name;
    }

    return Name;
  }

  /**
   * 生成名称的所有可能变体（简化版）
   * @param {string} nameInput - 输入名称
   * @returns {Array<string>} 名称变体数组
   */
  static generateNameVariants(nameInput) {
    const languageOfName = this.languageOfString(nameInput);
    const variants = new Set([nameInput]); // 原始名称始终包含

    if (languageOfName === "English") {
      // 处理英文名称
      const nameObj = this.getAbbreviationsOfEnglishName(nameInput);
      Object.values(nameObj).forEach(variant => {
        if (variant && typeof variant === 'string') {
          variants.add(variant);
        }
      });
    } else {
      // 中文名称：由于没有 pinyin 库，只能返回原名
      // 用户需要手动添加拼音变体
      variants.add(nameInput);
    }

    return Array.from(variants);
  }

  /**
   * 智能选择最佳显示名称（基于文化背景）
   * @param {Set|Array} variants - 名称变体集合
   * @returns {string} 最佳显示名称
   */
  static selectBestDisplayName(variants) {
    if (!variants || (variants.size === 0 && variants.length === 0)) return '';

    const variantArray = Array.isArray(variants) ? variants : Array.from(variants);
    if (variantArray.length === 1) return variantArray[0];

    // 检测是否为中国作者（任意变体包含中文字符）
    const hasChinese = variantArray.some(name => /[\u4e00-\u9fa5]/.test(name));

    if (hasChinese) {
      // 中国作者：拼音 > 中文 > 其他
      return variantArray.sort((a, b) => {
        const aIsChinese = /[\u4e00-\u9fa5]/.test(a);
        const bIsChinese = /[\u4e00-\u9fa5]/.test(b);
        const aIsPinyin = !aIsChinese && !/\./.test(a) && /[a-zA-Z]/.test(a);
        const bIsPinyin = !bIsChinese && !/\./.test(b) && /[a-zA-Z]/.test(b);

        // 拼音优先
        if (aIsPinyin && !bIsPinyin) return -1;
        if (!aIsPinyin && bIsPinyin) return 1;

        // 然后是中文
        if (!aIsPinyin && !bIsPinyin) {
          if (aIsChinese && !bIsChinese) return -1;
          if (!aIsChinese && bIsChinese) return 1;
        }

        // 同类别：更长的优先
        return b.length - a.length;
      })[0];
    } else {
      // 外国作者：最完整（无点号，更长）
      return variantArray.sort((a, b) => {
        const aHasDots = /\./.test(a);
        const bHasDots = /\./.test(b);
        if (aHasDots !== bHasDots) return aHasDots ? 1 : -1;
        return b.replace(/[\s.,]/g, '').length - a.replace(/[\s.,]/g, '').length;
      })[0];
    }
  }

  /**
   * 计算两个字符串的相似度（Levenshtein 距离算法）
   * @param {string} str1 - 第一个字符串
   * @param {string} str2 - 第二个字符串
   * @returns {number} 相似度 (0-1)，1 表示完全相同
   */
  static calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    // Levenshtein 距离
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;

    const costs = new Array();
    for (let i = 0; i <= shorter.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= longerLength; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[longerLength] = lastValue;
    }

    return (longerLength - costs[longerLength]) / longerLength;
  }

  /**
   * 查找与指定作者相似的其他作者
   * @param {string} authorName - 要检查的作者名称
   * @param {Array} allAuthors - 所有作者列表
   * @param {number} threshold - 相似度阈值 (0-1)
   * @returns {Array} 相似作者列表 [{name, similarity}]
   */
  static findSimilarAuthors(authorName, allAuthors, threshold = 0.75) {
    const similarAuthors = [];

    allAuthors.forEach(author => {
      if (author.name === authorName) return; // 跳过自己

      // 检查名称本身的相似度
      const nameSimilarity = this.calculateSimilarity(
        authorName.toLowerCase(),
        author.name.toLowerCase()
      );

      if (nameSimilarity >= threshold) {
        similarAuthors.push({
          name: author.name,
          similarity: nameSimilarity,
          reason: '名称相似'
        });
        return;
      }

      // 检查是否与对方的任何变体匹配
      if (author.nameVariants && author.nameVariants.size > 0) {
        for (const variant of author.nameVariants) {
          const variantSimilarity = this.calculateSimilarity(
            authorName.toLowerCase(),
            variant.toLowerCase()
          );
          if (variantSimilarity >= threshold) {
            similarAuthors.push({
              name: author.name,
              similarity: variantSimilarity,
              reason: `与变体 "${variant}" 相似`
            });
            break;
          }
        }
      }
    });

    // 按相似度降序排序
    return similarAuthors.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * 合并多个作者为一个
   * @param {Object} primaryAuthor - 主作者对象（保留其元数据）
   * @param {Array} authorsToMerge - 要合并的其他作者对象数组
   * @returns {Object} 合并后的作者对象
   */
  static mergeAuthors(primaryAuthor, authorsToMerge) {
    try {
      // 合并所有名称变体
      const mergedVariants = new Set(primaryAuthor.nameVariants || [primaryAuthor.name]);

      authorsToMerge.forEach(author => {
        // 添加作者名称本身
        mergedVariants.add(author.name);

        // 添加该作者的所有变体
        if (author.nameVariants) {
          if (author.nameVariants instanceof Set) {
            author.nameVariants.forEach(v => mergedVariants.add(v));
          } else if (Array.isArray(author.nameVariants)) {
            author.nameVariants.forEach(v => mergedVariants.add(v));
          }
        }

        // 合并文献列表
        if (author.literatures && Array.isArray(author.literatures)) {
          primaryAuthor.literatures = primaryAuthor.literatures || [];
          primaryAuthor.literatures.push(...author.literatures);
        }

        // 合并统计数据
        primaryAuthor.count += author.count || 0;
        if (author.years && Array.isArray(author.years)) {
          primaryAuthor.years = primaryAuthor.years || [];
          primaryAuthor.years.push(...author.years);
        }

        // 合并年份分布
        if (author.yearDistribution && author.yearDistribution instanceof Map) {
          primaryAuthor.yearDistribution = primaryAuthor.yearDistribution || new Map();
          author.yearDistribution.forEach((count, year) => {
            const existingCount = primaryAuthor.yearDistribution.get(year) || 0;
            primaryAuthor.yearDistribution.set(year, existingCount + count);
          });
        }

        // 合并关键词
        if (author.keywords && author.keywords instanceof Map) {
          primaryAuthor.keywords = primaryAuthor.keywords || new Map();
          author.keywords.forEach((count, keyword) => {
            const existingCount = primaryAuthor.keywords.get(keyword) || 0;
            primaryAuthor.keywords.set(keyword, existingCount + count);
          });
        }

        // 合并期刊
        if (author.journals && author.journals instanceof Map) {
          primaryAuthor.journals = primaryAuthor.journals || new Map();
          author.journals.forEach((count, journal) => {
            const existingCount = primaryAuthor.journals.get(journal) || 0;
            primaryAuthor.journals.set(journal, existingCount + count);
          });
        }

        // 合并合作者
        if (author.coauthors && author.coauthors instanceof Map) {
          primaryAuthor.coauthors = primaryAuthor.coauthors || new Map();
          author.coauthors.forEach((count, coauthor) => {
            const existingCount = primaryAuthor.coauthors.get(coauthor) || 0;
            primaryAuthor.coauthors.set(coauthor, existingCount + count);
          });
        }
      });

      // 更新合并后的名称变体
      primaryAuthor.nameVariants = mergedVariants;

      // 重新计算最佳显示名称
      primaryAuthor.displayName = this.selectBestDisplayName(mergedVariants);

      // 重新计算年份范围
      if (primaryAuthor.years && primaryAuthor.years.length > 0) {
        primaryAuthor.yearStart = Math.min(...primaryAuthor.years);
        primaryAuthor.yearEnd = Math.max(...primaryAuthor.years);
        primaryAuthor.yearRange = primaryAuthor.yearStart === primaryAuthor.yearEnd
          ? `${primaryAuthor.yearStart}`
          : `${primaryAuthor.yearStart}-${primaryAuthor.yearEnd}`;
      }

      return primaryAuthor;
    } catch (error) {
      this.addErrorLog(error, "mergeAuthors", { primaryAuthor, authorsToMerge });
      throw error;
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

class literatureNoteUtils {
  /**
   * 转化为非摘录版本
   */
  static toNoExcerptVersion(note, inputParentNote){
    let parentNote = inputParentNote || note.parentNote
    if (parentNote) {
      if (note.excerptText) { // 把摘录内容的检测放到 toNoExcerptVersion 的内部
        let config = {
          title: note.noteTitle,
          content: "",
          markdown: true,
          color: note.colorIndex
        }
        // 创建新兄弟卡片，标题为旧卡片的标题
        let newNote = parentNote.createChildNote(config)
        
        note.noteTitle = ""

        let index = note.indexInBrotherNotes
        
        // 将旧卡片合并到新卡片中
        note.mergeInto(newNote)

        newNote.moveTo(index)
      
        return newNote; // 返回新卡片
      } else {
        return note;
      }
    } else {
      MNUtil.showHUD("没有父卡片，无法进行非摘录版本的转换！")
      return note
    }
  }

  static updateMarkdownLinksInNote (note, oldURL, newURL) {
    if (!note || !oldURL || !newURL) return;

    note.MNComments.forEach(comment => {
      if (comment.type === "markdownComment") {
        let text = comment.text;
        // 检查是否包含目标 URL
        if (text.includes(oldURL)) {
          let newText = text.split(oldURL).join(newURL);
          comment.text = newText;  // 使用 setter 自动调用 replaceWithMarkdownComment
        }
      }
    });
  };


  static mergeInto (sourceNote, targetNote){
    // 记录所有已处理的卡片，避免重复处理
    let processedNoteIds = new Set();
    let oldComments = sourceNote.MNComments

    // 处理所有 linkComment（不再限制必须是双向链接）
    oldComments.forEach((comment, index) => {
      if (comment.type == "linkComment") {  // 移除 LinkIfDouble 限制，处理所有链接
        let linkedNoteId = comment.text.toNoteId();

        // 检查是否已处理过
        if (processedNoteIds.has(linkedNoteId)) return;
        processedNoteIds.add(linkedNoteId);

        let linkedNote = MNNote.new(linkedNoteId, false);  // false 避免卡片不存在时弹窗

        if (linkedNote) {
          // 更新 linkedNote 中指向 A 的链接评论
          let indexArrInLinkedNote = linkedNote.getLinkCommentsIndexArr(sourceNote.noteId.toNoteURL())
          indexArrInLinkedNote.forEach(index => {
            linkedNote.replaceWithMarkdownComment(targetNote.noteURL, index)
          })

          // 同时更新 linkedNote 中 markdownComment 里的行内链接
          this.updateMarkdownLinksInNote(linkedNote, sourceNote.noteURL, targetNote.noteURL)
        }
      }
    })

    // 处理 A 中 markdownComment 类型评论的行内链接
    oldComments.forEach(comment => {
      if (comment.type === "markdownComment") {
        // 提取所有 Markdown 格式的链接
        let markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let matches;

        while ((matches = markdownLinkRegex.exec(comment.text)) !== null) {
          let linkURL = matches[2];

          // 检查是否是有效的 MarginNote 链接
          if (linkURL.ifValidNoteURL()) {
            let linkedNoteId = linkURL.toNoteId();

            // 跳过已处理的卡片（避免重复处理）
            if (processedNoteIds.has(linkedNoteId)) continue;
            processedNoteIds.add(linkedNoteId);

            let linkedNote = MNNote.new(linkedNoteId, false);
            if (linkedNote) {
              // 更新 linkedNote 中指向 A 的链接评论
              let indexArr = linkedNote.getLinkCommentsIndexArr(sourceNote.noteURL);
              indexArr.forEach(idx => {
                linkedNote.replaceWithMarkdownComment(targetNote.noteURL, idx);
              });

              // 更新 linkedNote 中的 markdownComment
              this.updateMarkdownLinksInNote(linkedNote, sourceNote.noteURL, targetNote.noteURL);
            }
          }
        }
      }
    })

    // TODO: 看标题如何处理
    // if (sourceNote.title) {
    //   sourceNote.title = ""
    // }

    // 检测 this 的第一条评论对应是否是 targetNote 是的话就去掉
    if (sourceNote.comments[0] && sourceNote.comments[0].text && (sourceNote.comments[0].text == targetNote.noteURL)) {
      sourceNote.removeCommentByIndex(0)
    }


    // 在合并前，先移除目标卡片中对源卡片的所有引用
    // 处理目标卡片的 markdownComment 中的行内链接
    targetNote.MNComments.forEach(comment => {
      if (comment.type === "markdownComment") {
        let text = comment.text;
        // 检查是否包含源卡片的 URL
        if (text.includes(sourceNote.noteURL)) {
          // 移除包含源卡片 URL 的 Markdown 链接
          // 匹配 [任意文本](源卡片URL) 格式
          let markdownLinkRegex = new RegExp(`\\[[^\\]]*\\]\\(${sourceNote.noteURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
          let newText = text.replace(markdownLinkRegex, '');

          // 如果替换后文本发生变化，更新评论
          if (newText !== text) {
            comment.text = newText;
          }
        }
      }
    });

    // 处理目标卡片的 linkComment（链接评论）
    let targetLinkIndices = targetNote.getLinkCommentsIndexArr(sourceNote.noteURL);
    // 从后往前删除，避免索引变化问题
    for (let i = targetLinkIndices.length - 1; i >= 0; i--) {
      targetNote.removeCommentByIndex(targetLinkIndices[i]);
    }

    // 合并到目标卡片
    targetNote.merge(sourceNote)

    // 最后更新一下合并后的链接
    let targetNoteComments = targetNote.MNComments
    for (let i = 0; i < targetNoteComments.length; i++) {
      let targetNotecomment = targetNoteComments[i]
      if (targetNotecomment.type == "linkComment") {
        targetNotecomment.text = targetNotecomment.text
      }
    }
  }
  
}
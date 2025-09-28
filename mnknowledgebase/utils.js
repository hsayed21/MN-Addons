class knowledgeBaseTemplate {
  /**
   * 粗读根目录
   */
  static roughReadingRootNoteIds = {
    "定义": "38ACB470-803E-4EE8-B7DD-1BF4722AB0FE",
    "命题": "D6F7EA72-DDD1-495B-8DF5-5E2559C5A982",
    "例子": "9BAEB3FF-318E-48BD-92E4-66727427EDD5",
    "反例": "AE530B71-E758-47CA-8C88-A59E5D287CBD",
    "问题": "C58ED58F-56BE-47F8-8F6B-1D76FF6212F8",
    "思想方法": "A4A7B09E-D124-4192-9804-C074718E399C",
    "研究进展": "7D37A27B-9964-4552-9F64-684DA0F10270",
  }
  /**
   * 单条 HtmlComment 的模板卡片 id
   */
  static singleHtmlCommentTemplateNoteIds = {
    "证明": "749B2770-77A9-4D3D-9F6F-8B2EE21615AB",
    "原理": "86F237E5-7BA3-4182-A9B9-A135D34CDC3A",
    "反例": "C33F6700-747F-48FF-999E-3783D596B0CF",
  }
  /**
   * 卡片类型
   * 
   * refName: “xxx”：“yyy”相关 zz 里的 zz
   * prefixName: 【xxx：yyyy】zzz 里的 xxx
   * englishName: 对应的英文翻译
   * templateNoteId: 对应模板卡片的 ID
   * ifIndependent: 是否是独立卡片，决定了卡片的标题处理是按照归类卡片还是上一级卡片的标题进行处理
   * colorIndex: 对应的卡片颜色索引
   * fields: 字段
   */
  static types = {
    定义: {
      refName: '定义',
      prefixName: '定义',
      englishName: 'definition',
      templateNoteId: '78D28C80-C4AC-48D1-A8E0-BF01908F6B60',
      ifIndependent: false,
      colorIndex: 2,  // 淡蓝色
      fields: [
        "相关思考",
        "相关链接"
      ]
    },
    命题: {
      refName: '命题',
      prefixName: '命题',
      englishName: 'proposition',
      templateNoteId: 'DDF06F4F-1371-42B2-94C4-111AE7F56CAB',
      ifIndependent: false,
      colorIndex: 10, // 深蓝色
      fields: [
        "证明",
        "相关思考",
        "关键词： ",
        "相关链接",
        "应用",
      ]
    },
    例子: {
      refName: '例子',
      prefixName: '例子',
      englishName: 'example',
      templateNoteId: 'DDF06F4F-1371-42B2-94C4-111AE7F56CAB',
      ifIndependent: false,
      colorIndex: 7,  // 紫色
      fields: [
        "证明",
        "相关思考",
        "关键词： ",
        "相关链接",
        "应用",
      ]
    },
    反例: {
      refName: '反例',
      prefixName: '反例',
      englishName: 'counterexample',
      templateNoteId: '4F85B579-FC0E-4657-B0DE-9557EDEB162A',
      ifIndependent: false,
      colorIndex: 3,  // 粉色
      fields: [
        "反例",
        "相关思考",
        "关键词： ",
        "相关链接",
        "应用",
      ]
    },
    归类: {
      refName: '归类',
      prefixName: '归类',
      englishName: 'classification',
      templateNoteId: '68CFDCBF-5748-448C-91D0-7CE0D98BFE2C',
      ifIndependent: false,
      colorIndex: 0,  // 淡黄色
      fields: [
        "所属",
        "相关思考",
        "包含"
      ]
    },
    思想方法: {
      refName: '思想方法',
      prefixName: '思想方法',
      englishName: 'thoughtMethod',
      templateNoteId: '38B7FA59-8A23-498D-9954-A389169E5A64',
      ifIndependent: false,
      colorIndex: 9,  // 深绿色
      fields: [
        "原理",
        "相关思考",
        "关键词： ",
        "相关链接",
        "应用",
      ]
    },
    问题: {
      refName: '问题',
      prefixName: '问题',
      englishName: 'question',
      templateNoteId: 'BED89238-9D63-4150-8EB3-4AAF9179D338',
      ifIndependent: false,
      colorIndex: 12,  // 橙色
      fields: [
        "问题详情",
        "研究脉络",
        "研究思路",
        "研究结论",
        "相关思考",
        "相关链接",  // 相关链接放在最后是为了能够自动识别最新的内容，方便后续移动，否则如果是相关思考放在最后的话，就会被“误触”
      ]
    },
    思路: {
      refName: '思路',
      prefixName: '思路',
      englishName: 'idea',
      templateNoteId: '6FF1D6DB-3349-4617-9972-FC55BFDCB675',
      ifIndependent: true,
      colorIndex: 5,  // 荧光绿
      fields: [
        "思路详情",
        "具体尝试",
        "结论",
        "相关思考",
        "相关链接", // 相关链接放在最后是为了能够自动识别最新的内容，方便后续移动，否则如果是相关思考放在最后的话，就会被“误触”
      ]
    },
    作者: {
      refName: '作者',
      prefixName: '作者',
      englishName: 'author',
      templateNoteId: '143B444E-9E4F-4373-B635-EF909248D8BF',
      ifIndependent: false,
      colorIndex: 2,  // 淡蓝色
      fields: [
        "个人信息",
        "研究进展",
        "文献",
      ]
    },
    研究进展: {
      refName: '研究进展',
      prefixName: '研究进展',
      englishName: 'researchProgress',
      templateNoteId: 'C59D8428-68EA-4161-82BE-EA4314C3B5E9',
      ifIndependent: true,
      colorIndex: 6,  // 蓝色
      fields: [
        "进展详情",
        "相关思考",
        "相关作者",
        "被引用情况",
      ]
    },
    论文: {
      refName: '论文',
      prefixName: '论文',
      englishName: 'paper',
      templateNoteId: '032FC61B-37BD-4A90-AE9D-5A946842F49B',
      ifIndependent: false,
      colorIndex: 11,  // 紫色
      fields: [
        "文献信息",
        "相关思考",
        "符号与约定",
        "参考文献",
        "被引用情况",
      ]
    },
    书作: {
      refName: '书作',
      prefixName: '书作',
      englishName: 'book',
      templateNoteId: '032FC61B-37BD-4A90-AE9D-5A946842F49B',
      ifIndependent: false,
      colorIndex: 11,  // 紫色
      fields: [
        "文献信息",
        "相关思考",
        "符号与约定",
        "参考文献",
        "被引用情况",
      ]
    },
    文献: {
      refName: '文献',
      prefixName: '文献',
      englishName: 'literature',
      templateNoteId: '032FC61B-37BD-4A90-AE9D-5A946842F49B',
      ifIndependent: false,
      colorIndex: 11,  // 紫色
      fields: [
        "文献信息",
        "相关思考",
        "符号与约定",
        "参考文献",
        "被引用情况",
      ]
    },
    总结: {
      refName: '总结',
      prefixName: '总结',
      englishName: 'summary',
      templateNoteId: 'F6FCB6B6-E40A-4937-8918-D53F332CD2D8',
      ifIndependent: true,
      colorIndex: 8,  // 橙色
      fields: [
        "核心总结",
        "要点列举",
        "相关思考",
        "相关链接"
      ]
    },
  }

  /**
   * 关键词到卡片类型的映射表
   */
  static keywordTypeMapping = {
    "基本性质": "命题",
    "判定": "命题"
  }

  /**
   * 根据用户输入文本智能识别卡片类型
   * @param {string} userInputText - 用户输入的文本
   * @returns {string|null} - 识别出的类型，未匹配时返回null
   */
  static getTypeFromInputText(userInputText) {
    for (const [keyword, type] of Object.entries(this.keywordTypeMapping)) {
      if (userInputText.includes(keyword)) {
        return type;
      }
    }
    return null;
  }

  /**
   * 知识点卡片类型
   */
  static knowledgeNoteTypes = [
    "定义",
    "命题",
    "例子",
    "反例",
    "思想方法",
    "问题",
    "思路",
    "总结"
  ]

  /**
   * 卡片类型与默认移动字段的映射关系
   * 
   * 定义了每种卡片类型的新内容应该移动到哪个字段下
   * 用于 mergeTemplateAndAutoMoveNoteContent 和 autoMoveNewContentByType 等函数
   */
  static typeDefaultFieldMap = {
    "定义": "相关思考",
    "命题": "证明",
    "反例": "反例",
    "例子": "证明",
    "思想方法": "原理",
    "归类": "相关思考",
    "问题": "研究脉络",
    "思路": "具体尝试",
    "作者": "个人信息",
    "文献": "文献信息",
    "论文": "文献信息",
    "书作": "文献信息",
    "研究进展": "进展详情",
    "总结": "要点列举"
  }

  /**
   * 获取卡片类型对应的默认字段
   * 
   * @param {string} noteType - 卡片类型
   * @returns {string} 默认字段名，如果类型未定义则返回空字符串
   */
  static getDefaultFieldForType(noteType) {
    return this.typeDefaultFieldMap[noteType] || "";
  }

  /**
   * 思路链接字段映射（部分卡片类型在添加思路链接时使用不同的字段）
   */
  static ideaLinkFieldMap = {
    "命题": "证明",
    "例子": "证明",
    "反例": "反例",
    "思想方法": "原理",
    "问题": "研究思路"  // 注意：这里是"研究思路"而不是默认的"研究脉络"
  }


  /**
   * 根据颜色索引获取卡片类型（粗读模式使用）
   * @param {number} colorIndex - 颜色索引
   * @returns {string|null} 卡片类型，如果未找到则返回 null
   */
  static getNoteTypeByColor(colorIndex) {
    // 建立颜色到类型的映射
    const colorTypeMap = {
      0: "归类",       // 淡黄色
      1: "问题",       // 淡绿色
      2: "定义",       // 淡蓝色（作者也是淡蓝色，但粗读模式优先定义）
      3: "反例",       // 粉色
      6: "研究进展",   // 蓝色（总结也是蓝色，但粗读模式优先研究进展）
      9: "思想方法",   // 深绿色
      10: "命题",      // 深蓝色
      13: "思路",      // 淡灰色
      15: "例子"       // 紫色（粗读模式下统一为例子，不考虑文献/论文/书作）
    }
    return colorTypeMap[colorIndex] || null
  }

  /**
   * 制卡（只支持非摘录版本）
   */
  static makeCard(note, addToReview = true, reviewEverytime = true, focusInMindMap = true) {
    this.renewNote(note) // 处理旧卡片
    this.mergeTemplateAndAutoMoveNoteContent(note) // 合并模板卡片并自动移动内容
    this.templateMergedCardMake(note)
    if (addToReview) {
      this.addToReview(note, reviewEverytime) // 加入复习
    }
    if (focusInMindMap) {
      MNUtil.undoGrouping(()=>{
        note.focusInMindMap()
      })
    }
  }

  /**
   * 已合并模板的卡片制卡
   * 
   * 暂不在这处理复习
   * @param note 
   */
  static templateMergedCardMake(note) {
    this.changeTitle(note) // 修改卡片标题
    this.changeNoteColor(note) // 修改卡片颜色
    this.linkParentNote(note) // 链接广义的父卡片（可能是链接归类卡片）
    this.autoMoveNewContent(note) // 自动移动新内容到对应字段
    this.moveTaskCardLinksToRelatedField(note) // 移动任务卡片链接到"相关链接"字段
    this.moveSummaryLinksToTop(note) // 移动总结链接到卡片最上方
    this.handleDefinitionPropositionLinks(note) // 处理定义-命题/例子之间的链接
    this.refreshNotes(note) // 刷新卡片
  }

  /**
   * 处理定义卡片与命题/例子卡片之间的链接
   * 
   * @param {MNNote} note - 要处理的卡片
   */
  static handleDefinitionPropositionLinks(note) {
    const noteType = this.getNoteType(note);
    const parentNote = note.parentNote;
    
    if (!parentNote) return;
    
    const parentType = this.getNoteType(parentNote);
    const supportedCombinations = [
      { child: "定义", parents: ["命题", "例子"] },
      { child: "命题", parents: ["定义"] },
      { child: "例子", parents: ["定义"] }
    ];
    
    // 检查是否是需要处理的组合
    let shouldProcess = false;
    let isDefinitionChild = false;
    
    for (let combo of supportedCombinations) {
      if (noteType === combo.child && combo.parents.includes(parentType)) {
        shouldProcess = true;
        isDefinitionChild = (combo.child === "定义");
        break;
      }
    }
    
    if (!shouldProcess) return;
    
    // 获取双方的链接索引
    let parentInChildIndex = this.getNoteIndexInAnotherNote(parentNote, note);
    let childInParentIndex = this.getNoteIndexInAnotherNote(note, parentNote);
    
    // 确保双向链接
    if (parentInChildIndex === -1) {
      note.appendNoteLink(parentNote, "To");
      parentInChildIndex = this.getNoteIndexInAnotherNote(parentNote, note);
    }
    
    if (childInParentIndex === -1) {
      parentNote.appendNoteLink(note, "To");
      childInParentIndex = this.getNoteIndexInAnotherNote(note, parentNote);
    }
    
    // 根据类型移动链接到相应字段
    if (isDefinitionChild) {
      // 定义是子卡片：在父卡片（命题/例子）中移动定义链接到"相关链接"字段
      if (childInParentIndex !== -1) {
        this.moveCommentsArrToField(parentNote, [childInParentIndex], "相关链接", true);
      }
      // 定义卡片中的父链接保持在末尾（相关链接字段本身就是最后）
    } else {
      // 命题/例子是子卡片：在定义卡片（父）中移动命题/例子链接到末尾
      // 在命题/例子卡片中移动定义链接到"相关链接"字段
      if (parentInChildIndex !== -1) {
        this.moveCommentsArrToField(note, [parentInChildIndex], "相关链接", true);
      }
    }
  }

  /**
   * 一键制卡（支持摘录版本）
   */
  static makeNote(note, addToReview = true, reviewEverytime = true, focusInMindMap = true) {
    if (note.excerptText) {
      let newnote = this.toNoExcerptVersion(note)
      newnote.focusInMindMap(0.5)
      MNUtil.delay(0.5).then(()=>{
        note = MNNote.getFocusNote()
        MNUtil.delay(0.5).then(()=>{
          this.makeCard(note, addToReview, reviewEverytime, focusInMindMap) // 制卡
        })
        MNUtil.undoGrouping(()=>{
          // this.refreshNote(note)
          this.refreshNotes(note)
          // this.addToReview(note, true) // 加入复习
        })
      })
    } else {
      this.makeCard(note, addToReview, reviewEverytime) // 制卡
      this.refreshNotes(note)
    }
  }

  /**
   * 只保留卡片的摘录，删除所有文本和手写评论
   * 
   * @param {MNNote} note - 要处理的卡片
   * @returns {number} 返回删除的评论数量
   */
  static keepOnlyExcerpt(note) {
    if (note) {
      this.keepOnlyExcerptAndTitle(note); // 先保留标题
      note.noteTitle = "";
    }
  }

  static keepOnlyExcerptAndTitle(note) {
    if (note) {
      // 获取所有评论的详细类型
      const comments = note.MNComments;
      const indicesToRemove = [];
      
      // 识别需要删除的评论（手写和文本类型）
      for (let i = 0; i < comments.length; i++) {
        const commentType = comments[i].type;
        // 手写相关类型
        if (commentType === "drawingComment" || 
            commentType === "imageCommentWithDrawing" || 
            commentType === "mergedImageCommentWithDrawing") {
          indicesToRemove.push(i);
          continue;
        }
        
        // 文本相关类型（包括 HTML、链接等）
        if (commentType === "textComment" || 
            commentType === "markdownComment" || 
            commentType === "tagComment" ||
            commentType === "HtmlComment" ||
            commentType === "linkComment" ||
            commentType === "summaryComment" ||
            commentType === "mergedTextComment" ||
            commentType === "blankTextComment") {
          indicesToRemove.push(i);
        }
      }
      
      // 从后往前删除评论（避免索引变化问题）
      indicesToRemove.sort((a, b) => b - a);
      for (const index of indicesToRemove) {
        note.removeCommentByIndex(index);
      }

      // 刷新卡片显示
      note.refresh();

      this.removeTitlePrefix(note)
    }
  }

  // 去掉卡片的 【】 前缀
  static removeTitlePrefix(note) {
    if (typeof note === "string") {
      return note.replace(/^【.*?】/, "");
    } else {
      if (note && note.noteTitle && note.noteTitle.trim()) {
        note.noteTitle = note.noteTitle.replace(/^【.*?】/, "");
        return note.noteTitle;
      }
    }
    return "";
  }

  static removePrefix(note){
    this.removeTitlePrefix(note)
  }

  /**
   * 强制重新弄标题前缀
   */

  /**
   * 用选中卡片的摘录更新父卡片的摘录
   * 
   * 功能说明：
   * 1. 选中卡片（B）只保留摘录部分，删除所有文本和手写评论
   * 2. 父卡片（A）删除摘录区的所有评论
   * 3. 将 B 合并到 A 中
   * 4. 将合并后的评论移动到摘录区
   * 
   * @param {MNNote} focusNote - 选中的卡片（将被处理并合并到父卡片）
   */
  static renewExcerptInParentNoteByFocusNote(focusNote) {
    try {
      // 1. 参数检查
      if (!focusNote) {
        MNUtil.showHUD("❌ 未选择卡片");
        return;
      }

      // 2. 检查是否有父卡片
      if (!focusNote.parentNote) {
        MNUtil.showHUD("❌ 当前卡片没有父卡片");
        return;
      }

      const parentNote = focusNote.parentNote;

      MNUtil.undoGrouping(() => {
        let newNote = focusNote.clone();

        parentNote.addChild(newNote)

        // 4. 删除父卡片A的摘录区评论
        const excerptBlockIndexArr = this.getExcerptBlockIndexArr(parentNote);
        if (excerptBlockIndexArr.length > 0) {
          parentNote.removeCommentsByIndexArr(excerptBlockIndexArr);
        }

        this.keepOnlyExcerpt(newNote)

        // 5. 合并子卡片B到父卡片A
        newNote.mergeInto(parentNote);

        // 6. 延迟处理，确保合并完成
        MNUtil.delay(0.1).then(() => {
          // 将父卡片的新内容移动到摘录区
          this.autoMoveNewContentToField(parentNote, "摘录区", true, false);
          
          // 刷新父卡片显示
          this.refreshNotes(parentNote);

          focusNote.delete()
          
          MNUtil.showHUD(`✅ 已用选中卡片的摘录更新父卡片的摘录（清除了 ${removedCount} 条评论）`);
        });
      });
      
    } catch (error) {
      MNUtil.showHUD(`❌ 更新摘录失败: ${error.message}`);
      MNUtil.addErrorLog(error, "renewExcerptInParentNoteByFocusNote", {
        focusNoteId: focusNote?.noteId,
        parentNoteId: focusNote?.parentNote?.noteId
      });
    }
  }

  static autoMoveNewContent(note) {
    // 获取卡片类型
    let noteType = this.getNoteType(note);
    // 获取默认字段
    let defaultField = this.getDefaultFieldForType(noteType);
    
    // 如果没有默认字段，则不进行移动
    if (!defaultField) {
      MNUtil.showHUD(`未定义 ${noteType} 类型的默认字段，无法自动移动新内容！`);
      return;
    }

    // 获取要移动的内容索引
    let moveIndexArr = this.autoGetNewContentToMoveIndexArr(note);

    // 如果没有要移动的内容，则不进行移动
    if (moveIndexArr.length === 0) {
      // MNUtil.showHUD(`没有新内容需要移动到 ${defaultField} 字段！`);
      return;
    }

    // 在移动之前先提取 markdown 链接
    let marginNoteLinks = this.extractMarginNoteLinksFromComments(note, moveIndexArr);
    
    // 移动内容到默认字段
    this.moveCommentsArrToField(note, moveIndexArr, defaultField);
    
    // 处理之前提取的 MarginNote 链接
    if (marginNoteLinks.length > 0) {
      this.processExtractedMarginNoteLinks(note, marginNoteLinks);
    }
  }
  
  /**
   * 从评论中提取 MarginNote 链接
   * 
   * @param {MNNote} note - 当前卡片
   * @param {number[]} indexArr - 要检查的评论索引数组
   * @returns {Array<{text: string, url: string}>} - 找到的 MarginNote 链接数组
   */
  static extractMarginNoteLinksFromComments(note, indexArr) {
    let marginNoteLinks = [];
    
    indexArr.forEach(index => {
      let comment = note.MNComments[index];
      if (!comment || comment.type !== "markdownComment") {
        return;
      }
      
      // 提取所有 Markdown 格式的链接 [文本](URL)
      let markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let matches;
      
      while ((matches = markdownLinkRegex.exec(comment.text)) !== null) {
        let linkText = matches[1];
        let linkUrl = matches[2];
        
        // 检查是否是 MarginNote 链接
        if (this.isMarginNoteLink(linkUrl)) {
          marginNoteLinks.push({
            text: linkText,
            url: linkUrl
          });
        }
      }
    });
    
    return marginNoteLinks;
  }
  
  /**
   * 判断是否是 MarginNote 链接
   * 
   * @param {string} url - 要检查的 URL
   * @returns {boolean} - 是否是 MarginNote 链接
   */
  static isMarginNoteLink(url) {
    return /^marginnote[34]app:\/\/note\//.test(url);
  }
  
  /**
   * 获取卡片的最后一个字段名
   * 
   * @param {MNNote} note - 目标卡片
   * @returns {string|null} - 最后一个字段名，如果没有字段则返回 null
   */
  static getLastFieldOfNote(note) {
    let commentsObj = this.parseNoteComments(note);
    let htmlComments = commentsObj.htmlCommentsObjArr;
    
    if (htmlComments.length === 0) {
      return null;
    }
    
    // 返回最后一个 HTML 字段的文本
    return htmlComments[htmlComments.length - 1].text;
  }
  
  /**
   * 移除卡片最后一个字段中的重复链接
   * 如果相同的链接在最后一个字段中出现多次，只保留第一个
   * 
   * @param {MNNote} note - 要处理的卡片
   */
  /**
   * 处理已提取的 MarginNote 链接
   * 
   * @param {MNNote} note - 当前卡片
   * @param {Array<{text: string, url: string}>} marginNoteLinks - 已提取的链接数组
   */
  static processExtractedMarginNoteLinks(note, marginNoteLinks) {
    // 定义允许链接的目标字段
    const allowedTargetFields = [
      "相关链接",
      "相关链接：",
      "应用：",
      "应用"
    ];
    
    // 处理每个找到的 MarginNote 链接
    marginNoteLinks.forEach(linkInfo => {
      try {
        // 从链接中提取 noteId
        let targetNoteId = linkInfo.url.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1];
        if (!targetNoteId) {
          return;
        }
        
        // 获取目标卡片
        let targetNote = MNNote.new(targetNoteId, false);
        if (!targetNote) {
          return;
        }
        
        // 检查目标卡片的最后一个字段是否在允许列表中
        let targetLastField = this.getLastFieldOfNote(targetNote);
        
        if (!targetLastField || !allowedTargetFields.includes(targetLastField)) {
          return;
        }
        
        // 添加单向链接（从 note 到 targetNote）
        targetNote.appendNoteLink(note, "To");
        
        // 对目标卡片的最后一个字段进行链接去重
        this.removeDuplicateLinksInLastField(targetNote);
        
      } catch (error) {
        // 忽略错误
      }
    });
  }

  /**
   * 判断一个链接是否指向任务卡片
   * 
   * @param {string} linkUrl - MarginNote 链接 URL
   * @returns {boolean} 是否是任务卡片链接
   */
  static isTaskCardLink(linkUrl) {
    try {
      // 从 URL 提取 noteId
      const noteIdMatch = linkUrl.match(/marginnote[34]app:\/\/note\/([A-Z0-9-]+)/i);
      if (!noteIdMatch || !noteIdMatch[1]) {
        return false;
      }
      
      const noteId = noteIdMatch[1];
      
      // 获取对应的 MNNote 对象
      const targetNote = MNNote.new(noteId, false);
      if (!targetNote) {
        return false;
      }
      
      // 检查是否需要加载 MNTaskManager
      if (typeof MNTaskManager === 'undefined') {
        // 尝试动态加载 MNTaskManager
        try {
          JSB.require('mntask/xdyy_utils_extensions');
        } catch (e) {
          // 如果无法加载，使用内置的简单判断
          const title = targetNote.noteTitle || "";
          if (!title.startsWith("【") || !title.includes("｜") || !title.includes("】")) {
            return false;
          }
          
          // 简单提取类型
          const typeMatch = title.match(/【([^>｜]+)/);
          if (!typeMatch) return false;
          
          const type = typeMatch[1].trim();
          const validTypes = ["目标", "关键结果", "项目", "动作"];
          return validTypes.includes(type);
        }
      }
      
      // 使用 MNTaskManager.isTaskCard 判断
      return MNTaskManager.isTaskCard(targetNote);
      
    } catch (error) {
      // 出错时返回 false
      return false;
    }
  }

  /**
   * 加入复习
   */
  static addToReview(note, reviewEverytime = true) {
    let includingTypes = ["定义", "命题", "例子", "反例", "思想方法", "问题", "思路"];
    if (this.getNoteType(note) && includingTypes.includes(this.getNoteType(note))) {
      if (reviewEverytime) {
        // 执行一次加入到复习一次
        MNUtil.excuteCommand("AddToReview")
      } else {
        // 执行的时候如果已经加入到复习了，就不加入
        if (!MNUtil.isNoteInReview(note.noteId)) {  // 2024-09-26 新增的 API
          MNUtil.excuteCommand("AddToReview")
        }
      }
    }
  }

  /**
   * 转化为非摘录版本
   */
  static toNoExcerptVersion(note){
    if (note.parentNote) {
      if (note.excerptText) { // 把摘录内容的检测放到 toNoExcerptVersion 的内部
        let parentNote = note.parentNote
        
        let config = {
          title: note.noteTitle,
          content: "",
          markdown: true,
          color: note.colorIndex
        }
        // 创建新兄弟卡片，标题为旧卡片的标题
        let newNote = parentNote.createChildNote(config)
        
        note.noteTitle = ""
        
        // 将旧卡片合并到新卡片中
        note.mergeInto(newNote)
      
        return newNote; // 返回新卡片
      } else {
        return note;
      }
    } else {
      MNUtil.showHUD("没有父卡片，无法进行非摘录版本的转换！")
    }
  }

  /**
   * 链接广义的父卡片（可能是链接归类卡片）
   * 
   * 支持清理旧链接：当卡片移动位置导致父卡片改变时，会自动删除与旧父卡片的链接
   */
  static linkParentNote(note) {
    /**
     * 不处理的类型
     */
    let excludingTypes = ["思路", "总结", "研究进展"];
    if (excludingTypes.includes(this.getNoteType(note))) {
      return; // 不处理
    }

    let parentNote = note.parentNote
    if (parentNote) {
      // 获取卡片类型，确定链接移动的目标字段
      let parentNoteInNoteTargetField  // 父卡片在 note 中的链接最终要到的字段
      let ifParentNoteInNoteTargetFieldToBottom = false // 父卡片在 note 中的链接最终要到的是否是字段的底部
      let noteInParentNoteTargetField // note 在父卡片中的链接最终要到的字段
      let ifNoteInParentNoteTargetFieldToBottom = false // note 在父卡片中的链接最终要到的是否是字段的底部
      
      // 用于实际链接操作的父卡片变量
      let actualParentNote = parentNote
      
      switch (this.getNoteType(note)) {
        case "归类":
          if (this.getNoteType(parentNote) !== "归类") {
            switch (this.getNoteType(parentNote)) {
              case "定义":
                parentNoteInNoteTargetField = "所属"
                ifParentNoteInNoteTargetFieldToBottom = false
                noteInParentNoteTargetField = "相关链接"
                ifNoteInParentNoteTargetFieldToBottom = true
                break;
              default:
                parentNoteInNoteTargetField = "所属"
                ifParentNoteInNoteTargetFieldToBottom = false
                noteInParentNoteTargetField = "相关链接"
                ifNoteInParentNoteTargetFieldToBottom = true
                break;
            }
          } else {
            // 父卡片为归类卡片
            parentNoteInNoteTargetField = "所属"
            ifParentNoteInNoteTargetFieldToBottom = false
            noteInParentNoteTargetField = "包含"
            ifNoteInParentNoteTargetFieldToBottom = true 
          }
          break;
        default:
          // 对于非归类卡片，使用第一个归类父卡片
          let classificationParentNote = this.getFirstClassificationParentNote(note);
          if (classificationParentNote) {
            actualParentNote = classificationParentNote
            parentNoteInNoteTargetField = "相关链接"
            ifParentNoteInNoteTargetFieldToBottom = false
            noteInParentNoteTargetField = "包含"
            ifNoteInParentNoteTargetFieldToBottom = true 
          } else {
            // 如果没有找到归类父卡片，直接返回，不处理
            return
          }
          break;
      }

      /**
       * 清理旧链接：删除与其他父卡片的链接
       */
      this.cleanupOldParentLinks(note, actualParentNote)

      /**
       * 先保证有链接（在确定目标字段后再添加链接）
       */
      let parentNoteInNoteIndex = this.getNoteIndexInAnotherNote(actualParentNote, note)
      let noteInParentNoteIndex = this.getNoteIndexInAnotherNote(note, actualParentNote)
      
      // 如果没有链接，先添加链接
      if (parentNoteInNoteIndex == -1) {
        note.appendNoteLink(actualParentNote, "To")
        // 重新获取索引（因为添加了链接）
        parentNoteInNoteIndex = this.getNoteIndexInAnotherNote(actualParentNote, note)
      }
      if (noteInParentNoteIndex == -1) {
        actualParentNote.appendNoteLink(note, "To")
        // 重新获取索引（因为添加了链接）
        noteInParentNoteIndex = this.getNoteIndexInAnotherNote(note, actualParentNote)
      }

      // 最后进行移动（确保索引是最新的）
      if (parentNoteInNoteIndex !== -1 && parentNoteInNoteTargetField) {
        this.moveCommentsArrToField(note, [parentNoteInNoteIndex], parentNoteInNoteTargetField, ifParentNoteInNoteTargetFieldToBottom)
      }
      if (noteInParentNoteIndex !== -1 && noteInParentNoteTargetField) {
        this.moveCommentsArrToField(actualParentNote, [noteInParentNoteIndex], noteInParentNoteTargetField, ifNoteInParentNoteTargetFieldToBottom)
      }
    }
  }

  /**
   * 清理旧的父卡片链接
   * 
   * 删除当前卡片和其他父卡片之间的相互链接（保留与当前父卡片的链接）
   * 
   * @param {MNNote} note - 当前卡片
   * @param {MNNote} currentParentNote - 当前的父卡片，不会被删除
   */
  static cleanupOldParentLinks(note, currentParentNote) {
    // 获取当前卡片中的所有链接
    let noteCommentsObj = this.parseNoteComments(note)
    let linksInNote = noteCommentsObj.linksObjArr
    
    // 性能优化：先过滤出可能需要清理的链接
    // 跳过在"应用"字段下的链接，因为它们不太可能是父卡片链接
    let htmlCommentsObjArr = noteCommentsObj.htmlCommentsObjArr
    let applicationFieldObj = null
    
    // 查找"应用"字段
    for (let i = 0; i < htmlCommentsObjArr.length; i++) {
      if (htmlCommentsObjArr[i].text === "应用" || htmlCommentsObjArr[i].text === "应用：") {
        applicationFieldObj = htmlCommentsObjArr[i]
        break
      }
    }
    
    // 过滤链接：排除"应用"字段下的链接
    let potentialParentLinks = linksInNote
    if (applicationFieldObj) {
      let applicationFieldRange = applicationFieldObj.excludingFieldBlockIndexArr
      potentialParentLinks = linksInNote.filter(linkObj => {
        // 如果链接在"应用"字段的范围内，则跳过
        return !applicationFieldRange.includes(linkObj.index)
      })
    }
    
    // 如果过滤后没有链接需要检查，直接返回
    if (potentialParentLinks.length === 0) {
      return
    }
    
    // 性能优化：如果链接太多，只处理前20个
    const MAX_LINKS_TO_CHECK = 20
    if (potentialParentLinks.length > MAX_LINKS_TO_CHECK) {
      potentialParentLinks = potentialParentLinks.slice(0, MAX_LINKS_TO_CHECK)
    }
    
    // 收集需要删除的旧父卡片链接（先收集，后删除，避免索引混乱）
    let oldParentNotesToCleanup = []
    
    potentialParentLinks.forEach(linkObj => {
      try {
        // 从链接 URL 中提取 noteId
        let targetNoteId = linkObj.link.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1]
        if (targetNoteId) {
          // 检查这个链接是否指向一个可能的父卡片
          let targetNote = MNNote.new(targetNoteId, false) // 不弹出警告
          if (!targetNote) return
          
          // 保护规则：
          // 1. 排除当前要链接的父卡片
          if (currentParentNote && targetNoteId === currentParentNote.noteId) {
            return
          }
          
          // 2. 保护直接的父子关系（即使不是归类卡片）
          if (note.parentNote && targetNoteId === note.parentNote.noteId) {
            return // 保留与直接父卡片的链接
          }
          
          // 3. 保护子卡片到当前卡片的链接
          if (targetNote.parentNote && targetNote.parentNote.noteId === note.noteId) {
            return // 保留与直接子卡片的链接
          }
          
          // 只有当目标卡片是潜在的父卡片时，才考虑清理
          if (this.isPotentialParentNote(targetNote, note)) {
            // 4. 重要保护：检查链接是否在 linkParentNote 使用的特定字段下
            // 只清理那些通过 linkParentNote 创建的链接（在"所属"、"包含"、"相关链接"字段下）
            let isInParentNoteField = this.isLinkInParentNoteFields(linkObj.index, noteCommentsObj)
            
            if (!isInParentNoteField) {
              // 如果链接不在 linkParentNote 的特定字段下，说明可能是用户手动创建的
              return // 不清理这个链接
            }
            
            // 额外检查：如果对方也有链接回来，且也不在特定字段下，这是用户创建的双向链接
            let targetHasLinkBack = false
            let targetLinkInParentField = false
            try {
              let targetNoteCommentsObj = this.parseNoteComments(targetNote)
              let targetLinks = targetNoteCommentsObj.linksObjArr
              let targetLinkObj = targetLinks.find(link => {
                let linkId = link.link.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1]
                return linkId === note.noteId
              })
              
              if (targetLinkObj) {
                targetHasLinkBack = true
                targetLinkInParentField = this.isLinkInParentNoteFields(targetLinkObj.index, targetNoteCommentsObj)
              }
            } catch (e) {
              // 忽略错误
            }
            
            // 如果双方都有链接但都不在特定字段下，保护这个双向链接
            if (targetHasLinkBack && !targetLinkInParentField) {
              return // 不清理这个链接
            }
            
            // 只有在特定字段下的链接才会被清理
            oldParentNotesToCleanup.push({
              targetNote: targetNote,
              linkText: linkObj.link,
              linkIndex: linkObj.index
            })
          }
        }
      } catch (error) {
        // 忽略解析错误，继续处理其他链接
      }
    })
    
    // 执行清理：删除双向链接
    if (oldParentNotesToCleanup.length > 0) {
      oldParentNotesToCleanup.forEach(cleanup => {
        try {
          // 删除当前卡片中指向旧父卡片的链接（按文本删除，避免索引问题）
          this.removeCommentsByText(note, cleanup.linkText)
          
          // 删除旧父卡片中指向当前卡片的链接
          this.removeLinkToNote(cleanup.targetNote, note.noteId)
        } catch (error) {
          // 忽略错误，继续处理
        }
      })
    }
  }

  /**
   * 判断一个卡片是否可能是另一个卡片的父卡片
   * 
   * @param {MNNote} potentialParent - 可能的父卡片
   * @param {MNNote} childNote - 子卡片
   * @returns {boolean} - 是否是潜在的父卡片
   */
  static isPotentialParentNote(potentialParent, childNote) {
    if (!potentialParent || !childNote) return false
    
    // 首先检查是否真的在祖先链中（实际的父子关系）
    let current = childNote.parentNote
    while (current) {
      if (current.noteId === potentialParent.noteId) {
        return true // 找到了真实的父卡片关系
      }
      current = current.parentNote
    }
    
    // 检查是否是子卡片（如果potentialParent是childNote的子卡片，则绝对不是父卡片）
    let currentChild = potentialParent.parentNote
    while (currentChild) {
      if (currentChild.noteId === childNote.noteId) {
        return false // potentialParent是childNote的后代，不可能是父卡片
      }
      currentChild = currentChild.parentNote
    }
    
    let potentialParentType = this.getNoteType(potentialParent)
    let childType = this.getNoteType(childNote)
    
    // 只有在不是实际父子关系的情况下，才根据类型来判断逻辑父子关系
    // 简化判断逻辑：基于类型的组合来决定
    
    // 1. 归类卡片可能是其他非归类卡片的逻辑父卡片
    if (potentialParentType === "归类" && childType !== "归类") {
      // 归类卡片对于命题、例子、定义等卡片都可能是逻辑父卡片
      return true
    }
    
    // 2. 定义卡片可能是归类卡片的逻辑父卡片
    if (potentialParentType === "定义" && childType === "归类") {
      return true
    }
    
    // 3. 其他类型的父子关系
    // 问题 -> 思路
    if (potentialParentType === "问题" && childType === "思路") {
      return true
    }
    
    // 命题 -> 例子
    if (potentialParentType === "命题" && childType === "例子") {
      return true
    }
    
    // 命题 -> 反例
    if (potentialParentType === "命题" && childType === "反例") {
      return true
    }
    
    // 如果没有匹配的类型组合，不认为是潜在的父卡片
    return false
  }

  /**
   * 获取一个卡片在另一个卡片中的 index
   */
  static getNoteIndexInAnotherNote(note, anotherNote) {
    return anotherNote.MNComments.findIndex(comment => comment && comment.type === "linkComment" && comment.text === note.noteURL);
  }

  /**
   * 判断链接是否在 linkParentNote 使用的特定字段下
   * 
   * @param {number} linkIndex - 链接在评论数组中的索引
   * @param {Object} noteCommentsObj - parseNoteComments 的返回结果
   * @returns {boolean} - 如果链接在"所属"、"包含"或"相关链接"字段下返回 true
   */
  static isLinkInParentNoteFields(linkIndex, noteCommentsObj) {
    const parentNoteFields = ["所属", "包含", "相关链接"];
    
    // 遍历所有 HTML 字段
    for (let htmlObj of noteCommentsObj.htmlCommentsObjArr) {
      // 检查字段名称是否包含 linkParentNote 使用的字段
      let isParentNoteField = parentNoteFields.some(field => htmlObj.text.includes(field));
      
      if (isParentNoteField) {
        // 检查链接是否在这个字段下（使用 excludingFieldBlockIndexArr）
        if (htmlObj.excludingFieldBlockIndexArr.includes(linkIndex)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * 检查两张卡片是否互为最后一条评论链接
   * @param {MNNote} noteA - 第一张卡片
   * @param {MNNote} noteB - 第二张卡片
   * @returns {boolean} - 是否互为最后一条评论链接
   */
  static checkMutualLastCommentLinks(noteA, noteB) {
    try {
      // 获取两张卡片的评论
      let commentsA = noteA.MNComments;
      let commentsB = noteB.MNComments;
      
      // 检查两张卡片是否都有评论
      if (commentsA.length === 0 || commentsB.length === 0) {
        return false;
      }
      
      // 获取最后一条评论
      let lastCommentA = commentsA[commentsA.length - 1];
      let lastCommentB = commentsB[commentsB.length - 1];
      
      // 检查最后一条评论是否都是链接类型
      if (lastCommentA.type !== "linkComment" || lastCommentB.type !== "linkComment") {
        return false;
      }
      
      // 提取链接的目标ID
      let linkIdFromA = lastCommentA.text.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1];
      let linkIdFromB = lastCommentB.text.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1];
      
      // 检查是否互相链接
      return linkIdFromA === noteB.noteId && linkIdFromB === noteA.noteId;
      
    } catch (error) {
      MNUtil.log(`checkMutualLastCommentLinks error: ${error}`);
      return false;
    }
  }

  /**
   * 智能链接排列
   * 
   * 自动识别手动创建的双向链接并根据卡片类型移动到相应字段
   * 
   * 支持两种场景：
   * 1. 归类卡片与知识点卡片：将链接移动到"相关链接"（知识点卡片）和"所属"（归类卡片）
   * 2. 定义卡片之间：在"相关思考"字段下先添加 "- " 再移动链接
   * 
   * @param {MNNote} note - 要处理的卡片
   * @returns {boolean} - 是否成功处理
   */
  static smartLinkArrangement(note) {
    try {
      // 获取卡片评论
      let comments = note.MNComments;
      
      // 检查最后一条评论是否是链接
      if (comments.length === 0) {
        MNUtil.showHUD("卡片没有评论");
        return false;
      }
      
      let lastComment = comments[comments.length - 1];
      if (lastComment.type !== "linkComment") {
        MNUtil.showHUD("最后一条评论不是链接");
        return false;
      }
      
      // 获取链接的目标卡片
      let targetNoteId = lastComment.text.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1];
      if (!targetNoteId) {
        MNUtil.showHUD("无法解析链接 ID");
        return false;
      }
      
      let targetNote = MNNote.new(targetNoteId, false);
      if (!targetNote) {
        MNUtil.showHUD("找不到链接的目标卡片");
        return false;
      }
      
      // 判断是否是双向链接
      let isBidirectional = false;
      if (note.LinkIfDouble) {
        // 如果有 LinkIfDouble 方法，直接使用
        isBidirectional = note.LinkIfDouble(lastComment.text);
      } else {
        // 否则手动检查
        let targetHasLinkBack = targetNote.MNComments.some(comment => {
          if (comment && comment.type === "linkComment") {
            let linkId = comment.text.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1];
            return linkId === note.noteId;
          }
          return false;
        });
        isBidirectional = targetHasLinkBack;
      }
      
      if (!isBidirectional) {
        MNUtil.showHUD("这不是双向链接");
        return false;
      }
      
      // 获取两个卡片的类型
      let noteType = this.getNoteType(note);
      let targetNoteType = this.getNoteType(targetNote);
      
      // MNUtil.log(`智能链接排列：${noteType} <-> ${targetNoteType}`);
      
      // 场景1：归类卡片与知识点卡片（不包括定义卡片）
      if (noteType === "归类" && !["归类"].includes(targetNoteType) && targetNoteType !== "定义") {
        // note 是归类卡片，targetNote 是知识点卡片
        // 知识点卡片的链接移动到"相关链接"
        let targetLinkIndex = targetNote.MNComments.findIndex(comment => {
          if (comment && comment.type === "linkComment") {
            let linkId = comment.text.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1];
            return linkId === note.noteId;
          }
          return false;
        });
        
        if (targetLinkIndex !== -1) {
          this.moveCommentsArrToField(targetNote, [targetLinkIndex], "相关链接", true);
        }
        
        // 归类卡片的链接已经在最后，默认就在"所属"字段下，不需要移动
        // MNUtil.showHUD("已将知识点卡片中的链接移动到\"相关链接\"字段");
        MNUtil.undoGrouping(() => {
          targetNote.refresh();
        });
        return true;
        
      } else if (!["归类"].includes(noteType) && noteType !== "定义" && targetNoteType === "归类") {
        // note 是知识点卡片，targetNote 是归类卡片
        // 知识点卡片的链接移动到"相关链接"
        let linkIndex = comments.length - 1;
        this.moveCommentsArrToField(note, [linkIndex], "相关链接", true);
        
        // 归类卡片的链接保持在最后（"所属"字段下）
        // MNUtil.showHUD("已将链接移动到\"相关链接\"字段");
        MNUtil.undoGrouping(() => {
          note.refresh();
        });
        return true;
        
      } else if (noteType === "定义" && targetNoteType === "定义") {
        // 场景2：定义卡片之间的链接
        // 检查是否互为最后一条评论链接
        if (!this.checkMutualLastCommentLinks(note, targetNote)) {
          MNUtil.showHUD("不满足互为最后一条评论链接的条件");
          return false;
        }
        
        // 两个定义卡片都需要处理
        
        // 处理当前卡片
        note.appendMarkdownComment("- ");
        this.moveCommentsArrToField(note, [note.MNComments.length - 1], "相关思考");
        this.moveCommentsArrToField(note, [note.MNComments.length - 1], "相关思考");
        
        // 处理目标卡片
        let targetLinkIndex = targetNote.MNComments.findIndex(comment => {
          if (comment && comment.type === "linkComment") {
            let linkId = comment.text.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1];
            return linkId === note.noteId;
          }
          return false;
        });
        
        if (targetLinkIndex !== -1) {
          targetNote.appendMarkdownComment("- ");
          this.moveCommentsArrToField(targetNote, [targetNote.MNComments.length - 1], "相关思考");
          this.moveCommentsArrToField(targetNote, [targetNote.MNComments.length - 1], "相关思考");
        }
        
        // MNUtil.showHUD("已将两个定义卡片的链接移动到\"相关思考\"字段");
        MNUtil.undoGrouping(() => {
          note.refresh();
          targetNote.refresh();
        });
        return true;
        
      } else if ((noteType === "定义" && targetNoteType === "归类") || (noteType === "归类" && targetNoteType === "定义")) {
        // 场景4：定义卡片与归类卡片的双向链接
        if (noteType === "定义") {
          // note 是定义卡片，targetNote 是归类卡片
          // 归类卡片中的链接移动到"所属"字段
          let targetLinkIndex = targetNote.MNComments.findIndex(comment => {
            if (comment.type === "linkComment") {
              let linkId = comment.text.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1];
              return linkId === note.noteId;
            }
            return false;
          });
          
          if (targetLinkIndex !== -1) {
            this.moveCommentsArrToField(targetNote, [targetLinkIndex], "所属", true);
          }
          
          // 定义卡片的链接保持在最后
          
        } else {
          // note 是归类卡片，targetNote 是定义卡片
          // 归类卡片中的链接移动到"所属"字段
          let linkIndex = comments.length - 1;
          this.moveCommentsArrToField(note, [linkIndex], "所属", true);
          
          // 定义卡片的链接保持在最后
        }
        
        MNUtil.undoGrouping(() => {
          note.refresh();
          targetNote.refresh();
        });
        return true;
        
      } else if (noteType === "归类" && targetNoteType === "归类") {
        // 场景3：归类卡片之间的链接
        // 两个归类卡片都需要处理
        
        // 处理当前卡片
        note.appendMarkdownComment("- ");
        this.moveCommentsArrToField(note, [note.MNComments.length - 1], "相关思考");
        this.moveCommentsArrToField(note, [note.MNComments.length - 1], "相关思考");
        
        // 处理目标卡片
        let targetLinkIndex = targetNote.MNComments.findIndex(comment => {
          if (comment && comment.type === "linkComment") {
            let linkId = comment.text.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1];
            return linkId === note.noteId;
          }
          return false;
        });
        
        if (targetLinkIndex !== -1) {
          targetNote.appendMarkdownComment("- ");
          this.moveCommentsArrToField(targetNote, [targetNote.MNComments.length - 1], "相关思考");
          this.moveCommentsArrToField(targetNote, [targetNote.MNComments.length - 1], "相关思考");
        }
        
        MNUtil.undoGrouping(()=>{
          note.refresh();
          targetNote.refresh();
        })
        return true;
        
      } else if (
        ["命题", "例子", "反例"].includes(noteType) && 
        ["命题", "例子", "反例"].includes(targetNoteType)
      ) {
        // 场景5：命题、例子、反例之间的链接
        // 检查是否互为最后一条评论链接
        if (!this.checkMutualLastCommentLinks(note, targetNote)) {
          MNUtil.showHUD("不满足互为最后一条评论链接的条件");
          return false;
        }
        
        // 两个卡片都需要处理，类似定义卡片之间的处理
        
        // 处理当前卡片
        note.appendMarkdownComment("- ");
        this.moveCommentsArrToField(note, [note.MNComments.length - 1], "相关思考");
        this.moveCommentsArrToField(note, [note.MNComments.length - 1], "相关思考");
        
        // 处理目标卡片
        let targetLinkIndex = targetNote.MNComments.findIndex(comment => {
          if (comment && comment.type === "linkComment") {
            let linkId = comment.text.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1];
            return linkId === note.noteId;
          }
          return false;
        });
        
        if (targetLinkIndex !== -1) {
          targetNote.appendMarkdownComment("- ");
          this.moveCommentsArrToField(targetNote, [targetNote.MNComments.length - 1], "相关思考");
          this.moveCommentsArrToField(targetNote, [targetNote.MNComments.length - 1], "相关思考");
        }
        
        MNUtil.undoGrouping(() => {
          note.refresh();
          targetNote.refresh();
        });
        return true;
        
      } else {
        MNUtil.showHUD(`不支持的卡片类型组合：${noteType} <-> ${targetNoteType}`);
        return false;
      }
      
    } catch (error) {
      MNUtil.addErrorLog(error, "smartLinkArrangement", {
        noteId: note?.noteId,
        noteTitle: note?.noteTitle
      });
      MNUtil.showHUD("处理链接时出错：" + error.message);
      return false;
    }
  }

  /**
   * 刷新卡片
   */
  static refreshNote(note) {
    note.note.appendMarkdownComment("")
    note.note.removeCommentByIndex(note.note.comments.length-1)
  }
  static refreshNotes(note) {
    // if (note.descendantNodes.descendant.length > 0) {
    //   note.descendantNodes.descendant.forEach(descendantNote => {
    //     this.refreshNote(descendantNote)
    //   })
    // }
    // if (note.ancestorNodes.length > 0) {
    //   note.ancestorNodes.forEach(ancestorNote => {
    //     this.refreshNote(ancestorNote)
    //   })
    // }
    if (note.parentNote) {
      this.refreshNote(note.parentNote)
    }

    this.refreshNote(note) // 刷新当前卡片

    // 刷新所有子卡片，不需要孙卡片
    if (note.childNotes.length > 0) {
      note.childNotes.forEach(childNote => {
        this.refreshNote(childNote)
      })
    }
    
    // 刷新当前卡片链接到的其他卡片
    // 这样可以确保双向链接的卡片都能显示正确的新标题
    if (note.MNComments && note.MNComments.length > 0) {
      note.MNComments.forEach(comment => {
        if (comment && comment.type === "linkComment") {
          try {
            // 直接使用 URL 获取链接的卡片
            const linkedNote = MNNote.new(comment.text);
            if (linkedNote) {
              this.refreshNote(linkedNote);
            }
          } catch (error) {
            // 忽略无法刷新的链接卡片
          }
        }
      });
    }
  }

  /**
   * 判断是否为旧模板卡片
   * 判断标准：存在 "Remark" 的 HtmlComment
   * 
   * @param {MNNote} note - 要判断的卡片
   * @returns {boolean} 是否为旧模板卡片
   */
  static isOldTemplateCard(note) {
    let commentsObj = this.parseNoteComments(note);
    let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    let htmlCommentsTextArr = commentsObj.htmlCommentsTextArr;
    
    // 检查是否有 "Remark" 字段
    if (htmlCommentsTextArr.some(text => text.includes("Remark"))) {
      return true;
    }

    // 若同时存在 “证明” 和 “所属” 字段
    if (
      htmlCommentsTextArr.some(text => text.includes("证明")) &&
      htmlCommentsTextArr.some(text => text.includes("所属"))
    ) {
      return true;
    }

    
    // 检查"应用"字段是否存在且不在最后
    for (let i = 0; i < htmlCommentsObjArr.length; i++) {
      let fieldObj = htmlCommentsObjArr[i];
      if (fieldObj.text.includes("应用")) {
        // 如果找到"应用"字段且不是最后一个字段，则认为是旧卡片
        if (i < htmlCommentsObjArr.length - 1) {
          return true;
        }
        break;
      }
    }
    
    return false;
  }

  /**
   * 处理旧模板卡片
   * - 使用 clone 技巧提取手写和图片
   * - 每张图片单独一张卡
   * - 手写内容单独一张卡
   * - 应用字段内容单独一张卡
   * - 其余内容一张卡
   * 
   * @param {MNNote} oldNote - 要处理的旧模板卡片
   */
  static processOldTemplateCard(oldNote) {
    let note = this.toNoExcerptVersion(oldNote) // 先转为非摘录模式
    this.removeUnnecessaryComments(note)
    note.convertLinksToNewVersion()
    note.cleanupBrokenLinks()
    note.fixMergeProblematicLinks()
    // 使用 MNComments 获取更精准的类型
    let MNComments = note.MNComments;
    let excerptBlockIndexArr = this.getExcerptBlockIndexArr(note)
    let startIndex = 0
    if (excerptBlockIndexArr && excerptBlockIndexArr.length > 0) {
      startIndex = excerptBlockIndexArr[excerptBlockIndexArr.length-1]!==-1?excerptBlockIndexArr[excerptBlockIndexArr.length-1] + 1:0;
    }
    
    // 分类收集不同类型内容的索引
    let handwritingIndices = [];  // 手写内容索引
    let imageIndices = [];  // 图片索引（每个元素代表一张图片）
    let applicationFieldIndices = [];  // 应用字段相关内容索引
    let otherContentIndices = [];  // 其他文本内容索引
    let htmlFieldIndices = [];  // HTML字段标记索引
    
    // 字段内容映射
    let fieldContents = {};  // { fieldName: { indices: [], texts: [], links: [] } }
    let currentField = null;
    
    // 遍历所有评论进行分类
    for (let i = startIndex; i < MNComments.length; i++) {
      let mnComment = MNComments[i];
      
      // 检查是否是 HtmlComment（字段标记）
      if (mnComment.type === "HtmlComment") {
        currentField = mnComment.text.trim();
        htmlFieldIndices.push(i);
        if (!fieldContents[currentField]) {
          fieldContents[currentField] = { indices: [], texts: [], links: [] };
        }
        continue;
      }
      
      // 分类处理不同类型的评论
      if (mnComment.type === "drawingComment" || 
          mnComment.type === "imageCommentWithDrawing" || 
          mnComment.type === "mergedImageCommentWithDrawing") {
        // 手写内容
        handwritingIndices.push(i);
      } else if (mnComment.type === "imageComment" || 
                 mnComment.type === "mergedImageComment") {
        // 纯图片内容（每张图片单独记录）
        imageIndices.push(i);
      } else if (currentField && currentField.includes("应用")) {
        // 应用字段的内容
        applicationFieldIndices.push(i);
        fieldContents[currentField].indices.push(i);
        
        // 记录内容
        if (mnComment.type === "linkComment" || mnComment.type === "summaryComment") {
          fieldContents[currentField].links.push(mnComment.text);
        } else if (mnComment.type === "textComment" || 
                   mnComment.type === "markdownComment" || 
                   mnComment.type === "mergedTextComment" ||
                   mnComment.type === "tagComment") {
          fieldContents[currentField].texts.push(mnComment.text);
        }
      } else if (currentField) {
        // 其他字段的内容
        otherContentIndices.push(i);
        fieldContents[currentField].indices.push(i);
        
        // 记录内容
        if (mnComment.type === "linkComment" || mnComment.type === "summaryComment") {
          fieldContents[currentField].links.push(mnComment.text);
        } else if (mnComment.type === "textComment" || 
                   mnComment.type === "markdownComment" || 
                   mnComment.type === "mergedTextComment" ||
                   mnComment.type === "tagComment") {
          fieldContents[currentField].texts.push(mnComment.text);
        }
      }
    }
    
    // 创建的所有子卡片
    let createdChildNotes = [];
    
    MNUtil.undoGrouping(() => {
      // 1. 为手写内容创建独立卡片
      if (handwritingIndices.length > 0) {
        try {
          let clonedNote = note.clone();
          clonedNote.title = "";
          
          // 删除克隆卡片的所有子卡片
          if (clonedNote.childNotes && clonedNote.childNotes.length > 0) {
            for (let i = clonedNote.childNotes.length - 1; i >= 0; i--) {
              clonedNote.childNotes[i].removeFromParent();
            }
          }
          
          // 计算需要删除的索引（保留手写内容）
          let allIndices = Array.from({length: clonedNote.comments.length}, (_, i) => i);
          let indicesToDelete = allIndices.filter(i => !handwritingIndices.includes(i));
          indicesToDelete.sort((a, b) => b - a);
          
          // 删除非手写内容
          clonedNote.removeCommentsByIndexArr(indicesToDelete);
          
          // 添加为子卡片
          note.addChild(clonedNote);
          createdChildNotes.push(clonedNote);
          clonedNote.refresh();
        } catch (error) {
          MNUtil.showHUD("创建手写卡片失败: " + error.message);
        }
      }
      
      // 2. 为每张图片创建独立卡片
      imageIndices.forEach((imageIndex, idx) => {
        try {
          let clonedNote = note.clone();
          clonedNote.title = "";
          
          // 删除克隆卡片的所有子卡片
          if (clonedNote.childNotes && clonedNote.childNotes.length > 0) {
            for (let i = clonedNote.childNotes.length - 1; i >= 0; i--) {
              clonedNote.childNotes[i].removeFromParent();
            }
          }
          
          // 计算需要删除的索引（只保留当前图片）
          let allIndices = Array.from({length: clonedNote.comments.length}, (_, i) => i);
          let indicesToDelete = allIndices.filter(i => i !== imageIndex);
          indicesToDelete.sort((a, b) => b - a);
          
          // 删除其他内容
          clonedNote.removeCommentsByIndexArr(indicesToDelete);
          
          // 添加为子卡片
          note.addChild(clonedNote);
          createdChildNotes.push(clonedNote);
          clonedNote.refresh();
        } catch (error) {
          MNUtil.showHUD(`创建图片卡片 ${idx + 1} 失败: ` + error.message);
        }
      });
      
      // 3. 为应用字段内容创建独立卡片
      if (applicationFieldIndices.length > 0) {
        try {
          let clonedNote = note.clone();
          clonedNote.title = "";
          
          // 删除克隆卡片的所有子卡片
          if (clonedNote.childNotes && clonedNote.childNotes.length > 0) {
            for (let i = clonedNote.childNotes.length - 1; i >= 0; i--) {
              clonedNote.childNotes[i].removeFromParent();
            }
          }
          
          // 计算需要删除的索引（保留应用字段内容）
          let allIndices = Array.from({length: clonedNote.comments.length}, (_, i) => i);
          let indicesToDelete = allIndices.filter(i => !applicationFieldIndices.includes(i));
          indicesToDelete.sort((a, b) => b - a);
          
          // 删除其他内容
          clonedNote.removeCommentsByIndexArr(indicesToDelete);
          
          // 添加为子卡片
          note.addChild(clonedNote);
          createdChildNotes.push(clonedNote);
          clonedNote.refresh();
        } catch (error) {
          MNUtil.showHUD("创建应用字段卡片失败: " + error.message);
        }
      }
      
      // 4. 为其他文本内容创建卡片
      if (otherContentIndices.length > 0) {
        // 检查是否有实际内容（不只是HTML字段标记）
        let hasActualContent = Object.keys(fieldContents).some(fieldName => {
          if (fieldName && fieldName.includes("应用")) return false;  // 跳过应用字段
          let field = fieldContents[fieldName];
          return field.texts.length > 0 || field.links.length > 0;
        });
        
        if (hasActualContent) {
          let config = {
            title: "",
            content: "",
            markdown: true,
            color: note.colorIndex
          };
          let textCard = note.createChildNote(config);
          
          // 按字段添加内容
          Object.keys(fieldContents).forEach(fieldName => {
            if (fieldName && fieldName.includes("应用")) return;  // 跳过应用字段
            
            let field = fieldContents[fieldName];
            if (field.texts.length > 0 || field.links.length > 0) {
              // 添加字段标题
              textCard.appendMarkdownComment(`- ${fieldName}`);
              
              // 添加文本
              field.texts.forEach(text => {
                textCard.appendMarkdownComment(text);
              });
              
              // 添加链接
              field.links.forEach(link => {
                textCard.appendTextComment(link);
              });
            }
          });
          
          createdChildNotes.push(textCard);
          textCard.refresh();
        }
      }
      
      // 5. 清理原卡片：删除所有已处理的评论
      let allProcessedIndices = [
        ...handwritingIndices,
        ...imageIndices,
        ...applicationFieldIndices,
        ...otherContentIndices,
        ...htmlFieldIndices
      ];
      
      // 去重并排序
      allProcessedIndices = [...new Set(allProcessedIndices)].sort((a, b) => b - a);
      
      // 删除已处理的评论
      if (allProcessedIndices.length > 0) {
        note.removeCommentsByIndexArr(allProcessedIndices);
      }
      
      // 刷新原卡片
      note.refresh();
    });
    
    // // 显示处理结果
    // if (createdChildNotes.length > 0) {
    //   MNUtil.showHUD(`✅ 成功处理旧模板卡片，创建了 ${createdChildNotes.length} 张子卡片`);
    // }

    return note
  }

  /**
   * 处理旧卡片
   */
  static renewNote(note) {
    // 首先判断并处理旧模板卡片
    if (this.isOldTemplateCard(note)) {
      let newNote = this.processOldTemplateCard(note);
      this.changeTitle(newNote)
      return newNote
    }
    
    let newNote = this.toNoExcerptVersion(note)
    
    // 处理链接相关问题
    // this.convertLinksToNewVersion(note)
    // this.cleanupBrokenLinks(note)
    // this.fixMergeProblematicLinks(note)
    note.convertLinksToNewVersion()
    note.cleanupBrokenLinks()
    note.fixMergeProblematicLinks()
    
    // 处理空的"关键词："字段
    this.processEmptyKeywordField(note)
    
    // 处理不同类型转换时的第一个字段替换
    this.replaceFirstFieldIfNeeded(note)

    // 去掉一些评论，比如“- ”
    this.removeUnnecessaryComments(note)

    // 检测是否包含“应用”字段，但“应用”字段不是最后一个字段，如果不是最后一个字段，则将其移动到最后
    this.moveApplicationFieldToEnd(note)
    
    switch (this.getNoteType(note)) {
      case "归类":
        /**
         * 去掉归类卡片的标题中的“xx”：“yy” 里的 xx
         */
        let titleParts = this.parseNoteTitle(note);
        if (/^“[^”]*”：“[^”]*”\s*相关[^“]*$/.test(note.title)) {
          note.title = `“${titleParts.content}”相关${titleParts.type}`;
        }
        break;
      case "定义":
        this.moveRelatedConceptsToRelatedThoughts(note);
        break;
    }

    return newNote
  }

  static moveApplicationFieldToEnd(note) {
    let commentsObj = this.parseNoteComments(note);
    let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    let applicationFieldObj = null;
    let applicationFieldIndex = -1;
    for (let i = 0; i < htmlCommentsObjArr.length; i++) {
      let fieldObj = htmlCommentsObjArr[i];
      if (fieldObj.text.includes("应用")) {
        applicationFieldObj = fieldObj;
        applicationFieldIndex = i;
        break;
      }
    }

    // 如果没有找到"应用"字段，直接返回
    if (!applicationFieldObj) {
      return;
    }

    // 检查"应用"字段是否已经是最后一个字段
    if (applicationFieldIndex === htmlCommentsObjArr.length - 1) {
      return; // 已经是最后一个字段，无需移动
    }

    // 获取"应用"字段下的内容索引（不包括字段本身）
    let contentIndices = applicationFieldObj.excludingFieldBlockIndexArr;

    // 如果该字段下没有内容，只移动字段本身
    if (contentIndices.length === 0) {
      note.moveComment(applicationFieldObj.index, note.comments.length - 1);
      return;
    }

    // 将字段和内容一起移动到最后（使用包含字段的索引）
    let fullBlockIndices = applicationFieldObj.includingFieldBlockIndexArr;
    this.moveCommentsArrToField(note, fullBlockIndices, null, true);
  }

  static removeUnnecessaryComments(note) {
    let comments = note.MNComments;
    let unnecessaryPatterns = [
      /^\s*-\s*$/, // 仅包含“- ”的评论
    ]
    MNUtil.undoGrouping(() => {
      for (let i = comments.length - 1; i >= 0; i--){
        let comment = comments[i];
        if (comment && 
          (comment.type === "textComment" || comment.type === "markdownComment")
        ) {
          let isUnnecessary = unnecessaryPatterns.some(pattern => pattern.test(comment.text));
          if (isUnnecessary) {
            note.removeCommentByIndex(i);
          }
        }
      }
    })
  }

  /**
   * 处理定义类卡片的"相关概念："字段
   * 将"相关概念："字段下的内容移动到"相关思考"字段下方，并删除"相关概念："字段
   * 
   * @param {MNNote} note - 要处理的卡片
   */
  static moveRelatedConceptsToRelatedThoughts(note) {
    let commentsObj = this.parseNoteComments(note);
    let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    
    // 查找"相关概念："字段（使用中文引号）
    let relatedConceptsFieldObj = null;
    let relatedConceptsFieldIndex = -1;
    
    for (let i = 0; i < htmlCommentsObjArr.length; i++) {
      let fieldObj = htmlCommentsObjArr[i];
      if (fieldObj.text.includes("相关概念")) {
        relatedConceptsFieldObj = fieldObj;
        relatedConceptsFieldIndex = i;
        break;
      }
    }
    
    // 如果没有找到"相关概念："字段，直接返回
    if (!relatedConceptsFieldObj) {
      return;
    }
    
    // 获取"相关概念："字段下的内容索引（不包括字段本身）
    let contentIndices = relatedConceptsFieldObj.excludingFieldBlockIndexArr;
    
    // 如果该字段下没有内容，只删除字段本身
    if (contentIndices.length === 0) {
      note.removeCommentByIndex(relatedConceptsFieldObj.index);
      return;
    }
    
    // 将内容移动到"相关思考"字段下方
    this.moveCommentsArrToField(note, contentIndices, "相关思考", true);
    
    // 删除"相关概念："字段本身
    // 注意：移动内容后，原字段的索引可能已经改变，需要重新计算
    let updatedCommentsObj = this.parseNoteComments(note);
    let updatedHtmlCommentsObjArr = updatedCommentsObj.htmlCommentsObjArr;
    
    for (let fieldObj of updatedHtmlCommentsObjArr) {
      if (fieldObj.text.includes("相关概念：")) {
        note.removeCommentByIndex(fieldObj.index);
        break;
      }
    }
    
    // MNUtil.log(`✅ 已将"相关概念："字段下的 ${contentIndices.length} 条内容移动到"相关思考"字段下方`);
  }

  /**
   * 处理空的"关键词："字段
   * 识别并处理"关键词："字段是否为空（冒号后没有空格或没有其他非空格内容）
   * 如果是空的，则删除该字段并用模板卡片的内容替换
   * 
   * @param {MNNote} note - 要处理的卡片
   */
  static processEmptyKeywordField(note) {
    let commentsObj = this.parseNoteComments(note);
    let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    
    // 查找"关键词："字段
    let keywordFieldObj = null;
    
    for (let i = 0; i < htmlCommentsObjArr.length; i++) {
      let fieldObj = htmlCommentsObjArr[i];
      // 检查是否是"关键词："字段（支持中英文冒号）
      if (/^关键词[:：]\s*$/.test(fieldObj.text.trim())) {
        keywordFieldObj = fieldObj;
        break;
      }
    }
    
    // 如果没有找到空的"关键词："字段，直接返回
    if (!keywordFieldObj) {
      return;
    }
    
    try {
      // 记录原始字段的索引位置
      let originalFieldIndex = keywordFieldObj.index;
      
      // 删除空的"关键词："字段
      note.removeCommentByIndex(originalFieldIndex);
      
      // 获取模板卡片并克隆合并
      let templateNoteId = "13D040DD-A662-4EFF-A751-217EE9AB7D2E";
      let templateNote = MNNote.new(templateNoteId, false);
      
      if (templateNote) {
        // 克隆模板卡片到当前卡片
        let clonedNote = templateNote.clone();
        if (clonedNote) {
          // 合并克隆的卡片到当前卡片（新内容会添加到末尾）
          clonedNote.mergeInto(note);
          
          // 新合并的"关键词："字段在最后一个位置（note.comments.length - 1）
          // 将它移动到原来的位置
          let lastCommentIndex = note.comments.length - 1;
          note.moveComment(lastCommentIndex, originalFieldIndex);
          
          // 刷新显示
          note.refresh();
        }
      } else {
        MNUtil.log("警告：无法找到关键词模板卡片 (ID: 13D040DD-A662-4EFF-A751-217EE9AB7D2E)");
      }
      
    } catch (error) {
      MNUtil.addErrorLog(error, "processEmptyKeywordField", {
        noteId: note.noteId,
        noteTitle: note.noteTitle
      });
    }
  }

  /**
   * 修改标题
   * 
   * TODO:
   * []强制修改前缀
   * []如果有补充内容，则不修改前缀，防止条件内容被清除
   */
  static changeTitle(note, forced = false) {
    /**
     * 不在制卡时修改卡片标题的类型
     * 
     * 归类：因为取消了以前的“xx”：“yy” 里的 xx，只用链接来考虑所属，所以不需要涉及改变标题
     */
    let noteType = this.getNoteType(note)
    
    let excludingTypes = ["思路", "作者", "研究进展", "论文", "书作", "文献"];
    if (!excludingTypes.includes(noteType)) {
      switch (noteType) {
        case "归类":
          /**
           * 去掉归类卡片的标题中的“xx”：“yy” 里的 xx
           */
          if (this.hasOldClassificationTitle(note)) {
            note.title = `“${this.parseNoteTitle(note).content}”相关${this.parseNoteTitle(note).type}`;
          }
          break;
        default:
          // 获取归类卡片
          let classificationNote = this.getFirstClassificationParentNote(note);
          if (classificationNote) {
            let classificationNoteTitleParts = this.parseNoteTitle(classificationNote);
            // 生成新的前缀内容（不包含【】）
            let newPrefixContent = this.createChildNoteTitlePrefixContent(classificationNote);
            
            // 解析当前笔记的标题
            let noteTitleParts = this.parseNoteTitle(note);
            
            // 强制修改前缀的处理
            if (forced === true) {
              // 先移除现有前缀
              this.removeTitlePrefix(note);
              // 重新解析标题
              noteTitleParts = this.parseNoteTitle(note);
            }
            
            // 智能前缀比较逻辑
            let shouldUpdatePrefix = true;
            if (!forced && noteTitleParts.prefixContent) {
              // 如果现有前缀包含新前缀内容，则保留现有前缀
              // 例如：现有前缀 "AB" 包含新前缀 "A"，则不更新
              if (noteTitleParts.prefixContent.includes(newPrefixContent)) {
                shouldUpdatePrefix = false;
              }
            }
            
            // 如果是强制模式，总是更新前缀
            if (forced === true) {
              shouldUpdatePrefix = true;
            }
            
            // 构建最终标题
            let finalPrefix;
            if (shouldUpdatePrefix) {
              // 使用新前缀
              finalPrefix = this.createTitlePrefix(classificationNoteTitleParts.type, newPrefixContent);
            } else {
              // 保留现有前缀
              finalPrefix = this.createTitlePrefix(noteTitleParts.type || classificationNoteTitleParts.type, noteTitleParts.prefixContent);
            }
            
            // 定义类 noteTitleParts.content 前要加 `; `
            if (noteType === "定义") {
              note.title = finalPrefix + '; ' + noteTitleParts.content;
            } else {
              note.title = `${finalPrefix}${noteTitleParts.content}`;
            }
          }
          break;
      }
    }

    note.title = Pangu.spacing(note.title)
  }

  /**
   * 批量更新归类卡片下所有知识点子孙卡片的前缀
   * 点击归类卡片后调用此函数，会强制更新所有符合条件的子孙卡片前缀
   * 
   * @param {MNNote} classificationNote - 归类卡片
   */
  static batchUpdateChildrenPrefixes(classificationNote, descendant = false) {
    // 检查是否为归类卡片
    if (!this.isClassificationNote(classificationNote)) {
      MNUtil.showHUD("请选择一个归类卡片");
      return;
    }
    let descendants
    if (descendant) {
      // 获取所有子孙卡片
      descendants = this.getAllDescendantNotes(classificationNote);
    } else {
      // 只获取子卡片
      descendants = classificationNote.childNotes
    }
    
    let processedCount = 0;
    let skippedCount = 0;
    
    // 批量处理
    MNUtil.undoGrouping(() => {
      descendants.forEach(note => {
        const mnNote = MNNote.new(note);
        
        // 跳过没有标题的卡片
        if (!mnNote.noteTitle) {
          skippedCount++;
          return;
        }
        
        // // 跳过非知识点卡片（使用已有的 isKnowledgeNote 函数）
        // if (!this.isKnowledgeNote(mnNote)) {
        //   skippedCount++;
        //   return;
        // }
        
        // 强制更新前缀
        this.changeTitle(mnNote, true);
        this.linkParentNote(mnNote)
        processedCount++;
      });

      classificationNote.refreshAll()
    });
    
    // 显示处理结果
    MNUtil.showHUD(`已更新 ${processedCount} 个知识点卡片的前缀，跳过 ${skippedCount} 个卡片`, 2);
  }

  /**
   * 批量重新处理归类卡片标题
   * 
   * 专门用于处理"归类"类型的卡片，将旧格式标题转换为新格式
   * 旧格式："xx"："yy"相关 zz -> 新格式："yy"相关 zz
   * 
   * @param {string} scope - 处理范围："selected" | "children" | "descendants"
   * @param {MNNote} [rootNote] - 当 scope 为 "children" 或 "descendants" 时，指定根卡片
   */
  static async batchChangeClassificationTitles(scope = "descendants", rootNote = null) {
    try {
      let targetNotes = [];
      let processedCount = 0;
      let skippedCount = 0;

      // 根据范围获取目标卡片
      switch (scope) {
        case "selected":
          let focusNote = MNNote.getFocusNote();
          if (focusNote) {
            targetNotes = [focusNote.note];
          } else {
            MNUtil.showHUD("请先选择一个卡片");
            return;
          }
          break;
        case "children":
          if (!rootNote) {
            rootNote = MNNote.getFocusNote();
          }
          if (rootNote) {
            // rootNote.childNotes 返回 MNNote 对象数组，需要转换为原生 note 对象数组
            targetNotes = (rootNote.childNotes || []).map(mnNote => mnNote.note);
            targetNotes.push(rootNote.note)
          } else {
            MNUtil.showHUD("请先选择一个根卡片");
            return;
          }
          break;
        case "descendants":
          if (!rootNote) {
            rootNote = MNNote.getFocusNote();
          }
          if (rootNote) {
            targetNotes = this.getAllDescendantNotes(rootNote);
            targetNotes.push(rootNote.note)
          } else {
            MNUtil.showHUD("请先选择一个根卡片");
            return;
          }
          break;
        default:
          MNUtil.showHUD("无效的处理范围");
          return;
      }

      // 筛选出归类卡片
      let classificationNotes = [];
      for (let noteObj of targetNotes) {
        let note = new MNNote(noteObj);
        if (this.getNoteType(note) === "归类") {
          classificationNotes.push(note);
        }
      }

      if (classificationNotes.length === 0) {
        MNUtil.showHUD("没有找到归类卡片");
        return;
      }

      // 询问用户确认
      let confirmMessage = `找到 ${classificationNotes.length} 个归类卡片，是否批量更新标题格式？`;
      let userConfirmed = await MNUtil.confirm("批量修改归类卡片标题", confirmMessage);
      if (!userConfirmed) {
        return;
      }

      // 显示进度提示
      MNUtil.showHUD(`开始处理 ${classificationNotes.length} 个归类卡片...`);

      // 使用 undoGrouping 包装批量操作
      MNUtil.undoGrouping(() => {
        for (let i = 0; i < classificationNotes.length; i++) {
          let note = classificationNotes[i];
          let originalTitle = note.title;
          
          // 使用现有的解析方法
          // let titleParts = this.parseNoteTitle(note);
          
          // 检查是否解析成功，并且是旧格式
          if (this.hasOldClassificationTitle(note)) {
            // 转换为新格式："content"相关 type
            // note.title = `“${titleParts.content}”相关${titleParts.type}`;
            this.changeTitle(note)

            processedCount++;
            MNUtil.log({
              level: "info",
              message: `归类卡片标题已更新：${originalTitle} -> ${note.title}`,
              source: "knowledgeBaseTemplate.batchChangeClassificationTitles"
            });
          } else {
            skippedCount++;
            MNUtil.log({
              level: "info",
              message: `跳过标题（已是新格式或无法解析）：${originalTitle}`,
              source: "knowledgeBaseTemplate.batchChangeClassificationTitles"
            });
          }
        }
      });

      // 显示进度更新
      for (let i = 0; i < classificationNotes.length; i++) {
        if ((i + 1) % 5 === 0) {
          MNUtil.showHUD(`处理中... ${i + 1}/${classificationNotes.length}`);
          await MNUtil.delay(0.1);
        }
      }

      // 显示处理结果
      let resultMessage = `归类卡片处理完成！\n已更新：${processedCount} 个\n跳过：${skippedCount} 个`;
      MNUtil.showHUD(resultMessage);
      
      // 记录处理结果
      MNUtil.log({
        level: "info",
        message: `批量归类卡片标题处理完成 - 范围：${scope}，处理：${processedCount}，跳过：${skippedCount}`,
        source: "knowledgeBaseTemplate.batchChangeClassificationTitles"
      });

    } catch (error) {
      MNUtil.showHUD("批量处理归类卡片标题时出错：" + error.message);
      MNUtil.log({
        level: "error",
        message: "批量处理归类卡片标题失败：" + error.message,
        source: "knowledgeBaseTemplate.batchChangeClassificationTitles"
      });
    }
  }

  static hasOldClassificationTitle(note) {
    // 检查标题是否符合旧格式："xx"："yy"相关 zz
    return /^“[^”]*”：“[^”]*”\s*相关[^“]*$/.test(note.title);
  }

  /**
   * 批量重新处理卡片标题
   * 
   * 可以选择处理当前文档的所有卡片或指定范围的卡片
   * 
   * @param {string} scope - 处理范围："all" | "selected" | "children" | "descendants"
   * @param {MNNote} [rootNote] - 当 scope 为 "children" 或 "descendants" 时，指定根卡片
   */
  static async batchChangeTitles(scope = "all", rootNote = null) {
    try {
      let targetNotes = [];
      let processedCount = 0;
      let skippedCount = 0;

      // 根据范围获取目标卡片
      switch (scope) {
        case "all":
          // 获取当前笔记本的所有卡片
          let currentNotebook = MNUtil.currentNotebook;
          if (currentNotebook) {
            targetNotes = currentNotebook.notes || [];
          } else {
            MNUtil.showHUD("请先打开一个笔记本");
            return;
          }
          break;
          
        case "selected":
          // 获取当前选中的卡片
          let focusNote = MNNote.getFocusNote();
          if (focusNote) {
            targetNotes = [focusNote.note];
          } else {
            MNUtil.showHUD("请先选择一个卡片");
            return;
          }
          break;
          
        case "children":
          // 获取指定卡片的直接子卡片
          if (!rootNote) {
            rootNote = MNNote.getFocusNote();
          }
          if (rootNote) {
            // rootNote.childNotes 返回 MNNote 对象数组，需要转换为原生 note 对象数组
            targetNotes = (rootNote.childNotes || []).map(mnNote => mnNote.note);
          } else {
            MNUtil.showHUD("请先选择一个根卡片");
            return;
          }
          break;
          
        case "descendants":
          // 获取指定卡片的所有后代卡片
          if (!rootNote) {
            rootNote = MNNote.getFocusNote();
          }
          if (rootNote) {
            targetNotes = this.getAllDescendantNotes(rootNote);
          } else {
            MNUtil.showHUD("请先选择一个根卡片");
            return;
          }
          break;
          
        default:
          MNUtil.showHUD("无效的处理范围");
          return;
      }

      if (targetNotes.length === 0) {
        MNUtil.showHUD("没有找到需要处理的卡片");
        return;
      }

      // 询问用户确认
      let confirmMessage = `即将批量处理 ${targetNotes.length} 个卡片的标题，是否继续？`;
      let userConfirmed = await MNUtil.confirm("批量修改标题", confirmMessage);
      if (!userConfirmed) {
        return;
      }

      // 显示进度提示
      MNUtil.showHUD(`开始处理 ${targetNotes.length} 个卡片...`);

      // 使用 undoGrouping 包装批量操作
      MNUtil.undoGrouping(() => {
        for (let i = 0; i < targetNotes.length; i++) {
          let note = new MNNote(targetNotes[i]);
          
          // 记录处理前的标题
          let originalTitle = note.title;
          
          // 调用 changeTitle 方法
          this.changeTitle(note);
          
          // 检查标题是否发生变化
          if (note.title !== originalTitle) {
            processedCount++;
            MNUtil.log({
              level: "info",
              message: `标题已更新：${originalTitle} -> ${note.title}`,
              source: "knowledgeBaseTemplate.batchChangeTitles"
            });
          } else {
            skippedCount++;
          }
        }
      });

      // 显示进度更新
      for (let i = 0; i < targetNotes.length; i++) {
        if ((i + 1) % 10 === 0) {
          MNUtil.showHUD(`处理中... ${i + 1}/${targetNotes.length}`);
          await MNUtil.delay(0.1);
        }
      }

      // 显示处理结果
      let resultMessage = `处理完成！\n已更新：${processedCount} 个\n跳过：${skippedCount} 个`;
      MNUtil.showHUD(resultMessage);
      
      // 记录处理结果
      MNUtil.log({
        level: "info",
        message: `批量标题处理完成 - 范围：${scope}，处理：${processedCount}，跳过：${skippedCount}`,
        source: "knowledgeBaseTemplate.batchChangeTitles"
      });

    } catch (error) {
      MNUtil.showHUD("批量处理标题时出错：" + error.message);
      MNUtil.log({
        level: "error",
        message: "批量处理标题失败：" + error.message,
        source: "knowledgeBaseTemplate.batchChangeTitles"
      });
    }
  }

  /**
   * 获取指定卡片的所有后代卡片（包括子卡片和子卡片的子卡片等）
   * 
   * @param {MNNote} rootNote - 根卡片
   * @returns {object[]} 所有后代卡片的原生对象数组
   */
  static getAllDescendantNotes(rootNote) {
    let descendants = [];
    
    // 确保 rootNote 是 MNNote 对象
    if (!rootNote || !rootNote.childNotes) {
      return descendants;
    }
    
    let childNotes = rootNote.childNotes || [];  // 这里返回的是 MNNote 对象数组
    
    for (let childMNNote of childNotes) {
      // childMNNote 已经是 MNNote 对象，不需要再用 new MNNote() 包装
      descendants.push(childMNNote.note);
      
      // 递归获取子卡片的后代
      let childDescendants = this.getAllDescendantNotes(childMNNote);
      descendants.push(...childDescendants);
    }
    
    return descendants;
  }

  /**
   * 获取指定卡片的所有后代卡片，支持跳过空白标题卡片
   * 
   * @param {MNNote} rootNote - 根卡片
   * @param {boolean} skipEmptyTitle - 是否跳过空白标题的卡片及其子孙
   * @param {Array<string>} rootNoteIds - 根目录ID列表，用于检查空白卡片的子卡片是否为根目录
   * @returns {object[]} 所有后代卡片的原生对象数组
   */
  static getAllDescendantNotesWithSkipEmpty(rootNote, skipEmptyTitle = false, rootNoteIds = []) {
    let descendants = [];
    
    // 确保 rootNote 是 MNNote 对象
    if (!rootNote || !rootNote.childNotes) {
      return descendants;
    }
    
    let childNotes = rootNote.childNotes || [];  // 这里返回的是 MNNote 对象数组
    
    for (let childMNNote of childNotes) {
      // 检查是否需要跳过空标题卡片
      const title = childMNNote.noteTitle || "";
      if (skipEmptyTitle && title.trim() === "") {
        // 检查该空白卡片的第一个子卡片是否在根目录列表中
        let shouldSkip = true;
        if (rootNoteIds && rootNoteIds.length > 0 && childMNNote.childNotes && childMNNote.childNotes.length > 0) {
          const firstChildId = childMNNote.childNotes[0].noteId;
          if (rootNoteIds.includes(firstChildId)) {
            shouldSkip = false;
            MNUtil.log(`⚠️ 空白标题卡片的子卡片为根目录，不跳过: ${childMNNote.noteId} -> ${firstChildId}`);
          }
        }
        
        if (shouldSkip) {
          // 跳过该卡片及其所有子孙
          MNUtil.log(`🚫 跳过空白标题卡片: ${childMNNote.noteId}`);
          continue;
        }
      }
      
      // childMNNote 已经是 MNNote 对象，不需要再用 new MNNote() 包装
      descendants.push(childMNNote.note);
      
      // 递归获取子卡片的后代（传递 skipEmptyTitle 和 rootNoteIds 参数）
      let childDescendants = this.getAllDescendantNotesWithSkipEmpty(childMNNote, skipEmptyTitle, rootNoteIds);
      descendants.push(...childDescendants);
    }
    
    return descendants;
  }

  /**
   * 获取第一个归类卡片的父爷卡片
   */
  static getFirstClassificationParentNote(note) {
    let parentNote = note.parentNote;
    while (parentNote) {
      if (this.getNoteType(parentNote) === "归类") {
        return parentNote;
      }
      parentNote = parentNote.parentNote;
    }
  }

  /**
   * 【非摘录版本】初始状态合并模板卡片后自动移动卡片的内容
   */
  static mergeTemplateAndAutoMoveNoteContent(note) {
    // 特殊处理：如果只有一条评论且是手写类型，直接合并模板不移动内容
    if (note.MNComments.length === 1) {
      let commentType = note.MNComments[0].type;
      if (commentType === "drawingComment" || 
          commentType === "imageCommentWithDrawing" || 
          commentType === "mergedImageCommentWithDrawing") {
        MNUtil.log("🖊️ 检测到单个手写评论，直接合并模板，不移动内容");
        this.mergeTemplate(note);
        return;
      }
    }
    
    // 白名单：这些类型的卡片即使只有图片+链接也按正常方式处理
    const typeWhitelist = []; // 暂时为空，后续可以添加需要排除的卡片类型
    
    // 获取卡片类型
    let noteType = this.getNoteType(note);
    
    // 检查是否为特殊情况：只有合并图片和链接
    let isSpecialCase = false;
    let linkIndices = [];
    
    if (!typeWhitelist.includes(noteType)) {
      // 检查所有评论是否只包含合并图片和链接
      let hasOtherContent = false;
      
      for (let i = 0; i < note.MNComments.length; i++) {
        let comment = note.MNComments[i];
        if (!comment) {
          continue;
        }
        if (comment.type === "mergedImageComment" || comment.type === "mergedImageCommentWithDrawing") {
          // 是合并图片，继续
          continue;
        } else if (comment.type === "linkComment") {
          // 是链接，记录索引
          linkIndices.push(i);
        } else {
          // 有其他类型的内容
          hasOtherContent = true;
          break;
        }
      }
      
      // 如果没有其他内容且有链接，则为特殊情况
      isSpecialCase = !hasOtherContent && linkIndices.length > 0;
    }
    
    let moveIndexArr = this.autoGetNewContentToMoveIndexArr(note);
    
    // 在合并模板前，如果卡片已经有文字评论了，先提取 Markdown 链接
    let marginNoteLinks = [];
    if (moveIndexArr.length > 0) {
      marginNoteLinks = this.extractMarginNoteLinksFromComments(note, moveIndexArr);
      MNUtil.log(`🔍 在合并模板前找到 ${marginNoteLinks.length} 个 MarginNote 链接`);
    }
    
    let ifTemplateMerged = this.mergeTemplate(note)

    if (!ifTemplateMerged) {
      // 使用映射表获取默认字段
      let field = this.getDefaultFieldForType(noteType);
      
      // 特殊处理：将链接移动到最底下
      if (isSpecialCase) {
        note.moveCommentsByIndexArr(moveIndexArr, note.comments.length);
      } else {
        if (field && moveIndexArr.length > 0) {
          this.moveCommentsArrToField(note, moveIndexArr, field);
        }
      }
    }
    
    // 处理之前提取的 MarginNote 链接
    if (marginNoteLinks.length > 0) {
      MNUtil.log("🔗 开始处理合并模板前提取的 MarginNote 链接...");
      this.processExtractedMarginNoteLinks(note, marginNoteLinks);
    }
  }

  static ifTemplateMerged(note) {
    return note.MNComments.some(comment => comment.type === "HtmlComment");
  }

  /**
   * 合并模板卡片
   */
  static mergeTemplate(note) {
    let ifTemplateMerged = note.MNComments.some(comment => comment.type === "HtmlComment"); // 是否已合并模板卡片，要在下面的代码前获取，否则一直是已合并
    // 防止重复制卡：如果里面有 HtmlComment 则不制卡
    if (!note.MNComments.some(comment => comment.type === "HtmlComment")) {
      this.cloneAndMergeById(note, this.types[this.getNoteType(note)].templateNoteId);
    }

    // 返回是否已制卡
    return ifTemplateMerged
  }

  /**
   * 合并两个卡片的标题链接词
   * 将源卡片的标题链接词不重复地合并到目标卡片
   * 
   * @param {MNNote} targetNote - 目标卡片（A）
   * @param {MNNote} sourceNote - 源卡片（B）
   */
  static mergeTitleLinkWords(targetNote, sourceNote) {
    // 如果任一卡片没有标题，不处理
    if (!targetNote.noteTitle || !sourceNote.noteTitle) {
      return;
    }

    if (this.getNoteType(sourceNote)!=="定义") { return }
    
    // 解析两个卡片的标题
    const targetParts = this.parseNoteTitle(targetNote);
    const sourceParts = this.parseNoteTitle(sourceNote);
    
    // 获取标题链接词数组
    let targetWords = targetParts.titleLinkWordsArr || [];
    let sourceWords = sourceParts.titleLinkWordsArr || [];
    
    // 如果源卡片没有标题链接词，直接返回
    if (sourceWords.length === 0) {
      return;
    }
    
    // 合并并去重（保持顺序：先目标的，再源的新增部分）
    const mergedWords = [...targetWords];
    for (const word of sourceWords) {
      if (!mergedWords.includes(word)) {
        mergedWords.push(word);
      }
    }
    
    // 如果没有新增词，直接返回
    if (mergedWords.length === targetWords.length) {
      return;
    }
    
    // 构建新标题
    let newTitle = "";
    
    // 保留目标卡片的前缀部分
    if (targetParts.type) {
      if (targetParts.prefixContent) {
        newTitle = `【${targetParts.type} >> ${targetParts.prefixContent}】`;
      } else {
        newTitle = `【${targetParts.type}】`;
      }
    }
    
    // 添加合并后的链接词
    if (mergedWords.length > 0) {
      // 判断原标题是否在】后有分号
      const hasLeadingSemicolon = targetNote.noteTitle.includes("】; ");
      if (hasLeadingSemicolon && newTitle) {
        newTitle += "; ";
      }
      newTitle += mergedWords.join("; ");
    }
    
    // 更新目标卡片标题
    targetNote.noteTitle = newTitle;
    
    MNUtil.log(`✅ 标题链接词合并完成: ${sourceWords.length} 个源词中有 ${mergedWords.length - targetWords.length} 个新增词`);
  }

  /**
   * 合并知识卡片
   * 将 sourceNote (B) 的内容按字段合并到 targetNote (A) 中
   * 
   * 注意：
   * - "相关链接"字段的内容会被删除，不参与合并
   * - 支持特殊字段映射（如思想方法的"原理"→命题的"证明"）
   * - 会自动处理字段名中的多余冒号
   * 
   * @param {MNNote} targetNote - 目标卡片 (A)，保留的卡片
   * @param {MNNote} sourceNote - 源卡片 (B)，将被合并的卡片
   */
  static renewKnowledgeNotes(targetNote, sourceNote) {
    try {
      MNUtil.log("🔀 开始合并知识卡片...");
      
      // 1. 先处理标题合并（在任何其他操作之前）
      this.mergeTitleLinkWords(targetNote, sourceNote);
      
      // 2. 获取两个卡片的类型
      const targetType = this.getNoteType(targetNote);
      const sourceType = this.getNoteType(sourceNote);
      
      MNUtil.log(`📋 目标卡片类型: ${targetType || '未知'}, 源卡片类型: ${sourceType || '未知'}`);
      
      // 3. 使用 ifTemplateMerged 判断源卡片是否有字段结构
      const sourceHasTemplate = this.ifTemplateMerged(sourceNote);
      
      // 4. 使用 undoGrouping 包装所有修改操作
      MNUtil.undoGrouping(() => {
        // 清除源卡片的标题
        sourceNote.noteTitle = "";
        
        // 根据是否有模板分别处理
        if (!sourceHasTemplate) {
          // 无字段结构的特殊处理
          MNUtil.log("📝 源卡片无字段结构，将内容移动到摘录区");
          
          // 执行合并
          sourceNote.mergeInto(targetNote);
          
          // 将新内容移动到摘录区
          this.autoMoveNewContentToField(targetNote, "摘录", true, false);
          
          // 刷新卡片显示
          targetNote.refresh();
          
          MNUtil.showHUD("✅ 知识卡片合并完成（内容已移至摘录区）");
          return;
        }
        
        // 有字段结构的处理 - 采用逐字段处理策略
        // 解析源卡片的评论结构
        const sourceCommentsObj = this.parseNoteComments(sourceNote);
        const sourceHtmlComments = sourceCommentsObj.htmlCommentsObjArr;
        
        // 建立字段映射关系
        const fieldMapping = this.buildFieldMapping(sourceType, targetType);
        
        // 记录所有已处理的内容索引
        const processedIndices = new Set();
        
        // 逐个处理每个字段（不要一次性删除所有字段标记）
        sourceHtmlComments.forEach(htmlComment => {
          try {
            // 标准化字段名（去除多余的冒号）
            const fieldName = this.normalizeFieldName(htmlComment.text);
            
            // 跳过"相关链接"字段
            if (fieldName === "相关链接") {
              MNUtil.log(`⏭️ 跳过"相关链接"字段`);
              // 记录相关链接字段的所有索引（包括标记和内容）
              processedIndices.add(htmlComment.index);
              htmlComment.excludingFieldBlockIndexArr.forEach(idx => {
                processedIndices.add(idx);
              });
              return;
            }
            
            // 获取字段内容的索引（不包括字段标记本身）
            const contentIndices = htmlComment.excludingFieldBlockIndexArr;
            
            // 记录已处理的索引
            processedIndices.add(htmlComment.index); // 字段标记本身
            contentIndices.forEach(idx => processedIndices.add(idx)); // 字段内容
            
            if (contentIndices.length === 0) {
              MNUtil.log(`ℹ️ 字段 "${fieldName}" 无内容，跳过`);
              return;
            }
            
            // 确定目标字段名
            const targetFieldName = fieldMapping[fieldName] || fieldName;
            
            MNUtil.log(`📋 处理字段 "${fieldName}" → "${targetFieldName}": ${contentIndices.length} 条内容`);
            
            // 在克隆和合并之前，先维护链接关系
            // 将其他卡片中指向源卡片B的链接替换为指向目标卡片A
            contentIndices.forEach(index => {
              const comment = sourceNote.MNComments[index];
              if (comment && comment.type === "linkComment") {
                const linkedNote = MNNote.new(comment.text);
                if (linkedNote) {
                  // 找到被链接卡片C中所有指向源卡片B的链接
                  const sourceLinkIndices = linkedNote.getLinkCommentsIndexArr(sourceNote.noteURL);
                  if (sourceLinkIndices.length > 0) {
                    MNUtil.log(`🔗 在卡片 ${linkedNote.noteId} 中找到 ${sourceLinkIndices.length} 个指向源卡片的链接，正在替换...`);
                    // 直接替换为指向目标卡片A的链接
                    sourceLinkIndices.forEach(linkIndex => {
                      linkedNote.replaceWithMarkdownComment(targetNote.noteURL, linkIndex);
                    });
                    linkedNote.refresh();
                  }
                }
              }
            });
            
            // 记录合并前目标卡片的评论数量
            const targetCommentsCountBefore = targetNote.comments.length;
            
            // 克隆源卡片用于提取字段内容（借鉴 performExtract 的思路）
            const tempNote = sourceNote.clone();
            tempNote.noteTitle = "";
            
            // 删除子卡片（如果有的话）
            if (tempNote.childNotes && tempNote.childNotes.length > 0) {
              for (let i = tempNote.childNotes.length - 1; i >= 0; i--) {
                tempNote.childNotes[i].removeFromParent();
              }
            }
            
            // 只保留当前字段的内容
            const allIndices = Array.from({length: tempNote.comments.length}, (_, i) => i);
            const indicesToDelete = allIndices.filter(i => !contentIndices.includes(i));
            
            // 从后往前删除，避免索引变化
            indicesToDelete.sort((a, b) => b - a);
            indicesToDelete.forEach(index => {
              tempNote.removeCommentByIndex(index);
            });
            
            // 将提取的内容合并到目标卡片
            tempNote.mergeInto(targetNote);
            
            // 计算新增内容的索引（新内容被添加到目标卡片的末尾）
            const newContentIndices = [];
            const newContentCount = contentIndices.length;
            for (let i = 0; i < newContentCount; i++) {
              newContentIndices.push(targetCommentsCountBefore + i);
            }
            
            // 立即将新内容移动到对应的目标字段
            if (newContentIndices.length > 0) {
              // 先检查目标字段是否存在
              const targetFieldIndex = targetNote.getIncludingHtmlCommentIndex(targetFieldName);
              
              if (targetFieldIndex !== -1) {
                // 移动内容到目标字段
                this.moveCommentsArrToField(targetNote, newContentIndices, targetFieldName, true);
              }
              
              
              MNUtil.log(`✅ 已将 ${newContentIndices.length} 条内容移动到 "${targetFieldName}" 字段`);
            }
            
          } catch (fieldError) {
            MNUtil.log(`⚠️ 处理字段 "${htmlComment.text}" 时出错: ${fieldError.message}`);
            // 继续处理下一个字段
          }
        });
        
        // 处理摘录区：源卡片中未被处理的内容就是摘录区
        const allSourceIndices = Array.from({length: sourceNote.comments.length}, (_, i) => i);
        const excerptIndices = allSourceIndices.filter(i => !processedIndices.has(i));
        
        if (excerptIndices.length > 0) {
          MNUtil.log(`📝 处理摘录区: ${excerptIndices.length} 条内容`);
          
          // 在处理摘录区内容之前，同样维护链接关系
          excerptIndices.forEach(index => {
            const comment = sourceNote.MNComments[index];
            if (comment && comment.type === "linkComment") {
              const linkedNote = MNNote.new(comment.text);
              if (linkedNote) {
                // 找到被链接卡片中所有指向源卡片B的链接
                const sourceLinkIndices = linkedNote.getLinkCommentsIndexArr(sourceNote.noteURL);
                if (sourceLinkIndices.length > 0) {
                  MNUtil.log(`🔗 摘录区：在卡片 ${linkedNote.noteId} 中找到 ${sourceLinkIndices.length} 个指向源卡片的链接，正在替换...`);
                  // 直接替换为指向目标卡片A的链接
                  sourceLinkIndices.forEach(linkIndex => {
                    linkedNote.replaceWithMarkdownComment(targetNote.noteURL, linkIndex);
                  });
                  linkedNote.refresh();
                }
              }
            }
          });
          
          // 记录合并前的评论数量
          const targetCommentsCountBefore = targetNote.comments.length;
          
          // 克隆源卡片处理摘录区
          const tempNote = sourceNote.clone();
          tempNote.noteTitle = "";
          
          // 删除子卡片（如果有的话）
          if (tempNote.childNotes && tempNote.childNotes.length > 0) {
            for (let i = tempNote.childNotes.length - 1; i >= 0; i--) {
              tempNote.childNotes[i].removeFromParent();
            }
          }
          
          // 删除已处理的内容，只保留摘录区
          const indicesToDelete = Array.from(processedIndices).sort((a, b) => b - a);
          indicesToDelete.forEach(index => {
            tempNote.removeCommentByIndex(index);
          });
          
          // 合并到目标卡片
          tempNote.mergeInto(targetNote);
          
          // 计算新增内容的索引并移动到摘录区
          const newContentIndices = [];
          const excerptContentCount = excerptIndices.length;
          for (let i = 0; i < excerptContentCount; i++) {
            newContentIndices.push(targetCommentsCountBefore + i);
          }
          
          this.moveCommentsArrToField(targetNote, newContentIndices, "摘录区", true);
          MNUtil.log(`✅ 已将摘录区内容移动到目标卡片的摘录区`);
        }
        
        // 所有内容处理完成后，删除源卡片
        try {
          // 使用 MNNote 的 delete 方法删除源卡片
          if (sourceNote.delete) {
            sourceNote.delete(false); // false 表示不删除子孙卡片
            MNUtil.log("✅ 已删除源卡片");
          } else {
            // 备用删除方法
            MNUtil.db.deleteBookNote(sourceNote.noteId);
            MNUtil.log("✅ 已删除源卡片（使用备用方法）");
          }
        } catch (deleteError) {
          MNUtil.log(`⚠️ 删除源卡片失败: ${deleteError.message}`);
          // 不影响合并结果，继续执行
        }
        
        // 刷新目标卡片显示
        targetNote.refresh();
      });
      
      MNUtil.showHUD("✅ 知识卡片合并完成");
      MNUtil.log("✅ 知识卡片合并完成");
      
    } catch (error) {
      MNUtil.showHUD("❌ 合并知识卡片时出错: " + error.message);
      MNUtil.log({
        level: "error",
        message: "合并知识卡片失败: " + error.message,
        source: "knowledgeBaseTemplate.renewKnowledgeNotes"
      });
    }
  }
  
  /**
   * 标准化字段名，去除多余的冒号和空格
   * 
   * @param {string} fieldText - 原始字段文本
   * @returns {string} 标准化后的字段名
   */
  static normalizeFieldName(fieldText) {
    // 去除开头和结尾的空格
    let normalized = fieldText.trim();
    
    // 处理多个连续的中文冒号
    normalized = normalized.replace(/：+/g, '：');
    
    // 如果以冒号结尾，去掉它
    if (normalized.endsWith('：') || normalized.endsWith(':')) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  }
  
  /**
   * 建立字段映射关系
   * 
   * @param {string} sourceType - 源卡片类型
   * @param {string} targetType - 目标卡片类型
   * @returns {Object} 字段映射表
   */
  static buildFieldMapping(sourceType, targetType) {
    const mapping = {};
    
    // 特殊处理：思想方法 -> 命题
    if (sourceType === '思想方法' && targetType === '命题') {
      mapping['原理'] = '证明';
    }
    
    // 后续可以添加更多特殊映射规则
    
    return mapping;
  }

  /**
   * 修改卡片颜色
   */
  static changeNoteColor(note) {
    note.colorIndex = this.types[this.getNoteType(note)].colorIndex;
  }

  /**
   * 克隆并合并
   */
  static cloneAndMergeById(note, id){
    let clonedNote = MNNote.clone(id)
    note.merge(clonedNote.note)
  }

  /**
   * 自动获取并返回当前卡片的待移动内容的 indexArr
   * 
   * 
   * @param {MNNote} note - 当前卡片
   */
  static autoGetNewContentToMoveIndexArr(note) {
    let moveIndexArr = []
    let lastHtmlCommentText = this.parseNoteComments(note).htmlCommentsTextArr.slice(-1)[0] || "";
    
    if (lastHtmlCommentText) {
      // 如果有HTML评论，移动HTML评论中的非链接内容
      moveIndexArr = this.getHtmlBlockNonLinkContentIndexArr(note, lastHtmlCommentText);
    } else {
      // 如果没有HTML评论，跳过开头连续的合并图片评论，从第一个非合并图片评论开始移动
      let firstNonMergedImageIndex = -1;
      
      // 从所有评论的开头开始查找第一个非合并图片评论
      for (let i = 0; i < note.MNComments.length; i++) {
        let comment = note.MNComments[i];
        // 检查是否为合并的图片评论类型（包括带绘制和不带绘制的）
        if (comment.type !== "mergedImageComment" && comment.type !== "mergedImageCommentWithDrawing") {
          firstNonMergedImageIndex = i;
          break;
        }
      }
      
      if (firstNonMergedImageIndex !== -1) {
        // 从第一个非合并图片评论到所有评论的结尾作为新内容
        moveIndexArr = Array.from({length: note.MNComments.length - firstNonMergedImageIndex}, (_, i) => i + firstNonMergedImageIndex);
      } else {
        // 如果所有评论都是合并图片评论，则新内容为空
        moveIndexArr = [];
      }
    }

    return moveIndexArr;
  }


  /**
   * 增加思路卡片
   * 
   * @param {MNNote} note - 当前卡片
   * @param {string} title - 思路卡片的标题
   */
  static addNewIdeaNote(note, title) {
    // 生成卡片
    let ideaNote = MNNote.clone(this.types.思路.templateNoteId);
    
    // 处理标题
    let prefixContent = this.createChildNoteTitlePrefixContent(note);
    
    // 如果父卡片也是思路卡片，使用 💡 和父卡片内容
    if (this.getNoteType(note) === "思路") {
      // 获取父卡片的 content 部分
      let parentTitleParts = this.parseNoteTitle(note);
      
      // 在前缀内容后加入 💡 和父卡片内容
      prefixContent = prefixContent + "｜💡 " + parentTitleParts.content;
    }
    
    ideaNote.title = this.createTitlePrefix(this.types.思路.prefixName, prefixContent) + title;
    
    // 设置完标题后再添加为子卡片
    note.addChild(ideaNote);
    
    // 处理链接和评论 - 评论内容保持原样，不做特殊处理
    note.appendMarkdownComment(HtmlMarkdownUtils.createHtmlMarkdownText(title, "idea"));  // 加入思路 htmlMD
    note.appendNoteLink(ideaNote, "Both");  // 双向链接
    this.moveCommentsArrToField(note, "Y, Z", this.getIdeaLinkMoveToField(note));  // 移动 note 的两个评论

    // 延迟聚焦，确保所有操作完成后再定位
    MNUtil.delay(0.5).then(() => {
      if (MNUtil.mindmapView) {
        ideaNote.focusInMindMap(0.3)
      }
    })
  }

  /**
   * 增加总结卡片
   * 
   * @param {MNNote} note - 当前卡片
   * @param {string} title - 总结卡片的标题
   */
  static addNewSummaryNote(note, title) {
    // 生成卡片
    let summaryNote = MNNote.clone(this.types.总结.templateNoteId);
    
    // 处理标题
    let prefixContent = this.createChildNoteTitlePrefixContent(note);
    summaryNote.title = this.createTitlePrefix(this.types.总结.prefixName, prefixContent) + title;
    
    // 设置完标题后再添加为子卡片
    note.addChild(summaryNote);
    
    // 处理链接和评论
    note.appendMarkdownComment(HtmlMarkdownUtils.createHtmlMarkdownText(title, "remark"));  // 使用 remark 样式
    note.appendNoteLink(summaryNote, "Both");  // 双向链接
    
    // 根据父卡片类型决定移动到哪个字段
    let targetField = this.getNoteType(note) === "总结" ? "要点列举" : "相关思考";
    this.moveCommentsArrToField(note, "Y, Z", targetField);  // 移动到对应字段
    
    // 在总结卡片中，将父卡片的链接移动到"相关链接"字段
    // 双向链接会在总结卡片的最后位置创建父卡片的链接
    this.moveCommentsArrToField(summaryNote, "Z", "相关链接");
    
    // 延迟聚焦，确保所有操作完成后再定位
    MNUtil.delay(0.5).then(() => {
      if (MNUtil.mindmapView) {
        summaryNote.focusInMindMap(0.3)
      }
    })
  }

  /**
   * 增加定义卡片
   * 
   * @param {MNNote} note - 当前卡片（命题或例子卡片）
   * @param {string} title - 定义卡片的标题
   */
  static addNewDefinitionNote(note, title) {
    // 检查父卡片类型
    const supportedParentTypes = ["命题", "例子"];
    const parentType = this.getNoteType(note);
    
    if (!supportedParentTypes.includes(parentType)) {
      MNUtil.showHUD("只能在命题或例子卡片上生成定义卡片");
      return;
    }
    
    // 生成定义卡片
    let definitionNote = MNNote.clone(this.types.定义.templateNoteId);
    
    // 处理标题
    let prefixContent = this.createChildNoteTitlePrefixContent(note);
    definitionNote.title = this.createTitlePrefix(this.types.定义.prefixName, prefixContent) + "; " + title;
    
    // 设置完标题后再添加为子卡片
    note.addChild(definitionNote);
    
    // 处理链接（不需要添加 markdown 评论）
    note.appendNoteLink(definitionNote, "Both");  // 双向链接
    
    // 在父卡片（命题/例子）中，移动定义卡片的链接到"相关链接"字段
    this.moveCommentsArrToField(note, "Z", "相关链接");  // 只移动最后一个评论（链接）
    
    // 定义卡片的相关链接本身就在最后，无需移动
    
    // 延迟聚焦，确保所有操作完成后再定位
    MNUtil.delay(0.5).then(() => {
      if (MNUtil.mindmapView) {
        definitionNote.focusInMindMap(0.3)
      }
    })
  }

  /**
   * 根据卡片类型确定思路链接内容要移动到哪个字段下
   */
  static getIdeaLinkMoveToField(note) {
    switch (this.getNoteType(note)) {
      case "命题":
      case "例子":
        return "证明"
      case "反例":
        return "反例"
      case "思想方法":
        return "原理"
      case "问题":
        return "研究思路"
      case "思路":
        return "具体尝试"
      default:
        break;
    }
  }

  /**
   * 生成标题前缀
   */
  static createTitlePrefix(prefixName, content) {
    return `【${prefixName} >> ${content}】`;
  }

  /**
   * 获取卡片类型
   * 
   * 目前是靠卡片标题来判断
   * @param {MNNote} note - 要判断类型的卡片
   * @param {boolean} useColorFallback - 是否在无法从标题/归类卡片判断时使用颜色判断（粗读模式使用）
   * @returns {string|undefined} 卡片类型
   */
  static getNoteType(note, useColorFallback = false) {
    let noteType
    let title = note.title || "";
    /**
     * 如果是
     * “xxx”：“yyy”相关 zz
     * 或者是
     * “yyy”相关 zz
     * 则是归类卡片
     */
    if (/^“[^”]*”：“[^”]*”\s*相关[^“]*$/.test(title) || /^“[^”]+”\s*相关[^“]*$/.test(title)) {
      noteType = "归类"
    } else {
      /**
       * 如果是
       * 【xx：yy】zz
       * 则根据 xx 作为 prefixName 在 types 搜索类型
       */
      let match = title.match(/^【(.{2,4})\s*(?:>>|：)\s*.*】(.*)/)
      let matchResult
      if (match) {
        matchResult = match[1].trim();
      } else {
        match = title.match(/^【(.*)】(.*)/)
        if (match) {
          matchResult = match[1].trim();
        } else {
          // 从标题判断不了的话，就从卡片的归类卡片来判断
          let classificationNote = this.getFirstClassificationParentNote(note);
          if (classificationNote) {
            let classificationNoteTitleParts = this.parseNoteTitle(classificationNote);
            matchResult = classificationNoteTitleParts.type;
          }
        }
      }
      for (let typeKey in this.types) {
        let type = this.types[typeKey];
        if (type.prefixName === matchResult) {
          noteType = String(typeKey);
          break;
        }
      }
    }

    // 粗读模式：如果无法从标题或归类卡片判断，尝试根据颜色判断
    if (useColorFallback && note.colorIndex !== undefined) {
      noteType = this.getNoteTypeByColor(note.colorIndex);
    }

    return noteType || undefined;
  }

  /**
   * 判断卡片自身是否为知识点卡片（不向上查找）
   * 只基于卡片自身的标题格式判断，不会查找父卡片
   * 
   * @param {MNNote} note - 要判断的卡片
   * @returns {boolean} 如果卡片标题本身就是知识点格式返回 true，否则返回 false
   */
  static isKnowledgeNote(note) {
    const title = note.noteTitle || note.title || "";
    // 检查是否有知识点卡片的标题格式：【类型：xxx】或【类型 >> xxx】
    const match = title.match(/^【(.{1,4})\s*(?:>>|：)\s*.*】/);
    if (!match) return false;
    
    const type = match[1].trim();
    // 检查类型是否在知识点类型列表中
    for (let typeKey in this.types) {
      if (this.types[typeKey].prefixName === type && 
          this.knowledgeNoteTypes.includes(typeKey)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断卡片自身是否为归类卡片（不向上查找）
   * 只基于卡片自身的标题格式判断，不会查找父卡片
   * 
   * @param {MNNote} note - 要判断的卡片
   * @returns {boolean} 如果卡片标题本身就是归类格式返回 true，否则返回 false
   */
  static isClassificationNote(note) {
    const title = note.noteTitle || note.title || "";
    // 检查是否有归类卡片的标题格式："xxx"相关 或 "xxx"："xxx"相关
    return /^“[^“]*”：“[^“]*”\s*相关.*$/.test(title) || 
           /^“[^“]+”\s*相关.*$/.test(title);
  }

  /**
   * 基于卡片标题生成子卡片前缀内容
   */
  static createChildNoteTitlePrefixContent(note) {
    let titleParts = this.parseNoteTitle(note);
    let noteType = this.getNoteType(note);
    
    switch (noteType) {
      case '归类':
        return titleParts.content;
      case '问题':
        // 问题卡片的子思路前面加上 ❓ 强调这是针对问题的思路
        return titleParts.prefixContent + "｜❓" + titleParts.content;
      case '思路':
        // 思路卡片的子思路只返回 prefixContent，具体处理在 addNewIdeaNote 中
        return titleParts.prefixContent;
      default:
        return titleParts.prefixContent + "｜" + titleParts.content;
    }
  }

  /**
   * 解析卡片标题，拆成几个部分，返回一个对象
   */
  static parseNoteTitle(note) {
    let title = note.title || "";
    let titleParts = {}
    let match
    switch (this.getNoteType(note)) {
      case "归类":
        match = title.match(/^“[^”]+”：“([^”]+)”\s*相关\s*(.*)$/);
        if (match) {
          titleParts.content = match[1].trim();
          titleParts.type = match[2].trim();
        } else {
          match = title.match(/^“([^”]+)”\s*相关\s*(.*)$/);
          if (match) {
            titleParts.content = match[1].trim();
            titleParts.type = match[2].trim();
          }
        }
        break;
      default:
        match = title.match(/^【(.{2,4})\s*(?:>>|：)\s*(.*)】(.*)/)
        if (match) {
          titleParts.type = match[1].trim();
          titleParts.prefixContent = match[2].trim();
          titleParts.content = match[3].trim();
          // 如果 content 以 `; ` 开头，则去掉?
          // 暂时不去掉，因为制卡会把标题链接的第一个词前面的分号去掉
          // if (titleParts.content.startsWith("; ")) {
          //   titleParts.content = titleParts.content.slice(2).trim();
          // }
          titleParts.titleLinkWordsArr = titleParts.content.split(/; /).map(word => word.trim()).filter(word => word.length > 0);
        } else {
          match = title.match(/^【(.*)】(.*)/)
          if (match) {
            titleParts.type = match[1].trim();
            titleParts.prefixContent = ""
            titleParts.content = match[2].trim();
            // 如果 content 以 `; ` 开头，则去掉
            if (titleParts.content.startsWith("; ")) {
              titleParts.content = titleParts.content.slice(2).trim();
            }
            titleParts.titleLinkWordsArr = titleParts.content.split(/; /).map(word => word.trim()).filter(word => word.length > 0);
          } else {
            titleParts.content = title.trim();
            // 即使没有前缀也要解析链接词
            titleParts.titleLinkWordsArr = titleParts.content.split(/; /).map(word => word.trim()).filter(word => word.length > 0);
          }
        }
        break;
    }

    return titleParts
  }

  /**
   * 解析卡片评论
   * 
   * 返回一个对象数组 commentsObj，包含：
   * htmlComment(作为评论字段分隔) 的详细信息 : htmlCommentsObjArr
   * htmlComment(作为评论字段分隔) 的文本信息 : htmlCommentsTextArr
   * 
   */
  static parseNoteComments(note) {
    let commentsObj = {
      htmlCommentsObjArr: [],
      htmlCommentsTextArr: [],
      htmlMarkdownCommentsObjArr: [],
      htmlMarkdownCommentsTextArr: [],
      linksObjArr: [],
      linksURLArr: [],
    }
    let comments = note.MNComments

    /**
     * 处理 htmlCommentsObjArr
     */
    // let includingFieldBlockIndexArr = []
    // let excludingFieldBlockIndexArr = []
    comments.forEach((comment, index) => {
      if (comment && comment.type == "HtmlComment") {
        commentsObj.htmlCommentsObjArr.push(
          {
            index: index, // HtmlComment 所在卡片的评论中的 index
            text: comment.text, // HtmlComment 的内容
            includingFieldBlockIndexArr: [], // 包含这个字段本身的下方 Block 的 Index 数组
            excludingFieldBlockIndexArr: [], // 不包含这个字段本身的下方 Block 的 Index 数组
          }
        );
      }
    })

    // 因为上面的循环还在遍历所有的 HtmlComments，所以不能获取到下一个，所以要等到先遍历完再处理 Block 
    switch (commentsObj.htmlCommentsObjArr.length) {
      case 0:
        break;
      case 1:
        commentsObj.htmlCommentsObjArr[0].includingFieldBlockIndexArr = comments.map((comment, index) => index).filter(index => index >= commentsObj.htmlCommentsObjArr[0].index);
        commentsObj.htmlCommentsObjArr[0].excludingFieldBlockIndexArr = comments.map((comment, index) => index).filter(index => index > commentsObj.htmlCommentsObjArr[0].index);
        break;
      default:
        for (let i = 0; i < commentsObj.htmlCommentsObjArr.length; i++) {
          let currentHtmlComment = commentsObj.htmlCommentsObjArr[i];
          if (i === commentsObj.htmlCommentsObjArr.length - 1) {
            currentHtmlComment.includingFieldBlockIndexArr = comments.map((comment, index) => index).filter(index => index >= currentHtmlComment.index);
            currentHtmlComment.excludingFieldBlockIndexArr = comments.map((comment, index) => index).filter(index => index > currentHtmlComment.index);
          } else {
            let nextHtmlComment = commentsObj.htmlCommentsObjArr[i + 1];
            currentHtmlComment.includingFieldBlockIndexArr = comments.map((comment, index) => index).filter(index => index < nextHtmlComment.index && index >= currentHtmlComment.index);
            currentHtmlComment.excludingFieldBlockIndexArr = comments.map((comment, index) => index).filter(index => index < nextHtmlComment.index && index > currentHtmlComment.index);
          
          }
        }
        break
    }

    /**
     * 处理 htmlCommentsTextArr
     */
    if (commentsObj.htmlCommentsObjArr.length > 0) {
      // commentsObj.htmlCommentsTextArr
      commentsObj.htmlCommentsObjArr.forEach(htmlComment => {
        commentsObj.htmlCommentsTextArr.push(htmlComment.text)
      })
    }

    /**
     * 处理 htmlMarkdownCommentsObjArr
     */
    comments.forEach((comment, index) => {
      if (!comment) return; // 跳过 undefined 或 null 的评论
      let text = comment.text || ""
      let isHtmlMD = false
      let hasLeadingDash = false
      let cleanText = text
      
      // 检查是否有前导 "- "
      if (text.startsWith("- ")) {
        hasLeadingDash = true
        cleanText = text.substring(2) // 去掉 "- "
      }
      
      // 检查是否是 HtmlMarkdown 评论
      if (HtmlMarkdownUtils.isHtmlMDComment(cleanText)) {
        isHtmlMD = true
      }
      
      if (isHtmlMD) {
        let type = HtmlMarkdownUtils.getSpanType(cleanText)
        let content = HtmlMarkdownUtils.getSpanTextContent(cleanText)
        
        commentsObj.htmlMarkdownCommentsObjArr.push({
          index: index, // HtmlMarkdown 评论所在卡片的评论中的 index
          text: text, // 原始评论文本（包含可能的 "- " 前缀）
          cleanText: cleanText, // 去掉 "- " 前缀的文本
          type: type, // 评论的类型（如 'goal', 'level1' 等）
          content: content, // 评论的纯文本内容（去掉 HTML 标签和图标）
          hasLeadingDash: hasLeadingDash // 是否有前导 "- "
        })
      }
    })

    /**
     * 处理 htmlMarkdownCommentsTextArr
     */
    if (commentsObj.htmlMarkdownCommentsObjArr.length > 0) {
      commentsObj.htmlMarkdownCommentsObjArr.forEach(htmlMDComment => {
        // 创建用于显示的文本，格式：[类型] 内容
        let displayText = `[${htmlMDComment.type}] ${htmlMDComment.content}`
        if (htmlMDComment.hasLeadingDash) {
          displayText = "- " + displayText
        }
        commentsObj.htmlMarkdownCommentsTextArr.push(displayText)
      })
    }


    /**
     * 所有的链接（不包含概要）
     */

    comments.forEach((comment, index) => {
      if (comment && comment.type === "linkComment") {
        commentsObj.linksObjArr.push({
          index: index, // linkComment 所在卡片的评论中的 index
          link: comment.text, // 具体的 link
        })
      }
    })

    commentsObj.linksObjArr.forEach(linkObj => {
      commentsObj.linksURLArr.push(linkObj.link)
    })

    return commentsObj
  }

  /**
   * 通过弹窗来精准修改单个 HtmlMarkdown 评论的类型
   */
  static changeHtmlMarkdownCommentTypeByPopup(note) {
    let htmlMarkdownCommentsTextArr = this.parseNoteComments(note).htmlMarkdownCommentsTextArr;
    let htmlMarkdownCommentsObjArr = this.parseNoteComments(note).htmlMarkdownCommentsObjArr;
    
    if (htmlMarkdownCommentsTextArr.length === 0) {
      MNUtil.showHUD("当前笔记没有 HtmlMarkdown 评论");
      return;
    }

    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择要修改类型的 HtmlMarkdown 评论",
      "请选择要修改的评论",
      0,
      "取消",
      htmlMarkdownCommentsTextArr,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          return; // 取消
        }
        
        let selectedCommentObj = htmlMarkdownCommentsObjArr[buttonIndex - 1];
        let currentType = selectedCommentObj.type;
        
        // 获取所有可用的类型选项
        let availableTypes = Object.keys(HtmlMarkdownUtils.icons);
        let typeDisplayTexts = availableTypes.map(type => `${HtmlMarkdownUtils.icons[type]} ${type}`);
        
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "选择目标类型",
          `当前类型：${HtmlMarkdownUtils.icons[currentType]} ${currentType}\n\n请选择要转换成的类型：`,
          0,
          "取消",
          typeDisplayTexts,
          (alert, typeButtonIndex) => {
            if (typeButtonIndex === 0) {
              return; // 取消
            }
            
            let targetType = availableTypes[typeButtonIndex - 1];
            
            if (targetType === currentType) {
              MNUtil.showHUD("目标类型与当前类型相同，无需修改");
              return;
            }
            
            MNUtil.undoGrouping(() => {
              try {
                let comments = note.MNComments;
                let targetComment = comments[selectedCommentObj.index];
                let content = selectedCommentObj.content;
                let hasLeadingDash = selectedCommentObj.hasLeadingDash;
                
                // 生成新的 HtmlMarkdown 文本
                let newHtmlMarkdownText = HtmlMarkdownUtils.createHtmlMarkdownText(content, targetType);
                
                // 如果原来有前导破折号，保持前导破折号
                if (hasLeadingDash) {
                  newHtmlMarkdownText = "- " + newHtmlMarkdownText;
                }
                
                // 更新评论文本
                targetComment.text = newHtmlMarkdownText;
                
                // MNUtil.showHUD(`已将类型从 ${currentType} 改为 ${targetType}`);
                
              } catch (error) {
                MNUtil.showHUD("修改失败：" + error.toString());
              }
            });
          }
        );
      }
    );
  }

  /**
   * 通过弹窗选择并仅保留某个字段下的内容
   * 删除其他所有内容（包括字段本身）
   * 
   * @param {MNNote} note - 要操作的笔记对象
   * 
   * @example
   * // 弹窗让用户选择要保留的字段内容
   * knowledgeBaseTemplate.retainFieldContentOnly(note);
   */
  static retainFieldContentOnly(note, keepTitle = false) {
    let commentsObj = this.parseNoteComments(note);
    let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    let htmlCommentsTextArr = commentsObj.htmlCommentsTextArr;
    
    if (htmlCommentsTextArr.length === 0) {
      MNUtil.showHUD("当前卡片没有字段结构");
      return;
    }
    
    // 创建字段选择菜单
    let fieldOptions = htmlCommentsTextArr.map(text => text.trim());
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择要保留内容的字段",
      "仅保留该字段下的内容，删除其他所有内容（包括字段本身）",
      0,  // 普通样式
      "取消",
      fieldOptions,
      (_, buttonIndex) => {
        if (buttonIndex === 0) return; // 用户取消
        
        let selectedFieldIndex = buttonIndex - 1; // buttonIndex从1开始
        let selectedFieldObj = htmlCommentsObjArr[selectedFieldIndex];
        let selectedField = fieldOptions[selectedFieldIndex];
        
        // 获取要保留的内容索引（不包括字段本身）
        let retainIndices = selectedFieldObj.excludingFieldBlockIndexArr;
        
        if (retainIndices.length === 0) {
          MNUtil.showHUD(`字段"${selectedField}"下没有内容`);
          return;
        }
        
        // 确认对话框
        let confirmMessage = `确定只保留"${selectedField}"字段下的 ${retainIndices.length} 条内容吗？\n\n⚠️ 此操作将删除其他所有内容（包括字段标题）`;
        
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "确认操作",
          confirmMessage,
          0,  // 普通样式
          "取消",
          ["确定删除"],
          (_, confirmButtonIndex) => {
            if (confirmButtonIndex === 0) return; // 用户取消
            
            MNUtil.undoGrouping(() => {
              try {
                // 获取所有评论的索引
                let allIndices = Array.from({length: note.comments.length}, (_, i) => i);
                
                // 计算要删除的索引（所有索引减去要保留的索引）
                let deleteIndices = allIndices.filter(index => !retainIndices.includes(index));
                
                // 从后向前删除（避免索引变化问题）
                deleteIndices.sort((a, b) => b - a);
                
                let deletedCount = 0;
                deleteIndices.forEach(index => {
                  note.removeCommentByIndex(index);
                  deletedCount++;
                });
                
                // 刷新卡片显示
                MNUtil.undoGrouping(()=>{
                  note.refresh();
                })

                if (!keepTitle) {
                  note.title = ""
                }
                
                MNUtil.showHUD(`已删除 ${deletedCount} 条内容，保留了"${selectedField}"字段下的 ${retainIndices.length} 条内容`);
                
                MNUtil.log({
                  level: "info",
                  message: `保留字段内容操作完成 - 字段：${selectedField}，保留：${retainIndices.length} 条，删除：${deletedCount} 条`,
                  source: "knowledgeBaseTemplate.retainFieldContentOnly"
                });
                
              } catch (error) {
                MNUtil.showHUD("操作失败：" + error.toString());
                MNUtil.log({
                  level: "error",
                  message: "保留字段内容失败：" + error.message,
                  source: "knowledgeBaseTemplate.retainFieldContentOnly"
                });
              }
            });
          }
        );
      }
    );
  }

  /**
   * 仅保留指定字段下的内容（不通过弹窗）
   * 删除其他所有内容（包括字段本身）
   * 
   * @param {MNNote} note - 要操作的笔记对象
   * @param {string} fieldName - 要保留内容的字段名称
   * @returns {boolean} 操作是否成功
   * 
   * @example
   * // 仅保留"证明"字段下的内容
   * let success = knowledgeBaseTemplate.retainFieldContentByName(note, "证明");
   * 
   * @example
   * // 仅保留"相关链接"字段下的内容
   * knowledgeBaseTemplate.retainFieldContentByName(note, "相关链接");
   */
  static retainFieldContentByName(note, fieldName) {
    let commentsObj = this.parseNoteComments(note);
    let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    
    // 查找指定名称的字段
    let targetFieldObj = null;
    for (let fieldObj of htmlCommentsObjArr) {
      if (fieldObj.text.includes(fieldName)) {
        targetFieldObj = fieldObj;
        break;
      }
    }
    
    if (!targetFieldObj) {
      MNUtil.showHUD(`未找到字段"${fieldName}"`);
      return false;
    }
    
    // 获取要保留的内容索引（不包括字段本身）
    let retainIndices = targetFieldObj.excludingFieldBlockIndexArr;
    
    if (retainIndices.length === 0) {
      MNUtil.showHUD(`字段"${fieldName}"下没有内容`);
      return false;
    }
    
    MNUtil.undoGrouping(() => {
      try {
        // 获取所有评论的索引
        let allIndices = Array.from({length: note.comments.length}, (_, i) => i);
        
        // 计算要删除的索引（所有索引减去要保留的索引）
        let deleteIndices = allIndices.filter(index => !retainIndices.includes(index));
        
        // 从后向前删除（避免索引变化问题）
        deleteIndices.sort((a, b) => b - a);
        
        let deletedCount = 0;
        deleteIndices.forEach(index => {
          note.removeCommentByIndex(index);
          deletedCount++;
        });
        
        // 刷新卡片显示
        note.refresh();
        
        MNUtil.showHUD(`已删除 ${deletedCount} 条内容，保留了"${fieldName}"字段下的 ${retainIndices.length} 条内容`);
        
        MNUtil.log({
          level: "info",
          message: `保留字段内容操作完成 - 字段：${fieldName}，保留：${retainIndices.length} 条，删除：${deletedCount} 条`,
          source: "knowledgeBaseTemplate.retainFieldContentByName"
        });
        
      } catch (error) {
        MNUtil.showHUD("操作失败：" + error.toString());
        MNUtil.log({
          level: "error",
          message: "保留字段内容失败：" + error.message,
          source: "knowledgeBaseTemplate.retainFieldContentByName"
        });
        return false;
      }
    });
    
    return true;
  }

  /**
   * 更新双向链接
   * 将当前卡片中的某个链接替换为剪贴板中的新链接，并自动处理双向链接
   * 
   * @param {MNNote} note - 当前卡片
   */
  static async updateBidirectionalLink(note) {
    try {
      // 步骤1: 获取剪贴板中的新链接
      let clipboardText = MNUtil.clipboardText.trim();
      let newLinkUrl = null;
      
      // 使用现有 API 判断和转换
      if (clipboardText.isNoteIdorURL()) {
        newLinkUrl = clipboardText.toNoteURL();
      } else {
        MNUtil.showHUD("请先复制要替换的卡片链接或ID");
        return;
      }
      
      // 步骤2: 解析当前笔记的所有字段和链接
      const commentsObj = this.parseNoteComments(note);
      const htmlFields = commentsObj.htmlCommentsObjArr;
      const allLinks = commentsObj.linksObjArr;
      
      // 检查是否有链接
      if (allLinks.length === 0) {
        MNUtil.showHUD("当前笔记没有链接");
        return;
      }
      
      let links = [];
      
      // 步骤3: 根据是否有字段决定处理方式
      if (htmlFields.length > 0) {
        // 有字段时，让用户选择处理方式
        const options = ["查看所有链接", ...htmlFields.map(field => field.text)];
        const selectedIndex = await MNUtil.userSelect(
          "选择查看方式", 
          "选择要查找链接的字段，或查看所有链接", 
          options
        );
        
        if (selectedIndex === 0) return; // 用户取消
        
        if (selectedIndex === 1) {
          // 查看所有链接
          links = allLinks.map(linkObj => ({
            index: linkObj.index,
            url: linkObj.link,
            noteId: linkObj.link.toNoteId(),
            type: note.MNComments[linkObj.index].type
          }));
        } else {
          // 选择了特定字段
          const selectedField = htmlFields[selectedIndex - 2];
          links = this.getLinksInField(note, selectedField);
          
          if (links.length === 0) {
            MNUtil.showHUD(`字段"${selectedField.text}"下没有找到链接`);
            return;
          }
        }
      } else {
        // 没有字段时，直接使用所有链接
        links = allLinks.map(linkObj => ({
          index: linkObj.index,
          url: linkObj.link,
          noteId: linkObj.link.toNoteId(),
          type: note.MNComments[linkObj.index].type
        }));
      }
      
      // 步骤4: 获取链接对应的笔记标题（使用优化的显示格式）
      const linkDisplayNames = await this.formatLinksForDisplay(links);
      
      // 步骤5: 让用户选择要替换的链接
      const selectedLinkIndex = await MNUtil.userSelect(
        "选择要替换的链接",
        `将替换为剪贴板中的链接`,
        linkDisplayNames
      );
      
      if (selectedLinkIndex === 0) return; // 用户取消
      
      const selectedLink = links[selectedLinkIndex - 1];
      
      // 步骤6: 执行替换操作
      await this.performLinkReplacement(note, selectedLink, newLinkUrl);
      
    } catch (error) {
      MNUtil.showHUD("操作失败：" + error.message);
      MNUtil.addErrorLog(error, "updateBidirectionalLink", { noteId: note.noteId });
    }
  }

  /**
   * 获取字段中的链接
   * 
   * @param {MNNote} note - 笔记对象
   * @param {Object} field - 字段对象
   * @returns {Array} 链接数组
   */
  static getLinksInField(note, field) {
    const fieldCommentIndices = field.excludingFieldBlockIndexArr;
    const links = [];
    
    for (const index of fieldCommentIndices) {
      const comment = note.MNComments[index];
      if (comment && comment.text) {
        const commentText = comment.text.trim();
        
        // 使用现有 API 判断是否为有效的笔记链接
        if (commentText.isValidNoteURL()) {
          // 检查是否为纯链接（不在 Markdown 格式中）
          if (!commentText.includes("](") && !commentText.includes("[")) {
            links.push({
              index: index,
              url: commentText,
              noteId: commentText.toNoteId(),
              type: comment.type
            });
          }
        }
      }
    }
    
    return links;
  }

  /**
   * 格式化链接显示（复用 removeBidirectionalLinks 的逻辑）
   * 
   * @param {Array} links - 链接数组
   * @returns {Array<string>} 格式化的显示名称数组
   */
  static async formatLinksForDisplay(links) {
    const linkDisplayNames = [];
    for (const link of links) {
      try {
        const targetNote = MNUtil.getNoteById(link.noteId);
        if (targetNote) {
          const targetMNNote = MNNote.new(targetNote);
          const titleParts = this.parseNoteTitle(targetMNNote);
          
          // 获取内容部分，并去掉可能的 "; " 前缀
          let content = titleParts.content || targetNote.noteTitle || "[无标题]";
          if (content.startsWith("; ")) {
            content = content.substring(2).trim();
          }
          
          // 格式化显示：[类型] 内容
          const type = titleParts.type || "";
          const displayTitle = type ? `[${type}] ${content}` : content;
          
          linkDisplayNames.push(displayTitle);
        } else {
          linkDisplayNames.push(`[笔记不存在: ${link.noteId.substring(0, 8)}...]`);
        }
      } catch (error) {
        linkDisplayNames.push(`[获取失败: ${link.noteId.substring(0, 8)}...]`);
      }
    }
    return linkDisplayNames;
  }

  /**
   * 执行链接替换
   * 
   * @param {MNNote} note - 当前笔记
   * @param {Object} oldLink - 要替换的旧链接
   * @param {string} newLinkUrl - 新链接URL
   */
  static async performLinkReplacement(note, oldLink, newLinkUrl) {
    const oldNoteId = oldLink.noteId;
    const newNoteId = newLinkUrl.toNoteId();
    
    MNUtil.undoGrouping(() => {
      // 1. 替换当前笔记中的链接
      const comment = note.MNComments[oldLink.index];
      if (comment) {
        comment.text = newLinkUrl;
      }
      
      // 2. 处理旧链接的反向链接
      try {
        const oldTargetNote = MNUtil.getNoteById(oldNoteId);
        if (oldTargetNote) {
          this.removeApplicationFieldLink(oldTargetNote, note.noteId);
        }
      } catch (error) {
        MNUtil.log("处理旧链接反向链接时出错: " + error);
      }
      
      // 3. 处理新链接的反向链接
      try {
        const newTargetNote = MNUtil.getNoteById(newNoteId);
        if (newTargetNote) {
          this.addApplicationFieldLink(newTargetNote, note);
        }
      } catch (error) {
        MNUtil.log("处理新链接反向链接时出错: " + error);
      }
      
      MNUtil.showHUD("链接替换成功");
    });
  }

  /**
   * 从应用字段删除指定链接
   * 
   * @param {Object} targetNote - 目标笔记
   * @param {string} sourceNoteId - 源笔记ID
   */
  static removeApplicationFieldLink(targetNote, sourceNoteId) {
    const targetMNNote = MNNote.new(targetNote);
    const commentsObj = this.parseNoteComments(targetMNNote);
    const sourceNoteUrl = sourceNoteId.toNoteURL();
    
    // 查找"应用"或"应用:"字段
    const applicationField = commentsObj.htmlCommentsObjArr.find(field => {
      const fieldText = field.text.trim();
      return fieldText === "应用" || fieldText === "应用:" || fieldText === "应用：";
    });
    
    if (applicationField) {
      // 有"应用"字段：在字段中查找并删除链接
      const fieldIndices = applicationField.excludingFieldBlockIndexArr;
      
      // 从后往前删除，避免索引变化问题
      for (let i = fieldIndices.length - 1; i >= 0; i--) {
        const index = fieldIndices[i];
        const comment = targetMNNote.MNComments[index];
        if (comment && comment.text) {
          const commentText = comment.text.trim();
          if (commentText === sourceNoteUrl) {
            targetMNNote.removeCommentByIndex(index);
            return; // 找到并删除后直接返回
          }
        }
      }
    }
    
    // 没有"应用"字段或在字段中没找到：遍历所有评论查找链接
    const allComments = targetMNNote.MNComments;
    
    for (let i = allComments.length - 1; i >= 0; i--) {
      const comment = allComments[i];
      
      // 跳过 HTML 字段
      if (comment && comment.type === "HtmlComment") {
        continue;
      }
      
      // 只处理链接类型的评论
      if (comment && comment.type === "linkComment" && comment.text) {
        const commentText = comment.text.trim();
        
        // 使用 includes 进行更灵活的匹配（支持部分 URL 匹配）
        if (commentText.isValidNoteURL() && 
            (commentText === sourceNoteUrl || commentText.includes(sourceNoteUrl.toNoteId()))) {
          targetMNNote.removeCommentByIndex(i);
          return; // 找到并删除后返回
        }
      }
    }
  }

  /**
   * 向应用字段添加链接（带去重）
   * 
   * @param {Object} targetNote - 目标笔记
   * @param {MNNote} sourceNote - 源笔记
   */
  static addApplicationFieldLink(targetNote, sourceNote) {
    const targetMNNote = MNNote.new(targetNote);
    const commentsObj = this.parseNoteComments(targetMNNote);
    const sourceNoteUrl = sourceNote.noteId.toNoteURL();
    
    // 查找"应用"字段
    const applicationField = commentsObj.htmlCommentsObjArr.find(field => {
      const fieldText = field.text.trim();
      return fieldText === "应用" || fieldText === "应用:" || fieldText === "应用：";
    });
    
    if (applicationField) {
      // 有"应用"字段：检查是否已存在
      const fieldIndices = applicationField.excludingFieldBlockIndexArr;
      
      for (const index of fieldIndices) {
        const comment = targetMNNote.MNComments[index];
        if (comment && comment.text && comment.text.trim() === sourceNoteUrl) {
          // 已存在，不需要添加
          return;
        }
      }
      
      // 添加链接到字段
      targetMNNote.appendNoteLink(sourceNote, "To");
      
      // 调用去重功能
      this.removeDuplicateLinksInLastField(targetMNNote);
    } else {
      // 没有"应用"字段：先检查是否已存在该链接
      const allComments = targetMNNote.MNComments;
      
      for (const comment of allComments) {
        // 跳过 HTML 字段
        if (comment && comment.type === "HtmlComment") {
          continue;
        }
        
        // 检查是否已存在该链接
        if (comment && comment.text) {
          const commentText = comment.text.trim();
          
          if (commentText.isValidNoteURL() && commentText === sourceNoteUrl) {
            // 链接已存在，不需要添加
            return;
          }
        }
      }
      
      // 链接不存在，直接添加到笔记末尾
      targetMNNote.appendNoteLink(sourceNote, "To");
    }
  }

  /**
   * 根据文本删除评论（优化版本，支持链接评论）
   * @param {MNNote} note - 要处理的笔记
   * @param {string|string[]} texts - 要删除的文本或文本数组
   */
  static removeCommentsByText(note, texts) {
    if (!note || !texts) {
      return;
    }
    
    // 处理参数，确保是数组
    const textsToRemove = Array.isArray(texts) ? texts : [texts];
    
    // 过滤掉非字符串元素
    const validTexts = textsToRemove.filter(text => typeof text === 'string');
    
    if (validTexts.length === 0) {
      return;
    }
    
    // 从后向前遍历，避免索引混乱
    for (let i = note.comments.length - 1; i >= 0; i--) {
      const comment = note.comments[i];
      
      // 检查是否需要删除
      if (comment && comment.text && validTexts.includes(comment.text)) {
        // 支持 TextNote、HtmlNote 和所有包含 text 属性的评论类型
        if (comment.type === "TextNote" || comment.type === "HtmlNote") {
          note.removeCommentByIndex(i);
        }
      }
    }
  }

  /**
   * 删除指向特定笔记的链接
   * @param {MNNote} note - 要处理的笔记
   * @param {string} targetNoteIdOrUrl - 目标笔记ID或URL
   */
  static removeLinkToNote(note, targetNoteIdOrUrl) {
    if (!note || !targetNoteIdOrUrl) {
      return;
    }
    
    // 提取纯粹的 noteId（如果传入的是完整 URL）
    let targetNoteId = targetNoteIdOrUrl;
    const noteIdMatch = targetNoteIdOrUrl.match(/marginnote[34]app:\/\/note\/([A-Z0-9-]+)/i);
    if (noteIdMatch) {
      targetNoteId = noteIdMatch[1];
    }
    
    // 使用 MNComments 获取包装后的评论
    const comments = note.MNComments;
    if (!comments || comments.length === 0) {
      return;
    }
    
    // 收集要删除的索引
    const indicesToRemove = [];
    
    comments.forEach((comment, index) => {
      if (comment && comment.type === "linkComment" && comment.text) {
        // 检查链接是否指向目标笔记
        if (comment.text.includes(targetNoteId)) {
          indicesToRemove.push(index);
        }
      }
    });
    
    // 从后向前删除
    indicesToRemove.sort((a, b) => b - a);
    indicesToRemove.forEach(index => {
      note.removeCommentByIndex(index);
    });
  }

  /**
   * 移除最后一个字段中的重复链接
   * （从原位置迁移到 knowledgeBaseTemplate 类）
   * 
   * @param {MNNote} note - 笔记对象
   */
  static removeDuplicateLinksInLastField(note) {
    let commentsObj = this.parseNoteComments(note);
    let htmlComments = commentsObj.htmlCommentsObjArr;
    
    if (htmlComments.length === 0) return;
    
    // 获取最后一个字段的评论索引范围
    let lastField = htmlComments[htmlComments.length - 1];
    let fieldIndexRange = lastField.excludingFieldBlockIndexArr;
    
    if (fieldIndexRange.length === 0) return;
    
    // 收集这个字段范围内的所有链接
    let linksInField = {};
    let duplicateIndices = [];
    
    fieldIndexRange.forEach(index => {
      let comment = note.MNComments[index];
      if (comment && comment.type === "linkComment") {
        let linkUrl = comment.text;
        if (linksInField[linkUrl]) {
          // 这是重复的链接，标记要删除
          duplicateIndices.push(index);
        } else {
          // 第一次出现，记录下来
          linksInField[linkUrl] = index;
        }
      }
    });
    
    // 从后向前删除重复的链接（避免索引混乱）
    duplicateIndices.sort((a, b) => b - a);
    duplicateIndices.forEach(index => {
      note.removeCommentByIndex(index);
    });
  }

  /**
   * 检测并移动任务卡片链接到"相关链接"字段
   * 在制卡过程中，自动将最后一个字段下方的任务卡片链接移动到"相关链接"字段
   * 
   * @param {MNNote} note - 要处理的知识卡片
   */
  static moveTaskCardLinksToRelatedField(note) {
    try {
      // 1. 解析卡片结构，获取字段信息
      const commentsObj = this.parseNoteComments(note);
      const htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
      
      if (htmlCommentsObjArr.length === 0) {
        return; // 没有字段，直接返回
      }
      
      // 2. 获取最后一个字段及其下方的内容
      const lastField = htmlCommentsObjArr[htmlCommentsObjArr.length - 1];
      const lastFieldName = lastField.text;
      
      // 如果最后一个字段已经是"相关链接"，则无需处理
      if (lastFieldName === "相关链接" || lastFieldName === "相关链接：") {
        return;
      }
      
      // 3. 检查是否存在"相关链接"字段
      let relatedLinksFieldObj = null;
      for (let i = 0; i < htmlCommentsObjArr.length; i++) {
        const field = htmlCommentsObjArr[i];
        if (field.text === "相关链接" || field.text === "相关链接：") {
          relatedLinksFieldObj = field;
          break;
        }
      }
      
      // 如果没有"相关链接"字段，则无法移动
      if (!relatedLinksFieldObj) {
        return;
      }
      
      // 4. 获取最后一个字段下方的所有链接
      const lastFieldIndices = lastField.excludingFieldBlockIndexArr;
      const taskCardLinkIndices = [];
      
      // 遍历最后一个字段下方的评论
      for (let i = 0; i < lastFieldIndices.length; i++) {
        const commentIndex = lastFieldIndices[i];
        const comment = note.MNComments[commentIndex];
        
        // 检查评论是否存在
        if (!comment) {
          console.log(`[moveTaskCardLinksToRelatedField] Comment at index ${commentIndex} is undefined`);
          continue;
        }
        
        // 获取评论类型，处理 type 可能为 undefined 的情况
        let commentType = comment.type;
        if (!commentType && comment.detail) {
          // 如果 type 为 undefined，尝试重新计算类型
          commentType = MNComment.getCommentType(comment.detail);
        }
        
        // 检查是否是链接评论
        if (commentType === "linkComment") {
          // 获取链接 URL，兼容不同的属性位置
          const linkUrl = comment.text || comment.detail?.text || "";
          
          if (!linkUrl) {
            console.log(`[moveTaskCardLinksToRelatedField] Link URL is empty for comment at index ${commentIndex}`);
            continue;
          }
          
          // 判断链接是否指向任务卡片
          if (this.isTaskCardLink(linkUrl)) {
            taskCardLinkIndices.push(commentIndex);
          }
        }
      }
      
      // 5. 如果找到任务卡片链接，移动到"相关链接"字段
      if (taskCardLinkIndices.length > 0) {
        // 移动到"相关链接"字段的底部
        this.moveCommentsArrToField(note, taskCardLinkIndices, relatedLinksFieldObj.text, true);
        
        // 可选：显示提示
        // MNUtil.showHUD(`已将 ${taskCardLinkIndices.length} 个任务卡片链接移动到"相关链接"字段`);
      }
      
    } catch (error) {
      // 错误处理，但不中断制卡流程
      console.error("[moveTaskCardLinksToRelatedField] Error:", error);
      console.error("[moveTaskCardLinksToRelatedField] Error stack:", error.stack);
      // 可选：在开发阶段显示错误提示
      // MNUtil.showHUD(`任务卡片链接处理出错: ${error.message}`);
    }
  }

  /**
   * 移动所有总结链接到卡片最上方
   * @param {MNNote} note - 笔记对象
   */
  static moveSummaryLinksToTop(note) {
    try {
      const summaryLinkIndices = [];
      
      // 遍历所有评论，直接检查文本内容
      for (let i = 0; i < note.MNComments.length; i++) {
        const comment = note.MNComments[i];
        if (!comment) continue;
        
        // 获取评论文本 - 兼容不同的属性位置
        const text = comment.text || (comment.detail && comment.detail.text) || "";
        
        // 检查是否是总结链接：marginnote4app://note/ID/summary/0
        // 匹配格式：marginnote[数字]app://note/[任意字符]/summary/
        if (/^marginnote\dapp:\/\/note\/.*\/summary\//.test(text)) {
          summaryLinkIndices.push(i);
        }
      }
      
      // 使用 moveCommentsByIndexArr 批量移动到顶部
      if (summaryLinkIndices.length > 0) {
        note.moveCommentsByIndexArr(summaryLinkIndices, 0);
      }
      
    } catch (error) {
      // 开发阶段显示错误提示
      MNUtil.showHUD(`总结链接处理出错: ${error.message}`);
    }
  }

  /**
   * 获取指定字段内的 HtmlMarkdown 评论
   * @param {MNNote} note - 笔记对象
   * @param {string} fieldName - 字段名称
   * @returns {Array<{index: number, text: string, type: string, content: string}>} HtmlMarkdown 评论数组
   */
  static getFieldHtmlMarkdownComments(note, fieldName) {
    const commentsObj = this.parseNoteComments(note);
    const htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    const htmlMarkdownCommentsObjArr = commentsObj.htmlMarkdownCommentsObjArr;
    
    // 找到该字段的索引范围
    let fieldObj = htmlCommentsObjArr.find(obj => obj.text.includes(fieldName));
    if (!fieldObj) return [];
    
    // 获取该字段的评论索引范围（不包含字段本身）
    const fieldIndices = fieldObj.excludingFieldBlockIndexArr;
    
    // 筛选出该范围内的 HtmlMarkdown 评论
    return htmlMarkdownCommentsObjArr.filter(mdComment => 
      fieldIndices.includes(mdComment.index)
    );
  }

  /**
   * 显示字段内 HtmlMarkdown 子选择对话框
   * @param {MNNote} note - 笔记对象
   * @param {string} fieldName - 字段名称
   * @param {Function} callback - 回调函数，参数为选择的目标索引
   */
  static showFieldSubSelectionDialog(note, fieldName, callback) {
    const htmlMarkdownComments = this.getFieldHtmlMarkdownComments(note, fieldName);
    
    if (htmlMarkdownComments.length === 0) {
      // 如果没有 HtmlMarkdown 评论，直接返回字段底部
      const fieldObj = this.parseNoteComments(note).htmlCommentsObjArr.find(obj => obj.text.includes(fieldName));
      if (fieldObj && fieldObj.excludingFieldBlockIndexArr.length > 0) {
        const lastIndex = fieldObj.excludingFieldBlockIndexArr[fieldObj.excludingFieldBlockIndexArr.length - 1];
        callback(lastIndex + 1);
      } else {
        callback(null);
      }
      return;
    }
    
    // 构建选项列表
    const options = ["🔝 字段顶部"];
    htmlMarkdownComments.forEach(mdComment => {
      const icon = HtmlMarkdownUtils.icons[mdComment.type] || "";
      const prefix = HtmlMarkdownUtils.prefix[mdComment.type] || "";
      // 明确标示位置关系
      options.push(`↑ 在此之前：${icon} ${prefix}${mdComment.content}`);
      options.push(`↓ 在此之后：${icon} ${prefix}${mdComment.content}`);
    });
    options.push("⬇️ 字段底部");
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      `选择在【${fieldName}】中的位置`,
      "选择要移动到的具体位置",
      0,
      "取消",
      options,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          callback(null);
          return;
        }
        
        const fieldObj = this.parseNoteComments(note).htmlCommentsObjArr.find(obj => obj.text.includes(fieldName));
        if (!fieldObj) {
          callback(null);
          return;
        }
        
        if (buttonIndex === 1) {
          // 字段顶部
          callback(fieldObj.index + 1);
        } else if (buttonIndex === options.length) {
          // 字段底部
          const lastIndex = fieldObj.excludingFieldBlockIndexArr[fieldObj.excludingFieldBlockIndexArr.length - 1] || fieldObj.index;
          callback(lastIndex + 1);
        } else {
          // HtmlMarkdown 评论位置
          const mdIndex = Math.floor((buttonIndex - 2) / 2);
          const isAfter = (buttonIndex - 2) % 2 === 1;
          
          if (mdIndex < htmlMarkdownComments.length) {
            const targetIndex = htmlMarkdownComments[mdIndex].index;
            callback(isAfter ? targetIndex + 1 : targetIndex);
          } else {
            callback(null);
          }
        }
      }
    );
  }

  /**
   * 解析字段内的普通评论（非 HtmlComment 类型）
   * 
   * @param {MNNote} note - 笔记对象
   * @param {Object} fieldObj - 字段对象（来自 parseNoteComments）
   * @returns {Array} 返回字段内的评论信息数组
   */
  static parseFieldInternalComments(note, fieldObj) {
    const comments = [];
    const fieldIndices = fieldObj.excludingFieldBlockIndexArr;
    
    for (const index of fieldIndices) {
      const comment = note.MNComments[index];
      if (!comment) continue;
      
      // 检查是否为 HtmlComment，如果是则跳过
      if (comment.text && comment.text.includes('<!-- ') && comment.text.includes(' -->')) {
        continue;
      }
      
      const commentInfo = {
        index: index,
        comment: comment,
        displayText: this.formatCommentForDisplay(comment, index, note)
      };
      
      comments.push(commentInfo);
    }
    
    return comments;
  }
  
  /**
   * 根据评论类型返回对应的图标
   * 
   * @param {Object} comment - 评论对象
   * @returns {string} 图标字符
   */
  static getCommentTypeIcon(comment) {
    if (comment.icon) return comment.icon;
    
    switch (comment.type) {
      case 'TextNote':
        return '📝';
      case 'PaintNote':
        return '✏️';
      case 'linkComment':
        return '🔗';
      case 'mergedImageComment':
      case 'mergedImageCommentWithDrawing':
        return '🖼️';
      case 'markdownComment':
        return '📄';
      default:
        return '•';
    }
  }
  
  /**
   * 显示 HtmlMarkdown 评论下的位置选择对话框
   * 
   * @param {MNNote} note - 笔记对象
   * @param {Object} htmlMarkdownComment - HtmlMarkdown 评论对象
   * @param {Object} fieldObj - 字段对象，包含字段的边界信息
   * @param {Function} callback - 回调函数
   */
  static showHtmlMarkdownInternalPositionDialog(note, htmlMarkdownComment, fieldObj, callback, previousDialog = null) {
    // 获取该 HtmlMarkdown 评论后面的内容，限制在当前字段范围内
    const comments = note.MNComments;
    const startIndex = htmlMarkdownComment.index;
    const internalComments = [];
    
    // 获取字段的索引范围
    const fieldIndices = fieldObj.excludingFieldBlockIndexArr;
    const maxIndex = Math.max(...fieldIndices);
    
    // 从下一个位置开始收集，但限制在字段范围内
    for (let i = startIndex + 1; i <= maxIndex && i < comments.length; i++) {
      // 只处理属于当前字段的评论
      if (!fieldIndices.includes(i)) continue;
      
      const comment = comments[i];
      if (!comment) continue;
      
      // 如果遇到 HtmlComment（字段），跳过
      if (comment.text && comment.text.includes('<!-- ') && comment.text.includes(' -->')) {
        continue;
      }
      
      // 检查是否为 HtmlMarkdown
      let cleanText = comment.text || "";
      if (cleanText.startsWith("- ")) {
        cleanText = cleanText.substring(2);
      }
      if (HtmlMarkdownUtils.isHtmlMDComment(cleanText)) {
        break;  // 遇到下一个 HtmlMarkdown，停止
      }
      
      const displayText = this.formatCommentForDisplay(comment, i, note);
      internalComments.push({
        index: i,
        comment: comment,
        displayText: displayText
      });
    }
    
    // 构建选项
    const icon = HtmlMarkdownUtils.icons[htmlMarkdownComment.type] || '📄';
    const content = htmlMarkdownComment.content || '';
    let options = [];
    
    // 如果有上一层，添加返回选项
    if (previousDialog) {
      options.push("⬅️ 返回上一层");
    }
    
    options.push(`[${icon}] ${content} 顶部`);
    
    if (internalComments.length > 0) {
      // 为每个内部评论生成位置选项
      for (let i = 0; i < internalComments.length; i++) {
        const commentInfo = internalComments[i];
        options.push(`${commentInfo.displayText} ↑ 上方`);
        options.push(`${commentInfo.displayText} ↓ 下方`);
      }
    }
    
    options.push(`[${icon}] ${content} 底部`);
    
    // 显示选择对话框
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      `选择【${icon} ${content}】内的具体位置`,
      "选择要插入的位置",
      0,
      "取消",
      options,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          callback(null);
          return;
        }
        
        // 如果有返回选项，处理返回
        if (previousDialog && buttonIndex === 1) {
          previousDialog();
          return;
        }
        
        // 根据是否有返回选项调整索引
        const offset = previousDialog ? 1 : 0;
        
        if (buttonIndex === 1 + offset) {
          // HtmlMarkdown 顶部（即其下方）
          callback(startIndex + 1);
        } else if (buttonIndex === options.length) {
          // HtmlMarkdown 底部
          if (internalComments.length > 0) {
            const lastIndex = internalComments[internalComments.length - 1].index;
            callback(lastIndex + 1);
          } else {
            callback(startIndex + 1);
          }
        } else {
          // 评论位置
          const commentIndex = Math.floor((buttonIndex - 2 - offset) / 2);
          const isAfter = (buttonIndex - 2 - offset) % 2 === 1;
          
          if (commentIndex < internalComments.length) {
            const targetIndex = internalComments[commentIndex].index;
            callback(isAfter ? targetIndex + 1 : targetIndex);
          } else {
            callback(null);
          }
        }
      }
    );
  }

  /**
   * 解析字段内的顶层结构（用于第三层显示）
   * 
   * @param {MNNote} note - 笔记对象
   * @param {Object} fieldObj - 字段对象
   * @returns {Object} 返回字段内的顶层结构
   */
  static parseFieldTopLevelStructure(note, fieldObj) {
    const structure = {
      independentComments: [],  // HtmlMarkdown 之前的独立评论
      htmlMarkdownSections: []  // HtmlMarkdown 区块（包含其标题和范围）
    };
    
    const fieldIndices = fieldObj.excludingFieldBlockIndexArr;
    const parsedComments = this.parseNoteComments(note);
    
    // 第一步：找出所有 HtmlMarkdown 的位置
    const htmlMarkdownIndices = [];
    for (let i = 0; i < fieldIndices.length; i++) {
      const index = fieldIndices[i];
      const comment = note.MNComments[index];
      if (!comment) continue;
      
      // 跳过 HtmlComment（字段）
      if (comment.text && comment.text.includes('<!-- ') && comment.text.includes(' -->')) {
        continue;
      }
      
      // 检查是否为 HtmlMarkdown 评论
      const htmlMarkdownObj = parsedComments.htmlMarkdownCommentsObjArr.find(obj => obj.index === index);
      if (htmlMarkdownObj) {
        htmlMarkdownIndices.push({
          index: index,
          htmlMarkdownObj: htmlMarkdownObj
        });
      }
    }
    
    // 第二步：处理独立评论（只有第一个 HtmlMarkdown 之前的内容是独立的）
    const firstHtmlMarkdownIndex = htmlMarkdownIndices.length > 0 ? htmlMarkdownIndices[0].index : null;
    
    for (let i = 0; i < fieldIndices.length; i++) {
      const index = fieldIndices[i];
      
      // 如果有 HtmlMarkdown，且当前索引已经到达或超过第一个 HtmlMarkdown，停止收集独立评论
      if (firstHtmlMarkdownIndex !== null && index >= firstHtmlMarkdownIndex) {
        break;
      }
      
      const comment = note.MNComments[index];
      if (!comment) continue;
      
      // 跳过 HtmlComment（字段）
      if (comment.text && comment.text.includes('<!-- ') && comment.text.includes(' -->')) {
        continue;
      }
      
      structure.independentComments.push({
        index: index,
        comment: comment,
        displayText: this.formatCommentForDisplay(comment, index, note)
      });
    }
    
    // 第三步：创建 HtmlMarkdown 区块
    for (let i = 0; i < htmlMarkdownIndices.length; i++) {
      const { index, htmlMarkdownObj } = htmlMarkdownIndices[i];
      const icon = HtmlMarkdownUtils.icons[htmlMarkdownObj.type] || '📄';
      
      let endIndex;
      if (i < htmlMarkdownIndices.length - 1) {
        // 不是最后一个，结束于下一个 HtmlMarkdown 之前
        endIndex = htmlMarkdownIndices[i + 1].index - 1;
      } else {
        // 是最后一个，结束于字段末尾
        endIndex = fieldIndices[fieldIndices.length - 1] || index;
      }
      
      structure.htmlMarkdownSections.push({
        index: index,
        htmlMarkdownObj: htmlMarkdownObj,
        displayText: `[${icon}] ${htmlMarkdownObj.content || ''}`,
        startIndex: index,
        endIndex: endIndex
      });
    }
    
    return structure;
  }

  /**
   * 解析字段内的所有内容（包括 HtmlMarkdown 和普通评论）
   * 
   * @param {MNNote} note - 笔记对象
   * @param {Object} fieldObj - 字段对象
   * @returns {Array} 返回包含类型信息的内容数组
   */
  static parseFieldAllContents(note, fieldObj) {
    const contents = [];
    const fieldIndices = fieldObj.excludingFieldBlockIndexArr;
    const parsedComments = this.parseNoteComments(note);
    
    for (const index of fieldIndices) {
      const comment = note.MNComments[index];
      if (!comment) continue;
      
      // 检查是否为 HtmlComment（字段），如果是则跳过
      if (comment.text && comment.text.includes('<!-- ') && comment.text.includes(' -->')) {
        continue;
      }
      
      // 检查是否为 HtmlMarkdown 评论
      const htmlMarkdownObj = parsedComments.htmlMarkdownCommentsObjArr.find(obj => obj.index === index);
      
      if (htmlMarkdownObj) {
        // HtmlMarkdown 评论
        const icon = HtmlMarkdownUtils.icons[htmlMarkdownObj.type] || '📄';
        contents.push({
          type: 'htmlMarkdown',
          index: index,
          comment: comment,
          displayText: `◆ [${icon}] ${htmlMarkdownObj.content || ''}`,
          htmlMarkdownObj: htmlMarkdownObj
        });
      } else {
        // 普通评论
        contents.push({
          type: 'normal',
          index: index,
          comment: comment,
          displayText: this.formatCommentForDisplay(comment, index, note)
        });
      }
    }
    
    return contents;
  }

  /**
   * 显示字段内部位置选择对话框（第三层）
   * 
   * @param {MNNote} note - 笔记对象
   * @param {string} fieldName - 字段名称
   * @param {Function} callback - 回调函数，参数为选中的索引位置
   */
  static showFieldInternalPositionDialog(note, fieldName, callback, previousDialog = null) {
    const fieldObj = this.parseNoteComments(note).htmlCommentsObjArr.find(obj => obj.text.includes(fieldName));
    if (!fieldObj) {
      callback(null);
      return;
    }
    
    const structure = this.parseFieldTopLevelStructure(note, fieldObj);
    
    // 检查字段是否为空
    if (structure.independentComments.length === 0 && structure.htmlMarkdownSections.length === 0) {
      // 字段内没有内容，直接返回字段底部
      callback(fieldObj.index + 1);
      return;
    }
    
    let options = [];
    let optionActions = []; // 记录每个选项的动作
    
    // 如果有上一层，添加返回选项
    if (previousDialog) {
      options.push("⬅️ 返回上一层");
      optionActions.push({type: 'return'});
    }
    
    options.push(`【${fieldName}】字段顶部`);
    optionActions.push({type: 'fieldTop'});
    
    // 合并并排序所有元素
    let allElements = [];
    
    // 添加独立评论
    structure.independentComments.forEach(comment => {
      allElements.push({
        type: 'independentComment',
        index: comment.index,
        data: comment
      });
    });
    
    // 添加 HtmlMarkdown 区块
    structure.htmlMarkdownSections.forEach(section => {
      allElements.push({
        type: 'htmlMarkdown',
        index: section.index,
        data: section
      });
    });
    
    // 按索引排序
    allElements.sort((a, b) => a.index - b.index);
    
    // 生成选项
    for (const element of allElements) {
      if (element.type === 'independentComment') {
        // 独立评论显示上方和下方选项
        const comment = element.data;
        options.push(`${comment.displayText} ↑ 上方`);
        optionActions.push({type: 'position', index: comment.index, isAfter: false});
        
        options.push(`${comment.displayText} ↓ 下方`);
        optionActions.push({type: 'position', index: comment.index, isAfter: true});
        
      } else if (element.type === 'htmlMarkdown') {
        // HtmlMarkdown 显示标题（可点击）和 Top/Bottom
        const section = element.data;
        
        // 标题（可点击进入）
        options.push(`◆ ${section.displayText}`);
        optionActions.push({type: 'htmlMarkdownDetail', section: section});
        
        // Top 和 Bottom
        options.push(`🔝 ${section.displayText} Top 🔝`);
        optionActions.push({type: 'position', index: section.index + 1, isAfter: false});
        
        options.push(`⬇️ ${section.displayText} Bottom ⬇️`);
        optionActions.push({type: 'htmlMarkdownBottom', section: section});
      }
    }
    
    options.push(`【${fieldName}】字段底部`);
    optionActions.push({type: 'fieldBottom'});
    
    // 显示选择对话框
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      `选择【${fieldName}】内的具体位置`,
      "点击带 ◆ 的项目可进入更精确的位置选择",
      0,
      "取消",
      options,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          callback(null);
          return;
        }
        
        const action = optionActions[buttonIndex - 1];
        
        if (action.type === 'return') {
          // 返回上一层
          previousDialog();
          return;
          
        } else if (action.type === 'fieldTop') {
          // 字段顶部
          callback(fieldObj.index + 1);
          
        } else if (action.type === 'fieldBottom') {
          // 字段底部
          const lastIndex = fieldObj.excludingFieldBlockIndexArr[fieldObj.excludingFieldBlockIndexArr.length - 1] || fieldObj.index;
          callback(lastIndex + 1);
          
        } else if (action.type === 'position') {
          // 直接位置
          if (action.isAfter) {
            callback(action.index + 1);  // 下方位置
          } else {
            callback(action.index);      // 上方位置
          }
          
        } else if (action.type === 'htmlMarkdownDetail') {
          // 用户点击了 HtmlMarkdown 标题，显示其内部位置选择
          this.showHtmlMarkdownInternalPositionDialog(note, action.section.htmlMarkdownObj, fieldObj, callback, () => {
            // 返回函数：重新显示当前对话框
            this.showFieldInternalPositionDialog(note, fieldName, callback, previousDialog);
          });
          
        } else if (action.type === 'htmlMarkdownBottom') {
          // HtmlMarkdown 的 Bottom
          // 需要找到这个 HtmlMarkdown 区块的结束位置
          const endIndex = action.section.endIndex;
          if (endIndex !== null && endIndex >= action.section.startIndex) {
            callback(endIndex + 1);
          } else {
            // 如果没有内容，就是 HtmlMarkdown 的下一个位置
            callback(action.section.startIndex + 1);
          }
        }
      }
    );
  }

  /**
   * 显示多选评论对话框
   * 
   * @param {MNNote} note - 笔记对象  
   * @param {Array} commentOptions - 评论选项数组
   * @param {Set} selectedIndices - 已选中的索引集合
   * @param {Function} callback - 回调函数，参数为选中的索引数组
   * @param {Function} previousDialog - 返回上一层的函数
   */
  static showCommentMultiSelectDialog(note, commentOptions, selectedIndices, callback, previousDialog = null) {
    // 构建显示选项
    let displayOptions = commentOptions.map(item => {
      let prefix = selectedIndices.has(item.index) ? "✅ " : "";
      return prefix + item.display;
    });
    
    // 添加全选/取消全选选项
    let allSelected = selectedIndices.size === commentOptions.length;
    let selectAllText = allSelected ? "⬜ 取消全选" : "☑️ 全选所有内容";
    displayOptions.unshift(selectAllText);
    
    // 添加范围选择选项
    displayOptions.splice(1, 0, "📍 选择范围");
    
    // 添加反选选项
    displayOptions.splice(2, 0, "🔄 反选");
    
    // 添加分隔线和操作选项
    if (previousDialog) {
      displayOptions.push("⬅️ 返回上一层");
    }
    displayOptions.push("──────────────");
    displayOptions.push("➡️ 移动选中项");
    displayOptions.push("📤 提取选中项");
    displayOptions.push("🗑️ 删除选中项");
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择要移动的内容",
      `已选中 ${selectedIndices.size}/${commentOptions.length} 项`,
      0,
      "取消",
      displayOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          callback(null); // 用户取消
          return;
        }
        
        if (buttonIndex === 1) {
          // 用户选择了全选/取消全选
          if (allSelected) {
            // 取消全选
            selectedIndices.clear();
          } else {
            // 全选
            commentOptions.forEach(item => {
              selectedIndices.add(item.index);
            });
          }
          
          // 递归显示更新后的对话框
          this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
          
        } else if (buttonIndex === 2) {
          // 用户选择了范围选择
          this.showRangeSelectDialog(note, commentOptions, selectedIndices, previousDialog);
          
        } else if (buttonIndex === 3) {
          // 用户选择了反选
          const newSelectedIndices = new Set();
          commentOptions.forEach(item => {
            if (!selectedIndices.has(item.index)) {
              newSelectedIndices.add(item.index);
            }
          });
          
          // 清空原集合并添加反选的项
          selectedIndices.clear();
          newSelectedIndices.forEach(index => selectedIndices.add(index));
          
          // 递归显示更新后的对话框
          this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
          
        } else if (buttonIndex === displayOptions.length) {
          // 用户选择了"删除选中项"
          if (selectedIndices.size === 0) {
            MNUtil.showHUD("没有选中任何内容");
            this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
            return;
          }
          
          // 直接调用删除确认对话框
          const selectedIndicesArray = Array.from(selectedIndices).sort((a, b) => a - b);
          this.showDeleteConfirmDialog(note, selectedIndicesArray, () => {
            // 返回函数：重新显示当前对话框
            this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
          });
          
        } else if (buttonIndex === displayOptions.length - 1) {
          // 用户选择了"提取选中项"
          if (selectedIndices.size === 0) {
            MNUtil.showHUD("没有选中任何内容");
            this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
            return;
          }
          
          // 调用提取操作
          const selectedIndicesArray = Array.from(selectedIndices).sort((a, b) => a - b);
          this.performExtract(note, selectedIndicesArray);
          
        } else if (buttonIndex === displayOptions.length - 2) {
          // 用户选择了"移动选中项"
          if (selectedIndices.size === 0) {
            MNUtil.showHUD("没有选中任何内容");
            this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
            return;
          }
          
          // 直接调用移动目标选择对话框
          const selectedIndicesArray = Array.from(selectedIndices).sort((a, b) => a - b);
          this.showMoveTargetSelectionDialog(note, selectedIndicesArray, () => {
            // 返回函数：重新显示当前对话框
            this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
          });
          
        } else if (buttonIndex === displayOptions.length - 3) {
          // 用户选择了分隔线，忽略并重新显示
          this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
          
        } else {
          // 需要检查是否选择了返回选项
          const returnIndex = previousDialog ? displayOptions.indexOf("⬅️ 返回上一层") : -1;
          if (previousDialog && buttonIndex - 1 === returnIndex) {
            // 用户选择了返回上一层
            previousDialog();
            return;
          }
          
          // 用户选择了某个评论，切换选中状态
          let selectedComment = commentOptions[buttonIndex - 4]; // 因为加了全选、范围选择和反选选项，所以索引要减4
          
          if (selectedIndices.has(selectedComment.index)) {
            selectedIndices.delete(selectedComment.index);
          } else {
            selectedIndices.add(selectedComment.index);
          }
          
          // 递归显示更新后的对话框
          this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
        }
      }
    );
  }

  /**
   * 显示范围选择对话框
   * 
   * @param {MNNote} note - 笔记对象
   * @param {Array} commentOptions - 所有评论选项
   * @param {Set} selectedIndices - 当前已选中的索引集合
   * @param {Function} previousDialog - 返回上一层的函数
   */
  static showRangeSelectDialog(note, commentOptions, selectedIndices, previousDialog) {
    // 检查是否有足够的评论进行范围选择
    if (commentOptions.length < 2) {
      MNUtil.showHUD("评论数量不足，至少需要2个评论才能进行范围选择");
      this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
      return;
    }
    
    // 第一阶段：选择起始位置
    this.showStartPositionDialog(note, commentOptions, selectedIndices, previousDialog);
  }

  /**
   * 显示起始位置选择对话框
   * 
   * @param {MNNote} note - 笔记对象
   * @param {Array} commentOptions - 所有评论选项
   * @param {Set} selectedIndices - 当前已选中的索引集合
   * @param {Function} previousDialog - 返回上一层的函数
   */
  static showStartPositionDialog(note, commentOptions, selectedIndices, previousDialog) {
    // 构建显示选项
    let displayOptions = commentOptions.map((item) => {
      return item.display;
    });
    
    // 添加返回选项
    displayOptions.push("⬅️ 返回多选");
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "范围选择 - 第1步",
      "请选择起始评论",
      0,
      "取消",
      displayOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          // 取消，返回多选对话框
          this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
          return;
        }
        
        if (buttonIndex === displayOptions.length) {
          // 返回多选
          this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
          return;
        }
        
        // 用户选择了起始位置
        const startIndex = buttonIndex - 1;
        const startComment = commentOptions[startIndex];
        
        // 进入第二阶段：选择结束位置
        this.showEndPositionDialog(note, commentOptions, selectedIndices, startComment, previousDialog);
      }
    );
  }

  /**
   * 显示结束位置选择对话框
   * 
   * @param {MNNote} note - 笔记对象
   * @param {Array} commentOptions - 所有评论选项
   * @param {Set} selectedIndices - 当前已选中的索引集合
   * @param {Object} startComment - 起始评论对象
   * @param {Function} previousDialog - 返回上一层的函数
   */
  static showEndPositionDialog(note, commentOptions, selectedIndices, startComment, previousDialog) {
    // 构建显示选项，高亮起始位置和提供范围预览
    let displayOptions = commentOptions.map((item) => {
      let prefix = "";
      if (item.index === startComment.index) {
        prefix = "🟢 ";  // 起始位置标记
      } else if (item.index < startComment.index) {
        // 显示向上范围的大小
        const rangeSize = startComment.index - item.index + 1;
        prefix = `⬆️${rangeSize} `;
      } else if (item.index > startComment.index) {
        // 显示向下范围的大小
        const rangeSize = item.index - startComment.index + 1;
        prefix = `⬇️${rangeSize} `;
      }
      return `${prefix}${item.display}`;
    });
    
    // 添加返回选项
    displayOptions.push("⬅️ 返回第1步");
    displayOptions.push("⬅️ 返回多选");
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "范围选择 - 第2步",
      `请选择结束评论\n已选择起始: #${startComment.index + 1}`,
      0,
      "取消",
      displayOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          // 取消，返回多选对话框
          this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
          return;
        }
        
        if (buttonIndex === displayOptions.length) {
          // 返回多选
          this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
          return;
        }
        
        if (buttonIndex === displayOptions.length - 1) {
          // 返回第1步
          this.showStartPositionDialog(note, commentOptions, selectedIndices, previousDialog);
          return;
        }
        
        // 用户选择了结束位置
        const endIndex = buttonIndex - 1;
        const endComment = commentOptions[endIndex];
        
        // 执行范围选择
        this.selectCommentRange(selectedIndices, startComment.index, endComment.index);
        
        // 显示成功提示并返回多选对话框
        const rangeSize = Math.abs(endComment.index - startComment.index) + 1;
        MNUtil.showHUD(`已选择范围：#${Math.min(startComment.index, endComment.index) + 1} 到 #${Math.max(startComment.index, endComment.index) + 1}，共 ${rangeSize} 个评论`);
        
        this.showCommentMultiSelectDialog(note, commentOptions, selectedIndices, null, previousDialog);
      }
    );
  }

  /**
   * 选择评论范围
   * 
   * @param {Set} selectedIndices - 已选中的索引集合
   * @param {number} startIndex - 起始索引
   * @param {number} endIndex - 结束索引
   */
  static selectCommentRange(selectedIndices, startIndex, endIndex) {
    // 确保起始索引小于结束索引
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    // 将范围内的所有索引添加到选中集合
    for (let i = minIndex; i <= maxIndex; i++) {
      selectedIndices.add(i);
    }
  }

  /**
   * 获取所有可选择的评论选项
   * 
   * @param {MNNote} note - 笔记对象
   * @returns {Array} 评论选项数组
   */
  static getAllCommentOptionsForMove(note) {
    const options = [];
    const comments = note.MNComments;
    
    // 构建所有评论的选项
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const displayText = this.formatCommentForDisplay(comment, i, note);
      options.push({
        index: i,
        display: displayText,
        comment: comment
      });
    }
    
    return options;
  }

  /**
   * 通过弹窗管理评论（移动或删除）
   */
  static manageCommentsByPopup(note) {
    // 定义选项和对应的处理函数
    const optionHandlers = {
      "📝 手动输入 Index": () => {
        this.showCommentIndexInputDialog(note, (indices) => {
          if (indices && indices.length > 0) {
            this.showActionSelectionDialog(note, indices, () => {
              // 返回函数：重新显示主菜单
              this.manageCommentsByPopup(note);
            });
          }
        }, () => {
          // 返回函数：重新显示主菜单
          this.manageCommentsByPopup(note);
        });
      },
      
      "✅ 多选评论内容": () => {
        const allOptions = this.getAllCommentOptionsForMove(note);
        const selectedIndices = new Set();
        this.showCommentMultiSelectDialog(note, allOptions, selectedIndices, null, () => {
          // 返回函数：重新显示主菜单
          this.manageCommentsByPopup(note);
        });
      },
      
      "🔄 自动获取新内容": () => {
        const moveCommentIndexArr = this.autoGetNewContentToMoveIndexArr(note);
        if (moveCommentIndexArr.length === 0) {
          MNUtil.showHUD("没有检测到新内容");
          return;
        }
        this.showActionSelectionDialog(note, moveCommentIndexArr, () => {
          // 返回函数：重新显示主菜单
          this.manageCommentsByPopup(note);
        });
      },
      
      "Z️⃣ 最后一条评论": () => {
        const moveCommentIndexArr = [note.comments.length - 1];
        this.showActionSelectionDialog(note, moveCommentIndexArr, () => {
          // 返回函数：重新显示主菜单
          this.manageCommentsByPopup(note);
        });
      },
      
      "YZ 最后两条评论": () => {
        const moveCommentIndexArr = [note.comments.length - 2, note.comments.length - 1];
        this.showActionSelectionDialog(note, moveCommentIndexArr, () => {
          // 返回函数：重新显示主菜单
          this.manageCommentsByPopup(note);
        });
      },
      
      "📦 选择字段区域": () => {
        this.showFieldSelectionForMove(note, (indices) => {
          if (indices && indices.length > 0) {
            this.showActionSelectionDialog(note, indices, () => {
              // 返回函数：重新显示主菜单
              this.manageCommentsByPopup(note);
            });
          }
        }, () => {
          // 返回函数：重新显示主菜单
          this.manageCommentsByPopup(note);
        });
      }
    };
    
    // 提取选项列表
    const firstOptions = Object.keys(optionHandlers);
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择要管理的评论",
      "选择获取评论的方式",
      0,
      "取消",
      firstOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) return; // 取消
        
        // 根据选项执行对应的处理函数
        const selectedOption = firstOptions[buttonIndex - 1];
        const handler = optionHandlers[selectedOption];
        if (handler) {
          handler();
        }
      }
    );
  }

  /**
   * 显示手动输入对话框
   */
  static showCommentIndexInputDialog(note, callback, previousDialog = null) {
    // 构建选项数组
    const options = ["确定"];
    if (previousDialog) {
      options.unshift("⬅️ 返回上一层");
    }
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "输入要移动的评论 Index",
      "❗️从 1 开始\n支持:\n- 单个序号: 1,2,3\n- 范围: 1-4 \n- 特殊字符: X(倒数第3条), Y(倒数第2条), Z(最后一条)\n- 组合使用: 1,3-5,Y,Z",
      2,
      "取消",
      options,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          callback(null);
          return;
        }
        
        // 如果有返回选项，处理返回
        if (previousDialog && buttonIndex === 1) {
          previousDialog();
          return;
        }
        
        // 确定按钮的索引根据是否有返回选项而不同
        const confirmIndex = previousDialog ? 2 : 1;
        if (buttonIndex === confirmIndex) {
          const userInput = alert.textFieldAtIndex(0).text;
          if (!userInput) {
            MNUtil.showHUD("请输入有效的索引");
            callback(null);
            return;
          }
          
          const indices = userInput.parseCommentIndices(note.comments.length);
          callback(indices);
        }
      }
    );
  }

  /**
   * 显示字段选择对话框
   */
  static showFieldSelectionForMove(note, callback, previousDialog = null) {
    const htmlCommentsTextArr = this.parseNoteComments(note).htmlCommentsTextArr;
    
    if (htmlCommentsTextArr.length === 0) {
      MNUtil.showHUD("当前笔记没有字段");
      callback(null);
      return;
    }
    
    // 构建选项数组
    let options = [...htmlCommentsTextArr];
    if (previousDialog) {
      options.unshift("⬅️ 返回上一层");
    }
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择字段区域",
      "选择要移动的字段内容",
      0,
      "取消",
      options,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          callback(null);
          return;
        }
        
        // 如果有返回选项，处理返回
        if (previousDialog && buttonIndex === 1) {
          previousDialog();
          return;
        }
        
        // 计算实际的字段索引
        const fieldIndex = previousDialog ? buttonIndex - 2 : buttonIndex - 1;
        const selectedField = htmlCommentsTextArr[fieldIndex];
        const indices = this.getHtmlCommentExcludingFieldBlockIndexArr(note, selectedField);
        
        if (indices.length === 0) {
          MNUtil.showHUD(`字段"${selectedField}"下没有内容`);
          callback(null);
          return;
        }
        
        callback(indices);
      }
    );
  }

  /**
   * 显示操作选择对话框（移动、提取或删除）
   */
  static showActionSelectionDialog(note, moveCommentIndexArr, previousDialog = null) {
    // 先让用户选择操作类型
    const actionOptions = [
      "➡️ 移动评论",
      "📤 提取评论",
      "🗑️ 删除评论"
    ];
    
    // 如果有上一层，添加返回选项
    if (previousDialog) {
      actionOptions.unshift("⬅️ 返回上一层");
    }
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择操作类型",
      `已选择 ${moveCommentIndexArr.length} 项内容`,
      0,
      "取消",
      actionOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) return; // 取消
        
        // 如果有返回选项，处理返回
        if (previousDialog && buttonIndex === 1) {
          previousDialog();
          return;
        }
        
        // 根据是否有返回选项调整索引
        const offset = previousDialog ? 1 : 0;
        
        if (buttonIndex === 1 + offset) {
          // 移动评论
          this.showMoveTargetSelectionDialog(note, moveCommentIndexArr, () => {
            // 返回函数：重新显示当前对话框
            this.showActionSelectionDialog(note, moveCommentIndexArr, previousDialog);
          });
        } else if (buttonIndex === 2 + offset) {
          // 提取评论
          this.performExtract(note, moveCommentIndexArr);
        } else if (buttonIndex === 3 + offset) {
          // 删除评论
          this.showDeleteConfirmDialog(note, moveCommentIndexArr, () => {
            // 返回函数：重新显示当前对话框
            this.showActionSelectionDialog(note, moveCommentIndexArr, previousDialog);
          });
        }
      }
    );
  }
  
  /**
   * 显示移动目标选择对话框（第二层）
   */
  static showMoveTargetSelectionDialog(note, moveCommentIndexArr, previousDialog = null) {
    const targetOptions = this.getHtmlCommentsTextArrForPopup(note);
    
    // 如果有上一层，添加返回选项
    let options = [...targetOptions];
    if (previousDialog) {
      options.unshift("⬅️ 返回上一层");
    }
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择移动的位置",
      `将移动 ${moveCommentIndexArr.length} 项内容\n点击字段或带 ◆ 的项目可选择更精确的位置`,
      0,
      "取消",
      options,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) return; // 取消
        
        // 如果有返回选项，处理返回
        if (previousDialog && buttonIndex === 1) {
          previousDialog();
          return;
        }
        
        // 根据是否有返回选项调整索引
        const optionIndex = previousDialog ? buttonIndex - 2 : buttonIndex - 1;
        const selectedOption = targetOptions[optionIndex];
        
        // 判断是否点击了字段区域
        if (selectedOption && selectedOption.includes("区】----------") && !selectedOption.includes("摘录区")) {
          // 提取字段名
          const matches = selectedOption.match(/【(.+?)区】/);
          if (matches && matches[1]) {
            const fieldName = matches[1];
            
            // 显示第三层对话框
            this.showFieldInternalPositionDialog(note, fieldName, (targetIndex) => {
              if (targetIndex !== null) {
                this.performMove(note, moveCommentIndexArr, targetIndex);
              }
            }, () => {
              // 返回函数：重新显示当前对话框
              this.showMoveTargetSelectionDialog(note, moveCommentIndexArr, previousDialog);
            });
            return;
          }
        }
        
        // 直接移动到选定位置
        const targetIndex = this.getCommentsIndexArrToMoveForPopup(note)[optionIndex];
        if (targetIndex !== null) {
          this.performMove(note, moveCommentIndexArr, targetIndex);
        }
      }
    );
  }

  /**
   * 执行移动操作
   */
  static performMove(note, moveCommentIndexArr, targetIndex) {
    MNUtil.undoGrouping(() => {
      try {
        note.moveCommentsByIndexArr(moveCommentIndexArr, targetIndex);
        note.refresh();
        // MNUtil.showHUD(`成功移动 ${moveCommentIndexArr.length} 项内容`);
      } catch (error) {
        MNUtil.showHUD("移动失败: " + error.message);
        MNUtil.addErrorLog(error, "performMove", {noteId: note.noteId});
      }
    });
  }
  
  /**
   * 显示删除确认对话框
   */
  static showDeleteConfirmDialog(note, deleteCommentIndexArr, previousDialog = null) {
    // 构建要删除的评论列表
    let deleteList = [];
    let isLinkComment = false;
    let linkUrl = null;
    
    deleteCommentIndexArr.forEach(index => {
      const comment = note.MNComments[index];
      if (comment) {
        const displayText = this.formatCommentForDisplay(comment, index, note);
        deleteList.push(`• ${displayText}`);
        
        // 检查是否为链接评论（仅当只选中一条时）
        if (deleteCommentIndexArr.length === 1 && comment.type === "linkComment") {
          isLinkComment = true;
          linkUrl = comment.text;
        }
      }
    });
    
    const message = `确定要删除以下 ${deleteCommentIndexArr.length} 项评论吗？\n\n${deleteList.join('\n')}`;
    
    // 构建选项数组
    const options = [];
    if (previousDialog) {
      options.push("⬅️ 返回上一层");
    }
    options.push("🗑️ 确认删除");
    
    // 如果是单个链接评论，增加复制选项
    if (isLinkComment) {
      options.push("🗑️📋 确认并复制行内链接");
    }
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "确认删除",
      message,
      0,
      "取消",
      options,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          return; // 取消
        }
        
        // 处理返回选项
        if (previousDialog && options[buttonIndex - 1] === "⬅️ 返回上一层") {
          previousDialog();
          return;
        }
        
        // 处理确认删除
        if (options[buttonIndex - 1] === "🗑️ 确认删除") {
          this.performDelete(note, deleteCommentIndexArr);
          return;
        }
        
        // 处理确认并复制行内链接
        if (options[buttonIndex - 1] === "🗑️📋 确认并复制行内链接") {
          // 先显示输入引用词的对话框
          UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
            "复制 Markdown 类型链接",
            "输入引用词",
            2,
            "取消",
            ["确定"],
            (inputAlert, inputButtonIndex) => {
              if (inputButtonIndex === 1) {
                // 获取链接指向的笔记
                const linkedNote = MNNote.new(linkUrl);
                let refContent = inputAlert.textFieldAtIndex(0).text;
                
                // 如果用户没有输入，尝试获取链接笔记的标题
                if (!refContent && linkedNote) {
                  // 尝试从链接的笔记获取标题
                  const titleParts = knowledgeBaseTemplate.parseNoteTitle(linkedNote);
                  refContent = titleParts.content || linkedNote.noteTitle || "链接";
                  // 去除可能的 "; " 前缀
                  if (refContent.startsWith("; ")) {
                    refContent = refContent.substring(2).trim();
                  }
                } else if (!refContent) {
                  refContent = "链接";
                }
                
                // 生成 Markdown 链接
                const mdLink = `[${refContent}](${linkUrl})`;
                MNUtil.copy(mdLink);
                MNUtil.showHUD(`已复制: ${mdLink}`);
                
                // 然后执行删除操作
                this.performDelete(note, deleteCommentIndexArr);
              }
            }
          );
        }
      }
    );
  }
  
  /**
   * 执行删除操作
   */
  static performDelete(note, deleteCommentIndexArr) {
    MNUtil.undoGrouping(() => {
      try {
        // 使用批量删除 API
        note.removeCommentsByIndexArr(deleteCommentIndexArr);
        
        note.refresh();
        MNUtil.showHUD(`成功删除 ${deleteCommentIndexArr.length} 项评论`);
      } catch (error) {
        MNUtil.showHUD("删除失败: " + error.message);
        MNUtil.addErrorLog(error, "performDelete", {noteId: note.noteId});
      }
    });
  }

  /**
   * 执行提取操作
   * 将选中的评论提取为新的子卡片
   */
  static performExtract(note, extractCommentIndexArr) {
    let clonedNote = null;
    
    // 第一步：创建子卡片
    MNUtil.undoGrouping(() => {
      try {
        // 克隆原笔记
        clonedNote = note.clone();
        clonedNote.title = ""
        
        // 删除克隆卡片的所有子卡片
        if (clonedNote.childNotes && clonedNote.childNotes.length > 0) {
          // 从后往前删除，避免索引变化
          for (let i = clonedNote.childNotes.length - 1; i >= 0; i--) {
            clonedNote.childNotes[i].removeFromParent();
          }
        }
        
        // 将克隆的笔记添加为原笔记的子卡片
        note.addChild(clonedNote);
        
        // 获取所有评论的索引，并排除要提取的评论
        const allIndices = Array.from({length: clonedNote.comments.length}, (_, i) => i);
        const indicesToDelete = allIndices.filter(i => !extractCommentIndexArr.includes(i));
        
        // 从大到小排序，避免删除时索引变化
        indicesToDelete.sort((a, b) => b - a);
        
        // 删除未选中的评论
        clonedNote.removeCommentsByIndexArr(indicesToDelete);
        
        // 处理链接关系继承
        this.handleExtractedNoteLinks(note, clonedNote, extractCommentIndexArr);
        
        // 刷新显示
        clonedNote.refresh();
        note.refresh();
        
        MNUtil.showHUD(`成功提取 ${extractCommentIndexArr.length} 项评论为新卡片`);
        
        // 在脑图中聚焦新创建的卡片
        MNUtil.focusNoteInMindMapById(clonedNote.noteId, 0.5);
        
      } catch (error) {
        MNUtil.showHUD("提取失败: " + error.message);
        MNUtil.addErrorLog(error, "performExtract", {noteId: note.noteId});
        return; // 出错则不显示后续对话框
      }
    });
    
    // 第二步：询问是否删除原评论
    if (clonedNote) {
      // 延迟显示对话框，确保前面的操作完成
      MNUtil.delay(0.5).then(() => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "提取完成",
          `已成功提取 ${extractCommentIndexArr.length} 项评论到新卡片。\n\n是否从原卡片中删除这些评论？`,
          0,
          "保留原评论",
          ["删除原评论"],
          (alert, buttonIndex) => {
            if (buttonIndex === 1) {
              // 用户选择删除原评论
              MNUtil.undoGrouping(() => {
                try {
                  // 先清理被提取内容中链接对应卡片的反向链接（必须在删除前执行）
                  this.cleanupExtractedContentLinks(note, extractCommentIndexArr);
                  
                  // 然后使用批量删除 API
                  note.removeCommentsByIndexArr(extractCommentIndexArr);
                  
                  note.refresh();
                  MNUtil.showHUD("已删除原卡片中的评论并清理相关链接");
                  
                } catch (error) {
                  MNUtil.showHUD("删除原评论失败: " + error.message);
                  MNUtil.addErrorLog(error, "performExtract.deleteOriginal", {noteId: note.noteId});
                }
              });
              
              // 询问是否制卡
              this.showMakeNoteDialog(clonedNote);
            } else {
              // 用户选择"保留原评论"
              // 询问是否制卡
              this.showMakeNoteDialog(clonedNote);
            }
          }
        );
      });
    }
  }

  /**
   * 显示制卡确认对话框
   * @param {MNNote} extractedNote - 提取出的卡片
   */
  static showMakeNoteDialog(extractedNote) {
    // 延迟显示对话框，确保前面的操作完成
    MNUtil.delay(0.3).then(() => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "制卡确认",
        "是否对提取的卡片进行制卡处理？",
        0,
        "取消",
        ["制卡"],
        (alert, buttonIndex) => {
          if (buttonIndex === 1) {
            // 用户选择制卡
            MNUtil.undoGrouping(() => {
              try {
                // 调用 knowledgeBaseTemplate.makeNote 进行制卡
                knowledgeBaseTemplate.makeNote(extractedNote, false);
                MNUtil.showHUD("制卡完成");
              } catch (error) {
                MNUtil.showHUD("制卡失败: " + error.message);
                MNUtil.addErrorLog(error, "showMakeNoteDialog", {noteId: extractedNote.noteId});
              }
            });
          }
          // 如果选择取消，则不做任何操作
        }
      );
    });
  }

  /**
   * 处理提取卡片的链接关系继承
   * @param {MNNote} originalNote - 原卡片 A
   * @param {MNNote} extractedNote - 提取出的卡片 B
   * @param {number[]} extractCommentIndexArr - 被提取的评论索引数组
   */
  static handleExtractedNoteLinks(originalNote, extractedNote, extractCommentIndexArr) {
    try {
      // 1. 解析提取卡片 B 中的所有评论
      const extractedComments = extractedNote.MNComments;
      
      // 2. 遍历所有评论，查找链接类型的评论
      for (let i = 0; i < extractedComments.length; i++) {
        const comment = extractedComments[i];
        
        if (comment && comment.type === "linkComment") {
          // 获取链接到的卡片 C
          const linkedNote = MNNote.new(comment.text);
          
          if (linkedNote) {
            // 3. 检查 C 中是否有 A 的链接
            const linkedNoteComments = linkedNote.MNComments;
            let aLinkIndexInC = -1;
            
            for (let j = 0; j < linkedNoteComments.length; j++) {
              const cComment = linkedNoteComments[j];
              if (cComment && cComment.type === "linkComment") {
                const cLinkedNote = MNNote.new(cComment.text);
                if (cLinkedNote && cLinkedNote.noteId === originalNote.noteId) {
                  aLinkIndexInC = j;
                  break;
                }
              }
            }
            
            // 4. 如果 C 中有 A 的链接
            if (aLinkIndexInC !== -1) {
              // 在 C 中创建指向 B 的单向链接
              linkedNote.appendNoteLink(extractedNote, "To");
              
              // 获取新创建的链接索引（应该是最后一个）
              const newLinkIndex = linkedNote.comments.length - 1;
              
              // 将新链接移动到 A 链接的下方
              if (newLinkIndex !== aLinkIndexInC + 1) {
                linkedNote.moveComment(newLinkIndex, aLinkIndexInC + 1);
              }
            }
          }
        }
      }
    } catch (error) {
      MNUtil.addErrorLog(error, "handleExtractedNoteLinks", {
        originalNoteId: originalNote.noteId,
        extractedNoteId: extractedNote.noteId
      });
      // 不抛出错误，让提取操作继续完成
    }
  }

  /**
   * 清理被提取内容中链接对应卡片的反向链接
   * 当用户选择删除原评论时调用，用于保持链接关系的一致性
   * 
   * @param {MNNote} originalNote - 原始卡片 A
   * @param {number[]} extractCommentIndexArr - 被提取的评论索引数组
   */
  static cleanupExtractedContentLinks(originalNote, extractCommentIndexArr) {
    try {
      const originalComments = originalNote.MNComments;
      
      // 遍历被提取的评论索引
      for (const index of extractCommentIndexArr) {
        const comment = originalComments[index];
        
        // 检查是否为链接评论
        if (comment && comment.type === "linkComment") {
          // 获取链接指向的卡片
          const linkedNote = MNNote.new(comment.text);
          
          if (linkedNote) {
            // 解析链接卡片的结构
            const commentsObj = this.parseNoteComments(linkedNote);
            const htmlCommentsArr = commentsObj.htmlCommentsObjArr;
            
            if (htmlCommentsArr.length > 0) {
              // 获取最后一个字段
              const lastField = htmlCommentsArr[htmlCommentsArr.length - 1];
              const fieldIndices = lastField.excludingFieldBlockIndexArr;
              
              // 准备要删除的索引
              const indicesToRemove = [];
              const originalNoteUrl = originalNote.noteId.toNoteURL();
              
              // 检查最后字段中的每个评论
              for (const fieldIndex of fieldIndices) {
                const fieldComment = linkedNote.MNComments[fieldIndex];
                
                if (fieldComment && fieldComment.type === "linkComment") {
                  // 检查是否指向原卡片 A
                  const linkedNoteInField = MNNote.new(fieldComment.text);
                  if (linkedNoteInField && linkedNoteInField.noteId === originalNote.noteId) {
                    indicesToRemove.push(fieldIndex);
                  }
                }
              }
              
              // 从大到小排序并删除
              if (indicesToRemove.length > 0) {
                indicesToRemove.sort((a, b) => b - a);
                for (const indexToRemove of indicesToRemove) {
                  linkedNote.removeCommentByIndex(indexToRemove);
                }
                linkedNote.refresh();
              }
            }
          }
        }
      }
    } catch (error) {
      MNUtil.addErrorLog(error, "cleanupExtractedContentLinks", {
        originalNoteId: originalNote.noteId
      });
      // 不抛出错误，让主流程继续
    }
  }

  /**
   * 拆分评论为独立卡片
   * 将包含多条评论的卡片拆分成多张独立卡片，每张卡片只保留一条评论
   * @param {MNNote} note - 要拆分的卡片
   */
  static splitComments(note) {
    // 检查评论数量
    if (!note || note.comments.length < 2) {
      MNUtil.showHUD("卡片评论少于2条，无需拆分");
      return;
    }
    
    const parentNote = note.parentNote;
    const commentCount = note.comments.length;
    
    MNUtil.undoGrouping(() => {
      try {
        // 克隆 n-1 张卡片
        const clonedNotes = [];
        for (let i = 1; i < commentCount; i++) {
          const clonedNote = note.clone();
          clonedNote.title = "";
          
          // 删除克隆卡片的子卡片
          if (clonedNote.childNotes && clonedNote.childNotes.length > 0) {
            for (let j = clonedNote.childNotes.length - 1; j >= 0; j--) {
              clonedNote.childNotes[j].removeFromParent();
            }
          }
          
          // 只保留第 i 条评论
          const indicesToDelete = [];
          for (let j = 0; j < clonedNote.comments.length; j++) {
            if (j !== i) {
              indicesToDelete.push(j);
            }
          }
          indicesToDelete.sort((a, b) => b - a);
          clonedNote.removeCommentsByIndexArr(indicesToDelete);
          
          // 添加到父卡片（如果有父卡片）或作为原卡片的兄弟节点
          if (parentNote) {
            parentNote.addChild(clonedNote);
          } else {
            note.addChild(clonedNote);
          }
          
          clonedNotes.push(clonedNote);
        }
        
        // 原卡片只保留第一条评论
        const originalIndicesToDelete = [];
        for (let i = 1; i < note.comments.length; i++) {
          originalIndicesToDelete.push(i);
        }
        originalIndicesToDelete.sort((a, b) => b - a);
        note.removeCommentsByIndexArr(originalIndicesToDelete);
        
        // 刷新显示
        note.refresh();
        clonedNotes.forEach(n => n.refresh());
        
        MNUtil.showHUD(`✅ 成功拆分为 ${commentCount} 张卡片`);
        
        // 聚焦第一张克隆的卡片（可选）
        if (clonedNotes.length > 0) {
          MNUtil.delay(0.3).then(() => {
            MNUtil.focusNoteInMindMapById(clonedNotes[0].noteId, 0.3);
          });
        }
        
      } catch (error) {
        MNUtil.showHUD("拆分失败: " + error.message);
        MNUtil.addErrorLog(error, "splitComments", {noteId: note.noteId});
      }
    });
  }

  /**
   * 获得一个基于 htmlCommentsTextArr 的数组专门用于移动评论
   * 
   * 摘录区也是放在这个地方处理
   * 过滤掉包含"关键词"的字段
   * 包含 HtmlMarkdown 评论作为可展开选项
   */
  static getHtmlCommentsTextArrForPopup(note) {
    const parsedComments = this.parseNoteComments(note);
    const htmlCommentsObjArr = parsedComments.htmlCommentsObjArr;
    const htmlMarkdownCommentsObjArr = parsedComments.htmlMarkdownCommentsObjArr;
    
    let htmlCommentsTextArrForMove = [
      "🔝🔝🔝🔝卡片最顶端🔝🔝🔝🔝",
      "----------【摘录区】----------",
    ];
    
    // 过滤掉包含"关键词"的字段
    let filteredHtmlCommentsObjArr = htmlCommentsObjArr.filter(obj => !obj.text.includes("关键词"));
    
    // 构建一个包含字段和 HtmlMarkdown 评论的综合数组，按索引排序
    let allStructuralElements = [];
    
    // 添加字段
    filteredHtmlCommentsObjArr.forEach(field => {
      allStructuralElements.push({
        type: 'field',
        index: field.index,
        text: field.text,
        obj: field
      });
    });
    
    // 添加 HtmlMarkdown 评论
    htmlMarkdownCommentsObjArr.forEach(mdComment => {
      allStructuralElements.push({
        type: 'htmlMarkdown',
        index: mdComment.index,
        obj: mdComment
      });
    });
    
    // 按索引排序
    allStructuralElements.sort((a, b) => a.index - b.index);
    
    // 构建显示选项
    for (let i = 0; i < allStructuralElements.length; i++) {
      const element = allStructuralElements[i];
      
      if (element.type === 'field') {
        // 如果是原始列表中的最后一个字段，跳过
        let originalIndex = htmlCommentsObjArr.findIndex(obj => obj.index === element.obj.index);
        let lastOriginalIndex = htmlCommentsObjArr.length - 1;
        if (originalIndex === lastOriginalIndex) continue;
        
        let text = element.text.trim();
        htmlCommentsTextArrForMove.push(
          "----------【"+ text +"区】----------"
        );
        htmlCommentsTextArrForMove.push("🔝 Top 🔝");
        htmlCommentsTextArrForMove.push("⬇️ Bottom ⬇️");
        
      } else if (element.type === 'htmlMarkdown') {
        // HtmlMarkdown 评论不在第二层显示
        // 它们会在点击字段区域后的第三层显示
        continue;
      }
    }

    htmlCommentsTextArrForMove.push("⬇️⬇️⬇️⬇️ 卡片最底端 ⬇️⬇️⬇️⬇️");

    return htmlCommentsTextArrForMove;
  }
  /**
   * 获取 getHtmlCommentsTextArrForPopup 获得的数组所对应要移动的 Index 构成的数组
   * 
   * 必须与 getHtmlCommentsTextArrForPopup 的逻辑完全对应
   */
  static getCommentsIndexArrToMoveForPopup(note) {
    const parsedComments = this.parseNoteComments(note);
    const htmlCommentsObjArr = parsedComments.htmlCommentsObjArr;
    const htmlMarkdownCommentsObjArr = parsedComments.htmlMarkdownCommentsObjArr;
    
    let commentsIndexArrToMove = [
      0,  // 对应："🔝🔝🔝🔝卡片最顶端 🔝🔝🔝🔝"
    ];
    
    // 摘录区
    let excerptBlockIndexArr = this.getExcerptBlockIndexArr(note);
    if (excerptBlockIndexArr.length == 0) {
      commentsIndexArrToMove.push(0); // 对应："----------【摘录区】----------"
    } else {
      commentsIndexArrToMove.push(excerptBlockIndexArr[excerptBlockIndexArr.length - 1] + 1);
    }
    
    // 过滤掉包含"关键词"的字段
    let filteredHtmlCommentsObjArr = htmlCommentsObjArr.filter(obj => !obj.text.includes("关键词"));
    
    // 构建综合数组（与 getHtmlCommentsTextArrForPopup 保持一致）
    let allStructuralElements = [];
    
    filteredHtmlCommentsObjArr.forEach(field => {
      allStructuralElements.push({
        type: 'field',
        index: field.index,
        text: field.text,
        obj: field
      });
    });
    
    htmlMarkdownCommentsObjArr.forEach(mdComment => {
      allStructuralElements.push({
        type: 'htmlMarkdown',
        index: mdComment.index,
        obj: mdComment
      });
    });
    
    allStructuralElements.sort((a, b) => a.index - b.index);
    
    // 构建索引数组
    for (let i = 0; i < allStructuralElements.length; i++) {
      const element = allStructuralElements[i];
      
      if (element.type === 'field') {
        // 检查是否是最后一个字段
        let originalIndex = htmlCommentsObjArr.findIndex(obj => obj.index === element.obj.index);
        let lastOriginalIndex = htmlCommentsObjArr.length - 1;
        if (originalIndex === lastOriginalIndex) continue;
        
        // 找到下一个字段的索引
        let nextFieldIndex;
        if (originalIndex + 1 < htmlCommentsObjArr.length) {
          nextFieldIndex = htmlCommentsObjArr[originalIndex + 1].index;
        } else {
          nextFieldIndex = note.comments.length;
        }
        
        commentsIndexArrToMove.push(nextFieldIndex); // 对应："----------【xxx区】----------"
        commentsIndexArrToMove.push(element.obj.index + 1); // 对应："🔝 Top 🔝"
        commentsIndexArrToMove.push(nextFieldIndex); // 对应："⬇️ Bottom ⬇️"
        
      } else if (element.type === 'htmlMarkdown') {
        // HtmlMarkdown 评论不在第二层显示，不需要添加索引
        continue;
      }
    }

    commentsIndexArrToMove.push(note.comments.length); // 对应："⬇️⬇️⬇️⬇️ 卡片最底端 ⬇️⬇️⬇️⬇️"

    return commentsIndexArrToMove;
  }

  /**
   * 自动获取新内容并移动到指定字段
   * 
   * 此函数是 moveCommentsArrToField 的优化版本，自动获取要移动的内容索引
   * 并将其移动到指定字段下。适用于快速整理新添加的内容。
   * 
   * @param {MNNote} note - 要操作的笔记对象
   * @param {string} field - 目标字段名称（支持"摘录"/"摘录区"作为特殊字段）
   * @param {boolean} [toBottom=true] - 是否移动到字段底部，false 则移动到字段顶部
   * @param {boolean} [showEmptyHUD=true] - 当没有可移动内容时是否显示提示
   * @returns {Array<number>} 返回已移动的评论索引数组
   * 
   * @example
   * // 将新内容移动到"证明"字段底部
   * knowledgeBaseTemplate.autoMoveNewContentToField(note, "证明");
   * 
   * @example
   * // 将新内容移动到"相关思考"字段顶部，不显示空内容提示
   * let movedIndices = knowledgeBaseTemplate.autoMoveNewContentToField(note, "相关思考", false, false);
   * if (movedIndices.length > 0) {
   *   MNUtil.showHUD(`成功移动 ${movedIndices.length} 条内容`);
   * }
   * 
   * @example
   * // 将新内容移动到摘录区
   * knowledgeBaseTemplate.autoMoveNewContentToField(note, "摘录区");
   */
  static autoMoveNewContentToField(note, field, toBottom = true, showEmptyHUD = true) {
    // 自动获取要移动的内容索引
    let indexArr = this.autoGetNewContentToMoveIndexArr(note);
    
    // 检查是否有内容需要移动
    if (indexArr.length === 0) {
      if (showEmptyHUD) {
        MNUtil.showHUD("没有检测到可移动的新内容");
      }
      return [];
    }
    
    // 检查目标字段是否存在
    let fieldExists = false;
    
    // 特殊处理摘录区
    if (field === "摘录" || field === "摘录区") {
      fieldExists = true;  // 摘录区始终存在
    } else {
      // 检查 HTML 字段
      let htmlCommentsTextArr = this.parseNoteComments(note).htmlCommentsTextArr;
      fieldExists = htmlCommentsTextArr.some(text => text.includes(field));
    }
    
    if (!fieldExists) {
      MNUtil.showHUD(`未找到字段"${field}"，请检查字段名称`);
      return [];
    }
    
    // 执行移动操作
    this.moveCommentsArrToField(note, indexArr, field, toBottom);
    
    return indexArr;
  }

  /**
   * 根据卡片类型自动获取新内容并移动到相应字段
   * 
   * 此函数基于 autoMoveNewContentToField，会根据卡片类型自动确定目标字段。
   * 是最智能的内容整理方法，无需手动指定字段。
   * 
   * @param {MNNote} note - 要操作的笔记对象  
   * @param {boolean} [toBottom=true] - 是否移动到字段底部，false 则移动到字段顶部
   * @param {boolean} [showEmptyHUD=true] - 当没有可移动内容时是否显示提示
   * @returns {{field: string, indices: Array<number>}} 返回目标字段和已移动的评论索引数组
   * 
   * @example
   * // 自动根据卡片类型移动内容
   * let result = knowledgeBaseTemplate.autoMoveNewContentByType(note);
   * if (result.indices.length > 0) {
   *   MNUtil.showHUD(`已将 ${result.indices.length} 条内容移动到"${result.field}"字段`);
   * }
   * 
   * @example  
   * // 移动到字段顶部，不显示空内容提示
   * knowledgeBaseTemplate.autoMoveNewContentByType(note, false, false);
   */
  static autoMoveNewContentByType(note, toBottom = true, showEmptyHUD = true) {
    // 根据卡片类型确定目标字段
    let noteType = this.getNoteType(note);
    let field = this.getDefaultFieldForType(noteType);
    
    if (!field) {
      if (showEmptyHUD) {
        MNUtil.showHUD(`未识别的卡片类型：${noteType || "空"}`);
      }
      return {field: "", indices: []};
    }
    
    // 执行移动操作
    let indices = this.autoMoveNewContentToField(note, field, toBottom, showEmptyHUD);
    
    return {field: field, indices: indices};
  }

  /**
   * 移动内容到摘录区
   * 
   * 专门用于将内容移动到卡片最上方的摘录区域的便捷方法
   * 
   * @param {MNNote} note - 要操作的笔记对象
   * @param {Array|string} indexArr - 要移动的评论索引数组或字符串
   * @returns {boolean} 是否成功移动
   * 
   * @example
   * // 移动指定索引的内容到摘录区
   * knowledgeBaseTemplate.moveToExcerptArea(note, [1,2,3]);
   * 
   * @example
   * // 使用字符串格式
   * knowledgeBaseTemplate.moveToExcerptArea(note, "1-3,5");
   */
  static moveToExcerptArea(note, indexArr) {
    try {
      this.moveCommentsArrToField(note, indexArr, "摘录区", true);
      return true;
    } catch (error) {
      MNUtil.showHUD(`移动到摘录区失败: ${error.message || error}`);
      return false;
    }
  }

  /**
   * 移动评论到指定字段
   * 
   * @param {MNNote} note - 要操作的笔记对象
   * @param {Array|string} indexArr - 要移动的评论索引数组或字符串（支持 "1,3-5,Y,Z" 格式）
   * @param {string} field - 目标字段名称。特殊字段：
   *                         - "摘录" 或 "摘录区" - 移动到卡片最上方的摘录区域
   *                         - 其他字段名 - 移动到对应的 HTML 字段下
   * @param {boolean} [toBottom=true] - 是否移动到字段底部，false 则移动到字段顶部（摘录区除外）
   * 
   * @example
   * // 移动到摘录区
   * knowledgeBaseTemplate.moveCommentsArrToField(note, [1,2,3], "摘录区");
   * 
   * @example  
   * // 移动到"证明"字段顶部
   * knowledgeBaseTemplate.moveCommentsArrToField(note, "1-3", "证明", false);
   */
  static moveCommentsArrToField(note, indexArr, field, toBottom = true) {
    let getHtmlCommentsTextArrForPopup = this.getHtmlCommentsTextArrForPopup(note);
    let commentsIndexArrToMove = this.getCommentsIndexArrToMoveForPopup(note);

    let targetIndex = -1
    
    // 标准化字段名称，支持"摘录"和"摘录区"的简写
    let normalizedField = field;
    if (field === "摘录" || field === "摘录区") {
      normalizedField = "摘录区";  // 统一为"摘录区"以匹配"----------【摘录区】----------"
    }
    
    getHtmlCommentsTextArrForPopup.forEach((text, index) => {
      if (text.includes(normalizedField)) {
        if (toBottom) {
          targetIndex = commentsIndexArrToMove[index]
        } else {
          targetIndex = commentsIndexArrToMove[index+1]  // 注意这里的 Arr 是因为 commentsIndexArrToMove 里的内容是 xx 区+top+bottom 组合
        }
      }
    })

    if (targetIndex === -1) {
      // 此时要判断是否是最后一个字段，因为最后一个字段没有弄到弹窗里，所以上面的处理排除了最后一个字段
      let htmlCommentsTextArr = this.parseNoteComments(note).htmlCommentsTextArr;
      if (htmlCommentsTextArr.length>0) {
        if (htmlCommentsTextArr[htmlCommentsTextArr.length - 1].includes(field)) {
          if (toBottom) {
            targetIndex = note.comments.length; // 移动到卡片最底端
          } else {
            // 获取最后一个字段的 index
            let htmlCommentsObjArr = this.parseNoteComments(note).htmlCommentsObjArr;
            targetIndex = htmlCommentsObjArr[htmlCommentsObjArr.length - 1].index + 1; // 移动到最后一个字段的下方
          }
        }
      }
    }
    let arr = []
    if (targetIndex !== -1) {
      // 如果是字符串就处理为数组
      if (typeof indexArr === "string") {
        arr = indexArr.parseCommentIndices(note.comments.length);
      } else {
        arr = indexArr;
      }
      note.moveCommentsByIndexArr(arr, targetIndex)
    }
  }


  /**
   * 通过弹窗选择并替换字段内容
   * 删除字段A下的内容，并将字段B下的内容或自动获取的新内容移动到字段A下方
   */
  static replaceFieldContentByPopup(note) {
    let htmlCommentsTextArr = this.parseNoteComments(note).htmlCommentsTextArr;
    
    if (htmlCommentsTextArr.length < 1) {
      MNUtil.showHUD("需要至少一个字段才能执行替换操作");
      return;
    }

    // 创建字段选择菜单
    let fieldOptions = htmlCommentsTextArr.map(text => text.trim());
    
    // 第一个弹窗：选择目标字段
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择目标字段",
      "选择要被替换内容的字段",
      0,  // 普通样式
      "取消",
      fieldOptions,
      (_, buttonIndex) => {
        if (buttonIndex === 0) return; // 用户取消
        
        let fieldA = fieldOptions[buttonIndex - 1]; // buttonIndex从1开始
        
        // 创建内容来源选择菜单
        let sourceOptions = ["自动获取新内容"];
        
        // 添加其他字段作为选项（排除已选的目标字段）
        let otherFields = fieldOptions.filter((_, index) => index !== buttonIndex - 1);
        sourceOptions = sourceOptions.concat(otherFields.map(field => `来自字段：${field}`));
        
        // 第二个弹窗：选择内容来源
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "选择内容来源",
          `选择要移动到"${fieldA}"字段下的内容来源`,
          0,  // 普通样式
          "取消",
          sourceOptions,
          (_, buttonIndexB) => {
            if (buttonIndexB === 0) return; // 用户取消
            
            if (buttonIndexB === 1) {
              // 选择了"自动获取新内容"
              this.replaceFieldContentWithAutoContent(note, fieldA);
            } else {
              // 选择了某个字段
              let fieldB = otherFields[buttonIndexB - 2]; // 减去"自动获取新内容"选项
              this.replaceFieldContent(note, fieldA, fieldB);
            }
          }
        );
      }
    );
  }

  /**
   * 使用自动获取的新内容替换字段内容
   * @param {MNNote} note - 目标笔记
   * @param {string} fieldA - 目标字段名称
   */
  static replaceFieldContentWithAutoContent(note, fieldA) {
    let commentsObj = this.parseNoteComments(note);
    let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    
    if (htmlCommentsObjArr.length === 0) {
      MNUtil.showHUD("未找到字段结构");
      return;
    }

    // 通过字段名称找到对应的字段对象
    let fieldAObj = htmlCommentsObjArr.find(obj => obj.text.includes(fieldA));
    
    if (!fieldAObj) {
      MNUtil.showHUD(`无法找到字段"${fieldA}"`);
      return;
    }
    
    // 获取自动识别的新内容索引
    let autoContentIndices = this.autoGetNewContentToMoveIndexArr(note);
    
    if (autoContentIndices.length === 0) {
      MNUtil.showHUD("没有检测到可移动的新内容");
      return;
    }
    
    // 获取字段A下的内容索引（不包括字段标题本身）
    let fieldAContentIndices = fieldAObj.excludingFieldBlockIndexArr;
    
    // 先删除字段A下的内容（从后往前删除，避免索引变化）
    if (fieldAContentIndices.length > 0) {
      let sortedFieldAIndices = fieldAContentIndices.sort((a, b) => b - a);
      sortedFieldAIndices.forEach(index => {
        note.removeCommentByIndex(index);
      });
    }
    
    // 重新解析评论结构（因为删除操作改变了索引）
    commentsObj = this.parseNoteComments(note);
    htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    
    // 重新获取自动内容索引（索引可能已经改变）
    autoContentIndices = this.autoGetNewContentToMoveIndexArr(note);
    
    if (autoContentIndices.length === 0) {
      MNUtil.showHUD("删除原内容后，没有检测到可移动的新内容");
      return;
    }
    
    // 移动自动获取的内容到字段A下方
    this.moveCommentsArrToField(note, autoContentIndices, fieldA, true);
    
    // 刷新卡片显示
    MNUtil.undoGrouping(()=>{
      note.refresh();
    })
    
    // MNUtil.showHUD(`已将自动获取的新内容移动到"${fieldA}"字段下，并删除了原有内容`);
  }

  /**
   * 替换字段内容的核心方法
   * @param {MNNote} note - 目标笔记
   * @param {string} fieldA - 目标字段名称
   * @param {string} fieldB - 源字段名称
   */
  static replaceFieldContent(note, fieldA, fieldB) {
    let commentsObj = this.parseNoteComments(note);
    let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    
    if (htmlCommentsObjArr.length === 0) {
      MNUtil.showHUD("未找到字段结构");
      return;
    }

    // 通过字段名称找到对应的字段对象
    let fieldAObj = htmlCommentsObjArr.find(obj => obj.text.includes(fieldA));
    let fieldBObj = htmlCommentsObjArr.find(obj => obj.text.includes(fieldB));
    
    if (!fieldAObj) {
      MNUtil.showHUD(`无法找到字段"${fieldA}"`);
      return;
    }
    
    if (!fieldBObj) {
      MNUtil.showHUD(`无法找到字段"${fieldB}"`);
      return;
    }
    
    // 获取字段A下的内容索引（不包括字段标题本身）
    let fieldAContentIndices = fieldAObj.excludingFieldBlockIndexArr;
    
    // 获取字段B下的内容索引（不包括字段标题本身）
    let fieldBContentIndices = fieldBObj.excludingFieldBlockIndexArr;
    
    if (fieldBContentIndices.length === 0) {
      MNUtil.showHUD(`字段"${fieldB}"下没有内容可移动`);
      return;
    }
    
    // 先删除字段A下的内容（从后往前删除，避免索引变化）
    if (fieldAContentIndices.length > 0) {
      let sortedFieldAIndices = fieldAContentIndices.sort((a, b) => b - a);
      sortedFieldAIndices.forEach(index => {
        note.removeCommentByIndex(index);
      });
    }
    
    // 重新解析评论结构（因为删除操作改变了索引）
    commentsObj = this.parseNoteComments(note);
    htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    
    // 重新获取字段B的内容（索引可能已经改变）
    fieldBObj = htmlCommentsObjArr.find(obj => obj.text.includes(fieldB));
    if (!fieldBObj) {
      MNUtil.showHUD(`无法找到字段"${fieldB}"`);
      return;
    }
    
    fieldBContentIndices = fieldBObj.excludingFieldBlockIndexArr;
    
    if (fieldBContentIndices.length === 0) {
      MNUtil.showHUD(`字段"${fieldB}"下没有内容可移动`);
      return;
    }
    
    // 移动字段B的内容到字段A下方
    this.moveCommentsArrToField(note, fieldBContentIndices, fieldA, true);
    
    // 刷新卡片显示
    MNUtil.undoGrouping(()=>{
      note.refresh();
    })
    
    // MNUtil.showHUD(`已将"${fieldB}"字段的内容移动到"${fieldA}"字段下，并删除了"${fieldA}"原有内容`);
  }
  
  /**
   * 删除根卡片下所有归类卡片，保留非归类卡片
   * 
   * 该函数会遍历根卡片的所有子孙卡片，将归类卡片删除，
   * 同时将归类卡片下的非归类子孙卡片提升到根卡片下。
   * 
   * 工作流程：
   * 1. 遍历根卡片的每个直接子卡片
   * 2. 如果是归类卡片，深度优先搜索其子孙卡片
   * 3. 找到第一个非归类卡片后，将其移动到根卡片下
   * 4. 最后删除所有归类卡片链
   * 
   * @param {MNNote} rootNote - 根卡片，其子孙中的归类卡片将被删除
   * @returns {void}
   * 
   * @example
   * // 假设有如下结构：
   * // A (根卡片)
   * // ├── 归类1
   * // │   ├── 归类1.1
   * // │   │   └── 知识点1
   * // │   └── 知识点2
   * // └── 归类2
   * //     └── 知识点3
   * 
   * let rootNote = MNNote.getFocusNote();
   * knowledgeBaseTemplate.removeAllClassificationNotes(rootNote);
   * 
   * // 执行后结构变为：
   * // A (根卡片)
   * // ├── 知识点1
   * // ├── 知识点2
   * // └── 知识点3
   */
  static removeAllClassificationNotes(rootNote) {
    // 参数检查
    if (!rootNote) {
      MNUtil.showHUD("请先选择一个根卡片", 2);
      return;
    }
    
    // 获取所有直接子卡片
    const childNotes = rootNote.childNotes || [];
    if (childNotes.length === 0) {
      MNUtil.showHUD("根卡片没有子卡片", 2);
      return;
    }
    
    // 记录需要删除的归类卡片和需要保留的非归类卡片
    const classificationNotesToDelete = [];
    const nonClassificationNotesToKeep = [];
    
    /**
     * 深度优先搜索，找到归类卡片链中的所有非归类卡片
     * @param {MNNote} note - 当前处理的卡片
     * @param {Array} result - 收集的非归类卡片数组
     */
    function findNonClassificationNotes(note, result) {
      if (!note || !note.childNotes) return;
      
      for (const child of note.childNotes) {
        if (knowledgeBaseTemplate.isClassificationNote(child)) {
          // 如果是归类卡片，继续递归搜索
          findNonClassificationNotes(child, result);
        } else {
          // 找到非归类卡片，添加到结果中
          // 注意：这里只添加卡片本身，其子孙会跟着一起移动
          result.push(child);
        }
      }
    }
    
    // 第一步：分析每个直接子卡片
    for (const childNote of childNotes) {
      if (knowledgeBaseTemplate.isClassificationNote(childNote)) {
        // 记录归类卡片以便后续删除
        classificationNotesToDelete.push(childNote);
        
        // 搜索该归类卡片下的所有非归类卡片
        const nonClassificationInBranch = [];
        findNonClassificationNotes(childNote, nonClassificationInBranch);
        
        // 记录找到的非归类卡片
        nonClassificationNotesToKeep.push(...nonClassificationInBranch);
      }
      // 如果不是归类卡片，保持原样（已经是根卡片的子卡片）
    }
    
    // 如果没有找到任何归类卡片
    if (classificationNotesToDelete.length === 0) {
      MNUtil.showHUD("没有找到归类卡片", 2);
      return;
    }
    
    // 使用 undoGrouping 包装所有操作，使其可以一次撤销
    MNUtil.undoGrouping(() => {
      try {
        // 第二步：将所有非归类卡片移动到根卡片下
        for (const note of nonClassificationNotesToKeep) {
          // 使用 addChild 将卡片移动到根卡片下
          // 这会自动处理从原父卡片移除的操作
          rootNote.addChild(note);
        }
        
        // 第三步：删除所有归类卡片（及其剩余的子孙归类卡片）
        for (const classificationNote of classificationNotesToDelete) {
          // 使用 delete(true) 删除整个子树
          classificationNote.delete(true);
        }
        
        // 刷新根卡片显示
        rootNote.refresh();
        
        // 显示操作结果
        const message = `已删除 ${classificationNotesToDelete.length} 个归类卡片，保留了 ${nonClassificationNotesToKeep.length} 个知识点卡片`;
        MNUtil.showHUD(message, 2);
        
      } catch (error) {
        MNUtil.copyJSON(error);
        MNUtil.showHUD("操作失败：" + error.message, 3);
      }
    });
  }
  
  /**
   * 获取 Note 的摘录区的 indexArr
   */
  static getExcerptBlockIndexArr(note) {
    let indexArr = []
    let endIndex = this.parseNoteComments(note).htmlCommentsObjArr[0]?.index? this.parseNoteComments(note).htmlCommentsObjArr[0].index : -1;
    switch (endIndex) {
      case 0:
        break;
      case -1: // 此时没有 html 评论
        for (let i = 0; i < note.comments.length-1; i++) {
          let comment = note.MNComments[i]
          if (i == 0) {
            if (comment.type == "mergedImageComment") {
              indexArr.push(i)
            } else {
              return []
            }
          } else {
            // 要保持连续
            if (comment.type == "mergedImageComment" && note.MNComments[i-1].type == "mergedImageComment") {
              indexArr.push(i)
            }
          }
        }
        break;
      default:
        for (let i = 0; i < endIndex; i++) {
          let comment = note.MNComments[i]
          if (comment.type == "mergedImageComment") {
            indexArr.push(i)
          }
        }
        break;
    }

    return indexArr
  }
  /**
   * 获取包含某段文本的 HtmlComment 的 Block
   */
  static getHtmlCommentIncludingFieldBlockIndexArr(note, text) {
    let commentsObj = this.parseNoteComments(note);
    let indexArr = []
    commentsObj.htmlCommentsObjArr.forEach(htmlComment => {
      if (htmlComment.text.includes(text)) {
        indexArr = htmlComment.includingFieldBlockIndexArr;
      }
    })
    return indexArr
  }
  static getHtmlCommentExcludingFieldBlockIndexArr(note, text) {
    let commentsObj = this.parseNoteComments(note);
    let indexArr = []
    commentsObj.htmlCommentsObjArr.forEach(htmlComment => {
      if (htmlComment.text.includes(text)) {
        indexArr = htmlComment.excludingFieldBlockIndexArr;
      }
    })
    return indexArr
  }

  /**
   * 获得 Block 下方的第一个非链接到结尾的 IndexArr
   */
  static getHtmlBlockNonLinkContentIndexArr (note, text) {
    let indexArr = this.getHtmlCommentExcludingFieldBlockIndexArr(note, text)  // 这里不能用 including，否则字段的 htmlComment 本身就不是链接，就会被识别到
    let findNonLink = false
    if (indexArr.length !== 0) {
      // 从头开始遍历，检测是否是链接，直到找到第一个非链接就停止
      for (let i = 0; i < indexArr.length; i++) {
        let index = indexArr[i]
        let comment = note.MNComments[index]
        if (
          comment.type !== "linkComment"
        ) {
          // 不处理 # 开头的文本，因为这种文本一般是用作标题链接，不能被识别为新内容
          if (comment.text && comment.text.startsWith("#")) {
            continue
          }
          indexArr = indexArr.slice(i)
          findNonLink = true
          break
        }
      }
      if (!findNonLink) {
        // 只有链接时，仍然返回数组
        return []
      }
    }
    return indexArr
  }


  static addTemplate(note) {
    let type
    let contentInTitle
    let titleParts = this.parseNoteTitle(note)
    switch (this.getNoteType(note)) {
      case "归类":
        contentInTitle = titleParts.content
        break;
      default:
        contentInTitle = titleParts.prefixContent + "｜" + titleParts.titleLinkWordsArr[0];
        break;
    }
    MNUtil.copy(contentInTitle)
    try {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "增加模板",
        // "请输入标题并选择类型\n注意向上下层添加模板时\n标题是「增量」输入",
        "请输入标题并选择类型",
        2,
        "取消",
        // ["向下层增加模板", "增加概念衍生层级","增加兄弟层级模板","向上层增加模板", "最顶层（淡绿色）", "专题"],
        [
          "连续向下「顺序」增加模板",  // 1
          "连续向下「倒序」增加模板",  // 2
          "增加兄弟层级模板",  // 3
          "向上层增加模板",  // 4
        ],
        (alert, buttonIndex) => {
          let userInputTitle = alert.textFieldAtIndex(0).text;
          switch (buttonIndex) {
            case 4:
              try {
                /* 向上增加模板 */
                
                // 获取当前卡片类型和父卡片
                let noteType = this.parseNoteTitle(note).type
                let parentNote = note.parentNote
                
                if (!noteType) {
                  MNUtil.showHUD("无法识别当前卡片类型");
                  return;
                }
                
                // 智能识别类型（仅用于标题）
                let intelligentType = this.getTypeFromInputText(userInputTitle);
                let titleType = intelligentType || noteType;  // 标题中显示的类型
                let templateNoteId = this.types["归类"].templateNoteId;  // 始终使用归类模板
                
                MNUtil.undoGrouping(() => {
                  // 1. 创建新的归类卡片
                  let newClassificationNote = MNNote.clone(templateNoteId);
                  newClassificationNote.note.noteTitle = `“${userInputTitle}”相关${titleType}`;
                  
                  // 3. 建立层级关系：新卡片作为父卡片的子卡片
                  parentNote.addChild(newClassificationNote.note);
                  
                  // 4. 移动选中卡片：从原位置移动到新卡片下
                  newClassificationNote.addChild(note.note);
                  
                  // 5. 使用 this API 处理链接关系
                  this.linkParentNote(newClassificationNote);
                  this.linkParentNote(note);
                  
                  // 6. 聚焦到新创建的卡片
                  MNUtil.delay(0.5).then(() => {
                    newClassificationNote.focusInMindMap();
                  });
                });
                
              } catch (error) {
                MNUtil.showHUD(`向上增加模板失败: ${error.message || error}`);
              }
              break;
            case 3:
              // 增加兄弟层级模板
              type = this.parseNoteTitle(note).type
              if (type) {
                // 智能识别类型（仅用于标题）
                let intelligentType = this.getTypeFromInputText(userInputTitle);
                let titleType = intelligentType || type;  // 标题中显示的类型
                
                // 分割输入，支持通过//创建多个兄弟卡片链
                let titlePartsArray = userInputTitle.split("//")
                
                MNUtil.undoGrouping(()=>{
                  let lastNote = null
                  
                  // 创建第一个兄弟卡片（始终使用归类模板）
                  let firstNote = MNNote.clone(this.types["归类"].templateNoteId)
                  firstNote.noteTitle = "“" + titlePartsArray[0] + "”相关" + titleType
                  note.parentNote.addChild(firstNote.note)
                  this.linkParentNote(firstNote)
                  lastNote = firstNote
                  
                  // 如果有更多部分，创建子卡片链
                  let previousTitle = titlePartsArray[0]  // 记录上一个标题
                  for (let i = 1; i < titlePartsArray.length; i++) {
                    let childNote = MNNote.clone(this.types["归类"].templateNoteId)
                    // 累积标题：上一个标题 + 当前部分
                    let accumulatedTitle = previousTitle + titlePartsArray[i]
                    childNote.noteTitle = "“" + accumulatedTitle + "”相关" + titleType
                    lastNote.addChild(childNote.note)
                    this.linkParentNote(childNote)
                    lastNote = childNote
                    previousTitle = accumulatedTitle  // 更新上一个标题
                  }
                  
                  // 聚焦最后创建的卡片
                  lastNote.focusInMindMap(0.5)
                })
              }
              break
            case 2: // 连续向下「倒序」增加模板
              /**
               * 通过//来分割标题，增加一连串的归类卡片
               * 比如：赋范空间上的//有界//线性//算子
               * 依次增加：赋范空间上的算子、赋范空间上的线性算子、赋范空间上的有界线性算子
               */
              try {
                let titlePartsArray = userInputTitle.split("//")
                let titlesArray = []
                if (titlePartsArray.length > 1) {
                  // 生成倒序组合
                  // 把 item1+itemn, item1+itemn-1+itemn, item1+itemn-2+itemn-1+itemn, ... , item1+item2+item3+...+itemn 依次加入数组
                  // 比如 "赋范空间上的//有界//线性//算子" 得到的 titlePartsArray 是
                  // ["赋范空间上的", "有界", "线性", "算子"]
                  // 则 titleArray = ["赋范空间上的算子", "赋范空间上的线性算子", "赋范空间上的有界线性算子"]
                  const prefix = titlePartsArray[0];
                  let changedTitlePart = titlePartsArray[titlePartsArray.length-1]
                  for (let i = titlePartsArray.length-1 ; i >= 1 ; i--) {
                    if  (i < titlePartsArray.length-1) {
                      changedTitlePart = titlePartsArray[i] + changedTitlePart
                    }
                    titlesArray.push(prefix + changedTitlePart)
                  }
                }
                let type
                let lastNote = note
                switch (this.getNoteType(note)) {
                  case "归类":
                    let defaultType = this.parseNoteTitle(note).type  // 默认类型
                    MNUtil.undoGrouping(()=>{
                      titlesArray.forEach(title => {
                        // 对每个标题尝试智能识别
                        let intelligentType = this.getTypeFromInputText(title);
                        let finalType = intelligentType || defaultType;  // 优先使用智能识别的类型
                        let newClassificationNote = this.createClassificationNote(lastNote, title, finalType)
                        lastNote = newClassificationNote
                      })
                      lastNote.focusInMindMap(0.3)
                    })
                    break;
                  default:
                    // 智能识别类型
                    let intelligentType = this.getTypeFromInputText(userInputTitle);
                    if (intelligentType) {
                      type = intelligentType;
                      // 直接执行创建逻辑，无需弹窗选择
                      MNUtil.undoGrouping(() => {
                        titlesArray.forEach(title => {
                          let newClassificationNote = this.createClassificationNote(lastNote, title, type);
                          lastNote = newClassificationNote;
                        });
                        lastNote.focusInMindMap(0.3);
                      });
                    } else {
                      // 原有的弹窗选择逻辑
                      let typeArr = ["定义","命题","例子","反例","思想方法","问题"]
                      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
                        "增加归类卡片",
                        "选择类型",
                        0,
                        "取消",
                        typeArr,
                        (alert, buttonIndex) => {
                          if (buttonIndex == 0) { return }
                          type = typeArr[buttonIndex-1]
                          MNUtil.undoGrouping(()=>{
                            titlesArray.forEach(title => {
                            let newClassificationNote = this.createClassificationNote(lastNote, title, type)
                              lastNote = newClassificationNote
                            })
                            lastNote.focusInMindMap(0.3)
                          })
                        })
                    }
                    break;
                }
              } catch (error) {
                MNUtil.showHUD(`连续向下倒序增加模板失败: ${error.message || error}`);
              }
              break;
            case 1: // 连续向下「顺序」增加模板
              /**
               * 通过//来分割标题，增加一连串的归类卡片（顺序，与case2倒序不同）
               * 比如：赋范空间上的有界线性算子//的判定//：充分条件
               * -> 赋范空间上的有界线性算子、赋范空间上的有界线性算子的判定、赋范空间上的有界线性算子的判定：充分条件
               */
              try {
                let titlePartsArray = userInputTitle.split("//")
                let titlesArray = []
                titlesArray.push(titlePartsArray[0]) // 添加第一个部分
                if (titlePartsArray.length > 1) {
                  // 生成顺序组合
                  for (let i = 1; i < titlePartsArray.length; i++) {
                    titlesArray.push(titlesArray[i-1] + titlePartsArray[i])
                  }
                }
                let type
                let lastNote = note
                switch (this.getNoteType(note)) {
                  case "归类":
                    let defaultType = this.parseNoteTitle(note).type  // 默认类型
                    MNUtil.undoGrouping(()=>{
                      titlesArray.forEach(title => {
                        // 对每个标题尝试智能识别
                        let intelligentType = this.getTypeFromInputText(title);
                        let finalType = intelligentType || defaultType;  // 优先使用智能识别的类型
                        let newClassificationNote = this.createClassificationNote(lastNote, title, finalType)
                        lastNote = newClassificationNote
                      })
                      lastNote.focusInMindMap(0.3)
                    })
                    break;
                  default:
                    // 智能识别类型
                    let intelligentType = this.getTypeFromInputText(userInputTitle);
                    if (intelligentType) {
                      type = intelligentType;
                      // 直接执行创建逻辑，无需弹窗选择
                      MNUtil.undoGrouping(() => {
                        titlesArray.forEach(title => {
                          let newClassificationNote = this.createClassificationNote(lastNote, title, type);
                          lastNote = newClassificationNote;
                        });
                        lastNote.focusInMindMap(0.3);
                      });
                    } else {
                      // 原有的弹窗选择逻辑
                      let typeArr = ["定义","命题","例子","反例","思想方法","问题"]
                      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
                        "增加归类卡片",
                        "选择类型",
                        0,
                        "取消",
                        typeArr,
                        (alert, buttonIndex) => {
                          if (buttonIndex == 0) { return }
                          type = typeArr[buttonIndex-1]
                          MNUtil.undoGrouping(()=>{
                            titlesArray.forEach(title => {
                            let newClassificationNote = this.createClassificationNote(lastNote, title, type)
                              lastNote = newClassificationNote
                            })
                            lastNote.focusInMindMap(0.3)
                          })
                        })
                    }
                    break;
                }
              } catch (error) {
                MNUtil.showHUD(`连续向下顺序增加模板失败: ${error.message || error}`);
              }
              break;
          }
        }
      )
    } catch (error) {
      MNUtil.showHUD(error);
    }
  }


  static createClassificationNote(note, title, type) {
    let templateNote = MNNote.clone(this.types["归类"].templateNoteId);
    templateNote.noteTitle = `“${title}”相关${type}`;
    note.addChild(templateNote.note);
    this.linkParentNote(templateNote);
    return templateNote;
  }

  /**
   * 获取第一个标题链接词
   */
  static getFirstTitleLinkWord(note) {
    let titleParts = this.parseNoteTitle(note);
    if (titleParts.titleLinkWordsArr.length > 0) {
      return titleParts.titleLinkWordsArr[0];
    }
    return "";
  }

  /**
   * 加载链接词快捷短语配置
   * @returns {string[]} 快捷短语数组
   */
  static loadLinkPhrasesConfig() {
    try {
      const configKey = "knowledgeBaseTemplate_LinkPhrases";
      const defaultPhrases = [
        "作为特例"
      ];
      
      // 从 NSUserDefaults 加载
      const savedConfig = NSUserDefaults.standardUserDefaults().objectForKey(configKey);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          // 确保返回的是数组
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          // 解析失败，返回默认值
          MNUtil.log("Failed to parse saved link phrases config");
        }
      }
      
      // 如果没有保存的配置或解析失败，返回默认值并保存
      this.saveLinkPhrasesConfig(defaultPhrases);
      return defaultPhrases;
    } catch (error) {
      MNUtil.log("Error loading link phrases config: " + error.toString());
      return ["作为特例", "因此", "参见", "根据"];
    }
  }

  /**
   * 保存链接词快捷短语配置
   * @param {string[]} phrases - 快捷短语数组
   * @returns {boolean} 是否保存成功
   */
  static saveLinkPhrasesConfig(phrases) {
    try {
      const configKey = "knowledgeBaseTemplate_LinkPhrases";
      // 过滤空字符串并去重
      const cleanPhrases = [...new Set(phrases.filter(p => p && p.trim()))];
      NSUserDefaults.standardUserDefaults().setObjectForKey(
        JSON.stringify(cleanPhrases), 
        configKey
      );
      return true;
    } catch (error) {
      MNUtil.log("Error saving link phrases config: " + error.toString());
      return false;
    }
  }

  /**
   * 复制 Markdown 格式的卡片链接（带快捷短语功能）
   * @param {MNNote} note - 要生成链接的卡片
   */
  static copyMarkdownLinkWithQuickPhrases(note, prefilledText = null) {
    if (!note) {
      MNUtil.showHUD("❌ 请先选择一个卡片");
      return;
    }
    
    // 获取默认链接词（如果没有预填充文本）
    const defaultLinkWord = prefilledText|| "";
    
    // 加载快捷短语
    let phrases = this.loadLinkPhrasesConfig();
    
    // 构建选项列表
    let menuOptions = [];
    
    // 第一个按钮：确定（使用输入框内容）
    menuOptions.push("✅ 确定");
    
    // 添加所有快捷短语选项
    phrases.forEach(phrase => {
      menuOptions.push(`📝 ${phrase}`);
    });
    
    // 添加分隔线和管理选项
    menuOptions.push("────────────────");
    menuOptions.push("⚙️ 管理快捷短语");
    
    // 显示带输入框的对话框
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "复制 Markdown 链接",
      "输入链接词或选择快捷短语",
      2, // 输入框模式
      "取消",
      menuOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) return; // 取消
        
        const selectedIndex = buttonIndex - 1;
        const inputText = alert.textFieldAtIndex(0).text;
        
        if (selectedIndex === 0) {
          // 点击"确定"按钮
          const linkWord = inputText && inputText.trim() ? inputText : defaultLinkWord;
          if (linkWord) {
            const mdLink = `[${linkWord}](${note.noteURL})`;
            MNUtil.copy(mdLink);
            MNUtil.showHUD(`✅ 已复制: ${mdLink}`);
          } else {
            MNUtil.showHUD("❌ 请输入链接词");
          }
          
        } else if (selectedIndex <= phrases.length) {
          // 选择了快捷短语，直接使用并复制
          const selectedPhrase = phrases[selectedIndex - 1];
          const mdLink = `[${selectedPhrase}](${note.noteURL})`;
          MNUtil.copy(mdLink);
          MNUtil.showHUD(`✅ 已复制: ${mdLink}`);
          
        } else if (menuOptions[selectedIndex] === "⚙️ 管理快捷短语") {
          // 管理快捷短语
          this.manageLinkPhrases(() => {
            // 管理完成后重新显示主菜单，保持之前的输入
            this.copyMarkdownLinkWithQuickPhrases(note, inputText);
          });
        }
      }
    );
    
    // 设置输入框的默认值
    MNUtil.delay(0.1).then(() => {
      if (UIAlertView.currentAlert) {
        UIAlertView.currentAlert.textFieldAtIndex(0).text = defaultLinkWord;
      }
    });
  }

  /**
   * 显示手动输入对话框
   * @private
   */
  static showLinkWordInputDialog(note) {
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "输入链接词",
      "请输入自定义的链接词",
      2, // 输入框样式
      "取消",
      ["确定"],
      (alert, buttonIndex) => {
        if (buttonIndex === 1) {
          let linkWord = alert.textFieldAtIndex(0).text;
          // 如果没有输入，使用第一个标题链接词
          if (!linkWord || !linkWord.trim()) {
            linkWord = this.getFirstTitleLinkWord(note);
          }
          
          if (linkWord) {
            const mdLink = `[${linkWord}](${note.noteURL})`;
            MNUtil.copy(mdLink);
            MNUtil.showHUD(`✅ 已复制: ${mdLink}`);
            
            // 不再自动询问是否添加到快捷短语
          }
        }
      }
    );
  }

  /**
   * 询问是否添加到快捷短语
   * @private
   */
  static askToAddPhrase(phrase) {
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "添加到快捷短语？",
      `是否将 "${phrase}" 添加到快捷短语列表？`,
      0,
      "否",
      ["是"],
      (alert, buttonIndex) => {
        if (buttonIndex === 1) {
          let phrases = this.loadLinkPhrasesConfig();
          if (!phrases.includes(phrase)) {
            phrases.unshift(phrase); // 添加到开头
            if (phrases.length > 20) {
              phrases.pop(); // 限制最多20个
            }
            if (this.saveLinkPhrasesConfig(phrases)) {
              MNUtil.showHUD("✅ 已添加到快捷短语");
            }
          }
        }
      }
    );
  }

  /**
   * 管理链接词快捷短语
   * @param {Function} callback - 完成后的回调函数
   */
  static manageLinkPhrases(callback) {
    let phrases = this.loadLinkPhrasesConfig();
    
    let menuOptions = [
      "➕ 添加新短语",
      "➖ 删除短语",
      "🔄 恢复默认短语",
      "📋 查看所有短语"
    ];
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "管理快捷短语",
      `当前有 ${phrases.length} 个快捷短语`,
      0,
      "返回",
      menuOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          // 返回
          if (callback) callback();
          return;
        }
        
        const selectedOption = menuOptions[buttonIndex - 1];
        
        switch (selectedOption) {
          case "➕ 添加新短语":
            this.addNewPhrase(callback);
            break;
            
          case "➖ 删除短语":
            this.deletePhrase(callback);
            break;
            
          case "🔄 恢复默认短语":
            this.restoreDefaultPhrases(callback);
            break;
            
          case "📋 查看所有短语":
            this.viewAllPhrases(callback);
            break;
        }
      }
    );
  }

  /**
   * 添加新的快捷短语
   * @private
   */
  static addNewPhrase(callback) {
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "添加新短语",
      "请输入新的快捷短语",
      2, // 输入框样式
      "取消",
      ["添加"],
      (alert, buttonIndex) => {
        if (buttonIndex === 1) {
          const newPhrase = alert.textFieldAtIndex(0).text;
          if (newPhrase && newPhrase.trim()) {
            let phrases = this.loadLinkPhrasesConfig();
            if (!phrases.includes(newPhrase.trim())) {
              phrases.unshift(newPhrase.trim());
              if (phrases.length > 20) {
                phrases.pop(); // 限制最多20个
              }
              if (this.saveLinkPhrasesConfig(phrases)) {
                MNUtil.showHUD(`✅ 已添加: ${newPhrase}`);
              }
            } else {
              MNUtil.showHUD("⚠️ 该短语已存在");
            }
          }
        }
        // 返回管理界面
        this.manageLinkPhrases(callback);
      }
    );
  }

  /**
   * 删除快捷短语
   * @private
   */
  static deletePhrase(callback) {
    let phrases = this.loadLinkPhrasesConfig();
    
    if (phrases.length === 0) {
      MNUtil.showHUD("没有可删除的短语");
      this.manageLinkPhrases(callback);
      return;
    }
    
    // 为每个短语添加序号
    const numberedPhrases = phrases.map((phrase, index) => `${index + 1}. ${phrase}`);
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择要删除的短语",
      "点击短语将其删除",
      0,
      "返回",
      numberedPhrases,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          // 返回
          this.manageLinkPhrases(callback);
          return;
        }
        
        const indexToDelete = buttonIndex - 1;
        const deletedPhrase = phrases[indexToDelete];
        
        phrases.splice(indexToDelete, 1);
        if (this.saveLinkPhrasesConfig(phrases)) {
          MNUtil.showHUD(`✅ 已删除: ${deletedPhrase}`);
        }
        
        // 继续显示删除界面
        this.deletePhrase(callback);
      }
    );
  }

  /**
   * 恢复默认短语列表
   * @private
   */
  static restoreDefaultPhrases(callback) {
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "恢复默认短语？",
      "这将替换当前的所有快捷短语",
      0,
      "取消",
      ["确认恢复"],
      (alert, buttonIndex) => {
        if (buttonIndex === 1) {
          const defaultPhrases = [
            "作为特例", 
            "因此", 
            "参见", 
            "根据", 
            "证明", 
            "应用于", 
            "等价于", 
            "推广到",
            "由此可得",
            "进一步",
            "类比",
            "对比"
          ];
          
          if (this.saveLinkPhrasesConfig(defaultPhrases)) {
            MNUtil.showHUD("✅ 已恢复默认短语列表");
          }
        }
        
        // 返回管理界面
        this.manageLinkPhrases(callback);
      }
    );
  }

  /**
   * 查看所有短语
   * @private
   */
  static viewAllPhrases(callback) {
    let phrases = this.loadLinkPhrasesConfig();
    
    if (phrases.length === 0) {
      MNUtil.showHUD("短语列表为空");
      this.manageLinkPhrases(callback);
      return;
    }
    
    // 将短语列表转换为带序号的字符串
    const phraseList = phrases.map((phrase, index) => 
      `${index + 1}. ${phrase}`
    ).join("\n");
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "所有快捷短语",
      phraseList,
      0,
      "返回",
      [],
      (alert, buttonIndex) => {
        // 返回管理界面
        this.manageLinkPhrases(callback);
      }
    );
  }

  /**
   * 根据卡片类型转换需要，替换第一个 HtmlComment 字段
   * 当卡片被移动到不同的归类卡片下方时，需要更新第一个字段以匹配新类型
   * 
   * 需要替换的情况：
   * 1. 命题/例子 ↔ 反例
   * 2. 命题/例子 ↔ 思想方法
   * 3. 反例 ↔ 思想方法
   * 
   * @param {MNNote} note - 要处理的卡片
   */
  static replaceFirstFieldIfNeeded(note) {
    try {
      // 获取标题中的类型（当前类型）
      let titleType = this.getNoteType(note);
      
      // 获取归类卡片，确定目标类型
      let classificationNote = this.getFirstClassificationParentNote(note);
      let targetType = null;
      
      if (classificationNote) {
        let classificationTitleParts = this.parseNoteTitle(classificationNote);
        targetType = classificationTitleParts.type;
      }
      
      // 如果没有归类卡片，或者目标类型与标题类型相同，不需要处理
      if (!targetType || targetType === titleType) {
        return;
      }
      
      // 如果不是需要处理的类型，直接返回
      let targetTypes = ["命题", "例子", "反例", "思想方法"];
      if (!targetTypes.includes(targetType) || !targetTypes.includes(titleType)) {
        return;
      }
      
      // 确定需要替换的字段名
      let fieldMapping = {
        "命题": "证明",
        "例子": "证明", 
        "反例": "反例",
        "思想方法": "原理"
      };
      
      // 解析评论，找到第一个 HtmlComment 字段
      let commentsObj = this.parseNoteComments(note);
      let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
      
      if (htmlCommentsObjArr.length === 0) {
        return; // 没有字段，不需要处理
      }
      
      // 获取第一个字段的信息
      let firstFieldObj = htmlCommentsObjArr[0];
      let firstFieldIndex = firstFieldObj.index; // 使用 index 而不是 fieldIndex
      let firstFieldText = firstFieldObj.text; // 字段的文本内容
      
      // 命题和例子的字段相同，不需要替换
      if ((titleType === "命题" && targetType === "例子") || 
          (titleType === "例子" && targetType === "命题")) {
        return;
      }
      
      // 检查第一个字段是否已经是目标字段
      if (firstFieldText === fieldMapping[targetType]) {
        return;
      }
      
      let currentField = fieldMapping[titleType];
      let targetField = fieldMapping[targetType];
      
      // 如果字段相同，不需要替换
      if (currentField === targetField) {
        return;
      }
      
      MNUtil.undoGrouping(() => {
        try {
          // 获取新字段的模板内容
          let templateNoteId = this.singleHtmlCommentTemplateNoteIds[targetField];
          if (!templateNoteId) {
            MNUtil.log("未找到目标字段的模板卡片 ID: " + targetField);
            return;
          }
          
          // 先删除原来的第一个字段
          note.removeCommentByIndex(firstFieldIndex);
          
          // 克隆并合并只包含新字段的模板卡片
          this.cloneAndMergeById(note, templateNoteId);
          
          // 新字段被添加到最后，需要移动到第一个位置（原字段的位置）
          let newFieldIndex = note.comments.length - 1; // 新字段在最后
          note.moveComment(newFieldIndex, firstFieldIndex);
          
        } catch (error) {
          MNUtil.log("替换字段时出错: " + error.toString());
        }
      });
      
    } catch (error) {
      MNUtil.log("replaceFirstFieldIfNeeded 出错: " + error.toString());
    }
  }

  /**
   * 删除双向链接
   * 解析笔记中的链接（可以在字段下或直接在评论中），并支持双向删除（同时删除对方笔记中的反向链接）
   * @param {MNNote} note - 要处理的笔记
   */
  static async removeBidirectionalLinks(note) {
    try {
      // 1. 解析当前笔记的所有字段和评论
      const commentsObj = this.parseNoteComments(note);
      const htmlFields = commentsObj.htmlCommentsObjArr;
      
      let links = [];
      let selectedFieldText = null; // 用于记录选中的字段名称（如果有）
      
      // 2. 根据是否有字段采用不同的处理策略
      if (htmlFields.length > 0) {
        // 有字段的情况：让用户选择要处理的字段
        const fieldNames = htmlFields.map(field => field.text);
        const selectedFieldIndex = await MNUtil.userSelect(
          "选择要处理链接的字段", 
          "", 
          fieldNames
        );
        
        if (selectedFieldIndex === 0) {
          return; // 用户取消
        }
        
        const selectedField = htmlFields[selectedFieldIndex - 1];
        selectedFieldText = selectedField.text;
        
        // 获取所选字段下的纯链接
        const fieldCommentIndices = selectedField.excludingFieldBlockIndexArr;
        
        for (const index of fieldCommentIndices) {
          const comment = note.MNComments[index];
          if (comment && comment.text) {
            const commentText = comment.text.trim();
            
            // 使用封装的 API 判断是否为有效的笔记链接
            if (commentText.isValidNoteURL()) {
              // 检查是否为纯链接（不在 Markdown 格式中）
              if (!commentText.includes("](") && !commentText.includes("[")) {
                links.push({
                  index: index,
                  url: commentText,
                  noteId: commentText.toNoteId(),
                  type: comment.type
                });
              }
            }
          }
        }
        
        if (links.length === 0) {
          // 调试信息：显示字段下的所有评论
          MNUtil.log(`字段"${selectedField.text}"的评论索引: ${fieldCommentIndices.join(', ')}`);
          for (const index of fieldCommentIndices) {
            const comment = note.MNComments[index];
            if (comment) {
              MNUtil.log(`索引${index}: 类型=${comment.type}, 内容="${comment.text}"`);
            }
          }
          MNUtil.showHUD(`字段"${selectedField.text}"下没有找到纯链接`);
          return;
        }
      } else {
        // 没有字段的情况：扫描所有评论查找链接
        const allComments = note.MNComments;
        
        for (let index = 0; index < allComments.length; index++) {
          const comment = allComments[index];
          if (comment && comment.text) {
            const commentText = comment.text.trim();
            
            // 跳过字段本身（虽然这里应该没有字段）
            if (comment.type === "HtmlComment") {
              continue;
            }
            
            // 使用封装的 API 判断是否为有效的笔记链接
            if (commentText.isValidNoteURL()) {
              // 检查是否为纯链接（不在 Markdown 格式中）
              if (!commentText.includes("](") && !commentText.includes("[")) {
                links.push({
                  index: index,
                  url: commentText,
                  noteId: commentText.toNoteId(),
                  type: comment.type
                });
              }
            }
          }
        }
        
        if (links.length === 0) {
          MNUtil.showHUD("当前笔记没有找到任何纯链接");
          return;
        }
      }
      
      // 3. 获取链接对应的笔记标题
      const linkDisplayNames = [];
      for (const link of links) {
        try {
          const targetNote = MNUtil.getNoteById(link.noteId);
          if (targetNote) {
            // 使用 MNNote 包装以便使用 parseNoteTitle
            const targetMNNote = MNNote.new(targetNote);
            const titleParts = this.parseNoteTitle(targetMNNote);
            
            // 获取内容部分，并去掉可能的 "; " 前缀
            let content = titleParts.content || targetNote.noteTitle || "[无标题]";
            if (content.startsWith("; ")) {
              content = content.substring(2).trim();
            }
            
            // 格式化显示：[类型] 内容
            const type = titleParts.type || "";
            const displayTitle = type ? `[${type}] ${content}` : content;
            
            linkDisplayNames.push(displayTitle);
          } else {
            linkDisplayNames.push(`[笔记不存在: ${link.noteId.substring(0, 8)}...]`);
          }
        } catch (error) {
          linkDisplayNames.push(`[获取失败: ${link.noteId.substring(0, 8)}...]`);
        }
      }
      
      // 4. 让用户选择要删除的链接
      const subtitle = selectedFieldText 
        ? `在"${selectedFieldText}"字段下找到 ${links.length} 个链接`
        : `在笔记中找到 ${links.length} 个链接`;
      
      const selectedLinkIndex = await MNUtil.userSelect(
        "选择要删除的链接",
        subtitle,
        linkDisplayNames
      );
      
      if (selectedLinkIndex === 0) {
        return; // 用户取消
      }
      
      const selectedLink = links[selectedLinkIndex - 1];
      
      // 5. 执行双向删除
      MNUtil.undoGrouping(() => {
        // 删除当前笔记中的链接
        note.removeCommentByIndex(selectedLink.index);
        
        // 尝试删除对方笔记中的反向链接
        try {
          const targetNote = MNUtil.getNoteById(selectedLink.noteId);
          if (targetNote) {
            const targetMNNote = MNNote.new(targetNote);
            const targetCommentsObj = this.parseNoteComments(targetMNNote);
            const currentNoteId = note.noteId;
            
            // 优先查找"应用"字段（保持向后兼容）
            const applicationField = targetCommentsObj.htmlCommentsObjArr.find(field => {
              const fieldText = field.text.trim();
              return fieldText === "应用" || fieldText === "应用:" || fieldText === "应用：";
            });
            
            if (applicationField) {
              // 在应用字段下查找反向链接
              const fieldIndices = applicationField.excludingFieldBlockIndexArr;
              
              for (let i = fieldIndices.length - 1; i >= 0; i--) {
                const index = fieldIndices[i];
                const comment = targetMNNote.MNComments[index];
                // 添加类型检查
                if (comment && comment.type === "linkComment" && comment.text) {
                  const commentText = comment.text.trim();
                  // 使用 includes 而不是完全匹配
                  if (commentText.isValidNoteURL() && 
                      commentText.includes(currentNoteId)) {
                    targetMNNote.removeCommentByIndex(index);
                    MNUtil.showHUD("已删除双向链接");
                    return;
                  }
                }
              }
            }
            
            // 如果应用字段没找到，遍历所有字段查找反向链接
            let linkFound = false;
            for (const field of targetCommentsObj.htmlCommentsObjArr) {
              const fieldIndices = field.excludingFieldBlockIndexArr;
              
              for (let i = fieldIndices.length - 1; i >= 0; i--) {
                const index = fieldIndices[i];
                const comment = targetMNNote.MNComments[index];
                // 添加类型检查，只处理链接类型的评论
                if (comment && comment.type === "linkComment" && comment.text) {
                  const commentText = comment.text.trim();
                  // 使用 includes 进行更灵活的匹配
                  if (commentText.isValidNoteURL() && 
                      commentText.includes(currentNoteId)) {
                    targetMNNote.removeCommentByIndex(index);
                    MNUtil.showHUD(`已删除双向链接（在"${field.text}"字段下找到）`);
                    linkFound = true;
                    break;
                  }
                }
              }
              if (linkFound) break;
            }
            
            // 如果在字段中没找到（或根本没有HTML字段），遍历所有评论查找链接
            if (!linkFound) {
              const allComments = targetMNNote.MNComments;
              for (let i = allComments.length - 1; i >= 0; i--) {
                const comment = allComments[i];
                
                // 跳过 HTML 字段本身
                if (comment && comment.type === "HtmlComment") {
                  continue;
                }
                
                // 只处理链接类型的评论
                if (comment && comment.type === "linkComment" && comment.text) {
                  const commentText = comment.text.trim();
                  
                  // 使用灵活匹配：检查链接是否指向当前笔记
                  if (commentText.isValidNoteURL()) {
                    const linkNoteId = commentText.toNoteId();
                    if (linkNoteId === currentNoteId) {
                      targetMNNote.removeCommentByIndex(i);
                      MNUtil.showHUD("已删除双向链接");
                      linkFound = true;
                      break;
                    }
                  }
                }
              }
            }
            
            if (!linkFound) {
              MNUtil.showHUD("已删除链接（对方笔记未找到反向链接）");
            }
          } else {
            MNUtil.showHUD("已删除链接（对方笔记不存在）");
          }
        } catch (error) {
          MNUtil.showHUD("已删除链接（处理反向链接时出错）");
          MNUtil.log("删除反向链接时出错: " + error.toString());
        }
      });
      
    } catch (error) {
      MNUtil.showHUD("操作失败：" + error.toString());
      MNUtil.log("removeBidirectionalLinks 出错: " + error.toString());
    }
  }

  /**
   * 显示字段中的 Markdown 格式卡片链接
   * 解析字段下（或所有评论中）的 Markdown 格式卡片链接 [标题](noteId)，并通过弹窗显示
   * 支持复制 noteId 和定位到目标卡片
   * 
   * @param {MNNote} note - 要处理的笔记
   */
  static async showMarkdownLinksInField(note) {
    try {
      // 1. 解析字段
      const commentsObj = this.parseNoteComments(note);
      const htmlFields = commentsObj.htmlCommentsObjArr;
      
      let links = [];
      let selectedFieldText = null;
      
      // 2. 字段选择（如果有字段）
      if (htmlFields.length > 0) {
        const fieldNames = htmlFields.map(field => field.text);
        const selectedFieldIndex = await MNUtil.userSelect(
          "选择要查看链接的字段",
          "选择一个字段来查看其中的 Markdown 链接",
          fieldNames
        );
        
        if (selectedFieldIndex === 0) return;
        
        const selectedField = htmlFields[selectedFieldIndex - 1];
        selectedFieldText = selectedField.text;
        links = this.extractMarkdownLinks(note, selectedField);
      } else {
        // 没有字段，扫描所有评论
        links = this.extractMarkdownLinks(note);
      }
      
      // 3. 检查是否有链接
      if (links.length === 0) {
        MNUtil.showHUD(selectedFieldText 
          ? `字段"${selectedFieldText}"下没有找到 Markdown 链接`
          : "笔记中没有找到 Markdown 链接");
        return;
      }
      
      // 4. 格式化链接显示
      const linkDisplayNames = await this.formatMarkdownLinks(links);
      
      // 5. 第一层弹窗：选择链接
      const subtitle = selectedFieldText 
        ? `在"${selectedFieldText}"字段下找到 ${links.length} 个链接`
        : `在笔记中找到 ${links.length} 个链接`;
        
      const selectedLinkIndex = await MNUtil.userSelect(
        "选择 Markdown 链接",
        subtitle,
        linkDisplayNames
      );
      
      if (selectedLinkIndex === 0) return;
      
      const selectedLink = links[selectedLinkIndex - 1];
      
      // 6. 第二层弹窗：选择操作
      await this.showLinkActions(selectedLink);
      
    } catch (error) {
      MNUtil.showHUD("操作失败：" + error.message);
      MNUtil.addErrorLog(error, "showMarkdownLinksInField", { noteId: note.noteId });
    }
  }

  /**
   * 提取 Markdown 格式的卡片链接
   * 从评论中提取 [标题](marginnote4app://note/xxx) 格式的链接
   * 
   * @param {MNNote} note - 笔记对象
   * @param {Object} field - 字段对象（可选）
   * @returns {Array} 链接数组
   */
  static extractMarkdownLinks(note, field = null) {
    const links = [];
    // 使用非贪婪匹配确保正确提取多个链接
    const markdownLinkRegex = /\[([^\]]+?)\]\((marginnote4app:\/\/note\/[A-Z0-9-]+)\)/g;
    
    let comments;
    
    // 确定要扫描的评论范围
    if (field) {
      // 字段下的评论
      comments = field.excludingFieldBlockIndexArr.map(idx => ({
        index: idx,
        comment: note.MNComments[idx]
      }));
    } else {
      // 所有评论（排除字段本身）
      comments = note.MNComments.map((comment, idx) => ({
        index: idx,
        comment: comment
      })).filter(item => item.comment && item.comment.type !== "HtmlComment");
    }
    
    // 遍历评论，提取链接
    for (const {index, comment} of comments) {
      if (!comment || !comment.text) continue;
      
      // 只处理 markdownComment 类型
      if (comment.type === "markdownComment") {
        const text = comment.text;
        const matches = [...text.matchAll(markdownLinkRegex)];
        
        // 一条评论中可能有多个链接
        matches.forEach((match, linkIndex) => {
          links.push({
            displayText: match[1].trim(),     // 链接显示文本
            url: match[2],                     // 完整 URL
            noteId: match[2].toNoteId(),      // 提取的 noteId
            commentIndex: index,               // 评论索引
            linkIndexInComment: linkIndex,     // 在该评论中的第几个链接
            fullMatch: match[0],              // 完整匹配文本
            startPos: match.index             // 在原文本中的起始位置
          });
        });
      }
    }
    
    return links;
  }

  /**
   * 格式化 Markdown 链接用于显示
   * 
   * @param {Array} links - 链接数组
   * @returns {Array<string>} 格式化的显示名称数组
   */
  static async formatMarkdownLinks(links) {
    const displayNames = [];
    
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      let displayName = `${i + 1}. [${link.displayText}]`;
      
      // 尝试获取目标笔记信息
      try {
        const targetNote = MNUtil.getNoteById(link.noteId, false);
        if (targetNote) {
          const targetMNNote = MNNote.new(targetNote);
          const titleParts = this.parseNoteTitle(targetMNNote);
          let content = titleParts.content || targetNote.noteTitle || "";
          
          // 去掉可能的 "; " 前缀
          if (content.startsWith("; ")) {
            content = content.substring(2).trim();
          }
          
          // 如果实际标题与链接文本不同，显示映射关系
          if (content && content !== link.displayText) {
            displayName += ` → ${content}`;
          }
        } else {
          displayName += " (笔记不存在)";
        }
      } catch (e) {
        displayName += " (无法获取)";
      }
      
      // 如果同一评论有多个链接，添加标识
      const samCommentLinks = links.filter(l => l.commentIndex === link.commentIndex);
      if (samCommentLinks.length > 1) {
        displayName += ` [评论${link.commentIndex + 1}-链接${link.linkIndexInComment + 1}]`;
      }
      
      displayNames.push(displayName);
    }
    
    return displayNames;
  }

  /**
   * 显示链接操作选项
   * 
   * @param {Object} link - 链接对象
   */
  static async showLinkActions(link) {
    const actions = [
      "📋 复制 noteId",
      "📍 定位到卡片",
      "📄 复制完整链接",
      "📝 复制 Markdown 链接",
      "✨ 重新生成 Markdown 链接"
    ];
    
    const actionIndex = await MNUtil.userSelect(
      "选择操作",
      `链接：${link.displayText}`,
      actions
    );
    
    switch(actionIndex) {
      case 1: // 复制 noteId
        MNUtil.copy(link.noteId);
        MNUtil.showHUD("已复制 noteId: " + link.noteId.substring(0, 8) + "...");
        break;
        
      case 2: // 定位卡片
        try {
          MNUtil.focusNoteInMindMapById(link.noteId);
        } catch (error) {
          MNUtil.showHUD("无法定位到卡片");
        }
        break;
        
      case 3: // 复制完整链接
        MNUtil.copy(link.url);
        MNUtil.showHUD("已复制完整链接");
        break;
        
      case 4: // 复制 Markdown 链接
        MNUtil.copy(link.fullMatch);
        MNUtil.showHUD("已复制 Markdown 链接");
        break;
        
      case 5: // 重新生成 Markdown 链接
        try {
          const targetNote = MNUtil.getNoteById(link.noteId, false);
          if (targetNote) {
            const targetMNNote = MNNote.new(targetNote);
            this.copyMarkdownLinkWithQuickPhrases(targetMNNote);
          } else {
            MNUtil.showHUD("无法找到对应卡片");
          }
        } catch (error) {
          MNUtil.showHUD("操作失败: " + error.message);
        }
        break;
        
      default:
        break;
    }
  }

  /**
   * 通过弹窗选择字段，然后批量删除该字段下的评论
   * 
   * @param {MNNote} note - 要处理的笔记
   */
  static deleteCommentsByFieldPopup(note) {
    try {
      // 1. 获取所有字段
      let htmlCommentsTextArr = this.parseNoteComments(note).htmlCommentsTextArr;
      
      if (htmlCommentsTextArr.length === 0) {
        MNUtil.showHUD("当前笔记没有字段");
        return;
      }
      
      // 2. 让用户选择字段
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "选择字段",
        "选择要查看和删除评论的字段",
        0,
        "取消",
        htmlCommentsTextArr,
        (alert, buttonIndex) => {
          if (buttonIndex === 0) return; // 用户取消
          
          let selectedField = htmlCommentsTextArr[buttonIndex - 1];
          
          // 3. 获取该字段下的所有评论
          let fieldComments = this.getFieldCommentsForDeletion(note, selectedField);
          
          if (fieldComments.length === 0) {
            MNUtil.showHUD(`字段"${selectedField}"下没有评论`);
            return;
          }
          
          // 4. 开始递归选择流程
          let selectedIndices = new Set();
          this.showCommentSelectionDialog(note, selectedField, fieldComments, selectedIndices);
        }
      );
      
    } catch (error) {
      MNUtil.showHUD("操作失败：" + error.toString());
      MNUtil.log("deleteCommentsByFieldPopup 出错: " + error.toString());
    }
  }

  /**
   * 获取指定字段下的所有评论信息
   * 
   * @param {MNNote} note - 笔记对象
   * @param {string} fieldName - 字段名称
   * @returns {Array} 评论信息数组 [{index, display, comment}]
   */
  static getFieldCommentsForDeletion(note, fieldName) {
    let commentsObj = this.parseNoteComments(note);
    let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    
    // 找到对应字段
    let fieldObj = htmlCommentsObjArr.find(obj => obj.text === fieldName);
    if (!fieldObj) {
      return [];
    }
    
    // 获取该字段下的评论索引（不包括字段本身）
    let fieldIndices = fieldObj.excludingFieldBlockIndexArr;
    
    // 构建评论信息数组
    let fieldComments = [];
    for (let index of fieldIndices) {
      let comment = note.MNComments[index];
      if (comment) {
        let displayText = this.formatCommentForDisplay(comment, index, note);
        fieldComments.push({
          index: index,
          display: displayText,
          comment: comment
        });
      }
    }
    
    return fieldComments;
  }

  /**
   * 格式化评论内容用于显示
   * 
   * @param {MNComment} comment - 评论对象
   * @param {number} index - 评论索引
   * @param {MNNote} note - 笔记对象
   * @returns {string} 格式化后的显示文本
   */
  static formatCommentForDisplay(comment, index, note) {
    // comment 已经是 MNComment 对象，直接使用它的 type 属性
    const commentType = comment.type;
    const maxTextLength = 30;
    
    switch (commentType) {
      // TextNote 类型
      case "textComment":
        return this.truncateText(comment.text, maxTextLength);
        
      case "markdownComment":
        // 检查是否是 HtmlMarkdown 格式
        let commentText = comment.text;
        // 去掉可能的 "- " 前缀
        if (commentText && commentText.startsWith("- ")) {
          commentText = commentText.substring(2);
        }
        
        if (commentText && HtmlMarkdownUtils.isHtmlMDComment(commentText)) {
          const type = HtmlMarkdownUtils.getSpanType(commentText);
          const content = HtmlMarkdownUtils.getSpanTextContent(commentText);
          const icon = HtmlMarkdownUtils.icons[type] || "";
          const prefix = HtmlMarkdownUtils.prefix[type] || "";
          // 格式化显示：[类型图标] 内容
          const displayText = `[${icon}] ${prefix}${content}`;
          return this.truncateText(displayText, maxTextLength);
        } else {
          // 普通 Markdown 评论
          return "[Markdown] " + this.truncateText(comment.text, maxTextLength - 11);
        }
        
      case "tagComment":
        return "[标签] " + comment.text;
        
      case "linkComment":
        return this.formatLinkComment(comment.text, false);
        
      case "summaryComment":
        return this.formatLinkComment(comment.text, true);
        
      // HtmlNote 类型
      case "HtmlComment":
        return "[字段] " + comment.text;
        
      // LinkNote 类型（合并内容）
      case "mergedTextComment":
        return "[摘录-文本] " + this.truncateText(comment.text, maxTextLength - 12);
        
      case "mergedImageComment":
        return "[摘录-图片]";
        
      case "mergedImageCommentWithDrawing":
        return "[摘录-图片+手写]";
        
      case "blankTextComment":
        return "[摘录-空白文本]";
        
      case "blankImageComment":
        return "[摘录-空白图片]";
        
      // PaintNote 类型
      case "imageComment":
        return "[图片]";
        
      case "imageCommentWithDrawing":
        return "[图片+手写]";
        
      case "drawingComment":
        return "[纯手写]";
        
      default:
        // 检查是否是 HtmlMarkdown 评论
        if (comment.text) {
          let cleanText = comment.text;
          // 去掉可能的 "- " 前缀
          if (cleanText.startsWith("- ")) {
            cleanText = cleanText.substring(2);
          }
          
          if (HtmlMarkdownUtils.isHtmlMDComment(cleanText)) {
            const type = HtmlMarkdownUtils.getSpanType(cleanText);
            const content = HtmlMarkdownUtils.getSpanTextContent(cleanText);
            const icon = HtmlMarkdownUtils.icons[type] || "";
            const prefix = HtmlMarkdownUtils.prefix[type] || "";
            // 格式化显示：[类型图标] 内容
            const displayText = `[${icon}] ${prefix}${content}`;
            return this.truncateText(displayText, maxTextLength);
          }
        }
        return `[${commentType || '未知类型'}]`;
    }
  }

  /**
   * 格式化链接评论
   * 
   * @param {string} linkUrl - 链接URL
   * @param {boolean} isSummary - 是否是概要链接
   * @returns {string} 格式化的链接显示
   */
  static formatLinkComment(linkUrl, isSummary = false) {
    try {
      // 提取 noteId
      let noteId = linkUrl.match(/marginnote[34]app:\/\/note\/([^\/]+)/)?.[1];
      if (!noteId) {
        return isSummary ? "[概要链接] 无效链接" : "[链接] 无效链接";
      }
      
      // 尝试获取目标笔记
      let targetNote = MNNote.new(noteId, false);
      if (targetNote && targetNote.noteTitle) {
        // 使用 parseNoteTitle 解析标题
        const titleParts = this.parseNoteTitle(targetNote);
        
        // 获取内容部分，并去掉可能的 "; " 前缀
        let content = titleParts.content || targetNote.noteTitle || "";
        if (content.startsWith("; ")) {
          content = content.substring(2).trim();
        }
        
        // 格式化显示：[类型] 内容
        const type = titleParts.type || "";
        // 检查是否为归类卡片，如果是则添加"归类"后缀
        let displayType = type;
        if (type && this.getNoteType(targetNote) === "归类") {
          displayType = type + "归类";
        }
        const formattedTitle = displayType ? `[${displayType}] ${content}` : content;
        
        // 截断处理
        let truncatedTitle = this.truncateText(formattedTitle, 30);  // 增加长度到30，因为类型标识占用了空间
        
        return isSummary ? `[概要链接] ${truncatedTitle}` : `[链接] ${truncatedTitle}`;
      } else {
        return isSummary ? "[概要链接] (笔记不存在)" : "[链接] (笔记不存在)";
      }
    } catch (error) {
      return isSummary ? "[概要链接] (获取失败)" : "[链接] (获取失败)";
    }
  }

  /**
   * 截断文本并添加省略号
   * 
   * @param {string} text - 原始文本
   * @param {number} maxLength - 最大长度
   * @returns {string} 截断后的文本
   */
  static truncateText(text, maxLength) {
    if (!text) return "";
    text = text.trim();
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  }

  /**
   * 显示评论选择对话框（递归）
   * 
   * @param {MNNote} note - 笔记对象
   * @param {string} fieldName - 字段名称
   * @param {Array} fieldComments - 评论信息数组
   * @param {Set} selectedIndices - 已选中的索引集合
   */
  static showCommentSelectionDialog(note, fieldName, fieldComments, selectedIndices) {
    // 构建显示选项
    let displayOptions = fieldComments.map(item => {
      let prefix = selectedIndices.has(item.index) ? "✅ " : "";
      return prefix + item.display;
    });
    
    // 添加全选/取消全选选项
    let allSelected = selectedIndices.size === fieldComments.length;
    let selectAllText = allSelected ? "⬜ 取消全选" : "☑️ 全选所有评论";
    displayOptions.unshift(selectAllText);
    
    // 添加确定删除选项
    displayOptions.push("📌 确定删除选中的评论");
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      `字段"${fieldName}"的评论`,
      `已选中 ${selectedIndices.size}/${fieldComments.length} 条评论`,
      0,
      "取消",
      displayOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) return; // 用户取消
        
        if (buttonIndex === 1) {
          // 用户选择了全选/取消全选
          if (allSelected) {
            // 取消全选
            selectedIndices.clear();
          } else {
            // 全选
            fieldComments.forEach(item => {
              selectedIndices.add(item.index);
            });
          }
          
          // 递归显示更新后的对话框
          this.showCommentSelectionDialog(note, fieldName, fieldComments, selectedIndices);
          
        } else if (buttonIndex === displayOptions.length) {
          // 用户选择了"确定删除"
          if (selectedIndices.size === 0) {
            MNUtil.showHUD("没有选中任何评论");
            return;
          }
          
          // 执行删除
          this.deleteSelectedComments(note, selectedIndices);
          
        } else {
          // 用户选择了某个评论，切换选中状态
          let selectedComment = fieldComments[buttonIndex - 2]; // 因为加了全选选项，所以索引要减2
          
          if (selectedIndices.has(selectedComment.index)) {
            selectedIndices.delete(selectedComment.index);
          } else {
            selectedIndices.add(selectedComment.index);
          }
          
          // 递归显示更新后的对话框
          this.showCommentSelectionDialog(note, fieldName, fieldComments, selectedIndices);
        }
      }
    );
  }

  /**
   * 删除选中的评论
   * 
   * @param {MNNote} note - 笔记对象
   * @param {Set} selectedIndices - 要删除的评论索引集合
   */
  static deleteSelectedComments(note, selectedIndices) {
    try {
      // 将索引转为数组并排序（从大到小），避免删除时索引变化
      let sortedIndices = Array.from(selectedIndices).sort((a, b) => b - a);
      
      MNUtil.undoGrouping(() => {
        for (let index of sortedIndices) {
          note.removeCommentByIndex(index);
        }
      });
      
      MNUtil.showHUD(`成功删除 ${selectedIndices.size} 条评论`);
      
    } catch (error) {
      MNUtil.showHUD("删除评论时出错：" + error.toString());
      MNUtil.log("deleteSelectedComments 出错: " + error.toString());
    }
  }

  /**
   * 批量向上查找定义类卡片
   * 从当前卡片向上遍历父卡片，收集多个定义类卡片
   * 
   * @param {MNNote} startNote - 起始卡片
   * @param {number} maxCount - 最多查找的数量，默认5个
   * @returns {Object} 返回对象包含 cards（定义卡片数组）和 lastNote（最后检查的卡片）
   */
  static findDefinitionCards(startNote, maxCount = 5) {
    const definitionCards = []
    let currentNote = startNote
    
    while (currentNote && currentNote.parentNote && definitionCards.length < maxCount) {
      currentNote = MNNote.new(currentNote.parentNote)
      
      // 检查是否为定义类卡片
      if (this.getNoteType(currentNote) === "定义") {
        definitionCards.push(currentNote)
      }
    }
    
    return { 
      cards: definitionCards, 
      lastNote: currentNote  // 保存最后检查的卡片，用于继续查找
    }
  }

  /**
   * 选择定义卡片
   * 从找到的多个定义卡片中让用户选择一个
   * 
   * @param {Array<MNNote>} definitionCards - 定义卡片数组
   * @param {boolean} canContinue - 是否可以继续向上查找
   * @returns {Promise<{selected: MNNote|null, continue: boolean}>} 返回选中的卡片或继续查找的标志
   */
  static async selectDefinitionCard(definitionCards, canContinue = true) {
    if (definitionCards.length === 0) {
      return { selected: null, continue: false }
    }
    
    // 构建选项列表
    const options = definitionCards.map(card => {
      const parsed = this.parseNoteTitle(card)
      const prefix = parsed.prefixContent || ""
      const content = parsed.content || card.title || "未命名定义"
      return prefix ? `【定义：${prefix}】${content}` : `【定义】${content}`
    })
    
    // 如果可以继续查找，添加选项
    if (canContinue) {
      options.push("⬆️ 继续向上查找更多...")
    }
    
    // 显示选择弹窗
    return new Promise((resolve) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "选择定义卡片",
        `找到 ${definitionCards.length} 个定义卡片，请选择：`,
        0,
        "取消",
        options,
        (alert, buttonIndex) => {
          if (buttonIndex === 0) {
            // 取消
            resolve({ selected: null, continue: false })
          } else if (canContinue && buttonIndex === options.length) {
            // 选择了"继续向上查找"
            resolve({ selected: null, continue: true })
          } else {
            // 选择了某个定义卡片
            const selectedIndex = buttonIndex - 1
            resolve({ selected: definitionCards[selectedIndex], continue: false })
          }
        }
      )
    })
  }

  /**
   * 重新排序"相关链接"字段下的归类卡片链接
   * 按照类型（命题、反例、例子等）对链接进行分组排序
   * 保持父卡片（归类卡片）链接在第一条位置
   * 
   * @param {MNNote} defNote - 定义类卡片
   * @returns {boolean} 是否进行了重新排序
   */
  static reorderContainsFieldLinks(defNote) {
    try {
      const commentsObj = this.parseNoteComments(defNote)
      
      // 找到"相关链接"字段
      const containsField = commentsObj.htmlCommentsObjArr.find(field => {
        const fieldText = field.text.trim()
        return fieldText === "相关链接" || fieldText === "相关链接:" || fieldText === "相关链接："
      })
      
      if (!containsField) {
        MNUtil.log("未找到'相关链接'字段")
        return false
      }
      
      // 获取字段下的所有链接评论
      const fieldIndices = containsField.excludingFieldBlockIndexArr
      const linkComments = []
      
      fieldIndices.forEach(index => {
        const comment = defNote.MNComments[index]
        if (comment && comment.type === "linkComment") {
          linkComments.push({ index, comment })
        }
      })
      
      if (linkComments.length === 0) {
        MNUtil.log("'相关链接'字段下没有链接")
        return false
      }
      
      // 获取定义卡片的父卡片ID（如果存在且是归类卡片）
      let parentNoteId = null
      const parentNote = defNote.parentNote
      if (parentNote) {
        const parentType = this.parseNoteTitle(parentNote).type
        if (parentType === "归类") {
          parentNoteId = parentNote.noteId
        }
      }
      
      // 获取每个链接对应的笔记并解析类型
      let parentLink = null  // 保存父卡片链接
      const typedLinks = []  // 保存其他链接
      
      linkComments.forEach(link => {
        try {
          const noteId = link.comment.text.toNoteId()
          const linkedNote = MNUtil.getNoteById(noteId)
          if (!linkedNote) return
          
          const parsedTitle = this.parseNoteTitle(MNNote.new(linkedNote))
          const linkData = {
            ...link,
            note: linkedNote,
            noteId: noteId,
            type: parsedTitle.type || "其他",
            content: parsedTitle.content || ""
          }
          
          // 判断是否是父卡片链接
          if (parentNoteId && noteId === parentNoteId) {
            parentLink = linkData
            MNUtil.log("识别到父卡片（归类）链接，将保持在第一条位置")
          } else {
            typedLinks.push(linkData)
          }
        } catch (e) {
          MNUtil.log("解析链接失败: " + e.toString())
        }
      })
      
      // 如果没有任何有效链接，返回
      if (!parentLink && typedLinks.length === 0) {
        MNUtil.log("没有有效的链接")
        return false
      }
      
      // 对非父卡片链接按类型分组排序
      const typeOrder = ["命题", "反例", "例子", "问题", "思路", "思想方法"]
      const groupedLinks = {}
      
      typedLinks.forEach(link => {
        if (!groupedLinks[link.type]) {
          groupedLinks[link.type] = []
        }
        groupedLinks[link.type].push(link)
      })
      
      // 重新排序（父卡片链接在最前面）
      const orderedLinks = []
      
      // 如果有父卡片链接，放在第一位
      if (parentLink) {
        orderedLinks.push(parentLink)
      }
      
      // 然后添加预定义顺序的类型
      typeOrder.forEach(type => {
        if (groupedLinks[type]) {
          orderedLinks.push(...groupedLinks[type])
        }
      })
      
      // 最后添加其他类型
      Object.keys(groupedLinks).forEach(type => {
        if (!typeOrder.includes(type)) {
          orderedLinks.push(...groupedLinks[type])
        }
      })
      
      // 检查顺序是否发生变化
      const needReorder = orderedLinks.some((link, idx) => 
        link.index !== fieldIndices[idx]
      )
      
      if (needReorder) {
        MNUtil.undoGrouping(() => {
          // 先删除所有链接（从后往前删除）
          [...fieldIndices].reverse().forEach(index => {
            const comment = defNote.MNComments[index]
            if (comment && comment.type === "linkComment") {
              defNote.removeCommentByIndex(index)
            }
          })
          
          // 按新顺序添加链接
          orderedLinks.forEach(link => {
            defNote.appendNoteLink(MNNote.new(link.note), "To")
          })
        })
        
        MNUtil.log(`重新排序了 ${orderedLinks.length} 个链接，父卡片链接${parentLink ? "已保持在第一条" : "不存在"}`)
        return true
      }
      
      MNUtil.log("链接顺序已经是正确的，无需重新排序")
      return false
      
    } catch (error) {
      MNUtil.log("reorderContainsFieldLinks 出错: " + error.toString())
      MNUtil.addErrorLog(error, "reorderContainsFieldLinks")
      return false
    }
  }

  /**
   * 显示定义卡片目录（主函数）
   * 整合查找、排序和跳转功能，提供快速导航到归类卡片的能力
   */
  static async showDefinitionCatalog() {
    try {
      // 获取当前焦点卡片
      const focusNote = MNNote.getFocusNote()
      if (!focusNote) {
        MNUtil.showHUD("请先选中一个卡片")
        return
      }
      
      let currentNote = focusNote
      let selectedDefNote = null
      
      // 循环查找，直到用户选择一个定义卡片或取消
      while (!selectedDefNote) {
        // 批量查找定义类卡片
        const result = this.findDefinitionCards(currentNote, 5)
        
        if (result.cards.length === 0) {
          MNUtil.showHUD("未找到定义类卡片")
          return
        }
        
        // 让用户选择
        const canContinue = result.lastNote && result.lastNote.parentNote // 还可以继续向上查找
        const selection = await this.selectDefinitionCard(result.cards, canContinue)
        
        if (!selection.selected && !selection.continue) {
          // 用户取消
          return
        }
        
        if (selection.continue) {
          // 继续向上查找
          currentNote = result.lastNote
          continue
        }
        
        // 用户选择了一个定义卡片
        selectedDefNote = selection.selected
      }
      
      // 重新排序包含字段的链接
      const reordered = this.reorderContainsFieldLinks(selectedDefNote)
      if (reordered) {
        MNUtil.showHUD("已重新排序归类卡片")
      }
      
      // 获取相关链接字段下的所有链接
      const commentsObj = this.parseNoteComments(selectedDefNote)
      const containsField = commentsObj.htmlCommentsObjArr.find(field => {
        const fieldText = field.text.trim()
        return fieldText === "相关链接" || fieldText === "相关链接:" || fieldText === "相关链接："
      })
      
      if (!containsField) {
        MNUtil.showHUD("定义卡片中没有'相关链接'字段")
        return
      }
      
      // 收集链接信息
      const fieldIndices = containsField.excludingFieldBlockIndexArr
      const linkOptions = []
      const linkNoteIds = []
      
      fieldIndices.forEach(index => {
        const comment = selectedDefNote.MNComments[index]
        if (comment && comment.type === "linkComment") {
          try {
            const noteId = comment.text.toNoteId()
            const linkedNote = MNUtil.getNoteById(noteId)
            if (!linkedNote) return
            
            const parsedTitle = this.parseNoteTitle(MNNote.new(linkedNote))
            
            // 格式化显示选项
            const type = parsedTitle.type || "?"
            const content = parsedTitle.content || "未知内容"
            const displayText = `[${type}] "${content}"`
            
            linkOptions.push(displayText)
            linkNoteIds.push(noteId)
          } catch (e) {
            MNUtil.log("处理链接时出错: " + e.toString())
          }
        }
      })
      
      if (linkOptions.length === 0) {
        MNUtil.showHUD("相关链接字段下没有有效的归类卡片")
        return
      }
      
      // 获取定义卡片的标题信息
      const defParsedTitle = this.parseNoteTitle(selectedDefNote)
      const defTitle = defParsedTitle.prefixContent ? 
        `【定义：${defParsedTitle.prefixContent}】` : 
        selectedDefNote.title
      
      // 将定义卡片本身作为第一个选项
      linkOptions.unshift(`📍 ${defTitle} (定义卡片本身)`)
      linkNoteIds.unshift(selectedDefNote.noteId)
      
      // 显示选择弹窗
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "选择归类卡片",
        `定义：${defTitle}\n共 ${linkOptions.length} 个归类卡片`,
        0,
        "取消",
        linkOptions,
        (alert, buttonIndex) => {
          if (buttonIndex === 0) return // 取消
          
          const selectedIndex = buttonIndex - 1
          const selectedNoteId = linkNoteIds[selectedIndex]
          
          // 在 FloatMindMap 中定位
          MNUtil.focusNoteInMindMapById(selectedNoteId)
          // MNUtil.showHUD("已定位到归类卡片")
        }
      )
      
    } catch (error) {
      MNUtil.addErrorLog(error, "showDefinitionCatalog")
      MNUtil.showHUD("发生错误：" + error.message)
    }
  }

  /**
   * 搜索功能相关配置和方法
   */
  
  // 搜索根目录配置
  static searchRootConfigs = null;
  static tempRootInfo = null; // 存储临时根目录信息
  static searchBoardId = "37F2105C-35E4-4840-AD79-DA4702C36BE1";  // 搜索筛选看板 ID
  
  // 正则表达式搜索前缀
  static REGEX_PREFIXES = ['r:', 're:', 'regex:'];
  
  /**
   * 解析搜索关键词，识别正则表达式前缀
   * @param {string} keyword - 输入的关键词
   * @param {boolean} regexEnabled - 是否启用正则表达式搜索
   * @returns {Object} 包含 type 和 pattern 的对象
   */
  static parseSearchKeyword(keyword, regexEnabled) {
    if (!regexEnabled) {
      // 未启用正则搜索，全部作为普通文本
      return { type: 'text', pattern: keyword };
    }
    
    // 检查是否有正则前缀
    const lowerKeyword = keyword.toLowerCase();
    for (const prefix of this.REGEX_PREFIXES) {
      if (lowerKeyword.startsWith(prefix)) {
        return {
          type: 'regex',
          pattern: keyword.substring(prefix.length).trim()
        };
      }
    }
    
    // 无前缀，普通文本
    return { type: 'text', pattern: keyword };
  }
  
  /**
   * 初始化搜索配置
   */
  static initSearchConfig() {
    if (!this.searchRootConfigs) {
      this.searchRootConfigs = this.loadSearchConfig();
      
      // 恢复临时根目录信息
      if (this.searchRootConfigs.tempRoot) {
        this.tempRootInfo = this.searchRootConfigs.tempRoot;
      }
    }
    return this.searchRootConfigs;
  }
  
  /**
   * 加载搜索配置（从 iCloud 或本地）
   */
  static loadSearchConfig() {
    try {
      // 先尝试从本地加载
      const localConfig = NSUserDefaults.standardUserDefaults().objectForKey("knowledgeBaseTemplate_SearchConfig");
      let config = localConfig ? JSON.parse(localConfig) : null;
      
      // 如果开启了 iCloud 同步，尝试从 iCloud 加载
      if (typeof toolbarConfig !== 'undefined' && toolbarConfig.iCloudSync) {
        const cloudStore = NSUbiquitousKeyValueStore.defaultStore();
        if (cloudStore) {
          const cloudConfig = cloudStore.objectForKey("knowledgeBaseTemplate_SearchConfig");
          if (cloudConfig) {
            const cloudData = JSON.parse(cloudConfig);
            // 比较时间戳，使用较新的配置
            if (!config || (cloudData.lastModified > config.lastModified)) {
              config = cloudData;
            }
          }
        }
      }
      
      // 如果没有配置，使用默认配置
      if (!config) {
        config = {
          roots: {
            default: {
              id: "B2A5D567-909C-44E8-BC08-B1532D3D0AA1",
              name: "数学知识库",
              isDefault: true
            }
          },
          rootsOrder: ["default"],  // 新增：根目录顺序数组
          lastUsedRoot: "default",
          includeClassification: true,  // 默认包含归类卡片
          ignorePrefix: false,  // 默认搜索完整标题
          searchInKeywords: false,  // 默认不搜索关键词字段
          onlyClassification: false,  // 默认不启用只搜索归类卡片
          skipEmptyTitle: false,  // 默认不跳过空白标题卡片
          enableRegexSearch: false,  // 默认不启用正则表达式搜索
          synonymGroups: [],  // 同义词组
          exclusionGroups: [],  // 排除词组
          lastModified: Date.now()
        };
      }
      
      // 确保旧配置有这些字段（向后兼容）
      if (config && config.includeClassification === undefined) {
        config.includeClassification = true;
      }
      if (config && config.ignorePrefix === undefined) {
        config.ignorePrefix = false;
      }
      if (config && config.searchInKeywords === undefined) {
        config.searchInKeywords = false;
      }
      if (config && config.onlyClassification === undefined) {
        config.onlyClassification = false;  // 默认不启用只搜索归类卡片
      }
      // 添加同义词组字段
      if (config && !config.synonymGroups) {
        config.synonymGroups = [];
      }
      // 添加排除词组字段
      if (config && !config.exclusionGroups) {
        config.exclusionGroups = [];
      }
      // 添加跳过空白标题字段
      if (config && config.skipEmptyTitle === undefined) {
        config.skipEmptyTitle = false;
      }
      // 添加正则表达式搜索字段
      if (config && config.enableRegexSearch === undefined) {
        config.enableRegexSearch = false;
      }
      
      // 为现有根目录添加 skipEmptyTitleByDefault 字段（向后兼容）
      if (config && config.roots) {
        for (const key in config.roots) {
          if (config.roots[key].skipEmptyTitleByDefault === undefined) {
            config.roots[key].skipEmptyTitleByDefault = false;
          }
        }
      }
      
      // 数据迁移：如果旧版本没有 rootsOrder，自动生成
      if (config && config.roots && !config.rootsOrder) {
        config.rootsOrder = Object.keys(config.roots);
        // 确保 default 在第一位
        const defaultIndex = config.rootsOrder.indexOf("default");
        if (defaultIndex > 0) {
          config.rootsOrder.splice(defaultIndex, 1);
          config.rootsOrder.unshift("default");
        }
      }
      
      return config;
    } catch (error) {
      MNUtil.log("加载搜索配置失败: " + error.toString());
      // 返回默认配置
      return {
        roots: {
          default: {
            id: "B2A5D567-909C-44E8-BC08-B1532D3D0AA1",
            name: "数学知识库",
            isDefault: true,
            skipEmptyTitleByDefault: false
          }
        },
        rootsOrder: ["default"],  // 根目录顺序
        lastUsedRoot: "default",
        includeClassification: true,  // 默认包含归类卡片
        ignorePrefix: false,  // 默认搜索完整标题
        searchInKeywords: false,  // 默认不搜索关键词字段
        onlyClassification: false,  // 默认不启用只搜索归类卡片
        skipEmptyTitle: false,  // 默认不跳过空白标题卡片
        enableRegexSearch: false,  // 默认不启用正则表达式搜索
        synonymGroups: [],  // 同义词组
        exclusionGroups: [],  // 排除词组
        lastModified: Date.now()
      };
    }
  }
  
  /**
   * 保存搜索配置（到 iCloud 和本地）
   */
  static saveSearchConfig() {
    try {
      if (!this.searchRootConfigs) {
        this.initSearchConfig();
      }
      
      this.searchRootConfigs.lastModified = Date.now();
      const configStr = JSON.stringify(this.searchRootConfigs);
      
      // 保存到本地
      NSUserDefaults.standardUserDefaults().setObjectForKey(configStr, "knowledgeBaseTemplate_SearchConfig");
      
      // 如果开启了 iCloud 同步，保存到 iCloud
      if (typeof toolbarConfig !== 'undefined' && toolbarConfig.iCloudSync) {
        const cloudStore = NSUbiquitousKeyValueStore.defaultStore();
        if (cloudStore) {
          cloudStore.setObjectForKey(configStr, "knowledgeBaseTemplate_SearchConfig");
          cloudStore.synchronize();
        }
      }
      
      return true;
    } catch (error) {
      MNUtil.log("保存搜索配置失败: " + error.toString());
      return false;
    }
  }
  
  /**
   * 获取当前搜索根目录 ID
   */
  static getCurrentSearchRoot() {
    this.initSearchConfig();
    const lastUsed = this.searchRootConfigs.lastUsedRoot;
    const root = this.searchRootConfigs.roots[lastUsed];
    return root ? root.id : this.searchRootConfigs.roots.default.id;
  }
  
  /**
   * 获取上次使用的根目录ID数组（支持多选）
   */
  static getLastUsedRootIds() {
    this.initSearchConfig();
    
    // 优先检查是否有临时根目录
    if (this.searchRootConfigs.tempRoot) {
      // 恢复临时根目录信息
      this.tempRootInfo = this.searchRootConfigs.tempRoot;
      return [this.tempRootInfo.id];
    }
    
    // 优先使用新的多选字段
    if (this.searchRootConfigs.lastUsedRoots && this.searchRootConfigs.lastUsedRoots.length > 0) {
      const rootIds = [];
      for (const key of this.searchRootConfigs.lastUsedRoots) {
        const root = this.searchRootConfigs.roots[key];
        if (root) {
          rootIds.push(root.id);
        }
      }
      if (rootIds.length > 0) {
        return rootIds;
      }
    }
    
    // 兼容旧版单选配置
    const singleRoot = this.getCurrentSearchRoot();
    return [singleRoot];
  }
  
  /**
   * 获取当前根目录名称（支持多个）
   * @param {Array} rootIds - 根目录ID数组
   * @param {Object} allRoots - 所有根目录配置
   * @returns {string} 根目录名称的字符串表示
   */
  static getCurrentRootNames(rootIds, allRoots) {
    if (!rootIds || rootIds.length === 0) {
      return "未选择";
    }
    
    const names = [];
    for (const rootId of rootIds) {
      // 检查临时根目录
      if (this.tempRootInfo && this.tempRootInfo.id === rootId) {
        names.push(`📍 ${this.tempRootInfo.name}`);
      } else {
        // 查找配置中的根目录
        for (const key in allRoots) {
          if (allRoots[key].id === rootId) {
            names.push(allRoots[key].name);
            break;
          }
        }
      }
    }
    
    return names.length > 0 ? names.join(", ") : "未知";
  }
  
  /**
   * 获取所有搜索根目录
   */
  static getAllSearchRoots() {
    this.initSearchConfig();
    return this.searchRootConfigs.roots;
  }
  
  /**
   * 设置临时根目录
   * @param {MNNote} note - 要设为临时根目录的卡片
   */
  static setTempRoot(note) {
    try {
      this.initSearchConfig();
      
      // 保存临时根目录信息
      this.tempRootInfo = {
        id: note.noteId,
        name: note.noteTitle || "无标题",
        isTemp: true
      };
      
      // 将临时根目录信息保存到配置中，以便下次打开时仍然有效
      this.searchRootConfigs.tempRoot = this.tempRootInfo;
      
      // 清空正式根目录的选择
      this.searchRootConfigs.lastUsedRoots = [];
      
      this.saveSearchConfig();
      
      MNUtil.showHUD(`📍 已设置临时根目录：${this.tempRootInfo.name}`);
      return true;
    } catch (error) {
      MNUtil.log("设置临时根目录失败: " + error.toString());
      MNUtil.showHUD("设置失败：" + error.message);
      return false;
    }
  }
  
  /**
   * 清除临时根目录
   */
  static clearTempRoot() {
    this.initSearchConfig();
    
    if (this.tempRootInfo || this.searchRootConfigs.tempRoot) {
      this.tempRootInfo = null;
      this.searchRootConfigs.tempRoot = null;
      this.saveSearchConfig();
      MNUtil.log("已清除临时根目录");
    }
  }
  
  /**
   * 添加搜索根目录
   * @param {string} noteId - 卡片 ID 或 URL
   * @param {string} name - 根目录名称
   */
  static addSearchRoot(noteId, name) {
    try {
      this.initSearchConfig();
      
      // 处理 URL 格式的 noteId
      if (noteId.includes("marginnote")) {
        noteId = noteId.toNoteId();
      }
      
      // 验证卡片是否存在
      const note = MNUtil.getNoteById(noteId);
      if (!note) {
        MNUtil.showHUD("卡片不存在");
        return false;
      }
      
      // 生成唯一 key
      const key = "root_" + Date.now();
      
      // 添加到配置
      this.searchRootConfigs.roots[key] = {
        id: noteId,
        name: name,
        isDefault: false,
        skipEmptyTitleByDefault: false
      };
      
      // 添加到顺序数组末尾
      if (!this.searchRootConfigs.rootsOrder) {
        this.searchRootConfigs.rootsOrder = Object.keys(this.searchRootConfigs.roots);
      }
      this.searchRootConfigs.rootsOrder.push(key);
      
      // 保存配置
      this.saveSearchConfig();
      
      MNUtil.showHUD("✅ 已添加根目录：" + name);
      return key; // 返回新添加的根目录 key
    } catch (error) {
      MNUtil.log("添加搜索根目录失败: " + error.toString());
      MNUtil.showHUD("添加失败：" + error.message);
      return false;
    }
  }
  
  /**
   * 删除搜索根目录
   * @param {string} key - 根目录的键名
   * @returns {boolean} 是否成功
   */
  static deleteSearchRoot(key) {
    try {
      this.initSearchConfig();
      
      // 不能删除默认根目录
      if (key === "default") {
        MNUtil.showHUD("不能删除默认根目录");
        return false;
      }
      
      // 删除根目录
      if (this.searchRootConfigs.roots[key]) {
        delete this.searchRootConfigs.roots[key];
        
        // 从顺序数组中移除
        if (this.searchRootConfigs.rootsOrder) {
          const index = this.searchRootConfigs.rootsOrder.indexOf(key);
          if (index > -1) {
            this.searchRootConfigs.rootsOrder.splice(index, 1);
          }
        }
        
        // 如果删除的是最后使用的根目录，重置为默认
        if (this.searchRootConfigs.lastUsedRoot === key) {
          this.searchRootConfigs.lastUsedRoot = "default";
        }
        
        this.saveSearchConfig();
        return true;
      }
      
      return false;
    } catch (error) {
      MNUtil.log("删除搜索根目录失败: " + error.toString());
      return false;
    }
  }
  
  /**
   * 编辑搜索根目录
   * @param {string} key - 根目录的键名
   * @param {string} newName - 新名称
   * @param {string} newNoteId - 新的笔记ID（可选）
   * @returns {boolean} 是否成功
   */
  static editSearchRoot(key, newName, newNoteId) {
    try {
      this.initSearchConfig();
      
      if (!this.searchRootConfigs.roots[key]) {
        MNUtil.showHUD("根目录不存在");
        return false;
      }
      
      // 更新名称
      if (newName) {
        this.searchRootConfigs.roots[key].name = newName;
      }
      
      // 更新笔记ID（如果提供）
      if (newNoteId) {
        // 处理 URL 格式
        if (newNoteId.includes("marginnote")) {
          newNoteId = newNoteId.toNoteId();
        }
        
        // 验证卡片是否存在
        const note = MNUtil.getNoteById(newNoteId);
        if (!note) {
          MNUtil.showHUD("新的卡片不存在");
          return false;
        }
        
        this.searchRootConfigs.roots[key].id = newNoteId;
      }
      
      this.saveSearchConfig();
      return true;
    } catch (error) {
      MNUtil.log("编辑搜索根目录失败: " + error.toString());
      return false;
    }
  }
  
  /**
   * 导出搜索配置（保留原方法以兼容）
   * @returns {string|null} JSON字符串，失败返回null
   */
  static exportSearchConfig() {
    try {
      this.initSearchConfig();
      
      const config = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        roots: this.searchRootConfigs.roots,
        rootsOrder: this.searchRootConfigs.rootsOrder,
        lastUsedRoot: this.searchRootConfigs.lastUsedRoot,
        settings: {
          includeClassification: this.searchRootConfigs.includeClassification,
          onlyClassification: this.searchRootConfigs.onlyClassification,
          ignorePrefix: this.searchRootConfigs.ignorePrefix,
          searchInKeywords: this.searchRootConfigs.searchInKeywords,
          skipEmptyTitle: this.searchRootConfigs.skipEmptyTitle
        },
        synonymGroups: this.searchRootConfigs.synonymGroups || []
      };
      
      const jsonStr = JSON.stringify(config, null, 2);
      MNUtil.copy(jsonStr);
      
      return jsonStr;
    } catch (error) {
      MNUtil.log("导出搜索配置失败: " + error.toString());
      return null;
    }
  }

  /**
   * 获取完整的搜索配置（包括同义词、排除词组、根目录群组）
   * @returns {Object} 配置对象
   */
  static getFullSearchConfig() {
    this.initSearchConfig();
    
    return {
      version: "3.0",  // 升级版本号以支持新功能
      exportDate: new Date().toISOString(),
      exportFrom: "knowledgeBaseTemplate",
      searchConfig: {
        roots: this.searchRootConfigs.roots,
        rootsOrder: this.searchRootConfigs.rootsOrder,
        lastUsedRoot: this.searchRootConfigs.lastUsedRoot,
        lastUsedRoots: this.searchRootConfigs.lastUsedRoots || [],  // 新增：支持多选根目录
        
        // 新增：根目录群组
        rootGroups: this.searchRootConfigs.rootGroups || {},
        lastUsedGroup: this.searchRootConfigs.lastUsedGroup || null,
        
        includeClassification: this.searchRootConfigs.includeClassification,
        onlyClassification: this.searchRootConfigs.onlyClassification,
        ignorePrefix: this.searchRootConfigs.ignorePrefix,
        searchInKeywords: this.searchRootConfigs.searchInKeywords,
        skipEmptyTitle: this.searchRootConfigs.skipEmptyTitle
      },
      synonymGroups: this.searchRootConfigs.synonymGroups || [],
      exclusionGroups: this.searchRootConfigs.exclusionGroups || []  // 新增：排除词组配置
    };
  }

  /**
   * 导出搜索配置到指定目标
   * @param {string} type - 导出类型: "iCloud", "clipboard", "currentNote", "file"
   * @returns {Promise<boolean>} 是否成功
   */
  static async exportSearchConfigTo(type) {
    try {
      const config = this.getFullSearchConfig();
      const jsonStr = JSON.stringify(config, null, 2);
      
      switch (type) {
        case "iCloud":
          // 使用 iCloud 同步
          const iCloudKey = "knowledgeBaseTemplate_SearchConfig";
          MNUtil.setByiCloud(iCloudKey, jsonStr);
          MNUtil.showHUD("✅ 已导出到 iCloud");
          return true;
          
        case "clipboard":
          MNUtil.copy(jsonStr);
          MNUtil.showHUD("✅ 已导出到剪贴板");
          return true;
          
        case "currentNote":
          const focusNote = MNNote.getFocusNote();
          if (!focusNote) {
            MNUtil.showHUD("❌ 请先选择一个笔记");
            return false;
          }
          
          MNUtil.undoGrouping(() => {
            focusNote.noteTitle = "knowledgeBaseTemplate_搜索配置";
            focusNote.excerptText = "```json\n" + jsonStr + "\n```";
            focusNote.excerptTextMarkdown = true;
          });
          MNUtil.showHUD("✅ 已导出到当前笔记");
          return true;
          
        case "file":
          // 导出到文件
          const dateStr = new Date().toISOString().replace(/:/g, '-').split('.')[0];
          const fileName = `knowledgeBaseTemplate_SearchConfig_${dateStr}.json`;
          const documentsPath = NSSearchPathForDirectoriesInDomains(9, 1, true).firstObject; // NSDocumentDirectory
          
          if (documentsPath) {
            const filePath = documentsPath + "/" + fileName;
            NSString.stringWithString(jsonStr).writeToFileAtomicallyEncodingError(
              filePath, true, 4, null // NSUTF8StringEncoding = 4
            );
            
            // 保存文件对话框
            MNUtil.saveFile(filePath, ["public.json"]);
            MNUtil.showHUD(`✅ 已导出到文件\n${fileName}`);
            return true;
          }
          MNUtil.showHUD("❌ 文件导出失败");
          return false;
          
        default:
          MNUtil.showHUD("❌ 不支持的导出类型");
          return false;
      }
    } catch (error) {
      MNUtil.showHUD("❌ 导出失败：" + error.message);
      MNUtil.log("导出搜索配置失败: " + error.toString());
      return false;
    }
  }
  
  /**
   * 导入搜索配置（保留原方法以兼容）
   * @returns {Promise<boolean>} 是否成功
   */
  static async importSearchConfig() {
    return this.importSearchConfigFrom("clipboard");
  }

  /**
   * 从指定来源导入搜索配置
   * @param {string} type - 导入类型: "iCloud", "clipboard", "currentNote", "file"
   * @returns {Promise<boolean>} 是否成功
   */
  static async importSearchConfigFrom(type) {
    try {
      let jsonStr = null;
      
      switch (type) {
        case "iCloud":
          // 从 iCloud 导入
          const iCloudKey = "knowledgeBaseTemplate_SearchConfig";
          jsonStr = MNUtil.getByiCloud(iCloudKey);
          if (!jsonStr) {
            MNUtil.showHUD("❌ iCloud 中没有配置");
            return false;
          }
          break;
          
        case "clipboard":
          jsonStr = MNUtil.clipboardText;
          if (!jsonStr) {
            MNUtil.showHUD("❌ 剪贴板为空");
            return false;
          }
          break;
          
        case "currentNote":
          const focusNote = MNNote.getFocusNote();
          if (!focusNote) {
            MNUtil.showHUD("❌ 请先选择一个笔记");
            return false;
          }
          
          // 从笔记内容中提取 JSON
          const excerptText = focusNote.excerptText || "";
          // 尝试提取 markdown 代码块中的 JSON
          const codeBlockMatch = excerptText.match(/```json\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1];
          } else {
            // 尝试直接解析
            jsonStr = excerptText;
          }
          break;
          
        case "file":
          // 从文件导入
          const filePath = MNUtil.openFile(["public.json"]);
          if (!filePath) {
            MNUtil.showHUD("❌ 未选择文件");
            return false;
          }
          
          jsonStr = NSString.stringWithContentsOfFileEncodingError(filePath, 4, null); // NSUTF8StringEncoding = 4
          if (!jsonStr) {
            MNUtil.showHUD("❌ 无法读取文件");
            return false;
          }
          break;
          
        default:
          MNUtil.showHUD("❌ 不支持的导入类型");
          return false;
      }
      
      // 解析 JSON
      let config;
      try {
        config = JSON.parse(jsonStr);
      } catch (e) {
        MNUtil.showHUD("❌ 内容不是有效的 JSON 格式");
        return false;
      }
      
      // 处理新版本格式（包含 searchConfig 和 synonymGroups）
      let searchConfig, synonymGroups;
      if (config.searchConfig) {
        // 新格式
        searchConfig = config.searchConfig;
        synonymGroups = config.synonymGroups;
      } else if (config.roots) {
        // 旧格式
        searchConfig = {
          roots: config.roots,
          rootsOrder: config.rootsOrder,
          lastUsedRoot: config.lastUsedRoot,
          ...config.settings
        };
        synonymGroups = config.synonymGroups;
      } else {
        MNUtil.showHUD("❌ 配置格式无效");
        return false;
      }
      
      // 询问导入方式
      return new Promise((resolve) => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "导入配置",
          "选择导入方式：",
          0,
          "取消",
          ["替换现有配置", "合并配置"],
          (_, buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(false);
              return;
            }
            
            this.initSearchConfig();
            
            if (buttonIndex === 1) {
              // 替换模式
              if (searchConfig.roots) {
                this.searchRootConfigs.roots = searchConfig.roots;
                this.searchRootConfigs.rootsOrder = searchConfig.rootsOrder || Object.keys(searchConfig.roots);
                this.searchRootConfigs.lastUsedRoot = searchConfig.lastUsedRoot || "default";
                // 新增：支持多选根目录和根目录群组
                this.searchRootConfigs.lastUsedRoots = searchConfig.lastUsedRoots || [];
                this.searchRootConfigs.rootGroups = searchConfig.rootGroups || {};
                this.searchRootConfigs.lastUsedGroup = searchConfig.lastUsedGroup || null;
              }
              
              // 应用其他设置
              if (searchConfig.includeClassification !== undefined) {
                this.searchRootConfigs.includeClassification = searchConfig.includeClassification;
              }
              if (searchConfig.onlyClassification !== undefined) {
                this.searchRootConfigs.onlyClassification = searchConfig.onlyClassification;
              }
              if (searchConfig.ignorePrefix !== undefined) {
                this.searchRootConfigs.ignorePrefix = searchConfig.ignorePrefix;
              }
              if (searchConfig.searchInKeywords !== undefined) {
                this.searchRootConfigs.searchInKeywords = searchConfig.searchInKeywords;
              }
              if (searchConfig.skipEmptyTitle !== undefined) {
                this.searchRootConfigs.skipEmptyTitle = searchConfig.skipEmptyTitle;
              }
              
              // 替换同义词组
              if (synonymGroups) {
                this.searchRootConfigs.synonymGroups = synonymGroups;
              }
              
              // 新增：替换排除词组
              if (config.exclusionGroups) {
                this.searchRootConfigs.exclusionGroups = config.exclusionGroups;
              }
            } else if (buttonIndex === 2) {
              // 合并模式
              // 合并根目录
              if (searchConfig.roots) {
                Object.assign(this.searchRootConfigs.roots, searchConfig.roots);
                
                // 合并顺序数组
                if (searchConfig.rootsOrder) {
                  const existingKeys = new Set(this.searchRootConfigs.rootsOrder || []);
                  for (const key of searchConfig.rootsOrder) {
                    if (!existingKeys.has(key) && this.searchRootConfigs.roots[key]) {
                      this.searchRootConfigs.rootsOrder.push(key);
                    }
                  }
                }
                
                // 新增：合并多选根目录
                if (searchConfig.lastUsedRoots && searchConfig.lastUsedRoots.length > 0) {
                  // 如果当前没有设置，直接使用导入的
                  if (!this.searchRootConfigs.lastUsedRoots || this.searchRootConfigs.lastUsedRoots.length === 0) {
                    this.searchRootConfigs.lastUsedRoots = searchConfig.lastUsedRoots;
                  }
                }
                
                // 新增：合并根目录群组
                if (searchConfig.rootGroups) {
                  if (!this.searchRootConfigs.rootGroups) {
                    this.searchRootConfigs.rootGroups = {};
                  }
                  // 合并群组，避免覆盖现有群组
                  for (const groupName in searchConfig.rootGroups) {
                    if (!this.searchRootConfigs.rootGroups[groupName]) {
                      this.searchRootConfigs.rootGroups[groupName] = searchConfig.rootGroups[groupName];
                    }
                  }
                }
              }
              
              // 合并同义词组
              if (synonymGroups && synonymGroups.length > 0) {
                if (!this.searchRootConfigs.synonymGroups) {
                  this.searchRootConfigs.synonymGroups = [];
                }
                // 避免重复
                const existingIds = new Set(this.searchRootConfigs.synonymGroups.map(g => g.id));
                for (const group of synonymGroups) {
                  if (!existingIds.has(group.id)) {
                    this.searchRootConfigs.synonymGroups.push(group);
                  }
                }
              }
              
              // 新增：合并排除词组
              if (config.exclusionGroups && config.exclusionGroups.length > 0) {
                if (!this.searchRootConfigs.exclusionGroups) {
                  this.searchRootConfigs.exclusionGroups = [];
                }
                // 避免重复
                const existingIds = new Set(this.searchRootConfigs.exclusionGroups.map(g => g.id));
                for (const group of config.exclusionGroups) {
                  if (!existingIds.has(group.id)) {
                    this.searchRootConfigs.exclusionGroups.push(group);
                  }
                }
              }
            }
            
            this.saveSearchConfig();
            MNUtil.showHUD("✅ 配置导入成功");
            resolve(true);
          }
        );
      });
    } catch (error) {
      MNUtil.log("导入搜索配置失败: " + error.toString());
      MNUtil.showHUD("❌ 导入失败：" + error.message);
      return false;
    }
  }
  
  /**
   * 显示导出配置选择对话框
   * @returns {Promise<boolean>} 是否成功导出
   */
  static async showExportConfigDialog() {
    return new Promise((resolve) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "导出搜索配置",
        "选择导出方式：",
        0,
        "取消",
        [
          "☁️ 导出到 iCloud",
          "📋 导出到剪贴板",
          "📝 导出到当前笔记",
          "📁 导出到文件"
        ],
        async (_, buttonIndex) => {
          if (buttonIndex === 0) {
            resolve(false);
            return;
          }
          
          const types = ["iCloud", "clipboard", "currentNote", "file"];
          const success = await this.exportSearchConfigTo(types[buttonIndex - 1]);
          resolve(success);
        }
      );
    });
  }

  /**
   * 显示导入配置选择对话框
   * @returns {Promise<boolean>} 是否成功导入
   */
  static async showImportConfigDialog() {
    return new Promise((resolve) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "导入搜索配置",
        "选择导入来源：",
        0,
        "取消",
        [
          "☁️ 从 iCloud 导入",
          "📋 从剪贴板导入",
          "📝 从当前笔记导入",
          "📁 从文件导入"
        ],
        async (_, buttonIndex) => {
          if (buttonIndex === 0) {
            resolve(false);
            return;
          }
          
          const types = ["iCloud", "clipboard", "currentNote", "file"];
          const success = await this.importSearchConfigFrom(types[buttonIndex - 1]);
          resolve(success);
        }
      );
    });
  }

  /**
   * 管理搜索根目录界面
   * 提供根目录的管理功能
   */
  static async manageSearchRootsUI() {
    try {
      const options = [
        "📁 管理根目录列表",
        "🔄 调整根目录顺序",
        "➕ 添加当前卡片为根目录"
      ];
      
      const result = await MNUtil.userSelect(
        "管理搜索根目录",
        "选择操作：",
        options
      );
      
      if (result === null || result === 0) {
        return false;
      }
      
      switch (result) {
        case 1: // 管理根目录列表
          await this.showRootManagementDialog();
          break;
          
        case 2: // 调整根目录顺序
          await this.showRootOrderDialog();
          break;
          
        case 3: // 添加当前卡片
          const focusNote = MNNote.getFocusNote();
          if (focusNote) {
            const name = focusNote.noteTitle || "未命名";
            const key = "root_" + Date.now();
            this.addSearchRoot(key, name, focusNote.noteId);
            MNUtil.showHUD(`✅ 已添加根目录：${name}`);
          } else {
            MNUtil.showHUD("❌ 请先选择一个卡片");
          }
          break;
      }
      
      return true;
    } catch (error) {
      MNUtil.showHUD("❌ 操作失败：" + error.message);
      return false;
    }
  }

  /**
   * 管理同义词组界面
   * 提供同义词组的管理功能（保留原方法名兼容）
   */
  static async manageSynonymGroupsUI() {
    return this.manageSynonymGroups();
  }

  /**
   * 综合搜索配置管理界面（已废弃）
   * 此方法已被拆分为独立的配置功能，不再使用
   * @deprecated 使用 showSearchSettingsDialog、manageSearchRootsUI、manageSynonymGroups 等独立方法
   */
  /*
  static async manageSearchConfig() {
    // 此方法已废弃，功能已拆分为独立的配置管理方法
    MNUtil.showHUD("此功能已拆分为独立的配置管理方法");
    return false;
  }
  */

  /**
   * 显示搜索设置对话框
   */
  static async showSearchSettingsDialog() {
    this.initSearchConfig();
    
    const settings = [
      `${this.searchRootConfigs.includeClassification ? "☑️" : "☐︎"} 搜索归类卡片`,
      `${this.searchRootConfigs.onlyClassification ? "☑️" : "☐︎"} 只搜索归类卡片`,
      `${this.searchRootConfigs.ignorePrefix ? "☑️" : "☐︎"} 忽略前缀搜索`,
      `${this.searchRootConfigs.searchInKeywords ? "☑️" : "☐︎"} 搜索关键词字段`,
      `${this.searchRootConfigs.skipEmptyTitle ? "☑️" : "☐︎"} 跳过空白标题卡片`
    ];
    
    const result = await MNUtil.userSelect(
      "搜索设置",
      "点击切换设置状态：",
      settings
    );
    
    if (result === null || result === 0) {
      return false;
    }
    
    switch (result) {
      case 1:
        this.searchRootConfigs.includeClassification = !this.searchRootConfigs.includeClassification;
        break;
      case 2:
        this.searchRootConfigs.onlyClassification = !this.searchRootConfigs.onlyClassification;
        break;
      case 3:
        this.searchRootConfigs.ignorePrefix = !this.searchRootConfigs.ignorePrefix;
        break;
      case 4:
        this.searchRootConfigs.searchInKeywords = !this.searchRootConfigs.searchInKeywords;
        break;
      case 5:
        this.searchRootConfigs.skipEmptyTitle = !this.searchRootConfigs.skipEmptyTitle;
        break;
    }
    
    this.saveSearchConfig();
    MNUtil.showHUD("✅ 设置已更新");
    
    // 重新显示设置对话框
    await this.showSearchSettingsDialog();
    return true;
  }

  /**
   * 显示根目录排序对话框
   * @returns {Promise<boolean>} 是否修改了顺序
   */
  static async showRootOrderDialog() {
    try {
      this.initSearchConfig();
      
      // 确保有顺序数组
      if (!this.searchRootConfigs.rootsOrder) {
        this.searchRootConfigs.rootsOrder = Object.keys(this.searchRootConfigs.roots);
      }
      
      const roots = this.searchRootConfigs.roots;
      const currentOrder = this.searchRootConfigs.rootsOrder;
      const newOrder = [];
      const remainingKeys = new Set(currentOrder);
      
      MNUtil.showHUD("请依次点击根目录，设置新顺序");
      
      while (remainingKeys.size > 0) {
        const options = [];
        const keys = [];
        
        // 构建选项列表
        for (const key of remainingKeys) {
          if (roots[key]) {
            options.push(roots[key].name);
            keys.push(key);
          }
        }
        
        if (options.length === 0) break;
        
        // 显示选择对话框
        const result = await new Promise((resolve) => {
          UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
            `设置顺序 (${newOrder.length + 1}/${currentOrder.length})`,
            `已选择：${newOrder.map(k => roots[k].name).join(" → ")}\n\n请选择下一个：`,
            0,
            "完成",
            options,
            (alert, buttonIndex) => {
              if (buttonIndex === 0) {
                resolve(null);
              } else {
                resolve(keys[buttonIndex - 1]);
              }
            }
          );
        });
        
        if (result === null) {
          // 用户点击完成，将剩余的按原顺序添加
          for (const key of currentOrder) {
            if (remainingKeys.has(key)) {
              newOrder.push(key);
            }
          }
          break;
        }
        
        // 添加选中的项
        newOrder.push(result);
        remainingKeys.delete(result);
      }
      
      // 保存新顺序
      this.searchRootConfigs.rootsOrder = newOrder;
      this.saveSearchConfig();
      
      return true;
    } catch (error) {
      MNUtil.log("调整根目录顺序失败: " + error.toString());
      MNUtil.showHUD("调整顺序失败：" + error.message);
      return false;
    }
  }
  
  /**
   * 显示根目录管理对话框
   * @returns {Promise<boolean>} 是否进行了修改
   */
  static async showRootManagementDialog() {
    try {
      this.initSearchConfig();
      
      // 获取所有根目录
      const roots = this.searchRootConfigs.roots;
      const rootsOrder = this.searchRootConfigs.rootsOrder || Object.keys(roots);
      
      // 构建选项列表
      const options = [];
      const keys = [];
      
      for (const key of rootsOrder) {
        if (roots[key]) {
          const root = roots[key];
          const prefix = root.isDefault ? "📌 " : "";
          const suffix = root.skipEmptyTitleByDefault ? " [跳过空白]" : "";
          options.push(prefix + root.name + suffix);
          keys.push(key);
        }
      }
      
      if (options.length === 0) {
        MNUtil.showHUD("没有可管理的根目录");
        return false;
      }
      
      // 显示选择对话框
      const selectedKey = await new Promise((resolve) => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "管理根目录",
          "选择要管理的根目录：",
          0,
          "取消",
          options,
          (alert, buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(null);
            } else {
              resolve(keys[buttonIndex - 1]);
            }
          }
        );
      });
      
      if (!selectedKey) return false;
      
      const selectedRoot = roots[selectedKey];
      
      // 显示操作选项
      const action = await new Promise((resolve) => {
        const skipEmptyStatus = selectedRoot.skipEmptyTitleByDefault ? "✅" : "☐";
        const buttons = [
          "编辑名称", 
          "更改卡片",
          `${skipEmptyStatus} 默认跳过空白标题`
        ];
        if (selectedKey !== "default") {
          buttons.push("删除");
        }
        
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          selectedRoot.name,
          `ID: ${selectedRoot.id}\n选择操作：`,
          0,
          "取消",
          buttons,
          (alert, buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(null);
            } else {
              resolve(buttons[buttonIndex - 1]);
            }
          }
        );
      });
      
      if (!action) return false;
      
      let modified = false;
      
      switch (action) {
        case "编辑名称":
          const newName = await new Promise((resolve) => {
            UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
              "编辑名称",
              `当前名称：${selectedRoot.name}\n请输入新名称：`,
              2, // 输入框样式
              "取消",
              ["确定"],
              (alertView, buttonIndex) => {
                if (buttonIndex === 1) {
                  resolve(alertView.textFieldAtIndex(0).text.trim());
                } else {
                  resolve(null);
                }
              }
            );
            // 设置默认值
            MNUtil.delay(0.01).then(() => {
              try {
                const currentAlert = UIAlertView.currentAlertView();
                if (currentAlert && currentAlert.textFieldAtIndex) {
                  const textField = currentAlert.textFieldAtIndex(0);
                  if (textField) textField.text = selectedRoot.name;
                }
              } catch (e) {}
            });
          });
          
          if (newName && newName !== selectedRoot.name) {
            modified = this.editSearchRoot(selectedKey, newName);
            if (modified) {
              MNUtil.showHUD("✅ 已更新名称");
            }
          }
          break;
          
        case "更改卡片":
          const focusNote = MNNote.getFocusNote();
          if (!focusNote) {
            MNUtil.showHUD("请先选择一个卡片");
            break;
          }
          
          const confirmed = await MNUtil.confirm(
            "更改根目录卡片",
            `将根目录"${selectedRoot.name}"更改为当前选中的卡片？`
          );
          
          if (confirmed) {
            modified = this.editSearchRoot(selectedKey, null, focusNote.noteId);
            if (modified) {
              MNUtil.showHUD("✅ 已更改卡片");
            }
          }
          break;
          
        case "删除":
          const deleteConfirmed = await MNUtil.confirm(
            "删除根目录",
            `确定要删除"${selectedRoot.name}"吗？`
          );
          
          if (deleteConfirmed) {
            modified = this.deleteSearchRoot(selectedKey);
            if (modified) {
              MNUtil.showHUD("✅ 已删除");
            }
          }
          break;
          
        default:
          // 处理跳过空白标题选项
          if (action && action.includes("默认跳过空白标题")) {
            // 切换状态
            selectedRoot.skipEmptyTitleByDefault = !selectedRoot.skipEmptyTitleByDefault;
            this.saveSearchConfig();
            MNUtil.showHUD(selectedRoot.skipEmptyTitleByDefault ? 
              "✅ 已启用默认跳过空白标题" : 
              "☐ 已禁用默认跳过空白标题"
            );
            modified = true;
          }
          break;
      }
      
      return modified;
    } catch (error) {
      MNUtil.log("管理根目录失败: " + error.toString());
      MNUtil.showHUD("操作失败：" + error.message);
      return false;
    }
  }
  
  /**
   * 从卡片中提取关键词字段的内容
   * @param {MNNote} note - 要提取关键词的卡片
   * @returns {string} 关键词内容，如果没有则返回空字符串
   */
  static getKeywordsFromNote(note) {
    try {
      // 遍历所有评论
      const comments = note.MNComments;
      
      for (const comment of comments) {
        // 查找 HtmlComment/HtmlNote 类型且以"关键词"开头的评论
        if ((comment.type === "HtmlComment" || comment.type === "HtmlNote") && comment.text) {
          // 使用正则表达式匹配"关键词："或"关键词： "后的内容
          const match = comment.text.match(/^关键词[:：]\s*(.*)$/);
          if (match) {
            // 返回关键词内容（去除首尾空格）
            return match[1].trim();
          }
        }
      }
      
      // 没有找到关键词字段
      return "";
    } catch (error) {
      MNUtil.log(`getKeywordsFromNote error: ${error}`);
      return "";
    }
  }

  /**
   * 获取所有同义词组
   */
  static getSynonymGroups() {
    this.initSearchConfig();
    return this.searchRootConfigs.synonymGroups || [];
  }

  /**
   * 智能解析同义词输入
   * 支持多种分隔符，优先级如下：
   * 1. 逗号分隔（中英文）
   * 2. 分号分隔（中英文）
   * 3. 两个或更多连续空格
   * 4. 单空格分隔（仅当没有其他分隔符时）
   * @param {string} input - 用户输入的词汇字符串
   * @returns {Array<string>} 解析后的词汇数组
   */
  static parseWords(input) {
    // 移除首尾空格
    input = input.trim();
    
    // 优先级1：逗号分割
    if (input.includes(',') || input.includes('，')) {
      return input.split(/[,，]/).map(w => w.trim()).filter(w => w);
    }
    
    // 优先级2：分号分割
    if (input.includes(';') || input.includes('；')) {
      return input.split(/[;；]/).map(w => w.trim()).filter(w => w);
    }
    
    // 优先级3：两个或更多连续空格
    if (/\s{2,}/.test(input)) {
      return input.split(/\s{2,}/).map(w => w.trim()).filter(w => w);
    }
    
    // 优先级4：单空格分割
    return input.split(/\s+/).map(w => w.trim()).filter(w => w);
  }

  /**
   * 添加同义词组
   * @param {string} name - 组名
   * @param {Array<string>} words - 词汇数组
   * @param {boolean} partialReplacement - 是否启用局部替换（默认 false）
   * @param {Array<string>} contextTriggers - 上下文触发词数组（可选）
   * @param {string} contextMode - 上下文匹配模式："any"（默认）或 "all"
   * @param {boolean} caseSensitive - 是否大小写敏感（默认 false）
   * @param {boolean} patternMode - 是否启用模式匹配（默认 false）
   */
  static addSynonymGroup(name, words, partialReplacement = false, contextTriggers = undefined, contextMode = "any", caseSensitive = false, patternMode = false) {
    this.initSearchConfig();
    const group = {
      id: "group_" + Date.now(),
      name: name,
      words: words,
      enabled: true,
      partialReplacement: partialReplacement,  // 局部替换字段
      contextTriggers: contextTriggers,  // 上下文触发词
      contextMode: contextMode,          // 匹配模式
      caseSensitive: caseSensitive,      // 大小写敏感
      patternMode: patternMode,          // 模式匹配（新增）
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    if (!this.searchRootConfigs.synonymGroups) {
      this.searchRootConfigs.synonymGroups = [];
    }
    
    this.searchRootConfigs.synonymGroups.push(group);
    this.saveSearchConfig();
    return group;
  }

  /**
   * 更新同义词组
   * @param {string} id - 组ID
   * @param {Object} updates - 更新内容
   */
  static updateSynonymGroup(id, updates) {
    this.initSearchConfig();
    const groups = this.searchRootConfigs.synonymGroups || [];
    const group = groups.find(g => g.id === id);
    
    if (group) {
      Object.assign(group, updates);
      group.updatedAt = Date.now();
      this.saveSearchConfig();
      return true;
    }
    return false;
  }

  /**
   * 删除同义词组
   * @param {string} id - 组ID
   */
  static deleteSynonymGroup(id) {
    this.initSearchConfig();
    const groups = this.searchRootConfigs.synonymGroups || [];
    const index = groups.findIndex(g => g.id === id);
    
    if (index !== -1) {
      groups.splice(index, 1);
      this.saveSearchConfig();
      return true;
    }
    return false;
  }

  /**
   * 转义正则表达式特殊字符
   * @param {string} str - 要转义的字符串
   * @returns {string} 转义后的字符串
   */
  static escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 判断空格处理规则
   * @param {string} from - 原始词
   * @param {string} to - 替换词
   * @returns {string} 空格处理规则：'removeSpace' | 'addSpace' | 'direct'
   */
  static getSpacingRule(from, to) {
    const isFromSymbol = /^[^\u4e00-\u9fa5a-zA-Z]+$/.test(from);  // 非中英文
    const isToSymbol = /^[^\u4e00-\u9fa5a-zA-Z]+$/.test(to);
    const isFromChinese = /[\u4e00-\u9fa5]/.test(from);
    const isToChinese = /[\u4e00-\u9fa5]/.test(to);
    const isFromEnglish = /[a-zA-Z]/.test(from);
    const isToEnglish = /[a-zA-Z]/.test(to);
    
    // 符号和中文之间的转换
    if (isFromSymbol && isToChinese) return 'removeSpace';
    if (isFromChinese && isToSymbol) return 'keepOrAdd';
    
    // 中英文之间的转换
    if (isFromChinese && isToEnglish) return 'addSpace';
    if (isFromEnglish && isToChinese) return 'removeSpace';
    
    return 'direct';
  }

  /**
   * 编译模式为正则表达式
   * @param {string} pattern - 包含{{}}占位符的模式
   * @returns {Object} 返回 {regex: RegExp, captureCount: number}
   */
  static compilePattern(pattern) {
    try {
      // 缓存编译结果
      if (!this._patternCache) {
        this._patternCache = new Map();
      }
      
      if (this._patternCache.has(pattern)) {
        return this._patternCache.get(pattern);
      }
      
      // 转义正则表达式特殊字符，但保留{{}}
      let escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, (match) => {
        // 不转义{{和}}
        if (match === '{' || match === '}') {
          return match;
        }
        return '\\' + match;
      });
      
      // 将{{}}替换为非贪婪捕获组
      let captureCount = 0;
      const regexPattern = escapedPattern.replace(/\{\{\}\}/g, () => {
        captureCount++;
        return '(.*?)';  // 非贪婪匹配任意内容
      });
      
      const regex = new RegExp('^' + regexPattern + '$', 'i');  // 不区分大小写
      const result = { regex, captureCount };
      
      // 缓存结果
      this._patternCache.set(pattern, result);
      
      return result;
    } catch (error) {
      MNUtil.log(`模式编译失败: ${pattern}, 错误: ${error.message}`);
      return null;
    }
  }

  /**
   * 使用模式匹配文本并提取捕获组
   * @param {string} text - 要匹配的文本
   * @param {string} pattern - 模式字符串
   * @returns {Object|null} 返回 {matches: boolean, captures: Array<string>} 或 null
   */
  static matchPattern(text, pattern) {
    const compiled = this.compilePattern(pattern);
    if (!compiled) return null;
    
    const match = text.match(compiled.regex);
    if (!match) return null;
    
    return {
      matches: true,
      captures: match.slice(1)  // 排除完整匹配，只要捕获组
    };
  }

  /**
   * 生成模式匹配的变体
   * @param {string} keyword - 原始关键词
   * @param {Object} group - 同义词组
   * @returns {Array<string>} 生成的变体数组
   */
  static generatePatternVariants(keyword, group) {
    const variants = new Set();
    
    if (!group.patternMode || !group.words) return Array.from(variants);
    
    // 尝试匹配keyword到组内的每个模式
    for (const pattern of group.words) {
      if (!pattern.includes('{{}}')) continue;  // 跳过没有占位符的词
      
      const matchResult = this.matchPattern(keyword, pattern);
      if (matchResult && matchResult.matches) {
        // 匹配成功，生成其他模式的变体
        const captures = matchResult.captures;
        
        for (const targetPattern of group.words) {
          if (targetPattern === pattern) continue;  // 跳过自己
          
          let variant = targetPattern;
          
          if (targetPattern.includes('{{}}')) {
            // 目标也是模式，替换占位符
            let captureIndex = 0;
            variant = targetPattern.replace(/\{\{\}\}/g, () => {
              return captures[captureIndex++] || '';
            });
          }
          // 如果目标不是模式（没有占位符），直接使用
          
          variants.add(variant);
        }
      }
    }
    
    return Array.from(variants);
  }

  /**
   * 生成局部替换变体
   * @param {string} keyword - 原始关键词
   * @param {Object} group - 同义词组
   * @returns {Array<string>} 生成的变体数组
   */
  static generatePartialReplacements(keyword, group) {
    const variants = new Set();
    
    if (!group.partialReplacement || !group.words) return Array.from(variants);
    
    // 对组内每个词进行检查
    for (const word of group.words) {
      if (keyword.includes(word)) {
        // 生成所有其他词的替换变体
        for (const replacement of group.words) {
          if (replacement === word) continue;  // 跳过自己
          
          let variant = keyword;
          const spacingRule = this.getSpacingRule(word, replacement);
          
          switch (spacingRule) {
            case 'removeSpace':
              // 移除前后空格
              const regex = new RegExp(`\\s*${this.escapeRegex(word)}\\s*`, 'g');
              variant = variant.replace(regex, replacement);
              break;
              
            case 'addSpace':
              // 添加空格
              variant = variant.replace(word, ` ${replacement} `);
              variant = variant.replace(/\s+/g, ' ').trim();
              break;
              
            case 'keepOrAdd':
              // 如果原本有空格则保持，没有则添加
              if (keyword.includes(` ${word} `)) {
                variant = variant.replace(` ${word} `, ` ${replacement} `);
              } else if (keyword.includes(`${word} `)) {
                variant = variant.replace(`${word} `, `${replacement} `);
              } else if (keyword.includes(` ${word}`)) {
                variant = variant.replace(` ${word}`, ` ${replacement}`);
              } else {
                variant = variant.replace(word, ` ${replacement} `);
                variant = variant.replace(/\s+/g, ' ').trim();
              }
              break;
              
            default:
              // 直接替换
              variant = variant.replace(word, replacement);
          }
          
          if (variant !== keyword) {
            variants.add(variant);
          }
        }
      }
    }
    
    return Array.from(variants);
  }

  /**
   * 扩展关键词（核心功能）
   * 根据同义词组扩展输入的关键词
   * @param {Array<string>} keywords - 原始关键词数组
   * @returns {Array<string>} 扩展后的关键词数组
   */
  /**
   * 扩展关键词并返回分组结构（用于"与"逻辑搜索）
   * @param {Array<string>} keywords - 原始关键词数组
   * @returns {Array<Array<string>>} 分组的关键词数组，每组包含原始词及其同义词
   */
  static expandKeywordsWithSynonymsGrouped(keywords, title = null) {
    const synonymGroups = this.getSynonymGroups();
    const keywordGroups = [];
    
    // 性能监控
    const startTime = Date.now();
    let contextCheckCount = 0;
    let skipCount = 0;
    
    for (const keyword of keywords) {
      const keywordGroup = new Set();
      // 先添加原始关键词
      keywordGroup.add(keyword);
      
      // 查找包含该关键词的同义词组
      for (const group of synonymGroups) {
        if (!group.enabled) continue;
        
        // 检查上下文触发条件
        if (group.contextTriggers && group.contextTriggers.length > 0 && title) {
          contextCheckCount++;
          // 有触发词配置，需要检查标题
          const matchesTrigger = this.checkContextTriggers(title, group.contextTriggers, group.contextMode);
          if (!matchesTrigger) {
            skipCount++;
            continue;  // 不满足触发条件，跳过此组
          }
        }
        
        // 根据 caseSensitive 字段决定匹配方式
        const caseSensitive = group.caseSensitive || false;
        
        // 1. 完整词匹配（支持大小写敏感）
        const foundInGroup = group.words.some(word => {
          if (caseSensitive) {
            return word === keyword;  // 大小写敏感匹配
          } else {
            return word.toLowerCase() === keyword.toLowerCase();  // 大小写不敏感匹配
          }
        });
        
        if (foundInGroup) {
          // 添加组内所有词
          group.words.forEach(word => keywordGroup.add(word));
        }
        
        // 2. 局部替换（新功能）
        if (group.partialReplacement) {
          const partialVariants = this.generatePartialReplacements(keyword, group);
          partialVariants.forEach(variant => keywordGroup.add(variant));
        }
        
        // 3. 模式匹配（新功能）
        if (group.patternMode) {
          const patternVariants = this.generatePatternVariants(keyword, group);
          patternVariants.forEach(variant => keywordGroup.add(variant));
        }
      }
      
      keywordGroups.push(Array.from(keywordGroup));
    }
    
    // 记录日志
    const totalExpanded = keywordGroups.reduce((sum, group) => sum + group.length, 0);
    if (totalExpanded > keywords.length) {
      const details = keywordGroups.map((g, i) => {
        if (g.length > 3) {
          return `  ${keywords[i]} → [${g.slice(0, 3).join(", ")}...共${g.length}个]`;
        } else {
          return `  ${keywords[i]} → [${g.join(", ")}]`;
        }
      }).join("\n");
      MNUtil.log(`关键词扩展详情：\n${details}`);
    }
    
    // 性能监控：记录统计信息
    const duration = Date.now() - startTime;
    if (duration > 10 || contextCheckCount > 0) { // 超过10ms或有上下文检查时记录
      MNUtil.log(`📊 关键词扩展性能统计：耗时${duration}ms 关键词${keywords.length}个 同义词组${synonymGroups.length}个 上下文检查${contextCheckCount}次 跳过${skipCount}个组${title ? ` 标题="${title.substring(0, 20)}..."` : ''}`);
    }
    
    return keywordGroups;
  }

  static expandKeywordsWithSynonyms(keywords, title = null) {
    const synonymGroups = this.getSynonymGroups();
    const expandedKeywords = new Set();
    
    for (const keyword of keywords) {
      // 先添加原始关键词
      expandedKeywords.add(keyword);
      
      // 查找包含该关键词的同义词组
      for (const group of synonymGroups) {
        if (!group.enabled) continue;
        
        // 检查上下文触发条件
        if (group.contextTriggers && group.contextTriggers.length > 0 && title) {
          // 有触发词配置，需要检查标题
          const matchesTrigger = this.checkContextTriggers(title, group.contextTriggers, group.contextMode);
          if (!matchesTrigger) {
            continue;  // 不满足触发条件，跳过此组
          }
        }
        
        // 根据 caseSensitive 字段决定匹配方式
        const caseSensitive = group.caseSensitive || false;
        
        // 检查关键词是否在组内
        const foundInGroup = group.words.some(word => {
          if (caseSensitive) {
            return word === keyword;  // 大小写敏感匹配
          } else {
            return word.toLowerCase() === keyword.toLowerCase();  // 大小写不敏感匹配
          }
        });
        
        if (foundInGroup) {
          // 添加组内所有词
          group.words.forEach(word => expandedKeywords.add(word));
        }
        
        // 检查模式匹配
        if (group.patternMode) {
          const patternVariants = this.generatePatternVariants(keyword, group);
          patternVariants.forEach(variant => expandedKeywords.add(variant));
        }
      }
    }
    
    const result = Array.from(expandedKeywords);
    
    // 如果扩展了关键词，记录日志
    if (result.length > keywords.length) {
      MNUtil.log(`关键词扩展：${keywords.join(", ")} → ${result.join(", ")}`);
    }
    
    return result;
  }
  
  /**
   * 检查标题是否匹配触发词
   * @param {string} title - 要检查的标题
   * @param {Array<string>} triggers - 触发词数组
   * @param {string} mode - 匹配模式："any" 或 "all"
   * @returns {boolean} 是否匹配
   */
  static checkContextTriggers(title, triggers, mode = "any") {
    // 快速跳过：无触发词或空标题直接返回 false
    if (!title || !triggers || triggers.length === 0) return false;
    
    // 性能监控（仅在调试模式下）
    const startTime = this.isDebugMode ? Date.now() : null;
    
    // 标题标准化（保持原样，因为触发词是大小写敏感的）
    const normalizedTitle = title;
    
    let result = false;
    if (mode === "all") {
      // 必须包含所有触发词 - 使用短路评估优化
      result = triggers.every(trigger => normalizedTitle.includes(trigger));
    } else {
      // 默认 "any" 模式：包含任意触发词即可 - 使用短路评估优化
      result = triggers.some(trigger => normalizedTitle.includes(trigger));
    }
    
    // 性能监控：记录超过阈值的调用
    if (startTime) {
      const duration = Date.now() - startTime;
      if (duration > 5) { // 超过5ms记录
        MNUtil.log(`⚠️ 上下文检查耗时 ${duration}ms: 标题="${title.substring(0, 30)}..." 触发词=${triggers.length}个`);
      }
    }
    
    return result;
  }

  /**
   * 获取所有排除词组
   */
  static getExclusionGroups() {
    this.initSearchConfig();
    return this.searchRootConfigs.exclusionGroups || [];
  }

  /**
   * 添加排除词组
   * @param {string} name - 组名
   * @param {Array<string>} triggerWords - 触发词数组
   * @param {Array<string>} excludeWords - 排除词数组
   */
  static addExclusionGroup(name, triggerWords, excludeWords) {
    this.initSearchConfig();
    const group = {
      id: "excl_" + Date.now(),
      name: name,
      triggerWords: triggerWords,
      excludeWords: excludeWords,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    if (!this.searchRootConfigs.exclusionGroups) {
      this.searchRootConfigs.exclusionGroups = [];
    }
    
    this.searchRootConfigs.exclusionGroups.push(group);
    this.saveSearchConfig();
    return group;
  }

  /**
   * 更新排除词组
   * @param {string} id - 组ID
   * @param {Object} updates - 更新内容
   */
  static updateExclusionGroup(id, updates) {
    this.initSearchConfig();
    const groups = this.searchRootConfigs.exclusionGroups || [];
    const group = groups.find(g => g.id === id);
    
    if (group) {
      Object.assign(group, updates);
      group.updatedAt = Date.now();
      this.saveSearchConfig();
      return true;
    }
    return false;
  }

  /**
   * 删除排除词组
   * @param {string} id - 组ID
   */
  static deleteExclusionGroup(id) {
    this.initSearchConfig();
    const groups = this.searchRootConfigs.exclusionGroups || [];
    const index = groups.findIndex(g => g.id === id);
    
    if (index !== -1) {
      groups.splice(index, 1);
      this.saveSearchConfig();
      return true;
    }
    return false;
  }

  /**
   * 根据关键词获取激活的排除词列表和详细信息
   * @param {Array<string>} keywords - 关键词数组
   * @returns {Object} 包含排除词列表和详细信息的对象
   */
  static getActiveExclusions(keywords) {
    const exclusions = new Set();
    const activeTriggers = new Set();
    const activeGroups = [];
    const groups = this.getExclusionGroups();
    
    for (const keyword of keywords) {
      for (const group of groups) {
        if (!group.enabled) continue;
        
        // 检查是否匹配触发词（不区分大小写）
        const matchedTrigger = group.triggerWords.find(trigger => 
          trigger.toLowerCase() === keyword.toLowerCase()
        );
        
        if (matchedTrigger) {
          // 记录激活的触发词
          activeTriggers.add(matchedTrigger);
          
          // 添加所有排除词
          group.excludeWords.forEach(word => exclusions.add(word));
          
          // 记录激活的组（避免重复）
          if (!activeGroups.find(g => g.id === group.id)) {
            activeGroups.push({
              id: group.id,
              name: group.name,
              triggerWords: group.triggerWords,
              excludeWords: group.excludeWords
            });
          }
          
          MNUtil.log(`触发排除词组 "${group.name}": ${keyword} → 排除 [${group.excludeWords.join(", ")}]`);
        }
      }
    }
    
    return {
      excludeWords: Array.from(exclusions),
      triggerWords: Array.from(activeTriggers),
      groups: activeGroups
    };
  }

  /**
   * 导出同义词组配置
   * @returns {string|null} JSON 字符串或 null
   */
  static exportSynonymGroups() {
    try {
      this.initSearchConfig();
      const config = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        synonymGroups: this.getSynonymGroups(),
        searchRootConfigs: {
          includeClassification: this.searchRootConfigs.includeClassification,
          ignorePrefix: this.searchRootConfigs.ignorePrefix,
          searchInKeywords: this.searchRootConfigs.searchInKeywords,
          skipEmptyTitle: this.searchRootConfigs.skipEmptyTitle
        }
      };
      
      const jsonStr = JSON.stringify(config, null, 2);
      
      // 复制到剪贴板
      MNUtil.copy(jsonStr);
      
      // 保存到文件（可选）
      const fileName = `synonym_groups_${Date.now()}.json`;
      const documentsPath = NSFileManager.defaultManager().documentsPath;
      if (documentsPath) {
        const filePath = documentsPath + "/" + fileName;
        try {
          NSString.stringWithString(jsonStr).writeToFileAtomicallyEncodingError(
            filePath, true, 4, null // NSUTF8StringEncoding = 4
          );
          MNUtil.showHUD(`✅ 已导出配置\n📋 已复制到剪贴板\n📁 文件：${fileName}`);
        } catch (fileError) {
          // 文件保存失败，但剪贴板成功
          MNUtil.showHUD(`✅ 已导出配置\n📋 已复制到剪贴板`);
        }
      } else {
        MNUtil.showHUD(`✅ 已导出配置\n📋 已复制到剪贴板`);
      }
      
      return jsonStr;
    } catch (error) {
      MNUtil.showHUD("❌ 导出失败：" + error.message);
      MNUtil.log("导出同义词组失败: " + error.toString());
      return null;
    }
  }

  /**
   * 格式化 JSON 为 Markdown 代码块
   * @param {string} jsonStr - JSON 字符串
   * @returns {string} 格式化后的 Markdown 代码块
   */
  static formatJsonAsCodeBlock(jsonStr) {
    return `\`\`\`json\n${jsonStr}\n\`\`\``;
  }

  /**
   * 从 Markdown 代码块中提取 JSON
   * @param {string} text - 包含代码块的文本
   * @returns {string|null} 提取的 JSON 字符串，失败返回 null
   */
  static extractJsonFromCodeBlock(text) {
    // 尝试提取 ```json ... ``` 格式的内容
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    
    // 如果没有代码块格式，直接返回原文本（兼容旧格式）
    return text;
  }

  /**
   * 在笔记中查找同义词配置评论
   * @param {MNNote} note - 笔记对象
   * @returns {Object|null} 返回 {index: 评论索引, comment: 评论对象} 或 null
   */
  static findSynonymConfigComment(note) {
    if (!note || !note.comments) return null;
    
    for (let i = 0; i < note.comments.length; i++) {
      const comment = note.comments[i];
      if (comment.type === "textComment" && comment.text.includes('"synonymGroups"')) {
        return {
          index: i,
          comment: comment
        };
      }
    }
    return null;
  }

  /**
   * 同义词配置导出到指定目标
   * @param {string} target - 导出目标: 'icloud', 'clipboard', 'note', 'file'
   * @returns {Promise<boolean>} 导出是否成功
   */
  static async exportSynonymConfigTo(target) {
    try {
      this.initSearchConfig();
      const config = {
        version: "1.0",
        type: "synonymGroups",
        exportDate: new Date().toISOString(),
        synonymGroups: this.getSynonymGroups()
      };
      
      const jsonStr = JSON.stringify(config, null, 2);
      
      switch (target) {
        case 'icloud':
          MNUtil.setByiCloud("knowledgeBaseTemplate_SynonymGroups_Config", jsonStr);
          MNUtil.showHUD("✅ 已同步到 iCloud");
          return true;
          
        case 'clipboard':
          MNUtil.copy(jsonStr);
          MNUtil.showHUD("✅ 已复制到剪贴板");
          return true;
          
        case 'note':
          const focusNote = MNNote.getFocusNote();
          if (!focusNote) {
            MNUtil.showHUD("❌ 请先选中一个笔记");
            return false;
          }
          
          // 格式化为 Markdown 代码块
          const formattedJson = this.formatJsonAsCodeBlock(jsonStr);
          
          // 查找已有的同义词配置评论
          const existingConfig = this.findSynonymConfigComment(focusNote);
          
          if (existingConfig) {
            // 替换已有配置
            focusNote.MNComments[existingConfig.index].text = formattedJson;
            MNUtil.showHUD("✅ 已更新当前笔记中的配置");
          } else {
            // 添加新配置
            focusNote.appendTextComment(formattedJson);
            MNUtil.showHUD("✅ 已保存到当前笔记");
          }
          return true;
          
        case 'file':
          const fileName = `synonym_groups_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
          const documentsPath = NSFileManager.defaultManager().documentsPath;
          if (documentsPath) {
            const filePath = documentsPath + "/" + fileName;
            NSString.stringWithString(jsonStr).writeToFileAtomicallyEncodingError(
              filePath, true, 4, null // NSUTF8StringEncoding = 4
            );
            MNUtil.showHUD(`✅ 已导出到文件\n📁 ${fileName}`);
            return true;
          } else {
            throw new Error("无法访问文档目录");
          }
          
        default:
          throw new Error("未知的导出目标");
      }
    } catch (error) {
      MNUtil.showHUD(`❌ 导出到 ${target} 失败：${error.message}`);
      MNUtil.log(`导出同义词配置到 ${target} 失败: ${error.toString()}`);
      return false;
    }
  }

  /**
   * 从指定来源导入同义词配置
   * @param {string} source - 导入来源: 'icloud', 'clipboard', 'note', 'file'
   * @returns {Promise<boolean>} 导入是否成功
   */
  static async importSynonymConfigFrom(source) {
    try {
      let jsonStr = null;
      
      switch (source) {
        case 'icloud':
          jsonStr = MNUtil.getByiCloud("knowledgeBaseTemplate_SynonymGroups_Config", null);
          if (!jsonStr) {
            MNUtil.showHUD("❌ iCloud 中未找到同义词配置");
            return false;
          }
          break;
          
        case 'clipboard':
          jsonStr = MNUtil.clipboardText;
          if (!jsonStr) {
            MNUtil.showHUD("❌ 剪贴板为空");
            return false;
          }
          break;
          
        case 'note':
          const focusNote = MNNote.getFocusNote();
          if (!focusNote) {
            MNUtil.showHUD("❌ 请先选中包含配置的笔记");
            return false;
          }
          
          // 使用辅助方法查找同义词配置评论
          const configComment = this.findSynonymConfigComment(focusNote);
          if (!configComment) {
            MNUtil.showHUD("❌ 当前笔记中未找到同义词配置");
            return false;
          }
          
          // 从评论中提取 JSON（支持代码块格式和纯文本格式）
          jsonStr = this.extractJsonFromCodeBlock(configComment.comment.text);
          if (!jsonStr) {
            MNUtil.showHUD("❌ 无法解析笔记中的配置格式");
            return false;
          }
          break;
          
        case 'file':
          // 文件导入需要用户选择文件，这里先提示
          MNUtil.showHUD("❌ 文件导入功能需要手动实现文件选择");
          return false;
          
        default:
          throw new Error("未知的导入来源");
      }
      
      return await this.importSynonymGroups(jsonStr);
    } catch (error) {
      MNUtil.showHUD(`❌ 从 ${source} 导入失败：${error.message}`);
      MNUtil.log(`从 ${source} 导入同义词配置失败: ${error.toString()}`);
      return false;
    }
  }

  /**
   * 显示同义词导出选择对话框
   */
  static async showExportSynonymDialog() {
    const options = [
      "☁️ 同步到 iCloud",
      "📋 复制到剪贴板", 
      "📝 保存到当前笔记",
      "📁 导出到文件"
    ];
    
    const result = await MNUtil.userSelect(
      "导出同义词配置",
      "选择导出方式：",
      options
    );
    
    if (result === null || result === 0) return;
    
    const targets = ['icloud', 'clipboard', 'note', 'file'];
    await this.exportSynonymConfigTo(targets[result - 1]);
  }

  /**
   * 显示同义词导入选择对话框
   */
  static async showImportSynonymDialog() {
    const options = [
      "☁️ 从 iCloud 同步",
      "📋 从剪贴板导入",
      "📝 从当前笔记导入"
      // 暂时不包含文件导入
    ];
    
    const result = await MNUtil.userSelect(
      "导入同义词配置",
      "选择导入来源：",
      options
    );
    
    if (result === null || result === 0) return;
    
    const sources = ['icloud', 'clipboard', 'note'];
    await this.importSynonymConfigFrom(sources[result - 1]);
  }

  /**
   * 导入同义词组配置
   * @param {string} jsonStr - JSON 字符串
   * @returns {Promise<boolean>} 是否成功
   */
  static async importSynonymGroups(jsonStr) {
    try {
      const config = JSON.parse(jsonStr);
      
      // 验证数据格式
      if (!config.version || !config.synonymGroups) {
        throw new Error("无效的配置格式");
      }
      
      // 询问导入方式
      return new Promise((resolve) => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "导入配置",
          `将导入 ${config.synonymGroups.length} 个同义词组\n选择导入方式：`,
          0,
          "取消",
          ["替换现有配置", "合并配置（保留现有）"],
          (alert, buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(false); // 取消
              return;
            }
            
            this.initSearchConfig();
            
            // 处理兼容性：为导入的同义词组添加新字段的默认值
            const processedGroups = config.synonymGroups.map(group => {
              // 确保新字段有正确的默认值
              const processedGroup = {
                ...group,
                // 如果没有 contextTriggers 字段，设为 undefined（全局模式）
                contextTriggers: group.contextTriggers !== undefined ? group.contextTriggers : undefined,
                // 如果没有 contextMode 字段，设为默认值 "any"
                contextMode: group.contextMode || "any",
                // 如果没有 caseSensitive 字段，设为默认值 false
                caseSensitive: group.caseSensitive !== undefined ? group.caseSensitive : false,
                // 如果没有 patternMode 字段，设为默认值 false
                patternMode: group.patternMode !== undefined ? group.patternMode : false
              };

              // 验证 contextMode 的有效性
              if (processedGroup.contextMode && !["any", "all"].includes(processedGroup.contextMode)) {
                processedGroup.contextMode = "any";
              }

              // 验证 caseSensitive 的有效性
              if (typeof processedGroup.caseSensitive !== 'boolean') {
                processedGroup.caseSensitive = false;
              }

              // 验证 contextTriggers 的有效性
              if (processedGroup.contextTriggers && !Array.isArray(processedGroup.contextTriggers)) {
                processedGroup.contextTriggers = undefined;
              }

              return processedGroup;
            });

            if (buttonIndex === 1) {
              // 替换模式
              this.searchRootConfigs.synonymGroups = processedGroups;
              if (config.searchRootConfigs) {
                Object.assign(this.searchRootConfigs, config.searchRootConfigs);
              }
            } else if (buttonIndex === 2) {
              // 合并模式
              const existingIds = new Set(this.searchRootConfigs.synonymGroups.map(g => g.id));
              let addedCount = 0;
              
              for (const group of processedGroups) {
                if (!existingIds.has(group.id)) {
                  // 生成新ID避免冲突
                  group.id = "group_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
                  this.searchRootConfigs.synonymGroups.push(group);
                  addedCount++;
                }
              }
              
              if (addedCount < processedGroups.length) {
                MNUtil.showHUD(`✅ 已导入 ${addedCount}/${processedGroups.length} 个同义词组\n${processedGroups.length - addedCount} 个重复组已跳过`);
              } else {
                MNUtil.showHUD(`✅ 已导入 ${addedCount} 个同义词组`);
              }
              this.saveSearchConfig();
              resolve(true);
              return;
            }
            
            this.saveSearchConfig();
            MNUtil.showHUD(`✅ 已导入 ${config.synonymGroups.length} 个同义词组`);
            resolve(true);
          }
        );
      });
    } catch (error) {
      MNUtil.showHUD("❌ 导入失败：" + error.message);
      MNUtil.log("导入同义词组失败: " + error.toString());
      return false;
    }
  }

  /**
   * 从剪贴板导入同义词组配置
   * @returns {Promise<boolean>} 是否成功
   */
  static async importSynonymGroupsFromClipboard() {
    const clipboardText = MNUtil.clipboardText;
    if (!clipboardText) {
      MNUtil.showHUD("❌ 剪贴板为空");
      return false;
    }
    
    // 检查是否是 JSON 格式
    try {
      JSON.parse(clipboardText);
    } catch (error) {
      MNUtil.showHUD("❌ 剪贴板内容不是有效的 JSON 格式");
      return false;
    }
    
    return await this.importSynonymGroups(clipboardText);
  }

  /**
   * 搜索笔记主函数（支持多根目录）
   * @param {Array<string>} keywords - 关键词数组
   * @param {string|Array<string>} rootNoteIds - 根目录 ID（单个或多个）
   * @param {Set|null} selectedTypes - 选中的类型集合，null 表示全选
   */
  static async searchNotesInDescendants(keywords, rootNoteIds, selectedTypes = null) {
    try {
      // 确保 rootNoteIds 是数组
      if (!Array.isArray(rootNoteIds)) {
        rootNoteIds = rootNoteIds ? [rootNoteIds] : [];
      }
      
      if (rootNoteIds.length === 0) {
        MNUtil.showHUD("请选择至少一个根目录");
        return [];
      }
      
      // 获取正则搜索配置
      const enableRegexSearch = this.searchRootConfigs ? this.searchRootConfigs.enableRegexSearch : false;
      
      // 解析关键词，识别正则表达式
      const parsedKeywords = keywords.map(keyword => this.parseSearchKeyword(keyword, enableRegexSearch));
      
      // 获取分组的扩展关键词（用于"与"逻辑搜索）
      // 注意：这里先不传递标题，因为每个卡片的标题不同，将在后面的循环中动态扩展
      const baseExpandedKeywordGroups = this.expandKeywordsWithSynonymsGrouped(keywords);
      
      // 计算总扩展词数用于显示
      const totalExpandedCount = baseExpandedKeywordGroups.reduce((sum, group) => sum + group.length, 0);
      if (totalExpandedCount > keywords.length) {
        MNUtil.showHUD(`🔄 关键词已扩展：${keywords.length}个词组，共${totalExpandedCount}个词`);
        await MNUtil.delay(0.5);
      }
      
      // 如果启用了正则搜索，显示提示
      if (enableRegexSearch) {
        const regexCount = parsedKeywords.filter(k => k.type === 'regex').length;
        if (regexCount > 0) {
          MNUtil.showHUD(`🔤 正则模式：${regexCount}个正则表达式`);
          await MNUtil.delay(0.5);
        }
      }
      
      // 获取激活的排除词信息
      const exclusionInfo = this.getActiveExclusions(keywords);
      if (exclusionInfo.excludeWords.length > 0) {
        MNUtil.showHUD(`🚫 将智能过滤包含排除词的结果`);
        await MNUtil.delay(0.5);
      }
      
      // 获取配置中的跳过空标题设置
      const skipEmptyTitle = this.searchRootConfigs ? this.searchRootConfigs.skipEmptyTitle : false;
      if (skipEmptyTitle) {
        MNUtil.showHUD(`🚫 已启用跳过空白标题卡片`);
        await MNUtil.delay(0.5);
      }
      
      // 显示获取卡片列表的进度
      MNUtil.showHUD(`⛳ 正在从 ${rootNoteIds.length} 个根目录获取卡片列表...`);
      
      // 获取所有根目录的子孙卡片，使用 Set 去重
      const allDescendantsSet = new Set();
      const rootNoteInfos = [];  // 存储根目录信息，用于后续显示
      
      for (const rootNoteId of rootNoteIds) {
        const rootNote = MNNote.new(rootNoteId);
        if (!rootNote) {
          MNUtil.log(`根目录卡片不存在: ${rootNoteId}`);
          continue;
        }
        
        // 保存根目录信息
        rootNoteInfos.push({
          id: rootNoteId,
          name: rootNote.noteTitle || "无标题"
        });
        
        // 获取该根目录的所有子孙卡片（根据配置决定是否跳过空标题）
        const descendants = skipEmptyTitle 
          ? this.getAllDescendantNotesWithSkipEmpty(rootNote, true, rootNoteIds)
          : this.getAllDescendantNotes(rootNote);
        
        // 添加到 Set 中去重（基于 noteId）
        for (const note of descendants) {
          allDescendantsSet.add(note);
        }
        
        MNUtil.log(`根目录 "${rootNote.noteTitle}": ${descendants.length} 个卡片`);
      }
      
      // 转换为数组
      const allDescendants = Array.from(allDescendantsSet);
      MNUtil.log(`总共在 ${allDescendants.length} 个卡片中搜索（已去重）`);
      
      // 显示搜索进度
      MNUtil.showHUD(`🔍 正在搜索 ${allDescendants.length} 个卡片...`);
      
      // 获取配置中的归类卡片设置
      const includeClassification = this.searchRootConfigs ? this.searchRootConfigs.includeClassification : true;
      const onlyClassification = this.searchRootConfigs ? this.searchRootConfigs.onlyClassification : false;
      // 获取配置中的忽略前缀设置
      const ignorePrefix = this.searchRootConfigs ? this.searchRootConfigs.ignorePrefix : false;
      
      // 过滤符合条件的卡片
      const results = [];
      let processedCount = 0;
      
      for (const note of allDescendants) {
        const mnNote = MNNote.new(note);
        const title = mnNote.noteTitle || "";
        
        // 每处理 100 个卡片显示一次进度
        processedCount++;
        if (processedCount % 100 === 0) {
          MNUtil.showHUD(`🔍 正在搜索... (${processedCount}/${allDescendants.length})`);
          // 延迟一下，让UI有机会更新
          await MNUtil.delay(0.01);
        }
        
        // 获取卡片类型
        const noteType = this.getNoteType(mnNote);
        
        // 处理归类卡片的过滤逻辑
        if (onlyClassification) {
          // 只搜索归类卡片模式
          if (noteType !== "归类") {
            continue;  // 跳过非归类卡片
          }
        } else if (!includeClassification && noteType === "归类") {
          // 不包含归类卡片模式
          continue;  // 跳过归类卡片
        }
        
        // 如果用户选择了特定类型，进行类型筛选（只搜索归类卡片时忽略类型筛选）
        if (!onlyClassification && selectedTypes !== null && selectedTypes.size > 0) {
          if (!selectedTypes.has(noteType)) {
            continue;  // 跳过未选中类型的卡片
          }
        }
        
        // 根据配置决定搜索的文本内容
        let searchText = title;  // 默认搜索完整标题
        
        // 如果启用了忽略前缀，且不是归类卡片
        if (ignorePrefix && noteType !== "归类") {
          const parsedTitle = this.parseNoteTitle(mnNote);
          // 使用无前缀的内容部分进行搜索
          searchText = parsedTitle.content || title;
        }
        
        // 获取配置中的搜索关键词字段设置
        const searchInKeywords = this.searchRootConfigs ? this.searchRootConfigs.searchInKeywords : false;
        
        // 如果启用了关键词字段搜索，尝试获取关键词内容
        if (searchInKeywords) {
          const keywordsContent = this.getKeywordsFromNote(mnNote);
          if (keywordsContent) {
            // 将关键词内容添加到搜索文本中
            searchText = searchText + " " + keywordsContent;
          }
        }
        
        // 根据当前卡片的标题动态扩展关键词
        const expandedKeywordGroups = this.expandKeywordsWithSynonymsGrouped(keywords, title);
        
        // 使用"与"逻辑：每个关键词组必须至少有一个匹配
        // 例如：输入 "A//B"，A 及其同义词为一组，B 及其同义词为一组
        // 搜索文本必须包含第一组中的至少一个词 且 包含第二组中的至少一个词
        let allGroupsMatch = true;
        
        // 使用解析后的关键词进行匹配
        for (let i = 0; i < parsedKeywords.length; i++) {
          const parsedKeyword = parsedKeywords[i];
          let groupHasMatch = false;
          
          if (parsedKeyword.type === 'regex') {
            // 正则表达式匹配（不进行同义词扩展）
            try {
              const regex = new RegExp(parsedKeyword.pattern, 'i'); // 默认不区分大小写
              if (regex.test(searchText)) {
                groupHasMatch = true;
              }
            } catch (e) {
              // 无效的正则表达式，跳过
              MNUtil.log(`无效的正则表达式: ${parsedKeyword.pattern}`);
            }
          } else {
            // 普通文本匹配（使用同义词扩展）
            const keywordGroup = expandedKeywordGroups[i];
            if (keywordGroup) {
              // 检查当前组中是否有任何关键词匹配
              for (const keyword of keywordGroup) {
                if (searchText.includes(keyword)) {
                  groupHasMatch = true;
                  break;  // 找到匹配就跳出当前组的循环
                }
              }
            }
          }
          
          // 如果当前组没有任何匹配，则整体不匹配
          if (!groupHasMatch) {
            allGroupsMatch = false;
            break;  // 不需要检查其他组了
          }
        }
        
        // 只有所有组都有匹配时，才考虑将卡片加入结果
        if (allGroupsMatch) {
          // 智能排除检查
          let shouldExclude = false;
          
          if (exclusionInfo.groups.length > 0) {
            // 检查每个激活的排除词组
            for (const group of exclusionInfo.groups) {
              let hasExcludeWord = false;
              let hasIndependentTriggerWord = false;
              
              // 1. 检查是否包含排除词
              for (const excludeWord of group.excludeWords) {
                if (searchText.includes(excludeWord)) {
                  hasExcludeWord = true;
                  break;
                }
              }
              
              if (hasExcludeWord) {
                // 2. 创建一个临时文本，将所有排除词替换为特殊标记
                let tempText = searchText;
                for (const excludeWord of group.excludeWords) {
                  // 使用全局替换，不区分大小写
                  tempText = tempText.replace(new RegExp(excludeWord, 'gi'), '###EXCLUDED###');
                }
                
                // 3. 检查触发词是否在移除排除词后仍然存在
                for (const triggerWord of group.triggerWords) {
                  if (tempText.includes(triggerWord)) {
                    hasIndependentTriggerWord = true;
                    MNUtil.log(`卡片 "${title}" 中触发词 "${triggerWord}" 独立存在`);
                    break;
                  }
                }
                
                // 4. 决定是否排除
                if (hasExcludeWord && !hasIndependentTriggerWord) {
                  shouldExclude = true;
                  MNUtil.log(`❌ 排除卡片: "${title}" (包含排除词 "${group.excludeWords.join(", ")}" 且触发词不独立存在)`);
                  break;
                } else if (hasExcludeWord && hasIndependentTriggerWord) {
                  MNUtil.log(`✅ 保留卡片: "${title}" (虽包含排除词但触发词独立存在)`);
                }
              }
            }
          }
          
          // 只有不应该排除时才加入结果
          if (!shouldExclude) {
            results.push(mnNote);
          }
        }
      }
      
      MNUtil.log(`找到 ${results.length} 个匹配结果`);
      return results;
    } catch (error) {
      MNUtil.log("搜索失败: " + error.toString());
      MNUtil.addErrorLog(error, "searchNotesInDescendants");
      return [];
    }
  }
  
  /**
   * 根据选中的根目录更新 skipEmptyTitle 设置
   * @param {Array} currentRootIds - 当前选中的根目录ID数组
   * @param {Object} allRoots - 所有根目录配置
   * @returns {boolean} 是否应该跳过空白标题
   */
  static updateSkipEmptyTitleFromRoots(currentRootIds, allRoots) {
    // 策略：所有选中的根目录都启用 skipEmptyTitleByDefault 时才默认开启（保守策略）
    let shouldSkipEmpty = false;
    
    if (currentRootIds.length > 0) {
      shouldSkipEmpty = true; // 先假设应该跳过
      
      for (const rootId of currentRootIds) {
        // 检查是否是临时根目录
        if (this.tempRootInfo && this.tempRootInfo.id === rootId) {
          // 临时根目录默认不跳过空白标题
          shouldSkipEmpty = false;
          break;
        }
        
        // 在配置中查找根目录
        let rootFound = false;
        for (const key in allRoots) {
          if (allRoots[key].id === rootId) {
            rootFound = true;
            // 如果有任何一个根目录没有启用跳过空白，就不跳过
            if (!allRoots[key].skipEmptyTitleByDefault) {
              shouldSkipEmpty = false;
              break;
            }
          }
        }
        
        // 如果某个根目录未找到（可能是已删除的），默认不跳过
        if (!rootFound) {
          shouldSkipEmpty = false;
          break;
        }
        
        if (!shouldSkipEmpty) break;
      }
    }
    
    // 应用设置
    this.searchRootConfigs.skipEmptyTitle = shouldSkipEmpty;
    this.saveSearchConfig();
    
    return shouldSkipEmpty;
  }
  
  /**
   * 显示搜索对话框 - 主入口
   * 处理用户输入和搜索流程
   */
  static async showSearchDialog() {
    try {
      // 初始化配置
      this.initSearchConfig();
      
      // 获取上次使用的根目录（支持多个）
      let currentRootIds = this.getLastUsedRootIds();
      let allRoots = this.getAllSearchRoots();
      let selectedTypes = null;  // null 表示全选，Set 表示选中的类型
      
      // 第一步：确认/选择根目录
      const rootSelectionResult = await this.showRootSelectionStep(currentRootIds, allRoots);
      if (!rootSelectionResult) {
        return; // 用户取消
      }
      currentRootIds = rootSelectionResult;
      
      // 保存最后使用的根目录
      const rootKeys = [];
      for (const rootId of currentRootIds) {
        for (const key in allRoots) {
          if (allRoots[key].id === rootId) {
            rootKeys.push(key);
            break;
          }
        }
      }
      this.searchRootConfigs.lastUsedRoots = rootKeys;
      this.saveSearchConfig();
      
      // 根据选中的根目录初始化 skipEmptyTitle 设置
      const shouldSkipEmpty = this.updateSkipEmptyTitleFromRoots(currentRootIds, allRoots);
      
      // 显示提示
      if (shouldSkipEmpty) {
        MNUtil.showHUD("✅ 已根据根目录设置默认启用跳过空白标题");
        await MNUtil.delay(1);
      }
      
      // 第二步：输入关键词并搜索
      let keywords = [];
      
      // 主循环：处理用户输入
      while (true) {
        // 获取当前根目录名称（支持多个）
        const currentRootNames = this.getCurrentRootNames(currentRootIds, allRoots);
        
        // 构建提示信息
        let rootDisplay = currentRootNames;
        if (currentRootIds.length > 3) {
          // 如果选择了太多根目录，只显示前3个和数量
          const firstThree = currentRootNames.split(", ").slice(0, 3).join(", ");
          rootDisplay = `${firstThree} 等 ${currentRootIds.length} 个`;
        }
        let message = `🔍 搜索笔记\n📁 根目录(${currentRootIds.length}个)：${rootDisplay}`;
        if (keywords.length > 0) {
          message += `\n🔑 已输入关键词：${keywords.join(" // ")}`;
        }
        // 显示归类卡片搜索状态
        const includeClassification = this.searchRootConfigs.includeClassification;
        message += `\n📑 搜索归类卡片：${includeClassification ? "☑️ 是" : "☐︎ 否"}`;
        // 显示只搜索归类卡片状态
        const onlyClassification = this.searchRootConfigs.onlyClassification;
        message += `\n🎯 只搜索归类卡片：${onlyClassification ? "☑️ 是" : "☐︎ 否"}`;
        // 显示忽略前缀搜索状态
        const ignorePrefix = this.searchRootConfigs.ignorePrefix;
        message += `\n📝 忽略前缀搜索：${ignorePrefix ? "☑️ 是" : "☐︎ 否"}`;
        // 显示搜索关键词字段状态
        const searchInKeywords = this.searchRootConfigs.searchInKeywords;
        message += `\n🔖 搜索关键词字段：${searchInKeywords ? "☑️ 是" : "☐︎ 否"}`;
        // 显示跳过空白标题状态
        const skipEmptyTitle = this.searchRootConfigs.skipEmptyTitle;
        message += `\n🚫 跳过空白标题卡片：${skipEmptyTitle ? "☑️ 是" : "☐︎ 否"}`;
        // 显示正则表达式搜索状态
        const enableRegexSearch = this.searchRootConfigs.enableRegexSearch;
        message += `\n🔤 正则表达式搜索：${enableRegexSearch ? "☑️ 是" : "☐︎ 否"}`;
        // 显示选中的类型（只搜索归类卡片时不显示类型选择）
        if (!onlyClassification) {
          if (selectedTypes !== null && selectedTypes.size > 0) {
            const typeNames = Array.from(selectedTypes).join("、");
            message += `\n📋 搜索类型：${typeNames}`;
          } else {
            message += `\n📋 搜索类型：全部`;
          }
        }
        // 根据正则搜索状态显示不同的提示
        if (enableRegexSearch) {
          message += `\n\n💡 正则模式已启用：\n• 使用前缀 r: re: regex: 标识正则表达式\n• 无前缀的关键词仍支持同义词扩展\n• 示例：r:^定理\\d+ 或 证明`;
        } else {
          message += `\n\n💡 提示：点击"添加根目录"可使用当前卡片或输入ID/URL`;
        }
        
        // 显示输入框
        const result = await new Promise((resolve) => {
          UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
            "搜索笔记",
            message,
            2, // 输入框样式
            "取消",
            // 构建按钮数组
            (() => {
              const buttons = [
                "开始搜索", "下一个词", "切换根目录", "添加根目录",
                includeClassification ? "☑️ 搜索归类卡片" : "☐︎ 搜索归类卡片",
                onlyClassification ? "☑️ 只搜索归类卡片" : "☐︎ 只搜索归类卡片",
                ignorePrefix ? "☑️ 忽略前缀搜索" : "☐︎ 忽略前缀搜索",
                searchInKeywords ? "☑️ 搜索关键词字段" : "☐︎ 搜索关键词字段",
                skipEmptyTitle ? "☑️ 跳过空白标题卡片" : "☐︎ 跳过空白标题卡片",
                enableRegexSearch ? "☑️ 正则表达式搜索" : "☐︎ 正则表达式搜索"
              ];
              // 只在未启用"只搜索归类卡片"时显示类型选择按钮
              if (!onlyClassification) {
                buttons.push("📋 选择类型");
              }
              // 添加更多功能按钮
              buttons.push("⚙️ 更多功能");
              return buttons;
            })(),
            (alert, buttonIndex) => {
              if (buttonIndex === 0) {
                // 取消
                resolve({ action: "cancel" });
                return;
              }
              
              const inputText = alert.textFieldAtIndex(0).text.trim();
              
              switch (buttonIndex) {
                case 1: // 开始搜索
                  if (inputText) {
                    // 处理输入的关键词
                    const newKeywords = inputText.split("//").map(k => k.trim()).filter(k => k);
                    keywords.push(...newKeywords);
                  }
                  
                  if (keywords.length === 0) {
                    MNUtil.showHUD("请输入搜索关键词");
                    resolve({ action: "continue" });
                  } else {
                    resolve({ action: "search" });
                  }
                  break;
                  
                case 2: // 下一个词
                  if (inputText) {
                    const newKeywords = inputText.split("//").map(k => k.trim()).filter(k => k);
                    keywords.push(...newKeywords);
                  }
                  resolve({ action: "nextWord" });
                  break;
                  
                case 3: // 切换根目录
                  resolve({ action: "switchRoot" });
                  break;
                  
                case 4: // 添加根目录
                  resolve({ action: "addRoot" });
                  break;
                  
                case 5: // 切换归类卡片搜索开关
                  resolve({ action: "toggleClassification" });
                  break;
                  
                case 6: // 切换只搜索归类卡片开关
                  resolve({ action: "toggleOnlyClassification" });
                  break;
                  
                case 7: // 切换忽略前缀搜索开关
                  resolve({ action: "toggleIgnorePrefix" });
                  break;
                  
                case 8: // 切换搜索关键词字段开关
                  resolve({ action: "toggleSearchInKeywords" });
                  break;
                  
                case 9: // 切换跳过空白标题开关
                  resolve({ action: "toggleSkipEmptyTitle" });
                  break;
                  
                case 10: // 切换正则表达式搜索开关
                  resolve({ action: "toggleRegexSearch" });
                  break;
                  
                case 11: // 选择类型（只在未启用"只搜索归类卡片"时存在）
                  if (!onlyClassification) {
                    resolve({ action: "selectTypes" });
                  } else {
                    // 如果"只搜索归类卡片"启用，11 是"更多功能"
                    resolve({ action: "moreFeatures" });
                  }
                  break;
                  
                case 12: // 更多功能（只在未启用"只搜索归类卡片"时存在）
                  resolve({ action: "moreFeatures" });
                  break;
              }
            }
          );
        });
        
        // 处理结果
        switch (result.action) {
          case "cancel":
            return;
            
          case "search":
            // 执行搜索
            MNUtil.showHUD("⏳ 搜索中...");
            const results = await this.searchNotesInDescendants(keywords, currentRootIds, selectedTypes);
            
            if (results.length === 0) {
              MNUtil.showHUD(`未找到包含 "${keywords.join(' AND ')}" 的卡片`);
            } else if (results.length === 1) {
              // 只有一个结果时，直接定位到该卡片
              results[0].focusInFloatMindMap(0.5);
              MNUtil.showHUD(`✅ 找到唯一结果，已定位`);
            } else {
              // 多个结果时，创建搜索结果卡片
              this.createSearchResultCard(results, keywords, currentRootNames);
              MNUtil.showHUD(`✅ 找到 ${results.length} 个结果`);
            }
            return;
            
          case "nextWord":
          case "continue":
            // 继续循环
            break;
            
          case "switchRoot":
            // 选择根目录（支持多选）
            const newRootIds = await this.showRootSelection(currentRootIds, allRoots);
            if (newRootIds && newRootIds.length > 0) {
              currentRootIds = newRootIds;
              
              // 更新 skipEmptyTitle 设置
              const shouldSkip = this.updateSkipEmptyTitleFromRoots(currentRootIds, allRoots);
              if (shouldSkip) {
                MNUtil.showHUD("✅ 已根据新选择的根目录启用跳过空白标题");
              } else {
                MNUtil.showHUD("☐ 已根据新选择的根目录禁用跳过空白标题");
              }
            }
            break;
            
          case "addRoot":
            // 添加根目录
            const newRoot = await this.handleAddRoot(null);
            if (newRoot) {
              // 将新添加的根目录加入到当前选中的根目录列表
              if (!currentRootIds.includes(newRoot.id)) {
                currentRootIds.push(newRoot.id);
              }
              // 更新最后使用的根目录列表
              const rootKeys = [];
              for (const rootId of currentRootIds) {
                // 查找每个根目录对应的key
                for (const key in allRoots) {
                  if (allRoots[key].id === rootId) {
                    rootKeys.push(key);
                    break;
                  }
                }
              }
              // 如果新根目录的key不在列表中，添加它
              if (!rootKeys.includes(newRoot.key)) {
                rootKeys.push(newRoot.key);
              }
              this.searchRootConfigs.lastUsedRoots = rootKeys;
              this.saveSearchConfig();
              // 刷新 allRoots 以包含新添加的根目录
              allRoots = this.getAllSearchRoots();
              
              // 更新 skipEmptyTitle 设置（新添加的根目录默认不跳过）
              this.updateSkipEmptyTitleFromRoots(currentRootIds, allRoots);
              
              MNUtil.showHUD(`✅ 已添加根目录：${newRoot.name}`);
            }
            break;
            
          case "toggleClassification":
            // 切换归类卡片搜索开关
            this.searchRootConfigs.includeClassification = !this.searchRootConfigs.includeClassification;
            // 如果禁用了包含归类卡片，同时也要禁用只搜索归类卡片
            if (!this.searchRootConfigs.includeClassification) {
              this.searchRootConfigs.onlyClassification = false;
            }
            this.saveSearchConfig();
            MNUtil.showHUD(`归类卡片搜索：${this.searchRootConfigs.includeClassification ? "已启用" : "已禁用"}`);
            break;
            
          case "toggleOnlyClassification":
            // 切换只搜索归类卡片开关
            this.searchRootConfigs.onlyClassification = !this.searchRootConfigs.onlyClassification;
            // 如果启用了只搜索归类卡片，确保包含归类卡片也是启用的
            if (this.searchRootConfigs.onlyClassification) {
              this.searchRootConfigs.includeClassification = true;
              // 同时清空类型选择
              selectedTypes = null;
            }
            this.saveSearchConfig();
            MNUtil.showHUD(`只搜索归类卡片：${this.searchRootConfigs.onlyClassification ? "已启用" : "已禁用"}`);
            break;
            
          case "toggleIgnorePrefix":
            // 切换忽略前缀搜索开关
            this.searchRootConfigs.ignorePrefix = !this.searchRootConfigs.ignorePrefix;
            this.saveSearchConfig();
            MNUtil.showHUD(`忽略前缀搜索：${this.searchRootConfigs.ignorePrefix ? "已启用" : "已禁用"}`);
            break;
            
          case "toggleSearchInKeywords":
            // 切换搜索关键词字段开关
            this.searchRootConfigs.searchInKeywords = !this.searchRootConfigs.searchInKeywords;
            this.saveSearchConfig();
            MNUtil.showHUD(`搜索关键词字段：${this.searchRootConfigs.searchInKeywords ? "已启用" : "已禁用"}`);
            break;
            
          case "toggleSkipEmptyTitle":
            // 切换跳过空白标题开关
            this.searchRootConfigs.skipEmptyTitle = !this.searchRootConfigs.skipEmptyTitle;
            this.saveSearchConfig();
            MNUtil.showHUD(`跳过空白标题卡片：${this.searchRootConfigs.skipEmptyTitle ? "已启用" : "已禁用"}`);
            break;
            
          case "toggleRegexSearch":
            // 切换正则表达式搜索开关
            this.searchRootConfigs.enableRegexSearch = !this.searchRootConfigs.enableRegexSearch;
            this.saveSearchConfig();
            MNUtil.showHUD(`正则表达式搜索：${this.searchRootConfigs.enableRegexSearch ? "已启用" : "已禁用"}`);
            break;
            
          case "selectTypes":
            // 显示类型选择对话框
            const newSelectedTypes = await this.showTypeSelectDialog(selectedTypes);
            if (newSelectedTypes !== null) {
              selectedTypes = newSelectedTypes;
            }
            break;
            
          case "moreFeatures":
            // 显示更多功能菜单
            const moreAction = await this.showMoreFeaturesMenu();
            if (moreAction === "manageSynonyms") {
              await this.manageSynonymGroups();
            } else if (moreAction === "manageExclusions") {
              await this.manageExclusionGroups();
            } else if (moreAction === "manageRoots") {
              await this.manageSearchRootsUI();
            } else if (moreAction === "importExport") {
              await this.showImportExportMenu();
            }
            break;
            
        }
        
        // 如果是 search 或 cancel，会 return，其他情况继续循环
        if (result.action === "search" || result.action === "cancel") {
          break;
        }
      }
    } catch (error) {
      MNUtil.showHUD("搜索失败: " + error.message);
      MNUtil.addErrorLog(error, "showSearchDialog");
    }
  }
  
  /**
   * 显示类型选择对话框
   * @param {Set|null} selectedTypes - 已选中的类型集合，null 表示第一次打开
   * @returns {Promise<Set|null>} 返回选中的类型集合，null 表示取消
   */
  static showTypeSelectDialog(selectedTypes = null) {
    // 定义可选的类型
    const availableTypes = ["定义", "命题", "反例", "思想方法", "思路", "问题"];
    
    // 如果是第一次打开（selectedTypes 为 null），创建空 Set
    if (selectedTypes === null) {
      selectedTypes = new Set();
    }
    
    // 构建显示选项
    let displayOptions = availableTypes.map(type => {
      let prefix = selectedTypes.has(type) ? "✅ " : "";
      return prefix + type;
    });
    
    // 添加全选/取消全选选项
    let allSelected = selectedTypes.size === availableTypes.length;
    let selectAllText = allSelected ? "⬜ 取消全选" : "☑️ 全选所有类型";
    displayOptions.unshift(selectAllText);
    
    // 添加确定选项
    displayOptions.push("──────────────");
    displayOptions.push("✅ 确定选择");
    
    return new Promise((resolve) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "选择要搜索的卡片类型",
        `已选中 ${selectedTypes.size}/${availableTypes.length} 个类型`,
        0,
        "取消",
        displayOptions,
        (alert, buttonIndex) => {
          if (buttonIndex === 0) {
            resolve(null); // 取消
            return;
          }
          
          if (buttonIndex === 1) {
            // 全选/取消全选
            if (allSelected) {
              selectedTypes.clear();
            } else {
              availableTypes.forEach(type => selectedTypes.add(type));
            }
            // 递归调用
            this.showTypeSelectDialog(selectedTypes).then(resolve);
          } else if (buttonIndex === displayOptions.length) {
            // 确定
            resolve(selectedTypes.size > 0 ? selectedTypes : null);
          } else if (buttonIndex === displayOptions.length - 1) {
            // 分隔线，重新显示
            this.showTypeSelectDialog(selectedTypes).then(resolve);
          } else {
            // 切换选中状态
            const typeIndex = buttonIndex - 2;
            const type = availableTypes[typeIndex];
            if (selectedTypes.has(type)) {
              selectedTypes.delete(type);
            } else {
              selectedTypes.add(type);
            }
            // 递归调用
            this.showTypeSelectDialog(selectedTypes).then(resolve);
          }
        }
      );
    });
  }
  
  /**
   * 获取当前根目录名称
   */
  static getCurrentRootName(currentRootId, allRoots) {
    // 先检查是否是临时根目录
    if (this.tempRootInfo && this.tempRootInfo.id === currentRootId) {
      return this.tempRootInfo.name;
    }
    
    // 在配置中查找
    for (const [key, root] of Object.entries(allRoots)) {
      if (root.id === currentRootId) {
        return root.name;
      }
    }
    
    // 如果还是未找到，可能是之前保存的临时根目录，尝试获取卡片信息
    try {
      const rootNote = MNNote.new(currentRootId);
      if (rootNote) {
        return rootNote.noteTitle || "无标题";
      }
    } catch (e) {
      // 忽略错误
    }
    
    return "未知";
  }
  
  /**
   * 显示根目录选择步骤（搜索的第一步）
   * @param {Array} currentRootIds - 当前选中的根目录ID数组
   * @param {Object} allRoots - 所有根目录
   * @returns {Promise<Array|null>} 返回选中的根目录ID数组，取消返回null
   */
  static async showRootSelectionStep(currentRootIds, allRoots) {
    const currentRootNames = this.getCurrentRootNames(currentRootIds, allRoots);
    let rootDisplay = currentRootNames;
    if (currentRootIds.length > 3) {
      const firstThree = currentRootNames.split(", ").slice(0, 3).join(", ");
      rootDisplay = `${firstThree} 等 ${currentRootIds.length} 个`;
    }
    
    const message = `📁 当前根目录(${currentRootIds.length}个):\n${rootDisplay}\n\n是否使用当前根目录进行搜索？`;
    
    return new Promise((resolve) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "搜索笔记 - 选择根目录",
        message,
        0,
        "取消",
        ["✅ 确定使用", "🔄 切换根目录", "➕ 添加根目录", "📍 设为临时根目录"],
        async (alert, buttonIndex) => {
          if (buttonIndex === 0) {
            resolve(null); // 取消
            return;
          }
          
          switch (buttonIndex) {
            case 1: // 确定使用
              resolve(currentRootIds);
              break;
              
            case 2: // 切换根目录
              const newRootIds = await this.showRootSelectionWithGroups([], allRoots); // 清空选择
              if (newRootIds && newRootIds.length > 0) {
                // 切换到正式根目录时，清除临时根目录
                this.clearTempRoot();
                resolve(newRootIds);
              } else {
                // 如果用户在切换界面取消，重新显示当前步骤
                const result = await this.showRootSelectionStep(currentRootIds, allRoots);
                resolve(result);
              }
              break;
              
            case 3: // 添加根目录
              const focusNote = MNNote.getFocusNote();
              if (!focusNote) {
                MNUtil.showHUD("请先选择一个卡片作为根目录");
                const result = await this.showRootSelectionStep(currentRootIds, allRoots);
                resolve(result);
                return;
              }
              
              // 获取卡片标题作为默认名称
              const defaultName = focusNote.noteTitle || "未命名根目录";
              
              // 请求用户输入或确认名称
              const newRootName = await new Promise((innerResolve) => {
                UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
                  "添加根目录",
                  `当前选中的卡片：${defaultName}\n\n请输入根目录的名称：`,
                  2,
                  "取消",
                  ["确定"],
                  (alert2, buttonIndex2) => {
                    if (buttonIndex2 === 1) {
                      const name = alert2.textFieldAtIndex(0).text.trim() || defaultName;
                      innerResolve(name);
                    } else {
                      innerResolve(null);
                    }
                  }
                );
                // 设置默认值
                MNUtil.delay(0.01).then(() => {
                  try {
                    const currentAlert = UIAlertView.currentAlertView();
                    if (currentAlert && currentAlert.textFieldAtIndex) {
                      const textField = currentAlert.textFieldAtIndex(0);
                      if (textField) textField.text = defaultName;
                    }
                  } catch (e) {}
                });
              });
              
              if (newRootName) {
                const key = this.addSearchRoot(focusNote.noteId, newRootName);
                if (key && key !== false) {
                  const newRoot = {
                    key: key,
                    id: focusNote.noteId,
                    name: newRootName
                  };
                  if (!currentRootIds.includes(newRoot.id)) {
                    currentRootIds.push(newRoot.id);
                  }
                  allRoots[newRoot.key] = newRoot;
                  MNUtil.showHUD(`✅ 已添加根目录：${newRoot.name}`);
                  
                  // 更新最后使用的根目录
                  const rootKeys = [];
                  for (const rootId of currentRootIds) {
                    for (const k in allRoots) {
                      if (allRoots[k].id === rootId) {
                        rootKeys.push(k);
                        break;
                      }
                    }
                  }
                  this.searchRootConfigs.lastUsedRoots = rootKeys;
                  this.saveSearchConfig();
                }
              }
              
              // 重新显示当前步骤
              const result = await this.showRootSelectionStep(currentRootIds, allRoots);
              resolve(result);
              break;
              
            case 4: // 设为临时根目录
              const currentNote = MNNote.getFocusNote();
              if (!currentNote) {
                MNUtil.showHUD("请先选择一个卡片作为临时根目录");
                const result = await this.showRootSelectionStep(currentRootIds, allRoots);
                resolve(result);
                return;
              }
              
              // 设置临时根目录
              this.setTempRoot(currentNote);
              
              // 返回临时根目录作为搜索根目录
              resolve([currentNote.noteId]);
              break;
          }
        }
      );
    });
  }

  /**
   * 显示根目录选择对话框（支持多选和群组）
   * @param {Array} currentRootIds - 当前选中的根目录ID数组
   * @param {Object} allRoots - 所有根目录
   * @returns {Promise<Array>} 返回选中的根目录ID数组
   */
  static async showRootSelectionWithGroups(currentRootIds, allRoots) {
    // 确保有群组配置
    if (!this.searchRootConfigs.rootGroups) {
      this.searchRootConfigs.rootGroups = {};
    }
    
    // 使用增强的选择对话框（带群组功能）
    return new Promise((resolve) => {
      this.showEnhancedRootMultiSelectDialog(currentRootIds, allRoots, resolve);
    });
  }
  
  /**
   * 显示根目录选择对话框（支持多选）- 保留原有函数以兼容
   * @param {string|Array} currentRootIds - 当前选中的根目录ID（单个或多个）
   * @param {Object} allRoots - 所有根目录
   * @returns {Promise<Array>} 返回选中的根目录ID数组
   */
  static async showRootSelection(currentRootIds, allRoots) {
    // 确保 currentRootIds 是数组
    if (!Array.isArray(currentRootIds)) {
      currentRootIds = currentRootIds ? [currentRootIds] : [];
    }
    
    // 使用 rootsOrder 数组的顺序，如果没有则使用 Object.keys
    this.initSearchConfig();
    const rootsOrder = this.searchRootConfigs.rootsOrder || Object.keys(allRoots);
    
    // 构建根目录选项数组
    const rootOptions = [];
    const rootKeys = [];
    
    // 添加临时根目录选项
    rootOptions.push({
      key: "__current__",
      name: "📍 当前选中的卡片（临时）",
      id: null
    });
    
    // 添加配置中的根目录
    for (const key of rootsOrder) {
      const root = allRoots[key];
      if (root) {
        rootOptions.push({
          key: key,
          name: root.name,
          id: root.id
        });
      }
    }
    
    // 初始化选中状态
    const selectedIndices = new Set();
    for (let i = 0; i < rootOptions.length; i++) {
      const option = rootOptions[i];
      if (option.key === "__current__") {
        // 检查临时根目录是否被选中
        if (this.tempRootInfo && currentRootIds.includes(this.tempRootInfo.id)) {
          selectedIndices.add(i);
        }
      } else {
        // 检查配置中的根目录是否被选中
        if (currentRootIds.includes(option.id)) {
          selectedIndices.add(i);
        }
      }
    }
    
    // 使用Promise包装异步操作
    return new Promise((resolve) => {
      this.showRootMultiSelectDialog(rootOptions, selectedIndices, resolve);
    });
  }
  
  /**
   * 显示增强的根目录多选对话框（带群组功能）
   * @param {Array} currentRootIds - 当前选中的根目录ID数组
   * @param {Object} allRoots - 所有根目录
   * @param {Function} finalCallback - 最终回调函数
   */
  static showEnhancedRootMultiSelectDialog(currentRootIds, allRoots, finalCallback) {
    // 构建显示选项
    const displayOptions = [];
    
    // 1. 确定按钮放在最前面
    displayOptions.push("✅ 确定选择");
    displayOptions.push("──────────────");
    
    // 2. 快速群组区域
    const groups = this.searchRootConfigs.rootGroups || {};
    const groupNames = Object.keys(groups).sort((a, b) => {
      const orderA = groups[a].order || 999;
      const orderB = groups[b].order || 999;
      return orderA - orderB;
    });
    
    if (groupNames.length > 0) {
      displayOptions.push("━━━ 快速群组 ━━━");
      for (const groupName of groupNames) {
        const group = groups[groupName];
        const icon = group.icon || "⚡";
        displayOptions.push(`${icon} ${groupName}`);
      }
      displayOptions.push("──────────────");
    }
    
    // 3. 群组管理按钮
    displayOptions.push("💾 保存当前选择为群组");
    displayOptions.push("📝 管理根目录");
    displayOptions.push("⚙️ 管理群组");
    displayOptions.push("──────────────");
    
    // 4. 单独选择区域
    displayOptions.push("━━━ 单独选择 ━━━");
    
    // 构建根目录选项数组
    const rootsOrder = this.searchRootConfigs.rootsOrder || Object.keys(allRoots);
    const rootOptions = [];
    
    for (const key of rootsOrder) {
      const root = allRoots[key];
      if (root) {
        rootOptions.push({
          key: key,
          name: root.name,
          id: root.id
        });
      }
    }
    
    // 检查当前选中状态
    const selectedIndices = new Set();
    for (let i = 0; i < rootOptions.length; i++) {
      if (currentRootIds.includes(rootOptions[i].id)) {
        selectedIndices.add(i);
      }
    }
    
    // 添加全选/取消全选
    const allSelected = selectedIndices.size === rootOptions.length;
    displayOptions.push(allSelected ? "⬜ 取消全选" : "☑️ 全选");
    
    // 添加各个根目录选项
    for (let i = 0; i < rootOptions.length; i++) {
      const option = rootOptions[i];
      const isSelected = selectedIndices.has(i);
      const prefix = isSelected ? "✅ " : "";
      displayOptions.push(prefix + option.name);
    }
    
    // 构建提示信息
    const currentRootNames = this.getCurrentRootNames(currentRootIds, allRoots);
    let message = `已选中 ${currentRootIds.length} 个根目录`;
    if (currentRootIds.length > 0 && currentRootIds.length <= 3) {
      message += `:\n${currentRootNames}`;
    } else if (currentRootIds.length > 3) {
      const firstThree = currentRootNames.split(", ").slice(0, 3).join(", ");
      message += `:\n${firstThree} 等`;
    }
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择搜索根目录",
      message,
      0,
      "取消",
      displayOptions,
      async (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          finalCallback([]); // 取消
          return;
        }
        
        const selection = buttonIndex - 1;
        
        // 处理确定选择
        if (selection === 0) {
          // 返回当前选中的根目录ID
          const selectedRootIds = [];
          for (let i = 0; i < rootOptions.length; i++) {
            if (selectedIndices.has(i)) {
              selectedRootIds.push(rootOptions[i].id);
            }
          }
          finalCallback(selectedRootIds);
          return;
        }
        
        let currentIndex = 1; // 跳过确定按钮
        currentIndex++; // 跳过分隔线
        
        // 处理群组选择
        if (groupNames.length > 0) {
          currentIndex++; // 跳过"快速群组"标题
          
          for (const groupName of groupNames) {
            if (selection === currentIndex) {
              // 切换群组选择状态
              const group = groups[groupName];
              const groupRootIds = [];
              
              // 1. 获取群组内的所有根目录ID
              for (const rootKey of group.roots) {
                const root = allRoots[rootKey];
                if (root) {
                  groupRootIds.push(root.id);
                }
              }
              
              // 2. 检查群组内根目录的选中状态
              let allSelected = true;
              let anySelected = false;
              
              for (const rootId of groupRootIds) {
                if (currentRootIds.includes(rootId)) {
                  anySelected = true;
                } else {
                  allSelected = false;
                }
              }
              
              // 3. 根据状态决定操作
              let newRootIds = [...currentRootIds]; // 复制当前选择
              
              if (allSelected && anySelected) {
                // 情况1：全部已选中 → 取消选中群组内的根目录
                newRootIds = currentRootIds.filter(id => !groupRootIds.includes(id));
                MNUtil.showHUD(`❌ 已取消群组：${groupName}`);
              } else {
                // 情况2：部分或都未选中 → 选中群组内所有根目录
                for (const rootId of groupRootIds) {
                  if (!newRootIds.includes(rootId)) {
                    newRootIds.push(rootId);
                  }
                }
                MNUtil.showHUD(`✅ 已应用群组：${groupName}`);
              }
              
              // 4. 更新最后使用的群组和配置
              this.searchRootConfigs.lastUsedGroup = groupName;
              groups[groupName].lastUsed = new Date().toISOString();
              this.saveSearchConfig();
              
              // 递归调用，显示更新后的状态
              this.showEnhancedRootMultiSelectDialog(newRootIds, allRoots, finalCallback);
              return;
            }
            currentIndex++;
          }
          currentIndex++; // 跳过分隔线
        }
        
        // 处理保存群组
        if (selection === currentIndex) {
          if (currentRootIds.length === 0) {
            MNUtil.showHUD("请先选择至少一个根目录");
            this.showEnhancedRootMultiSelectDialog(currentRootIds, allRoots, finalCallback);
            return;
          }
          
          // 保存当前选择为群组
          await this.saveCurrentSelectionAsGroup(currentRootIds, allRoots);
          
          // 重新显示对话框
          this.showEnhancedRootMultiSelectDialog(currentRootIds, allRoots, finalCallback);
          return;
        }
        currentIndex++;
        
        // 处理管理根目录
        if (selection === currentIndex) {
          await this.showRootManagementDialog().then(() => {
            // 刷新所有根目录配置
            const updatedRoots = this.getAllSearchRoots();
            // 重新显示对话框
            this.showEnhancedRootMultiSelectDialog(currentRootIds, updatedRoots, finalCallback);
          });
          return;
        }
        currentIndex++;
        
        // 处理管理群组
        if (selection === currentIndex) {
          await this.manageRootGroups();
          // 重新显示对话框
          this.showEnhancedRootMultiSelectDialog(currentRootIds, allRoots, finalCallback);
          return;
        }
        currentIndex++;
        currentIndex++; // 跳过分隔线
        currentIndex++; // 跳过"单独选择"标题
        
        // 处理全选/取消全选
        if (selection === currentIndex) {
          if (allSelected) {
            selectedIndices.clear();
            currentRootIds = [];
          } else {
            selectedIndices.clear();
            currentRootIds = [];
            for (let i = 0; i < rootOptions.length; i++) {
              selectedIndices.add(i);
              currentRootIds.push(rootOptions[i].id);
            }
          }
          // 递归调用
          this.showEnhancedRootMultiSelectDialog(currentRootIds, allRoots, finalCallback);
          return;
        }
        currentIndex++;
        
        // 处理单个根目录选择
        const rootIndex = selection - currentIndex;
        if (rootIndex >= 0 && rootIndex < rootOptions.length) {
          const rootId = rootOptions[rootIndex].id;
          const idx = currentRootIds.indexOf(rootId);
          
          if (idx >= 0) {
            // 取消选中
            currentRootIds.splice(idx, 1);
            selectedIndices.delete(rootIndex);
          } else {
            // 选中
            currentRootIds.push(rootId);
            selectedIndices.add(rootIndex);
          }
          
          // 递归调用
          this.showEnhancedRootMultiSelectDialog(currentRootIds, allRoots, finalCallback);
        }
      }
    );
  }

  /**
   * 显示根目录多选对话框（递归实现）- 保留原有函数
   * @param {Array} rootOptions - 根目录选项数组
   * @param {Set} selectedIndices - 已选中的索引集合
   * @param {Function} finalCallback - 最终回调函数
   */
  static showRootMultiSelectDialog(rootOptions, selectedIndices, finalCallback) {
    // 构建显示选项
    const displayOptions = [];
    
    // 添加临时根目录选项
    displayOptions.push("📍 使用当前选中的卡片（临时）");
    
    // 添加全选/取消全选选项
    const allSelected = selectedIndices.size === rootOptions.length;
    displayOptions.push(allSelected ? "⬜ 取消全选" : "☑️ 全选所有根目录");
    
    // 添加分隔线
    displayOptions.push("──────────────");
    
    // 添加各个根目录选项
    for (let i = 0; i < rootOptions.length; i++) {
      const option = rootOptions[i];
      const isSelected = selectedIndices.has(i);
      const prefix = isSelected ? "✅ " : "";
      displayOptions.push(prefix + option.name);
    }
    
    // 添加分隔线和操作按钮
    displayOptions.push("──────────────");
    displayOptions.push("📝 管理根目录");
    displayOptions.push("✔️ 确定选择");
    
    // 构建提示信息
    const message = `已选中 ${selectedIndices.size}/${rootOptions.length} 个根目录\n\n💡 提示：点击根目录切换选中状态`;
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择搜索根目录",
      message,
      0,  // 样式
      "取消",
      displayOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          // 用户点击取消
          finalCallback([]);
          return;
        }
        
        const selectedOptionIndex = buttonIndex - 1;
        
        if (selectedOptionIndex === 0) {
          // 临时根目录
          const currentNote = MNNote.getFocusNote();
          if (currentNote) {
            // 保存临时根目录信息
            this.tempRootInfo = {
              id: currentNote.noteId,
              name: currentNote.noteTitle || "无标题"
            };
            
            // 清空所有选择，只选中临时根目录
            const tempRootIds = [currentNote.noteId];
            finalCallback(tempRootIds);
          } else {
            MNUtil.showHUD("请先选中一个卡片作为临时根目录");
            // 重新显示对话框
            this.showRootMultiSelectDialog(rootOptions, selectedIndices, finalCallback);
          }
          return;
          
        } else if (selectedOptionIndex === 1) {
          // 全选/取消全选
          if (allSelected) {
            selectedIndices.clear();
          } else {
            for (let i = 0; i < rootOptions.length; i++) {
              selectedIndices.add(i);
            }
          }
          // 递归显示更新后的对话框
          this.showRootMultiSelectDialog(rootOptions, selectedIndices, finalCallback);
          
        } else if (selectedOptionIndex === 2 || selectedOptionIndex === displayOptions.length - 3) {
          // 分隔线，忽略并重新显示
          this.showRootMultiSelectDialog(rootOptions, selectedIndices, finalCallback);
          
        } else if (selectedOptionIndex === displayOptions.length - 2) {
          // 管理根目录
          this.showRootManagementDialog().then((manageResult) => {
            if (manageResult) {
              // 如果进行了修改，重新构建选项列表
              const updatedRoots = this.getAllSearchRoots();
              const rootsOrder = this.searchRootConfigs.rootsOrder || Object.keys(updatedRoots);
              const updatedOptions = [];
              
              // 重建选项数组
              for (const key of rootsOrder) {
                const root = updatedRoots[key];
                if (root) {
                  updatedOptions.push({
                    key: key,
                    name: root.name,
                    id: root.id
                  });
                }
              }
              
              // 更新选中状态以匹配新的选项列表
              const newSelectedIndices = new Set();
              for (let i = 0; i < updatedOptions.length; i++) {
                // 检查之前选中的根目录是否还存在
                const option = updatedOptions[i];
                for (const oldIndex of selectedIndices) {
                  if (oldIndex < rootOptions.length && 
                      rootOptions[oldIndex].id === option.id) {
                    newSelectedIndices.add(i);
                    break;
                  }
                }
              }
              
              // 递归显示更新后的对话框
              this.showRootMultiSelectDialog(updatedOptions, newSelectedIndices, finalCallback);
            } else {
              // 没有修改，重新显示原对话框
              this.showRootMultiSelectDialog(rootOptions, selectedIndices, finalCallback);
            }
          });
          
        } else if (selectedOptionIndex === displayOptions.length - 1) {
          // 确定选择
          const selectedRootIds = [];
          const selectedRootKeys = [];
          
          for (const index of selectedIndices) {
            const option = rootOptions[index];
            
            if (option.key === "__current__") {
              // 处理临时根目录
              const currentNote = MNNote.getFocusNote();
              if (currentNote) {
                // 保存临时根目录信息
                this.tempRootInfo = {
                  id: currentNote.noteId,
                  name: currentNote.noteTitle || "无标题"
                };
                selectedRootIds.push(currentNote.noteId);
              } else {
                MNUtil.showHUD("请先选中一个卡片作为临时根目录");
                // 重新显示对话框
                this.showRootMultiSelectDialog(rootOptions, selectedIndices, finalCallback);
                return;
              }
            } else {
              // 使用配置中的根目录
              selectedRootIds.push(option.id);
              selectedRootKeys.push(option.key);
            }
          }
          
          // 保存最后使用的根目录（多个）
          if (selectedRootKeys.length > 0) {
            this.searchRootConfigs.lastUsedRoots = selectedRootKeys;
            this.saveSearchConfig();
          }
          
          // 返回结果
          finalCallback(selectedRootIds);
          
        } else {
          // 用户点击了某个根目录选项
          const rootIndex = selectedOptionIndex - 3;  // 减去临时根目录、全选和分隔线
          
          if (rootIndex >= 0 && rootIndex < rootOptions.length) {
            // 切换选中状态
            if (selectedIndices.has(rootIndex)) {
              selectedIndices.delete(rootIndex);
            } else {
              selectedIndices.add(rootIndex);
            }
          }
          
          // 递归显示更新后的对话框
          this.showRootMultiSelectDialog(rootOptions, selectedIndices, finalCallback);
        }
      }
    );
  }
  
  /**
   * 保存当前选择为群组
   * @param {Array} currentRootIds - 当前选中的根目录ID数组
   * @param {Object} allRoots - 所有根目录配置
   */
  static async saveCurrentSelectionAsGroup(currentRootIds, allRoots) {
    // 获取群组名称
    const result = await MNUtil.input(
      "保存群组",
      "请输入群组名称：",
      ["取消", "确定"]
    );
    
    if (!result || result.button !== 1 || !result.input || result.input.trim() === "") {
      return;
    }
    
    const groupName = result.input.trim();
    
    // 检查群组是否已存在
    if (!this.searchRootConfigs.rootGroups) {
      this.searchRootConfigs.rootGroups = {};
    }
    
    if (this.searchRootConfigs.rootGroups[groupName]) {
      const confirm = await MNUtil.confirm(
        "群组已存在",
        `群组"${groupName}"已存在，是否替换？`,
        ["取消", "替换"]
      );
      if (confirm !== 1) {
        return;
      }
    }
    
    // 将根目录ID转换为key
    const rootKeys = [];
    for (const rootId of currentRootIds) {
      for (const key in allRoots) {
        if (allRoots[key].id === rootId) {
          rootKeys.push(key);
          break;
        }
      }
    }
    
    // 创建群组
    const nextOrder = Object.values(this.searchRootConfigs.rootGroups).length + 1;
    this.searchRootConfigs.rootGroups[groupName] = {
      name: groupName,
      roots: rootKeys,
      icon: "⚡",
      order: nextOrder,
      createTime: new Date().toISOString(),
      lastUsed: null
    };
    
    this.saveSearchConfig();
    MNUtil.showHUD(`✅ 已保存群组：${groupName}`);
  }
  
  /**
   * 管理根目录群组
   */
  static async manageRootGroups() {
    const groups = this.searchRootConfigs.rootGroups || {};
    const groupNames = Object.keys(groups).sort((a, b) => {
      const orderA = groups[a].order || 999;
      const orderB = groups[b].order || 999;
      return orderA - orderB;
    });
    
    if (groupNames.length === 0) {
      MNUtil.showHUD("暂无保存的群组");
      return;
    }
    
    const options = ["➕ 新建群组"];
    for (const groupName of groupNames) {
      const group = groups[groupName];
      const icon = group.icon || "⚡";
      const rootCount = group.roots.length;
      options.push(`${icon} ${groupName} (${rootCount}个根目录)`);
    }
    
    const result = await MNUtil.userSelect(
      "管理根目录群组",
      "选择要管理的群组：",
      options
    );
    
    if (result === null || result === 0) {
      return;
    }
    
    if (result === 1) {
      // 新建群组
      await this.createNewRootGroup();
    } else {
      // 管理已有群组
      const groupName = groupNames[result - 2];
      await this.editRootGroup(groupName);
    }
  }
  
  /**
   * 编辑根目录群组
   * @param {string} groupName - 群组名称
   */
  static async editRootGroup(groupName) {
    const group = this.searchRootConfigs.rootGroups[groupName];
    if (!group) {
      MNUtil.showHUD("群组不存在");
      return;
    }
    
    const options = [
      "📝 重命名群组",
      "🔧 编辑包含的根目录",
      "🎨 更改图标",
      "🗑 删除群组"
    ];
    
    const result = await MNUtil.userSelect(
      `管理群组：${groupName}`,
      `包含 ${group.roots.length} 个根目录`,
      options
    );
    
    if (result === null || result === 0) {
      return;
    }
    
    switch (result) {
      case 1: // 重命名
        await this.renameRootGroup(groupName);
        break;
      case 2: // 编辑包含的根目录
        await this.editGroupRoots(groupName);
        break;
      case 3: // 更改图标
        await this.changeGroupIcon(groupName);
        break;
      case 4: // 删除
        await this.deleteRootGroup(groupName);
        break;
    }
  }
  
  /**
   * 重命名群组
   */
  static async renameRootGroup(oldName) {
    const result = await MNUtil.input(
      "重命名群组",
      `当前名称：${oldName}`,
      [{
        key: "name",
        hint: "新的群组名称",
        value: oldName
      }]
    );
    
    if (!result || !result.name || result.name.trim() === "" || result.name === oldName) {
      return;
    }
    
    const newName = result.name.trim();
    
    if (this.searchRootConfigs.rootGroups[newName]) {
      MNUtil.showHUD("新名称已被使用");
      return;
    }
    
    // 重命名
    const group = this.searchRootConfigs.rootGroups[oldName];
    group.name = newName;
    this.searchRootConfigs.rootGroups[newName] = group;
    delete this.searchRootConfigs.rootGroups[oldName];
    
    // 如果是最后使用的群组，更新引用
    if (this.searchRootConfigs.lastUsedGroup === oldName) {
      this.searchRootConfigs.lastUsedGroup = newName;
    }
    
    this.saveSearchConfig();
    MNUtil.showHUD(`✅ 已重命名为：${newName}`);
  }
  
  /**
   * 更改群组图标
   */
  static async changeGroupIcon(groupName) {
    const group = this.searchRootConfigs.rootGroups[groupName];
    const result = await MNUtil.input(
      "更改图标",
      `群组：${groupName}`,
      [{
        key: "icon",
        hint: "输入图标（如：⚡、📚、🔬、🎯）",
        value: group.icon || "⚡"
      }]
    );
    
    if (!result || !result.icon) {
      return;
    }
    
    group.icon = result.icon;
    this.saveSearchConfig();
    MNUtil.showHUD(`✅ 图标已更新`);
  }
  
  /**
   * 编辑群组包含的根目录
   * @param {string} groupName - 群组名称
   */
  static async editGroupRoots(groupName) {
    const group = this.searchRootConfigs.rootGroups[groupName];
    if (!group) {
      MNUtil.showHUD("群组不存在");
      return;
    }
    
    const allRoots = this.getAllSearchRoots();
    const rootsOrder = this.searchRootConfigs.rootsOrder || Object.keys(allRoots);
    
    // 循环显示编辑界面
    while (true) {
      // 构建显示选项
      const displayOptions = [];
      
      // 1. 确定按钮在顶部
      displayOptions.push("✅ 保存并返回");
      displayOptions.push("──────────────");
      
      // 2. 显示所有根目录，标记已在群组中的
      const groupRootKeys = new Set(group.roots);
      
      for (const key of rootsOrder) {
        const root = allRoots[key];
        if (root) {
          const isInGroup = groupRootKeys.has(key);
          const prefix = isInGroup ? "✅ " : "";
          displayOptions.push(prefix + root.name);
        }
      }
      
      // 构建提示信息
      const message = `当前包含 ${group.roots.length} 个根目录\n\n💡 点击根目录可添加/移除`;
      
      const result = await MNUtil.userSelect(
        `编辑群组：${groupName}`,
        message,
        displayOptions
      );
      
      // 处理用户选择
      if (result === null || result === 0) {
        // 用户取消
        return;
      }
      
      if (result === 1) {
        // 保存并返回
        this.saveSearchConfig();
        MNUtil.showHUD(`✅ 群组"${groupName}"已更新`);
        return;
      }
      
      if (result === 2) {
        // 分隔线，忽略并继续循环
        continue;
      }
      
      // 切换根目录的选中状态
      const rootIndex = result - 3; // 减去"保存按钮"、"分隔线"和数组偏移
      if (rootIndex >= 0 && rootIndex < rootsOrder.length) {
        const rootKey = rootsOrder[rootIndex];
        
        if (groupRootKeys.has(rootKey)) {
          // 从群组中移除
          group.roots = group.roots.filter(k => k !== rootKey);
          groupRootKeys.delete(rootKey);
          
          const rootName = allRoots[rootKey]?.name || rootKey;
          MNUtil.showHUD(`➖ 已移除：${rootName}`);
        } else {
          // 添加到群组
          group.roots.push(rootKey);
          groupRootKeys.add(rootKey);
          
          const rootName = allRoots[rootKey]?.name || rootKey;
          MNUtil.showHUD(`➕ 已添加：${rootName}`);
        }
      }
    }
  }
  
  /**
   * 删除群组
   */
  static async deleteRootGroup(groupName) {
    const confirm = await MNUtil.confirm(
      "删除群组",
      `确定要删除群组"${groupName}"吗？`,
      ["取消", "删除"]
    );
    
    if (confirm !== 1) {
      return;
    }
    
    delete this.searchRootConfigs.rootGroups[groupName];
    
    // 如果是最后使用的群组，清除引用
    if (this.searchRootConfigs.lastUsedGroup === groupName) {
      this.searchRootConfigs.lastUsedGroup = null;
    }
    
    this.saveSearchConfig();
    MNUtil.showHUD(`✅ 已删除群组：${groupName}`);
  }
  
  /**
   * 创建新群组
   */
  static async createNewRootGroup() {
    const result = await MNUtil.input(
      "新建群组",
      "请输入群组信息：",
      [
        {
          key: "name",
          hint: "群组名称",
          value: ""
        },
        {
          key: "icon",
          hint: "图标（可选，如：⚡、📚、🔬）",
          value: "⚡"
        }
      ]
    );
    
    if (!result || !result.name || result.name.trim() === "") {
      return;
    }
    
    const groupName = result.name.trim();
    const icon = result.icon || "⚡";
    
    if (!this.searchRootConfigs.rootGroups) {
      this.searchRootConfigs.rootGroups = {};
    }
    
    if (this.searchRootConfigs.rootGroups[groupName]) {
      MNUtil.showHUD("群组已存在");
      return;
    }
    
    const nextOrder = Object.values(this.searchRootConfigs.rootGroups).length + 1;
    this.searchRootConfigs.rootGroups[groupName] = {
      name: groupName,
      roots: [],
      icon: icon,
      order: nextOrder,
      createTime: new Date().toISOString(),
      lastUsed: null
    };
    
    this.saveSearchConfig();
    MNUtil.showHUD(`✅ 已创建群组：${groupName}`);
  }
  
  /**
   * 添加当前卡片作为根目录
   * @param {MNNote} note - 要添加的卡片
   */
  static async addCurrentNoteAsRoot(note) {
    const noteId = note.noteId;
    const noteTitle = note.noteTitle || "无标题";
    
    // 生成唯一的key
    let key = noteTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_");
    let counter = 1;
    while (this.searchRootConfigs.roots[key]) {
      key = `${noteTitle}_${counter}`;
      counter++;
    }
    
    // 添加到配置
    this.searchRootConfigs.roots[key] = {
      name: noteTitle,
      id: noteId,
      skipEmptyTitleByDefault: false
    };
    
    // 添加到顺序数组
    if (!this.searchRootConfigs.rootsOrder) {
      this.searchRootConfigs.rootsOrder = [];
    }
    this.searchRootConfigs.rootsOrder.push(key);
    
    this.saveSearchConfig();
    
    return {
      key: key,
      name: noteTitle,
      id: noteId
    };
  }

  /**
   * 处理添加根目录
   */
  static async handleAddRoot(input) {
    if (input) {
      // 用户输入了 ID 或 URL，请求输入名称
      return await new Promise((resolve) => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "添加根目录",
          "请输入根目录的名称",
          2,
          "取消",
          ["确定"],
          (alert, buttonIndex) => {
            if (buttonIndex === 1) {
              const name = alert.textFieldAtIndex(0).text.trim();
              if (name) {
                const key = this.addSearchRoot(input, name);
                if (key && key !== false) {
                  // 返回新添加的根目录信息
                  resolve({
                    key: key,
                    id: this.searchRootConfigs.roots[key].id,
                    name: name
                  });
                  return;
                }
              }
            }
            resolve(null);
          }
        );
      });
    } else {
      // 输入为空时，提供选项让用户选择
      return await new Promise((resolve) => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "添加搜索根目录",
          "请选择添加方式",
          0,
          "取消",
          ["📍 使用当前选中的卡片", "📝 手动输入卡片 ID/URL"],
          async (alert, buttonIndex) => {
            if (buttonIndex === 1) {
              // 使用当前选中的卡片
              const currentNote = MNNote.getFocusNote();
              if (currentNote) {
                // 获取卡片标题作为默认名称
                const defaultName = currentNote.noteTitle || "未命名根目录";
                
                // 请求用户输入或确认名称
                const result = await new Promise((innerResolve) => {
                  UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
                    "添加根目录",
                    `当前选中的卡片：${defaultName}\n\n请输入根目录的名称（或使用默认名称）`,
                    2,
                    "取消",
                    ["确定"],
                    (alert2, buttonIndex2) => {
                      if (buttonIndex2 === 1) {
                        const name = alert2.textFieldAtIndex(0).text.trim() || defaultName;
                        const key = this.addSearchRoot(currentNote.noteId, name);
                        if (key && key !== false) {
                          innerResolve({
                            key: key,
                            id: this.searchRootConfigs.roots[key].id,
                            name: name
                          });
                          return;
                        }
                      }
                      innerResolve(null);
                    }
                  );
                  // 注释掉预填充以避免只读属性错误
                  // const textField = UIAlertView.currentAlertView().textFieldAtIndex(0);
                  // textField.text = defaultName;
                });
                resolve(result);
              } else {
                MNUtil.showHUD("请先选中一个卡片");
                resolve(null);
              }
            } else if (buttonIndex === 2) {
              // 手动输入 ID/URL
              const inputResult = await new Promise((innerResolve) => {
                UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
                  "手动输入",
                  "请输入卡片 ID 或 URL",
                  2,
                  "取消",
                  ["下一步"],
                  async (alert2, buttonIndex2) => {
                    if (buttonIndex2 === 1) {
                      const idOrUrl = alert2.textFieldAtIndex(0).text.trim();
                      if (idOrUrl) {
                        // 调用原来的逻辑处理输入的 ID/URL
                        const result = await this.handleAddRoot(idOrUrl);
                        innerResolve(result);
                      } else {
                        MNUtil.showHUD("请输入有效的卡片 ID 或 URL");
                        innerResolve(null);
                      }
                    } else {
                      innerResolve(null);
                    }
                  }
                );
              });
              resolve(inputResult);
            } else {
              resolve(null);
            }
          }
        );
      });
    }
  }
  
  /**
   * 创建搜索结果卡片
   * @param {Array<MNNote>} results - 搜索结果
   * @param {Array<string>} keywords - 搜索关键词
   * @param {string} rootName - 根目录名称
   */
  static createSearchResultCard(results, keywords, rootName) {
    try {
      // 获取搜索看板
      const boardNote = MNNote.new(this.searchBoardId, false);
      if (!boardNote) {
        MNUtil.showHUD("搜索看板不存在");
        return null;
      }
      
      // 创建结果卡片
      const resultCard = boardNote.createChildNote({
        title: `搜索：${keywords.join(" AND ")}`,
        excerptText: ""
      });
      
      // 添加搜索信息
      resultCard.appendTextComment(`📑 搜索结果：${keywords.join(" AND ")}`);
      resultCard.appendTextComment(`📁 根目录：${rootName}`);
      resultCard.appendTextComment(`⏰ 搜索时间：${new Date().toLocaleString('zh-CN')}`);
      resultCard.appendTextComment(`📊 结果数量：${results.length} 个`);
      resultCard.appendTextComment("");  // 空行
      
      // 按类型分组
      const groupedResults = {};
      
      for (const note of results) {
        // 使用 getNoteType 获取正确的卡片类型
        const type = this.getNoteType(note) || "其他";
        
        if (!groupedResults[type]) {
          groupedResults[type] = [];
        }
        groupedResults[type].push(note);
      }
      
      // 定义类型顺序和图标
      const typeOrder = {
        "定义": "📘",
        "命题": "📙",
        "例子": "📗",
        "反例": "📕",
        "归类": "📑",
        "思想方法": "💡",
        "问题": "❓",
        "其他": "🔖"
      };
      
      // 按顺序添加分组结果
      for (const [type, icon] of Object.entries(typeOrder)) {
        if (groupedResults[type] && groupedResults[type].length > 0) {
          // 添加分组标题（使用简单的 Markdown 格式）
          const groupTitle = `${icon} ${type}（${groupedResults[type].length}个）`;
          resultCard.appendMarkdownComment(`---`);  // 分隔线
          resultCard.appendMarkdownComment(`**${groupTitle}**`);  // 粗体标题
          
          // 添加该组的链接
          for (const note of groupedResults[type]) {
            // 建立从结果卡片到搜索结果的单向链接
            // 使用 "To" 类型，在结果卡片中添加指向搜索结果的链接
            resultCard.appendNoteLink(note, "To");
          }
        }
      }
      
      // 聚焦到结果卡片
      resultCard.focusInFloatMindMap(0.5);
      
      return resultCard;
    } catch (error) {
      MNUtil.log("创建搜索结果卡片失败: " + error.toString());
      MNUtil.addErrorLog(error, "createSearchResultCard");
      return null;
    }
  }

  static showSearchBoard() {
    const boardNote = MNNote.new(this.searchBoardId, false);
    if (!boardNote) {
      MNUtil.showHUD("搜索看板不存在");
      return null;
    }

    if (boardNote.childNotes.length === 0) {
      boardNote.focusInFloatMindMap(0.3)
    } else {
      // 如果有子卡片，聚焦到最后一张子卡片
      const lastChild = boardNote.childNotes[boardNote.childNotes.length - 1];
      lastChild.focusInFloatMindMap(0.5);
    }
  }

  /**
   * 管理同义词组 - 主界面
   */
  static async manageSynonymGroups() {
    try {
      while (true) {
        const groups = this.getSynonymGroups();
        const options = [];
        
        // 将操作按钮移到最前面
        options.push("➕ 添加新同义词组");
        options.push("🔍 搜索同义词组");
        options.push("──────────────");
        
        // 显示现有同义词组
        for (const group of groups) {
          // 添加数据验证
          if (!group || !group.name) {
            MNUtil.log("警告：发现异常同义词组数据，已跳过");
            continue;
          }
          
          const status = group.enabled ? "✅" : "⭕";
          const partialIcon = group.partialReplacement ? "🔄" : "";  // 局部替换标识
          // 防御性检查 - 处理 words 可能为空的情况
          const words = group.words || [];
          const wordsPreview = words.slice(0, 3).join(", ");
          const moreText = words.length > 3 ? `... (共${words.length}个)` : "";
          options.push(`${status} ${partialIcon} ${group.name}: ${wordsPreview}${moreText}`);
        }
        
        // 导入导出选项
        options.push("──────────────");
        options.push("📤 导出同义词配置");
        options.push("📥 导入同义词配置");
        
        const result = await MNUtil.userSelect(
          "同义词管理",
          `共 ${groups.length} 个同义词组\n\n提示：点击同义词组可编辑`,
          options
        );
        
        if (result === null || result === 0) {
          break; // 取消
        }
        
        const selectedIndex = result - 1; // userSelect 返回的索引从1开始
        
        if (selectedIndex === 0) {
          // 添加新组
          await this.showAddSynonymDialog();
        } else if (selectedIndex === 1) {
          // 搜索同义词组
          await this.searchSynonymGroups();
        } else if (selectedIndex === 2) {
          // 第一个分隔线，重新显示菜单
          continue;
        } else if (selectedIndex >= 3 && selectedIndex < 3 + groups.length) {
          // 编辑现有组
          const groupIndex = selectedIndex - 3;
          await this.editSynonymGroup(groups[groupIndex]);
          continue; // 重新显示菜单，避免双弹窗
        } else if (selectedIndex === 3 + groups.length) {
          // 第二个分隔线，重新显示菜单
          continue;
        } else if (selectedIndex === 3 + groups.length + 1) {
          // 导出配置
          await this.showExportSynonymDialog();
        } else if (selectedIndex === 3 + groups.length + 2) {
          // 导入配置
          await this.showImportSynonymDialog();
        }
      }
    } catch (error) {
      MNUtil.showHUD("管理同义词组失败：" + error.message);
      MNUtil.log("管理同义词组错误: " + error.toString());
    }
  }

  /**
   * 搜索同义词组 - 支持按名称和词汇内容搜索
   */
  static async searchSynonymGroups() {
    try {
      const groups = this.getSynonymGroups();
      if (groups.length === 0) {
        MNUtil.showHUD("❌ 暂无同义词组");
        return;
      }

      // 显示搜索输入框
      const keyword = await new Promise((resolve) => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "搜索同义词组",
          "请输入搜索关键词（支持搜索组名或词汇内容）：",
          2, // 输入框样式
          "取消",
          ["搜索"],
          (alert, buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(null);
              return;
            }
            
            const text = alert.textFieldAtIndex(0).text.trim();
            if (!text) {
              MNUtil.showHUD("❌ 请输入搜索关键词");
              resolve(null);
              return;
            }
            
            resolve(text);
          }
        );
      });

      if (!keyword) {
        return; // 用户取消
      }

      // 执行搜索
      const matchedGroups = [];
      const lowerKeyword = keyword.toLowerCase();
      
      for (const group of groups) {
        // 添加数据验证
        if (!group || !group.name) {
          MNUtil.log("警告：发现异常同义词组数据，已跳过搜索");
          continue;
        }
        
        // 搜索组名
        if (group.name.toLowerCase().includes(lowerKeyword)) {
          matchedGroups.push(group);
          continue;
        }
        
        // 搜索词汇内容 - 防御性检查
        const words = group.words || [];
        let hasMatchingWord = false;
        for (const word of words) {
          if (word && word.toLowerCase().includes(lowerKeyword)) {
            hasMatchingWord = true;
            break;
          }
        }
        if (hasMatchingWord) {
          matchedGroups.push(group);
        }
      }

      // 显示搜索结果
      if (matchedGroups.length === 0) {
        MNUtil.showHUD(`❌ 未找到包含"${keyword}"的同义词组`);
        return;
      }

      // 构建搜索结果选项
      const searchOptions = [];
      for (const group of matchedGroups) {
        const status = group.enabled ? "✅" : "⭕";
        const partialIcon = group.partialReplacement ? "🔄" : "";
        // 防御性检查 - 处理 words 可能为空的情况
        const words = group.words || [];
        const wordsPreview = words.slice(0, 3).join(", ");
        const moreText = words.length > 3 ? `... (共${words.length}个)` : "";
        searchOptions.push(`${status} ${partialIcon} ${group.name}: ${wordsPreview}${moreText}`);
      }

      // 循环显示搜索结果，支持连续编辑
      while (true) {
        const result = await MNUtil.userSelect(
          `搜索结果 (${matchedGroups.length}个)`,
          `关键词："${keyword}"\n\n点击同义词组可编辑`,
          searchOptions
        );

        if (result === null || result === 0) {
          break; // 用户取消，返回
        }

        // 编辑选中的同义词组
        const selectedGroup = matchedGroups[result - 1];
        await this.editSynonymGroup(selectedGroup);
        
        // 询问是否继续编辑其他搜索结果
        if (matchedGroups.length > 1) {
          const continueEdit = await MNUtil.confirm(
            "继续编辑？",
            "是否继续编辑其他搜索结果？",
            ["返回主菜单", "继续编辑"]
          );
          
          if (continueEdit !== 1) {
            break; // 用户选择返回主菜单
          }
          
          // 重新构建搜索结果选项（可能有变化）
          searchOptions.length = 0; // 清空数组
          for (const group of matchedGroups) {
            const status = group.enabled ? "✅" : "⭕";
            const partialIcon = group.partialReplacement ? "🔄" : "";
            const words = group.words || [];
            const wordsPreview = words.slice(0, 3).join(", ");
            const moreText = words.length > 3 ? `... (共${words.length}个)` : "";
            searchOptions.push(`${status} ${partialIcon} ${group.name}: ${wordsPreview}${moreText}`);
          }
        } else {
          // 只有一个搜索结果，编辑完成后直接返回
          break;
        }
      }
      
    } catch (error) {
      MNUtil.showHUD("搜索同义词组失败：" + error.message);
      MNUtil.log("搜索同义词组错误: " + error.toString());
    }
  }

  /**
   * 添加同义词组（多层对话框方式）
   */
  static async showAddSynonymDialog() {
    let continueAdding = true;
    let addedCount = 0;
    
    while (continueAdding) {
      // 第一步：输入组名
      const groupName = await new Promise((resolve) => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "添加同义词组",
          "请输入同义词组名称：",
          2, // 输入框样式
          "取消",
          ["下一步"],
          (alert, buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(null);
              return;
            }
            
            const name = alert.textFieldAtIndex(0).text.trim();
            if (!name) {
              MNUtil.showHUD("❌ 请输入组名");
              resolve(null);
              return;
            }
            
            resolve(name);
          }
        );
      });
      
      if (!groupName) {
        break; // 用户取消
      }
      
      // 第二步：输入词汇
      const words = await new Promise((resolve) => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "添加同义词",
          `组名：${groupName}\n\n请输入同义词，支持以下分隔方式：\n• 逗号：machine learning, deep learning\n• 分号：机器学习; 深度学习\n• 双空格：机器学习  深度学习\n• 单空格：机器 学习（仅当无其他分隔符时）`,
          2,
          "取消",
          ["下一步"],
          (alert, buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(null);
              return;
            }
            
            const wordsInput = alert.textFieldAtIndex(0).text;
            if (!wordsInput) {
              MNUtil.showHUD("❌ 请输入同义词");
              resolve(null);
              return;
            }
            
            // 使用智能解析
            const parsedWords = this.parseWords(wordsInput);
            
            if (parsedWords.length < 2) {
              MNUtil.showHUD("❌ 至少需要2个同义词");
              resolve(null);
              return;
            }
            
            resolve(parsedWords);
          }
        );
      });
      
      if (!words) {
        continue; // 返回重新输入
      }
      
      // 第三步：选择匹配模式
      const { enablePartial, patternMode } = await new Promise((resolve) => {
        const hasPatternPlaceholder = words.some(word => word.includes('{{}}'));
        
        let message = `组名：${groupName}\n词汇：${words.join(", ")}\n\n`;
        if (hasPatternPlaceholder) {
          message += `检测到模式占位符 {{}}，建议启用模式匹配：\n`;
        }
        message += `选择匹配模式：\n• 普通：只匹配完整的词\n• 局部替换：在长词中也会匹配\n• 模式匹配：支持 {{}} 占位符的动态匹配`;
        
        const buttons = ["下一步（普通）", "下一步（局部替换）", "下一步（模式匹配）"];
        
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "选择匹配模式",
          message,
          0,
          "取消",
          buttons,
          (alert, buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(null);
              return;
            }
            
            switch (buttonIndex) {
              case 1: // 普通模式
                resolve({ enablePartial: false, patternMode: false });
                break;
              case 2: // 局部替换
                resolve({ enablePartial: true, patternMode: false });
                break;
              case 3: // 模式匹配
                resolve({ enablePartial: false, patternMode: true });
                break;
            }
          }
        );
      });
      
      if (!enablePartial && !patternMode && enablePartial !== false) {
        continue; // 返回重新输入（当resolve(null)时）
      }

      // 第四步：选择大小写敏感
      const caseSensitive = await new Promise((resolve) => {
        const modeText = patternMode ? "（模式匹配）" : (enablePartial ? "（局部替换）" : "（普通）");
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "大小写匹配",
          `组名：${groupName}${modeText}\n词汇：${words.join(", ")}\n\n是否启用大小写敏感匹配？\n• 启用：Machine 和 machine 视为不同词汇\n• 不启用：Machine 和 machine 视为相同词汇`,
          0,
          "取消", 
          ["下一步（不敏感）", "下一步（大小写敏感）"],
          (alert, buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(null);
              return;
            }
            
            resolve(buttonIndex === 2); // 第二个按钮为启用大小写敏感
          }
        );
      });

      if (caseSensitive === null) {
        continue; // 返回重新输入
      }

      // 第五步：设置上下文触发词（可选）
      let contextTriggers = undefined;
      let contextMode = "any";
      
      const setContext = await new Promise((resolve) => {
        const modeText = patternMode ? "（模式匹配）" : (enablePartial ? "（局部替换）" : "（普通）");
        const caseText = caseSensitive ? "（大小写敏感）" : "";
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "上下文触发词",
          `组名：${groupName}${modeText}${caseText}\n词汇：${words.join(", ")}\n\n是否设置上下文触发词？\n• 设置：仅当卡片标题包含特定词汇时才应用\n• 跳过：全局应用（对所有卡片生效，推荐）`,
          0,
          "取消",
          ["直接添加（全局）", "设置触发词"],
          (alert, buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(null);
              return;
            }
            
            resolve(buttonIndex === 2); // 第二个按钮为设置触发词
          }
        );
      });

      if (setContext === null) {
        continue; // 返回重新输入
      }

      // 如果选择设置触发词，进行触发词配置
      if (setContext) {
        // 输入触发词
        const triggerInput = await new Promise((resolve) => {
          UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
            "设置触发词",
            "请输入触发词，用逗号分隔：\n例如：内积空间, 赋范线性空间\n\n触发词说明：\n• 只有当卡片标题包含这些词汇时，才会应用该同义词组\n• 适合特定领域的专业术语",
            2, // 输入框样式
            "取消",
            ["完成设置"],
            (alert, buttonIndex) => {
              if (buttonIndex === 0) {
                resolve(null);
                return;
              }
              
              const input = alert.textFieldAtIndex(0).text.trim();
              resolve(input);
            }
          );
        });

        if (triggerInput === null) {
          continue; // 返回重新输入
        }

        if (triggerInput) {
          // 解析触发词
          const parsedTriggers = triggerInput.split(",")
            .map(t => t.trim())
            .filter(t => t.length > 0);

          if (parsedTriggers.length > 0) {
            contextTriggers = parsedTriggers;

            // 如果有多个触发词，选择匹配模式
            if (parsedTriggers.length > 1) {
              const mode = await new Promise((resolve) => {
                UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
                  "选择触发模式",
                  `已设置 ${parsedTriggers.length} 个触发词：\n${parsedTriggers.join(", ")}\n\n请选择匹配模式：`,
                  0,
                  "取消",
                  ["任意匹配（推荐）", "全部匹配"],
                  (alert, buttonIndex) => {
                    if (buttonIndex === 0) {
                      resolve(null);
                      return;
                    }
                    
                    resolve(buttonIndex === 1 ? "any" : "all");
                  }
                );
              });

              if (mode === null) {
                continue; // 返回重新输入
              }
              
              contextMode = mode;
            }
          }
        }
      }
      
      // 添加同义词组
      const result = this.addSynonymGroup(groupName, words, enablePartial, contextTriggers, contextMode, caseSensitive, patternMode);
      if (result) {
        addedCount++;
        let configText = "";
        if (patternMode) configText += "模式匹配·";
        else if (enablePartial) configText += "局部替换·";
        if (caseSensitive) configText += "大小写敏感·";
        if (contextTriggers && contextTriggers.length > 0) {
          const modeText = contextMode === "all" ? "全部匹配" : "任意匹配";
          configText += `触发词${contextTriggers.length}个(${modeText})`;
        } else {
          configText += "全局应用";
        }
        MNUtil.showHUD(`✅ 已添加：${groupName}\n配置：${configText}`);
      }
      
      // 第四步：询问是否继续添加
      continueAdding = await new Promise((resolve) => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "继续添加？",
          `已成功添加 ${addedCount} 个同义词组\n\n是否继续添加？`,
          0,
          "完成",
          ["继续添加"],
          (alert, buttonIndex) => {
            resolve(buttonIndex === 1);
          }
        );
      });
    }
    
    if (addedCount > 0) {
      MNUtil.showHUD(`✅ 共添加 ${addedCount} 个同义词组`);
    }
  }

  /**
   * 编辑同义词组
   */
  static async editSynonymGroup(group) {
    try {
      const options = [
        group.enabled ? "🔴 禁用此组" : "🟢 启用此组",
        group.partialReplacement ? "🔄 关闭局部替换" : "🔄 开启局部替换",
        group.patternMode ? "🔀 关闭模式匹配" : "🔀 开启模式匹配",  // 新增
        "🌍 设置触发词",
        group.caseSensitive ? "🔠 关闭大小写敏感" : "🔠 开启大小写敏感",
        "✏️ 编辑词汇",
        "📝 重命名组",
        "🗑 删除此组",
        "📋 复制词汇列表",
        "──────────────",
        "🔍 测试匹配效果"  // 修改为通用测试
      ];
      
      const wordsPreview = group.words.join(", ");
      const partialStatus = group.partialReplacement ? "已开启" : "已关闭";
      const patternStatus = group.patternMode ? "已开启" : "已关闭";
      const caseSensitiveStatus = group.caseSensitive ? "大小写敏感" : "大小写不敏感";
      let contextInfo = "全局";
      if (group.contextTriggers && group.contextTriggers.length > 0) {
        const mode = group.contextMode === "all" ? "全部" : "任意";
        contextInfo = `触发词(${mode}): ${group.contextTriggers.join(", ")}`;
      }
      
      const message = `词汇：${wordsPreview}\n状态：${group.enabled ? "已启用" : "已禁用"}\n局部替换：${partialStatus}\n模式匹配：${patternStatus}\n大小写：${caseSensitiveStatus}\n上下文：${contextInfo}\n创建时间：${new Date(group.createdAt).toLocaleDateString()}`;
      
      const result = await MNUtil.userSelect(group.name, message, options);
      
      if (result === null || result === 0) {
        return; // 取消
      }
      
      switch (result) {
        case 1: // 启用/禁用
          group.enabled = !group.enabled;
          group.updatedAt = Date.now();
          this.saveSearchConfig();
          MNUtil.showHUD(group.enabled ? "✅ 已启用" : "⭕ 已禁用");
          break;
          
        case 2: // 开启/关闭局部替换
          group.partialReplacement = !group.partialReplacement;
          group.updatedAt = Date.now();
          this.saveSearchConfig();
          MNUtil.showHUD(group.partialReplacement ? "🔄 已开启局部替换" : "已关闭局部替换");
          break;
          
        case 3: // 开启/关闭模式匹配
          group.patternMode = !group.patternMode;
          group.updatedAt = Date.now();
          this.saveSearchConfig();
          MNUtil.showHUD(group.patternMode ? "🔀 已开启模式匹配" : "已关闭模式匹配");
          break;
          
        case 4: // 设置触发词
          await this.editContextTriggers(group);
          break;
          
        case 5: // 大小写敏感
          group.caseSensitive = !group.caseSensitive;
          group.updatedAt = Date.now();
          this.saveSearchConfig();
          MNUtil.showHUD(group.caseSensitive ? "🔠 已开启大小写敏感" : "已关闭大小写敏感");
          break;
          
        case 6: // 编辑词汇
          await this.editSynonymWords(group);
          break;
          
        case 7: // 重命名
          await this.renameSynonymGroup(group);
          break;
          
        case 8: // 删除
          const confirmDelete = await this.confirmAction(
            "确认删除",
            `确定要删除"${group.name}"吗？\n此操作不可恢复。`
          );
          if (confirmDelete) {
            this.deleteSynonymGroup(group.id);
            MNUtil.showHUD("✅ 已删除");
          }
          break;
          
        case 9: // 复制词汇
          MNUtil.copy(group.words.join(", "));
          MNUtil.showHUD("📋 已复制到剪贴板");
          break;
          
        case 10: // 分隔线
          break;
          
        case 11: // 测试匹配效果
          await this.testPartialReplacement(group);
          break;
      }
    } catch (error) {
      MNUtil.showHUD("编辑同义词组失败：" + error.message);
    }
  }

  /**
   * 编辑上下文触发词
   * @param {Object} group - 同义词组对象
   */
  static async editContextTriggers(group) {
    try {
      // 显示当前配置信息
      let currentInfo = "当前配置：";
      if (group.contextTriggers && group.contextTriggers.length > 0) {
        const mode = group.contextMode === "all" ? "全部匹配" : "任意匹配";
        currentInfo += `\n触发词：${group.contextTriggers.join(", ")}\n匹配模式：${mode}`;
      } else {
        currentInfo += "\n全局应用（无触发词限制）";
      }

      // 第一步：选择操作类型
      const actionOptions = [
        "✏️ 修改触发词",
        "🔄 切换匹配模式",
        "🗑 清除触发词（改为全局）",
        "ℹ️ 查看帮助"
      ];

      const action = await MNUtil.userSelect(
        "设置上下文触发词",
        currentInfo,
        actionOptions
      );

      if (action === null || action === 0) return;

      switch (action) {
        case 1: // 修改触发词
          await this.editTriggerWords(group);
          break;

        case 2: // 切换匹配模式
          if (group.contextTriggers && group.contextTriggers.length > 0) {
            group.contextMode = group.contextMode === "all" ? "any" : "all";
            group.updatedAt = Date.now();
            this.saveSearchConfig();
            const newMode = group.contextMode === "all" ? "全部匹配" : "任意匹配";
            MNUtil.showHUD(`🔄 匹配模式已改为：${newMode}`);
          } else {
            MNUtil.showHUD("⚠️ 请先设置触发词");
          }
          break;

        case 3: // 清除触发词
          const confirm = await MNUtil.confirm(
            "确认清除触发词",
            "清除后该同义词组将全局应用（对所有卡片生效）",
            ["取消", "确认清除"]
          );
          if (confirm === 1) {
            group.contextTriggers = undefined;
            group.contextMode = "any";
            group.updatedAt = Date.now();
            this.saveSearchConfig();
            MNUtil.showHUD("✅ 已清除触发词，改为全局应用");
          }
          break;

        case 4: // 查看帮助
          const helpText = `🔍 上下文触发词功能说明：

📌 全局模式（默认）：
   • 对所有卡片生效
   • 适合通用同义词

🎯 上下文模式：
   • 仅当卡片标题包含触发词时生效
   • 适合特定领域的专业术语

🔄 匹配模式：
   • 任意匹配：包含任一触发词即生效
   • 全部匹配：必须包含所有触发词

💡 示例：
   触发词：["内积空间", "赋范空间"]
   • 任意匹配：标题包含其中任一词即生效
   • 全部匹配：标题必须同时包含两个词`;

          await MNUtil.confirm("上下文触发词帮助", helpText, ["知道了"]);
          // 显示帮助后返回主界面
          await this.editContextTriggers(group);
          break;
      }
    } catch (error) {
      MNUtil.showHUD("编辑触发词失败：" + error.message);
    }
  }

  /**
   * 编辑具体的触发词内容
   * @param {Object} group - 同义词组对象
   */
  static async editTriggerWords(group) {
    try {
      const currentTriggers = group.contextTriggers || [];
      const currentText = currentTriggers.join(", ");

      // 输入新的触发词
      const newTriggers = await new Promise((resolve) => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "设置触发词",
          `当前触发词：${currentText || "（无）"}\n\n请输入新的触发词，用逗号分隔：\n例如：内积空间, 赋范线性空间`,
          2, // 输入框样式
          "取消",
          ["确定"],
          (alert, buttonIndex) => {
            if (buttonIndex === 0) {
              resolve(null); // 用户取消
            } else {
              const input = alert.textFieldAtIndex(0).text.trim();
              resolve(input);
            }
          }
        );
      });

      if (newTriggers === null) return; // 用户取消

      // 解析和验证输入
      if (newTriggers === "") {
        // 空输入，询问是否清除
        const confirmClear = await MNUtil.confirm(
          "确认清除",
          "输入为空，是否清除所有触发词？\n清除后将改为全局应用。",
          ["取消", "清除"]
        );
        if (confirmClear === 1) {
          group.contextTriggers = undefined;
          group.contextMode = "any";
          group.updatedAt = Date.now();
          this.saveSearchConfig();
          MNUtil.showHUD("✅ 已清除触发词");
        }
        return;
      }

      // 解析触发词
      const parsedTriggers = newTriggers.split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (parsedTriggers.length === 0) {
        MNUtil.showHUD("⚠️ 请输入有效的触发词");
        return;
      }

      // 验证触发词长度
      const invalidTriggers = parsedTriggers.filter(t => t.length > 50);
      if (invalidTriggers.length > 0) {
        MNUtil.showHUD("⚠️ 触发词长度不能超过50字符");
        return;
      }

      // 保存新的触发词
      group.contextTriggers = parsedTriggers;
      if (!group.contextMode) {
        group.contextMode = "any"; // 默认任意匹配
      }
      group.updatedAt = Date.now();
      this.saveSearchConfig();

      // 如果有多个触发词，询问匹配模式
      if (parsedTriggers.length > 1) {
        const modeOptions = [
          "任意匹配（推荐）",
          "全部匹配"
        ];
        const modeChoice = await MNUtil.userSelect(
          "选择匹配模式",
          `已设置 ${parsedTriggers.length} 个触发词：\n${parsedTriggers.join(", ")}\n\n请选择匹配模式：`,
          modeOptions
        );

        if (modeChoice !== null && modeChoice > 0) {
          group.contextMode = modeChoice === 1 ? "any" : "all";
          group.updatedAt = Date.now();
          this.saveSearchConfig();
        }
      }

      const modeText = group.contextMode === "all" ? "全部匹配" : "任意匹配";
      MNUtil.showHUD(`✅ 已设置 ${parsedTriggers.length} 个触发词（${modeText}）`);

    } catch (error) {
      MNUtil.showHUD("编辑触发词失败：" + error.message);
    }
  }

  /**
   * 编辑同义词 - 调用多选界面
   */
  static async editSynonymWords(group) {
    // 调用新的多选编辑界面
    await this.editSynonymWordsWithMultiSelect(group);
  }

  /**
   * 使用多选界面编辑同义词
   * @param {Object} group - 同义词组对象
   * @returns {Promise<boolean>} 返回是否成功保存
   */
  static async editSynonymWordsWithMultiSelect(group) {
    return new Promise((resolve) => {
      const selectedWords = new Set(group.words); // 默认全选现有词汇
      let newWordsInput = "";
      
      // 递归显示多选对话框
      const showMultiSelectDialog = () => {
      // 构建显示选项
      let displayOptions = group.words.map(word => {
        let prefix = selectedWords.has(word) ? "✅ " : "";
        return prefix + word;
      });
      
      // 添加控制选项
      let allSelected = selectedWords.size === group.words.length;
      let selectAllText = allSelected ? "⬜ 取消全选" : "☑️ 全选所有词汇";
      displayOptions.unshift(selectAllText);
      displayOptions.unshift("🔄 反选");
      displayOptions.unshift("➕ 添加新词汇");
      displayOptions.push("──────────────");
      displayOptions.push("✅ 确认保存");
      
      const selectedArray = Array.from(selectedWords);
      const newWordsArray = newWordsInput ? this.parseWords(newWordsInput) : [];
      const totalWords = [...selectedArray, ...newWordsArray];
      
      const message = `已选中 ${selectedWords.size}/${group.words.length} 个现有词汇\n` +
                     (newWordsInput ? `新增：${newWordsArray.join(", ")}\n` : "") +
                     `总计：${totalWords.length} 个词汇`;
      
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        `编辑词汇 - ${group.name}`,
        message,
        0,
        "取消",
        displayOptions,
        (alert, buttonIndex) => {
          if (buttonIndex === 0) {
            // 用户取消
            resolve(false);
            return;
          }
          
          if (buttonIndex === 1) {
            // 添加新词汇
            this.showAddNewWordsDialog().then((input) => {
              if (input) {
                newWordsInput = input;
              }
              showMultiSelectDialog();
            });
            
          } else if (buttonIndex === 2) {
            // 反选
            const newSelectedWords = new Set();
            group.words.forEach(word => {
              if (!selectedWords.has(word)) {
                newSelectedWords.add(word);
              }
            });
            selectedWords.clear();
            newSelectedWords.forEach(word => selectedWords.add(word));
            showMultiSelectDialog();
            
          } else if (buttonIndex === 3) {
            // 全选/取消全选
            if (allSelected) {
              selectedWords.clear();
            } else {
              group.words.forEach(word => selectedWords.add(word));
            }
            showMultiSelectDialog();
            
          } else if (buttonIndex === displayOptions.length) {
            // 确认保存
            const selectedArray = Array.from(selectedWords);
            const newWordsArray = newWordsInput ? this.parseWords(newWordsInput) : [];
            const finalWords = [...selectedArray, ...newWordsArray];
            
            if (finalWords.length >= 2) {
              group.words = finalWords;
              group.updatedAt = Date.now();
              this.saveSearchConfig();
              MNUtil.showHUD(`✅ 已更新词汇（${finalWords.length}个词）`);
              resolve(true);
            } else {
              MNUtil.showHUD("❌ 至少需要2个同义词");
              showMultiSelectDialog();
            }
            
          } else if (buttonIndex === displayOptions.length - 1) {
            // 分隔线，重新显示
            showMultiSelectDialog();
            
          } else {
            // 用户选择了某个词汇，切换选中状态
            const wordIndex = buttonIndex - 4; // 减去前面的控制选项
            const word = group.words[wordIndex];
            
            if (selectedWords.has(word)) {
              selectedWords.delete(word);
            } else {
              selectedWords.add(word);
            }
            
            showMultiSelectDialog();
          }
        }
      );
      };
      
      showMultiSelectDialog();
    });
  }

  /**
   * 显示添加新词汇的输入对话框
   * @returns {Promise<string|null>} 返回输入的文本或 null
   */
  static async showAddNewWordsDialog() {
    return new Promise((resolve) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "添加新词汇",
        "输入新词汇，支持以下分隔方式：\n• 逗号：machine learning, deep learning\n• 分号：机器学习; 深度学习\n• 双空格：机器学习  深度学习\n• 单空格：机器 学习（仅当无其他分隔符时）",
        2,
        "取消",
        ["确定"],
        (alert, buttonIndex) => {
          if (buttonIndex === 0) {
            resolve(null);
            return;
          }
          
          const input = alert.textFieldAtIndex(0).text;
          if (input && input.trim()) {
            resolve(input);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * 测试局部替换功能
   */
  static async testPartialReplacement(group) {
    return new Promise((resolve) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "测试局部替换",
        `组"${group.name}"包含：${group.words.join(", ")}\n\n请输入测试文本：`,
        2,
        "返回",
        ["测试"],
        (alert, buttonIndex) => {
          if (buttonIndex === 0) {
            resolve(false);
            return;
          }
          
          const testText = alert.textFieldAtIndex(0).text;
          if (!testText) {
            MNUtil.showHUD("请输入测试文本");
            resolve(false);
            return;
          }
          
          // 生成变体
          const variants = this.generatePartialReplacements(testText, group);
          
          if (variants.length > 0) {
            const resultText = `原文：${testText}\n\n生成的变体（${variants.length}个）：\n${variants.map((v, i) => `${i+1}. ${v}`).join('\n')}`;
            
            // 显示结果
            UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
              "替换结果",
              resultText,
              0,
              "确定",
              ["复制所有变体"],
              (alert2, buttonIndex2) => {
                if (buttonIndex2 === 1) {
                  MNUtil.copy(variants.join("\n"));
                  MNUtil.showHUD("📋 已复制到剪贴板");
                }
                resolve(true);
              }
            );
          } else {
            MNUtil.showHUD("未找到可替换的内容");
            resolve(false);
          }
        }
      );
    });
  }

  /**
   * 重命名同义词组
   */
  static async renameSynonymGroup(group) {
    return new Promise((resolve) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "重命名",
        `当前名称：${group.name}\n\n请输入新名称：`,
        2,
        "取消",
        ["确定"],
        (alert, buttonIndex) => {
          if (buttonIndex === 0) {
            resolve(false);
            return;
          }
          
          const newName = alert.textFieldAtIndex(0).text.trim();
          if (newName && newName !== group.name) {
            group.name = newName;
            group.updatedAt = Date.now();
            this.saveSearchConfig();
            MNUtil.showHUD("✅ 已重命名");
            resolve(true);
          }
        }
      );
      // 注意：MarginNote 的 JSB 框架不支持 setTimeout
      // 无法预填充输入框，用户需要手动输入新值
    });
  }

  /**
   * 显示更多功能菜单
   */
  static async showMoreFeaturesMenu() {
    const options = [
      "🔄 管理同义词组",
      "🚫 管理排除词组",
      "📁 管理根目录",
      "📤📥 导入导出配置"
    ];
    
    const result = await MNUtil.userSelect(
      "更多搜索功能",
      "选择要管理的功能：",
      options
    );
    
    if (result === null || result === 0) return null;
    
    switch (result) {
      case 1:
        return "manageSynonyms";
      case 2:
        return "manageExclusions";
      case 3:
        return "manageRoots";
      case 4:
        return "importExport";
    }
    return null;
  }

  /**
   * 显示导入导出菜单
   */
  static async showImportExportMenu() {
    const options = [
      "📤 导出完整配置",
      "📥 导入完整配置",
      "──────────────",
      "🔄 导出同义词组",
      "🔄 导入同义词组",
      "🚫 导出排除词组",
      "🚫 导入排除词组"
    ];
    
    const result = await MNUtil.userSelect(
      "导入导出配置",
      "选择操作：",
      options
    );
    
    if (result === null || result === 0) return;
    
    switch (result) {
      case 1: // 导出完整配置
        await this.exportFullSearchConfig();
        break;
      case 2: // 导入完整配置
        await this.importFullSearchConfig();
        break;
      case 3: // 分隔线
        break;
      case 4: // 导出同义词
        await this.showExportSynonymDialog();
        break;
      case 5: // 导入同义词
        await this.showImportSynonymDialog();
        break;
      case 6: // 导出排除词
        await this.showExportExclusionDialog();
        break;
      case 7: // 导入排除词
        await this.showImportExclusionDialog();
        break;
    }
  }

  /**
   * 导出完整搜索配置
   */
  static async exportFullSearchConfig() {
    try {
      // 使用统一的配置获取函数
      const config = this.getFullSearchConfig();
      // 添加 type 字段用于识别
      config.type = "fullSearchConfig";
      
      const jsonStr = JSON.stringify(config, null, 2);
      
      const target = await MNUtil.userSelect(
        "导出完整配置",
        "选择导出方式：",
        ["☁️ 同步到 iCloud", "📋 复制到剪贴板", "📝 保存到当前笔记"]
      );
      
      if (target === null || target === 0) return;
      
      switch (target) {
        case 1: // iCloud
          MNUtil.setByiCloud("knowledgeBaseTemplate_FullSearchConfig", jsonStr);
          MNUtil.showHUD("☁️ 已同步到 iCloud");
          break;
        case 2: // 剪贴板
          MNUtil.copy(jsonStr);
          MNUtil.showHUD("📋 已复制到剪贴板");
          break;
        case 3: // 当前笔记
          const focusNote = MNNote.getFocusNote();
          if (focusNote) {
            const formattedJson = this.formatJsonAsCodeBlock(jsonStr);
            focusNote.appendTextComment(formattedJson);
            MNUtil.showHUD("📝 已保存到当前笔记");
          } else {
            MNUtil.showHUD("❌ 未选中笔记");
          }
          break;
      }
    } catch (error) {
      MNUtil.showHUD("❌ 导出失败：" + error.message);
    }
  }

  /**
   * 导入完整搜索配置
   */
  static async importFullSearchConfig() {
    try {
      const source = await MNUtil.userSelect(
        "导入完整配置",
        "选择导入来源：",
        ["☁️ 从 iCloud 同步", "📋 从剪贴板导入", "📝 从当前笔记导入"]
      );
      
      if (source === null || source === 0) return;
      
      let jsonStr = null;
      
      switch (source) {
        case 1: // iCloud
          jsonStr = MNUtil.getByiCloud("knowledgeBaseTemplate_FullSearchConfig", null);
          if (!jsonStr) {
            MNUtil.showHUD("❌ iCloud 中未找到配置");
            return;
          }
          break;
        case 2: // 剪贴板
          jsonStr = MNUtil.clipboardText;
          break;
        case 3: // 当前笔记
          const focusNote = MNNote.getFocusNote();
          if (!focusNote) {
            MNUtil.showHUD("❌ 未选中笔记");
            return;
          }
          // 查找包含完整配置的评论
          for (const comment of focusNote.comments) {
            if (comment.type === "textComment" && comment.text.includes('"fullSearchConfig"')) {
              jsonStr = this.extractJsonFromCodeBlock(comment.text);
              break;
            }
          }
          if (!jsonStr) {
            MNUtil.showHUD("❌ 当前笔记中未找到配置");
            return;
          }
          break;
      }
      
      const config = JSON.parse(jsonStr);
      if (!config.searchConfig) {
        throw new Error("无效的配置格式");
      }
      
      // 版本兼容性处理
      if (!config.version || config.version === "2.0") {
        // 旧版本配置，自动升级
        config.searchConfig.rootGroups = config.searchConfig.rootGroups || {};
        config.searchConfig.lastUsedGroup = config.searchConfig.lastUsedGroup || null;
        config.searchConfig.lastUsedRoots = config.searchConfig.lastUsedRoots || 
          (config.searchConfig.lastUsedRoot ? [config.searchConfig.lastUsedRoot] : []);
      }
      
      const importMode = await MNUtil.userSelect(
        "导入方式",
        "选择导入方式：",
        ["替换现有配置", "合并配置"]
      );
      
      if (importMode === null || importMode === 0) return;
      
      this.initSearchConfig();
      
      if (importMode === 1) {
        // 替换
        Object.assign(this.searchRootConfigs, config.searchConfig);
        this.searchRootConfigs.synonymGroups = config.synonymGroups || [];
        this.searchRootConfigs.exclusionGroups = config.exclusionGroups || [];
      } else {
        // 合并
        // 合并根目录
        if (config.searchConfig.roots) {
          Object.assign(this.searchRootConfigs.roots, config.searchConfig.roots);
        }
        
        // 合并群组
        if (config.searchConfig.rootGroups) {
          if (!this.searchRootConfigs.rootGroups) {
            this.searchRootConfigs.rootGroups = {};
          }
          // 合并群组，如果同名则询问用户
          for (const groupName in config.searchConfig.rootGroups) {
            if (this.searchRootConfigs.rootGroups[groupName]) {
              const overwrite = await MNUtil.confirm(
                "群组冲突",
                `群组"${groupName}"已存在，是否覆盖？`,
                ["跳过", "覆盖"]
              );
              if (overwrite === 1) {
                this.searchRootConfigs.rootGroups[groupName] = config.searchConfig.rootGroups[groupName];
              }
            } else {
              this.searchRootConfigs.rootGroups[groupName] = config.searchConfig.rootGroups[groupName];
            }
          }
        }
        
        // 合并同义词组
        if (config.synonymGroups && config.synonymGroups.length > 0) {
          if (!this.searchRootConfigs.synonymGroups) {
            this.searchRootConfigs.synonymGroups = [];
          }
          const existingIds = new Set(this.searchRootConfigs.synonymGroups.map(g => g.id));
          for (const group of config.synonymGroups) {
            if (!existingIds.has(group.id)) {
              this.searchRootConfigs.synonymGroups.push(group);
            }
          }
        }
        // 合并排除词组
        if (config.exclusionGroups && config.exclusionGroups.length > 0) {
          if (!this.searchRootConfigs.exclusionGroups) {
            this.searchRootConfigs.exclusionGroups = [];
          }
          const existingIds = new Set(this.searchRootConfigs.exclusionGroups.map(g => g.id));
          for (const group of config.exclusionGroups) {
            if (!existingIds.has(group.id)) {
              this.searchRootConfigs.exclusionGroups.push(group);
            }
          }
        }
      }
      
      // 验证导入的群组
      if (this.searchRootConfigs.rootGroups) {
        for (const groupName in this.searchRootConfigs.rootGroups) {
          const group = this.searchRootConfigs.rootGroups[groupName];
          const validRoots = [];
          
          for (const rootKey of group.roots || []) {
            if (this.searchRootConfigs.roots[rootKey]) {
              validRoots.push(rootKey);
            } else {
              MNUtil.log(`警告：群组"${groupName}"中的根目录"${rootKey}"不存在`);
            }
          }
          
          group.roots = validRoots;
          
          // 如果群组为空，删除该群组
          if (validRoots.length === 0) {
            delete this.searchRootConfigs.rootGroups[groupName];
            MNUtil.log(`已移除空群组：${groupName}`);
          }
        }
      }
      
      this.saveSearchConfig();
      MNUtil.showHUD("✅ 配置导入成功");
    } catch (error) {
      MNUtil.showHUD("❌ 导入失败：" + error.message);
    }
  }

  /**
   * 管理排除词组 - 主界面
   */
  static async manageExclusionGroups() {
    try {
      while (true) {
        const groups = this.getExclusionGroups();
        const options = [];
        
        // 显示现有排除词组
        for (const group of groups) {
          const status = group.enabled ? "✅" : "⭕";
          const triggersPreview = group.triggerWords.slice(0, 2).join(", ");
          const excludesPreview = group.excludeWords.slice(0, 2).join(", ");
          const moreText = group.triggerWords.length > 2 ? "..." : "";
          options.push(`${status} ${group.name}: ${triggersPreview}${moreText} → 排除: ${excludesPreview}`);
        }
        
        // 添加操作选项
        options.push("➕ 添加新排除词组");
        options.push("──────────────");
        options.push("📤 导出排除词配置");
        options.push("📥 导入排除词配置");
        
        const result = await MNUtil.userSelect(
          "排除词管理",
          `共 ${groups.length} 个排除词组\n\n提示：搜索时将自动过滤包含排除词的结果`,
          options
        );
        
        if (result === null || result === 0) {
          break; // 取消
        }
        
        const selectedIndex = result - 1;
        
        if (selectedIndex < groups.length) {
          // 编辑现有组
          await this.editExclusionGroup(groups[selectedIndex]);
          continue; // 重新显示菜单，避免双弹窗
        } else if (selectedIndex === groups.length) {
          // 添加新组
          await this.showAddExclusionGroupDialog();
        } else if (selectedIndex === groups.length + 1) {
          // 分隔线
          continue;
        } else if (selectedIndex === groups.length + 2) {
          // 导出配置
          await this.showExportExclusionDialog();
        } else if (selectedIndex === groups.length + 3) {
          // 导入配置
          await this.showImportExclusionDialog();
        }
      }
    } catch (error) {
      MNUtil.showHUD("管理排除词组失败：" + error.message);
      MNUtil.log("管理排除词组错误: " + error.toString());
    }
  }

  /**
   * 添加排除词组对话框
   */
  static async showAddExclusionGroupDialog() {
    return new Promise((resolve) => {
      // 第一步：输入组名
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "添加排除词组",
        "请输入排除词组名称：",
        2,
        "取消",
        ["下一步"],
        (alert, buttonIndex) => {
          if (buttonIndex === 0) {
            resolve(false);
            return;
          }
          
          const groupName = alert.textFieldAtIndex(0).text.trim();
          if (!groupName) {
            MNUtil.showHUD("❌ 请输入组名");
            resolve(false);
            return;
          }
          
          // 第二步：输入触发词
          UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
            "设置触发词",
            `组名：${groupName}\n\n请输入触发词（搜索这些词时将激活排除规则）：\n支持逗号、分号或空格分隔`,
            2,
            "取消",
            ["下一步"],
            (alert2, buttonIndex2) => {
              if (buttonIndex2 === 0) {
                resolve(false);
                return;
              }
              
              const triggerInput = alert2.textFieldAtIndex(0).text;
              if (!triggerInput) {
                MNUtil.showHUD("❌ 请输入触发词");
                resolve(false);
                return;
              }
              
              const triggerWords = this.parseWords(triggerInput);
              if (triggerWords.length === 0) {
                MNUtil.showHUD("❌ 至少需要一个触发词");
                resolve(false);
                return;
              }
              
              // 第三步：输入排除词
              UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
                "设置排除词",
                `组名：${groupName}\n触发词：${triggerWords.join(", ")}\n\n请输入排除词（包含这些词的结果将被过滤）：`,
                2,
                "取消",
                ["确定"],
                (alert3, buttonIndex3) => {
                  if (buttonIndex3 === 0) {
                    resolve(false);
                    return;
                  }
                  
                  const excludeInput = alert3.textFieldAtIndex(0).text;
                  if (!excludeInput) {
                    MNUtil.showHUD("❌ 请输入排除词");
                    resolve(false);
                    return;
                  }
                  
                  const excludeWords = this.parseWords(excludeInput);
                  if (excludeWords.length === 0) {
                    MNUtil.showHUD("❌ 至少需要一个排除词");
                    resolve(false);
                    return;
                  }
                  
                  // 添加组
                  this.addExclusionGroup(groupName, triggerWords, excludeWords);
                  MNUtil.showHUD(`✅ 已添加排除词组：${groupName}`);
                  resolve(true);
                }
              );
            }
          );
        }
      );
    });
  }

  /**
   * 编辑排除词组
   */
  static async editExclusionGroup(group) {
    try {
      const options = [
        group.enabled ? "🔴 禁用此组" : "🟢 启用此组",
        "✏️ 编辑触发词",
        "✏️ 编辑排除词",
        "📝 重命名组",
        "🗑 删除此组",
        "📋 复制配置"
      ];
      
      const result = await MNUtil.userSelect(
        group.name,
        `触发词：${group.triggerWords.join(", ")}\n排除词：${group.excludeWords.join(", ")}`,
        options
      );
      
      if (result === null || result === 0) return;
      
      switch (result) {
        case 1: // 切换启用状态
          this.updateExclusionGroup(group.id, { enabled: !group.enabled });
          MNUtil.showHUD(group.enabled ? "⭕ 已禁用" : "✅ 已启用");
          break;
        case 2: // 编辑触发词
          await this.editExclusionTriggerWords(group);
          break;
        case 3: // 编辑排除词
          await this.editExclusionExcludeWords(group);
          break;
        case 4: // 重命名
          await this.renameExclusionGroup(group);
          break;
        case 5: // 删除
          const confirmed = await this.confirmAction("确认删除", `确定删除排除词组"${group.name}"吗？`);
          if (confirmed) {
            this.deleteExclusionGroup(group.id);
            MNUtil.showHUD("🗑 已删除");
          }
          break;
        case 6: // 复制配置
          const config = {
            name: group.name,
            triggerWords: group.triggerWords,
            excludeWords: group.excludeWords
          };
          MNUtil.copy(JSON.stringify(config, null, 2));
          MNUtil.showHUD("📋 已复制到剪贴板");
          break;
      }
    } catch (error) {
      MNUtil.showHUD("编辑排除词组失败：" + error.message);
    }
  }

  /**
   * 编辑触发词 - 调用多选界面
   */
  static async editExclusionTriggerWords(group) {
    await this.editExclusionWordsWithMultiSelect(group, 'trigger');
  }

  /**
   * 编辑排除词 - 调用多选界面
   */
  static async editExclusionExcludeWords(group) {
    await this.editExclusionWordsWithMultiSelect(group, 'exclude');
  }

  /**
   * 使用多选界面编辑排除词组的词汇
   * @param {Object} group - 排除词组对象
   * @param {string} type - 'trigger' 或 'exclude'
   */
  static async editExclusionWordsWithMultiSelect(group, type) {
    const isTrigger = type === 'trigger';
    const currentWords = isTrigger ? group.triggerWords : group.excludeWords;
    const selectedWords = new Set(currentWords); // 默认全选现有词汇
    let newWordsInput = "";
    
    // 递归显示多选对话框
    const showMultiSelectDialog = () => {
      // 构建显示选项
      let displayOptions = currentWords.map(word => {
        let prefix = selectedWords.has(word) ? "✅ " : "";
        return prefix + word;
      });
      
      // 添加控制选项
      let allSelected = selectedWords.size === currentWords.length;
      let selectAllText = allSelected ? "⬜ 取消全选" : "☑️ 全选所有词汇";
      displayOptions.unshift(selectAllText);
      displayOptions.unshift("🔄 反选");
      displayOptions.unshift("➕ 添加新词汇");
      displayOptions.push("──────────────");
      displayOptions.push("✅ 确认保存");
      
      const selectedArray = Array.from(selectedWords);
      const newWordsArray = newWordsInput ? this.parseWords(newWordsInput) : [];
      const totalWords = [...selectedArray, ...newWordsArray];
      
      const title = isTrigger ? `编辑触发词 - ${group.name}` : `编辑排除词 - ${group.name}`;
      const message = `已选中 ${selectedWords.size}/${currentWords.length} 个现有词汇\n` +
                     (newWordsInput ? `新增：${newWordsArray.join(", ")}\n` : "") +
                     `总计：${totalWords.length} 个词汇`;
      
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        title,
        message,
        0,
        "取消",
        displayOptions,
        (alert, buttonIndex) => {
          if (buttonIndex === 0) {
            // 用户取消
            return;
          }
          
          if (buttonIndex === 1) {
            // 添加新词汇
            const dialogTitle = isTrigger ? "添加新触发词" : "添加新排除词";
            this.showAddNewWordsDialogForExclusion(dialogTitle, (input) => {
              if (input) {
                newWordsInput = input;
              }
              showMultiSelectDialog();
            });
            
          } else if (buttonIndex === 2) {
            // 反选
            const newSelectedWords = new Set();
            currentWords.forEach(word => {
              if (!selectedWords.has(word)) {
                newSelectedWords.add(word);
              }
            });
            selectedWords.clear();
            newSelectedWords.forEach(word => selectedWords.add(word));
            showMultiSelectDialog();
            
          } else if (buttonIndex === 3) {
            // 全选/取消全选
            if (allSelected) {
              selectedWords.clear();
            } else {
              currentWords.forEach(word => selectedWords.add(word));
            }
            showMultiSelectDialog();
            
          } else if (buttonIndex === displayOptions.length) {
            // 确认保存
            const selectedArray = Array.from(selectedWords);
            const newWordsArray = newWordsInput ? this.parseWords(newWordsInput) : [];
            const finalWords = [...selectedArray, ...newWordsArray];
            
            if (finalWords.length > 0) {
              const updateField = isTrigger ? { triggerWords: finalWords } : { excludeWords: finalWords };
              this.updateExclusionGroup(group.id, updateField);
              const wordType = isTrigger ? "触发词" : "排除词";
              MNUtil.showHUD(`✅ 已更新${wordType}（${finalWords.length}个）`);
            } else {
              const wordType = isTrigger ? "触发词" : "排除词";
              MNUtil.showHUD(`❌ 至少需要一个${wordType}`);
              showMultiSelectDialog();
            }
            
          } else if (buttonIndex === displayOptions.length - 1) {
            // 分隔线，重新显示
            showMultiSelectDialog();
            
          } else {
            // 用户选择了某个词汇，切换选中状态
            const wordIndex = buttonIndex - 4; // 减去前面的控制选项
            const word = currentWords[wordIndex];
            
            if (selectedWords.has(word)) {
              selectedWords.delete(word);
            } else {
              selectedWords.add(word);
            }
            
            showMultiSelectDialog();
          }
        }
      );
    };
    
    showMultiSelectDialog();
  }

  /**
   * 显示添加新词汇的输入对话框（排除词组用）
   */
  static async showAddNewWordsDialogForExclusion(title, callback) {
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      title,
      "输入新词汇，支持以下分隔方式：\n• 逗号：word1, word2\n• 分号：词汇1; 词汇2\n• 双空格：词汇1  词汇2\n• 单空格：词1 词2（仅当无其他分隔符时）",
      2,
      "取消",
      ["确定"],
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          callback(null);
          return;
        }
        
        const input = alert.textFieldAtIndex(0).text;
        if (input && input.trim()) {
          callback(input);
        } else {
          callback(null);
        }
      }
    );
  }

  /**
   * 重命名排除词组
   */
  static async renameExclusionGroup(group) {
    return new Promise((resolve) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "重命名",
        `当前名称：${group.name}\n\n请输入新名称：`,
        2,
        "取消",
        ["确定"],
        (alert, buttonIndex) => {
          if (buttonIndex === 0) {
            resolve(false);
            return;
          }
          
          const newName = alert.textFieldAtIndex(0).text.trim();
          if (newName && newName !== group.name) {
            this.updateExclusionGroup(group.id, { name: newName });
            MNUtil.showHUD("✅ 已重命名");
            resolve(true);
          }
        }
      );
    });
  }

  /**
   * 导出排除词组配置
   */
  static async showExportExclusionDialog() {
    const options = [
      "☁️ 同步到 iCloud",
      "📋 复制到剪贴板",
      "📝 保存到当前笔记"
    ];
    
    const result = await MNUtil.userSelect(
      "导出排除词配置",
      "选择导出方式：",
      options
    );
    
    if (result === null || result === 0) return;
    
    try {
      const config = {
        version: "1.0",
        type: "exclusionGroups",
        exportDate: new Date().toISOString(),
        exclusionGroups: this.getExclusionGroups()
      };
      const jsonStr = JSON.stringify(config, null, 2);
      
      switch (result) {
        case 1: // iCloud
          MNUtil.setByiCloud("knowledgeBaseTemplate_ExclusionGroups_Config", jsonStr);
          MNUtil.showHUD("☁️ 已同步到 iCloud");
          break;
        case 2: // 剪贴板
          MNUtil.copy(jsonStr);
          MNUtil.showHUD("📋 已复制到剪贴板");
          break;
        case 3: // 当前笔记
          const focusNote = MNNote.getFocusNote();
          if (focusNote) {
            const formattedJson = this.formatJsonAsCodeBlock(jsonStr);
            focusNote.appendTextComment(formattedJson);
            MNUtil.showHUD("📝  已保存到当前笔记");
          } else {
            MNUtil.showHUD("❌ 未选中笔记");
          }
          break;
      }
    } catch (error) {
      MNUtil.showHUD("❌ 导出失败：" + error.message);
    }
  }

  /**
   * 导入排除词组配置
   */
  static async showImportExclusionDialog() {
    const options = [
      "☁️ 从 iCloud 同步",
      "📋 从剪贴板导入",
      "📝 从当前笔记导入"
    ];
    
    const result = await MNUtil.userSelect(
      "导入排除词配置",
      "选择导入来源：",
      options
    );
    
    if (result === null || result === 0) return;
    
    try {
      let jsonStr = null;
      
      switch (result) {
        case 1: // iCloud
          jsonStr = MNUtil.getByiCloud("knowledgeBaseTemplate_ExclusionGroups_Config", null);
          if (!jsonStr) {
            MNUtil.showHUD("❌ iCloud 中未找到排除词配置");
            return;
          }
          break;
        case 2: // 剪贴板
          jsonStr = MNUtil.clipboardText;
          break;
        case 3: // 当前笔记
          const focusNote = MNNote.getFocusNote();
          if (!focusNote) {
            MNUtil.showHUD("❌ 未选中笔记");
            return;
          }
          // 查找包含排除词配置的评论
          for (const comment of focusNote.comments) {
            if (comment.type === "textComment" && comment.text.includes('"exclusionGroups"')) {
              jsonStr = this.extractJsonFromCodeBlock(comment.text);
              break;
            }
          }
          if (!jsonStr) {
            MNUtil.showHUD("❌ 当前笔记中未找到排除词配置");
            return;
          }
          break;
      }
      
      const config = JSON.parse(jsonStr);
      if (!config.exclusionGroups) {
        throw new Error("无效的配置格式");
      }
      
      // 选择导入方式
      const importMode = await MNUtil.userSelect(
        "导入方式",
        `将导入 ${config.exclusionGroups.length} 个排除词组`,
        ["替换现有配置", "合并配置"]
      );
      
      if (importMode === null || importMode === 0) return;
      
      this.initSearchConfig();
      
      if (importMode === 1) {
        // 替换
        this.searchRootConfigs.exclusionGroups = config.exclusionGroups;
      } else {
        // 合并
        if (!this.searchRootConfigs.exclusionGroups) {
          this.searchRootConfigs.exclusionGroups = [];
        }
        const existingIds = new Set(this.searchRootConfigs.exclusionGroups.map(g => g.id));
        for (const group of config.exclusionGroups) {
          if (!existingIds.has(group.id)) {
            this.searchRootConfigs.exclusionGroups.push(group);
          }
        }
      }
      
      this.saveSearchConfig();
      MNUtil.showHUD(`✅ 已导入 ${config.exclusionGroups.length} 个排除词组`);
    } catch (error) {
      MNUtil.showHUD("❌ 导入失败：" + error.message);
    }
  }

  /**
   * 确认操作对话框
   */
  static async confirmAction(title, message) {
    return new Promise((resolve) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        title,
        message,
        0,
        "取消",
        ["确定"],
        (alert, buttonIndex) => {
          resolve(buttonIndex === 1);
        }
      );
    });
  }

  // ==================== 证明模板管理系统 ====================
  
  static proofTemplates = null;
  

  /**
   * 添加等价证明（集成模板系统和智能空格处理）
   * @param {MNNote} note - 目标笔记
   */
  static async addEquivalenceProof(note) {
    if (!note) {
      MNUtil.showHUD("请先选择一个笔记");
      return;
    }
    
    try {
      // 初始化模板配置
      this.initProofTemplates();
      
      const enabledTemplates = this.getEnabledProofTemplates();
      
      if (enabledTemplates.length === 0) {
        MNUtil.showHUD("❌ 没有可用的证明模板，请先创建模板");
        return;
      }
      
      // 选择模板
      const templateOptions = enabledTemplates.map(t => t.name);
      const selectedTemplateIndex = await MNUtil.userSelect(
        "选择证明模板",
        "请选择要使用的证明模板：",
        templateOptions
      );
      
      if (selectedTemplateIndex === 0) {
        MNUtil.showHUD("已取消");
        return;
      }
      
      const selectedTemplate = enabledTemplates[selectedTemplateIndex - 1];
      
      // 收集输入数据
      const inputs = {};
      
      // 检查模板是否需要命题A
      if (selectedTemplate.forwardTemplate && selectedTemplate.forwardTemplate.includes('{A}')) {
        const propositionA = await this.showInputDialog(
          "输入命题 A",
          "请输入第一个命题（例如：A是B的子集）",
          "下一步"
        );
        if (!propositionA) {
          MNUtil.showHUD("已取消");
          return;
        }
        inputs.A = propositionA;
      }
      
      // 检查模板是否需要命题B
      if ((selectedTemplate.forwardTemplate && selectedTemplate.forwardTemplate.includes('{B}')) ||
          (selectedTemplate.reverseTemplate && selectedTemplate.reverseTemplate.includes('{B}'))) {
        const propositionB = await this.showInputDialog(
          "输入命题 B", 
          "请输入第二个命题（例如：B包含A）",
          "确定"
        );
        if (!propositionB) {
          MNUtil.showHUD("已取消");
          return;
        }
        inputs.B = propositionB;
      }
      
      // 创建子卡片
      MNUtil.undoGrouping(() => {
        // 替换占位符，使用 Pangu.spacing 处理中英文间距
        const replacePlaceholders = (text) => {
          if (!text) return "";
          // 使用 Pangu.spacing 处理中英文间距
          const spacedA = inputs.A ? Pangu.spacing(inputs.A) : "";
          const spacedB = inputs.B ? Pangu.spacing(inputs.B) : "";
          return text.replace(/\{A\}/g, spacedA)
                     .replace(/\{B\}/g, spacedB);
        };
        
        // 正向证明子卡片
        if (selectedTemplate.forwardTemplate) {
          const forwardTitle = replacePlaceholders(selectedTemplate.forwardTemplate);
          const forwardNote = MNNote.new({ title: forwardTitle });
          if (forwardNote) {
            note.addChild(forwardNote);
          }
        }
        
        // 反向证明子卡片（仅等价证明类型）
        if (selectedTemplate.type === "equivalence" && selectedTemplate.reverseTemplate) {
          const reverseTitle = replacePlaceholders(selectedTemplate.reverseTemplate);
          const reverseNote = MNNote.new({ title: reverseTitle });
          if (reverseNote) {
            note.addChild(reverseNote);
          }
        }
        
        note.refresh();
      });
      
      MNUtil.showHUD(`✅ ${selectedTemplate.name}已添加`);
      
    } catch (error) {
      MNUtil.showHUD(`❌ 错误: ${error.message}`);
      MNUtil.addErrorLog(error, "addEquivalenceProof", {
        noteId: note?.noteId,
        noteTitle: note?.noteTitle
      });
    }
  }

  // ==================== 证明模板管理系统 ====================
  
  /**
   * 初始化证明模板配置
   */
  static initProofTemplates() {
    if (!this.proofTemplates) {
      this.proofTemplates = this.loadProofTemplates();
    }
    return this.proofTemplates;
  }

  /**
   * 从存储加载证明模板配置
   */
  static loadProofTemplates() {
    try {
      // 先尝试从本地加载
      const localConfig = NSUserDefaults.standardUserDefaults().objectForKey("knowledgeBaseTemplate_ProofTemplates");
      let config = localConfig ? JSON.parse(localConfig) : null;
      
      // 如果没有本地配置，从 iCloud 加载
      if (!config) {
        try {
          const cloudStore = NSUbiquitousKeyValueStore.defaultStore();
          if (cloudStore) {
            const cloudConfig = cloudStore.objectForKey("knowledgeBaseTemplate_ProofTemplates");
            if (cloudConfig) {
              config = JSON.parse(cloudConfig);
              // 同步到本地
              NSUserDefaults.standardUserDefaults().setObjectForKey(cloudConfig, "knowledgeBaseTemplate_ProofTemplates");
            }
          }
        } catch (cloudError) {
          // iCloud 不可用时忽略错误
        }
      }
      
      // 如果还是没有配置，返回默认配置
      if (!config) {
        config = this.getDefaultProofTemplates();
        this.saveProofTemplates(); // 保存默认配置
      }
      
      return config;
    } catch (error) {
      MNUtil.showHUD("加载证明模板失败，使用默认配置");
      return this.getDefaultProofTemplates();
    }
  }

  /**
   * 获取默认证明模板配置
   */
  static getDefaultProofTemplates() {
    return {
      templates: [
        {
          id: "template_equivalence_standard",
          name: "标准等价证明",
          type: "equivalence",
          forwardTemplate: "若 {A} 成立，则 {B} 成立",
          reverseTemplate: "若 {B} 成立，则 {A} 成立",
          enabled: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: "template_implication_standard",
          name: "标准蕴涵证明",
          type: "implication",
          forwardTemplate: "若 {A} 成立，则 {B} 成立",
          reverseTemplate: "",
          enabled: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ],
      lastModified: Date.now(),
      version: "1.0"
    };
  }

  /**
   * 保存证明模板配置
   */
  static saveProofTemplates() {
    try {
      if (!this.proofTemplates) {
        this.initProofTemplates();
      }
      
      this.proofTemplates.lastModified = Date.now();
      const configStr = JSON.stringify(this.proofTemplates);
      
      // 保存到本地
      NSUserDefaults.standardUserDefaults().setObjectForKey(configStr, "knowledgeBaseTemplate_ProofTemplates");
      
      // 如果开启了 iCloud 同步，保存到 iCloud
      try {
        if (typeof toolbarConfig !== 'undefined' && toolbarConfig.iCloudSync) {
          const cloudStore = NSUbiquitousKeyValueStore.defaultStore();
          if (cloudStore) {
            cloudStore.setObjectForKey(configStr, "knowledgeBaseTemplate_ProofTemplates");
            cloudStore.synchronize();
          }
        }
      } catch (cloudError) {
        // iCloud 同步失败不影响本地保存
      }
      
      return true;
    } catch (error) {
      MNUtil.showHUD("保存证明模板失败: " + error.message);
      return false;
    }
  }

  /**
   * 获取所有证明模板
   */
  static getProofTemplates() {
    this.initProofTemplates();
    return this.proofTemplates.templates || [];
  }
  
  /**
   * 获取所有启用的证明模板
   */
  static getEnabledProofTemplates() {
    const allTemplates = this.getProofTemplates();
    return allTemplates.filter(template => template.enabled);
  }
  
  /**
   * 显示输入对话框
   * @param {string} title - 对话框标题
   * @param {string} message - 对话框消息
   * @param {string} confirmText - 确认按钮文本
   * @returns {Promise<string|null>} 输入文本或null（如果取消）
   */
  static async showInputDialog(title, message, confirmText) {
    return new Promise((resolve) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        title,
        message,
        2, // 输入框样式
        "取消",
        [confirmText],
        (alert, buttonIndex) => {
          if (buttonIndex === 1) {
            const text = alert.textFieldAtIndex(0).text;
            resolve(text);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  // ==================== 证明模板管理界面 ====================
  
  /**
   * 证明模板管理主界面
   */
  static async manageProofTemplates() {
    try {
      this.initProofTemplates();
      
      while (true) {
        const templates = this.getProofTemplates();
        const templateList = templates.map(t => 
          `${t.enabled ? '✅' : '❌'} ${t.name} (${t.type})`
        );
        
        const options = [
          "📝 添加新模板",
          "📋 编辑模板",
          "🗑️ 删除模板",
          "🔄 启用/禁用模板",
          "📥 导入模板",
          "📤 导出模板",
          "🔧 重置为默认",
          "❌ 关闭"
        ];
        
        let message = `当前模板 (${templates.length} 个):\n`;
        templateList.forEach((item, index) => {
          message += `${index + 1}. ${item}\n`;
        });
        
        const choice = await MNUtil.userSelect(
          "证明模板管理",
          message,
          options
        );
        
        if (choice === 0 || choice === 8) break; // 取消或关闭
        
        switch (choice) {
          case 1: // 添加新模板
            await this.addNewTemplate();
            break;
          case 2: // 编辑模板
            await this.editTemplateBySelection();
            break;
          case 3: // 删除模板
            await this.deleteTemplateBySelection();
            break;
          case 4: // 启用/禁用模板
            await this.toggleTemplateBySelection();
            break;
          case 5: // 导入模板
            MNUtil.showHUD("导入功能开发中...");
            break;
          case 6: // 导出模板
            MNUtil.showHUD("导出功能开发中...");
            break;
          case 7: // 重置为默认
            await this.resetToDefaultTemplates();
            break;
        }
      }
      
    } catch (error) {
      MNUtil.showHUD(`❌ 管理模板时出错: ${error.message}`);
      MNUtil.addErrorLog(error, "manageProofTemplates");
    }
  }
  
  /**
   * 添加新模板
   */
  static async addNewTemplate() {
    try {
      const name = await this.showInputDialog(
        "模板名称",
        "请输入模板名称（例如：充分必要条件证明）",
        "下一步"
      );
      if (!name) return;
      
      const typeOptions = ["等价证明", "蕴涵证明", "自定义证明"];
      const typeChoice = await MNUtil.userSelect(
        "选择模板类型",
        "请选择证明模板的类型：",
        typeOptions
      );
      if (typeChoice === 0) return;
      
      const typeMap = { 1: "equivalence", 2: "implication", 3: "custom" };
      const type = typeMap[typeChoice];
      
      const forwardTemplate = await this.showInputDialog(
        "正向证明模板",
        "请输入正向证明模板（用 {A} 和 {B} 作为占位符）",
        "下一步"
      );
      if (!forwardTemplate) return;
      
      let reverseTemplate = "";
      if (type === "equivalence") {
        reverseTemplate = await this.showInputDialog(
          "反向证明模板",
          "请输入反向证明模板（用 {A} 和 {B} 作为占位符）",
          "完成"
        );
        if (reverseTemplate === null) return;
      }
      
      const newTemplate = {
        id: "template_" + Date.now(),
        name: name,
        type: type,
        forwardTemplate: forwardTemplate,
        reverseTemplate: reverseTemplate,
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      this.proofTemplates.templates.push(newTemplate);
      this.saveProofTemplates();
      
      MNUtil.showHUD(`✅ 模板"${name}"已添加`);
      
    } catch (error) {
      MNUtil.showHUD(`❌ 添加模板失败: ${error.message}`);
    }
  }
  
  /**
   * 通过选择编辑模板
   */
  static async editTemplateBySelection() {
    try {
      const templates = this.getProofTemplates();
      if (templates.length === 0) {
        MNUtil.showHUD("❌ 没有可编辑的模板");
        return;
      }
      
      const templateOptions = templates.map(t => t.name);
      const choice = await MNUtil.userSelect(
        "选择要编辑的模板",
        "请选择要编辑的模板：",
        templateOptions
      );
      
      if (choice === 0) return;
      
      const template = templates[choice - 1];
      await this.editTemplate(template);
      
    } catch (error) {
      MNUtil.showHUD(`❌ 编辑模板失败: ${error.message}`);
    }
  }
  
  /**
   * 编辑单个模板
   */
  static async editTemplate(template) {
    try {
      const editOptions = [
        "📝 编辑名称",
        "🔄 编辑类型",
        "➡️ 编辑正向模板",
        "⬅️ 编辑反向模板",
        "✅ 完成编辑"
      ];
      
      while (true) {
        let info = `当前模板信息:\n`;
        info += `名称: ${template.name}\n`;
        info += `类型: ${template.type}\n`;
        info += `正向: ${template.forwardTemplate}\n`;
        info += `反向: ${template.reverseTemplate || '(无)'}\n`;
        
        const choice = await MNUtil.userSelect(
          `编辑模板: ${template.name}`,
          info,
          editOptions
        );
        
        if (choice === 0 || choice === 5) break;
        
        switch (choice) {
          case 1: // 编辑名称
            const newName = await this.showInputDialog(
              "编辑名称",
              `当前名称: ${template.name}`,
              "确定"
            );
            if (newName) template.name = newName;
            break;
            
          case 2: // 编辑类型
            const typeOptions = ["等价证明", "蕴涵证明", "自定义证明"];
            const typeChoice = await MNUtil.userSelect("选择类型", "请选择新的类型：", typeOptions);
            if (typeChoice > 0) {
              const typeMap = { 1: "equivalence", 2: "implication", 3: "custom" };
              template.type = typeMap[typeChoice];
            }
            break;
            
          case 3: // 编辑正向模板
            const newForward = await this.showInputDialog(
              "编辑正向模板",
              `当前: ${template.forwardTemplate}`,
              "确定"
            );
            if (newForward) template.forwardTemplate = newForward;
            break;
            
          case 4: // 编辑反向模板
            const newReverse = await this.showInputDialog(
              "编辑反向模板",
              `当前: ${template.reverseTemplate || '(无)'}`,
              "确定"
            );
            if (newReverse !== null) template.reverseTemplate = newReverse;
            break;
        }
        
        template.updatedAt = Date.now();
      }
      
      this.saveProofTemplates();
      MNUtil.showHUD(`✅ 模板"${template.name}"已更新`);
      
    } catch (error) {
      MNUtil.showHUD(`❌ 编辑模板失败: ${error.message}`);
    }
  }
  
  /**
   * 通过选择删除模板
   */
  static async deleteTemplateBySelection() {
    try {
      const templates = this.getProofTemplates();
      if (templates.length === 0) {
        MNUtil.showHUD("❌ 没有可删除的模板");
        return;
      }
      
      const templateOptions = templates.map(t => t.name);
      const choice = await MNUtil.userSelect(
        "选择要删除的模板",
        "请选择要删除的模板：",
        templateOptions
      );
      
      if (choice === 0) return;
      
      const template = templates[choice - 1];
      const confirmed = await MNUtil.confirm(
        "确认删除",
        `确定要删除模板"${template.name}"吗？此操作不可撤销。`
      );
      
      if (confirmed) {
        this.proofTemplates.templates = templates.filter(t => t.id !== template.id);
        this.saveProofTemplates();
        MNUtil.showHUD(`✅ 模板"${template.name}"已删除`);
      }
      
    } catch (error) {
      MNUtil.showHUD(`❌ 删除模板失败: ${error.message}`);
    }
  }
  
  /**
   * 通过选择切换模板启用状态
   */
  static async toggleTemplateBySelection() {
    try {
      const templates = this.getProofTemplates();
      if (templates.length === 0) {
        MNUtil.showHUD("❌ 没有可操作的模板");
        return;
      }
      
      const templateOptions = templates.map(t => 
        `${t.enabled ? '✅' : '❌'} ${t.name}`
      );
      const choice = await MNUtil.userSelect(
        "启用/禁用模板",
        "请选择要切换状态的模板：",
        templateOptions
      );
      
      if (choice === 0) return;
      
      const template = templates[choice - 1];
      template.enabled = !template.enabled;
      template.updatedAt = Date.now();
      
      this.saveProofTemplates();
      MNUtil.showHUD(`✅ 模板"${template.name}"已${template.enabled ? '启用' : '禁用'}`);
      
    } catch (error) {
      MNUtil.showHUD(`❌ 切换模板状态失败: ${error.message}`);
    }
  }
  
  /**
   * 重置为默认模板
   */
  static async resetToDefaultTemplates() {
    try {
      const confirmed = await MNUtil.confirm(
        "重置确认",
        "确定要重置为默认模板吗？这将删除所有自定义模板。"
      );
      
      if (confirmed) {
        this.proofTemplates = this.getDefaultProofTemplates();
        this.saveProofTemplates();
        MNUtil.showHUD("✅ 已重置为默认模板");
      }
      
    } catch (error) {
      MNUtil.showHUD(`❌ 重置模板失败: ${error.message}`);
    }
  }

  /**
   * 卡片的预处理
   */
  static preprocessNote(note) {
    if (this.isOldTemplateCard(note)) {
      // MNUtil.showHUD("旧卡片")
      let newNote = this.renewNote(note)
      this.changeTitle(newNote)
      this.changeNoteColor(newNote)
      return newNote
    } else {
      if (this.ifTemplateMerged(note)) {
        // MNUtil.showHUD("模板！")
        this.renewNote(note)
        this.changeTitle(note)
        this.changeNoteColor(note)
        this.linkParentNote(note)
        this.autoMoveNewContent(note) // 自动移动新内容到对应字段
        return note
      } else {
        // MNUtil.showHUD("不是模板")
        this.changeTitle(note)
        this.changeNoteColor(note)
        note.convertLinksToNewVersion()
        note.cleanupBrokenLinks()
        note.fixMergeProblematicLinks()
        return this.toNoExcerptVersion(note)
      }
    }
  }


  /**
   * 选中卡片的旧子孙卡片批量制卡
   * 
   * 1. 只处理已经制过卡的卡片
   */
  static oldChildrenMakeNotes(note) {
    let childDescendants = note.descendantNodes.descendant
    if (childDescendants.length>0) {
      MNUtil.undoGrouping(()=>{
        try {
          childDescendants.forEach(
            descendant => {
              if (this.isOldTemplateCard(descendant)) {
                // 旧卡片
                this.processOldTemplateCard(descendant)
                this.changeTitle(descendant)
              } else {
                // 非旧卡片
                this.renewNote(descendant)
                this.changeTitle(descendant)
                this.linkParentNote(descendant)
              }
            }
          )
        } catch (error) {
          MNUtil.showHUD(error);
          MNLog.error(error, "knowledgeBaseTemplate: oldChildrenMakeNotes");
        }
      })
    }
  }
}

/**
 * 知识库索引器 - 用于构建和管理搜索索引
 */
class KnowledgeBaseIndexer {
  /**
   * 构建搜索索引
   * @param {Array<string>|MNNote} rootNotes - 根卡片
   * @param {Array<string>} targetTypes - 目标卡片类型数组，如 ["定义", "命题", "归类"]
   * @returns {Object} 包含metadata和searchData的索引对象
   */
  static buildSearchIndex(rootNotes, targetTypes = ["定义", "命题", "例子", "反例", "归类", "思想方法", "问题"]) {
    const index = {
      metadata: {
        version: "1.0",
        lastUpdated: new Date().toISOString(),
        totalCards: 0,
        targetTypes: targetTypes
      },
      searchData: []
    };
    
    try {
      // 使用 Map 进行去重
      const processedIds = new Map();
      
      // 先收集所有需要处理的卡片
      let allNotes = [];
      rootNotes.forEach(_rootNote => {
        const rootNote = MNNote.new(_rootNote);
        if (!rootNote) return;
        
        // 获取所有子孙卡片
        const descendants = rootNote.descendantNodes.descendant;
        descendants.push(rootNote); // 包含根卡片本身
        allNotes = allNotes.concat(descendants);
      });
      
      // 进度跟踪变量
      let processedCount = 0;
      let validCount = 0;
      let lastUpdateTime = Date.now();
      const updateInterval = 10; // 每处理10个卡片更新一次
      const timeInterval = 200; // 或每200ms更新一次
      const totalCount = allNotes.length;
      
      // 显示初始进度
      MNUtil.showHUD(`正在构建索引 0/${totalCount}`);
      
      // 处理所有卡片
      allNotes.forEach((note, index) => {
        // 去重检查
        const noteId = note.noteId;
        if (processedIds.has(noteId)) {
          processedCount++;
          return; // 跳过已处理的卡片
        }
        processedIds.set(noteId, true);
        
        const noteType = knowledgeBaseTemplate.getNoteType(note);
        if (!noteType) {
          processedCount++;
          return;
        } else {
          if (!targetTypes.includes(noteType)) {
            processedCount++;
            return;
          }
        }
        
        // 构建索引条目
        const entry = this.buildIndexEntry(note);
        if (entry) {
          index.searchData.push(entry);
          validCount++;
        }
        
        processedCount++;
        
        // 定期更新进度
        if (processedCount % updateInterval === 0 || 
            Date.now() - lastUpdateTime > timeInterval ||
            processedCount === totalCount) {
          MNUtil.showHUD(`正在构建索引 ${processedCount}/${totalCount} (有效: ${validCount})`);
          lastUpdateTime = Date.now();
        }
      });
      
      index.metadata.totalCards = index.searchData.length;
      MNUtil.showHUD(`索引构建完成：${index.metadata.totalCards} 张卡片`);
      
    } catch (error) {
      MNUtil.showHUD("构建索引失败: " + error.message);
      MNLog.error(error, "KnowledgeBaseIndexer: buildSearchIndex");
    }
    
    return index;
  }
  
  /**
   * 构建单个卡片的索引条目
   * @private
   */
  static buildIndexEntry(note) {
    try {
      const parsedTitle = knowledgeBaseTemplate.parseNoteTitle(note);
      const noteType = knowledgeBaseTemplate.getNoteType(note);
      const keywordsContent = knowledgeBaseTemplate.getKeywordsFromNote(note) || "";
      
      let entry = {
        id: note.noteId,
        type: noteType,
        title: note.title || "",
        // 添加 parentId 字段
        parentId: note.parentNote ? note.parentNote.noteId : null
      };
      
      // 根据卡片类型设置不同字段
      if (noteType === "归类") {
        entry.classificationSubtype = parsedTitle.type || "";
        entry.content = parsedTitle.content || "";
      } else {
        if (parsedTitle.prefixContent) {
          entry.prefix = parsedTitle.prefixContent;
        }
        if (parsedTitle.titleLinkWordsArr && parsedTitle.titleLinkWordsArr.length > 0) {
          entry.titleLinkWords = parsedTitle.titleLinkWordsArr.join("; ");
        }
      }
      
      // 添加关键词
      if (keywordsContent) {
        entry.keywords = keywordsContent;
      }
      
      // 构建搜索文本
      entry.searchText = this.buildSearchText(note, parsedTitle, noteType, keywordsContent);
      
      return entry;
      
    } catch (error) {
      MNLog.error(error, `KnowledgeBaseIndexer: buildIndexEntry for note ${note.noteId}`);
      return null;
    }
  }
  
  /**
   * 构建搜索文本
   * @private
   */
  static buildSearchText(note, parsedTitle, noteType, keywordsContent) {
    let searchableContent = "";
    
    if (noteType === "归类") {
      // 归类卡片：使用content（引号内的内容）+ 类型
      searchableContent = `${parsedTitle.content || ""} ${parsedTitle.type || ""}`.trim();
    } else {
      // 其他卡片类型（定义、命题等）：包含前缀内容和标题链接词
      let contentParts = [];
      
      // 重要：添加前缀内容（这是定义卡片的主要内容）
      if (parsedTitle.prefixContent) {
        contentParts.push(parsedTitle.prefixContent);
      }
      
      // 添加标题链接词
      if (parsedTitle.titleLinkWordsArr && parsedTitle.titleLinkWordsArr.length > 0) {
        contentParts.push(...parsedTitle.titleLinkWordsArr);
      }
      
      // 如果都没有，使用 content
      if (contentParts.length === 0 && parsedTitle.content) {
        contentParts.push(parsedTitle.content);
      }
      
      searchableContent = contentParts.join(" ");
    }
    
    // 处理关键词
    const keywordsForSearch = keywordsContent.replace(/[;；]/g, " ");
    
    // 组合并转小写，提高搜索效率
    const finalText = `${searchableContent} ${keywordsForSearch}`.trim().toLowerCase();
    
    return finalText;
  }
  
  /**
   * 保存索引到文件
   */
  static saveIndex(index, filename = "kb-search-index.json") {
    try {
      const filepath = MNUtil.dbFolder + "/data/" + filename;
      MNUtil.writeJSON(filepath, index);
      MNUtil.showHUD(`索引已保存到 ${filename}`);
      return filepath;
    } catch (error) {
      MNUtil.showHUD("保存索引失败: " + error.message);
      MNLog.error(error, "KnowledgeBaseIndexer: saveIndex");
      return null;
    }
  }
  
  /**
   * 加载索引
   */
  static loadIndex(filename = "kb-search-index.json") {
    try {
      const filepath = MNUtil.dbFolder + "/data/" + filename;
      return MNUtil.readJSON(filepath);
    } catch (error) {
      MNLog.error(error, "KnowledgeBaseIndexer: loadIndex");
      return null;
    }
  }
}

/**
 * 快速搜索器 - 基于索引的快速搜索
 */
class FastSearcher {
  constructor(index) {
    this.index = index;
  }
  
  /**
   * 从文件加载索引并创建搜索器
   */
  static loadFromFile(filename = "kb-search-index.json") {
    const index = KnowledgeBaseIndexer.loadIndex(filename);
    if (index) {
      return new FastSearcher(index);
    }
    return null;
  }
  
  /**
   * 解析搜索查询语法
   * @param {string} query - 用户输入的查询字符串
   * @returns {Object} 解析后的查询结构
   */
  static parseSearchQuery(query) {
    const result = {
      andGroups: [],    // AND 条件组
      orGroups: [],     // OR 条件组  
      excludeTerms: [], // 排除词
      exactPhrases: []  // 精确短语
    };
    
    // 1. 先提取精确匹配短语 [[xxx]]
    const exactMatches = query.match(/\[\[([^\]]+)\]\]/g) || [];
    exactMatches.forEach(match => {
      const phrase = match.replace(/\[\[|\]\]/g, '');
      result.exactPhrases.push(phrase.toLowerCase());
      // 从原查询中移除，避免重复处理
      query = query.replace(match, ' ');
    });
    
    // 2. 处理排除词 !!xxx
    const excludeMatches = query.match(/!![^\s]+/g) || [];
    excludeMatches.forEach(match => {
      result.excludeTerms.push(match.substring(2).toLowerCase());
      query = query.replace(match, ' ');
    });
    
    // 3. 处理 OR 运算 ;;
    if (query.includes(';;')) {
      result.orGroups = query.split(';;').map(s => s.trim().toLowerCase()).filter(s => s);
      return result; // OR 运算优先级最低，有 OR 就不处理 AND
    }
    
    // 4. 处理 AND 运算 //（默认）
    if (query.includes('//')) {
      result.andGroups = query.split('//').map(s => s.trim().toLowerCase()).filter(s => s);
    } else {
      // 没有 // 时，整个查询作为一个 AND 组
      const trimmed = query.trim().toLowerCase();
      if (trimmed) {
        result.andGroups = [trimmed];
      }
    }
    
    return result;
  }
  
  /**
   * 判断文本是否匹配查询条件
   * @param {string} searchText - 要搜索的文本
   * @param {Object} parsedQuery - 解析后的查询对象
   * @returns {boolean} 是否匹配
   */
  static matchesQuery(searchText, parsedQuery) {
    const text = searchText.toLowerCase();
    
    // 1. 检查排除词
    for (const excludeTerm of parsedQuery.excludeTerms) {
      if (text.includes(excludeTerm)) {
        return false; // 包含排除词，不匹配
      }
    }
    
    // 2. 检查精确短语
    for (const phrase of parsedQuery.exactPhrases) {
      if (!text.includes(phrase)) {
        return false; // 缺少必需的精确短语
      }
    }
    
    // 3. 检查 OR 条件
    if (parsedQuery.orGroups.length > 0) {
      return parsedQuery.orGroups.some(term => text.includes(term));
    }
    
    // 4. 检查 AND 条件（默认）
    if (parsedQuery.andGroups.length > 0) {
      return parsedQuery.andGroups.every(group => {
        // 每个组内的词作为整体匹配
        return text.includes(group);
      });
    }
    
    return parsedQuery.exactPhrases.length > 0; // 只有精确短语时，已经在步骤2检查过
  }
  
  /**
   * 在索引中搜索
   * @param {string} keyword - 搜索关键词
   * @param {Object} options - 搜索选项
   * @param {Array<string>} options.types - 限定卡片类型
   * @param {Array<string>} options.classificationSubtypes - 限定归类卡片的细分类型
   * @param {number} options.limit - 结果数量限制
   * @returns {Array} 搜索结果数组
   */
  search(keyword, options = {}) {
    if (!this.index || !this.index.searchData) {
      MNUtil.showHUD("索引未加载");
      return [];
    }
    
    const { types, classificationSubtypes, limit = 100 } = options;
    let results = [];
    
    try {
      // 解析搜索查询
      const parsedQuery = FastSearcher.parseSearchQuery(keyword);
      
      // 如果解析后没有任何有效条件，返回空
      if (parsedQuery.andGroups.length === 0 && 
          parsedQuery.orGroups.length === 0 && 
          parsedQuery.exactPhrases.length === 0) {
        return [];
      }
      
      // 遍历索引进行搜索
      for (let entry of this.index.searchData) {
        // 类型过滤
        if (types && types.length > 0 && !types.includes(entry.type)) {
          continue;
        }
        
        // 归类细分类型过滤
        if (classificationSubtypes && classificationSubtypes.length > 0) {
          if (entry.type === "归类" && !classificationSubtypes.includes(entry.classificationSubtype)) {
            continue;
          }
        }
        
        // 使用新的匹配逻辑
        if (entry.searchText && FastSearcher.matchesQuery(entry.searchText, parsedQuery)) {
          // 为了评分，需要传递完整的 entry 对象
          const score = this.calculateScoreWithParsedQuery(parsedQuery, entry);
          
          results.push({
            id: entry.id,
            type: entry.type,
            classificationSubtype: entry.classificationSubtype,
            title: entry.title,
            parentId: entry.parentId,  // 包含父ID
            prefix: entry.prefix,       // 包含前缀（用作路径显示）
            content: entry.content,     // 归类卡片的内容
            titleLinkWords: entry.titleLinkWords, // 用于评分
            keywords: entry.keywords,   // 用于评分
            score: score
          });
          
          if (results.length >= limit) {
            break;
          }
        }
      }
      
      // 按相关性排序
      results.sort((a, b) => b.score - a.score);
      
    } catch (error) {
      MNUtil.showHUD("搜索失败: " + error.message);
      MNLog.error(error, "FastSearcher: search");
    }
    
    return results;
  }
  
  /**
   * 计算匹配分数（旧版本，保留兼容性）
   * @private
   */
  calculateScore(keyword, entry) {
    let score = 0;
    const keywordLower = keyword.toLowerCase();
    const searchTextLower = entry.searchText.toLowerCase();
    
    // 完全匹配得分最高
    if (searchTextLower === keywordLower) {
      score += 100;
    }
    
    // 在标题链接词中匹配
    if (entry.titleLinkWords && entry.titleLinkWords.toLowerCase().includes(keywordLower)) {
      score += 50;
    }
    
    // 在关键词字段中匹配
    if (entry.keywords && entry.keywords.toLowerCase().includes(keywordLower)) {
      score += 30;
    }
    
    // 在前缀内容中匹配
    if (entry.prefix && entry.prefix.toLowerCase().includes(keywordLower)) {
      score += 20;
    }
    
    // 基础匹配分
    score += 10;
    
    return score;
  }
  
  /**
   * 使用解析后的查询计算匹配分数
   * @param {Object} parsedQuery - 解析后的查询对象
   * @param {Object} entry - 索引条目
   * @returns {number} 匹配分数
   */
  calculateScoreWithParsedQuery(parsedQuery, entry) {
    let score = 0;
    
    // 1. 精确短语匹配得分最高（每个短语100分）
    parsedQuery.exactPhrases.forEach(phrase => {
      if (entry.searchText && entry.searchText.includes(phrase)) {
        score += 100;
      }
      // 额外加分：如果精确短语出现在标题链接词中
      if (entry.titleLinkWords && entry.titleLinkWords.toLowerCase().includes(phrase)) {
        score += 50;
      }
    });
    
    // 2. AND 组匹配（每个词独立评分）
    parsedQuery.andGroups.forEach(group => {
      const groupLower = group.toLowerCase();
      
      // 在标题链接词中匹配
      if (entry.titleLinkWords && entry.titleLinkWords.toLowerCase().includes(groupLower)) {
        score += 50;
      }
      
      // 在前缀内容中匹配
      if (entry.prefix && entry.prefix.toLowerCase().includes(groupLower)) {
        score += 30;
      }
      
      // 在关键词字段中匹配
      if (entry.keywords && entry.keywords.toLowerCase().includes(groupLower)) {
        score += 20;
      }
      
      // 基础匹配分
      if (entry.searchText && entry.searchText.includes(groupLower)) {
        score += 10;
      }
    });
    
    // 3. OR 组匹配（匹配的越多分数越高）
    if (parsedQuery.orGroups.length > 0) {
      const matchedOrTerms = parsedQuery.orGroups.filter(term => 
        entry.searchText && entry.searchText.includes(term)
      );
      score += matchedOrTerms.length * 25; // 每个匹配的 OR 词加 25 分
    }
    
    // 4. 排除词惩罚（理论上不应该到这里，因为已经被过滤了）
    // 这里不需要处理，matchesQuery 已经过滤了
    
    // 5. 额外加分：如果多个条件都满足
    const totalConditions = parsedQuery.exactPhrases.length + 
                          parsedQuery.andGroups.length + 
                          parsedQuery.orGroups.length;
    if (totalConditions > 1) {
      score += totalConditions * 5; // 多条件奖励
    }
    
    return score;
  }
  
  /**
   * 获取搜索结果的详细信息
   * @param {Array} searchResults - search方法返回的结果
   * @returns {Array<MNNote>} 卡片对象数组
   */
  getDetailedResults(searchResults) {
    const notes = [];
    
    searchResults.forEach(result => {
      const note = MNNote.getNoteById(result.id, false);
      if (note) {
        // 附加搜索相关信息
        note._searchScore = result.score;
        note._searchType = result.type;
        notes.push(note);
      }
    });
    
    return notes;
  }
}
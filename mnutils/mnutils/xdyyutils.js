/**
 * 夏大鱼羊 - Begin
 */

/**
 * 夏大鱼羊 - MNUtil 扩展 - begin
 */

/**
 * 判断是否为对象（getLinkCommentsIndexArr 依赖）
 * @param {Object} obj 
 * @returns {Boolean}
 */
MNUtil.isObj = function(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj)
}

/**
 * 判断评论是否是链接（getLinkCommentsIndexArr 依赖）
 * @param {Object|string} comment - 评论对象或字符串
 * @returns {Boolean}
 */
MNUtil.isCommentLink = function(comment){
  if (this.isObj(comment)) {
    if (comment.type == "TextNote") {
      return comment.text.isLink()
    }
  } else if (typeof comment == "string") {
    return comment.isLink()
  }
}

/**
 * 获取链接的文本（getLinkCommentsIndexArr 依赖）
 * @param {Object|string} link - 链接对象或字符串
 * @returns {string} 链接文本
 */
MNUtil.getLinkText = function(link){
  if (this.isObj(link) && this.isCommentLink(link)) {
    return link.text
  }
  return link
}

/**
 * 更新卡片中所有 markdownComment 里的指定 URL
 * 用于 mergeInto 时更新行内链接
 * @param {MNNote} note - 要更新的卡片
 * @param {string} oldURL - 旧的卡片 URL
 * @param {string} newURL - 新的卡片 URL
 */
MNUtil.updateMarkdownLinksInNote = function(note, oldURL, newURL) {
  if (!note || !oldURL || !newURL) return;

  MNUtil.log(`📝 updateMarkdownLinksInNote 被调用`);
  MNUtil.log(`  oldURL: ${oldURL}`);
  MNUtil.log(`  newURL: ${newURL}`);
  MNUtil.log(`  处理卡片: ${note.noteTitle || "无标题"} | ID: ${note.noteId}`);

  // 新增：记录所有 markdownComment 的内容
  MNUtil.log(`  该卡片的所有 markdownComment:`);
  let hasMarkdown = false;
  note.MNComments.forEach((comment, index) => {
    if (comment.type === "markdownComment") {
      hasMarkdown = true;
      MNUtil.log(`    [${index}] type=${comment.type}, 内容: ${comment.text}`);
    }
  });

  if (!hasMarkdown) {
    MNUtil.log(`    (没有找到 markdownComment 类型的评论)`);
  }

  // 原有的查找和替换逻辑
  let updated = false;
  note.MNComments.forEach((comment, index) => {
    if (comment.type === "markdownComment") {
      let text = comment.text;
      // 检查是否包含目标 URL
      if (text.includes(oldURL)) {
        MNUtil.log(`  [${index}] 找到包含旧URL的评论:`);
        MNUtil.log(`    原文: ${text.substring(0, 150)}${text.length > 150 ? '...' : ''}`);
        // 全局替换所有出现的旧 URL (使用 split().join() 避免正则特殊字符问题)
        let newText = text.split(oldURL).join(newURL);
        MNUtil.log(`    替换后: ${newText.substring(0, 150)}${newText.length > 150 ? '...' : ''}`);
        comment.text = newText;  // 使用 setter 自动调用 replaceWithMarkdownComment
        updated = true;
      }
    }
  });

  if (!updated) {
    MNUtil.log(`  ⚠️ 未找到包含 oldURL 的 markdownComment`);
  }
};

/**
 * 夏大鱼羊 MNNote 扩展 - Begin
 */
MNNote.prototype.getIncludingHtmlCommentIndex = function(htmlComment){
  const comments = this.note.comments
  for (let i = 0; i < comments.length; i++) {
    const _comment = comments[i]
    if (
      typeof htmlComment == "string" &&
      _comment.type == "HtmlNote" &&
      _comment.text.includes(htmlComment)
    ) {
      return i
    }
  }
  return -1
}
// 目前的子孙卡片会到主脑图去，特此打补丁修复一下
MNNote.prototype.delete = function(withDescendant = false){
  if (withDescendant) {
    MNUtil.db.deleteBookNoteTree(this.note.noteId)
  } else {
    if (this.childNotes && this.childNotes.length > 0 && this.parentNote) {
      this.childNotes.forEach(childNote => {
        this.parentNote.addChild(childNote)
      })
    }
    MNUtil.db.deleteBookNote(this.note.noteId)
  }
}
/**
 * 将旧版本的 marginnote3app:// 链接转换为 marginnote4app:// 链接
 * 
 */
MNNote.prototype.convertLinksToNewVersion = function() {
  for (let i = this.comments.length - 1; i >= 0; i--) {
    let comment = this.comments[i]
    if (
      comment.type === "TextNote" &&
      comment.text.startsWith("marginnote3app://note/")
    ) {
      let targetNoteId = comment.text.match(/marginnote3app:\/\/note\/(.*)/)[1]
      let targetNote = MNNote.new(targetNoteId, false) // 不弹出警告
      if (targetNote) {
        this.removeCommentByIndex(i)
        this.appendNoteLink(targetNote, "To")
        this.moveComment(this.comments.length - 1, i)
      } else {
        this.removeCommentByIndex(i)
      }
    }
  }
}

/**
 * 清理失效的链接（目标卡片不存在的链接）
 */
MNNote.prototype.cleanupBrokenLinks = function() {
  for (let i = this.comments.length - 1; i >= 0; i--) {
    let comment = this.comments[i]
    if (
      comment &&
      comment.type === "TextNote" &&
      (
        comment.text.startsWith("marginnote3app://note/") ||
        comment.text.startsWith("marginnote4app://note/")
      )
    ) {
      let targetNoteId = comment.text.match(/marginnote[34]app:\/\/note\/(.*)/)[1]
      if (!targetNoteId.includes("/summary/")) {  // 防止把概要的链接删掉了
        let targetNote = MNNote.new(targetNoteId, false) // 不弹出警告
        if (!targetNote) {
          this.removeCommentByIndex(i)
        }
      }
    }
  }
}

/**
 * 修复合并造成的链接问题
 * 当卡片被合并后，链接可能指向旧的 noteId，需要更新为 groupNoteId
 */
MNNote.prototype.fixMergeProblematicLinks = function() {
  let comments = this.MNComments
  comments.forEach((comment) => {
    if (comment && comment.type === "linkComment") {
      let targetNote = MNNote.new(comment.text, false) // 不弹出警告
      if (targetNote && targetNote.groupNoteId) {
        if (targetNote.groupNoteId !== comment.text) {
          // 更新链接为正确的 groupNoteId
          comment.text = `marginnote${MNUtil.isMN4() ? '4' : '3'}app://note/${targetNote.groupNoteId}`
        }
      }
    }
  })
}
/**
 * 合并到目标卡片并更新链接
 * 1. 更新新卡片里的链接（否则会丢失蓝色箭头）
 * 2. 双向链接对应的卡片里的链接要更新，否则合并后会消失
 * 
 * 不足
 * - this 出发的单向链接无法处理
 * 
 * 注意：和 MN 自己的合并不同，this 的标题会处理为评论，而不是添加到 targetNote 的标题
 */
MNNote.prototype.mergeInto = function(targetNote, htmlType = "none"){
  MNUtil.log("=".repeat(30));
  MNUtil.log("🔄 执行 mergeInto");
  MNUtil.log(`📍 源卡片: ${this.noteTitle || "无标题"} | ID: ${this.noteId} | URL: ${this.noteURL}`);
  MNUtil.log(`📍 目标卡片: ${targetNote.noteTitle || "无标题"} | ID: ${targetNote.noteId} | URL: ${targetNote.noteURL}`);

  // 合并之前先更新链接
  this.convertLinksToNewVersion()
  this.cleanupBrokenLinks()
  this.fixMergeProblematicLinks()

  // 记录所有已处理的卡片，避免重复处理
  let processedNoteIds = new Set();
  let oldComments = this.MNComments

  // 记录源卡片的链接情况
  MNUtil.log("🔗 处理源卡片的 linkComment:");

  // 处理所有 linkComment（不再限制必须是双向链接）
  oldComments.forEach((comment, index) => {
    if (comment.type == "linkComment") {  // 移除 LinkIfDouble 限制，处理所有链接
      let linkedNoteId = comment.text.toNoteId();

      // 检查是否已处理过
      if (processedNoteIds.has(linkedNoteId)) return;
      processedNoteIds.add(linkedNoteId);

      let linkedNote = MNNote.new(linkedNoteId, false);  // false 避免卡片不存在时弹窗
      MNUtil.log(`  链接到: ${linkedNote?.noteTitle || "未知"} | ID: ${linkedNoteId}`);

      if (linkedNote) {
        // 检查链接卡片中的 markdown
        MNUtil.log(`  检查链接卡片的 markdownComment:`);
        linkedNote.MNComments.forEach((c, i) => {
          if (c.type === "markdownComment" && c.text.includes(this.noteURL)) {
            MNUtil.log(`    [${i}] 找到包含源卡片URL: ${c.text.substring(0, 100)}${c.text.length > 100 ? '...' : ''}`);
          }
        });

        // 更新 linkedNote 中指向 A 的链接评论
        let indexArrInLinkedNote = linkedNote.getLinkCommentsIndexArr(this.noteId.toNoteURL())
        if (indexArrInLinkedNote.length > 0) {
          MNUtil.log(`  找到 ${indexArrInLinkedNote.length} 个反向链接评论，更新为目标卡片`);
        }
        indexArrInLinkedNote.forEach(index => {
          linkedNote.replaceWithMarkdownComment(targetNote.noteURL, index)
        })

        // 同时更新 linkedNote 中 markdownComment 里的行内链接
        MNUtil.updateMarkdownLinksInNote(linkedNote, this.noteURL, targetNote.noteURL)
      }
    }
  })

  // 处理 A 中 markdownComment 类型评论的行内链接
  oldComments.forEach((comment, index) => {
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
            let indexArr = linkedNote.getLinkCommentsIndexArr(this.noteURL);
            indexArr.forEach(idx => {
              linkedNote.replaceWithMarkdownComment(targetNote.noteURL, idx);
            });

            // 更新 linkedNote 中的 markdownComment
            MNUtil.updateMarkdownLinksInNote(linkedNote, this.noteURL, targetNote.noteURL);
          }
        }
      }
    }
  })

  if (this.title) {
    targetNote.appendMarkdownComment(
      HtmlMarkdownUtils.createHtmlMarkdownText(this.title.toNoBracketPrefixContent(), htmlType)
    )
    this.title = ""
  }

  // 检测 this 的第一条评论对应是否是 targetNote 是的话就去掉
  if (this.comments[0] && this.comments[0].text && (this.comments[0].text == targetNote.noteURL)) {
    this.removeCommentByIndex(0)
  }


  // 在合并前，先移除目标卡片中对源卡片的所有引用
  // 处理目标卡片的 markdownComment 中的行内链接
  targetNote.MNComments.forEach((comment, index) => {
    if (comment.type === "markdownComment") {
      let text = comment.text;
      // 检查是否包含源卡片的 URL
      if (text.includes(this.noteURL)) {
        // 移除包含源卡片 URL 的 Markdown 链接
        // 匹配 [任意文本](源卡片URL) 格式
        let markdownLinkRegex = new RegExp(`\\[[^\\]]*\\]\\(${this.noteURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g');
        let newText = text.replace(markdownLinkRegex, '');

        // 如果替换后文本发生变化，更新评论
        if (newText !== text) {
          comment.text = newText;
          MNUtil.log(`🔗 已移除目标卡片中对源卡片的行内链接`);
        }
      }
    }
  });

  // 处理目标卡片的 linkComment（链接评论）
  let targetLinkIndices = targetNote.getLinkCommentsIndexArr(this.noteURL);
  // 从后往前删除，避免索引变化问题
  for (let i = targetLinkIndices.length - 1; i >= 0; i--) {
    targetNote.removeCommentByIndex(targetLinkIndices[i]);
    MNUtil.log(`🔗 已移除目标卡片中对源卡片的链接评论`);
  }

  // 合并到目标卡片
  targetNote.merge(this)

  // 最后更新一下合并后的链接
  let targetNoteComments = targetNote.MNComments
  for (let i = 0; i < targetNoteComments.length; i++) {
    let targetNotecomment = targetNoteComments[i]
    if (targetNotecomment.type == "linkComment") {
      targetNotecomment.text = targetNotecomment.text
    }
  }
}
/**
 * 夏大鱼羊 MNNote 扩展 - End
 */


class HtmlMarkdownUtils {
  static icons = {
    // step: '🚩',
    // point: '▸',
    // subpoint: '▪',
    // subsubpoint: '•',
    level1: '🚩',
    level2: '▸',
    level3: '▪',
    level4: '•',
    level5: '·',
    key: '🔑',
    alert: '⚠️',
    danger: '❗❗❗',
    remark: '📝',
    goal: '🎯',
    question: '❓',
    idea: '💡',
    method: '✨',
    check: '🔍',
    sketch: '✏️',
  };
  static prefix = {
    danger: '',
    alert: '',
    key: '',
    // step: '',
    // point: '',
    // subpoint: '',
    // subsubpoint: '',
    level1: '',
    level2: '',
    level3: '',
    level4: '',
    level5: '',
    remark: '',
    goal: '',
    question: '',
    idea: '思路：',
    method: '方法：',
    check: 'CHECK',
    sketch: 'SKETCH',
  };
  static styles = {
    // 格外注意
    danger: 'font-weight:700;color:#6A0C0C;background:#FFC9C9;border-left:6px solid #A93226;font-size:1em;padding:8px 15px;display:inline-block;transform:skew(-3deg);box-shadow:2px 2px 5px rgba(0,0,0,0.1);',
    // 注意
    alert: 'background:#FFF;color:#FF8C5A;border:2px solid currentColor;border-radius:3px;padding:6px 12px;font-weight:600;box-shadow:0 1px 3px rgba(255,140,90,0.2);display:inline-block;',
    // 关键
    key: 'color: #B33F00;background: #FFF1E6;border-left: 6px solid #FF6B35;padding:16px 12px 1px;line-height:2;position:relative;top:6px;display:inline-block;font-family:monospace;margin-top:-2px;',
    level1: "font-weight:600;color:#1E40AF;background:linear-gradient(15deg,#EFF6FF 30%,#DBEAFE);border:2px solid #3B82F6;border-radius:12px;padding:10px 18px;display:inline-block;box-shadow:2px 2px 0px #BFDBFE,4px 4px 8px rgba(59,130,246,0.12);position:relative;margin:4px 8px;",
    level2: "font-weight:600;color:#4F79A3; background:linear-gradient(90deg,#F3E5F5 50%,#ede0f7);font-size:1.1em;padding:6px 12px;border-left:4px solid #7A9DB7;transform:skew(-1.5deg);box-shadow:1px 1px 3px rgba(0,0,0,0.05);margin-left:40px;position:relative;",
    level3: "font-weight:500;color:#7A9DB7;background:#E8F0FE;padding:4px 10px;border-radius:12px;border:1px solid #B3D4FF;font-size:0.95em;margin-left:80px;position:relative;",
    level4: "font-weight:400;color:#9DB7CA;background:#F8FBFF;padding:3px 8px;border-left:2px dashed #B3D4FF;font-size:0.9em;margin-left:120px;position:relative;",
    level5: "font-weight:300;color:#B3D4FF;background:#FFFFFF;padding:2px 6px;border-radius:8px;border:1px dashed #B3D4FF;font-size:0.85em;margin-left:160px;position:relative;",
    remark: 'background:#F5E6C9;color:#6d4c41;display:inline-block;border-left:5px solid #D4AF37;padding:2px 8px 3px 12px;border-radius:0 4px 4px 0;box-shadow:1px 1px 3px rgba(0,0,0,0.08);margin:0 2px;line-height:1.3;vertical-align:baseline;position:relative;',
    // 目标
    goal: 'font-weight:900;font-size:0.7em;color:#8B2635;background:linear-gradient(135deg,#F87171 0%,#FCA5A5 25%,#FECACA 60%,#FEF2F2 100%);padding:12px 24px;border-radius:50px;display:inline-block;position:relative;box-shadow:0 4px 8px rgba(248,113,113,0.25),inset 0 1px 0 rgba(255,255,255,0.5);text-shadow:0 1px 1px rgba(255,255,255,0.4);border:2px solid rgba(248,113,113,0.4);',
    // 问题
    question: 'font-weight:700;color:#3D1A67;background:linear-gradient(15deg,#F8F4FF 30%,#F1E8FF);border:3px double #8B5CF6;border-radius:16px 4px 16px 4px;padding:14px 22px;display:inline-block;box-shadow:4px 4px 0px #DDD6FE,8px 8px 12px rgba(99,102,241,0.12);position:relative;margin:4px 8px;',
    // 思路
    idea: 'font-weight:600;color:#4A4EB2;background:linear-gradient(15deg,#F0F4FF 30%,#E6EDFF);border:2px dashed #7B7FD1;border-radius:12px;padding:10px 18px;display:inline-block;box-shadow:0 0 0 2px rgba(123,127,209,0.2),inset 0 0 10px rgba(123,127,209,0.1);position:relative;margin:4px 8px;',
    // 方法
    method: 'display:block;font-weight:700;color:#1B4332;background:linear-gradient(135deg,#74C69D 0%,#95D5B2 25%,#C7F0DB 60%,#E8F5E8 100%);font-size:1.3em;padding:12px 20px 12px 24px;border-left:10px solid #2D6A4F;margin:0 0 12px 0;border-radius:0 6px 6px 0;box-shadow:0 4px 12px rgba(116,198,157,0.2),inset 0 1px 0 rgba(255,255,255,0.5);text-shadow:0 1px 1px rgba(255,255,255,0.4);position:relative;',
    // 检查
    check: 'font-weight:600;color:#34A853;background:#E6F7EE;border:2px solid #34A853;border-radius:4px;padding:4px 8px;display:inline-block;box-shadow:0 1px 2px rgba(52,168,83,0.2);margin:0 2px;line-height:1.3;vertical-align:baseline;position:relative;',
    // 草稿/手绘
    sketch: 'background:transparent;color:#5D4037;display:inline-block;border-bottom:2px dotted #FF9800;padding:0 4px 2px;margin:0 2px;line-height:1.2;vertical-align:baseline;position:relative;font-size:0.9em;font-style:italic;',
    // 等价证明
    // 蕴含关系
  };
  // 定义即使内容为空也要输出的类型白名单
  static emptyContentWhitelist = ['check'];
  
  static createHtmlMarkdownText(text, type = 'none') {
    // 对于白名单中的类型，特殊处理
    if (this.emptyContentWhitelist.includes(type) && (!text || (typeof text === 'string' && text.trim() === ''))) {
      // 对于白名单类型，即使内容为空也返回完整的 HTML
      return `<span id="${type}" style="${this.styles[type]} ">${this.icons[type]} ${this.prefix[type]}</span>`;
    }
    
    // 处理 undefined 或 null 的情况
    if (!text) {
      if (type === 'none') {
        return '';
      } else {
        return '';
      }
    }
    
    let handledText = Pangu.spacing(text)
    if (type === 'none') {
      return text.trim();
    } else {
      // 如果内容为空且类型不在白名单中，返回空字符串
      if (!handledText) {
        return '';
      }
      // 防御性编程：确保 icons 和 prefix 不会返回 undefined
      const icon = this.icons[type] || '';
      const prefix = this.prefix[type] || '';
      const style = this.styles[type] || '';
      return `<span id="${type}" style="${style} ">${icon} ${prefix}${handledText}</span>`;
    }
  }

  /**
   * 正则匹配获取 span 标签的内容
   */
  static getSpanContent(comment) {
    let text
    switch (MNUtil.typeOf(comment)) {
      case "string":
        text = comment
        break;
      case "MNComment":
        text = comment.text?comment.text:""
        break;
    }
    const regex = /<span[^>]*>(.*?)<\/span>/;
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    } else {
      return text;
    }
  }

  /**
   * 正则匹配获取 span 标签的文本内容（不含 emoji 和前缀）
   */
  static getSpanTextContent(comment) {
    let text
    switch (MNUtil.typeOf(comment)) {
      case "string":
        text = comment
        break;
      case "MNComment":
        text = comment.text?comment.text:""
        break;
    }
    const regex = /<span[^>]*>(.*?)<\/span>/;
    const match = text.match(regex);
    if (match && match[1]) {
      text = match[1].trim();
      // 去掉图标
      Object.values(this.icons).forEach(icon => {
        text = text.replace(icon, '').trim();
      });
      // 去掉前缀文本
      Object.values(this.prefix).forEach(prefix => {
        if (prefix && text.startsWith(prefix)) {
          text = text.substring(prefix.length).trim();
        }
      });
      return text
    } else {
      return text;
    }
  }

  /**
   * 正则匹配获取 span 的 id（类型）
   */
  static getSpanType(comment) {
    let span
    switch (MNUtil.typeOf(comment)) {
      case "string":
        span = comment
        break;
      case "MNComment":
        span = comment.text?comment.text:""
        break;
    }
    const regex = /<span\s+id="([^"]*)"/;
    const match = span.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    } else {
      return span;
    }
  }

  /**
   * 获取 id（类型） 往下一级的类型
   */
  static getSpanNextLevelType(type) {
    const levelMap = {
      goal: 'level1',
      // step: 'point',
      // point: 'subpoint',
      // subpoint: 'subsubpoint',
      // subsubpoint: 'subsubpoint'
      level1: 'level2',
      level2: 'level3',
      level3: 'level4',
      level4: 'level5',
      level5: 'level5',
    };
    return levelMap[type] || undefined;
  }

  /**
   * 获取 id（类型） 往上一级的类型
   */
  static getSpanLastLevelType(type) {
    const levelMap = {
      // point: 'step',
      // subpoint: 'point',
      // subsubpoint: 'subpoint',
      // step: 'goal',
      goal: 'goal',
      level1: 'goal',
      level2: 'level1',
      level3: 'level2',
      level4: 'level3',
      level5: 'level4',
    };
    return levelMap[type] || undefined;
  }

  /**
   * 是否属于可升降级类型
   * 
   * 防止对 remark 等类型进行处理
   */
  static isLevelType(type) {
    // const levelTypes = ['goal', 'step', 'point', 'subpoint', 'subsubpoint'];
    const levelTypes = ['goal', 'level1', 'level2', 'level3', 'level4', 'level5',];
    return levelTypes.includes(type);
  }

  /**
   * 获取 note 的 HtmlMD 评论的 index 和类型
   */
  static getHtmlMDCommentIndexAndTypeObjArr(note) {
    let comments = note.MNComments
    let htmlMDCommentsObjArr = []
    comments.forEach(
      (comment, index) => {
        if (HtmlMarkdownUtils.isHtmlMDComment(comment)) {
          htmlMDCommentsObjArr.push(
            {
              index: index,
              type: this.getSpanType(comment.text)
            }
          )
        }
      }
    )
    return htmlMDCommentsObjArr
  }

  /**
   * 判定评论是否是 HtmlMD 评论
   */
  static isHtmlMDComment(comment) {
    let text
    switch (MNUtil.typeOf(comment)) {
      case "string":
        text = comment
        break;
      case "MNComment":
        text = comment.text?comment.text:""
        break;
    }
    if (text == undefined) {
      return false
    } else {
      return !!text.startsWith("<span")
    }
  }

  /**
   * 将 HtmlMD 评论类型变成下一级
   */
  static changeHtmlMDCommentTypeToNextLevel(comment) {
    if (MNUtil.typeOf(comment) === "MNComment") {
      let content = this.getSpanTextContent(comment)
      let type = this.getSpanType(comment)
      if (HtmlMarkdownUtils.isHtmlMDComment(comment) && this.isLevelType(type)) {
        let nextLevelType = this.getSpanNextLevelType(type)
        comment.text = HtmlMarkdownUtils.createHtmlMarkdownText(content, nextLevelType)
      }
    }
  }

  /**
   * 将 HtmlMD 评论类型变成上一级
   */
  static changeHtmlMDCommentTypeToLastLevel(comment) {
    if (MNUtil.typeOf(comment) === "MNComment") {
      let content = this.getSpanTextContent(comment)
      let type = this.getSpanType(comment)
      if (HtmlMarkdownUtils.isHtmlMDComment(comment) && this.isLevelType(type)) {
        let lastLevelType = this.getSpanLastLevelType(type)
        comment.text = HtmlMarkdownUtils.createHtmlMarkdownText(content, lastLevelType)
      }
    }
  }


  /**
   * 获取评论中最后一个 HtmlMD 评论
   */
  static getLastHtmlMDComment(note) {
    let comments = note.MNComments
    let lastHtmlMDComment = undefined
    if (comments.length === 2 && comments[0] == undefined && comments[1] == undefined) {
      return false
    }
    comments.forEach(
      comment => {
        if (HtmlMarkdownUtils.isHtmlMDComment(comment)) {
          lastHtmlMDComment = comment
        }
      }
    )
    return lastHtmlMDComment
  }

  /**
   * 判断是否有 HtmlMD 评论
   */
  static hasHtmlMDComment(note) {
    return !!this.getLastHtmlMDComment(note)
  }

  /**
   * 增加同级评论
   */
  static addSameLevelHtmlMDComment(note, text, type) {
    note.appendMarkdownComment(
      HtmlMarkdownUtils.createHtmlMarkdownText(text, type),
    )
  }

  /**
   * 增加下一级评论
   */
  static addNextLevelHtmlMDComment(note, text, type) {
    let nextLevelType = this.getSpanNextLevelType(type)
    if (nextLevelType) {
      note.appendMarkdownComment(
        HtmlMarkdownUtils.createHtmlMarkdownText(text, nextLevelType)
      )
    } else {
      note.appendMarkdownComment(
        HtmlMarkdownUtils.createHtmlMarkdownText(text, type)
      )
    }
  }

  /**
   * 批量调整所有 HtmlMarkdown 评论的层级
   * 
   * @param {MNNote} note - 要处理的卡片
   * @param {string} direction - 调整方向："up" 表示层级上移（level2->level1），"down" 表示层级下移（level1->level2）
   * @returns {number} 返回调整的评论数量
   */
  static adjustAllHtmlMDLevels(note, direction = "up") {
    const comments = note.MNComments;
    let adjustedCount = 0;
    
    if (!comments || comments.length === 0) {
      MNUtil.showHUD("当前卡片没有评论");
      return 0;
    }
    
    // 遍历所有评论
    comments.forEach((comment, index) => {
      if (!comment || !comment.text) return;
      
      // 处理可能的 "- " 前缀
      let hasLeadingDash = false;
      let cleanText = comment.text;
      if (cleanText.startsWith("- ")) {
        hasLeadingDash = true;
        cleanText = cleanText.substring(2);
      }
      
      // 检查是否是 HtmlMarkdown 评论且是层级类型
      if (this.isHtmlMDComment(cleanText)) {
        const type = this.getSpanType(cleanText);
        const content = this.getSpanTextContent(cleanText);
        
        if (this.isLevelType(type)) {
          let newType;
          
          if (direction === "up") {
            // 层级上移（数字变小）
            newType = this.getSpanLastLevelType(type);
          } else if (direction === "down") {
            // 层级下移（数字变大）
            newType = this.getSpanNextLevelType(type);
          } else {
            return;
          }
          
          // 只有当类型真的改变时才更新
          if (newType && newType !== type) {
            const newHtmlText = this.createHtmlMarkdownText(content, newType);
            comment.text = hasLeadingDash ? "- " + newHtmlText : newHtmlText;
            adjustedCount++;
          }
        }
      }
    });
    
    if (adjustedCount > 0) {
      MNUtil.showHUD(`已调整 ${adjustedCount} 个层级评论`);
    } else {
      MNUtil.showHUD("没有可调整的层级评论");
    }
    
    return adjustedCount;
  }

  /**
   * 根据指定的最高级别调整所有层级
   * 
   * @param {MNNote} note - 要处理的卡片
   * @param {string} targetHighestLevel - 目标最高级别（如 "goal", "level1", "level2" 等）
   * @returns {number} 返回调整的评论数量
   */
  static adjustHtmlMDLevelsByHighest(note, targetHighestLevel) {
    const comments = note.MNComments;
    if (!comments || comments.length === 0) {
      MNUtil.showHUD("当前卡片没有评论");
      return 0;
    }
    
    // 定义层级顺序（从高到低）
    const levelOrder = ['goal', 'level1', 'level2', 'level3', 'level4', 'level5'];
    const targetIndex = levelOrder.indexOf(targetHighestLevel);
    
    if (targetIndex === -1) {
      MNUtil.showHUD("无效的目标层级");
      return 0;
    }
    
    // 第一遍扫描：找出当前最高层级
    let currentHighestLevel = null;
    let currentHighestIndex = levelOrder.length;
    
    // 收集所有层级类型的评论信息
    const levelComments = [];
    
    comments.forEach((comment, index) => {
      if (!comment || !comment.text) return;
      
      let cleanText = comment.text;
      let hasLeadingDash = false;
      
      if (cleanText.startsWith("- ")) {
        hasLeadingDash = true;
        cleanText = cleanText.substring(2);
      }
      
      if (this.isHtmlMDComment(cleanText)) {
        const type = this.getSpanType(cleanText);
        
        if (this.isLevelType(type)) {
          const levelIndex = levelOrder.indexOf(type);
          if (levelIndex !== -1) {
            levelComments.push({
              comment: comment,
              index: index,
              type: type,
              levelIndex: levelIndex,
              content: this.getSpanTextContent(cleanText),
              hasLeadingDash: hasLeadingDash
            });
            
            // 更新当前最高层级
            if (levelIndex < currentHighestIndex) {
              currentHighestIndex = levelIndex;
              currentHighestLevel = type;
            }
          }
        }
      }
    });
    
    if (levelComments.length === 0) {
      MNUtil.showHUD("没有找到层级类型的评论");
      return 0;
    }
    
    // 计算偏移量
    const offset = targetIndex - currentHighestIndex;
    
    if (offset === 0) {
      MNUtil.showHUD(`最高层级已经是 ${targetHighestLevel}`);
      return 0;
    }
    
    // 第二遍：根据偏移量调整所有层级
    let adjustedCount = 0;
    
    levelComments.forEach(item => {
      const newLevelIndex = Math.max(0, Math.min(levelOrder.length - 1, item.levelIndex + offset));
      const newType = levelOrder[newLevelIndex];
      
      if (newType !== item.type) {
        const newHtmlText = this.createHtmlMarkdownText(item.content, newType);
        item.comment.text = item.hasLeadingDash ? "- " + newHtmlText : newHtmlText;
        adjustedCount++;
      }
    });
    
    if (adjustedCount > 0) {
      const direction = offset > 0 ? "下移" : "上移";
      MNUtil.showHUD(`已将最高层级调整为 ${targetHighestLevel}，共${direction} ${Math.abs(offset)} 级，调整了 ${adjustedCount} 个评论`);
    }
    
    return adjustedCount;
  }

  /**
   * 批量调整所有 HtmlMarkdown 评论的层级
   * 
   * @param {MNNote} note - 要处理的卡片
   * @param {string} direction - 调整方向："up"（上移）或"down"（下移）
   * @returns {number} 调整的评论数量
   */
  static adjustAllHtmlMDLevels(note, direction = "down") {
    if (!note || !note.MNComments) return 0;
    
    let adjustedCount = 0;
    let comments = note.MNComments;
    
    MNUtil.undoGrouping(() => {
      comments.forEach((comment, index) => {
        if (!comment || !comment.text) return;
        
        // 处理可能的前导 "- "
        let text = comment.text;
        let hasLeadingDash = false;
        if (text.startsWith("- ")) {
          hasLeadingDash = true;
          text = text.substring(2);
        }
        
        // 检查是否是 HtmlMarkdown 评论
        if (!HtmlMarkdownUtils.isHtmlMDComment(text)) return;
        
        let type = HtmlMarkdownUtils.getSpanType(text);
        let content = HtmlMarkdownUtils.getSpanTextContent(text);
        
        // 检查是否是层级类型
        if (!HtmlMarkdownUtils.isLevelType(type)) return;
        
        // 根据方向获取新的层级类型
        let newType;
        if (direction === "up") {
          newType = HtmlMarkdownUtils.getSpanLastLevelType(type);
        } else {
          newType = HtmlMarkdownUtils.getSpanNextLevelType(type);
        }
        
        // 如果层级没有变化（已到边界），跳过
        if (newType === type) return;
        
        // 创建新的 HtmlMarkdown 文本
        let newHtmlText = HtmlMarkdownUtils.createHtmlMarkdownText(content, newType);
        
        // 保持前导破折号
        if (hasLeadingDash) {
          newHtmlText = "- " + newHtmlText;
        }
        
        // 更新评论
        comment.text = newHtmlText;
        adjustedCount++;
      });
    });
    
    return adjustedCount;
  }

  /**
   * 根据指定的最高级别调整所有层级
   * 
   * @param {MNNote} note - 要处理的卡片
   * @param {string} targetHighestLevel - 目标最高级别（如 "goal", "level1", "level2" 等）
   * @returns {Object} 返回调整结果 {adjustedCount: 数量, originalHighest: 原最高级, targetHighest: 目标最高级}
   */
  static adjustHtmlMDLevelsByHighest(note, targetHighestLevel) {
    if (!note || !note.MNComments) {
      return { adjustedCount: 0, originalHighest: null, targetHighest: targetHighestLevel };
    }
    
    // 定义层级顺序映射（数字越小层级越高）
    const levelOrder = {
      'goal': 0,
      'level1': 1,
      'level2': 2,
      'level3': 3,
      'level4': 4,
      'level5': 5
    };
    
    // 验证目标层级是否有效
    if (!(targetHighestLevel in levelOrder)) {
      MNUtil.showHUD(`无效的目标层级: ${targetHighestLevel}`);
      return { adjustedCount: 0, originalHighest: null, targetHighest: targetHighestLevel };
    }
    
    // 收集所有层级类型的 HtmlMarkdown 评论
    let levelComments = [];
    let comments = note.MNComments;
    
    comments.forEach((comment, index) => {
      if (!comment || !comment.text) return;
      
      // 处理前导 "- "
      let text = comment.text;
      let hasLeadingDash = false;
      if (text.startsWith("- ")) {
        hasLeadingDash = true;
        text = text.substring(2);
      }
      
      if (!HtmlMarkdownUtils.isHtmlMDComment(text)) return;
      
      let type = HtmlMarkdownUtils.getSpanType(text);
      let content = HtmlMarkdownUtils.getSpanTextContent(text);
      
      if (!HtmlMarkdownUtils.isLevelType(type)) return;
      
      levelComments.push({
        index: index,
        comment: comment,
        type: type,
        content: content,
        hasLeadingDash: hasLeadingDash,
        order: levelOrder[type]
      });
    });
    
    if (levelComments.length === 0) {
      MNUtil.showHUD("没有找到层级类型的 HtmlMarkdown 评论");
      return { adjustedCount: 0, originalHighest: null, targetHighest: targetHighestLevel };
    }
    
    // 找出当前最高层级（order 值最小的）
    let currentHighestOrder = Math.min(...levelComments.map(item => item.order));
    let currentHighestLevel = Object.keys(levelOrder).find(key => levelOrder[key] === currentHighestOrder);
    
    // 计算需要调整的偏移量
    let targetOrder = levelOrder[targetHighestLevel];
    let offset = targetOrder - currentHighestOrder;
    
    if (offset === 0) {
      MNUtil.showHUD(`当前最高级已经是 ${targetHighestLevel}`);
      return { adjustedCount: 0, originalHighest: currentHighestLevel, targetHighest: targetHighestLevel };
    }
    
    // 批量调整所有层级
    let adjustedCount = 0;
    
    MNUtil.undoGrouping(() => {
      levelComments.forEach(item => {
        let newOrder = item.order + offset;
        
        // 确保不超出边界
        if (newOrder < 0) newOrder = 0;
        if (newOrder > 5) newOrder = 5;
        
        // 找到对应的新层级类型
        let newType = Object.keys(levelOrder).find(key => levelOrder[key] === newOrder);
        
        if (newType && newType !== item.type) {
          // 创建新的 HtmlMarkdown 文本
          let newHtmlText = HtmlMarkdownUtils.createHtmlMarkdownText(item.content, newType);
          
          // 保持前导破折号
          if (item.hasLeadingDash) {
            newHtmlText = "- " + newHtmlText;
          }
          
          // 更新评论
          item.comment.text = newHtmlText;
          adjustedCount++;
        }
      });
    });
    
    return {
      adjustedCount: adjustedCount,
      originalHighest: currentHighestLevel,
      targetHighest: targetHighestLevel
    };
  }

  /**
   * 增加上一级评论
   */
  static addLastLevelHtmlMDComment(note, text, type) {
    let lastLevelType = this.getSpanLastLevelType(type)
    if (lastLevelType) {
      note.appendMarkdownComment(
        HtmlMarkdownUtils.createHtmlMarkdownText(text, lastLevelType)
      )
    } else {
      note.appendMarkdownComment(
        HtmlMarkdownUtils.createHtmlMarkdownText(text, type)
      )
    }
  }

  /**
   * 自动根据最后一个 HtmlMD 评论的类型增加 Level 类型评论
   */
  static autoAddLevelHtmlMDComment(note, text, goalLevel = "same") {
    let lastHtmlMDComment = this.getLastHtmlMDComment(note)
    if (lastHtmlMDComment) {
      let lastHtmlMDCommentType = this.getSpanType(lastHtmlMDComment.text)
      switch (goalLevel) {
        case "same":
          this.addSameLevelHtmlMDComment(note, text, lastHtmlMDCommentType)
          break;
        case "next":
          this.addNextLevelHtmlMDComment(note, text, lastHtmlMDCommentType)
          break;
        case "last":
          this.addLastLevelHtmlMDComment(note, text, lastHtmlMDCommentType)
          break
        default: 
          MNUtil.showHUD("No goalLevel: " + goalLevel)
          break;
      }
    } else {
      // 如果没有 HtmlMD 评论，就添加一个一级
      note.appendMarkdownComment(
        HtmlMarkdownUtils.createHtmlMarkdownText(text, 'goal')
      )
    }
  }

  // 解析开头的连字符数量
  static parseLeadingDashes(str) {
    let count = 0;
    let index = 0;
    const maxDashes = 5;
    
    while (count < maxDashes && index < str.trim().length) {
      if (str[index] === '-') {
        count++;
        index++;
        // 跳过后续空格
        while (index < str.length && (str[index] === ' ' || str[index] === '\t')) {
          index++;
        }
      } else {
        break;
      }
    }
    
    return {
      count: count > 0 ? Math.min(count, maxDashes) : 0,
      remaining: str.slice(index).trim()
    };
  }

  /**
   * 检查笔记的后代中是否有任何子卡片包含标题
   * @param {MNNote} rootFocusNote 要检查的根笔记
   * @returns {boolean} 如果有任何后代包含标题返回 true，否则返回 false
   */
  static hasDescendantWithTitle(rootFocusNote) {
      try {
          const nodesData = rootFocusNote.descendantNodes;
          if (!nodesData || !nodesData.descendant) {
              return false;
          }
          
          const allDescendants = nodesData.descendant;
          const treeIndex = nodesData.treeIndex;
          
          // 过滤掉知识点卡片和归类卡片的分支
          const excludedBranchRoots = new Set();
          
          if (rootFocusNote.childNotes && rootFocusNote.childNotes.length > 0) {
              rootFocusNote.childNotes.forEach(childNote => {
                  if (knowledgeBaseTemplate.isClassificationNote(childNote) || knowledgeBaseTemplate.isKnowledgeNote(childNote)) {
                      excludedBranchRoots.add(childNote.noteId);
                  }
              });
          }
          
          // 检查每个后代节点
          for (let i = 0; i < allDescendants.length; i++) {
              const node = allDescendants[i];
              const nodeTreeIndex = treeIndex[i];
              
              // 跳过被排除的分支
              if (nodeTreeIndex.length > 0 && excludedBranchRoots.size > 0) {
                  const directChildIndex = nodeTreeIndex[0];
                  const directChild = rootFocusNote.childNotes[directChildIndex];
                  if (directChild && excludedBranchRoots.has(directChild.noteId)) {
                      continue;
                  }
              }
              
              // 检查节点是否有标题
              let hasTitle = false;
              if (typeof node.title === 'string') {
                  let titleContent = "";
                  if (typeof node.title.toNoBracketPrefixContent === 'function') {
                      titleContent = node.title.toNoBracketPrefixContent();
                  } else if (HtmlMarkdownUtils.isHtmlMDComment(node.title)) {
                      titleContent = HtmlMarkdownUtils.getSpanTextContent(node.title);
                  } else {
                      titleContent = node.title;
                  }
                  
                  if (titleContent.trim()) {
                      hasTitle = true;
                  }
              }
              
              if (hasTitle) {
                  return true;
              }
          }
          
          return false;
      } catch (e) {
          MNUtil.error("检查后代标题时出错", e);
          return false;
      }
  }

  /**
   * 执行向上合并操作，将被聚焦笔记的后代笔记合并到其自身。
   * 子笔记的标题会作为带样式的、独立的评论添加到它们各自的直接父笔记中，
   * 然后子笔记（清空标题后）的结构内容再合并到父笔记。
   *
   * @param {MNNote} rootFocusNote 要处理的主笔记，其后代笔记将被向上合并到此笔记中。
   * @param {string} [firstLevelType] rootFocusNote 直接子笔记的 HtmlMarkdownUtils 类型 (例如：'goal', 'level1')。如果不提供，将跳过标题样式化步骤。
   */
  static upwardMergeWithStyledComments(rootFocusNote, firstLevelType) {
      // 确保 MNUtil 和 HtmlMarkdownUtils 在当前作用域中可用
      if (typeof MNUtil === 'undefined' || typeof HtmlMarkdownUtils === 'undefined') {
          MNUtil.error("MNUtil 或 HtmlMarkdownUtils 未定义。");
          if (typeof MNUtil !== 'undefined' && typeof MNUtil.showHUD === 'function') {
              MNUtil.showHUD("错误：找不到必要的工具库。", 2);
          }
          return;
      }

      // 1. API 名称更正：使用属性访问 rootFocusNote.descendantNodes
      let allDescendants, treeIndex;
      try {
          // 假设 descendantNodes 是一个直接返回所需对象的属性
          const nodesData = rootFocusNote.descendantNodes;
          if (!nodesData || typeof nodesData.descendant === 'undefined' || typeof nodesData.treeIndex === 'undefined') {
              throw new Error("descendantNodes 属性未返回预期的 {descendant, treeIndex} 对象结构。");
          }
          allDescendants = nodesData.descendant;
          treeIndex = nodesData.treeIndex;
      } catch (e) {
          MNUtil.error("无法获取后代笔记。请确保 rootFocusNote.descendantNodes 属性存在且能正确返回数据。", e);
          MNUtil.showHUD("错误：无法获取后代笔记数据。", 2);
          return;
      }

      if (!allDescendants || allDescendants.length === 0) {
          MNUtil.showHUD("没有可合并的后代笔记。", 2);
          return;
      }

      // 过滤掉知识点卡片和归类卡片的分支
      // 首先找出所有需要排除的分支根节点（直接子节点）
      const excludedBranchRoots = new Set();
      
      // 检查直接子节点
      if (rootFocusNote.childNotes && rootFocusNote.childNotes.length > 0) {
          rootFocusNote.childNotes.forEach(childNote => {
              // 判断子卡片是否是归类卡片或知识点卡片（仅检查卡片自身，不向上查找）
              if (knowledgeBaseTemplate.isClassificationNote(childNote) || knowledgeBaseTemplate.isKnowledgeNote(childNote)) {
                  excludedBranchRoots.add(childNote.noteId);
              }
          });
      }
      
      // 如果有需要排除的分支，过滤掉这些分支的所有节点
      if (excludedBranchRoots.size > 0) {
          const filteredDescendants = [];
          const filteredTreeIndex = [];
          
          for (let i = 0; i < allDescendants.length; i++) {
              const node = allDescendants[i];
              const nodeTreeIndex = treeIndex[i];
              
              // treeIndex[0] 是直接子节点在 childNotes 中的索引
              if (nodeTreeIndex.length > 0) {
                  const directChildIndex = nodeTreeIndex[0];
                  const directChild = rootFocusNote.childNotes[directChildIndex];
                  
                  // 如果这个节点不属于被排除的分支，则保留
                  if (directChild && !excludedBranchRoots.has(directChild.noteId)) {
                      filteredDescendants.push(node);
                      filteredTreeIndex.push(nodeTreeIndex);
                  }
              }
          }
          
          // 更新为过滤后的数组
          allDescendants = filteredDescendants;
          treeIndex = filteredTreeIndex;
          
          // 如果过滤后没有节点了，提示并返回
          if (allDescendants.length === 0) {
              MNUtil.showHUD("所有子卡片都是知识点或归类卡片，无法合并。", 2);
              return;
          }
      }

      const nodesWithInfo = allDescendants.map((node, i) => ({
          node: node,
          level: treeIndex[i].length // 相对于 rootFocusNote 子笔记的深度 (1 代表直接子笔记)
      }));

      let maxLevel = 0;
      if (nodesWithInfo.length > 0) {
          maxLevel = Math.max(...nodesWithInfo.map(item => item.level));
      }

      // (移除 aggregatedRawTextFromChildren Map，因为不再需要向上聚合标题文本)

      /**
       * 根据笔记在 treeIndex 中的层级（相对于 rootFocusNote 子笔记的深度）
       * 和第一层子笔记的初始类型，来确定该笔记的 HtmlMarkdownUtils 类型。
       * @param {number} level - 笔记的层级 (1 代表 rootFocusNote 的直接子笔记)
       * @param {string} initialTypeForLevel1 - 第一层子笔记的初始类型
       * @returns {string} - 计算得到的 HtmlMarkdownUtils 类型
       */
      function getNodeTypeForTreeIndexLevel(level, initialTypeForLevel1) {
          // 仅在提供了 initialTypeForLevel1 时才执行
          if (!initialTypeForLevel1) {
              return null;
          }
          
          // 检查是否是层级类型（goal, level1-5）
          if (HtmlMarkdownUtils.isLevelType(initialTypeForLevel1)) {
              // 原有逻辑：层级类型按原规则递减
              let currentType = initialTypeForLevel1;
              if (level === 1) {
                  return currentType;
              }
              for (let i = 1; i < level; i++) {
                  const nextType = HtmlMarkdownUtils.getSpanNextLevelType(currentType);
                  if (!nextType || nextType === currentType) {
                      return currentType;
                  }
                  currentType = nextType;
              }
              return currentType;
          } else {
              // 新逻辑：非层级类型（如 method, idea, question 等）
              if (level === 1) {
                  // 第一层使用指定的非层级类型
                  return initialTypeForLevel1;
              } else {
                  // 从第二层开始，使用 level1 并按层级递减
                  let currentType = 'level1';
                  // 注意：level 是从 1 开始的，level=2 表示第二层
                  for (let i = 2; i < level; i++) {
                      const nextType = HtmlMarkdownUtils.getSpanNextLevelType(currentType);
                      if (!nextType || nextType === currentType) {
                          return currentType;
                      }
                      currentType = nextType;
                  }
                  return currentType;
              }
          }
      }

      // 从最深层级开始，逐层向上处理
      for (let currentTreeIndexLevel = maxLevel; currentTreeIndexLevel >= 1; currentTreeIndexLevel--) {
          const nodesAtThisLevel = nodesWithInfo.filter(item => item.level === currentTreeIndexLevel);

          for (const item of nodesAtThisLevel) {
              const currentNode = item.node;
              const parentNode = currentNode.parentNote;

              if (!parentNode) {
                  MNUtil.error(`层级 ${currentTreeIndexLevel} 的笔记 ${currentNode.id || '(无ID)'} 没有父笔记。已跳过。`);
                  continue;
              }
              if (parentNode.id !== rootFocusNote.id && !allDescendants.some(d => d.id === parentNode.id)) {
                  MNUtil.warn(`笔记 ${currentNode.id} 的父笔记 ${parentNode.id} 不在 rootFocusNote 后代笔记的合并范围内。已跳过此笔记的合并。`);
                  continue;
              }

              // 1. 仅在提供了 firstLevelType 时确定类型
              let typeForCurrentNodeTitleInParentComment;
              if (firstLevelType) {
                  // 确定 currentNode 的标题在添加到 parentNode 的评论中时应采用的 'type'。
                  // 这个 type 是基于 currentNode 相对于 rootFocusNote 的深度来决定的。
                  typeForCurrentNodeTitleInParentComment = getNodeTypeForTreeIndexLevel(currentTreeIndexLevel, firstLevelType);
              }

              // 2. 准备来自 currentNode 标题的原始文本内容。
              let rawTextFromTitle;
              if (typeof currentNode.title === 'string') {
                  if (typeof currentNode.title.toNoBracketPrefixContent === 'function') { // 您提到的特定方法
                      rawTextFromTitle = currentNode.title.toNoBracketPrefixContent();
                  } else if (HtmlMarkdownUtils.isHtmlMDComment(currentNode.title)) {
                      rawTextFromTitle = HtmlMarkdownUtils.getSpanTextContent(currentNode.title);
                  } else {
                      rawTextFromTitle = currentNode.title;
                  }
              } else {
                  rawTextFromTitle = "";
              }
              rawTextFromTitle = rawTextFromTitle.trim();

              // 3. 如果提供了 firstLevelType，将标题转换为带样式的评论
              if (firstLevelType) {
                  // 将 currentNode 的 rawTextFromTitle (原始标题文本) 作为一个新的带样式的评论添加到 parentNode。
                  // 评论的类型由 currentNode 自身的层级决定。
                  if (rawTextFromTitle) { // 仅当标题有内容时才添加评论
                      // HtmlMarkdownUtils.addSameLevelHtmlMDComment(parentNode, rawTextFromTitle, typeForCurrentNodeTitleInParentComment);
                      // 或者，如果更倾向于直接使用 appendMarkdownComment:
                      if (typeof parentNode.appendMarkdownComment === 'function') {
                          parentNode.appendMarkdownComment(
                              HtmlMarkdownUtils.createHtmlMarkdownText(rawTextFromTitle, typeForCurrentNodeTitleInParentComment)
                          );
                      } else {
                          MNUtil.warn(`parentNode ${parentNode.id} 上未找到 appendMarkdownComment 方法。`);
                      }
                  }

                  // 4. 清空 currentNode 的标题。
                  if (typeof currentNode.setTitle === 'function') {
                      currentNode.setTitle("");
                  } else {
                      currentNode.title = "";
                  }
              }

              // 5. 执行 currentNode（现在已无标题，但包含其原有评论、子节点等）到 parentNode 的结构性合并。
              if (typeof currentNode.mergeInto === 'function') {
                  currentNode.mergeInto(parentNode);
              } else {
                  MNUtil.warn(`笔记 ${currentNode.id || '(无ID)'} 上未找到 mergeInto 方法。结构性合并已跳过。`);
              }
          }
      }
      
      rootFocusNote.focusInMindMap(0.5);
  }


  /**
   * 通过弹窗选择字段并将其内容转换为 HtmlMarkdown 评论
   * @param {MNNote} note - 要操作的笔记
   */
  static convertFieldContentToHtmlMDByPopup(note) {
    let htmlCommentsTextArr = knowledgeBaseTemplate.parseNoteComments(note).htmlCommentsTextArr;
    
    if (htmlCommentsTextArr.length === 0) {
      MNUtil.showHUD("当前笔记没有字段");
      return;
    }

    // 在字段列表前添加特殊选项
    htmlCommentsTextArr.unshift("📋 从所有评论中选择");

    // 第一个弹窗：选择字段
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择要转换内容的字段",
      "请选择一个字段，将其内容转换为 HtmlMarkdown 格式",
      0,
      "取消",
      htmlCommentsTextArr,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) return; // 用户取消
        
        if (buttonIndex === 1) {
          // 用户选择了"从所有评论中选择"
          let contents = this.getAllNonHtmlMDContents(note);
          
          if (contents.length === 0) {
            MNUtil.showHUD("没有可转换的内容");
            return;
          }
          
          // 直接显示内容选择弹窗
          this.showFieldContentSelectionPopup(note, contents, "所有评论");
        } else {
          // 原有逻辑：选择了特定字段
          let selectedField = htmlCommentsTextArr[buttonIndex - 2]; // 因为添加了一个选项，索引要减2
          let contents = this.getFieldNonHtmlMDContents(note, selectedField);
          
          if (contents.length === 0) {
            MNUtil.showHUD("该字段下没有可转换的内容");
            return;
          }
          
          // 显示内容选择弹窗
          this.showFieldContentSelectionPopup(note, contents, selectedField);
        }
      }
    );
  }

  /**
   * 获取指定字段下的非 HtmlMarkdown 内容
   * @param {MNNote} note - 笔记对象
   * @param {string} fieldName - 字段名称
   * @returns {Array} 包含内容信息的数组
   */
  static getFieldNonHtmlMDContents(note, fieldName) {
    let commentsObj = knowledgeBaseTemplate.parseNoteComments(note);
    let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    
    // 找到对应字段
    let fieldObj = htmlCommentsObjArr.find(obj => obj.text.includes(fieldName));
    if (!fieldObj) return [];
    
    let contents = [];
    let excludingIndices = fieldObj.excludingFieldBlockIndexArr;
    
    excludingIndices.forEach(index => {
      let comment = note.MNComments[index];
      
      // 只处理文本评论和 Markdown 评论（非 HtmlMarkdown）
      if (comment.type === "textComment" || 
          (comment.type === "markdownComment" && !HtmlMarkdownUtils.isHtmlMDComment(comment.text))) {
        
        let text = comment.text || "";
        let displayText = text;
        let hasLeadingDash = false;
        
        // 检查是否有 "- " 前缀
        if (text.startsWith("- ")) {
          hasLeadingDash = true;
          displayText = text; // 显示时保留 "- "
        }
        
        contents.push({
          index: index,
          text: text,
          displayText: displayText,
          type: comment.type,
          hasLeadingDash: hasLeadingDash
        });
      }
    });
    
    return contents;
  }

  /**
   * 获取所有评论中的非 HtmlMarkdown 内容
   * @param {MNNote} note - 笔记对象
   * @returns {Array} 包含所有可转换内容的数组
   */
  static getAllNonHtmlMDContents(note) {
    let contents = [];
    let comments = note.MNComments;
    
    comments.forEach((comment, index) => {
      // 只处理文本评论和非 HtmlMarkdown 的 Markdown 评论
      if (comment.type === "textComment" || 
          (comment.type === "markdownComment" && !HtmlMarkdownUtils.isHtmlMDComment(comment.text))) {
        
        let text = comment.text || "";
        let displayText = text;
        let hasLeadingDash = false;
        
        // 检查是否有 "- " 前缀
        if (text.startsWith("- ")) {
          hasLeadingDash = true;
          displayText = text; // 显示时保留 "- "
        }
        
        // 添加字段信息以便用户识别
        let fieldInfo = this.getCommentFieldInfo(note, index);
        if (fieldInfo) {
          displayText = `[${fieldInfo}] ${displayText}`;
        }
        
        contents.push({
          index: index,
          text: text,
          displayText: displayText,
          type: comment.type,
          hasLeadingDash: hasLeadingDash,
          fieldName: fieldInfo
        });
      }
    });
    
    return contents;
  }

  /**
   * 获取评论所属的字段信息
   * @param {MNNote} note - 笔记对象
   * @param {number} commentIndex - 评论索引
   * @returns {string|null} 字段名称，如果不属于任何字段则返回 null
   */
  static getCommentFieldInfo(note, commentIndex) {
    let commentsObj = knowledgeBaseTemplate.parseNoteComments(note);
    let htmlCommentsObjArr = commentsObj.htmlCommentsObjArr;
    
    // 遍历所有字段，找到包含该评论的字段
    for (let fieldObj of htmlCommentsObjArr) {
      if (fieldObj.excludingFieldBlockIndexArr.includes(commentIndex)) {
        return fieldObj.text;
      }
    }
    
    return null; // 不属于任何字段
  }

  /**
   * 显示内容选择弹窗
   * @param {MNNote} note - 笔记对象
   * @param {Array} contents - 可转换的内容数组
   * @param {string} fieldName - 字段名称
   */
  static showFieldContentSelectionPopup(note, contents, fieldName) {
    // 准备显示选项
    let options = contents.map((content, idx) => {
      return `${idx + 1}. ${content.displayText.substring(0, 50)}${content.displayText.length > 50 ? '...' : ''}`;
    });
    
    // 添加多选和全部转换选项
    options.unshift("✅ 多选内容");
    options.unshift("转换全部内容");
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择要转换的内容",
      `字段"${fieldName}"下共有 ${contents.length} 条可转换内容`,
      0,
      "取消",
      options,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) return; // 用户取消
        
        let selectedContents = [];
        
        if (buttonIndex === 1) {
          // 选择了"转换全部内容"
          selectedContents = contents;
          // 显示类型选择弹窗
          this.showTypeSelectionPopup(note, selectedContents);
        } else if (buttonIndex === 2) {
          // 选择了"多选内容"
          let selectedIndices = new Set();
          this.showFieldContentMultiSelectDialog(note, contents, fieldName, selectedIndices);
        } else {
          // 选择了单个内容
          selectedContents = [contents[buttonIndex - 3]]; // 因为增加了两个选项，所以索引要减3
          // 显示类型选择弹窗
          this.showTypeSelectionPopup(note, selectedContents);
        }
      }
    );
  }

  /**
   * 显示内容多选对话框
   * @param {MNNote} note - 笔记对象
   * @param {Array} contents - 所有可转换的内容
   * @param {string} fieldName - 字段名称
   * @param {Set} selectedIndices - 已选中的索引集合
   */
  static showFieldContentMultiSelectDialog(note, contents, fieldName, selectedIndices) {
    // 构建显示选项
    let displayOptions = contents.map((content, idx) => {
      let prefix = selectedIndices.has(content.index) ? "✅ " : "";
      let displayText = content.displayText.substring(0, 50) + (content.displayText.length > 50 ? '...' : '');
      return prefix + `${idx + 1}. ${displayText}`;
    });
    
    // 添加全选/取消全选选项
    let allSelected = selectedIndices.size === contents.length;
    let selectAllText = allSelected ? "⬜ 取消全选" : "☑️ 全选所有内容";
    displayOptions.unshift(selectAllText);
    
    // 添加分隔线和操作选项
    displayOptions.push("──────────────");
    displayOptions.push("➡️ 转换选中内容");
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      `多选内容 - ${fieldName}`,
      `已选中 ${selectedIndices.size}/${contents.length} 项`,
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
            contents.forEach((content) => {
              selectedIndices.add(content.index);
            });
          }
          
          // 递归显示更新后的对话框
          this.showFieldContentMultiSelectDialog(note, contents, fieldName, selectedIndices);
          
        } else if (buttonIndex === displayOptions.length) {
          // 用户选择了"转换选中内容"
          if (selectedIndices.size === 0) {
            MNUtil.showHUD("没有选中任何内容");
            this.showFieldContentMultiSelectDialog(note, contents, fieldName, selectedIndices);
            return;
          }
          
          // 获取选中的内容
          let selectedContents = [];
          contents.forEach(content => {
            if (selectedIndices.has(content.index)) {
              selectedContents.push(content);
            }
          });
          
          // 显示类型选择弹窗
          this.showTypeSelectionPopup(note, selectedContents);
          
        } else if (buttonIndex === displayOptions.length - 1) {
          // 用户选择了分隔线，忽略并重新显示
          this.showFieldContentMultiSelectDialog(note, contents, fieldName, selectedIndices);
          
        } else {
          // 用户选择了某个内容，切换选中状态
          let selectedContent = contents[buttonIndex - 2]; // 因为加了全选选项，所以索引要减2
          
          if (selectedIndices.has(selectedContent.index)) {
            selectedIndices.delete(selectedContent.index);
          } else {
            selectedIndices.add(selectedContent.index);
          }
          
          // 递归显示更新后的对话框
          this.showFieldContentMultiSelectDialog(note, contents, fieldName, selectedIndices);
        }
      }
    );
  }

  /**
   * 显示类型选择弹窗
   * @param {MNNote} note - 笔记对象
   * @param {Array} contents - 要转换的内容数组
   */
  static showTypeSelectionPopup(note, contents) {
    // 定义可选的类型
    let typeOptions = [
      "goal - 🎯 目标",
      "level1 - 🚩 一级",
      "level2 - ▸ 二级",
      "level3 - ▪ 三级",
      "level4 - • 四级",
      "level5 - · 五级",
      "key - 🔑 关键",
      "alert - ⚠️ 警告",
      "danger - ❗❗❗ 危险",
      "remark - 📝 备注",
      "question - ❓ 问题",
      "idea - 💡 想法",
      "method - ✨ 方法"
    ];
    
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "选择转换类型",
      "请选择要转换成的 HtmlMarkdown 类型",
      0,
      "取消",
      typeOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) return; // 用户取消
        
        // 提取类型名
        let selectedType = typeOptions[buttonIndex - 1].split(" - ")[0];
        
        // 执行转换
        this.convertContentsToHtmlMD(note, contents, selectedType);
      }
    );
  }

  /**
   * 执行内容转换
   * @param {MNNote} note - 笔记对象
   * @param {Array} contents - 要转换的内容数组
   * @param {string} type - 目标类型
   */
  static convertContentsToHtmlMD(note, contents, type) {
    MNUtil.undoGrouping(() => {
      // 按索引从大到小排序，避免删除时索引变化
      let sortedContents = contents.sort((a, b) => b.index - a.index);
      
      sortedContents.forEach(content => {
        let textToConvert = content.text;
        
        // 如果有 "- " 前缀，去掉它
        if (content.hasLeadingDash) {
          textToConvert = textToConvert.substring(2).trim();
        }
        
        // 创建 HtmlMarkdown 文本
        let htmlMdText = HtmlMarkdownUtils.createHtmlMarkdownText(textToConvert, type);
        
        // 获取原评论
        let comment = note.MNComments[content.index];
        
        // 替换原评论的文本
        if (comment) {
          comment.text = htmlMdText;
        }
      });
      
      // 刷新笔记显示
      note.refresh();
    });
    
    MNUtil.showHUD(`成功转换 ${contents.length} 条内容`);
  }

  /**
   * 智能添加空格
   * 在中文和英文/数字之间添加空格
   * @param {string} text - 要处理的文本
   * @returns {string} 处理后的文本
   */

  /**
   * 创建等价证明文本
   * @param {string} propositionA - 命题 A
   * @param {string} propositionB - 命题 B
   * @returns {Object} 包含两个方向证明的对象
   */
  static createEquivalenceProof(propositionA, propositionB) {
    // 处理空格
    const spacedA = this.smartSpacing(propositionA);
    const spacedB = this.smartSpacing(propositionB);
    
    // 生成两个方向的证明（纯文本格式）
    const proofAtoB = `若 ${spacedA} 成立，则 ${spacedB} 成立`;
    const proofBtoA = `若 ${spacedB} 成立，则 ${spacedA} 成立`;
    const equivalence = `${spacedA} ⇔ ${spacedB}`;
    
    return {
      proofAtoB,
      proofBtoA,
      equivalence,
      fullProof: [equivalence, proofAtoB, proofBtoA]
    };
  }

  /**
   * 通过弹窗输入创建等价证明（使用模板选择）
   * @param {MNNote} note - 目标笔记
   */
  
  /**
   * 通用的证明添加入口
   * @param {MNNote} note - 目标笔记
   */

  // ==================== 证明模板管理系统 ====================
  
  /**
   * 初始化证明模板配置
   */

  /**
   * 从存储加载证明模板配置
   */

  /**
   * 获取默认证明模板配置
   */

  /**
   * 保存证明模板配置
   */

  /**
   * 获取所有证明模板
   */
  
  /**
   * 获取所有启用的证明模板
   */
  
  /**
   * 收集证明输入数据
   * @param {Object} template - 选中的模板
   * @returns {Object|null} 输入数据对象或null（如果取消）
   */
  
  /**
   * 显示输入对话框
   * @param {string} title - 对话框标题
   * @param {string} message - 对话框消息
   * @param {string} confirmText - 确认按钮文本
   * @returns {Promise<string|null>} 输入文本或null（如果取消）
   */
  
  /**
   * 使用模板生成证明内容
   * @param {Object} template - 证明模板
   * @param {Object} inputs - 输入数据
   * @returns {Object} 生成的证明内容
   */
  static generateProofFromTemplate(template, inputs) {
    const result = {
      mainContent: null,
      forwardProof: null,
      reverseProof: null
    };
    
    // 替换占位符
    const replacePlaceholders = (text) => {
      if (!text) return "";
      const valueA = inputs.A || "";
      const valueB = inputs.B || "";
      return text.replace(/\{A\}/g, this.smartSpacing(valueA))
                 .replace(/\{B\}/g, this.smartSpacing(valueB));
    };
    
    // 生成主要内容（根据模板类型）- 纯文本格式
    if (template.type === "equivalence") {
      const spacedA = this.smartSpacing(inputs.A || "");
      const spacedB = this.smartSpacing(inputs.B || "");
      if (spacedA && spacedB) {
        result.mainContent = `${spacedA} ⇔ ${spacedB}`;
      }
    } else if (template.type === "implication") {
      const spacedA = this.smartSpacing(inputs.A || "");
      const spacedB = this.smartSpacing(inputs.B || "");
      if (spacedA && spacedB) {
        result.mainContent = `${spacedA} ⇒ ${spacedB}`;
      }
    }
    
    // 生成正向证明（纯文本格式）
    if (template.forwardTemplate) {
      const forwardText = replacePlaceholders(template.forwardTemplate);
      result.forwardProof = forwardText;
    }
    
    // 生成反向证明（纯文本格式）
    if (template.reverseTemplate) {
      const reverseText = replacePlaceholders(template.reverseTemplate);
      result.reverseProof = reverseText;
    }
    
    return result;
  }
  
  /**
   * 将证明内容添加到笔记
   * @param {MNNote} note - 目标笔记
   * @param {Object} template - 使用的模板
   * @param {Object} proof - 生成的证明内容
   */

  /**
   * 添加证明模板
   */

  /**
   * 更新证明模板
   */

  /**
   * 删除证明模板
   */

  /**
   * 证明模板管理 - 主界面
   */

  /**
   * 编辑证明模板对话框
   */

  /**
   * 添加证明模板对话框
   */

  /**
   * 显示文本输入对话框
   */

  /**
   * 导出证明模板配置
   */

  /**
   * 导入证明模板配置
   */
}
// 夏大鱼羊 - end
    
/**
 * 夏大鱼羊 - 字符串函数 - begin
 */
// https://github.com/vinta/pangu.js
// CJK is short for Chinese, Japanese, and Korean.
//
// CJK includes following Unicode blocks:
// \u2e80-\u2eff CJK Radicals Supplement
// \u2f00-\u2fdf Kangxi Radicals
// \u3040-\u309f Hiragana
// \u30a0-\u30ff Katakana
// \u3100-\u312f Bopomofo
// \u3200-\u32ff Enclosed CJK Letters and Months
// \u3400-\u4dbf CJK Unified Ideographs Extension A
// \u4e00-\u9fff CJK Unified Ideographs
// \uf900-\ufaff CJK Compatibility Ideographs
//
// For more information about Unicode blocks, see
// http://unicode-table.com/en/
// https://github.com/vinta/pangu
//
// all J below does not include \u30fb
const CJK =
  "\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30fa\u30fc-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff"
// ANS is short for Alphabets, Numbers, and Symbols.
//
// A includes A-Za-z\u0370-\u03ff
// N includes 0-9
// S includes `~!@#$%^&*()-_=+[]{}\|;:'",<.>/?
//
// some S below does not include all symbols
// the symbol part only includes ~ ! ; : , . ? but . only matches one character
const CONVERT_TO_FULLWIDTH_CJK_SYMBOLS_CJK = new RegExp(
  `([${CJK}])[ ]*([\\:]+|\\.)[ ]*([${CJK}])`,
  "g"
)
const CONVERT_TO_FULLWIDTH_CJK_SYMBOLS = new RegExp(
  `([${CJK}])[ ]*([~\\!;,\\?]+)[ ]*`,
  "g"
)
const DOTS_CJK = new RegExp(`([\\.]{2,}|\u2026)([${CJK}])`, "g")
const FIX_CJK_COLON_ANS = new RegExp(`([${CJK}])\\:([A-Z0-9\\(\\)])`, "g")
// the symbol part does not include '
const CJK_QUOTE = new RegExp(`([${CJK}])([\`"\u05f4])`, "g")
const QUOTE_CJK = new RegExp(`([\`"\u05f4])([${CJK}])`, "g")
const FIX_QUOTE_ANY_QUOTE = /([`"\u05f4]+)[ ]*(.+?)[ ]*([`"\u05f4]+)/g
const CJK_SINGLE_QUOTE_BUT_POSSESSIVE = new RegExp(`([${CJK}])('[^s])`, "g")
const SINGLE_QUOTE_CJK = new RegExp(`(')([${CJK}])`, "g")
const FIX_POSSESSIVE_SINGLE_QUOTE = new RegExp(
  `([A-Za-z0-9${CJK}])( )('s)`,
  "g"
)
const HASH_ANS_CJK_HASH = new RegExp(
  `([${CJK}])(#)([${CJK}]+)(#)([${CJK}])`,
  "g"
)
const CJK_HASH = new RegExp(`([${CJK}])(#([^ ]))`, "g")
const HASH_CJK = new RegExp(`(([^ ])#)([${CJK}])`, "g")
// the symbol part only includes + - * / = & | < >
const CJK_OPERATOR_ANS = new RegExp(
  `([${CJK}])([\\+\\-\\*\\/=&\\|<>])([A-Za-z0-9])`,
  "g"
)
const ANS_OPERATOR_CJK = new RegExp(
  `([A-Za-z0-9])([\\+\\-\\*\\/=&\\|<>])([${CJK}])`,
  "g"
)
const FIX_SLASH_AS = /([/]) ([a-z\-_\./]+)/g
const FIX_SLASH_AS_SLASH = /([/\.])([A-Za-z\-_\./]+) ([/])/g
// the bracket part only includes ( ) [ ] { } < > “ ”
const CJK_LEFT_BRACKET = new RegExp(`([${CJK}])([\\(\\[\\{<>\u201c])`, "g")
const RIGHT_BRACKET_CJK = new RegExp(`([\\)\\]\\}<>\u201d])([${CJK}])`, "g")
const FIX_LEFT_BRACKET_ANY_RIGHT_BRACKET =
  /([\(\[\{<\u201c]+)[ ]*(.+?)[ ]*([\)\]\}>\u201d]+)/
const ANS_CJK_LEFT_BRACKET_ANY_RIGHT_BRACKET = new RegExp(
  `([A-Za-z0-9${CJK}])[ ]*([\u201c])([A-Za-z0-9${CJK}\\-_ ]+)([\u201d])`,
  "g"
)
const LEFT_BRACKET_ANY_RIGHT_BRACKET_ANS_CJK = new RegExp(
  `([\u201c])([A-Za-z0-9${CJK}\\-_ ]+)([\u201d])[ ]*([A-Za-z0-9${CJK}])`,
  "g"
)
const AN_LEFT_BRACKET = /([A-Za-z0-9])([\(\[\{])/g
const RIGHT_BRACKET_AN = /([\)\]\}])([A-Za-z0-9])/g
const CJK_ANS = new RegExp(
  `([${CJK}])([A-Za-z\u0370-\u03ff0-9@\\$%\\^&\\*\\-\\+\\\\=\\|/\u00a1-\u00ff\u2150-\u218f\u2700—\u27bf])`,
  "g"
)
const ANS_CJK = new RegExp(
  `([A-Za-z\u0370-\u03ff0-9~\\$%\\^&\\*\\-\\+\\\\=\\|/!;:,\\.\\?\u00a1-\u00ff\u2150-\u218f\u2700—\u27bf])([${CJK}])`,
  "g"
)
const S_A = /(%)([A-Za-z])/g
const MIDDLE_DOT = /([ ]*)([\u00b7\u2022\u2027])([ ]*)/g
const BACKSAPCE_CJK = new RegExp(`([${CJK}]) ([${CJK}])`, "g")
const SUBSCRIPT_CJK = /([\u2080-\u2099])(?=[\u4e00-\u9fa5])/g
// 上标 https://rupertshepherd.info/resource_pages/superscript-letters-in-unicode
const SUPERSCRIPT_CJK = /([\u2070-\u209F\u1D56\u1D50\u207F\u1D4F\u1D57])(?=[\u4e00-\u9fa5])/g
// 特殊字符
// \u221E: ∞
const SPECIAL = /([\u221E])(?!\s|[\(\[])/g  // (?!\s) 是为了当后面没有空格才加空格，防止出现多个空格
class Pangu {
  version
  static convertToFullwidth(symbols) {
    return symbols
      .replace(/~/g, "～")
      .replace(/!/g, "！")
      .replace(/;/g, "；")
      .replace(/:/g, "：")
      .replace(/,/g, "，")
      .replace(/\./g, "。")
      .replace(/\?/g, "？")
  }
  static toFullwidth(text) {
    let newText = text
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    newText = newText.replace(
      CONVERT_TO_FULLWIDTH_CJK_SYMBOLS_CJK,
      (match, leftCjk, symbols, rightCjk) => {
        const fullwidthSymbols = that.convertToFullwidth(symbols)
        return `${leftCjk}${fullwidthSymbols}${rightCjk}`
      }
    )
    newText = newText.replace(
      CONVERT_TO_FULLWIDTH_CJK_SYMBOLS,
      (match, cjk, symbols) => {
        const fullwidthSymbols = that.convertToFullwidth(symbols)
        return `${cjk}${fullwidthSymbols}`
      }
    )
    return newText
  }
  static spacing(text) {
    let newText = text
    // https://stackoverflow.com/questions/4285472/multiple-regex-replace
    newText = newText.replace(DOTS_CJK, "$1 $2")
    newText = newText.replace(FIX_CJK_COLON_ANS, "$1：$2")
    newText = newText.replace(CJK_QUOTE, "$1 $2")
    newText = newText.replace(QUOTE_CJK, "$1 $2")
    newText = newText.replace(FIX_QUOTE_ANY_QUOTE, "$1$2$3")
    newText = newText.replace(CJK_SINGLE_QUOTE_BUT_POSSESSIVE, "$1 $2")
    newText = newText.replace(SINGLE_QUOTE_CJK, "$1 $2")
    newText = newText.replace(FIX_POSSESSIVE_SINGLE_QUOTE, "$1's") // eslint-disable-line quotes
    newText = newText.replace(HASH_ANS_CJK_HASH, "$1 $2$3$4 $5")
    newText = newText.replace(CJK_HASH, "$1 $2")
    newText = newText.replace(HASH_CJK, "$1 $3")
    newText = newText.replace(CJK_OPERATOR_ANS, "$1 $2 $3")
    newText = newText.replace(ANS_OPERATOR_CJK, "$1 $2 $3")
    newText = newText.replace(FIX_SLASH_AS, "$1$2")
    newText = newText.replace(FIX_SLASH_AS_SLASH, "$1$2$3")
    newText = newText.replace(CJK_LEFT_BRACKET, "$1 $2")
    newText = newText.replace(RIGHT_BRACKET_CJK, "$1 $2")
    newText = newText.replace(FIX_LEFT_BRACKET_ANY_RIGHT_BRACKET, "$1$2$3")
    newText = newText.replace(
      ANS_CJK_LEFT_BRACKET_ANY_RIGHT_BRACKET,
      "$1 $2$3$4"
    )
    newText = newText.replace(
      LEFT_BRACKET_ANY_RIGHT_BRACKET_ANS_CJK,
      "$1$2$3 $4"
    )
    newText = newText.replace(AN_LEFT_BRACKET, "$1 $2")
    newText = newText.replace(RIGHT_BRACKET_AN, "$1 $2")
    newText = newText.replace(CJK_ANS, "$1 $2")
    newText = newText.replace(ANS_CJK, "$1 $2")
    newText = newText.replace(S_A, "$1 $2")
    // newText = newText.replace(MIDDLE_DOT, "・")
    // 去中文间的空格
    newText = newText.replace(BACKSAPCE_CJK, "$1$2")
    // 去掉下标和中文之间的空格
    newText = newText.replace(SUBSCRIPT_CJK, "$1 ")
    newText = newText.replace(SUPERSCRIPT_CJK, "$1 ")
    /* 特殊处理 */
    // 特殊字符
    newText = newText.replace(SPECIAL, "$1 ")
    // 处理 C[a,b] 这种单独字母紧跟括号的情形，不加空格
    newText = newText.replace(/([A-Za-z])\s([\(\[\{])/g, "$1$2")
    newText = newText.replace(/([\)\]\}])\s([A-Za-z])/g, "$1$2")
    // ”后面不加空格
    newText = newText.replace(/”\s/g, "”")
    // · 左右的空格去掉
    newText = newText.replace(/\s*·\s*/g, "·")
    // - 左右的空格去掉
    newText = newText.replace(/\s*-\s*/g, "-")
    // ∞ 后面的只保留一个空格，而不是直接去掉
    newText = newText.replace(/∞\s+/g, "∞ ")
    newText = newText.replace(/∞\s*}/g, "∞}")
    newText = newText.replace(/∞\s*\)/g, "∞)")
    newText = newText.replace(/∞\s*\]/g, "∞]")
    newText = newText.replace(/∞\s*】/g, "∞】")
    newText = newText.replace(/∞\s*）/g, "∞）")
    newText = newText.replace(/∞\s*”/g, "∞”")
    newText = newText.replace(/∞\s*_/g, "∞_")
    // 大求和符号改成小求和符号
    newText = newText.replace(/∑/g, "Σ")
    // 处理一下 弱* w* 这种空格
    newText = newText.replace(/([弱A-Za-z])\s*\*/g, "$1*")
    newText = newText.replace(/\*\s*\*/g, "**")
    // 把 等价刻画/充要条件 中间的 / 两边的空格去掉
    newText = newText.replace(/\s*\/\s*/g, '/')
    // 处理括号后面的空格
    newText = newText.replace(/\]\s*([A-Za-z])/g, "] $1")
    // 去掉 ∈ 前面的空格
    newText = newText.replace(/\s*∈\s*/g, "∈")
    return newText
  }
}
/**
 * 判断是否是正整数
 */
String.prototype.isPositiveInteger = function() {
  const regex = /^[1-9]\d*$/;
  return regex.test(this);
}
/**
 * 获取参考文献的标题
 */
String.prototype.toReferenceNoteTitle = function () {
  let match = this.match(/^【.*】(.*)/)
  return match ? match[1] : this  // 如果匹配不到，返回原字符串
}
/**
 * 判断是否是文献卡片的标题
 */
String.prototype.ifReferenceNoteTitle = function () {
  return /^【文献：(论文|书作|作者)：?.*】/.test(this)
}
/**
 * 获取文献卡片标题的前缀内容
 */
String.prototype.toReferenceNoteTitlePrefixContent = function () {
  let match = this.match(/^【(文献：(论文|书作)：?.*)】/)
  return match ? match[1] : this  // 如果匹配不到，返回原字符串
}
/**
 * 判断是否有前缀部分
 */
String.prototype.ifWithBracketPrefix = function () {
  let match = (/^【.*】(.*)/).test(this)
  return match
}
/**
 * 获取无前缀的部分
 * 并且把开头的分号去掉
 */
// String.prototype.toNoBracketPrefixContent = function () {
//   let match = this.match(/^【.*】(.*)/)
//   return match ? match[1] : this  // 如果匹配不到，返回原字符串
// }
String.prototype.toNoBracketPrefixContent = function () {
  return this.replace(
    /^【.*?】(\s*;\s*)?(.*)/, 
    (_, __, content) => content || ''
  ).replace(/^\s*/, '') || this;
};
String.prototype.toNoBracketPrefixContentFirstTitleLinkWord = function () {
  let regex = /【.*】(.*?);?\s*([^;]*?)(?:;|$)/;
  let matches = this.match(regex);

  if (matches) {
    const firstPart = matches[1].trim(); // 提取分号前的内容
    const secondPart = matches[2].trim(); // 提取第一个分号后的内容

    // 根据第一部分是否为空选择返回内容
    return firstPart === '' ? secondPart : firstPart;
  } else {
    // 如果没有前缀，就获取第一个 ; 前的内容
    let title = this.toNoBracketPrefixContent()
    regex = /^(.*?);/;
    matches = title.match(regex);
  
    if (matches) {
      return matches[1].trim().toString()
    } else {
      return title.toString()
    }
  }
}
/**
 * 获取前缀的内容
 */
String.prototype.toBracketPrefixContent = function () {
  let match = this.match(/^【(.*)】.*/)
  return match ? match[1] : this  // 如果匹配不到，返回原字符串
}
/**
 * 【xxx】yyy 变成 【xxx→yyy】
 */
String.prototype.toBracketPrefixContentArrowSuffix = function () {
  if (this.ifWithBracketPrefix()) {
    // 有前缀就开始处理
    return "【" + this.toBracketPrefixContent() + " → " + this.toNoBracketPrefixContentFirstTitleLinkWord() + "】"
  } else {
    // 如果没有前缀，就直接输出 【this】
    return "【" + this.toNoBracketPrefixContentFirstTitleLinkWord() + "】"
  }
}

/**
 * 判断输入的字符串是否是卡片 URL 或者卡片 ID
 */
String.prototype.ifNoteIdorURL = function () {
  return (
    this.ifValidNoteURL() ||
    this.ifValidNoteId()
  )
}
String.prototype.isNoteIdorURL = function () {
  return this.ifNoteIdorURL()
}
String.prototype.ifNoteURLorId = function () {
  return this.ifNoteIdorURL()
}
String.prototype.isNoteURLorId = function () {
  return this.ifNoteIdorURL()
}
String.prototype.ifNoteURLorID = function () {
  return this.ifNoteIdorURL()
}
String.prototype.isNoteURLorID = function () {
  return this.ifNoteIdorURL()
}
String.prototype.ifNoteIDorURL = function () {
  return this.ifNoteIdorURL()
}
String.prototype.isNoteIDorURL = function () {
  return this.ifNoteIdorURL()
}

/**
 * 判断是否是有效的卡片 ID
 */
String.prototype.ifValidNoteId = function() {
  const regex = /^[0-9A-Z]{8}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{12}$/;
  return regex.test(this);
}
String.prototype.isValidNoteId = function() {
  return this.ifValidNoteId()
}
String.prototype.ifNoteId = function() {
  return this.ifValidNoteId()
}
String.prototype.isNoteId = function() {
  return this.ifValidNoteId()
}

/**
 * 判断是否是有效的卡片 URL
 */
String.prototype.ifValidNoteURL = function() {
  return /^marginnote\dapp:\/\/note\//.test(this)
}
String.prototype.isValidNoteURL = function() {
  return this.ifValidNoteURL()
}
String.prototype.isLink = function() {
  return this.ifValidNoteURL()
}
String.prototype.ifLink = function() {
  return this.ifValidNoteURL()
}
/**
 * 把 ID 或 URL 统一转化为 URL
 */
String.prototype.toNoteURL = function() {
  if (this.ifNoteIdorURL()) {
    let noteId = this.trim()
    let noteURL
    if (/^marginnote\dapp:\/\/note\//.test(noteId)) {
      noteURL = noteId
    } else {
      noteURL = "marginnote4app://note/" + noteId
    }
    return noteURL
  }
}


String.prototype.ifNoteBookId = function() {
  return /^marginnote\dapp:\/\/notebook\//.test(this)
}
/**
 * 把 ID 或 URL 统一转化为 NoteBookId
 */
String.prototype.toNoteBookId = function() {
  if (this.ifNoteBookId() || this.ifNoteId()) {
    let noteId = this.trim()
    let noteURL
    if (/^marginnote\dapp:\/\/notebook\//.test(noteId)) {
      noteURL = noteId
    } else {
      noteURL = "marginnote4app://notebook/" + noteId
    }
    return noteURL
  }
}

/**
 * 字符串改成“- xxx”的形式
 * 
 * xxx => - xxx
 * -xxx => - xxx
 * - xxx => - xxx
 */
String.prototype.toDotPrefix = function() {
  let str = this.trim().removeDotPrefix()
  return "- " + str
}
/**
 * 去掉字符串的 - 前缀
 * 
 * 如果没有这个前缀，就原样返回
 */
String.prototype.removeDotPrefix = function() {
  let str = this.trim()
  if (str.startsWith("-")) {
    return str.slice(1).trim()
  } else {
    return str
  }
}

/**
 * 把 ID 或 URL 统一转化为 ID
 */
String.prototype.toNoteId = function() {
  if (this.ifNoteIdorURL()) {
    let noteURL = this.trim()
    let noteId
    if (/^marginnote\dapp:\/\/note\//.test(noteURL)) {
      noteId = noteURL.slice(22)
    } else {
      noteId = noteURL
    }
    return noteId
  }
}
String.prototype.toNoteID = function() {
  return this.toNoteId()
}
/**
 * 将字符串用四种分割符之一进行分割
 * @returns {string[]}
 */
String.prototype.splitStringByFourSeparators = function() {
  // 正则表达式匹配中文逗号、中文分号和西文分号
  const separatorRegex = /,\s*|，\s*|；\s*|;\s*/g;
  
  // 使用split方法按分隔符分割字符串
  const arr = this.split(separatorRegex);
  
  // 去除可能的空字符串元素（如果输入字符串的前后或连续分隔符间有空白）
  return arr.filter(Boolean);
}

/**
 * 解析评论索引字符串，支持：
 * - 范围输入（如 "1-4" 表示第1到第4条）
 * - 特殊字符 X、Y、Z（不区分大小写，分别表示倒数第3、2、1条）
 * - 1-based 索引（用户输入 1 表示第一条，内部转换为 0）
 * @param {number} totalComments - 评论总数
 * @returns {number[]} 0-based 索引数组
 */
String.prototype.parseCommentIndices = function(totalComments) {
  // 先使用四种分隔符分割
  const parts = this.splitStringByFourSeparators();
  const indices = [];
  
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    
    // 检查是否为范围表达式（如 "1-4" 或 "2-Y"）
    const rangeMatch = part.match(/^([1-9]\d*|[xyzXYZ])\s*[-－]\s*([1-9]\d*|[xyzXYZ])$/);
    if (rangeMatch) {
      const startStr = rangeMatch[1];
      const endStr = rangeMatch[2];
      
      // 解析起始索引
      let startIndex;
      if (/^[xyzXYZ]$/i.test(startStr)) {
        // 特殊字符
        const char = startStr.toUpperCase();
        if (char === 'X') startIndex = totalComments - 3;
        else if (char === 'Y') startIndex = totalComments - 2;
        else if (char === 'Z') startIndex = totalComments - 1;
      } else {
        // 数字，转换为 0-based
        startIndex = parseInt(startStr) - 1;
      }
      
      // 解析结束索引
      let endIndex;
      if (/^[xyzXYZ]$/i.test(endStr)) {
        // 特殊字符
        const char = endStr.toUpperCase();
        if (char === 'X') endIndex = totalComments - 3;
        else if (char === 'Y') endIndex = totalComments - 2;
        else if (char === 'Z') endIndex = totalComments - 1;
      } else {
        // 数字，转换为 0-based
        endIndex = parseInt(endStr) - 1;
      }
      
      // 确保索引有效
      startIndex = Math.max(0, Math.min(startIndex, totalComments - 1));
      endIndex = Math.max(0, Math.min(endIndex, totalComments - 1));
      
      // 添加范围内的所有索引
      if (startIndex <= endIndex) {
        for (let i = startIndex; i <= endIndex; i++) {
          indices.push(i);
        }
      }
    } else {
      // 单个索引
      if (/^[xyzXYZ]$/i.test(part)) {
        // 特殊字符
        const char = part.toUpperCase();
        let index;
        if (char === 'X') index = totalComments - 3;
        else if (char === 'Y') index = totalComments - 2;
        else if (char === 'Z') index = totalComments - 1;
        
        if (index >= 0 && index < totalComments) {
          indices.push(index);
        }
      } else if (/^[1-9]\d*$/.test(part)) {
        // 数字，转换为 0-based
        const index = parseInt(part) - 1;
        if (index >= 0 && index < totalComments) {
          indices.push(index);
        }
      }
    }
  }
  
  // 去重并排序
  return [...new Set(indices)].sort((a, b) => a - b);
}

String.prototype.toTitleCasePro = function () {
  'use strict'
  let smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
  let alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/;
  /* note there is a capturing group, so the separators will also be included in the returned list */
  let wordSeparators = /([ :–—-])/;
  let lowerBar = /_/g;
  /* regular expression: remove the space character, punctuation (.,;:!?), 
     dash and lower bar at both ends of the string */
  let trimBeginEndPattern = /^[\s.,;:!?_\-]*([a-zA-Z0-9].*[a-zA-Z0-9])[\s.,;:!?_\-]*$/g;
  let romanNumberPattern = /^(I|II|III|IV|V|VI|VII|VIII|IX|X)$/i;

  let title = this.toLowerCase().replace(trimBeginEndPattern,"$1")
    .replace(lowerBar, " ")
    .split(wordSeparators)
    .map(function (current, index, array) {
      if (
        /* Check for small words */
        current.search(smallWords) > -1 &&
        /* Skip first and last word */
        index !== 0 &&
        index !== array.length - 1 &&
        /* cope with the situation such as: 1. the conjugation operator */
        array.slice(0,index-1).join('').search(/[a-zA-Z]/) > -1 &&
        /* Ignore title end and subtitle start */
        array[index - 3] !== ':' &&
        array[index + 1] !== ':' &&
        /* Ignore small words that start a hyphenated phrase */
        (array[index + 1] !== '-' ||
          (array[index - 1] === '-' && array[index + 1] === '-'))
      ) {
        return current.toLowerCase()
      }
      
      /* Uppercase roman numbers */
      if (current.search(romanNumberPattern) > -1) {
        return current.toUpperCase();
      }

      /* Ignore intentional capitalization */
      if (current.substring(1).search(/[A-Z]|\../) > -1) {
        return current;
      }

      /* Ignore URLs */
      if (array[index + 1] === ':' && array[index + 2] !== '') {
        return current;
      }

      /* Capitalize the first letter */
      return current.replace(alphanumericPattern, function (match) {
        return match.toUpperCase();
      })
    })
    .join('') // convert the list into a string

  if (title.startsWith('&')) {
    title = title.replace('&', '§');
  }
  title = title.replace(/\s+/g, ' ');
  
  let chapterRegex = /^(?:\d+\s*\.\s*)+\d+\s*\.?\s*/;
  if (chapterRegex.test(title)) {
    // 提取章节编号部分
    let chapterMatch = title.match(chapterRegex)[0];
    // 去掉章节编号中的多余空格
    let normalizedChapter = chapterMatch.replace(/\s+/g, '');
    normalizedChapter += " "
    // 替换原字符串中的章节编号部分
    title = title.replace(chapterMatch, normalizedChapter);
  }
  return title;
}

/**
 * 夏大鱼羊 - 字符串函数 - end
 */

/**
 * 夏大鱼羊 - MNUtil prototype 扩展 - begin
 */


/**
 * 判断是否是普通对象
 * @param {Object} obj 
 * @returns {Boolean}
 */
MNUtil.isObj = function(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj)
}

MNUtil.ifObj = function(obj) {
  return this.isObj(obj)
}

/**
 * 判断评论是否是链接
 */
MNUtil.isCommentLink = function(comment){
  if (this.isObj(comment)) {
    if (comment.type == "TextNote") {
      return comment.text.isLink()
    }
  } else if (typeof comment == "string") {
    return comment.isLink()
  }
}

MNUtil.isLink = function(comment){
  return this.isCommentLink(comment)
}

MNUtil.ifLink = function(comment){
  return this.isCommentLink(comment)
}

MNUtil.ifCommentLink = function(comment){
  return this.isCommentLink(comment)
}

/**
 * 获取到链接的文本
 */
MNUtil.getLinkText = function(link){
  if (this.isObj(link) && this.isCommentLink(link)) {
    return link.text
  }
  return link
}

/**
 * 夏大鱼羊 - MNUtil prototype 扩展 - end
 */

/**
 * 夏大鱼羊 - MNNote prototype 扩展 - begin
 */

/**
 * 判断卡片是否是文献卡片：论文和书作
 * 
 * 依据：是否有"文献信息："的评论问
 * 注意：标题里带有"文献"二字的不一定，因为【文献：作者】暂时不需要判断为文献卡片
 */
MNNote.prototype.ifReferenceNote = function() {
  // return this.getHtmlCommentIndex("文献信息：") !== -1
  return this.title.startsWith("【文献") || this.title.startsWith("【参考文献")
}

/**
 * 判断是否是旧的文献卡片
 */
MNNote.prototype.ifOldReferenceNote = function() {
  return this.getHtmlCommentIndex("主要内容、摘要：") !== -1 || this.getHtmlCommentIndex("主要内容/摘要：") !== -1
}

/**
 * 卡片去掉所有评论
 */
MNNote.prototype.clearAllComments = function(){
  for (let i = this.comments.length -1; i >= 0; i--) {
    this.removeCommentByIndex(i)
  }
}


/**
 * 让卡片成为进度卡片
 * - 在学习规划学习集中，某些卡片起了大头钉的作用，下次能知道从哪里开始看
 * 
 * 1. 卡片变成灰色
 * 2. 找到摘录对应的 md5
 * 3. 找到学习规划学习集中对应的卡片
 * 4. 将卡片移动到学习规划学习集中对应的卡片下成为子卡片
 */
MNNote.prototype.toBeProgressNote = function(){
  let docMd5 = MNUtil.currentDocmd5
  let targetNote = MNNote.new(MNUtil.getNoteIdByMd5InPlanNotebook(docMd5))
  if (targetNote) {
    targetNote.addChild(this)
    this.colorIndex = 13 // 灰色
    // bug 添加到卡片的兄弟卡片了而不是变成子卡片
  }
}

/**
 * 让卡片独立出来
 */
MNNote.prototype.toBeIndependent = function(){
  let parentNote = this.getClassificationParentNote()
  parentNote.addChild(this)
  this.focusInMindMap(0.5)
}

/**
 * 将 IdArr 里的 ID 对应的卡片剪切到 this 作为子卡片
 */
MNNote.prototype.pasteChildNotesByIdArr = function(arr) {
  arr.forEach((id) => {
    if (id.isNoteIdorURL()) {
      this.pasteChildNoteById(id.toNoteId())
    }
  })
}

MNNote.prototype.pasteChildNoteById = function(id) {
  if (typeof id == "string" && id.isNoteIdorURL()) {
    let targetNote = MNNote.new(id.toNoteId())
    if (targetNote) {
      let config = {
        title: targetNote.noteTitle,
        content: "",
        markdown: true,
        color: targetNote.colorIndex
      }
      // 创建新兄弟卡片，标题为旧卡片的标题
      let newNote = this.createChildNote(config)
      targetNote.noteTitle = ""
      // 将旧卡片合并到新卡片中
      targetNote.mergeInto(newNote)
    }
  }
}


/**
 * 【数学】移动卡片到某些特定的子卡片后
 * 
 * 目前只移动文献
 * 
 * 1. 先判断是否需要移动文献
 * 2. 如果要的话再移动到论文或者书作文献区
 */
MNNote.prototype.move = function() {
  let noteType = this.getNoteTypeZh()
  let targetNoteId
  if (noteType == "文献") {
    if (this.ifReferenceNoteToMove()) {
      // 此时文献卡片不在"论文"或"书作"文献区
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "选择文献类型",
        "",
        0,
        "取消",
        ["论文", "书作"],
        (alert, buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              noteType = "论文"
              targetNoteId = "785225AC-5A2A-41BA-8760-3FEF10CF4AE0"
              break;
            case 2:
              noteType = "书作"
              targetNoteId = "49102A3D-7C64-42AD-864D-55EDA5EC3097"
              break;
          }
          // 把修改前缀放在这里
          this.changeTitle(noteType)
          let targetNote = MNNote.new(targetNoteId)
          targetNote.addChild(this)
        }
      )
    } else {
      // 如果在的话就 change 一下 Title
      let parentNote = this.parentNote
      if (parentNote.noteId == "785225AC-5A2A-41BA-8760-3FEF10CF4AE0") {
        this.changeTitle("论文")
      } else {
        this.changeTitle("书作")
      }
    }
  }
}

/**
 * 夏大鱼羊 - MNNote prototype 扩展 - end
 */

/**
 * 夏大鱼羊 - MNComment prototype 扩展 - begin
 */

// 修改MNComment的text setter，添加对linkComment和markdownComment的支持
if (typeof MNComment !== 'undefined' && MNComment.prototype) {
  const originalTextSetter = Object.getOwnPropertyDescriptor(MNComment.prototype, 'text')?.set;
  
  Object.defineProperty(MNComment.prototype, 'text', {
    get: function() {
      // 保持原有的getter逻辑
      return this.detail?.text;
    },
    set: function(text) {
      if (this.originalNoteId) {
        let note = MNNote.new(this.originalNoteId)
        switch (this.type) {
          case "linkComment":
          case "markdownComment":
            this.detail.text = text
            note.replaceWithMarkdownComment(text, this.index)
            break;
          case "textComment":
            this.detail.text = text
            note.replaceWithTextComment(text, this.index)
            break;
          case "blankTextComment":
          case "mergedImageComment":
          case "mergedTextComment":
            this.detail.q_htext = text
            let mergedNote = this.note
            mergedNote.excerptText = text
            break;
          default:
            if (originalTextSetter) {
              originalTextSetter.call(this, text);
            } else {
              MNUtil.showHUD("Unsupported comment type: " + this.type)
            }
            break;
        }
      } else {
        MNUtil.showHUD("No originalNoteId")
      }
    },
    enumerable: true,
    configurable: true
  });
}

/**
 * 夏大鱼羊 - MNComment prototype 扩展 - end
 */

/**
 * 夏大鱼羊 - MNNote prototype 扩展 - 更多方法 - begin
 */


/**
 * 删除评论
 * 
 * 提供一些预设项，并且用户可以自行输入要删除的评论 Index
 */
MNNote.prototype.deleteCommentsByPopup = function(){
  UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
    "删除评论",
    "支持:\n- 单个序号: 1,2,3\n- 范围: 1-4 (删除第1到第4条)\n- 特殊字符: X(倒数第3条), Y(倒数第2条), Z(最后一条)\n- 组合使用: 1,3-5,Y,Z\n\n用中文或英文逗号、分号分隔",
    2,
    "取消",
    [
      "第1️⃣条评论",
      "最后一条评论",
      "确定删除输入的评论"
    ],
    (alert, buttonIndex) => {
      let userInput = alert.textFieldAtIndex(0).text;
      let deleteCommentIndexArr = userInput ? userInput.parseCommentIndices(this.comments.length) : []
      switch (buttonIndex) {
        case 1:  // 删除第一条评论
          this.removeCommentByIndex(0)
          break;
        case 2:  // 删除最后一条评论
          this.removeCommentByIndex(this.comments.length-1)
          break;
        case 3:  // 确定删除输入的评论
          if (deleteCommentIndexArr.length > 0) {
            this.removeCommentsByIndices(deleteCommentIndexArr)
          }
          break;
      }

      MNUtil.undoGrouping(()=>{
        this.refresh()
      })
    }
  )
}

/**
 * 先删除评论再移动新内容
 * 
 * 两个参数和 moveNewContentTo 函数的参数相同
 * @param {String} target 新内容移动的位置
 * @param {boolean} [toBottom=true] 默认移动到底部
 */
MNNote.prototype.deleteCommentsByPopupAndMoveNewContentTo = function(target, toBottom= true){
  UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
    "先删除评论",
    "支持:\n- 单个序号: 1,2,3\n- 范围: 1-4 (删除第1到第4条)\n- 特殊字符: X(倒数第3条), Y(倒数第2条), Z(最后一条)\n- 组合使用: 1,3-5,Y,Z\n\n用中文或英文逗号、分号分隔",
    2,
    "取消",
    [
      "第1️⃣条评论",
      "最后一条评论",
      "确定删除输入的评论"
    ],
    (alert, buttonIndex) => {
      let userInput = alert.textFieldAtIndex(0).text;
      let deleteCommentIndexArr = userInput ? userInput.parseCommentIndices(this.comments.length) : []
      switch (buttonIndex) {
        case 1:  // 删除第一条评论
          this.removeCommentByIndex(0)
          break;
        case 2:  // 删除最后一条评论
          this.removeCommentByIndex(this.comments.length-1)
          break;
        case 3:  // 确定删除输入的评论
          if (deleteCommentIndexArr.length > 0) {
            this.removeCommentsByIndices(deleteCommentIndexArr)
          }
          break;
      }

      this.moveNewContentTo(target, toBottom)

      MNUtil.undoGrouping(()=>{
        this.refresh()
      })
    }
  )
}

/**
 * 根据类型去掉评论
 */
MNNote.prototype.removeCommentsByTypes = function(types){
  if (typeof types == "string") {
    // 兼容 types 本身是字符串的情形
    this.removeCommentsByOneType(types)
  } else {
    if (Array.isArray(types)) {
      types.forEach(type => {
        this.removeCommentsByOneType(type)
      });
    }
  }
}

MNNote.prototype.removeCommentsByType = function(type){
  this.removeCommentsByTypes(type)
}

/**
 * @param {String} type
 */
MNNote.prototype.removeCommentsByOneType = function(type){
  if (typeof type == "string") {
    switch (type) {
      /**
       * 链接
       */
      case "link":
      case "links":
      case "Link":
      case "Links":
      case "alllink":
      case "alllinks":
      case "allLink":
      case "allLinks":
        for (let i = this.comments.length-1; i >= 0; i--) {
          let comment = this.comments[i]
          if (
            comment.type == "TextNote" &&
            (
              comment.text.includes("marginnote3") ||
              comment.text.includes("marginnote4")
            )
          ) {
            this.removeCommentByIndex(i)
          }
        }
        break;
      
      /**
       * 手写
       */
      case "paint":
      case "painting":
      case "Paint":
      case "Painting":
      case "Handwriting":
      case "HandWriting":
      case "handwriting":
        for (let i = this.comments.length-1; i >= 0; i--) {
          let comment = this.comments[i]
          if (
            comment.type == "PaintNote"
          ) {
            this.removeCommentByIndex(i)
          }
        }
        break;

      /**
       * 所有文本（不包括链接）
       */
      case "text":
      case "Text":
      case "alltext":
      case "allText":
        for (let i = this.comments.length-1; i >= 0; i--) {
          let comment = this.comments[i]
          if (
            comment.type == "HtmlNote" ||
            (
              comment.type == "TextNote" &&
              !(
                comment.text.includes("marginnote3") ||
                comment.text.includes("marginnote4")
              )
            )
          ) {
            this.removeCommentByIndex(i)
          }
        }
        break;

      /**
       * Markdown 文本
       */
      case "markdown":
      case "Markdown":
      case "md":
      case "MD":
      case "MarkdownText":
      case "mdtext":
      case "MdText":
      case "mdText":
      case "Mdtext":
      case "Markdowntext":
        for (let i = this.comments.length-1; i >= 0; i--) {
          let comment = this.comments[i]
          if (
            comment.type == "TextNote" &&
            !(
              comment.text.includes("marginnote3") ||
              comment.text.includes("marginnote4")
            )
          ) {
            this.removeCommentByIndex(i)
          }
        }
        break;

      /**
       * Html 文本
       */
      case "html":
      case "Html":
      case "HTML":
      case "HtmlText":
      case "htmltext":
      case "Htmltext":
      case "htmlText":
        for (let i = this.comments.length-1; i >= 0; i--) {
          let comment = this.comments[i]
          if (
            comment.type == "HtmlNote"
          ) {
            this.removeCommentByIndex(i)
          }
        }
        break;

      /**
       * 摘录
       */
      case "excerpt":
      case "excerpts":
      case "Excerpt":
      case "Excerpts":
      case "LinkNote":
      case "LinkNotes":
      case "linknote":
      case "linknotes":
        for (let i = this.comments.length-1; i >= 0; i--) {
          let comment = this.comments[i]
          if (
            comment.type == "LinkNote"
          ) {
            this.removeCommentByIndex(i)
          }
        }
        break;

      default:
        MNUtil.showHUD('No "' + type + '" type!')
        break;
    }
  }
}



/**
 * 把 this 合并到 targetNote, 然后移动到 targetIndex 位置
 * 和默认合并不同的是：this 的标题不会合并为标题，而是变成评论
 * 
 * @param {MNNote} targetNote 
 * @param {Number} targetIndex 
 */
MNNote.prototype.mergeIntoAndMove = function(targetNote, targetIndex, htmlType = "none"){
  // let commentsLength = this.comments.length
  // if (this.title) {
  //   commentsLength += 1  // 如果有标题的话，合并后会处理为评论，所以要加 1
  // }
  // if (this.excerptText) {
  //   commentsLength += 1  // 如果有摘录的话，合并后也会变成评论，所以要加 1
  // }

  // 要把 targetNote 的这一条链接去掉，否则会多移动一条评论
  let commentsLength = this.comments.length + !!this.title + !!this.excerptText - (this.comments && this.comments[0].text && this.comments[0].text == targetNote.noteURL)

  this.mergeInto(targetNote, htmlType)

  // 生成从 targetNote.comments.length - commentsLength 到 targetNote.comments.length - 1 的数组
  let targetNoteCommentsToMoveArr = [...Array(commentsLength)].map((_, i) => targetNote.comments.length - commentsLength + i)

  targetNote.moveCommentsByIndexArr(targetNoteCommentsToMoveArr, targetIndex)
}

/**
 * 更新占位符的内容
 */
MNNote.prototype.mergIntoAndRenewReplaceholder = function(targetNote, htmlType = "none"){
  let targetIndex = targetNote.getCommentIndex(this.noteURL)
  if (targetIndex !== -1) {
    // if (this.comments[0].text && this.comments[0].text == targetNote.noteURL) {
    //   // 此时表示的情景：从某个命题双向链接到空白处，生成的占位符
    //   // 所以合并前把第一条评论删掉

    //   // bug: 删掉的话，下一步就无法根据这条评论来改变 point 和 subpoint 了
    //   /  fix: 把这个删除放到 mergeInto 里
    //   this.removeCommentByIndex(0)
    // }
    if (this.title.startsWith("【占位】")){
      this.title = ""
    }
    this.mergeIntoAndMove(targetNote, targetIndex +1, htmlType)
    targetNote.removeCommentByIndex(targetIndex) // 删除占位符
  }
}


/**
 * 判断卡片中是否有某个链接
 */
MNNote.prototype.hasLink = function(link){
  if (link.ifNoteIdorURL()) {
    let URL = link.toNoteURL()
    return this.getCommentIndex(URL) !== -1
  }
}

/**
 * 判断链接的类型：是单向链接还是双向链接
 * @param {string} link
 * @returns {String} "Double"|"Single"
 */
MNNote.prototype.LinkGetType = function(link){
  // 兼容一下 link 是卡片 comment 的情形
  if (MNUtil.isObj(link) && link.type == "TextNote") {
    link = link.text
  }
  if (link.ifNoteIdorURL()) {
    // 先确保参数是链接的 ID 或者 URL
    let linkedNoteId = link.toNoteID()
    let linkedNoteURL = link.toNoteURL()
    if (this.hasLink(linkedNoteURL)) {
      let linkedNote = MNNote.new(linkedNoteId)
      return linkedNote.hasLink(this.noteURL) ? "Double" : "Single"
    } else {
      MNUtil.showHUD("卡片中没有此链接！")
      return "NoLink"
    }
  } else {
    MNUtil.showHUD("参数不是合法的链接 ID 或 URL！")
  }
}

/**
 * 是否是单向链接
 * @param {string} link
 * @returns {Boolean}
 */
MNNote.prototype.LinkIfSingle = function(link){
  return this.LinkGetType(link) === "Single"
}

/**
 * 是否是双向链接
 * @param {string} link
 * @returns {Boolean}
 */
MNNote.prototype.LinkIfDouble = function(link){
  return this.LinkGetType(link) === "Double"
}




MNNote.prototype.renewHtmlCommentFromId = function(comment, id) {
  if (typeof comment == "string") {
    let index = this.getHtmlCommentIndex(comment)
    if (index !== -1){
      this.removeCommentByIndex(index)
      this.mergeClonedNoteFromId(id)
      this.moveComment(this.comments.length-1, index)
    }
  } else {
    MNUtil.showHUD("只能更新文本类型的评论！")
  }
}

MNNote.prototype.renewHtmlCommentById = function(comment, id) {
  this.renewHtmlCommentFromId(comment, id)
}

MNNote.prototype.mergeClonedNoteFromId = function(id){
  let note = MNNote.clone(id)
  this.merge(note.note)
}

MNNote.prototype.mergeClonedNoteById = function(id){
  this.mergeClonedNoteFromId(id)
}

/**
 * 根据内容删除文本评论
 */
MNNote.prototype.removeCommentsByContent = function(content){
  this.removeCommentsByText(content)
}

MNNote.prototype.removeCommentsByTrimContent = function(content){
  this.removeCommentsByText(content)
}

MNNote.prototype.removeCommentsByText = function(text){
  if (typeof text == "string") {
    this.removeCommentsByOneText(text)
  } else {
    if (Array.isArray(text)) {
      text.forEach(t => {
        this.removeCommentsByOneText(t)
      })
    }
  }
}

MNNote.prototype.removeCommentsByTrimText = function(text){
  if (typeof text == "string") {
    this.removeCommentsByOneTrimText(text)
  } else {
    if (Array.isArray(text)) {
      text.forEach(t => {
        this.removeCommentsByOneTrimText(t)
      })
    }
  }
}

// aux function
MNNote.prototype.removeCommentsByOneText = function(text){
  if (typeof text == "string") {
    for (let i = this.comments.length-1; i >= 0; i--) {
      let comment = this.comments[i]
      if (
        (
          comment.type == "TextNote" ||
          comment.type == "HtmlNote"
        )
        &&
        comment.text == text
      ) {
        this.removeCommentByIndex(i)
      }
    }
  }
}

MNNote.prototype.removeCommentsByOneTrimText = function(text){
  if (typeof text == "string") {
    for (let i = this.comments.length-1; i >= 0; i--) {
      let comment = this.comments[i]
      if (
        (
          comment.type == "TextNote" ||
          comment.type == "HtmlNote"
        )
        &&
        comment.text.trim() == text
      ) {
        this.removeCommentByIndex(i)
      }
    }
  }
}

/**
 * 刷新卡片
 */
// refresh(){
//   this.note.appendMarkdownComment("")
//   this.note.removeCommentByIndex(this.note.comments.length-1)
// }

MNNote.prototype.refresh = async function(delay = 0){
  if (delay) {
    await MNUtil.delay(delay)
  }
  this.note.appendMarkdownComment("")
  this.note.removeCommentByIndex(this.note.comments.length-1)
}


MNNote.prototype.clearFailedLinks = function(){
  for (let i = this.comments.length-1; i >= 0; i--) {
    let comment = this.comments[i]
    if  (
      comment.type == "TextNote" &&
      (
        comment.text.startsWith("marginnote3app://note/") ||
        comment.text.startsWith("marginnote4app://note/") 
      )
    ) {
      let targetNoteId = comment.text.match(/marginnote[34]app:\/\/note\/(.*)/)[1]
      if (!targetNoteId.includes("/summary/")) {  // 防止把概要的链接删掉了
        let targetNote = MNNote.new(targetNoteId)
        if (!targetNote) {
          this.removeCommentByIndex(i)
        }
      }
    }
  }
}


// 修复合并造成的链接问题
MNNote.prototype.fixProblemLinks = function(){
  let comments = this.MNComments
  comments.forEach((comment) => {
    // 添加安全检查，修复赋值错误
    if (comment && comment.type === "linkComment") {
      let targetNote = MNNote.new(comment.text)
      if (targetNote && targetNote.groupNoteId) {
        if (
          targetNote.groupNoteId !== comment.text
        ) {
          comment.text = targetNote.groupNoteId.toNoteURL()
        }
      }
    }
  })
}

MNNote.prototype.linkRemoveDuplicatesAfterIndex = function(startIndex){
  let links = new Set()
  if (startIndex < this.comments.length-1) {
    // 下面先有内容才处理
    for (let i = this.comments.length-1; i > startIndex; i--){
      let comment = this.comments[i]
      if (
        comment.type = "TextNote" && comment.text &&
        comment.text.includes("marginnote4app://note/")
      ) {
        if (links.has(comment.text)) {
          this.removeCommentByIndex(i)
        } else {
          links.add(comment.text)
        }
      }
    }
  }
}




/**
 * 将某一个 Html 评论到下一个 Html 评论之前的内容（不包含下一个 Html 评论）进行移动
 * 将 Html 评论和下方的内容看成一整个块，进行移动
 * 注意此函数会将 Html 评论和下方的内容一起移动，而不只是下方内容
 * @param {String} htmltext Html 评论，定位的锚点
 * @param {Number} toIndex 目标 index
 */
MNNote.prototype.moveHtmlBlock = function(htmltext, toIndex) {
  if (this.getHtmlCommentIndex(htmltext) !== -1) {
    let htmlBlockIndexArr = this.getHtmlBlockIndexArr(htmltext)
    this.moveCommentsByIndexArr(htmlBlockIndexArr, toIndex)
  }
}

/**
 * 移动 HtmlBlock 到最下方
 * @param {String} htmltext Html 评论，定位的锚点
 */
MNNote.prototype.moveHtmlBlockToBottom = function(htmltext){
  this.moveHtmlBlock(htmltext, this.comments.length-1)
}

/**
 * 移动 HtmlBlock 到最上方
 * @param {String} htmltext Html 评论，定位的锚点
 */
MNNote.prototype.moveHtmlBlockToTop = function(htmltext){
  this.moveHtmlBlock(htmltext, 0)
}

/**
 * 获取 Html Block 的索引数组
 */
MNNote.prototype.getHtmlBlockIndexArr = function(htmltext){
  let htmlCommentIndex = this.getHtmlCommentIndex(htmltext)
  let indexArr = []
  if (htmlCommentIndex !== -1) {
    // 获取下一个 html 评论的 index
    let nextHtmlCommentIndex = this.getNextHtmlCommentIndex(htmltext)
    if (nextHtmlCommentIndex == -1) {
      // 如果没有下一个 html 评论，则以 htmlCommentIndex 到最后一个评论作为 block
      for (let i = htmlCommentIndex; i <= this.comments.length-1; i++) {
        indexArr.push(i)
      }
    } else {
      // 有下一个 html 评论，则以 htmlCommentIndex 到 nextHtmlCommentIndex 之间的评论作为 block
      for (let i = htmlCommentIndex; i < nextHtmlCommentIndex; i++) {
        indexArr.push(i)
      }
    }
  }
  return indexArr
}

/**
 * 获取某个 html 评论的下一个 html 评论的索引
 * 若没有下一个 html 评论，则返回 -1
 * 思路：
 *  1. 先获取所有 html 评论的索引 arr
 *  2. 然后看 htmltext 在 arr 里的 index
 *  3. 如果 arr 没有 index+1 索引，则返回 -1；否则返回 arr[index+1]
 * @param {String} htmltext
 */
MNNote.prototype.getNextHtmlCommentIndex = function(htmltext){
  let indexArr = this.getHtmlCommentsIndexArr()
  let htmlCommentIndex = this.getHtmlCommentIndex(htmltext)
  let nextHtmlCommentIndex = -1
  if (htmlCommentIndex !== -1) {
    let nextIndex = indexArr.indexOf(htmlCommentIndex) + 1
    if (nextIndex < indexArr.length) {
      nextHtmlCommentIndex = indexArr[nextIndex]
    }
  }
  return nextHtmlCommentIndex
}

/**
 * 获得所有 html 评论的索引列表
 * @returns {Array}
 */
MNNote.prototype.getHtmlCommentsIndexArr = function(){
  let indexArr = []
  for (let i = 0; i < this.comments.length; i++) {
    let comment = this.comments[i]
    if (comment.type == "HtmlNote") {
      indexArr.push(i)
    }
  }

  return indexArr
}

/**
 * 获得某个文本评论的索引列表
 * @param {String} text 
 */
MNNote.prototype.getTextCommentsIndexArr = function(text){
  let arr = []
  this.comments.forEach((comment, index) => {
    if (comment.type == "TextNote" && comment.text == text) {
      arr.push(index)
    }
  })
  return arr
}

/**
 * 获得某个链接评论的索引列表
 * @param {Object|String} link
 */
MNNote.prototype.getLinkCommentsIndexArr = function(link){
  return this.getTextCommentsIndexArr(MNUtil.getLinkText(link))
}

/**
 * 获取某个 html Block 的下方内容的 index arr
 * 不包含 html 本身
 */
MNNote.prototype.getHtmlBlockContentIndexArr = function(htmltext){
  let arr = this.getHtmlBlockIndexArr(htmltext)
  if (arr.length > 0) {
    arr.shift()  // 去掉 html 评论的 index
  }
  return arr
}

/**
 * 获取 html block 下方的内容 arr
 * 不包含 html 本身
 * 但只能获取 TextNote，比如文字和链接
 */
MNNote.prototype.getHtmlBlockTextContentArr = function(htmltext){
  let indexArr = this.getHtmlBlockContentIndexArr(htmltext)
  let textArr = []
  indexArr.forEach(index => {
    let comment = this.comments[index]
    if (comment.type == "TextNote") {
      textArr.push(comment.text)
    }
  })
  return textArr
}

/**
 * 移动某个数组的评论到某个 index
 * 注意往上移动和往下移动情况不太一样
 */
MNNote.prototype.moveCommentsByIndexArr = function(indexArr, toIndex){
  if (indexArr.length !== 0) {
    let max = Math.max(...indexArr)
    let min = Math.min(...indexArr)
    if (toIndex < min) {
      // 此时是往上移动
      for (let i = 0; i < indexArr.length; i++) {
        this.moveComment(indexArr[i], toIndex+i)
      }
    } else if (toIndex > max) {
      // 此时是往下移动
      for (let i = indexArr.length-1; i >= 0; i--) {
        this.moveComment(indexArr[i], toIndex-(indexArr.length-i))
      }
    }
  }
}

/**
 * 批量删除评论
 * @param {Array<number>} indexArr - 要删除的评论索引数组
 */
MNNote.prototype.removeCommentsByIndexArr = function(indexArr) {
  if (indexArr.length === 0) return;
  
  // 从大到小排序，避免删除时索引变化
  const sortedIndices = [...indexArr].sort((a, b) => b - a);
  
  sortedIndices.forEach(index => {
    this.removeCommentByIndex(index);
  });
}

/**
 * 获取 Html 评论的索引
 * @param {String} htmlcomment 
 */
MNNote.prototype.getHtmlCommentIndex = function(htmlcomment) {
  const comments = this.note.comments
  for (let i = 0; i < comments.length; i++) {
    const _comment = comments[i]
    if (
      typeof htmlcomment == "string" &&
      _comment.type == "HtmlNote" &&
      _comment.text == htmlcomment
    ) {
      return i
    }
  }
  return -1
}

/**
 * 刷新卡片及其父子卡片
 */
MNNote.prototype.refreshAll = async function(delay = 0){
  if (delay) {
    await MNUtil.delay(delay)
  }
  if (this.descendantNodes.descendant.length > 0) {
    this.descendantNodes.descendant.forEach(descendantNote => {
      descendantNote.refresh()
    })
  }
  if (this.ancestorNodes.length > 0) {
    this.ancestorNodes.forEach(ancestorNote => {
      ancestorNote.refresh()
    })
  }
  this.refresh()
}

MNNote.prototype.getIncludingCommentIndex = function(comment,includeHtmlComment = false) {
  const comments = this.note.comments
  for (let i = 0; i < comments.length; i++) {
    const _comment = comments[i]
    if (typeof comment == "string") {
      if (includeHtmlComment) {
        if ((_comment.type == "TextNote" || _comment.type == "HtmlNote" )&& _comment.text.includes(comment)) return i
      }else{
        if (_comment.type == "TextNote" && _comment.text.includes(comment)) return i
      }
    } else if (
      _comment.type == "LinkNote" &&
      _comment.noteid == comment.noteId
    )
      return i
  }
  return -1
}

/**
 * 【数学】定义类卡片的增加模板
 * @param {string} type 需要生成的归类卡片的类型
 */
MNNote.prototype.addClassificationNoteByType = function(type, title=""){
  /**
   * 生成归类卡片
   */
  let classificationNote = this.addClassificationNote(title)

  /**
   * 修改标题
   */
  classificationNote.changeTitle(type)

  /**
   * [Done：主要的处理]与定义类卡片进行链接，并防止后续归类后重新链接时导致归类卡片中定义卡片的链接被删除
   * 主要要修改 linkParentNote
   */
  classificationNote.linkParentNote()

  classificationNote.focusInMindMap(0.2)

  return classificationNote
}

/**
 * 
 * @returns {MNNote} 生成的归类卡片
 */
MNNote.prototype.addClassificationNote = function(title="") {
  // let classificationNote = this.createEmptyChildNote(0,title)
  // classificationNote.mergeClonedNoteFromId("8853B79F-8579-46C6-8ABD-E7DE6F775B8B")
  let classificationNote = MNNote.clone("68CFDCBF-5748-448C-91D0-7CE0D98BFE2C")
  classificationNote.title = title
  MNUtil.undoGrouping(()=>{
    this.addChild(classificationNote)
  })
  return classificationNote
}


/**
 * 
 * 复制当前卡片
 * @param {String} title 
 * @param {Number} colorIndex 
 * @returns duplicatedNote
 * 
 * 但是目前只能复制一般文本、markdown 文本内容
 */
MNNote.prototype.createDuplicatedNote = function(title = this.title, colorIndex = this.colorIndex){
  let config = {
    title: title,
    // content: content,
    markdown: true,
    color: colorIndex
  }

  let duplicatedNote = this.parentNote.createChildNote(config)

  let oldComments = MNComment.from(this)

  oldComments.forEach(oldComment => {
    switch (oldComment.type) {
      case "linkComment":
      case "markdownComment":
        duplicatedNote.appendMarkdownComment(oldComment.text)
        break;
      case "textComment":
        duplicatedNote.appendTextComment(oldComment.text)
        break;
    }
  })

  return duplicatedNote
}

/**
 * 复制卡片后删除原卡片
 * @param {String} title 
 * @param {Number} colorIndex 
 * @returns duplicatedNote
 */
MNNote.prototype.createDuplicatedNoteAndDelete = function(title = this.title, colorIndex = this.colorIndex) {
  let duplicatedNote = this.createDuplicatedNote(title, colorIndex)
  this.delete()

  return duplicatedNote
}

/**
 * 判断文献卡片是否需要移动位置
 */
MNNote.prototype.ifReferenceNoteToMove = function(){
  let parentNote = this.parentNote
  return !["785225AC-5A2A-41BA-8760-3FEF10CF4AE0","49102A3D-7C64-42AD-864D-55EDA5EC3097"].includes(parentNote.noteId)
}

/**
 * 最后两个评论的内容类型
 * 
 * 1. 文本 + 链接 => "text-link"
 * 2. 链接 + 链接 => "link-link"
 */
MNNote.prototype.lastTwoCommentsType = function(){
  let comments = this.comments
  if (comments.length < 2) {
    return undefined
  } else {
    let lastComment = comments[comments.length-1]
    let secondLastComment = comments[comments.length-2]
    if (
      secondLastComment.type == "TextNote" &&
      !secondLastComment.text.ifLink() &&
      lastComment.text.ifLink()
    ) {
      return "text-link"
    } else if (
      lastComment.text.ifLink()
    ) {
      return "other-link"
    } else {
      return undefined
    }
  }
}

MNNote.prototype.renewContentPointsToHtmlType = function(htmlType = "none") {
  if (htmlType == undefined) { htmlType = "none" }
  let comments = this.MNComments
  for (let i = this.comments.length-1; i >= 0; i--) {
    let comment = comments[i]
    // if (comment.type == "markdownComment" && comment.text.startsWith("- ") && !(comment.text.startsWith("- -"))) {
    //   comment.text = HtmlMarkdownUtils.createHtmlMarkdownText(comment.text.slice(2).trim(), htmlType)
    // }
    if (comment.type === "markdownComment") {
      const { count, remaining } = HtmlMarkdownUtils.parseLeadingDashes(comment.text);
      if (count >= 1 && count <= 5) {
        let adjustedType = htmlType;
        for (let i = 1; i < count; i++) {
          adjustedType = HtmlMarkdownUtils.getSpanNextLevelType(adjustedType);
        }
        comment.text = HtmlMarkdownUtils.createHtmlMarkdownText(remaining, adjustedType);
      }
    }
  }
}

MNNote.prototype.clearAllCommentsButMergedImageComment = function() {
  let comments = this.MNComments
  for (let i = comments.length-1; i >= 0; i--) {
    let comment = comments[i]
    if (!(comment.type == "mergedImageComment")) {
      this.removeCommentByIndex(i)
    }
  }
}

/**
 * 夏大鱼羊 - MNNote prototype 扩展 - 更多方法 - end
 */

/**
 * 夏大鱼羊 - MNUtil 方法重写 - begin
 */

// 重写 MNUtil.getNoteById 方法：默认不显示提示，alert 默认值改为 false
MNUtil.getNoteById = function(noteid, alert = false) {
  let note = this.db.getNoteById(noteid)
  if (note) {
    return note
  } else {
    if (alert) {
      this.copy(noteid)
      // this.showHUD("Note not exist!")  // 注释掉提示
    }
    return undefined
  }
}

/**
 * 夏大鱼羊 - MNUtil 方法重写 - end
 */

/**
 * 夏大鱼羊 - MNNote 方法重写 - begin
 */

// 重写 MNNote.prototype.moveComment 方法：msg 默认值改为 false
MNNote.prototype.moveComment = function(fromIndex, toIndex, msg = false) {
  try {
    let length = this.comments.length;
    let arr = Array.from({ length: length }, (_, i) => i);
    let from = fromIndex
    let to = toIndex
    if (fromIndex < 0) {
      from = 0
    }
    if (fromIndex > (arr.length-1)) {
      from = arr.length-1
    }
    if (toIndex < 0) {
      to = 0
    }
    if (toIndex > (arr.length-1)) {
      to = arr.length-1
    }
    if (from == to) {
      if (msg) {
        MNUtil.showHUD("No change")
      }
      return
    }
    // 取出要移动的元素
    const element = arr.splice(to, 1)[0];
    // 将元素插入到目标位置
    arr.splice(from, 0, element);
    let targetArr = arr
    this.sortCommentsByNewIndices(targetArr)
    return this
  } catch (error) {
    MNNote.addErrorLog(error, "moveComment")
    return this
  }
}

/**
 * 夏大鱼羊 - MNNote 方法重写 - end
 */

/**
 * 夏大鱼羊 - MNComment 方法重写 - begin
 */

// 重写 MNComment text getter：注释掉错误提示
Object.defineProperty(MNComment.prototype, 'text', {
  get: function() {
    if (this.detail.text) {
      return this.detail.text
    }
    if (this.detail.q_htext) {
      return this.detail.q_htext
    }
    // MNUtil.showHUD("No available text")  // 注释掉提示
    return undefined
  },
  configurable: true,
  enumerable: true
});

/**
 * 夏大鱼羊 - MNComment 方法重写 - end
 */


/**
 * MNUtils - 方法重写 - begin
 */
MNUtil.prototype.log = function(log, copy = false){
    if (typeof log == "string") {
      log = {
        message:log,
        level:"INFO",
        source:"Default",
        timestamp:Date.now()
      }
      this.logs.push(log)
      // MNUtil.copy(this.logs)
      if (subscriptionUtils.subscriptionController) {
        subscriptionUtils.subscriptionController.appendLog(log)
      }
      return
    }
    if ("level" in log) {
      log.level = log.level.toUpperCase();
    }else{
      log.level = "INFO";
    }
    if (!("source" in log)) {
      log.source = "Default";
    }
    if (!("timestamp" in log)) {
      log.timestamp = Date.now();
    }
    if ("detail" in log && typeof log.detail == "object") {
      log.detail = JSON.stringify(log.detail,null,2)
    }
    this.logs.push(log)
    subscriptionUtils.subscriptionController.appendLog(log)
    if (copy) {
      this.copy(this.logs)
    }
  }

/**
 * ============================================
 * MNComment 补丁区域
 * 修复官方 mnutils.js 中的 bug
 * ============================================
 */

// 修复 MNComment.prototype.hasBackLink 中的 toNote.linkedNotes 错误
// 当 toNote 为 undefined 时会导致错误：TypeError: undefined is not an object (evaluating 'toNote.linkedNotes')
if (typeof MNComment !== 'undefined' && MNComment.prototype.hasBackLink) {
  // 保存原始方法
  const originalHasBackLink = MNComment.prototype.hasBackLink;
  
  // 重写方法，添加安全检查
  MNComment.prototype.hasBackLink = function() {
    if (this.type === "linkComment") {
      let fromNote = MNNote.new(this.originalNoteId);
      let toNote = this.note;
      
      // 添加 toNote 的存在性检查
      if (!toNote) {
        return false;
      }
      
      // 继续原始逻辑
      if (toNote.linkedNotes && toNote.linkedNotes.length > 0) {
        if (toNote.linkedNotes.some(n => n.noteid === fromNote.noteId)) {
          return true;
        }
      }
    }
    return false;
  };
}
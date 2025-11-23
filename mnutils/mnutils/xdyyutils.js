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

  // MNUtil.log(`📝 updateMarkdownLinksInNote 被调用`);
  // MNUtil.log(`  oldURL: ${oldURL}`);
  // MNUtil.log(`  newURL: ${newURL}`);
  // MNUtil.log(`  处理卡片: ${note.noteTitle || "无标题"} | ID: ${note.noteId}`);

  // 新增：记录所有 markdownComment 的内容
  // // MNUtil.log(`  该卡片的所有 markdownComment:`);
  // let hasMarkdown = false;
  // note.MNComments.forEach((comment, index) => {
  //   if (comment.type === "markdownComment") {
  //     hasMarkdown = true;
  //     MNUtil.log(`    [${index}] type=${comment.type}, 内容: ${comment.text}`);
  //   }
  // });

  // if (!hasMarkdown) {
  //   MNUtil.log(`    (没有找到 markdownComment 类型的评论)`);
  // }

  // 原有的查找和替换逻辑
  let updated = false;
  note.MNComments.forEach((comment, index) => {
    if (comment.type === "markdownComment") {
      let text = comment.text;
      // 检查是否包含目标 URL
      if (text.includes(oldURL)) {
        // MNUtil.log(`  [${index}] 找到包含旧URL的评论:`);
        // MNUtil.log(`    原文: ${text.substring(0, 150)}${text.length > 150 ? '...' : ''}`);
        // 全局替换所有出现的旧 URL (使用 split().join() 避免正则特殊字符问题)
        let newText = text.split(oldURL).join(newURL);
        // MNUtil.log(`    替换后: ${newText.substring(0, 150)}${newText.length > 150 ? '...' : ''}`);
        comment.text = newText;  // 使用 setter 自动调用 replaceWithMarkdownComment
        updated = true;
      }
    }
  });

  // if (!updated) {
  //   MNUtil.log(`  ⚠️ 未找到包含 oldURL 的 markdownComment`);
  // }
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
  // MNUtil.log("=".repeat(30));
  // MNUtil.log("🔄 执行 mergeInto");
  // MNUtil.log(`📍 源卡片: ${this.noteTitle || "无标题"} | ID: ${this.noteId} | URL: ${this.noteURL}`);
  // MNUtil.log(`📍 目标卡片: ${targetNote.noteTitle || "无标题"} | ID: ${targetNote.noteId} | URL: ${targetNote.noteURL}`);

  // 合并之前先更新链接
  this.convertLinksToNewVersion()
  this.cleanupBrokenLinks()
  this.fixMergeProblematicLinks()

  // 记录所有已处理的卡片，避免重复处理
  let processedNoteIds = new Set();
  let oldComments = this.MNComments

  // 记录源卡片的链接情况
  // MNUtil.log("🔗 处理源卡片的 linkComment:");

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
        // MNUtil.log(`  检查链接卡片的 markdownComment:`);
        // linkedNote.MNComments.forEach((c, i) => {
          // if (c.type === "markdownComment" && c.text.includes(this.noteURL)) {
            // MNUtil.log(`    [${i}] 找到包含源卡片URL: ${c.text.substring(0, 100)}${c.text.length > 100 ? '...' : ''}`);
          // }
        // });

        // 更新 linkedNote 中指向 A 的链接评论
        let indexArrInLinkedNote = linkedNote.getLinkCommentsIndexArr(this.noteId.toNoteURL())
        // if (indexArrInLinkedNote.length > 0) {
        //   MNUtil.log(`  找到 ${indexArrInLinkedNote.length} 个反向链接评论，更新为目标卡片`);
        // }
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



// 夏大鱼羊 - end
    
/**
 * 夏大鱼羊 - 字符串函数 - begin
 */

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
 * 覆盖 descendantNodes getter，添加循环引用检测
 *
 * 原因：防止在卡片父子关系中存在循环引用时导致栈溢出
 * 位置：在 xdyyutils.js 中覆盖，避免更新 mnnote.js 时被覆盖
 */
Object.defineProperty(MNNote.prototype, 'descendantNodes', {
  get: function() {
    const { childNotes } = this
    if (!childNotes.length) {
      return {
        descendant: [],
        treeIndex: []
      }
    } else {
      // 🆕 创建一个共享的 visited Set 用于循环检测
      const visited = new Set();

      /**
       * 递归遍历子节点，带循环引用检测
       * @param {MNNote[]} nodes - 节点数组
       * @param {number} level - 当前层级
       * @param {number[]} lastIndex - 上一层的索引
       * @param {{descendant:MNNote[],treeIndex:number[][]}} ret - 返回结果
       * @returns {{descendant:MNNote[],treeIndex:number[][]}}
       */
      function down(
        nodes,
        level = 0,
        lastIndex = [],
        ret = {
          descendant: [],
          treeIndex: []
        }
      ) {
        level++
        nodes.forEach((node, index) => {
          // 🆕 先检测循环引用（必须在访问 childNotes 之前！）
          // 因为 childNotes getter 会递归创建 MNNote 实例，可能触发循环
          const nodeId = node.noteId;
          if (visited.has(nodeId)) {
            MNLog.error({
              message: "检测到循环引用",
              source: "MNNote.descendantNodes",
              detail: {
                nodeId: node.noteId,
                noteTitle: node.noteTitle,
                visitedPath: Array.from(visited),
                currentLevel: level
              }
            });
            return;
          }
          visited.add(nodeId);

          ret.descendant.push(node)
          lastIndex = lastIndex.slice(0, level - 1)
          lastIndex.push(index)
          ret.treeIndex.push(lastIndex)
          if (node.childNotes?.length) {
            down(node.childNotes, level, lastIndex, ret)
          }
        })
        return ret
      }
      return down(childNotes)
    }
  },
  enumerable: true,
  configurable: true
});

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
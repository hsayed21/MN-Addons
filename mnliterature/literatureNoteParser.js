class literatureTemplate {
  /**
   * 文献制卡
   */
  static makeNote() {
    
  }
}

class literatureHtmlUtils {
  /**
   * 获取 span 标签内的内容，i.e. <span>内容</span> 里“内容”的部分
   * 
   * @param {} comment 
   * @returns 
   */
  static getSpanContent(comment) {
    let text
    switch (MNUtil.typeOf(comment)) {
      case "string":
        text = comment
        break;
      default:
        text = comment.text?comment.text:""
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
   * 正则匹配获取 span 的 id 属性值
   * 
   */
  static getSpanId(comment) {
    let span
    switch (MNUtil.typeOf(comment)) {
      case "string":
        span = comment
        break;
      default:
        span = comment.text?comment.text:""
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
   * 文献元数据字段样式
   */
  static fieldStyle = "display: inline-flex; align-items: center; gap: 5px; background: #fff3e0; padding: 3px 8px; border-radius: 20px;"

  /**
   * 生成 Htmlmarkdown 评论
   */
  static createHtmlMarkdownText(style, content, id = null) {
    if (id) {
      return `<span id="${id}" style="${style} ">${content}</span>`;
    } else {
      return `<span style="${style} ">${content}</span>`;
    }
  }
}

/**
 * 字段解析
 */
class literatureFieldParser {

}



/**
 * 文献解析
 * 
 * 1. 论文
 * 2. 书作
 */
class literatureParser {
  static types = {
    paper: {
      name: "论文",
      englishName: "paper",
      templateNoteId: "",
      colorIndex: 0
    },
    book: {
      name: "书作",
      englishName: "book",
      templateNoteId: "",
      colorIndex: 0
    }
  }

  /**
   * 元数据字段
   */
  static fields = {
    author: {
      emoji: "👨‍🎓",
      name: "作者"
    },
    year: {},
    journal: {},
    publisher: {},
    isbn: {},
    doi: {},
    url: {},
    abstract: {},
    comment: {},
  }


  /**
   * 解析标题
   */
  static parseTitle(note) {

  }


  /**
   * 解析所有评论
   */
  static parseComments(note) {

  }

  /**
   * 解析元数据
   */
  static parseMetadata(note) {

  }


  /**
   * 增加元数据字段 + 内容
   */

  /**
   * 修改元数据字段 + 内容
   */

  /**
   * 修改元数据顺序
   */

  /**
   * 修改元数据内容
   */
}


/**
 * 作者解析
 */
class literatureAuthorParser {

}

/**
 * 期刊解析
 */
class literatureJournalParser {

}

/**
 * 出版社解析
 */
class literaturePublisherParser {
  
}

/**
 * 系列解析
 */
class literatureSeriesParser {

}

/**
 * 关键词解析
 */
class literatureKeywordsParser {

}

/**
 * 封面解析器
 * 用于从文献笔记中提取第一个 mergedImageComment 作为封面
 */
class literatureCoverParser {
  /**
   * 从笔记中解析封面
   * @param {MbBookNote} note - MarginNote 笔记对象
   * @returns {Object|null} 封面对象 {hash, base64, width, height} 或 null
   */
  static parseCover(note) {
    if (!note || !note.comments || note.comments.length === 0) {
      return null;
    }

    try {
      // 查找第一个 mergedImageComment
      const coverComment = this.getCoverFromComments(note.comments);

      if (!coverComment) {
        return null;
      }

      // 构建封面对象
      return this.buildCoverObject(coverComment);

    } catch (error) {
      MNUtil.log(`[literatureCoverParser] 解析封面失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 从评论列表中查找第一个 mergedImageComment
   * @param {Array} comments - 评论数组
   * @returns {Object|null} 第一个 mergedImageComment 或 null
   */
  static getCoverFromComments(comments) {
    for (const comment of comments) {
      // 检查是否为 LinkNote 类型（mergedImageComment 的基础类型）
      if (comment.type !== "LinkNote") {
        continue;
      }

      // 检查是否包含图片信息
      if (!comment.q_hpic || !comment.q_hpic.paint) {
        continue;
      }

      // 使用 MNComment.getCommentType 获取细分类型
      const commentType = MNComment.getCommentType(comment);

      // 检查是否为 mergedImageComment 相关类型
      if (commentType === "mergedImageComment" ||
          commentType === "mergedImageCommentWithDrawing") {
        return comment;
      }
    }

    return null;
  }

  /**
   * 从评论构建完整的封面对象
   * @param {Object} comment - mergedImageComment 对象
   * @returns {Object|null} 封面对象 {hash, base64, width, height}
   */
  static buildCoverObject(comment) {
    try {
      // 获取图片 hash
      const imageHash = comment.q_hpic.paint;

      if (!imageHash) {
        return null;
      }

      // 通过 hash 获取图片数据
      const imageData = MNUtil.getMediaByHash(imageHash);

      if (!imageData) {
        MNUtil.log(`[literatureCoverParser] 无法获取图片数据: ${imageHash}`);
        return null;
      }

      // 获取图片尺寸
      const image = UIImage.imageWithData(imageData);
      const imageSize = image.size;

      // 转换为 base64
      const base64String = imageData.base64Encoding();

      // 返回完整封面对象
      return {
        hash: imageHash,
        base64: base64String,
        width: imageSize.width,
        height: imageSize.height
      };

    } catch (error) {
      MNUtil.log(`[literatureCoverParser] 构建封面对象失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 批量解析多个笔记的封面
   * @param {Array<MbBookNote>} notes - 笔记数组
   * @returns {Map} noteId -> cover 对象的映射
   */
  static parseBatchCovers(notes) {
    const coverMap = new Map();

    for (const note of notes) {
      if (!note || !note.noteId) {
        continue;
      }

      const cover = this.parseCover(note);
      if (cover) {
        coverMap.set(note.noteId, cover);
      }
    }

    return coverMap;
  }
}
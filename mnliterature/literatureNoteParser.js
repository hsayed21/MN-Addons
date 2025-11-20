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
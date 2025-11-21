/**
 * 夏大鱼羊自定义菜单注册表
 * 用于解耦菜单模板定义，避免修改 utils.js
 * 严格按照原始 template 函数的内容
 */

// 创建全局注册表
if (typeof global === "undefined") {
  var global = {};
}

// 初始化菜单注册表
global.customMenuTemplates = {};

/**
 * 注册自定义菜单模板
 * @param {string} name - 菜单名称
 * @param {Object} template - 菜单模板对象
 */
global.registerMenuTemplate = function (name, template) {
  global.customMenuTemplates[name] = template;
  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log(`📦 已注册菜单模板: ${name}`);
  }
};

/**
 * 获取菜单模板
 * @param {string} name - 菜单名称
 * @returns {Object|null} 菜单模板对象
 */
global.getMenuTemplate = function (name) {
  return global.customMenuTemplates[name] || null;
};

/**
 * 注册所有自定义菜单模板
 * 严格按照原始 template(action) 函数中的 case 语句内容
 */
function registerAllMenuTemplates() {
  // menu_comment
  global.registerMenuTemplate("menu_comment", {
    // 单击：打开可视化评论管理器
    action: "openCommentManagerWebview",
    onLongPress: {
      action: "menu",
      menuWidth: 300,
      menuItems: [
        "🪟 旧版弹窗",
        {
          action: "manageCommentsByPopup",
          menuTitle: "    打开旧版评论弹窗",
        },
        "✂️ 拆分评论",
        {
          action: "splitComments",
          menuTitle: "    拆分卡片评论为独立卡片",
        },
        "🔗 链接处理",
        {
          action: "removeBidirectionalLinks",
          menuTitle: "    删除双向链接",
        },
        {
          action: "updateBidirectionalLink",
          menuTitle: "    更新链接",
        },
        {
          action: "showMarkdownLinksInField",
          menuTitle: "    查看 Markdown 链接",
        },
        {
          action: "linkRemoveDuplicatesAfterApplication",
          menuTitle: "    \"应用\"下方的链接去重",
        },
        {
          action: "reorderContainsFieldLinks",
          menuTitle: "    定义卡片\"相关链接\"下方的链接重新排序",
        },
        "⬇️ 字段处理",
        {
          action: "replaceFieldContentByPopup",
          menuTitle: "    替换字段",
        },
        {
          action: "retainFieldContentOnly",
          menuTitle: "    保留某个字段内容",
        },
        "❌ 删除评论",
        {
          action: "clearContentKeepExcerptWithTitle",
          menuTitle: "    只保留摘录和标题",
        },
        {
          action: "clearContentKeepExcerpt",
          menuTitle: "    只保留摘录，无标题",
        },
        "⬇️ 移动最后 1️⃣ 条评论",
        {
          action: "moveLastCommentToBelongArea",
          menuTitle: "    移动到所属区",
        },
        {
          action: "moveLastCommentToProofAreaTop",
          menuTitle: "    🔝 移动到证明区顶部",
        },
        {
          action: "moveLastCommentToProofAreaBottom",
          menuTitle: "    ▼ 移动到证明区底部",
        },
        "⬇️ 移动最后 2️⃣ 条评论",
        {
          action: "moveLastTwoCommentsToProofAreaTop",
          menuTitle: "    🔝 移动到证明区顶部",
        },
        {
          action: "moveLastTwoCommentsToProofAreaBottom",
          menuTitle: "    ▼ 移动到证明区底部",
        }
      ],
    },
  });

  // menu_think
  global.registerMenuTemplate("menu_think", {
    action: "moveUpThoughtPointsToBottom",
    onLongPress: {
      action: "menu",
      menuWidth: 330,
      menuItems: [
        {
          action: "mergeToParentThought",
          menuTitle: "📝 合并为父卡片思考"
        }
      ],
    },
  });

  // menu_study
  global.registerMenuTemplate("menu_study", {
    action: "menu",
    menuWidth: 330,
    menuItems: [
      {
        action: "autoMoveLinksBetweenCards",
        menuTitle: "自动移动卡片之间的链接",
      },
    ],
  });

  // menu_reference
  global.registerMenuTemplate("menu_reference", {
    action: "menu",
    menuItems: [
      {
        action: "menu",
        menuTitle: "➡️ 🧠文献学习",
        menuWidth: 500,
        menuItems: [
          "⬇️ ➕引用",
          {
            action: "referenceRefByRefNumAndFocusInMindMap",
            menuTitle:
              "选中「具体引用」卡片+输入文献号→ ➕引用 + 剪切归类 + 主视图定位",
          },
          {
            action: "referenceRefByRefNumAddFocusInFloatMindMap",
            menuTitle:
              "选中「具体引用」卡片+输入文献号→ ➕引用 + 剪切归类 + 浮窗定位",
          },
          "⬇️ ➕「具体引用情况」汇总卡片",
          {
            action: "referenceCreateClassificationNoteByIdAndFocusNote",
            menuTitle:
              "选中「参考文献摘录」卡片+输入文献号→ 「具体引用情况」汇总卡片 + 浮窗定位",
          },
        ],
      },
      {
        action: "menu",
        menuTitle: "➡️ 参考文献 🆔",
        menuItems: [
          {
            action: "menu",
            menuTitle: "👉 当前文档相关 🆔 录入",
            menuWidth: 350,
            menuItems: [
              {
                action: "referenceStoreIdForCurrentDocByFocusNote",
                // menuTitle: "当前文档与选中卡片的🆔绑定",
                menuTitle: "绑定「选中的卡片」➡️「当前文档」",
              },
              {
                action: "referenceStoreOneIdForCurrentDocByFocusNote",
                menuTitle: "绑定「选中的卡片」➡️ 文献号",
              },
              {
                action: "referenceTestIfIdInCurrentDoc",
                menuTitle: "检测文献号的🆔绑定",
              },
            ],
          },
          {
            action: "menu",
            menuTitle: "➡️ 导出 🆔",
            menuWidth: 250,
            menuItems: [
              {
                action: "referenceExportReferenceIdsToClipboard",
                menuTitle: "导出参考文献卡片🆔到剪切板",
              },
              {
                action: "referenceExportReferenceIdsToFile",
                menuTitle: "导出参考文献卡片🆔到文件",
              },
            ],
          },
          {
            action: "menu",
            menuTitle: "⬅️ 导入 🆔",
            menuWidth: 250,
            menuItems: [
              {
                action: "referenceInputReferenceIdsFromClipboard",
                menuTitle: "从剪切板导入参考文献卡片🆔",
              },
              {
                action: "referenceInputReferenceIdsFromFile",
                menuTitle: "从文件导入参考文献卡片🆔",
              },
            ],
          },
        ],
      },
      {
        action: "menu",
        menuTitle: "➡️ 🗂️文献卡片",
        menuItems: [
          {
            action: "referenceInfoAuthor",
            menuTitle: "👨‍🎓 作者",
          },
          {
            action: "referenceInfoYear",
            menuTitle: "⌛️ 年份",
          },
          {
            action: "referenceInfoJournal",
            menuTitle: "📄 期刊",
          },
          {
            action: "referenceInfoPublisher",
            menuTitle: "📚 出版社",
          },
          {
            action: "referenceInfoKeywords",
            menuTitle: "📌 关键词",
          },
          {
            action: "referenceInfoDoiFromClipboard",
            menuTitle: "🔢 DOI",
          },
          {
            action: "menu",
            menuTitle: "➡️ 🔗 引用样式",
            menuItems: [
              {
                action: "referenceInfoRefFromInputRefNum",
                menuTitle: "输入文献号录入引用样式",
              },
              {
                action: "referenceInfoRefFromFocusNote",
                menuTitle: "选中摘录自动录入引用样式",
              },
              {
                action: "referenceInfoInputRef",
                menuTitle: "手动输入引用样式",
              },
            ],
          },
          {
            action: "menu",
            menuTitle: "➡️ .bib 信息",
            menuItems: [
              {
                action: "referenceBibInfoPasteFromClipboard",
                menuTitle: "从剪切板粘贴 .bib 信息",
              },
              {
                action: "referenceBibInfoCopy",
                menuTitle: "复制 .bib 信息",
              },
              {
                action: "referenceBibInfoExport",
                menuTitle: "导出 .bib 信息",
              },
            ],
          },
        ],
      },
      {
        action: "menu",
        menuTitle: "➡️ 👨‍🎓作者卡片",
        menuItems: [
          {
            action: "referenceAuthorRenewAbbreviation",
            menuTitle: "更新作者缩写",
          },
          {
            action: "referenceAuthorInfoFromClipboard",
            menuTitle: "粘贴个人信息",
          },
          {
            action: "referenceAuthorNoteMake",
            menuTitle: "作者卡片制卡",
          },
        ],
      },
      {
        action: "menu",
        menuTitle: "➡️ 📄期刊卡片",
        menuItems: [],
      },
      {
        action: "menu",
        menuTitle: "➡️ 📌关键词卡片",
        menuItems: [
          {
            action: "referenceKeywordsAddRelatedKeywords",
            menuTitle: "➕相关关键词",
          },
          {
            action: "referenceGetRelatedReferencesByKeywords",
            menuTitle: "根据关键词筛选文献",
          },
        ],
      },
    ],
  });

  // menu_text
  global.registerMenuTemplate("menu_text", {
    action: "menu",
    menuItems: [
      {
        action: "menu",
        menuTitle: "→ 文档中选中的文本",
        menuItems: [
          {
            action: "selectionTextToTitleCase",
            menuTitle: "标题规范",
          },
          {
            action: "selectionTextToLowerCase",
            menuTitle: "转小写",
          },
          {
            action: "selectionTextHandleSpaces",
            menuTitle: "处理空格",
          },
        ],
      },
      {
        action: "menu",
        menuTitle: "→ 复制的文本",
        menuItems: [
          {
            action: "copiedTextToTitleCase",
            menuTitle: "标题规范",
          },
          {
            action: "copiedTextToLowerCase",
            menuTitle: "转小写",
          },
          {
            action: "copiedTextHandleSpaces",
            menuTitle: "处理空格",
          },
        ],
      },
    ],
  });

  // menu_handtool_text
  global.registerMenuTemplate("menu_handtool_text", {
    action: "selectionTextToTitleCase",
    onLongPress: {
      action: "menu",
      menuItems: [
        {
          action: "selectionTextToTitleCase",
          menuTitle: "标题规范",
        },
        {
          action: "selectionTextToLowerCase",
          menuTitle: "转小写",
        },
        {
          action: "selectionTextHandleSpaces",
          menuTitle: "处理空格",
        },
      ],
    },
  });

  // menu_card
  global.registerMenuTemplate("menu_card", {
    action: "copyMarkdownVersionFocusNoteURL",
    onLongPress: {
      action: "menu",
      menuWidth: 360,
      menuItems: [
        {
          action: "copyFocusNotesURLArr",
          menuTitle: "复制卡片 URL",
        },
        "⬇️ 修改标题",
        {
          action: "removeTitlePrefix",
          menuTitle: "    去掉卡片前缀",
        },
        {
          action: "forceUpdateTitlePrefix",
          menuTitle: "    ⚡ 强制修改标题前缀",
        },
        "---",
        {
          action: "keepExcerptAreaAndTitle",
          menuTitle: "只保留「摘录区」和 ✅「标题」",
        },
        {
          action: "keepExcerptAreaWithoutTitle",
          menuTitle: "只保留「摘录区」❌「标题」",
        },
        {
          action: "clearContentKeepExcerptWithTitle",
          menuTitle: "只保留「摘录」和 ✅「标题」",
        },
        {
          action: "clearContentKeepExcerpt",
          menuTitle: "只保留摘录 ❌ 无标题",
        },
        {
          action: "renewKnowledgeNoteIntoParentNote",
          menuTitle: "🔀 合并重复知识点",
        },
        {
          action: "mergeInSummaryParentNote",
          menuTitle: "🔀 合并到父「Summary」卡片",
        },
        {
          action: "mergeInParentNote",
          menuTitle: "🔀 合并到父卡片",
        },
        {
          action: "mergeApplicationFieldInParentNote",
          menuTitle: "🔀 合并应用字段到父卡片",
        },
        {
          action: "renewExcerptInParentNoteByFocusNote",
          menuTitle: "🔀 摘录替换掉父卡片的摘录",
        },
        {
          action: "descendNotesToBeIndependent",
          menuTitle: "✂️ 子孙卡片独立为单张",
        },
        {
          action: "removeAllClassificationNotes",
          menuTitle: "❌ 删除归类子孙卡片，保留知识点",
        },
        {
          action: "updateDescentNotesPrefixes",
          menuTitle: "🔄 更新「子孙卡片」前缀和链接",
        },
        {
          action: "fixBrokenLinks",
          menuTitle: "🏥 修复失效链接",
        },
        "---------",
        "⬇️ 卡片处理",
        {
          action: "convertNoteToNonexcerptVersion",
          menuTitle: "    🔄 转化为非摘录版本",
        },
        {
          action: "handleOldCardWithoutMakeNote",
          menuTitle: "    旧卡片处理 & 不制卡",
        },
        "⬇️ 定位",
        {
          "action": "focusLastChildNote",
          "menuTitle": "⇨ 定位最后一张子卡片",
        },
        {
          "action": "menu",
          "menuTitle": "⇨ 🚗 卡片移动 ⇦",
          "menuWidth": 250,
          "menuItems": [
            "⇩  ⇩",
            {
              action: "addAsBrotherNoteofParentNote",
              menuTitle: "⇨ 成为父卡片的兄弟卡片",
            },
            {
              action: "sendNotesToInboxArea",
              menuTitle: "⇨ Inbox",
            },
            {
              action: "sendNotesToThinkingArea",
              menuTitle: "⇨ 思考区",
            },
            {
              action: "toBeIndependent",
              menuTitle: "⇨ 独立",
            },
          ]
        },
        {
          action: "addAsBrotherNoteofParentNote",
          menuTitle: "    ⇨ 成为父卡片的兄弟卡片",
        },
        {
          "action": "menu",
          "menuTitle": "⇨ ✂️ 拆卡 ⇦",
          "menuWidth": 200,
          "menuItems": [
            "⇩  ⇩",
            {
              action: "splitMarkdownTextInFocusNote",
              menuTitle: "基于 Markdown 拆卡",
            },
            {
              action: "splitComments",
              menuTitle: "拆分卡片评论为独立卡片",
            },
          ]
        },
        {
          action: "splitComments",
          menuTitle: "    ✂️ 拆分卡片评论为独立卡片",
        },
        {
          "action": "menu",
          "menuTitle": "⇨ 🔄 处理子孙卡片 ⇦",
          "menuWidth": 300,
          "menuItems": [
            "⇩  ⇩",
            {
              action: "updateChildNotesPrefixes",
              menuTitle: "🔄 更新「子卡片」前缀和链接",
            },
            {
              action: "updateDescentNotesPrefixes",
              menuTitle: "🔄 更新「子孙卡片」前缀和链接",
            },
            {
              action: "oldChildrenMakeNotes",
              menuTitle: "🔄 子孙卡片批量制卡",
            },
          ]
        },
        {
          "action": "menu",
          "menuTitle": "⇨ 🔀 合并到父卡片 ⇦",
          "menuWidth": 340,
          "menuItems": [
            "⇩  ⇩",
            {
              action: "mergeInParentNote",
              menuTitle: "    合并到父卡片",
            },
            {
              action: "mergeApplicationFieldInParentNote",
              menuTitle: "    合并「应用」字段到父卡片",
            },
            {
              action: "mergeInParentNoteWithPopup",
              menuTitle: "    合并到父卡片：弹窗选择类型",
            },
            {
              action: "mergIntoParenNoteAndRenewReplaceholder",
              menuTitle: "    合并到父卡片 & 替换占位符",
            },
            {
              action: "mergIntoParenNoteAndRenewReplaceholderWithPopup",
              menuTitle: "    合并到父卡片 & 替换占位符: 弹窗选择类型",
            },
          ]
        },
        {
          "action": "menu",
          "menuTitle": "⇨ 🔄 处理旧卡片 ⇦",
          "menuWidth": 250,
          "menuItems": [
            "⇩  ⇩",
            {
              action: "clearContentKeepExcerptWithTitle",
              menuTitle: "只保留摘录和标题",
            },
            {
              action: "clearContentKeepExcerpt",
              menuTitle: "只保留摘录，无标题",
            },
            {
              action: "forceOldCardMakeNote",
              menuTitle: "强制按旧卡片制卡",
            },
            {
              action: "handleOldCardWithoutMakeNote",
              menuTitle: "旧卡片处理 & 不制卡",
            },
            // {
            //   action: "batchChangeClassificationTitles",
            //   menuTitle: "    批量更新归类卡片标题",
            // },
          ]
        },
        {
          action: "renewKnowledgeNoteIntoParentNote",
          menuTitle: "    🔀 合并重复知识点",
        },
        {
          action: "renewExcerptInParentNoteByFocusNote",
          menuTitle: "    摘录替换掉父卡片的摘录",
        },
        "ℹ️ 获取卡片信息",
        {
          action: "copyFocusNotesIdArr",
          menuTitle: "    复制卡片🆔",
        },
      ],
    },
  });

  // menu_excerpt
  global.registerMenuTemplate("menu_excerpt", {
    action: "moveToExcerptPartBottom",
    onLongPress: {
      action: "menu",
      menuWidth: 350,
      menuItems: [
        "✂️ 修改",
        {
          action: "renewExcerptInParentNoteByFocusNote",
          menuTitle: "    选中的卡片摘录替换掉父卡片的摘录",
        },
        {
          action: "keepExcerptAreaAndTitle",
          menuTitle: "    只保留「摘录区」和 ✅「标题」",
        },
        {
          action: "keepExcerptAreaWithoutTitle",
          menuTitle: "    只保留「摘录区」❌ 无标题",
        },
        {
          action: "clearContentKeepExcerptWithTitle",
          menuTitle: "    只保留「摘录」和 ✅「标题」",
        },
        {
          action: "clearContentKeepExcerpt",
          menuTitle: "    只保留摘录 ❌ 无标题",
        },
        "⬇️ 移动",
        {
          "action": "moveLinksInExcerptToThoughtArea",
          "menuTitle": "    移动摘录区的链接到「相关思考区」",
        },
        "☯️ 合并",
        {
          action: "mergeLastChildToExcerpt",
          menuTitle: "    合并最后一张子卡片到摘录区",
        },
        {
          action: "mergeToPreviousBrotherExcerpt",
          menuTitle: "    合并到前一张兄弟卡片的摘录区",
        },
        {
          action: "mergeToParentAndMoveCommentToExcerpt",
          menuTitle: "    合并到父卡片并移动评论到摘录",
        },
        {
          action: "mergeToParentAndMoveCommentToTop",
          menuTitle: "    合并到父卡片并移动到最顶端",
        },
        {
          action: "mergeExerptAreToParentAndMoveCommentToExcerpt",
          menuTitle: "    合并「摘录区」到父卡片并移动评论到摘录",
        },
      ],
    },
  });


  // menu_makeCards
  global.registerMenuTemplate("menu_makeCards", {
    action: "makeNote",
    doubleClick: {
      action: "doubleClickMakeNote",
    },
    onLongPress: {
      action: "menu",
      menuWidth: 320,
      menuItems: [
        "🪄 制卡",
        {
          action: "makeCardWithoutFocus",
          menuTitle: "    不定位制卡",
        },
        {
          action: "preprocessNote",
          menuTitle: "    预处理制卡",
        },
        {
          action: "clearContentKeepExcerptWithTitleAndMakeCard",
          menuTitle: "    只保留摘录和标题后制卡",
        },
        {
          action: "keepExcerptAreaAndTitleAndMakeCard",
          menuTitle: "    只保留「摘录区」和标题后制卡",
        },
        {
          action: "convertClassificationNoteToDefinitionNote",
          menuTitle: "    归类卡片 ⇒ 定义卡片",
        },
        {
          action: "convertToClassificationNoteDirectly",
          menuTitle: "    直接转为归类卡片",
        },
        {
          action: "convertToClassificationNoteWithPopup",
          menuTitle: "    弹窗 + 转为归类卡片",
        },
        {
          action: "menu",
          menuTitle: "➡️ 文献制卡",
          menuItems: [
            {
              action: "referencePaperMakeCards",
              menuTitle: "📄 论文制卡",
            },
            {
              action: "referenceBookMakeCards",
              menuTitle: "📚 书作制卡",
            },
            {
              action: "referenceSeriesBookMakeCard",
              menuTitle: "📚 系列书作制卡",
            },
            {
              action: "referenceOneVolumeJournalMakeCards",
              menuTitle: "📄 整卷期刊制卡",
            },
            {
              action: "referenceAuthorNoteMake",
              menuTitle: "作者卡片制卡",
            },
          ],
        },
        "🪄 生成卡片",
        {
          action: "addNewIdeaNote",
          menuTitle: "    生成「思路」卡片",
        },
        {
          action: "addNewSummaryNote",
          menuTitle: "    生成「总结」卡片",
        },
        {
          action: "addNewDefinitionNote",
          menuTitle: "    生成「定义」卡片",
        },
        {
          action: "addNewCounterexampleNote",
          menuTitle: "    生成「反例」卡片",
        },
        {
          action: "createEquivalenceNotes",
          menuTitle: "    生成「充分性」和「必要性」卡片",
        },
      ],
    },
  });

  // menu_htmlmdcomment
  global.registerMenuTemplate("menu_htmlmdcomment", {
    action: "addHtmlMarkdownComment",
    onLongPress: {
      action: "menu",
      menuWidth: 300,
      menuItems: [
        "🔢 带序号的评论",
        {
          action: "addCaseComment",
          menuTitle: "    📋 添加 Case 评论（自动编号）",
        },
        {
          action: "addStepComment",
          menuTitle: "    👣 添加 Step 评论（自动编号）",
        },
        {
          action: "changeHtmlMarkdownCommentTypeByPopup",
          menuTitle: "🔄 修改某条 HtmlMD 评论的类型",
        },
        {
          action: "renewContentsToHtmlMarkdownCommentType",
          menuTitle: "🔄 更新文本内容为 HtmlMD 评论",
        },
        "📊 批量调整层级",
        {
          action: "adjustHtmlMDLevelsUp",
          menuTitle: "    ⬆️ 所有层级上移一级",
        },
        {
          action: "adjustHtmlMDLevelsDown",
          menuTitle: "    ⬇️ 所有层级下移一级",
        },
        {
          action: "adjustHtmlMDLevelsByHighest",
          menuTitle: "    🎯 指定最高级别调整层级",
        },
      ],
    },
  });

  // menu_proof
  global.registerMenuTemplate("menu_proof", {
    action: "addProofCheckComment",
    onLongPress: {
      action: "menu",
      menuWidth: 350,
      menuItems: [
        "📊 证明拆分（ProofParser）",
        {
          action: "parseProofMarkdown",
          menuTitle: "    从评论解析证明 Markdown",
        },
        {
          action: "debugProofParser",
          menuTitle: "    🐛 调试：查看 JSON 结构",
        },
        "⬇️ 其他证明功能",
        {
          action: "checkProofInReview",
          menuTitle: "    检查证明区中链接对应的卡片是否加入复习",
        },
        {
          action: "extractProofContentAndSplitComments",
          menuTitle: "    提取证明字段内容并拆分评论为独立卡片",
        },
        {
          action: "upwardMergeWithStyledComments",
          menuTitle: "将子卡片作为证明要点合并 ⇒ ❌ 不移动",
        },
        {
          action: "upwardMergeWithStyledCommentsAndMove",
          menuTitle: "将子卡片作为证明要点合并 ⇒ ✅ 移动到证明区",
        },
        {
          action: "mergeIntoParentNoteAndMoveToProofArea",
          menuTitle: "合并到父卡片 ⇒ 移动到证明区",
        },
        "⬇️ 移动最后 1️⃣ 条评论",
        {
          action: "moveLastCommentToProofAreaTop",
          menuTitle: "    🔝 移动到证明区顶部",
        },
        {
          action: "moveLastCommentToProofAreaBottom",
          menuTitle: "    ▼ 移动到证明区底部",
        },
        "⬇️ 移动最后 2️⃣ 条评论",
        {
          action: "moveLastTwoCommentsToProofAreaTop",
          menuTitle: "    🔝 移动到证明区顶部",
        },
        {
          action: "moveLastTwoCommentsToProofAreaBottom",
          menuTitle: "    ▼ 移动到证明区底部",
        },
        "🔍 OCR",
        {
          action: "ocrAsProofTitle",
          menuTitle: "    OCR >> 设置为标题",
        },
        {
          action: "ocrAsProofTitleWithTranslation",
          menuTitle: "    OCR >> 翻译 >> 设置为标题",
        },
        {
          action: "ocrAllUntitledDescendants",
          menuTitle: "    【批量】OCR >> 设置为标题",
        },
        {
          action: "ocrAllUntitledDescendantsWithTranslation",
          menuTitle: "    【批量】OCR >> 翻译 >> 设置为标题",
        },
        "🌐 翻译",
        {
          action: "translateAllDescendants",
          menuTitle: "    【批量】翻译标题",
        },
        {
          action: "menu",
          menuTitle: "⚙️ 设置",
          menuWidth: 200,
          menuItems: [
            {
              action: "switchOCRSource",
              menuTitle: "切换 OCR 源",
            },
            {
              action: "switchTranslateModel",
              menuTitle: "切换翻译模型",
            },
          ],
        },
      ],
    },
  });

  global.registerMenuTemplate(
    "hideAddonBar",
    JSON.stringify({
      action: "hideAddonBar",
    }),
  );

  // 搜索功能菜单
  global.registerMenuTemplate("menu_search", {
    action: "searchNotesInWebview", // 单击：搜索笔记
    onLongPress: {
      // 长按：显示菜单
      action: "menu",
      menuWidth: 300,
      menuItems: [
        "🔍 搜索功能",
        {
          action: "searchDefinition",
          menuTitle: "    📚 搜索上层定义卡片的目录",
        }
      ],
    },
  });

  // 代码学习菜单
  global.registerMenuTemplate("menu_codeLearning", {
    action: "menu",
    menuWidth: 350,
    menuItems: [
      {
        action: "codeMergeTemplate",
        menuTitle: "📚 代码卡片合并模板"
      },
      {
        action: "codeLearning",
        menuTitle: "📚 代码卡片标题制卡"
      },
      {
        action: "codeAnalysisWithAI", 
        menuTitle: "🤖 AI 代码分析（OCR）"
      },
      {
        action: "codeAnalysisFromComment",
        menuTitle: "📝 AI 代码分析（评论）"
      },
      "⚙️ 设置",
      {
        action: "switchCodeAnalysisModel",
        menuTitle: "    ⚙️ 切换 AI 分析模型"
      },
      {
        action: "switchOCRSource",
        menuTitle: "    ⚙️ 切换 OCR 源"
      }
    ]
  });


  global.registerMenuTemplate("menu_pin", {
    action: "pinToFocusTop",
    onLongPress: {
      // 长按：显示菜单
      action: "menu",
      menuWidth: 300,
      menuItems: [
        {
          action: "pinToFocusBottom",
          menuTitle: "⬇️ 添加到 Focus 底部",
        },
        {
          action: "pinToMidwayTop",
          menuTitle: "⬆️ 添加到中间知识顶部",
        },
        {
          action: "pinToMidwayBottom",
          menuTitle: "⬇️ 添加到中间知识底部",
        },
        {
          action: "pinToToOrganizeTop",
          menuTitle: "⬆️ 添加到待整理顶部",
        },
        {
          action: "pinToToOrganizeBottom",
          menuTitle: "⬇️ 添加到待整理底部",
        },
        {
          action: "pinToDailyTaskTop",
          menuTitle: "⬆️ 添加到日拱一卒顶部",
        },
        {
          action: "pinToDailyTaskBottom",
          menuTitle: "⬇️ 添加到日拱一卒底部",
        },
        {
          action: "temporarilyPinFocusNoteWithTitle",
          menuTitle: "✏️ 自定义标题后添加",
        },
        "---",
        {
          action: "pinCurrentPageToPages",
          menuTitle: "📄 Pin 当前文档页面",
        },
        {
          action: "showPinBoard",
          menuTitle: "📋 打开 Pin 卡片库",
        },
      ]
    }
  });

  global.registerMenuTemplate("menu_classification", {
    action: "searchNotesInWebview",
    onLongPress: {
      action: "menu",
      menuWidth: 420,
      menuItems: [
        {
          action: "AddTemplateOnLastestParentDefinitionAndAddAsChild",
          menuTitle: "最近的上级定义卡片增加模板 & 移动 focusNote 成为子卡片",
        },
        {
          action: "OCRToTitle",
          menuTitle: "OCR 摘录为标题",
        },
        "🔍 OCR 工具",
        {
          action: "menu",
          menuTitle: "➡️ 📝 模式1：直接 OCR (Unicode)",
          menuWidth: 300,
          menuItems: [
            {
              action: "ocrMode1WithTranslation",
              menuTitle: "🌐 翻译版（中英对照）",
            },
            {
              action: "ocrMode1NoTranslationReplaceTitle",
              menuTitle: "📄 原文版（仅中文） → 替换标题",
            },
            {
              action: "ocrMode1NoTranslationAddToFirstHeaderLink",
              menuTitle: "📄 原文版（仅中文） → 加到第一个标题链接词",
            },
            {
              action: "ocrMode1NoTranslationAddToLastHeaderLink",
              menuTitle: "📄 原文版（仅中文） → 加到最后一个标题链接词",
            },
          ],
        },
        {
          action: "menu",
          menuTitle: "➡️ 📄 模式2：Markdown OCR (LaTeX)",
          menuWidth: 300,
          menuItems: [
            {
              action: "ocrMode2WithTranslation",
              menuTitle: "🌐 翻译版（中英对照）",
            },
            {
              action: "ocrMode2NoTranslation",
              menuTitle: "📄 原文版（仅中文）",
            },
          ],
        },
        {
          action: "menu",
          menuTitle: "➡️ 🧠 模式3：智能 OCR（根据卡片类型）",
          menuWidth: 360,
          menuItems: [
            {
              action: "ocrMode3WithTranslation",
              menuTitle: "🌐 翻译版（中英对照）",
            },
            {
              action: "ocrMode3NoTranslation",
              menuTitle: "📄 原文版（仅中文）",
            },
            "---",
            "ℹ️ 智能识别说明",
            {
              action: "",
              menuTitle: "    • 定义类 → 概念提取",
            },
            {
              action: "",
              menuTitle: "    • 研究进展 → 翻译总结",
            },
            {
              action: "",
              menuTitle: "    • 其他 → 直接 OCR",
            },
          ],
        },
      ]
    }
  });

  global.registerMenuTemplate("menu_addTemplate", {
    action: "addTemplate",
    onLongPress: {
      action: "menu",
      menuWidth: 350,
      menuItems: [
        {
          action: "addDefinitionNoteAsParentNote",
          menuTitle: "向上增加定义卡片",
        },
      ]
    }
  });

  global.registerMenuTemplate("menu_proofparse", {
    action: "parseProofMarkdown"
  });

  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log(
      `🚀 已注册 ${Object.keys(global.customMenuTemplates).length} 个自定义菜单模板`,
    );
  }
}

// 扩展 toolbarConfig.template 方法
if (typeof toolbarConfig !== "undefined") {
  // 保存原始的 template 方法
  const originalTemplate = toolbarConfig.template;

  // 重写 template 方法
  toolbarConfig.template = function (action) {
    // 先检查自定义菜单模板
    const customTemplate = global.getMenuTemplate(action);
    if (customTemplate) {
      // 如果是字符串，直接返回
      if (typeof customTemplate === "string") {
        return customTemplate;
      }
      // 如果是对象，转换为JSON字符串
      return JSON.stringify(customTemplate, null, 2);
    }

    // 如果不是自定义模板，调用原始方法
    if (originalTemplate && typeof originalTemplate === "function") {
      return originalTemplate.call(this, action);
    }

    // 默认返回
    return undefined;
  };

  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log("✅ toolbarConfig.template 方法已扩展，支持自定义菜单模板");
  }
}

// 立即注册所有菜单模板
try {
  registerAllMenuTemplates();
} catch (error) {
  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log(`❌ 注册菜单模板时出错: ${error.message}`);
  }
}

// 导出注册函数供外部使用
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    registerMenuTemplate: global.registerMenuTemplate,
    getMenuTemplate: global.getMenuTemplate,
  };
}

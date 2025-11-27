/**
 * Actions registry for toolbar
 */

// Create a global registry
if (typeof global === "undefined") {
  var global = {};
}

// Initialize the customActions object
global.customActions = global.customActions || {};

/**
Register custom actions
* @param {string} actionName - Action Name
* @param {Function} handler - Processing function
 */
global.registerCustomAction = function (actionName, handler) {
  global.customActions[actionName] = handler;
};

/**
 * Execute custom action
 * @param {string} actionName - Action Name
 * @param {Object} context - Execution context
 * @returns {boolean} - Whether the execution was successful
 */
global.executeCustomAction = async function (actionName, context) {
  if (actionName in global.customActions) {
    try {
      await global.customActions[actionName](context);
      return true;
    } catch (error) {
      MNUtil.showHUD(`Execution failed: ${error.message || error}`);
      return false;
    }
  }
  return false;
};

// Global AI Prompt object, for unified management of all AI prompts
const XDYY_PROMPTS = {
  /**
   * Code Analysis: Prompt Generation Function
   * @param {string} sourceCode - The source code to be analyzed
   * @returns {string} Complete code analysis hints
   */
  codeAnalysis: (sourceCode) => {
    return `请直接输出结果，不要包含任何思考过程、分析过程或额外说明。从第一行开始就是代码块，不要有任何前言。

你是专业的JavaScript代码分析师，请使用中文进行所有注释和说明。你的任务是为代码添加详细的中文注释和文档，但绝对不能修改任何原始代码。

原始代码：
\`\`\`javascript
${sourceCode}
\`\`\`

**严格要求**：
1. **绝对禁止修改任何原始代码**：
   - 不能改变任何字符，包括引号、空格、换行等
   - 代码中的每一个字符都必须与原始代码完全一致
   - 特别注意：不要转义引号（如将 ' 改为 \\'）
   - 不能改变变量名、函数名、类名
   - 不能改变代码逻辑或结构
   - 不能改变缩进、格式、分号使用
   - 不能改变字符串引号类型
   - 不能重新排列或重构代码
   - 不能修改任何现有的代码语句

2. **只允许的操作**：
   - 删除注释掉的废弃代码（如 // 临时调试、/* 废弃代码 */ 等非解释性注释）
   - 在函数前添加JSDoc注释
   - 在关键代码行添加行级注释解释

3. **注释要求**：
   - 所有注释必须使用中文
   - 添加完整JSDoc（@param、@returns、@throws等）
   - 不要添加 @example 标签
   - 只对复杂逻辑、算法或不明显的代码添加行级注释
   - 避免对简单赋值或显而易见的操作添加冗余注释
   - 重点解释代码的意图、业务逻辑和潜在风险

**输出格式要求**：
1. 直接输出，不要有任何前言、解释或思考过程
2. 第一行必须是 \`\`\`javascript
3. 先输出带注释的代码（使用 markdown 代码块）
4. 代码块结束后，直接输出性能提示和安全提醒
5. 最后一行是安全提醒，之后立即结束，不要有任何总结
6. 不要在最后添加任何额外的 \`\`\` 符号

输出格式如下：
\`\`\`javascript
[Keep the original code completely unchanged, only add Chinese JSDoc and necessary line comments]
\`\`\`

Performance Tips: [Specific suggestions provided in Chinese]
[!] Safety Reminder: [Specific suggestions provided in Chinese]

**重要警告**：
1. 如果输出了任何思考过程、分析说明，将被视为错误。
2. 如果改变了代码中的任何一个字符（包括引号），将被视为严重错误。
3. 如果你修改了任何原始代码（除删除废弃注释外），这将被视为严重错误。
4. 你只能添加中文注释来解释代码，绝对不能改变代码本身的任何内容。
5. 整个输出结束时不要添加任何额外的 \`\`\` 符号，性能提示和安全提醒之后直接结束。`;
  },

  // 未来可扩展其他类型的 Prompt：
  // translation: (text, targetLang) => { ... },
  // documentation: (code) => { ... },
  // refactoring: (code, style) => { ... }
};

// Register all custom actions
function registerAllCustomActions() {
  // Required variable declarations
  let targetNotes = [];
  let success = true;
  let color, config;
  let targetNoteId;
  let parentNote;
  let focusNoteType;
  let focusNoteColorIndex;
  let copyTitlePart;
  let userInput;
  let bibTextIndex, bibContent;
  let bibContentArr = [];
  let currentDocmd5;
  let path, UTI;
  let currentDocName;
  let pinnedNote;

  // HTML settings
  const htmlSetting = [
    { title: "SKETCH: ✍️", type: "sketch" },
    { title: "Note: 📝", type: "remark" },
    { title: "Method: ✔", type: "method" },
    { title: "Key: 🔑", type: "key" },
    { title: "Question: ❓", type: "question" },
    { title: "Caution: ⚠️", type: "alert" },
    { title: "Special Note: ❗❗❗", type: "danger" },
    { title: "Case: 📋", type: "case" },
    { title: "Step: 👣", type: "step" },
    { title: "Target: 🎯", type: "goal" },
    { title: "level1: 🚩", type: "level1" },
    { title: "level2: ▸", type: "level2" },
    { title: "level3: ▪", type: "level3" },
    { title: "level4: •", type: "level4" },
    { title: "level5: ·", type: "level5" },
    { title: "CHECK: 🔍", type: "check" },
  ];
  const htmlSettingTitles = htmlSetting.map((config) => config.title);

  const levelHtmlSetting = [
    { title: "Method: ✔", type: "method" },
    { title: "Target: 🎯", type: "goal" },
    { title: "level1: 🚩", type: "level1" },
    { title: "level2: ▸", type: "level2" },
    { title: "level3: ▪", type: "level3" },
    { title: "level4: •", type: "level4" },
    { title: "level5: ·", type: "level5" },
    { title: "Case: 📋", type: "case" },
    { title: "Step: 👣", type: "step" },
  ];
  const levelHtmlSettingTitles = levelHtmlSetting.map((config) => config.title);

  global.registerCustomAction("reorderContainsFieldLinks", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.reorderContainsFieldLinks(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });
  // ========== REFERENCE related (43 items) ==========

  // referenceRefByRefNumAddFocusInFloatMindMap
  global.registerCustomAction("referenceRefByRefNumAddFocusInFloatMindMap", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      Enterdocumentnumber,
      "",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            let refNum = alert.textFieldAtIndex(0).text;
            if (buttonIndex == 1) {
              let refNote = toolbarUtils.referenceRefByRefNum(focusNote, refNum)[0];
              let classificationNote = toolbarUtils.referenceRefByRefNum(focusNote, refNum)[1];
              classificationNote.addChild(refNote.note);
              refNote.focusInFloatMindMap(0.3);
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceRefByRefNumAndFocusInMindMap
  global.registerCustomAction("referenceRefByRefNumAndFocusInMindMap", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      Enterocumentnumber,
      "",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            let refNum = alert.textFieldAtIndex(0).text;
            if (buttonIndex == 1) {
              let refNote = toolbarUtils.referenceRefByRefNum(focusNote, refNum)[0];
              let classificationNote = toolbarUtils.referenceRefByRefNum(focusNote, refNum)[1];
              classificationNote.addChild(refNote.note);
              refNote.focusInMindMap(0.3);
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceRefByRefNum
  // referenceCreateClassificationNoteByIdAndFocusNote
  global.registerCustomAction("referenceCreateClassificationNoteByIdAndFocusNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      Enterdocumentumber,
      "",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            if (buttonIndex == 1) {
              let refNum = alert.textFieldAtIndex(0).text;
              let currentDocmd5 = MNUtil.currentDocmd5;
              let findClassificationNote = false;
              let classificationNote;
              if (
                toolbarConfig.referenceIds.hasOwnProperty(currentDocmd5) ||
                toolbarConfig.referenceIds[currentDocmd5][0] == undefined
              ) {
                if (toolbarConfig.referenceIds[currentDocmd5].hasOwnProperty(refNum)) {
                  let refSourceNoteId = toolbarConfig.referenceIds[currentDocmd5][0];
                  let refSourceNote = MNNote.new(refSourceNoteId);
                  // let refSourceNoteTitle = toolbarUtils.getFirstKeywordFromTitle(refSourceNote.noteTitle)
                  let refSourceNoteTitle = refSourceNote.getFirstTitleLinkWord();
                  let refSourceNoteAuthor = toolbarUtils.getFirstAuthorFromReferenceById(refSourceNoteId);
                  let refedNoteId = toolbarConfig.referenceIds[currentDocmd5][refNum];
                  let refedNote = MNNote.new(refedNoteId);
                  // let refedNoteTitle = toolbarUtils.getFirstKeywordFromTitle(refedNote.noteTitle)
                  let refedNoteTitle = refedNote.getFirstTitleLinkWord();
                  let refedNoteAuthor = toolbarUtils.getFirstAuthorFromReferenceById(refedNoteId);

                  // First, check if refedNote has a "Detailed Citations" summary card.
                  for (let i = 0; i < refedNote.childNotes.length; i++) {
                    let childNote = referencedNote.childNotes[i];
                    if (
                      childNote.noteTitle &&
                      childNote.noteTitle.includes("[" + refNum + "] " + refedNoteTitle)
                    ) {
                      classificationNote = refedNote.childNotes[i];
                      findClassificationNote = true;
                    }
                  }
                  if (!findClassificationNote) {
                    // Create one if it doesn't exist.
                    classificationNote = MNNote.clone("C24C2604-4B3A-4B6F-97E6-147F3EC67143");
                    classificationNote.noteTitle =
                      "「" +
                      refSourceNoteTitle +
                      " - " +
                      refSourceNoteAuthor +
                      "quote" +
                      "「[" +
                      refNum +
                      "] " +
                      refedNoteTitle +
                      " - " +
                      refedNoteAuthor +
                      "Conditio";
                  } else {
                    // Update the title if found
                    // Because there might be occasional instances where the writer is forgotten, resulting in "No author".
                    classificatonNote.noteTitle =
                      "「" +
                      refSourceNoteTitle +
                      " - " +
                      refSourceNoteAuthor +
                      "quote" +
                      "「[" +
                      refNum +
                      "] " +
                      refedNoteTitle +
                      " - " +
                      refedNoteAuthor +
                      "」情况";
                  }

                  refedNote.addChild(classificationNote); // Adds the "Detailed Citation Information" summary card to a child card of the cited reference card.

                  /**
                   * Mobile link
                   */

                  /**
                   * Move the link for the "Cited Reference Card" in the "Detailed Citation Information" summary card.
                   */
                  let refedNoteIdIndexInClassificationNote = classificationNote.getCommentIndex(
                    "marginnote4app://note/" + refedNoteId
                  );
                  if (refedNoteIdIndexInClassificationNote == -1) {
                    classificationNote.appendNoteLink(refedNote, "To");
                    classificationNote.moveComment(
                      classificationNote.comments.length - 1,
                      classificationNote.getHtmlCommentIndex("Specific reference:")
                    );
                    // Move above "Specific reference:"
                  } else {
                    classificationNote.moveComment(
                      refedNoteIdIndexInClassificationNote,
                      classificationNote.getHtmlCommentIndex("Specific reference:")
                    );
                  }

                  /**
                   * Move the link of the "Cited Subject Document Card" in the "Specific Citation Details" summary card.
                   */
                  let refSourceNoteIdIndexInClassificationNote = classificationNote.getCommentIndex(
                    "marginnote4app://note/" + refSourceNoteId
                  );
                  if (refSourceNoteIdIndexInClassificationNote == -1) {
                    classificationNote.appendNoteLink(refSourceNote, "To");
                    classificationNote.moveComment(
                      classificationNote.comments.length - 1,
                      classificationNote.getHtmlCommentIndex("引用：")
                    );
                    // Move to "Quote:"
                  } else {
                    classificationNote.moveComment(
                      refSourceNoteIdIndexInClassificationNote,
                      classificationNote.getHtmlCommentIndex("引用：")
                    );
                  }

                  /**
                   * Move the "Detailed Citation Information" summary card to the link in the cited document card.
                   */
                  let classificationNoteIdIndexInRefSourceNote = refSourceNote.getCommentIndex(
                    "marginnote4app://note/" + classificationNote.noteId
                  );
                  if (classificationNoteIdIndexInRefSourceNote == -1) {
                    refSourceNote.appendNoteLink(classificationNote, "To");
                    refSourceNote.moveComment(
                      refSourceNote.comments.length - 1,
                      refSourceNote.getHtmlCommentIndex("Reference status:")
                    );
                  }

                  /**
                   * Move the "Detailed Citation Information" summary card to the link in the cited reference card.
                   */
                  let classificationNoteIdIndexInRefedNote = refedNote.getCommentIndex(
                    "marginnote4app://note/" + classificationNote.noteId
                  );
                  if (classificationNoteIdIndexInRefedNote == -1) {
                    refedNote.appendNoteLink(classificationNote, "To");
                    // refedNote.moveComment(refedNote.comments.length-1,refedNote.getCommentIndex("Reference status:", true))
                  } else {
                    refedNote.moveComment(
                      classificationNoteIdIndexInRefedNote,
                      refedNote.comments.length - 1
                    );
                  }

                  classificationNote.merge(focusNote.note);
                  classificationNote.moveComment(
                    classificationNote.comments.length - 1,
                    classificationNote.getHtmlCommentIndex("Citation:") + 1 // Moves the reference excerpt below "Citation:"
                  );
                  classificationNote.focusInFloatMindMap(0.5);
                } else {
                  MNUtil.showHUD("[" + refNum + "] No ID binding performed");
                }
              } else {
                MNUtil.showHUD("The current document is not bound to an ID");
              }
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceCreateClassificationNoteById
  // referenceTestIfIdInCurrentDoc
  global.registerCustomAction("referenceTestIfIdInCurrentDoc", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Enter document number",
      "",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            if (buttonIndex == 1) {
              let refNum = alert.textFieldAtIndex(0).text;
              let currentDocmd5 = MNUtil.currentDocmd5;
              if (toolbarConfig.referenceIds.hasOwnProperty(currentDocmd5)) {
                if (toolbarConfig.referenceIds[currentDocmd5].hasOwnProperty(refNum)) {
                  MNUtil.showHUD(
                    "[" +
                      refNum +
                      "] and " +
                      MNNote.new(toolbarConfig.referenceIds[currentDocmd5][refNum]).noteTitle +
                      "Bind"
                  );
                } else {
                  MNUtil.showHUD("[" + refNum + "] No ID binding performed");
                }
              } else {
                MNUtil.showHUD("The current document has not yet started binding an ID");
              }
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceStoreOneIdForCurrentDocByFocusNote
  global.registerCustomAction("referenceStoreOneIdForCurrentDocByFocusNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Enter document number",
      "",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            if (buttonIndex == 1) {
              let refNum = alert.textFieldAtIndex(0).text;
              let refId = focusNote.noteId;
              let currentDocmd5 = MNUtil.currentDocmd5;
              if (toolbarConfig.referenceIds.hasOwnProperty(currentDocmd5)) {
                toolbarConfig.referenceIds[currentDocmd5][refNum] = refId;
              } else {
                toolbarConfig.referenceIds[currentDocmd5] = {};
                toolbarConfig.referenceIds[currentDocmd5][refNum] = refId;
              }
              MNUtil.showHUD("Save: [" + refNum + "] -> " + refId);
              toolbarConfig.save("MNToolbar_referenceIds");
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceStoreOneIdForCurrentDoc
  // referenceStoreIdsForCurrentDoc
  // referenceStoreIdsForCurrentDocFromClipboard
  // referenceExportReferenceIdsToClipboard
  global.registerCustomAction("referenceExportReferenceIdsToClipboard", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.copy(JSON.stringify(toolbarConfig.referenceIds, null, 2));
    MNUtil.showHUD("Copy successfully!");
  });

  // referenceExportReferenceIdsToFile
  global.registerCustomAction("referenceExportReferenceIdsToFile", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    // Export to .JSON file
    path = MNUtil.cacheFolder + "/exportReferenceIds.json";
    MNUtil.writeText(path, JSON.stringify(toolbarConfig.referenceIds, null, 2));
    UTI = ["public.json"];
    MNUtil.saveFile(path, UTI);
  });

  // referenceInputReferenceIdsFromClipboard
  global.registerCustomAction("referenceInputReferenceIdsFromClipboard", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    // MNUtil.copy(
    //   JSON.stringify(toolbarConfig.referenceIds, null, 2)
    // )
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Are you sure you want to import all reference IDs from the clipboard?",
      "",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        if (buttonIndex == 1) {
          try {
            MNUtil.undoGrouping(() => {
              toolbarConfig.referenceIds = JSON.parse(MNUtil.clipboardText);
              toolbarConfig.save("MNToolbar_referenceIds");
            });
          } catch (error) {
            MNUtil.showHUD(error);
          }
        }
      }
    );
  });

  // referenceInputReferenceIdsFromFile
  global.registerCustomAction("referenceInputReferenceIdsFromFile", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      // MNUtil.undoGrouping(()=>{
      UTI = ["public.json"];
      path = await MNUtil.importFile(UTI);
      toolbarConfig.referenceIds = MNUtil.readJSON(path);
      toolbarConfig.save("MNToolbar_referenceIds");
      // })
    } catch (error) {
      MNUtil.showHUD(error);
    }
    // MNUtil.copy(
    //   JSON.stringify(toolbarConfig.referenceIds, null, 2)
    // )
  });

  // referenceClearIdsForCurrentDoc
  // referenceStoreIdForCurrentDocByFocusNote
  global.registerCustomAction("referenceStoreIdForCurrentDocByFocusNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      // MNUtil.undoGrouping(()=>{
      let refNum = 0;
      let refId = focusNote.noteId;
      currentDocmd5 = MNUtil.currentDocmd5;
      currentDocName = MNUtil.currentDocController.document.docTitle;
      if (toolbarConfig.referenceIds.hasOwnProperty(currentDocmd5)) {
        toolbarConfig.referenceIds[currentDocmd5][refNum] = refId;
      } else {
        toolbarConfig.referenceIds[currentDocmd5] = {};
        toolbarConfig.referenceIds[currentDocmd5][refNum] = refId;
      }
      MNUtil.showHUD("文档「" + currentDocName + "」与 " + refId + "绑定");
      toolbarConfig.save("MNToolbar_referenceIds");
      // })
    } catch (error) {
      MNUtil.showHUD(error);
    }
    // MNUtil.copy(
    //   JSON.stringify(toolbarConfig.referenceIds, null, 2)
    // )
  });

  // referenceAuthorInfoFromClipboard
  global.registerCustomAction("referenceAuthorInfoFromClipboard", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      // let infoHtmlCommentIndex = focusNote.getCommentIndex("Personal Information:", true)
      let referenceHtmlCommentIndex = focusNote.getCommentIndex("文献：", true);
      focusNote.appendMarkdownComment(MNUtil.clipboardText, referenceHtmlCommentIndex);
    });
  });

  // referenceAuthorRenewAbbreviation
  global.registerCustomAction("referenceAuthorRenewAbbreviation", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      focusNotes.forEach((focusNote) => {
        let authorName = toolbarUtils.getFirstKeywordFromTitle(focusNote.noteTitle);
        let abbreviations = toolbarUtils.getAbbreviationsOfName(authorName);
        abbreviations.forEach((abbreviation) => {
          if (!focusNote.noteTitle.includes(abbreviation)) {
            focusNote.noteTitle += "; " + abbreviation;
          }
        });
      });
    });
  });

  // referencePaperMakeCards
  global.registerCustomAction("referencePaperMakeCards", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      focusNotes.forEach((focusNote) => {
        if (focusNote.excerptText) {
          toolbarUtils.convertNoteToNonexcerptVersion(focusNote);
        }
        focusNote.note.colorIndex = 15;
        if (focusNote.noteTitle.startsWith("【文献：")) {
          // Remove the ".*" at the beginning of focusNote.noteTitle
          let reg = new RegExp("^【.*】");
          focusNote.noteTitle = focusNote.noteTitle.replace(reg, "【Reference: Paper】");
        } else {
          focusNote.noteTitle = "【Literature: Paper】; " + focusNote.noteTitle;
        }
        let referenceInfoHtmlCommentIndex = focusNote.getCommentIndex("Literature Information:", true);
        if (referenceInfoHtmlCommentIndex == -1) {
          toolbarUtils.cloneAndMerge(focusNote, "F09C0EEB-4FB5-476C-8329-8CC5AEFECC43");
        }
        let paperLibraryNote = MNNote.new("785225AC-5A2A-41BA-8760-3FEF10CF4AE0");
        paperLibraryNote.addChild(focusNote.note);
        focusNote.focusInMindMap(0.5);
      });
    });
  });

  // referenceBookMakeCards
  global.registerCustomAction("referenceBookMakeCards", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      focusNotes.forEach((focusNote) => {
        if (focusNote.excerptText) {
          toolbarUtils.convertNoteToNonexcerptVersion(focusNote);
        }
        focusNote.note.colorIndex = 15;
        if (focusNote.noteTitle.startsWith("【文献：")) {
          // Remove the ".*" at the beginning of focusNote.noteTitle
          let reg = new RegExp("^【.*】");
          focusNote.noteTitle = focusNote.noteTitle.replace(reg, "【Reference: Bookwork】");
        } else {
          focusNote.noteTitle = "【Reference: Books】; " + focusNote.noteTitle;
        }
        let referenceInfoHtmlCommentIndex = focusNote.getCommentIndex("Literature Information:", true);
        if (referenceInfoHtmlCommentIndex == -1) {
          toolbarUtils.cloneAndMerge(focusNote, "F09C0EEB-4FB5-476C-8329-8CC5AEFECC43");
        }
        let bookLibraryNote = MNNote.new("49102A3D-7C64-42AD-864D-55EDA5EC3097");
        bookLibraryNote.addChild(focusNote.note);
        focusNote.focusInMindMap(0.5);
      });
    });
  });

  // referenceSeriesBookMakeCard
  global.registerCustomAction("referenceSeriesBookMakeCard", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      MNUtil.undoGrouping(() => {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "Series of Books",
          "Enter the series name",
          2,
          "Cancel",
          ["Sure"],
          (alert, buttonIndex) => {
            if (buttonIndex === 1) {
              let seriesName = alert.textFieldAtIndex(0).text;
              UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
                "Serial number",
                "",
                2,
                "Cancel",
                ["Sure"],
                (alertI, buttonIndexI) => {
                  if (buttonIndex == 1) {
                    let seriesNum = alertI.textFieldAtIndex(0).text;
                    try {
                      toolbarUtils.referenceSeriesBookMakeCard(focusNote, seriesName, seriesNum);
                    } catch (error) {
                      MNUtil.showHUD(error);
                    }
                  }
                }
              );
            }
          }
        );
      });
    } catch (error) {
      MNUtil.showHUD(error);
    }
  });

  // referenceOneVolumeJournalMakeCards
  global.registerCustomAction("referenceOneVolumeJournalMakeCards", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      MNUtil.undoGrouping(() => {
        let journalVolNum;
        let journalName;
        if (focusNote.excerptText) {
          toolbarUtils.convertNoteToNonexcerptVersion(focusNote);
        } else {
          focusNote.note.colorIndex = 15;
          UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
            "Full volume of journal",
            "Enter journal name",
            2,
            "Cancel",
            ["Sure"],
            (alert, buttonIndex) => {
              MNUtil.undoGrouping(() => {
                journalName = alert.textFieldAtIndex(0).text;
                if (buttonIndex === 1) {
                  let journalLibraryNote = MNNote.new("1D83F1FA-E54D-4E0E-9E74-930199F9838E");
                  let findJournal = false;
                  let targetJournalNote;
                  let focusNoteIndexInTargetJournalNote;
                  for (let i = 0; i <= journalLibraryNote.childNotes.length - 1; i++) {
                    if (journalLibraryNote.childNotes[i].noteTitle.includes(journalName)) {
                      targetJournalNote = journalLibraryNote.childNotes[i];
                      journalName = toolbarUtils.getFirstKeywordFromTitle(targetJournalNote.noteTitle);
                      findJournal = true;
                    }
                  }
                  if (!findJournal) {
                    targetJournalNote = MNNote.clone("129EB4D6-D57A-4367-8087-5C89864D3595");
                    targetJournalNote.note.noteTitle = "【Document: Journal】; " + journalName;
                    journalLibraryNote.addChild(targetJournalNote.note);
                  }
                  let journalInfoHtmlCommentIndex = focusNote.getCommentIndex(
                    "Literature Information:",
                    true
                  );
                  if (journalInfoHtmlCommentIndex == -1) {
                    toolbarUtils.cloneAndMerge(focusNote, "1C976BDD-A04D-46D0-8790-34CE0F6671A4");
                  }
                  UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
                    "Volume Number",
                    "",
                    2,
                    "Cancel",
                    ["Sure"],
                    (alertI, buttonIndex) => {
                      if (buttonIndex == 1) {
                        journalVolNum = alertI.textFieldAtIndex(0).text;
                        let journalTextIndex = focusNote.getIncludingCommentIndex(
                          "- Full volume of journals:",
                          true
                        );
                        // let thoughtHtmlCommentIndex = focusNote.getCommentIndex("Related Thoughts:", true)
                        let includingHtmlCommentIndex = focusNote.getCommentIndex("包含：", true);
                        focusNote.noteTitle = toolbarUtils.replaceStringStartWithSquarebracketContent(
                          focusNote.noteTitle,
                          "[Reference: Full Volume Journal: " + journalName + " - Vol. " + journalVolNum + "]"
                        );
                        if (journalTextIndex == -1) {
                          focusNote.appendMarkdownComment(
                            "- Full volume of journal: Vol. " + journalVolNum,
                            includingHtmlCommentIndex
                          );
                          focusNote.appendNoteLink(targetJournalNote, "To");
                          focusNote.moveComment(focusNote.comments.length - 1, includingHtmlCommentIndex + 1);
                        } else {
                          // focusNote.appendNoteLink(targetJournalNote, "To")
                          // focusNote.moveComment(focusNote.comments.length-1,journalTextIndex + 1)
                          focusNote.removeCommentByIndex(journalTextIndex);
                          focusNote.appendMarkdownComment(
                            "- Full volume of journal: Vol. " + journalVolNum,
                            journalTextIndex
                          );
                          if (
                            focusNote.getCommentIndex("marginnote4app://note/" + targetJournalNote.noteId) ==
                            -1
                          ) {
                            focusNote.appendNoteLink(targetJournalNote, "To");
                            focusNote.moveComment(focusNote.comments.length - 1, journalTextIndex + 1);
                          }
                        }
                        focusNoteIndexInTargetJournalNote = targetJournalNote.getCommentIndex(
                          "marginnote4app://note/" + focusNote.noteId
                        );
                        let singleInfoIndexInTargetJournalNote =
                          targetJournalNote.getIncludingCommentIndex("**Single**");
                        if (focusNoteIndexInTargetJournalNote == -1) {
                          targetJournalNote.appendNoteLink(focusNote, "To");
                          targetJournalNote.moveComment(
                            targetJournalNote.comments.length - 1,
                            singleInfoIndexInTargetJournalNote
                          );
                        } else {
                          targetJournalNote.moveComment(
                            focusNoteIndexInTargetJournalNote,
                            singleInfoIndexInTargetJournalNote
                          );
                        }
                        // toolbarUtils.sortNoteByVolNum(targetJournalNote, 1)
                        let bookLibraryNote = MNNote.new("49102A3D-7C64-42AD-864D-55EDA5EC3097");
                        MNUtil.undoGrouping(() => {
                          bookLibraryNote.addChild(focusNote.note);
                          focusNote.focusInMindMap(0.5);
                        });
                      }
                    }
                  );
                }
              });
            }
          );
        }
      });
    } catch (error) {
      MNUtil.showHUD(error);
    }
  });

  // referenceAuthorNoteMake
  global.registerCustomAction("referenceAuthorNoteMake", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        focusNotes.forEach((focusNote) => {
          toolbarUtils.referenceAuthorNoteMake(focusNote);
        });
      } catch (error) {
        MNUtil.showHUD(error);
        MNUtil.copy(error);
      }
    });
  });

  // referenceBibInfoCopy
  global.registerCustomAction("referenceBibInfoCopy", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    bibContentArr = [];
    focusNotes.forEach((focusNote) => {
      bibContentArr.push(toolbarUtils.extractBibFromReferenceNote(focusNote));
    });
    if (bibContentArr.length > 0) {
      if (bibContentArr.length == 1) {
        bibContent = bibContentArr[0];
        MNUtil.copy(bibContent);
        MNUtil.showHUD("1 .bib entry copied to clipboard");
      } else {
        if (bibContentArr.length > 1) {
          bibContent = bibContentArr.join("\n\n");
          MNUtil.copy(bibContent);
          MNUtil.showHUD("Copied " + bibContentArr.length + " .bib entries to clipboard");
        }
      }
    }
  });

  // referenceBibInfoExport
  global.registerCustomAction("referenceBibInfoExport", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    bibContentArr = [];
    focusNotes.forEach((focusNote) => {
      bibContentArr.push(toolbarUtils.extractBibFromReferenceNote(focusNote));
    });
    if (bibContentArr.length > 0) {
      if (bibContentArr.length == 1) {
        bibContent = bibContentArr[0];
        MNUtil.copy(bibContent);
        // MNUtil.showHUD("1 .bib entry copied to clipboard")
      } else {
        if (bibContentArr.length > 1) {
          bibContent = bibContentArr.join("\n\n");
          MNUtil.copy(bibContent);
          // MNUtil.showHUD("Copied " + bibContentArr.length + " .bib entries to clipboard")
        }
      }
      // Export to .bib file
      let docPath = MNUtil.cacheFolder + "/exportBibItems.bib";
      MNUtil.writeText(docPath, bibContent);
      let UTI = ["public.bib"];
      MNUtil.saveFile(docPath, UTI);
    }
  });

  // referenceBibInfoPasteFromClipboard
  global.registerCustomAction("referenceBibInfoPasteFromClipboard", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      bibTextIndex = focusNote.getIncludingCommentIndex("- `.bib`");
      if (bibTextIndex !== -1) {
        focusNote.removeCommentByIndex(bibTextIndex);
      }
      let thoughtHtmlCommentIndex = focusNote.getCommentIndex("Related Thoughts:", true);
      let bibContent = "- `.bib` entry:\n ```bib\n ";
      // Preprocessing to add four spaces to each line in MNUtil.clipboardText
      let processedClipboardText = MNUtil.clipboardText.replace(/\n/g, "\n "); // Add four spaces before each newline character
      bibContent += processedClipboardText; // Add the processed text to bibContent
      bibContent += "\n ```"; // Continue building the final string
      focusNote.appendMarkdownComment(bibContent, thoughtHtmlCommentIndex);
    });
  });

  // referenceInfoDoiFromClipboard
  global.registerCustomAction("referenceInfoDoiFromClipboard", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      MNUtil.undoGrouping(() => {
        const doiRegex = /(?<=doi:|DOI:|Doi:)\s*(\S+)/i; // This regular expression matches content that begins with "doi:", followed by spaces or other characters.
        const doiMatch = MNUtil.clipboardText.match(doiRegex); // Use regular expressions for matching
        let doi = doiMatch ? doiMatch[1] : MNUtil.clipboardText.trim(); // If a match is found, retrieve the matched content; otherwise, retrieve the original input content.
        let doiTextIndex = focusNote.getIncludingCommentIndex("- DOI", true);
        if (doiTextIndex !== -1) {
          focusNote.removeCommentByIndex(doiTextIndex);
        }
        let thoughtHtmlCommentIndex = focusNote.getCommentIndex("Related Thoughts:", true);
        focusNote.appendMarkdownComment(
          "- DOI（Digital Object Identifier）：" + doi,
          thoughtHtmlCommentIndex
        );
      });
    } catch (error) {
      MNUtil.showHUD(error);
    }
  });

  // referenceInfoDoiFromTyping
  // referenceInfoJournal
  global.registerCustomAction("referenceInfoJournal", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Add journals",
      "",
      2,
      "Cancel",
      ["Single copy", "Entire issue/volume"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            journalName = alert.textFieldAtIndex(0).text;
            let journalLibraryNote = MNNote.new("1D83F1FA-E54D-4E0E-9E74-930199F9838E");
            let findJournal = false;
            let targetJournalNote;
            let thoughtHtmlCommentIndex = focusNote.getCommentIndex("Related Thoughts:", true);
            let focusNoteIndexInTargetJournalNote;
            let singleInfoIndexInTargetJournalNote;
            for (let i = 0; i <= journalLibraryNote.childNotes.length - 1; i++) {
              if (journalName.toLowerCase()) {
                if (
                  journalLibraryNote.childNotes[i].noteTitle.toLowerCase().includes(journalName.toLowerCase())
                ) {
                  targetJournalNote = journalLibraryNote.childNotes[i];
                  findJournal = true;
                }
              } else {
                if (journalLibraryNote.childNotes[i].noteTitle.includes(journalName)) {
                  targetJournalNote = journalLibraryNote.childNotes[i];
                  findJournal = true;
                }
              }
            }
            if (!findJournal) {
              targetJournalNote = MNNote.clone("129EB4D6-D57A-4367-8087-5C89864D3595");
              targetJournalNote.note.noteTitle = "【Document: Journal】; " + journalName;
              journalLibraryNote.addChild(targetJournalNote.note);
            }
            let journalTextIndex = focusNote.getIncludingCommentIndex("- 期刊", true);
            if (journalTextIndex == -1) {
              focusNote.appendMarkdownComment("- 期刊（Journal）：", thoughtHtmlCommentIndex);
              focusNote.appendNoteLink(targetJournalNote, "To");
              focusNote.moveComment(focusNote.comments.length - 1, thoughtHtmlCommentIndex + 1);
            } else {
              // focusNote.appendNoteLink(targetJournalNote, "To")
              // focusNote.moveComment(focusNote.comments.length-1,journalTextIndex + 1)
              if (focusNote.getCommentIndex("marginnote4app://note/" + targetJournalNote.noteId) == -1) {
                focusNote.appendNoteLink(targetJournalNote, "To");
                focusNote.moveComment(focusNote.comments.length - 1, journalTextIndex + 1);
              } else {
                focusNote.moveComment(
                  focusNote.getCommentIndex("marginnote4app://note/" + targetJournalNote.noteId),
                  journalTextIndex + 1
                );
              }
            }
            focusNoteIndexInTargetJournalNote = targetJournalNote.getCommentIndex(
              "marginnote4app://note/" + focusNote.noteId
            );
            singleInfoIndexInTargetJournalNote = targetJournalNote.getIncludingCommentIndex("**单份**");
            if (focusNoteIndexInTargetJournalNote == -1) {
              targetJournalNote.appendNoteLink(focusNote, "To");
              if (buttonIndex !== 1) {
                // Non-single
                targetJournalNote.moveComment(
                  targetJournalNote.comments.length - 1,
                  singleInfoIndexInTargetJournalNote
                );
              }
            } else {
              if (buttonIndex !== 1) {
                // Non-single
                targetJournalNote.moveComment(
                  focusNoteIndexInTargetJournalNote,
                  singleInfoIndexInTargetJournalNote
                );
              } else {
                targetJournalNote.moveComment(
                  focusNoteIndexInTargetJournalNote,
                  targetJournalNote.comments.length - 1
                );
              }
            }
            // if (buttonIndex == 1) {
            // }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceInfoPublisher
  global.registerCustomAction("referenceInfoPublisher", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Add publishers",
      "",
      2,
      "Cancel",
      ["Single", "Series"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            publisherName = alert.textFieldAtIndex(0).text;
            let publisherLibraryNote = MNNote.new("9FC1044A-F9D2-4A75-912A-5BF3B02984E6");
            let findPublisher = false;
            let targetPublisherNote;
            let thoughtHtmlCommentIndex = focusNote.getCommentIndex("Related Thoughts:", true);
            let focusNoteIndexInTargetPublisherNote;
            let singleInfoIndexInTargetPublisherNote;
            for (let i = 0; i <= publisherLibraryNote.childNotes.length - 1; i++) {
              if (publisherLibraryNote.childNotes[i].noteTitle.includes(publisherName)) {
                targetPublisherNote = publisherLibraryNote.childNotes[i];
                findPublisher = true;
              }
            }
            if (!findPublisher) {
              targetPublisherNote = MNNote.clone("1E34F27B-DB2D-40BD-B0A3-9D47159E68E7");
              targetPublisherNote.note.noteTitle = "【Document: Publisher】; " + publisherName;
              publisherLibraryNote.addChild(targetPublisherNote.note);
            }
            let publisherTextIndex = focusNote.getIncludingCommentIndex("- 出版社", true);
            if (publisherTextIndex == -1) {
              focusNote.appendMarkdownComment("- Publisher: ", thoughtHtmlCommentIndex);
              focusNote.appendNoteLink(targetPublisherNote, "To");
              focusNote.moveComment(focusNote.comments.length - 1, thoughtHtmlCommentIndex + 1);
            } else {
              if (focusNote.getCommentIndex("marginnote4app://note/" + targetPublisherNote.noteId) == -1) {
                focusNote.appendNoteLink(targetPublisherNote, "To");
                focusNote.moveComment(focusNote.comments.length - 1, publisherTextIndex + 1);
              } else {
                focusNote.moveComment(
                  focusNote.getCommentIndex("marginnote4app://note/" + targetPublisherNote.noteId),
                  publisherTextIndex + 1
                );
              }
            }
            focusNoteIndexInTargetPublisherNote = targetPublisherNote.getCommentIndex(
              "marginnote4app://note/" + focusNote.noteId
            );
            singleInfoIndexInTargetPublisherNote = targetPublisherNote.getIncludingCommentIndex("**单份**");
            if (focusNoteIndexInTargetPublisherNote == -1) {
              targetPublisherNote.appendNoteLink(focusNote, "To");
              if (buttonIndex !== 1) {
                // Non-single
                targetPublisherNote.moveComment(
                  targetPublisherNote.comments.length - 1,
                  singleInfoIndexInTargetPublisherNote
                );
              }
            } else {
              if (buttonIndex !== 1) {
                // Non-single
                targetPublisherNote.moveComment(
                  focusNoteIndexInTargetPublisherNote,
                  singleInfoIndexInTargetPublisherNote
                );
              } else {
                targetPublisherNote.moveComment(
                  focusNoteIndexInTargetPublisherNote,
                  targetPublisherNote.comments.length - 1
                );
              }
            }
            // if (buttonIndex == 1) {
            // }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceInfoKeywords
  global.registerCustomAction("referenceInfoKeywords", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Add keywords",
      "If there are multiple keywords, separate them with \n- Chinese semicolon; \n- English semicolon; \n- Chinese comma, \n- English comma, \n- one of them.",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            userInput = alert.textFieldAtIndex(0).text;
            let keywordArr = toolbarUtils.splitStringByFourSeparators(userInput);
            let findKeyword = false;
            let targetKeywordNote;
            let thoughtHtmlCommentIndex = focusNote.getCommentIndex("Related Thoughts:", true);
            let focusNoteIndexInTargetKeywordNote;
            if (buttonIndex === 1) {
              let keywordLibraryNote = MNNote.new("3BA9E467-9443-4E5B-983A-CDC3F14D51DA");
              // MNUtil.showHUD(keywordArr)
              keywordArr.forEach((keyword) => {
                findKeyword = false;
                for (let i = 0; i <= keywordLibraryNote.childNotes.length - 1; i++) {
                  if (
                    keywordLibraryNote.childNotes[i].noteTitle.includes(keyword) ||
                    keywordLibraryNote.childNotes[i].noteTitle.includes(keyword.toLowerCase())
                  ) {
                    targetKeywordNote = keywordLibraryNote.childNotes[i];
                    findKeyword = true;
                    // MNUtil.showHUD("Existence！" + targetKeywordNote.noteTitle)
                    // MNUtil.delay(0.5).then(()=>{
                    //   targetKeywordNote.focusInFloatMindMap()
                    // })
                  }
                }
                if (!findKeyword) {
                  // If it does not exist, add a keyword card.
                  targetKeywordNote = MNNote.clone("D1EDF37C-7611-486A-86AF-5DBB2039D57D");
                  if (keyword.toLowerCase() !== keyword) {
                    targetKeywordNote.note.noteTitle += "; " + keyword + "; " + keyword.toLowerCase();
                  } else {
                    targetKeywordNote.note.noteTitle += "; " + keyword;
                  }
                  keywordLibraryNote.addChild(targetKeywordNote.note);
                } else {
                  if (targetKeywordNote.noteTitle.includes(keyword)) {
                    if (!targetKeywordNote.noteTitle.includes(keyword.toLowerCase())) {
                      targetKeywordNote.note.noteTitle += "; " + keyword.toLowerCase();
                    }
                  } else {
                    // A lowercase version exists, but a non-lowercase version does not exist.
                    // Retrieve the content after the "References: Keywords" section in the noteTitle (assuming this content has a fixed format).
                    let noteTitleAfterKeywordPrefixPart =
                      targetKeywordNote.noteTitle.split("【Literature: Keywords】")[1]; // This will retrieve the content "; xxx; yyy".

                    // Add a new keyword followed by a semicolon and a space after the existing keyword.
                    let newKeywordPart = "; " + keyword; // Add semicolon, space, and new keyword

                    // Reassemble the string, placing the new keyword portion in its original position.
                    let updatedNoteTitle = `【References:Keywords】${newKeywordPart}${noteTitleAfterKeywordPrefixPart}`; // Construct a new title using a template string.

                    // Update the noteTitle property of targetKeywordNote or assign a value to a new variable.
                    targetKeywordNote.note.noteTitle = updatedNoteTitle; // If noteTitle is a property of an object
                  }
                }
                // MNUtil.delay(0.5).then(()=>{
                //   targetKeywordNote.focusInFloatMindMap()
                // })
                let keywordTextIndex = focusNote.getIncludingCommentIndex("- Keyword", true);
                if (keywordTextIndex == -1) {
                  focusNote.appendMarkdownComment("- Keywords:", thoughtHtmlCommentIndex);
                }
                let keywordIndexInFocusNote = focusNote.getCommentIndex(
                  "marginnote4app://note/" + targetKeywordNote.noteId
                );
                if (keywordIndexInFocusNote == -1) {
                  // The keyword card hasn't been linked yet.
                  focusNote.appendNoteLink(targetKeywordNote, "To");
                  let keywordLinksArr = [];
                  focusNote.comments.forEach((comment, index) => {
                    if (
                      comment.text &&
                      (comment.text.includes("- keywords") ||
                        comment.text.includes("marginnote4app://note/") ||
                        comment.text.includes("marginnote3app://note/"))
                    ) {
                      keywordLinksArr.push(index);
                    }
                  });
                  keywordTextIndex = focusNote.getIncludingCommentIndex("- Keyword", true);
                  let keywordContinuousLinksArr = toolbarUtils.getContinuousSequenceFromNum(
                    keywordLinksArr,
                    keywordTextIndex
                  );
                  focusNote.moveComment(
                    focusNote.comments.length - 1,
                    keywordContinuousLinksArr[keywordContinuousLinksArr.length - 1] + 1
                  );
                } else {
                  // There are already keyword links
                  let keywordLinksArr = [];
                  focusNote.comments.forEach((comment, index) => {
                    if (
                      comment.text &&
                      (comment.text.includes("- keywords") ||
                        comment.text.includes("marginnote4app://note/") ||
                        comment.text.includes("marginnote3app://note/"))
                    ) {
                      keywordLinksArr.push(index);
                    }
                  });
                  // MNUtil.showHUD(nextBarCommentIndex)
                  keywordTextIndex = focusNote.getIncludingCommentIndex("- Keyword", true);
                  let keywordContinuousLinksArr = toolbarUtils.getContinuousSequenceFromNum(
                    keywordLinksArr,
                    keywordTextIndex
                  );
                  focusNote.moveComment(
                    keywordIndexInFocusNote,
                    keywordContinuousLinksArr[keywordContinuousLinksArr.length - 1]
                  );
                }

                // Processing keyword cards
                focusNoteIndexInTargetKeywordNote = targetKeywordNote.getCommentIndex(
                  "marginnote4app://note/" + focusNote.noteId
                );
                if (focusNoteIndexInTargetKeywordNote == -1) {
                  targetKeywordNote.appendNoteLink(focusNote, "To");
                }
              });

              targetKeywordNote.refresh();
              focusNote.refresh();
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceInfoYear
  global.registerCustomAction("referenceInfoYear", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Add year",
      "",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            year = alert.textFieldAtIndex(0).text;
            if (buttonIndex === 1) {
              toolbarUtils.referenceInfoYear(focusNote, year);
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceGetRelatedReferencesByKeywords
  global.registerCustomAction("referenceGetRelatedReferencesByKeywords", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Screening literature based on keywords",
      "If there are multiple keywords, separate them with \n- Chinese semicolon; \n- English semicolon; \n- Chinese comma, \n- English comma, \n- one of them.",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            userInput = alert.textFieldAtIndex(0).text;
            let keywordArr = toolbarUtils.splitStringByFourSeparators(userInput);
            let findKeyword = false;
            let targetKeywordNoteArr = [];
            if (buttonIndex === 1) {
              let keywordLibraryNote = MNNote.new("3BA9E467-9443-4E5B-983A-CDC3F14D51DA");
              // MNUtil.showHUD(keywordArr)
              for (let j = 0; j <= keywordArr.length - 1; j++) {
                let keyword = keywordArr[j];
                findKeyword = false;
                for (let i = 0; i <= keywordLibraryNote.childNotes.length - 1; i++) {
                  if (
                    keywordLibraryNote.childNotes[i].noteTitle.includes(keyword) ||
                    keywordLibraryNote.childNotes[i].noteTitle.includes(keyword.toLowerCase())
                  ) {
                    targetKeywordNoteArr.push(keywordLibraryNote.childNotes[i]);
                    findKeyword = true;
                  }
                }
                if (!findKeyword) {
                  MNUtil.showHUD("Keyword: " + keyword + " does not exist!");
                }
              }

              try {
                MNUtil.undoGrouping(() => {
                  if (findKeyword) {
                    // MNUtil.showHUD(toolbarUtils.findCommonComments(targetKeywordNoteArr, "Related Literature:"))
                    let idsArr = toolbarUtils.findCommonComments(targetKeywordNoteArr, "Related Literature:");
                    if (idsArr.length > 0) {
                      // Shared links found
                      let resultLibraryNote = MNNote.new("F1FAEB86-179E-454D-8ECB-53C3BB098701");
                      if (!resultLibraryNote) {
                        // If not, place it below "Keyword Database"
                        resultLibraryNote = MNNote.new("3BA9E467-9443-4E5B-983A-CDC3F14D51DA");
                      }
                      let findResultNote = false;
                      let resultNote;
                      let combinations = toolbarUtils.generateArrayCombinations(keywordArr, " + "); // Generate all possible combinations
                      // MNUtil.showHUD(combinations)
                      for (let i = 0; i <= resultLibraryNote.childNotes.length - 1; i++) {
                        let childNote = resultLibraryNote.childNotes[i];

                        findResultNote = false; // Used to indicate whether a matching note was found.

                        // Iterate through all combinations and perform matching
                        for (let combination of combinations) {
                          if (childNote.noteTitle.match(/【.*】(.*)/)[1] === combination) {
                            // This assumes that childNote has been defined and has a noteTitle property.
                            resultNote = childNote; // Update the matched note object
                            findResultNote = true; // Set the flag for found matching notes to true.
                            break; // If a match is found, exit the loop.
                          }
                        }
                      }
                      // if (!findResultNote){
                      //   MNUtil.showHUD("false")
                      // } else {
                      //   MNUtil.showHUD("true")
                      // }
                      try {
                        if (!findResultNote) {
                          resultNote = MNNote.clone("DE4455DB-5C55-49F8-8C83-68D6D958E586");
                          resultNote.noteTitle =
                            "【Filtering Literature Based on Keywords】" + keywordArr.join(" + ");
                          resultLibraryNote.addChild(resultNote.note);
                        } else {
                          // Clear all comments in resultNote
                          // resultNote.comments.forEach((comment, index)=>{
                          //   resultNote.removeCommentByIndex(0)
                          // })
                          for (let i = resultNote.comments.length - 1; i >= 0; i--) {
                            focusNote.removeCommentByIndex(i);
                          }
                          // Re-merge templates
                          toolbarUtils.cloneAndMerge(resultNote, "DE4455DB-5C55-49F8-8C83-68D6D958E586");
                        }
                        idsArr.forEach((id) => {
                          resultNote.appendNoteLink(MNNote.new(id), "To");
                        });
                        resultNote.focusInFloatMindMap(0.5);
                      } catch (error) {
                        MNUtil.showHUD(error);
                      }
                    } else {
                      MNUtil.showHUD("No literature has the keyword '" + keywordArr.join("; ") + "");
                    }
                  }
                });
              } catch (error) {
                MNUtil.showHUD(error);
              }
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceKeywordsAddRelatedKeywords
  global.registerCustomAction("referenceKeywordsAddRelatedKeywords", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Add relevant keywords",
      "If there are multiple keywords, separate them with \n- Chinese semicolon; \n- English semicolon; \n- Chinese comma, \n- English comma, \n- one of them.",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            userInput = alert.textFieldAtIndex(0).text;
            let keywordArr = toolbarUtils.splitStringByFourSeparators(userInput);
            let findKeyword = false;
            let targetKeywordNote;
            let focusNoteIndexInTargetKeywordNote;
            if (buttonIndex === 1) {
              let keywordLibraryNote = MNNote.new("3BA9E467-9443-4E5B-983A-CDC3F14D51DA");
              // MNUtil.showHUD(keywordArr)
              keywordArr.forEach((keyword) => {
                findKeyword = false;
                for (let i = 0; i <= keywordLibraryNote.childNotes.length - 1; i++) {
                  if (
                    keywordLibraryNote.childNotes[i].noteTitle.includes(keyword) ||
                    keywordLibraryNote.childNotes[i].noteTitle.includes(keyword.toLowerCase())
                  ) {
                    targetKeywordNote = keywordLibraryNote.childNotes[i];
                    findKeyword = true;
                    // MNUtil.showHUD("Existence！" + targetKeywordNote.noteTitle)
                    // MNUtil.delay(0.5).then(()=>{
                    //   targetKeywordNote.focusInFloatMindMap()
                    // })
                  }
                }
                if (!findKeyword) {
                  // If it does not exist, add a keyword card.
                  targetKeywordNote = MNNote.clone("D1EDF37C-7611-486A-86AF-5DBB2039D57D");
                  if (keyword.toLowerCase() !== keyword) {
                    targetKeywordNote.note.noteTitle += "; " + keyword + "; " + keyword.toLowerCase();
                  } else {
                    targetKeywordNote.note.noteTitle += "; " + keyword;
                  }
                  keywordLibraryNote.addChild(targetKeywordNote.note);
                } else {
                  if (targetKeywordNote.noteTitle.includes(keyword)) {
                    if (!targetKeywordNote.noteTitle.includes(keyword.toLowerCase())) {
                      targetKeywordNote.note.noteTitle += "; " + keyword.toLowerCase();
                    }
                  } else {
                    // A lowercase version exists, but a non-lowercase version does not exist.
                    // Retrieve the content after the "References: Keywords" section in the noteTitle (assuming this content has a fixed format).
                    let noteTitleAfterKeywordPrefixPart =
                      targetKeywordNote.noteTitle.split("【Literature: Keywords】")[1]; // This will retrieve the content "; xxx; yyy".

                    // Add a new keyword followed by a semicolon and a space after the existing keyword.
                    let newKeywordPart = "; " + keyword; // Add semicolon, space, and new keyword

                    // Reassemble the string, placing the new keyword portion in its original position.
                    let updatedNoteTitle = `【References:Keywords】${newKeywordPart}${noteTitleAfterKeywordPrefixPart}`; // Construct a new title using a template string.

                    // Update the noteTitle property of targetKeywordNote or assign a value to a new variable.
                    targetKeywordNote.note.noteTitle = updatedNoteTitle; // If noteTitle is a property of an object
                  }
                }
                let keywordIndexInFocusNote = focusNote.getCommentIndex(
                  "marginnote4app://note/" + targetKeywordNote.noteId
                );
                if (keywordIndexInFocusNote == -1) {
                  // The keyword card hasn't been linked yet.
                  focusNote.appendNoteLink(targetKeywordNote, "To");
                  let keywordLinksArr = [];
                  focusNote.comments.forEach((comment, index) => {
                    if (
                      comment.text &&
                      (comment.text.includes("related keywords") ||
                        comment.text.includes("marginnote4app://note/") ||
                        comment.text.includes("marginnote3app://note/"))
                    ) {
                      keywordLinksArr.push(index);
                    }
                  });
                  let keywordContinuousLinksArr = toolbarUtils.getContinuousSequenceFromNum(
                    keywordLinksArr,
                    0
                  );
                  focusNote.moveComment(
                    focusNote.comments.length - 1,
                    keywordContinuousLinksArr[keywordContinuousLinksArr.length - 1] + 1
                  );
                } else {
                  // There are already keyword links
                  let keywordLinksArr = [];
                  focusNote.comments.forEach((comment, index) => {
                    if (
                      comment.text &&
                      (comment.text.includes("related keywords") ||
                        comment.text.includes("marginnote4app://note/") ||
                        comment.text.includes("marginnote3app://note/"))
                    ) {
                      keywordLinksArr.push(index);
                    }
                  });
                  // MNUtil.showHUD(nextBarCommentIndex)
                  let keywordContinuousLinksArr = toolbarUtils.getContinuousSequenceFromNum(
                    keywordLinksArr,
                    0
                  );
                  focusNote.moveComment(
                    keywordIndexInFocusNote,
                    keywordContinuousLinksArr[keywordContinuousLinksArr.length - 1] + 1
                  );
                }

                // Processing keyword cards
                focusNoteIndexInTargetKeywordNote = targetKeywordNote.getCommentIndex(
                  "marginnote4app://note/" + focusNote.noteId
                );
                if (focusNoteIndexInTargetKeywordNote == -1) {
                  targetKeywordNote.appendNoteLink(focusNote, "To");
                  targetKeywordNote.moveComment(
                    targetKeywordNote.comments.length - 1,
                    targetKeywordNote.getCommentIndex("Related Literature:", true)
                  );
                } else {
                  targetKeywordNote.moveComment(
                    focusNoteIndexInTargetKeywordNote,
                    targetKeywordNote.getCommentIndex("Related Literature:", true)
                  );
                }
              });
              targetKeywordNote.refresh();
              focusNote.refresh();
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceInfoAuthor
  global.registerCustomAction("referenceInfoAuthor", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Add authors to the literature",
      "For multiple authors, separate them with \n- Chinese semicolon; \n- English semicolon; \n- Chinese comma, \n- one of them", // Because some authors are abbreviated and contain Western commas, it is not suitable to separate them with Western commas.
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            let userInput = alert.textFieldAtIndex(0).text;
            let authorArr = toolbarUtils.splitStringByThreeSeparators(userInput);
            let findAuthor = false;
            let targetAuthorNote;
            let referenceInfoHtmlCommentIndex = focusNote.getCommentIndex("Literature Information:", true);
            let thoughtHtmlCommentIndex = focusNote.getCommentIndex("Related Thoughts:", true);
            let focusNoteIndexInTargetAuthorNote;
            let paperInfoIndexInTargetAuthorNote;
            if (buttonIndex === 1) {
              let authorLibraryNote = MNNote.new("A67469F8-FB6F-42C8-80A0-75EA1A93F746");
              authorArr.forEach((author) => {
                findAuthor = false;
                let possibleAuthorFormatArr = [
                  ...new Set(Object.values(toolbarUtils.getAbbreviationsOfName(author))),
                ];
                for (let i = 0; i <= authorLibraryNote.childNotes.length - 1; i++) {
                  let findPossibleAuthor = possibleAuthorFormatArr.some((possibleAuthor) =>
                    authorLibraryNote.childNotes[i].noteTitle.includes(possibleAuthor)
                  );
                  if (findPossibleAuthor) {
                    targetAuthorNote = authorLibraryNote.childNotes[i];
                    findAuthor = true;
                  }
                }
                if (!findAuthor) {
                  // MNUtil.showHUD(possibleAuthorFormatArr)
                  // If it does not exist, add an author card.
                  targetAuthorNote = MNNote.clone("BBA8DDB0-1F74-4A84-9D8D-B04C5571E42A");
                  possibleAuthorFormatArr.forEach((possibleAuthor) => {
                    targetAuthorNote.note.noteTitle += "; " + possibleAuthor;
                  });
                  authorLibraryNote.addChild(targetAuthorNote.note);
                } else {
                  // If it exists, add the noteTitle that is not in targetAuthorNote within possibleAuthorFormatArr.
                  for (let possibleAuthor of possibleAuthorFormatArr) {
                    if (!targetAuthorNote.note.noteTitle.includes(possibleAuthor)) {
                      targetAuthorNote.note.noteTitle += "; " + possibleAuthor;
                    }
                  }
                }
                let authorTextIndex = focusNote.getIncludingCommentIndex("- 作者", true);
                if (authorTextIndex == -1) {
                  focusNote.appendMarkdownComment("- 作者（Authors）：", referenceInfoHtmlCommentIndex + 1);
                }
                let authorIndexInFocusNote = focusNote.getCommentIndex(
                  "marginnote4app://note/" + targetAuthorNote.noteId
                );
                if (authorIndexInFocusNote == -1) {
                  // The author card hasn't been linked yet.
                  focusNote.appendNoteLink(targetAuthorNote, "To");
                  let authorLinksArr = [];
                  focusNote.comments.forEach((comment, index) => {
                    if (
                      comment.text &&
                      (comment.text.includes("- Author") ||
                        comment.text.includes("marginnote4app://note/") ||
                        comment.text.includes("marginnote3app://note/"))
                    ) {
                      authorLinksArr.push(index);
                    }
                  });
                  let authorContinuousLinksArr = toolbarUtils.getContinuousSequenceFromNum(
                    authorLinksArr,
                    referenceInfoHtmlCommentIndex + 1
                  );
                  focusNote.moveComment(
                    focusNote.comments.length - 1,
                    authorContinuousLinksArr[authorContinuousLinksArr.length - 1] + 1
                  );
                } else {
                  let authorLinksArr = [];
                  focusNote.comments.forEach((comment, index) => {
                    if (
                      comment.text &&
                      (comment.text.includes("- Author") ||
                        comment.text.includes("marginnote4app://note/") ||
                        comment.text.includes("marginnote3app://note/"))
                    ) {
                      authorLinksArr.push(index);
                    }
                  });
                  // MNUtil.showHUD(nextBarCommentIndex)
                  let authorContinuousLinksArr = toolbarUtils.getContinuousSequenceFromNum(
                    authorLinksArr,
                    referenceInfoHtmlCommentIndex + 1
                  );
                  focusNote.moveComment(
                    authorIndexInFocusNote,
                    authorContinuousLinksArr[authorContinuousLinksArr.length - 1]
                  );
                }

                // Processing author cards
                focusNoteIndexInTargetAuthorNote = targetAuthorNote.getCommentIndex(
                  "marginnote4app://note/" + focusNote.noteId
                );
                paperInfoIndexInTargetAuthorNote = targetAuthorNote.getIncludingCommentIndex("**论文**");
                if (focusNoteIndexInTargetAuthorNote == -1) {
                  targetAuthorNote.appendNoteLink(focusNote, "To");
                  if (toolbarUtils.getReferenceNoteType(focusNote) == "book") {
                    targetAuthorNote.moveComment(
                      targetAuthorNote.comments.length - 1,
                      paperInfoIndexInTargetAuthorNote
                    );
                  }
                } else {
                  if (toolbarUtils.getReferenceNoteType(focusNote) == "book") {
                    if (focusNoteIndexInTargetAuthorNote > paperInfoIndexInTargetAuthorNote) {
                      targetAuthorNote.moveComment(
                        focusNoteIndexInTargetAuthorNote,
                        paperInfoIndexInTargetAuthorNote
                      );
                    }
                  }
                }
              });

              targetAuthorNote.refresh();
              focusNote.refresh();
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceInfoInputRef
  global.registerCustomAction("referenceInfoInputRef", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Add citation style",
      "That is, the specific citation style of the references section of the document",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            let referenceContent = toolbarUtils.extractRefContentFromReference(
              alert.textFieldAtIndex(0).text
            );
            referenceContent = toolbarUtils.formatEnglishStringPunctuationSpace(referenceContent);
            if (buttonIndex == 1) {
              let thoughtHtmlCommentIndex = focusNote.getCommentIndex("Related Thoughts:", true);
              let refTextIndex = focusNote.getIncludingCommentIndex("- Reference style", true);
              if (refTextIndex == -1) {
                focusNote.appendMarkdownComment("- Quote style:", thoughtHtmlCommentIndex);
                focusNote.appendMarkdownComment(referenceContent, thoughtHtmlCommentIndex + 1);
              } else {
                focusNote.appendMarkdownComment(referenceContent, refTextIndex + 1);
              }
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceInfoRefFromInputRefNum
  global.registerCustomAction("referenceInfoRefFromInputRefNum", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Enter document number",
      "",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        try {
          MNUtil.undoGrouping(() => {
            if (buttonIndex == 1) {
              if (focusNote.noteTitle !== "") {
                MNUtil.showHUD(
                  "Wrong card selected! You should select the excerpt card from the reference list!"
                );
              } else {
                let referenceContent = toolbarUtils.extractRefContentFromReference(focusNote.excerptText);
                referenceContent = toolbarUtils.formatEnglishStringPunctuationSpace(referenceContent);
                let refNum = alert.textFieldAtIndex(0).text;
                if (refNum == 0) {
                  MNUtil.showHUD("No card ID is bound to the current document");
                } else {
                  currentDocmd5 = MNUtil.currentDocmd5;
                  let targetNoteId = toolbarConfig.referenceIds[currentDocmd5]
                    ? referenceIds[currentDocmd5][refNum]
                    : undefined;
                  if (targetNoteId == undefined) {
                    MNUtil.showHUD("Card ID not yet bound");
                  } else {
                    let targetNote = MNNote.new(targetNoteId);
                    let thoughtHtmlCommentIndex = targetNote.getCommentIndex("Related Thoughts:", true);
                    let refTextIndex = targetNote.getCommentIndex("- Quote style:", true);
                    if (refTextIndex == -1) {
                      targetNote.appendMarkdownComment("- Quote style:", thoughtHtmlCommentIndex);
                      targetNote.merge(focusNote);
                      targetNote.appendMarkdownComment(referenceContent);
                      targetNote.moveComment(targetNote.comments.length - 1, thoughtHtmlCommentIndex + 1);
                      targetNote.moveComment(targetNote.comments.length - 1, thoughtHtmlCommentIndex + 2);
                    } else {
                      targetNote.merge(focusNote);
                      targetNote.appendMarkdownComment(referenceContent);
                      targetNote.moveComment(targetNote.comments.length - 1, refTextIndex + 1);
                      targetNote.moveComment(targetNote.comments.length - 1, refTextIndex + 2);
                    }
                  }
                }
              }
            }
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      }
    );
  });

  // referenceInfoRefFromFocusNote
  global.registerCustomAction("referenceInfoRefFromFocusNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      MNUtil.undoGrouping(() => {
        if (focusNote.noteTitle !== "") {
          MNUtil.showHUD("Wrong card selected! You should select the excerpt card from the reference list!");
        } else {
          let referenceContent = toolbarUtils.extractRefContentFromReference(focusNote.excerptText);
          referenceContent = toolbarUtils.formatEnglishStringPunctuationSpace(referenceContent);
          let refNum = toolbarUtils.extractRefNumFromReference(focusNote.excerptText);
          if (refNum == 0) {
            MNUtil.showHUD("No card ID is bound to the current document");
          } else {
            currentDocmd5 = MNUtil.currentDocmd5;
            let targetNoteId = toolbarConfig.referenceIds[currentDocmd5]
              ? referenceIds[currentDocmd5][refNum]
              : undefined;
            if (targetNoteId == undefined) {
              MNUtil.showHUD("Card ID not yet bound");
            } else {
              let targetNote = MNNote.new(targetNoteId);
              let thoughtHtmlCommentIndex = targetNote.getCommentIndex("Related Thoughts:", true);
              let refTextIndex = targetNote.getCommentIndex("- Quote style:", true);
              if (refTextIndex == -1) {
                targetNote.appendMarkdownComment("- Quote style:", thoughtHtmlCommentIndex);
                targetNote.merge(focusNote);
                targetNote.appendMarkdownComment(referenceContent);
                targetNote.moveComment(targetNote.comments.length - 1, thoughtHtmlCommentIndex + 1);
                targetNote.moveComment(targetNote.comments.length - 1, thoughtHtmlCommentIndex + 2);
              } else {
                targetNote.merge(focusNote);
                targetNote.appendMarkdownComment(referenceContent);
                targetNote.moveComment(targetNote.comments.length - 1, refTextIndex + 1);
                targetNote.moveComment(targetNote.comments.length - 1, refTextIndex + 2);
              }
            }
          }
        }
      });
    } catch (error) {
      MNUtil.showHUD(error);
    }
  });

  // referenceMoveLastCommentToThought
  // referenceMoveLastTwoCommentsToThought
  // referenceAddThoughtPointAndMoveLastCommentToThought
  // referenceAddThoughtPoint
  // referenceMoveUpThoughtPoints
  // ========== PROOF related (20 items) ==========

  // moveProofDown
  // moveLastCommentToProofStart
  // moveProofToStart
  // renewProofContentPoints
  // renewProofContentPointsToSubpointType
  // htmlCommentToProofTop
  // htmlCommentToProofFromClipboard
  // htmlCommentToProofBottom
  // addProofToStartFromClipboard
  // addProofFromClipboard
  // proofAddMethodComment
  // proofAddNewAntiexampleWithComment
  // proofAddNewMethodWithComment
  // proofAddNewAntiexample
  // proofAddNewMethod
  // moveLastLinkToProof
  // moveLastCommentToProof
  // moveLastTwoCommentsToProof
  // renewProof
  // moveProofToMethod
  // ========== TEMPLATE related (6 items) ==========

  // addTemplate
  // mergeTemplateNotes
  // multiTemplateMakeNotes
  // TemplateMakeNotes
  // TemplateMakeChildNotes
  // TemplateMakeDescendantNotes
  // ========== HTML Related (12 items) ==========

  // addHtmlMarkdownComment
  global.registerCustomAction("addHtmlMarkdownComment", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Add HTML or Markdown comments",
      "",
      2,
      "Cancel",
      htmlSettingTitles,
      (alert, buttonIndex) => {
        MNUtil.undoGrouping(() => {
          try {
            const inputCommentText = alert.textFieldAtIndex(0).text;
            // Button indexes start from 1 (0 is the cancel button).
            const selectedIndex = buttonIndex - 1;
            if (selectedIndex >= 0 && selectedIndex < htmlSetting.length) {
              focusNote.appendMarkdownComment(
                HtmlMarkdownUtils.createHtmlMarkdownText(inputCommentText, htmlSetting[selectedIndex].type)
              );
            }
          } catch (error) {
            MNUtil.showHUD(error);
          }
        });
      }
    );
  });

  // addProofCheckComment
  global.registerCustomAction("addProofCheckComment", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      MNUtil.undoGrouping(() => {
        // Directly call the native API to bypass MNNote's null check.
        const htmlContent = HtmlMarkdownUtils.createHtmlMarkdownText(undefined, "check");
        if (htmlContent) {
          focusNote.note.appendMarkdownComment(htmlContent);
        }
        MNUtil.log(htmlContent);
      });
    } catch (error) {
      MNUtil.showHUD("Failed to add CHECK comment: " + error);
    }
  });

  // addCaseComment - Add a numbered case comment
  global.registerCustomAction("addCaseComment", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Add Case Comment",
      "Enter the case details (serial numbers will be added automatically)",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        if (buttonIndex === 1) {
          MNUtil.undoGrouping(() => {
            try {
              const inputText = alert.textFieldAtIndex(0).text;
              if (inputText && inputText.trim()) {
                const number = HtmlMarkdownUtils.addCaseComment(focusNote, inputText.trim());
                MNUtil.showHUD(`✅ Case ${number} has been added`);
              }
            } catch (error) {
              MNUtil.showHUD("Failed to add a case comment: " + error);
            }
          });
        }
      }
    );
  });

  // addStepComment - Add numbered Step comments
  global.registerCustomAction("addStepComment", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Add Step Comment",
      "Enter the steps (numbers will be added automatically)",
      2,
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        if (buttonIndex === 1) {
          MNUtil.undoGrouping(() => {
            try {
              const inputText = alert.textFieldAtIndex(0).text;
              if (inputText && inputText.trim()) {
                const number = HtmlMarkdownUtils.addStepComment(focusNote, inputText.trim());
                MNUtil.showHUD(`✅ Step ${number} has been added`);
              }
            } catch (error) {
              MNUtil.showHUD("Failed to add Step comment: " + error);
            }
          });
        }
      }
    );
  });

  // ocrAsProofTitle - OCR recognition set as title
  global.registerCustomAction("ocrAsProofTitle", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    try {
      // Check if focusNote is present
      if (!focusNote) {
        MNUtil.showHUD("Please select a note first");
        return;
      }

      // Get image data
      let imageData = MNUtil.getDocImage(true, true);
      if (!imageData && focusNote) {
        imageData = MNNote.getImageFromNote(focusNote);
      }
      if (!imageData) {
        MNUtil.showHUD("No recognizable image found");
        return;
      }

      // OCR source option configuration
      const ocrSources = [
        { name: "Doc2X - Professional Document Recognition", source: "Doc2X" },
        { name: "SimpleTex - Mathematical Formulas", source: "SimpleTex" },
        { name: "GPT-4o - OpenAI Interface", source: "GPT-4o" },
        { name: "GPT-4o mini", source: "GPT-4o-mini" },
        { name: "glm-4v-plus - 智谱AI Plus", source: "glm-4v-plus" },
        { name: "glm-4v-flash - 智谱AI Flash", source: "glm-4v-flash" },
        { name: "Claude 3.5 Sonnet", source: "claude-3-5-sonnet-20241022" },
        { name: "Claude 3.7 Sonnet", source: "claude-3-7-sonnet" },
        { name: "Gemini 2.0 Flash - Google", source: "gemini-2.0-flash" },
        { name: "Moonshot-v1", source: "Moonshot-v1" },
        { name: "Default Configuration", source: "default" },
      ];

      // Display the OCR source selection dialog box
      const sourceNames = ocrSources.map((s) => s.name);
      const selectedIndex = await MNUtil.userSelect(
        "Select OCR source",
        "Please select the recognition engine to use",
        sourceNames
      );

      // Handling user cancellations
      if (selectedIndex === 0) {
        return;
      }

      const selectedOCR = ocrSources[selectedIndex - 1];
      MNUtil.showHUD(`Using ${selectedOCR.name} to identify...`);

      // Execute OCR
      let ocrResult;
      if (typeof ocrNetwork !== "undefined") {
        // Using the MNOCR plugin
        ocrResult = await ocrNetwork.OCR(imageData, selectedOCR.source, true);
      } else if (typeof toolbarUtils !== "undefined") {
        // Using free OCR (ChatGPT Vision - glm-4v-flash model)
        ocrResult = await toolbarUtils.freeOCR(imageData);
      } else {
        MNUtil.showHUD("Please install the MN OCR plugin first");
        return;
      }

      if (ocrResult) {
        MNUtil.undoGrouping(() => {
          // Set the OCR result as the note title
          focusNote.noteTitle = ocrResult.trim();
          MNUtil.showHUD("✅ Set as title");
        });

        // Send OCR completion notification (optional, for integration with other plugins)
        MNUtil.postNotification("OCRFinished", {
          action: "toTitle",
          noteId: focusNote.noteId,
          result: ocrResult,
        });
      } else {
        MNUtil.showHUD("OCR recognition failed");
      }
    } catch (error) {
      MNUtil.showHUD("OCR recognition failed: " + error.message);
      if (typeof toolbarUtils !== "undefined") {
        toolbarUtils.addErrorLog(error, "ocrAsProofTitle");
      }
    }
  });

  // ocrAsProofTitleWithTranslation - OCR recognizes and translates the title and sets it as the title.
  global.registerCustomAction("ocrAsProofTitleWithTranslation", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    try {
      // Check if focusNote is present
      if (!focusNote) {
        MNUtil.showHUD("Please select a note first");
        return;
      }

      // Get image data
      let imageData = MNUtil.getDocImage(true, true);
      if (!imageData && focusNote) {
        imageData = MNNote.getImageFromNote(focusNote);
      }
      if (!imageData) {
        MNUtil.showHUD("No recognizable image found");
        return;
      }

      // Use the configured OCR source, which defaults to Doc2X.
      const ocrSource = toolbarConfig.ocrSource || toolbarConfig.defaultOCRSource || "Doc2X";

      // OCR source name mapping
      const ocrSourceNames = {
        Doc2X: "Doc2X - Professional Document Recognition",
        SimpleTex: "SimpleTex - Mathematical formulas",
        "GPT-4o": "GPT-4o - OpenAI Vision",
        "GPT-4o-mini": "GPT-4o mini",
        "glm-4v-plus": "glm-4v-plus - 智谱AI Plus",
        "glm-4v-flash": "glm-4v-flash - 智谱AI Flash",
        "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
        "claude-3-7-sonnet": "Claude 3.7 Sonnet",
        "gemini-2.0-flash": "Gemini 2.0 Flash - Google",
        "Moonshot-v1": "Moonshot-v1",
      };

      const sourceName = ocrSourceNames[ocrSource] || ocrSource;
      MNUtil.showHUD(`Using ${sourceName} to identify...`);

      // Execute OCR
      let ocrResult;
      if (typeof ocrNetwork !== "undefined") {
        // Using the MNOCR plugin
        ocrResult = await ocrNetwork.OCR(imageData, ocrSource, true);
      } else if (typeof toolbarUtils !== "undefined") {
        // Using free OCR (ChatGPT Vision - glm-4v-flash model)
        ocrResult = await toolbarUtils.freeOCR(imageData);
      } else {
        MNUtil.showHUD("Please install the MN OCR plugin first");
        return;
      }

      if (ocrResult) {
        // Ask if you want a translation
        const confirmTranslate = await MNUtil.confirm(
          "Should it be translated into Chinese?",
          "OCR recognition complete:\n\n" +
            ocrResult.substring(0, 100) +
            (ocrResult.length > 100 ? "..." : "") +
            "\n\nShould the result be translated into Chinese?"
        );

        if (confirmTranslate) {
          // First set the OCR result as the title
          MNUtil.undoGrouping(() => {
            focusNote.noteTitle = ocrResult.trim();
            MNUtil.showHUD("✅ OCR result set as title, translating...");
          });

          // Asynchronous translation
          (async () => {
            try {
              // Use the default translation model configured directly
              const selectedModel = toolbarConfig.translateModel || "gpt-4o-mini";

              MNUtil.showHUD(`Translation is being used with ${selectedModel}...`);

              // Perform translation
              const translatedText = await toolbarUtils.ocrWithTranslation(ocrResult, selectedModel);

              MNUtil.undoGrouping(() => {
                // Update the translation results to the note title
                focusNote.noteTitle = translatedText.trim();
                MNUtil.showHUD("✅ Translation complete and title updated");
              });

              // Send OCR completion notification (optional, for integration with other plugins)
              MNUtil.postNotification("OCRFinished", {
                action: "toTitleWithTranslation",
                noteId: focusNote.noteId,
                originalResult: ocrResult,
                translatedResult: translatedText,
              });
            } catch (translationError) {
              MNUtil.showHUD("Translation failed: " + translationError.message);
              if (typeof toolbarUtils !== "undefined") {
                toolbarUtils.addErrorLog(translationError, "ocrAsProofTitleWithTranslation - translation");
              }
            }
          })();
        } else {
          // The user chose not to translate and used the OCR results directly.
          MNUtil.undoGrouping(() => {
            focusNote.noteTitle = ocrResult.trim();
            MNUtil.showHUD("✅ Set as title (untranslated)");
          });
        }
      } else {
        MNUtil.showHUD("OCR recognition failed");
      }
    } catch (error) {
      MNUtil.showHUD("OCR translation failed: " + error.message);
      if (typeof toolbarUtils !== "undefined") {
        toolbarUtils.addErrorLog(error, "ocrAsProofTitleWithTranslation");
      }
    }
  });

  // ocrAllUntitledDescendants - Batch OCR Untitled Descendant Cards
  global.registerCustomAction("ocrAllUntitledDescendants", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    try {
      // Check if focusNote is present
      if (!focusNote) {
        MNUtil.showHUD("Please select a note first");
        return;
      }

      // Get all descendant cards
      const descendantData = focusNote.descendantNodes;
      const descendants = descendantData ? descendantData.descendant : [];

      // Create an array containing the selected card and all its descendant cards.
      const allNotes = [focusNote, ...descendants];

      // Filter cards that have no title and an image
      const untitledNotes = allNotes.filter((note) => {
        // Check if there is no title
        if (note.noteTitle && note.noteTitle.trim()) {
          return false;
        }
        // Check if there are any images
        const imageData = MNNote.getImageFromNote(note);
        return imageData !== null && imageData !== undefined;
      });

      if (untitledNotes.length === 0) {
        MNUtil.showHUD("No descendant card with an untitled title and containing an image was found");
        return;
      }

      // Confirm Operation
      const confirmed = await MNUtil.confirm(
        "Batch OCR Confirmation",
        `Found ${untitledNotes.length} untitled cards. Should we perform OCR recognition?`
      );

      if (!confirmed) {
        return;
      }

      // OCR source option configuration (consistent with individual OCR)
      const ocrSources = [
        { name: "Doc2X - Professional Document Recognition", source: "Doc2X" },
        { name: "SimpleTex - Mathematical Formulas", source: "SimpleTex" },
        { name: "GPT-4o - OpenAI Interface", source: "GPT-4o" },
        { name: "GPT-4o mini", source: "GPT-4o-mini" },
        { name: "glm-4v-plus - 智谱AI Plus", source: "glm-4v-plus" },
        { name: "glm-4v-flash - 智谱AI Flash", source: "glm-4v-flash" },
        { name: "Claude 3.5 Sonnet", source: "claude-3-5-sonnet-20241022" },
        { name: "Claude 3.7 Sonnet", source: "claude-3-7-sonnet" },
        { name: "Gemini 2.0 Flash - Google", source: "gemini-2.0-flash" },
        { name: "Moonshot-v1", source: "Moonshot-v1" },
        { name: "Default Configuration", source: "default" },
      ];

      // Display the OCR source selection dialog box
      const sourceNames = ocrSources.map((s) => s.name);
      const selectedIndex = await MNUtil.userSelect(
        "Select OCR source",
        "Please select the recognition engine to use (this will be applied to all cards)",
        sourceNames
      );

      // Handling user cancellations
      if (selectedIndex === 0) {
        return;
      }

      const selectedOCR = ocrSources[selectedIndex - 1];
      MNUtil.showHUD(`Start batch recognition (${selectedOCR.name})...`);

      // Batch processing
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < untitledNotes.length; i++) {
        const note = untitledNotes[i];

        try {
          // Get image data
          const imageData = MNNote.getImageFromNote(note);
          if (!imageData) {
            failCount++;
            continue;
          }

          // Execute OCR
          let ocrResult;
          if (typeof ocrNetwork !== "undefined") {
            ocrResult = await ocrNetwork.OCR(imageData, selectedOCR.source, true);
          } else if (typeof toolbarUtils !== "undefined") {
            // Downgrade to free OCR
            ocrResult = await toolbarUtils.freeOCR(imageData);
          } else {
            MNUtil.showHUD("Please install the MN OCR plugin first");
            return;
          }

          // Set title
          if (ocrResult && ocrResult.trim()) {
            MNUtil.undoGrouping(() => {
              note.noteTitle = ocrResult.trim();
            });
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
          if (typeof toolbarUtils !== "undefined") {
            toolbarUtils.addErrorLog(error, "ocrAllUntitledDescendants", {
              noteId: note.noteId,
            });
          }
        }

        // Update progress (updates every 3 or the last one processed)
        if ((i + 1) % 3 === 0 || i === untitledNotes.length - 1) {
          MNUtil.showHUD(`Processing progress: ${i + 1}/${untitledNotes.length}`);
          await MNUtil.delay(0.1); // Briefly delay UI updates
        }
      }

      // Display completion information
      let resultMessage = `Processing complete! Success: ${successCount}`;
      if (failCount > 0) {
        resultMessage += `, if failed: ${failCount}`;
      }
      MNUtil.showHUD(resultMessage);

      // Send batch completion notification (optional, for integration with other plugins)
      MNUtil.postNotification("BatchOCRFinished", {
        action: "batchTitleOCR",
        parentNoteId: focusNote.noteId,
        totalCount: untitledNotes.length,
        successCount: successCount,
        failCount: failCount,
      });
    } catch (error) {
      MNUtil.showHUD("Batch OCR failed: " + error.message);
      if (typeof toolbarUtils !== "undefined") {
        toolbarUtils.addErrorLog(error, "ocrAllUntitledDescendants");
      }
    }
  });

  // copyMarkdownVersionFocusNoteURL
  global.registerCustomAction("copyMarkdownVersionFocusNoteURL", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        // Call the new method encapsulated in KnowledgeBaseTemplate
        KnowledgeBaseTemplate.copyMarkdownLinkWithQuickPhrases(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // renewContentPointsToHtmlType
  global.registerCustomAction("renewContentsToHtmlMarkdownCommentType", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        HtmlMarkdownUtils.convertFieldContentToHtmlMDByPopup(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // htmlMDCommentsToNextLevelType
  // htmlMDCommentsToLastLevelType
  // htmlCommentToBottom
  // convetHtmlToMarkdown
  // clearContentKeepMarkdownText

  // clearContentKeepHtmlText
  // splitMarkdownTextInFocusNote
  global.registerCustomAction("splitMarkdownTextInFocusNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    toolbarUtils.markdown2Mindmap({ source: "currentNote" });
  });

  // splitComments - Split comments into individual cards
  global.registerCustomAction("splitComments", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }

    KnowledgeBaseTemplate.splitComments(focusNote);
  });

  global.registerCustomAction("extractProofContentAndSplitComments", async function (context) {
    const { focusNote } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }
    let proofContentIndexArr = KnowledgeBaseTemplate.getHtmlCommentExcludingFieldBlockIndexArr(
      focusNote,
      "prove"
    );
    KnowledgeBaseTemplate.extractCommentsAndSeparate(focusNote, proofContentIndexArr);
  });

  global.registerCustomAction("updateChildNotesPrefixes", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    if (!focusNote) {
      MNUtil.showHUD("Please select a category card first");
      return;
    }

    // Call the batch update function of KnowledgeBaseTemplate
    KnowledgeBaseTemplate.batchUpdateChildrenPrefixes(focusNote);
  });

  global.registerCustomAction("updateDescentNotesPrefixes", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    if (!focusNote) {
      MNUtil.showHUD("Please select a category card first");
      return;
    }

    // Call the batch update function of KnowledgeBaseTemplate
    KnowledgeBaseTemplate.batchUpdateChildrenPrefixes(focusNote, true);
  });

  global.registerCustomAction("updateChildNotesPrefixes", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    if (!focusNote) {
      MNUtil.showHUD("Please select a category card first");
      return;
    }

    // Call the batch update function of KnowledgeBaseTemplate
    KnowledgeBaseTemplate.batchUpdateChildrenPrefixes(focusNote);
  });

  global.registerCustomAction("addAsBrotherNoteofParentNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    let parentNote = focusNote.parentNote;
    MNUtil.undoGrouping(() => {
      if (parentNote.parentNote) {
        parentNote.parentNote.addChild(focusNote);
        focusNote.focusInMindMap(0.3);
      }
    });
  });

  // forceUpdateTitlePrefix - Force change the title prefix of the selected card
  global.registerCustomAction("forceUpdateTitlePrefix", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }

    // Force update the title prefix of the selected card
    MNUtil.undoGrouping(() => {
      KnowledgeBaseTemplate.changeTitle(focusNote, true);
      MNUtil.showHUD("✅ Title prefix has been forcibly updated");
    });
  });

  // changeHtmlMarkdownCommentTypeByPopup
  global.registerCustomAction("changeHtmlMarkdownCommentTypeByPopup", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.changeHtmlMarkdownCommentTypeByPopup(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // adjustHtmlMDLevelsUp - Batch move levels up
  global.registerCustomAction("adjustHtmlMDLevelsUp", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        const adjustedCount = HtmlMarkdownUtils.adjustAllHtmlMDLevels(focusNote, "up");
        if (adjustedCount > 0) {
          MNUtil.showHUD(`✅ ${adjustedCount} levels have been moved up one level`);
        } else {
          MNUtil.showHUD("No adjustable hierarchical comments");
        }
      } catch (error) {
        MNUtil.showHUD("Failed to adjust layer: " + error.toString());
      }
    });
  });

  // adjustHtmlMDLevelsDown - Batch move down levels
  global.registerCustomAction("adjustHtmlMDLevelsDown", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        const adjustedCount = HtmlMarkdownUtils.adjustAllHtmlMDLevels(focusNote, "down");
        if (adjustedCount > 0) {
          MNUtil.showHUD(`✅ ${adjustedCount} levels have been moved down one level`);
        } else {
          MNUtil.showHUD("No adjustable hierarchical comments");
        }
      } catch (error) {
        MNUtil.showHUD("Failed to adjust layer: " + error.toString());
      }
    });
  });

  // adjustHtmlMDLevelsByHighest - Adjusts the hierarchy by the highest level
  global.registerCustomAction("adjustHtmlMDLevelsByHighest", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    // Define optional levels
    const levelOptions = [
      "🎯 goal (highest level)",
      "🚩 level1",
      "▸ level2",
      "▪ level3",
      "• level4",
      "· level5",
    ];

    const levelValues = ["goal", "level1", "level2", "level3", "level4", "level5"];

    // A pop-up window allows the user to select the highest priority target.
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Select the highest level of target",
      "The highest level currently in the card will be adjusted to the level you select, and other levels will be adjusted accordingly.",
      0,
      "Cancel",
      levelOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) return; // User cancels

        const targetLevel = levelValues[buttonIndex - 1];

        MNUtil.undoGrouping(() => {
          try {
            const result = HtmlMarkdownUtils.adjustHtmlMDLevelsByHighest(focusNote, targetLevel);

            if (result.adjustedCount > 0) {
              MNUtil.showHUD(
                `✅ The number of levels has been adjusted by ${result.adjustedCount}. The highest level has been changed from ${result.originalHighest} to ${result.targetHighest}`
              );
            } else if (result.originalHighest === result.targetHighest) {
              MNUtil.showHUD(`The current highest level is ${targetLevel}`);
            } else {
              MNUtil.showHUD("No adjustable level comments found");
            }
          } catch (error) {
            MNUtil.showHUD("Failed to adjust layer: " + error.toString());
          }
        });
      }
    );
  });

  // addEquivalenceProof - Add equivalence proof (using template)
  global.registerCustomAction("addEquivalenceProof", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }

    await KnowledgeBaseTemplate.addEquivalenceProof(focusNote);
  });

  // manageProofTemplates - Manage Proof Templates
  global.registerCustomAction("manageProofTemplates", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    try {
      // Call the proof template management interface
      await KnowledgeBaseTemplate.manageProofTemplates();
    } catch (error) {
      MNUtil.showHUD(`❌ Error: ${error.message}`);
    }
  });

  // ========== MOVE related (19 items) ==========

  // moveToExcerptPartTop
  // moveToExcerptPartBottom
  global.registerCustomAction("moveToExcerptPartBottom", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.autoMoveNewContentToField(focusNote, "摘录");
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // mergeToParentAndMoveCommentToExcerpt
  global.registerCustomAction("mergeToParentAndMoveCommentToExcerpt", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        // Check if there is a parent card
        if (!focusNote.parentNote) {
          MNUtil.showHUD("❌ The current card has no parent card");
          return;
        }

        const parentNote = focusNote.parentNote;

        focusNote.title = "";
        // Merge child cards into parent cards
        focusNote.mergeInto(parentNote);

        // Delay to ensure the merge is complete
        MNUtil.delay(0.1).then(() => {
          // Move the latest comment from the parent card to the excerpt section
          KnowledgeBaseTemplate.autoMoveNewContentToField(parentNote, "摘录");
          MNUtil.showHUD("✅ Comments have been merged into the parent card and moved to the excerpt");
        });
      } catch (error) {
        MNUtil.showHUD(`❌ Operation failed: ${error.message}`);
      }
    });
  });

  global.registerCustomAction("mergeExerptAreToParentAndMoveCommentToExcerpt", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        // Check if there is a parent card
        if (!focusNote.parentNote) {
          MNUtil.showHUD("❌ The current card has no parent card");
          return;
        }

        const parentNote = focusNote.parentNote;

        focusNote.title = "";
        // Merge child cards into parent cards
        KnowledgeBaseTemplate.retainFieldContentByName(focusNote, "摘录区");
        focusNote.mergeInto(parentNote);

        // Delay to ensure the merge is complete
        MNUtil.delay(0.1).then(() => {
          // Move the latest comment from the parent card to the excerpt section
          KnowledgeBaseTemplate.autoMoveNewContentToField(parentNote, "摘录");
          MNUtil.showHUD("✅ Comments have been merged into the parent card and moved to the excerpt");
        });
      } catch (error) {
        MNUtil.showHUD(`❌ Operation failed: ${error.message}`);
      }
    });
  });

  // moveToParentAndMoveCommentToTop
  global.registerCustomAction("mergeToParentAndMoveCommentToTop", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        // Check if there is a parent card
        if (!focusNote.parentNote) {
          MNUtil.showHUD("❌ The current card has no parent card");
          return;
        }

        const parentNote = focusNote.parentNote;
        focusNote.title = "";
        // Merge child cards into parent cards
        focusNote.mergeInto(parentNote);

        // Delay to ensure the merge is complete
        MNUtil.delay(0.1).then(() => {
          const commentsArr = KnowledgeBaseTemplate.autoGetNewContentToMoveIndexArr(parentNote);
          if (commentsArr.length >= 0) {
            // Move the latest comment to the top (index 0)
            parentNote.moveCommentsByIndexArr(commentsArr, 0);
            MNUtil.showHUD("✅ Merged into the parent card and moved to the top");
          }
        });
      } catch (error) {
        MNUtil.showHUD(`❌ Operation failed: ${error.message}`);
      }
    });
  });

  // moveToInput
  // moveToPreparationForExam
  // moveToInternalize
  // moveToBeClassified
  // moveLastThreeCommentByPopupTo
  // moveLastTwoCommentByPopupTo
  // moveLastOneCommentByPopupTo
  // manageCommentsByPopup
  global.registerCustomAction("manageCommentsByPopup", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.manageCommentsByPopup(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // moveLastCommentToBelongArea - Move the last comment to its corresponding area
  global.registerCustomAction("moveLastCommentToBelongArea", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        if (!focusNote || !focusNote.comments || focusNote.comments.length === 0) {
          MNUtil.showHUD("❌ No comments are movable");
          return;
        }

        // Use KnowledgeBaseTemplate.moveCommentsArrToField to move to the "belonging" field.
        // This method will automatically handle the case where the field does not exist.
        KnowledgeBaseTemplate.moveCommentsArrToField(focusNote, "Z", "所属", true);
      } catch (error) {
        MNUtil.showHUD(`❌ Move failed: ${error.message || error}`);
      }
    });
  });

  global.registerCustomAction("moveLastCommentToProofAreaTop", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        if (!focusNote || !focusNote.comments || focusNote.comments.length === 0) {
          MNUtil.showHUD("❌ No comments are movable");
          return;
        }

        // This method will automatically handle the case where the field does not exist.
        KnowledgeBaseTemplate.moveCommentsArrToField(focusNote, "Z", "证明", false);
      } catch (error) {
        MNUtil.showHUD(`❌ Move failed: ${error.message || error}`);
      }
    });
  });

  global.registerCustomAction("moveLastTwoCommentsToProofAreaBottom", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        if (!focusNote || !focusNote.comments || focusNote.comments.length === 0) {
          MNUtil.showHUD("❌ No comments are movable");
          return;
        }

        // Get the index of the last comment
        const lastCommentIndex = focusNote.comments.length - 1;

        // This method will automatically handle the case where the field does not exist.
        KnowledgeBaseTemplate.moveCommentsArrToField(focusNote, "Y, Z", "证明", true);
      } catch (error) {
        MNUtil.showHUD(`❌ Move failed: ${error.message || error}`);
      }
    });
  });

  global.registerCustomAction("moveLastTwoCommentsToProofAreaTop", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        if (!focusNote || !focusNote.comments || focusNote.comments.length === 0) {
          MNUtil.showHUD("❌ No comments are movable");
          return;
        }

        // This method will automatically handle the case where the field does not exist.
        KnowledgeBaseTemplate.moveCommentsArrToField(focusNote, "Y, Z", "证明", false);
      } catch (error) {
        MNUtil.showHUD(`❌ Move failed: ${error.message || error}`);
      }
    });
  });

  global.registerCustomAction("moveLastCommentToProofAreaBottom", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        if (!focusNote || !focusNote.comments || focusNote.comments.length === 0) {
          MNUtil.showHUD("❌ No comments are movable");
          return;
        }

        // Get the index of the last comment
        const lastCommentIndex = focusNote.comments.length - 1;

        // This method will automatically handle the case where the field does not exist.
        KnowledgeBaseTemplate.moveCommentsArrToField(focusNote, "Z", "证明", true);
      } catch (error) {
        MNUtil.showHUD(`❌ Move failed: ${error.message || error}`);
      }
    });
  });

  // moveOneCommentToLinkNote
  // moveLastCommentToThought
  // moveLastTwoCommentsToThought
  // moveLastTwoCommentsInBiLinkNotesToThought
  // moveLastTwoCommentsInBiLinkNotesToDefinition
  // moveUpThoughtPointsToBottom
  global.registerCustomAction("moveUpThoughtPointsToBottom", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        focusNotes.forEach((focusNote) => {
          // First check if smart link arrangement is needed
          let comments = focusNote.MNComments;
          if (comments.length > 0) {
            let lastComment = comments[comments.length - 1];
            if (lastComment.type === "linkComment") {
              // Attempt to perform smart link arrangement
              let success = KnowledgeBaseTemplate.smartLinkArrangement(focusNote);
              if (success) {
                return; // If the link was successfully processed, skip the automatic content movement.
              }
            }
          }

          // If the issue is not a link or processing failure, execute the existing automatic content movement function.
          KnowledgeBaseTemplate.autoMoveNewContentToField(focusNote, "Related Thoughts");
        });
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // mergeToParentThought - merge into parent card thought
  global.registerCustomAction("mergeToParentThought", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    try {
      if (!focusNote) {
        MNUtil.showHUD("❌ Please select a card first");
        return;
      }

      if (!focusNote.parentNote) {
        MNUtil.showHUD("❌ The current card has no parent card");
        return;
      }

      // Call the encapsulated method
      KnowledgeBaseTemplate.mergeToParentThoughtField(focusNote, (callback) => {
        // Handling cases where user input is required
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "Enter your thoughts",
          "Please enter the thoughts you want to add to the parent card.",
          2, // Text input box style
          "Cancel",
          ["Sure"],
          (alert, buttonIndex) => {
            if (buttonIndex === 1) {
              const inputText = alert.textFieldAtIndex(0).text;
              if (inputText && inputText.trim()) {
                callback(inputText.trim());
              } else {
                MNUtil.showHUD("❌ No content entered");
              }
            }
          }
        );
      });
    } catch (error) {
      MNUtil.showHUD("❌ Operation failed: " + error.message);
      MNUtil.addErrorLog(error, "mergeToParentThought");
    }
  });

  global.registerCustomAction("mergeToLastBrotherNoteThought", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    try {
      if (!focusNote) {
        MNUtil.showHUD("❌ Please select a card first");
        return;
      }

      let brotherNote = focusNote.brotherNotes[focusNote.indexInBrotherNotes - 1];
      if (brotherNote) {
        MNUtil.undoGrouping(() => {
          brotherNote.appendMarkdownComment("- " + focusNote.title);
          focusNote.title = "";
          focusNote.mergeInto(brotherNote);
          KnowledgeBaseTemplate.autoMoveNewContentToField(brotherNote, "Related Thoughts");
          brotherNote.focusInMindMap(0.3);
        });
      }
    } catch (error) {
      MNUtil.showHUD("❌ Operation failed: " + error.message);
      MNUtil.addErrorLog(error, "mergeToParentThought");
    }
  });

  // moveUpThoughtPointsToTop
  // moveUpLinkNotes
  // moveToInbox
  // ========== CLEAR related (8 items) ==========

  // clearAllLinks
  // clearAllFailedMN3Links
  // clearAllFailedLinks
  // clearContentKeepExcerptAndHandwritingAndImage
  // clearContentKeepExcerptWithTitle
  global.registerCustomAction("clearContentKeepExcerptWithTitle", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        focusNotes.forEach((focusNote) => {
          KnowledgeBaseTemplate.keepOnlyExcerptAndTitle(focusNote);
        });
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("clearContentKeepExcerptWithTitleAndMakeCard", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        focusNotes.forEach((focusNote) => {
          KnowledgeBaseTemplate.keepOnlyExcerptAndTitle(focusNote);
          KnowledgeBaseTemplate.makeNote(focusNote);
        });
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("oldChildrenMakeNotes", async function (context) {
    const { focusNotes } = context;
    focusNotes.forEach((focusNote) => {
      KnowledgeBaseTemplate.oldChildrenMakeNotes(focusNote);
    });
  });
  // removeAllClassificationNotes - Delete all classification cards, retaining only the key points
  global.registerCustomAction("removeAllClassificationNotes", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    // Check if the card is selected
    if (!focusNote) {
      MNUtil.showHUD("Please select a root card first", 2);
      return;
    }

    // Call the new method in KnowledgeBaseTemplate
    try {
      let confirm = await MNUtil.confirm(
        "Confirm deletion?",
        "This operation will delete all category cards, but retain the knowledge point cards under them, and is irreversible. Continue?"
      );

      if (!confirm) {
        return; // User cancels operation
      }
      KnowledgeBaseTemplate.removeAllClassificationNotes(focusNote);
    } catch (error) {
      MNUtil.copyJSON(error);
      MNUtil.showHUD("Operation failed: " + error.message, 3);
    }
  });

  global.registerCustomAction("fixBrokenLinks", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      KnowledgeBaseTemplate.renewLinks(focusNote);
    });
  });

  // clearContentKeepExcerpt
  global.registerCustomAction("clearContentKeepExcerpt", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        focusNotes.forEach((focusNote) => {
          KnowledgeBaseTemplate.keepOnlyExcerpt(focusNote);
        });
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // clearContentKeepHandwritingAndImage
  // clearContentKeepText
  // ========== COPY related (8 items) ==========

  // copyFocusNotesIdArr
  global.registerCustomAction("copyFocusNotesIdArr", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        if (focusNotes.length == 1) {
          MNUtil.copy(focusNote.noteId);
          MNUtil.showHUD(focusNote.noteId);
        } else {
          let idsArr = toolbarUtils.getNoteIdArr(focusNotes);
          MNUtil.copy(idsArr);
          MNUtil.showHUD(idsArr);
        }
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // copyFocusNotesURLArr
  global.registerCustomAction("copyFocusNotesURLArr", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        let result;
        if (focusNotes.length === 1) {
          // Returns a string when dealing with a single card
          result = focusNotes[0].noteURL;
        } else {
          // Returns an array when there are multiple cards
          result = toolbarUtils.getNoteURLArr(focusNotes);
        }
        MNUtil.copy(result);
        MNUtil.showHUD(result);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // cardCopyNoteId
  // copyWholeTitle
  // copyTitleSecondPart
  // copyTitleFirstKeyword
  // copyTitleFirstQuoteContent
  // copyTitleSecondQuoteContent
  // ========== CHANGE related (5 items) ==========

  // changeChildNotesPrefix
  // batchChangeClassificationTitles
  global.registerCustomAction("batchChangeClassificationTitles", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      await KnowledgeBaseTemplate.batchChangeClassificationTitles("descendants");
    } catch (error) {
      MNUtil.showHUD(error);
    }
  });

  // changeChildNotesTitles
  // changeDescendantNotesTitles
  // changeTitlePrefix

  // keepOnlyExcerpt - Keep only excerpts
  global.registerCustomAction("keepOnlyExcerpt", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    if (!focusNote) {
      MNUtil.showHUD("❌ Please select the card to be processed first");
      return;
    }

    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.keepOnlyExcerpt(focusNote);
      } catch (error) {
        MNUtil.showHUD(`❌ Processing failed: ${error.message}`);
        toolbarUtils.addErrorLog(error, "keepOnlyExcerpt", { noteId: focusNote?.noteId });
      }
    });
  });

  // ========== OTHER related (77 items) ==========

  // getNewClassificationInformation
  // MNFocusNote
  // MNEditDeleteNote
  // toBeProgressNote
  // toBeIndependent
  global.registerCustomAction("toBeIndependent", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        focusNotes.forEach((focusNote) => {
          focusNote.toBeIndependent();
        });
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("descendNotesToBeIndependent", async function (context) {
    const { focusNote } = context;
    if (focusNote) {
      let descendantNotes = focusNote.descendantNodes.descendant;
      if (descendantNotes.length > 0) {
        MNUtil.undoGrouping(() => {
          descendantNotes.forEach((note) => {
            if (note.title && note.title.trim()) {
              focusNote.addChild(note);
            }
          });
        });
      }
    }
  });

  global.registerCustomAction("linkRemoveDuplicatesAfterApplication", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        focusNotes.forEach((focusNote) => {
          let applicationHtmlCommentIndex = Math.max(
            focusNote.getIncludingCommentIndex("Application:", true)
          );
          toolbarUtils.linkRemoveDuplicatesAfterIndex(focusNote, applicationHtmlCommentIndex);
        });
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // addOldNoteKeyword
  // selectionTextHandleSpaces
  global.registerCustomAction("selectionTextHandleSpaces", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.showHUD(Pangu.spacing(MNUtil.selectionText));
    MNUtil.copy(Pangu.spacing(MNUtil.selectionText));
  });

  // copiedTextHandleSpaces
  global.registerCustomAction("copiedTextHandleSpaces", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.showHUD(Pangu.spacing(MNUtil.clipboardText));
    MNUtil.copy(Pangu.spacing(MNUtil.clipboardText));
  });

  // handleTitleSpaces
  // focusInMindMap
  // focusInFloatMindMap
  // selectionTextToLowerCase
  global.registerCustomAction("selectionTextToLowerCase", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.showHUD(MNUtil.selectionText.toLowerCase());
    MNUtil.copy(MNUtil.selectionText.toLowerCase());
  });

  // selectionTextToTitleCase
  global.registerCustomAction("selectionTextToTitleCase", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.showHUD(MNUtil.selectionText.toTitleCasePro());
    MNUtil.copy(MNUtil.selectionText.toTitleCasePro());
  });

  // copiedTextToTitleCase
  global.registerCustomAction("copiedTextToTitleCase", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.showHUD(MNUtil.clipboardText.toTitleCasePro());
    MNUtil.copy(MNUtil.clipboardText.toTitleCasePro());
  });

  // copiedTextToLowerCase
  global.registerCustomAction("copiedTextToLowerCase", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.showHUD(MNUtil.clipboardText.toLowerCase());
    MNUtil.copy(MNUtil.clipboardText.toLowerCase());
  });

  // renewLinksBetweenClassificationNoteAndKnowledegeNote
  global.registerCustomAction("autoMoveLinksBetweenCards", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      KnowledgeBaseTemplate.smartLinkArrangement(focusNote);
    } catch (error) {
      MNUtil.showHUD(error);
    }
  });

  // refreshNotes
  // refreshCardsAndAncestorsAndDescendants
  // renewAuthorNotes
  // renewJournalNotes
  // renewPublisherNotes
  // renewBookSeriesNotes
  // renewBookNotes
  // findDuplicateTitles
  // addThoughtPointAndMoveLastCommentToThought
  // addThoughtPointAndMoveNewCommentsToThought
  // pasteInTitle
  // pasteAfterTitle
  // extractTitle
  // convertNoteToNonexcerptVersion
  global.registerCustomAction("convertNoteToNonexcerptVersion", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    // MNUtil.showHUD("Card converted to non-excerpt version")
    try {
      MNUtil.undoGrouping(() => {
        focusNotes.forEach((focusNote) => {
          if (focusNote.excerptText) {
            KnowledgeBaseTemplate.toNoExcerptVersion(focusNote);
          }
        });
      });
    } catch (error) {
      MNUtil.showHUD(error);
    }
  });

  global.registerCustomAction("upwardMergeWithStyledCommentsAndMove", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        // First check if any sub-cards contain a title
        const hasTitle = HtmlMarkdownUtils.hasDescendantWithTitle(focusNote);

        if (!hasTitle) {
          // If none of the sub-cards have titles, merge them directly; no style selection is needed.
          HtmlMarkdownUtils.upwardMergeWithStyledComments(focusNote);
          KnowledgeBaseTemplate.autoMoveNewContentToField(focusNote, "证明");
          MNUtil.showHUD("✅ Sub-cards have been merged");
        } else {
          // If any sub-cards have titles, display a pop-up window to select the style.
          UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
            "Select the next level after the current card.",
            "Then it will decrease sequentially.",
            0,
            "Cancel",
            levelHtmlSettingTitles,
            (alert, buttonIndex) => {
              try {
                MNUtil.undoGrouping(() => {
                  // Button indexes start from 1 (0 is the cancel button).
                  const selectedIndex = buttonIndex - 1;

                  if (selectedIndex >= 0 && selectedIndex < levelHtmlSetting.length) {
                    const selectedType = levelHtmlSetting[selectedIndex].type;
                    HtmlMarkdownUtils.upwardMergeWithStyledComments(focusNote, selectedType);
                    KnowledgeBaseTemplate.autoMoveNewContentToField(focusNote, "证明");
                  }
                });
              } catch (error) {
                MNUtil.showHUD(error);
              }
            }
          );
        }
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("upwardMergeWithStyledComments", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        // First check if any sub-cards contain a title
        const hasTitle = HtmlMarkdownUtils.hasDescendantWithTitle(focusNote);

        if (!hasTitle) {
          // If none of the sub-cards have titles, merge them directly; no style selection is needed.
          HtmlMarkdownUtils.upwardMergeWithStyledComments(focusNote);
          MNUtil.showHUD("✅ Sub-cards have been merged");
        } else {
          // If any sub-cards have titles, display a pop-up window to select the style.
          UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
            "Select the next level after the current card.",
            "Then it will decrease sequentially.",
            0,
            "Cancel",
            levelHtmlSettingTitles,
            (alert, buttonIndex) => {
              try {
                MNUtil.undoGrouping(() => {
                  // Button indexes start from 1 (0 is the cancel button).
                  const selectedIndex = buttonIndex - 1;

                  if (selectedIndex >= 0 && selectedIndex < levelHtmlSetting.length) {
                    const selectedType = levelHtmlSetting[selectedIndex].type;
                    HtmlMarkdownUtils.upwardMergeWithStyledComments(focusNote, selectedType);
                  }
                });
              } catch (error) {
                MNUtil.showHUD(error);
              }
            }
          );
        }
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // mergeInParentNoteWithPopup
  global.registerCustomAction("mergeInParentNoteWithPopup", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "Select the type of title to be converted to a comment after merging",
          "",
          0,
          "Cancel",
          htmlSettingTitles,
          (alert, buttonIndex) => {
            try {
              MNUtil.undoGrouping(() => {
                const selectedIndex = buttonIndex - 1;
                if (selectedIndex >= 0 && selectedIndex < htmlSetting.length) {
                  focusNote.mergeInto(focusNote.parentNote, htmlSetting[selectedIndex].type);
                }
              });
            } catch (error) {
              MNUtil.showHUD(error);
            }
          }
        );
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // mergeInParentNote
  global.registerCustomAction("mergeInParentNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        focusNote.mergeInto(focusNote.parentNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("mergeInSummaryParentNote", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.mergeIntoSummaryNote(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("mergeApplicationFieldInParentNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.mergeSpecificField(focusNote.parentNote, focusNote, "应用");
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // mergIntoParenNoteAndRenewReplaceholder
  global.registerCustomAction("mergIntoParenNoteAndRenewReplaceholder", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        focusNote.mergIntoAndRenewReplaceholder(focusNote.parentNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // mergIntoParenNoteAndRenewReplaceholderWithPopup
  global.registerCustomAction("mergIntoParenNoteAndRenewReplaceholderWithPopup", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "Select the type of title to be converted to a comment after merging",
          "",
          0,
          "Cancel",
          htmlSettingTitles,
          (alert, buttonIndex) => {
            try {
              MNUtil.undoGrouping(() => {
                // Button indexes start from 1 (0 is the cancel button).
                const selectedIndex = buttonIndex - 1;

                if (selectedIndex >= 0 && selectedIndex < htmlSetting.length) {
                  const selectedType = htmlSetting[selectedIndex].type;
                  focusNote.mergIntoAndRenewReplaceholder(focusNote.parentNote, selectedType);
                }
              });
            } catch (error) {
              MNUtil.showHUD(error);
            }
          }
        );
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // addTopic
  // achieveCards
  // renewCards
  // renewChildNotesPrefix
  // hideAddonBar
  global.registerCustomAction("hideAddonBar", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.postNotification("toggleMindmapToolbar", { target: "addonBar" });
  });

  // 9BA894B4-3509-4894-A05C-1B4BA0A9A4AE
  // 014E76CA-94D6-48D5-82D2-F98A2F017219
  // undoOKRNoteMake
  // updateTodayTimeTag

  // updateTimeTag
  // openTasksFloatMindMap
  // openPinnedNote-1
  global.registerCustomAction("openPinnedNote-1", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    pinnedNote = MNNote.new("1346BDF1-7F58-430F-874E-B814E7162BDF"); // Hᵖ(D)
    pinnedNote.focusInFloatMindMap();
  });

  // openPinnedNote-2
  global.registerCustomAction("openPinnedNote-2", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    pinnedNote = MNNote.new("89042A37-CC80-4FFC-B24F-F8E86CB764DC"); // Lᵖ(T)
    pinnedNote.focusInFloatMindMap();
  });

  // openPinnedNote-3
  global.registerCustomAction("openPinnedNote-3", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    pinnedNote = MNNote.new("D7DEDE97-1B87-4BB6-B607-4FB987F230E4"); // Hᵖ(T)
    pinnedNote.focusInFloatMindMap();
  });

  // renewExcerptInParentNoteByFocusNote
  global.registerCustomAction("renewExcerptInParentNoteByFocusNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.renewExcerptInParentNoteByFocusNote(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // removeTitlePrefix
  global.registerCustomAction("removeTitlePrefix", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        focusNotes.forEach((focusNote) => {
          focusNote.title = focusNote.title.toNoBracketPrefixContent();
          focusNote.refreshAll();
        });
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // addNewIdeaNote
  global.registerCustomAction("addNewIdeaNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "Enter the title of your idea",
          "",
          2,
          "Cancel",
          ["Sure"],
          (alert, buttonIndex) => {
            let userInput = alert.textFieldAtIndex(0).text;
            if (buttonIndex == 1 && userInput) {
              MNUtil.undoGrouping(() => {
                KnowledgeBaseTemplate.addNewIdeaNote(focusNote, userInput);
              });
            }
          }
        );
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // addNewSummaryNote
  global.registerCustomAction("addNewSummaryNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
          "Enter summary title",
          "",
          2,
          "Cancel",
          ["Sure"],
          (alert, buttonIndex) => {
            let userInput = alert.textFieldAtIndex(0).text;
            if (buttonIndex == 1 && userInput) {
              MNUtil.undoGrouping(() => {
                KnowledgeBaseTemplate.addNewSummaryNote(focusNote, userInput);
              });
            }
          }
        );
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // addNewDefinitionNote
  global.registerCustomAction("addNewDefinitionNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    MNUtil.undoGrouping(() => {
      if (!focusNote) {
        MNUtil.showHUD("Please select a card first");
        return;
      }

      // Check if it is a supported parent card type
      const parentType = KnowledgeBaseTemplate.getNoteType(focusNote);
      const supportedTypes = ["proposition", "example"];

      if (!supportedTypes.includes(parentType)) {
        MNUtil.showHUD("Definition cards can only be generated on proposition or example cards");
        return;
      }

      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        "Generate definition card",
        "Please enter the content to define the card:",
        2, // UIAlertViewStylePlainTextInput
        "Cancel",
        ["Sure"],
        (alert, buttonIndex) => {
          if (buttonIndex === 1) {
            const userInput = alert.textFieldAtIndex(0).text.trim();
            if (!userInput) {
              MNUtil.showHUD("Content cannot be empty");
              return;
            }

            MNUtil.undoGrouping(() => {
              KnowledgeBaseTemplate.addNewDefinitionNote(focusNote, userInput);
            });
          }
        }
      );
    });
  });

  // addNewCounterexampleNote
  global.registerCustomAction("addNewCounterexampleNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    if (!focusNote) {
      MNUtil.showHUD("❌ Please select a card first");
      return;
    }

    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Generate counterexample cards.",
      "Please enter the title of the counterexample.",
      2, // Input box style
      "Cancel",
      ["Sure"],
      (alert, buttonIndex) => {
        if (buttonIndex === 1) {
          const userInput = alert.textFieldAtIndex(0).text;
          if (!userInput || userInput.trim() === "") {
            MNUtil.showHUD("❌ Please enter a counterexample title");
            return;
          }

          MNUtil.undoGrouping(() => {
            try {
              // 1. Cloning the counterexample template card
              const counterexampleNote = MNNote.clone(KnowledgeBaseTemplate.types.反例.templateNoteId);

              // 2. Create a title (including prefix and content)
              const prefixContent = KnowledgeBaseTemplate.createChildNoteTitlePrefixContent(focusNote);
              counterexampleNote.noteTitle =
                KnowledgeBaseTemplate.createTitlePrefix(
                  KnowledgeBaseTemplate.types.反例.prefixName,
                  prefixContent
                ) + userInput.trim();

              // 3. Add as a sub-card
              focusNote.addChild(counterexampleNote);

              // 4. Add comments and links to the parent card
              focusNote.appendMarkdownComment(
                HtmlMarkdownUtils.createHtmlMarkdownText(userInput.trim(), "alert")
              ); // 使用 alert 类型
              focusote.appendNoteLink(counterexampleNote, "Both"); // Two-way link

              // 5. In parent card A, move the comment and link to the "Related Thoughts" field.
              KnowledgeBaseTemplate.moveCommentsArrToField(focusNote, "Y, Z", "Related Thoughts");

              // 6. In counterexample card B, move the parent card link to the top (excerpt area).
              KnowledgeBaseTemplate.moveCommentsArrToField(counterexampleNote, "Z", "摘录区");

              // 7. Delay focusing on new cards
              MNUtil.delay(0.5).then(() => {
                counterexampleNote.focusInMindMap(0.3);
              });

              MNUtil.showHUD(`✅ Counterexample card generated`);
            } catch (error) {
              MNUtil.showHUD(`❌ Failed to generate counterexample card: ${error.message || error}`);
            }
          });
        }
      }
    );
  });

  // makeNote
  global.registerCustomAction("makeNote", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.makeNote(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // doubleClickMakeNote
  global.registerCustomAction("doubleClickMakeNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      KnowledgeBaseTemplate.makeCard(focusNote, false);
    });
  });

  global.registerCustomAction("sendNotesToInboxArea", async function (context) {
    const { focusNotes } = context;
    MNUtil.undoGrouping(() => {
      try {
        let rootNote = MNNote.new("marginnote4app://note/B48C92CF-A5FD-442A-BF8C-53E1E801F05D");
        focusNotes.forEach((note) => {
          rootNote.addChild(note);
        });
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("sendNotesToThinkingArea", async function (context) {
    const { focusNotes } = context;
    MNUtil.undoGrouping(() => {
      try {
        let rootNote = MNNote.new("marginnote4app://note/8438D1B0-0950-4356-A213-719A11055040");
        focusNotes.forEach((note) => {
          rootNote.addChild(note);
        });
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // replaceFieldContentByPopup
  global.registerCustomAction("replaceFieldContentByPopup", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.replaceFieldContentByPopup(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("addTemplate", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      await KnowledgeBaseTemplate.addTemplate(focusNote);
    } catch (error) {
      MNUtil.showHUD(error);
    }
  });

  // hideAddonBar - Hide the add-on bar
  global.registerCustomAction("hideAddonBar", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    // Send a notification to toggle the display/hide of the plugin bar
    MNUtil.postNotification("toggleMindmapToolbar", {
      target: "addonBar",
    });
  });

  global.registerCustomAction("makeCardWithoutFocus", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.makeCard(focusNote, true, true, false);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // Forced card production based on old cards
  global.registerCustomAction("forceOldCardMakeNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        // 1. Force the processing of old cards
        KnowledgeBaseTemplate.processOldTemplateCard(focusNote);

        // 2. Perform the subsequent card production process (excluding renewNote, as it has already been processed).
        KnowledgeBaseTemplate.mergeTemplateAndAutoMoveNoteContent(focusNote); // Merge templates and automatically move content
        KnowledgeBaseTemplate.changeTitle(focusNote); // Modify card title
        KnowledgeBaseTemplate.changeNoteColor(focusNote); // Change the card color
        KnowledgeBaseTemplate.linkParentNote(focusNote); // Link to a generalized parent card
        KnowledgeBaseTemplate.autoMoveNewContent(focusNote); // Automatically move new content to the corresponding field
        KnowledgeBaseTemplate.moveTaskCardLinksToRelatedField(focusNote); // Move the task card link to the "Related Links" field.
        KnowledgeBaseTemplate.moveSummaryLinksToTop(focusNote); // Move the summary links to the top of the card.
        KnowledgeBaseTemplate.refreshNotes(focusNote); // Refresh the notes

        // KnowledgeBaseTemplate.addToReview(focusNote, true);
        focusNote.focusInMindMap(0.3);

        MNUtil.showHUD("✅ Processed as old card mode");
      } catch (error) {
        MNUtil.showHUD(`❌ Processing failed: ${error.message || error}`);
      }
    });
  });

  // Processing old cards
  global.registerCustomAction("handleOldCardWithoutMakeNote", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.processOldTemplateCard(focusNote);
        focusNote.focusInMindMap(0.3);

        MNUtil.showHUD("✅ Processed as old card mode");
      } catch (error) {
        MNUtil.showHUD(`❌ Processing failed: ${error.message || error}`);
      }
    });
  });

  global.registerCustomAction("retainFieldContentOnly", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.retainFieldContentOnly(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("renewKnowledgeNoteIntoParentNote", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.renewKnowledgeNotes(focusNote.parentNote, focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("removeBidirectionalLinks", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.removeBidirectionalLinks(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  // updateBidirectionalLink
  global.registerCustomAction("updateBidirectionalLink", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    if (typeof KnowledgeBaseTemplate !== "undefined" && KnowledgeBaseTemplate.updateBidirectionalLink) {
      await KnowledgeBaseTemplate.updateBidirectionalLink(focusNote);
    } else {
      MNUtil.showHUD("The latest version of MNUtils needs to be installed");
    }
  });

  // showMarkdownLinksInField - View Markdown links
  global.registerCustomAction("showMarkdownLinksInField", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    if (typeof KnowledgeBaseTemplate !== "undefined" && KnowledgeBaseTemplate.showMarkdownLinksInField) {
      await KnowledgeBaseTemplate.showMarkdownLinksInField(focusNote);
    } else {
      MNUtil.showHUD("The latest version of MNUtils needs to be installed");
    }
  });

  // switchOCRSource - Switch OCR source
  global.registerCustomAction("switchOCRSource", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    // OCR source options - consistent with ocrAsProofTitleWithTranslation
    const ocrSources = [
      { value: "Doc2X", name: "Doc2X - Professional Document Recognition" },
      { value: "SimpleTex", name: "SimpleTex - Mathematical Formulas" },
      { value: "GPT-4o", name: "GPT-4o" },
      { value: "GPT-4o-mini", name: "GPT-4o-mini" },
      { value: "glm-4v-plus", name: "glm-4v-plus" },
      { value: "glm-4v-flash", name: "glm-4v-flash" },
      {
        value: "claude-3-5-sonnet-20241022",
        name: "claude-3-5-sonnet-20241022",
      },
      { value: "claude-3-7-sonnet", name: "claude-3-7-sonnet" },
      { value: "gemini-2.0-flash", name: "gemini-2.0-flash" },
      { value: "Moonshot-v1", name: "Moonshot-v1" },
    ];

    const currentSource = toolbarConfig.ocrSource || "Doc2X";
    const currentSourceName = ocrSources.find((s) => s.value === currentSource)?.name || currentSource;

    // Display the selection dialog box
    const selectedIndex = await MNUtil.userSelect(
      "Select OCR source",
      `Current: ${currentSourceName}`,
      ocrSources.map((s) => s.name)
    );

    if (selectedIndex === 0) {
      // User cancel
      return;
    }

    // Save selection (selectedIndex starts from 1)
    const selectedSource = ocrSources[selectedIndex - 1];
    toolbarConfig.ocrSource = selectedSource.value;
    toolbarConfig.save();

    MNUtil.showHUD(`✅ OCR source has been switched to: ${selectedSource.name}`);
  });

  // switchTranslateModel - Switch the translation model
  global.registerCustomAction("switchTranslateModel", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    // Translation model options
    const translateModels = [
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "claude-3-5-sonnet",
      "claude-3-7-sonnet",
      "glm-4-plus",
      "glm-z1-airx",
      "deepseek-chat",
      "deepseek-reasoner",
      "glm-4-flashx (with built-in Zhipu AI)",
    ];
    const currentModel = toolbarConfig.translateModel || "gpt-4o-mini";

    // Display the selection dialog box
    const selectedIndex = await MNUtil.userSelect(
      "Select translation model",
      `current: ${currentModel}`,
      translateModels
    );

    if (selectedIndex === 0) {
      // User cancel
      return;
    }

    // Save selection (selectedIndex starts from 1)
    const selectedModel = translateModels[selectedIndex - 1];
    toolbarConfig.translateModel = selectedModel;
    toolbarConfig.save();

    MNUtil.showHUD(`✅ Translation model has been switched to: ${selectedModel}`);
  });

  // ocrAllUntitledDescendantsWithTranslation - Batch OCR and translation of untitled descendant cards
  global.registerCustomAction("ocrAllUntitledDescendantsWithTranslation", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    try {
      // Check if focusNote is present
      if (!focusNote) {
        MNUtil.showHUD("Please select a note first");
        return;
      }

      // Get all descendant cards
      const descendantData = focusNote.descendantNodes;
      const descendants = descendantData ? descendantData.descendant : [];

      // Create an array containing the selected card and all its descendant cards.
      const allNotes = [focusNote, ...descendants];

      // Filter cards that have no title and an image
      const untitledNotes = allNotes.filter((note) => {
        // Check if there is no title
        if (note.noteTitle && note.noteTitle.trim()) {
          return false;
        }
        // Check if there are any images
        const imageData = MNNote.getImageFromNote(note);
        return imageData !== null && imageData !== undefined;
      });

      if (untitledNotes.length === 0) {
        MNUtil.showHUD("No descendant card with an untitled title and containing an image was found");
        return;
      }

      // Confirm Operation
      const confirmed = await MNUtil.confirm(
        "Batch OCR + Translation Confirmation",
        `Find ${untitledNotes.length} untitled cards, perform OCR recognition, and translate them into Chinese.`
      );

      if (!confirmed) {
        return;
      }

      // Use the configured OCR source and translation model
      const ocrSource = toolbarConfig.ocrSource || toolbarConfig.defaultOCRSource || "Doc2X";
      const translateModel =
        toolbarConfig.translateModel || toolbarConfig.defaultTranslateModel || "gpt-4o-mini";

      MNUtil.showHUD(`Start batch processing (OCR: ${ocrSource}, Translation: ${translateModel})...`);

      // Batch processing
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < untitledNotes.length; i++) {
        const note = untitledNotes[i];

        try {
          // Get image data
          const imageData = MNNote.getImageFromNote(note);
          if (!imageData) {
            failCount++;
            continue;
          }

          // Execute OCR
          let ocrResult;
          if (typeof ocrNetwork !== "undefined") {
            // Using the MNOCR plugin
            ocrResult = await ocrNetwork.OCR(imageData, ocrSource, true);
          } else if (typeof toolbarUtils !== "undefined") {
            // Downgrade to free OCR
            ocrResult = await toolbarUtils.freeOCR(imageData);
          } else {
            MNUtil.showHUD("Please install the MN OCR plugin first");
            return;
          }

          if (ocrResult && ocrResult.trim()) {
            // Perform translation
            try {
              const translatedText = await toolbarUtils.ocrWithTranslation(ocrResult, translateModel);

              // Set the translated title
              MNUtil.undoGrouping(() => {
                note.noteTitle = translatedText.trim();
              });

              successCount++;
            } catch (translationError) {
              // Translation failed, using raw OCR results
              MNUtil.undoGrouping(() => {
                note.noteTitle = ocrResult.trim();
              });

              successCount++;

              if (typeof MNUtil !== "undefined" && MNUtil.log) {
                MNUtil.log(
                  `⚠️ [Batch OCR Translation] Translation failed, using raw text: ${translationError.message}`
                );
              }
            }
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
          if (typeof toolbarUtils !== "undefined") {
            toolbarUtils.addErrorLog(error, "ocrAllUntitledDescendantsWithTranslation", {
              noteId: note.noteId,
            });
          }
        }

        // Update progress (updates every 3 or the last one processed)
        if ((i + 1) % 3 === 0 || i === untitledNotes.length - 1) {
          MNUtil.showHUD(`Processing progress: ${i + 1}/${untitledNotes.length}`);
          await MNUtil.delay(0.1); // Briefly delay UI updates
        }
      }

      // Display completion information
      let resultMessage = `✅ Processing complete! Success: ${successCount}`;
      if (failCount > 0) {
        resultMessage += `, if failed: ${failCount}`;
      }
      MNUtil.showHUD(resultMessage);

      // Send batch completion notification (optional, for integration with other plugins)
      MNUtil.postNotification("BatchOCRTranslationFinished", {
        action: "batchOCRWithTranslation",
        noteId: focusNote.noteId,
        successCount: successCount,
        failCount: failCount,
        totalCount: untitledNotes.length,
      });
    } catch (error) {
      MNUtil.showHUD("Batch OCR translation failed: " + error.message);
      if (typeof toolbarUtils !== "undefined") {
        toolbarUtils.addErrorLog(error, "ocrAllUntitledDescendantsWithTranslation");
      }
    }
  });

  // translateAllDescendants - Batch translation of descendant cards
  global.registerCustomAction("translateAllDescendants", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    try {
      // Check if focusNote is present
      if (!focusNote) {
        MNUtil.showHUD("Please select a card first");
        return;
      }

      // Get all descendant cards
      const descendantData = focusNote.descendantNodes;
      const descendants = descendantData ? descendantData.descendant : [];

      // Create an array containing the selected card and all its descendant cards.
      const allNotes = [focusNote, ...descendants];

      // Filter cards with titles or excerpts
      const notesToTranslate = allNotes.filter((note) => {
        // Check if there is a title or excerpt.
        return (note.noteTitle && note.noteTitle.trim()) || (note.excerptText && note.excerptText.trim());
      });

      if (notesToTranslate.length === 0) {
        MNUtil.showHUD("No translatable cards found");
        return;
      }

      // Display the translation options dialog box
      const translateOptions = [
        "Translate only the title",
        "Translate only the excerpt",
        "Translate both the title and the excerpt",
        "Add translation to comments",
      ];

      const optionIndex = await MNUtil.userSelect(
        "Choose a translation method",
        `Found ${notesToTranslate.length} cards that can be translated`,
        translateOptions
      );

      if (optionIndex === 0) {
        return; // User cancels
      }

      // Select translation model
      const translateModels = toolbarUtils.getAvailableAIModels
        ? toolbarUtils.getAvailableAIModels()
        : ["gpt-4o-mini", "gpt-4o", "claude-3-5-sonnet"];

      const currentModel = toolbarConfig.translateModel || "gpt-4o-mini";

      const modelIndex = await MNUtil.userSelect(
        "Select translation model",
        `current: ${currentModel}`,
        translateModels
      );

      if (modelIndex === 0) {
        return; // User cancels
      }

      const selectedModel = translateModels[modelIndex - 1];
      const translateMode = optionIndex; // 1-4

      // Start batch translation
      MNUtil.showHUD(`Start batch translation (total ${notesToTranslate.length} cards)...`);

      let successCount = 0;
      let failCount = 0;

      // Use the undo group
      MNUtil.undoGrouping(async () => {
        for (let i = 0; i < notesToTranslate.length; i++) {
          const note = notesToTranslate[i];

          try {
            // Display progress
            if (i % 5 === 0) {
              MNUtil.showHUD(`Translating... (${i + 1}/${notesToTranslate.length})`);
            }

            let hasChanges = false;

            // Perform translation based on the selected mode
            if (translateMode === 1 || translateMode === 3) {
              // Translation of title
              if (note.noteTitle && note.noteTitle.trim()) {
                const translatedTitle = await toolbarUtils.translateNoteContent(
                  note.noteTitle,
                  "academic",
                  "Chinese",
                  selectedModel
                );

                if (translatedTitle && translatedTitle !== note.noteTitle) {
                  if (translateMode === 1) {
                    note.noteTitle = translatedTitle;
                  } else {
                    // Keep the original title and add the translation below.
                    note.noteTitle = `${note.noteTitle} | ${translatedTitle}`;
                  }
                  hasChanges = true;
                }
              }
            }

            if (translateMode === 2 || translateMode === 3) {
              // Translation excerpt
              if (note.excerptText && note.excerptText.trim()) {
                const translatedExcerpt = await toolbarUtils.translateNoteContent(
                  note.excerptText,
                  "academic",
                  "Chinese",
                  selectedModel
                );

                if (translatedExcerpt && translatedExcerpt !== note.excerptText) {
                  if (translateMode === 2) {
                    note.excerptText = translatedExcerpt;
                  } else {
                    // Retain the original excerpt and add the translation below.
                    note.excerptText = `${note.excerptText}\n\n翻译：${translatedExcerpt}`;
                  }
                  hasChanges = true;
                }
              }
            }

            if (translateMode === 4) {
              // Add translation to comments
              let textToTranslate = "";

              if (note.noteTitle && note.noteTitle.trim()) {
                textToTranslate = note.noteTitle;
              } else if (note.excerptText && note.excerptText.trim()) {
                textToTranslate = note.excerptText;
              }

              if (textToTranslate) {
                const translation = await toolbarUtils.translateNoteContent(
                  textToTranslate,
                  "academic",
                  "Chinese",
                  selectedModel
                );

                if (translation) {
                  // Add translation as a comment
                  note.appendTextComment(`Translation: ${translation}`);
                  hasChanges = true;
                }
              }
            }

            if (hasChanges) {
              successCount++;
            }
          } catch (error) {
            failCount++;
            if (typeof MNUtil !== "undefined" && MNUtil.log) {
              MNUtil.log(`❌ [Batch Translation] Card Translation Failed: ${error.message}`);
            }
          }
        }

        // Display completion information
        const message =
          failCount > 0
            ? `Translation complete: ${successCount} successful, ${failCount} unsuccessful.`
            : `Translation complete: ${successCount} cards successfully translated.`;

        MNUtil.showHUD(message);
      });
    } catch (error) {
      MNUtil.showHUD("Batch translation failed: " + error.message);
      if (typeof toolbarUtils !== "undefined") {
        toolbarUtils.addErrorLog(error, "translateAllDescendants");
      }
    }
  });

  // Search definition card directory

  global.registerCustomAction("codeMergeTemplate", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      let processedFocusNote;
      if (focusNote.originNoteId) {
        let parentNote = focusNote.parentNote;
        processedFocusNote = focusNote.createDuplicatedNoteAndDelete();
        parentNote.addChild(processedFocusNote);
      } else {
        processedFocusNote = focusNote;
      }
      let ifTemplateMerged = false;
      processedFocusNote.MNComments.forEach((comment) => {
        if (comment.type == "HtmlComment" && comment.text.includes("思考")) {
          ifTemplateMerged = true;
        }
      });
      if (!ifTemplateMerged) {
        let clonedNote = MNNote.clone("9C4F3120-9A82-440A-97FF-F08D5B53B972");
        MNUtil.undoGrouping(() => {
          processedFocusNote.merge(clonedNote.note);
        });
      }
    } catch (error) {
      MNUtil.showHUD("Code merging template failed: " + error.message);
    }
  });

  // codeLearning - Code learning feature
  global.registerCustomAction("codeLearning", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    // Check if any cards are selected
    if (!focusNote) {
      MNUtil.showHUD("Please select a code knowledge card first");
      return;
    }

    let processedFocusNote;
    if (focusNote.originNoteId) {
      let parentNote = focusNote.parentNote;
      processedFocusNote = focusNote.createDuplicatedNoteAndDelete();
      parentNote.addChild(processedFocusNote);
      processedFocusNote.focusInMindMap(0.3);
    } else {
      processedFocusNote = focusNote;
    }

    // Code element type options
    const codeTypes = [
      "Class: Lifecycle",
      "Class: Static Property",
      "Class: Static Method",
      "Class: Static Getter",
      "Class: Static Setter",
      "Class: Prototype Chain Methods",
      "Example: Method",
      "Example: Getter method",
      "Example: Setter method",
      "Example: Property",
    ];

    // Display the selection dialog box
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Select code type",
      `Current card: ${processedFocusNote.noteTitle}`,
      0,
      "Cancel",
      codeTypes,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) return;

        // Map to the corresponding type
        const typeMap = {
          1: "lifecycle",
          2: "staticProperty",
          3: "staticMethod",
          4: "staticGetter",
          5: "staticSetter",
          6: "prototype",
          7: "instanceMethod",
          8: "getter",
          9: "sets",
          10: "instanceProperty",
        };

        const selectedType = typeMap[buttonIndex];

        try {
          MNUtil.undoGrouping(() => {
            // Call the implemented processing function
            toolbarUtils.processCodeLearningCard(processedFocusNote, selectedType);
            // MNUtil.showHUD(`✅ Processed as ${codeTypes[buttonIndex - 1]} card`);
          });
        } catch (error) {
          MNUtil.showHUD(`❌ Processing failed: ${error.message || error}`);
          if (typeof toolbarUtils !== "undefined" && toolbarUtils.addErrorLog) {
            toolbarUtils.addErrorLog(error, "codeLearning");
          }
        }
      }
    );
  });

  // switchCodeAnalysisModel - Switch code analysis model
  global.registerCustomAction("switchCodeAnalysisModel", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    // Code analysis model options (using mnai-compatible format)
    const analysisModels = [
      // 🥇 Top-level model (subscribed model, requires MN Utils)
      "Subscription: o1-all", // OpenAI o1 inference model
      "Subscription: gpt-4o", // Latest version of GPT-4o
      "Subscription: claude-3-5-sonnet-20241022", // Claude 3.5 latest version
      "Subscription: gpt-4o-2024-08-06", // GPT-4o specifies the version

      // 🥈 Advanced Model (Subscription Model)
      "Subscription: deepseek-reasoner", // DeepSeek inference model
      "ChatGLM: glm-4-plus", // Zhipu AI Flagship
      "Subscription: gpt-4-1106-preview", // GPT-4 Turbo
      "Subscription: gemini-1.5-flash", // Gemini 1.5 Flash

      // 🥉 Practical model (high cost performance)
      "Subscription: gpt-4o-mini", // GPT-4o mini
      "Deepseek: deepseek-chat", // General version of DeepSeek
      "Subscription: claude-3-5-sonnet", // Claude 3.5 General Version
      "ChatGLM: glm-4-airx", // Zhipu AI Real-time Version

      // 💡 Built-in Models (Free)
      "Built-in", // Built-in Zhipu AI
    ];

    const currentModel = toolbarConfig.codeAnalysisModel || "Subscription: gpt-4o";

    // Display the selection dialog box
    const selectedIndex = await MNUtil.userSelect(
      "Choose a code analysis model",
      `Current: ${currentModel}`,
      analysisModels
    );

    if (selectedIndex === 0) {
      // User cancel
      return;
    }

    // Save selection (selectedIndex starts from 1)
    const selectedModel = analysisModels[selectedIndex - 1];
    toolbarConfig.codeAnalysisModel = selectedModel;
    toolbarConfig.save();

    MNUtil.showHUD(`✅ Code analysis model has been switched to: ${selectedModel}`);
  });

  // codeAnalysisWithAI - AI code analysis
  global.registerCustomAction("codeAnalysisWithAI", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    try {
      // Check if any cards are selected
      if (!focusNote) {
        MNUtil.showHUD("Please select a code card first");
        return;
      }

      // Get image data
      let imageData = MNUtil.getDocImage(true, true);
      if (!imageData && focusNote) {
        imageData = MNNote.getImageFromNote(focusNote);
      }
      if (!imageData) {
        MNUtil.showHUD("No recognizable image found");
        return;
      }

      // Use the configured OCR source, which defaults to Doc2X.
      const ocrSource = toolbarConfig.ocrSource || toolbarConfig.defaultOCRSource || "Doc2X";

      // OCR source name mapping
      const ocrSourceNames = {
        Doc2X: "Doc2X - Professional Document Recognition",
        SimpleTex: "SimpleTex - Mathematical formulas",
        "GPT-4o": "GPT-4o - OpenAI Vision",
        "GPT-4o-mini": "GPT-4o mini",
        "glm-4v-plus": "glm-4v-plus - 智谱AI Plus",
        "glm-4v-flash": "glm-4v-flash - 智谱AI Flash",
        "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
        "claude-3-7-sonnet": "Claude 3.7 Sonnet",
        "gemini-2.0-flash": "Gemini 2.0 Flash - Google",
        "Moonshot-v1": "Moonshot-v1",
      };

      const sourceName = ocrSourceNames[ocrSource] || ocrSource;
      MNUtil.showHUD(`Using ${sourceName} to identify code...`);

      // Execute OCR
      let ocrResult;
      if (typeof ocrNetwork !== "undefined") {
        // Using the MNOCR plugin
        ocrResult = await ocrNetwork.OCR(imageData, ocrSource, true);
      } else if (typeof toolbarUtils !== "undefined") {
        // Using free OCR (ChatGPT Vision - glm-4v-flash model)
        ocrResult = await toolbarUtils.freeOCR(imageData);
      } else {
        MNUtil.showHUD("Please install the MN OCR plugin first");
        return;
      }

      if (!ocrResult) {
        MNUtil.showHUD("OCR recognition failed");
        return;
      }

      // AI processing
      const analysisModel = toolbarConfig.codeAnalysisModel || "Subscription: gpt-4o";
      MNUtil.showHUD(`Using ${analysisModel} for analysis code...`);

      // Use the global Prompt object to generate code analysis hints
      const codeAnalysisPrompt = XDYY_PROMPTS.codeAnalysis(ocrResult);

      const aiAnalysisResult = await toolbarUtils.ocrWithAI(ocrResult, analysisModel, codeAnalysisPrompt);

      // Check if the AI ​​analysis was successful
      if (!aiAnalysisResult || aiAnalysisResult === ocrResult) {
        // AI analysis failed, returning the original text or an empty result.
        MNUtil.showHUD("❌ AI code analysis failed, unable to generate analysis results");
        return;
      }

      // Result storage (using appendMarkdownComment)
      MNUtil.undoGrouping(() => {
        let ifTemplateMerged = false;
        focusNote.MNComments.forEach((comment) => {
          if (comment.type == "HtmlComment" && comment.text.includes("思考")) {
            ifTemplateMerged = true;
          }
        });
        if (!ifTemplateMerged) {
          let clonedNote = MNNote.clone("9C4F3120-9A82-440A-97FF-F08D5B53B972");
          focusNote.merge(clonedNote.note);
        }
        focusNote.appendMarkdownComment(aiAnalysisResult);
        KnowledgeBaseTemplate.moveCommentsArrToField(focusNote, "Z", "分析");

        MNUtil.showHUD("✅ AI code analysis completed and added to comments");
      });
    } catch (error) {
      MNUtil.showHUD("AI code analysis failed: " + error.message);
      if (typeof toolbarUtils !== "undefined" && toolbarUtils.addErrorLog) {
        toolbarUtils.addErrorLog(error, "codeAnalysisWithAI");
      }
    }
  });

  // codeAnalysisFromComment - Directly analyze the code in card comments
  global.registerCustomAction("codeAnalysisFromComment", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;

    try {
      // Check if any cards are selected
      if (!focusNote) {
        MNUtil.showHUD("Please select a card containing a code first");
        return;
      }

      // Check if the card has any comments
      if (!focusNote.comments || focusNote.comments.length === 0) {
        MNUtil.showHUD("The selected card has no comment content");
        return;
      }

      // Get the first comment as source code
      const firstComment = focusNote.comments[0];
      let sourceCode = "";

      if (firstComment.type === "TextNote") {
        sourceCode = firstComment.text;
      } else if (firstComment.type === "HtmlNote") {
        // Extract text content from HTML
        sourceCode = firstComment.text.replace(/<[^>]*>/g, "").trim();
      } else {
        MNUtil.showHUD("The first comment is not a text type and cannot be analyzed");
        return;
      }

      if (!sourceCode || sourceCode.trim().length === 0) {
        MNUtil.showHUD("The first comment is empty, unable to analyze");
        return;
      }

      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`🔧 [Code Analysis] Get code from comments, length: ${sourceCode.length}`);
      }

      // AI processing
      const analysisModel = toolbarConfig.codeAnalysisModel || "Subscription: gpt-4o";
      MNUtil.showHUD(`Using ${analysisModel} for analysis code...`);

      // Use the global Prompt object to generate code analysis hints
      const codeAnalysisPrompt = XDYY_PROMPTS.codeAnalysis(sourceCode);

      // Call AI API
      const aiAnalysisResult = await toolbarUtils.ocrWithAI(sourceCode, analysisModel, codeAnalysisPrompt);

      // Check if the AI ​​analysis was successful
      if (!aiAnalysisResult || aiAnalysisResult === sourceCode) {
        // AI analysis failed, returning the original text or an empty result.
        MNUtil.showHUD("❌ AI code analysis failed, unable to generate analysis results");
        return;
      }

      // Retrieve the parent card for adding analysis results
      const parentNote = focusNote.parentNote;
      if (!parentNote) {
        MNUtil.showHUD("The current card has no parent card, so analysis results cannot be added");
        return;
      }

      // The result is stored in the parent card (using appendMarkdownComment)
      MNUtil.undoGrouping(() => {
        // Ensure the parent card has a template structure
        let ifTemplateMerged = false;
        parentNote.MNComments.forEach((comment) => {
          if (comment.type == "HtmlComment" && comment.text.includes("思考")) {
            ifTemplateMerged = true;
          }
        });
        if (!ifTemplateMerged) {
          let clonedNote = MNNote.clone("9C4F3120-9A82-440A-97FF-F08D5B53B972");
          parentNote.merge(clonedNote.note);
        }

        // Add analysis results
        parentNote.appendMarkdownComment(aiAnalysisResult);
        KnowledgeBaseTemplate.moveCommentsArrToField(parentNote, "Z", "分析");

        // Delete the sub-card containing source code
        focusNote.removeFromParent();

        MNUtil.showHUD("✅ AI code analysis complete, source card deleted");

        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`✅ [Code Analysis] Analysis complete, results added to parent card`);
        }
      });
    } catch (error) {
      MNUtil.showHUD("AI code analysis failed: " + error.message);
      if (typeof toolbarUtils !== "undefined" && toolbarUtils.addErrorLog) {
        toolbarUtils.addErrorLog(error, "codeAnalysisFromComment");
      }
    }
  });

  // ========== HTMLMarkdown Hierarchy Adjustment Related ==========

  // adjustHtmlMDLevelsUp - Move all levels up one level
  global.registerCustomAction("adjustHtmlMDLevelsUp", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }
    MNUtil.undoGrouping(() => {
      try {
        HtmlMarkdownUtils.adjustAllHtmlMDLevels(focusNote, "up");
      } catch (error) {
        MNUtil.showHUD("Operation failed: " + error.message);
      }
    });
  });

  // adjustHtmlMDLevelsDown - Move all levels down one level
  global.registerCustomAction("adjustHtmlMDLevelsDown", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }
    MNUtil.undoGrouping(() => {
      try {
        HtmlMarkdownUtils.adjustAllHtmlMDLevels(focusNote, "down");
      } catch (error) {
        MNUtil.showHUD("Operation failed: " + error.message);
      }
    });
  });

  // adjustHtmlMDLevelsByHighest - Specifies the highest adjustment level
  global.registerCustomAction("adjustHtmlMDLevelsByHighest", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }

    // Define optional levels
    const levelOptions = [
      "🎯 Goal (highest level)",
      "🚩 Level 1",
      "▸ Level 2",
      "▪ Level 3",
      "• Level 4",
      "· Level 5",
    ];

    const levelValues = ["goal", "level1", "level2", "level3", "level4", "level5"];

    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Select the highest level of target",
      "This will adjust all levels, making the highest level the level you selected.",
      0,
      "Cancel",
      levelOptions,
      (alert, buttonIndex) => {
        if (buttonIndex === 0) {
          return; // User cancels
        }

        const targetLevel = levelValues[buttonIndex - 1];

        MNUtil.undoGrouping(() => {
          try {
            HtmlMarkdownUtils.adjustHtmlMDLevelsByHighest(focusNote, targetLevel);
          } catch (error) {
            MNUtil.showHUD("Operation failed: " + error.message);
          }
        });
      }
    );
  });

  global.registerCustomAction("temporarilyPinFocusNote", async function (context) {
    const { focusNote } = context;
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=temporarilyPin&id=${encodeURIComponent(focusNote.noteId)}`,
    });
  });

  global.registerCustomAction("temporarilyPinFocusNoteWithTitle", async function (context) {
    const { focusNote } = context;
    try {
      MNUtil.copy(KnowledgeBaseTemplate.removeTitlePrefix(focusNote));
      let title = await MNUtil.input("Please enter title", "Temporary Pin", ["Cancel", "OK"]);
      if (title.button) {
        if (title.input && title.input.trim()) {
          MNUtil.postNotification("AddonBroadcast", {
            message: `mnpinner?action=temporarilyPin&id=${encodeURIComponent(
              focusNote.noteId
            )}&title=${encodeURIComponent(title.input.trim())}`,
          });
        }
      }
    } catch (error) {
      MNLog.error("Temporary PIN failed: " + error.message);
      MNUtil.showHUD("Temporary Pin failed: " + error.message);
    }
  });

  global.registerCustomAction("permanentlyPinFocusNote", async function (context) {
    const { focusNote } = context;
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=permanentlyPin&id=${encodeURIComponent(focusNote.noteId)}`,
    });
  });

  global.registerCustomAction("showPinBoard", async function (context) {
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=showPinBoard`,
    });
  });

  // New Pin position control actions
  global.registerCustomAction("pinToMidwayTop", async function (context) {
    const { focusNote } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=pin&id=${encodeURIComponent(focusNote.noteId)}&section=midway&position=top`,
    });
  });

  global.registerCustomAction("pinToMidwayBottom", async function (context) {
    const { focusNote } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=pin&id=${encodeURIComponent(
        focusNote.noteId
      )}&section=midway&position=bottom`,
    });
  });

  global.registerCustomAction("pinToFocusTop", async function (context) {
    const { focusNote } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=pin&id=${encodeURIComponent(focusNote.noteId)}&section=focus&position=top`,
    });
  });

  global.registerCustomAction("pinToFocusBottom", async function (context) {
    const { focusNote } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=pin&id=${encodeURIComponent(focusNote.noteId)}&section=focus&position=bottom`,
    });
  });

  global.registerCustomAction("pinToToOrganizeTop", async function (context) {
    const { focusNote } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=pin&id=${encodeURIComponent(
        focusNote.noteId
      )}&section=toOrganize&position=top`,
    });
  });

  global.registerCustomAction("pinToToOrganizeBottom", async function (context) {
    const { focusNote } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=pin&id=${encodeURIComponent(
        focusNote.noteId
      )}&section=toOrganize&position=bottom`,
    });
  });

  global.registerCustomAction("pinToDailyTaskTop", async function (context) {
    const { focusNote } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=pin&id=${encodeURIComponent(
        focusNote.noteId
      )}&section=dailyTask&position=top`,
    });
  });

  global.registerCustomAction("pinToDailyTaskBottom", async function (context) {
    const { focusNote } = context;
    if (!focusNote) {
      MNUtil.showHUD("Please select a card first");
      return;
    }
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=pin&id=${encodeURIComponent(
        focusNote.noteId
      )}&section=dailyTask&position=bottom`,
    });
  });

  global.registerCustomAction("pinCurrentPageToPages", async function (context) {
    // Get the current document and page number
    let docController = MNUtil.currentDocController;
    if (!docController) {
      MNUtil.showHUD("Please open a document first");
      return;
    }

    let docMd5 = docController.docMd5;
    let pageIndex = docController.currPageIndex; // Current page index (starting from 0)
    let docName = docController.document.pathFile.lastPathComponent;

    // Generate default title
    let defaultTitle = `${docName} - Page ${pageIndex + 1}`;

    // Send notification to mnpinner
    MNUtil.postNotification("AddonBroadcast", {
      message: `mnpinner?action=pinPage&docMd5=${encodeURIComponent(
        docMd5
      )}&pageIndex=${pageIndex}&title=${encodeURIComponent(defaultTitle)}`,
    });
  });

  global.registerCustomAction("focusLastChildNote", async function (context) {
    const { focusNote } = context;
    if (focusNote) {
      if (focusNote.childNotes && focusNote.childNotes.length > 0) {
        focusNote.childNotes[focusNote.childNotes.length - 1].focusInMindMap(0.1);
      }
    }
  });

  global.registerCustomAction("moveLinksInExcerptToThoughtArea", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      const arr = KnowledgeBaseTemplate.getLinksIndexArrInExcerptBlock(focusNote);
      KnowledgeBaseTemplate.moveCommentsArrToField(focusNote, arr, "Related Thoughts");
    });
  });

  global.registerCustomAction("preprocessNote", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      KnowledgeBaseTemplate.preprocessNote(focusNote);
    });
  });

  global.registerCustomAction("checkProofInReview", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      KnowledgeBaseTemplate.checkProofInReview(focusNote);
    });
  });

  global.registerCustomAction("mergeToPreviousBrotherExcerpt", async function (context) {
    const { focusNote } = context;
    let brotherNote = focusNote.brotherNotes[focusNote.indexInBrotherNotes - 1];
    if (brotherNote) {
      MNUtil.undoGrouping(() => {
        focusNote.title = "";
        focusNote.mergeInto(brotherNote);
        KnowledgeBaseTemplate.autoMoveNewContentToField(brotherNote, "摘录");
        brotherNote.focusInMindMap(0.3);
      });
    }
  });

  global.registerCustomAction("moveToLastBrotherAndMakeCard", async function (context) {
    const { focusNote } = context;
    let brotherNote = focusNote.brotherNotes[focusNote.indexInBrotherNotes - 1];
    if (brotherNote) {
      MNUtil.undoGrouping(() => {
        focusNote.moveTo(brotherNote);
        KnowledgeBaseTemplate.makeNote(focusNote);
        focusNote.focusInMindMap(0.3);
      });
    }
  });

  global.registerCustomAction("mergeLastChildToExcerpt", async function (context) {
    const { focusNote } = context;
    if (focusNote.childNotes && focusNote.childNotes.length > 0) {
      let lastChild = focusNote.childNotes[focusNote.childNotes.length - 1];
      MNUtil.undoGrouping(() => {
        lastChild.title = "";
        lastChild.mergeInto(focusNote);
        KnowledgeBaseTemplate.autoMoveNewContentToField(focusNote, "摘录");
        focusNote.focusInMindMap(0.3);
      });
    }
  });

  /**
   * Search - Open the knowledge base visual search interface
   * Calling the openSearchWebView method of mnknowledgebase via plugin communication
   * By default, it enters input mode and clears selected presets to provide the best search experience.
   */
  global.registerCustomAction("searchNotesInWebview", async function (context) {
    const { focusNote } = context;
    try {
      // Build the plugin communication URL
      const message = "mnknowledgebase?action=openSearchWebView";

      // Send communication messages to the mnknowledgebase plugin
      MNUtil.postNotification("AddonBroadcast", { message });

      // Display prompt
      // MNUtil.showHUD("Opening knowledge base search...");
    } catch (error) {
      MNUtil.showHUD("Failed to open knowledge base search: " + error.message);
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log("❌ searchNotesInWebview 错误: " + error.message);
      }
    }
  });

  /**
   * Open the Knowledge Base Comment Manager (Visual HTML)
   * Calling the `openCommentManager` method of `mnknowledgebase` via plugin communication.
   */
  global.registerCustomAction("openCommentManagerWebview", async function (context) {
    try {
      const message = "mnknowledgebase?action=openCommentManager";
      MNUtil.postNotification("AddonBroadcast", { message });
    } catch (error) {
      MNUtil.showHUD("Failed to open comment manager: " + error.message);
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log("❌ openCommentManagerWebview 错误: " + error.message);
      }
    }
  });

  global.registerCustomAction("AddTemplateOnLastestParentDefinitionAndAddAsChild", async function (context) {
    const { focusNote } = context;
    try {
      let searchResult = KnowledgeBaseTemplate.findDefinitionCards(focusNote, 1).lastNote;
      if (MNNote.new(searchResult)) {
        let definitionNote = MNNote.new(searchResult);
        let classificationNote = await KnowledgeBaseTemplate.addTemplate(definitionNote, false);
        if (classificationNote) {
          classificationNote.addChild(focusNote);
          focusNote.focusInMindMap(0.5);
        }
      }
    } catch (error) {
      MNUtil.showHUD("AddTemplateOnLastestParentDefinitionAndAddAsChild: " + error.message);
    }
  });

  global.registerCustomAction("OCRToTitle", async function (context) {
    const { focusNote } = context;
    try {
      await KnowledgeBaseNetwork.OCRToTitle(focusNote);
    } catch (error) {
      MNUtil.showHUD("OCRToTitle: " + error.message);
    }
  });

  // Mode 1: Direct OCR (Unicode)
  global.registerCustomAction("ocrMode1WithTranslation", async function (context) {
    const { focusNote } = context;
    try {
      if (!focusNote) {
        MNUtil.showHUD("Please select a card first");
        return;
      }
      await KnowledgeBaseNetwork.OCRToTitle(focusNote, 1, true);
    } catch (error) {
      MNUtil.showHUD("Mode 1 translation OCR failed: " + error.message);
    }
  });

  global.registerCustomAction("ocrMode1NoTranslationReplaceTitle", async function (context) {
    const { focusNote } = context;
    try {
      if (!focusNote) {
        MNUtil.showHUD("Please select a card first");
        return;
      }
      await KnowledgeBaseNetwork.OCRToTitle(focusNote, 1, false, "all");
    } catch (error) {
      MNUtil.showHUD("Mode 1 Original Version OCR Failed: " + error.message);
    }
  });

  global.registerCustomAction("ocrMode1NoTranslationAddToFirstHeaderLink", async function (context) {
    const { focusNote } = context;
    try {
      if (!focusNote) {
        MNUtil.showHUD("Please select a card first");
        return;
      }
      await KnowledgeBaseNetwork.OCRToTitle(focusNote, 1, false, "firstTitleLinkWord");
    } catch (error) {
      MNUtil.showHUD("Mode 1 Original Version OCR Failed: " + error.message);
    }
  });

  global.registerCustomAction("ocrMode1NoTranslationAddToLastHeaderLink", async function (context) {
    const { focusNote } = context;
    try {
      if (!focusNote) {
        MNUtil.showHUD("Please select a card first");
        return;
      }
      await KnowledgeBaseNetwork.OCRToTitle(focusNote, 1, false, "lastTitleLinkWord");
    } catch (error) {
      MNUtil.showHUD("Mode 1 Original Version OCR Failed: " + error.message);
    }
  });

  // Mode 2: Markdown OCR (LaTeX)
  global.registerCustomAction("ocrMode2WithTranslation", async function (context) {
    const { focusNote } = context;
    try {
      if (!focusNote) {
        MNUtil.showHUD("Please select a card first");
        return;
      }
      await KnowledgeBaseNetwork.OCRToTitle(focusNote, 2, true);
    } catch (error) {
      MNUtil.showHUD("Mode 2 translation OCR failed: " + error.message);
    }
  });

  global.registerCustomAction("ocrMode2NoTranslation", async function (context) {
    const { focusNote } = context;
    try {
      if (!focusNote) {
        MNUtil.showHUD("Please select a card first");
        return;
      }
      await KnowledgeBaseNetwork.OCRToTitle(focusNote, 2, false);
    } catch (error) {
      MNUtil.showHUD("Mode 2 Original Version OCR Failed: " + error.message);
    }
  });

  // Mode 3: Smart OCR (based on card type)
  global.registerCustomAction("ocrMode3WithTranslation", async function (context) {
    const { focusNote } = context;
    try {
      if (!focusNote) {
        MNUtil.showHUD("Please select a card first");
        return;
      }
      await KnowledgeBaseNetwork.OCRToTitle(focusNote, 3, true);
    } catch (error) {
      MNUtil.showHUD("Mode 3 translation OCR failed: " + error.message);
    }
  });

  global.registerCustomAction("ocrMode3NoTranslation", async function (context) {
    const { focusNote } = context;
    try {
      if (!focusNote) {
        MNUtil.showHUD("Please select a card first");
        return;
      }
      await KnowledgeBaseNetwork.OCRToTitle(focusNote, 3, false);
    } catch (error) {
      MNUtil.showHUD("Mode 3 Original Version OCR Failed: " + error.message);
    }
  });

  global.registerCustomAction("mergeIntoParentNoteAndMoveToProofArea", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      try {
        let parentNote = focusNote.parentNote;
        if (!parentNote) {
          MNUtil.showHUD("The current card has no parent card and cannot be merged");
          return;
        }
        if (KnowledgeBaseTemplate.getNoteType(focusNote, true, false)) {
          return;
        }
        // Do not merge knowledge point cards to prevent accidental selection.
        focusNote.mergeInto(parentNote);
        KnowledgeBaseTemplate.autoMoveNewContentToField(parentNote, "证明");
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("keepExcerptAreaAndTitleAndMakeCard", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.retainFieldContentByName(focusNote, "摘录区");
        title = KnowledgeBaseTemplate.removeTitlePrefix(focusNote);
        KnowledgeBaseTemplate.makeCard(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("keepExcerptAreaAndTitle", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.retainFieldContentByName(focusNote, "摘录区");
        focusNote.title = KnowledgeBaseTemplate.removeTitlePrefix(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("keepExcerptAreaWithoutTitle", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.retainFieldContentByName(focusNote, "摘录区");
        focusNote.title = "";
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("convertClassificationNoteToDefinitionNote", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      try {
        KnowledgeBaseTemplate.convertClassificationNoteToDefinitionNote(focusNote);
        KnowledgeBaseTemplate.addToReview(focusNote);
      } catch (error) {
        MNUtil.showHUD(error);
      }
    });
  });

  global.registerCustomAction("searchDefinition", async function (context) {
    const { button, des, focusNote, focusNotes, self } = context;
    try {
      // Call the function to define card catalog
      await KnowledgeBaseTemplate.showDefinitionCatalog();
    } catch (error) {
      MNUtil.showHUD("Search failed: " + error.message);
      if (typeof toolbarUtils !== "undefined") {
        toolbarUtils.addErrorLog(error, "searchDefinition");
      }
    }
  });

  global.registerCustomAction("createEquivalenceNotes", async function (context) {
    const { focusNote } = context;
    KnowledgeBaseTemplate.createEquivalenceNotes(focusNote);
  });

  global.registerCustomAction("convertToClassificationNoteDirectly", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      KnowledgeBaseTemplate.convertNoteToClassificationNote(focusNote);
    });
  });

  global.registerCustomAction("convertToClassificationNoteWithPopup", async function (context) {
    const { focusNote } = context;
    MNUtil.undoGrouping(() => {
      KnowledgeBaseTemplate.convertNoteToClassificationNote(focusNote, false);
    });
  });

  global.registerCustomAction("addTemplate", async function (context) {
    const { focusNote } = context;
    KnowledgeBaseTemplate.addTemplate(focusNote);
  });

  global.registerCustomAction("addDefinitionNoteAsParentNote", async function (context) {
    const { focusNote } = context;
    try {
      let classificationNote = await KnowledgeBaseTemplate.addTemplate(focusNote);
      KnowledgeBaseTemplate.convertClassificationNoteToDefinitionNote(classificationNote);
      classificationNote.focusInMindMap(0.4);
      KnowledgeBaseTemplate.addToReview(classificationNote);
    } catch (error) {
      MNUtil.showHUD("addDefinitionNoteAsParentNote: " + error.message);
    }
  });

  // ============================================
  // ProofParser related Actions
  // ============================================

  /**
Parse mathematical proofs in Markdown and create cards.
Extract Markdown from the comments of the current card, parse it using ProofParser, and create sub-cards.
   */
  global.registerCustomAction("parseProofMarkdown", async function (context) {
    const { focusNote } = context;
    try {
      let text = focusNote.excerptText ? focusNote.excerptText : focusNote.comments[0];

      // Display prompt
      MNUtil.showHUD("🔄 Parsing proof structure...");

      // Parse Markdown
      let tree = ProofParser.parseProofMarkdown(text);

      if (!tree || tree.length === 0) {
        MNUtil.showHUD("❌ Parsing failed: No content matching the format was found");
        MNUtil.showHUD("Formatting requirements: - **Title**\\n > Content");
        return;
      }

      // Create a card
      let createdNotes = ProofParser.createProofCards(tree, focusNote);

      if (createdNotes && createdNotes.length > 0) {
        // Focus on the first card created
        createdNotes[0].focusInMindMap(0.3);
        MNUtil.showHUD(`✅ ${createdNotes.length} cards have been created`);
      }
    } catch (error) {
      MNUtil.showHUD("Parsing failed: " + error.message);
      if (typeof toolbarUtils !== "undefined") {
        toolbarUtils.addErrorLog(error, "parseProofMarkdown");
      }
    }
  });

  /**
   * View the parsed JSON structure (for debugging)
   * Parse but do not create a card; copy the JSON structure to the clipboard.
   */
  global.registerCustomAction("debugProofParser", async function (context) {
    const { focusNote } = context;
    try {
      if (typeof ProofParser === "undefined") {
        MNUtil.showHUD("❌ ProofParser not loaded");
        return;
      }

      // Get comment content
      let allComments = focusNote.comments
        .map((comment) => comment.text)
        .filter((text) => text && text.trim())
        .join("\n\n");

      if (!allComments || allComments.trim().length === 0) {
        MNUtil.showHUD("❌ No comment content for the current card");
        return;
      }

      // Parse Markdown
      let tree = ProofParser.parseProofMarkdown(allComments);

      if (!tree || tree.length === 0) {
        MNUtil.showHUD("❌ Parsing failed");
        return;
      }

      // Copy JSON to clipboard
      MNUtil.copyJSON(tree);
      MNUtil.showHUD("✅ JSON structure has been copied to clipboard");
    } catch (error) {
      MNUtil.showHUD("Debugging failed: " + error.message);
      if (typeof toolbarUtils !== "undefined") {
        toolbarUtils.addErrorLog(error, "debugProofParser");
      }
    }
  });

  // global.registerCustomAction("", async function(context) {
  //   const { focusNote } = context;
  // })
}

// Register Now
try {
  registerAllCustomActions();
} catch (error) {
  // Handle errors silently to avoid affecting main functionality.
}

/**
 * Xia Dayuyang Custom Menu Registry
 * Used to decouple menu template definitions, avoiding modifications to utils.js
 * Strictly follow the contents of the original template function
 */

// Create a global registry
if (typeof global === "undefined") {
  var global = {};
}

// Initialize menu registry
global.customMenuTemplates = {};

/**
 * Register a custom menu template
 * @param {string} name - Menu name
 * @param {Object} template - Menu template object
 */
global.registerMenuTemplate = function (name, template) {
  global.customMenuTemplates[name] = template;
  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log(`📦 Registered menu template: ${name}`);
  }
};

/**
Get menu template
* @param {string} name - Menu name
* @returns {Object|null} Menu template object
 */
global.getMenuTemplate = function (name) {
  return global.customMenuTemplates[name] || null;
};

/**
Register all custom menu templates
* Strictly follow the content of the case statements in the original template(action) function.
 */
function registerAllMenuTemplates() {
  // menu_comment
  global.registerMenuTemplate("menu_comment", {
    // Click to open the visual comment manager
    action: "openCommentManagerWebview",
    onLongPress: {
      action: "menu",
      menuWidth: 300,
      menuItems: [
        "🪟 Old version pop-up",
        {
          action: "manageCommentsByPopup",
          menuTitle: "Open old version of comment pop-up",
        },
        "✂️ Split Comments",
        {
          action: "splitComments",
          menuTitle: "Split card comments into individual cards",
        },
        "Link processing",
        {
          action: "removeBidirectionalLinks",
          menuTitle: "Delete bidirectional link",
        },
        {
          action: "updateBidirectionalLink",
          menuTitle: "Update Link",
        },
        {
          action: "showMarkdownLinksInField",
          menuTitle: "View Markdown Link",
        },
        {
          action: "linkRemoveDuplicatesAfterApplication",
          menuTitle: 'Deduplicating links below "Applications"',
        },
        {
          action: "reorderContainsFieldLinks",
          menuTitle: 'Reorder the links below "Related Links" on the card',
        },
        "⬇️ Field Processing",
        {
          action: "replaceFieldContentByPopup",
          menuTitle: "Replace Field",
        },
        {
          action: "retainFieldContentOnly",
          menuTitle: "Keep the content of a certain field",
        },
        "❌ Delete comment",
        {
          action: "clearContentKeepExcerptWithTitle",
          menuTitle: "Keep only excerpts and titles",
        },
        {
          action: "clearContentKeepExcerpt",
          menuTitle: "Keep excerpts only, no title",
        },
        "⬇️ Move the last 1️⃣ comment",
        {
          action: "moveLastCommentToBelongArea",
          menuTitle: "Move to Region",
        },
        {
          action: "moveLastCommentToProofAreaTop",
          menuTitle: "🔝 Move to top of proof area",
        },
        {
          action: "moveLastCommentToProofAreaBottom",
          menuTitle: "▼ Move to the bottom of the proof area",
        },
        "⬇️ Move the last 2️⃣ comments",
        {
          action: "moveLastTwoCommentsToProofAreaTop",
          menuTitle: "🔝 Move to the top of the proof area",
        },
        {
          action: "moveLastTwoCommentsToProofAreaBottom",
          menuTitle: "▼ Move to the bottom of the proof area",
        },
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
          menuTitle: "📝 Merge into Parent Card Thinking",
        },
        {
          action: "mergeToLastBrotherNoteThought",
          menuTitle: "📝 Think about merging with the previous sibling card",
        },
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
        menuTitle: "Automatically move links between cards",
      },
    ],
  });

  // menu_reference
  global.registerMenuTemplate("menu_reference", {
    action: "menu",
    menuItems: [
      {
        action: "menu",
        menuTitle: "➡️ 🧠Literature Study",
        menuWidth: 500,
        menuItems: [
          "⬇️ ➕Quote",
          {
            action: "referenceRefByRefNumAndFocusInMindMap",
            menuTitle:
              "Select the 'Specific Citations' card + enter the reference number → + Citation + Cut and Categorize + Main View Position",
          },
          {
            action: "referenceRefByRefNumAddFocusInFloatMindMap",
            menuTitle:
              "Select the 'Specific Citation' card + enter the reference number → + Citation + Cut and Categorize + Floating Window Positioning",
          },
          "⬇️ ➕ Summary card of 'Specific Citations'",
          {
            action: "referenceCreateClassificationNoteByIdAndFocusNote",
            menuTitle:
              "Select the 'References Excerpt' card + enter the reference number → 'Detailed Citation Information' summary card + floating window positioning",
          },
        ],
      },
      {
        action: "menu",
        menuTitle: "➡️ References 🆔",
        menuItems: [
          {
            action: "menu",
            menuTitle: "👉 Current Document Related ID Input",
            menuWidth: 350,
            menuItems: [
              {
                action: "referenceStoreIdForCurrentDocByFocusNote",
                // menuTitle: "ID binding of the current document and the selected card",
                menuTitle: "Bind the selected card to the current document",
              },
              {
                action: "referenceStoreOneIdForCurrentDocByFocusNote",
                menuTitle: "Bind the selected card to the document number",
              },
              {
                action: "referenceTestIfIdInCurrentDoc",
                menuTitle: "Detecting the ID binding of document numbers",
              },
            ],
          },
          {
            action: "menu",
            menuTitle: "➡️ Export 🆔",
            menuWidth: 250,
            menuItems: [
              {
                action: "referenceExportReferenceIdsToClipboard",
                menuTitle: "Export Reference Card ID to Clipboard",
              },
              {
                action: "referenceExportReferenceIdsToFile",
                menuTitle: "Export Reference Card ID to File",
              },
            ],
          },
          {
            action: "menu",
            menuTitle: "⬅️ Import 🆔",
            menuWidth: 250,
            menuItems: [
              {
                action: "referenceInputReferenceIdsFromClipboard",
                menuTitle: "Import Reference Card ID from Clipboard",
              },
              {
                action: "referenceInputReferenceIdsFromFile",
                menuTitle: "Import Reference Card ID from File",
              },
            ],
          },
        ],
      },
      {
        action: "menu",
        menuTitle: "➡️ 🗂️Document Cards",
        menuItems: [
          {
            action: "referenceInfoAuthor",
            menuTitle: "👨‍🎓 Author",
          },
          {
            action: "referenceInfoYear",
            menuTitle: "⌛️ Year",
          },
          {
            action: "referenceInfoJournal",
            menuTitle: "📄 Journal",
          },
          {
            action: "referenceInfoPublisher",
            menuTitle: "📚 Publisher",
          },
          {
            action: "referenceInfoKeywords",
            menuTitle: "📌 Keywords",
          },
          {
            action: "referenceInfoDoiFromClipboard",
            menuTitle: "🔢 DOI",
          },
          {
            action: "menu",
            menuTitle: "➡️ 🔗 Reference Style",
            menuItems: [
              {
                action: "referenceInfoRefFromInputRefNum",
                menuTitle: "Enter Document Number and Citation Style",
              },
              {
                action: "referenceInfoRefFromFocusNote",
                menuTitle: "Selected excerpt will automatically enter the quote style",
              },
              {
                action: "referenceInfoInputRef",
                menuTitle: "Manually enter quotation style",
              },
            ],
          },
          {
            action: "menu",
            menuTitle: "➡️ .bib information",
            menuItems: [
              {
                action: "referenceBibInfoPasteFromClipboard",
                menuTitle: "Paste .bib information from clipboard",
              },
              {
                action: "referenceBibInfoCopy",
                menuTitle: "Copy .bib information",
              },
              {
                action: "referenceBibInfoExport",
                menuTitle: "Export .bib information",
              },
            ],
          },
        ],
      },
      {
        action: "menu",
        menuTitle: "➡️ 👨‍🎓Author Card",
        menuItems: [
          {
            action: "referenceAuthorRenewAbbreviation",
            menuTitle: "Update Author Abbreviations",
          },
          {
            action: "referenceAuthorInfoFromClipboard",
            menuTitle: "Paste Personal Information",
          },
          {
            action: "referenceAuthorNoteMake",
            menuTitle: "Author Card Making",
          },
        ],
      },
      {
        action: "menu",
        menuTitle: "➡️ 📄Journal Card",
        menuItems: [],
      },
      {
        action: "menu",
        menuTitle: "➡️ 📌Keyword Cards",
        menuItems: [
          {
            action: "referenceKeywordsAddRelatedKeywords",
            menuTitle: "+Related Keywords",
          },
          {
            action: "referenceGetRelatedReferencesByKeywords",
            menuTitle: "Filter literature by keywords",
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
        menuTitle: "→ Selected text in the document",
        menuItems: [
          {
            action: "selectionTextToTitleCase",
            menuTitle: "Title Specifications",
          },
          {
            action: "selectionTextToLowerCase",
            menuTitle: "Convert to lowercase",
          },
          {
            action: "selectionTextHandleSpaces",
            menuTitle: "Handling Spaces",
          },
        ],
      },
      {
        action: "menu",
        menuTitle: "→ Copyed text",
        menuItems: [
          {
            action: "copiedTextToTitleCase",
            menuTitle: "Title Specifications",
          },
          {
            action: "copiedTextToLowerCase",
            menuTitle: "Convert to lowercase",
          },
          {
            action: "copiedTextHandleSpaces",
            menuTitle: "Handling Spaces",
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
          menuTitle: "Title Specifications",
        },
        {
          action: "selectionTextToLowerCase",
          menuTitle: "Convert to lowercase",
        },
        {
          action: "selectionTextHandleSpaces",
          menuTitle: "Handling Spaces",
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
          menuTitle: "Copy Card URL",
        },
        "⬇️ Edit Title",
        {
          action: "removeTitlePrefix",
          menuTitle: "Remove Card Prefix",
        },
        {
          action: "forceUpdateTitlePrefix",
          menuTitle: "⚡ Force change title prefix",
        },
        "---",
        {
          action: "keepExcerptAreaAndTitle",
          menuTitle: "Keep only the 'Excerpt Section' and ✅ 'Title'",
        },
        {
          action: "keepExcerptAreaWithoutTitle",
          menuTitle: "Keep only the 'Excerpt Section' ❌ 'Title'",
        },
        {
          action: "clearContentKeepExcerptWithTitle",
          menuTitle: "Keep only 'Excerpt' and ✅ 'Title'",
        },
        {
          action: "clearContentKeepExcerpt",
          menuTitle: "Keep excerpts only ❌ No title",
        },
        {
          action: "renewKnowledgeNoteIntoParentNote",
          menuTitle: "🔀 Merge Duplicate Knowledge Points",
        },
        {
          action: "mergeInSummaryParentNote",
          menuTitle: "🔀 Merge into parent 'Summary' card",
        },
        {
          action: "mergeInParentNote",
          menuTitle: "🔀 Merge to parent card",
        },
        {
          action: "mergeApplicationFieldInParentNote",
          menuTitle: "🔀 Merge application fields into parent card",
        },
        {
          action: "renewExcerptInParentNoteByFocusNote",
          menuTitle: "🔀 Excerpt replaces the parent card's excerpt",
        },
        {
          action: "descendNotesToBeIndependent",
          menuTitle: "✂️ Descendant cards are separate single cards",
        },
        {
          action: "removeAllClassificationNotes",
          menuTitle: "❌ Delete subcategorized cards, retain key information",
        },
        {
          action: "updateDescentNotesPrefixes",
          menuTitle: "🔄 Update the prefix and link for 'Descendant Cards'",
        },
        {
          action: "updateChildNotesPrefixes",
          menuTitle: "🔄 Update the prefix and link for 'sub-cards'",
        },
        {
          action: "fixBrokenLinks",
          menuTitle: "🏥 Repair broken links",
        },
        "---------",
        "⬇️ Card Processing",
        {
          action: "convertNoteToNonexcerptVersion",
          menuTitle: "🔄 Convert to non-excerpt version",
        },
        {
          action: "handleOldCardWithoutMakeNote",
          menuTitle: "Old Card Processing & No Card Reissue",
        },
        "⬇️ Positioning",
        {
          action: "focusLastChildNote",
          menuTitle: "⇨ Locate the last sub-card",
        },
        {
          action: "menu",
          menuTitle: "⇨ 🚗 Card Movement ⇦",
          menuWidth: 250,
          menuItems: [
            "⇩  ⇩",
            {
              action: "addAsBrotherNoteofParentNote",
              menuTitle: "⇨ Become a sibling card of the parent card",
            },
            {
              action: "sendNotesToInboxArea",
              menuTitle: "⇨ Inbox",
            },
            {
              action: "sendNotesToThinkingArea",
              menuTitle: "⇨ Thinking Area",
            },
            {
              action: "toBeIndependent",
              menuTitle: "⇨ Independent",
            },
          ],
        },
        {
          action: "addAsBrotherNoteofParentNote",
          menuTitle: "⇨ Become a sibling card of the parent card",
        },
        {
          action: "menu",
          menuTitle: "⇨ ✂️ Card Removal ⇦",
          menuWidth: 200,
          menuItems: [
            "⇩  ⇩",
            {
              action: "splitMarkdownTextInFocusNote",
              menuTitle: "Card Disassembly Based on Markdown",
            },
            {
              action: "splitComments",
              menuTitle: "Split card comments into individual cards",
            },
          ],
        },
        {
          action: "splitComments",
          menuTitle: "✂️ Split card comments into individual cards",
        },
        {
          action: "menu",
          menuTitle: "⇨ 🔄 Processing Descendant Cards ⇦",
          menuWidth: 300,
          menuItems: [
            "⇩  ⇩",
            {
              action: "updateChildNotesPrefixes",
              menuTitle: "🔄 Update the prefix and link for 'sub-cards'",
            },
            {
              action: "updateDescentNotesPrefixes",
              menuTitle: "🔄 Update the prefix and link for 'Descendant Cards'",
            },
            {
              action: "oldChildrenMakeNotes",
              menuTitle: "🔄 Bulk Production of Descendant Cards",
            },
          ],
        },
        {
          action: "menu",
          menuTitle: "⇨ 🔀 Merge to parent card ⇦",
          menuWidth: 340,
          menuItems: [
            "⇩  ⇩",
            {
              action: "mergeInParentNote",
              menuTitle: "Merge to parent card",
            },
            {
              action: "mergeApplicationFieldInParentNote",
              menuTitle: "Merge the 'Application' field into the parent card",
            },
            {
              action: "mergeInParentNoteWithPopup",
              menuTitle: "Merge to Parent Card: Select Type in Pop-up",
            },
            {
              action: "mergIntoParenNoteAndRenewReplaceholder",
              menuTitle: "Merge to parent card & Replace placeholder",
            },
            {
              action: "mergIntoParenNoteAndRenewReplaceholderWithPopup",
              menuTitle: "Merge to Parent Card & Replace Placeholder: Select Type in Pop-up",
            },
          ],
        },
        {
          action: "menu",
          menuTitle: "⇨ 🔄 Processing Old Cards ⇦",
          menuWidth: 250,
          menuItems: [
            "⇩  ⇩",
            {
              action: "clearContentKeepExcerptWithTitle",
              menuTitle: "Keep only excerpts and titles",
            },
            {
              action: "clearContentKeepExcerpt",
              menuTitle: "Keep excerpts only, no title",
            },
            {
              action: "forceOldCardMakeNote",
              menuTitle: "Force Card Production Based on Old Cards",
            },
            {
              action: "handleOldCardWithoutMakeNote",
              menuTitle: "Old Card Processing & No Card Reissue",
            },
            // {
            //   action: "batchChangeClassificationTitles",
            // menuTitle: "Batch update category card titles",
            // },
          ],
        },
        {
          action: "renewKnowledgeNoteIntoParentNote",
          menuTitle: "🔀 Merge Duplicate Knowledge Points",
        },
        {
          action: "renewExcerptInParentNoteByFocusNote",
          menuTitle: "Excerpt replaces the parent card's extract",
        },
        "ℹ️ Get Card Information",
        {
          action: "copyFocusNotesIdArr",
          menuTitle: "Copy Card ID",
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
        {
          action: "convertNoteToNonexcerptVersion",
          menuTitle: "🔄 Convert to non-excerpt version",
        },
        "✂️ Edit",
        {
          action: "renewExcerptInParentNoteByFocusNote",
          menuTitle: "Replace the parent card's extract with the selected card's extract",
        },
        {
          action: "keepExcerptAreaAndTitle",
          menuTitle: "Keep only the 'Excerpt Section' and ✅ 'Title'",
        },
        {
          action: "keepExcerptAreaWithoutTitle",
          menuTitle: "Keep only the 'Excerpt Section' ❌ No Title",
        },
        {
          action: "clearContentKeepExcerptWithTitle",
          menuTitle: "Keep only 'Excerpt' and ✅ 'Title'",
        },
        {
          action: "clearContentKeepExcerpt",
          menuTitle: "Keep excerpt only ❌ No title",
        },
        "⬇️ Mobile",
        {
          action: "moveLinksInExcerptToThoughtArea",
          menuTitle: "Links from the Excerpt Area to the Related Thinking Area",
        },
        "☯️ Merge",
        {
          action: "mergeLastChildToExcerpt",
          menuTitle: "Merge the last sub-card into the excerpt area",
        },
        {
          action: "mergeToPreviousBrotherExcerpt",
          menuTitle: "Excerpt merged into the previous sibling card",
        },
        {
          action: "mergeToParentAndMoveCommentToExcerpt",
          menuTitle: "Merge into parent card and move comments to excerpt",
        },
        {
          action: "mergeToParentAndMoveCommentToTop",
          menuTitle: "Merge into parent card and move to top",
        },
        {
          action: "mergeExerptAreToParentAndMoveCommentToExcerpt",
          menuTitle: "Merge 'Excerpt Section' into the parent card and move comments to the excerpt",
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
        "🪄 Card Making",
        "---🪄 Direct Card Issuance---",
        {
          action: "makeCardWithoutFocus",
          menuTitle: "Non-positioned card production",
        },
        {
          action: "preprocessNote",
          menuTitle: "Pre-processing Card Production",
        },
        {
          action: "convertClassificationNoteToDefinitionNote",
          menuTitle: "Categorize Cards ⇒ Define Cards",
        },
        {
          action: "convertToClassificationNoteDirectly",
          menuTitle: "Convert directly to category card",
        },
        {
          action: "convertToClassificationNoteWithPopup",
          menuTitle: "Pop-up window + Convert to category card",
        },
        "---🪄 'Post-processing' card production---",
        {
          action: "clearContentKeepExcerptWithTitleAndMakeCard",
          menuTitle: "Keep only excerpts and titles when creating cards",
        },
        {
          action: "keepExcerptAreaAndTitleAndMakeCard",
          menuTitle: "Only keep the 'Excerpt Section' and title before creating the card",
        },
        "---🪄 Card production after relocation---",
        {
          action: "moveToLastBrotherAndMakeCard",
          menuTitle: "Move to become a child card of the previous sibling card + Card creation",
        },
        {
          action: "menu",
          menuTitle: "➡️ Document Card Making",
          menuItems: [
            {
              action: "referencePaperMakeCards",
              menuTitle: "📄 Thesis Card Creation",
            },
            {
              action: "referenceBookMakeCards",
              menuTitle: "📚 Book Creation Card Making",
            },
            {
              action: "referenceSeriesBookMakeCard",
              menuTitle: "📚 Series of Book Card Making",
            },
            {
              action: "referenceOneVolumeJournalMakeCards",
              menuTitle: "📄 Full Volume Journal Card Making",
            },
            {
              action: "referenceAuthorNoteMake",
              menuTitle: "Author Card Making",
            },
          ],
        },
        "🪄 Generate Cards",
        {
          action: "addNewIdeaNote",
          menuTitle: "Generate 'Ideas' Cards",
        },
        {
          action: "addNewSummaryNote",
          menuTitle: "Generate a 'Summary' card",
        },
        {
          action: "addNewDefinitionNote",
          menuTitle: "Generate 'Definition' card",
        },
        {
          action: "addNewCounterexampleNote",
          menuTitle: "Generate 'Counterexample' Card",
        },
        {
          action: "createEquivalenceNotes",
          menuTitle: "Generate 'Sufficiency' and 'Necessity' cards",
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
        "🔢 Comments with serial numbers",
        {
          action: "addCaseComment",
          menuTitle: "📋 Add Case Comment (Auto-Numbered)",
        },
        {
          action: "addStepComment",
          menuTitle: "👣 Add Step Comment (Auto-numbered)",
        },
        {
          action: "changeHtmlMarkdownCommentTypeByPopup",
          menuTitle: "🔄 Change the type of a specific HTML/MD comment",
        },
        {
          action: "renewContentsToHtmlMarkdownCommentType",
          menuTitle: "🔄 Update text content to HtmlMD comment",
        },
        "📊 Batch Adjustment of Hierarchy",
        {
          action: "adjustHtmlMDLevelsUp",
          menuTitle: "⬆️ All levels move up one level",
        },
        {
          action: "adjustHtmlMDLevelsDown",
          menuTitle: "⬇️ All levels moved down one level",
        },
        {
          action: "adjustHtmlMDLevelsByHighest",
          menuTitle: "🎯 Specify the highest level to adjust the hierarchy",
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
        "📊 Proof Parser",
        {
          action: "parseProofMarkdown",
          menuTitle: "Proving Markdown from Comment Analysis",
        },
        {
          action: "debugProofParser",
          menuTitle: "🐛 Debugging: Viewing the JSON Structure",
        },
        "⬇️ Other proof functions",
        {
          action: "checkProofInReview",
          menuTitle:
            "Check if the cards corresponding to the links in the proof area have been added to the review",
        },
        {
          action: "extractProofContentAndSplitComments",
          menuTitle: "Extract proof field content and split comments into individual cards",
        },
        {
          action: "upwardMergeWithStyledComments",
          menuTitle: "Merge sub-cards as proof points ⇒ ❌ Do not move",
        },
        {
          action: "upwardMergeWithStyledCommentsAndMove",
          menuTitle: "Merge sub-cards as proof points ⇒ ✅ Move to proof area",
        },
        {
          action: "mergeIntoParentNoteAndMoveToProofArea",
          menuTitle: "Merge to Parent Card ⇒ Move to Proof Area",
        },
        "⬇️ Move the last 1️⃣ comment",
        {
          action: "moveLastCommentToProofAreaTop",
          menuTitle: "🔝 Move to top of proof area",
        },
        {
          action: "moveLastCommentToProofAreaBottom",
          menuTitle: "▼ Move to the bottom of the proof area",
        },
        "⬇️ Move the last 2️⃣ comments",
        {
          action: "moveLastTwoCommentsToProofAreaTop",
          menuTitle: "🔝 Move to the top of the proof area",
        },
        {
          action: "moveLastTwoCommentsToProofAreaBottom",
          menuTitle: "▼ Move to the bottom of the proof area",
        },
        "🔍 OCR",
        {
          action: "ocrAsProofTitle",
          menuTitle: "OCR >> Set as Title",
        },
        {
          action: "ocrAsProofTitleWithTranslation",
          menuTitle: "OCR >> Translation >> Set as Title",
        },
        {
          action: "ocrAllUntitledDescendants",
          menuTitle: "【Batch】OCR >> Set as Title",
        },
        {
          action: "ocrAllUntitledDescendantsWithTranslation",
          menuTitle: "【Batch】OCR >> Translation >> Set as Title",
        },
        "🌐 Translation",
        {
          action: "translateAllDescendants",
          menuTitle: "【Batch】Translate Titles",
        },
        {
          action: "menu",
          menuTitle: "⚙️ Settings",
          menuWidth: 200,
          menuItems: [
            {
              action: "switchOCRSource",
              menuTitle: "Switch OCR Source",
            },
            {
              action: "switchTranslateModel",
              menuTitle: "Switch Translation Model",
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
    })
  );

  // Search function menu
  global.registerMenuTemplate("menu_search", {
    action: "searchNotesInWebview", // Click: Search Notes
    onLongPress: {
      // Long press: Show menu
      action: "menu",
      menuWidth: 300,
      menuItems: [
        "🔍 Search Function",
        {
          action: "searchDefinition",
          menuTitle: "📚 Search the directory of cards defined above",
        },
      ],
    },
  });

  // Code Learning Menu
  global.registerMenuTemplate("menu_codeLearning", {
    action: "menu",
    menuWidth: 350,
    menuItems: [
      {
        action: "codeMergeTemplate",
        menuTitle: "📚 Code Card Merging Template",
      },
      {
        action: "codeLearning",
        menuTitle: "📚 Code Card Title Card Design",
      },
      {
        action: "codeAnalysisWithAI",
        menuTitle: "🤖 AI Code Analysis (OCR)",
      },
      {
        action: "codeAnalysisFromComment",
        menuTitle: "📝 AI Code Analysis (Comment)",
      },
      "⚙️ Settings",
      {
        action: "switchCodeAnalysisModel",
        menuTitle: "⚙️ Switch AI Analysis Model",
      },
      {
        action: "switchOCRSource",
        menuTitle: "⚙️ Switch OCR Source",
      },
    ],
  });

  global.registerMenuTemplate("menu_pin", {
    action: "pinToFocusTop",
    onLongPress: {
      // Long press: Show menu
      action: "menu",
      menuWidth: 300,
      menuItems: [
        {
          action: "pinToFocusBottom",
          menuTitle: "⬇️ Add to the bottom of Focus",
        },
        {
          action: "pinToMidwayTop",
          menuTitle: "⬆️ Add to top of middle knowledge",
        },
        {
          action: "pinToMidwayBottom",
          menuTitle: "⬇️ Add to bottom of middle knowledge",
        },
        {
          action: "pinToToOrganizeTop",
          menuTitle: "⬆️ Add to top of to be organized",
        },
        {
          action: "pinToToOrganizeBottom",
          menuTitle: "⬇️ Add to bottom of the list",
        },
        {
          action: "pinToDailyTaskTop",
          menuTitle: "⬆️ Add to top of the daily arch",
        },
        {
          action: "pinToDailyTaskBottom",
          menuTitle: "⬇️ Add to the bottom of the daily arch",
        },
        {
          action: "temporarilyPinFocusNoteWithTitle",
          menuTitle: "✏️ Add after custom title",
        },
        "---",
        {
          action: "pinCurrentPageToPages",
          menuTitle: "📄 Pin Current Document Page",
        },
        {
          action: "showPinBoard",
          menuTitle: "📋 Open Pin Card Library",
        },
      ],
    },
  });

  global.registerMenuTemplate("menu_classification", {
    action: "searchNotesInWebview",
    onLongPress: {
      action: "menu",
      menuWidth: 420,
      menuItems: [
        {
          action: "AddTemplateOnLastestParentDefinitionAndAddAsChild",
          menuTitle: "Recently defined parent card template added & focusNote moved to a child card",
        },
        {
          action: "OCRToTitle",
          menuTitle: "OCR Extract as Title",
        },
        "🔍 OCR Tools",
        {
          action: "menu",
          menuTitle: "➡️ 📝 Mode 1: Direct OCR (Unicode)",
          menuWidth: 300,
          menuItems: [
            {
              action: "ocrMode1WithTranslation",
              menuTitle: "🌐 Translated Version (Chinese-English Bilingual)",
            },
            {
              action: "ocrMode1NoTranslationReplaceTitle",
              menuTitle: "📄 Original Version (Chinese Only) → Replace Title",
            },
            {
              action: "ocrMode1NoTranslationAddToFirstHeaderLink",
              menuTitle: "📄 Original Version (Chinese Only) → Add to First Title Link",
            },
            {
              action: "ocrMode1NoTranslationAddToLastHeaderLink",
              menuTitle: "📄 Original Version (Chinese Only) → Add to last title link",
            },
          ],
        },
        {
          action: "menu",
          menuTitle: "➡️ 📄 Mode 2: Markdown OCR (LaTeX)",
          menuWidth: 300,
          menuItems: [
            {
              action: "ocrMode2WithTranslation",
              menuTitle: "🌐 Translated Version (Chinese-English Bilingual)",
            },
            {
              action: "ocrMode2NoTranslation",
              menuTitle: "📄 Original Version (Chinese Only)",
            },
          ],
        },
        {
          action: "menu",
          menuTitle: "➡️ 🧠 Mode 3: Smart OCR (based on card type)",
          menuWidth: 360,
          menuItems: [
            {
              action: "ocrMode3WithTranslation",
              menuTitle: "🌐 Translated Version (Chinese-English Bilingual)",
            },
            {
              action: "ocrMode3NoTranslation",
              menuTitle: "📄 Original Version (Chinese Only)",
            },
            "---",
            "ℹ️ Intelligent Recognition Instructions",
            {
              action: "",
              menuTitle: " • Define Class → Concept Extraction",
            },
            {
              action: "",
              menuTitle: "• Research Progress → Translation Summary",
            },
            {
              action: "",
              menuTitle: "• Other → Direct OCR",
            },
          ],
        },
      ],
    },
  });

  global.registerMenuTemplate("menu_addTemplate", {
    action: "addTemplate",
    onLongPress: {
      action: "menu",
      menuWidth: 350,
      menuItems: [
        {
          action: "addDefinitionNoteAsParentNote",
          menuTitle: "Add Definition Cards Upwards",
        },
      ],
    },
  });

  global.registerMenuTemplate("menu_proofparse", {
    action: "parseProofMarkdown",
  });

  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log(
      `🚀 ${Object.keys(global.customMenuTemplates).length} custom menu templates have been registered`
    );
  }
}

// Extend toolbarConfig.template methods
if (typeof toolbarConfig !== "undefined") {
  // Save the original template method
  const originalTemplate = toolbarConfig.template;

  // Override the template method
  toolbarConfig.template = function (action) {
    // First check the custom menu template
    const customTemplate = global.getMenuTemplate(action);
    if (customTemplate) {
      // If it's a string, return it directly.
      if (typeof customTemplate === "string") {
        return customTemplate;
      }
      // If it's an object, convert it to a JSON string.
      return JSON.stringify(customTemplate, null, 2);
    }

    // If it's not a custom template, call the original method.
    if (originalTemplate && typeof originalTemplate === "function") {
      return originalTemplate.call(this, action);
    }

    // Default return
    return undefined;
  };

  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log("✅ The toolbarConfig.template method has been extended to support custom menu templates");
  }
}

// Register all menu templates now
try {
  registerAllMenuTemplates();
} catch (error) {
  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log(`❌ Error registering menu template: ${error.message}`);
  }
}

// Export the registration function for external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    registerMenuTemplate: global.registerMenuTemplate,
    getMenuTemplate: global.getMenuTemplate,
  };
}

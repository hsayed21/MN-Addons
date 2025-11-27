/**
 * Xia Dayuyang's toolbarUtils extension function
 * Extend the functionality of the toolbarUtils class using the prototype approach
 */

/**
 * Initialize extension
 * Needs to be called after toolbarUtils is defined.
 */
function initXDYYExtensions() {
  /**
Batch retrieve card IDs and store them in ARR.
   */
  toolbarUtils.getNoteIdArr = function (notes) {
    let idsArr = [];
    notes.forEach((note) => {
      idsArr.push(note.noteId);
    });
    return idsArr;
  };

  /**
   * Batch retrieve card URLs and save them to ARR.
   */
  toolbarUtils.getNoteURLArr = function (notes) {
    let idsArr = [];
    notes.forEach((note) => {
      idsArr.push(note.noteURL);
    });
    return idsArr;
  };

  toolbarUtils.isValidNoteId = function (noteId) {
    const regex = /^[0-9A-Z]{8}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{12}$/;
    return regex.test(noteId);
  };

  toolbarUtils.getNoteIdFromClipboard = function () {
    let noteId = MNUtil.clipboardText;
    if (/^marginnote\dapp:\/\/note\//.test(noteId)) {
      noteId = noteId.slice(22);
      return noteId;
    } else if (this.isValidNoteId(noteId)) {
      return noteId;
    } else {
      MNUtil.showHUD("A valid card ID or URL is not in the clipboard");
      return null;
    }
  };

  // ===== Link-related functions =====

  toolbarUtils.isCommentLink = function (comment) {
    return comment.type === "TextNote" && comment.text.includes("marginnote4app://note/");
  };

  toolbarUtils.getNoteURLById = function (noteId) {
    noteId = noteId.trim();
    let noteURL;
    if (/^marginnote\dapp:\/\/note\//.test(noteId)) {
      noteURL = noteId;
    } else {
      noteURL = "marginnote4app://note/" + noteId;
    }
    return noteURL;
  };

  toolbarUtils.getLinkType = function (note, link) {
    link = this.getNoteURLById(link);
    let linkedNoteId = MNUtil.getNoteIdByURL(link);
    let linkedNote = MNNote.new(linkedNoteId);
    if (note.hasComment(link)) {
      if (linkedNote.getCommentIndex(note.noteURL) !== -1) {
        return "Double";
      } else {
        return "Single";
      }
    } else {
      MNUtil.showHUD("The card " + note.title + " does not contain a link to " + linkedNote.title + "");
    }
  };

  toolbarUtils.isLinkDouble = function (note, link) {
    return this.getLinkType(note, link) === "Double";
  };

  toolbarUtils.isLinkSingle = function (note, link) {
    return this.getLinkType(note, link) === "Single";
  };

  // ===== Link deduplication and cleanup functions =====

  // Starting from the next comment after startIndex, remove duplicate links.
  toolbarUtils.linkRemoveDuplicatesAfterIndex = function (note, startIndex) {
    let links = new Set();
    if (startIndex < note.comments.length - 1) {
      // Content must be present before processing.
      for (let i = note.comments.length - 1; i > startIndex; i--) {
        let comment = note.comments[i];
        if ((comment.type = "TextNote" && comment.text.includes("marginnote4app://note/"))) {
          if (links.has(comment.text)) {
            note.removeCommentByIndex(i);
          } else {
            links.add(comment.text);
          }
        }
      }
    }
  };

  toolbarUtils.removeDuplicateKeywordsInTitle = function (note) {
    // Get the keyword array. If the noteTitle is in the format of [xxxx]yyyyy, it will return an empty array by default.
    let keywordsArray =
      note.noteTitle.match(/【.*】(.*)/) && note.noteTitle.match(/【.*】(.*)/)[1].split("; ");
    if (!keywordsArray || keywordsArray.length === 0) return; // If there are no keywords or the keyword array is empty, return directly without further processing.

    // Convert the keyword array into a set to remove duplicates, then convert it back into an array.
    let uniqueKeywords = Array.from(new Set(keywordsArray));

    // Construct a new title string, retaining the prefix and a list of deduplicated keywords.
    let newTitle = `【${note.noteTitle.match(/【(.*)】.*/)[1]}】${uniqueKeywords.join("; ")}`;

    // Update the noteTitle property of the note object
    note.noteTitle = newTitle;
  };

  toolbarUtils.mergeInParentAndReappendAllLinks = function (focusNote) {
    let parentNote = focusNote.parentNote;

    for (let i = focusNote.comments.length - 1; i >= 0; i--) {
      let comment = focusNote.comments[i];
      if (comment.type == "TextNote" && comment.text.includes("marginnote4app://note/")) {
        let targetNoteId = comment.text.match(/marginnote4app:\/\/note\/(.*)/)[1];
        let targetNote = MNNote.new(targetNoteId);
        if (targetNote) {
          let focusNoteIndexInTargetNote = targetNote.getCommentIndex(
            "marginnote4app://note/" + focusNote.noteId
          );
          if (focusNoteIndexInTargetNote !== -1) {
            // Add a check to prevent it from being a one-way link
            targetNote.removeCommentByIndex(focusNoteIndexInTargetNote);
            targetNote.appendNoteLink(parentNote, "To");
            targetNote.moveComment(targetNote.comments.length - 1, focusNoteIndexInTargetNote);
          }
        }
      }
    }
    // Merge into parent card
    parentNote.merge(focusNote.note);

    // Finally, update the links in the parent card (i.e., the merged card).
    this.reappendAllLinksInNote(parentNote);

    // Handling cases merged into summary cards
    if (parentNote.title.startsWith("Summary")) {
      parentNote.title = parentNote.title.replace(/(Summary; )(.*)/, "$2");
    }
  };

  toolbarUtils.reappendAllLinksInNote = function (focusNote) {
    this.clearAllFailedLinks(focusNote);
    for (let i = focusNote.comments.length - 1; i >= 0; i--) {
      let comment = focusNote.comments[i];
      if (comment.type == "TextNote" && comment.text.includes("marginnote4app://note/")) {
        let targetNoteId = comment.text.match(/marginnote4app:\/\/note\/(.*)/)[1];
        if (!targetNoteId.includes("/summary/")) {
          // To prevent the summary link from being processed
          let targetNote = MNNote.new(targetNoteId);
          focusNote.removeCommentByIndex(i);
          focusNote.appendNoteLink(targetNote, "To");
          focusNote.moveComment(focusNote.comments.length - 1, i);
        }
      }
    }
  };

  toolbarUtils.clearAllFailedLinks = function (focusNote) {
    this.linksConvertToMN4Type(focusNote);
    // Deleting from the end upwards avoids the situation where deletions from earlier steps interfere with the indexes of later steps.
    for (let i = focusNote.comments.length - 1; i >= 0; i--) {
      let comment = focusNote.comments[i];
      if (comment.type == "TextNote" && comment.text.includes("marginnote3app://note/")) {
        focusNote.removeCommentByIndex(i);
      } else if (comment.type == "TextNote" && comment.text.includes("marginnote4app://note/")) {
        let targetNoteId = comment.text.match(/marginnote4app:\/\/note\/(.*)/)[1];
        if (!targetNoteId.includes("/summary/")) {
          // To prevent the summary link from being processed
          let targetNote = MNNote.new(targetNoteId);
          if (!targetNote) {
            focusNote.removeCommentByIndex(i);
          }
        }
      }
    }
  };

  toolbarUtils.linksConvertToMN4Type = function (focusNote) {
    for (let i = focusNote.comments.length - 1; i >= 0; i--) {
      let comment = focusNote.comments[i];
      if (comment.type == "TextNote" && comment.text.startsWith("marginnote3app://note/")) {
        let targetNoteId = comment.text.match(/marginnote3app:\/\/note\/(.*)/)[1];
        let targetNote = MNNote.new(targetNoteId);
        if (targetNote) {
          focusNote.removeCommentByIndex(i);
          focusNote.appendNoteLink(targetNote, "To");
          focusNote.moveComment(focusNote.comments.length - 1, i);
        } else {
          focusNote.removeCommentByIndex(i);
        }
      }
    }
  };

  toolbarUtils.generateArrayCombinations = function (Arr, joinLabel) {
    const combinations = [];
    const permute = (result, used) => {
      if (result.length === Arr.length) {
        combinations.push(result.join(joinLabel)); // Save the current combination
        return;
      }
      for (let i = 0; i < Arr.length; i++) {
        if (!used[i]) {
          // Check if the current element has been used
          used[i] = true; // Mark as used
          permute(result.concat(Arr[i]), used); // 递归
          used[i] = false; // Backtrack, mark as unused
        }
      }
    };
    permute([], Array(Arr.length).fill(false)); // Initial call
    return combinations;
  };

  toolbarUtils.findCommonComments = function (arr, startText) {
    let result = null;

    arr.forEach((note, index) => {
      const fromIndex = note.getCommentIndex(startText, true) + 1;
      const subArray = note.comments.slice(fromIndex);
      const texts = subArray.map((comment) => comment.text); // 提取 text

      if (result === null) {
        result = new Set(texts);
      } else {
        result = new Set([...result].filter((comment) => texts.includes(comment)));
      }

      if (result.size === 0) return; // Exit early
    });

    return result ? Array.from(result) : [];
  };

  // Check if str is a 4-digit number
  toolbarUtils.isFourDigitNumber = function (str) {
    // Use regular expressions to check
    const regex = /^\d{4}$/;
    return regex.test(str);
  };

  toolbarUtils.referenceInfoYear = function (focusNote, year) {
    let findYear = false;
    let targetYearNote;
    let yearLibraryNote = MNNote.new("F251AFCC-AA8E-4A1C-A489-7EA4E4B58A02");
    let thoughtHtmlCommentIndex = focusNote.getCommentIndex("Related Thoughts:", true);
    for (let i = 0; i <= yearLibraryNote.childNotes.length - 1; i++) {
      if (this.getFirstKeywordFromTitle(yearLibraryNote.childNotes[i].noteTitle) == year) {
        targetYearNote = yearLibraryNote.childNotes[i];
        findYear = true;
        break;
      }
    }
    if (!findYear) {
      // If it does not exist, add a year card.
      targetYearNote = MNNote.clone("16454AD3-C1F2-4BC4-8006-721F84999BEA");
      targetYearNote.note.noteTitle += "; " + year;
      yearLibraryNote.addChild(targetYearNote.note);
    }
    let yearTextIndex = focusNote.getIncludingCommentIndex("- 年份", true);
    if (yearTextIndex == -1) {
      focusNote.appendMarkdownComment("- 年份（Year）：", thoughtHtmlCommentIndex);
      focusNote.appendNoteLink(targetYearNote, "To");
      focusNote.moveComment(focusNote.comments.length - 1, thoughtHtmlCommentIndex + 1);
    } else {
      if (focusNote.getCommentIndex("marginnote4app://note/" + targetYearNote.noteId) == -1) {
        focusNote.appendNoteLink(targetYearNote, "To");
        focusNote.moveComment(focusNote.comments.length - 1, yearTextIndex + 1);
      } else {
        focusNote.moveComment(
          focusNote.getCommentIndex("marginnote4app://note/" + targetYearNote.noteId),
          yearTextIndex + 1
        );
      }
    }
  };

  // ===== Comment and content processing functions =====

  toolbarUtils.moveLastCommentAboveComment = function (note, commentText) {
    let commentIndex = note.getCommentIndex(commentText, true);
    if (commentIndex != -1) {
      note.moveComment(note.comments.length - 1, commentIndex);
    }
    return commentIndex;
  };

  toolbarUtils.numberToChinese = function (num) {
    const chineseNumbers = "零一二三四五六七八九";
    const units = ["", "ten", "hundred", "thousand", "ten thousand", "hundred million"];

    if (num === 0) return chineseNumbers[0];

    let result = "";
    let unitIndex = 0;

    while (num > 0) {
      const digit = num % 10;
      if (digit !== 0) {
        result = chineseNumbers[digit] + units[unitIndex] + result;
      } else if (result && result[0] !== chineseNumbers[0]) {
        result = chineseNumbers[0] + result; // Add zeros if needed
      }
      num = Math.floor(num / 10);
      unitIndex++;
    }

    // Remove leading zeros
    return result.replace("zero").replace("zero").trim();
  };

  // Types of cards obtained: light green, light yellow, and yellow
  toolbarUtils.getClassificationNoteTypeByTitle = function (title) {
    let match = title.match(/.*Related(.*)/);
    if (match) {
      return match[1];
    } else {
      return "";
    }
  };

  toolbarUtils.referenceSeriesBookMakeCard = function (focusNote, seriesName, seriesNum) {
    if (focusNote.excerptText) {
      this.convertNoteToNonexcerptVersion(focusNote);
    } else {
      MNUtil.undoGrouping(() => {
        let seriesLibraryNote = MNNote.new("4DBABA2A-F4EB-4B35-90AB-A192B79411FD");
        let findSeries = false;
        let targetSeriesNote;
        let focusNoteIndexInTargetSeriesNote;
        for (let i = 0; i <= seriesLibraryNote.childNotes.length - 1; i++) {
          if (seriesLibraryNote.childNotes[i].noteTitle.includes(seriesName)) {
            targetSeriesNote = seriesLibraryNote.childNotes[i];
            seriesName = toolbarUtils.getFirstKeywordFromTitle(targetSeriesNote.noteTitle);
            findSeries = true;
            break;
          }
        }
        if (!findSeries) {
          targetSeriesNote = MNNote.clone("5CDABCEC-8824-4E9F-93E1-574EA7811FB4");
          targetSeriesNote.note.noteTitle = "【Documents: Book Series】; " + seriesName;
          seriesLibraryNote.addChild(targetSeriesNote.note);
        }
        let referenceInfoHtmlCommentIndex = focusNote.getCommentIndex("Literature Information:", true);
        if (referenceInfoHtmlCommentIndex == -1) {
          toolbarUtils.cloneAndMerge(focusNote, "F09C0EEB-4FB5-476C-8329-8CC5AEFECC43");
        }
        let seriesTextIndex = focusNote.getIncludingCommentIndex("- 系列", true);
        let thoughtHtmlCommentIndex = focusNote.getCommentIndex("Related Thoughts:", true);
        MNUtil.undoGrouping(() => {
          if (seriesNum !== "0") {
            focusNote.noteTitle = toolbarUtils.replaceStringStartWithSquarebracketContent(
              focusNote.noteTitle,
              "[Reference: Book Title: " + seriesName + " - Vol. " + seriesNum + "];"
            );
          } else {
            focusNote.noteTitle = toolbarUtils.replaceStringStartWithSquarebracketContent(
              focusNote.noteTitle,
              "【Reference: Book Title: " + seriesName + "】;"
            );
          }
        });
        if (seriesTextIndex == -1) {
          MNUtil.undoGrouping(() => {
            if (seriesNum !== "0") {
              focusNote.appendMarkdownComment("- 系列：Vol. " + seriesNum, thoughtHtmlCommentIndex);
            } else {
              focusNote.appendMarkdownComment("- 系列：", thoughtHtmlCommentIndex);
            }
          });
          focusNote.appendNoteLink(targetSeriesNote, "To");
          focusNote.moveComment(focusNote.comments.length - 1, thoughtHtmlCommentIndex + 1);
        } else {
          // Delete and add again
          focusNote.removeCommentByIndex(seriesTextIndex);
          MNUtil.undoGrouping(() => {
            if (seriesNum !== "0") {
              focusNote.appendMarkdownComment("- 系列：Vol. " + seriesNum, seriesTextIndex);
            } else {
              focusNote.appendMarkdownComment("- 系列：", seriesTextIndex);
            }
          });
          if (focusNote.getCommentIndex("marginnote4app://note/" + targetSeriesNote.noteId) == -1) {
            focusNote.appendNoteLink(targetSeriesNote, "To");
            focusNote.moveComment(focusNote.comments.length - 1, seriesTextIndex + 1);
          } else {
            focusNote.moveComment(
              focusNote.getCommentIndex("marginnote4app://note/" + targetSeriesNote.noteId),
              seriesTextIndex + 1
            );
          }
        }
        focusNoteIndexInTargetSeriesNote = targetSeriesNote.getCommentIndex(
          "marginnote4app://note/" + focusNote.noteId
        );
        if (focusNoteIndexInTargetSeriesNote == -1) {
          targetSeriesNote.appendNoteLink(focusNote, "To");
        }
        try {
          MNUtil.undoGrouping(() => {
            toolbarUtils.sortNoteByVolNum(targetSeriesNote, 1);
            let bookLibraryNote = MNNote.new("49102A3D-7C64-42AD-864D-55EDA5EC3097");
            bookLibraryNote.addChild(focusNote.note);
            // focusNote.focusInMindMap(0.5)
          });
        } catch (error) {
          MNUtil.showHUD(error);
        }
      });
      return focusNote;
    }
  };

  toolbarUtils.replaceStringStartWithSquarebracketContent = function (string, afterContent) {
    if (string.startsWith("【")) {
      string = string.replace(/^【.*?】/, afterContent);
    } else {
      string = afterContent + string;
    }
    return string;
  };

  toolbarUtils.referenceRefByRefNum = function (focusNote, refNum) {
    if (focusNote.excerptText) {
      this.convertNoteToNonexcerptVersion(focusNote);
    } else {
      let currentDocmd5 = MNUtil.currentDocmd5;
      let findClassificationNote = false;
      let classificationNote;
      if (toolbarConfig.referenceIds.hasOwnProperty(currentDocmd5)) {
        if (toolbarConfig.referenceIds[currentDocmd5].hasOwnProperty(refNum)) {
          if (toolbarConfig.referenceIds[currentDocmd5][0] == undefined) {
            MNUtil.showHUD("Document not bound to ID");
          } else {
            let refSourceNoteId = toolbarConfig.referenceIds[currentDocmd5][0];
            let refSourceNote = MNNote.new(refSourceNoteId);
            let refSourceNoteTitle = toolbarUtils.getFirstKeywordFromTitle(refSourceNote.noteTitle);
            let refSourceNoteAuthor = toolbarUtils.getFirstAuthorFromReferenceById(refSourceNoteId);
            let refedNoteId = toolbarConfig.referenceIds[currentDocmd5][refNum];
            let refedNote = MNNote.new(refedNoteId);
            let refedNoteTitle = toolbarUtils.getFirstKeywordFromTitle(refedNote.noteTitle);
            let refedNoteAuthor = toolbarUtils.getFirstAuthorFromReferenceById(refedNoteId);
            // First check if there are any categorized sub-cards in refedNote.
            for (let i = 0; i < refedNote.childNotes.length; i++) {
              let childNote = refedNote.childNotes[i];
              if (childNote.noteTitle && childNote.noteTitle.includes("[" + refNum + "] " + refedNoteTitle)) {
                classificationNote = refedNote.childNotes[i];
                findClassificationNote = true;
                break;
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
                "Condition";
            } else {
              // Update the title if found.
              // Because there might be occasional instances where the writer is forgotten, resulting in "No author".
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
                "Condition";
            }
            refedNote.addChild(classificationNote.note);
            // Move the link to "Quote:"
            let refedNoteIdIndexInClassificationNote = classificationNote.getCommentIndex(
              "marginnote4app://note/" + refedNoteId
            );
            if (refedNoteIdIndexInClassificationNote == -1) {
              classificationNote.appendNoteLink(refedNote, "To");
              classificationNote.moveComment(
                classificationNote.comments.length - 1,
                classificationNote.getCommentIndex("Specific reference:", true)
              );
            } else {
              classificationNote.moveComment(
                refedNoteIdIndexInClassificationNote,
                classificationNote.getCommentIndex("Specific reference:", true) - 1
              );
            }
            // Move the link to the "Original Document"
            let refSourceNoteIdIndexInClassificationNote = classificationNote.getCommentIndex(
              "marginnote4app://note/" + refSourceNoteId
            );
            if (refSourceNoteIdIndexInClassificationNote == -1) {
              classificationNote.appendNoteLink(refSourceNote, "To");
              classificationNote.moveComment(
                classificationNote.comments.length - 1,
                classificationNote.getCommentIndex("引用：", true)
              );
            } else {
              classificationNote.moveComment(
                refSourceNoteIdIndexInClassificationNote,
                classificationNote.getCommentIndex("引用：", true) - 1
              );
            }
            // Link category cards to refSourceNote
            let classificationNoteIdIndexInRefSourceNote = refSourceNote.getCommentIndex(
              "marginnote4app://note/" + classificationNote.noteId
            );
            if (classificationNoteIdIndexInRefSourceNote == -1) {
              refSourceNote.appendNoteLink(classificationNote, "To");
            }
            // Link category cards to refedNote
            let classificationNoteIdIndexInRefedNote = refedNote.getCommentIndex(
              "marginnote4app://note/" + classificationNote.noteId
            );
            if (classificationNoteIdIndexInRefedNote == -1) {
              refedNote.appendNoteLink(classificationNote, "To");
              // refedNote.moveComment(refedNote.comments.length-1,refedNote.getCommentIndex("References:", true))
            }

            /* Handle referenced content */

            // Title
            // focusNote.noteTitle = "【" + refSourceNoteTitle + " - " + refSourceNoteAuthor + "」 Reference" + "【[" + refNum + "] " + refedNoteTitle + " - " + refedNoteAuthor + "」 Case】"
            focusNote.noteTitle = this.replaceStringStartWithSquarebracketContent(
              focusNote.noteTitle,
              "【「" +
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
                "Condition】"
            );

            focusNote.noteTitle = focusNote.noteTitle.replace(
              /\s*{{refedNoteTitle}}\s*/,
              "「" + refedNoteTitle + "」"
            );

            // Merge template:
            let linkHtmlCommentIndex = focusNote.getCommentIndex("Related Links:", true);
            if (linkHtmlCommentIndex == -1) {
              this.cloneAndMerge(focusNote, "FFF70A03-D44F-4201-BD69-9B4BD3E96279");
            }

            // Link to reference card
            linkHtmlCommentIndex = focusNote.getCommentIndex("Related Links:", true);
            // First, make sure the link is already established.
            let classificationNoteLinkIndexInFocusNote = focusNote.getCommentIndex(
              "marginnote4app://note/" + classificationNote.noteId
            );
            if (classificationNoteLinkIndexInFocusNote == -1) {
              focusNote.appendNoteLink(classificationNote, "To");
            }
            let refedNoteLinkIndexInFocusNote = focusNote.getCommentIndex(
              "marginnote4app://note/" + refedNoteId
            );
            if (refedNoteLinkIndexInFocusNote == -1) {
              focusNote.appendNoteLink(refedNote, "To");
            }
            let refSourceNoteLinkIndexInFocusNote = focusNote.getCommentIndex(
              "marginnote4app://note/" + refSourceNoteId
            );
            if (refSourceNoteLinkIndexInFocusNote == -1) {
              focusNote.appendNoteLink(refSourceNote, "To");
            }

            refSourceNoteLinkIndexInFocusNote = focusNote.getCommentIndex(
              "marginnote4app://note/" + refSourceNoteId
            );
            focusNote.moveComment(refSourceNoteLinkIndexInFocusNote, linkHtmlCommentIndex + 1);

            refedNoteLinkIndexInFocusNote = focusNote.getCommentIndex("marginnote4app://note/" + refedNoteId);
            focusNote.moveComment(refedNoteLinkIndexInFocusNote, linkHtmlCommentIndex + 2);

            classificationNoteLinkIndexInFocusNote = focusNote.getCommentIndex(
              "marginnote4app://note/" + classificationNote.noteId
            );
            focusNote.moveComment(classificationNoteLinkIndexInFocusNote, linkHtmlCommentIndex + 3);

            // Link to category card
            let focusNoteLinkIndexInClassificationNote = classificationNote.getCommentIndex(
              "marginnote4app://note/" + focusNote.noteId
            );
            if (focusNoteLinkIndexInClassificationNote == -1) {
              classificationNote.appendNoteLink(focusNote, "To");
            }

            return [focusNote, classificationNote];
          }
        } else {
          MNUtil.showHUD("[" + refNum + "] No ID binding performed");
        }
      } else {
        MNUtil.showHUD("The current document has not yet started binding an ID");
      }
    }
  };

  // Get the first author's name from the reference card
  toolbarUtils.getFirstAuthorFromReferenceById = function (id) {
    let note = MNNote.new(id);
    let authorTextIndex = note.getIncludingCommentIndex("- 作者", true);
    if (
      note.comments[authorTextIndex + 1].text &&
      note.comments[authorTextIndex + 1].text.includes("marginnote")
    ) {
      let authorId = MNUtil.getNoteIdByURL(note.comments[authorTextIndex + 1].text);
      let authorNote = MNNote.new(authorId);
      let authorTitle = authorNote.noteTitle;
      return this.getFirstKeywordFromTitle(authorTitle);
    } else {
      return "No author!";
    }
  };

  // Replace English punctuation
  toolbarUtils.formatPunctuationToEnglish = function (string) {
    // Replace Chinese parentheses with Western parentheses
    string = string.replace(/–/g, "-");
    string = string.replace(/，/g, ",");
    string = string.replace(/。/g, ".");
    string = string.replace(/？/g, "?");
    string = string.replace(/（/g, "(");
    string = string.replace(/）/g, ")");
    string = string.replace(/【/g, "[");
    string = string.replace(/】/g, "]");
    string = string.replace(/「/g, "[");
    string = string.replace(/」/g, "]");

    return string;
  };

  // Normalize the spaces before and after English punctuation marks in the string
  toolbarUtils.formatEnglishStringPunctuationSpace = function (string) {
    // Replace Chinese parentheses with Western parentheses
    string = this.formatPunctuationToEnglish(string);

    // Remove newline characters
    string = string.replace(/\n/g, " ");

    // Handling spaces before and after common punctuation marks
    string = string.replace(/ *, */g, ", ");
    string = string.replace(/ *\. */g, ". ");
    string = string.replace(/ *\? */g, "? ");
    string = string.replace(/ *\- */g, "-");
    string = string.replace(/ *\) */g, ") ");
    string = string.replace(/ *\] */g, "] ");

    // If the punctuation mark is at the end of the sentence, remove the following space.
    string = string.replace(/, $/g, ",");
    string = string.replace(/\. $/g, ".");
    string = string.replace(/\? $/g, "?");
    string = string.replace(/\) $/g, ")");
    string = string.replace(/\] $/g, "]");

    // Handling punctuation marks such as left parentheses
    string = string.replace(/ *\( */g, " (");
    string = string.replace(/ *\[ */g, " [");

    // Handling some special cases
    string = string.replace(/\. ,/g, ".,"); // Replaces the initials of the name with the dot and the following dot.

    return string;
  };

  // [1] xx => 1
  toolbarUtils.extractRefNumFromReference = function (text) {
    text = this.formatPunctuationToEnglish(text);
    text = text.replace(/\n/g, " ");
    // const regex = /^\s*\[\s*(\d{1,3})\s*\]\s*.+$/;
    const regex = /^\s*\[\s*(.*?)\s*\]\s*.+$/;
    const match = text.trim().match(regex); // Use regular expressions for matching
    if (match) {
      return match[1].trim(); // Returns the matched text and removes leading and trailing spaces.
    } else {
      return 0; // If no match is found, return the original text.
    }
  };

  // [1] xxx => xxx
  toolbarUtils.extractRefContentFromReference = function (text) {
    text = this.formatPunctuationToEnglish(text);
    text = text.replace(/\n/g, " ");
    const regex = /^\s*\[[^\]]*\]\s*(.+)$/;
    const match = text.trim().match(regex); // Use regular expressions for matching
    if (match) {
      return match[1].trim(); // Returns the matched text and removes leading and trailing spaces.
    } else {
      return text; // If no match is found, return the original text.
    }
  };

  toolbarUtils.referenceStoreOneIdForCurrentDoc = function (input) {
    let refNum = input.split("@")[0];
    let refId = input.split("@")[1];
    let currentDocmd5 = MNUtil.currentDocmd5;
    if (toolbarConfig.referenceIds.hasOwnProperty(currentDocmd5)) {
      toolbarConfig.referenceIds[currentDocmd5][refNum] = refId;
    } else {
      toolbarConfig.referenceIds[currentDocmd5] = {};
      toolbarConfig.referenceIds[currentDocmd5][refNum] = refId;
    }
    MNUtil.showHUD("Save: [" + refNum + "] -> " + refId);
    toolbarConfig.save("MNToolbar_referenceIds");
  };

  toolbarUtils.getRefIdByNum = function (num) {
    let currentDocmd5 = MNUtil.currentDocmd5;
    if (toolbarConfig.referenceIds[currentDocmd5].hasOwnProperty(num)) {
      return toolbarConfig.referenceIds[currentDocmd5][num];
    } else {
      MNUtil.showHUD("The current document does not have a card ID for reference [" + num + "]");
      return "";
    }
  };

  toolbarUtils.getVolNumFromTitle = function (title) {
    let match = title.match(/【.*?Vol.\s(\d+)】/)[1];
    return match ? parseInt(match) : 0;
  };

  toolbarUtils.getVolNumFromLink = function (link) {
    let note = MNNote.new(link);
    let title = note.noteTitle;
    return this.getVolNumFromTitle(title);
  };

  // Cards are sorted by the year in the title.
  toolbarUtils.sortNoteByYear = function () {
    let yearLibraryNote = MNNote.new("F251AFCC-AA8E-4A1C-A489-7EA4E4B58A02");
    let indexArr = Array.from({ length: yearLibraryNote.childNotes.length }, (_, i) => i);
    let idIndexArr = indexArr.map((index) => ({
      id: yearLibraryNote.childNotes[index].noteId,
      year: parseInt(toolbarUtils.getFirstKeywordFromTitle(yearLibraryNote.childNotes[index].noteTitle)),
    }));
    let sortedArr = idIndexArr.sort((a, b) => a.year - b.year);
    // MNUtil.showHUD(sortedArr[1].year)

    MNUtil.undoGrouping(() => {
      sortedArr.forEach((item, index) => {
        let yearNote = MNNote.new(item.id);
        yearLibraryNote.addChild(yearNote.note);
      });
    });
  };

  // Links are sorted by their vol value
  // startIndex represents the comment index at which sorting begins.
  toolbarUtils.sortNoteByVolNum = function (note, startIndex) {
    let commentsLength = note.comments.length;
    let initialIndexArr = Array.from({ length: commentsLength }, (_, i) => i);
    let initialSliceArr = initialIndexArr.slice(startIndex);
    let initialSliceVolnumArrAux = initialSliceArr.map((index) =>
      this.getVolNumFromLink(note.comments[index].text)
    );
    // MNUtil.showHUD(initialSliceVolnumArr)
    let initialSliceVolnumArr = [...initialSliceVolnumArrAux];
    let sortedVolnumArr = initialSliceVolnumArrAux.sort((a, b) => a - b);
    // MNUtil.showHUD(sortedVolnumArr)
    let targetSliceArr = [];
    initialSliceVolnumArr.forEach((volnum) => {
      targetSliceArr.push(sortedVolnumArr.indexOf(volnum) + startIndex);
    });
    // MNUtil.showHUD(targetSliceArr)
    let targetArr = [...initialIndexArr.slice(0, startIndex), ...targetSliceArr];
    note.sortCommentsByNewIndices(targetArr);
    // MNUtil.showHUD(targetArr)
  };

  // 【xxx】yyy; zzz; => yyy || 【xxx】; zzz => zzz
  toolbarUtils.getFirstKeywordFromTitle = function (title) {
    // const regex = /【.*?】(.*?); (.*?)(;.*)?/;
    const regex = /【.*】(.*?);\s*([^;]*?)(?:;|$)/;
    const matches = title.match(regex);

    if (matches) {
      const firstPart = matches[1].trim(); // Extract the content before the semicolon
      const secondPart = matches[2].trim(); // Extract the content after the first semicolon

      // Select the content to return based on whether the first part is empty.
      return firstPart === "" ? secondPart : firstPart;
    }

    // If no match is found, return null or an empty string.
    return "";
  };

  toolbarUtils.getSecondKeywordFromTitle = function (title) {
    // const regex = /【.*?】(.*?); (.*?)(;.*)?/;
    const regex = /【.*】(.*?);\s*([^;]*?)(?:;|$)/;
    const matches = title.match(regex);
    let targetText = title;

    if (matches) {
      const firstPart = matches[1].trim(); // Extract the content before the semicolon
      const secondPart = matches[2].trim(); // Extract the content after the first semicolon

      // Select the content to return based on whether the first part is empty.
      if (firstPart !== "") {
        targetText = targetText.replace(firstPart, "");
        return this.getFirstKeywordFromTitle(targetText);
      } else {
        targetText = targetText.replace("; " + secondPart, "");
        return this.getFirstKeywordFromTitle(targetText);
      }
    }

    // If no match is found, return null or an empty string.
    return "";
  };

  toolbarUtils.languageOfString = function (input) {
    const chineseRegex = /[\u4e00-\u9fa5]/; // Range of Chinese characters to match
    // const englishRegex = /^[A-Za-z0-9\s,.!?]+$/; // Matches English characters and common punctuation marks

    if (chineseRegex.test(input)) {
      return "Chinese";
    } else {
      return "English";
    }
  };

  // Abbreviated version of the person's name

  // static getPinyin(chineseString) {
  //   return pinyin(chineseString, {
  // style: pinyin.STYLE_NORMAL, // Standard Pinyin
  // heteronym: false // Ignore polyphonic characters
  //   });
  // }

  toolbarUtils.camelizeString = function (string) {
    return string[0].toUpperCase() + string.slice(1);
  };

  toolbarUtils.moveStringPropertyToSecondPosition = function (obj, stringProp) {
    // Check if the object contains the specified property
    if (!obj || !obj.hasOwnProperty(stringProp)) {
      return "The object does not have a property named '" + stringProp + "'";
    }

    // Get all property keys of an object
    const keys = Object.keys(obj);

    // Ensure there are enough keys for movement
    if (keys.length < 2) {
      return "Insufficient number of properties in the object; unable to perform the move operation";
    }

    // Save the associated values ​​first
    const stringValue = obj[stringProp];

    // Create a new object to reorder the properties
    const newObj = {};

    // Place the first property into the new object
    newObj[keys[0]] = obj[keys[0]];

    // Move the target attribute to the second position
    newObj[stringProp] = stringValue;

    // Put the remaining properties into the new object
    for (let i = 1; i < keys.length; i++) {
      if (keys[i] !== stringProp) {
        newObj[keys[i]] = obj[keys[i]];
      }
    }

    return newObj;
  };

  // ===== Names and Text Processing Functions =====

  toolbarUtils.getAbbreviationsOfEnglishName = function (name) {
    let languageOfName = this.languageOfString(name);
    let Name = {};
    if (languageOfName == "English") {
      let namePartsArr = name.split(" ");
      let namePartsNum = namePartsArr.length;
      let firstPart = namePartsArr[0];
      let lastPart = namePartsArr[namePartsNum - 1];
      let middlePart = namePartsArr.slice(1, namePartsNum - 1).join(" ");
      switch (namePartsNum) {
        case 1:
          // Name.language = "English"
          Name.original = name;
          break;
        case 2:
          // Taking Kangwei Xia as an example
          // Name.language = "English"
          Name.original = name;
          Name.reverse = lastPart + ", " + firstPart; // Xia, Kangwei
          Name.abbreviateFirstpart = firstPart[0] + ". " + lastPart; // K. Xia
          Name.abbreviateFirstpartAndReverseAddCommaAndDot = lastPart + ", " + firstPart[0] + "."; // Xia, K.
          Name.abbreviateFirstpartAndReverseAddDot = lastPart + " " + firstPart[0] + "."; // Xia K.
          Name.abbreviateFirstpartAndReverse = lastPart + ", " + firstPart[0]; // Xia, K
          break;
        case 3:
          // Take Louis de Branges as an example
          // Name.language = "English"
          Name.original = name;
          Name.removeFirstpart = middlePart + " " + lastPart; // de Branges
          Name.removeMiddlepart = firstPart + " " + lastPart; // Louis Branges
          Name.abbreviateFirstpart = firstPart[0] + ". " + middlePart + " " + lastPart; // L. de Branges
          Name.abbreviateFirstpartAndReverseAddComma = middlePart + " " + lastPart + ", " + firstPart[0]; // de Branges, L
          Name.abbreviateFirstpartAndReverseAddCommaAndDot =
            middlePart + " " + lastPart + ", " + firstPart[0] + "."; // de Branges, L.
          Name.abbreviateFirstpartAndLastpartAddDots =
            firstPart[0] + ". " + middlePart + " " + lastPart[0] + "."; // L. de B.
          Name.abbreviateFirstpartAndMiddlepartAddDots =
            firstPart[0] + ". " + middlePart[0] + ". " + lastPart; // L. d. Branges
          Name.abbreviateFirstpartAddDotAndRemoveMiddlepart = firstPart[0] + ". " + lastPart; // L. Branges
          Name.abbreviateFirstpartRemoveMiddlepartAndReverseAddCommaAndDot =
            lastPart + ", " + firstPart[0] + "."; // Branges, L.
          Name.abbreviateFirstpartAndMiddlepartAndReverseAddDots =
            lastPart + " " + middlePart[0] + ". " + firstPart[0] + "."; // Branges d. L.
          Name.abbreviateMiddlePartAddDot = firstPart + " " + middlePart[0] + ". " + lastPart; // Louis d. Branges
          break;
        default:
          // Name.language = "English"
          Name.original = name;
          break;
      }
      return Name;
    }
  };

  toolbarUtils.getAbbreviationsOfName = function (nameInput) {
    let languageOfName = this.languageOfString(nameInput);
    let Name = {};
    let pinyinStandard;
    if (languageOfName == "Chinese") {
      let namePinyinArr = pinyin.pinyin(nameInput, {
        style: "normal",
        mode: "surname",
      });
      if (namePinyinArr) {
        let firstPart = namePinyinArr[0].toString();
        let lastPart = namePinyinArr[namePinyinArr.length - 1].toString();
        let middlePart = namePinyinArr[1].toString();
        if (namePinyinArr.length == 2) {
          // Taking lu xun as an example

          // Xun Lu
          pinyinStandard = this.camelizeString(lastPart) + " " + this.camelizeString(firstPart);
          // MNUtil.showHUD(pinyinStandard)
          Name = this.getAbbreviationsOfEnglishName(pinyinStandard);
          Name.originalChineseName = nameInput;
          // Name.language = "Chinese"
          // Lu Xun
          Name.pinyinStandardAndReverse =
            this.camelizeString(firstPart) + " " + this.camelizeString(lastPart);

          Name = this.moveStringPropertyToSecondPosition(Name, "originalChineseName");

          // // Lu Xun
          // Name.pinyinStandardAndReverse = this.camelizeString(firstPart) + " " + this.camelizeString(lastPart)
          // // luxun
          // Name.pinyinNoSpace = firstPart + lastPart
          // // lu xun
          // Name.pinyinWithSpace = firstPart + " " + lastPart
          // // Lu xun
          // Name.pinyinCamelizeFirstpartWithSpace = this.camelizeString(firstPart) + " " + lastPart
          // Luxun
          // Name.pinyinCamelizeFirstpartNoSpace = this.camelizeString(firstPart) + lastPart
          // // xun, Lu
          // Name.pinyinCamelizeFirstpartAndReverseWithComma = lastPart + ", " + this.camelizeString(firstPart)
          // // LuXun
          // Name.pinyinCamelizeNoSpace = this.camelizeString(firstPart) +  this.camelizeString(lastPart)
          // // xun Lu
          // Name.pinyinCamelizeFirstpartAndReverseWithSpace = lastPart + " " + this.camelizeString(firstPart)
          // // xunLu
          // Name.pinyinCamelizeFirstpartAndReverseNoSpace = lastPart  + this.camelizeString(firstPart)
          // Xun, Lu
          // Name.pinyinStandardWithComma = this.camelizeString(lastPart) + " " + this.camelizeString(firstPart)
        } else {
          if (namePinyinArr.length == 3) {
            // Take xia kang wei as an example

            // Kangwei Xia
            pinyinStandard =
              this.camelizeString(middlePart) + lastPart + " " + this.camelizeString(firstPart);
            Name = this.getAbbreviationsOfEnglishName(pinyinStandard);
            Name.originalChineseName = nameInput;
            // Name.language = "Chinese"
            // Xia Kangwei
            Name.pinyinStandardAndReverse =
              this.camelizeString(firstPart) + " " + this.camelizeString(middlePart) + lastPart;
            Name = this.moveStringPropertyToSecondPosition(Name, "originalChineseName");
          }
        }
      } else {
        MNUtil.showHUD(nameInput + "->" + namePinyinArr);
      }
      return Name;
    } else {
      return this.getAbbreviationsOfEnglishName(nameInput);
    }
  };

  // Extract bib entries from reference cards

  toolbarUtils.extractBibFromReferenceNote = function (focusNote) {
    let findBibContent = false;
    let bibContent;
    for (let i = 0; i <= focusNote.comments.length - 1; i++) {
      if (focusNote.comments[i].text && focusNote.comments[i].text.includes("- `.bib`")) {
        bibContent = focusNote.comments[i].text;
        findBibContent = true;
        break;
      }
    }
    if (findBibContent) {
      // Define a regular expression to match the content of "bib", and adjust the handling of newline characters.
      const bibPattern = /```bib\s*\n([\s\S]*?)\n\s*```/;
      // Extracting bib content using regular expressions
      let bibContentMatch = bibPattern.exec(bibContent);

      // Check if content is matched
      if (bibContentMatch) {
        // MNUtil.copy(
        return bibContentMatch[1]
          .split("\n")
          .map((line) => (line.startsWith("  ") ? line.slice(2) : line))
          .join("\n");
        // )
      } else {
        MNUtil.showHUD("No bib content found"); // Throws an error if no matching content is found.
      }
    } else {
      MNUtil.showHUD("No '- `bib`' found");
    }
  };

  // Split the string into an array

  toolbarUtils.splitStringByThreeSeparators = function (string) {
    // Regular expression to match Chinese commas, Chinese semicolons, and Western semicolons
    const separatorRegex = /，\s*|；\s*|;\s*/g;

    // Use the split method to split the string by the delimiter
    const arr = string.split(separatorRegex);

    // Remove any possible empty string elements (if there are whitespace before, after, or between consecutive delimiters in the input string).
    return arr.filter(Boolean);
  };

  toolbarUtils.splitStringByFourSeparators = function (string) {
    // Regular expression to match Chinese commas, Chinese semicolons, and Western semicolons
    const separatorRegex = /，\s*|；\s*|;\s*|,\s*/g;

    // Use the split method to split the string by the delimiter
    const arr = string.split(separatorRegex);

    // Remove any possible empty string elements (if there are whitespace before, after, or between consecutive delimiters in the input string).
    return arr.filter(Boolean);
  };

  // Get a contiguous sequence of elements from an array starting at startNum.
  toolbarUtils.getContinuousSequenceFromNum = function (arr, startNum) {
    let sequence = []; // An array to store a continuous sequence
    let i = arr.indexOf(startNum); // Find the index of startNum in the array

    // Check if startNum is found or if it is valid.
    if (i === -1 || startNum !== arr[i]) {
      return [];
    }

    let currentNum = startNum; // The number currently being processed

    // Traverse the array backwards to find a continuous sequence
    while (i < arr.length && arr[i] === currentNum) {
      sequence.push(arr[i]); // Add consecutive numbers to the sequence.
      currentNum++; // Move to the next number
      i++; // Update index position
    }

    return sequence; // Returns an array of the found consecutive sequences
  };

  // Determine the type of document card
  toolbarUtils.getReferenceNoteType = function (note) {
    if (note.noteTitle.includes("paper")) {
      return "paper";
    } else {
      return "book";
    }
  };

  // Find the xxx in the sub-card where "; xxx" is repeated.
  toolbarUtils.findDuplicateTitles = function (childNotes) {
    const seen = new Set();
    const duplicates = [];

    childNotes.forEach((note) => {
      const parts = note.noteTitle.split(";").slice(1);
      parts.forEach((part) => {
        const fragment = part.trim();
        if (seen.has(fragment)) {
          duplicates.push(fragment);
        } else {
          seen.add(fragment);
        }
      });
    });

    return duplicates;
  };

  /**
   * Remove card content, retain text comments
   * Xia Dayuyang
   */
  toolbarUtils.clearContentKeepMarkdownText = function (focusNote) {
    let focusNoteComments = focusNote.note.comments;
    let focusNoteCommentLength = focusNoteComments.length;
    let comment;
    UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
      "Please confirm.",
      "Should only Markdown text be kept?\nNote that HTML comments will also be deleted.",
      0,
      "Clicked the wrong thing"["Sure"],
      (alert, buttonIndex) => {
        if (buttonIndex == 1) {
          MNUtil.undoGrouping(() => {
            MNUtil.copy(focusNote.noteTitle);
            focusNote.noteTitle = "";
            // Deleting from the end upwards avoids the situation where deletions from earlier steps interfere with the indexes of later steps.
            for (let i = focusNoteCommentLength - 1; i >= 0; i--) {
              comment = focusNoteComments[i];
              if (
                comment.type !== "TextNote" ||
                (comment.type !== "PaintNote" &&
                  (comment.text.includes("marginnote4app") || comment.text.includes("marginnote3app")))
              ) {
                focusNote.removeCommentByIndex(i);
              }
            }
          });
        }
      }
    );
  };

  /**
Convert the HTMLNote content in the card to Markdown syntax.
* Xia Dayuyang
   */
  toolbarUtils.convetHtmlToMarkdown = function (focusNote) {
    let focusNoteComments = focusNote.note.comments;
    focusNoteComments.forEach((comment, index) => {
      if (comment.type == "HtmlNote") {
        let content = comment.text;
        let markdownContent =
          '<span style="font-weight: bold; color: white; background-color: #0096ff; font-size: 1.15em; padding-top: 5px; padding-bottom: 5px">' +
          content +
          "</span>";
        focusNote.removeCommentByIndex(index);
        focusNote.appendMarkdownComment(markdownContent, index);
      }
    });
  };
}

/**
* Extend the toolbarConfig init method
Called after toolbarConfig.init().
 */
function extendToolbarConfigInit() {
  // Save the original init method
  const originalInit = toolbarConfig.init;

  // Override the init method
  toolbarConfig.init = function (mainPath) {
    // Call the original init method
    originalInit.call(this, mainPath);

    // Add extended initialization logic
    // Data used to store references
    toolbarConfig.referenceIds = toolbarConfig.getByDefault("MNToolbar_referenceIds", {});
  };

  // ===== AI calls related functions =====

  /**
   * AI translation function
   * @param {string} text - The text to be translated
   * @param {string} targetLang - Target language (default is Chinese)
   * @param {string} model - AI model
   * @returns {Promise<string>} Translated text
   */
  toolbarUtils.aiTranslate = async function (text, targetLang = "default", model = "gpt-4o-mini") {
    try {
      // Check if MNUtils is activated
      if (typeof subscriptionConfig === "undefined") {
        MNUtil.showHUD("❌ Please install and activate MN Utils first");
        return null;
      }

      if (!subscriptionConfig.getConfig("activated")) {
        MNUtil.showHUD("❌ Please configure the API Key in MN Utils");
        return null;
      }

      // Automatically select the appropriate prompt word type based on the text content
      let promptType = "basic";
      if (toolbarUtils.translationConfig.isMathematicalText(text)) {
        promptType = "math"; // Math content detected, use a math-specific prompt word.
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`🔧 [Translation] Mathematical content detected, using mathematical translation mode`);
        }
      }

      // Build prompt words
      const systemPrompt = toolbarUtils.translationConfig.getPrompt(promptType, targetLang);

      // Build message
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ];

      // Parse the model name and remove the prefix (e.g., "Subscription: gpt-4o" -> "gpt-4o")
      let actualModel = model;
      if (model.includes(":")) {
        const parts = model.split(":").map((s) => s.trim());
        if (parts.length === 2) {
          actualModel = parts[1]; // Extract the actual model name
        }
      }

      // Using Subscription Configuration
      const config = {
        apiKey: subscriptionConfig.config.apikey,
        apiHost: subscriptionConfig.config.url,
        model: actualModel, // Use the parsed model name
        temperature: 0.3,
        stream: false,
      };

      // Send request
      const result = await this.sendAIRequest(messages, config);

      if (result) {
        return result.trim();
      } else {
        MNUtil.showHUD("❌ Translation failed");
        return null;
      }
    } catch (error) {
      toolbarUtils.addErrorLog(error, "aiTranslate");
      MNUtil.showHUD("❌ Translation error: " + error.message);
      return null;
    }
  };

  /**
   * General AI requests (supports custom system and user messages)
   * @param {string} userContent - User input content
   * @param {string} systemPrompt - System prompt (optional)
   * @param {string} model - AI model
   * @returns {Promise<string>} AI response content
   */
  toolbarUtils.aiGeneralRequest = async function (userContent, systemPrompt = "", model = "gpt-4o-mini") {
    try {
      // Check if MNUtils is activated
      if (typeof subscriptionConfig === "undefined") {
        MNUtil.showHUD("❌ Please install and activate MN Utils first");
        return null;
      }

      if (!subscriptionConfig.getConfig("activated")) {
        MNUtil.showHUD("❌ Please configure the API Key in MN Utils");
        return null;
      }

      // Build message array
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: userContent });

      // Parse the model name and remove the prefix (e.g., "Subscription: gpt-4o" -> "gpt-4o")
      let actualModel = model;
      if (model.includes(":")) {
        const parts = model.split(":").map((s) => s.trim());
        if (parts.length === 2) {
          actualModel = parts[1]; // Extract the actual model name
          if (typeof MNUtil !== "undefined" && MNUtil.log) {
            MNUtil.log(`🔧 [AI General Request] Parsing Model: ${model} -> ${actualModel}`);
          }
        }
      }

      // Using Subscription Configuration
      const config = {
        apiKey: subscriptionConfig.config.apikey,
        apiHost: subscriptionConfig.config.url,
        model: actualModel, // Use the parsed model name
        temperature: 0.7, // Generally, a slightly higher temperature is required.
        stream: false,
      };

      // Send request
      const result = await this.sendAIRequest(messages, config);

      if (result) {
        return result.trim();
      } else {
        MNUtil.showHUD("❌ AI request failed");
        return null;
      }
    } catch (error) {
      toolbarUtils.addErrorLog(error, "aiGeneralRequest");
      MNUtil.showHUD("❌ AI request error: " + error.message);
      return null;
    }
  };

  /**
Sending AI requests (general method)
* @param {Array} messages - Array of messages
* @param {Object} config - Configuration object
* @returns {Promise<string>} AI response content
   */
  toolbarUtils.sendAIRequest = async function (messages, config) {
    try {
      // Check if MNConnection is available
      if (typeof MNConnection === "undefined") {
        throw new Error("MNConnection is unavailable. Please ensure that MN Utils is installed");
      }

      // Build the complete URL
      let apiUrl = config.apiHost;
      // If apiHost already contains a full path, use it directly.
      if (!apiUrl.includes("/v1/chat/completions")) {
        if (!apiUrl.endsWith("/")) {
          apiUrl += "/";
        }
        apiUrl += "v1/chat/completions";
      }

      const body = {
        model: config.model,
        messages: messages,
        temperature: config.temperature,
        stream: config.stream,
      };

      // Use MNConnection to create and send requests
      const request = MNConnection.initRequest(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + config.apiKey,
        },
        timeout: 30,
        json: body,
      });

      // Send request
      const response = await MNConnection.sendRequest(request);

      if (response && response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
      }

      return null;
    } catch (error) {
      toolbarUtils.addErrorLog(error, "sendAIRequest");
      throw error;
    }
  };

  /**
   * AI translation after OCR
   * @param {string} ocrText - The text recognized by OCR
   * @param {string} model - AI model
   * @returns {Promise<string>} Translated text
   */
  toolbarUtils.ocrWithTranslation = async function (ocrText, model = "gpt-4o-mini") {
    try {
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`🔧 [OCR Translation] Starting processing, text length: ${ocrText.length}`);
      }

      // First display the OCR results
      // MNUtil.showHUD("📝 OCR complete, translating...");

      let translatedText = null;

      // Try using the built-in translation API first
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`🔧 [OCR translation] Attempting to use the translation API`);
      }
      `translatedText = await this.aiTranslate(ocrText, "中文", model);`;

      // If the built-in API fails, try using the MN Utils API (if configured).
      if (
        !translatedText &&
        typeof subscriptionConfig !== "undefined" &&
        subscriptionConfig.getConfig("activated")
      ) {
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`🔧 [OCR translation] API failed, trying to use built-in API`);
        }
        `translatedText = await this.aiTranslateBuiltin(ocrText, "中文", model);`;
      }

      if (translatedText) {
        MNUtil.showHUD("✅ Translation complete");
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`✅ [OCR Translation] Translation Successful`);
        }
        return translatedText;
      } else {
        // If translation fails, return the original OCR text.
        MNUtil.showHUD("⚠️ Translation failed, using raw text");
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`❌ [OCR translation] Translation failed, return to original text`);
        }
        return ocrText;
      }
    } catch (error) {
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`❌ [OCR translation] Exception: ${error.message}`);
      }
      toolbarUtils.addErrorLog(error, "ocrWithTranslation");
      // Return to original text if translation fails
      return ocrText;
    }
  };

  toolbarUtils.ocrWithAI = async function (ocrText, model = "gpt-4o-mini", systemPrompt = "") {
    try {
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`🔧 [AI Processing] Start processing, text length: ${ocrText.length}`);
        MNUtil.log(`🔧 [AI Processing] Using Model: ${model}`);
      }

      // Handling backward compatibility: If ocrText contains the full prompt word (without systemPrompt), then use an empty systemPrompt.
      // This ensures compatibility with existing calling methods
      const userContent = ocrText;
      const sysPrompt = systemPrompt || "";

      let aiResultText = null;

      // Intelligent selection of API calling method
      if (
        model.startsWith("Subscription:") ||
        model.startsWith("ChatGPT:") ||
        model.startsWith("ChatGLM:") ||
        model.startsWith("Deepseek:") ||
        model.startsWith("Claude:") ||
        model.startsWith("Gemini:")
      ) {
        // Subscribe to the model and use the MN Utils API directly.
        if (typeof subscriptionConfig === "undefined") {
          MNUtil.showHUD("❌ Please install and activate MN Utils first");
          return ocrText;
        }

        if (!subscriptionConfig.getConfig("activated")) {
          MNUtil.showHUD("❌ Please configure the API Key in MN Utils");
          return ocrText;
        }

        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`🔧 [AI Processing] Processing the model using the subscription API: ${model}`);
        }
        aiResultText = await this.aiGeneralRequest(ocrText, systemPrompt, model);
      } else if (model === "Built-in" || model.startsWith("glm-")) {
        // Built-in model, using built-in API
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`🔧 [AI Processing] Processing the model using the built-in AI API: ${model}`);
        }
        aiResultText = await this.aiGeneralRequestBuiltin(ocrText, systemPrompt, model);
      } else {
        // For unknown models, first try the built-in API; if that fails, try subscribing to the API.
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`🔧 [AI Processing] Unknown model ${model}, try built-in API first`);
        }
        aiResultText = await this.aiGeneralRequestBuiltin(ocrText, systemPrompt, model);

        // If the built-in API fails, try using the MN Utils API.
        if (
          !aiResultText &&
          typeof subscriptionConfig !== "undefined" &&
          subscriptionConfig.getConfig("activated")
        ) {
          if (typeof MNUtil !== "undefined" && MNUtil.log) {
            MNUtil.log(`🔧 [AI processing] Built-in API failed, trying to use subscription API`);
          }
          aiResultText = await this.aiGeneralRequest(ocrText, systemPrompt, model);
        }
      }

      if (aiResultText) {
        MNUtil.showHUD("✅ AI processing complete");
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`✅ [AI processing] Processing successful`);
        }
        return aiResultText;
      } else {
        // If processing fails, return the original OCR text.
        MNUtil.showHUD("⚠️ AI processing failed, using raw text");
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`❌ [AI processing] Processing failed, returning the original text`);
        }
        return ocrText;
      }
    } catch (error) {
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`❌ [AI Processing] Exception: ${error.message}`);
      }
      toolbarUtils.addErrorLog(error, "ocrWithAI");
      // Return the original text if processing fails
      return ocrText;
    }
  };

  toolbarUtils.AIWithPromptAndModel = async function (prompt, model = "gpt-4o-mini") {
    try {
      // Check if MNUtils is activated
      if (typeof subscriptionConfig === "undefined") {
        MNUtil.showHUD("❌ Please install and activate MN Utils first");
        return null;
      }

      if (!subscriptionConfig.getConfig("activated")) {
        MNUtil.showHUD("❌ Please configure the API Key in MN Utils");
        return null;
      }

      // Build message
      const messages = [
        { role: "system", content: prompt },
        { role: "user", content: "" },
      ];

      // Parse the model name and remove the prefix (e.g., "Subscription: gpt-4o" -> "gpt-4o")
      let actualModel = model;
      if (model.includes(":")) {
        const parts = model.split(":").map((s) => s.trim());
        if (parts.length === 2) {
          actualModel = parts[1]; // Extract the actual model name
        }
      }

      // Using Subscription Configuration
      const config = {
        apiKey: subscriptionConfig.config.apikey,
        apiHost: subscriptionConfig.config.url,
        model: actualModel, // Use the parsed model name
        temperature: 0.3,
        stream: false,
      };

      // Send request
      const result = await this.sendAIRequest(messages, config);

      if (result) {
        return result.trim();
      } else {
        MNUtil.showHUD("❌ AI request failed");
        return null;
      }
    } catch (error) {
      toolbarUtils.addErrorLog(error, "AIWithPromptAndModel");
      MNUtil.showHUD("❌ AI request error: " + error.message);
      return null;
    }
  };

  /**
   * Translation Configuration
   * Includes system prompts and other configurable parameters
   */
  toolbarUtils.translationConfig = {
    // Basic translation prompts
    basicPrompt:
      "Translate the following text to {targetLang}. Only provide the translation without any explanation or additional text.",

    // Academic translation prompts (for translating card content)
    academicPrompt:
      "You are a professional academic translator specializing in mathematics. Translate the following academic text to {targetLang}. Important guidelines:\n1. Maintain mathematical terminology accuracy (theorem, lemma, corollary, proposition, etc.)\n2. Preserve mathematical symbols and formulas in their original format\n3. Use standard mathematical translations for terms like:\n   - Theorem → 定理\n   - Lemma → 引理\n   - Corollary → 推论\n   - Proposition → 命题\n   - Proof → 证明\n   - Definition → 定义\n   - Example → 例子/例\n   - Remark → 注记/注\n4. For specialized areas (topology, functional analysis, measure theory, etc.), use accepted Chinese mathematical terminology\n5. Keep mathematical expressions, variables, and notation unchanged\n6. Maintain consistency in terminology throughout the translation\nOnly provide the translation without any explanation.",

    // Math-specific translation prompts
    mathPrompt:
      "You are an expert mathematical translator with deep knowledge in pure mathematics. Translate the following mathematical text to {targetLang}. Critical requirements:\n1. Mathematical accuracy is paramount - use standard mathematical terminology in {targetLang}\n2. Common mathematical terms mapping:\n   - continuous → 连续\n   - differentiable → 可微\n   - integrable → 可积\n   - bounded → 有界\n   - compact → 紧致/紧\n   - convergent → 收敛\n   - Banach space → Banach空间\n   - Hilbert space → Hilbert空间\n   - measure → 测度\n   - topology → 拓扑\n3. Preserve all mathematical notation, formulas, and LaTeX expressions exactly\n4. For named theorems/concepts, include original name in parentheses if commonly used (e.g., 'Hahn-Banach定理 (Hahn-Banach theorem)')\n5. Maintain logical flow and mathematical rigor\n6. Use formal mathematical Chinese style\nProvide only the translation, no explanations.",

    // Methods for obtaining translation prompts
    getPrompt: function (type = "math", targetLang = "中文") {
      const prompts = {
        basic: this.basicPrompt,
        academic: this.academicPrompt,
        math: this.mathPrompt,
      };

      const prompt = prompts[type] || prompts["basic"];
      return prompt.replace(/{targetLang}/g, targetLang);
    },

    // Check if it is mathematical text
    isMathematicalText: function (text) {
      // Check common mathematical terms and symbols
      const mathIndicators = [
        /theorem/i,
        /lemma/i,
        /corollary/i,
        /proposition/i,
        /proof/i,
        /continuous/i,
        /differentiable/i,
        /integrable/i,
        /convergent/i,
        /\$.*\$/,
        /\\[a-zA-Z]+/,
        /∫/,
        /∑/,
        /∏/,
        /∂/,
        /∇/,
        /H[¹²³⁴⁵⁶⁷⁸⁹⁰ᵖ]/,
        /L[¹²³⁴⁵⁶⁷⁸⁹⁰ᵖ]/,
        /𝔻/,
        /𝕋/,
      ];

      return mathIndicators.some((indicator) => {
        if (indicator instanceof RegExp) {
          return indicator.test(text);
        }
        return text.includes(indicator);
      });
    },
  };

  /**
   * Built-in translation API (does not depend on MN Utils configuration)
   * @param {string} text - The text to be translated
   * @param {string} targetLang - Target language
   * @param {string} model - AI model (uses Zhipu AI by default)
   * @returns {Promise<string|null>} Translated text
   */
  toolbarUtils.aiTranslateBuiltin = async function (
    text,
    targetLang = "中文",
    model = "glm-4-flashx-250414"
  ) {
    try {
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`🔧 [Translation] Start built-in translation: ${text.substring(0, 50)}...`);
        MNUtil.log(`🔧 [Translation] Target Language: ${targetLang}, Model: ${model}`);
      }

      // Check if MNConnection is available
      if (typeof MNConnection === "undefined") {
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`❌ [Translation] MNConnection unavailable`);
        }
        throw new Error("MNConnection is unavailable. Please ensure that MN Utils is installed");
      }

      // Using Zhipu AI's built-in API Key
      const apiKey = "449628b94fcac030495890ee542284b8.F23PvJW4XXLJ4Lsu";
      const apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

      // Model Mapping: Maps other model names to Zhipu AI's models
      const modelMap = {
        "gpt-4o-mini": "glm-4-flashx-250414",
        "gpt-4o": "glm-4-flashx-250414",
        "gpt-4.1": "glm-4-flashx-250414",
        "claude-3-5-sonnet": "glm-4-flashx-250414",
        "claude-3-7-sonnet": "glm-4-flashx-250414",
      };

      // Use the mapped model name; if no mapping exists, use the original name.
      const actualModel = modelMap[model] || model;

      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`🔧 [Translation] Actual Model Used: ${actualModel}`);
      }

      // Automatically select the appropriate prompt word type based on the text content
      let promptType = "basic";
      if (toolbarUtils.translationConfig.isMathematicalText(text)) {
        promptType = "math"; // Math content detected, use a math-specific prompt word.
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`🔧 [Translation] Mathematical content detected, using mathematical translation mode`);
        }
      }

      const systemPrompt = toolbarUtils.translationConfig.getPrompt(promptType, targetLang);

      // Build the request body
      const body = {
        model: actualModel,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: text.trim(),
          },
        ],
        temperature: 0.1,
      };

      // Use MNConnection to create and send requests
      const request = MNConnection.initRequest(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        },
        timeout: 30,
        json: body,
      });

      // Send request
      const response = await MNConnection.sendRequest(request);

      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`🔧 [Translation] API response: ${JSON.stringify(response).substring(0, 200)}...`);
      }

      // Check response status
      if (response && response.statusCode >= 400) {
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`❌ [Translation] API Error: Status Code ${response.statusCode}`);
          if (response.data && response.data.error) {
            MNUtil.log(`❌ [Translation] Error Details: ${JSON.stringify(response.data.error)}`);
          }
        }
        return null;
      }

      // Successful response processing
      if (response && response.choices && response.choices.length > 0) {
        const translatedText = response.choices[0].message.content;
        if (translatedText) {
          if (typeof MNUtil !== "undefined" && MNUtil.log) {
            MNUtil.log(`✅ [Translation] Translation successful: ${translatedText.substring(0, 100)}...`);
          }
          return translatedText.trim();
        }
      }

      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`❌ [Translation] No valid response or incorrect response format`);
      }
      return null;
    } catch (error) {
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`❌ [Translation] Error: ${error.message}`);
      }
      toolbarUtils.addErrorLog(error, "aiTranslateBuiltin");
      return null;
    }
  };

  /**
   * General AI Requests - Built-in API Version (using Zhipu AI)
   * @param {string} userContent - User input content
   * @param {string} systemPrompt - System prompt (optional)
   * @param {string} model - AI model
   * @returns {Promise<string>} AI response content
   */
  toolbarUtils.aiGeneralRequestBuiltin = async function (
    userContent,
    systemPrompt = "",
    model = "glm-4-flashx-250414"
  ) {
    try {
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`🔧 [AI Built-in] Start Processing: ${userContent.substring(0, 50)}...`);
        MNUtil.log(`🔧 [AI Built-in] Original Model: ${model}`);
      }

      // Check if MNConnection is available
      if (typeof MNConnection === "undefined") {
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`❌ [AI Built-in] MNConnection Unavailable`);
        }
        throw new Error("MNConnection is unavailable. Please ensure that MN Utils is installed");
      }

      // Using Zhipu AI's built-in API Key
      const apiKey = "449628b94fcac030495890ee542284b8.F23PvJW4XXLJ4Lsu";
      const apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

      // Model Mapping: Maps other model names to Zhipu AI's models
      const modelMap = {
        "gpt-4o-mini": "glm-4-flashx-250414",
        "gpt-4o": "glm-4-flashx-250414",
        "gpt-4.1": "glm-4-flashx-250414",
        "claude-3-5-sonnet": "glm-4-flashx-250414",
        "claude-3-7-sonnet": "glm-4-flashx-250414",
        "Built-in": "glm-4-flashx-250414",
      };

      // Use the mapped model name; if no mapping exists, use the original name.
      const actualModel = modelMap[model] || model;

      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`🔧 [AI Built-in] Actual Model Used: ${actualModel}`);
      }

      // Build message array
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: userContent.trim() });

      // Build the request body
      const body = {
        model: actualModel,
        messages: messages,
        temperature: 0.7, // Generally, a slightly higher temperature is required.
      };

      // Use MNConnection to create and send requests
      const request = MNConnection.initRequest(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        },
        timeout: 30,
        json: body,
      });

      // Send request
      const response = await MNConnection.sendRequest(request);

      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`🔧 [AI Built-in] API Response: ${JSON.stringify(response).substring(0, 200)}...`);
      }

      // Check response status
      if (response && response.statusCode >= 400) {
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`❌ [AI Built-in] API Error: Status Code ${response.statusCode}`);
          if (response.data && response.data.error) {
            MNUtil.log(`❌ [AI Built-in] Error Details: ${JSON.stringify(response.data.error)}`);
          }
        }
        return null;
      }

      // Successful response processing
      if (response && response.choices && response.choices.length > 0) {
        const resultText = response.choices[0].message.content;
        if (resultText) {
          if (typeof MNUtil !== "undefined" && MNUtil.log) {
            MNUtil.log(`✅ [AI Built-in] Processing Successful: ${resultText.substring(0, 100)}...`);
          }
          return resultText.trim();
        }
      }

      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`❌ [AI Built-in] No valid response or incorrect response format`);
      }
      return null;
    } catch (error) {
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`❌ [AI Built-in] Error: ${error.message}`);
      }
      toolbarUtils.addErrorLog(error, "aiGeneralRequestBuiltin");
      return null;
    }
  };

  /**
Batch translation of card content
* @param {string} text - The text to be translated
* @param {string} type - Translation type ('basic' or 'academic')
* @param {string} targetLang - Target language
* @param {string} model - AI model
* @returns {Promise<string|null>} Translated text
   */
  toolbarUtils.translateNoteContent = async function (
    text,
    type = "academic",
    targetLang = "中文",
    model = null
  ) {
    try {
      if (!text || !text.trim()) {
        return text;
      }

      // Use the configured default model or the passed-in model
      const actualModel =
        model || toolbarConfig.translateModel || toolbarConfig.defaultTranslateModel || "gpt-4o-mini";

      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(
          `🔧 [Batch Translation] Start Translation, Type: ${type}, Target Language: ${targetLang}, Model: ${actualModel}`
        );
      }

      // Function to save original prompt words
      const originalGetPrompt = toolbarUtils.translationConfig.getPrompt;

      // Temporarily replace with a specified type of prompt word
      toolbarUtils.translationConfig.getPrompt = function (promptType, lang) {
        return originalGetPrompt.call(this, type, lang);
      };

      try {
        // Call the built-in translation API
        const result = await toolbarUtils.aiTranslateBuiltin(text, targetLang, actualModel);
        return result;
      } finally {
        // Function to restore original prompt word retrieval
        toolbarUtils.translationConfig.getPrompt = originalGetPrompt;
      }
    } catch (error) {
      if (typeof MNUtil !== "undefined" && MNUtil.log) {
        MNUtil.log(`❌ [Batch Translation] Translation failed: ${error.message}`);
      }
      throw error;
    }
  };

  /**
Get a list of available AI models
* @returns {Array<string>} list of models
   */
  toolbarUtils.getAvailableAIModels = function () {
    // These are the models supported by Subscription
    return [
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
    ];
  };

  // ===== Code learning related functions =====
  // Xia Dayuyang

  /**
   * Code learning module
   * Used for formatting titles in code learning cards
   */
  /**
   * Get the hierarchical path of the code card
   * @param {MNNote} note - Current card (Level D)
   * @returns {Object} 返回 {success: boolean, data?: {plugin, file, class, path}, error?: string}
   */
  (toolbarUtils.getCodeCardPath = function (note) {
    try {
      if (!note || !note.parentNote) {
        return {
          success: false,
          error: "Please select a knowledge point card that has a parent card",
        };
      }

      // Level C: Card-like
      const classNote = note.parentNote;
      if (!classNote.noteTitle || !classNote.noteTitle.includes("类")) {
        return {
          success: false,
          error: "Parent card is not a card class",
        };
      }
      const className = classNote.noteTitle.trim();

      // Level B: File Card (Optional)
      if (!classNote.parentNote) {
        // Case where there is only a class, but no file path
        return {
          success: true,
          data: {
            plugin: null,
            file: null,
            class: className,
            path: className, // The path is the class name
          },
        };
      }

      const fileNote = classNote.parentNote;
      if (!fileNote.noteTitle || !fileNote.noteTitle.match(/\.(js|ts|jsx|tsx)$/)) {
        // If the parent card exists but is not a file card, it will also return only the class.
        return {
          success: true,
          data: {
            plugin: null,
            file: null,
            class: className,
            path: className,
          },
        };
      }
      const fileName = fileNote.noteTitle.trim();

      // Level A: Plugin root card (optional)
      if (!fileNote.parentNote) {
        // There are files but no plugin root card
        return {
          success: true,
          data: {
            plugin: null,
            file: fileName,
            class: className,
            path: `${fileName}/${className}`,
          },
        };
      }

      const pluginNote = fileNote.parentNote;
      // Extract plugin names and remove possible emojis
      const pluginTitle = pluginNote.noteTitle.trim();
      const pluginName = pluginTitle.replace(/^[🧩📦🔧🛠️]*\s*/, "");

      return {
        success: true,
        data: {
          plugin: pluginName,
          file: fileName,
          class: className,
          path: `${pluginName}/${fileName}/${className}`,
        },
      };
    } catch (error) {
      toolbarUtils.addErrorLog(error, "getCodeCardPath");
      return {
        success: false,
        Error: "Error retrieving path: " + error.message,
      };
    }
  }),
    /**
     * Generate calling convention based on type
     * @param {string} methodName - Method Name
     * @param {string} type - type
     * @param {string} className - Class name (excluding the word "class")
     * @param {boolean} hasFilePath - Whether a file path exists (default is true)
     * @returns {string[]} call method array
     */
    (toolbarUtils.generateCallMethods = function (methodName, type, className, hasFilePath = true) {
      // Extract the pure class name from the class name (remove the word "class" and spaces)
      const pureClassName = className.replace(/\s*类\s*$/, "").trim();

      // Check if the class name contains "Class"
      const hasClassInName = className.includes("Class") || pureClassName.includes("Class");

      switch (type) {
        case "lifecycle": // Lifecycle
          const lifecycleMethods = [`${methodName}`, `${pureClassName}.${methodName}`];

          // Only add this version if a file path is provided.
          if (hasFilePath) {
            lifecycleMethods.push(`this.${methodName}`);
          }

          return lifecycleMethods;

        case "staticProperty": // Static variable of the class
        case "staticMethod": // Static method of the class
          const methods = [`${pureClassName}.${methodName}`];

          // Only add this version if a file path is provided.
          if (hasFilePath) {
            methods.push(`this.${methodName}`);
          }

          // If the class name contains "Class", add the self version.
          if (hasClassInName) {
            methods.push(`self.${methodName}`);
          }

          return methods;

        case "staticGetter": // Static Getter of the class
          const staticGetterMethods = [`${pureClassName}.${methodName}`];

          // Only add this version if a file path is provided.
          if (hasFilePath) {
            staticGetterMethods.push(`this.${methodName}`);
          }

          // If the class name contains "Class", add the self version.
          if (hasClassInName) {
            staticGetterMethods.push(`self.${methodName}`);
          }

          return staticGetterMethods;

        case "staticSetter": // Static Setter of the class
          const staticSetterMethods = [`${pureClassName}.${methodName}`];

          // Only add this version if a file path is provided.
          if (hasFilePath) {
            staticSetterMethods.push(`this.${methodName}`);
          }

          // If the class name contains "Class", add the self version.
          if (hasClassInName) {
            staticSetterMethods.push(`self.${methodName}`);
          }

          return staticSetterMethods;

        case "instanceMethod": // instance method
          return [`${methodName}`];

        case "getter": // Instance Getter method
          return [`${methodName}`, `this.${methodName}`];

        case "setter": // Instance Setter method
          return [`${methodName}`, `this.${methodName}`];

        case "prototype": // Prototype chain method
          const prototypeMethods = [`${methodName}`, `${pureClassName}.${methodName}`];

          // If a file path is provided, add this version.
          if (hasFilePath) {
            prototypeMethods.push(`this.${methodName}`);
          }

          // If the class name contains "Class", add the self version.
          if (hasClassInName) {
            prototypeMethods.push(`self.${methodName}`);
          }

          return prototypeMethods;

        case "instanceProperty": // instance property
          return [`${methodName}`, `this.${methodName}`];

        default:
          return [methodName];
      }
    }),
    /**
     * Processing code learning cards
     * @param {MNNote} note - The card to be processed
     * @param {string} type - Selected type (Chinese)
     * @returns {Object} 返回 {success: boolean, error?: string}
     */
    (toolbarUtils.processCodeLearningCard = function (note, type) {
      try {
        // Get path information
        const pathResult = this.getCodeCardPath(note);
        if (!pathResult.success) {
          return {
            success: false,
            Error: pathResult.error || "Unable to retrieve card path information",
          };
        }
        const pathInfo = pathResult.data;

        // Get the original method name
        const originalTitle = note.noteTitle.trim();
        const methodName = originalTitle;

        // Generate prefix based on type
        const typePrefix = {
          lifecycle: "Plugin: Lifecycle",
          staticProperty: "Class: Static Property",
          staticMethod: "Class: Static Method",
          staticGetter: "Class: Static Getter",
          staticSetter: "Class: Static Setter",
          instanceMethod: "Instance Method",
          getter: "Example: Getter method",
          setter: "Example: Setter method",
          prototype: "Class: Prototype chain methods",
          instanceProperty: "Instance: Property",
        }[type];

        // Check if a file path exists
        const hasFilePath = pathInfo.file !== null;

        // Generate calling method
        const callMethods = this.generateCallMethods(methodName, type, pathInfo.class, hasFilePath);

        // Assemble new title
        const newTitle = `【${typePrefix} >> ${pathInfo.path}】; ${callMethods.join("; ")}`;

        // Update title
        note.noteTitle = newTitle;

        return {
          success: true,
        };
      } catch (error) {
        toolbarUtils.addErrorLog(error, "processCodeLearningCard");
        return {
          success: false,
          error: error.message || "Processing failed",
        };
      }
    });
}

// Export initialization function
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initXDYYExtensions,
    extendToolbarConfigInit,
  };
}

// Immediate initialization
try {
  if (typeof toolbarUtils !== "undefined") {
    initXDYYExtensions();
  }

  if (typeof toolbarConfig !== "undefined") {
    extendToolbarConfigInit();
  }
} catch (error) {
  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log("❌ Failed to load extension: " + error);
  }
}

/**
 * Xia Dayuyang - MNUtil method overriding
 * Fixed the issue of the searchNotes feature automatically copying card IDs.
 */
if (typeof MNUtil !== "undefined" && MNUtil.getNoteById) {
  // Save a reference to the original method
  const originalGetNoteById = MNUtil.getNoteById.bind(MNUtil);

  // Override the MNUtil.getNoteById method
  MNUtil.getNoteById = function (noteid, alert = false) {
    let note = this.db.getNoteById(noteid);
    if (note) {
      return note;
    } else {
      // if (alert) {
      // Do not copy noteId, only display the prompt
      //   this.showHUD("Note not exist: " + noteid);
      // }
      return undefined;
    }
  };

  if (typeof MNUtil !== "undefined" && MNUtil.log) {
    MNUtil.log(
      "🔧 The MNUtil.getNoteById method has been overridden to fix the issue of automatically copying IDs"
    );
  }
}


class chatAITool{
  /** @type {String} **/
  name
  /** @type {Array} **/
  args
  /** @type {Array} **/
  tem = []
  /** @type {String} **/
  description
  /** @type {String} **/
  preContent = ""
  /** @type {String} **/
  preHtml = ""
  /** @type {String} **/
  preCSS = ""
  /** @type {Boolean} **/
  needNote
  /** @type {UIView } **/
  executeView = undefined
  /** @type {Object} **/
  static toolbarActionConfigs = {}
  /**
   * 
   * @param {String} name 
   * @param {Array} args 
   * @param {String} description 
   * @param {Boolean} needNote 
   */
  static new(name,config){
    // return new chatAITool(name,args,description,needNote)
    return new chatAITool(name,config)
  }
  static toolCache = {}
  static showHUD(text,duration = 2){
    if (this.executeView) {
      MNUtil.showHUD(text,duration,this.executeView)
    }else{
      MNUtil.showHUD(text,duration)
    }
  }
  static waitHUD(text){
    if (this.executeView && !this.executeView.hidden) {
      MNUtil.waitHUD(text,this.executeView)
    }else{
      MNUtil.waitHUD(text)
    }
  }
  constructor(name,config){
    try {

    this.config = config
    this.name = name;
    this.args = config.args;
    this.description = config.description;
    this.needNote = config.needNote ?? false
    this.toolTitle = config.toolTitle ?? ""
      
    } catch (error) {
      chatAIUtils.addErrorLog(error, "chatAITool constructor",{name:name,config:config})
    }
  }
  /**
   * 
   * @param {object|string} content 
   * @param {string} funcId 
   * @returns {{role:"tool",content:string,tool_call_id:string}}
   */
  static genToolMessage(content,funcId){
    if (typeof content === 'object') {
      if (content.success) {
        let text = "Successfully executed this tool call."
        if (content.response) {
          text += "\n\n#####Tool Response#####\n"+content.response
        }
        return {"role":"tool","content":text,"tool_call_id":funcId}
      }else{
        let text = "Failed to execute this tool call."
        if (content.response) {
          text += "\n\n#####Tool Response#####\n"+content.response
        }
        return {"role":"tool","content":text,"tool_call_id":funcId}
      }
    }else{
      return {"role":"tool","content":content,"tool_call_id":funcId}
    }
  }

  getArgs(){
    //toolbar的动作配置需要动态更新，所以需要单独处理
    if (this.name === "executeAction") {
      let args = this.args
      let actionConfigs = {}
      if (typeof toolbarUtils === "undefined") {
        args.action.description = "All actions are disabled due to the missing of addon [MN Toolbar]. Please tell user to install MN Toolbar First!"
        return args
      }
      let actionKeys = toolbarConfig.getDefaultActionKeys()
      let actionEnums = []
      actionKeys.map(key=>{//key就是actionId
        let hideForAI = false
        let config = toolbarConfig.getAction(key)
        let configToReturn = {
          name:config.name,//动作名，不参与实际运行,
          actionId:key//动作ID，不参与实际运行,用于指定动作
        }
        if ("description" in config && MNUtil.isValidJSON(config.description)) {
          //config.description才是每个动作的具体配置
          let des = JSON.parse(config.description)
          if ("description" in des) {//des.description则是对动作的描述，不参与实际运行
            //把des.description提升层级（和name同层级），不放在具体的配置中，而是用于描述动作
            configToReturn.description = des.description
            delete des.description
          }
          if ("onLongPress" in des) {//不需要这个参数
            delete des.onLongPress
          }
          configToReturn.config = des
          if ("hideForAI" in des) {
            hideForAI = des.hideForAI
          }
        }
        if (!hideForAI) {//只有在hideForAI为false时，才将动作加入到actionEnums和actionConfigs中
          actionEnums.push(key)
          actionConfigs[key] = configToReturn
        }
        //configToReturn包括name,description,config三个部分，其中config是动作的具体配置
      })
      chatAITool.toolbarActionConfigs = actionConfigs
      args.action.enum = actionEnums
      args.action.description = `Use the actionId to specify the action to execute. Configuration for actions:
${JSON.stringify(actionConfigs,undefined,2)}`
      // chatAIUtils.log("getArgs",{args:args})
      return args
    }
    if (this.name === "executePrompt") {
      let args = this.args
      let promptKeys = chatAIConfig.getConfig("promptNames")
      let promptConfigs = promptKeys.map(key=>{
        return {
          promptId:key,
          name:chatAIConfig.prompts[key].title
        }
      })
      args.prompt.enum = promptKeys
      args.prompt.description = `Use the promptId to specify the prompt to execute. Configuration for prompts:
${JSON.stringify(promptConfigs,undefined,2)}`
      return args
    }
    return this.args
  }
  body() {
    let parameters = {
      "type": "object",
      "properties": this.getArgs(),
    }
    if ("required" in this.config) {
      parameters.required = this.config.required
    }else{
      parameters.required = Object.keys(this.args)
    }
    let funcStructure = {
      "name":this.name,
      "description":this.description
    }
    funcStructure.parameters = parameters
    return {"type":"function","function":funcStructure}
  }
  checkArgs(args,funcId){
    let res = {onError:false}
    let args2check = []
    if ("required" in this.config) {
      args2check = this.config.required
    }else{
      args2check = Object.keys(this.args??{})
    }
    if (args2check.length) {//如果有必选参数
      if (!args) {
        res.onError = true
        res.errorMessage = this.genErrorInMissingArguments(args2check[0],funcId)
        chatAIUtils.log("Missing arguments"+args2check[0],args,"error")
        return res
      }
      for (let arg of args2check) {//必选的参数
        if (!(arg in args)) {//如果必选参数不在AI实际提供的参数中,则报错
          res.onError = true
          res.errorMessage = this.genErrorInMissingArguments(arg,funcId)
          chatAIUtils.log("Missing arguments"+arg,args,"error")
          return res
        }
        // chatAIUtils.addErrorLog(JSON.stringify(args), funcId, "Missing arguments: "+arg)
        if (typeof args[arg] === 'string' && !(args[arg].trim())) {
          res.onError = true
          res.errorMessage = this.genErrorInEmptyArguments(arg,funcId)
          chatAIUtils.log("Empty arguments"+arg,args,"error")
          return res
        }
      }
    }else{
      return res
    }
    return res
  }
  clearPreContent(){
    this.preHtml = ""
    this.preCSS = ""
    this.preContent = ""
  }
  /**
   * 
   * @param {object} func 
   * @param {string|undefined} noteId 
   * @returns {Promise<{toolMessages:object,description:string}>}
   */
  async execute(func,noteId = undefined,onChat = false){
  try {
  /**
   * @type {MNNote} 
   */
  let note
  /**
   * @type {Array<MNNote>} 
   */
  let notes = []
  /**
   * @type {MNNote} 
   */
  let parentNote
  /**
   * @type {Array<MNNote>} 
   */
  let fromNotes = []
  /**
   * @type {MNNote} 
   */
  let toNote
  /**
   * @type {MNNote} 
   */
  let fromNote
  let tags = []
  let funcName = this.name
  let args = chatAIUtils.getValidJSON(func.function.arguments)
  chatAIUtils.log("execute: "+func.function.name,args)
  // MNUtil.copy(args)
      // MNUtil.log({message:"createMindmap",detail:func.function.arguments})
      // MNUtil.log({message:"createMindmap",detail:args})

  // MNUtil.copy(func.function.arguments)
  note = MNUtil.noteExists(noteId) ? MNNote.new(noteId) : chatAIUtils.getFocusNote(this.needNote)
  if (this.needNote && !note) { return this.genErrorInNoNote(func.id)}
  let checkRes = this.checkArgs(args,func.id)
  if (checkRes.onError) { return checkRes.errorMessage}
  // if (note) {
  //   MNUtil.log("currentNoteBookId:"+MNUtil.currentNotebookId)
  //   MNUtil.log("noteNoteBookId:"+note.notebookId)
  // }
  if (this.needNote || note) {
    note = note.realGroupNoteForTopicId()
    // MNUtil.log("currentNoteBookId:"+MNUtil.currentNotebookId)
    // MNUtil.log("noteNoteBookId:"+note.notebookId)
  }

  let response = {}
  // MNUtil.log({message:"execute",detail:funcName})
  switch (funcName) {
    case "readURL":
      response = await this.readURL(func,args)
      break;
    case "executeAction":
      response = await this.executeToolbarAction(func,args)
      break;
    case "executePrompt":
      response = await this.executePrompt(func,args)
      break;
    case "createMindmap":
      response = this.createMindmap(func,args,note)
      break;
    case "userSelect":
      response = await this.userSelect(func,args)
      break;
    case "userConfirm":
      response = await this.userConfirm(func,args)
      break;
    case "userInput":
      response = await this.userInput(func,args)
      break;
    case "generateImage":
      response = await this.generateImage(func,args)
      break;
    case "knowledge":
      response = await this.knowledgeAction(func,args)
      break;
    case "organizeNotes":
      response = await this.organizeNotes(func,args)
      break;
    case "editNote":
      response = await this.editNote(func,args,note)
      break;
    case "searchNotes":
      response = await this.searchNotes(func,args)
      break;
    case "createHTML":
      response = await this.createHTML(func,args)
      break;
    case "createMermaidChart":
      response = await this.createMermaidChart(func,args)
      break;
    case "createNote":
      response = await this.createNote(func, args, note)
      break;
    case "moveNotes":
      response = await this.moveNotes(func,args)
      break;
    case "readImage":
      response = await this.readImage(func,args)
      break;
    case "webSearch":
      response = await this.webSearch(func,args)
      break;
    default:
      break;
  }
  if (Object.keys(response).length) {
    this.preHtml = ""
    this.preCSS = ""
    this.preContent = ""
    return response
  }

  let message = {success:true}
  switch (funcName) {
    case "setTitle":
      response.result = MNUtil.mergeWhitespace(args.title.trim())
      message.response = "Title is set: "+response.result
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      MNUtil.undoGrouping(()=>{
        note.noteTitle = response.result
      })
      break;
    case "addComment":
      response.result = chatAITool.formatMarkdown(args.comment)
      message.response = "Comment is added: "+response.result
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      MNUtil.undoGrouping(()=>{
        note.appendMarkdownComment(response.result)
        if (MNUtil.mindmapView) {
          note.focusInMindMap(0.5)
        }
      })
      break;
    // case "createMermaidChart":
    //   let args = this.fixHtmlArgs(args)

    // case "createHTML":
    //   let fixedArgs = this.fixHtmlArgs(args)
    //   let fullHtml = this.getFullHTML(fixedArgs)
    //   if (fullHtml) {
    //     MNUtil.postNotification("snipasteHtml", {html:fullHtml})
    //     response.result = MNUtil.mergeWhitespace(fullHtml)
    //     response.success = true
    //     message.response = "HTML file is created, with a preview window"
    //   }else{
    //     message.response = "Creating HTML file failed"
    //   }
    //   response.toolMessages = chatAITool.genToolMessage(message,func.id)
    //   break;

    case "addTag":
      response.result = "#"+MNUtil.mergeWhitespace(args.tag.trim())
      message.response = "Tag is added: "+response.result
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      MNUtil.undoGrouping(()=>{
        note.appendTextComment(response.result)
      })
      break;
    case "copyCardURL":
      response.result = note.noteURL
      message.response = "Link is copied: "+response.result
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      MNUtil.copy(response.result)
      break;
    case "copyMarkdownLink":
      response.result = `[${args.title.trim()}](${note.noteURL})`
      message.response = "Markdown Link is copied: "+response.result
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      MNUtil.copy(response.result)
      break;
    case "copyText":
      response.result = chatAITool.formatMarkdown(args.text)
      message.response = "Text is copied: "+response.result
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      MNUtil.copy(response.result)
      break;
    case "close":
      message.response = "Conversation is ended"
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      break;
    case "readDocument":
      let currentFile = chatAIUtils.getCurrentFile()
      if (!currentFile.fileExists) {
        message.response = "Document is empty"
        message.success = false
        response.toolMessages = chatAITool.genToolMessage(message,func.id)
      }else{
        try {
          let PDFExtractMode = chatAIConfig.getConfig("PDFExtractMode")
          let currentDocInfo = await chatAIConfig.getFileContent(currentFile,PDFExtractMode === "local")
          if (!currentDocInfo) {
            message.response = "Reading document failed"
            message.success = false
            response.toolMessages = chatAITool.genToolMessage(message,func.id)
            MNUtil.stopHUD()
            break
          }
          response.toolMessages = chatAITool.genToolMessage(JSON.stringify(currentDocInfo,undefined,2),func.id)
        } catch (error) {
          response.toolMessages = chatAITool.genToolMessage("Reading document failed",func.id)
          MNUtil.stopHUD()
          throw error;
        }
        MNUtil.waitHUD("🤖 Reading: "+currentFile.name)
      }
      break;
    case "readNotes":
      let focusNotes = []
      if ("noteIds" in args && args.noteIds.length) {
        focusNotes = args.noteIds.map((noteId)=>{
          return MNNote.new(noteId)
        })
      }else{
        focusNotes = chatAIUtils.getFocusNotes()
        if (focusNotes.length === 0 || args.range === "allNotesInMindmap") {
          focusNotes = chatAIUtils.getCurrentNotesInMindmap()
        }
        // MNUtil.copy("object"+focusNotes.length)
      }
      if (focusNotes.length > 100) {
        let confirm = await MNUtil.confirm("Too many notes ("+focusNotes.length+")","🤖: 当前脑图笔记过多请确认是否继续读取笔记("+focusNotes.length+")",["Cancel","Confirm"])
        if (confirm === 0) {
          message.response = "Empty notes"
          message.success = false
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
          break
        }
      }
      // MNUtil.copy("object"+focusNotes.length)
      MNUtil.waitHUD("🤖 Reading "+focusNotes.length+" notes")
      if (focusNotes.length) {
        if (focusNotes.length === 1) {
          let noteContent = await chatAIUtils.genCardStructure(focusNotes[0])
          response.toolMessages = chatAITool.genToolMessage("Below are the details of note:\n"+JSON.stringify(noteContent,undefined,2),func.id)
        }else{
          let notesContents = []
          for (let i = 0; i < focusNotes.length; i++) {
            const note = focusNotes[i];
            let structure = await chatAIUtils.genCardStructure(note)
            notesContents.push(structure)
          }
          let tree = chatAIUtils.buildHierarchy(notesContents)
          // MNUtil.copy(tree)
          MNUtil.delay(0.5).then(()=>{
            MNUtil.stopHUD()
          })
          response.toolMessages = chatAITool.genToolMessage("Below are the details of focused notes:\n"+JSON.stringify(tree,undefined,2),func.id)
        }
      }else{
        message.response = "No note found"
        message.success = false
        response.toolMessages = chatAITool.genToolMessage(message,func.id)
      }
      break;
    case "mergeNotes":
      fromNotes = args.fromNoteIds.map((noteId)=>{
        return MNNote.new(noteId)
      })
      if ("toNoteId" in args) {
        let toNote = MNNote.new(args.toNoteId)
        MNUtil.undoGrouping(()=>{
          fromNotes.forEach((n)=>{
            toNote.merge(n)
          })
        })
        message.response = fromNotes.length+" notes are merged to "+args.toNoteId
        message.success = true
        response.toolMessages = chatAITool.genToolMessage(message,func.id)
      }else{
        message.response = "Those notes are not merged, because toNoteId is missing"
        message.success = false
        response.toolMessages = chatAITool.genToolMessage(message,func.id)
      }
      break;
    case "linkNotes":
      fromNote = MNNote.new(args.fromNoteId)
      toNote = MNNote.new(args.toNoteId)
      MNUtil.undoGrouping(()=>{
        fromNote.appendNoteLink(toNote)
        if (!("biDirectional" in args) || args.biDirectional) {
          toNote.appendNoteLink(fromNote)
        }
      })
      message.response = "Note is linked to "+args.toNoteId
      message.success = true
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      break;

    case "readParentNote":
      if ("noteId" in args && args.noteId) {
        note = MNNote.new(args.noteId)
      }
      if (note) {
        parentNote = note.parentNote
        if (parentNote) {
          let noteContent = {
            title:parentNote.noteTitle,
            content:chatAITool.formatMarkdownList(parentNote.allText),
            id:parentNote.noteId,
            color:parentNote.color
          }
          if (parentNote.tags && parentNote.tags.length) {
            noteContent.tags = parentNote.tags
          }
          response.toolMessages = chatAITool.genToolMessage("Parent note:\n"+JSON.stringify(noteContent,undefined,2),func.id)
        }else{
          message.response = "Current note has no parent note"
          message.success = false
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }
      }else{  
        message.response = "No note selected"
        message.success = false
        response.toolMessages = chatAITool.genToolMessage(message,func.id)
      }
      break
    case "clearExcerpt":
      MNUtil.undoGrouping(()=>{
        note.excerptText = ""
      }) 
      message.response = "excerpt is cleared"
      message.success = true
      response.toolMessages = chatAITool.genToolMessage(message, func.id)
      break;
    case "setExcerpt":
      // note = MNUtil.getNoteById(noteid)
      // response.result = args.excerpt.replace(/&nbsp;/g, ' ')
      response.result = chatAITool.formatMarkdown(args.excerpt)
      note = note.realGroupNoteForTopicId()
      MNUtil.undoGrouping(()=>{
        note.excerptText = response.result
        note.excerptTextMarkdown = true
        if (MNUtil.mindmapView) {
          note.focusInMindMap(0.5)
        }
      }) 
      message.response = "excerpt is set: "+response.result
      message.success = true
      response.toolMessages = chatAITool.genToolMessage(message, func.id)
      break;

    case "createNote":
      let title = args.title
      let config = {markdown:true}
      if (title) {
        config.title = title.trim()
      }
      let content = args.content
      // MNUtil.log({message:"addChildNoteBefore",detail:content})
      if (content) {
        config.content = chatAITool.formatMarkdown(content)
      }
      // MNUtil.log({message:"addChildNoteAfter",detail:config.content})
      let htmlContent = args.html
      // if (htmlContent) {
      //   config.htmlContent = htmlContent
      // }
      tags = args.tags
      if (tags) {
        config.tags = tags
      }
      let color = args.color
      if (color) {
        config.color = color
      }
      if ("parentNoteId" in args && args.parentNoteId) {
        note = MNNote.new(args.parentNoteId)
        note = note.realGroupNoteForTopicId()
      }
      if (!note) {
        note = MNUtil.currentChildMap
      }
      // MNNote.createChildNote
      response.result = config
      // MNUtil.showHUD("message")
      // MNUtil.copy(htmlContent)
      if (!note) {
        MNUtil.undoGrouping(()=>{
          note = MNNote.new(response.result)
          if (htmlContent) {
            note.appendHtmlComment(htmlContent, htmlContent, {width:1000,height:500}, "")
          }
          if (MNUtil.mindmapView) {
            note.focusInMindMap(0.5)
          }
          message.response = "child note is created"
          message.success = true
        })
      }else{
        MNUtil.undoGrouping(()=>{
          let child = note.createChildNote(response.result,false)
          if (!child) {
            MNUtil.showHUD("❌ Failed in create childNote")
            message.response = "Failed in create childNote"
            message.success = false
          }else{
            try {
              if (htmlContent) {
                child.appendHtmlComment(htmlContent, htmlContent, {width:1000,height:500}, "")
              }
            } catch (error) {
              chatAIUtils.addErrorLog(error, "addChildNote")
            }
            if (MNUtil.mindmapView) {
              child.focusInMindMap(0.5)
            }
            message.response = "child note is created"
            message.success = false
          }
        })
      }
      message.noteStructure = response.result
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      break 
    case "UnkonwFunc":
      response.result = "Unknown function: "+funcName
      message.success = false
      message.response = "Unknown function: "+funcName
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      break;
    default:
      break;
  }
  response.description = this.codifyToolCall(args,true)
  this.preHtml = ""
  this.preCSS = ""
  this.preContent = ""
  // MNUtil.copy(this.tem)
  return response
} catch (error) {
  chatAIUtils.addErrorLog(error, "chatAITool.execute",func)
  return {toolMessages:chatAITool.genToolMessage("Error: "+error.message,func.id)}
}
}
  createMindmap (func,args,note) {
  // if (!note) {
  //   MNUtil.log("note is not found")
  // }
    let response = {}
    let message = {success:true}
      let ast
      switch (typeof args.ast) {
        case "object":
          // MNUtil.showHUD("object")
          ast = args["ast"]
          response.result = JSON.stringify(ast)
          break;
        case "string":
          // MNUtil.showHUD("string")
          response.result = args.ast
          ast = chatAIUtils.getValidJSON(response.result)
          break;
        default:
          break;
      }
      // MNUtil.log({message:"createMindmap",detail:args})
      // MNUtil.copy(args)
      if ("parentNoteId" in args && args.parentNoteId) {
        // MNUtil.log("parentNoteId")
        note = MNNote.new(args.parentNoteId)
      }
      // if (!note && chatAIUtils.currentSelection.onSelection) {
      //   // MNUtil.log("currentChildMap")
      //   note = MNNote.fromSelection().realGroupNoteForTopicId()
      //   MNUtil.excuteCommand("SendToMap")
      // }
      if (!note) {
        // MNUtil.log("currentChildMap")
        note = MNUtil.currentChildMap
      }
      message.response = "Mindmap is created: "+response.result
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      MNUtil.undoGrouping(()=>{
        // MNUtil.showHUD("Creating mindmap...")
        try {
        let child = chatAITool.AST2Mindmap(note, ast)
        child.focusInMindMap(0.5)
          
        } catch (error) {
          chatAIUtils.addErrorLog(error, "createMindmap", func.id)
        }
      })
    response.description = this.codifyToolCall(args,true)
    return response
  }
  async userSelect(func,args) {
    let response = {}
    let message = {success:true}
    let selectRes = {button:0,input:""}
      let choices = ["Cancel"].concat(args.choices,"Reply")
      if (args.title && args.detail) {
        selectRes = await MNUtil.input("🤖: "+args.title,args.detail,choices)
      }else{
        selectRes = await MNUtil.input("🤖: "+args.title,"",choices)
      }
      if (selectRes.button === 0) {
        response.result = {question:args,confirmed:false}
        message.response = "User does not make the choice"
      }if(selectRes.button === choices.length-1){
        response.result = {question:args,confirmed:true,userInput:selectRes.input}
        message.response = "User does not make the choice but reply: "+selectRes.input
      }else{
        response.result = {question:args,confirmed:true,choice:choices[selectRes.button]}
        if (selectRes.input) {
          message.response = "User's choice: "+choices[selectRes.button]+", with reply: "+selectRes.input
        }else{
          message.response = "User's choice: "+choices[selectRes.button]
        }
      }
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
  }
  async userConfirm(func,args) {
    let response = {}
    let message = {success:true}
    let confirm = false
      if (args.title && args.detail) {
        confirm = await MNUtil.confirm("🤖: "+args.title,args.detail)
      }else{
        confirm = await MNUtil.confirm("🤖: "+args.title,"")
      }
      response.result = {question:args,confirmed:confirm}
      if (confirm) {
        message.response = "User confirms"
      }else{
        message.response = "User does not confirm"
      }
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
  }
  async userInput(func,args) {
    let response = {}
    let message = {success:true}
      let userInput = ""
      let res = {button:0,input:""}
      if (args.title && args.detail) {
        res = await MNUtil.input("🤖: "+args.title,args.detail,["Cancel","Confirm"])
      }else{
        res = await MNUtil.input("🤖: "+args.title,"")
      }
      if (res.button === 0) {
        response.result = {question:args,hasUserInput:false}
        message.response = "User does not reply or confirm"
      }else{
        userInput = res.input
        if (userInput) {
          response.result = {question:args,hasUserInput:true,userInput:userInput}
          message.response = "User replies: "+userInput
        }else{
          message.response = "User confirms"
          response.result = {question:args,hasUserInput:false,confirmed:true}
        }
      }
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
  }
  async createHTML(func,args) {
    let response = {}
    let message = {success:true}
    let fixedArgs = this.fixHtmlArgs(args)
    let fullHtml = this.getFullHTML(fixedArgs)
    if (fullHtml) {
      if (typeof snipasteUtils === "undefined") {
        MNUtil.confirm("🤖 MNChatAI", "❌ Creating HTML file failed\nPlease install the [MN Snipaste] addon to preview the HTML document\n\n❌ 创建HTML文件失败\n请安装[MN Snipaste]插件以预览HTML文档")
        message.response = "Creating HTML file failed, because the addon [MN Snipaste] is not installed"
        message.success = false
        response.toolMessages = chatAITool.genToolMessage(message,func.id)
        return response
      }else{
        MNUtil.postNotification("snipasteHtml", {html:fullHtml,force:true})
        response.result = MNUtil.mergeWhitespace(fullHtml)
        response.success = true
        message.response = "HTML file is created, with a preview window"
      }
    }else{
      message.response = "Creating HTML file failed"
    }
    response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
  }
  async createMermaidChart(func,args) {
    let response = {}
    let message = {success:true}
    let content = args.content ?? ""
    if (content) {
      content = chatAIUtils.replaceLtInLatexBlocks(content)
      content = content.replace(/\\n/g,"\n")
      // MNUtil.log({message:"createMermaidChart",detail:content})
      MNUtil.postNotification("snipasteMermaid", {content:content,force:true})
      response.result = content
      response.success = true
      message.response = "Mermaid chart is created, with a preview window"
    }else{
      message.response = "Creating Mermaid chart failed"
    }
    response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
  }
  async knowledgeAction(func,args) {
    // MNUtil.log({message:"knowledgeAction",detail:args})
    let response = {}
    let message = {success:true}
    switch (args.action) {
      case "getKnowledge":
        if (chatAIConfig.knowledge.trim()) {
          response.result = chatAIConfig.knowledge
          message.response = "Current knowledge is:\n"+response.result
        }else{
          response.result = ""
          message.response = "Current knowledge is empty"
        }
        break;
      case "appendKnowledge":
        response = this.setKnowledge(func,{method:"append",content:args.content})
        return response;
      case "overwriteKnowledge":
        response = this.setKnowledge(func,{method:"overwrite",content:args.content})
        return response;
      case "clearKnowledge":
        response = this.setKnowledge(func,{method:"clear",content:args.content})
        return response;
      default:
        message.response = "Unknown action: "+args.action
        message.success = false
        break;
    }
    response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
  }
  setKnowledge(func,args) {
    try {

    let response = {}
    let message = {success:true}
    let method = args.method ?? "append"
    switch (method) {
      case "append":
        chatAIConfig.knowledge += ("\n"+args.content)
        chatAIConfig.knowledge = chatAIConfig.knowledge.trim()
        response.result = chatAIConfig.knowledge
        message.response = "Current knowledge updated to:\n"+chatAIConfig.knowledge
        break;
      case "overwrite":
        chatAIConfig.knowledge = args.content
        chatAIConfig.knowledge = chatAIConfig.knowledge.trim()
        response.result = chatAIConfig.knowledge
        message.response = "Current knowledge is overwritten as:\n"+chatAIConfig.knowledge
        break;
      case "clear":
        chatAIConfig.knowledge = ""
        response.result = chatAIConfig.knowledge
        message.response = "Knowledge is cleared, current knowledge is empty"
        break;
      default:
        break;
    }
    chatAIConfig.save("MNChatglm_knowledge",undefined,false)
    response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
      
    } catch (error) {
      chatAIUtils.addErrorLog(error, "setKnowledge")
      message.response = "Failed in setting knowledge"
      message.success = false
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      return response
    }
  }
  async readURL(func,args){
    try {
      let response = {}
      let message = {success:true}
      let url = args.url
      let res = await chatAIUtils.readURL(url)
      if (res && "reader_result" in res) {
        response.result = res.reader_result.content
        message.response = "URL is read successfully:\n"+response.result
        response.toolMessages = chatAITool.genToolMessage(message,func.id)
      }else{
        message.response = "Failed in reading URL"
        message.success = false
        response.toolMessages = chatAITool.genToolMessage(message,func.id)
      }
      return response
    } catch (error) {
      chatAIUtils.addErrorLog(error, "readURL")
      let response = {}
      let message = {success:false,response:"Failed in reading URL"}
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      return response
    }
  }
  async webSearch(func,args){
    let response = {}
    let message = {success:true}
    if (chatAIUtils.checkSubscribe(true,false)) {
      MNUtil.showHUD("🤖 Searching for ["+args.question+"] ")
      let apikeys = ["76ab4fa776ae4dfc97b91c07e73b0747.tcVmN7p0voHpb35C","b9bf21c783bf4207a0f419af4a82fa9c.9guT9c4lY05MgFrC"]
      let apikey = chatAIUtils.getRandomElement(apikeys)
      let res = await chatAINetwork.webSearch(args.question,apikey)
      response.renderSearchResults = JSON.stringify(res)
      response.toolMessages = chatAITool.genToolMessage(JSON.stringify(res),func.id)
    }else{
      message.response = "Empty response due to the subscription limit in MN Utils"
      message.success = false
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
    }
    return response
  }
  async generateImageUsingCogviewChatCompletion(func,args,model = "cogview-3-flash"){
    MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML(`Generating image using ${model}...`)})
    let response = {}
    let message = {success:true}
    try {
      let url = subscriptionConfig.URL+"/v1/chat/completions"
      let apikey = model === "cogview-4-250304" ? subscriptionConfig.APIKey : 'sk-S2rXjj2qB98OiweU46F3BcF2D36e4e5eBfB2C9C269627e44'
      MNUtil.showHUD("Generating image...")
      let request = chatAINetwork.initRequestForChatGPTWithoutStream([{"role":"user","content":args.prompt}], apikey, url, model)
      let res = await chatAINetwork.sendRequest(request)
      // MNUtil.copy(res)
      if ("choices" in res) {
        // if ("error" in res.data) {
        //   if (typeof res.data.error === "string") {
        //     response.result = res.data.error
        //   }else{
        //     response.result = res.data.error.message
        //   }
        //   MNUtil.confirm("🤖 MNChatAI:\n\n❌ Image generated failed", response.result)
        //   message.response = "Failed in generating image: "+response.result
        //   response.toolMessages = chatAITool.genToolMessage(message,func.id)
        // }else{
          MNUtil.showHUD("✅ Image generated")
          MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML("Downloading image...")})
          response.result = res.choices[0].message.content[0].url
          // response.result = res.data.image_urls[0]
          message.response = "Image is created at the following url: "+response.result+"\n please show this image as markdown image"
          // message.response = "Image is created at the following url: "+res.data.image_urls[0]+"\n please show this image as markdown image"
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
          MNUtil.delay(0.1).then(async()=>{
            let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(response.result))
            MNUtil.postNotification("snipasteImage", {imageData:imageData})
          })
        // }
      }else{
        if ("error" in res) {
          response.result = res.error
          MNUtil.confirm("❌ Image generated failed", response.result)
          message.response = "Failed in generating image: "+response.result
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }else{
          MNUtil.showHUD("❌ Image generated failed")
          message.response = "Failed in generating image"
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }
      }

    } catch (error) {
      chatAIUtils.addErrorLog(error, "generateImage")
      MNUtil.showHUD("❌ Image generated failed")
      message.response = "Failed in generating image"
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
    }
    return response
  
  }
  async generateImageUsingCogview(func,args,model = "cogview-3-flash"){
    MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML(`Generating image using ${model}...`)})
    let response = {}
    let message = {success:true}
    try {
      let url = "https://open.bigmodel.cn/api/paas/v4/images/generations"
      let apikey = "76ab4fa776ae4dfc97b91c07e73b0747.tcVmN7p0voHpb35C"
      MNUtil.showHUD("Generating image...")
      let request = chatAINetwork.initRequestForCogView(args.prompt, apikey, url, model)
      let res = await chatAINetwork.sendRequest(request)
      // MNUtil.copy(res)
      if ("data" in res) {
        if ("error" in res.data) {
          if (typeof res.data.error === "string") {
            response.result = res.data.error
          }else{
            response.result = res.data.error.message
          }
          MNUtil.confirm("🤖 MNChatAI:\n\n❌ Image generated failed", response.result)
          message.response = "Failed in generating image: "+response.result
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }else{
          MNUtil.showHUD("✅ Image generated")
          MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML("Downloading image...")})
          response.result = res.data[0].url
          // response.result = res.data.image_urls[0]
          message.response = "Image is created at the following url: "+response.result+"\n please show this image as markdown image"
          // message.response = "Image is created at the following url: "+res.data.image_urls[0]+"\n please show this image as markdown image"
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
          MNUtil.delay(0.1).then(async()=>{
            let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(response.result))
            MNUtil.postNotification("snipasteImage", {imageData:imageData})
          })
        }
      }else{
        if ("error" in res) {
          response.result = res.error
          MNUtil.confirm("❌ Image generated failed", response.result)
          message.response = "Failed in generating image: "+response.result
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }else{
          MNUtil.showHUD("❌ Image generated failed")
          message.response = "Failed in generating image"
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }
      }

    } catch (error) {
      chatAIUtils.addErrorLog(error, "generateImage")
      MNUtil.showHUD("❌ Image generated failed")
      message.response = "Failed in generating image"
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
    }
    return response
  
  }
  async generateImageUsingMinimax(func,args,model = "image-01"){
    MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML(`Generating image using ${model}...`)})
    let response = {}
    let message = {success:true}
    try {

      let url = "https://api.minimax.chat/v1/image_generation"
      let apikey = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLmnpfnq4vpo54iLCJVc2VyTmFtZSI6Iuael-eri-mjniIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxNzgyMzYzOTA3MTA5NzAwMTg2IiwiUGhvbmUiOiIxMzEyODU4OTM1MSIsIkdyb3VwSUQiOiIxNzgyMzYzOTA3MTAxMzExNTc4IiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiMTUxNDUwMTc2N0BxcS5jb20iLCJDcmVhdGVUaW1lIjoiMjAyNS0wNS0wMSAyMToxMzozMyIsIlRva2VuVHlwZSI6MSwiaXNzIjoibWluaW1heCJ9.a_vgCX8RH98PWKstZTCkkUow-ta4vS-FEYCkLNTnnYO5wpAPzqkODprPbDHTyE46uQE1PHcV34NNgQjDynAe9cKkCU11hrZhX5UexWZ7OOx_m7IvzeqezX7iZXQQSCJjzEwlwYenACS71uKGyoRpXXfNUWZ_cZZQrS_EJxAYiAiklKY1w-ue0kC61ubRdmT0FvPdQ5mWzYDvrbI6GE5OqLmWKcDFi6qQQ7PPrQkfHm8bZxQ6VmIt0pwMMA3FG4a6DW8We82iCmOZ2ZnRvQauMA7NyDnMxNG2b7Qps_A5LNAsmqNIUOb0aQtyyYdQYOokPV_LOJbrlzo_gjrxwS1n-g"
      MNUtil.showHUD("Generating image...")
      let request = chatAINetwork.initRequestForCogView(args.prompt, apikey, url, model)
      let res = await chatAINetwork.sendRequest(request)
      // MNUtil.copy(res)
      if ("data" in res) {
        if ("error" in res.data) {
          if (typeof res.data.error === "string") {
            response.result = res.data.error
          }else{
            response.result = res.data.error.message
          }
          MNUtil.confirm("🤖 MNChatAI:\n\n❌ Image generated failed", response.result)
          message.response = "Failed in generating image: "+response.result
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }else{
          MNUtil.showHUD("✅ Image generated")
          MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML("Downloading image...")})
          if (Array.isArray(res.data)) {
            response.result = res.data[0].url
          }else{
            response.result = res.data.image_urls[0]
          }
          // response.result = res.data.image_urls[0]
          message.response = "Image is created at the following url: "+response.result+"\n please show this image as markdown image"
          // message.response = "Image is created at the following url: "+res.data.image_urls[0]+"\n please show this image as markdown image"
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
          MNUtil.delay(0.1).then(()=>{
            let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(response.result))
            MNUtil.postNotification("snipasteImage", {imageData:imageData})
            // chatAIUtils.notifyController.updateHeight()
            // MNUtil.log("✅ Image downloaded")
          })
        }
      }else{
        if ("error" in res) {
          response.result = res.error
          MNUtil.confirm("❌ Image generated failed", response.result)
          message.response = "Failed in generating image: "+response.result
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }else{
          MNUtil.showHUD("❌ Image generated failed")
          message.response = "Failed in generating image"
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }
      }

    } catch (error) {
      chatAIUtils.addErrorLog(error, "generateImage")
      MNUtil.showHUD("❌ Image generated failed")
      message.response = "Failed in generating image"
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
    }
    return response
  
  }
  async generateImageUsingQwen(func,args,model = "qwen-image"){
    MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML(`Generating image using ${model}...`)})
    let response = {}
    let message = {success:true}
    try {
      let url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"
      let apikey = "sk-a1afb999f36b4f52be59a94490ce8528"
      MNUtil.showHUD("Generating image...")
      let request = chatAINetwork.initRequestForQwenWithoutStream(args.prompt, apikey, url, model)
      let res = await chatAINetwork.sendRequest(request)
      MNUtil.log({message:"generateImageUsingQwen",detail:res})
      if (typeof res === "string") {
        let resObj = JSON.parse(res.split("data:")[1])
        if ("output" in resObj) {
          MNUtil.log({message:"generateImageUsingQwen",detail:resObj})
          MNUtil.showHUD("✅ Image generated")
          MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML("Downloading image...")})
          response.result = resObj.output.choices[0].message.content[0].image
          message.response = "Image is created at the following url: "+response.result+"\n please show this image as markdown image"
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
          
          MNUtil.delay(0.1).then(()=>{
            let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(response.result))
            MNUtil.postNotification("snipasteImage", {imageData:imageData})
            // MNUtil.log("✅ Image downloaded")
          })
          return response
        }
        response.result = res
        MNUtil.confirm("🤖 MNChatAI:\n\n❌ Image generated failed", response.result)
        message.response = "Failed in generating image: "+response.result
        response.toolMessages = chatAITool.genToolMessage(message,func.id)
        return response
      }
      // MNUtil.copy(res)
      if ("data" in res) {
        if ("error" in res.data) {
          if (typeof res.data.error === "string") {
            response.result = res.data.error
          }else{
            response.result = res.data.error.message
          }
          MNUtil.confirm("🤖 MNChatAI:\n\n❌ Image generated failed", response.result)
          message.response = "Failed in generating image: "+response.result
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }else{
          MNUtil.showHUD("✅ Image generated")
          MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML("Downloading image...")})
          if (Array.isArray(res.data)) {
            response.result = res.data[0].url
          }else{
            response.result = res.data.image_urls[0]
          }
          // response.result = res.data.image_urls[0]
          message.response = "Image is created at the following url: "+response.result+"\n please show this image as markdown image"
          // message.response = "Image is created at the following url: "+res.data.image_urls[0]+"\n please show this image as markdown image"
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
          MNUtil.delay(0.1).then(()=>{
            let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(response.result))
            MNUtil.postNotification("snipasteImage", {imageData:imageData})
            // chatAIUtils.notifyController.updateHeight()
            // MNUtil.log("✅ Image downloaded")
          })
        }
      }else{
        if ("error" in res) {
          response.result = res.error
          MNUtil.confirm("❌ Image generated failed", response.result)
          message.response = "Failed in generating image: "+response.result
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }else{
          MNUtil.showHUD("❌ Image generated failed")
          message.response = "Failed in generating image"
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
        }
      }

    } catch (error) {
      chatAIUtils.addErrorLog(error, "generateImage")
      MNUtil.showHUD("❌ Image generated failed")
      message.response = "Failed in generating image"
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
    }
    return response
  
  }
  async generateImage(func,args) {
    let model = chatAIConfig.getConfig("imageGenerationModel")
    if (model === "cogview-3-flash") {
      return await this.generateImageUsingCogviewChatCompletion(func,args,model)
    }
    if (model.startsWith("image-01")) {
      return await this.generateImageUsingMinimax(func,args,model)
    }
    if (model.startsWith("qwen-")) {
      return await this.generateImageUsingQwen(func, args, model)
    }
    if (!chatAIUtils.checkSubscribe(false,false,true)) {
      return await this.generateImageUsingCogviewChatCompletion(func,args,"cogview-3-flash")
    }
    if (model === "cogview-4-250304") {
      return await this.generateImageUsingCogviewChatCompletion(func,args,model)
    }
    MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML(`Generating image using ${model}...`)})
    if (model.startsWith("gemini-2.5-flash-image")) {
      model = "gemini-2.5-flash-image-vip"
    }
    let response = {}
    let message = {success:true}
    try {
      let url = subscriptionConfig.URL+"/v1/images/generations"
      let apikey = subscriptionConfig.APIKey
      // model = "gpt-image-1"
      // url = "https://remote.feliks.top/v1/images/generations"
      // apikey = "sk-dHlgo7tvMjnnzz4s4yCElJxLPUwcaBP7CoY5SfFTXcpCWuaj"
      // model = "qwen-image"
      // url = "https://api.u1162561.nyat.app:20074/v1/images/generations"
      // apikey = "sk-Qv2WDpQnZ8w3xlbl192d0fBf92C545Ad9e4b58629d0866C7"
      // model = "qwen-image"
      // let url = "https://generativelanguage.googleapis.com/v1beta/openai/images/generations"
      // let apikey = "AIzaSyAU7Ekqwi6lOHONFtu4g3Q9UWr56c1D5Gk"
      // let model = "gemini-2.0-flash-preview-image-generation"
      // let url = "https://api.gptgod.online/v1/images/generations"
      // let apikey = "sk-edtyVyaobSEOb0tDXphlPDSquQKPdE8AvwU6Jl5qIjFPhtMz"
      // let model = "gemini-2.5-flash-image"
      // let url = "https://api.minimax.chat/v1/image_generation"
      // let apikey = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLmnpfnq4vpo54iLCJVc2VyTmFtZSI6Iuael-eri-mjniIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxNzgyMzYzOTA3MTA5NzAwMTg2IiwiUGhvbmUiOiIxMzEyODU4OTM1MSIsIkdyb3VwSUQiOiIxNzgyMzYzOTA3MTAxMzExNTc4IiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiMTUxNDUwMTc2N0BxcS5jb20iLCJDcmVhdGVUaW1lIjoiMjAyNS0wNS0wMSAyMToxMzozMyIsIlRva2VuVHlwZSI6MSwiaXNzIjoibWluaW1heCJ9.a_vgCX8RH98PWKstZTCkkUow-ta4vS-FEYCkLNTnnYO5wpAPzqkODprPbDHTyE46uQE1PHcV34NNgQjDynAe9cKkCU11hrZhX5UexWZ7OOx_m7IvzeqezX7iZXQQSCJjzEwlwYenACS71uKGyoRpXXfNUWZ_cZZQrS_EJxAYiAiklKY1w-ue0kC61ubRdmT0FvPdQ5mWzYDvrbI6GE5OqLmWKcDFi6qQQ7PPrQkfHm8bZxQ6VmIt0pwMMA3FG4a6DW8We82iCmOZ2ZnRvQauMA7NyDnMxNG2b7Qps_A5LNAsmqNIUOb0aQtyyYdQYOokPV_LOJbrlzo_gjrxwS1n-g"
      // let model = "image-01"
      // let url = "https://api.minimax.chat/v1/image_generation"
      // let apikey = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLmnpfnq4vpo54iLCJVc2VyTmFtZSI6Iuael-eri-mjniIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxNzgyMzYzOTA3MTA5NzAwMTg2IiwiUGhvbmUiOiIxMzEyODU4OTM1MSIsIkdyb3VwSUQiOiIxNzgyMzYzOTA3MTAxMzExNTc4IiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiMTUxNDUwMTc2N0BxcS5jb20iLCJDcmVhdGVUaW1lIjoiMjAyNS0wNS0wMSAyMToxMzozMyIsIlRva2VuVHlwZSI6MSwiaXNzIjoibWluaW1heCJ9.a_vgCX8RH98PWKstZTCkkUow-ta4vS-FEYCkLNTnnYO5wpAPzqkODprPbDHTyE46uQE1PHcV34NNgQjDynAe9cKkCU11hrZhX5UexWZ7OOx_m7IvzeqezX7iZXQQSCJjzEwlwYenACS71uKGyoRpXXfNUWZ_cZZQrS_EJxAYiAiklKY1w-ue0kC61ubRdmT0FvPdQ5mWzYDvrbI6GE5OqLmWKcDFi6qQQ7PPrQkfHm8bZxQ6VmIt0pwMMA3FG4a6DW8We82iCmOZ2ZnRvQauMA7NyDnMxNG2b7Qps_A5LNAsmqNIUOb0aQtyyYdQYOokPV_LOJbrlzo_gjrxwS1n-g"
      // let model = "wanx2.1-t2i-plus"
      MNUtil.showHUD("Generating image...")
      let request = chatAINetwork.initRequestForCogView(args.prompt, apikey, url, model)
      let res = await chatAINetwork.sendRequest(request)
      // MNUtil.copy(res)
      MNUtil.log({message:"generateImage",detail:res})
      if ("data" in res) {
        if ("error" in res.data) {
          if (typeof res.data.error === "string") {
            response.result = res.data.error
          }else{
            response.result = res.data.error.message
          }
          let confirm = await MNUtil.confirm("🤖 MNChatAI:\n\n❌ Image generated failed", response.result+"\n\n是否切换到智谱CogView-3 Flash?")
          if (confirm) {//使用智谱模型进行生图
            response = this.generateImageUsingCogview(func, args)
            return response;
          }else{
            message.response = "Failed in generating image: "+response.result
            response.toolMessages = chatAITool.genToolMessage(message,func.id)
          }
        }else{
          MNUtil.showHUD("✅ Image generated")
          MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML("Downloading image...")})
          // MNUtil.log("✅ Image generated")
          if (Array.isArray(res.data)) {
            let data = res.data[0]
            if ("url" in data) {
              response.result = data.url
              message.response = "Image is created at the following url: "+response.result+"\n please show this image as markdown image"
            }else{
              response.result = "data:png;base64,"+data.b64_json
              if (typeof snipasteUtils !== "undefined") {
                message.response = "Image is created and displayed in MN Snipaste"
              }else{
                message.response = "Image is created"
              }
            }
          }else{
            response.result = res.data.image_urls[0]
            message.response = "Image is created at the following url: "+response.result+"\n please show this image as markdown image"
          }
          // response.result = res.data.image_urls[0]
          // message.response = "Image is created at the following url: "+res.data.image_urls[0]+"\n please show this image as markdown image"
          response.toolMessages = chatAITool.genToolMessage(message,func.id)
          MNUtil.delay(0.1).then(()=>{
            let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(response.result))
            MNUtil.postNotification("snipasteImage", {imageData:imageData})
            // chatAIUtils.notifyController.updateHeight()
            // MNUtil.log("✅ Image downloaded")
          })
          // MNUtil.postNotification("snipasteHtml", {html:`<img src="${response.result}" alt="Image generated by MN ChatAI">`})
        }
      }else{
        if ("error" in res) {
          response.result = res.error
          let confirm = await MNUtil.confirm("🤖 MNChatAI:\n\n❌ Image generated failed", response.result+"\n\n是否切换到智谱Cogview-4?")
          if (confirm) {//使用智谱模型进行生图
            response = this.generateImageUsingCogview(func, args)
            return response;
          }else{
            message.response = "Failed in generating image: "+response.result
            response.toolMessages = chatAITool.genToolMessage(message,func.id)
          }
        }else{
          response.result = res.error
          let confirm = await MNUtil.confirm("🤖 MNChatAI:\n\n❌ Image generated failed", response.result+"\n\n是否切换到智谱Cogview-4?")
          if (confirm) {//使用智谱模型进行生图
            response = this.generateImageUsingCogview(func, args)
            return response;
          }else{
            message.response = "Failed in generating image"
            response.toolMessages = chatAITool.genToolMessage(message,func.id)
          }
        }
      }

    } catch (error) {
      chatAIUtils.addErrorLog(error, "generateImage")
      MNUtil.showHUD("❌ Image generated failed")
      message.response = "Failed in generating image"
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
    }
    MNUtil.stopHUD(0.5)
    return response
  }
  /**
   * 
   * @param {object[]} notes 
   * @param {string} query 
   * @returns {Promise<MNNote[]>}
   */
  async rerankNotes(notes,query){
    let noteStrings = notes.map(note=>{
      let text = note.allNoteText()
      text = chatAIUtils.replaceBase64ImagesWithTemplate(text)
      return text
    })
    let res = await chatAINetwork.rerank(noteStrings,query,20)
    let relativeNotesWithScore = []
    for (let item of res) {
      if (item.relevance_score > 0.5) {
        relativeNotesWithScore.push({note:notes[item.index],score:item.relevance_score})
      }
    }
    return relativeNotesWithScore
  }
  async searchNotes(func,args) {
    let responsePrefix = "Search results are shown as follows, please show them as markdown link, user can click the link to show the note in floating window:\n"
    let response = {}
    let message = {success:true}
    let searchRange = args.searchRange ?? "currentNotebook"
    let keywords = args.searchPhrases ?? []
    let notes = []
    switch (searchRange) {
      case "currentNotebook":
        notes = await chatAITool.searchInCurrentStudySets(keywords)
        response.result = notes
        break;
      case "allNotebooks":
        if (args.exceptNotebooks) {
          notes = await chatAITool.searchInAllStudySets(keywords,{exceptNotebookNames:args.exceptNotebooks})
        }else{
          notes = await chatAITool.searchInAllStudySets(keywords)
        }
        response.result = notes
        break;
      default:
        break;
    }
    if (notes.length === 0) {
      message.response = "No notes are found"
      message.success = false
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      return response
    }
    if (notes.length > 200) {
      chatAITool.waitHUD("Reranking "+notes.length+" notes...")
      let noteParts = []//分段做rerank

      for (let i = 0; i < notes.length; i += 200) {
        noteParts.push(notes.slice(i,i+200))
      }
      let resParts = await Promise.all(noteParts.map(notes=>this.rerankNotes(notes,args.query)))
      MNUtil.stopHUD()
      let res = resParts.flatMap(item=>item)
      //根据score排序
      res.sort((a,b)=>b.score-a.score)
      // MNUtil.copy(res.map(r=>r.score))
      let relativeNotes = []
      chatAITool.waitHUD("Generating structure for "+res.length+" notes...")
      for (let item of res) {
        relativeNotes.push(await chatAIUtils.genCardStructure(item.note))
      }
      MNUtil.delay(1).then(()=>{
        MNUtil.stopHUD()
      })
      chatAITool.showHUD("Reading "+relativeNotes.length+" notes...")
      // MNUtil.copy(relativeNotes)
      response.result = relativeNotes
      message.response = responsePrefix+JSON.stringify(relativeNotes,undefined,2)
      message.success = true
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      return response
    }else if (notes.length <= 10) {
      // 如果笔记数量小于10，则直接生成结构
      let relativeNotes = []
      chatAITool.waitHUD("Generating structure for "+notes.length+" notes...")
      for (let note of notes) {
        relativeNotes.push(await chatAIUtils.genCardStructure(note))
      }
      MNUtil.stopHUD()
      chatAITool.showHUD("Reading "+relativeNotes.length+" notes...")
      response.result = relativeNotes
      message.response = responsePrefix+JSON.stringify(relativeNotes,undefined,2)
      message.success = true
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      return response
    }else{
      // 如果笔记数量大于10，则先做rerank，再生成结构
      chatAITool.waitHUD("Reranking "+notes.length+" notes...")
      let res = await this.rerankNotes(notes, args.query)
      let relativeNotes = []
      chatAITool.waitHUD("Generating structure for "+res.length+" notes...")
      for (let item of res) {
        relativeNotes.push(await chatAIUtils.genCardStructure(item.note))
      }
      MNUtil.stopHUD()
      chatAITool.showHUD("Reading "+relativeNotes.length+" notes...")
      response.result = relativeNotes
      message.response = responsePrefix+JSON.stringify(relativeNotes,undefined,2)
      message.success = true
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      return response
    }
  }
  getRootNote(args) {
    let childMap = MNNote.currentChildMap
    if (childMap) {
      if (args.rootNoteId) {
        let rootNote = MNNote.new(args.rootNoteId)
        if (rootNote) {
          return {
            rootNote:rootNote,
            isChildMap:rootNote.noteId === childMap.noteId
          }
        }else{
          return {
            rootNote:childMap,
            isChildMap:true
          }
        }
      }
    }
    let focusNote = chatAIUtils.getFocusNote()
    if (focusNote) {
      return {
        rootNote:focusNote,
        isChildMap:false
      }
    }
    return undefined
  }
  async organizeNotes(func,args) {
    let response = {}
    let message = {success:true}
      let relatedNotes = []
      /**
       * 
       * @param {MNNote} parentNote 
       * @param {*} tree 
       * @returns 
       */
      function addChildrenDev(parentNote,tree,isRoot = false) {
        let mainNode
        let noteId = ("noteId" in tree) ? tree.noteId : ("id" in tree) ? tree.id : undefined
        let isNewNote = false
        if (noteId) {
          if (chatAIUtils.noteExists(noteId)) {
            mainNode = MNNote.new(noteId)
          }else{
            mainNode = MNNote.new({content:""})
            isNewNote = true
          }
        }else{
          mainNode = MNNote.new({content:""})
          isNewNote = true
        }
        if ("title" in tree) {
          mainNode.noteTitle = tree.title
        }
        if ("color" in tree) {
          mainNode.color = tree.color
        }
        relatedNotes.push(mainNode)
        if (!isRoot && parentNote && (parentNote.noteId !== mainNode.parentNote?.noteId)) {
          parentNote.addChild(mainNode)
        }else if (isRoot && isNewNote) {
          parentNote.addChild(mainNode)
        }
        //如果parentNote不存在，则会添加到主脑图中
        if ("children" in tree && tree.children.length) {
          tree.children.map((child)=>{
            if (typeof child === "string") {
              mainNode.addChild(child)
            }else{
              addChildrenDev(mainNode, child)
            }
          })
        }
      }
      MNUtil.showHUD("Reorganizing notes...")
      let newTrees = args.asts
      let res = this.getRootNote(args)
      let rootNote = res.rootNote
      let isChildMap = res.isChildMap
  
      MNUtil.undoGrouping(()=>{
          newTrees.map(tree=>{
            // addChildren(tree)
            let parsedTree
            switch (typeof tree) {
              case "object":
                // MNUtil.showHUD("object")
                parsedTree = tree
                response.result = JSON.stringify(parsedTree)
                break;
              case "string":
                // MNUtil.showHUD("string")
                response.result = tree
                parsedTree = chatAIUtils.getValidJSON(response.result)
                break;
              default:
                break;
            }
            addChildrenDev(rootNote,parsedTree,true)
          })
          if (!isChildMap && rootNote) {
            rootNote.focusInFloatMindMap(1)
          }
      })
      // MNUtil.delay(0.5).then(()=>{
      //   MNUtil.excuteCommand("EditArrangeNotes")
      // })
      let notesContents = []
      for (let i = 0; i < relatedNotes.length; i++) {
        const note = relatedNotes[i];
        let structure = await chatAIUtils.genCardStructure(note.noteId)
        notesContents.push(structure)
      }
      let tree = chatAIUtils.buildHierarchy(notesContents)
      // MNUtil.copy(newTree)
      message.response = "Notes are organized as follows:\n"+JSON.stringify(tree,undefined,2)
      message.success = true
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
  }
  getNoteConfig(args){
      let title = args.title
      let config = {markdown:true}
      if (title) {
        config.title = title.trim()
      }
      let content = args.content
      // MNUtil.log({message:"addChildNoteBefore",detail:content})
      if (content) {
        content = chatAITool.formatMarkdown(content)
        config.content = content
      }
      if ("html" in args) {
        config.html = args.html
      }
      let tags = args.tags
      if (tags) {
        config.tags = tags
      }
      let color = args.color
      if (color) {
        config.color = color
      }
      return config
  }
  async createNoteFromSelection(func,args){
  try {

    let response = {}
    let message = {success:true}
    let noteId = ""
    MNUtil.undoGrouping(()=>{
      let note = MNNote.fromSelection()
      noteId = note.noteId
      if ("title" in args) {
        note.noteTitle = args.title
      }
      if ("content" in args) {
        note.excerptText = args.content
        note.excerptTextMarkdown = true
      }
      if ("html" in args) {
        note.appendHtmlComment(args.html, args.html, {width:1000,height:500}, "")
      }
      if ("tags" in args) {
        note.appendTextComment(args.tags.map(k => '#'+k.replace(/\s+/g, "_")).join(" "))
      }
      if ("color" in args) {
        note.colorIndex = MNUtil.getColorIndex(args.color)
      }
      if ("parentNoteId" in args && args.parentNoteId) {
        let parent = MNNote.new(args.parentNoteId)
        if (parent) {
          note = parent.addAsChildNote(note)
        }
      }
    })
    // await MNUtil.delay(0.5)
    response.result = noteId
    message.response = "Note is created from selection, with noteId: "+noteId
    message.success = true
    response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
    
  } catch (error) {
    let response = {}
    let message = {success:false}
    chatAIUtils.addErrorLog(error, "createNoteFromSelection")
    message.response = "Failed in create note from selection: "+error.message
    response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
  }
  }
  async createNote(func,args,parentNote = undefined){
    let type = args.type ?? "childNote"
    if (type == "fromSelection") {
      let response = await this.createNoteFromSelection(func,args)
      return response
    }
    let response = {}
    let message = {success:true}
    let title = args.title
      let config = {markdown:true}
      if (title) {
        config.title = title.trim()
      }
      let content = args.content
      // MNUtil.log({message:"addChildNoteBefore",detail:content})
      if (content) {
        content = chatAITool.formatMarkdown(content)
        config.content = content
      }
      // MNUtil.log({message:"addChildNoteAfter",detail:config.content})
      let htmlContent = args.html
      // if (htmlContent) {
      //   config.htmlContent = htmlContent
      // }
      let tags = args.tags
      if (tags) {
        config.tags = tags
      }
      let color = args.color
      if (color) {
        config.color = color
      }
      if ("parentNoteId" in args && args.parentNoteId) {
        parentNote = MNNote.new(args.parentNoteId)
      }
      if (!parentNote) {
        parentNote = MNUtil.currentChildMap
      }else{
        parentNote = parentNote.realGroupNoteForTopicId()
      }
      // MNNote.createChildNote
      response.result = config
      // MNUtil.showHUD("message")
      // MNUtil.copy(htmlContent)
      if (!parentNote) {
        MNUtil.undoGrouping(()=>{
          let note = MNNote.new(response.result)
          if (htmlContent) {
            note.appendHtmlComment(htmlContent, htmlContent, {width:1000,height:500}, "")
          }
          if (MNUtil.mindmapView) {
            note.focusInMindMap(0.5)
          }
          message.response = "note is created"
          message.success = true
        })
      }else{
        MNUtil.undoGrouping(()=>{
          let child = parentNote.createChildNote(response.result,false)
          if (!child) {
            MNUtil.showHUD("❌ Failed in create childNote")
            message.response = "Failed in create childNote"
            message.success = false
          }else{
            try {
              if (htmlContent) {
                child.appendHtmlComment(htmlContent, htmlContent, {width:1000,height:500}, "")
              }
            } catch (error) {
              chatAIUtils.addErrorLog(error, "createNote")
            }
            if (MNUtil.mindmapView) {
              child.focusInMindMap(0.5)
            }
            message.response = "child note is created"
            message.success = false
          }
        })
      }
      message.noteStructure = response.result
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
  }
  /**
   * 
   * @param {array<Object>} editConfigs
   * @param {MNNote} note 
   * @param {boolean} refresh 
   */
  applyEditByConfig(editConfigs,note,refresh = true){
    if (editConfigs.length > 0) {
      const editFunc = (editConfig)=>{
        if ("deleteNote" in editConfig && editConfig.deleteNote) {
          note.delete()
          //没有必要做其他编辑
          return true
        }
        if ("color" in editConfig) {
          note.color = editConfig.color
        }
        if ("excerptText" in editConfig) {
          note.excerptText = editConfig.excerptText
        }
        if ("excerptTextMarkdown" in editConfig) {
          note.excerptTextMarkdown = editConfig.excerptTextMarkdown
        }
        if ("title" in editConfig) {
          note.title = editConfig.title
        }
        if ("tags" in editConfig) {
          note.appendTags(editConfig.tags)
        }
        if ("markdownComment" in editConfig) {
          if ("markdownCommentIndex" in editConfig) {
            note.appendMarkdownComment(editConfig.markdownComment, editConfig.markdownCommentIndex)
          }else{
            note.appendMarkdownComment(editConfig.markdownComment)
          }
        }
        if ("tagsToRemove" in editConfig) {
          note.removeTags(editConfig.tagsToRemove)
        }
      }
      if (refresh) {
        MNUtil.undoGrouping(()=>{
          editConfigs.forEach(editConfig=>{
            editFunc(editConfig)
          })
        })
      }else{
        chatAIUtils.undoGroupingNotRefresh(()=>{
          editConfigs.forEach(editConfig=>{
            editFunc(editConfig)
          })
        })
      }
    }
    return true

  }

  async executeToolbarAction(func,args) {
  try {

    let response = {}
    let message = {success:true}
    if (typeof toolbarUtils === "undefined") {
      MNUtil.showHUD("Please install MN Utils First!")
      return
    }
    let actionKey = args.action
    let actionDes = toolbarConfig.getDescriptionById(actionKey)
    if (!actionDes) {
      message.response = "Action ["+actionKey+"] not found"
      message.success = false
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      MNUtil.showHUD("Action ["+actionKey+"] not found")
      return response
    }
    if (!("action" in actionDes)) {
      message.response = "Missing action"
      message.success = false
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      MNUtil.showHUD("Missing action")
      return response
    }
    MNUtil.log({message:"executeToolbarAction",source:"MN ChatAI",detail:args})
    //支持通过额外参数替换原动作
    let extraArgs = chatAITool.getExtraArgs(args)
    if (Object.keys(extraArgs).length > 0) {
      for (let key of Object.keys(extraArgs)) {
        actionDes[key] = extraArgs[key]
      }
    }
    // let argsToIgnore = ["action","onTrue","onFalse","onFinish","onLongPress"]
    // if ("extraArgs" in args) {
    //   let keys = Object.keys(args.extraArgs).filter((key)=>!argsToIgnore.includes(key))
    //   if (keys.length > 0) {
    //     for (let key of keys) {
    //       actionDes[key] = args.extraArgs[key]
    //     }
    //   }
    // }else if ("config" in args) {
    //   let keys = Object.keys(args.config).filter((key)=>!argsToIgnore.includes(key))
    //   if (keys.length > 0) {
    //     for (let key of keys) {
    //       actionDes[key] = args.config[key]
    //     }
    //   }
    // }else{
    //   let keys = Object.keys(args).filter((key)=>!argsToIgnore.includes(key))
    //   if (keys.length > 0) {
    //     for (let key of keys) {
    //       actionDes[key] = args[key]
    //     }
    //   }
    // }
    if ("onLongPress" in actionDes) {
      delete actionDes.onLongPress
    }
    MNUtil.log({message:"executeToolbarAction",source:"MN ChatAI",detail:actionDes})
    await chatAIUtils._executeToolbarAction(actionDes)
    message.response = "Detail of the successfully executed action ["+actionKey+"] configuration:\n"+JSON.stringify(actionDes,undefined,2)
    message.success = true
    response.toolMessages = chatAITool.genToolMessage(message,func.id)
    // chatAIUtils.log("moveNotes", response)
    return response
    
  } catch (error) {
    let response = {}
    let message = {success:false}
    chatAIUtils.addErrorLog(error, "executeToolbarAction")
    message.response = "Failed in execute toolbar action: "+error.message
    response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
  }
  }
  /**
   * 这里不会真的执行prompt，相当于占位
   * @param {*} func 
   * @param {*} args 
   * @returns 
   */
  async executePrompt(func,args) {
    try {
      let response = {}
      let message = {success:true}
      message.response = "Failed in execute prompt: Can not execute prompt in chat mode, please use the tool in notification mode"
      // let prompt = args.prompt
      // let instruction = args.instruction??""
      // chatAIUtils.ask({promptKey:prompt,instruction:instruction,forceToExecute:true},false)
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      return response
    } catch (error) {
      let response = {}
      let message = {success:false}
      message.response = "Failed in execute prompt: "+error.message
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      return response
    }
  }
  async readImage(func,args) {
    try {
      MNUtil.waitHUD("Reading Image...")
      let response = {}
      let message = {success:true}
      let imageId = args.imageId
      let query = args.query
      if (imageId.startsWith("https://") || imageId.startsWith("http://")) {
        MNUtil.waitHUD("Downloading image...")
        await MNUtil.delay(0)
      }
      let image = chatAIUtils.getImageById(imageId)
      let content = await chatAINetwork.readImage(image,query)
      message.response = "Content of image ["+imageId+"]: \n"+content
      message.success = true
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      MNUtil.stopHUD()
      return response
    } catch (error) {
      let response = {}
      let message = {success:false}
      chatAIUtils.addErrorLog(error, "readImage")
      message.response = "Failed in read image: "+error.message
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      MNUtil.stopHUD()
      return response
    }
  }
  async moveNotes (func,args) {
  try {

    let response = {}
    let message = {success:true}
    let toNote = null
    let toNewNote = false
    let fromNotes = args.fromNoteIds.map((noteId)=>{
      return MNNote.new(noteId)
    })
    if ("toNewNote" in args && args.toNewNote) {
      toNewNote = true
      //放在undoGrouping中创建
    }else if ("toNoteId" in args && args.toNoteId) {
      toNote = MNNote.new(args.toNoteId)
    }else{
      // use the parent note of the first note
      toNote = fromNotes[0].parentNote
    }
    let isParentNoChange = false
    if (toNote) {
      isParentNoChange = fromNotes.every((n)=>{
        return n.parentNoteId === toNote.noteId
      })
    }

      MNUtil.undoGrouping(()=>{
        if (toNewNote) {
          let newNoteConfig = args.toNewNote
          if ("parentNoteId" in newNoteConfig && newNoteConfig.parentNoteId && chatAIUtils.noteExists(newNoteConfig.parentNoteId)) {
            let parentNote = MNNote.new(newNoteConfig.parentNoteId)
            toNote = parentNote.createChildNote(newNoteConfig,false)
          }else if (MNNote.currentChildMap) {
            //在当前子脑图中创建
            toNote = MNNote.currentChildMap.createChildNote(newNoteConfig)
          }else{
            toNote = MNNote.new(newNoteConfig)
          }
        }
        fromNotes.forEach((n)=>{
          toNote.addAsChildNote(n)
        })
      })
      await MNUtil.delay(0.5)
      if (isParentNoChange) {
        message.response = "Order of the child notes:\n["+args.fromNoteIds.join(", ")+"]"
      }else{
        if (toNewNote) {
          message.response = fromNotes.length+" notes are moved as children of new note ["+toNote.noteId+"]"
        }else{
          message.response = fromNotes.length+" notes are moved as children of note ["+toNote.noteId+"]"
        }
      }
      toNote.focusInMindMap(0.5)
      message.success = true
      response.toolMessages = chatAITool.genToolMessage(message,func.id)
      // chatAIUtils.log("moveNotes", response)
      return response
    
  } catch (error) {
    let response = {}
    let message = {success:false}
    chatAIUtils.addErrorLog(error, "moveNotes")
    message.response = "Failed in move notes: "+error.message
    response.toolMessages = chatAITool.genToolMessage(message,func.id)
    return response
  }
  }

  /**
   * 只返回message
   * 不直接编辑卡片，而是返回一个editConfig，用于后续统一编辑
   * @param {Object} args 
   * @param {MNNote} note 
   * @returns {Promise<{success:boolean,response:string,result:any,editConfig:Object}>}
   */
  async _editNote(args,note) {
    let message = {success:true}
    let editConfig = {}
    /**
     * @type {Array<MNNote>} 
     */
    if (args.noteId && chatAIUtils.noteExists(args.noteId)) {
      note = MNNote.new(args.noteId)
    }
      let targetTitle = ""
      let targetContent = ""
      switch (args.action) {
        case "setColor":
          editConfig.color = args.color
          // MNUtil.undoGrouping(()=>{
          //   note.color = args.color
          // })
          message.response = `Color of note [${note.noteId}] has been changed to "${args.color}"`
          break;
        case "setMarkdownStatus":
          if ("markdown" in args) {
            editConfig.excerptTextMarkdown = args.markdown
          }else{
            editConfig.excerptTextMarkdown = false
          }
          if (editConfig.excerptTextMarkdown) {
            message.response = `Markdown Render for content of note [${note.noteId}] has been enabled`
          }else{
            message.response = `Markdown Render for content of note [${note.noteId}] has been disabled`
          }
          break;
        case "replaceContent":
          // chatAIUtils.log("before", {excerptText:note.excerptText,originalContent:args.originalContent,content:args.content})
          let targetString = chatAIUtils.safeReplaceAll(note.excerptText,args.originalContent,args.content)
          // chatAIUtils.log("after", {targetString:targetString})
          editConfig.excerptText = targetString
          if ("markdown" in args) {
            editConfig.excerptTextMarkdown = args.markdown
          }
          // MNUtil.undoGrouping(()=>{
          //   note.excerptText = targetString
          //   if ("markdown" in args) {
          //     note.excerptTextMarkdown = args.markdown
          //   }
          // })
          message.response = `Content of note [${note.noteId}] has been updated as "${targetString}"`
          break;
        case "setTitle":
        case "setTitleWithOptions":
          targetTitle = args.content ?? args.title ?? ""
          if ("titleOptions" in args) {
            let choices = ["Cancel"].concat(args.titleOptions,"Confirm")
            let selectRes = await MNUtil.input("🤖: 请选择要设置的标题","",choices)
            // MNUtil.copy(selectRes)
            if (selectRes.button === 0) {
              message.result = {question:args,confirmed:false}
              message.response = `Title of note [${note.noteId}] has not been changed, user does not make the choice`
              targetTitle = ""
              // MNUtil.copy(message)
            }else if(selectRes.button === choices.length-1){
              message.result = {question:args,confirmed:true,userInput:selectRes.input}
              message.response = `Title of note [${note.noteId}] has been changed to "${selectRes.input}"`
              targetTitle = selectRes.input
            }else{
              message.result = {question:args,confirmed:true,choice:choices[selectRes.button]}
              message.response = `Title of note [${note.noteId}] has been changed to "${choices[selectRes.button]}"`
              targetTitle = choices[selectRes.button]
            }
            // MNUtil.copy(targetTitle)
          }
          if (targetTitle) {
            editConfig.title = targetTitle
            // MNUtil.undoGrouping(()=>{
            //   note.title = targetTitle
            // })
            message.response = `Title of note [${note.noteId}] has been changed to "${targetTitle}"`
            message.success = true
          }else{
            message.success = false
          }
          break;
        case "appendTitle":
          targetTitle = note.title+";"+(args.content ?? args.title ?? "")
          editConfig.title = targetTitle
          // MNUtil.undoGrouping(()=>{
          //   note.title = targetTitle
          // })
          message.response = `Title of note [${note.noteId}] has been changed as "${targetTitle}"`
          message.success = true
          break;
        case "prependTitle":
          targetTitle = (args.content ?? args.title ?? "")+";"+note.title
          editConfig.title = targetTitle
          // MNUtil.undoGrouping(()=>{
          //   note.title = targetTitle
          // })
          message.response = `Title of note [${note.noteId}] has been changed as "${targetTitle}"`
          message.success = true
          break;
        case "clearTitle":
          editConfig.title = ""
          // MNUtil.undoGrouping(()=>{
          //   note.title = ""
          // })
          message.response = `Title of note [${note.noteId}] has been cleared`
          message.success = true
          break;
        case "setContent":
          editConfig.excerptText = chatAITool.formatMarkdown(args.content)
          if ("markdown" in args) {
            editConfig.excerptTextMarkdown = args.markdown
          }
          // MNUtil.undoGrouping(()=>{
          //   let content = chatAITool.formatMarkdown(args.content)
          //   note.excerptText = content
          //   if ("markdown" in args) {
          //     note.excerptTextMarkdown = args.markdown
          //   }
          // })
          message.response = `Note/card content of note [${note.noteId}] has been changed as: "${args.content}"`
          message.success = true
          break;
        case "appendContent":
          targetContent = note.excerptText+"\n"+args.content
          editConfig.excerptText = chatAITool.formatMarkdown(targetContent)
          if ("markdown" in args) {
            editConfig.excerptTextMarkdown = args.markdown
          }
          // MNUtil.undoGrouping(()=>{
          //   note.excerptText = chatAITool.formatMarkdown(targetContent)
          //   if ("markdown" in args) {
          //     note.excerptTextMarkdown = args.markdown
          //   }
          // })
          message.response = `Note/card content of note [${note.noteId}] has been changed as: "${targetContent}"`
          message.success = true
          break;
        case "prependContent":
          targetContent = args.content.trim()+"\n"+note.excerptText
          editConfig.excerptText = chatAITool.formatMarkdown(targetContent)
          if ("markdown" in args) {
            editConfig.excerptTextMarkdown = args.markdown
          }
          // MNUtil.undoGrouping(()=>{
          //   note.excerptText = chatAITool.formatMarkdown(targetContent)
          //   if ("markdown" in args) {
          //     note.excerptTextMarkdown = args.markdown
          //   }
          // })
          message.response = `Note/card content of note [${note.noteId}] has been changed as: "${targetContent}"`
          message.success = true
          break;
        case "clearContent":
          editConfig.excerptText = ""
          // MNUtil.undoGrouping(()=>{
          //   note.excerptText = ""
          // })
          message.response = `Note/card content of note [${note.noteId}] has been cleared`
          message.success = true
          break;
        case "addComment":
          editConfig.markdownComment = chatAITool.formatMarkdown(args.content)
          // MNUtil.undoGrouping(()=>{
          //   note.appendMarkdownComment(chatAITool.formatMarkdown(args.content))
          // })
          message.response = `Add comment to note [${note.noteId}] with content: "${args.content}"`
          message.success = true
          break;
        case "appendComment":
          editConfig.markdownComment = chatAITool.formatMarkdown(args.content)

          // MNUtil.undoGrouping(()=>{
          //   note.appendMarkdownComment(chatAITool.formatMarkdown(args.content))
          // })
          message.response = `Append comment to note [${note.noteId}] with content: "${args.content}"`
          message.success = true
          break;
        case "prependComment":
          editConfig.markdownComment = chatAITool.formatMarkdown(args.content)
          editConfig.markdownCommentIndex = 0
          // MNUtil.undoGrouping(()=>{
          //   note.appendMarkdownComment(chatAITool.formatMarkdown(args.content),0)
          // })
          message.response = `Prepend comment to note [${note.noteId}] with content: "${args.content}"`
          message.success = true
          break;
        case "addTags":
          editConfig.tags = args.tags
          // MNUtil.undoGrouping(()=>{
          //   note.appendTags(args.tags)
          // })
          message.response = `Add tags to note [${note.noteId}]: "${args.tags}"`
          message.success = true
          break;
        case "removeTags":
          if ("tags" in args) {
            editConfig.tagsToRemove = args.tags
            // MNUtil.undoGrouping(()=>{
            //   note.removeTags(args.tags)
            // })
            message.response = `Remove tags from note [${note.noteId}]: "${args.tags}"`
          }else{
            editConfig.tagsToRemove = note.tags
            // MNUtil.undoGrouping(()=>{
            //   note.removeTags(note.tags)
            // })
            message.response = `Remove all tags from note [${note.noteId}]: "${note.tags}"`
          }
          message.success = true
          break;
        case "deleteNote":
          if ("needConfirm" in args && args.needConfirm) {
            let confirmRes = await MNUtil.confirm("🤖: 请确认是否删除当前笔记","",["Cancel","Confirm"])
            if (confirmRes === 0) {
              message.response = `Note [${note.noteId}] is not deleted, user does not confirm`
              message.success = false
            }else{
              editConfig.deleteNote = true
              // MNUtil.undoGrouping(()=>{
              //   note.delete()
              // })
              message.response = `Note [${note.noteId}] is deleted`
              message.success = true
            }
          }else{
            editConfig.deleteNote = true
            // MNUtil.undoGrouping(()=>{
            //   note.delete()
            // })
            message.response = `Note [${note.noteId}] is deleted`
            message.success = true
          }
          break;
        default:
          message.response = `Unspported action: "${args.action}" for note [${note.noteId}]`
          message.success = false
          break;
      }
      // this.applyEditByConfig(editConfig,note,refresh)
      message.editConfig = editConfig
      // chatAIUtils.log("_editNote.message",message)
      return message
  }

  /**
   * 
   * @param {Object} func 
   * @param {Object} args 
   * @param {MNNote} note 
   * @returns {Object}
   */
  async editNote(func,args,note) {
    let response = {}
    if ("noteId" in args) {
      note = MNNote.new(args.noteId)
      if(!note){
        let focusNoteIds = MNNote.getFocusNotes().map(n=>n.noteId)
        let matchNote = focusNoteIds.find(id=>id.includes(args.noteId))
        if(matchNote){
          note = MNNote.new(matchNote)
        }
      }
      if(!note){
        note = MNNote.getFocusNote()
      }
    }
    if (args.action) {//兼容原方法
      let message = await this._editNote(args,note)
      this.applyEditByConfig([message.editConfig], note)
      response.result = message.result
      response.toolMessages = chatAITool.genToolMessage(message, func.id)
      // chatAIUtils.log("editNote.response",response)
      return response
    }
    if (args.actions) {
      let messages = []
      for (const action of args.actions) {
        let message = await this._editNote(action,note)
        messages.push(message)
      }
      this.applyEditByConfig(messages.map(m=>m.editConfig), note)
      // MNUtil.refreshAfterDBChanged()
      // chatAIUtils.log("editNote.messages",messages)
      response.result = messages
      let finalMessage = {success:true}
      finalMessage.response = messages.map((m,index)=>m.response).join("\n")
      // chatAIUtils.log("editNote.finalMessage",finalMessage)
      // chatAIUtils.log("editNote.finalMessage.response",finalMessage.response)
      response.toolMessages = chatAITool.genToolMessage(finalMessage, func.id)
      // chatAIUtils.log("editNote.response",response)
      return response
    }
  }
  /**
 * 
 * @param {MNNote} note 
 * @param {Object} ast 
 */
static AST2Mindmap(note,ast,level = "all") {
try {
  let config = {excerptTextMarkdown: true}
  if ("title" in ast) {
    config.title = ast.title
  }
  if ("content" in ast) {
    config.content = ast.content
  }
  if ("color" in ast) {
    config.color = chatAIUtils.getColorIndex(ast.color)
  }
  if ("tags" in ast) {
    config.tags = ast.tags
  }
  let childNote
  if (!note) {
    if (chatAIUtils.currentSelection.onSelection) {
      childNote = MNNote.fromSelection().realGroupNoteForTopicId()
      MNUtil.excuteCommand("SendToMap")
      childNote.title = config.title
      childNote.excerptText = config.content
      childNote.colorIndex = config.color
    }else{
      childNote = MNNote.new(config)
    }
  }else{
    childNote = note.createChildNote(config,false)
  }
  if (ast.children && ast.children.length) {
    ast.children.forEach((child, index)=>{
      this.AST2Mindmap(childNote,child)
    })
  }else{
    // MNUtil.showHUD("No children found")
  }
  return childNote
  } catch (error) {
  chatAIUtils.addErrorLog(error, "chatAITool.AST2Mindmap",ast)
  return undefined
}

}
  /**
   * Merges multiple consecutive whitespace characters into a single space, except for newlines.
   * 
   * This method processes the input string to replace multiple consecutive whitespace characters
   * (excluding newlines) with a single space. It also ensures that multiple consecutive newlines
   * are reduced to a single newline. The resulting string is then trimmed of any leading or trailing
   * whitespace.
   * 
   * @param {string} str - The input string to be processed.
   * @returns {string} The processed string with merged whitespace.
   */
  static mergeWhitespace(str) {
      if (!str) {
        return "";
      }
      // chatAIUtils.log("before",str)
      // 1. 替换为标准空格
      // 2. 将多个连续的换行符替换为双换行符
      // 3. 将其它空白符（除了换行符）替换为单个空格
      var tempStr = str.replace(/&nbsp;/g, ' ').replace(/\r/g, '\n').replace(/\n+/g, '\n\n').trim()
      return tempStr;
  }
/**
 * 修复 Markdown 文本中的行间公式格式，确保所有 $$...$$ 块独占一行。
 * - 行间公式（$$...$$）前后会被添加换行符，使其成为单独一行。
 * - 内联公式（$...$）和其他内容保持不变。
 * - 智能处理边界情况（文本开头/结尾、已有换行符等），避免多余空行。
 *
 * @param {string} markdown - 输入的 Markdown 文本
 * @return {string} 修复后的 Markdown 文本
 */
static fixDisplayMathNewlines(markdown) {
  return markdown.replace(/\$\$[\s\S]*?\$\$/g, function(match, offset, string) {
    // 检查匹配块前是否需要换行
    let prefix = '';
    if (offset > 0) {
      const prevChar = string.charAt(offset - 1);
      if (prevChar !== '\n' && prevChar !== '\r') { // 处理 \n 和 \r\n 场景
        prefix = '\n';
      }
    }
    
    // 检查匹配块后是否需要换行
    const endIdx = offset + match.length;
    let suffix = '';
    if (endIdx < string.length) {
      const nextChar = string.charAt(endIdx);
      if (nextChar !== '\n' && nextChar !== '\r') { // 处理 \n 和 \r\n 场景
        suffix = '\n';
      }
    }
    
    return prefix + match + suffix;
  });
}

/**
 * 修复 Markdown 文本。
 * @param {string} markdownText - 包含格式问题的 Markdown 文本。
 * @returns {string} - 格式修正后的 Markdown 文本。
 */
static formatMarkdown(markdownText) {
  // chatAIUtils.log("1", markdownText)
  // 1. 首先，全局替换所有的 &nbsp; 为标准空格。
  let correctedText = markdownText
      .replace(/&nbsp;/g, ' ')
      .replace(/\\\[/g, '\n$$$') // Replace display math mode delimiters
      .replace(/\\\]/g, '$$$\n') // Replace display math mode delimiters
      .replace(/(\\\(\s?)|(\s?\\\))/g, '$') // Replace inline math mode opening delimiter;
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')//三个以上换行符替换为两个
      .trim()
  // chatAIUtils.log("2", correctedText)
  correctedText = this.fixDisplayMathNewlines(correctedText)
  return correctedText
  // chatAIUtils.log("3", correctedText)
  // // 2. 将文本按行分割成数组，以便逐行处理。
  // const lines = correctedText.split('\n');

  // // 3. 遍历每一行，修正列表项的格式。
  // const formattedLines = lines.map(line => {
  //   // 使用正则表达式匹配以可选空格开头，后跟一个短横线 (-) 的行。
  //   // \s* : 匹配行首的任意个空格（处理缩进）。
  //   // -     : 匹配列表标记符“-”。
  //   // \s* : 匹配“-”后面可能存在或缺失的空格。
  //   // (.*)  : 捕获该行剩余的全部内容（即列表的文本）。
  //   const listRegex = /^\s*-\s*(.*)$/;

  //   // 如果当前行匹配列表项的格式
  //   if (listRegex.test(line)) {
  //     // 就将其替换为标准格式：“  - 文本内容”
  //     // 这里我们统一使用两个空格作为缩进，并在“-”后加一个空格。
  //     return line.replace(listRegex, '  - $1');
  //   }
    
  //   // 如果不是列表项，则保持原样。
  //   return line;
  // });
  // chatAIUtils.log("3", formattedLines.join('\n'))

  // // 4. 将处理好的各行重新用换行符连接成一个完整的字符串。
  // return formattedLines.join('\n');
}

/**
 * 修复包含非标准空格和格式错误的 Markdown 无序列表。
 * @param {string} markdownText - 包含格式问题的 Markdown 文本。
 * @returns {string} - 格式修正后的 Markdown 文本。
 */
static formatMarkdownList(markdownText) {
  // 1. 首先，全局替换所有的 &nbsp; 为标准空格。
  let correctedText = markdownText.replace(/&nbsp;/g, ' ').replace(/\frac/g, '\\frac').replace(/\x08egin/, "\\begin").replace(/\right/, "\\right");

  // 2. 将文本按行分割成数组，以便逐行处理。
  const lines = correctedText.split('\n');

  // 3. 遍历每一行，修正列表项的格式。
  const formattedLines = lines.map(line => {
    // 使用正则表达式匹配以可选空格开头，后跟一个短横线 (-) 的行。
    // \s* : 匹配行首的任意个空格（处理缩进）。
    // -     : 匹配列表标记符“-”。
    // \s* : 匹配“-”后面可能存在或缺失的空格。
    // (.*)  : 捕获该行剩余的全部内容（即列表的文本）。
    const listRegex = /^\s*-\s*(.*)$/;

    // 如果当前行匹配列表项的格式
    if (listRegex.test(line)) {
      // 就将其替换为标准格式：“  - 文本内容”
      // 这里我们统一使用两个空格作为缩进，并在“-”后加一个空格。
      return line.replace(listRegex, '  - $1');
    }
    
    // 如果不是列表项，则保持原样。
    return line;
  });

  // 4. 将处理好的各行重新用换行符连接成一个完整的字符串。
  return formattedLines.join('\n');
}
static getLoadingHTML(content = "loading"){
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>正在加载...</title>
    <style>
        /* 整体页面样式 */
        body, html {
            height: 100%;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f0f0f0; /* 背景颜色可以按需修改 */
            font-family: Arial, sans-serif;
        }

        /* 加载容器样式 */
        .loading-container {
            text-align: center;
        }

        /* 旋转动画 */
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #ccc; /* 圈的颜色 */
            border-top: 5px solid #3498db; /* 旋转部分的颜色 */
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px auto; /* 居中并与文字拉开距离 */
        }

        /* 定义旋转动画 */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* “loading” 文字样式 */
        .loading-text {
            font-size: 20px;
            color: #555;
        }
    </style>
</head>
<body>

    <div class="loading-container">
        <div class="spinner"></div>
        <div class="loading-text">${content}</div>
    </div>

</body>
</html>`
}
renderEditNote(args,moreIndent = false){
  let indent = moreIndent ? "      " : "  "
    switch (args.action) {
          case "setMarkdownStatus":
            if ("markdown" in args) {
              if (args.markdown) {
                return `\n${indent}Markdown Render Enabled: true\n`
              }
              return `\n${indent}Markdown Render Enabled: false\n`
            }
            return ""
          case "setColor":
            if (args.color) {
              return `\n${indent}color: ${args.color}\n`
            }
            return ""
          case "replaceContent":
            if ("markdown" in args) {
              return `\n${indent}From: ${args.originalContent??""}
${indent}To: ${args.content??""}
${indent}Markdown: ${args.markdown}\n`
}
              return `\n${indent}From: ${args.originalContent??""}
${indent}To: ${args.content??""}\n`
          case "setTitle":
            if (args.content && args.content.trim() !== "") {
              return `\n${indent}Title: ${args.content ?? args.title ?? ""}\n`
            }
            return `\n${indent}Title: {{emptyContent}}\n`
          case "setTitleWithOptions":
            if (args.titleOptions) {
              let optionsString = args.titleOptions.map((option,index)=>`  ${index+1}. ${option}`).join("\n")
              return `\n${optionsString}\n`
            }
            return ""
          case "appendTitle":
            if (args.content) {
              return `\n${indent}Title: ${args.content ?? args.title ?? ""}\n`
            }
            return ""
          case "prependTitle":
            if (args.content) {
              return `\n${indent}Title: ${args.content ?? args.title ?? ""}\n`
            }
            return ""
          case "clearTitle":
            return ""
          case "setContent":

            if (args.content) {
              if ("markdown" in args && args.markdown) {
                return `\n${indent}Markdown: ${args.content}\n`
              }
              return `\n${indent}Content: ${args.content}\n`
            }
            return ""
          case "appendContent":
            if (args.content) {
              if ("markdown" in args && args.markdown) {
                return `\n${indent}Markdown: ${args.content}\n`
              }
              return `\n${indent}Content: ${args.content}\n`
            }
            return ""
          case "prependContent":
            if (args.content) {
              if ("markdown" in args && args.markdown) {
                return `\n${indent}Markdown: ${args.content}\n`
              }
              return `\n${indent}Content: ${args.content}\n`
            }
            return ""

          case "clearContent":
            return ""
          case "appendComment":
            if (args.content) {
              return `\n${indent}Content: ${args.content}\n`
            }
            return ""
          case "prependComment":
            if (args.content) {
              return `\n${indent}Content: ${args.content}\n`
            }
            return ""
          case "addTags":
            if (args.tags) {
              return `\n${indent}Tags: ${args.tags.join("\n")}\n`
            }
            return ""
          case "removeTags":
            if (args.tags) {
              return `\n${indent}Tags: ${args.tags.join("\n")}\n`
            }
            return ""
          case "deleteNote":
            return ""
          default:
            return ""
        }
}
codifyToolCall (args,force = false) {
try {
  let noteIdString = ""
  let funcName = this.name
  // MNUtil.copy(funcName)
  switch (funcName) {
    case "executeAction":
      if (args.action && args.action in chatAITool.toolbarActionConfigs) {
        let actionName = chatAITool.toolbarActionConfigs[args.action].name
        if (actionName) {
          let extraArgs = chatAITool.getExtraArgs(args)
          if (Object.keys(extraArgs).length > 0) {
            let extraArgsString = JSON.stringify(extraArgs,undefined,2).replace(/\n/g, '\n  ')
            return `🔨 executeAction(
  Name: ${actionName}
  ExtraArgs: ${extraArgsString}
)\n`
          }
//           if ("extraArgs" in args) {
//             return `🔨 executeAction(
//   Name: ${actionName}
//   ExtraArgs: 
//   ${JSON.stringify(args.extraArgs,undefined,2).replace(/\n/g, '\n  ')}
// )\n`
//           }
          return `🔨 executeAction(
  Name: ${actionName}
)\n`
        }
      }
      return `🔨 ${funcName}("${args.action}")\n`
    case "executePrompt":
      if (args.prompt) {
        let promptKey = args.prompt
        let prompt = (promptKey in chatAIConfig.getConfig("promptNames"))? chatAIConfig.prompts[args.prompt].title:promptKey
        if (args.instruction) {
          return `🔨 ${funcName}(
  Prompt: ${prompt}
  Instruction: ${args.instruction}
)\n`
        }
        return `🔨 ${funcName}(
  Prompt: ${prompt}
)\n`
      }
      return `🔨 ${funcName}()\n`
    case "setTitle":
      if (args.title) {
        return `🔨 ${funcName}("${MNUtil.mergeWhitespace(args.title)}")\n`
      }
      return `🔨 ${funcName}()\n`
    case "createMermaidChart":
      let content = args?.content?.trim() ?? ""
      content = chatAIUtils.replaceLtInLatexBlocks(content)
      MNUtil.postNotification("snipasteMermaid", {content:content})
      return `🔨 ${funcName}(\n${content}\n)\n`
    case "createHTML":
      let fixedArgs = this.fixHtmlArgs(args)
      let htmlConfig = {}
      if (fixedArgs.html) {
        htmlConfig.html = fixedArgs.html.length
      }
      if (fixedArgs.css) {
        htmlConfig.css = fixedArgs.css.length
      }
      let fullHtml = this.getFullHTML(fixedArgs)
      if (fullHtml) {
        if (htmlConfig.css) {
          MNUtil.postNotification("snipasteHtml", {html:fullHtml,force:force})
        }else{
          MNUtil.postNotification("snipasteHtml", {html:fullHtml,force:force,needScrollToBottom:true})
        }
      }else{
        MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML()})
      }
      // MNUtil.copy(args)
      return `🔨 ${funcName}(${JSON.stringify(htmlConfig)})\n`
    case "generateImage":
      // MNUtil.postNotification("snipasteHtml", {html:chatAITool.getLoadingHTML()})
      if (args.prompt) {
        this.preContent = args.prompt.trim()
        return `🔨 ${funcName}("${args.prompt.trim()}")\n`
      }
      if (this.preContent) {
        return `🔨 ${funcName}("${this.preContent}")\n`
      }
      return `🔨 ${funcName}()\n`
    case "addComment":
      if (args.comment) {
        return `🔨 ${funcName}("${MNUtil.mergeWhitespace(args.comment)}")\n`
      }
      return `🔨 ${funcName}()\n`
    case "addTag":
      if (args.tag) {
        return `🔨 ${funcName}("${MNUtil.mergeWhitespace(args.tag)}")\n`
      }
      return `🔨 ${funcName}()\n`
    case "copyMarkdownLink":
      if (args.title) {
        return `🔨 ${funcName}("${MNUtil.mergeWhitespace(args.title)}")\n`
      }
      return `🔨 ${funcName}()\n`
    case "copyCardURL":
      return `🔨 ${funcName}()\n`
    case "copyText":
      if (args.text) {
        return `🔨 ${funcName}("${MNUtil.mergeWhitespace(args.text)}")\n`
      }
      return `🔨 ${funcName}()\n`
    case "close":
      return `🔨 ${funcName}()\n`
    case "clearExcerpt":
      return `🔨 ${funcName}()\n`
    case "setExcerpt":
      if (args.excerpt) {
        this.preContent = args.excerpt.trim()
        return `🔨 ${funcName}("${this.preContent}")\n`
      }
      if (this.preContent) {
        // MNUtil.log("Using precontent")
        return `🔨 ${funcName}("${this.preContent}")\n`
      }
      return `🔨 ${funcName}()\n`
    case "readDocument":
      let currentDocName = MNUtil.getFileName(MNUtil.currentDocController.document.pathFile)
      return `🔨 ${funcName}("${currentDocName}")\n`
    case "readNotes":
      if ("noteIds" in args ) {
        if (!args.noteIds) {
          return `🔨 readNotes.byId()\n`
        }
        if (args.noteIds.length === 1) {
          return `🔨 readNote.byId(
  ${args.noteIds[0]}
)\n`
        }
        return `🔨 readNotes.byIds(
  ${args.noteIds.join(",\n  ")}
)\n`
      }else{
        if (args.range) {
          switch (args.range) {
            case "focusedNotes":
              return `🔨 readFocusedNotes()\n`
            case "allNotesInMindmap":
              return `🔨 readAllNotesInMindmap()\n`
            default:
              break;
          }
        }
      }
      return `🔨 readNotes()\n`
    case "webSearch":
      return `🔨 ${funcName}("${args.question}")\n`
    case "readParentNote":
      if ("noteId" in args && args.noteId) {
        return `🔨 readParentNote.byId(
  ${args.noteId}
)\n`
      }
      return `🔨 ${funcName}()\n`
      // let pre = `${funcName}(\n`
      // if (args.title) {
      //   pre = pre+`"${MNUtil.mergeWhitespace(args.title)}"`
      //   if (args.content) {
      //     pre = pre+",\n"
      //   }
      // }
      // if (args.content) {
      //   pre = pre+`"${args.content.trim()}"`
      // }
      // pre = pre+`\n)\n`
      // return pre
    case "organizeNotes":
      if (args.asts) {
        let asts = []
        args.asts.forEach(ast=>{
          if (typeof ast === "object") {
            asts.push(ast)
          }else{
            asts.push(chatAIUtils.getValidJSON(ast))
          }
        })
        asts = asts.filter(ast=>Object.keys(ast).length > 0)
        if (asts.length === 1) {
          return `🔨 ${funcName}(${JSON.stringify(asts[0],undefined,2)})\n`
        }
        return `🔨 ${funcName}(${JSON.stringify(asts,undefined,2)})\n`
        }
      return `🔨 ${funcName}()\n`
    case "createMindmap":
      if (args.ast) {
        // MNUtil.showHUD(typeof args.ast)
        // MNUtil.log({message:"codifyToolCall.createMindmap",detail:this.preContent})
        let ast
        switch (typeof args.ast) {
          case "object":
            ast = args.ast
            let stringified = JSON.stringify(ast,undefined,2)
            if (stringified.length > this.preContent.length) {
              this.preContent = stringified
              this.tem.push(`🔨 ${funcName}(${stringified})\n`)
              return `🔨 ${funcName}(${stringified})\n`
            }
            this.tem.push(`🔨 ${funcName}(${this.preContent})\n`)
            return `🔨 ${funcName}(${this.preContent})\n`
          case "string":
            ast = chatAIUtils.getValidJSON(args.ast)
            if(ast){
              let stringified = JSON.stringify(ast,undefined,2)
              if (stringified.length > this.preContent.length) {
                this.preContent = stringified
                this.tem.push(`🔨 ${funcName}(${stringified})\n`)
                return `🔨 ${funcName}(${stringified})\n`
              }
              this.tem.push(`🔨 ${funcName}(${this.preContent})\n`)
              return `🔨 ${funcName}(${this.preContent})\n`
            }
            this.tem.push(`🔨 ${funcName}(${this.preContent})\n`)
            return `🔨 ${funcName}(${this.preContent})\n`
          default:
            this.tem.push(`🔨 ${funcName}(${this.preContent})\n`)
            return `🔨 ${funcName}(${this.preContent})\n`
        }
      }else{
        // MNUtil.showHUD("Missing arguments: ast")
        return `🔨 ${funcName}(${this.preContent})\n`
      }
    case "editNote":
      let editAction = {}
      if (args.actions) {
        let numberOfActions = Object.keys(args.actions).length
        if (numberOfActions === 0) {
          return `🔨 ${funcName}()\n`
        }
        if (numberOfActions === 1) {
          editAction = args.actions[0]
          editAction.noteId = args.noteId
        }else{
          noteIdString = args.noteId ? `\n   📝 id: ${args.noteId}` : ""
          let argsString = args.actions.map((action,index)=>`   ${chatAIUtils.emojiIndices[index]} ${action.action}:`+this.renderEditNote(action,true)).join("")
          return `🔨 editNote.multipleEdits(${noteIdString}
${argsString})\n`
        }
      }else{
        editAction = args
      }
      if (editAction && editAction.action) {
        noteIdString = editAction.noteId ? `\n  noteId: ${editAction.noteId}` : ""
        let argsString = this.renderEditNote(editAction)
        switch (editAction.action) {
          case "setMarkdownStatus":
            return `🔨 editNote.setMarkdownStatus(${noteIdString}${argsString})\n`
          case "setColor":
            return `🔨 editNote.setColor(${noteIdString}${argsString})\n`
          case "replaceContent":
            return `🔨 editNote.replace(${noteIdString}${argsString})\n`
          case "setTitle":
            return `🔨 editNote.setTitle(${noteIdString}${argsString})\n`
          case "setTitleWithOptions":
            return `🔨 editNote.setTitleWithOptions(${noteIdString}${argsString})\n`
          case "appendTitle":
            return `🔨 editNote.appendTitle(${noteIdString}${argsString})\n`
          case "prependTitle":
            return `🔨 editNote.prependTitle(${noteIdString}${argsString})\n`
          case "clearTitle":
            return `🔨 editNote.clearTitle(${noteIdString}${argsString})\n`
          case "setContent":
            return `🔨 editNote.setContent(${noteIdString}${argsString})\n`
          case "appendContent":
            return `🔨 editNote.appendContent(${noteIdString}${argsString})\n`
          case "prependContent":
            return `🔨 editNote.prependContent(${noteIdString}${argsString})\n`
          case "clearContent":
            return `🔨 editNote.clearContent(${noteIdString})\n`
          case "appendComment":
            return `🔨 editNote.appendComment(${noteIdString}${argsString})\n`
          case "prependComment":
            return `🔨 editNote.prependComment(${noteIdString}${argsString})\n`
          case "addTags":
            return `🔨 editNote.addTags(${noteIdString}${argsString})\n`
          case "removeTags":
            return `🔨 editNote.removeTags(${noteIdString}${argsString})\n`
          case "deleteNote":
            return `🔨 editNote.deleteNote(${noteIdString})\n`
          default:
            if (editAction.action) {
              return `🔨 editNote.${editAction.action}(${noteIdString}\n)\n`
            }
            return `🔨 ${funcName}(${JSON.stringify(editAction,undefined,2)})\n`
        }
      }
      return `🔨 ${funcName}()\n`
    case "knowledge":
      if (args.action) {
        switch (args.action) {
          case "getKnowledge":
            return `🔨 knowledge.get()`
          case "appendKnowledge":
            if (args.content) {
              return `🔨 knowledge.append(
  ${args.content}
)\n`
            }
            return `🔨 knowledge.append()\n`
          case "overwriteKnowledge":
            if (args.content) {
              return `🔨 knowledge.overwrite(
  ${args.content}
)\n`
            }
            return `🔨 knowledge.overwrite()\n`
          case "clearKnowledge":
            return `🔨 knowledge.clear()\n`
          default:
            break;
        }
      }
      return `🔨 ${funcName}()\n`
    case "createNote":
      let type = args.type ?? "childNote"
      let func = type == "childNote" ? "createChildNote" : "createNote.fromSelection"
      noteIdString = args.parentNoteId ? `\n  parent: ${args.parentNoteId}` : ""
      let titleString = args.title ? `\n  title: ${args.title}` : ""
      let tagsString = args.tags ? `\n  tags: ${args.tags.join(", ")}` : ""
      let colorString = args.color ? `\n  color: ${args.color}` : ""
      if (args.content) {
        let contentString = args.content ? `\n  content: ${args.content}` : ""
        return `🔨 ${func}(${noteIdString}${titleString}${tagsString}${colorString}${contentString}
)\n`
      }
      if (args.html) {
        let htmlString = args.html ? `\n  html: ${args.html}` : ""
        return `🔨 ${func}(${noteIdString}${titleString}${tagsString}${colorString}${htmlString}
)\n`
      }
      return `🔨 ${func}(${noteIdString}${titleString}${tagsString}${colorString})\n`


    case "UnkonwFunc":
      MNUtil.showHUD("Unknown function: "+funcName)
      return `🔨 ${funcName}()\n`
    default:
      if (args && Object.keys(args).length > 0) {
        this.preContent = JSON.stringify(args,undefined,2)
        return `🔨 ${funcName}(${this.preContent})\n`
      }
      return `🔨 ${funcName}(${this.preContent})\n`
  }
  
} catch (error) {
  chatAIUtils.addErrorLog(error, "chatAITool.codifyToolCall",args)
  return `🔨 ${funcName}()\n`
}
}
genErrorInMissingArguments(arg,funcId) {
  // MNUtil.copy(arg)
  MNUtil.showHUD("Missing arguments: "+arg)
  let response = {
    toolMessages: chatAITool.genToolMessage("Execution failed! The arguments ["+arg+"] for function "+this.name+" is not provided!",funcId),
    description: "Error in "+this.name+"(): Missing arguments: "+arg+"\n"
  }
  return response
}
genErrorInEmptyArguments(arg,funcId) {
  MNUtil.showHUD("Empty content in arguments: "+arg)
  let response = {
    toolMessages: chatAITool.genToolMessage("Execution failed! The content of arguments ["+arg+"] for function "+this.name+" is empty!",funcId),
    description: "Error in "+this.name+"(): Empty content in arguments: "+arg+"\n"
  }
  return response
}
genErrorInNoNote(funcId) {
  MNUtil.showHUD("Unavailable")
  let response = {
    toolMessages: chatAITool.genToolMessage("Execution failed! There is no note selected",funcId),
    description: "Error in "+this.name+"(): There is no note selected\n"
  }
  return response
}
fixHtmlArgs(args){
  if (args.html) {
    this.preHtml = args.html
  }else if (this.preHtml) {
    args.html = this.preHtml
  }
  if (args.css) {
    this.preCSS = args.css
  }else if (this.preCSS){
    args.css = this.preCSS
  }
  return args
}
getFullMermaindHTML(content) {
  // 对 content 中的反引号和反斜杠进行转义，以安全地插入到 <script> 块中
  const escapedContent = content
    .replace(/\\/g, '\\\\') // 1. 转义反斜杠
    .replace(/`/g, '\\`')   // 2. 转义反引号
    .replace(/\$/g, '\\$');  // 3. 转义美元符号
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自适应大小的 Mermaid 图表</title>
    <script src="https://vip.123pan.cn/1836303614/dl/cdn/mermaid.js" defer></script>
    <style>
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden; 
        }

        #mermaid-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px; 
            box-sizing: border-box;
        }

        #mermaid-container svg {
            /* * SVG 在 viewBox 属性的帮助下，会保持其原始长宽比，
             * 同时缩放到适应这个 100% 的容器尺寸。
             */
            width: 100%;
            height: 100%;
        }
        /* 加载容器样式 */
        .loading-container {
            text-align: center;
        }

        /* 旋转动画 */
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #ccc; /* 圈的颜色 */
            border-top: 5px solid #3498db; /* 旋转部分的颜色 */
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px auto; /* 居中并与文字拉开距离 */
        }

        /* 定义旋转动画 */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* “loading” 文字样式 */
        .loading-text {
            font-size: 20px;
            color: #555;
        }
    </style>
</head>
<body>

    <div id="mermaid-container">
      <div class="loading-container">
          <div class="spinner"></div>
          <div class="loading-text">loading</div>
      </div>
    </div>

    <script>
      // 监听 DOMContentLoaded 事件
      document.addEventListener('DOMContentLoaded', function () {

        mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict'
        });

        // 尝试使用一个更复杂的图表来观察缩放效果
        const mermaidContent = \`${escapedContent}\`;

        const container = document.getElementById('mermaid-container');

        mermaid.render('mermaid-graph', mermaidContent).then(({ svg, bind }) => {
            
            container.innerHTML = svg;
            const svgElement = container.querySelector('svg');

            if (svgElement) {
                // 移除这些属性，让 CSS 来控制大小
                svgElement.removeAttribute('width');
                svgElement.removeAttribute('height');
                svgElement.removeAttribute('style');
            }
            
            if (bind) {
                bind(container);
            }
        });
      })
    </script>
</body>
</html>`
}

/**
 * 自动补全不完整的HTML字符串，关闭所有未闭合的标签。
 * @param {string} htmlString - 可能不完整的HTML字符串。
 * @returns {string} - 经过补全的、格式正确的HTML字符串。
 */
autoCompleteHtml(htmlString) {
  if (typeof htmlString !== 'string') {
    console.error("Input must be a string.");
    return "";
  }

  // 1. 定义一个栈来追踪开放的标签
  const stack = [];

  // 2. 定义HTML5中的自闭合标签（void elements），这些标签不需要闭合
  const selfClosingTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 
    'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  // 3. 使用正则表达式匹配所有的HTML标签（包括开标签和闭标签）
  // 正则表达式解释:
  // <                    - 匹配左尖括号
  // (\/?)                - 捕获组1: 匹配一个可选的斜杠 (用于判断是开标签还是闭标签)
  // ([a-zA-Z0-9]+)       - 捕获组2: 匹配标签名 (如 div, p, span)
  // (?: [^>'"\s]*         - 非捕获组: 匹配属性部分, 允许各种字符
  //      (?:
  //        "[^"]*"       - 匹配双引号属性值
  //        |'[^']*'      - 或单引号属性值
  //        |[^>'"\s]+    - 或没有引号的属性值
  //      )
  //    )*
  // )*                     - ...以上属性部分可以重复多次
  // \s*(\/?)              - 捕获组3: 匹配一个可选的斜杠 (用于自闭合标签的结尾, 如 <br />)
  // >                    - 匹配右尖括号
  const tagRegex = /<(\/?)([a-zA-Z0-9]+)([^>]*?)>/g;

  let match;
  while ((match = tagRegex.exec(htmlString)) !== null) {
    const isClosingTag = match[1] === '/';
    const tagName = match[2].toLowerCase();
    
    // 如果是自闭合标签，则直接跳过，不进行入栈出栈操作
    if (selfClosingTags.has(tagName)) {
      continue;
    }
    
    if (isClosingTag) {
      // 遇到闭标签，如果栈顶元素匹配，则出栈
      if (stack.length > 0 && stack[stack.length - 1] === tagName) {
        stack.pop();
      }
    } else {
      // 遇到开标签，入栈
      stack.push(tagName);
    }
  }

  // 4. 遍历结束后，栈中剩下的就是未闭合的标签
  //    从栈顶开始依次弹出，生成闭合标签字符串
  let closingTags = '';
  while (stack.length > 0) {
    const tagToClose = stack.pop();
    closingTags += `</${tagToClose}>`;
  }

  // 5. 将生成的闭合标签追加到原始字符串末尾
  return htmlString + closingTags;
}
_getFullHTML(args){
let cssString = ""
// let scrollScript = `<script>
//   window.scrollTo(0, document.body.scrollHeight);
// </script>`
let scrollScript = ``
if (args.css) {
  cssString = `<style>
  ${args.css}
</style>`
  scrollScript = ""
}
let fullHtml = `<!DOCTYPE html>
<style>body{padding: 0 !important;}main{padding-left: 0 !important;\npadding-right: 0 !important;\npadding-bottom: 0 !important;}</style>
<html lang="zh-cmn-Hans" style="height: 0px;">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
    <script src=https://cdn.tailwindcss.com/3.4.16></script>
    <link href=https://cdn.bootcdn.net/ajax/libs/font-awesome/6.4.0/css/all.min.css rel=stylesheet>
    ${cssString}
</head>
<body>
${this.autoCompleteHtml(args.html)}
</body>
${scrollScript}
</html>`
return fullHtml
}

getFullHTML(args){
    if (args.html) {
      if (args.css) {
        if (args.html.startsWith(`<!DOCTYPE html>`) || args.html.startsWith(`<!doctype html>`)) {
          let fullHtml = args.html.replace(" html>",` html>\n<style>\nbody{padding: 0 !important;}\nmain{padding-left: 0 !important;\npadding-right: 0 !important;\npadding-bottom: 0 !important;}\n${args.css}\n</style>`)
          return fullHtml
        }else{
          let fullHtml = this._getFullHTML(args)
          return fullHtml
        }
      }else{
        if (args.html.startsWith(`<!DOCTYPE html>`) || args.html.startsWith(`<!doctype html>`)) {
          let fullHtml =  args.html.replace(" html>",` html>\n<style>\nbody{padding: 0 !important;}\nmain{padding-left: 0 !important;\npadding-right: 0 !important;\npadding-bottom: 0 !important;}\n</style>`).replace("</body>","</body><script>window.scrollTo(0, document.body.scrollHeight);</script>")
          return fullHtml
        }else{
          let fullHtml = this._getFullHTML(args)
          return fullHtml
        }
      }
    }else{
      return undefined
    }

}
  static getExtraArgs(args){
    let argsToIgnore = ["action","onTrue","onFalse","onFinish","onLongPress"]
    let extraArgs = {}
    if ("extraArgs" in args) {
      let keys = Object.keys(args.extraArgs).filter((key)=>!argsToIgnore.includes(key))
      if (keys.length > 0) {
        for (let key of keys) {
          extraArgs[key] = args.extraArgs[key]
        }
      }
    }else if ("config" in args) {
      let keys = Object.keys(args.config).filter((key)=>!argsToIgnore.includes(key))
      if (keys.length > 0) {
        for (let key of keys) {
          extraArgs[key] = args.config[key]
        }
      }
    }else{
      let keys = Object.keys(args).filter((key)=>!argsToIgnore.includes(key))
      if (keys.length > 0) {
        for (let key of keys) {
          extraArgs[key] = args[key]
        }
      }
    }
    return extraArgs
  }
  static _toolConfig = undefined
  static get toolConfig(){
    if (this._toolConfig !== undefined) {
      return this._toolConfig
    }
    let toolConfig = {
      "setTitle":{
        needNote:true,
        toolTitle: "📝   Set Title",
        args:{
          title:{
            type:"string",
            description:"title that should be set for this note, pure text only"
          }
        },
        description:"this function is used to set title for a note."
      },
      "addComment":{
        needNote:true,
        toolTitle: "💬   Add Comment",
        args:{
          comment:{
            type:"string",
            description:"comment that should be added for this note, pure text only"
          }
        },
        description:"this function is used to add comment for a note"
      },
      "addTag":{
        needNote:true,
        toolTitle: "🏷️   Add Tag",
        args:{
          tag:{
            type:"string",
            description:"tag that should be added for this note, no hyphen is allowed"
          }
        },
        description:"this function is used to add tag for a note"
      },
      "copyMarkdownLink":{
        needNote:true,
        toolTitle: "🔗   Copy Markdown Link",
        args:{
          title:{
            type:"string",
            description:"title for markdown link, pure text only"
          }
        },
        description:"this function is used to copy markdown link for a note, only title is required"
      },
      "copyCardURL":{
        needNote:true,
        toolTitle: "🔗   Copy Card URL",
        args:{},
        description:"this function is used to copy card url, do not pass any argument"
      },
      "copyText":{
        needNote:false,
        toolTitle: "📋   Copy Text",
        args:{
          text:{
            type:"string",
            description:"text that need to be copied"
          }
        },
        description:"this function can copy any pure text, but not card link"
      },
      "close":{
        needNote:false,
        toolTitle: "🔨   Close",
        args:{},
        description:"this function is used to close current conversation, do not pass any argument"
      },
      "readDocument":{
        needNote:false,
        toolTitle: "🔨   Read Doc",
        args:{},
        description:"this function is used to read document, do not pass any argument"
      },
      "readNotes":{
        needNote:false,
        toolTitle: "🔨   Read Notes",
        args:{
          range:{
            type:"string",
            enum:["focusedNotes","allNotesInMindmap","noteIds"],
            description:"optional, range of notes to read, default is `focusedNotes`"
          },
          noteIds:{
            type:"array",
            items: {
              type:"string",
              description:"noteId formated as xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx, or noteURL formated as `marginnote4app://note/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`"
            },
            description:"optional, use this argument to read notes by note ids, only valid when range is `noteIds`"
          }
        },
        required:[],
        description:"this function is used to read focus notes/cards, also called selected notes/cards, do not pass any argument"
      },
      "readParentNote":{
        needNote:false,
        toolTitle: "🔨   Read ParentNote",
        args:{
          noteId:{
            type:"string",
            description:"optional, noteId formated as xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx, or noteURL formated as `marginnote4app://note/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`. If not provided, the parent note/card of current note/card will be read"
          }
        },
        description:"this function is used to read parent note/card of current note/card or note/card specified by noteId"
      },
      "webSearch":{
        needNote:false,
        toolTitle: "🌐   Web Search",
        args:{
          question:{
            type:"string",
            description:"question that need to be searched, pure text only"
          }
        },
        description:"this function is used to retrieve informations needed from web as reference"
      },
      "clearExcerpt":{
        needNote:true,
        toolTitle: "🔨   Clear Excerpt",
        args:{},
        description:"this function is used to clear excerpt for a note, do not pass any argument."
      },
      "setExcerpt":{
        needNote:true,
        toolTitle: "📝   Set Excerpt",
        args:{
          excerpt:{
            type:"string",
            description:`content that should be set for this note, in markdown format, which supports HTML tags like "span", "p", "div", "font", "u", "small", "big", "mark", "sup", "sub", "center" and etc. For example, this span tag change the color of the word "reveals" to red: <span style="background-color: red;">reveals</span>`
          }
        },
        description:"this function is used to set content for a note."
      },
      "createNote":{
        needNote:false,
        toolTitle: "➕   Create Note",
        description:"Creates a new note (as 'child note') hierarchically under a specified parent note or creates a new note (as 'excerpt') from the current selection on document. Use this tool only when user ask to create a note.",
        args:{
          type:{
            type:"string",
            enum:["childNote","fromSelection"],
            description:"The type of the new note, default is `childNote`. For `childNote`, if no parent note is specified, it defaults to the currently active note. For `fromSelection`, the new note will be created from the current selection on document."
          },
          title:{
            type:"string",
            description:"The title or heading for the new child note. Optional."
          },
          content:{
            type:"string",
            description:`The main body content for the child note, formatted in Markdown. Simple HTML tags are also supported. Optional.`
          },
          tags:{
            type:"array",
            items: {
              type:"string"
            },
            description:"A list of tags to associate with the child note. Optional. Use this argument only when user ask to"
          },
          color:{
            type:"string",
            enum:["White", "Yellow", "Green", "Blue", "Red", "Orange", "Purple", "LightYellow", "LightGreen", "LightBlue", "LightRed", "DarkGreen", "DarkBlue", "DeepRed", "LightGray", "DarkGray"],
            description:"Sets a background color for the note. Optional. Use this argument only when user ask to set color."
          },
          parentNoteId:{
            type:"string",
            description:"The ID of the parent note under which this child note will be created. If omitted, it defaults to the currently active note. Format must be: `marginnote4app://note/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`. Optional."
          }
        },
        required:[],
      },
      "createMindmap":{
        needNote:false,
        toolTitle: "🔨   Create Mindmap",
        args:{
          ast:{
            type:"string",
            description:"JSON string representing the Abstract Syntax Tree. Properties includes title (pure text), content (markdown), color (optional, white as default), tags (optional, array of strings, only when user ask to add tags) and children (optional, array of objects).\n Colors includes White, Yellow, Green, Blue, Red, Orange, Purple, LightYellow, LightGreen, LightBlue, LightRed, DarkGreen, DarkBlue, DeepRed, LightGray and DarkGray"
          },
          parentNoteId:{
            type:"string",
            description:" optional, parent note id for this mindmap, default is current note. NoteId format: `marginnote4app://note/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`"
          },
        },
        required:["ast"],
        description:"this tool is used to create a mindmap"
      },
      "createMermaidChart":{
        needNote:false,
        toolTitle: "🔨   Create Mermaid Chart",
        args:{
          content:{
            type:"string",
            description:`A string containing the full, valid Mermaid.js syntax for the diagram. The AI model is responsible for generating this code based on the user's requirements. The code must begin with a diagram type declaration (e.g., "graph TD", "sequenceDiagram", "pie").
### Constraints ###
1. For flow charts, all node labels must be wrapped in triple double quotes. 
2. Latex formulas must be wrapped in double dollar signs. 
3. Mermaid chart can not render two latex blocks in one node. Never use two or more latex blocks in one node.
4. Do not use html tags in node labels.
5. Do not use markdown list in node labels.
6. Do not use brackets in node labels.

### Example 1 Latex###
 graph LR
      A["""$$x^2$$"""] -->|"""$$\\sqrt{x+3}$$"""| B("""$$\\frac{1}{2}$$""")
      A -->|"""$$\\overbrace{a+b+c}^{\\text{note}}$$"""| C("""$$\\pi r^2$$""")
      B --> D("""$$x = \\begin{cases} a &\\text{if } b \\\\ c &\\text{if } d \\end{cases}$$""")
      C --> E("""$$x(t)=c_1\\begin{bmatrix}-\\cos{t}+\\sin{t}\\\\ 2\\cos{t} \\end{bmatrix}e^{2t}$$""")

### Example 2 Flow Chart ###
graph TD
    A["""<b>太平洋增温模式的 onset 特征变化 (分界点：1970年代末)</b>"""]

    subgraph "1970年代末之前 (如 1957, 1965, 1972)"
        direction LR
        B["""<b>触发机制</b><br>澳大利亚东部的<br>异常气旋东移"""] --> C{"导致"}
        C --> D["""赤道西太平洋<br>出现异常西风"""]
        C --> E["""东南太平洋<br>信风减弱"""]
        E --> F["""<b>结果</b><br>南美沿岸增温<br><u>领先</u><br>中太平洋增温"""]
    end

    subgraph "1970年代末之后 (如 1982, 1986-87, 1991)"
        direction LR
        G["""<b>触发机制</b><br>菲律宾海的<br>异常气旋增强"""] --> H{"导致"}
        H --> I["""赤道西太平洋<br>建立异常西风"""]
        H --> J["""东南太平洋<br>信风增强"""]
        J --> K["""<b>结果</b><br>南美沿岸增温<br><u>落后</u><br>中太平洋增温"""]
    end

    subgraph "根本原因"
        L["""<b>背景海温场 (SSTs) 的年代际变化</b><br>1. 热带太平洋增温<br>2. 温带南北太平洋变冷<br>3. 阿留申低压加深"""]
    end

    L --> A
    A --> B
    A --> G

    style A fill:#0077B6,stroke-width:0px,color:white
    style L fill:#48BFE3,stroke-width:0px,color:black

    style B fill:#F7B801,stroke-width:0px,color:black
    style D fill:#F18701,stroke-width:0px,color:white
    style E fill:#F18701,stroke-width:0px,color:white
    style F fill:#A44200,stroke-width:0px,color:white
    
    style G fill:#7FB800,stroke-width:0px,color:black
    style I fill:#55A630,stroke-width:0px,color:white
    style J fill:#55A630,stroke-width:0px,color:white
    style K fill:#008000,stroke-width:0px,color:white


### Example 3 Mindmap ###
mindmap
  root((太平洋增温模式的 onset 特征变化))
    ::icon(fa fa-water)
    分界点：1970年代末
    根本原因 (背景海温场SSTs的年代际变化)
      热带太平洋增温
      温带南北太平洋变冷
      阿留申低压加深
    1970年代末之前 (1957, 1965, 1972)
      ::icon(fa fa-cloud-sun-rain)
      触发机制
        澳大利亚东部的异常气旋东移
      影响
        赤道西太平洋出现异常西风
        东南太平洋信风减弱
      结果
        南美沿岸增温领先中太平洋增温
    1970年代末之后 (1982, 1986-87, 1991)
      ::icon(fa fa-cloud-showers-heavy)
      触发机制
        菲律宾海的异常气旋增强
      影响
        赤道西太平洋建立异常西风
        东南太平洋信风增强
      结果
        南美沿岸增温落后中太平洋增温
### Example 4 sequenceDiagram ###
sequenceDiagram
    autonumber
    participant 1 as $$\\alpha$$
    participant 2 as $$\\beta$$
    1->>2: Solve: $$\\sqrt{2+2}$$
    2-->>1: Answer: $$2$$
    Note right of 2: $$\\sqrt{2+2}=\\sqrt{4}=2$$

`
          }
        },
        required:[],
        description:"Generates and renders a diagram image from a Mermaid syntax string. Use this tool whenever a user asks to create a visual diagram, such as a flowchart, sequence diagram, Gantt chart, pie chart, etc."
      },
      "createHTML":{
        needNote:false,
        toolTitle: "🌐   Create HTML",
        args:{
          html:{
            type:"string",
            description:"HTML string representing the content of <body> tag."
          },
          css:{
            type:"string",
            description:"additional CSS string representing the content of <style> tag"
          }
        },
        required:[],
        description:`this tool is used to create a html file and preview it, using Tailwind CSS and FontAwesome Icon. The default template is shown below, provide the arguments {{html}} and {{css}} to fill the html document.
#### Default Template ####
<!DOCTYPE html>
<style>
  body {
    padding: 0 !important;
  }
  main {
    padding-left: 0 !important;
    padding-right: 0 !important;
    padding-bottom: 0 !important;
  }
</style>
<html lang="zh-cmn-Hans" style="height: 0px;">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
    <title>HTML Template with Tailwind CSS and FontAwesome Icon</title>
    <script src=https://cdn.tailwindcss.com/3.4.16></script>
    <link href=https://cdn.bootcdn.net/ajax/libs/font-awesome/6.4.0/css/all.min.css rel=stylesheet>
    <style>
      {{css}}
    </style>
</head>
<body>
{{html}}
</body>
</html>`
      },
      "mergeNotes":{
        needNote:false,
        toolTitle: "🔨   Merge Notes",
        args:{
          fromNoteIds:{
            type:"array",
            items:{
              type:"string",
              description:"noteId of note to be merged. NoteId format: `marginnote4app://note/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`"
            },
            description:"noteIds of notes to be merged"
          },
          toNoteId:{
            type:"string",
            description:"noteId of the main note to be merged to. NoteId format: `marginnote4app://note/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`"
          }
        },
        required:["fromNoteIds","toNoteId"],
        description:"this tool is used to merge notes (fromNoteIds) to another note (toNoteId)"
      },
      "moveNotes":{
        needNote:false,
        toolTitle: "🔨   Move Notes",
        args:{
          fromNoteIds:{
            type:"array",
            items:{
              type:"string",
              description:"noteId of child note. NoteId format: `marginnote4app://note/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`"
            },
            description:"noteIds of child notes, order of these array will be the order of the child notes."
          },
          toNoteId:{
            type:"string",
            description:"noteId of parent note. NoteId format: `marginnote4app://note/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`"
          },
          toNewNote:{
            type:"object",
            properties:{
              title:{
                type:"string",
                description:"Optional, title of the new note to be created."
              },
              content:{
                type:"string",
                description:"Optional, content of the new note to be created."
              },
              color:{
                type:"string",
                description:"Optional, color of the new note to be created."
              },
              parentNoteId:{
                type:"string",
                description:"Optional, the parent note of the new note."
              }
            },
            description:"If provided, the notes will be moved to and as children of this new note."
          }
        },
        required:["fromNoteIds"],
        description:"this tool is used to move notes (fromNoteIds) as children of another note (toNoteId). If all notes belong to the same parent note, this tool can also be used to change the order of the child notes."
      },
      "linkNotes":{
        needNote:false,
        toolTitle: "🔗   Link Notes",
        args:{
          fromNoteId:{
            type:"string",
            description:"noteId of child note. NoteId format: `marginnote4app://note/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`"
          },
          toNoteId:{
            type:"string",
            description:"noteId of parent note. NoteId format: `marginnote4app://note/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`"
          },
          biDirectional:{
            type:"boolean",
            description:"optional, default is true, if true, the note (fromNoteId) will be linked to the note (toNoteId) and the note (toNoteId) will be linked to the note (fromNoteId) too"
          },
        },
        required:["fromNoteId","toNoteId"],
        description:"this tool is used to link a note (fromNoteId) to another note (toNoteId)"
      },
      "organizeNotes":{
        needNote:false,
        toolTitle: "🔨   Organize Notes",
        args:{
          asts:{
            type:"array",
            items:{
              type:"string",
              description:"JSON string representing the Abstract Syntax Tree. Properties includes noteId (required, supports `newNote` for a new node), title (optional, pure text), color (optional, white as default) and children (optional, array of objects).\n Colors includes White, Yellow, Green, Blue, Red, Orange, Purple, LightYellow, LightGreen, LightBlue, LightRed, DarkGreen, DarkBlue, DeepRed, LightGray and DarkGray"
            },
            description:"Multiple Abstract Syntax Trees represent multiple mindmaps."
          },
          rootNoteId:{
            type:"string",
            description:"optional, noteId of the root note, default is current note"
          }
        },
        required:["asts"],
        description:"this tool is used to re-organize notes, using noteId and Abstract Syntax Tree to create new trees of mindmap"
      },
      "searchNotes":{
        needNote:false,
        toolTitle: "🔍   Search Notes",
        args:{
          searchPhrases:{
            type:"array",
            items:{
              type:"string",
              description:"Phrase to search. Generate optimal search phrases based on user intent. Use .OR. for synonyms, .AND. for required terms. For example, phrase `A .AND. B` means the note must contain both `A` and `B`, and phrase `A .OR. B` means the note must contain either `A` or `B`."
            },
            description:"Array of search phrases. Every phrase is searched independently. At least 6 phrases are required."
          },
          searchRange:{
            type:"string",
            enum:["currentNotebook","allNotebooks"],
            description:"search range, default is current notebook. The word 'notebook' here also refers to the 'study set'"
          },
          exceptNotebooks:{
            type:"array",
            items:{
              type:"string",
              description:"name of the notebook to be excluded from search"
            },
            description:"names of the notebooks to be excluded from search, optional, valid only when searchRange is `allNotebooks`"
          },
          query:{
            type:"string",
            description:"description of your query, about the possible topics of the notes"
          },
        },
        required:["searchPhrases","query"],
        description:"this tool is used to search notes"
      },
      "editNote":{
        needNote:true,
        toolTitle: "📝   Edit Note",
        args:{
          noteId:{
            type:"string",
            description:"NoteId of the note to edit. Required when editing multiple notes. NoteId format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` or `marginnote4app://note/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`"
          },
          actions:{
            type:"array",
            items:{
              type:"object",
              properties:{
                action:{
                  type:"string",
                  enum:["setTitle","setTitleWithOptions","appendTitle","prependTitle","clearTitle","setColor","setContent","appendContent","prependContent","clearContent","replaceContent","appendComment","prependComment","addTags","removeTags","deleteNote","setMarkdownStatus"],
                  description:`actions to edit note.
For action \`setMarkdownStatus\`, the parameter \`markdown\` is required. This action will not change the content of the note, but change whether the content is rendered as markdown format.
Use the \`replaceContent\` action to change the style of specific words.
For example, set parameter \`originalContent\` to "reveals" and parameter \`content\` to "<span style="background-color: red;">reveals</span>" to change the color of the word "reveals" to red.`
                },
                content:{
                  type:"string",
                  description:`content for specific action. 
Required when use action \`setTitle\`, \`appendTitle\`, \`prependTitle\`, \`setContent\`, \`appendContent\`,\`prependContent\`, \`replaceContent\`, \`appendComment\`, \`prependComment\`, \`addTags\`, \`removeTags\`.
For actions \`setContent\`, \`appendContent\`, \`replaceContent\` and \`addComment\`, the content uses markdown format, which supports HTML tags like "span", "p", "div", "font", "u", "small", "big", "mark", "sup", "sub", "center" and etc.
IMPORTANT: 
* All inline formulas must be wrapped with single dollar signs $...$, and all displayed equations must be wrapped with double dollar signs $$...$$.
* The bold style is supported by using "**".
* Bold text will be hidden in recall mode (also called 回忆模式 in Chinese) to enable active recall practice through blank-filling.
`
                },
                markdown:{
                  type:"boolean",
                  description:"optional, default is false, if true, the content will be treated as markdown format. Set to true if you're using markdown format or html tags."
                },
                originalContent:{
                  type:"string",
                  description:"original content of the note, required when use action `replaceContent`"
                },
                color:{
                  type:"string",
                  description:"color for this note, required when use action `setColor`.",
                  enum:["White","Yellow","Green","Blue","Red","Orange","Purple","LightYellow","LightGreen","LightBlue","LightRed","DarkGreen","DarkBlue","DeepRed","LightGray","DarkGray"]
                },
                titleOptions:{
                  type:"array",
                  items: {
                    type:"string",
                    description:"title option for note"
                  },
                  description:"additional titles for for user to select,required when use action \"setTitleWithOptions\""
                },
                tags:{
                  type:"array",
                  items: {
                    type:"string",
                    description:"tag for child note"
                  },
                  description:"tag for child note, required when use these actions: \"addTags\", \"removeTags\""
                },
                needConfirm:{
                  type:"boolean",
                  description:"optional, default is true, do not ask user to confirm action but use this argument, only valid for actions `deleteNote`"
                }
              },
              required:["action"],
              description:"action to edit note"
            },
            description:"actions to edit note"
          },
        },
        required:["actions"],
        description:"this tool is used to edit note. Use this tool only when user ask to edit note."
      },
      "generateImage":{
        needNote:false,
        toolTitle: "🎨   Generate Image",
        args:{
          prompt:{
            type:"string",
            description:"A detailed image description in English, including subject, style, composition, etc. Example: 'A cyberpunk cityscape at night with neon lights and flying cars, digital art style.'"
          }
        },
        description:"this tool is used to generate a high-quality image based on a detailed text prompt."
      },
      "userConfirm":{
        needNote:false,
        toolTitle: "🔨   User Confirm",
        args:{
          title:{
            type:"string",
            description:"title of your query"
          },
          detail:{
            type:"string",
            description:"detail of your query"
          }
        },
        required:["title"],
        description:"this tool is used to query user's confirmation."
      },
      "userInput":{
        needNote:false,
        toolTitle: "🔨   User Input",
        args:{
          title:{
            type:"string",
            description:"title of your query"
          },
          detail:{
            type:"string",
            description:"detail of your query"
          }
        },
        required:["title"],
        description:"this tool is used to ask user's answer on your question."
      },
      "userSelect":{
        needNote:false,
        toolTitle: "🔨   User Select",
        args:{
          title:{
            type:"string",
            description:"title of your query"
          },
          detail:{
            type:"string",
            description:"detail of your query"
          },
          choices:{
            type:"array",
            items:{
              type:"string",
              description:"one of the choice you provide"
            },
            description:"choices you provide for user to select"
          }
        },
        required:["title","choices"],
        description:"this tool is used to let user to make a choice."
      },
      "knowledge":{
        needNote:false,
        toolTitle: "💡   Knowledge",
        args:{
          action:{
            type:"string",
            enum:["getKnowledge","appendKnowledge","overwriteKnowledge","clearKnowledge"],
            description:"action to get or set knowledge"
          },
          content:{
            type:"string",
            description:"content of knowledge you want to process, only valid when action is `appendKnowledge` and `overwriteKnowledge`"
          }
        },
        required:["action"],
        description:"this tool is used to process knowledge"
      },
      "executeAction":{
        needNote:false,
        toolTitle: "🔨   Execute Action",
        args:{
          action:{
            type:"string",
            enum:[],
            description:"action to execute, provide the actionId to specify the action to execute"
          },
          extraArgs:{
            type:"object",
            description:"optional, additional arguments to replace the original arguments of the action"
          }
        },
        required:["action"],
        description: `this tool [executeAction] is used to execute an action of addon [MN Toolbar]. 
For action, you must provide the actionId to specify the action to execute.
In addition to the actionId, you can also provide additional arguments to replace the original arguments of the action.
`
      },
      "executePrompt":{
        needNote:false,
        toolTitle: "🤖   Execute Prompt",
        args:{
          prompt:{
            type:"string",
            enum:[],
            description:"Prompt to execute, provide promptId to specify the prompt to execute"
          }
          // instruction:{
          //   type:"string",
          //   description:"optional, additional instruction for assistant who will execute the prompt"
          // }
        },
        required:["prompt"],
        description: `this tool [executePrompt] is used to ask an assistant to execute a prompt. You must provide the promptId to specify the prompt to execute. `
      },
      "readImage":{
        needNote:false,
        toolTitle: "🖼   Read Image",
        args:{
          imageId:{
            type:"string",
            description:"imageId of the image to read, which is the hash of the image. URL of image is also supported, including web image URL (e.g. https://example.com/image.png) and MarginNote Image URL (e.g. marginnote4app://markdownimg/png/eb163704ce5daa13fde4e82e1d319b7a)"
          },
          query:{
            type:"string",
            description:"query of information you want to get from the image. Provide enough background context to help the Ai assistant understand what to analyze."
          }
        },
        required:["imageId","query"],
        description:"this tool is used to read the content of an image using Ai Assistant. You must provide the imageId to specify the image to read. You can use this tool multiple times with different queries to read many details of the image."
      },
      "readURL":{
        needNote:false,
        toolTitle: "🔗   Read URL",
        args:{
          url:{
            type:"string",
            description:"URL of the website to read"
          }
        },
        required:["url"],
        description:"this tool is used to read the content of a website. You must provide the URL to specify the URL to read. Do not use this tool to read image URL, use [readImage] instead."
      }
    }
    // chatAIUtils.log("toolConfig",toolConfig)
    this._toolConfig = toolConfig
    return toolConfig
  }
  /**
   * 获取工具的配置,支持传入索引或工具名称
   * @param {string|number} name 
   * @returns {Object}
   */
  static getToolConfig(name){
    if (typeof name === "number") {
      let index = name
      let funcKey = this.toolNames[index]
      return this.getToolConfig(funcKey)
    }
    let toolConfig = this.toolConfig
    if (name in toolConfig) {
      return toolConfig[name]
    }else{
      return undefined
    }
  }
  static get toolNames(){
    return ["setTitle","addComment","copyMarkdownLink","copyCardURL","copyText","close","addTag","createNote","clearExcerpt","setExcerpt","readDocument","readNotes","webSearch","readParentNote","createMindmap","editNote","generateImage","createHTML","userConfirm","userInput","userSelect","mergeNotes","moveNotes","linkNotes","organizeNotes","searchNotes","createMermaidChart","knowledge","executeAction","executePrompt","readImage","readURL"]
  }
  static get toolNumber(){
    return this.toolNames.length
  }
  static get oldTools(){
    return [0,1,2,3,4,6,8,9]
  }
  static get activatedTools(){
    return [15,11,13,21,22,23,24,25,7,14,17,26,16,18,19,20,10,30,31,12,0,1,6,2,3,4,8,9,27,28,29,5]
  }
  static get activatedToolsExceptOld(){
    return [15,11,13,21,22,23,24,25,7,14,17,26,16,18,19,20,10,30,31,12,27,28,29,5]
  }
  static async getChangedTools(currentFunc,index){
    let targetFunc = currentFunc
    switch (index) {
      case -1:
        targetFunc = []
        break;
      case 100:
        if (!chatAIUtils.isSubscribed()) {
          let confirm = await MNUtil.confirm("🤖 MN ChatAI", "This feature requires subscription or free usage. Do you want to continue?\n\n该功能需要订阅或免费额度，是否继续？")
          if (!confirm) {
            return currentFunc
          }
        }
        if (chatAIUtils.checkSubscribe()) {
          targetFunc = chatAITool.activatedToolsExceptOld
        }
        break
      default:
        if (!chatAITool.oldTools.includes(index) && !chatAIUtils.isSubscribed()) {
          let confirm = await MNUtil.confirm("🤖 MN ChatAI", "This feature requires subscription or free usage. Do you want to continue?\n\n该功能需要订阅或免费额度，是否继续？")
          if (!confirm) {
            return currentFunc
          }
        }
        if (chatAITool.oldTools.includes(index) || chatAIUtils.checkSubscribe()) {
          if (targetFunc.includes(index)) {
            targetFunc = targetFunc.filter(func=> func!==index)
          }else{
            targetFunc.push(index)
          }
          targetFunc.sort(function(a, b) {
            return a - b;
          });
        }
        break;
    }
    return targetFunc
  }
  /**
   * 
   * @param {string} name 
   * @returns {chatAITool}
   */
  static getToolByName(name){
    if (name in this.tools) {
      return this.tools[name]
    }else{
      return this.tools["UnkonwFunc"]
    }
  }
  static async executeTool(funcName,func,noteId){
    let tool = this.getToolByName(funcName)
    // MNUtil.log("executeTool",{funcName:funcName,noteId:noteId})
    // MNUtil.copy(func)
    return await tool.execute(func,noteId)
  }
  static initTools(){
    this.tools = {}
    for (let i = 0; i < this.toolNames.length; i++) {
      let funcKey = this.toolNames[i]
      let config = this.getToolConfig(funcKey)
      // this.tools[func] = this.new(func,config.args,config.description,config.needNote)
      this.tools[funcKey] = this.new(funcKey,config)
    }
    this.tools["UnkonwFunc"] = this.new("UnkonwFunc",{},"UnkonwFunc",false)
  }
  static getToolsByIndex(indices) {
  try {

    if (indices.length === 0) {
      return []
    }
    let toolNumber = this.toolNumber
    let funcStructures = []
    indices.forEach(ind=>{
      if (ind < toolNumber && ind >= 0) {
        let toolName = this.toolNames[ind]
        if (toolName in this.tools) {
          funcStructures.push(this.tools[toolName].body())
        }
      }
    })
    return funcStructures
    
  } catch (error) {
    chatAIUtils.addErrorLog(error, "chatAITool.getToolsByIndex")
    return []
  }
  }
  /**
   * 
   * @param {string[]} searchTexts 
   * @returns {Promise<MNNote[]>}
   */
  static async searchInCurrentStudySets(searchTexts){
  try {
    

    this.waitHUD("Searching in current studySet...")
    await MNUtil.delay(0.01)
    let notesInCurrentStudySet = chatAIUtils.notesInCurrentStudySet()
    //先在当前的学习集搜索
    let filteredNotes = this.searchTitleInNotes(notesInCurrentStudySet,searchTexts)
    this.waitHUD("Searching in current studySets... Done")
    MNUtil.stopHUD(0.5)
    return filteredNotes
  } catch (error) {
    chatAIUtils.addErrorLog(error, "chatAITool.searchInCurrentStudySets")
    return []
  }
  }
  /**
   * 
   * @param {string[]} searchTexts 
   * @returns {Promise<MNNote[]>}
   */
  static async searchInAllStudySets(searchTexts,option = {}){
  try {

    this.waitHUD("Searching in current studySet...")
    await MNUtil.delay(0.01)
    let currentStudySet = MNUtil.currentNotebook
    let notesInCurrentStudySet = chatAIUtils.notesInCurrentStudySet()
    //先在当前的学习集搜索
    let filteredNotes = this.searchTitleInNotes(notesInCurrentStudySet,searchTexts)
    let searchOption = option
    if (searchOption.exceptNotebookIds) {
      searchOption.exceptNotebookIds.push(currentStudySet.topicId)
    }else{
      searchOption.exceptNotebookIds = [currentStudySet.topicId]
    }
    let otherStudySets = chatAIUtils.allStudySets(searchOption)
    for (let index = 0; index < otherStudySets.length; index++) {
      let studySet = otherStudySets[index];
      this.waitHUD(`Searching in other studySets [${index+1}/${otherStudySets.length}]...`)
      await MNUtil.delay(0.01)
      let notesInStudySet = chatAIUtils.notesInStudySet(studySet)
      let filteredNotesInStudySet = this.searchTitleInNotes(notesInStudySet,searchTexts)
      filteredNotes = filteredNotes.concat(filteredNotesInStudySet)
    }
    this.waitHUD("Searching in all studySets... Done")
    return filteredNotes
    
  } catch (error) {
    chatAIUtils.addErrorLog(error, "chatAITool.searchInAllStudySets")
    return []
  }
  }
/**
 * 判断字符串是否包含符合特定语法的搜索内容。
 * 支持 .AND., .OR. 和括号 ()。
 *
 * @param {string} text - 要在其中搜索的完整字符串。
 * @param {string} query - 基于 .AND. 和 .OR. 语法的搜索查询字符串。
 * @returns {boolean} - 如果 text 包含符合 query 条件的内容，则返回 true，否则返回 false。
 */
static textMatchKeyword(text, query) {
  // 1. 提取所有独立的搜索关键词。
  // 通过分割 .AND. .OR. 和括号，然后清理，来获取关键词列表。
  const terms = query
    .split(/\s*\.AND\.|\s*\.OR\.|\(|\)/)
    .map(term => term.trim())
    .filter(Boolean); // 过滤掉因分割产生的空字符串

  // 按长度降序排序，以防止在替换时，短关键词（如 "TC"）错误地替换了长关键词（如 "TCG"）的一部分。
  terms.sort((a, b) => b.length - a.length);

  // 辅助函数：用于在最终的表达式中检查单个关键词是否存在（不区分大小写）。
  const check = (term) => text.toLowerCase().includes(term.toLowerCase());

  // 2. 构建一个标准的 JavaScript 布尔表达式字符串。
  let jsQuery = query;

  // 将每个关键词替换为一个函数调用。
  // 例如 "tropical cyclone" -> 'check("tropical cyclone")'
  terms.forEach(term => {
    // 使用正则表达式的全局替换，确保所有出现的地方都被替换。
    // RegExp.escape is not a standard function, so we manually escape special characters.
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    jsQuery = jsQuery.replace(new RegExp(escapedTerm, 'g'), `check("${term}")`);
  });

  // 将自定义的 .AND. 和 .OR. 替换为 JavaScript 的 && 和 ||。
  jsQuery = jsQuery.replace(/\s*\.AND\.\s*/g, ' && ').replace(/\s*\.OR\.\s*/g, ' || ');

  // 3. 使用 new Function() 安全地执行构建好的表达式。
  // 这种方法比 eval() 更安全，因为它在自己的作用域内运行。
  try {
    const evaluator = new Function('check', `return ${jsQuery};`);
    return evaluator(check);
  } catch (error) {
    chatAIUtils.addErrorLog(error, "chatAITool.textMatchKeyword")
    return false; // 如果查询语法有误，则返回 false。
  }
}
  /**
   * 
   * @param {MNNote[]} notes 
   * @param {string[]} searchTexts 
   * @returns {MNNote[]}
   */
  static searchTitleInNotes(notes,searchTexts){
    let validSearchText = searchTexts.filter(searchText=>{
      if (searchText.trim() === "") {
        return false
      }
      if (searchText.trim() === ".AND." || searchText.trim() === ".OR.") {
        return false
      }
      return true
  })
    return notes.filter(note=>{
      let textToMatch = note.allNoteText()
      return validSearchText.some(searchText=>this.textMatchKeyword(textToMatch,searchText))
    }
    )
  }
}

// 定义一个类
class chatAIUtils {
  // 构造器方法，用于初始化新创建的对象
  constructor(name) {
    this.name = name;
  }
  static errorLog = []
  static emojiIndices = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"]
  static cache = {}
  static cacheInfo = {number:0,times:0,enabled:true}
  static imageCache = {}
  static MNImagePattern = /!\[.*?\]\((marginnote4app\:\/\/markdownimg\/(png|jpeg)\/.*?)(\))/g;
  /**
   * @type {{version:String,type:String}}
   * @static
   */
  static version
  static currentNoteId
  static currentSelectionText = ""
  static onPopupMenuOnNoteTime = 0
  static onClosePopupMenuOnNoteTime = 0
  static onPopupMenuOnSelectionTime = 0
  static onClosePopupMenuOnSelectionTime = 0
  static currentPrompt
  /** @type {String} */
  static mainPath
  /**
   * @type {Boolean}
   * @static
   */
  static OCREnhancedMode
  /**
   * @type {Boolean}
   * @static
   */
  static visionMode = false
  static noSystemMode
  static lastTime
  /**
   * @type {chatglmController}
   * @static
   */
  static chatController
  /**
   * @type {notificationController}
   * @static
   */
  static notifyController
  /**
   * @type {dynamicController}
   * @static
   */
  static dynamicController
  /**
   * @type {sideOutputController}
   * @static
   */
  static sideOutputController
  static init(mainPath){
    if (mainPath) {
      this.mainPath = mainPath
    }
    this.OCREnhancedMode = false
    this.app = Application.sharedInstance()
    this.data = Database.sharedInstance()
    this.focusWindow = this.app.focusWindow
    this.version = this.appVersion()
    this.errorLog = [this.version]
    this.onAlert = false
  }
  static async checkMNUtil(alert = false,delay = 0.01){
  try {
    

    if (typeof MNUtil === 'undefined') {//如果MNUtil未被加载，则执行一次延时，然后再检测一次
      //仅在MNUtil未被完全加载时执行delay
      await this.delay(delay)
      if (typeof MNUtil === 'undefined') {
        if (alert) {
          let res = await this.confirm("MN ChatAI:", "Install 'MN Utils' first\n\n请先安装'MN Utils'",["Cancel","Open URL"])
          if (res) {
            this.openURL("https://bbs.marginnote.com.cn/t/topic/49699")
          }
        }else{
          this.showHUD("MN ChatAI: Please install 'MN Utils' first!",5)
        }
        return false
      }
    }
    return true
  } catch (error) {
    this.copy(error.toString())
    // chatAIUtils.addErrorLog(error, "chatAITool.checkMNUtil")
    return false
  }
  }
  static showHUD(message,duration=2) {
    this.app.showHUD(message,this.focusWindow,2)
  }

  static appVersion() {
    let info = {}
    let version = parseFloat(this.app.appVersion)
    // MNUtil.copy(this.app.appVersion)
    if (version >= 4) {
      info.version = "marginnote4"
    }else{
      info.version = "marginnote3"
    }
    info.appVersion = this.app.appVersion
    switch (this.app.osType) {
      case 0:
        info.type = "iPadOS"
        break;
      case 1:
        info.type = "iPhoneOS"
        break;
      case 2:
        info.type = "macOS"
        break;
      default:
        break;
    }
    if (this.mainPath) {
      let chatAIVersion = MNUtil.readJSON(this.mainPath+"/mnaddon.json").version
      info.chatAIVersion = chatAIVersion
    }
    // MNUtil.copyJSON(info)
    return info
  }
  static  getNoteColors() {
    return ["#ffffb4","#ccfdc4","#b4d1fb","#f3aebe","#ffff54","#75fb4c","#55bbf9","#ea3323","#ef8733","#377e47","#173dac","#be3223","#ffffff","#dadada","#b4b4b4","#bd9fdc"]
  }
  static getNoteById(noteid) {
    let note = this.data.getNoteById(noteid)
    return note
  }
  static getNoteBookById(notebookId) {
    let notebook = this.data.getNotebookById(notebookId)
    return notebook
  }
  static getUrlByNoteId(noteid) {
    let ver = this.appVersion()
    return ver.version+'app://note/'+noteid
  } 
  static currentNote() {
    if (!this.currentNoteId) {
      if (!this.getCurrentSelectionObject().onSelection) {//当前
        let focusNote = MNNote.getFocusNote()
        if (focusNote) {
          this.currentNoteId = focusNote.noteId
          return focusNote
        }
      }
      return undefined
    }
    if (!this.noteExists(this.currentNoteId)) {
      return undefined
    }
    let note = MNNote.new(this.currentNoteId)
    return note
  }
  static blur() {
    if (this.isMN4() && this.sideOutputController && this.sideOutputController.userInput) {
      this.sideOutputController.blur(0.1)
    }
    if (this.dynamicController && !this.dynamicController.view.hidden) {
      this.dynamicController.blur(0.1)
    }
  }
  static allStudySets(option = {}){
  try {
    let allNotebooks = MNUtil.allNotebooks()
    let exceptNotebookIds = option.exceptNotebookIds ?? []
    let exceptNotebookNames = option.exceptNotebookNames ?? []
    let studySets = allNotebooks.filter(notebook=>{
      let flags = notebook.flags
      if (flags === 2) {
        if (exceptNotebookIds.length > 0 || exceptNotebookNames.length > 0) {
          if (exceptNotebookIds.includes(notebook.topicId)) {
            return false
          }
          if (exceptNotebookNames.includes(notebook.title.trim())) {
            return false
          }
        }
        return true
      }
      return false
    })
    return studySets
  } catch (error) {
    this.addErrorLog(error, "allStudySets")
    return []
  }
  }
  /**
   * 
   * @param {string|undefined} exceptNotebookId 
   * @returns {Array<MNNote>}
   */
  static allNotesFromAllStudySets(option = {}){
    let studySets = this.allStudySets(option)
    // MNUtil.copy(studySets.map(studySet=>studySet.title))
    let notes = studySets.flatMap(studySet=>this.notesInStudySet(studySet)).map(note=>MNNote.new(note))
    return notes
  }
/**
 * 判断字符串是否包含符合特定语法的搜索内容。
 * 支持 .AND., .OR. 和括号 ()。
 *
 * @param {string} text - 要在其中搜索的完整字符串。
 * @param {string} query - 基于 .AND. 和 .OR. 语法的搜索查询字符串。
 * @returns {boolean} - 如果 text 包含符合 query 条件的内容，则返回 true，否则返回 false。
 */
static textMatchKeyword(text, query) {
  // 1. 提取所有独立的搜索关键词。
  // 通过分割 .AND. .OR. 和括号，然后清理，来获取关键词列表。
  const terms = query
    .split(/\s*\.AND\.|\s*\.OR\.|\(|\)/)
    .map(term => term.trim())
    .filter(Boolean); // 过滤掉因分割产生的空字符串

  // 按长度降序排序，以防止在替换时，短关键词（如 "TC"）错误地替换了长关键词（如 "TCG"）的一部分。
  terms.sort((a, b) => b.length - a.length);

  // 辅助函数：用于在最终的表达式中检查单个关键词是否存在（不区分大小写）。
  const check = (term) => text.toLowerCase().includes(term.toLowerCase());

  // 2. 构建一个标准的 JavaScript 布尔表达式字符串。
  let jsQuery = query;

  // 将每个关键词替换为一个函数调用。
  // 例如 "tropical cyclone" -> 'check("tropical cyclone")'
  terms.forEach(term => {
    // 使用正则表达式的全局替换，确保所有出现的地方都被替换。
    // RegExp.escape is not a standard function, so we manually escape special characters.
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    jsQuery = jsQuery.replace(new RegExp(escapedTerm, 'g'), `check("${term}")`);
  });

  // 将自定义的 .AND. 和 .OR. 替换为 JavaScript 的 && 和 ||。
  jsQuery = jsQuery.replace(/\s*\.AND\.\s*/g, ' && ').replace(/\s*\.OR\.\s*/g, ' || ');

  // 3. 使用 new Function() 安全地执行构建好的表达式。
  // 这种方法比 eval() 更安全，因为它在自己的作用域内运行。
  try {
    const evaluator = new Function('check', `return ${jsQuery};`);
    return evaluator(check);
  } catch (error) {
    console.error("查询语法无效:", error);
    return false; // 如果查询语法有误，则返回 false。
  }
}

  static textMatchKeywordOld(text,keyword){
    if (keyword.includes(".AND.")) {
      let keywords = keyword.split(".AND.")
      let validKeywords = keywords.filter(keyword=>keyword.trim() !== "")
      return validKeywords.every(keyword=>text.includes(keyword.trim()))
    }
    if (keyword.includes(".OR.")) {
      let keywords = keyword.split(".OR.")
      let validKeywords = keywords.filter(keyword=>keyword.trim() !== "")
      return validKeywords.some(keyword=>text.includes(keyword.trim()))
    }
    return text.includes(keyword)
  }
  /**
   * 
   * @param {MNNote[]} notes 
   * @param {string[]} searchTexts 
   * @returns {MNNote[]}
   */
  static searchTitleInNotes(notes,searchTexts){
    let validSearchText = searchTexts.filter(searchText=>{
      if (searchText.trim() === "") {
        return false
      }
      if (searchText.trim() === ".AND." || searchText.trim() === ".OR.") {
        return false
      }
      return true
  })
    return notes.filter(note=>{
      let textToMatch = note.allNoteText()
      return validSearchText.some(searchText=>this.textMatchKeyword(textToMatch,searchText))
    }
    )
  }
  /**
   * 
   * @param {string|MNNotebook} studySetId 
   * @returns {MNNote[]}
   */
  static notesInStudySet(studySetId = MNUtil.currentNotebookId){
    let allNotes
    if (typeof studySetId === "string") {
      allNotes = MNUtil.getNoteBookById(studySetId).notes
    }else{
      allNotes = studySetId.notes
    }
    let filteredNotes = allNotes.filter(note=>!note.docMd5.endsWith("_StudySet"))
    return filteredNotes
  }
  static aiNotesInStudySet(studySetId = MNUtil.currentNotebookId){
    let allNotes
    if (typeof studySetId === "string") {
      allNotes = MNUtil.getNoteBookById(studySetId).notes
    }else{
      allNotes = studySetId.notes
    }
    return allNotes.filter(note=>note.docMd5.endsWith("_StudySet"))
  }
  /**
   * 
   * @returns {MNNote[]}
   */
  static notesInCurrentStudySet(){
    let filteredNotes = []
    let allNotes = MNUtil.currentNotebook.notes
    for (let note of allNotes) {
      if (!note.docMd5.endsWith("_StudySet")) {
        filteredNotes.push(MNNote.new(note))
      }
    }
    return filteredNotes
  }
  /**
   * 
   * @param {string[]} searchTexts 
   * @returns {Promise<MNNote[]>}
   */
  static async searchInCurrentStudySets(searchTexts){
  try {
    

    MNUtil.waitHUD("Searching in current studySet...")
    await MNUtil.delay(0.01)
    let notesInCurrentStudySet = this.notesInCurrentStudySet()
    //先在当前的学习集搜索
    let filteredNotes = this.searchTitleInNotes(notesInCurrentStudySet,searchTexts)
    MNUtil.waitHUD("Searching in current studySets... Done")
    MNUtil.stopHUD(0.5)
    return filteredNotes
  } catch (error) {
    this.addErrorLog(error, "searchInCurrentStudySets")
    return []
  }
  }
  static async searchInAllStudySetsDev(searchText){
    let cachedNotes = await chatAIConfig.getCachedNotesInAllStudySets()
    let filteredNotes = cachedNotes.filter(note=>{
      if (note.title && note.title.includes(searchText)) {
        return true
      }
      return false
    })
    return filteredNotes
  }
  /**
   * 
   * @param {string[]} searchTexts 
   * @returns {Promise<MNNote[]>}
   */
  static async searchInAllStudySets(searchTexts,option = {}){
  try {

    MNUtil.waitHUD("Searching in current studySet...")
    await MNUtil.delay(0.01)
    let currentStudySet = MNUtil.currentNotebook
    let notesInCurrentStudySet = this.notesInCurrentStudySet()
    //先在当前的学习集搜索
    let filteredNotes = this.searchTitleInNotes(notesInCurrentStudySet,searchTexts)
    MNUtil.waitHUD("Searching in other studySets...")
    await MNUtil.delay(0.01)
    let searchOption = option
    if (searchOption.exceptNotebookIds) {
      searchOption.exceptNotebookIds.push(currentStudySet.topicId)
    }else{
      searchOption.exceptNotebookIds = [currentStudySet.topicId]
    }
    let notesInOtherStudySets = this.allNotesFromAllStudySets(option)
    let filteredNotesInOtherStudySet = this.searchTitleInNotes(notesInOtherStudySets,searchTexts)
    let notes = filteredNotes.concat(filteredNotesInOtherStudySet)
    MNUtil.waitHUD("Searching in all studySets... Done")
    return notes
    
  } catch (error) {
    this.addErrorLog(error, "searchInAllStudySets")
    return []
  }
  }
  static async searchInAllStudySetsDev(searchText){
    let cachedNotes = await chatAIConfig.getCachedNotesInAllStudySets()
    let filteredNotes = cachedNotes.filter(note=>{
      if (note.title && note.title.includes(searchText)) {
        return true
      }
      return false
    })
    return filteredNotes
  }
  /**
   * 注意这里的code需要是字符串
   * @param {string} code 
   * @returns {string}
   */
  static getStatusCodeDescription(code){
  try {
  // if (typeof code === "number") {
  //   code = toString(code)
  // }
      let des = {
        "400": "Bad Request",
        "401": "Unauthorized",
        "402": "Payment Required",
        "403": "Forbidden",
        "404": "Not Found",
        "405": "Method Not Allowed",
        "406": "Not Acceptable",
        "407": "Proxy Authentication Required",
        "408": "Request Timeout",
        "409": "Conflict",
        "410": "Gone",
        "411": "Length Required",
        "412": "Precondition Failed",
        "413": "Payload Too Large",
        "414": "URI Too Long",
        "415": "Unsupported Media Type",
        "416": "Range Not Satisfiable",
        "417": "Expectation Failed",
        "418": "I'm a teapot",
        "421": "Misdirected Request",
        "422": "Unprocessable Entity",
        "423": "Locked",
        "424": "Failed Dependency",
        "425": "Too Early",
        "426": "Upgrade Required",
        "428": "Precondition Required",
        "429": "Too Many Requests",
        "431": "Request Header Fields Too Large",
        "451": "Unavailable For Legal Reasons",
        "500": "Internal Server Error",
        "501": "Not Implemented",
        "502": "Bad Gateway",
        "503": "Service Unavailable",
        "504": "Gateway Timeout",
        "505": "HTTP Version Not Supported",
        "506": "Variant Also Negotiates",
        "507": "Insufficient Storage",
        "508": "Loop Detected",
        "510": "Not Extended",
        "511": "Network Authentication Required"
      }
      if (code in des) {
    return (code+": "+des[code])
      }
      return undefined
    } catch (error) {
      MNUtil.copy(error.toString())
    }
  }
  /**
   * 
   * @param {String} url 
   * @returns {String}
   */
  static getNoteIdByURL(url) {
    let targetNoteId = url.trim()
    if (/^marginnote\dapp:\/\/note\//.test(targetNoteId)) {
      targetNoteId = targetNoteId.slice(22)
    }
    return targetNoteId
  }
  static clipboardText() {
    return UIPasteboard.generalPasteboard().string
  }
  static copy(text) {
    UIPasteboard.generalPasteboard().string = text
  }
  static copyJSON(object) {
    UIPasteboard.generalPasteboard().string = JSON.stringify(object,null,2)
  }
static extractHtmlCodeBlocks(markdown) {
  // 匹配围栏代码块语法（支持 HTML 和 Vue 等常见标记）
  const regex = /```\s*(html|vue)\s*\n([\s\S]*?)\n```/gi;
  
  const blocks = [];
  let match;
  
  while ((match = regex.exec(markdown)) !== null) {
    // match[2] 包含代码内容，match[1] 包含语言标识
    blocks.push({
      language: match[1].toLowerCase(),
      code: match[2].trim()
    });
  }

  return blocks;
}

/**
 * 
 * @param {Array<{id:string,parentId:string}>} notes 
 * @returns 
 */
static buildHierarchy(notes) {
  const tree = [];
  const map = {}; // Helper to quickly find notes by their ID

  // First pass: Create a map of notes and initialize a 'children' array for each.
  notes.forEach(note => {
    map[note.id] = { ...note, children: note.children || [] }; // Store a copy and add children array
  });

  // Second pass: Populate the 'children' arrays and identify root nodes.
  notes.forEach(note => {
    let parentId = note.parentId
    if (parentId && map[parentId]) {
      // If it has a parent and the parent exists in our map, add it to parent's children
      let children = map[parentId].children ?? []
      children = children.map(child=>{
        if (child.id === note.id) {
          return map[note.id]
        }
        return child
      })
      map[parentId].children = children
    } else {
      // Otherwise, it's a root node (or an orphan if parentId is invalid but present)
      tree.push(map[note.id]);
    }
  });

  return tree;
}

/**
 * 
 * @param {Array<MNNote>} notes 
 * @returns 
 */
static buildHierarchyFromNotes(notes) {
  let notesStructure = notes.map(note=>{
    return {
      id:note.id,
      parentId:note.parentId
    }
  })
  const tree = [];
  const map = {}; // Helper to quickly find notes by their ID

  // First pass: Create a map of notes and initialize a 'children' array for each.
  notesStructure.forEach(note => {
    map[note.id] = { ...note, children: [] }; // Store a copy and add children array
  });

  // Second pass: Populate the 'children' arrays and identify root nodes.
  notesStructure.forEach(note => {
    let parentId = note.parentId
    if (parentId && map[parentId]) {
      // If it has a parent and the parent exists in our map, add it to parent's children
      map[parentId].children.push(map[note.id]);
    } else {
      // Otherwise, it's a root node (or an orphan if parentId is invalid but present)
      tree.push(map[note.id]);
    }
  });

  return tree;
}

  /**
   * 
   * @param {NSData} imageData 
   */
  static copyImage(imageData) {
    UIPasteboard.generalPasteboard().setDataForPasteboardType(imageData,"public.png")
  }
  static studyController() {
    return this.app.studyController(this.focusWindow)
  }
  static studyView() {
    return this.app.studyController(this.focusWindow).view
  }

  static currentDocController() {
    return this.studyController().readerController.currentDocumentController
  }
  static currentNotebook() {
    let notebookId = this.studyController().notebookController.notebookId
    return this.getNoteBookById(notebookId)
  }
  static undoGrouping(notebookId,f){
    UndoManager.sharedInstance().undoGrouping(
      String(Date.now()),
      notebookId,
      f
    )
    this.app.refreshAfterDBChanged(notebookId)
  }
  /**
   * 
   * @param {{title:String,content:String,markdown:Boolean,color:Number}} config 
   * @returns 
   */
  static creatNote(config) {
    try {

      let notebook = this.currentNotebook()
      let title = config.title ?? ""
    let note = Note.createWithTitleNotebookDocument(title, notebook,this.currentDocController().document)
      if (config.content) {
        if (config.markdown) {
          note.appendMarkdownComment(config.content)
      }else{
          note.appendTextComment(config.content)
        }
      }
      if (config.color !== undefined) {
        note.colorIndex = config.color
      }
      return note
    } catch (error) {
      this.showHUD(error)
      return undefined
    }
  }
  /**
   * 
   * @param {MbBookNote} parent 
   * @param {MbBookNote} targetNote 
   */
  static addChildNote(parent,targetNote,colorInheritance=false) {
    this.undoGrouping(parent.notebookId, ()=>{
      if (colorInheritance) {
        targetNote.colorIndex = parent.colorIndex
      }
      parent.addChild(targetNote)
    })
  }
  /**
   * 
   * @param {MbBookNote|String} parent 
   * @param {{title:String,content:String,markdown:Boolean,color:Number}} config 
   * @returns {MbBookNote}
   */
  static createChildNote(parent,config) {
    let parentNote = (typeof parent === "string")?this.getNoteById(parent):parent
    let child
    this.undoGrouping(parentNote.notebookId, ()=>{
      child = this.creatNote(config)
      parentNote.addChild(child)
    })
    return child
  }
  /**
   * 
   * @param {MbBookNote} brother 
   * @param {MbBookNote} targetNote 
   */
  static addBrotherNote(brother,targetNote,colorInheritance=false) {
    if (!brother.parentNote) {
      this.showHUD("No parent note!")
      return
    }
    let parent = brother.parentNote
    this.undoGrouping(parent.notebookId, ()=>{
      if (colorInheritance) {
        targetNote.colorIndex = brother.colorIndex
      }
      parent.addChild(targetNote)
    })
  }
  /**
   * 
   * @param {MbBookNote} brother 
   * @param {{title:String,content:String,markdown:Boolean,color:Number}} config 
   */
  static createBrotherNote(brother,config) {
    if (!brother.parentNote) {
      this.showHUD("No parent note!")
      return
    }
    let parent = brother.parentNote
    this.undoGrouping(parent.notebookId, ()=>{
      let child = this.creatNote(config)
      parent.addChild(child)
    })
  }
  static getSplitLine() {
    let study = this.studyController()
    let studyFrame = study.view.bounds
    let readerFrame = study.readerController.view.frame
    let hidden = study.readerController.view.hidden//true代表脑图全屏
    let rightMode = study.rightMapMode
    let fullWindow = readerFrame.width == studyFrame.width
    if (hidden || fullWindow) {
      return undefined
    }
    if (rightMode) {
      let splitLine = readerFrame.x+readerFrame.width
      return splitLine
    }else{
      let splitLine = readerFrame.x
      return splitLine
    }
  }
  static hexColorAlpha(hex,alpha) {
    let color = UIColor.colorWithHexString(hex)
    return alpha!==undefined?color.colorWithAlphaComponent(alpha):color
  }
  static genFrame(x,y,width,height) {
    return {x:x,y:y,width:width,height:height}
  }
  static getImage(path,scale=2) {
    return UIImage.imageWithDataScale(NSData.dataWithContentsOfFile(path), scale)
  }
  /**
   * 
   * @param {string} markdown 
   * @returns {NSData[]}
   */
  static getImagesFromMarkdown(markdown) {
try {
    // 匹配 base64 图片链接的正则表达式
    const MNImagePattern = /!\[.*?\]\((marginnote4app\:\/\/markdownimg\/png\/.*?)(\))/g;
    let images = []
    // 处理 Markdown 字符串，替换每个 base64 图片链接
    markdown.replace(MNImagePattern, (match, MNImageURL,p2) => {
      let hash = MNImageURL.split("markdownimg/png/")[1]
      let imageData = MNUtil.getMediaByHash(hash)
      if (imageData) {
        images.push(imageData)
      }
      return "";
    });
  return images;
} catch (error) {
  this.addErrorLog(error, "getImagesFromMarkdown")
  return []
}
}
  static getFocusNote(allowSelection = true) {
  try {
    // MNUtil.log("getFocusNote",{allowSelection:allowSelection})

    //MNNote的方法可能无法兼顾到保存的对照视图,多加一个判断
    let focusNote = MNNote.getFocusNote()
    if (focusNote) {
      return focusNote
    }else{
      if (this.currentNote()) {
        return this.currentNote()
      }
      if (allowSelection && this.getCurrentSelectionObject().onSelection) {
        chatAIUtils.log("create from selection")
        return MNNote.fromSelection().realGroupNoteForTopicId()
      }
      return undefined
    }
    
  } catch (error) {
    this.addErrorLog(error, "getFocusNote")
    return undefined
  }
  }

  static getFocusNoteId(allowSelection = true) {
    //MNNote的方法可能无法兼顾到保存的对照视图,多加一个判断
    let focusNote = this.getFocusNote(allowSelection)
    if (focusNote) {
      return focusNote.noteId
    }
    return undefined
  }

  static getFocusNotes() {
  try {

    let focusNotes = MNNote.getFocusNotes()
    if (!focusNotes) {
      return []
    }
    if (focusNotes.length === 1) {
      if (focusNotes[0]) {
        return focusNotes
      }
      return []
    }
    return focusNotes
    
  } catch (error) {
    this.addErrorLog(error, "getFocusNotes")
    return []
  }
  }

  static cloneNote(noteid) {
    let targetNote = this.getNoteById(noteid)
    if (!targetNote) {
      this.addErrorLog("Note not exists!", "cloneNote")
      return undefined
    }
    let note = this.data.cloneNotesToTopic([targetNote], targetNote.notebookId)
    return note[0]
  }

  static cloneAndMerge(currentNote,targetNoteId) {
    let clonedNoteId = this.cloneNote(targetNoteId)
    currentNote.merge(this.getNoteById(clonedNoteId))
  }

  static postNotification(name,userInfo) {
    NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo(name, this.focusWindow, userInfo)
  }
  /**
   * 
   * @param {MNNote} note 
   * @param {number} level 
   * @returns {Promise<string>}
   */
  static async getMDFromNote(note,withLink = false){
    if (note) {
      note = note.realGroupNoteForTopicId()
    }else{
      return ""
    }
try {
  let OCR_enabled = false
  let title = (note.noteTitle && note.noteTitle.trim()) ? note.noteTitle.trim() : ""
  if (title.trim()) {
    title = title.split(";").filter(t=>{
      if (/{{.*}}/.test(t)) {
        return false
      }
      return true
    }).join(";")
    if (withLink) {
      title = `# [${title}](${note.noteURL})`
    }else{
      title = `# ${title}`
    }
  }else if (withLink) {
    title = `# [note:${note.noteId}](${note.noteURL})`
  }
  let textFirst = note.textFirst
  let excerptText
  if (note.excerptPic && !textFirst) {
    if (OCR_enabled) {
      excerptText = await chatAINetwork.getTextOCR(MNUtil.getMediaByHash(note.excerptPic.paint))
    }else{
      excerptText = ""
    }
  }else{
    excerptText = note.excerptText ?? ""
  }
  if (note.comments.length) {
    let comments = note.comments
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      switch (comment.type) {
        case "TextNote":
          if (/^marginnote\dapp\:\/\//.test(comment.text)) {
            //do nothing
          }else{
            excerptText = excerptText+"\n"+comment.text
          }
          break;
        case "HtmlNote":
          excerptText = excerptText+"\n"+comment.text
          break
        case "LinkNote":
          if (OCR_enabled && comment.q_hpic  && comment.q_hpic.paint && !textFirst) {
            let imageData = MNUtil.getMediaByHash(comment.q_hpic.paint)
            let imageSize = UIImage.imageWithData(imageData).size
            if (imageSize.width === 1 && imageSize.height === 1) {
              if (comment.q_htext) {
                excerptText = excerptText+"\n"+comment.q_htext
              }
            }else{
              excerptText = excerptText+"\n"+await chatAINetwork.getTextOCR(imageData)
            }
          }else{
            excerptText = excerptText+"\n"+comment.q_htext
          }
          break
        case "PaintNote":
          if (OCR_enabled && comment.paint){
            excerptText = excerptText+"\n"+await chatAINetwork.getTextOCR(MNUtil.getMediaByHash(comment.paint))
          }
          break
        default:
          break;
      }
    }
  }
  excerptText = (excerptText && excerptText.trim()) ? this.highlightEqualsContentReverse(excerptText) : ""
  let content = title+"\n"+excerptText
  // if (level) {
  //   content = content.replace(/(#+\s)/g, "#".repeat(level)+"\$1")
  // }
  return content
}catch(error){
  this.addErrorLog(error, "getMDFromNote")
  return ""
}
  }
  static highlightEqualsContentReverse(markdown) {
      // 使用正则表达式匹配==xxx==的内容并替换为<mark>xxx</mark>
      return markdown.replace(/<mark>(.+?)<\/mark>/g, '==\$1==');
  }
/**
 * 
 * @param {object} vars 
 * @param {string} userInput 
 * @returns 
 */
  static getVarInfo(vars,preConfig = {}) {//对通用的部分先写好对应的值
    let config = preConfig
    let dateNow = Date.now()
    config.date = {
      now: new Date(dateNow).toLocaleString(),
      tomorrow: new Date(dateNow+86400000).toLocaleString(),
      yesterday: new Date(dateNow-86400000).toLocaleString(),
      year: new Date().getFullYear(),
      month: new Date().getMonth()+1,
      day: new Date().getDate(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes(),
      second: new Date().getSeconds()
    }

    if (vars.hasClipboardText) {
      config.clipboardText = MNUtil.clipboardText
    }
    if (vars.hasKnowledge) {
      config.knowledge = chatAIConfig.knowledge
    }
    if (vars.hasCurrentDocName) {
      config.currentDocName = MNUtil.currentDocController.document.docTitle
    }
    config.hideOnSelectionText = function (value) {//不能返回空字符串
      // MNUtil.showHUD("message"+this.isSelectionText)
      if (this.isSelectionText) {
        return " "
      }else{
        return value
      }
    }
    config.hideOnSelectionImage = function (value) {
      if (this.isSelectionImage) {
        return " "
      }else{
        return value
      }
    }
    config.hideOnNote = function (value) {
      if (this.note) {
        return " "
      }else{
        return value
      }
    }
    config.hideOnVision = function (value) {
      if (this.visionMode) {
        return " "
      }else{
        return value
      }
    }
    return config
  }
  /**
   * 
   * @param {MbBook|string} doc 
   * @returns 
   */
  static async getDocObject(doc,opt = {withContent:false}) {
    if (typeof doc === "string") {
      doc = MNUtil.getDocById(doc)
    }
    if (!doc) {
      return undefined
    }
    let docConfig = {}
    docConfig.id = doc.docMd5
    docConfig.name = doc.docTitle
    let tem = {
      name:doc.docTitle,
      path:doc.fullPathFileName,
      md5:doc.docMd5,
    }
    let PDFExtractMode = chatAIConfig.getConfig("PDFExtractMode")
    if (opt.withContent) {
      chatAIUtils.log("getDocObject withContent", tem)
      let fileInfo = await chatAIConfig.getFileContent(tem,PDFExtractMode === "local")
      if (!fileInfo) {
        return undefined
      }
      // MNUtil.log(typeof fileInfo)
      docConfig.content = fileInfo.content
    }
    let notebookId = doc.currentTopicId
    if (notebookId) {
      docConfig.notebook = {
        id:notebookId,
        name:MNUtil.getNoteBookById(notebookId).title,
      }
    }
    docConfig.pageCount = doc.pageCount
    return docConfig
  }
  static _currentSelection = {}
  /**
   * 返回选中的内容，如果没有选中，则onSelection属性为false
   * 如果有选中内容，则同时包括text和image，并通过isText属性表明当时是选中的文字还是图片
   * @returns {{onSelection: boolean, image: null|undefined|NSData, text: null|undefined|string, isText: null|undefined|boolean,docMd5:string|undefined,pageIndex:number|undefined}} The current selection details.
   */
  static get currentSelection() {
  let dateNow = Date.now()
    if (this.selectionRefreshTime) {
      if (dateNow - this.selectionRefreshTime > 100) {//超过100ms，重新获取选区信息
        this.selectionRefreshTime = dateNow
        this._currentSelection = MNUtil.currentSelection
        return this._currentSelection
      }else{
        return this._currentSelection
      }
    }else{
      this.selectionRefreshTime = dateNow
      this._currentSelection = MNUtil.currentSelection
      return this._currentSelection
    }
  }
  /**
   * @param {{first:boolean,parentLevel:number,parent:boolean,child:boolean}} opt 
   * @param {MNNote} note 
   */
  static async getNoteObject(note,opt={first:true,noteInfo:{}}) {
    try {
    if (!note) {
      return undefined
    }
    // MNUtil.log("Parentlevel: "+opt.parentLevel)
    let noteInfo = opt.noteInfo
      
    let noteConfig = {}
    noteConfig.id = note.noteId
    if (opt.first) {
      noteConfig.notebook = {
        id:note.notebookId,
        name:MNUtil.getNoteBookById(note.notebookId).title,
      }
    }
    noteConfig.title = this.removeMarkdownHeadingsFromTitle(note.noteTitle)
    noteConfig.url = note.noteURL
    noteConfig.excerptText = note.excerptText
    noteConfig.isMarkdownExcerpt = note.excerptTextMarkdown
    let isBlankNote = this.isBlankNote(note)
    if (note.excerptPic && !isBlankNote) {
      noteConfig.isImageExcerpt = true
    }else{
      noteConfig.isImageExcerpt = false
    }
    noteConfig.date = {
      create:note.createDate.toLocaleString(),
      modify:note.modifiedDate.toLocaleString(),
    }
    noteConfig.allText = note.allNoteText()
    noteConfig.content = note.allText
    noteConfig.tags = note.tags
    noteConfig.hashTags = note.tags.map(tag=> ("#"+tag)).join(" ")
    noteConfig.hasTag = note.tags.length > 0
    noteConfig.hasComment = note.comments.length > 0
    noteConfig.hasChild = note.childNotes.length > 0
    noteConfig.hasText = !!noteConfig.allText
    let AllColors = ["LightYellow", "LightGreen", "LightBlue", "LightRed", "Yellow", "Green", "Blue", "Red", "Orange", "DarkGreen", "DarkBlue", "DeepRed", "White", "LightGray", "DarkGray", "Purple"]
    noteConfig.colorString = AllColors[note.colorIndex] ?? "White"
    if (note.colorIndex !== undefined) {
      noteConfig.color = {}
      noteConfig.color.lightYellow = note.colorIndex === 0
      noteConfig.color.lightGreen = note.colorIndex === 1
      noteConfig.color.lightBlue = note.colorIndex === 2
      noteConfig.color.lightRed = note.colorIndex === 3
      noteConfig.color.yellow = note.colorIndex === 4
      noteConfig.color.green = note.colorIndex === 5
      noteConfig.color.blue = note.colorIndex === 6
      noteConfig.color.red = note.colorIndex === 7
      noteConfig.color.orange = note.colorIndex === 8
      noteConfig.color.darkGreen = note.colorIndex === 9
      noteConfig.color.darkBlue = note.colorIndex === 10
      noteConfig.color.deepRed = note.colorIndex === 11
      noteConfig.color.white = note.colorIndex === 12
      noteConfig.color.lightGray = note.colorIndex === 13
      noteConfig.color.darkGray = note.colorIndex === 14
      noteConfig.color.purple = note.colorIndex === 15
    }
    if (note.docMd5 && MNUtil.getDocById(note.docMd5)) {
      let startPage = note.note.startPage
      let endPage = note.note.endPage
      let pageRange = undefined
      if (startPage !== undefined && endPage !== undefined) {
        pageRange = {startPage,endPage}
      }
      let docObject = await this.getDocObject(MNUtil.getDocById(note.docMd5),{withContent:noteInfo.hasNoteDoc,pageRange:pageRange}) 
      if (!docObject) {
        return undefined
      }
      noteConfig.doc = docObject
      noteConfig.hasDoc = true
    }else{
      noteConfig.hasDoc = false
    }
    if (note.childMindMap) {
      // noteInfo.hasChildMindMap = false
      noteConfig.childMindMap = await this.getNoteObject(note.childMindMap,{first:false})
    }
    noteConfig.inMainMindMap = !noteConfig.childMindMap
    noteConfig.inChildMindMap = !!noteConfig.childMindMap
    if (opt.parent && note.parentNote) {
      if ("parentLevel" in opt && opt.parentLevel > 0) {
        noteConfig.parent = await this.getNoteObject(note.parentNote,{parentLevel:opt.parentLevel-1,parent:true,first:false})
      }else{//只要opt.parent为true，则即使parentLevel为0，也要获取父笔记
      // MNUtil.log("Get parent: "+opt.parentLevel)
        noteConfig.parent = await this.getNoteObject(note.parentNote,{first:false})
      }
    }
    // noteConfig.hasParent = "parent" in noteConfig
    if (opt.child && note.childNotes) {
      // MNUtil.log("Get child")
      noteConfig.child = await Promise.all(note.childNotes.map(note=>this.getNoteObject(note,{first:false})))
    }
    return noteConfig
    } catch (error) {
      this.addErrorLog(error, "getNoteObject")
      return undefined
    }
  }
  
  static replacVar(text,varInfo) {
    let vars = Object.keys(varInfo)
    let original = text
    for (let i = 0; i < vars.length; i++) {
      const variable = vars[i];
      const variableText = varInfo[variable]
      const regex = new RegExp(`{{${variable}}}`, 'g');
      original = original.replace(regex,variableText)
    }
    // copy(original)
    return original
  }

  static detectAndReplace(text,element=undefined) {
    let config = this.getVarInfo(text)
    if (element !== undefined) {
      config.element = element
    }
    return this.replacVar(text,config)
  }

  static checkHeight(height){
    if (height > 400) {
      return 400
    }else if(height < 80){
      return 80
    }else{
      return height
    }
  }
  static addObserver(observer,selector,name){
    NSNotificationCenter.defaultCenter().addObserverSelectorName(observer, selector, name);
  }
  static removeObserver(observer,name){
    NSNotificationCenter.defaultCenter().removeObserverName(observer, name);
  }
  static studyMode(){
    return this.studyController().studyMode
  }
  static openURL(url){
    if (!this.app) {
      this.app = Application.sharedInstance()
    }
    this.app.openURL(NSURL.URLWithString(url));
  }
  static ensureChatAIController(){
    if (!this.chatController) {
      this.chatController = chatglmController.new();
      MNUtil.studyView.addSubview(this.chatController.view)
      this.chatController.view.hidden = true;
    }else{
      this.ensureView(this.chatController.view)
    }
  }
  static initChatAIController(){
    this.chatController = chatglmController.new();
    MNUtil.studyView.addSubview(this.chatController.view)
  }
  static ensureNotifyController(){
    if (!this.notifyController) {
      this.notifyController = notificationController.new();
      MNUtil.currentWindow.addSubview(this.notifyController.view)
      // MNUtil.studyView.addSubview(this.notifyController.view)
      this.notifyController.view.hidden = true
      this.notifyController.view.frame = {x:50,y:50,width:400,height:120}
      this.notifyController.currentFrame = {x:50,y:50,width:400,height:120}
    }else
      this.ensureViewInCurrentWindow(this.notifyController.view)
  }
  static initDynamicController(){
    this.dynamicController = dynamicController.new();
    MNUtil.studyView.addSubview(this.dynamicController.view)
  }
  static isIOS(){
    //把宽度过低的情况也当做是iOS模式
    return (MNUtil.studyView.bounds.width < 500)
  }
  static getWidth(){
    if (this.isIOS()) {
      return MNUtil.studyView.bounds.width
    }else{
      if (chatAIConfig.getConfig("narrowMode")) {
        return 310
      }else{
        return 400
      }
    }
  }
  static getHeight(){
    if (this.isIOS()) {
      return MNUtil.currentWindow.bounds.height-this.getY()-30
    }else{
      return MNUtil.currentWindow.bounds.height-this.getY()
    }
  }
  static getY(){
    // return 75
    if (this.isIOS()) {
      return 0
    }else{
      return 75
    }
  }
  static getX(){
    let narrowMode = chatAIConfig.getConfig("narrowMode")
    let notifyLoc = chatAIUtils.isIOS()?0:chatAIConfig.config.notifyLoc
    switch (notifyLoc) {
      case 0:
        if (this.isIOS()) {
          return 0
        }else{
          if (narrowMode) {return 5}
          return 50
        }
      case 1:
        if (this.isIOS()) {
          return MNUtil.currentWindow.bounds.width-450
        }else{
          if (narrowMode) {return MNUtil.currentWindow.bounds.width-315}
          return MNUtil.currentWindow.bounds.width-450
        }
      default:
        break;
    }
    return 0
  }
  static sidebarMode(){
    return !this.isIOS()
  }
  static onChat(){
    if (this.sidebarMode()) {
      if (!MNExtensionPanel.on) {
        return false
      }
      let targetView = MNExtensionPanel.subview("chatAISideOutputView")
      if (targetView) {
        return !targetView.hidden
      }
      return false
    }else{
      return this.notifyController.onChat
    }
  }
  /**
   * Retrieves the image data from the current document controller or other document controllers if the document map split mode is enabled.
   * 
   * This method checks for image data in the current document controller's selection. If no image is found, it checks the focused note within the current document controller.
   * If the document map split mode is enabled, it iterates through all document controllers to find the image data. If a pop-up selection info is available, it also checks the associated document controller.
   * @param {MbBookNote|MNNote} note 
   * @param {boolean} [checkTextFirst = false] - Whether to check the text first.
   * @returns {boolean} The image data if found, otherwise undefined.
   */
  static hasImageInNote(note,checkTextFirst = false) {
    if (note.excerptPic) {
      let isBlankNote = MNUtil.isBlankNote(note)
      if (isBlankNote) {//实际为文字留白
        let text = note.excerptText
        if (note.excerptTextMarkdown) {
          if (this.hasMNImages(text.trim())) {
            return true
          }
        }
      }else{
        if (checkTextFirst && note.textFirst) {
          //检查发现图片已经转为文本，因此略过
        }else{
          return true
        }
      }
    }else{
      let text = note.excerptText
      if (note.excerptTextMarkdown) {
        if (this.hasMNImages(text.trim())) {
          return true
        }else{
          // MNUtil.log("No images found in excerptTextMarkdown")
        }
      }
    }
    if (note.comments.length) {
      for (let i = 0; i < note.comments.length; i++) {
        const comment = note.comments[i];
        switch (comment.type) {
          case "PaintNote":
            if (comment.paint) {
              return true
            }
            break;
          case "LinkNote":
            if (comment.q_hpic && comment.q_hpic.paint) {
              return true
            };
            break;
          case "TextNote":
            if (comment.markdown) {
              if (this.hasMNImages(comment.text)) {
                return true
              }
            }
            break;
          default:
            break;
        }
        // if (comment.type === 'PaintNote' && comment.paint) {
        //   imageDatas.push(MNUtil.getMediaByHash(comment.paint))
        // }else if (comment.type === "LinkNote" && comment.q_hpic && comment.q_hpic.paint) {
        //   imageDatas.push(MNUtil.getMediaByHash(comment.q_hpic.paint))
        // }
      }
    }
    return false
  }
  /**
   * 
   * @param {MbBookNote|MNNote} note 
   * @param {boolean} OCR_enabled 
   * @returns {Promise<string>}
   */
  static async getExcerptText(note,OCR_enabled=false) {
    let text = ""
    if (MNUtil.isBlankNote(note)) {//单独处理留白笔记
      if (note.excerptText) {
        text = note.excerptText+"\n"
      }else{
        text = ""
      }
    }else{
      if (OCR_enabled && note.excerptPic && !note.textFirst) {
        let image = MNUtil.getMediaByHash(note.excerptPic.paint)
        text = await chatAINetwork.getTextOCR(image)+"\n"
        // text = ""
      }else if (this.noteHasExcerptText(note)) {
        text = note.excerptText+"\n"
      }
    }
    return text
  }
  /**
   * 
   * @param {MbBookNote|MNNote} note 
   */
  static async getTextForSearch(note,OCR_enabled=false) {
    let order = chatAIConfig.getConfig("searchOrder")
    let text = ""
    for (let index = 0; index < order.length; index++) {
      const element = order[index];
      switch (element) {
        case 1:
          if (note.noteTitle && note.noteTitle !== "") {
            text = note.noteTitle
          }
          break;
        case 2:
          let notes = note.notes
          for (let i = 0; i < notes.length; i++) {
            const n = notes[i];
            text = text + await this.getExcerptText(n,OCR_enabled)
          }
          // if (MNUtil.isBlankNote(note)) {//单独处理留白笔记
          //   text = note.excerptText??""
          // }else{
          //   if (OCR_enabled && note.excerptPic && !note.textFirst) {
          //     let image = MNUtil.getMediaByHash(note.excerptPic.paint)
          //     text = await chatAINetwork.getTextOCR(image)
          //     // text = ""
          //   }else if (this.noteHasExcerptText(note)) {
          //     text = note.excerptText
          //   }
          // }
          //如果都不满足，此时text依然为undefined
          break;
        case 3:
          let commentText
          let commentImage = undefined
          //用find主要是保证得到想要的元素之后就会直接返回，而不是继续执行
          //但是find处理不了异步的情况
          let comment = note.comments.find(comment=>{
            switch (comment.type) {
              case "TextNote":
                if (/^marginnote\dapp:\/\//.test(comment.text)) {
                  return false
                }else{
                  commentText = comment.text
                  return true
                }
              case "HtmlNote":
                commentText = comment.text
                return true
              case "LinkNote":
                if (comment.q_hpic && !note.textFirst) {
                  if (OCR_enabled) {
                    commentImage = MNUtil.getMediaByHash(comment.q_hpic.paint)
                    // commentText = await chatAINetwork.getTextOCR(commentImage)
                    return true
                  }else{
                    return false
                  }
                }else{
                  commentText = comment.q_htext
                  return true
                }
              case "PaintNote":
                if (OCR_enabled && comment.paint) {
                  commentImage = MNUtil.getMediaByHash(comment.paint)
                  // commentText = await chatAINetwork.getTextOCR(commentImage)
                  return true
                }
                return false
              default:
                return false
            }
          })
          if (commentImage) {
            MNUtil.showHUD("should OCR")
            commentText = await chatAINetwork.getTextOCR(commentImage)
            // MNUtil.copy(commentText)
          }
          if (commentText && commentText.length) {
            text = commentText
          }
          break;
        case 4:
          text = this.getMDFromNote(note)
          break;
        default:
          break;
      }
      if (text) {
        return text
      }
    }
    return undefined
  }
  static hasMNImages(markdown) {
    try {
      if (!markdown) {
        return false
      }
      if (!markdown.trim()) {
        return false
      }
      // 匹配 base64 图片链接的正则表达式，支持png和jpeg
      // let res = markdown.match(this.MNImagePattern)
      // let link = markdown.match(MNImagePattern)
      // console.log(link);
      
      // MNUtil.copyJSON({"a":link,"b":markdown})
      return markdown.match(this.MNImagePattern)?true:false
    } catch (error) {
      this.addErrorLog(error, "hasMNImages")
      return false
    }
  }
  /**
   * 只返回第一个图片
   * @param {string} markdown 
   * @returns {NSData}
   */
  static getMNImageFromMarkdown(markdown) {
    try {
      let res = markdown.match(this.MNImagePattern)
      if (!res || !res.length) {
        return undefined
      }
      let link = res[0]
      let hash = undefined
      // this.log("getMNImageFromMarkdown", link)
      if (link.includes("markdownimg/jpeg/")) {
        hash = link.split("markdownimg/jpeg/")[1].slice(0,-1)
      }else if (link.includes("markdownimg/png/")) {
        hash = link.split("markdownimg/png/")[1].slice(0,-1)
      }
      if (!hash) {
        return undefined
      }
      let imageData = MNUtil.getMediaByHash(hash)
      return imageData
    } catch (error) {
      this.addErrorLog(error, "getMNImageFromMarkdown")
      return undefined
    }
  }
  /**
   * Retrieves the image data from the current document controller or other document controllers if the document map split mode is enabled.
   * 
   * This method checks for image data in the current document controller's selection. If no image is found, it checks the focused note within the current document controller.
   * If the document map split mode is enabled, it iterates through all document controllers to find the image data. If a pop-up selection info is available, it also checks the associated document controller.
   * @param {MbBookNote|MNNote} note 
   * @param {boolean} [checkTextFirst = false] - Whether to check the text first.
   * @returns {NSData[]|undefined} The image data if found, otherwise undefined.
   */
  static getImagesFromNote(note,checkTextFirst = false) {
    let imageDatas = []
    if (note.excerptPic) {
      let isBlankNote = MNUtil.isBlankNote(note)
      if (isBlankNote) {//实际为文字留白
        let text = note.excerptText
        if (note.excerptTextMarkdown) {
          if (this.hasMNImages(text.trim())) {
            imageDatas.push(this.getMNImageFromMarkdown(text))
          }
        }
      }else{
        if (checkTextFirst && note.textFirst) {
          //检查发现图片已经转为文本，因此略过
        }else{
          imageDatas.push(MNUtil.getMediaByHash(note.excerptPic.paint))
        }
      }
    }else{
      let text = note.excerptText
      if (note.excerptTextMarkdown) {
        if (this.hasMNImages(text.trim())) {
          imageDatas.push(this.getMNImageFromMarkdown(text))
        }else{
          // MNUtil.log("No images found in excerptTextMarkdown")
        }
      }
    }
    if (note.comments.length) {
      for (let i = 0; i < note.comments.length; i++) {
        const comment = note.comments[i];
        switch (comment.type) {
          case "PaintNote":
            if (comment.paint) {
              imageDatas.push(MNUtil.getMediaByHash(comment.paint))
            }
            break;
          case "LinkNote":
            if (comment.q_hpic && comment.q_hpic.paint) {
              imageDatas.push(MNUtil.getMediaByHash(comment.q_hpic.paint))
            };
            break;
          case "TextNote":
            if (comment.markdown) {
              if (this.hasMNImages(comment.text)) {
                imageDatas.push(this.getMNImageFromMarkdown(comment.text))
              }
            }
            break;
          default:
            break;
        }
        // if (comment.type === 'PaintNote' && comment.paint) {
        //   imageDatas.push(MNUtil.getMediaByHash(comment.paint))
        // }else if (comment.type === "LinkNote" && comment.q_hpic && comment.q_hpic.paint) {
        //   imageDatas.push(MNUtil.getMediaByHash(comment.q_hpic.paint))
        // }
      }
    }
    return imageDatas
  }
  static async getInfoForReference(dynamic = false,returnAfterOCR = true) {
    try {
      let info = {userInput:"",ocr:false}
      let note = this.currentNote()
      if (note) {
        info.userInput = `{{note:${this.currentNoteId}}}`
        // let hasImage = chatAIUtils.hasImageInNote(note)
        let imageDatas = this.getImagesFromNote(note,true)
        let numberOfImages = imageDatas.length
        // let imageData = note.imageData
        if (numberOfImages) {//检查是否包含图片
          let autoImage = chatAIConfig.getConfig("autoImage")
          if (dynamic) {
            let config = chatAIConfig.getDynmaicConfig()
            autoImage = chatAIUtils.isVisionModel(config.model)
          }
          let autoOCR = chatAIConfig.getConfig("autoOCR")
          if (autoImage || autoOCR) {//如果同时开启了自动图片和自动OCR，则只有当图片存在时才会调用OCR
            if (autoImage) {//将图片添加到引用框中
              info.imageData = imageDatas[0]
              if (numberOfImages > 1) {
                info.imageDatas = imageDatas
              }
              return info
            }else if (autoOCR) {//对图片进行OCR
              if (returnAfterOCR) {
                let text = await chatAINetwork.getTextOCR(imageDatas[0])
                if (numberOfImages > 1) {
                  for (let i = 1; i < numberOfImages; i++) {
                    const image = imageDatas[i]
                    const tem = await chatAINetwork.getTextOCR(image)
                    text = text + "\n" + tem
                  }
                }
                info.userInput = text
              }
              info.ocr = true
              return info
            }
          }
        }
        return info
      }
      let selection = this.getCurrentSelectionObject()
      if (selection.onSelection) {//文档上存在选区
        info.userInput = selection.text
        if (selection.type === "text") {//选区为文本
          // let autoOCR = chatAIConfig.getConfig("autoOCR")
          // if (autoOCR) {//如果开启了自动OCR，则只有当图片存在时才会调用OCR
          //   let text = await chatAINetwork.getTextOCR(selection.image)
          //   info.userInput = text
          //   info.ocr = true
          // }
          return info
        }else{//选区为图片
          let autoImage = chatAIConfig.getConfig("autoImage")
          let autoOCR = chatAIConfig.getConfig("autoOCR")
          if (dynamic) {
            let config = chatAIConfig.getDynmaicConfig()
            autoImage = chatAIUtils.isVisionModel(config.model)
          }
          if (autoImage || autoOCR) {//如果同时开启了自动图片和自动OCR，则只有当图片存在时才会调用OCR
            let imageData = chatAIUtils.getImageById(selection.imageId)
            if (autoImage) {//将图片添加到引用框中
              info.imageData = imageData
              return info
            }else if (autoOCR) {
              if (returnAfterOCR) {
                let text = await chatAINetwork.getTextOCR(imageData)
                info.userInput = text
              }
              info.ocr = true
              return info
            }
          }
        }
        return info
      }
      note = chatAIUtils.getFocusNote()
      if (note) {
        info.userInput = `{{note:${note.noteId}}}`
        let imageDatas = this.getImagesFromNote(note,true)
        // let imageData = note.imageData
        let numberOfImages = imageDatas.length
        if (numberOfImages) {//检查是否包含图片
          let autoImage = chatAIConfig.getConfig("autoImage")
          let autoOCR = chatAIConfig.getConfig("autoOCR")
          if (dynamic) {
            let config = chatAIConfig.getDynmaicConfig()
            autoImage = chatAIUtils.isVisionModel(config.model)
          }
          if (autoImage || autoOCR) {//如果同时开启了自动图片和自动OCR，则只有当图片存在时才会调用OCR
            if (autoImage) {//将图片添加到引用框中
              info.imageData = imageDatas[0]
              if (numberOfImages > 1) {
                info.imageDatas = imageDatas
              }
              return info
            }else if (autoOCR) {
              if (returnAfterOCR) {
                let text = await chatAINetwork.getTextOCR(imageDatas[0])
                if (numberOfImages > 1) {
                  for (let i = 1; i < numberOfImages; i++) {
                    const image = imageDatas[i]
                    const tem = await chatAINetwork.getTextOCR(image)
                    text = text + "\n" + tem
                  }
                }
                info.userInput = text
              }
              info.ocr = true
              return info
            }
          }
        }
      }
      return info
    } catch (error) {
      chatAIUtils.addErrorLog(error, "getInfoForReference")
      return undefined
    }
  }
static async getInfoForDynamic() {
    // chatAIUtils.log("focusHistory",MNUtil.focusHistory)
    try {
      let info = {userInput:"",ocr:false,autoImage:false,autoOCR:false}
      let note = this.currentNote()
      if (note) {
        info.userInput = `{{note:${this.currentNoteId}}}`
        let hasImage = this.hasImageInNote(note,true)
        chatAIUtils.log("hasImage: "+hasImage)
        // let imageData = note.imageData
        if (hasImage) {//检查是否包含图片
          info.hasImage = true
          let autoImage = chatAIConfig.getConfig("autoImage")
          if (autoImage) {
            let config = chatAIConfig.getDynmaicConfig()
            //进一步通过视觉模式检查
            autoImage = chatAIUtils.isVisionModel(config.model)
            info.autoImage = true
            info.autoOCR = false
            return info
          }
          //此时autoImage为false
          let autoOCR = chatAIConfig.getConfig("autoOCR")
          if (autoOCR) {//如果同时开启了自动图片和自动OCR，则只有当图片存在时才会调用OCR
            if (autoOCR) {//对图片进行OCR
              info.autoOCR = true
              info.autoImage = false
              info.ocr = true
              return info
            }
          }
        }
        return info
      }
      let selection = this.getCurrentSelectionObject()
      if (selection.onSelection) {//文档上存在选区
        info.userInput = selection.text
        if (selection.type === "text") {//选区为文本
          // let autoOCR = chatAIConfig.getConfig("autoOCR")
          // if (autoOCR) {//如果开启了自动OCR，则只有当图片存在时才会调用OCR
          //   let text = await chatAINetwork.getTextOCR(selection.image)
          //   info.userInput = text
          //   info.ocr = true
          // }
          return info
        }else{//选区为图片
          let autoImage = chatAIConfig.getConfig("autoImage")
          let autoOCR = chatAIConfig.getConfig("autoOCR")
          if (autoImage) {
            let config = chatAIConfig.getDynmaicConfig()
            autoImage = chatAIUtils.isVisionModel(config.model)
            info.autoImage = true
            info.autoOCR = false
            return info
          }
          //此时autoImage为false
          if (autoOCR) {//如果同时开启了自动图片和自动OCR，则只有当图片存在时才会调用OCR
            info.autoOCR = true
            info.autoImage = false
            info.ocr = true
            return info
          }
        }
      }
      note = chatAIUtils.getFocusNote()
      if (note) {
        info.userInput = `{{note:${note.noteId}}}`
        let hasImage = this.hasImageInNote(note,true)
        // let imageData = note.imageData
        if (hasImage) {//检查是否包含图片
          let autoImage = chatAIConfig.getConfig("autoImage")
          let autoOCR = chatAIConfig.getConfig("autoOCR")
          if (autoImage) {
            let config = chatAIConfig.getDynmaicConfig()
            autoImage = chatAIUtils.isVisionModel(config.model)
            info.autoImage = true
            info.autoOCR = false
            return info
          }
          //此时autoImage为false
          if (autoOCR) {//如果同时开启了自动图片和自动OCR，则只有当图片存在时才会调用OCR
            info.ocr = true
            info.autoOCR = true
            info.autoImage = false
            return info
          }
        }
      }
      return info
    } catch (error) {
      chatAIUtils.addErrorLog(error, "getInfoForDynamic")
      return undefined
    }
  }
  static getToday() {
    // 创建一个新的Date对象，默认情况下它会包含当前日期和时间
    const today = new Date();

    // 获取日
    const day = today.getDate();
    return day
  }
  static switchColor(on123){
    let color = on123 ? "#457bd3" : "#9bb2d6"
    return this.hexColorAlpha(color,0.8)
  }
  static countWords(str) {
    const chinese = Array.from(str)
      .filter(ch => /[\u4e00-\u9fa5]/.test(ch))
      .length
    
    const english = Array.from(str)
      .map(ch => /[a-zA-Z0-9\s]/.test(ch) ? ch : ' ')
      .join('').split(/\s+/).filter(s => s)
      .length

    return chinese + english
  }
  static animate(func,time = 0.2) {
    UIView.animateWithDurationAnimationsCompletion(time,func)
  }

  static animateWithCompletion(func,funcWhenCompleted,time = 0.2) {
    UIView.animateWithDurationAnimationsCompletion(time,func,funcWhenCompleted)
  }
  static checkSender(sender,window){
    return this.app.checkNotifySenderInWindow(sender, window)
  }
  static getFileName(fullPath) {
      // 找到最后一个'/'的位置
    let lastSlashIndex = fullPath.lastIndexOf('/');

      // 从最后一个'/'之后截取字符串，得到文件名
    let fileName = fullPath.substring(lastSlashIndex + 1);

    return fileName;
  }
  static noteExists(noteId){
    let note = this.data.getNoteById(noteId)
    if (note) {
      return true
    }
    return false
  }
  static isfileExists(path) {
    return NSFileManager.defaultManager().fileExistsAtPath(path)
  }

  static getCurrentFile() {
    let docController = this.currentDocController()
    let docFile = docController.document
    let currentPageNo = docController.currPageNo
    let pageCount = docFile.pageCount
    // copy(docFile.pathFile)
    let fullPath
    if (docFile.fullPathFileName) {
      fullPath = docFile.fullPathFileName
    }else{
      let folder = this.app.documentPath
      fullPath = folder+"/"+docFile.pathFile
      if (docFile.pathFile.startsWith("$$$MNDOCLINK$$$")) {
        let fileName = this.getFileName(docFile.pathFile)
        fullPath = this.app.tempPath + fileName
        // fullPath = docFile.pathFile.replace("$$$MNDOCLINK$$$", "/Users/linlifei/")
      }
    }
    // copy(fullPath)
    let fileName = docFile.docTitle
    return{
      name:fileName,
      path:fullPath,
      md5:docFile.docMd5,
      currentPageNo:currentPageNo,
      pageCount:pageCount,
      fileExists:MNUtil.isfileExists(fullPath)
    }
  }
  static getNoteFileName(noteId) {
    let note = MNUtil.getNoteById(noteId)
    let docFile = MNUtil.getDocById(note.docMd5)
    if (!docFile) {
      MNUtil.showHUD("No file")
      return undefined
    }
    return MNUtil.getFileName(docFile.pathFile)
  }
  static getNoteFile(noteId) {
    let note = MNUtil.getNoteById(noteId)
    let docFile = MNUtil.getDocById(note.docMd5)
    if (!docFile) {
      MNUtil.showHUD("No file")
      return {
        fileExists:false
      }
    }
    let fullPath
    if (docFile.fullPathFileName) {
      fullPath = docFile.fullPathFileName
    }else{
      let folder = MNUtil.documentFolder
      let fullPath = folder+"/"+docFile.pathFile
      if (docFile.pathFile.startsWith("$$$MNDOCLINK$$$")) {
        let fileName = this.getFileName(docFile.pathFile)
        fullPath = Application.sharedInstance().tempPath + fileName
        // fullPath = docFile.pathFile.replace("$$$MNDOCLINK$$$", "/Users/linlifei/")
      }
    }
    // copy(fullPath)
    let fileName = docFile.docTitle
    return{
      name:fileName,
      path:fullPath,
      md5:docFile.docMd5,
      fileExists:MNUtil.isfileExists(fullPath),
      pageCount:docFile.pageCount
    }
  }
  static isValidJSON(jsonString){
    try{
      var json = JSON.parse(jsonString);
      if (json && typeof json === "object") {
        return true;
      }
    }
    catch(e){
      return false;
    }
    return false;
  }
  /**
   * 
   * @param {MNNote|MbBookNote} note 
   * @returns 
   */
  static noteHasExcerptText(note) {
    //当摘要文本存在且没有评论时,不管是否是图片摘录,都返回true
    if (note.excerptText && note.excerptText.trim() && (note.comments.length === 0)) {
      return true
    }
    //考虑到可能存在图片摘要，因此要么图片摘要不存在，要么图片摘要已被转为文本
    let isBlankNote = this.isBlankNote(note)//指有图片摘录但图片分辨率为1x1的空白图片
    if (isBlankNote) {
      return note.excerptText && note.excerptText !== ""
    }
    return note.excerptText && note.excerptText !== "" && (!note.excerptPic || note.textFirst)
  }
  static strCode(str) {  //获取字符串的字节数
    var count = 0;  //初始化字节数递加变量并获取字符串参数的字符个数
    var cn = [8211, 8212, 8216, 8217, 8220, 8221, 8230, 12289, 12290, 12296, 12297, 12298, 12299, 12300, 12301, 12302, 12303, 12304, 12305, 12308, 12309, 65281, 65288, 65289, 65292, 65294, 65306, 65307, 65311]
    var half = [32, 33, 34, 35, 36, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96, 123, 124, 125, 126,105,108,8211]
    if (str) {  //如果存在字符串，则执行
      let len = str.length;
        for (var i = 0; i < len; i++) {  //遍历字符串，枚举每个字符
        let charCode = str.charCodeAt(i)
            if (charCode>=65 && charCode<=90) {
              count += 1.5;  //大写
        } else if (half.includes(charCode)) {
              count +=0.45
        } else if (cn.includes(charCode)) {
              count +=0.8
            }else if (charCode > 255) {  //字符编码大于255，说明是双字节字符(即是中文)
                count += 2;  //则累加2个
            }else{
                count++;  //否则递加一次
            }
        }
        return count;  //返回字节数
    } else {
        return 0;  //如果参数为空，则返回0个
    }
  }
  /**
   * 
   * @param {any[]} arr 
   * @returns 
   */
  static getRandomElement(arr) {
    if (arr.length === 1) {
      return arr[0]
    }
    if (arr && arr.length) {
      const randomIndex = Math.floor(Math.random() * arr.length);
      return arr[randomIndex];
    }
    return ""; // 或者抛出一个错误，如果数组为空或者未定义
  }
  static focusNoteInMindMapById(noteId){
    this.studyController().focusNoteInMindMapById(noteId)
  }
  /**
   * 
   * @param {*} func 
   * @param {number} ms 毫秒
   */
  static setTimeout(func,ms){
    NSTimer.scheduledTimerWithTimeInterval(ms/1000, false, function () {
      func()
    })
  }
  /**
   * 
   * @param {*} func 
   * @param {number} ms 毫秒
   */
  static setInterval(func,ms){
    let timer = NSTimer.scheduledTimerWithTimeInterval(ms/1000, true, function () {
      func()
    })
    return timer
  }
  /**
   * 
   * @param {NSTimer} timer 
   */
  static clearInterval(timer){
    timer.invalidate()
  }
  /**
   * 
   * @param {number} seconds 
   * @returns {Promise<void>}
   */
  static async delay (seconds) {
    return new Promise((resolve, reject) => {
      NSTimer.scheduledTimerWithTimeInterval(seconds, false, function () {
        resolve()
      })
    })
  }
  static getFile(path) {
    if (MNUtil.isfileExists(path)) {
      return NSData.dataWithContentsOfFile(path)
    }
    MNLog.error("getFile: file not exists",{detail:path})
    return undefined
  }
  static refreshCurrent(){
    try {
      this.currentSelectionText = this.currentDocController().selectionText
      let focusNote = this.getFocusNote(false)
      if (focusNote) {
        this.currentNoteId = focusNote.noteId
      }else{
        this.currentNoteId = undefined
      }
    } catch (error) {
      this.addErrorLog(error, "refreshCurrent")
    }
  }
  static getPopoverAndPresent(sender,commandTable,width=100,position=2) {
    var menuController = MenuController.new();
    menuController.commandTable = commandTable
    menuController.rowHeight = 35;
    menuController.preferredContentSize = {
      width: width,
      height: menuController.rowHeight * menuController.commandTable.length
    };
    //左 0
    //下 1，3
    //上 2
    //右 4
    var popoverController = new UIPopoverController(menuController);
    var r = sender.convertRectToView(sender.bounds,MNUtil.studyView);
    popoverController.presentPopoverFromRect(r, MNUtil.studyView, position, true);
    return popoverController
  }
  static isActivated(msg = false){
    if (typeof subscriptionConfig !== 'undefined') {
      return subscriptionConfig.getConfig("activated")
    }else{
      if (msg) {
        this.showHUD("Set your API key or install 'MN Utils'")
      }
      return false
    }
    
  }
  static isSubscribed(msg = true){
    if (typeof subscriptionConfig !== 'undefined') {
      return subscriptionConfig.isSubscribed()
    }else{
      if (msg) {
        this.showHUD("Please install 'MN Utils' first!")
      }
      return false
    }
  }
  /**
   * count为true代表本次check会消耗一次免费额度（如果当天未订阅），如果为false则表示只要当天免费额度没用完，check就会返回true
   * 开启ignoreFree则代表本次check只会看是否订阅，不管是否还有免费额度
   * @param {boolean} count 
   * @param {boolean} msg 
   * @param {boolean} ignoreFree 
   * @returns {Boolean}
   */
  static checkSubscribe(count = true, msg = true,ignoreFree = false){
    // return true

    if (typeof subscriptionConfig !== 'undefined') {
      let res = subscriptionConfig.checkSubscribed(count,ignoreFree,msg)
      return res
    }else{
      if (msg) {
        this.showHUD("Please install 'MN Utils' first!")
      }
      return false
    }
  }
  static preCheck(config = chatAIConfig.config, freeOCR = false){
  try {
    // MNUtil.log({message:"preCheck",detail:config})
    

    if (this.isSubscribed()) {
      this.chatController.usageButton.setTitleForState("Unlimited",0)
      return true
    }
    if (config.source === "Built-in" || freeOCR) {
      let usage = chatAIConfig.getUsage()
      if (usage.usage >= usage.limit) {
        MNUtil.confirm("🤖 MN ChatAI", "Access limited\n访问受限\n\nYou have reached the usage limit for today. Please subscribe to continue or use other AI providers.\n\n 当天免费额度已用完，请订阅或使用其他AI提供商。")
        return false
      }else{
        usage.usage = usage.usage+1
        MNUtil.log({message:"usage",detail:usage})
      }
      if (this.chatController.usageButton) {
        this.chatController.usageButton.setTitleForState("Usage: "+usage.usage+"/100",0)
      }
      chatAIConfig.save("MNChatglm_usage")
    }
    return true
  } catch (error) {
    this.addErrorLog(error, "preCheck")
    return false
  }
  }
  /**
   * 
   * @param {MbBookNote} note
   * @returns {String[]}
   */
  static extractTagsFromNote(note) {
    // 用于存储所有标签的数组
    const tags = [];
    // 检查 note 是否有 comments 属性，且其为数组
    if (note.comments && Array.isArray(note.comments)) {
      // 遍历 comments 数组
      note.comments.forEach(comment => {
        // 检查评论的类型是否为 "TextNote"
        if (comment.type === "TextNote" && typeof comment.text === "string") {
          // 使用正则表达式查找所有标签（格式为 #tagname）
          const tagMatches = comment.text.match(/#[\w\u4e00-\u9fff]+/g);
          if (tagMatches) {
            // 将找到的标签添加到 tags 数组中
            tags.push(...tagMatches);
          }
        }
      });
    }

    // 返回去重后的标签数组
    return [...new Set(tags)];
  }
  /**
   * 
   * @param {*} arr1 
   * @param {*} arr2 
   * @returns {String[]}
   */
  static findCommonElements(arr1, arr2) {
    // 使用 filter() 方法和 includes() 方法找出相同的元素
    const commonElements = arr1.filter(element => arr2.includes(element));
    return commonElements;
  }
  static findSimilarPrompts(query, prompts) {//
    // 使用 filter() 方法和 includes() 方法找出相似的元素
    let targetQuery = query.trim()
    const commonElements = this.findCommonElements([targetQuery], prompts)
    if (commonElements.length) {
      return commonElements
    }
    let similarPrompts = prompts.filter(promptName=>promptName.includes(targetQuery))
    if (similarPrompts.length) {
      let prefixMatchedPrompts = prompts.filter(promptName=>promptName.startsWith(targetQuery))
      if (prefixMatchedPrompts.length) {
        return prefixMatchedPrompts
      }
      return similarPrompts
    }
    return [];
  }
  static findKeyByTitle(obj, titleValue) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key].title === titleValue) {
          return key;
        }
      }
    }
    return undefined; // 没有找到对应的 key
  }

  /**
   * 
   * @param {Array} resList 
   */
  static checkToolCalls(resList) {
    // MNUtil.copyJSON(resList)
    try {
    return resList.some(res=>{
        if (res && res.tool_calls && res.tool_calls.length) {
          return true
        }
        return false
      })
    } catch (error) {
      MNUtil.showHUD("Error in checkToolCalls: "+error)
      return false
    }
  }
  /**
   * 
   * @param {String} rawText 
   * @returns {{event:String,data:String}[]}
   */
  static parseEvents(rawText) {
    const lines = rawText.split('\n\n');
    // return lines
    const events = lines.map(line => {
      // 假设每行文本都是以 "event: " 开头，后面跟着事件类型，然后是数据
      const parts = line.split('\n');
      // const eventType = parts[0].split(': ')[1].trim();
      // const eventData = JSON.parse(parts.slice(1).join('\n'));
      let event = parts[0].split(':')[1]
      if (event) {
        let data = parts[1].slice(5)
        return {
          event: event.trim(),
          data: JSON.parse(data)
        };
      }else{
        return {
          event: ""
        };
      }
    });
    return events;
  }
/**
 * 
 * @param {String} str 
 * @returns {{results:Object[],usage:Object}}
 */
static parseDataChunks(str) {
  str = str.replace(/: OPENROUTER PROCESSING/g, '').trim();

  const regex = /data:\s*({[\s\S]*?})(?=\s*data:|$)/g;
  const results = [];//role,citation
  // const strChunks = []
  let match;
  let usage = {};
  
  while ((match = regex.exec(str)) !== null) {
    // MNUtil.log({message:"match",detail:match})
      const jsonStr = match[1];
      // strChunks.push(jsonStr)
    try {
      if (jsonStr === '' || jsonStr === '[DONE]') {
        continue;
      }
      const data = this.getValidJSON(jsonStr)
      const delta = data.choices[0]?.delta;
      if (delta) {
        results.push(delta);
      }
      if ("usage" in data) {
        usage = data.usage;
      }
      // results.push(data);
    } catch (e) {
      MNUtil.showHUD("Error in parseDataChunks: "+e.message)
      MNUtil.log({message:"error in parseDataChunks"+e.message,source:"MN ChatAI",level:"ERROR",detail:jsonStr})
    }
  }
  if (results.length === 0 && /data:\s/.test(str)) {
    let jsonStr = str.split("data:")[1]
    try {
      let data = this.getValidJSON(jsonStr)
      if (data && data.choices && data.choices.length) {
        const delta = data.choices[0]?.delta;
        results.push(delta);
        chatAIUtils.log("parseFirstDataChunk")
      }
      if ("usage" in data) {
        usage = data.usage;
      }
    } catch (error) {
      this.addErrorLog(error, "parseFirstDataChunk",{jsonStr:jsonStr,data:data})
    }
  }
  // chatAIUtils.log("parseDataChunks", {results:results,strChunks:strChunks})
  return {results:results,usage:usage};
}
  static parseData(originalText) {
  // 按行分割输入
  const lines = originalText.split('\n');

  // 初始化结果数组和缓冲区
  let result = [];
  let buffer = '';

  // 遍历每一行
  lines.forEach(line => {
    // 如果行以 "data:" 开头，表示可能是新的 JSON 块
    if (line.startsWith('data: ')) {
      // 将当前缓冲区的内容尝试解析
      buffer += line.slice(6);
    } else {
      //仅在缓冲区非空时进行拼接,即存在未成功解析的文本,有可能是错误按换行符切分的后果
      if (buffer.trim() && line.trim()) {
        buffer += (`\n`+line);
        // MNUtil.copy(buffer)
      }else{
        //如果上一行已经成功解析,但是又碰到非data开头的行,则忽略
        return
      }
    }
    if (buffer) {
      try {
        const jsonData = JSON.parse(buffer.trim());
        const content = jsonData.choices[0]?.delta?.content;
        if (content) {
          result.push(content);
        }
        buffer = '';//解析成功后清空缓存区
      } catch (error) {
        // 如果解析失败，忽略该缓冲区（可能是无效数据）
        chatAIUtils.addErrorLog(error, "parseData", buffer)
        // console.error('JSON 解析失败:', buffer.trim(), error);
      }
    }
  });

  // 处理最后一个缓冲区
  if (buffer) {
    try {
      const jsonData = JSON.parse(buffer.trim());
      const content = jsonData.choices[0]?.delta?.content;
      if (content) {
        result.push(content);
      }
    } catch (error) {
      console.error('JSON 解析失败:', buffer.trim(), error);
    }
  }

  // 拼接结果内容并返回
  return result;
}
  static codifyToolCall(funcName,args) {
    switch (funcName) {
    case "multi_tool_use.parallel":
      let preFix = `multi_tool_use(\n`
      let tool_uses = args.tool_uses
      let toolMessages = []
      tool_uses.map((tool_use,index)=>{
        switch (tool_use.recipient_name) {
          case "functions.setTitle":
            toolMessages.push("\t"+this.codifyToolCall("setTitle", {title:tool_use.parameters.title.trim()}))
            break;
          case "functions.addComment":
            toolMessages.push("\t"+this.codifyToolCall("addComment", {comment:tool_use.parameters.comment.trim()}))
            break;
          case "functions.addTag":
            toolMessages.push("\t"+this.codifyToolCall("addTag", {tag:tool_use.parameters.tag.trim()}))
            break;
          case "functions.copyMarkdownLink":
            toolMessages.push("\t"+this.codifyToolCall("copyMarkdownLink", {title:tool_use.parameters.title.trim()}))
            break;
          case "functions.copyCardURL":
            toolMessages.push("\t"+this.codifyToolCall("copyCardURL", {}))
            break;
          case "functions.copyText":
            toolMessages.push("\t"+this.codifyToolCall("copyText", {text:tool_use.parameters.text.trim()}))
            break;
          case "functions.addChildNote":
            toolMessages.push("\t"+this.codifyToolCall("addChildNote", {title:tool_use.parameters.title.trim(),content:tool_use.parameters.content.trim()}))
            break;
          case "functions.clearExcerpt":
            toolMessages.push("\t"+this.codifyToolCall("clearExcerpt", {}))
            break;
          case "functions.close":
            toolMessages.push("\t"+this.codifyToolCall("close", {}))
            break;
          case "functions.setExcerpt":
            toolMessages.push("\t"+this.codifyToolCall("setExcerpt", {excerpt:tool_use.parameters.excerpt.trim()}))
            break
          default:
            break;
        }
      })
      return preFix+toolMessages.join("")+")\n"
    default:
      return chatAITool.getToolByName(funcName).codifyToolCall(args)
  }
  }
  static safeJsonParse(jsonString) {
    try {
        // 处理字符串中的反斜杠，确保 JSON 解析不会失败
        return jsonString.replace(/\\([^u])/g, '\\\\$1');;
    } catch (e) {
        return null; // 如果解析失败，返回 null 或其他默认值
    }
}
static multiLetterRegex = /(?<!\\)(\\[a-zA-Z]{2,})/g;
// static singleCharRegex = /(?<!\\)(\\(?:[cvHkdu]|[^a-zA-Z0-9\\'"]))/g;
  /**
   * 它匹配一个未转义的反斜杠，后面跟着白名单中的任意一个字符。
   * 这个统一的字符集包含了所有安全的单字母命令和符号命令。
   */
static singleCharRegex = /(?<!\\)(\\[cvHkdu%&$#_{},:;!^~`.@ ])/g;
//去掉了\\，不知道会不会造成影响
// static singleCharRegex = /(?<!\\)(\\[cvHkdu%&$#_{},:;!\\^~`.@ ])/g;
/**
 * 使用两步替换策略，精准地纠正AI生成的字符串中未正确转义的LaTeX反斜杠。
 * 这种方法可以有效避免将标准的JavaScript转义序列（如 \n, \b）错误地转义。
 *
 * @param {string} text - 包含可能未转义的LaTeX公式的输入字符串。
 * @returns {string} - 返回修复了反斜杠转义的字符串。
 */
static fixLatexEscaping(text) {
  if (typeof text !== 'string' || !text) {
    return "";
  }
  let correctedText = text;
  // --- 第 1 步：修复多字母（2个及以上）的单词命令 ---
  // 正则表达式：匹配一个未转义的 \，后面跟着两个或更多的字母。
  // [a-zA-Z]{2,} - 匹配至少两个字母。
  correctedText = correctedText.replace(this.multiLetterRegex, '\\$1');
  // --- 第 2 步：修复特定的、安全的单字符命令 ---
  correctedText = correctedText.replace(this.singleCharRegex, '\\$1');
  return correctedText;
}

static parseTime = []
static preResults = []
/** 
 * 用来格式化调用的函数内容的
 * @param {String} originalText
 * @param {Boolean} checkToolCalls
 */
  static parseResponse(originalText,checkToolCalls) {
  try {
    if (!originalText) {
      return undefined
    }
    let response = {}
    let resList = this.parseDataChunks(originalText)
    if (resList.usage) {
      response.usage = resList.usage
    }
    let results = resList.results
    // let results = this.preResults
    // MNUtil.copy(results)
    if (!results.length) {
      // MNUtil.showHUD("No response")
      return undefined
    }
    // MNUtil.copyJSON(resList)
    // return
    if (checkToolCalls && this.checkToolCalls(results)) {
      let funcs = []
      // let funcIds = []
      results.map(res=>{
        if (res.tool_calls && res.tool_calls.length) {
          if (res.tool_calls[0].function.name) {
            // if (!funcIds.includes(res.tool_calls[0].id)) {
              funcs.push(res.tool_calls[0])
              // funcIds.push(res.tool_calls[0].id)
            // }
          }else{
            let index = res.tool_calls[0].index ?? 0
            if (!funcs[index]) {
              funcs[index] = {function:{name:"unknownFunction",arguments:"{}"},index:index,type:"function",id:MNUtil.UUID()}
            }
            if (funcs[index].function.arguments) {
              funcs[index].function.arguments = funcs[index].function.arguments+res.tool_calls[0].function.arguments
            }else{
              funcs[index].function.arguments = res.tool_calls[0].function.arguments
            }
          }
          // return delta.tool_calls[0].function.arguments
        }else{
          return ""
        }
      }).join("")
      // MNUtil.copyJSON(funcs)
      // return
      let funcList = []
      // MNUtil.copy(funcs)
      let funcResponses = funcs.map(func=>{
        let arg = func.function.arguments//此时arg是一个json字符串而不是json对象
        // MNUtil.log({message:"funcArgs",detail:arg})
        // MNUtil.copyJSON(JSON.parse("{\"title\": \"排放变化特征分析\"}{\"title\": \"排放变化特征分析\"}"))
        if (arg) {//尝试解析arg为对象
          arg = this.fixLatexEscaping(arg)//修复LaTeX反斜杠转义错误
        // MNUtil.copy(arg)
          let args = this.getValidJSON(arg.trim())
          if (!args) {
            args = this.getValidJSON(this.safeJsonParse(arg.trim()))
          }
          if (args && Object.keys(args).length) {
            func.function.arguments = JSON.stringify(args)
            // func.function.arguments = args
            chatAITool.toolCache[func.id] = {name:func.function.name,args:args}
            funcList.push(func)
            // MNUtil.log({message:"func",detail:{func:func,args:args}})
            return chatAITool.getToolByName(func.function.name).codifyToolCall(args)
            // return this.codifyToolCall(func.function.name, args)
          }else{
            if (chatAITool.toolCache[func.id]) {
              let cache = chatAITool.toolCache[func.id]
              func.function = {name:cache.name,arguments:JSON.stringify(cache.args)}
              // func.function = {name:cache.name,arguments:cache.args}
              funcList.push(func)
            // MNUtil.log({message:"funcCache",detail:cache})
              return chatAITool.getToolByName(cache.name).codifyToolCall(cache.args)
              // return this.codifyToolCall(cache.name, cache.args)
            }else{
              func.function.arguments = "{}"
            }
            // MNUtil.log({message:"args",detail:args})
            funcList.push(func)
            return "🔨 "+func.function.name+"()\n"
          }
        }else{
            func.function.arguments = "{}"
            funcList.push(func)
            return "🔨 "+func.function.name+"()\n"
        }
      })
      response.funcResponse = funcResponses.join("")
      response.funcList = funcList
    }
    response.response = results.map(res=>{
      if (res && res.content) {
        return res.content
      }
      return ""
    }).join("").trim()
    response.response = chatAITool.formatMarkdown(response.response)
    let reasoningKey = undefined
    // response.response = response.response.trim()
    //   .replace(/\\\[/g, '\n$$$') // Replace display math mode delimiters
    //   .replace(/\\\]/g, '$$$\n') // Replace display math mode delimiters
    //   .replace(/(\\\(\s?)|(\s?\\\))/g, '$') // Replace inline math mode opening delimiter
    response.reasoningResponse = results.map(res=>{
      if (res) {
        if (reasoningKey) {
          return res[reasoningKey]
        }
        if (res.reasoning_content) {
          reasoningKey = "reasoning_content"
          return res.reasoning_content
        }
        if (res.reasoning) {
          reasoningKey = "reasoning"
          return res.reasoning
        }
        if (res.reasoning_text) {
          reasoningKey = "reasoning_text"
          return res.reasoning_text
        }
      }
      return ""
    }).join("").trim()

    if (!response.reasoningResponse && response.response) {//仅在未能从reasoningKey中解析内容时尝试从响应文本中解析
      if (/^<think>/.test(response.response)) {
        let tem = response.response.split("</think>")
        if (tem.length > 1) {
          response.response = tem[1]
        }else{
          response.response = ""
        }
        response.reasoningResponse = tem[0].replace("<think>","").trim()
      }else if (/^<thought>/.test(response.response)) {
        let tem = response.response.split("</thought>")
        if (tem.length > 1) {
          response.response = tem[1]
        }else{
          response.response = ""
        }
        response.reasoningResponse = tem[0].replace("<thought>","").trim()
      }
      // else if(/^###Thinking/.test(response.response)){
      //   let tem = response.response.split("###Response")
      //   if (tem.length > 1) {
      //     response.response = tem[1]
      //   }else{
      //     response.response = ""
      //   }
      //   response.reasoningResponse = tem[0].replace("###Thinking","").trim()
      // }
    }
    //适配秘塔搜索
    response.citations = undefined
    results.map(res=>{
      if (res && res.citations) {
        response.citations = res.citations
        // response.citations.push(res.citations)
      }
    })
      // MNUtil.log({message:"res",detail:results})
    if (response.citations) {
      //将响应内容中的[[num]]替换为对应的citation，num为数字，从1开始
      response.response = response.response.replace(/\[\[([0-9]+)\]\]/g,(match,p1)=>{
        let num = parseInt(p1)
        let citation = response.citations[num-1]
        //根据引用的title和link构建markdown链接
        return `[{${num}}](${citation.link})`
      })
      // MNUtil.log({message:"citations",detail:response.citations})
    }
    return response
  } catch (error) {
    this.addErrorLog(error, "parseResponse")
    return {}
  }
  }
/**
 * 安全地全局替换字符串中所有匹配项
 * @param {string} originalStr - 原始字符串
 * @param {string} searchValue - 要查找的内容
 * @param {string} replacement - 替换内容
 * @returns {string} 替换后的新字符串
 */
static safeReplaceAll(originalStr, searchValue, replacement) {
  // 空搜索值直接返回原字符串
  if (!searchValue) return originalStr;
  
  // 尝试使用replaceAll()实现
  if (typeof originalStr.replaceAll === 'function') {
    return originalStr.replaceAll(searchValue, replacement);
  }

  // 降级方案：转义正则特殊字符并全局替换
  const escapedValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedValue, 'g');
  return originalStr.replace(regex, replacement);
}

  static html(string) {
    return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0,minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Marked.js</title>
    <style>
  p {
    max-width: 385px;
    margin-top: 0;
  }
  pre {
    background-color: #343541;
    color: white;
    border-radius: 5px;
    max-width: 400px;
    overflow-x: scroll;
    margin-top: 0;
    margin-bottom: 5px;
  }
  img {
    max-width: 385px;
  }
.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
}
.code-header button {
  margin-left: auto; /* 这将推动按钮到容器的右边 */
}
pre code.hljs {
  display: block;
  overflow-x: auto;
  padding: 1em
}
code.hljs {
  padding: 3px 5px
}
/*!
  Theme: GitHub Dark
  Description: Dark theme as seen on github.com
  Author: github.com
  Maintainer: @Hirse
  Updated: 2021-05-15

  Outdated base version: https://github.com/primer/github-syntax-dark
  Current colors taken from GitHub's CSS
*/
.hljs {
  color: #c9d1d9;
  background: #000000
}
.hljs-doctag,
.hljs-keyword,
.hljs-meta .hljs-keyword,
.hljs-template-tag,
.hljs-template-variable,
.hljs-type,
.hljs-variable.language_ {
  /* prettylights-syntax-keyword */
  color: #ff7b72
}
.hljs-title,
.hljs-title.class_,
.hljs-title.class_.inherited__,
.hljs-title.function_ {
  /* prettylights-syntax-entity */
  color: #d2a8ff
}
.hljs-attr,
.hljs-attribute,
.hljs-literal,
.hljs-meta,
.hljs-number,
.hljs-operator,
.hljs-variable,
.hljs-selector-attr,
.hljs-selector-class,
.hljs-selector-id {
  /* prettylights-syntax-constant */
  color: #79c0ff
}
.hljs-regexp,
.hljs-string,
.hljs-meta .hljs-string {
  /* prettylights-syntax-string */
  color: #a5d6ff
}
.hljs-built_in,
.hljs-symbol {
  /* prettylights-syntax-variable */
  color: #ffa657
}
.hljs-comment,
.hljs-code,
.hljs-formula {
  /* prettylights-syntax-comment */
  color: #8b949e
}
.hljs-name,
.hljs-quote,
.hljs-selector-tag,
.hljs-selector-pseudo {
  /* prettylights-syntax-entity-tag */
  color: #7ee787
}
.hljs-subst {
  /* prettylights-syntax-storage-modifier-import */
  color: #c9d1d9
}
.hljs-section {
  /* prettylights-syntax-markup-heading */
  color: #1f6feb;
  font-weight: bold
}
.hljs-bullet {
  /* prettylights-syntax-markup-list */
  color: #f2cc60
}
.hljs-emphasis {
  /* prettylights-syntax-markup-italic */
  color: #c9d1d9;
  font-style: italic
}
.hljs-strong {
  /* prettylights-syntax-markup-bold */
  color: #c9d1d9;
  font-weight: bold
}
.hljs-addition {
  /* prettylights-syntax-markup-inserted */
  color: #aff5b4;
  background-color: #033a16
}
.hljs-deletion {
  /* prettylights-syntax-markup-deleted */
  color: #ffdcd7;
  background-color: #67060c
}
.hljs-char.escape_,
.hljs-link,
.hljs-params,
.hljs-property,
.hljs-punctuation,
.hljs-tag {
  /* purposely ignored */
}
  </style>
  </head>
  <body contenteditable="true">${string}<script>
  // window.scrollTo(0,document.body.scrollHeight);

      MathJax = {
          tex: {
              inlineMath: [ ['$','$'], ["\\(","\\)"] ]
          }
      };
      var originalBodyContent = ""
      var isBodyEdited = false;
      document.addEventListener('input', function () {
        isBodyEdited = true;
      });
      function getSelectedTextOrPageText() {
          var selectedText = window.getSelection().toString();
          if (selectedText && selectedText.trim() !== '') {
              return selectedText;
          } else if (isBodyEdited){
              var body = document.body;
              var pageText = body.innerText || body.textContent;
              return pageText.trim();
          } else {
            return ""
          }
      }
      function copyToClipboard(uuid) {
        // 获取代码块的文本内容
        var code = document.getElementById(uuid).innerText;
        // 创建临时的textarea来选择文本
        var dummy = document.createElement('textarea');
        // 将代码块的文本内容赋值到textarea
        dummy.value = code;
        document.body.appendChild(dummy);
        // 选择textarea中的内容
        dummy.select();
        // 执行复制命令
        document.execCommand('copy');
        // 移除临时创建的textarea
        document.body.removeChild(dummy);
      }
  </script>
  <script id="MathJax-script" async src="https://vip.123pan.cn/1836303614/dl/cdn/es5/tex-svg-full.js"></script>
  </body>
  </html>`
  }
  static sum(array) {
    let sum = 0
    for (let i = 0; i < array.length; i++) {
      sum = sum+array[i]
    }
    return sum
  }
  static getTranslation(gesture){
    let locationToMN = gesture.locationInView(MNUtil.studyView)
    if (!gesture.moveDate) {
      gesture.moveDate = 0
    }
    if ((Date.now() - gesture.moveDate) > 100) {
      let translation = gesture.translationInView(MNUtil.studyView)
      let location2Button = gesture.locationInView(gesture.view)
      // if (gesture.state !== 3 && Math.abs(translation.y)<20 && Math.abs(translation.x)<20) {
      if (gesture.state === 1) {
        gesture.location2Button = {x:location2Button.x-translation.x,y:location2Button.y-translation.y}
        // MNUtil.showHUD(JSON.stringify(gesture.location2Button))
      }
    }
    // MNUtil.showHUD(JSON.stringify(locationToMN))
    if (locationToMN.x <= 0) {
      locationToMN.x = 0
    }
    if (locationToMN.x > MNUtil.studyView.frame.width) {
      locationToMN.x = MNUtil.studyView.frame.width
    }
    gesture.moveDate = Date.now()
    // let location = {x:locationToMN.x - self.locationToButton.x-gesture.view.frame.x,y:locationToMN.y -self.locationToButton.y-gesture.view.frame.y}
    let location = {x:locationToMN.x - gesture.location2Button.x,y:locationToMN.y -gesture.location2Button.y}
    if (location.y <= 0) {
      location.y = 0
    }
    if (location.y>=MNUtil.studyView.frame.height-15) {
      location.y = MNUtil.studyView.frame.height-15
    }
    return location
  }
  static getNewLoc(gesture,referenceView = MNUtil.studyView){
  try {

    let locationToMN = gesture.locationInView(referenceView)
    // if (!gesture.moveDate) {
    //   gesture.moveDate = 0
    // }
    // if ((Date.now() - gesture.moveDate) > 100) {
      let translation = gesture.translationInView(referenceView)
      let locationToBrowser = gesture.locationInView(gesture.view.superview)
      // if (gesture.state !== 3 && Math.abs(translation.y)<20 && Math.abs(translation.x)<20) {
      if (gesture.state === 1) {
        gesture.locationToBrowser = {x:locationToBrowser.x-translation.x,y:locationToBrowser.y-translation.y}
        // MNUtil.showHUD(JSON.stringify(gesture.locationToBrowser))
      }
      if (gesture.state === 2) {
        // gesture.locationToBrowser = {x:locationToBrowser.x-translation.x,y:locationToBrowser.y-translation.y}
        // gesture.locationToBrowser = {x:locationToBrowser.x,y:locationToBrowser.y}
      }
    // }
    // MNUtil.showHUD(JSON.stringify(locationToMN))
    if (locationToMN.x <= 0) {
      locationToMN.x = 0
    }
    if (locationToMN.x > referenceView.frame.width) {
      locationToMN.x = referenceView.frame.width
    }
    // gesture.moveDate = Date.now()
    // let location = {x:locationToMN.x - self.locationToButton.x-gesture.view.frame.x,y:locationToMN.y -self.locationToButton.y-gesture.view.frame.y}
    let location = {x:locationToMN.x - gesture.locationToBrowser.x,y:locationToMN.y -gesture.locationToBrowser.y}
    // let location = {x:locationToMN.x + translation.x,y:locationToMN.y + translation.y}
    if (location.y <= 0) {
      location.y = 0
    }
    if (location.y>=referenceView.frame.height-15) {
      location.y = referenceView.frame.height-15
    }
    return location
    
  } catch (error) {
    this.addErrorLog(error, "getNewLoc","gestureState:"+gesture.state)
    return undefined
  }
  }
  /**
   * 
   * @param {string} fullPath 
   * @returns {string}
   */
  static getExtensionFolder(fullPath) {
      // 找到最后一个'/'的位置
      let lastSlashIndex = fullPath.lastIndexOf('/');
      // 从最后一个'/'之后截取字符串，得到文件名
      let fileName = fullPath.substring(0,lastSlashIndex);
      return fileName;
  }
  static checkMNUtilsFolder(fullPath){
    let extensionFolder = this.getExtensionFolder(fullPath)
    let folderExist = NSFileManager.defaultManager().fileExistsAtPath(extensionFolder+"/marginnote.extension.mnutils/main.js")
    if (!folderExist) {
      this.showHUD("MN ChatAI: Please install 'MN Utils' first!",5)
    }
    return folderExist
  }
  static checkCouldAsk(){
      if (this.notifyController.view.hidden) {
        //如果界面都隐藏了，那肯定可以启动
        this.notifyController.onChat = false
        return true
      }
      //如果请求还没结束，或者在聊天模式，则不允许发起对话
      if (this.notifyController.onChat) {
        MNUtil.showHUD("On Chat Mode")
        // this.ensureView(this.notifyController.view)
        this.ensureViewInCurrentWindow(this.notifyController.view)
        this.notifyController.view.hidden = false
        return false
      }
      if (this.notifyController.connection) {
        MNUtil.showHUD("On Output...")
        return false
      }
    // }
      return true
  }
  /**
   * 
   * @param {UIView} view 
   */
  static ensureView(view){
    if (!MNUtil.isDescendantOfStudyView(view)) {
      view.hidden = true
      MNUtil.studyView.addSubview(view)
      this.forceToRefresh = true
    }
  }
  /**
   * 
   * @param {UIView} view 
   */
  static ensureViewInCurrentWindow(view){
    if (!view.isDescendantOfView(MNUtil.currentWindow)) {
      view.hidden = true
      MNUtil.currentWindow.addSubview(view)
      this.forceToRefresh = true
    }
  }
  static getLocalBufferFromImageData(imageData){
    let base64 = imageData.base64Encoding()
    let md5 = chatAIUtils.MD5(base64)
    let fileName = "local_"+md5+".png"
    if (!imageData) {
      return fileName
    }
    if (MNUtil.isfileExists(chatAIConfig.mainPath+"/"+fileName)) {
      //do nothing
    }else{
      imageData.writeToFileAtomically(chatAIConfig.mainPath+"/"+fileName, false)
    }
    return fileName
  }
  static isNSNull(obj){
    return (obj === NSNull.new())
  }
  /**
   * 
   * @param {NSData} imageData 
   */
  static getURLFromImageData(imageData,compression = false){
    if (compression) {
      let compressedImageData = UIImage.imageWithData(imageData).jpegData(0.0)
      return "data:image/jpeg;base64,"+compressedImageData.base64Encoding()
    }
    return "data:image/png;base64,"+imageData.base64Encoding()
  }
  static replaceBase64ImagesWithTemplate(markdown) {
  try {
    // 匹配 base64 图片链接的正则表达式
    const base64ImagePattern = /!\[.*?\]\((data:image\/png;base64,.*?)(\))/g;
    // 处理 Markdown 字符串，替换每个 base64 图片链接
    const result = markdown.replace(base64ImagePattern, (match, base64Str,p2) => {
      return match.replace(base64Str, "{{iamge}}");
    });
  return result;
} catch (error) {
  editorUtils.addErrorLog(error, "replaceBase64ImagesWithR2")
  return undefined
}
}
  /**
   * 
   * @param {string} context 
   * @param {NSData|NSData[]} imageData 
   * @returns 
   */
  static genSystemMessage(content){
    return {
      role: "system", 
      content: content
    }
  }
  /**
   * 
   * @param {string} context 
   * @param {NSData|NSData[]|string|string[]} imageData
   * @returns 
   */
  static genUserMessage(context,imageData,imageType = "png"){
    let compression = chatAIConfig.getConfig("imageCompression")
    if (imageData) {
      let imageBase64Array = []
      if (Array.isArray(imageData)) {
        if (typeof imageData[0] === "string") {
          imageData.map((base64)=>{
            if (base64.startsWith("data:image/"+imageType+";base64,")) {
              imageBase64Array.push(base64)
            }else{
              imageBase64Array.push("data:image/"+imageType+";base64,"+base64)
            }
          })
        }else{
          imageData.map((data)=>{
            imageBase64Array.push(this.getURLFromImageData(data,compression))
          })
        }
      }else{
        if (typeof imageData === "string") {
          if (imageData.startsWith("data:image/"+imageType+";base64,")) {
            imageBase64Array.push(imageData)
          }else{
            imageBase64Array.push("data:image/"+imageType+";base64,"+imageData)
          }
        }else{
          imageBase64Array.push(this.getURLFromImageData(imageData,compression))
        }
      }
      let content = [
          {
            "type": "text",
            "text": context
          }
      ]
      imageBase64Array.forEach((base64,index)=>{
        content.push({
          "type": "image_url",
          "image_url": {
            "url" : base64
          }
        })
      })
      return {
        role: "user", 
        content: content
      }
    }else{
      return {role: "user", content: context}
    }
  }
  static genAssistantMessage(content=undefined,tool_calls = undefined,reasoningContent = undefined){
    let message = {
      role: "assistant",
    }
    if (content) {
      message.content = content
    }
    if (tool_calls) {
      message.tool_calls = tool_calls
    }
    if (reasoningContent) {
      message.reasoningContent = reasoningContent
    }
    return message
  }
  static findToc(md5,excludeNotebookId=undefined){
    let allNotebooks = this.allStudySets().filter(notebook=>{
      if (excludeNotebookId && notebook.notebookId === excludeNotebookId) {
        return false
      }
      if (notebook.options && "bookGroupNotes" in notebook.options && notebook.options.bookGroupNotes[md5]) {
        let target = notebook.options.bookGroupNotes[md5]
        if ("tocNoteIds" in target) {
          return true
        }
      }
      return false
    })
    if (allNotebooks.length) {
      let targetNotebook = allNotebooks[0]
      let target = targetNotebook.options.bookGroupNotes[md5].tocNoteIds
      let tocNotes = target.map(noteId=>{
        return MNNote.new(noteId)
      })
      return tocNotes
    }else{
      return undefined
    }
  }
  /**
   * 
   * @param {string} md5 
   * @param {string} notebookId 
   * @returns {MNNote[]}
   */
  static getDocTocNotes(md5=MNUtil.currentDocmd5,notebookId=MNUtil.currentNotebookId){
    let notebook = MNUtil.getNoteBookById(notebookId)
    if (notebook.options && "bookGroupNotes" in notebook.options && notebook.options.bookGroupNotes[md5] && "tocNoteIds" in notebook.options.bookGroupNotes[md5]) {
      let target = notebook.options.bookGroupNotes[md5]
      let tocNotes = target.tocNoteIds.map(noteId=>{
        return MNNote.new(noteId)
      })
      // tocNotes[0].focusInDocument()
      return tocNotes
    }else{//在其他笔记本中查找
      return this.findToc(md5,notebookId)
    }

  }
  static getImageUrl(imageId){
    return "marginnote4app://markdownimg/png/"+imageId
  }
  static removeMarkdownHeadingsFromTitle(title){
  try {

    let titles = title.split(";")
    if (!titles || titles.length === 0) {
      return ""
    }
    if (titles.length === 1) {
      return titles[0]
    }
    return titles.filter(t=>{
        if (/{{.*}}/.test(t)) {
          return false
        }
        return true
      }).join(";")
    
  } catch (error) {
    this.addErrorLog(error, "removeMarkdownHeadingsFromTitle")
    return ""
  }
  }
  /**
   * 
   * @param {string|MNNote} noteid 
   * @param {boolean} OCR_enabled 
   * @returns 
   */
  static async genCardStructure (noteid,OCR_enabled=false) {
  let hasImage = false
  let cardStructure = {title:""}
  let note = MNNote.new(noteid)
  let imageId = ""
  if (note.noteTitle && note.noteTitle !== "") {
    cardStructure.title = this.removeMarkdownHeadingsFromTitle(note.noteTitle)
  }
  let isBlankNote = this.isBlankNote(note)
  if (note.excerptPic && !note.textFirst) {
    if (isBlankNote) {
      hasImage = false
    }else{
      hasImage = true
      imageId = note.excerptPic.paint
    }
  }
  if (isBlankNote) {
    cardStructure.content = note.excerptText??""
    if (cardStructure.content) {
      cardStructure.markdownEnabled = note.excerptTextMarkdown
    }
  }else{
    if (OCR_enabled && note.excerptPic && !note.textFirst) {
      cardStructure.content = await chatAINetwork.getTextOCR(MNUtil.getMediaByHash(note.excerptPic.paint))
    }else if (this.noteHasExcerptText(note)){
      if (hasImage) {
        // cardStructure.content = "![noteImage](marginnote4app://markdownimg/png/"+imageId+")"
        cardStructure.content = "![noteImage]("+this.getImageUrl(imageId)+")"
        cardStructure.contentInImage = note.excerptText
      }else{
        if (note.excerptTextMarkdown) {
          cardStructure.markdownEnabled = true
          cardStructure.content = chatAIUtils.replaceBase64ImagesWithTemplate(note.excerptText)
        }else{
          cardStructure.content = note.excerptText
          cardStructure.markdownEnabled = false
        }
      }
    }
  }
  if (note.linkedNotes?.length) {
    cardStructure.linkedNoteIds = note.linkedNotes.map((linkedNote)=>{
      return linkedNote.noteid
    })
  }
  if (note.comments.length) {
    let comments = []
    for (let i = 0; i < note.comments.length; i++) {
      const comment = note.comments[i];
      switch (comment.type) {
        case "TextNote":
          if (/^marginnote\dapp:\/\//.test(comment.text)) {
          }else{
            comments.push(comment.text)
          }
          break
        case "HtmlNote":
          comments.push(comment.text)
          break
        case "LinkNote":
          if (comment.q_hpic && !note.textFirst) {
            if (OCR_enabled){
              comments.push(await chatAINetwork.getTextOCR(MNUtil.getMediaByHash(comment.q_hpic.paint)))
            }else{
              comments.push("![noteImage]("+this.getImageUrl(comment.q_hpic.paint)+")")
            }
          }else{
            comments.push(comment.q_htext)
          }
          break
        case "PaintNote":
          if (comment.paint) {
            hasImage = true
            if (OCR_enabled){
              comments.push(await chatAINetwork.getTextOCR(MNUtil.getMediaByHash(comment.paint)))
            }else{
              comments.push("![noteImage]("+this.getImageUrl(comment.paint)+")")
            }
          }
          break
        default:
          break
      }
    }
    if (comments.length) {
      if (comments.length === 1) {
        cardStructure.comment = comments[0]
      }else{
        cardStructure.comments = comments
      }
    }
  }
  cardStructure.id = note.noteId
  cardStructure.url = "marginnote4app://note/"+note.noteId
  if (note.parentNote) {
    cardStructure.parentId = note.parentNote.noteId
  }
  if (note.colorIndex !== undefined) {
    cardStructure.color = note.color
  }
  if (note.notebookId) {
    let notebook = MNUtil.getNoteBookById(note.notebookId)
    cardStructure.notebook = notebook.title
  }
  if (note.tags && note.tags.length) {
    cardStructure.tags = note.tags
  }
  if (note.childNotes && note.childNotes.length) {
    cardStructure.children = note.childNotes.map((childNote)=>{
      return {id:childNote.noteId}
    })
  }else{
    cardStructure.children = []
  }
  return cardStructure
}
  static parseMNImageURL(MNImageURL){
    if (MNImageURL.includes("markdownimg/png/")) {
      let hash = MNImageURL.split("markdownimg/png/")[1]
      // this.imageTypeCache[hash] = "png"
      return {
        hash: hash,
        type: "png",
        ext: "png"
      }
    }else if (MNImageURL.includes("markdownimg/jpeg/")) {
      let hash = MNImageURL.split("markdownimg/jpeg/")[1]
      // this.imageTypeCache[hash] = "jpeg"
      return {
        hash: hash,
        type: "jpeg",
        ext: "jpg"
      }
    }
    return undefined
  }
/**
 * @param {string} imageId 
 * @returns {NSData}
 */
static getImageById(imageId){
  if (imageId.startsWith("https://") || imageId.startsWith("http://")) {
    let image = NSData.dataWithContentsOfURL(MNUtil.genNSURL(imageId))
    if (image) {
      return image
    }
    return undefined
  }
  if (imageId.startsWith("marginnote4app://markdownimg/png/") || imageId.startsWith("marginnote4app://markdownimg/jpeg/")) {
    let imageInfo = this.parseMNImageURL(imageId)
    imageId = imageInfo.hash
  }
  let image = MNUtil.getMediaByHash(imageId)
  if (image) {
    return image
  }
  image = this.imageCache[imageId]
  if (image) {
    return image
  }
  return undefined
}
// /**
//  * @param {string} imageURL
//  * @returns {NSData}
//  */
// static getOnlineImageById(imageURL){
//   let image = 
//   image = this.imageCache[imageId]
//   if (image) {
//     return image
//   }
//   return undefined
// }
/**
   * 
   * @param {string|MNNote} noteid 
   * @returns 
   */
  static genCardStructureForSearch (noteid) {
  let cardStructure = {}
  let note = undefined
  if (MNUtil.typeOf(noteid) === "MNNote") {
    note = noteid
  }else{
    note = MNNote.new(noteid)
  }
  cardStructure.content = note.allNoteText()
  cardStructure.id = note.noteId
  return cardStructure
}
  static stringifyCardStructure(cardStructure){
    switch (typeof cardStructure) {
      case "string":
        return cardStructure
      case "object":
        if (!Object.keys(cardStructure).length) {
          MNUtil.showHUD("No text in note/card!")
          return undefined
        }
        return JSON.stringify(cardStructure,null,2)
      default:
        return undefined
    }
  }
  /**
   * 
   * @param {string} message 
   * @param {any} detail 
   * @param {["INFO","ERROR","WARNING","DEBUG"]} level 
   */
  static log(message,detail,level = "INFO"){
    MNUtil.log({message:message,detail:detail,source:"MN ChatAI",level:level})
  }
  static addErrorLog(error,source,info){
    MNUtil.showHUD("MN ChatAI Error ("+source+"): "+error)
    let tem = {source:source,time:(new Date(Date.now())).toString()}
    if (error.detail) {
      tem.error = {message:error.message,detail:error.detail}
    }else{
      tem.error = error.message
    }
    if (info) {
      tem.info = info
    }
    this.errorLog.push(tem)
    MNUtil.copy(this.errorLog)
    if (typeof MNUtil.log !== 'undefined') {
      MNUtil.log({
        source:"MN ChatAI",
        level:"error",
        message:source,
        detail:tem,
      })
    }
  }
  static checkLogo(){
    if (typeof MNUtil === 'undefined') return false
    if (typeof toolbarConfig !== 'undefined' && toolbarConfig.addonLogos && ("MNChatAI" in toolbarConfig.addonLogos) && !toolbarConfig.addonLogos["MNChatAI"]) {
        return false
    }
    return true
  }
  static extractJSONFromMarkdown(markdown) {
    // 使用正则表达式匹配被```JSON```包裹的内容
    const regex = /^```JSON([\s\S]*?)```$/;
    const matches = regex.exec(markdown.trim());
    
    // 提取匹配结果中的JSON字符串部分，并去掉多余的空格和换行符
    if (matches && matches[1]) {
        const jsonString = matches[1].trim();
        return jsonString;
    } else {
        return undefined;
    }
  }
    /**
   * 
   * @param {string} title 
   * @param {string} subTitle 
   * @param {string[]} items 
   * @returns {Promise<{input:string,button:number}>}
   */
  static input(title,subTitle,items) {
    return new Promise((resolve, reject) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        title,subTitle,3,items[0],items.slice(1),
        (alert, buttonIndex) => {
          let res = {input:alert.textFieldAtIndex(0).text,button:buttonIndex}
          resolve(res)
        }
      )
    })
  }
 static moveElement(arr, element, direction) {
      // 获取元素的索引
      var index = arr.indexOf(element);
      if (index === -1) {
          this.showHUD('Element not found in array');
          return;
      }
      switch (direction) {
          case 'up':
              if (index === 0) {
                  this.showHUD('Element is already at the top');
                  return;
              }
              // 交换元素位置
              [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
              break;
          case 'down':
              if (index === arr.length - 1) {
                  this.showHUD('Element is already at the bottom');
                  return;
              }
              // 交换元素位置
              [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
              break;
          case 'top':
              // 移除元素
              arr.splice(index, 1);
              // 添加到顶部
              arr.unshift(element);
              break;
          case 'bottom':
              // 移除元素
              arr.splice(index, 1);
              // 添加到底部
              arr.push(element);
              break;
          default:
              this.showHUD('Invalid direction');
              break;
      }
  }
  /**
   * 
   * @param {number} value 
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  static constrain(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  static isSideOutputCreated(){
    return this.sideOutputController !== undefined
  }
  static async openSideOutputInFloatWindow(){
    try {
    if (!this.isSideOutputCreated()) {
        this.sideOutputController = sideOutputController.new();
        this.sideOutputController.floatWindow = true
        MNUtil.studyView.addSubview(this.sideOutputController.view)
        let panelView = MNUtil.studyView
        this.sideOutputController.view.hidden = false
        this.sideOutputController.view.frame = {x:0,y:0,width:panelView.frame.width,height:panelView.frame.height}
        this.sideOutputController.currentFrame = {x:0,y:0,width:panelView.frame.width,height:panelView.frame.height}
        this.sideOutputController.view.layer.opacity = 0
        await MNUtil.delay(0.2)
        this.sideOutputController.view.layer.opacity = 0
        MNUtil.animate(()=>{
          this.sideOutputController.view.layer.opacity = 1
        },0.25)
    }else{
      MNUtil.studyView.addSubview(this.sideOutputController.view)
      this.sideOutputController.floatWindow = true
      this.sideOutputController.view.hidden = false
      this.sideOutputController.view.frame = {x:0,y:0,width:MNUtil.studyWidth,height:MNUtil.studyHeight}
      this.sideOutputController.panelWidth = MNUtil.studyWidth
      this.sideOutputController.panelHeight = MNUtil.studyHeight
      this.sideOutputController.view.layer.opacity = 0
      MNUtil.animate(()=>{
        this.sideOutputController.view.layer.opacity = 1
      },0.25)
    }
    } catch (error) {
      this.addErrorLog(error, "openSideOutputInFloatWindow")
    }
  }
  static async openSideOutput(){
    if (this.isMN3()) {
      MNUtil.confirm("Only available in MN4+")
      return
    }
    try {

    if (!this.isSideOutputCreated()) {
        this.sideOutputController = sideOutputController.new();
        this.sideOutputController.floatWindow = false
        MNUtil.toggleExtensionPanel()
        MNExtensionPanel.show()
        MNExtensionPanel.addSubview("chatAISideOutputView", this.sideOutputController.view)
        let panelView = MNExtensionPanel.view
        this.sideOutputController.view.hidden = false
        this.sideOutputController.view.frame = {x:0,y:0,width:panelView.frame.width,height:panelView.frame.height}
        this.sideOutputController.currentFrame = {x:0,y:0,width:panelView.frame.width,height:panelView.frame.height}
        await MNUtil.delay(0.1)
        MNUtil.studyView.bringSubviewToFront(MNExtensionPanel.view)
        // MNUtil.toggleExtensionPanel()
    }else{
      if (!MNExtensionPanel.on) {
        MNUtil.toggleExtensionPanel()
        MNExtensionPanel.show()
      }
      this.sideOutputController.floatWindow = false
      this.sideOutputController.panelWidth = MNExtensionPanel.width
      this.sideOutputController.panelHeight = MNExtensionPanel.height
      MNExtensionPanel.addSubview("chatAISideOutputView", this.sideOutputController.view)
      MNExtensionPanel.show("chatAISideOutputView")
      MNUtil.studyView.bringSubviewToFront(MNExtensionPanel.view)
    }
    } catch (error) {
      this.addErrorLog(error, "openSideOutput")
    }
  }
  static isMN4(){
    return MNUtil.appVersion().version == "marginnote4"
  }
  static isMN3(){
    return MNUtil.appVersion().version == "marginnote3"
  }
  /**
   * 
   * @param {MNNote} focusNote 
   * @param {string} text 
   * @returns 
   */
  static async insertBlank(focusNote,text){
  try {

    if (!MNUtil.docMapSplitMode) {
      MNUtil.studyController.docMapSplitMode = 1
      // MNUtil.showHUD("❌ Unspported in full map mode")
      await MNUtil.delay(0.2)
    }
    // focusNote = focusNote.originNote
    focusNote.focusInDocument()
    await MNUtil.delay(0.1)
    MNUtil.excuteCommand("InsertBlank")
    await MNUtil.delay(0.2)
    let comments = MNComment.from(focusNote)
    // MNUtil.copy(comments)
    let comment = comments.findLast(c=>c.type==="blankTextComment" || c.type==="blankImageComment")
    if (comment) {
      let note = comment.note
      MNUtil.undoGrouping(()=>{
        note.excerptText = text
        note.excerptTextMarkdown = true
        note.textFirst = true
      })
    }else{
      await MNUtil.delay(0.2)
      let comments = MNComment.from(focusNote)
      let comment = comments.findLast(c=>c.type==="blankTextComment" || c.type==="blankImageComment")
      if (comment) {
        let note = comment.note
        MNUtil.undoGrouping(()=>{
          note.excerptText = text
          note.excerptTextMarkdown = true
          note.textFirst = true
        })
      }else{
        MNUtil.showHUD("❌ Failed to insert blank")
      }
    }
    // await MNUtil.delay(1)
    // let tem = MNComment.from(focusNote)
    // MNUtil.copy(tem)
    
  } catch (error) {
    chatAIUtils.addErrorLog(error, "chatAIUtils.insertBlank")
  }
  }
  static hasNoteDoc(vars){
    if (vars.includes("note.doc.content")) {
      return true
    }
    if (vars.includes("note.parent.doc.content")) {
      return true
    }
    if (vars.includes("note.parent.parent.doc.content")) {
      return true
    }
    if (vars.includes("note.parent.parent.parent.doc.content")) {
      return true
    }
  }
  static getParentLevel(vars){
    if (vars.some(v=>v.includes("note.parent.parent.parent."))) {
      return 3
    }
    if (vars.some(v=>v.includes("note.parent.parent."))) {
      return 2
    }
    if (vars.some(v=>v.includes("note.parent."))) {
      return 1
    }
    return 0
  }
  static hasChild(vars){
    if (vars.some(v=>v.includes("note.child"))) {
      return true
    }
    return false
  }
  static hasNote(vars){
    if (vars.some(v=>v.includes("note."))) {
      return true
    }
    return false
  }
  /**
   * 
   * @param {string[]} vars 
   * @returns 
   */
  static getNoteInfo(vars){
    //parentLevel为最高的一个
    let noteInfo = {hasNote:false,hasChildMindMap:false,hasParent:false,hasChild:false,parentLevel:0,hasNoteDoc:false}
    vars.map(v=>{
      if (v.startsWith("note.")) {
        noteInfo.hasNote = true//只要有一个变量带note就行
        if (v.endsWith(".doc.content")) {
          noteInfo.hasNoteDoc = true
        }
        if (v.startsWith("note.childMindMap.")) {
          noteInfo.hasChildMindMap = true
          if (v.startsWith("note.childMindMap.doc.content")) {
            noteInfo.hasNoteDoc = true
          }
        }
        if (v.startsWith("note.parent.")) {
          noteInfo.hasParent = true
          let items = v.split(".").filter(item=>item === "parent")
          noteInfo.parentLevel = items.length
        }
        if (v.startsWith("note.child.")) {
          noteInfo.hasChild = true
        }
      }
    })
    return noteInfo
  }
  static hasTimer(vars){
    return vars.some(v=>v.startsWith("timer."))
  }
  static hasCurrentSelection(vars){
    if (vars.includes("isSelectionImage") || vars.includes("isSelectionText") || vars.includes("selectionText")) {
      return true
    }
    return vars.some(v=>v.startsWith("currentSelection."))
  }
  static _currentSelectionObject = undefined//缓存当前选中的内容，以1秒为缓存时间，超过1秒则重新获取
  /**
   * 
   * @param {boolean} forceRefresh 是否强制刷新
   * @returns {{onSelection: boolean, imageId: string, text: string, type: string, pageIndex: number, document: {id: string, name: string}, asString: string, refreshTime: number}}
   */
  static getCurrentSelectionObject(forceRefresh = false){//比currentSelection更为宽松，以1秒为缓存时间，超过1秒则重新获取
    let dateNow = Date.now()
    if (!forceRefresh && this._currentSelectionObject && (dateNow - this._currentSelectionObject.refreshTime < 1000)) {
      return this._currentSelectionObject
    }
    // this.log("getCurrentSelectionObject")
    let currentSelection = this.currentSelection
    if (currentSelection.onSelection) {
      let image = currentSelection.image
      let imageId = MNUtil.UUID()
      // let imageId = MNUtil.MD5(image.base64Encoding())
      this.imageCache[imageId] = image
      let selectionInfo = {
        onSelection:true,
        imageId:imageId,
        text:currentSelection.text,
        type:currentSelection.isText ? "text" : "image",
        pageIndex:currentSelection.pageIndex,
        document:{
          id:currentSelection.docMd5,
          name:MNUtil.getDocById(currentSelection.docMd5).docTitle
        }
      }
      selectionInfo.asString = JSON.stringify(selectionInfo)
      selectionInfo.refreshTime = dateNow
      this._currentSelectionObject = selectionInfo
      return selectionInfo
    }
    return {
      onSelection:false
    }
  }
  static getVars(template){
    let tokens = mustache.parse(template)
    this.log("tokens",tokens)
    var pipelineRe = /\|\>?/;
    let vars = []
    function getChildToken(ele) {
      let type = ele[0]
      if (type !== "text" && type !== "!") {
        let res = ele[1].split(pipelineRe)
        vars.push(res[0].trim())
      }
      if (ele.length > 4) {
        let newLevel = ele[4]
        if (Array.isArray(newLevel)) {
          newLevel.map(n=>{
            getChildToken(n)
          })
        }
      }
    }
    tokens.map((t)=>{
      getChildToken(t)
    })
    return vars
  }
  static parseVars(template){
  try {

    let tokens = mustache.parse(template)
    var pipelineRe = /\|\>?/;
    let vars = []
    function getChildToken(ele) {
      if (ele[0] !== "text") {
        let res = ele[1].split(pipelineRe)
        vars.push(res[0].trim())
      }
      if (ele.length > 4) {
        let newLevel = ele[4]
        if (Array.isArray(newLevel)) {
          newLevel.map(n=>{
            getChildToken(n)
          })
        }
      }
    }
    tokens.map((t)=>{
      getChildToken(t)
    })
    // MNUtil.copy(vars)
    // MNUtil.log({message:"vars",detail:vars})
    let config = {
      vars:MNUtil.unique(vars),
      hasContext:vars.includes("context"),
      hasOCR:vars.includes("textOCR"),
      hasCard:vars.includes("card"),
      hasCardOCR:vars.includes("cardOCR"),
      hasCards:vars.includes("cards"),
      hasCardsOCR:vars.includes("cardsOCR"),
      hasNotesInMindmap:vars.includes("notesInMindmap"),
      hasParentCard:vars.includes("parentCard"),
      hasParentCardOCR:vars.includes("parentCardOCR"),
      hasUserInput:vars.includes("userInput"),
      hasCurrentDocInfo:vars.includes("currentDocInfo"),
      hasCurrentPageInfo:vars.includes("hasCurrentPageInfo"),
      hasCurrentDocContent:vars.includes("currentDoc.content"),
      hasNoteDocInfo:vars.includes("noteDocInfo"),
      hasNoteDocAttach:vars.includes("noteDocAttach"),
      hasCurrentDocAttach:vars.includes("currentDocAttach"),
      hasClipboardText:vars.includes("clipboardText"),
      hasSelectionText:vars.includes("selectionText"),
      hasFocusNote:vars.includes("hasFocusNote"),
      hasKnowledge:vars.includes("knowledge"),
      hasCurrentDocName:vars.includes("currentDocName"),
      hasCurrentSelection:this.hasCurrentSelection(vars),
      noteInfo:this.getNoteInfo(vars),
      hasMindmapNotes:vars.includes("mindmap.allNotes"),
      hasMindmapFocusNotes:vars.includes("mindmap.focusNotes"),
      hasTimer:this.hasTimer(vars),
    }
    // chatAIUtils.log("parseVars config",config)
    return config
    
  } catch (error) {
    this.addErrorLog(error, "parseVars")
    throw error;
  }
  }
  static getCurrentNotesInMindmap(){
    let mindmapView = MNUtil.mindmapView
    if (mindmapView && mindmapView.mindmapNodes && mindmapView.mindmapNodes.length > 0) {
      let notes = mindmapView.mindmapNodes.map((node)=>{
        return MNNote.new(node.note)
      })
      return notes
    }
    return []
  }
  /**
   * 
   * @param {string} str 
   * @param {number} index 
   * @returns {string}
   */
static getLineByIndex(str, index) {
    if (typeof str !== 'string' || index < 0 || index >= str.length) {
        return '';
    }

    // 查找上一个换行符的位置
    const prevBreak = str.lastIndexOf('\n', index);
    const lineStart = prevBreak + 1;

    // 查找下一个换行符的位置
    const nextBreak = str.indexOf('\n', lineStart);
    const lineEnd = nextBreak === -1 ? str.length : nextBreak;

    return str.substring(lineStart, lineEnd);
}

  static checkTemplate(prompt,needVars = false){
    try {
      let vars = this.getVars(prompt)
      // this.log("vars",vars)
      if (needVars && vars.length === 0) {
        MNUtil.confirm("🤖 MN ChatAI","No variables found in template\n\n未查找到任何变量，请检查模板是否正确")
        return false
      }
      // if (vars.includes("note")) {
      //   return true
      // }
      // let res = MNUtil.render(prompt, {})
      return true
    } catch (error) {
      let message = error.message
      if (message.includes("Unclosed tag at")) {
        let line = this.getLineByIndex(prompt,error.index)
        MNUtil.confirm("Invalid template",message+"\n\n请检查以下内容的变量格式是否正确：\n\n"+line)
      }else{
        MNUtil.confirm("Invalid template",message)
      }
      this.addErrorLog(error, "checkTemplate")
      return false
    }
  }






  static async render(template,opt={}){
    try {
      if (opt.noteId) {
        return await this.getNoteVarInfo(opt.noteId,template,opt.userInput,opt.vision)
      }else{
        return await this.getTextVarInfo(template,opt.userInput,opt.vision)
      }
    } catch (error) {
      this.addErrorLog(error, "render")
      throw error;
    }
  }
  static async getCardStructures(notes,OCR_enabled=false){
      let cardStructures = []
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        cardStructures.push(await this.genCardStructure(note.noteId,OCR_enabled))
      }
      return cardStructures
  }
  static async getMindmapObject(vars, OCR_enabled=false){
    if (MNUtil.docMapSplitMode === 2) {
      return {}
    }
    let mindmapTargets = []
    if (vars.hasMindmapNotes || vars.hasNotesInMindmap) {
      mindmapTargets.push("allNotes")
    }
    if (vars.hasMindmapFocusNotes) {
      mindmapTargets.push("focusNotes")
    }
    let mindmapView = MNUtil.mindmapView
    if (!mindmapView || !mindmapView.mindmapNodes || mindmapView.mindmapNodes.length === 0) {
      return {
        isChildMindMap: false
      }
    }
    if (mindmapTargets.length === 0) {
      let note = MNNote.new(mindmapView.mindmapNodes[0].note)
      if(note.childMindMap){
        let childMindMap = await this.genCardStructure(note.childMindMap,OCR_enabled)
        return {
          isChildMindMap:true,
          childMindMap: childMindMap
        }
      }
      return {isChildMindMap:false}
    }

    let object = {isChildMindMap:false}
    if (mindmapTargets.includes("allNotes")) {
      let allNotes = mindmapView.mindmapNodes.map(node=>{
        return MNNote.new(node.note)
      })
      let cardStructures = await this.getCardStructures(allNotes,OCR_enabled)
      let allNotesTree = chatAIUtils.buildHierarchy(cardStructures)
      object.allNotes = JSON.stringify(allNotesTree,null,2)
      if (allNotes[0].childMindMap) {
        object.isChildMindMap = true
        object.childMindMap = await this.getCardStructures(allNotes[0].childMindMap,OCR_enabled)
      }
    }
    if (mindmapTargets.includes("focusNotes")) {
      let focusNotes = mindmapView.selViewLst.map(tem=>{
        return MNNote.new(tem.note.note)
      })
      let cardStructures = await this.getCardStructures(focusNotes,OCR_enabled)
      let focusNotesTree = chatAIUtils.buildHierarchy(cardStructures)
      object.focusNotes = JSON.stringify(focusNotesTree,null,2)
      if (!object.isChildMindMap && focusNotes[0].childMindMap) {
        object.isChildMindMap = true
        object.childMindMap = await this.getCardStructures(focusNotes[0].childMindMap,OCR_enabled)
      }
    }
    return object
  }
  static async getTimerStatus(){
    let now = Date.now()
    MNUtil.postNotification("refreshTimerObject", {})
    await MNUtil.delay(0.1)
    let timerObject = timerUtils.timerObject
    if (now > timerObject.refreshDate) {//刷新时间应该比现在晚
      await MNUtil.delay(0.1)//延迟0.1秒再次获取
      timerObject = timerUtils.timerObject
    }
    if (now > timerObject.refreshDate) {
      MNUtil.showHUD("Refresh timer object failed")
    }
    // MNUtil.copy(timerObject)
    return timerObject
  }
  /**
   * 
   * @param {MNNote|string} noteid 
   * @param {string} text 
   * @param {*} userInput 
   * @param {*} vision 
   * @param {*} ocr 
   * @returns 
   */
  static async getNoteVarInfo(noteid,text,userInput,vision=false,ocr = this.OCREnhancedMode) {
    try {
    let replaceText= text
    let vars = this.parseVars(replaceText)
    let noteInfo = vars.noteInfo
    // MNUtil.log({message:"noteInfo",detail:noteInfo})
    let note = MNNote.new(noteid)

    let mindmapObject = await this.getMindmapObject(vars,ocr)
    let docConfig = await this.getDocObject(MNUtil.currentDoc,{withContent:vars.hasCurrentDocContent})
    if (!docConfig) {
      return undefined
    }
    let noteConfig = undefined
    if (noteInfo.hasNote) {
      noteConfig = await this.getNoteObject(note,{
        noteInfo:noteInfo, parent:noteInfo.hasParent, child:noteInfo.hasChild,parentLevel:noteInfo.parentLevel
      })
    }
    let preObject = {
      visionMode:vision,
      currentDoc:docConfig,
      mindmap:mindmapObject
    }
    if (noteConfig) {
      preObject.note = noteConfig
    }
    if (vars.hasTimer) {
      preObject.timer = await this.getTimerStatus()
    }
    if (vars.hasCurrentSelection) {
      let currentSelection = this.getCurrentSelectionObject()
      preObject.currentSelection = currentSelection
      if (currentSelection.onSelection) {
        preObject.isSelectionImage = (currentSelection.type === "image")
        preObject.isSelectionText = (currentSelection.type === "text")
        preObject.selectionText = currentSelection.text
      }else{
        preObject.isSelectionText = false
        preObject.isSelectionImage = false
      }
    }
  if (vars.hasFocusNote) {
    let focusNote = this.getFocusNote(false)
    if (focusNote) {
      preObject.hasFocusNote = true
    }else{
      preObject.hasFocusNote = false
    }
  }
    let config = this.getVarInfo(vars,preObject)
    // let selectedText = MNUtil.selectionText
    let contextVar = ""
    if (vars.hasContext) {
      if (MNUtil.activeTextView && MNUtil.activeTextView.selectedRange.length>0) {
        let range = MNUtil.activeTextView.selectedRange
        contextVar = MNUtil.activeTextView.text.slice(range.location,range.location+range.length)
      }else{
        contextVar = await this.getTextForSearch(note,ocr)
      }
      config.context = contextVar
    }

    if (vars.hasCard) {
      let structure = await this.genCardStructure(noteid,ocr)
      let stringified = this.stringifyCardStructure(structure)
      config.card = stringified
    }
    if (vars.hasCardOCR) {
      MNUtil.showHUD("OCR...")
      let structure = await this.genCardStructure(noteid,true)
      let stringified = this.stringifyCardStructure(structure)
      config.cardOCR = stringified
    }
    if (vars.hasParentCard) {
      let structure = await this.genCardStructure(note.parentNote.noteId,ocr)
      let stringified = this.stringifyCardStructure(structure)
      config.parentCard = stringified
    }
    if (vars.hasParentCardOCR) {
      let structure = await this.genCardStructure(note.parentNote.noteId,true)
      let stringified = this.stringifyCardStructure(structure)
      config.parentCardOCR = stringified
    }
    if (vars.hasNotesInMindmap) {
      config.notesInMindmap = mindmapObject.allNotes
    }
    if (vars.hasCards) {
      let focusNotes = MNNote.getFocusNotes()
      let cardStructures = await this.getCardStructures(focusNotes,ocr)
      if (cardStructures.length === 1) {
        config.cards = this.stringifyCardStructure(cardStructures[0])
      }else{
        let tree = chatAIUtils.buildHierarchy(cardStructures)
        config.cards = JSON.stringify(tree,null,2)
      }
    }
    if (vars.hasCardsOCR) {
      let focusNotes = MNNote.getFocusNotes()
      let cardStructures = await this.getCardStructures(focusNotes,true)
      if (cardStructures.length === 1) {
        config.cardsOCR = this.stringifyCardStructure(cardStructures[0])
      }else{
        let tree = chatAIUtils.buildHierarchy(cardStructures)
        config.cardsOCR = JSON.stringify(tree,null,2)
      }
    }
    if (vars.hasOCR) {
      contextVar = await this.getTextForSearch(note,true)
      config.textOCR = contextVar
    }
    if (vars.hasUserInput) {
      if (userInput) {
        config.userInput = userInput
      }else{
        contextVar = await this.getTextForSearch(note,ocr)
        config.userInput = contextVar
      }
    }
    if (vars.hasCurrentDocInfo) {
      let currentFile = this.getCurrentFile()
      if (!currentFile.fileExists) {
        config.currentDocInfo = undefined
      }else{
        let PDFExtractMode = chatAIConfig.getConfig("PDFExtractMode")
        let fileInfo = await chatAIConfig.getFileContent(currentFile,PDFExtractMode === "local")
        config.currentDocInfo = JSON.stringify(fileInfo,undefined,2)
      }
    }
    if (vars.hasNoteDocInfo) {
      let currentFile = this.getNoteFile(noteid)
      if (!currentFile.fileExists) {
        currentFile = this.getCurrentFile()
      }
      if (!currentFile.fileExists) {
        config.noteDocInfo = undefined
      }else{
        let PDFExtractMode = chatAIConfig.getConfig("PDFExtractMode")
        let fileInfo = await chatAIConfig.getFileContent(currentFile,PDFExtractMode === "local")
        config.noteDocInfo = JSON.stringify(fileInfo,undefined,2)
      }
    }
    if (vars.hasNoteDocAttach) {
      let note = MNUtil.getNoteById(noteid)
      let content = editorUtils.getAttachContentByMD5(note.docMd5)
      if (!content) {
        MNUtil.showHUD("Attach is empty or not exist")
        config.noteDocAttach = undefined
      }else{
        config.noteDocAttach = content  
      }
    }
    if (vars.hasCurrentDocAttach) {
      if (typeof editorUtils === 'undefined') {
        MNUtil.showHUD("Please install 'MN Editor' first!")
        config.currentDocAttach = undefined
      }else{
        let content = editorUtils.getAttachContentByMD5(MNUtil.currentDocmd5)
        if (content) {
          config.currentDocAttach = content
        }else{
          MNUtil.showHUD("Attach is empty or not exist")
        }
      }
    }
    // MNUtil.copy(vars)
    // MNUtil.copy(config)
    // chatAIUtils.log("getNoteVarInfo", config)
    let prompt = MNUtil.render(replaceText, config)
    return prompt
    } catch (error) {
      this.addErrorLog(error, "getNoteVarInfo")
      throw error;
    }
  }
  static MD5(base64Data){
    const wordArray = CryptoJS.enc.Base64.parse(base64Data);
    let md5 = CryptoJS.MD5(wordArray).toString();
    return md5
  }

static async getTextVarInfo(text,userInput,vision=false,ocr=this.OCREnhancedMode) {
  try {
  let vars = this.parseVars(text)
  let noteInfo = vars.noteInfo
  let mindmapObject = await this.getMindmapObject(vars)
    // this.showHUD(userInput+vars.hasUserInput)
  let replaceText= text
  let noteConfig = undefined
  if (noteInfo.hasNote) {
    noteConfig = await this.getNoteObject(MNNote.getFocusNote(),{
      noteInfo:vars.noteInfo,first:true,parentLevel:noteInfo.parentLevel,child:noteInfo.hasChild
    })
  }
  let docConfig = await this.getDocObject(MNUtil.currentDoc,{withContent:vars.hasCurrentDocContent})
  if (!docConfig) {
    return undefined
  }
  let preObject = {
    visionMode:vision,
    currentDoc:docConfig,
    mindmap:mindmapObject
  }
  if (noteConfig) {
    preObject.note = noteConfig
  }
  if (vars.hasCurrentSelection) {
    let currentSelection = this.getCurrentSelectionObject()
    preObject.currentSelection = currentSelection
    if (currentSelection.onSelection) {
      preObject.isSelectionImage = (currentSelection.type === "image")
      preObject.isSelectionText = (currentSelection.type === "text")
      preObject.selectionText = currentSelection.text
    }else{
      preObject.isSelectionText = false
      preObject.isSelectionImage = false
    }
  }
  if (vars.hasFocusNote) {
    let focusNote = this.getFocusNote(false)
    if (focusNote) {
      preObject.hasFocusNote = true
    }else{
      preObject.hasFocusNote = false
    }
  }
  if (vars.hasTimer) {
    preObject.timer = await this.getTimerStatus()
  }
  let config = this.getVarInfo(vars,preObject)
  let fileContent = undefined
  let selectedText = MNUtil.selectionText
  if (MNUtil.activeTextView && MNUtil.activeTextView.selectedRange.length>0) {
    let range = MNUtil.activeTextView.selectedRange
    selectedText = MNUtil.activeTextView.text.slice(range.location,range.location+range.length)
  }
  if (vars.hasOCR || vars.hasCardOCR || vars.hasParentCardOCR || vars.hasCardsOCR) {
    let docImage = MNUtil.getDocImage()
    if (docImage) {
      let ocrText = await chatAINetwork.getTextOCR(docImage)
      if (ocrText && ocrText.trim()) {
        selectedText = ocrText
      }
    }
    if (vars.hasOCR) {
      config.textOCR = selectedText
    }
    if (vars.hasCardOCR) {
      config.cardOCR = selectedText
    }
    if (vars.hasParentCardOCR) {
      config.parentCardOCR = selectedText
    }
    if (vars.hasCardsOCR) {
      config.cardsOCR = selectedText
    }
  }
  if (vars.hasNotesInMindmap) {
    config.notesInMindmap = mindmapObject.allNotes
  }

  if (vars.hasContext || vars.hasCard || vars.hasParentCard || vars.hasCards) {
    if (ocr) {
      let docImage = MNUtil.getDocImage()
      if (docImage) {
        let ocrText = await chatAINetwork.getTextOCR(docImage)
        if (ocrText && ocrText.trim()) {
          selectedText = ocrText
        }
      }
    }
    if (vars.hasContext) {
      config.context = selectedText
    }
    if (vars.hasCard) {
      config.card = selectedText
    }
    if (vars.hasParentCard) {
      config.parentCard = selectedText
    }
    if (vars.hasCards) {
      config.cards = selectedText
    }
  }
  if (vars.hasUserInput ) {
    if (userInput ) {
      selectedText = userInput
    }else if (ocr) {
      let docImage = MNUtil.getDocImage()
      if (docImage) {
        let ocrText = await chatAINetwork.getTextOCR(docImage)
        if (ocrText && ocrText.trim()) {
          selectedText = ocrText
        }
      }
    }
    config.userInput = selectedText
  }
  if (vars.hasCurrentDocInfo || vars.hasNoteDocInfo) {
    let currentFile = this.getCurrentFile()
    if (!currentFile.fileExists) {
      return undefined
    }
    let PDFExtractMode = chatAIConfig.getConfig("PDFExtractMode")
    let fileInfo = await chatAIConfig.getFileContent(currentFile,PDFExtractMode === "local")
    // MNUtil.log({message:"fileInfo",detail:fileInfo})
    fileContent = JSON.stringify(fileInfo,undefined,2)
    // copy(fileContent)
    if (vars.hasCurrentDocInfo) {
      config.currentDocInfo = fileContent
    }
    if (vars.hasNoteDocInfo) {
      config.noteDocInfo = fileContent
    }
  }
  if (vars.hasCurrentDocAttach || vars.hasNoteDocAttach) {
    let content = ""
    if (typeof editorUtils === 'undefined') {
      MNUtil.showHUD("Please install 'MN Editor' first!")
    }else{
      content = editorUtils.getAttachContentByMD5(MNUtil.currentDocmd5)
    }
    if (vars.hasCurrentDocAttach) {
      config.currentDocAttach = content
    }
    if (vars.hasNoteDocAttach) {
      config.noteDocAttach = content
    }
  }
  // MNUtil.copy(config)
  // chatAIUtils.log("getTextVarInfo", config)
  let output = MNUtil.render(replaceText, config)
  return output
  // MNUtil.copy(output)
  // return this.replacVar(replaceText, config)
    } catch (error) {
    this.addErrorLog(error, "getTextVarInfo")
    throw error;
    // this.addErrorLog(error, "getTextVarInfo")
  }

}
  /**
   * Displays a confirmation dialog with a main title and a subtitle.
   * 
   * This method shows a confirmation dialog with the specified main title and subtitle.
   * It returns a promise that resolves with the button index of the button clicked by the user.
   * 
   * @param {string} mainTitle - The main title of the confirmation dialog.
   * @param {string} subTitle - The subtitle of the confirmation dialog.
   * @param {string[]} items - The items of the confirmation dialog.
   * @returns {Promise<number|undefined>} A promise that resolves with the button index of the button clicked by the user.
   */
  static async confirm(mainTitle,subTitle,items = ["Cancel","Confirm"]){
    if (MNOnAlert) {
      return
    }
    MNOnAlert = true
    return new Promise((resolve, reject) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        mainTitle,subTitle,0,items[0],items.slice(1),
        (alert, buttonIndex) => {
          MNOnAlert = false
          // MNUtil.copyJSON({alert:alert,buttonIndex:buttonIndex})
          resolve(buttonIndex)
        }
      )
    })
  }
  /**
   * 递归解析列表项及其子列表
   * @param {object[]} items 
   * @returns 
   */
  static processList(items) {
  return items.map(item => {
    // 提取当前列表项文本（忽略内部格式如粗体、斜体）
    const text = item.text.trim();
    const node = { name: text, children: [] ,type:item.type};

    // 检查列表项内部是否包含子列表（嵌套结构）
    const subLists = item.tokens.filter(t => t.type === 'list');
    if (subLists.length) {
      node.hasList = true
      node.listText = subLists[0].raw
      node.listStart = subLists[0].start
      node.listOrdered = subLists[0].ordered
      node.name = item.tokens[0].text
    }
    subLists.forEach(subList => {
      // 递归处理子列表的 items
      node.children.push(...this.processList(subList.items));
    });

    return node;
  });
}
static getUnformattedText(token) {
  if ("tokens" in token && token.tokens.length === 1) {
    return this.getUnformattedText(token.tokens[0])
  }else{
    return token.text
  }
}
/**
 * 构建树结构（整合标题和列表解析）
 * @param {object[]} tokens 
 * @returns 
 */
  static buildTree(tokens) {
  const root = { name: '中心主题', children: [] };
  const stack = [{ node: root, depth: 0 }]; // 用栈跟踪层级
  let filteredTokens = tokens.filter(token => token.type !== 'space' && token.type !== 'hr')

  filteredTokens.forEach((token,index) => {
    let current = stack[stack.length - 1];

    if (token.type === 'heading') {
      // 标题层级比栈顶浅，则回退栈到对应层级
      while (stack.length > 1 && token.depth <= current.depth) {
        stack.pop();
        current = stack[stack.length - 1]
      }
      const newNode = { name: this.getUnformattedText(token), children: [] ,type:'heading'};
      current.node.children.push(newNode);
      stack.push({ node: newNode, depth: token.depth });
    } else if (token.type === 'list') {
      // 处理列表（可能包含多级嵌套）
      const listNodes = this.processList(token.items);
      if(index && filteredTokens[index-1].type === 'paragraph'){
        if (current.node.type === 'paragraph') {
          stack.pop();
        }
        stack.push({ node: current.node.children.at(-1), depth: 100 });
        current = stack[stack.length - 1];
        // current.node.children.at(-1).hasList = true;
        // current.node.children.at(-1).listText = token.raw;
        // current.node.children.at(-1).listStart = token.start;
        // current.node.children.at(-1).ordered = token.ordered;
        // current.node.children.at(-1).children.push(...listNodes)
      }
      current.node.hasList = true;
      current.node.listText = token.raw;
      current.node.listStart = token.start;
      current.node.ordered = token.ordered;
      current.node.children.push(...listNodes);
      
    } else {
      if (token.type === 'paragraph' && current.node.type === 'paragraph') {
        stack.pop();
        current = stack[stack.length - 1];
      }
      current.node.children.push({ name: token.raw, raw: token.raw, children: [] ,type:token.type});
    }
  });
  return root;
}
  static markdown2AST(markdown){
    let tokens = marked.lexer(markdown)
    // MNUtil.copy(tokens)
    return this.buildTree(tokens)
  }
static  containsMathFormula(markdownText) {
    // 正则表达式匹配单美元符号包裹的公式
    const inlineMathRegex = /\$[^$]+\$/;
    // 正则表达式匹配双美元符号包裹的公式
    const blockMathRegex = /\$\$[^$]+\$\$/;
    // 检查是否包含单美元或双美元符号包裹的公式
    return inlineMathRegex.test(markdownText) || blockMathRegex.test(markdownText);
}
static  containsUrl(markdownText) {
    // 正则表达式匹配常见的网址格式
    const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+/i;
    
    // 使用正则表达式测试文本
    return urlPattern.test(markdownText);
}

static removeMarkdownFormat(markdownStr) {
  return markdownStr
    // 移除加粗 ** ** 和 __ __
    .replace(/\*\*(\S(.*?\S)?)\*\*/g, '$1')
    .replace(/__(\S(.*?\S)?)__/g, '$1')
    // 移除斜体 * * 和 _ _
    .replace(/\*(\S(.*?\S)?)\*/g, '$1')
    .replace(/_(\S(.*?\S)?)_/g, '$1')
    // 移除删除线 ~~ ~~
    .replace(/~~(\S(.*?\S)?)~~/g, '$1')
    // 移除内联代码 ` `
    .replace(/`([^`]+)`/g, '$1')
    // 移除链接 [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片 ![alt](url)
    .replace(/!\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除标题 # 和 ##
    .replace(/^#{1,6}\s+/gm, '')
    // 移除部分列表符号（*、-、+.）
    .replace(/^[\s\t]*([-*+]\.)\s+/gm, '')
    // 移除块引用 >
    .replace(/^>\s+/gm, '')
    // 移除水平线 ---
    .replace(/^[-*]{3,}/gm, '')
    // 移除HTML标签（简单处理）
    .replace(/<[^>]+>/g, '')
    // 合并多个空行
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
static getConfig(text){
  let hasMathFormula = this.containsMathFormula(text)
  if (hasMathFormula) {
    if (/\:/.test(text)) {
      let splitedText = text.split(":")
      if (this.containsMathFormula(splitedText[0])) {
        let config = {excerptText:text,excerptTextMarkdown:true}
        return config
      }
      if (this.containsMathFormula(splitedText[1])) {
        let config = {title:splitedText[0],excerptText:splitedText[1],excerptTextMarkdown:true}
        return config
      }
      let config = {title:splitedText[0],excerptText:splitedText[1]}
      return config
    }
    if (/\：/.test(text)) {
      let splitedText = text.split("：")
      if (this.containsMathFormula(splitedText[0])) {
        let config = {excerptText:text,excerptTextMarkdown:true}
        return config
      }
      if (this.containsMathFormula(splitedText[1])) {
        let config = {title:splitedText[0],excerptText:splitedText[1],excerptTextMarkdown:true}
        return config
      }
      let config = {title:splitedText[0],excerptText:splitedText[1]}
      return config
    }
    let config = {excerptText:text,excerptTextMarkdown:true}
    return config
  }
  if (this.containsUrl(text)) {
    let config = {excerptText:text,excerptTextMarkdown:true}
    return config
  }
    if (/\:/.test(text)) {
      let splitedText = text.split(":")
      if (splitedText[0].length > 50) {
        let config = {excerptText:text}
        return config
      }
      let config = {title:splitedText[0],excerptText:splitedText[1]}
      return config
    }
    if (/\：/.test(text)) {
      let splitedText = text.split("：")
      if (splitedText[0].length > 50) {
        let config = {excerptText:text}
        return config
      }
      let config = {title:splitedText[0],excerptText:splitedText[1]}
      return config
    }
  if (text.length > 50) {
    return {excerptText:text}
  }
  return {title:text}
}
  /**
 * 
 * @param {MNNote} note 
 * @param {Object} ast 
 */
static AST2Mindmap(note,ast,level = "all") {
try {
  if (ast.children && ast.children.length) {
    let hasList = ast.hasList
    let listOrdered = ast.listOrdered || ast.ordered
    ast.children.forEach((c,index)=>{
      if (c.type === 'hr') {
        return
      }
      if (c.type === 'table') {
        let config = {excerptText:c.name,excerptTextMarkdown:true}
        let childNote = note.createChildNote(config)
        return
      }
      let text = this.removeMarkdownFormat(c.name)
      // let text = c.name
      if (text.endsWith(":") || text.endsWith("：")) {
        text = text.slice(0,-1)
      }
      let config = this.getConfig(text)
      if ((text.startsWith('$') && text.endsWith('$')) || /\:/.test(text) || /：/.test(text)) {

      }else{
        if (c.children.length === 1 && !(/\:/.test(c.children[0].name) || /：/.test(c.children[0].name))) {
          if (text.endsWith(":") || text.endsWith("：")) {
            config = {excerptText:text+"\n"+c.children[0].name}
          }else{
            config = {title:text,excerptText:c.children[0].name}
          }
          let childNote = note.createChildNote(config)
          if (c.children[0].children.length) {
            this.AST2Mindmap(childNote,c.children[0])
          }
          return
        }
        if (c.children.length > 1 && c.children[0].type === 'paragraph' && c.children[1].type === 'heading') {
          if (text.endsWith(":") || text.endsWith("：")) {
            config = {excerptText:text+"\n"+c.children[0].name}
          }else{
            config = {title:text,excerptText:c.children[0].name}
          }
          c.children.shift()
        }
      }
      if (hasList && listOrdered) {
        if (ast.listStart == 0) {
          ast.listStart = 1
        }
        if (config.title) {
          config.title = (ast.listStart+index)+". "+config.title
        }else{
          config.excerptText = (ast.listStart+index)+". "+config.excerptText
        }
      }
      // MNUtil.showHUD("message")
      //继续创建子节点
      let childNote = note.createChildNote(config)
      this.AST2Mindmap(childNote,c)
    })
  }else{
    // MNUtil.showHUD("No children found")
  }
  } catch (error) {
  this.addErrorLog(error, "AST2Mindmap")
}
}
static getValidJSON(jsonString,debug = false) {
  try {
    if (typeof jsonString === "object") {
      return jsonString
    }
    return JSON.parse(jsonString)
  } catch (error) {
    try {
      // MNUtil.log({message:"error in getValidJSON",detail:{jsonString:jsonString,error:error.message}})
      return JSON.parse(jsonrepair(jsonString))
    } catch (error) {
      let errorString = error.toString()
      try {
        if (errorString.startsWith("Unexpected character \"{\" at position")) {
          return JSON.parse(jsonrepair(jsonString+"}"))
        }
        return {}
      } catch (error) {
        debug && this.addErrorLog(error, "getValidJSON", jsonString)
        return {}
      }
    }
  }
}

/**
 * 
 * @param {string|number} color 
 * @returns {number}
 */
static getColorIndex(color){
    if (typeof color === 'string') {
      let colorMap = {
        "LIGHTYELLOW":0,
        "LIGHTGREEN":1,
        "LIGHTBLUE":2,
        "LIGHTRED":3,
        "YELLOW":4,
        "GREEN":5,
        "BLUE":6,
        "RED":7,
        "ORANGE":8,
        "LIGHTORANGE":8,
        "DARKGREEN":9,
        "DARKBLUE":10,
        "DARKRED":11,
        "DEEPRED":11,
        "WHITE":12,
        "LIGHTGRAY":13,
        "DARKGRAY":14,
        "PURPLE":15,
        "LIGHTPURPLE":15,
      }
      // let colors  = ["LightYellow", "LightGreen", "LightBlue", "LightRed","Yellow", "Green", "Blue", "Red", "Orange", "DarkGreen","DarkBlue", "DeepRed", "White", "LightGray","DarkGray", "Purple"]
      let index = colorMap[color.toUpperCase()]
      if (index !== -1) {
        return index
      }
      return -1
    } else {
      return color
    }

  }
static fixMarkdownLatexSpaces(markdownText) {
  // 正则表达式用于匹配内联 LaTeX 公式
  // (?<!\$): 反向否定查找，确保前面的字符不是美元符号（排除 $$ 开头的情况）
  // \$: 匹配开头的美元符号
  // ([^$]+?): 捕获组1，匹配一个或多个非美元符号的字符（非贪婪模式），这是公式内容
  // \$: 匹配结尾的美元符号
  // (?!\$): 正向否定查找，确保后面的字符不是美元符号（排除 $$ 结尾的情况）
  const inlineLatexRegex = /(?<!\$)\$([^$]+?)\$(?!\$)/g;

  return markdownText.replace(inlineLatexRegex, (match, content) => {
    // match 是整个匹配到的字符串，例如 "$ i $" 或 "$ A \in \mathbb{R}^{n \times n} $"
    // content 是捕获组中的内容，例如 " i " 或 " A \in \mathbb{R}^{n \times n} "
    const trimmedContent = content.trim(); // 移除内容两端的空格
    return '$' + trimmedContent + '$';
  });
}
static replaceLtInLatexBlocks(markdown) {
    return markdown.replace(/\$\$(.*?)\$\$/gs, (match, latexContent) => {
        return '$$' + latexContent.replace(/</g, '\\lt') + '$$';
    });
}

/**
 * 将字符串中美元符号包裹的 LaTeX 公式替换为 KaTeX 渲染后的 HTML
 * @param {string} inputStr - 包含可能公式的原始字符串（如 "E=mc^2$，块级公式：$$\int_a^b f(x)dx$$"）
 * @param {Object} [katexOptions] - KaTeX 渲染配置项（可选，默认：{ throwOnError: false }）
 * @returns {string} 替换公式后的 HTML 字符串
 */
static renderKaTeXFormulas(inputStr, katexOptions = {}) {
  // 合并默认配置和用户配置（throwOnError 默认关闭，避免生产环境报错）
  const defaultOptions = { throwOnError: false, errorColor: "#cc0000" };
  const options = { ...defaultOptions, ...katexOptions };

  // 正则表达式：匹配 $$...$$（块级公式）和 $...$（行内公式）
  // 注意：使用非贪婪匹配（*?）避免跨多个公式匹配，同时排除转义的 \$（即 \$ 不视为公式分隔符）
  const formulaRegex = /(?<!\\)\$\$(.*?)(?<!\\)\$\$|(?<!\\)\$(.*?)(?<!\\)\$/gs;

  // 替换匹配到的公式
  return inputStr.replace(formulaRegex, (match, blockFormula, inlineFormula) => {
    // 判断是块级公式（$$...$$）还是行内公式（$...$）
    const isBlock = blockFormula !== undefined;
    const formulaContent = isBlock ? blockFormula.trim() : inlineFormula.trim();

    try {
      // 使用 KaTeX 渲染公式为 HTML 字符串
      return katex.renderToString(formulaContent, {
        ...options,
        displayMode: isBlock, // 块级公式设置 displayMode: true
      });
    } catch (error) {
      // 渲染失败时，返回错误提示（保留原始公式内容以便调试）
      console.error("KaTeX 渲染错误:", error, "公式内容:", formulaContent);
      return `<span style="color: ${options.errorColor}; background: #ffebee; padding: 2px 4px; border-radius: 2px;">
        [公式错误: ${formulaContent}]
      </span>`;
    }
  });
}
/**
 * 
 * @param {string} code 
 * @returns 
 */
static getChoiceBlock(code) {
  // let url = `userselect://choice?content=${encodeURIComponent(code)}`
  let tem = code.split(". ")
  if (tem.length > 1 && tem[0].trim().length === 1) {
    let choiceWithLatex = this.renderKaTeXFormulas(tem.slice(1).join(". "))
    
  return `<div style="margin-top: 15px;">
  <div style="display: block; padding: 0.8em 0.8em; color: #495057; border-radius: 20px; text-decoration: none; border: 0.1em solid #dee2e6; background: #f1f7fe; cursor: pointer; box-sizing: border-box; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.02); position: relative;">
    <span style="display: inline-block; width: 1.8em; height: 1.8em; background: #2196f3; color: white; border-radius: 50%; text-align: center; line-height: 1.8em; font-weight: 600; margin-right: 0.5em; vertical-align: middle; ">${tem[0]}</span>
    <span style="vertical-align: middle;">${choiceWithLatex}</span>
  </div>
  </div>`
  }
  return `<div style="margin-top: 15px;">
  <div style="display: block; padding: 0.8em 0.8em; color: #495057; border-radius: 20px; text-decoration: none; border: 0.1em solid #dee2e6; background: #f1f7fe; cursor: pointer; box-sizing: border-box; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.02); position: relative;">
      <span style="vertical-align: middle;">${this.renderKaTeXFormulas(code)}</span>
  </div>
  </div>`
}
static getChoicesHTML(choices){
try {
  // chatAIUtils.log("choices", choices)
  let choicesHTML = choices.map(choice => {
    return this.getChoiceBlock(choice)
  }).join("\n")
  return choicesHTML
} catch (error) {
  return ""
}

}
static codeBlockReplacer(lang,format,code){
    let encodedContent = encodeURIComponent(code);
    if (lang === "userSelect") {
      let url = `userselect://choice?content=${encodedContent}`
      return `<div><a href="${url}" style="
    display: block;
    padding: 10px 12px;
    margin-top: 10px;
    background: #e3eefc;
    color: #1565c0;
    border-radius: 8px;
    text-decoration: none;
    border: 2px solid transparent;
    border-color: #90caf9;
    font-size: 16px;
    cursor: pointer;
    box-sizing: border-box;
"
>
${code.trim()}
</a></div>`
    }
    if (lang === "addNote") {
      let url = `userselect://addnote?content=${encodedContent}`
      if (format === "markdown") {
        url = `userselect://addnote?content=${encodedContent}&format=markdown`
        code = MNUtil.md2html(code)
      }
      return `<div><a href="${url}" style="
    display: block;
    padding: 10px 12px;
    margin-top: 10px;
    background:rgb(230, 255, 239);
    color:#237427;
    border-radius: 8px;
    text-decoration: none;
    border: 2px solid transparent;
    border-color:#01b76e;
    font-size: 16px;
    cursor: pointer;
    box-sizing: border-box;
"
>
<div style="font-weight: bold;margin-bottom: 5px;font-size: 18px;">➕点击创建笔记：</div>
${code.trim()}
</a></div>`
  }
    if (lang === "addComment") {
      let url = `userselect://addcomment?content=${encodedContent}`
      if (format === "markdown") {
        url = `userselect://addnote?content=${encodedContent}&format=markdown`
        code = MNUtil.md2html(code)
      }
      return `<div><a href="${url}" style="
    display: block;
    padding: 10px 12px;
    margin-top: 10px;
    background:rgb(230, 255, 239);
    color:#237427;
    border-radius: 8px;
    text-decoration: none;
    border: 2px solid transparent;
    border-color:#01b76e;
    font-size: 16px;
    cursor: pointer;
    box-sizing: border-box;
"
>
<div style="font-weight: bold;margin-bottom: 5px;font-size: 18px;">➕点击添加卡片评论：</div>
${code.trim()}
</a></div>`
  }
  return ""
}

/**
 * 从markdown中提取 userSelect 或 addNote 代码块，并替换成指定内容
 * @param {string} markdown - 原始markdown
 * @returns {{markdown: string, blocks: string[]}} 
 */
static replaceSpecialBlocks(markdown) {
  // const blocks = [];
  // 正则：匹配```userSelect 或 ```addNote 开头，直到下一个```
const pattern = /```(userSelect|addNote|addComment)\s*(plaintext|markdown|json)?\n([\s\S]*?)```/g;
const newMarkdown = markdown.replace(pattern, (match, lang, format, code) => {
    // blocks.push(code);
    if (this.cacheInfo.enabled) {
      if (match in this.cache) {
        // this.cacheInfo.times++
        // this.cacheInfo.number = Object.keys(this.cache).length
        // MNUtil.log({message:"Using cache",cacheInfo:this.cacheInfo})
        return this.cache[match]
      }
      let res = this.codeBlockReplacer(lang,format,code)
      this.cache[match] = res
      return res
    }else{
      return this.codeBlockReplacer(lang,format,code)
    }
    // return typeof replacer === 'function'
    //   ? replacer(lang,format,code)
    //   : String(replacer);
  });
  return { markdown: newMarkdown };
}
static replaceButtonCodeBlocks(markdown) {
//   let replacer = (lang,format,code) => {
//     let encodedContent = encodeURIComponent(code);
//     if (lang === "userSelect") {
//       let url = `userselect://choice?content=${encodedContent}`
//       return `<div><a href="${url}" style="
//     display: block;
//     padding: 10px 12px;
//     margin-top: 10px;
//     background: #e3eefc;
//     color: #1565c0;
//     border-radius: 8px;
//     text-decoration: none;
//     border: 2px solid transparent;
//     border-color: #90caf9;
//     font-size: 16px;
//     cursor: pointer;
//     box-sizing: border-box;
// "
// >
// ${code.trim()}
// </a></div>`
//     }
//     if (lang === "addNote") {
//       let url = `userselect://addnote?content=${encodedContent}`
//       if (format === "markdown") {
//         url = `userselect://addnote?content=${encodedContent}&format=markdown`
//         code = MNUtil.md2html(code)
//       }
//       return `<div><a href="${url}" style="
//     display: block;
//     padding: 10px 12px;
//     margin-top: 10px;
//     background:rgb(230, 255, 239);
//     color:#237427;
//     border-radius: 8px;
//     text-decoration: none;
//     border: 2px solid transparent;
//     border-color:#01b76e;
//     font-size: 16px;
//     cursor: pointer;
//     box-sizing: border-box;
// "
// >
// <div style="font-weight: bold;margin-bottom: 5px;font-size: 18px;">➕点击创建笔记：</div>
// ${code.trim()}
// </a></div>`
//   }
//     if (lang === "addComment") {
//       let url = `userselect://addcomment?content=${encodedContent}`
//       if (format === "markdown") {
//         url = `userselect://addnote?content=${encodedContent}&format=markdown`
//         code = MNUtil.md2html(code)
//       }
//       return `<div><a href="${url}" style="
//     display: block;
//     padding: 10px 12px;
//     margin-top: 10px;
//     background:rgb(230, 255, 239);
//     color:#237427;
//     border-radius: 8px;
//     text-decoration: none;
//     border: 2px solid transparent;
//     border-color:#01b76e;
//     font-size: 16px;
//     cursor: pointer;
//     box-sizing: border-box;
// "
// >
// <div style="font-weight: bold;margin-bottom: 5px;font-size: 18px;">➕点击添加卡片评论：</div>
// ${code.trim()}
// </a></div>`
//   }
//   return ""
// }
let res = this.replaceSpecialBlocks(markdown)
  return res.markdown
}
/**
 * 通过对URL参数进行编码，来修复文本中特定格式的Markdown链接。
 * 此函数会查找形如 [文字](userselect://choice?content=文字) 的链接，
 * 并对 content 参数的值进行标准的URL编码，以确保链接格式正确，能被正常解析。
 *
 * @param {string} text - 包含可能需要修复的Markdown链接的原始字符串。
 * @returns {string} - 修复了链接格式的新字符串。
 */
static fixMarkdownLinks(text) {
  // 正则表达式用于匹配并捕获链接文本和需要编码的内容。
  // 捕获组1 ($1): 方括号内的链接文本。
  // 捕获组2 ($2): `content=`之后到右括号之前的所有内容。
  // const brokenLinkRegex = /\[([^\]]+)\]\(userselect:\/\/(choice|addnote|addcomment)(\?content=([^)]+))?\)/g;
  // 匹配加粗链接
  const brokenLinkRegex = /\**\[([^\]]+)\]\(userselect:\/\/(choice|addnote|addcomment)(\?content=([^)]+))?\)\**/g;

  /**
   * 这是一个自定义的替换函数。
   * String.prototype.replace() 可以接受一个函数作为第二个参数，
   * 对每一个匹配项动态地创建替换字符串。
   * @param {string} match - 完整的匹配项，例如 "[A...](userselect...)"
   * @param {string} linkText - 捕获组1的内容。
   * @param {string} content - 捕获组2的内容。
   * @returns {string} - 格式修复后的完整Markdown链接。
   */
  const replacer = (match, linkText, host,content) => {
    // 使用 encodeURIComponent 对包含特殊字符的内容进行编码。
    // 这是处理URL参数的标准做法。
      const encodedLinkText = encodeURIComponent(linkText);
    if (content) {
      const encodedContent = encodeURIComponent(decodeURIComponent(content).replace("?content=", ""));
      let url = `userselect://${host}?content=${encodedContent}&linkText=${encodedLinkText}`
      // 重新组装成修复后的链接。
      return `\n<div>
<a href="${url}" style="
    display: block;
    padding: 10px 12px;
    margin-top: 10px;
    background: #e3eefc;
    color: #1565c0;
    border-radius: 8px;
    text-decoration: none;
    border: 2px solid transparent;
    border-color: #90caf9;
    font-size: 16px;
    cursor: pointer;
    box-sizing: border-box;
"
>
    ${linkText}
</a>
</div>`
      // return `[${linkText}](userselect://${host}?content=${encodedContent}&linkText=${encodedLinkText})`;
    }else{
      let url = `userselect://${host}?linkText=${encodedLinkText}`
      // 重新组装成修复后的链接。
      return `\n<div>
<a href="${url}" style="
    display: block;
    padding: 10px 12px;
    margin-top: 10px;
    background: #e3eefc;
    color: #1565c0;
    border-radius: 8px;
    text-decoration: none;
    border: 2px solid transparent;
    border-color: #90caf9;
    font-size: 16px;
    cursor: pointer;
    box-sizing: border-box;
"
>
    ${linkText}
</a>
</div>`
      // return `[${linkText}](userselect://${host}?linkText=${encodedLinkText})`;
    }
  };

  // 执行查找和替换。
  return text.replace(brokenLinkRegex, replacer);
}
/**
 * 
 * @param {MNNote} note 
 * @returns {boolean}
 */
static isBlankNote(note){//指有图片摘录但图片分辨率为1x1的空白图片
  if (note.excerptPic) {
    let imageData = MNUtil.getMediaByHash(note.excerptPic.paint)
    let image = UIImage.imageWithData(imageData)
    if (image.size.width === 1 && image.size.height === 1) {
      return true
    }
  }
  return false
}
  /**
   * 
   * @param {NSData} data 
   * @returns {string}
   */
  static dataToString(data){
    if (data instanceof NSData) {
      return NSString.stringWithContentsOfData(data)
    }
    return data
  }
/**
 * 判断模型是否支持视觉
 * @param {string} model - 模型名称
 * @returns {boolean} true=支持视觉，false=不支持
 */
static isVisionModel(model) {
  if (!model || typeof model !== 'string') return false;
  //常见模型直接返回true
  if (model.startsWith("gemini")) {
    return true;
  }
  if (model.startsWith("gpt")) {
    return true;
  }
  if (model.startsWith("claude")) {
    return true;
  }
  if (model.startsWith("moonshot")) {
    return true;
  }
  if (model.startsWith("doubao-seed-1-6")) {
    return true;
  }
  if (chatAIConfig.modelsWithVision.includes(model)) {
    //对于确定是支持视觉的模型，直接返回true
    return true;
  }
  // 第一层：精确字符串匹配（最快、最安全）
  if (chatAIConfig.modelsWithoutVision.includes(model)) {
    //对于确定是不支持视觉的模型，直接返回false
    return false;
  }
  // 第二层：正则模糊匹配（处理变体、大小写、路径前缀等）
  for (const pattern of chatAIConfig.modelsWithoutVisionPatterns) {
    //对于不确定的模型，进行正则模糊匹配
    if (pattern.test(model)) {
      //如果匹配到，则返回false
      return false;
    }
  }
  // 第三层：默认支持视觉
  return true;
}
  static checkVision(history,config){
    // MNUtil.log({message:"Checking vision model in history",detail:{history:history,config:config}})
    let hasImage = this.hasImageInHistory(history)
    if (hasImage) {
      // MNUtil.log("History contains image message")
      let model = config.model
      if (!("model" in config) && config.source === "Built-in") {
        let keyInfo = chatAIConfig.keys["key"+chatAIConfig.getConfig("tunnel")]
        model = keyInfo.model
      }
      if (!this.isVisionModel(model)) {
        return {proceed:false,model:model}
      }
      
    }
    return {proceed:true}
  }
  static hasImageInHistory(history){
  try {

    if (history.length === 0) {
      return false
    }
    let imageMessage = history.find(message=>{
      if (message.role !== "user") {
        return false
      }
      if (Array.isArray(message.content)) {
        return message.content.some(content=>{
          if (content.type === "image_url") {
            return true
          }
          return false
        })
      }
      return false
    })
    return !!imageMessage
    
  } catch (error) {
    this.addErrorLog(error, "hasImageInHistory",history)
    return false
  }
  }
  /**
   * 等待响应结束
   * @param {number} interval 轮询间隔时间,单位为毫秒,默认1000毫秒
   * @returns {Promise<void>}
   */
  static async waitForResponseFinish(interval = 1000,showHUD = true){
    try {
      return new Promise((resolve, reject) => {
        let timer = this.setInterval(() => {
          if (!this.notifyController.connection) {
            this.clearInterval(timer)
            resolve()
          }else{
            if (showHUD) {
              if (this.notifyController.onreceive) {
                MNUtil.waitHUD("Receiving response...")
              }else{
                MNUtil.waitHUD("Connecting...")
              }
            }
          }
        }, interval);
      })
    } catch (error) {
      this.addErrorLog(error, "waitForResponseFinish")
      return undefined
    }
  
  }
  /**
   * @param {Object} option 
   * @param {String} option.prompt 
   * @param {String} option.promptKey 
   * @param {String} option.instruction 
   * @param {String} option.forceToExecute 是否强制执行，即无视当前是否有正在执行的prompt 
   * @param {String} option.user 
   * @param {String} option.system 
   * @returns {Promise<boolean>}
   */
  static async beginAsk(option){
  try {
    let forceToExecute = option.forceToExecute ?? false
    if (option.promptKey) {
      this.notifyController.noteid = this.currentNoteId
      this.notifyController.askWithPrompt(option.promptKey,forceToExecute)
      return
    }
    if (option.prompt) {
      let prompt = option.prompt
      let promptKeys = chatAIConfig.config.promptNames
      let promptNames = promptKeys.map(key=>chatAIConfig.prompts[key].title)
      let similarPrompts = this.findSimilarPrompts(prompt, promptNames)
      if (similarPrompts.length) {
        let firstPrompt = similarPrompts[0]
        let promptKey = this.findKeyByTitle(chatAIConfig.prompts, firstPrompt)
        this.notifyController.noteid = this.currentNoteId
        this.chatController.ask(promptKey,forceToExecute)
      }
      return true
    }else if(option.user){
      let contextMessage = await this.render(option.user,{})
      let question = [this.genUserMessage(contextMessage)]
      
      if (option.system) {
        let systemMessage = await this.render(option.system,{})
        // question.unshift({role:"system",content:systemMessage})
        question.unshift(this.genSystemMessage(systemMessage))
      }
      this.notifyController.customAsk(question)
    }else{
      this.notifyController.noteid = this.currentNoteId
      this.notifyController.text = this.currentSelectionText
      this.chatController.ask()
    }
    return true
  } catch (error) {
    this.addErrorLog(error, "beginAsk")
    return false
  }
  }
  /**
   * 用轮询的形式尝试兼顾UI和函数返回,无法支持批量调用
   * @param {Object} option 
   * @param {String} option.prompt 
   * @param {String} option.promptKey 
   * @param {String} option.instruction 
   * @param {String} option.forceToExecute 是否强制执行，即无视当前是否有正在执行的prompt 
   * @param {String} option.user 
   * @param {String} option.system 
   * @param {String} option.interval 轮询间隔时间
   * @param {boolean} option.showHUD 是否显示等待提示，默认true
   * @param {boolean} waitForResponse 是否等待响应结束
   * @returns {Promise<String>}
   */
  static async ask(option,waitForResponse=true){
    try {
    let proceed = await this.beginAsk(option ?? {})
    if (!proceed) {
      return undefined
    }
    if (!waitForResponse) {
      return
    }
    let showHUD = option.showHUD ?? true
    // this.notifyController.customAsk(question)
    await this.waitForResponseFinish(option.interval ?? 1000,showHUD)
    if (showHUD) {
      MNUtil.waitHUD("✅ Finish")
    }
    let response = await this.getCurrentResponse()
    MNUtil.stopHUD(0.5)
    return response

    } catch (error) {
      this.addErrorLog(error, "ask")
    }
  }
  static async getCurrentResponse(){
    try {
      return await this.notifyController.getTextForAction()
    } catch (error) {
      this.addErrorLog(error, "getCurrentResponse")
      return undefined
    }
  }
  /**
   * Groups the specified function within an undo operation for the given notebook.
   * 
   * This method wraps the provided function within an undo operation for the specified notebook.
   * It ensures that the function's changes can be undone as a single group. After the function is executed,
   * it refreshes the application to reflect the changes.
   * 
   * @param {Function} f - The function to be executed within the undo group.
   * @param {string} [notebookId=this.currentNotebookId] - The ID of the notebook for which the undo group is created.
   */
  static undoGroupingNotRefresh(f,notebookId = MNUtil.currentNotebookId){
    UndoManager.sharedInstance().undoGrouping(
      String(Date.now()),
      notebookId,
      f
    )
  }
static xorEncryptDecrypt(input, key) {
  try {
    if (!key) throw new Error("Key cannot be empty"); // 提前校验key非空
    let output = [];
    let result = "";
    const chunkSize = 10000; // 分块大小（根据引擎性能调整）
    for (let i = 0; i < input.length; i++) {
      const code = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      output.push(code);
      // 分块转换：当数组达到chunkSize时，批量生成字符串并清空临时数组
      if (output.length >= chunkSize) {
        result += String.fromCharCode(...output); // 用扩展运算符（...）代替apply，或直接循环拼接
        output = [];
      }
    }
    // 处理剩余的码点
    result += String.fromCharCode(...output);
    return result;
  } catch (error) {
    // MNLog.error("xorEncryptDecrypt error: "+error, key);
    this.addErrorLog(error, "xorEncryptDecrypt");
    return undefined;
  }
}
/**
   * 
   * @param {array<Object>} editConfigs
   * @param {MNNote} note 
   * @param {boolean} refresh 
   */
static applyEditByConfig(editConfigs,note,refresh = true){
    if (editConfigs.length > 0) {
      const editFunc = (editConfig)=>{
        if ("deleteNote" in editConfig && editConfig.deleteNote) {
          note.delete()
          //没有必要做其他编辑
          return true
        }
        if ("color" in editConfig) {
          note.color = editConfig.color
        }
        if ("excerptText" in editConfig) {
          note.excerptText = editConfig.excerptText
        }
        if ("excerptTextMarkdown" in editConfig) {
          note.excerptTextMarkdown = editConfig.excerptTextMarkdown
        }
        if ("title" in editConfig) {
          note.title = editConfig.title
        }
        if ("tags" in editConfig) {
          note.appendTags(editConfig.tags)
        }
        if ("markdownComment" in editConfig) {
          if ("markdownCommentIndex" in editConfig) {
            note.appendMarkdownComment(editConfig.markdownComment, editConfig.markdownCommentIndex)
          }else{
            note.appendMarkdownComment(editConfig.markdownComment)
          }
        }
        if ("tagsToRemove" in editConfig) {
          note.removeTags(editConfig.tagsToRemove)
        }
      }
      if (refresh) {
        MNUtil.undoGrouping(()=>{
          editConfigs.forEach(editConfig=>{
            editFunc(editConfig)
          })
        })
      }else{
        this.undoGroupingNotRefresh(()=>{
          editConfigs.forEach(editConfig=>{
            editFunc(editConfig)
          })
        })
      }
    }
    return true
  }
  static async _executeToolbarAction(actionDes,button = undefined) {
    await toolbarUtils.customActionByDes(actionDes,button,undefined,false)
    while ("onFinish" in actionDes) {
      let delay = actionDes.delay ?? 0.5
      actionDes = actionDes.onFinish
      await MNUtil.delay(delay)
      await toolbarUtils.customActionByDes(actionDes,button,undefined,false)
    }
  }
  static async readURL(url){
    try {
      let baseURL = "https://open.bigmodel.cn/api/paas/v4/reader"
      let apikey = "76ab4fa776ae4dfc97b91c07e73b0747.tcVmN7p0voHpb35C"
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer "+apikey,
        Accept: "application/json"
      }
        // copyJSON(headers)
      let body = {
        "url":url,
      }
      const request = chatAINetwork.initRequest(baseURL, {
          method: "POST",
          headers: headers,
          timeout: 60,
          json: body
        })
      let res = await chatAINetwork.sendRequest(request)
      chatAIUtils.log("readURL", res)
      return res
    } catch (error) {
      chatAIUtils.addErrorLog(error, "readURL")
      return undefined
    }
  }
}

class chatAIConfig {
  // 构造器方法，用于初始化新创建的对象
  constructor(name) {
    this.name = name;
  }
  // static defaultAction
  static isFirst = true
  static his = []
  static fileContent = {}
  static onSync = false
  static currentPrompt
  /** @type {Number[]} */
  static currentFunc
  /** @type {Number[]} */
  static currentAction
  /** @type {String} */
  static currentTitle
  /** @type {String} */
  static mainPath
  static action = []
  static previousConfig = {}
  static get defaultPrompts() {
    return  {
      Translate:                      {title: "翻译",context:"请翻译下面这段话：{{context}}"},
      Keyword:                        {title: "关键词",context:"请为下面这段话提取关键词：{{context}}"},
      Title:                          {title: "标题",context:"请为下面这段话生成标题：{{context}}"}
    }
  }
  static get defaultSystem() {
    return `## 系统角色与功能

你是一个智能学习助手，专为MarginNote应用环境设计，专注于辅助用户进行学习、研究和知识管理。

## 核心工具说明

{{!仅在knowledge不为空时显示}}
{{#knowledge}}
### Knowledge工具使用指南

**功能**：用于读取和写入额外的记忆信息

**使用场景**：
  - 当用户要求你记住某些信息时，使用此工具，method参数设置为\`appendKnowledge\`
  - 当用户要求整理记忆时：
  1. 认真回顾所有现有记忆内容
  2. 识别并去除冗余重复的部分
  3. 以最清晰、最简洁的表达重写记忆内容
{{/knowledge}}

## 当前环境信息

{{!仅在knowledge不为空时显示}}
{{#knowledge}}
### 额外记忆内容
{{knowledge}}
{{/knowledge}}

{{!仅在非视觉模式下显示}}
{{^visionMode}}
{{!仅在存在选择文档选区时显示}}
{{#currentSelection.onSelection}}
## 当前文档上选中的内容
{{currentSelection.asString}}
{{/currentSelection.onSelection}}
{{!仅在存在选中的笔记时显示}}
{{#hasFocusNote}}
### 选中的笔记/卡片信息
# 选中的笔记/卡片信息
{{cards}}
{{/hasFocusNote}}
{{/visionMode}}`
  }

  static get defaultConfig() {
    return {
    searchOrder: [2,1,3],
    sideBar: true,
    narrowMode: false,
    autoAction: false,
    onSelection: true,
    onSelectionImage: true,
    onNote: true,
    onNoteImage: true,
    onNewExcerpt: true,
    onNewExcerptImage: true,
    delay: 0,
    ignoreShortText: false,
    notifyLoc: 0,
    toolbar: true,
    model: "gpt-4o-mini",
    chatglmModel:"glm-4-plus",
    promptNames: Object.keys(this.defaultPrompts),//其实是promptId/promptKey
    currentPrompt: Object.keys(this.defaultPrompts)[0],
    apikey: "",
    modelOnReAsk: -1,
    syncDynamicModel:true,
    source: 'Built-in',
    url: "https://api.openai.com",
    openaiKey: "",
    tunnel:0,
    moonshotKey : "",
    moonshotModel : "moonshot-v1-8k",
    customKey : "",
    customModel : "",
    customUrl : "",
    customModelIndex : 0,
    claudeKey : "",
    claudeUrl : "https://api.anthropic.com",
    claudeModel : "claude-3-haiku-20240307",
    geminiKey : "",
    geminiUrl : 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    geminiModel : 0,
    miniMaxKey: "",
    miniMaxUrl: "https://api.minimaxi.com/v1/chat/completions",
    miniMaxModel: "abab6.5-chat",
    miniMaxGroup:"1827907340364431485",
    deepseekKey:"",
    deepseekUrl:"https://api.deepseek.com/chat/completions",
    deepseekModel:"deepseek-chat",
    qwenKey:"",
    qwenUrl:"https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    qwenModel:"qwen-long",
    siliconFlowKey:"",
    siliconFlowUrl:"https://api.siliconflow.cn/v1/chat/completions",
    siliconFlowModel:"deepseek-ai/DeepSeek-V3",
    volcengineKey:"",
    volcengineUrl:"https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    volcengineModel:"deepseek-v3-241226",
    modelScopeKey:"",
    modelScopeUrl:"https://api-inference.modelscope.cn/v1/chat/completions",
    modelScopeModel:"Qwen/Qwen3-Next-80B-A3B-Instruct",
    githubKey: "",
    githubUrl: "https://models.inference.ai.azure.com/chat/completions",
    githubModel: "gpt-4o",
    metasoKey:"",
    metasoUrl:"https://metaso.cn/api/v1/chat/completions",
    metasoModel:"fast",
    ppioKey:"",
    ppioUrl:"https://api.ppinfra.com/v3/openai/chat/completions",
    ppioModel:"deepseek/deepseek-v3/community",
    openRouterKey:"",
    openRouterUrl:"https://openrouter.ai/api/v1/chat/completions",
    openRouterModel:"qwen/qwen3-235b-a22b:free",
    qiniuKey:"",
    qiniuUrl:"https://openai.qiniu.com/v1/chat/completions",
    qiniuModel:"deepseek/deepseek-v3.1-terminus",
    glmCodingKey:"",
    glmCodingUrl:"https://open.bigmodel.cn/api/coding/paas/v4/chat/completions",
    glmCodingModel:"glm-4.6",
    kimiCodingKey:"",
    kimiCodingUrl:"https://api.kimi.com/coding/v1/chat/completions",
    kimiCodingModel:"kimi-for-coding",
    dynamic:true,
    dynamicFunc : [],
    dynamicModel : "Default",
    dynamicAction: [],
    dynamicTemp: 0.8,
    dynamicToolbarAction: "",
    dynamicHistory: [],
    colorConfig: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    imageColorConfig: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    simpleTexKey:"",
    autoExport:false,
    autoImport:false,
    autoImage:false,
    autoOCR:false,
    lastSyncTime:0,
    modifiedTime:0,
    speech:false,
    speechSpeed:1.0,
    autoSpeech:false,
    speechVoice:"male-qn-qingse",
    speechKey:"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLmnpfnq4vpo54iLCJVc2VyTmFtZSI6Iuael-eri-mjniIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxODI3OTA3MzQwMzY4NjI1Nzg5IiwiUGhvbmUiOiIxMzAxNTk5MjA4NSIsIkdyb3VwSUQiOiIxODI3OTA3MzQwMzY0NDMxNDg1IiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjQtMDktMDEgMTk6MzI6NTYiLCJpc3MiOiJtaW5pbWF4In0.Z7XNgcL2Y6qspWYJJMo0QinzWJp1C9-iTkeZk-2-ouqbkGvnmdh2xfIj-5jB-KMG4rqTjShExBifBlkUMMZgHeCVTmUyz6KNPKAzVvkfkMOjjbD7gElmFgO_0zHtL3pc8q6iAUGxrSmtBY1feIK9CpbQKzTI6xLYEU6d8keAv4zV14eey9L5UT5WwpNJ9vZG0367XuoOyGYnICfwIlSC5qg74NdtREq7t0vgh6NQ6BtWRWhdM-Q06rNPA5H5I8Km5RD8DmCm05aspkxMq_SsNyco9HrpEIKLSvBrLW7TVB4XG324fpUa-xdfvX_rFm7SRBy9sHbC7EtWhR6pUBSeEQ",
    imageCompression:true,
    syncSource:"None",
    syncNoteId: "",
    r2file:"",
    r2password:"",
    InfiFile:"",
    InfiPassword:"",
    webdavFile:"",
    webdavFolder:"",
    webdavUser:"",
    webdavPassword:"",
    subscriptionModel:"gpt-4o-mini",
    autoTheme:false,
    autoClear:false,
    autoClose:false,
    chatModel:"Default",
    chatFuncIndices:[],
    chatSystemPrompt:"",
    allowEdit:false,
    editorType:"markdown-ui",
    PDFExtractMode:"local",
    imageGenerationModel:"cogview-3-flash",
    webSearchModel:"search_std",
    customButton:{
      "button1":{
        "click":"bigbang",
        "longPress":"none",
        "autoClose":false
      },
      "button2":{
        "click":"addComment",
        "longPress":"addBlankComment",
        "autoClose":false
      },
      "button3":{
        "click":"setTitle",
        "longPress":"none",
        "autoClose":false
      },
      "button4":{
        "click":"copy",
        "longPress":"none",
        "autoClose":false
      },
      "button5":{
        "click":"setExcerpt",
        "longPress":"appendExcerpt",
        "autoClose":false
      },
      "button6":{
        "click":"addChildNote",
        "longPress":"markdown2Mindmap",
        "autoClose":false
      },
      "button7":{
        "click":"reAsk",
        "longPress":"reAskWithMenu",
        "autoClose":false
      },
      "button8":{
        "click":"openChat", 
        "longPress":"none",
        "autoClose":true
      }
    }
  }
  }

  static actionImages = {
    stopOutput:"stopImage",
    bigbang:"bigbangImage",
    addComment:"commentImage",
    setTitle:"titleImage",
    addTitle:"titleImage",
    copy:"copyImage",
    setExcerpt:"excerptImage",
    appendExcerpt:"excerptImage",
    addChildNote:"childImage",
    addBrotherNote:"brotherImage",
    markdown2Mindmap:"mindmapImage",
    addBlankComment:"commentImage",
    editMode:"editorImage",
    editModeSV:"editorSVImage",
    bindNote:"bindImage",
    openInEditor:"editorImage",
    snipaste:"snipasteImage",
    menu:"menuImage",
    searchInBrowser:"searchImage",
    reAsk:"reloadImage",
    reAskWithMenu:"reloadImage",
    openChat:"chatImage",
    none:"noneImage",
    switchLocation:"switchLocationImage",
    reply:"replyImage"
  }
  /**
   * 支持视觉的模型
   * @type {String[]}
   */
  static modelsWithVision = [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "glm-4.5v",
    "glm-4v-flash",
    "glm-4v-plus-0111",
    "glm-4.1v-thinking-flash",
    "glm-4.1v-thinking-flashx",
    "ZhipuAI/GLM-4.5V",
    "zai-org/glm-4.5v",
    "zai-org/GLM-4.5V",
    "Pro/THUDM/GLM-4.1V-9B-Thinking",
    "glm-4.5v-nothinking",
    "qwen3-vl-plus",
    "qwen3-omni-flash",
    "Qwen/Qwen3-VL-235B-A22B-Instruct",
    "qwen/qwen3-vl-235b-a22b-thinking",
    "qwen/qwen3-vl-235b-a22b-instruct",
    "doubao-seed-1-6-thinking-250715",
    "doubao-seed-1-6-thinking-250615",
    "doubao-seed-1-6-250615",
    "doubao-seed-1-6-flash-250715",
    "doubao-seed-1-6-flash-250615",
    "doubao-seed-1-6-vision-250815",
    "kimi-latest",
    "moonshot-v1-8k",
    "moonshot-v1-32k",
    "moonshot-v1-128k",
    "moonshot-v1-auto",
    "moonshot-v1-8k-vision-preview",
    "moonshot-v1-32k-vision-preview",
    "moonshot-v1-128k-vision-preview"
  ]
  /**
   * 不支持视觉的模型
   * @type {String[]}
   */
  static modelsWithoutVision = [
    "deepseek/deepseek-v3.1-terminus",
    "deepseek-v3-1-terminus",
    "deepseek/deepseek-v3.1",
    "deepseek/deepseek-r1-0528",
    "deepseek/deepseek-r1-turbo",
    "deepseek/deepseek-v3-0324",
    "deepseek/deepseek-v3-turbo",
    "deepseek/deepseek-v3/community",
    "deepseek/deepseek-r1/community",
    "deepseek/deepseek-prover-v2-671b",
    "deepseek-ai/DeepSeek-V3.1",
    "deepseek-ai/DeepSeek-R1",
    "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
    "deepseek-ai/DeepSeek-R1-Distill-Llama-8B",
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    "deepseek-ai/DeepSeek-V3",
    "deepseek-v3-1-250821",
    "deepseek-v3-250324",
    "deepseek-r1-250120",
    "deepseek-r1-250528",
    "DeepSeek-R1",
    "deepseek-v3.1",
    "deepseek-v3",
    "deepseek-r1",
    "deepseek-r1-0528",
    "deepseek-chat",
    "deepseek-reasoner",
    "zai-org/glm-4.5",
    "zai-org/GLM-4.5",
    "zai-org/GLM-4.5-Air",
    "glm-4.5",
    "glm-4.5-nothinking",
    "glm-4.5-x",
    "glm-4.5-x-nothinking",
    "glm-4.5-air",
    "glm-4.5-airx",
    "glm-4.5-flash",
    "glm-4-plus",
    "glm-4-air-250414",
    "glm-4-airx",
    "glm-4-long",
    "glm-4-flash",
    "glm-4-flash-250414",
    "glm-4-flashX",
    "glm-z1-air",
    "glm-z1-airx",
    "glm-z1-flash",
    "moonshotai/kimi-k2-instruct",
    "moonshotai/Kimi-K2-Instruct",
    "moonshotai/kimi-k2-thinking",
    "Moonshot-Kimi-K2-Instruct",
    "Pro/moonshotai/Kimi-K2-Instruct",
    "Pro/moonshotai/Kimi-K2-Instruct-0905",
    "moonshotai/Kimi-K2-Instruct-0905",
    "kimi-k2-0711-preview",
    "kimi-k2-0905-preview",
    "kimi-k2-turbo-preview",
    "kimi-k2-thinking",
    "kimi-k2-thinking-turbo",
    "qwen3",
    "qwen3-thinking",
    "qwen/qwen3-next-80b-a3b-thinking",
    "qwen/qwen3-next-80b-a3b-instruct",
    "qwen3-max",
    "qwen3-next",
    "qwen3-next-thinking",
    "Qwen/Qwen3-235B-A22B-Instruct-2507",
    "Qwen/Qwen3-235B-A22B",
    "qwen/qwen3-235b-a22b-thinking-2507",
    "qwen/qwen3-235b-a22b-instruct-2507",
    "qwen/qwen3-235b-a22b-fp8",
    "qwen/qwen3-coder-480b-a35b-instruct",
    "qwen/qwen3-30b-a3b-fp8",
    "qwen/qwen3-32b-fp8",
    "qwen/qwen3-8b-fp8",
    "qwen/qwen3-4b-fp8",
    "thudm/glm-4-32b-0414",
    "thudm/glm-4-9b-0414",
    "THUDM/GLM-Z1-32B-0414",
    "THUDM/GLM-4-32B-0414",
    "THUDM/GLM-Z1-9B-0414",
    "THUDM/GLM-4-9B-0414",
    "Pro/deepseek-ai/DeepSeek-V3.1",
    "Pro/deepseek-ai/DeepSeek-R1",
    "Pro/deepseek-ai/DeepSeek-R1-0120",
    "Pro/deepseek-ai/DeepSeek-V3",
    "Pro/deepseek-ai/DeepSeek-V3-1226",
    "minimax/minimax-m2",
    "MiniMaxAI/MiniMax-M2",
    "MiniMax-M2"
  ]
// 正则模式匹配（作为兜底 / 模糊匹配）
static modelsWithoutVisionPatterns = [
  // DeepSeek 系列（排除 v3.x 及其变种）
  /^deepseek\/deepseek-r1/i,
  /^deepseek-ai\/deepseek-r1/i,
  /^deepseek-(r1|v3)(?:-turbo)?$/i,
  /^deepseek-(r1|v3)(?:-[\d]{6})?$/i,         // deepseek-v3-250324 等
  /^pro\/deepseek-ai\/deepseek-(r1|v3)/i,
  // GLM-4 系列：所有不包含 -v 的 glm-4 开头模型都不支持视觉
  /^glm-4(?!.*-v)/i,                           // 匹配 glm-4.xxx 但不包含 -v
  /^glm-z1-/i,
  /^thudm\/glm-4/i,
  /^thudm\/glm-z1/i,
  // Kimi 系列
  /^moonshotai\/kimi-k2-instruct/i,
  /^kimi-k2-/i,
  // Qwen3 系列（纯文本模型）
  /^qwen3(-thinking)?$/i,
  /^qwen\/qwen3-/i,
  /^qwen3-next(-thinking)?$/i
];
  //直接返回UIImage
  static actionImage(action){
    if (action in this.actionImages) {
      return this[this.actionImages[action]]
    }
    if (action.startsWith("toolbar:")) {
      if (typeof toolbarConfig === "undefined") {
        return this.noneImage
      }
      let toolbarAction = action.split(":")[1]
      let image = toolbarConfig.imageConfigs[toolbarAction]
      let scale = image.scale
      let newImage = UIImage.imageWithCGImageScaleOrientation(image.CGImage,scale*1.1,0)
      return newImage
    }
    return this.defaultActionImage
  }
  static getUnusedKey(){
      let i = 0
      while (chatAIConfig.prompts["customEngine"+i]) {
        i = i+1
      }
      return ("customEngine"+i)
  }
  static getActionImages(){
  try {

    let config = this.getConfig("customButton")
    // MNUtil.log({message:"getActionImages",source:"MN ChatAI",detail:config})
    let actions = [
      config.button1.click,
      config.button2.click,
      config.button3.click,
      config.button4.click,
      config.button5.click,
      config.button6.click
    ]
    if (config.button7) {
      actions.push(config.button7.click)
    }else{
      actions.push("reAsk")
    }
    if (config.button8) {
      actions.push(config.button8.click)
    }else{
      actions.push("openChat")
    }
    return actions.map(action=>{
      return this.actionImage(action)
    })
    
  } catch (error) {
    chatAIUtils.addErrorLog(error, "utils.getActionImages")
    return undefined
  }
  }
  static appendDynamicHistory(prompt){
    let dynamicHistory = this.getConfig("dynamicHistory")
    if(dynamicHistory.includes(prompt)){
      //remove the prompt
      dynamicHistory = dynamicHistory.filter(h=>h !== prompt)
    }
    dynamicHistory.unshift(prompt)
    dynamicHistory = dynamicHistory.slice(0,20)
    this.config.dynamicHistory = dynamicHistory
    this.save("MNChatglm_config")
  }
  static getLatestHistory(){
    let dynamicHistory = this.getConfig("dynamicHistory")
    return dynamicHistory[0]
  }
  static defaultModelConfig = {
    "modelRouter":{
      "Volcengine":{
        "doubao-seed-code":{
          "model":"doubao-seed-code-preview-251028",
        },
        "doubao-seed-code-nothinking":{
          "model":"doubao-seed-code-preview-251028",
          "extraBody":{"thinking":{"type":"disabled"}},
        },
        "doubao-seed-1-6":{
          "model":"doubao-seed-1-6-251015",
        },
        "doubao-seed-1-6-nothinking":{
          "model":"doubao-seed-1-6-251015",
          "extraBody":{"reasoning_effort":"minimal"},
        },
        "doubao-seed-1-6-minimal":{
          "model":"doubao-seed-1-6-251015",
          "extraBody":{"reasoning_effort":"minimal"},
        },
        "doubao-seed-1-6-low":{
          "model":"doubao-seed-1-6-251015",
          "extraBody":{"reasoning_effort":"low"},
        },
        "doubao-seed-1-6-medium":{
          "model":"doubao-seed-1-6-251015",
          "extraBody":{"reasoning_effort":"medium"},
        },
        "doubao-seed-1-6-high":{
          "model":"doubao-seed-1-6-251015",
          "extraBody":{"reasoning_effort":"high"},
        },
        "doubao-seed-1-6-thinking":{
          "model":"doubao-seed-1-6-thinking-250715",
        },
        "doubao-seed-1-6-lite":{
          "model":"doubao-seed-1-6-lite-251015",
        },
        "doubao-seed-1-6-lite-nothinking":{
          "model":"doubao-seed-1-6-lite-251015",
          "extraBody":{"reasoning_effort":"minimal"},
        },
        "doubao-seed-1-6-lite-minimal":{
          "model":"doubao-seed-1-6-lite-251015",
          "extraBody":{"reasoning_effort":"minimal"},
        },
        "doubao-seed-1-6-lite-low":{
          "model":"doubao-seed-1-6-lite-251015",
          "extraBody":{"reasoning_effort":"low"},
        },
        "doubao-seed-1-6-lite-medium":{
          "model":"doubao-seed-1-6-lite-251015",
          "extraBody":{"reasoning_effort":"medium"},
        },
        "doubao-seed-1-6-lite-high":{
          "model":"doubao-seed-1-6-lite-251015",
          "extraBody":{"reasoning_effort":"high"},
        },
        "doubao-seed-1-6-flash":{
          "model":"doubao-seed-1-6-flash-250828",
        },
        "doubao-seed-1-6-flash-nothinking":{
          "model":"doubao-seed-1-6-flash-250828",
          "extraBody":{"thinking":{"type":"disabled"}},
        },
        "doubao-seed-1-6-vision":{
          "model":"doubao-seed-1-6-vision-250815",
        },
        "doubao-seed-1-6-vision-nothinking":{
          "model":"doubao-seed-1-6-vision-250815",
          "extraBody":{"thinking":{"type":"disabled"}},
        }
      },
      "ChatGLM":{
        "glm-4.6-nothinking":{
          "model":"glm-4.6",
          "extraBody":{"thinking":{"type":"disabled"},"tool_stream":true},
        },
        "glm-4.6":{
          "model":"glm-4.6",
          "extraBody":{"tool_stream":true},
        },
        "glm-4.5-nothinking":{
          "model":"glm-4.5",
          "extraBody":{"thinking":{"type":"disabled"}},
        },
        "glm-4.5v-nothinking":{
          "model":"glm-4.5v",
          "extraBody":{"thinking":{"type":"disabled"}},
        },
        "glm-4.5-x-nothinking":{
          "model":"glm-4.5-x",
          "extraBody":{"thinking":{"type":"disabled"}},
        },
        "glm-4.5-air-nothinking":{
          "model":"glm-4.5-air",
          "extraBody":{"thinking":{"type":"disabled"}},
        },
        "glm-4.5-airx-nothinking":{
          "model":"glm-4.5-airx",
          "extraBody":{"thinking":{"type":"disabled"}},
        },
        "glm-4.5-flash-nothinking":{
          "model":"glm-4.5-flash",
          "extraBody":{"thinking":{"type":"disabled"}},
        }
      },
      "KimiCoding":{
        "kimi-for-coding-thinking":{
          "model":"kimi-for-coding",
          "extraBody":{"reasoning_effort":"medium"},
        },
        "kimi-for-coding-medium":{
          "model":"kimi-for-coding",
          "extraBody":{"reasoning_effort":"medium"},
        },
        "kimi-for-coding-high":{
          "model":"kimi-for-coding",
          "extraBody":{"reasoning_effort":"high"},
        },
        "kimi-for-coding-low":{
          "model":"kimi-for-coding",
          "extraBody":{"reasoning_effort":"low"},
        }
      },
      "Gemini":{
        "gemini-3-pro-minimal":{
          "model":"gemini-3-pro-preview",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":128,"include_thoughts":true}}},
        },
        "gemini-2.5-pro-minimal":{
          "model":"gemini-2.5-pro",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":128,"include_thoughts":true}}},
        },
        "gemini-2.5-pro-low":{
          "model":"gemini-2.5-pro",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":1024,"include_thoughts":true}}},
        },
        "gemini-2.5-pro-medium":{
          "model":"gemini-2.5-pro",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":8192,"include_thoughts":true}}},
        },
        "gemini-2.5-pro-high":{
          "model":"gemini-2.5-pro",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":24576,"include_thoughts":true}}},
        },
        "gemini-2.5-flash-nothinking":{
          "model":"gemini-2.5-flash",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":0,"include_thoughts":true}}},
        },
        "gemini-2.5-flash-low":{
          "model":"gemini-2.5-flash",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":1024,"include_thoughts":true}}},
        },
        "gemini-2.5-flash-medium":{
          "model":"gemini-2.5-flash",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":8192,"include_thoughts":true}}},
        },
        "gemini-2.5-flash-high":{
          "model":"gemini-2.5-flash",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":24576,"include_thoughts":true}}},
        },
        "gemini-2.5-flash-lite-nothinking":{
          "model":"gemini-2.5-flash-lite",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":0,"include_thoughts":true}}},
        },
        "gemini-2.5-flash-lite-low":{
          "model":"gemini-2.5-flash-lite",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":1024,"include_thoughts":true}}},
        },
        "gemini-2.5-flash-lite-medium":{
          "model":"gemini-2.5-flash-lite",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":8192,"include_thoughts":true}}},
        },
        "gemini-2.5-flash-lite-high":{
          "model":"gemini-2.5-flash-lite",
          "extraBody":{"google":{"thinking_config":{"thinking_budget":24576,"include_thoughts":true}}},
        }
      }
    },
    "OpenRouter":[
        "deepseek/deepseek-chat-v3.1:free",
        "deepseek/deepseek-chat-v3-0324:free",
        "deepseek/deepseek-r1:free",
        "deepseek/deepseek-v3.2-exp",
        "deepseek/deepseek-v3.1-terminus",
        "z-ai/glm-4.5-air:free",
        "z-ai/glm-4.5-air",
        "z-ai/glm-4.6",
        "z-ai/glm-4.5",
        "z-ai/glm-4.5v",
        "z-ai/glm-4-32b",
        "thudm/glm-4.1v-9b-thinking",
        "thudm/glm-z1-32b",
        "qwen/qwen3-8b:free",
        "qwen/qwen3-8b",
        "qwen/qwen3-14b:free",
        "qwen/qwen3-14b",
        "qwen/qwen3-32b",
        "qwen/qwen3-30b-a3b:free",
        "qwen/qwen3-30b-a3b",
        "qwen/qwen3-30b-a3b-instruct-2507",
        "qwen/qwen3-30b-a3b-thinking-2507",
        "qwen/qwen3-235b-a22b:free",
        "qwen/qwen3-235b-a22b",
        "qwen/qwen3-235b-a22b-2507",
        "qwen/qwen3-235b-a22b-thinking-2507",
        "qwen/qwen3-coder:free",
        "qwen/qwen3-vl-8b-thinking",
        "qwen/qwen3-vl-8b-instruct",
        "qwen/qwen3-vl-30b-a3b-instruct",
        "qwen/qwen3-vl-30b-a3b-thinking",
        "qwen/qwen3-vl-235b-a22b-instruct",
        "qwen/qwen3-vl-235b-a22b-thinking",
        "qwen/qwen3-max",
        "qwen/qwen3-coder-plus",
        "qwen/qwen3-next-80b-a3b-instruct",
        "qwen/qwen3-next-80b-a3b-thinking",
        "moonshotai/kimi-k2:free",
        "moonshotai/kimi-dev-72b:free",
        "moonshotai/kimi-k2-0905",
        "openai/gpt-oss-20b:free",
        "openai/gpt-oss-20b",
        "openai/gpt-oss-120b",
        "openai/gpt-5",
        "openai/gpt-5-pro",
        "openai/gpt-5-chat",
        "openai/gpt-5-codex",
        "openai/gpt-4.1",
        "openai/gpt-4.1-mini",
        "openai/gpt-4.1-nano",
        "openai/o3-deep-research",
        "openai/o4-mini-deep-research",
        "openai/o4-mini-high",
        "openai/o4-mini",
        "openai/gpt-5-mini",
        "openai/gpt-5-nano",
        "openai/o3-pro",
        "openai/o3",
        "openai/o3-mini",
        "openai/o3-mini-high",
        "google/gemini-2.0-flash-exp:free",
        "google/gemini-2.0-flash-lite-001",
        "google/gemini-2.5-pro",
        "google/gemini-2.5-pro-preview",
        "google/gemini-2.5-flash-preview-09-2025",
        "google/gemini-2.5-flash",
        "google/gemini-2.5-flash-image",
        "google/gemini-2.5-flash-image-preview",
        "google/gemini-2.5-flash-lite",
        "google/gemini-2.5-flash-lite-preview-09-2025",
        "anthropic/claude-3.7-sonnet",
        "anthropic/claude-3.7-sonnet:thinking",
        "anthropic/claude-haiku-4.5",
        "anthropic/claude-sonnet-4.5",
        "anthropic/claude-opus-4.1",
        "anthropic/claude-opus-4",
        "anthropic/claude-sonnet-4",
        "x-ai/grok-4",
        "x-ai/grok-4-fast",
        "x-ai/grok-code-fast-1",
        "x-ai/grok-3-mini",
        "x-ai/grok-3",
        "inclusionai/ring-1t",
        "inclusionai/ling-1t",
        "baidu/ernie-4.5-21b-a3b-thinking",
        "meituan/longcat-flash-chat:free",
        "meituan/longcat-flash-chat",
        "minimax/minimax-m2:free",
        "minimax/minimax-m1"
  ],
  "Qiniu":[
      "deepseek-v3",
      "deepseek-v3-0324",
      "deepseek-r1",
      "deepseek-r1-0528",
      "deepseek/deepseek-v3.1-terminus",
      "deepseek/deepseek-v3.1-terminus-thinking",
      "deepseek/deepseek-v3.2-exp",
      "deepseek/deepseek-v3.2-exp-thinking",
      "doubao-seed-1.6",
      "doubao-seed-1.6-flash",
      "doubao-seed-1.6-thinking",
      "qwen3-32b",
      "qwen3-32b-think",
      "qwen3-30b-a3b",
      "qwen3-235b-a22b",
      "qwen3-235b-a22b-instruct-2507",
      "qwen3-235b-a22b-thinking-2507",
      "qwen3-max",
      "qwen3-max-preview",
      "qwen3-next-80b-a3b-instruct",
      "qwen3-next-80b-a3b-thinking",
      "qwen3-coder-480b-a35b-instruct",
      "MiniMax-M1",
      "minimax/minimax-m2",
      "z-ai/glm-4.6",
      "glm-4.5",
      "glm-4.5-air",
      "kimi-k2",
      "moonshotai/kimi-k2-thinking",
      "openai/gpt-5",
      "gpt-oss-20b",
      "gpt-oss-120b",
      "x-ai/grok-4-fast",
      "x-ai/grok-code-fast-1",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "claude-3.5-haiku",
      "claude-3.5-sonnet",
      "claude-3.7-sonnet",
      "claude-4.0-opus",
      "claude-4.0-sonnet",
      "claude-4.1-opus",
      "claude-4.5-haiku",
      "claude-4.5-sonnet"
  ],
  "PPIO": [
    "minimax/minimax-m2",
    "minimaxai/minimax-m1-80k",
    "deepseek/deepseek-v3.2-exp",
    "deepseek/deepseek-v3.1-terminus",
    "deepseek/deepseek-v3.1",
    "deepseek/deepseek-r1-0528",
    "deepseek/deepseek-r1-turbo",
    "deepseek/deepseek-v3-0324",
    "deepseek/deepseek-v3-turbo",
    "deepseek/deepseek-v3/community",
    "deepseek/deepseek-r1/community",
    "deepseek/deepseek-prover-v2-671b",
    "moonshotai/kimi-k2-instruct",
    "moonshotai/kimi-k2-0905",
    "moonshotai/kimi-k2-thinking",
    "baidu/ernie-4.5-vl-424b-a47b",
    "baidu/ernie-4.5-300b-a47b-paddle",
    "zai-org/glm-4.6",
    "zai-org/glm-4.5",
    "zai-org/glm-4.5v",
    "qwen/qwen3-vl-235b-a22b-thinking",
    "qwen/qwen3-vl-235b-a22b-instruct",
    "qwen/qwen3-next-80b-a3b-instruct",
    "qwen/qwen3-next-80b-a3b-thinking",
    "qwen/qwen3-235b-a22b-thinking-2507",
    "qwen/qwen3-235b-a22b-instruct-2507",
    "qwen/qwen3-235b-a22b-fp8",
    "qwen/qwen3-coder-480b-a35b-instruct",
    "qwen/qwen3-30b-a3b-fp8",
    "qwen/qwen3-32b-fp8",
    "qwen/qwen3-8b-fp8",
    "qwen/qwen3-4b-fp8",
    "thudm/glm-4-32b-0414",
    "thudm/glm-4-9b-0414",
    "thudm/glm-4.1v-9b-thinking"
  ],
  "SiliconFlow": [
    "Pro/deepseek-ai/DeepSeek-V3.2-Exp",
    "Pro/deepseek-ai/DeepSeek-V3.1-Terminus",
    "Pro/deepseek-ai/DeepSeek-R1",
    "Pro/deepseek-ai/DeepSeek-V3",
    "Pro/moonshotai/Kimi-K2-Instruct-0905",
    "Pro/THUDM/GLM-4.1V-9B-Thinking",
    "zai-org/GLM-4.6",
    "zai-org/GLM-4.5",
    "zai-org/GLM-4.5V",
    "zai-org/GLM-4.5-Air",
    "deepseek-ai/DeepSeek-V3.2-Exp",
    "deepseek-ai/DeepSeek-V3.1-Terminus",
    "deepseek-ai/DeepSeek-R1",
    "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
    "deepseek-ai/DeepSeek-V3",
    "deepseek-ai/DeepSeek-V2.5",
    "deepseek-ai/deepseek-vl2",
    "stepfun-ai/step3",
    "moonshotai/Kimi-K2-Instruct-0905",
    "moonshotai/Kimi-Dev-72B",
    "MiniMaxAI/MiniMax-M2",
    "MiniMaxAI/MiniMax-M1-80k",
    "Tongyi-Zhiwen/QwenLong-L1-32B",
    "Qwen/Qwen3-VL-8B-Instruct",
    "Qwen/Qwen3-VL-8B-Thinking",
    "Qwen/Qwen3-VL-32B-Instruct",
    "Qwen/Qwen3-VL-32B-Thinking",
    "Qwen/Qwen3-VL-30B-A3B-Instruct",
    "Qwen/Qwen3-VL-30B-A3B-Thinking",
    "Qwen/Qwen3-VL-235B-A22B-Instruct",
    "Qwen/Qwen3-VL-235B-A22B-Thinking",
    "Qwen/Qwen3-Omni-30B-A3B-Instruct",
    "Qwen/Qwen3-Omni-30B-A3B-Thinking",
    "Qwen/Qwen3-Next-80B-A3B-Instruct",
    "Qwen/Qwen3-Next-80B-A3B-Thinking",
    "Qwen/Qwen3-235B-A22B-Instruct-2507",
    "Qwen/Qwen3-235B-A22B",
    "Qwen/Qwen3-30B-A3B",
    "Qwen/Qwen3-30B-A3B-Instruct-2507",
    "Qwen/Qwen3-30B-A3B-Thinking-2507",
    "Qwen/Qwen3-32B",
    "Qwen/Qwen3-14B",
    "Qwen/Qwen3-8B",
    "THUDM/GLM-Z1-32B-0414",
    "THUDM/GLM-4-32B-0414",
    "THUDM/GLM-Z1-9B-0414",
    "THUDM/GLM-4-9B-0414",
    "THUDM/GLM-4.1V-9B-Thinking",
    "baidu/ERNIE-4.5-300B-A47B"
  ],
  "Gemini": [
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-pro-minimal",
    "gemini-2.5-pro-low",
    "gemini-2.5-pro-medium",
    "gemini-2.5-pro-high",
    "gemini-2.5-flash-nothinking",
    "gemini-2.5-flash-low",
    "gemini-2.5-flash-medium",
    "gemini-2.5-flash-high",
    "gemini-2.5-flash-lite-nothinking",
    "gemini-2.5-flash-lite-low",
    "gemini-2.5-flash-lite-medium",
    "gemini-2.5-flash-lite-high"
  ],
  "Volcengine": [
    "doubao-seed-1-6-thinking-250715",
    "doubao-seed-1-6-thinking-250615",
    "doubao-seed-1-6-251015",
    "doubao-seed-1-6-250615",
    "doubao-seed-1-6-lite-251015",
    "doubao-seed-1-6-flash-250828",
    "doubao-seed-1-6-flash-250715",
    "doubao-seed-1-6-flash-250615",
    "doubao-seed-1-6-vision-250815",
    "deepseek-v3-1-terminus",
    "deepseek-v3-1-250821",
    "deepseek-v3-250324",
    "deepseek-r1-250120",
    "deepseek-r1-250528",
    "kimi-k2-250905",
    "doubao-seed-1-6",
    "doubao-seed-1-6-thinking",
    "doubao-seed-1-6-nothinking",
    "doubao-seed-1-6-low",
    "doubao-seed-1-6-medium",
    "doubao-seed-1-6-high",
    "doubao-seed-1-6-lite",
    "doubao-seed-1-6-lite-nothinking",
    "doubao-seed-1-6-lite-low",
    "doubao-seed-1-6-lite-medium",
    "doubao-seed-1-6-lite-high",
    "doubao-seed-1-6-flash",
    "doubao-seed-1-6-flash-nothinking",
    "doubao-seed-1-6-vision",
    "doubao-seed-1-6-vision-nothinking"
  ],
  "Github": [
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "gpt-4o",
    "gpt-4o-mini",
    "DeepSeek-R1",
    "Llama-3.3-70B-Instruct"
  ],
  "Metaso":["fast","fast_thinking","ds-r1"],
  "Qwen": [
    "qwen3-vl-plus",
    "qwen3-omni-flash",
    "qwen3-next-80b-a3b-instruct",
    "qwen3-next-80b-a3b-thinking",
    "qwen3-max",
    "qwen3-235b-a22b-instruct-2507",
    "qwen3-235b-a22b-thinking-2507",
    "qwen3-235b-a22b",
    "qwq-plus",
    "qwq-32b",
    "qvq-72b-preview",
    "qwen-omni-turbo",
    "qwen-long",
    "qwen-turbo",
    "qwen-plus",
    "qwen-max",
    "qwen-max-longcontext",
    "qwen-max-latest",
    "qwen-flash",
    "qwen3-coder-plus",
    "qwen3-coder-flash",
    "qwen-vl-max",
    "qwen-vl-plus",
    "deepseek-v3.1",
    "deepseek-v3",
    "deepseek-r1",
    "deepseek-r1-0528",
    "Moonshot-Kimi-K2-Instruct",
    "glm-4.5",
    "glm-4.5-air"
  ],
  "ChatGPT": [
    "gpt-5-chat-latest",
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "o3",
    "o3-pro",
    "o4-mini",
    "gpt-4o-mini",
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-4.5-preview",
    "gpt-4.1",
    "gpt-4.1-2025-04-14",
    "gpt-4.1-mini",
    "gpt-4.1-mini-2025-04-14",
    "gpt-4.1-nano",
    "gpt-4.1-nano-2025-04-14"
  ],
  "Deepseek": [
    "deepseek-chat",
    "deepseek-reasoner"
  ],
  "Minimax": [
    "MiniMax-M2",
    "MiniMax-M1",
    "MiniMax-Text-01"
  ],
  "GLMCoding": [
    "glm-4.6",
    "glm-4.5",
    "glm-4.5v",
    "glm-4.5-air",
    "glm-4.5-x",
    "glm-4.5-airx",
    "glm-4.5-flash",
    "glm-4-plus",
    "glm-4v-plus-0111",
    "glm-4-air-250414",
    "glm-4-airx",
    "glm-4-long",
    "glm-4-flash",
    "glm-4-flash-250414",
    "glm-4-flashX",
    "glm-4v-flash",
    "glm-4.1v-thinking-flash",
    "glm-4.1v-thinking-flashx",
    "glm-z1-air",
    "glm-z1-airx",
    "glm-z1-flash"
  ],
  "ChatGLM": [
    "glm-4.6",
    "glm-4.5",
    "glm-4.5v",
    "glm-4.5-air",
    "glm-4.5-x",
    "glm-4.5-airx",
    "glm-4.5-flash",
    "glm-4-plus",
    "glm-4v-plus-0111",
    "glm-4-air-250414",
    "glm-4-airx",
    "glm-4-long",
    "glm-4-flash",
    "glm-4-flash-250414",
    "glm-4-flashX",
    "glm-4v-flash",
    "glm-4.1v-thinking-flash",
    "glm-4.1v-thinking-flashx",
    "glm-z1-air",
    "glm-z1-airx",
    "glm-z1-flash",
    "glm-4.6-nothinking",
    "glm-4.5-nothinking",
    "glm-4.5v-nothinking",
    "glm-4.5-x-nothinking",
    "glm-4.5-airx-nothinking",
    "glm-4.5-air-nothinking",
    "glm-4.5-flash-nothinking"
  ],
  "Claude": [
    "claude-3-haiku-20240307",
    "claude-3-sonnet-20240229",
    "claude-3-opus-20240229",
    "claude-3-5-sonnet-20240620",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-7-sonnet-20250219",
    "claude-3-7-sonnet-20250219-thinking",
    "claude-sonnet-4-20250514",
    "claude-sonnet-4-5-20250929",
    "claude-opus-4-20250514",
    "claude-opus-4-1"
  ],
  "ModelScope":[
      "MiniMax/MiniMax-M2",
      "moonshotai/Kimi-K2-Instruct-0905",
      "deepseek-ai/DeepSeek-V3.1",
      "meituan-longcat/LongCat-Flash-Chat",
      "ZhipuAI/GLM-4.6",
      "ZhipuAI/GLM-4.5",
      "ByteDance-Seed/Seed-OSS-36B-Instruct",
      "openai-mirror/gpt-oss-120b",
      "Qwen/Qwen3-VL-8B-Instruct",
      "Qwen/Qwen3-VL-30B-A3B-Instruct",
      "Qwen/Qwen3-VL-235B-A22B-Instruct",
      "Qwen/Qwen3-Next-80B-A3B-Instruct",
      "Qwen/Qwen3-Next-80B-A3B-Thinking",
      "Qwen/Qwen3-Coder-480B-A35B-Instruct",
      "Qwen/Qwen3-32B",
      "Qwen/Qwen3-235B-A22B-Thinking-2507",
      "Qwen/Qwen3-235B-A22B-Instruct-2507",
      "PaddlePaddle/ERNIE-4.5-21B-A3B-Thinking"
    ],
  "KimiChat": [
    "kimi-latest",
    "kimi-k2-0905-preview",
    "kimi-k2-0711-preview",
    "kimi-k2-turbo-preview",
    "kimi-k2-thinking",
    "kimi-k2-thinking-turbo",
    "moonshot-v1-8k",
    "moonshot-v1-32k",
    "moonshot-v1-128k",
    "moonshot-v1-auto",
    "moonshot-v1-8k-vision-preview",
    "moonshot-v1-32k-vision-preview",
    "moonshot-v1-128k-vision-preview"
  ],
  "KimiCoding":[
    "kimi-for-coding",
    "kimi-for-coding-thinking"
  ],
  "Subscription": [
    "gpt-5-chat-latest",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "o3",
    "o4-mini",
    "claude-haiku-4-5",
    "claude-sonnet-4",
    "claude-sonnet-4-5",
    "claude-opus-4",
    "claude-opus-4-1",
    "glm-4.6",
    "glm-4.6-nothinking",
    "glm-4.5v",
    "glm-4.5v-nothinking",
    "glm-4.5-x",
    "glm-4.5-x-nothinking",
    "glm-4.5-air",
    "glm-4.5-airx",
    "doubao-seed-1-6-thinking",
    "doubao-seed-1-6-nothinking",
    "doubao-seed-1-6",
    "doubao-seed-1-6-lite",
    "doubao-seed-1-6-lite-nothinking",
    "doubao-seed-1-6-flash",
    "MiniMax-M2",
    "MiniMax-Text-01",
    "qwen3-max",
    "qwen3",
    "qwen3-thinking",
    "qwen3-next",
    "qwen3-next-thinking",
    "qwen3-omni",
    "kimi-k2",
    "gemini-2.0-flash",
    "gemini-2.0-flash-thinking",
    "gemini-2.5-flash",
    "gemini-2.5-flash-thinking",
    "gemini-2.5-flash-nothinking",
    "gemini-2.5-pro",
    "gemini-2.5-pro-minimal",
    "deepseek-chat",
    "deepseek-reasoner"
  ]
  }
  static getModelsFromSource(source){
    if (this.modelConfig && source in this.modelConfig){
      return this.modelConfig[source]
    }
    if (source in this.defaultModelConfig) {
      return this.defaultModelConfig[source]
    }
    return []
  }
  static getModelRouter(source){
    let modelRouter = this.getModelsFromSource("modelRouter")
    // chatAIUtils.log("modelRouter",modelRouter)
    if (modelRouter && source in modelRouter){
      return modelRouter[source]
    }
    return undefined
  }
  static defaultDynamicPrompt = {
    "note":this.defaultSystem,
    "text":this.defaultSystem
  }
  /**
   * @type {string}
   */
  static knowledge
  static init(mainPath){
  try {

    if (mainPath) {
      this.mainPath = mainPath
    }
    this.checkDataDir()
    this.dataFolder = subscriptionUtils.extensionPath+"/data"
    this.backUpFile = subscriptionUtils.extensionPath+"/data/MNChatAI_totalConfig.json"
    this.default_usage = {limit:100,day:chatAIUtils.getToday(),usage:0}
    if (!this.isLocalConfigExists("MNChatglm_config") && this.isBackUpConfigExists()) {//不存在本地配置，但存在备份配置
      let config = MNUtil.readJSON(this.backUpFile)
      MNUtil.log("chatAIConfig.readFromBackupFile")
      this.importConfig(config)
      this.modelConfig = this.getByDefault("MNChatglm_modelConfig", this.defaultModelConfig)
      this.keys = this.getByDefault('MNChatglm_builtInKeys', {})
    }else{
      this.config = this.getByDefault('MNChatglm_config',this.defaultConfig)
      this.prompts = this.getByDefault('MNChatglm_prompts', this.defaultPrompts)
      // MNUtil.copyJSON(this.prompts)
      this.knowledge = this.getByDefault('MNChatglm_knowledge',"")
      this.keys = this.getByDefault('MNChatglm_builtInKeys', {})
      // this.keys = {}
      this.fileId = this.getByDefault("MNChatglm_fileId", {})
      this.usage = this.getByDefault('MNChatglm_usage',this.default_usage)
      this.dynamicPrompt = this.getByDefault("MNChatglm_dynamicPrompt", this.defaultDynamicPrompt)
      this.modelConfig = this.getByDefault("MNChatglm_modelConfig", this.defaultModelConfig)
    }
    this.config.editorType = "vditor"
    this.currentPrompt = this.getConfig("currentPrompt")
    // MNUtil.copyJSON({prompts:this.prompts,config:this.config})
    let currentPrompt = this.prompts[this.currentPrompt]
    if (!currentPrompt) {
      let promptNames = Object.keys(this.prompts)
      this.currentPrompt = promptNames[0]
    }
    // this.currentFunc = this.prompts[this.currentPrompt].func ?? []
    // this.currentAction = this.prompts[this.currentPrompt].action ?? []
    // this.currentModel = this.prompts[this.currentPrompt].model ?? "Default"
    // this.currentTitle = this.prompts[this.currentPrompt].title
    this.setCurrentPrompt(this.currentPrompt,false)
    this.defaultModel = this.getDefaultModel()
    this.highlightColor = UIColor.blendedColor(
      UIColor.colorWithHexString("#2c4d81").colorWithAlphaComponent(0.8),
      chatAIUtils.app.defaultTextColor,
      0.8
    );
    let delay = this.getConfig("delay")
    if (delay == undefined) {
      this.config.delay = 0
    }
    let ignoreShortText = this.getConfig("ignoreShortText")
    if (ignoreShortText == undefined) {
      this.config.ignoreShortText = false
    }
    chatAITool.initTools()

    // MNUtil.copy(this.config.r2password)
    // /**
    //  * @type {chatglmController}
    //  */
    // let ctr = this
    // MNUtil.showHUD("message")
    this.reloadImage = MNUtil.getImage(this.mainPath + `/reload.png`)
    this.stopImage = MNUtil.getImage(this.mainPath + `/stop.png`)
    this.closeImage = MNUtil.getImage(this.mainPath + `/close.png`)
    this.bigbangImage = MNUtil.getImage(this.mainPath + `/bigbang.png`)
    this.copyImage = MNUtil.getImage(this.mainPath + `/copy.png`)
    this.titleImage = MNUtil.getImage(this.mainPath + `/title.png`)
    this.tagImage = MNUtil.getImage(this.mainPath + `/tag.png`)
    this.commentImage = MNUtil.getImage(this.mainPath + `/comment.png`)
    this.aiImage = MNUtil.getImage(this.mainPath + `/ai.png`, 3)
    this.aiLinkImage = MNUtil.getImage(this.mainPath + `/aiLink.png`)
    this.chatImage = MNUtil.getImage(this.mainPath + `/chat.png`)
    this.sendImage = MNUtil.getImage(this.mainPath + `/send.png`)
    this.lockImage = MNUtil.getImage(this.mainPath + `/lock.png`)
    this.unlockImage = MNUtil.getImage(this.mainPath + `/unlock.png`)
    this.excerptImage = MNUtil.getImage(this.mainPath + `/excerpt.png`,2.3)
    this.childImage = MNUtil.getImage(this.mainPath + `/childNote.png`)
    this.brotherImage = MNUtil.getImage(this.mainPath + `/brotherNote.png`)
    this.quoteImage = MNUtil.getImage(this.mainPath + `/quote.png`)
    this.clearImage = MNUtil.getImage(this.mainPath + `/eraser.png`)
    this.mindmapImage = MNUtil.getImage(this.mainPath + `/mindmap.png`)
    this.editorImage = MNUtil.getImage(this.mainPath + `/edit.png`,2.2)
    this.editorSVImage = MNUtil.getImage(this.mainPath + `/sv.png`,2.2)
    this.defaultActionImage = MNUtil.getImage(this.mainPath + `/action.png`)
    this.snipasteImage = MNUtil.getImage(this.mainPath + `/snipaste.png`)
    this.menuImage = MNUtil.getImage(this.mainPath + `/menu.png`)
    this.searchImage = MNUtil.getImage(this.mainPath + `/search.png`)
    this.noneImage = MNUtil.getImage(this.mainPath + `/none.png`)
    this.settingImage = MNUtil.getImage(this.mainPath + `/setting.png`)
    this.visionImage = MNUtil.getImage(this.mainPath + `/vision.png`,1.5)
    this.switchLocationImage = MNUtil.getImage(this.mainPath + `/switch.png`),
    this.replyImage = MNUtil.getImage(this.mainPath + `/reply.png`)
    this.aiFreeImage = MNUtil.getImage(this.mainPath + `/aiFree.png`)
    this.aiBindImage = MNUtil.getImage(this.mainPath + `/aiBind.png`)
    this.bindImage = MNUtil.getImage(this.mainPath + `/bind.png`)
    this.historyImage = MNUtil.getImage(this.mainPath + `/history.png`)
    
  } catch (error) {
    chatAIUtils.addErrorLog(error, "chatAIConfig.init")
  }
  }
  /**
   * 
   * @param {string} key 
   * @returns {{title:string,context:string,system:string,model:string,vision:boolean,func:string[]}}
   */
  static getPromptByKey(key){
    return this.prompts[key]
  }
  static isLocalConfigExists(key){
    let value = NSUserDefaults.standardUserDefaults().objectForKey(key)
    if (value && Object.keys(value).length > 0) {
      return true
    }
    return false
  }
  static isBackUpConfigExists(){
    if (MNUtil.isfileExists(this.backUpFile)) {
      let backupConfig = MNUtil.readJSON(this.backUpFile)
      if (backupConfig && Object.keys(backupConfig).length > 0) {
        return true
      }
    }
    return false
  }
  
  static checkDataDir(){
    if (MNUtil.initialized) {
      return
    }
    let extensionPath = subscriptionUtils.extensionPath
    if (extensionPath) {
      let dataPath = extensionPath+"/data"
      if (MNUtil.isfileExists(dataPath)) {
        return
      }
      MNUtil.createFolderDev(dataPath)
      // NSFileManager.defaultManager().createDirectoryAtPathAttributes(dataPath, undefined)
    }
  }
  static backUp(){
    chatAIUtils.log("chatAIConfig.backUp")
    let totalConfig = this.getAllConfig()
    MNUtil.writeJSON(this.backUpFile, totalConfig)
  }
  static clearBackUp(){
    chatAIUtils.log("chatAIConfig.clearBackUp")
    MNUtil.writeJSON(this.backUpFile, {})
  }
/** 
 * @param {Object} config 
 * @returns {boolean} true if successful, false otherwise
 */
  static addToChatHistory(config){
    try {

      let newData = {data:config.history}
      if (config.funcIndices && config.funcIndices.length) {
        newData.funcIdxs = config.funcIndices
      }
      if (config.currentPrompt && config.currentPrompt !== "Dynamic") {
        newData.name = chatAIConfig.prompts[config.currentPrompt].title
      }else{
        let firstUser = config.history.find(item=>item.role === "user")
        if (typeof firstUser.content === "string") {
          newData.name = firstUser.content.slice(0,10)
        }else{
          newData.name = firstUser.content.find(item=>item.type = "text").text.slice(0,10)
        }
      }
      if (config.temperature !== undefined) {
        newData.temperature = config.temperature
      }
      newData.model = config.currentModel
      newData.token = config.token
      newData.id = MNUtil.UUID()
      let data = this.getChatData()
      data.chats.push(newData)
      if (data.chatIdxs.length) {
        let newIdx = Math.max(...data.chatIdxs)+1
        data.chatIdxs.push(newIdx)
        data.activeChatIdx = newIdx
      }else{
        data.chatIdxs.push(0)
        data.activeChatIdx = 0
      }
      //保存到chatData.json
      this.exportChatData(data)
      return true
    } catch (error) {
      chatAIUtils.addErrorLog(error, "addToChatHistory")
      return false
    }
  }
  /**
   * 写入聊天数据到本地的chatData.json
   * @param {Object} data 
   */
  static exportChatData(data){
    this.checkDataDir()
    // MNUtil.copyJSON(data)
    MNUtil.writeJSON(subscriptionUtils.extensionPath+"/data/chatData.json", data)
  }
  static convertDate(dateStr){
    return dateStr ? new Date(dateStr) : null
  }
/**
 * 将 NSFileManager 返回的文件属性对象转换为 Node.js fs.Stats 格式
 * @param {Object} nsAttrs - NSFileManager 获取的文件属性
 * @returns {Object} - 模拟 Node.js fs.Stats 的对象
 */
  static convertNsAttrsToFsStats(nsAttrs) {
  // 处理时间：ISO 字符串 → Date 对象

  // 处理权限：NSFilePosixPermissions（十进制）→ Node.js mode（八进制）
  const mode = nsAttrs.NSFilePosixPermissions ? 
    `0o${nsAttrs.NSFilePosixPermissions.toString(8)}` : null;

  // 构建模拟的 Stats 对象
  const stats = {
    // 核心属性（与 Node.js fs.Stats 对齐）
    dev: nsAttrs.NSFileSystemNumber || 0,       // 设备 ID（对应 NSFileSystemNumber）
    ino: nsAttrs.NSFileSystemFileNumber || 0,   // inode 编号（对应 NSFileSystemFileNumber）
    mode: mode ? parseInt(mode, 8) : 0,         // 权限模式（八进制）
    nlink: nsAttrs.NSFileReferenceCount || 1,   // 硬链接数（对应 NSFileReferenceCount）
    uid: nsAttrs.NSFileOwnerAccountID || 0,     // 用户 ID（对应 NSFileOwnerAccountID）
    gid: nsAttrs.NSFileGroupOwnerAccountID || 0,// 组 ID（对应 NSFileGroupOwnerAccountID）
    rdev: 0,                                    // 特殊设备 ID（NSFileManager 无直接对应，默认 0）
    size: nsAttrs.NSFileSize || 0,              // 文件大小（对应 NSFileSize）
    blksize: 4096,                              // 块大小（NSFileManager 无直接对应，默认 4096）
    blocks: nsAttrs.NSFileSize ? Math.ceil(nsAttrs.NSFileSize / 4096) : 0, // 块数（计算值）
    atimeMs: this.convertDate(nsAttrs.NSFileModificationDate)?.getTime() || 0, // 最后访问时间（NSFileManager 无直接对应，暂用修改时间）
    mtimeMs: this.convertDate(nsAttrs.NSFileModificationDate)?.getTime() || 0, // 最后修改时间（对应 NSFileModificationDate）
    ctimeMs: this.convertDate(nsAttrs.NSFileCreationDate)?.getTime() || 0,     // 状态改变时间（对应 NSFileCreationDate）
    birthtimeMs: this.convertDate(nsAttrs.NSFileCreationDate)?.getTime() || 0, // 创建时间（对应 NSFileCreationDate）

    // 时间对象（Node.js Stats 同时提供 ms 和 Date 对象两种格式）
    atime: this.convertDate(nsAttrs.NSFileModificationDate) || new Date(0),
    mtime: this.convertDate(nsAttrs.NSFileModificationDate) || new Date(0),
    ctime: this.convertDate(nsAttrs.NSFileCreationDate) || new Date(0),
    birthtime: this.convertDate(nsAttrs.NSFileCreationDate) || new Date(0),

    // NSFileManager 特有的属性（保留供参考）
    _nsFileType: nsAttrs.NSFileType,
    _nsFileOwnerAccountName: nsAttrs.NSFileOwnerAccountName,
    _nsFileGroupOwnerAccountName: nsAttrs.NSFileGroupOwnerAccountName,
    _nsFileProtectionKey: nsAttrs.NSFileProtectionKey,
    _nsFileExtendedAttributes: nsAttrs.NSFileExtendedAttributes
  };

  // 添加类型判断方法（模拟 Node.js Stats 的 isFile()/isDirectory() 等）
  stats.isFile = () => stats._nsFileType === 'NSFileTypeRegular';
  stats.isDirectory = () => stats._nsFileType === 'NSFileTypeDirectory';
  stats.isSymbolicLink = () => stats._nsFileType === 'NSFileTypeSymbolicLink';
  stats.isFIFO = () => stats._nsFileType === 'NSFileTypeFIFO';
  stats.isSocket = () => stats._nsFileType === 'NSFileTypeSocket';
  stats.isBlockDevice = () => stats._nsFileType === 'NSFileTypeBlockSpecial';
  stats.isCharacterDevice = () => stats._nsFileType === 'NSFileTypeCharacterSpecial';

  return stats;
}

  static getFileAttributes(path){
    let fileManager = NSFileManager.defaultManager()
    let attributes = fileManager.attributesOfItemAtPath(path)
    attributes = this.convertNsAttrsToFsStats(attributes)
    attributes.path = path
    return attributes
  }
  static getChatDataAttributes(){
    let path = subscriptionUtils.extensionPath+"/data/chatData.json"
    let attributes = this.getFileAttributes(path)
    return attributes
  }
  /**
   * 从本地的chatData.json中读取聊天数据
   * @returns {Object}
   */
  static getChatData(){
    let dataPath = subscriptionUtils.extensionPath+"/data/chatData.json"
    if (MNUtil.isfileExists(dataPath)) {
      let data = MNUtil.readJSON(dataPath)
      let chatsLength = data.chats.length
      if (chatsLength) {
        for (let i = 0; i < chatsLength; i++) {
          let chat = data.chats[i]
          if (typeof chat.name === "object") {
            if ("content" in chat.name) {
              chat.name = chat.name.content
            }else{
              chat.name = "New Chat"
            }
          }
          if (!("id" in chat)) {//为每个聊天追加一个id，方便定位
            chat.id = MNUtil.UUID()
          }
          data.chats[i] = chat
      }
      }
      return data
    }
    return {
      "folder":[],
      "chats":[
        {
          name:"New Chat",
          data:[]
        }
      ],
      "chatIdxs": [0],
      "activeChatIdx": 0,
      "avatar": "https://file.feliks.top/avatar.webp"
    }
  }
  static preChatDataId = ""
  /**
   * 将聊天记录加密上传并获取信息摘要
   * @returns {Object}
   * @property {string} id 聊天数据id
   */
  static async getChatDataInfo(){
    let info = {success:true}
    let dataPath = subscriptionUtils.extensionPath+"/data/chatData.json"
    let text = MNUtil.readText(dataPath)
    let res = await chatAIConfig.uploadConfigWithEncryptionToAlist(text)
    if (res.success) {
      let chatDataAttributes = this.getFileAttributes(dataPath)
      info.size = chatDataAttributes.size
      info.atimeMs = chatDataAttributes.atimeMs
      info.mtimeMs = chatDataAttributes.mtimeMs
      info.ctimeMs = chatDataAttributes.ctimeMs
      info.birthtimeMs = chatDataAttributes.birthtimeMs
      info.id = res.id
      return info
    }else{
      return {success:false,error:res.error}
    }
  }
  static async getCachedNotesInStudySet(studySetId){
  try {

    let dataPath = subscriptionUtils.extensionPath+"/data/"+studySetId+".json"
    if (MNUtil.isfileExists(dataPath)) {
      let data = MNUtil.readJSON(dataPath)
      return data
    }else{
      MNUtil.waitHUD("Generating cached notes in studySet...")
      await MNUtil.delay(0.01)
      let studySet = MNUtil.getNoteBookById(studySetId)
      let allNotes = studySet.notes.map(note=>MNNote.new(note))
      let noteSize = allNotes.length
      let noteInfo = []
      for (let i = 0; i < noteSize; i++) {
        let note = allNotes[i]
        let info = await chatAIUtils.genCardStructure(note)
        noteInfo.push(info)
        MNUtil.waitHUD("Generating cached notes in studySet... "+i+"/"+noteSize)
        await MNUtil.delay(0.00001)
      }
      MNUtil.writeJSON(dataPath, noteInfo)
      MNUtil.waitHUD("Generating cached notes in all study sets... Done")
      return noteInfo
    }
    
  } catch (error) {
    chatAIUtils.addErrorLog(error, "getCachedNotesInStudySet")
    return []
  }
  }
  static async getCachedNotesInAllStudySets(){
  try {

    let studySets = chatAIUtils.allStudySets()
    let studySetsSize = studySets.length
    let notesInStudySets = []
    for (let i = 0; i < studySetsSize; i++) {
      let studySet = studySets[i]
      let notes = await chatAIConfig.getCachedNotesInStudySet(studySet.topicId)
      notesInStudySets.push(notes)
    }
    let allNotes = notesInStudySets.flat()
    return allNotes
    
  } catch (error) {
    chatAIUtils.addErrorLog(error, "getCachedNotesInAllStudySets")
    return []
  }
  }
  static async getTunnels(){
  try {

    let TunnelMap = ['Tunnel 1️⃣: ','Tunnel 2️⃣: ','Tunnel 3️⃣: ','Tunnel 4️⃣: ','Tunnel 5️⃣: ','Tunnel 6️⃣: ','Tunnel 7️⃣: ','Tunnel 8️⃣: ']
    if (!Object.keys(this.keys).length) {
      MNUtil.showHUD("Refreshing built-in keys...")
      let res = await chatAINetwork.fetchKeys()
      if (res && "shareKeys" in res) {
        if (res.shareKeys.message) {
          MNUtil.showHUD(res.shareKeys.message)
        }else{
          MNUtil.showHUD("error")
          return ['Tunnel 1️⃣: ','Tunnel 2️⃣: ','Tunnel 3️⃣: ','Tunnel 4️⃣: ']
        }
      }else{
        MNUtil.showHUD("error")
        return ['Tunnel 1️⃣: ','Tunnel 2️⃣: ','Tunnel 3️⃣: ','Tunnel 4️⃣: ']
      }
    }
    // MNUtil.copy(this.keys)
    let keys = Object.keys(this.keys).filter(k=>k.startsWith("key"))
    // MNUtil.copy(res)
    return keys.map((k,index)=>{
      return TunnelMap[index]+this.keys["key"+index].model
    })
    
  } catch (error) {
    chatAIUtils.addErrorLog(error, "getTunnels")
  }
  }
  static copy(obj){
    return JSON.parse(JSON.stringify(obj))
  }
  static autoImport(checkSubscribe = false){
    if (checkSubscribe && !chatAIUtils.isSubscribed(false)) {
      return false
    }
    return this.getConfig("autoImport")
  }
  static getConfig(key){
    if (!this.config) {
      return false
    }
    if (this.config[key] !== undefined) {
      return this.config[key]
    }else{
      return this.defaultConfig[key]
    }
  }
  static hasAPIKeyInSource(source){
    let keyName = this.sourceKeyName(source)
    if (keyName) {
      return this.getConfig(keyName)
    }
    switch (source) {
      case "Subscription":
        return chatAIUtils.isActivated()
      default:
        return false
    }
  }
  static getAvailableModels(source){
    if (source) {
      return this.modelNames(source,true).map(model=>(source+": "+model.trim()))
    }else{
      let checkKey = true
      let allSource = this.allSource(false)
      let allModels = ["Default","Built-in"]
      allSource.forEach(source=>{
        let models = this.modelNames(source,checkKey).map(model=>(source+": "+model.trim()))
        allModels = allModels.concat(models)
      })
      return [...new Set(allModels)]
    }
  }
  static getAllConfig(withChat = false){
    let config = {config:this.config,prompts:this.prompts,knowledge:this.knowledge,dynamicPrompt:this.dynamicPrompt,moonshotFileId:this.fileId}
    if (withChat) {
      let chatData = this.getChatData()
      config.chatData = chatData
    }
    return config
  }
  static deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || obj1 === null ||
        typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }

    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!keys2.includes(key)) {
            return false;
        }
        if (["modifiedTime","lastSyncTime","autoImport","autoExport"].includes(key)) {
          continue
        }
        // if (key === "currentPrompt") {
        //   MNUtil.copy(obj1[key]+":"	+ obj2[key])
        // }
        if (!this.deepEqual(obj1[key], obj2[key])) {
          return false;
        }
    }
    return true;
  }
  static setSyncStatus(onSync,success = false){
  try {
    this.onSync = onSync
    if (chatAIUtils.chatController) {
      if (onSync) {
        MNButton.setColor(chatAIUtils.chatController.moveButton, "#e06c75",0.5)
      }else{
        if (success) {
          MNButton.setColor(chatAIUtils.chatController.moveButton, "#30d36c",0.5)
          MNUtil.delay(1).then(()=>{
            MNButton.setColor(chatAIUtils.chatController.moveButton, "#3a81fb",0.5)
          })
        }else{
          MNButton.setColor(chatAIUtils.chatController.moveButton, "#3a81fb",0.5)
        }
      }
    }
  } catch (error) {
    MNUtil.showHUD(error)
  }
  }
  static isSameConfigWithLocal(config,alert = true){
  try {
    // MNUtil.copyJSON({remote:config,local:this.getAllConfig()})
    let same = this.deepEqual(config, this.getAllConfig())
    if (same && alert) {
      MNUtil.showHUD("Same config")
    }
    return same
  } catch (error) {
    return false
  }
  }
  /**
   * 
   * @param {MbBookNote} note
   */
  static expandesConfig(note,config,orderedKeys=undefined,exclude=undefined) {
    let keys
    if (orderedKeys) {
      keys = orderedKeys
    }else{
      keys = Object.keys(config)
    }
    keys.forEach((key)=>{
      let subConfig = config[key]
      if (typeof subConfig === "object") {
        let child = chatAIUtils.createChildNote(note,key)
        this.expandesConfig(child, subConfig,undefined,exclude)
      }else{
        if (exclude) {
          if (key !== exclude) {
            chatAIUtils.createChildNote(note,key,config[key])
          }
        }else{
          chatAIUtils.createChildNote(note,key,config[key])
        }
      }
    })
  }
  static getDefaultActionKeys() {
    let actions = this.getActions()
    return Object.keys(actions)
  }
  static save(key,ignoreExport = false,synchronize = true) {
    
    if (key === undefined) {//只保存最重要的
        this.config.modifiedTime = Date.now()
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"MNChatglm_config")
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.prompts,"MNChatglm_prompts")
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.fileId,"MNChatglm_fileId")
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.knowledge,"MNChatglm_knowledge")
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.dynamicPrompt,"MNChatglm_dynamicPrompt")
        if (!ignoreExport && chatAIUtils.isSubscribed(false) && this.getConfig("autoExport")) {
          this.export(false)
        }
    }else{
      if (Array.isArray(key)) {
        let changeModifiedTime = false
        key.forEach(k=>{
          switch (k) {
            case "MNChatglm_builtInKeys":
              NSUserDefaults.standardUserDefaults().setObjectForKey(this.keys,'MNChatglm_builtInKeys')
              break;
            case "MNChatglm_config":
              NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"MNChatglm_config")
              changeModifiedTime = true
              break;
            case "MNChatglm_modelConfig":
              NSUserDefaults.standardUserDefaults().setObjectForKey(this.modelConfig,"MNChatglm_modelConfig")
              break;
            case "MNChatglm_prompts":
              NSUserDefaults.standardUserDefaults().setObjectForKey(this.prompts,"MNChatglm_prompts")
              changeModifiedTime = true
              break;
            case "MNChatglm_fileId":
              NSUserDefaults.standardUserDefaults().setObjectForKey(this.fileId,"MNChatglm_fileId")
              break;
            case "MNChatglm_knowledge":
              NSUserDefaults.standardUserDefaults().setObjectForKey(this.knowledge,"MNChatglm_knowledge")
              changeModifiedTime = true
              break;
            case "MNChatglm_dynamicPrompt":
              NSUserDefaults.standardUserDefaults().setObjectForKey(this.dynamicPrompt,"MNChatglm_dynamicPrompt")
              changeModifiedTime = true
              break;
            case "MNChatglm_usage":
              NSUserDefaults.standardUserDefaults().setObjectForKey(this.usage,"MNChatglm_usage")
              break;
            default:
              MNUtil.showHUD("Not supported")
              break;
          }
        })
        if (changeModifiedTime) {
          this.config.modifiedTime = Date.now()
          if (!ignoreExport && chatAIUtils.isSubscribed(false) && this.getConfig("autoExport")) {
            this.export(false)
          }
        }
      }else{
      switch (key) {
        case "MNChatglm_builtInKeys":
          NSUserDefaults.standardUserDefaults().setObjectForKey(this.keys,'MNChatglm_builtInKeys')
          break;
        case "MNChatglm_config":
          NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"MNChatglm_config")
          this.config.modifiedTime = Date.now()
          if (!ignoreExport && chatAIUtils.isSubscribed(false) && this.getConfig("autoExport")) {
            this.export(false)
          }
          break;
        case "MNChatglm_modelConfig":
          NSUserDefaults.standardUserDefaults().setObjectForKey(this.modelConfig,"MNChatglm_modelConfig")
          break;
        case "MNChatglm_prompts":
          NSUserDefaults.standardUserDefaults().setObjectForKey(this.prompts,"MNChatglm_prompts")
          this.config.modifiedTime = Date.now()
          if (!ignoreExport && chatAIUtils.isSubscribed(false) && this.getConfig("autoExport")) {
            this.export(false)
          }
          break;
        case "MNChatglm_fileId":
          NSUserDefaults.standardUserDefaults().setObjectForKey(this.fileId,"MNChatglm_fileId")
          break;
        case "MNChatglm_knowledge":
          NSUserDefaults.standardUserDefaults().setObjectForKey(this.knowledge,"MNChatglm_knowledge")
          this.config.modifiedTime = Date.now()
          if (!ignoreExport && chatAIUtils.isSubscribed(false) && this.getConfig("autoExport")) {
            this.export(false)
          }
          break;
        case "MNChatglm_dynamicPrompt":
          NSUserDefaults.standardUserDefaults().setObjectForKey(this.dynamicPrompt,"MNChatglm_dynamicPrompt")
          this.config.modifiedTime = Date.now()
          if (!ignoreExport && chatAIUtils.isSubscribed(false) && this.getConfig("autoExport")) {
            this.export(false)
          }
          break;
        case "MNChatglm_usage":
          NSUserDefaults.standardUserDefaults().setObjectForKey(this.usage,"MNChatglm_usage")
          break;
        default:
          MNUtil.showHUD("Not supported")
          break;
      }
      }

    }
    if (synchronize) {
      NSUserDefaults.standardUserDefaults().synchronize()
    }
    if (this.backUpTimer) {//如果存在定时器，则取消定时器
      this.backUpTimer.invalidate()
      this.backUpTimer = undefined
    }
    //创建新的定时器
    this.backUpTimer = NSTimer.scheduledTimerWithTimeInterval(1, false, function () {
      chatAIConfig.backUpTimer.invalidate()
      chatAIConfig.backUpTimer = undefined
      chatAIConfig.backUp()
    });
  }
  static checkCloudStore(notificaiton = true, force = false){
    let iCloudSync = this.getConfig("syncSource") === "iCloud"
    if ((iCloudSync || force) && !this.cloudStore) {
      this.cloudStore = NSUbiquitousKeyValueStore.defaultStore()
      if (notificaiton) {
        MNUtil.postNotification("NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI", {}) 
      }
    }
  }
  static initCloudStore(){
    this.cloudStore = NSUbiquitousKeyValueStore.defaultStore()
    MNUtil.postNotification("NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI", {})
  }
  static isValidTotalConfig(config){
    if (!config) {
      return false
    }
    let isVaild = ("config" in config && "prompts" in config && "knowledge" in config && "dynamicPrompt" in config)
    return isVaild
  }
  static async importChatData(chatData){
    let confirm = await MNUtil.confirm("MN ChatAI\nImport chat data?","是否导入聊天数据？")
    if (!confirm) {
      return false
    }
    MNUtil.waitHUD("📥 Import Chat History...")
    chatAIConfig.exportChatData(chatData)
    if (chatAIUtils.sideOutputController && MNExtensionPanel.on) {
      chatAIUtils.sideOutputController.importData()
    }
    MNUtil.showHUD("✅ Import success!")
    MNUtil.stopHUD(0.5)
    return true
  }

  static importConfig(newConfig){
    if (this.isValidTotalConfig(newConfig)){
      this.previousConfig = this.getAllConfig()
      let autoImport = this.getConfig("autoImport")
      let autoExport = this.getConfig("autoExport")
      this.config = newConfig.config
      this.config.lastSyncTime = Date.now()
      this.config.autoImport = autoImport
      this.config.autoExport = autoExport
      // this.config.modifiedTime = Date.now()
      this.prompts = newConfig.prompts
      // MNUtil.copyJSON(prompts)
      this.knowledge = newConfig.knowledge
      this.dynamicPrompt = newConfig.dynamicPrompt
      if("moonshotFileId" in newConfig){
        this.fileId = newConfig.moonshotFileId
      }
      this.setCurrentPrompt(this.config.currentPrompt)
      this.saveAfterImport()
      this.setSyncStatus(false,true)
      if (chatAIUtils.notifyController) {
        chatAIUtils.notifyController.refreshCustomButton()
      }
      if ("chatData" in newConfig) {
        this.importChatData(newConfig.chatData)
      }
      // MNUtil.log({message:"Import Config",source:"MN ChatAI",detail:newConfig})
      return true
    }else{
      this.setSyncStatus(false)
      return false
    }
  }
  static async readCloudConfig(msg = true,alert = false,force = false){
    this.checkCloudStore(false)
    if (force) {
      let cloudConfig = this.cloudStore.objectForKey("MNChatAI_totalConfig")
      let success = this.importConfig(cloudConfig)
      if (msg) {
        MNUtil.showHUD("Import from iCloud")
      }
      if (success) {
        if (alert) {
          MNUtil.showHUD("Import success!")
        }
        return true
      }else{
        MNUtil.showHUD("Invalid config in iCloud!")
        return false
      }
    }
    let iCloudSync = this.getConfig("syncSource") === "iCloud"
    if(!iCloudSync){
      return false
    }
    try {
      let cloudConfig = this.cloudStore.objectForKey("MNChatAI_totalConfig")
      // MNUtil.copy(cloudConfig)
      if (cloudConfig) {
        let same = this.deepEqual(cloudConfig, this.getAllConfig())
        if (same) {
          if (msg) {
            MNUtil.showHUD("Already synced")
          }
          return false
        }
        //要求云端的配置更新, 才能向本地写入
        //即使云端最旧的时间也要比本地最新的时候更新
        let localLatestTime = this.getLocalLatestTime()
        let localOldestTime = Math.min(this.config.lastSyncTime,this.config.modifiedTime)
        let cloudLatestTime = Math.max(cloudConfig.config.lastSyncTime,cloudConfig.config.modifiedTime)
        let cloudOldestTime = Math.min(cloudConfig.config.lastSyncTime,cloudConfig.config.modifiedTime)
        if (localLatestTime < cloudOldestTime) {
          if (alert) {
            let confirm = await MNUtil.confirm("MN ChatAI\nImport from iCloud?","是否导入iCloud配置？")
            if (!confirm) {
              return false
            }
          }
          if (msg) {
            MNUtil.showHUD("Import from iCloud")
          }
          let success = this.importConfig(cloudConfig)
          if (success) {
            if (alert) {
              MNUtil.showHUD("Import success!")
            }
            return true
          }else{
            MNUtil.showHUD("Invalid config in iCloud!")
            return false
          }
        }
        if (this.config.modifiedTime > (cloudConfig.config.modifiedTime+1000)) {
          if (alert) {
            let confirm = await MNUtil.confirm("MN ChatAI\n Uploading to iCloud?","📤 是否上传配置到iCloud？")
            if (!confirm) {
              return false
            }
          }
          this.writeCloudConfig(msg)
          return false
        }
        let userSelect = await MNUtil.userSelect("MN ChatAI\n Conflict config, import or export?","配置冲突，请选择操作",["📥 Import / 导入","📤 Export / 导出"])
        switch (userSelect) {
          case 0:
            MNUtil.showHUD("User Cancel")
            return false
          case 1:
            let success = this.importConfig(cloudConfig)
            if (success) {
              if (alert) {
                MNUtil.showHUD("Import success!")
              }
              return true
            }else{
              MNUtil.showHUD("Invalid config in iCloud!")
              return false
            }
          case 2:
            this.writeCloudConfig(msg,true)
            return false
          default:
            return false
        }
      }else{
        let confirm = await MNUtil.confirm("MN ChatAI\nEmpty config in iCloud, uploading?","iCloud配置为空,是否上传？")
        if (!confirm) {
          return false
        }
        this.writeCloudConfig(msg)
        if (msg) {
          MNUtil.showHUD("No config in iCloud, uploading...")
        }
        return false
      }
    } catch (error) {
      chatAIUtils.addErrorLog(error, "readCloudConfig")
      return false
    }
  }
  static writeCloudConfig(msg = true,force = false){
    // if (!chatAIUtils.checkSubscribe(false,msg,true)) {
    //   return false
    // }
    this.checkCloudStore(false,force)
    if (force) {
      this.config.lastSyncTime = Date.now()
      // this.config.modifiedTime = Date.now()
      let config = this.getAllConfig()
      this.cloudStore.setObjectForKey(config,"MNChatAI_totalConfig")
      this.config.lastSyncTime = Date.now()
      return this
    }
    let iCloudSync = this.getConfig("syncSource") === "iCloud"
    if(!iCloudSync){
      return false
    }
    let cloudConfig = this.cloudStore.objectForKey("MNChatAI_totalConfig")
    if (cloudConfig) {
      let same = this.isSameConfigWithLocal(cloudConfig)
      if (same) {
        //如果同步配置相同,不应该向云端写入
        return false
      }
      //如果云端的更新,那么不应该向云端写入
      let localLatestTime = Math.max(this.config.lastSyncTime,this.config.modifiedTime)
      let cloudOldestTime = Math.min(cloudConfig.config.lastSyncTime,cloudConfig.config.modifiedTime)
      if (localLatestTime < cloudOldestTime) {
        let localTime = Date.parse(localLatestTime).toLocaleString()
        let cloudTime = Date.parse(cloudOldestTime).toLocaleString()
        MNUtil.showHUD("Conflict config: local_"+localTime+", cloud_"+cloudTime)
        return false
      }
    }
    this.config.lastSyncTime = Date.now()
    // this.config.modifiedTime = Date.now()
    let config = this.getAllConfig()
    this.cloudStore.setObjectForKey(config,"MNChatAI_totalConfig")
    this.config.lastSyncTime = Date.now()
    // this.config.modifiedTime = Date.now()
    return true
  }
  static getSyncSourceString(){
    switch (this.getConfig("syncSource")) {
      case "MNNote":
        return "MNNote"
      case "CFR2":
        return "Cloudflare R2"
      case "Infi":
        return "InfiniCloud"
      case "Webdav":
        return "Webdav"
      case "iCloud":
        return "iCloud"
      case "None":
        return "None"
      default:
        break;
    }
    return undefined
  }
   static async checkR2Password(save = true){
    if (!this.getConfig("r2password")) {
      let res = await MNUtil.input("Passward for Config","设置云端配置文件密码",["Cancel","Confirm"])
      if (!res.button) {
        MNUtil.showHUD("User Cancel")
        return false
      }
      if (res.input && res.input.trim()) {
        this.config.r2password = res.input
        MNUtil.showHUD("✅ Set Password for Cloudflare R2")
        if (save) {
          this.save("MNChatglm_config",true)
        }
        return true
      }else{
        return false
      }
    }
    return true
  }
   static async checkInfiPassword(save = true){
    if (!this.getConfig("InfiPassword")) {
      let res = await MNUtil.input("Passward for Config","设置云端配置文件密码",["Cancel","Confirm"])
      if (!res.button) {
        MNUtil.showHUD("User Cancel")
        return false
      }
      if (res.input && res.input.trim()) {
        this.config.InfiPassword = res.input
        MNUtil.showHUD("✅ Set Password for InfiniCloud")
        if (save) {
          this.save("MNChatglm_config",true)
        }
        return true
      }else{
        return false
      }
    }
    return true
  }
  static async checkWebdavAccount(force = false){
    // MNUtil.copyJSON(this.config)
    let shouldSave = false
    if (force || !this.getConfig("webdavFolder")) {
      let res = await MNUtil.input("Folder for Webdav","输入webdav文件夹",["Cancel","Confirm"])
      if (!res.button) {
        MNUtil.showHUD("User Cancel")
        return false
      }
      if (res.input && res.input.trim()) {
        if (res.input.endsWith("/")) {
          this.config.webdavFolder = res.input
        }else{
          this.config.webdavFolder = res.input + "/"
        }
      }else{
        return false
      }
      shouldSave = true
    }
    if (force || !this.getConfig("webdavUser")) {
      let res = await MNUtil.input("UserName for Webdav","输入webdav用户名",["Cancel","Confirm"])
      if (!res.button) {
        MNUtil.showHUD("User Cancel")
        return false
      }
      if (res.input && res.input.trim()) {
        this.config.webdavUser = res.input
      }else{
        return false
      }
      shouldSave = true
    }
    if (force || !this.getConfig("webdavPassword")) {
      let res = await MNUtil.input("Passward for Webdav","输入webdav密码",["Cancel","Confirm"])
      if (!res.button) {
        MNUtil.showHUD("User Cancel")
        return false
      }
      if (res.input && res.input.trim()) {
        this.config.webdavPassword = res.input
      }else{
        return false
      }
      shouldSave = true
    }
    if (shouldSave) {
      MNUtil.showHUD("Save Webdav account...")
      this.save("MNChatglm_config",true)
    }
    return true
  }
  static async export(alert = true,force = false, syncSource = this.getConfig("syncSource")){
  try {

    if (!chatAIUtils.checkSubscribe(true)) {
      return false
    }
    // MNUtil.copyJSON(this.getAllConfig())
    // return
    if (this.onSync) {
      MNUtil.showHUD("onSync")
      return
    }
    this.setSyncStatus(true)
    if (force) {
      let success = false
      switch (syncSource) {
        case "None":
          this.setSyncStatus(false,false)
          return false
        case "iCloud":
          success = this.writeCloudConfig(true,true)
          this.setSyncStatus(false,success)
          return success;
        case "MNNote":
          let noteId = this.getConfig("syncNoteId")
          let latestTime = this.getLocalLatestTime()
          let focusNote = MNNote.new(noteId)
          if (!focusNote) {
            focusNote = chatAIUtils.getFocusNote()
          }
          if (!focusNote) {
            this.setSyncStatus(false)
            MNUtil.showHUD("No focus note")
            return false
          }
          let modifiedDate = Date.parse(focusNote.modifiedDate ?? focusNote.createDate)
          let confirm = false
          if (latestTime > modifiedDate) {
            confirm = true
          }else{
            if (alert) {
              confirm = await MNUtil.confirm("MN ChatAI\nNewer config from note!\n卡片配置较新！","Overwrite?\n是否覆盖？")
            }
          }
          if (!confirm) {
            this.setSyncStatus(false)
            return false
          }
          this.config.lastSyncTime = Date.now()+5
          // this.config.modifiedTime = this.config.lastSyncTime
          this.config.syncNoteId = focusNote.noteId
          let currentSyncSource = this.getConfig("syncSource")
          if (chatAIUtils.chatController && currentSyncSource === "MNNote") {
            chatAIUtils.chatController.configNoteIdInput.text = focusNote.noteId
          }
          this.export2MNNote(focusNote)
          this.setSyncStatus(false,true)
          return true
        case "CFR2":
          // chatAIUtils.log("export CFR2")
          this.setSyncStatus(true)
          this.config.lastSyncTime = Date.now()+5
          // this.config.modifiedTime = this.config.lastSyncTime
          if (alert) {
            MNUtil.showHUD("Uploading...")
          }
          if (!await this.checkR2Password()) {
            MNUtil.showHUD("No password for Cloudflare R2!")
            return false
          }
          // chatAIUtils.log("export CFR2 uploadConfigWithEncryptionFromR2")

          await chatAIConfig.uploadConfigWithEncryptionFromR2(this.config.r2file, this.config.r2password, alert)
          // MNUtil.copyJSON(this.config)
          this.setSyncStatus(false,true)
          return true
        case "Infi":
          this.setSyncStatus(true)
          this.config.lastSyncTime = Date.now()+5
          // this.config.modifiedTime = this.config.lastSyncTime
          if (alert) {
            MNUtil.showHUD("Uploading...")
          }
          if (!await this.checkInfiPassword()) {
            MNUtil.showHUD("No password for InfiniCloud!")
            return false
          }
          await chatAIConfig.uploadConfigWithEncryptionToInfi(this.config.InfiFile, this.config.InfiPassword, alert)
          // MNUtil.copyJSON(this.config)
          this.setSyncStatus(false,true)
          return true
        case "Webdav":
        try {
          this.setSyncStatus(true)
          this.config.lastSyncTime = Date.now()+5
          // this.config.modifiedTime = this.config.lastSyncTime
          if (alert) {
            MNUtil.showHUD("Uploading...")
          }
          let authorization = {
            user:this.getConfig("webdavUser"),
            password:this.getConfig("webdavPassword")
          }
          let res = await chatAIConfig.uploadConfigToWebdav(this.config.webdavFile+".json", authorization)
          if (typeof res === "object" && "statusCode" in res && res.statusCode >= 400) {
            MNUtil.showHUD("Error when export.uploadConfigToWebdav: "+res.statusCode)
            MNUtil.copyJSON(res)
            this.setSyncStatus(false)
            return false
          }
          // MNUtil.copyJSON(this.config)
          this.setSyncStatus(false,true)
          return true
        } catch (error) {
          MNUtil.showHUD(error)
          this.setSyncStatus(false,false)
          return true
        }
      }
      return true
    }
    let remoteConfig = await this.getCloudConfigFromSource(syncSource, alert)
    if (remoteConfig && chatAIConfig.isSameConfigWithLocal(remoteConfig,alert)) {
      this.setSyncStatus(false)
      return false
    }
    let success = false
    switch (syncSource) {
      case "None":
        this.setSyncStatus(false,false)
        return false
      case "iCloud":
        success = this.writeCloudConfig(false,true)
        this.setSyncStatus(false,success)
        return success;
      case "MNNote":
        let noteId = this.getConfig("syncNoteId")
        let latestTime = this.getLocalLatestTime()
        let focusNote = MNNote.new(noteId)
        if (!focusNote) {
          focusNote = chatAIUtils.getFocusNote()
        }
        if (!focusNote) {
          this.setSyncStatus(false)
          MNUtil.showHUD("No focus note")
          return false
        }
        let modifiedDate = Date.parse(focusNote.modifiedDate ?? focusNote.createDate)
        let confirm = false
        if (latestTime > modifiedDate) {
          confirm = true
        }else{
          if (alert) {
            confirm = await MNUtil.confirm("MN ChatAI\nNewer config from note!\n卡片配置较新！","Overwrite?\n是否覆盖？")
          }
        }
        if (!confirm) {
          this.setSyncStatus(false)
          return false
        }
        this.config.lastSyncTime = Date.now()+5
        // this.config.modifiedTime = this.config.lastSyncTime
        this.config.syncNoteId = focusNote.noteId
        let currentSyncSource = this.getConfig("syncSource")
        if (chatAIUtils.chatController && currentSyncSource === "MNNote") {
          chatAIUtils.chatController.configNoteIdInput.text = focusNote.noteId
        }
        this.export2MNNote(focusNote)
        this.setSyncStatus(false,true)
        return true
      case "CFR2":
        this.setSyncStatus(true)
        if (remoteConfig && remoteConfig.config && remoteConfig.config.modifiedTime > this.config.modifiedTime) {
          if (alert) {
            let confirm = await MNUtil.confirm("MN ChatAI\nNewer config from R2!\nR2配置较新！","Overwrite remote config?\n是否覆盖远程配置？")
            if (!confirm) {
              this.setSyncStatus(false)
              return false
            }
          }else{
            this.setSyncStatus(false)
            return false
          }
        }
        this.config.lastSyncTime = Date.now()+5
        // this.config.modifiedTime = this.config.lastSyncTime
        if (alert) {
          MNUtil.showHUD("Uploading...")
        }
        if (!await this.checkR2Password()) {
          MNUtil.showHUD("No password for Cloudflare R2!")
          return false
        }
        await chatAIConfig.uploadConfigWithEncryptionFromR2(this.config.r2file, this.config.r2password, alert)
        // MNUtil.copyJSON(this.config)
        this.setSyncStatus(false,true)
        return true
      case "Infi":
        this.setSyncStatus(true)
        if (remoteConfig && remoteConfig.config && remoteConfig.config.modifiedTime > this.config.modifiedTime) {
          if (alert) {
            let confirm = await MNUtil.confirm("MN ChatAI\nNewer config from InfiniCloud!\nInfiniCloud配置较新！","Overwrite remote config?\n是否覆盖远程配置？")
            if (!confirm) {
              this.setSyncStatus(false)
              return false
            }
          }else{
            this.setSyncStatus(false)
            return false
          }
        }
        this.config.lastSyncTime = Date.now()+5
        // this.config.modifiedTime = this.config.lastSyncTime
        if (alert) {
          MNUtil.showHUD("Uploading...")
        }
        if (!await this.checkInfiPassword()) {
          MNUtil.showHUD("No password for InfiniCloud!")
          return false
        }
        await chatAIConfig.uploadConfigWithEncryptionToInfi(this.config.InfiFile, this.config.InfiPassword, alert)
        // MNUtil.copyJSON(this.config)
        this.setSyncStatus(false,true)
        return true
      case "Webdav":
      try {
        this.setSyncStatus(true)
        if (!Object.keys(remoteConfig).length || ("statusCode" in remoteConfig && (remoteConfig.statusCode >= 400 && remoteConfig.statusCode != 404 ))) {
          // chatAIUtils.addErrorLog(error, "export",remoteConfig.statusCode)
          MNUtil.showHUD("Error when export.readConfigFromWebdav: "+remoteConfig.statusCode)
          // MNUtil.copyJSON(remoteConfig)
          this.setSyncStatus(false)
          return false
        }
        if (remoteConfig && remoteConfig.config && remoteConfig.config.modifiedTime > this.config.modifiedTime) {
          if (alert) {
            let confirm = await MNUtil.confirm("MN ChatAI\nNewer config from Webdav!\nWebdav配置较新！","Overwrite remote config?\n是否覆盖远程配置？")
            if (!confirm) {
              this.setSyncStatus(false)
              return false
            }
          }else{
            this.setSyncStatus(false)
            return false
          }
        }

        this.config.lastSyncTime = Date.now()+5
        // this.config.modifiedTime = this.config.lastSyncTime
        if (alert) {
          MNUtil.showHUD("Uploading...")
        }
        let authorization = {
          user:this.getConfig("webdavUser"),
          password:this.getConfig("webdavPassword")
        }
        let res = await chatAIConfig.uploadConfigToWebdav(this.config.webdavFile+".json", authorization)
        if (typeof res === "object" && "statusCode" in res && res.statusCode >= 400) {
          MNUtil.showHUD("Error when export.uploadConfigToWebdav: "+res.statusCode)
          MNUtil.copyJSON(res)
          this.setSyncStatus(false)
          return false
        }
        // MNUtil.copyJSON(this.config)
        this.setSyncStatus(false,true)
        return true
      } catch (error) {
        MNUtil.showHUD(error)
        this.setSyncStatus(false,false)
        return true
      }
    }
    
  } catch (error) {
    chatAIUtils.addErrorLog(error, "export")
  }
    // chatAIConfig.his.push("export")
    // MNUtil.showHUD("his: "+chatAIConfig.his.length)
    // MNUtil.copyJSON(chatAIConfig.his)
    // MNUtil.showHUD("export")


    // MNUtil.copyJSON(config)
  }
  /**
   * 只负责获取配置和检查配置格式是否正确,不负责检查版本
   * @param {string} syncSource 
   * @param {boolean} alert 
   * @returns 
   */
  static async getCloudConfigFromSource(syncSource,alert,force = false){
    try {
    let config = undefined
    switch (syncSource) {
      case "None":
        return undefined
      case "iCloud":
        this.checkCloudStore(false,true)
        config = this.cloudStore.objectForKey("MNChatAI_totalConfig")
        break;
      case "MNNote":
        let noteId = this.getConfig("syncNoteId")
        // if (!noteId.trim()) {
        //   return undefined
        // }
        let focusNote = MNNote.new(noteId)
        if (!focusNote) {
          focusNote = chatAIUtils.getFocusNote()
        }
        if (!focusNote) {
          MNUtil.showHUD("Note not exists!")
          return undefined
        }
        let currentSyncSource = this.getConfig("syncSource")
        if (chatAIUtils.chatController && currentSyncSource === "MNNote") {
          chatAIUtils.chatController.configNoteIdInput.text = focusNote.noteId
        }
        if (focusNote.noteTitle !== "MN ChatAI Config") {
          MNUtil.showHUD("Invalid note title!")
          this.setSyncStatus(false)
          return undefined
        }
        let contentToParse = focusNote.excerptText
        if (/```JSON/.test(contentToParse)) {
          contentToParse = chatAIUtils.extractJSONFromMarkdown(contentToParse)
        }
        if (!MNUtil.isValidJSON(contentToParse)) {
          MNUtil.copy(contentToParse)
          MNUtil.showHUD("Invalid Config")
          chatAIUtils.log("Invalid Config", contentToParse)
          return undefined
        }
        config = JSON.parse(contentToParse)
        break;
      case "CFR2":
        if (!chatAIConfig.getConfig("r2file")) {
          MNUtil.showHUD("No Config file")
          return undefined
        }
        let hasPassword = await this.checkR2Password()
        if (!hasPassword) {
          MNUtil.showHUD("No Password")
          return undefined
        }
        if (alert) { MNUtil.showHUD("Downloading...") }
        config = await chatAIConfig.readEncryptedConfigFromR2(chatAIConfig.config.r2file, chatAIConfig.config.r2password)
        break;
      case "Infi":
        if (!chatAIConfig.getConfig("InfiFile")) {
          MNUtil.showHUD("No Config file")
          return undefined
        }

        let hasInfiPassword = await this.checkInfiPassword()
        if (!hasInfiPassword) {
          MNUtil.showHUD("No Password")
          return undefined
        }
        if (alert) { MNUtil.showHUD("Downloading...") }
        config = await chatAIConfig.readEncryptedConfigFromInfi(chatAIConfig.config.InfiFile, chatAIConfig.config.InfiPassword)
        break;
      case "Webdav":
        if (!chatAIConfig.getConfig("webdavFile")) {
          MNUtil.showHUD("No Config file")
          return undefined
        }
        let hasAccount = await this.checkWebdavAccount()
        if (!hasAccount) {
          MNUtil.showHUD("No Account")
          return undefined
        }
        if (alert) { MNUtil.showHUD("Downloading...") }
        let authorization = {
          user:this.getConfig("webdavUser"),
          password:this.getConfig("webdavPassword")
        }
        config = await chatAIConfig.readConfigFromWebdav(chatAIConfig.config.webdavFile+".json",authorization)
        if (!Object.keys(config).length || ("statusCode" in config && config.statusCode >= 400)) {
          MNUtil.showHUD("Error when getCloudConfig: "+config.statusCode)
          MNUtil.copyJSON(config)
          return undefined
        }
        break;
    }
    if (this.isValidTotalConfig(config)) {
      return config
    }
    return undefined
    } catch (error) {
      chatAIUtils.addErrorLog(error, "getCloudConfigFromSource",syncSource)
      return undefined
    }
  }
  static getLocalLatestTime(){
    let lastSyncTime = this.config.lastSyncTime ?? 0
    let modifiedTime = this.config.modifiedTime ?? 0
    return Math.max(lastSyncTime,modifiedTime)
  }
  static async import(alert = true,force = false, syncSource = this.getConfig("syncSource")){
    if (!chatAIUtils.checkSubscribe(true)) {
      return false
    }
    if (this.onSync) {
      if (alert) {
        MNUtil.showHUD("onSync")
      }
      return false
    }
    // if (syncSource === "iCloud") {
    //   return false
    // }
    this.setSyncStatus(true)
    // MNUtil.showHUD("Importing...")
    let config = await this.getCloudConfigFromSource(syncSource, alert)
    if (force) {
      // MNUtil.copy(typeof config)
      let success = this.importConfig(config)
      if (success) {
        if (alert) {
          MNUtil.showHUD("Import success!")
        }
        return true
      }else{
        MNUtil.showHUD("Invalid config!")
        chatAIUtils.log("Invalid config", config,"error")
        return false
      }
    }
    // MNUtil.showHUD("Importing123...")

    if (!config || chatAIConfig.isSameConfigWithLocal(config,alert)) {
      this.setSyncStatus(false)
      return false
    }
    let localLatestTime = this.getLocalLatestTime()
    let cloudOldestTime = Math.min(config.config.lastSyncTime,config.config.modifiedTime)
    let confirm = true
    //导入前检查配置是否正确
    //即使云端最旧的时间也要比本地最新的时候更新,否则需要用户确认
    if (localLatestTime > cloudOldestTime && alert) {
      let OverWriteOption = "Overwrite?\n是否覆盖？"
      switch (syncSource) {
        case "None":
          return false
        case "iCloud":
          confirm = await MNUtil.confirm("MN ChatAI\nOlder config from iCloud!\niCloud配置较旧！",OverWriteOption)
          break;
        case "MNNote":
          confirm = await MNUtil.confirm("MN ChatAI\nOlder config from note!\n卡片配置较旧！",OverWriteOption)
          break;
        case "CFR2":
          confirm = await MNUtil.confirm("MN ChatAI\nOlder config from R2!\nR2配置较旧！",OverWriteOption)
          break;
        case "Infi":
          confirm = await MNUtil.confirm("MN ChatAI\nOlder config from InfiniCloud!\nInfiniCloud配置较旧！","Overwrite local config?\n是否覆盖本地配置？")
          break;
        case "Webdav":
          confirm = await MNUtil.confirm("MN ChatAI\nOlder config from Webdav!\nWebdav配置较旧！","Overwrite local config?\n是否覆盖本地配置？")
          break;
      }
    }
    if (!confirm) {
      this.setSyncStatus(false)
      return false
    }

    let success = this.importConfig(config)
    if (success) {
      if (alert) {
        MNUtil.showHUD("Import success!")
      }
      return true
    }else{
      MNUtil.showHUD("❌ Failed to import config!")
      chatAIUtils.log("❌ Failed to import config!", config,"error")
      return false
    }
  }
  static saveAfterImport(){
    this.save("MNChatglm_dynamicPrompt",true)
    this.save("MNChatglm_knowledge",true)
    this.save("MNChatglm_prompts",true)
    this.save("MNChatglm_config",true)
  }
  static async sync(){
    let success
    let syncSource = this.getConfig("syncSource")
    switch (syncSource) {
      case "None":
        return false
      case "iCloud":
        success = await this.readCloudConfig(true)
        break;
      case "MNNote":
        success = await this.syncForMNNote()
        break;
      case "CFR2":
        success = await this.syncForCFR2()
        break;
      case "Infi":
        success = await this.syncForInfi()
        break;
      case "Webdav":
        success = await this.syncForWebdav()
        break;
    }
    if (success && this.chatController) {
      this.chatController.refreshLastSyncTime()
    }
  
  }
  /**
   * 
   * @param {MNNote} focusNote 
   */
  static export2MNNote(focusNote){
    this.config.lastSyncTime = Date.now()+5
    this.config.syncNoteId = focusNote.noteId
    let config = this.getAllConfig()
    MNUtil.undoGrouping(()=>{
      focusNote.excerptText = "```JSON\n"+JSON.stringify(config,null,2)+"\n```"
      focusNote.noteTitle = "MN ChatAI Config"
      focusNote.excerptTextMarkdown = true
    })
  }
 static async syncForMNNote(alert = false){
 try {

    if (!chatAIUtils.checkSubscribe(true)) {
      return false
    }
    let noteId = this.config.syncNoteId
    let latestTime = this.getLocalLatestTime()
    let focusNote = MNNote.new(noteId)
    if (!focusNote) {
      focusNote = chatAIUtils.getFocusNote()
    }
    let noteConfig = this.getCloudConfigFromSource("MNNote", alert)
    let modifiedDate = Date.parse(focusNote.modifiedDate ?? focusNote.createDate)
    if (noteConfig && latestTime < modifiedDate) {//导入
      this.setSyncStatus(true)
      let success = this.importConfig(noteConfig)
      if (success) {
        MNUtil.showHUD("Sync Success (import)!")
      }
      return success
    }else{//导出
      this.setSyncStatus(true)
      // MNUtil.showHUD("should export")
      // this.config.lastSyncTime = Date.now()+5
      // this.config.syncNoteId = focusNote.noteId
      this.export2MNNote(focusNote)
      chatAIUtils.chatController.refreshView("syncView")
      MNUtil.showHUD("Sync Success (export)!")
      this.setSyncStatus(false,true)
      return true
    }
 } catch (error) {
  chatAIUtils.addErrorLog(error, "SyncForMNNote")
  return false
 }
 }
 static async syncForCFR2(alert = false){
 try {

    if (!chatAIUtils.checkSubscribe(true)) {
      return false
    }
    this.setSyncStatus(true)
    let latestTime = this.getLocalLatestTime()
    let modifiedDate = 0
    let R2Config = this.getCloudConfigFromSource("CFR2", alert)
    if (R2Config && latestTime < modifiedDate) {      
      this.setSyncStatus(true)
      let success = this.importConfig(R2Config)
      if (success) {
        MNUtil.showHUD("Sync Success (import)!")
      }
      return success
    }else{
      
      MNUtil.showHUD("Uploading...")
      await this.uploadConfigWithEncryptionFromR2(this.config.r2file, this.config.r2password)
      // MNUtil.copyJSON(this.config)
      MNUtil.showHUD("Sync Success (export)!")
      this.setSyncStatus(false,true)
      return true
    }
 } catch (error) {
  this.setSyncStatus(false)
  chatAIUtils.addErrorLog(error, "SyncForCFR2")
 }
 }
 static async syncForInfi(alert = false){
 try {

    if (!chatAIUtils.checkSubscribe(true)) {
      return false
    }
    this.setSyncStatus(true)
    let latestTime = this.getLocalLatestTime()
    let modifiedDate = 0
    let InfiConfig = this.getCloudConfigFromSource("Infi", alert)
    if (InfiConfig && latestTime < modifiedDate) {
      this.setSyncStatus(true)
      let success = this.importConfig(InfiConfig)
      if (success) {
        MNUtil.showHUD("Sync Success (import)!")
      }
      return success
    }else{
      
      MNUtil.showHUD("Uploading...")
      await this.uploadConfigWithEncryptionToInfi(this.config.InfiFile, this.config.InfiPassword)
      // MNUtil.copyJSON(this.config)
      MNUtil.showHUD("Sync Success (export)!")
      this.setSyncStatus(false,true)
      return true
    }
 } catch (error) {
  this.setSyncStatus(false)
  chatAIUtils.addErrorLog(error, "SyncForInfi")
 }
 }
  static async syncForWebdav(alert = false){
 try {

    if (!chatAIUtils.checkSubscribe(true)) {
      return false
    }
    this.setSyncStatus(true)
    let latestTime = this.getLocalLatestTime()
    let modifiedDate = 0
    let remoteConfig = this.getCloudConfigFromSource("Webdav", alert)
    if (remoteConfig && latestTime < modifiedDate) {
      // MNUtil.showHUD("should import")
      this.setSyncStatus(true)
      let success = this.importConfig(remoteConfig)
      if (success) {
        MNUtil.showHUD("Sync Success (import)!")
      }
      return success
    }else{
      
      MNUtil.showHUD("Uploading...")
      let authorization = {
        user:this.getConfig("webdavUser"),
        password:this.getConfig("webdavPassword")
      }
      let res = await this.uploadConfigToWebdav(this.config.webdavFile+".json", authorization)
      if (typeof res === "object" && "statusCode" in res && res.statusCode >= 400) {
        MNUtil.showHUD("Error when export.uploadConfigToWebdav: "+res.statusCode)
        MNUtil.copyJSON(res)
        this.setSyncStatus(false)
        return false
      }
      // MNUtil.copyJSON(this.config)
      MNUtil.showHUD("Sync Success (export)!")
      this.setSyncStatus(false,true)
      return true
    }
 } catch (error) {
  chatAIUtils.addErrorLog(error, "SyncForWebdav")
  this.setSyncStatus(false)
 }
 }
  static get(key) {
    return NSUserDefaults.standardUserDefaults().objectForKey(key)
  }

  static getByDefault(key,defaultValue,backUpFile) {//记得在remove中增加备份文件的删除
    let value = NSUserDefaults.standardUserDefaults().objectForKey(key)
    if (value === undefined) {
      if (backUpFile && MNUtil.isfileExists(backUpFile)) {//需要检查备份文件
        let backupConfig = MNUtil.readJSON(backUpFile)
        if (backupConfig && Object.keys(backupConfig).length > 0) {
          MNUtil.log("backupConfig.readFromBackupFile")
          return backupConfig
        }
      }
      NSUserDefaults.standardUserDefaults().setObjectForKey(defaultValue,key)
      return defaultValue
    }
    return value
  }

  static remove(key) {
    NSUserDefaults.standardUserDefaults().removeObjectForKey(key)
  }
  static reset(){
    this.prompts = this.defaultPrompts
    this.config.promptNames = Object.keys(this.prompts)
    this.config.dynamic = false
    this.dynamicPrompt = this.defaultDynamicPrompt
    this.setCurrentPrompt(this.config.promptNames[0])
    this.save('MNChatglm_config')
    this.save('MNChatglm_prompts')
    this.save("MNChatglm_dynamicPrompt")
  }
  static setCurrentPrompt(prompt,save = true){
    this.currentPrompt = prompt//是promptKey
    this.config.currentPrompt = prompt
    this.currentFunc = this.prompts[this.currentPrompt].func ?? []
    this.currentAction = this.prompts[this.currentPrompt].action ?? []
    this.currentModel = this.prompts[this.currentPrompt].model ?? "Default"
    this.currentTitle = this.prompts[this.currentPrompt].title
    if (save) {
      NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"MNChatglm_config")
    }
  }
  static getUsage() {
    let today = chatAIUtils.getToday()
    this.usage.limit = 100
    if (today !== this.usage.day) {
      this.usage.usage = 0
      this.usage.day = today
    }
    return this.usage
  }
  /**
   * 通用模型源，指没有自定义模型，不需要特殊处理的源
   */
  static generalSource = ["ChatGLM","GLMCoding","KimiChat","KimiCoding","Minimax","Deepseek","SiliconFlow","PPIO","Github","Qwen","Volcengine","Gemini","Metaso","ModelScope","OpenRouter","Qiniu"]
  static allSource(withBuiltIn = false,checkKey = false){
    let allSources = ['Subscription','ChatGPT'].concat(this.generalSource).concat(['Claude','Custom'])
    // let allSources = ['Subscription','ChatGPT','ChatGLM','GLMCoding','KimiChat','Minimax','Deepseek','SiliconFlow','PPIO','Github','Qwen','Volcengine','Gemini','Metaso','ModelScope','OpenRouter','Qiniu','Claude','Custom']
    if (checkKey) {
      allSources = allSources.filter(source=>this.hasAPIKeyInSource(source))
    }
    if (withBuiltIn) {
      allSources.unshift("Built-in")
    }
    return allSources
  }
  static sourceKeyName(source){
    switch (source) {
      case "Deepseek":
        return "deepseekKey"
      case "ChatGLM":
        return "apikey"
      case "GLMCoding":
        return "glmCodingKey"
      case "ChatGPT":
        return "openaiKey"
      case "KimiChat":
        return "moonshotKey"
      case "KimiCoding":
        return "kimiCodingKey"
      case "Minimax":
        return "miniMaxKey"
      case "Custom":
        return "customKey"
      case "Gemini":
        return "geminiKey"
      case "Claude":
        return "claudeKey"
      case "Qwen":
        return "qwenKey"
      case "SiliconFlow":
        return "siliconFlowKey"
      case "ModelScope":
        return "modelScopeKey"
      case "PPIO":
        return "ppioKey"
      case "Qiniu":
        return "qiniuKey"
      case "Volcengine":
        return "volcengineKey"
      case "Github":
        return "githubKey"
      case "Metaso":
        return "metasoKey"
      case "OpenRouter":
        return "openRouterKey"
      default:
        return ""
    }
  }

  /**
   * 
   * @param {string} source 提供商
   * @param {boolean} checkKey 
   * @returns 
   */
  static modelNames(source,checkKey = false){
    let models = this.getModelsFromSource(source)
    let additionalModels = []
    if (checkKey && !this.hasAPIKeyInSource(source)) {//如果对应的提供商的key不存在,就不返回任何模型
      return []
    }
    switch (source) {
      case "Claude":
        return models
      case "ChatGPT":
        if (this.config.customModel.trim()) {
          additionalModels = this.config.customModel.split(",").map(model=>model.trim()).filter(model=>!models.includes(model))
        }
        return models.concat(additionalModels)
      case "Subscription":
        if (this.config.customModel.trim()) {
          additionalModels = this.config.customModel.split(",").map(model=>model.trim()).filter(model=>!models.includes(model))
        }
        return models.concat(additionalModels)
      case "Custom":
        return this.config.customModel.split(",").map(model=>model.trim())
      case "Built-in":
        return [];
      default:
        //通用源
        if (this.generalSource.includes(source)) {
          return models
        }
        chatAIUtils.addErrorLog("Unspported source: "+source, "modelNames")
        return []
    }
  }
  static saveApiKey(apikey,url){
    let source = this.config.source
    MNUtil.showHUD("Save APIKey for "+source)
    let keyName = this.sourceKeyName(source)
    if (keyName) {
      this.config[keyName] = apikey
    }
    switch (source) {
      case "Gemini":
        if (url) {
          this.config.geminiUrl = url
        }
        break;
      case "ChatGPT":
        if (url) {
          this.config.url = url
        }
        break;
      case "Custom":
        if (url) {
          this.config.customUrl = url
        }
        break
      default:
        // chatAIUtils.addErrorLog("Unspported source: "+source, "saveApiKey")
        return
    }
    NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"MNChatglm_config")
    if (chatAIUtils.isSubscribed(false) && this.getConfig("autoExport")) {
      this.export(false)
    }
  }
  static setDynamicModel(source, model, save = true){
    switch (source) {
      case "Claude":
      case "ChatGPT":
      case "Custom":
      case "Subscription":
        if (!model) {
          model = this.getDefaultModel(source)
        }
        this.config.dynamicModel = source+": "+model
        break;
      case "Built-in":
        this.config.dynamicModel = "Built-in"
        break;
      default:
        if (this.generalSource.includes(source)) {
          if (!model) {
            model = this.getDefaultModel(source)
          }
          this.config.dynamicModel = source+": "+model
          break;
        }
        chatAIUtils.addErrorLog("Unspported source: "+source, "setDynamicModel")
        return;
    }
    MNUtil.postNotification("dynamicModelChanged", {source: source, model: model})
    save && this.save("MNChatglm_config")
  }
  static setDefaultModel(source = this.config.source, model,save = true){
    this.config.source = source
    if (!model) {
      MNUtil.postNotification("defaultModelChanged", {source: source, model: model})
      save && this.save("MNChatglm_config")
      return
    }
    switch (source) {
      case "ChatGLM":
        this.config.chatglmModel = model
        break;
      case "GLMCoding":
        this.config.glmCodingModel = model
        break;
      case "Claude":
        this.config.claudeModel = model
        break;
      case "Gemini":
        this.config.geminiModel = model
        break;
      case "SiliconFlow":
        this.config.siliconFlowModel = model
        break;
      case "ModelScope":
        this.config.modelScopeModel = model
        break;
      case "PPIO":
        this.config.ppioModel = model
        break;
      case "Qiniu":
        this.config.qiniuModel = model
        break;
      case "OpenRouter":
        this.config.openRouterModel = model
        break;
      case "Volcengine":
        this.config.volcengineModel = model
        break;
      case "Github":
        this.config.githubModel = model
        break;
      case "Metaso":
        this.config.metasoModel = model
        break;
      case "ChatGPT":
        this.config.model = model
        break;
      case "KimiChat":
        this.config.moonshotModel = model
        break;
      case "KimiCoding":
        this.config.kimiCodingModel = model
        break;
      case "Minimax":
        this.config.miniMaxModel = model
        break;
      case "Deepseek":
        this.config.deepseekModel = model
        break;
      case "Qwen":
        this.config.qwenModel = model
        break;
      case "Custom":
        this.config.customModelIndex = model
        break;
      case "Subscription":
        this.config.subscriptionModel = model
        break;
      case "PPIO":
        this.config.ppioModel = model
        break;
      case "Qiniu":
        this.config.qiniuModel = model
        break;
      case "OpenRouter":
        this.config.openRouterModel = model
        break;
      case "Built-in":
        break;
      default:
        chatAIUtils.addErrorLog("Unspported source: "+source, "setDefaultModel")
        return;
    }
    MNUtil.postNotification("defaultModelChanged", {source: source, model: model})
    save && this.save("MNChatglm_config")
  }
  static getDefaultModel(source = this.config.source){
    let models = this.modelNames(source)
    // MNUtil.copyJSON(models)
    let model//有可能是字符串,直接对应模型名,也能是数字,代表模型索引
    switch (source) {
      case "ChatGLM":
        model = this.getConfig("chatglmModel")
        break;
      case "GLMCoding":
        model = this.getConfig("glmCodingModel")
        break;
      case "Claude":
        model = this.getConfig("claudeModel")
        break;
      case "Gemini":
        model = this.getConfig("geminiModel")
        break;
      case "SiliconFlow":
        model = this.getConfig("siliconFlowModel")
        break;
      case "ModelScope":
        model = this.getConfig("modelScopeModel")
        break;
      case "PPIO":
        model = this.getConfig("ppioModel")
        break;
      case "Qiniu":
        model = this.getConfig("qiniuModel")
        break;
      case "OpenRouter":
        model = this.getConfig("openRouterModel")
        break;
      case "Volcengine":
        model = this.getConfig("volcengineModel")
        break;
      case "Github":
        model = this.getConfig("githubModel")
        break;
      case "Metaso":
        model = this.getConfig("metasoModel")
        break;
      case "ChatGPT":
        model = this.getConfig("model")
        break;
      case "KimiChat":
        model = this.getConfig("moonshotModel")
        break;
      case "KimiCoding":
        model = this.getConfig("kimiCodingModel")
        break;
      case "Minimax":
        model = this.getConfig("miniMaxModel")
        break;
      case "Deepseek":
        model = this.getConfig("deepseekModel")
        break;
      case "Qwen":
        model = this.getConfig("qwenModel")
        break;
      case "Custom":
        model = this.getConfig("customModelIndex")
        break;
      case "Subscription":
        model = this.getConfig("subscriptionModel")
        break;
      case "Built-in":
        let keyInfo = chatAIConfig.keys["key"+chatAIConfig.getConfig("tunnel")]
        return keyInfo.model
      default:
        chatAIUtils.addErrorLog("Unspported source: "+source, "getDefaultModel")
        return undefined;
    }
    // MNUtil.copyJSON(models)
    if (typeof model === "number") {
      if (model >= models.length) {
        model = 0
      }
      return models[model]
    }
    if (typeof model === "string") {
      return model
    }
    return undefined
  }
  /**
   * 解析model格式,返回一个对象
   * 这里的model是model:source格式的
   * @param {string} model 
   */
  static parseModelConfig(model){
    try {
    let config
    // MNUtil.copy("Model: " + model)
    let modelConfig = model.split(":").map(m=>m.trim())
    if (modelConfig.length === 1 && modelConfig[0] !== "Default" && modelConfig[0] !== "Built-in") {
      return {model:model}
    }
    if (modelConfig[0] !== "Default") {
      let source = modelConfig[0]
      config = this.getConfigFromSource(source)
      if (modelConfig.length === 2) {
        config.model = modelConfig[1]
      }
      if (modelConfig.length === 3) {
        config.model = modelConfig[1]+":"+modelConfig[2]
      }
    }else{
      config = this.getConfigFromSource()
    }
    if (config.source === "Built-in") {
      let keyInfo = this.keys["key"+this.getConfig("tunnel")]
      config.model = keyInfo.model
    }
    return config
    } catch (error) {
      chatAIUtils.addErrorLog(error, "parseModelConfig")
      return undefined
    }
  }
  static getConfigFromSource(source = this.config.source){
    let config = {source:source}
    config.model = this.getDefaultModel(source)
    let keyName = this.sourceKeyName(source)
    if (keyName) {
      config.key = this.getConfig(keyName)
    }
    switch (source) {
      case "ChatGLM":
        config.url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        return config
      case "GLMCoding":
        config.url = "https://open.bigmodel.cn/api/coding/paas/v4/chat/completions"
        return config
      case "Claude":
        config.url = this.getConfig("claudeUrl")+"/v1/messages"
        return config
      case "Gemini":
        config.url = this.getConfig("geminiUrl")
        if (config.url === "https://generativelanguage.googleapis.com") {
          config.url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
        }
        return config
      case "SiliconFlow":
        config.url = this.getConfig("siliconFlowUrl")
        return config
      case "ModelScope":
        config.url = this.getConfig("modelScopeUrl")
        return config
      case "PPIO":
        config.url = this.getConfig("ppioUrl")
        return config
      case "Qiniu":
        config.url = this.getConfig("qiniuUrl")
        return config
      case "OpenRouter":
        config.url = this.getConfig("openRouterUrl")
        return config
      case "Volcengine":
        config.url = this.getConfig("volcengineUrl")
        return config
      case "Github":
        config.url = this.getConfig("githubUrl")
        return config
      case "Metaso":
        config.url = this.getConfig("metasoUrl")
        return config
      case "ChatGPT":
        config.url = this.getConfig("url")+`/v1/chat/completions`
        return config
      case "KimiChat":
        config.url = "https://api.moonshot.cn/v1/chat/completions"
        return config
      case "KimiCoding":
        config.url = "https://api.kimi.com/coding/v1/chat/completions"
        return config
      case "Minimax":
        config.url = this.getConfig("miniMaxUrl")
        return config
      case "Deepseek":
        config.url = "https://api.deepseek.com/chat/completions"
        return config
      case "Qwen":
        config.url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
        return config
      case "Custom":
        config.url = this.getConfig("customUrl")
        return config
      case "Subscription":
        config.key = subscriptionConfig.config.apikey 
        config.url = subscriptionConfig.config.url + "/v1/chat/completions"
        return config
      case "Built-in":
        let keyInfo = this.keys["key"+this.getConfig("tunnel")]
        if (!keyInfo || !keyInfo.keys) {
          config.key = ""
          return config
        }
        let key = chatAIUtils.getRandomElement(keyInfo.keys)
        if (key === "") {
          config.key = ""
          return config
        }
        if (keyInfo.useSubscriptionURL) {
          config.url = subscriptionConfig.getConfig("url")+ "/v1/chat/completions"
        }else{
          config.url = keyInfo.url
        }
        config.key = key
        return config
      default:
        chatAIUtils.addErrorLog("Unspported source: "+source, "getConfigFromSource")
        return undefined
    }
  }
  static getConfigFromPrompt(prompt = this.currentPrompt){

    if (!(prompt in this.prompts)) {
      return undefined
    }
    let promptConfig = this.prompts[prompt]
  try {
    // MNUtil.copyJSON(promptConfig)
    let promptModel = promptConfig.model
    let config
    if (promptModel) {
      config = this.parseModelConfig(promptModel)
      // let modelConfig = promptModel.split(":").map(model=>model.trim())
      // if (modelConfig[0] !== "Default") {
      //   let source = modelConfig[0]
      //   config = this.getConfigFromSource(source)
      //   if (modelConfig.length === 2) {
      //     config.model = modelConfig[1]
      //   }
      // }else{
      //   config = this.getConfigFromSource()
      // }
    }else{
      config = this.getConfigFromSource()
    }
    config.title = promptConfig.title
    if (promptConfig.func) {
      config.func = promptConfig.func
    }
    if (promptConfig.temperature) {
      config.temperature = promptConfig.temperature
    }
    if (promptConfig.action) {
      config.action = promptConfig.action
    }
    if (promptConfig.toolbarAction) {
      config.toolbarAction = promptConfig.toolbarAction
    }
    return config
    } catch (error) {
      chatAIUtils.addErrorLog(error, "getConfigFromPrompt: "+prompt,promptConfig)
      return undefined
    }
  }
  static getDynmaicConfig(){
    // let promptConfig = this.dynamicPrompt
    let promptModel = this.getConfig("dynamicModel")
    let dynamicFunc = this.getConfig("dynamicFunc")
    let dynamicAction = this.getConfig("dynamicAction")
    let dynamicTemp = this.getConfig("dynamicTemp")
    let dynamicToolbarAction = this.getConfig("dynamicToolbarAction")
    let config = chatAIConfig.parseModelConfig(promptModel)
    config.title = "Dynamic"
    config.temperature = dynamicTemp
    if (dynamicFunc.length) {
      config.func = dynamicFunc
    }
    if (dynamicAction.length){
      config.action = dynamicAction
    }
    if (dynamicToolbarAction) {
      config.toolbarAction = dynamicToolbarAction
    }
    // chatAIUtils.log("getDynmaicConfig", config)
    return config

  }
  /**
   * 
   * @param {NSData} fileData 
   * @param {UIView} filename 
   */
  static exportFile(fileData,filename) {
    fileData.writeToFileAtomically(chatAIUtils.app.tempPath+"/"+filename, false)
    let UTI = "public.sqlite"
    chatAIUtils.app.saveFileWithUti(chatAIUtils.app.tempPath+"/"+filename, UTI)
    let tem = NSData.dataWithContentsOfFile(chatAIUtils.app.dbPath+"/vector.sqlite")
    tem.writeToFileAtomically(chatAIUtils.app.dbPath+"/export.sqlite", false)
  }
  static getOrderNumber(order){
    let orderNumber = `${order[0]}${order[1]}${order[2]}`
    if (order.length === 4) {
      orderNumber = `${order[0]}${order[1]}${order[2]}${order[3]}`
    }
    return orderNumber
  }
  static getOrderText() {
    let order = this.getConfig("searchOrder")
    let orderNumber = this.getOrderNumber(order)
    switch (orderNumber) {
      case "123":
        return 'Order: Title → Excerpt → Comment'
      case "132":
        return 'Order: Title → Comment → Excerpt'
      case "213":
        return 'Order: Excerpt → Title → Comment'
      case "231":
        return 'Order: Excerpt → Comment → Title'
      case "312":
        return 'Order: Comment → Title → Excerpt'
      case "321":
        return 'Order: Comment → Excerpt → Title'
      case "1234":
        return 'Order: Title → Excerpt → Comment'
      case "1324":
        return 'Order: Title → Comment → Excerpt'
      case "2134":
        return 'Order: Excerpt → Title → Comment'
      case "2314":
        return 'Order: Excerpt → Comment → Title'
      case "3124":
        return 'Order: Comment → Title → Excerpt'
      case "3214":
        return 'Order: Comment → Excerpt → Title'
      case "4123":
        return 'Order: MD → Title → Excerpt → Comment'
      case "4132":
        return 'Order: MD → Title → Comment → Excerpt'
      case "4213":
        return 'Order: MD → Excerpt → Title → Comment'
      case "4231":
        return 'Order: MD → Excerpt → Comment → Title'
      case "4312":
        return 'Order: MD → Comment → Title → Excerpt'
      case "4321":
        return 'Order: MD → Comment → Excerpt → Title'
      default:
        return "123";
    }
  }
  static async readEncryptedConfigFromR2(fileName,key){
  try {
    let url = "https://file.feliks.top/"+fileName+"?timestamp="+Date.now()
    // let res = await chatAINetwork.fetch(url)
    // let text = this.data2string(res)
    // return text
    // const headers = {
    //   "Cache-Control": "no-cache"
    // };
    let text = await MNUtil.readTextFromUrlAsync(url)
    if (typeof text === "object" && "statusCode" in text) {
      return text
    }
    if (!text) {
      this.setSyncStatus(false)
      return undefined
    }
    let decodedText = MNUtil.xorEncryptDecrypt(text, key)
    if (MNUtil.isValidJSON(decodedText)) {
      let config = JSON.parse(decodedText)
      return config
    }
    return undefined
  } catch (error) {
    chatAIUtils.addErrorLog(error, "readEncryptedConfigFromR2")
    return undefined
  }
  }
  static async uploadConfigWithEncryptionFromR2(fileName,key,alert = true){
  try {
    // chatAIUtils.log("uploadConfigWithEncryptionFromR2")
    if (!this.getConfig("r2file")) {
      let fileName = NSUUID.UUID().UUIDString()
      this.config.r2file = fileName
      let currentSyncSource = this.getConfig("syncSource")
      if (currentSyncSource === "CFR2") {
        chatAIUtils.chatController.configNoteIdInput.text = fileName
      }
    }
    this.config.lastSyncTime = Date.now()+5
    this.config.modifiedTime = this.config.lastSyncTime
    let text = JSON.stringify(this.getAllConfig())
    let encodedText = MNUtil.xorEncryptDecrypt(text, key)
    await chatAINetwork.uploadFileToR2(encodedText, fileName,alert)
    return true
  } catch (error) {
    chatAIUtils.addErrorLog(error, "uploadConfigWithEncryptionFromR2")
    return false
  }
  }
  static async readEncryptedConfigFromInfi(fileName,key){
  try {
    let url = "https://futtsu.teracloud.jp/dav/mnconfig/"+fileName
    let Authorization = {
      user:"Feliks15145",
      password:"Eeq3dnRy8bV86Zna"
    }
    // let res = await chatAINetwork.fetch(url)
    // let text = this.data2string(res)
    // return text
    // const headers = {
    //   "Cache-Control": "no-cache"
    // };
    // let text = await MNUtil.readTextFromUrlAsync(url)
    let text = await chatAINetwork.readWebDAVFile(url,Authorization.user,Authorization.password)
    // if (MNUtil.isValidJSON(text)) {
    //   let config = JSON.parse(text)
    //   return config
    // }
    // return text

    // let text = await this.readConfigFromWebdav(url,Authorization)
    // MNUtil.copyJSON(text)
    if (typeof text === "object" && "statusCode" in text) {
      return text
    }
    if (!text) {
      this.setSyncStatus(false)
      return undefined
    }
    let decodedText = chatAIUtils.xorEncryptDecrypt(text, key)
    // MNUtil.copy(decodedText)
    if (MNUtil.isValidJSON(decodedText)) {
      let config = JSON.parse(decodedText)
      return config
    }
    return undefined
  } catch (error) {
    MNUtil.copy(error.toString())
    return undefined
  }
  }
  static async uploadConfigWithEncryptionToInfi(fileName,key,alert = true){
    if (!this.getConfig("InfiFile")) {
      let fileName = NSUUID.UUID().UUIDString()
      this.config.InfiFile = fileName
      let currentSyncSource = this.getConfig("syncSource")
      if (currentSyncSource === "Infi") {
        chatAIUtils.chatController.configNoteIdInput.text = fileName
      }
    }
    this.config.lastSyncTime = Date.now()+5
    // this.config.modifiedTime = this.config.lastSyncTime
    let text = JSON.stringify(this.getAllConfig())
    let encodedText = MNUtil.xorEncryptDecrypt(text, key)
    let url = "https://futtsu.teracloud.jp/dav/mnconfig/"+fileName
    let Authorization = {
      user:"Feliks15145",
      password:"Eeq3dnRy8bV86Zna"
    }
    let res = await chatAINetwork.uploadWebDAVFile(url, Authorization.user, Authorization.password, encodedText)
    // await this.uploadConfigToWebdav(encodedText, fileName,Authorization)
  }
  static async uploadConfigWithEncryptionToAlist(config){
    let key = subscriptionConfig.APIKey
    if (!key) {
      return {success:false,error:"No APIKey"}
    }
    let text = typeof config === "string" ? config : JSON.stringify(config)
    let md5 = MNUtil.MD5(text)
    if (md5 === this.preChatDataId) {//不重复上传
      chatAIUtils.log("聊天内容未改变，不重复上传", md5)
      return {success:true,id:md5}
    }
    let encodedText = chatAIUtils.xorEncryptDecrypt(text, key)
    if (!encodedText) {
      return {success:false,error:"Encrypt failed"}
    }
    let url = "https://cdn.u1162561.nyat.app:43836/dav/dl123/chatAIConfig/"+md5
    let Authorization = {
      user:"chat",
      password:"chat"
    }
    let res = await chatAINetwork.uploadWebDAVFile(url, Authorization.user, Authorization.password, encodedText)
    this.preChatDataId = md5
    return {success:true,res:res,id:md5}
    // await this.uploadConfigToWebdav(encodedText, fileName,Authorization)
  }
  static async readEncryptedConfigFrom123(id){
    let key = subscriptionConfig.APIKey
    let url = "https://vip.123pan.cn/1836303614/dl/chatAIConfig/"+id
    let text = await chatAINetwork.fetch(url)
    // MNUtil.log(typeof text)
    let decodedText = chatAIUtils.xorEncryptDecrypt(text, key)
    if (MNUtil.isValidJSON(decodedText)) {
      let config = JSON.parse(decodedText)
      return config
    }
    MNUtil.showHUD("Invalid history file!")
    return undefined
  }
  /**
   * 
   * @param {string} fileName
   * @param {{user:string,password:string}} authorization 
   * @returns 
   */
  static async readConfigFromWebdav(fileName,authorization){
    let url = this.getConfig("webdavFolder")+fileName
    // MNUtil.copyJSON({url:url,user:authorization.user,password:authorization.password})
    // let url = "https://file.feliks.top/565DE95F-ADE9-4CE6-9395-68FFFD4F6708"
    let text = await chatAINetwork.readWebDAVFile(url,authorization.user,authorization.password)
    // chatAINetwork.uploadWebDAVFile(url, username, password, fileContent)
    // let text = await MNUtil.readTextFromUrlAsync(url)
    // let decodedText = MNUtil.xorEncryptDecrypt(text, key)
    if (MNUtil.isValidJSON(text)) {
      let config = JSON.parse(text)
      return config
    }
    return text
  }
  /**
   * 
   * @param {string} fileName
   * @param {{user:string,password:string}} authorization 
   * @returns 
   */
  static async uploadConfigToWebdav(fileName,authorization){
    if (!this.getConfig("webdavFile")) {
      let fileName = NSUUID.UUID().UUIDString()
      this.config.webdavFile = fileName
      let currentSyncSource = this.getConfig("syncSource")
      if (currentSyncSource === "Webdav") {
        chatAIUtils.chatController.configNoteIdInput.text = fileName
      }
    }
    this.config.lastSyncTime = Date.now()+5
    this.config.modifiedTime = this.config.lastSyncTime
    let url = this.getConfig("webdavFolder")+fileName
    let text = JSON.stringify(this.getAllConfig())
    // let encodedText = MNUtil.xorEncryptDecrypt(text, key)
    let res = await chatAINetwork.uploadWebDAVFile(url, authorization.user, authorization.password, text)
    // MNUtil.copy(res)
    // await chatAINetwork.uploadFileToR2(encodedText, fileName)
    if (MNUtil.isValidJSON(res)) {
      let response = JSON.parse(res)
      return response
    }
    return res
  }
/**
 * @param {{name:String,path:String,md5:String}} fileObject
 */
static async getFileIdFromMoonshot (fileObject){
try {

  let fileMd5 = fileObject.md5
  if (this.fileId[fileMd5]) {
    return this.fileId[fileMd5]
  }
  let key = this.config.moonshotKey
  if (!key) {
    MNUtil.showHUD("No Moonshot ApiKey!")
    return undefined
  }
  
  MNUtil.waitHUD("Upload file: "+fileObject.name)
  let res = await chatAINetwork.uploadToMoonshot(fileObject.path,key)
  if ("statusCode" in res && res.statusCode >= 400) {
    if ("data" in res && "error" in res.data && "message" in res.data.error) {
      MNUtil.waitHUD("❌ Upload file failed: "+res.data.error.message)
      MNUtil.delay(1).then(()=>{
        MNUtil.stopHUD()
      })
      let errorMessage = res.data.error.message ?? "Unknown error"
      let errorType = res.data?.error?.type
      if (errorType = "exceeded_current_quota_error") {
        await MNUtil.confirm("🤖 MN ChatAI","Quota exceeded for Moonshot, please recharge\n\nMoonshot额度已用尽，请充值")
        return undefined
      }
      let newError = new Error("Upload file failed: "+errorMessage);
      newError.detail = res
      throw newError;
    }
    MNUtil.waitHUD("❌ Upload file failed: "+res.statusCode)
    MNUtil.delay(1).then(()=>{
      MNUtil.stopHUD()
    })
    return undefined
  }
  let fileId = res.id
  if (!fileId) {
    return undefined
  }
  MNUtil.stopHUD()
  this.fileId[fileMd5] = fileId
  this.save("MNChatglm_fileId")
  return fileId
  
} catch (error) {
  chatAIUtils.addErrorLog(error, "getFileIdFromMoonshot")
  return undefined
}
}
/**
 * @param {{name:String,path:String,md5:String}} fileObject
 */
static deleteFileId(fileObject){
  let fileMd5 = fileObject.md5
  delete this.fileId[fileMd5]
}
/**
 * @param {{name:String,path:String,md5:String}} fileObject
 */
static getLocalFileCache(fileObject){
  let fileMd5 = fileObject.md5
  if (MNUtil.isfileExists(this.dataFolder+"/"+fileMd5+".json")) {
    // let res = MNUtil.readJSON(this.dataFolder+"/"+fileMd5+".json")
    return MNUtil.readJSON(this.dataFolder+"/"+fileMd5+".json")
  }
  return {}
}

/**
 * @param {{name:String,path:String,md5:String}} fileObject
 */
static async getFilePageContents(fileObject,pageRange = undefined){//目前只支持local
  try {
    let fileMd5 = fileObject.md5
    let cachedFile = this.getLocalFileCache(fileObject)
    if ("pdfjsPageContents" in cachedFile) {
      MNUtil.log("read file content from local cache")
      // if (pageRange && "pageNo" in pageRange) {
      //   let pageNo = pageRange.pageNo
      //   let pageContents = cachedFile.pdfjsPageContents
      //   let pageContent = pageContents[pageNo-1]
      //   return pageContent
      // }
      return cachedFile.pdfjsPageContents
    }
    if (!MNUtil.isfileExists(fileObject.path)) {
      return []
    }
    // if (this.fileContent[fileMd5]) {
    //   return JSON.stringify(this.fileContent[fileMd5],null,2)
    // }
    let pageContents = await chatAIUtils.notifyController.getLocalFileContent(fileObject.path)
    if (pageContents.length === 0) {
      return []
    }
    let fileInfo = {
      content:pageContents.join("\n\n"),
      file_type: "application/pdf",
      type: "file",
      filename: fileObject.name,
    }
    let doc = MNUtil.getDocById(fileObject.md5)
    fileInfo.pageCount = doc.pageCount
    cachedFile.pdfjs = fileInfo
    cachedFile.pdfjsPageContents = pageContents
    MNUtil.writeJSON(this.dataFolder+"/"+fileObject.md5+".json", cachedFile)
    // MNUtil.copy(fileInfo)
    return pageContents;
    // return []
  } catch (error) {
    chatAIUtils.addErrorLog(error, "getFilePageContents")
    throw new Error(error.message)
  }
}

static async getFileContentFromLocal(fileObject){
  let cachedFile = this.getLocalFileCache(fileObject)
  if ("pdfjs" in cachedFile && cachedFile.pdfjs.content.trim()) {
    MNUtil.log("read file content from local cache")
    return cachedFile.pdfjs
  }
  //开始本地解析文件
  let pageContents = await chatAIUtils.notifyController.getLocalFileContent(fileObject.path)
  let content = pageContents.join("\n\n")
  if (content.trim()) {
    let fileInfo = {
      content:pageContents.join("\n\n"),
      file_type: "application/pdf",
      type: "file",
      filename: fileObject.name,
    }
    let doc = MNUtil.getDocById(fileObject.md5)
    fileInfo.pageCount = doc.pageCount
    cachedFile.pdfjs = fileInfo
    cachedFile.pdfjsPageContents = pageContents
    //写入本地缓存
    MNUtil.writeJSON(this.dataFolder+"/"+fileObject.md5+".json", cachedFile)
    // MNUtil.copy(fileInfo)
    return fileInfo;
  }
  //如果本地解析失败，则返回空内容
  return undefined
}
static async getFileContentFromMoonshot(fileObject){
try {

  let cachedFile = this.getLocalFileCache(fileObject)
  if ("moonshot" in cachedFile) {
      MNUtil.log("read file content from moonshot cache")
      return cachedFile.moonshot
    }
    let file_id = await this.getFileIdFromMoonshot(fileObject)
    if (!file_id) {
      return undefined
    }
    if (this.fileContent[file_id]) {
      cachedFile.moonshot = this.fileContent[file_id]
      MNUtil.writeJSON(this.dataFolder+"/"+fileObject.md5+".json", cachedFile)
      return this.fileContent[file_id]
    }

    let key = this.config.moonshotKey
    if (!key) {
      MNUtil.showHUD("No Moonshot ApiKey!")
      return undefined
    }
    MNUtil.waitHUD("Get file content: "+fileObject.name)
    let url = `https://api.moonshot.cn/v1/files/${file_id}/content`
    let headers = {
        Authorization: "Bearer "+key,
        "Content-Type": "application/json"
    }
    let res = await MNConnection.fetch(url,
      {
        method: "Get",
        timeout: 60,
        headers: headers
      }
    )
    if ("statusCode" in res && res.statusCode >= 400) {
      if("body" in res && res.body.error && res.body.error.message){
        chatAIUtils.addErrorLog(MNUtil.getStatusCodeDescription(res.statusCode), "getFileContent", res.body.error.message)
      }
      this.deleteFileId(fileObject)
      return await this.getFileContent(fileObject,false)
    }
    // res.file_type = "application/pdf"
    res.filename = fileObject.name
    this.fileContent[file_id] = res
    let doc = MNUtil.getDocById(fileObject.md5)
    res.pageCount = doc.pageCount
    cachedFile.moonshot = res
    // copyJSON(res)
    MNUtil.stopHUD()
    MNUtil.writeJSON(this.dataFolder+"/"+fileObject.md5+".json", cachedFile)
    // MNUtil.copyJSON(res)
    return res;
  
} catch (error) {
  chatAIUtils.addErrorLog(error, "getFileContentFromMoonshot")
  return undefined
}
}
/**
 * @param {{name:String,path:String,md5:String}} fileObject
 * @param {boolean} local
 * @returns {Promise<{content:string,file_type:string,type:string,filename:string,pageCount:number}>}
 */
static async getFileContent(fileObject,local = false){
  try {
    let fileMd5 = fileObject.md5
    let cachedFile = this.getLocalFileCache(fileObject)
    if (local) {
      let fileInfo = await this.getFileContentFromLocal(fileObject)
      if (fileInfo) {
        return fileInfo
      }
      // 如果本地解析失败，则尝试从moonshot获取
      if ("moonshot" in cachedFile) {
        MNUtil.log("read file content from moonshot cache")
        return cachedFile.moonshot
      }
      let key = this.config.moonshotKey
      if (key && fileObject.fileExists) {//如果用户配置了moonshot key，则提示用户是否重新获取
        let confirm = await MNUtil.confirm("🤖 MN ChatAI","File content is empty from local extraction, do you want to retry with moonshot?\n\n本地文档内容抽取失败，是否重新使用Moonshot获取？")
        if (!confirm) {
          // 如果用户选择不重新获取，则返回空内容
          return {
            content:"",
            file_type: "application/pdf",
            type: "file",
            filename: fileObject.name,
          }
        }
        return await this.getFileContentFromMoonshot(fileObject)
      }else{
        chatAIUtils.addErrorLog("getFileContent", "file not exists", fileObject.path)
        return {
          content:"",
          file_type: "application/pdf",
          type: "file",
          filename: fileObject.name,
        }
      }
    }
    let fileInfo = await this.getFileContentFromMoonshot(fileObject)
    chatAIUtils.log("getFileContentFromMoonshot", fileInfo)
    if (!fileInfo) {
        let confirm = await MNUtil.confirm("🤖 MN ChatAI","❌ Moonshot Extraction Failed! Do you want to retry with local extraction?\n\nMoonshot文档内容抽取失败，是否使用本地解析重试？")
        if (!confirm) {
          // 如果用户选择不重新获取，则返回undefined
          return undefined
        }
        return await this.getFileContentFromLocal(fileObject)
    }
    return fileInfo
    // if ("moonshot" in cachedFile) {
    //   MNUtil.log("read file content from local cache")
    //   return cachedFile.moonshot
    // }
    // let file_id = await this.getFileIdFromMoonshot(fileObject)
    // if (!file_id) {
    //   return undefined
    // }
    // if (this.fileContent[file_id]) {
    //   cachedFile.moonshot = this.fileContent[file_id]
    //   MNUtil.writeJSON(this.dataFolder+"/"+fileObject.md5+".json", cachedFile)
    //   return this.fileContent[file_id]
    // }

    // let key = this.config.moonshotKey
    // if (!key) {
    //   MNUtil.showHUD("No Moonshot ApiKey!")
    //   return undefined
    // }
    // MNUtil.waitHUD("Get file content: "+fileObject.name)
    // let url = `https://api.moonshot.cn/v1/files/${file_id}/content`
    // let headers = {
    //     Authorization: "Bearer "+key,
    //     "Content-Type": "application/json"
    // }
    // let res = await MNConnection.fetch(url,
    //   {
    //     method: "Get",
    //     timeout: 60,
    //     headers: headers
    //   }
    // )
    // if ("statusCode" in res && res.statusCode >= 400) {
    //   if("body" in res && res.body.error && res.body.error.message){
    //     chatAIUtils.addErrorLog(MNUtil.getStatusCodeDescription(res.statusCode), "getFileContent", res.body.error.message)
    //   }
    //   this.deleteFileId(fileObject)
    //   return await this.getFileContent(fileObject,false)
    // }
    // // res.file_type = "application/pdf"
    // res.filename = fileObject.name
    // this.fileContent[file_id] = res
    // let doc = MNUtil.getDocById(fileObject.md5)
    // res.pageCount = doc.pageCount
    // cachedFile.moonshot = res
    // // copyJSON(res)
    // MNUtil.stopHUD()
    // MNUtil.writeJSON(this.dataFolder+"/"+fileObject.md5+".json", cachedFile)
    // // MNUtil.copyJSON(res)
    // return res;
  } catch (error) {
    chatAIUtils.addErrorLog(error, "chatAIConfig.getFileContent")
    throw new Error(error.message)
  }
}
}


class chatAINetwork {
  constructor(name) {
    this.name = name;
  }
  static OCRBuffer = {}
  static requestWithURL(url){
    return NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url))
  }
  static genNSURL(url) {
    return NSURL.URLWithString(url)
  }
  static async sendRequest(request){
    const queue = NSOperationQueue.mainQueue()
    return new Promise((resolve, reject) => {
      NSURLConnection.sendAsynchronousRequestQueueCompletionHandler(
        request,
        queue,
        (res, data, err) => {
          let resultString = chatAIUtils.dataToString(data)
          const result = NSJSONSerialization.JSONObjectWithDataOptions(
            data,
            1<<0
          )
          const validJson = NSJSONSerialization.isValidJSONObject(result)
          if (err.localizedDescription){
            // MNUtil.showHUD(err.localizedDescription)
            let error = {error:err.localizedDescription}
            if (validJson) {
              error.data = result
            }else if(resultString){
              error.data = resultString
            }
            resolve(error)
          }
          // MNUtil.log(res.statusCode())
          if (res.statusCode() === 200) {
            // MNUtil.showHUD("OCR success")
          }else{
            let error = {statusCode:res.statusCode()}
            if (validJson) {
              error.data = result
            }else if(resultString){
              error.data = resultString
            }
            resolve(error)
            // MNUtil.showHUD("Error in OCR")
          }
          if (validJson){
            resolve(result)
          }else if(resultString){
            resolve(resultString)
          }
          resolve(result)
        }
      )
  })
  }
  static async fetch (url,options = {}){
    // MNUtil.copy(url)
    const request = this.initRequest(url, options)
    const res = await this.sendRequest(request)
    return res
  }
/**
 * 
 * @param {*} url 
 * @param {*} options 
 * @param {NSData} imageData 
 * @returns 
 */
static initOCRRequest (url,options,imageData) {
  const request = NSMutableURLRequest.requestWithURL(this.genNSURL(url))
  // try {
  request.setHTTPMethod("Post")
  request.httpShouldHandleCookies = false
  // request.setCachePolicy(4)
  // request.setTimeoutInterval(options.timeout ?? 10)
  let boundary = "------------------------PN7UsJiL7Z78DgpbkjKEWE"//NSUUID.UUID().UUIDString()

  const headers = {
    "User-Agent": "curl/8.4.0",
    "Accept-Encoding":"*",
    "Accept-Language":"*",
    "Connection":"close",
    "Content-Type": "multipart/form-data; boundary="+boundary,
    Accept: "*/*"
  }
  request.setAllHTTPHeaderFields({
    ...headers,
    ...(options.headers ?? {})
  })

  
  let body = NSMutableData.new()
  let filePart = NSData.dataWithStringEncoding(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="Snipaste_2024-02-18_00-32-59.png"\r\nContent-Type: image/png\r\n\r\n`, 4)
  body.appendData(filePart)
  body.appendData(imageData)
  
  let endBoundary = NSData.dataWithStringEncoding(`\r\n--${boundary}--\r\n`, 4)
  body.appendData(endBoundary)
  // copy(body.base64Encoding())
  request.setHTTPBody(body)
  return request
}

static initFileRequest (url,options,purpose,fileName,fileData) {
  const request = NSMutableURLRequest.requestWithURL(this.genNSURL(url))
  try {
  request.setHTTPMethod("Post")
  request.setTimeoutInterval(options.timeout ?? 10)
  let boundary = NSUUID.UUID().UUIDString()

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15",
    "Content-Type": "multipart/form-data; boundary="+boundary,
    Accept: "application/json"
  }
  request.setAllHTTPHeaderFields({
    ...headers,
    ...(options.headers ?? {})
  })
  let body = NSMutableData.new()
  let purposeData = NSData.dataWithStringEncoding(purpose, "utf8")
  let purposePart = NSData.dataWithStringEncoding(`
--${boundary}
Content-Disposition: form-data; name="purpose"

`, "utf8")
  let filePart = NSData.dataWithStringEncoding(`
--${boundary}
Content-Disposition: form-data; name="file"; filename="${fileName}"
Content-Type: application/pdf

`, "utf8")
  body.appendData(purposePart)
  body.appendData(purposeData)
  body.appendData(filePart)
  body.appendData(fileData)
  let endBoundary = NSData.dataWithStringEncoding(`--${boundary}--`, "utf8")
  body.appendData(endBoundary)
  request.setHTTPBody(body)
  return request
    } catch (error) {
    MNUtil.showHUD("Error in initFileRequest: "+error)
    return request
  }
}
  /**
   * @param {NSData} image 
   * @returns 
   */
  static async getTextOCR (image,compression = true) {
    try {
      if (compression) {
        image = UIImage.imageWithData(image).jpegData(0.1)
      }
      if (typeof ocrNetwork === 'undefined') {
        //OCR未安装，使用自带OCR
        return await this.freeOCR(image)
      }
      let res = await ocrNetwork.OCR(image)
      // MNUtil.copy(res)
      return res
    } catch (error) {
      chatAIUtils.addErrorLog(error, "getTextOCR",)
      throw error;
    }
  }
  static defaultQueryOfReadImage = `—role—
Image Text Extraction Specialist

—goal—
* For the given image, please directly output the text in the image.

* For any formulas, you must enclose them with dollar signs.

—constrain—
* You are not allowed to output any content other than what is in the image.

—role—
Image Text Extraction Specialist

—goal—
* For the given image, please directly output the text in the image.

* For any formulas, you must enclose them with dollar signs.
* 
—constrain—
* You are not allowed to output any content other than what is in the image.

—example—
$\\phi_{n} = \\frac{f_{0}^{2}h_{n}}{gH\\left(K^{2} - K_{s}^{2} - irK^{2}/k\\bar{u}\\right)}$
`
  /**
   * @param {NSData} image 
   * @returns 
   */
  static async readImage (image,query = this.defaultQueryOfReadImage,compression = true) {
    try {
      if (compression) {
        image = UIImage.imageWithData(image).jpegData(0.1)
      }
      let res = await this.freeReadImage(image,query)
      chatAIUtils.log("readImage",res)
      return res
      // if (typeof ocrNetwork === 'undefined' || !ocrNetwork.readImage) {
      //   //OCR未安装，使用自带OCR
      //   return await this.freeReadImage(image,query)
      // }
      // let res = await ocrNetwork.readImage(image,query)
      // MNUtil.copy(res)
      return res
    } catch (error) {
      chatAIUtils.addErrorLog(error, "readImage",)
      throw error;
    }
  }
static fixOCRResult(ocrResult){
    let convertedText = ocrResult
      .replace(/\$\$\n?/g, '$$$\n')
      .replace(/(\\\[\s*\n?)|(\s*\\\]\n?)/g, '$$$\n')
      .replace(/(\\\(\s*)|(\s*\\\))/g, '$')
      .replace(/```/g,'')
      .replace(/<\|begin_of_box\|>/g,'')
      .replace(/<\|end_of_box\|>/g,'')
    return convertedText
}
/**
 * 允许直接传入base64图片,减少转换耗时
 * @param {string|NSData} imageData
 * @returns {Promise<Object>}
 */
 static async ChatGPTVision(imageData,options= {}) {
  try {
  let prompt = options.prompt ?? this.defaultQueryOfReadImage
  let model = options.model ?? "glm-4v-flash"
  // let keys = ['76ab4fa776ae4dfc97b91c07e73b0747.tcVmN7p0voHpb35C','b9bf21c783bf4207a0f419af4a82fa9c.9guT9c4lY05MgFrC']
  let key = 'sk-S2rXjj2qB98OiweU46F3BcF2D36e4e5eBfB2C9C269627e44'
  // let key = chatAIUtils.getRandomElement(keys)
  // MNUtil.waitHUD("Read Image By "+model)
  MNUtil.showHUD("Read Image By "+model)
  let url = subscriptionConfig.config.url + "/v1/chat/completions"
  // let url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  // let compressedImageData = UIImage.imageWithData(imageData).jpegData(0.1)
  let imageUrl = "data:image/jpeg;base64,"
  if (typeof imageData === "string") {
    imageUrl = imageUrl+imageData
  }else{
    imageUrl = imageUrl+imageData.base64Encoding()
  }
  let history = []
  if (options.system) {
    history.push(chatAIUtils.genSystemMessage(options.system))
  }
  history.push(
    {
      role: "user", 
      content: [
        {
          "type": "text",
          "text": prompt
        },
        {
          "type": "image_url",
          "image_url": {
            "url" : imageUrl
          }
        }
      ]
    }
  )
  let request = this.initRequestForChatGPTWithoutStream(history,key, url, model, 0.1)
    let res = await this.sendRequest(request)
    let ocrResult
    if (res.choices && res.choices.length) {
      ocrResult = res.choices[0].message.content
    }else{
      return undefined
    }
    MNUtil.showHUD("✅ Read Image Success")
    return ocrResult
    // let convertedText = ocrResult
    //   .replace(/\$\$\n?/g, '$$$\n')
    //   .replace(/(\\\[\s*\n?)|(\s*\\\]\n?)/g, '$$$\n')
    //   .replace(/(\\\(\s*)|(\s*\\\))/g, '$')
    //   .replace(/```/g,'')
    // MNUtil.stopHUD()
    // return convertedText
    
  } catch (error) {
    chatAIUtils.addErrorLog(error, "ChatGPTVision")
    throw error;
  }
}

/**
 * @param {string[]} texts 
 * @param {string} query
 * @returns {Promise<Object>}
 */
 static async rerank(texts,query,top_n=10) {
  try {
    MNUtil.log("rerank")
    let keys = [
      'sk-S2rXjj2qB98OiweU46F3BcF2D36e4e5eBfB2C9C269627e44'
    ]
    // let key = chatAIUtils.getRandomElement(keys)
    let key = keys[0]
    let url = subscriptionConfig.URL+"/v1/rerank"
    let model = "Qwen/Qwen3-Reranker-8B"
    let request = this.initRequestForRerank(texts,query,key, url, model,top_n)
    let tem = await this.sendRequest(request)
    let res = tem.results
    // MNUtil.stopHUD()
    return res
    
  } catch (error) {
    chatAIUtils.addErrorLog(error, "rerank")
    throw error;
  }
}
  /**
   * @param {NSData} image 
   * @returns 
   */
  static async freeOCR(image){
    let imageBase64 = image.base64Encoding()
    let MD5 = chatAIUtils.MD5(imageBase64)
    if (MD5 in this.OCRBuffer) {
      // MNUtil.showHUD("Read from buffer...")
      // let sourcesForAction = ["Doc2X","SimpleTex"]
      let res = this.OCRBuffer[MD5]
      return res
    }

    let res = await this.ChatGPTVision(imageBase64)
    res = this.fixOCRResult(res)
    this.OCRBuffer[MD5] = res
    MNUtil.stopHUD()
    return res
  }
  /**
   * @param {NSData} image 
   * @returns 
   */
  static async freeReadImage(image,query = this.defaultQueryOfReadImage){
    let imageBase64 = image.base64Encoding()
    // let MD5 = chatAIUtils.MD5(imageBase64+query)
    // if (MD5 in this.OCRBuffer) {
    //   // MNUtil.showHUD("Read from buffer...")
    //   // let sourcesForAction = ["Doc2X","SimpleTex"]
    //   let res = this.OCRBuffer[MD5]
    //   return res
    // }
    let system = `# Core Directive: Respond Fast, Be to the Point
You are an efficient AI visual analysis assistant. Your responses must be generated as quickly as possible, so brevity is the top priority.
# Response Guidelines
1.  **Answer Immediately**: Omit all preambles and conclusions. Start directly with the answer to the user's question.
    *   *Example*: If the user asks, "How many people are in the picture?", respond directly with "There appear to be 3 people in the image." instead of "Okay, I have analyzed the image. Based on my observation, there appear to be 3 people in the image."
2.  **Refine Information**: Provide only the core information the user asked for. If the user doesn't ask a specific question, summarize the image's main subject in a single, short sentence.
    *   *Example*: If the user asks, "What breed is this dog?", simply answer "The dog looks like a Golden Retriever." You do not need to add that it is playing with a ball on the grass.
3.  **Prioritize Plain Text**: Use short sentences. Only use simple bullet points (-) when listing several distinct items is necessary for clarity.`

    let res = await this.ChatGPTVision(imageBase64,{prompt:query,model:"qwen3-omni-flash",system:system})
    // this.OCRBuffer[MD5] = res
    MNUtil.stopHUD()
    return res
  }
 static async fetchModelConfig () {
  let url = `https://vip.123pan.cn/1836303614/dl/new-api/model.json`
   try {
    let option = {
      method: "Get",
      timeout: 60,
      headers:{
        "Cache-Control": "no-cache"
      }
    }
    let res = await this.fetch(url,option)
    if ("statusCode" in res && res.statusCode >= 400) {
      url = `https://cdn.u1162561.nyat.app:43836/d/cdn/mnaddonStore/model.json`
      res = await this.fetch(url,option)
    }
    if ("statusCode" in res && res.statusCode >= 400) {
      url = `https://qiniu.feliks.top/model.json`
      res = await this.fetch(url,option)
    }
    
    if ("statusCode" in res && res.statusCode >= 400) {
      return undefined
    }
    // MNUtil.copy(res)
    return res.modelConfig;
  } catch (error) {
    chatAIUtils.addErrorLog(error, "fetchModelConfig")

    return undefined
  }
  }
//备用，使用服务器而不是R2
  static async fetchKeys0 () {
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer sk-gSrzDAH7TBrRCcOaCaFe8f159cAa4a57B7DaCd929f647a0d"
    }

    let body = {
      "model":"share",
      "messages":[{"role": "user", "content": "mnaddon"}]
    }
    let url = subscriptionConfig.getConfig("url")+ "/v1/chat/completions"
    let options = {
        method: "POST",
        headers: headers,
        timeout: 60,
        json: body
      }
    try {
      const res = await this.fetch(url,options)
      return res;
    } catch (error) {
      MNUtil.showHUD(error)

      return undefined
    }
  }
  /**
   * 123云盘直链
   * @returns 
   */
  static async fetchKeys () {
  try {
    let url = `https://vip.123pan.cn/1836303614/dl/new-api/model.json`
    let option = {
      method: "Get",
      timeout: 60,
      headers:{
        "Cache-Control": "no-cache"
      }
    }
    let res = await this.fetch(url,option)
    // MNUtil.log({message:"fetchKeys",detail:res})
    if ("statusCode" in res && res.statusCode >= 400) {
      url = `https://cdn.u1162561.nyat.app:43836/d/cdn/mnaddonStore/model.json`
      res = await this.fetch(url,option)
    }
    if ("statusCode" in res && res.statusCode >= 400) {
      url = `https://qiniu.feliks.top/model.json`
      res = await this.fetch(url,option)
    }
    
    if ("statusCode" in res && res.statusCode >= 400) {
      // chatAIConfig.modelConfig = undefined

      return undefined
    }
    // MNUtil.copy(res)
    let modelConfig = res.modelConfig
    let shareKeys = res.share
    if (shareKeys && "message" in shareKeys) {
      chatAIConfig.keys = shareKeys
      chatAIConfig.save('MNChatglm_builtInKeys',true,false)
    }
    if (modelConfig && "Github" in modelConfig) {
      let today = chatAIUtils.getToday()
      modelConfig.refreshDay = today
      chatAIConfig.modelConfig = modelConfig
      chatAIConfig.save("MNChatglm_modelConfig",true,false)
    }
    return {modelConfig,shareKeys};
  } catch (error) {
    chatAIUtils.addErrorLog(error, "fetchKeys")
    return undefined
  }
  }

  static initRequest(url,options) {
    const request = this.requestWithURL(url)
    request.setHTTPMethod(options.method ?? "GET")
    request.setTimeoutInterval(options.timeout ?? 10)
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15",
      "Content-Type": "application/json",
      Accept: "application/json"
    }
    request.setAllHTTPHeaderFields({
      ...headers,
      ...(options.headers ?? {})
    })
    if (options.search) {
      request.setURL(
        this.genNSURL(
          `${url.trim()}?${Object.entries(options.search).reduce((acc, cur) => {
            const [key, value] = cur
            return `${acc ? acc + "&" : ""}${key}=${encodeURIComponent(value)}`
          }, "")}`
        )
      )
    } else if (options.body) {
      request.setHTTPBody(NSData.dataWithStringEncoding(options.body, 4))
    } else if (options.form) {
      request.setHTTPBody(
        NSData.dataWithStringEncoding(
          Object.entries(options.form).reduce((acc, cur) => {
            const [key, value] = cur
            return `${acc ? acc + "&" : ""}${key}=${encodeURIComponent(value)}`
          }, ""),
          4
        )
      )
    } else if (options.json) {
      request.setHTTPBody(
        NSJSONSerialization.dataWithJSONObjectOptions(
          options.json,
          1
        )
      )
    }
    return request
  }
  static async getUsage(authorization,string) {
    let url = chatAIConfig.config.url
    let urlSubscription = url+'/v1/dashboard/billing/subscription'
    let urlUsage = url+"/v1/dashboard/billing/usage"

    let key = chatAIConfig.config.openaiKey
    if (key.trim() === "") {
      MNUtil.showHUD("no api key")
      return
    }
    let headers = {
        'Authorization': 'Bearer '+key,
        "Content-Type": "application/json"
    }
    let usage = {}
    const res = await this.fetch(urlUsage,
      {
        method: "GET",
        timeout: 60,
        headers: headers
      }
    )
    usage.usage = res.total_usage
    const total = await this.fetch(urlSubscription,
      {
        method: "GET",
        timeout: 60,
        headers: headers
      }
    )
    usage.total = total.hard_limit_usd
    return usage;
  }
/**
 * 
 * @param {*} fullPath 
 * @returns {Promise<{object:String,status:String,id:String,purpose:String,bytes:Number,filename:String}>}
 */
  static async uploadToMoonshot(fullPath,key) {
  let fileData = chatAIUtils.getFile(fullPath)
  if (!fileData) {
    return {}
  }
  let fileSizeWithMB = fileData.length()/1048576
  if (fileSizeWithMB >= 100) {
    let confirm = await MNUtil.confirm("🤖 MN ChatAI",`File is too large (${fileSizeWithMB} MB), do you want to continue?\n\n文件太大（${fileSizeWithMB} MB），是否继续上传？`)
    if (!confirm) {
      return {}
    }
  }
  // function sanitizeFileName(fileName) {
  //     // 定义一个包含所有需要替换的字符的正则表达式
  //     const invalidChars = /[\/\\:*?"<>|%+，。、；‘’“”【】{}《》！？（）￥——·~]/g;
    
  //     // 用下划线替换所有不合法的字符
  //     const sanitizedFileName = fileName.replace(invalidChars, '_');
  //     return sanitizedFileName;
  // }
  // fileName = sanitizeFileName(fileName)
  // copy("length:"+fileSizeWithMB+"MB")
  // showHUD("length:"+fileData.length())
  // let fileName = (fullPath)
  // let fileName = MNUtil.getFileName(fullPath)+".pdf"
  let fileName = `doc_${Date.now()}.pdf`
  const headers = {
    Authorization: "Bearer "+key
  }

  let url = "https://api.moonshot.cn/v1/files"
  // copyJSON(body)
  // showHUD(fileName)
  const request = this.initFileRequest(url, {
      headers: headers,
      timeout: 60
    },
    "file-extract",
    fileName,
    fileData)
  let res = await this.sendRequest(request)
  return res
//   const queue = NSOperationQueue.mainQueue()

//   return new Promise((resolve, reject) => {
    
//   NSURLConnection.sendAsynchronousRequestQueueCompletionHandler(
//     request,
//     queue,
//     (res, data, err) => {
//       if (err.localizedDescription){
//         showHUD(err.localizedDescription)
//         reject()
//       }
//       // if (data.length() === 0) resolve({})
//       const result = NSJSONSerialization.JSONObjectWithDataOptions(
//         data,
//         1<<0
//       )
//       if (NSJSONSerialization.isValidJSONObject(result)){
//         // showHUD(result)
//         // copyJSON(result)
//         resolve(result)
//       }
//       resolve(result)
//       // showHUD(result)
//     }
//   )
//   })
}
  static getAuthorization(apikey) {
    let header = JSON.stringify({"alg":"HS256","sign_type":"SIGN"})
    let payload =JSON.stringify({
      "api_key": apikey.split(".")[0],
      "exp": Date.now()+60000,
      "timestamp": Date.now()
    });
    let secretSalt = apikey.split(".")[1];
    let before_sign = this.base64UrlEncode(CryptoJS.enc.Utf8.parse(header)) + '.' + this.base64UrlEncode(CryptoJS.enc.Utf8.parse(payload));

    let  signature =CryptoJS.HmacSHA256(before_sign, secretSalt);
     signature = this.base64UrlEncode(signature);

    let final_sign = before_sign + '.' + signature;
    return final_sign
  }
   //和普通base64加密不一样
  static base64UrlEncode(str) {
     var encodedSource = CryptoJS.enc.Base64.stringify(str);
     var reg = new RegExp('/', 'g');
     encodedSource = encodedSource.replace(/=+$/,'').replace(/\+/g,'-').replace(reg,'_');
     return encodedSource;
  }
  static async uploadFileToR2(text, fileName, msg = true) {
    try {
      
    let textData = NSData.dataWithStringEncoding(text,4)
    let bucketName = 'test'
    var accessKeyId = 'a4dd38e9a43edd92e7c0a29d90fceb38';
    var secretAccessKey = 'c7f0d5fdf94a12e203762c1b536f49fd1accb9c9ea7bb0e4810e856bb27ac9e7';
    var endpointUrl = 'https://45485acd4578c553e0570e10e95105ef.r2.cloudflarestorage.com';
    var region = 'auto';
    var service = 's3';
    var urlString = endpointUrl + '/' + bucketName + '/' + fileName;
    let url = MNUtil.genNSURL(urlString);
    var request = NSMutableURLRequest.requestWithURL(url);
    request.setHTTPMethod('PUT');
    // 设置认证头
    var date = new Date();
    var amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    // amzDate = '20240614T154746Z'
    var shortDate = amzDate.substr(0, 8);
    var scope = shortDate + '/' + region + '/' + service + '/aws4_request';
    var host = '45485acd4578c553e0570e10e95105ef.r2.cloudflarestorage.com'
    // var payloadHash = CryptoJS.SHA256(imageData).toString(CryptoJS.enc.Hex);
    // payloadHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    var payloadHash = 'UNSIGNED-PAYLOAD'
    var canonicalUri = '/' + bucketName + '/' + fileName;
    var canonicalRequest = 'PUT\n' + canonicalUri + '\n\n' +
        'host:' + host + '\n' +
        'x-amz-content-sha256:'+payloadHash+'\n' +
        'x-amz-date:' + amzDate + '\n\n' +
        'host;x-amz-content-sha256;x-amz-date\n' +
        payloadHash;

    var hashedCanonicalRequest = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);

    var stringToSign = 'AWS4-HMAC-SHA256\n' + amzDate + '\n' + scope + '\n' + hashedCanonicalRequest;
    var dateKey = CryptoJS.HmacSHA256(shortDate, 'AWS4' + secretAccessKey);
    var dateRegionKey = CryptoJS.HmacSHA256(region, dateKey);
    var dateRegionServiceKey = CryptoJS.HmacSHA256(service, dateRegionKey);
    var signingKey = CryptoJS.HmacSHA256('aws4_request', dateRegionServiceKey);
    var signature = CryptoJS.HmacSHA256(stringToSign, signingKey).toString(CryptoJS.enc.Hex);

    var authorizationHeader = 'AWS4-HMAC-SHA256 Credential=' + accessKeyId + '/' + scope + ', SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=' + signature;

    const headers = {
        "Accept-Encoding":"identity",
        "Authorization": authorizationHeader,
        'X-Amz-Content-SHA256': payloadHash,
        'Host': host,
        "X-Amz-Date": amzDate
    };
    request.setAllHTTPHeaderFields(headers);
    request.setHTTPBody(textData);
    let res = await this.sendRequest(request)
    if (res && "error" in res) {
      
    }else{
      if (msg) {
        MNUtil.showHUD("Upload success!")
      }
    }
    // MNUtil.copyJSON(res)
    return res
    } catch (error) {
      MNUtil.showHUD(error)
    }
}
static btoa(str) {
    // Encode the string to a WordArray
    const wordArray = CryptoJS.enc.Utf8.parse(str);
    // Convert the WordArray to Base64
    const base64 = CryptoJS.enc.Base64.stringify(wordArray);
    return base64;
}
static async readWebDAVFile(url, username, password) {
    const headers = {
      Authorization:'Basic ' + chatAINetwork.btoa(username + ':' + password),
      "Cache-Control": "no-cache"
      };
        const response = await MNConnection.fetch(url, {
            method: 'GET',
            headers: headers
        });
    try {
        // if ("statusCode" in response) {
        //   MNUtil.copyJSON(response)
        // }
        // MNUtil
        if (!response.base64Encoding) {
          return response
        }
        // let text = MNUtil.data2string(response)
        let text = chatAIUtils.dataToString(response)
        return text
        // MNUtil.copy(text)

        // if (!response.ok) {
        //     throw new Error('Network response was not ok: ' + response.statusText);
        // }

        // const text = await response.text();
        // return text;
    } catch (error) {
      chatAIUtils.addErrorLog(error, "readWebDAVFile")
      return response
    }
}
static async uploadWebDAVFile(url, username, password, fileContent) {
    const headers = {
      Authorization:'Basic ' + this.btoa(username + ':' + password),
      "Content-Type":'application/octet-stream'
    };

    try {
        const response = await MNConnection.fetch(url, {
            method: 'PUT',
            headers: headers,
            body: fileContent
        });
        if (!response.base64Encoding) {
          return response
        }
        // let text = MNUtil.data2string(response)
        let text = chatAIUtils.dataToString(response)
        return text
    } catch (error) {
      chatAIUtils.addErrorLog(error, "uploadWebDAVFile")
      return undefined
    }
}
static getOpenAIHeaders(apikey) {
  let key = apikey
  if (/,/.test(apikey)) {
    let apikeys = apikey.split(",").map(item=>item.trim())
    key = chatAIUtils.getRandomElement(apikeys)
  }
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer "+key,
    "Accept": "text/event-stream",
    "HTTP-Referer":"https://github.com/RooVetGit/Roo-Cline",
    "X-Title":"Roo Code",
    "User-Agent":"RooCode/3.30.3"
  }
}
/**
 * Initializes a request for ChatGPT using the provided configuration.
 * 
 * @param {Array} history - An array of messages to be included in the request.
 * @param {string} apikey - The API key for authentication.
 * @param {string} url - The URL endpoint for the API request.
 * @param {string} model - The model to be used for the request.
 * @param {number} temperature - The temperature parameter for the request.
 * @param {Array<number>} funcIndices - An array of function indices to be included in the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static async webSearch (question,apikey) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer "+apikey,
    Accept: "text/event-stream"
  }
    // copyJSON(headers)
  // let body = {
  //   "tool":"web-search-pro",
  //   "messages":[{"role": "user", "content": question}],
  //   "stream":false
  // }
  let searchEngine = chatAIConfig.getConfig("webSearchModel")
  let body = {
    "search_engine":searchEngine,
    "search_query":question,
    "stream":false
  }
  // let url = "https://open.bigmodel.cn/api/paas/v4/tools"
  let url = "https://open.bigmodel.cn/api/paas/v4/web_search"
  // copyJSON(body)

  // MNUtil.copyJSON(body)
  // MNUtil.copy(url)
  let res = await MNConnection.fetch(url,{
      method: "POST",
      headers: headers,
      timeout: 60,
      json: body
    })
    subscriptionNetwork.getKey(searchEngine)
  try {
    return res.search_result
  } catch (error) {
    return res
  }
}


/**
 * Initializes a request for ChatGPT using the provided configuration.
 * 
 * @param {Array} history - An array of messages to be included in the request.
 * @param {string} apikey - The API key for authentication.
 * @param {string} url - The URL endpoint for the API request.
 * @param {string} model - The model to be used for the request.
 * @param {number} temperature - The temperature parameter for the request.
 * @param {Array<number>} funcIndices - An array of function indices to be included in the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static initRequestForChatGPT (history,apikey,url,model,temperature,funcIndices=[]) {
  if (apikey.trim() === "") {
    MNUtil.confirm("MN ChatAI", `❌ APIKey not found!\n\nURL: ${url}\n\nModel: ${model}\n\nPlease check your settings.`)
    return
  }
  const headers = this.getOpenAIHeaders(apikey)
    // copyJSON(headers)
  let body = {
    "model":model,
    "messages":history,
    "stream":true
  }
  body.temperature = temperature
  let tools = chatAITool.getToolsByIndex(funcIndices)
  if (tools.length) {
    body.tools = tools
    body.tool_choice = "auto"
  }
  const request = this.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 600,
      json: body
    })
  return request
}

/**
 * Initializes a request for ChatGPT using the provided configuration.
 * 
 * @param {Array} history - An array of messages to be included in the request.
 * @param {string} apikey - The API key for authentication.
 * @param {string} url - The URL endpoint for the API request.
 * @param {string} model - The model to be used for the request.
 * @param {number} temperature - The temperature parameter for the request.
 * @param {Array<number>} funcIndices - An array of function indices to be included in the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static initRequestForVolcengine (history,apikey,url,model,temperature,funcIndices=[]) {
  if (apikey.trim() === "") {
    MNUtil.confirm("MN ChatAI", `❌ APIKey not found!\n\nURL: ${url}\n\nModel: ${model}\n\nPlease check your settings.`)
    return
  }
  const headers = this.getOpenAIHeaders(apikey)
    // copyJSON(headers)
  let realModel = model
  let extraBody = {}
  let modelRouter = chatAIConfig.getModelRouter("Volcengine")
  if (model in modelRouter) {
    realModel = modelRouter[model].model
    extraBody = modelRouter[model].extraBody
  }
  // switch (model) {
  //   case "doubao-seed-code":
  //     realModel = "doubao-seed-code-preview-251028"
  //     break;
  //   case "doubao-seed-code-nothinking":
  //     realModel = "doubao-seed-code-preview-251028"
  //     extraBody.thinking = {"type":"disabled"}
  //     break;
  //   case "doubao-seed-1-6":
  //     realModel = "doubao-seed-1-6-251015"
  //     break;
  //   case "doubao-seed-1-6-nothinking":
  //     realModel = "doubao-seed-1-6-251015"
  //     extraBody.reasoning_effort = "minimal"
  //     break;
  //   case "doubao-seed-1-6-minimal":
  //     realModel = "doubao-seed-1-6-251015"
  //     extraBody.reasoning_effort = "minimal"
  //     break;
  //   case "doubao-seed-1-6-low":
  //     realModel = "doubao-seed-1-6-251015"
  //     extraBody.reasoning_effort = "low"
  //     break;
  //   case "doubao-seed-1-6-medium":
  //     realModel = "doubao-seed-1-6-251015"
  //     extraBody.reasoning_effort = "medium"
  //     break;
  //   case "doubao-seed-1-6-high":
  //     realModel = "doubao-seed-1-6-251015"
  //     extraBody.reasoning_effort = "high"
  //     break;
  //   case "doubao-seed-1-6-thinking":
  //     realModel = "doubao-seed-1-6-thinking-250715"
  //     break;
  //   case "doubao-seed-1-6-lite":
  //     realModel = "doubao-seed-1-6-lite-251015"
  //     break;
  //   case "doubao-seed-1-6-lite-nothinking":
  //     realModel = "doubao-seed-1-6-lite-251015"
  //     extraBody.reasoning_effort = "minimal"
  //     break;
  //   case "doubao-seed-1-6-lite-minimal":
  //     realModel = "doubao-seed-1-6-lite-251015"
  //     extraBody.reasoning_effort = "minimal"
  //     break;
  //   case "doubao-seed-1-6-lite-low":
  //     realModel = "doubao-seed-1-6-lite-251015"
  //     extraBody.reasoning_effort = "low"
  //     break;
  //   case "doubao-seed-1-6-lite-medium":
  //     realModel = "doubao-seed-1-6-lite-251015"
  //     extraBody.reasoning_effort = "medium"
  //     break;
  //   case "doubao-seed-1-6-lite-high":
  //     realModel = "doubao-seed-1-6-lite-251015"
  //     extraBody.reasoning_effort = "high"
  //     break;
  //   case "doubao-seed-1-6-flash":
  //     realModel = "doubao-seed-1-6-flash-250828"
  //     break;
  //   case "doubao-seed-1-6-flash-nothinking":
  //     realModel = "doubao-seed-1-6-flash-250828"
  //     extraBody.thinking = {"type":"disabled"}
  //     break;
  //   case "doubao-seed-1-6-vision":
  //     realModel = "doubao-seed-1-6-vision-250815"
  //     break;
  //   case "doubao-seed-1-6-vision-nothinking":
  //     realModel = "doubao-seed-1-6-vision-250815"
  //     extraBody.thinking = {"type":"disabled"}
  //     break;
  //   default:
  //     break;
  // }
  let body = {
    "model":realModel,
    "messages":history,
    "stream":true,
    ...extraBody
  }
  body.temperature = temperature
  let tools = chatAITool.getToolsByIndex(funcIndices)
  if (tools.length) {
    body.tools = tools
    body.tool_choice = "auto"
  }
  const request = this.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 600,
      json: body
    })
  return request
}

/**
 * Initializes a request for ChatGPT using the provided configuration.
 * 
 * @param {Array} history - An array of messages to be included in the request.
 * @param {string} apikey - The API key for authentication.
 * @param {string} url - The URL endpoint for the API request.
 * @param {string} model - The model to be used for the request.
 * @param {number} temperature - The temperature parameter for the request.
 * @param {Array<number>} funcIndices - An array of function indices to be included in the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static initRequestForChatGLM (history,apikey,url,model,temperature,funcIndices=[]) {
  if (apikey.trim() === "") {
    MNUtil.confirm("MN ChatAI", `❌ APIKey not found!\n\nURL: ${url}\n\nModel: ${model}\n\nPlease check your settings.`)
    return
  }
  const headers = this.getOpenAIHeaders(apikey)
  let realModel = model
  let extraBody = {}
  let modelRouter = chatAIConfig.getModelRouter("ChatGLM")
  if (model in modelRouter) {
    realModel = modelRouter[model].model
    extraBody = modelRouter[model].extraBody
  }
  // switch (model) {
  //   case "glm-4.6-nothinking":
  //     realModel = "glm-4.6"
  //     extraBody.thinking = {"type":"disabled"}
  //     extraBody.tool_stream = true
  //     break;
  //   case "glm-4.6":
  //     realModel = "glm-4.6"
  //     extraBody.tool_stream = true
  //     break;
  //   case "glm-4.5-nothinking":
  //     realModel = "glm-4.5"
  //     extraBody.thinking = {"type":"disabled"}
  //     break;
  //   case "glm-4.5v-nothinking":
  //     realModel = "glm-4.5v"
  //     extraBody.thinking = {"type":"disabled"}
  //     break;
  //   case "glm-4.5-x-nothinking":
  //     realModel = "glm-4.5-x"
  //     extraBody.thinking = {"type":"disabled"}
  //     break;
  //   case "glm-4.5-air-nothinking":
  //     realModel = "glm-4.5-air"
  //     extraBody.thinking = {"type":"disabled"}
  //     break;
  //   case "glm-4.5-airx-nothinking":
  //     realModel = "glm-4.5-airx"
  //     extraBody.thinking = {"type":"disabled"}
  //     break;
  //   case "glm-4.5-flash-nothinking":
  //     realModel = "glm-4.5-flash"
  //     extraBody.thinking = {"type":"disabled"}
  //     break;
  //   default:
  //     break;
  // }
    // copyJSON(headers)
  let body = {
    "model":realModel,
    "messages":history,
    "stream":true,
    ...extraBody
  }
  body.temperature = temperature
  let tools = chatAITool.getToolsByIndex(funcIndices)
  if (tools.length) {
    body.tools = tools
    body.tool_choice = "auto"
  }
  const request = this.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 600,
      json: body
    })
  return request
}

/**
 * Initializes a request for ChatGPT using the provided configuration.
 * 
 * @param {Array} history - An array of messages to be included in the request.
 * @param {string} apikey - The API key for authentication.
 * @param {string} url - The URL endpoint for the API request.
 * @param {string} model - The model to be used for the request.
 * @param {number} temperature - The temperature parameter for the request.
 * @param {Array<number>} funcIndices - An array of function indices to be included in the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static initRequestForKimiCoding (history,apikey,url,model,temperature,funcIndices=[]) {
  if (apikey.trim() === "") {
    MNUtil.confirm("MN ChatAI", `❌ APIKey not found!\n\nURL: ${url}\n\nModel: ${model}\n\nPlease check your settings.`)
    return
  }
  const headers = this.getOpenAIHeaders(apikey)
  let realModel = model
  let extraBody = {}
  let modelRouter = chatAIConfig.getModelRouter("KimiCoding")
  if (model in modelRouter) {
    realModel = modelRouter[model].model
    extraBody = modelRouter[model].extraBody
  }
  // switch (model) {
  //   case "kimi-for-coding-thinking":
  //     realModel = "kimi-for-coding"
  //     extraBody = {
  //       "reasoning_effort": "medium"
  //     }
  //     break;
  //   case "kimi-for-coding-medium":
  //     realModel = "kimi-for-coding"
  //     extraBody = {
  //       "reasoning_effort": "medium"
  //     }
  //     break;
  //   case "kimi-for-coding-high":
  //     realModel = "kimi-for-coding"
  //     extraBody = {
  //       "reasoning_effort": "high"
  //     }
  //     break;
  //   case "kimi-for-coding-low":
  //     realModel = "kimi-for-coding"
  //     extraBody = {
  //       "reasoning_effort": "low"
  //     }
  //     break;
  //   default:
  //     break;
  // }
  // let modelFragment = model.split("-")
  // chatAIUtils.log("modelFragment", modelFragment)
    // copyJSON(headers)
  let body = {
    "model":realModel,
    "messages":history,
    "stream":true,
    ...extraBody
  }
  // if (model !== "deepseek-reasoner") {
  body.temperature = temperature
  let tools = chatAITool.getToolsByIndex(funcIndices)
  if (tools.length) {
    body.tools = tools
    body.tool_choice = "auto"
  }
  const request = this.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 600,
      json: body
    })
  return request
}

/**
 * Initializes a request for ChatGPT using the provided configuration.
 * 
 * @param {Array} history - An array of messages to be included in the request.
 * @param {string} apikey - The API key for authentication.
 * @param {string} url - The URL endpoint for the API request.
 * @param {string} model - The model to be used for the request.
 * @param {number} temperature - The temperature parameter for the request.
 * @param {Array<number>} funcIndices - An array of function indices to be included in the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static initRequestForChatGPTWithoutStream (history,apikey,url,model,temperature,funcIndices=[]) {
  if (apikey.trim() === "") {
    MNUtil.confirm("MN ChatAI", `❌ APIKey not found!\n\nURL: ${url}\n\nModel: ${model}\n\nPlease check your settings.`)
    return
  }
  const headers = this.getOpenAIHeaders(apikey)
  let body = {
    "model":model,
    "messages":history
  }
  // if (model !== "deepseek-reasoner") {
    body.temperature = temperature
    let tools = chatAITool.getToolsByIndex(funcIndices)
    if (tools.length) {
      body.tools = tools
      body.tool_choice = "auto"
    }
  const request = this.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 600,
      json: body
    })
  return request
}
/**
 * Initializes a request for ChatGPT using the provided configuration.
 * 
 * @param {string} prompt - An array of messages to be included in the request.
 * @param {string} apikey - The API key for authentication.
 * @param {string} url - The URL endpoint for the API request.
 * @param {string} model - The model to be used for the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static initRequestForQwenWithoutStream (prompt,apikey,url,model) {
  if (apikey.trim() === "") {
    MNUtil.confirm("MN ChatAI", `❌ APIKey not found!\n\nURL: ${url}\n\nModel: ${model}\n\nPlease check your settings.`)
    return
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer "+apikey,
    Accept: "application/json"
  }
    // copyJSON(headers)
  let body = {
    "model":model,
    "input":{"messages":[
      {
        "role":"user",
        "content":[
          {
            "text":prompt
          }
        ]}
    ]},
    "parameters": {
        "negative_prompt": "",
        "prompt_extend": true,
        "watermark": false,
        "size": "1328*1328"
    }
  }
  const request = this.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 600,
      json: body
    })
  return request
}

/**
 * Initializes a request for ChatGPT using the provided configuration.
 * 
 * @param {Array} history - An array of messages to be included in the request.
 * @param {string} apikey - The API key for authentication.
 * @param {string} url - The URL endpoint for the API request.
 * @param {string} model - The model to be used for the request.
 * @param {number} temperature - The temperature parameter for the request.
 * @param {Array<number>} funcIndices - An array of function indices to be included in the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static initRequestForRerank (texts,query,apikey,url,model,top_n=10) {
  // if (apikey.trim() === "") {
  //   MNUtil.showHUD(model+": No apikey!")
  //   return
  // }
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer "+apikey,
    Accept: "application/json"
  }
    // copyJSON(headers)
  let body = {
    "model":model,
    "query":query,
    "documents":texts,
    "top_n":top_n
  }
  const request = this.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 600,
      json: body
    })
  return request
}

/**
 * Initializes a request for ChatGPT using the provided configuration.
 * 
 * @param {Array} history - An array of messages to be included in the request.
 * @param {string} apikey - The API key for authentication.
 * @param {string} url - The URL endpoint for the API request.
 * @param {string} model - The model to be used for the request.
 * @param {number} temperature - The temperature parameter for the request.
 * @param {Array<number>} funcIndices - An array of function indices to be included in the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static initRequestForCogView (prompt,apikey,url,model,size = "1024x1024") {
  if (apikey.trim() === "") {
    MNUtil.showHUD(model+": No apikey!")
    return
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer "+apikey,
    Accept: "application/json"
  }
    // copyJSON(headers)
  let body = {
    "model":model,
    "prompt":prompt,
    "size":size
  }
  const request = this.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 600,
      json: body
    })
  return request
}

/**
 * Initializes a request for Claude using the provided configuration.
 * 
 * @param {Array} history - An array of messages to be included in the request.
 * @param {string} apikey - The API key for authentication.
 * @param {string} url - The URL endpoint for the API request.
 * @param {string} model - The model to be used for the request.
 * @param {number} temperature - The temperature parameter for the request.
 * @param {Array<number>} funcIndices - An array of function indices to be included in the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static initRequestForClaude(history,apikey,url,model,temperature,funcIndices=[]) {
  try {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key":apikey,
    "anthropic-version":"2023-06-01"
  }
  let body = {
    "model":model,
    "max_tokens": 1024,
    "stream":true
  }
  let system = history.filter(item => item.role === "system")[0]
  // copyJSON(system)
  if (system) {
    body.system = system.content
    body.messages = history.filter(item => item.role !== "system")
  }else{
    body.messages = history
  }

  // copyJSON(body)
  const request = this.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 600,
      json: body
    })
  return request
  } catch (error) {
      chatAIUtils.addErrorLog(error, "initRequestForClaude")
  }
}
 
/**
 * Initializes a request for ChatGPT using the provided configuration.
 * 
 * @param {Array} history - An array of messages to be included in the request.
 * @param {string} apikey - The API key for authentication.
 * @param {string} url - The URL endpoint for the API request.
 * @param {string} model - The model to be used for the request.
 * @param {number} temperature - The temperature parameter for the request.
 * @param {Array<number>} funcIndices - An array of function indices to be included in the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static initRequestForGemini (history,apikey,url,model,temperature,funcIndices=[]) {
  if (apikey.trim() === "") {
    MNUtil.confirm("MN ChatAI", `❌ APIKey not found!\n\nURL: ${url}\n\nModel: ${model}\n\nPlease check your settings.`)
    return
  }
  let key = apikey
  if (/,/.test(apikey)) {
    let apikeys = apikey.split(",").map(item=>item.trim())
    key = chatAIUtils.getRandomElement(apikeys)
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer "+key,
    Accept: "text/event-stream"
  }
  let realModel = model
  let extraBody = {
        "google": {
          "thinking_config": {
            "include_thoughts": true
          }
        }
      }
  let modelRouter = chatAIConfig.getModelRouter("Gemini")
  if (model in modelRouter) {
    realModel = modelRouter[model].model
    extraBody = modelRouter[model].extraBody
  }
  // switch (model) {
  //   case "gemini-3-pro-minimal":
  //     realModel = "gemini-3-pro-preview"
  //     extraBody.google.thinking_config.thinking_budget = 128
  //     break;
  //   case "gemini-2.5-pro-minimal":
  //     realModel = "gemini-2.5-pro"
  //     extraBody.google.thinking_config.thinking_budget = 128
  //     break;
  //   case "gemini-2.5-pro-low":
  //     realModel = "gemini-2.5-pro"
  //     extraBody.google.thinking_config.thinking_budget = 1024
  //     break;
  //   case "gemini-2.5-pro-medium":
  //     realModel = "gemini-2.5-pro"
  //     extraBody.google.thinking_config.thinking_budget = 8192
  //     break;
  //   case "gemini-2.5-pro-high":
  //     realModel = "gemini-2.5-pro"
  //     extraBody.google.thinking_config.thinking_budget = 24576
  //     break;
  //   case "gemini-2.5-flash-nothinking":
  //     realModel = "gemini-2.5-flash"
  //     extraBody.google.thinking_config.thinking_budget = 0
  //     break;
  //   case "gemini-2.5-flash-low":
  //     realModel = "gemini-2.5-flash"
  //     extraBody.google.thinking_config.thinking_budget = 1024
  //     break;
  //   case "gemini-2.5-flash-medium":
  //     realModel = "gemini-2.5-flash"
  //     extraBody.google.thinking_config.thinking_budget = 8192
  //     break;
  //   case "gemini-2.5-flash-high":
  //     realModel = "gemini-2.5-flash"
  //     extraBody.google.thinking_config.thinking_budget = 24576
  //     break;
  //   case "gemini-2.5-flash-lite-nothinking":
  //     realModel = "gemini-2.5-flash-lite"
  //     extraBody.google.thinking_config.thinking_budget = 0
  //     break;
  //   case "gemini-2.5-flash-lite-low":
  //     realModel = "gemini-2.5-flash-lite"
  //     extraBody.google.thinking_config.thinking_budget = 1024
  //     break;
  //   case "gemini-2.5-flash-lite-medium":
  //     realModel = "gemini-2.5-flash-lite"
  //     extraBody.google.thinking_config.thinking_budget = 8192
  //     break;
  //   case "gemini-2.5-flash-lite-high":
  //     realModel = "gemini-2.5-flash-lite"
  //     extraBody.google.thinking_config.thinking_budget = 24576
  //     break;
  //   default:
  //     break;
  // }
    // copyJSON(headers)
  let body = {
    "model":realModel,
    "messages":history,
    "stream":true,
    "extra_body": extraBody
  }
  // if (model !== "deepseek-reasoner") {
    body.temperature = temperature
    let tools = chatAITool.getToolsByIndex(funcIndices)
    if (tools.length) {
      body.tools = tools
      body.tool_choice = "auto"
    }
  const request = this.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 600,
      json: body
    })
  return request
}

/**
 * Generates a request for AI using the provided configuration.
 * 
 * @param {Array} history - An array of messages to be included in the request.
 * @param {string} source - The source of the AI model. Used to get the key and url from the config.
 * @param {string} model - The model to be used for the request.
 * @param {number} temperature - The temperature parameter for the request.
 * @param {Array<number>} funcIndices - An array of function indices to be included in the request.
 * @throws {Error} If the API key is empty or if there is an error during the request initialization.
 */
static genRequestForAI(source,model,history,temperature,funcIndices=[]){
  let request
  let config = chatAIConfig.getConfigFromSource(source)
  switch (source) {
    case "ChatGPT":
    case "Subscription":
    case "Custom":
      request = this.initRequestForChatGPT(history,config.key,config.url,model,temperature,funcIndices)
      return request;
    case "Volcengine":
      request = this.initRequestForVolcengine(history,config.key,config.url,model,temperature,funcIndices)
      return request;
    case "ChatGLM":
      request = this.initRequestForChatGLM(history,config.key,config.url,model,temperature,funcIndices)
      return request;
    case "Claude":
      request = this.initRequestForClaude(history,config.key,config.url,model, temperature)
      return request;
    case "Gemini":
      request = this.initRequestForGemini(history,config.key,config.url,model,temperature,funcIndices)
      return request;
    case "KimiCoding":
      request = this.initRequestForKimiCoding(history,config.key,config.url,model,temperature,funcIndices)
      return request;
    case "Built-in":
      if (!config.key) {
        MNUtil.showHUD("No apikey for built-in mode!")
        return undefined
      }
      request = this.initRequestForChatGPT(history,config.key,config.url,model,temperature,funcIndices)
      return request;
    default:
      if (chatAIConfig.generalSource.includes(source)) {
        request = this.initRequestForChatGPT(history,config.key,config.url,model,temperature,funcIndices)
        return request;
      }
      MNUtil.showHUD("Unsupported source: "+source)
      return undefined
  }
}
}



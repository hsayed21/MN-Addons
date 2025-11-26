class SnipasteHistoryManager {

  static history = []; // 存储历史记录
  static topHistory = []; // 存储置顶的历史记录
  static currentIndex = -1; // 当前索引位置
  static recordedIds = []; // 存储已记录的ID
  static infoForId = {}; // 存储ID对应的详情

  /**
   * 添加历史记录
   * @param {string} type - 记录类型
   * @param {string|number} id - 记录ID
   * @param {object} detail - 记录详情
   * @returns {boolean} 是否成功添加
   */
  static addRecord(type, id, detail) {
  try {

    // // 如果在历史记录中间添加新记录，则删除后面的记录
    // if (this.currentIndex < this.history.length - 1) {
    //   this.history = this.history.slice(0, this.currentIndex + 1);
    // }
    if (this.recordedIds.includes(id)) {
      return false
    }
    this.recordedIds.push(id)
    let info = { type, id }
    info.isTop = false
    if (detail) {
      info.detail = detail
    }
    this.history.unshift(info)
    this.infoForId[id] = info
    return true
    // this.history.push({ type, id ,content});
    // this.currentIndex = this.history.length - 1;
    
  } catch (error) {
    snipasteUtils.addErrorLog(error, "addRecord")
    return false
  }
  }
  static removeRecord(id){
    this.history = this.history.filter(item => item.id !== id)
    this.recordedIds = this.recordedIds.filter(item => item !== id)
  }
  static getLatestHistory(){
    return this.history[0]
  }
  static getLatestHistories(number = 5){
    return this.history.slice(0,number)
  }
  static copy(){
    MNUtil.copy(this.history)
  }
  static getInfoById(id){
    return this.infoForId[id]
  }
  static refreshDetailById(id,detail){
    let info = this.infoForId[id]
    if (info) {
      info.detail = detail
    }
  }
  /**
   * 
   * @param {string} id 
   * @param {NSData} imageData 
   */
  static saveImageById(id,imageData){
    imageData.writeToFileAtomically(MNUtil.cacheFolder+"/"+id+".jpg", false)
  }
  /**
   * 
   * @param {string} id 
   * @returns {NSData}
   */
  static getImageById(id){
    return MNUtil.getFile(MNUtil.cacheFolder+"/"+id+".jpg")
  }

  /**
   * 获取当前记录
   * @returns {object|null} 返回当前记录，如果没有则返回null
   */
  static getCurrent() {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * 清空历史记录
   */
  static clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}

class snipasteUtils{
  static errorLog = []
  static initilized = false
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
    let folderExists = NSFileManager.defaultManager().fileExistsAtPath(extensionFolder+"/marginnote.extension.mnutils/main.js")
    if (!folderExists) {
      snipasteUtils.showHUD("MN Snipaste: Please install 'MN Utils' first!",5)
    }
    return folderExists
  }
  static async delay (seconds) {
    return new Promise((resolve, reject) => {
      NSTimer.scheduledTimerWithTimeInterval(seconds, false, function () {
        resolve()
      })
    })
  }
  /**
   * 
   * @param {string} message 
   * @param {any} detail 
   * @param {["INFO","ERROR","WARNING","DEBUG"]} level 
   */
  static log(message,detail,level = "INFO"){
    MNUtil.log({message:message,detail:detail,source:"MN Snipaste",level:level})
  }
  static init(mainPath){
    if (this.initilized) {
      return
    }
    this.mainPath = mainPath
    this.offset = {}
    if (MNUtil.isIOS()) {
      this.offset = {top:50}
    }else{
      this.offset = {top:35}
    }
    this.initilized = true
  }
  static showHUD(message,duration=2) {
    let app = Application.sharedInstance()
    app.showHUD(message,app.focusWindow,duration)
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
  static async delay (seconds) {
    return new Promise((resolve, reject) => {
      NSTimer.scheduledTimerWithTimeInterval(seconds, false, function () {
        resolve()
      })
    })
  }
  static openURL(url){
    if (!this.app) {
      this.app = Application.sharedInstance()
    }
    this.app.openURL(NSURL.URLWithString(url));
  }
  static copy(text) {
    UIPasteboard.generalPasteboard().string = text
  }
  static async checkMNUtil(alert = false,delay = 0.01){
  try {
    

    if (typeof MNUtil === 'undefined') {//如果MNUtil未被加载，则执行一次延时，然后再检测一次
      //仅在MNUtil未被完全加载时执行delay
      await this.delay(delay)
      if (typeof MNUtil === 'undefined') {
        if (alert) {
          let res = await this.confirm("MN Snipaste:", "Install 'MN Utils' first\n\n请先安装'MN Utils'",["Cancel","Open URL"])
          if (res) {
            this.openURL("https://bbs.marginnote.com.cn/t/topic/49699")
          }
        }else{
          this.showHUD("MN Snipaste: Please install 'MN Utils' first!",5)
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
  static getDocImage(){
    let docMapSplitMode = MNUtil.docMapSplitMode
    if (docMapSplitMode) {//不为0则表示documentControllers存在
      let imageData
      let docControllers = MNUtil.docControllers
      let docNumber = docControllers.length
      for (let i = 0; i < docNumber; i++) {
        const docController = docControllers[i];
        imageData = docController.imageFromSelection()
        if (imageData) {
          return imageData
        }
      }
    }else{
      return undefined
    }
  }
  static checkLogo(){
    if (typeof MNUtil === 'undefined') return false
    if (typeof toolbarConfig !== 'undefined' && toolbarConfig.addonLogos && ("MNSnipaste" in toolbarConfig.addonLogos) && !toolbarConfig.addonLogos["MNSnipaste"]) {
        return false
    }
    return true
  }
  /**
   * 
   * @param {NSData} data 
   */
  static exportFile(data,fileName,UTI){
    data.writeToFileAtomically(MNUtil.tempFolder+"/"+fileName, false)
    MNUtil.saveFile(MNUtil.tempFolder+"/"+fileName, [UTI])
  }
  static dataFromBase64(base64,type = undefined){
    if (type) {
      switch (type) {
        case "pdf":
          if (base64.startsWith("data:application/pdf;base64,")) {
            let pdfData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64))
            return pdfData
          }else{
            let pdfData = NSData.dataWithContentsOfURL(MNUtil.genNSURL("data:application/pdf;base64,"+base64))
            return pdfData
          }
        default:
          break;
      }
    }
    return NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64))
  }
  /**
   * 该方法会弹出文件选择窗口以选择要导入的文档
   * @returns {string} 返回文件md5
   */
  static importPDFFromBase64(pdfBase64,option = {}){
  try {

    let pdfData = this.dataFromBase64(pdfBase64,"pdf")
    if ("filePath" in option) {
      pdfData.writeToFileAtomically(option.filePath, false)
      let md5 = MNUtil.importDocument(option.filePath)
      return md5
    }
    let fileName = option.fileName || ("imported_"+Date.now()+".pdf")
    let folder = option.folder || MNUtil.tempFolder
    let filePath = folder + fileName
    MNUtil.log(filePath)
    pdfData.writeToFileAtomically(filePath, false)
    let md5 = MNUtil.importDocument(filePath)
    return md5
    
  } catch (error) {
    this.addErrorLog(error, "importPDFFromBase64")
    return undefined
  }
  }
  static getImageSize(imageData){
    let image = UIImage.imageWithData(imageData)
    return image.size
  }
  /**
   * 该方法会弹出文件选择窗口以选择要导入的文档
   * @returns {string} 返回文件md5
   */
  static importPDFFromData(pdfData,option = {}){
  try {
    if ("filePath" in option) {
      pdfData.writeToFileAtomically(option.filePath, false)
      let md5 = MNUtil.importDocument(option.filePath)
      return md5
    }
    let fileName = option.fileName || ("imported_"+Date.now()+".pdf")
    let folder = option.folder || MNUtil.tempFolder
    let filePath = folder + fileName
    MNUtil.log(filePath)
    pdfData.writeToFileAtomically(filePath, false)
    let md5 = MNUtil.importDocument(filePath)
    return md5
    
  } catch (error) {
    this.addErrorLog(error, "importPDFFromBase64")
    return undefined
  }
  }
  /**
   * 
   * @param {UIWebView} webview 
   * @param {number} width 
   * @returns {Promise<NSData>}
   */
  static async screenshot(webview,width=1000){
    return new Promise((resolve, reject) => {
      webview.takeSnapshotWithWidth(2000,(snapshot)=>{
        try {
        resolve(snapshot.pngData())
        } catch (error) {
          MNUtil.showHUD(error)
        }
      })
    })
  }
  /**
   * 
   * @param {MNNote} note 
   * @returns {boolean}
   */
  static isPureImageNote(note){
    if (note.noteTitle) {
      return false
    }
    if (note.comments.length) {
      return false
    }
    if (note.excerptPic) {
      if (note.textFirst) {
        return false
      }
      if ("video" in note.excerptPic) {
        return false
      }
      let imageData = MNUtil.getMediaByHash(note.excerptPic.paint)
      let image = UIImage.imageWithData(imageData)
      if (image.size.width === 1 && image.size.height === 1) {
        return false
      }
      return true

    }
    return false
  }
  static getDataFromNote(note,className) {
    let order = [1,2,3]
    let text
    for (let index = 0; index < order.length; index++) {
      const element = order[index];
      switch (element) {
        case 1:
          if (note.noteTitle && note.noteTitle !== "") {
            text = this.wrapText(note.noteTitle,'div',className)
          }
          break;
        case 2:
          if (note.excerptText && note.excerptText !== "" && (!note.excerptPic || note.textFirst)) {
            text = this.wrapText(note.excerptText,'div',className)
          }else{
            if (note.excerptPic && note.excerptPic.paint) {
              let imageData = MNUtil.getMediaByHash(note.excerptPic.paint)
              text = `<img width="100%" src="data:image/jpeg;base64,${imageData.base64Encoding()}"/>`
            }
          }
          break;
        case 3:
          let commentText
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
                  return false
                }else{
                  commentText = comment.q_htext
                  return true
                }
              default:
                return false
            }
          })
          if (commentText && commentText.length) {
            text = this.wrapText(commentText,'div',className)
          }
          break;
        default:
          break;
      }
      if (text) {
        return text
      }
    }
  return "\nEmpty note"
  }
  static getImageHTML(imageData){
    return `<img width="100%" src="data:image/jpeg;base64,${imageData.base64Encoding()}"/>`
  }
  static getLinkToNote(comment){
    let noteURL = comment.text
    let config = MNUtil.parseURL(noteURL)
    let noteId = config.pathComponents[0]
    // this.log("getLinkToNote", config)
    // if (noteURL.includes("summary")) {
    //   noteURL = noteURL.replace("/summary/0","")
    // }
    let note = MNNote.new(noteId)
    if (note) {
      return `<div class="linkToNote"><div class="buttonContainer">${this.getLinkHTML("snipaste://action?noteId="+noteId, "Snipaste")} ${this.getLinkHTML(note.noteURL, "Focus")} ${this.getLinkHTML("snipaste://action?noteId="+noteId+"&target=floatWindow", "Float Window")}</div>${this.getDataFromNote(note,"comment")}</div>`
    }else{
      return ""
    }
  
  }
  static getLinkHTML(url,text,whiteSpace = true){
    if (whiteSpace) {
      return `<a class="link" draggable="false" href="${url}"> ${text} </a>`
    }else{
      return `<a class="link" draggable="false" href="${url}">${text}</a>`
    }
  }
  static getNoteCSS(focusNote,hasAudio = false){
    let noteColor = this.getNoteColor(focusNote.colorIndex)
    let textColor = this.getTextColor()
    let backgroundColor = this.getBackgroundColor()
    let themeHtml = `      
    body{
      background-color: ${backgroundColor};
    }`
    let CSS = `      ${themeHtml}
      .body {
        ${hasAudio?"margin-top: 48px;":""}
        border: 3px solid ${noteColor};
        border-radius: 10px 10px 10px 10px;
        font-size: large;
      }
    .audioContainer {
      position: fixed; /* 固定定位，始终置顶 */
      top: 0; /* 距离顶部 0px */
      left: 0; /* 距离左侧 0px */
      width: 100%; /* 宽度占满屏幕 */
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 8px;
      z-index: 1000; /* 确保层级最高，不被其他元素覆盖 */
      padding: 8px; /* 可选：增加内边距，避免内容贴边 */
      box-sizing: border-box; /* 确保 padding 不影响宽度 */
    }

    audio {
      width: 100%;
      display: block;
    }
        .language-mermaid {
            /* width: 100%; */
            /* height: 100%; */
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0px; 
            box-sizing: border-box;
        }
        .language-mermaid svg {
            /* * SVG 在 viewBox 属性的帮助下，会保持其原始长宽比，
             * 同时缩放到适应这个 100% 的容器尺寸。
             */
            width: 100%;
            height: calc(100% - 40px);
        }
      .link {
        white-space: pre-wrap;
        border-radius: 5px;
        background-color: ${noteColor};
        text-decoration: none;
      }
      .head {
        background-color: ${noteColor};
        border-radius: 6px 6px 0px 0px;
        line-height: 30px;
      }
      img {
        width: 100%;
      }
      .tail {
        height: 10px;
      }
      .title {
        padding-left: 10px;
        padding-bottom: 5px;
        cursor: grab;
        color: ${textColor};
      }
    .excerptContainer {
      white-space: nowrap;
      padding-left: 5px;
      padding-right: 5px;
    }
      .excerpt {
        white-space: pre-line;
        padding-left: 5px;;
        padding-right: 5px;
        cursor: grab;
        color: ${textColor};
      }
    .commentContainer {
      white-space: nowrap;
      padding-left: 5px;
      padding-right: 5px;
      color: ${textColor};
    }
    .comment {
      white-space: pre-line;
      cursor: grab;
    }
      .MathJax{
        color: ${textColor} !important;
      }
      .markdown {
        white-space: normal;
        padding-left: 5px;
        color: ${textColor};
      }
      .markdown ol{
        padding-left: 20px;
      }
      .markdown a {
        color:rgb(23, 116, 202);
        text-decoration: none;
        padding: 2px 6px;
        border-radius: 6px;
        background: rgba(88, 134, 147, 0.3);
        border: 2px solid rgba(66, 153, 220, 0.3);
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        position: relative;
      }
      .markdown a::before {
        content: '↗';
        font-size: 1.2em;
        font-weight: 1000;
        opacity: 0.7;
        transition: opacity 0.2s ease;
      }
      .markdown a:hover {
        background: linear-gradient(135deg, rgba(130, 228, 255, 0.7), rgba(188, 224, 255, 0.57));
        color:rgb(5, 59, 114);
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(160, 160, 113, 0.25);
      }
      .markdown a:hover::after {
        opacity: 1;
      }
      .linkToNote {
        background-color: rgb(162, 162, 162, 20%);
        border-radius: 10px;
        padding: 10px;
        padding-left: 8px;
        margin-bottom: 10px;
        white-space: nowrap;
      }
    .linkToNote .comment {
      white-space: pre-line;
      padding-left: 0px;
    }
      .buttonContainer {
        margin-bottom: 5px;
        white-space: nowrap;
      }
    .linkToNote .buttonContainer {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      border-radius: 8px;
      white-space: normal;
      flex-wrap: wrap;
    }
    .linkToNote .buttonContainer .link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 4px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(122, 122, 122, 0.3), rgba(199, 199, 199, 0.44));
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: ${textColor};
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      transition: background 180ms ease, transform 150ms ease, box-shadow 180ms ease, color 150ms ease;
    }
    .linkToNote .buttonContainer .link:hover {
      background: ${noteColor};
      color: #1c1c1c;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
    }
      `
    return CSS
  }
  static isPureHTMLComment(focusNote){
    if (!focusNote.excerptText && focusNote.comments.length === 1 && focusNote.comments[0].type === "HtmlNote") {
      return true
    }
    return false
  }
  static rgbaArrayToHexArray(rgbaArray, includeAlpha = false, toUpperCase = false) {
  return rgbaArray.map(rgba => {
    // 确保RGB分量在0-255范围内
    const r = Math.max(0, Math.min(255, Math.round(rgba.r)));
    const g = Math.max(0, Math.min(255, Math.round(rgba.g)));
    const b = Math.max(0, Math.min(255, Math.round(rgba.b)));
    
    // 确保alpha分量在0-1范围内
    const a = Math.max(0, Math.min(1, rgba.a));
    
    // 将每个颜色分量转换为两位的十六进制
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');
    
    let hex;
    if (includeAlpha) {
      // 将alpha分量从0-1转换为0-255，然后转换为两位的十六进制
      const aHex = Math.round(a * 255).toString(16).padStart(2, '0');
      // 组合成8位HEX颜色值
      hex = `#${rHex}${gHex}${bHex}${aHex}`;
    } else {
      // 组合成6位HEX颜色值
      hex = `#${rHex}${gHex}${bHex}`;
    }
    
    // 根据参数决定是否转换为大写
    return toUpperCase ? hex.toUpperCase() : hex;
  });
}
  static getCurrentNotebookExcerptColor(){
    let options = MNUtil.currentNotebook.options
    if ("excerptColorTemplate" in options && options.useTopicTool2) {
      let excerptColorTemplate = options.excerptColorTemplate
      let colors = this.rgbaArrayToHexArray(excerptColorTemplate,true)
      return colors
    }else{
      let theme = MNUtil.app.currentTheme
      let colorConfig = {
        Default:["#ffffb4","#ccfdc4","#b4d1fb","#f3aebe","#ffff54","#75fb4c","#55bbf9","#ea3323","#ef8733","#377e47","#173dac","#be3223","#ffffff","#dadada","#b4b4b4","#bd9edc"],
        Dark:["#a0a071","#809f7b","#71839e","#986d77","#a0a032","#479e2c","#33759c","#921c12","#96551c","#204f2c","#0c266c","#771e14","#a0a0a0","#898989","#717171","#77638a"],
        Gary:["#d2d294","#a8d1a1","#94accf","#c88f9d","#d2d244","#5fcf3d","#459acd","#c0281b","#c46f28","#2c683a","#12328e","#9c281c","#d2d2d2","#b4b4b4","#949494","#9c82b5"]
      }
      let colorHexes = (theme in colorConfig)?colorConfig[theme]:colorConfig["Default"]
      return colorHexes
    }
  }
  static getNoteColor(colorIndex){
    let colorHexes = this.getCurrentNotebookExcerptColor()
    if (colorIndex !== undefined && colorIndex >= 0) {
      return colorHexes[colorIndex]
    }
    return "#ffffff"
  }
  static getBackgroundColor(){
    let theme = MNUtil.app.currentTheme
    switch (theme) {
      case "Gray":
        return "#414141"
      case "Dark":
        return "#121212"
      default:
        return "#ffffff"
    }
  }
  static getTextColor(){
    let theme = MNUtil.app.currentTheme
    switch (theme) {
      case "Gray":
        return "#ffffff"
      case "Dark":
        return "rgb(233, 232, 232)"
      default:
        return "#000000"
    }
  }

  /**
   * 
   * @param {string} text 
   * @param {string} type 
   * @param {string} className 
   * @returns 
   */
  static wrapText(text,type,className) {
  if (className) {
    return `<${type} class="${className}" draggable="true" ondragstart="event.dataTransfer.setData('text/plain', this.innerText)" onclick="copyText(this.innerText)">${text}</${type}>`
  }else{
    return `<${type} draggable="true" ondragstart="event.dataTransfer.setData('text/plain', this.innerText)" onclick="copyText(this.innerText)">${text}</${type}>`
  }
}
static getSubFuncScript(){

return `/**
 * 根据指定的 scheme、host、path、query 和 fragment 生成一个完整的 URL Scheme 字符串。
 * URL Scheme 完整格式：scheme://host/path?query#fragment
 *
 * @param {string} scheme - URL scheme，例如 'myapp'。必须提供。
 * @param {string|undefined} [host] - host 部分，例如 'user_profile'。
 * @param {string|string[]|undefined} [path] - path 部分，例如 'view/123'。
 * @param {Object<string, string|number|boolean|object>|undefined} [query] - 查询参数对象。
 * @param {string|undefined} [fragment] - fragment 标识符，即 URL 中 # 后面的部分。
 * @returns {string} - 生成的完整 URL 字符串。
 */
function generateUrlScheme(scheme, host, path, query, fragment) {
  // 1. 处理必须的 scheme
  if (!scheme) {
    console.error("Scheme is a required parameter.");
    return '';
  }
  // 2. 构建基础部分：scheme 和 host
  //    即使 host 为空，也会生成 'scheme://'，这对于 'file:///' 这类 scheme 是正确的
  let url = \`\${scheme}://\${host || ''}\`;

  // 3. 添加 path
  if (path) {
    if (Array.isArray(path)) {
      let pathStr = path.join('/')
      url += \`/\${pathStr.replace(/^\\\/+/, '')}\`;
    }else{
      // 确保 host 和 path 之间只有一个斜杠，并处理 path 开头可能存在的斜杠
      url += \`/\${path.replace(/^\\\/+/, '')}\`;
    }
  }

  // 4. 添加 query 参数
  if (query && Object.keys(query).length > 0) {
    const queryParts = [];
    for (const key in query) {
      // 确保我们只处理对象自身的属性
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        const value = query[key];
        const encodedKey = encodeURIComponent(key);
        // 对值进行编码，如果是对象，则先序列化为 JSON 字符串
        const encodedValue = encodeURIComponent(
          typeof value === "object" && value !== null ? JSON.stringify(value) : value
        );
        queryParts.push(\`\${encodedKey}=\${encodedValue}\`);
      }
    }
    if (queryParts.length > 0) {
      url += \`?\${queryParts.join('&')}\`;
    }
  }

  // 5. 添加 fragment
  if (fragment) {
    // Fragment 部分不应该被编码
    url += \`#\${fragment}\`;
  }

  return url;
}
    /**
     *
     * @param {string} scheme - URL scheme, 例如 'myapp'。
     * @param {string} [host] - 可选的路径或操作名。
     * @param {Object<string, string|number|boolean>} [params] - 查询参数对象。
     */
    function postMessageToAddon(scheme, host, path, params,fragment) {
      let url = generateUrlScheme(scheme,host,path, params,fragment)
      window.location.href = url
    }
/**
 * 将 PNG 或 JPEG 的 Base64 字符串异步转换为 PDF 的 Base64 字符串。
 * @param {string} pngBase64 - 图片的 Base64 字符串 (可以包含 "data:image/..." 前缀，也可以不包含)。
 * @param {boolean} [fitContent=false] - 是否让 PDF 页面大小与图片大小完全一致。true 表示是，false 表示将图片适应到 A4 页面。
 * @returns {Promise<string>} - 一个解析为 PDF Base64 字符串的 Promise。
 */
async function convertPngBase64ToPdfBase64(imageBase64, fitContent = false) {
    // 确保 window.jspdf.jsPDF 存在
    if (typeof window === 'undefined' || !window.jspdf || !window.jspdf.jsPDF) {
        return Promise.reject(new Error("jsPDF 库未加载。请确保在使用此函数前已引入 jsPDF。"));
    }
    const { jsPDF } = window.jspdf;

    return new Promise((resolve, reject) => {
        const img = new Image();
        let imgData = imageBase64;
        const isPng = imageBase64.startsWith('data:image/png;base64,') || (!imageBase64.startsWith('data:') && imageBase64.length % 4 === 0); // A simple check
        const isJpeg = imageBase64.startsWith('data:image/jpeg;base64,');

        // 如果没有数据URI前缀，则根据推断或默认添加一个
        if (!imgData.startsWith('data:image/')) {
            imgData = 'data:image/png;base64,' + imageBase64;
        }

        img.src = imgData;

        img.onload = function() {
            try {
                const imgWidth = this.width;
                const imgHeight = this.height;
                let pdf;

                // 根据 fitContent 参数决定 PDF 的创建方式
                if (fitContent) {
                    // 模式1: PDF 页面大小 = 图片大小
                    // 使用图片的宽高直接作为PDF的页面尺寸，单位为 'pt' (1 pt = 1/72 inch)
                    pdf = new jsPDF({
                        orientation: imgWidth > imgHeight ? 'l' : 'p', // 根据宽高比设置方向
                        unit: 'pt',
                        format: [imgWidth, imgHeight]
                    });
                    // 将图片添加到 (0, 0) 位置，大小与图片原始尺寸一致
                    pdf.addImage(imgData, isJpeg ? 'JPEG' : 'PNG', 0, 0, imgWidth, imgHeight);

                } else {
                    // 模式2: 将图片适应到 A4 页面 (原始逻辑)
                    pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
                    const a4Width = 595.28, a4Height = 841.89;
                    const margin = 20; // 边距

                    // 计算缩放后的图片尺寸以适应A4页面并保留宽高比
                    let pdfImgWidth = imgWidth;
                    let pdfImgHeight = imgHeight;
                    const maxWidth = a4Width - margin * 2;
                    const maxHeight = a4Height - margin * 2;

                    if (pdfImgWidth > maxWidth) {
                        pdfImgWidth = maxWidth;
                        pdfImgHeight = (imgHeight / imgWidth) * pdfImgWidth;
                    }
                    if (pdfImgHeight > maxHeight) {
                        pdfImgHeight = maxHeight;
                        pdfImgWidth = (imgWidth / imgHeight) * pdfImgHeight;
                    }

                    // 计算居中位置
                    const x = (a4Width - pdfImgWidth) / 2;
                    const y = (a4Height - pdfImgHeight) / 2;

                    pdf.addImage(imgData, isJpeg ? 'JPEG' : 'PNG', x, y, pdfImgWidth, pdfImgHeight);
                }

                // 生成 PDF 的 Base64
                const pdfDataUri = pdf.output('datauristring');
                const pdfBase64 = pdfDataUri.split(',')[1];
                resolve(pdfBase64);

            } catch (error) {
                reject(error);
            }
        };

        img.onerror = (err) => {
            reject(new Error("无法加载Base64图片，请检查格式是否正确。"));
        };
    });
}
async function loadHtml2CanvasScriptAsync(url = 'https://vip.123pan.cn/1836303614/dl/cdn/html2canvas.js') {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // 现代浏览器加载成功事件
    script.onload = () => {
      resolve(true); // 加载完成，触发 resolve
    };

    // 兼容旧版 IE 加载成功事件
    script.onreadystatechange = () => {
      if (script.readyState === 'loaded' || script.readyState === 'complete') {
        script.onreadystatechange = null; // 清除事件，避免重复执行
        resolve(true); // IE 下加载完成，触发 resolve
      }
    };

    // 加载失败事件
    script.onerror = () => {
      resolve(false);
    };
    // 将脚本添加到页面中开始加载
    document.head.appendChild(script);
  });
}
/**
 * 计算页面的最大缩放比例。
 * @returns {number} - 计算出的最大安全scale值.
 */
function calculateMaxScale() {
    // 1. 定义一个在所有主流浏览器中都相对安全的最大画布面积常量。
    // 16,777,216 是 4096 * 4096，这是iOS Safari的一个常见限制，非常安全。
    const SAFE_MAX_CANVAS_AREA = 16777216;

    const originalWidth = document.documentElement.scrollWidth;
    const originalHeight = document.documentElement.scrollHeight;
    const originalArea = originalWidth * originalHeight;

    // 3. 计算最大缩放比例
    // scale^2 * originalArea <= SAFE_MAX_CANVAS_AREA
    // scale <= sqrt(SAFE_MAX_CANVAS_AREA / originalArea)
    const maxScale = Math.sqrt(SAFE_MAX_CANVAS_AREA / originalArea);

    // 返回一个稍微向下取整的值以增加保险系数，比如保留两位小数
    return Math.floor(maxScale * 100) / 100;
}
        // 截图函数
async function screenshotToPNGBase64(scale = 4) {
// 检查 html2canvas 是否已加载
  if (typeof html2canvas === 'undefined') {
    let res = await loadHtml2CanvasScriptAsync()
    if (!res) {
      res = await loadHtml2CanvasScriptAsync('https://alist.feliks.top/d/cdn/js/html2canvas.js')
    }
    if (!res) {
      window.location.href = 'snipaste://showhud?message=库尚未加载完成，请稍后再试'
      return;
    }
  }

            console.log('开始截图...');
            const maxScale = calculateMaxScale();
            console.log('最大缩放比例:', maxScale);
            if (scale > maxScale) {
              scale = maxScale
            }

            // 使用 html2canvas 截取整个 body
            // 你可以根据需要调整截图的配置参数
            let canvas = await html2canvas(document.body, {
                scale: scale,
                allowTaint: true, // 允许跨域图片，但可能会污染 canvas
                useCORS: true,    // 尝试使用 CORS 加载图片，避免污染
                scrollY: -window.scrollY, // 确保从页面顶部开始截图
                windowWidth: document.documentElement.scrollWidth, // 使用完整的文档宽度
                windowHeight: document.documentElement.scrollHeight // 使用完整的文档高度
            })
            const image = canvas.toDataURL('image/jpeg',0.8); // 压缩图片大小
            return image
        }
        // 截图函数
        async function captureScreenshot() {
            let image = await screenshotToPNGBase64()
            window.location.href = 'snipaste://copyimage?image='+image
        }
        
        `

}
/**
 * 
 * @param {string} content 
 * @returns {string}
 */
static getFullMermaindHTML(content) {
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
  static getNewLoc(gesture,referenceView = MNUtil.studyView){
    let locationToMN = gesture.locationInView(referenceView)
    if (!gesture.moveDate) {
      gesture.moveDate = 0
    }
    if ((Date.now() - gesture.moveDate) > 100) {
      let translation = gesture.translationInView(referenceView)
      let locationToBrowser = gesture.locationInView(gesture.view.superview)
      // if (gesture.state !== 3 && Math.abs(translation.y)<20 && Math.abs(translation.x)<20) {
      if (gesture.state === 1) {
        gesture.locationToBrowser = {x:locationToBrowser.x-translation.x,y:locationToBrowser.y-translation.y}
        // MNUtil.showHUD(JSON.stringify(gesture.locationToBrowser))
      }
    }
    // MNUtil.showHUD(JSON.stringify(locationToMN))
    if (locationToMN.x <= 0) {
      locationToMN.x = 0
    }
    if (locationToMN.x > referenceView.frame.width) {
      locationToMN.x = referenceView.frame.width
    }
    gesture.moveDate = Date.now()
    // let location = {x:locationToMN.x - self.locationToButton.x-gesture.view.frame.x,y:locationToMN.y -self.locationToButton.y-gesture.view.frame.y}
    let location = {x:locationToMN.x - gesture.locationToBrowser.x,y:locationToMN.y -gesture.locationToBrowser.y}
    location.toMN = locationToMN
    if (location.y <= 0) {
      location.y = 0
    }
    if (location.y>=referenceView.frame.height-15) {
      location.y = referenceView.frame.height-15
    }
    return location
  }
  static addErrorLog(error,source,info){
    MNUtil.showHUD("MN Snipaste Error ("+source+"): "+error)
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
    MNUtil.log({
      type:"MN Snipaste Error ("+source+"): "+error,
      source:"MN Snipaste",
      detail:tem
    })
  }
  static getLatestSelection(){
    if (MNUtil.focusHistory.length > 0) {
      return MNUtil.focusHistory.at(-1)
    }
    return undefined
  }

  static async generateImageUsingCogviewChatCompletion(prompt,model = "cogview-3-flash"){
    let response = {success:true}
    let message = {success:true}
    try {
      let url = subscriptionConfig.URL+"/v1/chat/completions"
      let isFree = (model === "cogview-3-flash")
      if (!isFree && !this.isActivated()) {
        response.success = false
        response.result = "Please activate the subscription or use the free model"
        return response
      }
      let apikey = isFree ? 'sk-S2rXjj2qB98OiweU46F3BcF2D36e4e5eBfB2C9C269627e44' : subscriptionConfig.APIKey

      // MNUtil.showHUD("Generating image...")
      let request = chatAINetwork.initRequestForChatGPTWithoutStream([{"role":"user","content":prompt}], apikey, url, model)
      let res = await chatAINetwork.sendRequest(request)
      // MNUtil.copy(res)
      if ("choices" in res) {
          MNUtil.showHUD("✅ Image generated")
          response.result = res.choices[0].message.content[0].url
          // response.result = res.data.image_urls[0]
          message.response = "Image is created at the following url: "+response.result+"\n please show this image as markdown image"
          // message.response = "Image is created at the following url: "+res.data.image_urls[0]+"\n please show this image as markdown image"
          let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(response.result))
          response.imageData = imageData
        // }
      }else{
        if ("error" in res) {
          response.success = false
          response.result = res.error
          MNUtil.confirm("❌ Image generated failed", response.result)
          message.response = "Failed in generating image: "+response.result
        }else{
          response.success = false
          MNUtil.showHUD("❌ Image generated failed")
          message.response = "Failed in generating image"
        }
      }

    } catch (error) {
      response.success = false
      response.result = error.message
      snipasteUtils.addErrorLog(error, "generateImage")
      MNUtil.showHUD("❌ Image generated failed")
      message.response = "Failed in generating image"
    }
    return response
  }
  static async generateImageViaSubscription(prompt,model,isFree = false) {
     if (model.startsWith("gemini-2.5-flash-image")) {
      model = "gemini-2.5-flash-image-vip"
    }
    let response = {success:true}
    let message = {success:true}
    try {
      if (!isFree && !this.isActivated()) {
        response.success = false
        response.result = "Please activate the subscription or use the free model"
        return response
      }
      let url = subscriptionConfig.URL+"/v1/images/generations"
      let apikey = isFree ? "sk-S2rXjj2qB98OiweU46F3BcF2D36e4e5eBfB2C9C269627e44" :subscriptionConfig.APIKey
      let size = "1024x1024"
      if (model === "qwen-image") {
        size = "1328x1328"
      }
      let request = chatAINetwork.initRequestForCogView(prompt, apikey, url, model,size)
      let res = await chatAINetwork.sendRequest(request)
      // MNUtil.copy(res)
      // MNUtil.log({message:"generateImageViaSubscription",detail:res})
      if ("data" in res) {
        if ("error" in res.data) {
          if (typeof res.data.error === "string") {
            response.result = res.data.error
            response.success = false
          }else{
            response.result = res.data.error.message
            response.success = false
          }
          let confirm = await MNUtil.confirm("🤖 MNChatAI:\n\n❌ Image generated failed", response.result+"\n\n是否切换到智谱CogView-3 Flash?")
          if (confirm) {//使用智谱模型进行生图
            response = this.generateImageUsingCogviewChatCompletion(prompt,model)
            return response;
          }else{
            message.response = "Failed in generating image: "+response.result
            response.success = false
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
          let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(response.result))
          response.imageData = imageData
          return response;
        }
      }else{
        if ("error" in res) {
          response.result = res.error
          let confirm = await MNUtil.confirm("🤖 MNChatAI:\n\n❌ Image generated failed", response.result+"\n\n是否切换到智谱Cogview-4?")
          if (confirm) {//使用智谱模型进行生图
            response = this.generateImageUsingCogviewChatCompletion(prompt,model)
            return response;
          }else{
            message.response = "Failed in generating image: "+response.result
            response.success = false
          }
        }else{
          response.result = res.error
          let confirm = await MNUtil.confirm("🤖 MNChatAI:\n\n❌ Image generated failed", response.result+"\n\n是否切换到智谱Cogview-4?")
          if (confirm) {//使用智谱模型进行生图
            response = this.generateImageUsingCogviewChatCompletion(prompt,model)
            return response;
          }else{
            message.response = "Failed in generating image"
            response.success = false
          }
        }
      }

    } catch (error) {
      snipasteUtils.addErrorLog(error, "generateImageViaSubscription")
      MNUtil.showHUD("❌ Image generated failed")
      message.response = "Failed in generating image"
      response.success = false
    }
    return response
  }
  static async generateImage(prompt,model = "cogview-3-flash"){
    let response = undefined
    switch (model) {
      case "cogview-3-flash":
      case "cogview-4-250304":
        response = await this.generateImageUsingCogviewChatCompletion(prompt,model)
        return response
      case "qwen-image":
        response = await this.generateImageViaSubscription(prompt,model,true)
        return response
      default:
        response = await this.generateImageViaSubscription(prompt,model)
        return response
    }
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
}

class snipasteConfig{
  static imageGeneratorModel = "cogview-3-flash"
  static lastPrompt = ""
}
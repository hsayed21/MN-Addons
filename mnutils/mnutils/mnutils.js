
if (typeof Frame === "undefined") {
  class Frame{
    static gen(x,y,width,height){
      return MNUtil.genFrame(x, y, width, height)
    }
    /**
     * 
     * @param {UIView} view 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    static set(view,x,y,width,height){
      let oldFrame = view.frame
      let frame = view.frame
      if (x !== undefined) {
        frame.x = x
      }else if (view.x !== undefined) {
        frame.x = view.x
      }
      if (y !== undefined) {
        frame.y = y
      }else if (view.y !== undefined) {
        frame.y = view.y
      }
      if (width !== undefined) {
        frame.width = width
      }else if (view.width !== undefined) {
        frame.width = view.width
      }
      if (height !== undefined) {
        frame.height = height
      }else if (view.height !== undefined) {
        frame.height = view.height
      }
      if (!this.sameFrame(oldFrame,frame)) {
        view.frame = frame
      }
    }
    static sameFrame(frame1,frame2){
      if (frame1.x === frame2.x && frame1.y === frame2.y && frame1.width === frame2.width && frame1.height === frame2.height) {
        return true
      }
      return false
    }
    /**
     * 
     * @param {UIView} view 
     * @param {number} x
     */
    static setX(view,x){
      let frame = view.frame
      frame.x = x
      view.frame = frame
    }
    /**
     * 
     * @param {UIView} view 
     * @param {number} y
     */
    static setY(view,y){
      let frame = view.frame
      frame.y = y
      view.frame = frame
    }
    /**
     * 
     * @param {UIView} view
     * @param {number} x 
     * @param {number} y 
     */
    static setLoc(view,x,y){
      let frame = view.frame
      frame.x = x
      frame.y = y
      if (view.width) {
        frame.width = view.width
      }
      if (view.height) {
        frame.height = view.height
      }
      view.frame = frame
    }
    /**
     * 
     * @param {UIView} view 
     * @param {number} width 
     * @param {number} height 
     */
    static setSize(view,width,height){
      let frame = view.frame
      frame.width = width
      frame.height = height
      view.frame = frame
    }
    /**
     * 
     * @param {UIView} view 
     * @param {number} width
     */
    static setWidth(view,width){
      let frame = view.frame
      frame.width = width
      view.frame = frame
    }
    /**
     * 
     * @param {UIView} view 
     * @param {number} height
     */
    static setHeight(view,height){
      let frame = view.frame
      frame.height = height
      view.frame = frame
    }
    /**
     * 
     * @param {UIView} view 
     * @param {number} xDiff
     */
    static moveX(view,xDiff){
      let frame = view.frame
      frame.x = frame.x+xDiff
      view.frame = frame
    }
    /**
     * 
     * @param {UIView} view 
     * @param {number} yDiff
     */
    static moveY(view,yDiff){
      let frame = view.frame
      frame.y = frame.y+yDiff
      view.frame = frame
    }
  }
  globalThis.Frame = Frame
}
class Menu{
  /**
   * 左 0, 下 1，3, 上 2, 右 4
   * @type {number}
   */
  preferredPosition = 2
  /**
   * @type {string[]}
   */
  titles = []
  constructor(sender,delegate,width = undefined,preferredPosition = 2){
    this.menuController = MenuController.new()
    this.delegate = delegate
    this.sender = sender
    this.commandTable = []
    this.menuController.rowHeight = 35
    this.preferredPosition = preferredPosition
    if (width && width >100) {//宽度必须大于100,否则不允许设置,即转为自动宽度
      this.width = width
    }
  }
  static new(sender,delegate,width = undefined,preferredPosition = 2){
    return new Menu(sender,delegate,width,preferredPosition)
  }
  /**
   * @param {object[]} items
   */
  set menuItems(items){
    this.commandTable = items
  }
  get menuItems(){
    return this.commandTable
  }
  /**
   * @param {number} height
   */
  set rowHeight(height){
    this.menuController.rowHeight = height
  }
  get rowHeight(){
    return this.menuController.rowHeight
  }
  /**
   * @param {number} size
   */
  set fontSize(size){
    this.menuController.fontSize = size
  }
  get fontSize(){
    return this.menuController.fontSize
  }
  addMenuItem(title,selector,params = "",checked=false){
    this.commandTable.push({title:title,object:this.delegate,selector:selector,param:params,checked:checked})
  }
  addItem(title,selector,params = "",checked=false){
    this.commandTable.push({title:title,object:this.delegate,selector:selector,param:params,checked:checked})
  }
  addMenuItems(items){
    let fullItems = items.map(item=>{
      if ("object" in item) {
        return item
      }else{
        item.object = this.delegate
        return item
      }
    })
    this.commandTable.push(...fullItems)
  }
  addItems(items){
    let fullItems = items.map(item=>{
      if ("object" in item) {
        return item
      }else{
        item.object = this.delegate
        return item
      }
    })
    this.commandTable.push(...fullItems)
  }
  insertMenuItem(index,title,selector,params = "",checked=false){
    this.commandTable.splice(index,0,{title:title,object:this.delegate,selector:selector,param:params,checked:checked})
  }
  insertMenuItems(index,items){
    let fullItems = items.map(item=>{
      if ("object" in item) {
        return item
      }else{
        item.object = this.delegate
        return item
      }
    })
    this.commandTable.splice(index,0,...fullItems)
  }
  show(autoWidth = false,animate = true){
  try {
    if (autoWidth || !this.width) {//用autoWidth参数来控制是否自动计算宽度,如果menu实例没有width参数,也会自动计算宽度
      let widths = this.commandTable.map(item=>{
        if (item.checked) {
          return MNUtil.strCode(item.title)*9+70
        }else{
          return MNUtil.strCode(item.title)*9+30
        }
      })
      this.width = Math.max(...widths)
      // let titles = this.commandTable.map(item=>item.title)
      // let maxWidth = 0
      // // let maxWidth = this.width
      // titles.forEach(title=>{
      //   let width = MNUtil.strCode(title)*9+30
      //   if (width > maxWidth) {
      //     maxWidth = width
      //   }
      // })
      // this.width = maxWidth
    }

    let position = this.preferredPosition
    this.menuController.commandTable = this.commandTable
    this.menuController.preferredContentSize = {
      width: this.width,
      height: this.menuController.rowHeight * this.menuController.commandTable.length
    };
    // this.menuController.secHeight = 200
    // this.menuController.sections = [{title:"123",length:10,size:10,row:this.commandTable,rows:this.commandTable,cell:this.commandTable}]
    // this.menuController.delegate = this.delegate

    var popoverController = new UIPopoverController(this.menuController);
    let targetView = MNUtil.studyView
    var r = this.sender.convertRectToView(this.sender.bounds,targetView);
    switch (position) {
      case 0:
        if (r.x < 50) {
          position = 4
        }
        break;
      case 1:
      case 3:
        if (r.y+r.height > targetView.frame.height - 50) {
          position = 2
        }
        break;
      case 2:
        if (r.y < 50) {
          position = 3
        }
        break;
      case 4:
        if (r.x+r.width > targetView.frame.width - 50) {
          position = 0
        }
        break;
      default:
        break;
    }
    popoverController.presentPopoverFromRect(r, targetView, position, animate);
    popoverController.delegate = this.delegate
    // this.menuController.menuTableView.dataSource = this.delegate
    Menu.popover = popoverController
  } catch (error) {
    MNUtil.addErrorLog(error, "Menu.show")
  }
  }
  dismiss(){
    if (Menu.popover) {
      Menu.popover.dismissPopoverAnimated(true)
      Menu.popover = undefined
    }
  }
  static item(title,selector,params = "",checked=false){
    return {title:title,selector:selector,param:params,checked:checked}
  }
  static popover = undefined
  static dismissCurrentMenu(animate = true){
    if (this.popover) {
      this.popover.dismissPopoverAnimated(animate)
    }
  }
}
class MNLog {
  static logs = []
  static updateLog(log){
    if (subscriptionUtils.subscriptionController) {
      subscriptionUtils.subscriptionController?.appendLog(log)
    }
  }
  static showLogViewer(){
    subscriptionUtils.subscriptionController.changeViewTo("log")
  }
  static getLogObject(log,defaultLevel="INFO",defaultSource="Default"){
    if (typeof log == "string" || typeof log == "number") {
      log = {
        message:log,
        level:"INFO",
        source:"Default",
        timestamp:Date.now()
      }
      return log
    }
    if (!("message" in log)) {
      log.message = "See detail";
    }
    if ("level" in log) {
      log.level = log.level.toUpperCase();
    }else{
      log.level = defaultLevel;
    }
    if (!("source" in log)) {
      log.source = defaultSource;
    }
    if (!("timestamp" in log)) {
      log.timestamp = Date.now();
    }
    if ("detail" in log) {
      if (typeof log.detail == "object") {
        log.detail = JSON.stringify(log.detail,null,2)
      }
    }else{
      let keys = Object.keys(log)
      if (keys.length !== 0) {
        let keysRemain = keys.filter(key => key != "timestamp" && key != "source" && key != "level" && key != "message")
        if (keysRemain.length) {
          let detail = {}
          keysRemain.forEach(key => detail[key] = log[key])
          log.detail = JSON.stringify(detail,null,2)
        }
      }
    }
    return log
  }
  /**
   * 
   * @param {string|{message:string,level:string,source:string,timestamp:number,detail:string}} log 
   * @returns 
   */
  static log(log,detail = undefined){
    let logObject = this.getLogObject(log)
    if ((typeof log === "string" || typeof log === "number") && detail !== undefined) {
      logObject.detail = detail
    }
    this.logs.push(logObject)
    this.updateLog(logObject)
    if (this.logs.length > 1000) {
      this.logs.shift()
    }
  }
  /**
   * 
   * @param {string|{message:string,source:string,timestamp:number,detail:string}} log 
   * @returns 
   */
  static info(log,source=undefined){
    let logObject = this.getLogObject(log,"INFO",source)
    // MNUtil.copy(logObject)
    this.logs.push(logObject)
    this.updateLog(logObject)
    if (this.logs.length > 1000) {
      this.logs.shift()
    }
  }
  /**
   * 
   * @param {string|{message:string,source:string,timestamp:number,detail:string}} log 
   * @returns 
   */
  static error(log,source=undefined){
    let logObject = this.getLogObject(log,"ERROR",source)
    this.logs.push(logObject)
    this.updateLog(logObject)
    if (this.logs.length > 1000) {
      this.logs.shift()
    }
  }
  /**
   * 
   * @param {string|{message:string,source:string,timestamp:number,detail:string}} log 
   * @returns 
   */
  static debug(log,source=undefined){
    let logObject = this.getLogObject(log,"DEBUG",source)
    this.logs.push(logObject)
    this.updateLog(logObject)
    if (this.logs.length > 1000) {
      this.logs.shift()
    }
  }
  /**
   * 
   * @param {string|{message:string,source:string,timestamp:number,detail:string}} log 
   * @returns 
   */
  static warn(log,source=undefined){
    let logObject = this.getLogObject(log,"WARN",source)
    this.logs.push(logObject)
    this.updateLog(logObject)
    if (this.logs.length > 1000) {
      this.logs.shift()
    }
  }
  static clearLogs(){
    this.logs = []
    subscriptionUtils.subscriptionController.clearLogs()
  }
  /**
   * 和MNUtil.showHUD一样，但是内容会被记录
   * Displays a Heads-Up Display (HUD) message on the specified window for a given duration.
   * 
   * This method shows a HUD message on the specified window for the specified duration.
   * If no window is provided, it defaults to the current window. The duration is set to 2 seconds by default.
   * 
   * @param {string} message - The message to display in the HUD.
   * @param {number} [duration=2] - The duration in seconds for which the HUD should be displayed.
   * @param {UIWindow} [window=this.currentWindow] - The window on which the HUD should be displayed.
   */
  static showHUD(message, duration = 2, view = this.currentWindow) {
    // if (this.onWaitHUD) {
    //   this.stopHUD(view)
    // }
    MNUtil.app.showHUD(message, view, duration);
    this.log(message)
  }
}
class MNUtil {
  /**
   * 是否正在显示alert
   * @type {boolean}
   */
  static onAlert = false
  static themeColor = {
    Gray: UIColor.colorWithHexString("#414141"),
    Default: UIColor.colorWithHexString("#FFFFFF"),
    Dark: UIColor.colorWithHexString("#000000"),
    Green: UIColor.colorWithHexString("#E9FBC7"),
    Sepia: UIColor.colorWithHexString("#F5EFDC")
  }
  /**
   * 缓存图片类型
   * {
   *  "xxxx": "png",
   *  "xxxx": "jpeg",
   * }
   */
  static imageTypeCache = {}
  static popUpNoteInfo = undefined;
  static popUpSelectionInfo = undefined;
  static mainPath
  static initialized = false
  static MNImagePattern = /!\[.*?\]\((marginnote4app\:\/\/markdownimg\/(png|jpeg)\/.*?)(\))/g;
  /**
   * @type {string}
   */
  static extensionPath
  static defaultNoteColors = ["#ffffb4","#ccfdc4","#b4d1fb","#f3aebe","#ffff54","#75fb4c","#55bbf9","#ea3323","#ef8733","#377e47","#173dac","#be3223","#ffffff","#dadada","#b4b4b4","#bd9fdc"]
  static init(mainPath){
    if (this.initialized) {
      return
    }
    this.mainPath = mainPath
    this.extensionPath = mainPath.replace(/\/marginnote\.extension\.\w+/,"")
    this.checkDataDir()
    this.initialized = true
    // MNUtil.copy("text")
    // if (!this.mainPath) {
    //   this.mainPath = mainPath
    //   this.MNUtilVersion = this.getMNUtilVersion()
    //   const renderer = new marked.Renderer();
    //   renderer.code = (code, language) => {
    //     const validLang = hljs.getLanguage(language) ? language : 'plaintext';
    //     const uuid = NSUUID.UUID().UUIDString()
    //     if (validLang === 'plaintext') {
    //       return `<pre><div class="code-header" contenteditable="false"><span>${validLang}</span><button onclick="copyToClipboard('${uuid}')">复制</button></div><code class="hljs ${validLang}"  id="${uuid}">${code}</code></pre>`;
    //     }
    //     const highlightedCode = hljs.highlight(code, { language: validLang }).value;
    //     return `<pre><div class="code-header" contenteditable="false"><span>${validLang}</span><button onclick="copyToClipboard('${uuid}')">复制</button></div><code class="hljs ${validLang}" id="${uuid}">${highlightedCode}</code></pre>`;
    //   };
    //   // renderer.em = function(text) {
    //   //   return text;
    //   // };
    //   // marked.use({ renderer });
    //   marked.setOptions({ renderer });
    // }
  }
  static checkDataDir(){
    let extensionPath = this.extensionPath
    if (extensionPath) {
      let dataPath = extensionPath+"/data"
      if (this.isfileExists(dataPath)) {
        this.log("dataPath exists")
        return
      }
      this.createFolderDev(dataPath)
      // NSFileManager.defaultManager().createDirectoryAtPathAttributes(dataPath, undefined)
    }
  }
  static focusHistory = []
  /**
   * 只记录最近十次的操作
   * @param {string} type
   * @param {{noteId:string,text:string,imageData:NSData,notebookId:string,docMd5:string}} detail 
   */
  static addHistory(type,detail){
    if (this.focusHistory.length>=10) {
      this.focusHistory.shift()
    }
    let history = {type:type,time:Date.now(),...detail}
    this.focusHistory.push(history)
    // MNUtil.copy(this.focusHistory)
  }
  static errorLog = []
  static logs = []
  static addErrorLog(error,source,info){
    MNUtil.showHUD("MN Utils Error ("+source+"): "+error)
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
    this.copyJSON(this.errorLog)
    this.log({
      message:source,
      level:"ERROR",
      source:"MN Utils",
      timestamp:Date.now(),
      detail:tem
    })
  }
  /**
   * 
   * @param {string|{message:string,level:string,source:string,timestamp:number,detail:string}} log 
   * @returns 
   */
  static log(log,detail = undefined){
    if (typeof log == "string" || typeof log == "number") {
      log = {
        message:log,
        level:"INFO",
        source:"Default",
        timestamp:Date.now()
      }
      if (detail !== undefined) {
        if (detail instanceof Response) {
          log.detail = JSON.stringify(detail.asJSONObject(),null,2)
        }else if (typeof detail == "object") {
          log.detail = JSON.stringify(detail,null,2)
        }else{
          log.detail = detail
        }
        
      }
      MNLog.logs.push(log)
      // MNUtil.copy(this.logs)
        if (subscriptionUtils.subscriptionController) {
          subscriptionUtils.subscriptionController?.appendLog(log)
        }
      return
    }
    if (!("message" in log)) {
      log.message = "See detail";
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
    if ("detail" in log) {
      if (typeof log.detail == "object") {
        log.detail = JSON.stringify(log.detail,null,2)
      }
    }else{
      let keys = Object.keys(log)
      if (keys.length !== 0) {
        let keysRemain = keys.filter(key => key != "timestamp" && key != "source" && key != "level" && key != "message")
        if (keysRemain.length) {
          let detail = {}
          keysRemain.forEach(key => detail[key] = log[key])
          log.detail = JSON.stringify(detail,null,2)
        }
      }
    }
    MNLog.logs.push(log)
    if (subscriptionUtils.subscriptionController) {
      subscriptionUtils.subscriptionController?.appendLog(log)
    }
    if (MNLog.logs.length > 1000) {
      MNLog.logs.shift()
    }
  }

  static clearLogs(){
    this.logs = []
    subscriptionUtils.subscriptionController.clearLogs()
  }
static btoa(str) {
    // Encode the string to a WordArray
    const wordArray = CryptoJS.enc.Utf8.parse(str);
    // Convert the WordArray to Base64
    const base64 = CryptoJS.enc.Base64.stringify(wordArray);
    return base64;
}
static atob(str) {
  // 补全 Base64 字符串
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 2: output += '=='; break;
    case 3: output += '='; break;
  }

  try {
    // 尝试 UTF-8 解码
    return CryptoJS.enc.Base64.parse(output).toString(CryptoJS.enc.Utf8);
  } catch (e) {
    // 如果失败，回退到 Latin1（二进制兼容）
    return CryptoJS.enc.Base64.parse(output).toString(CryptoJS.enc.Latin1);
  }
}

/**
 * 直接从 Base64 格式的 Data URL 判断文件格式
 * @param {string} base64Url - Base64 Data URL（如 data:application/octet-stream;base64,...）
 * @returns {string} 文件格式（如 'jpg', 'png', 'pdf' 等，未知则返回 'unknown'）
 */
static _getBase64UrlFileType(base64Url) {
  try {
    // 步骤1：提取 Base64 内容部分（去除前缀）
    const base64Data = base64Url.split(',')[1]; // 分割后第二个元素是 Base64 内容
    if (!base64Data) throw new Error('无效的 Base64 URL');

    // 步骤2：Base64 解码为二进制数据（Uint8Array），只需前 16 字节
    const binaryStr = this.atob(base64Data); // 将 Base64 解码为二进制字符串
    const uint8Array = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      uint8Array[i] = binaryStr.charCodeAt(i); // 转换为 Uint8Array
    }
    const fileHeaderBytes = uint8Array.slice(0, 16); // 取前 16 字节文件头

    // 步骤3：将文件头转换为十六进制字符串（用于匹配）
    const hexHeader = Array.from(fileHeaderBytes)
      .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
      .join('');

    // 步骤4：通过文件头匹配格式（同之前的文件头规则）
    const fileTypes = {
      'FFD8FF': 'jpg',          // JPG/JPEG
      '89504E47': 'png',        // PNG
      '47494638': 'gif',        // GIF
      '25504446': 'pdf',        // PDF
      '504B0304': 'zip',        // ZIP（包括 docx、xlsx 等）
      '7B5C727466': 'rtf',      // RTF
      '4D5A': 'exe',            // EXE/DLL
      '494433': 'mp3',          // MP3
      '0000001466747970': 'mp4',// MP4
    };
    // 从长前缀到短前缀匹配（避免误判）
    const sortedTypes = Object.entries(fileTypes).sort(([a], [b]) => b.length - a.length);
    for (const [hexPrefix, type] of sortedTypes) {
      if (hexHeader.startsWith(hexPrefix)) {
        return type;
      }
    }
    return 'unknown';
  } catch (error) {
    this.addErrorLog(error, "_getBase64UrlFileType")
    return 'unknown';
  }
}
static fileTypeFromBase64(content) {
  try{
  let tem = content.split(",")
  let prefix = tem[0]
  if (prefix.includes("octet-stream")) {//需要进一步判断
    //通过base64前几个字符判断
    let type = this._getBase64UrlFileType(content)
    return type
  }
  if (prefix.includes("application/pdf")) {
    return "pdf"
  }
  if (prefix.includes("html")) {
    return "html"
  }
  if (prefix.includes("image/png")) {
    return "png"
  }
  if (prefix.includes("image/jpeg")) {
    return "jpg"
  }
  if (prefix.includes("markdown")){
    return "markdown"
  }
  if (prefix.includes("zip")){
    return "zip"
  }
  }catch(error){
    this.addErrorLog(error, "fileTypeFromBase64")
    return 'unknown';
  }
}
  /**
   * Retrieves the version of the application.
   * 
   * This method checks if the application version has already been set. If not,
   * it sets the version using the `appVersion` method. The version is then
   * returned.
   * 
   * @returns {{version: string,type: string;}} The version of the application.
   */
  static get version(){
    if (!this.mnVersion) {
      this.mnVersion = this.appVersion()
    }
    return this.mnVersion
  }
  static _isTagComment_(comment){
    if (comment.type === "TextNote") {
      if (/^#\S/.test(comment.text)) {
        return true
      }else{
        return false
      }
    }
    return false
  }
  static get app(){
    // this.appInstance = Application.sharedInstance()
    // return this.appInstance
    if (!this.appInstance) {
      this.appInstance = Application.sharedInstance()
    }
    return this.appInstance
  }
  static get db(){
    if (!this.data) {
      this.data = Database.sharedInstance()
    }
    return this.data
  }
  static get currentWindow(){
    //关闭mn4后再打开，得到的focusWindow会变，所以不能只在init做一遍初始化
    return this.app.focusWindow
  }
  static get windowWidth(){
    return this.currentWindow.frame.width
  }
  static get windowHeight(){
    return this.currentWindow.frame.height
  }
  static get studyController(){
    return this.app.studyController(this.currentWindow)
  }
  static get studyView() {
    return this.app.studyController(this.currentWindow).view
  }
  static get studyWidth(){
    return this.studyView.frame.width
  }
  static get studyHeight(){
    return this.studyView.frame.height
  }
  /**
   * @returns {{view:UIView}}
   **/
  static get extensionPanelController(){
    return this.studyController.extensionPanelController
  }
  /**
   * @returns {UIView}
   */
  static get extensionPanelView(){
    return this.studyController.extensionPanelController.view
  }
  static get extensionPanelOn(){
    if (this.extensionPanelController && this.extensionPanelController.view.window) {
      return true
    }
    return false
  }
  static get mainPath(){
    return this.mainPath
  }
  /**doc:0,1;study:2;review:3 */
  static get studyMode(){
    return this.studyController.studyMode
  }
  static get readerController() {
    return this.studyController.readerController
  }
  static get notebookController(){
    return this.studyController.notebookController
  }
  static get docControllers() {
    return this.studyController.readerController.documentControllers
  }
  static get currentDocController() {
    return this.studyController.readerController.currentDocumentController
  }
  static get mindmapView(){
    return this.studyController.notebookController.mindmapView
  }
  static get selectionText(){
    let selectionText = this.currentDocController.selectionText
    if (selectionText) {
      return selectionText
    }
    if (this.docMapSplitMode) {//不为0则表示documentControllers存在
      let docControllers = this.docControllers
      let docNumber = docControllers.length
      for (let i = 0; i < docNumber; i++) {
        const docController = docControllers[i];
        selectionText = docController.selectionText
        if (selectionText) {
          return selectionText
        }
      }
    }
    if (this.popUpSelectionInfo) {
      let docController = this.popUpSelectionInfo.docController
      if (docController.selectionText) {
        return docController.selectionText
      }
    }
    return undefined
  }
  static get isSelectionText(){
    let image = this.currentDocController.imageFromSelection()
    if (image) {
      return this.currentDocController.isSelectionText
    }
    if (this.docMapSplitMode) {//不为0则表示documentControllers存在
      let docControllers = this.docControllers
      let docNumber = docControllers.length
      for (let i = 0; i < docNumber; i++) {
        const docController = docControllers[i];
        image = docController.imageFromSelection()
        if (image) {
          return docController.isSelectionText
        }
      }
    }
    if (this.popUpSelectionInfo) {
      let docController = this.popUpSelectionInfo.docController
      image = docController.imageFromSelection()
      if (image) {
        return docController.isSelectionText
      }
    }
    return false
  }
  /**
   * 当前激活的文本视图
   * @type {UITextView|undefined}
   */
  static activeTextView = undefined
  static selectionRefreshTime = 0
  /**
   * 返回选中的内容，如果没有选中，则onSelection属性为false
   * 如果有选中内容，则同时包括text和image，并通过isText属性表明当时是选中的文字还是图片
   * Retrieves the current selection details.
   * 
   * This method checks for the current document controller's selection. If an image is found,
   * it generates the selection details using the `genSelection` method. If no image is found
   * in the current document controller, it iterates through all document controllers if the
   * study controller's document map split mode is enabled. If a selection is found in the
   * pop-up selection info, it also generates the selection details. If no selection is found,
   * it returns an object indicating no selection.
   * 
   * @returns {{onSelection: boolean, image: null|undefined|NSData, text: null|undefined|string, isText: null|undefined|boolean,docMd5:string|undefined,pageIndex:number|undefined}} The current selection details.
   */
  static getCurrentSelection(){
    if (this.activeTextView && this.activeTextView.selectedRange.length>0) {
      let range = this.activeTextView.selectedRange
      return {onSelection:true,image:undefined,text:this.activeTextView.text.slice(range.location,range.location+range.length),isText:true,docMd5:undefined,pageIndex:undefined,source:"textview"}
    }
    if (this.studyController.readerController.view.hidden) {
      return {onSelection:false}
    }
    let image = this.currentDocController.imageFromSelection()
    if (image) {
      return this.genSelection(this.currentDocController)
    }
    if (this.docMapSplitMode) {//不为0则表示documentControllers存在
      let docControllers = this.docControllers
      let docNumber = docControllers.length
      for (let i = 0; i < docNumber; i++) {
        const docController = docControllers[i];
        if (docController.imageFromSelection()) {
          return this.genSelection(docController)
        }
      }
    }
    if (this.popUpSelectionInfo && this.popUpSelectionInfo.docController) {
      let docController = this.popUpSelectionInfo.docController
      if (docController.imageFromSelection()) {
        return this.genSelection(docController)
      }
    }
    return {onSelection:false}
  }
  static _currentSelection = {}
  static get currentSelection() {
    if (this.selectionRefreshTime) {
      if (Date.now() - this.selectionRefreshTime > 100) {//超过100ms，重新获取选区信息
        this.selectionRefreshTime = Date.now()
        this._currentSelection = this.getCurrentSelection()
        return this._currentSelection
      }else{
        return this._currentSelection
      }
    }else{
      this.selectionRefreshTime = Date.now()
      this._currentSelection = this.getCurrentSelection()
      return this._currentSelection
    }
  }
  static get currentNotebookId() {
    return this.studyController.notebookController.notebookId
  }
  static get currentNotebook() {
    return this.getNoteBookById(this.currentNotebookId)
  }
  /**
   * Hiden = 0, Doc = 1, MindMap = 2, FlashCard = 3
   * @returns {number}
   */
  static get currentNotebookFlags() {
    return this.currentNotebook.flags
  }
  /**
   * Hiden = 0, Doc = 1, MindMap = 2, FlashCard = 3
   * @returns {"Hiden" | "Doc" | "MindMap" | "FlashCard" | "Unknown"}
   */
  static get currentNotebookType() {
    let flags = this.currentNotebook.flags
    switch (flags) {
      case 0:
        return "Hiden"
      case 1:
        return "Doc"
      case 2:
        return "MindMap"
      case 3:
        return "FlashCard"
      default:
        return "Unknown"
    }
  }
  static get currentNotebookController() {
    return this.studyController.notebookController
  }
  static rgbaToHex(rgba, includeAlpha = false, toUpperCase = false) {
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
  }
  static rgbaArrayToHexArray(rgbaArray, includeAlpha = false, toUpperCase = false) {
    return rgbaArray.map(rgba => this.rgbaToHex(rgba,includeAlpha,toUpperCase));
  }
  static getNotebookExcerptColorById(notebookId){
    let notebook = this.getNoteBookById(notebookId)
    let options = notebook.options
    if (options && "excerptColorTemplate" in options && options.useTopicTool2) {
      let excerptColorTemplate = options.excerptColorTemplate
      let colors = this.rgbaArrayToHexArray(excerptColorTemplate,true)
      return colors
    }
    return this.defaultNoteColors
  }
  static noteColorByNotebookIdAndColorIndex(notebookId,colorIndex){
    let notebook = this.getNoteBookById(notebookId)
    let options = notebook.options
    if (options && "excerptColorTemplate" in options && options.useTopicTool2) {
      let excerptColor = options.excerptColorTemplate[colorIndex]
      let color = this.rgbaToHex(excerptColor,true)
      return color
    }
    return this.defaultNoteColors[colorIndex]
  }
  static get currentNotebookExcerptColor(){
    let options = this.currentNotebook.options
    if (options && "excerptColorTemplate" in options && options.useTopicTool2) {
      let excerptColorTemplate = options.excerptColorTemplate
      let colors = this.rgbaArrayToHexArray(excerptColorTemplate,true)
      return colors
    }else{
      return this.defaultNoteColors
    }
  }
  /**
   * @returns {MbBook}
   */
  static get currentDoc() {
    return this.currentDocController.document
  }
  static get currentDocmd5(){
    try {
      const { docMd5 } = this.currentDocController
      if (docMd5 && docMd5.length === 32) return "00000000"
      else return docMd5
    } catch {
      return undefined
    }
  }
  static get isZH(){
    return NSLocale.preferredLanguages()[0].startsWith("zh")
  }

  static get currentThemeColor(){
    return this.themeColor[this.app.currentTheme]
  }
  static get clipboardText() {
    return UIPasteboard.generalPasteboard().string
  }
  static get clipboardImage() {
    return UIPasteboard.generalPasteboard().image
  }
  static get clipboardImageData() {
    let image = this.clipboardImage
    if (image) {
      return image.pngData()
    }
    return undefined
  }
  static get dbFolder(){
    //结尾不带斜杠
    return this.app.dbPath
  }
  static get cacheFolder(){
    //结尾不带斜杠
    return this.app.cachePath
  }
  static get documentFolder() {
    //结尾不带斜杠
    return this.app.documentPath
  }
  static get tempFolder() {
    //结尾不带斜杠
    return this.app.tempPath
  }
  static get splitLine() {
    let study = this.studyController
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
  /**
   * Retrieves the version and type of the application.
   * 
   * This method determines the version of the application by parsing the appVersion property.
   * It categorizes the version as either "marginnote4" or "marginnote3" based on the parsed version number.
   * Additionally, it identifies the operating system type (iPadOS, iPhoneOS, or macOS) based on the osType property.
   *  
   * @returns {{version: "marginnote4" | "marginnote3", type: "iPadOS" | "iPhoneOS" | "macOS"}} An object containing the application version and operating system type.
   */
  static appVersion() {
    try {
      

    let info = {}
    let version = parseFloat(this.app.appVersion)
    if (version >= 4) {
      info.version = "marginnote4"
      info.versionNumber = version
    }else{
      info.version = "marginnote3"
      info.versionNumber = version
    }
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
    return info
    } catch (error) {
      this.addErrorLog(error, "appVersion")
      return undefined
    }
  }
  static isIOS(){
    return this.appVersion().type == "iPhoneOS"
  }
  static isMacOS(){
    return this.appVersion().type == "macOS"
  }
  static isIPadOS(){
    return this.appVersion().type == "iPadOS"
  }
  static isMN4(){
    return this.appVersion().version == "marginnote4"
  }
  static isMN3(){
    return this.appVersion().version == "marginnote3"
  }
  static getMNUtilVersion(){
    let res = this.readJSON(this.mainPath+"/mnaddon.json")
    return res.version
    // this.copyJSON(res)
  }
  static countWords(str) {
    //对中文而言计算的是字数
    const chinese = Array.from(str)
      .filter(ch => /[\u4e00-\u9fa5]/.test(ch))
      .length
    const english = Array.from(str)
      .map(ch => /[a-zA-Z0-9\s]/.test(ch) ? ch : ' ')
      .join('').split(/\s+/).filter(s => s)
      .length
    return chinese + english
  }
  static removePunctuationOnlyElements(arr) {
    // Regular expression to match strings consisting only of punctuation.
    // This regex includes common Chinese and English punctuation marks.
    // \p{P} matches any kind of punctuation character.
    // \p{S} matches any kind of symbol.
    // We also include specific Chinese punctuation not always covered by \p{P} or \p{S} in all JS environments.
    const punctuationRegex = /^(?:[\p{P}\p{S}¡¿〽〃「」『』【】〝〞〟〰〾〿——‘’“”〝〞‵′＂＃＄％＆＇（）＊＋，－．／：；＜＝＞＠［＼］＾＿｀｛｜｝～￥িপূর্ণ！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝～])*$/u;

    return arr.filter(item => !punctuationRegex.test(item.trim()));
  }
  static doSegment(str) {
    if (!this.segmentit) {
      this.segmentit = Segmentit.useDefault(new Segmentit.Segment());
    }
    let words = this.segmentit.doSegment(str,{simple:true}).filter(word=>!/^\s*$/.test(word))
    return words
  }
  /**
   * 
   * @param {string} str 
   * @returns {number}
   */
  static wordCountBySegmentit(str) {
    //对中文而言计算的是词数
    if (!this.segmentit) {
      this.segmentit = Segmentit.useDefault(new Segmentit.Segment());
    }
    let words = this.segmentit.doSegment(str,{simple:true}).filter(word=>!/^\s*$/.test(word))
    //去除标点符号
    let wordsWithoutPunctuation = this.removePunctuationOnlyElements(words)
    // MNUtil.copy(wordsWithoutPunctuation)
    return wordsWithoutPunctuation.length
  }
  /**
   * 
   * @param {string} path 
   * @param {boolean} merge 
   * @returns {MbTopic|undefined}
   */
  static importNotebook(path,merge){
    let res = this.db.importNotebookFromStorePathMerge(path,merge)
    let notebook = res[0]
    return notebook
  }
  static subpathsOfDirectory(path){
    return NSFileManager.defaultManager().subpathsOfDirectoryAtPath(path)
  }
  static contentsOfDirectory(path){
    return NSFileManager.defaultManager().contentsOfDirectoryAtPath(path)
  }
  static allNotebooks(){
    return this.db.allNotebooks()
  }
  static allNotebookIds(){
    return this.db.allNotebooks().map(notebook=>notebook.topicId)
  }
  static allDocumentNotebooks(option = {}){
    let exceptNotebookIds = option.exceptNotebookIds ?? []
    let exceptNotebookNames = option.exceptNotebookNames ?? []
    let documentNotebooks = this.allNotebooks().filter(notebook=>{
      let flags = notebook.flags
      if (flags === 1) {
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
    return documentNotebooks
  }
  static allReviewGroups(option = {}){
    let exceptNotebookIds = option.exceptNotebookIds ?? []
    let exceptNotebookNames = option.exceptNotebookNames ?? []
    let reviewGroups = this.allNotebooks().filter(notebook=>{
      let flags = notebook.flags
      if (flags === 3) {
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
    return reviewGroups
  }
  static allStudySets(option = {}){
  try {
    let exceptNotebookIds = option.exceptNotebookIds ?? []
    let exceptNotebookNames = option.exceptNotebookNames ?? []
    let studySets = this.allNotebooks().filter(notebook=>{
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
   * @param {string|MNNotebook} studySetId 
   * @returns {MNNote[]}
   */
  static notesInStudySet(studySetId = this.currentNotebookId){
    let allNotes
    if (typeof studySetId === "string") {
      allNotes = this.getNoteBookById(studySetId).notes
    }else{
      allNotes = studySetId.notes
    }
    let filteredNotes = allNotes.filter(note=>!note.docMd5.endsWith("_StudySet"))
    return filteredNotes
  }
  static chatNotesInStudySet(studySetId = MNUtil.currentNotebookId){
    let allNotes
    if (typeof studySetId === "string") {
      allNotes = MNUtil.getNoteBookById(studySetId).notes
    }else{
      allNotes = studySetId.notes
    }
    return allNotes.filter(note=>note.docMd5.endsWith("_StudySet"))
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
 * 判断字符串是否包含符合特定语法的搜索内容。
 * 支持 .AND., .OR. 和括号 ()。
 *
 * @param {string} text - 要在其中搜索的完整字符串。
 * @param {string} query - 基于 .AND. 和 .OR. 语法的搜索查询字符串。
 * @returns {boolean} - 如果 text 包含符合 query 条件的内容，则返回 true，否则返回 false。
 */
static textMatchPhrase(text, query) {
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
  static allDocuments(){
    return this.db.allDocuments()
  }
  static allDocumentIds(){
    return this.db.allDocuments().map(document=>document.docMd5)
  }
  static getNoteFileById(noteId) {
    let note = this.getNoteById(noteId)
    let docFile = this.getDocById(note.docMd5)
    if (!docFile) {
      this.showHUD("No file")
      return {
        fileExists:false
      }
    }
    let fullPath
    if (docFile.fullPathFileName) {
      fullPath = docFile.fullPathFileName
    }else{
      let folder = this.documentFolder
      let fullPath = folder+"/"+docFile.pathFile
      if (docFile.pathFile.startsWith("$$$MNDOCLINK$$$")) {
        let fileName = this.getFileName(docFile.pathFile)
        fullPath = Application.sharedInstance().tempPath + fileName
        // fullPath = docFile.pathFile.replace("$$$MNDOCLINK$$$", "/Users/linlifei/")
      }
    }
    if (!this.isfileExists(fullPath)) {
      this.showHUD("Invalid file: "+docFile.pathFile)
      return {
        fileExists:false
      }
    }
    // copy(fullPath)
    let fileName = this.getFileName(fullPath)
    return{
      name:fileName,
      path:fullPath,
      md5:docFile.docMd5,
      fileExists:true,
      pageCount:docFile.pageCount
    }
  }
  static isNSNull(obj){
    return (obj === NSNull.new())
  }
  static createFolder(path){
    if (!this.isfileExists(path)) {
      NSFileManager.defaultManager().createDirectoryAtPathAttributes(path, undefined)
    }
  }
  /**
   * 如果中间有文件夹不存在,则会创建对应文件夹
   * @param {string} path 
   */
  static createFolderDev(path){
    if (!this.isfileExists(path)) {
      NSFileManager.defaultManager().createDirectoryAtPathWithIntermediateDirectoriesAttributes(path, true, undefined)
    }
  }
  /**
   * 
   * @param {NSData} data 
   * @param {string} path
   */
  static writeDataToFile(data,path){
  try {
    let folder = this.getFileFolder(path)
    this.createFolderDev(folder)
    data.writeToFileAtomically(path,true)
    return true
  } catch (error) {
    this.addErrorLog(error, "writeDataToFile")
    return false
  }
  }
  /**
   * 
   * @param {string} path 
   * @returns 
   */
  static getFileFold(path){
    return path.split("/").slice(0, -1).join("/")
  }
  /**
   * 
   * @param {string} path 
   * @returns 
   */
  static getFileFolder(path){
    return path.split("/").slice(0, -1).join("/")
  }
  /**
   * 
   * @param {string} sourcePath 
   * @param {string} targetPath 
   * @returns {boolean}
   */
  static copyFile(sourcePath, targetPath){
    try {
      if (!this.isfileExists(targetPath)) {
        let folder = this.getFileFold(targetPath)
        if (!this.isfileExists(folder)) {
          this.createFolderDev(folder)
        }
        let success = NSFileManager.defaultManager().copyItemAtPathToPath(sourcePath, targetPath)
        return success
      }
    } catch (error) {
      this.addErrorLog(error, "copyFile")
      return false
    }
  }
  /**
   * 
   * @param {UIWebView} webview 
   * @param {string} script 
   * @returns 
   */
  static async runJavaScript(webview,script) {
  // if(!this.webviewResponse || !this.webviewResponse.window)return;
  return new Promise((resolve, reject) => {
    try {
      if (webview) {
        // MNUtil.copy(webview)
        webview.evaluateJavaScript(script,(result) => {
          if (this.isNSNull(result)) {
            resolve(undefined)
          }
          resolve(result)
        });
      }else{
        resolve(undefined)
      }
    } catch (error) {
      chatAIUtils.addErrorLog(error, "runJavaScript")
      resolve(undefined)
    }
  })
};
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
  /**
   * Displays a Heads-Up Display (HUD) message on the specified window for a given duration.
   * 
   * This method shows a HUD message on the specified window for the specified duration.
   * If no window is provided, it defaults to the current window. The duration is set to 2 seconds by default.
   * 
   * @param {string} message - The message to display in the HUD.
   * @param {number} [duration=2] - The duration in seconds for which the HUD should be displayed.
   * @param {UIWindow} [window=this.currentWindow] - The window on which the HUD should be displayed.
   */
  static showHUD(message, duration = 2, view = this.currentWindow) {
    // if (this.onWaitHUD) {
    //   this.stopHUD(view)
    // }
    this.app.showHUD(message, view, duration);
  }
  static waitHUD(message, view = this.currentWindow) {
    // if (this.onWaitHUD) {
    //   return
    // }
    this.app.waitHUDOnView(message, view);
    this.onWaitHUD = true
  }
  static async stopHUD(delay = 0, view = this.currentWindow) {
    if (typeof delay === "number") {
      await MNUtil.delay(delay)
    }
    this.app.stopWaitHUDOnView(view);
    this.onWaitHUD = false
  }
  static alert(message){
    this.app.alert(message)
  }
   /**
   * Displays a confirmation dialog with a main title and a subtitle.
   * 
   * This method shows a confirmation dialog with the specified main title and subtitle.
   * It returns a promise that resolves with the button index of the button clicked by the user.
   * 
   * @param {string} mainTitle - The main title of the confirmation dialog.
   * @param {string|object} subTitle - The subtitle of the confirmation dialog.
   * @param {string[]} items - The items of the confirmation dialog.
   * @returns {Promise<number|undefined>} A promise that resolves with the button index of the button clicked by the user.
   */
  static async confirm(mainTitle,subTitle="",items = ["Cancel","Confirm"]){
    if (MNOnAlert) {
      return
    }
    let typeofSubTitle = typeof subTitle
    let fixedSubtitle = typeofSubTitle === "string"?subTitle:JSON.stringify(subTitle,undefined,2)
    MNOnAlert = true
    return new Promise((resolve, reject) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        mainTitle,fixedSubtitle,0,items[0],items.slice(1),
        (alert, buttonIndex) => {
          MNOnAlert = false
          // MNUtil.copyJSON({alert:alert,buttonIndex:buttonIndex})
          resolve(buttonIndex)
        }
      )
    })
  }
  /**
   * 0代表用户取消,其他数字代表用户选择的按钮索引
   * @param {string} mainTitle - The main title of the confirmation dialog.
   * @param {string} subTitle - The subtitle of the confirmation dialog.
   * @param {string[]} items - The items to display in the dialog.
   * @returns {Promise<number>} A promise that resolves with the button index of the button clicked by the user.
   */
  static async userSelect(mainTitle,subTitle="",items){
    if (MNOnAlert) {
      return
    }
    MNOnAlert = true
    return new Promise((resolve, reject) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        mainTitle,subTitle,0,"Cancel",items,
        (alert, buttonIndex) => {
          // MNUtil.copyJSON({alert:alert,buttonIndex:buttonIndex})
          MNOnAlert = false
          resolve(buttonIndex)
        }
      )
    })
  }
  static findToc(md5,excludeNotebookId=undefined){
    let allNotebooks = this.allStudySets({exceptNotebookIds:[excludeNotebookId]}).filter(notebook=>{
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
  static getDocTocNotes(md5=this.currentDocmd5,notebookId=this.currentNotebookId){
    let notebook = this.getNoteBookById(notebookId)
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
  /**
   * 自动检测类型并复制
   * @param {string|object|NSData|UIImage} object 
   */
  static copy(object) {
    switch (typeof object) {
      case "string":
        UIPasteboard.generalPasteboard().string = object
        break;
      case "undefined":
        this.showHUD("Undefined")
        break;
      case "number":
        UIPasteboard.generalPasteboard().string = object.toString()
        break;
      case "boolean":
        UIPasteboard.generalPasteboard().string = object.toString()
        break;
      case "object":
        if (object instanceof NSData) {//假设为图片的data
          this.copyImage(object)
          break;
        }
        if (object instanceof UIImage) {
          this.copyImage(object.pngData())
          break;
        }
        if (object instanceof MNDocument) {
          let docInfo = {
            id:object.docMd5,
            currentNotebookId:object.currentTopicId,
            title:object.docTitle,
            pageCount:object.pageCount,
            path:object.fullPathFileName
          }
          this.copy(docInfo)
          break;
        }
        if (object instanceof MNNotebook) {
          let notebookInfo = {
            id:object.id,
            title:object.title,
            type:object.type,
            url:object.url,
            mainDocMd5:object.mainDocMd5
          }
          this.copy(notebookInfo)
          break;
        }
        // if (object instanceof MbBookNote) {
        //   let noteInfo = {
        //     noteId:object.noteId,
        //     noteTitle:object.noteTitle,
        //     excerptText:object.excerptText,
        //     docMd5:object.docMd5,
        //     notebookId:object.notebookId,
        //     comments:object.comments
        //   }
        //   this.copy(noteInfo)
        //   break;
        // }
        if (object instanceof MNNote) {
          let noteInfo = {
            noteId:object.noteId,
            title:object.title,
            excerptText:object.excerptText,
            docMd5:object.docMd5,
            notebookId:object.notebookId,
            noteURL:object.noteURL,
            MNComments:object.MNComments
          }
          if (object.tags && object.tags.length > 0) {
            noteInfo.tags = object.tags
          }
          this.copy(noteInfo)
          break;
        }
        if (object instanceof Error) {
          this.copy(object.toString())
          break
        }
        UIPasteboard.generalPasteboard().string = JSON.stringify(object,null,2)
        break;
      default:
        this.showHUD("Unsupported type: "+typeof object)
        break;
    }
  }
  /**
   * Copies a JSON object to the clipboard as a formatted string.
   * 
   * This method converts the provided JSON object into a formatted string using `JSON.stringify`
   * with indentation for readability, and then sets this string to the clipboard.
   * 
   * @param {Object} object - The JSON object to be copied to the clipboard.
   */
  static copyJSON(object) {
    UIPasteboard.generalPasteboard().string = JSON.stringify(object,null,2)
  }
  /**
   * Copies an image to the clipboard.
   * 
   * This method sets the provided image data to the clipboard with the specified pasteboard type.
   * 
   * @param {NSData} imageData - The image data to be copied to the clipboard.
   */
  static copyImage(imageData) {
    UIPasteboard.generalPasteboard().setDataForPasteboardType(imageData,"public.png")
  }
  /**
   *
   * @param {string|NSURL} url
   */
  static openURL(url,mode = "external"){
  try {

    let type = this.typeOf(url)
    // MNUtil.log(type)

    if (type === "NSURL") {
      let urlString = url.absoluteString()
      switch (mode) {
        case "auto":
          if (urlString.startsWith("http://") || urlString.startsWith("https://")) {
            if (typeof browserUtils !== "undefined") {
              MNUtil.postNotification("openInBrowser", {url:urlString})
              break;
            }
          }
          this.app.openURL(url);
          break;
        case "external":
          this.app.openURL(url);
          break;
        case "mnbrowser":
          if (typeof browserUtils !== "undefined") {
            MNUtil.postNotification("openInBrowser", {url:urlString})
          }else{
            MNUtil.showHUD("❌ MN Browser not installed")
          }
          break;
        default:
          break;
      }
      return
    }
    if (typeof url === "string") {
      switch (mode) {
        case "auto":
          if (url.startsWith("http://") || url.startsWith("https://")) {
            if (typeof browserUtils !== "undefined") {
              MNUtil.postNotification("openInBrowser", {url:url})
              break;
            }
          }
          this.app.openURL(NSURL.URLWithString(url));
          break;
        case "external":
          // MNUtil.log("openURL:"+url)
          this.app.openURL(NSURL.URLWithString(url));
          break;
        case "mnbrowser":
          if (typeof browserUtils !== "undefined") {
            MNUtil.postNotification("openInBrowser", {url:url})
          }else{
            MNUtil.showHUD("❌ MN Browser not installed")
          }
          break;
        default:
          break;
      }
      return
    }
  } catch (error) {
    this.addErrorLog(error, "openURL", {url:url,mode:mode})
  }
  }
  static openWith(config,addon = "external"){
    if (addon) {
      let mode
      switch (addon) {
        case "external":
          if ("url" in config) {
            this.openURL(config.url)
          }
          break;
        case "mnbrowser":
          mode = config.mode ?? "openURL"
          switch (mode) {
            case "openURL":
              MNUtil.postNotification("openInBrowser", {url:config.url})
              break;
            case "search":
              let userInfo = {}
              if ("textToSearch" in config) {
                userInfo.text = config.textToSearch
              }
              if ("noteId" in config) {
                userInfo.noteid = config.noteId
              }
              if ("engine" in config) {
                userInfo.engine = config.engine
              }
              MNUtil.postNotification("searchInBrowser", userInfo)
              break;
            default:
              MNUtil.showHUD("mode not found")
              break;
          }
          break;
      
        default:
          break;
      }
    }else{
      MNUtil.showHUD("addon not found")
    }

    
  }
  static compressImage(imageData,quality = 0.1){
    let compressedData
    switch (typeof imageData) {
      case "string":
        if (imageData.startsWith("data:image/jpeg;base64,") || imageData.startsWith("data:image/png;base64,")) {
          let data = this.dataFromBase64(imageData)
          compressedData = UIImage.imageWithData(data).jpegData(quality)
          return compressedData;
        }else{
          let data = this.dataFromBase64(base64,"png")
          compressedData = UIImage.imageWithData(data).jpegData(quality)
          return compressedData;
        }
        break;
      case "NSData":
        compressedData = UIImage.imageWithData(imageData).jpegData(quality)
        return compressedData;
      case "UIImage":
        compressedData = imageData.jpegData(quality)
        return compressedData;
        break;
      default:
        break;
    }
    return undefined
  }
  /**
   * 
   * @param {string} urlString 
   * @returns {{url:string,scheme:string,host:string,query:string,params:Object,pathComponents:string[],isBlank:boolean,fragment:string}}
   */
  static parseURL(urlString){
    /**
     * @type {NSURL}
     */
    let url
    if (typeof urlString === "string") {
      url = NSURL.URLWithString(urlString)
    }else{
      if (urlString instanceof NSURL) {
        url = urlString
      }else if (urlString instanceof NSURLRequest) {
        url = urlString.URL()
      }
    }
    let absoluteString = url.absoluteString()
    if (absoluteString === "about:blank") {
      return {
        url:absoluteString,
        scheme:"about",
        params:{},
        isBlank:true
      }
    }
    let config = {
      url:url.absoluteString(),
      scheme:url.scheme,
      host:url.host,
      query:url.query,
      isBlank:false
    }
    let pathComponents = url.pathComponents()
    if (pathComponents && pathComponents.length > 0) {
      config.pathComponents = pathComponents.filter(k=>k !== "/")
    }

    let fragment = url.fragment
    if (fragment) {
      config.fragment = fragment
    }
    if (url.port) {
      config.port = url.port
    }
    // 解析查询字符串
    const params = {};
    let queryString = url.query;
    if (queryString) {
      const pairs = queryString.split('&');
      for (const pair of pairs) {
        // 跳过空的参数对 (例如 'a=1&&b=2' 中的第二个 '&')
        if (!pair) continue;
        const eqIndex = pair.indexOf('=');
        let key, value;

        if (eqIndex === -1) {
          // 处理没有值的参数，例如 '...&readonly&...'
          key = decodeURIComponent(pair);
          value = ''; // 通常将无值的 key 对应的值设为空字符串
        } else {
          key = decodeURIComponent(pair.substring(0, eqIndex));
          let tem = decodeURIComponent(pair.substring(eqIndex + 1));
          if (MNUtil.isValidJSON(tem)) {
            value = JSON.parse(tem)
          }else if (tem === "true") {
            value = true
          }else if (tem === "false") {
            value = false
          }else{
            value = tem
          }
        }
        params[key] = value;
      }
    }
    config.params = params
    return config
  }
  /**
   * 
   * @param {string|MNNotebook|MbTopic} notebook 
   * @param {boolean} needConfirm 
   */
  static async openNotebook(notebook, needConfirm = false){
    let targetNotebook = MNNotebook.new(notebook)
    if (!targetNotebook) {
      this.showHUD("No notebook")
      return
    }
    if (targetNotebook.id == this.currentNotebookId) {
      MNUtil.refreshAfterDBChanged()
      // this.showHUD("Already in current notebook")
      return
    }
    if (needConfirm) {
      let confirm = await MNUtil.confirm("是否打开学习集？", targetNotebook.title)
      MNUtil.refreshAfterDBChanged()
      if (confirm) {
        MNUtil.openURL("marginnote4app://notebook/"+targetNotebook.id)
      }
    }else{
      MNUtil.openURL("marginnote4app://notebook/"+targetNotebook.id)
    }
  }
  /**
   * 
   * @param {string} noteId 
   * @returns {boolean}
   */
  static isNoteInReview(noteId){
    return this.studyController.isNoteInReview(noteId)
  }
  /**
   * 当删除学习集后,还有可能学习集本身存在,但是对应的笔记清空的情况
   * @param {*} notebookId 
   * @param {*} checkNotes 
   * @returns 
   */
  static notebookExists(notebookId,checkNotes = false){
    let notebook = this.db.getNotebookById(notebookId)
    if (notebook) {
      if (checkNotes) {
        if (notebook.notes && notebook.notes.length > 0) {
          return true
        }
        return false
      }
      return true
    }
    return false
  }
  static noteExists(noteId){
    let note = this.db.getNoteById(noteId)
    if (note) {
      return true
    }
    return false
  }
  /**
   * 
   * @param {string} noteid 
   * @returns {MbBookNote}
   */
  static getNoteById(noteid,alert = true) {
    let note = this.db.getNoteById(noteid)
    if (note) {
      return note
    }else{
      if (alert){
        this.log({
          level:'error',
          message:'Note not exist!',
          detail:noteid
        })
      }
      return undefined
    }
  }
  static getNoteBookById(notebookId) {
    let notebook = this.db.getNotebookById(notebookId)
    return notebook
  }
  static getDocById(md5) {
    let doc = this.db.getDocumentById(md5)
    return doc
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
  /**
   *
   * @param {String} url
   * @returns {String}
   */
  static getNotebookIdByURL(url) {
    let targetNotebookId = url.trim()
    if (/^marginnote\dapp:\/\/notebook\//.test(targetNotebookId)) {
      targetNotebookId = targetNotebookId.slice(22)
    }
    return targetNotebookId
  }
  /**
   * 
   * @param {string}filePath The file path of the document to import
   * @returns {string} The imported document md5
   */
  static importDocument(filePath) {
    return MNUtil.app.importDocument(filePath)
  }
  /**
   * 该方法会弹出文件选择窗口以选择要导入的文档
   * @returns {string} 返回文件md5
   */
  static async importPDFFromFile(){
    let docPath = await MNUtil.importFile("com.adobe.pdf")
    return this.importDocument(docPath)
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
          break;
        case "png":
          if (base64.startsWith("data:image/png;base64,")) {
            let pdfData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64))
            return pdfData
          }else{
            let pdfData = NSData.dataWithContentsOfURL(MNUtil.genNSURL("data:image/png;base64,"+base64))
            return pdfData
          }
          break;
        case "jpeg":
          if (base64.startsWith("data:image/jpeg;base64,")) {
            let pdfData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64))
            return pdfData
          }else{
            let pdfData = NSData.dataWithContentsOfURL(MNUtil.genNSURL("data:image/jpeg;base64,"+base64))
            return pdfData
          }
          break;
        default:
          break;
      }
    }
    return NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64))
  }
  /**
   * 从base64导入pdf
   * @param {string} pdfBase64 pdf的base64字符串,可以是纯base64也可以是data url
   * @param {object} option 选项
   * @returns {string} 返回文件md5
   */
  static async importPDFFromBase64(pdfBase64,option = {}){
    let pdfData = this.dataFromBase64(pdfBase64)
    if ("filePath" in option) {
      this.writeDataToFile(pdfData,option.filePath)
      let md5 = this.importDocument(option.filePath)
      return md5
    }
    let fileName = option.fileName || ("imported_"+Date.now()+".pdf")
    let folder = option.folder || MNUtil.tempFolder()
    let filePath = folder.nativePath + fileName
    this.writeDataToFile(pdfData,filePath)
    let md5 = this.importDocument(filePath)
    return md5
  }
  /**
   * 该方法会弹出文件选择窗口以选择要导入的文档
   * @returns {string} 返回文件md5
   */
  static async importPDFFromData(pdfData){
    let docPath = await MNUtil.importFile("com.adobe.pdf")
    return this.importDocument(docPath)
  }
  /**
   * 该方法会弹出文件选择窗口以选择要导入的文档,并直接在指定学习集中打开
   * @returns {string} 返回文件md5
   */
  static async importPDFFromFileAndOpen(notebookId){
    let docPath = await MNUtil.importFile("com.adobe.pdf")
    let md5 = this.importDocument(docPath)
    MNUtil.openDoc(md5,notebookId)
    return md5
  }
  static toggleExtensionPanel(){
    this.studyController.toggleExtensionPanel()
  }
  static isfileExists(path) {
    return NSFileManager.defaultManager().fileExistsAtPath(path)
  }
  /**
   * Generates a frame object with the specified x, y, width, and height values.
   * 
   * This method creates a frame object with the provided x, y, width, and height values.
   * If any of these values are undefined, it displays a HUD message indicating the invalid parameter
   * and sets the value to 10 as a default.
   * 
   * @param {number} x - The x-coordinate of the frame.
   * @param {number} y - The y-coordinate of the frame.
   * @param {number} width - The width of the frame.
   * @param {number} height - The height of the frame.
   * @returns {{x: number, y: number, width: number, height: number}} The frame object with the specified dimensions.
   */
  static genFrame(x, y, width, height) {
    if (x === undefined) {
        this.showHUD("无效的参数: x");
        x = 10;
    }
    if (y === undefined) {
        this.showHUD("无效的参数: y");
        y = 10;
    }
    if (width === undefined) {
        this.showHUD("无效的参数: width");
        // this.copyJSON({x:x,y:y,width:width,height:height})
        width = 10;
    }
    if (height === undefined) {
        this.showHUD("无效的参数: height");
        height = 10;
    }
    return { x: x, y: y, width: width, height: height };
  }
  static setFrame(view,x,y,width,height){
    view.frame = {x:x,y:y,width:width,height:height}
  }
  /**
   *
   * @param {DocumentController} docController
   * @returns
   */
  static genSelection(docController){
    let selection = {onSelection:true,docController:docController}
    //无论是选中文字还是框选图片，都可以拿到图片。而文字则不一定
    let image = docController.imageFromSelection()
    if (image) {
      selection.image = image
      selection.isText = docController.isSelectionText
      if (docController.selectionText) {
        selection.text = docController.selectionText
      }
      selection.docMd5 = docController.docMd5
      selection.pageIndex = docController.currPageIndex
      return selection
    }
    return {onSelection:false}

  }
  static parseWinRect(winRect) {
    let rectArr = winRect.replace(/{/g, '').replace(/}/g, '').replace(/\s/g, '').split(',')
    let X = Number(rectArr[0])
    let Y = Number(rectArr[1])
    let H = Number(rectArr[3])
    let W = Number(rectArr[2])
    return this.genFrame(X, Y, W, H)
  }
  static async animate(func,time = 0.2) {
    return new Promise((resolve, reject) => {
      UIView.animateWithDurationAnimationsCompletion(time,func,()=>(resolve()))
    })

  }
  static checkSender(sender,window = this.currentWindow){
    return this.app.checkNotifySenderInWindow(sender, window)
  }
  static async delay (seconds) {
    return new Promise((resolve, reject) => {
      NSTimer.scheduledTimerWithTimeInterval(seconds, false, function () {
        resolve()
      })
    })
  }
  static crash(){
    this.studyView.frame = {x:undefined}
  }
  /**
   *
   * @param {UIView} view
   */
  static isDescendantOfStudyView(view){
    return view.isDescendantOfView(this.studyView)
  }
  /**
   *
   * @param {UIView} view
   */
  static isDescendantOfCurrentWindow(view){
    return view.isDescendantOfView(this.currentWindow)
  }
  static addObserver(observer,selector,name){
    if (!observer.notifications) {
      observer.notifications = [name]
    }else{
      observer.notifications.push(name)
    }
    NSNotificationCenter.defaultCenter().addObserverSelectorName(observer, selector, name);
  }
  static addObservers(observer,kv){

    let keys = Object.keys(kv)
    if (!observer.notifications) {
      observer.notifications = keys
    }else{
      let allNotifications = observer.notifications.concat(keys)
      observer.notifications = MNUtil.unique(allNotifications)
    }
    observer.notifications = keys
    for (let i = 0; i < keys.length; i++) {
      let name = keys[i]
      let selector = kv[name]
      NSNotificationCenter.defaultCenter().addObserverSelectorName(observer, selector, name);
    }
  }
  static addObserverForPopupMenuOnNote(observer,selector){
    this.addObserver(observer, selector, "PopupMenuOnNote")
  }
  static addObserverForClosePopupMenuOnNote(observer,selector){
    this.addObserver(observer, selector, "ClosePopupMenuOnNote")
  }
  static addObserverForPopupMenuOnSelection(observer,selector){
    this.addObserver(observer, selector, "PopupMenuOnSelection")
  }
  static addObserverForClosePopupMenuOnSelection(observer,selector){
    this.addObserver(observer, selector, "ClosePopupMenuOnSelection")
  }
  static addObserverForUITextViewTextDidBeginEditing(observer,selector){
    this.addObserver(observer, selector, "UITextViewTextDidBeginEditingNotification")
  }
  static addObserverForUITextViewTextDidEndEditing(observer,selector){
    this.addObserver(observer, selector, "UITextViewTextDidEndEditingNotification")
  }
  static addObserverForCloudKeyValueStoreDidChange(observer,selector){
    this.addObserver(observer, selector, "NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI")
  }
  static addObserverForProcessNewExcerpt(observer,selector){
    this.addObserver(observer, selector, "ProcessNewExcerpt")
  }
  static addObserverForAddonBroadcast(observer,selector){
    this.addObserver(observer, selector, "AddonBroadcast")
  }
  static addObserverForUIPasteboardChanged(observer,selector){
    this.addObserver(observer, selector, "UIPasteboardChangedNotification")
  }

  static removeObserver(observer,name){
    if (!name) {
      return
    }
    NSNotificationCenter.defaultCenter().removeObserverName(observer, name);
    observer.notifications = observer.notifications.filter(item=>{
      return item !== name;
    })
  }
  /**
   * 
   * @param {string} observer 
   * @param {Array<String>} notifications
   */
  static removeObservers(observer,notifications = undefined) {
    if (notifications && notifications.length) {
      notifications.forEach(notification=>{
        NSNotificationCenter.defaultCenter().removeObserverName(observer, notification);
      })
      observer.notifications = observer.notifications.filter(item=>{
        return !notifications.includes(item);
      })
    }else{//删除所有observer
      let allNotifications = observer.notifications;
      allNotifications.forEach(notification=>{
        NSNotificationCenter.defaultCenter().removeObserverName(observer, notification);
      })
      observer.notifications = observer.notifications.filter(item=>{
        return !allNotifications.includes(item);
      })
    }
  }
  static removeObserverForPopupMenuOnNote(observer){
    this.removeObserver(observer, "PopupMenuOnNote")
  }
  static removeObserverForClosePopupMenuOnNote(observer){
    this.removeObserver(observer, "ClosePopupMenuOnNote")
  }
  static removeObserverForPopupMenuOnSelection(observer){
    this.removeObserver(observer, "PopupMenuOnSelection")
  }
  static removeObserverForClosePopupMenuOnSelection(observer){
    this.removeObserver(observer, "ClosePopupMenuOnSelection")
  }
  static removeObserverForUITextViewTextDidBeginEditing(observer){
    this.removeObserver(observer, "UITextViewTextDidBeginEditingNotification")
  }
  static removeObserverForUITextViewTextDidEndEditing(observer){
    this.removeObserver(observer, "UITextViewTextDidEndEditingNotification")
  }
  static removeObserverForCloudKeyValueStoreDidChange(observer){
    this.removeObserver(observer, "NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI")
  }
  static removeObserverForProcessNewExcerpt(observer){
    this.removeObserver(observer, "ProcessNewExcerpt")
  }
  static removeObserverForAddonBroadcast(observer){
    this.removeObserver(observer, "AddonBroadcast")
  }
  static removeObserverForUIPasteboardChanged(observer){
    this.removeObserver(observer, "UIPasteboardChangedNotification")
  }
  static refreshAddonCommands(){
    this.studyController.refreshAddonCommands()
  }
  static refreshAfterDBChanged(notebookId = this.currentNotebookId){
    this.app.refreshAfterDBChanged(notebookId)
  }
  /**
   * Focuses a note in the mind map by its ID with an optional delay.
   * 
   * This method attempts to focus a note in the mind map by its ID. If the note is not in the current notebook,
   * it displays a HUD message indicating that the note is not in the current notebook. If a delay is specified,
   * it waits for the specified delay before focusing the note.
   * 
   * @param {string} noteId - The ID of the note to focus.
   * @param {number} [delay=0] - The delay in seconds before focusing the note.
   */
  static focusNoteInMindMapById(noteId,delay=0){
  try {
    let note = this.getNoteById(noteId)
    if (note.notebookId && note.notebookId !== this.currentNotebookId) {
      this.showHUD("Note not in current notebook")
      return
    }
    if (delay) {
      this.delay(delay).then(()=>{
        this.studyController.focusNoteInMindMapById(noteId)
      })
    }else{
      this.studyController.focusNoteInMindMapById(noteId)
    }

  } catch (error) {
    MNUtil.addErrorLog(error, "focusNoteInMindMapById")
  }
  }
  static focusNoteInFloatMindMapById(noteId,delay = 0){
    if (delay) {
      this.delay(delay).then(()=>{
        this.studyController.focusNoteInFloatMindMapById(noteId)
      })
    }else{
      this.studyController.focusNoteInFloatMindMapById(noteId)
    }
  }
  static focusNoteInDocumentById(noteId,delay = 0){
    if (delay) {
      this.delay(delay).then(()=>{
        this.studyController.focusNoteInDocumentById(noteId)
      })
    }else{
      this.studyController.focusNoteInDocumentById(noteId)
    }
  }
  /**
   * 
   * @param {string} jsonString 
   * @returns {boolean}
   */
  static isValidJSON(jsonString){
    // return NSJSONSerialization.isValidJSONObject(result)
     try{
         var json = JSON.parse(jsonString);
         if (json && typeof json === "object") {
             return true;
         }
     }catch(e){
         return false;
     }
     return false;
  }
  /**
   * 
   * @param {string} jsonString 
   * @returns {object|undefined}
   */
static getValidJSON(jsonString,debug = false) {
  try {
    if (typeof jsonString === "object") {
      return jsonString
    }
    return JSON.parse(jsonString)
  } catch (error) {
    try {
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
      // 1. 替换为标准空格
      // 2. 将多个连续的换行符替换为单个换行符
      // 3. 将其它空白符（除了换行符）替换为单个空格
      var tempStr = str.replace(/&nbsp;/g, ' ').replace(/\n+/g, '\n\n').replace(/[\r\t\f\v\s]+/g, ' ').trim()
      // var tempStr = str.replace(/\n+/g, '\n').replace(/[\r\t\f\v ]+/g, ' ').trim()
      return tempStr;
  }
  static undo(notebookId = this.currentNotebookId){
    UndoManager.sharedInstance().undo()
    this.app.refreshAfterDBChanged(notebookId)

  }
  static redo(notebookId = this.currentNotebookId){
    UndoManager.sharedInstance().redo()
    this.app.refreshAfterDBChanged(notebookId)
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
  static undoGrouping(f,notebookId = this.currentNotebookId){
    UndoManager.sharedInstance().undoGrouping(
      String(Date.now()),
      notebookId,
      f
    )
    this.app.refreshAfterDBChanged(notebookId)
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
  static undoGroupingNotRefresh(f,notebookId = this.currentNotebookId){
    UndoManager.sharedInstance().undoGrouping(
      String(Date.now()),
      notebookId,
      f
    )
  }
  static getNoteColorHex(colorIndex){
    let theme = MNUtil.app.currentTheme
    let colorConfig = {
      Default:["#ffffb4","#ccfdc4","#b4d1fb","#f3aebe","#ffff54","#75fb4c","#55bbf9","#ea3323","#ef8733","#377e47","#173dac","#be3223","#ffffff","#dadada","#b4b4b4","#bd9edc"],
      Dark:["#a0a071","#809f7b","#71839e","#986d77","#a0a032","#479e2c","#33759c","#921c12","#96551c","#204f2c","#0c266c","#771e14","#a0a0a0","#898989","#717171","#77638a"],
      Gary:["#d2d294","#a8d1a1","#94accf","#c88f9d","#d2d244","#5fcf3d","#459acd","#c0281b","#c46f28","#2c683a","#12328e","#9c281c","#d2d2d2","#b4b4b4","#949494","#9c82b5"]
    }
    let colorHexes = (theme in colorConfig)?colorConfig[theme]:colorConfig["Default"]
    if (colorIndex !== undefined && colorIndex >= 0) {
      return colorHexes[colorIndex]
    }
    return "#ffffff"
  }
  static getImage(path,scale=2) {
    return UIImage.imageWithDataScale(NSData.dataWithContentsOfFile(path), scale)
  }
  static getFile(path) {
    return NSData.dataWithContentsOfFile(path)
  }
  /**
   * Extracts the file name from a full file path.
   * 
   * This method takes a full file path as input and extracts the file name by finding the last occurrence
   * of the '/' character and then taking the substring from that position to the end of the string.
   * 
   * @param {string} fullPath - The full path of the file.
   * @returns {string} The extracted file name.
   */
  static getFileName(fullPath) {
      // 找到最后一个'/'的位置
      let lastSlashIndex = fullPath.lastIndexOf('/');

      // 从最后一个'/'之后截取字符串，得到文件名
      let fileName = fullPath.substring(lastSlashIndex + 1);

      return fileName;
  }
  static getMediaByHash(hash) {
    let image = this.db.getMediaByHash(hash)
    return image
  }
  /**
   * 左 0, 下 1，3, 上 2, 右 4
   * @param {*} sender
   * @param {object[]} commandTable
   * @param {number} width
   * @param {number} preferredPosition
   * @returns
   */
  static getPopoverAndPresent(sender,commandTable,width=100,preferredPosition=2) {
    let position = preferredPosition
    var menuController = MenuController.new();
    menuController.commandTable = commandTable
    // menuController.sections = [commandTable,commandTable]
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
    let targetView = this.studyView
    var r = sender.convertRectToView(sender.bounds,targetView);
    // MNUtil.showHUD("message"+preferredPosition)
    switch (preferredPosition) {
      case 0:
        if (r.x < 50) {
          position = 4
        }
        break;
      case 1:
      case 3:
        if (r.y+r.height > targetView.frame.height - 50) {
          position = 2
        }
        break;
      case 2:
        if (r.y < 50) {
          position = 3
        }
        break;
      case 4:
        if (r.x+r.width > targetView.frame.width - 50) {
          position = 0
        }
        break;
      default:
        break;
    }
    popoverController.presentPopoverFromRect(r, targetView, position, true);
    return popoverController
  }
  /**
   *
   * @param {string} name
   * @param {*} userInfo
   */
  static postNotification(name,userInfo) {
    NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo(name, this.currentWindow, userInfo)
  }
  /**
   * Parses a 6/8-digit hexadecimal color string into a color object.
   * 
   * @param {string} hex - The 6/8-digit hexadecimal color string to parse.
   * @returns {object} An object with the following properties: `color` (the parsed color string), and `opacity` (the opacity of the color).
   */
  static parseHexColor(hex) {
    // 检查输入是否是有效的6位16进制颜色字符串
    if (typeof hex === 'string' && hex.length === 7) {
          return {
              color: hex,
              opacity: 1
          };
    }
    // 检查输入是否是有效的8位16进制颜色字符串
    if (typeof hex !== 'string' || !/^#([0-9A-Fa-f]{8})$/.test(hex)) {
        throw new Error('Invalid 8-digit hexadecimal color');
    }

    // 提取红色、绿色、蓝色和不透明度的16进制部分
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = parseInt(hex.slice(7, 9), 16) / 255; // 转换为0到1的不透明度

    // 将RGB值转换为6位16进制颜色字符串
    const rgbHex = `#${hex.slice(1, 7)}`;

    return {
        color: rgbHex,
        opacity: parseFloat(a.toFixed(2)) // 保留2位小数
    };
  }
  static hexColorAlpha(hex,alpha=1.0) {
    let color = UIColor.colorWithHexString(hex)
    return alpha!==undefined?color.colorWithAlphaComponent(alpha):color
  }
  /**
   * 
   * @param {string} hex 
   * @returns {UIColor}
   */
  static hexColor(hex) {
    let colorObj = this.parseHexColor(hex)
    return MNUtil.hexColorAlpha(colorObj.color,colorObj.opacity)
  }
  static genNSURL(url) {
    return NSURL.URLWithString(url)
  }
  /**
   * 默认在当前学习集打开
   * @param {string} md5 
   * @param {string} notebookId
   */
  static openDoc(md5,notebookId=MNUtil.currentNotebookId){
    MNUtil.studyController.openNotebookAndDocument(notebookId, md5)
    let splitMode = MNUtil.docMapSplitMode
    if (splitMode === 0) {
      MNUtil.docMapSplitMode = 1
    }
  }
  /**
   * Converts NSData to a string.
   * 
   * This method checks if the provided data object has a base64 encoding method. If it does,
   * it decodes the base64 data and converts it to a UTF-8 string. If the data object does not
   * have a base64 encoding method, it returns the data object itself.
   * 
   * @param {NSData} data - The data object to be converted to a string.
   * @returns {string} The converted string.
   */
  static data2string(data){
    if (data.base64Encoding) {
      let test = CryptoJS.enc.Base64.parse(data.base64Encoding())
      let textString = CryptoJS.enc.Utf8.stringify(test);
      return textString
    }else{
      return data
    }
  }
  static string2data(string){
    return NSData.dataWithStringEncoding(string, 4)
  }
  /**
   * Converts NSData to a string.
   * 
   * 
   * @param {NSData} data - The data object to be converted to a string.
   * @returns {string} The converted string.
   */
  static dataToString(data){
    if (data instanceof NSData) {
      return NSString.stringWithContentsOfData(data)
    }
    return data
  }
  /**
   * 
   * @param {object} object 
   * @returns 
   */
  static stringify(object){
    return JSON.stringify(object, undefined, 2)
  }
  /**
   * 
   * @param {string} path 
   * @returns {object|undefined}
   */
  static readJSON(path){
    if (!this.isfileExists(path)) {
      return undefined
    }
    let data = NSData.dataWithContentsOfFile(path)
    const res = NSJSONSerialization.JSONObjectWithDataOptions(
      data,
      1<<0
    )
    if (NSJSONSerialization.isValidJSONObject(res)) {
      return res
    }else{
      return undefined
    }
  }
  static writeJSON(path,object){
  try {
    let data = this.string2data(JSON.stringify(object, undefined, 2))
    this.writeDataToFile(data,path)
    return true
  } catch (error) {
    this.addErrorLog(error, "writeJSON")
    return false
  }
  }
  static readText(path){

    let data = NSData.dataWithContentsOfFile(path)
    return this.dataToString(data)
  }
  static writeText(path,string){
  try {
    let data = this.string2data(string)
    this.writeDataToFile(data,path)
    return true
    
  } catch (error) {
    this.addErrorLog(error, "writeText")
    return false
  }
  }
  static readTextFromUrlSync(url){
    let textData = NSData.dataWithContentsOfURL(this.genNSURL(url))
    let text = this.data2string(textData)
    return text
  }
  static async readTextFromUrlAsync(url,option={}){
    // MNUtil.copy("readTextFromUrlAsync")
    let res = await MNConnection.fetch(url,option)
    if (!res.base64Encoding && "timeout" in res && res.timeout) {
      return undefined
    }
    let text = this.data2string(res)
    return text
  }
  static isAddonRunning(addonName){
    let addonNameUpper = addonName.toUpperCase()
    switch (addonNameUpper) {
      case "SNIPASTE":
      case "MNSNIPASTE":
      case "MN SNIPASTE":
      case "MARGINNOTE.EXTENSION.MNSNIPASTE":
        return typeof snipasteUtils !== "undefined"
      case "WEBDAV":
      case "MNWEBDAV":
      case "MN WEBDAV":
      case "MARGINNOTE.EXTENSION.MNWEBDAV":
        return typeof webdavUtils !== "undefined"
      case "CHATAI":
      case "MNCHATAI":
      case "MN CHATAI":
      case "MARGINNOTE.EXTENSION.MNCHATGLM":
        return typeof chatAIUtils !== "undefined"
      case "BROWSER":
      case "MNBROWSER":
      case "MN BROWSER":
      case "MARGINNOTE.EXTENSION.MNBROWSER":
        return typeof browserUtils !== "undefined"
      case "TOOLBAR":
      case "MNTOOLBAR":
      case "MN TOOLBAR":
      case "MARGINNOTE.EXTENSION.MNTOOLBAR":
        return typeof toolbarUtils !== "undefined"
      case "MILKDOWN":
      case "MNMILKDOWN":
      case "MN MILKDOWN":
      case "MARGINNOTE.EXTENSION.MNMILKDOWN":
        return typeof milkdownUtils !== "undefined"
      case "EDITOR":
      case "MNEDITOR":
      case "MN EDITOR":
      case "MARGINNOTE.EXTENSION.MNEDITOR":
        return typeof editorUtils !== "undefined"
      case "CKEDITOR":
      case "MNCKEDITOR":
      case "MN CKEDITOR":
      case "MARGINNOTE.EXTENSION.MNCKEDITOR":
        return typeof ckeditorUtils !== "undefined"
      case "OCR":
      case "MNOCR":
      case "MN OCR":
      case "MARGINNOTE.EXTENSION.MNOCR":
        return typeof ocrUtils !== "undefined"
      case "AUTOSTYLE":
      case "MNAUTOSTYLE":
      case "MN AUTOSTYLE":
      case "MARGINNOTE.EXTENSION.MNAUTOSTYLE":
        return typeof autoUtils !== "undefined"
      default:
    }
    return false
  }
  /**
   * Encrypts or decrypts a string using XOR encryption with a given key.
   * 
   * This method performs XOR encryption or decryption on the input string using the provided key.
   * Each character in the input string is XORed with the corresponding character in the key,
   * repeating the key if it is shorter than the input string. The result is a new string
   * where each character is the XOR result of the original character and the key character.
   * 
   * @param {string} input - The input string to be encrypted or decrypted.
   * @param {string} key - The key used for XOR encryption or decryption.
   * @returns {string} The encrypted or decrypted string.
   */
  static xorEncryptDecrypt(input, key) {
    let output = [];
    for (let i = 0; i < input.length; i++) {
        // Perform XOR between the input character and the key character
        output.push(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return String.fromCharCode.apply(null, output);
  }
  // static encrypt(text,key){
  //   var encrypted = CryptoJS.AES.encrypt(text, key).toString();
  //   return encrypted
  // }
  // static decrypt(text,key){
  //   var decrypted = CryptoJS.AES.decrypt(text, key).toString();
  //   var originalText = decrypted.toString(CryptoJS.enc.Utf8);
  //   return originalText
  // }
  static MD5(data){
    let md5 = CryptoJS.MD5(data).toString();
    return md5
  }
  static parseMNImageURL(MNImageURL){
    if (MNImageURL.includes("markdownimg/png/")) {
      let hash = MNImageURL.split("markdownimg/png/")[1]
      this.imageTypeCache[hash] = "png"
      return {
        hash: hash,
        type: "png",
        ext: "png"
      }
    }else if (MNImageURL.includes("markdownimg/jpeg/")) {
      let hash = MNImageURL.split("markdownimg/jpeg/")[1]
      this.imageTypeCache[hash] = "jpeg"
      return {
        hash: hash,
        type: "jpeg",
        ext: "jpg"
      }
    }
    return undefined
  }
  static replaceMNImagesWithBase64(markdown) {
  // if (/!\[.*?\]\((marginnote4app\:\/\/markdownimg\/png\/.*?)(\))/) {

  //   // ![image.png](marginnote4app://markdownimg/png/eebc45f6b237d8abf279d785e5dcda20)
  // }
try {
    // 处理 Markdown 字符串，替换每个 base64 图片链接
    const result = markdown.replace(this.MNImagePattern, (match, MNImageURL,p2) => {
      // 你可以在这里对 base64Str 进行替换或处理
      // shouldOverWritten = true
      let imageConfig = this.parseMNImageURL(MNImageURL)
      let hash = imageConfig.hash
      let imageData = MNUtil.getMediaByHash(hash)
      let imageBase64 = imageData.base64Encoding()
      // if (!imageData) {
      //   return match.replace(MNImageURL, hash+".png");
      // }
      // imageData.writeToFileAtomically(editorUtils.bufferFolder+hash+".png", false)
      return match.replace(MNImageURL, "data:image/"+imageConfig.type+";base64,"+imageBase64);
    });
  return result;
} catch (error) {
  this.addErrorLog(error, "replaceMNImagesWithBase64")
  return undefined
}
}

  static md2html(md){
    let tem = this.replaceMNImagesWithBase64(md)
    return marked.parse(tem.replace(/_{/g,'\\_\{').replace(/_\\/g,'\\_\\'))
  }
  /**
   * Escapes special characters in a string to ensure it can be safely used in JavaScript code.
   * 
   * This method escapes backslashes, backticks, template literal placeholders, carriage returns,
   * newlines, single quotes, and double quotes in the input string. The resulting string can be
   * safely used in JavaScript code without causing syntax errors.
   * 
   * @param {string} str - The input string to be escaped.
   * @returns {string} The escaped string.
   */
  static escapeString(str) {
    return str.replace(/\\/g, '\\\\') // Escape backslashes
              .replace(/\`/g, '\\`') // Escape backticks
              .replace(/\$\{/g, '\\${') // Escape template literal placeholders
              .replace(/\r/g, '\\r') // Escape carriage returns
              .replace(/\n/g, '\\n') // Escape newlines
              .replace(/'/g, "\\'")   // Escape single quotes
              .replace(/"/g, '\\"');  // Escape double quotes
  }
  static getLocalDataByKey(key) {
    return NSUserDefaults.standardUserDefaults().objectForKey(key)
  }
  /**
   * 从本地获取数据，如果本地没有，则从备份文件中获取，如果备份文件也没有，则使用默认值
   * @param {string} key 
   * @param {any} defaultValue 
   * @param {string} backUpFile 
   * @returns 
   */
  static getLocalDataByKeyWithDefaultAndBackup(key,defaultValue,backUpFile) {
    let value = NSUserDefaults.standardUserDefaults().objectForKey(key)
    if (value === undefined) {
      if (backUpFile && this.isfileExists(backUpFile)) {//需要检查备份文件
        let backupConfig = this.readJSON(backUpFile)
        if (backupConfig && Object.keys(backupConfig).length > 0) {
          this.log("readFromBackupFile")
          return backupConfig
        }
      }
      NSUserDefaults.standardUserDefaults().setObjectForKey(defaultValue,key)
      return defaultValue
    }
    return value
  }
  static setLocalDataByKey(data, key) {
    NSUserDefaults.standardUserDefaults().setObjectForKey(data, key)
  }
  static getCloudDataByKey(key) {
    return NSUbiquitousKeyValueStore.defaultStore().objectForKey(key)
  }
  static setCloudDataByKey(data, key) {
    NSUbiquitousKeyValueStore.defaultStore().setObjectForKey(data, key)
  }

  /**
   *
   * @param {string | string[]} UTI
   * @returns
   */
  static async importFile(UTI){
    if (Array.isArray(UTI)) {
      return new Promise((resolve, reject) => {
        this.app.openFileWithUTIs(UTI,this.studyController,(path)=>{
          resolve(path)
        })
      })
    }else{
      return new Promise((resolve, reject) => {
        this.app.openFileWithUTIs([UTI],this.studyController,(path)=>{
          resolve(path)
        })
      })
    }
  }
  /**
   * 弹出文件选择窗口,选中json后直接返回对应的json对象
   * @returns {Object}
   */
  static async importJSONFromFile(){
    let path = await MNUtil.importFile("public.json")
    return this.readJSON(path)
  }
  static saveFile(filePath, UTI) {
    this.app.saveFileWithUti(filePath, UTI)
  }
  /**
   * 去重
   * @param {T[]} arr
   * @param {boolean} noEmpty
   * @returns {T[]}
   */
 static unique (arr, noEmpty = false){
  let ret = []
  if (arr.length <= 1) ret = arr
  else ret = Array.from(new Set(arr))
  if (noEmpty) ret = ret.filter(k => k)
  return ret
}
  /**
   * 
   * @param {undefined|string|MNNote|MbBookNote|NSData|UIImage} object 
   * @returns 
   */
  static typeOf(object){
    if (typeof object === "undefined") {
      return "undefined"
    }
    if (typeof object === "string") {
      if (/^marginnote\dapp:\/\/note\//.test(object.trim())) {
        return "NoteURL"
      }
      if (/^marginnote\dapp:\/\/notebook\//.test(object.trim())) {
        return "NotebookURL"
      }
      if (/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/.test(object.trim())) {
        return "NoteId"
      }
      return "string"
    }
    if (object instanceof MNNote) {
      return "MNNote"
    }
    if (object instanceof MNNotebook) {
      return "MNNotebook"
    }
    if (object instanceof NSData) {
      return "NSData"
    }
    if (object instanceof UIImage) {
      return "UIImage"
    }
    if (object instanceof MNComment) {
      return "MNComment"
    }
    if (object.noteId) {
      return "MbBookNote"
    }
    if (object instanceof NSURL) {
      return "NSURL"
    }
    if (object instanceof NSURLRequest) {
      return "NSURLRequest"
    }
    if ("title" in object || "content" in object || "excerptText" in object) {
      return "NoteConfig"
    }

    return typeof object

  }
  static getNoteId(note){
    let noteId
    switch (this.typeOf(note)) {
      case "MbBookNote":
        noteId = note.noteId
        break;
      case "NoteURL":
        noteId = this.getNoteIdByURL(note)
        break;
      case "NoteId":
      case 'string':
        noteId = note
        break;
      default:
        this.showHUD("MNUtil.getNoteId: Invalid param")
        return undefined
    }
    return noteId
  }
  /**
   * 注意即使是纯文档模式，也可能是allMap（返回0）,且studyMode为2,所以需要使用currentNotebook.flags来判断
   * @returns {number}
   * allMap = 0,
   * half = 1,
   * allDoc = 2
   */
  static get docMapSplitMode(){
    let notebookType = this.currentNotebook.flags
    if (notebookType === 1) {//文档模式下，直接返回当前文档控制器的焦点笔记
      //此时studyController.docMapSplitMode为0，但实际上为纯文档模式，应返回2
      return 2
    }
    return this.studyController.docMapSplitMode
  }
  static set docMapSplitMode(mode){
    let notebookType = this.currentNotebook.flags
    if (notebookType === 1) {//文档模式
      //纯文档模式下不允许调整docMapSplitMode
      return
    }
    this.studyController.docMapSplitMode = mode
  }
  /**
   * Retrieves the image data from the current document controller or other document controllers if the document map split mode is enabled.
   * 
   * This method checks for image data in the current document controller's selection. If no image is found, it checks the focused note within the current document controller.
   * If the document map split mode is enabled, it iterates through all document controllers to find the image data. If a pop-up selection info is available, it also checks the associated document controller.
   * 
   * @param {boolean} [checkImageFromNote=false] - Whether to check the focused note for image data.
   * @param {boolean} [checkDocMapSplitMode=false] - Whether to check other document controllers if the document map split mode is enabled.
   * @returns {NSData|undefined} The image data if found, otherwise undefined.
   */
  static getDocImage(checkImageFromNote=false,checkDocMapSplitMode=false){
  try {

    let docMapSplitMode = this.docMapSplitMode
    if (checkDocMapSplitMode && !docMapSplitMode) {
      return undefined
    }
    let imageData = this.currentDocController.imageFromSelection()
    if (imageData) {
      return imageData
    }
    if (checkImageFromNote) {
      imageData = this.currentDocController.imageFromFocusNote()
    }
    if (imageData) {
      return imageData
    }
    // MNUtil.showHUD("message"+this.docControllers.length)
    if (docMapSplitMode) {//不为0则表示documentControllers存在
      let imageData
      let docNumber = this.docControllers.length
      for (let i = 0; i < docNumber; i++) {
        const docController = this.docControllers[i];
        imageData = docController.imageFromSelection()
        if (!imageData && checkImageFromNote) {
          imageData = docController.imageFromFocusNote()
        }
        if (imageData) {
          return imageData
        }
      }
    }
    if (this.popUpSelectionInfo) {
      let docController = this.popUpSelectionInfo.docController
      let imageData = docController.imageFromSelection()
      if (imageData) {
        return imageData
      }
      if (checkImageFromNote) {
        imageData = docController.imageFromFocusNote()
      }
      if (imageData) {
        return imageData
      }
    }
    return undefined
  } catch (error) {
    this.addErrorLog(error, "getDocImage")
    return undefined
  }
  }
  /**
   * 
   * @param {"AddToReview"|"AddToTOC"|"BackupDB"|"BindSplit"|"BookTOC"|"BookPageList"|"BookMarkList"|"BookSketchList"|"BookCardList"|"BookSearch"|"BookPageFlip"|"BookPageScroll"|"BookPageNumber"|"BookMarkAdd"|"BookMarkRemove"|"ClearTemp"|"ClearFormat1"|"ClearFormat2"|"CommonCopy"|"CollapseExtend"|"ContinueExcerpt"|"DBVaults"|"DraftList"|"EditAddTitle"|"EditAddText"|"EditAppendComment"|"EditArrangeNotes"|"EditUndo"|"EditRedo"|"EditCut"|"EditCopy"|"EditCopyLink"|"EditDeleteNote"|"EditDocLayers"|"EditPaste"|"EditPDFPages"|"EditMarkdown"|"EditTextBox"|"EditTextMode"|"EditImageBox"|"EditGroupNotes"|"EditLinkNotes"|"EditMultiSel"|"EditMergeNotes"|"EditOcclusion"|"EditOutlineIncLevel"|"EditOutlineDecLevel"|"EditReference"|"EditSelAll"|"EditTagNote"|"EditUnmergeNote"|"EditColorNoteIndex0"|"EditColorNoteIndex1"|"EditColorNoteIndex2"|"EditColorNoteIndex3"|"EditColorNoteIndex4"|"EditColorNoteIndex5"|"EditColorNoteIndex6"|"EditColorNoteIndex7"|"EditColorNoteIndex8"|"EditColorNoteIndex9"|"EditColorNoteIndex10"|"EditColorNoteIndex11"|"EditColorNoteIndex12"|"EditColorNoteIndex13"|"EditColorNoteIndex14"|"EditColorNoteIndex15"|"ExcerptToolSettings"|"ExcerptToolSelect"|"ExcerptToolCustom0"|"ExcerptToolCustom1"|"ExcerptToolCustom2"|"ExcerptToolCustom3"|"ExcerptToolSketch"|"EmphasisCloze"|"ExportPKG"|"ExportVault"|"ExportMapPDF"|"ExportDocPDF"|"ExportOmni"|"ExportWord"|"ExportMind"|"ExportAnki"|"ExtendSplit"|"ExtendMargin"|"ExtendPopup"|"ExpandExtend"|"FocusNote"|"FocusParent"|"FoldHighlight"|"FullTextSearch"|"FlashcardsPlay"|"FlashcardsStop"|"FlashcardFlip"|"FlashcardLocal"|"FlashcardAgain"|"FlashcardHard"|"FlashcardGood"|"FlashcardEasy"|"FlashcardStarred"|"FlashcardSpeech"|"GlobalBranchStyle"|"GoBack"|"GoForward"|"GoiCloud"|"GoManual"|"GoNewFeatures"|"GoSettings"|"GoUserGuide"|"HideSketch"|"HighlightShortcut1"|"HighlightShortcut2"|"HighlightShortcut3"|"HighlightShortcut4"|"InAppPurchase"|"InsertBlank"|"ManageDocs"|"MergeTo"|"MindmapSnippetMode"|"NotebookOutline"|"NotebookOutlineEdit"|"NewSiblingNote"|"NewChildNote"|"NewParentNote"|"OpenTrash"|"OpenExtensions"|"PdfCrop"|"RemoveFromMap"|"SendToMap"|"ShareLicenses"|"SharePackage"|"SplitBook"|"SyncMindMapToBook"|"SyncBookToMindMap"|"SyncWindowPos"|"SyncDeletion"|"SetAsEmphasis"|"SetCloneCopyMode"|"SetCommentHighlight"|"SetRefCopyMode"|"SetTitleHighlight"|"SourceHighlight"|"SnippetMode"|"SelBranchStyle0"|"SelBranchStyle1"|"SelBranchStyle2"|"SelBranchStyle3"|"SelBranchStyle4"|"SelBranchStyle60"|"SelBranchStyle61"|"SelBranchStyle64"|"SelBranchStyle7"|"SelBranchStyle100"|"SelectBranch"|"ShowSketch"|"TabNextFile"|"TabPrevFile"|"TextToTitle"|"Translate"|"ToggleAddFile"|"ToggleBookLeft"|"ToggleBookBottom"|"ToggleCards"|"ToggleDocument"|"ToggleExpand"|"ToggleFullDoc"|"ToggleSplit"|"ToggleSidebar"|"ToggleTabsBar"|"ToggleTextLink"|"ToggleMindMap"|"ToggleMoreSettings"|"ToggleReview"|"ToggleResearch"|"UIStatusURL"|"ViewCollapseRows"|"ViewCollapseAll"|"ViewDocCardGroup"|"ViewExpandAll"|"ViewExpandLevel0"|"ViewExpandLevel1"|"ViewExpandLevel2"|"ViewExpandLevel3"|"ViewExpandLevel4"|"ViewExpandLevel5"|"ViewExpandLevel6"|"ViewExpandLevel7"|"ViewExpandRows"|"ViewMapCardGroup"|"ZoomToFit"} command 
   */
  static excuteCommand(command){
    let urlPre = "marginnote4app://command/"
    if (command) {
      let url = urlPre+command
      this.openURL(url)
      return
    }
  }
  /**
   * 
   * @param {"AddToReview"|"AddToTOC"|"BackupDB"|"BindSplit"|"BookTOC"|"BookPageList"|"BookMarkList"|"BookSketchList"|"BookCardList"|"BookSearch"|"BookPageFlip"|"BookPageScroll"|"BookPageNumber"|"BookMarkAdd"|"BookMarkRemove"|"ClearTemp"|"ClearFormat1"|"ClearFormat2"|"CommonCopy"|"CollapseExtend"|"ContinueExcerpt"|"DBVaults"|"DraftList"|"EditAddTitle"|"EditAddText"|"EditAppendComment"|"EditArrangeNotes"|"EditUndo"|"EditRedo"|"EditCut"|"EditCopy"|"EditCopyLink"|"EditDeleteNote"|"EditDocLayers"|"EditPaste"|"EditPDFPages"|"EditMarkdown"|"EditTextBox"|"EditTextMode"|"EditImageBox"|"EditGroupNotes"|"EditLinkNotes"|"EditMultiSel"|"EditMergeNotes"|"EditOcclusion"|"EditOutlineIncLevel"|"EditOutlineDecLevel"|"EditReference"|"EditSelAll"|"EditTagNote"|"EditUnmergeNote"|"EditColorNoteIndex0"|"EditColorNoteIndex1"|"EditColorNoteIndex2"|"EditColorNoteIndex3"|"EditColorNoteIndex4"|"EditColorNoteIndex5"|"EditColorNoteIndex6"|"EditColorNoteIndex7"|"EditColorNoteIndex8"|"EditColorNoteIndex9"|"EditColorNoteIndex10"|"EditColorNoteIndex11"|"EditColorNoteIndex12"|"EditColorNoteIndex13"|"EditColorNoteIndex14"|"EditColorNoteIndex15"|"ExcerptToolSettings"|"ExcerptToolSelect"|"ExcerptToolCustom0"|"ExcerptToolCustom1"|"ExcerptToolCustom2"|"ExcerptToolCustom3"|"ExcerptToolSketch"|"EmphasisCloze"|"ExportPKG"|"ExportVault"|"ExportMapPDF"|"ExportDocPDF"|"ExportOmni"|"ExportWord"|"ExportMind"|"ExportAnki"|"ExtendSplit"|"ExtendMargin"|"ExtendPopup"|"ExpandExtend"|"FocusNote"|"FocusParent"|"FoldHighlight"|"FullTextSearch"|"FlashcardsPlay"|"FlashcardsStop"|"FlashcardFlip"|"FlashcardLocal"|"FlashcardAgain"|"FlashcardHard"|"FlashcardGood"|"FlashcardEasy"|"FlashcardStarred"|"FlashcardSpeech"|"GlobalBranchStyle"|"GoBack"|"GoForward"|"GoiCloud"|"GoManual"|"GoNewFeatures"|"GoSettings"|"GoUserGuide"|"HideSketch"|"HighlightShortcut1"|"HighlightShortcut2"|"HighlightShortcut3"|"HighlightShortcut4"|"InAppPurchase"|"InsertBlank"|"ManageDocs"|"MergeTo"|"MindmapSnippetMode"|"NotebookOutline"|"NotebookOutlineEdit"|"NewSiblingNote"|"NewChildNote"|"NewParentNote"|"OpenTrash"|"OpenExtensions"|"PdfCrop"|"RemoveFromMap"|"SendToMap"|"ShareLicenses"|"SharePackage"|"SplitBook"|"SyncMindMapToBook"|"SyncBookToMindMap"|"SyncWindowPos"|"SyncDeletion"|"SetAsEmphasis"|"SetCloneCopyMode"|"SetCommentHighlight"|"SetRefCopyMode"|"SetTitleHighlight"|"SourceHighlight"|"SnippetMode"|"SelBranchStyle0"|"SelBranchStyle1"|"SelBranchStyle2"|"SelBranchStyle3"|"SelBranchStyle4"|"SelBranchStyle60"|"SelBranchStyle61"|"SelBranchStyle64"|"SelBranchStyle7"|"SelBranchStyle100"|"SelectBranch"|"ShowSketch"|"TabNextFile"|"TabPrevFile"|"TextToTitle"|"Translate"|"ToggleAddFile"|"ToggleBookLeft"|"ToggleBookBottom"|"ToggleCards"|"ToggleDocument"|"ToggleExpand"|"ToggleFullDoc"|"ToggleSplit"|"ToggleSidebar"|"ToggleTabsBar"|"ToggleTextLink"|"ToggleMindMap"|"ToggleMoreSettings"|"ToggleReview"|"ToggleResearch"|"UIStatusURL"|"ViewCollapseRows"|"ViewCollapseAll"|"ViewDocCardGroup"|"ViewExpandAll"|"ViewExpandLevel0"|"ViewExpandLevel1"|"ViewExpandLevel2"|"ViewExpandLevel3"|"ViewExpandLevel4"|"ViewExpandLevel5"|"ViewExpandLevel6"|"ViewExpandLevel7"|"ViewExpandRows"|"ViewMapCardGroup"|"ZoomToFit"} command 
   */
  static executeCommand(command){
    let urlPre = "marginnote4app://command/"
    if (command) {
      let url = urlPre+command
      this.openURL(url)
      return
    }
  }
  /**
   *
   * @param {number[]} arr
   * @param {string} type
   */
  static sort(arr,type="increment"){
    let arrToSort = arr
    switch (type) {
      case "decrement":
        arrToSort.sort((a, b) => b - a);
        break;
      case "increment":
        arrToSort.sort((a, b) => a - b);
        break;
      default:
        break;
    }
    return [...new Set(arrToSort)]
  }
  /**
   * Displays an input dialog with a title, subtitle, and a list of items.
   * 
   * This method shows an input dialog with the specified title and subtitle. It allows the user to input text and select from a list of items.
   * The method returns a promise that resolves with an object containing the input text and the index of the button clicked by the user.
   * 
   * @param {string} title - The main title of the input dialog.
   * @param {string} subTitle - The subtitle of the input dialog.
   * @param {string[]} items - The list of items to display in the dialog.
   * @returns {Promise<{input:string,button:number}>} A promise that resolves with an object containing the input text and the button index.
   */
  static async input(title,subTitle="",items = ["Cancel","Confirm"],options=undefined) {
    if (MNOnAlert) {
      return
    }
    MNOnAlert = true
    return new Promise(async(resolve, reject) => {
      let alertview = UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        title,subTitle,2,items[0],items.slice(1),
        (alert, buttonIndex) => {
          let res = {input:alert.textFieldAtIndex(0).text,button:buttonIndex}
          MNOnAlert = false
          resolve(res)
        }
      )
      if (options) {
        try {
          await MNUtil.delay(0.5)
          let textField = alertview.textFieldAtIndex(0)
          while (!textField) {
            await MNUtil.delay(0.1)
            textField = alertview.textFieldAtIndex(0)
          }
          if ("placeholder" in options) {
            textField.text = options.placeholder
          }
          if ("default" in options) {
            textField.text = options.default
            let clearButtonMode = options.clearButtonMode ?? 1
            textField.clearButtonMode = clearButtonMode
          }
        } catch (error) {
          MNUtil.addErrorLog(error, "MNUtil.input")
        }
      }
    })
  }
  /**
   * Displays an input dialog with a title, subtitle, and a list of items.
   * 
   * This method shows an input dialog with the specified title and subtitle. It allows the user to input text and select from a list of items.
   * The method returns a promise that resolves with an object containing the input text and the index of the button clicked by the user.
   * 
   * @param {string} title - The main title of the input dialog.
   * @param {string} subTitle - The subtitle of the input dialog.
   * @param {string[]} items - The list of items to display in the dialog.
   * @returns {Promise<{input:string,button:number}>} A promise that resolves with an object containing the input text and the button index.
   */
  static async userInput(title,subTitle="",items = ["Cancel","Confirm"],options=undefined) {
    if (MNOnAlert) {
      return
    }
    MNOnAlert = true
    return new Promise(async (resolve, reject) => {
      let alertview = UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        title,subTitle,2,items[0],items.slice(1),
        (alert, buttonIndex) => {
          let res = {input:alert.textFieldAtIndex(0).text,button:buttonIndex}
          MNOnAlert = false
          resolve(res)
        }
      )
      if (options) {
        try {
          await MNUtil.delay(0.5)
          let textField = alertview.textFieldAtIndex(0)
          while (!textField) {
            await MNUtil.delay(0.1)
            textField = alertview.textFieldAtIndex(0)
          }
          if ("placeholder" in options) {
            textField.text = options.placeholder
          }
          if ("default" in options) {
            textField.text = options.default
            let clearButtonMode = options.clearButtonMode ?? 1
            textField.clearButtonMode = clearButtonMode
          }
        } catch (error) {
          this.addErrorLog(error, "MNUtil.input")
        }
      }
    })
  }


  /**
   * 注意这里的code需要是字符串
   * @param {string|number} code
   * @returns {string}
   */
  static getStatusCodeDescription(code){
  try {
    let des = {
    "200": "OK",
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
    "511": "Network Authentication Required",
    "525": "SSL handshake failed",
  }
  if (typeof code === "number") {
    if (code === 0) {
      return "Response is null"
    }
    let codeString = ""+code
    if (codeString in des) {
      return (codeString+": "+des[codeString])
    }
    return ""
  }
  if (code in des) {
    return (code+": "+des[code])
  }
  return ""
  } catch (error) {
    this.addErrorLog(error, "getStatusCodeDescription")
  }
  }
  /**
   * 
   * @param {string} template 
   * @param {object} config 
   * @returns {string}
   */
  static render(template,config){
    let output = mustache.render(template,config)
    return output
  }
  /**
   * 
   * @param {number} value 
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  static constrain(value, min, max) {
    if (min > max) {
      return Math.min(Math.max(value, max), min);
    }
    return Math.min(Math.max(value, min), max);
  }
  /**
   * max为10
   * @param {number} index 
   * @returns 
   */
  static emojiNumber(index){
    let emojiIndices = ["0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"]
    return emojiIndices[index]
  }
  static tableItem(title,object,selector,params,checked=false) {
    return {title:title,object:object,selector:selector,param:params,checked:checked}
  }
  static createJsonEditor(htmlPath){
    let jsonEditor = new UIWebView(MNUtil.genFrame(0, 0, 100, 100));
    try {
    
    jsonEditor.loadFileURLAllowingReadAccessToURL(
      NSURL.fileURLWithPath(this.mainPath + '/jsoneditor.html'),
      NSURL.fileURLWithPath(this.mainPath + '/')
    );
    } catch (error) {
      MNUtil.showHUD(error)
    }
    return jsonEditor
  }
  static deepEqual(obj1, obj2,keysToIgnore) {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || obj1 === null ||
        typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }

    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
    if (keysToIgnore && keysToIgnore.length) {
      keys1 = keys1.filter(k => !keysToIgnore.includes(k));
      keys2 = keys2.filter(k => !keysToIgnore.includes(k));
    }
    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!keys2.includes(key)) {
            return false;
        }
        if (keysToIgnore && keysToIgnore.length && keysToIgnore.includes(key)) {
          continue
        }
        if (!this.deepEqual(obj1[key], obj2[key])) {
          return false;
        }
    }
    return true;
  }
  static readCloudKey(key){
    let cloudStore = NSUbiquitousKeyValueStore.defaultStore()
    if (cloudStore) {
      return cloudStore.objectForKey(key)
    }else{
      return undefined
    }
  }
  static setCloudKey(key,value){
    let cloudStore = NSUbiquitousKeyValueStore.defaultStore()
    if (cloudStore) {
      cloudStore.setObjectForKey(value,key)
    }
  }
  /**
   * 
   * @param {string[]} arr 
   * @param {string} element 
   * @param {string} direction 
   * @returns {string[]}
   */
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
      return arr
  }
  /**
   * 
   * @returns {string}
   */
  static UUID() {
    return NSUUID.UUID().UUIDString()
  }
  static isPureMNImages(markdown) {
    try {
      // 匹配 base64 图片链接的正则表达式
      let res = markdown.match(this.MNImagePattern)
      if (res && res.length) {
        return markdown === res[0]
      }else{
        return false
      }
    } catch (error) {
      this.addErrorLog(error, "isPureMNImages")
      return false
    }
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
  static getMNImageURL(hash,type = "png"){
    if (hash in this.imageTypeCache) {
      type = this.imageTypeCache[hash]
    }
    return `marginnote4app://markdownimg/${type}/${hash}`
  }
  /**
   * 只返回第一个图片
   * @param {string} markdown 
   * @returns {NSData}
   */
  static getMNImageFromMarkdown(markdown) {
    try {
      let imageId = this.getMNImageIdFromMarkdown(markdown)
      if (imageId) {
        let imageData = MNUtil.getMediaByHash(imageId)
        return imageData
      }
      return undefined
    } catch (error) {
      this.addErrorLog(error, "getMNImageFromMarkdown")
      return undefined
    }
  }
  /**
   * 返回所有图片
   * @param {string} markdown 
   * @returns {NSData[]}
   */
  static getMNImagesFromMarkdown(markdown) {
    let imageIds = this.getMNImageIdsFromMarkdown(markdown)
    if (imageIds.length) {
      let imageDatas = imageIds.map(imageId=>MNUtil.getMediaByHash(imageId))
      return imageDatas
    }
    return []
  }
  /**
   * 只返回第一个图片
   * @param {string} markdown 
   * @returns {string[]}
   */
  static getMNImageIdsFromMarkdown(markdown) {
  try {

    let imageIds = []
    markdown.replace(this.MNImagePattern, (match, MNImageURL,p2) => {
      // 你可以在这里对 base64Str 进行替换或处理
      // shouldOverWritten = true
      let imageConfig = this.parseMNImageURL(MNImageURL)
      let hash = imageConfig.hash
      imageIds.push(hash)
      return ""
    });
    return imageIds
    
  } catch (error) {
    this.addErrorLog(error, "getMNImageIdsFromMarkdown")
    return undefined
  }
  }
  /**
   * 只返回第一个图片
   * @param {string} markdown 
   * @returns {string}
   */
  static getMNImageIdFromMarkdown(markdown) {
  try {
    let imageIds = this.getMNImageIdsFromMarkdown(markdown)
    if (imageIds.length) {
      return imageIds[0]
    }
    return undefined
  } catch (error) {
    this.addErrorLog(error, "getMNImageIdFromMarkdown")
    return undefined
  }
  }
  /**
   * 
   * @param {MNNote} note 
   */
  static getNoteObject(note,opt={first:true}) {
    try {
    if (!note) {
      return undefined
    }
      
    let noteConfig = config
    noteConfig.id = note.noteId
    if (opt.first) {
      noteConfig.notebook = {
        id:note.notebookId,
        name:this.getNoteBookById(note.notebookId).title,
      }
    }
    noteConfig.title = note.noteTitle
    noteConfig.url = note.noteURL
    noteConfig.excerptText = note.excerptText
    noteConfig.isMarkdownExcerpt = note.excerptTextMarkdown
    if (this.isBlankNote(note)) {
      noteConfig.isImageExcerpt = false
    }else{
      noteConfig.isImageExcerpt = !!note.excerptPic
    }
    if (note.textFirst !== undefined) {
      noteConfig.textFirst = note.textFirst
    }else{
      noteConfig.textFirst = false
    }
    noteConfig.date = {
      create:note.createDate.toLocaleString(),
      modify:note.modifiedDate.toLocaleString(),
    }
    noteConfig.allText = note.allNoteText()
    noteConfig.tags = note.tags
    noteConfig.hashTags = note.tags.map(tag=> ("#"+tag)).join(" ")
    noteConfig.hasTag = note.tags.length > 0
    noteConfig.hasComment = note.comments.length > 0
    noteConfig.hasChild = note.childNotes.length > 0
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
    if (note.docMd5 && this.getDocById(note.docMd5)) {
      noteConfig.docName = this.getFileName(this.getDocById(note.docMd5).pathFile) 
    }
    noteConfig.hasDoc = !!noteConfig.docName
    if (note.childMindMap) {
      noteConfig.childMindMap = this.getNoteObject(note.childMindMap,{first:false})
    }
    noteConfig.inMainMindMap = !noteConfig.childMindMap
    noteConfig.inChildMindMap = !!noteConfig.childMindMap
    if ("parent" in opt && opt.parent && note.parentNote) {
      if (opt.parentLevel && opt.parentLevel > 0) {
        noteConfig.parent = this.getNoteObject(note.parentNote,{parentLevel:opt.parentLevel-1,parent:true,first:false})
      }else{
        noteConfig.parent = this.getNoteObject(note.parentNote,{first:false})
      }
    }
    noteConfig.hasParent = "parent" in noteConfig
    if ("child" in opt && opt.child && note.childNotes) {
      noteConfig.child = note.childNotes.map(note=>this.getNoteObject(note,{first:false}))
    }
    return noteConfig
    } catch (error) {
      this.showHUD(error)
      return undefined
    }
  }
  static getDateObject(){
    let dateObject = {
      now:new Date(Date.now()).toLocaleString(),
      tomorrow:new Date(Date.now()+86400000).toLocaleString(),
      yesterday:new Date(Date.now()-86400000).toLocaleString(),
      year:new Date().getFullYear(),
      month:new Date().getMonth()+1,
      day:new Date().getDate(),
      hour:new Date().getHours(),
      minute:new Date().getMinutes(),
      second:new Date().getSeconds()
    }
    return dateObject
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
  if (hasMathFormula) {//存在公式内容
    if (/\:/.test(text)) {
      let splitedText = text.split(":")
      //冒号前有公式,则直接不设置标题,只设置excerpt且开启markdown
      if (this.containsMathFormula(splitedText[0])) {
        let config = {excerptText:text,excerptTextMarkdown:true}
        return config
      }
      //冒号前无公式,冒号后有公式
      if (this.containsMathFormula(splitedText[1])) {
        let config = {title:splitedText[0],excerptText:splitedText[1],excerptTextMarkdown:true}
        return config
      }
      let config = {title:splitedText[0],excerptText:splitedText[1]}
      return config
    }
    if (/\：/.test(text)) {
      let splitedText = text.split("：")
      //冒号前有公式,则直接不设置标题,只设置excerpt且开启markdown
      if (this.containsMathFormula(splitedText[0])) {
        let config = {excerptText:text,excerptTextMarkdown:true}
        return config
      }
      //冒号前无公式,冒号后有公式
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
static hasBackLink(from,to){
  let fromNote = MNNote.new(from)
  let targetNote = MNNote.new(to)//链接到的卡片
  if (targetNote.linkedNotes && targetNote.linkedNotes.length > 0) {
    if (targetNote.linkedNotes.some(n=>n.noteid === fromNote.noteId)) {
      return true
    }
  }
  return false
}
static extractMarginNoteLinks(text) {
    // 正则表达式匹配 marginnote4app://note/ 后面跟着的 UUID 格式的链接
    const regex = /marginnote4app:\/\/note\/[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/gi;
    
    // 使用 match 方法提取所有符合正则表达式的链接
    const links = text.match(regex);
    
    // 如果找到匹配的链接，返回它们；否则返回空数组
    return links || [];
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
  /**
 * NSValue can't be read by JavaScriptCore, so we need to convert it to string.
 */
static NSValue2String(v) {
  return Database.transArrayToJSCompatible([v])[0]
}
  /**
   * 
   * @param {string} str 
   * @returns {CGRect}
   */
  static CGRectString2CGRect(str) {
  const arr = str.match(/\d+\.?\d+/g).map(k => Number(k))
  return {
    x: arr[0],
    y: arr[1],
    height: arr[2],
    width: arr[3]
  }
}
  /**
   * 
   * @param {number} pageNo 
   * @returns {string}
   */
  static getPageContent(pageNo) {
  const { document } = this.currentDocController
  if (!document) return ""
  const data = document.textContentsForPageNo(pageNo)
  if (!data?.length) return ""
  return data
    .reduce((acc, cur) => {
      const line = cur.reduce((a, c) => {
        a += String.fromCharCode(Number(c.char))
        return a
      }, "")
      if (line) {
        const { y } = this.CGRectString2CGRect(this.NSValue2String(cur[0].rect))
        acc.push({
          y,
          line
        })
      }
      return acc
    }, [])
    .sort((a, b) => b.y - a.y)
    .map(k => k.line)
    .join(" ")
    .trim()
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
        if (note.excerptTextMarkdown) {
          return this.isPureMNImages(note.excerptText)
        }
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
}
/**
 * 类似fetch的Response对象
 */
class Response {
  /**
   * 创建一个模拟的 Response 对象
   * @param {NSData} data - 响应主体内容
   * @param {Object} [init] - 响应初始化选项
   */
  constructor(data = null, init = {}) {
    // 设置响应状态码和状态文本
    this.status = init.status !== undefined ? init.status : 200;
    this.statusText = init.statusText || (this.status >= 200 && this.status < 300 ? 'OK' : '');
    this.statusCodeDescription = MNUtil.getStatusCodeDescription(this.status) || '';
    
    // 初始化标头，使用 Headers 对象管理
    this.headers = new Headers(init.headers || {});
    
    // 设置响应主体
    if (data && !MNUtil.isNSNull(data)) {
      //空响应时传入的data可能为NSNull而非null
      this.body = data
    }
    
    // 设置响应类型标识
    this.type = init.type || 'default';
    this.url = init.url || '';
    this.redirected = init.redirected || false;
    this.ok = this.status >= 200 && this.status < 300;
    if (init.error) {
      this.error = init.error
    }
    
    // 缓存读取操作的 Promise
    this._bodyUsed = false;
    this._readPromises = new Map();
  }
  /**
   * 
   * @param {NSHTTPURLResponse} res 
   * @param {NSData} data 
   * @param {NSError} err 
   * @returns {Response}
   */
  static new(res,data,err,url){
    let init = {}
    if (err.localizedDescription) {
      init.error = err.localizedDescription
    }
    if (MNUtil.isNSNull(res)) {
      //API似乎存在bug，有时候res是null，这时候status为0，但是不代表无响应
      if (init.error) {
        init.status = 0
      }else{
        //如果没报错，则认为是200
        init.status = 200
      }
    }else{
      init.status = res.statusCode()
    }
    if (url) {
      init.url = url
    }
    // init.headers = res.allHeaderFields()
    return new Response(data,init)
  }
  /**
   * 响应内容复制到剪贴板，方便查看
   */
  copy(){
    let json = this.asJSONObject()
    MNUtil.copy(json)
  }
  asJSONObject(){
    let res = {
      status:this.status,
      statusText:this.statusText,
      statusCodeDescription:this.statusCodeDescription,
      headers:this.headers,
      type:this.type,
      url:this.url,
      error:this.error
    }
    if (this.body) {
      res.text = this.text()
      res.json = this.json()
      res.bodySize = this.body.length()
    }
    return res
  }

  /**
   * 解析响应主体为 Uint8Array
   * @param {BodyInit|null} body - 原始响应主体
   * @returns {Uint8Array|null} 解析后的二进制数组
   */
  _parseBody(body) {
    if (!body) return null;
    
    if (body instanceof Uint8Array) {
      return body;
    }
    
    // 文本类型转换为 UTF-8 字节
    if (typeof body === 'string') {
      const encoder = new TextEncoder();
      return encoder.encode(body);
    }
    
    // FormData 处理（简化版）
    if (body instanceof FormData) {
      const entries = Array.from(body.entries())
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      const encoder = new TextEncoder();
      return encoder.encode(entries);
    }
    
    throw new Error('Unsupported body type');
  }

  /**
   * 标记响应主体已被使用
   */
  _setBodyUsed() {
    //暂不启用
    return
    if (this._bodyUsed) {
      throw new TypeError('Body has already been consumed');
    }
    this._bodyUsed = true;
  }

  /**
   * 将响应主体转换为 ArrayBuffer
   * @returns {Promise<ArrayBuffer>}
   */
  arrayBuffer() {
    if (!this.body) {
      return Promise.resolve(new ArrayBuffer(0));
    }
    
    if (this._readPromises.has('arrayBuffer')) {
      return this._readPromises.get('arrayBuffer');
    }
    
    this._setBodyUsed();
    const promise = Promise.resolve(this.body.buffer.slice(
      this.body.byteOffset,
      this.body.byteOffset + this.body.byteLength
    ));
    
    this._readPromises.set('arrayBuffer', promise);
    return promise;
  }

  /**
   * 将响应主体转换为 Blob
   * @returns {Promise<Blob>}
   */
  blob() {
    return this.arrayBuffer().then(buffer => {
      const type = this.headers.get('content-type') || '';
      return new Blob([buffer], { type });
    });
  }
  get hasJSONResult(){
    let jsonResult = this.json()
    if (jsonResult && Object.keys(jsonResult).length > 0) {
      return true
    }
    return false
  }

  /**
   * 将响应主体转换为 JSON
   * 不包括statusCode等信息
   * @returns {Object|undefined}
   */
  json() {
    if (!this.body) {
      return Promise.resolve(undefined);
    }
    try {
    if (this.jsonResult) {
      // 避免重复解析
      return this.jsonResult
    }

    let result = NSJSONSerialization.JSONObjectWithDataOptions(
      this.body,
      1<<0
    )
    let validJson = NSJSONSerialization.isValidJSONObject(result)
    if (validJson) {
      this.jsonResult = result
      return result;
    }
    this._setBodyUsed();
    return new SyntaxError('Invalid JSON');
      
    } catch (error) {
      MNUtil.addErrorLog(error, "Response.json")
      return new SyntaxError('Invalid JSON');
    }
  }

  /**
   * 将响应主体转换为文本
   * @returns {string}
   */
  text() {
    if (!this.body) {
      return Promise.resolve('');
    }
    if (this.textResult) {
      // 避免重复解析
      return this.textResult
    }
    let text = MNUtil.dataToString(this.body)
    this.textResult = text
    this._setBodyUsed();
    return text
  }

  /**
   * 将响应主体转换为 FormData
   * @returns {Promise<FormData>}
   */
  formData() {
    return this.text().then(text => {
      const formData = new FormData();
      text.split('&').forEach(pair => {
        if (!pair) return;
        const [key, value] = pair.split('=').map(decodeURIComponent);
        formData.append(key, value);
      });
      return formData;
    });
  }

  /**
   * 克隆响应对象
   * @returns {Response}
   */
  clone() {
    if (this._bodyUsed) {
      throw new TypeError('Cannot clone a response that has been consumed');
    }
    
    // 创建新实例并复制属性
    const clonedBody = this.body ? new Uint8Array(this.body) : null;
    return new Response(clonedBody, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      type: this.type,
      url: this.url,
      redirected: this.redirected
    });
  }

  /**
   * 创建一个重定向响应
   * @param {string} url - 重定向目标 URL
   * @param {number} [status=302] - 重定向状态码
   * @returns {Response}
   */
  static redirect(url, status = 302) {
    if (![301, 302, 303, 307, 308].includes(status)) {
      throw new RangeError('Invalid status code');
    }
    
    return new Response(null, {
      status,
      headers: { Location: url }
    });
  }

  /**
   * 创建一个错误响应
   * @returns {Response}
   */
  static error() {
    return new Response(null, {
      status: 0,
      type: 'error'
    });
  }
}

// 用于管理响应头的类
class Headers {
  /**
   * 创建一个 Headers 实例
   * @param {HeadersInit} [init] - 初始头信息
   */
  constructor(init = {}) {
    this._headers = new Map();
    
    // 从不同格式初始化头信息
    if (init instanceof Headers) {
      init.forEach((value, key) => this.append(key, value));
    } else if (Array.isArray(init)) {
      init.forEach(([key, value]) => this.append(key, value));
    } else if (typeof init === 'object') {
      Object.entries(init).forEach(([key, value]) => this.append(key, value));
    }
  }

  /**
   * 添加头信息（不覆盖现有同名头）
   * @param {string} name - 头名称
   * @param {string} value - 头值
   */
  append(name, value) {
    const key = name.toLowerCase();
    const current = this._headers.get(key);
    this._headers.set(key, current ? `${current}, ${value}` : value.toString());
  }

  /**
   * 删除指定头信息
   * @param {string} name - 头名称
   */
  delete(name) {
    this._headers.delete(name.toLowerCase());
  }

  /**
   * 获取指定头信息
   * @param {string} name - 头名称
   * @returns {string|null}
   */
  get(name) {
    return this._headers.get(name.toLowerCase()) || null;
  }

  /**
   * 检查是否包含指定头信息
   * @param {string} name - 头名称
   * @returns {boolean}
   */
  has(name) {
    return this._headers.has(name.toLowerCase());
  }

  /**
   * 设置指定头信息（覆盖现有同名头）
   * @param {string} name - 头名称
   * @param {string} value - 头值
   */
  set(name, value) {
    this._headers.set(name.toLowerCase(), value.toString());
  }

  /**
   * 迭代所有头信息
   * @param {function} callback - 回调函数
   * @param {any} [thisArg] - 回调函数的 this 上下文
   */
  forEach(callback, thisArg) {
    this._headers.forEach((value, key) => callback.call(thisArg, value, key, this));
  }

  /**
   * 获取所有头名称迭代器
   * @returns {IterableIterator<string>}
   */
  keys() {
    return this._headers.keys();
  }

  /**
   * 获取所有头值迭代器
   * @returns {IterableIterator<string>}
   */
  values() {
    return this._headers.values();
  }

  /**
   * 获取所有头键值对迭代器
   * @returns {IterableIterator<[string, string]>}
   */
  entries() {
    return this._headers.entries();
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}
class MNConnection{
  static genURL(url) {
    return NSURL.URLWithString(url)
  }
  // static requestWithURL(url){
  //   return NSURLRequest.requestWithURL(NSURL.URLWithString(url))
  // }
  static requestWithURL(url){
    return NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url))
  }
  /**
   * Loads a URL request into a web view.
   * 
   * This method loads the specified URL into the provided web view. It creates an NSURLRequest object
   * from the given URL and then instructs the web view to load this request.
   * 
   * @param {UIWebView} webview - The web view into which the URL should be loaded.
   * @param {string} url - The URL to be loaded into the web view.
   */
  static loadRequest(webview,url,desktop){
    if (desktop !== undefined) {
      if (desktop) {
        webview.customUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15'
      }else{
        webview.customUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
      }
    }
    webview.loadRequest(NSURLRequest.requestWithURL(NSURL.URLWithString(url)));
  }
  /**
   * 
   * @param {UIWebView} webview 
   * @param {string} fileURL
   * @param {string} baseURL 
   */
  static loadFile(webview,file,baseURL){
    webview.loadFileURLAllowingReadAccessToURL(
      NSURL.fileURLWithPath(file),
      NSURL.fileURLWithPath(baseURL)
    )
  }
  /**
   * 
   * @param {UIWebView} webview 
   * @param {string} html
   * @param {string} baseURL 
   */
  static loadHTML(webview,html,baseURL){
    webview.loadHTMLStringBaseURL(
      html,
      NSURL.fileURLWithPath(baseURL)
    )
  }
  /**
   * Initializes an HTTP request with the specified URL and options.
   * 
   * This method creates an NSMutableURLRequest object with the given URL and sets the HTTP method, timeout interval, and headers.
   * It also handles query parameters, request body, form data, and JSON payloads based on the provided options.
   * 
   * @param {string} url - The URL for the HTTP request.
   * @param {Object} options - The options for the HTTP request.
   * @param {string} [options.method="GET"] - The HTTP method (e.g., "GET", "POST").
   * @param {number} [options.timeout=10] - The timeout interval for the request in seconds.
   * @param {Object} [options.headers] - Additional headers to include in the request.
   * @param {Object} [options.search] - Query parameters to append to the URL.
   * @param {string} [options.body] - The request body as a string.
   * @param {Object} [options.form] - Form data to include in the request body.
   * @param {Object} [options.json] - JSON data to include in the request body.
   * @returns {NSMutableURLRequest} The initialized NSMutableURLRequest object.
   */
  static initRequest(url,options) {
    const request = this.requestWithURL(url)
    let method = options.method ?? "GET"
    request.setHTTPMethod(method)
    request.setTimeoutInterval(options.timeout ?? 10)
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15",
      Accept: "application/json"
    }
    if (method !== "GET") {
      headers["Content-Type"] = "application/json"
    }
    // let newHearders = {
    //   ...headers,
    //   ...(options.headers ?? {})
    // }
    // MNUtil.copy(newHearders)
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
  /**
   * Sends an HTTP request asynchronously and returns the response data.
   * 
   * This method sends the specified HTTP request asynchronously using NSURLConnection. It returns a promise that resolves with the response data if the request is successful,
   * or with an error object if the request fails. The error object includes details such as the status code and error message.
   * 
   * @param {NSMutableURLRequest} request - The HTTP request to be sent.
   * @returns {Promise<Object>} A promise that resolves with the response data or an error object.
   */
  static async sendRequest(request){
    const queue = NSOperationQueue.mainQueue()
    return new Promise((resolve, reject) => {
      NSURLConnection.sendAsynchronousRequestQueueCompletionHandler(
        request,
        queue,
        (res, data, err) => {
        try {
        if (MNUtil.isNSNull(res)) {
          if (err.localizedDescription){
            let error = {error:err.localizedDescription}
            resolve(error)
            return
          }
          resolve({error:"Response is null"})
          return
        }
        // MNUtil.showHUD("123")

          let result = NSJSONSerialization.JSONObjectWithDataOptions(
            data,
            1<<0
          )
          let validJson = result && NSJSONSerialization.isValidJSONObject(result)
          if (err.localizedDescription){
            MNUtil.showHUD(err.localizedDescription)
            let error = {error:err.localizedDescription}
            if (validJson) {
              error.data = result
            }
            resolve(error)
          }
        // MNUtil.showHUD("456")

          if (res.statusCode() >= 400) {
            let error = {statusCode:res.statusCode()}
            if (validJson) {
              error.data = result
            }
            resolve(error)
          }
        // MNUtil.showHUD("789"+typeof data)

          if (validJson){
            resolve(result)
          }else{
            resolve(data)
          }
        } catch (error) {
        // MNUtil.addErrorLog(error, "sendRequest")
          resolve({error: error.localizedDescription || "Unknown error"})
        }
        }
      )
  })
  }
  /**
   * Sends an HTTP request asynchronously and returns the response data.
   * 
   * This method sends the specified HTTP request asynchronously using NSURLConnection. It returns a promise that resolves with the response data if the request is successful,
   * or with an error object if the request fails. The error object includes details such as the status code and error message.
   * 
   * @param {NSMutableURLRequest} request - The HTTP request to be sent.
   * @returns {Promise<Object>} A promise that resolves with the response data or an error object.
   */
  static async sendRequestDev(request){
    const queue = NSOperationQueue.mainQueue()
    return new Promise((resolve, reject) => {
      NSURLConnection.sendAsynchronousRequestQueueCompletionHandler(
        request,
        queue,
        /**
         * 
         * @param {NSHTTPURLResponse} res 
         * @param {NSData} data 
         * @param {NSError} err 
         * @returns 
         */
        (res, data, err) => {
          try {
          // MNUtil.log("Status Code",res.statusCode())
          let url = request.URL().absoluteString()
          resolve(Response.new(res,data,err,url))
            
          } catch (error) {
            MNUtil.addErrorLog(error, "sendRequestDev")
            resolve(Response.new(res,data,err))
          }
        }
      )
  })
  }
  /**
   * Fetches data from a specified URL with optional request options.
   * 
   * This method initializes a request with the provided URL and options, then sends the request asynchronously.
   * It returns a promise that resolves with the response data or an error object if the request fails.
   * 
   * @param {string} url - The URL to fetch data from.
   * @param {Object} [options={}] - Optional request options.
   * @param {string} [options.method="GET"] - The HTTP method to use for the request.
   * @param {number} [options.timeout=10] - The timeout interval for the request in seconds.
   * @param {Object} [options.headers={}] - Additional headers to include in the request.
   * @param {Object} [options.search] - Query parameters to append to the URL.
   * @param {string} [options.body] - The body of the request for POST, PUT, etc.
   * @param {Object} [options.form] - Form data to include in the request body.
   * @param {Object} [options.json] - JSON data to include in the request body.
   * @returns {Promise<Object|Error>} A promise that resolves with the response data or an error object.
   */
  static async fetch (url,options = {}){
    try {

    const request = this.initRequest(url, options)
    // MNUtil.copy(typeof request)
    const res = await this.sendRequest(request)
    // MNUtil.showHUD("Fetch"+(typeof res))
    return res
      
    } catch (error) {
      MNUtil.addErrorLog(error, "fetch")
      return undefined
    }
  }
  /**
   * 
   * @param {string} url 
   * @param {Object} options 
   * @returns {Promise<Response>} A promise that resolves with the response data or an error object.
   */
  static async fetchDev (url,options = {}){
    try {
    const request = this.initRequest(url, options)
    // MNUtil.copy(typeof request)
    const res = await this.sendRequestDev(request)
    // MNUtil.showHUD("Fetch"+(typeof res))
    return res
      
    } catch (error) {
      MNUtil.addErrorLog(error, "fetch")
      return undefined
    }
  }
  /**
   * Encodes a string to Base64.
   * 
   * This method encodes the provided string to a Base64 representation using the CryptoJS library.
   * It first parses the string into a WordArray and then converts this WordArray to a Base64 string.
   * 
   * @param {string} str - The string to be encoded to Base64.
   * @returns {string} The Base64 encoded string.
   */
  static btoa(str) {
      // Encode the string to a WordArray
      const wordArray = CryptoJS.enc.Utf8.parse(str);
      // Convert the WordArray to Base64
      const base64 = CryptoJS.enc.Base64.stringify(wordArray);
      return base64;
  }
  /**
   * Reads a file from a WebDAV server using the provided URL, username, and password.
   * 
   * This method sends a GET request to the specified WebDAV URL with the provided username and password for authentication.
   * It returns a promise that resolves with the response data if the request is successful, or with an error object if the request fails.
   * 
   * @param {string} url - The URL of the file on the WebDAV server.
   * @param {string} username - The username for authentication.
   * @param {string} password - The password for authentication.
   * @returns {Promise<Object>} A promise that resolves with the response data or an error object.
   */
static async readWebDAVFile(url, username, password) {
    const headers = {
      Authorization:'Basic ' + this.btoa(username + ':' + password),
      "Cache-Control": "no-cache"
      };
        const response = await this.fetch(url, {
            method: 'GET',
            headers: headers
        });
    return response
}

  /**
   * Reads a file from a WebDAV server using the provided URL, username, and password.
   * 
   * This method sends a GET request to the specified WebDAV URL with the provided username and password for authentication.
   * It returns a promise that resolves with the response data if the request is successful, or with an error object if the request fails.
   * 
   * @param {string} url - The URL of the file on the WebDAV server.
   * @param {string} username - The username for authentication.
   * @param {string} password - The password for authentication.
   * @returns {NSURLConnection} A promise that resolves with the response data or an error object.
   */
static readWebDAVFileWithDelegate(url, username, password) {
    const headers = {
      Authorization:'Basic ' + this.btoa(username + ':' + password),
      "Cache-Control": "no-cache"
      };
      const request = this.initRequest(url, {
            method: 'GET',
            headers: headers
        })
    return request
}
/**
 * Uploads a file to a WebDAV server using the provided URL, username, password, and file content.
 * 
 * This method sends a PUT request to the specified WebDAV URL with the provided username and password for authentication.
 * The file content is included in the request body. It returns a promise that resolves with the response data if the request is successful,
 * or with an error object if the request fails.
 * 
 * @param {string} url - The URL of the file on the WebDAV server.
 * @param {string} username - The username for authentication.
 * @param {string} password - The password for authentication.
 * @param {string} fileContent - The content of the file to be uploaded.
 * @returns {Promise<Object>} A promise that resolves with the response data or an error object.
 */
static async uploadWebDAVFile(url, username, password, fileContent) {
    const headers = {
      Authorization:'Basic ' + this.btoa(username + ':' + password),
      "Content-Type":'application/octet-stream'
    };
    const response = await this.fetch(url, {
        method: 'PUT',
        headers: headers,
        body: fileContent
    });
    return response
}
  static getOnlineImage(url,scale=3){
    MNUtil.showHUD("Downloading image")
    let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(url))
    if (imageData) {
      MNUtil.showHUD("Download success")
      return UIImage.imageWithDataScale(imageData,scale)
    }
    MNUtil.showHUD("Download failed")
    return undefined
  }
  /**
   * Retrieves the image data from the current document controller or other document controllers if the document map split mode is enabled.
   * 
   * This method checks for image data in the current document controller's selection. If no image is found, it checks the focused note within the current document controller.
   * If the document map split mode is enabled, it iterates through all document controllers to find the image data. If a pop-up selection info is available, it also checks the associated document controller.
   * 
   * @param {boolean} [checkImageFromNote=true] - Whether to check the focused note for image data.
   * @param {boolean} [checkDocMapSplitMode=false] - Whether to check other document controllers if the document map split mode is enabled.
   * @returns {NSData|undefined} The image data if found, otherwise undefined.
   */
  static getImageFromNote(note,checkTextFirst = true) {
    if (note.excerptPic) {
      let isBlankNote = MNUtil.isBlankNote(note)
      if (!isBlankNote) {//实际为文字留白
        if (checkTextFirst && note.textFirst) {
          //检查发现图片已经转为文本，因此略过
        }else{
          return MNUtil.getMediaByHash(note.excerptPic.paint)
        }
      }
    }else{
      let text = note.excerptText
      if (note.excerptTextMarkdown) {
        if (MNUtil.hasMNImages(text.trim())) {
          return MNUtil.getMNImageFromMarkdown(text)
        }
      }
    }
    if (note.comments.length) {
      let imageData = undefined
      for (let i = 0; i < note.comments.length; i++) {
        const comment = note.comments[i];
        if (comment.type === 'PaintNote' && comment.paint) {
          imageData = MNUtil.getMediaByHash(comment.paint)
          break
        }
        if (comment.type === "LinkNote" && comment.q_hpic && comment.q_hpic.paint) {
          imageData = MNUtil.getMediaByHash(comment.q_hpic.paint)
          break
        }

      }
      if (imageData) {
        return imageData
      }
    }
    return undefined
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
    MNUtil.showHUD(model+": No apikey!")
    return
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer "+apikey,
    Accept: "text/event-stream"
  }
    // copyJSON(headers)
  let body = {
    "model":model,
    "messages":history,
    "stream":true
  }
  // if (model !== "deepseek-reasoner") {
    body.temperature = temperature
    // if (url === "https://api.minimax.chat/v1/text/chatcompletion_v2") {
    //   let tools = chatAITool.getToolsByIndex(funcIndices,true)
    //   if (tools.length) {
    //     body.tools = tools
    //   }
    //   body.max_tokens = 8000
    // }else{
    //   let tools = chatAITool.getToolsByIndex(funcIndices,false)
    //   if (tools.length) {
    //     body.tools = tools
    //     body.tool_choice = "auto"
    //   }
    // }
  const request = MNConnection.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 60,
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
    MNUtil.showHUD(model+": No apikey!")
    return
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer "+apikey,
    Accept: "text/event-stream"
  }
    // copyJSON(headers)
  let body = {
    "model":model,
    "messages":history
  }
  // if (model !== "deepseek-reasoner") {
    body.temperature = temperature
    // if (url === "https://api.minimax.chat/v1/text/chatcompletion_v2") {
    //   let tools = chatAITool.getToolsByIndex(funcIndices,true)
    //   if (tools.length) {
    //     body.tools = tools
    //   }
    //   body.max_tokens = 8000
    // }else{
    //   let tools = chatAITool.getToolsByIndex(funcIndices,false)
    //   if (tools.length) {
    //     body.tools = tools
    //     body.tool_choice = "auto"
    //   }
    // }
  const request = MNConnection.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 60,
      json: body
    })
  return request
}

}
class MNButton{
  static get highlightColor(){
    return UIColor.blendedColor(
      UIColor.colorWithHexString("#2c4d81").colorWithAlphaComponent(0.8),
      MNUtil.app.defaultTextColor,
      0.8
    );
  }
  /**
   *
   * @param {{color:string,title:string,bold:boolean,font:number,opacity:number,radius:number,alpha:number}} config
   * @param {UIView} superView
   */
  static new(config = {},superView){
    return new MNButton(config,superView)
    // let newButton = UIButton.buttonWithType(0);
    // newButton.autoresizingMask = (1 << 0 | 1 << 3);
    // newButton.layer.masksToBounds = true;
    // newButton.setTitleColorForState(UIColor.whiteColor(),0);
    // newButton.setTitleColorForState(this.highlightColor, 1);
    // let radius = ("radius" in config) ? config.radius : 8
    // newButton.layer.cornerRadius = radius;
    // this.setConfig(newButton, config)
    // if (superView) {
    //   superView.addSubview(newButton)
    // }
    // return newButton
  }
  static builtInProperty = [
    "superview",
    "frame",
    "bounds",
    "center",
    "window",
    "gestureRecognizers",
    "backgroundColor",
    "color",
    "hidden",
    "autoresizingMask",
    "currentTitle",
    "currentTitleColor",
    "currentImage",
    "subviews",
    "masksToBounds",
    "title",
    "alpha",
    "font",
    "opacity",
    "radius",
    "cornerRadius",
    "highlight"
  ]
  constructor(config = {},superView){
    this.button = UIButton.buttonWithType(0);
    this.button.autoresizingMask = (1 << 0 | 1 << 3);
    this.button.layer.masksToBounds = true;
    this.button.setTitleColorForState(UIColor.whiteColor(),0);
    this.button.setTitleColorForState(this.highlightColor, 1);
    let radius = ("radius" in config) ? config.radius : 8
    this.button.layer.cornerRadius = radius;
    MNButton.setConfig(this.button, config)
    this.titleLabel = this.button.titleLabel
    if (superView) {
      superView.addSubview(this.button)
    }
    let keys = Object.keys(config)
    for (let i = 0; i < keys.length; i++) {
      if (!MNButton.builtInProperty.includes(keys[i])) {
        this.button[keys[i]] = config[keys[i]]
        this[keys[i]] = config[keys[i]]
      }
    }
    return new Proxy(this, {
      set(target, property, value) {
        target[property] = value;
        if (!MNButton.builtInProperty.includes(property)) {
          target.button[property] = value
        }
        return true;
      }
    });
  }
  /**
   * @param {UIView} view
   */
  set superview(view){
    view.addSubview(this.button)
  }
  get superview(){
    return this.button.superview
  }
  /**
   * @param {CGRect} targetFrame
   */
  set frame(targetFrame){
    this.button.frame = targetFrame
  }
  get frame(){
    return this.button.frame
  }
  set bounds(targetFrame){
    this.button.bounds = targetFrame
  }
  get bounds(){
    return this.button.bounds
  }
  set center(targetFrame){
    this.button.center = targetFrame
  }
  get center(){
    return this.button.center
  }
  get window(){
    return this.button.window
  }
  get gestureRecognizers(){
    return this.button.gestureRecognizers
  }
  /**
   * 
   * @param {UIColor|string} color 
   */
  set backgroundColor(color){
    if (typeof color === "string") {
      if(color.length > 7){
        this.button.backgroundColor = MNButton.hexColor(color)
      }else{
        this.button.backgroundColor = MNButton.hexColorAlpha(color, 1.0)
      }
    }else{
      this.button.backgroundColor = color
    }
  }
  get backgroundColor(){
    return this.button.backgroundColor
  }
  /**
   * 
   * @param {UIColor|string} color 
   */
  set color(color){
    if (typeof color === "string") {
      if(color.length > 7){
        this.button.backgroundColor = MNButton.hexColor(color)
      }else{
        this.button.backgroundColor = MNButton.hexColorAlpha(color, 1.0)
      }
    }else{
      this.button.backgroundColor = color
    }
  }
  get color(){
    return this.button.backgroundColor
  }
  /**
   * 
   * @param {boolean} hidden 
   */
  set hidden(hidden){
    this.button.hidden = hidden
  }
  get hidden(){
    return this.button.hidden
  }
  /**
   * 
   * @param {number} mask 
   */
  set autoresizingMask(mask){
    this.button.autoresizingMask = mask
  }
  /**
   * 
   * @returns {number} 
   */
  get autoresizingMask(){
    return this.button.autoresizingMask
  }
  /**
   * 
   * @param {number} opacity 
   */
  set opacity(opacity){
    this.button.layer.opacity = opacity
  }
  get opacity(){
    return this.button.layer.opacity
  }
  /**
   * 
   * @param {number} radius 
   */
  set radius(radius){
    this.button.layer.cornerRadius = radius
  }
  /**
   * @returns {number}
   */
  get radius(){
    return this.button.layer.cornerRadius
  }
  /**
   * 
   * @param {number} radius 
   */
  set cornerRadius(radius){
    this.button.layer.cornerRadius = radius
  }
  get cornerRadius(){
    return this.button.layer.cornerRadius
  }
  /**
   * 
   * @param {string} title 
   */
  set currentTitle(title){
    this.button.setTitleForState(title,0)
  }
  get currentTitle(){
    return this.button.currentTitle
  }
  /**
   * 
   * @param {string} title 
   */
  set title(title){
    this.button.setTitleForState(title,0)
  }
  get title(){
    return this.button.currentTitle
  }
  /**
   * 
   * @param {string|UIColor} color 
   */
  set currentTitleColor(color){
    if (typeof color === "string") {
      if(color.length > 7){
        this.button.setTitleColorForState(MNButton.hexColor(color),0)
      }else{
        this.button.setTitleColorForState(MNButton.hexColorAlpha(color, 1.0),0)
      }
    }else{
      this.button.setTitleColorForState(color,0)
    }
  }
  get currentTitleColor(){
    return this.button.currentTitleColor
  }
  /**
   * 
   * @param {UIImage} image 
   */
  set currentImage(image){
    this.button.setImageForState(image,0)
  }
  get currentImage(){
    return this.button.currentImage
  }
  get subviews(){
    return this.button.subviews
  }
  /**
   * 
   * @param {UIFont} font 
   */
  set font(font){
    this.button.titleLabel.font = font
  }
  get font(){
    return this.button.titleLabel.font
  }
  /**
   * 
   * @param {boolean} masksToBounds 
   */
  set masksToBounds(masksToBounds){
    this.button.layer.masksToBounds = masksToBounds
  }
  /**
   * 
   * @returns {boolean}
   */
  get masksToBounds(){
    return this.button.layer.masksToBounds
  }
  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @param {number} width 
   * @param {number} height 
   */
  setFrame(x,y,width,height){
    let frame = this.button.frame
    if (x !== undefined) {
      frame.x = x
    }else if (this.button.x !== undefined) {
      frame.x = this.button.x
    }
    if (y !== undefined) {
      frame.y = y
    }else if (this.button.y !== undefined) {
      frame.y = this.button.y
    }
    if (width !== undefined) {
      frame.width = width
    }else if (this.button.width !== undefined) {
      frame.width = this.button.width
    }
    if (height !== undefined) {
      frame.height = height
    }else if (this.button.height !== undefined) {
      frame.height = this.button.height
    }
    this.button.frame = frame
  }
  /**
   * 
   * @param {string} hexColor 
   * @param {number} [alpha=1.0] 
   */
  setColor(hexColor,alpha = 1.0){
    if(hexColor.length > 7){
      this.button.backgroundColor = MNButton.hexColor(hexColor)
    }else{
      this.button.backgroundColor = MNButton.hexColorAlpha(hexColor, alpha)
    }
  }
  setImageForState(image,state = 0){
    this.button.setImageForState(image,state)
  }
  setImage(image,state = 0){
    this.button.setImageForState(image,state)
  }
  setTitleColorForState(color,state = 0){
    this.button.setTitleColorForState(color,state)
  }
  setTitleColor(color,state = 0){
    this.button.setTitleColorForState(color,state)
  }
  setTitleForState(title,state = 0){
    this.button.setTitleForState(title,state)
  }
  setTitle(title,state = 0){
    this.button.setTitleForState(title,state)
  }
  addSubview(view){
    this.button.addSubview(view)
  }
  removeFromSuperview(){this.button.removeFromSuperview()}
  bringSubviewToFront(view){this.button.bringSubviewToFront(view)}
  sendSubviewToBack(view){this.button.sendSubviewToBack(view)}
  isDescendantOfView(view){return this.button.isDescendantOfView(view)}
  isDescendantOfStudyView(){return this.button.isDescendantOfView(MNUtil.studyView)}
  isDescendantOfCurrentWindow(){return this.button.isDescendantOfView(MNUtil.currentWindow)}
  setNeedsLayout(){this.button.setNeedsLayout()}
  layoutIfNeeded(){this.button.layoutIfNeeded()}
  layoutSubviews(){this.button.layoutSubviews()}
  setNeedsDisplay(){this.button.setNeedsDisplay()}
  sizeThatFits(size){
    return this.button.sizeThatFits(size)
  }

  /**
   * 
   * @param {any} target 
   * @param {UIControlEvents} controlEvent 
   * @param {string} action 
   */
  addTargetActionForControlEvents(target,action,controlEvent = 1 << 6){
    this.button.addTargetActionForControlEvents(target, action, controlEvent);
  }
  /**
   * 
   * @param {any} target 
   * @param {UIControlEvents} controlEvent 
   * @param {string} action 
   */
  removeTargetActionForControlEvents(target,action,controlEvent = 1 << 6){
    this.button.removeTargetActionForControlEvents(target, action, controlEvent);
  }
  /**
   * 
   * @param {any} target 
   * @param {string} selector 
   */
  addClickAction (target,selector) {
    this.button.addTargetActionForControlEvents(target, selector, 1 << 6);
  }
  /**
   * 
   * @param {UIGestureRecognizer} gestureRecognizer 
   */
  addGestureRecognizer(gestureRecognizer){
    this.button.addGestureRecognizer(gestureRecognizer)
  }
  /**
   * 
   * @param {UIGestureRecognizer} gestureRecognizer 
   */
  removeGestureRecognizer(gestureRecognizer){
    this.button.removeGestureRecognizer(gestureRecognizer)
  }
  /**
   * 
   * @param {any} target 
   * @param {string} selector 
   */
  addPanGesture (target,selector) {
    let gestureRecognizer = new UIPanGestureRecognizer(target,selector)
    this.button.addGestureRecognizer(gestureRecognizer)
  }

  /**
   * 
   * @param {any} target 
   * @param {string} selector 
   */
  addLongPressGesture (target,selector,duration = 0.3) {
    let gestureRecognizer = new UILongPressGestureRecognizer(target,selector)
    gestureRecognizer.minimumPressDuration = duration
    this.button.addGestureRecognizer(gestureRecognizer)
  }
  /**
   * 
   * @param {any} target 
   * @param {string} selector 
   */
  addSwipeGesture (target,selector) {
    let gestureRecognizer = new UISwipeGestureRecognizer(target,selector)
    this.button.addGestureRecognizer(gestureRecognizer)
  }
//   static createButton(superview,config) {
//     let button = UIButton.buttonWithType(0);
//     button.autoresizingMask = (1 << 0 | 1 << 3);
//     button.setTitleColorForState(UIColor.whiteColor(),0);
//     button.setTitleColorForState(this.highlightColor, 1);
//     button.backgroundColor = this.hexColorAlpha("#9bb2d6",0.8)
//     button.layer.cornerRadius = 8;
//     button.layer.masksToBounds = true;
//     button.titleLabel.font = UIFont.systemFontOfSize(16);
//     if (superview) {
//       superview.addSubview(button)
//     }
//     this.setConfig(button, config)
//     return button
// }
  /**
   * Creates a color from a hex string with an optional alpha value.
   * 
   * This method takes a hex color string and an optional alpha value, and returns a UIColor object.
   * If the alpha value is not provided, the color is returned without modifying its alpha component.
   * 
   * @param {string} hex - The hex color string (e.g., "#RRGGBB").
   * @param {number} [alpha=1.0] - The alpha value (opacity) of the color, ranging from 0.0 to 1.0.
   * @returns {UIColor} The UIColor object representing the specified color with the given alpha value.
   */
  static hexColorAlpha(hex,alpha) {
    let color = UIColor.colorWithHexString(hex)
    return alpha!==undefined?color.colorWithAlphaComponent(alpha):color
  }
  /**
   * function to create a color from a hex string
   * @param {string} hex 
   * @returns {UIColor}
   */
  static hexColor(hex) {
    let colorObj = MNUtil.parseHexColor(hex)
    return this.hexColorAlpha(colorObj.color,colorObj.opacity)
  }
  /**
   * 
   * @param {UIButton} button 
   * @param {string} hexColor 
   * @param {number} [alpha=1.0] 
   */
  static setColor(button,hexColor,alpha = 1.0){
    if(hexColor.length > 7){
      button.backgroundColor = this.hexColor(hexColor)
    }else{
      button.backgroundColor = this.hexColorAlpha(hexColor, alpha)
    }
  }
  static setTitle(button,title,font = 16,bold= false){
    button.setTitleForState(title,0)
    if (bold) {
      button.titleLabel.font = UIFont.boldSystemFontOfSize(font)
    }else{
      button.titleLabel.font = UIFont.systemFontOfSize(font)
    }
  }
  /**
   *
   * @param {UIButton} button
   * @param {string|NSData} path
   */
  static setImage(button,path,scale){
    if (typeof path === "string") {
      button.setImageForState(MNUtil.getImage(path,scale),0)
    }else{
      button.setImageForState(path, 0)
    }
  }
  static setOpacity(button,opacity){
    button.layer.opacity = opacity


  }
  static setRadius(button,radius = 8){
    button.layer.cornerRadius = radius;
  }
/**
   * 设置按钮的配置
   *
   * @param {UIButton} button - 要设置配置的按钮对象
   * @param {{color: string, title: string, bold: boolean, font: number, opacity: number, radius: number, image?: string, scale?: number}} config - 配置对象
   */
  static setConfig(button, config) {
    if ("color" in config) {
      this.setColor(button, config.color, config.alpha);
    }
    if ("title" in config) {
      this.setTitle(button, config.title, config.font, config.bold);
    }
    if ("opacity" in config) {
      this.setOpacity(button, config.opacity);
    }
    if ("radius" in config) {
      this.setRadius(button, config.radius);
    }
    if ("image" in config) {
      this.setImage(button, config.image, config.scale);
    }
    if ("highlight" in config) {
      button.setTitleColorForState(config.highlight, 1)
    }
  }
  /**
   * 
   * @param {UIView} button 
   * @param {any} target 
   * @param {string} selector 
   */
  static addClickAction (button,target,selector) {
    button.addTargetActionForControlEvents(target, selector, 1 << 6);
    
  }
  /**
   * 
   * @param {UIView} button 
   * @param {any} target 
   * @param {string} selector 
   */
  static addPanGesture (button,target,selector) {
    let gestureRecognizer = new UIPanGestureRecognizer(target,selector)
    button.addGestureRecognizer(gestureRecognizer)
  }

  /**
   * 
   * @param {UIView} button 
   * @param {any} target 
   * @param {string} selector 
   */
  static addLongPressGesture (button,target,selector,duration = 0.3) {
    let gestureRecognizer = new UILongPressGestureRecognizer(target,selector)
    gestureRecognizer.minimumPressDuration = duration
    button.addGestureRecognizer(gestureRecognizer)
  }
  /**
   * 
   * @param {UIView} button 
   * @param {any} target 
   * @param {string} selector 
   */
  static addSwipeGesture (button,target,selector) {
    let gestureRecognizer = new UISwipeGestureRecognizer(target,selector)
    button.addGestureRecognizer(gestureRecognizer)
  }

}
class MNExtensionPanel {
  static subviews = {}
  static get currentWindow(){
    //关闭mn4后再打开，得到的focusWindow会变，所以不能只在init做一遍初始化
    return this.app.focusWindow
  }
  static get subviewNames(){
    return Object.keys(this.subviews)
  }
  static get app(){
    // this.appInstance = Application.sharedInstance()
    // return this.appInstance
    if (!this.appInstance) {
      this.appInstance = Application.sharedInstance()
    }
    return this.appInstance
  }
  static get studyController(){
    return this.app.studyController(this.currentWindow)
  }
  /**
   * @returns {{view:UIView}}
   **/
  static get controller(){
    return this.studyController.extensionPanelController
  }
  /**
   * @returns {UIView}
   */
  static get view(){
    return this.studyController.extensionPanelController.view
  }
  static get frame(){
    return this.view.frame
  }
  static get width(){
    return this.view.frame.width
  }
  static get height(){
    return this.view.frame.height
  }
  static get on(){
    if (this.controller && this.view.window) {
      return true
    }
    return false
  }
  /**
   * 用于关闭其他窗口的扩展面板
   * @param {UIWindow} window 
   */
  static hideExtentionPanel(window){
    let originalStudyController = this.app.studyController(window)
    if (originalStudyController.extensionPanelController.view.window) {
      originalStudyController.toggleExtensionPanel()
    }
  }
  static toggle(){
    this.studyController.toggleExtensionPanel()
  }
  static show(name = undefined){
    if (!this.on) {
      this.toggle()
      MNUtil.delay(0.1).then(()=>{
        if (!this.on) {
          this.toggle()
        }
      })
    }
    if (name && name in this.subviews) {
      let allNames = Object.keys(this.subviews)
      allNames.forEach(n=>{
        let view = this.subviews[n]
        if (n == name){
          if (!view.isDescendantOfView(this.view)) {
            this.hideExtentionPanel(view.window)
            view.removeFromSuperview()
            this.view.addSubview(view)
          }
          view.hidden = false
        }else{
          view.hidden = true
        }
      })
    }
  }
  /**
   * 
   * @param {string} name 
   * @returns {UIView}
   */
  static subview(name){
    return this.subviews[name]
  }
  /**
   * 需要提供一个视图名,方便索引和管理
   * @param {string} name 
   * @param {UIView} view 
   */
  static addSubview(name,view){
    if (this.controller) {
      this.subviews[name] = view
      this.view.addSubview(view)
      let allNames = Object.keys(this.subviews)
      allNames.forEach(n=>{
        if (n == name){
          this.subviews[n].hidden = false
        }else{
          this.subviews[n].hidden = true
        }
      })
    }else{
      MNUtil.showHUD("Show Extension Panel First!")
    }
  }
  static removeSubview(name){
    if (name in this.subviews) {
      this.subviews[name].removeFromSuperview()
      delete this.subviews[name]
    }
  }
}


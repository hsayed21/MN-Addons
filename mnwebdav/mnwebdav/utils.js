
class webdavUtil {
  static errorLog = []
  static init(mainPath){
  try {

    this.mainPath = mainPath
    this.screenImage = MNUtil.getImage(mainPath + `/screen.png`)
    this.linkImage = MNUtil.getImage(mainPath + `/link.png`)
    this.homeImage = MNUtil.getImage(mainPath + `/home.png`)
    this.goforwardImage = MNUtil.getImage(mainPath + `/goforward.png`)
    this.gobackImage = MNUtil.getImage(mainPath + `/goback.png`)
    this.reloadImage = MNUtil.getImage(mainPath + `/reload.png`)
    this.stopImage = MNUtil.getImage(mainPath + `/stop.png`)
    this.webappImage = MNUtil.getImage(mainPath + `/webapp.png`)
    this.moreImage = MNUtil.getImage(mainPath + `/more.png`,2.5)
    
  } catch (error) {
    this.addErrorLog(error, "webdavUtil.init")
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
  static showHUD(message,duration=2) {
    let app = Application.sharedInstance()
    app.showHUD(message,app.focusWindow,duration)
  }
  static checkMNUtilsFolder(fullPath){
  try {

    let extensionFolder = this.getExtensionFolder(fullPath)
    let folderExist = NSFileManager.defaultManager().fileExistsAtPath(extensionFolder+"/marginnote.extension.mnutils/main.js")
    if (!folderExist) {
      this.showHUD("MN Webdav: Please install 'MN Utils' first!",5)
    }
    return folderExist
    
  } catch (error) {
    this.showHUD(error)
    return false
  }
  }
  static async checkMNUtil(alert = false,delay = 0.01){
    if (typeof MNUtil === 'undefined') {//如果MNUtil未被加载，则执行一次延时，然后再检测一次
      //仅在MNUtil未被完全加载时执行delay
      await this.delay(delay)
      if (typeof MNUtil === 'undefined') {
        if (alert) {
          this.showHUD("MN Webdav: Please install 'MN Utils' first!",5)
        }
        return false
      }
    }
    return true
  }
  static async delay (seconds) {
    return new Promise((resolve, reject) => {
      NSTimer.scheduledTimerWithTimeInterval(seconds, false, function () {
        resolve()
      })
    })
  }
  static parseURL(urlString){
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
    let config = {
      url:url.absoluteString(),
      scheme:url.scheme,
      host:url.host,
      query:url.query
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
  static getOrderText(order) {
    if (order[0] == 4) {
      return 'Order: (Title) + (Excerpt → Comment)'
    }
    let orderNumber = `${order[0]}${order[1]}${order[2]}`
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
      default:
        return "123";
    }
  }
  static isNSNull(obj){
    return (obj === NSNull.new())
  }
static formatTimestamp(timestamp = Date.now()) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

  static async importNotebook(notebookPath,folder){
  try {

    MNUtil.waitHUD("Importing notebook...")
    // let allNotebookTitles = MNUtil.allNotebooks().map(notebook=>notebook.title)
    // MNUtil.copy(allNotebookTitles)
    let res = await MNUtil.userSelect("请选择操作","",["合并已有学习集", "覆盖已有学习集", "无已有学习集"])
    if (notebookPath.endsWith(".marginnotes")) {
      switch (res) {
        case 0:
          MNUtil.stopHUD()
          return
        case 1:
          MNUtil.waitHUD("Importing notebook...")
          await MNUtil.delay(0.1)
          let notebook = MNUtil.importNotebook(notebookPath, true)
          MNUtil.waitHUD("✅ Import success!")
          if (notebook) {
            let confirm = await MNUtil.confirm("是否打开学习集？", notebook.title)
            MNUtil.refreshAfterDBChanged()
            if (confirm) {
              MNUtil.openURL("marginnote4app://notebook/"+notebook.topicId)
            }
          }
          MNUtil.stopHUD(0.5)
          break;
        case 2:
        case 3:
          MNUtil.waitHUD("Importing notebook...")
          await MNUtil.delay(0.1)
          let notebook0 = MNUtil.importNotebook(notebookPath, false)
          MNUtil.waitHUD("✅ Import success!")
          if (notebook0) {
            let confirm = await MNUtil.confirm("是否打开学习集？", notebook0.title)
            MNUtil.refreshAfterDBChanged()
            if (confirm) {
              MNUtil.openURL("marginnote4app://notebook/"+notebook0.topicId)
            }
          }
          MNUtil.stopHUD(0.5)
          break;
        default:
          return
      }
      return
    }
    //导入marginpkg文件，需要先进行解压，然后分开导入
    MNUtil.createFolderDev(folder)
    ZipArchive.unzipFileAtPathToDestination(notebookPath,folder)
    let tem = MNUtil.subpathsOfDirectory(folder+"/")
    let files = tem.filter(subpath=>subpath.endsWith(".pdf"))
    let currentFilePaths = files.map(file=>folder+"/"+file)
    let targetFilePaths = files.map(file=>MNUtil.documentFolder+"/"+file)
    // MNUtil.copy(MNUtil.subpathsOfDirectory(MNUtil.documentFolder))
    let subpaths = MNUtil.contentsOfDirectory(folder+"/")
    subpaths = subpaths.filter(subpath=>subpath.endsWith(".marginnotes"))
    switch (res) {
      case 0:
        MNUtil.stopHUD()
        return
      case 1:
        MNUtil.waitHUD("Importing notebook...")
        await MNUtil.delay(0.1)
        let notebook = MNUtil.importNotebook(folder+"/"+subpaths[0], true)
        await MNUtil.delay(0.1)
        if (targetFilePaths.length) {
          MNUtil.waitHUD("Importing documents...")
          targetFilePaths.forEach((path,i)=>{
            MNUtil.copyFile(currentFilePaths[i], path)
            MNUtil.importDocument(path)
          })
        }
        await MNUtil.delay(0.1)
        MNUtil.waitHUD("✅ Import success!")
        await MNUtil.openNotebook(notebook,true)
        MNUtil.stopHUD(0.5)
        break;
      case 2:
      case 3:
        MNUtil.waitHUD("Importing notebook...")
        await MNUtil.delay(0.1)
        let notebook0 = MNUtil.importNotebook(folder+"/"+subpaths[0], false)
        await MNUtil.delay(0.1)
        if (targetFilePaths.length) {
          MNUtil.waitHUD("Importing documents...")
          targetFilePaths.forEach((path,i)=>{
            MNUtil.copyFile(currentFilePaths[i], path)
            MNUtil.importDocument(path)
          })
        }
        await MNUtil.delay(0.1)
        MNUtil.waitHUD("✅ Import success!")
        await MNUtil.openNotebook(notebook0,true)
        MNUtil.stopHUD(0.5)
        break;
      default:
        return
    }
  } catch (error) {
    webdavUtil.addErrorLog(error, "importNotebook")
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
    // MNUtil.showHUD("checkSubscribe")

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
  static checkSender(sender,window){
    return MNUtil.app.checkNotifySenderInWindow(sender, window)
  }
  static checkLogo(){
    if (typeof MNUtil === 'undefined') return false
    if (typeof toolbarConfig !== 'undefined' && toolbarConfig.addonLogos && ("MNWebdav" in toolbarConfig.addonLogos) && !toolbarConfig.addonLogos["MNWebdav"]) {
        return false
    }
    return true
  }
  static setFrame(controller,x,y,width,height){
    if (typeof x === "object") {
      controller.view.frame = x
    }else{
      controller.view.frame = MNUtil.genFrame(x, y, width, height)
    }
    controller.currentFrame = controller.view.frame
  }
  static genLog(error,source){
    return {error:error.toString(),source:source,time:(new Date(Date.now())).toString()}
  }
  static formatSeconds(seconds) {
    // 计算分钟数
    const minutes = Math.floor(seconds / 60);
    // 计算剩余的秒数
    const remainingSeconds = Math.floor(seconds % 60);

    // 格式化为两位数，不足两位的补零
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // 返回格式化后的字符串
    return `${formattedMinutes}:${formattedSeconds}`;
}
  static addErrorLog(error,source,info){
    let log = {
      error:error.toString(),
      source:source,
      time:(new Date(Date.now())).toString(),
      mnaddon:"MN Webdav"
    }
    if (info) {
      log.info = info
    }
    this.errorLog.push(log)
    MNUtil.copy(this.errorLog)
    MNUtil.log({
      source:"MN Webdav",
      level:"error",
      message:source,
      detail:log,
    })
  }
  static extractJSONFromMarkdown(markdown) {
    // 使用正则表达式匹配被```JSON```包裹的内容
    const regex = /```JSON([\s\S]*?)```/g;
    const matches = regex.exec(markdown);
    
    // 提取匹配结果中的JSON字符串部分，并去掉多余的空格和换行符
    if (matches && matches[1]) {
        const jsonString = matches[1].trim();
        return jsonString;
    } else {
        return undefined;
    }
  }
  static getTextForSearch (note) {
    let order = webdavConfig.searchOrder
    if (!order) {
      order = [2,1,3]
    }
    let text
    for (let index = 0; index < order.length; index++) {
      const element = order[index];
      switch (element) {
        case 1:
          if (note.noteTitle && note.noteTitle !== "") {
            text = note.noteTitle
          }
          break;
        case 2:
          if (note.excerptText && note.excerptText !== "" && (!note.excerptPic || note.textFirst)) {
            text = note.excerptText
          }
          break;
        case 3:
          let noteText  = note.comments.filter(comment=>comment.type === "TextNote" && !/^marginnote3app:\/\//.test(comment.text))
          if (noteText.length) {
            text =  noteText[0].text
          }
          break;
        default:
          break;
      }
      if (text) {
        return text
      }
    }
  return ""
  }
  static getTargetFrame(popupFrame,arrow){
    var x, y
    let w = (MNUtil.app.osType !== 1) ? 419 : 365, // this.addonController.view.frame.width
      h = 500, // this.addonController.view.frame.height
      fontSize = 15,
      margin = 10,
      padding = 20
    let frame = MNUtil.studyView.bounds
    let W = frame.width
    let H = frame.height
    let X = popupFrame.x
    let Y = popupFrame.y
    let contextMenuWidth = MNUtil.studyMode === 0 ? 225 : 435
    let contextMenuHeight = 35
    let textMenuPadding = 40

    // this.addonController.view.frame.x
    if (w >= contextMenuWidth) {
      if (X - w / 2 - margin <= 0) {
        x = margin;
      } else if (X + w / 2 + margin >= W) {
        x = W - margin - w;
      } else {
        x = X - w / 2;
      }
    } else {
      if (X - contextMenuWidth / 2 - margin <= 0) {
        x = margin + contextMenuWidth / 2 - w / 2;
      } else if (X + contextMenuWidth / 2 + margin >= W) {
        x = W - margin - contextMenuWidth / 2 - w / 2;
      } else {
        x = X - w / 2;
      }
    }

    // this.addonController.view.frame.[y, height]
    if (arrow === 1) {
      let upperBlankHeight = Y - textMenuPadding - fontSize - padding,
        lowerBlankHeight = H - Y - contextMenuHeight - padding;
      if (upperBlankHeight >= lowerBlankHeight) {
        h = (upperBlankHeight >= h) ? h : upperBlankHeight;
        y = upperBlankHeight - h;
      } else {
        y = H - lowerBlankHeight;
        h = (H - y >= h) ? h : H - y;
    // this.appInstance.showHUD('x:'+x+';y:'+Y,this.window,2)
      }
    } else {
      let upperBlankHeight = Y - textMenuPadding - contextMenuHeight - padding,
        lowerBlankHeight = H - Y - fontSize - padding;
      if (upperBlankHeight >= lowerBlankHeight) {
        h = (upperBlankHeight >= h) ? h : upperBlankHeight;
        y = upperBlankHeight - h;
      } else {
        y = H - lowerBlankHeight;
        h = (H - y >= h) ? h : H - y;
      }
    }
    return MNUtil.genFrame(x, y, w, h)
  }
  /**
   * 
   * @param {string} url 
   * @returns {boolean}
   */
  static isAllowedIconLibrary(url){
    if (url.includes("https://www.iconfont.cn/")) {
      return true;
    }
    if (url.includes("https://zhangyu1818.github.io/appicon-forge/")) {
      return true
    }
    return false
  }
  /**
   * 
   * @param {string} url 
   * @returns 
   */
static parseLink(url) {
    const result = {
        isPdfDownload: false,
        fileName: ''
    };

    // 检查是否是 PDF 文件的下载链接
    const isPdfRegex = /\.pdf(\?|$)/i;
    result.isPdfDownload = isPdfRegex.test(url);

    // 提取文件名
    const fileNameRegex = /\/([^\/?#]+\.pdf)(\?|$)/i;
    const match = url.match(fileNameRegex);
    if (match && match[1]) {
        result.fileName = decodeURIComponent(match[1]);
    }

    return result;
}
static parseWebdavErrorResponse(xmlText,statusCode){
    let parser = new XMLParser()
    let jsonObj = parser.parse(xmlText)
    MNUtil.copy(jsonObj)
    let errorObj = {}
    if ("d:error" in jsonObj) {
      errorObj["error"] = jsonObj["d:error"]
      if ("s:message" in errorObj.error) {
        errorObj.error["message"] = errorObj.error["s:message"]
        delete errorObj.error["s:message"]
      }
      if ("s:exception" in errorObj.error) {
        errorObj.error["exception"] = errorObj.error["s:exception"]
        delete errorObj.error["s:exception"]
      }
    }
    // if ("html" in jsonObj && "body" in jsonObj["html"]) {
    //   errorObj["body"] = jsonObj["html"]["body"]
    // }
    errorObj["code"] = statusCode
    errorObj["message"] = MNUtil.getStatusCodeDescription(""+statusCode)
    return errorObj
}
static initOffice2PdfRequest (url,options,fileData,config={}) {
  const request = NSMutableURLRequest.requestWithURL(MNUtil.genNSURL(url))
  // try {
  request.setHTTPMethod("Post")
  request.httpShouldHandleCookies = false
  // request.setCachePolicy(4)
  // request.setTimeoutInterval(options.timeout ?? 10)
  let boundary = NSUUID.UUID().UUIDString()

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
  let fileName = config.fileName
  
  let body = NSMutableData.new()
  let filePart = NSData.dataWithStringEncoding(`--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`, 4)

  body.appendData(filePart)
  body.appendData(fileData)
  
  let endBoundary = NSData.dataWithStringEncoding(`\r\n--${boundary}--\r\n`, 4)
  body.appendData(endBoundary)
  request.setHTTPBody(body)
  return request
}
/**
 * 
 * @returns {NSMutableURLRequest}
 */
static office2pdfFromData(fileData,fileName){
    const headers = {
      Authorization:'Basic bW4yMDI1MDY6YVdkb1VzVFJpVElWRXJLRVllcmM=',
    };
    let config = {
      fileName:fileName
    }
    let url = "https://portal.marginnote.com.cn/services/office2pdf"
    const request = this.initOffice2PdfRequest(url, {
        headers: headers
      },
      fileData,
      config
      )
    
    return request
}
/**
 * 
 * @returns {NSMutableURLRequest}
 */
static office2pdf(path){
    let fileName = MNUtil.getFileName(path)
    const headers = {
      Authorization:'Basic bW4yMDI1MDY6YVdkb1VzVFJpVElWRXJLRVllcmM=',
    };
    let fileData = MNUtil.getFile(path)
    let config = {
      fileName:fileName
    }
    let url = "https://portal.marginnote.com.cn/services/office2pdf"
    const request = this.initOffice2PdfRequest(url, {
        headers: headers
      },
      fileData,
      config
      )
    
    return request
}

}


class webdavConfig{
  /**
   * @type {undefined|WebDAV}
   */
  static webdav
  static onSync = false
  static get allCustomActions(){
    return [
        "openNewWindow",
        "openInNewWindow",
        "screenshot",
        "videoFrame2Clipboard",
        "videoFrame2Editor",
        "videoFrame2Note",
        "videoFrame2ChildNote",
        "videoFrameToNewNote",
        "videoFrameToComment",
        "videoFrameToSnipaste",
        "videoTime2Clipboard",
        "videoTime2Editor",
        "videoTime2Note",
        "videoTime2ChildNote",
        "videoTimeToNewNote",
        "videoTimeToComment",
        "pauseOrPlay",
        "forward10s",
        "backward10s",
        "bigbang",
        "copyCurrentURL",
        "copyAsMDLink",
        "openCopiedURL"
      ]
  }
  static get defaultConfig(){
    return{
      first:true,
      currentSourceId: "defaultSource",
      order:"name (a→z)",
      sources:[
        {
          id: "defaultSource",
          name: "我的WebDAV",
          url: "",
          createdAt: "2025-06-29T09:55:26.320Z",
          updatedAt: "2025-06-30T04:30:06.111Z"
        }
      ],
      sourceConfigs:{
        defaultSource:{
          url: "",
          username: "",
          password: "",
          id: "defaultSource",
          name: "我的WebDAV",
          savedAt: "2025-06-30T04:37:56.572Z"
        }
      }
    }
  }

  static previousConfig = {}
  static init(){
  try {

    this.config = this.getByDefault("MNWebdav_config",this.defaultConfig)
    // this.config = this.defaultConfig

    this.currentConfig = this.config.sourceConfigs[this.config.currentSourceId]
    if (this.currentConfig.url && this.currentConfig.username && this.currentConfig.password) {
      this.webdav = WebDAV.new(this.currentConfig)
    }
    // MNUtil
    this.toolbar = true
    this.dynamic = false
    this.engine = "Bing"
    this.searchOrder         = [2,1,3];
    if (!this.searchOrder || !this.searchOrder.length) {
      this.searchOrder = [2,1,3]
    }
  } catch (error) {
    webdavUtil.addErrorLog(error, "webdavConfig.init")
  }
  }
  /**
   * 
   * @param {*} delegate 
   * @returns {boolean}//控制是否要直接返回
   */
  static checkDelegate(delegate){
    if (delegate) {
      this.webdav.delegate = delegate
      return false
    }else{
      if (!this.webdav.delegate) {
        MNUtil.showHUD("未提供代理!")
        return true
      }
    }
    return false
  }
  static async listDirectory(path,delegate){
    if (this.checkDelegate(delegate)) {
      return undefined
    }
    return await this.webdav.listDirectory(path)
  }
  static parseDirectoryListing(xmlText,basePath){
    return this.webdav.parseDirectoryListing(xmlText,basePath)
  }
  static deleteItem(path,delegate){
    if (this.checkDelegate(delegate)) {
      return undefined
    }
    return this.webdav.deleteItem(path)
  }
  static createDirectory(path,delegate){
    if (this.checkDelegate(delegate)) {
      return undefined
    }
    return this.webdav.createDirectory(path)
  }
  static downloadFromConfig(config,delegate){
    if (this.checkDelegate(delegate)) {
      return
    }
    this.webdav.downloadFromConfig(config)
  }
  static uploadFromConfig(config,fileData,delegate){
    if (this.checkDelegate(delegate)) {
      return
    }
    this.webdav.uploadFromConfig(config,fileData)
  }
  static copy(obj){
    return JSON.parse(JSON.stringify(obj))
  }
  static getByDefault(key,defaultValue) {
    let value = NSUserDefaults.standardUserDefaults().objectForKey(key)
    if (value === undefined) {
      NSUserDefaults.standardUserDefaults().setObjectForKey(defaultValue,key)
      return defaultValue
    }
    return value
  }
  static remove(key){
    NSUserDefaults.standardUserDefaults().removeObjectForKey(key)
  }
  static refresh(delegate){
    this.currentConfig = this.config.sourceConfigs[this.config.currentSourceId]
    if (delegate) {
      this.webdav = new WebDAV(this.currentConfig)
      this.webdav.delegate = delegate
    }else{
      let preDelegate = this.webdav.delegate
      this.webdav = new WebDAV(this.currentConfig)
      this.webdav.delegate = preDelegate
    }
  }
  static save(key,ignoreExport = false,synchronize = true){
        // MNUtil.showHUD("save "+key)
    switch (key) {
      case "MNWebdav_config":
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"MNWebdav_config")
        this.config.modifiedTime = Date.now()
        // if (!ignoreExport && this.getConfig("autoExport")) {
        //   this.export(false)
        // }
        break;
      default:
        break;
    }
    if (synchronize) {
      NSUserDefaults.standardUserDefaults().synchronize()
    }
  }
  static checkCloudStore(notificaiton = true){
    let iCloudSync = this.getConfig("syncSource") === "iCloud"
    if (iCloudSync &&!this.cloudStore) {
      this.cloudStore = NSUbiquitousKeyValueStore.defaultStore()
      if (notificaiton) {
        MNUtil.postNotification("NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI", {}) 
      }
    }
  }
  static initCloudStore(){
    this.cloudStore = NSUbiquitousKeyValueStore.defaultStore()
    MNUtil.postNotification("NSUbiquitousKeyValueStoreDidChangeExternallyNotificationUI", {})
    // this.readCloudConfig(false)
  }
  static getAllConfig(){
    return {}
  }
  /**
   * 
   * @param {object} obj1 
   * @param {object} obj2 
   * @returns {boolean}
   */
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
  static isValidTotalConfig(config){
    return false
  }
  /**
   * 
   * @param {object} newConfig 
   * @returns {boolean}
   */
  static importConfig(newConfig){
    return false
  }
  /**
   * 
   * @param {boolean} msg 
   * @param {boolean} alert 
   * @param {boolean} force 
   * @returns {Promise<boolean>}
   */
  static async readCloudConfig(msg = true,alert = false,force = false){
return false
    // if (!chatAIUtils.checkSubscribe(false,msg)) {
    //   return false
    // }
    this.checkCloudStore(false)
    if (force) {
      let cloudConfig = this.cloudStore.objectForKey("MNBrowser_totalConfig")
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
      let cloudConfig = this.cloudStore.objectForKey("MNBrowser_totalConfig")
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
        // MNUtil.copy({localLatestTime,localOldestTime,cloudLatestTime,cloudOldestTime})
        if (localLatestTime < cloudOldestTime) {
          if (alert) {
            let confirm = await MNUtil.confirm("MN Webdav\nImport from iCloud?","是否导入iCloud配置？")
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
        //如果本地配置的修改时间比云端配置的修改时间大1秒,则认为本地配置更新,需要上传到云端
        if (this.config.modifiedTime > (cloudConfig.config.modifiedTime+1000)) {
          if (alert) {
            let confirm = await MNUtil.confirm("MN Webdav\n Uploading to iCloud?","📤 是否上传配置到iCloud？")
            if (!confirm) {
              return false
            }
          }
          this.writeCloudConfig(msg)
          return false
        }
        let userSelect = await MNUtil.userSelect("MN Webdav","Conflict config, import or export?\n\n配置冲突，请选择操作\n\n"+Date.parse(this.config.modifiedTime).toLocaleString()+"\n"+Date.parse(cloudConfig.config.modifiedTime).toLocaleString()+"\n\n"+Date.parse(this.config.lastSyncTime).toLocaleString()+"\n"+Date.parse(cloudConfig.config.lastSyncTime).toLocaleString(),["📥 Import / 导入","📤 Export / 导出"])
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
        let confirm = await MNUtil.confirm("MN Webdav\nEmpty config in iCloud, uploading?","iCloud配置为空,是否上传？")
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
      webdavUtil.addErrorLog(error, "readCloudConfig")
      return false
    }
  }
  static writeCloudConfig(msg = true,force = false){
  return false
  try {
    

    // if (!webdavUtil.checkSubscribe(false,msg,true)) {
    //   return false
    // }
    let key = "MNBrowser_totalConfig"
    this.checkCloudStore(false)
    if (force) {
      this.config.lastSyncTime = Date.now()
      // this.config.modifiedTime = Date.now()
      let config = this.getAllConfig()
      this.cloudStore.setObjectForKey(config,key)
      this.config.lastSyncTime = Date.now()
      return true
    }
    let iCloudSync = this.getConfig("syncSource") === "iCloud"
    if(!iCloudSync){
      return false
    }
    let cloudConfig = this.cloudStore.objectForKey(key)
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
    this.cloudStore.setObjectForKey(config,key)
    this.config.lastSyncTime = Date.now()
    MNUtil.copy(config)
    // this.config.modifiedTime = Date.now()
    return true
  } catch (error) {
    webdavUtil.addErrorLog(error, "writeCloudConfig")
    return false
  }
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
  /**
   * 
   * @param {boolean} checkSubscribe 
   * @returns {boolean}
   */
  static autoImport(checkSubscribe = false){
    if (checkSubscribe && !webdavUtil.checkSubscribe(false,false,true)) {
      return false
    }
    return this.getConfig("autoImport")
  }
  static getConfig(key){
    if (this.config[key] !== undefined) {
      return this.config[key]
    }else{
      return this.defaultConfig[key]
    }
  }
  static getCustomDescription(action){
    let actionConfig = {
      "openNewWindow":"open new window",
      "openInNewWindow":"open in new window",
      "screenshot":"screenshot",
      "videoFrame2Clipboard":"videoframe to clipboard",
      "videoFrame2Editor":"videoframe to editor",
      "videoFrame2Note":"videoframe to note",
      "videoFrame2ChildNote":"videoframe to child note",
      "videoFrameToNewNote":"videoframe to new note",
      "videoFrameToComment":"videoframe to comment",
      "videoTime2Clipboard":"timestamp to clipboard",
      "videoTime2Editor":"timestamp to editor",
      "videoTime2Note":"timestamp to note",
      "videoTime2ChildNote":"timestamp to child note",
      "videoFrameToSnipaste":"videoframe to snipaste",
      "videoTimeToNewNote":"timestamp to new note",
      "videoTimeToComment":"timestamp to comment",
      "pauseOrPlay":"pause or play",
      "forward10s":"video forward 10s",
      "backward10s":"video backward 10s",
      "bigbang":"bigbang",
      "copyCurrentURL":"copy current URL",
      "copyAsMDLink":"copy as MD link",
      "openCopiedURL":"open copied URL"
    }
    switch (action) {
      case "screenshot":
      case "videoFrame2Clipboard":
      case "videoFrame2Editor":
      case "videoFrame2Note":
      case "videoFrame2ChildNote":
      case "videoFrameToComment":
      case "videoFrameToNewNote":
      case "videoFrameToSnipaste":
        return "🎬  "+actionConfig[action];
      case "videoTime2Clipboard":
      case "videoTime2Editor":
      case "videoTime2Note":
      case "videoTime2ChildNote":
      case "videoTimeToComment":
      case "videoTimeToNewNote":
        return "📌  "+actionConfig[action];
      case "forward10s":
        return "⏩  "+actionConfig[action];
      case "backward10s":
        return "⏪  "+actionConfig[action];
      case "pauseOrPlay":
        return "▶️  "+actionConfig[action]
      case "bigbang":
        return "💥  "+actionConfig[action];
      case "openNewWindow":
      case "openInNewWindow":
        return "➕  "+actionConfig[action];
      case "copyCurrentURL":
      case "copyAsMDLink":
      case "openCopiedURL":
        return "🌐  "+actionConfig[action];
      default:
        break;
    }
  }
  static getCustomEmoji(index){
    let configName = (index === 1)?"custom":"custom"+index
    switch (this.getConfig(configName)) {
      case "screenshot":
        return " 📸";
      case "videoFrame2Clipboard":
      case "videoFrame2Editor":
      case "videoFrame2Note":
      case "videoFrame2ChildNote":
      case "videoFrameToComment":
      case "videoFrameToNewNote":
      case "videoFrameToSnipaste":
        return "🎬";
      case "videoTime2Clipboard":
      case "videoTime2Editor":
      case "videoTime2Note":
      case "videoTime2ChildNote":
      case "videoTimeToComment":
      case "videoTimeToNewNote":
        return "📌";
      case "forward10s":
        return "⏩";
      case "backward10s":
        return "⏪";
      case "pauseOrPlay":
        return "▶️"
      case "bigbang":
        return "💥"
      case "openNewWindow":
      case "openInNewWindow":
        return "➕";
      case "copyCurrentURL":
      case "copyAsMDLink":
      case "openCopiedURL":
        return "🌐"
      default:
        break;
    }
  }
  static setSyncStatus(onSync,success = false){
  try {
    this.onSync = onSync
    // if (chatAIUtils.chatController) {
    //   if (onSync) {
    //     MNButton.setColor(chatAIUtils.chatController.moveButton, "#e06c75",0.5)
    //   }else{
    //     if (success) {
    //       MNButton.setColor(chatAIUtils.chatController.moveButton, "#30d36c",0.5)
    //       MNUtil.delay(1).then(()=>{
    //         MNButton.setColor(chatAIUtils.chatController.moveButton, "#3a81fb",0.5)
    //       })
    //     }else{
    //       MNButton.setColor(chatAIUtils.chatController.moveButton, "#3a81fb",0.5)
    //     }
    //   }
    // }
  } catch (error) {
    webdavUtil.addErrorLog(error, "setSyncStatus")
  }
  }
  /**
   * 判断配置是否相同
   * @param {object} config 
   * @param {boolean} alert 
   * @returns {boolean}
   */
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
   * 只负责获取配置和检查配置格式是否正确,不负责检查版本
   * @param {string} syncSource 
   * @param {boolean} alert 
   * @returns 
   */
  static async getCloudConfigFromSource(syncSource,alert){
    return undefined
    try {
    let key = "MNBrowser_totalConfig"
    let config = undefined
    switch (syncSource) {
      case "None":
        return undefined
      case "iCloud":
        this.checkCloudStore(false)
        config = this.cloudStore.objectForKey(key)
        break;
      case "MNNote":
        let noteId = this.getConfig("syncNoteId")
        // if (!noteId.trim()) {
        //   return undefined
        // }
        let focusNote = MNNote.new(noteId)
        if (!focusNote) {
          focusNote = MNNote.getFocusNote()
        }
        if (!focusNote) {
          MNUtil.showHUD("Note not exists!")
          return undefined
        }
        if (focusNote.noteTitle !== "MN Webdav Config") {
          MNUtil.showHUD("Invalid note title!")
          this.setSyncStatus(false)
          return undefined
        }
        let contentToParse = focusNote.excerptText
        if (/```JSON/.test(contentToParse)) {
          contentToParse = webdavConfig.extractJSONFromMarkdown(contentToParse)
        }
        if (!MNUtil.isValidJSON(contentToParse)) {
          MNUtil.showHUD("Invalid Config")
          return undefined
        }
        config = JSON.parse(contentToParse)
        break;
      case "CFR2":
        if (!webdavConfig.getConfig("r2file")) {
          MNUtil.showHUD("No Config file")
          return undefined
        }
        let hasPassword = await this.checkR2Password()
        if (!hasPassword) {
          MNUtil.showHUD("No Password")
          return undefined
        }
        if (alert) { MNUtil.showHUD("Downloading...") }
        config = await webdavConfig.readEncryptedConfigFromR2(webdavConfig.config.r2file, webdavConfig.config.r2password)
        break;
      case "Infi":
        if (!webdavConfig.getConfig("InfiFile")) {
          MNUtil.showHUD("No Config file")
          return undefined
        }

        let hasInfiPassword = await this.checkInfiPassword()
        if (!hasInfiPassword) {
          MNUtil.showHUD("No Password")
          return undefined
        }
        if (alert) { MNUtil.showHUD("Downloading...") }
        config = await webdavConfig.readEncryptedConfigFromInfi(webdavConfig.config.InfiFile, webdavConfig.config.InfiPassword)
        break;
      case "Webdav":
        if (!webdavConfig.getConfig("webdavFile")) {
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
          user:webdavConfig.getConfig("webdavUser"),
          password:webdavConfig.getConfig("webdavPassword")
        }
        config = await webdavConfig.readConfigFromWebdav(webdavConfig.config.webdavFile+".json",authorization)
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
      webdavUtil.addErrorLog(error, "getCloudConfigFromSource",syncSource)
      return undefined
    }
  }
  static getLocalLatestTime(){
    let lastSyncTime = this.config.lastSyncTime ?? 0
    let modifiedTime = this.config.modifiedTime ?? 0
    return Math.max(lastSyncTime,modifiedTime)
  }
  static async import(alert = true,force = false){
    if (!webdavUtil.checkSubscribe(true)) {
      return false
    }
    if (this.onSync) {
      if (alert) {
        MNUtil.showHUD("onSync")
      }
      return false
    }
    let syncSource = this.getConfig("syncSource")
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
        MNUtil.showHUD("Invalid config in note!")
        return false
      }
    }
    // MNUtil.showHUD("Importing123...")

    if (!config || webdavConfig.isSameConfigWithLocal(config,alert)) {
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
          confirm = await MNUtil.confirm("MN Webdav\nOlder config from iCloud!\niCloud配置较旧！",OverWriteOption)
          break;
        case "MNNote":
          confirm = await MNUtil.confirm("MN Webdav\nOlder config from note!\n卡片配置较旧！",OverWriteOption)
          break;
        case "CFR2":
          confirm = await MNUtil.confirm("MN Webdav\nOlder config from R2!\nR2配置较旧！",OverWriteOption)
          break;
        case "Infi":
          confirm = await MNUtil.confirm("MN Webdav\nOlder config from InfiniCloud!\nInfiniCloud配置较旧！","Overwrite local config?\n是否覆盖本地配置？")
          break;
        case "Webdav":
          confirm = await MNUtil.confirm("MN Webdav\nOlder config from Webdav!\nWebdav配置较旧！","Overwrite local config?\n是否覆盖本地配置？")
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
      MNUtil.showHUD("Invalid config in note!")
      return false
    }
  }
  static async export(alert = true,force = false){
  try {
    
    if (!webdavUtil.checkSubscribe(true)) {
      return false
    }
    if (this.onSync) {
      MNUtil.showHUD("onSync")
      return
    }
    let syncSource = this.getConfig("syncSource")
    this.setSyncStatus(true)
    if (force) {
      switch (syncSource) {
        case "None":
          this.setSyncStatus(false,false)
          return false
        case "iCloud":
          let success = this.writeCloudConfig(true,true)
          this.setSyncStatus(false,success)
          return;
        case "MNNote":
          let noteId = this.getConfig("syncNoteId")
          let latestTime = this.getLocalLatestTime()
          let focusNote = MNNote.new(noteId)
          if (!focusNote) {
            focusNote = MNUtil.getFocusNote()
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
              confirm = await MNUtil.confirm("MN Webdav\nNewer config from note!\n卡片配置较新！","Overwrite?\n是否覆盖？")
            }
          }
          if (!confirm) {
            this.setSyncStatus(false)
            return false
          }
          this.config.lastSyncTime = Date.now()+5
          // this.config.modifiedTime = this.config.lastSyncTime
          this.config.syncNoteId = focusNote.noteId
          this.export2MNNote(focusNote)
          this.setSyncStatus(false,true)
          return true
        case "CFR2":
          this.setSyncStatus(true)
          this.config.lastSyncTime = Date.now()+5
          // this.config.modifiedTime = this.config.lastSyncTime
          if (alert) {
            MNUtil.showHUD("Uploading...")
          }
          await webdavConfig.uploadConfigWithEncryptionFromR2(this.config.r2file, this.config.r2password, alert)
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
          await webdavConfig.uploadConfigWithEncryptionToInfi(this.config.InfiFile, this.config.InfiPassword, alert)
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
          let res = await webdavConfig.uploadConfigToWebdav(this.config.webdavFile+".json", authorization)
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
    if (remoteConfig && this.isSameConfigWithLocal(remoteConfig,alert)) {
      this.setSyncStatus(false)
      return false
    }
    switch (syncSource) {
      case "None":
        this.setSyncStatus(false,false)
        return false
      case "iCloud":
        let success = this.writeCloudConfig(false,true)
        this.setSyncStatus(false,success)
        return;
      case "MNNote":
        let noteId = this.getConfig("syncNoteId")
        let latestTime = this.getLocalLatestTime()
        let focusNote = MNNote.new(noteId)
        if (!focusNote) {
          focusNote = MNNote.getFocusNote()
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
            confirm = await MNUtil.confirm("MN Webdav\nNewer config from note!\n卡片配置较新！","Overwrite?\n是否覆盖？")
          }
        }
        if (!confirm) {
          this.setSyncStatus(false)
          return false
        }
        this.config.lastSyncTime = Date.now()+5
        // this.config.modifiedTime = this.config.lastSyncTime
        this.config.syncNoteId = focusNote.noteId
        this.export2MNNote(focusNote)
        this.setSyncStatus(false,true)
        return true
      case "CFR2":
        this.setSyncStatus(true)
        if (remoteConfig && remoteConfig.config && remoteConfig.config.modifiedTime > this.config.modifiedTime) {
          if (alert) {
            let confirm = await MNUtil.confirm("MN Webdav\nNewer config from R2!\nR2配置较新！","Overwrite remote config?\n是否覆盖远程配置？")
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
        await webdavConfig.uploadConfigWithEncryptionFromR2(this.config.r2file, this.config.r2password, alert)
        // MNUtil.copyJSON(this.config)
        this.setSyncStatus(false,true)
        return true
      case "Infi":
        this.setSyncStatus(true)
        if (remoteConfig && remoteConfig.config && remoteConfig.config.modifiedTime > this.config.modifiedTime) {
          if (alert) {
            let confirm = await MNUtil.confirm("MN Webdav\nNewer config from InfiniCloud!\nInfiniCloud配置较新！","Overwrite remote config?\n是否覆盖远程配置？")
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
        await webdavConfig.uploadConfigWithEncryptionToInfi(this.config.InfiFile, this.config.InfiPassword, alert)
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
            let confirm = await MNUtil.confirm("MN Webdav\nNewer config from Webdav!\nWebdav配置较新！","Overwrite remote config?\n是否覆盖远程配置？")
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
        let res = await webdavConfig.uploadConfigToWebdav(this.config.webdavFile+".json", authorization)
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
  } catch (error) {
    webdavUtil.addErrorLog(error, "export")
  }
    // MNUtil.copyJSON(config)
  }
  static saveAfterImport(){
    this.save("MNWebdav_config",true)
  }
  static async sync(){
  return false

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
      focusNote.noteTitle = "MN Webdav Config"
      focusNote.excerptTextMarkdown = true
    })
  }
}
function strCode(str) {  //获取字符串的字节数
    var count = 0;  //初始化字节数递加变量并获取字符串参数的字符个数
    var cn = [8211, 8212, 8216, 8217, 8220, 8221, 8230, 12289, 12290, 12296, 12297, 12298, 12299, 12300, 12301, 12302, 12303, 12304, 12305, 12308, 12309, 65281, 65288, 65289, 65292, 65294, 65306, 65307, 65311]
    var half = [32, 33, 34, 35, 36, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96, 123, 124, 125, 126,105,108,8211]
    if (str) {  //如果存在字符串，则执行
        len = str.length; 
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


function getWebJS(id) {
  switch (id) {
    case "updateDeeplOffset":
      return `document.getElementsByClassName("dl_header")[0].style.display="none";
        document.getElementsByClassName("lmt__docTrans-tab-container")[0].style.display="none";
        document.getElementsByClassName("lmt__sides_container")[0].style.margin = 0;
        document.querySelector("#dl_translator").style.cssText = "padding-top: 20px";
        document.getElementsByClassName("lmt__language_container")[0].style.display = "none";
        document.getElementsByClassName("lmt__language_container")[1].style.display = "none";
        document.getElementsByClassName("lmt__target_toolbar")[0].style.display = "none";
        document.querySelector("#dl_cookieBanner").style.display="none";
        document.querySelector("#lmt_quotes_article").style.display="none";
        document.querySelector("#lmt__dict").style.margin = 0;
        document.querySelector("#lmt_pro_ad_container").style.display = "none";
        document.querySelector("body > div.dl_footerV2_container").style.display = "none";`
    case "updateThesaurusOffset":
      return `document.getElementsByTagName("header")[0].style.display = "none"
        document.getElementsByTagName("section")[0].style.display = "none"
        document.getElementsByTagName("section")[6].style.display = "none"
        document.getElementsByTagName("section")[7].style.display = "none"
        document.getElementsByTagName("section")[8].style.display = "none"
        document.getElementsByTagName("section")[9].style.display = "none"
        document.getElementsByTagName("p")[5].style.display = "none"
        document.getElementsByClassName("acw ac-widget-placeholder ac-reset")[0].style.display = "none"`
    case "updateBilibiliOffset":
      return `
      document.getElementsByClassName("v-popover-wrap")[0].style.display = "none";
      document.getElementsByClassName("v-popover-wrap")[1].style.display = "none";
      document.getElementsByClassName("v-popover-wrap")[2].style.display = "none";
      document.getElementsByClassName("v-popover-wrap")[3].style.display = "none";
      document.getElementsByClassName("v-popover-wrap")[4].style.display = "none";
      document.getElementsByClassName("v-popover-wrap")[5].style.display = "none";
      document.getElementsByClassName("v-popover-wrap")[6].style.display = "none";
      document.getElementsByClassName("v-popover-wrap")[8].style.display = "none";
      document.getElementsByClassName("v-popover-wrap")[10].style.display = "none";
      document.getElementsByClassName("v-popover-wrap")[11].style.display = "none";
      document.getElementsByClassName("v-popover-wrap")[13].style.display = "none";
      document.getElementsByClassName("recommended-swipe grid-anchor")[0].style.display = "none";
      `
    default:
      return ""
  }
}


function postNotification(name,userInfo) {
  let focusWindow = Application.sharedInstance().focusWindow
  NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo(name, focusWindow, userInfo)
  
}
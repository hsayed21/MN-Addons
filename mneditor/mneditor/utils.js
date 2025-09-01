// 定义一个类
class editorUtils {
  static errorLog = []
  static imageBuffer = {}
  static bufferFolder
  static init(mainPath){
    this.mainPath = mainPath
    this.screenImage = MNUtil.getImage(mainPath + `/screen.png`)
    this.linkImage = MNUtil.getImage(mainPath + `/link.png`)
    this.homeImage = MNUtil.getImage(mainPath + `/home.png`)
    this.goforwardImage = MNUtil.getImage(mainPath + `/goforward.png`)
    this.gobackImage = MNUtil.getImage(mainPath + `/goback.png`)
    this.reloadImage = MNUtil.getImage(mainPath + `/reload.png`)
    this.stopImage = MNUtil.getImage(mainPath + `/stop.png`)
    this.webappImage = MNUtil.getImage(mainPath + `/webapp.png`)
    this.listImage = MNUtil.getImage(mainPath + `/list.png`)
    this.editImage = MNUtil.getImage(mainPath + `/edit.png`)
    this.boldImage = MNUtil.getImage(mainPath + `/bold.png`)
    this.codeImage = MNUtil.getImage(mainPath + `/code.png`)
    this.tableImage = MNUtil.getImage(mainPath + `/table.png`)
    this.moreImage = MNUtil.getImage(mainPath + `/more.png`)
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
    let extensionFolder = this.getExtensionFolder(fullPath)
    let folderExist = NSFileManager.defaultManager().fileExistsAtPath(extensionFolder+"/marginnote.extension.mnutils/main.js")
    if (!folderExist) {
      this.showHUD("MN Editor: Please install 'MN Utils' first!",5)
    }
    return folderExist
  }
  static async delay (seconds) {
    return new Promise((resolve, reject) => {
      NSTimer.scheduledTimerWithTimeInterval(seconds, false, function () {
        resolve()
      })
    })
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
  static shouldPrevent(currentURL,requestURL,type) {
    let firstCheck = Application.sharedInstance().osType === 0 && (type===0 || /^https:\/\/m.inftab.com/.test(currentURL))
    if (firstCheck) {
      let blacklist = ["^https?://www.bilibili.com","^https?://m.bilibili.com","^https?://space.bilibili.com","^https?://t.bilibili.com","^https?://www.wolai.com","^https?://flowus.com","^https?://www.notion.so"]
      if (blacklist.some(url=>RegExp(url).test(requestURL))) {
        return true
      }
    }
    return false
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
   * @returns {Boolean}
   */
  static checkSubscribe(count = true, msg = true,ignoreFree = false){
    // return true
    if (typeof subscriptionConfig !== 'undefined') {
      let res = subscriptionConfig.checkSubscribed(count,ignoreFree)
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
  static setFrame(controller,x,y,width,height){
    if (typeof x === "object") {
      controller.view.frame = x
    }else{
      controller.view.frame = MNUtil.genFrame(x, y, width, height)
    }
    controller.currentFrame = controller.view.frame
  }
  static compressedImageDataBase64FromHash(hash){
    let imageData = MNUtil.getMediaByHash(hash)
    return UIImage.imageWithData(imageData).jpegData(0.5).base64Encoding()
  }
  static compressedImageDataBase64FromBase64(base64Str){
    let imageData
    if (/^data:image\/png;base64,/.test(base64Str)) {
      imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64Str))
    }else{
      imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(`data:image/png;base64,`+base64Str))
    }
    return UIImage.imageWithData(imageData).jpegData(0.5).base64Encoding()
  }
  static imageDataFromBase64(base64Str){
    if (/^data:image\/.*;base64,/.test(base64Str)) {
      return NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64Str))
    }else{
      return NSData.dataWithContentsOfURL(MNUtil.genNSURL(`data:image/png;base64,`+base64Str))
    }
  }
  static replaceBase64Images(markdown) {
    // 匹配 base64 图片链接的正则表达式
    const base64ImagePattern = /!\[.*?\]\((data:image\/png;base64,.*?)(\))/g;

    // 处理 Markdown 字符串，替换每个 base64 图片链接
    const result = markdown.replace(base64ImagePattern, (match, base64Str,p2) => {
      // 你可以在这里对 base64Str 进行替换或处理
      let compressedImageBase64 = `data:image/jpeg;base64,`+editorUtils.compressedImageDataBase64FromBase64(base64Str)
      return match.replace(base64Str, compressedImageBase64);
      // return
      // let imageData = NSData.dataWithContentsOfURL(MNUtil.genNSURL(base64Str))
      // let compressedImageData = UIImage.imageWithData(imageData).jpegData(0.5).base64Encoding()
      // // MNUtil.copy("Before: "+base64Str.length+";after: "+compressedImageData.length)
      // return match.replace(base64Str, `data:image/jpeg;base64,`+compressedImageData);
    });

  return result;

}
static undoGrouping(f,notebookId = MNUtil.currentNotebookId){
    UndoManager.sharedInstance().undoGrouping(
      String(Date.now()),
      notebookId,
      f
    )
    // this.app.refreshAfterDBChanged(notebookId)1
  }
static getR2URL(fileName){
  let prefix = this.checkSubscribe(false,false,true)?'img':'file'
  return "https://"+prefix+".feliks.top/"+fileName+".png"
}
static async uploadFileToR2(imageData, fileName, msg = true) {
  let bucketName = this.checkSubscribe(false,false,true)?'pro':'test'
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
    request.setHTTPBody(imageData);
    let res = await this.sendRequest(request,"Upload",msg)
    return res
}
static checkLogo(){
  if (typeof MNUtil === 'undefined') return false
  if (typeof toolbarConfig !== 'undefined' && toolbarConfig.addonLogos && "MNEditor" in toolbarConfig.addonLogos && !toolbarConfig.addonLogos["MNEditor"]) {
      return false
  }
  return true
}


// 示例 Markdown 字符串
// const markdown = `
// ![Image1](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAU...base64Image1)
// Some text here.
// ![Image2](data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...base64Image2)
// `;

// const newMarkdown = replaceBase64Images(markdown);
// console.log(newMarkdown);
  static addErrorLog(error,source,info){
    MNUtil.showHUD("MN Editor Error ("+source+"): "+error)
    if (info) {
      this.errorLog.push({error:error.toString(),source:source,info:info,time:(new Date(Date.now())).toString()})
    }else{
      this.errorLog.push({error:error.toString(),source:source,time:(new Date(Date.now())).toString()})
    }
    MNUtil.copyJSON(this.errorLog)
  }
  static async sendRequest(request,msg="Upload",showMsg=true) {
    const queue = NSOperationQueue.mainQueue()
    // MNUtil.showHUD("send request")
    return new Promise((resolve, reject) => {
      NSURLConnection.sendAsynchronousRequestQueueCompletionHandler(
        request,
        queue,
        (res, data, err) => {
          // let response = {}
          // MNUtil.copyJSON("result:"+res.statusCode())
          if (res.statusCode() === 200) {
            if (showMsg) {
              MNUtil.showHUD(msg+" success")
            }
          }else{
            MNUtil.copy("Error in "+msg+":; statusCode: "+res.statusCode())
            MNUtil.showHUD("Error in "+msg+":; statusCode: "+res.statusCode() )
            resolve()
          }
          const result = NSJSONSerialization.JSONObjectWithDataOptions(
            data,
            1<<0
          )
            // MNUtil.copyJSON(result)

          if (NSJSONSerialization.isValidJSONObject(result)){
            if (err.localizedDescription){
              result.success = false
              MNUtil.showHUD(err.localizedDescription)
            }
            resolve(result)
          }
          if (err.localizedDescription){
            result.success = false
            MNUtil.showHUD(err.localizedDescription)
          }
          resolve(result)
        }
      )
  })
  }
  static isLinkComment(comment){
    if (comment.type === "TextNote") {
      if (/^marginnote\dapp\:\/\//.test(comment.text)) {
        return true
      }else{
        return false
      }
    }
    return false
  }
  static isTagComment(comment){
    if (comment.type === "TextNote") {
      if (/^#\S/.test(comment.text)) {
        return true
      }else{
        return false
      }
    }
    return false
  }
  static getLocalBufferFromBase64(base64){
    let imageData = this.imageDataFromBase64(base64)
    let md5 = MNUtil.MD5(base64)
    let fileName = "local_"+md5+".png"
    if (MNUtil.isfileExists(this.bufferFolder+fileName)) {
      //do nothing
    }else{
      imageData.writeToFileAtomically(this.bufferFolder+fileName, false)
    }
    return fileName
  }
  static getLocalBufferFromImageData(imageData){
    let base64 = imageData.base64Encoding()
    let md5 = MNUtil.MD5(base64)
    let fileName = "local_"+md5+".png"
    if (!imageData) {
      return fileName
    }
    if (MNUtil.isfileExists(this.bufferFolder+fileName)) {
      //do nothing
    }else{
      imageData.writeToFileAtomically(this.bufferFolder+fileName, false)
    }
    return fileName
  }
  static getDocNameFromAttach(file){
    let fileName = MNUtil.getFileName(file)
    let md5 = fileName.replace(".md", "")
    let doc = MNUtil.getDocById(md5)
    let docName = doc? doc.docTitle: md5
    return {md5:md5,name:docName}
  }
  static setCommentIndices(arr, fromIndex, toIndex) {
      let from = fromIndex
      let to = toIndex
      if (fromIndex < 0) {
        from = 0
      }
      if (fromIndex >= (arr.length-1)) {
        from = arr.length-1
      }
      if (toIndex < 0) {
        to = 0
      }
      if (toIndex >= (arr.length-1)) {
        to = arr.length-1
      }
      // 取出要移动的元素
      const element = arr.splice(from, 1)[0];

      // 将元素插入到目标位置
      arr.splice(to, 0, element);

      // 返回调整后的数组
      return arr;
  }
  static moveCommentUp(arr,index){
    let from = index
    let to = index-1
    if (to < 0) {
      MNUtil.showHUD("Alread in top")
      return arr
    }
    return this.setCommentIndices(arr, from, to)
  }
  static moveCommentDown(arr,index){
    let from = index
    let to = index+1
    if (to === arr.length) {
      MNUtil.showHUD("Alread in bottom")
      return arr
    }
    return this.setCommentIndices(arr, from, to)
  }
  static moveCommentTop(arr,index){
    let from = index
    if (from === 0) {
      MNUtil.showHUD("Alread in top")
      return arr
    }
    let to = 0
    return this.setCommentIndices(arr, from, to)
  }
  static moveCommentBottom(arr,index){
    let from = index
    if (from === arr.length-1) {
      MNUtil.showHUD("Alread in Bottom")
      return arr
    }
    let to = arr.length-1
    return this.setCommentIndices(arr, from, to)
  }
  /**
   * 
   * @param {str1} str1 
   * @param {string} str2 
   */
  static checkIsDifferent(str1,str2){
    let convertedStr1 = MNUtil.mergeWhitespace(str1)
    if (/^#\s+\n/.test(str1)) {
      convertedStr1 = str1.slice(2).trim()
    }
    let convertedStr2 = MNUtil.mergeWhitespace(str2)
    if (/^#\s+\n/.test(str2)) {
      convertedStr2 = str2.slice(2).trim()
    }
    // MNUtil.copy("before: "+convertedStr1+"\nafter: "+convertedStr2)

    return convertedStr1 !== convertedStr2
  }
  static getAttachContentByMD5(md5){
    let fileURL = editorUtils.bufferFolder+md5+".md"
    if (MNUtil.isfileExists(fileURL)) {
      let data = NSData.dataWithContentsOfFile(fileURL)
      let test = CryptoJS.enc.Base64.parse(data.base64Encoding())
      let content = CryptoJS.enc.Utf8.stringify(test);
      return content
    }else{
      return undefined
    }
  }
  static highlightEqualsContent(markdown) {
      // 使用正则表达式匹配==xxx==的内容并替换为<mark>xxx</mark>
      return markdown.replace(/==(.+?)==/g, '<mark>\$1</mark>');
  }
  static highlightEqualsContentReverse(markdown) {
      // 使用正则表达式匹配==xxx==的内容并替换为<mark>xxx</mark>
      return markdown.replace(/<mark>(.+?)<\/mark>/g, '==\$1==');
  }
  static parseWinRect(winRect){
    let rectArr = winRect.replace(/{/g, '').replace(/}/g, '').replace(/\s/g, '').split(',')
    let X = Number(rectArr[0])
    let Y = Number(rectArr[1])
    let H = Number(rectArr[3])
    let W = Number(rectArr[2])
    let studyFrame = MNUtil.studyView.frame
    let studyFrameX = studyFrame.x
    let frame = MNUtil.genFrame(X-studyFrameX, Y, W, H)
    return frame
  }
  /**
   * 
   * @returns {UIView}
   */
  static popupMenu(){
    let popupMenu = MNUtil.studyView.subviews.at(-1)
    if (!popupMenu) {
      return undefined
    }
    let buttonTitles = []
    popupMenu.subviews.map(subview=>{
      let button = subview.subviews[0]
      if (button && button.currentTitle) {
        buttonTitles.push(button.currentTitle)
      }
    })
    if (["留白","折叠","焦点","添加到脑图","Add to MindMap","Extend","Focus"].includes(buttonTitles[0])) {
      return popupMenu
    }
    return undefined
  }
  static async checkMNUtil(alert = false,delay = 0.01){
    if (typeof MNUtil === 'undefined') {//如果MNUtil未被加载，则执行一次延时，然后再检测一次
      //仅在MNUtil未被完全加载时执行delay
      await editorUtils.delay(delay)
      if (typeof MNUtil === 'undefined') {
        if (alert) {
          editorUtils.showHUD("MN Editor: Please install 'MN Utils' first!",5)
        }
        return false
      }
    }
    return true
  }
  static isIOS(){
    //把宽度过低的情况也当做是iOS模式
    return (MNUtil.studyView.bounds.width < 500)
  }
  static getWidth(width){
    if (this.isIOS()) {
      return MNUtil.studyView.bounds.width-10
    }else{
      return width
    }
  }
  static getX(x){
    if (this.isIOS()) {
      return 5
    }else{
      return x
    }
  }
  static getY(y){
    if (this.isIOS()) {
      return 5
    }else{
      return y
    }
  }
  /**
   * 
   * @param {UITextView} textView 
   */
  static getMindmapview(textView){
    let mindmapView
    if (textView.isDescendantOfView(MNUtil.mindmapView)) {
      mindmapView = MNUtil.mindmapView
      return mindmapView
    }else{
      try {
        let targetMindview = textView.superview.superview.superview.superview.superview
        let targetStudyview = targetMindview.superview.superview.superview
        if (targetStudyview === MNUtil.studyView) {
          mindmapView = targetMindview
          MNUtil.floatMindMapView = mindmapView
          return mindmapView
        }
        return undefined
      } catch (error) {
        return undefined
      }
    }
  }
  static checkExtendView(textView) {
    try {
      if (textView.superview.superview.superview.superview.superview.superview.superview.superview === MNUtil.readerController.view) {
        // MNUtil.showHUD("嵌入")
        return true
      }
      if (textView.superview.superview.superview.superview.superview.superview.superview.superview.superview === MNUtil.readerController.view) {
        // MNUtil.showHUD("折叠")
        return true
      }
      if (textView.superview.superview.superview.superview.superview.superview.superview.superview.superview.superview.superview.superview.superview === MNUtil.readerController.view) {
        // MNUtil.showHUD("页边")
        return true
      }
    } catch (error) {
      return false
    }
  }
}
class editorConfig{
  static defaultConfig = {
    includingComments: false,
    base64ToR2URL: false,
    base64ToLocalBuffer:true,
    uploadOnSave:false,
    uploadOnEdit:false,
    toolbar:true,
    showOnPopupEdit:false,
    showOnNoteEdit:false,
    mode:"wysiwyg"//ir
  }
  static init(){
    this.config = this.getByDefault('MNEditor_config', this.defaultConfig)
    this.dynamic = this.getByDefault('MNEditor_dynamic', false)
    this.searchOrder         = [2,1,3]
    this.imageCompression = false
    this.moveEditor()
  }
  static moveEditor(){
    try {
      NSFileManager.defaultManager().createDirectoryAtPathAttributes(MNUtil.dbFolder+"/veditor", undefined)
      // if (this.getConfig("toolbar")) {
      NSData.dataWithContentsOfFile(editorUtils.mainPath+"/veditor.html").writeToFileAtomically(MNUtil.dbFolder+"/veditor/veditor.html", false)
      // }else{
      //   NSData.dataWithContentsOfFile(editorUtils.mainPath+"/veditor_noToolbar.html").writeToFileAtomically(MNUtil.dbFolder+"/veditor/veditor.html", false)
      // }
      NSData.dataWithContentsOfFile(editorUtils.mainPath+"/veditor.min.js").writeToFileAtomically(MNUtil.dbFolder+"/veditor/veditor.min.js", false)
      NSData.dataWithContentsOfFile(editorUtils.mainPath+"/subfunc.js").writeToFileAtomically(MNUtil.dbFolder+"/veditor/subfunc.js", false)
      NSData.dataWithContentsOfFile(editorUtils.mainPath+"/veditor.css").writeToFileAtomically(MNUtil.dbFolder+"/veditor/veditor.css", false)
      // NSData.dataWithContentsOfFile(editorUtils.mainPath+"/milkdown.html").writeToFileAtomically(MNUtil.dbFolder+"/veditor/milkdown.html", false)
      // NSFileManager.defaultManager().copyItemAtPathToPath(editorUtils.mainPath+"/veditor.html",MNUtil.dbFolder+"/veditor/veditor.html")
      // NSFileManager.defaultManager().copyItemAtPathToPath(editorUtils.mainPath+"/veditor.min.js",MNUtil.dbFolder+"/veditor/veditor.min.js")
      NSFileManager.defaultManager().copyItemAtPathToPath(editorUtils.mainPath+"/lute.min.js",MNUtil.dbFolder+"/veditor/lute.min.js")
      
      
      // NSFileManager.defaultManager().createDirectoryAtPathAttributes(MNUtil.dbFolder+"/timer", undefined)
      // NSData.dataWithContentsOfFile(editorUtils.mainPath+"/app.js").writeToFileAtomically(MNUtil.dbFolder+"/timer/app.js", false)
      // NSData.dataWithContentsOfFile(editorUtils.mainPath+"/app.css").writeToFileAtomically(MNUtil.dbFolder+"/timer/app.css", false)
      // NSData.dataWithContentsOfFile(editorUtils.mainPath+"/chunk-vendors.js").writeToFileAtomically(MNUtil.dbFolder+"/timer/chunk-vendors.js", false)

      editorUtils.bufferFolder = MNUtil.dbFolder+"/veditor/"
      // editorUtils.bufferFolder = MNUtil.dbFolder+"/timer/"
    } catch (error) {
      editorUtils.addErrorLog(error, "moveEditor")
    }
  }
  static getConfig(key){
    if (this.config[key] !== undefined) {
      return this.config[key]
    }else{
      return this.defaultConfig[key]
    }
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
  static save(key){
        // MNUtil.showHUD("save "+key)
    switch (key) {
      case "MNEditor_config":
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"MNEditor_config")
        break;
      default:
        break;
    }
  NSUserDefaults.standardUserDefaults().synchronize()
  }
}
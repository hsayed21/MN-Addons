// 定义一个类
class editorUtils {
  static errorLog = []
  static imageBuffer = {}
  static bufferFolder
  /**
   * 缓存图片类型
   * {
   *  "xxxx": "png",
   *  "xxxx": "jpeg",
   * }
   */
  static imageTypeCache = {}
  static MNImagePattern = /!\[.*?\]\((marginnote4app\:\/\/markdownimg\/(png|jpeg)\/.*?)(\))/g;

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
  static shouldAsImageExcerpt(note,content){
    if (note.excerptPic && !note.textFirst) {
      if (note.excerptPic.paint) {
        if (MNUtil.isBlankNote(note)) {//不是真正的图片摘录
          return {
            shouldAsImageExcerpt:false,
            content:content
          }
        }
        let hash = note.excerptPic.paint
        let imageURL = this.getMNImageURL(hash)
        let imageURL2 = `![image.png](${imageURL})`
        if (content.startsWith(imageURL2)) {
          return {
            shouldAsImageExcerpt:true,
            imageURL:imageURL,
            content:content.slice(imageURL2.length).trim()
          }
        }
      }
      return {
        shouldAsImageExcerpt:false,
        content:content
      }
    }
    return {
      shouldAsImageExcerpt:false,
      content:content
    }
  }
  static getNoteURLById(noteId){
    if (MNUtil.isMN3()) {
      return "marginnote3app://note/"+noteId
    }else{
      return "marginnote4app://note/"+noteId
    }
  }
  static parseContent(content,withTitleLink = true){
    let hasTitle = /^#/.test(content)
    if (hasTitle) {
      let newTitle = content.split("\n")[0].replace(/^#\s?/g,"")
      let contentRemain = content.split("\n").slice(1).join("\n").trim()
      let headingNames = this.headingNamesFromMarkdown(contentRemain)//解析标题链接
      if (withTitleLink && headingNames.length) {
        newTitle = newTitle+";"+headingNames.map(h=>"{{"+h+"}}").join(";")
      }
      return {
        hasTitle:true,
        title:newTitle,
        content:this.highlightEqualsContent(contentRemain)
      }
    }else{
      let newTitle = ""
      let headingNames = this.headingNamesFromMarkdown(content)//解析标题链接
      if (headingNames.length) {
        newTitle = headingNames.map(h=>"{{"+h+"}}").join(";")
        return {
          hasTitle:true,
          title:newTitle,
          content:this.highlightEqualsContent(content)
        }
      }
      return {
        hasTitle:false,
        title:"",
        content:this.highlightEqualsContent(content)
      }
    }
  }
  static getIndexToEdit(note,removeComment = true){
    let indexToRemove = []
    let targetToSet = []
    if (editorConfig.getConfig("includingComments") && removeComment && note.comments.length) {
      note.comments.map((comment,index)=>{
        switch (comment.type) {
          case "TextNote":
            if (this.isLinkComment(comment) || this.isTagComment(comment)) {
              //do nothing
            }else{
              indexToRemove.push(index)
            }
            break;
          case 'PaintNote':
            if (comment.paint && !comment.drawing) {
              indexToRemove.push(index)
            }
            break;
          case "LinkNote":
            let commentNote = MNUtil.db.getNoteById(comment.noteid)
            if (!commentNote) {
              indexToRemove.push(index)
              break
            }
            if (comment.q_htext && comment.q_htext.trim()) {
              targetToSet.push(index)
            }
            // if (comment.q_hpic && !comment.q_hpic.mask && !comment.q_hpic.drawing) {
            //   shouldTextFirst = true
            // }
            // if (comment.q_htext && !comment.q_hpic) {
            //   indexToRemove.push(index)
            // }
            break;
          default:
            break;
        }
      })
    }
    return {
      indexToRemove:indexToRemove,
      targetToSet:targetToSet
    }
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
      if (/^#\S/.test(comment.text.trim())) {
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
  /**
   * 
   * @param {string} file 
   * @returns 
   */
  static getDocNameFromAttach(file){

    let data = MNUtil.getFile(MNUtil.dbFolder+"/veditor/"+file)
    let dataSize = data? data.length(): 0
    let fileName = MNUtil.getFileName(file)
    let md5 = fileName.replace(".md", "")
    let doc = MNUtil.getDocById(md5)
    let docName = doc? doc.docTitle: md5
    return {md5:md5,name:docName,exists:dataSize > 1}
  }
  static getMNImageURL(hash,type = "png"){
    if (hash in this.imageTypeCache) {
      type = this.imageTypeCache[hash]
    }
    return `marginnote4app://markdownimg/${type}/${hash}`
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
    let isDifferent = convertedStr1 !== convertedStr2
    // if (isDifferent) {
    //   MNUtil.log({message:"checkIsDifferent",detail:{before:convertedStr1,after:convertedStr2}})
    // }
    // MNUtil.copy("before: "+convertedStr1+"\nafter: "+convertedStr2)

    return isDifferent
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
static extractHeadingNames(node) {
  try {
    

  let result = [];
  
  // 检查当前节点是否是 heading 类型
  if (node.type && node.type === 'heading') {
    result.push(node.name);
  }
  
  // 递归处理子节点
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      result = result.concat(this.extractHeadingNames(child));
    }
  }
  
  return result;
  } catch (error) {
    this.addErrorLog(error, "extractHeadingNames")
    return []
  }
}
  static markdown2AST(markdown){
    let tokens = marked.lexer(markdown)
    // MNUtil.copy(tokens)
    return this.buildTree(tokens)
  }
  static headingNamesFromMarkdown(markdown){
    let ast = this.markdown2AST(markdown)
    return this.extractHeadingNames(ast)
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
static newNoteInCurrentChildMap(config){
    let childMap = MNNote.currentChildMap()
    if (childMap) {
      let child = childMap.createChildNote(config)
      return child
    }else{
      let newNote = MNNote.new(config)
      return newNote
    }
  }
  static log(message,detail){
    MNUtil.log({message:message,detail:detail,source:"MN ChatAI"})
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
 static async markdown2Mindmap(des){
 try {
  

    let markdown = ``
    let source = des.source ?? "currentNote"
    let focusNote = MNNote.getFocusNote()
    let newNoteTitle = "Mindmap"
    switch (source) {
      case "currentNote":
        if (!focusNote) {
          MNUtil.showHUD("No note found")
          return
        }
        markdown = this.mergeWhitespace(await this.getMDFromNote(focusNote))
        break;
      case "file":
        let filePath = await MNUtil.importFile(["public.text"])
        if (filePath) {
          markdown = MNUtil.readText(filePath)
        }
        newNoteTitle = MNUtil.getFileName(filePath).split(".")[0]
        break;
      case "clipboard":
        markdown = MNUtil.clipboardText
        break;
      default:
        break;
    }
    // let markdown = des.markdown
    MNUtil.showHUD("Creating Mindmap...")
    await MNUtil.delay(0.1)
    let res = toolbarUtils.markdown2AST(markdown)
    // MNUtil.copy(res)
    MNUtil.undoGrouping(()=>{
      if (!focusNote) {
        focusNote = this.newNoteInCurrentChildMap({title:newNoteTitle})
        focusNote.focusInFloatMindMap(0.5)
      }
      toolbarUtils.AST2Mindmap(focusNote,res)
    })
    return
 } catch (error) {
  this.addErrorLog(error, "markdown2Mindmap")
  return
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
 
           // 动态加载html2canvas脚本的函数
        function loadHtml2CanvasScript( callback) {
            let url = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;

            // 监听脚本加载完成事件 (现代浏览器)
            script.onload = () => {
                console.log(url + ' 加载成功');
                if (callback) {
                    callback();
                }
            };

            // 兼容旧版 IE
            script.onreadystatechange = () => {
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    script.onreadystatechange = null; // 避免重复执行
                    console.log(url + ' 加载成功 (IE)');
                    if (callback) {
                        callback();
                    }
                }
            };

            // 监听脚本加载失败事件
            script.onerror = () => {
                window.location.href = 'browser://showhud?message='+encodeURIComponent('加载失败'+url)
                console.error(url + ' 加载失败');
            };

            document.head.appendChild(script); // 或者 document.body.appendChild(script);
        }
           // 动态加载jspdf脚本的函数
        function loadJSPDFScript( callback) {
            let url = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;

            // 监听脚本加载完成事件 (现代浏览器)
            script.onload = () => {
                console.log(url + ' 加载成功');
                if (callback) {
                    callback();
                }
            };

            // 兼容旧版 IE
            script.onreadystatechange = () => {
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    script.onreadystatechange = null; // 避免重复执行
                    console.log(url + ' 加载成功 (IE)');
                    if (callback) {
                        callback();
                    }
                }
            };

            // 监听脚本加载失败事件
            script.onerror = () => {
                window.location.href = 'browser://showhud?message='+encodeURIComponent('加载失败'+url)
                console.error(url + ' 加载失败');
            };

            document.head.appendChild(script); // 或者 document.body.appendChild(script);
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
                window.location.href = 'browser://showhud?message='+encodeURIComponent('html2canvas库加载失败')
                return;
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
            window.location.href = 'browser://copyimage?image='+image
        }
        
        `

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
    mode:"wysiwyg",
    size:{width:450,height:500}
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
  static save(key = "MNEditor_config",synchronize = true){
        // MNUtil.showHUD("save "+key)
    switch (key) {
      case "MNEditor_config":
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"MNEditor_config")
        break;
      default:
        break;
    }
    if (synchronize) {
      NSUserDefaults.standardUserDefaults().synchronize()
    }
  }
}
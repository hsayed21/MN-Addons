// 定义一个类
class monacoUtils {
  static errorLog = []
  static imageBuffer = {}
  static bufferFolder
  static extensionPath = ""
  static init(mainPath){
    this.mainPath = mainPath
    this.screenImage = MNUtil.getImage(mainPath + `/screen.png`)
    this.linkImage = MNUtil.getImage(mainPath + `/link.png`)
    this.homeImage = MNUtil.getImage(mainPath + `/home.png`)
    this.goforwardImage = MNUtil.getImage(mainPath + `/goforward.png`,2.2)
    this.gobackImage = MNUtil.getImage(mainPath + `/goback.png`,2.2)
    this.reloadImage = MNUtil.getImage(mainPath + `/reload.png`)
    this.stopImage = MNUtil.getImage(mainPath + `/stop.png`)
    this.webappImage = MNUtil.getImage(mainPath + `/webapp.png`)
    this.listImage = MNUtil.getImage(mainPath + `/list.png`,2.2)
    this.editImage = MNUtil.getImage(mainPath + `/edit.png`)
    this.boldImage = MNUtil.getImage(mainPath + `/bold.png`)
    this.codeImage = MNUtil.getImage(mainPath + `/code.png`)
    this.tableImage = MNUtil.getImage(mainPath + `/export.png`,2.2)
    this.moreImage = MNUtil.getImage(mainPath + `/more.png`)
    this.searchImage = MNUtil.getImage(mainPath + `/search.png`,2.2)
    this.logo = MNUtil.getImage(mainPath + `/logo.png`)
    this.extensionPath = mainPath.replace(/\/marginnote\.extension\.\w+/,"")
    this.checkDataDir()
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
    return NSFileManager.defaultManager().fileExistsAtPath(extensionFolder+"/marginnote.extension.mnutils/main.js")
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
        this.showHUD("Please install 'MN Subscription' first!")
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
        this.showHUD("Please install 'MN Subscription' first!")
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
      let compressedImageBase64 = `data:image/jpeg;base64,`+monacoUtils.compressedImageDataBase64FromBase64(base64Str)
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
  if (typeof toolbarConfig !== 'undefined' && toolbarConfig.addonLogos && "Monaco" in toolbarConfig.addonLogos && !toolbarConfig.addonLogos["Monaco"]) {
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
    MNUtil.showHUD("Monaco Error ("+source+"): "+error)
    let log = {
      error:error.toString(),
      source:source,
      time:(new Date(Date.now())).toString(),
      mnaddon:"Monaco"
    }
    if (info) {
      log.info = info
    }
    this.errorLog.push(log)
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
            MNUtil.copy("Error in "+msg+": statusCode: "+res.statusCode())
            MNUtil.showHUD("Error in "+msg+": statusCode: "+res.statusCode() )
            resolve()
          }
          const result = NSJSONSerialization.JSONObjectWithDataOptions(
            data,
            1<<0
          )
            // MNUtil.copyJSON(result)

          if (NSJSONSerialization.isValidJSONObject(result)){
            if (err.localizedDescription){
              // response.error = err.localizedDescription
              // ocrUtils.copyJSON(res)
              result.success = false
              ocrUtils.showHUD(err.localizedDescription)
              // ocrUtils.copy(err.localizedDescription)
              // resolve({error:err.localizedDescription})
            }
            resolve(result)
          }
          if (err.localizedDescription){
            // response.error = err.localizedDescription
            // ocrUtils.copyJSON(res)
            result.success = false
            ocrUtils.showHUD(err.localizedDescription)
            // ocrUtils.copy(err.localizedDescription)
            // resolve({error:err.localizedDescription})
          }
          resolve(result)
        }
      )
  })
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
  static restart(){
    let url = "shortcuts://run-shortcut?name="+encodeURIComponent("MNRestart")
    MNUtil.openURL(url)
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
    let fileURL = monacoUtils.bufferFolder+md5+".md"
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
static buildFileData(paths) {
    const root = [];

    function addPath(root, path) {
        const parts = path.split('/');
        let currentLevel = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            let existingNode = currentLevel.find(node => node.name === part);

            if (!existingNode) {
                existingNode = {
                    name: part,
                    path: path,
                    type: i === parts.length - 1 && !part.includes('.') ? 'folder' : (part.includes('.') ? 'file' : 'folder'),
                    children: i === parts.length - 1 && part.includes('.') ? undefined : []
                };
                currentLevel.push(existingNode);
            }

            if (existingNode.type === 'folder') {
                currentLevel = existingNode.children;
            }
        }
    }

    paths.forEach(path => addPath(root, path));
    return root;
}
  static input(title,subTitle,items) {
    return new Promise((resolve, reject) => {
      UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
        title,subTitle,2,items[0],items.slice(1),
        (alert, buttonIndex) => {
          let res = {input:alert.textFieldAtIndex(0).text,button:buttonIndex}
          resolve(res)
        }
      )
    })
  }

static mainJS(addonId){
  let example = `JSB.newAddon = function (mainPath) {
  //插件依赖MNUtils, 因此如果未安装则直接拒绝加载插件
  if (!MNExampleUtils.checkMNUtilsFolder(mainPath)) return undefined;
  var MNExampleClass = JSB.defineClass(
    'MNExample : JSExtension',
    { /* Instance members */
      sceneWillConnect: async function () { //Window initialize
        if (!(await MNExampleUtils.checkMNUtils())) return;//检查MNUtils是否启用，请勿删除
        MNUtil.showHUD("Hello world!")
      },
      sceneDidDisconnect: function () { // Window disconnect

      },

      sceneWillResignActive: function () { // Window resign active
      },

      sceneDidBecomeActive: function () { // Window become active
      },

      notebookWillOpen: function (notebookid) {
        MNUtil.showHUD("notebookWillOpen")
      },

      notebookWillClose: function (notebookid) {
      },

      documentDidOpen: function (docmd5) {
      },

      documentWillClose: function (docmd5) {
      },

      controllerWillLayoutSubviews: function (controller) {
      },
      queryAddonCommandStatus: function () {
        return {
          image: 'logo.png',
          object: self,
          selector: 'toggleAddon:',//点击插件logo时触发toggleAddon方法
          checked: false
        };
      },
      toggleAddon:function (sender) {
        MNUtil.showHUD("toggleAddon")
      }
    },
    { /* Class members */
      addonDidConnect: function () {
      },

      addonWillDisconnect: function () {
      },

      applicationWillEnterForeground: function () {
      },

      applicationDidEnterBackground: function () {
      },

      applicationDidReceiveLocalNotification: function (notify) {
      }
    }
  );
  return MNExampleClass;
};
class MNExampleUtils {
  static getExtensionFolder(fullPath) {
      let lastSlashIndex = fullPath.lastIndexOf('/');
      let fileName = fullPath.substring(0,lastSlashIndex);
      return fileName;
  }
  /**
   * 检查MNUtils文件夹是否存在
   * @param {string} fullPath 
   * @returns {boolean}
   */
  static checkMNUtilsFolder(fullPath){
    let extensionFolder = this.getExtensionFolder(fullPath)
    let folderExists = NSFileManager.defaultManager().fileExistsAtPath(extensionFolder+"/marginnote.extension.mnutils/main.js")
    if (!folderExists) {
      //如果MNUtils文件夹不存在，自然无法使用MNUtil.showHUD
      Application.sharedInstance().showHUD("MNExample: Please install 'MN Utils' first!",Application.sharedInstance().focusWindow,5)
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
   * 初始化的延迟执行，用以解决闪退后的报错问题
   */
  static async checkMNUtils(){
    await this.delay(0.01)
    if (typeof MNUtil === 'undefined') {
      Application.sharedInstance().showHUD("MN Monaco: Please install 'MN Utils' first!",Application.sharedInstance().focusWindow,5)
      return
    }
  }
}`
  return example.replace(/MNExample/g, addonId)
}
  static checkDataDir(){
    if (subscriptionUtils.extensionPath) {
      NSFileManager.defaultManager().createDirectoryAtPathAttributes(subscriptionUtils.extensionPath+"/data", undefined)
      NSFileManager.defaultManager().createDirectoryAtPathAttributes(subscriptionUtils.extensionPath+"/data/monaco", undefined)
    }
    this.dataFolder = subscriptionUtils.extensionPath+"/data/monaco/"
  }
}
class monacoConfig{
  static defaultConfig = {
    includingComments: false,
    base64ToR2URL: false,
    base64ToLocalBuffer:true,
    uploadOnSave:false,
    uploadOnEdit:false,
    toolbar:true,
    showOnPopupEdit:false,
    mode:"wysiwyg"//ir
  }
  static init(){
    this.config = this.getByDefault('Monaco_config', this.defaultConfig)
    this.dynamic = false
    this.searchOrder         = [2,1,3]
    this.imageCompression = false
    this.moveEditor()
  }
  static moveEditor(){
    try {
      monacoUtils.bufferFolder = monacoUtils.mainPath+"/"
      // monacoUtils.bufferFolder = MNUtil.dbFolder+"/monaco/"
      // NSFileManager.defaultManager().createDirectoryAtPathAttributes(MNUtil.dbFolder+"/monaco", undefined)
      // NSFileManager.defaultManager().createDirectoryAtPathAttributes(MNUtil.dbFolder+"/monaco/vs", undefined)
      // NSData.dataWithContentsOfFile(monacoUtils.mainPath+"/index.html").writeToFileAtomically(monacoUtils.bufferFolder+"index.html", false)
      // NSFileManager.defaultManager().copyItemAtPathToPath(monacoUtils.mainPath+"/vs", MNUtil.dbFolder+"/monaco/vs")
      // ZipArchive.unzipFileAtPathToDestination(monacoUtils.mainPath+"/vs.zip", MNUtil.dbFolder+"/monaco")
    } catch (error) {
      monacoUtils.addErrorLog(error, "copy")
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
      case "Monaco_config":
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"Monaco_config")
        break;
      default:
        break;
    }
  NSUserDefaults.standardUserDefaults().synchronize()
  }
}

class monacoSandbox{
  static async execute(code){
    'use strict';
    if (!monacoUtils.checkSubscribe(true)) {
      return
    }

    try {
      let warpedCode = `const excute = async ()=>{
        try {
          ${code}
        } catch (error) {
          monacoUtils.addErrorLog(error, "executeInSandbox")
        }
      };excute();`
      eval(warpedCode)
      // MNUtil.studyView.bringSubviewToFront(MNUtil.mindmapView)
      // MNUtil.notebookController.view.hidden = true
      // MNUtil.mindmapView.setZoomScaleAnimated(10.0,true)
      // MNUtil.mindmapView.zoomScale = 0.1;
      // MNUtil.mindmapView.hidden = true
      // MNUtil.showHUD("message"+MNUtil.mindmapView.minimumZoomScale)
      // MNUtil.copyJSON(getAllProperties(MNUtil.mindmapView))
    } catch (error) {
      monacoUtils.addErrorLog(error, "executeInSandbox",code)
    }
  }
}
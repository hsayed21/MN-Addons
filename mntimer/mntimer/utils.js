// 定义一个类
class timerUtils {
  static errorLog = []
  static init(mainPath){
    this.mainPath = mainPath
    this.screenImage = MNUtil.getImage(mainPath + `/screen.png`,4)
    this.linkImage = MNUtil.getImage(mainPath + `/link.png`)
    this.homeImage = MNUtil.getImage(mainPath + `/home.png`)
    this.goforwardImage = MNUtil.getImage(mainPath + `/goforward.png`)
    this.gobackImage = MNUtil.getImage(mainPath + `/goback.png`)
    this.reloadImage = MNUtil.getImage(mainPath + `/reload.png`)
    this.stopImage = MNUtil.getImage(mainPath + `/stop.png`)
    this.webappImage = MNUtil.getImage(mainPath + `/webapp.png`)
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
      this.showHUD("MN Timer: Please install 'MN Utils' first!",5)
    }
    return folderExist
  }
  static async checkMNUtil(alert = false,delay = 0.01){
    if (typeof MNUtil === 'undefined') {//如果MNUtil未被加载，则执行一次延时，然后再检测一次
      //仅在MNUtil未被完全加载时执行delay
      await this.delay(delay)
      if (typeof MNUtil === 'undefined') {
        if (alert) {
          this.showHUD("MN Timer: Please install 'MN Utils' first!",5)
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

  /**
   * 
   * @param {string} hex 
   * @returns {UIColor}
   */
  static hexColor(hex,forceAlpha){
    let colorObj = this.parseHexColor(hex)
    if(forceAlpha !== undefined){
      return MNUtil.hexColorAlpha(colorObj.color,forceAlpha)
    }
    return MNUtil.hexColorAlpha(colorObj.color,colorObj.opacity)
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
  static getNewLoc(gesture){
    // let locationToMN = gesture.locationInView(MNUtil.studyView)
    let locationToMN = gesture.locationInView(MNUtil.currentWindow)
    if (!gesture.moveDate) {
      gesture.moveDate = 0
    }
    if ((Date.now() - gesture.moveDate) > 100) {
      let translation = gesture.translationInView(MNUtil.currentWindow)
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
    if (locationToMN.x > MNUtil.currentWindow.frame.width) {
      locationToMN.x = MNUtil.currentWindow.frame.width
    }
    gesture.moveDate = Date.now()
    // let location = {x:locationToMN.x - self.locationToButton.x-gesture.view.frame.x,y:locationToMN.y -self.locationToButton.y-gesture.view.frame.y}
    let location = {x:locationToMN.x - gesture.locationToBrowser.x,y:locationToMN.y -gesture.locationToBrowser.y}
    if (location.y <= 0) {
      location.y = 0
    }
    if (location.y>=MNUtil.currentWindow.frame.height-15) {
      location.y = MNUtil.currentWindow.frame.height-15
    }
    return location
  }
  /**
   * count为true代表本次check会消耗一次免费额度（如果当天未订阅），如果为false则表示只要当天免费额度没用完，check就会返回true
   * 开启ignoreFree则代表本次check只会看是否订阅，不管是否还有免费额度
   * @returns {Boolean}
   */
  static checkSubscribe(count = true, msg = true,ignoreFree = false){
    // return true

    if (typeof subscriptionConfig !== 'undefined') {
      let res = subscriptionConfig.checkSubscribed(count,ignoreFree,msg)
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
  static checkLogo(){
    if (typeof MNUtil === 'undefined') return false
    if (typeof toolbarConfig !== 'undefined' && toolbarConfig.addonLogos && ("MNTimer" in toolbarConfig.addonLogos) && !toolbarConfig.addonLogos["MNTimer"]) {
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
    MNUtil.showHUD("MN Timer Error ("+source+"): "+error)
    if (info) {
      this.errorLog.push({error:error.toString(),source:source,info:info,time:(new Date(Date.now())).toString()})
    }else{
      this.errorLog.push({error:error.toString(),source:source,time:(new Date(Date.now())).toString()})
    }
    MNUtil.copyJSON(this.errorLog)
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

}
class timerConfig{
  static get defaultConfig(){
    return{
      "alertOnFinish": false,
      "showSecond":true,
      "themeColor":"#a4a4a4cd",
      "background": "#000000",
      "fillColor":{
        "top":"#161616",
        "bottom":"#0c0c0c"
      },
      "textColor":{
        "top":"#bcbcbc",
        "bottom":"#b8b8b8"
      },
      "annoText":{
        "fontSize":15,
        "color":"#000000",
        "bold":false
      },
      "lineColor":"#000000",
    }
  }
  static init(){
    this.config = this.getByDefault("MNTimer_config", this.defaultConfig)
    // MNUtil.copyJSON(this.getConfig("fillColor").top)
    this.writeTimer()
  }
  /**
   * 
   * @param {number} forceAlpha 
   * @returns {UIColor}
   */
  static themeColor(forceAlpha){
    if(forceAlpha !== undefined){
      return timerUtils.hexColor(this.getConfig("themeColor"),forceAlpha)
    }
    return timerUtils.hexColor(this.getConfig("themeColor"))
  }
  static get miniWidth(){
    return (this.getConfig("showSecond")?200:136)
  }
  /**
   * 
   * @param {number} forceAlpha 
   * @returns {UIColor}
   */
  static annoTextColor(forceAlpha){
    if(forceAlpha !== undefined){
      return timerUtils.hexColor(this.getConfig("annoText").color,forceAlpha)
    }
    return timerUtils.hexColor(this.getConfig("annoText").color)
  }
  /**
   * 
   * @returns {UIFont}
   */
  static annoFont(){
    if(this.getConfig("annoText").bold){
      return UIFont.boldSystemFontOfSize(this.getConfig("annoText").fontSize);
    }else{
      return UIFont.systemFontOfSize(this.getConfig("annoText").fontSize);
    }
  }
  static writeTimer(){
    MNUtil.writeText(timerUtils.mainPath+"/index.html", `<!DOCTYPE html>
<html lang="">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
  <link rel="icon" href="favicon.ico">
  <title>Clock</title>
  <link href="app.css" rel="preload" as="style">
  <link href="app.js" rel="preload" as="script">
  <link href="chunk-vendors.js" rel="preload" as="script">
  <link href="app.css" rel="stylesheet">
  <style>
  body{
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently supported by Chrome, Opera, and Edge */
  }
  body{
    background-color: ${this.getConfig("background")};
  }
  .bg { /* 记得去掉CSS里的bg*/
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: ${this.getConfig("background")};
  }
  </style>
</head>

<body><noscript><strong>We're sorry but timer doesn't work properly without JavaScript enabled. Please enable it to
      continue.</strong></noscript>
  <div id="app"></div>
  <script>
  // window.colorTop = '#161616'
  // window.colorBottom = '#0c0c0c'
  // window.textColorTop = '#bcbcbc'
  // window.textColorBottom = '#b8b8b8'
    window.colorTop = '${this.getConfig("fillColor").top}';
    window.colorBottom = '${this.getConfig("fillColor").bottom}';
    window.textColorTop = '${this.getConfig("textColor").top}';
    window.textColorBottom = '${this.getConfig("textColor").bottom}';
    window.lineColor = '${this.getConfig("lineColor")}';
    window.showSecond = ${this.getConfig("showSecond")};
  </script>
  <script src="chunk-vendors.js"></script>
  <script src="app.js"></script>
</body>
</html>`)
      // NSData.dataWithContentsOfFile(timerUtils.mainPath+"/app.js").writeToFileAtomically(MNUtil.dbFolder+"/timer/app.js", false)
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
  static save(key,ignoreExport = false,synchronize = true){
    NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"MNTimer_config")
    if (synchronize) {
      NSUserDefaults.standardUserDefaults().synchronize()
    }
  }
  static getConfig(key){
    if (this.config[key] !== undefined) {
      return this.config[key]
    }else{
      return this.defaultConfig[key]
    }
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


function postNotification(name,userInfo) {
  let focusWindow = Application.sharedInstance().focusWindow
  NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo(name, focusWindow, userInfo)
  
}
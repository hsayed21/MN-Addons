class autoUtils {
  // 构造器方法，用于初始化新创建的对象
  constructor(name) {
    this.name = name;
  }
  /**
   * @type {styleController}
   * @static
   */
  static styleController
  /**
   * @type {Boolean}
   * @static
   */
  static addonConnected = false
  /** @type {String} */
  static mainPath
  static errorLog = []
  static defaultConfig = {
    text: [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    image: [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    copy: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    search: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    bigbang: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    snipaste: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ocr: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    editor: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    merge: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    addReview: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    autoTitle: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    autoAiTitle: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    autoTranslate: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    newExcerptTagDetection:false,
    autoTitleThreshold:5
  }
  // 0都没有
// 1都有
// 2image
// 3text
  static init(mainPath){
    if (!this.addonConnected) {
      this.addonConnected = true
      this.app = Application.sharedInstance()
      this.data = Database.sharedInstance()
      this.focusWindow = this.app.focusWindow
      this.version = this.appVersion()
      this.config = this.getByDefault('MNAutoStyle', this.defaultConfig)
      this.mainPath = mainPath
    }

    // this.copyJSON(this.config)
  }
  static showHUD(message,duration=2) {
    this.app.showHUD(message,this.focusWindow,2)
  }

  static appVersion() {
    let info = {}
    let version = parseFloat(this,this.app.appVersion)
    if (version >= 4) {
      info.version = "marginnote4"
    }else{
      info.version = "marginnote3"
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
      default:
        break;
    }
    return info
  }
  static getByDefault(key,defaultValue) {
    let value = NSUserDefaults.standardUserDefaults().objectForKey(key)
    if (value === undefined) {
      NSUserDefaults.standardUserDefaults().setObjectForKey(defaultValue,key)
      return defaultValue
    }
    return value
  }
  static getConfig(key){
    if (this.config[key] !== undefined) {
      return this.config[key]
    }else{
      return this.defaultConfig[key]
    }
  }
  static async delay (seconds) {
    return new Promise((resolve, reject) => {
      NSTimer.scheduledTimerWithTimeInterval(seconds, false, function () {
        resolve()
      })
    })
  }
  static save(){
    NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"MNAutoStyle")
  }
  /**
   * 
   * @returns {Boolean}
   */
  static checkSubscribe(count = true, toast = true){
    // return true
    if (typeof subscriptionConfig !== 'undefined') {
      let res = subscriptionConfig.checkSubscribed(count)
      return res
    }else{
      if (toast) {
        this.showHUD("Please install 'MN Utils' first!")
      }
      return false
    }
  }
  /**
   * 
   * @param {MNNote} focusNote 
   * @param {Object} config 
   */
  static editNoteOneOff(focusNote,config){
  MNUtil.undoGrouping(()=>{
    try {

    if ("excerptText" in config) {
      focusNote.excerptText = config.excerptText
    }
    if ("title" in config) {
      focusNote.title = config.title
    }
    if ("excerptTextMarkdown" in config) {
      focusNote.excerptTextMarkdown = config.excerptTextMarkdown
    }
    if ("groupExcerptText" in config || "groupTitle" in config) {
      let groupNote = MNNote.new(focusNote?.groupNoteId)
      if ("groupExcerptText" in config) {
        groupNote.excerptText = config.groupExcerptText
      }
      if ("groupTitle" in config) {
        groupNote.title = config.groupTitle
      }
    }
      
    } catch (error) {
      autoUtils.addErrorLog(error,"editNoteOneOff")
    }
  })
  }
  static  getNoteColors() {
    return ["#ffffb4","#ccfdc4","#b4d1fb","#f3aebe","#ffff54","#75fb4c","#55bbf9","#ea3323","#ef8733","#377e47","#173dac","#be3223","#ffffff","#dadada","#b4b4b4","#bd9fdc"]
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
  static initStyleController(){
    if (!this.styleController) {
      this.styleController = styleController.new();
      this.styleController.view.hidden = true
      MNUtil.studyView.addSubview(this.styleController.view)
    }
    // this.styleController.refreshColorButtons()

  }
  static getImage(path,scale=2) {
    return UIImage.imageWithDataScale(NSData.dataWithContentsOfFile(path), scale)
  }
  static refreshAddonCommands(){
    this.studyController().refreshAddonCommands()
  }
  static addObserver(observer,selector,name){
    NSNotificationCenter.defaultCenter().addObserverSelectorName(observer, selector, name);
  }
  static removeObserver(observer,name){
    NSNotificationCenter.defaultCenter().removeObserverName(observer, name);
  }
  static checkSender(sender,window){
    return this.app.checkNotifySenderInWindow(sender, window)
  }
  static getCurrentNotebookExcerptColor(){
    let options = MNUtil.currentNotebook.options
    if ("excerptColorTemplate" in options && options.useTopicTool2) {
      let excerptColorTemplate = options.excerptColorTemplate
      let colors = this.rgbaArrayToHexArray(excerptColorTemplate,true)
      return colors
    }else{
      return ["#ffffb4","#ccfdc4","#b4d1fb","#f3aebe","#ffff54","#75fb4c","#55bbf9","#ea3323","#ef8733","#377e47","#173dac","#be3223","#ffffff","#dadada","#b4b4b4","#bd9fdc"]
    }
  }
  static getPopoverAndPresent(sender,commandTable,width=100) {
    var menuController = MenuController.new();
    menuController.commandTable = commandTable
    menuController.rowHeight = 35;
    menuController.preferredContentSize = {
      width: width,
      height: menuController.rowHeight * menuController.commandTable.length
    };
    var popoverController = new UIPopoverController(menuController);
    var r = sender.convertRectToView(sender.bounds,this.studyView());
    popoverController.presentPopoverFromRect(r, this.studyView(), 1 << 1, true);
    return popoverController
  }
  static checkLogo(){
    if (typeof MNUtil === 'undefined') return false
    if (typeof toolbarConfig !== 'undefined' && toolbarConfig.addonLogos && ("MNAutoStyle" in toolbarConfig.addonLogos) && !toolbarConfig.addonLogos["MNAutoStyle"]) {
        return false
    }
    return true
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
      autoUtils.showHUD("MN AutoStyle: Please install 'MN Utils' first!")
    }
    return folderExist
  }
  
  static async checkMNUtil(alert = false,delay = 0.01){
    if (typeof MNUtil === 'undefined') {//如果MNUtil未被加载，则执行一次延时，然后再检测一次
      //仅在MNUtil未被完全加载时执行delay
      await this.delay(delay)
      if (typeof MNUtil === 'undefined') {
        if (alert) {
          let res = await this.confirm("MN AutoStyle:", "Install 'MN Utils' first\n\n请先安装'MN Utils'",["Cancel","Open URL"])
          if (res) {
            this.openURL("https://bbs.marginnote.com.cn/t/topic/49699")
          }
        }else{
          this.showHUD("MN AutoStyle: Please install 'MN Utils' first!",5)
        }
        return false
      }
    }
    return true
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
  static openURL(url){
    if (!this.app) {
      this.app = Application.sharedInstance()
    }
    this.app.openURL(NSURL.URLWithString(url));
  }
  /**
   * 
   * @param {UIView} view 
   */
  static ensureView(view){
    if (!MNUtil.isDescendantOfStudyView(view)) {
      view.hidden = true
      MNUtil.studyView.addSubview(view)
    }
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
  static addErrorLog(error,source,info){
    MNUtil.showHUD("MN AutoStyle Error ("+source+"): "+error)
    let detail = {error:error.toString(),source:source,time:(new Date(Date.now())).toString()}
    if (info) {
      detail.info = info
    }
    this.errorLog.push(detail)
    MNUtil.copy(this.errorLog)
    MNUtil.log({
      level:"error",
      source:"MN AutoStyle",
      message:source,
      detail:detail
    })
  }
/**
 * 合并两个字符串，并进行智能空格处理。
 * - 去除每个字符串两端及内部的多余空格（多个空格压缩为单个）。
 * - 如果连接处两边都是非中文字符（通常是英文），则在它们之间添加一个空格。
 * - 如果连接处任何一边是中文字符，则直接连接，不添加额外空格。
 *
 * @param {string} str1 第一个字符串。
 * @param {string} str2 第二个字符串。
 * @returns {string} 合并后的字符串。
 */
static mergeStringsWithSmartSpacing(str1, str2) {
    // 辅助函数：检查字符是否为中文字符
    const isChineseChar = (char) => {
        if (!char) return false; // 处理空字符情况
        // 常用中文字符的 Unicode 范围
        return /[\u4e00-\u9fa5]/.test(char);
    };

    // 1. 标准化处理单个字符串：
    //    - 确保输入为字符串类型，处理 null 或 undefined 的情况。
    //    - 去除两端空格。
    //    - 将字符串内部的多个连续空格替换为单个空格。
    let s1 = (str1 || "").toString().trim().replace(/\s+/g, ' ');
    let s2 = (str2 || "").toString().trim().replace(/\s+/g, ' ');

    // 2. 处理一个或两个字符串在标准化后为空的情况
    if (s1 === "" && s2 === "") {
        return "";
    }
    if (s1 === "") {
        return s2; // s2 已经是标准化后的
    }
    if (s2 === "") {
        return s1; // s1 已经是标准化后的
    }

    // 3. 判断连接处是否需要空格
    const s1EndsWithChinese = isChineseChar(s1.slice(-1));
    const s2StartsWithChinese = isChineseChar(s2.charAt(0));

    // 如果 s1 的末尾是中文字符，或者 s2 的开头是中文字符，
    // 则它们之间不应添加空格。
    // 这包括： 中文+中文, 英文+中文, 中文+英文。
    // 内部已标准化的空格（如 "Hello 你" 中的空格）会被保留。
    if (s1EndsWithChinese || s2StartsWithChinese) {
        return s1 + s2;
    } else {
        // 如果两边连接处都是非中文字符（通常视为英文处理），
        // 则在它们之间添加一个空格。
        return s1 + " " + s2;
    }
}

/**
 * 检查字符串中的字数是否超过给定阈值。
 * 字数计算规则：
 * 1. 每个中文字符（Han script）计为一个字。
 * 2. 连续的数字序列（如 "123"）计为一个字。
 * 3. 连续的英文字母序列（如 "abc"）计为一个字。
 *
 * @param {string} str 要检查的字符串。
 * @returns {number} 字数
 */
static wordCount(str) {
  // 正则表达式用于匹配：
  // 1. \p{Script=Han}: 任何汉字字符。需要 'u' (unicode) 标志。
  // 2. \d+: 一个或多个连续的数字。
  // 3. [a-zA-Z]+: 一个或多个连续的英文字母（不区分大小写）。
  // 'g' 标志用于全局搜索，找出所有匹配项。
  const regex = /\p{Script=Han}|\d+|[a-zA-Z]+/gu;

  const matches = str.match(regex);
  const wordCount = matches ? matches.length : 0;
  return wordCount;
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
static wordCountBySegmentit(str) {
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
  const request = MNConnection.initRequest(url, {
      method: "POST",
      headers: headers,
      timeout: 60,
      json: body
    })
  return request
}

/**
 * 
 * @returns {Promise<Object>}
 */
 static async ChatGPT(text,systemPrompt,toast,model="glm-4-flashx-250414") {
  try {
  // let key = 'sk-S2rXjj2qB98OiweU46F3BcF2D36e4e5eBfB2C9C269627e44'
  let key = '449628b94fcac030495890ee542284b8.F23PvJW4XXLJ4Lsu'
  MNUtil.waitHUD(toast+" By "+model)
  // let url = subscriptionConfig.config.url + "/v1/chat/completions"
  let url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
  let prompt = text.trim()
  let history = [
    {
      role: "system", 
      content: systemPrompt
    },
    {
      role: "user", 
      content: prompt
    }
  ]
  let request = this.initRequestForChatGPTWithoutStream(history,key, url, model, 0.1)
    let res = await MNConnection.sendRequest(request)
    if ("statusCode" in res && res.statusCode >= 400) {
      if (res.data && "error" in res.data) {
        MNUtil.confirm(toast+" Error", JSON.stringify(res.data.error))
      }else{
        MNUtil.confirm(toast+" Error", "Error Code: "+res.statusCode)
      }
      return undefined
    }
    let title
    if (res.choices && res.choices.length) {
      title = res.choices[0].message.content
    }else{
      return undefined
    }
    return title
    
  } catch (error) {
    autoUtils.addErrorLog(error, "ChatGPT")
    throw error;
  }
}

/**
 * 
 * @returns {Promise<Object>}
 */
 static async ChatGPTVision(imageData,systemPrompt,toast,model="glm-4v-flash") {
  try {
  // let key = 'sk-S2rXjj2qB98OiweU46F3BcF2D36e4e5eBfB2C9C269627e44'
  let key = '449628b94fcac030495890ee542284b8.F23PvJW4XXLJ4Lsu'
  MNUtil.waitHUD(toast+" By "+model)
  // let url = subscriptionConfig.config.url + "/v1/chat/completions"
  let url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
  let compressedImageData = UIImage.imageWithData(imageData).jpegData(0.0)
  let history = [
    {
      role: "system", 
      content: systemPrompt
    },
    {
      role: "user", 
      content: [
        {
          "type": "image_url",
          "image_url": {
            "url" : "data:image/jpeg;base64,"+compressedImageData.base64Encoding()
          }
        }
      ]
    }
  ]
  let request = this.initRequestForChatGPTWithoutStream(history,key, url, model, 0.1)
    let res = await MNConnection.sendRequest(request)
    if ("statusCode" in res && res.statusCode >= 400) {
      if (res.data && "error" in res.data) {
        MNUtil.confirm(toast+" Error", JSON.stringify(res.data.error))
      }else{
        MNUtil.confirm(toast+" Error", "Error Code: "+res.statusCode)
      }
      return undefined
    }
    let title
    if (res.choices && res.choices.length) {
      title = res.choices[0].message.content
    }else{
      return undefined
    }
    return title
    
  } catch (error) {
    autoUtils.addErrorLog(error, "ChatGPT")
    throw error;
  }
}
  /**
   * @returns {Promise<String>}
   */
  static async generateTitle(text){
    if (!this.checkSubscribe(true,false)) {
      return undefined
    }
    let systemPrompt = `# 角色
你是一个文本标题生成器，能根据用户提供的文本，用与文本相同的语言生成简洁且信息丰富的标题，标题字数不超过10个。

## 技能
### 技能 1: 生成标题
1. 接收用户输入的文本。
2. 分析文本内容，提炼关键信息。
3. 用不超过10个词生成能概括文本核心内容的标题。

## 限制
- 仅生成标题，不做其他回复。
- 标题语言需与输入文本语言一致。
- 标题字数严格不超过10个。`
    let res = await this.ChatGPT(text,systemPrompt,"Auto Title")
    MNUtil.stopHUD()
    return res
  }
  /**
   * @returns {Promise<String>}
   */
  static async generateTitleVision(imageData){
    if (!this.checkSubscribe(true,false)) {
      return undefined
    }
    let systemPrompt = `# 角色
你是一个文本标题生成器，能根据用户提供的文本，用与文本相同的语言生成简洁且信息丰富的标题，标题字数不超过10个。

## 技能
### 技能 1: 生成标题
1. 接收用户输入的文本。
2. 分析文本内容，提炼关键信息。
3. 用不超过10个词生成能概括文本核心内容的标题。

## 限制
- 仅生成标题，不做其他回复。
- 标题语言需与输入文本语言一致。
- 标题字数严格不超过10个。`
    let res = await this.ChatGPTVision(imageData,systemPrompt,"Auto Title")
    MNUtil.stopHUD()
    return res
  }
  static async generateTranslate(text){
    if (!this.checkSubscribe(true,false)) {
      return undefined
    }
    let systemPrompt = "For the given text from user, translate it into chinese."
    let res = await this.ChatGPT(text,systemPrompt,"Auto Translate")
    MNUtil.stopHUD()
    return res
  }
}

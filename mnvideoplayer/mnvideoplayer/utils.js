class videoPlayerUtils {
  static errorLog = []
  static videoConfig = {}
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
    this.moreImage = MNUtil.getImage(mainPath + `/more.png`,2.5)
  }

  // static cdn = {
  //   "html2canvas":"https://vip.123pan.cn/1836303614/dl/cdn/html2canvas.js",
  //   "win11":"https://vip.123pan.cn/1836303614/dl/win11.jpg",
  //   "webapp":"https://vip.123pan.cn/1836303614/dl/icon/webapp.png",
  //   "search":"https://vip.123pan.cn/1836303614/dl/icon/search.png",
  // }
  static cdn = {
    "html2canvas":"https://alist.feliks.top/d/cdn/js/html2canvas.js",
    "win11":"https://alist.feliks.top/d/cdn/icon/win11.jpg",
    "webapp":"https://alist.feliks.top/d/cdn/icon/webapp.png",
    "search":"https://alist.feliks.top/d/cdn/icon/search.png",
    "setting":"https://alist.feliks.top/d/cdn/icon/settings.png",
    "www.bilibili.com":"https://alist.feliks.top/d/cdn/icon/bilibili.png",
    "www.notion.so":"https://alist.feliks.top/d/cdn/icon/notion.png",
    "pan.baidu.com":"https://alist.feliks.top/d/cdn/icon/baidupan.png",
    "docs.craft.do":"https://alist.feliks.top/d/cdn/icon/craft.png",
    "www.doubao.com":"https://alist.feliks.top/d/cdn/icon/doubao.png",
    "chat.deepseek.com":"https://alist.feliks.top/d/cdn/icon/deepseek.png",
    "chat.qwen.ai":"https://alist.feliks.top/d/cdn/icon/qwen.png",
    "www.wolai.com":"https://alist.feliks.top/d/cdn/icon/wolai.png",
    "www.yinian.pro":"https://alist.feliks.top/d/cdn/icon/yinian.png",
    "yuanbao.tencent.com":"https://alist.feliks.top/d/cdn/icon/yuanbao.png",
    "ima.qq.com":"https://alist.feliks.top/d/cdn/icon/ima.png",
    "flowus.cn":"https://alist.feliks.top/d/cdn/icon/flowus.png",
    "www.kimi.com":"https://alist.feliks.top/d/cdn/icon/kimi.png",
    "chat.z.ai":"https://alist.feliks.top/d/cdn/icon/zai.png",
    "v.flomoapp.com":"https://alist.feliks.top/d/cdn/icon/flomo.png",
    "www.xiaohongshu.com":"https://alist.feliks.top/d/cdn/icon/rednote.png",
    "doc2x.noedgeai.com":"https://alist.feliks.top/d/cdn/icon/doc2x.png",
    "www.jianguoyun.com":"https://alist.feliks.top/d/cdn/icon/nutstore.png",
    "boardmix.cn":"https://alist.feliks.top/d/cdn/icon/boardmix.png",
    "fireflycard.shushiai.com":"https://alist.feliks.top/d/cdn/icon/fireflyCard.png"
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
/**
 * 直接从 Base64 格式的 Data URL 判断文件格式
 * @param {string} base64Url - Base64 Data URL（如 data:application/octet-stream;base64,...）
 * @returns {string} 文件格式（如 'jpg', 'png', 'pdf' 等，未知则返回 'unknown'）
 */
static getBase64UrlFileType(base64Url) {
  try {
    // 步骤1：提取 Base64 内容部分（去除前缀）
    const base64Data = base64Url.split(',')[1]; // 分割后第二个元素是 Base64 内容
    if (!base64Data) throw new Error('无效的 Base64 URL');

    // 步骤2：Base64 解码为二进制数据（Uint8Array），只需前 16 字节
    const binaryStr = subscriptionNetwork.atob(base64Data); // 将 Base64 解码为二进制字符串
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
    this.addErrorLog(error, "getBase64UrlFileType")
    return 'unknown';
  }
}

  static checkMNUtilsFolder(fullPath){
    let extensionFolder = this.getExtensionFolder(fullPath)
    let folderExist = NSFileManager.defaultManager().fileExistsAtPath(extensionFolder+"/marginnote.extension.mnutils/main.js")
    if (!folderExist) {
      this.showHUD("MN Video Player: Please install 'MN Utils' first!",5)
    }
    return folderExist
  }
  static async checkMNUtil(alert = false,delay = 0.01){
  try {
    if (typeof MNUtil === 'undefined') {//如果MNUtil未被加载，则执行一次延时，然后再检测一次
      //仅在MNUtil未被完全加载时执行delay
      await this.delay(delay)
      if (typeof MNUtil === 'undefined') {
        if (alert) {
          let res = await this.confirm("MN Video Player:", "Install 'MN Utils' first\n\n请先安装'MN Utils'",["Cancel","Open URL"])
          if (res) {
            this.openURL("https://bbs.marginnote.com.cn/t/topic/49699")
          }
        }else{
          this.showHUD("MN Video Player: Please install 'MN Utils' first!",5)
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
  static copy(text) {
    UIPasteboard.generalPasteboard().string = text
  }
  static openURL(url){
    if (!this.app) {
      this.app = Application.sharedInstance()
    }
    this.app.openURL(NSURL.URLWithString(url));
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
    if (typeof toolbarConfig !== 'undefined' && toolbarConfig.addonLogos && ("MNVideoPlayer" in toolbarConfig.addonLogos) && !toolbarConfig.addonLogos["MNVideoPlayer"]) {
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
  /**
   * 
   * @param {MbBookNote} note 
   * @returns 
   */
  static getImageFromNote(note,checkTextFirst = false) {
    if (note.excerptPic) {
      if (checkTextFirst && note.textFirst) {
        //检查发现图片已经转为文本，因此略过
      }else{
        return MNUtil.getMediaByHash(note.excerptPic.paint)
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
  static getCurrentImage(){
  try {

    let foucsNote = MNNote.getFocusNote()

    // let imageData = ocrUtils.getImageForOCR()
    let imageData = MNUtil.getDocImage(true,true)
    if (!imageData) {
      if (foucsNote) {
        imageData = this.getImageFromNote(foucsNote)
      }else{
        // MNUtil.showHUD("No focus note")
        return undefined;
      }
    }
    if (!imageData) {
        // MNUtil.showHUD("No image")
      return undefined;
    }
    return imageData
    
  } catch (error) {
    videoPlayerUtils.addErrorLog(error, "getCurrentImage")
    return undefined;
  }
  }
  /**
   * 
   * @param {string} url
   * @returns 
   */
  static async readConfigFromURL(url){
    try {

      let text = await MNConnection.fetch(url, {
        method: 'GET',
        headers:{
          "Cache-Control": "no-cache"
        }
      })
      if (typeof text === "object") {
        return text
      }
      return JSON.parse(text)

    } catch (error) {
      this.addErrorLog(error, "readConfigFromURL")
      return undefined
    }
  }
  static async getVideoConfig(){
    //暂时使用本地配置
    let config = MNUtil.readJSON(videoPlayerUtils.mainPath + '/videoConfig.json')
    // let url = "https://cdn.u1162561.nyat.app:43836/d/cdn/videoConfig.json"
    // let config = await this.readConfigFromURL(url)
    let collections = config.collections
    let collectionIds = Object.keys(collections)
    for (let i = 0; i < collectionIds.length; i++) {
      let collectionId = collectionIds[i]
      let collection = collections[collectionId]
      collection.cover = videoPlayerConfig.baseURL + collection.cover
      collections[collectionId] = collection
    }
    config.collections = collections
    if (config) {
      this._videoConfig = config
    }
    return config
  }
  static hasVideoConfig(){
    return this._videoConfig && Object.keys(this._videoConfig.videos).length > 0
  }
  static get videos(){
    return this._videoConfig.videos
  }
  static get collections(){
    return this._videoConfig.collections
  }
  /**
   * 
   * @param {string} id 
   * @returns {{id:string,title:string,url:string,cover:string,videoId:string}}
   */
  static _getVideoInfoById(id){
  try {

    if (this.hasVideoConfig()) {
      let videoInfo = this.videos[id]
      return {...videoInfo}
    }
    return undefined
    
  } catch (error) {
    this.addErrorLog(error, "_getVideoInfoById")
    return undefined
  }
  }
  /**
   * 
   * @param {string} id 
   * @returns {{id:string,title:string,url:string,cover:string,videoId:string}}
   */
  static getVideoInfoById(id){
  try {
    let videoInfo = this._getVideoInfoById(id)
    if (videoInfo && Object.keys(videoInfo).length > 0) {
      videoPlayerUtils.log("getVideoInfoById", videoInfo)
      if (!videoInfo.url.startsWith("http")) {
        let url = videoPlayerConfig.baseURL+videoInfo.url
        videoInfo.url = url
      }
      return videoInfo
    }else{
      videoPlayerUtils.log("id not found: " + id)
      MNUtil.copy(id)
    }
    return undefined
    
  } catch (error) {
    this.addErrorLog(error, "getVideoInfoById")
    return undefined
  }
  }
  static getAllVideosInfoByCollectionId(id){
    if (this.hasVideoConfig()) {
      let collectionInfo = this.collections[id]
      return collectionInfo.videos.map(videoId => this.getVideoInfoById(videoId))
    }
    return undefined
  }
  static getCollectionInfoById(id){
    if (this.hasVideoConfig()) {
      return this.collections[id]
    }
    return undefined
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
postMessageToAddon(scheme, host, path, params,fragment) {
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
  static addErrorLog(error,source,info){
    MNUtil.showHUD("MN Video Player Error ("+source+"): "+error)
    let log = {
      error:error.toString(),
      source:source,
      time:(new Date(Date.now())).toString(),
      mnaddon:"MN Video Player"
    }
    if (info) {
      log.info = info
    }
    this.errorLog.push(log)
    MNUtil.copy(this.errorLog)
    if (typeof MNUtil.log !== 'undefined') {
      MNUtil.log({
        source:"MN Video Player",
        level:"error",
        message:source,
        detail:log,
      })
    }
  }
  static ttsHtml(){
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MP3 Player</title>
</head>
<body>
    <audio controls id="audioPlayer">
        Your browser does not support the audio element.
    </audio>

    <script>
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer sk-Z009eI4mw8tmOqgvA598C8B7Eb9a4444821018157bC59fF1");
        myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
           "model": "tts-1",
           "input": "The quick brown fox jumped over the lazy dog.",
           "voice": "alloy"
        });

        var requestOptions = {
           method: 'POST',
           headers: myHeaders,
           body: raw,
           redirect: 'follow'
        };

        fetch("https://chatapi.onechats.top/v1/audio/speech", requestOptions)
           .then(response => response.blob())
           .then(blob => {
               var url = URL.createObjectURL(blob);
               var audioPlayer = document.getElementById('audioPlayer');
               var source = document.createElement('source');
               source.src = url;
               source.type = 'audio/mpeg';
               audioPlayer.appendChild(source);
               audioPlayer.load();
           })
           .catch(error => console.log('error', error));
    </script>
</body>
</html>
`
  return html
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
    let order = videoPlayerConfig.searchOrder
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
  /**
   * 
   * @param {MNNote|MbBookNote} note 
   */
static async parseNoteInfo(note){
  let config = {content:this.getTextForSearch(note)}
  let markdown = await note.getMDContent()
  let bilibiliLinks = this.extractBilibiliLinks(markdown)
  if (bilibiliLinks.length) {
    config.bilibiliLinks = bilibiliLinks
  }
  let webLinks = this.extractWebLink(markdown)
  if (webLinks.length) {
    config.webLinks = webLinks
  }
  return config
}
  static extractWebLink (markdownText) {
  if (!this.checkSubscribe(true)) {
    return undefined
  }
  // 正则表达式匹配以 "marginnote4app://addon/BilibiliExcerpt?videoId=" 开头的链接
  const regex = /https:\/\/.*/g;

  const results = [];
  let match;

  // 循环匹配所有符合条件的链接
  while ((match = regex.exec(markdownText)) !== null) {
    results.push(match[0]);
  }
  return results;
}
static extractBilibiliLinks(markdownText) {
  // if (!this.checkSubscribe(true)) {
  //   return undefined
  // }
  // 正则表达式匹配以 "marginnote4app://addon/BilibiliExcerpt?videoId=" 开头的链接
  const regex = /marginnote4app:\/\/addon\/BilibiliExcerpt\?videoId=([^&\s)]+)(?:&t=([\d.]+))?(?:&p=([\d.]+))?/g;

  const results = [];
  let match;

  // 循环匹配所有符合条件的链接
  while ((match = regex.exec(markdownText)) !== null) {
    const videoId = match[1]; // 提取 videoId
    const t = match[2] ? parseFloat(match[2]) : null; // 提取 t 并转换为数字，如果不存在则为 null
    const p = match[3] ? parseFloat(match[3]) : null; // 提取 t 并转换为数字，如果不存在则为 null

    results.push({ videoId, t ,p});
  }

  return results;
}
static extractVideoLinks(markdownText) {
  // if (!this.checkSubscribe(true)) {
  //   return undefined
  // }
  // 正则表达式匹配以 "marginnote4app://addon/VideoExcerpt?videoId=" 开头的链接
  const regex = /marginnote4app:\/\/addon\/VideoExcerpt\?videoId=([^&\s)]+)(?:&t=([\d.]+))?/g;

  const results = [];
  let match;

  // 循环匹配所有符合条件的链接
  while ((match = regex.exec(markdownText)) !== null) {
    const videoId = match[1]; // 提取 videoId
    const t = match[2] ? parseFloat(match[2]) : null; // 提取 t 并转换为数字，如果不存在则为 null

    results.push({ videoId, t});
  }

  return results;
}
  static videoInfo2MD(videoFrameInfo){
    if ("videoId" in videoFrameInfo) {
      let timeStamp = this.videoTime2MD(videoFrameInfo)
      return `![image.png](${videoFrameInfo.image})\n${timeStamp}`
      
    }else{
      return `![image.png](${videoFrameInfo.image})`
    }
  }
  static genVideoExcerptLink(videoFrameInfo){
    return `marginnote4app://addon/VideoExcerpt?videoId=${videoFrameInfo.videoId}&t=${videoFrameInfo.time}`
  }
  static videoTime2MD(videoFrameInfo){
    let link = this.genVideoExcerptLink(videoFrameInfo)
    let formatedVideoTime = this.formatSeconds(videoFrameInfo.time)
    return `[${formatedVideoTime}](${link})`
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
static checkRedirect(requestURL){
    let info = {
      isRedirect:false,
      redirectURL:""
    }
    if (requestURL.startsWith("https://www.baidu.com/s?tn" || requestURL.startsWith("https://www.baidu.com/s?wd="))) {
      let searchText = requestURL.split("wd=")[1]
      // MNUtil.copy(searchText)
      let decodedSearchText = decodeURIComponent(searchText)
      if (decodedSearchText.startsWith("https://") || decodedSearchText.startsWith("http://")) {
        info.isRedirect = true
        info.redirectURL = decodedSearchText
        return info
      }
      info.isRedirect = true
      info.redirectURL = "https://www.baidu.com/s?wd="+searchText
      return info
    }
    if (requestURL.startsWith("https://www.google.com/search?q=")) {
      let searchText = requestURL.split("search?q=")[1]
      let decodedSearchText = decodeURIComponent(searchText)
      if (decodedSearchText.startsWith("https://") || decodedSearchText.startsWith("http://")) {
        info.isRedirect = true
        info.redirectURL = decodedSearchText
        return info
      }
    }
    if (requestURL.startsWith("https://www.bing.com/search?q=") || requestURL.startsWith("https://cn.bing.com/search?form=bing&q=")) {
      let searchText = requestURL.split("q=")[1]
      let decodedSearchText = decodeURIComponent(searchText)
      if (decodedSearchText.startsWith("https://") || decodedSearchText.startsWith("http://")) {
        info.isRedirect = true
        info.redirectURL = decodedSearchText
        return info
      }
    }
    if (requestURL.startsWith("https://www.duckduckgo.com/?q=")) {
      let searchText = requestURL.split("?q=")[1]
      let decodedSearchText = decodeURIComponent(searchText)
      if (decodedSearchText.startsWith("https://") || decodedSearchText.startsWith("http://")) {
        info.isRedirect = true
        info.redirectURL = decodedSearchText
        return info
      }
    }
    if (requestURL.startsWith("https://www.sogou.com/sogou") && requestURL.includes("query=")) {
      let searchText = requestURL.split("query=")[1]
      let decodedSearchText = decodeURIComponent(searchText)
      if (decodedSearchText.startsWith("https://") || decodedSearchText.startsWith("http://")) {
        info.isRedirect = true
        info.redirectURL = decodedSearchText
        return info
      }
    }
    if (requestURL.startsWith("https://yandex.com/search") && requestURL.includes("text=")) {
      let searchText = requestURL.split("text=")[1]
      let decodedSearchText = decodeURIComponent(searchText)
      if (decodedSearchText.startsWith("https://") || decodedSearchText.startsWith("http://")) {
        info.isRedirect = true
        info.redirectURL = decodedSearchText
        return info
      }
    }
    if (requestURL.startsWith("https://m.so.com/s?")) {
      let searchText = requestURL.split("q=")[1]
      let decodedSearchText = decodeURIComponent(searchText)
      if (decodedSearchText.startsWith("https://") || decodedSearchText.startsWith("http://")) {
        info.isRedirect = true
        info.redirectURL = decodedSearchText
        return info
      }
    }
    if (requestURL.startsWith("https://www.zhihu.com/search?type=content&q=")) {
      let searchText = requestURL.split("search?type=content&q=")[1]
      let decodedSearchText = decodeURIComponent(searchText)
      if (decodedSearchText.startsWith("https://") || decodedSearchText.startsWith("http://")) {
        info.isRedirect = true
        info.redirectURL = decodedSearchText
        return info
      }
    }
    return info
}

  static log(message,detail){
    MNUtil.log({message:message,detail:detail,source:"MN Video Player"})
  }
  static btoa(str) {
      // Encode the string to a WordArray
      const wordArray = CryptoJS.enc.Utf8.parse(str);
      // Convert the WordArray to Base64
      const base64 = CryptoJS.enc.Base64.stringify(wordArray);
      return base64;
  }
  static getWebdavConfig(config){
      let url = (config.path === "/")?config.baseUrl:(config.baseUrl+config.path);
      url = url.replace(/\/$/, '')+"/"+config.name
      let res = {
        Authorization:'Basic ' + this.btoa(config.username + ':' + config.password),
        url:url
      }
      return res
    }
  static async uploadImageData(pdfData,fileName){
    try {
    // https://cdn.u1162561.nyat.app:43836/d/cdn/cover/00c28b6ac2070067780ee4089566f77d.jpeg
      let config = {
        path: "/cdn/cover",
        name: fileName+".jpeg",
        baseUrl: "https://cdn.u1162561.nyat.app:43836/dav",
        username: "admin",
        password: "linlifei"
      }
      let tem = this.getWebdavConfig(config)
      const headers = {
        Authorization:tem.Authorization,
        "Cache-Control": "no-cache",
        'Content-Type': "image/jpeg"
      };
      let body = NSMutableData.new()
      body.appendData(pdfData)
      // MNUtil.copy(tem)
      const request = MNConnection.initRequest(tem.url, {
          method: 'PUT',
          headers: headers,
          timeout: 3600
      })
      request.setHTTPBody(body)
      let res = await MNConnection.sendRequest(request)
      MNUtil.copy(res)
      return res
    } catch (error) {
      this.addErrorLog(error, "uploadImageData")
    }
  }

}
class videoPlayerConfig{
  static sourceConfig = {
      "source1": "https://cdn.u1162561.nyat.app:43836/d/cdn",
      "source2": "http://cn-hk-bgp-4.ofalias.net:62334/d/cdn",
      "source3": "https://vip.123pan.cn/1836303614/video"
  }
  static get defaultEntries(){
    return {
      Bing:             { title: '🔍 Bing',           symbol: "🔍", engine: "Bing",     desktop:false, link: "https://www.bing.com/search?q=%s" }
    }
  }
  static get defaultWebAppEntries(){
    return {
      Example:         { title: 'Example',      id: "6b5b1286e3bcfae7224d01fe425a20d1", time:0 }
    }
  }
  static onSync = false
  static get allCustomActions(){
    return [
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
        "play0.5x",
        "play1.25x",
        "play1.5x",
        "play1.75x",
        "play2x",
        "play2.5x",
        "play3x",
        "play3.5x",
        "play4x",
        "toggleMute",
        "forward10s",
        "forward15s",
        "forward30s",
        "backward10s",
        "backward15s",
        "backward30s"
      ]
  }
  static getCustomEmojiByAction(action){
    if (action.startsWith("webApp:")) {
      let webAppEntry = this.webAppEntries[action.split(":")[1]]
      if ("symbol" in webAppEntry) {
        return webAppEntry.symbol;
      }
      return "🌐";
    }
    switch (action) {
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
      case "forward15s":
      case "forward30s":
        return "⏩";
      case "backward10s":
      case "backward15s":
      case "backward30s":
        return "⏪";
      case "pauseOrPlay":
        return "▶️"
      case "toggleMute":
        return "🔇"
      case "volumeUp":
        return "🔊"
      case "volumeDown":
        return "🔈"
      case "play0.5x":
      case "play1.25x":
      case "play1.5x":
      case "play1.75x":
      case "play2x":
      case "play2.5x":
      case "play3x":
      case "play3.5x":
      case "play4x":
        return "⏯️"
      case "bigbang":
        return "💥"
      case "openNewWindow":
      case "openInNewWindow":
        return "➕";
      case "copyCurrentURL":
      case "copyAsMDLink":
      case "openCopiedURL":
        return "🌐";
      case "uploadPDF":
      case "uploadPDFToDoc2X":
      case "uploadImageToDoc2X":
        return "📤";
      case "changeBilibiliVideoPart":
        return "🕐";
      default:
        break;
    }
    return "🔨";
  }
  static getCustomEmoji(index){
    let configName = (index === 1)?"custom":"custom"+index
    return this.getCustomEmojiByAction(this.getConfig(configName))
  }
    static getCustomDescription(action){
    if (action.startsWith("webApp:")) {
      let webAppEntry = this.webAppEntries[action.split(":")[1]]
      return webAppEntry.title;
    }
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
      "toggleMute":"toggle mute",
      "volumeUp":"volume up",
      "volumeDown":"volume down",
      "play0.5x":"play 0.5x",
      "play1.25x":"play 1.25x",
      "play1.5x":"play 1.5x",
      "play1.75x":"play 1.75x",
      "play2x":"play 2x",
      "play2.5x":"play 2.5x",
      "play3x":"play 3x",
      "play3.5x":"play 3.5x",
      "play4x":"play 4x",
      "forward10s":"video forward 10s",
      "forward15s":"video forward 15s",
      "forward30s":"video forward 30s",
      "backward10s":"video backward 10s",
      "backward15s":"video backward 15s",
      "backward30s":"video backward 30s",
      "bigbang":"bigbang",
      "copyCurrentURL":"copy current URL",
      "copyAsMDLink":"copy as MD link",
      "openCopiedURL":"open copied URL",
      "uploadPDF":"upload PDF",
      "uploadPDFToDoc2X":"upload PDF to Doc2X",
      "uploadImageToDoc2X":"upload Image to Doc2X",
      "changeBilibiliVideoPart":"Change Bilibili Video part"
    }
    let emoji = this.getCustomEmojiByAction(action)
    return emoji+" "+actionConfig[action];
  }
  static get defaultConfig(){
    return{
      baseURL: "https://cdn.u1162561.nyat.app:43836/d/cdn",
      syncNoteId: "",
      autoExport:false,
      autoImport:false,
      autoExitWatchMode:true,
      lastSyncTime:0,
      modifiedTime:0,
      custom:"videoFrame2Clipboard",
      custom2:"videoFrame2Note",
      custom3:"videoFrame2ChildNote",
      custom4:"videoFrameToComment",
      custom5:"backward10s",
      custom6:"pauseOrPlay",
      custom7:"forward10s",
      custom8:"toggleMute",
      custom9:"play0.5x",
      custom10:"play2x",
      timestampDetail:true,
      autoOpenVideoExcerpt:false,
      size:{width:419,height:450},
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
      miniModeOpacity:1.0,
      autoPlayNextVideo:false
    }
  }
  static previousConfig = {}
  static get homePageEngine(){
    let engine = this.getConfig("homePageEngine")
    if (!(engine in this.entries)) {
      engine = this.entrieNames[0]
    }
    return engine
  }
  static getAvailableEngineEntryKey(){
    let i = 0
    while (this.entries["customEngine"+i]) {
      i = i+1
    }
    return "customEngine"+i
  }
  static getAvailableWebAppEntryKey(){
    let i = 0
    while (this.webAppEntries["customEWebApp"+i]) {
      i = i+1
    }
    return "customEWebApp"+i
  }
  static init(){
    this.config = this.getByDefault('MNVideoPlayer_config', this.defaultConfig)
    this.entries = this.defaultEntries
    this.entrieNames = Object.keys(this.entries)
    this.webAppEntries = this.defaultWebAppEntries
    this.webAppEntrieNames = Object.keys(this.webAppEntries)
    if (!this.webAppEntrieNames.length) {
      this.webAppEntrieNames = Object.keys(this.webAppEntries)
    }
    // MNUtil
    this.toolbar = true
    this.dynamic = false
    this.engine = "Bilibili"
    if (!(this.engine in this.entries)) {
      this.engine = this.entrieNames[0]
    }
    // if (!(this.engine in this.entries)) {
    //   this.engine = this.entrieNames[0]
    // }
    this.searchOrder         = [2,1,3];
    if (!this.searchOrder || !this.searchOrder.length) {
      this.searchOrder = [2,1,3]
    }
  }
  static get baseURL(){
    return this.getConfig("baseURL")
  }
  static set baseURL(url){
    this.config.baseURL = url
    this.save("MNVideoPlayer_config",true)
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
    switch (key) {
      case "MNVideoPlayer_config":
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.config,"MNVideoPlayer_config")
        this.config.modifiedTime = Date.now()
        // if (!ignoreExport && this.autoExport(true)) {
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
    let config = {
      config:this.config,
      entries:this.entries,
      entrieNames:this.entrieNames,
      webAppEntries:this.webAppEntries,
      webAppEntrieNames:this.webAppEntrieNames,
      searchOrder:this.searchOrder,
      dynamic:this.dynamic,
      engine:this.engine,
      toolbar:this.toolbar
    }
    return config
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
    if (!config) {
      return false
    }
    let isVaild = ("config" in config && "entries" in config && "entrieNames" in config && "webAppEntries" in config && "webAppEntrieNames" in config && "searchOrder" in config && "dynamic" in config && "engine" in config && "toolbar" in config)
    return isVaild
  }
  /**
   * 
   * @param {object} newConfig 
   * @returns {boolean}
   */
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
      this.entries = newConfig.entries
      this.entrieNames = newConfig.entrieNames
      this.webAppEntries = newConfig.webAppEntries
      this.webAppEntrieNames = newConfig.webAppEntrieNames
      this.searchOrder = newConfig.searchOrder
      this.dynamic = newConfig.dynamic
      this.engine = newConfig.engine
      this.toolbar = newConfig.toolbar
      this.saveAfterImport()
      this.setSyncStatus(false,true)
      return true
    }else{
      this.setSyncStatus(false)
      return false
    }
  }
  /**
   * 
   * @param {boolean} checkSubscribe 
   * @returns {boolean}
   */
  static autoImport(checkSubscribe = false){
    if (checkSubscribe && !videoPlayerUtils.checkSubscribe(false,false,true)) {
      return false
    }
    return this.getConfig("autoImport")
  }
  /**
   * 
   * @param {boolean} checkSubscribe 
   * @returns {boolean}
   */
  static autoExport(checkSubscribe = false){
    if (checkSubscribe && !videoPlayerUtils.checkSubscribe(false,false,true)) {
      return false
    }
    return this.getConfig("autoExport")
  }
  static getConfig(key){
    if (this.config[key] !== undefined) {
      return this.config[key]
    }else{
      return this.defaultConfig[key]
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
    videoPlayerUtils.addErrorLog(error, "setSyncStatus")
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
  static getLocalLatestTime(){
    let lastSyncTime = this.config.lastSyncTime ?? 0
    let modifiedTime = this.config.modifiedTime ?? 0
    return Math.max(lastSyncTime,modifiedTime)
  }
  static async import(alert = true,force = false){
    let syncSource = this.getConfig("syncSource")
    if (syncSource === "None") {
      return false
    }
    if (!videoPlayerUtils.checkSubscribe(true)) {
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
        MNUtil.showHUD("Invalid config in note!")
        return false
      }
    }
    // MNUtil.showHUD("Importing123...")

    if (!config || videoPlayerConfig.isSameConfigWithLocal(config,alert)) {
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
          confirm = await MNUtil.confirm("MN Video Player\nOlder config from iCloud!\niCloud配置较旧！",OverWriteOption)
          break;
        case "MNNote":
          confirm = await MNUtil.confirm("MN Video Player\nOlder config from note!\n卡片配置较旧！",OverWriteOption)
          break;
        case "CFR2":
          confirm = await MNUtil.confirm("MN Video Player\nOlder config from R2!\nR2配置较旧！",OverWriteOption)
          break;
        case "Infi":
          confirm = await MNUtil.confirm("MN Video Player\nOlder config from InfiniCloud!\nInfiniCloud配置较旧！","Overwrite local config?\n是否覆盖本地配置？")
          break;
        case "Webdav":
          confirm = await MNUtil.confirm("MN Video Player\nOlder config from Webdav!\nWebdav配置较旧！","Overwrite local config?\n是否覆盖本地配置？")
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
    
    let syncSource = this.getConfig("syncSource")
    if (syncSource === "None") {
      return false
    }
    if (!videoPlayerUtils.checkSubscribe(true)) {
      return false
    }
    if (this.onSync) {
      MNUtil.showHUD("onSync")
      return
    }
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
              confirm = await MNUtil.confirm("MN Video Player\nNewer config from note!\n卡片配置较新！","Overwrite?\n是否覆盖？")
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
          await videoPlayerConfig.uploadConfigWithEncryptionFromR2(this.config.r2file, this.config.r2password, alert)
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
          await videoPlayerConfig.uploadConfigWithEncryptionToInfi(this.config.InfiFile, this.config.InfiPassword, alert)
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
          let res = await videoPlayerConfig.uploadConfigToWebdav(this.config.webdavFile+".json", authorization)
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
            confirm = await MNUtil.confirm("MN Video Player\nNewer config from note!\n卡片配置较新！","Overwrite?\n是否覆盖？")
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
            let confirm = await MNUtil.confirm("MN Video Player\nNewer config from R2!\nR2配置较新！","Overwrite remote config?\n是否覆盖远程配置？")
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
        await videoPlayerConfig.uploadConfigWithEncryptionFromR2(this.config.r2file, this.config.r2password, alert)
        // MNUtil.copyJSON(this.config)
        this.setSyncStatus(false,true)
        return true
      case "Infi":
        this.setSyncStatus(true)
        if (remoteConfig && remoteConfig.config && remoteConfig.config.modifiedTime > this.config.modifiedTime) {
          if (alert) {
            let confirm = await MNUtil.confirm("MN Video Player\nNewer config from InfiniCloud!\nInfiniCloud配置较新！","Overwrite remote config?\n是否覆盖远程配置？")
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
        await videoPlayerConfig.uploadConfigWithEncryptionToInfi(this.config.InfiFile, this.config.InfiPassword, alert)
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
            let confirm = await MNUtil.confirm("MN Video Player\nNewer config from Webdav!\nWebdav配置较新！","Overwrite remote config?\n是否覆盖远程配置？")
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
        let res = await videoPlayerConfig.uploadConfigToWebdav(this.config.webdavFile+".json", authorization)
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
    videoPlayerUtils.addErrorLog(error, "export")
  }
    // MNUtil.copyJSON(config)
  }
 static getWebAppEntriesWithIcon(){
  let webapp = JSON.parse(JSON.stringify(this.webAppEntries))
  let webappWithIcon = {}
  Object.keys(webapp).map(item=>{
    let entry = webapp[item]
    if (!entry.icon){//如果icon为空，则从link中提取域名
      let url = MNUtil.genNSURL(entry.link)
      let host = url.host
      let icon = videoPlayerUtils.cdn[host]
      if (icon) {
        entry.icon = icon
      }
    }
    webappWithIcon[item] = entry
    return entry
  })
  return webappWithIcon
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
      focusNote.noteTitle = "MN Video Player Config"
      focusNote.excerptTextMarkdown = true
    })
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
}
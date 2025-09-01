/**
 * WebDAV API 封装类
 * 提供完整的 WebDAV 文件操作功能
 */
class WebDAV {
    constructor(config = {},delegate) {
        this.baseUrl = config.url || '';
        this.baseUrl = this.baseUrl.replace(/\/$/, ''); // 移除末尾的斜杠
        let url = NSURL.URLWithString(this.baseUrl);
        // let tem = MNUtil.parseURL(this.baseUrl)
        // MNUtil.log({message:"Parsed URL",detail:tem})
        this.host = "https://"+url.host;
        if (url.port) {
          this.host = this.host+":"+url.port
        }
        this.path = url.path;
        this.username = config.username || '';
        this.password = config.password || '';
        this.id = config.id || config.sourceId || ""
        if (delegate) {
          this.delegate = delegate
        }
        this.isConnected = false;
        this.currentPath = '/';
        this.demoMode = true;
        this.mockData = this.createMockData();
    }
    static new(config = {},delegate){
      if (!config.url) {
        MNUtil.showHUD("未提供有效地址")
        webdavUtil.addErrorLog("未提供有效地址", "Webdav.new",config)
        return undefined
      }
      if (!config.username) {
        MNUtil.showHUD("未提供用户名")
        webdavUtil.addErrorLog("未提供用户名", "Webdav.new",config)
        return undefined
      }
      if (!config.password) {
        MNUtil.showHUD("未提供密码")
        webdavUtil.addErrorLog("未提供密码", "Webdav.new",config)
        return undefined
      }
      return new WebDAV(config,delegate)
    }
static btoa(str) {
    // Encode the string to a WordArray
    const wordArray = CryptoJS.enc.Utf8.parse(str);
    // Convert the WordArray to Base64
    const base64 = CryptoJS.enc.Base64.stringify(wordArray);
    return base64;
}

static async listWebDAVFile(url, username, password,depth = "1") {
    try {
    const headers = {
      Authorization:'Basic ' + WebDAV.btoa(username + ':' + password),
      "Cache-Control": "no-cache",
      "Depth": depth,
      "Content-Type": "application/xml; charset=utf-8"
      };
      // MNUtil.copy(headers)
      // MNUtil.showHUD("listWebDAVFile")
        const response = await WebDAV.fetch(url, {
            method: 'PROPFIND',
            headers: headers
        });
        if (response.ok) {
          let text = MNUtil.data2string(response.data)
          return text
        }else{
          if (response.error) {
            MNUtil.showHUD(response.error)
          }
          return response
        }
    } catch (error) {
      webdavUtil.addErrorLog(error, "readWebDAVFile")
      return response
    }
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
        /**
         * 
         * @param {*} res 
         * @param {NSMutableData} data 
         * @param {*} err 
         * @returns 
         */
        (res, data, err) => {
        try {
        let response = {}
        if (MNUtil.isNSNull(res)) {
          if (err.localizedDescription){
            response = {error:err.localizedDescription,ok:false}
            resolve(response)
            return
          }
          resolve({error:"Response is null",ok:false})
          return
        }
        response.status = res.statusCode()
        response.ok = (response.status >= 200 && response.status < 300)

        let dataLength = data.length()
        if (dataLength) {
          const result = NSJSONSerialization.JSONObjectWithDataOptions(
            data,
            1<<0
          )
          const validJson = result && NSJSONSerialization.isValidJSONObject(result)
          if (validJson) {
            response.data = result
          }else{
            response.data = data
          }
          if (err.localizedDescription){
            MNUtil.showHUD(err.localizedDescription)
            response.error = err.localizedDescription
          }
          resolve(response)

        }else{
          if (err.localizedDescription){
            MNUtil.showHUD(err.localizedDescription)
            response.error = err.localizedDescription
          }
          resolve(response)
        }

        } catch (error) {
        // MNUtil.addErrorLog(error, "sendRequest")
          resolve({error: error.localizedDescription || "Unknown error", ok: false})
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
    // MNUtil.copy(options)

    const request = MNConnection.initRequest(url, options)
    const res = await WebDAV.sendRequest(request)
    return res
      
    } catch (error) {
      webdavUtil.addErrorLog(error, "fetch")
      return undefined
    }
  }
static async deleteWebDAVFile(url, username, password) {
    try {
      const headers = {
        Authorization:'Basic ' + WebDAV.btoa(username + ':' + password)
      };
        const response = await WebDAV.fetch(url, {
            method: 'DELETE',
            headers: headers
        });
        return response.ok
    } catch (error) {
      webdavUtil.addErrorLog(error, "deleteWebDAVFile")
      return response
    }
}

static async createWebDAVDirectory(url, username, password) {
    try {
      const headers = {
        Authorization:'Basic ' + WebDAV.btoa(username + ':' + password)
      };
        const response = await WebDAV.fetch(url, {
            method: 'MKCOL',
            headers: headers
        });
        return response.ok
    } catch (error) {
      webdavUtil.addErrorLog(error, "createWebDAVDirectory")
      return response
    }
}

static async moveWebDAVFile(url, username, password, destURL) {
    try {
      const headers = {
        Authorization:'Basic ' + WebDAV.btoa(username + ':' + password),
        Destination: encodeURI(destURL)
      };
      // MNUtil.log({message:"headers",detail:headers})
      // MNUtil.log({url:url,username:username,password:password,destURL:destURL})
      // return true
        const response = await WebDAV.fetch(url, {
            method: 'MOVE',
            headers: headers
        });
        return response.ok
    } catch (error) {
      webdavUtil.addErrorLog(error, "moveWebDAVFile")
      return response
    }
}

static async readImage(url, username, password) {
    const headers = {
      Authorization:'Basic ' + WebDAV.btoa(username + ':' + password),
      "Cache-Control": "no-cache"
      };
        const response = await MNConnection.fetch(url, {
            method: 'GET',
            headers: headers
        });
    try {
        if (response instanceof NSMutableData) {
          // 如果是 NSMutableData 类型，直接返回
          return response;
        }
        let text = MNUtil.data2string(response)
        return text
    } catch (error) {
      webdavUtil.addErrorLog(error, "readImage")
      return response
    }
}

static async readWebDAVFile(url, username, password) {
    const headers = {
      Authorization:'Basic ' + WebDAV.btoa(username + ':' + password),
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
        // MNUtil.showHUD(response)
        if (response instanceof NSMutableData) {
          // 如果是 NSMutableData 类型，直接返回
          return response;
        }
        // return {res:response.base64Encoding(),type:typeof response}
        if (!response.base64Encoding()) {
          return response
        }
        let text = MNUtil.data2string(response)
        return text
        // MNUtil.copy(text)

        // if (!response.ok) {
        //     throw new Error('Network response was not ok: ' + response.statusText);
        // }

        // const text = await response.text();
        // return text;
    } catch (error) {
      webdavUtil.addErrorLog(error, "readWebDAVFile")
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
        let text = MNUtil.data2string(response)
        return text
    } catch (error) {
      MNUtil.showHUD(error)
    }
}

    /**
     * 连接到 WebDAV 服务器
     * @param {string} url - 服务器地址
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<boolean>} 连接是否成功
     */
    async connect(url, username, password) {
        this.baseUrl = url.replace(/\/$/, ''); // 移除末尾的斜杠
        this.username = username;
        this.password = password;

        try {
            // 测试连接
            const response = await this.makeRequest('PROPFIND', '/', {
                'Depth': '0'
            });
            
            this.isConnected = response.ok;
            return this.isConnected;
        } catch (error) {
            console.error('连接失败:', error);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * 断开连接
     */
    disconnect() {
        this.baseUrl = '';
        this.username = '';
        this.password = '';
        this.isConnected = false;
        this.currentPath = '/';
    }

    /**
     * 创建模拟数据
     */
    createMockData() {
        return {
            '/': [
                {
                    name: '文档',
                    path: '/文档/',
                    isDirectory: true,
                    size: 0,
                    lastModified: new Date('2024-01-15'),
                    contentType: '',
                    icon: 'fas fa-folder folder'
                },
                {
                    name: '图片',
                    path: '/图片/',
                    isDirectory: true,
                    size: 0,
                    lastModified: new Date('2024-01-10'),
                    contentType: '',
                    icon: 'fas fa-folder folder'
                },
                {
                    name: '视频',
                    path: '/视频/',
                    isDirectory: true,
                    size: 0,
                    lastModified: new Date('2024-01-08'),
                    contentType: '',
                    icon: 'fas fa-folder folder'
                },
                {
                    name: 'README.txt',
                    path: '/README.txt',
                    isDirectory: false,
                    size: 1024,
                    lastModified: new Date('2024-01-20'),
                    contentType: 'text/plain',
                    icon: 'fas fa-file-alt document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: 'demo.pdf',
                    path: '/demo.pdf',
                    isDirectory: false,
                    size: 2048576,
                    lastModified: new Date('2024-01-18'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                }
            ],
            '/文档/': [
                {
                    name: '工作报告.docx',
                    path: '/文档/工作报告.docx',
                    isDirectory: false,
                    size: 512000,
                    lastModified: new Date('2024-01-15'),
                    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    icon: 'fas fa-file-word document'
                },
                {
                    name: '预算表.xlsx',
                    path: '/文档/预算表.xlsx',
                    isDirectory: false,
                    size: 256000,
                    lastModified: new Date('2024-01-12'),
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    icon: 'fas fa-file-excel document'
                },
                {
                    name: '项目资料',
                    path: '/文档/项目资料/',
                    isDirectory: true,
                    size: 0,
                    lastModified: new Date('2024-01-10'),
                    contentType: '',
                    icon: 'fas fa-folder folder'
                }
            ],
            '/图片/': [
                {
                    name: '风景.jpg',
                    path: '/图片/风景.jpg',
                    isDirectory: false,
                    size: 3145728,
                    lastModified: new Date('2024-01-10'),
                    contentType: 'image/jpeg',
                    icon: 'fas fa-file-image image'
                },
                {
                    name: '头像.png',
                    path: '/图片/头像.png',
                    isDirectory: false,
                    size: 1048576,
                    lastModified: new Date('2024-01-09'),
                    contentType: 'image/png',
                    icon: 'fas fa-file-image image'
                },
                {
                    name: '截图.webp',
                    path: '/图片/截图.webp',
                    isDirectory: false,
                    size: 524288,
                    lastModified: new Date('2024-01-08'),
                    contentType: 'image/webp',
                    icon: 'fas fa-file-image image'
                }
            ],
            '/视频/': [
                {
                    name: '演示视频.mp4',
                    path: '/视频/演示视频.mp4',
                    isDirectory: false,
                    size: 104857600,
                    lastModified: new Date('2024-01-08'),
                    contentType: 'video/mp4',
                    icon: 'fas fa-file-video video'
                },
                {
                    name: '教程',
                    path: '/视频/教程/',
                    isDirectory: true,
                    size: 0,
                    lastModified: new Date('2024-01-05'),
                    contentType: '',
                    icon: 'fas fa-folder folder'
                }
            ],
            '/文档/项目资料/': [
                {
                    name: '需求文档.pdf',
                    path: '/文档/项目资料/需求文档.pdf',
                    isDirectory: false,
                    size: 1572864,
                    lastModified: new Date('2024-01-10'),
                    contentType: 'application/pdf',
                    icon: 'fas fa-file-pdf document'
                },
                {
                    name: '技术方案.md',
                    path: '/文档/项目资料/技术方案.md',
                    isDirectory: false,
                    size: 8192,
                    lastModified: new Date('2024-01-09'),
                    contentType: 'text/markdown',
                    icon: 'fas fa-file-alt document'
                }
            ],
            '/视频/教程/': [
                {
                    name: '入门教程.mp4',
                    path: '/视频/教程/入门教程.mp4',
                    isDirectory: false,
                    size: 52428800,
                    lastModified: new Date('2024-01-05'),
                    contentType: 'video/mp4',
                    icon: 'fas fa-file-video video'
                },
                {
                    name: '高级教程.mp4',
                    path: '/视频/教程/高级教程.mp4',
                    isDirectory: false,
                    size: 73400320,
                    lastModified: new Date('2024-01-03'),
                    contentType: 'video/mp4',
                    icon: 'fas fa-file-video video'
                }
            ]
        };
    }

    /**
     * 获取目录列表
     * @param {string} path - 目录路径
     * @returns {Promise<Array>} 文件和目录列表
     */
    async listDirectory(path = '/',depth = '1') {
      try {
        // MNUtil.showHUD("listDirectory")
        let url = (path === "/")?this.baseUrl:(this.host+path);
        let username = this.username
        let password = this.password
        // MNUtil.copy(url)
        if (!url.endsWith("/")) {
          url = url+"/"
        }
        let res = await WebDAV.listWebDAVFile(url, username, password,depth)
        return res
      } catch (error) {
        webdavUtil.addErrorLog(error, "listDirectory")
        return undefined
      }
    }
    async previewFile(config){
      try {
        // MNUtil.showHUD("previewFile:"+config.name)
        // MNUtil.log("previewFile:"+config.name)

        let webdavFolder = MNUtil.documentFolder+"/Webdav"
        let filePath = webdavFolder+"/"+config.name
        if (config.name.endsWith(".pdf")){
          let md5 = MNUtil.importDocument(filePath)
          if (typeof snipasteUtils !== "undefined") {
            MNUtil.postNotification("snipastePDF", {docMd5:md5,currPageNo:1})
          }else{
            let confirm = await MNUtil.confirm("MN Webdav", "Open document?\n\n文档已存在,是否直接打开该文档？\n\n"+config.name)
            if (confirm) {
              MNUtil.openDoc(md5,MNUtil.currentNotebookId)
              if (MNUtil.docMapSplitMode === 0) {
                MNUtil.studyController.docMapSplitMode = 1
              }
            }
          }
          return
        }
        if (filePath.endsWith(".png") || filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
          if (typeof snipasteUtils !== "undefined") {
            let imageData = MNUtil.getFile(filePath)
            MNUtil.postNotification("snipasteImage", {imageData:imageData})
          }else{
            MNUtil.showHUD("未安装 MN Snipaste插件，无法预览图片")
          }
          return
        }
        if (filePath.endsWith(".html")) {
          if (typeof snipasteUtils !== "undefined") {
            let text = MNUtil.readText(filePath)
            MNUtil.postNotification("snipasteHtml", {html:text,force:true})
          }else{
            MNUtil.showHUD("未安装 MN Snipaste插件，无法预览HTML")
          }
          return
        }
        if (filePath.endsWith(".md") || filePath.endsWith(".txt")) {
          if (typeof snipasteUtils !== "undefined") {
          let text = MNUtil.readText(filePath)
          let html = `
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://vip.123pan.cn/1836303614/dl/cdn/mermaid.js" defer></script>
  </head>

  <body>
${MNUtil.md2html(text)}
  <script>
      MathJax = {
          tex: {
              inlineMath: [ ['$','$'], ["\\(","\\)"] ]
          }
      };
/**
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
    function replaceLtInLatexBlocks(markdown) {
        return markdown.replace(/\\$\\$(.*?)\\$\\$/gs, (match, latexContent) => {
            return '$$' + latexContent.replace(/</g, '\\\\lt') + '$$';
        });
    }
     async function validateMermaid(content,i=0){
      try {
        let res = await mermaid.render('mermaid-graph'+i, content)
        return {valid:true,svg:res.svg}
      } catch (error) {

        // notyf.error(error.message)
        return {valid:false,error:error.message}
      }
    }
    async function renderMermaindOneChart(container,i) {
      container.id = "mermaid-container-"+i
      let content = replaceLtInLatexBlocks(container.textContent)
          // content = content.replace(/</g, "\\lt")
          let res = await validateMermaid(content,i)
          if (!res.valid) {
            if(res.error.includes("KaTeX parse error")) {
              console.log(res.error)
            }
            // document.getElementById('mermaid-container').innerHTML = res.error.message
            // postMessageToAddon("snipaste", "mermaid",undefined, {action: "endRendering",content:content})
            return
          }
          
          
            container.innerHTML = res.svg;
    }
      async function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
        
      }
        async function renderMermaid(){
        try {
          const containers = document.getElementsByClassName("language-mermaid");
          for (let i = 0; i < containers.length; i++) {
            await renderMermaindOneChart(containers[i],i)
          }
        } catch (error) {
          console.log(error);
          
            // postMessageToAddon("snipaste", "mermaid",undefined, {action: "endRendering",content:content})
        }
        }
      // 监听 DOMContentLoaded 事件
      document.addEventListener('DOMContentLoaded', async function () {
        // notyf = new Notyf({position: {x: 'center', y: 'top'}, duration: 1000,ripple:false});
        mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict'
        });
        renderMermaid()

      })
  </script>
  <script id="MathJax-script" async src="https://vip.123pan.cn/1836303614/dl/cdn/es5/tex-svg-full.js"></script>
  </body>
  </html>`
            MNUtil.postNotification("snipasteHtml", {html:html,force:true})
          }else if (typeof editorUtils !== "undefined") {
            let text = MNUtil.readText(filePath)
            MNUtil.postNotification("openInEditor", {content:text})
          }else{
            MNUtil.showHUD("未安装 MN Snipaste 或 MN Editor插件，无法预览Markdown")
          }
          
          return
          
        }
        
      } catch (error) {
        webdavUtil.addErrorLog(error, "previewFile")
      }
    
    }
    checkFileExistForPreview(config){
      let webdavFolder = MNUtil.documentFolder+"/Webdav"
      let filePath = webdavFolder+"/"+config.name
      if (MNUtil.isfileExists(filePath)) {
        let webdavFileSize = config.size
        let localFileSize = MNUtil.getFile(filePath).length()
        return (webdavFileSize === localFileSize)
      }
      return false
    }
    initWebdavDownloadRequest(config){
      let url = this.host+config.path
      let username = this.username
      let password = this.password
      const headers = {
        Authorization:'Basic ' + WebDAV.btoa(username + ':' + password),
        "Cache-Control": "no-cache"
      };
      const request = MNConnection.initRequest(url, {
          method: 'GET',
          headers: headers
      })
      return request
    }
    async downloadFromConfig(config){
    try {
      // if(!config.name.endsWith(".pdf")){
      //   MNUtil.confirm("MN Webdav", "当前只支持下载PDF文档")
      //   return
      // }
      if (typeof config.size === 'string') {
        config.size = parseInt(config.size); // 确保 size 是数字类型
      }
      let sizeMB = config.size/1024/1024
      // if (sizeMB > 500) {
      //   let confirm = await MNUtil.confirm("MN Webdav", `Download file?\n\n文件大小超过500MB，是否继续下载？\n\n${config.name}`)
      //   if (!confirm) {
      //     return
      //   }
      // }
      if (this.checkFileExistForPreview(config)) {
        this.previewFile(config)
        // if (config.name.endsWith(".pdf")){
        //   let md5 = MNUtil.importDocument(filePath)
        //   MNUtil.postNotification("snipastePDF", {docMd5:md5,currPageNo:1})
        //   // let confirm = await MNUtil.confirm("MN Webdav", "Open document?\n\n文档已存在,是否直接打开该文档？\n\n"+config.name)
        //   // if (confirm) {
        //   //   let md5 = MNUtil.importDocument(filePath)
        //   //   // MNUtil.copy(MNUtil.currentNotebookId)
        //   //   MNUtil.openDoc(md5,MNUtil.currentNotebookId)
        //   //   if (MNUtil.docMapSplitMode === 0) {
        //   //     MNUtil.studyController.docMapSplitMode = 1
        //   //   }
        //   // }
        //   return
        // }
        // if (filePath.endsWith(".png") || filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
        //   let imageData = MNUtil.getFile(filePath)
        //   MNUtil.postNotification("snipasteImage", {imageData:imageData})
        //   return
        // }
        return
      }
      if (config.name.endsWith(".mnaddon")) {
        let confirm = await MNUtil.confirm("MN Webdav", "是否下载并安装该插件？\n\n"+config.name+"\n\n文件大小: "+sizeMB.toFixed(2)+"MB")
        if (confirm) {
          // MNUtil.showHUD("Downloading...")
          let request = this.initWebdavDownloadRequest(config)
          this.delegate.onDownloading = true
          let connection = NSURLConnection.connectionWithRequestDelegate(request, this.delegate)
          connection.fileName = config.name
          this.delegate.fileName = config.name
          this.delegate.addonPath = webdavUtil.mainPath+"/"+config.name
          return
        }
        return
      }
      if (config.name.endsWith(".marginnotes") || config.name.endsWith(".marginpkg")) {
        // MNUtil.copy(config)
        let confirm = await MNUtil.confirm("MN Webdav", "是否下载该备份？\n\n"+config.name+"\n\n文件大小: "+sizeMB.toFixed(2)+"MB")
        if (confirm) {
          // MNUtil.showHUD("Downloading...")
          let request = this.initWebdavDownloadRequest(config)
          this.delegate.onDownloading = true
          let connection = NSURLConnection.connectionWithRequestDelegate(request, this.delegate)
          connection.fileName = config.name
          this.delegate.fileName = config.name
          return
        }
        return
      }
      let officeExtensions = [".docx",".doc",".pptx",".ppt",".xlsx",".xls"]
      if (officeExtensions.some(ext => config.name.endsWith(ext))) {
        let confirm = await MNUtil.confirm("MN Webdav", "是否下载该Office文件并转换为PDF？\n\n"+config.name+"\n\n文件大小: "+sizeMB.toFixed(2)+"MB")
        if (!confirm) {
          return
        }
      }
      let request = this.initWebdavDownloadRequest(config)
      // let url = this.host+config.path
      // let username = this.username
      // let password = this.password
      // const headers = {
      //   Authorization:'Basic ' + WebDAV.btoa(username + ':' + password),
      //   "Cache-Control": "no-cache"
      // };
      // const request = MNConnection.initRequest(url, {
      //     method: 'GET',
      //     headers: headers
      // })b
      this.delegate.onDownloading = true
      let connection = NSURLConnection.connectionWithRequestDelegate(request, this.delegate)
      connection.fileName = config.name
      this.delegate.fileName = config.name
      
    } catch (error) {
      webdavUtil.addErrorLog(error, "downloadFromConfig")
    }
    }
    getWebdavConfig(folder,name){
      let url = (folder === "/")?this.baseUrl:(this.host+folder);
      url = url.replace(/\/$/, '')+"/"+name
      let config = {
        Authorization:'Basic ' + WebDAV.btoa(this.username + ':' + this.password),
        url:url
      }
      return config
    }
    async uploadFromConfig(config,pdfData){
    try {

      // let webdavFolder = MNUtil.documentFolder+"/Webdav"
      let url = (config.path === "/")?this.baseUrl:(this.host+config.path);
      url = url.replace(/\/$/, '')+"/"+config.name
      let username = this.username
      let password = this.password
      const headers = {
        Authorization:'Basic ' + WebDAV.btoa(username + ':' + password),
        "Cache-Control": "no-cache",
        'Content-Type': "application/pdf"
      };
      let body = NSMutableData.new()
      body.appendData(pdfData)
      const request = MNConnection.initRequest(url, {
          method: 'PUT',
          headers: headers,
          timeout: 3600
      })
      request.setHTTPBody(body)
      MNUtil.waitHUD("Uploading...")
      this.delegate.fileName = undefined
      this.delegate.onUploading = true
      let connection = NSURLConnection.connectionWithRequestDelegate(request, this.delegate)
      // connection.fileName = config.name
      // this.delegate.fileName = config.name
      
    } catch (error) {
      webdavUtil.addErrorLog(error, "uploadFromConfig")
    }
    }
    /**
     * 上传文件
     * @param {File} file - 要上传的文件
     * @param {string} path - 上传路径
     * @param {Function} onProgress - 进度回调函数
     * @returns {Promise<boolean>} 上传是否成功
     */
    async uploadFile(file, path, onProgress = null) {
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }

        if (this.demoMode) {
            // 演示模式：模拟上传进度
            if (onProgress) {
                for (let i = 0; i <= 100; i += 10) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    onProgress(i);
                }
            }
            return true; // 模拟上传成功
        }

        const fullPath = this.joinPath(path, file.name);

        try {
            const response = await this.makeRequestWithProgress('PUT', fullPath, {
                'Content-Type': file.type || 'application/octet-stream'
            }, file, onProgress);

            return response.ok;
        } catch (error) {
            console.error('上传文件失败:', error);
            throw error;
        }
    }

    /**
     * 下载文件
     * @param {string} filePath - 文件路径
     * @returns {Promise<Blob>} 文件内容
     */
    async downloadFile(filePath) {
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }

        if (this.demoMode) {
            // 演示模式：创建虚拟文件内容
            await new Promise(resolve => setTimeout(resolve, 500));
            const fileName = filePath.split('/').pop() || 'file';
            const content = `这是演示文件: ${fileName}\n创建时间: ${new Date().toLocaleString()}\n\n这是模拟的文件内容，用于演示下载功能。`;
            return new Blob([content], { type: 'text/plain' });
        }

        try {
            const response = await this.makeRequest('GET', filePath);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.blob();
        } catch (error) {
            console.error('下载文件失败:', error);
            throw error;
        }
    }


    /**
     * 删除文件或目录
     * @param {string} path - 文件或目录路径
     * @returns {Promise<boolean>} 删除是否成功
     */
    async deleteItem(path) {
      try {
        // MNUtil.showHUD("listDirectory")
        let url = (path === "/")?this.baseUrl:(this.host+path);
        url = url.replace(/\/$/,'')
        let username = this.username
        let password = this.password
        // MNUtil.copy(url)
        let res = await WebDAV.deleteWebDAVFile(url, username, password)
        if (res) {
          return true
        }
        return false
      } catch (error) {
        webdavUtil.addErrorLog(error, "deleteItem")
        return undefined
      }
    }

    /**
     * 创建目录
     * @param {string} path - 目录路径
     * @returns {Promise<boolean>} 创建是否成功
     */
    async createDirectory(path) {
      try {
        // MNUtil.showHUD("listDirectory")
        let url = (path === "/")?this.baseUrl:(this.host+path);
        url = url.replace(/\/$/,'')
        let username = this.username
        let password = this.password
        // MNUtil.copy(url)
        let res = await WebDAV.createWebDAVDirectory(url, username, password)
        if (res) {
          return true
        }
        return false
      } catch (error) {
        webdavUtil.addErrorLog(error, "createDirectory")
        return undefined
      }
    }

    /**
     * 重命名文件或目录
     * @param {object} config
     * @returns {Promise<boolean>} 移动是否成功
     */
    async renameItem(config) {
      try {
        let params = config.params
        if (params.isDirectory) {
          let newName = await MNUtil.input("MN Webdav", "New folder name\n请输入文件夹新名称\n\n"+params.name, undefined, {default: params.name})
          switch (newName.button) {
            case 0:
              return false
            case 1:
              let name = newName.input
              let endsWithSlash = params.path.endsWith("/")
              let folder = params.path.replace(/\/$/,"").split("/").slice(0,-1).join("/")
              
              let destPath = folder+"/"+name
              if (endsWithSlash) {
                destPath = destPath+"/"
              }
              
              let sourcePath = params.path
              let res = await this.moveItem(sourcePath, destPath)
              if (res) {
                return true
              }
              break;
            default:
              break;
          }
          return false
        }

        let newName = await MNUtil.input("MN Webdav", "New file name\n请输入文件新名称\n\n"+params.name, undefined, {default: params.name})
          // MNUtil.log(newName)
          switch (newName.button) {
            case 0:
              return false
            case 1:
              let name = newName.input
              let folder = params.path.replace(params.name,"")
              let destPath = folder+name
              let fileExt = params.name.split(".").pop()
              if (fileExt && !name.endsWith("."+fileExt)) {
                destPath = destPath+"."+fileExt
              }
              let sourcePath = params.path
              let res = await this.moveItem(sourcePath, destPath)
              if (res) {
                return true
              }
              break;
            default:
              break;
          }

        return false
      } catch (error) {
        webdavUtil.addErrorLog(error, "WebDAV.renameItem")
        return false
      }

    }
    /**
     * 移动/重命名文件或目录
     * @param {string} sourcePath - 源路径
     * @param {string} destPath - 目标路径
     * @returns {Promise<boolean>} 移动是否成功
     */
    async moveItem(sourcePath, destPath) {
      try {

        // if (!this.isConnected) {
        //     throw new Error('未连接到服务器');
        // }
        MNUtil.log("moveItem:"+sourcePath+":"+destPath)
        if (sourcePath === destPath) {
          return false
        }
        let sourceURL = (sourcePath === "/")?this.baseUrl:(this.host+sourcePath);
        let destURL = (sourcePath === "/")?this.baseUrl:(this.host+destPath);
        let res = await WebDAV.moveWebDAVFile(sourceURL, this.username, this.password, destURL)
        if (res) {
          return true
        }
        return false
      } catch (error) {
        webdavUtil.addErrorLog(error, "WebDAV.moveItem")
        return false
      }

    }

    /**
     * 复制文件或目录
     * @param {string} sourcePath - 源路径
     * @param {string} destPath - 目标路径
     * @returns {Promise<boolean>} 复制是否成功
     */
    async copyItem(sourcePath, destPath) {
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }

        try {
            const response = await this.makeRequest('COPY', sourcePath, {
                'Destination': this.baseUrl + destPath
            });
            return response.ok;
        } catch (error) {
            console.error('复制失败:', error);
            throw error;
        }
    }

    /**
     * 发送 HTTP 请求
     * @param {string} method - HTTP 方法
     * @param {string} path - 请求路径
     * @param {Object} headers - 请求头
     * @param {any} body - 请求体
     * @returns {Promise<Response>} HTTP 响应
     */
    async makeRequest(method, path, headers = {}, body = null) {
        const url = this.baseUrl + this.encodePath(path);
        
        const requestHeaders = {
            'Authorization': 'Basic ' + btoa(this.username + ':' + this.password),
            ...headers
        };

        const options = {
            method,
            headers: requestHeaders,
            body
        };

        return await fetch(url, options);
    }

    /**
     * 发送带进度的 HTTP 请求（用于文件上传）
     * @param {string} method - HTTP 方法
     * @param {string} path - 请求路径
     * @param {Object} headers - 请求头
     * @param {any} body - 请求体
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Response>} HTTP 响应
     */
    async makeRequestWithProgress(method, path, headers = {}, body = null, onProgress = null) {
        const url = this.baseUrl + this.encodePath(path);
        
        const requestHeaders = {
            'Authorization': 'Basic ' + btoa(this.username + ':' + this.password),
            ...headers
        };

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    onProgress(percentComplete);
                }
            });

            xhr.addEventListener('load', () => {
                resolve({
                    ok: xhr.status >= 200 && xhr.status < 300,
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            });

            xhr.addEventListener('error', () => {
                reject(new Error('网络错误'));
            });

            xhr.open(method, url);
            
            for (const [key, value] of Object.entries(requestHeaders)) {
                xhr.setRequestHeader(key, value);
            }

            xhr.send(body);
        });
    }

    /**
     * 生成 PROPFIND XML 请求体
     * @returns {string} XML 字符串
     */
    getPropfindXML() {
        return `<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:">
    <D:prop>
        <D:displayname/>
        <D:getcontentlength/>
        <D:getcontenttype/>
        <D:getlastmodified/>
        <D:resourcetype/>
        <D:creationdate/>
    </D:prop>
</D:propfind>`;
    }
/**
 * 使用 fast-xml-parser 解析目录列表 XML 响应
 * @param {string} xmlText - XML 字符串
 * @param {string} basePath - 基础路径
 * @returns {Array} 文件和目录列表
 */
parseDirectoryListing(xmlText, basePath) {
    // 配置解析器以处理 WebDAV 的命名空间
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        removeNSPrefix: true // 移除 'd:' 等命名空间前缀
    };
    const parser = new XMLParser(options);
    const jsonObj = parser.parse(xmlText);

    // 响应通常在 multistatus.response 中
    let responses = jsonObj.multistatus && jsonObj.multistatus.response ? jsonObj.multistatus.response : [];
    
    // 如果只有一个响应，它可能不是一个数组
    if (responses && !Array.isArray(responses)) {
        responses = [responses];
    }

    const items = [];

    for (const response of responses) {
        if (!response.href || !response.propstat) continue;

        const path = decodeURIComponent(response.href);
        
        // 跳过当前目录本身
        if (path === basePath || path === basePath + '/') continue;

        const item = this.parseItemProps(path, response.propstat.prop);
        if (item) {
            items.push(item);
        }
    }

    // 按类型和名称排序（目录在前，文件在后）
    return items.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) {
            return a.isDirectory ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
}

/**
 * 解析单个项目的属性 (适配 fast-xml-parser 的输出)
 * @param {string} path - 项目路径
 * @param {Object} props - 从 fast-xml-parser 解析出的属性对象
 * @returns {Object|null} 项目信息
 */
parseItemProps(path, props) {
    if (!props) return null;

    // 检查资源类型是否为目录
    const isDirectory = props.resourcetype && props.resourcetype.hasOwnProperty('collection');

    const name = props.displayname || this.getNameFromPath(path);
    if (!name) return null;

    return {
        name: name,
        path: path,
        isDirectory: isDirectory,
        size: props.getcontentlength ? parseInt(props.getcontentlength, 10) : 0,
        lastModified: props.getlastmodified ? new Date(props.getlastmodified) : new Date(),
        contentType: props.getcontenttype || '',
        icon: this.getFileIcon(name, isDirectory)
    };
}

    /**
     * 从路径中提取文件名
     * @param {string} path - 文件路径
     * @returns {string} 文件名
     */
    getNameFromPath(path) {
        return path.split('/').filter(p => p).pop() || '';
    }

    /**
     * 获取文件图标类名
     * @param {string} filename - 文件名
     * @param {boolean} isDirectory - 是否为目录
     * @returns {string} 图标类名
     */
    getFileIcon(filename, isDirectory) {
        if (isDirectory) {
            return 'fas fa-folder folder';
        }

        const extension = filename.toLowerCase().split('.').pop();
        
        const iconMap = {
            // 图片
            'jpg': 'fas fa-file-image image',
            'jpeg': 'fas fa-file-image image',
            'png': 'fas fa-file-image image',
            'gif': 'fas fa-file-image image',
            'bmp': 'fas fa-file-image image',
            'svg': 'fas fa-file-image image',
            'webp': 'fas fa-file-image image',

            // 视频
            'mp4': 'fas fa-file-video video',
            'avi': 'fas fa-file-video video',
            'mov': 'fas fa-file-video video',
            'wmv': 'fas fa-file-video video',
            'flv': 'fas fa-file-video video',
            'webm': 'fas fa-file-video video',

            // 音频
            'mp3': 'fas fa-file-audio audio',
            'wav': 'fas fa-file-audio audio',
            'flac': 'fas fa-file-audio audio',
            'aac': 'fas fa-file-audio audio',
            'ogg': 'fas fa-file-audio audio',

            // 文档
            'pdf': 'fas fa-file-pdf document',
            'doc': 'fas fa-file-word document',
            'docx': 'fas fa-file-word document',
            'xls': 'fas fa-file-excel document',
            'xlsx': 'fas fa-file-excel document',
            'ppt': 'fas fa-file-powerpoint document',
            'pptx': 'fas fa-file-powerpoint document',
            'txt': 'fas fa-file-alt document',

            // 压缩包
            'zip': 'fas fa-file-archive archive',
            'rar': 'fas fa-file-archive archive',
            '7z': 'fas fa-file-archive archive',
            'tar': 'fas fa-file-archive archive',
            'gz': 'fas fa-file-archive archive',

            // 代码文件
            'js': 'fas fa-file-code code',
            'html': 'fas fa-file-code code',
            'css': 'fas fa-file-code code',
            'php': 'fas fa-file-code code',
            'py': 'fas fa-file-code code',
            'java': 'fas fa-file-code code',
            'cpp': 'fas fa-file-code code',
            'c': 'fas fa-file-code code',
            'json': 'fas fa-file-code code',
            'xml': 'fas fa-file-code code'
        };

        return iconMap[extension] || 'fas fa-file file';
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 格式化日期
     * @param {Date} date - 日期对象
     * @returns {string} 格式化后的日期
     */
    formatDate(date) {
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 连接路径
     * @param {string} base - 基础路径
     * @param {string} path - 相对路径
     * @returns {string} 完整路径
     */
    joinPath(base, path) {
        return (base + '/' + path).replace(/\/+/g, '/');
    }

    /**
     * 编码路径
     * @param {string} path - 原始路径
     * @returns {string} 编码后的路径
     */
    encodePath(path) {
        return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
    }

    /**
     * 获取父目录路径
     * @param {string} path - 当前路径
     * @returns {string} 父目录路径
     */
    getParentPath(path) {
        if (path === '/' || !path) return '/';
        
        const parts = path.split('/').filter(p => p);
        parts.pop();
        
        return '/' + parts.join('/');
    }

    /**
     * 标准化路径
     * @param {string} path - 原始路径
     * @returns {string} 标准化后的路径
     */
    normalizePath(path) {
        if (!path || path === '/') return '/';
        
        // 移除开头和结尾的多余斜杠
        path = path.replace(/^\/+/, '/').replace(/\/+$/, '');
        
        // 确保以斜杠结尾（除了根目录）
        if (path !== '/' && !path.endsWith('/')) {
            path += '/';
        }
        
        return path;
    }
} 

class webdavUploadManager {
  static uploadQueue = [];// 存储待上传文件路径的队列
  static uploadQueueMax = 10;
  static uploadQueueInterval = 1000;
  static addItemToUploadQueue(localMd5,remoteConfig){
    let doc = MNUtil.getDocById(localMd5)
    if (!doc || !doc.fullPathFileName) {
      MNUtil.showHUD("文件不存在")
      return
    }
    let targetConfig = {
      local:{
        path:doc.fullPathFileName,
        md5:localMd5,
        name:doc.docTitle+".pdf"
      },
      remote:{path:remoteConfig.path},
      id:localMd5
    }
    if (("name" in remoteConfig)) {
      targetConfig.remote.name = remoteConfig.name
    }else{
      targetConfig.remote.name = doc.docTitle+".pdf"
    }
    this.uploadQueue.push(targetConfig)
  }
  static removeItemFromUploadQueue(localMd5){
    if (this.uploadQueue.length > 0) {
      if (this.currentFileId() == localMd5) {
        this.uploadQueue.shift()
      }else{
        this.uploadQueue = this.uploadQueue.filter(item => item.id != localMd5)
      }
    }
  }
  static clearUploadQueue(){
    this.uploadQueue = []
  }
  static currentFileId(){
    if (this.uploadQueue.length > 0) {
      return this.uploadQueue[0].id
    }
    return undefined
  }
  static currentItem(){
    if (this.uploadQueue.length > 0) {
      return this.uploadQueue[0]
    }
    return undefined
  }
  static nextItem(preItemId){
    if (this.uploadQueue.length > 0 && this.currentItem().id == preItemId) {//确保preItemId是当前上传的文件
      this.uploadQueue.shift()
      return this.currentItem()
    }
    return undefined
  }
  /**
   * 开始上传
   * @param {*} delegate 
   * @returns {boolean} 是否成功
   */
  static startUpload(delegate){
    try {

    if (delegate) {
      this.delegate = delegate
    }
    if (this.uploadQueue.length > 0) {
      let config = this.currentItem()
      let fileData = MNUtil.getFile(config.local.path)
      if (config.id) {
        this.delegate.fileId = config.id
      }
      this.uploadPDFData(fileData,config.remote)
      return true
    }else{
      MNUtil.showHUD("上传队列已空")
      return false
    }
    } catch (error) {
      webdavUtil.addErrorLog(error, "webdavUploadManager.startUpload")
      return false
    }
  }
  /**
   * 开始上传下一个文件
   * @param {*} preItemId 
   * @returns {boolean} 是否成功
   */
  static startNextUpload(preItemId){
    try {
      this.removeItemFromUploadQueue(preItemId)
      return this.startUpload()
    } catch (error) {
      webdavUtil.addErrorLog(error, "webdavUploadManager.startNextUpload")
      return false
    }
  }
  static taskRemain(){
    return this.uploadQueue.length
  }
  static btoa(str) {
      // Encode the string to a WordArray
      const wordArray = CryptoJS.enc.Utf8.parse(str);
      // Convert the WordArray to Base64
      const base64 = CryptoJS.enc.Base64.stringify(wordArray);
      return base64;
  }
  static getAuthorization(username,password){
    return 'Basic ' + this.btoa(username + ':' + password)
  }
  static uploadPDFData(pdfData,config,delegate){
    try {
      let tem = webdavConfig.webdav.getWebdavConfig(config.path,config.name)
      const headers = {
        Authorization:tem.Authorization,
        "Cache-Control": "no-cache",
        'Content-Type': "application/pdf"
      };
      let body = NSMutableData.new()
      body.appendData(pdfData)
      const request = MNConnection.initRequest(tem.url, {
          method: 'PUT',
          headers: headers,
          timeout: 3600
      })
      request.setHTTPBody(body)
      if (delegate) {
        this.delegate = delegate
      }
      // this.delegate.waitHUD("Uploading...")
      this.delegate.fileName = undefined
      this.delegate.onUploading = true
      let connection = NSURLConnection.connectionWithRequestDelegate(request, this.delegate)
      // connection.fileName = config.name
      // this.delegate.fileName = config.name
      
    } catch (error) {
      webdavUtil.addErrorLog(error, "uploadFromConfig")
    }
    }
}
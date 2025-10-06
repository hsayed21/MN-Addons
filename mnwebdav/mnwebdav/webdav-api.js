/**
 * WebDAV API 封装类
 * 提供完整的 WebDAV 文件操作功能
 */
class WebDAV {
    constructor() {
        this.baseUrl = '';
        this.username = '';
        this.password = '';
        this.isConnected = false;
        this.currentPath = '/';
        this.demoMode = true; // 演示模式
        this.mockData = this.createMockDataDev();
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
    createMockDataDev(path){
      let xml = `<?xml version="1.0" encoding="UTF-8"?><D:multistatus xmlns:D="DAV:"><D:response><D:href>/webdav/dl/icon/</D:href><D:propstat><D:prop><D:displayname>icon</D:displayname><D:creationdate>Fri, 06 Jun 2025 12:39:30 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:resourcetype><D:collection xmlns:D="DAV:"/></D:resourcetype><D:getlastmodified>Fri, 06 Jun 2025 12:39:30 GMT</D:getlastmodified></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response><D:href>/webdav/dl/icon/addon.png</D:href><D:propstat><D:prop><D:resourcetype></D:resourcetype><D:getcontentlength>4652</D:getcontentlength><D:getlastmodified>Sat, 07 Jun 2025 04:09:31 GMT</D:getlastmodified><D:getcontenttype>image/png</D:getcontenttype><D:getetag>"1846a73992ed0e00122c"</D:getetag><D:displayname>addon.png</D:displayname><D:creationdate>Sat, 07 Jun 2025 04:09:31 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response><D:href>/webdav/dl/icon/cet4_6.png</D:href><D:propstat><D:prop><D:displayname>cet4_6.png</D:displayname><D:creationdate>Fri, 20 Jun 2025 05:19:12 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:resourcetype></D:resourcetype><D:getcontentlength>31335</D:getcontentlength><D:getlastmodified>Fri, 20 Jun 2025 05:19:12 GMT</D:getlastmodified><D:getcontenttype>image/png</D:getcontenttype><D:getetag>"184aa8926af520007a67"</D:getetag></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response><D:href>/webdav/dl/icon/cet4_12.png</D:href><D:propstat><D:prop><D:displayname>cet4_12.png</D:displayname><D:creationdate>Fri, 20 Jun 2025 05:19:12 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:resourcetype></D:resourcetype><D:getcontentlength>46029</D:getcontentlength><D:getlastmodified>Fri, 20 Jun 2025 05:19:12 GMT</D:getlastmodified><D:getcontenttype>image/png</D:getcontenttype><D:getetag>"184aa8926af52000b3cd"</D:getetag></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response><D:href>/webdav/dl/icon/cet6_6.png</D:href><D:propstat><D:prop><D:resourcetype></D:resourcetype><D:getcontentlength>31430</D:getcontentlength><D:getlastmodified>Fri, 20 Jun 2025 05:19:12 GMT</D:getlastmodified><D:getcontenttype>image/png</D:getcontenttype><D:getetag>"184aa8926af520007ac6"</D:getetag><D:displayname>cet6_6.png</D:displayname><D:creationdate>Fri, 20 Jun 2025 05:19:12 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response><D:href>/webdav/dl/icon/cet6_12.png</D:href><D:propstat><D:prop><D:displayname>cet6_12.png</D:displayname><D:creationdate>Fri, 20 Jun 2025 05:19:12 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:resourcetype></D:resourcetype><D:getcontentlength>54342</D:getcontentlength><D:getlastmodified>Fri, 20 Jun 2025 05:19:12 GMT</D:getlastmodified><D:getcontenttype>image/png</D:getcontenttype><D:getetag>"184aa8926af52000d446"</D:getetag></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response><D:href>/webdav/dl/icon/gdsx7s.png</D:href><D:propstat><D:prop><D:displayname>gdsx7s.png</D:displayname><D:creationdate>Sat, 07 Jun 2025 04:09:31 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:resourcetype></D:resourcetype><D:getcontentlength>86144</D:getcontentlength><D:getlastmodified>Sat, 07 Jun 2025 04:09:31 GMT</D:getlastmodified><D:getcontenttype>image/png</D:getcontenttype><D:getetag>"1846a73992ed0e0015080"</D:getetag></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response><D:href>/webdav/dl/icon/gdsx7x.png</D:href><D:propstat><D:prop><D:displayname>gdsx7x.png</D:displayname><D:creationdate>Sat, 07 Jun 2025 04:09:31 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:resourcetype></D:resourcetype><D:getcontentlength>95723</D:getcontentlength><D:getlastmodified>Sat, 07 Jun 2025 04:09:31 GMT</D:getlastmodified><D:getcontenttype>image/png</D:getcontenttype><D:getetag>"1846a73992ed0e00175eb"</D:getetag></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response><D:href>/webdav/dl/icon/notebook.png</D:href><D:propstat><D:prop><D:creationdate>Sat, 07 Jun 2025 04:09:31 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:displayname>notebook.png</D:displayname><D:getcontenttype>image/png</D:getcontenttype><D:getetag>"1846a73992ed0e00f18"</D:getetag><D:resourcetype></D:resourcetype><D:getcontentlength>3864</D:getcontentlength><D:getlastmodified>Sat, 07 Jun 2025 04:09:31 GMT</D:getlastmodified></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response><D:href>/webdav/dl/icon/pdf.png</D:href><D:propstat><D:prop><D:getcontentlength>4724</D:getcontentlength><D:getlastmodified>Sat, 07 Jun 2025 04:09:31 GMT</D:getlastmodified><D:getcontenttype>image/png</D:getcontenttype><D:getetag>"1846a73992ed0e001274"</D:getetag><D:resourcetype></D:resourcetype><D:displayname>pdf.png</D:displayname><D:creationdate>Sat, 07 Jun 2025 04:09:31 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response><D:href>/webdav/dl/icon/search.png</D:href><D:propstat><D:prop><D:resourcetype></D:resourcetype><D:getcontentlength>2287</D:getcontentlength><D:getlastmodified>Mon, 16 Jun 2025 03:50:53 GMT</D:getlastmodified><D:getcontenttype>image/png</D:getcontenttype><D:getetag>"1849696e60b5e2008ef"</D:getetag><D:displayname>search.png</D:displayname><D:creationdate>Mon, 16 Jun 2025 03:50:53 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response><D:response><D:href>/webdav/dl/icon/webapp.png</D:href><D:propstat><D:prop><D:creationdate>Mon, 16 Jun 2025 03:51:42 GMT</D:creationdate><D:supportedlock><D:lockentry xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock><D:displayname>webapp.png</D:displayname><D:getcontenttype>image/png</D:getcontenttype><D:getetag>"18496979c9568c0083e"</D:getetag><D:resourcetype></D:resourcetype><D:getcontentlength>2110</D:getcontentlength><D:getlastmodified>Mon, 16 Jun 2025 03:51:42 GMT</D:getlastmodified></D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response></D:multistatus>`
      let url = "https://webdav-1836303614.pd1.123pan.cn/webdav/dl/icon/"
      let res = this.parseDirectoryListing(xml, "/")
      console.log(res);
      return {
        "/": res
      }
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
     * @returns {Promise<Array|undefined>} 文件和目录列表
     */
    async listDirectory(path = '/') {
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }
        //交由插件完成
        window.location.href = "mnwebdav://listdirectory?path=" + encodeURIComponent(path);
        return undefined;
        if (this.demoMode) {
            // 演示模式：返回模拟数据
            await new Promise(resolve => setTimeout(resolve, 200)); // 模拟网络延迟
            
            const normalizedPath = this.normalizePath(path);
            const items = this.mockData[normalizedPath] || [];
            
            return items.map(item => ({...item})); // 返回副本
        }

        try {
            const response = await this.makeRequest('PROPFIND', path, {
                'Depth': '1',
                'Content-Type': 'application/xml'
            }, this.getPropfindXML());

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const xmlText = await response.text();
            return this.parseDirectoryListing(xmlText, path);
        } catch (error) {
            console.error('获取目录列表失败:', error);
            throw error;
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
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }

        if (this.demoMode) {
            // 演示模式：模拟删除操作
            await new Promise(resolve => setTimeout(resolve, 300));
            return true;
        }

        try {
            const response = await this.makeRequest('DELETE', path);
            return response.ok;
        } catch (error) {
            console.error('删除失败:', error);
            throw error;
        }
    }

    /**
     * 创建目录
     * @param {string} path - 目录路径
     * @returns {Promise<boolean>} 创建是否成功
     */
    async createDirectory(path) {
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }

        if (this.demoMode) {
            // 演示模式：模拟创建目录
            await new Promise(resolve => setTimeout(resolve, 300));
            return true;
        }

        try {
            const response = await this.makeRequest('MKCOL', path);
            return response.ok;
        } catch (error) {
            console.error('创建目录失败:', error);
            throw error;
        }
    }

    /**
     * 移动/重命名文件或目录
     * @param {string} sourcePath - 源路径
     * @param {string} destPath - 目标路径
     * @returns {Promise<boolean>} 移动是否成功
     */
    async moveItem(sourcePath, destPath) {
        if (!this.isConnected) {
            throw new Error('未连接到服务器');
        }

        try {
            const response = await this.makeRequest('MOVE', sourcePath, {
                'Destination': this.baseUrl + destPath
            });
            return response.ok;
        } catch (error) {
            console.error('移动失败:', error);
            throw error;
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
     * 解析目录列表 XML 响应
     * @param {string} xmlText - XML 字符串
     * @param {string} basePath - 基础路径
     * @returns {Array} 文件和目录列表
     */
    parseDirectoryListing(xmlText, basePath) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const responses = xmlDoc.getElementsByTagNameNS('DAV:', 'response');
        
        const items = [];
        
        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            const href = response.getElementsByTagNameNS('DAV:', 'href')[0];
            const propstat = response.getElementsByTagNameNS('DAV:', 'propstat')[0];
            
            if (!href || !propstat) continue;
            
            const path = decodeURIComponent(href.textContent);
            const props = propstat.getElementsByTagNameNS('DAV:', 'prop')[0];
            
            if (!props) continue;
            
            // 跳过当前目录本身
            if (path === basePath || path === basePath + '/') continue;
            
            const item = this.parseItemProps(path, props);
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
     * 解析单个项目的属性
     * @param {string} path - 项目路径
     * @param {Element} props - 属性元素
     * @returns {Object|null} 项目信息
     */
    parseItemProps(path, props) {
        const displayName = props.getElementsByTagNameNS('DAV:', 'displayname')[0];
        const resourceType = props.getElementsByTagNameNS('DAV:', 'resourcetype')[0];
        const contentLength = props.getElementsByTagNameNS('DAV:', 'getcontentlength')[0];
        const lastModified = props.getElementsByTagNameNS('DAV:', 'getlastmodified')[0];
        const contentType = props.getElementsByTagNameNS('DAV:', 'getcontenttype')[0];

        const isDirectory = resourceType && 
            resourceType.getElementsByTagNameNS('DAV:', 'collection').length > 0;

        const name = displayName ? displayName.textContent : this.getNameFromPath(path);
        
        if (!name) return null;

        return {
            name,
            path,
            isDirectory,
            size: contentLength ? parseInt(contentLength.textContent) : 0,
            lastModified: lastModified ? new Date(lastModified.textContent) : new Date(),
            contentType: contentType ? contentType.textContent : '',
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
            'marginpkg': 'fas fa-file-archive archive',
            'mnaddon': 'fas fa-file-archive archive',

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
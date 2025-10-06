let isFileManagerPage = true

        /**
         * (手动实现) 根据指定的 scheme、路径和参数生成一个 URL Scheme 字符串。
         * 此版本不使用 URLSearchParams。
         *
         * @param {string} scheme - URL scheme, 例如 'myapp'。
         * @param {string} [path] - 可选的路径或操作名。
         * @param {Object<string, string|number|boolean>} [params] - 查询参数对象。
         * @returns {string} - 生成的完整 URL 字符串。
         */
        function generateUrlScheme(scheme, path, params) {
          let url = `${scheme}://${path || ''}`;

          if (params && Object.keys(params).length > 0) {
            const queryParts = [];
            for (const key in params) {
              // 确保我们只处理对象自身的属性
              if (Object.prototype.hasOwnProperty.call(params, key)) {
                const value = params[key];
                const type = typeof value
                // 对键和值都进行编码，这是至关重要的！
                const encodedKey = encodeURIComponent(key);
                const encodedValue = encodeURIComponent(type === "object"? JSON.stringify(value):value);
                queryParts.push(`${encodedKey}=${encodedValue}`);
              }
            }

            if (queryParts.length > 0) {
              url += `?${queryParts.join('&')}`;
            }
          }
          return url;
        }
        function postMessageToAddon(scheme, path, params) {
          let url = generateUrlScheme(scheme,path,params)
          window.location.href = url
        }

/**
 * WebDAV 文件管理器主应用程序
 */
class WebDAVFileManager {
    constructor() {
        this.api = new WebDAV();
        this.currentPath = '/';
        this.isConnected = false;
        
        // 跟踪最后一次交互类型
        this.lastInteractionWasTouch = false;
        
        // 右键菜单相关
        this.currentContextItem = null;
        
        // 初始化 Notyf 实例
        this.notyf = new Notyf({
            duration: 3000,
            position: {
                x: 'center',
                y: 'top'
            },
            dismissible: true
        });
        
        this.initializeElements();
        this.bindEvents();
        this.initializeTooltip();
        // this.loadSavedConnection();
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        // 连接面板元素
        this.fileManager = document.getElementById('fileManager');
        this.serverUrlInput = document.getElementById('serverUrl');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.connectBtn = document.getElementById('connectBtn');
        this.connectionStatus = document.getElementById('connectionStatus');

        // 文件管理器元素
        this.breadcrumb = document.getElementById('breadcrumb');
        this.fileList = document.getElementById('fileList');
        this.loading = document.getElementById('loading');
        this.backBtn = document.getElementById('backBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.homeBtn = document.getElementById('homeBtn');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.createFolderBtn = document.getElementById('createFolderBtn');
        this.settingsBtn = document.getElementById('settingsBtn');

        // 模态框元素
        this.uploadModal = document.getElementById('uploadModal');
        this.uploadModalClose = document.getElementById('uploadModalClose');
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');

        this.createFolderModal = document.getElementById('createFolderModal');
        this.createFolderModalClose = document.getElementById('createFolderModalClose');
        this.folderNameInput = document.getElementById('folderName');
        this.createFolderConfirm = document.getElementById('createFolderConfirm');
        this.createFolderCancel = document.getElementById('createFolderCancel');

        // 长按菜单模态框元素
        this.longPressModal = document.getElementById('longPressModal');
        this.longPressModalClose = document.getElementById('longPressModalClose');
        this.longPressMenu = document.getElementById('longPressMenu');
        this.showFileManager()
    }
    
    /**
     * 初始化全局tooltip
     */
    initializeTooltip() {
        // 创建全局tooltip元素
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'file-tooltip';
        document.body.appendChild(this.tooltip);
        
        // 初始化延时器
        this.tooltipTimer = null;
        this.tooltipDelay = 500; // 1秒延时
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {

        // 工具栏事件
        this.backBtn?.addEventListener('click', () => this.navigateBack());
        this.settingsBtn?.addEventListener('click', () => this.openSetting());
        this.refreshBtn?.addEventListener('click', () => this.refreshCurrentDirectory());
        this.homeBtn?.addEventListener('click', () => this.navigateHome());
        this.uploadBtn?.addEventListener('click', () => this.showUploadModal());
        this.createFolderBtn?.addEventListener('click', () => this.showCreateFolderModal());

        // 上传相关事件
        this.uploadModalClose?.addEventListener('click', () => this.hideUploadModal());
        this.uploadArea?.addEventListener('click', () => this.fileInput?.click());
        this.fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 拖拽上传
        this.uploadArea?.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea?.addEventListener('drop', (e) => this.handleDrop(e));

        // 新建文件夹相关事件
        this.createFolderModalClose?.addEventListener('click', () => this.hideCreateFolderModal());
        this.createFolderConfirm?.addEventListener('click', () => this.handleCreateFolder());
        this.createFolderCancel?.addEventListener('click', () => this.hideCreateFolderModal());
        this.folderNameInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleCreateFolder();
        });

        // 长按菜单相关事件
        this.longPressModalClose?.addEventListener('click', () => this.hideLongPressModal());
        this.longPressModal?.addEventListener('click', (e) => {
            if (e.target === this.longPressModal) this.hideLongPressModal();
        });

        // 模态框背景点击关闭
        this.uploadModal?.addEventListener('click', (e) => {
            if (e.target === this.uploadModal) this.hideUploadModal();
        });
        this.createFolderModal?.addEventListener('click', (e) => {
            if (e.target === this.createFolderModal) this.hideCreateFolderModal();
        });

        // 输入框回车键事件
        [this.serverUrlInput, this.usernameInput, this.passwordInput].filter(input => input).forEach(input => {
            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    // 这里可以添加连接逻辑，目前暂时注释掉
                    // this.handleConnect();
                }
            });
        });

        // 全局点击事件 - 关闭所有打开的菜单
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        });

        // 全局触摸事件监听 - 跟踪交互类型
        document.addEventListener('touchstart', () => {
            this.lastInteractionWasTouch = true;
        }, { passive: true });

        // 鼠标事件监听 - 跟踪交互类型
        document.addEventListener('mousedown', () => {
            this.lastInteractionWasTouch = false;
        });
    }

    /**
     * 加载保存的连接信息
     */
    loadSavedConnection() {
        const saved = localStorage.getItem('webdav-connection');
        if (saved) {
            try {
                const connection = JSON.parse(saved);
                this.serverUrlInput.value = connection.url || '';
                this.usernameInput.value = connection.username || '';
                // 密码不保存到localStorage中
            } catch (error) {
                console.error('加载保存的连接信息失败:', error);
            }
        }
    }

    /**
     * 保存连接信息
     */
    saveConnection() {
        const connection = {
            url: this.serverUrlInput.value,
            username: this.usernameInput.value
            // 密码不保存
        };
        localStorage.setItem('webdav-connection', JSON.stringify(connection));
    }
    sort(items,order) {
      switch (order) {
        case "name":
        case "name (a→z)":
          return items
        case "name (z→a)":
          return items.sort((a, b) => a.name.localeCompare(b.name))
        case "size (1→9)":
          return items.sort((a, b) => a.size - b.size)
        case "size (9→1)":
          return items.sort((a, b) => b.size - a.size)
        case "date (old→new)":
          return items.sort((a, b) => Date.parse(a.lastModified) - Date.parse(b.lastModified))
        case "date (new→old)":
          return items.sort((a, b) => Date.parse(b.lastModified) - Date.parse(a.lastModified))
        default:
          break;
      }
      return items
    }

    /**
     * 处理连接操作
     */
    async handleConnectFromAddon(encodedConfig,order = "name") {
        try {
        let config = JSON.parse(decodeURIComponent(encodedConfig))
            // 模拟连接延迟
            // await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 模拟连接成功
            this.isConnected = true;
            this.api.isConnected = true;
            this.api.baseUrl = config.baseUrl;
            this.api.username = config.username;
            this.api.password = config.password;
            // this.showFileManager();
            this.currentPath = '/';
            let path = config.path || '/';
            let xmlText = config.xmlText || '';
            let items = this.api.parseDirectoryListing(xmlText, path);
            items = this.sort(items, order)
            
            
            this.renderFileList(items);
            this.updateBreadcrumb(path);
        } catch (error) {
            this.showToast(error.message, 'error');
            this.showConnectionStatus(`连接失败: ${error.message}`, 'error');
        } finally {
            // this.connectBtn.disabled = false;
            // this.connectBtn.innerHTML = '<i class="fas fa-plug"></i> 连接';
        }
    }

    /**
     * 处理断开连接操作
     */
    handleDisconnect() {
        this.api.disconnect();
        this.isConnected = false;
    }

    /**
     * 显示连接状态
     */
    showConnectionStatus(message, type) {
        this.connectionStatus.textContent = message;
        this.connectionStatus.className = `connection-status ${type}`;
        this.connectionStatus.style.display = 'block';
    }
    /**
     * 显示文件管理器
     */
    showFileManager() {
        this.fileManager.style.display = 'block';
    }
    /**
     * 由插件调用加载目录内容
     * @param {string} encodedXmlText - XML 字符串
     * @param {string} encodedPath - 目录路径
     */
    async loadDirectoryFromAddon(encodedXmlText, encodedPath,order = "name") {
      try {
        if (!this.isConnected) return;
        // this.showFileManager()
        let path = decodeURIComponent(encodedPath);
        let xmlText = decodeURIComponent(encodedXmlText);

        this.currentPath = path;
        this.showLoading(true);
          let items = this.api.parseDirectoryListing(xmlText, path);
          items = this.sort(items, order)
            
          this.renderFileList(items);
          this.updateBreadcrumb(path);
      } catch (error) {
          console.error('加载目录失败:', error);
          this.showToast(`加载目录失败: ${error.message}`, 'error');
      } finally {
          this.showLoading(false);
      }
    }
    /**
     * 发出加载目录的回调
     */
    async loadDirectory(path,fromMenu = false) {
        if (!this.isConnected) return;
        console.log(fromMenu);
        
        if (this.currentContextItem && !fromMenu) {
          this.hideContextMenu();
          return;
        }
        if (this.currentLongPressItem && !fromMenu) {
          this.hideLongPressModal();
          return;
        }
        this.currentPath = path;
        this.hideTooltip();
        this.showLoading(true);
        // this.showToast("loading...")
        window.location.href = "mnwebdav://listdirectory?path=" + encodeURIComponent(path);
    }

    /**
     * 渲染文件列表
     */
    renderFileList(items) {
        this.fileList.innerHTML = '';

        if (items.length === 0) {
            this.fileList.innerHTML = `
                <div class="empty-directory">
                    <i class="fas fa-folder-open"></i>
                    <p>此目录为空</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const fileItem = this.createFileItem(item);
            this.fileList.appendChild(fileItem);
        });
    }

    /**
     * 创建文件项元素
     */
    createFileItem(item) {
        const div = document.createElement('div');
        div.className = `file-item ${item.isDirectory ? 'folder' : 'file'}`;
        
        const menuId = `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        div.innerHTML = `
            <div class="file-name">
                <i class="${item.icon}"></i>
                <span class="file-name-text" data-filename="${item.name}">${item.name}</span>
            </div>
            <div class="file-size">${item.isDirectory ? '-' : this.api.formatFileSize(item.size)}</div>
            <div class="file-modified">${this.api.formatDate(item.lastModified)}</div>
            <div class="file-actions">
                <div class="menu-container">
                    <button class="menu-btn" data-menu-id="${menuId}">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="dropdown-menu dropdown-left" id="${menuId}">
                        ${item.isDirectory 
                            ? `<button class="dropdown-item" onclick="fileManager.navigateToDirectory('${item.path}')">
                                 <i class="fas fa-folder-open"></i> 打开文件夹
                               </button>`
                            : `<button class="dropdown-item" onclick="fileManager.downloadFile('${item.path}', '${item.name}')">
                                 <i class="fas fa-download"></i> 下载文件
                               </button>`
                        }
                        <button class="dropdown-item danger" onclick="fileManager.handleAction('delete', '${item.path}', '${item.name}', ${item.isDirectory})">
                            <i class="fas fa-trash"></i>删除
                        </button>
                        <button class="dropdown-item" onclick="fileManager.handleAction('rename', '${item.path}', '${item.name}')">
                            <i class="fas fa-edit"></i>
                            <span>重命名</span>
                        </button>
                        <button class="dropdown-item" onclick="fileManager.handleAction('copy', '${item.path}', '${item.name}')">
                            <i class="fas fa-copy"></i>
                            <span>复制路径</span>
                        </button>
                        <button class="dropdown-item" onclick="fileManager.handleAction('info', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                            <i class="fas fa-info-circle"></i>
                            <span>文件信息</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 长按事件处理
        let longPressTimer = null;
        let isLongPress = false;
        const longPressDelay = 500; // 500ms长按触发时间

        div.addEventListener('touchstart', (e) => {
            console.log('touchstart')
            isLongPress = false;
            longPressTimer = setTimeout(() => {
                isLongPress = true;
                e.preventDefault();
                div.classList.add('long-press');
                this.showLongPressMenu(item, e);
            }, longPressDelay);
        }, { passive: false });

        div.addEventListener('touchend', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            div.classList.remove('long-press');
        });

        div.addEventListener('touchmove', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            div.classList.remove('long-press');
        });

        // 右键菜单事件处理
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // 阻止默认右键菜单
            this.showContextMenu(item, e);
        });

        // 单击事件（点击整个文件项，除了操作菜单区域）
        div.addEventListener('click', (e) => {
            // 如果点击的是菜单区域或菜单内的元素，则不触发打开操作
            if (e.target.closest('.file-actions')) {
                return;
            }
            
            // 如果是长按触发的点击，则不执行单击操作
            if (isLongPress) {
                isLongPress = false;
                return;
            }
            
            if (item.isDirectory) {
                this.navigateToDirectory(item.path);
            } else {
                this.downloadFile(item.path, item.name, item.size);
            }
        });

        // 添加tooltip事件监听器
        // const fileNameText = div.querySelector('.file-name-text');
        const fileNameText = div.querySelector('.file-name');
        if (fileNameText) {
            fileNameText.addEventListener('mouseenter', (e) => {
                // 只在非触摸交互时显示tooltip
                if (!this.lastInteractionWasTouch) {
                    const fileName = e.target.querySelector('.file-name-text').getAttribute('data-filename');
                    this.showTooltipWithDelay(e, fileName);
                }
            });
            
            fileNameText.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
            
            fileNameText.addEventListener('mousemove', (e) => {
                // 只在非触摸交互时更新tooltip位置
                if (!this.lastInteractionWasTouch) {
                    this.updateTooltipPosition(e);
                }
            });

            // 添加触摸事件监听器，确保触摸时隐藏tooltip
            fileNameText.addEventListener('touchstart', () => {
                this.hideTooltip();
            }, { passive: true });
        }

        // 菜单按钮点击事件
        const menuBtn = div.querySelector('.menu-btn');
        const dropdownMenu = div.querySelector('.dropdown-menu');
        
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentContextItem) {
              this.hideContextMenu();
            }
            
            // 关闭其他所有菜单
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove('show');
                }
            });
            
            // 检测菜单位置并决定垂直显示方式
            const menuBtnRect = menuBtn.getBoundingClientRect();
            const menuHeight = 300; // 估算菜单高度
            const windowHeight = window.innerHeight;
            const menuCenterY = menuBtnRect.top + menuBtnRect.height / 2;
            const spaceAbove = menuCenterY - menuHeight / 2;
            const spaceBelow = windowHeight - (menuCenterY + menuHeight / 2);
            
            // 清除所有位置类
            dropdownMenu.classList.remove('dropdown-up', 'dropdown-down');
            
            // 根据空间情况调整垂直位置
            if (spaceAbove < 0) {
                // 上方空间不足，菜单从按钮顶部开始显示
                dropdownMenu.classList.add('dropdown-down');
            } else if (spaceBelow < 0) {
                // 下方空间不足，菜单从按钮底部开始显示
                dropdownMenu.classList.add('dropdown-up');
            }
            // 否则保持默认的居中对齐
            
            // 切换当前菜单
            dropdownMenu.classList.toggle('show');
        });

        return div;
    }

    /**
     * 更新面包屑导航
     */
    updateBreadcrumb(path) {
        this.breadcrumb.innerHTML = '';
        
        const parts = path.split('/').filter(p => p);
        
        // 根目录
        const homeItem = document.createElement('span');
        homeItem.className = 'breadcrumb-item';
        homeItem.innerHTML = '<i class="fas fa-home"></i>';
        homeItem.addEventListener('click', () => this.navigateHome());
        this.breadcrumb.appendChild(homeItem);

        // 路径部分
        let currentPath = '';
        parts.forEach((part, index) => {
            currentPath += '/' + part;
            
            if (index > 0) {
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.textContent = '/';
                this.breadcrumb.appendChild(separator);
            }

            const item = document.createElement('span');
            item.className = 'breadcrumb-item';
            item.textContent = part;
            
            const targetPath = currentPath;
            item.addEventListener('click', () => this.loadDirectory(targetPath + '/'));
            
            this.breadcrumb.appendChild(item);
        });
    }

    /**
     * 导航到指定目录
     */
    navigateToDirectory(path) {
        this.loadDirectory(path);
    }

    /**
     * 返回上级目录
     */
    navigateBack() {
        const parentPath = this.api.getParentPath(this.currentPath);
        this.loadDirectory(parentPath);
    }


    /**
     * 导航到根目录
     */
    navigateHome() {
        this.loadDirectory('/');
    }

    openSetting() {
        // 打开设置页面或模态框
        // 这里可以实现打开设置的逻辑
        postMessageToAddon("mnwebdav", "opensetting", {})
        // this.showToast('设置功能尚未实现', 'info');
    }

    /**
     * 刷新当前目录
     */
    refreshCurrentDirectory() {
      // this.showToast(this.currentPath)
        this.loadDirectory(this.currentPath);
    }

    /**
     * 显示/隐藏加载指示器
     */
    showLoading(show) {
        this.loading.style.display = show ? 'block' : 'none';
    }

    /**
     * 显示上传模态框
     */
    showUploadModal() {
      postMessageToAddon("mnwebdav", "upload", {path:this.currentPath})
        // this.uploadModal.classList.add('show');
        // this.uploadProgress.style.display = 'none';
        // this.progressFill.style.width = '0%';
        // this.progressText.textContent = '0%';
    }

    /**
     * 隐藏上传模态框
     */
    hideUploadModal() {
        this.uploadModal.classList.remove('show');
        this.fileInput.value = '';
    }

    /**
     * 处理文件选择
     */
    handleFileSelect(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.uploadFiles(files);
        }
    }

    /**
     * 处理拖拽悬停
     */
    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    /**
     * 处理拖拽离开
     */
    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    /**
     * 处理文件拖放
     */
    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.uploadFiles(files);
        }
    }

    /**
     * 上传文件
     */
    async uploadFiles(files) {
        this.uploadProgress.style.display = 'block';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                await this.api.uploadFile(file, this.currentPath, (progress) => {
                    this.progressFill.style.width = progress + '%';
                    this.progressText.textContent = Math.round(progress) + '%';
                });
                
                this.showToast(`文件 "${file.name}" 上传成功`, 'success');
            } catch (error) {
                console.error('上传失败:', error);
                this.showToast(`文件 "${file.name}" 上传失败: ${error.message}`, 'error');
            }
        }

        this.hideUploadModal();
        this.refreshCurrentDirectory();
    }

    /**
     * 下载文件
     * @param {string} filePath - 文件路径
     * @param {string} fileName - 文件名
     * @param {number} size - 文件大小（可选）
     */
    async downloadFile(filePath, fileName, size = 0) {
        try {
            let allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".html", ".md",".txt",'.mnaddon','.marginnotes','.marginpkg','.docx','.doc','.pptx','.ppt','.xlsx','.xls']
            let isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext))
            if (isAllowed) {
              if (fileName.length > 30) {
                this.showToast(`开始下载 "${fileName.slice(0,15)}...${fileName.slice(-15)}"`, 'info');
              }else{
                this.showToast(`开始下载 "${fileName}"`, 'info');
              }
              postMessageToAddon("mnwebdav", "download", {path:filePath,name:fileName,size:size})
            }else{
              this.showToast(`当前不支持该格式文件下载`, 'error');
            }
            // const blob = await this.api.downloadFile(filePath);
            
            // // 创建下载链接
            // const url = URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = fileName;
            // document.body.appendChild(a);
            // a.click();
            // document.body.removeChild(a);
            // URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('下载失败:', error);
            this.showToast(`下载失败: ${error.message}`, 'error');
        }
    }

    /**
     * 确认删除文件或目录
     */
    confirmDelete(path, name, isDirectory) {
        // const type = isDirectory ? '目录' : '文件';
        // if (confirm(`确定要删除${type} "${name}" 吗？此操作不可撤销。`)) {
        this.deleteItem(path, name, isDirectory);
        // }
    }

    /**
     * 删除文件或目录
     */
    async deleteItem(path, name, isDirectory) {
      // this.showToast("删除文件(夹)功能暂未实现")
      postMessageToAddon("mnwebdav", "deleteItem", {path: path, name: name, isDirectory: isDirectory})
    }
    /**
     * 删除文件或目录
     */
    async renameItem(path, name, isDirectory) {
      // this.showToast("重命名文件(夹)功能暂未实现")
      postMessageToAddon("mnwebdav", "renameItem", {path: path, name: name, isDirectory: isDirectory})
    }

    /**
     * 显示新建文件夹模态框
     */
    showCreateFolderModal() {
      // this.showToast("新建文件夹功能暂未实现")
        this.createFolderModal.classList.add('show');
        this.folderNameInput.value = '';
        this.folderNameInput.focus();
    }

    /**
     * 隐藏新建文件夹模态框
     */
    hideCreateFolderModal() {
        this.createFolderModal.classList.remove('show');
    }

    /**
     * 处理创建文件夹
     */
    async handleCreateFolder() {
        const name = this.folderNameInput.value.trim();
        
        if (!name) {
            this.showToast('请输入文件夹名称', 'error');
            return;
        }

        // 检查名称是否合法
        if (name.includes('/') || name.includes('\\')) {
            this.showToast('文件夹名称不能包含斜杠', 'error');
            return;
        }

        try {
            const folderPath = this.api.joinPath(this.currentPath, name);
            this.showToast("创建文件夹功能暂未实现")
            this.hideCreateFolderModal();
            postMessageToAddon("mnwebdav", "creatfolder", {folderPath: folderPath, name: name})
            return
            
            const success = await this.api.createDirectory(folderPath);
            
            if (success) {
                this.showToast(`文件夹 "${name}" 创建成功`, 'success');
                this.hideCreateFolderModal();
                this.refreshCurrentDirectory();
            } else {
                this.showToast(`创建文件夹 "${name}" 失败`, 'error');
            }
        } catch (error) {
            console.error('创建文件夹失败:', error);
            this.showToast(`创建文件夹失败: ${error.message}`, 'error');
        }
    }

    /**
     * 显示消息提示
     */
    showToast(message, type = 'info') {
        try {
            // 使用 Notyf 显示通知
            switch (type) {
                case 'success':
                    this.notyf.success(message);
                    break;
                case 'error':
                case 'danger':
                    this.notyf.error(message);
                    break;
                case 'warning':
                case 'warn':
                    // Notyf 自定义警告类型
                    this.notyf.open({
                        type: 'warning',
                        message: message,
                        background: '#f39c12',
                        icon: {
                            className: 'fas fa-exclamation-triangle',
                            tagName: 'i',
                            color: '#fff'
                        }
                    });
                    break;
                case 'info':
                default:
                    // Notyf 自定义信息类型
                    this.notyf.open({
                        type: 'info',
                        message: message,
                        background: '#3498db',
                        duration: 1000,
                        icon: {
                            className: 'fas fa-info-circle',
                            tagName: 'i',
                            color: '#fff'
                        }
                    });
                    break;
            }
        } catch (error) {
            // 如果 Notyf 未初始化，则回退到控制台输出
            console.warn('Notyf 未初始化，回退到控制台输出');
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * 延时显示tooltip
     */
    showTooltipWithDelay(event, text) {
        // 清除之前的延时器
        this.clearTooltipTimer();
        
        // 保存当前事件和文本，用于延时显示时更新位置
        this.pendingTooltip = { event, text };
        
        // 设置新的延时器
        this.tooltipTimer = setTimeout(() => {
            // 使用最新的事件位置信息
            if (this.pendingTooltip) {
                this.showTooltip(this.pendingTooltip.event, this.pendingTooltip.text);
            }
        }, this.tooltipDelay);
    }

    /**
     * 显示tooltip
     */
    showTooltip(event, text) {
        if (!this.tooltip) return;
        
        this.tooltip.textContent = text;
        this.tooltip.classList.add('show');
        this.calculateAndSetTooltipPosition(event);
    }

    /**
     * 隐藏tooltip
     */
    hideTooltip() {
        // 清除延时器
        this.clearTooltipTimer();
        
        if (!this.tooltip) return;
        
        this.tooltip.classList.remove('show');
        this.pendingTooltip = null;
    }

    /**
     * 清除tooltip延时器
     */
    clearTooltipTimer() {
        if (this.tooltipTimer) {
            clearTimeout(this.tooltipTimer);
            this.tooltipTimer = null;
        }
    }

    /**
     * 更新tooltip位置
     */
    updateTooltipPosition(event) {
        // 如果tooltip正在显示，则更新位置
        if (this.tooltip && this.tooltip.classList.contains('show')) {
            this.calculateAndSetTooltipPosition(event);
        }
        
        // 如果有待显示的tooltip，更新事件位置信息
        if (this.pendingTooltip) {
            this.pendingTooltip.event = event;
        }
    }

    /**
     * 计算并设置tooltip位置
     */
    calculateAndSetTooltipPosition(event) {
        const x = event.clientX;
        const y = event.clientY;
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 计算最佳位置
        let left = x-20;
        let top = y - tooltipRect.height - 10;
        
        // // 防止超出右边界
        // if (left + tooltipRect.width > windowWidth) {
        //     left = x - tooltipRect.width - 10;
        // }
        
        // // 防止超出上边界
        // if (top < 0) {
        //     top = y + 10;
        // }
        
        // // 防止超出下边界
        // if (top + tooltipRect.height > windowHeight) {
        //     top = windowHeight - tooltipRect.height - 10;
        // }
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    }

    /**
     * 显示长按菜单
     */
    showLongPressMenu(item, event) {
        this.currentLongPressItem = item;
        
        // 生成菜单项
        let menuItems = '';
        
        if (item.isDirectory) {
            menuItems += `
                <button class="long-press-menu-item" onclick="fileManager.handleLongPressAction('open', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                    <i class="fas fa-folder-open"></i>
                    <span>打开文件夹</span>
                </button>
            `;
        } else {
            menuItems += `
                <button class="long-press-menu-item" onclick="fileManager.handleLongPressAction('download', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                    <i class="fas fa-download"></i>
                    <span>下载文件</span>
                </button>
            `;
        }
        
        menuItems += `
            <button class="long-press-menu-item danger" onclick="fileManager.handleLongPressAction('delete', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                <i class="fas fa-trash"></i>
                <span>删除</span>
            </button>
            <button class="long-press-menu-item" onclick="fileManager.handleLongPressAction('rename', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                <i class="fas fa-edit"></i>
                <span>重命名</span>
            </button>
            <button class="long-press-menu-item" onclick="fileManager.handleLongPressAction('copy', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                <i class="fas fa-copy"></i>
                <span>复制路径</span>
            </button>
            <button class="long-press-menu-item" onclick="fileManager.handleLongPressAction('info', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                <i class="fas fa-info-circle"></i>
                <span>文件信息</span>
            </button>
        `;
        
        this.longPressMenu.innerHTML = menuItems;
        this.longPressModal.classList.add('show');
    }

    /**
     * 隐藏长按菜单
     */
    hideLongPressModal() {
        console.log('hideLongPressModal');
        this.longPressModal.classList.remove('show');
        this.currentLongPressItem = null;
    }

    /**
     * 显示右键菜单
     */
    showContextMenu(item, event) {
        if (this.currentContextItem) {
          if (this.currentContextItem === item) {
            this.hideContextMenu();
            return;
          }else{
            this.hideContextMenu();
          }
          
        }
        console.log("showContextMenu");
        
        this.currentContextItem = item;
        
        // 创建右键菜单元素
        let contextMenu = document.getElementById('contextMenu');
        if (!contextMenu) {
            contextMenu = document.createElement('div');
            contextMenu.id = 'contextMenu';
            contextMenu.className = 'context-menu';
            document.body.appendChild(contextMenu);
        }
        
        // 生成菜单项
        let menuItems = '';
        
        if (item.isDirectory) {
            menuItems += `
                <button class="context-menu-item" onclick="fileManager.handleContextMenuAction('open', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                    <i class="fas fa-folder-open"></i>
                    <span>打开文件夹</span>
                </button>
            `;
        } else {
            menuItems += `
                <button class="context-menu-item" onclick="fileManager.handleContextMenuAction('download', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                    <i class="fas fa-download"></i>
                    <span>下载文件</span>
                </button>
            `;
        }
        
        menuItems += `
            <button class="context-menu-item danger" onclick="fileManager.handleContextMenuAction('delete', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                <i class="fas fa-trash"></i>
                <span>删除</span>
            </button>
            <button class="context-menu-item" onclick="fileManager.handleContextMenuAction('rename','${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                <i class="fas fa-edit"></i>
                <span>重命名</span>
            </button>
            <button class="context-menu-item" onclick="fileManager.handleContextMenuAction('copy', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                <i class="fas fa-copy"></i>
                <span>复制路径</span>
            </button>
            <button class="context-menu-item" onclick="fileManager.handleContextMenuAction('info', '${item.path}', '${item.name}', ${item.size}, ${item.isDirectory})">
                <i class="fas fa-info-circle"></i>
                <span>文件信息</span>
            </button>
        `;
        
        contextMenu.innerHTML = menuItems;
        
        // 设置菜单位置
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let left = event.clientX;
        let top = event.clientY;
        
        // 先显示菜单以获取其尺寸
        contextMenu.classList.add('show');
        const rect = contextMenu.getBoundingClientRect();
        
        // 确保菜单不超出窗口边界
        if (left + rect.width > windowWidth) {
            left = windowWidth - rect.width - 10;
        }
        if (top + rect.height > windowHeight) {
            top = windowHeight - rect.height - 10;
        }
        
        // 确保菜单不会超出左边界和上边界
        if (left < 10) left = 10;
        if (top < 10) top = 10;
        
        contextMenu.style.left = left + 'px';
        contextMenu.style.top = top + 'px';
        
        // 添加点击外部关闭菜单的事件
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu);
            document.addEventListener('contextmenu', this.hideContextMenu);
        }, 10);
    }

    /**
     * 隐藏右键菜单
     */
    hideContextMenu = () => {
        console.log('hideContextMenu');
        
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu) {
            contextMenu.classList.remove('show');
        }
        this.currentContextItem = null;
        
        // 移除事件监听器
        document.removeEventListener('click', this.hideContextMenu);
        document.removeEventListener('contextmenu', this.hideContextMenu);
    }
    /**
     * 处理右键菜单操作
     */
    handleAction(action, path, name = '', size = 0, isDirectory = false) {
        
        switch (action) {
            case 'open':
                
                if (this.currentContextItem && this.currentContextItem.isDirectory) {
                    this.loadDirectory(path,true);
                }
                if (this.currentLongPressItem && this.currentLongPressItem.isDirectory) {
                    this.loadDirectory(path,true);
                }
                break;
            case 'download':
                this.downloadFile(path, name, size);
                break;
            case 'delete':
                this.confirmDelete(path, name, isDirectory);
                break;
            case 'rename':
                this.renameItem(path, name, isDirectory)
                // this.showToast('重命名功能暂未实现', 'info');
                break;
            case 'copy':
                this.copyPathToClipboard(path);
                break;
            case 'info':
                this.showFileInfo(path, name, size, isDirectory);
                break;
        }
    }
    /**
     * 处理右键菜单操作
     */
    handleContextMenuAction(action, path, name = '', size = 0, isDirectory = false) {
        this.handleAction(action, path, name, size, isDirectory);
        this.hideContextMenu();
    }

    /**
     * 处理长按菜单操作
     */
    handleLongPressAction(action, path, name = '', size = 0, isDirectory = false) {
        this.handleAction(action, path, name, size, isDirectory);
        this.hideLongPressModal();
    }

    /**
     * 显示文件信息
     */
    showFileInfo(path, name, size, isDirectory) {
        const type = isDirectory ? '文件夹' : '文件';
        const sizeText = isDirectory ? '-' : this.api.formatFileSize(size);
        const info = `
文件类型: ${type}
文件名称: ${name}
文件路径: ${path}
文件大小: ${sizeText}
        `.trim();
        
        this.showToast(info, 'info');
    }

    /**
     * 复制路径到剪贴板
     */
    copyPathToClipboard(path) {
      this.showToast("路径已复制: "+path)
      postMessageToAddon("native", "copy", {content:path})
    }
}

// 初始化应用程序
let fileManager;
document.addEventListener('DOMContentLoaded', () => {
    fileManager = new WebDAVFileManager();
    // fileManager.handleConnectFromAddon('%7B%22baseUrl%22%3A%22https%3A%2F%2Fdav.jianguoyun.com%2Fdav%22%2C%22username%22%3A%22linlf7%40mail2.sysu.edu.cn%22%2C%22password%22%3A%22acrwjavpmicnq49e%22%2C%22path%22%3A%22%2F%22%2C%22xmlText%22%3A%22%3C%3Fxml%20version%3D%5C%221.0%5C%22%20encoding%3D%5C%22UTF-8%5C%22%20standalone%3D%5C%22no%5C%22%3F%3E%3Cd%3Amultistatus%20xmlns%3Ad%3D%5C%22DAV%3A%5C%22%20xmlns%3As%3D%5C%22http%3A%2F%2Fns.jianguoyun.com%5C%22%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3Edav%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNNetwork%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNNetwork%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FFeliksPro%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EFeliksPro%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNBingbang%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNBingbang%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNExample%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNExample%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FTC%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3ETC%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3E1514501767%40qq.com%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2Fcherry-studio%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3Echerry-studio%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNUtil%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNUtil%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2F%25e9%259f%25b3%25e4%25b9%2590%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3E%E9%9F%B3%E4%B9%90%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3E1514501767%40qq.com%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNMilkdown%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNMilkdown%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNWebdav%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNWebdav%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2F%25e7%25bb%2584%25e4%25bc%259a%25e6%258a%25a5%25e5%2591%258a%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3E%E7%BB%84%E4%BC%9A%E6%8A%A5%E5%91%8A%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3E1514501767%40qq.com%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNEditor%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNEditor%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNToolbar%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNToolbar%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2F%25e8%25ae%25ba%25e6%2596%2587%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3E%E8%AE%BA%E6%96%87%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FHapigo%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EHapigo%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2Fcode%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3Ecode%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2Fmonaco%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3Emonaco%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNAILink%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNAILink%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNAutoStyle%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNAutoStyle%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNOCR%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNOCR%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNChatGLM%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNChatGLM%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNTimer%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNTimer%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNSnipaste%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNSnipaste%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2Fdoc2x%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3Edoc2x%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2Fextension%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3Eextension%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNExcalidraw%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNExcalidraw%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2F%25e6%2588%2591%25e7%259a%2584%25e5%259d%259a%25e6%259e%259c%25e4%25ba%2591%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3E%E6%88%91%E7%9A%84%E5%9D%9A%E6%9E%9C%E4%BA%91%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2Fncl_lib%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3Encl_lib%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNChat%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNChat%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2Fkarabiner%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3Ekarabiner%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3E1514501767%40qq.com%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FmnaddonStore%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EmnaddonStore%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3E2063617827%40qq.com%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2FMNBrowser%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3EMNBrowser%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3Cd%3Aresponse%3E%3Cd%3Ahref%3E%2Fdav%2Fzotero%2F%3C%2Fd%3Ahref%3E%3Cd%3Apropstat%3E%3Cd%3Aprop%3E%3Cd%3Agetcontenttype%3Ehttpd%2Funix-directory%3C%2Fd%3Agetcontenttype%3E%3Cd%3Adisplayname%3Ezotero%3C%2Fd%3Adisplayname%3E%3Cd%3Aowner%3Elinlf7%40mail2.sysu.edu.cn%3C%2Fd%3Aowner%3E%3Cd%3Aresourcetype%3E%3Cd%3Acollection%2F%3E%3C%2Fd%3Aresourcetype%3E%3Cd%3Agetcontentlength%3E0%3C%2Fd%3Agetcontentlength%3E%3Cd%3Agetlastmodified%3EWed%2C%2030%20Jul%202025%2010%3A28%3A04%20GMT%3C%2Fd%3Agetlastmodified%3E%3Cd%3Acurrent-user-privilege-set%3E%3Cd%3Aprivilege%3E%3Cd%3Aread%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aall%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Aread_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3Cd%3Aprivilege%3E%3Cd%3Awrite_acl%2F%3E%3C%2Fd%3Aprivilege%3E%3C%2Fd%3Acurrent-user-privilege-set%3E%3C%2Fd%3Aprop%3E%3Cd%3Astatus%3EHTTP%2F1.1%20200%20OK%3C%2Fd%3Astatus%3E%3C%2Fd%3Apropstat%3E%3C%2Fd%3Aresponse%3E%3C%2Fd%3Amultistatus%3E%22%7D')
}); 
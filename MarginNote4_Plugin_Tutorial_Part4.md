## 第13章：让插件识别图片文字 - OCR 功能实战

> ⚠️ **重要提醒**：本章的代码示例主要用于教学演示，展示 OCR 插件的基本实现思路和架构设计。真实的产级 OCR 插件开发需要：
> - 真实的 OCR API 密钥（SimpleTex、Doc2X、OpenAI Vision 等）
> - 更复杂的网络请求处理（multipart/form-data 等）
> - 完整的错误处理机制
> - 优化的缓存策略和性能调优
> 
> 以 MNOCR 插件为例，实际的完整实现超过 3000 行代码。本教程提供的是精简版的框架，帮助初学者理解核心原理。

> 你有没有遇到过这样的场景：PDF 里有个复杂的数学公式，想复制却发现是图片？或者手写的笔记想转成文字？今天，我们就来学习如何让你的插件"看懂"图片里的文字。我们将跟随 MNOCR 插件的设计思路，一步步实现 OCR 功能。

### 13.1 从零开始理解 OCR

#### 什么是 OCR？

OCR（Optical Character Recognition，光学字符识别）听起来很高大上，其实就是让计算机"认字"的技术。就像小朋友学认字一样，OCR 要：
1. 看到图片（输入）
2. 识别文字（处理）
3. 输出结果（文本）

在 MarginNote 中，OCR 特别有用：
- **扫描版 PDF**：很多老书都是扫描的，无法选中文字
- **手写笔记**：把手写内容转成可搜索的文字
- **数学公式**：将公式图片转成 LaTeX 格式
- **图表文字**：提取图表中的文字信息

#### 一个真实场景

📝 **关于本教程的代码示例**：
- 网络请求部分为简化演示，实际需要使用 NSURLSession 和正确的 multipart 格式
- API 地址为示例地址，实际开发请替换为真实 OCR 服务 URL
- 缓存实现为基础版本，实际需要考虑更多的边界情况
- 完整示例中的 OCR 识别使用模拟数据，仅用于演示 UI 交互和结果处理

想象一下，你正在读一本数学教材，看到这样一个公式：

```
[一个复杂的积分公式图片]
```

你想把它记到笔记里，但是：
- 手动输入 LaTeX？太麻烦了
- 截图保存？不能编辑和搜索
- 手写？更慢...

这时候，如果有个插件能一键识别并转换成：
```latex
$$\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$
```

是不是很棒？让我们开始实现它！

#### 动手试试：调用第一个 OCR 接口

我们先从最简单的开始 - 调用一个免费的 OCR API：

```javascript
// 第一个 OCR 函数：识别图片中的文字
class SimpleOCR {
    // 这个函数接收图片，返回识别的文字
    static async recognizeText(imageData) {
        // 第一步：准备数据
        // imageData 是从 MarginNote 获取的图片数据
        let base64Image = imageData.base64Encoding();
        
        // 第二步：调用 OCR 服务（这里用一个简单的例子）
        // 实际项目中，你可以选择各种 OCR 服务
        let result = await this.callOCRService(base64Image);
        
        // 第三步：返回结果
        return result.text;
    }
    
    static async callOCRService(base64Image) {
        // 注意：这是一个简化示例，展示 OCR 调用的基本流程
        // 实际项目中需要：
        // 1. 使用真实的 OCR API（如 SimpleTex、Doc2X）
        // 2. 正确的网络请求方式（NSURLSession）
        // 3. 完整的错误处理
        
        // 创建请求 URL
        // SimpleTex 真实 API: https://server.simpletex.cn/api/simpletex_ocr
        const url = NSURL.URLWithString("https://api.example.com/ocr");
        const request = NSMutableURLRequest.requestWithURL(url);
        
        // 设置请求方法
        request.setHTTPMethod("POST");
        
        // 设置请求头（实际需要包含 API token）
        request.setValueForHTTPHeaderField("application/json", "Content-Type");
        // request.setValueForHTTPHeaderField(apiKey, "Authorization"); // 实际需要
        
        // 构建请求体
        const body = JSON.stringify({
            image: base64Image,
            language: "zh-CN"
        });
        
        // 转换为 NSData
        const bodyData = NSData.dataWithStringEncoding(body, 4);
        request.setHTTPBody(bodyData);
        
        // 发送请求（简化示例，实际使用 NSURLSession）
        return new Promise((resolve, reject) => {
            // 实际项目中应使用：
            // const session = NSURLSession.sharedSession();
            // const task = session.dataTaskWithRequest(request, ...);
            
            // 这里仅作演示
            setTimeout(() => {
                resolve({
                    text: "识别的文字内容",
                    confidence: 0.95
                });
            }, 1000);
        });
    }
}

// 使用示例：在插件中调用
JSB.defineClass('MyOCRPlugin : JSExtension', {
    // 当用户点击 OCR 按钮时
    performOCR: async function() {
        // 获取当前选中的笔记
        let note = MNNote.getFocusNote();
        if (!note) {
            MNUtil.showHUD("请先选择一个笔记");
            return;
        }
        
        // 获取笔记中的图片
        let imageData = this.getImageFromNote(note);
        if (!imageData) {
            MNUtil.showHUD("笔记中没有图片");
            return;
        }
        
        // 显示识别中的提示
        MNUtil.showHUD("正在识别...");
        
        try {
            // 调用 OCR
            let text = await SimpleOCR.recognizeText(imageData);
            
            // 将识别结果添加到笔记
            MNNote.updateExcerptText(note, text);
            MNUtil.showHUD("识别完成！");
            
        } catch (error) {
            MNUtil.showHUD("识别失败：" + error.message);
        }
    },
    
    // 从笔记中提取图片
    getImageFromNote: function(note) {
        // 检查摘录是否是图片
        if (note.excerptPic) {
            return note.excerptPic.data;
        }
        
        // 检查评论中是否有图片
        for (let comment of note.comments) {
            if (comment.type === "PaintNote" && comment.paint) {
                return comment.paint.data;
            }
        }
        
        return null;
    }
});
```

哇！你已经实现了第一个 OCR 功能！虽然简单，但这就是 OCR 的核心流程。

### 13.2 打造一个会飘的小窗口

现在功能有了，但用户体验还不够好。想象一下，如果 OCR 的控制面板固定在屏幕某个位置，可能会挡住你正在读的内容。MNOCR 插件的解决方案很巧妙：做一个可以拖来拖去的浮动窗口！

#### 为什么要做浮动面板？

对比一下两种设计：

**固定界面的问题**：
- 占用固定空间，可能遮挡内容
- 不同场景下位置需求不同
- 用户没有控制权

**浮动面板的优势**：
- 用户可以拖到任意位置
- 不用时可以最小化
- 使用时才展开
- 给用户控制感

#### 手把手教你：创建可以拖来拖去的小窗口

让我们创建一个基础的浮动面板：

```javascript
// 浮动面板控制器
class FloatingPanel {
    constructor() {
        // 创建面板视图
        this.view = UIView.new();
        this.view.frame = {x: 100, y: 100, width: 200, height: 150};
        
        // 设置样式 - 让它看起来像在"浮"着
        this.setupAppearance();
        
        // 添加拖动功能
        this.addDragGesture();
        
        // 添加内容
        this.setupContent();
    }
    
    setupAppearance() {
        // 圆角
        this.view.layer.cornerRadius = 12;
        
        // 阴影效果 - 关键！让面板有悬浮感
        this.view.layer.shadowColor = UIColor.blackColor().CGColor;
        this.view.layer.shadowOffset = {width: 0, height: 2};
        this.view.layer.shadowRadius = 8;
        this.view.layer.shadowOpacity = 0.3;
        
        // 半透明背景
        this.view.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.95);
    }
    
    addDragGesture() {
        // 创建拖动手势识别器
        const panGesture = new UIPanGestureRecognizer(this, "handleDrag:");
        this.view.addGestureRecognizer(panGesture);
        
        // 记录初始位置和相对偏移
        this.initialFrame = null;
        this.locationToBrowser = null; // 重要：记录手指相对于面板的位置
        this.moveDate = 0; // 防抖动
    }
    
    // 处理拖动 - 真实实现需要更精确的坐标计算
    handleDrag(gesture) {
        const state = gesture.state;
        const locationInSuperview = gesture.locationInView(this.view.superview);
        const translation = gesture.translationInView(this.view.superview);
        
        // 防抖动检查（避免过于频繁的更新）
        if (Date.now() - this.moveDate > 16) { // 约60fps
            const locationInPanel = gesture.locationInView(this.view);
            
            if (state === 1) { // 开始拖动
                // 关键：记录手指在面板内的相对位置
                this.locationToBrowser = {
                    x: locationInPanel.x - translation.x,
                    y: locationInPanel.y - translation.y
                };
                this.initialFrame = this.view.frame;
                
                // 视觉反馈
                this.animateScale(1.05);
            }
            
            this.moveDate = Date.now();
        }
        
        if (state === 2) { // 拖动中
            // 基于手指位置和相对偏移计算新位置
            const location = {
                x: locationInSuperview.x - this.locationToBrowser.x,
                y: locationInSuperview.y - this.locationToBrowser.y
            };
            
            // 边界检查
            const bounds = this.view.superview.bounds;
            const frame = this.view.frame;
            
            let x = location.x;
            let y = location.y;
            
            // 确保不会拖出屏幕
            x = Math.max(0, Math.min(x, bounds.width - frame.width));
            y = Math.max(0, Math.min(y, bounds.height - frame.height));
            
            // 更新位置
            this.view.frame = {
                x: x,
                y: y,
                width: frame.width,
                height: frame.height
            };
        }
        
        if (state === 3) { // 拖动结束
            // 恢复大小
            this.animateScale(1.0);
            // 自动贴边
            this.snapToEdge();
        }
    }
    
    // 缩放动画
    animateScale(scale) {
        UIView.animateWithDuration(0.2, () => {
            this.view.transform = CGAffineTransformMakeScale(scale, scale);
        });
    }
    
    setupContent() {
        // 添加标题
        const titleLabel = UILabel.new();
        titleLabel.text = "OCR 工具";
        titleLabel.frame = {x: 10, y: 10, width: 180, height: 30};
        titleLabel.textAlignment = 1; // 居中
        titleLabel.font = UIFont.boldSystemFontOfSize(16);
        this.view.addSubview(titleLabel);
        
        // 添加 OCR 按钮
        const ocrButton = UIButton.buttonWithType(0);
        ocrButton.frame = {x: 20, y: 50, width: 160, height: 40};
        ocrButton.setTitleForState("开始识别", 0);
        ocrButton.setTitleColorForState(UIColor.whiteColor(), 0);
        ocrButton.backgroundColor = UIColor.systemBlueColor();
        ocrButton.layer.cornerRadius = 8;
        ocrButton.addTargetActionForControlEvents(this, "performOCR", 1 << 6);
        this.view.addSubview(ocrButton);
        
        // 添加关闭按钮
        const closeButton = UIButton.buttonWithType(0);
        closeButton.frame = {x: 170, y: 5, width: 25, height: 25};
        closeButton.setTitleForState("×", 0);
        closeButton.setTitleColorForState(UIColor.grayColor(), 0);
        closeButton.titleLabel.font = UIFont.systemFontOfSize(20);
        closeButton.addTargetActionForControlEvents(this, "close", 1 << 6);
        this.view.addSubview(closeButton);
    }
}
```

#### 让窗口自动"贴边"的小魔法

MNOCR 有个很贴心的功能：当你拖动窗口靠近屏幕边缘时，它会自动"吸附"过去。这个功能实现起来其实不难：

```javascript
// 边缘吸附 - 让面板更听话
snapToEdge() {
    const frame = this.view.frame;
    const bounds = this.view.superview.bounds;
    
    // 定义吸附距离（靠近边缘多少像素时触发）
    const snapDistance = 20;
    
    // 计算到各边的距离
    const distances = {
        left: frame.x,
        right: bounds.width - (frame.x + frame.width),
        top: frame.y,
        bottom: bounds.height - (frame.y + frame.height)
    };
    
    // 找到最近的边
    let minDistance = Math.min(...Object.values(distances));
    
    // 如果足够近，就吸附过去
    if (minDistance < snapDistance) {
        let targetFrame = {...frame};
        
        if (distances.left === minDistance) {
            targetFrame.x = 10; // 左边留点间距
        } else if (distances.right === minDistance) {
            targetFrame.x = bounds.width - frame.width - 10;
        } else if (distances.top === minDistance) {
            targetFrame.y = 10;
        } else if (distances.bottom === minDistance) {
            targetFrame.y = bounds.height - frame.height - 10;
        }
        
        // 动画吸附效果
        UIView.animateWithDuration(0.3, () => {
            this.view.frame = targetFrame;
        }, {
            // 使用弹性动画，更自然
            usingSpringWithDamping: 0.7,
            initialSpringVelocity: 0.5
        });
    }
}
```

### 13.3 处理识别结果 - 让 OCR 更智能

识别出文字只是第一步，如何处理结果才是关键。MNOCR 在这方面做得很棒，我们来学习它的思路。

#### 公式怎么变成 LaTeX？

对于数学公式，我们需要特殊处理：

```javascript
class FormulaOCR {
    // 识别数学公式
    static async recognizeFormula(imageData) {
        // 使用专门的数学 OCR 服务（如 SimpleTex）
        const result = await this.callMathOCRService(imageData);
        
        // 处理返回的 LaTeX
        return this.formatLatex(result);
    }
    
    // 格式化 LaTeX - 让它在 MarginNote 中正确显示
    static formatLatex(latex) {
        // 去除多余的空格
        latex = latex.trim();
        
        // 确保有正确的定界符
        if (!latex.startsWith('$$')) {
            latex = '$$' + latex + '$$';
        }
        
        // 处理常见的格式问题
        latex = latex.replace(/\\\n/g, '\\\\'); // 换行符
        latex = latex.replace(/\s+/g, ' '); // 多余空格
        
        return latex;
    }
    
    // 智能判断：这是公式还是普通文字？
    static async smartRecognize(imageData) {
        // 先快速分析图片特征
        const features = this.analyzeImage(imageData);
        
        if (features.likelyFormula) {
            // 看起来像公式，用公式识别
            return await this.recognizeFormula(imageData);
        } else {
            // 普通文字
            return await SimpleOCR.recognizeText(imageData);
        }
    }
    
    // 简单的图片特征分析
    static analyzeImage(imageData) {
        // 这里可以根据图片特征判断
        // 比如：包含数学符号、结构化布局等
        // 简化示例：
        return {
            likelyFormula: true // 实际需要更复杂的判断
        };
    }
}
```

#### 聪明的缓存：别让用户重复等待

OCR 通常需要几秒钟，如果用户重复识别同一张图片，每次都等待就太傻了。MNOCR 的缓存策略值得学习：

```javascript
class OCRCache {
    constructor() {
        // 注意：真实 MNOCR 使用对象而非 Map
        // 实际代码： static OCRBuffer = {}
        this.cache = {};
        this.cacheTime = 60 * 60 * 1000; // 1小时
        this.maxCacheSize = 50; // 限制缓存大小
    }
    
    // 生成缓存键 - 真实实现需要包含配置参数
    getCacheKey(imageData, config = {}) {
        // 重要：实际需要将配置也绍入 MD5
        // 因为不同参数可能产生不同的 OCR 结果
        const base64 = imageData.base64Encoding();
        const configStr = JSON.stringify(config);
        const combined = configStr + base64;
        
        return MNUtil.MD5(combined);
    }
    
    // 获取缓存 - 真实实现考虑配置参数
    get(imageData, config = {}) {
        const key = this.getCacheKey(imageData, config);
        const cached = this.cache[key];
        
        if (cached) {
            // 检查是否过期
            if (Date.now() - cached.time < this.cacheTime) {
                MNUtil.waitHUD("从缓存读取..."); // 使用 waitHUD
                return cached.result;
            } else {
                // 过期了，删除
                delete this.cache[key];
            }
        }
        
        return null;
    }
    
    // 设置缓存
    set(imageData, result, config = {}) {
        const key = this.getCacheKey(imageData, config);
        this.cache[key] = {
            result: result,
            time: Date.now()
        };
        
        // 实际项目中的缓存限制策略
        const cacheKeys = Object.keys(this.cache);
        if (cacheKeys.length > this.maxCacheSize) {
            // 删除最老的缓存（LRU 策略）
            const oldestKey = cacheKeys.reduce((oldest, current) => {
                return this.cache[current].time < this.cache[oldest].time ? current : oldest;
            });
            delete this.cache[oldestKey];
        }
        
        // 记录日志（仅在调试时）
        MNUtil.log({
            source: "OCR Cache",
            message: "✅ 缓存结果",
            detail: `缓存键: ${key.substring(0, 8)}...`
        });
    }
}

// 使用缓存的 OCR - 真实实现示例
class CachedOCR {
    constructor() {
        this.cache = new OCRCache();
        this.currentConfig = { // 加入配置管理
            source: "SimpleTex",
            language: "zh-CN"
        };
    }
    
    async recognize(imageData) {
        // 先检查缓存
        let result = this.cache.get(imageData);
        if (result) {
            return result;
        }
        
        // 没有缓存，执行 OCR
        MNUtil.showHUD("正在识别...");
        result = await FormulaOCR.smartRecognize(imageData);
        
        // 存入缓存
        this.cache.set(imageData, result);
        
        return result;
    }
}
```

#### 错误处理：当 OCR 失败时的优雅降级

网络可能断开，API 可能限流，我们需要优雅地处理这些情况：

```javascript
class RobustOCR {
    // 带重试的 OCR
    static async recognizeWithRetry(imageData, maxRetries = 3) {
        let lastError = null;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                // 尝试识别
                const result = await this.performOCR(imageData);
                return result;
                
            } catch (error) {
                lastError = error;
                
                // 根据错误类型决定是否重试
                if (this.shouldRetry(error)) {
                    MNUtil.showHUD(`识别失败，重试中... (${i + 1}/${maxRetries})`);
                    // 等待一会再重试
                    await MNUtil.delay(1);
                } else {
                    // 不应该重试的错误，直接退出
                    break;
                }
            }
        }
        
        // 所有重试都失败了
        this.handleError(lastError);
        throw lastError;
    }
    
    // 判断是否应该重试
    static shouldRetry(error) {
        // 网络错误可以重试
        if (error.code === 'NETWORK_ERROR') {
            return true;
        }
        // API 限流也可以重试
        if (error.code === 'RATE_LIMIT') {
            return true;
        }
        // 其他错误不重试
        return false;
    }
    
    // 错误处理
    static handleError(error) {
        // 根据错误类型给出不同提示
        let message = "识别失败";
        
        if (error.code === 'NETWORK_ERROR') {
            message = "网络连接失败，请检查网络";
        } else if (error.code === 'RATE_LIMIT') {
            message = "请求太频繁，请稍后再试";
        } else if (error.code === 'INVALID_IMAGE') {
            message = "图片格式不支持";
        } else if (error.code === 'API_KEY_INVALID') {
            message = "API 密钥无效，请检查设置";
        }
        
        MNUtil.showHUD(message);
        
        // 记录错误日志
        MNUtil.log("OCR Error:", error);
    }
}
```

### 13.4 小项目：做个简单的公式识别插件

🚫 **关于以下完整示例**：这是一个**教学演示版本**，主要目的是展示如何组织代码结构和实现基本功能。

**与真实 MNOCR 插件的区别**：
- 真实版本：3000+ 行代码，支持 40+ AI 模型，完整的错误处理
- 教程版本：200+ 行代码，模拟 OCR 调用，简化的功能实现

**实际开发时需要添加**：
1. 真实 OCR API 密钥管理
2. 多种 OCR 服务的适配层
3. 网络请求的错误重试机制
4. 图片预处理和压缩优化
5. 用户配置的持久化存储
6. 多窗口支持和内存管理

---

现在让我们把学到的知识整合起来，做一个完整的小插件！

#### 完整代码实现（200行搞定核心功能）

```javascript
// MiniFormulaOCR - 迷你公式识别插件
JSB.newAddon = () => {
    return JSB.defineClass('MiniFormulaOCR : JSExtension', {
        // 插件信息
        static: {
            name: "MiniFormulaOCR",
            version: "1.0.0"
        },
        
        // 初始化
        init: function() {
            this.floatingPanel = null;
            this.ocrCache = new Map();
        },
        
        // 窗口打开时 - 真实实现需要检查依赖
        sceneWillConnect: async function() {
            // 重要：检查 MNUtils 版本兼容性
            if (typeof MNUtil === 'undefined') {
                MNUtil.showHUD("请先安装 MNUtils 框架");
                return;
            }
            
            // 检查版本
            if (MNUtil.getExtensionVersion() < 4.0) {
                MNUtil.showHUD("MNUtils 版本过旧，请更新");
                return;
            }
            
            this.init();
        },
        
        // 笔记本打开时 - 实际需要判断模式
        notebookWillOpen: async function(notebookid) {
            // 关键：获取当前学习模式
            const studyController = MNUtil.studyController();
            if (!studyController) return;
            
            // studyMode: 0=文档模式, 1=脑图模式, 2=大纲模式, 3=复习模式
            if (studyController.studyMode >= 3) {
                // 复习模式不显示 OCR 面板
                if (this.floatingPanel) {
                    this.floatingPanel.hidden = true;
                }
                return;
            }
            
            // 在文档/脑图/大纲模式中显示面板
            try {
                this.createFloatingPanel();
                this.notebookId = notebookid; // 保存笔记本 ID
            } catch (error) {
                MNUtil.log("创建 OCR 面板失败: " + error.message);
            }
        },
        
        // 创建浮动面板
        createFloatingPanel: function() {
            // 主视图
            const panel = UIView.new();
            panel.frame = {x: 50, y: 100, width: 180, height: 120};
            panel.backgroundColor = UIColor.whiteColor().colorWithAlphaComponent(0.95);
            panel.layer.cornerRadius = 10;
            panel.layer.shadowOpacity = 0.3;
            panel.layer.shadowRadius = 5;
            
            // 标题
            const title = UILabel.new();
            title.text = "公式识别";
            title.frame = {x: 0, y: 10, width: 180, height: 30};
            title.textAlignment = 1;
            title.font = UIFont.boldSystemFontOfSize(14);
            panel.addSubview(title);
            
            // 识别按钮
            const ocrBtn = this.createButton("识别公式", {x: 15, y: 45, width: 150, height: 35});
            ocrBtn.addTargetActionForControlEvents(this, "performOCR", 1 << 6);
            panel.addSubview(ocrBtn);
            
            // 缓存状态
            const cacheLabel = UILabel.new();
            cacheLabel.text = "缓存: 0";
            cacheLabel.frame = {x: 15, y: 85, width: 150, height: 20};
            cacheLabel.textAlignment = 0;
            cacheLabel.font = UIFont.systemFontOfSize(11);
            cacheLabel.textColor = UIColor.grayColor();
            panel.addSubview(cacheLabel);
            this.cacheLabel = cacheLabel;
            
            // 添加拖动手势
            const panGesture = new UIPanGestureRecognizer(this, "handlePan:");
            panel.addGestureRecognizer(panGesture);
            
            // 添加到视图
            MNUtil.getDocumentController().view.addSubview(panel);
            this.floatingPanel = panel;
        },
        
        // 创建按钮
        createButton: function(title, frame) {
            const btn = UIButton.buttonWithType(0);
            btn.frame = frame;
            btn.setTitleForState(title, 0);
            btn.backgroundColor = UIColor.systemBlueColor();
            btn.setTitleColorForState(UIColor.whiteColor(), 0);
            btn.layer.cornerRadius = 5;
            btn.titleLabel.font = UIFont.systemFontOfSize(14);
            return btn;
        },
        
        // 处理拖动
        handlePan: function(gesture) {
            const translation = gesture.translationInView(this.floatingPanel.superview);
            const view = this.floatingPanel;
            
            if (gesture.state === 2) { // 拖动中
                const center = {
                    x: view.center.x + translation.x,
                    y: view.center.y + translation.y
                };
                view.center = center;
                gesture.setTranslationInView({x: 0, y: 0}, view.superview);
            }
        },
        
        // 执行 OCR - 重要提醒：这是教学示例，非真实 OCR 调用
        performOCR: async function() {
            try {
                // 获取选中的笔记
                const note = MNNote.getFocusNote();
                if (!note) {
                    MNUtil.showHUD("请先选择包含图片的笔记");
                    return;
                }
                
                // 提取图片 - 使用真实的 MNUtils 方法
                const imageData = this.extractImageFromNote(note);
                if (!imageData) {
                    MNUtil.showHUD("未找到图片内容");
                    return;
                }
                
                // ⚠️ 重要：这里是模拟 OCR 调用，仅用于演示
                // 实际项目中需要：
                // 1. 申请真实 OCR API 密钥（如 SimpleTex、Doc2X）
                // 2. 实现正确的网络请求
                // 3. 处理各种错误情况
                
                MNUtil.showHUD("正在识别图片内容...");
                
                // 模拟网络延迟
                await MNUtil.delay(2);
                
                // 模拟识别结果（真实项目中删除这部分）
                const mockResults = [
                    "$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$",
                    "$$E = mc^2$$",
                    "$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$",
                    "这是一段识别出的普通文字"
                ];
                const result = mockResults[Math.floor(Math.random() * mockResults.length)];
                
                // 应用结果到笔记
                this.applyResultToNote(note, result);
                
                MNUtil.showHUD("✅ 识别完成（演示模式）");
                
            } catch (error) {
                MNUtil.showHUD("识别失败: " + error.message);
                // 重要：错误处理和日志记录
                MNUtil.log({
                    source: "OCR Plugin",
                    message: "识别错误",
                    level: "ERROR",
                    detail: error.toString()
                });
            }
        },
        
        // 提取图片 - 基于真实 MNOCR 实现逻辑
        extractImageFromNote: function(note) {
            // 第一步：检查摘录图片（excerptPic）
            if (note.excerptPic && note.excerptPic.paint) {
                // 使用 MNUtils 的媒体获取方法
                const imageData = MNUtil.getMediaByHash(note.excerptPic.paint);
                if (imageData) return imageData;
            }
            
            // 第二步：遍历评论查找图片
            for (const comment of note.comments) {
                // PaintNote 类型：手写笔记或图片
                if (comment.type === "PaintNote" && comment.paint) {
                    const imageData = MNUtil.getMediaByHash(comment.paint);
                    if (imageData) return imageData;
                }
                
                // LinkNote 类型：合并的内容（可能包含图片）
                if (comment.type === "LinkNote" && comment.q_hpic?.paint) {
                    const imageData = MNUtil.getMediaByHash(comment.q_hpic.paint);
                    if (imageData) return imageData;
                }
            }
            
            return null;
        },
        
        // 应用结果到笔记 - 真实的笔记操作方式
        applyResultToNote: function(note, result) {
            // 重要：使用 undoGrouping 包装操作，支持撤销
            MNUtil.undoGrouping(() => {
                // 判断结果类型并应用到适合的位置
                if (result.startsWith('$$') && result.endsWith('$$')) {
                    // LaTeX 公式：添加到评论
                    note.appendMarkdownComment(result);
                    MNUtil.showHUD("✅ 公式已添加到评论");
                } else {
                    // 普通文本：设置为摘录内容
                    note.excerptText = result;
                    note.excerptTextMarkdown = true; // 支持 Markdown 格式
                    MNUtil.showHUD("✅ 文本已设置为摘录");
                }
            });
            
            // 可选：发送通知给其他插件（高级用法）
            MNUtil.postNotification("OCRFinished", {
                noteId: note.noteId,
                result: result,
                action: result.startsWith('$$') ? "formula" : "text"
            });
        },
        
        // 生成缓存键
        getCacheKey: function(imageData) {
            // 简化版：使用数据长度作为键
            // 实际应该使用 MD5 或其他哈希
            return "img_" + imageData.length;
        },
        
        // 应用识别结果
        applyResult: function(note, latex) {
            // 将公式添加为评论
            MNNote.addTextComment(note, latex);
            
            // 如果摘录是图片，可以选择替换为文字
            if (note.excerptPic && !note.excerptText) {
                UIAlertView.showWithTitleMessage(
                    "替换摘录？",
                    "是否将图片摘录替换为公式文本？",
                    0,
                    ["取消", "替换"],
                    (alert, buttonIndex) => {
                        if (buttonIndex === 1) {
                            MNNote.updateExcerptText(note, latex);
                            MNUtil.showHUD("已替换摘录");
                        }
                    }
                );
            }
        },
        
        // 更新缓存标签
        updateCacheLabel: function() {
            if (this.cacheLabel) {
                this.cacheLabel.text = `缓存: ${this.ocrCache.size}`;
            }
        },
        
        // 清理
        notebookWillClose: function(notebookid) {
            if (this.floatingPanel) {
                this.floatingPanel.removeFromSuperview();
                this.floatingPanel = null;
            }
            this.ocrCache.clear();
        }
    });
};
```

#### 测试和调试技巧

🛠️ **调试方法**（基于真实 MNOCR 开发经验）：

1. **使用 MNUtil.log 进行日志记录**：
   ```javascript
   // 结构化的日志
   MNUtil.log({
     source: "OCR Plugin",
     message: "图片提取成功",
     detail: `图片大小: ${imageData.length} bytes`
   });
   ```

2. **错误处理和日志复制**：
   ```javascript
   try {
     // OCR 操作
   } catch (error) {
     // 自动复制错误信息到剪贴板
     MNUtil.copyJSON({
       error: error.toString(),
       stack: error.stack,
       time: new Date().toISOString()
     });
     MNUtil.showHUD("错误已复制到剪贴板");
   }
   ```

3. **测试不同场景**（重要！）：
   - ✅ PDF 文档中的数学公式图片
   - ✅ 手写笔记的扫描版
   - ✅ 各种尺寸和分辨率的图片
   - ✅ 在不同学习模式（文档/脑图/复习）下测试

### 13.5 实际开发指南和注意事项

#### 🔑 获取真实 OCR API

**SimpleTex API**（数学公式专用）:
- 官网：https://simpletex.cn/
- 特点：专门针对数学公式，LaTeX 输出质量高
- 定价：按调用次数计费，有免费额度

**Doc2X API**（通用 OCR）:
- 功能：支持文档、表格、公式的综合识别
- 特点：中文识别准确率高，支持批量处理

**OpenAI Vision API**:
- 模型：GPT-4o, GPT-4 Turbo with Vision
- 特点：理解能力强，可以描述图片内容
- 适合：复杂场景的智能识别

#### ⚠️ 开发中的常见陷阱

1. **网络请求问题**：
   - ❌ 不要使用已废弃的 `NSURLConnection`
   - ✅ 使用 `NSURLSession` 和 `dataTaskWithRequest`
   - ✅ 正确处理 multipart/form-data 格式

2. **生命周期管理**：
   ```javascript
   // ❌ 错误：忘记检查 MNUtils
   notebookWillOpen: function(notebookid) {
       this.createPanel();
   }
   
   // ✅ 正确：先检查依赖
   notebookWillOpen: async function(notebookid) {
       if (!(await this.checkMNUtil())) return;
       if (MNUtil.studyController().studyMode >= 3) return; // 复习模式跳过
       this.createPanel();
   }
   ```

3. **内存和性能**：
   - ✅ 大图片要压缩再发送
   - ✅ 缓存要设置大小限制
   - ✅ 及时释放不用的视图

4. **多窗口支持**：
   ```javascript
   // ✅ 数据挂载到 self 而不是全局变量
   notebookWillOpen: function(notebookid) {
       self.ocrController = new OCRController(); // ✅
       globalOCRController = new OCRController(); // ❌
   }
   ```

#### 🚀 性能优化建议

1. **网络优化**：
   - 图片压缩：大图片压缩到 1MB 以下
   - 并发控制：限制同时进行的 OCR 请求数量
   - 超时设置：避免长时间等待

2. **缓存策略**：
   ```javascript
   // 基于内容和配置的缓存键
   getCacheKey: function(imageData, config) {
       const content = imageData.base64Encoding();
       const settings = JSON.stringify(config);
       return MNUtil.MD5(content + settings);
   }
   ```

3. **用户体验**：
   - 显示进度指示器
   - 支持取消正在进行的请求
   - 提供明确的错误提示

#### 📚 学习资源和参考

1. **深入学习 MNOCR 插件**：
   - 查看完整源码：`mnocr/mnocr/` 目录
   - 阅读深度分析：`MNOCR 插件深度分析.md`

2. **相关文档**：
   - MNUtils API 指南：`mnutils/MNUtils_API_Guide.md`
   - 插件开发基础：前面章节的基础教程

3. **社区和支持**：
   - MarginNote 官方论坛
   - GitHub 开源插件项目

---

### 🎯 本章总结

通过本章学习，你应该掌握了：

✅ **核心概念**：
- OCR 的基本原理和应用场景
- 网络请求和 API 调用的基本方法
- 缓存机制的实现思路

✅ **实战技能**：
- 创建可拖动的浮动面板
- 从 MarginNote 笔记中提取图片数据
- 处理 OCR 结果并应用到笔记

✅ **进阶知识**：
- 真实插件的复杂性和开发要点
- 性能优化和错误处理的最佳实践
- 多窗口支持和内存管理

**下一步建议**：
1. 尝试申请一个免费的 OCR API 密钥
2. 基于教程代码实现一个最简版本
3. 逐步添加更多功能（多格式支持、批量处理等）
4. 参考 MNOCR 插件学习更高级的实现技巧

记住：**优秀的插件不是一天写成的**！从简单开始，逐步迭代，每个功能都要充分测试。OCR 插件涉及网络、图像处理、UI 交互等多个方面，是很好的综合练习项目。

3. **性能监控**：
   ```javascript
   const startTime = Date.now();
   const result = await this.recognizeFormula(imageData);
   const elapsed = Date.now() - startTime;
   MNUtil.log(`OCR took ${elapsed}ms`);
   ```

#### 用户会遇到的坑和解决方案

**坑1：图片提取失败**
- 问题：`note.excerptPic` 有时候是 undefined
- 解决：始终检查多个来源（摘录、评论、合并内容）

**坑2：缓存键冲突**
- 问题：不同图片可能生成相同的缓存键
- 解决：使用更可靠的哈希算法（MD5、SHA256）

**坑3：内存泄漏**
- 问题：缓存无限增长导致内存问题
- 解决：限制缓存大小，实现 LRU 淘汰策略

**坑4：网络请求阻塞 UI**
- 问题：OCR 请求时界面卡顿
- 解决：使用异步请求，显示进度提示

### 本章小结

恭喜你！通过这一章，你已经学会了：

1. **OCR 基础**：理解了 OCR 的原理和在 MarginNote 中的应用
2. **浮动面板**：创建了可拖动、自动吸附的悬浮窗口
3. **缓存策略**：实现了智能缓存，提升用户体验
4. **错误处理**：学会了优雅地处理各种异常情况
5. **完整项目**：从零实现了一个可用的公式识别插件

OCR 功能看似复杂，但拆解开来就是：获取图片 → 调用服务 → 处理结果。关键是要注重用户体验，比如添加缓存、优化界面、处理错误等。

下一章，我们将探索更激动人心的功能：如何让插件与 AI 对话，实现流式响应！你将学习 MNAI 插件的精髓，打造自己的 AI 助手。

---

## 第14章：让插件和 AI 对话 - 流式响应的秘密
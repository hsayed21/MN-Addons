# 第三部分：玩转高级功能

## 第13章：让插件识别图片文字 - OCR 功能实战

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
        // 创建请求
        const url = "https://api.example.com/ocr"; // 替换成真实的 API
        const request = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(url));
        
        // 设置请求方法和头部
        request.setHTTPMethod("POST");
        request.setValueForHTTPHeaderField("application/json", "Content-Type");
        
        // 构建请求体
        const body = JSON.stringify({
            image: base64Image,
            language: "zh-CN" // 中文识别
        });
        request.setHTTPBody(NSData.dataWithStringEncoding(body, 4));
        
        // 发送请求并等待响应
        return new Promise((resolve, reject) => {
            NSURLConnection.sendAsynchronousRequest(request, (response, data, error) => {
                if (error) {
                    reject(error);
                } else {
                    // 解析响应
                    const result = JSON.parse(data.base64Encoding());
                    resolve(result);
                }
            });
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
        
        // 记录初始位置
        this.initialFrame = null;
    }
    
    // 处理拖动 - 这是核心！
    handleDrag(gesture) {
        const state = gesture.state;
        const translation = gesture.translationInView(this.view.superview);
        
        switch(state) {
            case 1: // 开始拖动
                // 记住起始位置
                this.initialFrame = this.view.frame;
                // 稍微放大，给用户反馈
                this.animateScale(1.05);
                break;
                
            case 2: // 拖动中
                // 计算新位置
                const newFrame = {
                    x: this.initialFrame.x + translation.x,
                    y: this.initialFrame.y + translation.y,
                    width: this.initialFrame.width,
                    height: this.initialFrame.height
                };
                
                // 确保不会拖出屏幕
                const bounds = this.view.superview.bounds;
                newFrame.x = Math.max(0, Math.min(newFrame.x, bounds.width - newFrame.width));
                newFrame.y = Math.max(0, Math.min(newFrame.y, bounds.height - newFrame.height));
                
                // 更新位置
                this.view.frame = newFrame;
                break;
                
            case 3: // 拖动结束
                // 恢复大小
                this.animateScale(1.0);
                // 自动贴边（下面会详细讲）
                this.snapToEdge();
                break;
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
        // 使用 Map 存储缓存
        this.cache = new Map();
        // 缓存过期时间（1小时）
        this.cacheTime = 60 * 60 * 1000;
    }
    
    // 生成缓存键 - 基于图片内容
    getCacheKey(imageData) {
        // 使用 MD5 生成唯一标识
        const base64 = imageData.base64Encoding();
        return MNUtil.MD5(base64);
    }
    
    // 获取缓存
    get(imageData) {
        const key = this.getCacheKey(imageData);
        const cached = this.cache.get(key);
        
        if (cached) {
            // 检查是否过期
            if (Date.now() - cached.time < this.cacheTime) {
                MNUtil.showHUD("使用缓存结果");
                return cached.result;
            } else {
                // 过期了，删除
                this.cache.delete(key);
            }
        }
        
        return null;
    }
    
    // 设置缓存
    set(imageData, result) {
        const key = this.getCacheKey(imageData);
        this.cache.set(key, {
            result: result,
            time: Date.now()
        });
        
        // 限制缓存大小
        if (this.cache.size > 100) {
            // 删除最老的缓存
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }
}

// 使用缓存的 OCR
class CachedOCR {
    constructor() {
        this.cache = new OCRCache();
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
        
        // 窗口打开时
        sceneWillConnect: function() {
            this.init();
        },
        
        // 笔记本打开时
        notebookWillOpen: function(notebookid) {
            // 创建浮动面板
            this.createFloatingPanel();
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
        
        // 执行 OCR
        performOCR: async function() {
            try {
                // 获取选中的笔记
                const note = MNNote.getFocusNote();
                if (!note) {
                    MNUtil.showHUD("请先选择包含图片的笔记");
                    return;
                }
                
                // 提取图片
                const imageData = this.extractImage(note);
                if (!imageData) {
                    MNUtil.showHUD("未找到图片");
                    return;
                }
                
                // 检查缓存
                const cacheKey = this.getCacheKey(imageData);
                if (this.ocrCache.has(cacheKey)) {
                    MNUtil.showHUD("使用缓存结果");
                    const cached = this.ocrCache.get(cacheKey);
                    this.applyResult(note, cached);
                    return;
                }
                
                // 执行识别
                MNUtil.showHUD("正在识别公式...");
                const result = await this.recognizeFormula(imageData);
                
                // 保存到缓存
                this.ocrCache.set(cacheKey, result);
                this.updateCacheLabel();
                
                // 应用结果
                this.applyResult(note, result);
                MNUtil.showHUD("识别完成！");
                
            } catch (error) {
                MNUtil.showHUD("识别失败: " + error.message);
                MNUtil.log("OCR Error:", error);
            }
        },
        
        // 提取图片
        extractImage: function(note) {
            // 优先从摘录提取
            if (note.excerptPic?.paint) {
                const paint = NSData.dataWithBase64EncodedString(note.excerptPic.paint);
                if (paint) return paint;
            }
            
            // 从评论中查找
            for (const comment of note.comments) {
                if (comment.type === "PaintNote" && comment.paint) {
                    const paint = NSData.dataWithBase64EncodedString(comment.paint);
                    if (paint) return paint;
                }
            }
            
            return null;
        },
        
        // 识别公式（简化版）
        recognizeFormula: async function(imageData) {
            // 这里使用模拟的识别结果
            // 实际项目中替换为真实的 API 调用
            await MNUtil.delay(2); // 模拟网络延迟
            
            // 模拟返回 LaTeX 公式
            const formulas = [
                "$$E = mc^2$$",
                "$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$",
                "$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$"
            ];
            
            // 随机返回一个公式（演示用）
            return formulas[Math.floor(Math.random() * formulas.length)];
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

1. **测试不同类型的图片**：
   - 清晰的打印公式
   - 手写公式
   - 复杂的多行公式
   - 包含文字的混合内容

2. **调试技巧**：
   ```javascript
   // 添加调试输出
   MNUtil.log("Image size:", imageData.length);
   MNUtil.log("Cache hit:", this.ocrCache.has(cacheKey));
   
   // 可视化调试 - 显示提取的图片
   const debugImageView = UIImageView.new();
   debugImageView.image = UIImage.imageWithData(imageData);
   debugImageView.frame = {x: 0, y: 0, width: 100, height: 100};
   this.floatingPanel.addSubview(debugImageView);
   ```

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
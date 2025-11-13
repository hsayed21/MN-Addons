> 如果你没听懂我的需求或者有任何觉得我没说清楚的地方，请不要随便猜测，直接问我。
> 严禁自己凭空创造不存在的 API！想使用任何没出现过的 API 都要在所有插件文件里搜索一遍，确认它确实存在且能用。
> 如果用户让你分析任何功能代码，并且让你生成 Markdown 文档的话，如果我没告诉你具体的文档路径，默认把这个 `.md` 文档生成到 [另一个路径](/Users/xiakangwei/Nutstore/Obsidian/IOTO/1-输入/碎片笔记/MarginNote) 中。
> Markdown 文档编写严格用 UTF-8 编码！
> 如果用户让你参考本目录的插件，默认不参考：
> - Gotopage
> - mntask
> - mntoolbar/mntoolbar

# MarginNote 4 插件开发指南

## 1. 什么是 MarginNote 4

MarginNote 4 是一个**基于数据结构的知识管理系统**，不仅仅是 PDF 阅读器或笔记软件。其核心设计理念：

- **知识的原子化**：将知识分解为最小可管理单元（卡片）
- **知识的结构化**：通过关系网络构建知识体系
- **知识的流动性**：同一数据在不同视图间自由流转（文档/脑图/复习）
- **知识的可计算性**：支持检索、链接、自动化处理

### 三层数据架构
1. **卡片（Card）**：知识的原子单位，包含标题、摘录、评论
2. **文档（Document）**：知识的载体，支持 PDF/EPUB 等格式
3. **学习集（Study Set）**：知识的工作空间，整合文档、脑图、复习

## 2. MarginNote 插件系统

### 技术基础
- **JSBridge 框架**：Objective-C 与 JavaScript 的桥接技术
- **运行环境**：基于 Safari 的 JavaScript 引擎
- **限制**：无 Node.js API，Browser API 支持有限

### 插件结构（.mnaddon）
```
plugin.mnaddon/
├── mnaddon.json    # 插件配置清单
├── main.js         # 插件主代码
└── logo.png        # 插件图标
```

### 插件生命周期
```javascript
JSB.newAddon = () => {
  return JSB.defineClass("PluginName: JSExtension", {
    // 窗口生命周期
    sceneWillConnect() {},       // 新建窗口
    sceneDidDisconnect() {},     // 关闭窗口
    
    // 笔记本生命周期
    notebookWillOpen(topicid) {}, // 打开笔记本
    notebookWillClose(topicid) {}, // 关闭笔记本
    
    // 文档生命周期
    documentDidOpen(docmd5) {},    // 打开文档
    documentWillClose(docmd5) {}   // 关闭文档
  })
}
```

### 如何打包和解包插件

在插件目录下使用 `mnaddon4 build` 打包、 `mnaddon4 unpack`解包，比如：
```bash
mnaddon4 build plugin_0827
```
打包的话，优先使用 mnaddon-package 这个 agent 来打包。

## 3. MNUtils 框架 - 插件开发的基础设施 ⭐⭐⭐⭐⭐

### 为什么 MNUtils 是必需的

MNUtils 是 MarginNote 插件生态的**核心基础设施层**：

1. **默认加载**：框架已自动加载，所有插件可直接使用
2. **完整封装**：提供 500+ 个 API 方法，覆盖所有功能需求
3. **最佳实践**：经过大量实践验证的设计模式
4. **降低门槛**：无需理解底层 Objective-C API

### 核心组成

**mnutils.js - 基础框架（8,439行）**
- 10 个核心类，500+ API 方法
- 主要类：
  - `MNUtil`：系统工具类（400+ 方法）
  - `MNNote`：笔记操作类（180+ 方法）（已迁移到 `mnnote.js`）
  - `MNComment`：评论管理
  - `MNDocument`：文档操作
  - `MNNotebook`：笔记本管理

**xdyyutils.js - 学术扩展（15,560行）**
- 针对学术场景优化
- 智能链接管理
- 中文排版优化（Pangu.js）

### 使用 MNUtils 的第一步

```javascript
// 必须在插件启动时初始化
MNUtil.init(self.path);

// 之后即可使用所有 API
let note = MNNote.getFocusNote();
MNUtil.showHUD("Hello MarginNote!");
```

## 4. 如何学习和使用 API

### 📚 文档查阅顺序

1. **查看 API 指南**：`mnutils/MNUtils_API_Guide.md`
   - 完整的 API 参考文档
   - 包含所有类和方法说明
   - 提供丰富的使用示例

2. **确认方法存在**：在 `mnutils.js`, `mnnote.js` 和 `xdyyutils.js` 中搜索
   - 文档可能有遗漏，以源码为准
   - 使用 Cmd+F 快速定位方法

3. **了解实现细节**：参考 `mnutils/CLAUDE.md`
   - 深入了解内部实现
   - 查看注意事项和已知问题

### 综合类型的功能参考

下面会列出一些基于 MNUtils 实现的较为综合和复杂的功能，供你开发类似的功能的时候进行参考。

#### 弹窗类型

如果你要开发「输入框」+「选择」类型的弹窗，可以参考：

##### 1. manageCommentsByPopup（多层级弹窗管理系统）
- **位置**：`mnutils/xdyyutils.js:4419-4508`
- **功能**：评论的移动、删除、提取等操作
- **特点**：
  - 多层级弹窗架构（主菜单 → 选择方式 → 操作确认）
  - 递归导航模式，支持返回上一层
  - 策略模式处理不同的选择方式
  - 通过回调函数链管理复杂流程

##### 2. searchNotesInDescendants（复杂搜索交互系统）
- **位置**：`mnutils/xdyyutils.js:8904-9121`
- **功能**：在多个根目录的子孙卡片中进行高级搜索
- **特点**：
  - 循环式交互界面，无需重复打开对话框
  - 动态按钮状态（根据配置实时更新按钮文字）
  - 支持多种搜索配置（类型筛选、关键词扩展、排除词等）
  - 进度显示和错误处理机制

#### 弹窗开发模式详解

##### 多层级弹窗架构

**核心设计模式**：
```javascript
// 1. 使用对象映射管理选项和处理函数
const optionHandlers = {
  "选项1": () => { /* 处理逻辑 */ },
  "选项2": () => { /* 处理逻辑 */ }
};

// 2. 递归调用实现返回功能
function showMainDialog() {
  UIAlertView.show(..., (alert, buttonIndex) => {
    if (buttonIndex === 0) return; // 取消
    
    // 进入下一层
    showSubDialog(() => {
      // 返回回调：重新显示主对话框
      showMainDialog();
    });
  });
}

// 3. 通过参数传递实现状态保持
function showSubDialog(previousDialog) {
  UIAlertView.show(..., (alert, buttonIndex) => {
    if (buttonIndex === 0) {
      previousDialog(); // 返回上一层
      return;
    }
    // 处理逻辑
  });
}
```

##### 状态管理模式

**使用闭包和 Set 管理选择状态**：
```javascript
// 使用 Set 存储选中项
const selectedItems = new Set();

// 在弹窗间传递状态
function showMultiSelectDialog(allOptions, selectedItems, callback) {
  // 根据 selectedItems 显示选中状态
  const displayOptions = allOptions.map((opt, idx) => 
    selectedItems.has(idx) ? `✅ ${opt}` : `☐ ${opt}`
  );
  
  UIAlertView.show(...displayOptions...);
}
```

##### 动态选项生成

**根据数据动态构建选项列表**：
```javascript
// 根据笔记内容生成选项
function getAllCommentOptions(note) {
  return note.comments.map((comment, index) => {
    const preview = comment.text.substring(0, 30);
    return `${index}: ${preview}...`;
  });
}

// 动态更新按钮文字
const buttonText = isEnabled ? "☑️ 已启用" : "☐ 未启用";
```

#### 技术要点提醒

##### UIAlertView 使用注意事项
1. **alertViewStyle 类型**：
   - 0：默认（无输入框）
   - 1：密码输入
   - 2：普通文本输入
   - 3：用户名和密码输入

2. **按钮索引**：
   - 0：取消按钮
   - 1+：其他按钮（从1开始）

3. **文本获取**：
   ```javascript
   const inputText = alert.textFieldAtIndex(0).text;
   ```

##### 性能优化建议
1. **避免深层递归**：使用循环替代过深的递归调用
2. **批量操作**：使用 `MNUtil.undoGrouping()` 包装批量修改
3. **异步处理**：长时间操作使用 `MNUtil.delay()` 避免阻塞
4. **进度提示**：操作超过1秒应显示进度 HUD

##### 错误处理模式
```javascript
try {
  // 主要逻辑
} catch (error) {
  MNUtil.copyJSON(error);
  MNUtil.showHUD("操作失败: " + error.message);
  // 可选：返回到安全状态
  this.reset();
}
```

## 5. 重要提醒

1. **API 版本差异**
   - `xdyyutils.js` 修改了部分默认值（如 `getNoteById` 的 alert 参数）
   - 使用前请确认是否符合需求

2. **多窗口处理**
   - MarginNote 支持多窗口，不同窗口的插件实例独立
   - 数据必须挂载到 `self` 上以区分窗口

3. **性能优化**
   - 大批量操作使用 `undoGrouping`
   - 适当使用 `delay` 避免界面卡顿
   - 注意内存管理，及时释放大对象

4. **调试技巧**
   - 使用 `MNUtil.log()` 记录日志
   - 使用 `MNUtil.copyJSON()` 复制对象到剪贴板
   - 错误会自动记录并复制

## 6. 获取更多帮助

- **详细 API 文档**：查看 `mnutils/MNUtils_API_Guide.md`
- **实现细节**：查看 `mnutils/CLAUDE.md`
- **数据结构理解**：参考 `MNGuide_DataStructure.md`
- **插件系统文档**：参考 `MarginNote插件系统文档.md`

> 💡 **记住**：MNUtils 不仅是一个工具库，更是整个 MarginNote 插件生态的基础设施。掌握它等于掌握了 MarginNote 插件开发的核心。

---

# MN-Addon 开发经验与常见问题

## 关于 self 和 this

在 JSB.defineClass 内部严禁使用 `let self = this;`，这是错误的写法。直接用 `self` 指向当前插件实例即可。

## note.MNComments 与 note.comments 的关键区别

### 核心区别

#### 1. `note.comments` - 原始评论数组
- 包含底层的 `NoteComment` 对象
- `comment.type` 只有 5 种基础类型值：
  - `"TextNote"` - 文本评论
  - `"HtmlNote"` - HTML 评论
  - `"LinkNote"` - 合并摘录评论
  - `"PaintNote"` - 绘图评论（包括图片和手写）
  - `"AudioNote"` - 音频评论

#### 2. `note.MNComments` - 处理后的评论数组  
- 通过 `MNComment.from(note)` 生成的 `MNComment` 实例数组
- 构造时自动调用 `MNComment.getCommentType(comment)` 设置 type
- `MNComment` 的 `type` 属性是细分后的 15+ 种类型：
  - 文本类：`"textComment"`, `"markdownComment"`, `"tagComment"`
  - 链接类：`"linkComment"`, `"summaryComment"`
  - HTML类：`"HtmlComment"`
  - 合并类：`"mergedTextComment"`, `"mergedImageComment"`, `"mergedImageCommentWithDrawing"`
  - 图片类：`"imageComment"`, `"imageCommentWithDrawing"`
  - 手写类：`"drawingComment"`
  - 其他：`"audioComment"`, `"blankTextComment"`, `"blankImageComment"`

### 常见错误与正确用法

```javascript
// ❌ 错误1：对 MNComments 元素再次调用 getCommentType
let commentType = MNComment.getCommentType(note.MNComments[0]);

// ✅ 正确：直接使用 type 属性（已经是细分类型）
let commentType = note.MNComments[0].type;

// ❌ 错误2：对原始 comments 使用细分类型判断
if (note.comments[0].type === "drawingComment") { } // 永远为 false

// ✅ 正确：对原始 comments 使用基础类型
if (note.comments[0].type === "PaintNote") { }
```

### 实际案例：判断手写评论

```javascript
// 推荐方法：使用 MNComments
function isHandwritingComment(note, index) {
  let commentType = note.MNComments[index].type;
  return commentType === "drawingComment" || 
         commentType === "imageCommentWithDrawing" || 
         commentType === "mergedImageCommentWithDrawing";
}

// 备选方法：使用原始 comments（更复杂）
function isHandwritingCommentAlt(note, index) {
  let comment = note.comments[index];
  if (comment.type === "PaintNote" || comment.type === "LinkNote") {
    let commentType = MNComment.getCommentType(comment);
    return commentType === "drawingComment" || 
           commentType === "imageCommentWithDrawing" || 
           commentType === "mergedImageCommentWithDrawing";
  }
  return false;
}
```

### 最佳实践
1. **优先使用 `note.MNComments`**：类型已细分，使用更方便
2. **避免重复调用 `getCommentType`**：MNComments 已经处理过了
3. **理解类型层次**：基础类型（5种） → 细分类型（15+种）
4. **调试技巧**：`MNUtil.log(note.MNComments[0])` 查看实际 type 值

### 影响范围
- 所有涉及评论类型判断的功能
- 特别是手写、图片、合并内容的识别

# Git 工作流规范

原则上不允许在未经我允许的情况下自己进行 git commit 和 push。

## GitHub Issue 工作流规范

### 概述
标准化的 GitHub 问题管理流程，确保问题追踪的专业性和可追溯性。

### 1. 问题发现与记录
当开发过程中发现问题时：
- 创建临时记录文件（如 `fix_summary.md`）
- 详细记录：
  - 问题现象
  - 复现步骤
  - 原因分析
  - 解决方案

### 2. 代码修复流程
- 在本地分支进行修复
- 确保修复经过充分测试
- 保持代码改动的原子性（一个提交解决一个问题）
- 避免在一个提交中混杂多个不相关的修改

### 3. 提交规范
```bash
# 1. 添加修改的文件
git add [修改的文件]

# 2. 创建语义化提交
git commit -m "fix: 简要描述修复内容

- 详细说明修复的问题 (#issue-number)
- 列出主要改动点
- 说明影响范围"

# 3. 推送到远程仓库
git push [remote-name] [branch-name]
```

### 4. 创建 Issue
**重要原则**：必须在代码提交并推送后才创建 issue

```bash
gh issue create \
  --title "[插件名] 问题简要描述" \
  --body "## 问题描述
详细描述问题现象...

## 复现步骤
1. 步骤一
2. 步骤二
3. ...

## 原因分析
说明问题的根本原因...

## 解决方案
描述采用的解决方案...

## 相关代码
- 修复位置：[GitHub 代码永久链接]
- Commit: [commit hash]

## 修复状态
✅ 已在 [branch] 分支修复" \
  --label "插件名" \
  --label "bug/feature/enhancement"
```

### 5. Issue 更新最佳实践

#### 使用代码永久链接
```
https://github.com/[用户名]/[仓库名]/blob/[commit-hash]/[文件路径]#L[行号]
```
示例：
```
https://github.com/xkwxdyy/MN-Addons/blob/0a16a5805278ffa676a7365c22361e94d16d1876/mntask/xdyy_utils_extensions.js#L538-L546
```

#### 更新 Issue 评论
```bash
gh issue comment [issue-number] --body "已在 commit [hash] 中修复

### 相关代码链接：
- [具体修复描述]：[代码永久链接]

### 修复说明：
[详细说明修复的内容]"
```

### 6. 关闭 Issue
```bash
# 验证修复后关闭
gh issue close [issue-number] --comment "已修复并验证通过"

# 或者简单关闭
gh issue close [issue-number]
```

### 7. 完整工作流示例

以 TaskFieldUtils 方法名冲突问题为例：

1. **发现问题**：字段内容提取全部返回 null
2. **分析原因**：发现存在同名方法导致覆盖
3. **本地修复**：将方法重命名为 `extractFieldText`
4. **测试验证**：确认字段内容能正确提取
5. **提交代码**：
   ```bash
   git add xdyy_utils_extensions.js
   git commit -m "fix: 修复 TaskFieldUtils 方法名冲突导致字段提取失败 (#3)"
   git push github dev
   ```
6. **创建 Issue**：包含问题描述、原因分析、解决方案
7. **更新 Issue**：添加具体的代码链接
8. **关闭 Issue**：确认修复后关闭

### 8. 注意事项

#### 标签使用规范
- **插件标签**：必须添加（如 `mntask`、`mnai`）
- **类型标签**：
  - `bug`：错误修复
  - `feature`：新功能
  - `enhancement`：功能改进
  - `documentation`：文档更新

#### 代码链接要求
- 使用包含 commit hash 的永久链接
- 链接到具体的代码行或代码块
- 多个相关位置都要提供链接

#### Issue 描述规范
- 标题简洁明了，包含插件名
- 正文结构化，使用 Markdown 格式
- 包含足够的上下文信息
- 提供复现步骤（如适用）

#### 时机把握
- **先代码后 Issue**：确保 Issue 创建时代码已经在仓库中
- **及时更新**：重要进展及时更新到 Issue 评论中
- **及时关闭**：问题解决后及时关闭，避免积压

### 9. 批量处理技巧

当一次修复多个相关问题时：
```bash
# 1. 一次提交修复多个问题
git commit -m "fix: 修复 MNTask 制卡功能的多个问题

- 修复问题 A (#1)
- 修复问题 B (#2)
- 修复问题 C (#3)"

# 2. 分别更新各个 Issue
for issue in 1 2 3; do
  gh issue comment $issue --body "已在 commit [hash] 中修复
  相关代码：[对应的代码链接]"
done

# 3. 批量关闭
gh issue close 1 2 3
```

### 10. 文档维护

- 重要问题的解决方案应记录到 CLAUDE.md
- 通用性的解决方案可以整理成最佳实践
- 定期回顾和更新文档，保持其时效性

## Git 操作重要提醒（2025-01-17）

### 关键事项
1. **提交后必须 push**：完成 git commit 后，一定要记得执行 git push 推送到远程仓库
2. **远程仓库名称**：MN-Addon 项目的远程仓库名是 `github`，不是默认的 `origin`

### 正确的 Git 工作流
```bash
# 1. 添加文件
git add [文件名]

# 2. 提交更改
git commit -m "提交信息"

# 3. 推送到远程仓库（重要！）
git push github [分支名]  # 注意：是 github 而不是 origin
```

### 常见错误
```bash
# ❌ 错误：使用 origin
git push origin dev  # 会报错：'origin' does not appear to be a git repository

# ✅ 正确：使用 github
git push github dev
```

### 检查远程仓库配置
```bash
# 查看当前配置的远程仓库
git remote -v

# 输出示例：
# github  https://github.com/xkwxdyy/MN-Addons.git (fetch)
# github  https://github.com/xkwxdyy/MN-Addons.git (push)
```

### 重要提醒
- 在创建 GitHub Issue 之前，确保代码已经推送到远程仓库
- 使用 `git push github [分支名]` 而不是 `git push origin [分支名]`
- 如果忘记 push，Issue 中引用的代码链接将无法访问
## UIAlertView API 使用规范(极其重要!⚠️)

### ❌ 禁止使用

**错误示例(永远不要这样写):**

```javascript
// ❌ 错误:使用 UIAlertView.show()
UIAlertView.show(
  "标题",
  "消息",
  "取消",
  ["选项1", "选项2"],
  (alert, buttonIndex) => {
    if (buttonIndex === 0) return  // 取消
    // 处理逻辑
  }
)
```

**问题:**
- `UIAlertView.show()` 是低层级原生 API，不应直接使用
- 使用回调模式，容易产生回调地狱
- 不符合 MarginNote 插件开发规范

### ✅ 正确使用:MNUtil.userSelect

**正确示例(推荐):**

```javascript
// ✅ 正确:使用 MNUtil.userSelect()
let selected = await MNUtil.userSelect(
  "标题",
  "消息",
  ["选项1", "选项2"]
)

// 返回值说明:
// 0 = 取消
// 1 = 选项1
// 2 = 选项2
// ...

if (selected === 0) return  // 用户取消

// 处理选择
let selectedIndex = selected - 1  // 转换为 0-based 索引
MNUtil.showHUD(`选择了: ${options[selectedIndex]}`)
```

**实际案例:批量转移功能**

```javascript
// webviewController.js:2993-3096
transferSelectedPins: async function(button) {
  try {
    // 检查是否有选中项
    let selectedCards = self.getSelectedCards()
    if (selectedCards.length === 0) {
      MNUtil.showHUD("请先选中至少一个项目")
      return
    }

    // 获取目标分区列表
    let currentSection = self.currentSection
    let allSections = SectionRegistry.getOrderedKeys(self.currentViewMode)

    let sectionOptions = []
    let sectionKeys = []

    allSections.forEach(sectionKey => {
      let config = SectionRegistry.getConfig(sectionKey)
      if (config) {
        let displayName = config.displayName || sectionKey
        let icon = config.icon || ""

        if (sectionKey === currentSection) {
          sectionOptions.push(`${icon} ${displayName} (当前)`)
        } else {
          sectionOptions.push(`${icon} ${displayName}`)
        }
        sectionKeys.push(sectionKey)
      }
    })

    // ✅ 使用 MNUtil.userSelect 替代 UIAlertView.show
    let selected = await MNUtil.userSelect(
      `批量转移 (已选 ${selectedCards.length} 项)`,
      "请选择目标分区",
      sectionOptions
    )

    // 用户取消
    if (selected === 0) return

    // 获取选中的分区索引(selected - 1，因为返回值从1开始)
    let selectedIndex = selected - 1
    let targetSection = sectionKeys[selectedIndex]

    // 检查是否选择了当前分区
    if (targetSection === currentSection) {
      MNUtil.showHUD("无法转移到当前分区")
      return
    }

    // 执行批量转移
    let successCount = 0
    let failCount = 0

    MNUtil.undoGrouping(() => {
      selectedCards.forEach(card => {
        let success = pinnerConfig.transferPin(
          card.rawPin,
          card.section,
          targetSection
        )

        if (success) {
          successCount++
        } else {
          failCount++
        }
      })
    })

    // 显示结果
    if (failCount === 0) {
      MNUtil.showHUD(`✅ 已转移 ${successCount} 个项目`)
    } else {
      MNUtil.showHUD(`⚠️ 成功 ${successCount} 个，失败 ${failCount} 个`)
    }

    // 清空选择并刷新界面
    self.clearSelection()
    self.refreshSectionCards(currentSection)

  } catch (error) {
    pinnerUtils.addErrorLog(error, "transferSelectedPins")
    MNUtil.showHUD("转移失败: " + error.message)
  }
}
```

### ✅ 特殊情况:需要输入 + 选择

**唯一允许的 UIAlertView 直接调用场景:**

当需要**同时支持输入和选择**时，可以使用完整的原生 API:

```javascript
// ✅ 可以接受:需要输入框 + 多个选择按钮
UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock(
  "修改页面标题",
  "输入标题或选择预设短语",
  2,  // alertViewStyle = 2(文本输入框)
  "取消",
  ["确定", "预设1", "预设2"],  // 多个选项按钮
  (alert, buttonIndex) => {
    if (buttonIndex === 0) return  // 取消

    let inputText = alert.textFieldAtIndex(0).text.trim()

    if (buttonIndex === 1) {
      // 确定按钮 - 使用输入框内容
      // ...
    } else {
      // 选择了预设短语
      let preset = presets[buttonIndex - 2]
      // ...
    }
  }
)
```

**使用条件:**
- 必须同时需要输入和选择功能
- 使用完整方法名:`UIAlertView.showWithTitleMessageStyleCancelButtonTitleOtherButtonTitlesTapBlock`
- **绝对不能用** `UIAlertView.show()`

### 对比表格

| API | 是否允许 | 适用场景 | 返回方式 |
|-----|---------|---------|---------|
| `UIAlertView.show()` | ❌ 禁止 | 无 | 回调 |
| `MNUtil.userSelect()` | ✅ 推荐 | 纯选择 | async/await |
| `UIAlertView.showWithTitle...TapBlock()` | ⚠️ 特殊情况 | 输入+选择 | 回调 |

### 重要提醒

1. **永远不要使用 `UIAlertView.show()`**
2. **优先使用 MNUtils 封装的 API**
3. **使用 async/await 代替回调模式**
4. **只在必须同时需要输入和选择时才使用原生 API**
5. **必须使用完整的方法名，而不是简写形式**

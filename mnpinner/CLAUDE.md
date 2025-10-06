# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# MNPinner 插件开发指南

## 插件概述

MNPinner 是一个 MarginNote 4 卡片置顶系统插件，提供浮动式卡片库功能，让用户能够快速访问重要卡片。

**核心功能**：
- 临时置顶卡片（已实现）
- 永久置顶卡片（待开发）
- 浮动面板支持拖动、调整大小、边缘吸附
- 与 mntoolbar 插件深度集成

## 开发命令

### 构建与打包
```bash
# 打包插件
mnaddon4 build mnpinner

# 解包插件（调试用）
mnaddon4 unpack mnpinner_v0_10.mnaddon
```

### 调试
```javascript
// 使用 pinnerUtils 的错误日志系统
pinnerUtils.addErrorLog("错误信息", error);

// 查看日志（会自动复制到剪贴板）
MNUtil.log(pinnerUtils.errorLogs);
```

## 架构设计

### 三层架构

```
main.js (MNPinner)          # 生命周期管理
    ↓
utils.js (pinnerConfig)     # 数据持久化
    ↓
webviewController.js        # UI 控制器
(pinnerController)
```

### 关键类职责

1. **MNPinner** - 插件主类
   - 管理生命周期（窗口打开/关闭）
   - 处理插件间通信（AddonBroadcast）
   - 管理菜单项

2. **pinnerConfig** - 数据管理
   - NSUserDefaults 存储（键：`MNPinner_sections`）
   - 分区管理（focus, 中间知识）
   - 置顶卡片 CRUD 操作
   - 导入/导出配置

3. **pinnerController** - UI 控制器
   - 浮动面板管理（显示/隐藏/动画）
   - 手势处理（拖动/调整大小/长按）
   - 卡片列表渲染

### 插件间通信协议

**接收来自 mntoolbar 的消息**：
// 消息格式
`marginnote4app://addon/mnpinner?action=ACTION&id=NOTEID&title=TITLE&section=SECTION`

// 支持的 action：
- pin               # 添加卡片到指定分区（section参数可选，默认"midway"）
- temporarilyPin    # 添加到中间知识（兼容旧版）
- showPinBoard      # 显示置顶面板

**处理位置**：`main.js:219-277` (onAddonBroadcast)

## 关键实现细节

### 浮动面板系统

**核心特性**：
1. **可拖动** - 通过顶部移动按钮
2. **可调整大小** - 右下角调整按钮
3. **边缘吸附** - 拖动到边缘40px内自动最小化
4. **动画过渡** - 使用 MNUtil.animate 实现平滑动画

**关键方法**：
```javascript
// 显示/隐藏面板
pinnerController.show(frame)
pinnerController.hide(frame)

// 最小化模式
pinnerController.toMinimode(frame)
pinnerController.fromMinimode()
```

### 数据结构

**置顶卡片数据**：
```javascript
{
  noteId: string,    // 卡片ID
  title: string,     // 显示标题（可自定义）
  pinnedAt: number   // 时间戳（未使用）
}
```

### UI 操作映射

| 操作 | 方法 | 说明 |
|------|------|------|
| 📍 聚焦 | `focusOnNote()` | 跳转到脑图中的卡片 |
| ✏️ 重命名 | `renamePin()` | 修改显示标题 |
| ⬆️ 上移 | `moveUp()` | 长按移到顶部 |
| ⬇️ 下移 | `moveDown()` | 长按移到底部 |
| 🗑 删除 | `removePin()` | 从列表移除 |

## 依赖关系

### MNUtils 框架（必需）

**初始化**：
```javascript
MNUtil.init(self.path);  // main.js:39
```

**常用 API**：
- `MNUtil.showHUD()` - 显示提示
- `MNUtil.animate()` - 动画控制
- `MNUtil.studyView` - 获取学习视图
- `MNNote.new(noteId)` - 创建笔记对象
- `MNButton.setConfig()` - 配置按钮

### iOS UIKit（通过 JSBridge）

直接使用的 iOS 组件：
- UIView, UIButton, UIScrollView
- UIViewController
- NSUserDefaults
- 手势识别器（UIPanGestureRecognizer, UILongPressGestureRecognizer）

## 开发注意事项

### 重要约定

1. **禁止使用** `let self = this` - 直接使用全局 `self`
2. **单例模式** - pinnerController 只创建一次
3. **错误处理** - 使用 `pinnerUtils.addErrorLog()`
4. **动画锁** - 使用 `onAnimate` 标志防止动画冲突

### 常见问题与解决方案

**问题 1：iPad 闪退**
- 原因：某些静态初始化导致
- 解决：移除有问题的静态初始化器

**问题 2：刷新时闪烁**
- 原因：频繁的 DOM 重建
- 解决：使用差异更新，仅更新变化部分

**问题 3：边缘吸附不灵敏**
- 原因：判断距离过小
- 解决：增加到 40px 判断范围

## 扩展开发指南

### 添加新的置顶类型

1. 在 `pinnerConfig` 中添加新的存储键：
```javascript
static get KEY_NEW_PINS() { return "MNPinner_newPins" }
```

2. 实现对应的 CRUD 方法：
```javascript
static addNewPin(noteId, title) { /* ... */ }
static removeNewPin(noteId) { /* ... */ }
```

3. 在 `pinnerController` 中添加新标签页：
```javascript
case 2: // 新类型
  this.currentTab = 2;
  this.refreshNewPins();
  break;
```

### 与其他插件集成

发送置顶请求到 mnpinner：
```javascript
// 在你的插件中（推荐新方式）
const url = `marginnote4app://addon/mnpinner?action=pin&id=${noteId}&title=${encodeURIComponent(title)}&section=focus`;
Application.sharedInstance().openURL(NSURL.URLWithString(url));

// 兼容旧版（自动添加到中间知识）
const url = `marginnote4app://addon/mnpinner?action=temporarilyPin&id=${noteId}&title=${encodeURIComponent(title)}`;
Application.sharedInstance().openURL(NSURL.URLWithString(url));
```

## 版本历史关键更新

- **v1.0.0** - 多分区支持（focus/中间知识）、卡片转移功能
- **v0.10** - 添加卡片顺序调整、长按手势
- **v0.9** - 修复 iPad 闪退问题
- **v0.8** - 添加边缘吸附功能
- **v0.7** - 添加调整大小功能
- **v0.6** - 基础浮动面板实现

## 待开发功能

1. **搜索功能** - 搜索框已存在但未连接
2. **更多分区** - 可扩展更多分区类型
3. **分组管理** - 支持卡片分组
4. **批量操作** - 多选删除/移动
5. **WebView 集成** - index.html 未使用
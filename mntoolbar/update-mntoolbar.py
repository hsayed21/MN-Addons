#!/usr/bin/env python3
"""
MN Toolbar Pro 更新脚本（精简版）
功能：
1. 自动查找最新版本的 .mnaddon 文件
2. 解包并更新到 mntoolbar 和 mntoolbar_official 目录
3. 保留用户的自定义修改
4. 智能处理版本冲突
"""

import os
import re
import subprocess
import shutil
import filecmp

class MNToolbarUpdater:
    def __init__(self):
        self.current_dir = os.getcwd()
        self.mntoolbar_dir = os.path.join(self.current_dir, 'mntoolbar')
        self.official_dir = os.path.join(self.current_dir, 'mntoolbar_official')
        
        # 用户自定义文件列表
        self.user_custom_files = {
            'xdyy_utils_extensions.js',
            'xdyy_custom_actions_registry.js',
            'xdyy_menu_registry.js',
            'xdyy_button_registry.js'
        }
        
        # 需要保留用户修改的文件及其修改点
        self.user_modifications = {
            'main.js': [
                {
                    'type': 'insert_after',
                    'marker': 'JSB.require(\'utils\')',
                    'content': '  JSB.require(\'xdyy_utils_extensions\')  // 加载工具函数扩展\n  JSB.require(\'pinyin\')'
                },
                {
                    'type': 'insert_after',
                    'marker': '  }\n  /** @return {MNToolbarClass} */',
                    'content': '''  
  // 加载自定义 actions 扩展（必须在 webviewController 之后）
  try {
    // 使用注册表方式，真正实现解耦
    JSB.require('xdyy_custom_actions_registry')
  } catch (error) {
    // 加载错误不应该影响插件主功能
    if (typeof MNUtil !== 'undefined' && MNUtil.addErrorLog) {
      MNUtil.addErrorLog(error, "加载自定义 Actions")
    }
  }'''
                },
                {
                    'type': 'insert_before',
                    'marker': '        self.addonController.popupReplace()',
                    'content': '        self.ensureView() // 确保 addonController 已初始化',
                    'unique_context': 'onClosePopupMenuOnNote'
                },
                {
                    'type': 'insert_before',
                    'marker': '          self.addonController.popupReplace()',
                    'content': '          self.ensureView() // 确保 addonController 已初始化',
                    'unique_context': 'onPopupMenuOnNote'
                },
                {
                    'type': 'insert_after',
                    'marker': '  JSB.require(\'settingController\');',
                    'content': '''  
  // 加载自定义菜单注册表（必须在 utils 之后）
  try {
    JSB.require('xdyy_menu_registry')
  } catch (error) {
    // 加载错误不应该影响插件主功能
    if (typeof MNUtil !== 'undefined' && MNUtil.addErrorLog) {
      MNUtil.addErrorLog(error, "加载自定义菜单模板")
    }
  }
  // 加载按钮注册表（必须在 utils 之后）
  try {
    JSB.require('xdyy_button_registry')
  } catch (error) {
    // 加载错误不应该影响插件主功能
    if (typeof MNUtil !== 'undefined' && MNUtil.addErrorLog) {
      MNUtil.addErrorLog(error, "加载按钮注册表")
    }
  }'''
                },
                {
                    'type': 'insert_after',
                    'marker': '        MNUtil.addObserver(self, \'onAddonBroadcast:\', \'AddonBroadcast\');',
                    'content': '''        
        // 夏大鱼羊 - begin: 延迟刷新按钮配置，确保自定义扩展完全加载
        setTimeout(function() {
          if (typeof global !== 'undefined' && global.forceRefreshButtons) {
            if (typeof MNUtil !== 'undefined' && MNUtil.log) {
              MNUtil.log("🔄 延迟刷新按钮配置，确保自定义按钮生效");
            }
            global.forceRefreshButtons();
          }
        }, 1000);
        // 夏大鱼羊 - end'''
                },
                {
                    'type': 'insert_after',
                    'marker': '        self.studyView.becomeFirstResponder(); //For dismiss keyboard on iOS\n        })',
                    'content': '''        
        // 夏大鱼羊 - begin: 笔记本打开时也刷新按钮配置
        setTimeout(function() {
          if (typeof global !== 'undefined' && global.forceRefreshButtons) {
            if (typeof MNUtil !== 'undefined' && MNUtil.log) {
              MNUtil.log("🔄 笔记本打开，刷新自定义按钮配置");
            }
            global.forceRefreshButtons();
          }
        }, 500);
        // 夏大鱼羊 - end'''
                }
            ],
            'webviewController.js': [
                {
                    'type': 'wrap_code',
                    'start_marker': '    if (actionName.includes("color")) {',
                    'end_marker': '    // self["ColorButton"+index].contentHorizontalAlignment = 1',
                    'wrapper_start': '    if (actionName){',
                    'wrapper_end': '    }'
                },
                {
                    'type': 'insert_after',
                    'marker': '    let focusNote = undefined',
                    'content': '    let focusNotes = []',
                    'context': 'customActionByDes'
                },
                {
                    'type': 'replace',
                    'old': '''    try {
      focusNote = MNNote.getFocusNote()
    } catch (error) {
    }''',
                    'new': '''    try {
      focusNote = MNNote.getFocusNote()
      focusNotes = MNNote.getFocusNotes()
    } catch (error) {
    }''',
                    'context': 'customActionByDes'
                },
                {
                    'type': 'replace',
                    'old': '''      default:
        MNUtil.showHUD("Not supported yet...")
        break;''',
                    'new': '''      default:
        // 检查是否是自定义 action
        if (typeof global !== 'undefined' && global.executeCustomAction) {
          const context = {
            button: button,
            des: des,
            focusNote: focusNote,
            focusNotes: focusNotes,
            self: this
          };
          const handled = await global.executeCustomAction(des.action, context);
          if (handled) {
            // 自定义 action 已处理
            break;
          }
        }
        MNUtil.showHUD("Not supported yet...")
        break;'''
                }
            ],
            'utils.js': [
                {
                    'type': 'insert_after',
                    'marker': '    this.addonLogos = this.getByDefault("MNToolbar_addonLogos",{})',
                    'content': '''    // 夏大鱼羊 - begin：用来存参考文献的数据
    toolbarConfig.referenceIds = this.getByDefault("MNToolbar_referenceIds", {})
    // 夏大鱼羊 - end'''
                },
                {
                    'type': 'insert_after',
                    'marker': '  lastModifyTime: 0\n  }',
                    'content': '''  // 夏大鱼羊 - begin: 默认 OCR 源和翻译模型配置
  static defaultOCRSource = "Doc2X"  // 默认 OCR 源
  static defaultTranslateModel = "gpt-4o-mini"  // 默认翻译模型
  // 夏大鱼羊 - end'''
                },
                {
                    'type': 'insert_after',
                    'marker': '    this.syncConfig = this.getByDefault("MNToolbar_syncConfig", this.defaultSyncConfig)',
                    'content': '''    
    // 夏大鱼羊 - begin: 初始化 OCR 源和翻译模型配置
    this.ocrSource = this.getByDefault("MNToolbar_ocrSource", this.defaultOCRSource)
    this.translateModel = this.getByDefault("MNToolbar_translateModel", this.defaultTranslateModel)
    // 夏大鱼羊 - end'''
                },
                {
                    'type': 'insert_after',
                    'marker': '      addonLogos: this.addonLogos,',
                    'content': '      referenceIds:this.referenceIds,'
                },
                {
                    'type': 'replace',
                    'old': '      popupConfig:this.popupConfig',
                    'new': '''      popupConfig:this.popupConfig,
      // 夏大鱼羊 - begin: 添加 OCR 源和翻译模型配置
      ocrSource: this.ocrSource,
      translateModel: this.translateModel
      // 夏大鱼羊 - end'''
                },
                {
                    'type': 'insert_after',
                    'marker': '    this.addonLogos = config.addonLogos',
                    'content': '    this.referenceIds = config.referenceIds'
                },
                {
                    'type': 'insert_after',
                    'marker': '    this.popupConfig = config.popupConfig',
                    'content': '''    // 夏大鱼羊 - begin: 导入 OCR 源和翻译模型配置
    if (config.ocrSource) this.ocrSource = config.ocrSource
    if (config.translateModel) this.translateModel = config.translateModel
    // 夏大鱼羊 - end'''
                },
                {
                    'type': 'insert_after',
                    'marker': '    defaults.setObjectForKey(this.addonLogos,"MNToolbar_addonLogos")',
                    'content': '    defaults.setObjectForKey(this.referenceIds,"MNToolbar_referenceIds")'
                },
                {
                    'type': 'insert_after',
                    'marker': '    defaults.setObjectForKey(this.syncConfig,"MNToolbar_syncConfig")',
                    'content': '''    // 夏大鱼羊 - begin: 保存 OCR 源和翻译模型配置
    defaults.setObjectForKey(this.ocrSource,"MNToolbar_ocrSource")
    defaults.setObjectForKey(this.translateModel,"MNToolbar_translateModel")
    // 夏大鱼羊 - end'''
                },
                {
                    'type': 'insert_after',
                    'marker': '    switch (key) {',
                    'content': '''      case "MNToolbar_referenceIds":
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.referenceIds,key)
        break;'''
                },
                {
                    'type': 'insert_after',
                    'marker': '      case "MNToolbar_syncConfig":\n        NSUserDefaults.standardUserDefaults().setObjectForKey(this.syncConfig,key)\n        break;',
                    'content': '''      // 夏大鱼羊 - begin: 处理 OCR 源和翻译模型配置
      case "MNToolbar_ocrSource":
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.ocrSource,key)
        break;
      case "MNToolbar_translateModel":
        NSUserDefaults.standardUserDefaults().setObjectForKey(this.translateModel,key)
        break;
      // 夏大鱼羊 - end'''
                },
                {
                    'type': 'replace',
                    'old': '''      default:
        MNUtil.showHUD("Not supported yet...")
        break;''',
                    'new': '''      default:
        // 检查是否是自定义 action
        if (typeof global !== 'undefined' && global.executeCustomAction) {
          const context = {
            button: button,
            des: des,
            focusNote: focusNote,
            focusNotes: MNNote.getFocusNotes(),
            self: controller
          };
          const handled = await global.executeCustomAction(des.action, context);
          if (handled) {
            // 自定义 action 已处理
            break;
          }
        }
        MNUtil.showHUD("Not supported yet...")
        break;''',
                    'context': 'customActionByDes'
                },
                {
                    'type': 'append_to_file',
                    'content': '''

// 加载夏大鱼羊的扩展文件
JSB.require('xdyy_utils_extensions')

// 初始化夏大鱼羊的扩展
if (typeof initXDYYExtensions === 'function') {
  initXDYYExtensions()
}
if (typeof extendToolbarConfigInit === 'function') {
  extendToolbarConfigInit()
}'''
                },
                {
                    'type': 'replace_section',
                    'start_marker': '    "custom11":{name:"Custom 11",image:"custom11",description: this.template("cloneAndMerge")},',
                    'end_marker': '    "custom11":{name:"Custom 11",image:"custom11",description: this.template("cloneAndMerge")},',
                    'replacement': '    // custom11 通过 xdyy_button_registry.js 定义为搜索功能',
                    'description': '移除 custom11 的默认定义，让自定义配置生效'
                },
                {
                    'type': 'replace_section',
                    'start_marker': '    "custom20":{name:"Custom 20",image:"custom20",description: this.template("removeComment")},',
                    'end_marker': '    "custom20":{name:"Custom 20",image:"custom20",description: this.template("removeComment")},',
                    'replacement': '    // custom20 通过 xdyy_button_registry.js 定义为 HtmlMarkdown 评论功能',
                    'description': '移除 custom20 的默认定义，让自定义配置生效'
                }
            ],
            'settingController.js': [
                {
                    'type': 'insert_after',
                    'marker': '      let action = toolbarConfig.getAction(actionKey)',
                    'content': '''      // 添加防御性检查
      if (!action) {
        if (typeof MNUtil !== "undefined" && MNUtil.log) {
          MNUtil.log(`⚠️ setTextview: 获取按钮配置失败 - ${actionKey}`);
        }
        action = { name: actionKey, description: "{}" };
      }'''
                }
            ],
            'jsconfig.json': [
                {
                    'type': 'replace_whole_file',
                    'content': '''{
  "compilerOptions": {
    "target": "ES2015",
    "module": "commonjs",
    "lib": ["ES2015", "ES2017", "ES2019", "ES2020"],
    "checkJs": false,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "*": ["./*"]
    }
  },
  "include": [
    "main.js",
    "webviewController.js",
    "settingController.js",
    "utils.js",
    "xdyy_utils_extensions.js",
    "xdyy_custom_actions_registry.js",
    "xdyy_button_registry.js",
    "xdyy_menu_registry.js"
  ],
  "exclude": [
    "/Users/linlifei/extension/FeliksPro/.out/index.d.ts",
    "node_modules",
    "*.mnaddon"
  ]
}'''
                }
            ]
        }
        
    def find_latest_addon(self):
        """查找最新版本的 .mnaddon 文件"""
        addon_files = [f for f in os.listdir('.') if f.endswith('.mnaddon')]
        
        if not addon_files:
            print("❌ 未找到任何 .mnaddon 文件")
            return None
            
        # 版本号正则：mntoolbar_v{x}_{y}_{z}[_alpha{n}].mnaddon
        pattern = r"mntoolbar_v(\d+)_(\d+)_(\d+)(?:_alpha(\d+))?\.mnaddon"
        
        versions = []
        for addon_file in addon_files:
            match = re.match(pattern, addon_file)
            if match:
                x, y, z = int(match.group(1)), int(match.group(2)), int(match.group(3))
                alpha = int(match.group(4)) if match.group(4) else float('inf')  # 正式版优先
                versions.append((x, y, z, alpha, addon_file))
        
        if not versions:
            print("❌ 未找到符合命名规范的插件文件")
            return None
            
        # 按版本号排序，取最新版本
        versions.sort(reverse=True)
        latest = versions[0]
        
        version_str = f"v{latest[0]}.{latest[1]}.{latest[2]}"
        if latest[3] != float('inf'):
            version_str += f" alpha{latest[3]}"
            
        print(f"✅ 找到最新版本：{latest[4]} ({version_str})")
        return os.path.join(self.current_dir, latest[4])
        
    def unpack_addon(self, addon_path, target_dir):
        """解包 .mnaddon 文件"""
        # 如果目标目录存在，先删除
        if os.path.exists(target_dir):
            shutil.rmtree(target_dir)
            
        try:
            print(f"📦 正在解包：{os.path.basename(addon_path)}")
            result = subprocess.run(
                f"mnaddon4 unpack {addon_path}", 
                shell=True, 
                capture_output=True, 
                text=True
            )
            
            if result.returncode != 0:
                print(f"❌ 解包失败：{result.stderr}")
                return False
                
            print("✅ 解包成功")
            return True
            
        except Exception as e:
            print(f"❌ 解包出错：{e}")
            return False
            
    def apply_user_modifications(self, file_path):
        """应用用户的修改到文件"""
        filename = os.path.basename(file_path)
        if filename not in self.user_modifications:
            return False
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        modifications = self.user_modifications[filename]
        applied_count = 0
        
        for mod in modifications:
            try:
                if mod['type'] == 'insert_after':
                    # 检查是否需要根据上下文来确定插入位置
                    if 'context' in mod:
                        # 使用上下文查找正确的位置
                        pattern = re.escape(mod['marker'])
                        context_pattern = re.escape(mod['context'])
                        # 查找包含上下文的区域
                        full_pattern = f"({pattern}.*?{context_pattern})"
                        match = re.search(full_pattern, content, re.DOTALL)
                        if match:
                            # 在这个区域内找到具体的插入点
                            region = match.group(0)
                            if mod['marker'] in region:
                                # 在区域内替换
                                new_region = region.replace(mod['marker'], mod['marker'] + '\n' + mod['content'])
                                content = content.replace(region, new_region)
                                applied_count += 1
                    else:
                        # 简单插入
                        if mod['marker'] in content and mod['content'] not in content:
                            content = content.replace(mod['marker'], mod['marker'] + '\n' + mod['content'])
                            applied_count += 1
                            
                elif mod['type'] == 'insert_before':
                    if 'unique_context' in mod:
                        # 使用唯一上下文来确定位置
                        context = mod['unique_context']
                        pattern = f"({context}.*?{re.escape(mod['marker'])})"
                        match = re.search(pattern, content, re.DOTALL)
                        if match and mod['content'] not in content:
                            old_text = match.group(0)
                            new_text = old_text.replace(mod['marker'], mod['content'] + '\n' + mod['marker'])
                            content = content.replace(old_text, new_text)
                            applied_count += 1
                    else:
                        if mod['marker'] in content and mod['content'] not in content:
                            content = content.replace(mod['marker'], mod['content'] + '\n' + mod['marker'])
                            applied_count += 1
                        
                elif mod['type'] == 'wrap_code':
                    # 查找需要包装的代码块
                    start_pattern = re.escape(mod['start_marker'])
                    end_pattern = re.escape(mod['end_marker'])
                    pattern = f"({start_pattern}.*?{end_pattern})"
                    
                    match = re.search(pattern, content, re.DOTALL)
                    if match and mod['wrapper_start'] not in content:
                        wrapped_code = match.group(1)
                        new_code = mod['wrapper_start'] + '\n' + wrapped_code + '\n' + mod['wrapper_end']
                        content = content.replace(wrapped_code, new_code)
                        applied_count += 1
                        
                elif mod['type'] == 'replace':
                    if mod['old'] in content:
                        content = content.replace(mod['old'], mod['new'])
                        applied_count += 1
                        
                elif mod['type'] == 'replace_section':
                    # 替换整个代码段
                    if mod['old_content'] in content:
                        content = content.replace(mod['old_content'], mod['new_content'])
                        applied_count += 1
                        
                elif mod['type'] == 'replace_whole_file':
                    # 替换整个文件内容
                    content = mod['content']
                    applied_count += 1
                    
                elif mod['type'] == 'append_to_file':
                    # 添加内容到文件末尾
                    if mod['content'] not in content:
                        content = content.rstrip() + mod['content']
                        applied_count += 1
                        
            except Exception as e:
                print(f"  ⚠️ 应用修改失败：{str(e)[:50]}")
                
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            if applied_count > 0:
                print(f"  ✏️ 已应用 {applied_count} 个修改")
                    
            return True
            
        return False
        
    def update_directory(self, new_version_path, target_dir, is_dev=True):
        """更新目标目录"""
        print(f"\n{'='*50}")
        print(f"📁 更新目录：{os.path.basename(target_dir)}")
        print(f"{'='*50}\n")
        
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            
        updated_files = []
        skipped_files = []
        new_files = []
        
        # 获取所有需要更新的文件
        for file in os.listdir(new_version_path):
            if file.endswith(('.js', '.html', '.json', '.css', '.svg', '.png')):
                new_file = os.path.join(new_version_path, file)
                old_file = os.path.join(target_dir, file)
                
                # 开发目录跳过用户自定义文件
                if is_dev and file in self.user_custom_files:
                    print(f"⏭️  跳过用户文件：{file}")
                    skipped_files.append(file)
                    continue
                    
                # 检查文件是否存在
                if os.path.exists(old_file):
                    # PNG 文件特殊处理：如果已存在则跳过，不替换
                    if file.endswith('.png'):
                        print(f"⏭️  保留已有图片：{file}")
                        skipped_files.append(file)
                        continue
                    
                    # 其他文件比较是否相同
                    if filecmp.cmp(new_file, old_file):
                        skipped_files.append(file)
                        continue
                        
                    print(f"📝 更新文件：{file}")
                    updated_files.append(file)
                else:
                    # 文件不存在，新增
                    if file.endswith('.png'):
                        print(f"➕ 新增图片：{file}")
                    else:
                        print(f"➕ 新增文件：{file}")
                    new_files.append(file)
                    
                # 复制文件（PNG 已存在时已在上面跳过，不会执行到这里）
                shutil.copy2(new_file, old_file)
                
        # 应用用户修改（仅在开发目录）
        if is_dev:
            print("\n🔧 应用用户修改...")
            for modified_file in self.user_modifications:
                file_path = os.path.join(target_dir, modified_file)
                if os.path.exists(file_path):
                    print(f"  处理 {modified_file}...")
                    self.apply_user_modifications(file_path)
                    
        # 应用文本替换（仅在开发目录）
        if is_dev:
            self.apply_text_replacements(target_dir)
            
        # 输出统计
        print(f"\n📊 更新统计：")
        print(f"  - 更新文件：{len(updated_files)} 个")
        print(f"  - 跳过文件：{len(skipped_files)} 个")
        print(f"  - 新增文件：{len(new_files)} 个")
            
    def apply_text_replacements(self, target_dir):
        """应用文本替换"""
        replacements = {
            'foucsNote': 'focusNote',  # 修复拼写错误
        }
        
        replaced_count = 0
        
        for file in os.listdir(target_dir):
            if file.endswith('.js'):
                file_path = os.path.join(target_dir, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                new_content = content
                for old_text, new_text in replacements.items():
                    new_content = new_content.replace(old_text, new_text)
                    
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    replaced_count += 1
                    
        if replaced_count > 0:
            print(f"🔧 已修复拼写错误：{replaced_count} 个文件")
            
    def run(self):
        """执行更新流程"""
        print("🚀 MN Toolbar Pro 更新脚本启动\n")
        
        # 1. 查找最新版本
        addon_path = self.find_latest_addon()
        if not addon_path:
            return
        
        # 2. 解包新版本
        new_version_path = addon_path.replace('.mnaddon', '')
        if not self.unpack_addon(addon_path, new_version_path):
            return
        
        # 3. 更新官方备份目录
        self.update_directory(new_version_path, self.official_dir, is_dev=False)
        
        # 4. 再次解包（因为更新过程可能修改了文件）
        shutil.rmtree(new_version_path)
        if not self.unpack_addon(addon_path, new_version_path):
            return
        
        # 5. 更新开发目录
        self.update_directory(new_version_path, self.mntoolbar_dir, is_dev=True)
        
        # 6. 清理临时文件
        if os.path.exists(new_version_path):
            shutil.rmtree(new_version_path)
        
        print("\n✅ 更新完成！")
        print("💡 提示：请测试功能是否正常")

if __name__ == "__main__":
    updater = MNToolbarUpdater()
    updater.run()
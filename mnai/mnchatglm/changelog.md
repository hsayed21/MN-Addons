
改进函数调用的问题
改进视觉模型识别的问题

改进导入Prompt示例的弹窗内容
尝试修复脑图为空时的bug
修复一个工具调用问题
优化变量渲染性能

通知模式下AI生成内容结束后发送通知MNCatAINotoficationResponse
变量模板增加timer系列
修复一些bug
支持魔搭源
尝试提供一个api：chatAIUtils.ask()

改进{{card}}变量的结构组织
改进模型刷新的问题

改进getToolsByIndex的逻辑和报错
提供一个参数：narrowMode
editNote工具支持传入指定noteId，可以实现同时编辑多个卡片
添加变量的菜单中增加一个打开模板变量文档的选项

改进文档解析的报错逻辑
修复开启视觉模式后变量失效的问题
修复不能正常识别卡片中markdown图片的问题
保存dynamic的系统提示词时增加变量检查

聊天模式的图片默认使用jpeg格式
修复通过toolbar调用的回答一直提示的问题

尝试改进公式渲染问题
修复模型刷新失败可能导致的一些问题
改进dynamic关闭情况下的一些bug
改进自动视觉模式的逻辑，并提高性能
改进输入窗口高度的自动变化
修复文档上选中文字后小机器人窗口消失的问题

支持创建带有答案的问题卡片
尝试通过优化cdn改进白屏问题
更新视觉模式配置
优化报错
改进了未选中文本下点击复制按钮的行为

killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app"

pgrep -x "MarginNote 4" > /dev/null && (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app") || open "/Applications/MarginNote 4.app"

osascript -e 'tell application "MarginNote 4" to quit' && sleep 1 && open "/Applications/MarginNote 4.app" || (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app")


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

killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app"

pgrep -x "MarginNote 4" > /dev/null && (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app") || open "/Applications/MarginNote 4.app"

osascript -e 'tell application "MarginNote 4" to quit' && sleep 1 && open "/Applications/MarginNote 4.app" || (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app")



生图逻辑改进：
* 默认模型为cogview-3-flash
* 可选择模型：cogview-3-flash、cogview-4-250304、gemini-2.5-flash-image
* 其中gemini-2.5-flash-image为订阅可用，每次0.01积分
* 生图时自动调用MN Snipaste

修复切换生图模型按钮初始化错误的问题
生图模型新增MiniMax的Image-01和Image-01 Live以及OpenAI的gpt-image-1
* 其中gpt-image-1为订阅可用，每次0.01积分

在特定情况下的请求失败会触发重试机制
改进模型不支持多模态情况下的报错

改进重试和报错
修复一个异常检查订阅的问题

Knowledge改为独立标签页
新增AI整理知识库功能，目前仅支持glm-4.5-flash

部分订阅场景增加订阅提醒
改进AI整理知识库时的UI
改进自定义按钮设置Toolbar后的兼容性
修复一个删除卡片后可能导致的问题
修复函数调用导致无参数或执行失败的问题
尝试修复latex公式的问题
改进函数调用时的UI显示
修复一个不正确创建摘录的问题

支持自动检测模型是否支持图片输入并弹窗提醒
改进AutoOCR和AutoVision功能
修复上版本带来的一点工具调用bug
当对话的token消耗超过100k后，会弹窗提醒
改进聊天模式引用相关的逻辑
改进editNote工具，action支持：prependContent、prependTitle和prependComment

修改reranker模型
通过拖拽关闭按钮调整高度后，可临时将当前高度设定为最大高度，关闭窗口后解除限制

生图模型支持qwen-image
修复聊天模式冷启动的一些bug
增加更多的报错检测位置
聊天模式窗口自动置顶，防止被插件栏等遮挡
聊天模式UI优化

聊天模式UI优化
改进引用逻辑
修复选中图片/图片摘录情况下无法添加引用的问题
修复通过URL Scheme调起AI的问题
改进对留白卡片的兼容性，避免读取无效图片
readNotes工具支持读取特定笔记的内容（通过id或url）
修复organizeNotes的一些bug


killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app"

pgrep -x "MarginNote 4" > /dev/null && (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app") || open "/Applications/MarginNote 4.app"

osascript -e 'tell application "MarginNote 4" to quit' && sleep 1 && open "/Applications/MarginNote 4.app" || (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app")



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
killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app"

pgrep -x "MarginNote 4" > /dev/null && (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app") || open "/Applications/MarginNote 4.app"

osascript -e 'tell application "MarginNote 4" to quit' && sleep 1 && open "/Applications/MarginNote 4.app" || (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app")

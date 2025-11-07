
改进AI错误调用工具时的处理逻辑
{{context}}变量尝试兼容合并的卡片
新增工具executePrompt，用于实现prompt路由

修复一个解析响应的bug
action新增 Save to Chat History，用于在prompt执行完成后自动保存至聊天模式
改进聊天记录上传逻辑
killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app"

pgrep -x "MarginNote 4" > /dev/null && (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app") || open "/Applications/MarginNote 4.app"

osascript -e 'tell application "MarginNote 4" to quit' && sleep 1 && open "/Applications/MarginNote 4.app" || (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app")

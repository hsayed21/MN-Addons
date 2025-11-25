
改进AI错误调用工具时的处理逻辑
{{context}}变量尝试兼容合并的卡片
新增工具executePrompt，用于实现prompt路由

修复一个解析响应的bug
action新增 Save to Chat History，用于在prompt执行完成后将结果自动保存至聊天模式
改进聊天记录上传逻辑

聊天模式新增浮动模式（目前只能全屏），可以和侧边栏模式互转
改进视觉模型检测
新增源GLM Coding和Kimi Coding

修复minimax的函数调用问题
改进函数调用稳定性
新增模型路由功能,已支持Gemini，KimiCoding，ChatGLM，Volcengine

修复上一版本模型路由功能带来的bug

修复大胡子变量中note.parent只能调用到两个层级的问题，并支持无限层级（层级过高时可能会更耗费性能）
适配megallm的reasoning_text字段
改进card变量
增加currentSelection变量
优化变量渲染的资源消耗
改进默认提示词
支持对doubao-seed-code的模型路由
cogview-4-250304取消免费，每次绘图消耗0.06（官方价格，不建议使用）
webSearch工具的搜索引擎可选，其中search_std订阅下免费，search_pro系列每次调用消耗0.01积分
新增工具readImage（使用qwen3-omni-flash读图）,以解决非视觉模型不能读图的问题，以及视觉模型不能主动读图的问题
新增工具readURL,可以读取指定网页内容

适配Gemini3模型路由
修复生成html内容时双引号被错误转义的bug
为模型路由的热更新做准备
改进默认提示词
修复删除prompt后提示词内容没有及时更新的问题

超时时间增加到10分钟
增加一个源码模式，方便选取文本并拖拽出来

createNote支持comments参数
websearch模型支持设置为秘塔搜索（每次0.01积分），且秘塔搜索模式下支持由AI选择搜索范围（webpage,document,scholar,image,video,podcast）
readURL工具支持一次性读取多个结果，支持AI帮助总结网页内容以节省token消耗

websearch默认模型改为UAPI Search，无订阅限制，同时Search Std价格改为0.005
readURL模型改为UAPI URL Reader
修改使用qwen-image画图的问题
画图模型增加gemini-3-pro-image-preview和gemini-3-pro-image-preview-4k

killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app"

pgrep -x "MarginNote 4" > /dev/null && (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app") || open "/Applications/MarginNote 4.app"

osascript -e 'tell application "MarginNote 4" to quit' && sleep 1 && open "/Applications/MarginNote 4.app" || (killall "MarginNote 4" && sleep 1 && open "/Applications/MarginNote 4.app")

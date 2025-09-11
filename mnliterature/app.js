/**
 * app.js - 网页与 MarginNote 原生代码的通信逻辑
 * 
 * 这个文件负责：
 * 1. 接收来自原生代码的数据（通过 evaluateJavaScript 调用）
 * 2. 向原生代码发送请求（通过自定义 URL scheme）
 * 3. 管理网页界面的更新
 */

// ========== 全局变量定义 ==========

/**
 * 存储当前正在编辑的卡片信息
 * @type {Object}
 * @property {string|null} id - 卡片的唯一标识符
 * @property {string} title - 卡片的标题
 */
let currentCard = {
  id: null,
  title: ''
};

// ========== 从原生代码调用的函数 ==========

/**
 * 更新卡片信息（由原生代码通过 evaluateJavaScript 调用）
 * 
 * 当用户在 MarginNote 中选择一个卡片时，原生代码会调用这个函数
 * 将卡片的信息传递给网页
 * 
 * @param {string} encodedData - 经过 encodeURIComponent 和 JSON.stringify 编码的卡片信息
 */
function updateCardInfo(encodedData) {
  try {
    // 1. 两步解码：先 URL 解码，再 JSON 解析
    const jsonString = decodeURIComponent(encodedData);
    const cardInfo = JSON.parse(jsonString);
    
    console.log('收到卡片信息:', cardInfo);
    
    // 2. 保存卡片信息到全局变量
    currentCard.id = cardInfo.id;
    currentCard.title = cardInfo.title;
    
    // 3. 更新页面上的卡片信息显示
    const cardInfoDiv = document.getElementById('cardInfo');
    
    // 构建显示内容，包含更多信息
    let htmlContent = `<p><strong>当前卡片ID:</strong> ${cardInfo.id}</p>
                      <p><strong>当前标题:</strong> ${cardInfo.title}</p>`;
    
    
    cardInfoDiv.innerHTML = htmlContent;
    
    // 4. 更新输入框的值
    const titleInput = document.getElementById('titleInput');
    titleInput.value = cardInfo.title;
    
    // 5. 启用输入框和按钮（之前是 disabled 状态）
    titleInput.disabled = false;
    document.getElementById('saveButton').disabled = false;
    
    // 6. 隐藏成功消息（如果之前有显示的话）
    document.getElementById('successMessage').style.display = 'none';
    
  } catch (error) {
    console.error('解码卡片信息失败:', error);
    // 显示错误信息
    const cardInfoDiv = document.getElementById('cardInfo');
    cardInfoDiv.innerHTML = '<p style="color: red;">解析数据失败，请重试</p>';
  }
}

/**
 * 显示操作结果（由原生代码调用）
 * 
 * 当原生代码完成某个操作后，会调用这个函数显示结果
 * 
 * @param {string} message - 要显示的消息
 * @param {boolean} isSuccess - 是否是成功消息（true=成功，false=失败）
 */
function showResult(message, isSuccess) {
  console.log('显示结果:', message, isSuccess);
  
  // 获取消息显示区域
  const messageDiv = document.getElementById('successMessage');
  
  // 设置消息内容
  messageDiv.textContent = message;
  
  // 根据成功/失败设置不同的颜色
  if (isSuccess) {
    messageDiv.style.color = '#4CAF50'; // 绿色
  } else {
    messageDiv.style.color = '#f44336'; // 红色
  }
  
  // 显示消息（去掉 display: none）
  messageDiv.style.display = 'block';
  
  // 3秒后自动隐藏消息
  setTimeout(function() {
    messageDiv.style.display = 'none';
  }, 3000);
}

// ========== 网页主动调用的函数 ==========

/**
 * 保存标题按钮的点击事件处理
 * 
 * 当用户点击"保存标题"按钮时调用
 * 将新标题发送给原生代码进行保存
 */
function saveTitle() {
  console.log('saveTitle 函数被调用');
  
  // 1. 检查是否有选中的卡片
  if (!currentCard.id) {
    // 使用 alert 显示警告对话框
    alert('请先选择一个卡片');
    return; // 退出函数
  }
  
  // 2. 获取输入框中的新标题
  const titleInput = document.getElementById('titleInput');
  const newTitle = titleInput.value;
  
  // 3. 检查标题是否为空
  if (!newTitle || newTitle.trim() === '') {
    alert('标题不能为空');
    return;
  }
  
  // 4. 检查标题是否有变化
  if (newTitle === currentCard.title) {
    showResult('标题没有变化', false);
    return;
  }
  
  // 5. 构造自定义 URL 来调用原生方法
  // URL 格式: mnliterature://方法名?参数1=值1&参数2=值2
  // encodeURIComponent 用于编码特殊字符，避免 URL 解析错误
  const url = `mnliterature://updateTitle?id=${encodeURIComponent(currentCard.id)}&title=${encodeURIComponent(newTitle)}`;
  
  console.log('准备调用原生方法，URL:', url);
  
  // 6. 通过修改 window.location.href 触发原生代码
  // 原生代码会拦截这个 URL 并执行相应操作
  window.location.href = url;
  
  // 7. 更新本地保存的标题（乐观更新）
  currentCard.title = newTitle;
}

/**
 * 清空输入框和信息显示
 * 
 * 当需要重置界面时调用
 */
function clearCardInfo() {
  console.log('清空卡片信息');
  
  // 重置全局变量
  currentCard.id = null;
  currentCard.title = '';
  
  // 重置界面显示
  document.getElementById('cardInfo').innerHTML = 
    '<p class="no-card">请先选择一个卡片</p>';
  
  // 清空并禁用输入框
  const titleInput = document.getElementById('titleInput');
  titleInput.value = '';
  titleInput.disabled = true;
  
  // 禁用保存按钮
  document.getElementById('saveButton').disabled = true;
  
  // 隐藏消息
  document.getElementById('successMessage').style.display = 'none';
}

// ========== 页面加载完成后的初始化 ==========

/**
 * 当页面加载完成时执行
 * DOMContentLoaded 事件确保所有 HTML 元素都已加载
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('页面加载完成');
  
  // 可以在这里添加更多的初始化代码
  // 例如：添加事件监听器、初始化默认状态等
  
  // 给输入框添加回车键监听
  document.getElementById('titleInput').addEventListener('keypress', function(event) {
    // 使用 key 属性代替已弃用的 keyCode
    if (event.key === 'Enter') {
      saveTitle(); // 按回车时也触发保存
    }
  });
  
  // 输入框内容变化时的实时验证
  document.getElementById('titleInput').addEventListener('input', function(event) {
    const newValue = event.target.value;
    
    // 如果输入框为空，禁用保存按钮
    if (!newValue || newValue.trim() === '') {
      document.getElementById('saveButton').disabled = true;
    } else {
      document.getElementById('saveButton').disabled = false;
    }
  });
});

// ========== 调试辅助函数 ==========

/**
 * 用于调试的日志函数
 * 在实际部署时可以禁用
 */
function debugLog(message) {
  console.log('[DEBUG]', new Date().toLocaleTimeString(), message);
}

// 将函数暴露到全局，以便原生代码可以调用
// window 对象是浏览器的全局对象
window.updateCardInfo = updateCardInfo;
window.showResult = showResult;
window.clearCardInfo = clearCardInfo;
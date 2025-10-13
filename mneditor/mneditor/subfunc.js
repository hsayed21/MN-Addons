let base64ToR2URL = true
let subscribed = false
let editor
document.addEventListener('DOMContentLoaded', function () {
      editor = new Vditor('vditor', {
      cache: {
        enable: false,
      },
      // cache:{
      //   after(text) {
      //     window.location.href = "editorinput://content="+encodeURIComponent(text)
      //     // alert('缓存完毕回调，当前缓存值为' + text)
      //   }
      // },
      esc:(text)=>{
          window.location.href = "editorexit://content=123"
      },
      tab:"\t",
      upload:{
        handler:async (files)=>{
          let file = files[0]
          let size = file.size/1048576.
          if (size > 5) {
            editor.tip("Too large file!")
            return
          }
          var fileData = await fileToBase64(file)
          base64ToR2URL = true
          if (base64ToR2URL) {
            // let fileName = generateUUID()+".png"
            // editor.tip("Genarating URL...")
            // editor.disabled()
            // let res = await createPresignedUrl(fileName)
            // let url = res.url
            // // await uploadFile(url,file)
            // await uploadFileDirect(file,fileName)
            // editor.tip("Upload success!")
            // let filePrefix = subscribed?"img":"file"
            // editor.insertValue(`![image](https://${filePrefix}.feliks.top/${fileName})`)
            // editor.enable()
            window.location.href = "editorimage://content="+encodeURIComponent(fileData)
          }else{
            editor.insertValue(`![image](${fileData})`)
          }
          return null
        },
        error:(error)=>{
          console.log(error)
        }
      },
      input: (value)=>{
        if (value.trim() === "[[") {
          window.location.href = "editorinlinelink://content"
        }
        
        // window.location.href = "editorinput://content="+encodeURIComponent(value)
        },
      preview:{
        math:{
          engine:"MathJax",
          mathJaxOptions:{
            tex: {
                inlineMath: [ ['$','$'], ["\\(","\\)"] ]
            }
          },
          inlineDigit: true
        },
        hljs:{
          style:"native"
        },
        markdown:{
          mark:true
        }
      },
      height:"100vh",
      toolbarConfig:{hide:!window.editorToolbar,pin:window.editorToolbar},
      placeholder: `Input here`,
      toolbar: [
            'undo',
            'redo',
            'headings',
            'check',
            'list',
            'ordered-list',
            'bold',
            'italic',
            'strike',
            'code',
            'inline-code',
            'link',
            'table',
            'quote',
            'insert-after',
            'insert-before',
            'br',
            'outdent',
            'indent',
    {
      hotkey: '⌘S',
      name: 'sponsor',
      tipPosition: 's',
      tip: '成为赞助者',
      className: 'save',
      icon: '',
      click () {window.location.href = "nativeCommand://save"},
    }
        ],
      ctrlEnter: ()=>{window.location.href = "nativeCopy://test" ;},
      image:{isPreview:false,preview:(element)=>{window.location.href = element.src}},
      hint: {
        delay:20,
       extend: [
          {
            key: '/',
            hint: (key) => {
              let items = []
              if ('heading1h1'.indexOf(key.toLocaleLowerCase()) > -1) {
                items = items.concat({
                    value: '#',
                    html: 'h1',
                  })
              }
              if ('heading2h2'.indexOf(key.toLocaleLowerCase()) > -1) {
                items = items.concat({
                    value: '##',
                    html: 'h2',
                  })
              }
              if ('heading3h3'.indexOf(key.toLocaleLowerCase()) > -1) {
                items = items.concat({
                    value: '###',
                    html: 'h3',
                  })
              }
              if ('heading4h4'.indexOf(key.toLocaleLowerCase()) > -1) {
                items = items.concat({
                    value: '####',
                    html: 'h4',
                  })
              }
              if ('list'.indexOf(key.toLocaleLowerCase()) > -1) {
                items = items.concat([{
                    value: '*',
                    html: 'Bullet list',
                  },{
                    value: '1.',
                    html: 'Ordered list',
                  }])
              }
              if ('table'.indexOf(key.toLocaleLowerCase()) > -1) {
                items = items.concat([{
                    value:`|col1|col2|
| - | - |
|   |   |`,html:"2x2"
                  },{
                    value:`|col1|col2|col3|
| - | - | - |
|   |   |   |
|   |   |   |`,html:"3x3"
                  
                  },{
                    value:`|col1|col2|col3|col4|
| - | - | - | - |
|   |   |   |   |
|   |   |   |   |
|   |   |   |   |`,html:"4x4"
                  
                  },{
                    value:`|col1|col2|col3|col4|col5|
| - | - | - | - | - |
|   |   |   |   |   |
|   |   |   |   |   |
|   |   |   |   |   |
|   |   |   |   |   |`,html:"5x5"
                  
                  }])
              }
              return items
            },
          }
        ],
  },
      mode: window.mode,
      cdn:"https://vip.123pan.cn/1836303614/dl/cdn/vditor",
      after:()=>{
        // editor.focus();
        editor.setValue(``)
        const editorDOM = document.getElementById('vditor');
        // editorDOM.addEventListener('dragover', (event) => {
        // });
  
        editorDOM.addEventListener('drop', (event) => {
          const data = event.dataTransfer;
          if (data && data.types.includes('text/plain')) {
            const text = data.getData('text/plain');
            sendDropNotification({type:"text",text:text})
            // copyToClipboard(text)
          }
        });
        // editor.setPreviewMode('editor')
        // document.addEventListener('copy', function(event) {
        //   let text = getCurrentSelect()
        //   window.location.href = "nativecopy://content="+encodeURIComponent(text)
        // });
        },
      i18n:{
  'alignCenter': '居中',
  'alignLeft': '居左',
  'alignRight': '居右',
  'alternateText': '替代文本',
  'bold': '粗体',
  'both': '编辑 & 预览',
  'check': '任务列表',
  'close': '关闭',
  'code': '代码块',
  'code-theme': '代码块主题预览',
  'column': '列',
  'comment': '评论',
  'confirm': '确定',
  'content-theme': '内容主题预览',
  'copied': '已复制',
  'copy': '复制',
  'delete-column': '删除列',
  'delete-row': '删除行',
  'devtools': '开发者工具',
  'down': '下',
  'downloadTip': '该浏览器不支持下载功能',
  'edit': '编辑',
  'edit-mode': '切换编辑模式',
  'emoji': '表情',
  'export': '导出',
  'fileTypeError': '文件类型不允许上传，请压缩后再试',
  'footnoteRef': '脚注标识',
  'fullscreen': '全屏切换',
  'generate': '生成中',
  'headings': '标题',
  'heading1': '一级标题',
  'heading2': '二级标题',
  'heading3': '三级标题',
  'heading4': '四级标题',
  'heading5': '五级标题',
  'heading6': '六级标题',
  'help': '帮助',
  'imageURL': '图片地址',
  'indent': '列表缩进',
  'info': '关于',
  'inline-code': '行内代码',
  'insert-after': '末尾插入行',
  'insert-before': '起始插入行',
  'insertColumnLeft': '在左边插入一列',
  'insertColumnRight': '在右边插入一列',
  'insertRowAbove': '在上方插入一行',
  'insertRowBelow': '在下方插入一行',
  'instantRendering': '即时渲染',
  'italic': '斜体',
  'language': '语言',
  'line': '分隔线',
  'link': '链接',
  'linkRef': '引用标识',
  'list': '无序列表',
  'more': '更多',
  'nameEmpty': '文件名不能为空',
  'ordered-list': '有序列表',
  'outdent': '列表反向缩进',
  'outline': '大纲',
  'over': '超过',
  'performanceTip': '实时预览需 ${x}ms，可点击编辑 & 预览按钮进行关闭',
  'preview': '预览',
  'quote': '引用',
  'record': '开始录音/结束录音',
  'record-tip': '该设备不支持录音功能',
  'recording': '录音中...',
  'redo': '重做',
  'remove': '删除',
  'row': '行',
  'spin': '旋转',
  'splitView': '分屏预览',
  'strike': '删除线',
  'table': '表格',
  'textIsNotEmpty': '文本（不能为空）',
  'title': '标题',
  'tooltipText': '提示文本',
  'undo': '撤销',
  'up': '上',
  'update': '更新',
  'upload': '上传图片或文件',
  'uploadError': '上传错误',
  'uploading': '上传中...',
  'wysiwyg': '所见即所得',
}

    })
})
function getValue() {
  return editor.getValue()
}
function setValue(content) {
  editor.clearCache()
  let decodedContent = decodeURIComponent(content)
  // let contentWithMarkdownLink = convertLinksToMarkdown(decodedContent)
  editor.setValue(decodedContent,true)
  
}
function updateValue(content) {
  let decodedContent = decodeURIComponent(content)
  // let contentWithMarkdownLink = convertLinksToMarkdown(decodedContent)
  editor.setValue(decodedContent,false)
  
}
function insertValue(content) {
  editor.insertValue(decodeURIComponent(content),true)
}
// function removeExtraSpacesInLinks(text) {
//     return text.replace(/https?:\/\/[^\s]+/g, function(url) {
//         return url.replace(/\s+/g, '');
//     });
// }
// function removeExtraSpacesInLinks(text) {
//     return text.replace(/https?:\/\/[^\s]+\/\s+/g, function(url) {
//         return url.replace(/\s+/g, '');
//     });
// }

function convertLinksToMarkdown(text) {
    // 正则表达式用于匹配非 Markdown 格式的链接
        const urlRegex = /(?<!\[.*?\])(?<!\()(?<!")(https?:\/\/[^\s.]+(?:\.[^\s.]+)+)(?!")(?!\))/g;

    // const urlRegex = /(?<!\[.*?\])(?<!\()(?<!")(https?:\/\/[^\s]+)(?!")(?!\))/g;

    // 替换所有匹配的链接为 Markdown 格式
    return text.replace(urlRegex, (match) => {
        return `[${match}](${match})`;
    });
}
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function sendDropNotification(obj){
  if(obj.type === "text"){
    window.location.href = "editordroptext://content="+encodeURIComponent(obj.text);
  }

}
function copyToClipboard(text) {
  window.location.href = "nativeCopy://content="+encodeURIComponent(text);
}

async function createPresignedUrl(fileName) {
  const url = "https://api2.feliks.top/v1/chat/completions"
  let model = subscribed?"r2":"r2pro"
  let body = {
        model:"r2",
        messages:[
          {
            role:"user",
            content:fileName
          }
        ]
      }
  const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk-VyHpUO731ovktpRHE3Cd39Af3627446eBaDb6c56411eA123"
      }
  });
  if (response.ok) {
    return await response.json()
      // console.log(await response.json());
  } else {
    return undefined
      console.log('failed');
  }
}
async function uploadFile(url,file) {
        const presignedUrl = url; // 替换为从服务器获取的预签名URL
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': 'image/png' // 根据你的文件类型调整
            }
        });
        if (response.ok) {
            console.log('File uploaded successfully');
        } else {
            console.log('Upload failed');
        }
    }
  async function uploadFileDirect(file,fileName) {
    let bucketName = subscribed?'pro':'test'
    var accessKeyId = 'a4dd38e9a43edd92e7c0a29d90fceb38';
    var secretAccessKey = 'c7f0d5fdf94a12e203762c1b536f49fd1accb9c9ea7bb0e4810e856bb27ac9e7';
    var endpointUrl = 'https://45485acd4578c553e0570e10e95105ef.r2.cloudflarestorage.com';
    var region = 'auto';
    var service = 's3';
    var urlString = endpointUrl + '/' + bucketName + '/' + fileName;
    var date = new Date();
    var amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    // amzDate = '20240614T154746Z'
    var shortDate = amzDate.substr(0, 8);
    var scope = shortDate + '/' + region + '/' + service + '/aws4_request';
    var host = '45485acd4578c553e0570e10e95105ef.r2.cloudflarestorage.com'
    // var payloadHash = CryptoJS.SHA256(imageData).toString(CryptoJS.enc.Hex);
    // payloadHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    var payloadHash = 'UNSIGNED-PAYLOAD'
    var canonicalUri = '/' + bucketName + '/' + fileName;
    var canonicalRequest = 'PUT\n' + canonicalUri + '\n\n' +
        'host:' + host + '\n' +
        'x-amz-content-sha256:'+payloadHash+'\n' +
        'x-amz-date:' + amzDate + '\n\n' +
        'host;x-amz-content-sha256;x-amz-date\n' +
        payloadHash;
    var hashedCanonicalRequest = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);

    var stringToSign = 'AWS4-HMAC-SHA256\n' + amzDate + '\n' + scope + '\n' + hashedCanonicalRequest;
    var dateKey = CryptoJS.HmacSHA256(shortDate, 'AWS4' + secretAccessKey);
    var dateRegionKey = CryptoJS.HmacSHA256(region, dateKey);
    var dateRegionServiceKey = CryptoJS.HmacSHA256(service, dateRegionKey);
    var signingKey = CryptoJS.HmacSHA256('aws4_request', dateRegionServiceKey);
    var signature = CryptoJS.HmacSHA256(stringToSign, signingKey).toString(CryptoJS.enc.Hex);

    var authorizationHeader = 'AWS4-HMAC-SHA256 Credential=' + accessKeyId + '/' + scope + ', SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=' + signature;

    var headers = {
        "Accept-Encoding":"identity",
        "Authorization": authorizationHeader,
        'X-Amz-Content-SHA256': payloadHash,
        'Host': host,
        "X-Amz-Date": amzDate
    }

        const response = await fetch(urlString, {
            method: 'PUT',
            body: file,
            headers: headers
        });
        if (response.ok) {
            console.log('File uploaded successfully');
            return
        } else {
            console.log('Upload failed');
            return
        }
    }
  /**
   * 获取当前选中的text/html
   * */
  function getCurrentSelect(){

    let selectionObj = null, rangeObj = null;
    let selectedText = "", selectedHtml = "";

    // 处理兼容性
    if(window.getSelection){
      // 现代浏览器
      // 获取text
      selectionObj = window.getSelection();
      //  获取html
      rangeObj = selectionObj.getRangeAt(0);
      var docFragment = rangeObj.cloneContents();
      var tempDiv = document.createElement("div");
      tempDiv.appendChild(docFragment);
      selectedHtml = tempDiv.innerHTML;
    } else if(document.selection){
        // 非主流浏览器IE
        selectionObj = document.selection;
        rangeObj = selectionObj.createRange();
        selectedHtml = rangeObj.htmlText;
    }
    let tem = editor.html2md(selectedHtml);
    let md = tem.replace(/\*\*\\\*\\\*\*\*/g, "")
                .replace(/\*\*\\\*\*\*/g, "")
                .replace(/######\s######\s/g, "###### ")
                .replace(/#####\s#####\s/g, "##### ")
                .replace(/####\s####\s/g, "#### ")
                .replace(/###\s###\s/g, "### ")
                .replace(/##\s##\s/g, "## ")
                .replace(/#\s#\s/g, "# ")
                .replace(/\*\*\\\$\*\*`/g, "$")
                .replace(/`\\\$/g, "$")
    return md
  };
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
function triggerEvent(key) {
  var event = new KeyboardEvent('keydown', {
    key: key,
    code: 'KeyZ',
    keyCode: 90,
    which: 90,
    ctrlKey: false, // 在Windows上是true，在macOS上是metaKey: true
    metaKey: true, // 在macOS上使用metaKey来表示Cmd键
    shiftKey: false,
    altKey: false,
    bubbles: true,
    cancelable: true
  });
  document.getElementsByClassName("vditor-reset")[0].dispatchEvent(event)
}

function triggerKey(key,code,keyCode,metaKey=false,shiftKey=false,altKey=false) {
  var event = new KeyboardEvent('keydown', {
    key: key,
    code: code,
    keyCode: keyCode,
    which: keyCode,
    ctrlKey: false, // 在Windows上是true，在macOS上是metaKey: true
    metaKey: metaKey, // 在macOS上使用metaKey来表示Cmd键
    shiftKey: shiftKey,
    altKey: altKey,
    bubbles: true,
    cancelable: true
  });
  document.getElementsByClassName("vditor-reset")[0].dispatchEvent(event)
}

function link() {
  var event = new KeyboardEvent('keydown', {
    key: 'k',
    code: 'KeyK',
    keyCode: 75,
    which: 75,
    ctrlKey: false, // 在Windows上是true，在macOS上是metaKey: true
    metaKey: true, // 在macOS上使用metaKey来表示Cmd键
    shiftKey: false,
    altKey: false,
    bubbles: true,
    cancelable: true
  });
  document.getElementsByClassName("vditor-reset")[0].dispatchEvent(event)
}
function toggleOutline() {
  var event = new KeyboardEvent('keydown', {
    key: "o",
    code: 'KeyO',
    keyCode: 79,
    which: 79,
    ctrlKey: false, // 在Windows上是true，在macOS上是metaKey: true
    metaKey: false, // 在macOS上使用metaKey来表示Cmd键
    shiftKey: false,
    altKey: true,
    bubbles: true,
    cancelable: true
  });
  document.getElementsByClassName("vditor-reset")[0].dispatchEvent(event)
}
function openOutline() {
    let display= window.getComputedStyle(document.getElementsByClassName('vditor-outline')[0]).getPropertyValue('display')
    
    if (display === 'none') {
        toggleOutline();
    }
}

function closeOutline() {
    let display= window.getComputedStyle(document.getElementsByClassName('vditor-outline')[0]).getPropertyValue('display')
    
    if (display !== 'none') {
        toggleOutline();
    }
}
function refresh() {
  let content = editor.getValue().trim()
  if (/^#\s/.test(content)) {
    editor.setValue(content)
  }else{
    editor.setValue(`# \n${content}`)
  }
}
function addLink(link,title="link"){
  let selection = editor.getSelection()
  if(selection && selection.trim()){
    editor.updateValue(`[${selection}](${link})`,true)
  }else{
    editor.insertValue(`[${title}](${link})`,true)
  }
}
function addFootnote(title,c=""){
  let currentFootnoteIds = getFootnoteIds();
  editor.insertValue(`[^${title}]`,true)
  if (currentFootnoteIds.includes(title)) {
    return
  }
  let content = editor.getValue().trim()
  content = content + `\n[^${title}]: ${c}`
  editor.setValue(content)
}
function getFootnoteIds() {
    let content = editor.getValue().trim()
    if (!content) return [];
    
    const footnoteIds = new Set();
    
    // Match both reference-style footnotes [^1] and definition-style footnotes [^1]:
    const footnoteRegex = /\[\^(.+?)\](?:\:)?/g;
    
    let match;
    while ((match = footnoteRegex.exec(content)) !== null) {
        footnoteIds.add(match[1]);
    }
    
    return Array.from(footnoteIds);
}
//b:加粗
//y:redo
//z:undo
//h:heading
//i:itali
//d:delete
//k:link
//l:unordered
//o:ordered
//j:todo
//;:refer
//u:code
//g:inlinecode
//m:table
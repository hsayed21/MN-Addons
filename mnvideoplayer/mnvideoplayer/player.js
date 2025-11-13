let videoId = ""
let collectionId = ""
let autoPlayNextVideo = false
function setVideoId(id) {
  videoId = id
}
function getVideoId() {
  return videoId
}
function setCollectionId(id) {
  collectionId = id
}
function getCollectionId() {
  return collectionId
}
function setAutoPlayNextVideo(value) {
  autoPlayNextVideo = value
}
function getAutoPlayNextVideo() {
  return autoPlayNextVideo
}
// 获取视频元素尺寸的API函数
function getVideoSize() {
  var video = document.getElementsByTagName('video')[0];
  if (!video) {
    return { width: 0, height: 0, error: 'No video element found' };
  }
  return {
    width: video.width || video.videoWidth || 0,
    height: video.height || video.videoHeight || 0,
    videoWidth: video.videoWidth || 0,
    videoHeight: video.videoHeight || 0,
    clientWidth: video.clientWidth || 0,
    clientHeight: video.clientHeight || 0
  };
}

// 同步右侧栏高度与视频高度一致的函数（仅在左右分栏布局时生效）
function syncSidebarHeight() {
  const video = document.getElementsByTagName('video')[0];
  const buttonsContainer = document.getElementById('video-buttons-container');

  if (!video || !buttonsContainer) {
    return;
  }

  // 检查是否为大屏幕左右分栏布局（宽度 >= 1000px）
  if (window.innerWidth >= 1000) {
    // 左右分栏布局：同步高度
    const videoHeight = video.clientHeight || video.offsetHeight;
    if (videoHeight > 0) {
      buttonsContainer.style.height = (videoHeight - 30) + 'px';
    }
  } else {
    // 上下分栏布局：清除固定高度，让内容自然显示
    buttonsContainer.style.height = '';
  }
}
  /**
 * 根据指定的 scheme、host、path、query 和 fragment 生成一个完整的 URL Scheme 字符串。
 * URL Scheme 完整格式：scheme://host/path?query#fragment
 *
 * @param {string} scheme - URL scheme，例如 'myapp'。必须提供。
 * @param {string|undefined} [host] - host 部分，例如 'user_profile'。
 * @param {string|string[]|undefined} [path] - path 部分，例如 'view/123'。
 * @param {Object<string, string|number|boolean|object>|undefined} [query] - 查询参数对象。
 * @param {string|undefined} [fragment] - fragment 标识符，即 URL 中 # 后面的部分。
 * @returns {string} - 生成的完整 URL 字符串。
 */
function generateUrlScheme(scheme, host, path, query, fragment) {
  // 1. 处理必须的 scheme
  if (!scheme) {
    console.error("Scheme is a required parameter.");
    return '';
  }
  // 2. 构建基础部分：scheme 和 host
  //    即使 host 为空，也会生成 'scheme://'，这对于 'file:///' 这类 scheme 是正确的
  let url = `${scheme}://${host || ''}`;

  // 3. 添加 path
  if (path) {
    if (Array.isArray(path)) {
      let pathStr = path.join('/')
      url += `/${pathStr.replace(/^\/+/, '')}`;
    }else{
      // 确保 host 和 path 之间只有一个斜杠，并处理 path 开头可能存在的斜杠
      url += `/${path.replace(/^\/+/, '')}`;
    }
  }

  // 4. 添加 query 参数
  if (query && Object.keys(query).length > 0) {
    const queryParts = [];
    for (const key in query) {
      // 确保我们只处理对象自身的属性
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        const value = query[key];
        const encodedKey = encodeURIComponent(key);
        // 对值进行编码，如果是对象，则先序列化为 JSON 字符串
        const encodedValue = encodeURIComponent(
          typeof value === "object" && value !== null ? JSON.stringify(value) : value
        );
        queryParts.push(`${encodedKey}=${encodedValue}`);
      }
    }
    if (queryParts.length > 0) {
      url += `?${queryParts.join('&')}`;
    }
  }

  // 5. 添加 fragment
  if (fragment) {
    // Fragment 部分不应该被编码
    url += `#${fragment}`;
  }

  return url;
}
/**
 *
 * @param {string} scheme - URL scheme, 例如 'myapp'。
 * @param {string} [host] - 可选的路径或操作名。
 * @param {Object<string, string|number|boolean>} [params] - 查询参数对象。
 */
function postMessageToAddon(scheme, host, params) {
  // params 应进入 query，而非 path
  let url = generateUrlScheme(scheme, host, undefined, params)
  window.location.href = url
}
function setTitle(title) {
  let titleElement = document.getElementById('title')
  titleElement.innerText = title
}
async function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}
async function initVideo(encodedData) {
try {
  if (typeof setVideoId === 'undefined') {
    await delay(0.01)
  }
  let data = JSON.parse(decodeURIComponent(encodedData))
  let url = data.url
  let title = data.title
  setVideoId(data.id)
  let startAtSeconds = data.startAtSeconds

  // 检查是否存在allVideos参数
  if (data.allVideos && Array.isArray(data.allVideos)) {
    // 存储视频列表供后续使用
    window.allVideos = data.allVideos
    if (!collectionId || collectionId !== data.collection) {
      //如果collectionId一致，则不重新渲染视频按钮
      renderVideoButtons(data.allVideos)
    }
    setTimeout(() => {
      syncSidebarHeight();
    }, 0)
    // 延迟更新高亮状态，确保按钮已渲染完成
    setTimeout(() => {
      updateCurrentVideoHighlight(data.id)
      syncSidebarHeight();
    }, 100)
  }
  if (data.collection) {
    setCollectionId(data.collection)
    if ("autoPlayNextVideo" in data) {
      setAutoPlayNextVideo(data.autoPlayNextVideo)
    }
  }else{
    setAutoPlayNextVideo(false)
  }
  let video = document.getElementsByTagName('video')[0];
  video.crossOrigin = "anonymous"; // 或 "use-credentials"（若服务器要求带Cookie）
  // 无论 crossOrigin 是否已存在，都设定/覆盖 src
  video.src = url;
  try {
    // 移除已存在的播放结束事件监听器（避免累积）
    video.removeEventListener('ended', handleVideoEnded);
    // 添加视频播放结束事件监听器
    video.addEventListener('ended', handleVideoEnded);
  } catch (error) {
    
  }
  // if (data.cover) {
  //   video.poster = data.cover
  //   video.poster.crossOrigin = "anonymous"
  // }
  // 如提供时间戳，元数据就绪后跳转到对应时间点
  if (startAtSeconds !== undefined && startAtSeconds !== null) {
    var target = Number(startAtSeconds);
    if (isFinite(target)) {
      var seekAfterMeta = async function () {
        setTitle(title)
        // let titleElement = document.getElementById('title')
        // titleElement.innerText = title
        video.removeEventListener('loadedmetadata', seekAfterMeta);
        // 若已知总时长，做边界钳制
        var hasDuration = !isNaN(video.duration) && isFinite(video.duration) && video.duration > 0;
        if (hasDuration) {
          if (target < 0) target = 0;
          if (target > video.duration) target = video.duration;
        } else {
          if (target < 0) target = 0;
        }
        video.currentTime = target;
        //自动播放
        if (typeof notyf !== 'undefined') {
          showNotification("视频加载完成")
        }
        video.play()
        await delay(0.1)
        // 同步右侧栏高度与视频高度一致
        syncSidebarHeight();
        // 延迟更新高亮状态，确保按钮已渲染完成
        setTimeout(() => {
          updateCurrentVideoHighlight(data.id)
        }, 100)
        let videoSize = getVideoSize()
        postMessageToAddon("videoplayer", "videoSize", {
          videoId: videoId,
          size: videoSize
        });

      };
      if (video.readyState >= 1 || (!isNaN(video.duration) && isFinite(video.duration))) {
        seekAfterMeta();
      } else {
        video.addEventListener('loadedmetadata', seekAfterMeta);
      }
    }
  }

    // 提供时间跳转 API
    (function () {
      var video = document.getElementsByTagName('video')[0];

      function clampTime(seconds) {
        if (typeof seconds !== 'number' || isNaN(seconds) || !isFinite(seconds)) {
          throw new Error('seekTo: 参数必须为有限数字（秒）');
        }
        // 若已知总时长，则进行边界钳制
        var hasDuration = !isNaN(video.duration) && isFinite(video.duration) && video.duration > 0;
        if (hasDuration) {
          if (seconds < 0) return 0;
          if (seconds > video.duration) return video.duration;
        }
        return Math.max(0, seconds);
      }

      function applySeek(targetSeconds) {
        var target = clampTime(targetSeconds);
        video.currentTime = target;
      }

      function readyOrOnMetadata(fn) {
        // HAVE_METADATA = 1，表示元数据（含时长）可用
        if (video.readyState >= 1 || (!isNaN(video.duration) && isFinite(video.duration))) {
          fn();
          // 同步右侧栏高度与视频高度一致
          syncSidebarHeight();
        } else {
          video.addEventListener('loadedmetadata', function onMeta() {
            video.removeEventListener('loadedmetadata', onMeta);
            fn();
            // 同步右侧栏高度与视频高度一致
            syncSidebarHeight();
          });
        }
      }

      // 跳转到绝对时间（秒）
      function seekTo(seconds) {
        readyOrOnMetadata(function () { applySeek(seconds); });
      }

      // 相对跳转：正数为快进，负数为快退
      function seekBy(deltaSeconds) {
        if (typeof deltaSeconds !== 'number' || isNaN(deltaSeconds) || !isFinite(deltaSeconds)) {
          throw new Error('seekBy: 参数必须为有限数字（秒）');
        }
        var base = isNaN(video.currentTime) ? 0 : video.currentTime;
        seekTo(base + deltaSeconds);
      }



      // 暴露到全局
      window.seekTo = seekTo;
      window.seekBy = seekBy;
      // 全屏API使用说明：
      // window.toggleFullscreen() - 切换全屏状态，返回当前状态（true为全屏，false为非全屏）
      // window.enterFullscreen() - 进入全屏，返回true
      // window.exitFullscreen() - 退出全屏，返回false
      // window.isFullscreen() - 获取当前全屏状态，返回true或false
    })();


    // 网页全屏开关（SVG 图标切换）
    (function () {
      var btn = document.getElementById('webfs-btn');
      var enterIcon = '\n      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n        <polyline points="15 3 21 3 21 9"></polyline>\n        <polyline points="9 21 3 21 3 15"></polyline>\n        <line x1="21" y1="3" x2="14" y2="10"></line>\n        <line x1="3" y1="21" x2="10" y2="14"></line>\n      </svg>';
      var exitIcon = '\n      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n        <polyline points="9 3 3 3 3 9"></polyline>\n        <polyline points="21 15 21 21 15 21"></polyline>\n        <line x1="3" y1="3" x2="10" y2="10"></line>\n        <line x1="21" y1="21" x2="14" y2="14"></line>\n      </svg>';

      var setIcon = function (isOn) {
        if (btn) {
          btn.innerHTML = isOn ? exitIcon : enterIcon;
          btn.setAttribute('title', isOn ? '退出网页全屏' : '网页全屏');
          btn.setAttribute('aria-label', isOn ? '退出网页全屏' : '网页全屏');
        }
      };

      // 全屏切换API函数
      window.toggleFullscreen = function () {
        try {

        // var btn = document.getElementById('webfs-btn');
        var isOn = document.body.classList.toggle('webpage-fullscreen');
        if (btn) {
          btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
          setIcon(isOn);
        }
        return isOn;
          
        } catch (error) {
          let titleElement = document.getElementById('notification-message')
          titleElement.innerText = "Error: "+error.message
          return undefined
        }
      };

      // 进入全屏API函数
      window.enterFullscreen = function () {
        var isOn = document.body.classList.contains('webpage-fullscreen');
        if (!isOn) {
          document.body.classList.add('webpage-fullscreen');
          if (btn) {
            btn.setAttribute('aria-pressed', 'true');
            setIcon(true);
          }
        }
        return true;
      };

      // 退出全屏API函数
      window.exitFullscreen = function () {
        var isOn = document.body.classList.contains('webpage-fullscreen');
        if (isOn) {
          document.body.classList.remove('webpage-fullscreen');
          if (btn) {
            btn.setAttribute('aria-pressed', 'false');
            setIcon(false);
          }
        }
        return false;
      };

      // 获取全屏状态API函数
      window.isFullscreen = function () {
        return document.body.classList.contains('webpage-fullscreen');
      };

      var toggle = function () {
        window.toggleFullscreen();
      };

      if (btn) {
        btn.addEventListener('click', toggle);
      }
      // 按下 Esc 退出网页全屏
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('webpage-fullscreen')) {
          window.exitFullscreen();
        }
      });
    })();

    // 键盘快捷键功能（只绑定一次，避免重复绑定）
    (function () {
      // 检查是否已经绑定过键盘事件
      if (window._keyboardShortcutsBound) {
        return;
      }
      window._keyboardShortcutsBound = true;

      // 检查是否在输入框中（避免在输入时触发快捷键）
      function isInputFocused() {
        var activeElement = document.activeElement;
        if (!activeElement) return false;
        var tagName = activeElement.tagName.toLowerCase();
        return tagName === 'input' || tagName === 'textarea' || (activeElement.hasAttribute && activeElement.hasAttribute('contenteditable'));
      }

      // 音量调整步长（0-1之间，每次调整5%）
      // var VOLUME_STEP = 0.05;

      document.addEventListener('keydown', function (e) {
        // 如果焦点在输入框中，不处理快捷键
        // if (isInputFocused()) {
        //   return;
        // }

        // 每次事件触发时获取最新的视频元素
        var video = document.getElementsByTagName('video')[0];
        if (!video) return;

        switch (e.key) {
          case ' ': // 空格键：暂停/播放
            e.preventDefault(); // 防止页面滚动
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
            break;

          case 'ArrowLeft': // 左箭头：快退15秒
            e.preventDefault();
            if (window.seekBy) {
              window.seekBy(-15);
            } else {
              video.currentTime = Math.max(0, video.currentTime - 15);
            }
            showNotification("快退15秒")
            break;

          case 'ArrowRight': // 右箭头：快进15秒
            e.preventDefault();
            if (window.seekBy) {
              window.seekBy(15);
            } else {
              video.currentTime = Math.min(video.duration || video.currentTime, video.currentTime + 15);
            }
            showNotification("快进15秒")
            break;
        }
      });
    })();
  
} catch (error) {
  let titleElement = document.getElementById('notification-message')
  titleElement.innerText = "Error: "+error.message
}
}

// 渲染视频跳转按钮网格
function renderVideoButtons(videos) {
  // 移除已存在的按钮容器（如果有的话）
  const existingContainer = document.getElementById('video-buttons-container')
  if (existingContainer) {
    existingContainer.remove()
  }

  // 创建按钮容器
  const container = document.createElement('div')
  container.id = 'video-buttons-container'

  // 获取当前视频的ID
  const currentVideoId = getVideoId()

  // 为每个视频创建按钮
  videos.forEach(video => {
    const button = document.createElement('button')
    button.textContent = video.title
    button.title = `点击播放: ${video.title}`
    button.dataset.videoId = video.id  // 存储视频ID到按钮上

    // 检查是否为当前播放的视频，高亮显示
    if (video.id === currentVideoId) {
      button.classList.add('current-video')
    }

    // 添加点击事件
    button.addEventListener('click', function() {
      openVideoById(video.id)
    })

    container.appendChild(button)
  })

  // 将容器添加到主内容容器内
  const mainContent = document.querySelector('.main-content')
  if (mainContent) {
    mainContent.appendChild(container)
  } else {
    // 如果没有主内容容器，回退到原来的方式
    const video = document.getElementsByTagName('video')[0]
    video.parentNode.insertBefore(container, video.nextSibling)
  }
}

/**
 * 
 * @param {string} videoId 
 */
function openVideoById(videoId) {
    setTitle("Loading...")
    showNotification("切换视频中...")
    postMessageToAddon("videoplayer", "playVideo", {
      videoId: videoId,
      timestamp: 0,
      reload: false
    });
  // // TODO: 实现根据videoId加载和播放对应视频的功能
  // console.log('打开视频 ID:', videoId)

  // if (typeof notyf !== 'undefined') {
  //   showNotification(`正在加载视频: ${videoId}`)
  // }

  // // 更新按钮高亮状态
  // updateCurrentVideoHighlight(videoId)
}

// 更新当前视频按钮的高亮状态
function updateCurrentVideoHighlight(currentVideoId) {
  const container = document.getElementById('video-buttons-container')
  if (!container) return

  const buttons = container.querySelectorAll('button')

  buttons.forEach(button => {
    // 移除所有按钮的高亮状态
    button.classList.remove('current-video')

    // 获取按钮对应的视频ID（这里需要存储视频ID到按钮上）
    const videoId = button.dataset.videoId
    if (videoId === currentVideoId) {
      button.classList.add('current-video')
    }
  })

  // 将当前高亮的按钮滚动到容器可视区域中央
  const currentButton = container.querySelector('.current-video')
  if (currentButton) {
    // 计算按钮相对于容器的位置
    const buttonRect = currentButton.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    // 计算按钮在容器内的相对位置
    const buttonTop = buttonRect.top - containerRect.top + container.scrollTop
    const buttonCenter = buttonTop + (buttonRect.height / 2)
    // const containerCenter = container.clientHeight / 2

    // 计算需要的滚动位置
    const scrollTop = buttonCenter - 30 //- containerCenter

    // 平滑滚动到目标位置
    container.scrollTo({
      top: Math.max(0, scrollTop), // 确保不会滚动到负数位置
      behavior: 'smooth'
    })
  }
}

// 添加窗口大小改变监听器，同步右侧栏高度
window.addEventListener('resize', function() {
  // 使用防抖，避免频繁调用
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(function() {
    syncSidebarHeight();
  }, 100);
});

// 页面加载完成后立即同步高度
document.addEventListener('DOMContentLoaded', function() {
  syncSidebarHeight();
});


/**
 * 处理视频播放结束事件
 * 如果当前视频属于合集，则自动播放下一个视频
 */
async function handleVideoEnded() {
  // 检查是否存在视频列表和当前视频ID
  if (!window.allVideos || !videoId) {
    return;
  }
  if (!getAutoPlayNextVideo()) {
    return;
  }

  // 查找当前视频在列表中的位置
  const currentIndex = window.allVideos.findIndex(video => video.id === videoId);

  if (currentIndex === -1 || currentIndex >= window.allVideos.length - 1) {
    // 没有找到当前视频或者已经是最后一个视频，不播放下一个
    return;
  }

  // 获取下一个视频的ID
  const nextVideo = window.allVideos[currentIndex + 1];
  const nextVideoId = nextVideo.id;
  showNotification("5s后播放下一个视频：\n"+nextVideo.title);
  await delay(4);
  showNotification("即将播放下一个视频：\n"+nextVideo.title);
  await delay(1);
  // 调用播放下一个视频的函数
  playNextVideo(nextVideoId);
}

/**
 * 播放下一个视频
 * @param {string} nextVideoId - 下一个视频的ID
 */
function playNextVideo(nextVideoId) {
  console.log('播放下一个视频:', nextVideoId);
  postMessageToAddon("videoplayer", "playVideo", {
    videoId: nextVideoId,
    timestamp: 0,
    reload: false,
    type: "next"
  });
}
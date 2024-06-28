import './main.css'

import OBSWebSocket from 'obs-websocket-js'


const obs = new OBSWebSocket()
const reconnectInterval = 5000 // 重连间隔时间（毫秒）

async function connectToOBS() {
  try {
    await obs.connect('ws://localhost:4444')
    console.log('已连接到 OBS WebSocket')
    document.getElementById('status').textContent = '✅'

    obs.on('CurrentProgramSceneChanged', onCurrentSceneChanged)

    obs.once('ExitStarted', () => {
      console.log('OBS started shutdown')
      resetStyle()
      obs.off('CurrentSceneChanged', onCurrentSceneChanged)
    })

    // 监听连接关闭事件以触发重连
    obs.on('ConnectionClosed', () => {
      document.getElementById('status').textContent = '🚫'
      console.log('连接关闭，准备重连...')
      resetStyle()
      setTimeout(connectToOBS, reconnectInterval)
    })
  } catch (error) {
    document.getElementById('status').textContent = '🐛'
    console.error('无法连接到 OBS WebSocket:', error)
    resetStyle()
    setTimeout(connectToOBS, reconnectInterval)
  }
}

connectToOBS()

function onCurrentSceneChanged(event) {
  console.log('Current scene changed to', event.sceneName)

  if (event.sceneName.includes('隐私')) {
    document.getElementById('currentScene').textContent = `❤️ ${event.sceneName}`
    document.body.className = 'red'
  } else {
    document.getElementById('currentScene').textContent = `💚 ${event.sceneName}`
    document.body.className = 'green'
  }
}

// 断开或者错误时重置css
function resetStyle() {
  document.body.style.color = ''
  document.getElementById('currentScene').textContent = '未知'
}

let lastClick = null
document.addEventListener('click', () => {
  if (lastClick === null) {
    // 第一次点击
    lastClick = new Date().getTime()
  } else {
    let currentTime = new Date().getTime()
    let timeDiff = currentTime - lastClick
    if (timeDiff < 500) {
      window.runtime.Quit()
    }
    lastClick = null
  }
})
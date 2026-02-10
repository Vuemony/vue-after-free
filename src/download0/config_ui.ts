import { libc_addr } from 'download0/userland'
import { stats } from 'download0/stats-tracker'
import { lang, useImageText, textImageBase } from 'download0/languages'

if (typeof libc_addr === 'undefined') {
  include('userland.js')
}

if (typeof lang === 'undefined') {
  include('languages.js')
}

(function () {
  log(lang.loadingConfig)

  const fs = {
    write: function (filename: string, content: string, callback: (error: Error | null) => void) {
      const xhr = new jsmaf.XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'))
        }
      }
      xhr.open('POST', 'file://../download0/' + filename, true)
      xhr.send(content)
    },

    read: function (filename: string, callback: (error: Error | null, data?: string) => void) {
      const xhr = new jsmaf.XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'), xhr.responseText)
        }
      }
      xhr.open('GET', 'file://../download0/' + filename, true)
      xhr.send()
    }
  }

  const currentConfig: {
    autolapse: boolean
    autopoop: boolean
    autoclose: boolean
    music: boolean
    usb_scan: boolean
    jb_behavior: number
  } = {
    autolapse: false,
    autopoop: false,
    autoclose: false,
    music: true,
    usb_scan: false,
    jb_behavior: 0
  }

  // Store user's payloads so we don't overwrite them
  let userPayloads: string[] = []

  const jbBehaviorLabels = [lang.jbBehaviorAuto, lang.jbBehaviorNetctrl, lang.jbBehaviorLapse]
  const jbBehaviorImgKeys = ['jbBehaviorAuto', 'jbBehaviorNetctrl', 'jbBehaviorLapse']

  let currentButton = 0
  const buttons: Image[] = []
  const buttonTexts: jsmaf.Text[] = []
  const buttonMarkers: (Image | null)[] = []
  const buttonOrigPos: { x: number; y: number }[] = []
  const textOrigPos: { x: number; y: number }[] = []
  const valueTexts: Image[] = []

  let bgm: any = null

  const normalButtonImg = 'file:///assets/img/button_over_9.png'
  const selectedButtonImg = 'file:///assets/img/button_over_9.png'

  jsmaf.root.children.length = 0

  new Style({ name: 'white', color: 'white', size: 24 })
  new Style({ name: 'title', color: 'white', size: 32 })

  if (typeof CONFIG !== 'undefined' && CONFIG.music) {
    bgm = new jsmaf.AudioClip()
    bgm.volume = 0.5  // 50% volume
    bgm.open('file://../download0/sfx/bgm.wav')
  }

  const background = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  })
  jsmaf.root.children.push(background)

  const logo = new Image({
    url: 'file:///../download0/img/logo.png',
    x: 1620,
    y: 0,
    width: 300,
    height: 169
  })
  jsmaf.root.children.push(logo)

  if (useImageText) {
    const title = new Image({
      url: textImageBase + 'config.png',
      x: 860,
      y: 100,
      width: 200,
      height: 60
    })
    jsmaf.root.children.push(title)
  } else {
    const title = new jsmaf.Text()
    title.text = lang.config
    title.x = 910
    title.y = 120
    title.style = 'title'
    jsmaf.root.children.push(title)
  }

  // Include the stats tracker
  include('stats-tracker.js')

  // Load and display stats
  stats.load()
  const statsData = stats.get()

  // Create text elements for each stat
  const statsImgKeys = ['totalAttempts', 'successes', 'failures', 'successRate', 'failureRate']
  const statsValues = [statsData.total, statsData.success, statsData.failures, statsData.successRate, statsData.failureRate]
  const statsLabels = [lang.totalAttempts, lang.successes, lang.failures, lang.successRate, lang.failureRate]

  // Display each stat line
  for (let i = 0; i < statsImgKeys.length; i++) {
    const yPos = 120 + (i * 25)
    if (useImageText) {
      const labelImg = new Image({
        url: textImageBase + statsImgKeys[i] + '.png',
        x: 20,
        y: yPos,
        width: 180,
        height: 25
      })
      jsmaf.root.children.push(labelImg)
      const valueText = new jsmaf.Text()
      valueText.text = String(statsValues[i])
      valueText.x = 210
      valueText.y = yPos
      valueText.style = 'white'
      jsmaf.root.children.push(valueText)
    } else {
      const lineText = new jsmaf.Text()
      lineText.text = statsLabels[i] + statsValues[i]
      lineText.x = 20
      lineText.y = yPos
      lineText.style = 'white'
      jsmaf.root.children.push(lineText)
    }
  }

  const configOptions = [
    { key: 'autolapse', label: lang.autoLapse, imgKey: 'autoLapse', type: 'toggle' },
    { key: 'autopoop', label: lang.autoPoop, imgKey: 'autoPoop', type: 'toggle' },
    { key: 'autoclose', label: lang.autoClose, imgKey: 'autoClose', type: 'toggle' },
    { key: 'music', label: lang.music, imgKey: 'music', type: 'toggle' },
    { key: 'usb_scan', label: lang.usbScan, imgKey: 'usbScan', type: 'toggle' },
    { key: 'jb_behavior', label: lang.jbBehavior, imgKey: 'jbBehavior', type: 'cycle' }
  ]

  const centerX = 960
  const startY = 300
  const buttonSpacing = 120
  const buttonWidth = 400
  const buttonHeight = 80

  for (let i = 0; i < configOptions.length; i++) {
    const configOption = configOptions[i]!
    const btnX = centerX - buttonWidth / 2
    const btnY = startY + i * buttonSpacing

    const button = new Image({
      url: normalButtonImg,
      x: btnX,
      y: btnY,
      width: buttonWidth,
      height: buttonHeight
    })
    buttons.push(button)
    jsmaf.root.children.push(button)

    buttonMarkers.push(null)

    let btnText: Image | jsmaf.Text
    if (useImageText) {
      btnText = new Image({
        url: textImageBase + configOption.imgKey + '.png',
        x: btnX + 20,
        y: btnY + 15,
        width: 200,
        height: 50
      })
    } else {
      btnText = new jsmaf.Text()
      btnText.text = configOption.label
      btnText.x = btnX + 30
      btnText.y = btnY + 28
      btnText.style = 'white'
    }
    buttonTexts.push(btnText)
    jsmaf.root.children.push(btnText)

    if (configOption.type === 'toggle') {
      const checkmark = new Image({
        url: currentConfig[configOption.key as keyof typeof currentConfig] ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png',
        x: btnX + 320,
        y: btnY + 20,
        width: 40,
        height: 40
      })
      valueTexts.push(checkmark)
      jsmaf.root.children.push(checkmark)
    } else {
      let valueLabel: Image | jsmaf.Text
      if (useImageText) {
        valueLabel = new Image({
          url: textImageBase + jbBehaviorImgKeys[currentConfig.jb_behavior] + '.png',
          x: btnX + 230,
          y: btnY + 15,
          width: 150,
          height: 50
        })
      } else {
        valueLabel = new jsmaf.Text()
        valueLabel.text = jbBehaviorLabels[currentConfig.jb_behavior] || jbBehaviorLabels[0]!
        valueLabel.x = btnX + 250
        valueLabel.y = btnY + 28
        valueLabel.style = 'white'
      }
      valueTexts.push(valueLabel)
      jsmaf.root.children.push(valueLabel)
    }

    buttonOrigPos.push({ x: btnX, y: btnY })
    textOrigPos.push({ x: btnText.x, y: btnText.y })
  }

  const backX = centerX - buttonWidth / 2
  const backY = startY + configOptions.length * buttonSpacing + 100

  const backButton = new Image({
    url: normalButtonImg,
    x: backX,
    y: backY,
    width: buttonWidth,
    height: buttonHeight
  })
  buttons.push(backButton)
  jsmaf.root.children.push(backButton)

  const backMarker = new Image({
    url: 'file:///assets/img/ad_pod_marker.png',
    x: backX + buttonWidth - 50,
    y: backY + 35,
    width: 12,
    height: 12,
    visible: false
  })
  buttonMarkers.push(backMarker)
  jsmaf.root.children.push(backMarker)

  let backText: Image | jsmaf.Text
  if (useImageText) {
    backText = new Image({
      url: textImageBase + 'back.png',
      x: backX + 20,
      y: backY + 15,
      width: 200,
      height: 50
    })
  } else {
    backText = new jsmaf.Text()
    backText.text = lang.back
    backText.x = backX + buttonWidth / 2 - 20
    backText.y = backY + buttonHeight / 2 - 12
    backText.style = 'white'
  }
  buttonTexts.push(backText)
  jsmaf.root.children.push(backText)

  buttonOrigPos.push({ x: backX, y: backY })
  textOrigPos.push({ x: backText.x, y: backText.y })

  let zoomInInterval: number | null = null
  let zoomOutInterval: number | null = null
  let prevButton = -1

  function easeInOut (t: number) {
    return (1 - Math.cos(t * Math.PI)) / 2
  }

  function animateZoomIn (btn: Image, text: jsmaf.Text, btnOrigX: number, btnOrigY: number, textOrigX: number, textOrigY: number) {
    if (zoomInInterval) jsmaf.clearInterval(zoomInInterval)
    const btnW = buttonWidth
    const btnH = buttonHeight
    const startScale = btn.scaleX || 1.0
    const endScale = 1.1
    const duration = 175
    let elapsed = 0
    const step = 16

    zoomInInterval = jsmaf.setInterval(function () {
      elapsed += step
      const t = Math.min(elapsed / duration, 1)
      const eased = easeInOut(t)
      const scale = startScale + (endScale - startScale) * eased

      btn.scaleX = scale
      btn.scaleY = scale
      btn.x = btnOrigX - (btnW * (scale - 1)) / 2
      btn.y = btnOrigY - (btnH * (scale - 1)) / 2
      text.scaleX = scale
      text.scaleY = scale
      text.x = textOrigX - (btnW * (scale - 1)) / 2
      text.y = textOrigY - (btnH * (scale - 1)) / 2

      if (t >= 1) {
        jsmaf.clearInterval(zoomInInterval ?? -1)
        zoomInInterval = null
      }
    }, step)
  }

  function animateZoomOut (btn: Image, text: jsmaf.Text, btnOrigX: number, btnOrigY: number, textOrigX: number, textOrigY: number) {
    if (zoomOutInterval) jsmaf.clearInterval(zoomOutInterval)
    const btnW = buttonWidth
    const btnH = buttonHeight
    const startScale = btn.scaleX || 1.1
    const endScale = 1.0
    const duration = 175
    let elapsed = 0
    const step = 16

    zoomOutInterval = jsmaf.setInterval(function () {
      elapsed += step
      const t = Math.min(elapsed / duration, 1)
      const eased = easeInOut(t)
      const scale = startScale + (endScale - startScale) * eased

      btn.scaleX = scale
      btn.scaleY = scale
      btn.x = btnOrigX - (btnW * (scale - 1)) / 2
      btn.y = btnOrigY - (btnH * (scale - 1)) / 2
      text.scaleX = scale
      text.scaleY = scale
      text.x = textOrigX - (btnW * (scale - 1)) / 2
      text.y = textOrigY - (btnH * (scale - 1)) / 2

      if (t >= 1) {
        jsmaf.clearInterval(zoomOutInterval ?? -1)
        zoomOutInterval = null
      }
    }, step)
  }

  function updateHighlight () {
    // Animate out the previous button
    const prevButtonObj = buttons[prevButton]
    const buttonMarker = buttonMarkers[prevButton]
    if (prevButton >= 0 && prevButton !== currentButton && prevButtonObj) {
      prevButtonObj.url = normalButtonImg
      prevButtonObj.alpha = 0.7
      prevButtonObj.borderColor = 'transparent'
      prevButtonObj.borderWidth = 0
      if (buttonMarker) buttonMarker.visible = false
      animateZoomOut(prevButtonObj, buttonTexts[prevButton]!, buttonOrigPos[prevButton]!.x, buttonOrigPos[prevButton]!.y, textOrigPos[prevButton]!.x, textOrigPos[prevButton]!.y)
    }

    // Set styles for all buttons
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const buttonMarker = buttonMarkers[i]
      const buttonText = buttonTexts[i]
      const buttonOrigPos_ = buttonOrigPos[i]
      const textOrigPos_ = textOrigPos[i]
      if (button === undefined || buttonText === undefined || buttonOrigPos_ === undefined || textOrigPos_ === undefined) continue
      if (i === currentButton) {
        button.url = selectedButtonImg
        button.alpha = 1.0
        button.borderColor = 'rgb(100,180,255)'
        button.borderWidth = 3
        if (buttonMarker) buttonMarker.visible = true
        animateZoomIn(button, buttonText, buttonOrigPos_.x, buttonOrigPos_.y, textOrigPos_.x, textOrigPos_.y)
      } else if (i !== prevButton) {
        button.url = normalButtonImg
        button.alpha = 0.7
        button.borderColor = 'transparent'
        button.borderWidth = 0
        button.scaleX = 1.0
        button.scaleY = 1.0
        button.x = buttonOrigPos_.x
        button.y = buttonOrigPos_.y
        buttonText.scaleX = 1.0
        buttonText.scaleY = 1.0
        buttonText.x = textOrigPos_.x
        buttonText.y = textOrigPos_.y
        if (buttonMarker) buttonMarker.visible = false
      }
    }

    prevButton = currentButton
  }

  function updateValueText (index: number) {
    const options = configOptions[index]
    const valueText = valueTexts[index]
    if (!options || !valueText) return
    const key = options.key
    if (options.type === 'toggle') {
      const value = currentConfig[key as keyof typeof currentConfig]
      valueText.url = value ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png'
    } else {
      if (useImageText) {
        (valueText as Image).url = textImageBase + jbBehaviorImgKeys[currentConfig.jb_behavior] + '.png'
      } else {
        (valueText as jsmaf.Text).text = jbBehaviorLabels[currentConfig.jb_behavior] || jbBehaviorLabels[0]
      }
    }
  }

  function saveConfig () {
    let configContent = 'const CONFIG = {\n'
    configContent += '    autolapse: ' + currentConfig.autolapse + ',\n'
    configContent += '    autopoop: ' + currentConfig.autopoop + ',\n'
    configContent += '    autoclose: ' + currentConfig.autoclose + ',\n'
    configContent += '    music: ' + currentConfig.music + ',\n'
    configContent += '    usb_scan: ' + currentConfig.usb_scan + ',\n'
    configContent += '    jb_behavior: ' + currentConfig.jb_behavior + '\n'
    configContent += '};\n\n'
    configContent += 'const payloads = [ //to be ran after jailbroken\n'
    for (let i = 0; i < userPayloads.length; i++) {
      configContent += '    "' + userPayloads[i] + '"'
      if (i < userPayloads.length - 1) {
        configContent += ','
      }
      configContent += '\n'
    }
    configContent += '];\n'

    fs.write('config.js', configContent, function (err) {
      if (err) {
        log('ERROR: Failed to save config: ' + err.message)
      } else {
        log('Config saved successfully')
      }
    })
  }

  function loadConfig () {
    fs.read('config.js', function (err: Error | null, data?: string) {
      if (err) {
        log('ERROR: Failed to read config: ' + err.message)
        return
      }

      try {
        eval(data || '') // eslint-disable-line no-eval
        if (typeof CONFIG !== 'undefined') {
          currentConfig.autolapse = CONFIG.autolapse || false
          currentConfig.autopoop = CONFIG.autopoop || false
          currentConfig.autoclose = CONFIG.autoclose || false
          currentConfig.music = CONFIG.music !== false
          currentConfig.usb_scan = CONFIG.usb_scan || false
          currentConfig.jb_behavior = CONFIG.jb_behavior || 0

          // Preserve user's payloads
          if (typeof payloads !== 'undefined' && Array.isArray(payloads)) {
            userPayloads = payloads.slice()
          }

          for (let i = 0; i < configOptions.length; i++) {
            updateValueText(i)
          }
          log('Config loaded successfully')
        }
      } catch (e) {
        log('ERROR: Failed to parse config: ' + (e as Error).message)
      }
    })
  }

  function handleButtonPress () {
    if (currentButton === buttons.length - 1) {
      log('Restarting...')
      debugging.restart()
    } else if (currentButton < configOptions.length) {
      const option = configOptions[currentButton]!
      const key = option.key

      if (option.type === 'cycle') {
        currentConfig.jb_behavior = (currentConfig.jb_behavior + 1) % jbBehaviorLabels.length
        log(key + ' = ' + jbBehaviorLabels[currentConfig.jb_behavior])
      } else {
        const boolKey = key as 'autolapse' | 'autopoop' | 'autoclose' | 'music' | 'usb_scan'
        currentConfig[boolKey] = !currentConfig[boolKey]

        if (key === 'music') {
          if (typeof CONFIG !== 'undefined') {
            CONFIG.music = currentConfig.music
          }

          if (currentConfig.music) {
            if (!bgm) {
              bgm = new jsmaf.AudioClip()
              bgm.volume = 0.5
              bgm.open('file://../download0/sfx/bgm.wav')
            }
          } else {
            if (bgm) {
              if (typeof bgm.stop === 'function') bgm.stop()
              if (typeof bgm.close === 'function') bgm.close()
              bgm = null
            }
          }
        }

        if (key === 'autolapse' && currentConfig.autolapse === true) {
          currentConfig.autopoop = false
          for (let i = 0; i < configOptions.length; i++) {
            if (configOptions[i]!.key === 'autopoop') {
              updateValueText(i)
              break
            }
          }
          log('autopoop disabled (autolapse enabled)')
        } else if (key === 'autopoop' && currentConfig.autopoop === true) {
          currentConfig.autolapse = false
          for (let i = 0; i < configOptions.length; i++) {
            if (configOptions[i]!.key === 'autolapse') {
              updateValueText(i)
              break
            }
          }
          log('autolapse disabled (autopoop enabled)')
        }

        log(key + ' = ' + currentConfig[boolKey])
      }

      updateValueText(currentButton)
      saveConfig()
    }
  }

  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6 || keyCode === 5) {
      currentButton = (currentButton + 1) % buttons.length
      updateHighlight()
    } else if (keyCode === 4 || keyCode === 7) {
      currentButton = (currentButton - 1 + buttons.length) % buttons.length
      updateHighlight()
    } else if (keyCode === 14) {
      handleButtonPress()
    } else if (keyCode === 13) {
      log('Restarting...')
      debugging.restart()
    }
  }

  updateHighlight()
  loadConfig()

  log(lang.configLoaded)
})()

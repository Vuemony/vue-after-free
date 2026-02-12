import { libc_addr } from 'download0/userland'
import { stats } from 'download0/stats-tracker'
import { lang, useImageText, textImageBase } from 'download0/languages'
import { themes_getTheme, themes_setTheme, themes_getNames, themes_getCount, themes_getIndex, THEMES } from 'download0/themes'
import { sfx_setEnabled, sfx_isEnabled, sfx_playBgm, sfx_stopBgm, sfx_playNav, sfx_playSelect } from 'download0/sfx'
import { ui_initScreen, ui_addBackground, ui_addLogo, ui_addTitle, ui_playMusic, ui_createMenuState, ui_updateHighlight, ui_handleVerticalNav, UI_NORMAL_BTN, UI_MARKER_IMG, UIMenuState } from 'download0/ui'

if (typeof libc_addr === 'undefined') {
  include('userland.js')
}

if (typeof lang === 'undefined') {
  include('languages.js')
}

;(function () {
  include('themes.js')
  include('sfx.js')
  include('ui.js')
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
    jb_behavior: number
    theme: number
    retry_count: number
    nav_sounds: boolean
    fan_fix_mode: number
    fan_threshold: number
    fan_threshold_high: number
    fan_low_speed: number
    fan_med_speed: number
    fan_high_speed: number
  } = {
    autolapse: false,
    autopoop: false,
    autoclose: false,
    music: true,
    jb_behavior: 0,
    theme: 0,
    retry_count: 1,
    nav_sounds: true,
    fan_fix_mode: 1,
    fan_threshold: 55,
    fan_threshold_high: 70,
    fan_low_speed: 25,
    fan_med_speed: 50,
    fan_high_speed: 80
  }

  // Store user's payloads so we don't overwrite them
  let userPayloads: string[] = []
  let configLoaded = false

  const jbBehaviorLabels = [lang.jbBehaviorAuto, lang.jbBehaviorNetctrl, lang.jbBehaviorLapse]
  const jbBehaviorImgKeys = ['jbBehaviorAuto', 'jbBehaviorNetctrl', 'jbBehaviorLapse']
  const themeNames = themes_getNames()
  const retryLabels = ['1', '2', '3']

  const valueTexts: (Image | jsmaf.Text)[] = []

  ui_initScreen()
  ui_playMusic()
  ui_addBackground()
  ui_addLogo(1620, 0, 300, 169)

  if (useImageText) {
    ui_addTitle(lang.config, 'config', 860, 100, 200, 60)
  } else {
    ui_addTitle(lang.config, 'config', 910, 100, 200, 60)
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

  const fanThresholdLabels = ['40°C', '45°C', '50°C', '55°C', '58°C', '60°C', '62°C', '65°C', '68°C', '70°C', '75°C', '80°C']
  const fanThresholdValues = [40, 45, 50, 55, 58, 60, 62, 65, 68, 70, 75, 80]
  const fanSpeedLabels = ['0%', '10%', '15%', '20%', '25%', '30%', '35%', '40%', '45%', '50%', '55%', '60%', '65%', '70%', '75%', '80%', '85%', '90%', '95%', '100%']
  const fanSpeedValues = [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]

  const fanFixModeLabels = [
    lang.fanFixOff || 'Off',
    lang.fanFixBuiltIn || 'Built-in ICC',
    lang.fanFixLaunchApp || 'Launch Temp App'
  ]

  const configOptions = [
    { key: 'autolapse', label: lang.autoLapse, imgKey: 'autoLapse', type: 'toggle' },
    { key: 'autopoop', label: lang.autoPoop, imgKey: 'autoPoop', type: 'toggle' },
    { key: 'autoclose', label: lang.autoClose, imgKey: 'autoClose', type: 'toggle' },
    { key: 'music', label: lang.music, imgKey: 'music', type: 'toggle' },
    { key: 'nav_sounds', label: lang.navSounds, imgKey: 'navSounds', type: 'toggle' },
    { key: 'fan_fix_mode', label: lang.fanFixMode || 'Fan Fix (after JB)', imgKey: 'fanFixMode', type: 'fan_mode' },
    { key: 'fan_threshold', label: lang.fanThreshLow || 'Slow→Med Threshold', imgKey: 'fanThreshLow', type: 'fan_threshold' },
    { key: 'fan_threshold_high', label: lang.fanThreshHigh || 'Med→Fast Threshold', imgKey: 'fanThreshHigh', type: 'fan_threshold' },
    { key: 'fan_low_speed', label: lang.fanSlowSpeed || 'Slow Speed', imgKey: 'fanSlowSpeed', type: 'fan_speed' },
    { key: 'fan_med_speed', label: lang.fanMedSpeed || 'Medium Speed', imgKey: 'fanMedSpeed', type: 'fan_speed' },
    { key: 'fan_high_speed', label: lang.fanFastSpeed || 'Fast Speed', imgKey: 'fanFastSpeed', type: 'fan_speed' },
    { key: 'jb_behavior', label: lang.jbBehavior, imgKey: 'jbBehavior', type: 'cycle' },
    { key: 'theme', label: lang.theme, imgKey: 'theme', type: 'theme' },
    { key: 'retry_count', label: lang.retryCount, imgKey: 'retryCount', type: 'retry' }
  ]

  const centerX = 960
  const startY = 280
  const buttonSpacing = 80
  const buttonWidth = 400
  const buttonHeight = 60

  const state = ui_createMenuState(buttonWidth, buttonHeight)

  for (let i = 0; i < configOptions.length; i++) {
    const configOption = configOptions[i]!
    const btnX = centerX - buttonWidth / 2
    const btnY = startY + i * buttonSpacing

    const button = new Image({
      url: UI_NORMAL_BTN,
      x: btnX,
      y: btnY,
      width: buttonWidth,
      height: buttonHeight
    })
    state.buttons.push(button)
    jsmaf.root.children.push(button)

    state.buttonMarkers.push(null)

    let btnText: Image | jsmaf.Text
    if (useImageText) {
      btnText = new Image({
        url: textImageBase + configOption.imgKey + '.png',
        x: btnX + 20,
        y: btnY + 10,
        width: 180,
        height: 40
      })
    } else {
      btnText = new jsmaf.Text()
      btnText.text = configOption.label
      btnText.x = btnX + 30
      btnText.y = btnY + 20
      btnText.style = 'white'
    }
    state.buttonTexts.push(btnText)
    jsmaf.root.children.push(btnText)

    // Value indicator
    if (configOption.type === 'toggle') {
      const toggleKey = configOption.key as keyof typeof currentConfig
      const checkmark = new Image({
        url: currentConfig[toggleKey] ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png',
        x: btnX + 310,
        y: btnY + 10,
        width: 40,
        height: 40
      })
      valueTexts.push(checkmark)
      jsmaf.root.children.push(checkmark)
    } else if (configOption.type === 'cycle') {
      const valueLabel = new jsmaf.Text()
        valueLabel.text = jbBehaviorLabels[currentConfig.jb_behavior] || jbBehaviorLabels[0]!
      valueLabel.x = btnX + 240
      valueLabel.y = btnY + 20
      valueLabel.style = 'white'
      valueTexts.push(valueLabel)
      jsmaf.root.children.push(valueLabel)
    } else if (configOption.type === 'theme') {
      const valueLabel = new jsmaf.Text()
      valueLabel.text = themeNames[currentConfig.theme] || themeNames[0]!
      valueLabel.x = btnX + 240
      valueLabel.y = btnY + 20
      valueLabel.style = 'white'
      valueTexts.push(valueLabel)
      jsmaf.root.children.push(valueLabel)
    } else if (configOption.type === 'retry') {
      const valueLabel = new jsmaf.Text()
      valueLabel.text = retryLabels[currentConfig.retry_count - 1] || '1'
      valueLabel.x = btnX + 290
      valueLabel.y = btnY + 20
      valueLabel.style = 'white'
      valueTexts.push(valueLabel)
      jsmaf.root.children.push(valueLabel)
    } else if (configOption.type === 'fan_threshold') {
      const valueLabel = new jsmaf.Text()
      const cfgVal = (currentConfig as any)[configOption.key] as number
      const ftIdx = fanThresholdValues.indexOf(cfgVal)
      valueLabel.text = ftIdx >= 0 ? fanThresholdLabels[ftIdx]! : cfgVal + '°C'
      valueLabel.x = btnX + 290
      valueLabel.y = btnY + 20
      valueLabel.style = 'white'
      valueTexts.push(valueLabel)
      jsmaf.root.children.push(valueLabel)
    } else if (configOption.type === 'fan_speed') {
      const valueLabel = new jsmaf.Text()
      const cfgVal = (currentConfig as any)[configOption.key] as number
      const fsIdx = fanSpeedValues.indexOf(cfgVal)
      valueLabel.text = fsIdx >= 0 ? fanSpeedLabels[fsIdx]! : cfgVal + '%'
      valueLabel.x = btnX + 290
      valueLabel.y = btnY + 20
      valueLabel.style = 'white'
      valueTexts.push(valueLabel)
      jsmaf.root.children.push(valueLabel)
    } else if (configOption.type === 'fan_mode') {
      const valueLabel = new jsmaf.Text()
      valueLabel.text = fanFixModeLabels[currentConfig.fan_fix_mode] || fanFixModeLabels[0]!
      valueLabel.x = btnX + 240
      valueLabel.y = btnY + 20
        valueLabel.style = 'white'
      valueTexts.push(valueLabel)
      jsmaf.root.children.push(valueLabel)
    }

    state.buttonOrigPos.push({ x: btnX, y: btnY })
    state.textOrigPos.push({ x: btnText.x, y: btnText.y })
  }

  // Back button
  const backX = centerX - buttonWidth / 2
  const backY = startY + configOptions.length * buttonSpacing + 30

  const backButton = new Image({
    url: UI_NORMAL_BTN,
    x: backX,
    y: backY,
    width: buttonWidth,
    height: buttonHeight
  })
  state.buttons.push(backButton)
  jsmaf.root.children.push(backButton)

  const backMarker = new Image({
    url: UI_MARKER_IMG,
    x: backX + buttonWidth - 50,
    y: backY + 25,
    width: 12,
    height: 12,
    visible: false
  })
  state.buttonMarkers.push(backMarker)
  jsmaf.root.children.push(backMarker)

  let backText: Image | jsmaf.Text
  if (useImageText) {
    backText = new Image({
      url: textImageBase + 'back.png',
      x: backX + 20,
      y: backY + 10,
      width: 200,
      height: 40
    })
  } else {
    backText = new jsmaf.Text()
    backText.text = lang.back
    backText.x = backX + buttonWidth / 2 - 20
    backText.y = backY + buttonHeight / 2 - 12
    backText.style = 'white'
  }
  state.buttonTexts.push(backText)
  jsmaf.root.children.push(backText)

  state.buttonOrigPos.push({ x: backX, y: backY })
  state.textOrigPos.push({ x: backText.x, y: backText.y })

  function updateValueText (index: number) {
    const options = configOptions[index]
    const valueText = valueTexts[index]
    if (!options || !valueText) return
    const key = options.key

    if (options.type === 'toggle') {
      const toggleKey = key as keyof typeof currentConfig
      const value = currentConfig[toggleKey]
      ;(valueText as Image).url = value ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png'
    } else if (options.type === 'cycle') {
      ;(valueText as jsmaf.Text).text = jbBehaviorLabels[currentConfig.jb_behavior] || jbBehaviorLabels[0]!
    } else if (options.type === 'theme') {
      ;(valueText as jsmaf.Text).text = themeNames[currentConfig.theme] || themeNames[0]!
    } else if (options.type === 'retry') {
      ;(valueText as jsmaf.Text).text = retryLabels[currentConfig.retry_count - 1] || '1'
    } else if (options.type === 'fan_threshold') {
      const cfgVal = (currentConfig as any)[options.key] as number
      const ftIdx = fanThresholdValues.indexOf(cfgVal)
      ;(valueText as jsmaf.Text).text = ftIdx >= 0 ? fanThresholdLabels[ftIdx]! : cfgVal + '°C'
    } else if (options.type === 'fan_speed') {
      const cfgVal = (currentConfig as any)[options.key] as number
      const fsIdx = fanSpeedValues.indexOf(cfgVal)
      ;(valueText as jsmaf.Text).text = fsIdx >= 0 ? fanSpeedLabels[fsIdx]! : cfgVal + '%'
    } else if (options.type === 'fan_mode') {
      ;(valueText as jsmaf.Text).text = fanFixModeLabels[currentConfig.fan_fix_mode] || fanFixModeLabels[0]!
    }
  }

  function saveConfig () {
    if (!configLoaded) {
      log('Config not loaded yet, skipping save')
      return
    }
    let configContent = 'var CONFIG = {\n'
    configContent += '    autolapse: ' + currentConfig.autolapse + ',\n'
    configContent += '    autopoop: ' + currentConfig.autopoop + ',\n'
    configContent += '    autoclose: ' + currentConfig.autoclose + ',\n'
    configContent += '    music: ' + currentConfig.music + ',\n'
    configContent += '    jb_behavior: ' + currentConfig.jb_behavior + ',\n'
    configContent += '    theme: ' + currentConfig.theme + ',\n'
    configContent += '    retry_count: ' + currentConfig.retry_count + ',\n'
    configContent += '    nav_sounds: ' + currentConfig.nav_sounds + ',\n'
    configContent += '    fan_fix_mode: ' + currentConfig.fan_fix_mode + ',\n'
    configContent += '    fan_threshold: ' + currentConfig.fan_threshold + ',\n'
    configContent += '    fan_threshold_high: ' + currentConfig.fan_threshold_high + ',\n'
    configContent += '    fan_low_speed: ' + currentConfig.fan_low_speed + ',\n'
    configContent += '    fan_med_speed: ' + currentConfig.fan_med_speed + ',\n'
    configContent += '    fan_high_speed: ' + currentConfig.fan_high_speed + '\n'
    configContent += '};\n\n'
    configContent += 'var payloads = [ //to be ran after jailbroken\n'
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

  function safeParseConfig (data: string): void {
    // Safe config parser - extracts values without using eval()
    // Supports the var CONFIG = {...} format used by config.js
    try {
      // Extract the CONFIG object content between { and }
      const configMatch = data.match(/CONFIG\s*=\s*\{([\s\S]*?)\}/)
      if (configMatch && configMatch[1]) {
        const configBody = configMatch[1]

        // Parse individual key-value pairs
        const boolPairs = configBody.match(/(\w+)\s*:\s*(true|false)/g)
        if (boolPairs) {
          for (let i = 0; i < boolPairs.length; i++) {
            const pair = boolPairs[i]!
            const parts = pair.split(/\s*:\s*/)
            if (parts.length === 2) {
              const key = parts[0]!.trim()
              const value = parts[1]!.trim() === 'true'
              if (key === 'autolapse') currentConfig.autolapse = value
              else if (key === 'autopoop') currentConfig.autopoop = value
              else if (key === 'autoclose') currentConfig.autoclose = value
              else if (key === 'music') currentConfig.music = value
              else if (key === 'nav_sounds') currentConfig.nav_sounds = value
            }
          }
        }

        // Parse numeric values
        const numPairs = configBody.match(/(\w+)\s*:\s*(\d+)/g)
        if (numPairs) {
          for (let i = 0; i < numPairs.length; i++) {
            const pair = numPairs[i]!
            const parts = pair.split(/\s*:\s*/)
            if (parts.length === 2) {
              const key = parts[0]!.trim()
              const numVal = parseInt(parts[1]!.trim(), 10)
              if (key === 'jb_behavior' && numVal >= 0 && numVal <= 2) currentConfig.jb_behavior = numVal
              else if (key === 'theme' && numVal >= 0 && numVal < themes_getCount()) currentConfig.theme = numVal
              else if (key === 'retry_count' && numVal >= 1 && numVal <= 3) currentConfig.retry_count = numVal
              else if (key === 'fan_threshold' && numVal >= 40 && numVal <= 80) currentConfig.fan_threshold = numVal
              else if (key === 'fan_threshold_high' && numVal >= 40 && numVal <= 90) currentConfig.fan_threshold_high = numVal
              else if (key === 'fan_low_speed' && numVal >= 0 && numVal <= 100) currentConfig.fan_low_speed = numVal
              else if (key === 'fan_med_speed' && numVal >= 0 && numVal <= 100) currentConfig.fan_med_speed = numVal
              else if (key === 'fan_high_speed' && numVal >= 0 && numVal <= 100) currentConfig.fan_high_speed = numVal
              else if (key === 'fan_fix_mode' && numVal >= 0 && numVal <= 2) currentConfig.fan_fix_mode = numVal
            }
          }
        }
      }

      // Extract payloads array
      const payloadsMatch = data.match(/payloads\s*=\s*\[([\s\S]*?)\]/)
      if (payloadsMatch && payloadsMatch[1]) {
        const payloadBody = payloadsMatch[1]
        const payloadStrings = payloadBody.match(/"([^"]+)"/g)
        if (payloadStrings) {
          userPayloads = payloadStrings.map(function (s) { return s.replace(/"/g, '') })
        }
      }

      // Apply theme
      themes_setTheme(currentConfig.theme)
      // Apply sound setting
      sfx_setEnabled(currentConfig.nav_sounds)

      // Also set the global CONFIG for backward compatibility
      // (serve.js.aes loads config via include(), this is for dynamic changes)

      for (let idx = 0; idx < configOptions.length; idx++) {
        updateValueText(idx)
      }
      configLoaded = true
      log('Config loaded successfully (safe parser)')
    } catch (e) {
      log('ERROR: Failed to parse config: ' + (e as Error).message)
      configLoaded = true // Allow saving even on parse error
    }
  }

  function loadConfig () {
    fs.read('config.js', function (err: Error | null, data?: string) {
      if (err) {
        log('ERROR: Failed to read config: ' + err.message)
        return
      }

      if (data) {
        safeParseConfig(data)
      }
    })
  }

  function handleButtonPress () {
    sfx_playSelect()

    if (state.currentButton === state.buttons.length - 1) {
      // Back button - go to main menu
      log('Going back to main menu...')
      try {
        include('main-menu.js')
      } catch (e) {
        log('ERROR: ' + (e as Error).message)
      debugging.restart()
      }
    } else if (state.currentButton < configOptions.length) {
      const option = configOptions[state.currentButton]!
      const key = option.key

      if (option.type === 'cycle') {
        currentConfig.jb_behavior = (currentConfig.jb_behavior + 1) % jbBehaviorLabels.length
        log(key + ' = ' + jbBehaviorLabels[currentConfig.jb_behavior])
      } else if (option.type === 'theme') {
        currentConfig.theme = (currentConfig.theme + 1) % themes_getCount()
        themes_setTheme(currentConfig.theme)
        log(key + ' = ' + themeNames[currentConfig.theme])
      } else if (option.type === 'retry') {
        currentConfig.retry_count = (currentConfig.retry_count % 3) + 1
        log(key + ' = ' + currentConfig.retry_count)
      } else if (option.type === 'fan_threshold') {
        const cfgVal = (currentConfig as any)[key] as number
        const curIdx = fanThresholdValues.indexOf(cfgVal)
        const nextIdx = (curIdx + 1) % fanThresholdValues.length
        ;(currentConfig as any)[key] = fanThresholdValues[nextIdx]!
        log(key + ' = ' + (currentConfig as any)[key] + '°C')
      } else if (option.type === 'fan_speed') {
        const cfgVal = (currentConfig as any)[key] as number
        const curIdx = fanSpeedValues.indexOf(cfgVal)
        const nextIdx = (curIdx + 1) % fanSpeedValues.length
        ;(currentConfig as any)[key] = fanSpeedValues[nextIdx]!
        log(key + ' = ' + (currentConfig as any)[key] + '%')
      } else if (option.type === 'fan_mode') {
        currentConfig.fan_fix_mode = (currentConfig.fan_fix_mode + 1) % fanFixModeLabels.length
        log(key + ' = ' + fanFixModeLabels[currentConfig.fan_fix_mode])
      } else {
        // Toggle
        const boolKey = key as 'autolapse' | 'autopoop' | 'autoclose' | 'music' | 'nav_sounds'
        currentConfig[boolKey] = !currentConfig[boolKey]

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

        // Apply music toggle immediately
        if (key === 'music') {
          if (currentConfig.music) {
            sfx_playBgm()
          } else {
            sfx_stopBgm()
          }
        }

        // Apply sound toggle immediately
        if (key === 'nav_sounds') {
          sfx_setEnabled(currentConfig.nav_sounds)
        }

        log(key + ' = ' + currentConfig[boolKey])
      }

      updateValueText(state.currentButton)
      saveConfig()
    }
  }

  jsmaf.onKeyDown = function (keyCode) {
    if (ui_handleVerticalNav(state, keyCode)) return
    if (keyCode === 14) {
      handleButtonPress()
    } else if (keyCode === 13) {
      // Circle - go back to main menu
      log('Going back to main menu...')
      try {
        include('main-menu.js')
      } catch (e) {
        log('ERROR: ' + (e as Error).message)
      debugging.restart()
      }
    }
  }

  ui_updateHighlight(state)
  loadConfig()

  log(lang.configLoaded)
})()

if (typeof libc_addr === 'undefined') {
  include('userland.js')
}

(function () {
  log('Loading config UI...')

  var fs = {
    write: function (filename, content, callback) {
      var xhr = new jsmaf.XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'))
        }
      }
      xhr.open('POST', 'file://../download0/' + filename, true)
      xhr.send(content)
    },

    read: function (filename, callback) {
      var xhr = new jsmaf.XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'), xhr.responseText)
        }
      }
      xhr.open('GET', 'file://../download0/' + filename, true)
      xhr.send()
    }
  }

  var currentConfig = {
    autolapse: false,
    autopoop: false,
    autoclose: false
  }

  var currentButton = 0
  var buttons = []
  var buttonTexts = []
  var buttonMarkers = []
  var valueTexts = []

  var normalButtonImg = 'file:///assets/img/button_over_9.png'
  var selectedButtonImg = 'file:///assets/img/button_over_9.png'

  jsmaf.root.children.length = 0

  var background = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  })
  jsmaf.root.children.push(background)

  var logo = new Image({
    url: 'file:///../download0/img/logo.png',
    x: 1620,
    y: 0,
    width: 300,
    height: 169
  })
  jsmaf.root.children.push(logo)

  var title = new Image({
    url: 'file:///../download0/img/config_btn_txt.png',
    x: 760,
    y: 100,
    width: 400,
    height: 75
  })
  jsmaf.root.children.push(title)

  // Include the stats tracker
  include('stats-tracker.js')

  // Load and display stats
  stats.load()
  var statsData = stats.get()

  // Create text elements for each stat
  var statsToDisplay = [
    'Total Attempts: ' + statsData.total,
    'Successes: ' + statsData.success,
    'Failures: ' + statsData.failures,
    'Success Rate: ' + statsData.successRate,
    'Failure Rate: ' + statsData.failureRate
  ]

  // Display each stat line
  for (var i = 0; i < statsToDisplay.length; i++) {
    var lineText = new jsmaf.Text()
    lineText.text = statsToDisplay[i]
    lineText.background = '#FFFFFF'
    lineText.x = 20
    lineText.y = 120 + (i * 20)
    jsmaf.root.children.push(lineText)
  }

  var configOptions = [
    { key: 'autolapse', label: 'Auto Lapse', textImg: 'auto_lapse_btn_txt.png' },
    { key: 'autopoop', label: 'Auto Poop', textImg: 'auto_poop_btn_txt.png' },
    { key: 'autoclose', label: 'Auto Close', textImg: 'auto_close_btn_txt.png' }
  ]

  var centerX = 960
  var startY = 300
  var buttonSpacing = 120
  var buttonWidth = 400
  var buttonHeight = 80

  for (var i = 0; i < configOptions.length; i++) {
    var btnX = centerX - buttonWidth / 2
    var btnY = startY + i * buttonSpacing

    var button = new Image({
      url: normalButtonImg,
      x: btnX,
      y: btnY,
      width: buttonWidth,
      height: buttonHeight
    })
    buttons.push(button)
    jsmaf.root.children.push(button)

    buttonMarkers.push(null)

    var textImgWidth = 240
    var textImgHeight = 40

    var textImg = new Image({
      url: 'file:///../download0/img/' + configOptions[i].textImg,
      x: btnX + 20,
      y: btnY + 20,
      width: textImgWidth,
      height: textImgHeight
    })
    buttonTexts.push(textImg)
    jsmaf.root.children.push(textImg)

    var checkmark = new Image({
      url: currentConfig[configOptions[i].key] ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png',
      x: btnX + 320,
      y: btnY + 20,
      width: 40,
      height: 40
    })
    valueTexts.push(checkmark)
    jsmaf.root.children.push(checkmark)
  }

  var backX = centerX - buttonWidth / 2
  var backY = startY + configOptions.length * buttonSpacing + 100

  var backButton = new Image({
    url: normalButtonImg,
    x: backX,
    y: backY,
    width: buttonWidth,
    height: buttonHeight
  })
  buttons.push(backButton)
  jsmaf.root.children.push(backButton)

  var backMarker = new Image({
    url: 'file:///assets/img/ad_pod_marker.png',
    x: backX + buttonWidth - 50,
    y: backY + 35,
    width: 12,
    height: 12,
    visible: false
  })
  buttonMarkers.push(backMarker)
  jsmaf.root.children.push(backMarker)

  var backTextImgWidth = buttonWidth * 0.5
  var backTextImgHeight = buttonHeight * 0.5

  var backTextImg = new Image({
    url: 'file:///../download0/img/back_btn_txt.png',
    x: backX + (buttonWidth - backTextImgWidth) / 2,
    y: backY + (buttonHeight - backTextImgHeight) / 2,
    width: backTextImgWidth,
    height: backTextImgHeight
  })
  buttonTexts.push(backTextImg)
  jsmaf.root.children.push(backTextImg)

  function updateHighlight () {
    for (var i = 0; i < buttons.length; i++) {
      if (i === currentButton) {
        buttons[i].url = selectedButtonImg
        buttons[i].alpha = 1.0
        buttons[i].borderColor = 'rgb(100,180,255)'
        buttons[i].borderWidth = 3
        if (buttonMarkers[i]) buttonMarkers[i].visible = true
      } else {
        buttons[i].url = normalButtonImg
        buttons[i].alpha = 0.7
        buttons[i].borderColor = 'transparent'
        buttons[i].borderWidth = 0
        if (buttonMarkers[i]) buttonMarkers[i].visible = false
      }
    }
  }

  function updateValueText (index) {
    var key = configOptions[index].key
    var value = currentConfig[key]
    valueTexts[index].url = value ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png'
  }

  function saveConfig () {
    var configContent = 'var CONFIG = {\n'
    configContent += '    autolapse: ' + currentConfig.autolapse + ', \n'
    configContent += '    autopoop: ' + currentConfig.autopoop + ',\n'
    configContent += '    autoclose: ' + currentConfig.autoclose + '\n'
    configContent += '};\n\n'
    configContent += 'var payloads = [ //to be ran after jailbroken\n'
    configContent += '    "/mnt/sandbox/download/CUSA00960/payloads/aiofix_network.elf"\n'
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
    fs.read('config.js', function (err, data) {
      if (err) {
        log('ERROR: Failed to read config: ' + err.message)
        return
      }

      try {
        eval(data) // eslint-disable-line no-eval
        if (typeof CONFIG !== 'undefined') {
          currentConfig.autolapse = CONFIG.autolapse || false
          currentConfig.autopoop = CONFIG.autopoop || false
          currentConfig.autoclose = CONFIG.autoclose || false

          for (var i = 0; i < configOptions.length; i++) {
            updateValueText(i)
          }
          log('Config loaded successfully')
        }
      } catch (e) {
        log('ERROR: Failed to parse config: ' + e.message)
      }
    })
  }

  function handleButtonPress () {
    if (currentButton === buttons.length - 1) {
      log('Going back to main menu...')
      try {
        include('main-menu.js')
      } catch (e) {
        log('ERROR loading main-menu.js: ' + e.message)
      }
    } else if (currentButton < configOptions.length) {
      var key = configOptions[currentButton].key
      currentConfig[key] = !currentConfig[key]

      if (key === 'autolapse' && currentConfig[key] === true) {
        currentConfig.autopoop = false
        for (var i = 0; i < configOptions.length; i++) {
          if (configOptions[i].key === 'autopoop') {
            updateValueText(i)
            break
          }
        }
        log('autopoop disabled (autolapse enabled)')
      } else if (key === 'autopoop' && currentConfig[key] === true) {
        currentConfig.autolapse = false
        for (var i = 0; i < configOptions.length; i++) {
          if (configOptions[i].key === 'autolapse') {
            updateValueText(i)
            break
          }
        }
        log('autolapse disabled (autopoop enabled)')
      }

      log(key + ' = ' + currentConfig[key])
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
      log('Going back to main menu...')
      try {
        include('main-menu.js')
      } catch (e) {
        log('ERROR loading main-menu.js: ' + e.message)
      }
    }
  }

  updateHighlight()
  loadConfig()

  log('Config UI loaded')
})()

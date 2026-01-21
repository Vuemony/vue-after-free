(function () {
  log('Loading main menu...')

  var currentButton = 0
  var buttons = []
  var buttonTexts = []
  var buttonMarkers = []

  var normalButtonImg = 'file:///assets/img/button_over_9.png'
  var selectedButtonImg = 'file:///assets/img/button_over_9.png'

  jsmaf.root.children.length = 0

  var audio = new jsmaf.AudioClip()
  audio.volume = 0.5  // 50% volume
  audio.open('file://../download0/sfx/bgm.wav')

  var background = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  })
  jsmaf.root.children.push(background)

  var centerX = 960
  var logoWidth = 600
  var logoHeight = 338

  var logo = new Image({
    url: 'file:///../download0/img/logo.png',
    x: centerX - logoWidth / 2,
    y: 50,
    width: logoWidth,
    height: logoHeight
  })
  jsmaf.root.children.push(logo)

  var menuOptions = [
    { label: 'Jailbreak', script: 'loader.js', textImg: 'jailbreak_btn_txt.png' },
    { label: 'Payload Menu', script: 'payload_host.js', textImg: 'pl_menu_btn_txt.png' },
    { label: 'Config', script: 'config_ui.js', textImg: 'config_btn_txt.png' }
  ]

  var startY = 450
  var buttonSpacing = 120
  var buttonWidth = 400
  var buttonHeight = 80

  for (var i = 0; i < menuOptions.length; i++) {
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

    var marker = new Image({
      url: 'file:///assets/img/ad_pod_marker.png',
      x: btnX + buttonWidth - 50,
      y: btnY + 35,
      width: 12,
      height: 12,
      visible: false
    })
    buttonMarkers.push(marker)
    jsmaf.root.children.push(marker)

    var textImgWidth = buttonWidth * 0.5
    var textImgHeight = buttonHeight * 0.5

    var textImg = new Image({
      url: 'file:///../download0/img/' + menuOptions[i].textImg,
      x: btnX + (buttonWidth - textImgWidth) / 2,
      y: btnY + (buttonHeight - textImgHeight) / 2,
      width: textImgWidth,
      height: textImgHeight
    })
    buttonTexts.push(textImg)
    jsmaf.root.children.push(textImg)
  }

  var exitX = centerX - buttonWidth / 2
  var exitY = startY + menuOptions.length * buttonSpacing + 100

  var exitButton = new Image({
    url: normalButtonImg,
    x: exitX,
    y: exitY,
    width: buttonWidth,
    height: buttonHeight
  })
  buttons.push(exitButton)
  jsmaf.root.children.push(exitButton)

  var exitMarker = new Image({
    url: 'file:///assets/img/ad_pod_marker.png',
    x: exitX + buttonWidth - 50,
    y: exitY + 35,
    width: 12,
    height: 12,
    visible: false
  })
  buttonMarkers.push(exitMarker)
  jsmaf.root.children.push(exitMarker)

  var exitTextImgWidth = buttonWidth * 0.5
  var exitTextImgHeight = buttonHeight * 0.5

  var exitTextImg = new Image({
    url: 'file:///../download0/img/exit_btn_txt.png',
    x: exitX + (buttonWidth - exitTextImgWidth) / 2,
    y: exitY + (buttonHeight - exitTextImgHeight) / 2,
    width: exitTextImgWidth,
    height: exitTextImgHeight
  })
  buttonTexts.push(exitTextImg)
  jsmaf.root.children.push(exitTextImg)

  function updateHighlight () {
    for (var i = 0; i < buttons.length; i++) {
      if (i === currentButton) {
        buttons[i].url = selectedButtonImg
        buttons[i].alpha = 1.0
        buttons[i].borderColor = 'rgb(100,180,255)'
        buttons[i].borderWidth = 3
        buttonMarkers[i].visible = true
      } else {
        buttons[i].url = normalButtonImg
        buttons[i].alpha = 0.7
        buttons[i].borderColor = 'transparent'
        buttons[i].borderWidth = 0
        buttonMarkers[i].visible = false
      }
    }
  }

  function handleButtonPress () {
    if (currentButton === buttons.length - 1) {
      log('Exiting application...')
      try {
        if (typeof libc_addr === 'undefined') {
          log('Loading userland.js...')
          include('userland.js')
        }

        if (!fn.getpid) fn.register(0x14, 'getpid', 'bigint')
        if (!fn.kill) fn.register(0x25, 'kill', 'bigint')

        var pid = fn.getpid()
        var pid_num = (pid instanceof BigInt) ? pid.lo : pid
        log('Current PID: ' + pid_num)
        log('Sending SIGKILL to PID ' + pid_num)

        fn.kill(pid, new BigInt(0, 9))
      } catch (e) {
        log('ERROR during exit: ' + e.message)
        if (e.stack) log(e.stack)
      }

      jsmaf.exit()
    } else if (currentButton < menuOptions.length) {
      var selectedOption = menuOptions[currentButton]
      log('Loading ' + selectedOption.script + '...')
      try {
        include(selectedOption.script)
      } catch (e) {
        log('ERROR loading ' + selectedOption.script + ': ' + e.message)
        if (e.stack) log(e.stack)
      }
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
    }
  }

  updateHighlight()

  log('Main menu loaded')
})()

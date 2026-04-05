import { lang, useImageText, textImageBase } from 'download0/languages'
import { animateZoomIn, animateZoomOut, initSfx, playCursor, playConfirm, playCancel } from 'download0/themes/default/anim'

(function () {
  include('languages.js')
  include('themes/default/anim.js')

  initSfx()

  let currentButton = 0
  const buttons: Image[] = []
  const buttonTexts: jsmaf.Text[] = []
  const buttonMarkers: Image[] = []
  const buttonOrigPos: { x: number, y: number }[] = []
  const textOrigPos: { x: number, y: number }[] = []

  const normalButtonImg = 'file:///assets/img/button_over_9.png'
  const selectedButtonImg = 'file:///assets/img/button_over_9.png'

  jsmaf.root.children.length = 0

  new Style({ name: 'white', color: 'white', size: 24 })
  new Style({ name: 'title', color: 'white', size: 32 })

  const background = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  })
  jsmaf.root.children.push(background)

  const centerX = 960
  const logoWidth = 600
  const logoHeight = 338

  const logo = new Image({
    url: 'file:///../download0/img/logo.png',
    x: centerX - logoWidth / 2,
    y: 50,
    width: logoWidth,
    height: logoHeight
  })
  jsmaf.root.children.push(logo)

  const menuOptions = [
    { label: lang.jailbreak, script: 'loader.js', imgKey: 'jailbreak' },
    { label: lang.payloadMenu, script: 'payload_host.js', imgKey: 'payloadMenu' },
    { label: lang.config, script: 'config_ui.js', imgKey: 'config' }
  ]

  const startY = 450
  const buttonSpacing = 120
  const buttonWidth = 400
  const buttonHeight = 80

  for (let i = 0; i < menuOptions.length; i++) {
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

    const marker = new Image({
      url: 'file:///assets/img/ad_pod_marker.png',
      x: btnX + buttonWidth - 50,
      y: btnY + 35,
      width: 12,
      height: 12,
      visible: false
    })
    buttonMarkers.push(marker)
    jsmaf.root.children.push(marker)

    let btnText: Image | jsmaf.Text
    if (useImageText) {
      btnText = new Image({
        url: textImageBase + menuOptions[i]!.imgKey + '.png',
        x: btnX + 20,
        y: btnY + 15,
        width: 300,
        height: 50
      })
    } else {
      btnText = new jsmaf.Text()
      btnText.text = menuOptions[i]!.label
      btnText.x = btnX + buttonWidth / 2 - 60
      btnText.y = btnY + buttonHeight / 2 - 12
      btnText.style = 'white'
    }
    buttonTexts.push(btnText)
    jsmaf.root.children.push(btnText)

    buttonOrigPos.push({ x: btnX, y: btnY })
    textOrigPos.push({ x: btnText.x, y: btnText.y })
  }

  const exitX = centerX - buttonWidth / 2
  const exitY = startY + menuOptions.length * buttonSpacing + 100

  const exitButton = new Image({
    url: normalButtonImg,
    x: exitX,
    y: exitY,
    width: buttonWidth,
    height: buttonHeight
  })
  buttons.push(exitButton)
  jsmaf.root.children.push(exitButton)

  const exitMarker = new Image({
    url: 'file:///assets/img/ad_pod_marker.png',
    x: exitX + buttonWidth - 50,
    y: exitY + 35,
    width: 12,
    height: 12,
    visible: false
  })
  buttonMarkers.push(exitMarker)
  jsmaf.root.children.push(exitMarker)

  let exitText: Image | jsmaf.Text
  if (useImageText) {
    exitText = new Image({
      url: textImageBase + 'exit.png',
      x: exitX + 20,
      y: exitY + 15,
      width: 300,
      height: 50
    })
  } else {
    exitText = new jsmaf.Text()
    exitText.text = lang.exit
    exitText.x = exitX + buttonWidth / 2 - 20
    exitText.y = exitY + buttonHeight / 2 - 12
    exitText.style = 'white'
  }
  buttonTexts.push(exitText)
  jsmaf.root.children.push(exitText)

  buttonOrigPos.push({ x: exitX, y: exitY })
  textOrigPos.push({ x: exitText.x, y: exitText.y })

  const zoomInRef:  { value: number | null } = { value: null }
  const zoomOutRef: { value: number | null } = { value: null }
  let prevButton = -1

  function updateHighlight () {
    const prevButtonObj = buttons[prevButton]
    const buttonMarker = buttonMarkers[prevButton]
    if (prevButton >= 0 && prevButton !== currentButton && prevButtonObj && buttonMarker) {
      prevButtonObj.url = normalButtonImg
      prevButtonObj.alpha = 0.7
      prevButtonObj.borderColor = 'transparent'
      prevButtonObj.borderWidth = 0
      buttonMarker.visible = false
      animateZoomOut(prevButtonObj, buttonTexts[prevButton]!, buttonOrigPos[prevButton]!.x, buttonOrigPos[prevButton]!.y, textOrigPos[prevButton]!.x, textOrigPos[prevButton]!.y, buttonWidth, buttonHeight, zoomOutRef)
    }

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const buttonMarker = buttonMarkers[i]
      const buttonText = buttonTexts[i]
      const buttonOrigPos_ = buttonOrigPos[i]
      const textOrigPos_ = textOrigPos[i]
      if (button === undefined || buttonText === undefined || buttonOrigPos_ === undefined || textOrigPos_ === undefined || buttonMarker === undefined) continue
      if (i === currentButton) {
        button.url = selectedButtonImg
        button.alpha = 1.0
        button.borderColor = 'rgb(100,180,255)'
        button.borderWidth = 3
        buttonMarker.visible = true
        animateZoomIn(button, buttonText, buttonOrigPos_.x, buttonOrigPos_.y, textOrigPos_.x, textOrigPos_.y, buttonWidth, buttonHeight, zoomInRef)
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
        buttonMarker.visible = false
      }
    }

    prevButton = currentButton
  }

  function handleButtonPress () {
    if (currentButton === buttons.length - 1) {
      playCancel()
      include('includes/kill_vue.js')
    } else if (currentButton < menuOptions.length) {
      const selectedOption = menuOptions[currentButton]
      if (!selectedOption) return
      if (selectedOption.script === 'loader.js') {
        jsmaf.onKeyDown = function () {}
      }
      playConfirm()
      try {
        if (selectedOption.script.includes('loader.js')) {
          include(selectedOption.script)
        } else {
          include('themes/' + (typeof CONFIG !== 'undefined' && CONFIG.theme ? CONFIG.theme : 'default') + '/' + selectedOption.script)
        }
      } catch (e) {
        // silent
      }
    }
  }

  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6 || keyCode === 5) {
      currentButton = (currentButton + 1) % buttons.length
      playCursor()
      updateHighlight()
    } else if (keyCode === 4 || keyCode === 7) {
      currentButton = (currentButton - 1 + buttons.length) % buttons.length
      playCursor()
      updateHighlight()
    } else if (keyCode === 14) {
      handleButtonPress()
    }
  }

  updateHighlight()

  // auto_jailbreak: if enabled in config, skip menu and go straight to jailbreak
  jsmaf.setTimeout(function () {
    try {
      if (typeof CONFIG !== 'undefined' && CONFIG.auto_jailbreak === true) {
        log('[*] auto_jailbreak enabled - starting automatically...')
        jsmaf.onKeyDown = function () {}
        include('loader.js')
      }
    } catch (e) {
      log('[ERR] auto_jailbreak failed: ' + (e as Error).message)
    }
  }, 500)
})()

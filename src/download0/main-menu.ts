import { lang, useImageText, textImageBase } from 'download0/languages'
import { libc_addr } from 'download0/userland'
import { fn, BigInt } from 'download0/types'
import { themes_getTheme } from 'download0/themes'
import { ui_initScreen, ui_addBackground, ui_addLogo, ui_playMusic, ui_createMenuState, ui_updateHighlight, ui_handleVerticalNav, UI_NORMAL_BTN, UI_MARKER_IMG, UIMenuState } from 'download0/ui'
import { sfx_playSelect } from 'download0/sfx'

;(function () {
  include('languages.js')
  include('themes.js')
  include('sfx.js')
  include('ui.js')
  log(lang.loadingMainMenu)

  const theme = themes_getTheme()

  ui_initScreen()
  ui_playMusic()
  ui_addBackground()

  const centerX = 960
  const logoWidth = 600
  const logoHeight = 338

  ui_addLogo(centerX - logoWidth / 2, 50, logoWidth, logoHeight)

  // Main menu entries
  const menuOptions = [
    { label: lang.jailbreak, script: 'loader.js', imgKey: 'jailbreak' },
    { label: lang.payloadMenu, script: 'payload_host.js', imgKey: 'payloadMenu' },
    { label: lang.tools || 'Tools', script: 'tools.js', imgKey: 'tools' },
    { label: lang.fileBrowser, script: 'file-browser.js', imgKey: 'fileBrowser' },
    { label: lang.systemInfo, script: 'system-info.js', imgKey: 'systemInfo' },
    { label: lang.logViewer, script: 'log-viewer.js', imgKey: 'logViewer' },
    { label: lang.config, script: 'config_ui.js', imgKey: 'config' }
  ]

  const startY = 400
  const buttonSpacing = 72
  const buttonWidth = 400
  const buttonHeight = 65

  const state = ui_createMenuState(buttonWidth, buttonHeight)

  for (let i = 0; i < menuOptions.length; i++) {
    const option = menuOptions[i]!
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

    const marker = new Image({
      url: UI_MARKER_IMG,
      x: btnX + buttonWidth - 50,
      y: btnY + 28,
      width: 12,
      height: 12,
      visible: false
    })
    state.buttonMarkers.push(marker)
    jsmaf.root.children.push(marker)

    let btnText: Image | jsmaf.Text
    if (useImageText) {
      btnText = new Image({
        url: textImageBase + option.imgKey + '.png',
        x: btnX + 20,
        y: btnY + 10,
        width: 300,
        height: 45
      })
    } else {
      btnText = new jsmaf.Text()
      btnText.text = option.label
      btnText.x = btnX + buttonWidth / 2 - (option.label.length * 5)
      btnText.y = btnY + buttonHeight / 2 - 12
      btnText.style = 'white'
    }
    state.buttonTexts.push(btnText)
    jsmaf.root.children.push(btnText)

    state.buttonOrigPos.push({ x: btnX, y: btnY })
    state.textOrigPos.push({ x: btnText.x, y: btnText.y })
  }

  // Exit button
  const exitX = centerX - buttonWidth / 2
  const exitY = startY + menuOptions.length * buttonSpacing + 30

  const exitButton = new Image({
    url: UI_NORMAL_BTN,
    x: exitX,
    y: exitY,
    width: buttonWidth,
    height: buttonHeight
  })
  state.buttons.push(exitButton)
  jsmaf.root.children.push(exitButton)

  const exitMarker = new Image({
    url: UI_MARKER_IMG,
    x: exitX + buttonWidth - 50,
    y: exitY + 28,
    width: 12,
    height: 12,
    visible: false
  })
  state.buttonMarkers.push(exitMarker)
  jsmaf.root.children.push(exitMarker)

  let exitText: Image | jsmaf.Text
  if (useImageText) {
    exitText = new Image({
      url: textImageBase + 'exit.png',
      x: exitX + 20,
      y: exitY + 10,
      width: 300,
      height: 45
    })
  } else {
    exitText = new jsmaf.Text()
    exitText.text = lang.exit
    exitText.x = exitX + buttonWidth / 2 - 20
    exitText.y = exitY + buttonHeight / 2 - 12
    exitText.style = 'white'
  }
  state.buttonTexts.push(exitText)
  jsmaf.root.children.push(exitText)

  state.buttonOrigPos.push({ x: exitX, y: exitY })
  state.textOrigPos.push({ x: exitText.x, y: exitText.y })

  // Version string at bottom
  const versionText = new jsmaf.Text()
  versionText.text = 'Vue-After-Free v2.0'
  versionText.x = 860
  versionText.y = 1040
  versionText.style = 'dim'
  jsmaf.root.children.push(versionText)

  function handleButtonPress () {
    sfx_playSelect()

    if (state.currentButton === state.buttons.length - 1) {
      // Exit button
      log('Exiting application...')
      try {
        if (typeof libc_addr === 'undefined') {
          log('Loading userland.js...')
          include('userland.js')
        }

        fn.register(0x14, 'getpid', [], 'bigint')
        fn.register(0x25, 'kill', ['bigint', 'bigint'], 'bigint')

        const pid = fn.getpid()
        const pid_num = (pid instanceof BigInt) ? pid.lo : pid
        log('Current PID: ' + pid_num)
        log('Sending SIGKILL to PID ' + pid_num)

        fn.kill(pid, new BigInt(0, 9))
      } catch (e) {
        log('ERROR during exit: ' + (e as Error).message)
        if ((e as Error).stack) log((e as Error).stack!)
      }

      jsmaf.exit()
    } else if (state.currentButton < menuOptions.length) {
      const selectedOption = menuOptions[state.currentButton]
      if (!selectedOption) return
      if (selectedOption.script === 'loader.js') {
        jsmaf.onKeyDown = function () {}
      }
      log('Loading ' + selectedOption.script + '...')
      try {
        include(selectedOption.script)
      } catch (e) {
        log('ERROR loading ' + selectedOption.script + ': ' + (e as Error).message)
        if ((e as Error).stack) log((e as Error).stack!)
      }
    }
  }

  jsmaf.onKeyDown = function (keyCode) {
    if (ui_handleVerticalNav(state, keyCode)) return
    if (keyCode === 14) {
      handleButtonPress()
    }
  }

  ui_updateHighlight(state)

  log(lang.mainMenuLoaded)
})()

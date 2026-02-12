import { fn, mem, BigInt } from 'download0/types'
import { binloader_init } from 'download0/binloader'
import { libc_addr } from 'download0/userland'
import { lang, useImageText, textImageBase } from 'download0/languages'
import { checkJailbroken } from 'download0/check-jailbroken'
import { themes_getTheme } from 'download0/themes'
import { ui_initScreen, ui_addBackground, ui_addLogo, ui_addTitle, ui_playMusic, ui_createMenuState, ui_updateHighlight, UI_NORMAL_BTN, UI_MARKER_IMG, UIMenuState } from 'download0/ui'
import { sfx_playNav, sfx_playSelect } from 'download0/sfx'

;(function () {
  if (typeof libc_addr === 'undefined') {
    log('Loading userland.js...')
    include('userland.js')
    log('userland.js loaded')
  } else {
    log('userland.js already loaded (libc_addr defined)')
  }

  log('Loading check-jailbroken.js...')
  include('check-jailbroken.js')
  include('themes.js')
  include('sfx.js')
  include('languages.js')
  include('ui.js')

  ui_playMusic()

  is_jailbroken = checkJailbroken()
  const theme = themes_getTheme()

  ui_initScreen()
  ui_addBackground()
  ui_addLogo(1620, 0, 300, 169)

  if (useImageText) {
    ui_addTitle(lang.payloadMenu, 'payloadMenu', 830, 100, 250, 60)
  } else {
    ui_addTitle(lang.payloadMenu, 'payloadMenu', 880, 100, 250, 60)
  }

  fn.register(0x05, 'open_sys', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x06, 'close_sys', ['bigint'], 'bigint')
  fn.register(0x110, 'getdents', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x03, 'read_sys', ['bigint', 'bigint', 'bigint'], 'bigint')

  type FileEntry = { name: string, path: string, isFavorite: boolean }
  const fileList: FileEntry[] = []

  // === Favorites System ===
  let favorites: string[] = []

  function loadFavorites (): void {
    try {
      const xhr = new jsmaf.XMLHttpRequest()
      xhr.open('GET', 'file://../download0/favorites.json', false) // synchronous
      xhr.send()
      if (xhr.status === 0 || xhr.status === 200) {
        if (xhr.responseText) {
          try {
            favorites = JSON.parse(xhr.responseText)
            if (!Array.isArray(favorites)) favorites = []
          } catch (e) {
            favorites = []
          }
        }
      }
    } catch (e) {
      favorites = []
    }
  }

  function saveFavorites (): void {
    try {
      const xhr = new jsmaf.XMLHttpRequest()
      xhr.open('POST', 'file://../download0/favorites.json', true)
      xhr.send(JSON.stringify(favorites))
    } catch (e) {
      log('Failed to save favorites: ' + (e as Error).message)
    }
  }

  function toggleFavorite (path: string): boolean {
    const idx = favorites.indexOf(path)
    if (idx >= 0) {
      favorites.splice(idx, 1)
      saveFavorites()
      return false
    } else {
      favorites.push(path)
      saveFavorites()
      return true
    }
  }

  function isFavorite (path: string): boolean {
    return favorites.indexOf(path) >= 0
  }

  // Load favorites first
  loadFavorites()

  const scanPaths = ['/download0/payloads']

  if (is_jailbroken) {
    scanPaths.push('/data/payloads')
    for (let i = 0; i <= 7; i++) {
      scanPaths.push('/mnt/usb' + i + '/payloads')
      scanPaths.push('/mnt/usb' + i) // Also scan USB root
      scanPaths.push('/mnt/usb' + i + '/PS4/payloads') // Common PS4 folder
    }
    // Also scan common HDD locations
    scanPaths.push('/data')
    scanPaths.push('/user/home')
  }

  log('Scanning paths: ' + scanPaths.join(', '))

  const path_addr = mem.malloc(256)
  const buf = mem.malloc(4096)

  for (const currentPath of scanPaths) {
    log('Scanning ' + currentPath + ' for files...')

    for (let i = 0; i < currentPath.length; i++) {
      mem.view(path_addr).setUint8(i, currentPath.charCodeAt(i))
    }
    mem.view(path_addr).setUint8(currentPath.length, 0)

    const fd = fn.open_sys(path_addr, new BigInt(0, 0), new BigInt(0, 0))

    if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
      const count = fn.getdents(fd, buf, new BigInt(0, 4096))

      if (!count.eq(new BigInt(0xffffffff, 0xffffffff)) && count.lo > 0) {
        let offset = 0
        while (offset < count.lo) {
          const d_reclen = mem.view(buf.add(new BigInt(0, offset + 4))).getUint16(0, true)
          const d_type = mem.view(buf.add(new BigInt(0, offset + 6))).getUint8(0)
          const d_namlen = mem.view(buf.add(new BigInt(0, offset + 7))).getUint8(0)

          let name = ''
          for (let i = 0; i < d_namlen; i++) {
            name += String.fromCharCode(mem.view(buf.add(new BigInt(0, offset + 8 + i))).getUint8(0))
          }

          if (d_type === 8 && name !== '.' && name !== '..') {
            const lowerName = name.toLowerCase()
            if (lowerName.endsWith('.elf') || lowerName.endsWith('.bin') || lowerName.endsWith('.js')) {
              const fullPath = currentPath + '/' + name
              fileList.push({ name, path: fullPath, isFavorite: isFavorite(fullPath) })
              log('Added file: ' + name + ' from ' + currentPath)
            }
          }

          offset += d_reclen
        }
      }
      fn.close_sys(fd)
    } else {
      log('Failed to open ' + currentPath)
    }
  }

  // Sort: favorites first, then alphabetical
  fileList.sort(function (a, b) {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  log('Total files found: ' + fileList.length)

  const startY = 200
  const buttonSpacing = 90
  const buttonsPerRow = 5
  const buttonWidth = 300
  const buttonHeight = 80
  const startX = 130
  const xSpacing = 340

  const state = ui_createMenuState(buttonWidth, buttonHeight)

  for (let i = 0; i < fileList.length; i++) {
    const row = Math.floor(i / buttonsPerRow)
    const col = i % buttonsPerRow

    let displayName = fileList[i]!.name

    const btnX = startX + col * xSpacing
    const btnY = startY + row * buttonSpacing

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
      y: btnY + 35,
      width: 12,
      height: 12,
      visible: false
    })
    state.buttonMarkers.push(marker)
    jsmaf.root.children.push(marker)

    if (displayName.length > 30) {
      displayName = displayName.substring(0, 27) + '...'
    }

    // Show star prefix for favorites
    const favPrefix = fileList[i]!.isFavorite ? '* ' : ''

    const text = new jsmaf.Text()
    text.text = favPrefix + displayName
    text.x = btnX + 20
    text.y = btnY + 30
    text.style = 'white'
    state.buttonTexts.push(text)
    jsmaf.root.children.push(text)

    state.buttonOrigPos.push({ x: btnX, y: btnY })
    state.textOrigPos.push({ x: text.x, y: text.y })
  }

  // Exit/Back button
  const exitX = 810
  const exitY = 980

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
    y: exitY + 35,
    width: 12,
    height: 12,
    visible: false
  })
  state.buttonMarkers.push(exitMarker)
  jsmaf.root.children.push(exitMarker)

  const exitText = new jsmaf.Text()
  exitText.text = lang.back
  exitText.x = exitX + buttonWidth / 2 - 20
  exitText.y = exitY + buttonHeight / 2 - 12
  exitText.style = 'white'
  state.buttonTexts.push(exitText)
  jsmaf.root.children.push(exitText)

  state.buttonOrigPos.push({ x: exitX, y: exitY })
  state.textOrigPos.push({ x: exitText.x, y: exitText.y })

  // Controls hint
  const controlsText = new jsmaf.Text()
  controlsText.text = 'X: Launch  |  SQUARE: Favorite  |  CIRCLE: Back'
  controlsText.x = 600
  controlsText.y = 1040
  controlsText.style = 'dim'
  jsmaf.root.children.push(controlsText)

  // Grid navigation (custom - not using ui_handleVerticalNav)
  jsmaf.onKeyDown = function (keyCode) {
    log('Key pressed: ' + keyCode)

    const fileButtonCount = fileList.length
    const exitButtonIndex = state.buttons.length - 1

    if (keyCode === 6) { // Down
      if (state.currentButton === exitButtonIndex) {
        return
      }
      const nextButton = state.currentButton + buttonsPerRow
      if (nextButton >= fileButtonCount) {
        state.currentButton = exitButtonIndex
      } else {
        state.currentButton = nextButton
      }
      sfx_playNav()
      ui_updateHighlight(state)
    } else if (keyCode === 4) { // Up
      if (state.currentButton === exitButtonIndex) {
        const lastRow = Math.floor((fileButtonCount - 1) / buttonsPerRow)
        const firstInLastRow = lastRow * buttonsPerRow
        let col = 0
        if (fileButtonCount > 0) {
          col = Math.min(buttonsPerRow - 1, (fileButtonCount - 1) % buttonsPerRow)
        }
        state.currentButton = Math.min(firstInLastRow + col, fileButtonCount - 1)
      } else {
        const nextButton = state.currentButton - buttonsPerRow
        if (nextButton >= 0) {
          state.currentButton = nextButton
        }
      }
      sfx_playNav()
      ui_updateHighlight(state)
    } else if (keyCode === 5) { // Right
      if (state.currentButton === exitButtonIndex) {
        return
      }
      const col = state.currentButton % buttonsPerRow
      if (col < buttonsPerRow - 1) {
        const nextButton = state.currentButton + 1
        if (nextButton < fileButtonCount) {
          state.currentButton = nextButton
        }
      }
      sfx_playNav()
      ui_updateHighlight(state)
    } else if (keyCode === 7) { // Left
      if (state.currentButton === exitButtonIndex) {
        state.currentButton = fileButtonCount - 1
      } else {
        const col = state.currentButton % buttonsPerRow
        if (col > 0) {
          state.currentButton = state.currentButton - 1
        }
      }
      sfx_playNav()
      ui_updateHighlight(state)
    } else if (keyCode === 14) { // X - Launch
      sfx_playSelect()
      handleButtonPress()
    } else if (keyCode === 15) { // Square - Toggle Favorite
      if (state.currentButton < fileList.length) {
        const entry = fileList[state.currentButton]
        if (entry) {
          const nowFav = toggleFavorite(entry.path)
          entry.isFavorite = nowFav
          // Update display text
          const textElem = state.buttonTexts[state.currentButton]
          if (textElem) {
            let displayName = entry.name
            if (displayName.length > 30) {
              displayName = displayName.substring(0, 27) + '...'
            }
            (textElem as jsmaf.Text).text = (nowFav ? '* ' : '') + displayName
          }
          log((nowFav ? 'Added to' : 'Removed from') + ' favorites: ' + entry.name)
        }
      }
    } else if (keyCode === 13) { // Circle - Back
      log('Going back to main menu...')
      try {
        include('main-menu.js')
      } catch (e) {
        const err = e as Error
        log('ERROR loading main-menu.js: ' + err.message)
        if (err.stack) log(err.stack)
      }
    }
  }

  function handleButtonPress () {
    if (state.currentButton === state.buttons.length - 1) {
      log('Going back to main menu...')
      try {
        include('main-menu.js')
      } catch (e) {
        const err = e as Error
        log('ERROR loading main-menu.js: ' + err.message)
        if (err.stack) log(err.stack)
      }
    } else if (state.currentButton < fileList.length) {
      const selectedEntry = fileList[state.currentButton]
      if (!selectedEntry) {
        log('No file selected!')
        return
      }

      const filePath = selectedEntry.path
      const fileName = selectedEntry.name

      log('Selected: ' + fileName + ' from ' + filePath)

      try {
        if (fileName.toLowerCase().endsWith('.js')) {
          // Local JavaScript file case (from /download0/payloads)
          if (filePath.startsWith('/download0/')) {
            log('Including JavaScript file: ' + fileName)
            include('payloads/' + fileName)
          } else {
            // External JavaScript file case (from /data/payloads or /mnt/usbX/payloads)
            log('Reading external JavaScript file: ' + filePath)
            const p_addr = mem.malloc(256)
            for (let i = 0; i < filePath.length; i++) {
              mem.view(p_addr).setUint8(i, filePath.charCodeAt(i))
            }
            mem.view(p_addr).setUint8(filePath.length, 0)

            const fd = fn.open_sys(p_addr, new BigInt(0, 0), new BigInt(0, 0))

            if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
              const buf_size = 1024 * 1024 * 1  // 1 MiB
              const readBuf = mem.malloc(buf_size)
              const read_len = fn.read_sys(fd, readBuf, new BigInt(0, buf_size))

              fn.close_sys(fd)

              let scriptContent = ''
              const len = (read_len instanceof BigInt) ? read_len.lo : read_len

              log('File read size: ' + len + ' bytes')

              for (let i = 0; i < len; i++) {
                scriptContent += String.fromCharCode(mem.view(readBuf).getUint8(i))
              }

              log('Executing via eval()...')
              // eslint-disable-next-line no-eval
              eval(scriptContent)
            } else {
              log('ERROR: Could not open file for reading!')
            }
          }
        } else {
          log('Loading binloader.js...')
          include('binloader.js')
          log('binloader.js loaded successfully')

          log('Initializing binloader...')
          const { bl_load_from_file } = binloader_init()

          log('Loading payload from: ' + filePath)

          bl_load_from_file(filePath)
        }
      } catch (e) {
        const err = e as Error
        log('ERROR: ' + err.message)
        if (err.stack) log(err.stack)
      }
    }
  }

  ui_updateHighlight(state)

  log('Interactive UI loaded!')
  log('Total elements: ' + jsmaf.root.children.length)
  log('Buttons: ' + state.buttons.length)
  log('Favorites: ' + favorites.length)
  log('Use arrow keys to navigate, X to select, SQUARE to favorite')
})()

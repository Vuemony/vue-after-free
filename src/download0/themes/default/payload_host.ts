import { fn, mem, BigInt } from 'download0/types'
import { binloader_init } from 'download0/binloader'
import { libc_addr } from 'download0/userland'
import { lang, useImageText, textImageBase } from 'download0/languages'
import { checkJailbroken } from 'download0/check-jailbroken'
import { animateZoomIn, animateZoomOut, initSfx, playCursor, playConfirm, playCancel } from 'download0/themes/default/anim'

;(function () {
  include('themes/default/anim.js')
  initSfx()

  if (typeof libc_addr === 'undefined') {
    include('userland.js')
  }

  include('check-jailbroken.js')

  is_jailbroken = checkJailbroken()

  jsmaf.root.children.length = 0

  new Style({ name: 'white', color: 'white', size: 24 })
  new Style({ name: 'title', color: 'white', size: 32 })

  let currentButton = 0
  const buttons: Image[] = []
  const buttonTexts: jsmaf.Text[] = []
  const buttonMarkers: Image[] = []
  const buttonOrigPos: { x: number, y: number }[] = []
  const textOrigPos: { x: number, y: number }[] = []

  type FileEntry = { name: string, path: string }
  const fileList: FileEntry[] = []

  const normalButtonImg = 'file:///assets/img/button_over_9.png'
  const selectedButtonImg = 'file:///assets/img/button_over_9.png'

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
      url: textImageBase + 'payloadMenu.png',
      x: 830,
      y: 100,
      width: 250,
      height: 60
    })
    jsmaf.root.children.push(title)
  } else {
    const title = new jsmaf.Text()
    title.text = lang.payloadMenu
    title.x = 880
    title.y = 120
    title.style = 'title'
    jsmaf.root.children.push(title)
  }

  fn.register(0x05, 'open_sys', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x06, 'close_sys', ['bigint'], 'bigint')
  fn.register(0x110, 'getdents', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x03, 'read_sys', ['bigint', 'bigint', 'bigint'], 'bigint')

  const scanPaths = ['/download0/payloads']

  if (is_jailbroken) {
    scanPaths.push('/data/payloads')
    // this need sandbox escape to work
    // for (let i = 0; i <= 7; i++) {
    //   scanPaths.push('/mnt/usb' + i + '/payloads')
    // }
  }


  const path_addr = mem.malloc(256)
  const buf = mem.malloc(4096)

  for (const currentPath of scanPaths) {

    for (let i = 0; i < currentPath.length; i++) {
      mem.view(path_addr).setUint8(i, currentPath.charCodeAt(i))
    }
    mem.view(path_addr).setUint8(currentPath.length, 0)

    const fd = fn.open_sys(path_addr, new BigInt(0, 0), new BigInt(0, 0))
    // log('open_sys (' + currentPath + ') returned: ' + fd.toString())

    if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
      const count = fn.getdents(fd, buf, new BigInt(0, 4096))
      // log('getdents returned: ' + count.toString() + ' bytes')

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

          // log('Entry: ' + name + ' type=' + d_type)

          if (d_type === 8 && name !== '.' && name !== '..') {
            const lowerName = name.toLowerCase()
            if (lowerName.endsWith('.elf') || lowerName.endsWith('.bin') || lowerName.endsWith('.js')) {
              fileList.push({ name, path: currentPath + '/' + name })
            }
          }

          offset += d_reclen
        }
      }
      fn.close_sys(fd)
    }
  }


  const startY = 200
  const buttonSpacing = 90
  const buttonsPerRow = 5
  const buttonWidth = 300
  const buttonHeight = 80
  const startX = 130
  const xSpacing = 340

  for (let i = 0; i < fileList.length; i++) {
    const row = Math.floor(i / buttonsPerRow)
    const col = i % buttonsPerRow

    let displayName = fileList[i]!.name

    const btnX = startX + col * xSpacing
    const btnY = startY + row * buttonSpacing

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

    if (displayName.length > 30) {
      displayName = displayName.substring(0, 27) + '...'
    }

    const text = new jsmaf.Text()
    text.text = displayName
    text.x = btnX + 20
    text.y = btnY + 30
    text.style = 'white'
    buttonTexts.push(text)
    jsmaf.root.children.push(text)

    buttonOrigPos.push({ x: btnX, y: btnY })
    textOrigPos.push({ x: text.x, y: text.y })
  }

  let backHint: Image | jsmaf.Text
  if (useImageText) {
    backHint = new Image({
      url: textImageBase + (jsmaf.circleIsAdvanceButton ? 'xToGoBack.png' : 'oToGoBack.png'),
      x: 890,
      y: 1000,
      width: 150,
      height: 40
    })
  } else {
    backHint = new jsmaf.Text()
    backHint.text = jsmaf.circleIsAdvanceButton ? lang.xToGoBack : lang.oToGoBack
    backHint.x = 890
    backHint.y = 1000
    backHint.style = 'white'
  }
  jsmaf.root.children.push(backHint)

  const zoomInRef:  { value: number | null } = { value: null }
  const zoomOutRef: { value: number | null } = { value: null }
  let prevButton = -1

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
      animateZoomOut(prevButtonObj, buttonTexts[prevButton]!, buttonOrigPos[prevButton]!.x, buttonOrigPos[prevButton]!.y, textOrigPos[prevButton]!.x, textOrigPos[prevButton]!.y, buttonWidth, buttonHeight, zoomOutRef)
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
        if (buttonMarker) buttonMarker.visible = false
      }
    }

    prevButton = currentButton
  }

  const confirmKey = jsmaf.circleIsAdvanceButton ? 13 : 14
  const backKey = jsmaf.circleIsAdvanceButton ? 14 : 13

  jsmaf.onKeyDown = function (keyCode) {

    const fileButtonCount = fileList.length

    if (keyCode === 6) {
      const nextButton = currentButton + buttonsPerRow
      if (nextButton < fileButtonCount) {
        currentButton = nextButton
        playCursor()
      }
      updateHighlight()
    } else if (keyCode === 4) {
      const nextButton = currentButton - buttonsPerRow
      if (nextButton >= 0) {
        currentButton = nextButton
        playCursor()
      }
      updateHighlight()
    } else if (keyCode === 5) {
      const nextButton = currentButton + 1
      const row = Math.floor(currentButton / buttonsPerRow)
      const nextRow = Math.floor(nextButton / buttonsPerRow)
      if (nextButton < fileButtonCount && nextRow === row) {
        currentButton = nextButton
        playCursor()
      }
      updateHighlight()
    } else if (keyCode === 7) {
      const col = currentButton % buttonsPerRow
      if (col > 0) {
        currentButton = currentButton - 1
        playCursor()
      }
      updateHighlight()
    } else if (keyCode === confirmKey) {
      handleButtonPress()
    } else if (keyCode === backKey) {
      playCancel()
      try {
        include('themes/' + (typeof CONFIG !== 'undefined' && CONFIG.theme ? CONFIG.theme : 'default') + '/main.js')
      } catch (e) {
        const err = e as Error
        if (err.stack) log(err.stack)
      }
    }
  }

  function handleButtonPress () {
    if (currentButton < fileList.length) {
      const selectedEntry = fileList[currentButton]
      if (!selectedEntry) {
        return
      }

      playConfirm()

      const filePath = selectedEntry.path
      const fileName = selectedEntry.name


      try {
        if (fileName.toLowerCase().endsWith('.js')) {
          // Local JavaScript file case (from "/download0/payloads")
          if (filePath.startsWith('/download0/')) {
            include('payloads/' + fileName)
          } else {
            // External JavaScript file case (from "/data/payloads")
            const p_addr = mem.malloc(256)
            for (let i = 0; i < filePath.length; i++) {
              mem.view(p_addr).setUint8(i, filePath.charCodeAt(i))
            }
            mem.view(p_addr).setUint8(filePath.length, 0)

            const fd = fn.open_sys(p_addr, new BigInt(0, 0), new BigInt(0, 0))

            if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
              const buf_size = 1024 * 1024 * 1  // 1 MiB
              const buf = mem.malloc(buf_size)
              const read_len = fn.read_sys(fd, buf, new BigInt(0, buf_size))

              fn.close_sys(fd)

              const len = (read_len instanceof BigInt) ? read_len.lo : read_len

              // Build string in chunks for performance (char-by-char is O(n²))
              const CHUNK = 4096
              const chunks: string[] = []
              for (let i = 0; i < len; i += CHUNK) {
                const end = Math.min(i + CHUNK, len)
                const chars: string[] = []
                for (let j = i; j < end; j++) {
                  chars.push(String.fromCharCode(mem.view(buf).getUint8(j)))
                }
                chunks.push(chars.join(''))
              }
              const scriptContent = chunks.join('')

              // eslint-disable-next-line no-eval
              eval(scriptContent)
            }
          }
        } else {
          include('binloader.js')

          const { bl_load_from_file } = binloader_init()


          bl_load_from_file(filePath)
        }
      } catch (e) {
        const err = e as Error
        if (err.stack) log(err.stack)
      }
    }
  }

  updateHighlight()

})()

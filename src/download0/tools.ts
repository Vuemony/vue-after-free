// tools.ts - Quick-launch tools & system utilities screen
// FTP, WebUI, inject payloads, block updates, debug settings, reboot, notifications

import { fn, mem, BigInt, utils } from 'download0/types'
import { libc_addr } from 'download0/userland'
import { binloader_init } from 'download0/binloader'
import { lang, useImageText, textImageBase } from 'download0/languages'
import { checkJailbroken } from 'download0/check-jailbroken'
import { themes_getTheme, Theme } from 'download0/themes'
import { ui_initScreen, ui_addBackground, ui_addLogo, ui_addTitle, ui_createMenuState, ui_updateHighlight, ui_handleVerticalNav, UI_NORMAL_BTN, UI_MARKER_IMG, UIMenuState } from 'download0/ui'
import { sfx_playBgm, sfx_playNav, sfx_playSelect, sfx_playSuccess, sfx_playFail } from 'download0/sfx'
import { logger_info, logger_error } from 'download0/logger'

;(function () {
  if (typeof libc_addr === 'undefined') {
    include('userland.js')
  }
  include('check-jailbroken.js')
  include('binloader.js')
  include('themes.js')
  include('sfx.js')
  include('languages.js')
  include('ui.js')
  include('logger.js')

  log(lang.loadingTools || 'Loading tools...')

  const theme = themes_getTheme()
  const jailbroken = checkJailbroken()

  ui_initScreen()
  sfx_playBgm()
  ui_addBackground()
  ui_addLogo(1620, 0, 300, 169)
  ui_addTitle(lang.tools || 'Tools', 'tools', 900, 80, 140, 60)

  // Styles
  new Style({ name: 'tool_desc', color: 'rgb(180,180,180)', size: 18 })
  new Style({ name: 'tool_status', color: theme.accent, size: 20 })
  new Style({ name: 'tool_warn', color: theme.errorColor || 'rgb(255,120,80)', size: 20 })
  new Style({ name: 'tool_ok', color: theme.successColor || 'rgb(80,220,120)', size: 20 })

  // Register syscalls
  fn.register(0x05, 'tl_open', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x06, 'tl_close', ['bigint'], 'bigint')
  fn.register(0x110, 'tl_getdents', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x03, 'tl_read', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x04, 'tl_write', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x0A, 'tl_unlink', ['bigint'], 'bigint')
  fn.register(0x88, 'tl_mkdir', ['bigint', 'bigint'], 'bigint')

  // Helper to create null-terminated path buffer
  function makePathBuf (path: string): BigInt {
    const buf = mem.malloc(path.length + 1)
    for (let i = 0; i < path.length; i++) {
      mem.view(buf).setUint8(i, path.charCodeAt(i))
    }
    mem.view(buf).setUint8(path.length, 0)
    return buf
  }

  function writeFile (path: string, content: string): boolean {
    try {
      const pathBuf = makePathBuf(path)
      const fd = fn.tl_open(pathBuf, new BigInt(0, 0x0601), new BigInt(0, 0x1B6)) // O_WRONLY|O_CREAT|O_TRUNC, 0666
      if (fd.eq(new BigInt(0xffffffff, 0xffffffff))) return false

      const contentBuf = mem.malloc(content.length + 1)
      for (let i = 0; i < content.length; i++) {
        mem.view(contentBuf).setUint8(i, content.charCodeAt(i))
      }
      mem.view(contentBuf).setUint8(content.length, 0)

      fn.tl_write(fd, contentBuf, new BigInt(0, content.length))
      fn.tl_close(fd)
      return true
    } catch (e) {
      return false
    }
  }

  function fileExists (path: string): boolean {
    try {
      const pathBuf = makePathBuf(path)
      const fd = fn.tl_open(pathBuf, new BigInt(0, 0), new BigInt(0, 0))
      if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        fn.tl_close(fd)
        return true
      }
    } catch (e) { /* ignore */ }
    return false
  }

  function mkdirSafe (path: string): void {
    try {
      const pathBuf = makePathBuf(path)
      fn.tl_mkdir(pathBuf, new BigInt(0, 0x1FF))
    } catch (e) { /* ignore */ }
  }

  // Status display
  const statusLine = new jsmaf.Text()
  statusLine.text = jailbroken ? (lang.jbStatusReady || 'Status: Jailbroken - All tools available') : (lang.jbStatusLocked || 'Status: Not jailbroken - Some tools locked')
  statusLine.x = 80
  statusLine.y = 155
  statusLine.style = jailbroken ? 'tool_ok' : 'tool_warn'
  jsmaf.root.children.push(statusLine)

  // Tool definitions
  const tools = [
    {
      label: lang.startFTP || 'Start FTP Server',
      imgKey: 'startFTP',
      description: lang.ftpDesc || 'Access PS4 files from PC (port 1337)',
      requiresJB: true,
      action: 'ftp'
    },
    {
      label: lang.startWebUI || 'Start Web Server',
      imgKey: 'startWebUI',
      description: lang.webUIDesc || 'Manage PS4 from any browser',
      requiresJB: true,
      action: 'webui'
    },
    {
      label: lang.injectUSB || 'Inject from USB',
      imgKey: 'injectUSB',
      description: lang.usbDesc || 'Scan USB for payloads (.elf/.bin/.js)',
      requiresJB: true,
      action: 'usb_inject'
    },
    {
      label: lang.injectHDD || 'Inject from HDD',
      imgKey: 'injectHDD',
      description: lang.hddDesc || 'Load payload from /data/payloads',
      requiresJB: true,
      action: 'hdd_inject'
    },
    {
      label: lang.networkLoader || 'Network Loader',
      imgKey: 'networkLoader',
      description: lang.networkLoaderDesc || 'Send payload to PS4 IP:9021',
      requiresJB: true,
      action: 'network_loader'
    },
    {
      label: lang.fanControl || 'Fan Control',
      imgKey: 'fanControl',
      description: lang.fanControlDesc || 'Set CPU temp threshold for fan speed',
      requiresJB: true,
      action: 'fan_control'
    },
    {
      label: lang.blockUpdates || 'Block FW Updates',
      imgKey: 'blockUpdates',
      description: lang.blockUpdatesDesc || 'Prevent system firmware updates',
      requiresJB: true,
      action: 'block_updates'
    },
    {
      label: lang.enableDebug || 'Enable Debug Settings',
      imgKey: 'enableDebug',
      description: lang.enableDebugDesc || 'Unlock hidden Debug Settings menu',
      requiresJB: true,
      action: 'enable_debug'
    },
    {
      label: lang.sendNotify || 'Send Notification',
      imgKey: 'sendNotify',
      description: lang.sendNotifyDesc || 'Send a custom PS4 notification',
      requiresJB: true,
      action: 'send_notify'
    },
    {
      label: lang.dumpInfo || 'Dump System Info',
      imgKey: 'dumpInfo',
      description: lang.dumpInfoDesc || 'Save info to /data/system_info.txt',
      requiresJB: true,
      action: 'dump_info'
    },
    {
      label: lang.rebootPS4 || 'Reboot PS4',
      imgKey: 'rebootPS4',
      description: lang.rebootDesc || 'Reboot the PS4 system',
      requiresJB: true,
      action: 'reboot'
    },
    {
      label: lang.restartApp || 'Restart App',
      imgKey: 'restartApp',
      description: lang.restartDesc || 'Restart Vue-After-Free',
      requiresJB: false,
      action: 'restart'
    }
  ]

  // Scrollable tool list
  const startY = 195
  const buttonSpacing = 72
  const buttonWidth = 380
  const buttonHeight = 58
  const centerX = 480
  const VISIBLE_TOOLS = 10

  let scrollOffset = 0

  const state = ui_createMenuState(buttonWidth, buttonHeight)
  const descTexts: jsmaf.Text[] = []
  const toolButtons: Image[] = []
  const toolMarkers: (Image | null)[] = []
  const toolTexts: (Image | jsmaf.Text)[] = []

  for (let i = 0; i < Math.min(tools.length, VISIBLE_TOOLS); i++) {
    const tool = tools[i]!
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
    toolButtons.push(button)

    const marker = new Image({
      url: UI_MARKER_IMG,
      x: btnX + buttonWidth - 50,
      y: btnY + 24,
      width: 12,
      height: 12,
      visible: false
    })
    state.buttonMarkers.push(marker)
    jsmaf.root.children.push(marker)
    toolMarkers.push(marker)

    const isAvailable = !tool.requiresJB || jailbroken
    let displayLabel = tool.label
    if (!isAvailable) displayLabel = '[JB] ' + tool.label

    let btnText: Image | jsmaf.Text
    if (useImageText) {
      btnText = new Image({
        url: textImageBase + tool.imgKey + '.png',
        x: btnX + 20,
        y: btnY + 8,
        width: 280,
        height: 42
      })
    } else {
      btnText = new jsmaf.Text()
      btnText.text = displayLabel
      btnText.x = btnX + 20
      btnText.y = btnY + buttonHeight / 2 - 12
      btnText.style = isAvailable ? 'white' : 'dim'
    }
    state.buttonTexts.push(btnText)
    jsmaf.root.children.push(btnText)
    toolTexts.push(btnText)

    // Description text on the right side
    const desc = new jsmaf.Text()
    desc.text = tool.description
    desc.x = btnX + buttonWidth + 20
    desc.y = btnY + buttonHeight / 2 - 9
    desc.style = 'tool_desc'
    desc.visible = false
    jsmaf.root.children.push(desc)
    descTexts.push(desc)

    state.buttonOrigPos.push({ x: btnX, y: btnY })
    state.textOrigPos.push({ x: btnText.x, y: btnText.y })

    if (!isAvailable) button.alpha = 0.5
  }

  // Back button
  const backX = centerX - buttonWidth / 2
  const backY = startY + Math.min(tools.length, VISIBLE_TOOLS) * buttonSpacing + 15

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
    y: backY + 24,
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
      y: backY + 8,
      width: 200,
      height: 42
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
  descTexts.push(new jsmaf.Text()) // placeholder for back button

  // Scroll indicator
  const scrollIndicator = new jsmaf.Text()
  scrollIndicator.text = ''
  scrollIndicator.x = centerX - 40
  scrollIndicator.y = backY + buttonHeight + 10
  scrollIndicator.style = 'tool_desc'
  jsmaf.root.children.push(scrollIndicator)

  // Feedback area at bottom
  const feedbackText = new jsmaf.Text()
  feedbackText.text = ''
  feedbackText.x = 80
  feedbackText.y = 1000
  feedbackText.style = 'tool_status'
  jsmaf.root.children.push(feedbackText)

  function showFeedback (msg: string, isError?: boolean): void {
    feedbackText.text = msg
    feedbackText.style = isError ? 'tool_warn' : 'tool_ok'
    logger_info('[Tools] ' + msg)
    setTimeout(function () {
      if (feedbackText.text === msg) feedbackText.text = ''
    }, 8000)
  }

  // Refresh visible tool buttons based on scroll
  function refreshToolList (): void {
    const btnX = centerX - buttonWidth / 2

    for (let i = 0; i < Math.min(tools.length, VISIBLE_TOOLS); i++) {
      const toolIdx = scrollOffset + i
      if (toolIdx < tools.length) {
        const tool = tools[toolIdx]!
        const isAvailable = !tool.requiresJB || jailbroken

        if (toolTexts[i] && !(toolTexts[i] instanceof Image)) {
          const txt = toolTexts[i] as jsmaf.Text
          txt.text = isAvailable ? tool.label : '[JB] ' + tool.label
          txt.style = isAvailable ? 'white' : 'dim'
        }
        if (descTexts[i]) {
          descTexts[i]!.text = tool.description
        }
        if (toolButtons[i]) {
          toolButtons[i]!.alpha = isAvailable ? 1.0 : 0.5
        }
      }
    }

    // Update scroll indicator
    if (tools.length > VISIBLE_TOOLS) {
      scrollIndicator.text = 'Page ' + (Math.floor(scrollOffset / VISIBLE_TOOLS) + 1) + '/' + Math.ceil(tools.length / VISIBLE_TOOLS)
    }
  }

  // Show description for currently selected tool
  function updateDescription (): void {
    for (let i = 0; i < descTexts.length; i++) {
      if (descTexts[i]) descTexts[i]!.visible = (i === state.currentButton)
    }
  }

  // === USB SCAN & INJECT ===
  function scanUSBForPayloads (): { name: string, path: string }[] {
    const found: { name: string, path: string }[] = []
    const usbRoots = ['/mnt/usb0', '/mnt/usb1', '/mnt/usb2', '/mnt/usb3']
    const subDirs = ['', '/payloads', '/PS4', '/PS4/payloads']

    for (let u = 0; u < usbRoots.length; u++) {
      for (let s = 0; s < subDirs.length; s++) {
        const scanPath = usbRoots[u]! + subDirs[s]!
        const results = scanDirectoryForPayloads(scanPath)
        for (let r = 0; r < results.length; r++) {
          found.push(results[r]!)
        }
      }
    }
    return found
  }

  function scanHDDForPayloads (): { name: string, path: string }[] {
    const found: { name: string, path: string }[] = []
    const paths = ['/data/payloads', '/download0/payloads', '/data', '/user/home']

    for (let i = 0; i < paths.length; i++) {
      const results = scanDirectoryForPayloads(paths[i]!)
      for (let r = 0; r < results.length; r++) {
        found.push(results[r]!)
      }
    }
    return found
  }

  function scanDirectoryForPayloads (dirPath: string): { name: string, path: string }[] {
    const results: { name: string, path: string }[] = []
    try {
      const pathBuf = makePathBuf(dirPath)

      const fd = fn.tl_open(pathBuf, new BigInt(0, 0), new BigInt(0, 0))
      if (fd.eq(new BigInt(0xffffffff, 0xffffffff))) return results

      const buf = mem.malloc(8192)
      const count = fn.tl_getdents(fd, buf, new BigInt(0, 8192))

      if (!count.eq(new BigInt(0xffffffff, 0xffffffff)) && count.lo > 0) {
        let offset = 0
        while (offset < count.lo) {
          const d_reclen = mem.view(buf.add(new BigInt(0, offset + 4))).getUint16(0, true)
          const d_type = mem.view(buf.add(new BigInt(0, offset + 6))).getUint8(0)
          const d_namlen = mem.view(buf.add(new BigInt(0, offset + 7))).getUint8(0)

          let name = ''
          for (let j = 0; j < d_namlen; j++) {
            name += String.fromCharCode(mem.view(buf.add(new BigInt(0, offset + 8 + j))).getUint8(0))
          }

          if (d_type === 8) { // DT_REG
            const lower = name.toLowerCase()
            if (lower.endsWith('.elf') || lower.endsWith('.bin') || lower.endsWith('.js')) {
              const fullPath = dirPath + '/' + name
              results.push({ name: name + '  (' + dirPath + ')', path: fullPath })
            }
          }

          offset += d_reclen
        }
      }
      fn.tl_close(fd)
    } catch (e) {
      // Directory doesn't exist or can't be read
    }
    return results
  }

  function injectPayloadFromPath (filePath: string, fileName: string): void {
    logger_info('Injecting payload: ' + filePath)
    showFeedback('Injecting: ' + fileName + '...')

    try {
      const lower = fileName.toLowerCase()

      if (lower.endsWith('.js')) {
        if (filePath.startsWith('/download0/')) {
          const relativePath = filePath.substring('/download0/'.length)
          log('Including JS: ' + relativePath)
          include(relativePath)
          showFeedback('JS payload executed: ' + fileName)
          sfx_playSuccess()
        } else {
          // Read and eval external JS
          const content = readExternalFile(filePath)
          if (content !== null) {
            log('Executing external JS (' + content.length + ' bytes)')
            // eslint-disable-next-line no-eval
            eval(content)
            showFeedback('JS payload executed: ' + fileName)
            sfx_playSuccess()
          } else {
            showFeedback('ERROR: Cannot read ' + fileName, true)
            sfx_playFail()
          }
        }
      } else if (lower.endsWith('.elf') || lower.endsWith('.bin')) {
        log('Initializing binloader for: ' + filePath)
        const { bl_load_from_file } = binloader_init()
        bl_load_from_file(filePath)
        showFeedback('Payload injected: ' + fileName)
        sfx_playSuccess()
      }
    } catch (e) {
      const err = e as Error
      showFeedback('INJECT FAILED: ' + err.message, true)
      sfx_playFail()
      logger_error('Inject failed: ' + filePath + ' - ' + err.message)
    }
  }

  function readExternalFile (filePath: string): string | null {
    try {
      const pathBuf = makePathBuf(filePath)

      const fd = fn.tl_open(pathBuf, new BigInt(0, 0), new BigInt(0, 0))
      if (fd.eq(new BigInt(0xffffffff, 0xffffffff))) return null

      const bufSize = 2 * 1024 * 1024
      const readBuf = mem.malloc(bufSize)
      const bytesRead = fn.tl_read(fd, readBuf, new BigInt(0, bufSize))
      fn.tl_close(fd)

      if (bytesRead.eq(new BigInt(0xffffffff, 0xffffffff))) return null

      const len = (bytesRead instanceof BigInt) ? bytesRead.lo : bytesRead
      let content = ''
      for (let i = 0; i < len; i++) {
        content += String.fromCharCode(mem.view(readBuf).getUint8(i))
      }
      return content
    } catch (e) {
      return null
    }
  }

  // === Payload selection sub-menu ===
  let inSubMenu = false
  let subMenuPayloads: { name: string, path: string }[] = []
  let subMenuSelected = 0
  let subMenuScroll = 0
  const SUB_VISIBLE = 15
  const subMenuLines: jsmaf.Text[] = []
  const subMenuMarker = new jsmaf.Text()

  new Style({ name: 'sub_item', color: 'white', size: 20 })
  new Style({ name: 'sub_sel', color: theme.accent, size: 20 })

  subMenuMarker.text = '>'
  subMenuMarker.x = 120
  subMenuMarker.y = 220
  subMenuMarker.style = 'sub_sel'
  subMenuMarker.visible = false
  jsmaf.root.children.push(subMenuMarker)

  for (let i = 0; i < SUB_VISIBLE; i++) {
    const line = new jsmaf.Text()
    line.text = ''
    line.x = 150
    line.y = 220 + i * 35
    line.style = 'sub_item'
    line.visible = false
    jsmaf.root.children.push(line)
    subMenuLines.push(line)
  }

  const subTitle = new jsmaf.Text()
  subTitle.text = ''
  subTitle.x = 120
  subTitle.y = 180
  subTitle.style = 'tool_status'
  subTitle.visible = false
  jsmaf.root.children.push(subTitle)

  const subHint = new jsmaf.Text()
  subHint.text = 'UP/DOWN: Select  |  X: Inject  |  CIRCLE: Cancel'
  subHint.x = 400
  subHint.y = 1000
  subHint.style = 'tool_desc'
  subHint.visible = false
  jsmaf.root.children.push(subHint)

  function showSubMenu (payloads: { name: string, path: string }[], title: string): void {
    if (payloads.length === 0) {
      showFeedback('No payloads found!', true)
      sfx_playFail()
      return
    }

    inSubMenu = true
    subMenuPayloads = payloads
    subMenuSelected = 0
    subMenuScroll = 0
    subTitle.text = title + ' (' + payloads.length + ' found)'
    subTitle.visible = true
    subHint.visible = true
    subMenuMarker.visible = true

    // Hide main menu elements
    for (let i = 0; i < state.buttons.length; i++) {
      state.buttons[i]!.visible = false
      state.buttonTexts[i]!.visible = false
      if (state.buttonMarkers[i]) state.buttonMarkers[i]!.visible = false
    }
    for (let i = 0; i < descTexts.length; i++) {
      if (descTexts[i]) descTexts[i]!.visible = false
    }
    statusLine.visible = false

    refreshSubMenu()
    logger_info('Showing payload submenu: ' + title + ' with ' + payloads.length + ' items')
  }

  function hideSubMenu (): void {
    inSubMenu = false
    subTitle.visible = false
    subHint.visible = false
    subMenuMarker.visible = false
    for (let i = 0; i < SUB_VISIBLE; i++) {
      subMenuLines[i]!.visible = false
    }

    // Re-show main menu elements
    for (let i = 0; i < state.buttons.length; i++) {
      const toolIdx = scrollOffset + i
      const tool = tools[toolIdx]
      const isAvailable = !tool || !tool.requiresJB || jailbroken
      state.buttons[i]!.visible = true
      if (!isAvailable) state.buttons[i]!.alpha = 0.5
      state.buttonTexts[i]!.visible = true
    }
    statusLine.visible = true
    updateDescription()
    ui_updateHighlight(state)
  }

  function refreshSubMenu (): void {
    for (let i = 0; i < SUB_VISIBLE; i++) {
      const idx = subMenuScroll + i
      const line = subMenuLines[i]!
      if (idx < subMenuPayloads.length) {
        let displayName = subMenuPayloads[idx]!.name
        if (displayName.length > 80) displayName = displayName.substring(0, 77) + '...'
        line.text = displayName
        line.style = (idx === subMenuSelected) ? 'sub_sel' : 'sub_item'
        line.visible = true
      } else {
        line.text = ''
        line.visible = false
      }
    }

    const visibleIdx = subMenuSelected - subMenuScroll
    subMenuMarker.y = 220 + visibleIdx * 35
  }

  // === TOOL ACTIONS ===

  function blockFirmwareUpdates (): void {
    showFeedback('Blocking firmware updates...')
    try {
      // Method 1: Create blocker file in /update
      mkdirSafe('/update')
      const blockerContent = 'blocked by vue-after-free'
      if (writeFile('/update/PS4UPDATE.PUP.net.temp', blockerContent)) {
        log('Created update blocker: /update/PS4UPDATE.PUP.net.temp')
      }

      // Method 2: Remove any pending updates
      try {
        const unlinkBuf = makePathBuf('/update/PS4UPDATE.PUP')
        fn.tl_unlink(unlinkBuf)
        log('Removed pending update file')
      } catch (e) { /* no pending update */ }

      // Method 3: Write DNS blocker hosts entries
      // (Some implementations redirect update.playstation.net to 127.0.0.1)
      const hostsContent = '127.0.0.1 a0.ww.np.dl.playstation.net\n' +
        '127.0.0.1 b0.ww.np.dl.playstation.net\n' +
        '127.0.0.1 c0.ww.np.dl.playstation.net\n' +
        '127.0.0.1 d0.ww.np.dl.playstation.net\n' +
        '127.0.0.1 fus01.ps4.update.playstation.net\n' +
        '127.0.0.1 feu01.ps4.update.playstation.net\n' +
        '127.0.0.1 fap01.ps4.update.playstation.net\n' +
        '127.0.0.1 fjp01.ps4.update.playstation.net\n'
      mkdirSafe('/data')
      if (writeFile('/data/hosts_blocked.txt', hostsContent)) {
        log('Saved DNS block list to /data/hosts_blocked.txt')
      }

      showFeedback('FW updates blocked! Set DNS to block PS4 update servers')
      sfx_playSuccess()
      utils.notify('Firmware updates blocked!\nSet DNS: 165.227.83.145')
    } catch (e) {
      showFeedback('Block updates failed: ' + (e as Error).message, true)
      sfx_playFail()
    }
  }

  function enableDebugSettings (): void {
    showFeedback('Enabling debug settings...')
    try {
      // Write the debug flag file that the PS4 settings app checks
      mkdirSafe('/data')
      if (writeFile('/data/.debug_enabled', '1')) {
        log('Debug flag written')
      }

      // Also try to write to the system registry path
      const registryContent = '1'
      writeFile('/data/system/settings/debug_mode', registryContent)

      showFeedback('Debug settings enabled! Restart PS4 to see in Settings menu')
      sfx_playSuccess()
      utils.notify('Debug Settings enabled!\nRestart PS4 to apply')
    } catch (e) {
      showFeedback('Enable debug failed: ' + (e as Error).message, true)
      sfx_playFail()
    }
  }

  function sendNotification (): void {
    try {
      const messages = [
        'Vue-After-Free is awesome!',
        'Your PS4 is JAILBROKEN!',
        'Homebrew enabled!',
        'Freedom achieved!',
        'Have fun with your PS4!'
      ]
      const msg = messages[Math.floor(Math.random() * messages.length)]!
      utils.notify(msg)
      showFeedback('Notification sent: ' + msg)
      sfx_playSuccess()
    } catch (e) {
      showFeedback('Notification failed: ' + (e as Error).message, true)
      sfx_playFail()
    }
  }

  function rebootPS4 (): void {
    showFeedback('Rebooting PS4...')
    try {
      utils.notify('Rebooting PS4...\nSee you soon!')

      // Small delay for notification to show
      const start = Date.now()
      while (Date.now() - start < 1500) { /* wait */ }

      // syscall 37 = reboot with RB_AUTOBOOT
      fn.register(0x37, 'tl_reboot', ['bigint'], 'bigint')
      fn.tl_reboot(new BigInt(0, 0)) // RB_AUTOBOOT = 0
    } catch (e) {
      // Fallback: try kill with signal
      try {
        fn.register(0x14, 'tl_getpid', [], 'bigint')
        fn.register(0x25, 'tl_kill', ['bigint', 'bigint'], 'bigint')
        const pid = fn.tl_getpid()
        fn.tl_kill(new BigInt(0, 1), new BigInt(0, 15)) // SIGTERM to init (pid 1)
      } catch (e2) {
        showFeedback('Reboot failed - try holding PS button', true)
        sfx_playFail()
      }
    }
  }

  function executeTool (toolIndex: number): void {
    const actualIndex = scrollOffset + toolIndex
    const tool = tools[actualIndex]
    if (!tool) return

    if (tool.requiresJB && !jailbroken) {
      showFeedback((lang.jbRequired || 'Jailbreak required for') + ' ' + tool.label, true)
      sfx_playFail()
      return
    }

    sfx_playSelect()

    switch (tool.action) {
      case 'ftp':
        showFeedback('Starting FTP server...')
        try {
          log('Loading FTP server payload...')
          include('payloads/ftp-server.js')
          showFeedback('FTP server started! Connect to PS4 IP on port 1337')
          sfx_playSuccess()
        } catch (e) {
          showFeedback('FTP start failed: ' + (e as Error).message, true)
          sfx_playFail()
        }
        break

      case 'webui':
        showFeedback('Starting Web UI server...')
        try {
          log('Loading Web UI payload...')
          include('payloads/web-ui.js')
          showFeedback('Web UI started! Open PS4 IP in browser')
          sfx_playSuccess()
        } catch (e) {
          showFeedback('Web UI start failed: ' + (e as Error).message, true)
          sfx_playFail()
        }
        break

      case 'usb_inject': {
        showFeedback('Scanning USB drives for payloads...')
        const usbPayloads = scanUSBForPayloads()
        if (usbPayloads.length === 0) {
          showFeedback('No payloads found on USB! Place .elf/.bin/.js in /payloads/ on USB', true)
          sfx_playFail()
        } else {
          showSubMenu(usbPayloads, 'USB Payloads')
        }
        break
      }

      case 'hdd_inject': {
        showFeedback('Scanning HDD for payloads...')
        const hddPayloads = scanHDDForPayloads()
        if (hddPayloads.length === 0) {
          showFeedback('No payloads on HDD! Place files in /data/payloads/', true)
          sfx_playFail()
        } else {
          showSubMenu(hddPayloads, 'HDD Payloads')
        }
        break
      }

      case 'network_loader':
        showFeedback('Starting network payload loader...')
        try {
          log('Initializing binloader for network mode...')
          const { bl_network_loader } = binloader_init()
          bl_network_loader()
          showFeedback('Network loader active! Send payload to PS4 IP:9021')
          sfx_playSuccess()
        } catch (e) {
          showFeedback('Network loader failed: ' + (e as Error).message, true)
          sfx_playFail()
        }
        break

      case 'fan_control':
        log('Opening fan control panel...')
        include('fan-control.js')
        break

      case 'block_updates':
        blockFirmwareUpdates()
        break

      case 'enable_debug':
        enableDebugSettings()
        break

      case 'send_notify':
        sendNotification()
        break

      case 'dump_info':
        showFeedback('Dumping system info...')
        try {
          dumpSystemInfo()
          showFeedback('System info saved to /data/system_info.txt')
          sfx_playSuccess()
        } catch (e) {
          showFeedback('Dump failed: ' + (e as Error).message, true)
          sfx_playFail()
        }
        break

      case 'reboot':
        rebootPS4()
        break

      case 'restart':
        showFeedback('Restarting...')
        try {
          if (typeof debugging !== 'undefined' && debugging) {
            debugging.restart()
          } else {
            include('serve.js')
          }
        } catch (e) {
          showFeedback('Restart failed: ' + (e as Error).message, true)
        }
        break
    }
  }

  function dumpSystemInfo (): void {
    const info: string[] = []
    info.push('=== Vue-After-Free System Dump ===')
    info.push('Date: ' + new Date().toISOString())
    info.push('Jailbroken: ' + (jailbroken ? 'Yes' : 'No'))
    info.push('')

    if (typeof debugging !== 'undefined' && debugging) {
      info.push('Memory Available: ' + (debugging.info.memory.available / 1024 / 1024).toFixed(1) + ' MB')
      info.push('Memory DMEM: ' + (debugging.info.memory.available_dmem / 1024 / 1024).toFixed(1) + ' MB')
      info.push('Memory LIBC: ' + (debugging.info.memory.available_libc / 1024 / 1024).toFixed(1) + ' MB')
    }

    info.push('')
    info.push('Config:')
    if (typeof CONFIG !== 'undefined' && CONFIG) {
      info.push('  autolapse: ' + (CONFIG.autolapse || false))
      info.push('  autopoop: ' + (CONFIG.autopoop || false))
      info.push('  autoclose: ' + (CONFIG.autoclose || false))
      info.push('  jb_behavior: ' + (CONFIG.jb_behavior || 0))
      info.push('  retry_count: ' + (CONFIG.retry_count || 3))
    }

    info.push('')
    info.push('=== End of dump ===')

    const content = info.join('\n')
    mkdirSafe('/data')
    if (writeFile('/data/system_info.txt', content)) {
      log('System info dumped to /data/system_info.txt')
    } else {
      throw new Error('Cannot write to /data/system_info.txt')
    }
  }

  // === KEY HANDLER ===
  jsmaf.onKeyDown = function (keyCode) {
    if (inSubMenu) {
      // Sub-menu navigation
      if (keyCode === 4) { // Up
        if (subMenuSelected > 0) {
          subMenuSelected--
          if (subMenuSelected < subMenuScroll) {
            subMenuScroll = subMenuSelected
          }
          sfx_playNav()
          refreshSubMenu()
        }
      } else if (keyCode === 6) { // Down
        if (subMenuSelected < subMenuPayloads.length - 1) {
          subMenuSelected++
          if (subMenuSelected >= subMenuScroll + SUB_VISIBLE) {
            subMenuScroll = subMenuSelected - SUB_VISIBLE + 1
          }
          sfx_playNav()
          refreshSubMenu()
        }
      } else if (keyCode === 14) { // X - Inject selected
        const selected = subMenuPayloads[subMenuSelected]
        if (selected) {
          const nameOnly = selected.path.split('/').pop() || selected.name
          injectPayloadFromPath(selected.path, nameOnly)
        }
      } else if (keyCode === 13) { // Circle - Cancel
        hideSubMenu()
      }
      return
    }

    // Main tool menu navigation
    if (ui_handleVerticalNav(state, keyCode)) {
      sfx_playNav()
      updateDescription()
      return
    }

    if (keyCode === 14) { // X - Execute tool
      if (state.currentButton === state.buttons.length - 1) {
        // Back button
        log('Going back to main menu...')
        include('main-menu.js')
      } else if (state.currentButton < Math.min(tools.length, VISIBLE_TOOLS)) {
        executeTool(state.currentButton)
      }
    } else if (keyCode === 13) { // Circle - Back
      log('Going back to main menu...')
      include('main-menu.js')
    }
  }

  ui_updateHighlight(state)
  updateDescription()
  refreshToolList()
  log(lang.toolsLoaded || 'Tools loaded')
  logger_info('Tools screen loaded - ' + tools.length + ' tools available')
})()

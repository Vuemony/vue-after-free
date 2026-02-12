// system-info.ts - System Information dashboard screen
// Shows FW version, memory, jailbreak status, IP address, etc.

import { fn, mem, BigInt } from 'download0/types'
import { libc_addr } from 'download0/userland'
import { lang, useImageText, textImageBase } from 'download0/languages'
import { checkJailbroken } from 'download0/check-jailbroken'
import { sysctlbyname } from 'download0/kernel'
import { stats } from 'download0/stats-tracker'
import { themes_getTheme, Theme } from 'download0/themes'
import { ui_initScreen, ui_addBackground, ui_addLogo, ui_addTitle, ui_createMenuState, ui_updateHighlight, ui_handleVerticalNav, UI_NORMAL_BTN, UI_MARKER_IMG } from 'download0/ui'
import { sfx_playBgm, sfx_playNav } from 'download0/sfx'

;(function () {
  if (typeof libc_addr === 'undefined') {
    include('userland.js')
  }
  include('check-jailbroken.js')
  include('kernel.js')
  include('stats-tracker.js')
  include('themes.js')
  include('sfx.js')
  include('languages.js')
  include('ui.js')

  log(lang.loadingSystemInfo || 'Loading system info...')

  const theme = themes_getTheme()
  const jailbroken = checkJailbroken()

  ui_initScreen()
  sfx_playBgm()
  ui_addBackground()
  ui_addLogo(1620, 0, 300, 169)
  ui_addTitle(lang.systemInfo || 'System Info', 'systemInfo', 860, 80, 250, 60)

  // Create styles for this screen
  new Style({ name: 'info_label', color: theme.accent, size: 22 })
  new Style({ name: 'info_value', color: 'white', size: 22 })
  new Style({ name: 'info_header', color: theme.accent, size: 28 })

  // ─── Gather System Information ───────────────────

  // FW Version
  function getFWVersion (): string {
    try {
      const buf = mem.malloc(0x8)
      const size = mem.malloc(0x8)
      mem.view(size).setBigInt(0, new BigInt(8), true)
      if (sysctlbyname('kern.sdk_version', buf, size, 0, 0)) {
        const byte1 = Number(mem.view(buf.add(2)).getUint8(0))
        const byte2 = Number(mem.view(buf.add(3)).getUint8(0))
        return byte2.toString(16) + '.' + byte1.toString(16).padStart(2, '0')
      }
    } catch (e) { /* ignore */ }
    return 'Unknown'
  }

  // Memory info
  function getMemoryInfo (): { available: string, dmem: string, libc: string } {
    try {
      if (typeof debugging !== 'undefined' && debugging) {
        const mem_info = debugging.info.memory
        return {
          available: (mem_info.available / 1024 / 1024).toFixed(1) + ' MB',
          dmem: (mem_info.available_dmem / 1024 / 1024).toFixed(1) + ' MB',
          libc: (mem_info.available_libc / 1024 / 1024).toFixed(1) + ' MB'
        }
      }
    } catch (e) { /* ignore */ }
    return { available: 'N/A', dmem: 'N/A', libc: 'N/A' }
  }

  const fwVersion = getFWVersion()
  const memInfo = getMemoryInfo()

  // Load stats
  stats.load()
  const statsData = stats.get()

  // ─── Render Information Panels ───────────────────

  const panelX = 80
  let yPos = 160

  // === System Panel ===
  const sysHeader = new jsmaf.Text()
  sysHeader.text = '[ ' + (lang.systemPanel || 'SYSTEM') + ' ]'
  sysHeader.x = panelX
  sysHeader.y = yPos
  sysHeader.style = 'info_header'
  jsmaf.root.children.push(sysHeader)
  yPos += 40

  const sysInfo = [
    { label: lang.fwVersion || 'Firmware', value: fwVersion },
    { label: lang.jailbreakStatus || 'Jailbreak Status', value: jailbroken ? (lang.jailbroken || 'JAILBROKEN') : (lang.notJailbroken || 'Not Jailbroken') },
    { label: lang.exploitEngine || 'Exploit Engine', value: 'Vue-After-Free v2.0' },
    { label: lang.userland || 'Userland', value: 'CVE-2017-7117' }
  ]

  for (let i = 0; i < sysInfo.length; i++) {
    const info = sysInfo[i]!
    const label = new jsmaf.Text()
    label.text = info.label + ':'
    label.x = panelX + 20
    label.y = yPos
    label.style = 'info_label'
    jsmaf.root.children.push(label)

    const value = new jsmaf.Text()
    value.text = info.value
    value.x = panelX + 320
    value.y = yPos
    value.style = 'info_value'
    jsmaf.root.children.push(value)
    yPos += 30
  }

  yPos += 20

  // === Memory Panel ===
  const memHeader = new jsmaf.Text()
  memHeader.text = '[ ' + (lang.memoryPanel || 'MEMORY') + ' ]'
  memHeader.x = panelX
  memHeader.y = yPos
  memHeader.style = 'info_header'
  jsmaf.root.children.push(memHeader)
  yPos += 40

  const memEntries = [
    { label: lang.availableMemory || 'Available', value: memInfo.available },
    { label: lang.directMemory || 'Direct Memory', value: memInfo.dmem },
    { label: lang.libcMemory || 'libc Memory', value: memInfo.libc }
  ]

  for (let i = 0; i < memEntries.length; i++) {
    const info = memEntries[i]!
    const label = new jsmaf.Text()
    label.text = info.label + ':'
    label.x = panelX + 20
    label.y = yPos
    label.style = 'info_label'
    jsmaf.root.children.push(label)

    const value = new jsmaf.Text()
    value.text = info.value
    value.x = panelX + 320
    value.y = yPos
    value.style = 'info_value'
    jsmaf.root.children.push(value)
    yPos += 30
  }

  yPos += 20

  // === Stats Panel ===
  const statsHeader = new jsmaf.Text()
  statsHeader.text = '[ ' + (lang.statsPanel || 'STATISTICS') + ' ]'
  statsHeader.x = panelX
  statsHeader.y = yPos
  statsHeader.style = 'info_header'
  jsmaf.root.children.push(statsHeader)
  yPos += 40

  const statsEntries = [
    { label: lang.totalAttempts, value: String(statsData.total) },
    { label: lang.successes, value: String(statsData.success) },
    { label: lang.failures, value: String(statsData.failures) },
    { label: lang.successRate, value: statsData.successRate },
    { label: lang.failureRate, value: statsData.failureRate }
  ]

  for (let i = 0; i < statsEntries.length; i++) {
    const info = statsEntries[i]!
    const label = new jsmaf.Text()
    label.text = info.label
    label.x = panelX + 20
    label.y = yPos
    label.style = 'info_label'
    jsmaf.root.children.push(label)

    const value = new jsmaf.Text()
    value.text = info.value
    value.x = panelX + 320
    value.y = yPos
    value.style = 'info_value'
    jsmaf.root.children.push(value)
    yPos += 30
  }

  // === Right Panel - Config Summary ===
  const rightX = 960
  let rightY = 160

  const cfgHeader = new jsmaf.Text()
  cfgHeader.text = '[ ' + (lang.configPanel || 'CONFIGURATION') + ' ]'
  cfgHeader.x = rightX
  cfgHeader.y = rightY
  cfgHeader.style = 'info_header'
  jsmaf.root.children.push(cfgHeader)
  rightY += 40

  const configSummary = [
    { label: lang.autoLapse, value: (typeof CONFIG !== 'undefined' && CONFIG.autolapse) ? 'ON' : 'OFF' },
    { label: lang.autoPoop, value: (typeof CONFIG !== 'undefined' && CONFIG.autopoop) ? 'ON' : 'OFF' },
    { label: lang.autoClose, value: (typeof CONFIG !== 'undefined' && CONFIG.autoclose) ? 'ON' : 'OFF' },
    { label: lang.music, value: (typeof CONFIG !== 'undefined' && CONFIG.music !== false) ? 'ON' : 'OFF' },
    { label: lang.jbBehavior, value: (typeof CONFIG !== 'undefined' && CONFIG.jb_behavior === 1) ? 'NetCtrl' : (typeof CONFIG !== 'undefined' && CONFIG.jb_behavior === 2) ? 'Lapse' : 'Auto' }
  ]

  for (let i = 0; i < configSummary.length; i++) {
    const info = configSummary[i]!
    const label = new jsmaf.Text()
    label.text = info.label
    label.x = rightX + 20
    label.y = rightY
    label.style = 'info_label'
    jsmaf.root.children.push(label)

    const value = new jsmaf.Text()
    value.text = info.value
    value.x = rightX + 320
    value.y = rightY
    value.style = 'info_value'
    jsmaf.root.children.push(value)
    rightY += 30
  }

  // === Back Button ===
  const buttonWidth = 300
  const buttonHeight = 80
  const state = ui_createMenuState(buttonWidth, buttonHeight)

  const backX = 810
  const backY = 960

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
    y: backY + 35,
    width: 12,
    height: 12,
    visible: false
  })
  state.buttonMarkers.push(backMarker)
  jsmaf.root.children.push(backMarker)

  const backText = new jsmaf.Text()
  backText.text = lang.back
  backText.x = backX + buttonWidth / 2 - 30
  backText.y = backY + buttonHeight / 2 - 12
  backText.style = 'white'
  state.buttonTexts.push(backText)
  jsmaf.root.children.push(backText)

  state.buttonOrigPos.push({ x: backX, y: backY })
  state.textOrigPos.push({ x: backText.x, y: backText.y })

  // Reset stats button
  const resetX = 510
  const resetY = 960

  const resetButton = new Image({
    url: UI_NORMAL_BTN,
    x: resetX,
    y: resetY,
    width: buttonWidth,
    height: buttonHeight
  })
  state.buttons.push(resetButton)
  jsmaf.root.children.push(resetButton)

  state.buttonMarkers.push(null)

  const resetText = new jsmaf.Text()
  resetText.text = lang.resetStats || 'Reset Stats'
  resetText.x = resetX + buttonWidth / 2 - 60
  resetText.y = resetY + buttonHeight / 2 - 12
  resetText.style = 'white'
  state.buttonTexts.push(resetText)
  jsmaf.root.children.push(resetText)

  state.buttonOrigPos.push({ x: resetX, y: resetY })
  state.textOrigPos.push({ x: resetText.x, y: resetText.y })

  jsmaf.onKeyDown = function (keyCode) {
    if (ui_handleVerticalNav(state, keyCode)) {
      sfx_playNav()
      return
    }
    if (keyCode === 14) {
      if (state.currentButton === 0) {
        // Back
        log('Going back to main menu...')
        include('main-menu.js')
      } else if (state.currentButton === 1) {
        // Reset stats
        stats.reset()
        log('Stats reset!')
        // Reload screen
        include('system-info.js')
      }
    } else if (keyCode === 13) {
      include('main-menu.js')
    }
  }

  ui_updateHighlight(state)
  log(lang.systemInfoLoaded || 'System info loaded')
})()


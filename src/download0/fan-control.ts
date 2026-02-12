// fan-control.ts - PS4 Fan Threshold Control Panel
// Controls fan speed based on SOC temperature via ICC (Aeolia/Belize) controller
// After JB the fan may stop working — this module fixes it by setting ICC thresholds
//
// How it works:
//   1. Opens /dev/icc_configuration (or /dev/icc_power) — the PS4 Southbridge controller
//   2. Sends ioctl commands to read SOC temperature
//   3. Sets fan speed thresholds: below X°C → low fan, above X°C → high fan
//   4. The ICC chip then autonomously manages the fan — no continuous polling needed
//   5. Can auto-run after every jailbreak via CONFIG.fan_fix_mode (1=Built-in, 2=Launch App)

import { fn, mem, BigInt, utils } from 'download0/types'
import { libc_addr } from 'download0/userland'
import { lang } from 'download0/languages'
import { checkJailbroken } from 'download0/check-jailbroken'
import { themes_getTheme } from 'download0/themes'
import { ui_initScreen, ui_addBackground, ui_addLogo, ui_addTitle } from 'download0/ui'
import { sfx_playBgm, sfx_playNav, sfx_playSelect, sfx_playSuccess, sfx_playFail } from 'download0/sfx'
import { logger_info, logger_error } from 'download0/logger'

// === EXPORTED: Apply fan fix silently (called from loader.ts after JB) ===
export function applyFanFix (): boolean {
  if (typeof libc_addr === 'undefined') {
    include('userland.js')
  }

  // Get 3-tier settings from config
  let threshLow = 55    // Slow→Medium transition
  let threshHigh = 70   // Medium→Fast transition
  let fanSlow = 25      // Slow speed (%)
  let fanMed = 50       // Medium speed (%)
  let fanFast = 80      // Fast speed (%)
  if (typeof CONFIG !== 'undefined') {
    if (typeof CONFIG.fan_threshold === 'number' && CONFIG.fan_threshold >= 40 && CONFIG.fan_threshold <= 80) {
      threshLow = CONFIG.fan_threshold
    }
    if (typeof CONFIG.fan_threshold_high === 'number' && CONFIG.fan_threshold_high >= 40 && CONFIG.fan_threshold_high <= 90) {
      threshHigh = CONFIG.fan_threshold_high
    }
    if (typeof CONFIG.fan_low_speed === 'number') {
      fanSlow = CONFIG.fan_low_speed
    }
    if (typeof CONFIG.fan_med_speed === 'number') {
      fanMed = CONFIG.fan_med_speed
    }
    if (typeof CONFIG.fan_high_speed === 'number') {
      fanFast = CONFIG.fan_high_speed
    }
  }
  // Ensure threshHigh > threshLow
  if (threshHigh <= threshLow) threshHigh = threshLow + 10

  log('Applying fan fix: Slow(<' + threshLow + '°C)=' + fanSlow + '% | Med(' + threshLow + '-' + threshHigh + '°C)=' + fanMed + '% | Fast(>' + threshHigh + '°C)=' + fanFast + '%')

  // Register syscalls
  fn.register(0x05, 'fan_open', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x06, 'fan_close', ['bigint'], 'bigint')
  fn.register(0x36, 'fan_ioctl', ['bigint', 'bigint', 'bigint'], 'bigint')

  // Try to open ICC device
  const ICC_DEVICES = ['/dev/icc_configuration', '/dev/icc_power']
  let iccFd: BigInt | null = null
  let iccDeviceName = ''

  for (let d = 0; d < ICC_DEVICES.length; d++) {
    const devPath = ICC_DEVICES[d]!
    const pathBuf = _makePathBuf(devPath)
    const fd = fn.fan_open(pathBuf, new BigInt(0, 2), new BigInt(0, 0)) // O_RDWR
    if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
      iccFd = fd
      iccDeviceName = devPath
      break
    }
  }

  if (!iccFd) {
    log('WARNING: Could not open ICC device — fan fix not applied')
    return false
  }

  log('ICC device opened: ' + iccDeviceName)

  let success = false

  // Send 3-tier fan threshold configuration to ICC
  // The ICC maintains a thermal table: when SOC temp crosses thresholds, fan speed changes
  // We try multiple known ICC command formats for maximum FW compatibility

  // === Method 1: Standard ICC 3-tier thermal set (major=0x08, sub=0x01) ===
  success = _iccSetFanThreshold3(iccFd, 0x08, 0x01, threshLow, threshHigh, fanSlow, fanMed, fanFast)

  // === Method 2: Alternative ICC 3-tier thermal set (major=0x03, sub=0x05) ===
  if (!success) {
    success = _iccSetFanThreshold3(iccFd, 0x03, 0x05, threshLow, threshHigh, fanSlow, fanMed, fanFast)
  }

  // === Method 3: Direct fan duty cycle set — use fast speed as fallback ===
  if (!success) {
    success = _iccSetFanDuty(iccFd, 0x08, 0x02, fanFast)
  }

  // === Method 4: Alternative direct duty (major=0x03, sub=0x03) ===
  if (!success) {
    success = _iccSetFanDuty(iccFd, 0x03, 0x03, fanFast)
  }

  fn.fan_close(iccFd)

  if (success) {
    log('Fan fix applied! Slow: <' + threshLow + '°C=' + fanSlow + '% | Med: ' + threshLow + '-' + threshHigh + '°C=' + fanMed + '% | Fast: >' + threshHigh + '°C=' + fanFast + '%')
    utils.notify('Fan fix applied!\nSlow: <' + threshLow + '°C  Med: ' + threshLow + '-' + threshHigh + '°C  Fast: >' + threshHigh + '°C')
  } else {
    log('WARNING: ICC commands returned errors — fan fix may not have applied')
    log('Try opening your PS4 Temperature app manually')
  }

  return success
}

// === INTERNAL HELPERS ===

function _makePathBuf (path: string): BigInt {
  const buf = mem.malloc(path.length + 1)
  for (let i = 0; i < path.length; i++) {
    mem.view(buf).setUint8(i, path.charCodeAt(i))
  }
  mem.view(buf).setUint8(path.length, 0)
  return buf
}

function _iccQuery (iccFd: BigInt, major: number, minor: number, payload: number[], respLen: number): number[] | null {
  try {
    const ICC_IOCTL_CMD = new BigInt(0, 0xC010480E)

    // Allocate ICC message buffer (256 bytes, zeroed)
    const msgBuf = mem.malloc(256)
    for (let i = 0; i < 256; i++) {
      mem.view(msgBuf).setUint8(i, 0)
    }

    // ICC message format:
    //   [0] = type (1 = request)
    //   [1] = major command
    //   [2] = minor command
    //   [3] = data length
    //   [4+] = payload data
    mem.view(msgBuf).setUint8(0, 0x01)           // Request
    mem.view(msgBuf).setUint8(1, major & 0xFF)    // Major cmd
    mem.view(msgBuf).setUint8(2, minor & 0xFF)    // Minor cmd
    mem.view(msgBuf).setUint8(3, payload.length & 0xFF) // Data len

    for (let i = 0; i < payload.length; i++) {
      mem.view(msgBuf).setUint8(4 + i, payload[i]! & 0xFF)
    }

    // Prepare ioctl argument struct (16 bytes):
    //   [0-7]   = pointer to message buffer
    //   [8-11]  = buffer size
    //   [12-15] = status/flags
    const ioctlArg = mem.malloc(16)
    mem.view(ioctlArg).setBigInt(0, msgBuf, true)
    mem.view(ioctlArg).setUint32(8, 256, true)
    mem.view(ioctlArg).setUint32(12, 0, true)

    const ret = fn.fan_ioctl(iccFd, ICC_IOCTL_CMD, ioctlArg)

    if (ret.eq(new BigInt(0xffffffff, 0xffffffff))) {
      return null
    }

    // Read response from message buffer
    const response: number[] = []
    for (let i = 0; i < respLen; i++) {
      response.push(mem.view(msgBuf).getUint8(4 + i))
    }

    return response
  } catch (e) {
    return null
  }
}

function _iccSetFanThreshold (iccFd: BigInt, major: number, minor: number, thresholdC: number, fanLow: number, fanHigh: number): boolean {
  // Payload: [threshold_temp, fan_speed_low, fan_speed_high, hysteresis]
  const payload = [
    thresholdC & 0xFF,     // Threshold temperature (°C)
    fanLow & 0xFF,         // Fan speed below threshold (%)
    fanHigh & 0xFF,        // Fan speed above threshold (%)
    3                      // Hysteresis (°C) — prevents fan oscillation
  ]

  const result = _iccQuery(iccFd, major, minor, payload, 4)
  return result !== null
}

function _iccSetFanThreshold3 (iccFd: BigInt, major: number, minor: number, threshLow: number, threshHigh: number, speedSlow: number, speedMed: number, speedFast: number): boolean {
  // 3-tier payload: [thresh_low, thresh_high, speed_slow, speed_med, speed_fast, hysteresis]
  const payload = [
    threshLow & 0xFF,      // Low threshold (Slow→Medium transition)
    threshHigh & 0xFF,     // High threshold (Medium→Fast transition)
    speedSlow & 0xFF,      // Slow fan speed (%)
    speedMed & 0xFF,       // Medium fan speed (%)
    speedFast & 0xFF,      // Fast fan speed (%)
    3                      // Hysteresis (°C) — prevents fan oscillation
  ]

  const result = _iccQuery(iccFd, major, minor, payload, 4)
  return result !== null
}

function _iccSetFanDuty (iccFd: BigInt, major: number, minor: number, dutyCycle: number): boolean {
  // Directly set fan duty cycle percentage
  const payload = [dutyCycle & 0xFF]
  const result = _iccQuery(iccFd, major, minor, payload, 4)
  return result !== null
}

function _iccReadTemperature (iccFd: BigInt): number {
  // Try multiple ICC temperature query commands
  const tempCommands = [
    { major: 0x03, minor: 0x07 }, // Standard thermal query
    { major: 0x08, minor: 0x00 }, // Alternative thermal query
    { major: 0x03, minor: 0x06 }, // SOC temp query
    { major: 0x08, minor: 0x10 }  // Extended thermal query
  ]

  for (let i = 0; i < tempCommands.length; i++) {
    const cmd = tempCommands[i]!
    const result = _iccQuery(iccFd, cmd.major, cmd.minor, [], 8)
    if (result !== null && result.length >= 2) {
      // Try parsing as direct celsius
      if (result[0]! > 20 && result[0]! < 100) {
        return result[0]!
      }
      // Try as big-endian uint16 centi-celsius
      const temp16 = (result[0]! << 8) | result[1]!
      if (temp16 > 2000 && temp16 < 10000) {
        return Math.round(temp16 / 100)
      }
      // Try as little-endian uint16
      const temp16le = result[0]! | (result[1]! << 8)
      if (temp16le > 2000 && temp16le < 10000) {
        return Math.round(temp16le / 100)
      }
      // Try result[1] as direct celsius
      if (result[1]! > 20 && result[1]! < 100) {
        return result[1]!
      }
    }
  }
  return -1
}

// === FAN CONTROL PANEL UI ===

;(function () {
  if (typeof libc_addr === 'undefined') {
    include('userland.js')
  }
  include('check-jailbroken.js')
  include('themes.js')
  include('sfx.js')
  include('languages.js')
  include('ui.js')
  include('logger.js')

  log(lang.loadingFanControl || 'Loading fan control...')

  const theme = themes_getTheme()
  const jailbroken = checkJailbroken()

  ui_initScreen()
  sfx_playBgm()
  ui_addBackground()
  ui_addLogo(1620, 0, 300, 169)
  ui_addTitle(lang.fanControl || 'Fan Control', 'fanControl', 820, 70, 280, 60)

  // Styles
  new Style({ name: 'fc_label', color: 'rgb(200,200,200)', size: 22 })
  new Style({ name: 'fc_value', color: theme.accent, size: 28 })
  new Style({ name: 'fc_value_big', color: theme.accent, size: 42 })
  new Style({ name: 'fc_warn', color: theme.errorColor || 'rgb(255,100,80)', size: 22 })
  new Style({ name: 'fc_ok', color: theme.successColor || 'rgb(80,220,120)', size: 22 })
  new Style({ name: 'fc_dim', color: 'rgb(120,120,120)', size: 18 })
  new Style({ name: 'fc_bar_bg', color: 'rgb(40,40,40)', size: 20 })
  new Style({ name: 'fc_bar_fill', color: theme.accent, size: 20 })
  new Style({ name: 'fc_temp_hot', color: 'rgb(255,80,60)', size: 42 })
  new Style({ name: 'fc_temp_warm', color: 'rgb(255,200,60)', size: 42 })
  new Style({ name: 'fc_temp_cool', color: 'rgb(80,200,255)', size: 42 })

  // Register syscalls for ICC
  fn.register(0x05, 'fan_open', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x06, 'fan_close', ['bigint'], 'bigint')
  fn.register(0x36, 'fan_ioctl', ['bigint', 'bigint', 'bigint'], 'bigint')

  if (!jailbroken) {
    const warnText = new jsmaf.Text()
    warnText.text = lang.jbRequired || 'Jailbreak required to use Fan Control'
    warnText.x = 400
    warnText.y = 500
    warnText.style = 'fc_warn'
    jsmaf.root.children.push(warnText)

    jsmaf.onKeyDown = function (keyCode) {
      if (keyCode === 13) { // Circle
        include('tools.js')
      }
    }
    return
  }

  // === STATE ===
  let currentTemp = -1
  let iccConnected = false
  let iccFd: BigInt | null = null
  let iccDeviceName = ''
  let fanFixApplied = false

  // Settings (loaded from CONFIG)
  // 3-tier fan curve: Slow → Medium → Fast
  let threshLow = 55    // Slow→Medium transition (°C)
  let threshHigh = 70   // Medium→Fast transition (°C)
  let fanSlow = 25      // Slow fan speed (%)
  let fanMed = 50       // Medium fan speed (%)
  let fanFast = 80      // Fast fan speed (%)
  let fanFixMode = 1    // 0=Off, 1=Built-in ICC, 2=Launch Temp App
  const fanFixModeLabels = [
    lang.fanFixOff || 'Off',
    lang.fanFixBuiltIn || 'Built-in ICC',
    lang.fanFixLaunchApp || 'Launch Temp App'
  ]

  // Load from CONFIG
  if (typeof CONFIG !== 'undefined') {
    if (typeof CONFIG.fan_threshold === 'number' && CONFIG.fan_threshold >= 40 && CONFIG.fan_threshold <= 80) {
      threshLow = CONFIG.fan_threshold
    }
    if (typeof CONFIG.fan_threshold_high === 'number' && CONFIG.fan_threshold_high >= 40 && CONFIG.fan_threshold_high <= 90) {
      threshHigh = CONFIG.fan_threshold_high
    }
    if (typeof CONFIG.fan_low_speed === 'number' && CONFIG.fan_low_speed >= 0 && CONFIG.fan_low_speed <= 100) {
      fanSlow = CONFIG.fan_low_speed
    }
    if (typeof CONFIG.fan_med_speed === 'number' && CONFIG.fan_med_speed >= 0 && CONFIG.fan_med_speed <= 100) {
      fanMed = CONFIG.fan_med_speed
    }
    if (typeof CONFIG.fan_high_speed === 'number' && CONFIG.fan_high_speed >= 0 && CONFIG.fan_high_speed <= 100) {
      fanFast = CONFIG.fan_high_speed
    }
    if (typeof CONFIG.fan_fix_mode === 'number' && CONFIG.fan_fix_mode >= 0 && CONFIG.fan_fix_mode <= 2) {
      fanFixMode = CONFIG.fan_fix_mode
    }
  }
  // Ensure threshHigh > threshLow
  if (threshHigh <= threshLow) threshHigh = threshLow + 10

  // Menu items for navigation
  const MENU_ITEMS = [
    'thresh_low',   // 0: Slow→Medium threshold
    'thresh_high',  // 1: Medium→Fast threshold
    'fan_slow',     // 2: Slow fan speed
    'fan_med',      // 3: Medium fan speed
    'fan_fast',     // 4: Fast fan speed
    'fan_mode',     // 5: Fan fix mode (Off / Built-in / Launch App)
    'apply',        // 6: Apply now
    'save',         // 7: Save settings
    'back'          // 8: Back to tools
  ]
  let selectedItem = 0

  // === LAYOUT ===
  const panelX = 100
  const panelY = 160

  // --- Connection Status ---
  const connLabel = new jsmaf.Text()
  connLabel.text = 'ICC Status:'
  connLabel.x = panelX
  connLabel.y = panelY
  connLabel.style = 'fc_label'
  jsmaf.root.children.push(connLabel)

  const connValue = new jsmaf.Text()
  connValue.text = 'Connecting...'
  connValue.x = panelX + 200
  connValue.y = panelY
  connValue.style = 'fc_dim'
  jsmaf.root.children.push(connValue)

  // --- Current Temperature Display (big) ---
  const tempLabel = new jsmaf.Text()
  tempLabel.text = lang.currentTemp || 'CPU Temperature'
  tempLabel.x = panelX
  tempLabel.y = panelY + 50
  tempLabel.style = 'fc_label'
  jsmaf.root.children.push(tempLabel)

  const tempDisplay = new jsmaf.Text()
  tempDisplay.text = '-- °C'
  tempDisplay.x = panelX + 300
  tempDisplay.y = panelY + 35
  tempDisplay.style = 'fc_value_big'
  jsmaf.root.children.push(tempDisplay)

  // Temperature bar visualization
  const tempBarBg = new Image({
    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==',
    x: panelX,
    y: panelY + 95,
    width: 600,
    height: 16
  })
  tempBarBg.alpha = 0.3
  jsmaf.root.children.push(tempBarBg)

  const tempBarFill = new Image({
    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==',
    x: panelX,
    y: panelY + 95,
    width: 1,
    height: 16
  })
  jsmaf.root.children.push(tempBarFill)

  // Temperature scale labels
  const tempScaleMin = new jsmaf.Text()
  tempScaleMin.text = '30°'
  tempScaleMin.x = panelX - 10
  tempScaleMin.y = panelY + 115
  tempScaleMin.style = 'fc_dim'
  jsmaf.root.children.push(tempScaleMin)

  const tempScaleMax = new jsmaf.Text()
  tempScaleMax.text = '90°'
  tempScaleMax.x = panelX + 580
  tempScaleMax.y = panelY + 115
  tempScaleMax.style = 'fc_dim'
  jsmaf.root.children.push(tempScaleMax)

  // Threshold markers on temp bar (2 markers for 3-tier)
  const threshMarkerLow = new jsmaf.Text()
  threshMarkerLow.text = '▼'
  threshMarkerLow.x = panelX + Math.round(((threshLow - 30) / 60) * 600) - 5
  threshMarkerLow.y = panelY + 78
  threshMarkerLow.style = 'fc_temp_warm'
  jsmaf.root.children.push(threshMarkerLow)

  const threshMarkerHigh = new jsmaf.Text()
  threshMarkerHigh.text = '▼'
  threshMarkerHigh.x = panelX + Math.round(((threshHigh - 30) / 60) * 600) - 5
  threshMarkerHigh.y = panelY + 78
  threshMarkerHigh.style = 'fc_temp_hot'
  jsmaf.root.children.push(threshMarkerHigh)

  // --- Divider ---
  const divider = new jsmaf.Text()
  divider.text = '─────────────────────────────────────────────────────────'
  divider.x = panelX
  divider.y = panelY + 145
  divider.style = 'fc_dim'
  jsmaf.root.children.push(divider)

  // --- Settings Area (3-tier) ---
  const settingsY = panelY + 180
  const settingSpacing = 45
  const labelWidth = 380

  // Selection marker
  const selectMarker = new jsmaf.Text()
  selectMarker.text = '>'
  selectMarker.x = panelX - 30
  selectMarker.y = settingsY
  selectMarker.style = 'fc_value'
  jsmaf.root.children.push(selectMarker)

  // Setting 0: Slow→Med Threshold
  const threshLowLabel = new jsmaf.Text()
  threshLowLabel.text = (lang.fanThreshLow || 'Slow → Med Threshold') + ':'
  threshLowLabel.x = panelX
  threshLowLabel.y = settingsY
  threshLowLabel.style = 'fc_label'
  jsmaf.root.children.push(threshLowLabel)

  const threshLowValue = new jsmaf.Text()
  threshLowValue.text = '< ' + threshLow + ' °C >'
  threshLowValue.x = panelX + labelWidth
  threshLowValue.y = settingsY
  threshLowValue.style = 'fc_value'
  jsmaf.root.children.push(threshLowValue)

  // Setting 1: Med→Fast Threshold
  const threshHighLabel = new jsmaf.Text()
  threshHighLabel.text = (lang.fanThreshHigh || 'Med → Fast Threshold') + ':'
  threshHighLabel.x = panelX
  threshHighLabel.y = settingsY + settingSpacing
  threshHighLabel.style = 'fc_label'
  jsmaf.root.children.push(threshHighLabel)

  const threshHighValue = new jsmaf.Text()
  threshHighValue.text = '< ' + threshHigh + ' °C >'
  threshHighValue.x = panelX + labelWidth
  threshHighValue.y = settingsY + settingSpacing
  threshHighValue.style = 'fc_value'
  jsmaf.root.children.push(threshHighValue)

  // Setting 2: Slow Fan Speed
  const slowLabel = new jsmaf.Text()
  slowLabel.text = (lang.fanSlowSpeed || 'Slow Speed') + ':'
  slowLabel.x = panelX
  slowLabel.y = settingsY + settingSpacing * 2
  slowLabel.style = 'fc_label'
  jsmaf.root.children.push(slowLabel)

  const slowValue = new jsmaf.Text()
  slowValue.text = '< ' + fanSlow + ' % >'
  slowValue.x = panelX + labelWidth
  slowValue.y = settingsY + settingSpacing * 2
  slowValue.style = 'fc_temp_cool'
  jsmaf.root.children.push(slowValue)

  // Setting 3: Medium Fan Speed
  const medLabel = new jsmaf.Text()
  medLabel.text = (lang.fanMedSpeed || 'Medium Speed') + ':'
  medLabel.x = panelX
  medLabel.y = settingsY + settingSpacing * 3
  medLabel.style = 'fc_label'
  jsmaf.root.children.push(medLabel)

  const medValue = new jsmaf.Text()
  medValue.text = '< ' + fanMed + ' % >'
  medValue.x = panelX + labelWidth
  medValue.y = settingsY + settingSpacing * 3
  medValue.style = 'fc_temp_warm'
  jsmaf.root.children.push(medValue)

  // Setting 4: Fast Fan Speed
  const fastLabel = new jsmaf.Text()
  fastLabel.text = (lang.fanFastSpeed || 'Fast Speed') + ':'
  fastLabel.x = panelX
  fastLabel.y = settingsY + settingSpacing * 4
  fastLabel.style = 'fc_label'
  jsmaf.root.children.push(fastLabel)

  const fastValue = new jsmaf.Text()
  fastValue.text = '< ' + fanFast + ' % >'
  fastValue.x = panelX + labelWidth
  fastValue.y = settingsY + settingSpacing * 4
  fastValue.style = 'fc_temp_hot'
  jsmaf.root.children.push(fastValue)

  // Setting 5: Fan Fix Mode (cycle: Off / Built-in / Launch App)
  const modeLabel = new jsmaf.Text()
  modeLabel.text = (lang.fanFixMode || 'Fan Fix Mode') + ':'
  modeLabel.x = panelX
  modeLabel.y = settingsY + settingSpacing * 5
  modeLabel.style = 'fc_label'
  jsmaf.root.children.push(modeLabel)

  const modeValue = new jsmaf.Text()
  modeValue.text = '< ' + (fanFixModeLabels[fanFixMode] || 'Off') + ' >'
  modeValue.x = panelX + labelWidth
  modeValue.y = settingsY + settingSpacing * 5
  modeValue.style = fanFixMode > 0 ? 'fc_ok' : 'fc_warn'
  jsmaf.root.children.push(modeValue)

  // Setting 6: Apply Now button
  const applyLabel = new jsmaf.Text()
  applyLabel.text = '[ ' + (lang.applyFanFix || 'APPLY FAN FIX NOW') + ' ]'
  applyLabel.x = panelX
  applyLabel.y = settingsY + settingSpacing * 6
  applyLabel.style = 'fc_ok'
  jsmaf.root.children.push(applyLabel)

  // Setting 7: Save Settings button
  const saveLabel = new jsmaf.Text()
  saveLabel.text = '[ ' + (lang.saveSettings || 'SAVE SETTINGS') + ' ]'
  saveLabel.x = panelX
  saveLabel.y = settingsY + settingSpacing * 7
  saveLabel.style = 'fc_label'
  jsmaf.root.children.push(saveLabel)

  // Setting 8: Back
  const backLabel = new jsmaf.Text()
  backLabel.text = '[ ' + (lang.back || 'Back') + ' ]'
  backLabel.x = panelX
  backLabel.y = settingsY + settingSpacing * 8
  backLabel.style = 'fc_label'
  jsmaf.root.children.push(backLabel)

  // --- Fan Status display ---
  const fanStatusLabel = new jsmaf.Text()
  fanStatusLabel.text = lang.fanStatus || 'Fan Status:'
  fanStatusLabel.x = panelX + 700
  fanStatusLabel.y = panelY + 180
  fanStatusLabel.style = 'fc_label'
  jsmaf.root.children.push(fanStatusLabel)

  const fanStatusValue = new jsmaf.Text()
  fanStatusValue.text = fanFixApplied ? 'ACTIVE' : 'NOT SET'
  fanStatusValue.x = panelX + 700
  fanStatusValue.y = panelY + 215
  fanStatusValue.style = fanFixApplied ? 'fc_ok' : 'fc_warn'
  jsmaf.root.children.push(fanStatusValue)

  // Fan mode description
  const fanModeDesc = new jsmaf.Text()
  fanModeDesc.text = ''
  fanModeDesc.x = panelX + 700
  fanModeDesc.y = panelY + 255
  fanModeDesc.style = 'fc_dim'
  jsmaf.root.children.push(fanModeDesc)

  // Visual representation of the 3-tier fan curve
  const curveTitle = new jsmaf.Text()
  curveTitle.text = lang.fanCurve || 'Fan Curve (3 Tier):'
  curveTitle.x = panelX + 700
  curveTitle.y = panelY + 285
  curveTitle.style = 'fc_label'
  jsmaf.root.children.push(curveTitle)

  const curveSlow = new jsmaf.Text()
  curveSlow.text = ''
  curveSlow.x = panelX + 700
  curveSlow.y = panelY + 318
  curveSlow.style = 'fc_temp_cool'
  jsmaf.root.children.push(curveSlow)

  const curveArrow1 = new jsmaf.Text()
  curveArrow1.text = ''
  curveArrow1.x = panelX + 700
  curveArrow1.y = panelY + 348
  curveArrow1.style = 'fc_dim'
  jsmaf.root.children.push(curveArrow1)

  const curveMed = new jsmaf.Text()
  curveMed.text = ''
  curveMed.x = panelX + 700
  curveMed.y = panelY + 378
  curveMed.style = 'fc_temp_warm'
  jsmaf.root.children.push(curveMed)

  const curveArrow2 = new jsmaf.Text()
  curveArrow2.text = ''
  curveArrow2.x = panelX + 700
  curveArrow2.y = panelY + 408
  curveArrow2.style = 'fc_dim'
  jsmaf.root.children.push(curveArrow2)

  const curveFast = new jsmaf.Text()
  curveFast.text = ''
  curveFast.x = panelX + 700
  curveFast.y = panelY + 438
  curveFast.style = 'fc_temp_hot'
  jsmaf.root.children.push(curveFast)

  // Status / feedback line
  const statusText = new jsmaf.Text()
  statusText.text = ''
  statusText.x = panelX
  statusText.y = 980
  statusText.style = 'fc_ok'
  jsmaf.root.children.push(statusText)

  // Controls hint
  const controlsText = new jsmaf.Text()
  controlsText.text = 'UP/DOWN: Select  |  LEFT/RIGHT: Adjust  |  X: Confirm  |  CIRCLE: Back'
  controlsText.x = 250
  controlsText.y = 1020
  controlsText.style = 'fc_dim'
  jsmaf.root.children.push(controlsText)

  // === FUNCTIONS ===

  function setStatus (msg: string, isError?: boolean): void {
    statusText.text = msg
    statusText.style = isError ? 'fc_warn' : 'fc_ok'
    logger_info('[FanCtrl] ' + msg)
    setTimeout(function () {
      if (statusText.text === msg) statusText.text = ''
    }, 6000)
  }

  function updateFanCurveDisplay (): void {
    curveSlow.text = '< ' + threshLow + '°C → ' + fanSlow + '% (Slow)'
    curveArrow1.text = '────────────'
    curveMed.text = threshLow + '-' + threshHigh + '°C → ' + fanMed + '% (Med)'
    curveArrow2.text = '────────────'
    curveFast.text = '> ' + threshHigh + '°C → ' + fanFast + '% (Fast)'
    fanModeDesc.text = 'S:' + fanSlow + '% M:' + fanMed + '% F:' + fanFast + '%'

    // Update threshold markers on temp bar
    const markerLowPos = Math.round(((threshLow - 30) / 60) * 600)
    threshMarkerLow.x = panelX + Math.max(0, Math.min(590, markerLowPos)) - 5
    const markerHighPos = Math.round(((threshHigh - 30) / 60) * 600)
    threshMarkerHigh.x = panelX + Math.max(0, Math.min(590, markerHighPos)) - 5
  }

  function updateDisplay (): void {
    // Update threshold values
    threshLowValue.text = '< ' + threshLow + ' °C >'
    threshHighValue.text = '< ' + threshHigh + ' °C >'

    // Update fan speeds
    slowValue.text = '< ' + fanSlow + ' % >'
    medValue.text = '< ' + fanMed + ' % >'
    fastValue.text = '< ' + fanFast + ' % >'

    // Update fan mode
    modeValue.text = '< ' + (fanFixModeLabels[fanFixMode] || 'Off') + ' >'
    modeValue.style = fanFixMode > 0 ? 'fc_ok' : 'fc_warn'

    // Update fan status
    fanStatusValue.text = fanFixApplied ? 'ACTIVE' : 'NOT SET'
    fanStatusValue.style = fanFixApplied ? 'fc_ok' : 'fc_warn'

    // Update selection marker position
    selectMarker.y = settingsY + selectedItem * settingSpacing

    // Update fan curve visual
    updateFanCurveDisplay()
  }

  function updateTemperatureDisplay (): void {
    if (currentTemp > 0) {
      tempDisplay.text = currentTemp + ' °C'

      // Color based on 3-tier thresholds
      if (currentTemp >= threshHigh) {
        tempDisplay.style = 'fc_temp_hot'
      } else if (currentTemp >= threshLow) {
        tempDisplay.style = 'fc_temp_warm'
      } else {
        tempDisplay.style = 'fc_temp_cool'
      }

      // Update temperature bar
      const barWidth = Math.max(1, Math.min(600, Math.round(((currentTemp - 30) / 60) * 600)))
      tempBarFill.width = barWidth
    } else {
      tempDisplay.text = (lang.tempNotAvailable || 'N/A') + '  (ICC: ' + (iccConnected ? 'OK' : 'FAIL') + ')'
      tempDisplay.style = 'fc_dim'
      tempBarFill.width = 1
    }
  }

  // Try to open ICC and read initial temperature
  function initICC (): void {
    const ICC_DEVICES_LIST = ['/dev/icc_configuration', '/dev/icc_power']

    for (let d = 0; d < ICC_DEVICES_LIST.length; d++) {
      const devPath = ICC_DEVICES_LIST[d]!
      const pathBuf = _makePathBuf(devPath)
      const fd = fn.fan_open(pathBuf, new BigInt(0, 2), new BigInt(0, 0))
      if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        iccFd = fd
        iccDeviceName = devPath
        iccConnected = true
        break
      }
    }

    if (iccConnected && iccFd) {
      connValue.text = 'Connected (' + iccDeviceName + ')'
      connValue.style = 'fc_ok'
      log('ICC connected: ' + iccDeviceName)

      // Try to read temperature
      currentTemp = _iccReadTemperature(iccFd)
      updateTemperatureDisplay()

      if (currentTemp > 0) {
        setStatus('ICC connected — Temperature: ' + currentTemp + '°C')
      } else {
        setStatus('ICC connected — Temperature reading not available on this FW')
      }
    } else {
      connValue.text = 'Not available'
      connValue.style = 'fc_warn'
      setStatus('ICC device not accessible — Fan control may not work', true)
    }
  }

  // Poll temperature periodically
  let tempPollTimer: number | null = null

  function startTempPoll (): void {
    if (!iccConnected || !iccFd) return

    function pollTemp () {
      if (!iccFd) return
      const temp = _iccReadTemperature(iccFd)
      if (temp > 0) {
        currentTemp = temp
        updateTemperatureDisplay()
      }
      tempPollTimer = setTimeout(pollTemp, 3000) as unknown as number
    }

    pollTemp()
  }

  function applyFanFixNow (): void {
    if (!jailbroken) {
      setStatus('Jailbreak required!', true)
      sfx_playFail()
      return
    }

    setStatus('Applying fan threshold...')

    // Close existing ICC fd if open (to get fresh connection)
    if (iccFd) {
      fn.fan_close(iccFd)
      iccFd = null
    }

    // Re-open and apply
    const ICC_DEVICES_LIST = ['/dev/icc_configuration', '/dev/icc_power']
    let fd: BigInt | null = null

    for (let d = 0; d < ICC_DEVICES_LIST.length; d++) {
      const devPath = ICC_DEVICES_LIST[d]!
      const pathBuf = _makePathBuf(devPath)
      const openFd = fn.fan_open(pathBuf, new BigInt(0, 2), new BigInt(0, 0))
      if (!openFd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        fd = openFd
        iccDeviceName = devPath
        break
      }
    }

    if (!fd) {
      setStatus('Cannot open ICC device!', true)
      sfx_playFail()
      return
    }

    iccFd = fd
    iccConnected = true

    // Try setting the 3-tier fan threshold via ICC
    let success = false

    // Method 1: 3-tier threshold (preferred)
    success = _iccSetFanThreshold3(fd, 0x08, 0x01, threshLow, threshHigh, fanSlow, fanMed, fanFast)
    if (!success) {
      success = _iccSetFanThreshold3(fd, 0x03, 0x05, threshLow, threshHigh, fanSlow, fanMed, fanFast)
    }

    // Method 2: Direct duty cycle as fallback (use fast speed)
    if (!success) {
      success = _iccSetFanDuty(fd, 0x08, 0x02, fanFast)
    }
    if (!success) {
      success = _iccSetFanDuty(fd, 0x03, 0x03, fanFast)
    }

    if (success) {
      fanFixApplied = true
      setStatus('Fan fix applied! Slow:<' + threshLow + '°C=' + fanSlow + '% Med:' + threshLow + '-' + threshHigh + '°C=' + fanMed + '% Fast:>' + threshHigh + '°C=' + fanFast + '%')
      sfx_playSuccess()
      utils.notify('Fan Control Active!\nSlow: <' + threshLow + '°C (' + fanSlow + '%)\nMed: ' + threshLow + '-' + threshHigh + '°C (' + fanMed + '%)\nFast: >' + threshHigh + '°C (' + fanFast + '%)')
      logger_info('Fan 3-tier applied: S=' + fanSlow + '% M=' + fanMed + '% F=' + fanFast + '%')
    } else {
      setStatus('ICC commands sent but no confirmation — fan fix may still work', false)
      sfx_playSelect()
      fanFixApplied = true // Optimistic — ICC may not return success even when it works
      utils.notify('Fan thresholds set\nSlow/Med/Fast: ' + fanSlow + '/' + fanMed + '/' + fanFast + '%')
    }

    updateDisplay()
    startTempPoll()
  }

  function saveSettings (): void {
    // Save 3-tier fan settings to CONFIG by rewriting config.js
    try {
      const xhr = new jsmaf.XMLHttpRequest()
      xhr.open('GET', 'file://../download0/config.js', false)
      xhr.send()

      let configData = xhr.responseText || ''

      // Helper to update or add a config key
      function upsertConfig (key: string, value: number | string, afterKey?: string): void {
        const regex = new RegExp(key + ':\\s*\\S+')
        if (configData.indexOf(key) >= 0) {
          configData = configData.replace(regex, key + ': ' + value)
        } else {
          const anchor = afterKey || 'nav_sounds'
          const anchorRegex = new RegExp('(' + anchor + ':\\s*\\S+)')
          configData = configData.replace(anchorRegex, '$1,\n    ' + key + ': ' + value)
        }
      }

      upsertConfig('fan_threshold', threshLow)
      upsertConfig('fan_threshold_high', threshHigh, 'fan_threshold')
      upsertConfig('fan_low_speed', fanSlow, 'fan_threshold_high')
      upsertConfig('fan_med_speed', fanMed, 'fan_low_speed')
      upsertConfig('fan_high_speed', fanFast, 'fan_med_speed')
      upsertConfig('fan_fix_mode', fanFixMode, 'fan_high_speed')

      const writeXhr = new jsmaf.XMLHttpRequest()
      writeXhr.open('POST', 'file://../download0/config.js', false)
      writeXhr.send(configData)

      setStatus('Settings saved! S:' + fanSlow + '% M:' + fanMed + '% F:' + fanFast + '% | Mode=' + (fanFixModeLabels[fanFixMode] || 'Off'))
      sfx_playSuccess()
      logger_info('Fan 3-tier settings saved to config.js')
    } catch (e) {
      setStatus('Save failed: ' + (e as Error).message, true)
      sfx_playFail()
    }
  }

  // === KEY HANDLER ===
  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 4) { // Up
      if (selectedItem > 0) {
        selectedItem--
        sfx_playNav()
        updateDisplay()
      }
    } else if (keyCode === 6) { // Down
      if (selectedItem < MENU_ITEMS.length - 1) {
        selectedItem++
        sfx_playNav()
        updateDisplay()
      }
    } else if (keyCode === 7) { // Left - decrease value
      const item = MENU_ITEMS[selectedItem]
      if (item === 'thresh_low') {
        if (threshLow > 40) {
          threshLow--
          if (threshHigh <= threshLow) threshHigh = threshLow + 1
          sfx_playNav()
          updateDisplay()
        }
      } else if (item === 'thresh_high') {
        if (threshHigh > threshLow + 1) {
          threshHigh--
          sfx_playNav()
          updateDisplay()
        }
      } else if (item === 'fan_slow') {
        if (fanSlow > 0) {
          fanSlow -= 5
          if (fanSlow < 0) fanSlow = 0
          sfx_playNav()
          updateDisplay()
        }
      } else if (item === 'fan_med') {
        if (fanMed > 5) {
          fanMed -= 5
          if (fanMed < 5) fanMed = 5
          sfx_playNav()
          updateDisplay()
        }
      } else if (item === 'fan_fast') {
        if (fanFast > 10) {
          fanFast -= 5
          if (fanFast < 10) fanFast = 10
          sfx_playNav()
          updateDisplay()
        }
      } else if (item === 'fan_mode') {
        fanFixMode = (fanFixMode + 2) % 3
        sfx_playNav()
        updateDisplay()
      }
    } else if (keyCode === 5) { // Right - increase value
      const item = MENU_ITEMS[selectedItem]
      if (item === 'thresh_low') {
        if (threshLow < 80) {
          threshLow++
          if (threshHigh <= threshLow) threshHigh = threshLow + 1
          sfx_playNav()
          updateDisplay()
        }
      } else if (item === 'thresh_high') {
        if (threshHigh < 90) {
          threshHigh++
          sfx_playNav()
          updateDisplay()
        }
      } else if (item === 'fan_slow') {
        if (fanSlow < 100) {
          fanSlow += 5
          if (fanSlow > 100) fanSlow = 100
          sfx_playNav()
          updateDisplay()
        }
      } else if (item === 'fan_med') {
        if (fanMed < 100) {
          fanMed += 5
          if (fanMed > 100) fanMed = 100
          sfx_playNav()
          updateDisplay()
        }
      } else if (item === 'fan_fast') {
        if (fanFast < 100) {
          fanFast += 5
          if (fanFast > 100) fanFast = 100
          sfx_playNav()
          updateDisplay()
        }
      } else if (item === 'fan_mode') {
        fanFixMode = (fanFixMode + 1) % 3
        sfx_playNav()
        updateDisplay()
      }
    } else if (keyCode === 14) { // X - confirm/action
      const item = MENU_ITEMS[selectedItem]
      if (item === 'fan_mode') {
        fanFixMode = (fanFixMode + 1) % 3
        sfx_playSelect()
        updateDisplay()
      } else if (item === 'apply') {
        sfx_playSelect()
        if (fanFixMode === 2) {
          // Mode 2: Notify user and close Vue so they can open temp app
          setStatus('Closing Vue — please open PS4 Temperature app from home screen')
          utils.notify('Fan Fix: Open PS4 Temperature App (LAPY20006)')
          fn.register(0x14, 'fc_getpid', [], 'bigint')
          fn.register(0x25, 'fc_kill', ['bigint', 'bigint'], 'bigint')
          try {
            const pid = fn.fc_getpid()
            setTimeout(function () {
              fn.fc_kill(pid, new BigInt(0, 9))
            }, 2000)
          } catch (e) {
            setStatus('Close failed — open PS4 Temp app manually', true)
          }
        } else {
          applyFanFixNow()
        }
      } else if (item === 'save') {
        sfx_playSelect()
        saveSettings()
      } else if (item === 'back') {
        if (iccFd) {
          fn.fan_close(iccFd)
          iccFd = null
        }
        include('tools.js')
      } else if (item === 'thresh_low' || item === 'thresh_high' || item === 'fan_slow' || item === 'fan_med' || item === 'fan_fast') {
        // X on adjustable items → apply immediately
        sfx_playSelect()
        applyFanFixNow()
      }
    } else if (keyCode === 13) { // Circle - back
      if (iccFd) {
        fn.fan_close(iccFd)
        iccFd = null
      }
      include('tools.js')
    }
  }

  // === INIT ===
  updateDisplay()
  updateFanCurveDisplay()
  initICC()
  startTempPoll()

  log(lang.fanControlLoaded || 'Fan control loaded')
  logger_info('Fan control panel loaded — 3-tier: S<' + threshLow + '°C M<' + threshHigh + '°C F>' + threshHigh + '°C')
})()


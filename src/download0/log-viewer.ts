// log-viewer.ts - Scrollable log viewer screen
// Shows the log history with scroll and filter by level

import { lang } from 'download0/languages'
import { logger_getFormattedHistory, logger_getHistory, logger_clear, LogEntry } from 'download0/logger'
import { themes_getTheme } from 'download0/themes'
import { ui_initScreen, ui_addBackground, ui_addLogo, ui_addTitle, ui_createMenuState, ui_updateHighlight, UI_NORMAL_BTN } from 'download0/ui'
import { sfx_playBgm, sfx_playNav } from 'download0/sfx'

;(function () {
  include('themes.js')
  include('logger.js')
  include('sfx.js')
  include('languages.js')
  include('ui.js')

  log(lang.loadingLogViewer || 'Loading log viewer...')

  const theme = themes_getTheme()

  ui_initScreen()
  sfx_playBgm()
  ui_addBackground()
  ui_addLogo(1620, 0, 300, 169)
  ui_addTitle(lang.logViewer || 'Log Viewer', 'logViewer', 870, 80, 200, 60)

  // Create styles
  new Style({ name: 'log_debug', color: 'rgb(120,120,120)', size: 16 })
  new Style({ name: 'log_info', color: 'rgb(200,200,200)', size: 16 })
  new Style({ name: 'log_warn', color: 'rgb(255,200,50)', size: 16 })
  new Style({ name: 'log_error', color: 'rgb(255,80,80)', size: 16 })
  new Style({ name: 'log_header', color: theme.accent, size: 20 })

  // Get log entries
  const allEntries = logger_getHistory()
  const VISIBLE_LINES = 38
  let scrollOffset = Math.max(0, allEntries.length - VISIBLE_LINES)
  let filterLevel = 'ALL' // ALL, DEBUG, INFO, WARN, ERROR
  const filterLevels = ['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR']
  let filterIndex = 0

  // Header bar
  const headerText = new jsmaf.Text()
  headerText.text = '[ LOG VIEWER ]  Entries: ' + allEntries.length + '  |  Filter: ' + filterLevel
  headerText.x = 80
  headerText.y = 140
  headerText.style = 'log_header'
  jsmaf.root.children.push(headerText)

  // Create text lines for log display
  const logLines: jsmaf.Text[] = []
  const startY = 175
  const lineHeight = 20

  for (let i = 0; i < VISIBLE_LINES; i++) {
    const line = new jsmaf.Text()
    line.text = ''
    line.x = 80
    line.y = startY + i * lineHeight
    line.style = 'log_info'
    jsmaf.root.children.push(line)
    logLines.push(line)
  }

  function getFilteredEntries (): LogEntry[] {
    if (filterLevel === 'ALL') return allEntries
    const levelPriority: Record<string, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 }
    const minPriority = levelPriority[filterLevel] || 0
    return allEntries.filter(function (entry) {
      return (levelPriority[entry.level] || 0) >= minPriority
    })
  }

  function formatEntry (entry: LogEntry): string {
    const date = new Date(entry.timestamp)
    const time = date.getHours().toString().padStart(2, '0') + ':' +
      date.getMinutes().toString().padStart(2, '0') + ':' +
      date.getSeconds().toString().padStart(2, '0')
    return '[' + time + '] [' + entry.level + '] ' + entry.message
  }

  function getStyleForLevel (level: string): string {
    switch (level) {
      case 'DEBUG': return 'log_debug'
      case 'WARN': return 'log_warn'
      case 'ERROR': return 'log_error'
      default: return 'log_info'
    }
  }

  function refreshDisplay (): void {
    const filtered = getFilteredEntries()
    headerText.text = '[ LOG VIEWER ]  Entries: ' + filtered.length + '  |  Filter: ' + filterLevel + '  |  Scroll: ' + (scrollOffset + 1) + '/' + Math.max(1, filtered.length)

    for (let i = 0; i < VISIBLE_LINES; i++) {
      const entryIndex = scrollOffset + i
      const line = logLines[i]
      if (!line) continue

      if (entryIndex < filtered.length) {
        const entry = filtered[entryIndex]!
        line.text = formatEntry(entry)
        line.style = getStyleForLevel(entry.level)
      } else {
        line.text = ''
      }
    }
  }

  // Scroll bar indicator (visual)
  const scrollBarBg = new Image({
    url: UI_NORMAL_BTN,
    x: 1840,
    y: 175,
    width: 10,
    height: VISIBLE_LINES * lineHeight
  })
  scrollBarBg.alpha = 0.3
  jsmaf.root.children.push(scrollBarBg)

  // Bottom controls
  const controlsText = new jsmaf.Text()
  controlsText.text = 'UP/DOWN: Scroll  |  L1/R1: Page  |  SQUARE: Filter  |  TRIANGLE: Clear  |  CIRCLE: Back'
  controlsText.x = 200
  controlsText.y = 1020
  controlsText.style = 'log_info'
  jsmaf.root.children.push(controlsText)

  // Initial display
  refreshDisplay()

  jsmaf.onKeyDown = function (keyCode) {
    const filtered = getFilteredEntries()

    if (keyCode === 4) { // Up
      if (scrollOffset > 0) {
        scrollOffset--
        refreshDisplay()
      }
    } else if (keyCode === 6) { // Down
      if (scrollOffset < filtered.length - VISIBLE_LINES) {
        scrollOffset++
        refreshDisplay()
      }
    } else if (keyCode === 10) { // L1 - Page up
      scrollOffset = Math.max(0, scrollOffset - VISIBLE_LINES)
      refreshDisplay()
    } else if (keyCode === 11) { // R1 - Page down
      scrollOffset = Math.min(Math.max(0, filtered.length - VISIBLE_LINES), scrollOffset + VISIBLE_LINES)
      refreshDisplay()
    } else if (keyCode === 15) { // Square - cycle filter
      filterIndex = (filterIndex + 1) % filterLevels.length
      filterLevel = filterLevels[filterIndex]!
      scrollOffset = Math.max(0, getFilteredEntries().length - VISIBLE_LINES)
      refreshDisplay()
    } else if (keyCode === 12) { // Triangle - clear logs
      logger_clear()
      scrollOffset = 0
      refreshDisplay()
    } else if (keyCode === 13) { // Circle - back
      include('main-menu.js')
    }
  }

  log(lang.logViewerLoaded || 'Log viewer loaded')
})()


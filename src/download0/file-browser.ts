// file-browser.ts - File system browser with PAYLOAD INJECTION + FILE OPERATIONS
// Navigate the PS4 filesystem, execute .elf/.bin/.js payloads, delete/copy/rename files

import { fn, mem, BigInt, utils } from 'download0/types'
import { libc_addr } from 'download0/userland'
import { binloader_init } from 'download0/binloader'
import { lang } from 'download0/languages'
import { checkJailbroken } from 'download0/check-jailbroken'
import { themes_getTheme } from 'download0/themes'
import { ui_initScreen, ui_addBackground, ui_addLogo, ui_addTitle, ui_createMenuState, ui_updateHighlight, UI_NORMAL_BTN, UI_MARKER_IMG } from 'download0/ui'
import { sfx_playBgm, sfx_playNav, sfx_playSelect, sfx_playSuccess, sfx_playFail } from 'download0/sfx'
import { logger_info, logger_error, logger_warn } from 'download0/logger'

;(function () {
  if (typeof libc_addr === 'undefined') {
    include('userland.js')
  }
  include('check-jailbroken.js')
  include('binloader.js')
  include('themes.js')
  include('sfx.js')
  include('logger.js')
  include('languages.js')
  include('ui.js')

  log(lang.loadingFileBrowser || 'Loading file browser...')

  const theme = themes_getTheme()
  const jailbroken = checkJailbroken()

  ui_initScreen()
  sfx_playBgm()
  ui_addBackground()
  ui_addLogo(1620, 0, 300, 169)
  ui_addTitle(lang.fileBrowser || 'File Browser', 'fileBrowser', 840, 80, 260, 60)

  // Create styles
  new Style({ name: 'fb_dir', color: theme.accent, size: 20 })
  new Style({ name: 'fb_file', color: 'white', size: 20 })
  new Style({ name: 'fb_exec', color: theme.successColor || 'rgb(80,220,120)', size: 20 })
  new Style({ name: 'fb_path', color: theme.accent, size: 22 })
  new Style({ name: 'fb_info', color: 'rgb(160,160,160)', size: 18 })
  new Style({ name: 'fb_status', color: theme.accent, size: 20 })
  new Style({ name: 'fb_error', color: theme.errorColor || 'rgb(255,80,80)', size: 20 })
  new Style({ name: 'fb_warn', color: 'rgb(255,200,80)', size: 22 })
  new Style({ name: 'fb_clipboard', color: 'rgb(180,140,255)', size: 18 })

  // Register syscalls
  fn.register(0x05, 'fb_open', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x06, 'fb_close', ['bigint'], 'bigint')
  fn.register(0x110, 'fb_getdents', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x03, 'fb_read', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x04, 'fb_write', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0xBC, 'fb_stat', ['bigint', 'bigint'], 'bigint')
  fn.register(0x0A, 'fb_unlink', ['bigint'], 'bigint')           // unlink - delete file
  fn.register(0x80, 'fb_rename', ['bigint', 'bigint'], 'bigint')  // rename - rename/move
  fn.register(0x88, 'fb_mkdir', ['bigint', 'bigint'], 'bigint')   // mkdir
  fn.register(0x89, 'fb_rmdir', ['bigint'], 'bigint')             // rmdir
  fn.register(0x18, 'fb_statfs', ['bigint', 'bigint'], 'bigint')  // statfs - disk space

  type DirEntry = { name: string, isDir: boolean, isPayload: boolean, fileType: string }

  let currentPath = jailbroken ? '/' : '/download0'
  let entries: DirEntry[] = []
  let scrollOffset = 0
  const VISIBLE_ITEMS = 20
  const ITEM_HEIGHT = 35
  const START_Y = 180
  const START_X = 80

  // Payload file extensions
  const PAYLOAD_EXTS = ['.elf', '.bin', '.js']

  // Clipboard for copy/paste operations
  let clipboardPath = ''
  let clipboardName = ''
  let clipboardMode: 'copy' | 'cut' | '' = ''

  // Delete confirmation state
  let deleteConfirmPending = false
  let deleteConfirmName = ''

  function isPayloadFile (name: string): boolean {
    const lower = name.toLowerCase()
    for (let i = 0; i < PAYLOAD_EXTS.length; i++) {
      if (lower.endsWith(PAYLOAD_EXTS[i]!)) return true
    }
    return false
  }

  function getFileType (name: string): string {
    const lower = name.toLowerCase()
    if (lower.endsWith('.elf')) return 'ELF'
    if (lower.endsWith('.bin')) return 'BIN'
    if (lower.endsWith('.js')) return 'JS'
    if (lower.endsWith('.pkg')) return 'PKG'
    if (lower.endsWith('.json')) return 'JSON'
    if (lower.endsWith('.txt')) return 'TXT'
    if (lower.endsWith('.wav') || lower.endsWith('.mp3')) return 'AUDIO'
    if (lower.endsWith('.jpg') || lower.endsWith('.png') || lower.endsWith('.gif')) return 'IMG'
    if (lower.endsWith('.mp4') || lower.endsWith('.avi') || lower.endsWith('.mkv')) return 'VIDEO'
    if (lower.endsWith('.zip') || lower.endsWith('.rar') || lower.endsWith('.7z')) return 'ARCH'
    return 'FILE'
  }

  // Helper to create a null-terminated path buffer
  function makePathBuf (path: string): BigInt {
    const buf = mem.malloc(path.length + 1)
    for (let i = 0; i < path.length; i++) {
      mem.view(buf).setUint8(i, path.charCodeAt(i))
    }
    mem.view(buf).setUint8(path.length, 0)
    return buf
  }

  function getFullPath (name: string): string {
    return currentPath === '/' ? '/' + name : currentPath + '/' + name
  }

  // Path display
  const pathText = new jsmaf.Text()
  pathText.text = 'Path: ' + currentPath
  pathText.x = 80
  pathText.y = 140
  pathText.style = 'fb_path'
  jsmaf.root.children.push(pathText)

  // Entry text lines
  const entryLines: jsmaf.Text[] = []
  for (let i = 0; i < VISIBLE_ITEMS; i++) {
    const line = new jsmaf.Text()
    line.text = ''
    line.x = START_X + 40
    line.y = START_Y + i * ITEM_HEIGHT
    line.style = 'fb_file'
    jsmaf.root.children.push(line)
    entryLines.push(line)
  }

  // Selection indicator
  let selectedIndex = 0
  const selectMarker = new jsmaf.Text()
  selectMarker.text = '>'
  selectMarker.x = START_X
  selectMarker.y = START_Y
  selectMarker.style = 'fb_dir'
  jsmaf.root.children.push(selectMarker)

  // Status bar (for injection feedback)
  const statusText = new jsmaf.Text()
  statusText.text = ''
  statusText.x = 80
  statusText.y = 900
  statusText.style = 'fb_status'
  jsmaf.root.children.push(statusText)

  // Clipboard indicator
  const clipboardText = new jsmaf.Text()
  clipboardText.text = ''
  clipboardText.x = 80
  clipboardText.y = 930
  clipboardText.style = 'fb_clipboard'
  jsmaf.root.children.push(clipboardText)

  // Disk space bar
  const diskSpaceText = new jsmaf.Text()
  diskSpaceText.text = ''
  diskSpaceText.x = 80
  diskSpaceText.y = 955
  diskSpaceText.style = 'fb_info'
  jsmaf.root.children.push(diskSpaceText)

  // Info bar
  const infoText = new jsmaf.Text()
  infoText.text = ''
  infoText.x = 80
  infoText.y = 980
  infoText.style = 'fb_info'
  jsmaf.root.children.push(infoText)

  // Controls
  const controlsText = new jsmaf.Text()
  controlsText.text = 'X:Open  TRI:Inject  SQ:USB  L1:Bookmarks  R2:Copy  L2:Delete  R1:PageDown'
  controlsText.x = 120
  controlsText.y = 1020
  controlsText.style = 'fb_info'
  jsmaf.root.children.push(controlsText)

  // Quick-access bookmarks
  const BOOKMARKS = [
    { name: '/ (Root)', path: '/' },
    { name: '/download0 (App)', path: '/download0' },
    { name: '/download0/payloads', path: '/download0/payloads' },
    { name: '/data/payloads', path: '/data/payloads' },
    { name: '/data', path: '/data' },
    { name: '/mnt/usb0', path: '/mnt/usb0' },
    { name: '/mnt/usb1', path: '/mnt/usb1' },
    { name: '/mnt/usb2', path: '/mnt/usb2' },
    { name: '/user/home', path: '/user/home' },
    { name: '/system', path: '/system' }
  ]
  let showBookmarks = false

  function setStatus (msg: string, isError?: boolean): void {
    statusText.text = msg
    statusText.style = isError ? 'fb_error' : 'fb_status'
    logger_info('[FB] ' + msg)
    // Auto-clear after 5 seconds
    setTimeout(function () {
      if (statusText.text === msg) {
        statusText.text = ''
      }
    }, 5000)
  }

  function updateClipboardDisplay (): void {
    if (clipboardPath) {
      clipboardText.text = (clipboardMode === 'cut' ? 'CUT: ' : 'COPIED: ') + clipboardName + '  [SQUARE in target folder to PASTE]'
    } else {
      clipboardText.text = ''
    }
  }

  // === DISK SPACE ===
  function getDiskSpace (path: string): { free: string, total: string } | null {
    try {
      const pathBuf = makePathBuf(path)
      const statfsBuf = mem.malloc(512)
      const ret = fn.fb_statfs(pathBuf, statfsBuf)
      if (!ret.eq(new BigInt(0xffffffff, 0xffffffff))) {
        // FreeBSD statfs struct: f_bsize at 4, f_bfree at 24, f_blocks at 8
        const bsize = mem.view(statfsBuf.add(new BigInt(0, 4))).getUint32(0, true)
        const blocks = mem.view(statfsBuf.add(new BigInt(0, 8))).getUint32(0, true)
        const bfree = mem.view(statfsBuf.add(new BigInt(0, 24))).getUint32(0, true)
        const totalBytes = blocks * bsize
        const freeBytes = bfree * bsize
        return {
          total: formatSize(totalBytes),
          free: formatSize(freeBytes)
        }
      }
    } catch (e) { /* ignore */ }
    return null
  }

  function updateDiskSpace (): void {
    const space = getDiskSpace(currentPath)
    if (space) {
      diskSpaceText.text = 'Disk: ' + space.free + ' free / ' + space.total + ' total'
    } else {
      diskSpaceText.text = ''
    }
  }

  function readDirectory (path: string): DirEntry[] {
    const result: DirEntry[] = []

    try {
      const pathBuf = makePathBuf(path)

      const fd = fn.fb_open(pathBuf, new BigInt(0, 0), new BigInt(0, 0))

      if (fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        log('Failed to open directory: ' + path)
        setStatus('Cannot open: ' + path, true)
        return result
      }

      const buf = mem.malloc(16384)
      let totalRead = 0

      // Read multiple chunks to get all entries
      while (true) {
        const count = fn.fb_getdents(fd, buf, new BigInt(0, 16384))
        if (count.eq(new BigInt(0xffffffff, 0xffffffff)) || count.lo === 0) break

        let offset = 0
        while (offset < count.lo) {
          const d_reclen = mem.view(buf.add(new BigInt(0, offset + 4))).getUint16(0, true)
          const d_type = mem.view(buf.add(new BigInt(0, offset + 6))).getUint8(0)
          const d_namlen = mem.view(buf.add(new BigInt(0, offset + 7))).getUint8(0)

          let name = ''
          for (let j = 0; j < d_namlen; j++) {
            name += String.fromCharCode(mem.view(buf.add(new BigInt(0, offset + 8 + j))).getUint8(0))
          }

          if (name !== '.') {
            const isDir = d_type === 4
            result.push({
              name: name,
              isDir: isDir,
              isPayload: !isDir && isPayloadFile(name),
              fileType: isDir ? 'DIR' : getFileType(name)
            })
          }

          offset += d_reclen
          totalRead++
        }

        // Safety limit
        if (totalRead > 500) break
      }

      fn.fb_close(fd)
    } catch (e) {
      log('Error reading directory: ' + (e as Error).message)
      setStatus('Error: ' + (e as Error).message, true)
    }

    // Sort: .. first, then dirs, then payloads (green), then other files
    result.sort(function (a, b) {
      if (a.name === '..') return -1
      if (b.name === '..') return 1
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
      if (a.isPayload !== b.isPayload) return a.isPayload ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    return result
  }

  function getFileSize (filePath: string): number {
    try {
      const pathBuf = makePathBuf(filePath)
      const statBuf = mem.malloc(256)
      const ret = fn.fb_stat(pathBuf, statBuf)
      if (!ret.eq(new BigInt(0xffffffff, 0xffffffff))) {
        // st_size is at offset 72 in FreeBSD stat struct (48 on some)
        const sizeLo = mem.view(statBuf.add(new BigInt(0, 72))).getUint32(0, true)
        return sizeLo
      }
    } catch (e) { /* ignore */ }
    return -1
  }

  function formatSize (bytes: number): string {
    if (bytes < 0) return '???'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
    return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB'
  }

  // === FILE OPERATIONS ===

  function deleteFile (filePath: string, fileName: string, isDir: boolean): boolean {
    try {
      const pathBuf = makePathBuf(filePath)
      let ret
      if (isDir) {
        ret = fn.fb_rmdir(pathBuf)
      } else {
        ret = fn.fb_unlink(pathBuf)
      }
      if (!ret.eq(new BigInt(0xffffffff, 0xffffffff))) {
        log('Deleted: ' + filePath)
        setStatus('Deleted: ' + fileName)
        sfx_playSuccess()
        logger_info('Deleted file: ' + filePath)
        return true
      } else {
        setStatus('DELETE FAILED: Permission denied or in use', true)
        sfx_playFail()
        return false
      }
    } catch (e) {
      setStatus('DELETE ERROR: ' + (e as Error).message, true)
      sfx_playFail()
      logger_error('Delete failed: ' + filePath + ' - ' + (e as Error).message)
      return false
    }
  }

  function copyFile (srcPath: string, dstPath: string): boolean {
    try {
      const srcBuf = makePathBuf(srcPath)
      const srcFd = fn.fb_open(srcBuf, new BigInt(0, 0), new BigInt(0, 0)) // O_RDONLY
      if (srcFd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        setStatus('COPY: Cannot open source file', true)
        return false
      }

      // O_WRONLY | O_CREAT | O_TRUNC = 0x0601
      const dstBuf = makePathBuf(dstPath)
      const dstFd = fn.fb_open(dstBuf, new BigInt(0, 0x0601), new BigInt(0, 0x1B6)) // 0666
      if (dstFd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        fn.fb_close(srcFd)
        setStatus('COPY: Cannot create destination file', true)
        return false
      }

      // Copy in 64KB chunks
      const chunkSize = 65536
      const chunk = mem.malloc(chunkSize)
      let totalCopied = 0

      while (true) {
        const bytesRead = fn.fb_read(srcFd, chunk, new BigInt(0, chunkSize))
        if (bytesRead.eq(new BigInt(0xffffffff, 0xffffffff))) break
        const readLen = (bytesRead instanceof BigInt) ? bytesRead.lo : bytesRead
        if (readLen === 0) break

        fn.fb_write(dstFd, chunk, new BigInt(0, readLen))
        totalCopied += readLen
      }

      fn.fb_close(srcFd)
      fn.fb_close(dstFd)

      log('Copied ' + totalCopied + ' bytes: ' + srcPath + ' -> ' + dstPath)
      return true
    } catch (e) {
      logger_error('Copy failed: ' + (e as Error).message)
      return false
    }
  }

  function renameFile (oldPath: string, newPath: string): boolean {
    try {
      const oldBuf = makePathBuf(oldPath)
      const newBuf = makePathBuf(newPath)
      const ret = fn.fb_rename(oldBuf, newBuf)
      if (!ret.eq(new BigInt(0xffffffff, 0xffffffff))) {
        log('Renamed: ' + oldPath + ' -> ' + newPath)
        return true
      }
      return false
    } catch (e) {
      logger_error('Rename failed: ' + (e as Error).message)
      return false
    }
  }

  function createDirectory (path: string): boolean {
    try {
      const pathBuf = makePathBuf(path)
      const ret = fn.fb_mkdir(pathBuf, new BigInt(0, 0x1FF)) // 0777
      if (!ret.eq(new BigInt(0xffffffff, 0xffffffff))) {
        log('Created directory: ' + path)
        return true
      }
      return false
    } catch (e) {
      logger_error('Mkdir failed: ' + (e as Error).message)
      return false
    }
  }

  function refreshDisplay (): void {
    if (showBookmarks) {
      pathText.text = '[ BOOKMARKS - Press L1 to toggle ]'

      for (let i = 0; i < VISIBLE_ITEMS; i++) {
        const line = entryLines[i]
        if (!line) continue

        if (i < BOOKMARKS.length) {
          const bm = BOOKMARKS[i]!
          line.text = '  [GO] ' + bm.name
          line.style = 'fb_dir'
        } else {
          line.text = ''
        }
      }

      // Update selection marker
      selectMarker.y = START_Y + selectedIndex * ITEM_HEIGHT
      selectMarker.visible = true

      infoText.text = 'Select a bookmark to jump to  |  ' + (selectedIndex + 1) + '/' + BOOKMARKS.length
      return
    }

    pathText.text = 'Path: ' + currentPath

    for (let i = 0; i < VISIBLE_ITEMS; i++) {
      const entryIndex = scrollOffset + i
      const line = entryLines[i]
      if (!line) continue

      if (entryIndex < entries.length) {
        const entry = entries[entryIndex]!
        let prefix = '      '
        if (entry.isDir) prefix = '[DIR] '
        else if (entry.isPayload) prefix = '[' + entry.fileType + '] '
        else prefix = ' ' + entry.fileType + '  '

        const displayName = entry.name.length > 55 ? entry.name.substring(0, 52) + '...' : entry.name
        line.text = prefix + displayName

        if (entry.isDir) {
          line.style = 'fb_dir'
        } else if (entry.isPayload) {
          line.style = 'fb_exec'
        } else {
          line.style = 'fb_file'
        }
      } else {
        line.text = ''
      }
    }

    // Update selection marker
    const visibleSelected = selectedIndex - scrollOffset
    if (visibleSelected >= 0 && visibleSelected < VISIBLE_ITEMS) {
      selectMarker.y = START_Y + visibleSelected * ITEM_HEIGHT
      selectMarker.visible = true
    } else {
      selectMarker.visible = false
    }

    // Update info bar with file details
    infoText.text = 'Items: ' + entries.length + '  |  ' + (selectedIndex + 1) + '/' + entries.length
    if (entries[selectedIndex]) {
      const sel = entries[selectedIndex]!
      if (sel.isDir) {
        infoText.text += '  |  ' + sel.name + ' (directory)'
      } else {
        const fullPath = getFullPath(sel.name)
        const size = getFileSize(fullPath)
        infoText.text += '  |  ' + sel.name + ' (' + sel.fileType + ', ' + formatSize(size) + ')'
        if (sel.isPayload) {
          infoText.text += '  [X: INJECT]'
        }
      }
    }

    updateClipboardDisplay()
  }

  function navigateTo (path: string): void {
    log('Navigating to: ' + path)
    currentPath = path
    entries = readDirectory(path)
    selectedIndex = 0
    scrollOffset = 0
    showBookmarks = false
    deleteConfirmPending = false
    updateDiskSpace()
    refreshDisplay()
  }

  function navigateUp (): void {
    if (currentPath === '/') return
    const parts = currentPath.split('/')
    parts.pop()
    const parentPath = parts.join('/') || '/'
    navigateTo(parentPath)
  }

  // === PAYLOAD INJECTION ===

  function injectPayload (filePath: string, fileName: string): void {
    const lower = fileName.toLowerCase()
    logger_info('Injecting payload: ' + filePath)
    setStatus('Injecting: ' + fileName + '...')

    try {
      if (lower.endsWith('.js')) {
        // === JavaScript payload ===
        if (filePath.startsWith('/download0/')) {
          const relativePath = filePath.substring('/download0/'.length)
          log('Including JS payload: ' + relativePath)
          setStatus('Running JS: ' + fileName)
          sfx_playSelect()
          include(relativePath)
          setStatus('JS payload executed: ' + fileName)
          sfx_playSuccess()
        } else {
          // External JS - read file and eval
          log('Reading external JS payload: ' + filePath)
          const content = readFileContent(filePath)
          if (content !== null) {
            log('Executing JS payload (' + content.length + ' bytes)...')
            setStatus('Executing JS: ' + fileName + ' (' + content.length + ' bytes)')
            sfx_playSelect()
            // eslint-disable-next-line no-eval
            eval(content)
            setStatus('JS payload executed: ' + fileName)
            sfx_playSuccess()
          } else {
            setStatus('ERROR: Cannot read file: ' + fileName, true)
            sfx_playFail()
          }
        }
      } else if (lower.endsWith('.elf') || lower.endsWith('.bin')) {
        // === ELF/BIN payload - requires jailbreak ===
        if (!jailbroken) {
          setStatus('ERROR: Must be jailbroken to inject ELF/BIN!', true)
          sfx_playFail()
          logger_error('Attempted ELF/BIN inject without jailbreak')
          return
        }

        log('Injecting ELF/BIN payload: ' + filePath)
        setStatus('Loading binloader for: ' + fileName)
        sfx_playSelect()

        const { bl_load_from_file } = binloader_init()
        log('Binloader ready, injecting: ' + filePath)
        setStatus('Injecting ELF/BIN: ' + fileName)
        bl_load_from_file(filePath)

        setStatus('Payload injected: ' + fileName)
        sfx_playSuccess()
        logger_info('ELF/BIN payload injected: ' + filePath)
      }
    } catch (e) {
      const err = e as Error
      log('ERROR injecting payload: ' + err.message)
      if (err.stack) log(err.stack)
      setStatus('INJECT FAILED: ' + err.message, true)
      sfx_playFail()
      logger_error('Payload inject failed: ' + filePath + ' - ' + err.message)
    }
  }

  function readFileContent (filePath: string): string | null {
    try {
      const pathBuf = makePathBuf(filePath)

      const fd = fn.fb_open(pathBuf, new BigInt(0, 0), new BigInt(0, 0))
      if (fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        log('Cannot open file: ' + filePath)
        return null
      }

      const bufSize = 2 * 1024 * 1024 // 2 MB max
      const readBuf = mem.malloc(bufSize)
      const bytesRead = fn.fb_read(fd, readBuf, new BigInt(0, bufSize))
      fn.fb_close(fd)

      if (bytesRead.eq(new BigInt(0xffffffff, 0xffffffff))) {
        log('Read failed for: ' + filePath)
        return null
      }

      const len = (bytesRead instanceof BigInt) ? bytesRead.lo : bytesRead
      let content = ''
      for (let i = 0; i < len; i++) {
        content += String.fromCharCode(mem.view(readBuf).getUint8(i))
      }

      log('Read ' + len + ' bytes from: ' + filePath)
      return content
    } catch (e) {
      log('Error reading file: ' + (e as Error).message)
      return null
    }
  }

  function openSelected (): void {
    if (showBookmarks) {
      // Bookmark mode
      if (selectedIndex < BOOKMARKS.length) {
        const bm = BOOKMARKS[selectedIndex]
        if (bm) {
          navigateTo(bm.path)
        }
      }
      return
    }

    if (entries.length === 0) return
    const entry = entries[selectedIndex]
    if (!entry) return

    if (entry.name === '..') {
      navigateUp()
    } else if (entry.isDir) {
      const newPath = getFullPath(entry.name)
      navigateTo(newPath)
    } else if (entry.isPayload) {
      // Inject the payload!
      const fullPath = getFullPath(entry.name)
      injectPayload(fullPath, entry.name)
    }
  }

  // === COPY/PASTE HANDLER ===
  function handleCopy (): void {
    if (showBookmarks || entries.length === 0) return
    const entry = entries[selectedIndex]
    if (!entry || entry.name === '..') return

    if (clipboardPath && !clipboardMode) {
      // Paste mode: clipboard has content and we're in a directory
      return
    }

    clipboardPath = getFullPath(entry.name)
    clipboardName = entry.name
    clipboardMode = 'copy'
    setStatus('Copied to clipboard: ' + entry.name)
    sfx_playSelect()
    updateClipboardDisplay()
  }

  function handlePaste (): void {
    if (!clipboardPath || !clipboardName) {
      // Nothing in clipboard - just do USB jump
      jumpToUSB()
      return
    }

    // Paste the clipboard content to current directory
    const destPath = getFullPath(clipboardName)

    if (destPath === clipboardPath) {
      setStatus('Cannot paste: same location!', true)
      sfx_playFail()
      return
    }

    setStatus('Copying: ' + clipboardName + '...')

    if (clipboardMode === 'copy') {
      const success = copyFile(clipboardPath, destPath)
      if (success) {
        setStatus('Pasted: ' + clipboardName)
        sfx_playSuccess()
        utils.notify('File copied:\n' + clipboardName)
      } else {
        setStatus('PASTE FAILED: ' + clipboardName, true)
        sfx_playFail()
      }
    } else if (clipboardMode === 'cut') {
      const success = renameFile(clipboardPath, destPath)
      if (success) {
        setStatus('Moved: ' + clipboardName)
        sfx_playSuccess()
        clipboardPath = ''
        clipboardName = ''
        clipboardMode = ''
      } else {
        // Try copy + delete as fallback
        if (copyFile(clipboardPath, destPath)) {
          deleteFile(clipboardPath, clipboardName, false)
          setStatus('Moved: ' + clipboardName)
          sfx_playSuccess()
          clipboardPath = ''
          clipboardName = ''
          clipboardMode = ''
        } else {
          setStatus('MOVE FAILED: ' + clipboardName, true)
          sfx_playFail()
        }
      }
    }

    navigateTo(currentPath) // Refresh
  }

  function handleDelete (): void {
    if (showBookmarks || entries.length === 0) return
    const entry = entries[selectedIndex]
    if (!entry || entry.name === '..') return

    if (!jailbroken) {
      setStatus('DELETE requires jailbreak!', true)
      sfx_playFail()
      return
    }

    if (!deleteConfirmPending || deleteConfirmName !== entry.name) {
      // First press - ask for confirmation
      deleteConfirmPending = true
      deleteConfirmName = entry.name
      setStatus('Press L2 again to DELETE: ' + entry.name)
      statusText.style = 'fb_warn'
      sfx_playNav()
      return
    }

    // Second press - confirmed, delete it
    deleteConfirmPending = false
    deleteConfirmName = ''

    const fullPath = getFullPath(entry.name)
    const success = deleteFile(fullPath, entry.name, entry.isDir)
    if (success) {
      utils.notify('Deleted:\n' + entry.name)
      navigateTo(currentPath) // Refresh
    }
  }

  function jumpToUSB (): void {
    const usbPaths = ['/mnt/usb0', '/mnt/usb1', '/mnt/usb2', '/mnt/usb3']
    let foundUsb = false
    for (let i = 0; i < usbPaths.length; i++) {
      const testBuf = makePathBuf(usbPaths[i]!)
      const testFd = fn.fb_open(testBuf, new BigInt(0, 0), new BigInt(0, 0))
      if (!testFd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        fn.fb_close(testFd)
        navigateTo(usbPaths[i]!)
        setStatus('Jumped to USB: ' + usbPaths[i]!)
        foundUsb = true
        break
      }
    }
    if (!foundUsb) {
      setStatus('No USB device found', true)
    }
  }

  // Initial load
  navigateTo(currentPath)

  jsmaf.onKeyDown = function (keyCode) {
    // Cancel delete confirmation on any non-L2 key
    if (keyCode !== 8 && deleteConfirmPending) {
      deleteConfirmPending = false
      deleteConfirmName = ''
      setStatus('')
    }

    if (showBookmarks) {
      // Bookmark navigation
      if (keyCode === 4) { // Up
        if (selectedIndex > 0) {
          selectedIndex--
          sfx_playNav()
          refreshDisplay()
        }
      } else if (keyCode === 6) { // Down
        if (selectedIndex < BOOKMARKS.length - 1) {
          selectedIndex++
          sfx_playNav()
          refreshDisplay()
        }
      } else if (keyCode === 14) { // X - Select bookmark
        openSelected()
      } else if (keyCode === 10 || keyCode === 13) { // L1 or Circle - back to file list
        showBookmarks = false
        refreshDisplay()
      }
      return
    }

    if (keyCode === 4) { // Up
      if (selectedIndex > 0) {
        selectedIndex--
        if (selectedIndex < scrollOffset) {
          scrollOffset = selectedIndex
        }
        sfx_playNav()
        refreshDisplay()
      }
    } else if (keyCode === 6) { // Down
      if (selectedIndex < entries.length - 1) {
        selectedIndex++
        if (selectedIndex >= scrollOffset + VISIBLE_ITEMS) {
          scrollOffset = selectedIndex - VISIBLE_ITEMS + 1
        }
        sfx_playNav()
        refreshDisplay()
      }
    } else if (keyCode === 10) { // L1 - Toggle bookmarks
      showBookmarks = !showBookmarks
      selectedIndex = 0
      scrollOffset = 0
      refreshDisplay()
    } else if (keyCode === 11) { // R1 - Page down
      selectedIndex = Math.min(entries.length - 1, selectedIndex + VISIBLE_ITEMS)
      scrollOffset = Math.min(Math.max(0, entries.length - VISIBLE_ITEMS), scrollOffset + VISIBLE_ITEMS)
      refreshDisplay()
    } else if (keyCode === 14) { // X - Open directory or inject payload
      sfx_playSelect()
      openSelected()
    } else if (keyCode === 12) { // Triangle - Force inject (even non-payload files)
      if (entries[selectedIndex] && !entries[selectedIndex]!.isDir) {
        const entry = entries[selectedIndex]!
        const fullPath = getFullPath(entry.name)
        const lower = entry.name.toLowerCase()

        if (lower.endsWith('.elf') || lower.endsWith('.bin') || lower.endsWith('.js')) {
          injectPayload(fullPath, entry.name)
        } else {
          setStatus('Cannot inject: ' + entry.fileType + ' files not supported', true)
        }
      }
    } else if (keyCode === 9) { // R2 - Copy file to clipboard
      handleCopy()
    } else if (keyCode === 8) { // L2 - Delete file (with confirmation)
      handleDelete()
    } else if (keyCode === 13) { // Circle - Go back
      if (currentPath === '/' || currentPath === '/download0') {
        include('main-menu.js')
      } else {
        navigateUp()
      }
    } else if (keyCode === 15) { // Square - Paste (if clipboard) or Quick USB jump
      if (clipboardPath) {
        handlePaste()
      } else {
        jumpToUSB()
      }
    } else if (keyCode === 5) { // Right - Clear clipboard
      if (clipboardPath) {
        clipboardPath = ''
        clipboardName = ''
        clipboardMode = ''
        updateClipboardDisplay()
        setStatus('Clipboard cleared')
      }
    }
  }

  log(lang.fileBrowserLoaded || 'File browser loaded')
  logger_info('File browser loaded - payload injection + file ops enabled')
})()

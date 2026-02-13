// Updater - fetches latest scripts from GitHub Pages and writes locally
// No jailbreak required - uses sandbox access to download0

import { utils } from 'download0/types'

(function () {
  var BASE_URL = 'https://vuemony.github.io/vue-after-free/download0/'
  var MANIFEST_URL = BASE_URL + 'manifest.txt'
  var BINARY_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.wav', '.mp3', '.mp4', '.elf', '.bin', '.webm']

  var FILES: string[] = []
  var updated = 0
  var failed = 0
  var skipped = 0
  var total = 0

  function isBinary (filename: string) {
    var lower = filename.toLowerCase()
    for (var i = 0; i < BINARY_EXT.length; i++) {
      if (lower.indexOf(BINARY_EXT[i]!, lower.length - BINARY_EXT[i]!.length) !== -1) return true
    }
    return false
  }

  function writeFile (filename: string, content: string, callback: (err: Error | null) => void) {
    var xhr = new jsmaf.XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('write failed'))
      }
    }
    xhr.open('POST', 'file://../download0/' + filename, true)
    xhr.send(content)
  }

  function checkDone () {
    if (updated + failed + skipped >= total) {
      log('=== Update Complete ===')
      log('Updated: ' + updated + ' files')
      if (failed > 0) {
        log('Failed: ' + failed)
      } else {
        log('Refresh to load new version.')
        var checkmark = '\xE2\x9C\x85'
        utils.notify(checkmark + ' Updated Vue-After-Free!\n' + updated + ' files updated')
      }
    }
  }

  function fetchAndWrite (filename: string) {
    if (isBinary(filename)) {
      skipped++
      checkDone()
      return
    }

    var xhr = new jsmaf.XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          var content = xhr.responseText
          if (content && content.length > 0) {
            writeFile(filename, content, function (err) {
              if (err) {
                log('FAILED to write: ' + filename)
                failed++
              } else {
                log('Updated: ' + filename + ' (' + content.length + ' bytes)')
                updated++
              }
              checkDone()
            })
          } else {
            log('Empty response for: ' + filename)
            failed++
            checkDone()
          }
        } else {
          log('FAILED to fetch: ' + filename + ' (status=' + xhr.status + ')')
          failed++
          checkDone()
        }
      }
    }
    xhr.open('GET', BASE_URL + filename, true)
    xhr.send()
  }

  function fetchManifest () {
    log('Fetching manifest...')
    var xhr = new jsmaf.XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if ((xhr.status === 200 || xhr.status === 0) && xhr.responseText) {
          var lines = xhr.responseText.split('\n')
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i]!.trim()
            if (line && line.length > 0) {
              FILES.push(line)
            }
          }
          total = FILES.length
          log('Found ' + total + ' files in manifest')
          for (var j = 0; j < FILES.length; j++) {
            fetchAndWrite(FILES[j]!)
          }
        } else {
          log('ERROR: Failed to fetch manifest')
        }
      }
    }
    xhr.open('GET', MANIFEST_URL, true)
    xhr.send()
  }

  log('=== VAF Updater ===')
  fetchManifest()
})()

import { libc_addr } from 'download0/userland'
import { stats } from 'download0/stats-tracker'
import { fn, mem, BigInt, utils } from 'download0/types'
import { sysctlbyname } from 'download0/kernel'
import { lapse } from 'download0/lapse'
import { binloader_init } from 'download0/binloader'
import { applyFanFix } from 'download0/fan-control'
import { checkJailbroken } from 'download0/check-jailbroken'
import { lang } from 'download0/languages'
import { sfx_playSuccess, sfx_playFail } from 'download0/sfx'
import { logger_info, logger_warn, logger_error } from 'download0/logger'

// Load dependencies
if (typeof libc_addr === 'undefined') {
  include('userland.js')
}
include('stats-tracker.js')
include('binloader.js')
include('lapse.js')
include('kernel.js')
include('check-jailbroken.js')
include('languages.js')
include('logger.js')
include('sfx.js')
include('fan-control.js')
log('All scripts loaded')

// Increment total attempts
stats.load()

export function show_success () {
  setTimeout(() => {
    jsmaf.root.children.push(bg_success)
    log('Logging Success...')
    stats.incrementSuccess()
    sfx_playSuccess()
    logger_info('Exploit completed successfully')
  }, 2000)
}

export function show_fail () {
  setTimeout(() => {
    jsmaf.root.children.push(bg_fail)
    log('Exploit failed')
    sfx_playFail()
    logger_error('Exploit failed')
  }, 1000)
}

const audio = new jsmaf.AudioClip()
audio.volume = 0.5
audio.open('file://../download0/sfx/bgm.wav')

const is_jailbroken = checkJailbroken()

// === Memory Check ===
function checkMemory (): boolean {
  try {
    if (typeof debugging !== 'undefined' && debugging) {
      const available = debugging.info.memory.available
      const MIN_MEMORY = 50 * 1024 * 1024 // 50 MB minimum
      if (available < MIN_MEMORY) {
        logger_warn(lang.memoryLow + ' Available: ' + (available / 1024 / 1024).toFixed(1) + ' MB')
        utils.notify(lang.memoryLow)
        return false
      }
      logger_info('Memory check passed: ' + (available / 1024 / 1024).toFixed(1) + ' MB available')
    }
  } catch (e) {
    // Memory check failed, continue anyway
    logger_warn('Memory check unavailable')
  }
  return true
}

// Check if exploit has completed successfully
function is_exploit_complete () {
  fn.register(24, 'getuid', [], 'bigint')
  fn.register(585, 'is_in_sandbox', [], 'bigint')
  try {
    const uid = fn.getuid()
    const sandbox = fn.is_in_sandbox()
    if (!uid.eq(0) || !sandbox.eq(0)) {
      return false
    }
  } catch (e) {
    return false
  }
  return true
}

function write64 (addr: BigInt, val: BigInt | number) {
  mem.view(addr).setBigInt(0, new BigInt(val), true)
}

function read8 (addr: BigInt) {
  return mem.view(addr).getUint8(0)
}

function malloc (size: number) {
  return mem.malloc(size)
}

function get_fwversion () {
  const buf = malloc(0x8)
  const size = malloc(0x8)
  write64(size, 0x8)
  if (sysctlbyname('kern.sdk_version', buf, size, 0, 0)) {
    const byte1 = Number(read8(buf.add(2)))
    const byte2 = Number(read8(buf.add(3)))
    const version = byte2.toString(16) + '.' + byte1.toString(16).padStart(2, '0')
    return version
  }
  return null
}

const FW_VERSION: string | null = get_fwversion()

if (FW_VERSION === null) {
  log('ERROR: Failed to determine FW version')
  throw new Error('Failed to determine FW version')
}

const compare_version = (a: string, b: string) => {
  const a_arr = a.split('.')
  const amaj = Number(a_arr[0])
  const amin = Number(a_arr[1])
  const b_arr = b.split('.')
  const bmaj = Number(b_arr[0])
  const bmin = Number(b_arr[1])
  return amaj === bmaj ? amin - bmin : amaj - bmaj
}

// === Retry logic ===
function getRetryCount (): number {
  if (typeof CONFIG !== 'undefined' && typeof CONFIG.retry_count === 'number') {
    return Math.max(1, Math.min(3, CONFIG.retry_count))
  }
  return 1
}

// === Non-blocking wait using setTimeout chain ===
function waitForExploit (
  maxWaitMs: number,
  onSuccess: () => void,
  onTimeout: () => void
): void {
  const startTime = Date.now()
  const pollInterval = 250 // Poll every 250ms

  function poll () {
    if (is_exploit_complete()) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      logger_info('Exploit completed after ' + elapsed + 's')
      onSuccess()
      return
    }

    const elapsed = Date.now() - startTime
    if (elapsed > maxWaitMs) {
      logger_error('Exploit timeout after ' + (maxWaitMs / 1000) + 's')
      onTimeout()
      return
    }

    // Use setTimeout for non-blocking poll (no busy wait!)
    setTimeout(poll, pollInterval)
  }

  poll()
}

if (!is_jailbroken) {
  const jb_behavior = (typeof CONFIG !== 'undefined' && typeof CONFIG.jb_behavior === 'number') ? CONFIG.jb_behavior : 0
  const maxRetries = getRetryCount()
  let currentAttempt = 0

  // Memory check before starting
  checkMemory()

  function attemptExploit () {
    currentAttempt++
  stats.incrementTotal()

    if (maxRetries > 1) {
      logger_info(lang.attempt + ' ' + currentAttempt + ' ' + lang.of + ' ' + maxRetries)
      utils.notify(FW_VERSION + ' - ' + lang.attempt + ' ' + currentAttempt + '/' + maxRetries)
    } else {
  utils.notify(FW_VERSION + ' Detected!')
    }

  let use_lapse = false

  if (jb_behavior === 1) {
    log('JB Behavior: NetControl (forced)')
      logger_info('Using NetControl kernel exploit')
    include('netctrl_c0w_twins.js')
  } else if (jb_behavior === 2) {
    log('JB Behavior: Lapse (forced)')
      logger_info('Using Lapse kernel exploit')
    use_lapse = true
    lapse()
  } else {
    log('JB Behavior: Auto Detect')
      logger_info('Auto-detecting kernel exploit for FW ' + FW_VERSION)
    if (compare_version(FW_VERSION, '7.00') >= 0 && compare_version(FW_VERSION, '12.02') <= 0) {
      use_lapse = true
        logger_info('Selected: Lapse (FW ' + FW_VERSION + ')')
      lapse()
    } else if (compare_version(FW_VERSION, '12.50') >= 0 && compare_version(FW_VERSION, '13.00') <= 0) {
        logger_info('Selected: NetControl (FW ' + FW_VERSION + ')')
      include('netctrl_c0w_twins.js')
    }
  }

  // Only wait for lapse - netctrl handles its own completion
  if (use_lapse) {
      const max_wait_ms = 5000

      waitForExploit(max_wait_ms,
        function onExploitSuccess () {
          // Success!
          show_success()
          const total_wait = ((Date.now()) / 1000).toFixed(1)
          log('Exploit completed successfully')

          // Fan fix based on mode
          const fanMode = (typeof CONFIG !== 'undefined' && typeof CONFIG.fan_fix_mode === 'number') ? CONFIG.fan_fix_mode : 0

          if (fanMode === 1) {
            // Mode 1: Built-in ICC fan control
            log('Fan Fix Mode: Built-in ICC — applying fan threshold...')
            try {
              applyFanFix()
              log('Fan fix applied!')
            } catch (e) {
              log('Fan fix error (non-critical): ' + (e as Error).message)
            }
          } else if (fanMode === 2) {
            // Mode 2: Launch PS4 Temperature App (LAPY20006) & close Vue
            log('Fan Fix Mode: Launch PS4 Temperature App (LAPY20006)')
            utils.notify('Fan Fix: Opening PS4 Temperature App...\nPlease open LAPY20006 from home screen')
            logger_info('Fan fix mode 2: Launching LAPY20006, closing Vue')

            // Kill this process after a short delay so notification shows
            fn.register(0x14, 'fan_getpid', [], 'bigint')
            fn.register(0x25, 'fan_kill', ['bigint', 'bigint'], 'bigint')
            try {
              const pid = fn.fan_getpid()
              const pid_num = (pid instanceof BigInt) ? pid.lo : pid
              log('Closing Vue (PID: ' + pid_num + ') — open PS4 Temperature app')
              setTimeout(function () {
                fn.fan_kill(pid, new BigInt(0, 9)) // SIGKILL
              }, 2000) // 2 second delay so notification appears
            } catch (e) {
              log('Close failed: ' + (e as Error).message + ' — open PS4 Temp app manually')
  }
            return // Don't continue to binloader
          }

          // Initialize binloader
    log('Initializing binloader...')
    try {
      binloader_init()
      log('Binloader initialized and running!')
    } catch (e) {
      log('ERROR: Failed to initialize binloader')
      log('Error message: ' + (e as Error).message)
      if ((e as Error).stack) {
        log('Stack trace: ' + (e as Error).stack)
      }
          }
        },
        function onExploitTimeout () {
          // Timeout - retry or fail
          log('ERROR: Exploit timeout')
          if (currentAttempt < maxRetries) {
            logger_warn(lang.retrying + ' (' + currentAttempt + '/' + maxRetries + ')')
            utils.notify(lang.retrying)
            // Small delay before retry
            setTimeout(function () {
              attemptExploit()
            }, 1000)
          } else {
            show_fail()
            logger_error(lang.exploitFailed + ' after ' + maxRetries + ' attempt(s)')
            // Return to main menu after showing fail screen
            setTimeout(function () {
              try {
                include('main-menu.js')
              } catch (e) {
                log('ERROR returning to main menu: ' + (e as Error).message)
              }
            }, 5000)
          }
        }
      )
    }
    // NetCtrl handles its own flow, no waiting needed
  }

  // Start first attempt
  attemptExploit()
} else {
  utils.notify(lang.alreadyJailbroken)
  logger_info(lang.alreadyJailbroken)
  include('main-menu.js')
}

export function run_binloader () {
  // Fan fix based on mode
  const fanMode = (typeof CONFIG !== 'undefined' && typeof CONFIG.fan_fix_mode === 'number') ? CONFIG.fan_fix_mode : 0

  if (fanMode === 1) {
    // Mode 1: Built-in ICC fan control
    log('Fan Fix Mode: Built-in ICC — applying fan threshold...')
    try {
      applyFanFix()
      log('Fan fix applied!')
    } catch (e) {
      log('Fan fix error (non-critical): ' + (e as Error).message)
    }
  } else if (fanMode === 2) {
    // Mode 2: Launch PS4 Temperature App (LAPY20006) & close Vue
    log('Fan Fix Mode: Launch PS4 Temperature App (LAPY20006)')
    utils.notify('Fan Fix: Opening PS4 Temperature App...\nPlease open LAPY20006 from home screen')
    logger_info('Fan fix mode 2: Launching LAPY20006, closing Vue')

    fn.register(0x14, 'fan_getpid', [], 'bigint')
    fn.register(0x25, 'fan_kill', ['bigint', 'bigint'], 'bigint')
    try {
      const pid = fn.fan_getpid()
      const pid_num = (pid instanceof BigInt) ? pid.lo : pid
      log('Closing Vue (PID: ' + pid_num + ') — open PS4 Temperature app')
      setTimeout(function () {
        fn.fan_kill(pid, new BigInt(0, 9)) // SIGKILL
      }, 2000)
    } catch (e) {
      log('Close failed: ' + (e as Error).message + ' — open PS4 Temp app manually')
    }
    return // Don't continue to binloader
  }

  log('Initializing binloader...')

  try {
    binloader_init()
    log('Binloader initialized and running!')
  } catch (e) {
    log('ERROR: Failed to initialize binloader')
    log('Error message: ' + (e as Error).message)
    log('Error name: ' + (e as Error).name)
    if ((e as Error).stack) {
      log('Stack trace: ' + (e as Error).stack)
    }
    throw e
  }
}

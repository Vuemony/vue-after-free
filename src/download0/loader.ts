import { libc_addr } from 'download0/userland'
import { fn, mem, BigInt, utils } from 'download0/types'
import { sysctlbyname } from 'download0/kernel'
import { lapse } from 'download0/lapse'
import { binloader_init } from 'download0/binloader'
import { checkJailbroken } from 'download0/check-jailbroken'

if (jsmaf.loader_has_run) {
  throw new Error('loader already ran')
}
jsmaf.loader_has_run = true

// Now load userland and lapse
// Check if libc_addr is defined
if (typeof libc_addr === 'undefined') {
  include('userland.js')
}
include('binloader.js')
include('lapse.js')
include('kernel.js')
include('check-jailbroken.js')

export function show_success (immediate?: boolean) {
  if (immediate) {
    jsmaf.root.children.push(bg_success)
    log('Showing Success Image...')
  } else {
    setTimeout(() => {
      jsmaf.root.children.push(bg_success)
      log('Showing Success Image...')
    }, 2000)
  }
}

// ── Auto-exit: kill the Vue app after jailbreak success ──────────────────
// Sends SIGKILL to self then calls jsmaf.exit() as fallback.
export function exit_app (delayMs: number = 3000) {
  log('[*] Auto-exit scheduled in ' + (delayMs / 1000) + 's...')
  utils.notify('Jailbreak done!\nClosing app in ' + (delayMs / 1000) + 's...')
  jsmaf.setTimeout(function () {
    try {
      fn.register(0x14, 'getpid_exit', [], 'bigint')
      fn.register(0x25, 'kill_exit',   ['bigint', 'bigint'], 'bigint')
      const pid = fn.getpid_exit()
      log('[*] Sending SIGKILL to PID ' + ((pid instanceof BigInt) ? pid.lo : pid))
      fn.kill_exit(pid, new BigInt(0, 9))
    } catch (e) {
      log('[!] kill failed: ' + (e as Error).message)
    }
    jsmaf.exit()
  }, delayMs)
}

// ── Auto-reboot: restart the PS4 after exploit failure ───────────────────
// FreeBSD reboot(2) → syscall 0x37 (55).  howto=0 = RB_AUTOBOOT (normal reboot).
// Requires root — only call this AFTER jailbreak credentials are patched,
// or if the kernel is already broken enough that a hard reset is appropriate.
export function reboot_ps4 (delayMs: number = 5000) {
  log('[!] Auto-reboot scheduled in ' + (delayMs / 1000) + 's...')
  utils.notify('Exploit failed.\nRebooting PS4 in ' + (delayMs / 1000) + 's...')
  jsmaf.setTimeout(function () {
    try {
      fn.register(0x37, 'reboot_sys', ['number'], 'bigint')
      fn.reboot_sys(0)   // RB_AUTOBOOT
    } catch (e) {
      log('[!] reboot syscall failed: ' + (e as Error).message)
      // Fallback: kill init (PID 1) which forces a kernel panic / reset
      try {
        fn.register(0x25, 'kill_init', ['bigint', 'bigint'], 'bigint')
        fn.kill_init(new BigInt(0, 1), new BigInt(0, 9))
      } catch (_) {}
    }
  }, delayMs)
}

const is_jailbroken = checkJailbroken()
const themeFolder = (typeof CONFIG !== 'undefined' && typeof CONFIG.theme === 'string') ? CONFIG.theme : 'default'

// Check if exploit has completed successfully
function is_exploit_complete () {
  // Check if we're actually jailbroken
  fn.register(24, 'getuid', [], 'bigint')
  fn.register(585, 'is_in_sandbox', [], 'bigint')
  try {
    const uid = fn.getuid()
    const sandbox = fn.is_in_sandbox()
    // Should be root (uid=0) and not sandboxed (0)
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
    const byte1 = Number(read8(buf.add(2)))  // Minor version (first byte)
    const byte2 = Number(read8(buf.add(3)))  // Major version (second byte)

    const version = byte2.toString(16) + '.' + byte1.toString(16).padStart(2, '0')
    return version
  }

  return null
}

const FW_VERSION: string | null = get_fwversion()

if (FW_VERSION === null) {
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

if (!is_jailbroken) {
  const jb_behavior = (typeof CONFIG !== 'undefined' && typeof CONFIG.jb_behavior === 'number') ? CONFIG.jb_behavior : 0

  utils.notify(FW_VERSION + ' Detected!')

  let use_lapse = false

  if (jb_behavior === 1) {
    log('[*] Mode: NetCtrl (forced by user)')
    include('netctrl_c0w_twins.js')

  } else if (jb_behavior === 2) {
    log('[*] Mode: Lapse (forced by user)')
    use_lapse = true
    const lapse_ok = lapse()
    // FW 9.00–12.02 supports both — fallback to netctrl if lapse fails
    if (!lapse_ok && compare_version(FW_VERSION, '9.00') >= 0 && compare_version(FW_VERSION, '12.02') <= 0) {
      log('[~] Lapse failed - trying NetCtrl fallback on FW ' + FW_VERSION + '...')
      utils.notify('[VAF] Lapse failed - switching to NetCtrl...')
      include('netctrl_c0w_twins.js')
      use_lapse = false
    }

  } else {
    log('[*] Mode: Auto (' + FW_VERSION + ')')

    if (compare_version(FW_VERSION, '7.00') >= 0 && compare_version(FW_VERSION, '8.52') <= 0) {
      // FW 7.00–8.52: Lapse only — netctrl not stable here
      log('[*] FW ' + FW_VERSION + ' -> Lapse (primary)')
      use_lapse = true
      lapse()

    } else if (compare_version(FW_VERSION, '9.00') >= 0 && compare_version(FW_VERSION, '12.02') <= 0) {
      // FW 9.00–12.02: both exploits work — try lapse first, fallback to netctrl
      log('[*] FW ' + FW_VERSION + ' -> Lapse (primary) + NetCtrl (fallback)')
      use_lapse = true
      const lapse_ok = lapse()
      if (!lapse_ok) {
        log('[~] Lapse failed on FW ' + FW_VERSION + ' - falling back to NetCtrl...')
        utils.notify('[VAF] Lapse failed - trying NetCtrl...')
        include('netctrl_c0w_twins.js')
        use_lapse = false
      }

    } else if (compare_version(FW_VERSION, '12.50') >= 0 && compare_version(FW_VERSION, '13.00') <= 0) {
      // FW 12.50–13.00: NetCtrl only
      log('[*] FW ' + FW_VERSION + ' -> NetCtrl (primary)')
      include('netctrl_c0w_twins.js')

    } else {
      log('[ERR] No exploit available for FW ' + FW_VERSION)
      utils.notify('[VAF] No exploit for FW ' + FW_VERSION + ' - check for updates')
    }
  }

  // Only wait for lapse - netctrl handles its own completion
  if (use_lapse) {
    const start_time = Date.now()
    const max_wait_seconds = 600
    const max_wait_ms = max_wait_seconds * 1000

    while (!is_exploit_complete()) {
      const elapsed = Date.now() - start_time

      if (elapsed > max_wait_ms) {
        log('ERROR: Timeout waiting for exploit to complete (' + max_wait_seconds + ' seconds)')
        throw new Error('Lapse failed! restart and try again...')
      }

      // Poll every 500ms
      const poll_start = Date.now()
      while (Date.now() - poll_start < 500) {
        // Busy wait
      }
    }
    const total_wait = ((Date.now() - start_time) / 1000).toFixed(1)
    log('Exploit completed successfully after ' + total_wait + ' seconds')
  }
  // NOTE: lapse calls run_binloader() internally at jailbreak completion.
  // Only initialize binloader here if lapse did NOT already do it.
  if (use_lapse && !jsmaf.binloader_has_run) {
    log('[*] Initializing binloader from loader...')
    try {
      jsmaf.binloader_has_run = true
      binloader_init()
      log('[OK] Binloader initialized')
    } catch (e) {
      log('[ERR] Binloader init failed: ' + (e as Error).message)
    }
  }
} else {
  utils.notify('Already Jailbroken!')
  try { include('themes/' + themeFolder + '/main.js') } catch (e) { /* escaped sandbox */ }
}

export function run_binloader () {
  // Guard against double-init (loader polling may also trigger after lapse completes)
  if (jsmaf.binloader_has_run) {
    log('[*] Binloader already running - skipping duplicate init')
    return
  }
  jsmaf.binloader_has_run = true
  try {
    binloader_init()
    log('[OK] Binloader initialized and running')
  } catch (e) {
    log('[ERR] Binloader init failed: ' + (e as Error).message)
    throw e
  }
}

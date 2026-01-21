// Load binloader first (just defines the function, doesn't execute)

// Now load userland and lapse
// Check if libc_addr is defined
if (typeof libc_addr === 'undefined') {
  include('userland.js')
}
include('stats-tracker.js')
include('binloader.js')
include('lapse.js')

// Increment total attempts
stats.load()

function show_success () {
  jsmaf.root.children.push(bg_success)
  log('Logging Success...')
  stats.incrementSuccess()
}

var audio = new jsmaf.AudioClip()
audio.volume = 0.5  // 50% volume
audio.open('file://../download0/sfx/bgm.wav')

function isJailbroken () {
  // Register syscalls
  try { fn.register(24, 'getuid', 'bigint') } catch (e) {}
  try { fn.register(23, 'setuid', 'bigint') } catch (e) {}

  // Get current UID
  var uid_before = fn.getuid()
  var uid_before_val = (uid_before instanceof BigInt) ? uid_before.lo : uid_before
  log('UID before setuid: ' + uid_before_val)

  // Try to set UID to 0 (root) - catch EPERM if not jailbroken
  log('Attempting setuid(0)...')
  var setuid_success = false
  var error_msg = null

  try {
    var setuid_result = fn.setuid(0)
    var setuid_ret = (setuid_result instanceof BigInt) ? setuid_result.lo : setuid_result
    log('setuid returned: ' + setuid_ret)
    setuid_success = (setuid_ret === 0)
  } catch (e) {
    error_msg = e.toString()
    log('setuid threw exception: ' + error_msg)
  }

  // Get UID after setuid attempt
  var uid_after = fn.getuid()
  var uid_after_val = (uid_after instanceof BigInt) ? uid_after.lo : uid_after
  log('UID after setuid: ' + uid_after_val)

  if (uid_after_val === 0) {
    log('already jailbroke')
    return true
  } else {
    log('not jailbroken')
    return false
  }
}

var is_jailbroken = isJailbroken()

// Check if exploit has completed successfully
function is_exploit_complete () {
  // Check if we're actually jailbroken
  if (typeof getuid !== 'undefined' && typeof is_in_sandbox !== 'undefined') {
    try {
      var uid = getuid()
      var sandbox = is_in_sandbox()
      // Should be root (uid=0) and not sandboxed (0)
      if (!uid.eq(0) || !sandbox.eq(0)) {
        return false
      }
    } catch (e) {
      return false
    }
  }

  return true
}

function write8 (addr, val) {
  mem.view(addr).setUint8(0, val & 0xFF, true)
}

function write16 (addr, val) {
  mem.view(addr).setUint16(0, val & 0xFFFF, true)
}

function write32 (addr, val) {
  mem.view(addr).setUint32(0, val & 0xFFFFFFFF, true)
}

function write64 (addr, val) {
  mem.view(addr).setBigInt(0, new BigInt(val), true)
}

function read8 (addr) {
  return mem.view(addr).getUint8(0, true)
}

function read16 (addr) {
  return mem.view(addr).getUint16(0, true)
}

function read32 (addr) {
  return mem.view(addr).getUint32(0, true)
}

function read64 (addr) {
  return mem.view(addr).getBigInt(0, true)
}

function malloc (size) {
  return mem.malloc(size)
}

function hex (val) {
  if (val instanceof BigInt) { return val.toString() }
  return '0x' + val.toString(16).padStart(2, '0')
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

FW_VERSION = get_fwversion()

function compare_version (a, b) {
  const a_arr = a.split('.')
  const amaj = a_arr[0]
  const amin = a_arr[1]
  const b_arr = b.split('.')
  const bmaj = b_arr[0]
  const bmin = b_arr[1]
  return amaj === bmaj ? amin - bmin : amaj - bmaj
}

if (!is_jailbroken) {
  if (compare_version(FW_VERSION, '8.00') >= 0 || compare_version(FW_VERSION, '12.02') <= 0) {
    utils.notify(FW_VERSION + ' Detected! ')

    // Increment total attempts
    stats.incrementTotal()
    lapse()

    // uncomment to test netctrl
    // include('netctrl_c0w_twins.js')
  } else if (compare_version(FW_VERSION, '12.52') >= 0 || compare_version(FW_VERSION, '13.00') <= 0) {
    utils.notify(FW_VERSION + ' Detected! \xF0\x9F\xA5\xB2')

    // Increment total attempts
    stats.incrementTotal()

    include('netctrl_c0w_twins.js')
  }

  var start_time = Date.now()
  var max_wait_seconds = 5
  var max_wait_ms = max_wait_seconds * 1000

  while (!is_exploit_complete()) {
    var elapsed = Date.now() - start_time

    if (elapsed > max_wait_ms) {
      log('ERROR: Timeout waiting for exploit to complete (' + max_wait_seconds + ' seconds)')
      throw new Error('Lapse timeout')
    }

    // Poll every 500ms
    var poll_start = Date.now()
    while (Date.now() - poll_start < 500) {
      // Busy wait
    }
  }
  show_success()
  var total_wait = ((Date.now() - start_time) / 1000).toFixed(1)
  log('Exploit completed successfully after ' + total_wait + ' seconds')
} else {
  utils.notify('Already Jailbroken!')
  include('main-menu.js')
}

log('Initializing binloader...')

try {
  binloader_init()
  log('Binloader initialized and running!')
  log('Starting AIO FIX...')
} catch (e) {
  log('ERROR: Failed to initialize binloader')
  log('Error message: ' + e.message)
  log('Error name: ' + e.name)
  if (e.stack) {
    log('Stack trace: ' + e.stack)
  }
  throw e
}

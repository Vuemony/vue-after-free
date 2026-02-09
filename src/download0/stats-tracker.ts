import { fn, mem, BigInt } from 'download0/types'

// Statistics tracker using syscalls for direct file I/O

// Register read syscall if not already registered

function isJailbroken () {
  // Register syscalls
  fn.register(24, 'getuid', [], 'bigint')
  fn.register(23, 'setuid', ['number'], 'bigint')

  // Get current UID
  const uid_before = fn.getuid()
  const uid_before_val = uid_before.lo
  log('UID before setuid: ' + uid_before_val)

  // Try to set UID to 0 (root) - catch EPERM if not jailbroken
  log('Attempting setuid(0)...')

  try {
    const setuid_result = fn.setuid(0)
    const setuid_ret = setuid_result.lo
    log('setuid returned: ' + setuid_ret)
  } catch (e) {
    const error_msg = (e as Error).toString()
    log('setuid threw exception: ' + error_msg)
  }

  // Get UID after setuid attempt
  const uid_after = fn.getuid()
  const uid_after_val = uid_after.lo
  log('UID after setuid: ' + uid_after_val)

  if (uid_after_val === 0) {
    log('already jailbroken')
    return true
  } else {
    log('not jailbroken')
    return false
  }
}

export const stats = {
  total: 0,
  success: 0,
  filepath: '/download0/stats.json',

  // Load stats from file using syscalls
  load: function () {
    try {
      fn.register(0x3, 'read', ['bigint', 'bigint', 'number'], 'bigint')
      fn.register(0x4, 'write', ['bigint', 'bigint', 'number'], 'bigint')
      fn.register(0x5, 'open', ['string', 'number', 'number'], 'bigint')
      fn.register(0x6, 'close', ['bigint'], 'bigint')
      const fd = fn.open(this.filepath, 0, 0)  // O_RDONLY
      if (fd.lt(0)) {
        log('[STATS] No stats file found, starting fresh')
        this.total = 0
        this.success = 0
        return
      }

      // Read file content
      const buf = mem.malloc(1024)
      const bytesRead = fn.read(fd, buf, 1024)
      fn.close(fd)

      if (bytesRead.neq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        // Convert buffer to string
        let str = ''
        for (let i = 0; i < Number(bytesRead); i++) {
          str += String.fromCharCode(mem.view(buf.add(i)).getUint8(0))
        }

        try {
          const parsed = JSON.parse(str)
          this.total = parsed.total || 0
          this.success = parsed.success || 0
          log('[STATS] Loaded: total=' + this.total + ', success=' + this.success)
        } catch (e) {
          log('[STATS] Failed to parse stats file: ' + e)
          this.total = 0
          this.success = 0
        }
      }
    } catch (e) {
      log('[STATS] Error loading stats: ' + e)
      log((e as Error).stack ?? '')
      this.total = 0
      this.success = 0
    }
  },

  // Save stats to file using syscalls
  save: function () {
    try {
      fn.register(0x3, 'read', ['bigint', 'bigint', 'number'], 'bigint')
      fn.register(0x4, 'write', ['bigint', 'bigint', 'number'], 'bigint')
      fn.register(0x5, 'open', ['string', 'number', 'number'], 'bigint')
      fn.register(0x6, 'close', ['bigint'], 'bigint')
      this.filepath = isJailbroken() ? '/mnt/sandbox/download/CUSA00960/stats.json' : '/download0/stats.json'

      const data = JSON.stringify({
        total: this.total,
        success: this.success
      })

      // Open file for writing (O_WRONLY | O_CREAT | O_TRUNC)
      // O_WRONLY = 1, O_CREAT = 0x200, O_TRUNC = 0x400
      const fd = fn.open(this.filepath, 0x601, 0x1FF)  // 0x1FF = 0777 permissions

      if (fd.lt(0)) {
        log('[STATS] Failed to open file for writing')
        return false
      }

      // Write data to file
      const buf = mem.malloc(data.length)
      for (let i = 0; i < data.length; i++) {
        mem.view(buf.add(i)).setUint8(0, data.charCodeAt(i))
      }

      const bytesWritten = fn.write(fd, buf, data.length)
      fn.close(fd)

      if (bytesWritten.eq(data.length)) {
        log('[STATS] Saved: total=' + this.total + ', success=' + this.success)
        return true
      } else {
        log('[STATS] Failed to write all data')
        return false
      }
    } catch (e) {
      log('[STATS] Error saving stats: ' + e)
      return false
    }
  },

  // Increment total counter
  incrementTotal: function () {
    this.total++
    log('[STATS] Total incremented to: ' + this.total)
    this.save()
  },

  // Increment success counter
  incrementSuccess: function () {
    this.success++
    log('[STATS] Success incremented to: ' + this.success)
    this.save()
  },

  // Get current stats
  get: function () {
    return {
      total: this.total,
      success: this.success,
      failures: this.total - this.success,
      failureRate: this.total > 0 ? ((this.total - this.success) / this.total * 100).toFixed(2) + '%' : '0%',
      successRate: this.total > 0 ? (this.success / this.total * 100).toFixed(2) + '%' : '0%'
    }
  },

  // Print current stats
  print: function () {
    const current = this.get()
    log('[STATS] ====== Statistics ======')
    log('[STATS] Total:        ' + current.total)
    log('[STATS] Success:      ' + current.success)
    log('[STATS] Failures:     ' + current.failures)
    log('[STATS] Success Rate: ' + current.successRate)
    log('[STATS] Failure Rate: ' + current.failureRate)
    log('[STATS] =======================')
  },

  // Reset stats
  reset: function () {
    this.total = 0
    this.success = 0
    log('[STATS] Stats reset')
    this.save()
  }
}

// Example usage:
// stats.load()
// stats.incrementTotal()
// stats.incrementSuccess()
// stats.print()

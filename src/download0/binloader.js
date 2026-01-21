// bin_loader.js - ELF/binary loader for PS4 after vue-after-free jailbreak
// Ported from netflix N Hack for ps4
//
// Usage: include('binloader.js') before userland/lapse
//        After lapse completes, call: binloader_init()

// Define binloader_init function
binloader_init = function () {
  log('binloader_init(): Initializing binloader...')

  // Check dependencies
  if (typeof fn === 'undefined') {
    log('ERROR: fn object is undefined! userland.js not loaded?')
    throw new Error('fn object not available - cannot initialize binloader')
  }

  log('binloader_init(): Dependencies OK, initializing...')

  // thrd_create and thrd_join offsets in libc
  var THRD_CREATE_OFFSET = 0x555A0
  var THRD_JOIN_OFFSET = 0x55410

  // Register thrd_create and thrd_join from libc
  var thrd_create_addr = libc_addr.add(new BigInt(0, THRD_CREATE_OFFSET))
  var thrd_join_addr = libc_addr.add(new BigInt(0, THRD_JOIN_OFFSET))

  fn.register(thrd_create_addr, 'thrd_create', 'bigint')
  fn.register(thrd_join_addr, 'thrd_join', 'bigint')

  var thrd_create = fn.thrd_create
  var thrd_join = fn.thrd_join

  log('thrd_create @ ' + thrd_create_addr.toString())
  log('thrd_join @ ' + thrd_join_addr.toString())

  // Register syscalls needed for binloader
  var stat_sys, open_sys, read_sys, write_sys, close_sys, mmap_sys, bind_sys, listen_sys, accept_sys

  if (typeof fn.stat_sys === 'undefined') {
    fn.register(0xBC, 'stat_sys', 'bigint')
  }
  stat_sys = fn.stat_sys

  if (typeof fn.open_sys === 'undefined') {
    fn.register(0x05, 'open_sys', 'bigint')
  }
  open_sys = fn.open_sys

  if (typeof fn.read_sys === 'undefined') {
    fn.register(0x03, 'read_sys', 'bigint')
  }
  read_sys = fn.read_sys

  if (typeof fn.write_sys === 'undefined') {
    fn.register(0x04, 'write_sys', 'bigint')
  }
  write_sys = fn.write_sys

  if (typeof fn.close_sys === 'undefined') {
    fn.register(0x06, 'close_sys', 'bigint')
  }
  close_sys = fn.close_sys

  if (typeof fn.mmap_sys === 'undefined') {
    fn.register(0x1DD, 'mmap_sys', 'bigint')
  }
  mmap_sys = fn.mmap_sys

  if (typeof fn.bind_sys === 'undefined') {
    fn.register(0x68, 'bind_sys', 'bigint')
  }
  bind_sys = fn.bind_sys

  if (typeof fn.listen_sys === 'undefined') {
    fn.register(0x6A, 'listen_sys', 'bigint')
  }
  listen_sys = fn.listen_sys

  if (typeof fn.accept_sys === 'undefined') {
    fn.register(0x1E, 'accept_sys', 'bigint')
  }
  accept_sys = fn.accept_sys

  // Constants
  const BIN_LOADER_PORT = 9020
  const MAX_PAYLOAD_SIZE = 4 * 1024 * 1024  // 4MB max
  const READ_CHUNK = 32768  // 32KB chunks for faster transfer
  const PAGE_SIZE = 16384  // PS4 page size

  // ELF magic bytes
  const ELF_MAGIC = 0x464C457F  // "\x7fELF" as little-endian uint32

  // mmap constants
  const BL_MAP_PRIVATE = 0x2
  const BL_MAP_ANONYMOUS = 0x1000
  const BL_PROT_READ = 0x1
  const BL_PROT_WRITE = 0x2
  const BL_PROT_EXEC = 0x4

  // Socket constants
  const BL_AF_INET = 2
  const BL_SOCK_STREAM = 1
  const BL_SOL_SOCKET = 0xffff
  const BL_SO_REUSEADDR = 4

  // File open flags
  var BL_O_RDONLY = 0
  var BL_O_WRONLY = 1
  var BL_O_RDWR = 2
  var BL_O_CREAT = 0x200
  var BL_O_TRUNC = 0x400

  // USB and data paths (check usb0-usb4 like BD-JB does)
  const USB_PAYLOAD_PATHS = [
    '/mnt/usb0/payload.bin',
    '/mnt/usb1/payload.bin',
    '/mnt/usb2/payload.bin',
    '/mnt/usb3/payload.bin',
    '/mnt/usb4/payload.bin'
  ]
  const DATA_PAYLOAD_PATH = '/data/payload.bin'

  // S_ISREG macro check - file type is regular file
  const S_IFREG = 0x8000

  // ELF header structure offsets
  const ELF_HEADER = {
    E_ENTRY: 0x18,
    E_PHOFF: 0x20,
    E_PHENTSIZE: 0x36,
    E_PHNUM: 0x38,
  }

  // Program header structure offsets
  const PROGRAM_HEADER = {
    P_TYPE: 0x00,
    P_FLAGS: 0x04,
    P_OFFSET: 0x08,
    P_VADDR: 0x10,
    P_FILESZ: 0x20,
    P_MEMSZ: 0x28,
  }

  const PT_LOAD = 1

  // Helper: Round up to page boundary
  function bl_round_up (x, base) {
    return Math.floor((x + base - 1) / base) * base
  }

  // Helper: Check for syscall error
  function bl_is_error (val) {
    if (val instanceof BigInt) {
      return val.hi === 0xffffffff
    }
    return val === -1 || val === 0xffffffff
  }

  // Helper: Allocate string in memory and return address
  function bl_alloc_string (str) {
    var addr = mem.malloc(str.length + 1)
    for (var i = 0; i < str.length; i++) {
      mem.view(addr).setUint8(i, str.charCodeAt(i))
    }
    mem.view(addr).setUint8(str.length, 0)  // null terminator
    return addr
  }

  // Helper: Check if file exists using stat() and return size, or -1 if not found
  function bl_file_exists (path) {
    log('Checking: ' + path)
    var path_addr = bl_alloc_string(path)
    var stat_buf = mem.malloc(0x78)

    // Call stat(path, &stat_buf) - catch errors (file not found)
    try {
      var ret = stat_sys(path_addr, stat_buf)

      if (bl_is_error(ret)) {
        log('  stat() failed - file not found')
        return -1
      }

      // Check st_mode at offset 0x08 to see if it's a regular file
      var st_mode = mem.view(stat_buf).getUint16(0x08, true)

      // Check S_ISREG (mode & 0xF000) == S_IFREG (0x8000)
      if ((st_mode & 0xF000) !== S_IFREG) {
        log('  Not a regular file (st_mode=0x' + st_mode.toString(16) + ')')
        return -1
      }

      // st_size is at offset 0x48 in struct stat (int64_t)
      var size = mem.view(stat_buf).getBigInt(0x48, true)
      var size_num = size.lo + (size.hi * 0x100000000)
      log('  Found: ' + size_num + ' bytes')

      return size_num
    } catch (e) {
      log('  ' + e.message)
      return -1
    }
  }

  // Get file size using stat()
  function bl_get_file_size_stat (path) {
    var path_addr = bl_alloc_string(path)
    var stat_buf = mem.malloc(0x78)

    try {
      var ret = stat_sys(path_addr, stat_buf)
      if (bl_is_error(ret)) {
        return -1
      }

      // st_size is at offset 0x48
      var size = mem.view(stat_buf).getBigInt(0x48, true)
      return size.lo + (size.hi * 0x100000000)
    } catch (e) {
      return -1
    }
  }

  // Read entire file into memory buffer
  function bl_read_file (path) {
    // Use stat() to get file size
    var size = bl_get_file_size_stat(path)
    if (size <= 0) {
      log('  stat failed or size=0')
      return null
    }

    var path_addr = bl_alloc_string(path)
    var fd = open_sys(path_addr, new BigInt(0, BL_O_RDONLY), new BigInt(0, 0))

    if (bl_is_error(fd)) {
      log('  open failed')
      return null
    }

    var fd_num = (fd instanceof BigInt) ? fd.lo : fd
    var buf = mem.malloc(size)
    var total_read = 0

    while (total_read < size) {
      var chunk = size - total_read > READ_CHUNK ? READ_CHUNK : size - total_read
      var bytes_read = read_sys(
        new BigInt(0, fd_num),
        buf.add(new BigInt(0, total_read)),
        new BigInt(0, chunk)
      )

      if (bl_is_error(bytes_read) || bytes_read.eq(0)) {
        break
      }
      total_read += bytes_read.lo
    }

    close_sys(fd_num)

    if (total_read !== size) {
      log('  read incomplete: ' + total_read + '/' + size)
      return null
    }

    return { buf, size }
  }

  // Write buffer to file
  function bl_write_file (path, buf, size) {
    var path_addr = bl_alloc_string(path)
    var flags = BL_O_WRONLY | BL_O_CREAT | BL_O_TRUNC
    log('  write_file: open(' + path + ', flags=0x' + flags.toString(16) + ')')

    var fd = open_sys(path_addr, new BigInt(0, flags), new BigInt(0, 0o755))
    var fd_num = (fd instanceof BigInt) ? fd.lo : fd
    log('  write_file: fd=' + fd_num)

    if (bl_is_error(fd)) {
      log('  write_file: open failed')
      return false
    }

    var total_written = 0
    while (total_written < size) {
      var chunk = size - total_written > READ_CHUNK ? READ_CHUNK : size - total_written
      var bytes_written = write_sys(
        new BigInt(0, fd_num),
        buf.add(new BigInt(0, total_written)),
        new BigInt(0, chunk)
      )

      if (bl_is_error(bytes_written) || bytes_written.eq(0)) {
        log('  write_file: write failed at ' + total_written + '/' + size)
        close_sys(fd_num)
        return false
      }
      total_written += bytes_written.lo
    }

    close_sys(fd_num)
    log('  write_file: wrote ' + total_written + ' bytes')
    return true
  }

  // Copy file from src to dst
  function bl_copy_file (src_path, dst_path) {
    log('Copying ' + src_path + ' -> ' + dst_path)

    var data = bl_read_file(src_path)
    if (data === null) {
      log('Failed to read source file')
      return false
    }

    log('Read ' + data.size + ' bytes')

    if (!bl_write_file(dst_path, data.buf, data.size)) {
      log('Failed to write destination file')
      return false
    }

    log('Copy complete')
    return true
  }

  // Read ELF header from buffer
  function bl_read_elf_header (buf_addr) {
    return {
      magic: mem.view(buf_addr).getUint32(0, true),
      e_entry: mem.view(buf_addr).getBigInt(ELF_HEADER.E_ENTRY, true),
      e_phoff: mem.view(buf_addr).getBigInt(ELF_HEADER.E_PHOFF, true),
      e_phentsize: mem.view(buf_addr).getUint16(ELF_HEADER.E_PHENTSIZE, true),
      e_phnum: mem.view(buf_addr).getUint16(ELF_HEADER.E_PHNUM, true),
    }
  }

  // Read program header from buffer
  function bl_read_program_header (buf_addr, offset) {
    var base = buf_addr.add(new BigInt(0, offset))
    return {
      p_type: mem.view(base).getUint32(PROGRAM_HEADER.P_TYPE, true),
      p_flags: mem.view(base).getUint32(PROGRAM_HEADER.P_FLAGS, true),
      p_offset: mem.view(base).getBigInt(PROGRAM_HEADER.P_OFFSET, true),
      p_vaddr: mem.view(base).getBigInt(PROGRAM_HEADER.P_VADDR, true),
      p_filesz: mem.view(base).getBigInt(PROGRAM_HEADER.P_FILESZ, true),
      p_memsz: mem.view(base).getBigInt(PROGRAM_HEADER.P_MEMSZ, true),
    }
  }

  // Load ELF segments into mmap'd memory
  function bl_load_elf_segments (buf_addr, base_addr) {
    var elf = bl_read_elf_header(buf_addr)

    log('ELF: ' + elf.e_phnum + ' segments, entry @ ' + elf.e_entry.toString())

    for (var i = 0; i < elf.e_phnum; i++) {
      var phdr_offset = (elf.e_phoff.lo + (elf.e_phoff.hi * 0x100000000)) + i * elf.e_phentsize
      var segment = bl_read_program_header(buf_addr, phdr_offset)

      if (segment.p_type === PT_LOAD && !segment.p_memsz.eq(0)) {
        // Use lower 24 bits of vaddr to get offset within region
        var seg_offset_num = segment.p_vaddr.lo & 0xffffff
        var seg_addr = base_addr.add(new BigInt(0, seg_offset_num))

        // Copy segment data
        var filesz = segment.p_filesz.lo + (segment.p_filesz.hi * 0x100000000)
        var src_addr = buf_addr.add(segment.p_offset)

        // Copy using mem API
        for (var j = 0; j < filesz; j++) {
          var byte = mem.view(src_addr).getUint8(j)
          mem.view(seg_addr).setUint8(j, byte)
        }

        // Zero remaining memory (memsz - filesz)
        var memsz = segment.p_memsz.lo + (segment.p_memsz.hi * 0x100000000)
        if (memsz > filesz) {
          for (var j = filesz; j < memsz; j++) {
            mem.view(seg_addr).setUint8(j, 0)
          }
        }
      }
    }

    // Return entry point address
    var entry_offset = elf.e_entry.lo & 0xffffff
    return base_addr.add(new BigInt(0, entry_offset))
  }

  // BinLoader object
  var BinLoader = {
    data: null,
    data_size: 0,
    mmap_base: null,
    mmap_size: 0,
    entry_point: null,
    skip_autoclose: false,
  }

  BinLoader.init = function (bin_data_addr, bin_size) {
    BinLoader.data = bin_data_addr
    BinLoader.data_size = bin_size

    // Calculate mmap size (round up to page boundary)
    BinLoader.mmap_size = bl_round_up(bin_size, PAGE_SIZE)

    // Allocate RWX memory using mmap
    var prot = new BigInt(0, BL_PROT_READ | BL_PROT_WRITE | BL_PROT_EXEC)
    var flags = new BigInt(0, BL_MAP_PRIVATE | BL_MAP_ANONYMOUS)

    var ret = mmap_sys(
      new BigInt(0, 0),
      new BigInt(0, BinLoader.mmap_size),
      prot,
      flags,
      new BigInt(0xffffffff, 0xffffffff),  // fd = -1
      new BigInt(0, 0)
    )

    if (bl_is_error(ret)) {
      throw new Error('mmap failed: ' + ret.toString())
    }

    BinLoader.mmap_base = ret
    log('mmap() allocated at: ' + BinLoader.mmap_base.toString())

    // Check for ELF magic
    var magic = mem.view(bin_data_addr).getUint32(0, true)

    if (magic === ELF_MAGIC) {
      log('Detected ELF binary, parsing headers...')
      BinLoader.entry_point = bl_load_elf_segments(bin_data_addr, BinLoader.mmap_base)
    } else {
      log('Non-ELF binary, treating as raw shellcode (' + bin_size + ' bytes)')
      // Copy raw binary
      for (var i = 0; i < bin_size; i++) {
        var byte = mem.view(bin_data_addr).getUint8(i)
        mem.view(BinLoader.mmap_base).setUint8(i, byte)
      }
      BinLoader.entry_point = BinLoader.mmap_base
    }

    log('Entry point: ' + BinLoader.entry_point.toString())
  }

  BinLoader.run = function () {
    log('Spawning payload thread using thrd_create...')

    // Allocate thread handle and result storage
    var thread_handle = mem.malloc(8)  // thrd_t handle
    var thread_result = mem.malloc(4)  // int result

    // Initialize to 0
    mem.view(thread_handle).setBigInt(0, new BigInt(0, 0), true)
    mem.view(thread_result).setUint32(0, 0, true)

    log('Entry point @ ' + BinLoader.entry_point.toString())

    // Call thrd_create(thread_handle, entry_point, NULL)
    // int thrd_create(thrd_t *thr, thrd_start_t func, void *arg);
    log('Calling thrd_create...')
    var ret = thrd_create(
      thread_handle,           // thrd_t *thr
      BinLoader.entry_point,   // thrd_start_t func
      new BigInt(0, 0)         // void *arg (NULL)
    )

    // thrd_success = 0
    if (ret.eq(0)) {
      log('SUCCESS: Payload thread created!')
      var thr_id = mem.view(thread_handle).getBigInt(0, true)
      log('Thread handle: ' + thr_id.toString())
      // utils.notify("Payload loaded!\nThread spawned successfully");

      // Check if autoclose is enabled
      if (typeof CONFIG !== 'undefined' && CONFIG.autoclose && !BinLoader.skip_autoclose) {
        log('CONFIG.autoclose enabled - terminating current process')

        if (!fn.getpid) fn.register(0x14, 'getpid', 'bigint')
        if (!fn.kill) fn.register(0x25, 'kill', 'bigint')

        var pid = fn.getpid()
        var pid_num = (pid instanceof BigInt) ? pid.lo : pid
        log('Current PID: ' + pid_num)
        log('Sending SIGKILL to PID ' + pid_num)

        fn.kill(pid, new BigInt(0, 9))
      } else {
        // Call thrd_join to wait for thread completion
        // int thrd_join(thrd_t thr, int *res);
        log('Waiting for thread to complete (thrd_join)...')
        var join_ret = thrd_join(
          thr_id,              // thrd_t thr
          thread_result        // int *res
        )

        if (join_ret.eq(0)) {
          var result_val = mem.view(thread_result).getUint32(0, true)
          log('Thread completed successfully with result: ' + result_val)
        } else {
          log('WARNING: thrd_join returned: ' + join_ret.toString())
        }

        log('Binloader complete - thread has finished')
      }
    } else {
      log('ERROR: thrd_create failed with return value: ' + ret.toString())
      throw new Error('Failed to spawn payload thread')
    }
  }

  // Create listening socket
  function bl_create_listen_socket (port) {
    var sd = socket(BL_AF_INET, BL_SOCK_STREAM, 0)
    var sd_num = (sd instanceof BigInt) ? sd.lo : sd

    if (bl_is_error(sd)) {
      throw new Error('socket() failed')
    }

    // Set SO_REUSEADDR
    var enable = mem.malloc(4)
    mem.view(enable).setUint32(0, 1, true)
    setsockopt(sd_num, BL_SOL_SOCKET, BL_SO_REUSEADDR, enable, 4)

    // Build sockaddr_in
    var sockaddr = mem.malloc(16)
    for (var j = 0; j < 16; j++) {
      mem.view(sockaddr).setUint8(j, 0)
    }
    mem.view(sockaddr).setUint8(1, 2)  // AF_INET
    mem.view(sockaddr).setUint8(2, (port >> 8) & 0xff)  // port high byte
    mem.view(sockaddr).setUint8(3, port & 0xff)         // port low byte
    mem.view(sockaddr).setUint32(4, 0, true)  // INADDR_ANY

    var ret = bind_sys(new BigInt(0, sd_num), sockaddr, new BigInt(0, 16))
    if (bl_is_error(ret)) {
      close_sys(sd_num)
      throw new Error('bind() failed')
    }

    ret = listen_sys(new BigInt(0, sd_num), new BigInt(0, 1))
    if (bl_is_error(ret)) {
      close_sys(sd_num)
      throw new Error('listen() failed')
    }

    return sd_num
  }

  // Read payload data from client socket
  function bl_read_payload_from_socket (client_sock, max_size) {
    var payload_buf = mem.malloc(max_size)
    var total_read = 0

    while (total_read < max_size) {
      var remaining = max_size - total_read
      var chunk_size = remaining < READ_CHUNK ? remaining : READ_CHUNK

      var read_size = read_sys(
        new BigInt(0, client_sock),
        payload_buf.add(new BigInt(0, total_read)),
        new BigInt(0, chunk_size)
      )

      if (bl_is_error(read_size)) {
        throw new Error('read() failed')
      }

      if (read_size.eq(0)) {
        break  // EOF
      }

      total_read += read_size.lo

      // Progress update every 128KB
      if (total_read % (128 * 1024) === 0) {
        log('Received ' + (total_read / 1024) + ' KB...')
      }
    }

    return { buf: payload_buf, size: total_read }
  }

  // Load and run payload from file
  bl_load_from_file = function (path, skip_autoclose) {
    log('Loading payload from: ' + path)

    var payload = bl_read_file(path)
    if (payload === null) {
      log('Failed to read payload file')
      return false
    }

    log('Read ' + payload.size + ' bytes')

    if (payload.size < 64) {
      log('ERROR: Payload too small')
      return false
    }

    if (skip_autoclose === false) {
      BinLoader.skip_autoclose = false
    } else {
      BinLoader.skip_autoclose = true
    }

    try {
      BinLoader.init(payload.buf, payload.size)
      BinLoader.run()
      log('Payload loaded successfully')
    } catch (e) {
      log('ERROR loading payload: ' + e.message)
      if (e.stack) log(e.stack)
      return false
    }

    return true
  }

  // Network binloader (fallback)
  bl_network_loader = function () {
    log('Starting network payload server...')

    var server_sock
    try {
      server_sock = bl_create_listen_socket(BIN_LOADER_PORT)
    } catch (e) {
      log('ERROR: ' + e.message)
      utils.notify('Bin loader failed!\n' + e.message)
      return false
    }

    var network_str = '<PS4 IP>:' + BIN_LOADER_PORT

    log('Listening on ' + network_str)
    log('Send your ELF payload to this address')
    utils.notify('Binloader listening on:\n' + network_str)

    // Accept client connection
    var sockaddr = mem.malloc(16)
    var sockaddr_len = mem.malloc(4)
    mem.view(sockaddr_len).setUint32(0, 16, true)

    var client_sock = accept_sys(
      new BigInt(0, server_sock),
      sockaddr,
      sockaddr_len
    )

    if (bl_is_error(client_sock)) {
      log('ERROR: accept() failed')
      close_sys(server_sock)
      return false
    }

    var client_sock_num = (client_sock instanceof BigInt) ? client_sock.lo : client_sock
    log('Client connected')

    var payload
    try {
      payload = bl_read_payload_from_socket(client_sock_num, MAX_PAYLOAD_SIZE)
    } catch (e) {
      log('ERROR reading payload: ' + e.message)
      close_sys(client_sock_num)
      close_sys(server_sock)
      return false
    }

    log('Received ' + payload.size + ' bytes total')

    close_sys(client_sock_num)
    close_sys(server_sock)

    if (payload.size < 64) {
      log('ERROR: Payload too small')
      return false
    }

    BinLoader.skip_autoclose = false

    try {
      BinLoader.init(payload.buf, payload.size)
      BinLoader.run()
      log('Payload loaded successfully')
      show_success()
    } catch (e) {
      log('ERROR loading payload: ' + e.message)
      if (e.stack) log(e.stack)
      return false
    }

    return true
  }

  // Main entry point with USB loader logic
  function bin_loader_main () {
    log('=== PS4 Payload Loader ===')

    for (var i = 0; i < payloads.length; i++) {
      var payload = payloads[i]
      log('Loading payload: ' + payload)
      if (bl_file_exists(payload)) {
        bl_load_from_file(payload, true)
      } else {
        log(payload + ' not found!')
      }
    }

    // Priority 1: Check for USB payload on usb0-usb4 (like BD-JB does)
    for (var i = 0; i < USB_PAYLOAD_PATHS.length; i++) {
      var usb_path = USB_PAYLOAD_PATHS[i]
      var usb_size = bl_file_exists(usb_path)

      if (usb_size > 0) {
        log('Found USB payload: ' + usb_path + ' (' + usb_size + ' bytes)')
        utils.notify('USB payload found!\nCopying to /data...')

        // Copy USB payload to /data for future use
        if (bl_copy_file(usb_path, DATA_PAYLOAD_PATH)) {
          log('Copied to ' + DATA_PAYLOAD_PATH)
        } else {
          log('Warning: Failed to copy to /data, running from USB')
        }

        // Load from USB
        return bl_load_from_file(usb_path, false)
      }
    }

    // Priority 2: Check for cached /data payload
    var data_size = bl_file_exists(DATA_PAYLOAD_PATH)
    if (data_size > 0) {
      log('Found cached payload: ' + DATA_PAYLOAD_PATH + ' (' + data_size + ' bytes)')
      return bl_load_from_file(DATA_PAYLOAD_PATH, false)
    }

    // Priority 3: Fall back to network loader
    log('No payload file found, starting network loader')
    utils.notify('No payload found.\nStarting network loader...')
    return bl_network_loader()
  }

  // End of binloader_init() function
  // Call bin_loader_main() to start binloader

  if (!is_jailbroken) {
    bin_loader_main()
  } else {
    bl_load_from_file('/download0/payloads/elfldr.elf')
  }
}

// Verify function is defined
if (typeof binloader_init === 'function') {
  log('binloader.js loaded - binloader_init() function ready')
} else {
  log('ERROR: binloader_init function not defined!')
}

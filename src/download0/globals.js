// NetControl Kernel Exploit - Global Constants
// Ported from NetControlImpl.java by Andy Nguyen

// Kernel constants
var KERNEL_PID = 0
var SYSCORE_AUTHID = new BigInt(0x00000007, 0x48000000) // 0x4800000000000007L

// IOctl commands
var FIOSETOWN = new BigInt(0x8004667C, 0) // 0x8004667CL

// Memory sizes
var PAGE_SIZE = 0x4000
var IOV_SIZE = 0x10
var CPU_SET_SIZE = 0x10
var PIPEBUF_SIZE = 0x18
var MSG_HDR_SIZE = 0x30
var FILEDESCENT_SIZE = 0x30
var UCRED_SIZE = 0x168

// NetControl commands
var NET_CONTROL_NETEVENT_SET_QUEUE = 0x20000003
var NET_CONTROL_NETEVENT_CLEAR_QUEUE = 0x20000007

// Socket domain constants
var AF_UNIX = 1
var AF_INET6 = 28

// Socket type constants
var SOCK_STREAM = 1

// Protocol constants
var IPPROTO_IPV6 = 41

// Socket options
var SO_SNDBUF = 0x1001
var SOL_SOCKET = 0xffff

// IPv6 routing header constants
var IPV6_RTHDR = 51
var IPV6_RTHDR_TYPE_0 = 0

// Real-time priority constants
var RTP_PRIO_REALTIME = 2
var RTP_SET = 1

// UIO constants
var UIO_READ = 0
var UIO_WRITE = 1
var UIO_SYSSPACE = 1

// CPU affinity constants
var CPU_LEVEL_WHICH = 3
var CPU_WHICH_TID = 1

// Spray parameters
var RTHDR_TAG = 0x13370000
var UIO_IOV_NUM = 0x14
var MSG_IOV_NUM = 0x17
var IPV6_SOCK_NUM = 128

// Retry parameters (adjusted for JS/pthread environment)
var TWIN_TRIES = 5000  // Reduced from 15000 (Java has better threading)
var UAF_TRIES = 5000   // Reduced from 50000 (avoid overwhelming pthread workers)
var KQUEUE_TRIES = 300000

var IOV_THREAD_NUM = 4
var UIO_THREAD_NUM = 4

// Command codes for UIO operations
var COMMAND_UIO_READ = 0
var COMMAND_UIO_WRITE = 1

// Main CPU core (for affinity setting)
var MAIN_CORE = 11

// Syscall numbers (FreeBSD/PS4)
var SYS_READ = 0x03
var SYS_WRITE = 0x04
var SYS_CLOSE = 0x06
var SYS_GETPID = 0x14
var SYS_SETUID = 0x17
var SYS_GETUID = 0x18
var SYS_RECVMSG = 0x1B
var SYS_DUP = 0x29
var SYS_PIPE = 0x2A
var SYS_IOCTL = 0x36
var SYS_SOCKET = 0x61
var SYS_SETSOCKOPT = 0x69
var SYS_GETSOCKOPT = 0x76
var SYS_READV = 0x78
var SYS_WRITEV = 0x79
var SYS_SOCKETPAIR = 0x87
var SYS_NANOSLEEP = 0xF0
var SYS_KQUEUE = 0x16E
var SYS_THR_SUSPEND_UCONTEXT = 0x1AB
var SYS_THR_RESUME_UCONTEXT = 0x1AC
var SYS_THR_NEW = 0x1C7
var SYS_THR_EXIT = 0x1CE

// Kernel symbols
var SYS_NETCONTROL_SYMBOL = '__sys_netcontrol'

// Threading constants
var JMPBUF_SIZE = 0x60
var THR_NEW_ARGS_SIZE = 0x80
var DEFAULT_STACK_SIZE = 0x400
var DEFAULT_TLS_SIZE = 0x40

// Libc symbols (will be resolved at runtime)
var SETJMP_SYMBOL = 'setjmp'
var LONGJMP_SYMBOL = 'longjmp'

// LibKernel pthread offsets (PS4 6.20)
var SCE_PTHREAD_CREATE_OFFSET = 0x13AA0
var SCE_PTHREAD_EXIT_OFFSET = 0x13B00

// JSC offsets
var DISABLE_GC_OFFSET = 0x1E75B20

// Threading config
var NUM_WORKER_THREADS = 4

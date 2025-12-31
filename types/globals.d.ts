declare namespace vue {
  declare class BigInt {
    buf: ArrayBuffer
    i8: Int8Array
    u8: Uint8Array
    i16: Int16Array
    u16: Uint16Array
    i32: Int32Array
    u32: Uint32Array
    f32: Float32Array
    f64: Float64Array

    static readonly Zero: BigInt
    static readonly One: BigInt
    static readonly TYPE_MAP: {
      Int8Array: 'i8',
      Uint8Array: 'u8',
      Int16Array: 'i16',
      Uint16Array: 'u16',
      Int32Array: 'i32',
      Uint32Array: 'u32',
      Float32Array: 'f32',
      Float64Array: 'f64',
    }

    constructor ()
    constructor (value: number | string | BigInt | ArrayLike<number>)
    constructor (hi: number, lo: number)

    toString (): string
    endian (): void
    lo (): number
    hi (): number
    d (): number
    jsv (): BigInt
    cmp (val: BigInt): -1 | 0 | 1
    eq (val: BigInt): boolean
    neq (val: BigInt): boolean
    gt (val: BigInt): boolean
    gte (val: BigInt): boolean
    lt (val: BigInt): boolean
    lte (val: BigInt): boolean
    add (val: BigInt): BigInt
    sub (val: BigInt): BigInt
    mul (val: BigInt): BigInt
    divmod (val: BigInt): { q: BigInt, r: BigInt }
    div (val: BigInt): BigInt
    mod (val: BigInt): BigInt
    xor (val: BigInt): BigInt
    and (val: BigInt): BigInt
    or (val: BigInt): BigInt
    neg (): BigInt
    shl (count: number): BigInt
    shr (count: number): BigInt
  }
}

declare global {
  interface DataView {
    getBigInt (byteOffset: number, littleEndian?: boolean): vue.BigInt
    setBigInt (byteOffset: number, value: vue.BigInt, littleEndian?: boolean): void
  }

  function log (msg: string): void
  function debug (msg: string): void
}

type NonPointerTypes = `${'Int' | 'Uint'}${8 | 16 | 32 | 64}`
type PointerTypes = `${NonPointerTypes}*`

type StructName<T> = T extends `${infer Name}[${string}]` ? Name : T
type StructCount<T> = T extends { count: infer C extends number } ? C :
  T extends { name: `${string}[${infer C extends number}]` } ? C :
    1

interface BaseStructField {
  size?: number
  offset?: number
}

interface PointerStructField extends BaseStructField {
  name: string
  type: PointerTypes
  pointer?: true
  count?: never
}

interface NonPointerStructFieldWithCountName extends BaseStructField {
  name: `${string}[${number}]`
  type: NonPointerTypes
  pointer?: false
  count?: number
}

interface NonPointerStructFieldWithCount extends BaseStructField {
  name: name
  type: NonPointerTypes
  pointer?: false
  count: number
}

interface NonPointerStructField extends BaseStructField {
  name: name
  type: NonPointerTypes
  pointer?: false
  count?: 1
}

type StructField = PointerStructField | NonPointerStructFieldWithCount | NonPointerStructFieldWithCountName | NonPointerStructField

type StructReturnType<const T extends StructField> =
  StructCount<T> extends (1 | undefined) ? (
    T['pointer'] extends true ? vue.BigInt :
      T['type'] extends 'Int64' ? vue.BigInt :
        T['type'] extends 'Uint64' ? vue.BigInt :
          number
  ) : (
    T['type'] extends 'Int8' ? Int8Array :
      T['type'] extends 'Uint8' ? Uint8Array :
        T['type'] extends 'Int16' ? Int16Array :
          T['type'] extends 'Uint16' ? Uint16Array :
            T['type'] extends 'Int32' ? Int32Array :
              T['type'] extends 'Uint32' ? Uint32Array :
                T['type'] extends 'Int64' ? Int32Array :
                  T['type'] extends 'Uint64' ? Uint32Array :
                    never
  )

type StructInstance<const T extends readonly StructField[]> = {
  [K in T[number] as StructName<K['name']>]: StructReturnType<K>
} & {
  addr: vue.BigInt
}

interface StructConstructor<const Name extends string, const T extends readonly StructField[]> {
  new (addr: vue.BigInt): StructInstance<T>

  readonly tname: Name
  readonly sizeof: number
  readonly fields: T
}

declare type struct = {
  create<const Name extends string, const T extends StructField[]>(name: Name, fields: T): StructConstructor<Name, T>
}

declare type mem = {
  allocs: Map<vue.BigInt, ArrayBufferLike>
  read8 (addr: vue.BigInt): vue.BigInt
  read4 (addr: vue.BigInt): vue.BigInt
  write8 (addr: vue.BigInt, value: vue.BigInt): void
  write4 (addr: vue.BigInt, value: vue.BigInt): void
  write1 (addr: vue.BigInt, value: vue.BigInt): void
  addrof (obj: unknown): vue.BigInt
  fakeobj (addr: vue.BigInt): unknown
  malloc (size: number): vue.BigInt
  free (addr: vue.BigInt): void
  free_all (): void
}

declare type utils = {
  base_addr (func_addr: vue.BigInt): vue.BigInt
  notify (msg: string): void
  str (addr: vue.BigInt): string
  cstr (str: string): vue.BigInt
  get_backing (view: ArrayBufferLike): vue.BigInt
  set_backing (view: ArrayBufferLike, addr: vue.BigInt): void
}

declare type rop = {
  init (): void
  free (): void
  reset (): void
  push (val: vue.BigInt): void
  execute (insts: vue.BigInt[], store_addr: vue.BigInt, store_size: number): void
  fake_builtin (addr: vue.BigInt): (useless1: number, useless2: number, useless3: number, addr: vue.BigInt) => void
  store (insts: vue.BigInt[], addr: vue.BigInt, index: number): void
  load (insts: vue.BigInt[], addr: vue.BigInt, index: number): void
}

type ArgTypeToRealType<T> = T extends 'bigint' ? vue.BigInt :
  T extends 'boolean' ? boolean :
    T extends 'number' ? number :
      T extends 'string' ? string :
        never

declare type fn = {
  create <const Args extends ('bigint' | 'number' | 'boolean' | 'string')[], Return extends ('bigint' | 'boolean' | 'string')>(addr: vue.BigInt | number, args: Args, ret: Return): (...func_args: { [K in keyof Args]: ArgTypeToRealType<Args[K]> }) => ArgTypeToRealType<Return>
}

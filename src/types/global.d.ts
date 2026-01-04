type TypedArray = Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array

declare function log (message: string): void
declare function debug (message: string): void
declare function include (path: string): void

declare var u32_structs: Uint32Array[]
declare var spray_size: 0x100
declare var marked_arr_offset: number
declare var corrupted_arr_idx: number
declare var marker: import('download0/types').BigInt
declare var indexing_header: import('download0/types').BigInt

declare var master: Uint32Array, slave: DataView, master_addr: import('download0/types').BigInt, slave_addr: import('download0/types').BigInt, slave_buf_addr: import('download0/types').BigInt

declare var leak_obj: Record<string, unknown>, leak_obj_addr: import('download0/types').BigInt

declare var native_executable: import('download0/types').BigInt
declare var scope: import('download0/types').BigInt

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

declare var debugging: {
  info: {
    memory: {
      available: number
      available_dmem: number
      available_libc: number
    }
  }
} | undefined

declare var is_jailbroken: boolean

declare var CONFIG: {
  autolapse?: boolean;
  autopoop?: boolean;
  autoclose?: boolean;
  music?: boolean;
} | undefined

declare var payloads: string[] | undefined

declare var kernel_offset: (typeof import('download0/kernel').ps4_kernel_offset_list[keyof typeof import('download0/kernel').ps4_kernel_offset_list]) & {
  PROC_FD?: number,
  PROC_PID?: number,
  PROC_VM_SPACE?: number,
  PROC_UCRED?: number,
  PROC_COMM?: number,
  PROC_SYSENT?: number,
  FILEDESC_OFILES?: number,
  SIZEOF_OFILES?: number,
  VMSPACE_VM_PMAP?: number,
  PMAP_CR3?: number,
  SO_PCB?: number,
  INPCB_PKTOPTS?: number,
  IP6PO_TCLASS?: number,
  IP6PO_RTHDR?: number,
} | null

declare class Image {
  url: string
  alpha: number
  x: number
  y: number
  width: number
  height: number
  visible: boolean
  borderColor: string
  borderWidth: number
  background: string
  color: string
  scaleX: number
  scaleY: number

  constructor (options: {
    url: string
    x: number
    y: number
    width: number
    height: number
    visible?: boolean
  })
}

declare class Style {
  constructor (options: {
    name: string
    color: string
    size: number
  })
}

declare class Video {
  duration: number
  visible: boolean
  elapsed: number

  onOpen: () => void
  onerror: (err: string) => void
  onstatechange: (state: string) => void

  constructor (options: {
    x: number
    y: number
    width: number
    height: number
    visible: boolean
    autoplay: boolean
  })
  play (): void
  open (url: string): void
  close (): void
}

declare var bg_success: Image
declare var bg_fail: Image
declare var bgmClip: jsmaf.AudioClip | null | undefined
declare function startBgmIfEnabled (): void
declare function stopBgm (): void

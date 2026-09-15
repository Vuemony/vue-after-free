declare namespace jsmaf {
  declare class Text {
    x: number
    y: number
    background: string
    url: string
    text: string
    color: string
    alpha: number
    style: string
    scaleX: number
    scaleY: number

    constructor (options?: {
      x?: number
      y?: number
      width?: number
      height?: number
      text?: string
      color?: string
      background?: string
      fontSize?: number
      style?: string
    })
  }

  declare class WebSocketServer {
    port: number
    onmessage: (clientID: number, data: string) => void

    constructor ()
    broadcast (data: string): void
  }

  declare class AudioClip {
    volume: number

    constructor ()
    open (url: string): void
    stop (): void
    close (): void
  }

  declare class XMLHttpRequest {
    readyState: number
    status: number
    responseText: string
    onreadystatechange: () => void

    constructor ()
    open (method: string, url: string, async: boolean): void
    send (data?: string): void
  }

  declare type Element = Text | Image | Video

  declare namespace root {
    declare const children: Element[]
  }

  declare function eval (code: string): unknown

  declare var gc: unknown

  declare var locale: string

  declare function clearInterval (intervalID: number): void
  declare function setInterval (handler: () => void, timeout: number): number

  declare function exit (): void

  declare var onEnterFrame: (() => void) | null
  declare var onKeyDown: ((keyCode: number) => void) | null
  declare var circleIsAdvanceButton: boolean

  declare var remotePlay: boolean

  declare function openWebBrowser (url: string): void
}

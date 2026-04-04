declare function include (path: string): unknown

declare namespace jsmaf {
  declare class Text {
    x: number
    y: number
    background: string
    url: string
    text: string

    constructor ()
  }

  declare class WebSocketServer {
    port: number
    onmessage: (clientID: number, data: string) => void

    constructor ()
    broadcast (data: string): void
  }

  declare namespace root {
    declare const children: Text[]
  }

  declare function eval (code: string): unknown
}

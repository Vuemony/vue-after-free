import { libc_addr } from 'download0/userland'
import { fn, mem, BigInt } from 'download0/types'

// simple server

if (libc_addr === null) {
  include('userland.js')
}

jsmaf.remotePlay = true

// register socket stuff
fn.register(97, 'socket', ['bigint', 'bigint', 'bigint'], 'bigint')
fn.register(98, 'connect', ['bigint', 'bigint', 'bigint'], 'bigint')
fn.register(104, 'bind', ['bigint', 'bigint', 'bigint'], 'bigint')
fn.register(105, 'setsockopt', ['bigint', 'bigint', 'bigint', 'bigint', 'bigint'], 'bigint')
fn.register(106, 'listen', ['bigint', 'bigint'], 'bigint')
fn.register(30, 'accept', ['bigint', 'bigint', 'bigint'], 'bigint')
fn.register(32, 'getsockname', ['bigint', 'bigint', 'bigint'], 'bigint')
fn.register(3, 'read', ['bigint', 'bigint', 'bigint'], 'bigint')
fn.register(4, 'write', ['bigint', 'bigint', 'bigint'], 'bigint')
fn.register(5, 'open', ['string', 'number', 'number'], 'bigint')
fn.register(6, 'close', ['bigint'], 'bigint')
fn.register(0x110, 'getdents', ['number', 'bigint', 'bigint'], 'bigint')
fn.register(93, 'select', ['bigint', 'bigint', 'bigint', 'bigint', 'bigint'], 'bigint')

const socket_sys = fn.socket
const connect_sys = fn.connect
const bind_sys = fn.bind
const setsockopt_sys = fn.setsockopt
const listen_sys = fn.listen
const accept_sys = fn.accept
const getsockname_sys = fn.getsockname
const read_sys = fn.read
const write_sys = fn.write
const open_sys = fn.open
const close_sys = fn.close
const getdents_sys = fn.getdents
const select_sys = fn.select

const AF_INET = 2
const SOCK_STREAM = 1
const SOCK_DGRAM = 2
const SOL_SOCKET = 0xFFFF
const SO_REUSEADDR = 0x4
const O_RDONLY = 0

// scan download0 for js files
function scan_js_files () {
  const files: string[] = []

  // try different paths for payloads dir
  const paths = ['/download0/', '/app0/download0/', 'download0/payloads']
  let dir_fd = -1
  let opened_path = ''

  for (const path of paths) {
    const dirRet = open_sys(path, O_RDONLY, 0)
    dir_fd = dirRet.lo

    if (dir_fd >= 0) {
      opened_path = path
      break
    }
  }

  if (dir_fd < 0) {
    log('cant open download0/payloads')
    return files
  }

  log('opened: ' + opened_path)

  const dirent_buf = mem.malloc(1024)

  while (true) {
    const ret = getdents_sys(dir_fd, dirent_buf, new BigInt(1024)).lo
    if (ret <= 0) break

    let offset = 0
    while (offset < ret) {
      const d_reclen = mem.view(dirent_buf).getUint16(offset + 4, true)
      const d_type = mem.view(dirent_buf).getUint8(offset + 6)
      const d_namlen = mem.view(dirent_buf).getUint8(offset + 7)

      let name = ''
      for (let i = 0; i < d_namlen; i++) {
        name += String.fromCharCode(mem.view(dirent_buf).getUint8(offset + 8 + i))
      }

      // only .js files
      if (name !== '.' && name !== '..' && d_type === 8 && name.length > 3 && name.substring(name.length - 3) === '.js') {
        files.push(name)
      }

      offset += d_reclen
    }
  }

  close_sys(new BigInt(dir_fd))
  return files
}

const js_files = scan_js_files()
log('found ' + js_files.length + ' js files')

// build html with log panel and button
const html = `<!DOCTYPE html>
<html>
<head>
<title>PS4 Webkit</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root {
  --primary-color: #ffffff;
  --primary-dark: #e3f2fd;
  --primary-light: #f1f8ff;
  --accent-color: #2196f3;
  --text-color: #0d47a1;
  --bg-light: #bbdefb;
  --card-border: #90caf9;
  --region-bg: #e3f2fd;
}
body.dark-mode {
  --primary-color: #0d47a1;
  --primary-dark: #002171;
  --primary-light: #1565c0;
  --accent-color: #64b5f6;
  --text-color: #ffffff;
  --bg-light: #000000;
  --card-border: #1e88e5;
  --region-bg: #002171;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--bg-light);
  color: var(--text-color);
  min-height: 100vh;
  text-align: center;
  overflow-x: hidden;
  overflow-y: auto;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 12px;
  position: relative;
  z-index: 1;
  overflow: visible;
  display: flex;
  flex-direction: column;
  height: 90vh;
}
.featured-games-bar {
  width: 100%;
  background: var(--primary-dark);
  padding: 15px 0;
  position: relative;
  border-bottom: 1px solid var(--card-border);
  z-index: 100;
  box-shadow: 0 2px 10px rgba(33, 150, 243, 0.2);
}
.featured-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 12px;
}
.featured-title {
  font-size: 1.5rem;
  color: var(--accent-color);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.status-badge {
  background: var(--primary-color);
  color: var(--accent-color);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  border: 1px solid var(--card-border);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.action-card {
  background: var(--primary-color);
  border: 1px solid var(--card-border);
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(33, 150, 243, 0.3);
  transition: all 0.3s ease;
  max-width: 400px;
  width: 100%;
}
.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(33, 150, 243, 0.4);
}
button {
  background: var(--accent-color);
  color: #fff;
  border: none;
  padding: 20px 40px;
  font-size: 24px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 10px;
  width: 100%;
  transition: all 0.3s ease;
  text-transform: uppercase;
}
button:hover {
  background: #1976d2;
  transform: scale(1.02);
}
.comments-section {
  width: 100%;
  margin-top: auto;
  padding: 20px 0;
}
.comments-container-full {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: var(--primary-color);
  border-radius: 10px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  border: 1px solid var(--card-border);
  height: 300px;
  display: flex;
  flex-direction: column;
}
.comments-title {
  font-size: 1.2rem;
  color: var(--accent-color);
  margin-bottom: 10px;
  font-weight: 700;
  text-align: left;
  border-bottom: 2px solid var(--primary-dark);
  padding-bottom: 10px;
}
#log {
  flex: 1;
  overflow-y: auto;
  font-family: monospace;
  font-size: 14px;
  text-align: left;
  padding: 10px;
  background: var(--primary-dark);
  border-radius: 5px;
  color: var(--text-color);
}
.line {
  margin: 4px 0;
  border-bottom: 1px solid rgba(33, 150, 243, 0.1);
  padding-bottom: 2px;
}
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: var(--primary-light);
}
::-webkit-scrollbar-thumb {
  background: var(--accent-color);
  border-radius: 4px;
}
</style>
</head>
<body>

<div class="featured-games-bar">
  <div class="featured-header">
    <div class="featured-title">PS4 Webkit Loader</div>
    <div id="status" class="status-badge">Disconnected</div>
  </div>
</div>

<div class="container">
  <div class="main-content">
    <div class="action-card">
      <h2 style="margin-bottom:20px; color:var(--text-color);">System Ready</h2>
      <button onclick="loadPayload()">Jailbreak</button>
      <p style="margin-top:15px; font-size:12px; opacity:0.7;">Firmware 9.00 / 11.00</p>
    </div>
  </div>

  <div class="comments-section">
    <div class="comments-container-full">
      <h3 class="comments-title">Kernel Log</h3>
      <div id="log"></div>
    </div>
  </div>
</div>

<script>
const logEl=document.getElementById("log");
const statusEl=document.getElementById("status");
const ws=null;
function addLog(msg){
  const div=document.createElement("div");
  div.className="line";
  div.textContent="> " + msg;
  logEl.appendChild(div);
  logEl.scrollTop=logEl.scrollHeight;
}
function connectWS(){
  try{
    ws=new WebSocket("ws://127.0.0.1:40404");
    ws.onopen=function(){
      statusEl.textContent="Connected";
      statusEl.style.color="green";
      addLog("[Connected to WS]");
    };
    ws.onmessage=function(e){addLog(e.data);};
    ws.onclose=function(){
      statusEl.textContent="Disconnected";
      statusEl.style.color="red";
      addLog("[Disconnected]");
      setTimeout(connectWS,2000);
    };
    ws.onerror=function(){
      statusEl.textContent="Error";
    };
  }catch(e){
    addLog("[WS Error: "+e.message+"]");
    setTimeout(connectWS,5000);
  }
}
function loadPayload(){
  fetch("/load").then(function(){addLog("[Payload Loaded]");});
}
connectWS();
</script>
</body>
</html>
`

// detect local ip by connecting to 8.8.8.8 (doesnt actually send anything)
log('detecting local ip...')
const detect_fd = socket_sys(new BigInt(0, AF_INET), new BigInt(0, SOCK_DGRAM), new BigInt(0, 0))
if (detect_fd.lo < 0) throw new Error('socket failed')

const detect_addr = mem.malloc(16)
mem.view(detect_addr).setUint8(0, 16)
mem.view(detect_addr).setUint8(1, AF_INET)
mem.view(detect_addr).setUint16(2, 0x3500, false) // port 53
mem.view(detect_addr).setUint32(4, 0x08080808, false) // 8.8.8.8

let local_ip = '127.0.0.1' // fallback

if (connect_sys(detect_fd, detect_addr, new BigInt(0, 16)).lo >= 0) {
  const local_addr = mem.malloc(16)
  const local_len = mem.malloc(4)
  mem.view(local_len).setUint32(0, 16, true)

  if (getsockname_sys(detect_fd, local_addr, local_len).lo >= 0) {
    const ip_int = mem.view(local_addr).getUint32(4, false)
    const ip1 = (ip_int >> 24) & 0xFF
    const ip2 = (ip_int >> 16) & 0xFF
    const ip3 = (ip_int >> 8) & 0xFF
    const ip4 = ip_int & 0xFF
    local_ip = ip1 + '.' + ip2 + '.' + ip3 + '.' + ip4
    log('detected ip: ' + local_ip)
  }
}

close_sys(detect_fd)

// create server socket
log('creating server...')
const srv = socket_sys(new BigInt(0, AF_INET), new BigInt(0, SOCK_STREAM), new BigInt(0, 0))
if (srv.lo < 0) throw new Error('cant create socket')

// set SO_REUSEADDR
const optval = mem.malloc(4)
mem.view(optval).setUint32(0, 1, true)
setsockopt_sys(srv, new BigInt(0, SOL_SOCKET), new BigInt(0, SO_REUSEADDR), optval, new BigInt(0, 4))

// bind to 0.0.0.0:0 (let os pick port)
const addr = mem.malloc(16)
mem.view(addr).setUint8(0, 16)
mem.view(addr).setUint8(1, AF_INET)
mem.view(addr).setUint16(2, 0, false) // port 0
mem.view(addr).setUint32(4, 0, false) // 0.0.0.0

if (bind_sys(srv, addr, new BigInt(0, 16)).lo < 0) {
  close_sys(srv)
  throw new Error('bind failed')
}

// get actual port
const actual_addr = mem.malloc(16)
const actual_len = mem.malloc(4)
mem.view(actual_len).setUint32(0, 16, true)
getsockname_sys(srv, actual_addr, actual_len)
const port = mem.view(actual_addr).getUint16(2, false)

log('got port: ' + port)

// listen
if (listen_sys(srv, new BigInt(0, 5)).lo < 0) {
  close_sys(srv)
  throw new Error('listen failed')
}

log('server started on 0.0.0.0:' + port)
log('local url: http://127.0.0.1:' + port)
log('network url: http://' + local_ip + ':' + port)

// try to open browser
try {
  jsmaf.openWebBrowser('http://127.0.0.1:' + port)
  log('opened browser')
} catch (e) {
  log('couldnt open browser: ' + (e as Error).message)
}

// helper to send response
function send_response (fd: BigInt, body: string) {
  const resp = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: ' + body.length + '\r\nConnection: close\r\n\r\n' + body
  const buf = mem.malloc(resp.length)
  for (let i = 0; i < resp.length; i++) {
    mem.view(buf).setUint8(i, resp.charCodeAt(i))
  }
  write_sys(fd, buf, new BigInt(0, resp.length))
}

// parse path from http request
function get_path (buf: BigInt, len: number) {
  let req = ''
  for (let i = 0; i < len && i < 1024; i++) {
    const c = mem.view(buf).getUint8(i)
    if (c === 0) break
    req += String.fromCharCode(c)
  }

  // GET /path HTTP/1.1
  const lines = req.split('\n')
  if (lines.length > 0) {
    const parts = lines[0]!.trim().split(' ')
    if (parts.length >= 2) return parts[1]
  }
  return '/'
}

log('server ready - non-blocking mode')
log('waiting for connections...')

let count = 0
let serverRunning = true

// Prepare select() structures (reuse across calls)
const readfds = mem.malloc(128)
const timeout = mem.malloc(16)
mem.view(timeout).setUint32(0, 0, true)
mem.view(timeout).setUint32(4, 0, true)
mem.view(timeout).setUint32(8, 0, true)
mem.view(timeout).setUint32(12, 0, true)

const client_addr = mem.malloc(16)
const client_len = mem.malloc(4)
const req_buf = mem.malloc(4096)

function handleRequest () {
  if (!serverRunning) return

  // Clear fd_set and set server fd
  for (let i = 0; i < 128; i++) {
    mem.view(readfds).setUint8(i, 0)
  }

  const fd = srv.lo
  const byte_index = Math.floor(fd / 8)
  const bit_index = fd % 8
  const current = mem.view(readfds).getUint8(byte_index)
  mem.view(readfds).setUint8(byte_index, current | (1 << bit_index))

  // Poll with select() - returns immediately
  const nfds = fd + 1
  const select_ret = select_sys(new BigInt(0, nfds), readfds, new BigInt(0, 0), new BigInt(0, 0), timeout)

  // No connection ready
  if (select_ret.lo <= 0) return

  // Connection ready - accept won't block
  mem.view(client_len).setUint32(0, 16, true)
  const client_ret = accept_sys(srv, client_addr, client_len)
  const client = client_ret instanceof BigInt ? client_ret.lo : client_ret

  if (client < 0) {
    log('accept failed: ' + client)
    return
  }

  count++
  log('')
  log('[' + count + '] client connected')

  // read request
  const read_ret = read_sys(new BigInt(client), req_buf, new BigInt(0, 4096))
  const bytes = read_ret instanceof BigInt ? read_ret.lo : read_ret
  log('read ' + bytes + ' bytes')

  const path = get_path(req_buf, bytes)
  log('path: ' + path)

  // handle /load - just run loader.js
  if (path === '/load' || path?.indexOf('/load?') === 0) {
    log('running loader.js')

    send_response(new BigInt(client), 'loading...')
    close_sys(new BigInt(client))

    try {
      log('=== loading loader.js ===')
      include('loader.js')
      log('=== done ===')
    } catch (e) {
      log('error: ' + (e as Error).message)
      if ((e as Error).stack) log((e as Error).stack!)
    }
  } else if (path?.indexOf('/load/') === 0) {
    // handle /load/filename.js
    const filename = path.substring(6)
    log('loading: ' + filename)

    send_response(new BigInt(client), 'loading ' + filename + '... check console')
    close_sys(new BigInt(client))

    try {
      log('=== loading ' + filename + ' ===')
      include('download0/payloads/' + filename)
      log('=== done loading ' + filename + ' ===')
    } catch (e) {
      log('error: ' + (e as Error).message)
      if ((e as Error).stack) log((e as Error).stack!)
    }
  } else {
    // just serve the main page
    send_response(new BigInt(client), html)
    close_sys(new BigInt(client))
  }

  log('closed connection')
}

// Non-blocking server loop
jsmaf.onEnterFrame = handleRequest

// Keep script alive - don't exit immediately
jsmaf.onKeyDown = function (keyCode) {
  if (keyCode === 13) { // Circle button - exit
    log('shutting down server...')
    serverRunning = false
    close_sys(srv)
    log('server closed')
    jsmaf.onEnterFrame = null
    jsmaf.onKeyDown = null
  }
}

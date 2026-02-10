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
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PS4 SYSTEM LOADER</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;600;700&family=Share+Tech+Mono&display=swap');
:root {
    --primary: #0d47a1;
    --primary-dim: rgba(13, 71, 161, 0.5);
    --primary-glow: rgba(13, 71, 161, 0.8);
    --accent: #00e5ff;
    --accent-dim: rgba(0, 229, 255, 0.3);
    --bg-dark: #020b16;
    --bg-panel: rgba(5, 20, 40, 0.85);
    --text-main: #ffffff;
    --text-muted: #809ab0;
    --success: #00e676;
    --error: #ff1744;
    --grid-line: rgba(0, 229, 255, 0.05);
    --border-radius: 4px;
    --scanline: rgba(0,0,0,0.5);
}
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
    -webkit-user-select: none;
}
body {
    background-color: var(--bg-dark);
    color: var(--text-main);
    font-family: 'Rajdhani', sans-serif;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
}
#bg-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    opacity: 0.4;
}
.scanlines {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        to bottom,
        rgba(255,255,255,0),
        rgba(255,255,255,0) 50%,
        rgba(0,0,0,0.1) 50%,
        rgba(0,0,0,0.1)
    );
    background-size: 100% 4px;
    z-index: 999;
    pointer-events: none;
    opacity: 0.3;
}
.interface-container {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: 80px 1fr 60px;
    padding: 20px;
    gap: 20px;
}
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--primary);
    background: linear-gradient(90deg, var(--bg-panel) 0%, transparent 100%);
    padding: 0 30px;
    position: relative;
}
header::after {
    content: '';
    position: absolute;
    bottom: -1px;
    right: 0;
    width: 30%;
    height: 1px;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
}
.brand-box {
    display: flex;
    align-items: center;
    gap: 15px;
}
.logo-icon {
    width: 40px;
    height: 40px;
    border: 2px solid var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(45deg);
    box-shadow: 0 0 15px var(--accent-dim);
}
.logo-inner {
    width: 20px;
    height: 20px;
    background: var(--primary);
    transform: rotate(-45deg);
}
.title-group {
    display: flex;
    flex-direction: column;
}
.main-title {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 4px;
    color: var(--text-main);
    text-shadow: 0 0 10px var(--primary-glow);
}
.sub-title {
    font-size: 12px;
    color: var(--accent);
    letter-spacing: 2px;
    text-transform: uppercase;
}
.header-stats {
    display: flex;
    gap: 40px;
}
.stat-item {
    text-align: right;
}
.stat-label {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 2px;
}
.stat-value {
    font-family: 'Share Tech Mono', monospace;
    font-size: 16px;
    color: var(--accent);
}
#connection-status {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #333;
    margin-right: 5px;
    box-shadow: 0 0 5px #333;
    transition: all 0.3s;
}
#connection-status.active {
    background: var(--success);
    box-shadow: 0 0 10px var(--success);
}
main {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 20px;
    height: 100%;
    overflow: hidden;
}
.control-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    border: 1px solid rgba(13, 71, 161, 0.3);
    background: rgba(2, 11, 22, 0.6);
    backdrop-filter: blur(5px);
    clip-path: polygon(
        20px 0, 100% 0, 
        100% calc(100% - 20px), calc(100% - 20px) 100%, 
        0 100%, 0 20px
    );
}
.corner-decor {
    position: absolute;
    width: 10px;
    height: 10px;
    border: 2px solid var(--accent);
    transition: all 0.3s ease;
}
.tl { top: 0; left: 0; border-right: none; border-bottom: none; }
.tr { top: 0; right: 0; border-left: none; border-bottom: none; }
.bl { bottom: 0; left: 0; border-right: none; border-top: none; }
.br { bottom: 0; right: 0; border-left: none; border-top: none; }
.control-panel:hover .corner-decor {
    width: 20px;
    height: 20px;
    box-shadow: 0 0 10px var(--accent);
}
.action-circle-container {
    position: relative;
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.circle-outer {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px dashed rgba(13, 71, 161, 0.3);
    animation: spin 20s linear infinite;
}
.circle-inner {
    position: absolute;
    width: 80%;
    height: 80%;
    border-radius: 50%;
    border: 1px solid var(--accent);
    opacity: 0.3;
    animation: spin-reverse 15s linear infinite;
}
.jb-button {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--primary) 0%, #000 100%);
    border: 4px solid var(--primary);
    color: white;
    font-family: 'Rajdhani', sans-serif;
    font-size: 24px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 0 30px var(--primary-dim);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 20;
    text-transform: uppercase;
    letter-spacing: 2px;
    position: relative;
    overflow: hidden;
}
.jb-button::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(to bottom right, rgba(255,255,255,0) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 60%);
    transform: rotate(45deg) translateY(-100%);
    transition: transform 0.6s;
}
.jb-button:hover {
    transform: scale(1.1);
    box-shadow: 0 0 50px var(--primary-glow), inset 0 0 20px var(--accent);
    border-color: var(--accent);
    text-shadow: 0 0 10px white;
}
.jb-button:hover::before {
    transform: rotate(45deg) translateY(100%);
}
.jb-button:active {
    transform: scale(0.95);
}
.status-text {
    margin-top: 40px;
    text-align: center;
}
.status-msg {
    font-size: 18px;
    color: var(--accent);
    margin-bottom: 5px;
    min-height: 24px;
}
.firmware-tag {
    font-size: 12px;
    background: rgba(13, 71, 161, 0.2);
    padding: 4px 12px;
    border-radius: 12px;
    border: 1px solid var(--primary);
    color: var(--text-muted);
}
.log-panel {
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid var(--primary-dim);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    box-shadow: -5px 0 15px rgba(0,0,0,0.5);
}
.log-header {
    background: rgba(13, 71, 161, 0.2);
    padding: 10px 15px;
    border-bottom: 1px solid var(--primary-dim);
    font-size: 14px;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--accent);
}
.log-controls span {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #333;
    margin-left: 5px;
}
.log-content {
    flex: 1;
    padding: 15px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 13px;
    overflow-y: auto;
    color: var(--text-muted);
    scrollbar-width: thin;
    scrollbar-color: var(--primary) transparent;
}
.log-content::-webkit-scrollbar {
    width: 5px;
}
.log-content::-webkit-scrollbar-thumb {
    background: var(--primary);
}
.log-line {
    margin-bottom: 4px;
    padding-left: 10px;
    border-left: 2px solid transparent;
    animation: fadeIn 0.3s ease-in;
    word-wrap: break-word;
}
.log-line.new {
    border-left-color: var(--accent);
    color: #fff;
    background: linear-gradient(90deg, rgba(0, 229, 255, 0.1) 0%, transparent 100%);
}
.log-line.error {
    border-left-color: var(--error);
    color: var(--error);
}
.log-line.success {
    border-left-color: var(--success);
    color: var(--success);
}
.timestamp {
    color: var(--primary);
    margin-right: 8px;
    font-size: 11px;
}
footer {
    border-top: 1px solid var(--primary-dim);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: rgba(2, 11, 22, 0.9);
    font-size: 12px;
    color: var(--text-muted);
}
.footer-left, .footer-right {
    display: flex;
    gap: 20px;
}
.footer-item {
    display: flex;
    align-items: center;
    gap: 5px;
}
.footer-icon {
    width: 8px;
    height: 8px;
    background: var(--primary);
    transform: rotate(45deg);
}
.loader-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: var(--accent);
    width: 0%;
    transition: width 0.3s;
    box-shadow: 0 0 10px var(--accent);
}
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }
@media (max-width: 768px) {
    main { grid-template-columns: 1fr; grid-template-rows: 1fr 250px; }
    .header-stats { display: none; }
    .main-title { font-size: 20px; }
}
.glitch-wrapper { position: relative; display: inline-block; }
.progress-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    z-index: 100;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s;
    backdrop-filter: blur(10px);
}
.progress-modal.active { opacity: 1; pointer-events: all; }
.progress-bar-container {
    width: 300px;
    height: 4px;
    background: #111;
    margin-top: 20px;
    position: relative;
    overflow: hidden;
    border-radius: 2px;
}
.progress-fill {
    height: 100%;
    background: var(--accent);
    width: 0%;
    box-shadow: 0 0 15px var(--accent);
    transition: width 0.2s;
}
.loading-text {
    font-family: 'Share Tech Mono', monospace;
    font-size: 18px;
    color: var(--text-main);
    letter-spacing: 2px;
}
.grid-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        linear-gradient(var(--grid-line) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 30px 30px;
    z-index: 1;
    pointer-events: none;
}
.hex-container {
    position: absolute;
    right: 20px;
    top: 20px;
    display: flex;
    gap: 5px;
}
.hex {
    width: 10px;
    height: 12px;
    background: var(--primary-dim);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    animation: blinkHex 2s infinite;
}
.hex:nth-child(2) { animation-delay: 0.5s; }
.hex:nth-child(3) { animation-delay: 1s; }
@keyframes blinkHex { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; background: var(--accent); } }
</style>
</head>
<body>

<div class="scanlines"></div>
<div class="grid-overlay"></div>
<canvas id="bg-canvas"></canvas>

<div class="progress-modal" id="p-modal">
    <div class="loading-text" id="loading-stage">INITIALIZING KERNEL...</div>
    <div class="progress-bar-container">
        <div class="progress-fill" id="p-fill"></div>
    </div>
</div>

<div class="interface-container">
    <header>
        <div class="brand-box">
            <div class="logo-icon"><div class="logo-inner"></div></div>
            <div class="title-group">
                <div class="main-title">PS4 JAILBREAK LOADER</div>
            </div>
        </div>
        <div class="header-stats">
            <div class="stat-item">
                <div class="stat-label">System Time</div>
                <div class="stat-value" id="sys-time">00:00:00</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Memory</div>
                <div class="stat-value">OK</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Network</div>
                <div class="stat-value"><span id="connection-status"></span><span id="net-text">OFFLINE</span></div>
            </div>
        </div>
    </header>

    <main>
        <div class="control-panel">
            <div class="corner-decor tl"></div>
            <div class="corner-decor tr"></div>
            <div class="corner-decor bl"></div>
            <div class="corner-decor br"></div>
            
            <div class="hex-container">
                <div class="hex"></div>
                <div class="hex"></div>
                <div class="hex"></div>
            </div>

            <div class="action-circle-container">
                <div class="circle-outer"></div>
                <div class="circle-inner"></div>
                <button class="jb-button" onclick="executeChain()">
                    INJECT
                    <br>
                    JIALBREAK
                </button>
            </div>

            <div class="status-text">
                <div class="status-msg" id="main-status">SYSTEM READY</div>
            </div>
        </div>

        <div class="log-panel">
            <div class="loader-bar" id="load-bar"></div>
            <div class="log-header">
                <div>> SYSTEM_TERMINAL</div>
                <div class="log-controls">
                    <span style="background:#ff5f57"></span>
                    <span style="background:#febc2e"></span>
                    <span style="background:#28c840"></span>
                </div>
            </div>
            <div class="log-content" id="terminal">
                <div class="log-line">> Initializing interface...</div>
                <div class="log-line">> Mounting userland...</div>
                <div class="log-line success">> Ready for payload injection.</div>
            </div>
        </div>
    </main>

    <footer>
        <div class="footer-left">
            <div class="footer-item"><div class="footer-icon"></div> <span>FW</span></div>
        </div>
        <div class="footer-right">
            <span>DESIGNED FOR PS4</span>
        </div>
    </footer>
</div>

<script>
// --- UI LOGIC ---
const term = document.getElementById('terminal');
const statusText = document.getElementById('main-status');
const connDot = document.getElementById('connection-status');
const connText = document.getElementById('net-text');
const sysTime = document.getElementById('sys-time');
const pModal = document.getElementById('p-modal');
const pFill = document.getElementById('p-fill');
const pStage = document.getElementById('loading-stage');

// Time Update
setInterval(() => {
    const now = new Date();
    sysTime.innerText = now.toLocaleTimeString('en-US', {hour12:false});
}, 1000);

// Logger
function log(msg, type='') {
    const d = new Date();
    const time = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0') + ':' + d.getSeconds().toString().padStart(2,'0');
    const div = document.createElement('div');
    div.className = 'log-line ' + type;
    if(type === 'new') div.className += ' new';
    div.innerHTML = \`<span class="timestamp">[\${time}]</span> \${msg}\`;
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
}

// Websocket Logic
let ws = null;
function connectWS() {
    try {
        ws = new WebSocket('ws://127.0.0.1:40404');
        ws.onopen = () => {
            connDot.classList.add('active');
            connText.innerText = 'ONLINE';
            connText.style.color = 'var(--success)';
            log('WebSocket Connection Established', 'success');
        };
        ws.onmessage = (e) => {
            log(e.data, 'new');
            if(e.data.includes('done')) {
                finishLoading();
            }
        };
        ws.onclose = () => {
            connDot.classList.remove('active');
            connText.innerText = 'OFFLINE';
            connText.style.color = 'var(--text-muted)';
            log('WebSocket Disconnected', 'error');
            setTimeout(connectWS, 3000);
        };
        ws.onerror = () => {
            connDot.classList.remove('active');
        };
    } catch(e) {
        setTimeout(connectWS, 5000);
    }
}

// Payload Execution
function executeChain() {
    statusText.innerText = 'INJECTING...';
    pModal.classList.add('active');
    
    // Simulate stages
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 5;
        if(progress > 90) progress = 90; // Wait for real finish
        pFill.style.width = progress + '%';
        
        if(progress > 20 && progress < 40) pStage.innerText = 'EXPLOITING WEBKIT...';
        if(progress > 40 && progress < 70) pStage.innerText = 'MAPPING MEMORY...';
        if(progress > 70) pStage.innerText = 'SENDING PAYLOAD...';
    }, 100);

    log('Sending payload request...', 'new');
    fetch('/load').then(() => {
        log('Request sent successfully', 'success');
        clearInterval(interval);
        pFill.style.width = '100%';
        setTimeout(() => {
            finishLoading();
        }, 500);
    }).catch(e => {
        log('Fetch error: ' + e.message, 'error');
        pModal.classList.remove('active');
        statusText.innerText = 'FAILED';
        clearInterval(interval);
    });
}

function finishLoading() {
    pFill.style.width = '100%';
    pStage.innerText = 'COMPLETE';
    statusText.innerText = 'PAYLOAD LOADED';
    statusText.style.color = 'var(--success)';
    setTimeout(() => {
        pModal.classList.remove('active');
        pFill.style.width = '0%';
    }, 1000);
}

connectWS();

// --- MATRIX / PARTICLE CANVAS ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.onresize = resize;
resize();

const particles = [];
const pCount = 50;

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if(this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
    }
    draw() {
        ctx.fillStyle = \`rgba(0, 229, 255, \${this.alpha})\`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fill();
    }
}

for(let i=0; i<pCount; i++) particles.push(new Particle());

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw connections
    ctx.lineWidth = 0.5;
    for(let i=0; i<particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for(let j=i+1; j<particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist < 100) {
                ctx.strokeStyle = \`rgba(13, 71, 161, \${0.2 * (1 - dist/100)})\`;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}
animate();

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

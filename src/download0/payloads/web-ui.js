//simple server

include('userland.js')

jsmaf.remotePlay = true

// register socket stuff
try { fn.register(97, 'socket', 'bigint') } catch(e) {}
try { fn.register(98, 'connect', 'bigint') } catch(e) {}
try { fn.register(104, 'bind', 'bigint') } catch(e) {}
try { fn.register(105, 'setsockopt', 'bigint') } catch(e) {}
try { fn.register(106, 'listen', 'bigint') } catch(e) {}
try { fn.register(30, 'accept', 'bigint') } catch(e) {}
try { fn.register(32, 'getsockname', 'bigint') } catch(e) {}
try { fn.register(3, 'read', 'bigint') } catch(e) {}
try { fn.register(4, 'write', 'bigint') } catch(e) {}
try { fn.register(6, 'close', 'bigint') } catch(e) {}
try { fn.register(0x110, 'getdents', 'bigint') } catch(e) {}

var socket_sys = fn.socket
var connect_sys = fn.connect
var bind_sys = fn.bind
var setsockopt_sys = fn.setsockopt
var listen_sys = fn.listen
var accept_sys = fn.accept
var getsockname_sys = fn.getsockname
var read_sys = fn.read
var write_sys = fn.write
var close_sys = fn.close
var getdents_sys = fn.getdents

var AF_INET = 2
var SOCK_STREAM = 1
var SOCK_DGRAM = 2
var SOL_SOCKET = 0xFFFF
var SO_REUSEADDR = 0x4
var O_RDONLY = 0

// helper to make string buffer
function str_buf(s) {
    var buf = mem.malloc(s.length + 1)
    for (var i = 0; i < s.length; i++) {
        mem.view(buf).setUint8(i, s.charCodeAt(i))
    }
    mem.view(buf).setUint8(s.length, 0) // null terminator
    return buf
}

// scan download0 for js files
function scan_js_files() {
    var files = []

    // try different paths for payloads dir
    var paths = ['/download0/', '/app0/download0/', 'download0/payloads']
    var dir_fd = -1
    var opened_path = ''

    for (var p = 0; p < paths.length; p++) {
        var path = paths[p]
        var path_str = mem.malloc(path.length + 1)
        for (var i = 0; i < path.length; i++) {
            mem.view(path_str).setUint8(i, path.charCodeAt(i))
        }
        mem.view(path_str).setUint8(path.length, 0)

        dir_fd = fn.open(path_str, O_RDONLY)
        if (dir_fd instanceof BigInt) dir_fd = dir_fd.lo

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

    var dirent_buf = mem.malloc(1024)

    while (true) {
        var ret = getdents_sys(dir_fd, dirent_buf, 1024)
        if (ret instanceof BigInt) ret = ret.lo
        if (ret <= 0) break

        var offset = 0
        while (offset < ret) {
            var d_fileno = mem.view(dirent_buf).getUint32(offset, true)
            var d_reclen = mem.view(dirent_buf).getUint16(offset + 4, true)
            var d_type = mem.view(dirent_buf).getUint8(offset + 6)
            var d_namlen = mem.view(dirent_buf).getUint8(offset + 7)

            var name = ''
            for (var i = 0; i < d_namlen; i++) {
                name += String.fromCharCode(mem.view(dirent_buf).getUint8(offset + 8 + i))
            }

            // only .js files
            if (name !== '.' && name !== '..' && d_type === 8 && name.length > 3 && name.substring(name.length - 3) === '.js') {
                files.push(name)
            }

            offset += d_reclen
        }
    }

    fn.close(dir_fd)
    return files
}

var js_files = scan_js_files()
log('found ' + js_files.length + ' js files')

// build html with log panel and button
var html = '<!DOCTYPE html>\n' +
'<html>\n' +
'<head>\n' +
'<title>ps4</title>\n' +
'<style>\n' +
'body{background:#000;color:#0f0;font-family:monospace;margin:0;padding:0;display:flex;height:100vh;overflow:hidden;}\n' +
'#log{width:33.333%;background:#111;border-right:2px solid #0f0;padding:10px;overflow-y:auto;font-size:16px;}\n' +
'#main{flex:1;display:flex;align-items:center;justify-content:center;}\n' +
'button{background:#0a0;color:#000;border:none;padding:60px 120px;font-size:48px;cursor:pointer;font-family:monospace;font-weight:bold;border-radius:20px;box-shadow:0 0 50px #0f0;}\n' +
'button:hover{background:#0f0;box-shadow:0 0 100px #0f0;}\n' +
'.line{margin:2px 0;}\n' +
'#status{position:absolute;top:10px;right:10px;font-size:10px;opacity:0.5;}\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div id="log"></div>\n' +
'<div id="main">\n' +
'<button onclick="loadPayload()">jelbrek</button>\n' +
'</div>\n' +
'<div id="status">disconnected</div>\n' +
'<script>\n' +
'var logEl=document.getElementById("log");\n' +
'var statusEl=document.getElementById("status");\n' +
'var ws=null;\n' +
'function addLog(msg){var div=document.createElement("div");div.className="line";div.textContent=msg;logEl.appendChild(div);logEl.scrollTop=logEl.scrollHeight;}\n' +
'function connectWS(){try{ws=new WebSocket("ws://127.0.0.1:40404");ws.onopen=function(){statusEl.textContent="connected";statusEl.style.opacity="1";addLog("[connected to ws]");};ws.onmessage=function(e){addLog(e.data);};ws.onclose=function(){statusEl.textContent="disconnected";statusEl.style.opacity="0.5";addLog("[disconnected]");setTimeout(connectWS,2000);};ws.onerror=function(){statusEl.textContent="error";statusEl.style.opacity="0.5";};}catch(e){addLog("[ws error: "+e.message+"]");setTimeout(connectWS,5000);}}\n' +
'function goFullscreen(){var elem=document.documentElement;try{if(elem.requestFullscreen){elem.requestFullscreen();}else if(elem.webkitRequestFullscreen){elem.webkitRequestFullscreen();}else if(elem.mozRequestFullScreen){elem.mozRequestFullScreen();}else if(elem.msRequestFullscreen){elem.msRequestFullscreen();}else{addLog("[fullscreen not supported]");}}catch(e){addLog("[fullscreen error: "+e.message+"]");}}\n' +
'function loadPayload(){fetch("/load").then(function(){addLog("[payload loaded]");});}\n' +
'connectWS();\n' +
'window.onload = function() {\n'+
'goFullscreen();\n'+
'};\n' +
'</script>\n' +
'</body>\n' +
'</html>\n'

// detect local ip by connecting to 8.8.8.8 (doesnt actually send anything)
log('detecting local ip...')
var detect_fd = socket_sys(new BigInt(0, AF_INET), new BigInt(0, SOCK_DGRAM), new BigInt(0, 0))
if (detect_fd.lo < 0) throw new Error('socket failed')

var detect_addr = mem.malloc(16)
mem.view(detect_addr).setUint8(0, 16)
mem.view(detect_addr).setUint8(1, AF_INET)
mem.view(detect_addr).setUint16(2, 0x3500, false) // port 53
mem.view(detect_addr).setUint32(4, 0x08080808, false) // 8.8.8.8

var local_ip = '127.0.0.1' // fallback

if (connect_sys(detect_fd, detect_addr, new BigInt(0, 16)).lo >= 0) {
    var local_addr = mem.malloc(16)
    var local_len = mem.malloc(4)
    mem.view(local_len).setUint32(0, 16, true)

    if (getsockname_sys(detect_fd, local_addr, local_len).lo >= 0) {
        var ip_int = mem.view(local_addr).getUint32(4, false)
        var ip1 = (ip_int >> 24) & 0xFF
        var ip2 = (ip_int >> 16) & 0xFF
        var ip3 = (ip_int >> 8) & 0xFF
        var ip4 = ip_int & 0xFF
        local_ip = ip1 + '.' + ip2 + '.' + ip3 + '.' + ip4
        log('detected ip: ' + local_ip)
    }
}

close_sys(detect_fd)

// create server socket
log('creating server...')
var srv = socket_sys(new BigInt(0, AF_INET), new BigInt(0, SOCK_STREAM), new BigInt(0, 0))
if (srv.lo < 0) throw new Error('cant create socket')

// set SO_REUSEADDR
var optval = mem.malloc(4)
mem.view(optval).setUint32(0, 1, true)
setsockopt_sys(srv, new BigInt(0, SOL_SOCKET), new BigInt(0, SO_REUSEADDR), optval, new BigInt(0, 4))

// bind to 0.0.0.0:0 (let os pick port)
var addr = mem.malloc(16)
mem.view(addr).setUint8(0, 16)
mem.view(addr).setUint8(1, AF_INET)
mem.view(addr).setUint16(2, 0, false) // port 0
mem.view(addr).setUint32(4, 0, false) // 0.0.0.0

if (bind_sys(srv, addr, new BigInt(0, 16)).lo < 0) {
    close_sys(srv)
    throw new Error('bind failed')
}

// get actual port
var actual_addr = mem.malloc(16)
var actual_len = mem.malloc(4)
mem.view(actual_len).setUint32(0, 16, true)
getsockname_sys(srv, actual_addr, actual_len)
var port = mem.view(actual_addr).getUint16(2, false)

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
} catch(e) {
    log('couldnt open browser: ' + e.message)
}

// helper to send response
function send_response(fd, body) {
    var resp = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: ' + body.length + '\r\nConnection: close\r\n\r\n' + body
    var buf = mem.malloc(resp.length)
    for (var i = 0; i < resp.length; i++) {
        mem.view(buf).setUint8(i, resp.charCodeAt(i))
    }
    write_sys(fd, buf, new BigInt(0, resp.length))
}

// parse path from http request
function get_path(buf, len) {
    var req = ''
    for (var i = 0; i < len && i < 1024; i++) {
        var c = mem.view(buf).getUint8(i)
        if (c === 0) break
        req += String.fromCharCode(c)
    }

    // GET /path HTTP/1.1
    var lines = req.split('\n')
    if (lines.length > 0) {
        var parts = lines[0].trim().split(' ')
        if (parts.length >= 2) return parts[1]
    }
    return '/'
}

log('waiting for connections...')

var count = 0
var max = 50
var client_addr = mem.malloc(16)
var client_len = mem.malloc(4)
var req_buf = mem.malloc(4096)

while (count < max) {
    log('')
    log('[' + (count + 1) + '/' + max + '] waiting...')

    mem.view(client_len).setUint32(0, 16, true)
    var client_ret = accept_sys(srv, client_addr, client_len)
    var client = client_ret instanceof BigInt ? client_ret.lo : client_ret

    if (client < 0) {
        log('accept failed: ' + client)
        continue
    }

    log('client connected')

    // read request
    var read_ret = read_sys(client, req_buf, new BigInt(0, 4096))
    var bytes = read_ret instanceof BigInt ? read_ret.lo : read_ret
    log('read ' + bytes + ' bytes')

    var path = get_path(req_buf, bytes)
    log('path: ' + path)

    // handle /load - just run loader.js
    if (path === '/load' || path.indexOf('/load?') === 0) {
        log('running loader.js')

        send_response(client, 'loading...')
        close_sys(client)

        try {
            log('=== loading loader.js ===')
            include('loader.js')
            log('=== done ===')
        } catch(e) {
            log('error: ' + e.message)
            if (e.stack) log(e.stack)
        }
    } else if (path.indexOf('/load/') === 0) {
        // handle /load/filename.js
        var filename = path.substring(6)
        log('loading: ' + filename)

        send_response(client, 'loading ' + filename + '... check console')
        close_sys(client)

        try {
            log('=== loading ' + filename + ' ===')
            include('download0/payloads/' + filename)
            log('=== done loading ' + filename + ' ===')
        } catch(e) {
            log('error: ' + e.message)
            if (e.stack) log(e.stack)
        }
    } else {
        // just serve the main page
        send_response(client, html)
        close_sys(client)
    }

    log('closed connection')
    count++
}

log('')
log('reached max requests (' + max + ')')
close_sys(srv)
log('done')

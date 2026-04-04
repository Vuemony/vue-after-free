import { fn, BigInt } from 'download0/types'

export function checkJailbroken (): boolean {
  fn.register(24, 'getuid', [], 'bigint')
  fn.register(23, 'setuid', ['number'], 'bigint')

  const uidBefore = fn.getuid()

  try {
    fn.setuid(0)
  } catch (_) {}

  const uidAfter    = fn.getuid()
  const uidAfterVal = uidAfter instanceof BigInt ? uidAfter.lo : uidAfter
  const uidBeforeVal = uidBefore instanceof BigInt ? uidBefore.lo : uidBefore

  return uidAfterVal === 0 && uidBeforeVal !== 0
}

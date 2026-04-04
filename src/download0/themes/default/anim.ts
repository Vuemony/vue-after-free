// Shared animation & SFX utilities — extracted from the three theme screens
// to avoid duplicating animateZoomIn / animateZoomOut / easeInOut everywhere.

// ── Sound effects ─────────────────────────────────────────────────────────────

let sfxCursor:  jsmaf.AudioClip | null = null
let sfxConfirm: jsmaf.AudioClip | null = null
let sfxCancel:  jsmaf.AudioClip | null = null
const SFX_BASE = 'file:///../download0/audio/'

export function initSfx () {
  if (sfxCursor && sfxConfirm && sfxCancel) return   // already initialized
  try {
    sfxCursor  = new jsmaf.AudioClip(); sfxCursor.volume  = 0.75
    sfxConfirm = new jsmaf.AudioClip(); sfxConfirm.volume = 0.90
    sfxCancel  = new jsmaf.AudioClip(); sfxCancel.volume  = 0.80
  } catch (_) {}
}

function playSfx (clip: jsmaf.AudioClip | null, file: string) {
  if (!clip) return
  try { clip.stop() } catch (_) {}
  try { clip.open(SFX_BASE + file) } catch (_) {}
}

export function playCursor  () { playSfx(sfxCursor,  'cursor.wav')  }
export function playConfirm () { playSfx(sfxConfirm, 'confirm.wav') }
export function playCancel  () { playSfx(sfxCancel,  'cancel.wav')  }

// ── Animation ─────────────────────────────────────────────────────────────────

export function easeInOut (t: number) {
  return (1 - Math.cos(t * Math.PI)) / 2
}

// Unified zoom animator — used by both zoomIn (targetScale=1.1) and zoomOut (targetScale=1.0)
function animateZoom (
  btn: Image, text: jsmaf.Text,
  btnOrigX: number, btnOrigY: number,
  textOrigX: number, textOrigY: number,
  buttonWidth: number, buttonHeight: number,
  targetScale: number,
  intervalRef: { value: number | null }
) {
  if (intervalRef.value !== null) jsmaf.clearInterval(intervalRef.value)
  const startScale = btn.scaleX || (targetScale === 1.1 ? 1.0 : 1.1)
  const duration   = 175
  let   elapsed    = 0
  const step       = 16

  intervalRef.value = jsmaf.setInterval(function () {
    elapsed += step
    const t     = Math.min(elapsed / duration, 1)
    const eased = easeInOut(t)
    const scale = startScale + (targetScale - startScale) * eased

    btn.scaleX  = scale; btn.scaleY  = scale
    btn.x       = btnOrigX  - (buttonWidth  * (scale - 1)) / 2
    btn.y       = btnOrigY  - (buttonHeight * (scale - 1)) / 2
    text.scaleX = scale; text.scaleY = scale
    text.x      = textOrigX - (buttonWidth  * (scale - 1)) / 2
    text.y      = textOrigY - (buttonHeight * (scale - 1)) / 2

    if (t >= 1) {
      jsmaf.clearInterval(intervalRef.value ?? -1)
      intervalRef.value = null
    }
  }, step)
}

export function animateZoomIn (
  btn: Image, text: jsmaf.Text,
  btnOrigX: number, btnOrigY: number,
  textOrigX: number, textOrigY: number,
  buttonWidth: number, buttonHeight: number,
  intervalRef: { value: number | null }
) {
  animateZoom(btn, text, btnOrigX, btnOrigY, textOrigX, textOrigY, buttonWidth, buttonHeight, 1.1, intervalRef)
}

export function animateZoomOut (
  btn: Image, text: jsmaf.Text,
  btnOrigX: number, btnOrigY: number,
  textOrigX: number, textOrigY: number,
  buttonWidth: number, buttonHeight: number,
  intervalRef: { value: number | null }
) {
  animateZoom(btn, text, btnOrigX, btnOrigY, textOrigX, textOrigY, buttonWidth, buttonHeight, 1.0, intervalRef)
}

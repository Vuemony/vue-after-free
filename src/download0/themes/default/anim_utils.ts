// Shared animation utilities for theme UI components.
// Extracted to avoid duplicating animateZoomIn / animateZoomOut / easeInOut
// across main.ts, config_ui.ts, and payload_host.ts.

export const BUTTON_IMG = 'file:///assets/img/button_over_9.png'

export function easeInOut (t: number) {
  return (1 - Math.cos(t * Math.PI)) / 2
}

export function animateZoom (
  btn: Image,
  text: jsmaf.Text,
  btnOrigX: number,
  btnOrigY: number,
  textOrigX: number,
  textOrigY: number,
  buttonWidth: number,
  buttonHeight: number,
  targetScale: number,
  intervalRef: { value: number | null }
) {
  if (intervalRef.value !== null) jsmaf.clearInterval(intervalRef.value)
  const startScale = btn.scaleX || (targetScale === 1.1 ? 1.0 : 1.1)
  const duration = 175
  let elapsed = 0
  const step = 16

  intervalRef.value = jsmaf.setInterval(function () {
    elapsed += step
    const t = Math.min(elapsed / duration, 1)
    const eased = easeInOut(t)
    const scale = startScale + (targetScale - startScale) * eased

    btn.scaleX = scale
    btn.scaleY = scale
    btn.x = btnOrigX - (buttonWidth * (scale - 1)) / 2
    btn.y = btnOrigY - (buttonHeight * (scale - 1)) / 2
    text.scaleX = scale
    text.scaleY = scale
    text.x = textOrigX - (buttonWidth * (scale - 1)) / 2
    text.y = textOrigY - (buttonHeight * (scale - 1)) / 2

    if (t >= 1) {
      jsmaf.clearInterval(intervalRef.value ?? -1)
      intervalRef.value = null
    }
  }, step)
}

export function animateZoomIn (
  btn: Image,
  text: jsmaf.Text,
  btnOrigX: number,
  btnOrigY: number,
  textOrigX: number,
  textOrigY: number,
  buttonWidth: number,
  buttonHeight: number,
  intervalRef: { value: number | null }
) {
  animateZoom(btn, text, btnOrigX, btnOrigY, textOrigX, textOrigY, buttonWidth, buttonHeight, 1.1, intervalRef)
}

export function animateZoomOut (
  btn: Image,
  text: jsmaf.Text,
  btnOrigX: number,
  btnOrigY: number,
  textOrigX: number,
  textOrigY: number,
  buttonWidth: number,
  buttonHeight: number,
  intervalRef: { value: number | null }
) {
  animateZoom(btn, text, btnOrigX, btnOrigY, textOrigX, textOrigY, buttonWidth, buttonHeight, 1.0, intervalRef)
}

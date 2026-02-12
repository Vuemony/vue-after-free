// sfx.ts - Sound effects manager for Vue-After-Free
// Handles navigation clicks, success/fail sounds, and BGM

var sfx_enabled = true
var sfx_navClip: jsmaf.AudioClip | null = null
var sfx_successClip: jsmaf.AudioClip | null = null
var sfx_failClip: jsmaf.AudioClip | null = null
var sfx_bgmClip: jsmaf.AudioClip | null = null

function sfx_setEnabled (enabled: boolean): void {
  sfx_enabled = enabled
}

function sfx_isEnabled (): boolean {
  return sfx_enabled
}

function sfx_playNav (): void {
  if (!sfx_enabled) return
  try {
    if (!sfx_navClip) {
      sfx_navClip = new jsmaf.AudioClip()
      sfx_navClip.volume = 0.3
    }
    sfx_navClip.open('file://../download0/sfx/nav.wav')
  } catch (e) {
    // Silently fail - sound files may not exist
  }
}

function sfx_playSelect (): void {
  if (!sfx_enabled) return
  try {
    const clip = new jsmaf.AudioClip()
    clip.volume = 0.4
    clip.open('file://../download0/sfx/select.wav')
  } catch (e) {
    // Silently fail
  }
}

function sfx_playSuccess (): void {
  if (!sfx_enabled) return
  try {
    if (!sfx_successClip) {
      sfx_successClip = new jsmaf.AudioClip()
      sfx_successClip.volume = 0.5
    }
    sfx_successClip.open('file://../download0/sfx/success.wav')
  } catch (e) {
    // Silently fail
  }
}

function sfx_playFail (): void {
  if (!sfx_enabled) return
  try {
    if (!sfx_failClip) {
      sfx_failClip = new jsmaf.AudioClip()
      sfx_failClip.volume = 0.5
    }
    sfx_failClip.open('file://../download0/sfx/fail.wav')
  } catch (e) {
    // Silently fail
  }
}

function sfx_playBgm (): void {
  if (typeof CONFIG !== 'undefined' && CONFIG.music) {
    try {
      if (!sfx_bgmClip) {
        sfx_bgmClip = new jsmaf.AudioClip()
        sfx_bgmClip.volume = 0.5
      }
      sfx_bgmClip.open('file://../download0/sfx/bgm.wav')
    } catch (e) {
      // Silently fail
    }
  }
}

function sfx_stopBgm (): void {
  try {
    if (sfx_bgmClip) {
      sfx_bgmClip.stop()
      sfx_bgmClip.close()
      sfx_bgmClip = null
    }
  } catch (e) {
    // Silently fail - stop/close may not be available on all FW
  }
}

export {
  sfx_setEnabled,
  sfx_isEnabled,
  sfx_playNav,
  sfx_playSelect,
  sfx_playSuccess,
  sfx_playFail,
  sfx_playBgm,
  sfx_stopBgm
}


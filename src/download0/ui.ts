// ui.ts - Shared UI framework for Vue-After-Free
// Provides common screen setup, animation, menu management, theme support, and transitions.
// All functions use a "ui_" prefix to avoid global name collisions.

import { useImageText, textImageBase } from 'download0/languages'
import { themes_getTheme, Theme } from 'download0/themes'
import { sfx_playNav, sfx_playBgm } from 'download0/sfx'

// === Constants ===

const UI_NORMAL_BTN = 'file:///assets/img/button_over_9.png'
const UI_SELECTED_BTN = 'file:///assets/img/button_over_9.png'
const UI_BG_IMG = 'file:///../download0/img/multiview_bg_VAF.png'
const UI_LOGO_IMG = 'file:///../download0/img/logo.png'
const UI_MARKER_IMG = 'file:///assets/img/ad_pod_marker.png'

// === Menu State Type ===

export interface UIMenuState {
  buttons: Image[]
  buttonTexts: (jsmaf.Text | Image)[]
  buttonMarkers: (Image | null)[]
  buttonOrigPos: { x: number; y: number }[]
  textOrigPos: { x: number; y: number }[]
  currentButton: number
  prevButton: number
  buttonWidth: number
  buttonHeight: number
  zoomInInterval: number | null
  zoomOutInterval: number | null
}

// === Screen Setup ===

function ui_initScreen (): void {
  jsmaf.root.children.length = 0
  const theme = themes_getTheme()
  new Style({ name: 'white', color: theme.textColor || 'white', size: 24 })
  new Style({ name: 'title', color: theme.textColor || 'white', size: 32 })
  new Style({ name: 'accent', color: theme.accent || 'rgb(100,180,255)', size: 24 })
  new Style({ name: 'dim', color: theme.dimColor || 'rgb(160,180,200)', size: 20 })
  new Style({ name: 'success', color: theme.successColor || 'rgb(80,220,120)', size: 24 })
  new Style({ name: 'error', color: theme.errorColor || 'rgb(255,80,80)', size: 24 })
}

function ui_addBackground (): Image {
  const bg = new Image({ url: UI_BG_IMG, x: 0, y: 0, width: 1920, height: 1080 })
  jsmaf.root.children.push(bg)
  return bg
}

function ui_addLogo (x: number, y: number, width: number, height: number): Image {
  const logo = new Image({ url: UI_LOGO_IMG, x: x, y: y, width: width, height: height })
  jsmaf.root.children.push(logo)
  return logo
}

function ui_addTitle (text: string, imgKey: string, x: number, y: number, width: number, height: number): void {
  if (useImageText) {
    const title = new Image({ url: textImageBase + imgKey + '.png', x: x, y: y, width: width, height: height })
    jsmaf.root.children.push(title)
  } else {
    const title = new jsmaf.Text()
    title.text = text
    title.x = x
    title.y = y
    title.style = 'title'
    jsmaf.root.children.push(title)
  }
}

function ui_playMusic (): void {
  sfx_playBgm()
}

// === Transition Effects ===

function ui_fadeIn (element: Image, duration: number, callback?: () => void): void {
  element.alpha = 0
  let elapsed = 0
  const step = 16
  const interval = jsmaf.setInterval(function () {
    elapsed += step
    const t = Math.min(elapsed / duration, 1)
    element.alpha = t
    if (t >= 1) {
      jsmaf.clearInterval(interval)
      if (callback) callback()
    }
  }, step)
}

function ui_fadeOut (element: Image, duration: number, callback?: () => void): void {
  element.alpha = 1
  let elapsed = 0
  const step = 16
  const interval = jsmaf.setInterval(function () {
    elapsed += step
    const t = Math.min(elapsed / duration, 1)
    element.alpha = 1 - t
    if (t >= 1) {
      jsmaf.clearInterval(interval)
      if (callback) callback()
    }
  }, step)
}

// === Status Bar ===

function ui_addStatusBar (text: string, x: number, y: number): jsmaf.Text {
  const statusText = new jsmaf.Text()
  statusText.text = text
  statusText.x = x
  statusText.y = y
  statusText.style = 'dim'
  jsmaf.root.children.push(statusText)
  return statusText
}

// === Menu State Management ===

function ui_createMenuState (buttonWidth: number, buttonHeight: number): UIMenuState {
  return {
    buttons: [],
    buttonTexts: [],
    buttonMarkers: [],
    buttonOrigPos: [],
    textOrigPos: [],
    currentButton: 0,
    prevButton: -1,
    buttonWidth: buttonWidth,
    buttonHeight: buttonHeight,
    zoomInInterval: null,
    zoomOutInterval: null
  }
}

// === Animation ===

function ui_easeInOut (t: number): number {
  return (1 - Math.cos(t * Math.PI)) / 2
}

function ui_animateZoomIn (state: UIMenuState, index: number): void {
  if (state.zoomInInterval) jsmaf.clearInterval(state.zoomInInterval)

  const btn = state.buttons[index]!
  const text = state.buttonTexts[index]!
  const btnOrigX = state.buttonOrigPos[index]!.x
  const btnOrigY = state.buttonOrigPos[index]!.y
  const textOrigX = state.textOrigPos[index]!.x
  const textOrigY = state.textOrigPos[index]!.y
  const btnW = state.buttonWidth
  const btnH = state.buttonHeight
  const startScale = btn.scaleX || 1.0
  const endScale = 1.1
  const duration = 175
  let elapsed = 0
  const step = 16

  state.zoomInInterval = jsmaf.setInterval(function () {
    elapsed += step
    const t = Math.min(elapsed / duration, 1)
    const eased = ui_easeInOut(t)
    const scale = startScale + (endScale - startScale) * eased

    btn.scaleX = scale
    btn.scaleY = scale
    btn.x = btnOrigX - (btnW * (scale - 1)) / 2
    btn.y = btnOrigY - (btnH * (scale - 1)) / 2
    text.scaleX = scale
    text.scaleY = scale
    text.x = textOrigX - (btnW * (scale - 1)) / 2
    text.y = textOrigY - (btnH * (scale - 1)) / 2

    if (t >= 1 && state.zoomInInterval) {
      jsmaf.clearInterval(state.zoomInInterval)
      state.zoomInInterval = null
    }
  }, step)
}

function ui_animateZoomOut (state: UIMenuState, index: number): void {
  if (state.zoomOutInterval) jsmaf.clearInterval(state.zoomOutInterval)

  const btn = state.buttons[index]!
  const text = state.buttonTexts[index]!
  const btnOrigX = state.buttonOrigPos[index]!.x
  const btnOrigY = state.buttonOrigPos[index]!.y
  const textOrigX = state.textOrigPos[index]!.x
  const textOrigY = state.textOrigPos[index]!.y
  const btnW = state.buttonWidth
  const btnH = state.buttonHeight
  const startScale = btn.scaleX || 1.1
  const endScale = 1.0
  const duration = 175
  let elapsed = 0
  const step = 16

  state.zoomOutInterval = jsmaf.setInterval(function () {
    elapsed += step
    const t = Math.min(elapsed / duration, 1)
    const eased = ui_easeInOut(t)
    const scale = startScale + (endScale - startScale) * eased

    btn.scaleX = scale
    btn.scaleY = scale
    btn.x = btnOrigX - (btnW * (scale - 1)) / 2
    btn.y = btnOrigY - (btnH * (scale - 1)) / 2
    text.scaleX = scale
    text.scaleY = scale
    text.x = textOrigX - (btnW * (scale - 1)) / 2
    text.y = textOrigY - (btnH * (scale - 1)) / 2

    if (t >= 1 && state.zoomOutInterval) {
      jsmaf.clearInterval(state.zoomOutInterval)
      state.zoomOutInterval = null
    }
  }, step)
}

// === Highlight Management ===

function ui_updateHighlight (state: UIMenuState): void {
  const theme = themes_getTheme()

  // Animate out the previous button
  if (state.prevButton >= 0 && state.prevButton !== state.currentButton) {
    const prevBtn = state.buttons[state.prevButton]
    const prevMarker = state.buttonMarkers[state.prevButton]
    if (prevBtn) {
      prevBtn.url = UI_NORMAL_BTN
      prevBtn.alpha = 0.7
      prevBtn.borderColor = 'transparent'
      prevBtn.borderWidth = 0
      if (prevMarker) prevMarker.visible = false
      ui_animateZoomOut(state, state.prevButton)
    }
  }

  // Set styles for all buttons
  for (let i = 0; i < state.buttons.length; i++) {
    const button = state.buttons[i]
    const buttonMarker = state.buttonMarkers[i]
    const buttonText = state.buttonTexts[i]
    const origPos = state.buttonOrigPos[i]
    const tOrigPos = state.textOrigPos[i]
    if (button === undefined || buttonText === undefined || origPos === undefined || tOrigPos === undefined) continue

    if (i === state.currentButton) {
      button.url = UI_SELECTED_BTN
      button.alpha = 1.0
      button.borderColor = theme.borderColor
      button.borderWidth = 3
      if (buttonMarker) buttonMarker.visible = true
      ui_animateZoomIn(state, i)
    } else if (i !== state.prevButton) {
      button.url = UI_NORMAL_BTN
      button.alpha = 0.7
      button.borderColor = 'transparent'
      button.borderWidth = 0
      button.scaleX = 1.0
      button.scaleY = 1.0
      button.x = origPos.x
      button.y = origPos.y
      buttonText.scaleX = 1.0
      buttonText.scaleY = 1.0
      buttonText.x = tOrigPos.x
      buttonText.y = tOrigPos.y
      if (buttonMarker) buttonMarker.visible = false
    }
  }

  state.prevButton = state.currentButton
}

// === Navigation ===

function ui_handleVerticalNav (state: UIMenuState, keyCode: number): boolean {
  if (keyCode === 6 || keyCode === 5) { // Down or Right
    state.currentButton = (state.currentButton + 1) % state.buttons.length
    sfx_playNav()
    ui_updateHighlight(state)
    return true
  } else if (keyCode === 4 || keyCode === 7) { // Up or Left
    state.currentButton = (state.currentButton - 1 + state.buttons.length) % state.buttons.length
    sfx_playNav()
    ui_updateHighlight(state)
    return true
  }
  return false
}

// === Utility: Add a standard button to a menu state ===

function ui_addButton (
  state: UIMenuState,
  label: string,
  imgKey: string,
  x: number,
  y: number
): void {
  const button = new Image({
    url: UI_NORMAL_BTN,
    x: x,
    y: y,
    width: state.buttonWidth,
    height: state.buttonHeight
  })
  state.buttons.push(button)
  jsmaf.root.children.push(button)

  const marker = new Image({
    url: UI_MARKER_IMG,
    x: x + state.buttonWidth - 50,
    y: y + 35,
    width: 12,
    height: 12,
    visible: false
  })
  state.buttonMarkers.push(marker)
  jsmaf.root.children.push(marker)

  let btnText: Image | jsmaf.Text
  if (useImageText) {
    btnText = new Image({
      url: textImageBase + imgKey + '.png',
      x: x + 20,
      y: y + 15,
      width: 300,
      height: 50
    })
  } else {
    btnText = new jsmaf.Text()
    btnText.text = label
    btnText.x = x + state.buttonWidth / 2 - (label.length * 5)
    btnText.y = y + state.buttonHeight / 2 - 12
    btnText.style = 'white'
  }
  state.buttonTexts.push(btnText)
  jsmaf.root.children.push(btnText)

  state.buttonOrigPos.push({ x: x, y: y })
  state.textOrigPos.push({ x: btnText.x, y: btnText.y })
}

// === Loading indicator ===

function ui_showLoading (text?: string): jsmaf.Text {
  const loadingText = new jsmaf.Text()
  loadingText.text = text || 'Loading...'
  loadingText.x = 860
  loadingText.y = 520
  loadingText.style = 'accent'
  jsmaf.root.children.push(loadingText)
  return loadingText
}

// === Progress bar ===

function ui_createProgressBar (x: number, y: number, width: number, height: number): { bg: Image, fill: Image, text: jsmaf.Text, update: (progress: number) => void } {
  const theme = themes_getTheme()

  const bg = new Image({
    url: UI_NORMAL_BTN,
    x: x,
    y: y,
    width: width,
    height: height
  })
  bg.alpha = 0.3
  jsmaf.root.children.push(bg)

  const fill = new Image({
    url: UI_NORMAL_BTN,
    x: x,
    y: y,
    width: 1,
    height: height
  })
  fill.alpha = 0.8
  fill.borderColor = theme.accent
  fill.borderWidth = 1
  jsmaf.root.children.push(fill)

  const text = new jsmaf.Text()
  text.text = '0%'
  text.x = x + width / 2 - 15
  text.y = y + height / 2 - 12
  text.style = 'white'
  jsmaf.root.children.push(text)

  return {
    bg: bg,
    fill: fill,
    text: text,
    update: function (progress: number) {
      const p = Math.max(0, Math.min(1, progress))
      fill.width = Math.max(1, Math.floor(width * p))
      text.text = Math.floor(p * 100) + '%'
    }
  }
}

export {
  UI_NORMAL_BTN,
  UI_SELECTED_BTN,
  UI_BG_IMG,
  UI_LOGO_IMG,
  UI_MARKER_IMG,
  ui_initScreen,
  ui_addBackground,
  ui_addLogo,
  ui_addTitle,
  ui_playMusic,
  ui_fadeIn,
  ui_fadeOut,
  ui_addStatusBar,
  ui_createMenuState,
  ui_easeInOut,
  ui_animateZoomIn,
  ui_animateZoomOut,
  ui_updateHighlight,
  ui_handleVerticalNav,
  ui_addButton,
  ui_showLoading,
  ui_createProgressBar
}

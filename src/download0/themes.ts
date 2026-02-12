// themes.ts - Color theme system for Vue-After-Free
// Provides 5 selectable color themes that affect UI accent colors

export interface Theme {
  name: string
  accent: string        // Primary accent color (CSS)
  accentRGB: string     // RGB for borders/glow
  highlight: string     // Button highlight color
  borderColor: string   // Selected button border
  textColor: string     // Primary text color
  dimColor: string      // Dimmed/secondary text
  successColor: string  // Success indicator
  errorColor: string    // Error/fail indicator
}

export const THEMES: Theme[] = [
  {
    name: 'Cyber Blue',
    accent: 'rgb(100,180,255)',
    accentRGB: 'rgb(100,180,255)',
    highlight: 'rgb(60,140,220)',
    borderColor: 'rgb(100,180,255)',
    textColor: 'white',
    dimColor: 'rgb(160,180,200)',
    successColor: 'rgb(80,220,120)',
    errorColor: 'rgb(255,80,80)'
  },
  {
    name: 'Neon Green',
    accent: 'rgb(0,255,100)',
    accentRGB: 'rgb(0,255,100)',
    highlight: 'rgb(0,200,80)',
    borderColor: 'rgb(0,255,100)',
    textColor: 'rgb(220,255,220)',
    dimColor: 'rgb(120,180,120)',
    successColor: 'rgb(0,255,120)',
    errorColor: 'rgb(255,60,60)'
  },
  {
    name: 'Purple Haze',
    accent: 'rgb(180,100,255)',
    accentRGB: 'rgb(180,100,255)',
    highlight: 'rgb(140,60,220)',
    borderColor: 'rgb(180,100,255)',
    textColor: 'rgb(230,210,255)',
    dimColor: 'rgb(160,140,200)',
    successColor: 'rgb(120,220,160)',
    errorColor: 'rgb(255,80,120)'
  },
  {
    name: 'Gold Elite',
    accent: 'rgb(255,200,50)',
    accentRGB: 'rgb(255,200,50)',
    highlight: 'rgb(220,170,30)',
    borderColor: 'rgb(255,200,50)',
    textColor: 'rgb(255,245,220)',
    dimColor: 'rgb(180,160,120)',
    successColor: 'rgb(100,220,100)',
    errorColor: 'rgb(255,100,60)'
  },
  {
    name: 'Crimson',
    accent: 'rgb(255,60,80)',
    accentRGB: 'rgb(255,60,80)',
    highlight: 'rgb(220,40,60)',
    borderColor: 'rgb(255,60,80)',
    textColor: 'rgb(255,220,220)',
    dimColor: 'rgb(200,140,140)',
    successColor: 'rgb(80,220,120)',
    errorColor: 'rgb(255,50,50)'
  }
]

// Current active theme index (default: 0 = Cyber Blue)
var currentThemeIndex = 0

function themes_setTheme (index: number): void {
  if (index >= 0 && index < THEMES.length) {
    currentThemeIndex = index
    log('[THEME] Set theme to: ' + THEMES[index]!.name)
  }
}

function themes_getTheme (): Theme {
  return THEMES[currentThemeIndex] || THEMES[0]!
}

function themes_getIndex (): number {
  return currentThemeIndex
}

function themes_getCount (): number {
  return THEMES.length
}

function themes_getNames (): string[] {
  return THEMES.map(function (t) { return t.name })
}

export {
  themes_setTheme,
  themes_getTheme,
  themes_getIndex,
  themes_getCount,
  themes_getNames
}


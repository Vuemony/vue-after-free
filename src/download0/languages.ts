// Language translations
// Detected locale: jsmaf.locale

export const lang: Record<string, string> = {
  jailbreak: 'Jailbreak',
  payloadMenu: 'Payload Menu',
  config: 'Config',
  exit: 'Exit',
  back: 'Back',
  autoLapse: 'Auto Lapse',
  autoPoop: 'Auto Poop',
  autoClose: 'Auto Close',
  music: 'Music',
  jbBehavior: 'JB Behavior',
  jbBehaviorAuto: 'Auto Detect',
  jbBehaviorNetctrl: 'NetControl',
  jbBehaviorLapse: 'Lapse',
  loadingMainMenu: 'Loading main menu...',
  mainMenuLoaded: 'Main menu loaded',
  loadingConfig: 'Loading config UI...',
  configLoaded: 'Config UI loaded',
  theme: 'Theme'
}

export let useImageText = false
export let textImageBase = ''

const detectedLocale = jsmaf.locale || 'en'
log('Detected locale: ' + detectedLocale)

const IMAGE_TEXT_LOCALES = ['ar', 'ja', 'ko', 'zh']
if (IMAGE_TEXT_LOCALES.includes(detectedLocale)) {
  useImageText = true
  textImageBase = 'file:///../download0/img/text/' + detectedLocale + '/'
}

switch (detectedLocale) {
  case 'es':
  case 'es-ES':
  case 'es-CL':
  case 'es-419':
  case 'es-MX':
  case 'es-AR':
    // Spanish
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu de Payloads'
    lang.config = 'Configuracion'
    lang.exit = 'Salir'
    lang.back = 'Volver'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Cerrar'
    lang.music = 'Musica'
    lang.jbBehavior = 'Comportamiento JB'
    lang.jbBehaviorAuto = 'Auto Detectar'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = 'Cargando menu principal...'
    lang.mainMenuLoaded = 'Menu principal cargado'
    lang.loadingConfig = 'Cargando configuracion...'
    lang.configLoaded = 'Configuracion cargada'
    lang.theme = 'Tema'
    break
    // vue doesnt have these locales in the fonts for asian and arabic languages. need to figure out how to load custom font . please reference /app0/assets/font/ for examples
    // ~ case 'ar':
    // ~ // Arabic
    // ~ lang.jailbreak = 'Jailbreak'
    // ~ lang.payloadMenu = 'قائمة الحمولة'
    // ~ lang.config = 'الاعدادات'
    // ~ lang.exit = 'خروج'
    // ~ lang.back = 'رجوع'
    // ~ lang.autoLapse = 'Auto Lapse'
    // ~ lang.autoPoop = 'Auto Poop'
    // ~ lang.autoClose = 'اغلاق تلقائي'
    // ~ lang.loadingMainMenu = '...جاري تحميل القائمة الرئيسية'
    // ~ lang.mainMenuLoaded = 'تم تحميل القائمة الرئيسية'
    // ~ lang.loadingConfig = '...جاري تحميل الاعدادات'
    // ~ lang.configLoaded = 'تم تحميل الاعدادات'
    // ~ break

    // ~ case 'ko':
    // ~ // Korean
    // ~ lang.jailbreak = '탈옥'
    // ~ lang.payloadMenu = '페이로드 메뉴'
    // ~ lang.config = '설정'
    // ~ lang.exit = '종료'
    // ~ lang.back = '뒤로'
    // ~ lang.autoLapse = '자동 Lapse'
    // ~ lang.autoPoop = '자동 Poop'
    // ~ lang.autoClose = '자동 닫기'
    // ~ lang.loadingMainMenu = '메인 메뉴 로딩중...'
    // ~ lang.mainMenuLoaded = '메인 메뉴 로딩 완료'
    // ~ lang.loadingConfig = '설정 로딩중...'
    // ~ lang.configLoaded = '설정 로딩 완료'
    // ~ break

    // ~ case 'ja':
    // ~ // Japanese
    // ~ lang.jailbreak = '脱獄'
    // ~ lang.payloadMenu = 'ペイロードメニュー'
    // ~ lang.config = '設定'
    // ~ lang.exit = '終了'
    // ~ lang.back = '戻る'
    // ~ lang.autoLapse = '自動Lapse'
    // ~ lang.autoPoop = '自動Poop'
    // ~ lang.autoClose = '自動終了'
    // ~ lang.loadingMainMenu = 'メインメニュー読み込み中...'
    // ~ lang.mainMenuLoaded = 'メインメニュー読み込み完了'
    // ~ lang.loadingConfig = '設定読み込み中...'
    // ~ lang.configLoaded = '設定読み込み完了'
    // ~ break

  case 'pt':
    // Portuguese
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu de Payloads'
    lang.config = 'Configuracao'
    lang.exit = 'Sair'
    lang.back = 'Voltar'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Fechar Auto'
    lang.music = 'Musica'
    lang.jbBehavior = 'Comportamento JB'
    lang.jbBehaviorAuto = 'Auto Detectar'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = 'Carregando menu principal...'
    lang.mainMenuLoaded = 'Menu principal carregado'
    lang.loadingConfig = 'Carregando configuracao...'
    lang.configLoaded = 'Configuracao carregada'
    lang.theme = 'Tema'
    break

  case 'fr':
    // French
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu Payload'
    lang.config = 'Configuration'
    lang.exit = 'Quitter'
    lang.back = 'Retour'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Fermer Auto'
    lang.music = 'Musique'
    lang.jbBehavior = 'Comportement JB'
    lang.jbBehaviorAuto = 'Auto Detecter'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = 'Chargement du menu principal...'
    lang.mainMenuLoaded = 'Menu principal charge'
    lang.loadingConfig = 'Chargement de la configuration...'
    lang.configLoaded = 'Configuration chargee'
    lang.theme = 'Thème'
    break

  case 'de':
    // German
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Payload Menu'
    lang.config = 'Einstellungen'
    lang.exit = 'Beenden'
    lang.back = 'Zuruck'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Schliessen'
    lang.music = 'Musik'
    lang.jbBehavior = 'JB Verhalten'
    lang.jbBehaviorAuto = 'Auto Erkennen'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = 'Hauptmenu wird geladen...'
    lang.mainMenuLoaded = 'Hauptmenu geladen'
    lang.loadingConfig = 'Einstellungen werden geladen...'
    lang.configLoaded = 'Einstellungen geladen'
    lang.theme = 'Thema'
    break

  case 'it':
    // Italian
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu Payload'
    lang.config = 'Configurazione'
    lang.exit = 'Esci'
    lang.back = 'Indietro'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Chiudi Auto'
    lang.music = 'Musica'
    lang.jbBehavior = 'Comportamento JB'
    lang.jbBehaviorAuto = 'Auto Rileva'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = 'Caricamento menu principale...'
    lang.mainMenuLoaded = 'Menu principale caricato'
    lang.loadingConfig = 'Caricamento configurazione...'
    lang.configLoaded = 'Configurazione caricata'
    lang.theme = 'Tema'
    break

  case 'nl':
    // Dutch
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Payload Menu'
    lang.config = 'Instellingen'
    lang.exit = 'Afsluiten'
    lang.back = 'Terug'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Sluiten'
    lang.music = 'Muziek'
    lang.jbBehavior = 'JB Gedrag'
    lang.jbBehaviorAuto = 'Auto Detectie'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = 'Hoofdmenu laden...'
    lang.mainMenuLoaded = 'Hoofdmenu geladen'
    lang.loadingConfig = 'Instellingen laden...'
    lang.configLoaded = 'Instellingen geladen'
    lang.theme = 'Thema'
    break

  case 'pl':
    // Polish
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu Payload'
    lang.config = 'Konfiguracja'
    lang.exit = 'Wyjscie'
    lang.back = 'Wstecz'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Zamknij'
    lang.music = 'Muzyka'
    lang.jbBehavior = 'Zachowanie JB'
    lang.jbBehaviorAuto = 'Auto Wykryj'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = 'Ladowanie menu glownego...'
    lang.mainMenuLoaded = 'Menu glowne zaladowane'
    lang.loadingConfig = 'Ladowanie konfiguracji...'
    lang.configLoaded = 'Konfiguracja zaladowana'
    lang.theme = 'Motyw'
    break

  case 'tr':
    // Turkish
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Payload Menusu'
    lang.config = 'Ayarlar'
    lang.exit = 'Cikis'
    lang.back = 'Geri'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Otomatik Kapat'
    lang.music = 'Muzik'
    lang.jbBehavior = 'JB Davranisi'
    lang.jbBehaviorAuto = 'Otomatik Algilama'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = 'Ana menu yukleniyor...'
    lang.mainMenuLoaded = 'Ana menu yuklendi'
    lang.loadingConfig = 'Ayarlar yukleniyor...'
    lang.configLoaded = 'Ayarlar yuklendi'
    lang.theme = 'Tema'
    break

  case 'ar':
    // Arabic
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'قائمة الحمولة'
    lang.config = 'الاعدادات'
    lang.exit = 'خروج'
    lang.back = 'رجوع'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'اغلاق تلقائي'
    lang.music = 'موسيقى'
    lang.jbBehavior = 'سلوك JB'
    lang.jbBehaviorAuto = 'كشف تلقائي'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = 'جاري تحميل القائمة الرئيسية...'
    lang.mainMenuLoaded = 'تم تحميل القائمة الرئيسية'
    lang.loadingConfig = 'جاري تحميل الاعدادات...'
    lang.configLoaded = 'تم تحميل الاعدادات'
    lang.theme = 'سمة'
    break

  case 'ja':
    // Japanese
    lang.jailbreak = '脱獄'
    lang.payloadMenu = 'ペイロードメニュー'
    lang.config = '設定'
    lang.exit = '終了'
    lang.back = '戻る'
    lang.autoLapse = '自動Lapse'
    lang.autoPoop = '自動Poop'
    lang.autoClose = '自動終了'
    lang.music = '音楽'
    lang.jbBehavior = 'JB動作'
    lang.jbBehaviorAuto = '自動検出'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = 'メインメニュー読み込み中...'
    lang.mainMenuLoaded = 'メインメニュー読み込み完了'
    lang.loadingConfig = '設定読み込み中...'
    lang.configLoaded = '設定読み込み完了'
    lang.theme = 'テーマ'
    break

  case 'ko':
    // Korean
    lang.jailbreak = '탈옥'
    lang.payloadMenu = '페이로드 메뉴'
    lang.config = '설정'
    lang.exit = '종료'
    lang.back = '뒤로'
    lang.autoLapse = '자동 Lapse'
    lang.autoPoop = '자동 Poop'
    lang.autoClose = '자동 닫기'
    lang.music = '음악'
    lang.jbBehavior = 'JB 동작'
    lang.jbBehaviorAuto = '자동 감지'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = '메인 메뉴 로딩중...'
    lang.mainMenuLoaded = '메인 메뉴 로딩 완료'
    lang.loadingConfig = '설정 로딩중...'
    lang.configLoaded = '설정 로딩 완료'
    lang.theme = '테마'
    break

  case 'zh':
    // Chinese
    lang.jailbreak = '越狱'
    lang.payloadMenu = '载荷菜单'
    lang.config = '设置'
    lang.exit = '退出'
    lang.back = '返回'
    lang.autoLapse = '自动Lapse'
    lang.autoPoop = '自动Poop'
    lang.autoClose = '自动关闭'
    lang.music = '音乐'
    lang.jbBehavior = 'JB行为'
    lang.jbBehaviorAuto = '自动检测'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.loadingMainMenu = '正在加载主菜单...'
    lang.mainMenuLoaded = '主菜单已加载'
    lang.loadingConfig = '正在加载设置...'
    lang.configLoaded = '设置已加载'
    lang.theme = '主题'
    break

  case 'en':
  default:
    // English (default) which is already set
    break
}

log('Language loaded: ' + detectedLocale)

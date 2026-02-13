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
  jbBehavior: 'JB Behavior',
  jbBehaviorAuto: 'Auto Detect',
  jbBehaviorNetctrl: 'NetControl',
  jbBehaviorLapse: 'Lapse',
  totalAttempts: 'Total Attempts: ',
  successes: 'Successes: ',
  failures: 'Failures: ',
  successRate: 'Success Rate: ',
  failureRate: 'Failure Rate: ',
  loadingMainMenu: 'Loading main menu...',
  mainMenuLoaded: 'Main menu loaded',
  loadingConfig: 'Loading config UI...',
  configLoaded: 'Config UI loaded'
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
    // Spanish
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu de Payloads'
    lang.config = 'Configuracion'
    lang.exit = 'Salir'
    lang.back = 'Volver'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Cerrar'
    lang.jbBehavior = 'Comportamiento JB'
    lang.jbBehaviorAuto = 'Auto Detectar'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = 'Intentos Totales: '
    lang.successes = 'Exitos: '
    lang.failures = 'Fallos: '
    lang.successRate = 'Tasa de Exito: '
    lang.failureRate = 'Tasa de Fallo: '
    lang.loadingMainMenu = 'Cargando menu principal...'
    lang.mainMenuLoaded = 'Menu principal cargado'
    lang.loadingConfig = 'Cargando configuracion...'
    lang.configLoaded = 'Configuracion cargada'
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
    // ~ lang.totalAttempts = 'اجمالي المحاولات: '
    // ~ lang.successes = 'النجاحات: '
    // ~ lang.failures = 'الاخفاقات: '
    // ~ lang.successRate = 'معدل النجاح: '
    // ~ lang.failureRate = 'معدل الفشل: '
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
    // ~ lang.totalAttempts = '총 시도: '
    // ~ lang.successes = '성공: '
    // ~ lang.failures = '실패: '
    // ~ lang.successRate = '성공률: '
    // ~ lang.failureRate = '실패율: '
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
    // ~ lang.totalAttempts = '試行回数: '
    // ~ lang.successes = '成功: '
    // ~ lang.failures = '失敗: '
    // ~ lang.successRate = '成功率: '
    // ~ lang.failureRate = '失敗率: '
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
    lang.jbBehavior = 'Comportamento JB'
    lang.jbBehaviorAuto = 'Auto Detectar'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = 'Total de Tentativas: '
    lang.successes = 'Sucessos: '
    lang.failures = 'Falhas: '
    lang.successRate = 'Taxa de Sucesso: '
    lang.failureRate = 'Taxa de Falha: '
    lang.loadingMainMenu = 'Carregando menu principal...'
    lang.mainMenuLoaded = 'Menu principal carregado'
    lang.loadingConfig = 'Carregando configuracao...'
    lang.configLoaded = 'Configuracao carregada'
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
    lang.jbBehavior = 'Comportement JB'
    lang.jbBehaviorAuto = 'Auto Detecter'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = 'Tentatives Totales: '
    lang.successes = 'Succes: '
    lang.failures = 'Echecs: '
    lang.successRate = 'Taux de Succes: '
    lang.failureRate = 'Taux Echec: '
    lang.loadingMainMenu = 'Chargement du menu principal...'
    lang.mainMenuLoaded = 'Menu principal charge'
    lang.loadingConfig = 'Chargement de la configuration...'
    lang.configLoaded = 'Configuration chargee'
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
    lang.jbBehavior = 'JB Verhalten'
    lang.jbBehaviorAuto = 'Auto Erkennen'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = 'Gesamtversuche: '
    lang.successes = 'Erfolge: '
    lang.failures = 'Fehlschlage: '
    lang.successRate = 'Erfolgsrate: '
    lang.failureRate = 'Fehlerrate: '
    lang.loadingMainMenu = 'Hauptmenu wird geladen...'
    lang.mainMenuLoaded = 'Hauptmenu geladen'
    lang.loadingConfig = 'Einstellungen werden geladen...'
    lang.configLoaded = 'Einstellungen geladen'
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
    lang.jbBehavior = 'Comportamento JB'
    lang.jbBehaviorAuto = 'Auto Rileva'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = 'Tentativi Totali: '
    lang.successes = 'Successi: '
    lang.failures = 'Fallimenti: '
    lang.successRate = 'Tasso di Successo: '
    lang.failureRate = 'Tasso di Fallimento: '
    lang.loadingMainMenu = 'Caricamento menu principale...'
    lang.mainMenuLoaded = 'Menu principale caricato'
    lang.loadingConfig = 'Caricamento configurazione...'
    lang.configLoaded = 'Configurazione caricata'
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
    lang.jbBehavior = 'JB Gedrag'
    lang.jbBehaviorAuto = 'Auto Detectie'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = 'Totaal Pogingen: '
    lang.successes = 'Successen: '
    lang.failures = 'Mislukkingen: '
    lang.successRate = 'Succespercentage: '
    lang.failureRate = 'Faalpercentage: '
    lang.loadingMainMenu = 'Hoofdmenu laden...'
    lang.mainMenuLoaded = 'Hoofdmenu geladen'
    lang.loadingConfig = 'Instellingen laden...'
    lang.configLoaded = 'Instellingen geladen'
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
    lang.jbBehavior = 'Zachowanie JB'
    lang.jbBehaviorAuto = 'Auto Wykryj'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = 'Laczna Liczba Prob: '
    lang.successes = 'Sukcesy: '
    lang.failures = 'Niepowodzenia: '
    lang.successRate = 'Wskaznik Sukcesu: '
    lang.failureRate = 'Wskaznik Bledow: '
    lang.loadingMainMenu = 'Ladowanie menu glownego...'
    lang.mainMenuLoaded = 'Menu glowne zaladowane'
    lang.loadingConfig = 'Ladowanie konfiguracji...'
    lang.configLoaded = 'Konfiguracja zaladowana'
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
    lang.jbBehavior = 'JB Davranisi'
    lang.jbBehaviorAuto = 'Otomatik Algilama'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = 'Toplam Deneme: '
    lang.successes = 'Basarilar: '
    lang.failures = 'Basarisizliklar: '
    lang.successRate = 'Basari Orani: '
    lang.failureRate = 'Basarisizlik Orani: '
    lang.loadingMainMenu = 'Ana menu yukleniyor...'
    lang.mainMenuLoaded = 'Ana menu yuklendi'
    lang.loadingConfig = 'Ayarlar yukleniyor...'
    lang.configLoaded = 'Ayarlar yuklendi'
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
    lang.jbBehavior = 'سلوك JB'
    lang.jbBehaviorAuto = 'كشف تلقائي'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = 'اجمالي المحاولات: '
    lang.successes = 'النجاحات: '
    lang.failures = 'الاخفاقات: '
    lang.successRate = 'معدل النجاح: '
    lang.failureRate = 'معدل الفشل: '
    lang.loadingMainMenu = 'جاري تحميل القائمة الرئيسية...'
    lang.mainMenuLoaded = 'تم تحميل القائمة الرئيسية'
    lang.loadingConfig = 'جاري تحميل الاعدادات...'
    lang.configLoaded = 'تم تحميل الاعدادات'
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
    lang.jbBehavior = 'JB動作'
    lang.jbBehaviorAuto = '自動検出'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = '試行回数: '
    lang.successes = '成功: '
    lang.failures = '失敗: '
    lang.successRate = '成功率: '
    lang.failureRate = '失敗率: '
    lang.loadingMainMenu = 'メインメニュー読み込み中...'
    lang.mainMenuLoaded = 'メインメニュー読み込み完了'
    lang.loadingConfig = '設定読み込み中...'
    lang.configLoaded = '設定読み込み完了'
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
    lang.jbBehavior = 'JB 동작'
    lang.jbBehaviorAuto = '자동 감지'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = '총 시도: '
    lang.successes = '성공: '
    lang.failures = '실패: '
    lang.successRate = '성공률: '
    lang.failureRate = '실패율: '
    lang.loadingMainMenu = '메인 메뉴 로딩중...'
    lang.mainMenuLoaded = '메인 메뉴 로딩 완료'
    lang.loadingConfig = '설정 로딩중...'
    lang.configLoaded = '설정 로딩 완료'
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
    lang.jbBehavior = 'JB行为'
    lang.jbBehaviorAuto = '自动检测'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.totalAttempts = '总尝试次数: '
    lang.successes = '成功: '
    lang.failures = '失败: '
    lang.successRate = '成功率: '
    lang.failureRate = '失败率: '
    lang.loadingMainMenu = '正在加载主菜单...'
    lang.mainMenuLoaded = '主菜单已加载'
    lang.loadingConfig = '正在加载设置...'
    lang.configLoaded = '设置已加载'
    break

  case 'en':
  default:
    // English (default) which is already set
    break
}

log('Language loaded: ' + detectedLocale)

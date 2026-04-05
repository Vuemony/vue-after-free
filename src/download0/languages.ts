// Language translations
// Detected locale: jsmaf.locale

export const lang: Record<string, string> = {
  jailbreak: 'Jailbreak',
  payloadMenu: 'Payload Menu',
  config: 'Config',
  exit: 'Exit',
  autoLapse: 'Auto Lapse',
  autoPoop: 'Auto Poop',
  autoClose: 'Auto Close',
  jbBehavior: 'JB Behavior',
  jbBehaviorAuto: 'Auto Detect',
  jbBehaviorNetctrl: 'NetControl',
  jbBehaviorLapse: 'Lapse',
  theme: 'Theme',
  xToGoBack: 'X to go back',
  oToGoBack: 'O to go back'
}

export let useImageText = false
export let textImageBase = ''

let detectedLocale = jsmaf.locale
if (!detectedLocale) {
  detectedLocale = 'ar'
}


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
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Cerrar'
    lang.jbBehavior = 'Comportamiento JB'
    lang.jbBehaviorAuto = 'Auto Detectar'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Tema'
    lang.xToGoBack = 'X para volver'
    lang.oToGoBack = 'O para volver'
    break

  case 'pt':
    // Portuguese
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu de Payloads'
    lang.config = 'Configuracao'
    lang.exit = 'Sair'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Fechar Auto'
    lang.jbBehavior = 'Comportamento JB'
    lang.jbBehaviorAuto = 'Auto Detectar'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Tema'
    lang.xToGoBack = 'X para voltar'
    lang.oToGoBack = 'O para voltar'
    break

  case 'fr':
    // French
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu Payload'
    lang.config = 'Configuration'
    lang.exit = 'Quitter'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Fermer Auto'
    lang.jbBehavior = 'Comportement JB'
    lang.jbBehaviorAuto = 'Auto Detecter'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Thème'
    lang.xToGoBack = 'X pour retourner'
    lang.oToGoBack = 'O pour retourner'
    break

  case 'de':
    // German
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Payload Menu'
    lang.config = 'Einstellungen'
    lang.exit = 'Beenden'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Schliessen'
    lang.jbBehavior = 'JB Verhalten'
    lang.jbBehaviorAuto = 'Auto Erkennen'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Thema'
    lang.xToGoBack = 'X für Zurueck'
    lang.oToGoBack = 'O für Zurueck'
    break

  case 'it':
    // Italian
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu Payload'
    lang.config = 'Configurazione'
    lang.exit = 'Esci'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Chiudi Auto'
    lang.jbBehavior = 'Comportamento JB'
    lang.jbBehaviorAuto = 'Auto Rileva'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Tema'
    lang.xToGoBack = 'X per tornare indietro'
    lang.oToGoBack = 'O per tornare indietro'
    break

  case 'nl':
    // Dutch
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Payload Menu'
    lang.config = 'Instellingen'
    lang.exit = 'Afsluiten'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Sluiten'
    lang.jbBehavior = 'JB Gedrag'
    lang.jbBehaviorAuto = 'Auto Detectie'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Thema'
    lang.xToGoBack = 'X om terug te gaan'
    lang.oToGoBack = 'O om terug te gaan'
    break

  case 'pl':
    // Polish
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu Payload'
    lang.config = 'Konfiguracja'
    lang.exit = 'Wyjscie'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Zamknij'
    lang.jbBehavior = 'Zachowanie JB'
    lang.jbBehaviorAuto = 'Auto Wykryj'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Motyw'
    lang.xToGoBack = 'X aby wrocic'
    lang.oToGoBack = 'O aby wrocic'
    break

  case 'tr':
    // Turkish
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Payload Menusu'
    lang.config = 'Ayarlar'
    lang.exit = 'Cikis'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Otomatik Kapat'
    lang.jbBehavior = 'JB Davranisi'
    lang.jbBehaviorAuto = 'Otomatik Algilama'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Tema'
    lang.xToGoBack = 'Geri gitmek icin X'
    lang.oToGoBack = 'Geri gitmek icin O'
    break

  case 'ar':
    // Arabic
    lang.jailbreak = 'كسر الحماية'
    lang.payloadMenu = 'قائمة الحمولة'
    lang.config = 'الاعدادات'
    lang.exit = 'خروج'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'اغلاق تلقائي'
    lang.jbBehavior = 'نوع التهكير'
    lang.jbBehaviorAuto = 'كشف تلقائي'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'سمة'
    lang.xToGoBack = 'X للرجوع'
    lang.oToGoBack = 'O للرجوع'
    break

  case 'ja':
    // Japanese
    lang.jailbreak = '脱獄'
    lang.payloadMenu = 'ペイロードメニュー'
    lang.config = '設定'
    lang.exit = '終了'
    lang.autoLapse = '自動Lapse'
    lang.autoPoop = '自動Poop'
    lang.autoClose = '自動終了'
    lang.jbBehavior = 'JB動作'
    lang.jbBehaviorAuto = '自動検出'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'テーマ'
    lang.xToGoBack = 'Xで戻る'
    lang.oToGoBack = 'Oで戻る'
    break

  case 'ko':
    // Korean
    lang.jailbreak = '탈옥'
    lang.payloadMenu = '페이로드 메뉴'
    lang.config = '설정'
    lang.exit = '종료'
    lang.autoLapse = '자동 Lapse'
    lang.autoPoop = '자동 Poop'
    lang.autoClose = '자동 닫기'
    lang.jbBehavior = 'JB 동작'
    lang.jbBehaviorAuto = '자동 감지'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = '테마'
    lang.xToGoBack = 'X로 뒤로 가기'
    lang.oToGoBack = 'O로 뒤로 가기'
    break

  case 'zh':
    // Chinese
    lang.jailbreak = '越狱'
    lang.payloadMenu = '载荷菜单'
    lang.config = '设置'
    lang.exit = '退出'
    lang.autoLapse = '自动Lapse'
    lang.autoPoop = '自动Poop'
    lang.autoClose = '自动关闭'
    lang.jbBehavior = 'JB行为'
    lang.jbBehaviorAuto = '自动检测'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = '主题'
    lang.xToGoBack = '按 X 返回'
    lang.oToGoBack = '按 O 返回'
    break

  case 'en':
  default:
    // English (default) which is already set
    break
}


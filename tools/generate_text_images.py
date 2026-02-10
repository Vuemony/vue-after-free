#!/usr/bin/env python3
"""
Generate text images for UI buttons and titles.
Only for Asian and Arabic languages that lack font support.
"""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = "../src/download0/img/text"

# Match existing button text image dimensions
IMAGE_WIDTH = 500
IMAGE_HEIGHT = 100
FONT_SIZE_BUTTON = 48
FONT_SIZE_TITLE = 64
TEXT_COLOR = (255, 255, 255, 255)

FONTS = {
    'ar': '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    'ja': '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    'ko': '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    'zh': '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
}

TRANSLATIONS = {
    'ar': {
        'jailbreak': 'Jailbreak',
        'payloadMenu': 'قائمة الحمولة',
        'config': 'الاعدادات',
        'exit': 'خروج',
        'back': 'رجوع',
        'autoLapse': 'Auto Lapse',
        'autoPoop': 'Auto Poop',
        'autoClose': 'اغلاق تلقائي',
        'music': 'موسيقى',
        'usbScan': 'فحص USB',
        'jbBehavior': 'سلوك JB',
        'jbBehaviorAuto': 'كشف تلقائي',
        'jbBehaviorNetctrl': 'NetControl',
        'jbBehaviorLapse': 'Lapse',
        'totalAttempts': 'اجمالي المحاولات: ',
        'successes': 'النجاحات: ',
        'failures': 'الاخفاقات: ',
        'successRate': 'معدل النجاح: ',
        'failureRate': 'معدل الفشل: ',
    },
    'ja': {
        'jailbreak': '脱獄',
        'payloadMenu': 'ペイロードメニュー',
        'config': '設定',
        'exit': '終了',
        'back': '戻る',
        'autoLapse': '自動Lapse',
        'autoPoop': '自動Poop',
        'autoClose': '自動終了',
        'music': '音楽',
        'usbScan': 'USBスキャン',
        'jbBehavior': 'JB動作',
        'jbBehaviorAuto': '自動検出',
        'jbBehaviorNetctrl': 'NetControl',
        'jbBehaviorLapse': 'Lapse',
        'totalAttempts': '試行回数: ',
        'successes': '成功: ',
        'failures': '失敗: ',
        'successRate': '成功率: ',
        'failureRate': '失敗率: ',
    },
    'ko': {
        'jailbreak': '탈옥',
        'payloadMenu': '페이로드 메뉴',
        'config': '설정',
        'exit': '종료',
        'back': '뒤로',
        'autoLapse': '자동 Lapse',
        'autoPoop': '자동 Poop',
        'autoClose': '자동 닫기',
        'music': '음악',
        'usbScan': 'USB 스캔',
        'jbBehavior': 'JB 동작',
        'jbBehaviorAuto': '자동 감지',
        'jbBehaviorNetctrl': 'NetControl',
        'jbBehaviorLapse': 'Lapse',
        'totalAttempts': '총 시도: ',
        'successes': '성공: ',
        'failures': '실패: ',
        'successRate': '성공률: ',
        'failureRate': '실패율: ',
    },
    'zh': {
        'jailbreak': '越狱',
        'payloadMenu': '载荷菜单',
        'config': '设置',
        'exit': '退出',
        'back': '返回',
        'autoLapse': '自动Lapse',
        'autoPoop': '自动Poop',
        'autoClose': '自动关闭',
        'music': '音乐',
        'usbScan': 'USB 扫描',
        'jbBehavior': 'JB行为',
        'jbBehaviorAuto': '自动检测',
        'jbBehaviorNetctrl': 'NetControl',
        'jbBehaviorLapse': 'Lapse',
        'totalAttempts': '总尝试次数: ',
        'successes': '成功: ',
        'failures': '失败: ',
        'successRate': '成功率: ',
        'failureRate': '失败率: ',
    },
}


def get_font(lang, size):
    font_path = FONTS.get(lang)
    if not font_path or not os.path.exists(font_path):
        print(f"Warning: Font not found for {lang}, using default")
        return ImageFont.load_default()
    return ImageFont.truetype(font_path, size)


def create_text_image(text, font, output_path):
    # Use fixed dimensions to match existing button text images
    img = Image.new('RGBA', (IMAGE_WIDTH, IMAGE_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center text vertically, left-align horizontally with padding
    x = 10 - bbox[0]
    y = (IMAGE_HEIGHT - text_height) // 2 - bbox[1]
    draw.text((x, y), text, font=font, fill=TEXT_COLOR)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"Created: {output_path}")


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_base = os.path.join(script_dir, OUTPUT_DIR)

    for lang, translations in TRANSLATIONS.items():
        lang_dir = os.path.join(output_base, lang)
        os.makedirs(lang_dir, exist_ok=True)

        font_button = get_font(lang, FONT_SIZE_BUTTON)
        font_title = get_font(lang, FONT_SIZE_TITLE)

        for key, text in translations.items():
            font = font_title if key == 'config' else font_button
            output_path = os.path.join(lang_dir, f"{key}.png")
            create_text_image(text, font, output_path)

    print(f"\nGenerated text images in: {output_base}")


if __name__ == '__main__':
    main()

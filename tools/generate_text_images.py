#!/usr/bin/env python3
"""
Generate text images for UI buttons and titles.
Only for Asian and Arabic languages that lack font support.

requirements:
    arabic-reshaper
    python-bidi
    Pillow

pip install arabic-reshaper python-bidi Pillow
"""

import os

import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "../src/download0/img/text"

# Match existing button text image dimensions
IMAGE_WIDTH = 500
IMAGE_HEIGHT = 100
FONT_SIZE_BUTTON = 48
FONT_SIZE_TITLE = 64
TEXT_COLOR = (255, 255, 255, 255)

FONTS = {
    "ar": "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "ja": "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "ko": "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "zh": "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
}

TRANSLATIONS = {
    "ar": {
        "jailbreak": "كسر الحماية",
        "payloadMenu": "قائمة الحمولة",
        "config": "الاعدادات",
        "exit": "خروج",
        "autoLapse": "Auto Lapse",
        "autoPoop": "Auto Poop",
        "autoClose": "اغلاق تلقائي",
        "music": "موسيقى",
        "jbBehavior": "نوع التهكير",
        "jbBehaviorAuto": "كشف تلقائي",
        "jbBehaviorNetctrl": "NetControl",
        "jbBehaviorLapse": "Lapse",
        "theme": "سمة",
        "xToGoBack": "X للرجوع",
        "oToGoBack": "O للرجوع",
        "sortAlphabetical": "ترتيب أبجدي",
        "sortReverse": "ترتيب عكسي",
    },
    "ja": {
        "jailbreak": "脱獄",
        "payloadMenu": "ペイロードメニュー",
        "config": "設定",
        "exit": "終了",
        "autoLapse": "自動Lapse",
        "autoPoop": "自動Poop",
        "autoClose": "自動終了",
        "music": "音楽",
        "jbBehavior": "JB動作",
        "jbBehaviorAuto": "自動検出",
        "jbBehaviorNetctrl": "NetControl",
        "jbBehaviorLapse": "Lapse",
        "theme": "テーマ",
        "xToGoBack": "Xで戻る",
        "oToGoBack": "Oで戻る",
        "sortAlphabetical": "アルファベット順",
        "sortReverse": "逆順",
    },
    "ko": {
        "jailbreak": "탈옥",
        "payloadMenu": "페이로드 메뉴",
        "config": "설정",
        "exit": "종료",
        "autoLapse": "자동 Lapse",
        "autoPoop": "자동 Poop",
        "autoClose": "자동 닫기",
        "music": "음악",
        "jbBehavior": "JB 동작",
        "jbBehaviorAuto": "자동 감지",
        "jbBehaviorNetctrl": "NetControl",
        "jbBehaviorLapse": "Lapse",
        "theme": "테마",
        "xToGoBack": "X로 뒤로 가기",
        "oToGoBack": "O로 뒤로 가기",
        "sortAlphabetical": "알파벳순",
        "sortReverse": "역순",
    },
    "zh": {
        "jailbreak": "越狱",
        "payloadMenu": "载荷菜单",
        "config": "设置",
        "exit": "退出",
        "autoLapse": "自动Lapse",
        "autoPoop": "自动Poop",
        "autoClose": "自动关闭",
        "music": "音乐",
        "jbBehavior": "JB行为",
        "jbBehaviorAuto": "自动检测",
        "jbBehaviorNetctrl": "NetControl",
        "jbBehaviorLapse": "Lapse",
        "theme": "主题",
        "xToGoBack": "按 X 返回",
        "oToGoBack": "按 O 返回",
        "sortAlphabetical": "按字母排序",
        "sortReverse": "逆序排序",
    },
}


def create_text_image(text, font_path, font_size, output_path):
    # arabic text needs reshaping and bidi processing
    reshaped_text = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped_text)

    # Use fixed dimensions to match existing button text images
    img = Image.new("RGBA", (IMAGE_WIDTH, IMAGE_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    font = None

    # reduce font size until text fits in image
    while True:
        if font_path and os.path.exists(font_path):
            font = ImageFont.truetype(font_path, font_size)
        else:
            font = ImageFont.load_default()
            break  # can't adjust size with default font

        bbox = draw.textbbox((0, 0), bidi_text, font=font)
        text_width = bbox[2] - bbox[0]

        # if text width plus padding fits within image width, or if we've reached a small font size
        if text_width + 20 <= IMAGE_WIDTH or font_size <= 10:
            break

        font_size -= 2

    bbox = draw.textbbox((0, 0), bidi_text, font=font)
    text_height = bbox[3] - bbox[1]

    # Center text vertically, left-align horizontally with padding
    x = 10 - bbox[0]
    y = (IMAGE_HEIGHT - text_height) // 2 - bbox[1]
    draw.text((x, y), bidi_text, font=font, fill=TEXT_COLOR)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Created: {output_path} (Font Size: {font_size})")


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_base = os.path.join(script_dir, OUTPUT_DIR)

    for lang, translations in TRANSLATIONS.items():
        lang_dir = os.path.join(output_base, lang)
        os.makedirs(lang_dir, exist_ok=True)

        font_path = FONTS.get(lang)
        if not font_path or not os.path.exists(font_path):
            print(f"Warning: Font not found for {lang}, using default")
            font_path = None

        for key, text in translations.items():
            initial_size = FONT_SIZE_TITLE if key == "config" else FONT_SIZE_BUTTON
            output_path = os.path.join(lang_dir, f"{key}.png")
            create_text_image(text, font_path, initial_size, output_path)

    print(f"\nGenerated text images in: {output_base}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
iOS App Icon Generator for 360 Rabota
Generates all required icon sizes with white background and "360" text
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Icon sizes required for iOS
ICON_SIZES = [
    (40, "Icon-20@2x.png"),      # 20pt @2x
    (60, "Icon-20@3x.png"),      # 20pt @3x
    (58, "Icon-29@2x.png"),      # 29pt @2x
    (87, "Icon-29@3x.png"),      # 29pt @3x
    (80, "Icon-40@2x.png"),      # 40pt @2x
    (120, "Icon-40@3x.png"),     # 40pt @3x
    (120, "Icon-60@2x.png"),     # 60pt @2x
    (180, "Icon-60@3x.png"),     # 60pt @3x
    (1024, "Icon-1024.png"),     # App Store
]

# Output directory
OUTPUT_DIR = "360Rabota/Images.xcassets/AppIcon.appiconset"

def create_icon(size, filename):
    """Create a single icon with white background and "360" text"""

    # Create white background
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)

    # Calculate font size (proportional to image size)
    font_size = int(size * 0.35)

    # Try to use system font, fallback to default
    try:
        # Try common font paths
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/usr/share/fonts/truetype/fonts-liberation/LiberationSans-Bold.ttf",
        ]

        font = None
        for path in font_paths:
            if os.path.exists(path):
                font = ImageFont.truetype(path, font_size)
                break

        if font is None:
            # Use default font
            font = ImageFont.load_default()

    except Exception as e:
        print(f"Warning: Could not load font, using default: {e}")
        font = ImageFont.load_default()

    # Draw "360" text in center
    text = "360"

    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Calculate center position
    x = (size - text_width) // 2
    y = (size - text_height) // 2

    # Draw text in black
    draw.text((x, y), text, fill='black', font=font)

    # Save icon
    output_path = os.path.join(OUTPUT_DIR, filename)
    img.save(output_path, 'PNG', quality=100)
    print(f"✅ Created: {filename} ({size}x{size})")

def main():
    """Generate all required iOS app icons"""

    print("🎨 Generating iOS App Icons for 360 Rabota")
    print("=" * 50)

    # Check if output directory exists
    if not os.path.exists(OUTPUT_DIR):
        print(f"❌ Error: Directory not found: {OUTPUT_DIR}")
        return

    # Generate all icons
    for size, filename in ICON_SIZES:
        try:
            create_icon(size, filename)
        except Exception as e:
            print(f"❌ Error creating {filename}: {e}")

    print("=" * 50)
    print("✅ All icons generated successfully!")
    print(f"📁 Location: {OUTPUT_DIR}")
    print("\n📝 Next steps:")
    print("1. Open Xcode and verify icons in Images.xcassets")
    print("2. Run: cd ios && pod install")
    print("3. Build: npm run ios")

if __name__ == "__main__":
    main()

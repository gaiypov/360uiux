#!/usr/bin/env python3
"""
Generate Android app icons for 360 Rabota
Creates icons for all Android densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Icon sizes for different Android densities
ICON_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

def create_android_icon(size, output_path, is_round=False):
    """Create a single Android icon with white background and "360" text"""
    # Create image
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)

    # Calculate font size (35% of icon size)
    font_size = int(size * 0.35)

    try:
        # Try to use a nice font
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()

    # Draw text "360" centered
    text = "360"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (size - text_width) // 2
    y = (size - text_height) // 2

    draw.text((x, y), text, fill='black', font=font)

    # If round icon, create circular mask
    if is_round:
        mask = Image.new('L', (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse((0, 0, size, size), fill=255)

        # Apply circular mask
        img.putalpha(mask)

        # Convert back to RGB for PNG
        background = Image.new('RGB', (size, size), 'white')
        background.paste(img, mask=mask)
        img = background

    # Save the icon
    img.save(output_path, 'PNG', quality=100)
    print(f"✓ Generated: {output_path} ({size}x{size})")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Generate launcher icons
    for density, size in ICON_SIZES.items():
        # Regular launcher icon
        output_dir = os.path.join(script_dir, 'app', 'src', 'main', 'res', density)
        os.makedirs(output_dir, exist_ok=True)

        regular_icon_path = os.path.join(output_dir, 'ic_launcher.png')
        create_android_icon(size, regular_icon_path, is_round=False)

        # Round launcher icon
        round_icon_path = os.path.join(output_dir, 'ic_launcher_round.png')
        create_android_icon(size, round_icon_path, is_round=True)

    print("\n✅ All Android icons generated successfully!")
    print(f"Generated {len(ICON_SIZES) * 2} icons (regular + round) for all densities")

if __name__ == '__main__':
    main()

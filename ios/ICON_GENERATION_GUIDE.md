# 🎨 iOS App Icon Generation Guide for 360 Rabota

## Design Specifications

### Visual Design
- **Background**: White (#FFFFFF)
- **Text**: "360" in black (#000000)
- **Font**: SF Pro Display Bold or Helvetica Neue Bold
- **Corner Radius**: 8-12% (iOS will add additional rounding)
- **Style**: Minimalist, clean, professional

### Required Sizes

Generate the following icon sizes and place them in:
`ios/360Rabota/Images.xcassets/AppIcon.appiconset/`

| Size | Filename | Purpose |
|------|----------|---------|
| 40x40 | Icon-20@2x.png | iPhone Notification 2x |
| 60x60 | Icon-20@3x.png | iPhone Notification 3x |
| 58x58 | Icon-29@2x.png | iPhone Settings 2x |
| 87x87 | Icon-29@3x.png | iPhone Settings 3x |
| 80x80 | Icon-40@2x.png | iPhone Spotlight 2x |
| 120x120 | Icon-40@3x.png | iPhone Spotlight 3x |
| 120x120 | Icon-60@2x.png | iPhone App 2x |
| 180x180 | Icon-60@3x.png | iPhone App 3x |
| 1024x1024 | Icon-1024.png | App Store |

## Generation Methods

### Option 1: Using Figma/Sketch
1. Create 1024x1024 artboard
2. White background
3. Center "360" text (200-250pt, bold, black)
4. Export all required sizes using asset export

### Option 2: Using IconGenerator.net
1. Create base 1024x1024 image
2. Upload to https://appicon.co/
3. Download iOS icon set
4. Place in AppIcon.appiconset folder

### Option 3: Using ImageMagick (Command Line)
```bash
# Install ImageMagick
brew install imagemagick

# Create base 1024x1024 icon
convert -size 1024x1024 xc:white \
  -gravity center \
  -pointsize 250 \
  -font Helvetica-Bold \
  -fill black \
  -annotate +0+0 "360" \
  Icon-1024.png

# Generate all sizes
convert Icon-1024.png -resize 40x40 Icon-20@2x.png
convert Icon-1024.png -resize 60x60 Icon-20@3x.png
convert Icon-1024.png -resize 58x58 Icon-29@2x.png
convert Icon-1024.png -resize 87x87 Icon-29@3x.png
convert Icon-1024.png -resize 80x80 Icon-40@2x.png
convert Icon-1024.png -resize 120x120 Icon-40@3x.png
convert Icon-1024.png -resize 120x120 Icon-60@2x.png
convert Icon-1024.png -resize 180x180 Icon-60@3x.png
```

## Update Contents.json

After generating icons, update `Contents.json` with filenames:

```json
{
  "images" : [
    {
      "filename" : "Icon-20@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "Icon-20@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "filename" : "Icon-29@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "Icon-29@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "filename" : "Icon-40@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "Icon-40@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "filename" : "Icon-60@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "filename" : "Icon-60@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "filename" : "Icon-1024.png",
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
```

## Verification

After generating icons:
1. Open Xcode
2. Select `360Rabota` project
3. Navigate to `360Rabota` > `Images.xcassets` > `AppIcon`
4. Verify all icon slots are filled
5. No warnings should appear

## Design Tips

1. **Keep it simple**: "360" text should be clearly readable even at 40x40
2. **High contrast**: Black on white ensures visibility
3. **No gradients**: Flat design works better at small sizes
4. **Test on device**: Install and check how it looks on actual iPhone
5. **Alpha channel**: Must be removed from App Store icon (1024x1024)

## Quick SVG Template

```svg
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect fill="#FFFFFF" width="1024" height="1024"/>
  <text x="50%" y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="Helvetica-Bold, Helvetica"
        font-size="250"
        font-weight="bold"
        fill="#000000">360</text>
</svg>
```

Save as `icon.svg` and convert to PNG using:
```bash
convert -background white -density 300 icon.svg -resize 1024x1024 Icon-1024.png
```

---

**Note**: Icons are NOT included in git due to binary size. Generate them locally before building.

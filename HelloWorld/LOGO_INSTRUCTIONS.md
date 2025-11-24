# Logo Note

The plugin includes a simple SVG logo (`logo.svg`). For MarginNote compatibility, you should convert this to PNG format (44x44 pixels).

## Converting SVG to PNG

### Option 1: Using Online Tools
1. Upload `logo.svg` to https://cloudconvert.com/svg-to-png
2. Set dimensions to 44x44 pixels
3. Download as `logo.png`

### Option 2: Using ImageMagick (Command Line)
```bash
magick convert -background none -size 44x44 logo.svg logo.png
```

### Option 3: Using Inkscape
```bash
inkscape logo.svg --export-type=png --export-width=44 --export-height=44 --export-filename=logo.png
```

### Option 4: Using GIMP
1. Open `logo.svg` in GIMP
2. Set import size to 44x44 pixels
3. Export as `logo.png`

### Option 5: Manual Creation
Create a simple 44x44 PNG with:
- Blue background (#4A90E2)
- White text "HELLO" at top
- White text "WORLD" at bottom

## Note
If no `logo.png` exists, MarginNote will use a default icon. The plugin will still function normally.

If you receive a new .mnaddon release from the author:
# 1. Place the new .mnaddon file in mnutils/ folder
# 2. Run update script
cd "D:\_HS\source\MarginNoteScripts\MN-Addons\mnutils"
python .\update-mnutils.py

# 3. Rebuild with your customizations (xdyyutils)
cd mnutils
.\build.ps1



Format main.js (Optional)
To format the minified main.js for readability:

cd "D:\_HS\source\MarginNoteScripts\MN-Addons\mnutils\mnutils"
python format_main_advanced.py main.js --validate


This creates main_formatted.js with proper indentation and section comments

import os
import re
import subprocess
import shutil
import filecmp
import zipfile

# List all .mnaddon files in the current directory
addon_files = [f for f in os.listdir('.') if os.path.isfile(f) and f.endswith('.mnaddon')]

# Define regular expression to match file name format
pattern = r"mnutils_v(\d+)_(\d+)_(\d+)(?:_alpha(\d+))?\.mnaddon"

max_x = max_y = max_z = -1
target_addon = None

for addon_file in addon_files:
    match = re.match(pattern, addon_file)
    if match:
        x = int(match.group(1))
        y = int(match.group(2))
        z = int(match.group(3))
        w = int(match.group(4)) if match.group(4) else None

        is_alpha = w is not None # Is it an alpha version?

        if (x > max_x or
            (x == max_x and y > max_y) or
            (x == max_x and y == max_y and z > max_z) or
            (x == max_x and y == max_y and z == max_z and
             (is_alpha and (target_addon is None or not re.search(r"alpha", target_addon) or
             (re.search(r"alpha(\d+)", target_addon) and w > int(re.search(r"alpha(\d+)", target_addon).group(1))))))):

            max_x, max_y, max_z = x, y, z
            target_addon = addon_file

new_addon_name = target_addon.replace('.mnaddon', '')

# Assign the found target add-on to target_addon
if target_addon is not None:
    target_addon = os.path.join(os.getcwd(), target_addon)
    newVersion_path = target_addon.replace('.mnaddon', '')
    print(f"Target add-on: {target_addon}\nTarget directory: {newVersion_path}")
else:
    print("No matching plug-in file found")
    exit()

#Old version address
oldVersion_path = os.path.join(os.getcwd(), 'mnutils')

#Debug information
print(f"Decompressing file: {target_addon}")

# Check whether decompression is required and whether to force coverage if it exists (there is no coverage check here)
if os.path.exists(newVersion_path) and os.path.isdir(newVersion_path):
    shutil.rmtree(newVersion_path)

# Try mnaddon unpack first, fallback to zipfile if it fails
unpack_success = False

# First try mnaddon unpack command
try:
    command = f"mnaddon unpack {target_addon}"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode == 0 and os.path.isdir(newVersion_path):
        print("Decompression successful (mnaddon)")
        unpack_success = True
except subprocess.CalledProcessError as e:
    print(f"mnaddon unpack failed: {e}")

# Fallback to Python zipfile if mnaddon unpack didn't create the directory
if not unpack_success:
    print("Falling back to Python zipfile extraction...")
    try:
        with zipfile.ZipFile(target_addon, 'r') as zip_ref:
            zip_ref.extractall(newVersion_path)
        print("Decompression successful (zipfile)")
        unpack_success = True
    except zipfile.BadZipFile as e:
        print(f"Decompression failed: {e}")
        exit()

# Check whether the new decompression directory exists
if not os.path.isdir(newVersion_path):
    print(f"The decompression directory {newVersion_path} does not exist")
    exit()

# Copy the .js files and .html files in newVersion_path to oldVersion_path
for file in os.listdir(newVersion_path):
    if file.endswith('.js') or file.endswith('.html') or file.endswith('.json') or file.endswith('.css') or file.endswith('.png') or file.endswith('.svg') or file.endswith('.jpg') or file.endswith('.jpeg') or file.endswith('.png'):
        new_file = os.path.join(newVersion_path, file)
        old_file = os.path.join(oldVersion_path, file)
        if os.path.exists(old_file):
            if filecmp.cmp(new_file, old_file):
                print(f"{file} has not changed, skip")
                continue
        print(f"Copy file: {new_file} -> {old_file}")
        shutil.copy(new_file, old_file)

#Debug information
print("Update completed")

# Automatically modify the main.js file and add JSB.require("xdyyutils")
main_js_path = os.path.join(oldVersion_path, 'main.js') # Use os.path.join to splice out the absolute/relative path of main.js to ensure that the cross-platform path is correct
if os.path.exists(main_js_path): # Determine whether the main.js file actually exists to avoid subsequent read and write errors.
    print("Main.js is being modified to load xdyyutils.js...") # Prompts the current operation in progress so that users can know the progress

    with open(main_js_path, 'r', encoding='utf-8') as f: # Open main.js in read-only mode and specify UTF-8 encoding to avoid garbled Chinese or special characters
        content = f.read() # Read the entire file content into memory at one time, and then perform regular replacement based on strings

    # Use regular expressions to find and replace JSB.require calls
    # New format: JSB.require("mnutils"),JSB.require("mnnote"),MNUtil.init(t)
    # Need to insert xdyyutils after mnnote
    pattern = r'JSB\.require\("mnutils"\),(?:JSB\.require\("xdyyutils"\),)?JSB\.require\("mnnote"\)(?:,JSB\.require\("xdyyutils"\))?'
    replacement = r'JSB.require("mnutils"),JSB.require("mnnote"),JSB.require("xdyyutils")'

    modified_content = re.sub(pattern, replacement, content) # Perform replacement: make sure to introduce xdyyutils

    # Comment out checkSubscribed related code, because this function may no longer exist in main.js
    # If needed later, you can search and confirm the location of the function before deciding whether to restore this function.
    func_pattern = r'(static\s+checkSubscribed\(t=!0,e=!1,i=!0\)\{)(?!return true;)'
    func_replacement = r'\1return true;'
    modified_content = re.sub(func_pattern, func_replacement, modified_content)

    # Check whether the modification is successful (any substitution will cause the content to change)
    if modified_content != content: # If the replaced content is different from the original content, it means that at least one part has been successfully modified.
        with open(main_js_path, 'w', encoding='utf-8') as f: # Reopen main.js in write mode, overwriting and writing the modified content
            f.write(modified_content) # Write the modified text content back to the file and complete the placement.
        print("✅ JSB.require(\"xdyyutils\") has been successfully added to main.js") # Print success prompt
    else:
        print("❌ No matching JSB.require pattern found, please check the main.js format") # If replacement does not occur, prompt to check the format
else:
    print("❌ main.js file does not exist") # If the path does not exist, prompt the user to check whether the path and file exist.

# Output files in newVersion_path that are not in oldVersion_path
old_files = set(os.listdir(oldVersion_path))
new_files = set(os.listdir(newVersion_path))

extra_files = new_files - old_files

if not extra_files:
    print("No new file")
    shutil.rmtree(newVersion_path)

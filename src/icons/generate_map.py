import os

# ================= CONFIGURATION =================
# Path to your 'src/icons' folder
ICONS_DIR = r"C:\Users\Everdann\Desktop\Everdann\boggleverse\src\icons"
OUTPUT_FILE = os.path.join(ICONS_DIR, "map.ts")

def generate_map():
    if not os.path.exists(ICONS_DIR):
        print(f"❌ Error: Could not find {ICONS_DIR}")
        return

    filled_dir = os.path.join(ICONS_DIR, "filled")
    stroked_dir = os.path.join(ICONS_DIR, "stroked")

    # Get list of icon names (assuming filenames match in both folders)
    # We take the filenames from 'filled' as the source of truth
    files = [f for f in os.listdir(filled_dir) if f.endswith(".svg")]
    
    imports = []
    map_entries = []

    print(f"🚀 Mapping {len(files)} icons...")

    for f in files:
        name = f.replace(".svg", "")
        # Convert "zap-icon" to "ZapIcon" (PascalCase) for variable names
        var_name = "".join(x.title() for x in name.replace("-", "_").split("_"))
        
        # Create Import statements
        imports.append(f"import {var_name}Filled from './filled/{f}';")
        imports.append(f"import {var_name}Stroked from './stroked/{f}';")
        
        # Create Map entry
        map_entries.append(f"  '{name}': {{ filled: {var_name}Filled, stroked: {var_name}Stroked }},")

    # Construct the final file content
    content = (
        "// 🤖 AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n"
        "// Run 'python generate_map.py' to update this file.\n\n"
        + "\n".join(imports)
        + "\n\n"
        + "export const iconMap = {\n"
        + "\n".join(map_entries)
        + "\n} as const;\n\n"
        + "export type IconName = keyof typeof iconMap;\n"
    )

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"✅ Success! Generated map.ts with {len(files)} icons.")

if __name__ == "__main__":
    generate_map()
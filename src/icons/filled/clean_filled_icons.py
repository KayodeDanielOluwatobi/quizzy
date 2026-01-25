import os
import re

# ================= CONFIGURATION =================
# Path to your icons folder (e.g., "src/icons/filled")
ICONS_FOLDER = r"C:\Users\Everdann\Desktop\Everdann\Boggleverse\icons\filled"

# ================= THE LOGIC =================
def clean_svg(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Extract the viewBox
    # We look for viewBox="0 0 24 24" or similar
    viewbox_match = re.search(r'viewBox=["\']([\d\s\.-]+)["\']', content)
    viewbox = viewbox_match.group(1) if viewbox_match else "0 0 24 24"

    # 2. Extract the inner content (paths, etc.)
    # We grab everything between the opening <svg...> and closing </svg>
    body_match = re.search(r'<svg[^>]*>(.*)</svg>', content, re.DOTALL)
    
    if not body_match:
        print(f"⚠️  Skipped {file_path} (No svg tag found)")
        return

    body = body_match.group(1)

    # 3. Clean the Body
    # Remove Adobe's <g> and </g> tags to flatten the structure
    body = re.sub(r'<\s*g\s*>', '', body)
    body = re.sub(r'<\s*/\s*g\s*>', '', body)
    
    # Remove XML comments ()
    body = re.sub(r'', '', body, flags=re.DOTALL)
    
    # Clean up extra whitespace/newlines to make it compact
    body = " ".join(body.split())

    # 4. Construct the Perfect "Zap-Style" SVG
    # We enforce fill="currentColor" and stroke="none" here
    new_content = (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="{viewbox}" '
        f'fill="currentColor" '
        f'stroke="none">\n'
        f'  {body}\n'
        f'</svg>'
    )

    # 5. Save it back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Cleaned: {os.path.basename(file_path)}")

def main():
    if not os.path.exists(ICONS_FOLDER):
        print(f"❌ Error: Folder '{ICONS_FOLDER}' not found.")
        return

    print(f"🚀 Scrubbing SVGs in {ICONS_FOLDER}...")
    
    files = [f for f in os.listdir(ICONS_FOLDER) if f.endswith('.svg')]
    
    if not files:
        print("No SVG files found.")
        return

    for file in files:
        clean_svg(os.path.join(ICONS_FOLDER, file))

    print("\n✨ All done! Your icons are now Tailwind-ready.")

if __name__ == "__main__":
    main()
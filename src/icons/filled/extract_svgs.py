import os

# ================= CONFIGURATION =================
# REPLACE THIS with the path to the folder containing your SVGs
# Example (Windows): r"C:\Users\Daniel\Downloads\MyIcons"
# Example (Mac/Linux): "/Users/daniel/Downloads/MyIcons"
SOURCE_FOLDER = r"C:\Users\Everdann\Desktop\Everdann\Boggleverse\icons\filled"

# The name of the output text file
OUTPUT_FILE = "all_svg_codes.txt"

# ================= THE LOGIC =================
def extract_svgs():
    # Construct the full path for the output file (saves it in the same folder as the script)
    output_path = os.path.join(os.getcwd(), OUTPUT_FILE)
    
    print(f"🚀 Starting extraction from: {SOURCE_FOLDER}")
    
    try:
        # Get all files in the directory
        files = [f for f in os.listdir(SOURCE_FOLDER) if f.lower().endswith('.svg')]
        
        if not files:
            print("❌ No SVG files found in that folder!")
            return

        with open(output_path, 'w', encoding='utf-8') as outfile:
            count = 0
            for filename in files:
                file_path = os.path.join(SOURCE_FOLDER, filename)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        svg_content = infile.read().strip()
                        
                        # Write the formatting to the text file
                        outfile.write(f"=== {filename} ===\n")
                        outfile.write(svg_content)
                        outfile.write("\n\n" + "="*30 + "\n\n") # Separator
                        
                        print(f"✅ Processed: {filename}")
                        count += 1
                except Exception as e:
                    print(f"⚠️ Could not read {filename}: {e}")

        print(f"\n🎉 Success! Extracted {count} SVGs.")
        print(f"📄 Output saved to: {output_path}")

    except FileNotFoundError:
        print(f"❌ Error: The folder path '{SOURCE_FOLDER}' does not exist.")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    extract_svgs()
import os

src_dir = r"d:\Desktop\StoreTrack\MAfrontend\src"

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith((".js", ".jsx")):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'http://localhost:5000' in content:
                content = content.replace('http://localhost:5000', 'http://localhost:5001')
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
print("Replaced 5000 with 5001 successfully.")

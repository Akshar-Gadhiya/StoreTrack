import shutil, os

src = r"d:\Desktop\StoreTrack\frontend"
dst = r"d:\Desktop\StoreTrack\MAfrontend"

def ignore_func(dir, files):
    return [f for f in files if f in ("node_modules", "dist", ".git")]

try:
    shutil.copytree(src, dst, dirs_exist_ok=True, ignore=ignore_func)
    print("Success")
except Exception as e:
    print(f"Error: {e}")

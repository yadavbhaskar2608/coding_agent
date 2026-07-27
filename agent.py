from pathlib import Path

root = Path("node-easy-notes-app")

files = [

    "app/controllers/note.controller.js",
]

for file in files:
    path = root / file

    if path.exists():
        print(f"\n===== {file} =====\n")
        print(path.read_text(encoding="utf-8"))
    else:
        print(f"{file} not found")
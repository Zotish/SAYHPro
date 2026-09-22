import os
import re

bengali_re = re.compile(r'[\u0980-\u09FF]+')

file_matches = {}
for root, _, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            p = os.path.join(root, f)
            with open(p, "r", encoding="utf-8") as file:
                lines = file.readlines()
            for i, line in enumerate(lines, 1):
                if bengali_re.search(line):
                    if p not in file_matches:
                        file_matches[p] = []
                    file_matches[p].append((i, line))

print(f"Files with Bengali: {len(file_matches)}")
for p, lines in file_matches.items():
    print(f"{p}: {len(lines)} lines")

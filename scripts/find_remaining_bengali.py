import re
import os

bengali_re = re.compile(r'[\u0980-\u09FF]+')

with open("scripts/remaining_bengali.txt", "w", encoding="utf-8") as out:
    for root, _, files in os.walk("src"):
        for f in files:
            if f.endswith((".ts", ".tsx")):
                p = os.path.join(root, f)
                with open(p, "r", encoding="utf-8") as file:
                    lines = file.readlines()
                for i, line in enumerate(lines, 1):
                    if bengali_re.search(line):
                        out.write(f"{p}:{i}: {line.strip()}\n")

print("Generated scripts/remaining_bengali.txt")

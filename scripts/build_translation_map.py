import os
import re

bengali_re = re.compile(r'[\u0980-\u09FF]+')
string_re = re.compile(r'("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`(?:[^`\\]|\\.)*`)')

unique_strings = set()
for root, _, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            p = os.path.join(root, f)
            with open(p, "r", encoding="utf-8") as file:
                content = file.read()
            for s in string_re.findall(content):
                if bengali_re.search(s):
                    unique_strings.add(s)

print(f"Total unique quoted strings containing Bengali: {len(unique_strings)}")
with open("scripts/unique_bengali_strings.txt", "w", encoding="utf-8") as out:
    for s in sorted(unique_strings):
        out.write(s + "\n")

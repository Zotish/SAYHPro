import os
import re

bengali_re = re.compile(r'[\u0980-\u09FF]')
ternary_re = re.compile(r'(?:isBn|\blang\s*===?\s*["\']bn["\'])\s*\?\s*(["\'`].*?["\'`])\s*:\s*(["\'`].*?["\'`])', re.DOTALL)
obj_re = re.compile(r'(\w+):\s*(["\'`].*?["\'`])\s*,\s*(\w+Bn):\s*(["\'`].*?["\'`])', re.DOTALL)

pairs = []
for root, _, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            p = os.path.join(root, f)
            with open(p, "r", encoding="utf-8") as file:
                content = file.read()
            for m in ternary_re.finditer(content):
                bn = m.group(1).strip('"\'`')
                en = m.group(2).strip('"\'`')
                if bengali_re.search(bn):
                    pairs.append((en, bn, p))
            for m in obj_re.finditer(content):
                en = m.group(2).strip('"\'`')
                bn = m.group(4).strip('"\'`')
                if bengali_re.search(bn):
                    pairs.append((en, bn, p))

print(f"Total pairs found: {len(pairs)}")
unique_en = set(en for en, bn, p in pairs)
print(f"Unique English keys: {len(unique_en)}")
with open("scripts/en_pairs.txt", "w", encoding="utf-8") as out:
    for en in sorted(unique_en):
        out.write(en + "\n")

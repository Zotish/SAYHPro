import os
import re

bengali_re = re.compile(r'[\u0980-\u09FF]')
ternary_re = re.compile(r'(?:isBn|\blang\s*===?\s*["\']bn["\'])\s*\?\s*(["\'`].*?["\'`])\s*:\s*(["\'`].*?["\'`])', re.DOTALL)
obj_re = re.compile(r'(\w+):\s*(["\'`].*?["\'`])\s*,\s*(\w+Bn):\s*(["\'`].*?["\'`])', re.DOTALL)

paired_count = 0
for root, _, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            p = os.path.join(root, f)
            with open(p, "r", encoding="utf-8") as file:
                content = file.read()
            for m in ternary_re.finditer(content):
                bn_part = m.group(1)
                if bengali_re.search(bn_part):
                    paired_count += 1
            for m in obj_re.finditer(content):
                bn_part = m.group(4)
                if bengali_re.search(bn_part):
                    paired_count += 1

print(f"Paired occurrences found: {paired_count}")

#!/usr/bin/env python3
"""Fix Expo web export for static serving.

Adds type="module" to entry script tags so import.meta works correctly.
This fixes the "Cannot use 'import.meta' outside a module" error that
occurs when Zustand devtools middleware references import.meta.env.
"""
import os
import re
import sys

def fix_html(path: str) -> bool:
    with open(path, "r") as f:
        content = f.read()

    # Only target <script src="..." defer> tags that DON'T already have type="module"
    new = re.sub(
        r'<script src="([^"]+)" defer>',
        r'<script type="module" src="\1" defer>',
        content,
    )
    if new != content:
        with open(path, "w") as f:
            f.write(new)
        return True
    return False

def main():
    dist_dir = sys.argv[1] if len(sys.argv) > 1 else "dist"
    if not os.path.isdir(dist_dir):
        print(f"Error: directory '{dist_dir}' not found", file=sys.stderr)
        sys.exit(1)

    count = 0
    for root, _, files in os.walk(dist_dir):
        for name in files:
            if name.endswith(".html"):
                path = os.path.join(root, name)
                if fix_html(path):
                    count += 1

    print(f"Fixed {count} HTML files in {dist_dir}")

if __name__ == "__main__":
    main()

import os
import re

src_dir = os.path.abspath('src')

import_pattern = re.compile(r'(?:import|export)\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]')
side_effect_import = re.compile(r'import\s+[\'"]([^\'"]+)[\'"]')
dynamic_import_pattern = re.compile(r'import\([\'"]([^\'"]+)[\'"]\)')

builtins = ['path', 'fs', 'crypto', 'os', 'child_process', 'stream', 'http', 'https', 'net', 'tls']

found = set()

def get_pkg_name(import_str):
    if import_str.startswith('.') or import_str.startswith('@/') or import_str.startswith('/'):
        return None
    parts = import_str.split('/')
    if import_str.startswith('node:'):
        return import_str[5:]
    if import_str.startswith('@'):
        if len(parts) > 1:
            return f"{parts[0]}/{parts[1]}"
        return import_str
    return parts[0]

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if not file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            continue
        file_path = os.path.join(root, file)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        imports = import_pattern.findall(content) + dynamic_import_pattern.findall(content) + side_effect_import.findall(content)
        for imp in imports:
            pkg_name = get_pkg_name(imp)
            if pkg_name in builtins:
                found.add((pkg_name, file_path))

if found:
    print("FOUND BUILT-IN NODE IMPORTS IN BROWSER CODE:")
    for pkg, file in found:
        print(f"Imported '{pkg}' in {file}")
else:
    print("No built-in node imports found.")

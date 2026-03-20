import os
import re
import json

src_dir = os.path.abspath('src')

with open('package.json', 'r', encoding='utf-8') as f:
    pkg = json.load(f)
    deps = list(pkg.get('dependencies', {}).keys()) + list(pkg.get('devDependencies', {}).keys())

deps.append('react') # React is usually there
deps.append('vite')

import_pattern = re.compile(r'(?:import|export)\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]')
side_effect_import = re.compile(r'import\s+[\'"]([^\'"]+)[\'"]')
dynamic_import_pattern = re.compile(r'import\([\'"]([^\'"]+)[\'"]\)')

missing_deps = set()

def get_pkg_name(import_str):
    if import_str.startswith('.') or import_str.startswith('@/') or import_str.startswith('/'):
        return None
    parts = import_str.split('/')
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
            if pkg_name:
                # Node built-ins or Vite specific
                if pkg_name in ('path', 'fs', 'crypto', 'events', 'http', 'https', 'os', 'stream', 'url', 'util', 'virtual:pwa-register'):
                    continue
                if pkg_name not in deps:
                    missing_deps.add((pkg_name, file_path))

if missing_deps:
    print("MISSING DEPENDENCIES FOUND:")
    for dep, file in missing_deps:
        print(f"Package '{dep}' is imported in {file} but not in package.json")
else:
    print("All third-party imports are in package.json")

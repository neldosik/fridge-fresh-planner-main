import os
import re

src_dir = os.path.abspath('src')

import_pattern = re.compile(r'(?:import|export)\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]')
dynamic_import_pattern = re.compile(r'import\([\'"]([^\'"]+)[\'"]\)')

def resolve_import(base_path, import_str):
    if import_str.startswith('@/'):
        return os.path.join(src_dir, import_str[2:])
    elif import_str.startswith('.'):
        return os.path.normpath(os.path.join(os.path.dirname(base_path), import_str))
    return None

def check_file():
    missing_found = False
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if not file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                continue
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            imports = import_pattern.findall(content) + dynamic_import_pattern.findall(content)
            for imp in imports:
                res_path = resolve_import(file_path, imp)
                if not res_path: continue
                
                # Try all common extensions
                possible_paths = [
                    res_path,
                    res_path + '.ts', res_path + '.tsx', res_path + '.js', res_path + '.jsx',
                    os.path.join(res_path, 'index.ts'), os.path.join(res_path, 'index.tsx'),
                    res_path + '.css', res_path + '.scss'
                ]
                
                found = any(os.path.exists(p) for p in possible_paths)
                if not found:
                    print(f"UNRESOLVED IMPORT in {file_path}:")
                    print(f"  Import string: '{imp}'")
                    print(f"  Resolved path tried: {res_path}")
                    missing_found = True

    if not missing_found:
        print("No missing imports found!")

check_file()

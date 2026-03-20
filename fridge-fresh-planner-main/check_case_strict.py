import os
import re

src_dir = os.path.abspath('src')

import_pattern = re.compile(r'(?:import|export)\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]')
dynamic_import_pattern = re.compile(r'import\([\'"]([^\'"]+)[\'"]\)')

def is_exact_case_path(path_str):
    # Split the path into parts
    parts = []
    p = os.path.abspath(path_str)
    
    # We only care about parts relative to 'src' to avoid windows C: drive casing issues
    try:
        rel_path = os.path.relpath(p, os.path.dirname(src_dir))
    except ValueError:
        return True # Not in our directory
        
    current = os.path.dirname(src_dir)
    for part in rel_path.split(os.sep):
        if not os.path.exists(current):
            return False
        # Get actual directory contents
        try:
            actual_contents = os.listdir(current)
        except OSError:
            actual_contents = []
            
        found_exact = False
        for item in actual_contents:
            if item == part:
                found_exact = True
                break
            elif item.lower() == part.lower():
                return False # CASE MISMATCH FOUND!
        
        if not found_exact and not any(i.lower() == part.lower() for i in actual_contents):
            return True # File doesn't exist at all, handled by missing imports check
            
        current = os.path.join(current, part)
        
    return True

def resolve_import(base_path, import_str):
    if import_str.startswith('@/'):
        return os.path.join(src_dir, import_str[2:])
    elif import_str.startswith('.'):
        return os.path.normpath(os.path.join(os.path.dirname(base_path), import_str))
    return None

found_errors = []

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
            
            possible_paths = [
                res_path,
                res_path + '.ts', res_path + '.tsx', res_path + '.js', res_path + '.jsx',
                os.path.join(res_path, 'index.ts'), os.path.join(res_path, 'index.tsx')
            ]
            
            for p in possible_paths:
                if os.path.exists(p):
                    if not is_exact_case_path(p):
                        actual_relative = os.path.relpath(os.path.dirname(p), src_dir)
                        found_errors.append(f"CASE MISMATCH in {file_path}:\n  Import: {imp}\n  Resolved: {p}")
                    break

if found_errors:
    print("ERRORS FOUND:")
    for e in found_errors:
        print(e)
else:
    print("NO CASE MISMATCHES FOUND!")

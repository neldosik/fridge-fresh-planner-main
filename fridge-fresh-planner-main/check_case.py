import os
import re

src_dir = os.path.abspath('src')

def get_actual_case_path(path):
    dir_name, file_name = os.path.split(path)
    if not os.path.exists(dir_name):
        return None
    try:
        actual_files = os.listdir(dir_name)
    except:
        return None
    for f in actual_files:
        if f.lower() == file_name.lower():
            if f != file_name:
                return os.path.join(dir_name, f)
            else:
                return path
    return None

import_pattern = re.compile(r'(?:import|export)\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]')
dynamic_import_pattern = re.compile(r'import\([\'"]([^\'"]+)[\'"]\)')

def resolve_import(base_path, import_str):
    if import_str.startswith('@/'):
        return os.path.join(src_dir, import_str[2:])
    elif import_str.startswith('.'):
        return os.path.normpath(os.path.join(os.path.dirname(base_path), import_str))
    return None

def check_file():
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
                
                matched = False
                case_mismatch = None
                
                for p in possible_paths:
                    if os.path.exists(p):
                        actual_path = get_actual_case_path(p)
                        if actual_path:
                            # For files, the basename must match exactly
                            if os.path.basename(p) == os.path.basename(actual_path):
                                matched = True
                            else:
                                case_mismatch = (p, actual_path)
                        break
                            
                if not matched and case_mismatch:
                    print(f"CASE MISMATCH in {file_path}:")
                    print(f"  Imported: {imp}")
                    print(f"  Expected: {os.path.basename(case_mismatch[1])}")
                    print(f"  Actual in code: {os.path.basename(case_mismatch[0])}")

check_file()
print("Done checking code imports casing.")

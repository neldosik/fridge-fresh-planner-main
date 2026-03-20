import os
import re

src_dir = os.path.abspath('src')

files_to_fix = [
    os.path.join('pages', 'ShoppingList.tsx'),
    os.path.join('components', 'RecipeCard.tsx'),
    os.path.join('components', 'MealPrepSetsView.tsx')
]

for rel_path in files_to_fix:
    path = os.path.join(src_dir, rel_path)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Clean up broken imports
    # ShoppingList.tsx literal \n import injection
    broken_str1 = '\\nimport { getCurrencySymbol } from "@/lib/utils";\\n'
    if broken_str1 in content:
        content = content.replace(broken_str1, '\\n')
        
    # RecipeCard & MealPrepSetsView literal \n import injection at the end
    broken_str2 = '\\nimport { getCurrencySymbol } from "@/lib/utils";'
    if broken_str2 in content:
        content = content.replace(broken_str2, '')

    # Also clean up if it got injected differently
    content = content.replace('export default RecipeCard;\\nimport { getCurrencySymbol } from "@/lib/utils";', 'export default RecipeCard;')
    content = content.replace('export default MealPrepSetsView;\\nimport { getCurrencySymbol } from "@/lib/utils";', 'export default MealPrepSetsView;')

    # 2. Add correct import at the top
    correct_import = 'import { getCurrencySymbol } from "@/lib/utils";\n'
    if 'import { getCurrencySymbol } from "@/lib/utils";' not in content:
        content = correct_import + content
    else:
        # maybe it's there but we just want to be sure it's not broken
        pass

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed imports successfully!")

import os
import re

src_dir = os.path.abspath('src')

# Update utils.ts
utils_path = os.path.join(src_dir, 'lib', 'utils.ts')
with open(utils_path, 'a', encoding='utf-8') as f:
    f.write('''
export function getCurrencySymbol() {
  const c = typeof window !== "undefined" ? localStorage.getItem("app_currency") : "EUR";
  if (c === "USD") return "$";
  if (c === "RUB") return "₽";
  return "€";
}

export function getAppLanguageName() {
  const l = typeof window !== "undefined" ? localStorage.getItem("app_language") : "ru";
  if (l === "en") return "английском";
  if (l === "de") return "немецком";
  return "русском";
}
''')

def replace_in_file(rel_path, replacements):
    path = os.path.join(src_dir, rel_path)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add import if needed
    if 'getCurrencySymbol' not in content:
        # Find the last import
        last_import = content.rfind('import ')
        if last_import != -1:
            end_of_import = content.find('\\n', last_import)
            content = content[:end_of_import] + '\\nimport { getCurrencySymbol } from "@/lib/utils";' + content[end_of_import:]
        else:
            content = 'import { getCurrencySymbol } from "@/lib/utils";\\n' + content

    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Update ShoppingList.tsx
replace_in_file(os.path.join('pages', 'ShoppingList.tsx'), [
    ('цены в €', 'цены в ${getCurrencySymbol()}'),
    ('~${Math.round(total)}€', '~${Math.round(total)}${getCurrencySymbol()}'),
    ('~${Math.round(sum)}€', '~${Math.round(sum)}${getCurrencySymbol()}'),
    ('~{Math.round(totalPrice)}€', '~{Math.round(totalPrice)}{getCurrencySymbol()}'),
    ('~{Math.round(item.estimated_price * item.quantity)}€', '~{Math.round(item.estimated_price * item.quantity)}{getCurrencySymbol()}'),
])

# Update RecipeCard.tsx
replace_in_file(os.path.join('components', 'RecipeCard.tsx'), [
    ('~{Math.round(ing.estimated_price_rub * ing.quantity * multiplier)}€', '~{Math.round(ing.estimated_price_rub * ing.quantity * multiplier)}{getCurrencySymbol()}'),
    ('>€<', '>{getCurrencySymbol()}<'),
    ('{ing.estimated_price_rub}€', '{ing.estimated_price_rub}{getCurrencySymbol()}'),
    ('€', '{getCurrencySymbol()}') # fallback if there are standalone symbols
])

# Update MealPrepSetsView.tsx
replace_in_file(os.path.join('components', 'MealPrepSetsView.tsx'), [
    ('{totalPrice}€', '{totalPrice}{getCurrencySymbol()}'),
    ('в Lidl', ''), # remove specific store label
])

# Update recipeService.ts
rs_path = os.path.join(src_dir, 'services', 'recipeService.ts')
with open(rs_path, 'r', encoding='utf-8') as f:
    rs_content = f.read()

rs_content = rs_content.replace('import { GoogleGenerativeAI } from "@google/generative-ai";', 
                                'import { GoogleGenerativeAI } from "@google/generative-ai";\\nimport { getCurrencySymbol, getAppLanguageName } from "@/lib/utils";')

rs_content = rs_content.replace('Евро (€)', '${getCurrencySymbol()}')
rs_content = rs_content.replace('€', '${getCurrencySymbol()}')
rs_content = rs_content.replace('на русском', 'на ${getAppLanguageName()}')
rs_content = rs_content.replace('по-русски', 'на ${getAppLanguageName()}')

with open(rs_path, 'w', encoding='utf-8') as f:
    f.write(rs_content)

print("Replaced currency and language logic in components!")

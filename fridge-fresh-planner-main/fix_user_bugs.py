import os

path_svc = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\services\\inventoryAssistantService.ts"
path_idx = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\Index.tsx"
path_trans = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

# 1. Update Service
with open(path_svc, 'r', encoding='utf-8') as f:
    text = f.read()

if 'language?: string;' not in text:
    text = text.replace('  fallbackNotFound?: string;\n}', '  fallbackNotFound?: string;\n  language?: string;\n}')

if 'Команда пользователя' not in text:
    old_prompt = "Текущие продукты (JSON):"
    new_prompt = 'Язык ответа: ${req.language || "ru"}\nКоманда пользователя: "${req.message}"\nТекущие продукты (JSON):'
    text = text.replace(old_prompt, new_prompt)

with open(path_svc, 'w', encoding='utf-8') as f:
    f.write(text)

# 2. Update Index
with open(path_idx, 'r', encoding='utf-8') as f:
    idx_text = f.read()

idx_text = idx_text.replace('const { t } = useTranslation();', 'const { t, language } = useTranslation();')
idx_text = idx_text.replace('fallbackNotFound: t("ast_not_found") as string }', 'fallbackNotFound: t("ast_not_found") as string, language }')

with open(path_idx, 'w', encoding='utf-8') as f:
    f.write(idx_text)

# 3. Update useTranslation
with open(path_trans, 'r', encoding='utf-8') as f:
    trans_text = f.read()

trans_text = trans_text.replace('tab_shelf:', 'tab_pantry:')

with open(path_trans, 'w', encoding='utf-8') as f:
    f.write(trans_text)

print("Fixes applied successfully.")

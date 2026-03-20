import os
import re

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\components\\RecipeCard.tsx"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Make sure useTranslation is imported and used
if 'useTranslation' not in text:
    text = text.replace('import { useSettings } from "@/hooks/useSettings";', 'import { useTranslation } from "@/hooks/useTranslation";\nimport { useSettings } from "@/hooks/useSettings";')

if 'const { t } = useTranslation();' not in text:
    text = text.replace('useSettings();', 'useSettings();\n  const { t } = useTranslation();')

# Buttons and titles
text = text.replace('title="Заменить"', 'title={t("rc_replace") as string}')
text = text.replace('title={liked ? "Убрать из любимых" : "В избранное"}', 'title={(liked ? t("rc_unlike") : t("rc_like")) as string}')
text = text.replace('>В корзину\n            </button>', '>{t("rc_to_cart")}\n            </button>')
text = text.replace('>Готовлю!\n          </button>', '>{t("rc_cooking")}\n          </button>')
text = text.replace('title="Сохранить"', 'title={t("rc_save") as string}')

# Expand/collapse
text = text.replace('{expanded ? "Свернуть" : "Подробнее"}', '{expanded ? t("rc_collapse") : t("rc_details")}')

# Units
text = text.replace('>мин</span>', '>{t("rc_min")}</span>')
text = text.replace('>ккал</span>', '>{t("rc_kcal")}</span>')

# Headers
text = text.replace('>Ингредиенты</h4>', '>{t("rc_ingredients")}</h4>')
text = text.replace('>Приготовление</h4>', '>{t("rc_preparation")}</h4>')
text = text.replace('>Итого (Цены Lidl Munich)</span>', '>{t("rc_total_lidl")}</span>')

# "есть ~" logic
text = text.replace('есть ~{Math.round(availableConverted * 10) / 10} {ing.unit}', '{t("rc_have_approx", {qty: Math.round(availableConverted * 10) / 10, unit: ing.unit})}')
text = text.replace('есть ~{Math.round(availableRaw * 10) / 10} {matched.unit}', '{t("rc_have_approx", {qty: Math.round(availableRaw * 10) / 10, unit: matched.unit})}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("RecipeCard translated!")

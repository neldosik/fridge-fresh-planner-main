import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\ShoppingList.tsx"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add useTranslation import
if 'useTranslation' not in text:
    text = text.replace('import { useSettings } from "@/hooks/useSettings";', 'import { useTranslation } from "@/hooks/useTranslation";\nimport { useSettings } from "@/hooks/useSettings";')

if 'const { t } = useTranslation();' not in text:
    text = text.replace('useSettings();', 'useSettings();\n  const { t } = useTranslation();')

text = text.replace('>Корзина</h1>', '>{t("sl_title")}</h1>')
text = text.replace('>Цены Lidl Munich (EUR)</p>', '>{t("sl_subtitle")}</p>')
text = text.replace('>Отправить список в WhatsApp</button>', '>{t("sl_share_wa")}</button>')
text = text.replace('>Корзина пуста</p>', '>{t("sl_empty_title")}</p>')
text = text.replace('>Добавьте рецепт в режиме «Хочу в магазин»</p>', '>{t("sl_empty_desc")}</p>')
text = text.replace('Куплено ({checkedItems.length})', '{t("sl_bought")} ({checkedItems.length})')
text = text.replace('>Очистить</button>', '>{t("sl_clear")}</button>')

text = text.replace('lines.push(`Список покупок (Lidl Munich, цены в ${getCurrencySymbol()}):`);', 'lines.push(t("sl_wa_list", {currency: getCurrencySymbol()}) as string);')
text = text.replace('lines.push(`Итого: ~${Math.round(sum)}${getCurrencySymbol()}`);', 'lines.push(t("sl_wa_total", {total: Math.round(sum), currency: getCurrencySymbol()}) as string);')

# Replace exact german strings with t(...) using a mapping object
cat_map_code = """
  const catNames: Record<LidlCartCategory, string> = {
    "Obst & Gemüse": t("sl_cat_obst") as string,
    "Kühlung": t("sl_cat_kuhlung") as string,
    "Tiefkühlkost": t("sl_cat_tiefkuehl") as string,
    "Sonstiges": t("sl_cat_sonstiges") as string,
  };
"""
# insert before shareToWhatsApp
text = text.replace('const shareToWhatsApp = () => {', f'{cat_map_code}\n  const shareToWhatsApp = () => {{')

# Replace cat rendered in DOM
text = text.replace('<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{cat}</p>', '<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{catNames[cat] || cat}</p>')

# Replace cat rendered in WA
text = text.replace('lines.push(`*${cat}*`);', 'lines.push(`*${catNames[cat] || cat}*`);')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("ShoppingList.tsx translated!")

import os
import re

base = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src"
path_i18n = os.path.join(base, "hooks", "useTranslation.ts")
path_form = os.path.join(base, "components", "AddProductForm.tsx")
path_card = os.path.join(base, "components", "ProductCard.tsx")

# 1. Update i18n
with open(path_i18n, 'r', encoding='utf-8') as f:
    t_code = f.read()

ru_extra = """
    add_analyze: "Анализирую чек...",
    add_ai_parsing: "ИИ распознаёт продукты",
    add_new_product: "Новый продукт",
    add_name_placeholder: "Например, Молоко",
    add_location: "Место хранения",
    add_scan_btn: "Сканировать чек",
    add_adding_btn: "Добавляю...",
"""
en_extra = """
    add_analyze: "Analyzing receipt...",
    add_ai_parsing: "AI is parsing products",
    add_new_product: "New Product",
    add_name_placeholder: "e.g., Milk",
    add_location: "Location",
    add_scan_btn: "Scan receipt",
    add_adding_btn: "Adding...",
"""
de_extra = """
    add_analyze: "Bon wird analysiert...",
    add_ai_parsing: "KI verarbeitet Produkte",
    add_new_product: "Neues Produkt",
    add_name_placeholder: "z.B. Milch",
    add_location: "Lagerort",
    add_scan_btn: "Bon scannen",
    add_adding_btn: "Wird hinzugefügt...",
"""

t_code = t_code.replace('    add_cancel: "Отмена",\n', f'    add_cancel: "Отмена",\n{ru_extra}')
t_code = t_code.replace('    add_cancel: "Cancel",\n', f'    add_cancel: "Cancel",\n{en_extra}')
t_code = t_code.replace('    add_cancel: "Abbrechen",\n', f'    add_cancel: "Abbrechen",\n{de_extra}')

with open(path_i18n, 'w', encoding='utf-8') as f:
    f.write(t_code)

# 2. Update AddProductForm
with open(path_form, 'r', encoding='utf-8') as f:
    form = f.read()

form = form.replace('import { useQueryClient } from "@tanstack/react-query";', 'import { useQueryClient } from "@tanstack/react-query";\nimport { useTranslation } from "@/hooks/useTranslation";')
form = form.replace('const AddProductForm = ({ open, onClose, defaultLocation = "fridge" }: AddProductFormProps) => {', 'const AddProductForm = ({ open, onClose, defaultLocation = "fridge" }: AddProductFormProps) => {\n  const { t } = useTranslation();')

# Fix LOCATIONS array
form = form.replace('    { id: "fridge", label: "Холодильник" },', '    { id: "fridge", label: t("tab_fridge") },')
form = form.replace('    { id: "freezer", label: "Морозилка" },', '    { id: "freezer", label: t("tab_freezer") },')
form = form.replace('    { id: "pantry", label: "Полка" },', '    { id: "pantry", label: t("tab_shelf") },')

# Strings
form = form.replace('>Анализирую чек...</p>', '>{t("add_analyze")}</p>')
form = form.replace('>ИИ распознаёт продукты</p>', '>{t("add_ai_parsing")}</p>')
form = form.replace('>Новый продукт</h2>', '>{t("add_new_product")}</h2>')
form = form.replace('>Иконка</label>', '>{t("add_icon")}</label>')
form = form.replace('>Название</label>', '>{t("add_name")}</label>')
form = form.replace('placeholder="Например, Молоко"', 'placeholder={t("add_name_placeholder") as string}')
form = form.replace('>Место хранения</label>', '>{t("add_location")}</label>')
form = form.replace('>Количество</label>', '>{t("add_qty")}</label>')
form = form.replace('>Единица</label>', '>{t("add_unit")}</label>')
form = form.replace('>Срок годности</label>', '>{t("add_expiry")}</label>')
form = form.replace('Сканировать чек', '{t("add_scan_btn")}')
form = form.replace('{loading ? "Добавляю..." : "Добавить"}', '{loading ? t("add_adding_btn") : t("add_submit")}')

with open(path_form, 'w', encoding='utf-8') as f:
    f.write(form)

# 3. Update ProductCard
with open(path_card, 'r', encoding='utf-8') as f:
    card = f.read()

card = card.replace('import { useQueryClient } from "@tanstack/react-query";', 'import { useQueryClient } from "@tanstack/react-query";\nimport { useTranslation } from "@/hooks/useTranslation";')
card = card.replace('const ProductCard = ({ id, name, quantity, maxQuantity, unit, icon, expiryDate }: ProductCardProps) => {', 'const ProductCard = ({ id, name, quantity, maxQuantity, unit, icon, expiryDate }: ProductCardProps) => {\n  const { t } = useTranslation();')

card = card.replace('Срок до:', '{t("card_expiry")}')
card = card.replace('>Закончилось</div>', '>{t("card_empty")}</div>')
card = card.replace('Удалить продукт?</motion.button>', '{t("card_delete")}</motion.button>')

with open(path_card, 'w', encoding='utf-8') as f:
    f.write(card)

print("AddProductForm and ProductCard updated!")

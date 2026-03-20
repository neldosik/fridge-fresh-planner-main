import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\components\\MealPrepSetsView.tsx"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('import { useSettings } from "@/hooks/useSettings";', 'import { useTranslation } from "@/hooks/useTranslation";\nimport { useSettings } from "@/hooks/useSettings";')
text = text.replace('const MealPrepSetsView = ({ recipes, onSelectSet, onRerollSets, extraConstraints, onExtraConstraintsChange }: MealPrepSetsViewProps) => {\n  useSettings();', 'const MealPrepSetsView = ({ recipes, onSelectSet, onRerollSets, extraConstraints, onExtraConstraintsChange }: MealPrepSetsViewProps) => {\n  const { t } = useTranslation();')

# Move SET_NAMES inside the component mapping
text = text.replace('const name = SET_NAMES[i] || `Сет ${i + 1}`;', 'const SET_NAMES = [t("mp_set_budget"), t("mp_set_vitamin"), t("mp_set_comfort")];\n          const name = SET_NAMES[i] || t("mp_set_prefix", {num: i + 1});')

# Remove the old global SET_NAMES
text = text.replace('const SET_NAMES = ["Бюджетный Lidl Сет", "Витаминный Сет", "Комфортный Сет"];\n', '')

# Replace other texts
text = text.replace('>Сеты Meal Prep</h2>', '>{t("mp_title")}</h2>')
text = text.replace('>Обед и ужин — разные горячие блюда или сытные салаты, цены Lidl Munich</p>', '>{t("mp_desc")}</p>')
text = text.replace('>Реролл Сетов</button>', '>{t("mp_reroll")}</button>')
text = text.replace('>Что учесть? (например: нет орехов в магазине)</label>', '>{t("mp_what_to_consider")}</label>')
text = text.replace('placeholder="Напишите сюда дополнительные пожелания к сету"', 'placeholder={t("mp_wishes_placeholder") as string}')
text = text.replace('Сет #{i + 1}', '{t("mp_set_prefix", {num: i + 1})}')
text = text.replace('>4 блюда на неделю</p>', '>{t("mp_4_dishes")}</p>')
text = text.replace('Примерно {totalPrice}{getCurrencySymbol()}', '{t("mp_approx_price", {price: totalPrice + getCurrencySymbol()})}')
text = text.replace('>(на 7 дней для всех блюд)</span>', '>{t("mp_7_days_note")}</span>')
text = text.replace('>Выбрать Сет</button>', '>{t("mp_select_set")}</button>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("MealPrepSetsView translated!")

import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

with open(path, 'r', encoding='utf-8') as f:
    t_code = f.read()

ru_extra = """
    rc_replace: "Заменить",
    rc_unlike: "Убрать из любимых",
    rc_like: "В избранное",
    rc_min: "мин",
    rc_kcal: "ккал",
    rc_collapse: "Свернуть",
    rc_details: "Подробнее",
    rc_to_cart: "В корзину",
    rc_cooking: "Готовлю!",
    rc_save: "Сохранить",
    rc_ingredients: "Ингредиенты",
    rc_have_approx: "есть ~{{qty}} {{unit}}",
    rc_total_lidl: "Итого (Цены Lidl Munich)",
    rc_preparation: "Приготовление",
"""
en_extra = """
    rc_replace: "Replace",
    rc_unlike: "Remove from favorites",
    rc_like: "Add to favorites",
    rc_min: "min",
    rc_kcal: "kcal",
    rc_collapse: "Collapse",
    rc_details: "Details",
    rc_to_cart: "To cart",
    rc_cooking: "Cooking!",
    rc_save: "Save",
    rc_ingredients: "Ingredients",
    rc_have_approx: "have ~{{qty}} {{unit}}",
    rc_total_lidl: "Total (Lidl Munich prices)",
    rc_preparation: "Preparation",
"""
de_extra = """
    rc_replace: "Ersetzen",
    rc_unlike: "Aus Favoriten entfernen",
    rc_like: "Zu Favoriten hinzufügen",
    rc_min: "Min",
    rc_kcal: "kcal",
    rc_collapse: "Zuklappen",
    rc_details: "Details",
    rc_to_cart: "In den Warenkorb",
    rc_cooking: "Ich koche!",
    rc_save: "Speichern",
    rc_ingredients: "Zutaten",
    rc_have_approx: "habe ~{{qty}} {{unit}}",
    rc_total_lidl: "Gesamt (Lidl München Preise)",
    rc_preparation: "Zubereitung",
"""

t_code = t_code.replace('    mp_select_set: "Выбрать Сет",\n', f'    mp_select_set: "Выбрать Сет",\n{ru_extra}')
t_code = t_code.replace('    mp_select_set: "Select Set",\n', f'    mp_select_set: "Select Set",\n{en_extra}')
t_code = t_code.replace('    mp_select_set: "Set auswählen",\n', f'    mp_select_set: "Set auswählen",\n{de_extra}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(t_code)

print("Dictionary expanded for RecipeCard!")

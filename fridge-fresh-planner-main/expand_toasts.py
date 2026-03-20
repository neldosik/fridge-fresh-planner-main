import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

with open(path, 'r', encoding='utf-8') as f:
    t_code = f.read()

ru_extra = """
    rec_toast_err_ai: "Ошибка связи с шеф-поваром, попробуйте еще раз",
    rec_toast_err_gen: "Не удалось сгенерировать рецепты",
    rec_toast_all_ings: "Все ингредиенты уже есть!",
    rec_toast_cart_updated: "Корзина обновлена: +{{insertedCount}} позиций, обновлено {{updatedCount}}",
    rec_toast_cart_has: "В корзине уже есть нужные ингредиенты",
    rec_toast_cooked: "Продукты списаны! Приятного аппетита! 🍽️",
    rec_toast_save_err: "Ошибка сохранения",
    rec_toast_saved: "Рецепт сохранён!",
"""
en_extra = """
    rec_toast_err_ai: "Communication error with the Chef, please try again",
    rec_toast_err_gen: "Failed to generate recipes",
    rec_toast_all_ings: "You already have all ingredients!",
    rec_toast_cart_updated: "Cart updated: +{{insertedCount}} items, updated {{updatedCount}}",
    rec_toast_cart_has: "Cart already has the required ingredients",
    rec_toast_cooked: "Ingredients consumed! Bon appétit! 🍽️",
    rec_toast_save_err: "Save error",
    rec_toast_saved: "Recipe saved!",
"""
de_extra = """
    rec_toast_err_ai: "Verbindungsfehler mit dem Koch, bitte erneut versuchen",
    rec_toast_err_gen: "Fehler beim Generieren der Rezepte",
    rec_toast_all_ings: "Alle Zutaten sind bereits vorhanden!",
    rec_toast_cart_updated: "Warenkorb aktualisiert: +{{insertedCount}} Artikel, {{updatedCount}} aktualisiert",
    rec_toast_cart_has: "Die benötigten Zutaten sind bereits im Warenkorb",
    rec_toast_cooked: "Zutaten verbraucht! Guten Appetit! 🍽️",
    rec_toast_save_err: "Fehler beim Speichern",
    rec_toast_saved: "Rezept gespeichert!",
"""

t_code = t_code.replace('    cat_dessert: "Десерт",\n', f'    cat_dessert: "Десерт",\n{ru_extra}')
t_code = t_code.replace('    cat_dessert: "Dessert",\n', f'    cat_dessert: "Dessert",\n{en_extra}')

# Notice EN and DE both have "Dessert" so we need to be careful with replace
# Let's fix this cautiously:
t_code = t_code.replace('    cat_dessert: "Dessert",\n}', f'    cat_dessert: "Dessert",\n{de_extra}}}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(t_code)

print("Dictionary expanded for toasts!")

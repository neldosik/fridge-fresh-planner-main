import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

with open(path, 'r', encoding='utf-8') as f:
    t_code = f.read()

ru_extra = """
    sl_title: "Корзина",
    sl_subtitle: "Цены Lidl Munich (EUR)",
    sl_share_wa: "Отправить список в WhatsApp",
    sl_empty_title: "Корзина пуста",
    sl_empty_desc: "Добавьте рецепт в режиме «Хочу в магазин»",
    sl_bought: "Куплено",
    sl_clear: "Очистить",
    sl_wa_list: "Список покупок (Lidl Munich, цены в {{currency}}):",
    sl_wa_total: "Итого: ~{{total}}{{currency}}",
    sl_cat_obst: "Овощи и фрукты",
    sl_cat_kuhlung: "Охлаждёнка",
    sl_cat_tiefkuehl: "Заморозка",
    sl_cat_sonstiges: "Остальное",
"""
en_extra = """
    sl_title: "Cart",
    sl_subtitle: "Lidl Munich prices (EUR)",
    sl_share_wa: "Send list to WhatsApp",
    sl_empty_title: "Cart is empty",
    sl_empty_desc: "Add a recipe in 'I want to shop' mode",
    sl_bought: "Bought",
    sl_clear: "Clear",
    sl_wa_list: "Shopping List (Lidl Munich, prices in {{currency}}):",
    sl_wa_total: "Total: ~{{total}}{{currency}}",
    sl_cat_obst: "Fruits & Veggies",
    sl_cat_kuhlung: "Dairy & Meat",
    sl_cat_tiefkuehl: "Frozen",
    sl_cat_sonstiges: "Other",
"""
de_extra = """
    sl_title: "Warenkorb",
    sl_subtitle: "Lidl München Preise (EUR)",
    sl_share_wa: "Liste per WhatsApp senden",
    sl_empty_title: "Warenkorb ist leer",
    sl_empty_desc: "Füge ein Rezept im 'Ich möchte einkaufen' Modus hinzu",
    sl_bought: "Gekauft",
    sl_clear: "Leeren",
    sl_wa_list: "Einkaufsliste (Lidl München, Preise in {{currency}}):",
    sl_wa_total: "Gesamt: ~{{total}}{{currency}}",
    sl_cat_obst: "Obst & Gemüse",
    sl_cat_kuhlung: "Kühlung",
    sl_cat_tiefkuehl: "Tiefkühlkost",
    sl_cat_sonstiges: "Sonstiges",
"""

t_code = t_code.replace('    rc_preparation: "Приготовление",\n', f'    rc_preparation: "Приготовление",\n{ru_extra}')
t_code = t_code.replace('    rc_preparation: "Preparation",\n', f'    rc_preparation: "Preparation",\n{en_extra}')
t_code = t_code.replace('    rc_preparation: "Zubereitung",\n', f'    rc_preparation: "Zubereitung",\n{de_extra}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(t_code)

print("ShoppingList translations added.")

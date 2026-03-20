import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

with open(path, 'r', encoding='utf-8') as f:
    t_code = f.read()

ru_extra = """
    mp_set_budget: "Бюджетный Lidl Сет",
    mp_set_vitamin: "Витаминный Сет",
    mp_set_comfort: "Комфортный Сет",
    mp_title: "Сеты Meal Prep",
    mp_desc: "Обед и ужин — разные горячие блюда или сытные салаты, цены Lidl Munich",
    mp_reroll: "Реролл Сетов",
    mp_what_to_consider: "Что учесть? (например: нет орехов в магазине)",
    mp_wishes_placeholder: "Напишите сюда дополнительные пожелания к сету",
    mp_set_prefix: "Сет #{{num}}",
    mp_4_dishes: "4 блюда на неделю",
    mp_approx_price: "Примерно {{price}}",
    mp_7_days_note: "(на 7 дней для всех блюд)",
    mp_select_set: "Выбрать Сет",
"""
en_extra = """
    mp_set_budget: "Budget Lidl Set",
    mp_set_vitamin: "Vitamin Set",
    mp_set_comfort: "Comfort Set",
    mp_title: "Meal Prep Sets",
    mp_desc: "Lunch and dinner are different hot meals or hearty salads, Lidl Munich prices",
    mp_reroll: "Reroll Sets",
    mp_what_to_consider: "What to consider? (e.g., no nuts in the store)",
    mp_wishes_placeholder: "Write any additional wishes for the set here",
    mp_set_prefix: "Set #{{num}}",
    mp_4_dishes: "4 meals for the week",
    mp_approx_price: "Approx. {{price}}",
    mp_7_days_note: "(for 7 days for all meals)",
    mp_select_set: "Select Set",
"""
de_extra = """
    mp_set_budget: "Budget Lidl Set",
    mp_set_vitamin: "Vitamin Set",
    mp_set_comfort: "Komfort Set",
    mp_title: "Meal Prep Sets",
    mp_desc: "Mittag- und Abendessen sind verschiedene warme Gerichte oder herzhafte Salate, Lidl München Preise",
    mp_reroll: "Sets neu generieren",
    mp_what_to_consider: "Was ist zu beachten? (z.B. keine Nüsse im Laden)",
    mp_wishes_placeholder: "Schreibe hier zusätzliche Wünsche für das Set",
    mp_set_prefix: "Set #{{num}}",
    mp_4_dishes: "4 Gerichte für die Woche",
    mp_approx_price: "Ca. {{price}}",
    mp_7_days_note: "(für 7 Tage für alle Gerichte)",
    mp_select_set: "Set auswählen",
"""

t_code = t_code.replace('    rec_toast_saved: "Рецепт сохранён!",\n', f'    rec_toast_saved: "Рецепт сохранён!",\n{ru_extra}')
t_code = t_code.replace('    rec_toast_saved: "Recipe saved!",\n', f'    rec_toast_saved: "Recipe saved!",\n{en_extra}')
t_code = t_code.replace('    rec_toast_saved: "Rezept gespeichert!",\n', f'    rec_toast_saved: "Rezept gespeichert!",\n{de_extra}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(t_code)

print("MealPrepKeys added.")

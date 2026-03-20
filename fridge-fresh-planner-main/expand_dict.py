import re
import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

with open(path, 'r', encoding='utf-8') as f:
    t_code = f.read()

ru_keys = """
    // Index.tsx
    idx_title: "Продукты",
    idx_inventory_title: "Управление запасами ✨",
    idx_listening: "Слушаю...",
    idx_mic: "Микрофон",
    idx_chat_placeholder: "Например: Я съел все яйца / Ich habe keine Milch mehr / Добавь 2 литра молока / Сколько осталось сыра?",
    idx_chef: "Шеф:",
    idx_you: "Вы:",
    idx_musthave_title: "Мастхев продукты",
    idx_musthave_subtitle: "Добавляются в корзину при необходимости",
    idx_hide: "Скрыть",
    idx_show: "Показать",
    idx_need_buy: "Нужно купить",
    idx_running_low: "Почти нет ({{qty}} {{unit}})",
    idx_in_stock: "Есть ({{qty}} {{unit}})",
    idx_in_cart: "В корзине",
    idx_not_in_cart: "Нет в корзине",
    idx_add_placeholder: "Добавить (например: Яблоки)",
    idx_add_btn: "Добавить",
    idx_time_to_shop: "Пора в магазин",
    idx_empty_here: "Здесь пока пусто",
"""

en_keys = """
    // Index.tsx
    idx_title: "Products",
    idx_inventory_title: "Inventory Management ✨",
    idx_listening: "Listening...",
    idx_mic: "Microphone",
    idx_chat_placeholder: "E.g. I ate all the eggs / I bought 2 liters of milk / How much cheese is left?",
    idx_chef: "Chef:",
    idx_you: "You:",
    idx_musthave_title: "Must-Have Products",
    idx_musthave_subtitle: "Added to cart when necessary",
    idx_hide: "Hide",
    idx_show: "Show",
    idx_need_buy: "Need to buy",
    idx_running_low: "Running low ({{qty}} {{unit}})",
    idx_in_stock: "In stock ({{qty}} {{unit}})",
    idx_in_cart: "In cart",
    idx_not_in_cart: "Not in cart",
    idx_add_placeholder: "Add (e.g., Apples)",
    idx_add_btn: "Add",
    idx_time_to_shop: "Time to shop",
    idx_empty_here: "It's empty here",
"""

de_keys = """
    // Index.tsx
    idx_title: "Produkte",
    idx_inventory_title: "Bestandsverwaltung ✨",
    idx_listening: "Ich höre...",
    idx_mic: "Mikrofon",
    idx_chat_placeholder: "Z.B. Ich habe alle Eier gegessen / Ich habe 2 Liter Milch gekauft / Wie viel Käse ist übrig?",
    idx_chef: "Koch:",
    idx_you: "Du:",
    idx_musthave_title: "Must-Have Produkte",
    idx_musthave_subtitle: "Wird bei Bedarf zum Warenkorb hinzugefügt",
    idx_hide: "Verbergen",
    idx_show: "Anzeigen",
    idx_need_buy: "Kaufen",
    idx_running_low: "Fast leer ({{qty}} {{unit}})",
    idx_in_stock: "Auf Lager ({{qty}} {{unit}})",
    idx_in_cart: "Im Warenkorb",
    idx_not_in_cart: "Nicht im Warenkorb",
    idx_add_placeholder: "Hinzufügen (z.B. Äpfel)",
    idx_add_btn: "Hinzufügen",
    idx_time_to_shop: "Zeit zum Einkaufen",
    idx_empty_here: "Hier ist es noch leer",
"""

t_code = t_code.replace('    tab_shelf: "Полка",\n  },', f'    tab_shelf: "Полка",\n{ru_keys}  }},')
t_code = t_code.replace('    tab_shelf: "Pantry",\n  },', f'    tab_shelf: "Pantry",\n{en_keys}  }},')
t_code = t_code.replace('    tab_shelf: "Vorrat",\n  },', f'    tab_shelf: "Vorrat",\n{de_keys}  }},')

with open(path, 'w', encoding='utf-8') as f:
    f.write(t_code)

print("Dictionary expanded for Index.tsx!")

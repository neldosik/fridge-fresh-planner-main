import os
import re

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

with open(path, 'r', encoding='utf-8') as f:
    t_code = f.read()

ru_keys = """
    // ProductCard
    card_expiry: "Срок до: ",
    card_empty: "Закончилось",
    card_delete: "Удалить продукт?",
"""

en_keys = """
    // ProductCard
    card_expiry: "Expiry: ",
    card_empty: "Empty",
    card_delete: "Delete product?",
"""

de_keys = """
    // ProductCard
    card_expiry: "Haltbar bis: ",
    card_empty: "Leer",
    card_delete: "Produkt löschen?",
"""

t_code = t_code.replace('    add_submit: "Добавить",\n  },', f'    add_submit: "Добавить",\n{ru_keys}  }},')
t_code = t_code.replace('    add_submit: "Add",\n  },', f'    add_submit: "Add",\n{en_keys}  }},')
t_code = t_code.replace('    add_submit: "Hinzufügen",\n  },', f'    add_submit: "Hinzufügen",\n{de_keys}  }},')

with open(path, 'w', encoding='utf-8') as f:
    f.write(t_code)

print("Dictionary expanded for ProductCard!")

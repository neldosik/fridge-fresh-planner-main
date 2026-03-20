import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

with open(path, 'r', encoding='utf-8') as f:
    t_code = f.read()

ru_keys = """
    // AddProductForm
    add_title_scan: "Отсканировать чек",
    add_title_manual: "Добавить продукт",
    add_name: "Название",
    add_qty: "Кол-во",
    add_unit: "Ед. изм.",
    add_icon: "Иконка",
    add_expiry: "Годен до",
    add_cancel: "Отмена",
    add_submit: "Добавить",
"""

en_keys = """
    // AddProductForm
    add_title_scan: "Scan Receipt",
    add_title_manual: "Add Product",
    add_name: "Name",
    add_qty: "Qty",
    add_unit: "Unit",
    add_icon: "Icon",
    add_expiry: "Expiry",
    add_cancel: "Cancel",
    add_submit: "Add",
"""

de_keys = """
    // AddProductForm
    add_title_scan: "Kassenzettel scannen",
    add_title_manual: "Produkt hinzufügen",
    add_name: "Name",
    add_qty: "Menge",
    add_unit: "Einh.",
    add_icon: "Symbol",
    add_expiry: "Haltbar bis",
    add_cancel: "Abbrechen",
    add_submit: "Hinzufügen",
"""

t_code = t_code.replace('    idx_empty_here: "Здесь пока пусто",\n  },', f'    idx_empty_here: "Здесь пока пусто",\n{ru_keys}  }},')
t_code = t_code.replace('    idx_empty_here: "It\'s empty here",\n  },', f'    idx_empty_here: "It\'s empty here",\n{en_keys}  }},')
t_code = t_code.replace('    idx_empty_here: "Hier ist es noch leer",\n  },', f'    idx_empty_here: "Hier ist es noch leer",\n{de_keys}  }},')

with open(path, 'w', encoding='utf-8') as f:
    f.write(t_code)

print("Dictionary expanded for AddProductForm!")

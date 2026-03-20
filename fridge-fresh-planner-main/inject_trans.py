import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('set_logout: "Выйти из аккаунта",', 'set_install_app: "Установить на телефон",\n    set_logout: "Выйти из аккаунта",')
text = text.replace('set_logout: "Sign Out",', 'set_install_app: "Install App",\n    set_logout: "Sign Out",')
text = text.replace('set_logout: "Abmelden",', 'set_install_app: "App installieren",\n    set_logout: "Abmelden",')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated translations for PWA.")

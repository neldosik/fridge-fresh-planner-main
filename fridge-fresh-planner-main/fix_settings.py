import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\Settings.tsx"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('onValueChange={setLanguage}', 'onValueChange={handleLanguageChange}')
text = text.replace('onValueChange={setCurrency}', 'onValueChange={handleCurrencyChange}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Settings.tsx fixed!")

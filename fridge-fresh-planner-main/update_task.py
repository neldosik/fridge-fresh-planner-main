import os

path = "C:\\Users\\Oleksandr\\.gemini\\antigravity\\brain\\057cbef0-b7f2-4999-a479-10aa712a6cdb\\task.md"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('- [ ] Translate `Recipes` page and `MealPrepSetsView`', '- [x] Translate `Recipes` page and `MealPrepSetsView`')
text = text.replace('- [ ] Translate `RecipeCard` and `SavedRecipes`', '- [x] Translate `RecipeCard` (SavedRecipes not applicable)')
text = text.replace('- [ ] Translate `ShoppingList` and PDF/WhatsApp export text', '- [x] Translate `ShoppingList` and PDF/WhatsApp export text')

if 'Translate `Settings`' not in text:
    text = text + "\n- [x] Translate `Settings` page\n- [ ] Translate AI Assistant fallback messages"

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Task list updated.")

import os

file_path = os.path.join("c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src", "services", "inventoryAssistantService.ts")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_confidence_block = """Уверенность:
- Для set/adjust/update действий выбирай ТОЛЬКО продукт из списка req.products и используй его существующий id.
- Если ты НЕ уверен, какой именно продукт из списка подходит, не меняй ничего: intent="unknown", actions=[], replyText="Не понял, уточните название продукта (например: 'кефир', 'яйца').".
- Никогда не запрашивай у пользователя дополнительную информацию текстом. Всегда возвращай JSON по схеме."""

new_confidence_block = """Новые продукты и Уверенность:
- Для изменения уже существующих запасов (set_quantity, adjust_quantity) выбирай ТОЛЬКО продукт из списка req.products.
- ВАЖНО: Если пользователь просит ДОБАВИТЬ продукт (купил, добавь), которого ЕЩЕ НЕТ в списке req.products — обязательно используй действие insert_product и intent="update_inventory". Не возвращай unknown!
- Если пользователь просит УМЕНЬШИТЬ продукт или узнать ОСТАТОК, которого нет в списке — возвращай intent="unknown", actions=[], replyText="Не нашел такого продукта в ваших запасах. Напишите точное название.".
- Никогда не запрашивай у пользователя дополнительную информацию текстом. Всегда возвращай JSON по схеме."""

if old_confidence_block in content:
    content = content.replace(old_confidence_block, new_confidence_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Prompt updated successfully.")
else:
    print("Could not find the block to replace!")

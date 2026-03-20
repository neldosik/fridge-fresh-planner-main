import os

path_svc = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\services\\inventoryAssistantService.ts"
path_idx = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\Index.tsx"

# 1. Update Service
with open(path_svc, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('  message: string;\n}', '  message: string;\n  fallbackErrorAi?: string;\n  fallbackUnknown?: string;\n  fallbackNotFound?: string;\n}')

text = text.replace('replyText="Не нашел такого продукта в ваших запасах. Напишите точное название.".', 'replyText="${req.fallbackNotFound || \'Not found\'}".')

text = text.replace('replyText: "Я не смог понять команду. Попробуй ещё раз, например: «Я выпил молоко» или «Добавь 2 литра молока».",', 'replyText: req.fallbackErrorAi || "Error",')

text = text.replace('replyText: "Я не смог понять команду."', 'replyText: req.fallbackUnknown || "Unknown"')

with open(path_svc, 'w', encoding='utf-8') as f:
    f.write(text)

# 2. Update Index
with open(path_idx, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('text: `Ок, обновил: ${prod.name} осталось ${approxQty(newQty)} ${prod.unit || ""}`.trim()', 'text: t("ast_updated_left", {name: prod.name, qty: approxQty(newQty), unit: prod.unit || ""}) as string')

text = text.replace('text: `Уточните, какое именно «${entry.replyGerman}» вы использовали (например: «обычное», «без сахара», «высокой жирности»).`', 'text: t("ast_specify", {name: entry.replyGerman}) as string')

text = text.replace('text: `Готово: обновил ваши запасы (${entry.replyGerman}).`', 'text: t("ast_updated_stock", {name: entry.replyGerman}) as string')

text = text.replace('text: `Не нашёл этот продукт среди ваших запасов. Напишите название так, как оно у вас в списке (например: «Яйца (Eier)», «Молоко (Milch)», «Авокадо»).`', 'text: t("ast_not_found_list") as string')

text = text.replace('const reply = quantity <= 0 ? `Закончился (${germanName})` : `Осталось примерно ${approxQty(quantity)} ${unit} (${germanName})`;', 'const reply = quantity <= 0 ? t("ast_empty", {name: germanName}) as string : t("ast_left_approx", {qty: approxQty(quantity), unit, name: germanName}) as string;')

text = text.replace('text: res.replyText || "Не нашёл этот продукт среди ваших запасов."', 'text: res.replyText || (t("ast_not_found") as string)')

text = text.replace('const reply = res.replyText || "Готово! Обновил ваши запасы.";', 'const reply = res.replyText || (t("ast_done") as string);')

text = text.replace('toast.error(e?.message || "Ошибка ассистента");', 'toast.error(e?.message || (t("ast_err_toast") as string));')

text = text.replace('text: "Ошибка связи с ассистентом. Попробуйте ещё раз."', 'text: t("ast_err_conn") as string')

text = text.replace('toast.error("Web Speech API не поддерживается в этом браузере.");', 'toast.error(t("ast_err_mic") as string);')

text = text.replace('await runInventoryAssistant({ activeLocation, products, message: text }', 'await runInventoryAssistant({ activeLocation, products, message: text, fallbackErrorAi: t("ast_err_ai") as string, fallbackUnknown: t("ast_err_unknown") as string, fallbackNotFound: t("ast_not_found") as string }')

with open(path_idx, 'w', encoding='utf-8') as f:
    f.write(text)

print("assistant translations replaced in service and index.")

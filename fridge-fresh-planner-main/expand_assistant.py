import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

with open(path, 'r', encoding='utf-8') as f:
    t_code = f.read()

ru_extra = """
    // Assistant Responses
    ast_updated_left: "Ок, обновил: {{name}} осталось ~{{qty}} {{unit}}",
    ast_specify: "Уточните, какое именно «{{name}}» вы использовали (например: «обычное», «без сахара», «высокой жирности»).",
    ast_updated_stock: "Готово: обновил ваши запасы ({{name}}).",
    ast_not_found_list: "Не нашёл этот продукт среди ваших запасов. Напишите название так, как оно у вас в списке (например: «Яйца (Eier)», «Молоко (Milch)», «Авокадо»).",
    ast_empty: "Закончился ({{name}})",
    ast_left_approx: "Осталось примерно {{qty}} {{unit}} ({{name}})",
    ast_not_found: "Не нашёл этот продукт среди ваших запасов.",
    ast_done: "Готово! Обновил ваши запасы.",
    ast_err_toast: "Ошибка ассистента",
    ast_err_conn: "Ошибка связи с ассистентом. Попробуйте ещё раз.",
    ast_err_mic: "Web Speech API не поддерживается в этом браузере.",
    
    ast_err_ai: "Я не смог понять команду. Попробуй ещё раз, например: «Я выпил молоко» или «Добавь 2 литра молока».",
    ast_err_unknown: "Я не смог понять команду.",
"""
en_extra = """
    // Assistant Responses
    ast_updated_left: "Done, updated: {{name}} left ~{{qty}} {{unit}}",
    ast_specify: "Please specify which «{{name}}» you used (e.g., «regular», «sugar-free», «high fat»).",
    ast_updated_stock: "Done: updated your stock ({{name}}).",
    ast_not_found_list: "Could not find this product in your inventory. Write the name exactly as it is in the list.",
    ast_empty: "Out of stock ({{name}})",
    ast_left_approx: "Left approx {{qty}} {{unit}} ({{name}})",
    ast_not_found: "Could not find this product in your inventory.",
    ast_done: "Done! Updated your stock.",
    ast_err_toast: "Assistant error",
    ast_err_conn: "Connection error with assistant. Try again.",
    ast_err_mic: "Web Speech API is not supported in this browser.",
    
    ast_err_ai: "I couldn't understand the command. Try again, e.g., 'I drank milk' or 'Add 2 liters of milk'.",
    ast_err_unknown: "I couldn't understand the command.",
"""
de_extra = """
    // Assistant Responses
    ast_updated_left: "Erledigt, aktualisiert: {{name}} noch ~{{qty}} {{unit}}",
    ast_specify: "Bitte gib an, welches «{{name}}» du verwendet hast (z.B. «normal», «zuckerfrei», «fettreich»).",
    ast_updated_stock: "Erledigt: Vorrat aktualisiert ({{name}}).",
    ast_not_found_list: "Dieses Produkt wurde im Inventar nicht gefunden. Schreibe den Namen genau so, wie er in der Liste steht.",
    ast_empty: "Aufgebraucht ({{name}})",
    ast_left_approx: "Noch ca. {{qty}} {{unit}} ({{name}})",
    ast_not_found: "Dieses Produkt wurde im Inventar nicht gefunden.",
    ast_done: "Erledigt! Vorrat aktualisiert.",
    ast_err_toast: "Assistentenfehler",
    ast_err_conn: "Verbindungsfehler mit dem Assistenten. Bitte erneut versuchen.",
    ast_err_mic: "Web Speech API wird in diesem Browser nicht unterstützt.",
    
    ast_err_ai: "Ich konnte den Befehl nicht verstehen. Versuche es nochmal, z.B. 'Ich habe Milch getrunken'.",
    ast_err_unknown: "Ich konnte den Befehl nicht verstehen.",
"""

t_code = t_code.replace('    set_toast_delete: "Запрос на удаление отправлен. Проверьте почту для подтверждения.",\n', f'    set_toast_delete: "Запрос на удаление отправлен. Проверьте почту для подтверждения.",\n{ru_extra}')
t_code = t_code.replace('    set_toast_delete: "Deletion request sent. Check your email for confirmation.",\n', f'    set_toast_delete: "Deletion request sent. Check your email for confirmation.",\n{en_extra}')
t_code = t_code.replace('    set_toast_delete: "Löschanfrage gesendet. Überprüfe deine E-Mail zur Bestätigung.",\n', f'    set_toast_delete: "Löschanfrage gesendet. Überprüfe deine E-Mail zur Bestätigung.",\n{de_extra}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(t_code)

print("Assistant strings added.")

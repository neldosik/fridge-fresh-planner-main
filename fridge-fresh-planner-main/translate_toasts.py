import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\Recipes.tsx"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('toast.error("Ошибка связи с шеф-поваром, попробуйте еще раз");', 'toast.error(t("rec_toast_err_ai") as string);')
text = text.replace('toast.error(e?.message || "Не удалось сгенерировать рецепты");', 'toast.error(e?.message || (t("rec_toast_err_gen") as string));')
text = text.replace('toast.info("Все ингредиенты уже есть!");', 'toast.info(t("rec_toast_all_ings") as string);')
text = text.replace('toast.success(`Корзина обновлена: +${insertedCount} позиций, обновлено ${updatedCount}`);', 'toast.success(t("rec_toast_cart_updated", {insertedCount, updatedCount}) as string);')
text = text.replace('toast.info("В корзине уже есть нужные ингредиенты");', 'toast.info(t("rec_toast_cart_has") as string);')
text = text.replace('toast.success("Продукты списаны! Приятного аппетита! 🍽️");', 'toast.success(t("rec_toast_cooked") as string);')
text = text.replace('toast.error("Ошибка сохранения");', 'toast.error(t("rec_toast_save_err") as string);')
text = text.replace('toast.success("Рецепт сохранён!");', 'toast.success(t("rec_toast_saved") as string);')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Toasts translated in Recipes.tsx")

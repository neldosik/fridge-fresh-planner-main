import os
import re

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\Recipes.tsx"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('import { useQuery } from "@tanstack/react-query";', 'import { useQuery } from "@tanstack/react-query";\nimport { useTranslation } from "@/hooks/useTranslation";')
text = text.replace('const Recipes = () => {', 'const Recipes = () => {\n  const { t } = useTranslation();')

text = text.replace('>Рецепты</h1>', '>{t("rec_title")}</h1>')
text = text.replace('>Мои Лайки ❤️</button>', '>{t("rec_liked")}</button>')
text = text.replace('>История готовки</button>', '>{t("rec_history")}</button>')
text = text.replace('>Готовлю из того, что есть</h3>', '>{t("rec_mode_fridge_title")}</h3>')
text = text.replace('>Рецепты на основе продуктов в вашем холодильнике</p>', '>{t("rec_mode_fridge_desc")}</p>')
text = text.replace('>{inStockProducts.length} продуктов доступно</p>', '>{t("rec_products_avail", {count: inStockProducts.length})}</p>')
text = text.replace('>Хочу в магазин</h3>', '>{t("rec_mode_shop_title")}</h3>')
text = text.replace('>Поиск по всем мировым рецептам, недостающее — в корзину</p>', '>{t("rec_mode_shop_desc")}</p>')
text = text.replace('Твои пожелания шеф-повару (например: еду в горы, хочу сытный завтрак)', '{t("rec_wishes_label")}')
text = text.replace('placeholder="Опиши пожелания: калорийность, продукты/ограничения, поход, цели и т.д."', 'placeholder={t("rec_wishes_placeholder") as string}')
text = text.replace('>Приготовить из залежавшегося</span>', '>{t("rec_expiring_title")}</span>')
text = text.replace('{useExpiringOnly ? "включено" : "выключено"}', '{useExpiringOnly ? t("rec_on") : t("rec_off")}')
text = text.replace('>Использовать продукты с самым коротким сроком годности в контексте генерации.</p>', '>{t("rec_expiring_desc")}</p>')
text = text.replace('Есть сохраненный план:', '{t("rec_saved_plan")}')
text = text.replace('>Открыть сохраненный план</button>', '>{t("rec_open_plan")}</button>')
text = text.replace('>На один раз</h3>', '>{t("rec_single_title")}</h3>')
text = text.replace('>3 варианта рецептов на выбор</p>', '>{t("rec_single_desc")}</p>')
text = text.replace('>План на неделю</h3>', '>{t("rec_weekly_title")}</h3>')
text = text.replace('>21 рецепт: завтрак, обед и ужин на 7 дней</p>', '>{t("rec_weekly_desc")}</p>')
text = text.replace('>Meal Prep</h3>', '>{t("rec_mealprep_title")}</h3>')
text = text.replace('>Сет на неделю: суп + второе + завтрак + перекус (7 порций каждого)</p>', '>{t("rec_mealprep_desc")}</p>')
text = text.replace('Выберите тип блюда, а ИИ предложит 3 варианта именно для этой категории.', '{t("rec_cat_desc")}')
text = text.replace('>3 идеи от шефа</span>', '>{t("rec_cat_ideas")}</span>')
text = text.replace('>ИИ готовит рецепты...</p>', '>{t("rec_loading_ai")}</p>')
text = text.replace('>Это может занять до 2 минут</p>', '>{t("rec_loading_time")}</p>')
text = text.replace('>Мои лайки ❤️</h2>', '>{t("rec_liked")}</h2>')
text = text.replace('>Вы ещё не отмечали любимые рецепты.</p>', '>{t("rec_liked_empty")}</p>')
text = text.replace('>История готовки</h2>', '>{t("rec_history")}</h2>')
text = text.replace('>Очистить</button>', '>{t("rec_history_clear")}</button>')
text = text.replace('>Пока нет приготовленных рецептов.</p>', '>{t("rec_history_empty")}</p>')
text = text.replace('>Приготовил снова</button>', '>{t("rec_history_cook_again")}</button>')
text = text.replace('>В корзину</button>', '>{t("rec_history_add_cart")}</button>')

# For Categories mapping
text = text.replace('{ key: "breakfast", label: "Завтрак" }', '{ key: "breakfast", label: t("cat_breakfast") }')
text = text.replace('{ key: "lunch", label: "Обед" }', '{ key: "lunch", label: t("cat_lunch") }')
text = text.replace('{ key: "dinner", label: "Ужин" }', '{ key: "dinner", label: t("cat_dinner") }')
text = text.replace('{ key: "snack", label: "Перекус" }', '{ key: "snack", label: t("cat_snack") }')
text = text.replace('{ key: "dessert", label: "Десерт" }', '{ key: "dessert", label: t("cat_dessert") }')

# For toast
# Need more dynamic translation if strings have vars, but we can do it later.

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Recipes.tsx translated!")

import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

with open(path, 'r', encoding='utf-8') as f:
    t_code = f.read()

ru_extra = """
    // Recipes
    rec_title: "Рецепты",
    rec_liked: "Мои Лайки ❤️",
    rec_history: "История готовки",
    rec_mode_fridge_title: "Готовлю из того, что есть",
    rec_mode_fridge_desc: "Рецепты на основе продуктов в вашем холодильнике",
    rec_products_avail: "{{count}} продуктов доступно",
    rec_mode_shop_title: "Хочу в магазин",
    rec_mode_shop_desc: "Поиск по всем мировым рецептам, недостающее — в корзину",
    rec_wishes_label: "Твои пожелания шеф-повару (например: еду в горы, хочу сытный завтрак)",
    rec_wishes_placeholder: "Опиши пожелания: калорийность, продукты/ограничения, поход, цели и т.д.",
    rec_expiring_title: "Приготовить из залежавшегося",
    rec_on: "включено",
    rec_off: "выключено",
    rec_expiring_desc: "Использовать продукты с самым коротким сроком годности в контексте генерации.",
    rec_saved_plan: "Есть сохраненный план: ",
    rec_open_plan: "Открыть сохраненный план",
    rec_single_title: "На один раз",
    rec_single_desc: "3 варианта рецептов на выбор",
    rec_weekly_title: "План на неделю",
    rec_weekly_desc: "21 рецепт: завтрак, обед и ужин на 7 дней",
    rec_mealprep_title: "Meal Prep",
    rec_mealprep_desc: "Сет на неделю: суп + второе + завтрак + перекус (7 порций каждого)",
    rec_cat_desc: "Выберите тип блюда, а ИИ предложит 3 варианта именно для этой категории.",
    rec_cat_ideas: "3 идеи от шефа",
    rec_loading_ai: "ИИ готовит рецепты...",
    rec_loading_time: "Это может занять до 2 минут",
    rec_liked_empty: "Вы ещё не отмечали любимые рецепты.",
    rec_history_clear: "Очистить",
    rec_history_empty: "Пока нет приготовленных рецептов.",
    rec_history_cook_again: "Приготовил снова",
    rec_history_add_cart: "В корзину",
    
    cat_breakfast: "Завтрак",
    cat_lunch: "Обед",
    cat_dinner: "Ужин",
    cat_snack: "Перекус",
    cat_dessert: "Десерт",
"""
en_extra = """
    // Recipes
    rec_title: "Recipes",
    rec_liked: "My Likes ❤️",
    rec_history: "Cooking History",
    rec_mode_fridge_title: "Cook from what I have",
    rec_mode_fridge_desc: "Recipes based on the products in your fridge",
    rec_products_avail: "{{count}} products available",
    rec_mode_shop_title: "I want to shop",
    rec_mode_shop_desc: "Search global recipes, add missing ingredients to cart",
    rec_wishes_label: "Your wishes for the Chef (e.g., going hiking, want a hearty breakfast)",
    rec_wishes_placeholder: "Describe wishes: calories, products/restrictions, goals, etc.",
    rec_expiring_title: "Use expiring products",
    rec_on: "on",
    rec_off: "off",
    rec_expiring_desc: "Use products with the shortest expiry date for generating recipes.",
    rec_saved_plan: "Saved plan available: ",
    rec_open_plan: "Open saved plan",
    rec_single_title: "Single meal",
    rec_single_desc: "3 recipe options to choose from",
    rec_weekly_title: "Weekly plan",
    rec_weekly_desc: "21 recipes: breakfast, lunch, and dinner for 7 days",
    rec_mealprep_title: "Meal Prep",
    rec_mealprep_desc: "Weekly set: soup + main + breakfast + snack (7 servings each)",
    rec_cat_desc: "Choose a meal type, and AI will suggest 3 options for this category.",
    rec_cat_ideas: "3 Chef's ideas",
    rec_loading_ai: "AI is cooking recipes...",
    rec_loading_time: "This may take up to 2 minutes",
    rec_liked_empty: "You haven't liked any recipes yet.",
    rec_history_clear: "Clear",
    rec_history_empty: "No cooked recipes yet.",
    rec_history_cook_again: "Cooked again",
    rec_history_add_cart: "Add to cart",
    
    cat_breakfast: "Breakfast",
    cat_lunch: "Lunch",
    cat_dinner: "Dinner",
    cat_snack: "Snack",
    cat_dessert: "Dessert",
"""
de_extra = """
    // Recipes
    rec_title: "Rezepte",
    rec_liked: "Meine Likes ❤️",
    rec_history: "Kochverlauf",
    rec_mode_fridge_title: "Kochen mit dem, was da ist",
    rec_mode_fridge_desc: "Rezepte basierend auf den Produkten in deinem Kühlschrank",
    rec_products_avail: "{{count}} Produkte verfügbar",
    rec_mode_shop_title: "Ich möchte einkaufen",
    rec_mode_shop_desc: "Suche nach globalen Rezepten, füge fehlende Zutaten hinzu",
    rec_wishes_label: "Deine Wünsche für den Koch (z.B. gehe wandern, herzhaftes Frühstück)",
    rec_wishes_placeholder: "Wünsche beschreiben: Kalorien, Zutaten/Einschränkungen, Ziele usw.",
    rec_expiring_title: "Ablaufende Produkte nutzen",
    rec_on: "an",
    rec_off: "aus",
    rec_expiring_desc: "Nutze Produkte mit dem kürzesten Haltbarkeitsdatum für die Rezepte.",
    rec_saved_plan: "Gespeicherter Plan verfügbar: ",
    rec_open_plan: "Plan öffnen",
    rec_single_title: "Einmalige Mahlzeit",
    rec_single_desc: "3 Rezeptoptionen zur Auswahl",
    rec_weekly_title: "Wochenplan",
    rec_weekly_desc: "21 Rezepte: Frühstück, Mittag, Abendessen für 7 Tage",
    rec_mealprep_title: "Meal Prep",
    rec_mealprep_desc: "Wochenset: Suppe + Hauptspeise + Frühstück + Snack (je 7 Port.)",
    rec_cat_desc: "Wähle eine Mahlzeit und die KI schlägt 3 Optionen vor.",
    rec_cat_ideas: "3 Kochideen",
    rec_loading_ai: "KI kocht Rezepte...",
    rec_loading_time: "Dies kann bis zu 2 Minuten dauern",
    rec_liked_empty: "Du hast noch keine Rezepte gelikt.",
    rec_history_clear: "Leeren",
    rec_history_empty: "Noch keine gekochten Rezepte.",
    rec_history_cook_again: "Noch mal gekocht",
    rec_history_add_cart: "In den Warenkorb",
    
    cat_breakfast: "Frühstück",
    cat_lunch: "Mittagessen",
    cat_dinner: "Abendessen",
    cat_snack: "Snack",
    cat_dessert: "Dessert",
"""

t_code = t_code.replace('    card_delete: "Удалить продукт?",\n', f'    card_delete: "Удалить продукт?",\n{ru_extra}')
t_code = t_code.replace('    card_delete: "Delete product?",\n', f'    card_delete: "Delete product?",\n{en_extra}')
t_code = t_code.replace('    card_delete: "Produkt löschen?",\n', f'    card_delete: "Produkt löschen?",\n{de_extra}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(t_code)

print("Dictionary expanded for Recipes.tsx!")

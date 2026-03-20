import os
import re

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\Index.tsx"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace useSettings with useTranslation
text = text.replace('import { useSettings } from "@/hooks/useSettings";', 'import { useTranslation } from "@/hooks/useTranslation";')
text = text.replace('  useSettings();', '  const { t } = useTranslation();')

# 1. Simple strings
text = text.replace('<h1 className="text-2xl font-bold tracking-tight">Продукты</h1>', '<h1 className="text-2xl font-bold tracking-tight">{t("idx_title")}</h1>')
text = text.replace('<div className="text-sm font-semibold text-card-foreground">Управление запасами ✨</div>', '<div className="text-sm font-semibold text-card-foreground">{t("idx_inventory_title")}</div>')
text = text.replace('{listening ? "Слушаю..." : "Микрофон"}', '{listening ? t("idx_listening") : t("idx_mic")}')
text = text.replace('placeholder="Например: Я съел все яйца / Ich habe keine Milch mehr / Добавь 2 литра молока / Сколько осталось сыра?"', 'placeholder={t("idx_chat_placeholder") as string}')
text = text.replace('{m.role === "assistant" ? "Шеф:" : "Вы:"}', '{m.role === "assistant" ? t("idx_chef") : t("idx_you")}')
text = text.replace('<h2 className="text-sm font-bold truncate">Мастхев продукты</h2>', '<h2 className="text-sm font-bold truncate">{t("idx_musthave_title")}</h2>')
text = text.replace('<p className="text-[11px] text-muted-foreground truncate">Добавляются в корзину при необходимости</p>', '<p className="text-[11px] text-muted-foreground truncate">{t("idx_musthave_subtitle")}</p>')
text = text.replace('{mustHaveExpanded ? "Скрыть" : "Показать"}', '{mustHaveExpanded ? t("idx_hide") : t("idx_show")}')

# 2. Status replacements
text = text.replace('{ label: "Нужно купить", tone: "text-red-600" }', '{ label: t("idx_need_buy") as string, tone: "text-red-600" }')
text = text.replace('label: `Почти нет (${qty} ${def.unit})`', 'label: t("idx_running_low", {qty, unit: def.unit}) as string')
text = text.replace('label: `Есть (${qty} ${def.unit})`', 'label: t("idx_in_stock", {qty, unit: def.unit}) as string')

# 3. Cart text
text = text.replace('>В корзине</span>', '>{t("idx_in_cart")}</span>')
text = text.replace('>Нет в корзине</span>', '>{t("idx_not_in_cart")}</span>')
text = text.replace('placeholder="Добавить (например: Яблоки)"', 'placeholder={t("idx_add_placeholder") as string}')
text = text.replace('>Добавить</button>', '>{t("idx_add_btn")}</button>')

# 4. Empty state
text = text.replace('<p className="text-lg font-medium">Пора в магазин</p>', '<p className="text-lg font-medium">{t("idx_time_to_shop")}</p>')
text = text.replace('<p className="text-sm">Здесь пока пусто</p>', '<p className="text-sm">{t("idx_empty_here")}</p>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Index.tsx translated!")

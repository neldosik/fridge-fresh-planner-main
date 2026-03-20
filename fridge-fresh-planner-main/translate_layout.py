import os
import re

base = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src"

# Update TabSwitcher.tsx
path_ts = os.path.join(base, "components", "TabSwitcher.tsx")
with open(path_ts, 'r', encoding='utf-8') as f:
    ts_code = f.read()

if "useTranslation" not in ts_code:
    ts_code = 'import { useTranslation } from "@/hooks/useTranslation";\n' + ts_code
    ts_code = ts_code.replace("const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {", 
                              "const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {\n  const { t } = useTranslation();")
    ts_code = ts_code.replace("{tab.label}", '{t(`tab_${tab.id}` as any)}')

with open(path_ts, 'w', encoding='utf-8') as f:
    f.write(ts_code)

# Update BottomNav.tsx
path_bn = os.path.join(base, "components", "BottomNav.tsx")
with open(path_bn, 'r', encoding='utf-8') as f:
    bn_code = f.read()

if "useTranslation" not in bn_code:
    bn_code = 'import { useTranslation } from "@/hooks/useTranslation";\n' + bn_code
    bn_code = bn_code.replace("const BottomNav = ({ onAddClick }: BottomNavProps) => {", 
                              "const BottomNav = ({ onAddClick }: BottomNavProps) => {\n  const { t } = useTranslation();")
    
    # We will just map the paths to keys.
    # "/" -> "nav_fridge", "/recipes" -> "nav_recipes", "/shopping" -> "nav_cart", "/settings" -> "nav_settings"
    # Wait, the navItems are defined inside the component. We can just use t().
    bn_code = bn_code.replace('label: "Продукты"', 'label: t("nav_fridge")')
    bn_code = bn_code.replace('label: "Рецепты"', 'label: t("nav_recipes")')
    bn_code = bn_code.replace('label: "Список"', 'label: t("nav_cart")')
    bn_code = bn_code.replace('label: "Настройки"', 'label: t("nav_settings")')
    
    # And the add button:
    bn_code = bn_code.replace('aria-label="Добавить продукт"', 'aria-label={t("nav_add") as string}')
    bn_code = bn_code.replace('<span className="text-[10px] font-medium">Добавить</span>', '<span className="text-[10px] font-medium">{t("nav_add")}</span>')

with open(path_bn, 'w', encoding='utf-8') as f:
    f.write(bn_code)

print("Updated base navigation components.")

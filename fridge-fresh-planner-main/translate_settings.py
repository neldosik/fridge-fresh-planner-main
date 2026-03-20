import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\Settings.tsx"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Make sure useTranslation is imported and used
if 'useTranslation' not in text:
    text = text.replace('import { useTheme } from "@/components/ThemeProvider";', 'import { useTheme } from "@/components/ThemeProvider";\nimport { useTranslation } from "@/hooks/useTranslation";')

if 'const { t } = useTranslation();' not in text:
    text = text.replace('const Settings = () => {', 'const Settings = () => {\n  const { t } = useTranslation();')

text = text.replace('toast.success("Имя профиля обновлено!");', 'toast.success(t("set_toast_saved") as string);')
text = text.replace('toast.error("Ошибка при выходе");', 'toast.error(t("set_toast_logout_err") as string);')
text = text.replace('"ВНИМАНИЕ: Это действие нельзя отменить. Все ваши данные будут удалены. Вы уверены?"', 't("set_delete_confirm") as string')
text = text.replace('toast.info("Запрос на удаление отправлен. Проверьте почту для подтверждения.");', 'toast.info(t("set_toast_delete") as string);')

text = text.replace('>Настройки</h1>', '>{t("set_title")}</h1>')
text = text.replace('>Управляйте своим профилем и приложением</p>', '>{t("set_desc")}</p>')
text = text.replace('>Ваш профиль</CardTitle>', '>{t("set_profile")}</CardTitle>')
text = text.replace('>Имя в приложении</Label>', '>{t("set_name_label")}</Label>')
text = text.replace('placeholder="Как вас называть?"', 'placeholder={t("set_name_placeholder") as string}')
text = text.replace('{loading ? "Сохранение..." : "Сохранить изменения"}', '{loading ? t("set_saving") : t("set_save_btn")}')
text = text.replace('>Внешний вид</CardTitle>', '>{t("set_appearance")}</CardTitle>')
text = text.replace('>Темная тема</Label>', '>{t("set_dark_mode")}</Label>')
text = text.replace('>Использовать ночной режим</p>', '>{t("set_dark_mode_desc")}</p>')
text = text.replace('>Язык интерфейса</Label>', '>{t("set_lang")}</Label>')
text = text.replace('placeholder="Выберите язык"', 'placeholder={t("set_lang_placeholder") as string}')
text = text.replace('>Валюта</Label>', '>{t("set_currency")}</Label>')
text = text.replace('placeholder="Выберите валюту"', 'placeholder={t("set_currency_placeholder") as string}')
text = text.replace('Выйти из системы', '{t("set_logout")}')
text = text.replace('Удалить аккаунт навсегда', '{t("set_delete_account")}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Settings.tsx translated!")

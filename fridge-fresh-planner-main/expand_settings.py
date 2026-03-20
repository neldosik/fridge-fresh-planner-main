import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"

with open(path, 'r', encoding='utf-8') as f:
    t_code = f.read()

ru_extra = """
    set_title: "Настройки",
    set_desc: "Управляйте своим профилем и приложением",
    set_profile: "Ваш профиль",
    set_name_label: "Имя в приложении",
    set_name_placeholder: "Как вас называть?",
    set_saving: "Сохранение...",
    set_save_btn: "Сохранить изменения",
    set_toast_saved: "Имя профиля обновлено!",
    set_appearance: "Внешний вид",
    set_dark_mode: "Темная тема",
    set_dark_mode_desc: "Использовать ночной режим",
    set_lang: "Язык интерфейса",
    set_lang_placeholder: "Выберите язык",
    set_currency: "Валюта",
    set_currency_placeholder: "Выберите валюту",
    set_logout: "Выйти из системы",
    set_toast_logout_err: "Ошибка при выходе",
    set_delete_account: "Удалить аккаунт навсегда",
    set_delete_confirm: "ВНИМАНИЕ: Это действие нельзя отменить. Все ваши данные будут удалены. Вы уверены?",
    set_toast_delete: "Запрос на удаление отправлен. Проверьте почту для подтверждения.",
"""
en_extra = """
    set_title: "Settings",
    set_desc: "Manage your profile and application",
    set_profile: "Your Profile",
    set_name_label: "App Display Name",
    set_name_placeholder: "How should we call you?",
    set_saving: "Saving...",
    set_save_btn: "Save changes",
    set_toast_saved: "Profile name updated!",
    set_appearance: "Appearance",
    set_dark_mode: "Dark mode",
    set_dark_mode_desc: "Use night mode",
    set_lang: "Interface Language",
    set_lang_placeholder: "Select language",
    set_currency: "Currency",
    set_currency_placeholder: "Select currency",
    set_logout: "Log out",
    set_toast_logout_err: "Error during logout",
    set_delete_account: "Delete account permanently",
    set_delete_confirm: "WARNING: This action cannot be undone. All your data will be deleted. Are you sure?",
    set_toast_delete: "Deletion request sent. Check your email for confirmation.",
"""
de_extra = """
    set_title: "Einstellungen",
    set_desc: "Verwalte dein Profil und die Anwendung",
    set_profile: "Dein Profil",
    set_name_label: "Anzeigename",
    set_name_placeholder: "Wie sollen wir dich nennen?",
    set_saving: "Speichern...",
    set_save_btn: "Änderungen speichern",
    set_toast_saved: "Profilname aktualisiert!",
    set_appearance: "Erscheinungsbild",
    set_dark_mode: "Dunkler Modus",
    set_dark_mode_desc: "Nachtmodus verwenden",
    set_lang: "Sprache",
    set_lang_placeholder: "Sprache auswählen",
    set_currency: "Währung",
    set_currency_placeholder: "Währung auswählen",
    set_logout: "Abmelden",
    set_toast_logout_err: "Fehler beim Abmelden",
    set_delete_account: "Konto dauerhaft löschen",
    set_delete_confirm: "WARNUNG: Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden gelöscht. Bist du sicher?",
    set_toast_delete: "Löschanfrage gesendet. Überprüfe deine E-Mail zur Bestätigung.",
"""

t_code = t_code.replace('    sl_cat_sonstiges: "Остальное",\n', f'    sl_cat_sonstiges: "Остальное",\n{ru_extra}')
t_code = t_code.replace('    sl_cat_sonstiges: "Other",\n', f'    sl_cat_sonstiges: "Other",\n{en_extra}')
t_code = t_code.replace('    sl_cat_sonstiges: "Sonstiges",\n', f'    sl_cat_sonstiges: "Sonstiges",\n{de_extra}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(t_code)

print("Settings translations added.")

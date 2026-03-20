import os
from datetime import datetime

path_i18n = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\hooks\\useTranslation.ts"
path_ai = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\services\\inventoryAssistantService.ts"

# 1. Fix DE translations in useTranslation.ts
with open(path_i18n, 'r', encoding='utf-8') as f:
    t_code = f.read()

de_extra = """
    // Index.tsx
    idx_title: "Produkte",
    idx_inventory_title: "Inventarverwaltung ✨",
    idx_listening: "Höre zu...",
    idx_mic: "Mikrofon",
    idx_chat_placeholder: "Z.B. Ich habe keine Eier mehr / Ich habe 2 Liter Milch / Wie viel Käse ist noch da?",
    idx_chef: "Koch:",
    idx_you: "Du:",
    idx_musthave_title: "Must-Have Produkte",
    idx_musthave_subtitle: "Werden bei Bedarf zum Warenkorb hinzugefügt",
    idx_hide: "Ausblenden",
    idx_show: "Anzeigen",
    idx_need_buy: "Muss gekauft werden",
    idx_running_low: "Fast leer ({{qty}} {{unit}})",
    idx_in_stock: "Vorhanden ({{qty}} {{unit}})",
    idx_in_cart: "Im Warenkorb",
    idx_not_in_cart: "Nicht im Warenkorb",
    idx_add_placeholder: "Hinzufügen (z.B. Äpfel)",
    idx_add_btn: "Hinzufügen",
    idx_time_to_shop: "Zeit zum Einkaufen",
    idx_empty_here: "Hier ist es noch leer",

    // AddProductForm
    add_title_scan: "Bon scannen",
    add_title_manual: "Produkt hinzufügen",
    add_name: "Name",
    add_qty: "Menge",
    add_unit: "Einh.",
    add_icon: "Symbol",
    add_expiry: "Ablauf",
    add_cancel: "Abbrechen",

    add_analyze: "Bon wird analysiert...",
    add_ai_parsing: "KI verarbeitet Produkte",
    add_new_product: "Neues Produkt",
    add_name_placeholder: "z.B. Milch",
    add_location: "Lagerort",
    add_scan_btn: "Bon scannen",
    add_adding_btn: "Wird hinzugefügt...",
    add_submit: "Hinzufügen",

    // ProductCard
    card_expiry: "Haltbar bis: ",
    card_empty: "Leer",
    card_delete: "Produkt löschen?",

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

    rec_toast_err_ai: "Verbindungsfehler mit dem Koch, bitte erneut versuchen",
    rec_toast_err_gen: "Fehler beim Generieren der Rezepte",
    rec_toast_all_ings: "Alle Zutaten sind bereits vorhanden!",
    rec_toast_cart_updated: "Warenkorb aktualisiert: +{{insertedCount}} Artikel, {{updatedCount}} aktualisiert",
    rec_toast_cart_has: "Die benötigten Zutaten sind bereits im Warenkorb",
    rec_toast_cooked: "Zutaten verbraucht! Guten Appetit! 🍽️",
    rec_toast_save_err: "Fehler beim Speichern",
    rec_toast_saved: "Rezept gespeichert!",

    mp_set_budget: "Budget Lidl Set",
    mp_set_vitamin: "Vitamin Set",
    mp_set_comfort: "Komfort Set",
    mp_title: "Meal Prep Sets",
    mp_desc: "Mittag- und Abendessen sind verschiedene warme Gerichte oder herzhafte Salate, Lidl München Preise",
    mp_reroll: "Sets neu generieren",
    mp_what_to_consider: "Was ist zu beachten? (z.B. keine Nüsse im Laden)",
    mp_wishes_placeholder: "Schreibe hier zusätzliche Wünsche für das Set",
    mp_set_prefix: "Set #{{num}}",
    mp_4_dishes: "4 Gerichte für die Woche",
    mp_approx_price: "Ca. {{price}}",
    mp_7_days_note: "(für 7 Tage für alle Gerichte)",
    mp_select_set: "Set auswählen",

    rc_replace: "Ersetzen",
    rc_unlike: "Aus Favoriten entfernen",
    rc_like: "Zu Favoriten hinzufügen",
    rc_min: "Min",
    rc_kcal: "kcal",
    rc_collapse: "Zuklappen",
    rc_details: "Details",
    rc_to_cart: "In den Warenkorb",
    rc_cooking: "Ich koche!",
    rc_save: "Speichern",
    rc_ingredients: "Zutaten",
    rc_have_approx: "habe ~{{qty}} {{unit}}",
    rc_total_lidl: "Gesamt (Lidl München Preise)",
    rc_preparation: "Zubereitung",

    sl_title: "Warenkorb",
    sl_subtitle: "Lidl München Preise (EUR)",
    sl_share_wa: "Liste per WhatsApp senden",
    sl_empty_title: "Warenkorb ist leer",
    sl_empty_desc: "Füge ein Rezept im 'Ich möchte einkaufen' Modus hinzu",
    sl_bought: "Gekauft",
    sl_clear: "Leeren",
    sl_wa_list: "Einkaufsliste (Lidl München, Preise in {{currency}}):",
    sl_wa_total: "Gesamt: ~{{total}}{{currency}}",
    sl_cat_obst: "Obst & Gemüse",
    sl_cat_kuhlung: "Kühlung",
    sl_cat_tiefkuehl: "Tiefkühlkost",
    sl_cat_sonstiges: "Sonstiges",

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

# Replace the de block
if 'tab_shelf: "Vorrat",' in t_code and not 'idx_title: "Produkte",' in t_code:
    t_code = t_code.replace('tab_shelf: "Vorrat",\n  }', f'tab_shelf: "Vorrat",\n{de_extra}  }}')

with open(path_i18n, 'w', encoding='utf-8') as f:
    f.write(t_code)

print("Restored DE translations.")

# 2. Inject Date into AI Prompt
with open(path_ai, 'r', encoding='utf-8') as f:
    ai_code = f.read()

# Current prompt starts around line 90
if "Текущие продукты" in ai_code and "Текущая дата:" not in ai_code:
    ai_code = ai_code.replace(
        "Текущие продукты (JSON):",
        "Текущая дата: ${new Date().toISOString().split(\"T\")[0]}\nТекущие продукты (JSON):"
    )

with open(path_ai, 'w', encoding='utf-8') as f:
    f.write(ai_code)

print("Added current date to AI prompt.")

import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\Settings.tsx"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Impor component
if 'InstallPwaButton' not in text:
    text = text.replace('import { LogOut, Settings as SettingsIcon, Globe, MapPin, Banknote, Trash2 } from "lucide-react";', 
                        'import { LogOut, Settings as SettingsIcon, Globe, MapPin, Banknote, Trash2, Download } from "lucide-react";\nimport { InstallPwaButton } from "@/components/InstallPwaButton";')

# Inject into jsx
if 'InstallPwaButton />' not in text:
    target = '<div className="space-y-4">'
    replacement = '<div className="space-y-4">\n              <InstallPwaButton />'
    
    # Wait, the target might not be unique. We will insert it right before the Danger zone or in Appearance
    # Let's insert it right after the Apperance card content.
    target_card = '</CardContent>\n        </Card>\n\n        {/* Опасная зона */}'
    replacement_card = '<InstallPwaButton />\n          </CardContent>\n        </Card>\n\n        {/* Опасная зона */}'
    text = text.replace(target_card, replacement_card)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Injected InstallPwaButton into Settings.tsx")

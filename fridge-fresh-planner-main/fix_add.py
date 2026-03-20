import os

path = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\components\\AddProductForm.tsx"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add const { t } = useTranslation() if missing
if "const { t } = useTranslation();" not in text:
    text = text.replace('const AddProductForm = ({ open, onClose, defaultLocation }: AddProductFormProps) => {', 'const AddProductForm = ({ open, onClose, defaultLocation }: AddProductFormProps) => {\n  const { t } = useTranslation();')

# Move LOCATIONS inside the component
if "const LOCATIONS =" in text and "const LOCATIONS = [\n  { id: \"fridge\", label: \"Холодильник\" }," in text:
    old_locs = """const LOCATIONS = [
  { id: "fridge", label: "Холодильник" },
  { id: "freezer", label: "Морозилка" },
  { id: "shelf", label: "Полка" },
];"""
    text = text.replace(old_locs, "")
    new_locs = """  const LOCATIONS = [
    { id: "fridge", label: t("tab_fridge") },
    { id: "freezer", label: t("tab_freezer") },
    { id: "shelf", label: t("tab_shelf") },
  ];"""
    text = text.replace('const [name, setName] = useState("");', f'{new_locs}\n  const [name, setName] = useState("");')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("AddProductForm fixed!")

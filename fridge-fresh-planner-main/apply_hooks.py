import os
import re

def insert_hook(file_path, comp_name):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useSettings()' in content:
        return

    content = 'import { useSettings } from "@/hooks/useSettings";\n' + content
    
    # regex to find the start of the component
    # e.g. const ShoppingList = () => {  OR const RecipeCard = ({ ... }) => {
    
    # For ShoppingList: const ShoppingList = () => {
    # For RecipeCard: const RecipeCard = ({ ... }) => {
    
    pattern = rf"(const {comp_name} = \([^=]*=>\s*{{)"
    
    match = re.search(pattern, content)
    if match:
        content = content[:match.end()] + "\n  useSettings();" + content[match.end():]
    else:
        print(f"Failed to find component {comp_name} in {file_path}")
            
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

base = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src"
insert_hook(os.path.join(base, "pages", "ShoppingList.tsx"), "ShoppingList")
insert_hook(os.path.join(base, "components", "RecipeCard.tsx"), "RecipeCard")
insert_hook(os.path.join(base, "components", "MealPrepSetsView.tsx"), "MealPrepSetsView")

print("Added useSettings hooks!")

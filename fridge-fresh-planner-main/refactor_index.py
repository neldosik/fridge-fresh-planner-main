import os
import re

file_path = os.path.join("c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src", "pages", "Index.tsx")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add hook import
if "import { useSettings } from \"@/hooks/useSettings\";" not in content:
    content = 'import { useSettings } from "@/hooks/useSettings";\n' + content

# 2. Add useSettings inside Index
content = re.sub(r'const Index = \(\) => {\n', 'const Index = () => {\n  useSettings();\n', content)

# 3. Replace MUST_HAVE constant and ensureMustHaveInShoppingList function
pattern_must_have = r'const MUST_HAVE = \[.*?\] as const;'
replacement_must_have = """
  const defaultMustHave = [
    { key: "milk", name: "Молоко", icon: "🥛", unit: "л", lowQty: 1 },
    { key: "eggs", name: "Яйца", icon: "🥚", unit: "шт", lowQty: 4 },
    { key: "cheese", name: "Сыр", icon: "🧀", unit: "г", lowQty: 100 },
    { key: "bread", name: "Хлеб", icon: "🍞", unit: "шт", lowQty: 1 },
  ];

  const [mustHaveList, setMustHaveList] = useState(() => {
    const saved = localStorage.getItem("app_must_have");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultMustHave;
  });

  useEffect(() => {
    localStorage.setItem("app_must_have", JSON.stringify(mustHaveList));
  }, [mustHaveList]);

  const removeMustHave = (key) => {
    setMustHaveList(prev => prev.filter(item => item.key !== key));
  };

  const [newMustHaveName, setNewMustHaveName] = useState("");
  const [newMustHaveIcon, setNewMustHaveIcon] = useState("🍽️");
  
  const addMustHave = () => {
    if (!newMustHaveName.trim()) return;
    const newItem = {
      key: crypto.randomUUID(),
      name: newMustHaveName.trim(),
      icon: newMustHaveIcon,
      unit: "шт",
      lowQty: 1,
    };
    setMustHaveList(prev => [...prev, newItem]);
    setNewMustHaveName("");
    setNewMustHaveIcon("🍽️");
  };
"""

content = re.sub(pattern_must_have, replacement_must_have, content, flags=re.DOTALL)

# 4. Remove ensureMustHaveInShoppingList and its useEffect entirely
pattern_ensure = r'const pendingMustHaveRef = useRef<Set<string>>\(new Set\(\)\);.*?void ensureMustHaveInShoppingList\(\);\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, \[products, activeShoppingItems\]\);\n'
content = re.sub(pattern_ensure, '', content, flags=re.DOTALL)

# 5. Fix the MUST_HAVE render logic inside the UI
pattern_render = r'\{MUST_HAVE\.map\(\(def\) => \{.*?const product = products.*?return \('
new_render = """
                {mustHaveList.map((def) => {
                  const product = products.find((p: any) => {
                    const base = normalizeForMatch(String(p?.name || ""));
                    return base.includes(normalizeForMatch(def.name)) || normalizeForMatch(def.name).includes(base);
                  });

                  const qty = product ? Number(product.quantity || 0) : 0;
                  const inShopping = activeShoppingItems.some((i: any) => normalizeForMatch(i?.name || "") === normalizeForMatch(def.name));

                  const status =
                    !product || qty <= 0
                      ? { label: "Нужно купить", tone: "text-red-600" }
                      : qty <= def.lowQty
                        ? { label: `Почти нет (${qty} ${def.unit})`, tone: "text-amber-600" }
                        : { label: `Есть (${qty} ${def.unit})`, tone: "text-green-600" };

                  return (
"""
content = re.sub(r'\{MUST_HAVE\.map\(\(def\).*?return \(', new_render, content, flags=re.DOTALL)

# 6. Add Trash2 icon and new "Add to Must Have" form
# We will inject Trash2 import if not exists
if "import { Trash2" not in content:
    content = content.replace('import { Mic, Send } from "lucide-react";', 'import { Mic, Send, Trash2 } from "lucide-react";')

# End of the return section inside def map
pattern_return_end = r'\) :\s*\((?:\s*<div.*?>)?\s*<span className="text-\[11px\] font-bold text-muted-foreground whitespace-nowrap">Нет в списке</span>\s*(?:</div>\s*)?\)\s*\}\s*</div>\s*\);\s*\}\)\}\s*</div>\s*</div>\s*\)'

new_return_end = """) : (
                        <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">Нет в корзине</span>
                      )}
                      <button onClick={() => removeMustHave(def.key)} className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-2 shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                <input 
                  type="text" 
                  value={newMustHaveIcon} 
                  onChange={e => setNewMustHaveIcon(e.target.value)} 
                  className="w-10 h-8 rounded-lg bg-background border border-border text-center text-sm" 
                  maxLength={2}
                  placeholder="Иконка (🍽️)"
                />
                <input 
                  type="text" 
                  value={newMustHaveName} 
                  onChange={e => setNewMustHaveName(e.target.value)} 
                  className="flex-1 h-8 px-2 rounded-lg bg-background border border-border text-sm" 
                  placeholder="Добавить (например: Яблоки)"
                  onKeyDown={e => e.key === 'Enter' && addMustHave()}
                />
                <button 
                  onClick={addMustHave}
                  className="px-3 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                >
                  Добавить
                </button>
              </div>
            </div>
          )"""

content = re.sub(pattern_return_end, new_return_end, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!")

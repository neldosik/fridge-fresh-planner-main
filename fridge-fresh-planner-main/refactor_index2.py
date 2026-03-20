import os
import re

file_path = os.path.join("c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src", "pages", "Index.tsx")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure Trash2 is imported
if "import { Trash2" not in content:
    content = content.replace('import { Mic, Send } from "lucide-react";', 'import { Mic, Send, Trash2 } from "lucide-react";')

# We need to replace:
replace_from = """                      {inShopping ? (
                        <span className="text-[11px] font-bold text-primary whitespace-nowrap">В корзине</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}"""

replace_to = """                      {inShopping ? (
                        <span className="text-[11px] font-bold text-primary whitespace-nowrap">В корзине</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">—</span>
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
                  placeholder="🍽️"
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
          )}"""

old_str = replace_from.strip()
if old_str in content:
    content = content.replace(old_str, replace_to.strip())
else:
    print("Could not find exact string to replace. Trying regex...")
    pattern = r'\{\s*inShopping\s*\?\s*\(.*?\)\s*:\s*\(.*?\)\s*\}\s*</div>\s*\);\s*\}\)\}\s*</div>\s*</div>\s*\)\}'
    content = re.sub(pattern, replace_to.strip(), content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done fixing index!")

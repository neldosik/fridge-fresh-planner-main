import { useSettings } from "@/hooks/useSettings";
import { getCurrencySymbol } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Check, ShoppingCart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import AddProductForm from "@/components/AddProductForm";
import { Checkbox } from "@/components/ui/checkbox";

type LidlCartCategory = "Obst & Gemüse" | "Kühlung" | "Tiefkühlkost" | "Sonstiges";

function extractGermanPart(name: string) {
  const m = name.match(/\(([^)]+)\)/);
  return m?.[1]?.trim() || "";
}

function classifyLidlCategory(itemName: string): LidlCartCategory {
  const german = extractGermanPart(itemName).toLowerCase();
  const full = itemName.toLowerCase();

  const obstGemuse = [
    "gurken",
    "tomaten",
    "zwiebel",
    "knoblauch",
    "paprika",
    "kartoffel",
    "karotte",
    "möhre",
    "brokkoli",
    "spinat",
    "salat",
    "lauch",
    "pilz",
    "pilze",
    "beeren",
    "beere",
    "apfel",
    "banane",
    "orange",
    "zitrone",
    "zucchini",
    "aubergine",
    "kürbis",
    "kohl",
    "erdbe",
  ];
  const kuhlung = [
    "milch",
    "käse",
    "kaese",
    "joghurt",
    "butter",
    "sahne",
    "creme",
    "quark",
    "eier",
    "hähnchen",
    "haehnchen",
    "hähnchenbrustfilet",
    "schinken",
    "wurst",
    "fleisch",
    "rind",
    "schwein",
    "fisch",
    "geflügel",
    "gefluegel",
    "sauce",
    "saucen",
    "schmand",
    "salami",
    "quark",
  ];
  const tiefkuehl = ["tiefkühl", "tiefkuehl", "gefroren", "pizza", "lasagne", "pommes", "eis"];

  const hit = (arr: string[]) => arr.some((k) => german.includes(k) || full.includes(k));
  if (hit(obstGemuse)) return "Obst & Gemüse";
  if (hit(kuhlung)) return "Kühlung";
  if (hit(tiefkuehl) || german.includes("pizza") || german.includes("lasagne")) return "Tiefkühlkost";
  return "Sonstiges";
}

const ShoppingList = () => {
  useSettings();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["shopping_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_list")
        .select("*")
        .order("checked", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleCheck = async (id: string, checked: boolean) => {
    await supabase.from("shopping_list").update({ checked: !checked }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["shopping_list"] });
  };

  const removeItem = async (id: string) => {
    await supabase.from("shopping_list").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["shopping_list"] });
  };

  const clearChecked = async () => {
    const checkedIds = items.filter((i) => i.checked).map((i) => i.id);
    if (checkedIds.length === 0) return;
    for (const id of checkedIds) {
      await supabase.from("shopping_list").delete().eq("id", id);
    }
    queryClient.invalidateQueries({ queryKey: ["shopping_list"] });
  };

  const uncheckedItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);
  const totalPrice = uncheckedItems.reduce((s, i) => s + (Math.max(0, i.estimated_price || 0)) * i.quantity, 0);

  const groupedByCategory = uncheckedItems.reduce<Record<LidlCartCategory, typeof uncheckedItems>>((acc, item) => {
    const cat = classifyLidlCategory(item.name);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as any);

  const orderedCats: LidlCartCategory[] = ["Obst & Gemüse", "Kühlung", "Tiefkühlkost", "Sonstiges"];

  const shareToWhatsApp = () => {
    const lines: string[] = [];
    let sum = 0;
    lines.push("Список покупок (Lidl Munich, цены в ${getCurrencySymbol()}):");
    lines.push("");

    for (const cat of orderedCats) {
      const groupItems = groupedByCategory[cat] || [];
      if (!groupItems.length) continue;
      lines.push(`*${cat}*`);
      for (const item of groupItems) {
        const unitPrice = Math.max(0, item.estimated_price || 0);
        const total = unitPrice * item.quantity;
        sum += total;
        lines.push(`- ${item.name}: ${item.quantity} ${item.unit} (~${Math.round(total)}${getCurrencySymbol()})`);
      }
      lines.push("");
    }

    lines.push(`Итого: ~${Math.round(sum)}${getCurrencySymbol()}`);
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 pt-6 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Корзина</h1>
            <p className="text-xs text-muted-foreground">Цены Lidl Munich (EUR)</p>
          </div>
          <div className="flex items-center gap-3">
            {totalPrice > 0 && <span className="text-sm font-bold text-primary">~{Math.round(totalPrice)}{getCurrencySymbol()}</span>}
            <button
              type="button"
              onClick={shareToWhatsApp}
              className="text-xs font-semibold px-3 py-2 rounded-full border border-border hover:border-primary/60 hover:text-primary transition-colors whitespace-nowrap"
            >
              Отправить список в WhatsApp
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pb-32">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ShoppingCart size={48} className="mb-4 opacity-40" />
            <p className="text-lg font-medium">Корзина пуста</p>
            <p className="text-sm">Добавьте рецепт в режиме «Хочу в магазин»</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderedCats.map((cat) => {
              const sourceItems = groupedByCategory[cat] || [];
              if (!sourceItems.length) return null;
              return (
                <div key={cat}>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{cat}</p>
                  <div className="grid gap-2">
                    {sourceItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleCheck(item.id, item.checked)}
                        />
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} {item.unit}
                            {item.estimated_price && item.estimated_price > 0 && (
                              <span className="ml-2 text-primary">~{Math.round(item.estimated_price * item.quantity)}{getCurrencySymbol()}</span>
                            )}
                          </p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                          <Trash2 size={14} className="text-muted-foreground" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

            {checkedItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Куплено ({checkedItems.length})
                  </p>
                  <button onClick={clearChecked} className="text-xs text-destructive font-medium hover:text-destructive/80 transition-colors">
                    Очистить
                  </button>
                </div>
                <div className="grid gap-2">
                  {checkedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className="bg-card/50 border border-border/50 rounded-xl p-3 flex items-center gap-3 opacity-50"
                    >
                      <Checkbox checked onCheckedChange={() => toggleCheck(item.id, item.checked)} />
                      <span className="text-lg">{item.icon}</span>
                      <p className="text-sm text-muted-foreground line-through flex-1 truncate">{item.name}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav onAddClick={() => setFormOpen(true)} />
      <AddProductForm open={formOpen} onClose={() => setFormOpen(false)} defaultLocation="fridge" />
    </div>
  );
};

export default ShoppingList;

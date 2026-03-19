import { supabase } from "@/integrations/supabase/client";

type LidlUnit = "шт" | "г" | "кг" | "мл" | "л" | "уп" | "бут";

function normalizeName(name: string) {
  // examples:
  // "Чечевица (Linsen)" -> "Чечевица"
  // "Куриное филе" -> "Куриное филе"
  const base = name.split("(")[0]?.trim() || name.trim();
  return base.toLowerCase();
}

function toUnitKey(unit: string): LidlUnit | null {
  const u = unit.trim();
  if (u === "шт" || u === "г" || u === "кг" || u === "мл" || u === "л" || u === "уп" || u === "бут") return u;
  return null;
}

function convertQuantity(fromUnit: string, qty: number, toUnit: string): number | null {
  const from = toUnitKey(fromUnit);
  const to = toUnitKey(toUnit);
  if (!from || !to) return null;
  if (from === to) return qty;

  const mass: Record<string, "g" | "kg"> = { g: "g", кг: "kg", кг: "kg", kg: "kg", кг: "kg" } as any;
  const vol: Record<string, "ml" | "l"> = { мл: "ml", ml: "ml", л: "l", l: "l" } as any;

  const massFrom = from === "г" || from === "кг";
  if (massFrom) {
    if (from === "г" && to === "кг") return qty / 1000;
    if (from === "кг" && to === "г") return qty * 1000;
  }

  const volFrom = from === "мл" || from === "л";
  if (volFrom) {
    if (from === "мл" && to === "л") return qty / 1000;
    if (from === "л" && to === "мл") return qty * 1000;
  }

  return null;
}

export type SyncProduct = {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
};

// Mark matching shopping_list items as "bought" (checked=true) so they disappear from the active list.
export async function markShoppingItemsAsBoughtByProducts(products: SyncProduct[]) {
  const safeProducts = products
    .filter((p) => p && p.name && typeof p.quantity === "number" && p.quantity > 0)
    .slice(0, 30);
  if (safeProducts.length === 0) return;

  const { data: shoppingItems, error } = await supabase
    .from("shopping_list")
    .select("*")
    .eq("checked", false);

  if (error) return;
  if (!shoppingItems || shoppingItems.length === 0) return;

  const updates: { id: string; checked: boolean }[] = [];

  for (const item of shoppingItems as any[]) {
    const itemNorm = normalizeName(String(item.name || ""));
    const itemQty = Number(item.quantity || 0);
    const itemUnit = String(item.unit || "шт");
    if (!itemNorm || itemQty <= 0) continue;

    // Find best matching product (any product with same normalized base name)
    const match = safeProducts.find((p) => normalizeName(p.name) === itemNorm) || safeProducts.find((p) => normalizeName(p.name).includes(itemNorm));
    if (!match) continue;

    const productQty = Number(match.quantity || 0);
    if (productQty <= 0) continue;

    // If units match or convertible, check quantity.
    const converted = convertQuantity(match.unit, productQty, itemUnit);
    if (converted === null) {
      // Fallback: if unit not convertible, consider it bought only when units are exactly equal.
      if (String(match.unit) !== itemUnit) continue;
      updates.push({ id: item.id, checked: true });
    } else {
      if (converted >= itemQty) updates.push({ id: item.id, checked: true });
    }
  }

  if (updates.length === 0) return;

  for (const u of updates) {
    await supabase.from("shopping_list").update({ checked: true }).eq("id", u.id);
  }
}


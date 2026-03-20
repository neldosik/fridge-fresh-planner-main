import { getCurrencySymbol } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ShoppingCart, CookingPot, Bookmark, ChevronDown, Clock, Flame, Users, Minus, Plus, Heart } from "lucide-react";
import type { RecipeData } from "@/pages/Recipes";

interface RecipeCardProps {
  recipe: RecipeData;
  mode: "fridge" | "shop";
  onReroll: () => void;
  onAddToCart: () => void;
  onCook: () => void;
  onSave: () => void;
  availableProducts: any[];
  compact?: boolean;
  liked?: boolean;
  onToggleLike?: () => void;
}

const RecipeCard = ({
  recipe,
  mode,
  onReroll,
  onAddToCart,
  onCook,
  onSave,
  availableProducts,
  compact,
  liked,
  onToggleLike,
}: RecipeCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [servings, setServings] = useState(recipe.servings);
  const multiplier = servings / recipe.servings;

  const baseName = (s: string) => (s.split("(")[0] || s).trim().toLowerCase();

  const convertQty = (fromUnit: string, qty: number, toUnit: string): number | null => {
    const f = fromUnit;
    const t = toUnit;

    // Spoon conversions (rough, but better than no comparison)
    if (f === "ст.л" && t === "мл") return qty * 15;
    if (f === "мл" && t === "ст.л") return qty / 15;
    if (f === "ст.л" && t === "л") return qty * 0.015;
    if (f === "л" && t === "ст.л") return qty / 0.015;

    if (f === "ч.л" && t === "мл") return qty * 5;
    if (f === "мл" && t === "ч.л") return qty / 5;
    if (f === "ч.л" && t === "л") return qty * 0.005;
    if (f === "л" && t === "ч.л") return qty / 0.005;

    // Mass
    const mass: Record<string, "g" | "kg"> = { г: "g", g: "g", кг: "kg", kg: "kg" };
    const vol: Record<string, "ml" | "l"> = { ml: "ml", мл: "ml", л: "l", l: "l" };

    const fromMass = mass[f];
    const toMass = mass[t];
    if (fromMass && toMass) {
      if (fromMass === toMass) return qty;
      return fromMass === "g" && toMass === "kg" ? qty / 1000 : qty * 1000;
    }

    const fromVol = vol[f];
    const toVol = vol[t];
    if (fromVol && toVol) {
      if (fromVol === toVol) return qty;
      return fromVol === "ml" && toVol === "l" ? qty / 1000 : qty * 1000;
    }

    // Same discrete unit
    if (f === t) return qty;
    return null;
  };

  const findBestProductForIngredient = (ingName: string) => {
    const ingBase = baseName(ingName);
    const candidates = availableProducts
      .map((p: any) => {
        const pBase = baseName(String(p?.name || ""));
        const full = String(p?.name || "").toLowerCase();
        let score = 0;
        if (pBase.includes(ingBase) || ingBase.includes(pBase)) score += 20;
        // small bonus if base substrings match
        if (pBase.includes(ingBase) && ingBase.length > 3) score += 10;
        if (full.includes(ingBase)) score += 5;
        return { p, score };
      })
      .filter((x: any) => x.score > 0)
      .sort((a: any, b: any) => b.score - a.score);

    return candidates[0]?.p || null;
  };

  return (
    <motion.div
      layout
      className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-2xl shrink-0">
            {recipe.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-card-foreground text-base leading-tight">{recipe.title}</h3>
            {!compact && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{recipe.description}</p>}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button onClick={onReroll} className="p-2 rounded-full hover:bg-secondary transition-colors" title="Заменить">
              <RefreshCw size={16} className="text-muted-foreground" />
            </button>
            {onToggleLike && (
              <button
                onClick={onToggleLike}
                className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                title={liked ? "Убрать из любимых" : "В избранное"}
              >
                <Heart
                  size={16}
                  className={liked ? "text-red-500 fill-red-500" : "text-muted-foreground"}
                />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock size={12} />{recipe.cook_time_minutes} мин</span>
          <span className="flex items-center gap-1"><Flame size={12} />{Math.round((recipe.calories_total || 0) * multiplier)} ккал</span>
          <div className="flex items-center gap-1 ml-auto">
            <Users size={12} />
            <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
              <Minus size={10} />
            </button>
            <span className="font-bold text-card-foreground w-4 text-center">{servings}</span>
            <button onClick={() => setServings(servings + 1)} className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
              <Plus size={10} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={() => setExpanded(!expanded)} className="flex-1 py-2 rounded-xl bg-secondary text-card-foreground text-xs font-medium flex items-center justify-center gap-1 hover:bg-muted transition-colors">
            <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Свернуть" : "Подробнее"}
          </button>
          {mode === "shop" && (
            <button onClick={onAddToCart} className="py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1 hover:bg-primary/90 transition-colors">
              <ShoppingCart size={14} />
              В корзину
            </button>
          )}
          <button onClick={onCook} className="py-2 px-3 rounded-xl bg-foreground text-background text-xs font-medium flex items-center gap-1 hover:opacity-90 transition-opacity">
            <CookingPot size={14} />
            Готовлю!
          </button>
          <button onClick={onSave} className="p-2 rounded-xl hover:bg-secondary transition-colors" title="Сохранить">
            <Bookmark size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Ингредиенты</h4>
                <div className="space-y-1.5">
                  {recipe.ingredients.map((ing, i) => {
                    const requiredQty = ing.quantity * multiplier;
                    const matched = mode === "fridge" ? findBestProductForIngredient(ing.name) : null;
                    const availableRaw = matched ? Number(matched.quantity || 0) : 0;
                    const availableConverted = matched && matched.unit ? convertQty(matched.unit, availableRaw, ing.unit) : null;
                    const hasEnough = matched ? (availableConverted !== null ? availableConverted >= requiredQty : availableRaw > 0) : false;
                    const availableLabel = mode === "fridge" ? hasEnough : Boolean(matched);
                    const hasAny = matched && availableRaw > 0;
                    return (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className={`${
                          mode === "fridge"
                            ? availableLabel
                              ? "text-card-foreground"
                              : "text-destructive"
                            : hasAny
                              ? "text-card-foreground"
                              : "text-muted-foreground"
                        }`}>
                          {mode === "fridge" && hasAny && hasEnough && <span className="text-primary mr-1">✓</span>}
                          {mode === "fridge" && hasAny && !hasEnough && <span className="text-primary mr-1">!</span>}
                          {mode !== "fridge" && hasAny && <span className="text-primary mr-1">✓</span>}
                          {ing.name}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {Math.round(ing.quantity * multiplier * 10) / 10} {ing.unit}
                          {mode === "fridge" && matched && availableConverted !== null && (
                            <span className={`ml-2 ${hasEnough ? "text-card-foreground" : "text-destructive"}`}>
                              есть ~{Math.round(availableConverted * 10) / 10} {ing.unit}
                            </span>
                          )}
                          {mode === "fridge" && matched && availableConverted === null && (
                            <span className="ml-2 text-muted-foreground">
                              есть ~{Math.round(availableRaw * 10) / 10} {matched.unit}
                            </span>
                          )}
                          {ing.estimated_price_rub && mode === "shop" && matched && !hasAny && ing.estimated_price_rub > 0 && (
                            <span className="ml-1 text-primary">
                              ~{Math.round(ing.estimated_price_rub * ing.quantity * multiplier)}{getCurrencySymbol()}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {mode === "shop" && (
                  <div className="mt-2 pt-2 border-t border-border flex justify-between text-sm font-bold">
                    <span className="text-card-foreground">Итого (Цены Lidl Munich)</span>
                    <span className="text-primary">
                      ~
                      {Math.round(
                        recipe.ingredients.reduce((s, i) => s + (i.estimated_price_rub || 0) * i.quantity * multiplier, 0),
                      )}
                      {getCurrencySymbol()}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Приготовление</h4>
                <ol className="space-y-2">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-card-foreground">
                      <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecipeCard;

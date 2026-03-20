import { useSettings } from "@/hooks/useSettings";
import { getCurrencySymbol } from "@/lib/utils";
import { useMemo } from "react";
import { motion } from "framer-motion";
import type { RecipeData } from "@/pages/Recipes";

interface MealPrepSetsViewProps {
  recipes: RecipeData[]; // ожидается 12 рецептов: 3 сета по 4
  onSelectSet: (index: number, setRecipes: RecipeData[]) => void;
  onRerollSets: () => void;
  extraConstraints: string;
  onExtraConstraintsChange: (value: string) => void;
}

const SET_NAMES = ["Бюджетный Lidl Сет", "Витаминный Сет", "Комфортный Сет"];
const SET_VIT_ICONS = ["🥦", "🥦🥦", "🥦🥦🥦"];

function chunkIntoSets(recipes: RecipeData[]) {
  const sets: RecipeData[][] = [];
  for (let i = 0; i < 3; i++) {
    const slice = recipes.slice(i * 4, i * 4 + 4);
    if (slice.length === 4) {
      sets.push(slice);
    }
  }
  return sets;
}

function calcSetPrice(recipes: RecipeData[]) {
  return Math.round(
    recipes.reduce(
      (sum, r) =>
        sum +
        r.ingredients.reduce((s, ing) => {
          if (typeof ing.estimated_price_rub !== "number" || ing.estimated_price_rub <= 0) return s;
          return s + ing.estimated_price_rub * ing.quantity;
        }, 0),
      0,
    ),
  );
}

const MealPrepSetsView = ({ recipes, onSelectSet, onRerollSets, extraConstraints, onExtraConstraintsChange }: MealPrepSetsViewProps) => {
  useSettings();
  const sets = useMemo(() => chunkIntoSets(recipes), [recipes]);

  return (
    <div className="pt-2 space-y-4">
      <div className="flex items-center justify-between mb-2 gap-3">
        <div>
          <h2 className="text-lg font-bold">Сеты Meal Prep</h2>
          <p className="text-xs text-muted-foreground">Обед и ужин — разные горячие блюда или сытные салаты, цены Lidl Munich</p>
        </div>
        <button
          onClick={onRerollSets}
          className="text-xs font-medium px-3 py-1.5 rounded-full border border-border hover:border-primary/60 hover:text-primary transition-colors shrink-0"
        >
          Реролл Сетов
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground block">
          Что учесть? (например: нет орехов в магазине)
        </label>
        <input
          type="text"
          value={extraConstraints}
          onChange={(e) => onExtraConstraintsChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onRerollSets();
            }
          }}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Напишите сюда дополнительные пожелания к сету"
        />
      </div>

      <div className="grid gap-3">
        {sets.map((setRecipes, i) => {
          const name = SET_NAMES[i] || `Сет ${i + 1}`;
          const vit = SET_VIT_ICONS[i] || "🥦🥦";
          const totalPrice = calcSetPrice(setRecipes);

          const breakfast = setRecipes.find((r) => r.meal_type === "breakfast") || setRecipes[0];
          const snack = setRecipes.find((r) => r.meal_type === "snack") || setRecipes[1] || setRecipes[0];
          const mains = setRecipes.filter((r) => r.meal_type === "soup" || r.meal_type === "main");

          const ordered: RecipeData[] = [];
          if (breakfast) ordered.push(breakfast);
          if (snack) ordered.push(snack);
          if (mains[0]) ordered.push(mains[0]);
          if (mains[1]) ordered.push(mains[1]);

          return (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Сет #{i + 1}</p>
                  <h3 className="text-base font-bold text-card-foreground">{name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">4 блюда на неделю</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xl" title="Иконка витаминной сбалансированности">
                    {vit}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    Примерно {totalPrice}{getCurrencySymbol()} 
                  </span>
                  <span className="text-[10px] text-muted-foreground">(на 7 дней для всех блюд)</span>
                </div>
              </div>

              <ol className="space-y-1.5 text-sm mb-3">
                {ordered.map((r, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[11px] text-muted-foreground shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-base">
                      <span className="mr-1">{r.icon}</span>
                      {r.title}
                    </span>
                  </li>
                ))}
              </ol>

              <button
                onClick={() => onSelectSet(i, setRecipes)}
                className="w-full mt-2 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                Выбрать Сет
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MealPrepSetsView;


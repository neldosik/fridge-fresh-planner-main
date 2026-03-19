import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RecipeCard from "./RecipeCard";
import type { RecipeData } from "@/pages/Recipes";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const ROWS = [
  { key: "breakfast", label: "Завтрак" },
  { key: "snack", label: "Перекус" },
  { key: "lunch", label: "Обед" },
  { key: "dinner", label: "Ужин" },
] as const;

type RowKey = (typeof ROWS)[number]["key"];

function pickByType(recipes: RecipeData[], mealType: NonNullable<RecipeData["meal_type"]>) {
  return recipes.find((r) => r.meal_type === mealType) || null;
}

function fallbackPick(recipes: RecipeData[], titleIncludes: string) {
  const q = titleIncludes.toLowerCase();
  return recipes.find((r) => r.title.toLowerCase().includes(q)) || null;
}

function buildMealPrepSet(recipes: RecipeData[]) {
  const breakfast = pickByType(recipes, "breakfast");
  const snack = pickByType(recipes, "snack");
  const soup = pickByType(recipes, "soup") || fallbackPick(recipes, "суп");
  const main = pickByType(recipes, "main");

  return { breakfast, snack, soup, main };
}

function buildSchedule(set: ReturnType<typeof buildMealPrepSet>) {
  // Alternation for mains: day0 lunch=soup dinner=main, day1 lunch=main dinner=soup, etc.
  const schedule: Record<RowKey, (RecipeData | null)[]> = {
    breakfast: Array(7).fill(set.breakfast),
    snack: Array(7).fill(set.snack),
    lunch: Array(7).fill(null),
    dinner: Array(7).fill(null),
  };

  for (let day = 0; day < 7; day++) {
    const even = day % 2 === 0;
    schedule.lunch[day] = even ? set.soup : set.main;
    schedule.dinner[day] = even ? set.main : set.soup;
  }

  return schedule;
}

function recipeIndex(recipes: RecipeData[], recipe: RecipeData | null) {
  if (!recipe) return -1;
  return recipes.findIndex((r) => r.title === recipe.title);
}

interface MealPrepPlanGridProps {
  recipes: RecipeData[]; // expected: 4 recipes (breakfast/snack/soup/main)
  mode: "fridge" | "shop";
  onReroll: (recipeIndex: number) => void; // reroll one of the base recipes; page may regenerate all anyway
  onAddToCart: (recipe: RecipeData) => void;
  onCook: (recipe: RecipeData) => void;
  onSave: (recipe: RecipeData) => void;
  availableProducts: any[];
  likedTitles?: string[];
  onToggleLike?: (title: string) => void;
}

const MealPrepPlanGrid = ({
  recipes,
  mode,
  onReroll,
  onAddToCart,
  onCook,
  onSave,
  availableProducts,
  likedTitles,
  onToggleLike,
}: MealPrepPlanGridProps) => {
  const [selected, setSelected] = useState<{ row: RowKey; day: number } | null>(null);

  const set = useMemo(() => buildMealPrepSet(recipes), [recipes]);
  const schedule = useMemo(() => buildSchedule(set), [set]);

  const selectedRecipe = selected ? schedule[selected.row][selected.day] : null;
  const selectedRecipeIdx = recipeIndex(recipes, selectedRecipe);

  return (
    <div className="pt-2 space-y-4">
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[650px] border-collapse">
          <thead>
            <tr>
              <th className="text-xs text-muted-foreground font-medium p-1 w-20"></th>
              {DAYS.map((day) => (
                <th key={day} className="text-xs text-muted-foreground font-bold p-1 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key}>
                <td className="text-xs text-muted-foreground font-medium p-1 align-middle">{row.label}</td>
                {DAYS.map((_, dayIdx) => {
                  const recipe = schedule[row.key][dayIdx];
                  const isSelected = selected?.row === row.key && selected?.day === dayIdx;
                  return (
                    <td key={dayIdx} className="p-1">
                      <button
                        onClick={() => setSelected(isSelected ? null : { row: row.key, day: dayIdx })}
                        className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-center ${
                          isSelected
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "bg-card border border-border hover:border-primary/40"
                        }`}
                      >
                        {recipe ? (
                          <>
                            <span className="text-lg">{recipe.icon}</span>
                            <span className="text-[9px] font-medium leading-tight line-clamp-2 px-0.5">{recipe.title}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs">...</span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence mode="wait">
        {selectedRecipe && selectedRecipeIdx >= 0 && (
          <motion.div
            key={`${selected?.row}-${selected?.day}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <RecipeCard
              recipe={selectedRecipe}
              mode={mode}
              onReroll={() => onReroll(selectedRecipeIdx)}
              onAddToCart={() => onAddToCart(selectedRecipe)}
              onCook={() => onCook(selectedRecipe)}
              onSave={() => onSave(selectedRecipe)}
              availableProducts={availableProducts}
              liked={likedTitles?.includes(selectedRecipe.title)}
              onToggleLike={onToggleLike ? () => onToggleLike(selectedRecipe.title) : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealPrepPlanGrid;


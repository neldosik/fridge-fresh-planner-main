import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RecipeCard from "./RecipeCard";
import type { RecipeData } from "@/pages/Recipes";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MEALS: Record<string, string> = { breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин" };
const MEAL_KEYS = ["breakfast", "lunch", "dinner"] as const;

interface WeeklyPlanGridProps {
  recipes: RecipeData[];
  mode: "fridge" | "shop";
  onReroll: (index: number) => void;
  onAddToCart: (recipe: RecipeData) => void;
  onCook: (recipe: RecipeData) => void;
  onSave: (recipe: RecipeData) => void;
  availableProducts: any[];
  likedTitles?: string[];
  onToggleLike?: (title: string) => void;
}

const WeeklyPlanGrid = ({
  recipes,
  mode,
  onReroll,
  onAddToCart,
  onCook,
  onSave,
  availableProducts,
  likedTitles,
  onToggleLike,
}: WeeklyPlanGridProps) => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const selectedRecipe = selectedCell !== null ? recipes[selectedCell] : null;

  return (
    <div className="pt-2 space-y-4">
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="text-xs text-muted-foreground font-medium p-1 w-16"></th>
              {DAYS.map((day) => (
                <th key={day} className="text-xs text-muted-foreground font-bold p-1 text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_KEYS.map((meal, mealIdx) => (
              <tr key={meal}>
                <td className="text-xs text-muted-foreground font-medium p-1 align-middle">{MEALS[meal]}</td>
                {DAYS.map((_, dayIdx) => {
                  const idx = dayIdx * 3 + mealIdx;
                  const recipe = recipes[idx];
                  const isSelected = selectedCell === idx;
                  return (
                    <td key={dayIdx} className="p-1">
                      <button
                        onClick={() => setSelectedCell(isSelected ? null : idx)}
                        className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-center ${
                          isSelected
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "bg-card border border-border hover:border-primary/40"
                        }`}
                      >
                        {recipe ? (
                          <>
                            <span className="text-lg">{recipe.icon}</span>
                            <span className="text-[9px] font-medium leading-tight line-clamp-2 px-0.5">
                              {recipe.title}
                            </span>
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
        {selectedRecipe && selectedCell !== null && (
          <motion.div
            key={selectedCell}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <RecipeCard
              recipe={selectedRecipe}
              mode={mode}
              onReroll={() => onReroll(selectedCell)}
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

export default WeeklyPlanGrid;

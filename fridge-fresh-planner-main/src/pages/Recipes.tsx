import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, ShoppingBag, CalendarDays, Utensils, ArrowLeft, Layers } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import WeeklyPlanGrid from "@/components/WeeklyPlanGrid";
import MealPrepPlanGrid from "@/components/MealPrepPlanGrid";
import MealPrepSetsView from "@/components/MealPrepSetsView";
import BottomNav from "@/components/BottomNav";
import AddProductForm from "@/components/AddProductForm";
import { toast } from "sonner";
import { generateRecipesWithGemini } from "@/services/recipeService";

type Mode = "fridge" | "shop";
type Timeframe = "single" | "week" | "meal_prep";
type ViewState =
  | "choose-mode"
  | "choose-timeframe"
  | "single-category"
  | "loading"
  | "results"
  | "weekly"
  | "liked"
  | "history";

export interface RecipeData {
  title: string;
  description: string;
  icon: string;
  servings: number;
  cook_time_minutes: number;
  calories_total: number;
  ingredients: { name: string; quantity: number; unit: string; estimated_price_rub?: number }[];
  steps: string[];
  meal_type?: "breakfast" | "snack" | "soup" | "main";
}

const Recipes = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<ViewState>("choose-mode");
  const [mode, setMode] = useState<Mode>("fridge");
  const [timeframe, setTimeframe] = useState<Timeframe>("single");
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [weeklyRecipes, setWeeklyRecipes] = useState<RecipeData[]>([]);
  const [excludedTitles, setExcludedTitles] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSetIndex, setSelectedSetIndex] = useState<number | null>(null);
  const [mealPrepAllRecipes, setMealPrepAllRecipes] = useState<RecipeData[]>([]);
  const [mealPrepSelectedRecipes, setMealPrepSelectedRecipes] = useState<RecipeData[] | null>(null);
  const [likedTitles, setLikedTitles] = useState<string[]>([]);
  const [extraConstraints, setExtraConstraints] = useState<string>("");
  const [lastMealPrepTitles, setLastMealPrepTitles] = useState<string[]>([]);
  const [singleCategory, setSingleCategory] = useState<"breakfast" | "lunch" | "dinner" | "snack" | "dessert" | null>(null);
  const [chefWishes, setChefWishes] = useState<string>("");
  const [savedPlanTimeframe, setSavedPlanTimeframe] = useState<Timeframe | null>(null);
  const [cookHistory, setCookHistory] = useState<
    { id: string; cookedAt: string; title: string; icon: string; recipe: RecipeData }[]
  >([]);
  const [useExpiringOnly, setUseExpiringOnly] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const inStockProducts = products.filter((p: any) => (p.quantity || 0) > 0);
  const expiringProducts = [...inStockProducts].sort((a: any, b: any) => {
    const ad = a.expiry_date ? new Date(a.expiry_date).getTime() : Number.POSITIVE_INFINITY;
    const bd = b.expiry_date ? new Date(b.expiry_date).getTime() : Number.POSITIVE_INFINITY;
    return ad - bd;
  });
  const productsForGeneration = useExpiringOnly ? expiringProducts.slice(0, 15) : inStockProducts;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fridge_fresh_weekly_plan");
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        timeframe: Timeframe;
        mode: Mode;
        recipes: RecipeData[];
      };
      if (saved.recipes && Array.isArray(saved.recipes) && saved.recipes.length > 0) {
        setMode(saved.mode);
        setTimeframe(saved.timeframe);
        setWeeklyRecipes(saved.recipes);
        if (saved.timeframe === "meal_prep") {
          setMealPrepAllRecipes(saved.recipes);
          setMealPrepSelectedRecipes(null);
          setSelectedSetIndex(null);
        }
        setSavedPlanTimeframe(saved.timeframe);
        // Не перекидываем сразу в Сеты/календарь при открытии вкладки
        setView("choose-timeframe");
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fridge_fresh_chef_wishes");
      if (raw) setChefWishes(raw);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fridge_fresh_liked_recipes");
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        setLikedTitles(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fridge_fresh_cook_history");
      if (!raw) return;
      const parsed = JSON.parse(raw) as any[];
      if (Array.isArray(parsed)) {
        setCookHistory(
          parsed
            .filter((x) => x && typeof x.title === "string" && x.recipe && Array.isArray(x.recipe.ingredients))
            .slice(0, 50),
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleLike = (title: string) => {
    setLikedTitles((prev) => {
      const exists = prev.includes(title);
      const next = exists ? prev.filter((t) => t !== title) : [...prev, title];
      try {
        localStorage.setItem("fridge_fresh_liked_recipes", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const generateRecipes = async (selectedMode: Mode, selectedTimeframe: Timeframe, exclude: string[] = []) => {
    setView("loading");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 120000);

      const generated = await generateRecipesWithGemini(
        {
          mode: selectedMode,
          timeframe: selectedTimeframe,
          products: selectedMode === "fridge" ? productsForGeneration : [],
          servings: selectedTimeframe === "meal_prep" ? 7 : 2,
          excludeRecipes: exclude,
          likedTitles,
          previousTitles: selectedTimeframe === "meal_prep" ? lastMealPrepTitles : [],
          extraConstraints: selectedTimeframe === "meal_prep" ? extraConstraints : "",
          singleCategory: selectedTimeframe === "single" ? singleCategory || undefined : undefined,
          chefWishes,
        },
        controller.signal,
      );

      clearTimeout(timeoutId);

      if (selectedTimeframe === "week" || selectedTimeframe === "meal_prep") {
        setWeeklyRecipes(generated);
        setSelectedSetIndex(null);
        if (selectedTimeframe === "meal_prep") {
          setMealPrepAllRecipes(generated);
          setMealPrepSelectedRecipes(null);
          setLastMealPrepTitles(generated.map((r) => r.title));
        }
        try {
          localStorage.setItem(
            "fridge_fresh_weekly_plan",
            JSON.stringify({
              timeframe: selectedTimeframe,
              mode: selectedMode,
              recipes: generated,
            }),
          );
        } catch {
          // storage optional
        }
        setView("weekly");
      } else {
        setRecipes(generated);
        setView("results");
      }
    } catch (e: any) {
      console.error(e);
      if (e?.name === "AbortError") {
        toast.error(t("rec_toast_err_ai") as string);
      } else {
        toast.error(e?.message || (t("rec_toast_err_gen") as string));
      }
      setView("choose-mode");
    }
  };

  const handleModeSelect = (m: Mode) => {
    setMode(m);
    setView("choose-timeframe");
  };

  const handleChefWishesChange = (value: string) => {
    setChefWishes(value);
    try {
      localStorage.setItem("fridge_fresh_chef_wishes", value);
    } catch {
      // ignore
    }
  };

  const handleTimeframeSelect = (tf: Timeframe) => {
    setTimeframe(tf);
    setExcludedTitles([]);
    setSelectedSetIndex(null);
    if (tf !== "meal_prep") {
      setExtraConstraints("");
      setLastMealPrepTitles([]);
    }
    if (tf === "single") {
      setSingleCategory(null);
      setView("single-category");
    } else {
      generateRecipes(mode, tf);
    }
  };

  const handleReroll = (index: number) => {
    const title = timeframe === "week" ? weeklyRecipes[index]?.title : recipes[index]?.title;
    if (title) {
      const newExcluded = [...excludedTitles, title];
      setExcludedTitles(newExcluded);
      // For single, regenerate all; for weekly just that slot — for simplicity regenerate all
      generateRecipes(mode, timeframe, newExcluded);
    }
  };

  const handleAddToShoppingList = async (recipe: RecipeData) => {
    const convert = (fromUnit: string, qty: number, toUnit: string): number | null => {
      const mass: Record<string, "g" | "kg"> = { г: "g", g: "g", kg: "kg", "кг": "kg" };
      const vol: Record<string, "ml" | "l"> = { ml: "ml", мл: "ml", л: "l", l: "l" };

      const fromMass = mass[fromUnit];
      const toMass = mass[toUnit];
      if (fromMass && toMass) {
        if (fromMass === toMass) return qty;
        return fromMass === "g" && toMass === "kg" ? qty / 1000 : qty * 1000;
      }

      const fromVol = vol[fromUnit];
      const toVol = vol[toUnit];
      if (fromVol && toVol) {
        if (fromVol === toVol) return qty;
        return fromVol === "ml" && toVol === "l" ? qty / 1000 : qty * 1000;
      }

      if (fromUnit === toUnit) return qty;
      return null;
    };

    const findBestProduct = (ingName: string) => {
      const ingLower = ingName.toLowerCase();
      const candidates = products
        .map((p: any) => ({
          p,
          score:
            (String(p?.name || "").toLowerCase().includes(ingLower) ? 20 : 0) +
            (ingLower.includes(String(p?.name || "").toLowerCase()) ? 10 : 0),
        }))
        .sort((a: any, b: any) => b.score - a.score);
      return candidates[0]?.p || null;
    };

    const missingIngredients = recipe.ingredients
      .map((ing) => {
        const matched = findBestProduct(ing.name);
        const requiredQty = ing.quantity;

        if (!matched || Number(matched.quantity || 0) <= 0) {
          return { ...ing, quantity: requiredQty };
        }

        const availableInIngUnit =
          matched.unit && ing.unit ? convert(String(matched.unit), Number(matched.quantity || 0), String(ing.unit)) : null;

        if (availableInIngUnit === null) {
          // If we can't compare units, fallback to "missing if zero"
          return Number(matched.quantity || 0) > 0 ? null : { ...ing, quantity: requiredQty };
        }

        const missingQty = Math.max(0, requiredQty - availableInIngUnit);
        if (missingQty <= 0) return null;
        return { ...ing, quantity: missingQty };
      })
      .filter(Boolean) as RecipeData["ingredients"];

    if (missingIngredients.length === 0) {
      toast.info(t("rec_toast_all_ings") as string);
      return;
    }

    const normalize = (s: string) => (s.split("(")[0] || s).trim().toLowerCase();
    const toKey = (name: string, unit: string) => `${normalize(name)}|${unit}`;

    const { data: existingItems = [], error: existingErr } = await supabase
      .from("shopping_list")
      .select("id,name,quantity,unit,estimated_price,icon,recipe_source,checked")
      .eq("checked", false);

    if (existingErr) {
      toast.error("Ошибка при чтении корзины");
      return;
    }

    // Remove duplicates already present in the cart:
    // merge by (name without German part) + unit.
    const groupedByKey = new Map<string, any[]>();
    for (const it of existingItems as any[]) {
      const key = toKey(String(it.name || ""), String(it.unit || ""));
      if (!groupedByKey.has(key)) groupedByKey.set(key, []);
      groupedByKey.get(key)!.push(it);
    }

    for (const [, items] of groupedByKey.entries()) {
      if (items.length <= 1) continue;
      const totalQty = items.reduce((s, x) => s + Number(x?.quantity || 0), 0);
      const keep = items[0];
      await supabase.from("shopping_list").update({ quantity: totalQty }).eq("id", keep.id);
      for (const del of items.slice(1)) {
        await supabase.from("shopping_list").delete().eq("id", del.id);
      }
      keep.quantity = totalQty;
    }

    const existingByKey = new Map<string, any>();
    for (const [key, items] of groupedByKey.entries()) {
      if (items[0]) existingByKey.set(key, items[0]);
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const ing of missingIngredients) {
      const key = toKey(ing.name, ing.unit);
      const existing = existingByKey.get(key);
      if (existing) {
        const oldQty = Number(existing.quantity || 0);
        const addQty = Number(ing.quantity || 0);
        const newQty = oldQty + addQty;
        const { error: updErr } = await supabase
          .from("shopping_list")
          .update({ quantity: newQty })
          .eq("id", existing.id);
        if (!updErr) {
          updatedCount += 1;
          existing.quantity = newQty;
        }
      } else {
        const { error: insErr } = await supabase.from("shopping_list").insert({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          estimated_price: ing.estimated_price_rub || null,
          icon: recipe.icon,
          recipe_source: recipe.title,
        });
        if (!insErr) insertedCount += 1;
      }
    }

    if (insertedCount + updatedCount > 0) {
      toast.success(t("rec_toast_cart_updated", {insertedCount, updatedCount}) as string);
    } else {
      toast.info(t("rec_toast_cart_has") as string);
    }
  };

  const handleCook = async (recipe: RecipeData) => {
    const convert = (fromUnit: string, qty: number, toUnit: string): number | null => {
      // Only convert mass/volume where we know the ratio.
      const mass: Record<string, "g" | "kg"> = { g: "g", kg: "kg", "кг": "kg" };
      const vol: Record<string, "ml" | "l"> = { ml: "ml", "мл": "ml", l: "l", "л": "l" };

      const fromMass = mass[fromUnit];
      const toMass = mass[toUnit];
      if (fromMass && toMass) {
        if (fromMass === toMass) return qty;
        // g<->kg
        return fromMass === "g" && toMass === "kg" ? qty / 1000 : qty * 1000;
      }

      const fromVol = vol[fromUnit];
      const toVol = vol[toUnit];
      if (fromVol && toVol) {
        if (fromVol === toVol) return qty;
        // ml<->l
        return fromVol === "ml" && toVol === "l" ? qty / 1000 : qty * 1000;
      }

      // No safe conversion available
      return null;
    };

    for (const ing of recipe.ingredients) {
      const found = products.find(
        (p) => p.name.toLowerCase().includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(p.name.toLowerCase())
      );
      if (!found || found.quantity <= 0) continue;

      const recipeUnit = ing.unit;
      const productUnit = found.unit;

      let subtractInProductUnit = null as number | null;

      if (recipeUnit === productUnit) {
        subtractInProductUnit = ing.quantity;
      } else if ((recipeUnit === "г" || recipeUnit === "кг") && (productUnit === "г" || productUnit === "кг")) {
        // mass conversion
        subtractInProductUnit = convert(recipeUnit, ing.quantity, productUnit);
      } else if ((recipeUnit === "мл" || recipeUnit === "л") && (productUnit === "мл" || productUnit === "л")) {
        // volume conversion
        subtractInProductUnit = convert(recipeUnit, ing.quantity, productUnit);
      } else if (recipeUnit === "шт" && productUnit === "шт") {
        subtractInProductUnit = ing.quantity;
      } else {
        // Unsupported unit mismatch - skip to avoid wrong subtraction
        subtractInProductUnit = null;
      }

      if (subtractInProductUnit === null) continue;

      const newQty = Math.max(0, Number(found.quantity) - subtractInProductUnit);
      await supabase.from("products").update({ quantity: newQty }).eq("id", found.id);
    }
    toast.success(t("rec_toast_cooked") as string);

    try {
      const entry = {
        id: crypto.randomUUID(),
        cookedAt: new Date().toISOString(),
        title: recipe.title,
        icon: recipe.icon,
        recipe,
      };
      setCookHistory((prev) => {
        const next = [entry, ...prev].slice(0, 50);
        try {
          localStorage.setItem("fridge_fresh_cook_history", JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    } catch {
      // ignore history errors
    }
  };

  const handleSaveRecipe = async (recipe: RecipeData) => {
    const { error } = await supabase.from("saved_recipes").insert({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients as any,
      steps: recipe.steps as any,
      servings: recipe.servings,
      cook_time_minutes: recipe.cook_time_minutes,
      calories_total: recipe.calories_total,
      icon: recipe.icon,
    });
    if (error) toast.error(t("rec_toast_save_err") as string);
    else toast.success(t("rec_toast_saved") as string);
  };

  const goBack = () => {
    if (view === "choose-timeframe") {
      setView("choose-mode");
    } else if (view === "single-category") {
      setView("choose-timeframe");
    } else if (view === "liked") {
      setView("choose-mode");
    } else if (view === "history") {
      setView("choose-mode");
    } else if (view === "weekly" && timeframe === "meal_prep" && selectedSetIndex !== null) {
      // вернуться к выбору из 3 сетов, не сбрасывая сами сеты
      setSelectedSetIndex(null);
    } else if (view === "results" || view === "weekly") {
      setView("choose-timeframe");
    }
  };

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 pt-6 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {view !== "choose-mode" && (
              <button onClick={goBack} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-2xl font-bold tracking-tight">{t("rec_title")}</h1>
          </div>
          <button
            onClick={() => setView("liked")}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-primary/60 hover:text-primary transition-colors"
          >
            Мои Лайки ❤️
          </button>
          <button
            onClick={() => setView("history")}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-primary/60 hover:text-primary transition-colors"
          >
            История готовки
          </button>
        </div>
      </header>

      <main className="px-4 pb-32">
        <AnimatePresence mode="wait">
          {view === "choose-mode" && (
            <motion.div key="mode" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid gap-4 pt-4">
              <button
                onClick={() => handleModeSelect("fridge")}
                className="bg-card border border-border rounded-2xl p-6 text-left shadow-card hover:shadow-soft transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <ChefHat size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-card-foreground mb-1">{t("rec_mode_fridge_title")}</h3>
                <p className="text-sm text-muted-foreground">{t("rec_mode_fridge_desc")}</p>
                <p className="text-xs text-primary font-medium mt-2">{t("rec_products_avail", {count: inStockProducts.length})}</p>
              </button>

              <button
                onClick={() => handleModeSelect("shop")}
                className="bg-card border border-border rounded-2xl p-6 text-left shadow-card hover:shadow-soft transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <ShoppingBag size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-card-foreground mb-1">{t("rec_mode_shop_title")}</h3>
                <p className="text-sm text-muted-foreground">{t("rec_mode_shop_desc")}</p>
              </button>
            </motion.div>
          )}

          {view === "choose-timeframe" && (
            <motion.div key="tf" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid gap-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <span className="text-primary">✍️</span>
                  {t("rec_wishes_label")}
                </label>
                <textarea
                  value={chefWishes}
                  onChange={(e) => handleChefWishesChange(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder={t("rec_wishes_placeholder") as string}
                />
              </div>

              {mode === "fridge" && (
                <button
                  onClick={() => setUseExpiringOnly((v) => !v)}
                  className={`text-left p-4 rounded-2xl border transition-colors ${
                    useExpiringOnly ? "bg-primary/10 border-primary/40 text-primary" : "bg-card border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{t("rec_expiring_title")}</span>
                    <span className={`text-xs font-medium ${useExpiringOnly ? "text-primary" : "text-muted-foreground"}`}>
                      {useExpiringOnly ? t("rec_on") : t("rec_off")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Использовать продукты с самым коротким сроком годности в контексте генерации.
                  </p>
                </button>
              )}

              {savedPlanTimeframe && (
                <div className="p-3 rounded-xl border border-border bg-card/60">
                  <p className="text-xs text-muted-foreground">
                    {t("rec_saved_plan")} <span className="font-semibold text-card-foreground">{savedPlanTimeframe === "meal_prep" ? "Meal Prep" : "План на неделю"}</span>
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        setView("weekly");
                        if (savedPlanTimeframe === "meal_prep") {
                          setSelectedSetIndex(null);
                          setMealPrepSelectedRecipes(null);
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Открыть сохраненный план
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => handleTimeframeSelect("single")}
                className="bg-card border border-border rounded-2xl p-6 text-left shadow-card hover:shadow-soft transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Utensils size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-card-foreground mb-1">{t("rec_single_title")}</h3>
                <p className="text-sm text-muted-foreground">{t("rec_single_desc")}</p>
              </button>

              <button
                onClick={() => handleTimeframeSelect("week")}
                className="bg-card border border-border rounded-2xl p-6 text-left shadow-card hover:shadow-soft transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <CalendarDays size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-card-foreground mb-1">{t("rec_weekly_title")}</h3>
                <p className="text-sm text-muted-foreground">{t("rec_weekly_desc")}</p>
              </button>

              <button
                onClick={() => handleTimeframeSelect("meal_prep")}
                className="bg-card border border-border rounded-2xl p-6 text-left shadow-card hover:shadow-soft transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Layers size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-card-foreground mb-1">{t("rec_mealprep_title")}</h3>
                <p className="text-sm text-muted-foreground">{t("rec_mealprep_desc")}</p>
              </button>
            </motion.div>
          )}

          {view === "single-category" && (
            <motion.div key="single-cat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid gap-3 pt-4">
              <p className="text-sm text-muted-foreground">
                {t("rec_cat_desc")}
              </p>
              {[
                { key: "breakfast", label: t("cat_breakfast") },
                { key: "lunch", label: t("cat_lunch") },
                { key: "dinner", label: t("cat_dinner") },
                { key: "snack", label: t("cat_snack") },
                { key: "dessert", label: t("cat_dessert") },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setSingleCategory(cat.key as any);
                    generateRecipes(mode, "single");
                  }}
                  className="bg-card border border-border rounded-2xl p-4 text-left shadow-card hover:shadow-soft transition-shadow flex items-center justify-between"
                >
                  <span className="text-sm font-semibold text-card-foreground">{cat.label}</span>
                  <span className="text-xs text-muted-foreground">{t("rec_cat_ideas")}</span>
                </button>
              ))}
            </motion.div>
          )}

          {view === "loading" && (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground font-medium">{t("rec_loading_ai")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("rec_loading_time")}</p>
            </motion.div>
          )}

          {view === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid gap-4 pt-2">
              {recipes.map((recipe, i) => (
                <RecipeCard
                  key={`${recipe.title}-${i}`}
                  recipe={recipe}
                  mode={mode}
                  onReroll={() => handleReroll(i)}
                  onAddToCart={() => handleAddToShoppingList(recipe)}
                  onCook={() => handleCook(recipe)}
                  onSave={() => handleSaveRecipe(recipe)}
                  availableProducts={inStockProducts}
                  liked={likedTitles.includes(recipe.title)}
                  onToggleLike={() => toggleLike(recipe.title)}
                />
              ))}
            </motion.div>
          )}

          {view === "liked" && (
            <motion.div key="liked" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-4 space-y-3">
              <h2 className="text-lg font-bold">{t("rec_liked")}</h2>
              {likedTitles.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("rec_liked_empty")}</p>
              ) : (
                <div className="grid gap-3">
                  {weeklyRecipes
                    .concat(recipes)
                    .filter((r, idx, arr) => likedTitles.includes(r.title) && arr.findIndex((x) => x.title === r.title) === idx)
                    .map((recipe, i) => (
                      <RecipeCard
                        key={`${recipe.title}-liked-${i}`}
                        recipe={recipe}
                        mode={mode}
                        onReroll={() => {}}
                        onAddToCart={() => handleAddToShoppingList(recipe)}
                        onCook={() => handleCook(recipe)}
                        onSave={() => handleSaveRecipe(recipe)}
                        availableProducts={inStockProducts}
                        liked={likedTitles.includes(recipe.title)}
                        onToggleLike={() => toggleLike(recipe.title)}
                      />
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {view === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{t("rec_history")}</h2>
                <button
                  onClick={() => {
                    setCookHistory([]);
                    try {
                      localStorage.removeItem("fridge_fresh_cook_history");
                    } catch {
                      // ignore
                    }
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-primary/60 hover:text-primary transition-colors"
                >
                  Очистить
                </button>
              </div>

              {cookHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("rec_history_empty")}</p>
              ) : (
                <div className="grid gap-3">
                  {cookHistory.map((h) => (
                    <div key={h.id} className="bg-card border border-border rounded-2xl p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center text-xl shrink-0">
                            {h.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold truncate">{h.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(h.cookedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleCook(h.recipe)}
                          className="py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Приготовил снова
                        </button>
                        <button
                          onClick={() => handleAddToShoppingList(h.recipe)}
                          className="py-2 px-3 rounded-xl bg-secondary text-card-foreground text-xs font-semibold hover:bg-muted transition-colors"
                        >
                          В корзину
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === "weekly" && (
            <motion.div key="weekly" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {timeframe === "meal_prep" ? (
                <>
                  <MealPrepSetsView
                    recipes={mealPrepAllRecipes.length ? mealPrepAllRecipes : weeklyRecipes}
                    onRerollSets={() => generateRecipes(mode, "meal_prep", lastMealPrepTitles)}
                    onSelectSet={(idx, setRecipes) => {
                      setSelectedSetIndex(idx);
                      setMealPrepSelectedRecipes(setRecipes);
                    }}
                    extraConstraints={extraConstraints}
                    onExtraConstraintsChange={setExtraConstraints}
                  />
                  {selectedSetIndex !== null && (
                    <MealPrepPlanGrid
                      recipes={mealPrepSelectedRecipes || []}
                      mode={mode}
                      onReroll={(recipeIndex) => handleReroll(recipeIndex)}
                      onAddToCart={handleAddToShoppingList}
                      onCook={handleCook}
                      onSave={handleSaveRecipe}
                      availableProducts={inStockProducts}
                      likedTitles={likedTitles}
                      onToggleLike={toggleLike}
                    />
                  )}
                </>
              ) : (
                <WeeklyPlanGrid
                  recipes={weeklyRecipes}
                  mode={mode}
                  onReroll={handleReroll}
                  onAddToCart={handleAddToShoppingList}
                  onCook={handleCook}
                  onSave={handleSaveRecipe}
                  availableProducts={inStockProducts}
                  likedTitles={likedTitles}
                  onToggleLike={toggleLike}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav onAddClick={() => setFormOpen(true)} />
      <AddProductForm open={formOpen} onClose={() => setFormOpen(false)} defaultLocation="fridge" />
    </div>
  );
};

export default Recipes;

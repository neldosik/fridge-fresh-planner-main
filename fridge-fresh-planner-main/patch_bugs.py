import os

# 1. Update recipeService.ts model
path_svc = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\services\\recipeService.ts"
with open(path_svc, 'r', encoding='utf-8') as f:
    svc_text = f.read()

svc_text = svc_text.replace('const MODEL_NAME = "gemini-2.5-flash";', 'const MODEL_NAME = "gemini-1.5-flash";')

with open(path_svc, 'w', encoding='utf-8') as f:
    f.write(svc_text)

print("Updated recipeService.ts model to gemini-1.5-flash")

# 2. Update Recipes.tsx handleReroll logic
path_rec = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\Recipes.tsx"
with open(path_rec, 'r', encoding='utf-8') as f:
    rec_text = f.read()

old_handleReroll = """  const handleReroll = (index: number) => {
    const title = timeframe === "week" ? weeklyRecipes[index]?.title : recipes[index]?.title;
    if (title) {
      const newExcluded = [...excludedTitles, title];
      setExcludedTitles(newExcluded);
      // For single, regenerate all; for weekly just that slot — for simplicity regenerate all
      generateRecipes(mode, timeframe, newExcluded);
    }
  };"""

new_handleReroll = """  const handleReroll = async (index: number) => {
    let targetList = timeframe === "week" ? weeklyRecipes : recipes;
    if (timeframe === "meal_prep" && selectedSetIndex !== null) {
      targetList = mealPrepSelectedRecipes || [];
    }
    
    const oldRecipe = targetList[index];
    if (!oldRecipe) return;

    const title = oldRecipe.title;
    const newExcluded = [...excludedTitles, title];
    setExcludedTitles(newExcluded);

    if (timeframe === "meal_prep" || timeframe === "week") {
       const loadingToastId = toast.loading("Ищем замену (ИИ думает)...");
       try {
         const generated = await generateRecipesWithGemini({
           mode, timeframe: "single", products: mode === "fridge" ? productsForGeneration : [],
           servings: timeframe === "meal_prep" ? 7 : 2,
           excludeRecipes: newExcluded,
           extraConstraints: "Сгенерируй ОДНО блюдо такого же типа (завтрак/обед/ужин), как: " + oldRecipe.title,
           chefWishes
         }, new AbortController().signal);
         
         toast.dismiss(loadingToastId);
         if (!generated || generated.length === 0) throw new Error("Empty Array");
         
         const newRecipe = generated[0];
         if (timeframe === "meal_prep") {
            const newList = [...(mealPrepSelectedRecipes || [])];
            newList[index] = newRecipe;
            setMealPrepSelectedRecipes(newList);
            toast.success("Блюдо заменено!");
         } else {
            const newList = [...weeklyRecipes];
            newList[index] = newRecipe;
            setWeeklyRecipes(newList);
            toast.success("Блюдо заменено!");
         }
         return;
       } catch (e: any) {
         toast.dismiss(loadingToastId);
         toast.error(e?.message || "Ошибка при замене блюда");
         return; // fallback to complete reroll if fails? No, just stop.
       }
    }

    generateRecipes(mode, timeframe, newExcluded);
  };"""

if old_handleReroll in rec_text:
    rec_text = rec_text.replace(old_handleReroll, new_handleReroll)
    with open(path_rec, 'w', encoding='utf-8') as f:
        f.write(rec_text)
    print("Updated Recipes.tsx handleReroll")
else:
    print("WARNING: handleReroll not found in Recipes.tsx. It might have been altered.")

# 3. Update Index.tsx MustHaves logic
path_idx = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\Index.tsx"
with open(path_idx, 'r', encoding='utf-8') as f:
    idx_text = f.read()

# Replace the mustHave storage logic
old_mustHave_effect = """  useEffect(() => {
    localStorage.setItem("app_must_have", JSON.stringify(mustHaveList));
  }, [mustHaveList]);"""

new_mustHave_effect = """  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.user_metadata?.must_have_items) {
        setMustHaveList(data.user.user_metadata.must_have_items);
      }
    });
  }, []);"""

if old_mustHave_effect in idx_text:
    idx_text = idx_text.replace(old_mustHave_effect, new_mustHave_effect)

# Replace add/remove
old_remove = """  const removeMustHave = (key) => {
    setMustHaveList(prev => prev.filter(item => item.key !== key));
  };"""

new_remove = """  const saveMustHaveList = async (newList: any[]) => {
    setMustHaveList(newList);
    localStorage.setItem("app_must_have", JSON.stringify(newList));
    await supabase.auth.updateUser({
      data: { must_have_items: newList }
    });
  };

  const removeMustHave = (key: string) => {
    saveMustHaveList(mustHaveList.filter((item: any) => item.key !== key));
  };"""

if old_remove in idx_text:
    idx_text = idx_text.replace(old_remove, new_remove)

old_add = """    setMustHaveList(prev => [...prev, newItem]);
    setNewMustHaveName("");
    setNewMustHaveIcon("🍽️");"""

new_add = """    saveMustHaveList([...mustHaveList, newItem]);
    setNewMustHaveName("");
    setNewMustHaveIcon("🍽️");"""

if old_add in idx_text:
    idx_text = idx_text.replace(old_add, new_add)

with open(path_idx, 'w', encoding='utf-8') as f:
    f.write(idx_text)
print("Updated Index.tsx MustHave Supabase syncing")

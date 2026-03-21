import os

path_rec = "c:\\Users\\Oleksandr\\fridge-fresh-planner-main\\fridge-fresh-planner-main\\src\\pages\\Recipes.tsx"
with open(path_rec, 'r', encoding='utf-8') as f:
    rec_text = f.read()

# We need to find the exact block we injected last time
# It looks like:
#        try {
#          const generated = await generateRecipesWithGemini({
#            mode, timeframe: "single", products: mode === "fridge" ? productsForGeneration : [],
#            ...
#            chefWishes
#          }, new AbortController().signal);
#          
#          toast.dismiss(loadingToastId);
#          if (!generated || generated.length === 0) throw new Error("Empty Array");
#          
#          const newRecipe = generated[0];
#          newRecipe.meal_type = oldRecipe.meal_type; // Force identical meal_type so it doesn't disappear from UI

old_block = """       try {
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
         newRecipe.meal_type = oldRecipe.meal_type; // Force identical meal_type so it doesn't disappear from UI"""

new_block = """       try {
         let generated = await generateRecipesWithGemini({
           mode, timeframe: "single", products: mode === "fridge" ? productsForGeneration : [],
           servings: timeframe === "meal_prep" ? 7 : 2,
           excludeRecipes: newExcluded,
           extraConstraints: "Сгенерируй замену для блюда: " + oldRecipe.title + ". Сохрани тип блюда (завтрак, обед, ужин или перекус).",
           chefWishes
         }, new AbortController().signal);
         
         toast.dismiss(loadingToastId);
         
         // Bulletproof parsing
         if (generated && !Array.isArray(generated)) {
            if ((generated as any).recipes && Array.isArray((generated as any).recipes)) {
                generated = (generated as any).recipes;
            } else {
                generated = [generated] as any;
            }
         }
         
         if (!generated || generated.length === 0 || !generated[0]?.title) throw new Error("AI вернул пустой результат");
         
         const newRecipe = generated[0];
         newRecipe.meal_type = oldRecipe.meal_type || "main"; // Force identical meal_type so it doesn't disappear from UI"""

if old_block in rec_text:
    rec_text = rec_text.replace(old_block, new_block)
    with open(path_rec, 'w', encoding='utf-8') as f:
        f.write(rec_text)
    print("Patched handleReroll bulletproof AI parsing.")
else:
    print("Could not find the block to patch!")


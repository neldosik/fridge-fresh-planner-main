import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { mode, timeframe, products, servings, excludeRecipes } = await req.json();

    let systemPrompt: string;

    if (mode === "fridge") {
      const productList = (products || []).map((p: any) => `${p.name} (${p.quantity} ${p.unit})`).join(", ");
      systemPrompt = `You are a chef AI for a food inventory app. The user has these products available: ${productList}.

Suggest recipes that can be made ONLY with these ingredients (basic pantry staples like salt, pepper, oil, water are assumed available).`;
    } else {
      systemPrompt = `You are a chef AI for a food inventory app. Suggest popular world cuisine recipes. The user will shop for ingredients, so suggest any recipe freely.`;
    }

    const count = timeframe === "week" ? 21 : timeframe === "meal_prep" ? 4 : 3;
    const excluded = (excludeRecipes || []).join(", ");

    const userPrompt =
      timeframe === "week"
        ? `Create a weekly meal plan with 3 meals per day (breakfast, lunch, dinner) for 7 days. That's 21 recipes total for ${servings || 2} servings each.${excluded ? ` Do NOT include these recipes: ${excluded}.` : ""}

Return a JSON array of 21 objects in order: day 0 breakfast, day 0 lunch, day 0 dinner, day 1 breakfast, etc.`
        : timeframe === "meal_prep"
          ? `Create a "Meal Prep" set for 7 days: exactly 4 recipes total:
- 1 breakfast (meal_type="breakfast")
- 1 snack (meal_type="snack")
- 1 soup (meal_type="soup")
- 1 main dish / second course (meal_type="main")

All 4 recipes MUST be suitable for meal prep:
- microwave-friendly (reheats well, no delicate textures that break)
- portable in containers (no messy plating required)
- safe to store in fridge for several days

IMPORTANT: Each recipe must be for exactly ${servings || 7} servings (cook a batch for the whole week). Ingredients quantities should match ${servings || 7} servings.
${excluded ? `Do NOT include these recipes: ${excluded}.` : ""}

Return a JSON array of 4 recipe objects (order doesn't matter).`
          : `Suggest ${count} different recipes for ${servings || 2} servings.${excluded ? ` Do NOT include these recipes: ${excluded}.` : ""}

Return a JSON array of ${count} recipe objects.`;

    const formatPrompt = `
Each recipe object must have:
- title: string (recipe name in Russian)
- description: string (1-2 sentence description in Russian)
- icon: single emoji
- meal_type: string (one of "breakfast"|"snack"|"soup"|"main") ${timeframe === "meal_prep" ? "REQUIRED" : "optional"}
- servings: number
- cook_time_minutes: number
- calories_total: estimated total calories for all servings
- ingredients: array of {name: string, quantity: number, unit: string ("шт"|"г"|"кг"|"мл"|"л"|"уп"|"ст.л"|"ч.л"), estimated_price_rub: number}
- steps: array of strings (cooking steps in Russian)
${mode === "shop" ? '- For each ingredient, estimate a realistic price in Russian rubles.' : ''}

Return ONLY valid JSON array, no markdown, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt + formatPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов, попробуйте позже" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Недостаточно кредитов AI" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    let recipes;
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      recipes = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      recipes = [];
    }

    return new Response(JSON.stringify({ recipes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recipes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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

    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a receipt/check analyzer for a food inventory app. Analyze the receipt image and extract food products.

For each product found, return:
- name: cleaned product name in Russian (remove store abbreviations, codes, weight info)
- quantity: numeric quantity (default 1)
- unit: one of "шт", "г", "кг", "мл", "л", "уп", "бут"
- location: where to store it. Rules:
  - "fridge" for: dairy, meat, fish, eggs, fresh vegetables/fruits, sauces, drinks
  - "freezer" for: frozen foods, ice cream, frozen vegetables
  - "shelf" for: cereals, pasta, canned food, snacks, bread, oil, sugar, salt, spices, tea, coffee
- icon: a single emoji that best represents the product
- calories_per_100g: estimated calories per 100g from your knowledge base (approximate is fine, null if unknown)
- expiry_date: ISO date string (YYYY-MM-DD) that predicts when the product will expire.
  - Use reasonable defaults based on location:
    - fridge: 1-7 days for dairy/eggs/meat, 2-10 days for vegetables/fruits
    - freezer: 60-180 days for frozen products
    - shelf: 30-365 days depending on the category
  - If unsure, set expiry_date to null.

IMPORTANT: Only include FOOD items. Skip non-food items (bags, napkins, household items, etc).
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
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Проанализируй этот чек и извлеки список продуктов питания." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
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

    // Parse JSON from response, stripping markdown fences if present
    let products;
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      products = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      products = [];
    }

    return new Response(JSON.stringify({ products }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-receipt error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrencySymbol, getAppLanguageName } from "@/lib/utils";
import type { RecipeData } from "@/pages/Recipes";

type Mode = "fridge" | "shop";
type Timeframe = "single" | "week" | "meal_prep";

interface GenerateParams {
  mode: Mode;
  timeframe: Timeframe;
  products: any[];
  servings: number;
  excludeRecipes: string[];
  likedTitles?: string[];
  previousTitles?: string[];
  extraConstraints?: string;
  singleCategory?: "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
  chefWishes?: string;
}

const MODEL_NAME = "gemini-2.5-flash";

function buildSystemPrompt(mode: Mode, products: any[] | undefined, chefWishes?: string) {
  const base =
    'Ты — шеф-повар из Мюнхена.\n' +
    `Рассчитывай стоимость в ${getCurrencySymbol()} для магазина Lidl.\n` +
    'Сет: 2 основных блюда, подходящих для контейнеров и разогрева в микроволновке, и 2 дополнительных блюда (завтраки/закуски).\n' +
    'Сделай план на неделю (Meal Prep-сет, который можно есть всю неделю).\n' +
    'Немецкий словарь (Lidl Helper): Для КАЖДОГО ингредиента в recipes.ingredients[].name используй формат: "Русское название (Немецкое название)". ' +
    'Пример: Чечевица (Linsen), Куриное филе (Hähnchenbrustfilet), Огурцы (Gurken). ' +
    'Та же логика применяется к названиям ингредиентов в списке покупок, потому что он формируется из ingredients[].name.';

  const priceGuide =
    "\n\nЖЕСТКИЙ СПРАВОЧНИК ЦЕН (Мюнхен, Lidl, EUR):\n" +
    `- Молоко: ~1.15${getCurrencySymbol()}/л (то есть ~0.115${getCurrencySymbol()}/100мл)\n` +
    `- Яйца: 10 шт ~2.50${getCurrencySymbol()}\n` +
    `- Мясо/птица: ~10–15${getCurrencySymbol()}/кг\n` +
    `Проверяй расчёты: молоко при пересчёте на 100мл НЕ должно давать >1${getCurrencySymbol()}.`;

  const wishesLower = chefWishes?.toLowerCase() || "";
  const mentionsSushi = /(суши|sushi|ролл|роллы|uramaki|maki|нигири|nigiri|темаки|temaki)/i.test(wishesLower);

  if (mode === "fridge") {
    const productList = (products || [])
      .map((p: any) => `${p.name} (${p.quantity} ${p.unit})`)
      .join(", ");
    return (
      base + priceGuide +
      `\n\nУ пользователя в наличии такие продукты: ${productList}.\n` +
      "Предлагай рецепты, которые можно приготовить ТОЛЬКО из этих ингредиентов (базовые вещи вроде соль/перец/масло/вода считаем доступными)." +
      (mentionsSushi
        ? " Для суши/роллов считай базовыми даже если их нет в списке: рис (рис для суши), соевый соус, рисовый уксус, нори, имбирь, васаби, огурец."
        : "")
    );
  }

  return (
    base +
      priceGuide +
      "\n\nПользователь готов купить недостающее в магазине, поэтому можно предлагать любые популярные рецепты мировой кухни." +
      (mentionsSushi
        ? " Для суши/роллов считай базовыми: рис для суши, соевый соус, рисовый уксус, нори, имбирь, васаби, огурец. Разрешено использовать приготовленные начинки (курица/креветки/яйцо/овощи), избегай сырой рыбы."
        : "")
  );
}

function buildUserPrompt(params: GenerateParams) {
  const { timeframe, servings, excludeRecipes, likedTitles, previousTitles, extraConstraints, singleCategory, chefWishes } = params;
  const excluded = (excludeRecipes || []).join(", ");
  const liked = (likedTitles || []).filter(Boolean);
  const prev = (previousTitles || []).filter(Boolean);
  const wishes = chefWishes?.trim() || "";

  const wishesLower = wishes.toLowerCase();
  const mentionsSushi = /(суши|sushi|ролл|роллы|uramaki|maki|нигири|nigiri|темаки|temaki)/i.test(wishesLower);

  const mentionsMountains = /(\bгоры\b|\bгора\b|поход|трекинг|trek|hike|mountain)/i.test(wishes);

  if (timeframe === "week") {
    return (
      `Создай недельный план питания с 3 приёмами пищи в день (завтрак, обед, ужин) на 7 дней. Это 21 рецепт по ${servings || 2} порций каждый.` +
      (excluded ? ` Не включай эти рецепты: ${excluded}.` : "") +
      (wishes ? `\n\nПожелания шефу: ${wishes}. Учитывай их при выборе блюд.` : "") +
      (mentionsSushi
        ? "\n\nПРОШУ СУШИ: сделай максимально много блюд в стиле суши/роллов/японских рисовых боулов. По возможности ВСЕ 21 рецептов должны быть японского формата (но без сырой рыбы: используй приготовленные начинки — курица/креветки/яйцо/овощи). Обязательно микроволновка и контейнер."
        : "") +
      (mentionsMountains
        ? `\nЕсли в пожеланиях есть горы/поход: выбирай более калорийные блюда и закуски, которые удобно брать с собой.`
        : "") +
      "\n\nВерни JSON-массив из 21 объекта строго в порядке: день 0 завтрак, день 0 обед, день 0 ужин, день 1 завтрак и т.д."
    );
  }

  if (timeframe === "meal_prep") {
    let base =
      `Создай 3 разных сета \"Meal Prep\" на 7 дней. КАЖДЫЙ сет состоит ровно из 4 рецептов:\n` +
      '- 1 завтрак (meal_type="breakfast")\n' +
      '- 1 перекус/закуска (meal_type="snack")\n' +
      '- 1 суп (meal_type="soup")\n' +
      '- 1 основное блюдо/второе (meal_type="main")\n\n' +
      "Обед и ужин в рамках недели ДОЛЖНЫ быть разными блюдами. Обед — горячее (например, суп или мясное блюдо), " +
      "ужин — другое горячее блюдо или сложный салат, который может храниться в холодильнике 2–3 дня.\n\n" +
      "Все рецепты ДОЛЖНЫ быть пригодны для:\n" +
      "- разогрева в микроволновке (переносят разогрев, не разваливаются);\n" +
      "- хранения и переноски в контейнерах;\n" +
      "- безопасного хранения в холодильнике несколько дней.\n\n" +
      `Каждый рецепт делай сразу на ${servings || 7} порций (готовим партию на всю неделю). Ингредиенты и количество должны соответствовать именно ${servings || 7} порциям.\n`;

    if (excluded) {
      base += `Не включай эти рецепты: ${excluded}.\n`;
    }

    if (liked.length > 0) {
      base += `Пользователю особенно нравятся такие блюда: ${liked.join(
        ", ",
      )}. Предложи что-то похожее по стилю и вкусу, но не копируй эти блюда дословно.\n`;
    }

    if (prev.length > 0) {
      base += `При реролле старайся не повторять блюда из предыдущего варианта: ${prev.join(
        ", ",
      )}. Минимум 70% рецептов должны отличаться по названию и составу.\n`;
    }

    if (extraConstraints && extraConstraints.trim().length > 0) {
      base += `Дополнительные условия пользователя: ${extraConstraints.trim()}.\n`;
    }

    if (wishes) {
      base += `Пожелания шефу: ${wishes}. Учитывай их при выборе блюд и ингредиентов.\n`;
    }

    if (mentionsSushi) {
      base +=
        "Если пользователь просит суши: СДЕЛАЙ КАЖДЫЙ рецепт в японском формате (суши/роллы/рисовые боулы) в пределах 12 рецептов. Используй приготовленные начинки (курица/креветки/яйцо/овощи), чтобы блюдо было безопасным и нормально переживало разогрев в микроволновке. Обязательно контейнер.\n";
    }

    if (mentionsMountains) {
      base +=
        'Если в пожеланиях есть горы/поход: делай блюда и закуски более калорийными, а также удобными для переноски (контейнеры, перекусы на ходу).\n';
    }

    base +=
      "\nВерни ОДИН JSON-массив из 12 объектов в таком порядке: сначала 4 рецепта первого сета (завтрак, перекус, суп, основное), " +
      "потом 4 рецепта второго сета, потом 4 рецепта третьего сета.";

    return base;
  }

  const count = 3;

  let base = `Предложи ${count} разных рецептов на ${servings || 2} порции.`;

  if (singleCategory) {
    const map: Record<string, string> = {
      breakfast: "завтрака",
      lunch: "обеда",
      dinner: "ужина",
      snack: "перекуса/закуски",
      dessert: "десерта",
    };
    const label = map[singleCategory] || "блюда";
    base = `Предложи ${count} разных рецептов для ${label} на ${servings || 2} порции.`;
  }

  if (excluded) {
    base += ` Не включай эти рецепты: ${excluded}.`;
  }

  if (wishes) {
    base += `\n\nПожелания шефу: ${wishes}. Учитывай их при выборе блюд и ингредиентов.`;
  }
  if (mentionsMountains) {
    base += `\nЕсли речь о горах/походе: выбирай более калорийные блюда и закуски, которые удобно брать с собой.`;
  }

  if (mentionsSushi) {
    base +=
      `\nЕсли просят суши/роллы: ВСЕ ${count} рецептов должны быть в японском формате суши/роллов/нигири или домашней адаптации (это может быть и боул, но с явными элементами суши: рис для суши, нори/соевый соус, приготовленные начинки без сырой рыбы). Обязательно микроволновка и контейнер.`;
  }

  base += `\n\nВерни JSON-массив из ${count} объектов.`;

  return base;
}

function buildFormatPrompt(timeframe: Timeframe, mode: Mode) {
  return `
Каждый объект рецепта (элемент массива) ДОЛЖЕН иметь поля:
- title: string — название рецепта на ${getAppLanguageName()}
- description: string — 1–2 предложения-описания на ${getAppLanguageName()}
- icon: string — один emoji
- meal_type: string — одно из "breakfast"|"snack"|"soup"|"main" ${
    timeframe === "meal_prep" ? "(ОБЯЗАТЕЛЬНО)" : "(если подходит, иначе можно опустить или поставить общий тип)"
  }
- servings: number — количество порций
- cook_time_minutes: number — время готовки в минутах
- calories_total: number — оценка суммарной калорийности для всех порций
- ingredients: array of { name: string, quantity: number, unit: string ("шт"|"г"|"кг"|"мл"|"л"|"уп"|"ст.л"|"ч.л"), estimated_price_rub: number }
  ВАЖНО: estimated_price_rub — это оценка цены ингредиента в евро (${getCurrencySymbol()}) для магазина Lidl в Мюнхене.
  ingredients[].name должен быть в формате: "Русское название (Немецкое название)".
- steps: array of strings — шаги приготовления на ${getAppLanguageName()}.

ОГРАНИЧЕНИЯ ПО ЦЕНАМ (LIDL MUNICH):
- ЖЕСТКИЙ СПРАВОЧНИК ЦЕН (ориентиры по Мюнхену, Евро ${getCurrencySymbol()}):
  * Молоко: ~1.15${getCurrencySymbol()}/л (то есть ~0.115${getCurrencySymbol()}/100мл)
  * Яйца: 10 шт ~2.50${getCurrencySymbol()}
  * Мясо/птица: ~10-15${getCurrencySymbol()}/кг
- Если для молока единичная цена даёт стоимость за 100мл БОЛЬШЕ 1${getCurrencySymbol()} — это ошибка, скорректируй estimated_price.
- Если итоговая цена ингредиента получается аномальной (например суп+курица > ~60${getCurrencySymbol()} на человека за неделю) — скорректируй количество и/или estimated_price.
- Стоимость ОДНОГО сета Meal Prep на неделю на 1 человека в Lidl должна быть примерно 40–60${getCurrencySymbol()}.
- Проверяй цены по здравому смыслу:
  * курица ~7${getCurrencySymbol()}/кг;
  * чечевица/крупы ~2${getCurrencySymbol()} за пачку;
  * овощи ~1–3${getCurrencySymbol()} за позицию;
  * замороженные полуфабрикаты (пицца, лазанья) ~2–4${getCurrencySymbol()} за штуку.
- Если расчёты дают сумму вроде 156${getCurrencySymbol()} за суп и курицу — это ошибка, нужно скорректировать количество и цены.
- Итоговая цена одного блюда в пересчёте на порцию обычно 2–5${getCurrencySymbol()} и не должна сильно превышать этот диапазон.

ПРАВИЛА ДЛЯ УЖИНА:
- Ужин — это НЕ второй обед.
- Для ужина предлагай лёгкий формат: замороженная пицца/лазанья из холодильника Lidl, готовые салаты, сэндвичи, булочка с сыром/ветчиной, чай с выпечкой и т.п.
- В описании ужинных блюд явно указывай, что это «Легкий ужин / Snack».

Верни ТОЛЬКО один валидный JSON-массив без комментариев, без поясняющего текста и без Markdown-разметки.`;
}

function getDeutschName(name: string) {
  const m = name.match(/\(([^)]+)\)/);
  return (m?.[1] || "").trim().toLowerCase();
}

function validateAndClampLidlPrices(recipes: RecipeData[]): { recipes: RecipeData[]; warnings: string[] } {
  const warnings: string[] = [];

  const isMilk = (n: string) => {
    const de = getDeutschName(n);
    return /молок/i.test(n) || de.includes("milch");
  };
  const isEggs = (n: string) => {
    const de = getDeutschName(n);
    return /яйц/i.test(n) || de.includes("eier");
  };
  const isMeat = (n: string) => {
    const de = getDeutschName(n);
    const ru = n.toLowerCase();
    return (
      ru.includes("курин") ||
      ru.includes("курица") ||
      ru.includes("мяс") ||
      ru.includes("филе") ||
      ru.includes("гов") ||
      ru.includes("свин") ||
      de.includes("hähnchen") ||
      de.includes("haehnchen") ||
      de.includes("fleisch") ||
      de.includes("rind") ||
      de.includes("schwein") ||
      de.includes("geflügel") ||
      de.includes("gefluegel")
    );
  };

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      if (typeof ing.estimated_price_rub !== "number" || !Number.isFinite(ing.estimated_price_rub)) continue;
      if (ing.quantity <= 0) continue;

      // general guard: ingredient line total should be reasonable
      const total = ing.estimated_price_rub * ing.quantity;
      if (total > 20) {
        const old = ing.estimated_price_rub;
        ing.estimated_price_rub = 20 / ing.quantity;
        warnings.push(`Clamped ingredient price for "${ing.name}" in "${recipe.title}": ${old} -> ${ing.estimated_price_rub}`);
      }

      // milk stricter guard: price for 100ml must not exceed 1${getCurrencySymbol()}
      if (isMilk(ing.name)) {
        if (ing.unit === "мл") {
          const per100 = ing.estimated_price_rub * 100;
          if (per100 > 1) {
            const old = ing.estimated_price_rub;
            ing.estimated_price_rub = 1 / 100;
            warnings.push(`Milk per100ml too high for "${ing.name}" in "${recipe.title}": ${old} -> ${ing.estimated_price_rub}`);
          }
        } else if (ing.unit === "л") {
          const per100 = ing.estimated_price_rub / 10;
          if (per100 > 1) {
            const old = ing.estimated_price_rub;
            ing.estimated_price_rub = 10; // 10${getCurrencySymbol()}/l => 1${getCurrencySymbol()}/100ml
            warnings.push(`Milk per100ml too high for "${ing.name}" in "${recipe.title}": ${old} -> ${ing.estimated_price_rub}`);
          }
        }
      }

      // eggs guard: for 10 eggs total should be near 2.5${getCurrencySymbol()} (rough cap)
      if (isEggs(ing.name) && ing.unit === "шт") {
        const total10 = ing.estimated_price_rub * 10;
        if (total10 > 5) {
          const old = ing.estimated_price_rub;
          ing.estimated_price_rub = 0.5; // 10 eggs => 5${getCurrencySymbol()}
          warnings.push(`Eggs too expensive for "${ing.name}" in "${recipe.title}": ${old} -> ${ing.estimated_price_rub}`);
        }
      }

      // meat guard: 10-15${getCurrencySymbol()}/kg with hard cap
      if (isMeat(ing.name)) {
        if (ing.unit === "кг" && ing.estimated_price_rub > 20) {
          const old = ing.estimated_price_rub;
          ing.estimated_price_rub = 15;
          warnings.push(`Meat price per kg too high for "${ing.name}" in "${recipe.title}": ${old} -> ${ing.estimated_price_rub}`);
        }
        if (ing.unit === "г" && ing.estimated_price_rub * 1000 > 20) {
          const old = ing.estimated_price_rub;
          ing.estimated_price_rub = 15 / 1000;
          warnings.push(`Meat price per kg too high for "${ing.name}" in "${recipe.title}": ${old} -> ${ing.estimated_price_rub}`);
        }
      }
    }
  }

  return { recipes, warnings };
}

function extractJsonArray(text: string): any {
  // убираем markdown-код-блоки, если есть
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");

  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.slice(firstBracket, lastBracket + 1);
  }

  return JSON.parse(cleaned);
}

export async function generateRecipesWithGemini(params: GenerateParams, signal?: AbortSignal): Promise<RecipeData[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("API-ключ Gemini не настроен (VITE_GEMINI_API_KEY).");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  console.log("Chef is using Gemini 2.5 Flash");
  console.log("POWERED BY GEMINI 2.5 FLASH. LIDL PRICES ACTIVATED.");

  const systemPrompt = buildSystemPrompt(
    params.mode,
    params.mode === "fridge" ? params.products : undefined,
    params.chefWishes,
  );
  const userPrompt = buildUserPrompt(params);
  const formatPrompt = buildFormatPrompt(params.timeframe, params.mode);

  const prompt = `${systemPrompt}\n\n${formatPrompt}\n\nПользовательский запрос:\n${userPrompt}`;

  const result = await model.generateContent(
    { contents: [{ role: "user", parts: [{ text: prompt }] }] },
    { signal },
  );

  const text = result.response.text() || "[]";
  const parsed = extractJsonArray(text);

  if (!Array.isArray(parsed)) {
    throw new Error("Ответ ИИ не является массивом рецептов.");
  }

  const validated = validateAndClampLidlPrices(parsed as RecipeData[]);
  if (validated.warnings.length > 0) {
    console.warn("Lidl Guard warnings:", validated.warnings.slice(0, 10));
  }

  return validated.recipes;
}


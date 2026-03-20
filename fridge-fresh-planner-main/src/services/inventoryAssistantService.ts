import { GoogleGenerativeAI } from "@google/generative-ai";
import { PRODUCT_ICONS } from "@/constants/productIcons";

type InventoryLocation = "fridge" | "freezer" | "shelf";

interface InventoryProduct {
  id: string;
  name: string;
  location: InventoryLocation;
  quantity: number;
  unit: string;
  icon: string;
}

export interface InventoryAssistantRequest {
  activeLocation: InventoryLocation;
  products: InventoryProduct[];
  message: string;
}

type InventoryAssistantAction =
  | {
      type: "set_quantity";
      id: string;
      quantity: number;
      unit?: string;
      name?: string;
      icon?: string;
      location?: InventoryLocation;
    }
  | {
      type: "adjust_quantity";
      id: string;
      deltaQuantity: number;
      unit?: string;
      name?: string;
      icon?: string;
      location?: InventoryLocation;
    }
  | {
      type: "insert_product";
      data: {
        name: string;
        location: InventoryLocation;
        quantity: number;
        unit: string;
        icon: string;
        expiry_date?: string | null;
      };
    };

export interface InventoryAssistantResponse {
  intent: "query_remaining" | "update_inventory" | "unknown";
  query?: {
    productId: string | null;
    germanName: string;
  };
  actions: InventoryAssistantAction[];
  replyText: string;
}

function extractJsonObject(text: string): any {
  const cleaned0 = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const first = cleaned0.indexOf("{");
  const last = cleaned0.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("AI inventory response has no JSON object.");
  }

  const candidate = cleaned0.slice(first, last + 1);
  try {
    return JSON.parse(candidate);
  } catch (e) {
    // Last attempt: remove trailing commas before } or ]
    const sanitized = candidate.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(sanitized);
  }
}

export async function runInventoryAssistant(
  req: InventoryAssistantRequest,
  signal?: AbortSignal,
): Promise<InventoryAssistantResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("API-ключ Gemini не настроен (VITE_GEMINI_API_KEY).");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const allowedIcons = PRODUCT_ICONS.join(", ");

  const prompt = `Ты — ассистент управления запасами.
Пользователь даёт команды на русском или немецком. Ты должен выполнить их над таблицей products:

Текущие продукты (JSON):
${JSON.stringify(req.products)}

Текущая вкладка (локация по умолчанию для новых продуктов): ${req.activeLocation}

Правила:
- Если пользователь говорит, что продукт закончился/нет/я съел всё — выставь quantity=0.
- Если пользователь говорит "добавь X ..." — увеличь quantity на X (adjust).
- Если пользователь говорит "я выпил/съел/использовал/уменьшилось/уже нет" — это потребление. Если не указано число, ставь quantity=0. Если число указано — уменьшай на указанное (adjust в сторону минуса).
- Если пользователь спрашивает "сколько осталось ..." — верни intent="query_remaining" и в query.productId укажи лучший матч из текущих products.
- Если нужно вставить новый продукт — используй тип insert_product и выбери icon строго из списка allowedIcons.
- Понимай команды типа: "Ich habe keine Milch mehr" так же как "У меня нет/закончилась молочка".
- Для ответа "сколько осталось" используй germanName в query (например Käse).

Уверенность:
- Для set/adjust/update действий выбирай ТОЛЬКО продукт из списка req.products и используй его существующий id.
- Если ты НЕ уверен, какой именно продукт из списка подходит, не меняй ничего: intent="unknown", actions=[], replyText="Не понял, уточните название продукта (например: 'кефир', 'яйца').".
- Никогда не запрашивай у пользователя дополнительную информацию текстом. Всегда возвращай JSON по схеме.

Срок годности:
- Для insert_product предскажи expiry_date (ISO YYYY-MM-DD) на основе location.
  - fridge: примерно 1-7 дней для молочного/мяса/яиц, 2-10 дней для овощей/фруктов
  - freezer: 60-180 дней
  - shelf: 30-365 дней
- Если не уверен — ставь expiry_date=null.

Итог: верни ТОЛЬКО валидный JSON-ОБЪЕКТ строго по схеме:
{
  "intent": "query_remaining"|"update_inventory"|"unknown",
  "query": { "productId": "<uuid|null>", "germanName": "<string>" }  // только если intent=query_remaining
  "actions": [ ... ] // пустой массив если intent=query_remaining без обновлений
  "replyText": "<короткий текст для отображения в чате>"
}

В actions разрешены только:
1) set_quantity: { type:"set_quantity", id, quantity, unit?, name?, icon?, location? }
2) adjust_quantity: { type:"adjust_quantity", id, deltaQuantity, unit?, name?, icon?, location? }
3) insert_product: { type:"insert_product", data:{ name, location, quantity, unit, icon, expiry_date? } }

icon ТОЛЬКО из allowedIcons.`;

  const result = await model.generateContent(
    { 
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    },
    { signal },
  );

  const text = result.response.text() || "{}";
  let parsed: InventoryAssistantResponse;
  try {
    parsed = extractJsonObject(text) as InventoryAssistantResponse;
  } catch (e) {
    console.error("inventoryAssistantService: failed to parse JSON", { text, error: e });
    return {
      intent: "unknown",
      actions: [],
      replyText: "Я не смог понять команду. Попробуй ещё раз, например: «Я выпил молоко» или «Добавь 2 литра молока».",
    };
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI response inválido для inventory assistant.");
  }

  if (!Array.isArray(parsed.actions)) parsed.actions = [];
  if (!parsed.intent) parsed.intent = "unknown";

  const allowedIntentSet = new Set<InventoryAssistantResponse["intent"]>(["query_remaining", "update_inventory", "unknown"]);
  if (!allowedIntentSet.has(parsed.intent)) {
    return { intent: "unknown", actions: [], replyText: "Я не смог понять команду." };
  }

  // Hard validation/guardrails: only apply actions that reference known product ids.
  const knownIds = new Set(req.products.map((p) => p.id));
  const safeActions: InventoryAssistantAction[] = [];
  for (const a of parsed.actions) {
    if (!a || typeof a !== "object") continue;

    if (a.type === "set_quantity") {
      if (!a.id || !knownIds.has(a.id)) continue;
      const q = Number((a as any).quantity);
      if (!Number.isFinite(q)) continue;
      safeActions.push({
        type: "set_quantity",
        id: a.id,
        quantity: Math.max(0, q),
        unit: a.unit,
        name: a.name,
        icon: a.icon,
        location: a.location,
      });
    } else if (a.type === "adjust_quantity") {
      if (!a.id || !knownIds.has(a.id)) continue;
      const dq = Number((a as any).deltaQuantity);
      if (!Number.isFinite(dq)) continue;
      safeActions.push({
        type: "adjust_quantity",
        id: a.id,
        deltaQuantity: dq,
        unit: a.unit,
        name: a.name,
        icon: a.icon,
        location: a.location,
      });
    } else if (a.type === "insert_product") {
      // allow insert without id
      const data: any = (a as any).data;
      if (!data || typeof data !== "object") continue;
      const name = String(data.name || "").trim();
      if (!name) continue;
      const location = data.location as InventoryLocation;
      if (location !== "fridge" && location !== "freezer" && location !== "shelf") continue;
      const quantity = Number(data.quantity);
      if (!Number.isFinite(quantity)) continue;
      const unit = String(data.unit || "шт").trim() || "шт";
      const icon = String(data.icon || "🍽️");
      safeActions.push({
        type: "insert_product",
        data: {
          name,
          location,
          quantity: Math.max(0, quantity),
          unit,
          icon,
          expiry_date: data.expiry_date ?? null,
        },
      });
    }
  }

  parsed.actions = safeActions;

  if (parsed.intent === "query_remaining") {
    // For query intent, no inventory updates should be executed.
    parsed.actions = [];
    if (!parsed.query) parsed.query = { productId: null, germanName: "" };
  }

  // Санация: гарантируем, что icon из allowedIcons
  const allowed = new Set(PRODUCT_ICONS);
  for (const a of parsed.actions) {
    if (a.type === "insert_product" && a.data && a.data.icon && !allowed.has(a.data.icon)) {
      a.data.icon = "🍽️";
    }
    if (a.type !== "insert_product" && (a as any).icon && !allowed.has((a as any).icon)) {
      (a as any).icon = "🍽️";
    }
  }

  return parsed;
}


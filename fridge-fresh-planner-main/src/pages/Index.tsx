import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TabSwitcher from "@/components/TabSwitcher";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import AddProductForm from "@/components/AddProductForm";
import { toast } from "sonner";
import { Mic, Send, Trash2 } from "lucide-react";
import { runInventoryAssistant } from "@/services/inventoryAssistantService";
import { markShoppingItemsAsBoughtByProducts } from "@/services/shoppingListSyncService";

const Index = () => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState("fridge");
  const [formOpen, setFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string; id: string }[]>([]);
  const [listening, setListening] = useState(false);
  const [mustHaveExpanded, setMustHaveExpanded] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shoppingConsolidatedOnceRef = useRef(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const normalizeForMatch = (name: string) => (name.split("(")[0] || name).trim().toLowerCase();

  
  const defaultMustHave = [
    { key: "milk", name: "Молоко", icon: "🥛", unit: "л", lowQty: 1 },
    { key: "eggs", name: "Яйца", icon: "🥚", unit: "шт", lowQty: 4 },
    { key: "cheese", name: "Сыр", icon: "🧀", unit: "г", lowQty: 100 },
    { key: "bread", name: "Хлеб", icon: "🍞", unit: "шт", lowQty: 1 },
  ];

  const [mustHaveList, setMustHaveList] = useState(() => {
    const saved = localStorage.getItem("app_must_have");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultMustHave;
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.user_metadata?.must_have_items) {
        setMustHaveList(data.user.user_metadata.must_have_items);
      }
    });
  }, []);

  const saveMustHaveList = async (newList: any[]) => {
    setMustHaveList(newList);
    localStorage.setItem("app_must_have", JSON.stringify(newList));
    await supabase.auth.updateUser({
      data: { must_have_items: newList }
    });
  };

  const removeMustHave = (key: string) => {
    saveMustHaveList(mustHaveList.filter((item: any) => item.key !== key));
  };

  const [newMustHaveName, setNewMustHaveName] = useState("");
  const [newMustHaveIcon, setNewMustHaveIcon] = useState("🍽️");
  
  const addMustHave = () => {
    if (!newMustHaveName.trim()) return;
    const newItem = {
      key: crypto.randomUUID(),
      name: newMustHaveName.trim(),
      icon: newMustHaveIcon,
      unit: "шт",
      lowQty: 1,
    };
    saveMustHaveList([...mustHaveList, newItem]);
    setNewMustHaveName("");
    setNewMustHaveIcon("🍽️");
  };


  const { data: activeShoppingItems = [] } = useQuery({
    queryKey: ["shopping_list_active_index"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_list")
        .select("*")
        .eq("checked", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  
  // Cleanup: if the cart already has duplicates from previous sessions,
  // merge them by (name without German) + unit.
  useEffect(() => {
    if (shoppingConsolidatedOnceRef.current) return;
    if (!activeShoppingItems?.length) return;

    const byKey = new Map<string, any[]>();
    for (const it of activeShoppingItems as any[]) {
      const name = normalizeForMatch(String(it?.name || ""));
      const unit = String(it?.unit || "").trim().toLowerCase();
      const key = `${name}|${unit}`;
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key)!.push(it);
    }

    const duplicates = [...byKey.entries()].filter(([, items]) => items.length > 1);
    if (duplicates.length === 0) {
      shoppingConsolidatedOnceRef.current = true;
      return;
    }

    void (async () => {
      try {
        for (const [, items] of duplicates) {
          const totalQty = items.reduce((s, x) => s + Number(x?.quantity || 0), 0);
          const keep = items[0];
          await supabase.from("shopping_list").update({ quantity: totalQty }).eq("id", keep.id);
          for (const del of items.slice(1)) {
            await supabase.from("shopping_list").delete().eq("id", del.id);
          }
        }
      } finally {
        shoppingConsolidatedOnceRef.current = true;
        queryClient.invalidateQueries({ queryKey: ["shopping_list_active_index"] });
        queryClient.invalidateQueries({ queryKey: ["shopping_list"] });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeShoppingItems]);

  const locationMap: Record<string, string> = {
    fridge: "fridge",
    freezer: "freezer",
    pantry: "shelf",
  };

  const filtered = products.filter((p) => p.location === locationMap[activeTab]);
  const sorted = [...filtered].sort((a: any, b: any) => {
    const ad = a.expiry_date ? new Date(a.expiry_date).getTime() : Number.POSITIVE_INFINITY;
    const bd = b.expiry_date ? new Date(b.expiry_date).getTime() : Number.POSITIVE_INFINITY;
    return ad - bd;
  });

  const activeLocation = locationMap[activeTab] as "fridge" | "freezer" | "shelf";
  const approxQty = (val: number) => (val % 1 === 0 ? val.toString() : val.toFixed(1));

  const handleChatSendText = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    const isConsumption =
      /(выпил|съел|сьел|использовал|уменьшилось|закончился|закончилась|нет больше|уже нет|keine|mehr)/i.test(lower);

    const userMsg = { role: "user" as const, text, id: crypto.randomUUID() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    const baseName = (pName: string) => (pName.split("(")[0] || pName).trim().toLowerCase();
    const tokensFromLower = (s: string) =>
      s
        .split(/[^a-zA-Zа-яА-ЯёЁ0-9]+/g)
        .map((t) => t.trim())
        .filter((t) => t.length >= 4);

    const findBestProduct = (productKeys: string[]) => {
      const candidates = products
        .filter((p: any) => p && typeof p.name === "string")
        .map((p: any) => ({ p, base: baseName(p.name), full: String(p.name).toLowerCase() }))
        .filter((x) => productKeys.some((k) => x.base.includes(k)));

      if (candidates.length === 0) return null;
      if (candidates.length === 1) return candidates[0].p as any;

      const tokens = tokensFromLower(lower);
      const stop = new Set([
        ...productKeys,
        "все",
        "всё",
        "привет",
        "шеф",
        "ты",
        "тут",
        "я",
        "мы",
        "у",
        "нас",
        "пожалуйста",
      ]);
      const qualifierTokens = tokens.filter((t) => !stop.has(t) && !productKeys.some((k) => t.includes(k)));

      const score = (cand: any) => {
        let s = cand.base.length / 10;
        for (const t of qualifierTokens) {
          if (cand.full.includes(t)) s += 10;
        }
        return s;
      };

      const scored = candidates.map((c) => ({ c, s: score(c) })).sort((a, b) => b.s - a.s);
      const best = scored[0];
      const second = scored[1];
      if (!second) return best.c.p;

      // If ambiguous (no qualifier match), ask clarification by returning null.
      if (best.s <= 0.01 || best.s - second.s < 5) return null;
      return best.c.p as any;
    };

    const numberMatch = text.match(/(\d+(?:[.,]\d+)?)/);
    const parsedNumber = numberMatch ? parseFloat(numberMatch[1].replace(",", ".")) : null;

    const commonFoodMap: { productKeys: string[]; messageKeys: string[]; replyGerman: string }[] = [
      { productKeys: ["яйц"], messageKeys: ["яйц", "яиц", "яйца", "eier"], replyGerman: "Eier" },
      { productKeys: ["молок"], messageKeys: ["молок", "milch"], replyGerman: "Milch" },
      { productKeys: ["сыр"], messageKeys: ["сыр", "käse", "kaese"], replyGerman: "Käse" },
      { productKeys: ["кефир"], messageKeys: ["кефир", "kefir"], replyGerman: "Kefir" },
      { productKeys: ["йогур"], messageKeys: ["йогур", "joghurt"], replyGerman: "Joghurt" },
      { productKeys: ["курин"], messageKeys: ["курин", "hähnchen", "haehnchen"], replyGerman: "Hähnchen" },
      { productKeys: ["мяс"], messageKeys: ["мяс", "fleisch"], replyGerman: "Fleisch" },
    ];

    // Local fallback for reliability: common "query remaining" and "consume" commands.
    const tryHandleLocally = async () => {
      const isQuery = /сколько|остал|wie viel|wieviel|haben wir|haben wir noch/i.test(lower);
      const isAdd = /(купил|купила|добавил|добавила|добавь|добавить|прибавь|принес|привез)/i.test(lower);

      const stop = new Set([
        "сколько",
        "осталось",
        "остал",
        "у",
        "нас",
        "есть",
        "haben",
        "wir",
        "noch",
        "wieviel",
        "wie",
        "viel",
        "und",
        "oder",
        "ich",
        "du",
        "ты",
        "вы",
        "я",
        "готово",
        "ок",
        "пожалуйста",
        "ппожалуйста",
        "шеф",
        "тут",
        "привет",
        "выпил",
        "съел",
        "использовал",
        "уменьшилось",
        "закончился",
        "закончилась",
        "нет",
        "больше",
        "уже",
        "keine",
        "mehr",
        "aus",
        "всё",
        "все",
        "выпил",
        "выпила",
      ]);

      const tokens = lower
        .split(/[^a-zA-Zа-яА-ЯёЁ0-9]+/g)
        .map((t) => t.trim())
        .filter((t) => t.length >= 4 && !stop.has(t));

      const findBestFromText = () => {
        if (tokens.length === 0) return null;
        const scored = products
          .map((p: any) => {
            const base = baseName(String(p?.name || ""));
            const full = String(p?.name || "").toLowerCase();
            let score = 0;
            for (const t of tokens) {
              if (base.includes(t) || full.includes(t)) score += 10;
            }
            // prefer exact token match in base
            score += base.length / 50;
            return { p, score };
          })
          .sort((a: any, b: any) => b.score - a.score);
        const best = scored[0];
        if (!best || best.score < 10) return null;
        return best.p as any;
      };

      // generic: query remaining for ANY product
      if (isQuery) {
        const prod = findBestFromText();
        if (prod) {
          const q = Number(prod.quantity || 0);
          const unit = prod.unit || "шт";
          const germanName = "—";
          const reply =
            q <= 0 ? `Закончился (${prod.name})` : `Осталось примерно ${approxQty(q)} ${unit} (${germanName})`;
          setChatMessages((prev) => [...prev, { role: "assistant", text: reply, id: crypto.randomUUID() }]);
          return true;
        }
        for (const entry of commonFoodMap) {
          const wants = entry.messageKeys.some((k) => lower.includes(k));
          if (!wants) continue;

          const candidates = products.filter((p: any) => {
            const base = baseName(String(p?.name || ""));
            return entry.productKeys.some((k) => base.includes(k));
          });

          if (candidates.length === 0) continue;
          const sumQty = candidates.reduce((s, p: any) => s + Number(p?.quantity || 0), 0);
          const unit = candidates[0]?.unit || "шт";
          const reply =
            sumQty <= 0 ? `Закончился (${entry.replyGerman})` : `Осталось примерно ${approxQty(sumQty)} ${unit} (${entry.replyGerman})`;

          setChatMessages((prev) => [...prev, { role: "assistant", text: reply, id: crypto.randomUUID() }]);
          return true;
        }
      }

      if (isAdd) {
        // "Я купил 2 Авокадо" -> increase quantity for the best matching product
        const best = findBestFromText();
        if (best) {
          const delta = parsedNumber !== null && Number.isFinite(parsedNumber) ? (parsedNumber as number) : 1;
          const currentQty = Number(best.quantity || 0);
          const newQty = Math.max(0, currentQty + Math.max(0, delta));

          await supabase
            .from("products")
            .update({ quantity: newQty, max_quantity: Math.max(Number(best.max_quantity || newQty), newQty) })
            .eq("id", best.id);
          queryClient.invalidateQueries({ queryKey: ["products"] });

          setChatMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: `Ок, добавил: ${best.name} стало ${approxQty(newQty)} ${best.unit || ""}`.trim(),
              id: crypto.randomUUID(),
            },
          ]);
          return true;
        }

        // If the product is not present in the local list,
        // let Gemini handle insertion (insert_product) instead of blocking.
        return false;
      }

      if (isConsumption) {
        const prod = findBestFromText();
        if (prod) {
          const all = /(все|всё)/i.test(lower);
          const hasNumber = parsedNumber !== null && Number.isFinite(parsedNumber);
          if (all) {
            const targets = products.filter((p: any) => {
              const base = baseName(String(p?.name || ""));
              const full = String(p?.name || "").toLowerCase();
              return tokens.some((t) => base.includes(t) || full.includes(t));
            });

            for (const t of targets) {
              const currentQty = Number(t.quantity || 0);
              if (currentQty <= 0) continue;
              await supabase
                .from("products")
                .update({ quantity: 0, max_quantity: Math.max(Number(t.max_quantity || 0), 0) })
                .eq("id", t.id);
            }

            queryClient.invalidateQueries({ queryKey: ["products"] });
            setChatMessages((prev) => [
              ...prev,
              { role: "assistant", text: "Ок, обновил: всё подходящее закончилось.", id: crypto.randomUUID() },
            ]);
            return true;
          }

          const currentQty = Number(prod.quantity || 0);
          const delta = hasNumber ? (parsedNumber as number) : prod.unit === "шт" ? 1 : 0;
          const newQty = Math.max(0, currentQty - delta);
          await supabase
            .from("products")
            .update({ quantity: newQty, max_quantity: Math.max(Number(prod.max_quantity || newQty), newQty) })
            .eq("id", prod.id);
          queryClient.invalidateQueries({ queryKey: ["products"] });

          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", text: t("ast_updated_left", {name: prod.name, qty: approxQty(newQty), unit: prod.unit || ""}) as string, id: crypto.randomUUID() },
          ]);
          return true;
        }
        for (const entry of commonFoodMap) {
          const wants = entry.messageKeys.some((k) => lower.includes(k));
          if (!wants) continue;

          const allFlag = /(все|всё)/i.test(lower);
          const candidates = products.filter((p: any) => {
            const base = baseName(String(p?.name || ""));
            return entry.productKeys.some((k) => base.includes(k));
          });

          if (candidates.length === 0) continue;

          const targets = (() => {
            if (allFlag) return candidates;
            const best = findBestProduct(entry.productKeys);
            if (!best) return null;
            return candidates.filter((c: any) => c.id === best.id);
          })();

          if (!targets) {
            setChatMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                text: t("ast_specify", {name: entry.replyGerman}) as string,
                id: crypto.randomUUID(),
              },
            ]);
            return true;
          }

          const hasNumber = parsedNumber !== null && Number.isFinite(parsedNumber);
          for (const prod of targets) {
            const currentQty = Number(prod.quantity || 0);
            const unit = String(prod.unit || "шт");
            const newQty = hasNumber
              ? Math.max(0, currentQty - (parsedNumber as number))
              : unit === "шт"
                ? Math.max(0, currentQty - 1)
                : 0;

            await supabase
              .from("products")
              .update({ quantity: newQty, max_quantity: Math.max(Number(prod.max_quantity || 0), newQty) })
              .eq("id", prod.id);

            queryClient.invalidateQueries({ queryKey: ["products"] });
          }

          setChatMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: t("ast_updated_stock", {name: entry.replyGerman}) as string,
              id: crypto.randomUUID(),
            },
          ]);
          return true;
        }
      }

      if (isConsumption) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: t("ast_not_found_list") as string,
            id: crypto.randomUUID(),
          },
        ]);
        return true;
      }

      return false;
    };

    if (await tryHandleLocally()) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const res = await runInventoryAssistant({ activeLocation, products, message: text, fallbackErrorAi: t("ast_err_ai") as string, fallbackUnknown: t("ast_err_unknown") as string, fallbackNotFound: t("ast_not_found") as string, language }, controller.signal);

      if (res.intent === "query_remaining") {
        const productId = res.query?.productId ?? null;
        const product = productId ? products.find((p) => p.id === productId) : null;

        if (productId && product) {
          const germanName = res.query?.germanName || product.name;
          const quantity = product.quantity;
          const unit = product.unit || "шт";

          const reply = quantity <= 0 ? t("ast_empty", {name: germanName}) as string : t("ast_left_approx", {qty: approxQty(quantity), unit, name: germanName}) as string;
          setChatMessages((prev) => [...prev, { role: "assistant", text: reply, id: crypto.randomUUID() }]);
        } else {
          setChatMessages((prev) => [...prev, { role: "assistant", text: res.replyText || (t("ast_not_found") as string), id: crypto.randomUUID() }]);
        }
      } else {
        const touchedProductsForSync: { name: string; quantity: number; unit: string }[] = [];
        for (const a of res.actions) {
          if (a.type === "set_quantity") {
            if (!a.id) continue;
            const current = products.find((p) => p.id === a.id);
            if (!current) continue;
            if (isConsumption && a.quantity > 0) continue;
            const payload: any = {
              quantity: Math.max(0, a.quantity),
              max_quantity: Math.max(Number(current?.max_quantity || a.quantity), Math.max(0, a.quantity)),
            };
            if (a.unit) payload.unit = a.unit;
            if (a.name) payload.name = a.name;
            if (a.icon) payload.icon = a.icon;
            if (a.location) payload.location = a.location;
            await supabase.from("products").update(payload).eq("id", a.id);
            touchedProductsForSync.push({
              name: payload.name || current?.name || "",
              quantity: payload.quantity,
              unit: payload.unit || current?.unit || "шт",
            });
          } else if (a.type === "adjust_quantity") {
            if (!a.id) continue;
            const current = products.find((p) => p.id === a.id);
            if (isConsumption && a.deltaQuantity > 0) continue;
            const nextQty = Math.max(0, (current?.quantity || 0) + a.deltaQuantity);
            const payload: any = {
              quantity: nextQty,
              max_quantity: Math.max(Number(current?.max_quantity || nextQty), nextQty),
            };
            if (a.unit) payload.unit = a.unit;
            if (a.name) payload.name = a.name;
            if (a.icon) payload.icon = a.icon;
            if (a.location) payload.location = a.location;
            await supabase.from("products").update(payload).eq("id", a.id);
            touchedProductsForSync.push({
              name: payload.name || current?.name || "",
              quantity: payload.quantity,
              unit: payload.unit || current?.unit || "шт",
            });
          } else if (a.type === "insert_product") {
            const payload: any = {
              ...a.data,
              quantity: Math.max(0, a.data.quantity),
              max_quantity: Math.max(0, a.data.quantity),
            };
            // Ensure the inserted product appears in the currently visible tab.
            payload.location = payload.location || activeLocation;
            await supabase.from("products").insert(payload);
            touchedProductsForSync.push({ name: payload.name, quantity: payload.quantity, unit: payload.unit });
          }
        }

        queryClient.invalidateQueries({ queryKey: ["products"] });
        await markShoppingItemsAsBoughtByProducts(touchedProductsForSync);
        const reply = res.replyText || (t("ast_done") as string);
        setChatMessages((prev) => [...prev, { role: "assistant", text: reply, id: crypto.randomUUID() }]);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || (t("ast_err_toast") as string));
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: t("ast_err_conn") as string, id: crypto.randomUUID() },
      ]);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleChatSend = async () => {
    await handleChatSendText(chatInput);
  };

  const micSupported = useMemo(() => {
    const w = window as any;
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  }, []);

  const startOrStopMic = () => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      toast.error(t("ast_err_mic") as string);
      return;
    }

    if (listening) {
      recognitionRef.current?.stop?.();
      setListening(false);
      return;
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    // Language auto-detection is not guaranteed; this is best-effort for RU/DE.
    rec.lang = navigator.language || "ru-RU";

    let finalTranscript = "";
    rec.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const transcript = res[0]?.transcript || "";
        if (res.isFinal) finalTranscript += transcript;
        else interim += transcript;
      }

      const combined = (finalTranscript || interim).trim();
      if (combined) setChatInput(combined);

      if (finalTranscript.trim().length > 0) {
        setListening(false);
        rec.stop?.();
        handleChatSendText(finalTranscript);
      }
    };

    rec.onerror = (e: any) => {
      console.error("SpeechRecognition error:", e);
      setListening(false);
      const msg = e?.error === "not-allowed" ? "Нет разрешения на микрофон." : "Ошибка распознавания речи.";
      toast.error(msg);
    };

    rec.onend = () => {
      setListening(false);
    };

    setListening(true);
    // Starting recognition triggers browser permission prompt.
    rec.start();
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-primary/10">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 pt-6 pb-4">
        <style>{`
          @keyframes inventoryWave {
            0%, 100% { transform: scaleY(0.25); opacity: 0.7; }
            50% { transform: scaleY(1); opacity: 1; }
          }
        `}</style>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold tracking-tight">{t("idx_title")}</h1>
        </div>

        <div className="p-3 rounded-2xl border border-border bg-card/60 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mic className="text-primary" size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-sm font-semibold text-card-foreground">{t("idx_inventory_title")}</div>
                <button
                  type="button"
                  onClick={startOrStopMic}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    listening
                      ? "bg-primary text-primary-foreground border-primary/60"
                      : "bg-secondary hover:bg-muted border-border"
                  }`}
                >
                  {listening ? t("idx_listening") : t("idx_mic")}
                </button>
              </div>

              <div className="flex gap-2 items-start">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder={t("idx_chat_placeholder") as string}
                />
                <button
                  type="button"
                  onClick={handleChatSend}
                  className="w-12 h-[70px] rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0"
                  aria-label="Отправить"
                >
                  <Send size={18} />
                </button>

                {listening && (
                  <div className="flex items-end gap-1 h-[52px] px-2">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 rounded-full bg-primary/80"
                        style={{
                          height: 10 + idx * 4,
                          transformOrigin: "bottom",
                          animation: "inventoryWave 0.9s ease-in-out infinite",
                          animationDelay: `${idx * 0.12}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {chatMessages.length > 0 && (
                <div className="mt-3 border border-border rounded-xl bg-background p-3 max-h-[160px] overflow-y-auto space-y-2">
                  {chatMessages.slice(-6).map((m) => (
                    <div key={m.id} className={`text-sm ${m.role === "assistant" ? "text-card-foreground" : "text-primary font-medium"}`}>
                      <span className="opacity-60 mr-2">{m.role === "assistant" ? t("idx_chef") : t("idx_you")}</span>
                      {m.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setMustHaveExpanded((v) => !v)}
            className="w-full p-3 rounded-2xl border border-border bg-card/50 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">✨</span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold truncate">{t("idx_musthave_title")}</h2>
                <p className="text-[11px] text-muted-foreground truncate">{t("idx_musthave_subtitle")}</p>
              </div>
            </div>
            <span className="text-[11px] text-primary whitespace-nowrap">{mustHaveExpanded ? t("idx_hide") : t("idx_show")}</span>
          </button>

          {mustHaveExpanded && (
            <div className="mt-2 p-3 rounded-2xl border border-border bg-card/50">
              <div className="space-y-2">
                
                {mustHaveList.map((def) => {
                  const product = products.find((p: any) => {
                    const base = normalizeForMatch(String(p?.name || ""));
                    return base.includes(normalizeForMatch(def.name)) || normalizeForMatch(def.name).includes(base);
                  });

                  const qty = product ? Number(product.quantity || 0) : 0;
                  const inShopping = activeShoppingItems.some((i: any) => normalizeForMatch(i?.name || "") === normalizeForMatch(def.name));

                  const status =
                    !product || qty <= 0
                      ? { label: t("idx_need_buy") as string, tone: "text-red-600" }
                      : qty <= def.lowQty
                        ? { label: t("idx_running_low", {qty, unit: def.unit}) as string, tone: "text-amber-600" }
                        : { label: t("idx_in_stock", {qty, unit: def.unit}) as string, tone: "text-green-600" };

                  return (

                    <div key={def.key} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{def.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-card-foreground truncate">{def.name}</p>
                          <p className={`text-[11px] font-semibold ${status.tone} truncate`}>{status.label}</p>
                        </div>
                      </div>
                      {inShopping ? (
                        <span className="text-[11px] font-bold text-primary whitespace-nowrap">{t("idx_in_cart")}</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">—</span>
                      )}
                      <button onClick={() => removeMustHave(def.key)} className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-2 shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                <input 
                  type="text" 
                  value={newMustHaveIcon} 
                  onChange={e => setNewMustHaveIcon(e.target.value)} 
                  className="w-10 h-8 rounded-lg bg-background border border-border text-center text-sm" 
                  maxLength={2}
                  placeholder="🍽️"
                />
                <input 
                  type="text" 
                  value={newMustHaveName} 
                  onChange={e => setNewMustHaveName(e.target.value)} 
                  className="flex-1 h-8 px-2 rounded-lg bg-background border border-border text-sm" 
                  placeholder={t("idx_add_placeholder") as string}
                  onKeyDown={e => e.key === 'Enter' && addMustHave()}
                />
                <button 
                  onClick={addMustHave}
                  className="px-3 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                >
                  Добавить
                </button>
              </div>
            </div>
          )}
        </div>

        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      </header>

      <main className="px-4 pb-32">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <span className="text-5xl mb-4">🛒</span>
            <p className="text-lg font-medium">{t("idx_time_to_shop")}</p>
            <p className="text-sm">{t("idx_empty_here")}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {sorted.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                quantity={product.quantity}
                maxQuantity={Math.max((product as any).max_quantity || product.quantity, product.quantity)}
                unit={product.unit}
                icon={product.icon}
                expiryDate={product.expiry_date}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav onAddClick={() => setFormOpen(true)} />
      <AddProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultLocation={locationMap[activeTab]}
      />
    </div>
  );
};

export default Index;

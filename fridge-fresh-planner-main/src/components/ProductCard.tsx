import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInDays, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ProductCardProps {
  id: string;
  name: string;
  quantity: number;
  maxQuantity: number;
  unit: string;
  icon: string;
  expiryDate: string | null;
}

const getFreshness = (expiryDate: string | null): number => {
  if (!expiryDate) return 1;
  const today = new Date();
  const expiry = parseISO(expiryDate);
  const daysLeft = differenceInDays(expiry, today);
  if (daysLeft <= 0) return 0;
  if (daysLeft >= 30) return 1;
  return daysLeft / 30;
};

const getFreshnessColor = (val: number) => {
  if (val > 0.6) return "bg-fresh";
  if (val > 0.3) return "bg-expiring";
  return "bg-expired";
};

const formatQty = (val: number) => {
  return val % 1 === 0 ? val.toString() : val.toFixed(1);
};

const ProductCard = ({ id, name, quantity, maxQuantity, unit, icon, expiryDate }: ProductCardProps) => {
  const freshness = getFreshness(expiryDate);
  const [localQty, setLocalQty] = useState(quantity);
  const [showDelete, setShowDelete] = useState(false);
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const [editingQty, setEditingQty] = useState(false);
  const [qtyDraft, setQtyDraft] = useState<string>(String(quantity));

  const isExpired = Boolean(expiryDate) && (() => {
    try {
      return parseISO(expiryDate as string) <= new Date();
    } catch {
      return false;
    }
  })();

  // Sync UI slider state with server changes (e.g. from inventory assistant)
  useEffect(() => {
    setLocalQty(quantity);
    // If the server says 0, show the "finished" state (and allow delete if desired)
    setShowDelete(quantity === 0);
    if (!editingQty) setQtyDraft(String(quantity));
  }, [quantity]);

  const commitQty = async (rawValue: string) => {
    const parsed = parseFloat(rawValue);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setQtyDraft(String(quantity));
      setEditingQty(false);
      return;
    }

    const newQty = Math.round(parsed * 10) / 10;
    setLocalQty(newQty);
    setShowDelete(newQty === 0);
    setEditingQty(false);
    setQtyDraft(String(newQty));

    clearTimeout(debounceRef.current);
    await supabase.from("products").update({ quantity: newQty, max_quantity: newQty }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleChange = useCallback((value: number[]) => {
    const newQty = Math.round(value[0] * 10) / 10;
    setLocalQty(newQty);
    setShowDelete(newQty === 0);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await supabase.from("products").update({ quantity: newQty }).eq("id", id);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }, 400);
  }, [id, queryClient]);

  const handleDelete = async () => {
    await supabase.from("products").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      layout
      className={`bg-card p-4 rounded-2xl shadow-card flex items-center gap-4 border border-border ${isExpired ? "border-red-500/60" : ""}`}
    >
      <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1.5">
          <h3 className="font-semibold text-base truncate pr-2 text-card-foreground">
            {name}
          </h3>
            {!editingQty ? (
              <button
                type="button"
                onClick={() => {
                  setQtyDraft(String(localQty));
                  setEditingQty(true);
                }}
                className="text-xs font-bold text-muted-foreground tabular-nums uppercase tracking-wider shrink-0 hover:text-foreground transition-colors"
              >
                {formatQty(localQty)} {unit}
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  step="0.1"
                  value={qtyDraft}
                  onChange={(e) => setQtyDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitQty(qtyDraft);
                    if (e.key === "Escape") {
                      setQtyDraft(String(quantity));
                      setEditingQty(false);
                    }
                  }}
                  onBlur={() => commitQty(qtyDraft)}
                  className="w-20 px-2 py-1 rounded-lg border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  autoFocus
                />
                <span className="text-xs text-muted-foreground uppercase">{unit}</span>
              </div>
            )}
        </div>

        {expiryDate ? (
          <div className={`text-[11px] font-semibold mb-2 ${isExpired ? "text-red-600" : "text-muted-foreground"}`}>
            Срок до: {new Date(expiryDate).toLocaleDateString()}
          </div>
        ) : null}

        {localQty <= 0 && (
          <div className="text-[11px] font-semibold text-destructive mt-1 mb-2">
            Закончилось
          </div>
        )}

        <Slider
          value={[localQty]}
          min={0}
          max={Math.max(maxQuantity, localQty)}
          step={0.1}
          onValueChange={handleChange}
          className="mb-2"
        />

        <AnimatePresence>
          {showDelete ? (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors mt-1"
            >
              <Trash2 size={14} />
              Удалить продукт?
            </motion.button>
          ) : (
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${freshness * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${getFreshnessColor(freshness)}`}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductCard;

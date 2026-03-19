import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface ScannedProduct {
  name: string;
  quantity: number;
  unit: string;
  location: string;
  icon: string;
  calories_per_100g: number | null;
  expiry_date?: string | null;
  selected: boolean;
}

interface ScanConfirmListProps {
  products: ScannedProduct[];
  onConfirm: (products: ScannedProduct[]) => void;
  onCancel: () => void;
  loading: boolean;
}

const ScanConfirmList = ({ products, onConfirm, onCancel, loading }: ScanConfirmListProps) => {
  const [items, setItems] = useState<ScannedProduct[]>(products);

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const selectedCount = items.filter((i) => i.selected).length;

  const locationLabels: Record<string, string> = {
    fridge: "Холодильник",
    freezer: "Морозилка",
    shelf: "Полка",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-card-foreground">
          Найдено продуктов: {products.length}
        </h3>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-secondary transition-colors">
          <X size={18} className="text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              item.selected ? "bg-secondary" : "bg-secondary/40 opacity-60"
            }`}
          >
            <Checkbox
              checked={item.selected}
              onCheckedChange={() => toggleItem(index)}
              className="shrink-0"
            />
            <span className="text-xl shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">{item.name}</p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{item.quantity} {item.unit}</span>
                <span>·</span>
                <span>{locationLabels[item.location] || item.location}</span>
                {item.expiry_date && (
                  <>
                    <span>·</span>
                    <span>{new Date(item.expiry_date).toLocaleDateString()}</span>
                  </>
                )}
                {item.calories_per_100g && (
                  <>
                    <span>·</span>
                    <span>{item.calories_per_100g} ккал</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => onConfirm(items.filter((i) => i.selected))}
        disabled={selectedCount === 0 || loading}
        className="w-full py-4 rounded-2xl bg-foreground text-background font-semibold text-base disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Добавляю...
          </>
        ) : (
          <>
            <Check size={18} />
            Добавить {selectedCount} {selectedCount === 1 ? "продукт" : "продуктов"}
          </>
        )}
      </button>
    </div>
  );
};

export default ScanConfirmList;

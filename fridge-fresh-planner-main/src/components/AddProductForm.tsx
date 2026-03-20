import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ScanLine, Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import ScanConfirmList, { ScannedProduct } from "./ScanConfirmList";
import { PRODUCT_ICONS } from "@/constants/productIcons";
import { markShoppingItemsAsBoughtByProducts } from "@/services/shoppingListSyncService";



const ICONS = [...PRODUCT_ICONS];

interface AddProductFormProps {
  open: boolean;
  onClose: () => void;
  defaultLocation: string;
}

type FormView = "form" | "scanning" | "confirm";

const AddProductForm = ({ open, onClose, defaultLocation }: AddProductFormProps) => {
  const { t } = useTranslation();
    const LOCATIONS = [
    { id: "fridge", label: t("tab_fridge") },
    { id: "freezer", label: t("tab_freezer") },
    { id: "shelf", label: t("tab_pantry") },
  ];
  const [name, setName] = useState("");
  const [location, setLocation] = useState(defaultLocation);
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("шт");
  const [icon, setIcon] = useState("🍽️");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState<FormView>("form");
  const [scanLoading, setScanLoading] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setLocation(defaultLocation);
    }
  }, [open, defaultLocation]);

  const queryClient = useQueryClient();

  const resetForm = () => {
    setName("");
    setQuantity("1");
    setUnit("шт");
    setIcon("🍽️");
    setExpiryDate("");
    setView("form");
    setScannedProducts([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const qty = parseFloat(quantity) || 1;
    const { error } = await supabase.from("products").insert({
      name: name.trim(),
      location,
      quantity: qty,
      max_quantity: qty,
      unit,
      icon,
      expiry_date: expiryDate || null,
    });

    setLoading(false);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      await markShoppingItemsAsBoughtByProducts([{ name: name.trim(), quantity: qty, unit }]);
      resetForm();
      onClose();
    } else {
      // Выводим ошибку в консоль и показываем уведомление пользователю
      console.error("Ошибка добавления в Supabase:", error);
      toast.error(`Не удалось добавить: ${error.message}`);
    }
  };

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    e.target.value = "";

    setScanLoading(true);
    setView("scanning");

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // Strip data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("scan-receipt", {
        body: { imageBase64: base64 },
      });

      if (error) throw error;

      const products: ScannedProduct[] = (data.products || []).map((p: any) => ({
        name: p.name || "Продукт",
        quantity: p.quantity || 1,
        unit: p.unit || "шт",
        location: p.location || "fridge",
        icon: p.icon || "🍽️",
        calories_per_100g: p.calories_per_100g || null,
        expiry_date: p.expiry_date || null,
        selected: true,
      }));

      if (products.length === 0) {
        toast.error("Не удалось распознать продукты на чеке");
        setView("form");
      } else {
        setScannedProducts(products);
        setView("confirm");
      }
    } catch (err) {
      console.error("Scan error:", err);
      toast.error("Ошибка при сканировании чека");
      setView("form");
    } finally {
      setScanLoading(false);
    }
  };

  const handleConfirmProducts = async (products: ScannedProduct[]) => {
    setConfirmLoading(true);
    try {
      const rows = products.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        max_quantity: p.quantity,
        unit: p.unit,
        location: p.location,
        icon: p.icon,
        calories_per_100g: p.calories_per_100g,
        expiry_date: p.expiry_date || null,
      }));

      const { error } = await supabase.from("products").insert(rows);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["products"] });
      await markShoppingItemsAsBoughtByProducts(
        products.map((p) => ({ name: p.name, quantity: p.quantity, unit: p.unit })),
      );
      toast.success(`Добавлено ${products.length} продуктов`);
      resetForm();
      onClose();
    } catch (err) {
      console.error("Insert error:", err);
      toast.error("Ошибка при добавлении продуктов");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {view === "scanning" && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 size={40} className="animate-spin text-primary" />
                <p className="text-lg font-medium text-card-foreground">{t("add_analyze")}</p>
                <p className="text-sm text-muted-foreground">{t("add_ai_parsing")}</p>
              </div>
            )}

            {view === "confirm" && (
              <ScanConfirmList
                products={scannedProducts}
                onConfirm={handleConfirmProducts}
                onCancel={() => setView("form")}
                loading={confirmLoading}
              />
            )}

            {view === "form" && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-card-foreground">{t("add_new_product")}</h2>
                  <button onClick={handleClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Icon picker */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">{t("add_icon")}</label>
                    <div className="flex flex-wrap gap-2">
                      {ICONS.map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setIcon(i)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                            icon === i ? "bg-primary/10 ring-2 ring-primary scale-110" : "bg-secondary hover:bg-secondary/80"
                          }`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">{t("add_name")}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("add_name_placeholder") as string}
                      className="w-full px-4 py-3 rounded-xl bg-secondary border-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">{t("add_location")}</label>
                    <div className="flex gap-2">
                      {LOCATIONS.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => setLocation(loc.id)}
                          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                            location === loc.id
                              ? "bg-foreground text-background"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {loc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity + Unit */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">{t("add_qty")}</label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="0.1"
                        step="0.1"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border-none text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">{t("add_unit")}</label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border-none text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                      >
                        <option value="шт">шт</option>
                        <option value="г">г</option>
                        <option value="кг">кг</option>
                        <option value="мл">мл</option>
                        <option value="л">л</option>
                        <option value="уп">уп</option>
                        <option value="бут">бут</option>
                      </select>
                    </div>
                  </div>

                  {/* Expiry date */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">{t("add_expiry")}</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-secondary border-none text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleScanClick}
                    className="w-full py-4 rounded-2xl bg-primary/10 text-primary font-semibold text-base flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
                  >
                    <Camera size={20} />
                    {t("add_scan_btn")}
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="w-full py-4 rounded-2xl bg-foreground text-background font-semibold text-base disabled:opacity-50 transition-opacity"
                  >
                    {loading ? t("add_adding_btn") : t("add_submit")}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddProductForm;

import { motion } from "framer-motion";
import { Plus, Utensils, ShoppingCart, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface BottomNavProps {
  onAddClick: () => void;
}

const BottomNav = ({ onAddClick }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { icon: Home, label: "Продукты", path: "/" },
    { icon: Utensils, label: "Рецепты", path: "/recipes" },
    { icon: ShoppingCart, label: "Корзина", path: "/shopping" },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-30">
      <div className="bg-card/90 backdrop-blur-xl border border-border/20 shadow-nav rounded-3xl p-2 flex items-center justify-between">
        {navItems.map((item, i) => (
          <span key={item.path} className={`contents ${i === 1 ? "" : ""}`}>
            <button
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 font-medium rounded-2xl transition-colors ${
                path === item.path ? "bg-secondary text-card-foreground" : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </button>
            {i === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddClick}
                className="bg-foreground text-background w-14 h-14 rounded-full flex items-center justify-center shadow-lg -my-4"
              >
                <Plus size={28} strokeWidth={2.5} />
              </motion.button>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;

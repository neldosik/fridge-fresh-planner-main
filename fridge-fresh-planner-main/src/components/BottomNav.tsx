import { Home, List, UtensilsCrossed, Plus, Settings } from "lucide-react"; // Добавили Settings
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onAddClick: () => void;
}

const BottomNav = ({ onAddClick }: BottomNavProps) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Продукты", path: "/" },
    { icon: UtensilsCrossed, label: "Рецепты", path: "/recipes" },
    { icon: List, label: "Список", path: "/shopping" },
    { icon: Settings, label: "Настройки", path: "/settings" }, // Добавили новый пункт
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border px-4 pb-8 pt-2">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[64px]",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Кнопка добавления остается без изменений */}
        <button
          onClick={onAddClick}
          className="flex flex-col items-center gap-1 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-transform active:scale-95"
          aria-label="Добавить продукт"
        >
          <Plus size={20} />
          <span className="text-[10px] font-medium">Добавить</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
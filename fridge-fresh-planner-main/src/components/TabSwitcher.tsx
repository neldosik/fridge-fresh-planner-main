import { motion } from "framer-motion";
import { Refrigerator, Archive, Box } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "fridge", label: "Холодильник", icon: <Refrigerator size={18} /> },
  { id: "freezer", label: "Морозилка", icon: <Archive size={18} /> },
  { id: "pantry", label: "Полка", icon: <Box size={18} /> },
];

interface TabSwitcherProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  return (
    <div className="flex bg-secondary/50 p-1 rounded-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-300 ${
            activeTab === tab.id
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-card rounded-xl shadow-soft"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon} {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TabSwitcher;

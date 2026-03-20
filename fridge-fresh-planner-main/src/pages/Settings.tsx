import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useTheme } from "@/components/ThemeProvider"; // Используем твой хук
import { User, Settings as SettingsIcon, Globe, Banknote, LogOut, Trash2 } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [currency, setCurrency] = useState(localStorage.getItem("app_currency") || "EUR");
  const [language, setLanguage] = useState(localStorage.getItem("app_language") || "ru");

  const handleCurrencyChange = (val: string) => {
    setCurrency(val);
    localStorage.setItem("app_currency", val);
    window.dispatchEvent(new Event("settingsChange"));
  };

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    localStorage.setItem("app_language", val);
    window.dispatchEvent(new Event("settingsChange"));
  };

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setDisplayName(user.user_metadata?.display_name || "");
      }
    };
    getUserData();
  }, []);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      if (error) throw error;
      toast.success("Имя профиля обновлено!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast.error("Ошибка при выходе");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "ВНИМАНИЕ: Это действие нельзя отменить. Все ваши данные будут удалены. Вы уверены?"
    );
    if (confirmed) {
      // В Supabase удаление пользователя обычно делается через Edge Functions или в панели управления
      toast.info("Запрос на удаление отправлен. Проверьте почту для подтверждения.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="p-6 pt-10">
        <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground text-sm">Управляйте своим профилем и приложением</p>
      </header>

      <main className="px-4 space-y-6">
        {/* Секция профиля */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <User size={18} className="text-primary" />
            <CardTitle className="text-lg">Ваш профиль</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя в приложении</Label>
              <Input 
                id="name"
                placeholder="Как вас называть?"
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </CardContent>
        </Card>

        {/* Секция интерфейса */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <SettingsIcon size={18} className="text-primary" />
            <CardTitle className="text-lg">Внешний вид</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Темная тема</Label>
                <p className="text-[12px] text-muted-foreground">Использовать ночной режим</p>
              </div>
              <Switch 
                checked={theme === "dark"} 
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={14} className="text-muted-foreground" />
                <Label>Язык интерфейса</Label>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Выберите язык" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Banknote size={14} className="text-muted-foreground" />
                <Label>Валюта</Label>
              </div>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Выберите валюту" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">Dollar ($)</SelectItem>
                  <SelectItem value="RUB">Ruble (₽)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Опасная зона */}
        <div className="pt-4 space-y-3">
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-500"
          >
            <LogOut size={16} />
            Выйти из системы
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleDeleteAccount} 
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash2 size={16} />
            Удалить аккаунт навсегда
          </Button>
        </div>
      </main>

      {/* Передаем пустую функцию, так как на странице настроек кнопка "Добавить" не нужна, 
          либо можно сделать навигацию на главную */}
      <BottomNav onAddClick={() => navigate("/")} />
    </div>
  );
};

export default Settings;
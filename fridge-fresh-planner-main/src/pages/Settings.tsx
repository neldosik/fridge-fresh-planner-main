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
import { useTheme } from "@/components/ThemeProvider";
import { useTranslation } from "@/hooks/useTranslation"; // Используем твой хук
import { User, Settings as SettingsIcon, Globe, Banknote, LogOut, Trash2 } from "lucide-react";

const Settings = () => {
  const { t } = useTranslation();
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
      toast.success(t("set_toast_saved") as string);
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
      toast.error(t("set_toast_logout_err") as string);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      t("set_delete_confirm") as string
    );
    if (confirmed) {
      // В Supabase удаление пользователя обычно делается через Edge Functions или в панели управления
      toast.info(t("set_toast_delete") as string);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="p-6 pt-10">
        <h1 className="text-3xl font-bold tracking-tight">{t("set_title")}</h1>
        <p className="text-muted-foreground text-sm">{t("set_desc")}</p>
      </header>

      <main className="px-4 space-y-6">
        {/* Секция профиля */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <User size={18} className="text-primary" />
            <CardTitle className="text-lg">{t("set_profile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("set_name_label")}</Label>
              <Input 
                id="name"
                placeholder={t("set_name_placeholder") as string}
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
              {loading ? t("set_saving") : t("set_save_btn")}
            </Button>
          </CardContent>
        </Card>

        {/* Секция интерфейса */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <SettingsIcon size={18} className="text-primary" />
            <CardTitle className="text-lg">{t("set_appearance")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t("set_dark_mode")}</Label>
                <p className="text-[12px] text-muted-foreground">{t("set_dark_mode_desc")}</p>
              </div>
              <Switch 
                checked={theme === "dark"} 
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={14} className="text-muted-foreground" />
                <Label>{t("set_lang")}</Label>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder={t("set_lang_placeholder") as string} />
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
                <Label>{t("set_currency")}</Label>
              </div>
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder={t("set_currency_placeholder") as string} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">Dollar ($)</SelectItem>
                  <SelectItem value="RUB">Ruble (₽)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          <InstallPwaButton />
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
            {t("set_logout")}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleDeleteAccount} 
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash2 size={16} />
            {t("set_delete_account")}
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
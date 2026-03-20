import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

export function InstallPwaButton() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Проверка, установлено ли уже приложение (standalone)
    const matchMediaCheck = window.matchMedia("(display-mode: standalone)").matches;
    const navigatorCheck = (window.navigator as any).standalone === true;
    if (matchMediaCheck || navigatorCheck) {
      setIsStandalone(true);
    }

    // Проверка на iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      toast("Как установить на iOS (iPhone/iPad)", {
        description: "Нажмите кнопку «Поделиться» (квадрат со стрелочкой) внизу браузера Safari, затем выберите «На экран Домой» (Add to Home Screen).",
        icon: <Info className="h-4 w-4 text-blue-500" />
      });
      return;
    }

    const promptEvent = deferredPrompt || (window as any).deferredPWAInstallPrompt;
    if (!promptEvent) {
      toast.info("Установка пока недоступна в этом браузере или приложение уже установлено.");
      return;
    }

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      (window as any).deferredPWAInstallPrompt = null;
    }
  };

  if (isStandalone) {
    return null; // Не показываем кнопку, если уже установлено
  }

  return (
    <Button 
      variant="outline" 
      className="w-full flex justify-start items-center gap-2 mt-4" 
      onClick={handleInstallClick}
    >
      <Download size={18} />
      {t("set_install_app" as any) || "Установить приложение"}
    </Button>
  );
}

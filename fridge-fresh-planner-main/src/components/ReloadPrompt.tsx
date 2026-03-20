import { useEffect } from "react";
// @ts-ignore
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log("SW Registered: ", r);
    },
    onRegisterError(error: any) {
      console.log("SW registration error", error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success("Приложение готово к работе офлайн!");
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast("Доступно новое обновление!", {
        action: {
          label: "Обновить",
          onClick: () => updateServiceWorker(true),
        },
        duration: 20000,
      });
      setNeedRefresh(false);
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
}

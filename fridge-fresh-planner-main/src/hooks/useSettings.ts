import { useState, useEffect } from "react";

export function useSettings() {
  const [currency, setCurrency] = useState(localStorage.getItem("app_currency") || "EUR");
  const [language, setLanguage] = useState(localStorage.getItem("app_language") || "ru");

  useEffect(() => {
    const handleSettingsChange = () => {
      setCurrency(localStorage.getItem("app_currency") || "EUR");
      setLanguage(localStorage.getItem("app_language") || "ru");
    };

    window.addEventListener("settingsChange", handleSettingsChange);
    return () => window.removeEventListener("settingsChange", handleSettingsChange);
  }, []);

  return { currency, language };
}

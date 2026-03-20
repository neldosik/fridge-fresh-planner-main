import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrencySymbol() {
  const c = typeof window !== "undefined" ? localStorage.getItem("app_currency") : "EUR";
  if (c === "USD") return "$";
  if (c === "RUB") return "₽";
  return "€";
}

export function getAppLanguageName() {
  const l = typeof window !== "undefined" ? localStorage.getItem("app_language") : "ru";
  if (l === "en") return "английском";
  if (l === "de") return "немецком";
  return "русском";
}

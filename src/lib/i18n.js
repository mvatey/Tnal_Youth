"use client";

import km from "@/locales/km";
import en from "@/locales/en";

export const DEFAULT_LOCALE = "km";
export const SUPPORTED_LOCALES = ["km", "en"];
export const LOCALE_STORAGE_KEY = "tnal-youth-locale";

export const dictionaries = {
  km,
  en,
};

export function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

export function translate(locale, key, fallback = key) {
  const dictionary = dictionaries[normalizeLocale(locale)] || dictionaries[DEFAULT_LOCALE];

  const value = String(key)
    .split(".")
    .reduce((current, part) => current?.[part], dictionary);

  return typeof value === "string" ? value : fallback;
}

export function localizedValue(value, locale = DEFAULT_LOCALE, fallback = "-") {
  if (value == null) return fallback;

  if (typeof value !== "object") {
    return value || fallback;
  }

  const isEnglish = normalizeLocale(locale) === "en";

  const englishValue =
    value.labelEn ??
    value.label_en ??
    value.nameEn ??
    value.name_en ??
    value.titleEn ??
    value.title_en ??
    value.fullNameEn ??
    value.full_name_en ??
    value.branchNameEn ??
    value.branch_name_en;

  const khmerValue =
    value.labelKm ??
    value.label_km ??
    value.nameKm ??
    value.name_km ??
    value.titleKm ??
    value.title_km ??
    value.fullNameKm ??
    value.full_name_km ??
    value.branchNameKm ??
    value.branch_name_km;

  return (
    (isEnglish ? englishValue || khmerValue : khmerValue || englishValue) ||
    value.label ||
    value.name ||
    value.title ||
    value.code ||
    fallback
  );
}

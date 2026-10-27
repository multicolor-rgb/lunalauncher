import { useMemo } from "react";
import { translate, type TKey } from "../i18n";
import { useAppStore } from "../store";

export type Translate = (key: TKey, vars?: Record<string, string | number>) => string;

export function useT(): Translate {
  const language = useAppStore((state) => state.settings.language);
  return useMemo(() => {
    return (key: TKey, vars?: Record<string, string | number>) => translate(language, key, vars);
  }, [language]);
}

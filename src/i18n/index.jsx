
import { createContext, useContext, useMemo, useState } from "react";
import { translations } from "./translations";

const I18nContext = createContext({
  lang: "ja",
  setLang: () => {},
  t: (k, vars) => k,
});

function format(str, vars) {
  if (!vars) return str;
  return Object.entries(vars).reduce(
    (s, [key, val]) => s.replace(new RegExp(`\\{${key}\\}`, "g"), String(val)),
    str
  );
}

export function I18nProvider({ children, defaultLang = "ja" }) {
  const [lang, setLang] = useState(defaultLang);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key, vars) => {
        const dict = translations[lang] || {};
        const raw = dict[key] ?? key;
        return format(raw, vars);
      },
    }),
    [lang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

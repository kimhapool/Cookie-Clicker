type NumberLanguage = "ko" | "en" | "ja" | "zh" | "ar" | "de" | "ru";

const locales: Record<NumberLanguage, string> = {
  ko: "ko-KR", en: "en-US", ja: "ja-JP", zh: "zh-CN", ar: "ar", de: "de-DE", ru: "ru-RU",
};

export function productionNumber(value: number, language: NumberLanguage = "ko") {
  return Math.abs(value) < 1000
    ? value.toLocaleString(locales[language], { maximumFractionDigits: 1 })
    : compactNumber(value, language);
}

export function compactNumber(value: number, language: NumberLanguage = "ko") {
  const absolute = Math.abs(value);
  if (absolute >= 1e21) return value.toLocaleString(locales[language], { notation: 'scientific', maximumFractionDigits: 2 });
  const eastAsian = language === "ko" || language === "ja" || language === "zh";
  const units: [number, string][] = eastAsian
    ? language === "ja"
      ? [[1e16, "京"], [1e12, "兆"], [1e8, "億"], [1e4, "万"]]
      : language === "zh"
        ? [[1e12, "万亿"], [1e8, "亿"], [1e4, "万"]]
        : [[1e16, "경"], [1e12, "조"], [1e8, "억"], [1e4, "만"]]
    : [[1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "K"]];
  const unit = units.find(([threshold]) => absolute >= threshold);
  if (!unit) return Math.floor(value).toLocaleString(locales[language]);
  const shown = value / unit[0];
  return `${shown.toLocaleString(locales[language], { maximumFractionDigits: Math.abs(shown) >= 100 ? 0 : 1 })}${unit[1]}`;
}

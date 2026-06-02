// Stage 4 step3 — trilingual field renderers (三语同屏).
// All three languages are shown together so missing / garbled / mis-aligned
// translations are visible in a single pass.

import styles from "./textbook.module.css";

const LANG_CLASS: Record<"jp" | "zh" | "en", string> = {
  jp: styles.langJp ?? "",
  zh: styles.langZh ?? "",
  en: styles.langEn ?? "",
};
const LANG_LABEL: Record<"jp" | "zh" | "en", string> = {
  jp: "JA",
  zh: "ZH",
  en: "EN",
};

function Row({ lang, text }: { lang: "jp" | "zh" | "en"; text: string }) {
  return (
    <div className={styles.triRow}>
      <span className={`${styles.lang} ${LANG_CLASS[lang]}`}>
        {LANG_LABEL[lang]}
      </span>
      <span className={styles.triText}>{text || "⟨empty⟩"}</span>
    </div>
  );
}

export function TrilingualText({
  jp,
  zh,
  en,
  label,
}: {
  jp: string;
  zh: string;
  en: string;
  label?: string;
}) {
  return (
    <div className={styles.tri}>
      {label ? <div className={styles.fieldLabel}>{label}</div> : null}
      <Row lang="jp" text={jp} />
      <Row lang="zh" text={zh} />
      <Row lang="en" text={en} />
    </div>
  );
}

export function TrilingualList({
  jp,
  zh,
  en,
  label,
}: {
  jp: string[];
  zh: string[];
  en: string[];
  label?: string;
}) {
  const cols: Array<{ lang: "jp" | "zh" | "en"; items: string[] }> = [
    { lang: "jp", items: jp },
    { lang: "zh", items: zh },
    { lang: "en", items: en },
  ];
  return (
    <div>
      {label ? <div className={styles.fieldLabel}>{label}</div> : null}
      <div className={styles.triList}>
        {cols.map((c) => (
          <div key={c.lang} className={styles.triListCol}>
            <span className={`${styles.lang} ${LANG_CLASS[c.lang]}`}>
              {LANG_LABEL[c.lang]}
            </span>
            <ol>
              {c.items.map((it, i) => (
                <li key={i}>{it || "⟨empty⟩"}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

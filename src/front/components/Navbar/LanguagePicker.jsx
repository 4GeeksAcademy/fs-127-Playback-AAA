import { FlagIcon } from "react-flag-kit";

const LANG_CONFIG = {
  es: { type: "flag", code: "ES" },
  en: { type: "flag", code: "GB" },
  ca: { type: "img", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Catalonia.svg/3840px-Flag_of_Catalonia.svg.png" },
  gl: { type: "img", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Galicia.svg/330px-Flag_of_Galicia.svg.png" },
};

const LangIcon = ({ lang, size = 24 }) => {
  const cfg = LANG_CONFIG[lang];
  if (!cfg) return null;
  if (cfg.type === "flag") return <FlagIcon code={cfg.code} size={size} />;
  return (
    <img
      src={cfg.url}
      alt={lang}
      style={{ width: size, height: size * 0.67 }}
      className="rounded-sm object-cover"
    />
  );
};

export const LanguagePicker = ({ langRef, langOpen, onToggle, onSelect, currentLang }) => (
  <div className="relative inline-block" ref={langRef}>
    <button
      onClick={onToggle}
      title="Idioma"
      className="w-10 h-10 flex items-center justify-center rounded-xl border border-main bg-[rgb(var(--color-bg-input))] hover:bg-muted text-base transition"
    >
      <LangIcon lang={currentLang} />
    </button>
    {langOpen && (
      <div className="absolute right-0 mt-2 w-14 bg-[rgb(var(--color-bg-input))] border border-main rounded-xl shadow-lg z-10">
        {Object.keys(LANG_CONFIG).map((lang) => (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className="flex items-center justify-center w-full px-3 py-2 hover:bg-muted rounded-xl"
          >
            <LangIcon lang={lang} />
          </button>
        ))}
      </div>
    )}
  </div>
);
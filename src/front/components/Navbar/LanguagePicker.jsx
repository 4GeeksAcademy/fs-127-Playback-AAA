import { FlagIcon } from "react-flag-kit";

export const LanguagePicker = ({
  langRef,
  langOpen,
  onToggle,
  onSelect,
  currentLang,
}) => (
  <div className="relative inline-block" ref={langRef}>
    <button
      onClick={onToggle}
      title="Idioma"
      className="w-10 h-10 flex items-center justify-center rounded-xl border border-theme-border bg-theme-input hover:bg-theme-muted text-base transition"
    >
      {currentLang === "es" ? (
        <FlagIcon code="ES" size={24} />
      ) : (
        <FlagIcon code="GB" size={24} />
      )}
    </button>

    {langOpen && (
      <div className="absolute right-0 mt-2 w-14 bg-theme-input border border-theme-border rounded-xl shadow-lg z-10">
        <button
          onClick={() => onSelect("es")}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-theme-muted rounded-xl"
        >
          <FlagIcon code="ES" size={24} />
        </button>
        <button
          onClick={() => onSelect("en")}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-theme-muted rounded-xl"
        >
          <FlagIcon code="GB" size={24} />
        </button>
      </div>
    )}
  </div>
);

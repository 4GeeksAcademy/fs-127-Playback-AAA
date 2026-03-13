import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";
import { LanguagePicker } from "./LanguagePicker";
import { AuthPanel } from "./AuthPanel";
import { ThemeToggle } from "./ThemeToggle";

// Botones visibles en la barra — van DENTRO del div h-[70px]
export const NavbarMobileActions = ({ mobileOpen, setMobileOpen, langRefMobile, langOpen, setLangOpen, handleSelectLanguage, currentLang, }) => (
  <div className="flex md:hidden items-center gap-2 flex-shrink-0">
    <button
      onClick={() => setMobileOpen(!mobileOpen)}
      className="w-10 h-10 flex items-center justify-center rounded-xl border border-theme-border bg-theme-input transition"
      aria-label="Menú"
    >
      <UserRound
        className={`transition-all duration-300 ${
          mobileOpen
            ? "text-violet-500 scale-90 drop-shadow-md"
            : "text-violet-400 dark:text-violet-500"
        }`}
      />
    </button>
    <LanguagePicker
      langRef={langRefMobile}
      langOpen={langOpen}
      onToggle={() => setLangOpen(!langOpen)}
      onSelect={handleSelectLanguage}
      currentLang={currentLang}
    />
  </div>
);

// Panel desplegable — va FUERA del div h-[70px], como hermano de la barra
export const NavbarMobilePanel = ({
  store, userEmail, userLinks, handleLogout,
  mobileOpen, setMobileOpen,
  authView, setAuthView,
  t,
}) => {
  if (!mobileOpen) return null;

  return (
    <div className="md:hidden border-t border-theme-border-sm bg-theme-bg px-4 pb-5 space-y-3">
      {store.isAuthenticated ? (
        <>
          {/* Cabecera con avatar y nombre */}
          <div className="flex items-center gap-3 px-1 pt-4">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {(store.user?.username || userEmail || "U")[0].toUpperCase()}
            </span>
            <span className="text-sm font-medium text-theme-secondary truncate">
              {store.user?.username || userEmail}
            </span>
          </div>

          {/* Links de navegación */}
          <div className="space-y-0.5">
            {userLinks.map(({ to, icon, label }) => (
              <Link
                key={to} to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-theme-muted hover:bg-theme-muted hover:text-theme-text transition"
              >
                <span className="text-base w-5 text-center">{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-theme-border-sm pt-3 space-y-1">
            {/* Toggle de tema */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-theme-muted hover:bg-theme-muted hover:text-theme-text transition">
              <div className="flex items-center gap-3">
                <span className="text-base w-5 text-center">🌓</span>
                {t("navbar.theme")}
              </div>
              <ThemeToggle />
            </div>

            {/* Cerrar sesión */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
            >
              <span className="text-base w-5 text-center">↩</span>
              {t("navbar.logout")}
            </button>
          </div>
        </>
      ) : (
        // Panel de autenticación
        <div className="pt-4">
          <AuthPanel
            view={authView}
            onChangeView={setAuthView}
            onSuccess={() => { setMobileOpen(false); setAuthView("login"); }}
            t={t}
          />
        </div>
      )}
    </div>
  );
};
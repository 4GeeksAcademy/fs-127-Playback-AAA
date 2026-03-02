import { useRef } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { LanguagePicker } from "./LanguagePicker";
import { AuthPanel } from "./AuthPanel";

export const NavbarDesktop = ({
  // Usuario
  store,
  userEmail,
  userLinks,
  handleLogout,
  // Menú usuario
  userMenuOpen,
  setUserMenuOpen,
  userRef,
  // Login / signup
  loginOpen,
  setLoginOpen,
  loginRef,
  authView,
  setAuthView,
  // Idioma y tema
  langRefDesktop,
  langOpen,
  setLangOpen,
  handleToggleDarkMode,
  handleSelectLanguage,
  // i18n
  currentLang,
  t,
}) => (
  <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
    {store.isAuthenticated ? (
      // ── Menú de usuario autenticado ──
      <div className="relative" ref={userRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 h-10 px-3 rounded-full border border-theme-border bg-theme-input hover:bg-theme-muted text-theme-secondary text-sm font-medium transition"
        >
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(store.user?.username || userEmail || "U")[0].toUpperCase()}
          </span>
          <span className="max-w-[110px] truncate">
            {store.user?.username || userEmail}
          </span>
          <svg
            className={`w-2.5 h-2.5 text-theme-faint transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
            viewBox="0 0 10 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M1 1l4 4 4-4" />
          </svg>
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-theme-bg border border-theme-border rounded-2xl shadow-xl py-1.5 z-50">
            {userLinks.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-xl text-sm text-theme-muted hover:bg-theme-muted hover:text-theme-text transition"
              >
                <span className="text-base w-5 text-center">{icon}</span>
                {label}
              </Link>
            ))}
            <div className="my-1.5 mx-3 border-t border-theme-border-sm" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition w-[calc(100%-12px)]"
            >
              <span className="text-base w-5 text-center">↩</span>
              {t("navbar.logout")}
            </button>
          </div>
        )}
      </div>
    ) : (
      // ── Botón de login + panel de autenticación ──
      <div className="relative" ref={loginRef}>
        <button
          onClick={() => setLoginOpen(!loginOpen)}
          className="h-10 px-5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold shadow-md shadow-violet-200 dark:shadow-violet-900/30 transition"
        >
          {t("navbar.loginButton")}
        </button>
        {loginOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-theme-bg border border-theme-border rounded-2xl shadow-2xl p-5 z-50">
            <AuthPanel
              view={authView}
              onChangeView={setAuthView}
              onSuccess={() => {
                setLoginOpen(false);
                setAuthView("login");
              }}
              t={t}
            />
          </div>
        )}
      </div>
    )}

    <ThemeToggle onToggle={handleToggleDarkMode} />
    <LanguagePicker
      langRef={langRefDesktop}
      langOpen={langOpen}
      onToggle={() => setLangOpen(!langOpen)}
      onSelect={handleSelectLanguage}
      currentLang={currentLang}
    />
  </div>
);

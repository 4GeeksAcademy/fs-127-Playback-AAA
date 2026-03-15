import { useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguagePicker } from "./LanguagePicker";
import { AuthPanel } from "./AuthPanel";

export const NavbarDesktop = ({ store, userEmail, userLinks, handleLogout, userMenuOpen, setUserMenuOpen, userRef, loginOpen, setLoginOpen, loginRef, authView, setAuthView, langRefDesktop, langOpen, setLangOpen, handleSelectLanguage, currentLang, t, }) => {

  // Links del dropdown — excluimos el carrito que va fuera
  const dropdownLinks = userLinks.filter(({ to }) => to !== "/cart");
  const cartTotal = store.cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
      {store.isAuthenticated ? (
        <>
          {/* ── Carrito fuera del dropdown — más accesible ── */}
          <Link
            to="/cart"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-main bg-[rgb(var(--color-bg-input))] hover:bg-muted text-sub transition"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartTotal > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none font-bold">
                {cartTotal}
              </span>
            )}
          </Link>

          {/* ── Menú de usuario autenticado ── */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 h-10 px-3 rounded-full border border-main bg-[rgb(var(--color-bg-input))] hover:bg-muted text-sub text-sm font-medium transition"
            >
              <img
                className="w-6 h-6 rounded-full flex-shrink-0"
                src={store.user?.image_url}
                alt={store.user?.name}
                onError={(e) => { e.target.onerror = null; e.target.src = `https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png`; }}
              />
              <span className="max-w-[110px] truncate">{store.user?.username || userEmail}</span>
              <svg
                className={`w-2.5 h-2.5 text-faint transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              >
                <path d="M1 1l4 4 4-4" />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-main border border-main rounded-2xl shadow-xl py-1.5 z-50">
                {dropdownLinks.map(({ to, icon, label }) => (
                  <Link
                    key={to} to={to}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-xl text-sm text-muted hover:bg-muted hover:text-main transition"
                  >
                    <span className="text-base w-5 text-center">{icon}</span>
                    {label}
                  </Link>
                ))}
                <div className="my-1.5 mx-3 border-t border-[rgb(var(--color-border-sm))]" />
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
        </>
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
            <div className="absolute right-0 mt-2 w-80 bg-main border border-main rounded-2xl shadow-2xl p-5 z-50">
              <AuthPanel
                view={authView} onChangeView={setAuthView}
                onSuccess={() => { setLoginOpen(false); setAuthView("login"); }}
                t={t}
              />
            </div>
          )}
        </div>
      )}

      {/* ThemeToggle autosuficiente — no necesita props */}
      <ThemeToggle />
      <LanguagePicker
        langRef={langRefDesktop} langOpen={langOpen}
        onToggle={() => setLangOpen(!langOpen)}
        onSelect={handleSelectLanguage} currentLang={currentLang}
      />
    </div>
  );
};
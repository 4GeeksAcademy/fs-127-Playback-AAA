import { Link } from "react-router-dom";
import { UserRound, ShoppingCart } from "lucide-react";
import { LanguagePicker } from "./LanguagePicker";
import { AuthPanel } from "./AuthPanel";
import { ThemeToggle } from "./ThemeToggle";

// Botones visibles en la barra — van DENTRO del div h-[70px]
export const NavbarMobileActions = ({ store, mobileOpen, setMobileOpen, langRefMobile, langOpen, setLangOpen, handleSelectLanguage, currentLang, }) => {
  const cartTotal = store.cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex md:hidden items-center gap-2 flex-shrink-0">

      {/* ThemeToggle fuera solo cuando NO está autenticado */}
      {!store?.isAuthenticated && <ThemeToggle />}

      {/* ── Carrito fuera del panel ── */}
      {store?.isAuthenticated && (
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
      )}

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-main bg-[rgb(var(--color-bg-input))] transition"
        aria-label="Menú"
      >
        {store?.isAuthenticated ? (
          // Avatar del usuario cuando está logueado
          <img
            src={store.user?.image_url}
            alt={store.user?.name}
            className="w-7 h-7 rounded-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png`; }}
          />
        ) : (
          <UserRound className={`transition-all duration-300 ${mobileOpen ? "text-violet-500 scale-90" : "text-violet-400 dark:text-violet-500"}`} />
        )}
      </button>

      <LanguagePicker
        langRef={langRefMobile} langOpen={langOpen}
        onToggle={() => setLangOpen(!langOpen)}
        onSelect={handleSelectLanguage} currentLang={currentLang}
      />
    </div>
  );
};

// Panel desplegable — va FUERA del div h-[70px], como hermano de la barra
export const NavbarMobilePanel = ({
  store, userEmail, userLinks, handleLogout,
  mobileOpen, setMobileOpen,
  authView, setAuthView,
  t,
}) => {
  if (!mobileOpen) return null;

  return (
    <div className="md:hidden border-t border-[rgb(var(--color-border-sm))] bg-main px-4 pb-5 space-y-3">
      {store.isAuthenticated ? (
        <>
          {/* Cabecera con avatar y nombre */}
          <div className="flex items-center gap-3 px-1 pt-4">
            <img
              src={store.user?.image_url}
              alt={store.user?.name}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-violet-500"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png`; }}
            />
            <span className="text-sm font-medium text-sub truncate">
              {store.user?.username || userEmail}
            </span>
          </div>

          {/* Links de navegación */}
          <div className="space-y-0.5">
            {userLinks.map(({ to, icon, label }) => (
              <Link
                key={to} to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:bg-muted hover:text-main transition"
              >
                <span className="text-base w-5 text-center">{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-[rgb(var(--color-border-sm))] pt-3 space-y-1">
            {/* Toggle de tema — dentro solo cuando está autenticado */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-muted hover:bg-muted hover:text-main transition">
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
            view={authView} onChangeView={setAuthView}
            onSuccess={() => { setMobileOpen(false); setAuthView("login"); }}
            t={t}
          />
        </div>
      )}
    </div>
  );
};
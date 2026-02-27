import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { SearchBar } from "./SearchBar";
import logo from "../../assets/img/logo_navbar_playback_v1.png";
import logo_dark from "../../assets/img/logo_navbar_playback_vdark.png";
import logo_mini from "../../assets/img/logo_navbar_playback_vmini.png";
import { useTranslation } from "react-i18next";
import { FlagIcon } from "react-flag-kit";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [authView, setAuthView] = useState("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const userRef = useRef();
  const loginRef = useRef();

  const userEmail = store.user?.email;

  const { t, i18n } = useTranslation();

  const userLinks = [
    { to: `/profile`, icon: "👤", label: t("navbar.profile") },
    { to: `/cart`, icon: "🛒", label: t("navbar.cart") },
    { to: `/favorites`, icon: "❤️", label: t("navbar.favorites") },
    { to: `/orders`, icon: "📦", label: t("navbar.orders") },
  ];

  const handleLogout = () => {
    dispatch({ type: "logout" });
    setMobileOpen(false);
    navigate("/");
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  const buttonTheme = (
    <button
      onClick={toggleDarkMode}
      title="Cambiar tema"
      className="w-10 h-10 flex items-center justify-center rounded-xl border border-theme-border bg-theme-input hover:bg-theme-muted text-base transition"
    >
      🌙
    </button>
  );

  const buttonLanguage = (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        title="Idioma"
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-theme-border bg-theme-input hover:bg-theme-muted text-base transition"
      >
        {i18n.language === "es" ? (
          <FlagIcon code="ES" size={24} />
        ) : (
          <FlagIcon code="GB" size={24} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-14 bg-theme-input border border-theme-border rounded-xl shadow-lg z-10">
          <button
            onClick={() => {
              i18n.changeLanguage("es");
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-theme-muted rounded-xl"
          >
            <FlagIcon code="ES" size={24} />
          </button>
          <button
            onClick={() => {
              i18n.changeLanguage("en");
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-theme-muted rounded-xl"
          >
            <FlagIcon code="GB" size={24} />
          </button>
        </div>
      )}
    </div>
  );

  const authPanel = (onSuccessCallback) => (
    <div className="space-y-3">
      {authView === "login" ? (
        <>
          <p className="text-sm font-semibold text-theme-text px-1">
            {t("navbar.loginTitle")}
          </p>
          <LoginForm
            onSuccess={() => {
              onSuccessCallback();
              setAuthView("login");
            }}
          />
          <div className="pt-3 border-t border-theme-border-sm text-center text-sm text-theme-muted">
            {t("navbar.dontHaveAccount")}{" "}
            <button
              onClick={() => setAuthView("signup")}
              className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
            >
              {t("navbar.signupButton")}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-theme-text px-1">
            {t("navbar.signupTitle")}
          </p>
          <SignupForm
            onSuccess={() => {
              onSuccessCallback();
              setAuthView("login");
            }}
          />
          <div className="pt-3 border-t border-theme-border-sm text-center text-sm text-theme-muted">
            {t("navbar.alreadyHaveAccount")}{" "}
            <button
              onClick={() => setAuthView("login")}
              className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
            >
              {t("navbar.loginButton")}
            </button>
          </div>
        </>
      )}
    </div>
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target))
        setUserMenuOpen(false);
      if (loginRef.current && !loginRef.current.contains(e.target))
        setLoginOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-theme-bg border-b border-theme-border shadow-sm">
      {/* ── BARRA PRINCIPAL ── */}
      <div className="h-[70px] flex items-center gap-3 px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img
            src={logo}
            alt="Playback"
            className="hidden md:block dark:hidden h-12 w-auto object-contain min-w-[180px]"
          />
          <img
            src={logo_dark}
            alt="Playback"
            className="hidden dark:md:block h-12 w-auto object-contain min-w-[180px]"
          />
          <img
            src={logo_mini}
            alt="Playback"
            className="block md:hidden h-10 w-10 object-contain rounded-xl"
          />
        </Link>

        {/* Search — desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <SearchBar
            placeholder={t("navbar.searchPlaceholder")}
            className="max-w-lg"
          />
        </div>

        {/* Search — móvil */}
        <div className="flex md:hidden flex-1">
          <SearchBar placeholder={t("navbar.searchPlaceholder")} />
        </div>

        {/* Acciones — desktop */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
          {store.isAuthenticated ? (
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
                    className="flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition"
                    style={{ width: "calc(100% - 12px)" }}
                  >
                    <span className="text-base w-5 text-center">↩</span>
                    {t("navbar.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={loginRef}>
              <button
                onClick={() => setLoginOpen(!loginOpen)}
                className="h-10 px-5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold shadow-md shadow-violet-200 dark:shadow-violet-900/30 transition"
              >
                {t("navbar.loginButton")}
              </button>
              {loginOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-theme-bg border border-theme-border rounded-2xl shadow-2xl p-5 z-50">
                  {authPanel(() => setLoginOpen(false))}
                </div>
              )}
            </div>
          )}

          {buttonTheme}
          {buttonLanguage}
        </div>

        {/* Acciones — móvil */}
        <div className="flex md:hidden items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl border border-theme-border bg-theme-input transition"
            aria-label="Menú"
          >
            <span className="relative w-5 h-3.5 flex flex-col justify-between">
              <span
                className={`block h-px bg-current transition-all duration-200 origin-center ${mobileOpen ? "rotate-45 translate-y-[6px]" : ""}`}
              />
              <span
                className={`block h-px bg-current transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-px bg-current transition-all duration-200 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[6px]" : ""}`}
              />
            </span>
          </button>
          {buttonLanguage}
        </div>
      </div>

      {/* ── PANEL MÓVIL ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-theme-border-sm bg-theme-bg px-4 pb-5 space-y-3">
          {store.isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-1 pt-4">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {(store.user?.username || userEmail || "U")[0].toUpperCase()}
                </span>
                <span className="text-sm font-medium text-theme-secondary truncate">
                  {store.user?.username || userEmail}
                </span>
              </div>
              <div className="space-y-0.5">
                {userLinks.map(({ to, icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-theme-muted hover:bg-theme-muted hover:text-theme-text transition"
                  >
                    <span className="text-base w-5 text-center">{icon}</span>
                    {label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-theme-border-sm pt-1">
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
            <div className="pt-4">{authPanel(() => setMobileOpen(false))} </div>
          )}
        </div>
      )}
    </nav>
  );
};

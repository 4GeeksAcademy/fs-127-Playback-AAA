import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { SearchBar } from "./SearchBar";
import { NavbarDesktop } from "./NavbarDesktop";
import { NavbarMobileActions, NavbarMobilePanel } from "./NavbarMobile";
import logo from "../../assets/img/logo_navbar_playback_v1.png";
import logo_dark from "../../assets/img/logo_navbar_playback_vdark.png";
import logo_mini from "../../assets/img/logo_navbar_playback_vmini.png";
import { useTranslation } from "react-i18next";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Estado de los menús desplegables
  const [authView, setAuthView]         = useState("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [langOpen, setLangOpen]         = useState(false);

  // Refs para detectar clics fuera de cada dropdown
  // langRef necesita ser doble porque LanguagePicker se monta dos veces (desktop + móvil)
  // y un ref solo puede apuntar a un nodo — usamos uno por vista
  const userRef        = useRef();
  const loginRef       = useRef();
  const langRefDesktop = useRef();
  const langRefMobile  = useRef();

  const userEmail = store.user?.email;

  // Rutas del menú de usuario autenticado
  const userLinks = [
    { to: `/profile`,   icon: "👤", label: t("navbar.profile") },
    { to: `/cart`,      icon: "🛒", label: t("navbar.cart") },
    { to: `/favorites`, icon: "❤️", label: t("navbar.favorites") },
    { to: `/orders`,    icon: "📦", label: t("navbar.orders") },
  ];

  // ── Handlers ──────────────────────────────

  const handleLogout = () => {
    dispatch({ type: "logout" });
    setMobileOpen(false);
    navigate("/");
  };

  const handleSelectLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLangOpen(false);
  };

  // Cierra cualquier dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current  && !userRef.current.contains(e.target))  setUserMenuOpen(false);
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginOpen(false);
      if (
        langRefDesktop.current && !langRefDesktop.current.contains(e.target) &&
        langRefMobile.current  && !langRefMobile.current.contains(e.target)
      ) setLangOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Props compartidas entre desktop y móvil
  const sharedProps = {
    store, userEmail, userLinks, handleLogout,
    langRefDesktop, langRefMobile, langOpen, setLangOpen,
    handleSelectLanguage,
    currentLang: i18n.language,
    authView, setAuthView,
    t,
  };

  // ── Render ────────────────────────────────

  return (
    <nav className="sticky top-0 z-50 bg-theme-bg border-b border-theme-border shadow-sm">

      {/* ── BARRA PRINCIPAL ── */}
      <div className="h-[70px] flex items-center gap-3 px-4 md:px-6">

        {/* Logo — versión completa en desktop, icono en móvil */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img src={logo}      alt="Playback" className="hidden md:block dark:hidden h-12 w-auto object-contain min-w-[180px]" />
          <img src={logo_dark} alt="Playback" className="hidden dark:md:block h-12 w-auto object-contain min-w-[180px]" />
          <img src={logo_mini} alt="Playback" className="block md:hidden h-10 w-10 object-contain rounded-xl" />
        </Link>

        {/* Buscador */}
        <div className="hidden md:flex flex-1 justify-center">
          <SearchBar placeholder={t("navbar.searchPlaceholder")} className="max-w-lg" />
        </div>
        <div className="flex md:hidden flex-1">
          <SearchBar placeholder={t("navbar.searchPlaceholder")} />
        </div>

        {/* Acciones desktop — usuario, login, tema, idioma */}
        <NavbarDesktop
          {...sharedProps}
          userMenuOpen={userMenuOpen} setUserMenuOpen={setUserMenuOpen} userRef={userRef}
          loginOpen={loginOpen}       setLoginOpen={setLoginOpen}       loginRef={loginRef}
        />

        {/* Acciones móvil — icono usuario + selector de idioma */}
        <NavbarMobileActions
          mobileOpen={mobileOpen}       setMobileOpen={setMobileOpen}
          langRefMobile={langRefMobile} langOpen={langOpen} setLangOpen={setLangOpen}
          handleSelectLanguage={handleSelectLanguage}
          currentLang={i18n.language}
        />
      </div>

      {/* Panel móvil — fuera del div h-[70px] para que se expanda hacia abajo */}
      <NavbarMobilePanel
        {...sharedProps}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
      />

    </nav>
  );
};
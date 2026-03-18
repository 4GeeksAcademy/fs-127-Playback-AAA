import { Link } from "react-router-dom";
import { Github, Heart, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";

const LOGO_MINI = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png";
const REPO_URL = "https://github.com/4GeeksAcademy/fs-127-Playback-AAA";
const DASHBOARD_URL = "https://github.com/users/alexsilvan92/projects/3";
const ACADEMY_URL = "https://4geeks.com/es";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-16 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Logo + copyright */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <img
            src={LOGO_MINI}
            alt="Playback"
            className="h-6 w-6 rounded-full object-cover"
          />
          <span>{t("footer.copyright")}</span>
          <Heart size={13} className="text-red-500 fill-red-500 inline" />
          <span>
            {t("footer.madeBy")}{" "}
            <a
              href={ACADEMY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors underline underline-offset-2"
            >
              4Geeks Academy
            </a>.
          </span>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-5 text-sm">
          <Link
            to="/about"
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {t("footer.about")}
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            <Github size={14} />
            {t("footer.repo")}
          </a>
          <a
            href={DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            <LayoutDashboard size={14} />
            {t("footer.dashboard")}
          </a>
        </nav>

      </div>
    </footer>
  );
};
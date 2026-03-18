import { useTranslation } from "react-i18next";
import { Github, Linkedin, Globe, Instagram, ExternalLink, Code2, BookOpen, Users, Gamepad2, ShoppingCart, CreditCard, Image, Mail, LayoutDashboard, GraduationCap, Star, Wrench, } from "lucide-react";

// ─── Assets ──────────────────────────────────────────────────────────────────
const LOGO_FULL_DARK  = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png";
const LOGO_FULL_LIGHT = "https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png";

// ─── Data estática (nombres propios, URLs — no se traducen) ───────────────────
const PROJECT_LINKS = [
  { key: "repo",      icon: Github,          href: "https://github.com/4GeeksAcademy/fs-127-Playback-AAA",  color: "bg-zinc-800 dark:bg-zinc-700 text-white" },
  { key: "dashboard", icon: LayoutDashboard, href: "https://github.com/users/alexsilvan92/projects/3",      color: "bg-violet-600 text-white" },
  { key: "academy",   icon: GraduationCap,   href: "https://4geeks.com/es",                                  color: "bg-blue-600 text-white" },
];

const PROFESSORS = [
  { name: "Miguel Toyas Pernichi",   roleKey: "teachingAssistant", linkedin: "https://linkedin.com/in/migueltoyaspernichi",              github: "https://github.com/mitoperni",            avatar: "https://github.com/mitoperni.png" },
  { name: "Álvaro Martín Fernández", roleKey: "instructor",        linkedin: "https://www.linkedin.com/in/alvaro-martin-fernandez-esp/", github: "https://github.com/AlvaroMartinFernandez", avatar: "https://github.com/AlvaroMartinFernandez.png" },
];

const STUDENTS = [
  { name: "Anghers Fernando Bello Linares", linkedin: "https://www.linkedin.com/in/angherxs-bello-3b9488376/", github: "https://github.com/angherxs",    instagram: "https://www.instagram.com/angherxsfbello/", avatar: "https://github.com/angherxs.png" },
  { name: "Alex Silván Silván",             linkedin: "https://www.linkedin.com/in/alex-silvan/",              github: "https://github.com/alexsilvan92",                                                               avatar: "https://github.com/alexsilvan92.png" },
  { name: "Arantxa Ordoyo Orozco",          linkedin: "https://www.linkedin.com/in/arantxa-ordoyo/",           github: "https://github.com/arianxa",    website: "https://www.arantxaordoyo.online/",           avatar: "https://github.com/arianxa.png" },
];

const FEATURE_ICONS = [Gamepad2, ShoppingCart, CreditCard, Image, Mail, Globe];

const TECH = [
  { label: "React 18",        color: "bg-cyan-500/10    text-cyan-600    dark:text-cyan-400    border border-cyan-500/20" },
  { label: "Flask",           color: "bg-zinc-500/10   text-zinc-600   dark:text-zinc-300   border border-zinc-500/20" },
  { label: "PostgreSQL",      color: "bg-blue-500/10   text-blue-600   dark:text-blue-400   border border-blue-500/20" },
  { label: "Tailwind CSS",    color: "bg-sky-500/10    text-sky-600    dark:text-sky-400    border border-sky-500/20" },
  { label: "Stripe Connect",  color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20" },
  { label: "Cloudinary",      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20" },
  { label: "SQLAlchemy",      color: "bg-red-500/10    text-red-600    dark:text-red-400    border border-red-500/20" },
  { label: "i18next",         color: "bg-green-500/10  text-green-600  dark:text-green-400  border border-green-500/20" },
  { label: "JWT Auth",        color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20" },
  { label: "Google OAuth 2.0",color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" },
  { label: "Brevo SMTP",      color: "bg-pink-500/10   text-pink-600   dark:text-pink-400   border border-pink-500/20" },
  { label: "Python 3.13",     color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function SocialLink({ href, icon: Icon, label }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
      <Icon size={14} />
    </a>
  );
}

function StudentCard({ person, roleLabel }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
      <img src={person.avatar} alt={person.name}
        className="w-16 h-16 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=6366f1&color=fff&size=64`; }} />
      <div>
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">{person.name}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{roleLabel}</p>
      </div>
      <div className="flex items-center gap-0.5">
        {person.github    && <SocialLink href={person.github}    icon={Github}    label="GitHub" />}
        {person.linkedin  && <SocialLink href={person.linkedin}  icon={Linkedin}  label="LinkedIn" />}
        {person.website   && <SocialLink href={person.website}   icon={Globe}     label="Portfolio" />}
        {person.instagram && <SocialLink href={person.instagram} icon={Instagram} label="Instagram" />}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export const About = () => {
  const { t } = useTranslation();

  const features = t("about.features.items", { returnObjects: true });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.12),transparent)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <img src={LOGO_FULL_DARK}  alt="Playback" className="hidden dark:block mx-auto h-12 sm:h-14 object-contain mb-6" />
          <img src={LOGO_FULL_LIGHT} alt="Playback" className="dark:hidden mx-auto h-12 sm:h-14 object-contain mb-6" />
          <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {t("about.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {PROJECT_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.key} href={link.href} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 ${link.color}`}>
                  <Icon size={15} />
                  {t(`about.hero.links.${link.key}`)}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Sobre el proyecto ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-2 mb-8">
          <BookOpen size={18} className="text-violet-500" />
          <h2 className="text-xl font-bold tracking-tight">{t("about.features.title")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <Icon size={16} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{f.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
          {/* Card en construcción */}
          <div className="flex gap-4 p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/20">
            <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Wrench size={16} className="text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                {t("about.features.wip.title")}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                  <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                  {t("about.features.wip.badge")}
                </span>
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5 leading-relaxed">
                {t("about.features.wip.desc")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4">
            {t("about.tech.title")}
          </p>
          <div className="flex flex-wrap gap-2">
            {TECH.map((t) => (
              <span key={t.label} className={`px-2.5 py-1 rounded-md text-xs font-medium ${t.color}`}>{t.label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Equipo ── */}
      <section className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Alumnos */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Users size={18} className="text-violet-500" />
              <h2 className="text-xl font-bold tracking-tight">{t("about.team.devTitle")}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STUDENTS.map((s) => (
                <StudentCard key={s.name} person={s} roleLabel={t("about.team.devRole")} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── 4Geeks Academy ── */}
      <section className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Cabecera: logo enlace + texto */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            <a
              href="https://4geeks.com/es"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 group relative"
              aria-label="Visitar 4Geeks Academy"
            >
              <img
                src="https://storage.googleapis.com/4geeks-academy-website/media/4geeks_academy_logo_black.webp"
                alt="4Geeks Academy"
                className="h-14 object-contain dark:invert transition-opacity group-hover:opacity-70"
              />
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={9} /> {t("about.academy.visit")}
              </span>
            </a>
            <div className="text-center sm:text-left">
              <p className="font-bold text-zinc-900 dark:text-zinc-100">{t("about.academy.title")}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-lg">
                {t("about.academy.desc")}
              </p>
            </div>
          </div>

          {/* Profesores — cards pequeñas */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
              {t("about.team.profCredit")}
            </p>
            <div className="flex flex-wrap gap-3">
              {PROFESSORS.map((p) => (
                <div key={p.name} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
                  <img src={p.avatar} alt={p.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=a1a1aa&color=fff&size=28`; }} />
                  <div>
                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-tight">{p.name}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{t(`about.team.${p.roleKey}`)}</p>
                  </div>
                  <div className="flex items-center gap-0.5 ml-0.5">
                    {p.github   && <SocialLink href={p.github}   icon={Github}   label="GitHub" />}
                    {p.linkedin && <SocialLink href={p.linkedin} icon={Linkedin} label="LinkedIn" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
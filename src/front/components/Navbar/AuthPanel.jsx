import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";


export const AuthPanel = ({ view, onChangeView, onSuccess, t }) => (
  <div className="space-y-3">
    {view === "login" ? (
      <>
        <p className="text-sm font-semibold text-main px-1">{t("navbar.loginTitle")}</p>
        <LoginForm onSuccess={onSuccess} />

        {/* Enlace a registro */}
        <div className="pt-3 border-t border-[rgb(var(--color-border-sm))] text-center text-sm text-muted">
          {t("navbar.dontHaveAccount")}{" "}
          <button onClick={() => onChangeView("signup")} className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">
            {t("navbar.signupButton")}
          </button>
        </div>

        {/* Enlace a recuperación de contraseña */}
        <div className="text-center text-sm text-muted">
          {t("navbar.forgotPassword")}{" "}
          <button onClick={() => onChangeView("forgot")} className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">
            {t("navbar.forgotPasswordButton")}
          </button>
        </div>
      </>
    ) : view === "signup" ? (
      <>
        <p className="text-sm font-semibold text-main px-1">{t("navbar.signupTitle")}</p>
        <SignupForm onSuccess={onSuccess} />

        {/* Enlace de vuelta al login */}
        <div className="pt-3 border-t border-[rgb(var(--color-border-sm))] text-center text-sm text-muted">
          {t("navbar.alreadyHaveAccount")}{" "}
          <button onClick={() => onChangeView("login")} className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">
            {t("navbar.loginButton")}
          </button>
        </div>
      </>
    ) : (
      // Vista de solicitud de recuperación de contraseña
      <>
        <p className="text-sm font-semibold text-main px-1">{t("navbar.forgotTitle")}</p>
        <ForgotPasswordForm onChangeView={onChangeView} />
      </>
    )}
  </div>
);
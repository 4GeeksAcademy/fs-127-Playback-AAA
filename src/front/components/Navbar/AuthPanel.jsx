import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

export const AuthPanel = ({ view, onChangeView, onSuccess, t }) => (
  <div className="space-y-3">
    {view === "login" ? (
      <>
        <p className="text-sm font-semibold text-theme-text px-1">
          {t("navbar.loginTitle")}
        </p>
        <LoginForm onSuccess={onSuccess} />
        <div className="pt-3 border-t border-theme-border-sm text-center text-sm text-theme-muted">
          {t("navbar.dontHaveAccount")}{" "}
          <button
            onClick={() => onChangeView("signup")}
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
        <SignupForm onSuccess={onSuccess} />
        <div className="pt-3 border-t border-theme-border-sm text-center text-sm text-theme-muted">
          {t("navbar.alreadyHaveAccount")}{" "}
          <button
            onClick={() => onChangeView("login")}
            className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
          >
            {t("navbar.loginButton")}
          </button>
        </div>
      </>
    )}
  </div>
);

// Pantalla de éxito tras el pago
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";

const CheckoutSuccess = () => {
    const { t } = useTranslation();
    return (
        <div className="max-w-lg mx-auto px-6 py-24 text-center space-y-4">
            <div className="flex justify-center">
                <CheckCircle size={64} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold text-main">{t("checkout.successTitle")}</h1>
            <p className="text-muted">
                {t("checkout.successMsg")}
            </p>
        </div>
    );
};

export default CheckoutSuccess;
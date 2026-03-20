import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { getSellerProfileService } from "../../../services/sellerService";
import SellerRegister from "./SellerRegister/SellerRegister";
import SellerStripeConnect from "./SellerRegister/SellerStripeConnect";
import SellerDashboard from "./SellerDashBoard/SellerDashboard";
import AdminDashboard from "./AdminDashboard/AdminDashboard";
import SellerPending from "./SellerPending";
import SellerRejected from "./SellerRejected";
import SellerSuccess from "./SellerSuccess";

const ProfileRole = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();

  const [submitted, setSubmitted] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const role = store.user?.role;

  useEffect(() => {
    if (role === "admin") {
      setLoadingProfile(false);
      return;
    }
    getSellerProfileService(store.token)
      .then((data) => setSellerProfile(data))
      .catch(() => setSellerProfile(false))
      .finally(() => setLoadingProfile(false));
  }, [role]);

  if (loadingProfile)
    return (
      <div className="flex items-center gap-2 text-muted text-sm">
        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        {t("home.loading")}
      </div>
    );

  if (role === "admin") return <AdminDashboard />;
  if (role === "seller" && sellerProfile?.status === "verified")
    return <SellerDashboard />;

  if (
    sellerProfile?.status === "pending" &&
    !sellerProfile?.stripe_onboarding_completed
  )
    return (
      <div className="space-y-6 max-w-3xl mx-auto px-4">
        <SellerStripeConnect onConnected={() => setStripeConnected(true)} />
      </div>
    );

  if (
    sellerProfile?.status === "pending" &&
    sellerProfile?.stripe_onboarding_completed
  )
    return <SellerPending />;

  if (submitted && !stripeConnected)
    return (
      <div className="space-y-6 max-w-3xl mx-auto px-4">
        <SellerStripeConnect onConnected={() => setStripeConnected(true)} />
      </div>
    );

  if (submitted && stripeConnected) return <SellerSuccess />;

  if (sellerProfile?.status === "rejected")
    return (
      <SellerRejected
        sellerProfile={sellerProfile}
        onResubmit={() =>
          setSellerProfile({
            ...sellerProfile,
            status: "pending",
            rejection_reason: null,
          })
        }
        onCancel={() => setSellerProfile(false)}
      />
    );

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4">
      <div className="bg-main border border-main rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-main mb-1"> ✨ {t("seller.registerTitle")} </h2>
        <p className="text-muted text-sm mb-8"> {t("seller.registerSubtitle")} </p>
        <SellerRegister onSuccess={() => setSubmitted(true)} />
      </div>
    </div>
  );
};

export default ProfileRole;
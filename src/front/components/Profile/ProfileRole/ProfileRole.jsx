// Router de vistas según el rol del usuario y el estado de su solicitud:
//   - admin                        → AdminDashboard
//   - seller verificado            → SellerDashboard
//   - solicitud pendiente          → SellerPending
//   - solicitud rechazada          → SellerRejected
//   - wizard enviado con éxito     → SellerSuccess
//   - buyer sin solicitud          → SellerRegister

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useGlobalReducer from '../../../hooks/useGlobalReducer';
import { getSellerProfileService } from '../../../services/sellerService';
import SellerRegister  from './SellerRegister/SellerRegister';
import SellerDashboard from './SellerDashBoard/SellerDashboard';
import AdminDashboard  from './AdminDashboard/AdminDashboard';
import SellerPending   from './SellerPending';
import SellerRejected  from './SellerRejected';
import SellerSuccess   from './SellerSuccess';

const ProfileRole = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();

  // true tras enviar el wizard con éxito — muestra SellerSuccess
  const [submitted, setSubmitted] = useState(false);
  // Datos del perfil seller (null = cargando, false = no existe)
  const [sellerProfile, setSellerProfile] = useState(null);
  // Controla el spinner mientras se consulta el perfil
  const [loadingProfile, setLoadingProfile] = useState(true);

  const role = store.user?.role;

  // Carga el perfil seller para todos los roles excepto admin
  useEffect(() => {
    if (role === 'admin') { setLoadingProfile(false); return; }
    getSellerProfileService(store.token)
      .then(data => setSellerProfile(data))
      .catch(() => setSellerProfile(false))
      .finally(() => setLoadingProfile(false));
  }, [role]);

  // ── Spinner mientras se carga el perfil ───────────────────────────────────
  if (loadingProfile) return (
    <div className="flex items-center gap-2 text-theme-muted text-sm">
      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      {t('home.loading')}
    </div>
  );

  if (role === 'admin')                                        return <AdminDashboard />;
  if (role === 'seller' && sellerProfile?.status === 'verified') return <SellerDashboard />;
  if (sellerProfile?.status === 'pending')                     return <SellerPending />;
  if (submitted)                                               return <SellerSuccess />;

  if (sellerProfile?.status === 'rejected') return (
    <SellerRejected
      sellerProfile={sellerProfile}
      onResubmit={() => setSellerProfile({ ...sellerProfile, status: 'pending', rejection_reason: null })}
      onCancel={() => setSellerProfile(false)}
    />
  );

  // ── Buyer sin solicitud: formulario de registro ───────────────────────────
  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4">
      <div className="bg-theme-bg border border-theme-border rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-theme-text mb-1">✨ {t('seller.registerTitle')}</h2>
        <p className="text-theme-muted text-sm mb-8">{t('seller.registerSubtitle')}</p>
        <SellerRegister onSuccess={() => setSubmitted(true)} />
      </div>
    </div>
  );
};

export default ProfileRole;
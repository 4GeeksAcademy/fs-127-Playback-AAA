import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Configuración de estilos y etiquetas por estado del vendedor
const STATUS_CONFIG = {
  pending: {
    bg: 'bg-amber-100 dark:bg-amber-950',
    text: 'text-amber-600 dark:text-amber-400',
  },
  verified: {
    bg: 'bg-green-100 dark:bg-green-950',
    text: 'text-green-600 dark:text-green-400',
  },
  rejected: {
    bg: 'bg-red-100 dark:bg-red-950',
    text: 'text-red-500 dark:text-red-400',
  },
};

// Fila de dato individual dentro del desplegable
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold text-muted uppercase tracking-wide">
      {label}
    </span>
    <span className="text-sm text-main">{value || '—'}</span>
  </div>
);

const SellerRow = ({ seller, updating, onApprove, onReject }) => {
  // Controla si el desplegable está abierto
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  const cfg = STATUS_CONFIG[seller.status] || STATUS_CONFIG.pending;
  const isUpdating = updating === seller.id;

  return (
    <div>
      {/* Fila principal — clicar abre el desplegable */}
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-subtle transition"
      >
        {/* Avatar con la inicial del nombre de tienda */}
        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
          <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">
            {seller.store_name?.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Nombre de tienda y datos básicos del usuario */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-main truncate">
            {seller.store_name}
          </p>
          <p className="text-xs text-muted">
            {seller.user?.name} {seller.user?.last_name} · {seller.origin_city}
          </p>
        </div>

        {/* Badge de estado actual */}
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${cfg.bg} ${cfg.text}`}
        >
          {t(`admin.status.${seller.status}`)}
        </span>

        {/* Botones de acción — stopPropagation para no abrir el desplegable */}
        <div
          className="flex gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {seller.status !== 'verified' && (
            <button
              onClick={onApprove}
              disabled={isUpdating}
              className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {isUpdating ? '...' : t("admin.verify")}
            </button>
          )}
          {seller.status !== 'rejected' && (
            <button
              onClick={onReject}
              disabled={isUpdating}
              className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {isUpdating ? '...' : t("admin.reject")}
            </button>
          )}
        </div>
      </div>

      {/* Desplegable con información completa de la solicitud */}
      {expanded && (
        <div className="px-6 pb-6 bg-subtle border-t border-main">
          <div className="pt-4 grid grid-cols-2 gap-6">
            {/* Datos del usuario */}
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">
                👤 {t("admin.detail.userData")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label={t("admin.detail.name")}    value={`${seller.user?.name} ${seller.user?.last_name}`} />
                <DetailRow label={t("admin.detail.email")}   value={seller.user?.email} />
                <DetailRow label={t("admin.detail.role")}    value={seller.user?.role} />
                <DetailRow label={t("admin.detail.account")} value={seller.user?.is_active ? t("admin.detail.active") : t("admin.detail.inactive")} />
              </div>
            </div>

            {/* Datos de la tienda */}
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">
                🏪 {t("admin.detail.storeData")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label={t("admin.detail.store")}       value={seller.store_name} />
                <DetailRow label={t("admin.detail.nifCif")}      value={seller.nif_cif} />
                <DetailRow label={t("admin.detail.phone")}       value={seller.phone} />
                <DetailRow label={t("admin.detail.description")} value={seller.description} />
              </div>
            </div>

            {/* Dirección de envío */}
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">
                📦 {t("admin.detail.shippingAddress")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label={t("admin.detail.address")} value={seller.origin_address} />
                <DetailRow label={t("admin.detail.city")}    value={seller.origin_city} />
                <DetailRow label={t("admin.detail.zip")}     value={seller.origin_zip} />
                <DetailRow label={t("admin.detail.country")} value={seller.origin_country} />
              </div>
            </div>

            {/* Stripe */}
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">
                💳 Stripe
              </p>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label={t("admin.detail.accountId")}      value={seller.stripe_account_id} />
                <DetailRow label={t("admin.detail.accountCreated")} value={seller.stripe_account_id ? '✅ ' + t("admin.detail.yes") : '❌ ' + t("admin.detail.no")} />
                <DetailRow label={t("admin.detail.onboarding")}     value={seller.stripe_onboarding_completed ? '✅ ' + t("admin.detail.completed") : '⏳ ' + t("admin.detail.pending")} />
              </div>
            </div>

            {/* Incidencias — pendiente de desarrollo */}
            <div className="col-span-2">
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">
                🚨 {t("admin.detail.incidents")}
              </p>
              <div className="grid grid-cols-3 gap-3">
                <DetailRow label={t("admin.detail.inProducts")} value="— (próximamente)" />
                <DetailRow label={t("admin.detail.inOrders")}   value="— (próximamente)" />
                <DetailRow label={t("admin.detail.request")}    value={seller.created_at?.split('T')[0]} />
              </div>
            </div>

            {/* Motivo de rechazo — solo visible si está rechazado y tiene motivo */}
            {seller.status === 'rejected' && seller.rejection_reason && (
              <div className="col-span-2">
                <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">
                  📋 {t("seller.rejectionReason")}
                </p>
                <div className="rounded-xl bg-[rgb(var(--color-error-bg))] border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-[rgb(var(--color-error))]">
                  {seller.rejection_reason}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerRow;
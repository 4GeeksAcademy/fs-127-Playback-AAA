import { useState } from 'react';

// Configuración de estilos y etiquetas por estado del vendedor
const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    bg: 'bg-amber-100 dark:bg-amber-950',
    text: 'text-amber-600 dark:text-amber-400',
  },
  verified: {
    label: 'Verificado',
    bg: 'bg-green-100 dark:bg-green-950',
    text: 'text-green-600 dark:text-green-400',
  },
  rejected: {
    label: 'Rechazado',
    bg: 'bg-red-100 dark:bg-red-950',
    text: 'text-red-500 dark:text-red-400',
  },
};

// Fila de dato individual dentro del desplegable
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold text-theme-muted uppercase tracking-wide">
      {label}
    </span>
    <span className="text-sm text-theme-text">{value || '—'}</span>
  </div>
);

const SellerRow = ({ seller, updating, onApprove, onReject }) => {
  // Controla si el desplegable está abierto
  const [expanded, setExpanded] = useState(false);

  const cfg = STATUS_CONFIG[seller.status] || STATUS_CONFIG.pending;
  const isUpdating = updating === seller.id;

  return (
    <div>
      {/* Fila principal — clicar abre el desplegable */}
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-theme-subtle transition"
      >
        {/* Avatar con la inicial del nombre de tienda */}
        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
          <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">
            {seller.store_name?.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Nombre de tienda y datos básicos del usuario */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-theme-text truncate">
            {seller.store_name}
          </p>
          <p className="text-xs text-theme-muted">
            {seller.user?.name} {seller.user?.last_name} · {seller.origin_city}
          </p>
        </div>

        {/* Badge de estado actual */}
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${cfg.bg} ${cfg.text}`}
        >
          {cfg.label}
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
              {isUpdating ? '...' : 'Verificar'}
            </button>
          )}
          {seller.status !== 'rejected' && (
            <button
              onClick={onReject}
              disabled={isUpdating}
              className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {isUpdating ? '...' : 'Rechazar'}
            </button>
          )}
        </div>
      </div>

      {/* Desplegable con información completa de la solicitud */}
      {expanded && (
        <div className="px-6 pb-6 bg-theme-subtle border-t border-theme-border">
          <div className="pt-4 grid grid-cols-2 gap-6">
            {/* Datos del usuario */}
            <div>
              <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-3">
                👤 Datos del usuario
              </p>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow
                  label="Nombre"
                  value={`${seller.user?.name} ${seller.user?.last_name}`}
                />
                <DetailRow label="Email" value={seller.user?.email} />
                <DetailRow label="Rol" value={seller.user?.role} />
                <DetailRow
                  label="Cuenta"
                  value={seller.user?.is_active ? 'Activa' : 'Inactiva'}
                />
              </div>
            </div>

            {/* Datos de la tienda */}
            <div>
              <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-3">
                🏪 Datos de la tienda
              </p>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Tienda" value={seller.store_name} />
                <DetailRow label="NIF / CIF" value={seller.nif_cif} />
                <DetailRow label="Teléfono" value={seller.phone} />
                <DetailRow label="Descripción" value={seller.description} />
              </div>
            </div>

            {/* Dirección de envío */}
            <div>
              <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-3">
                📦 Dirección de envío
              </p>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Dirección" value={seller.origin_address} />
                <DetailRow label="Ciudad" value={seller.origin_city} />
                <DetailRow label="CP" value={seller.origin_zip} />
                <DetailRow label="País" value={seller.origin_country} />
              </div>
            </div>

            {/* Stripe */}
            <div>
              <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-3">
                💳 Stripe
              </p>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow
                  label="Account ID"
                  value={seller.stripe_account_id}
                />
                <DetailRow
                  label="Cuenta creada"
                  value={seller.stripe_account_id ? '✅ Sí' : '❌ No'}
                />
                <DetailRow
                  label="Onboarding"
                  value={seller.stripe_onboarding_completed ? '✅ Completado' : '⏳ Pendiente'}
                />
              </div>
            </div>

            {/* Incidencias — pendiente de desarrollo */}
            <div className="col-span-2">
              <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-3">
                🚨 Incidencias
              </p>
              <div className="grid grid-cols-3 gap-3">
                <DetailRow label="En productos" value="— (próximamente)" />
                <DetailRow label="En pedidos" value="— (próximamente)" />
                <DetailRow
                  label="Solicitud"
                  value={seller.created_at?.split('T')[0]}
                />
              </div>
            </div>

            {/* Motivo de rechazo — solo visible si está rechazado y tiene motivo */}
            {seller.status === 'rejected' && seller.rejection_reason && (
              <div className="col-span-2">
                <p className="text-xs font-bold text-theme-muted uppercase tracking-widest mb-2">
                  📋 Motivo del rechazo
                </p>
                <div className="rounded-xl bg-theme-error-bg border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-theme-error">
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

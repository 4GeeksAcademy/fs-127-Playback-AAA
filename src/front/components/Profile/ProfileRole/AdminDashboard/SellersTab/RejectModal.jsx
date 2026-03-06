import { useState } from 'react';

const RejectModal = ({ seller, onConfirm, onCancel }) => {
  // Motivo de rechazo introducido por el admin
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-theme-bg border border-theme-border rounded-2xl p-6 shadow-xl w-full max-w-md mx-4">

        {/* Cabecera del modal */}
        <h3 className="text-base font-semibold text-theme-text mb-1">Rechazar solicitud</h3>
        <p className="text-sm text-theme-muted mb-4">
          Indica el motivo del rechazo de{' '}
          <span className="font-medium text-theme-text">{seller.store_name}</span>.
          El vendedor podrá leerlo y corregir su solicitud.
        </p>

        {/* Textarea del motivo */}
        <textarea
          rows={4}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Ej: El NIF introducido no es válido. Por favor revísalo y vuelve a enviar la solicitud."
          className="w-full border border-theme-border rounded-xl p-3 text-sm bg-theme-input
                     text-theme-text placeholder-theme-faint resize-none
                     focus:ring-2 focus:ring-red-400 focus:outline-none transition mb-4"
        />

        {/* Botones de acción */}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-theme-border text-sm text-theme-secondary hover:bg-theme-muted transition">
            Cancelar
          </button>
          <button onClick={() => onConfirm(reason)}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">
            Confirmar rechazo
          </button>
        </div>

      </div>
    </div>
  );
};

export default RejectModal;
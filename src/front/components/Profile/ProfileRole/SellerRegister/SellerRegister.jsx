import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGlobalReducer from '../../../../hooks/useGlobalReducer';
import {
  createSellerProfileService,
  updateSellerProfileService,
} from '../../../../services/sellerService';
import StepStoreInfo from './StepStoreInfo';
import StepShipping from './StepShipping';
import StepReview from './StepReview';

// Valores iniciales para una solicitud nueva
const INITIAL_FORM = {
  store_name: '',
  nif_cif: '',
  description: '',
  phone: '',
  origin_address: '',
  origin_city: '',
  origin_zip: '',
  origin_country: 'España',
  iban: '',
  account_holder: '',
};

// Precarga los datos del perfil existente en modo edición
// El IBAN no se precarga por seguridad — el usuario debe reintroducirlo
const formFromProfile = (data) => ({
  store_name: data.store_name || '',
  nif_cif: data.nif_cif || '',
  description: data.description || '',
  phone: data.phone || '',
  origin_address: data.origin_address || '',
  origin_city: data.origin_city || '',
  origin_zip: data.origin_zip || '',
  origin_country: data.origin_country || 'España',
  iban: '',
  account_holder: '',
});

const steps = ['Tienda', 'Envío y pagos', 'Revisión'];

const SellerRegister = ({ onSuccess, initialData = null, isEdit = false }) => {
  const { t } = useTranslation();
  const { store } = useGlobalReducer();

  // Paso actual del wizard (0, 1 o 2)
  const [step, setStep] = useState(0);
  // Valores del formulario — precargados si hay datos iniciales
  const [form, setForm] = useState(
    initialData ? formFromProfile(initialData) : INITIAL_FORM,
  );
  // Errores de validación por campo
  const [errors, setErrors] = useState({});
  // Error global de la petición al backend
  const [globalError, setGlobalError] = useState(null);
  // Estado de carga mientras se envía
  const [loading, setLoading] = useState(false);

  // Actualiza un campo del formulario y limpia su error
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: null }));
    setGlobalError(null);
  };

  // Valida los campos obligatorios del paso actual
  const validate = () => {
    const newErrors = {};
    if (step === 0) {
      if (!form.store_name) newErrors.store_name = t('seller.errorRequired');
      if (!form.nif_cif) newErrors.nif_cif = t('seller.errorRequired');
    }
    if (step === 1) {
      if (!form.origin_address)
        newErrors.origin_address = t('seller.errorRequired');
      if (!form.origin_city) newErrors.origin_city = t('seller.errorRequired');
      if (!form.origin_zip) newErrors.origin_zip = t('seller.errorRequired');
      if (!form.origin_country)
        newErrors.origin_country = t('seller.errorRequired');
      if (!form.iban) newErrors.iban = t('seller.errorRequired');
      if (!form.account_holder)
        newErrors.account_holder = t('seller.errorRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Avanza al siguiente paso si la validación pasa
  const handleNext = () => {
    if (validate()) setStep((s) => s + 1);
  };
  // Retrocede al paso anterior limpiando errores
  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  // Envía el formulario — POST para nueva solicitud, PUT para corrección
  const handleSubmit = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      if (isEdit) {
        await updateSellerProfileService(store.token, form);
      } else {
        await createSellerProfileService(store.token, form);
      }
      onSuccess();
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* STEPPER */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((label, i) => (
          <div key={i} className="flex-1 flex items-center">
            {/* círculo */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`
                  w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                  ${
                    i <= step
                      ? 'bg-purple-600 text-white'
                      : 'bg-theme-muted text-theme-secondary'
                  }
                `}
              >
                {i + 1}
              </div>

              <span className="text-xs mt-1 text-theme-secondary">{label}</span>
            </div>

            {/* línea */}
            {i < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-[2px] mx-2
                  ${i < step ? 'bg-purple-600' : 'bg-theme-border'}
                `}
              />
            )}
          </div>
        ))}
      </div>
      {/* Contenido del paso activo */}
      {step === 0 && (
        <StepStoreInfo form={form} errors={errors} onChange={handleChange} />
      )}
      {step === 1 && (
        <StepShipping form={form} errors={errors} onChange={handleChange} />
      )}
      {step === 2 && <StepReview form={form} isEdit={isEdit} />}

      {/* Error global de la petición */}
      {globalError && (
        <div className="mt-4 rounded-xl bg-theme-error-bg px-4 py-2.5 text-sm text-theme-error">
          {globalError}
        </div>
      )}

      {/* Navegación entre pasos */}
      <div className="flex justify-between mt-6 pt-4 border-t border-theme-border-sm">
        {/* Botón atrás — solo visible desde el paso 1 en adelante */}
        {step > 0 ? (
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-lg border border-theme-border text-sm text-theme-secondary hover:bg-theme-muted transition"
          >
            ← {t('seller.back')}
          </button>
        ) : (
          <div />
        )}
        {/* Botón siguiente o enviar según el paso */}
        {step < 2 ? (
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition"
          >
            {t('seller.next')} →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? t('seller.submitting')
              : `✓ ${isEdit ? t('seller.resubmit') : t('seller.submit')}`}
          </button>
        )}
      </div>
    </div>
  );
};

export default SellerRegister;

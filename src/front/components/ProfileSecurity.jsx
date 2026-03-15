import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ProfileSecurity = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/password`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(form),
      },
    );

    alert(t('profile.security.updated'));
  };

  return (
    <div className="bg-main p-6 rounded-xl shadow border border-main max-w-xl">
      <h2 className="text-lg font-semibold mb-6 text-main">
        {t('profile.security.title')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          name="current_password"
          placeholder={t('profile.security.currentPassword')}
          onChange={handleChange}
          className="input"
        />
        <input
          type="password"
          name="new_password"
          placeholder={t('navbar.newPasswordPlaceholder')}
          onChange={handleChange}
          className="input"
        />
        <input
          type="password"
          name="confirm_password"
          placeholder={t('navbar.confirmPasswordPlaceholder')}
          onChange={handleChange}
          className="input"
        />

        <button className="btn-primary w-full">
          {t('profile.security.update')}
        </button>
      </form>
    </div>
  );
};

export default ProfileSecurity;

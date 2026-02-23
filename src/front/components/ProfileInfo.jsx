import { useEffect, useState } from "react";

const ProfileInfo = () => {
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    name: "",
    last_name: "",
    email: "",
    image_url: ""
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        name: user.name,
        last_name: user.last_name,
        email: user.email
      })
    });

    alert("Perfil actualizado");
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/profile/image`,
      {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
        body: formData
      }
    );

    const data = await response.json();

    if (response.ok) {
      setUser(prev => ({
        ...prev,
        image_url: data.image_url
      }));
    }
  };

  return (
    <div className="space-y-10 max-w-3xl mx-auto">

      {/* ===================== INFO ACTUAL ===================== */}
      <div className="bg-white p-8 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-6">Información Actual</h2>

        <div className="flex items-center space-x-6">
          <img
            src={
              preview ||
              user.image_url ||
              "https://via.placeholder.com/150"
            }
            alt="Perfil"
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
          />

          <div>
            <p className="text-xl font-medium">
              {user.name} {user.last_name}
            </p>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* ===================== EDITAR INFO ===================== */}
      <div className="bg-white p-8 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-6">Editar Información</h2>

        <div className="flex flex-col items-center mb-6">
          <label className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition text-sm">
            Cambiar Imagen
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={user.name}
            onChange={handleChange}
            placeholder="Nombre"
            className="w-full border rounded-lg p-3"
          />

          <input
            name="last_name"
            value={user.last_name}
            onChange={handleChange}
            placeholder="Apellido"
            className="w-full border rounded-lg p-3"
          />

          <input
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border rounded-lg p-3"
          />

          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition w-full">
            Guardar Cambios
          </button>
        </form>
      </div>

    </div>
  );
};

export default ProfileInfo;
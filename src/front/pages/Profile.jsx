import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    last_name: "",
    email: ""
  });

  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(process.env.BACKEND_URL + "/api/profile", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(process.env.BACKEND_URL + "/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(user)
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.msg);
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="bg-white min-h-screen text-black font-serif">
      <div className="max-w-4xl mx-auto border-l border-r border-black min-h-screen px-12 py-16">

        <h1 className="text-3xl tracking-widest uppercase mb-16">
          Mi Perfil
        </h1>

        <form onSubmit={handleSubmit} className="space-y-12">

          <div>
            <label className="text-xs uppercase">Nombre</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full border-b border-black py-3 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs uppercase">Apellido</label>
            <input
              type="text"
              name="last_name"
              value={user.last_name}
              onChange={handleChange}
              className="w-full border-b border-black py-3 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs uppercase">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full border-b border-black py-3 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="border border-black px-10 py-3 uppercase hover:bg-black hover:text-white transition"
          >
            Guardar Cambios
          </button>

          {message && (
            <div className="mt-8 text-sm uppercase tracking-wide">
              {message}
            </div>
          )}
        </form>

      </div>
    </div>
  );
};

export default Profile;
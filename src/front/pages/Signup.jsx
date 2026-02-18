import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { signupService } from "../services/authService";

export const Signup = () => {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", last_name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const [data, error] = await signupService(form);

        if (error) {
            alert(error);
            setLoading(false);
            return;
        }

        dispatch({ type: "login", payload: { token: data.token, user: data.user } });
        setLoading(false);
        navigate("/");
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h3 className="card-title text-center mb-4">Crear Cuenta</h3>

                            <form onSubmit={handleSubmit}>
                                <div className="row mb-3">
                                    <div className="col">
                                        <label htmlFor="name" className="form-label">Nombre</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            id="name"
                                            name="name"
                                            placeholder="Tu nombre"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col">
                                        <label htmlFor="last_name" className="form-label">Apellido</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            id="last_name"
                                            name="last_name"
                                            placeholder="Tu apellido"
                                            value={form.last_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control form-control-lg"
                                        id="email"
                                        name="email"
                                        placeholder="tu@email.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        id="password"
                                        name="password"
                                        placeholder="Tu contraseña"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-success btn-lg w-100" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Cargando...
                                        </>
                                    ) : "Registrarse"}
                                </button>
                            </form>
                        </div>
                        <div className="card-footer text-center py-3 bg-light">
                            <span className="text-muted">¿Ya tienes cuenta? </span>
                            <Link to="/login">Inicia sesión</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
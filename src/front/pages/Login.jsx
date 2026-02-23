import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { loginService } from "../services/authService";

export const Login = () => {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const [data, error] = await loginService(form);

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
                            <h3 className="card-title text-center mb-4">Iniciar Sesion</h3>

                            <form onSubmit={handleSubmit}>
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
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        id="password"
                                        name="password"
                                        placeholder="Tu password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Cargando...
                                        </>
                                    ) : "Iniciar Sesion"}
                                </button>
                            </form>
                        </div>
                        <div className="card-footer text-center py-3 bg-light">
                            <span className="text-muted">No tienes cuenta? </span>
                            <Link to="/signup">Registrate</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
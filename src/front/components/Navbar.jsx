import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();

	const handleLogout = () => {
		dispatch({ type: "logout" });
		navigate("/");
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
			<div className="container">
				<Link className="navbar-brand fw-bold" to="/">
					React Boilerplate
				</Link>
				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarContent"
				>
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarContent">
					<ul className="navbar-nav me-auto mb-2 mb-lg-0">
						<li className="nav-item">
							<Link className="nav-link" to="/">Inicio</Link>
						</li>
						<li className="nav-item">
							<Link className="nav-link" to="/demo">Demo</Link>
						</li>
					</ul>
					<div className="d-flex align-items-center gap-2">
						{store.isAuthenticated ? (
							<>
								<span className="badge bg-secondary fs-6 fw-normal py-2 px-3">
									{store.user?.username || store.user?.email}
								</span>
								<button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
									Logout
								</button>
							</>
						) : (
							<>
								<Link to="/login" className="btn btn-outline-primary btn-sm">
									Login
								</Link>
								<Link to="/signup" className="btn btn-success btn-sm">
									Signup
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};
import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
	return (
		<nav className="navbar navbar-light bg-light mb-4">
			<Link to="/">
				<span className="navbar-brand mb-0 col-4 h1">Home</span>
			</Link>
			<Link to="/structure">
				<span className="navbar-brand mb-0 col-4 h1">Configuración Estructura</span>
			</Link>
			<Link to="/forces">
				<span className="navbar-brand mb-0 col-4 h1">Casos de Carga</span>
			</Link>
			<Link to="/profiles">
				<span className="navbar-brand mb-0 col-4 h1">Perfiles Estructurales</span>
			</Link>
			<Link to="/calculus">
				<span className="navbar-brand mb-0 col-4 h1">Cálculos</span>
			</Link>
			<Link to="/autor">
				<span className="navbar-brand mb-0 col-4 h1">Acerca del Autor</span>
			</Link>
			<div className="ml-auto">
				{/* <Link to="/">
					<button className="btn btn-primary">Futuro Botón Login</button>
				</Link> */}
			</div>
		</nav>
	);
};

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
			<Link to="/autor">
				<span className="navbar-brand mb-0 col-4 h1">Acerca del Autor</span>
			</Link>
			<div className="ml-auto">
				<Link to="/demo">
					<button className="btn btn-primary">Check the Context in action</button>
				</Link>
			</div>
		</nav>
	);
};

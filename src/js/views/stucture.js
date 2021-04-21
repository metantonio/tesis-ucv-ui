import React from "react";
import { Link } from "react-router-dom";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";

export const Structure = () => (
	<div className="text-center mt-6 title">
		<h1 className="title">
			Optimización de las Edificaciones de Acero con arriostramientos laterales en un sentido, condicionada a las
			deriva de piso mediante la aplicación de Algoritmos Genéticos
		</h1>
		<p>
			<h2 className="sub-title">Paso 1: Configuración de la Estructura</h2>
		</p>
		<button className="btnHome">
			<Link to="/demo">Calcular</Link>
		</button>
	</div>
);

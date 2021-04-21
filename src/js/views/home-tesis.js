import React from "react";
import { Link } from "react-router-dom";
import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/home-tesis.scss";

export const HomeTesis = () => (
	<div className="text-center mt-6 title">
		<h1 className="title">
			Optimización de las Edificaciones de Acero con arriostramientos laterales en un sentido, condicionada a las
			deriva de piso mediante la aplicación de Algoritmos Genéticos
		</h1>
		<p>
			<img src={dnaImage} />
		</p>
		<button className="btnHome">
			<Link to="/demo">Iniciar</Link>
		</button>
	</div>
);

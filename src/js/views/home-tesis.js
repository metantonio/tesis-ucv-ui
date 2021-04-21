import React from "react";
import { Link } from "react-router-dom";
import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/home-tesis.scss";

export const HomeTesis = () => (
	<div className="text-center mt-5">
		<h1>Optimización de Estructuras con Algoritmos Genéticos!</h1>
		<p>
			<img src={dnaImage} />
		</p>
		<button className="btn">
			<Link to="/demo">If you see this green button, bootstrap is working</Link>
		</button>
	</div>
);

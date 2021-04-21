import React from "react";
import { Link } from "react-router-dom";
import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/autor.scss";

export const Autor = () => (
	<div className="text mt-6 title">
		<h1 className="title">Autor</h1>
		<p>
			<h2 className="sub-title">Antonio Martínez</h2>
		</p>
		<button className="btnHome">
			<Link to="/">Ir a Home</Link>
		</button>
	</div>
);

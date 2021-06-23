import React from "react";
import { Link } from "react-router-dom";
import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/autor.scss";

export const Autor = () => (
	<div className="text mt-6 title">
		<h1 className="title">Autor</h1>
		<p>
			<h3 className="sub-title">Antonio L. III Martínez B.</h3>
		</p>
		<h1 className="title">Tutor</h1>
		<p>
			<h3 className="sub-title">Ing. Ronald Torres</h3>
		</p>
		<button className="btnHome">
			<Link to="/">Ir a Home</Link>
		</button>
	</div>
);

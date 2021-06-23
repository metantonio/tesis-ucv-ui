import React from "react";
import { Link } from "react-router-dom";
import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/autor.scss";
import antonio from "../../img/antonio.jpg";

export const Autor = () => (
	<div className="card" id="carta">
		<img src={antonio} alt="Antonio Martínez" className="imagen-personas" />
		<h1>Antonio L. III Martínez B.</h1>
		<p className="title" id="nombre-tesista">
			Tesista para el título de Ing. Civil
		</p>
		<p>Universidad Central de Venezuela</p>
		<div>
			<a href="https://twitter.com/metantonio">
				<i className="fa fa-twitter" />
			</a>
			<a href="https://www.linkedin.com/in/metantonio/">
				<i className="fa fa-linkedin" />
			</a>
			<a href="https://www.instagram.com/metantonio/">
				<i className="fa fa-instagram" />
			</a>
			<a href="https://github.com/metantonio">
				<i className="fa fa-github" />
			</a>
		</div>
		<p>
			<button id="contacto">Contact</button>
		</p>
	</div>
);

import React, { useState, useEffect, useContext, Component } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";
import "../../styles/home-tesis.scss";

function Profiles() {
	const { store, actions } = useContext(Context);

	//var i = 2;

	return (
		<React.Fragment>
			<div className="text-center mt-6 title">
				<h1 className="title">
					Optimización de las Edificaciones de Acero con arriostramientos laterales en un sentido,
					condicionada a las deriva de piso mediante la aplicación de Algoritmos Genéticos
				</h1>
			</div>
			<div className="row justify-content">
				<div className="col-md-12 justify-content">
					<p>
						<h2 className="sub-title">Paso 3: Selección de Perfiles de Acero Estructural</h2>
					</p>
					<p>
						<h4 className="sub-title 2">Perfiles Comúnes en Venezuela</h4>
					</p>
					<br />
				</div>
				<div className="col-md-6" />
				<div className="col-md-6" />
				<div className="btn sub-title col-md-12">
					<p>
						<button
							className="btnPaso text-center mt-12 title"
							//onClick={e => }
						>
							<span>Guardar selección de Perfiles</span>
						</button>
					</p>
					<p>
						<button className="btnPaso2 text-center mt-12 title">
							<Link to="/">
								<span>Ir al Paso 4</span>
							</Link>
						</button>
					</p>
				</div>
			</div>
		</React.Fragment>
	);
}

export default Profiles;

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";

function Structure() {
	const { store, actions } = useContext(Context);

	return (
		<React.Fragment>
			<div className="text-center mt-6 title">
				<h1 className="title">
					Optimización de las Edificaciones de Acero con arriostramientos laterales en un sentido,
					condicionada a las deriva de piso mediante la aplicación de Algoritmos Genéticos
				</h1>
			</div>
			<div className="row justify-content">
				<div className="col-md-6">
					<div className="config-paso-1">
						<p>
							<h2 className="sub-title">Paso 1: Configuración de la Estructura</h2>
						</p>

						<p className="save-btn">
							<button className="btnPaso text-center mt-12 title">
								<span>Guardar Paso 1</span>
							</button>
						</p>
					</div>
				</div>
				<div className="col-md-6">
					<svg viewBox="0 0 50 20" xmlns="http://www.w3.org/2000/svg">
						<line x1="0" y1="0" x2="10" y2="10" stroke="black" strokeWidth="1px" />
					</svg>
				</div>
			</div>
		</React.Fragment>
	);
}

export default Structure;

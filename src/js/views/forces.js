import React, { useState, useEffect, useContext, Component } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";
import "../../styles/home-tesis.scss";

function Forces() {
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
				<div className="col-md-6">
					<div className="config-paso-1 justify-content">
						<p>
							<h2 className="sub-title">Paso 2: Configuración de las Cargas</h2>
						</p>
						<p>
							<h4>Carga Viva (kgf/m)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="2"
								id="no-columnas"
								name="no-columnas"
								min="2"
								max="5"
								//onChange={e => actions.setNoColumnas(e.target.value)}
							/>
						</p>
						<p>
							<h4>Carga Permanente (kgf/m)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="1"
								id="no-columnas"
								name="no-columnas"
								min="1"
								max="8"
								//onChange={e => actions.setNoPisos(e.target.value)}
							/>
						</p>
						<p>
							<h4>Sismo (kgf)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="1"
								id="no-columnas"
								name="no-columnas"
								min="1.00"
								step="0.01"
								max="6.00"
								//onChange={e => actions.setEntrePiso(e.target.value)}
							/>
						</p>
					</div>
				</div>
				<p>
					<button className="btnPaso text-center mt-12 title">
						<span>Calculo de Casos de Carga</span>
					</button>
				</p>
				<p>
					<button className="btnPaso2 text-center mt-12 title">
						<Link to="/">
							<span>Ir al Paso 3</span>
						</Link>
					</button>
				</p>
			</div>
		</React.Fragment>
	);
}

export default Forces;

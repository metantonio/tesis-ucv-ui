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
				<div className="col-md-12 justify-content">
					<p>
						<h2 className="sub-title">Paso 2: Configuración de las Cargas</h2>
					</p>
					<p>
						<h4 className="sub-title 2">(COVENIN-MINDUR 2002-88)</h4>
					</p>
					<br />
				</div>
				<div className="col-md-6">
					<div className="config-paso-1 justify-content">
						<p>
							<h4>Carga Viva Entrepiso(kgf/m2)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="250.00"
								id="no-columnas"
								name="no-columnas"
								min="1.00"
								step="0.01"
								//onChange={e => actions.setNoColumnas(e.target.value)}
							/>
						</p>
						<p>
							<h4>Carga Permanente LOSA Entrepiso(kgf/m2)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="800.00"
								id="no-columnas"
								name="no-columnas"
								min="1.00"
								step="0.01"

								//onChange={e => actions.setNoPisos(e.target.value)}
							/>
						</p>
						<p>
							<h4>Sismo (kgf)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="0.00"
								id="no-columnas"
								name="no-columnas"
								min="0.00"
								step="0.01"
								//onChange={e => actions.setEntrePiso(e.target.value)}
							/>
						</p>
					</div>
				</div>
				<div className="col-md-6">
					<div className="config-paso-1 justify-content">
						<p>
							<h4>Carga Viva Techo(kgf/m2)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="100.00"
								id="no-columnas"
								name="no-columnas"
								min="40.00"
								step="0.01"

								//onChange={e => actions.setNoColumnas(e.target.value)}
							/>
						</p>
						<p>
							<h4>Carga Permanente Techo(kgf/m2)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="150.00"
								id="no-columnas"
								name="no-columnas"
								min="1.00"
								step="0.01"

								//onChange={e => actions.setNoPisos(e.target.value)}
							/>
						</p>
						<p>
							<h4>Viento (kgf/m2)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="0.00"
								id="no-columnas"
								name="no-columnas"
								min="0.00"
								step="0.01"

								//onChange={e => actions.setEntrePiso(e.target.value)}
							/>
						</p>
					</div>
				</div>
				<div className="btn sub-title col-md-12">
					<p>
						<button className="btnPaso text-center mt-12 title">
							<span>Guardar configuración de Cargas</span>
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
			</div>
		</React.Fragment>
	);
}

export default Forces;

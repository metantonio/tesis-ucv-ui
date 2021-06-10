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
							<h4>Carga Variable Entrepiso(kgf/m2)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="ej: 250.00"
								id="cargaVEntrepiso"
								name="no-columnas"
								min="1.00"
								step="0.01"
								onChange={e => {
									var cargaVEntrepiso = document.getElementById("cargaVEntrepiso").value;
									return cargaVEntrepiso;
								}}
							/>
						</p>
						<p>
							<h4>Carga Permanente LOSA Entrepiso(kgf/m2)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="ej: 800.00"
								id="cargaPEntrepiso"
								name="no-columnas"
								min="1.00"
								step="0.01"
								onChange={e => {
									var cargaPEntrepiso = document.getElementById("cargaPEntrepiso").value;
									return cargaPEntrepiso;
								}}
							/>
						</p>
					</div>
				</div>
				<div className="col-md-6">
					<div className="config-paso-1 justify-content">
						<p>
							<h4>Carga Variable Techo(kgf/m2)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="ej: 100.00"
								id="cargaVTecho"
								name="no-columnas"
								min="40.00"
								step="0.01"
								onChange={e => {
									var cargaVTecho = document.getElementById("cargaVTecho").value;
									return cargaVTecho;
								}}
							/>
						</p>
						<p>
							<h4>Carga Permanente Techo(kgf/m2)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="ej: 150.00"
								id="cargaPTecho"
								name="no-columnas"
								min="1.00"
								step="0.01"
								onChange={e => {
									var cargaPTecho = document.getElementById("cargaPTecho").value;
									return cargaPTecho;
								}}
							/>
						</p>
						<p>
							<h4>Viento (kgf/m2) (COVENIN 2003-86)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="ej: 30.00"
								id="cargaViento"
								name="no-columnas"
								min="30.00"
								step="0.01"
								onChange={e => {
									var cargaViento = document.getElementById("cargaViento").value;
									return cargaViento;
								}}
							/>
						</p>
					</div>
				</div>
				<div className="btn sub-title col-md-12">
					<p>
						<button
							className="btnPaso text-center mt-12 title"
							onClick={e =>
								actions.setCargas(
									cargaVEntrepiso.value,
									cargaPEntrepiso.value,
									cargaVTecho.value,
									cargaPTecho.value,
									cargaViento.value
								)
							}>
							<span>Guardar configuración de Cargas</span>
						</button>
					</p>
					<p>
						<button className="btnPaso2 text-center mt-12 title">
							<Link to="/profiles">
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

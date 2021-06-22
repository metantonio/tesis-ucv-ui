import React, { useState, useEffect, useContext, Component } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";
import "../../styles/home-tesis.scss";

function Forces() {
	const { store, actions } = useContext(Context);
	var zonaSismica = 6;
	var aceleracionAo = 0;
	var formaEspectro = "";
	var factorCorreccion = 0.85;

	function Aceleracion(zona) {
		if (zona == 7) {
			aceleracionAo = 0.4;
		} else {
			if (zona == 6) {
				aceleracionAo = 0.35;
			}
			if (zona == 5) {
				aceleracionAo = 0.3;
			}
			if (zona == 4) {
				aceleracionAo = 0.25;
			}
			if (zona == 3) {
				aceleracionAo = 0.25;
			}
			if (zona == 2) {
				aceleracionAo = 0.15;
			}
			if (zona == 1) {
				aceleracionAo = 0.1;
			}
			if (zona == 0) {
				aceleracionAo = 0;
			}
		}
		return aceleracionAo;
	}

	function getComboList1() {
		var e = document.getElementById("ddlViewBy");
		var as = document.forms[0].ddlViewBy.value;
		var strUser = e.options[e.selectedIndex].text;
		console.log(as, strUser);
		return strUser;
	}

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
				<div className="col-md-12 justify-content">
					<p>
						<h2 className="sub-title">Paso 2.2: Configuración del Espectro de Diseño</h2>
					</p>
					<p>
						<h4 className="sub-title 2">(COVENIN 1756-2001)</h4>
					</p>
					<br />
					<div className="config-paso-1 justify-content">
						<p>
							<h4>Zona Sísmica</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="ej: 6"
								id="zona-sismica"
								name="no-columnas"
								min="0"
								step="1"
								max="7"
								onChange={e => {
									zonaSismica = document.getElementById("zona-sismica").value;
									aceleracionAo = Aceleracion(zonaSismica);
									console.log("Ao = ", aceleracionAo);
									return zonaSismica;
								}}
							/>
						</p>
						<p>
							<h4>Forma Espectral</h4>
							<form
								onChange={e => {
									formaEspectro = getComboList1();
								}}>
								<select id="ddlViewBy">
									<option value="1">S1</option>
									<option value="3" selected="selected">
										S3
									</option>
									<option value="2">S2</option>
									<option value="4">S4</option>
								</select>
							</form>
						</p>
						<p>
							<h4>ϕ: Factor de Corrección del coeficiente de aceleración horizontal</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="ej: 0.85"
								id="factor-correccion"
								name="no-columnas"
								min="0.60"
								step="0.05"
								max="0.90"
								onChange={e => {
									factorCorreccion = document.getElementById("factor-correccion").value;
									console.log("ϕ = ", factorCorreccion);
									return factorCorreccion;
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

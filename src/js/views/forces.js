import React, { useState, useEffect, useContext, Component } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";
import "../../styles/home-tesis.scss";
import { func } from "prop-types";
import { atan2, chain, derivative, e, evaluate, log, pi, pow, round, sqrt, inv, matrix } from "mathjs";
import Chart from "chart.js/auto";

function Forces() {
	const { store, actions } = useContext(Context);
	var zonaSismica = 6;
	var aceleracionAo = 0.35;
	var formaEspectro = "S3";
	var factorCorreccion = 0.85;
	var factorImportancia = 1.3;
	var factorReduccion = 6.0;
	var tAst = 1.0;
	var beta = 2.8;
	var ro = 1.0;
	var tMas = 0.4;

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

	function getComboList2() {
		var e = document.getElementById("ddlViewBy2");
		var as = e.options[e.selectedIndex].value;
		var strUser = e.options[e.selectedIndex].text;
		//console.log(as, strUser);
		return as;
	}

	function getComboList3() {
		var e = document.getElementById("ddlViewBy3");
		var as = e.options[e.selectedIndex].value;
		var strUser = e.options[e.selectedIndex].text;
		//console.log(as, strUser);
		return as;
	}

	function formaEspectral(forma) {
		if (forma == "S1") {
			tAst = 0.4;
			beta = 2.4;
			ro = 1.0;
		}
		if (forma == "S2") {
			tAst = 0.7;
			beta = 2.6;
			ro = 1.0;
		}
		if (forma == "S3") {
			tAst = 1.0;
			beta = 2.8;
			ro = 1.0;
		}
		if (forma == "S4") {
			tAst = 1.3;
			beta = 3.0;
			ro = 0.8;
		}
		return tAst, beta, ro;
	}

	function valorTMas(factor) {
		if (factor < 5) {
			tMas = 0.1 * (factor - 1);
		} else {
			tMas = 0.4;
		}
		return round(tMas, 3);
	}

	function scrollToBottom(idContainer) {
		window.scrollTo(0, document.getElementById(idContainer).scrollHeight);
		window.scrollTo(0, document.body.scrollHeight);
	}
	function scrollToTop() {
		window.scroll(0, top);
	}

	window.onload = function() {
		scrollToTop();
		actions.setZonaSismica(zonaSismica);
		actions.setAceleracionAo(aceleracionAo);
		actions.setTAst(tAst);
		actions.setBeta(beta);
		actions.setRo(ro);
		actions.setFactorCorreccion(factorCorreccion);
		actions.setFactorImportancia(factorImportancia);
		actions.setFactorReduccion(factorReduccion);
		actions.setTMas(tMas);
		//let myChart1;
		//document.getElementById("grafica-peso").remove(); // <canvas> element
		myChart1 = graficaXY(
			myChart1,
			"grafica-peso",
			periodos,
			aceleraciones,
			"Espectro de Diseno Elástico:Aceleración (g) vs. Periodo (s)",
			ctx1,
			"Aceleración (g)",
			"Periodo (s)"
		);
		myChart1.destroy();
	};

	let myChart1;
	//let myChart2;
	let ctx1 = document.getElementById("grafica-peso");
	//let ctx2;
	//window.myChart;
	//var ctx = document.getElementById("grafica-peso");
	function graficaXY(myChart, canvasID, arrayX, arrayY, titulo, ctx, nombreY, nombreX) {
		//console.log("histori e historiaPeso", historia, historiaPeso);
		if (myChart != null) {
			myChart.destroy();
			//document.getElementById("grafica-peso").destroy();
		}
		//resetCanvas();
		ctx = document.getElementById(canvasID);
		myChart = new Chart(ctx, {
			type: "line",
			data: {
				labels: arrayX,
				datasets: [
					{
						label: titulo,
						data: arrayY,
						fill: false,
						borderColor: "rgb(75, 192, 192)",
						tension: 0.1
					}
				]
			},
			options: {
				responsive: false,
				scales: {
					x: {
						title: {
							color: "black",
							display: true,
							text: nombreX
						},
						ticks: {
							autoSkip: false,
							maxTicksLimit: 1
						}
					},
					y: {
						title: {
							color: "black",
							display: true,
							text: nombreY
						}
					}
				}
			}
		});
		return myChart;
	}

	var periodos = [];
	var aceleraciones = [];

	function datosGrafica() {
		periodos = [];
		aceleraciones = [];

		periodos.push(0);
		aceleraciones.push(aceleracionAo * factorCorreccion * factorImportancia);
		periodos.push(tAst / 4);
		aceleraciones.push(aceleracionAo * factorCorreccion * factorImportancia * beta);

		periodos.push(tAst);
		aceleraciones.push(aceleracionAo * factorCorreccion * factorImportancia * beta);
		var aux = tAst;
		var aux2 = 0;

		for (var i = 1; i < 40; i++) {
			aux = round(tAst + 0.1 * i, 3);
			periodos.push(aux);

			aux2 = factorImportancia * factorCorreccion * beta * aceleracionAo * Math.pow(tAst / aux, ro);
			aceleraciones.push(aux2);
		}
		return aceleraciones, periodos;
	}

	useEffect(() => {
		//graficaXY();
	});

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
								step="10"
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
								step="10"
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
								step="10"
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
								step="10"
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
								step="0.1"
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
									//actions.setZonaSismica(zonaSismica);
									console.log("Ao = ", aceleracionAo);
									//actions.setAceleracionAo(aceleracionAo);

									return zonaSismica;
								}}
							/>
						</p>
						<p>
							<h4>Forma Espectral</h4>
							<form
								onChange={e => {
									formaEspectro = getComboList1();
									formaEspectral(formaEspectro);
									console.log(`T*(s): ${tAst} \n β: ${beta} \n ρ: ${ro}`);
									//actions.setTAst(tAst);
									//actions.setBeta(beta);
									//actions.setRo(ro);
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
									//actions.setFactorCorreccion(factorCorreccion);
									return factorCorreccion;
								}}
							/>
						</p>
						<p>
							<h4>Factor de Importancia</h4>
							<form
								onChange={e => {
									factorImportancia = getComboList2();
									console.log("Factor de Importancia: ", factorImportancia);
									//actions.setFactorImportancia(factorImportancia);
								}}>
								<select id="ddlViewBy2">
									<option value="1.15">B1</option>
									<option value="1.30" selected="selected">
										A
									</option>
									<option value="1.0">B2</option>
								</select>
							</form>
						</p>
						<p>
							<h4>Factor de Reducción según Nivel de Diseño, para Estructuras de Acero del Tipo I</h4>
							<form
								onChange={e => {
									factorReduccion = getComboList3();
									console.log("Factor de Reducción (R): ", factorReduccion);
									tMas = valorTMas(factorReduccion);
									console.log(`T+(s): ${tMas}`);
									//actions.setFactorReduccion(factorReduccion);
									//actions.setTMas(tMas);
								}}>
								<select id="ddlViewBy3">
									<option value="4.5">ND2</option>
									<option value="6.0" selected="selected">
										ND3
									</option>
									<option value="2.5">ND1</option>
								</select>
							</form>
						</p>
					</div>
				</div>
				<div className="col-sm-12" id="grafica-container">
					<canvas id="grafica-peso" width="800px" height="350px" />
				</div>
				<span className="sub-title">Nota: El eje X no se encuentra a escala.</span>
				<div className="btn sub-title col-md-12">
					<p>
						<button
							className="btnPaso text-center mt-12 title"
							onClick={e => {
								actions.setCargas(
									cargaVEntrepiso.value,
									cargaPEntrepiso.value,
									cargaVTecho.value,
									cargaPTecho.value,
									cargaViento.value
								);
								actions.setZonaSismica(zonaSismica);
								actions.setAceleracionAo(aceleracionAo);
								actions.setTAst(tAst);
								actions.setBeta(beta);
								actions.setRo(ro);
								actions.setFactorCorreccion(factorCorreccion);
								actions.setFactorImportancia(factorImportancia);
								actions.setFactorReduccion(factorReduccion);
								actions.setTMas(tMas);
								datosGrafica();
								// if (myChart1) {
								// 	myChart1.destroy();
								// 	let myChart1;
								// }
								myChart1 = graficaXY(
									myChart1,
									"grafica-peso",
									periodos,
									aceleraciones,
									"Espectro de Diseno Elástico:Aceleración (g) vs. Periodo (s)",
									ctx1,
									"Aceleración (g)",
									"Periodo (s)"
								);
								scrollToBottom("grafica-container");
							}}>
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

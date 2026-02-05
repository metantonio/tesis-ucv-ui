import React, { useState, useEffect, useContext, Component, PureComponent, useMemo } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import { render } from "react-dom";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";
import "../../styles/calculus.scss";
import PropTypes from "prop-types";
import {
	atan2,
	chain,
	derivative,
	e,
	evaluate,
	log,
	pi,
	pow,
	round,
	sqrt,
	inv,
	matrix,
	evaluateDependencies,
	json
} from "mathjs";
import { create, all } from "mathjs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import App from "./App";
import Chart from "chart.js/auto";

const math = create(all, {});
const rootElement = document.getElementById("grafica-evolucion1");
function Calculus() {
	const { store, actions } = useContext(Context);

	// New Modern State
	const [is3D, setIs3D] = useState(false);
	const [poblacion, setPoblacion] = useState(25);
	const [generacionesP, setGeneracionesP] = useState(5);
	const [solucion, setSolucion] = useState("Global"); // Global or Local for Diagonals
	const [showDeformation, setShowDeformation] = useState(false);
	const [defScale, setDefScale] = useState(500);
	const [selectedMatrix, setSelectedMatrix] = useState("Global");

	// Calculation Results
	const [calcResults, setCalcResults] = useState({
		conectividad: [],
		mejorEstructura: null,
		historia: [],
		pesoHistoria: [],
		scoreHistoria: [],
		displacements: [],
		globalK: null,
		seismicData: null
	});

	const MatrixViewer = ({ data, title }) => {
		if (!data || !data.length) return null;
		// Show only first 12x12 for performance if it's the global one
		const displayData = data.slice(0, 12).map(row => row.slice(0, 12));

		return (
			<div className="matrix-viewer">
				<div className="card-header mt-3">
					<h4>{title}</h4>
				</div>
				<div className="table-responsive p-3">
					<table className="matrix-table small-matrix">
						<tbody>
							{displayData.map((row, i) => (
								<tr key={i}>
									{row.map((val, j) => (
										<td key={j} className={val === 0 ? "zero-val" : ""}>
											{typeof val === "number" ? val.toExponential(2) : val}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
					{data.length > 12 && (
						<p className="text-muted small mt-2">* Mostrando solo los primeros 12x12 grados de libertad.</p>
					)}
				</div>
			</div>
		);
	};

	MatrixViewer.propTypes = {
		data: PropTypes.array,
		title: PropTypes.string
	};

	// Constants & Limits
	const E = 2100000; // Elasticidad kg/cm2
	const limitePlasticoIAla = 0.3 * Math.sqrt(E / 4200);
	const limiteCompactoIAla = 0.376 * Math.sqrt(E / 4200);
	// ... other constants can stay if needed, but let's modernize

	// 3D coordinate support
	const nodosCoordenadas = useMemo(
		() => {
			const coords = [];
			const nCol = actions.getNoColumnas();
			const nPisos = actions.getNoPisos();
			const dVano = actions.getLuzVano();
			const dPiso = actions.getEntrePiso();

			// If 3D, we might want to have another dimension for "depth" (Luz Transversal)
			// For now, let's assume a single frame in Z=0 or a simple 3D grid if requested.
			// Let's implement a 2-frame 3D grid as a first step for 3D if enabled.
			const nDepth = is3D ? 2 : 1;
			const dDepth = is3D ? dVano : 0; // Simplified depth

			for (let k = 0; k < nDepth; k++) {
				const z = k * dDepth;
				for (let i = 0; i < nCol; i++) {
					const x = i * dVano;
					for (let j = 0; j <= nPisos; j++) {
						const y = j * dPiso;
						coords.push([x, y, z]);
					}
				}
			}
			return coords;
		},
		[actions.getNoColumnas(), actions.getNoPisos(), actions.getLuzVano(), actions.getEntrePiso(), is3D]
	);

	const nodosNumeros = useMemo(
		() => {
			return nodosCoordenadas.map((_, index) => index);
		},
		[nodosCoordenadas]
	);

	// DOF per node: 2D = 3 (ux, uy, rz), 3D = 6 (ux, uy, uz, rx, ry, rz)
	const DOFs = is3D ? 6 : 3;

	// Legacy variable placeholders (mapping to new system to avoid immediate breaks)
	var repetir = 0;
	var exagerar = 1;
	var historia = [];
	var historiaPeso = [];
	var texto = "";
	var generations = generacionesP;

	// Global legacy variables to avoid ReferenceErrors
	var drawLines = "";
	var drawLines2 = "";
	var drawText = "";
	var vectorMatrizRigLocal = [];
	var vectorMatrizRigGlobal = [];
	var codigoGeneticoP = [];
	var vectorFuerzasInternas = [];
	var matrizReducidaInversa = [];
	var vectorFuerzasInternasRedux = [];
	var vectorDesplazamientos = [];
	var nodosCoordenadasV = [];
	var vectorConectividadf = [];
	var vectorConectividadf2 = [];
	var vectorConectividadf22 = [];
	var drawini = "";
	var u, v, uv, ctx;
	var listaIPN = store.perfilIPN;
	var listaUPL = store.perfilUPL;
	var getElementByIdf = "";
	var coordsLegacy = [];
	var numNodesLegacy = [];
	let dibujo = () => {
		for (var i = 1; i <= actions.getNoColumnas(); i++) {
			drawLines +=
				'<line x1="' +
				actions.getLuzVano() * (i - 1) +
				'" ' +
				'y1="' +
				40 +
				'" ' +
				'x2="' +
				actions.getLuzVano() * (i - 1) +
				'" ' +
				'y2="' +
				(40 - actions.getEntrePiso() * actions.getNoPisos()) +
				'" ' +
				'stroke="black" strokeWidth="10px"></line>';
			drawText +=
				'<text x="' +
				actions.getLuzVano() * (i - 1) +
				'" ' +
				'y="' +
				40 +
				'" ' +
				'font-size="0.15em"' +
				'fill="red">' +
				i +
				"</text>";
		}
		return drawLines;
	};

	let dibujoVigas = () => {
		for (var i = 1; i <= actions.getNoPisos(); i++) {
			drawLines2 +=
				'<line x1="' +
				0.2 +
				'" ' +
				'y1="' +
				(40 - actions.getEntrePiso() * i) +
				'" ' +
				'x2="' +
				actions.getLuzVano() * (actions.getNoColumnas() - 1) +
				'" ' +
				'y2="' +
				(40 - actions.getEntrePiso() * i) +
				'" ' +
				'stroke="black" strokeWidth="10px"></line>';
			drawText +=
				'<text x="' +
				0 +
				'" ' +
				'y="' +
				(40 - actions.getEntrePiso() * i) +
				'" ' +
				'font-size="0.15em"' +
				'fill="blue">' +
				i +
				"</text>";
		}
		return drawLines2;
	};

	const project3D = (x, y, z) => {
		const nx = parseFloat(x) || 0;
		const ny = parseFloat(y) || 0;
		const nz = parseFloat(z) || 0;

		if (!is3D) return { x: nx, y: -ny };
		// Isometric Projection (30 degrees)
		const isoX = (nx - nz) * 0.866;
		const isoY = -(ny - (nx + nz) * 0.5);
		return { x: isoX || 0, y: isoY || 0 };
	};

	let nodosCoord = () => {
		coordsLegacy = []; // Populate global legacy array
		const nDepth = is3D ? 2 : 1;
		const dDepth = is3D ? actions.getLuzVano() : 0; // Simplified depth

		for (let k = 0; k < nDepth; k++) {
			const z = k * dDepth;
			for (var i = 0; i <= actions.getNoColumnas() - 1; i++) {
				let u = i * actions.getLuzVano();
				for (var j = 0; j <= actions.getNoPisos(); j++) {
					let v = j * actions.getEntrePiso();
					let uv = [u, v, z];
					coordsLegacy.push(uv);
				}
			}
		}
		return coordsLegacy;
	};

	let nodosCoordVigas = () => {
		nodosCoordenadasV = []; // Populate global legacy array
		const nDepth = is3D ? 2 : 1;
		const dDepth = is3D ? actions.getLuzVano() : 0;

		for (let k = 0; k < nDepth; k++) {
			const z = k * dDepth;
			for (var i = 0; i <= actions.getNoPisos(); i++) {
				let v = i * actions.getEntrePiso();
				for (var j = 0; j <= actions.getNoColumnas() - 1; j++) {
					let u = j * actions.getLuzVano();
					let uv = [u, v, z];
					nodosCoordenadasV.push(uv);
				}
			}
		}
		return nodosCoordenadasV;
	};

	let nodosNum = () => {
		numNodesLegacy = []; // Populate global legacy array
		const nDepth = is3D ? 2 : 1;
		for (let k = 0; k < nDepth; k++) {
			for (var i = 0; i <= actions.getNoColumnas() - 1; i++) {
				let u = i;
				for (var j = 0; j <= actions.getNoPisos(); j++) {
					let v = j;
					let uv = [u, v, k]; // Third index for depth layer
					numNodesLegacy.push(uv);
				}
			}
		}
		return numNodesLegacy;
	};

	let tablaConectividad = cViento => {
		//Columnas
		//console.log("función tablaConectividad");
		var item = [];
		let union = [];
		var elementos = {
			elemento: "",
			puntoIni: [],
			puntoFin: [],
			a: 0,
			b: 0,
			c: 0,
			d: 0,
			e: 0,
			teta: 0,
			cos: 0,
			sin: 0,
			inercia: 1,
			elasticidad: 2100000,
			longitud: 10,
			peso: 0,
			desplazamientoNodoIni: [0, 0, 0]
		};
		var ele2 = {};
		for (var i = 0; i < nodosCoordenadas.length - 1; i++) {
			item = listaIPN[Math.floor(Math.random() * listaIPN.length)]; //de donde copiará los perfiles aleatorios
			//console.log(item);
			elementos["elemento"] = item["designacion"];
			elementos["inercia"] = item["ix"];
			elementos["inerciaY"] = item["iy"];
			elementos["dmm"] = item["altura"];
			elementos["bf"] = item["bf"];
			elementos["tf"] = item["tf"];
			elementos["tw"] = item["tw"];
			elementos["sx"] = item["sx"];
			elementos["zx"] = item["zx"];
			elementos["rx"] = item["rx"];
			elementos["sy"] = item["sy"];
			elementos["zy"] = item["zy"];
			elementos["ry"] = item["ry"];
			elementos["jj"] = item["j"];
			elementos["cw"] = item["cw"];
			//console.log(i);
			elementos["puntoIni"] = nodosCoordenadas[i];
			elementos["puntoFin"] = nodosCoordenadas[i + 1];
			elementos["nodoIni"] = nodosNumeros[i];
			elementos["nodoFin"] = nodosNumeros[i + 1];
			elementos["vectorX"] = matchCoord2(nodosCoordenadas[i]);
			elementos["vectorY"] = matchCoord2(nodosCoordenadas[i + 1]);
			//console.log(elementos["puntoIni"], elementos["puntoFin"]); //debug
			elementos["longitud"] = Math.sqrt(
				Math.pow(elementos["puntoFin"][0] - elementos["puntoIni"][0], 2) +
					Math.pow(elementos["puntoFin"][1] - elementos["puntoIni"][1], 2)
			);
			//console.log("esto es elementos por la mitad", elementos["puntoIni"], elementos["puntoFin"]);

			if (
				(elementos["longitud"] == actions.getEntrePiso()) &
				(elementos["puntoIni"][0] == elementos["puntoFin"][0])
			) {
				elementos["area"] = item["area"];
				elementos["a"] = (
					(elementos["elasticidad"] * elementos["area"]) /
					(elementos["longitud"] * 100)
				).toFixed(3);
				elementos["b"] = (
					(12 * elementos["elasticidad"] * elementos["inercia"]) /
					Math.pow(elementos["longitud"] * 100, 3)
				).toFixed(3);
				elementos["c"] = (
					(6 * elementos["elasticidad"] * elementos["inercia"]) /
					Math.pow(elementos["longitud"] * 100, 2)
				).toFixed(3);
				elementos["d"] = (
					(4 * elementos["elasticidad"] * elementos["inercia"]) /
					(elementos["longitud"] * 100)
				).toFixed(3);
				elementos["e"] = (
					(2 * elementos["elasticidad"] * elementos["inercia"]) /
					(elementos["longitud"] * 100)
				).toFixed(3);
				elementos["peso"] = (item["peso"] * elementos["longitud"]).toFixed(2); //peso del elemento
				if (elementos["puntoFin"][0] - elementos["puntoIni"][0] != 0) {
					elementos["teta"] = Math.atan(
						(elementos["puntoFin"][1] - elementos["puntoIni"][1]) /
							(elementos["puntoFin"][0] - elementos["puntoIni"][0])
					);
				} else {
					elementos["teta"] = (Math.PI / 2).toFixed(6);
				}
				elementos["cos"] = Math.cos(elementos["teta"]).toFixed(3);
				if (elementos["teta"] == Math.PI / 2) {
					elementos["cos"] = 0;
				}
				elementos["sin"] = Math.sin(elementos["teta"]).toFixed(3);
				elementos["tipo"] = "Columna";
				//unidades estan en kg, kg, kg-cm
				if ((elementos["puntoIni"][0] == 0) & (elementos["puntoFin"][0] == 0)) {
					elementos["fuerzainterna"] = [
						(cViento * actions.getCargaViento() * elementos["longitud"]) / 2,
						0,
						(-actions.getCargaViento() * cViento * ((elementos["longitud"] * 100) ^ 2)) / 12,
						(cViento * actions.getCargaViento() * elementos["longitud"]) / 2,
						0,
						(cViento * actions.getCargaViento() * ((elementos["longitud"] * 100) ^ 2)) / 12
					];
				} else {
					elementos["fuerzainterna"] = [0, 0, 0, 0, 0, 0];
				}
				//item = [];
				//console.log(elementos);
				ele2 = elementos;
				union.push(ele2);
				ele2 = {};
			} //Aquí termina el IF de las columnas
			elementos = {
				elemento: "",
				puntoIni: [],
				puntoFin: [],
				a: 0,
				b: 0,
				c: 0,
				d: 0,
				e: 0,
				teta: 0,
				cos: 0,
				sin: 0,
				inercia: 1,
				elasticidad: 2100000,
				longitud: 10,
				peso: 0,
				nodoIni: [],
				nodoFin: [],
				tipo: "",
				vectorX: [],
				vectorY: [],
				fuerzainterna: [0, 0, 0, 0, 0, 0],
				fuerzasGlobales: [0, 0, 0, 0, 0, 0],
				desplazamientoNodoIni: [0, 0, 0]
			};
		} // aquí termina el for
		vectorConectividadf = union;
		//console.log("Vector Conectividad Columnas:");
		//console.log(vectorConectividadf);
		return vectorConectividadf;
	};

	function reescrituraConectividadf(cViento, vectorConectividadf1) {
		//let vectorAux = vectorConectividadf;
		for (var i = 0; i < vectorConectividadf1.length; i++) {
			//console.log("elemento", elementos, vectorAux);
			if (
				(vectorConectividadf1[i]["longitud"] == actions.getEntrePiso()) &
				(vectorConectividadf1[i]["puntoIni"][0] == vectorConectividadf1[i]["puntoFin"][0])
			) {
				if ((vectorConectividadf1[i]["puntoIni"][0] == 0) & (vectorConectividadf1[i]["puntoFin"][0] == 0)) {
					//console.log("entro en el if en columnas que le entran viento", cViento * actions.getCargaViento());
					vectorConectividadf1[i]["fuerzainterna"] = [
						(cViento * actions.getCargaViento() * vectorConectividadf1[i]["longitud"]) / 2,
						0,
						(-actions.getCargaViento() * cViento * ((vectorConectividadf1[i]["longitud"] * 100) ^ 2)) / 12,
						(cViento * actions.getCargaViento() * vectorConectividadf1[i]["longitud"]) / 2,
						0,
						(cViento * actions.getCargaViento() * ((vectorConectividadf1[i]["longitud"] * 100) ^ 2)) / 12
					];
					//return vectorConectividadf[i]["fuerzainterna"];
				} else {
					vectorConectividadf1[i]["fuerzainterna"] = [0, 0, 0, 0, 0, 0];
					//return vectorConectividadf[i]["fuerzainterna"];
				}
			}
		}
		//vectorConectividadf = [];
		//vectorConectividadf = vectorAux;
		return vectorConectividadf1;
	}

	let matchCoord = vector => {
		let matchCoordenadas = {
			coordMetro: nodosCoordenadas,
			coordNum: nodosNumeros
		};
		//console.log("vector para match", vector);
		//console.log("vector a comparar", matchCoordenadas["coordMetro"]);
		let match = [];
		//console.log("long lista nodos", nodosNumeros.length);
		var n = 0;

		nodosCoordenadas.forEach(element => {
			//console.log("loop función matchCoord", element);
			//console.log("index?", n);
			var elementString = String(element);
			var vectoString = String(vector);
			if (elementString == vectoString) {
				match = nodosNumeros[n];
				//console.log("aquí hubo el match");
			}
			n++;
		});
		//console.log("match", match);
		return match;
	};

	const matchCoord2 = vector => {
		let match = [];
		var n = 0;
		nodosCoordenadas.forEach(element => {
			if (element.every((val, index) => val === vector[index])) {
				const startDOF = n * DOFs;
				match = Array.from({ length: DOFs }, (_, i) => startDOF + i);
			}
			n++;
		});
		return match;
	};

	function aleatorio(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	let tablaConectividad2 = (cVariable, cPermanente) => {
		//Vigas
		//console.log("función tablaConectividad2");
		var item = [];
		let union = [];
		//let vectorConectividadf2 = [];
		var elementos = {
			elemento: "",
			puntoIni: [],
			puntoFin: [],
			a: 0,
			b: 0,
			c: 0,
			d: 0,
			e: 0,
			teta: 0,
			cos: 0,
			sin: 0,
			inercia: 1,
			elasticidad: 2100000,
			longitud: 10,
			peso: 0,
			fuerzainterna: [0, 0, 0, 0, 0, 0],
			fuerzasGlobales: [0, 0, 0, 0, 0, 0],
			desplazamientoNodoIni: [0, 0, 0]
		};
		var ele2 = {};
		//let temp = parseInt(actions.getNoPisos());
		//let temp3 = parseInt(actions.getNoColumnas());
		for (var i = 0; i < nodosCoordenadasV.length - 1; i++) {
			item = listaIPN[Math.floor(Math.random() * listaIPN.length)]; //de donde copiará los perfiles aleatorios
			//console.log(item);
			elementos["elemento"] = item["designacion"];
			elementos["inercia"] = item["ix"];
			elementos["inerciaY"] = item["iy"];
			elementos["dmm"] = item["altura"];
			elementos["bf"] = item["bf"];
			elementos["tf"] = item["tf"];
			elementos["tw"] = item["tw"];
			elementos["sx"] = item["sx"];
			elementos["zx"] = item["zx"];
			elementos["rx"] = item["rx"];
			elementos["sy"] = item["sy"];
			elementos["zy"] = item["zy"];
			elementos["ry"] = item["ry"];
			elementos["jj"] = item["j"];
			elementos["cw"] = item["cw"];
			//console.log(i);
			elementos["puntoIni"] = nodosCoordenadasV[i];
			elementos["puntoFin"] = nodosCoordenadasV[i + 1];
			//var temp4 = i - temp + 1;
			elementos["nodoIni"] = matchCoord(nodosCoordenadasV[i]);
			//var temp2 = temp + temp4;
			//console.log("temp2", temp2);
			elementos["nodoFin"] = matchCoord(nodosCoordenadasV[i + 1]);
			elementos["vectorX"] = matchCoord2(nodosCoordenadasV[i]);
			elementos["vectorY"] = matchCoord2(nodosCoordenadasV[i + 1]);
			//console.log(elementos["puntoIni"], elementos["puntoFin"]); //debug
			elementos["longitud"] = Math.sqrt(
				Math.pow(elementos["puntoFin"][0] - elementos["puntoIni"][0], 2) +
					Math.pow(elementos["puntoFin"][1] - elementos["puntoIni"][1], 2)
			);
			//console.log("esto es elementos por la mitad", elementos["puntoIni"], elementos["puntoFin"]);

			if ((elementos["longitud"] == actions.getLuzVano()) & (elementos["puntoIni"][1] != 0)) {
				elementos["area"] = item["area"];
				elementos["a"] = (
					(elementos["elasticidad"] * elementos["area"]) /
					(elementos["longitud"] * 100)
				).toFixed(3);
				elementos["b"] = (
					(12 * elementos["elasticidad"] * elementos["inercia"]) /
					Math.pow(elementos["longitud"] * 100, 3)
				).toFixed(3);
				elementos["c"] = (
					(6 * elementos["elasticidad"] * elementos["inercia"]) /
					Math.pow(elementos["longitud"] * 100, 2)
				).toFixed(3);
				elementos["d"] = (
					(4 * elementos["elasticidad"] * elementos["inercia"]) /
					(elementos["longitud"] * 100)
				).toFixed(3);
				elementos["e"] = (
					(2 * elementos["elasticidad"] * elementos["inercia"]) /
					(elementos["longitud"] * 100)
				).toFixed(3);
				elementos["peso"] = (item["peso"] * elementos["longitud"]).toFixed(2); //peso del elemento
				if (elementos["puntoFin"][0] - elementos["puntoIni"][0] != 0) {
					elementos["teta"] = Math.atan(
						(elementos["puntoFin"][1] - elementos["puntoIni"][1]) /
							(elementos["puntoFin"][0] - elementos["puntoIni"][0])
					);
				} else {
					elementos["teta"] = (Math.PI / 2).toFixed(6);
				}
				elementos["cos"] = Math.cos(elementos["teta"]).toFixed(3);
				if (elementos["teta"] == Math.PI / 2) {
					elementos["cos"] = 0;
				}
				elementos["sin"] = Math.sin(elementos["teta"]).toFixed(3);
				elementos["tipo"] = "Viga";
				//unidades kg -cm, kg
				if (elementos["puntoIni"][1] == elementos["puntoFin"][1]) {
					elementos["fuerzainterna"] = [
						0,
						-(
							(cPermanente * actions.getCargaLosaPermanente() +
								cVariable * actions.getCargaLosaVariable()) *
							elementos["longitud"]
						) / 2,
						(-(
							cPermanente * actions.getCargaLosaPermanente() +
							cVariable * actions.getCargaLosaVariable()
						) *
							((elementos["longitud"] * 100) ^ 2)) /
							12,
						0,
						-(
							(cPermanente * actions.getCargaLosaPermanente() +
								cVariable * actions.getCargaLosaVariable()) *
							elementos["longitud"]
						) / 2,
						((cPermanente * actions.getCargaLosaPermanente() + cVariable * actions.getCargaLosaVariable()) *
							((elementos["longitud"] * 100) ^ 2)) /
							12
					];
				}
				if (
					(elementos["puntoIni"][1] ==
						parseFloat(actions.getNoPisos()) * parseFloat(actions.getEntrePiso())) &
					(elementos["puntoFin"][1] == parseFloat(actions.getNoPisos()) * parseFloat(actions.getEntrePiso()))
				) {
					elementos["fuerzainterna"] = [
						0,
						-(
							(cPermanente * actions.getCargaTechoPermanente() +
								cVariable * actions.getCargaTechoVariable()) *
							elementos["longitud"]
						) / 2,
						(-(
							cPermanente * actions.getCargaTechoPermanente() +
							cVariable * actions.getCargaTechoVariable()
						) *
							((elementos["longitud"] * 100) ^ 2)) /
							12,
						0,
						-(
							(cPermanente * actions.getCargaTechoPermanente() +
								cVariable * actions.getCargaTechoVariable()) *
							elementos["longitud"]
						) / 2,
						((cPermanente * actions.getCargaTechoPermanente() +
							cVariable * actions.getCargaTechoVariable()) *
							((elementos["longitud"] * 100) ^ 2)) /
							12
					];
				}

				//item = [];
				//console.log(elementos);
				ele2 = elementos;
				union.push(ele2);
				ele2 = {};
				//temp4 = 0;
				//temp2 = 0;
			} //Aquí termina el IF de las vigas
			elementos = {
				elemento: "",
				puntoIni: [],
				puntoFin: [],
				a: 0,
				b: 0,
				c: 0,
				d: 0,
				e: 0,
				teta: 0,
				cos: 0,
				sin: 0,
				inercia: 1,
				elasticidad: 2100000,
				longitud: 10,
				peso: 0,
				nodoIni: [],
				nodoFin: [],
				tipo: "",
				vectorX: [],
				vectorY: [],
				fuerzainterna: [0, 0, 0, 0, 0, 0],
				fuerzasGlobales: [0, 0, 0, 0, 0, 0],

				desplazamientoNodoIni: [0, 0, 0]
			};
		} // aquí termina el for de Vigas
		var numeroRandom;
		var arrayIni = [];
		var arrayFin = [];
		for (var i = 0; i < aleatorio(2, actions.getNoPisos() * actions.getNoColumnas()); i++) {
			item = listaUPL[Math.floor(Math.random() * listaUPL.length)]; //de donde copiará los perfiles aleatorios
			//console.log(item);
			elementos["elemento"] = item["designacion"];
			elementos["inercia"] = item["ix"];
			elementos["inerciaY"] = item["iy"];
			elementos["dmm"] = item["altura"];
			elementos["bf"] = item["bf"];
			elementos["tf"] = item["tf"];
			elementos["tw"] = item["tw"];
			elementos["sx"] = item["sx"];
			elementos["zx"] = item["zx"];
			elementos["rx"] = item["rx"];
			elementos["sy"] = item["sy"];
			elementos["zy"] = item["zy"];
			elementos["ry"] = item["ry"];
			elementos["jj"] = item["j"];
			elementos["cw"] = item["cw"];
			//console.log(i);
			elementos["puntoIni"] = nodosCoordenadasV[Math.floor(Math.random() * nodosCoordenadasV.length)];
			elementos["puntoFin"] = nodosCoordenadasV[Math.floor(Math.random() * nodosCoordenadasV.length)];
			arrayIni = [];
			arrayFin = [];
			arrayIni = elementos["puntoIni"].slice();
			arrayFin = elementos["puntoFin"].slice();
			if (solucion == "Global") {
				while (
					elementos["puntoIni"][0] == elementos["puntoFin"][0] ||
					elementos["puntoIni"][1] == elementos["puntoFin"][1]
				) {
					elementos["puntoFin"] = nodosCoordenadasV[Math.floor(Math.random() * nodosCoordenadasV.length)];
				}
			}
			if (solucion == "Local") {
				elementos["puntoFin"] = [];
				if (arrayIni[0] != 0) {
					numeroRandom = aleatorio(0, 1);
					if (numeroRandom == 0) {
						numeroRandom = -1;
					}
					if (arrayIni[0] != parseFloat(actions.getLuzVano()) * (parseFloat(actions.getNoColumnas()) - 1)) {
						elementos["puntoFin"].push(arrayIni[0] + numeroRandom * parseFloat(actions.getLuzVano()));
					} else {
						elementos["puntoFin"].push(arrayIni[0] - parseFloat(actions.getLuzVano()));
					}
				} else {
					elementos["puntoFin"].push(parseFloat(actions.getLuzVano()));
				}
				if (arrayIni[1] != 0) {
					numeroRandom = aleatorio(0, 1);
					if (numeroRandom == 0) {
						numeroRandom = -1;
					}
					if (arrayIni[1] != parseFloat(actions.getEntrePiso()) * parseFloat(actions.getNoPisos())) {
						elementos["puntoFin"].push(arrayIni[1] + numeroRandom * parseFloat(actions.getEntrePiso()));
					} else {
						elementos["puntoFin"].push(arrayIni[1] - parseFloat(actions.getEntrePiso()));
					}
				} else {
					elementos["puntoFin"].push(parseFloat(actions.getEntrePiso()));
				}
			}

			//var temp4 = i - temp + 1;
			elementos["nodoIni"] = matchCoord(elementos["puntoIni"]);
			//var temp2 = temp + temp4;
			//console.log("temp2", temp2);
			elementos["nodoFin"] = matchCoord(elementos["puntoFin"]);
			elementos["vectorX"] = matchCoord2(elementos["puntoIni"]);
			elementos["vectorY"] = matchCoord2(elementos["puntoFin"]);
			//console.log(elementos["puntoIni"], elementos["puntoFin"]); //debug
			elementos["longitud"] = Math.sqrt(
				Math.pow(elementos["puntoFin"][0] - elementos["puntoIni"][0], 2) +
					Math.pow(elementos["puntoFin"][1] - elementos["puntoIni"][1], 2)
			);
			//console.log("esto es elementos por la mitad", elementos["puntoIni"], elementos["puntoFin"]);

			if ((elementos["longitud"] != actions.getLuzVano()) & (elementos["longitud"] != actions.getEntrePiso())) {
				elementos["area"] = item["area"];
				elementos["a"] = (
					(elementos["elasticidad"] * elementos["area"]) /
					(elementos["longitud"] * 100)
				).toFixed(3);
				elementos["b"] = (0).toFixed(3);
				elementos["c"] = (0).toFixed(3);
				elementos["d"] = (0).toFixed(3);
				elementos["e"] = (0).toFixed(3);
				elementos["peso"] = (item["peso"] * elementos["longitud"]).toFixed(2); //peso del elemento
				if (elementos["puntoFin"][0] - elementos["puntoIni"][0] != 0) {
					elementos["teta"] = Math.atan(
						(elementos["puntoFin"][1] - elementos["puntoIni"][1]) /
							(elementos["puntoFin"][0] - elementos["puntoIni"][0])
					);
				} else {
					elementos["teta"] = (Math.PI / 2).toFixed(6);
				}
				elementos["cos"] = Math.cos(elementos["teta"]).toFixed(3);
				if (elementos["teta"] == Math.PI / 2) {
					elementos["cos"] = 0;
				}
				elementos["sin"] = Math.sin(elementos["teta"]).toFixed(3);
				elementos["tipo"] = "Diagonal";
				//item = [];
				//console.log(elementos);
				ele2 = elementos;
				union.push(ele2);
				ele2 = {};
				//temp4 = 0;
				//temp2 = 0;
			} //Aquí termina el IF de las vigas
			elementos = {
				elemento: "",
				puntoIni: [],
				puntoFin: [],
				a: 0,
				b: 0,
				c: 0,
				d: 0,
				e: 0,
				teta: 0,
				cos: 0,
				sin: 0,
				inercia: 1,
				elasticidad: 2100000,
				longitud: 10,
				peso: 0,
				nodoIni: [],
				nodoFin: [],
				tipo: "",
				vectorX: [],
				vectorY: [],
				fuerzainterna: [0, 0, 0, 0, 0, 0],
				fuerzasGlobales: [0, 0, 0, 0, 0, 0],

				desplazamientoNodoIni: [0, 0, 0]
			};
		} //aquí termina el for de Diagonales

		vectorConectividadf2 = union;
		//vectorConectividadf.push(vectorConectividadf2);
		//console.log("Vector Conectividad f2 Vigas:");
		//console.log(vectorConectividadf2);
		vectorConectividadf2.forEach(element => {
			vectorConectividadf.push(element);
		});
		//vectorConectividadf.push(vectorConectividadf2);
		return vectorConectividadf2;
	};

	function reescrituraConectividadf2(cVariable, cPermanente, vectorConectividadf22) {
		//console.log("vectorcConectividadf2", vectorConectividadf2);
		for (var i = 0; i < vectorConectividadf22.length; i++) {
			//vigas
			if (
				(vectorConectividadf22[i]["longitud"] == actions.getLuzVano()) &
				(vectorConectividadf22[i]["puntoIni"][1] != 0)
			) {
				//console.log("entro en primer if reescrituraconectividadf2");
				if (vectorConectividadf22[i]["puntoIni"][1] == vectorConectividadf22[i]["puntoFin"][1]) {
					//console.log("entro en if reescrituraconectividadf2");
					vectorConectividadf22[i]["fuerzainterna"] = [
						0,
						-(
							(cPermanente * actions.getCargaLosaPermanente() +
								cVariable * actions.getCargaLosaVariable()) *
							vectorConectividadf22[i]["longitud"]
						) / 2,
						(-(
							cPermanente * actions.getCargaLosaPermanente() +
							cVariable * actions.getCargaLosaVariable()
						) *
							((vectorConectividadf22[i]["longitud"] * 100) ^ 2)) /
							12,
						0,
						-(
							(cPermanente * actions.getCargaLosaPermanente() +
								cVariable * actions.getCargaLosaVariable()) *
							vectorConectividadf22[i]["longitud"]
						) / 2,
						((cPermanente * actions.getCargaLosaPermanente() + cVariable * actions.getCargaLosaVariable()) *
							((vectorConectividadf22[i]["longitud"] * 100) ^ 2)) /
							12
					];
					//if del techo empieza aquí>
					if (
						(vectorConectividadf22[i]["puntoIni"][1] ==
							actions.getNoPisos() * parseFloat(actions.getEntrePiso())) &
						(vectorConectividadf22[i]["puntoFin"][1] ==
							actions.getNoPisos() * parseFloat(actions.getEntrePiso()))
					) {
						vectorConectividadf22[i]["fuerzainterna"] = [
							0,
							-(
								(cPermanente * actions.getCargaTechoPermanente() +
									cVariable * actions.getCargaTechoVariable()) *
								vectorConectividadf22[i]["longitud"]
							) / 2,
							(-(
								cPermanente * actions.getCargaTechoPermanente() +
								cVariable * actions.getCargaTechoVariable()
							) *
								((vectorConectividadf22[i]["longitud"] * 100) ^ 2)) /
								12,
							0,
							-(
								(cPermanente * actions.getCargaTechoPermanente() +
									cVariable * actions.getCargaTechoVariable()) *
								vectorConectividadf22[i]["longitud"]
							) / 2,
							((cPermanente * actions.getCargaTechoPermanente() +
								cVariable * actions.getCargaTechoVariable()) *
								((vectorConectividadf22[i]["longitud"] * 100) ^ 2)) /
								12
						];
						//return vectorConectividadf2[i]["fuerzainterna"];
					}

					return vectorConectividadf22[i]["fuerzainterna"];
				}
			}

			//diagonales
		}
		return vectorConectividadf22;
	}

	function addTableConnect() {
		var fila = "";
		// var vectorTemp = [];
		// console.log("Vector Conectividad f2 Vigas addTable:");
		// console.log(vectorConectividadf2);
		// vectorTemp.push(vectorConectividadf, vectorConectividadf2);
		// console.log("vectorTemp", vectorTemp);
		//console.log("Vector Conectividadf", vectorConectividadf);

		var final = vectorConectividadf.map(function(vectorConectividadf, index, array) {
			var a = "<th scope='row'>No</th>";
			a += "<th>Perfil</th>";
			a += "<th>Tipo Elemento</th>";
			a += "<th>Coordenada Inicial</th>";
			a += "<th>Coordenada Final</th>";
			a += "<th>EA/L</th>";
			a += "<th>12EA/L³</th>";
			a += "<th>6EI/L²</th>";
			a += "<th>4EI/L</th>";
			a += "<th>2EI/L</th>";
			a += "<th>θ (rad)</th>";
			a += "<th>cos(θ)</th>";
			a += "<th>seno(θ)</th>";
			a += "<th>Longitud(cm)</th>";
			a += "<th>Peso(kg)</th>";

			//serían los encabezados de la tabla
			var html = "<thead><tr>" + a + "</tr></thead>";

			fila +=
				"<tr>" +
				"<td>" +
				(index + 1) +
				"</td>" +
				"<td>" +
				vectorConectividadf.elemento +
				"</td>" +
				"<td>" +
				vectorConectividadf.tipo +
				"</td>" +
				"<td>(" +
				vectorConectividadf.puntoIni +
				")</td>" +
				"<td>(" +
				vectorConectividadf.puntoFin +
				")</td>" +
				"<td>" +
				vectorConectividadf.a +
				"</td>" +
				"<td>" +
				vectorConectividadf.b +
				"</td>" +
				"<td>" +
				vectorConectividadf.c +
				"</td>" +
				"<td>" +
				vectorConectividadf.d +
				"</td>" +
				"<td>" +
				vectorConectividadf.e +
				"</td>" +
				"<td>" +
				vectorConectividadf.teta +
				"</td>" +
				"<td>" +
				vectorConectividadf.cos +
				"</td>" +
				"<td>" +
				vectorConectividadf.sin +
				"</td>" +
				"<td>" +
				vectorConectividadf.longitud * 100 +
				"</td>" +
				"<td>" +
				vectorConectividadf.peso +
				"</td>" +
				"</tr>";
			//+"<br/>";
			document.getElementById("tabla-connect").innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}

	function addTableConnect2(codigoGeneticoP1) {
		var fila = "";
		// var vectorTemp = [];
		// console.log("Vector Conectividad f2 Vigas addTable:");
		// console.log(vectorConectividadf2);
		// vectorTemp.push(vectorConectividadf, vectorConectividadf2);
		// console.log("vectorTemp", vectorTemp);
		//console.log("Vector Conectividadf", vectorConectividadf);

		var final = codigoGeneticoP1.map(function(vectorConectividadf, index, array) {
			var a = "<th scope='row'>No</th>";
			a += "<th>Perfil</th>";
			a += "<th>Tipo Elemento</th>";
			a += "<th>Coordenada Inicial</th>";
			a += "<th>Coordenada Final</th>";
			a += "<th>EA/L</th>";
			a += "<th>12EA/L³</th>";
			a += "<th>6EI/L²</th>";
			a += "<th>4EI/L</th>";
			a += "<th>2EI/L</th>";
			a += "<th>θ (rad)</th>";
			a += "<th>cos(θ)</th>";
			a += "<th>seno(θ)</th>";
			a += "<th>Longitud(cm)</th>";
			a += "<th>Peso(kg)</th>";

			//serían los encabezados de la tabla
			var html = "<thead><tr>" + a + "</tr></thead>";

			fila +=
				"<tr>" +
				"<td>" +
				(index + 1) +
				"</td>" +
				"<td>" +
				vectorConectividadf.elemento +
				"</td>" +
				"<td>" +
				vectorConectividadf.tipo +
				"</td>" +
				"<td>(" +
				vectorConectividadf.puntoIni +
				")</td>" +
				"<td>(" +
				vectorConectividadf.puntoFin +
				")</td>" +
				"<td>" +
				vectorConectividadf.a +
				"</td>" +
				"<td>" +
				vectorConectividadf.b +
				"</td>" +
				"<td>" +
				vectorConectividadf.c +
				"</td>" +
				"<td>" +
				vectorConectividadf.d +
				"</td>" +
				"<td>" +
				vectorConectividadf.e +
				"</td>" +
				"<td>" +
				vectorConectividadf.teta +
				"</td>" +
				"<td>" +
				vectorConectividadf.cos +
				"</td>" +
				"<td>" +
				vectorConectividadf.sin +
				"</td>" +
				"<td>" +
				vectorConectividadf.longitud * 100 +
				"</td>" +
				"<td>" +
				vectorConectividadf.peso +
				"</td>" +
				"</tr>";
			//+"<br/>";
			document.getElementById("tabla-connect").innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}
	// These will be populated by the legacy wrappers if called
	vectorMatrizRigLocal = [];
	vectorMatrizRigGlobal = [];

	const calcElementLocalK = element => {
		const { area, inercia, inerciaY, jj, longitud, elasticidad } = element;
		const L = longitud * 100; // cm
		const E = elasticidad;
		const G = E / (2 * (1 + 0.3)); // G approximated with Poisson = 0.3

		if (!is3D) {
			// 2D: 6x6 (Axial, Shear Y, Moment Z)
			const a = (E * area) / L;
			const b = (12 * E * inercia) / Math.pow(L, 3);
			const c = (6 * E * inercia) / Math.pow(L, 2);
			const d = (4 * E * inercia) / L;
			const e = (2 * E * inercia) / L;

			return [
				[+a, 0, 0, -a, 0, 0],
				[0, +b, +c, 0, -b, +c],
				[0, +c, +d, 0, -c, +e],
				[-a, 0, 0, +a, 0, 0],
				[0, -b, -c, 0, +b, -c],
				[0, +c, +e, 0, -c, +d]
			];
		} else {
			// 3D: 12x12 (Axial, Shear Y, Shear Z, Torsion, Moment Y, Moment Z)
			const Iz = inercia;
			const Iy = inerciaY || inercia;
			const J = jj || Iy + Iz;

			const K = Array.from({ length: 12 }, () => Array(12).fill(0));

			// Axial x
			const axial = (E * area) / L;
			K[0][0] = K[6][6] = axial;
			K[0][6] = K[6][0] = -axial;

			// Torsion x
			const torsion = (G * J) / L;
			K[3][3] = K[9][9] = torsion;
			K[3][9] = K[9][3] = -torsion;

			// Bending about Z (Shear Y, Moment Z)
			const bz = (12 * E * Iz) / Math.pow(L, 3);
			const cz = (6 * E * Iz) / Math.pow(L, 2);
			const dz = (4 * E * Iz) / L;
			const ez = (2 * E * Iz) / L;

			K[1][1] = bz;
			K[1][5] = cz;
			K[5][1] = cz;
			K[5][5] = dz;
			K[7][7] = bz;
			K[7][11] = -cz;
			K[11][7] = -cz;
			K[11][11] = dz;
			K[1][7] = K[7][1] = -bz;
			K[1][11] = K[11][1] = cz;
			K[5][7] = K[7][5] = -cz;
			K[5][11] = K[11][5] = ez;

			// Bending about Y (Shear Z, Moment Y)
			const by = (12 * E * Iy) / Math.pow(L, 3);
			const cy = (6 * E * Iy) / Math.pow(L, 2);
			const dy = (4 * E * Iy) / L;
			const ey = (2 * E * Iy) / L;

			K[2][2] = by;
			K[2][4] = -cy;
			K[4][2] = -cy;
			K[4][4] = dy;
			K[8][8] = by;
			K[8][10] = cy;
			K[10][8] = cy;
			K[10][10] = dy;
			K[2][8] = K[8][2] = -by;
			K[2][10] = K[10][2] = -cy;
			K[4][8] = K[8][4] = cy;
			K[4][10] = K[10][4] = ey;

			return K;
		}
	};

	const calcElementGlobalK = element => {
		const K_local = math.matrix(calcElementLocalK(element));
		const { cos, sin, puntoIni, puntoFin } = element;

		let T;
		if (!is3D) {
			const c = parseFloat(cos);
			const s = parseFloat(sin);
			T = math.matrix([
				[c, s, 0, 0, 0, 0],
				[-s, c, 0, 0, 0, 0],
				[0, 0, 1, 0, 0, 0],
				[0, 0, 0, c, s, 0],
				[0, 0, 0, -s, c, 0],
				[0, 0, 0, 0, 0, 1]
			]);
		} else {
			// 3D Rotation Matrix
			const dx = puntoFin[0] - puntoIni[0];
			const dy = puntoFin[1] - puntoIni[1];
			const dz = (puntoFin[2] || 0) - (puntoIni[2] || 0);
			const L = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

			const cx = dx / L;
			const cy = dy / L;
			const cz = dz / L;

			let r;
			if (Math.abs(cx) < 0.001 && Math.abs(cz) < 0.001) {
				const sign = cy > 0 ? 1 : -1;
				r = [[0, sign, 0], [-sign, 0, 0], [0, 0, 1]];
			} else {
				const D = Math.sqrt(cx * cx + cz * cz);
				r = [[cx, cy, cz], [(-cx * cy) / D, D, (-cy * cz) / D], [-cz / D, 0, cx / D]];
			}

			const R = math.matrix(r);
			const zero3 = math.zeros(3, 3);
			T = math.concat(
				math.concat(R, zero3, zero3, zero3, 1),
				math.concat(zero3, R, zero3, zero3, 1),
				math.concat(zero3, zero3, R, zero3, 1),
				math.concat(zero3, zero3, zero3, R, 1),
				0
			);
		}

		const T_trans = math.transpose(T);
		const K_global = math.multiply(math.multiply(T_trans, K_local), T);
		return K_global.toArray();
	};

	// Legacy wrappers for initialization path
	let matrizRigidLocal = element => {
		if (element) return calcElementLocalK(element);
		vectorMatrizRigLocal = (vectorConectividadf || []).map(el => calcElementLocalK(el));
		return vectorMatrizRigLocal;
	};

	let matrizRigidGlogal = element => {
		if (element) return calcElementGlobalK(element);
		vectorMatrizRigGlobal = (vectorConectividadf || []).map(el => calcElementGlobalK(el));
		return vectorMatrizRigGlobal;
	};

	let matrizRigidLocal2 = codigoGeneticoP1 => {
		let matriz = [[], [], [], [], [], []];
		let vectorMatrizRigL = [];
		vectorMatrizRigLocal = [];
		codigoGeneticoP1.forEach(element => {
			matriz = [
				[+element.a, 0, 0, -element.a, 0, 0],
				[0, +element.b, +element.c, 0, -element.b, +element.c],
				[0, +element.c, +element.d, 0, -element.c, +element.e],
				[-element.a, 0, 0, +element.a, 0, 0],
				[0, -element.b, -element.c, 0, +element.b, -element.c],
				[0, +element.c, +element.e, 0, -element.c, +element.d]
			];
			vectorMatrizRigL.push(matriz);
			matriz = [[], [], [], [], [], []];
		});
		//console.log("vector de matrices de Rigidez coord Local", vectorMatrizRigL);
		vectorMatrizRigLocal = vectorMatrizRigL;
		return vectorMatrizRigL;
	};

	let matrizRigidGlogal2 = codigoGeneticoP1 => {
		let matrizL = [[], [], [], [], [], []];
		let matrizLtras = [[], [], [], [], [], []];
		let vectorMatrizLtras = [];
		let vectorMatrizL = [];
		vectorMatrizRigGlobal = [];
		var multi1 = [];
		codigoGeneticoP1.forEach(element => {
			matrizL = [
				[+element.cos, +element.sin, 0, 0, 0, 0],
				[-element.sin, +element.cos, 0, 0, 0, 0],
				[0, 0, 1, 0, 0, 0],
				[0, 0, 0, +element.cos, +element.sin, 0],
				[0, 0, 0, -element.sin, +element.cos, 0],
				[0, 0, 0, 0, 0, 1]
			];
			vectorMatrizL.push(matrizL);
			matrizL = [[], [], [], [], [], []];
			matrizLtras = [
				[+element.cos, -element.sin, 0, 0, 0, 0],
				[+element.sin, +element.cos, 0, 0, 0, 0],
				[0, 0, 1, 0, 0, 0],
				[0, 0, 0, +element.cos, -element.sin, 0],
				[0, 0, 0, +element.sin, +element.cos, 0],
				[0, 0, 0, 0, 0, 1]
			];
			vectorMatrizLtras.push(matrizLtras);
			matrizLtras = [[], [], [], [], [], []];
		});
		//console.log("vectores de transformación", vectorMatrizLtras, vectorMatrizL);
		//console.log("vectorMatrizRigLocal", vectorMatrizRigLocal);
		for (var i = 0; i < vectorMatrizRigLocal.length; i++) {
			//console.log(i);
			multi1[i] = multiplicarMatrices(vectorMatrizLtras[i], vectorMatrizRigLocal[i]);
			//console.log(multi1[i]);
			multi1[i] = multiplicarMatrices(multi1[i], vectorMatrizL[i]);
			//console.log(multi1[i]);
			//vectorMatrizRigGlobal.push(multi1[i]);
			//console.log("vectorMatrizRigGlobal dentro del for", vectorMatrizRigGlobal);
		}
		//console.log("vector multi1", multi1);
		//vectorMatrizRigGlobal = multi1;
		//vectorMatrizRigGlobal = vectorMatrizRigL;
		return multi1;
	};

	//Matrices de ejemplo para probar la función de multiplicar matrices
	let matrizEA = [[1, 2, 3], [4, 5, 6]];
	let matrizEB = [[5, -1], [1, 0], [-2, 3]];

	function addMatricesRigLocal() {
		var vectorMatrizRigL = matrizRigidLocal();
		var final = vectorMatrizRigL.map(function(item, index, array) {
			var a = "<div className='row justify-content-center'/>";
			a += "<div className='col-6'>";
			a += "<h2>K'";
			a += index + 1;
			a += " =</h2>";
			a += "<table className='table table-bordered col-10' padding='5px'>";
			a += "<thead><tr><th/><th/><th/><th/><th/><th/><tr/></thead>";
			a += "<tbody>";
			for (var i = 0; i < 6; i++) {
				//console.log("item", item[i]);
				a += "<tr>";
				for (var j = 0; j < 6; j++) {
					//console.log("ij", i, j);
					a += "<td>";
					a += item[i][j];
					a += "  </td>";
				}
				a += "<tr/>";
			}
			a += "</tbody></table><br/></div></div>";
			//a += "<div className='row justify-content-center'/>";
			document.getElementById("matrices-rigid-local").innerHTML += a;
			return a;
		});
	}
	function addMatricesRigLocal2(codigoGeneticoP1) {
		var vectorMatrizRigL = matrizRigidLocal2(codigoGeneticoP1);
		var final = vectorMatrizRigL.map(function(item, index, array) {
			var a = "<div className='row justify-content-center'/>";
			a += "<div className='col-6'>";
			a += "<h2>K'";
			a += index + 1;
			a += " =</h2>";
			a += "<table className='table table-bordered col-10' padding='5px'>";
			a += "<thead><tr><th/><th/><th/><th/><th/><th/><tr/></thead>";
			a += "<tbody>";
			for (var i = 0; i < 6; i++) {
				//console.log("item", item[i]);
				a += "<tr>";
				for (var j = 0; j < 6; j++) {
					//console.log("ij", i, j);
					a += "<td>";
					a += item[i][j];
					a += "  </td>";
				}
				a += "<tr/>";
			}
			a += "</tbody></table><br/></div></div>";
			//a += "<div className='row justify-content-center'/>";
			document.getElementById("matrices-rigid-local").innerHTML += a;
			return a;
		});
	}

	let multiplicarMatrices = (matrizA, matrizB) => {
		let matrizRes = [matrizA.length];
		//console.log(matrizA.length, matrizB[0].length);
		for (var i = 0; i < matrizA.length; i++) {
			matrizRes[i] = new Array(matrizB[0].length).fill(0);
			for (var j = 0; j < matrizB[0].length; j++) {
				//console.log(matrizRes[i][j]);
				for (var k = 0; k < matrizA[0].length; k++) {
					//console.log(k);
					matrizRes[i][j] += matrizA[i][k] * matrizB[k][j];
				}
			}
		}
		return matrizRes;
	};

	function addMatricesRigGlobal() {
		var vectorMatrizRigG = matrizRigidGlogal();
		var final = vectorMatrizRigG.map(function(item, index, array) {
			var a = "<div className='row justify-content-center'/>";
			a += "<div className='col-6'>";
			a += "<h2>K";
			a += index + 1;
			a += " =</h2>";
			a += "<table className='table table-bordered col-10' padding='5px'>";
			a += "<thead><tr><th/><th/><th/><th/><th/><th/><tr/></thead>";
			a += "<tbody>";
			for (var i = 0; i < 6; i++) {
				//console.log("item", item[i]);
				a += "<tr>";
				for (var j = 0; j < 6; j++) {
					//console.log("ij", i, j);
					a += "<td>";
					a += item[i][j];
					a += "  </td>";
				}
				a += "<tr/>";
			}
			a += "</tbody></table><br/></div></div>";
			//a += "<div className='row justify-content-center'/>";
			document.getElementById("matrices-rigid-global").innerHTML += a;
			return a;
		});
	}

	var codigoGeneticoP = [];

	function codigoGenetico() {
		// Ensure connectivity is refreshed if empty
		if (vectorConectividadf.length === 0) {
			tablaConectividad(0);
			tablaConectividad2(0, 0);
		}

		return vectorConectividadf.map(element => {
			const globalK = calcElementGlobalK(element);
			return { ...element, rigidez: globalK };
		});
	}
	function codigoGenetico2(codigoGeneticoP1) {
		var vectorGenetico = [];
		vectorGenetico = vectorConectividadf;
		var vector = [];
		vector = matrizRigidGlogal2(codigoGeneticoP1);
		//console.log("vectorGenetico", vectorGenetico);
		var n = 0;
		//console.log("vector rigidez global", vector);
		var final = codigoGeneticoP1.map(function(element, index, array) {
			element["rigidez"] = vector[n];
			n++;
			return element;
		});
		//console.log("final", final);
		vectorGenetico = [];
		//vectorGenetico=final;
		return final;
	}

	let matrizRigidezTotal = [];

	let rigidezTotal = connectivity => {
		const numDOFs = nodosCoordenadas.length * DOFs;
		// Initialize global stiffness matrix with zeros
		let globalK = math.zeros(numDOFs, numDOFs, "sparse");

		connectivity.forEach(element => {
			const { rigidez, vectorX, vectorY } = element;
			// Combined indices [nodeA_dofs, nodeB_dofs]
			const elementIndices = [...vectorX, ...vectorY];

			for (let i = 0; i < elementIndices.length; i++) {
				for (let j = 0; j < elementIndices.length; j++) {
					const row = elementIndices[i];
					const col = elementIndices[j];
					const val = globalK.get([row, col]) + rigidez[i][j];
					globalK.set([row, col], val);
				}
			}
		});

		matrizRigidezTotal = globalK.toArray();
		return matrizRigidezTotal;
	};

	const analyzeStructure = connectivity => {
		const numDOFs = nodosCoordenadas.length * DOFs;

		// 1. Build Global K
		const K_global = math.matrix(math.zeros(numDOFs, numDOFs, "sparse"));
		connectivity.forEach(element => {
			const { rigidez, vectorX, vectorY } = element;
			if (!rigidez || !vectorX || !vectorY) return;
			const indices = [...vectorX, ...vectorY];
			indices.forEach((row, i) => {
				indices.forEach((col, j) => {
					K_global.set([row, col], (K_global.get([row, col]) || 0) + (rigidez[i][j] || 0));
				});
			});
		});

		// 2. Build Global F (Gravity + Seismic)
		const F_global = math.zeros(numDOFs);

		// --- Seismic Loading Logic (COVENIN 1756) ---
		const nPisos = parseInt(actions.getNoPisos()) || 0;
		const entrePiso = parseFloat(actions.getEntrePiso()) || 0.001; // Avoid div by zero
		const luzVano = parseFloat(actions.getLuzVano()) || 0;
		const nColumnas = parseInt(actions.getNoColumnas()) || 0;

		const cp_losa = parseFloat(actions.getCargaLosaPermanente()) || 0;
		const cv_losa = parseFloat(actions.getCargaLosaVariable()) || 0;
		const cp_techo = parseFloat(actions.getCargaTechoPermanente()) || 0;
		const cv_techo = parseFloat(actions.getCargaTechoVariable()) || 0;

		// Calculate weight per level
		const weightsPerLevel = new Array(nPisos > 0 ? nPisos : 1).fill(0);
		connectivity.forEach(el => {
			if (!el.puntoIni || !el.puntoFin) return;
			const level = Math.round(el.puntoIni[1] / entrePiso);
			const levelFin = Math.round(el.puntoFin[1] / entrePiso);
			const elWeight = parseFloat(el.peso || 0) || 0;

			if (level === levelFin) {
				// Horizontal (Beam)
				if (level > 0 && level <= nPisos) weightsPerLevel[level - 1] += elWeight;
			} else {
				// Vertical (Column/Diagonal)
				if (level < nPisos && level >= 0) weightsPerLevel[level] += elWeight / 2;
				if (levelFin > 0 && levelFin <= nPisos) weightsPerLevel[levelFin - 1] += elWeight / 2;
			}
		});

		// Add Slab Weights (D + 0.25L)
		if (nPisos > 0) {
			const areaTributaria = luzVano * (is3D ? luzVano : 1);
			for (let i = 0; i < nPisos; i++) {
				const cp = i === nPisos - 1 ? cp_techo : cp_losa;
				const cv = i === nPisos - 1 ? cv_techo : cv_losa;
				const nVanos = nColumnas - 1;
				weightsPerLevel[i] += (cp + 0.25 * cv) * areaTributaria * (is3D ? nVanos * nVanos : nVanos);
			}
		}

		const W_total = weightsPerLevel.reduce((a, b) => a + (parseFloat(b) || 0), 0);

		// Spectral Acceleration evaluated at T
		const H = nPisos * entrePiso;
		const T = H > 0 ? 0.08 * Math.pow(H, 0.75) : 0.1; // Fundamental Period estimate

		const ao = parseFloat(store.aceleracionAo) || 0;
		const phi = parseFloat(store.factorCorreccion) || 1;
		const alpha = parseFloat(store.factorImportancia) || 1;
		const beta = parseFloat(store.beta) || 1;
		const tAst = parseFloat(store.tAst) || 1;
		const ro = parseFloat(store.ro) || 1;
		const R = parseFloat(store.factorReduccion) || 1;

		let Saeval = 0;
		if (T < tAst / 4) {
			Saeval = ao * alpha * phi * (1 + (T / Math.max(0.01, tAst / 4)) * (beta - 1));
		} else if (T <= tAst) {
			Saeval = ao * alpha * phi * beta;
		} else {
			Saeval = ao * alpha * phi * beta * Math.pow(tAst / T, ro);
		}

		const V_base = (Saeval * W_total) / (R > 0 ? R : 1);

		// Distribution of lateral forces Fi
		const lateralForces = weightsPerLevel.map((wi, i) => {
			const hi = (i + 1) * entrePiso;
			const numerator = wi * hi;
			const denominator = weightsPerLevel.reduce((acc, wj, j) => acc + wj * (j + 1) * entrePiso, 0);
			return V_base * (denominator > 0 ? numerator / denominator : 1 / (nPisos || 1));
		});

		// Apply horizontal forces (FX) to nodes
		nodosCoordenadas.forEach((coord, n) => {
			if (!coord) return;
			const level = Math.round(coord[1] / entrePiso);
			if (level > 0 && level <= nPisos) {
				const nodesAtLevel = nodosCoordenadas.filter(c => Math.round(c[1] / entrePiso) === level).length;
				if (nodesAtLevel > 0) {
					const forceShare = (lateralForces[level - 1] || 0) / nodesAtLevel;
					F_global.set([n * DOFs], (F_global.get([n * DOFs]) || 0) + forceShare);
				}
			}
		});

		// 3. Add gravity and intern forces
		connectivity.forEach(element => {
			const { fuerzainterna, vectorX, vectorY } = element;
			const indices = [...vectorX, ...vectorY];
			indices.forEach((idx, i) => {
				const f_val = (fuerzainterna && fuerzainterna[i]) || 0;
				F_global.set([idx], F_global.get([idx]) + f_val);
			});
		});

		// 3. Identify Free DOFs (y != 0)
		const freeIndices = [];
		nodosCoordenadas.forEach((coord, n) => {
			const startDOF = n * DOFs;
			if (coord[1] !== 0) {
				// Base nodes fixed
				for (let i = 0; i < DOFs; i++) freeIndices.push(startDOF + i);
			}
		});

		if (freeIndices.length === 0) return null;

		// 4. Reduce System
		const K_reduced = K_global.subset(math.index(freeIndices, freeIndices));
		const F_reduced = F_global.subset(math.index(freeIndices));

		// 5. Solve U
		let U_reduced;
		try {
			U_reduced = math.lusolve(K_reduced, F_reduced);
		} catch (e) {
			return null;
		}

		// 6. Map back to full U
		const U_full = Array(numDOFs).fill(0);
		freeIndices.forEach((idx, i) => {
			U_full[idx] = U_reduced.get([i, 0]);
		});

		// 7. Calculate Story Drifts (Horizontal)
		const drifts = Array(nPisos).fill(0);
		for (let i = 0; i < nPisos; i++) {
			const levelNodes = nodosCoordenadas.filter(c => Math.round(c[1] / entrePiso) === i + 1);
			const prevLevelNodes = nodosCoordenadas.filter(c => Math.round(c[1] / entrePiso) === i);

			const u_i =
				levelNodes.length > 0
					? levelNodes.reduce((acc, c) => {
							const n = nodosCoordenadas.findIndex(nc => nc[0] === c[0] && nc[1] === c[1]);
							return acc + U_full[n * DOFs];
					  }, 0) / levelNodes.length
					: 0;

			const u_prev =
				i === 0
					? 0
					: prevLevelNodes.length > 0
						? prevLevelNodes.reduce((acc, c) => {
								const n = nodosCoordenadas.findIndex(nc => nc[0] === c[0] && nc[1] === c[1]);
								return acc + U_full[n * DOFs];
						  }, 0) / prevLevelNodes.length
						: 0;

			drifts[i] = (u_i - u_prev) / (entrePiso * 100);
		}

		return {
			displacements: U_full,
			globalK: K_global.toArray(),
			seismicData: {
				W_total,
				Sa: Saeval,
				V_base,
				lateralForces,
				drifts
			}
		};
	};

	const evaluateFitness = structure => {
		let totalWeight = 0;
		structure.forEach(el => (totalWeight += parseFloat(el.peso || 0)));

		const result = analyzeStructure(structure);
		if (!result) return 999999; // Penalty for unstable structure
		const { displacements, seismicData } = result;

		// Simple penalty for excess displacement (max 1/500 L)
		let penalty = 0;
		const limit = (actions.getEntrePiso() * actions.getNoPisos()) / 500;
		displacements.forEach(u => {
			if (Math.abs(u) > limit) penalty += (Math.abs(u) - limit) * 10000;
		});

		// Story Drift Penalty (Seismic limit: 0.015)
		if (seismicData && seismicData.drifts) {
			seismicData.drifts.forEach(delta => {
				if (Math.abs(delta) > 0.015) {
					penalty += (Math.abs(delta) - 0.015) * 100000;
				}
			});
		}

		return totalWeight + penalty;
	};

	function addMatricesRigTotal() {
		var vectorMatrizRigT = matrizRigidezTotal;
		var numNodosu = 0;
		numNodosu = (parseInt(actions.getNoPisos()) + 1) * parseInt(actions.getNoColumnas()) * 3;

		var a = "<div className='row justify-content-center'/>";
		a += "<div className='col-6'>";
		a += "<h2>Matriz Rigidez Total";
		a += " =</h2>";
		a += "<table className='table table-bordered col-10' padding='5px'>";
		a += "<thead>";
		a += "<tr>";
		for (var j = 0; j < numNodosu; j++) {
			//console.log("ij", i, j);
			a += "<th/>";
		}
		a += "<tr/>";
		a += "</thead>";
		a += "<tbody>";
		for (var i = 0; i < numNodosu; i++) {
			//console.log("item", item[i]);
			a += "<tr>";
			for (var j = 0; j < numNodosu; j++) {
				//console.log("ij", i, j);
				a += "<td>";
				a += vectorMatrizRigT[i][j];
				a += "  </td>";
			}
			a += "<tr/>";
		}
		a += "</tbody></table><br/></div></div>";
		//a += "<div className='row justify-content-center'/>";
		document.getElementById("matrices-rigid-total").innerHTML += a;
		return a;
	}

	//función para construir vector de fuerzas internas
	vectorFuerzasInternas = [];
	let funcionFuerzasInt = () => {
		let value = 0;
		let vectorFuerzas1 = new Array(
			(parseInt(actions.getNoPisos()) + 1) * parseInt(actions.getNoColumnas()) * 3
		).fill(0);
		//console.log(vectorFuerzas1);
		let barras = codigoGeneticoP;
		//console.log("barras", barras);
		barras.forEach(element => {
			for (var i = 0; i < element["vectorX"].length; i++) {
				value = element["vectorX"][i];
				vectorFuerzas1[value] += element["fuerzainterna"][i];
			}
			for (var j = 0; j < element["vectorY"].length; j++) {
				value = element["vectorY"][j];
				vectorFuerzas1[value] += element["fuerzainterna"][j + 3];
			}
			return vectorFuerzas1;
		});

		//console.log("vector Fuerzas internas funcion", vectorFuerzas1);
		return vectorFuerzas1;
	};

	let funcionFuerzasInt2 = codigoGeneticoP1 => {
		let value = 0;
		let vectorFuerzas1 = new Array(
			(parseInt(actions.getNoPisos()) + 1) * parseInt(actions.getNoColumnas()) * 3
		).fill(0);
		//console.log(vectorFuerzas1);
		let barras = codigoGeneticoP1;
		//console.log("barras", barras);
		barras.forEach(element => {
			for (var i = 0; i < element["vectorX"].length; i++) {
				value = element["vectorX"][i];
				vectorFuerzas1[value] += element["fuerzainterna"][i];
			}
			for (var j = 0; j < element["vectorY"].length; j++) {
				value = element["vectorY"][j];
				vectorFuerzas1[value] += element["fuerzainterna"][j + 3];
			}
			return vectorFuerzas1;
		});

		//console.log("vector Fuerzas internas funcion", vectorFuerzas1);
		return vectorFuerzas1;
	};

	function addVectorFuerza(caso) {
		var vectorFuer = vectorFuerzasInternas;
		var numNodosu = 0;
		numNodosu = (parseInt(actions.getNoPisos()) + 1) * parseInt(actions.getNoColumnas()) * 3;

		var a = "<div className='row justify-content-center'>";
		a += "<h2>Vector de Fuerzas totales caso: " + "'" + caso + "'";
		a += " =</h2>";
		a += "</div>";
		a += "<div className='col-6 justify-content-center' id='vector-fint'>";

		a += "<table className='table table-bordered col-10' padding='5px'>";
		a += "<thead>";
		a += "<tr/>";
		a += "</thead>";
		a += "<tbody>";
		for (var j = 0; j < vectorFuer.length; j++) {
			a += "<tr>";
			a += vectorFuer[j].toFixed(5);
			a += "</tr>";
			a += "<br/>";
		}

		a += "</tbody></table><br/></div>";
		document.getElementById("vector-fuerzas").innerHTML += a;
		return a;
	}

	function deleteRow(arr, row, quantity) {
		arr = arr.slice(0); // make copy
		arr.splice(row - 1, quantity);
		return arr;
	}

	function getCol(matrix, col) {
		//Función para obtener una columna de una matriz (bidimensional)
		var column = [];
		for (var i = 0; i < matrix.length; i++) {
			column.push(matrix[i][col]);
		}
		return column;
	}

	function getRow(matrix, row) {
		//Función para obtener una fila de una matriz (bidimensional), o un valor de un array
		var rows = [];
		rows = matrix.map(function(value, index) {
			return value[row];
		});
		//console.log("rows", rows);
		return rows;
	}

	function getCol2(matrix, col) {
		//Función para obtener una fila de una matriz (bidimensional), o un valor de un array
		var rows = [];
		rows = matrix.map(function(value, index) {
			return value[index][col];
		});
		//console.log("col2", rows);
		return rows;
	}

	let matrizRigidezRedux = [];
	let rigidezReducida = () => {
		let numNodosu = 0;
		var tempy = 0;
		var tempx = 0;
		var stop = 0;
		//console.log(actions.getNoPisos(), actions.getNoColumnas());
		numNodosu = (parseInt(actions.getNoPisos()) + 1) * parseInt(actions.getNoColumnas()) * 3;
		//console.log("No de nodos", numNodosu);
		// for (var a = 0; a < numNodosu; a++) {
		// 	matrizRigidezRedux[a] = new Array(numNodosu).fill(0);
		// 	for (var b = 0; b < numNodosu; b++) {
		// 		matrizRigidezRedux[a][b] = 0;
		// 	}
		// }

		let matrizApoyo = [];
		matrizRigidezRedux = copiarMatriz(matrizRigidezTotal);
		//console.log("matrizRigidezRedux copiada de la total. Length", matrizRigidezRedux.length);

		//hasta este punto funciona la reducción de filas en revisión 29-5-21 6:30pm
		//var filasM_length = filasM.length;
		//console.log("FilasM", filasM);
		//console.log("FilasM length: ", filasM_length);

		//Apartado*********************
		var conx = 0;
		var cony = 0;
		var mem = 0;
		//console.log("Código Genetico P", codigoGeneticoP);
		for (var i = 0; i < matrizRigidezRedux.length; i += 1) {
			matrizApoyo[i] = new Array();
			cony = 0;
			mem = 0;
			//esta no es la manera más óptima, ya que este map debería estar dentro del for

			for (var j = 0; j < matrizRigidezRedux.length; j += 3) {
				//mem += 3;
				//console.log("j", j);
				for (let element of codigoGeneticoP) {
					//console.log("element", element);
					if (
						element.nodoIni[1] != 0 //&
						// (i == element.vectorX[0] ||
						// 	i == element.vectorX[1] ||
						// 	i == element.vectorX[2] ||
						// 	i == element.vectorY[0] ||
						// 	i == element.vectorY[1] ||
						// 	i == element.vectorY[2])
					) {
						if (j == element.vectorX[0] || j == element.vectorY[0]) {
							//console.log("cony,j", cony, j);
							matrizApoyo[conx][cony] = matrizRigidezRedux[i][j];
							matrizApoyo[conx][cony + 1] = matrizRigidezRedux[i][j + 1];
							matrizApoyo[conx][cony + 2] = matrizRigidezRedux[i][j + 2];
							cony += 3;

							break;
						}
					}
				}
				//salto loop interno

				// codigoGeneticoP.forEach(element => {
				// 	if (
				// 		(element.nodoIni[1] != 0) &
				// 		(i == element.vectorX[0] ||
				// 			i == element.vectorX[1] ||
				// 			i == element.vectorX[2] ||
				// 			i == element.vectorY[0] ||
				// 			i == element.vectorY[1] ||
				// 			i == element.vectorY[2])
				// 	) {
				// 		if ((element.nodoIni[1] != 0) & (j == element.vectorX[0] || j == element.vectorY[0])) {
				// 			matrizApoyo[conx][cony] = matrizRigidezRedux[i][j];
				// 			matrizApoyo[conx][cony + 1] = matrizRigidezRedux[i][j + 1];
				// 			matrizApoyo[conx][cony + 2] = matrizRigidezRedux[i][j + 2];
				// 			cony += 3;

				// 			return matrizApoyo;
				// 		}
				// 	}
				// 	//console.log("MatrizApoyo[i][j]", matrizApoyo[conx][cony])
				// 	return matrizApoyo;
				// });
			}
			conx++;
		}
		//console.log("MatrizApoyo", matrizApoyo);
		//hasta este punto devuelve corrctamente los valores pero agrega ciertas listas vacias
		var matrizApoyo2 = [];
		for (var i = 0; i < matrizApoyo.length; i++) {
			if (matrizApoyo[i].length > 0) {
				matrizApoyo2.push(matrizApoyo[i]);
			}
		}
		//console.log("MatrizApoyo2", matrizApoyo2);
		//en este punto obtuve todas las columnas importantes, ahora faltan las filas

		var filasM = [];
		var n = 0;
		for (var i = 0; i < matrizApoyo2.length; i += 3) {
			for (let element of codigoGeneticoP) {
				if (element.nodoIni[1] != 0 && i == element.vectorX[0]) {
					filasM[n] = matrizApoyo2[i];
					filasM[n + 1] = matrizApoyo2[i + 1];
					filasM[n + 2] = matrizApoyo2[i + 2];
					//filasM.push(matrizApoyo2[i]);
					n += 3;
					break;
				}
				if (element.nodoIni[1] != 0 && i == element.vectorY[0]) {
					filasM[n] = matrizApoyo2[i];
					filasM[n + 1] = matrizApoyo2[i + 1];
					filasM[n + 2] = matrizApoyo2[i + 2];
					//filasM.push(matrizApoyo2[i]);
					n += 3;
					break;
				}
				//return filasM;
			}
		}
		//console.log("filasM:", filasM);
		//************************** */
		// var columnasM = [];
		// //console.log("def colM:", columnasM);
		// var k = 0;
		// for (var i = 0; i < filasM.length; i++) {
		// 	codigoGeneticoP.forEach(element => {
		// 		k = 0;
		// 		columnasM[i] = new Array(filasM.length);
		// 		for (var j = 0; j <= filasM[i].length; j += 3) {
		// 			//revisar este for
		// 			//console.log("k: ", k);
		// 			if ((element.nodoIni[1] != 0) & (j == element.vectorX[0] || j == element.vectorY[0])) {
		// 				//console.log("k++: ", k);
		// 				//console.log("filasM ij:", filasM[i][j]);
		// 				columnasM[i][k] = filasM[i][j];
		// 				//console.log("columnasM ij:", columnasM[i][j]);
		// 				columnasM[i][k + 1] = filasM[i][j + 1];
		// 				columnasM[i][k + 2] = filasM[i][j + 2];
		// 				k += 3;
		// 			}
		// 		}
		// 		return columnasM;
		// 	});
		// }

		//console.log("columnasM:", columnasM);
		matrizRigidezRedux = [];
		matrizRigidezRedux = copiarMatriz(filasM);
		//console.log("matrizRigidezRedux", matrizRigidezRedux);

		return matrizRigidezRedux;
	};

	let rigidezReducida2 = codigoGeneticoP1 => {
		let numNodosu = 0;
		var tempy = 0;
		var tempx = 0;
		var stop = 0;
		//console.log(actions.getNoPisos(), actions.getNoColumnas());
		numNodosu = (parseInt(actions.getNoPisos()) + 1) * parseInt(actions.getNoColumnas()) * 3;
		//console.log("No de nodos", numNodosu);
		// for (var a = 0; a < numNodosu; a++) {
		// 	matrizRigidezRedux[a] = new Array(numNodosu).fill(0);
		// 	for (var b = 0; b < numNodosu; b++) {
		// 		matrizRigidezRedux[a][b] = 0;
		// 	}
		// }

		let matrizApoyo = [];
		matrizRigidezRedux = copiarMatriz(matrizRigidezTotal);
		//console.log("matrizRigidezRedux copiada de la total. Length", matrizRigidezRedux.length);

		//hasta este punto funciona la reducción de filas en revisión 29-5-21 6:30pm
		//var filasM_length = filasM.length;
		//console.log("FilasM", filasM);
		//console.log("FilasM length: ", filasM_length);

		//Apartado*********************
		var conx = 0;
		var cony = 0;
		var mem = 0;
		//console.log("Código Genetico P", codigoGeneticoP);
		for (var i = 0; i < matrizRigidezRedux.length; i += 1) {
			matrizApoyo[i] = new Array();
			cony = 0;
			mem = 0;
			//esta no es la manera más óptima, ya que este map debería estar dentro del for

			for (var j = 0; j < matrizRigidezRedux.length; j += 3) {
				//mem += 3;
				//console.log("j", j);
				for (let element of codigoGeneticoP1) {
					//console.log("element", element);
					if (
						element.nodoIni[1] != 0 //&
						// (i == element.vectorX[0] ||
						// 	i == element.vectorX[1] ||
						// 	i == element.vectorX[2] ||
						// 	i == element.vectorY[0] ||
						// 	i == element.vectorY[1] ||
						// 	i == element.vectorY[2])
					) {
						if (j == element.vectorX[0] || j == element.vectorY[0]) {
							//console.log("cony,j", cony, j);
							matrizApoyo[conx][cony] = matrizRigidezRedux[i][j];
							matrizApoyo[conx][cony + 1] = matrizRigidezRedux[i][j + 1];
							matrizApoyo[conx][cony + 2] = matrizRigidezRedux[i][j + 2];
							cony += 3;

							break;
						}
					}
				}
				//salto loop interno

				// codigoGeneticoP.forEach(element => {
				// 	if (
				// 		(element.nodoIni[1] != 0) &
				// 		(i == element.vectorX[0] ||
				// 			i == element.vectorX[1] ||
				// 			i == element.vectorX[2] ||
				// 			i == element.vectorY[0] ||
				// 			i == element.vectorY[1] ||
				// 			i == element.vectorY[2])
				// 	) {
				// 		if ((element.nodoIni[1] != 0) & (j == element.vectorX[0] || j == element.vectorY[0])) {
				// 			matrizApoyo[conx][cony] = matrizRigidezRedux[i][j];
				// 			matrizApoyo[conx][cony + 1] = matrizRigidezRedux[i][j + 1];
				// 			matrizApoyo[conx][cony + 2] = matrizRigidezRedux[i][j + 2];
				// 			cony += 3;

				// 			return matrizApoyo;
				// 		}
				// 	}
				// 	//console.log("MatrizApoyo[i][j]", matrizApoyo[conx][cony])
				// 	return matrizApoyo;
				// });
			}
			conx++;
		}
		//console.log("MatrizApoyo", matrizApoyo);
		//hasta este punto devuelve corrctamente los valores pero agrega ciertas listas vacias
		var matrizApoyo2 = [];
		for (var i = 0; i < matrizApoyo.length; i++) {
			if (matrizApoyo[i].length > 0) {
				matrizApoyo2.push(matrizApoyo[i]);
			}
		}
		//console.log("MatrizApoyo2", matrizApoyo2);
		//en este punto obtuve todas las columnas importantes, ahora faltan las filas

		var filasM = [];
		var n = 0;
		for (var i = 0; i < matrizApoyo2.length; i += 3) {
			for (let element of codigoGeneticoP1) {
				if (element.nodoIni[1] != 0 && i == element.vectorX[0]) {
					filasM[n] = matrizApoyo2[i];
					filasM[n + 1] = matrizApoyo2[i + 1];
					filasM[n + 2] = matrizApoyo2[i + 2];
					//filasM.push(matrizApoyo2[i]);
					n += 3;
					break;
				}
				if (element.nodoIni[1] != 0 && i == element.vectorY[0]) {
					filasM[n] = matrizApoyo2[i];
					filasM[n + 1] = matrizApoyo2[i + 1];
					filasM[n + 2] = matrizApoyo2[i + 2];
					//filasM.push(matrizApoyo2[i]);
					n += 3;
					break;
				}
				//return filasM;
			}
		}
		//console.log("filasM:", filasM);
		//************************** */
		// var columnasM = [];
		// //console.log("def colM:", columnasM);
		// var k = 0;
		// for (var i = 0; i < filasM.length; i++) {
		// 	codigoGeneticoP.forEach(element => {
		// 		k = 0;
		// 		columnasM[i] = new Array(filasM.length);
		// 		for (var j = 0; j <= filasM[i].length; j += 3) {
		// 			//revisar este for
		// 			//console.log("k: ", k);
		// 			if ((element.nodoIni[1] != 0) & (j == element.vectorX[0] || j == element.vectorY[0])) {
		// 				//console.log("k++: ", k);
		// 				//console.log("filasM ij:", filasM[i][j]);
		// 				columnasM[i][k] = filasM[i][j];
		// 				//console.log("columnasM ij:", columnasM[i][j]);
		// 				columnasM[i][k + 1] = filasM[i][j + 1];
		// 				columnasM[i][k + 2] = filasM[i][j + 2];
		// 				k += 3;
		// 			}
		// 		}
		// 		return columnasM;
		// 	});
		// }

		//console.log("columnasM:", columnasM);
		matrizRigidezRedux = [];
		matrizRigidezRedux = copiarMatriz(filasM);
		//console.log("matrizRigidezRedux", matrizRigidezRedux);

		return matrizRigidezRedux;
	};

	function copiarMatriz(arr) {
		var array2 = [];
		// for (var i = 0; i < array1.length; i++) {
		// 	array2 = new Array(array1[i].length);
		// 	for (var j = 0; j < array1[i].length; j++) {
		// 		array2[i][j] = array1[i][j];
		// 	}
		// }
		return arr.map(o => [...o]);
	}

	function addMatricesRigRedux() {
		var vectorMatrizRigT = copiarMatriz(matrizRigidezRedux);
		var numNodosu = 0;
		numNodosu = vectorMatrizRigT.length;
		//console.log("vectorMatrizRigT", vectorMatrizRigT);
		var a = "<div className='row justify-content-center'/>";
		a += "<div className='col-6'>";
		a += "<h2>Matriz Rigidez Reducida";
		a += " =</h2>";
		a += "<table className='table table-bordered col-10' padding='5px'>";
		a += "<thead>";
		a += "<tr>";
		for (var j = 0; j < numNodosu; j++) {
			//console.log("ij", i, j);
			a += "<th/>";
		}
		a += "<tr/>";
		a += "</thead>";
		a += "<tbody>";
		for (var i = 0; i < vectorMatrizRigT.length; i++) {
			//console.log("item", item[i]);
			a += "<tr>";
			for (var j = 0; j < vectorMatrizRigT[i].length; j++) {
				//console.log("ij", i, j);
				a += "<td>";
				a += vectorMatrizRigT[i][j];
				a += "  </td>";
			}
			a += "<tr/>";
		}
		a += "</tbody></table><br/></div></div>";
		//a += "<div className='row justify-content-center'/>";
		document.getElementById("matriz-reducida").innerHTML += a;
		return a;
	}

	var matrizEjemplo = [[1, 2], [-2, 3]]; //inversa de esta matriz: [[3/7,-2/7],[2/7,1/7]]

	let matrizInversa = matriz => {
		var matriz2 = math.matrix(matriz);
		var matrizInv = math.inv(matriz2);
		//console.log("matriz inversa:", matrizInv._data);
		return matrizInv._data;
	};

	var matrizReduxInversa = [];

	function matrizRigidezReduxInversa() {
		var matrix1 = copiarMatriz(matrizRigidezRedux);
		var inversaMatriz = matrizInversa(matrix1);
		return inversaMatriz;
	}

	matrizReducidaInversa = [];

	function addMatricesRigReduxInversa() {
		var vectorMatrizRigT = copiarMatriz(matrizReducidaInversa);
		var numNodosu = 0;
		numNodosu = vectorMatrizRigT.length;
		//console.log("vectorMatrizRigT", vectorMatrizRigT);
		var a = "<div className='row justify-content-center'/>";
		a += "<div className='col-6'>";
		a += "<h2>Inversa Matriz Rigidez Reducida";
		a += " =</h2>";
		a += "<table className='table table-bordered col-10' padding='5px'>";
		a += "<thead>";
		a += "<tr>";
		for (var j = 0; j < numNodosu; j++) {
			//console.log("ij", i, j);
			a += "<th/>";
		}
		a += "<tr/>";
		a += "</thead>";
		a += "<tbody>";
		for (var i = 0; i < vectorMatrizRigT.length; i++) {
			//console.log("item", item[i]);
			a += "<tr>";
			for (var j = 0; j < vectorMatrizRigT[i].length; j++) {
				//console.log("ij", i, j);
				a += "<td>";
				a += vectorMatrizRigT[i][j];
				a += "  </td>";
			}
			a += "<tr/>";
		}
		a += "</tbody></table><br/></div></div>";
		//a += "<div className='row justify-content-center'/>";
		document.getElementById("matriz-reducida-inversa").innerHTML += a;
		return a;
	}

	vectorFuerzasInternasRedux = [];
	function vectorFReducido() {
		var vectorFuerzaReducida = vectorFuerzasInternas;
		var filasN = [];
		//console.log("vector antes de reducir", vectorFuerzaReducida);
		var n = 0;
		for (var i = 0; i < vectorFuerzaReducida.length; i += 3) {
			//console.log(i);
			//console.log(vectorFuerzaReducida[i]);
			for (let element of codigoGeneticoP) {
				//console.log(element);
				if (element.nodoIni[1] != 0 && i == element.vectorX[0]) {
					element["fuerzasGlobales"][0] = vectorFuerzaReducida[i];
					element["fuerzasGlobales"][1] = vectorFuerzaReducida[i + 1];
					element["fuerzasGlobales"][2] = vectorFuerzaReducida[i + 2];
					filasN[n] = vectorFuerzaReducida[i];
					filasN[n + 1] = vectorFuerzaReducida[i + 1];
					filasN[n + 2] = vectorFuerzaReducida[i + 2];
					//filasM.push(matrizApoyo2[i]);
					element["dezplazamientoIndexIni"] = n;
					n += 3;

					//console.log(filasM[n]);
					break;
				}
				if (element.nodoIni[1] != 0 && i == element.vectorY[0]) {
					element["fuerzasGlobales"][3] = vectorFuerzaReducida[i];
					element["fuerzasGlobales"][4] = vectorFuerzaReducida[i + 1];
					element["fuerzasGlobales"][5] = vectorFuerzaReducida[i + 2];
					filasN[n] = vectorFuerzaReducida[i];
					filasN[n + 1] = vectorFuerzaReducida[i + 1];
					filasN[n + 2] = vectorFuerzaReducida[i + 2];
					//filasM.push(matrizApoyo2[i]);
					element["dezplazamientoIndexFin"] = n;
					n += 3;
					//console.log(filasM[n]);
					break;
				}
				//return filasM;
			}
		}
		//console.log("filasN", filasN);
		return filasN;
	}

	function vectorFReducido2(codigoGeneticoP1) {
		var vectorFuerzaReducida = vectorFuerzasInternas;
		var filasN = [];
		//console.log("vector antes de reducir", vectorFuerzaReducida);
		var n = 0;
		for (var i = 0; i < vectorFuerzaReducida.length; i += 3) {
			//console.log(i);
			//console.log(vectorFuerzaReducida[i]);
			for (let element of codigoGeneticoP1) {
				//console.log(element);
				if (element.nodoIni[1] != 0 && i == element.vectorX[0]) {
					element["fuerzasGlobales"][0] = vectorFuerzaReducida[i];
					element["fuerzasGlobales"][1] = vectorFuerzaReducida[i + 1];
					element["fuerzasGlobales"][2] = vectorFuerzaReducida[i + 2];
					filasN[n] = vectorFuerzaReducida[i];
					filasN[n + 1] = vectorFuerzaReducida[i + 1];
					filasN[n + 2] = vectorFuerzaReducida[i + 2];
					//filasM.push(matrizApoyo2[i]);
					element["dezplazamientoIndexIni"] = n;
					n += 3;
					//console.log(filasM[n]);
					break;
				}
				if (element.nodoIni[1] != 0 && i == element.vectorY[0]) {
					element["fuerzasGlobales"][3] = vectorFuerzaReducida[i];
					element["fuerzasGlobales"][4] = vectorFuerzaReducida[i + 1];
					element["fuerzasGlobales"][5] = vectorFuerzaReducida[i + 2];
					filasN[n] = vectorFuerzaReducida[i];
					filasN[n + 1] = vectorFuerzaReducida[i + 1];
					filasN[n + 2] = vectorFuerzaReducida[i + 2];
					//filasM.push(matrizApoyo2[i]);
					element["dezplazamientoIndexFin"] = n;
					n += 3;
					//console.log(filasM[n]);
					break;
				}
				//return filasM;
			}
		}
		//console.log("filasN", filasN);
		return filasN;
	}

	function addVector(vector, idInterno, getElementID, caso) {
		var vectorFuer = vector;
		var numNodosu = 0;
		numNodosu = (parseInt(actions.getNoPisos()) + 1) * parseInt(actions.getNoColumnas()) * 3;

		var a = "<div className='row justify-content-center'>";
		a += "<h2>Vector para la combinación: " + caso;
		a += " =</h2>";
		a += "</div>";
		a += "<div className='col-6 justify-content-center' id='vector-fint-'" + "'" + idInterno + "'" + ">";

		a += "<table className='table table-bordered col-10' padding='5px'>";
		a += "<thead>";
		a += "<tr/>";
		a += "</thead>";
		a += "<tbody>";
		for (var j = 0; j < vectorFuer.length; j++) {
			a += "<tr>";
			a += vectorFuer[j].toFixed(4);
			a += "</tr>";
			a += "<br/>";
		}

		a += "</tbody></table><br/></div>";
		//console.log(vectorFuer);
		document.getElementById(getElementID).innerHTML += a;
		return a;
	}

	vectorDesplazamientos = [];
	function matrizPorVector(matriz, vector) {
		var vectorD = math.matrix(vector);
		var matrizamul = math.matrix(matriz);
		var vectorDespl = math.multiply(matrizamul, vectorD);
		//console.log(vectorDespl._data);
		return vectorDespl._data;
	}

	function desplazamientoEnCodigo(codigoGeneticoP1) {
		var n = 0;
		var flotante = 0;
		var comparation = round(parseFloat(actions.getNoPisos()) * parseFloat(actions.getEntrePiso()), 2);
		for (let element of codigoGeneticoP1) {
			element["desplazamientoNodoIni"][0] = 0;
			element["desplazamientoNodoIni"][1] = 0;
			element["desplazamientoNodoIni"][2] = 0;
			element["desplazamientoNodoIni"][3] = 0;
			element["desplazamientoNodoIni"][4] = 0;
			element["desplazamientoNodoIni"][5] = 0;
			if (element["tipo"] == "Columna") {
				if (element["nodoIni"][1] != 0) {
					//console.log("entra if Columna con desplaz:", vectorDesplazamientos[n]);
					element["desplazamientoNodoIni"][0] = vectorDesplazamientos[n];
					element["desplazamientoNodoIni"][1] = vectorDesplazamientos[n + 1];
					element["desplazamientoNodoIni"][2] = vectorDesplazamientos[n + 2];
					n += 3;
				} else {
					element["desplazamientoNodoIni"][0] = 0;
					element["desplazamientoNodoIni"][1] = 0;
					element["desplazamientoNodoIni"][2] = 0;
				}
				// if ((element["desplazamientoIndexIni"] != undefined) & (element["desplazamientoIndexIni"] == n)) {
				// 	//esta comparación es para el techo
				// 	element["desplazamientoNodoIni"][3] = vectorDesplazamientos[n];
				// 	element["desplazamientoNodoIni"][4] = vectorDesplazamientos[n + 1];
				// 	element["desplazamientoNodoIni"][5] = vectorDesplazamientos[n + 2];
				// 	//n += 3;
				// }
				flotante = element.puntoFin[1];
				flotante = round(parseFloat(flotante), 2);
				if (flotante == comparation) {
					//esta comparación es para el techo
					element["desplazamientoNodoIni"][3] = vectorDesplazamientos[n];
					element["desplazamientoNodoIni"][4] = vectorDesplazamientos[n + 1];
					element["desplazamientoNodoIni"][5] = vectorDesplazamientos[n + 2];
				}
				// if ((element["desplazamientoIndexFin"] != undefined) & (element["desplazamientoIndexFin"] == n)) {
				// 	//esta comparación es para el techo
				// 	element["desplazamientoNodoIni"][3] = vectorDesplazamientos[n];
				// 	element["desplazamientoNodoIni"][4] = vectorDesplazamientos[n + 1];
				// 	element["desplazamientoNodoIni"][5] = vectorDesplazamientos[n + 2];
				// 	n += 3;
				// }
			}
		}
		//En este punto hace un copiado de los desplaz. iniciales de la columna siguiente en los desplaz. iniciales de la columna actual
		for (var i = 0; i < codigoGeneticoP1.length; i++) {
			if (codigoGeneticoP1[i]["tipo"] == "Columna") {
				if (codigoGeneticoP1[i + 1]["tipo"] == "Columna" && codigoGeneticoP1[i + 1]["nodoIni"][1] != 0) {
					codigoGeneticoP1[i]["desplazamientoNodoIni"][3] =
						codigoGeneticoP1[i + 1]["desplazamientoNodoIni"][0];
					codigoGeneticoP1[i]["desplazamientoNodoIni"][4] =
						codigoGeneticoP1[i + 1]["desplazamientoNodoIni"][1];
					codigoGeneticoP1[i]["desplazamientoNodoIni"][5] =
						codigoGeneticoP1[i + 1]["desplazamientoNodoIni"][2];
				}
			}
		}
		//Hasta esta línea se considera finalizado los desplazamientos en columnas

		for (var i = 0; i < codigoGeneticoP1.length; i++) {
			//Desplazamientos en Vigas:
			if (codigoGeneticoP1[i]["tipo"] == "Columna") {
				for (let element of codigoGeneticoP1) {
					//Si los grados de libertad asociados al nodo inicial de la columna coinciden con los
					//grados de libertad asociados al nodo inicial del elemento a evaluar
					if (codigoGeneticoP1[i]["vectorX"][0] == element["vectorX"][0] && element["tipo"] != "Columna") {
						element["desplazamientoNodoIni"][0] = codigoGeneticoP1[i]["desplazamientoNodoIni"][0];
						element["desplazamientoNodoIni"][1] = codigoGeneticoP1[i]["desplazamientoNodoIni"][1];
						element["desplazamientoNodoIni"][2] = codigoGeneticoP1[i]["desplazamientoNodoIni"][2];
					}
				}

				for (let element of codigoGeneticoP1) {
					//Si los grados de libertad asociados al nodo final de la columna coinciden con los
					//grados de libertad asociados al nodo final del elemento a evaluar
					if (codigoGeneticoP1[i]["vectorY"][0] == element["vectorY"][0] && element["tipo"] != "Columna") {
						element["desplazamientoNodoIni"][3] = codigoGeneticoP1[i]["desplazamientoNodoIni"][3];
						element["desplazamientoNodoIni"][4] = codigoGeneticoP1[i]["desplazamientoNodoIni"][4];
						element["desplazamientoNodoIni"][5] = codigoGeneticoP1[i]["desplazamientoNodoIni"][5];
					}
				}
				for (let element of codigoGeneticoP1) {
					//Si los grados de libertad asociados al nodo inicial de la columna coinciden con los
					//grados de libertad asociados al nodo final del elemento a evaluar
					if (codigoGeneticoP1[i]["vectorX"][0] == element["vectorY"][0] && element["tipo"] != "Columna") {
						element["desplazamientoNodoIni"][3] = codigoGeneticoP1[i]["desplazamientoNodoIni"][0];
						element["desplazamientoNodoIni"][4] = codigoGeneticoP1[i]["desplazamientoNodoIni"][1];
						element["desplazamientoNodoIni"][5] = codigoGeneticoP1[i]["desplazamientoNodoIni"][2];
					}
				}
				for (let element of codigoGeneticoP1) {
					//Si los grados de libertad asociados al nodo final de la columna coinciden con los
					//grados de libertad asociados al nodo inicial del elemento a evaluar
					if (codigoGeneticoP1[i]["vectorY"][0] == element["vectorX"][0] && element["tipo"] != "Columna") {
						element["desplazamientoNodoIni"][0] = codigoGeneticoP1[i]["desplazamientoNodoIni"][3];
						element["desplazamientoNodoIni"][1] = codigoGeneticoP1[i]["desplazamientoNodoIni"][4];
						element["desplazamientoNodoIni"][2] = codigoGeneticoP1[i]["desplazamientoNodoIni"][5];
					}
				}
			}
		}
		return codigoGeneticoP1;
	}

	function calculosFinales(cW, CV, CP, codigoGeneticoP1) {
		//var codigoGeneticoP2 = JSON.parse( JSON.stringify( codigoGeneticoP1 ) );
		var multiplicacionM = [];
		var multiplicacionM2 = [];
		var matrizL = [];
		var cargaPerm = parseFloat(CP);
		var cargaVar = parseFloat(CV);
		var cargaAcc = parseFloat(cW);
		var n = 0;
		var p = 0;
		var puntuacion = 0;
		var lp = 0;
		var lr = 0;
		var momentoPlastico = 0;
		var esbeltezx = 0;
		var esbeltezy = 0;
		var esfuerzoEfectivo = 0;
		var esfuerzoCritico = 0;
		var resistenciaNominal = 0;
		var resultado = 0;
		var peso = 0;
		var contarDiagonales = 0;
		desplazamientoEnCodigo(codigoGeneticoP1);
		var codigoGeneticoP2 = JSON.parse(JSON.stringify(codigoGeneticoP1));
		for (let element of codigoGeneticoP1) {
			multiplicacionM = [];
			puntuacion = 0;
			n = 0;
			matrizL = [
				[+element.cos, +element.sin, 0, 0, 0, 0],
				[-element.sin, +element.cos, 0, 0, 0, 0],
				[0, 0, 1, 0, 0, 0],
				[0, 0, 0, +element.cos, +element.sin, 0],
				[0, 0, 0, -element.sin, +element.cos, 0],
				[0, 0, 0, 0, 0, 1]
			];
			multiplicacionM = multiplicarMatrices(element.rigidez, matrizL);
			//console.log("multiplicacionM", multiplicacionM);
			//multiplicacionM2 = matrizPorVector(multiplicacionM,element.desplazamientoNodoIni);
			//console.log("antes de verificación de matriz por vector", multiplicacionM, element.desplazamientoNodoIni);

			// if (element["desplazamientoNodoIni"].length == 3) {
			// 	//console.log("es true", element.desplazamientoNodoIni);
			// 	//desplazamientoEnCodigo(codigoGeneticoP1);
			// }
			element["esfuerzosInternos"] = matrizPorVector(multiplicacionM, element.desplazamientoNodoIni);
			//desplazamientosFinales(codigoGeneticoP1);
			//cálculo de reacciones externas
			if (element.nodoIni[1] != 0) {
				element["reaccionExterna"] = [0, 0, 0, 0, 0, 0];
			} else {
				n = 0;
				p = 0;
				multiplicacionM2 = [
					[
						matrizRigidezTotal[element.vectorX[0]][element.vectorX[0]],
						matrizRigidezTotal[element.vectorX[0]][element.vectorX[1]],
						matrizRigidezTotal[element.vectorX[0]][element.vectorX[2]],
						matrizRigidezTotal[element.vectorX[0]][element.vectorY[0]],
						matrizRigidezTotal[element.vectorX[0]][element.vectorY[1]],
						matrizRigidezTotal[element.vectorX[0]][element.vectorY[2]]
					],
					[
						matrizRigidezTotal[element.vectorX[1]][element.vectorX[0]],
						matrizRigidezTotal[element.vectorX[1]][element.vectorX[1]],
						matrizRigidezTotal[element.vectorX[1]][element.vectorX[2]],
						matrizRigidezTotal[element.vectorX[1]][element.vectorY[0]],
						matrizRigidezTotal[element.vectorX[1]][element.vectorY[1]],
						matrizRigidezTotal[element.vectorX[1]][element.vectorY[2]]
					],
					[
						matrizRigidezTotal[element.vectorX[2]][element.vectorX[0]],
						matrizRigidezTotal[element.vectorX[2]][element.vectorX[1]],
						matrizRigidezTotal[element.vectorX[2]][element.vectorX[2]],
						matrizRigidezTotal[element.vectorX[2]][element.vectorY[0]],
						matrizRigidezTotal[element.vectorX[2]][element.vectorY[1]],
						matrizRigidezTotal[element.vectorX[2]][element.vectorY[2]]
					],
					[
						matrizRigidezTotal[element.vectorY[0]][element.vectorX[0]],
						matrizRigidezTotal[element.vectorY[0]][element.vectorX[1]],
						matrizRigidezTotal[element.vectorY[0]][element.vectorX[2]],
						matrizRigidezTotal[element.vectorY[0]][element.vectorY[0]],
						matrizRigidezTotal[element.vectorY[0]][element.vectorY[1]],
						matrizRigidezTotal[element.vectorY[0]][element.vectorY[2]]
					],
					[
						matrizRigidezTotal[element.vectorY[1]][element.vectorX[0]],
						matrizRigidezTotal[element.vectorY[1]][element.vectorX[1]],
						matrizRigidezTotal[element.vectorY[1]][element.vectorX[2]],
						matrizRigidezTotal[element.vectorY[1]][element.vectorY[0]],
						matrizRigidezTotal[element.vectorY[1]][element.vectorY[1]],
						matrizRigidezTotal[element.vectorY[1]][element.vectorY[2]]
					],
					[
						matrizRigidezTotal[element.vectorY[2]][element.vectorX[0]],
						matrizRigidezTotal[element.vectorY[2]][element.vectorX[1]],
						matrizRigidezTotal[element.vectorY[2]][element.vectorX[2]],
						matrizRigidezTotal[element.vectorY[2]][element.vectorY[0]],
						matrizRigidezTotal[element.vectorY[2]][element.vectorY[1]],
						matrizRigidezTotal[element.vectorY[2]][element.vectorY[2]]
					]
				];
				element["reaccionExterna"] = matrizPorVector(multiplicacionM2, element.desplazamientoNodoIni);
			}
			//falta agregar derivas, condiciones
			peso += parseFloat(element.peso);
			var temp = 2;
			//Derivas
			if (element["tipo"] == "Columna") {
				//el elemento
				element["deriva"] = (element["desplazamientoNodoIni"][3] - element["desplazamientoNodoIni"][0]).toFixed(
					3
				);
				if (Math.abs(element.deriva / parseFloat(100 * actions.getEntrePiso())) != 0.012) {
					//para el grupo A debe ser menor a 0.012 según 1756-01 tabla 10.1
					temp = 2 / (1 - (0.012 - Math.abs(element.deriva) / parseFloat(100 * actions.getEntrePiso())));
					if (temp > 2) {
						puntuacion += (20 * parseFloat(actions.getNoPisos()) * parseFloat(actions.getNoColumnas())) / 2;
					} else {
						puntuacion += temp;
					}
				}
			} else {
				element["deriva"] = 0;
			}

			if (element["tipo"] == "Columna") {
				//el elemento
				if (Math.abs(element.deriva / parseFloat(100 * actions.getEntrePiso())) <= 0.012) {
					//para el grupo A debe ser menor a 0.012 según 1756-01 tabla 10.1
					element["derivaChequeo"] = "Cumple";
					puntuacion += 7;
				} else {
					element["derivaChequeo"] = "No Cumple";
					puntuacion += -7;
				}
			}

			if (element["tipo"] != "Diagonal") {
				//evaluación del ala flexión

				element["alaλ"] = element.bf / element.tf;
				if (element["alaλ"] <= limiteCompactoIAla) {
					element["alaλOk"] = "Compacta";
					puntuacion += 1;
				} else {
					contarDiagonales++;
					//n--;
					if (element["alaλ"] <= limiteNoCompactoIAla) {
						element["alaλOk"] = "No Compacta";
						//puntuacion += 4 * n;
					}
				}

				//evaluación del alma flexión
				element["almaλ"] = element.dmm / element.tw;
				if (element["almaλ"] < limiteCompactoIAlma) {
					element["almaλOk"] = "Compacta";
					puntuacion += 1;
				} else {
					element["almaλOk"] = "No Compacta";
				}
				//hay que analizar flexión del eje fuerte y eje débil
				lp = (1.78 * element.ry * Math.sqrt(2100000 / 4200)) / 100;
				momentoPlastico = (element.zx * 4200) / 100;
				if (element["almaλ"] < lp) {
					element["mny"] = momentoPlastico;
					//puntuacion+=10;
				} else {
					element["mny"] =
						2.38 *
						(momentoPlastico - (0, 7 * 4200 * element.sx * ((element.longitud - lp) / (1 - lp))) / 100);
				}
				element["mnx"] = (4200 * element.zy) / 100;
				if (element["esfuerzosInternos"][2] < 0) {
					lp = element["esfuerzosInternos"][2] * -1;
				} else {
					lp = element["esfuerzosInternos"][2];
				}
				if (lp / (0.9 * element["mny"]) <= 1) {
					element["almaλMnOk"] = "Cumple";
					puntuacion += 1;
				}

				//chequeo pandeo del alma por corte
				if (element["esfuerzosInternos"][1] < 0) {
					lp = element["esfuerzosInternos"][1] * -1;
				} else {
					lp = element["esfuerzosInternos"][1];
				}
				if (lp < (0.6 * element.dmm * element.tw) / 100) {
					element["pandeoAlmaCorte"] = "Cumple";
					puntuacion += 1;
				} else {
					element["pandeoAlmaCorte"] = "Rigidizar Alma";
				}
			}

			//evaluación por compresión es distinta en ángulos y perfiles I
			if (element["esfuerzosInternos"][0] < 0) {
				lp = element["esfuerzosInternos"][0] * -1;
			} else {
				lp = element["esfuerzosInternos"][0];
			}
			//chequeo del ala

			lr = element.bf / element.tf;
			if (element["tipo"] == "Diagonal") {
				n++;
				if (lr <= 0.44 * Math.sqrt(2100000 / 4200)) {
					element["alaCompresion"] = "Cumple";
					puntuacion += 1;
				} else {
					element["alaCompresion"] = "No Cumple";
					//puntuacion += 1 * n;
				}
			} else {
				if (lr <= 0.56 * Math.sqrt(2100000 / 4200)) {
					element["alaCompresion"] = "Cumple";
					puntuacion += 2;
				} else {
					element["alaCompresion"] = "No Cumple";
				}
			}
			//chequeo del alma
			lr = element.dmm / element.tw;
			if (element["tipo"] == "Diagonal") {
				if (lr <= 0.44 * Math.sqrt(2100000 / 4200)) {
					element["almaCompresion"] = "Cumple";
					puntuacion += 1;
				} else {
					element["almaCompresion"] = "No Cumple";
					//puntuacion += 1 * n;
				}
			} else {
				if (lr <= 1.49 * Math.sqrt(2100000 / 4200)) {
					element["almaCompresion"] = "Cumple";
					puntuacion += 2;
				} else {
					element["almaCompresion"] = "No Cumple";
				}
			}
			//chequeo esbeltez global
			esbeltezx = (element.longitud * 100) / element.rx;
			esbeltezy = (element.longitud * 100) / element.ry;
			esfuerzoEfectivo = (Math.pow(Math.PI, 2) * 2100000) / Math.pow(Math.max(esbeltezx, esbeltezy), 2);
			if (Math.max(esbeltezy, esbeltezx) >= 4.71 * Math.sqrt(2100000 / 4200)) {
				element["pandeoCompresion"] = "Pandeo Elástico";
				esfuerzoCritico = 0.877 * esfuerzoEfectivo;
			} else {
				element["pandeoCompresion"] = "Pandeo Inelástico";
				esfuerzoCritico = 4200 * Math.pow(0.658, 4200 / esfuerzoEfectivo);
				puntuacion += 1;
			}
			resistenciaNominal = element.area * esfuerzoCritico;
			if (resistenciaNominal * 0.9 >= lp) {
				element["chequeoCompresion"] = "Cumple";
				puntuacion += 1;
			} else {
				element["chequeoCompresion"] = "No Cumple";
			}
			//console.log("puntuación", puntuacion + 1 / element.peso);

			//Puntuación del peso del elemento
			if (element["tipo"] == "Diagonal") {
				//console.log("puntuación", puntuacion);
				if (element["peso"] - (6.08 * element["longitud"]).toFixed(2) != 0) {
					temp = (1 / (element["peso"] - 6.08 * element["longitud"])) * element["peso"];
					if (temp > 1) {
						element["puntuacion"] = puntuacion + 1;
					} else {
						element["puntuacion"] = puntuacion + temp;
					}
				} else {
					element["puntuacion"] = puntuacion + 1;
				}
			} else {
				//console.log("puntuación", puntuacion);
				if (element["peso"] - (6.1 * element["longitud"]).toFixed(2) != 0) {
					temp = puntuacion + (1 / (element["peso"] - 6.1 * element["longitud"])) * element["peso"];
					if (temp > 1) {
						element["puntuacion"] = puntuacion + 1;
					} else {
						element["puntuacion"] = puntuacion + temp;
					}
				} else {
					element["puntuacion"] = puntuacion + 1;
				}
			}

			//guarda el valor de la puntuación del elemento es una variable acumulativa temporal
			resultado += element["puntuacion"];
		}
		if (contarDiagonales % 2 == 0) {
			codigoGeneticoP1[0]["puntuacion"] += 5;
		}
		for (var i = 0; i < codigoGeneticoP1.length; i++) {
			//guardar los desplazamientos de cada caso
			if (cargaPerm === 1.4) {
				//console.log("entra en datosCombo1");
				codigoGeneticoP1[i]["derivaCombo1"] = codigoGeneticoP1[i]["deriva"];
				codigoGeneticoP1[i]["esfuerzosInternosCombo1"] = codigoGeneticoP1[i]["esfuerzosInternos"];
				codigoGeneticoP1[i]["reaccionExternaCombo1"] = codigoGeneticoP1[i]["reaccionExterna"];
				codigoGeneticoP1[i]["desplazamientoNodoIniCombo1"] = codigoGeneticoP2[i]["desplazamientoNodoIni"];
				codigoGeneticoP1[i]["puntuacionCombo1"] = codigoGeneticoP1[i]["puntuacion"];
				codigoGeneticoP1[i]["derivaChequeoCombo1"] = codigoGeneticoP1[i]["derivaChequeo"];
				codigoGeneticoP1[i]["alaλOkCombo1"] = codigoGeneticoP1[i]["alaλOk"];
				codigoGeneticoP1[i]["almaλOkCombo1"] = codigoGeneticoP1[i]["almaλOk"];
				codigoGeneticoP1[i]["almaλMnOkCombo1"] = codigoGeneticoP1[i]["almaλMnOk"];
				codigoGeneticoP1[i]["pandeoAlmaCorteCombo1"] = codigoGeneticoP1[i]["pandeoAlmaCorte"];
				codigoGeneticoP1[i]["alaCompresionCombo1"] = codigoGeneticoP1[i]["alaCompresion"];
				codigoGeneticoP1[i]["almaCompresionCombo1"] = codigoGeneticoP1[i]["almaCompresion"];
				codigoGeneticoP1[i]["pandeoCompresionCombo1"] = codigoGeneticoP1[i]["pandeoCompresion"];
				codigoGeneticoP1[i]["chequeoCompresionCombo1"] = codigoGeneticoP1[i]["chequeoCompresion"];
				//return element;
			}

			if (cargaPerm === 1.2 && cargaVar === 1.6 && cargaAcc === 0.0) {
				//console.log("entra en datosCombo2");
				codigoGeneticoP1[i]["derivaCombo2"] = codigoGeneticoP1[i]["deriva"];
				codigoGeneticoP1[i]["esfuerzosInternosCombo2"] = codigoGeneticoP1[i]["esfuerzosInternos"];
				codigoGeneticoP1[i]["reaccionExternaCombo2"] = codigoGeneticoP1[i]["reaccionExterna"];
				codigoGeneticoP1[i]["desplazamientoNodoIniCombo2"] = codigoGeneticoP2[i]["desplazamientoNodoIni"];
				codigoGeneticoP1[i]["puntuacionCombo2"] = codigoGeneticoP1[i]["puntuacion"];
				codigoGeneticoP1[i]["derivaChequeoCombo2"] = codigoGeneticoP1[i]["derivaChequeo"];
				codigoGeneticoP1[i]["alaλOkCombo2"] = codigoGeneticoP1[i]["alaλOk"];
				codigoGeneticoP1[i]["almaλOkCombo2"] = codigoGeneticoP1[i]["almaλOk"];
				codigoGeneticoP1[i]["almaλMnOkCombo2"] = codigoGeneticoP1[i]["almaλMnOk"];
				codigoGeneticoP1[i]["pandeoAlmaCorteCombo2"] = codigoGeneticoP1[i]["pandeoAlmaCorte"];
				codigoGeneticoP1[i]["alaCompresionCombo2"] = codigoGeneticoP1[i]["alaCompresion"];
				codigoGeneticoP1[i]["almaCompresionCombo2"] = codigoGeneticoP1[i]["almaCompresion"];
				codigoGeneticoP1[i]["pandeoCompresionCombo2"] = codigoGeneticoP1[i]["pandeoCompresion"];
				codigoGeneticoP1[i]["chequeoCompresionCombo2"] = codigoGeneticoP1[i]["chequeoCompresion"];
				//return element;
			}

			if (cargaAcc === 1.275) {
				//console.log("entra en datosCombo3");
				codigoGeneticoP1[i]["derivaCombo3"] = codigoGeneticoP1[i]["deriva"];
				codigoGeneticoP1[i]["esfuerzosInternosCombo3"] = codigoGeneticoP1[i]["esfuerzosInternos"];
				codigoGeneticoP1[i]["reaccionExternaCombo3"] = codigoGeneticoP1[i]["reaccionExterna"];
				codigoGeneticoP1[i]["desplazamientoNodoIniCombo3"] = codigoGeneticoP2[i]["desplazamientoNodoIni"];
				codigoGeneticoP1[i]["puntuacionCombo3"] = codigoGeneticoP1[i]["puntuacion"];
				codigoGeneticoP1[i]["derivaChequeoCombo3"] = codigoGeneticoP1[i]["derivaChequeo"];
				codigoGeneticoP1[i]["alaλOkCombo3"] = codigoGeneticoP1[i]["alaλOk"];
				codigoGeneticoP1[i]["almaλOkCombo3"] = codigoGeneticoP1[i]["almaλOk"];
				codigoGeneticoP1[i]["almaλMnOkCombo3"] = codigoGeneticoP1[i]["almaλMnOk"];
				codigoGeneticoP1[i]["pandeoAlmaCorteCombo3"] = codigoGeneticoP1[i]["pandeoAlmaCorte"];
				codigoGeneticoP1[i]["alaCompresionCombo3"] = codigoGeneticoP1[i]["alaCompresion"];
				codigoGeneticoP1[i]["almaCompresionCombo3"] = codigoGeneticoP1[i]["almaCompresion"];
				codigoGeneticoP1[i]["pandeoCompresionCombo3"] = codigoGeneticoP1[i]["pandeoCompresion"];
				codigoGeneticoP1[i]["chequeoCompresionCombo3"] = codigoGeneticoP1[i]["chequeoCompresion"];
				//return element;
			}

			if (cargaAcc === -1.275) {
				//console.log("entra en datosCombo4");
				codigoGeneticoP1[i]["derivaCombo4"] = codigoGeneticoP1[i]["deriva"];
				codigoGeneticoP1[i]["esfuerzosInternosCombo4"] = codigoGeneticoP1[i]["esfuerzosInternos"];
				codigoGeneticoP1[i]["reaccionExternaCombo4"] = codigoGeneticoP1[i]["reaccionExterna"];
				codigoGeneticoP1[i]["desplazamientoNodoIniCombo4"] = codigoGeneticoP2[i]["desplazamientoNodoIni"];
				codigoGeneticoP1[i]["puntuacionCombo4"] = codigoGeneticoP1[i]["puntuacion"];
				codigoGeneticoP1[i]["derivaChequeoCombo4"] = codigoGeneticoP1[i]["derivaChequeo"];
				codigoGeneticoP1[i]["alaλOkCombo4"] = codigoGeneticoP1[i]["alaλOk"];
				codigoGeneticoP1[i]["almaλOkCombo4"] = codigoGeneticoP1[i]["almaλOk"];
				codigoGeneticoP1[i]["almaλMnOkCombo4"] = codigoGeneticoP1[i]["almaλMnOk"];
				codigoGeneticoP1[i]["pandeoAlmaCorteCombo4"] = codigoGeneticoP1[i]["pandeoAlmaCorte"];
				codigoGeneticoP1[i]["alaCompresionCombo4"] = codigoGeneticoP1[i]["alaCompresion"];
				codigoGeneticoP1[i]["almaCompresionCombo4"] = codigoGeneticoP1[i]["almaCompresion"];
				codigoGeneticoP1[i]["pandeoCompresionCombo4"] = codigoGeneticoP1[i]["pandeoCompresion"];
				codigoGeneticoP1[i]["chequeoCompresionCombo4"] = codigoGeneticoP1[i]["chequeoCompresion"];
				//return element;
			}

			if (cargaAcc === 1.0) {
				//console.log("entra en datosCombo5");
				codigoGeneticoP1[i]["derivaComboLateral"] = codigoGeneticoP1[i]["deriva"];
				codigoGeneticoP1[i]["esfuerzosInternosComboLateral"] = codigoGeneticoP1[i]["esfuerzosInternos"];
				codigoGeneticoP1[i]["reaccionExternaComboLateral"] = codigoGeneticoP1[i]["reaccionExterna"];
				codigoGeneticoP1[i]["desplazamientoNodoIniComboLateral"] = codigoGeneticoP2[i]["desplazamientoNodoIni"];
				codigoGeneticoP1[i]["puntuacionComboLateral"] = codigoGeneticoP1[i]["puntuacion"];
				codigoGeneticoP1[i]["derivaChequeoComboLateral"] = codigoGeneticoP1[i]["derivaChequeo"];
				codigoGeneticoP1[i]["alaλOkComboLateral"] = codigoGeneticoP1[i]["alaλOk"];
				codigoGeneticoP1[i]["almaλOkComboLateral"] = codigoGeneticoP1[i]["almaλOk"];
				codigoGeneticoP1[i]["almaλMnOkComboLateral"] = codigoGeneticoP1[i]["almaλMnOk"];
				codigoGeneticoP1[i]["pandeoAlmaCorteComboLateral"] = codigoGeneticoP1[i]["pandeoAlmaCorte"];
				codigoGeneticoP1[i]["alaCompresionComboLateral"] = codigoGeneticoP1[i]["alaCompresion"];
				codigoGeneticoP1[i]["almaCompresionComboLateral"] = codigoGeneticoP1[i]["almaCompresion"];
				codigoGeneticoP1[i]["pandeoCompresionComboLateral"] = codigoGeneticoP1[i]["pandeoCompresion"];
				codigoGeneticoP1[i]["chequeoCompresionComboLateral"] = codigoGeneticoP1[i]["chequeoCompresion"];
				//return element;
			}

			if (cargaAcc == 10) {
				//console.log("entra en datosCombo5");
				codigoGeneticoP1[i]["derivaComboSismop"] = codigoGeneticoP1[i]["deriva"];
				codigoGeneticoP1[i]["esfuerzosInternosComboSismop"] = codigoGeneticoP1[i]["esfuerzosInternos"];
				codigoGeneticoP1[i]["reaccionExternaComboSismop"] = codigoGeneticoP1[i]["reaccionExterna"];
				codigoGeneticoP1[i]["desplazamientoNodoIniComboSismop"] = codigoGeneticoP2[i]["desplazamientoNodoIni"];
				codigoGeneticoP1[i]["puntuacionComboSismop"] = codigoGeneticoP1[i]["puntuacion"];
				codigoGeneticoP1[i]["derivaChequeoComboSismop"] = codigoGeneticoP1[i]["derivaChequeo"];
				codigoGeneticoP1[i]["alaλOkComboSismop"] = codigoGeneticoP1[i]["alaλOk"];
				codigoGeneticoP1[i]["almaλOkComboSismop"] = codigoGeneticoP1[i]["almaλOk"];
				codigoGeneticoP1[i]["almaλMnOkComboSismop"] = codigoGeneticoP1[i]["almaλMnOk"];
				codigoGeneticoP1[i]["pandeoAlmaCorteComboSismop"] = codigoGeneticoP1[i]["pandeoAlmaCorte"];
				codigoGeneticoP1[i]["alaCompresionComboSismop"] = codigoGeneticoP1[i]["alaCompresion"];
				codigoGeneticoP1[i]["almaCompresionComboSismop"] = codigoGeneticoP1[i]["almaCompresion"];
				codigoGeneticoP1[i]["pandeoCompresionComboSismop"] = codigoGeneticoP1[i]["pandeoCompresion"];
				codigoGeneticoP1[i]["chequeoCompresionComboSismop"] = codigoGeneticoP1[i]["chequeoCompresion"];
				//return element;
			}
			if (cargaAcc == -10) {
				//console.log("entra en datosCombo5");
				codigoGeneticoP1[i]["derivaComboSismon"] = codigoGeneticoP1[i]["deriva"];
				codigoGeneticoP1[i]["esfuerzosInternosComboSismon"] = codigoGeneticoP1[i]["esfuerzosInternos"];
				codigoGeneticoP1[i]["reaccionExternaComboSismon"] = codigoGeneticoP1[i]["reaccionExterna"];
				codigoGeneticoP1[i]["desplazamientoNodoIniComboSismon"] = codigoGeneticoP2[i]["desplazamientoNodoIni"];
				codigoGeneticoP1[i]["puntuacionComboSismon"] = codigoGeneticoP1[i]["puntuacion"];
				codigoGeneticoP1[i]["derivaChequeoComboSismon"] = codigoGeneticoP1[i]["derivaChequeo"];
				codigoGeneticoP1[i]["alaλOkComboSismon"] = codigoGeneticoP1[i]["alaλOk"];
				codigoGeneticoP1[i]["almaλOkComboSismon"] = codigoGeneticoP1[i]["almaλOk"];
				codigoGeneticoP1[i]["almaλMnOkComboSismon"] = codigoGeneticoP1[i]["almaλMnOk"];
				codigoGeneticoP1[i]["pandeoAlmaCorteComboSismon"] = codigoGeneticoP1[i]["pandeoAlmaCorte"];
				codigoGeneticoP1[i]["alaCompresionComboSismon"] = codigoGeneticoP1[i]["alaCompresion"];
				codigoGeneticoP1[i]["almaCompresionComboSismon"] = codigoGeneticoP1[i]["almaCompresion"];
				codigoGeneticoP1[i]["pandeoCompresionComboSismon"] = codigoGeneticoP1[i]["pandeoCompresion"];
				codigoGeneticoP1[i]["chequeoCompresionComboSismon"] = codigoGeneticoP1[i]["chequeoCompresion"];
				//return element;
			}
		}
		codigoGeneticoP1[0]["resultadoFinal"] = (resultado / codigoGeneticoP1.length).toFixed(3);
		if (cargaPerm === 1.4) {
			codigoGeneticoP1[0]["resultadoCombo1"] = codigoGeneticoP1[0]["resultadoFinal"];
		}
		if (cargaPerm === 1.2 && cargaVar === 1.6 && cargaAcc === 0.0) {
			codigoGeneticoP1[0]["resultadoCombo2"] = codigoGeneticoP1[0]["resultadoFinal"];
		}
		if (cargaAcc === 1.275) {
			codigoGeneticoP1[0]["resultadoCombo3"] = codigoGeneticoP1[0]["resultadoFinal"];
		}
		if (cargaAcc === -1.275) {
			codigoGeneticoP1[0]["resultadoCombo4"] = codigoGeneticoP1[0]["resultadoFinal"];
		}
		if (cargaAcc == 10) {
			codigoGeneticoP1[0]["resultadoComboSismop"] = codigoGeneticoP1[0]["resultadoFinal"];
		}
		if (cargaAcc == -10) {
			codigoGeneticoP1[0]["resultadoComboSismon"] = codigoGeneticoP1[0]["resultadoFinal"];
		}
		//evaluación del codigo genético de genera correctamente después de correr los casos de carga
		clon2 = codigoGeneticoP1.slice();
		codigoGeneticoP1[0]["evaluacionCodigoGenetico"] =
			parseFloat(clon2[0]["resultadoCombo1"]) +
			parseFloat(clon2[0]["resultadoCombo2"]) +
			parseFloat(clon2[0]["resultadoCombo3"]) +
			parseFloat(clon2[0]["resultadoCombo4"]) +
			parseFloat(clon2[0]["resultadoComboSismop"]) * 1.1 +
			parseFloat(clon2[0]["resultadoComboSismon"]) * 1.1;
		//parseFloat(codigoGeneticoP1[0]["resultadoComboLateral"]);
		//console.log(codigoGeneticoP1);
		clon2 = [];
		codigoGeneticoP1[0]["pesoEstructura"] = peso;
		return codigoGeneticoP1;
	}

	var estructurasLista = [];
	function listaEstructuras(codigoGen) {
		var clon15 = codigoGen.slice();
		listaEstructuraPush(clon15);

		//console.log("lista de Estructuras", estructurasLista);
		return estructurasLista;
	}
	function dynamicSort(property) {
		var sortOrder = 1;
		if (property[0] === "-") {
			sortOrder = -1;
			property = property.substr(1);
		}
		return function(a, b) {
			/* next line works with strings and numbers, 
			 * and you may want to customize it to your needs
			 */
			var result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
			return result * sortOrder;
		};
	}
	var desplazamientosFinalesLista = [];

	function listaEstructuraPush(codigoGen) {
		//estructurasLista.push(codigoGen);
		var provisoria = estructurasLista.slice();
		var copy = codigoGen.slice();
		provisoria.push(copy);
		estructurasLista = [];
		estructurasLista = provisoria.slice();
		//console.log("lista de Estructuras", estructurasLista);
		return estructurasLista;
	}
	var mejor = 0;
	function listaOrden() {
		// if (estabilidadPuntuacion != null) {
		// 	var mejor = mejorPuntaje(estabilidadPuntuacion);
		// } else {
		// 	mejor = 0;
		// }
		var provi = estructurasLista.sort(function(a, b) {
			return parseFloat(b[0].evaluacionCodigoGenetico) - parseFloat(a[0].evaluacionCodigoGenetico);
		});
		if (reserva == null || reserva == undefined) {
			reserva = provi[0].slice();
		}

		if (mejor < provi[0][0].evaluacionCodigoGenetico) {
			//reserva = [];
			reserva = provi[0].slice();
			//console.log("reserva", reserva);
		}

		//estructurasLista.sort();
		//estructurasLista = [];
		if (provi.length > 2 * poblacionIni) {
			estructurasLista = provi.slice(0, 2 * poblacionIni);
		}
		estructurasLista = provi.slice();

		//console.log("lista de Estructuras", estructurasLista);
		return estructurasLista;
	}

	function mejorPuntaje(listaPuntos) {
		var listaje = listaPuntos.sort(function(a, b) {
			return parseFloat(b) - parseFloat(a);
		});
		return listaje[0];
	}

	function cruceGenetico1(primeroLista, segundoLista) {
		let cruce1 = [];
		let cruce2 = [];
		var cod1 = primeroLista.slice();
		var cod2 = segundoLista.slice();
		let listaCruce = [];
		if (segundoLista.length > 1) {
			var cantidadCol = parseInt(actions.getNoColumnas()) * parseInt(actions.getNoPisos());

			var mediaCol = Math.floor(cantidadCol / 2);

			var cantidadVig = (parseInt(actions.getNoColumnas()) - 1) * parseInt(actions.getNoPisos());
			var mediaVig = Math.floor(cantidadVig / 2);

			for (var i = 0; i < mediaCol; i++) {
				//primer cruce
				cruce1.push(cod1[i]);
				//segundo cruce
				cruce2.push(cod2[i]);
			}
			for (var i = mediaCol; i < cantidadCol; i++) {
				cruce1.push(cod2[i]); //primer cruce
				cruce2.push(cod1[i]); //segundo cruce
			}
			for (var i = cantidadCol; i < cantidadCol + mediaVig; i++) {
				cruce1.push(cod1[i]); //primer cruce
				cruce2.push(cod2[i]); //segundo cruce
			}
			for (var i = cantidadCol + mediaVig; i < cantidadCol + cantidadVig; i++) {
				cruce1.push(cod2[i]); //primer cruce
				cruce2.push(cod1[i]); //segundo cruce
			}
			for (var i = cantidadCol + cantidadVig; i < primeroLista.length; i++) {
				cruce1.push(cod1[i]); //primer cruce
			}

			for (var i = cantidadCol + cantidadVig; i < segundoLista.length; i++) {
				cruce2.push(cod2[i]); //segundo cruce:
			}

			listaCruce.push(cruce1);
			listaCruce.push(cruce2);
		}
		return listaCruce;
	}

	function cruceGenetico2(primeroLista, segundoLista) {
		let cruce1 = [];
		let cruce2 = [];
		var cod1 = primeroLista.slice();
		var cod2 = segundoLista.slice();
		let listaCruce = [];
		var numAleatorio = 0;
		var codigoCorto = Math.min(cod1.length, cod2.length);
		var codigoLargo = Math.max(cod1.length, cod2.length);

		for (var i = 0; i < codigoLargo; i++) {
			numAleatorio = aleatorio(0, 1);
			if (i < codigoCorto) {
				if (numAleatorio == 1) {
					//primer cruce
					cruce1.push(cod1[i]);
					//segundo cruce
					cruce2.push(cod2[i]);
				} else {
					//segundo cruce
					cruce2.push(cod1[i]);
					//primer cruce
					cruce1.push(cod2[i]);
				}
			} else {
				if (cod1.length > cod2.length) {
					if (numAleatorio == 1) {
						//primer cruce
						cruce1.push(cod1[i]);
						//segundo cruce
						cruce2.push(cod1[i]);
					} else {
						//segundo cruce
						cruce2.push(cod1[i]);
						//primer cruce
						cruce1.push(cod1[i]);
					}
				} else {
					if (numAleatorio == 1) {
						//primer cruce
						cruce1.push(cod2[i]);
						//segundo cruce
						cruce2.push(cod2[i]);
					} else {
						//segundo cruce
						cruce2.push(cod2[i]);
						//primer cruce
						cruce1.push(cod2[i]);
					}
				}
			}
		}
		listaCruce.push(cruce1);
		listaCruce.push(cruce2);

		return listaCruce;
	}

	function addTablaFinal(getElementByIdf, codigoGeneticoP1) {
		var fila = "";

		var final = codigoGeneticoP1.map(function(element, index, array) {
			var a = "<th scope='row'>No</th>";
			a += "<th>Perfil</th>";
			a += "<th>Tipo Elemento</th>";
			a += "<th>Coordenada Inicial (m, m)</th>";
			a += "<th>Coordenada Final (m, m)</th>";
			a += "<th>Longitud(cm)</th>";
			a += "<th>Peso(kg)</th>";
			a += "<th>Desplazamientos (Xi(cm), Yi(cm), Gi(rad), Xf(cm), Yf(cm), Gf(rad))</th>";
			a += "<th>Esfuerzos Internos (Xi(kg), Yi (kg), Mzi(kg-cm), Xf(kg), Yf (kg), Mzf(kg-cm))</th>";
			a += "<th>Reacciones Externas (X (kg), Y(kg), Mz(kg-cm))</th>";
			a += "<th>Deriva (cm)</th>";
			a += "<th>Deriva Chequeo</th>";
			a += "<th>Ala Flexión</th>";
			a += "<th>Alma Flexión</th>";
			a += "<th>Chequeo Flexión Ejes Débil y Fuerte</th>";
			a += "<th>Pandeo del Alma por Corte</th>";
			a += "<th>Compresión del Ala</th>";
			a += "<th>Compresión del Alma</th>";
			a += "<th>Tipo de Pandeo</th>";
			a += "<th>Chequeo compresión</th>";
			a += "<th>Puntuación Elemento</th>";
			a += "<th>Puntuación Combinación de Carga</th>";

			//serían los encabezados de la tabla
			var html = "<thead><tr>" + a + "</tr></thead>";

			fila +=
				"<tr>" +
				"<td>" +
				(index + 1) +
				"</td>" +
				"<td>" +
				element.elemento +
				"</td>" +
				"<td>" +
				element.tipo +
				"</td>" +
				"<td>(" +
				element.puntoIni +
				")</td>" +
				"<td>(" +
				element.puntoFin +
				")</td>" +
				"<td>" +
				element.longitud * 100 +
				"</td>" +
				"<td>" +
				element.peso +
				"</td>" +
				"<td>[" +
				element.desplazamientoNodoIni +
				"]</td>" +
				"<td>(" +
				element.esfuerzosInternos +
				")</td>" +
				"<td>(" +
				element.reaccionExterna[0] +
				"," +
				" " +
				element.reaccionExterna[1] +
				", " +
				element.reaccionExterna[2] +
				")</td>" +
				"<td>" +
				element.deriva +
				"</td>" +
				"<td>" +
				element.derivaChequeo +
				"</td>" +
				"<td>(" +
				element.alaλOk +
				")</td>" +
				"<td>(" +
				element.almaλOk +
				")</td>" +
				"<td>(" +
				element.almaλMnOk +
				")</td>" +
				"<td>(" +
				element.pandeoAlmaCorte +
				")</td>" +
				"<td>(" +
				element.alaCompresion +
				")</td>" +
				"<td>(" +
				element.almaCompresion +
				")</td>" +
				"<td>(" +
				element.pandeoCompresion +
				")</td>" +
				"<td>(" +
				element.chequeoCompresion +
				")</td>" +
				"<td>(" +
				element.puntuacion +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["resultadoFinal"] +
				")</td>" +
				"</tr>";
			//+"<br/>";
			document.getElementById(getElementByIdf).innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}
	var draw = "";
	var drawLines3 = "";
	drawini = "";
	let dibujoDesplazamiento = (codigoGeneticoP1, textoP1) => {
		draw = "";
		for (var i = 0; i < codigoGeneticoP1.length; i++) {
			//console.log(codigoGeneticoP[i]["desplazamientoNodoIni"][0] / 100);
			draw +=
				'<line x1="' +
				exagerar * (codigoGeneticoP1[i][textoP1][0] / 100 + codigoGeneticoP1[i]["puntoIni"][0]).toFixed(3) +
				'" ' +
				'y1="' +
				exagerar *
					(40 - codigoGeneticoP1[i][textoP1][1] / 100 - codigoGeneticoP1[i]["puntoIni"][1]).toFixed(3) +
				'" ' +
				'x2="' +
				exagerar * (codigoGeneticoP1[i][textoP1][3] / 100 + codigoGeneticoP1[i]["puntoFin"][0]).toFixed(3) +
				'" ' +
				'y2="' +
				exagerar *
					(40 - codigoGeneticoP1[i][textoP1][4] / 100 - codigoGeneticoP1[i]["puntoFin"][1]).toFixed(3) +
				'" ' +
				'stroke="red" strokeWidth="1px"></line>';
			//console.log(draw);
			//return draw;
		}
		for (var i = 0; i < codigoGeneticoP1.length; i++) {
			//console.log(codigoGeneticoP[i]["desplazamientoNodoIni"][0] / 100);
			draw +=
				'<line x1="' +
				codigoGeneticoP1[i]["puntoIni"][0].toFixed(3) +
				'" ' +
				'y1="' +
				(40 - codigoGeneticoP1[i]["puntoIni"][1]).toFixed(3) +
				'" ' +
				'x2="' +
				codigoGeneticoP1[i]["puntoFin"][0].toFixed(3) +
				'" ' +
				'y2="' +
				(40 - codigoGeneticoP1[i]["puntoFin"][1]).toFixed(3) +
				'" ' +
				'stroke="black" strokeWidth="10px"></line>';
			//console.log(draw);
			//return draw;
		}
		return draw;
	};
	let dibujoIni = codigoGeneticoP1 => {
		var encabezado =
			"<svg width='500px' height='500px' viewBox='-5 -10 35 50' preserveAspectRatio='xMidYMid meet' xmlns='http://www.w3.org/2000/svg' id='caja-dibujo4'>";
		var pie = "</svg>";
		draw = "";
		for (var i = 0; i < codigoGeneticoP1.length; i++) {
			//console.log(codigoGeneticoP1[i]["desplazamientoNodoIni"][0] / 100);
			draw +=
				'<line x1="' +
				codigoGeneticoP1[i]["puntoIni"][0].toFixed(3) +
				'" ' +
				'y1="' +
				(40 - codigoGeneticoP1[i]["puntoIni"][1]).toFixed(3) +
				'" ' +
				'x2="' +
				codigoGeneticoP1[i]["puntoFin"][0].toFixed(3) +
				'" ' +
				'y2="' +
				(40 - codigoGeneticoP1[i]["puntoFin"][1]).toFixed(3) +
				'" ' +
				'stroke="black" strokeWidth="10px"></line>';
			//console.log(draw);
			//return draw;
		}
		document.getElementById("caja-dibujo5").innerHTML = encabezado + draw + pie;
		return draw;
	};

	//var getElementByIdf = "";

	function mutacion(structure) {
		const newStructure = structure.map(el => ({ ...el }));
		const randomIndex = Math.floor(Math.random() * newStructure.length);
		const el = newStructure[randomIndex];

		// Decide which profile list to use based on element type
		const profileList = el.tipo === "Diagonal" ? listaUPL : listaIPN;
		const newProfile = profileList[Math.floor(Math.random() * profileList.length)];

		// Update profile-related properties
		el.elemento = newProfile.designacion;
		el.inercia = newProfile.ix;
		el.inerciaY = newProfile.iy;
		el.area = newProfile.area;
		el.peso = (newProfile.peso * el.longitud).toFixed(2);

		// Metadata for analysis
		el.jj = newProfile.j;
		el.cw = newProfile.cw;
		el.bf = newProfile.bf;
		el.tf = newProfile.tf;
		el.tw = newProfile.tw;
		el.sx = newProfile.sx;
		el.zx = newProfile.zx;
		el.rx = newProfile.rx;
		el.sy = newProfile.sy;
		el.zy = newProfile.zy;
		el.ry = newProfile.ry;

		// Re-calculate local/global stiffness when needed
		el.rigidez = calcElementGlobalK(el);

		return newStructure;
	}

	function Calc1(codigoDelCruce) {
		vectorConectividadf1 = codigoDelCruce.slice();
		codigoGeneticoP = vectorConectividadf1.slice();
		reescrituraConectividadf(0, vectorConectividadf1);
		reescrituraConectividadf2(0, 1.4, vectorConectividadf1);
		matrizRigidLocal2(vectorConectividadf1);
		vectorMatrizRigGlobal = matrizRigidGlogal2(vectorConectividadf1);
		codigoGeneticoP = codigoGenetico2(vectorMatrizRigGlobal);
		//console.log("codGenP", vectorConectividadf1);
		rigidezTotal2(vectorConectividadf1);
		vectorFuerzasInternas = funcionFuerzasInt2(vectorConectividadf1);
		//codigoDelCruce = codigoGeneticoP.slice();
		rigidezReducida2(vectorConectividadf1);
		matrizReducidaInversa = matrizRigidezReduxInversa();
		vectorFuerzasInternasRedux = vectorFReducido2(vectorConectividadf1);
		//codigoDelCruce = codigoGeneticoP;
		vectorDesplazamientos = matrizPorVector(matrizReducidaInversa, vectorFuerzasInternasRedux);
		//desplazamientoEnCodigo(codigoDelCruce);
		entropia = 0;
		var clon5 = vectorConectividadf1.slice();
		var clon11 = calculosFinales(0, 0, 1.4, clon5);
		//vectorConectividadf1 = clon5.slice();
		codigoGeneticoP = clon11.slice();
		codigoDelCruce = clon11.slice();
		addTablaCodigoGen1("tabla-final", clon11);
		return clon11;
	}

	function Calc2(codigoDelCruce, refTabla, cW, CV, CP) {
		vectorConectividadf1 = codigoDelCruce.slice();
		reescrituraConectividadf(cW, vectorConectividadf1);
		reescrituraConectividadf2(CV, CP, vectorConectividadf1);
		vectorMatrizRigGlobal = matrizRigidGlogal2(vectorConectividadf1);
		rigidezTotal2(vectorConectividadf1);
		vectorFuerzasInternas = funcionFuerzasInt2(vectorConectividadf1);
		rigidezReducida2(vectorConectividadf1);
		matrizReducidaInversa = matrizRigidezReduxInversa();
		vectorFuerzasInternasRedux = vectorFReducido();
		vectorDesplazamientos = matrizPorVector(matrizReducidaInversa, vectorFuerzasInternasRedux);
		entropia = 1;
		var clon4 = vectorConectividadf1.slice();
		var clon12 = calculosFinales(cW, CV, CP, clon4);
		//vectorConectividadf1 = clon4.slice();
		//clon4 = [];
		codigoDelCruce = clon12.slice();
		addTablaCodigoGen22(refTabla, clon12);
	}
	function EvaluacionCruce(codigoDelCruce) {
		Calc1(codigoDelCruce);
		Calc2(codigoDelCruce, "tabla-final2", 0, 1.6, 1.2);
		Calc2(codigoDelCruce, "tabla-final3", 1.275, 1.275, 1.05);
		Calc2(codigoDelCruce, "tabla-final4", -1.275, 1.275, 1.05);
		var clon8 = codigoDelCruce.slice();
		evaluacionCargasLaterales(clon8);
		evaluacionSismo(clon8);
		evaluacionSismoNegativo(clon8);
		//clon8 = vectorConectividadf1.slice();
		listaEstructuraPush(clon8);

		obtenerDesplazamiento(clon8, "tabla-final", "desCombo1");
		obtenerDesplazamiento(clon8, "tabla-final2", "desCombo2");
		obtenerDesplazamiento(clon8, "tabla-final3", "desCombo3");
		obtenerDesplazamiento(clon8, "tabla-final4", "desCombo4");
		//obtenerDesplazamiento(vectorConectividadf1, "tabla-final5", "desComboLateral");
		codigoDelCruce = clon8.slice(); //se podría silenciar esto
		return (
			vectorFuerzasInternas,
			matrizReducidaInversa,
			vectorFuerzasInternasRedux,
			vectorDesplazamientos,
			codigoDelCruce
		);
	}
	var listaAEvaluar = [];
	var probabilidadUsuario = 10;
	function BotonCruce() {
		//listaAEvaluar = [];
		repetir++;
		let cruceGen0, cruceGen1, mutacion0, mutacion1, codigoA, codigoB;
		var canti = estructurasLista.length;
		var probabilidadMutacion;
		var aletoriedadCruce = 0;
		for (var i = 0; i < canti - 1; i++) {
			codigoA = JSON.parse(JSON.stringify(estructurasLista[i]));
			codigoB = JSON.parse(JSON.stringify(estructurasLista[i + 1]));
			aletoriedadCruce = aleatorio(0, 1);
			if (aletoriedadCruce == 1) {
				listaAEvaluar = cruceGenetico1(codigoA, codigoB);
			} else {
				listaAEvaluar = cruceGenetico2(codigoA, codigoB);
			}
			listaAEvaluar = cruceGenetico1(codigoA, codigoB);
			cruceGen0 = listaAEvaluar[0].slice();
			cruceGen1 = listaAEvaluar[1].slice();

			probabilidadMutacion = aleatorio(1, probabilidadUsuario);

			if (probabilidadMutacion == 1) {
				EvaluacionCruce(cruceGen0);
				EvaluacionCruce(cruceGen1);
				var clonMutado = cruceGen0.slice();
				mutacion0 = mutacion(clonMutado);
				EvaluacionCruce(mutacion0);
				var clonMutado2 = cruceGen1.slice();
				mutacion1 = mutacion(clonMutado2);
				EvaluacionCruce(mutacion1);
			} else {
				EvaluacionCruce(cruceGen0);
				EvaluacionCruce(cruceGen1);
			}
		}
	}
	function sismoColumna(cargaLateral, vectorConectividadf1) {
		//let vectorAux = vectorConectividadf;
		for (var i = 0; i < vectorConectividadf1.length; i++) {
			//console.log("elemento", elementos, vectorAux);
			if (
				(vectorConectividadf1[i]["longitud"] == actions.getEntrePiso()) &
				(vectorConectividadf1[i]["puntoIni"][0] == vectorConectividadf1[i]["puntoFin"][0])
			) {
				if ((vectorConectividadf1[i]["puntoIni"][0] == 0) & (vectorConectividadf1[i]["puntoFin"][0] == 0)) {
					//console.log("entro en el if en columnas que le entran viento", cViento * actions.getCargaViento());
					vectorConectividadf1[i]["fuerzainterna"] = [cargaLateral, 0, 0, cargaLateral, 0, 0];
					//return vectorConectividadf[i]["fuerzainterna"];
				} else {
					vectorConectividadf1[i]["fuerzainterna"] = [0, 0, 0, cargaLateral, 0, 0];
					//return vectorConectividadf[i]["fuerzainterna"];
				}
			}
		}
		var clon13 = vectorConectividadf1.slice();
		//vectorConectividadf = [];
		//vectorConectividadf = vectorAux;
		return clon13;
	}
	function sismoVigas(cargaLateral, vectorConectividadf22) {
		//reescritura de las fuerzas internas

		for (var i = 0; i < vectorConectividadf22.length; i++) {
			//vigas
			if (
				(vectorConectividadf22[i]["longitud"] == actions.getLuzVano()) &
				(vectorConectividadf22[i]["puntoIni"][1] != 0)
			) {
				//console.log("entro en primer if reescrituraconectividadf2");
				if (
					vectorConectividadf22[i]["puntoIni"][1] == vectorConectividadf22[i]["puntoFin"][1] &&
					vectorConectividadf22[i]["puntoIni"][0] == 0
				) {
					//console.log("entro en if reescrituraconectividadf2");
					vectorConectividadf22[i]["fuerzainterna"] = [cargaLateral, 0, 0, 0, 0, 0];
					//if del techo empieza aquí>

					return vectorConectividadf22[i]["fuerzainterna"];
				}
			}

			//diagonales
		}
		return vectorConectividadf22;
	}

	function evaluacionCargasLaterales(codigoGeneticoP1) {
		vectorConectividadf1 = codigoGeneticoP1.slice();
		vectorConectividadf22 = codigoGeneticoP1.slice();
		sismoColumna(1000, vectorConectividadf1);
		sismoVigas(1000, vectorConectividadf1);
		matrizRigidLocal2(vectorConectividadf1);
		vectorMatrizRigGlobal = matrizRigidGlogal2(vectorConectividadf1);
		codigoGeneticoP = codigoGenetico2(vectorMatrizRigGlobal);
		rigidezTotal2(vectorConectividadf1);
		vectorFuerzasInternas = funcionFuerzasInt2(vectorConectividadf1);
		//codigoDelCruce = codigoGeneticoP;
		rigidezReducida2(vectorConectividadf1);
		matrizReducidaInversa = matrizRigidezReduxInversa();
		vectorFuerzasInternasRedux = vectorFReducido2(vectorConectividadf1);
		//codigoDelCruce = codigoGeneticoP;
		vectorDesplazamientos = matrizPorVector(matrizReducidaInversa, vectorFuerzasInternasRedux);
		//desplazamientoEnCodigo(codigoGeneticoP1);
		entropia = 4;
		var clon3 = vectorConectividadf1.slice();
		var clon9 = vectorConectividadf1.slice();
		clon9 = calculosFinales(1, 0.5, 1, clon3);
		//vectorConectividadf1 = clon3.slice();
		//clon3 = [];

		metodoEstaticoEquivalente(clon9);
		//vectorConectividadf1 = clon9.slice();
		addTablaCodigoGenLateral("tabla-final5", clon9);
		codigoGeneticoP1 = clon9.slice();
		return clon9;
	}

	function metodoEstaticoEquivalente(codigoGeneticoP1) {
		var pesoPiso = 0;
		var cantidadPisos = parseFloat(actions.getNoPisos());
		var cargaLosaPerm = parseFloat(actions.getCargaLosaPermanente());
		var cargaLosaVar = parseFloat(actions.getCargaLosaVariable());
		var cargaTechoPem = parseFloat(actions.getCargaTechoPermanente());
		var cargaTechoVar = parseFloat(actions.getCargaTechoVariable());
		var listaPesoPiso = [];
		var listaPesoPisoAltura = [];
		var pesoEdificioSismo = 0;
		var pesoAltura = 0;
		var fuerzaLateralFicticia = [];
		var desplazamientoLateral = [];
		var desplazamientoElastico = 0;
		var desplazamientoElasticoLista = [];
		var numerador = 0;
		var denominador = 0;
		var periodoRayleigh = 0;
		var aceleracionAo = parseFloat(actions.getAceleracionAo());
		var factorCorreccion = parseFloat(actions.getFactorCorreccion());
		var factorImportancia = parseFloat(actions.getFactorImportancia());
		var factorReduccion = parseFloat(actions.getFactorReduccion());
		var tAst = parseFloat(actions.getTAst());
		var beta = parseFloat(actions.getBeta());
		var ro = parseFloat(actions.getRo());
		var tMas = parseFloat(actions.getTMas());
		var Ad = 0;
		var elevacionC = Math.sqrt(Math.sqrt(factorReduccion / beta));
		var aux = 0;
		var factorMayor = 0;

		for (var i = 1; i <= cantidadPisos; i++) {
			pesoPiso = 0;
			for (let element of codigoGeneticoP1) {
				//primer caso para cuando el nodo final pertenece a un entrepiso
				if (element.nodoFin[1] == i && element.nodoFin[1] != cantidadPisos) {
					if (element["tipo"] == "Viga") {
						pesoPiso +=
							cargaLosaPerm * parseFloat(element.longitud) +
							0.5 * cargaLosaVar * parseFloat(element.longitud);
					}
					if (element["tipo"] == "Columna") {
						pesoPiso += parseFloat(element.peso / 2);
					}
				}
				//segundo caso cuando nodo final coincide con el techo
				if (element.nodoFin[1] == cantidadPisos) {
					if (element["tipo"] == "Viga") {
						pesoPiso +=
							cargaTechoPem * parseFloat(element.longitud) +
							0.5 * cargaTechoVar * parseFloat(element.longitud);
					}
					if (element["tipo"] == "Columna") {
						pesoPiso += parseFloat(element.peso / 2);
					}
				}
				//tercer caso para las columnas cuando el nodo inicial coincide
				if (element.nodoIni[1] == i) {
					if (element["tipo"] == "Columna") {
						pesoPiso += parseFloat(element.peso / 2);
					}
				}

				//console.log("pesoPiso", pesoPiso);
				//listaPesoPiso[i - 1] += pesoPiso;
			}
			//extracción de las derivas en una lista por piso
			if (codigoGeneticoP1[i - 1]["tipo"] == "Columna") {
				if (codigoGeneticoP1[i - 1]["nodoIni"][0] == 0) {
					desplazamientoLateral.push(Math.abs(parseFloat(codigoGeneticoP1[i - 1]["derivaComboLateral"])));
				}
			}

			listaPesoPiso.push(pesoPiso);
			listaPesoPisoAltura.push(pesoPiso * parseFloat(actions.getEntrePiso()));
		}
		//Fin del For
		codigoGeneticoP1[0]["pesoPisos"] = listaPesoPiso;
		codigoGeneticoP1[0]["derivaPisos"] = desplazamientoLateral;

		for (var j = 0; j < listaPesoPisoAltura.length; j++) {
			pesoAltura += listaPesoPisoAltura[j];
			pesoEdificioSismo += listaPesoPiso[j];
		}

		codigoGeneticoP1[0]["pesoEdificioSismo"] = pesoEdificioSismo;
		for (var j = 0; j < desplazamientoLateral.length; j++) {
			desplazamientoElastico += desplazamientoLateral[j];
			desplazamientoElasticoLista.push(desplazamientoElastico);
		}
		codigoGeneticoP1[0]["desplazamientoElasticoNivel"] = desplazamientoElasticoLista;

		//se hallan numerador de nominador:
		for (var j = 0; j < desplazamientoLateral.length; j++) {
			numerador += listaPesoPiso[j] * Math.pow(desplazamientoElasticoLista[j], 2);
			denominador += 1000 * desplazamientoElasticoLista[j];
		}
		periodoRayleigh = 2 * Math.PI * Math.sqrt(numerador / (Math.abs(denominador) * 981));
		codigoGeneticoP1[0]["periodoRayleigh"] = round(periodoRayleigh, 3);

		//se calcula Ta= ct*Ht^0.75
		var periodoTa = 0.08 * Math.pow(parseFloat(actions.getEntrePiso()) * parseFloat(actions.getNoPisos()), 0.75);
		codigoGeneticoP1[0]["periodoTa"] = round(periodoTa, 3);
		codigoGeneticoP1[0]["periodoT"] = Math.min(periodoTa, periodoRayleigh);
		aux = Math.min(periodoTa, periodoRayleigh);

		if (aux < tMas) {
			Ad =
				(factorCorreccion * factorImportancia * aceleracionAo * (1 + (aux / tMas) * (beta - 1))) /
				(1 + Math.pow(aux / tMas, elevacionC) * (factorReduccion - 1));
		}
		if (aux >= tMas && aux <= tAst) {
			Ad = (factorCorreccion * factorImportancia * aceleracionAo * beta) / factorReduccion;
		}
		if (aux > tAst) {
			Ad =
				((factorCorreccion * factorImportancia * aceleracionAo * beta) / factorReduccion) *
				Math.pow(tAst / aux, ro);
		}
		codigoGeneticoP1[0]["aceleracionAd"] = round(Ad, 3);

		//para hallar la cortante basa se considera el mayor entre los dos siguientes factores:
		factorMayor = Math.max(
			1.4 * ((cantidadPisos + 9) / (12 + 2 * cantidadPisos)),
			0.8 + (1 / 20) * (aux / tAst - 1)
		);

		//La Cortante Basal será:
		codigoGeneticoP1[0]["cortanteBasalVo"] = round(Ad * factorMayor * pesoEdificioSismo, 3);
		var cortanteBasal = Ad * factorMayor * pesoEdificioSismo;

		//el coeficiente sismico será
		codigoGeneticoP1[0]["coeficienteSismico"] = cortanteBasal / pesoEdificioSismo;
		var coeficienteSismico = cortanteBasal / pesoEdificioSismo;

		//comparación del coeficiente sismimo:
		var comparacion = (factorImportancia * aceleracionAo) / factorReduccion;
		codigoGeneticoP1[0]["coeficienteSismicoMin"] = round(comparacion, 3);

		if (coeficienteSismico >= comparacion) {
			codigoGeneticoP1[0]["coeficienteSismicoCond"] = "Cumple";
			//codigoGeneticoP1[0]["evaluacionCodigoGenetico"] = codigoGeneticoP1[0]["evaluacionCodigoGenetico"] + 15;
		} else {
			codigoGeneticoP1[0]["coeficienteSismicoCond"] = "No Cumple";
		}

		//se halla la fuerza lateral concentrada en cada piso
		var ft = 0;

		ft = ((0.006 * aux) / tAst - 0.02) * cortanteBasal;
		if (ft < 0.04 * cortanteBasal) {
			ft = 0.04 * cortanteBasal;
		} else {
			if (ft > 0.1 * cortanteBasal) {
				ft = 0.1 * cortanteBasal;
			}
		}

		var listaFi = [];
		for (var j = 0; j < desplazamientoLateral.length; j++) {
			listaFi.push(
				round(
					((cortanteBasal - ft) * (listaPesoPiso[j] * (j + 1) * parseFloat(actions.getEntrePiso()))) /
						(pesoEdificioSismo * cantidadPisos * parseFloat(actions.getEntrePiso())),
					2
				)
			);
		}
		codigoGeneticoP1[0]["FuerzasSismoPiso"] = listaFi;
	}

	function sismoColumna2(cargaLateral, vectorConectividadf1) {
		//let vectorAux = vectorConectividadf;
		var sismoVertical =
			parseFloat(vectorConectividadf1[0].pesoEdificioSismo) *
			parseFloat(actions.getFactorImportancia()) *
			parseFloat(actions.getFactorCorreccion()) *
			parseFloat(actions.getBeta()) *
			parseFloat(actions.getAceleracionAo()) *
			0.2;
		vectorConectividadf1[0]["Sz03"] = sismoVertical;
		for (var j = 0; j < cargaLateral.length; j++) {
			if (j == 0) {
				//entraría en la primera columna de Planta Baja, de izquierda a derecha (la que le pegaría el Sismo)
				vectorConectividadf1[j]["fuerzainterna"] = [0, 0, 0, 0, cargaLateral[j] + sismoVertical, 0];
			} else {
				vectorConectividadf1[j]["fuerzainterna"] = [
					cargaLateral[j - 1] + sismoVertical,
					0,
					0,
					cargaLateral[j] + sismoVertical,
					0,
					0
				];
			}
		}

		//vectorConectividadf = [];
		//vectorConectividadf = vectorAux;
		return vectorConectividadf1;
	}
	function sismoVigas2(cargaLateral, vectorConectividadf22) {
		//reescritura de las fuerzas internas
		var sismoVertical =
			vectorConectividadf1[0].pesoEdificioSismo *
			parseFloat(actions.getFactorImportancia()) *
			parseFloat(actions.getFactorCorreccion()) *
			parseFloat(actions.getBeta()) *
			parseFloat(actions.getAceleracionAo()) *
			0.2;
		for (var j = 0; j < cargaLateral.length; j++) {
			for (var i = 0; i < vectorConectividadf22.length; i++) {
				//vigas
				if (
					(vectorConectividadf22[i]["longitud"] == actions.getLuzVano()) &
					(vectorConectividadf22[i]["puntoIni"][1] != 0)
				) {
					//console.log("entro en primer if reescrituraconectividadf2");
					if (
						vectorConectividadf22[i]["puntoIni"][1] == vectorConectividadf22[i]["puntoFin"][1] &&
						vectorConectividadf22[i]["puntoIni"][0] == 0
					) {
						//console.log("entro en if reescrituraconectividadf2");
						if (vectorConectividadf22[i]["nodoIni"][1] == j + 1)
							vectorConectividadf22[i]["fuerzainterna"] = [
								cargaLateral[j] + sismoVertical,
								0,
								0,
								0,
								0,
								0
							];
						//if del techo empieza aquí>

						return vectorConectividadf22[i]["fuerzainterna"];
					}
				}

				//diagonales
			}
		}

		return vectorConectividadf22;
	}
	function sismoColumna3(cargaLateral, vectorConectividadf1) {
		//let vectorAux = vectorConectividadf;
		var sismoVertical =
			parseFloat(vectorConectividadf1[0].pesoEdificioSismo) *
			parseFloat(actions.getFactorImportancia()) *
			parseFloat(actions.getFactorCorreccion()) *
			parseFloat(actions.getBeta()) *
			parseFloat(actions.getAceleracionAo()) *
			0.2;
		vectorConectividadf1[0]["Sz03"] = sismoVertical;
		for (var j = 0; j < cargaLateral.length; j++) {
			if (j == 0) {
				//entraría en la primera columna de Planta Baja, de izquierda a derecha (la que le pegaría el Sismo)
				vectorConectividadf1[j]["fuerzainterna"] = [0, 0, 0, 0, -cargaLateral[j] - sismoVertical, 0];
			} else {
				vectorConectividadf1[j]["fuerzainterna"] = [
					-cargaLateral[j - 1] - sismoVertical,
					0,
					0,
					-cargaLateral[j] - sismoVertical,
					0,
					0
				];
			}
		}

		//vectorConectividadf = [];
		//vectorConectividadf = vectorAux;
		return vectorConectividadf1;
	}
	function sismoVigas3(cargaLateral, vectorConectividadf22) {
		//reescritura de las fuerzas internas
		var sismoVertical =
			vectorConectividadf1[0].pesoEdificioSismo *
			parseFloat(actions.getFactorImportancia()) *
			parseFloat(actions.getFactorCorreccion()) *
			parseFloat(actions.getBeta()) *
			parseFloat(actions.getAceleracionAo()) *
			0.2;
		for (var j = 0; j < cargaLateral.length; j++) {
			for (var i = 0; i < vectorConectividadf22.length; i++) {
				//vigas
				if (
					(vectorConectividadf22[i]["longitud"] == actions.getLuzVano()) &
					(vectorConectividadf22[i]["puntoIni"][1] != 0)
				) {
					//console.log("entro en primer if reescrituraconectividadf2");
					if (
						vectorConectividadf22[i]["puntoIni"][1] == vectorConectividadf22[i]["puntoFin"][1] &&
						vectorConectividadf22[i]["puntoIni"][0] == 0
					) {
						//console.log("entro en if reescrituraconectividadf2");
						if (vectorConectividadf22[i]["nodoIni"][1] == j + 1)
							vectorConectividadf22[i]["fuerzainterna"] = [
								-cargaLateral[j] - sismoVertical,
								0,
								0,
								0,
								0,
								0
							];
						//if del techo empieza aquí>

						return vectorConectividadf22[i]["fuerzainterna"];
					}
				}

				//diagonales
			}
		}

		return vectorConectividadf22;
	}

	function evaluacionSismo(codigoGeneticoP1) {
		vectorConectividadf1 = codigoGeneticoP1.slice();
		vectorConectividadf22 = codigoGeneticoP1.slice();
		var fuerzalateral = vectorConectividadf1[0]["FuerzasSismoPiso"].slice();
		//console.log("fuerza Lateral", fuerzalateral);
		sismoColumna2(fuerzalateral, vectorConectividadf1);
		//console.log("ocurre evaluacion de columna sismo");
		sismoVigas2(fuerzalateral, vectorConectividadf1);
		//console.log("ocurre evaluacion de vigas sismo");
		matrizRigidLocal2(vectorConectividadf1);
		vectorMatrizRigGlobal = matrizRigidGlogal2(vectorConectividadf1);
		codigoGeneticoP = codigoGenetico2(vectorMatrizRigGlobal);
		rigidezTotal2(vectorConectividadf1);
		vectorFuerzasInternas = funcionFuerzasInt2(vectorConectividadf1);
		//codigoDelCruce = codigoGeneticoP;
		rigidezReducida2(vectorConectividadf1);
		matrizReducidaInversa = matrizRigidezReduxInversa();
		vectorFuerzasInternasRedux = vectorFReducido2(vectorConectividadf1);
		//codigoDelCruce = codigoGeneticoP;
		vectorDesplazamientos = matrizPorVector(matrizReducidaInversa, vectorFuerzasInternasRedux);
		//desplazamientoEnCodigo(codigoGeneticoP1);
		entropia = 4;
		var clon7 = vectorConectividadf1.slice();
		var clon13 = calculosFinales(10, 0.5, 1, clon7); //en Sismo cW no actúa, se le puso 10 como identificación interna de la función
		//vectorConectividadf1 = clon7.slice();
		vectorConectividadf1 = clon13.slice();
		codigoGeneticoP1 = clon13.slice();
		//metodoEstaticoEquivalente(vectorConectividadf1);
		addTablaCodigoGen6("tabla-final6", clon13);
		return clon13;
	}
	function evaluacionSismoNegativo(codigoGeneticoP1) {
		vectorConectividadf1 = codigoGeneticoP1.slice();
		vectorConectividadf22 = codigoGeneticoP1.slice();
		var fuerzalateral = vectorConectividadf1[0]["FuerzasSismoPiso"].slice();
		//console.log("fuerza Lateral", fuerzalateral);
		sismoColumna3(fuerzalateral, vectorConectividadf1);
		//console.log("ocurre evaluacion de columna sismo");
		sismoVigas3(fuerzalateral, vectorConectividadf1);
		//console.log("ocurre evaluacion de vigas sismo");
		matrizRigidLocal2(vectorConectividadf1);
		vectorMatrizRigGlobal = matrizRigidGlogal2(vectorConectividadf1);
		codigoGeneticoP = codigoGenetico2(vectorMatrizRigGlobal);
		rigidezTotal2(vectorConectividadf1);
		vectorFuerzasInternas = funcionFuerzasInt2(vectorConectividadf1);
		//codigoDelCruce = codigoGeneticoP;
		rigidezReducida2(vectorConectividadf1);
		matrizReducidaInversa = matrizRigidezReduxInversa();
		vectorFuerzasInternasRedux = vectorFReducido2(vectorConectividadf1);
		//codigoDelCruce = codigoGeneticoP;
		vectorDesplazamientos = matrizPorVector(matrizReducidaInversa, vectorFuerzasInternasRedux);
		//desplazamientoEnCodigo(codigoGeneticoP1);
		entropia = 4;
		var clon7 = vectorConectividadf1.slice();
		var clon13 = calculosFinales(-10, 0.5, 1, clon7); //en Sismo cW no actúa, se le puso 10 como identificación interna de la función
		//vectorConectividadf1 = clon7.slice();
		vectorConectividadf1 = clon13.slice();
		codigoGeneticoP1 = clon13.slice();
		//metodoEstaticoEquivalente(vectorConectividadf1);
		addTablaCodigoGen7("tabla-final7", clon13);
		return clon13;
	}

	function addTablasAgain(codigoGeneticoP1) {
		codigoGeneticoP = codigoGeneticoP1;
		matrizRigidLocal2(codigoGeneticoP1);
		//addMatricesRigLocal2(codigoGeneticoP1);
		//vectorMatrizRigGlobal = matrizRigidGlogal();
	}

	function updateDraw() {
		if (repetir > 1) {
			document.getElementById("caja-dibujo2").innerHTML = dibujoIni(estructurasLista[0]);
			document.getElementById("caja-dibujo4").innerHTML = dibujoIni(estructurasLista[0]);
		}
	}

	function addTablaCodigoGen1(getElementByIdf, codigoGeneticoP1) {
		var fila = "";

		var final = codigoGeneticoP1.map(function(element, index, array) {
			var a = "<th scope='row'>No</th>";
			a += "<th>Perfil</th>";
			a += "<th>Tipo Elemento</th>";
			a += "<th>Coordenada Inicial (m, m)</th>";
			a += "<th>Coordenada Final (m, m)</th>";
			a += "<th>Longitud(cm)</th>";
			a += "<th>Peso(kg)</th>";
			a += "<th>Desplazamientos (Xi(cm), Yi(cm), Gi(rad), Xf(cm), Yf(cm), Gf(rad))</th>";
			a += "<th>Esfuerzos Internos (Xi(kg), Yi (kg), Mzi(kg-cm), Xf(kg), Yf (kg), Mzf(kg-cm))</th>";
			a += "<th>Reacciones Externas (X (kg), Y(kg), Mz(kg-cm))</th>";
			a += "<th>Deriva (cm)</th>";
			a += "<th>Deriva Chequeo</th>";
			a += "<th>Ala Flexión</th>";
			a += "<th>Alma Flexión</th>";
			a += "<th>Chequeo Flexión Ejes Débil y Fuerte</th>";
			a += "<th>Pandeo del Alma por Corte</th>";
			a += "<th>Compresión del Ala</th>";
			a += "<th>Compresión del Alma</th>";
			a += "<th>Tipo de Pandeo</th>";
			a += "<th>Chequeo compresión</th>";
			a += "<th>Puntuación Elemento</th>";
			a += "<th>Puntuación Combinación de Carga</th>";

			//serían los encabezados de la tabla
			var html = "<thead><tr>" + a + "</tr></thead>";

			fila +=
				"<tr>" +
				"<td>" +
				(index + 1) +
				"</td>" +
				"<td>" +
				element.elemento +
				"</td>" +
				"<td>" +
				element.tipo +
				"</td>" +
				"<td>(" +
				element.puntoIni +
				")</td>" +
				"<td>(" +
				element.puntoFin +
				")</td>" +
				"<td>" +
				element.longitud * 100 +
				"</td>" +
				"<td>" +
				element.peso +
				"</td>" +
				"<td>[" +
				element.desplazamientoNodoIniCombo1 +
				"]</td>" +
				"<td>(" +
				element.esfuerzosInternosCombo1 +
				")</td>" +
				"<td>(" +
				element.reaccionExternaCombo1[0] +
				"," +
				" " +
				element.reaccionExternaCombo1[1] +
				", " +
				element.reaccionExternaCombo1[2] +
				")</td>" +
				"<td>" +
				element.derivaCombo1 +
				"</td>" +
				"<td>" +
				element.derivaChequeoCombo1 +
				"</td>" +
				"<td>(" +
				element.alaλOkCombo1 +
				")</td>" +
				"<td>(" +
				element.almaλOkCombo1 +
				")</td>" +
				"<td>(" +
				element.almaλMnOkCombo1 +
				")</td>" +
				"<td>(" +
				element.pandeoAlmaCorteCombo1 +
				")</td>" +
				"<td>(" +
				element.alaCompresionCombo1 +
				")</td>" +
				"<td>(" +
				element.almaCompresionCombo1 +
				")</td>" +
				"<td>(" +
				element.pandeoCompresionCombo1 +
				")</td>" +
				"<td>(" +
				element.chequeoCompresionCombo1 +
				")</td>" +
				"<td>(" +
				element.puntuacionCombo1 +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["resultadoFinal"] +
				")</td>" +
				"</tr>";
			//+"<br/>";
			document.getElementById(getElementByIdf).innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}

	function addTablaCodigoGen22(getElementByIdf, codigoGeneticoP1) {
		var fila = "";

		var final = codigoGeneticoP1.map(function(element, index, array) {
			var a = "<th scope='row'>No</th>";
			a += "<th>Perfil</th>";
			a += "<th>Tipo Elemento</th>";
			a += "<th>Coordenada Inicial (m, m)</th>";
			a += "<th>Coordenada Final (m, m)</th>";
			a += "<th>Longitud(cm)</th>";
			a += "<th>Peso(kg)</th>";
			a += "<th>Desplazamientos (Xi(cm), Yi(cm), Gi(rad), Xf(cm), Yf(cm), Gf(rad))</th>";
			a += "<th>Esfuerzos Internos (Xi(kg), Yi (kg), Mzi(kg-cm), Xf(kg), Yf (kg), Mzf(kg-cm))</th>";
			a += "<th>Reacciones Externas (X (kg), Y(kg), Mz(kg-cm))</th>";
			a += "<th>Deriva (cm)</th>";
			a += "<th>Deriva Chequeo</th>";
			a += "<th>Ala Flexión</th>";
			a += "<th>Alma Flexión</th>";
			a += "<th>Chequeo Flexión Ejes Débil y Fuerte</th>";
			a += "<th>Pandeo del Alma por Corte</th>";
			a += "<th>Compresión del Ala</th>";
			a += "<th>Compresión del Alma</th>";
			a += "<th>Tipo de Pandeo</th>";
			a += "<th>Chequeo compresión</th>";
			a += "<th>Puntuación Elemento</th>";
			a += "<th>Puntuación Combinación de Carga</th>";

			//serían los encabezados de la tabla
			var html = "<thead><tr>" + a + "</tr></thead>";

			fila +=
				"<tr>" +
				"<td>" +
				(index + 1) +
				"</td>" +
				"<td>" +
				element.elemento +
				"</td>" +
				"<td>" +
				element.tipo +
				"</td>" +
				"<td>(" +
				element.puntoIni +
				")</td>" +
				"<td>(" +
				element.puntoFin +
				")</td>" +
				"<td>" +
				element.longitud * 100 +
				"</td>" +
				"<td>" +
				element.peso +
				"</td>" +
				"<td>[" +
				element.desplazamientoNodoIniCombo2 +
				"]</td>" +
				"<td>(" +
				element.esfuerzosInternosCombo2 +
				")</td>" +
				"<td>(" +
				element.reaccionExternaCombo2[0] +
				"," +
				" " +
				element.reaccionExternaCombo2[1] +
				", " +
				element.reaccionExternaCombo2[2] +
				")</td>" +
				"<td>" +
				element.derivaCombo2 +
				"</td>" +
				"<td>" +
				element.derivaChequeoCombo2 +
				"</td>" +
				"<td>(" +
				element.alaλOkCombo2 +
				")</td>" +
				"<td>(" +
				element.almaλOkCombo2 +
				")</td>" +
				"<td>(" +
				element.almaλMnOkCombo2 +
				")</td>" +
				"<td>(" +
				element.pandeoAlmaCorteCombo2 +
				")</td>" +
				"<td>(" +
				element.alaCompresionCombo2 +
				")</td>" +
				"<td>(" +
				element.almaCompresionCombo2 +
				")</td>" +
				"<td>(" +
				element.pandeoCompresionCombo2 +
				")</td>" +
				"<td>(" +
				element.chequeoCompresionCombo2 +
				")</td>" +
				"<td>(" +
				element.puntuacionCombo2 +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["resultadoFinal"] +
				")</td>" +
				"</tr>";
			//+"<br/>";
			document.getElementById(getElementByIdf).innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}

	function addTablaCodigoGen3(getElementByIdf, codigoGeneticoP1) {
		var fila = "";

		var final = codigoGeneticoP1.map(function(element, index, array) {
			var a = "<th scope='row'>No</th>";
			a += "<th>Perfil</th>";
			a += "<th>Tipo Elemento</th>";
			a += "<th>Coordenada Inicial (m, m)</th>";
			a += "<th>Coordenada Final (m, m)</th>";
			a += "<th>Longitud(cm)</th>";
			a += "<th>Peso(kg)</th>";
			a += "<th>Desplazamientos (Xi(cm), Yi(cm), Gi(rad), Xf(cm), Yf(cm), Gf(rad))</th>";
			a += "<th>Esfuerzos Internos (Xi(kg), Yi (kg), Mzi(kg-cm), Xf(kg), Yf (kg), Mzf(kg-cm))</th>";
			a += "<th>Reacciones Externas (X (kg), Y(kg), Mz(kg-cm))</th>";
			a += "<th>Deriva (cm)</th>";
			a += "<th>Deriva Chequeo</th>";
			a += "<th>Ala Flexión</th>";
			a += "<th>Alma Flexión</th>";
			a += "<th>Chequeo Flexión Ejes Débil y Fuerte</th>";
			a += "<th>Pandeo del Alma por Corte</th>";
			a += "<th>Compresión del Ala</th>";
			a += "<th>Compresión del Alma</th>";
			a += "<th>Tipo de Pandeo</th>";
			a += "<th>Chequeo compresión</th>";
			a += "<th>Puntuación Elemento</th>";
			a += "<th>Puntuación Combinación de Carga</th>";

			//serían los encabezados de la tabla
			var html = "<thead><tr>" + a + "</tr></thead>";

			fila +=
				"<tr>" +
				"<td>" +
				(index + 1) +
				"</td>" +
				"<td>" +
				element.elemento +
				"</td>" +
				"<td>" +
				element.tipo +
				"</td>" +
				"<td>(" +
				element.puntoIni +
				")</td>" +
				"<td>(" +
				element.puntoFin +
				")</td>" +
				"<td>" +
				element.longitud * 100 +
				"</td>" +
				"<td>" +
				element.peso +
				"</td>" +
				"<td>[" +
				element.desplazamientoNodoIniCombo3 +
				"]</td>" +
				"<td>(" +
				element.esfuerzosInternosCombo3 +
				")</td>" +
				"<td>(" +
				element.reaccionExternaCombo3[0] +
				"," +
				" " +
				element.reaccionExternaCombo3[1] +
				", " +
				element.reaccionExternaCombo3[2] +
				")</td>" +
				"<td>" +
				element.derivaCombo3 +
				"</td>" +
				"<td>" +
				element.derivaChequeoCombo3 +
				"</td>" +
				"<td>(" +
				element.alaλOkCombo3 +
				")</td>" +
				"<td>(" +
				element.almaλOkCombo3 +
				")</td>" +
				"<td>(" +
				element.almaλMnOkCombo3 +
				")</td>" +
				"<td>(" +
				element.pandeoAlmaCorteCombo3 +
				")</td>" +
				"<td>(" +
				element.alaCompresionCombo3 +
				")</td>" +
				"<td>(" +
				element.almaCompresionCombo3 +
				")</td>" +
				"<td>(" +
				element.pandeoCompresionCombo3 +
				")</td>" +
				"<td>(" +
				element.chequeoCompresionCombo3 +
				")</td>" +
				"<td>(" +
				element.puntuacionCombo3 +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["resultadoFinal"] +
				")</td>" +
				"</tr>";
			//+"<br/>";
			document.getElementById(getElementByIdf).innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}

	function addTablaCodigoGen4(getElementByIdf, codigoGeneticoP1) {
		var fila = "";

		var final = codigoGeneticoP1.map(function(element, index, array) {
			var a = "<th scope='row'>No</th>";
			a += "<th>Perfil</th>";
			a += "<th>Tipo Elemento</th>";
			a += "<th>Coordenada Inicial (m, m)</th>";
			a += "<th>Coordenada Final (m, m)</th>";
			a += "<th>Longitud(cm)</th>";
			a += "<th>Peso(kg)</th>";
			a += "<th>Desplazamientos (Xi(cm), Yi(cm), Gi(rad), Xf(cm), Yf(cm), Gf(rad))</th>";
			a += "<th>Esfuerzos Internos (Xi(kg), Yi (kg), Mzi(kg-cm), Xf(kg), Yf (kg), Mzf(kg-cm))</th>";
			a += "<th>Reacciones Externas (X (kg), Y(kg), Mz(kg-cm))</th>";
			a += "<th>Deriva (cm)</th>";
			a += "<th>Deriva Chequeo</th>";
			a += "<th>Ala Flexión</th>";
			a += "<th>Alma Flexión</th>";
			a += "<th>Chequeo Flexión Ejes Débil y Fuerte</th>";
			a += "<th>Pandeo del Alma por Corte</th>";
			a += "<th>Compresión del Ala</th>";
			a += "<th>Compresión del Alma</th>";
			a += "<th>Tipo de Pandeo</th>";
			a += "<th>Chequeo compresión</th>";
			a += "<th>Puntuación Elemento</th>";
			a += "<th>Puntuación Combinación de Carga</th>";

			//serían los encabezados de la tabla
			var html = "<thead><tr>" + a + "</tr></thead>";

			fila +=
				"<tr>" +
				"<td>" +
				(index + 1) +
				"</td>" +
				"<td>" +
				element.elemento +
				"</td>" +
				"<td>" +
				element.tipo +
				"</td>" +
				"<td>(" +
				element.puntoIni +
				")</td>" +
				"<td>(" +
				element.puntoFin +
				")</td>" +
				"<td>" +
				element.longitud * 100 +
				"</td>" +
				"<td>" +
				element.peso +
				"</td>" +
				"<td>[" +
				element.desplazamientoNodoIniCombo4 +
				"]</td>" +
				"<td>(" +
				element.esfuerzosInternosCombo4 +
				")</td>" +
				"<td>(" +
				element.reaccionExternaCombo4[0] +
				"," +
				" " +
				element.reaccionExternaCombo4[1] +
				", " +
				element.reaccionExternaCombo4[2] +
				")</td>" +
				"<td>" +
				element.derivaCombo4 +
				"</td>" +
				"<td>" +
				element.derivaChequeoCombo4 +
				"</td>" +
				"<td>(" +
				element.alaλOkCombo4 +
				")</td>" +
				"<td>(" +
				element.almaλOkCombo4 +
				")</td>" +
				"<td>(" +
				element.almaλMnOkCombo4 +
				")</td>" +
				"<td>(" +
				element.pandeoAlmaCorteCombo4 +
				")</td>" +
				"<td>(" +
				element.alaCompresionCombo4 +
				")</td>" +
				"<td>(" +
				element.almaCompresionCombo4 +
				")</td>" +
				"<td>(" +
				element.pandeoCompresionCombo4 +
				")</td>" +
				"<td>(" +
				element.chequeoCompresionCombo4 +
				")</td>" +
				"<td>(" +
				element.puntuacionCombo4 +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["resultadoFinal"] +
				")</td>" +
				"</tr>";
			//+"<br/>";
			document.getElementById(getElementByIdf).innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}

	function addTablaCodigoGenLateral(getElementByIdf, codigoGeneticoP1) {
		var fila = "";

		var final = codigoGeneticoP1.map(function(element, index, array) {
			var a = "<th scope='row'>No</th>";
			a += "<th>Perfil</th>";
			a += "<th>Tipo Elemento</th>";
			a += "<th>Coordenada Inicial (m, m)</th>";
			a += "<th>Coordenada Final (m, m)</th>";
			a += "<th>Longitud(cm)</th>";
			a += "<th>Peso(kg)</th>";
			a += "<th>Desplazamientos (Xi(cm), Yi(cm), Gi(rad), Xf(cm), Yf(cm), Gf(rad))</th>";
			a += "<th>Deriva (cm)</th>";
			a += "<th>Pesos por Nivel (kg)</th>";
			a += "<th>Desplazamiento elástico Δe (cm)</th>";
			a += "<th>Peso Edificación CP+0.5CV (kg)</th>";
			a += "<th>Periodo Fórmula Rayleigh (s)</th>";
			a += "<th>Periodo Ct*Ht^(0.75) (s)</th>";
			a += "<th>Periodo de Diseño (s)</th>";
			a += "<th>Ordenada del Espectro de Diseño (g)</th>";
			a += "<th>Cortante Basal (kgf)</th>";
			a += "<th>Coeficiente Sísmico Norma</th>";
			a += "<th>Coeficiente Sísmico Cálculo</th>";
			a += "<th>Coeficiente Sísmico Condición</th>";
			a += "<th>Fuerzas Laterales de Diseño por Nivel (kgf) </th>";

			//serían los encabezados de la tabla
			var html = "<thead><tr>" + a + "</tr></thead>";

			fila +=
				"<tr>" +
				"<td>" +
				(index + 1) +
				"</td>" +
				"<td>" +
				element.elemento +
				"</td>" +
				"<td>" +
				element.tipo +
				"</td>" +
				"<td>(" +
				element.puntoIni +
				")</td>" +
				"<td>(" +
				element.puntoFin +
				")</td>" +
				"<td>" +
				element.longitud * 100 +
				"</td>" +
				"<td>" +
				element.peso +
				"</td>" +
				"<td>[" +
				element.desplazamientoNodoIniComboLateral +
				"]</td>" +
				"<td>" +
				element.derivaComboLateral +
				"</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["pesoPisos"] +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["desplazamientoElasticoNivel"] +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["pesoEdificioSismo"] +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["periodoRayleigh"] +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["periodoTa"] +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["periodoT"] +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["aceleracionAd"] +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["cortanteBasalVo"] +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["coeficienteSismicoMin"] +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["coeficienteSismico"] +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["coeficienteSismicoCond"] +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["FuerzasSismoPiso"] +
				")</td>" +
				"</tr>";
			//+"<br/>";
			document.getElementById(getElementByIdf).innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}

	function addTablaCodigoGen6(getElementByIdf, codigoGeneticoP1) {
		var fila = "";

		var final = codigoGeneticoP1.map(function(element, index, array) {
			var a = "<th scope='row'>No</th>";
			a += "<th>Perfil</th>";
			a += "<th>Tipo Elemento</th>";
			a += "<th>Coordenada Inicial (m, m)</th>";
			a += "<th>Coordenada Final (m, m)</th>";
			a += "<th>Longitud(cm)</th>";
			a += "<th>Peso(kg)</th>";
			a += "<th>Desplazamientos (Xi(cm), Yi(cm), Gi(rad), Xf(cm), Yf(cm), Gf(rad))</th>";
			a += "<th>Esfuerzos Internos (Xi(kg), Yi (kg), Mzi(kg-cm), Xf(kg), Yf (kg), Mzf(kg-cm))</th>";
			a += "<th>Reacciones Externas (X (kg), Y(kg), Mz(kg-cm))</th>";
			a += "<th>Deriva (cm)</th>";
			a += "<th>Deriva Chequeo</th>";
			a += "<th>Ala Flexión</th>";
			a += "<th>Alma Flexión</th>";
			a += "<th>Chequeo Flexión Ejes Débil y Fuerte</th>";
			a += "<th>Pandeo del Alma por Corte</th>";
			a += "<th>Compresión del Ala</th>";
			a += "<th>Compresión del Alma</th>";
			a += "<th>Tipo de Pandeo</th>";
			a += "<th>Chequeo compresión</th>";
			a += "<th>Puntuación Elemento</th>";
			a += "<th>Puntuación Combinación de Carga</th>";

			//serían los encabezados de la tabla
			var html = "<thead><tr>" + a + "</tr></thead>";

			fila +=
				"<tr>" +
				"<td>" +
				(index + 1) +
				"</td>" +
				"<td>" +
				element.elemento +
				"</td>" +
				"<td>" +
				element.tipo +
				"</td>" +
				"<td>(" +
				element.puntoIni +
				")</td>" +
				"<td>(" +
				element.puntoFin +
				")</td>" +
				"<td>" +
				element.longitud * 100 +
				"</td>" +
				"<td>" +
				element.peso +
				"</td>" +
				"<td>[" +
				element.desplazamientoNodoIniComboSismop +
				"]</td>" +
				"<td>(" +
				element.esfuerzosInternosComboSismop +
				")</td>" +
				"<td>(" +
				element.reaccionExternaComboSismop[0] +
				"," +
				" " +
				element.reaccionExternaComboSismop[1] +
				", " +
				element.reaccionExternaComboSismop[2] +
				")</td>" +
				"<td>" +
				element.derivaComboSismop +
				"</td>" +
				"<td>" +
				element.derivaChequeoComboSismop +
				"</td>" +
				"<td>(" +
				element.alaλOkComboSismop +
				")</td>" +
				"<td>(" +
				element.almaλOkComboSismop +
				")</td>" +
				"<td>(" +
				element.almaλMnOkComboSismop +
				")</td>" +
				"<td>(" +
				element.pandeoAlmaCorteComboSismop +
				")</td>" +
				"<td>(" +
				element.alaCompresionComboSismop +
				")</td>" +
				"<td>(" +
				element.almaCompresionComboSismop +
				")</td>" +
				"<td>(" +
				element.pandeoCompresionComboSismop +
				")</td>" +
				"<td>(" +
				element.chequeoCompresionComboSismop +
				")</td>" +
				"<td>(" +
				element.puntuacionComboSismop +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["resultadoFinal"] +
				")</td>" +
				"</tr>";
			//+"<br/>";
			document.getElementById(getElementByIdf).innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}

	function addTablaCodigoGen7(getElementByIdf, codigoGeneticoP1) {
		var fila = "";

		var final = codigoGeneticoP1.map(function(element, index, array) {
			var a = "<th scope='row'>No</th>";
			a += "<th>Perfil</th>";
			a += "<th>Tipo Elemento</th>";
			a += "<th>Coordenada Inicial (m, m)</th>";
			a += "<th>Coordenada Final (m, m)</th>";
			a += "<th>Longitud(cm)</th>";
			a += "<th>Peso(kg)</th>";
			a += "<th>Desplazamientos (Xi(cm), Yi(cm), Gi(rad), Xf(cm), Yf(cm), Gf(rad))</th>";
			a += "<th>Esfuerzos Internos (Xi(kg), Yi (kg), Mzi(kg-cm), Xf(kg), Yf (kg), Mzf(kg-cm))</th>";
			a += "<th>Reacciones Externas (X (kg), Y(kg), Mz(kg-cm))</th>";
			a += "<th>Deriva (cm)</th>";
			a += "<th>Deriva Chequeo</th>";
			a += "<th>Ala Flexión</th>";
			a += "<th>Alma Flexión</th>";
			a += "<th>Chequeo Flexión Ejes Débil y Fuerte</th>";
			a += "<th>Pandeo del Alma por Corte</th>";
			a += "<th>Compresión del Ala</th>";
			a += "<th>Compresión del Alma</th>";
			a += "<th>Tipo de Pandeo</th>";
			a += "<th>Chequeo compresión</th>";
			a += "<th>Puntuación Elemento</th>";
			a += "<th>Puntuación Combinación de Carga</th>";

			//serían los encabezados de la tabla
			var html = "<thead><tr>" + a + "</tr></thead>";

			fila +=
				"<tr>" +
				"<td>" +
				(index + 1) +
				"</td>" +
				"<td>" +
				element.elemento +
				"</td>" +
				"<td>" +
				element.tipo +
				"</td>" +
				"<td>(" +
				element.puntoIni +
				")</td>" +
				"<td>(" +
				element.puntoFin +
				")</td>" +
				"<td>" +
				element.longitud * 100 +
				"</td>" +
				"<td>" +
				element.peso +
				"</td>" +
				"<td>[" +
				element.desplazamientoNodoIniComboSismon +
				"]</td>" +
				"<td>(" +
				element.esfuerzosInternosComboSismon +
				")</td>" +
				"<td>(" +
				element.reaccionExternaComboSismon[0] +
				"," +
				" " +
				element.reaccionExternaComboSismon[1] +
				", " +
				element.reaccionExternaComboSismon[2] +
				")</td>" +
				"<td>" +
				element.derivaComboSismon +
				"</td>" +
				"<td>" +
				element.derivaChequeoComboSismon +
				"</td>" +
				"<td>(" +
				element.alaλOkComboSismon +
				")</td>" +
				"<td>(" +
				element.almaλOkComboSismop +
				")</td>" +
				"<td>(" +
				element.almaλMnOkComboSismon +
				")</td>" +
				"<td>(" +
				element.pandeoAlmaCorteComboSismon +
				")</td>" +
				"<td>(" +
				element.alaCompresionComboSismon +
				")</td>" +
				"<td>(" +
				element.almaCompresionComboSismon +
				")</td>" +
				"<td>(" +
				element.pandeoCompresionComboSismon +
				")</td>" +
				"<td>(" +
				element.chequeoCompresionComboSismon +
				")</td>" +
				"<td>(" +
				element.puntuacionComboSismon +
				")</td>" +
				"<td>(" +
				codigoGeneticoP1[0]["resultadoFinal"] +
				")</td>" +
				"</tr>";
			//+"<br/>";
			document.getElementById(getElementByIdf).innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}
	function addTablaResultados(getElementByIdf, arrayPeso, arrayPuntuacion) {
		var fila = "";
		var a = "<th scope='row'>No</th>";
		a += "<th>Peso (kg)</th>";
		a += "<th>Estabilidad-Puntuación</th>";

		//serían los encabezados de la tabla
		var html = "<thead><tr>" + a + "</tr></thead>";

		for (var i = 0; i < arrayPeso.length; i++) {
			fila +=
				"<tr>" +
				"<td>" +
				(i + 1) +
				"</td>" +
				"<td>" +
				arrayPeso[i] +
				"</td>" +
				"<td>" +
				arrayPuntuacion[i] +
				"</td>" +
				"</tr>";
			//return html + fila, fila;
		}
		document.getElementById(getElementByIdf).innerHTML = html + fila;
		return html + fila;
	}

	function dibujaGrafica(getElementByIdf, etiquetaX, etiquetaY) {
		var a =
			"<LineChart width=500 height=300 data=" + dataGraph + " margin={{top: 5, right: 30, left: 20, bottom: 5}}>";
		a += "<CartesianGrid strokeDasharray=" + "3 3" + " />";
		a += "<XAxis dataKey='" + etiquetaX + "' />";
		a += "<YAxis dataKey='" + etiquetaY + "' />";
		a += "<Tooltip />";
		a += "<Legend />";
		a += "<Line type=" + "monotone" + " dataKey=" + "pv" + " stroke=" + "#8884d8" + "	activeDot={{ r: 8 }}/>";
		a += "</LineChart>";

		document.getElementById(getElementByIdf).innerHTML = a;
	}

	function obtenerDesplazamiento(codigoGeneticoP2, tablaID, nombreCombo) {
		let cantidadaNueva = [];
		var columna = 7;
		var tabla = document.getElementById(tablaID);
		for (var i = 1; i < codigoGeneticoP2.length + 1; i++) {
			cantidadaNueva = JSON.parse(tabla.rows[i].cells[columna].innerText);
			//console.log(`Txt: ${cantidadaNueva} \tFila: ${i} \t Celda: ${columna}`);
			codigoGeneticoP2[i - 1][nombreCombo] = cantidadaNueva;
		}
		return codigoGeneticoP2;
	}

	function removeData(chart) {
		chart.data.labels.pop();
		chart.data.datasets.forEach(dataset => {
			dataset.data.pop();
		});
		chart.update();
	}
	//let myChart;
	let myChart1;
	let myChart2;
	let ctx1;
	let ctx2;
	//window.myChart;
	//var ctx = document.getElementById("grafica-peso");
	function graficaXY(unused_myChart, canvasID, arrayX, arrayY, titulo, ctx, nombreY, nombreX) {
		const existingChart = Chart.getChart(canvasID);
		if (existingChart) {
			existingChart.destroy();
		}

		ctx = document.getElementById(canvasID);
		const myChart = new Chart(ctx, {
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
	function start() {
		graficaXY(
			myChart1,
			"grafica-peso",
			historia,
			historiaPeso,
			"Peso (kg) vs. Generaciones",
			ctx1,
			"Peso (kg)",
			"Generación (No)"
		);
		graficaXY(
			myChart2,
			"grafica-estabilidad",
			historia,
			estabilidadPuntuacion,
			"Pseudo-Estabilidad vs. Generaciones",
			ctx2,
			"Pseudo-Estabilidad",
			"Generación (No)"
		);
	}
	window.onload = function() {
		start();
	};

	let resetCanvas = function() {
		document.getElementById("grafica-peso").remove(); // <canvas> element
		document.getElementById("grafica-container").append('<canvas id="grafica-peso"><canvas>');
		var canvas = document.querySelector("#grafica-peso"); //
		ctx = canvas.getContext("2d");
		ctx.canvas.width = document.getElementById("grafica-container").width();
		ctx.canvas.height = document.getElementById("grafica-container").height();

		var x = canvas.width / 2;
		var y = canvas.height / 2;
		ctx.font = "10pt Verdana";
		ctx.textAlign = "center";
		ctx.fillText("Título gráfica", x, y);
	};
	var estabilidadPuntuacion = [];
	var estabilidadY = 0;
	var poblacionIni = 20;
	let reserva;
	let clon;
	useEffect(() => {
		// Actualiza el título del documento usando la API del navegador
		window.scroll(0, 0);
		nodosCoord();
		nodosNum();
		nodosCoordVigas();
		vectorMatrizRigLocal = matrizRigidLocal();
		//tablaConectividad();
		//console.log(listaPerfiles);
		vectorMatrizRigGlobal = matrizRigidGlogal();
		//obtenerDesplazamiento(estructurasLista[0], "tabla-final", "desCombo1");
		//svg.selectAll("*").remove();
		//document.getElementById("caja-dibujo4").innerHTML = dibujoIni(codigoGeneticoP);
		//show();
		//graficaPeso();
	});
	useEffect(() => {
		window.scroll(0, 0);
	}, []);

	// Main Optimization Trigger
	const handleRunGA = () => {
		const currentPoblacion = poblacion;
		const currentGenerations = generacionesP;

		let currentStructures = [];

		// 1. Initial Population
		for (let i = 0; i < currentPoblacion; i++) {
			const initialBase = codigoGenetico();
			const structure = i === 0 ? initialBase : mutacion([...initialBase]);
			currentStructures.push({
				genes: structure,
				fitness: 0
			});
		}

		let weightHistory = [];
		let scoreHistory = [];
		let genHistory = [];

		// 2. Generation Loop
		for (let g = 0; g < currentGenerations; g++) {
			genHistory.push(g + 1);

			// Evaluate Fitness
			currentStructures.forEach(ind => {
				ind.fitness = evaluateFitness(ind.genes);
			});

			// Sort by fitness (lower is better for weight + penalty)
			currentStructures.sort((a, b) => a.fitness - b.fitness);

			const best = currentStructures[0];
			let totalWeight = 0;
			best.genes.forEach(el => (totalWeight += parseFloat(el.peso || 0)));

			weightHistory.push(totalWeight);
			scoreHistory.push(best.fitness);

			// Selection and Crossover (Keep top 50, create children)
			const parents = currentStructures.slice(0, Math.floor(currentPoblacion / 2));
			const children = [];

			while (children.length < currentPoblacion - parents.length) {
				const p1 = parents[Math.floor(Math.random() * parents.length)];
				const p2 = parents[Math.floor(Math.random() * parents.length)];

				// Simplified Crossover
				const mid = Math.floor(p1.genes.length / 2);
				const childGenes = [...p1.genes.slice(0, mid), ...p2.genes.slice(mid)];

				// Mutation
				const mutatedGenes = Math.random() < 0.2 ? mutacion(childGenes) : childGenes;

				children.push({
					genes: mutatedGenes,
					fitness: 0
				});
			}

			currentStructures = [...parents, ...children];
		}

		// Update results
		const finalBest = currentStructures[0];
		// Final Detailed Analysis for the best structure
		const finalResult = analyzeStructure(finalBest.genes);

		setCalcResults({
			conectividad: finalBest.genes,
			mejorEstructura: finalBest.genes,
			historia: genHistory,
			pesoHistoria: weightHistory,
			scoreHistoria: scoreHistory,
			displacements: finalResult ? finalResult.displacements : [],
			globalK: finalResult ? finalResult.globalK : null,
			seismicData: finalResult ? finalResult.seismicData : null
		});

		updateCharts(genHistory, weightHistory, scoreHistory);
		alert("Optimización completada.");
	};

	const updateCharts = (history, weights, scores) => {
		const ctx1 = document.getElementById("grafica-weight");
		const ctx2 = document.getElementById("grafica-stability");

		if (ctx1 && ctx2) {
			graficaXY(null, "grafica-weight", history, weights, "Peso (kg) vs Generación", ctx1, "Peso (kg)", "Gen");
			graficaXY(null, "grafica-stability", history, scores, "Estabilidad vs Generación", ctx2, "Score", "Gen");
		}
	};
	return (
		<div className="calculus-container container-fluid">
			<div className="title-section">
				<h1 className="title">
					Optimización Estructural con Algoritmos Genéticos
					<span className="d-block text-muted small mt-2">Análisis Estático ({is3D ? "3D" : "2D"})</span>
				</h1>
			</div>

			<div className="control-panel">
				<div className="control-row">
					<div className="input-group">
						<label>Cálculo</label>
						<div className="mode-toggle">
							<button className={!is3D ? "active" : ""} onClick={() => setIs3D(false)}>
								2D
							</button>
							<button className={is3D ? "active" : ""} onClick={() => setIs3D(true)}>
								3D
							</button>
						</div>
					</div>
					<div className="input-group">
						<label>Población</label>
						<input
							type="number"
							style={{ width: "70px" }}
							value={poblacion}
							onChange={e => setPoblacion(parseInt(e.target.value))}
						/>
					</div>
					<div className="input-group">
						<label>Generaciones</label>
						<input
							type="number"
							style={{ width: "70px" }}
							value={generacionesP}
							onChange={e => setGeneracionesP(parseInt(e.target.value))}
						/>
					</div>
					<div className="input-group">
						<label>Diagonales</label>
						<select value={solucion} onChange={e => setSolucion(e.target.value)} className="select-modern">
							<option value="Global">Globales</option>
							<option value="Local">Locales</option>
						</select>
					</div>
					<div className="input-group">
						<label>Deformada</label>
						<div className="mode-toggle">
							<button
								className={!showDeformation ? "active" : ""}
								onClick={() => setShowDeformation(false)}>
								Off
							</button>
							<button
								className={showDeformation ? "active" : ""}
								onClick={() => setShowDeformation(true)}>
								On
							</button>
						</div>
					</div>
					{showDeformation && (
						<div className="input-group">
							<label>Escala: {defScale}</label>
							<input
								type="range"
								min="1"
								max="2000"
								value={defScale}
								onChange={e => setDefScale(parseInt(e.target.value))}
								style={{ width: "100px" }}
							/>
						</div>
					)}
					<button className="btnPaso ms-auto" onClick={handleRunGA}>
						Optimizar
					</button>
				</div>
			</div>

			<div className="row g-4 mb-4">
				<div className="col-lg-6">
					<div className="matrix-card">
						<div className="card-header">
							<h3>Visualización</h3>
						</div>
						<div className="card-body">
							<div className="visualization-box">
								{(() => {
									const nCol = actions.getNoColumnas();
									const nPisos = actions.getNoPisos();
									const dVano = actions.getLuzVano();
									const dPiso = actions.getEntrePiso();
									const totalW = (nCol - 1) * dVano;
									const totalH = nPisos * dPiso;
									const totalD = is3D ? dVano : 0;

									// Estimate isometric bounds
									const p1 = project3D(0, 0, 0);
									const p2 = project3D(totalW, 0, 0);
									const p3 = project3D(0, totalH, 0);
									const p4 = project3D(0, 0, totalD);
									const p5 = project3D(totalW, totalH, totalD);

									const minX = Math.min(p1.x, p2.x, p3.x, p4.x, p5.x) - 5;
									const maxX = Math.max(p1.x, p2.x, p3.x, p4.x, p5.x) + 5;
									const minY = Math.min(p1.y, p2.y, p3.y, p4.y, p5.y) - 5;
									const maxY = Math.max(p1.y, p2.y, p3.y, p4.y, p5.y) + 5;

									return (
										<svg
											id="caja-drawing"
											viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}>
											{calcResults.mejorEstructura ? (
												calcResults.mejorEstructura.map((el, i) => {
													const ux_i = showDeformation
														? (calcResults.displacements[el.vectorX[0]] || 0) * defScale
														: 0;
													const uy_i = showDeformation
														? (calcResults.displacements[el.vectorX[1]] || 0) * defScale
														: 0;
													const uz_i =
														showDeformation && is3D
															? (calcResults.displacements[el.vectorX[2]] || 0) * defScale
															: 0;

													const ux_f = showDeformation
														? (calcResults.displacements[el.vectorY[0]] || 0) * defScale
														: 0;
													const uy_f = showDeformation
														? (calcResults.displacements[el.vectorY[1]] || 0) * defScale
														: 0;
													const uz_f =
														showDeformation && is3D
															? (calcResults.displacements[el.vectorY[2]] || 0) * defScale
															: 0;

													const start_orig = project3D(
														el.puntoIni[0],
														el.puntoIni[1],
														el.puntoIni[2] || 0
													);
													const end_orig = project3D(
														el.puntoFin[0],
														el.puntoFin[1],
														el.puntoFin[2] || 0
													);

													const start_def = project3D(
														el.puntoIni[0] + ux_i,
														el.puntoIni[1] + uy_i,
														(el.puntoIni[2] || 0) + uz_i
													);
													const end_def = project3D(
														el.puntoFin[0] + ux_f,
														el.puntoFin[1] + uy_f,
														(el.puntoFin[2] || 0) + uz_f
													);

													const isDiagonal = el.tipo === "Diagonal";

													return (
														<g key={i}>
															{showDeformation && (
																<line
																	x1={start_orig.x || 0}
																	y1={start_orig.y || 0}
																	x2={end_orig.x || 0}
																	y2={end_orig.y || 0}
																	stroke="#334155"
																	strokeWidth="0.05"
																	strokeDasharray="0.5,0.5"
																/>
															)}
															<line
																x1={start_def.x || 0}
																y1={start_def.y || 0}
																x2={end_def.x || 0}
																y2={end_def.y || 0}
																stroke={
																	isDiagonal
																		? "#00f2fe"
																		: showDeformation
																			? "#22c55e"
																			: "#ffffff"
																}
																strokeWidth={isDiagonal ? "0.1" : "0.3"}
																strokeOpacity={isDiagonal ? "0.6" : "0.9"}
															/>
															<text
																x={((start_def.x || 0) + (end_def.x || 0)) / 2}
																y={((start_def.y || 0) + (end_def.y || 0)) / 2}
																fontSize="0.8"
																fill={isDiagonal ? "#00f2fe" : "#ffffff"}
																textAnchor="middle"
																dominantBaseline="middle"
																opacity="0.4">
																{el.elemento}
															</text>
														</g>
													);
												})
											) : (
												<text x="0" y="-5" fill="#666" fontSize="2">
													Inicie la optimización...
												</text>
											)}
										</svg>
									);
								})()}
							</div>
						</div>
					</div>
				</div>
				<div className="col-lg-6">
					<div className="matrix-card">
						<div className="card-header">
							<h3>Conectividad</h3>
						</div>
						<div className="card-body">
							<div className="table-responsive">
								<table className="matrix-table">
									<thead>
										<tr>
											<th>Item</th>
											<th>Perfil</th>
											<th>L(m)</th>
											<th>A</th>
											<th>I</th>
										</tr>
									</thead>
									<tbody>
										{calcResults.mejorEstructura &&
											calcResults.mejorEstructura.map((el, i) => (
												<tr key={i}>
													<td>{i + 1}</td>
													<td>{el.elemento}</td>
													<td>
														{(el.longitud && parseFloat(el.longitud).toFixed(2)) || "0.00"}
													</td>
													<td>{el.area}</td>
													<td>{el.inercia}</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>

			{calcResults.seismicData && (
				<div className="row g-4 mb-4">
					<div className="col-12">
						<div className="matrix-card">
							<div className="card-header">
								<h3>Resumen de Análisis Sísmico (COVENIN 1756)</h3>
							</div>
							<div className="card-body">
								<div className="row">
									<div className="col-md-3">
										<div className="note-box">
											<strong>Peso Sísmico Total (W)</strong>
											<div className="h4 text-info">
												{parseFloat(calcResults.seismicData.W_total).toFixed(2)} kg
											</div>
										</div>
									</div>
									<div className="col-md-3">
										<div className="note-box">
											<strong>Corte Basal (V)</strong>
											<div className="h4 text-info">
												{parseFloat(calcResults.seismicData.V_base).toFixed(2)} kg
											</div>
										</div>
									</div>
									<div className="col-md-3">
										<div className="note-box">
											<strong>Aceleración Sa(T)</strong>
											<div className="h4 text-info">
												{parseFloat(calcResults.seismicData.Sa).toFixed(3)} g
											</div>
										</div>
									</div>
									<div className="col-md-3">
										<div className="note-box">
											<strong>Deriva Máxima (Δ/h)</strong>
											<div className="h4 text-warning">
												{Math.max(...calcResults.seismicData.drifts).toFixed(5)}
											</div>
											<small
												className={
													Math.max(...calcResults.seismicData.drifts) > 0.015
														? "text-danger"
														: "text-success"
												}>
												{Math.max(...calcResults.seismicData.drifts) > 0.015
													? "✘ Excede límite (0.015)"
													: "✔ Dentro del límite"}
											</small>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="row g-4 mb-4">
				<div className="col-12">
					<div className="matrix-card">
						<div className="card-header pb-0">
							<div className="d-flex justify-content-between align-items-center w-100">
								<h3>Transparencia de Cálculo (Matrices)</h3>
								<div className="input-group m-0" style={{ flexDirection: "row", alignItems: "center" }}>
									<label className="me-2 mb-0">Ver:</label>
									<select
										value={selectedMatrix}
										onChange={e => setSelectedMatrix(e.target.value)}
										className="select-modern">
										<option value="Global">Matriz de Rigidez Global</option>
										{calcResults.mejorEstructura &&
											calcResults.mejorEstructura.map((el, idx) => (
												<option key={idx} value={idx}>
													Elemento {idx + 1}: {el.elemento}
												</option>
											))}
									</select>
								</div>
							</div>
						</div>
						<div className="card-body">
							{selectedMatrix === "Global" ? (
								<MatrixViewer data={calcResults.globalK} title="Matriz de Rigidez Global (K)" />
							) : (
								<MatrixViewer
									data={
										calcResults.mejorEstructura &&
										calcResults.mejorEstructura[selectedMatrix] &&
										calcResults.mejorEstructura[selectedMatrix].rigidez
									}
									title={`Matriz de Rigidez del Elemento ${parseInt(selectedMatrix) + 1} (${
										calcResults.mejorEstructura[selectedMatrix].elemento
									})`}
								/>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="row g-4">
				<div className="col-md-6">
					<div className="matrix-card">
						<div className="card-header">
							<h3>Peso (kg)</h3>
						</div>
						<div className="card-body">
							<canvas id="grafica-weight" height="250" />
						</div>
					</div>
				</div>
				<div className="col-md-6">
					<div className="matrix-card">
						<div className="card-header">
							<h3>Estabilidad</h3>
						</div>
						<div className="card-body">
							<canvas id="grafica-stability" height="250" />
						</div>
					</div>
				</div>
			</div>

			<div className="text-center pb-5">
				<Link to="/" className="btn btn-outline-secondary">
					Volver al Home
				</Link>
			</div>
		</div>
	);
}

Calculus.displayName = "Calculus";
export default Calculus;

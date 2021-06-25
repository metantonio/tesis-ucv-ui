import React, { useState, useEffect, useContext, Component, PureComponent } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import { render } from "react-dom";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";
import "../../styles/calculus.scss";
import { array, element, func } from "prop-types";
import { atan2, chain, derivative, e, evaluate, log, pi, pow, round, sqrt, inv, matrix } from "mathjs";
import { create, all } from "mathjs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import App from "./App";
import Chart from "chart.js/auto";

const math = create(all, {});
const rootElement = document.getElementById("grafica-evolucion1");
function Calculus() {
	const { store, actions } = useContext(Context);
	//const [noColumnas, setNoColumnas] = useState("");
	var x1 = 0;
	var x2 = 0;
	var y1 = 20;
	var y2 = 15;
	var drawLines = "";
	var drawLines2 = "";
	var drawText = "";
	//var i = 2;
	var noCol = actions.getNoColumnas() * actions.getNoPisos();
	var noVig = actions.getNoPisos * (actions.getNoColumnas - 1);
	var nodosCoordenadas = [];
	var nodosCoordenadasV = [];
	var nodosNumeros = [];
	var u = 0;
	var v = 0;
	var uv = [];
	//var vectorConectividad = [];
	var vectorConectividadf = [];
	var vectorConectividadf1 = [];
	var vectorConectividadf2 = [];
	var vectorConectividadf22 = [];
	var listaPerfiles = actions.getPerfilIPN();
	var listaIPN = actions.getPerfilIPN();
	var listUPL = actions.getPerfilUPL();
	var listaPerfiles = listaPerfiles.concat(listUPL);
	var repetir = 0;
	var exagerar = 1;
	var limitePlasticoIAla = 0.3 * Math.sqrt(2100000 / 4200);
	var limiteCompactoIAla = 0.376 * Math.sqrt(2100000 / 4200);
	var limiteNoCompactoIAla = 0.816 * Math.sqrt(2100000 / (4200 - 700));
	var limitePlasticoIAlma = 3.0 * Math.sqrt(2100000 / 4200);
	var limiteCompactoIAlma = 3.7 * Math.sqrt(2100000 / 4200);
	var limiteNoCompactoIAlma = 5.61 * Math.sqrt(2100000 / 4200);
	var limiteCompactoUAnchoEspesor = 0.3 * Math.sqrt(2100000 / 4200);
	var limiteEsbeltezU = 5.78 ** Math.sqrt(2100000 / 4200); //si ND3
	var generaciones = 1;
	var historiapesoy = 0;
	var historiax = 0;
	var historia = [];
	var historiaPeso = [];
	var texto = "";
	var entropia = 0;

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

	let nodosCoord = () => {
		for (var i = 0; i <= actions.getNoColumnas() - 1; i++) {
			u = i * actions.getLuzVano();
			for (var j = 0; j <= actions.getNoPisos(); j++) {
				v = j * actions.getEntrePiso();
				uv = [u, v];
				nodosCoordenadas.push(uv);
			}
		}
		//console.log("nodosCoordColumnas", nodosCoordenadas);
		return nodosCoordenadas;
	};

	let nodosCoordVigas = () => {
		for (var i = 0; i <= actions.getNoPisos(); i++) {
			v = i * actions.getEntrePiso();
			for (var j = 0; j <= actions.getNoColumnas() - 1; j++) {
				u = j * actions.getLuzVano();
				uv = [u, v];
				nodosCoordenadasV.push(uv);
			}
		}
		//console.log("nodosCoordVigas", nodosCoordenadasV, nodosCoordenadasV.length);
		return nodosCoordenadasV;
	};

	let nodosNum = () => {
		for (var i = 0; i <= actions.getNoColumnas() - 1; i++) {
			u = i;
			for (var j = 0; j <= actions.getNoPisos(); j++) {
				v = j;
				uv = [u, v];
				nodosNumeros.push(uv);
			}
		}
		//console.log("nodosNum", nodosNumeros);
		return nodosNumeros;
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

	let matchCoord2 = vector => {
		let matchCoordenadas = {
			coordMetro: nodosCoordenadas,
			coordNum: nodosNumeros
		};
		//console.log("vector para match", vector);
		//console.log("vector a comparar", matchCoordenadas["coordMetro"]);
		let match = [];
		//console.log("long lista nodos", nodosNumeros.length);
		var n = 0;
		var p = 0;
		nodosCoordenadas.forEach(element => {
			//console.log("loop función matchCoord", element);
			//console.log("index?", n);
			var elementString = String(element);
			var vectoString = String(vector);
			if (elementString == vectoString) {
				p = 3 * (n + 1);
				match = [p - 3, p - 2, p - 1];
				//console.log("aquí hubo el match");
			}
			n++;
		});
		//console.log("match", match);
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

		for (var i = 0; i < aleatorio(1, actions.getNoPisos() * actions.getNoColumnas()); i++) {
			item = listUPL[Math.floor(Math.random() * listUPL.length)]; //de donde copiará los perfiles aleatorios
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
			while (
				elementos["puntoIni"][0] == elementos["puntoFin"][0] ||
				elementos["puntoIni"][1] == elementos["puntoFin"][1]
			) {
				elementos["puntoFin"] = nodosCoordenadasV[Math.floor(Math.random() * nodosCoordenadasV.length)];
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
	var vectorMatrizRigLocal = [];
	var vectorMatrizRigGlobal = [];

	let matrizRigidLocal = () => {
		let matriz = [[], [], [], [], [], []];
		let vectorMatrizRigL = [];
		vectorMatrizRigLocal = [];
		vectorConectividadf.forEach(element => {
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

	let matrizRigidGlogal = () => {
		let matrizL = [[], [], [], [], [], []];
		let matrizLtras = [[], [], [], [], [], []];
		let vectorMatrizLtras = [];
		let vectorMatrizL = [];
		vectorMatrizRigGlobal = [];
		var multi1 = [];
		vectorConectividadf.forEach(element => {
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
		var vectorGenetico = [];
		vectorGenetico = vectorConectividadf;
		var vector = [];
		vector = matrizRigidGlogal();
		//console.log("vectorGenetico", vectorGenetico);
		var n = 0;
		//console.log("vector rigidez global", vector);
		var final = vectorGenetico.map(function(element, index, array) {
			element["rigidez"] = vector[n];
			n++;
			return element;
		});
		//console.log("final", final);
		vectorGenetico = [];
		//vectorGenetico=final;
		return final;
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

	let rigidezTotal = () => {
		matrizRigidezTotal = [];
		let numNodosu = 0;
		var tempy = 0;
		var tempx = 0;
		var stop = 0;
		//console.log(actions.getNoPisos(), actions.getNoColumnas());
		numNodosu = (parseInt(actions.getNoPisos()) + 1) * parseInt(actions.getNoColumnas()) * 3;
		//console.log("No de nodos", numNodosu);
		for (var a = 0; a < numNodosu; a++) {
			matrizRigidezTotal[a] = new Array(numNodosu).fill(0);
			for (var b = 0; b < numNodosu; b++) {
				matrizRigidezTotal[a][b] = 0;
			}
		}
		//console.log(matrizRigidezTotal);
		for (var i = 0; i <= numNodosu - 2; i += 3) {
			for (var j = 0; j <= numNodosu - 2; j += 3) {
				//console.log("Posición Matriz Rig Total:", i, j);
				codigoGeneticoP.forEach(element => {
					//esquina superior izquierda de la matriz rigidez k
					//console.log("element y element.VectorX Y[0]", element, element.vectorX[0], element.vectorY[0]);
					if ((element.vectorX[0] == i) & (element.vectorX[0] == j)) {
						stop = 0;
						for (var k = 0; k <= 2; k++) {
							for (var m = 0; m <= 2; m++) {
								//console.log("Esquina sup-izq posicion", k, m);
								matrizRigidezTotal[i + k][m + j] += element.rigidez[k][m];
								stop++;
								if (stop > numNodosu * 10) {
									break;
								}
								//console.log(matrizRigidezTotal);
							}
						}
					} else {
						//esquina superior derecha de la matriz rigidez k
						if ((element.vectorX[0] == i) & (element.vectorY[0] == j)) {
							stop = 0;
							for (var k = 0; k <= 2; k++) {
								tempy = 0;
								for (var m = 3; m <= 5; m++) {
									//console.log("IF esquina sup-derecha pos,", k, m);
									matrizRigidezTotal[i + k][tempy + j] += element.rigidez[k][m];
									tempy++;
									//console.log(matrizRigidezTotal);
									stop++;
									if (stop > numNodosu * 10) {
										break;
									}
								}
							}
						} else {
							//esquina inferior izquierda de la matriz rigidez k
							if ((element.vectorX[0] == j) & (element.vectorY[0] == i)) {
								tempx = 0;
								stop = 0;
								for (var k = 3; k <= 5; k++) {
									for (var m = 0; m <= 2; m++) {
										//console.log("IF esquina inf-izquierda pos,", k, m);
										matrizRigidezTotal[i + tempx][m + j] += element.rigidez[k][m];
										//console.log(matrizRigidezTotal);
										stop++;
										if (stop > numNodosu * 10) {
											break;
										}
									}
									tempx++;
								}
							} else {
								//esquina inferior derecha de la matriz rigidez k
								//console.log("esquina inf-derecha,", i, j);
								//console.log("element.vectoyY[0]", element.vectoyY[0]);
								if ((element.vectorY[0] == i) & (element.vectorY[0] == j)) {
									tempx = 0;
									stop = 0;
									//console.log("esquina inf-derecha en el IF,", i, j);
									for (var k = 3; k <= 5; k++) {
										tempy = 0;
										for (var m = 3; m <= 5; m++) {
											//console.log("tempx, tempy, ", tempx, tempy);
											//.log("IF esquina inf-derecha pos, ", k, m);
											//console.log("Matriz Rigidez Total Pos..., ", i + tempx, tempy + j);
											matrizRigidezTotal[i + tempx][tempy + j] += element.rigidez[k][m];
											stop++;
											if (stop > numNodosu * 100) {
												break;
											}
											//console.log(matrizRigidezTotal);
											tempy++;
										}
										tempx++;
									}
								} //aquí cierra el IF comentado
							}
						}
					}
					return matrizRigidezTotal;
				});
			}
		}
		//console.log("matriz de rigidez total", matrizRigidezTotal);
		return matrizRigidezTotal;
	};

	let rigidezTotal2 = codigoGeneticoP1 => {
		matrizRigidezTotal = [];
		var codigoGeneticoP2 = codigoGeneticoP1;
		let numNodosu = 0;
		var tempy = 0;
		var tempx = 0;
		var stop = 0;
		//console.log(actions.getNoPisos(), actions.getNoColumnas());
		numNodosu = (parseInt(actions.getNoPisos()) + 1) * parseInt(actions.getNoColumnas()) * 3;
		//console.log("No de nodos", numNodosu);
		for (var a = 0; a < numNodosu; a++) {
			matrizRigidezTotal[a] = new Array(numNodosu).fill(0);
			for (var b = 0; b < numNodosu; b++) {
				matrizRigidezTotal[a][b] = 0;
			}
		}
		//console.log(matrizRigidezTotal);
		for (var i = 0; i <= numNodosu - 2; i += 3) {
			for (var j = 0; j <= numNodosu - 2; j += 3) {
				//console.log("Posición Matriz Rig Total:", i, j);
				codigoGeneticoP2.forEach(element => {
					//esquina superior izquierda de la matriz rigidez k
					//console.log("element y element.VectorX Y[0]", element, element.vectorX[0], element.vectorY[0]);
					if ((element.vectorX[0] == i) & (element.vectorX[0] == j)) {
						stop = 0;
						for (var k = 0; k <= 2; k++) {
							for (var m = 0; m <= 2; m++) {
								//console.log("Esquina sup-izq posicion", k, m);
								matrizRigidezTotal[i + k][m + j] += element.rigidez[k][m];
								stop++;
								if (stop > numNodosu * 10) {
									break;
								}
								//console.log(matrizRigidezTotal);
							}
						}
					} else {
						//esquina superior derecha de la matriz rigidez k
						if ((element.vectorX[0] == i) & (element.vectorY[0] == j)) {
							stop = 0;
							for (var k = 0; k <= 2; k++) {
								tempy = 0;
								for (var m = 3; m <= 5; m++) {
									//console.log("IF esquina sup-derecha pos,", k, m);
									matrizRigidezTotal[i + k][tempy + j] += element.rigidez[k][m];
									tempy++;
									//console.log(matrizRigidezTotal);
									stop++;
									if (stop > numNodosu * 10) {
										break;
									}
								}
							}
						} else {
							//esquina inferior izquierda de la matriz rigidez k
							if ((element.vectorX[0] == j) & (element.vectorY[0] == i)) {
								tempx = 0;
								stop = 0;
								for (var k = 3; k <= 5; k++) {
									for (var m = 0; m <= 2; m++) {
										//console.log("IF esquina inf-izquierda pos,", k, m);
										matrizRigidezTotal[i + tempx][m + j] += element.rigidez[k][m];
										//console.log(matrizRigidezTotal);
										stop++;
										if (stop > numNodosu * 10) {
											break;
										}
									}
									tempx++;
								}
							} else {
								//esquina inferior derecha de la matriz rigidez k
								//console.log("esquina inf-derecha,", i, j);
								//console.log("element.vectoyY[0]", element.vectoyY[0]);
								if ((element.vectorY[0] == i) & (element.vectorY[0] == j)) {
									tempx = 0;
									stop = 0;
									//console.log("esquina inf-derecha en el IF,", i, j);
									for (var k = 3; k <= 5; k++) {
										tempy = 0;
										for (var m = 3; m <= 5; m++) {
											//console.log("tempx, tempy, ", tempx, tempy);
											//.log("IF esquina inf-derecha pos, ", k, m);
											//console.log("Matriz Rigidez Total Pos..., ", i + tempx, tempy + j);
											matrizRigidezTotal[i + tempx][tempy + j] += element.rigidez[k][m];
											stop++;
											if (stop > numNodosu * 100) {
												break;
											}
											//console.log(matrizRigidezTotal);
											tempy++;
										}
										tempx++;
									}
								} //aquí cierra el IF comentado
							}
						}
					}
					return matrizRigidezTotal;
				});
			}
		}
		//console.log("matriz de rigidez total", matrizRigidezTotal);
		return matrizRigidezTotal;
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
	let vectorFuerzasInternas = [];
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
		var column = 0;
		for (var i = 0; i < matrix.length; i++) {
			column = matrix[i][col];
		}
		console.log("getCol", matrix[i][col]);
		return matrix[i][col];
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

	var matrizReducidaInversa = [];

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

	var vectorFuerzasInternasRedux = [];
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

	var vectorDesplazamientos = [];
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

			//Derivas
			if (element["tipo"] == "Columna") {
				//el elemento
				element["deriva"] = (element["desplazamientoNodoIni"][3] - element["desplazamientoNodoIni"][0]).toFixed(
					3
				);
				if (Math.abs(element.deriva / parseFloat(100 * actions.getEntrePiso())) != 0.012) {
					//para el grupo A debe ser menor a 0.012 según 1756-01 tabla 10.1

					puntuacion += 1 / (1 - 1 / (0.012 - element.deriva / parseFloat(100 * actions.getEntrePiso())));
				} else {
				}
			} else {
				element["deriva"] = 0;
			}

			if (element["tipo"] == "Columna") {
				//el elemento
				if (Math.abs(element.deriva / parseFloat(100 * actions.getEntrePiso())) <= 0.012) {
					//para el grupo A debe ser menor a 0.012 según 1756-01 tabla 10.1
					element["derivaChequeo"] = "Cumple";
				} else {
					element["derivaChequeo"] = "No Cumple";
				}
			}

			if (element["tipo"] != "Diagonal") {
				//evaluación del ala flexión
				element["alaλ"] = element.bf / element.tf;
				if (element["alaλ"] <= limiteCompactoIAla) {
					element["alaλOk"] = "Compacta";
					puntuacion += 1;
				} else {
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
					puntuacion += 0.5;
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
					puntuacion += 0.5;
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
					element["puntuacion"] = puntuacion + 2 / (element["peso"] - 6.08 * element["longitud"]);
				} else {
					element["puntuacion"] = puntuacion + 2;
				}
			} else {
				//console.log("puntuación", puntuacion);
				if (element["peso"] - (6.1 * element["longitud"]).toFixed(2) != 0) {
					element["puntuacion"] = puntuacion + 1 / (element["peso"] - 6.1 * element["longitud"]);
				} else {
					element["puntuacion"] = puntuacion + 2;
				}
			}

			//guarda el valor de la puntuación del elemento es una variable acumulativa temporal
			resultado += element["puntuacion"];
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
		//evaluación del codigo genético de genera correctamente después de correr los casos de carga
		codigoGeneticoP1[0]["evaluacionCodigoGenetico"] =
			parseFloat(codigoGeneticoP1[0]["resultadoCombo1"]) +
			parseFloat(codigoGeneticoP1[0]["resultadoCombo2"]) +
			parseFloat(codigoGeneticoP1[0]["resultadoCombo3"]) +
			parseFloat(codigoGeneticoP1[0]["resultadoCombo4"]) +
			parseFloat(codigoGeneticoP1[0]["resultadoComboSismop"]);
		//parseFloat(codigoGeneticoP1[0]["resultadoComboLateral"]);
		//console.log(codigoGeneticoP1);
		codigoGeneticoP1[0]["pesoEstructura"] = peso;
		return codigoGeneticoP1;
	}

	var estructurasLista = [];
	function listaEstructuras(codigoGen) {
		estructurasLista.push(codigoGen);
		estructurasLista = estructurasLista.sort(function(a, b) {
			return b[0].evaluacionCodigoGenetico - a[0].evaluacionCodigoGenetico;
		});
		//console.log("lista de Estructuras", estructurasLista);
		if (estructurasLista.length > poblacionIni * 2) {
			estructurasLista = estructurasLista.slice(0, poblacionIni * 2);
		}
		//console.log("lista de Estructuras", estructurasLista);
		return estructurasLista;
	}
	var desplazamientosFinalesLista = [];

	function listaEstructuraPush(codigoGen) {
		estructurasLista.push(codigoGen);

		//console.log("lista de Estructuras", estructurasLista);
		return estructurasLista;
	}

	function listaOrden() {
		estructurasLista = estructurasLista.sort(function(a, b) {
			return b[0].evaluacionCodigoGenetico - a[0].evaluacionCodigoGenetico;
		});
		if (estructurasLista.length > poblacionIni * 2) {
			estructurasLista = estructurasLista.slice(0, poblacionIni * 2);
		}
		//console.log("lista de Estructuras", estructurasLista);
		return estructurasLista;
	}

	function cruceGenetico1(primeroLista, segundoLista) {
		let cruce1 = [];
		let cruce2 = [];
		var cod1 = primeroLista;
		var cod2 = segundoLista;
		let listaCruce = [];
		if (segundoLista.length > 1) {
			var cantidadCol = parseInt(actions.getNoColumnas()) * parseInt(actions.getNoPisos());
			//console.log(cantidadCol);
			var mediaCol = Math.floor(cantidadCol / 2);

			var cantidadVig = (parseInt(actions.getNoColumnas()) - 1) * parseInt(actions.getNoPisos());
			var mediaVig = Math.floor(cantidadVig / 2);
			//console.log("mediaCol mediaVig", mediaCol, mediaVig);
			//var cantidadDiag1 = listaE[0].length - cantidadVig - cantidadCol;
			//var cantidadDiag2 = listaE[1].length - cantidadVig - cantidadCol;
			//primer cruce:
			//console.log("cod1[0]", cod1); //hay que convertir listaE[0][0] en array (mapearlo)
			for (var i = 0; i < mediaCol; i++) {
				//console.log("cod1[0][i]", i, cod1[i]);
				cruce1.push(cod1[i]);
				//cruce1.push(Object.entries(cod1[i]));
			}
			for (var i = mediaCol; i < cantidadCol; i++) {
				cruce1.push(cod2[i]);
			}
			for (var i = cantidadCol; i < cantidadCol + mediaVig; i++) {
				cruce1.push(cod1[i]);
			}
			for (var i = cantidadCol + mediaVig; i < cantidadCol + cantidadVig; i++) {
				cruce1.push(cod2[i]);
			}
			for (var i = cantidadCol + cantidadVig; i < primeroLista.length; i++) {
				cruce1.push(cod1[i]);
			}
			//segundo cruce:
			for (var i = 0; i < mediaCol; i++) {
				cruce2[i] = cod2[i];
			}
			for (var i = mediaCol; i < cantidadCol; i++) {
				cruce2[i] = cod1[i];
			}
			for (var i = cantidadCol; i < cantidadCol + mediaVig; i++) {
				cruce2[i] = cod2[i];
			}
			for (var i = cantidadCol + mediaVig; i < cantidadCol + cantidadVig; i++) {
				cruce2[i] = cod1[i];
			}
			for (var i = cantidadCol + cantidadVig; i < segundoLista.length; i++) {
				cruce2[i] = cod2[i];
			}
			//console.log("cruce1", cruce1);
			listaCruce.push(cruce1);
			listaCruce.push(cruce2);
			//estructurasLista.push(cruce1);
			//estructurasLista.push(cruce2);
		}
		//console.log("listaCruce", listaCruce);
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
	var drawini = "";
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

	function mutacion(codigoGeneticoP1) {
		var numeroAleatorio = aleatorio(0, 2);

		if (numeroAleatorio == 1) {
			if (codigoGeneticoP1[codigoGeneticoP1.length - 1].tipo == "Diagonal") {
				var filter = codigoGeneticoP1.filter((element, index) => index < codigoGeneticoP1.length - 1);

				//codigoGeneticoP1[codigoGeneticoP1.length - 1].pop();
				console.log("hubo mutación tipo 1: Eliminación de Diagonal");
				return filter;
			}
		}
		if (numeroAleatorio == 2) {
			numeroAleatorio == aleatorio(0, codigoGeneticoP1.length - 1);
			if (codigoGeneticoP1[numeroAleatorio].tipo != "Diagonal") {
				var item = listaIPN[aleatorio(0, 1)]; //de donde copiará los perfiles aleatorios

				codigoGeneticoP1[numeroAleatorio]["elemento"] = item["designacion"];
				codigoGeneticoP1[numeroAleatorio]["inercia"] = item["ix"];
				codigoGeneticoP1[numeroAleatorio]["inerciaY"] = item["iy"];
				codigoGeneticoP1[numeroAleatorio]["dmm"] = item["altura"];
				codigoGeneticoP1[numeroAleatorio]["bf"] = item["bf"];
				codigoGeneticoP1[numeroAleatorio]["tf"] = item["tf"];
				codigoGeneticoP1[numeroAleatorio]["tw"] = item["tw"];
				codigoGeneticoP1[numeroAleatorio]["sx"] = item["sx"];
				codigoGeneticoP1[numeroAleatorio]["zx"] = item["zx"];
				codigoGeneticoP1[numeroAleatorio]["rx"] = item["rx"];
				codigoGeneticoP1[numeroAleatorio]["sy"] = item["sy"];
				codigoGeneticoP1[numeroAleatorio]["zy"] = item["zy"];
				codigoGeneticoP1[numeroAleatorio]["ry"] = item["ry"];
				codigoGeneticoP1[numeroAleatorio]["jj"] = item["j"];
				codigoGeneticoP1[numeroAleatorio]["cw"] = item["cw"];
				codigoGeneticoP1[numeroAleatorio]["area"] = item["area"];
				codigoGeneticoP1[numeroAleatorio]["a"] = (
					(codigoGeneticoP1[numeroAleatorio]["elasticidad"] * codigoGeneticoP1[numeroAleatorio]["area"]) /
					(codigoGeneticoP1[numeroAleatorio]["longitud"] * 100)
				).toFixed(3);
				codigoGeneticoP1[numeroAleatorio]["b"] = (
					(12 *
						codigoGeneticoP1[numeroAleatorio]["elasticidad"] *
						codigoGeneticoP1[numeroAleatorio]["inercia"]) /
					Math.pow(codigoGeneticoP1[numeroAleatorio]["longitud"] * 100, 3)
				).toFixed(3);
				codigoGeneticoP1[numeroAleatorio]["c"] = (
					(6 *
						codigoGeneticoP1[numeroAleatorio]["elasticidad"] *
						codigoGeneticoP1[numeroAleatorio]["inercia"]) /
					Math.pow(codigoGeneticoP1[numeroAleatorio]["longitud"] * 100, 2)
				).toFixed(3);
				codigoGeneticoP1[numeroAleatorio]["d"] = (
					(4 *
						codigoGeneticoP1[numeroAleatorio]["elasticidad"] *
						codigoGeneticoP1[numeroAleatorio]["inercia"]) /
					(codigoGeneticoP1[numeroAleatorio]["longitud"] * 100)
				).toFixed(3);
				codigoGeneticoP1[numeroAleatorio]["e"] = (
					(2 *
						codigoGeneticoP1[numeroAleatorio]["elasticidad"] *
						codigoGeneticoP1[numeroAleatorio]["inercia"]) /
					(codigoGeneticoP1[numeroAleatorio]["longitud"] * 100)
				).toFixed(3);
				codigoGeneticoP1[numeroAleatorio]["peso"] = (
					item["peso"] * codigoGeneticoP1[numeroAleatorio]["longitud"]
				).toFixed(2);

				console.log("hubo mutación tipo 2: Cambio de Perfil");
				return codigoGeneticoP1;
			}
		}
		//cuando no hay mutación regresa el mismo código genético de entrada
		return codigoGeneticoP1;
	}

	function show() {
		var e = document.getElementById("ddlViewBy");
		var as = document.forms[0].ddlViewBy.value;
		var strUser = e.options[e.selectedIndex].text;
		//console.log(as, strUser);
		return strUser;
	}

	function botonCalcular(getElementByIdTablaFinal, coefViento, coefVariable, coefPermanente, casos) {
		var numeroCol = actions.getNoColumnas();
		var numeroPisos = actions.getNoPisos();
		var alturaEntrePiso = actions.getEntrePiso();
		var luzVano = actions.getLuzVano();
		//drawLines = dibujo();
		//drawLines2 = dibujoVigas();
		//d3.selectAll("#caja-dibujo4 > *").remove();
		d3.selectAll("#caja-dibujo4").remove();
		if (repetir > 0) {
			d3.selectAll("#matrices-rigid-local > *").remove();
			d3.selectAll("#matrices-rigid-global > *").remove();
			d3.selectAll("#matrices-rigid-total > *").remove();
			d3.selectAll("#vector-fuerzas > *").remove();
			d3.selectAll("#matriz-reducida > *").remove();
			d3.selectAll("#matriz-reducida-inversa > *").remove();
			d3.selectAll("#vector-reducido > *").remove();
			d3.selectAll("#desplazamiento-nodos > *").remove();
		}
		exagerar = 1;
		//console.log(numeroCol, numeroPisos, alturaEntrePiso, luzVano);
		// console.log(drawLines, drawLines2);
		tablaConectividad(coefViento);
		tablaConectividad2(coefVariable, coefPermanente);
		addTableConnect();
		matrizRigidLocal();
		//console.log(multiplicarMatrices(matrizEA, matrizEB));
		addMatricesRigLocal();
		//console.log("vector Matriz rigid local", vectorMatrizRigLocal);
		vectorMatrizRigGlobal = matrizRigidGlogal();
		//console.log("vector matriz rigideces coord Global", vectorMatrizRigGlobal);
		addMatricesRigGlobal();
		codigoGeneticoP = codigoGenetico(vectorMatrizRigGlobal);

		rigidezTotal();
		addMatricesRigTotal();
		vectorFuerzasInternas = funcionFuerzasInt();
		//console.log("vector Fuerzas internas def", vectorFuerzasInternas);
		addVectorFuerza(casos);
		rigidezReducida();
		addMatricesRigRedux();
		matrizReducidaInversa = matrizRigidezReduxInversa();
		addMatricesRigReduxInversa();
		//matrizInversa(matrizEjemplo);
		vectorFuerzasInternasRedux = vectorFReducido();
		addVector(vectorFuerzasInternasRedux, 2, "vector-reducido", casos);
		vectorDesplazamientos = matrizPorVector(matrizReducidaInversa, vectorFuerzasInternasRedux);
		addVector(vectorDesplazamientos, 3, "desplazamiento-nodos", casos);
		//console.log("codigo genético P", codigoGeneticoP);
		//desplazamientoEnCodigo(codigoGeneticoP);
		calculosFinales(coefViento, coefVariable, coefPermanente, codigoGeneticoP);
		addTablaFinal(getElementByIdTablaFinal, codigoGeneticoP);
		//drawLines3 = dibujoDesplazamiento();
		drawini = dibujoIni(codigoGeneticoP);
		drawLines = drawLines3 + drawText;
		//document.getElementById("caja-dibujo4").innerHTML = dibujoIni();
		document.getElementById("caja-dibujo2").innerHTML = drawLines;
		return (
			numeroPisos,
			numeroCol,
			alturaEntrePiso,
			luzVano,
			codigoGeneticoP,
			vectorDesplazamientos,
			vectorFuerzasInternasRedux
		);
	}

	function botonCalcular2(getElementByIdTablaFinal, coefViento, coefVariable, coefPermanente, casos) {
		var numeroCol = actions.getNoColumnas();
		var numeroPisos = actions.getNoPisos();
		var alturaEntrePiso = actions.getEntrePiso();
		var luzVano = actions.getLuzVano();
		//drawLines = dibujo();
		//drawLines2 = dibujoVigas();
		//d3.selectAll("#caja-dibujo4").remove();
		//console.log(numeroCol, numeroPisos, alturaEntrePiso, luzVano);
		// console.log(drawLines, drawLines2);
		//console.log(vectorConectividadf);
		reescrituraConectividadf(coefViento, codigoGeneticoP);
		//console.log(vectorConectividadf);
		reescrituraConectividadf2(coefVariable, coefPermanente, codigoGeneticoP);
		//addTableConnect();
		//matrizRigidLocal();
		//console.log(multiplicarMatrices(matrizEA, matrizEB));
		//addMatricesRigLocal();
		//console.log("vector Matriz rigid local", vectorMatrizRigLocal);
		vectorMatrizRigGlobal = matrizRigidGlogal();
		//console.log("vector matriz rigideces coord Global", vectorMatrizRigGlobal);
		//addMatricesRigGlobal();
		//codigoGeneticoP = codigoGenetico(vectorMatrizRigGlobal); //se produce un codGenetico

		rigidezTotal();
		//addMatricesRigTotal();
		vectorFuerzasInternas = funcionFuerzasInt2(codigoGeneticoP);
		//console.log("vector Fuerzas internas def", vectorFuerzasInternas);
		addVectorFuerza(casos);
		rigidezReducida();
		//addMatricesRigRedux();
		matrizReducidaInversa = matrizRigidezReduxInversa();
		//addMatricesRigReduxInversa();
		//matrizInversa(matrizEjemplo);
		vectorFuerzasInternasRedux = vectorFReducido();
		addVector(vectorFuerzasInternasRedux, 2, "vector-reducido", casos);
		vectorDesplazamientos = matrizPorVector(matrizReducidaInversa, vectorFuerzasInternasRedux);
		addVector(vectorDesplazamientos, 3, "desplazamiento-nodos", casos);
		//console.log("codigo genético P", codigoGeneticoP);
		//desplazamientoEnCodigo(codigoGeneticoP);
		calculosFinales(coefViento, coefVariable, coefPermanente, codigoGeneticoP);
		addTablaFinal(getElementByIdTablaFinal, codigoGeneticoP);
		//desplazamientosFinales(codigoGeneticoP);
		//drawLines3 = dibujoDesplazamiento();
		// drawini = dibujoIni();
		// drawLines = drawLines3 + drawText;
		// document.getElementById("caja-dibujo4").innerHTML = dibujoIni();
		// document.getElementById("caja-dibujo2").innerHTML = drawLines;
		//drawini = dibujoIni();
		return (
			numeroPisos,
			numeroCol,
			alturaEntrePiso,
			luzVano,
			codigoGeneticoP,
			vectorDesplazamientos,
			vectorFuerzasInternasRedux
		);
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
		vectorConectividadf1 = calculosFinales(0, 0, 1.4, vectorConectividadf1);
		codigoGeneticoP = vectorConectividadf1.slice();
		codigoDelCruce = vectorConectividadf1.slice();
		addTablaCodigoGen1("tabla-final", vectorConectividadf1);
		return codigoDelCruce;
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
		vectorConectividadf1 = calculosFinales(cW, CV, CP, vectorConectividadf1);
		codigoDelCruce = vectorConectividadf1.slice();
		addTablaCodigoGen22(refTabla, vectorConectividadf1);
	}
	function EvaluacionCruce(codigoDelCruce) {
		Calc1(codigoDelCruce);
		Calc2(codigoDelCruce, "tabla-final2", 0, 1.6, 1.2);
		Calc2(codigoDelCruce, "tabla-final3", 1.275, 1.275, 1.05);
		Calc2(codigoDelCruce, "tabla-final4", -1.275, 1.275, 1.05);

		evaluacionCargasLaterales(vectorConectividadf1);
		evaluacionSismo(vectorConectividadf1);
		listaEstructuraPush(vectorConectividadf1);

		obtenerDesplazamiento(vectorConectividadf1, "tabla-final", "desCombo1");
		obtenerDesplazamiento(vectorConectividadf1, "tabla-final2", "desCombo2");
		obtenerDesplazamiento(vectorConectividadf1, "tabla-final3", "desCombo3");
		obtenerDesplazamiento(vectorConectividadf1, "tabla-final4", "desCombo4");
		//obtenerDesplazamiento(vectorConectividadf1, "tabla-final5", "desComboLateral");
		codigoDelCruce = vectorConectividadf1.slice();
		return (
			vectorFuerzasInternas,
			matrizReducidaInversa,
			vectorFuerzasInternasRedux,
			vectorDesplazamientos,
			codigoDelCruce
		);
	}
	var listaAEvaluar = [];
	function BotonCruce() {
		//listaAEvaluar = [];
		repetir++;
		let cruceGen0, cruceGen1, mutacion0;
		var canti = estructurasLista.length;
		for (var i = 0; i < canti - 1; i++) {
			listaAEvaluar = cruceGenetico1(estructurasLista[i], estructurasLista[i + 1]);
			cruceGen0 = listaAEvaluar[0];
			cruceGen1 = listaAEvaluar[1];

			EvaluacionCruce(cruceGen0);
			EvaluacionCruce(cruceGen1);
			mutacion0 = mutacion(cruceGen0);
			EvaluacionCruce(mutacion0);
		}
		// listaAEvaluar = cruceGenetico1(estructurasLista[0], estructurasLista[1]);
		// var cruceGen0 = listaAEvaluar[0];
		// var cruceGen1 = listaAEvaluar[1];
		// EvaluacionCruce(cruceGen0);
		// EvaluacionCruce(cruceGen1);
		// //listaAEvaluar = [];

		// listaAEvaluar = cruceGenetico1(estructurasLista[0], estructurasLista[2]);
		// var cruceGen2 = listaAEvaluar[0];
		// var cruceGen3 = listaAEvaluar[1];
		// EvaluacionCruce(cruceGen2);
		// EvaluacionCruce(cruceGen3);
		// //listaAEvaluar = [];

		// listaAEvaluar = cruceGenetico1(estructurasLista[1], estructurasLista[2]);
		// var cruceGen4 = listaAEvaluar[0];
		// var cruceGen5 = listaAEvaluar[1];
		// EvaluacionCruce(cruceGen4);
		// EvaluacionCruce(cruceGen5);
		// //listaAEvaluar = [];

		// var mutacion0 = mutacion(cruceGen0);
		// //console.log("ver mutacion0", mutacion0);
		// EvaluacionCruce(mutacion0);

		// var mutacion1 = mutacion(cruceGen1);
		// EvaluacionCruce(mutacion1);

		// var mutacion2 = mutacion(cruceGen2);
		// EvaluacionCruce(mutacion2);

		listaOrden();
		//document.getElementById("myBtn").addEventListener("mouseover", updateDraw());
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
		//vectorConectividadf = [];
		//vectorConectividadf = vectorAux;
		return vectorConectividadf1;
	}
	function sismoVigas(cargaLateral, vectorcConectividadf22) {
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
		vectorConectividadf1 = calculosFinales(1, 0.5, 1, codigoGeneticoP1);

		metodoEstaticoEquivalente(vectorConectividadf1);
		addTablaCodigoGenLateral("tabla-final5", vectorConectividadf1);
		return vectorConectividadf1;
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

		for (var j = 0; j < listaPesoPisoAltura.length - 1; j++) {
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
		for (var j = 0; j < cargaLateral.length; j++) {
			if (j == 0) {
				//entraría en la primera columna de Planta Baja, de izquierda a derecha (la que le pegaría el Sismo)
				vectorConectividadf1[j]["fuerzainterna"] = [0, 0, 0, 0, cargaLateral[j], 0];
			} else {
				vectorConectividadf1[j]["fuerzainterna"] = [cargaLateral[j - 1], 0, 0, cargaLateral[j], 0, 0];
			}
		}

		//vectorConectividadf = [];
		//vectorConectividadf = vectorAux;
		return vectorConectividadf1;
	}
	function sismoVigas2(cargaLateral, vectorcConectividadf22) {
		//reescritura de las fuerzas internas
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
							vectorConectividadf22[i]["fuerzainterna"] = [cargaLateral[j], 0, 0, 0, 0, 0];
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
		vectorConectividadf1 = calculosFinales(10, 0.5, 1, codigoGeneticoP1); //en Sismo cW no actúa, se le puso 10 como identificación interna de la función

		//metodoEstaticoEquivalente(vectorConectividadf1);
		addTablaCodigoGen6("tabla-final6", vectorConectividadf1);
		return vectorConectividadf1;
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
	function graficaXY(myChart, canvasID, arrayX, arrayY, titulo, ctx, nombreY, nombreX) {
		//console.log("histori e historiaPeso", historia, historiaPeso);
		if (myChart != null) {
			myChart.destroy();
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

	useEffect(() => {
		// Actualiza el título del documento usando la API del navegador
		window.scroll(0, top);
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
		show();
		//graficaPeso();
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
				<div className="col-sm-4">
					<p className="save-btn">
						<button
							className="btnPaso text-center mt-12 title"
							onClick={() => {
								entropia = 0;
								//se coloca nombre de la tabla, coefViento, coefVariable, coefPermanente
								//caso 1.4 carga permanente
								botonCalcular("tabla-final", 0, 0, 1.4, "1.4CP");
								//desplazamientosFinales(codigoGeneticoP);
								entropia = 1;
								//caso 1.2CP+1.6CV
								botonCalcular2("tabla-final2", 0, 1.6, 1.2, "1.2CP+1.6CV");
								entropia = 2;
								//caso 0.75 (1.4CP + 1.7 CV + 1.7 W)
								botonCalcular2("tabla-final3", 1.275, 1.275, 1.05, "0.75 (1.4CP + 1.7 CV + 1.7 W)");
								//caso 0.75 (1.4CP + 1.7 CV - 1.7 W)
								entropia = 3;
								botonCalcular2("tabla-final4", -1.275, 1.275, 1.05, "0.75 (1.4CP + 1.7 CV - 1.7 W)");
								entropia = 4;
								botonCalcular2("tabla-final5", 1, 0.5, 1, "1CP + 1 CV +Cargas Laterales)");
								//ver código genético
								console.log("codigo genético P", codigoGeneticoP);
								repetir++; //sirve para borrar div en caso de que repetir>0
								listaEstructuras(codigoGeneticoP);

								obtenerDesplazamiento(estructurasLista[0], "tabla-final", "desCombo1");
								obtenerDesplazamiento(estructurasLista[0], "tabla-final2", "desCombo2");
								obtenerDesplazamiento(estructurasLista[0], "tabla-final3", "desCombo3");
								obtenerDesplazamiento(estructurasLista[0], "tabla-final4", "desCombo4");
								obtenerDesplazamiento(estructurasLista[0], "tabla-final5", "desComboLateral");
								console.log("Lista de las Estructuras Generadas", estructurasLista);
							}}>
							<span>Calcular una estructura al azar</span>
						</button>
						<p>
							Muestra los pasos de cálculo (no aplica Algoritmos Genéticos ni Método Estático Equivalente)
						</p>
					</p>
				</div>
				<div className="col-sm-4">
					<h4>Número de Generaciones</h4>
					<input
						className="no-columnas"
						type="number"
						placeholder="Ej: 10"
						id="generacion-box"
						name="no-columnas"
						min="1"
						step="1"
						max="100"
						onChange={e => (generaciones = document.getElementById("generacion-box").value)}
					/>
					<p>
						<span>
							Se recomienda ir de 5 generaciones en 5 para observar resultados en pc poco potentes. En
							celulares ir de 1 en 1.
						</span>
					</p>
					<h4>Población Inicial</h4>
					<input
						className="no-columnas"
						type="number"
						placeholder="Ej: 20"
						id="poblacion-box"
						name="no-columnas"
						min="3"
						step="1"
						max="200"
						onChange={e => (poblacionIni = document.getElementById("poblacion-box").value)}
					/>
					<p>
						<span>Mínimo: 3, Máx:200. Se recomienda 3 para probar en celulares.</span>
					</p>
				</div>
				<div className="col-sm-4">
					<button
						className="btnPaso text-center mt-12 title"
						id="myBtn"
						onClick={() => {
							generaciones = document.getElementById("generacion-box").value;
							while (estructurasLista.length < poblacionIni) {
								//caso 1.4 carga permanente
								entropia = 0;
								botonCalcular("tabla-final", 0, 0, 1.4, "1.4CP");
								//desplazamientosFinales(codigoGeneticoP);
								//caso 1.2CP+1.6CV
								entropia = 1;
								botonCalcular2("tabla-final2", 0, 1.6, 1.2, "1.2CP+1.6CV");
								//caso 0.75 (1.4CP + 1.7 CV + 1.7 W)
								entropia = 2;
								botonCalcular2("tabla-final3", 1.275, 1.275, 1.05, "0.75 (1.4CP + 1.7 CV + 1.7 W)");
								//caso 0.75 (1.4CP + 1.7 CV - 1.7 W)
								entropia = 3;
								botonCalcular2("tabla-final4", -1.275, 1.275, 1.05, "0.75 (1.4CP + 1.7 CV - 1.7 W)");
								//caso cargaLateral
								entropia = 4;
								botonCalcular2("tabla-final5", 1, 0.5, 1, "1CP + 1 CV +Cargas Laterales)");
								//ver código genético
								//console.log("codigo genético P", codigoGeneticoP);
								repetir++; //sirve para borrar div en caso de que repetir>0
								listaEstructuraPush(codigoGeneticoP);
								//obtenerDesplazamiento(estructurasLista[0], "tabla-final", "desCombo1");
								//obtenerDesplazamiento(estructurasLista[0], "tabla-final2", "desCombo2");
								//obtenerDesplazamiento(estructurasLista[0], "tabla-final3", "desCombo3");
								//obtenerDesplazamiento(estructurasLista[0], "tabla-final4", "desCombo4");
								//obtenerDesplazamiento(estructurasLista[0], "tabla-final5", "desComboLateral");
							}
							//A partir de este punto corre el algoritmo genético
							if (historiax > 1) {
								d3.selectAll("#tabla-final5 > *").remove();
							}
							for (var i = 0; i < generaciones; i++) {
								historiax++;
								historia.push(historiax);
								historiapesoy = 0;
								estabilidadY = 0;
								//aquí se agrega una estructura aleatoria en cada generación de individuos
								{
									//se coloca nombre de la tabla, coefViento, coefVariable, coefPermanente
									//caso 1.4 carga permanente
									entropia = 0;
									botonCalcular("tabla-final", 0, 0, 1.4, "1.4CP");
									//caso 1.2CP+1.6CV
									entropia = 1;
									botonCalcular2("tabla-final2", 0, 1.6, 1.2, "1.2CP+1.6CV");
									//caso 0.75 (1.4CP + 1.7 CV + 1.7 W)
									entropia = 2;
									botonCalcular2("tabla-final3", 1.275, 1.275, 1.05, "0.75 (1.4CP + 1.7 CV + 1.7 W)");
									//caso 0.75 (1.4CP + 1.7 CV - 1.7 W)
									entropia = 3;
									botonCalcular2(
										"tabla-final4",
										-1.275,
										1.275,
										1.05,
										"0.75 (1.4CP + 1.7 CV - 1.7 W)"
									);
									entropia = 4;
									botonCalcular2("tabla-final5", 1, 0.5, 1, "1CP + 1 CV +Cargas Laterales)");
									//ver código genético
									console.log("codigo genético P", codigoGeneticoP);
									repetir++; //sirve para borrar div en caso de que repetir>0
									listaEstructuraPush(codigoGeneticoP);
									//obtenerDesplazamiento(estructurasLista[0], "tabla-final", "desCombo1");
									//obtenerDesplazamiento(estructurasLista[0], "tabla-final2", "desCombo2");
									//obtenerDesplazamiento(estructurasLista[0], "tabla-final3", "desCombo3");
									//obtenerDesplazamiento(estructurasLista[0], "tabla-final4", "desCombo4");
									//obtenerDesplazamiento(estructurasLista[0], "tabla-final5", "desComboLateral");
								}
								BotonCruce();
								listaOrden();
								document.getElementById("caja-dibujo2").innerHTML = dibujoIni(estructurasLista[0]);
								var pesoEstructura = estructurasLista[0];
								for (var j = 0; j < pesoEstructura.length; j++) {
									if (pesoEstructura[j]["peso"] != undefined) {
										historiapesoy += parseFloat(pesoEstructura[j].peso);
									}
								}
								estabilidadY += parseFloat(pesoEstructura[0].evaluacionCodigoGenetico);
								estabilidadPuntuacion.push(estabilidadY);
								//historiaPeso.push(historiapesoy);
								historiaPeso.push(parseFloat(pesoEstructura[0].pesoEstructura));
								console.log(
									`Peso ${historiapesoy}kg \nGeneración ${
										historia[historia.length - 1]
									}, \nPuntuación: ${pesoEstructura[0].evaluacionCodigoGenetico}`
								);
								//ahora se agregan las tablas
								codigoGeneticoP = pesoEstructura;
								addTableConnect2(pesoEstructura);
								//borrar tablas innecesarias
								d3.selectAll("#matrices-rigid-local > *").remove();
								d3.selectAll("#matrices-rigid-global > *").remove();
								d3.selectAll("#matrices-rigid-total > *").remove();
								d3.selectAll("#vector-fuerzas > *").remove();
								d3.selectAll("#matriz-reducida > *").remove();
								d3.selectAll("#matriz-reducida-inversa > *").remove();
								d3.selectAll("#vector-reducido > *").remove();
								d3.selectAll("#desplazamiento-nodos > *").remove();
								d3.selectAll("#tabla-final > *").remove();
								d3.selectAll("#tabla-final2 > *").remove();
								d3.selectAll("#tabla-final3 > *").remove();
								d3.selectAll("#tabla-final4 > *").remove();
								d3.selectAll("#tabla-final5 > *").remove();
								d3.selectAll("#tabla-final6 > *").remove();

								//addTablasAgain(pesoEstructura);
								addTablaCodigoGen1("tabla-final", pesoEstructura);
								addTablaCodigoGen22("tabla-final2", pesoEstructura);
								addTablaCodigoGen3("tabla-final3", pesoEstructura);
								addTablaCodigoGen4("tabla-final4", pesoEstructura);
								addTablaCodigoGenLateral("tabla-final5", pesoEstructura);
								addTablaCodigoGen6("tabla-final6", pesoEstructura);

								//se dibuja la gráfica
								myChart1 = graficaXY(
									myChart1,
									"grafica-peso",
									historia,
									historiaPeso,
									"Peso (kg) vs. Generaciones",
									ctx1,
									"Peso (kg)",
									"Generación (No)"
								);
								myChart2 = graficaXY(
									myChart2,
									"grafica-estabilidad",
									historia,
									estabilidadPuntuacion,
									"Estabilidad vs. Generaciones",
									ctx2,
									"Pseudo-Estabilidad",
									"Generación (No)"
								);
								//removeData(myChart);
								//graficaPeso();
								//dibujaGrafica("grafica-evolucion1", "Generaciones", "Puntuación");
								obtenerDesplazamiento(estructurasLista[0], "tabla-final", "desCombo1");
								obtenerDesplazamiento(estructurasLista[0], "tabla-final2", "desCombo2");
								obtenerDesplazamiento(estructurasLista[0], "tabla-final3", "desCombo3");
								obtenerDesplazamiento(estructurasLista[0], "tabla-final4", "desCombo4");
								//obtenerDesplazamiento(estructurasLista[0], "tabla-final5", "desComboLateral");
							}

							console.log("Lista de las Estructuras Generadas", estructurasLista);
						}}>
						<span>Calcular Generaciones Seleccionadas</span>
					</button>
					<p>
						No muestra pasos de cálculo para mayor rendimiento (Aplica el Algoritmo Genético y el Método
						Estático Equivalente)
					</p>
				</div>
			</div>
			<div className="row justify-content">
				<div className="col-md-12" id="caja-dibujo5">
					<svg
						width="500px"
						height="500px"
						viewBox="-5 -10 35 50"
						preserveAspectRatio="xMidYMid meet"
						xmlns="http://www.w3.org/2000/svg"
						id="caja-dibujo4">
						{}
					</svg>
				</div>
			</div>
			<p> </p>
			<div className="text-sm-left">
				<h2> 1-. Tabla de Conectividad</h2>
			</div>
			<p />
			<div className="col-sm-12" id="tabla3">
				<table className="table table-striped" id="tabla-connect" onLoad="">
					<thead>
						<tr>
							<th scope="row">No</th>
							<th>Perfil</th>
							<th>Coordenada Inicial</th>
							<th>Coordenada Final</th>
							<th>A</th>
							<th>B</th>
							<th>C</th>
							<th>D</th>
							<th>E</th>
							<th>θ</th>
							<th>coseno</th>
							<th>seno</th>
						</tr>
					</thead>
				</table>
			</div>
			<div className="text-sm-left">
				<h2> 2-. Matrices de Rigidez en coordenadas Locales para cada elemento</h2>
			</div>
			<div className="col justify-content-center" id="matrices-rigid-local" />
			<div className="text-sm-left">
				<h2> 3-. Matrices de Rigidez en coordenadas Globales para cada elemento</h2>
			</div>
			<div className="col justify-content-center" id="matrices-rigid-global" />
			<div className="text-sm-left">
				<h2> 4-. Ensamblaje de la Matriz de Rigidez Total</h2>
			</div>
			<div className="col justify-content-center" id="matrices-rigid-total" />
			<div className="text-sm-left">
				<h2> 5-. Vector de Fuerzas (Fuerzas Externas - Fuerzas Internas)</h2>
			</div>
			<div className="col justify-content-center" id="vector-fuerzas" />
			<div className="text-sm-left">
				<h2> 6-. Matriz de Rigidez Reducida</h2>
			</div>
			<div className="col justify-content-center" id="matriz-reducida" />
			<div className="text-sm-left">
				<h2> 7-. Inversa de la Matriz de Rigidez Reducida</h2>
			</div>
			<div className="col justify-content-center" id="matriz-reducida-inversa" />
			<div className="text-sm-left">
				<h2> 8-. Vector de Fuerzas Asociado a Matriz de Rigidez Reducida</h2>
			</div>
			<div className="col justify-content-center" id="vector-reducido" />
			<div className="text-sm-left">
				<h2> 9-. Dezplazamiento de Nodos (Asociados a Matriz de Rigidez Reducida) (cm,cm,rad)</h2>
			</div>
			<div className="col justify-content-center" id="desplazamiento-nodos" />
			<div className="text-sm-left">
				<h2> 10.1-. Tabla Combinación de cargas caso: 1.4CP</h2>
			</div>
			<div className="col-sm-12" id="tabla-resumen">
				<table className="table table-striped" id="tabla-final" onLoad="" />
			</div>
			<div className="text-sm-left">
				<h2> 10.2-. Tabla Combinación de cargas caso: 1.2CP+1.6CV</h2>
			</div>
			<div className="col-sm-12">
				<table className="table table-striped" id="tabla-final2" onLoad="" />
			</div>
			<div className="text-sm-left">
				<h2> 10.3-. Tabla Combinación de cargas caso: 0.75*(1.4CP + 1.7CV + 1.7W)</h2>
			</div>
			<div className="col-sm-12">
				<table className="table table-striped" id="tabla-final3" onLoad="" />
			</div>
			<div className="text-sm-left">
				<h2> 10.4-. Tabla Combinación de cargas caso: 0.75*(1.4CP + 1.7CV - 1.7W)</h2>
			</div>
			<div className="col-sm-12">
				<table className="table table-striped" id="tabla-final4" onLoad="" />
			</div>
			<div className="text-sm-left">
				<h2> 10.5-. Método estático equivalente: 1CP + 0.5CV + cargas Laterales de 1000kgf</h2>
			</div>
			<div className="col-sm-12">
				<table className="table table-striped" id="tabla-final5" onLoad="" />
			</div>
			<div className="text-sm-left">
				<h2> 10.6-. Tabla Combinación de cargas caso: 1CP + 0.5CV + S</h2>
			</div>
			<div className="col-sm-12">
				<table className="table table-striped" id="tabla-final6" onLoad="" />
			</div>
			<div className="text-sm-left">
				<h2> 11-. Resultados Algoritmos Genéticos</h2>
				<h3> 11-.1 Evolución del Algoritmo Genético</h3>
			</div>
			<div className="col-sm-12" id="grafica-container">
				<canvas id="grafica-peso" width="800px" height="350px" />
			</div>
			<div className="text-sm-left">
				<h3> 11-.2 Evolución de la Estabilidad de la Estructura</h3>
			</div>
			<div className="col-sm-12" id="grafica-container-2">
				<canvas id="grafica-estabilidad" width="800px" height="350px" />
			</div>
			<p>
				<h3>Visualización de la mejor estructura hallada</h3>
				<h4>(Independiente del gráfico inicial de página)</h4>
			</p>
			<p />
			<div className="row justify-content">
				<div className="col-md-12" id="caja-dibujo3">
					<svg
						width="500px"
						height="500px"
						viewBox="-5 -10 35 50"
						preserveAspectRatio="xMidYMid meet"
						xmlns="http://www.w3.org/2000/svg"
						id="caja-dibujo2">
						{}
					</svg>
				</div>
			</div>
			<p className="save-btn">
				<form>
					<select id="ddlViewBy">
						<option value="1">desCombo1</option>
						<option value="2" selected="selected">
							desCombo2
						</option>
						<option value="3">desCombo3</option>
						<option value="4">desCombo4</option>
						<option value="5">desplazamientoNodoIniComboSismop</option>
						{/* <option value="5">desplazamientoNodoIniComboSismon</option> */}
					</select>
				</form>
				<p>
					<h4>Exagerar deformación</h4>
					<input
						className="no-columnas"
						type="number"
						placeholder="Ej: 1.05"
						id="exageracion-box"
						name="no-columnas"
						min="1"
						step="0.01"
						max="1.10"
						onChange={e => (exagerar = document.getElementById("exageracion-box").value)}
					/>
				</p>
				<button
					className="btnPaso text-center mt-12 title"
					onClick={() => {
						exagerar = document.getElementById("exageracion-box").value;
						texto = show();
						//console.log(texto);
						drawLines3 = dibujoDesplazamiento(estructurasLista[0], texto);

						drawLines = drawLines3;

						document.getElementById("caja-dibujo2").innerHTML = drawLines;
					}}>
					<span>Dibujar deformada</span>
				</button>
			</p>
			<p>
				<button className="btnPaso2 text-center mt-12 title">
					<Link to="/">
						<span>Volver al Home</span>
					</Link>
				</button>
			</p>
		</React.Fragment>
	);
}

export default Calculus;

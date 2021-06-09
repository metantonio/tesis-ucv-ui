import React, { useState, useEffect, useContext, Component } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";
import "../../styles/calculus.scss";
import { array } from "prop-types";
import { atan2, chain, derivative, e, evaluate, log, pi, pow, round, sqrt, inv, matrix } from "mathjs";
import { create, all } from "mathjs";
const math = create(all, {});

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
	var vectorConectividadf2 = [];
	var listaPerfiles = actions.getPerfilIPN();
	var listaIPN = actions.getPerfilIPN();
	var listUPL = actions.getPerfilUPL();
	var listaPerfiles = listaPerfiles.concat(listUPL);

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

	function reescrituraConectividadf(cViento) {
		//let vectorAux = vectorConectividadf;
		for (var i = 0; i < vectorConectividadf.length; i++) {
			//console.log("elemento", elementos, vectorAux);
			if (
				(vectorConectividadf[i]["longitud"] == actions.getEntrePiso()) &
				(vectorConectividadf[i]["puntoIni"][0] == vectorConectividadf[i]["puntoFin"][0])
			) {
				if ((vectorConectividadf[i]["puntoIni"][0] == 0) & (vectorConectividadf[i]["puntoFin"][0] == 0)) {
					//console.log("entro en el if en columnas que le entran viento", cViento * actions.getCargaViento());
					vectorConectividadf[i]["fuerzainterna"] = [
						(cViento * actions.getCargaViento() * vectorConectividadf[i]["longitud"]) / 2,
						0,
						(-actions.getCargaViento() * cViento * ((vectorConectividadf[i]["longitud"] * 100) ^ 2)) / 12,
						(cViento * actions.getCargaViento() * vectorConectividadf[i]["longitud"]) / 2,
						0,
						(cViento * actions.getCargaViento() * ((vectorConectividadf[i]["longitud"] * 100) ^ 2)) / 12
					];
					//return vectorConectividadf[i]["fuerzainterna"];
				} else {
					vectorConectividadf[i]["fuerzainterna"] = [0, 0, 0, 0, 0, 0];
					//return vectorConectividadf[i]["fuerzainterna"];
				}
			}
		}
		//vectorConectividadf = [];
		//vectorConectividadf = vectorAux;
		return vectorConectividadf;
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
					(elementos["puntoIni"][1] == actions.getNoPisos() * actions.getEntrePiso()) &
					(elementos["puntoFin"][1] == actions.getNoPisos() * actions.getEntrePiso())
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

	function reescrituraConectividadf2(cVariable, cPermanente) {
		//console.log("vectorcConectividadf2", vectorConectividadf2);
		for (var i = 0; i < vectorConectividadf2.length; i++) {
			//vigas
			if (
				(vectorConectividadf2[i]["longitud"] == actions.getLuzVano()) &
				(vectorConectividadf2[i]["puntoIni"][1] != 0)
			) {
				//console.log("entro en primer if reescrituraconectividadf2");
				if (vectorConectividadf2[i]["puntoIni"][1] == vectorConectividadf2[i]["puntoFin"][1]) {
					//console.log("entro en if reescrituraconectividadf2");
					vectorConectividadf2[i]["fuerzainterna"] = [
						0,
						-(
							(cPermanente * actions.getCargaLosaPermanente() +
								cVariable * actions.getCargaLosaVariable()) *
							vectorConectividadf2[i]["longitud"]
						) / 2,
						(-(
							cPermanente * actions.getCargaLosaPermanente() +
							cVariable * actions.getCargaLosaVariable()
						) *
							((vectorConectividadf2[i]["longitud"] * 100) ^ 2)) /
							12,
						0,
						-(
							(cPermanente * actions.getCargaLosaPermanente() +
								cVariable * actions.getCargaLosaVariable()) *
							vectorConectividadf2[i]["longitud"]
						) / 2,
						((cPermanente * actions.getCargaLosaPermanente() + cVariable * actions.getCargaLosaVariable()) *
							((vectorConectividadf2[i]["longitud"] * 100) ^ 2)) /
							12
					];
					//if del techo empieza aquí>
					if (
						(vectorConectividadf2[i]["puntoIni"][1] == actions.getNoPisos() * actions.getEntrePiso()) &
						(vectorConectividadf2[i]["puntoFin"][1] == actions.getNoPisos() * actions.getEntrePiso())
					) {
						vectorConectividadf2[i]["fuerzainterna"] = [
							0,
							-(
								(cPermanente * actions.getCargaTechoPermanente() +
									cVariable * actions.getCargaTechoVariable()) *
								vectorConectividadf2[i]["longitud"]
							) / 2,
							(-(
								cPermanente * actions.getCargaTechoPermanente() +
								cVariable * actions.getCargaTechoVariable()
							) *
								((vectorConectividadf2[i]["longitud"] * 100) ^ 2)) /
								12,
							0,
							-(
								(cPermanente * actions.getCargaTechoPermanente() +
									cVariable * actions.getCargaTechoVariable()) *
								vectorConectividadf2[i]["longitud"]
							) / 2,
							((cPermanente * actions.getCargaTechoPermanente() +
								cVariable * actions.getCargaTechoVariable()) *
								((vectorConectividadf2[i]["longitud"] * 100) ^ 2)) /
								12
						];
						//return vectorConectividadf2[i]["fuerzainterna"];
					}

					return vectorConectividadf2[i]["fuerzainterna"];
				}
			}

			//diagonales
		}
		return vectorConectividadf2;
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
	let matrizRigidezTotal = [];

	let rigidezTotal = () => {
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
				if ((element.nodoIni[1] != 0) & (i == element.vectorX[0])) {
					filasM[n] = matrizApoyo2[i];
					filasM[n + 1] = matrizApoyo2[i + 1];
					filasM[n + 2] = matrizApoyo2[i + 2];
					//filasM.push(matrizApoyo2[i]);
					n += 3;
					break;
				}
				if ((element.nodoIni[1] != 0) & (i == element.vectorY[0])) {
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
				if ((element.nodoIni[1] != 0) & (i == element.vectorX[0])) {
					element["fuerzasGlobales"][0] = vectorFuerzaReducida[i];
					element["fuerzasGlobales"][1] = vectorFuerzaReducida[i + 1];
					element["fuerzasGlobales"][2] = vectorFuerzaReducida[i + 2];
					filasN[n] = vectorFuerzaReducida[i];
					filasN[n + 1] = vectorFuerzaReducida[i + 1];
					filasN[n + 2] = vectorFuerzaReducida[i + 2];
					//filasM.push(matrizApoyo2[i]);
					n += 3;
					//console.log(filasM[n]);
					break;
				}
				if ((element.nodoIni[1] != 0) & (i == element.vectorY[0])) {
					element["fuerzasGlobales"][3] = vectorFuerzaReducida[i];
					element["fuerzasGlobales"][4] = vectorFuerzaReducida[i + 1];
					element["fuerzasGlobales"][5] = vectorFuerzaReducida[i + 2];
					filasN[n] = vectorFuerzaReducida[i];
					filasN[n + 1] = vectorFuerzaReducida[i + 1];
					filasN[n + 2] = vectorFuerzaReducida[i + 2];
					//filasM.push(matrizApoyo2[i]);
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

	function desplazamientoEnCodigo() {
		var n = 0;
		for (let element of codigoGeneticoP) {
			if (element.nodoIni[1] != 0) {
				element["desplazamientoNodoIni"][0] = vectorDesplazamientos[n];
				element["desplazamientoNodoIni"][1] = vectorDesplazamientos[n + 1];
				element["desplazamientoNodoIni"][2] = vectorDesplazamientos[n + 2];
				n += 3;
			} else {
				element["desplazamientoNodoIni"][0] = 0;
				element["desplazamientoNodoIni"][1] = 0;
				element["desplazamientoNodoIni"][2] = 0;
			}

			if (element.puntoFin[1] == parseFloat(actions.getNoPisos()) * parseFloat(actions.getEntrePiso())) {
				element["desplazamientoNodoIni"][3] = vectorDesplazamientos[n];
				element["desplazamientoNodoIni"][4] = vectorDesplazamientos[n + 1];
				element["desplazamientoNodoIni"][5] = vectorDesplazamientos[n + 2];
				n += 3;
			}
		}
		for (var i = 0; i < codigoGeneticoP.length; i++) {
			for (let element of codigoGeneticoP) {
				if (
					(codigoGeneticoP[i]["vectorX"][0] == element["vectorX"][0]) &
					(codigoGeneticoP[i]["desplazamientoNodoIni"][0] != undefined)
				) {
					element["desplazamientoNodoIni"][0] = codigoGeneticoP[i]["desplazamientoNodoIni"][0];
					element["desplazamientoNodoIni"][1] = codigoGeneticoP[i]["desplazamientoNodoIni"][1];
					element["desplazamientoNodoIni"][2] = codigoGeneticoP[i]["desplazamientoNodoIni"][2];
				}
			}

			for (let element of codigoGeneticoP) {
				if (
					(codigoGeneticoP[i]["vectorY"][0] == element["vectorY"][0]) &
					(codigoGeneticoP[i]["desplazamientoNodoIni"][3] != undefined)
				) {
					element["desplazamientoNodoIni"][3] = codigoGeneticoP[i]["desplazamientoNodoIni"][3];
					element["desplazamientoNodoIni"][4] = codigoGeneticoP[i]["desplazamientoNodoIni"][4];
					element["desplazamientoNodoIni"][5] = codigoGeneticoP[i]["desplazamientoNodoIni"][5];
				}
			}
			for (let element of codigoGeneticoP) {
				if (
					(codigoGeneticoP[i]["vectorX"][0] == element["vectorY"][0]) &
					(codigoGeneticoP[i]["desplazamientoNodoIni"][0] != undefined)
				) {
					element["desplazamientoNodoIni"][3] = codigoGeneticoP[i]["desplazamientoNodoIni"][0];
					element["desplazamientoNodoIni"][4] = codigoGeneticoP[i]["desplazamientoNodoIni"][1];
					element["desplazamientoNodoIni"][5] = codigoGeneticoP[i]["desplazamientoNodoIni"][2];
				}
			}
			for (let element of codigoGeneticoP) {
				if (
					(codigoGeneticoP[i]["vectorY"][0] == element["vectorX"][0]) &
					(codigoGeneticoP[i]["desplazamientoNodoIni"][3] != undefined)
				) {
					element["desplazamientoNodoIni"][0] = codigoGeneticoP[i]["desplazamientoNodoIni"][3];
					element["desplazamientoNodoIni"][1] = codigoGeneticoP[i]["desplazamientoNodoIni"][4];
					element["desplazamientoNodoIni"][2] = codigoGeneticoP[i]["desplazamientoNodoIni"][5];
				}
			}
		}
	}

	function calculosFinales(cW, CV, CP) {
		var multiplicacionM = [];
		var multiplicacionM2 = [];
		var matrizL = [];
		var n = 0;
		var p = 0;
		for (let element of codigoGeneticoP) {
			multiplicacionM = [];
			//multiplicacionM2 = [];
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
			element["esfuerzosInternos"] = matrizPorVector(multiplicacionM, element.desplazamientoNodoIni);

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

			//Derivas
			if (element.tipo == "Columna") {
				//el elemento
				element["deriva"] = (element["desplazamientoNodoIni"][3] - element["desplazamientoNodoIni"][0]).toFixed(
					3
				);
			} else {
				element["deriva"] = 0;
			}
		}
		return codigoGeneticoP;
	}

	function addTablaFinal(getElementByIdf) {
		var fila = "";

		var final = codigoGeneticoP.map(function(element, index, array) {
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
				"<td>(" +
				element.desplazamientoNodoIni +
				")</td>" +
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
	let dibujoDesplazamiento = () => {
		for (var i = 0; i < codigoGeneticoP.length; i++) {
			//console.log(codigoGeneticoP[i]["desplazamientoNodoIni"][0] / 100);
			draw +=
				'<line x1="' +
				(codigoGeneticoP[i]["desplazamientoNodoIni"][0] / 100 + codigoGeneticoP[i]["puntoIni"][0]).toFixed(3) +
				'" ' +
				'y1="' +
				(40 - codigoGeneticoP[i]["desplazamientoNodoIni"][1] / 100 - codigoGeneticoP[i]["puntoIni"][1]).toFixed(
					3
				) +
				'" ' +
				'x2="' +
				(codigoGeneticoP[i]["desplazamientoNodoIni"][3] / 100 + codigoGeneticoP[i]["puntoFin"][0]).toFixed(3) +
				'" ' +
				'y2="' +
				(40 - codigoGeneticoP[i]["desplazamientoNodoIni"][4] / 100 - codigoGeneticoP[i]["puntoFin"][1]).toFixed(
					3
				) +
				'" ' +
				'stroke="red" strokeWidth="1px"></line>';
			//console.log(draw);
			//return draw;
		}
		for (var i = 0; i < codigoGeneticoP.length; i++) {
			//console.log(codigoGeneticoP[i]["desplazamientoNodoIni"][0] / 100);
			draw +=
				'<line x1="' +
				codigoGeneticoP[i]["puntoIni"][0].toFixed(3) +
				'" ' +
				'y1="' +
				(40 - codigoGeneticoP[i]["puntoIni"][1]).toFixed(3) +
				'" ' +
				'x2="' +
				codigoGeneticoP[i]["puntoFin"][0].toFixed(3) +
				'" ' +
				'y2="' +
				(40 - codigoGeneticoP[i]["puntoFin"][1]).toFixed(3) +
				'" ' +
				'stroke="black" strokeWidth="10px"></line>';
			//console.log(draw);
			//return draw;
		}
		return draw;
	};
	let dibujoIni = () => {
		for (var i = 0; i < codigoGeneticoP.length; i++) {
			//console.log(codigoGeneticoP[i]["desplazamientoNodoIni"][0] / 100);
			draw +=
				'<line x1="' +
				codigoGeneticoP[i]["puntoIni"][0].toFixed(3) +
				'" ' +
				'y1="' +
				(40 - codigoGeneticoP[i]["puntoIni"][1]).toFixed(3) +
				'" ' +
				'x2="' +
				codigoGeneticoP[i]["puntoFin"][0].toFixed(3) +
				'" ' +
				'y2="' +
				(40 - codigoGeneticoP[i]["puntoFin"][1]).toFixed(3) +
				'" ' +
				'stroke="black" strokeWidth="10px"></line>';
			//console.log(draw);
			//return draw;
		}
		return draw;
	};

	//var getElementByIdf = "";

	function botonCalcular(getElementByIdTablaFinal, coefViento, coefVariable, coefPermanente, casos) {
		var numeroCol = actions.getNoColumnas();
		var numeroPisos = actions.getNoPisos();
		var alturaEntrePiso = actions.getEntrePiso();
		var luzVano = actions.getLuzVano();
		//drawLines = dibujo();
		//drawLines2 = dibujoVigas();

		//console.log(numeroCol, numeroPisos, alturaEntrePiso, luzVano);
		// console.log(drawLines, drawLines2);
		tablaConectividad(coefViento);
		tablaConectividad2(coefVariable, coefPermanente);
		addTableConnect();
		//matrizRigidLocal();
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
		console.log("codigo genético P", codigoGeneticoP);
		desplazamientoEnCodigo();
		calculosFinales(coefViento, coefVariable, coefPermanente);
		addTablaFinal(getElementByIdTablaFinal);
		//drawLines3 = dibujoDesplazamiento();
		drawini = dibujoIni();
		drawLines = drawLines3 + drawText;
		document.getElementById("caja-dibujo4").innerHTML = dibujoIni();
		document.getElementById("caja-dibujo2").innerHTML = drawLines;
		return numeroPisos, numeroCol, alturaEntrePiso, luzVano;
	}
	function botonCalcular2(getElementByIdTablaFinal, coefViento, coefVariable, coefPermanente, casos) {
		var numeroCol = actions.getNoColumnas();
		var numeroPisos = actions.getNoPisos();
		var alturaEntrePiso = actions.getEntrePiso();
		var luzVano = actions.getLuzVano();
		//drawLines = dibujo();
		//drawLines2 = dibujoVigas();

		//console.log(numeroCol, numeroPisos, alturaEntrePiso, luzVano);
		// console.log(drawLines, drawLines2);
		//console.log(vectorConectividadf);
		reescrituraConectividadf(coefViento);
		//console.log(vectorConectividadf);
		reescrituraConectividadf2(coefVariable, coefPermanente);
		//addTableConnect();
		//matrizRigidLocal();
		//console.log(multiplicarMatrices(matrizEA, matrizEB));
		//addMatricesRigLocal();
		//console.log("vector Matriz rigid local", vectorMatrizRigLocal);
		//vectorMatrizRigGlobal = matrizRigidGlogal();
		//console.log("vector matriz rigideces coord Global", vectorMatrizRigGlobal);
		//addMatricesRigGlobal();
		codigoGeneticoP = codigoGenetico(vectorMatrizRigGlobal);

		rigidezTotal();
		//addMatricesRigTotal();
		vectorFuerzasInternas = funcionFuerzasInt();
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
		console.log("codigo genético P", codigoGeneticoP);
		desplazamientoEnCodigo();
		calculosFinales(coefViento, coefVariable, coefPermanente);
		addTablaFinal(getElementByIdTablaFinal);
		//drawLines3 = dibujoDesplazamiento();
		// drawini = dibujoIni();
		// drawLines = drawLines3 + drawText;
		// document.getElementById("caja-dibujo4").innerHTML = dibujoIni();
		// document.getElementById("caja-dibujo2").innerHTML = drawLines;
		return numeroPisos, numeroCol, alturaEntrePiso, luzVano;
	}

	useEffect(() => {
		// Actualiza el título del documento usando la API del navegador
		nodosCoord();
		nodosNum();
		nodosCoordVigas();
		vectorMatrizRigLocal = matrizRigidLocal();
		//tablaConectividad();
		//console.log(listaPerfiles);
		vectorMatrizRigGlobal = matrizRigidGlogal();
		//svg.selectAll("*").remove();
		document.getElementById("caja-dibujo4").innerHTML = dibujoIni();
	});

	return (
		<React.Fragment>
			<div className="text-center mt-6 title">
				<h1 className="title">
					Optimización de las Edificaciones de Acero con arriostramientos laterales en un sentido,
					condicionada a las deriva de piso mediante la aplicación de Algoritmos Genéticos
				</h1>
			</div>
			<p className="save-btn">
				<button
					className="btnPaso text-center mt-12 title"
					onClick={() => {
						//se coloca nombre de la tabla, coefViento, coefVariable, coefPermanente
						//caso 1.4 carga permanente
						botonCalcular("tabla-final", 0, 0, 1.4, "1.4CP");
						//caso 1.2CP+1.6CV
						botonCalcular2("tabla-final2", 0, 1.6, 1.2, "1.2CP+1.6CV");
						//caso 0.75 (1.4CP + 1.7 CV + 1.7 W)
						botonCalcular2("tabla-final3", 1.275, 1.275, 1.05, "0.75 (1.4CP + 1.7 CV + 1.7 W)");
						//caso 0.75 (1.4CP + 1.7 CV - 1.7 W)
						botonCalcular2("tabla-final4", -1.275, 1.275, 1.05, "0.75 (1.4CP + 1.7 CV - 1.7 W)");
					}}>
					<span>Calcular una estructura al azar</span>
				</button>
			</p>
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
				<button
					className="btnPaso text-center mt-12 title"
					onClick={() => {
						drawLines3 = dibujoDesplazamiento();

						drawLines = drawLines3;

						document.getElementById("caja-dibujo2").innerHTML = drawLines;
					}}>
					<span>Dibujar deformada</span>
				</button>
			</p>
			<p>
				<button className="btnPaso2 text-center mt-12 title">
					<Link to="/">
						<span>Ir al Paso 5</span>
					</Link>
				</button>
			</p>
		</React.Fragment>
	);
}

export default Calculus;

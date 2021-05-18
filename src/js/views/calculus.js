import React, { useState, useEffect, useContext, Component } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";
import "../../styles/calculus.scss";

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
	var nodosNumeros = [];
	var u = 0;
	var v = 0;
	var uv = [];
	var vectorConectividad = [];
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
		sin: 0
	};

	let dibujo = () => {
		for (var i = 1; i <= actions.getNoColumnas(); i++) {
			drawLines +=
				'<line x1="' +
				actions.getLuzVano() * (i - 1) +
				'" ' +
				'y1="' +
				40.2 +
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
		console.log(nodosCoordenadas);
		return nodosCoordenadas;
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
		console.log(nodosNumeros);
		return nodosNumeros;
	};

	let tablaConectividad = () => {
		//Columnas
		console.log("función tablConectividad");
		elementos["elemento"] = "prueba";
		elementos["puntoIni"] = nodosCoordenadas[0];
		elementos["puntoFin"] = nodosCoordenadas[1];
		elementos["a"] = 0;
		elementos["b"] = 0;
		elementos["c"] = 0;
		elementos["d"] = 0;
		elementos["e"] = 0;
		if (elementos["puntoFin"][0] - elementos["puntoIni"][0] != 0) {
			elementos["teta"] = Math.atan(
				(elementos["puntoFin"][1] - elementos["puntoIni"][1]) /
					(elementos["puntoFin"][0] - elementos["puntoIni"][0])
			);
		} else {
			elementos["teta"] = Math.PI / 2;
		}
		elementos["cos"] = Math.cos(elementos["teta"]);
		if ((elementos["teta"] = Math.PI / 2)) {
			elementos["cos"] = 0;
		}
		elementos["sin"] = Math.sin(elementos["teta"]);
		vectorConectividad.push(elementos);
		console.log(vectorConectividad);
	};

	useEffect(() => {
		// Actualiza el título del documento usando la API del navegador
		nodosCoord();
		nodosNum();
		tablaConectividad();
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
						var numeroCol = actions.getNoColumnas();
						var numeroPisos = actions.getNoPisos();
						var alturaEntrePiso = actions.getEntrePiso();
						var luzVano = actions.getLuzVano();
						drawLines = dibujo();
						drawLines2 = dibujoVigas();
						drawLines = drawLines + drawLines2 + drawText;
						document.getElementById("caja-dibujo2").innerHTML = drawLines;
						//console.log(numeroCol, numeroPisos, alturaEntrePiso, luzVano);
						// console.log(drawLines, drawLines2);
						return numeroPisos, numeroCol, alturaEntrePiso, luzVano;
					}}>
					<span>Dibujar</span>
				</button>
			</p>
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
			<p> </p>
			<div className="text-md-left">
				<h2> 1-. Tabla de Conectividad</h2>
			</div>
			<p />
			<div className="col-md-12" id="tabla3">
				<table className="table table-striped" id="tabla-conect" onLoad="">
					<thead>
						<tr>
							<th scope="row">Elemento</th>
							<th>Perfil</th>
							<th>Punto Inicial</th>
							<th>Punto Final</th>
							<th>A</th>
							<th>B</th>
							<th>C</th>
							<th>D</th>
							<th>E</th>
							<th>θ</th>
							<th>i</th>
							<th>m</th>
						</tr>
					</thead>
				</table>
			</div>
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

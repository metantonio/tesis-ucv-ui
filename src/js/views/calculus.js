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
						console.log(drawLines, drawLines2);
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
						preserveAspectRatio="xMidYMid"
						xmlns="http://www.w3.org/2000/svg"
						id="caja-dibujo2">
						{}
					</svg>
				</div>
				<p>
					<button className="btnPaso2 text-center mt-12 title">
						<Link to="/">
							<span>Ir al Paso 5</span>
						</Link>
					</button>
				</p>
			</div>
		</React.Fragment>
	);
}

export default Calculus;

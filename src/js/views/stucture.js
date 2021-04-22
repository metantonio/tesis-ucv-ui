import React, { useState, useEffect, useContext, Component } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";

function Structure() {
	const { store, actions } = useContext(Context);
	//const [noColumnas, setNoColumnas] = useState("");
	var x1 = 0;
	var x2 = 0;
	var y1 = 20;
	var y2 = 15;
	var drawLines = "";
	//var i = 2;

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
		}
		return drawLines;
	};

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
							<h2 className="sub-title">Paso 1: Configuración de la Estructura</h2>
						</p>
						<p>
							<h4>Número de Columnas Eje X (mínimo 2 - máximo 5)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="2"
								id="no-columnas"
								name="no-columnas"
								min="2"
								max="5"
								onChange={e => actions.setNoColumnas(e.target.value)}
							/>
						</p>
						<p>
							<h4>Número de Pisos (mínimo 1 - máximo 8)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="1"
								id="no-columnas"
								name="no-columnas"
								min="1"
								max="8"
								onChange={e => actions.setNoPisos(e.target.value)}
							/>
						</p>
						<p>
							<h4>Altura Entrepiso (m)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="1"
								id="no-columnas"
								name="no-columnas"
								min="1.00"
								step="0.01"
								onChange={e => actions.setEntrePiso(e.target.value)}
							/>
						</p>
						<p>
							<h4>Luz de vanos (m)</h4>
							<input
								className="no-columnas"
								type="number"
								placeholder="3.00"
								id="no-columnas"
								name="no-columnas"
								min="0.50"
								step="0.01"
								onChange={e => actions.setLuzVano(e.target.value)}
							/>
						</p>
					</div>
				</div>
				<div className="col-md-6">
					<svg
						viewBox="0 0 50 40"
						preserveAspectRatio="xMidYMid meet"
						xmlns="http://www.w3.org/2000/svg"
						id="caja-dibujo">
						{}
					</svg>
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
							document.getElementById("caja-dibujo").innerHTML = drawLines;
							//console.log(numeroCol, numeroPisos, alturaEntrePiso, luzVano);
							console.log(drawLines);
							return numeroPisos, numeroCol, alturaEntrePiso, luzVano;
						}}>
						<span>Guardar Paso 1 y Dibujar</span>
					</button>
				</p>
			</div>
		</React.Fragment>
	);
}

export default Structure;

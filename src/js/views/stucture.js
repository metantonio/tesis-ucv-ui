import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";

function Structure() {
	const { store, actions } = useContext(Context);
	//const [noColumnas, setNoColumnas] = useState("");

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
							<h4>Número de Columnas (mínimo 2 - máximo 5)</h4>
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
						<p className="save-btn">
							<button className="btnPaso text-center mt-12 title">
								<span>Guardar Paso 1</span>
							</button>
						</p>
					</div>
				</div>
				<div className="col-md-6">
					<svg viewBox="0 0 50 20" xmlns="http://www.w3.org/2000/svg">
						<line
							x1="0"
							y1="20"
							x2="0"
							y2="15"
							stroke="black"
							strokeWidth="10px"
							vectorEffect="non-scaling-stroke"
						/>
					</svg>
				</div>
			</div>
		</React.Fragment>
	);
}

export default Structure;

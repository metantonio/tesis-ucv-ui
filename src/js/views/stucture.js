import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/structure.scss";

function Structure() {
	const { store, actions } = useContext(Context);

	// Get dimensions from store or actions
	const noColumnas = parseInt(actions.getNoColumnas()) || 2;
	const noPisos = parseInt(actions.getNoPisos()) || 1;
	const entrePiso = parseFloat(actions.getEntrePiso()) || 3;
	const luzVano = parseFloat(actions.getLuzVano()) || 4;

	// Viewbox and coordinate calculations
	const baseLineY = 40;
	const strokeWidth = 0.5;

	const structureElements = useMemo(
		() => {
			const elements = [];

			// 1. Draw Columns
			for (let i = 0; i < noColumnas; i++) {
				const x = i * luzVano;
				elements.push(
					<g key={`col-group-${i}`}>
						<line
							x1={x}
							y1={baseLineY}
							x2={x}
							y2={baseLineY - entrePiso * noPisos}
							stroke="#3b82f6"
							strokeWidth={strokeWidth}
							strokeLinecap="round"
						/>
						<text
							x={x}
							y={baseLineY + 2}
							fontSize="1.5"
							fill="#94a3b8"
							textAnchor="middle"
							style={{ fontFamily: "JetBrains Mono" }}>
							{i + 1}
						</text>
					</g>
				);
			}

			// 2. Draw Beams
			for (let i = 1; i <= noPisos; i++) {
				const y = baseLineY - entrePiso * i;
				elements.push(
					<g key={`beam-group-${i}`}>
						<line
							x1={0}
							y1={y}
							x2={(noColumnas - 1) * luzVano}
							y2={y}
							stroke="#60a5fa"
							strokeWidth={strokeWidth}
							strokeLinecap="round"
						/>
						<text
							x={-2}
							y={y + 0.5}
							fontSize="1.5"
							fill="#64748b"
							textAnchor="end"
							style={{ fontFamily: "JetBrains Mono" }}>
							N{i}
						</text>
					</g>
				);
			}

			return elements;
		},
		[noColumnas, noPisos, entrePiso, luzVano]
	);

	return (
		<div className="container-fluid p-4">
			<div className="text-center mb-5">
				<h1 className="title">
					Diseño de Edificaciones de Acero
					<span className="d-block text-muted small mt-2">Optimización mediante Algoritmos Genéticos</span>
				</h1>
			</div>

			<div className="row g-4 justify-content-center">
				{/* Step 1: Configuration */}
				<div className="col-lg-5">
					<div className="config-paso-1">
						<h2 className="sub-title">Paso 1: Configuración</h2>

						<div className="input-group-custom">
							<h4>N° Columnas Eje X</h4>
							<input
								className="no-columnas"
								type="number"
								value={actions.getNoColumnas()}
								min="2"
								max="5"
								onChange={e => actions.setNoColumnas(e.target.value)}
							/>
						</div>

						<div className="input-group-custom">
							<h4>N° Pisos</h4>
							<input
								className="no-columnas"
								type="number"
								value={actions.getNoPisos()}
								min="1"
								max="15"
								onChange={e => actions.setNoPisos(e.target.value)}
							/>
						</div>

						<div className="input-group-custom">
							<h4>Altura Entrepiso (m)</h4>
							<input
								className="no-columnas"
								type="number"
								step="0.01"
								value={actions.getEntrePiso()}
								onChange={e => actions.setEntrePiso(e.target.value)}
							/>
						</div>

						<div className="input-group-custom">
							<h4>Luz de vanos (m)</h4>
							<input
								className="no-columnas"
								type="number"
								step="0.01"
								value={actions.getLuzVano()}
								onChange={e => actions.setLuzVano(e.target.value)}
							/>
						</div>
					</div>
				</div>

				{/* Step 2: Visualizer */}
				<div className="col-lg-7">
					<div className="visualization-container">
						<h5 className="viz-label mb-3">VISTA FRONTAL (Eje X-Z)</h5>
						<svg
							viewBox={`-5 -5 ${noColumnas * luzVano + 10} 55`}
							preserveAspectRatio="xMidYMid meet"
							width="100%"
							height="450px"
							id="caja-dibujo">
							<defs>
								<linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
									<stop offset="0%" stopColor="#3b82f6" />
									<stop offset="100%" stopColor="#60a5fa" />
								</linearGradient>
							</defs>

							{/* Ground Line */}
							<line
								x1={-2}
								y1={baseLineY}
								x2={(noColumnas - 1) * luzVano + 2}
								y2={baseLineY}
								stroke="#1e293b"
								strokeWidth="0.2"
							/>

							{structureElements}
						</svg>
						<p className="viz-label mt-3">
							Escala: 1:
							{luzVano > 5 ? 50 : 25}
						</p>
					</div>

					<div className="btn-container">
						<button className="btnPaso">
							<span>Guardar Configuración</span>
						</button>
						<button className="btnPaso2">
							<Link to="/forces">
								<span>Continuar al Paso 2 →</span>
							</Link>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Structure;

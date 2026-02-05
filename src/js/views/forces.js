import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import { round } from "mathjs";
import Chart from "chart.js/auto";
import "../../styles/forces.scss";

function Forces() {
	const { store, actions } = useContext(Context);
	const chartRef = useRef(null);
	const chartInstance = useRef(null);

	// Local state for loads to prevent store lag during typing
	const [loads, setLoads] = useState({
		vEntrepiso: store.cargaVLosaEntrePisoEstado || 250,
		pEntrepiso: store.cargaPLosaEntrePisoEstado || 800,
		vTecho: store.cargaVTechoEstado || 100,
		pTecho: store.cargaPTechoEstado || 150,
		viento: store.cargaVientoEstado || 0
	});

	// Constants for COVENIN 1756-2001 logic
	const ZONES = {
		7: 0.4,
		6: 0.35,
		5: 0.3,
		4: 0.25,
		3: 0.2,
		2: 0.15,
		1: 0.1,
		0: 0
	};

	const SPECTRAL_FORMS = {
		S1: { tAst: 0.4, beta: 2.4, ro: 1.0 },
		S2: { tAst: 0.7, beta: 2.6, ro: 1.0 },
		S3: { tAst: 1.0, beta: 2.8, ro: 1.0 },
		S4: { tAst: 1.3, beta: 3.0, ro: 0.8 }
	};

	// Determine current spectral form identifier (local display logic)
	const [formaID, setFormaID] = useState("S3");
	const [importancia, setImportancia] = useState("A"); // A, B1, B2
	const [nivelDiseno, setNivelDiseno] = useState("ND3"); // ND1, ND2, ND3

	// Reactive derived values
	const ao = ZONES[store.zonaSismica] || 0;
	const { tAst, beta, ro } = SPECTRAL_FORMS[formaID];
	const phi = parseFloat(store.factorCorreccion) || 0.85;
	const alpha = importancia === "A" ? 1.3 : importancia === "B1" ? 1.15 : 1.0;
	const R = nivelDiseno === "ND3" ? 6.0 : nivelDiseno === "ND2" ? 4.0 : 2.0;

	// T+ (tMas) calculation
	const tMas = R < 5 ? 0.1 * (R - 1) : 0.4;

	// Generate Spectral Data for Chart
	const spectrumData = useMemo(
		() => {
			const points = [];

			// Initial point (T=0)
			points.push({ x: 0, y: ao * phi * alpha });

			// Plateau start (T=T*/4)
			points.push({ x: round(tAst / 4, 3), y: ao * phi * alpha * beta });

			// Plateau end (T=T*)
			points.push({ x: tAst, y: ao * phi * alpha * beta });

			// Descending branch
			for (let i = 1; i <= 40; i++) {
				const t = round(tAst + 0.1 * i, 1);
				const sa = alpha * phi * beta * ao * Math.pow(tAst / t, ro);
				points.push({ x: t, y: round(sa, 4) });
			}

			return points;
		},
		[ao, phi, alpha, beta, tAst, ro]
	);

	// Initialize and Update Chart
	useEffect(
		() => {
			// Small delay to ensure canvas is ready in the DOM
			const timer = setTimeout(() => {
				if (chartInstance.current) {
					chartInstance.current.destroy();
				}

				if (chartRef.current) {
					const ctx = chartRef.current.getContext("2d");
					chartInstance.current = new Chart(ctx, {
						type: "line",
						data: {
							datasets: [
								{
									label: "Espectro de Diseño Elástico (Adimensional)",
									data: spectrumData,
									borderColor: "#3b82f6",
									backgroundColor: "rgba(59, 130, 246, 0.1)",
									borderWidth: 2,
									fill: true,
									tension: 0.3,
									pointRadius: 0
								}
							]
						},
						options: {
							responsive: true,
							maintainAspectRatio: false,
							layout: {
								padding: 10
							},
							scales: {
								x: {
									type: "linear",
									title: { display: true, text: "Periodo T (s)", color: "rgba(255,255,255,0.7)" },
									grid: { color: "rgba(255,255,255,0.05)" },
									ticks: { color: "rgba(255,255,255,0.5)" },
									min: 0
								},
								y: {
									type: "linear",
									title: { display: true, text: "Aceleración Sa/g", color: "rgba(255,255,255,0.7)" },
									grid: { color: "rgba(255,255,255,0.05)" },
									ticks: { color: "rgba(255,255,255,0.5)" },
									min: 0
								}
							},
							plugins: {
								legend: { display: true, labels: { color: "#fff" } }
							}
						}
					});
				}
			}, 100);

			return () => {
				clearTimeout(timer);
				if (chartInstance.current) chartInstance.current.destroy();
			};
		},
		[spectrumData]
	);

	// Save to global context
	const handleSave = () => {
		actions.setCargas(loads.vEntrepiso, loads.pEntrepiso, loads.vTecho, loads.pTecho, loads.viento);
		actions.setZonaSismica(store.zonaSismica);
		actions.setAceleracionAo(ao);
		actions.setTAst(tAst);
		actions.setBeta(beta);
		actions.setRo(ro);
		actions.setFactorCorreccion(phi);
		actions.setFactorImportancia(alpha);
		actions.setFactorReduccion(R);
		actions.setTMas(tMas);
		alert("Configuración de cargas y espectro guardada exitosamente.");
	};

	return (
		<div className="forces-container container-fluid p-4">
			<div className="text-center mb-5">
				<h1 className="title">
					Paso 2: Configuración de Cargas y Espectro Sísmico
					<span className="d-block text-muted small mt-2">Normativa COVENIN 1756-2001 y 2002-88</span>
				</h1>
			</div>

			<div className="row g-4">
				{/* Column 1: Gravity Loads */}
				<div className="col-lg-4">
					<div className="section-card">
						<div className="card-header">
							<h2>Cargas Gravitacionales</h2>
							<span>COVENIN 2002-88</span>
						</div>

						<div className="input-block">
							<label>Carga Variable Entrepiso (kgf/m²)</label>
							<input
								type="number"
								value={loads.vEntrepiso}
								onChange={e => setLoads({ ...loads, vEntrepiso: e.target.value })}
							/>
						</div>
						<div className="input-block">
							<label>Carga Permanente Entrepiso (kgf/m²)</label>
							<input
								type="number"
								value={loads.pEntrepiso}
								onChange={e => setLoads({ ...loads, pEntrepiso: e.target.value })}
							/>
						</div>
						<div className="input-block">
							<label>Carga Variable Techo (kgf/m²)</label>
							<input
								type="number"
								value={loads.vTecho}
								onChange={e => setLoads({ ...loads, vTecho: e.target.value })}
							/>
						</div>
						<div className="input-block">
							<label>Carga Permanente Techo (kgf/m²)</label>
							<input
								type="number"
								value={loads.pTecho}
								onChange={e => setLoads({ ...loads, pTecho: e.target.value })}
							/>
						</div>
						<div className="input-block">
							<label>Carga de Viento (kgf/m²)</label>
							<input
								type="number"
								value={loads.viento}
								onChange={e => setLoads({ ...loads, viento: e.target.value })}
							/>
						</div>
					</div>
				</div>

				{/* Column 2: Seismic Parameters */}
				<div className="col-lg-4">
					<div className="section-card">
						<div className="card-header">
							<h2>Parámetros Sísmicos</h2>
							<span>COVENIN 1756-2001</span>
						</div>

						<div className="input-block">
							<label>Zona Sísmica (0-7)</label>
							<input
								type="number"
								min="0"
								max="7"
								value={store.zonaSismica}
								onChange={e => actions.setZonaSismica(e.target.value)}
							/>
						</div>

						<div className="input-block">
							<label>Forma Espectral</label>
							<select value={formaID} onChange={e => setFormaID(e.target.value)}>
								<option value="S1">S1 (Roca / Suelos muy densos)</option>
								<option value="S2">S2 (Suelos intermedios)</option>
								<option value="S3">S3 (Suelos blandos)</option>
								<option value="S4">S4 (Suelos excepcionalmente blandos)</option>
							</select>
						</div>

						<div className="input-block">
							<label>Factor de Importancia (Grupo)</label>
							<select value={importancia} onChange={e => setImportancia(e.target.value)}>
								<option value="A">Grupo A (Vitales: α=1.3)</option>
								<option value="B1">Grupo B1 (Importantes: α=1.15)</option>
								<option value="B2">Grupo B2 (Normales: α=1.0)</option>
							</select>
						</div>

						<div className="input-block">
							<label>Nivel de Diseño / Reducción (R)</label>
							<select value={nivelDiseno} onChange={e => setNivelDiseno(e.target.value)}>
								<option value="ND3">ND3 (Especiales: R=6.0)</option>
								<option value="ND2">ND2 (Moderados: R=4.0)</option>
								<option value="ND1">ND1 (Limitados: R=2.0)</option>
							</select>
						</div>

						<div className="input-block">
							<label>Factor de Corrección (ϕ)</label>
							<input
								type="number"
								step="0.01"
								min="0.6"
								max="1.0"
								value={store.factorCorreccion}
								onChange={e => actions.setFactorCorreccion(e.target.value)}
							/>
						</div>
					</div>
				</div>

				{/* Column 3: Spectrum Chart */}
				<div className="col-lg-4">
					<div className="section-card">
						<div className="card-header">
							<h2>Espectro de Respuesta</h2>
							<span>Aceleración vs Periodo</span>
						</div>

						<div className="chart-wrapper" style={{ height: "300px" }}>
							<canvas ref={chartRef} />
						</div>

						<div className="note-box">
							<strong>Información del Espectro:</strong>
							<br />
							Ao: {ao}g | T*: {tAst}s | β: {beta} | R: {R}
							<br />
							Aceleración Máx: {round(ao * phi * alpha * beta, 3)}g
						</div>

						<div className="mt-auto pt-4 d-grid gap-2">
							<button className="btnPaso" onClick={handleSave}>
								Guardar Parámetros
							</button>
							<Link to="/profiles" className="btnPaso2 text-center">
								Continuar al Paso 3 →
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Forces;

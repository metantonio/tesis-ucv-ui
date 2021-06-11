import React, { useState, useEffect, useContext, Component } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
//import dnaImage from "../../img/dna-genetic-algorithm.jpg";
import "../../styles/structure.scss";
import "../../styles/home-tesis.scss";

function Profiles() {
	const { store, actions } = useContext(Context);

	var listIPN = actions.getPerfilIPN();
	var listUPL = actions.getPerfilUPL();

	//en la siguiente función debe entrar un lista
	function getIPNProfile(item) {
		var designacion = item.designacion;
		var altura = item.altura;
		var peso = item.peso;
		var area = item.area;
		var ix = item.ix;
		var sx = item.sx;
		var zx = item.zx;
		var rx = item.rx;
		var iy = item.iy;
		var sy = item.sy;
		var zy = item.zy;
		var ry = item.ry;
		var jt = item.j;
		var cw = item.cw;
		var lista = [];
		lista.push(designacion, altura, peso, area, ix, sx, zx, rx, iy, sy, zy, ry, jt, cw);
		console.log(lista);
		return lista;
	}

	function addTableIPN() {
		var fila = "";
		var final = listIPN.map(function(listIPN, index, array) {
			var a = "<th scope='row'>PERFIL IPN</th>";
			a += "<th>Designación</th>";
			a += "<th>Altura (mm)</th>";
			a += "<th>Peso (kgf/m)</th>";
			a += "<th>Área (cm²)</th>";
			a += "<th>Ix (cm⁴)</th>";
			a += "<th>Sx (cm³)</th>";
			a += "<th>Zx (cm³)</th>";
			a += "<th>rx (cm)</th>";
			a += "<th>Iy (cm⁴)</th>";
			a += "<th>Sy (cm³)</th>";
			a += "<th>Zy (cm³)</th>";
			a += "<th>ry (cm)</th>";
			a += "<th>J (cm⁴)</th>";
			a += "<th>Cw (cm⁶)</th>";
			//serían los encabezados de la tabla
			var html = "<tr>" + a + "</tr>";

			fila +=
				"<tr>" +
				"<td>" +
				index +
				"</td>" +
				"<td>" +
				listIPN.designacion +
				"</td>" +
				"<td>" +
				listIPN.altura +
				"</td>" +
				"<td>" +
				listIPN.peso +
				"</td>" +
				"<td>" +
				listIPN.area +
				"</td>" +
				"<td>" +
				listIPN.ix +
				"</td>" +
				"<td>" +
				listIPN.sx +
				"</td>" +
				"<td>" +
				listIPN.zx +
				"</td>" +
				"<td>" +
				listIPN.rx +
				"</td>" +
				"<td>" +
				listIPN.iy +
				"</td>" +
				"<td>" +
				listIPN.sy +
				"</td>" +
				"<td>" +
				listIPN.zy +
				"</td>" +
				"<td>" +
				listIPN.ry +
				"</td>" +
				"<td>" +
				listIPN.j +
				"</td>" +
				"<td>" +
				listIPN.cw +
				"</td>" +
				"</tr>" +
				"<br/>";
			document.getElementById("tabla-ipn").innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}

	function addTableUPL() {
		var fila = "";
		var final = listUPL.map(function(listUPL, index, array) {
			var a = "<th scope='row'>PERFIL UPL</th>";
			a += "<th>Designación</th>";
			a += "<th>Altura (mm)</th>";
			a += "<th>Peso (kgf/m)</th>";
			a += "<th>Área (cm²)</th>";
			a += "<th>Ix (cm⁴)</th>";
			a += "<th>Sx (cm³)</th>";
			a += "<th>Zx (cm³)</th>";
			a += "<th>rx (cm)</th>";
			a += "<th>Iy (cm⁴)</th>";
			a += "<th>Sy (cm³)</th>";
			a += "<th>Zy (cm³)</th>";
			a += "<th>ry (cm)</th>";
			a += "<th>J (cm⁴)</th>";
			a += "<th>Cw (cm⁶)</th>";
			//serían los encabezados de la tabla
			var html = "<tr>" + a + "</tr>";

			fila +=
				"<tr>" +
				"<td>" +
				index +
				"</td>" +
				"<td>" +
				listUPL.designacion +
				"</td>" +
				"<td>" +
				listUPL.altura +
				"</td>" +
				"<td>" +
				listUPL.peso +
				"</td>" +
				"<td>" +
				listUPL.area +
				"</td>" +
				"<td>" +
				listUPL.ix +
				"</td>" +
				"<td>" +
				listUPL.sx +
				"</td>" +
				"<td>" +
				listUPL.zx +
				"</td>" +
				"<td>" +
				listUPL.rx +
				"</td>" +
				"<td>" +
				listUPL.iy +
				"</td>" +
				"<td>" +
				listUPL.sy +
				"</td>" +
				"<td>" +
				listUPL.zy +
				"</td>" +
				"<td>" +
				listUPL.ry +
				"</td>" +
				"<td>" +
				listUPL.j +
				"</td>" +
				"<td>" +
				listUPL.cw +
				"</td>" +
				"</tr>" +
				"<br/>";
			document.getElementById("tabla-upl").innerHTML = html + fila;

			return html + fila, fila;
		});
		return final;
	}

	useEffect(() => {
		// Actualiza el título del documento usando la API del navegador
		window.scroll(0, top);
		addTableIPN();
		addTableUPL();
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
						<h2 className="sub-title">Paso 3: Selección de Perfiles de Acero Estructural</h2>
					</p>
					<p>
						<h4 className="sub-title 2">Perfiles Comúnes en Venezuela</h4>
					</p>
					<br />
				</div>
				<p>
					<h4 className="sub-title 2">Muestras del Catálogo de SIDETUR - Perfiles IPN y UPL</h4>
				</p>
				<div className="col-md-12" id="tabla1">
					<table className="default" id="tabla-ipn" onLoad="addTableIPN()">
						<tr>
							<th scope="row">PERFIL IPN</th>
							<th>Designación</th>
							<th>Altura (mm)</th>
							<th>Peso (kgf/m)</th>
							<th>Área (cm²)</th>
							<th>Ix (cm⁴)</th>
							<th>Sx (cm³)</th>
							<th>Zx (cm³)</th>
							<th>rx (cm)</th>
							<th>Iy (cm⁴)</th>
							<th>Sy (cm³)</th>
							<th>Zy (cm³)</th>
							<th>ry (cm)</th>
							<th>J (cm⁴)</th>
							<th>Cw (cm⁶)</th>
						</tr>
					</table>
				</div>
				<br />
				<br />
				<br />
				<div className="col-md-12">
					<table className="default" id="tabla-upl" onLoad="addTableUPL()">
						<tr>
							<th scope="row">PERFIL UPL</th>
							<th>Designación</th>
							<th>Altura (mm)</th>
							<th>Peso (kgf/m)</th>
							<th>Área (cm²)</th>
							<th>Ix (cm⁴)</th>
							<th>Sx (cm³)</th>
							<th>Zx (cm³)</th>
							<th>rx (cm)</th>
							<th>Iy (cm⁴)</th>
							<th>Sy (cm³)</th>
							<th>Zy (cm³)</th>
							<th>ry (cm)</th>
							<th>J (cm⁴)</th>
							<th>Cw (cm⁶)</th>
						</tr>
					</table>
				</div>
				<div className="btn sub-title col-md-12">
					{/* <p>
						<button
							className="btnPaso text-center mt-12 title"
							//onClick={e => }
						>
							<span>Guardar selección de Perfiles</span>
						</button>
					</p> */}
					<p>
						<button className="btnPaso2 text-center mt-12 title">
							<Link to="/calculus">
								<span>Ir al Paso 4</span>
							</Link>
						</button>
					</p>
				</div>
			</div>
		</React.Fragment>
	);
}

export default Profiles;

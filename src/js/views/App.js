import "../../styles/styles.scss";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { historiaPeso } from "./calculus";

var dataGraph = [];
function graficaXY() {
	dataGraph = [];
	var dataInfo = {};
	if (historiaPeso != undefined) {
		for (var i = 0; i < historiaPeso.length; i++) {
			dataInfo["name"] = i + 1;
			//dataInfo["uv"] = i + 1;
			dataInfo["pv"] = historiaPeso[i];
			dataGraph.push(dataInfo);
		}
	}

	return dataGraph;
}
const data = [
	{
		name: "Page A",
		uv: 4000,
		pv: 2400,
		amt: 2400
	},
	{
		name: "Page B",
		uv: 3000,
		pv: 1398,
		amt: 2210
	},
	{
		name: "Page C",
		uv: 2000,
		pv: 9800,
		amt: 2290
	},
	{
		name: "Page D",
		uv: 2780,
		pv: 3908,
		amt: 2000
	},
	{
		name: "Page E",
		uv: 1890,
		pv: 4800,
		amt: 2181
	},
	{
		name: "Page F",
		uv: 2390,
		pv: 3800,
		amt: 2500
	},
	{
		name: "Page G",
		uv: 3490,
		pv: 4300,
		amt: 2100
	}
];

export default function App() {
	return (
		<LineChart
			width={500}
			height={300}
			data={graficaXY()}
			margin={{
				top: 50,
				right: 30,
				left: 30,
				bottom: 90
			}}>
			<CartesianGrid strokeDasharray="3 3" />
			<XAxis dataKey="Generaciones" />
			<YAxis />
			<Tooltip />
			<Legend />
			<Line type="monotone" dataKey="Puntuacion" stroke="#8884d8" activeDot={{ r: 8 }} />
		</LineChart>
	);
}

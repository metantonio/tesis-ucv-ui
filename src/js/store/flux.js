const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
			nocolumnasEstado: "2",
			noPisosEstado: "2",
			entrePisosEstado: "2.75",
			luzVanoEstado: "3.00",
			cargaVLosaEntrePisoEstado: "250",
			cargaPLosaEntrePisoEstado: "800",
			cargaVTechoEstado: "100",
			cargaPTechoEstado: "150",
			cargaVientoEstado: "0",
			cargasP: [],
			cargasV: [],
			perfilIPN: [
				{
					designacion: "IPN 80",
					altura: "80",
					peso: "6.1",
					area: "7.77",
					ix: "78.4",
					sx: "19.6",
					zx: "22.0",
					rx: "3.18",
					iy: "6.29",
					sy: "2.99",
					zy: "4.68",
					ry: "0.90",
					j: "0.772",
					cw: "86",
					bf: "34",
					tf: "5.9",
					tw: "4.2"
				},
				{
					designacion: "IPN 100",
					altura: "100",
					peso: "8.34",
					area: "10.62",
					ix: "171",
					sx: "34.2",
					zx: "39.4",
					rx: "4.01",
					iy: "12.2",
					sy: "4.88",
					zy: "8.19",
					ry: "1.07",
					j: "1.50",
					cw: "263",
					bf: "50",
					tf: "6.8",
					tw: "4.5"
				},
				{
					designacion: "IPN 120",
					altura: "120",
					peso: "11.1",
					area: "14.2",
					ix: "328",
					sx: "54.7",
					zx: "63.1",
					rx: "4.81",
					iy: "21.5",
					sy: "7.41",
					zy: "12.5",
					ry: "1.23",
					j: "2.55",
					cw: "673",
					bf: "58",
					tf: "7.7",
					tw: "5.1"
				},
				{
					designacion: "IPN 140",
					altura: "140",
					peso: "14.3",
					area: "18.2",
					ix: "573",
					sx: "81.9",
					zx: "94.5",
					rx: "5.61",
					iy: "35.2",
					sy: "10.7",
					zy: "18.0",
					ry: "1.40",
					j: "4.07",
					cw: "1510",
					bf: "66",
					tf: "8.6",
					tw: "5.7"
				},
				{
					designacion: "IPN 200",
					altura: "200",
					peso: "26.2",
					area: "33.4",
					ix: "2140",
					sx: "214",
					zx: "250",
					rx: "8.00",
					iy: "117",
					sy: "26.0",
					zy: "43.16",
					ry: "1.87",
					j: "11.2",
					cw: "10520",
					bf: "90",
					tf: "11.3",
					tw: "7.5"
				},
				{
					designacion: "IPN 300",
					altura: "300",
					peso: "54.2",
					area: "69.0",
					ix: "9800",
					sx: "653",
					zx: "762",
					rx: "11.9",
					iy: "451",
					sy: "72.2",
					zy: "120.6",
					ry: "2.56",
					j: "46.7",
					cw: "91850",
					bf: "125",
					tf: "16.2",
					tw: "10.8"
				},
				{
					designacion: "IPN 400",
					altura: "400",
					peso: "92.4",
					area: "118.0",
					ix: "29210",
					sx: "1460",
					zx: "1714",
					rx: "15.7",
					iy: "1160",
					sy: "149",
					zy: "251",
					ry: "3.13",
					j: "140",
					cw: "419600",
					bf: "155",
					tf: "21.6",
					tw: "14.4"
				}
			],
			perfilUPL: [
				{
					designacion: "UPL 80",
					altura: "80",
					peso: "6.08",
					area: "7.75",
					ix: "74.4",
					sx: "18.6",
					zx: "22.4",
					rx: "3.10",
					iy: "7.80",
					sy: "3.18",
					zy: "7.24",
					ry: "1.00",
					j: "0.995",
					cw: "84.9",
					bf: "35",
					tf: "7.0",
					tw: "4.5"
				},
				{
					designacion: "UPL 100",
					altura: "100",
					peso: "8.20",
					area: "10.45",
					ix: "155",
					sx: "30.9",
					zx: "37.8",
					rx: "3.92",
					iy: "13.5",
					sy: "4.80",
					zy: "11.0",
					ry: "1.15",
					j: "1.71",
					cw: "237",
					bf: "40",
					tf: "8.0",
					tw: "5.0"
				},
				{
					designacion: "UPL 120",
					altura: "120",
					peso: "9.58",
					area: "12.2",
					ix: "266",
					sx: "44.3",
					zx: "52.8",
					rx: "4.67",
					iy: "19.8",
					sy: "6.10",
					zy: "14.3",
					ry: "1.27",
					j: "1.96",
					cw: "520",
					bf: "45",
					tf: "8.0",
					tw: "5.0"
				},
				{
					designacion: "UPL 140",
					altura: "140",
					peso: "11.30",
					area: "14.50",
					ix: "435",
					sx: "62.1",
					zx: "73.5",
					rx: "5.48",
					iy: "29.0",
					sy: "7.90",
					zy: "18.9",
					ry: "1.41",
					j: "2.53",
					cw: "1060",
					bf: "50",
					tf: "8.5",
					tw: "5.0"
				}
			],
			vectorConect: [],
			zonaSismica: "6",
			aceleracionAo: "0.35",
			factorCorreccion: "0.85",
			factorImportancia: "1.3",
			factorReduccion: "6.0",
			tAst: "1.0",
			beta: "2.8",
			ro: "1.0",
			tMas: "0.4"
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},
			loadSomeData: () => {
				/**
					fetch().then().then(data => setStore({ "foo": data.bar }))
				*/
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			},

			getNoColumnas: () => {
				const store = getStore();
				//console.log(`getNoColumnas ${store.nocolumnasEstado}`);
				return store.nocolumnasEstado;
			},

			setNoColumnas: noColumnas => {
				const store = getStore();
				setStore({ nocolumnasEstado: noColumnas });
				return console.log(`setNoColumnas ${store.nocolumnasEstado}`);
			},

			getNoPisos: () => {
				const store = getStore();
				//console.log(`getNoPisos ${store.noPisosEstado}`);
				return store.noPisosEstado;
			},

			setNoPisos: noPisos => {
				const store = getStore();
				setStore({ noPisosEstado: noPisos });
				return console.log(`setNoPisos ${store.noPisosEstado}`);
			},

			setEntrePiso: entrePisos => {
				const store = getStore();
				setStore({ entrePisosEstado: entrePisos });
				return console.log(`setEntrePisos ${store.entrePisosEstado}`);
			},

			getEntrePiso: () => {
				const store = getStore();
				//console.log(`getEntrePiso ${store.entrePisosEstado}`);
				return store.entrePisosEstado;
			},

			setLuzVano: luzVano => {
				const store = getStore();
				setStore({ luzVanoEstado: luzVano });
				return console.log(`setLuzVano ${store.luzVanoEstado}`);
			},

			getLuzVano: () => {
				const store = getStore();
				//console.log(`getLuzVano ${store.luzVanoEstado}`);
				return store.luzVanoEstado;
			},

			setCargas: (cargaVLosaEntrePiso, cargaPLosaEntrePiso, cargaVTecho, cargaPTecho, cargaViento) => {
				const store = getStore();
				setStore({ cargaVLosaEntrePisoEstado: cargaVLosaEntrePiso });
				setStore({ cargaPLosaEntrePisoEstado: cargaPLosaEntrePiso });
				setStore({ cargaVTechoEstado: cargaVTecho });
				setStore({ cargaPTechoEstado: cargaPTecho });
				setStore({ cargaVientoEstado: cargaViento });
				setStore({ cargasP: [] });
				setStore({ cargasV: [] });
				var arregloCargasP = [];
				var arregloCargasV = [];

				arregloCargasP.push(cargaPTecho);
				for (var i = 2; i <= store.noPisosEstado; i++) {
					arregloCargasP.push(cargaPLosaEntrePiso);
				}

				arregloCargasV.push(cargaVTecho);
				for (var i = 2; i <= store.noPisosEstado; i++) {
					arregloCargasV.push(cargaVLosaEntrePiso);
				}

				setStore({ cargasP: arregloCargasP });
				setStore({ cargasV: arregloCargasV });
				return console.log(`ArregloCargasP ${store.cargasP} y ArregloCargasV ${store.cargasV}`);
			},

			getCargasV: () => {
				const store = getStore();
				//console.log(`getCargasV ${store.cargasV}`);
				return store.cargasV;
			},

			getCargasP: () => {
				const store = getStore();
				//console.log(`getCargasP ${store.cargasP}`);
				return store.cargasP;
			},

			getCargaViento: () => {
				const store = getStore();
				//console.log(`getCargaViento ${store.cargaVientoEstado}`);
				return store.cargaVientoEstado;
			},

			getCargaLosaPermanente: () => {
				const store = getStore();
				//console.log(`getCargaViento ${store.cargaVientoEstado}`);
				return store.cargaPLosaEntrePisoEstado;
			},

			getCargaLosaVariable: () => {
				const store = getStore();
				//console.log(`getCargaViento ${store.cargaVientoEstado}`);
				return store.cargaVLosaEntrePisoEstado;
			},

			getCargaTechoVariable: () => {
				const store = getStore();
				//console.log(`getCargaViento ${store.cargaVientoEstado}`);
				return store.cargaVTechoEstado;
			},

			getCargaTechoPermanente: () => {
				const store = getStore();
				//console.log(`getCargaViento ${store.cargaVientoEstado}`);
				return store.cargaPTechoEstado;
			},

			getPerfilIPN: () => {
				const store = getStore();
				//console.log(`getIPN ${store.perfilIPN}`);
				return store.perfilIPN;
			},

			getPerfilUPL: () => {
				const store = getStore();
				//console.log(`getUPN ${store.perfilUPL}`);
				return store.perfilUPL;
			},

			getVectorConect: () => {
				const store = getStore();
				//console.log(`getVectorConect ${store.vectorConect}`);
				return store.vectorConect;
			},
			getZonaSismica: () => {
				const store = getStore();
				//console.log(`getNoColumnas ${store.nocolumnasEstado}`);
				return store.zonaSismica;
			},

			setZonaSismica: zonaSismicaVar => {
				const store = getStore();
				setStore({ zonaSismica: zonaSismicaVar });
				return console.log(`setZonaSismica ${store.zonaSismica}`);
			},
			getAceleracionAo: () => {
				const store = getStore();
				//console.log(`getNoColumnas ${store.nocolumnasEstado}`);
				return store.aceleracionAo;
			},

			setAceleracionAo: aceleracionVar => {
				const store = getStore();
				setStore({ aceleracionAo: aceleracionVar });
				return console.log(`setAceleracionA0 ${store.aceleracionAo}`);
			},
			getFactorCorreccion: () => {
				const store = getStore();
				//console.log(`getNoColumnas ${store.nocolumnasEstado}`);
				return store.factorCorreccion;
			},

			setFactorCorreccion: factorVar => {
				const store = getStore();
				setStore({ factorCorreccion: factorVar });
				return console.log(`setFactorCorreccion ${store.factorCorreccion}`);
			},
			getFactorImportancia: () => {
				const store = getStore();
				//console.log(`getNoColumnas ${store.nocolumnasEstado}`);
				return store.factorImportancia;
			},

			setFactorImportancia: factorVar => {
				const store = getStore();
				setStore({ factorImportancia: factorVar });
				return console.log(`setfactorImportancia ${store.factorImportancia}`);
			},
			getFactorReduccion: () => {
				const store = getStore();
				//console.log(`getNoColumnas ${store.nocolumnasEstado}`);
				return store.factorReduccion;
			},

			setFactorReduccion: factorVar => {
				const store = getStore();
				setStore({ factorReduccion: factorVar });
				return console.log(`setfactorReducción ${store.factorReduccion}`);
			},
			getTAst: () => {
				const store = getStore();
				//console.log(`getNoColumnas ${store.nocolumnasEstado}`);
				return store.tAst;
			},

			setTAst: factorVar => {
				const store = getStore();
				setStore({ tAst: factorVar });
				return console.log(`setT* ${store.tAst}`);
			},
			getBeta: () => {
				const store = getStore();
				//console.log(`getNoColumnas ${store.nocolumnasEstado}`);
				return store.beta;
			},

			setBeta: factorVar => {
				const store = getStore();
				setStore({ beta: factorVar });
				return console.log(`setBeta ${store.beta}`);
			},
			getRo: () => {
				const store = getStore();
				//console.log(`getNoColumnas ${store.nocolumnasEstado}`);
				return store.ro;
			},

			setRo: factorVar => {
				const store = getStore();
				setStore({ ro: factorVar });
				return console.log(`setρ ${store.ro}`);
			},
			getTMas: () => {
				const store = getStore();
				//console.log(`getNoColumnas ${store.nocolumnasEstado}`);
				return store.tMas;
			},

			setTMas: factorVar => {
				const store = getStore();
				setStore({ tMas: factorVar });
				return console.log(`setT+ ${store.tMas}`);
			}
		}
	};
};

export default getState;

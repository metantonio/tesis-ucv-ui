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
			cargasV: []
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
				console.log(`getNoColumnas ${store.nocolumnasEstado}`);
				return store.nocolumnasEstado;
			},

			setNoColumnas: noColumnas => {
				const store = getStore();
				setStore({ nocolumnasEstado: noColumnas });
				return console.log(`setNoColumnas ${store.nocolumnasEstado}`);
			},

			getNoPisos: () => {
				const store = getStore();
				console.log(`getNoPisos ${store.noPisosEstado}`);
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
				console.log(`getEntrePiso ${store.entrePisosEstado}`);
				return store.entrePisosEstado;
			},

			setLuzVano: luzVano => {
				const store = getStore();
				setStore({ luzVanoEstado: luzVano });
				return console.log(`setLuzVano ${store.luzVanoEstado}`);
			},

			getLuzVano: () => {
				const store = getStore();
				console.log(`getLuzVano ${store.luzVanoEstado}`);
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
				console.log(`getCargasV ${store.cargasV}`);
				return store.cargasV;
			},

			getCargasP: () => {
				const store = getStore();
				console.log(`getCargasP ${store.cargasP}`);
				return store.cargasP;
			}
		}
	};
};

export default getState;

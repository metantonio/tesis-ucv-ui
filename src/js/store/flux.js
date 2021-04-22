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
			columna: {
				longitud: "3"
			}
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
			}
		}
	};
};

export default getState;

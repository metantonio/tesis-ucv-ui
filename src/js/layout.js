import React, { PureComponent } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";

//import { Home } from "./views/home";
import { HomeTesis } from "./views/home-tesis";
import Structure from "./views/stucture";
import Forces from "./views/forces";
import Profiles from "./views/profiles";
import Calculus from "./views/calculus";
import { Autor } from "./views/autor";
import { Demo } from "./views/demo";
import { Single } from "./views/single";
import injectContext from "./store/appContext";

import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import App from "./views/App";

//create your first component
const Layout = () => {
	//the basename is used when your project is published in a subdirectory and not in the root of the domain
	// you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
	const basename = process.env.BASENAME || "";

	return (
		<div className="d-flex flex-column">
			<BrowserRouter basename={basename}>
				<ScrollToTop>
					<Navbar />
					<Switch>
						<Route exact path="/">
							<HomeTesis />
						</Route>
						<Route exact path="/structure">
							<Structure />
						</Route>
						<Route exact path="/forces">
							<Forces />
						</Route>
						<Route exact path="/profiles">
							<Profiles />
						</Route>
						<Route exact path="/calculus">
							<Calculus />
							<App />
						</Route>
						<Route exact path="/autor">
							<Autor />
						</Route>
						<Route exact path="/single/:theid">
							<Single />
						</Route>
						<Route>
							<h1>Not found!</h1>
						</Route>
					</Switch>
					<Footer />
				</ScrollToTop>
			</BrowserRouter>
		</div>
	);
};

export default injectContext(Layout);

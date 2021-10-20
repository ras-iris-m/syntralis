import Auth from "./pages/Auth";
import Home from "./pages/Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const App = () => {
	return (
		<Router>
			<Switch>
				<Route path="/" exact component={Auth} />
				<Route path="/home" component={props => <Home />} />
			</Switch>
		</Router>
	);
};

export default App;

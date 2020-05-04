import React, { Component } from "react";
import "./App.css";
import LoginPage from "./components/pages/login/LoginPage";
import SignUpPage from "./components/pages/signup/SignUpPage";
import LogoutFunction from "./components/child/logout/LogoutFunction";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
} from "react-router-dom";
import Auth from "./modules/Auth";
import NavBar from "./components/child/navbar/NavBar";
import ClubsPage from "./components/pages/clubs/ClubsPage";
import CompetePage from "./components/pages/compete/CompetePage";
import LeaderboardPage from "./components/pages/leaderboard/LeaderboardPage";
import Account from "./components/pages/account/Account";
import HomePage from "./components/pages/homepage/HomePage";

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      Auth.isUserAuthenticated() ? (
        <Component {...props} {...rest} />
      ) : (
        <React.Fragment>
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        </React.Fragment>
      )
    }
  />
);

const LoggedOutRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      Auth.isUserAuthenticated() ? (
        <Redirect
          to={{
            pathname: "/",
            state: { from: props.location }
          }}
        />
      ) : (
        <Component {...props} {...rest} />
      )
    }
  />
);
const GlobalRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => <Component {...props} {...rest} />} />
);

class App extends Component {  
  render() {
    return (
      <div className="App">
        <Router>
          <GlobalRoute component={NavBar} />
          <div>
            <GlobalRoute exact path="/" component={HomePage} />
						<LoggedOutRoute path="/signup" component={SignUpPage} />
						<LoggedOutRoute path="/login" component={LoginPage} />
						<PrivateRoute path="/logout" component={LogoutFunction} />
            <PrivateRoute path="/account" component={Account} />
						<PrivateRoute path="/competes" component={ClubsPage} />
						<PrivateRoute path="/compete/:field" component={CompetePage} />
						<PrivateRoute path="/leaderboard" component={LeaderboardPage}/>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;

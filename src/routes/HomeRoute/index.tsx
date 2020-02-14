import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, Switch, Route } from "react-router-dom";

import HomePage from "./HomePage.tsx";
import BoardPage from "./BoardPage.tsx";
import TeamPage from "./TeamPage.tsx";
import UserPage from "./UserPage.tsx";
import NewBoardPage from "./NewBoardPage.tsx";
import NewTeamPage from "./NewTeamPage.tsx";

import {
  ApplicationState,
  User,
} from "../../common";

export default function HomeRoute({ match }) {
  const dispatch = useDispatch();
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const [state, setState] = React.useState({
    isMenuOpen: false,
  });

  if (!user) {
    return (
      <Redirect to={`/login?location=${match.url}`}/>
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      <nav className="navbar navbar-expand-lg navbar-light bg-dark navbar-dark">
        <Link className="navbar-brand" to="/">{process.env.APP_NAME}</Link>
        <ul className="navbar-nav ml-auto text-light">
          <li className="nav-item dropdown">
            <div
              id="userctl-dropdown-toggle"
              className="pointer"
              role="buttton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false">
              <span
                className="dropdown-toggle pointer">
                {user.name}
              </span>
              <img
                className="ml-3 rounded"
                src={user.imageUrl}
                width="25"
                height="25"/>
            </div>
            <div
              className="dropdown-menu"
              aria-labelledby="userctl-dropdown-toggle">
              <Link
                className="dropdown-item"
                to={`/user/${user.username}`}>
                Perfil
              </Link>
              <div class="dropdown-divider"></div>
              <span
                className="dropdown-item pointer"
                onClick={() => dispatch({ type: "LOGOUT" })}>
                Logout
              </span>
            </div>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route exact path="/" component={HomePage}/>
        <Route exact path="/board/:id" component={BoardPage}/>
        <Route exact path="/team/:id" component={TeamPage}/>
        <Route exact path="/user/:username" component={UserPage}/>
        <Route exact path="/newboard" component={NewBoardPage}/>
        <Route exact path="/newteam" component={NewTeamPage}/>
      </Switch>
    </div>
  );
}

// <Route exact path="/newteam" component={NewTeamPage}/>

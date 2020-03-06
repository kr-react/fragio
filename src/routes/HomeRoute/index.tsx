import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, Switch, Route } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { ApplicationState } from "~/src/common";
import HomePage from "./HomePage.tsx";
import BoardPage from "./BoardPage.tsx";
import TeamPage from "./TeamPage.tsx";
import UserPage from "./UserPage.tsx";
import NewBoardPage from "./NewBoardPage.tsx";
import NewTeamPage from "./NewTeamPage.tsx";
import LandingPage from "./LandingPage.tsx";

export default function HomeRoute({ match }) {
  const { t } = useTranslation();
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const dispatch = useDispatch();

  if (!user && (localStorage.getItem("token") || sessionStorage.getItem("token"))) {
    return <Redirect to={`/login?location=${location.href.slice(location.origin.length)}`}/>
  }

  return (
    <div className="d-flex flex-column h-100">
      <nav className="navbar navbar-expand-lg navbar-light bg-dark navbar-dark">
        <Link className="navbar-brand" to="/">
          <b>{process.env.APP_NAME}</b>
        </Link>
        <ul className="navbar-nav ml-auto text-light">
          {user &&
            <li className="nav-item dropdown">
              <div
                id="userctl-dropdown-toggle"
                className="pointer d-flex flex-row align-items-center"
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
                className="dropdown-menu shadow-sm"
                aria-labelledby="userctl-dropdown-toggle"
                style={{
                  zIndex: 2000
                }}>
                <Link
                  className="dropdown-item"
                  to={`/user/${user.username}`}>
                  {t("profile")}
                </Link>
                <div class="dropdown-divider"></div>
                <span
                  className="dropdown-item pointer"
                  onClick={() => dispatch({ type: "LOGOUT" })}>
                  {t("action.logout")}
                </span>
              </div>
            </li>
          }
          {!user &&
            <Link to={`/login?location=${location.href.slice(location.origin.length)}`}>
              <button
                type="button"
                className="btn btn-primary btn-sm shadow-sm">
                  {t("action.login")}
              </button>
            </Link>
          }
        </ul>
      </nav>
      <Switch>
        <Route exact path="/" component={HomePage}/>
        <Route exact path="/newboard" component={NewBoardPage}/>
        <Route exact path="/newteam" component={NewTeamPage}/>

        <Route exact path="/landing" component={LandingPage}/>
        <Route exact path="/board/:id" component={BoardPage}/>
        <Route exact path="/team/:id" component={TeamPage}/>
        <Route exact path="/user/:username" component={UserPage}/>
      </Switch>
    </div>
  );
}

// <Route exact path="/newteam" component={NewTeamPage}/>

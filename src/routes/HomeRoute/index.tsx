import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, Switch, Route, RouteComponentProps } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { ApplicationState } from "../../../src/common";
import HomePage from "./HomePage";
import BoardPage from "./BoardPage";
import TeamPage from "./TeamPage";
import UserPage from "./UserPage";
import NewBoardPage from "./NewBoardPage";
import NewTeamPage from "./NewTeamPage";
import LandingPage from "./LandingPage";

export default function HomeRoute({ match }: RouteComponentProps<never>) {
  const { user } = useSelector<ApplicationState, ApplicationState>(state => state);
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();

  if (!user && (localStorage.getItem("token") || sessionStorage.getItem("token"))) {
    return <Redirect to={`/login?location=${location.pathname}`}/>
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
                <div className="dropdown-divider"></div>
                {i18n.languages.map(lang =>
                  <span
                    className="dropdown-item pointer"
                    onClick={() => i18n.changeLanguage(lang)}>
                    {i18n.language == lang &&
                      <b className="mr-2">·</b>
                    }
                    {t(`lang.${lang}`)}
                  </span>
                )}
                <div className="dropdown-divider"></div>
                <span
                  className="dropdown-item pointer"
                  onClick={() => dispatch({ type: "LOGOUT" })}>
                  {t("action.logout")}
                </span>
              </div>
            </li>
          }
          {!user &&
            <div>
              <Link to={`/login?location=${location.href.slice(location.origin.length)}`}>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm">
                    {t("action.signIn")}
                </button>
              </Link>
              <Link
                className="ml-2"
                to={`/login?location=${location.href.slice(location.origin.length)}`}>
                <button
                  type="button"
                  className="btn btn-light btn-sm">
                    {t("action.login")}
                </button>
              </Link>
            </div>
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
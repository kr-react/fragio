import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, Switch, Route } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  ApplicationState,
  User,
} from "~/src/common";
import { useModal, ModalContext } from "~/src/components";
import HomePage from "./HomePage.tsx";
import BoardPage from "./BoardPage.tsx";
import TeamPage from "./TeamPage.tsx";
import UserPage from "./UserPage.tsx";
import NewBoardPage from "./NewBoardPage.tsx";
import NewTeamPage from "./NewTeamPage.tsx";

export default function HomeRoute({ match }) {
  const dispatch = useDispatch();
  const modal = useModal();
  const { t } = useTranslation();
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
        <Link className="navbar-brand" to="/">
          <b>{process.env.APP_NAME}</b>
        </Link>
        <ul className="navbar-nav ml-auto text-light">
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
              className="dropdown-menu"
              aria-labelledby="userctl-dropdown-toggle">
              <Link
                className="dropdown-item"
                to={`/user/${user.username}`}>
                {t("perfil")}
              </Link>
              <div class="dropdown-divider"></div>
              <span
                className="dropdown-item pointer"
                onClick={() => dispatch({ type: "LOGOUT" })}>
                {t("action.logout")}
              </span>
            </div>
          </li>
        </ul>
      </nav>
      <ModalContext.Provider value={modal}>
        <Switch>
          <Route exact path="/" component={HomePage}/>
          <Route exact path="/board/:id" component={BoardPage}/>
          <Route exact path="/team/:id" component={TeamPage}/>
          <Route exact path="/user/:username" component={UserPage}/>
          <Route exact path="/newboard" component={NewBoardPage}/>
          <Route exact path="/newteam" component={NewTeamPage}/>
        </Switch>
      </ModalContext.Provider>
    </div>
  );
}

// <Route exact path="/newteam" component={NewTeamPage}/>

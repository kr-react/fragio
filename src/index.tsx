import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore,Store } from "redux";
import { ApplicationState, ReduxAction } from "./common";

require("bootstrap");
import "./index.scss";
import "bootstrap/dist/css/bootstrap.min.css";

// Routes
import HomeRoute from "./routes/HomeRoute/";
import LoginRoute from "./routes/LoginRoute/";

// Redux Reducers
function appReducer(state: ApplicationState = new ApplicationState, action: ReduxAction) {
  if (action.type == "LOGIN") {
    if (action.data.storage == "local") {
      localStorage.setItem("token", action.data.token);
    } else {
      sessionStorage.setItem("token", action.data.token);
    }

    return {
      ...state,
      token: action.data.token,
      user: action.data.user
    };
  } else if (action.type == "LOGOUT") {
    window.localStorage.clear();
    window.sessionStorage.clear();
    return {
      ...state,
      token: null,
      user: null
    };
  } else if (action.type == "VIEWMODE_CHANGE") {
    return {
      ...state,
      viewMode: action.data
    };
  }

  return state;
}

function update(store: Store<ApplicationState, ReduxAction>) {
  render(
    <React.Fragment>
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={HomeRoute}/>
            <Route exact path="/board/:id" component={HomeRoute}/>
            <Route exact path="/team/:id" component={HomeRoute}/>
            <Route exact path="/login" component={LoginRoute}/>
          </Switch>
        </BrowserRouter>
      </Provider>
    </React.Fragment>,
    document.querySelector("#root")
  );
}

const store = createStore(appReducer);
store.subscribe(() => update(store));
update(store);

for (let i = 0; i < ApplicationState.ViewModes.length; i++) {
  const min = `${ApplicationState.ViewModes[i].breakpoint}px`;
  const max = i > 0 ? `${ApplicationState.ViewModes[i - 1].breakpoint}px` : undefined;
  const media = window.matchMedia(`(min-width: ${min})${max ? ` and (max-width: ${max})` : ""}`);

  media.addListener(e => {
    if (!e.matches) return;
    store.dispatch({
      type: "VIEWMODE_CHANGE",
      data: ApplicationState.ViewModes[i].name
    });
  });
}

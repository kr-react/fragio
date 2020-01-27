import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore,Store } from "redux";
import { ApplicationState, ReduxAction } from "./common";

// Routes
import HomeRoute from "./routes/HomeRoute/";
import LoginRoute from "./routes/LoginRoute/";

// Styles
import "./lazuli/css/lazuli.scss";

// Redux Reducers
function appReducer(state: ApplicationState = new ApplicationState, action: ReduxAction) {
  if (action.type === "LOGIN") {
    window.localStorage.setItem("token", action.data.token);
    return {
      ...state,
      user: action.data.user
    };
  } else if (action.type === "LOGOUT") {
    window.localStorage.clear();
    return {
      ...state,
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
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={HomeRoute}/>
          <Route exact path="/board/:id" component={HomeRoute}/>
          <Route exact path="/team/:id" component={HomeRoute}/>
          <Route exact path="/login" component={LoginRoute}/>
        </Switch>
      </BrowserRouter>
    </Provider>,
    document.querySelector("#root")
  );
}

const store = createStore(appReducer);
store.subscribe(() => update(store));
update(store);

window.addEventListener("resize", () => {
  if (window.innerWidth >= ApplicationState.DesktopBreakpoint) {
    store.dispatch({
      type: "VIEWMODE_CHANGE",
      data: "Desktop"
    });
  } else if (window.innerWidth >= ApplicationState.TabletBreakpoint) {
    store.dispatch({
      type: "VIEWMODE_CHANGE",
      data: "Tablet"
    });
  } else {
    store.dispatch({
      type: "VIEWMODE_CHANGE",
      data: "Mobile"
    });
  }
});

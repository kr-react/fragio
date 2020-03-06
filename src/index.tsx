import * as React from "react";
import * as ReactDOM from "react-dom";
import * as moment from "moment";
import i18n from "i18next";
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore, Store } from "redux";
import { ApplicationState, ReduxAction } from "./common";

import "bootstrap";
import "./index.scss";

// Routes
import HomeRoute from "./routes/HomeRoute/";
import LoginRoute from "./routes/LoginRoute/";

// Redux Reducers
function appReducer(state: ApplicationState = new ApplicationState, action: ReduxAction) {
  switch (action.type) {
    case "LOGIN": {
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
    } break;

    case "LOGOUT": {
      window.localStorage.clear();
      window.sessionStorage.clear();

      return {
        ...state,
        token: null,
        user: null
      };
    };

    case "UPDATE_USER": {
      return {
        ...state,
        user: action.data.user
      }
    };
  }

  return state;
}

function update(store: Store<ApplicationState, ReduxAction>) {
  ReactDOM.render(
    <React.Suspense fallback="Loading">
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={HomeRoute}/>
            <Route exact path="/board/:id" component={HomeRoute}/>
            <Route exact path="/team/:id" component={HomeRoute}/>
            <Route exact path="/user/:username" component={HomeRoute}/>
            <Route exact path="/newboard" component={HomeRoute}/>
            <Route exact path="/newteam" component={HomeRoute}/>
            <Route exact path="/landing" component={HomeRoute}/>
            <Route exact path="/login" component={LoginRoute}/>
          </Switch>
        </BrowserRouter>
      </Provider>
    </React.Suspense>,
    document.querySelector("#root")
  );
}

const store = createStore(appReducer);
store.subscribe(() => update(store));

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en-US",
  }, () => {
    moment.locale(i18n.language);
  });

i18n.on("languageChanged", lang => {
  moment.locale(lang)
  update(store);
});

update(store);

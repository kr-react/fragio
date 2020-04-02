import * as React from "react";
import { Redirect, useHistory, RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { ApplicationState, QueryString, FragioAPI } from "../../../src/common";

function getTokenFromStorage() {
  const localToken = localStorage.getItem("token");
  const sessionToken = sessionStorage.getItem("token");

  let storage = null;

  if (localToken)
    storage = "local";
  else if (sessionToken)
    storage = "session";

  return {
    token: localToken || sessionToken,
    storage
  };
}

export default function LoginRoute({ match }: RouteComponentProps<never>) {
  const token = getTokenFromStorage();
  const api = new FragioAPI(process.env.API_URL as string, token.token as string);
  const qString = new QueryString(location.href);
  const globalState = useSelector<ApplicationState, ApplicationState>(state => state);
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();
  const [state, setState] = React.useState(0);

  React.useEffect(() => {
    if (token.token && token.storage) {
      login(token.storage).catch(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
  }, []);

  async function login(storage: string) {
    return api.getCurrentUser()
      .then(user => {
        dispatch({
          type: "LOGIN",
          data: {
            token: api.token,
            storage,
            user
          }
        });
      });
  }

  function LoginForm() {
    async function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = new FormData(e.currentTarget);

      try {
        const token = await api.getToken(data.get("username") as string, data.get("password") as string);
        const remember = data.get("remember-me") == "remember";
        api.token = token;
        await login(remember ? "local" : "session");
      } catch (err) {
        return false;
      }
    }

    return (
      <form onSubmit={onSubmitHandler}>
        <div className="form-group">
          <label
            className=""
            htmlFor="username">
            {t("username")}
          </label>
          <input
            id="username"
            name="username"
            className="form-control form-control-sm"
            autoFocus
            autoComplete="username"
            required
            type="text"/>
        </div>
        <div className="form-group">
          <label
            className=""
            htmlFor="password">
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            className="form-control form-control-sm"
            autoComplete="current-password"
            required
            type="password"/>
        </div>
        <div className="form-group form-check">
          <input
            id="remember"
            name="remember-me"
            className="form-check-input"
            type="checkbox"
            value="remember"/>
          <label
            htmlFor="remember">
            {t("action.rememberMe")}
          </label>
        </div>
        <button
          className="btn btn-primary btn-sm"
          type="submit">
          {t("action.login")}
        </button>
      </form>
    );
  }

  function SignUpForm() {
    async function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      api.token = await api.createAccount({
        name: data.get("name"),
        username: data.get("username"),
        email: data.get("email"),
        password: data.get("password")
      });

      await login("session");
    }

    return (
      <form onSubmit={onSubmitHandler}>
        <div className="form-group">
          <label htmlFor="name">
            {t("name")}
          </label>
          <input
            id="name"
            name="name"
            className="form-control form-control-sm"
            autoFocus
            required
            autoComplete="name"
            max="100"
            type="text"/>
        </div>
        <div className="form-group">
          <label htmlFor="username">
            {t("username")}
          </label>
          <input
            id="username"
            name="username"
            className="form-control form-control-sm"
            required
            autoComplete="username"
            max="100"
            type="text"/>
        </div>
        <div className="form-group">
          <label htmlFor="email">
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            className="form-control form-control-sm"
            required
            autoComplete="email"
            pattern=".+@.+"
            max="100"
            type="email"/>
        </div>
        <div className="form-group">
          <label htmlFor="password">
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            className="form-control form-control-sm"
            required
            autoComplete="new-password"
            pattern=".{8,100}"
            type="password"/>
        </div>
        <button
          className="btn btn-primary btn-sm"
          type="submit">
          {t("action.signIn")}
        </button>
      </form>
    );
  }

  if (globalState.user) {
    const url = qString.get<string>("location") || "/";
    return (
      <Redirect to={url}/>
    );
  }

  return (
    <main className="bg-dark h-100">
      <div className="container h-100">
        <div className="row h-100">
          <div className="col-sm-9 col-md-7 col-lg-5 mx-auto my-auto">
            <div className="card bg-light my-5">
              <div className="card-body px-0">
                <h5 className="card-title text-center">{process.env.APP_NAME}</h5>
                <ul className="nav nav-tabs px-2">
                  <li
                    className={`nav-item pointer`}
                    onClick={() => setState(0)}>
                    <a
                      className={`nav-link ${state === 0 ? ' active' : ''}`}
                      href="#">
                      {t("action.login")}
                    </a>
                  </li>
                  <li
                    className={`nav-item pointer`}
                    onClick={() => setState(1)}>
                    <a
                      className={`nav-link ${state === 1 ? ' active' : ''}`}
                      href="#">
                      {t("action.signIn")}
                    </a>
                  </li>
                </ul>
                <div className="p-3 bg-white border-bottom">
                  {state === 0 && <LoginForm/>}
                  {state === 1 && <SignUpForm/>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

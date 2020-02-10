import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationState, QueryString, FragioAPI } from "../../common";

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

export default function LoginRoute({ match }) {
  const token = getTokenFromStorage();
  const api = new FragioAPI(process.env.API_URL, token.token);
  const qString = new QueryString(location.href);
  const globalState = useSelector<ApplicationState, ApplicationState>(state => state);
  const dispatch = useDispatch();
  const [state, setState] = useState(0);

  useEffect(() => {
    if (token.token)
      login(token.storage);
  }, []);

  async function login(storage) {
    const user = await api.getCurrentUser();

    if (user) {
      dispatch({
        type: "LOGIN",
        data: {
          token: api.token,
          storage,
          user
        }
      });
    }
  }

  async function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const token = await api.getToken(data.get("username"), data.get("password"));
    const remember = data.get("remember-me") == "remember";

    if (!token)
      return false;

    if (token) {
      api.token = token;
      await login(remember ? "local" : "session");
    }
  }

  function LoginForm() {
    return (
      <form onSubmit={onSubmitHandler}>
        <div className="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            name="username"
            className="form-control"
            autofocus
            autocomplete="username"
            type="text"/>
        </div>
        <div className="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            className="form-control"
            autocomplete="current-password"
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
            className="form-check-label"
            for="remember">
            Remember-me
          </label>
        </div>
        <button
          className="btn btn-primary"
          type="submit">
          Login
        </button>
      </form>
    );
  }

  if (globalState.user) {
    const url = qString.get("location") || "/";
    return (
      <Redirect to={url}/>
    );
  }

  return (
    <main className="bg-dark h-100">
      <div className="container h-100">
        <div className="row h-100">
          <div className="col-sm-9 col-md-7 col-lg-5 mx-auto my-auto">
            <div className="card my-5">
              <div className="card-body">
                <h5 className="card-title text-center">{process.env.APP_NAME}</h5>
                <ul className="nav nav-tabs mb-3">
                  {["Login", "Create Account"].map((tab, i) =>
                    <li
                      className={`nav-item pointer`}
                      onClick={() => setState(i)}>
                      <a
                        className={`nav-link ${state === i ? ' active' : ''}`}
                        href="#">
                        {tab}
                      </a>
                    </li>
                  )}
                </ul>
                {state === 0 &&
                  <LoginForm/>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

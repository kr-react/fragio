import * as React from "react";
import { Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ApplicationState, QueryString, FragioAPI } from "../../common";

interface LoginFormProps {
  onLogin?: (data: LoginData) => boolean
}

interface LoginData {
  username: string,
  password: string
}

function LoginForm(props: LoginFormProps) {
  return (
    <form enctype="multipart/form-data" autocomplete="on" onSubmit={e => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      props.onLogin({
        username: data.get("username"),
        password: data.get("password")
      });
    }}>
      <input name="username" aria-label="username" type="text" autocomplete="username"/>
      <input name="password" aria-label="password" type="password" autocomplete="current-password"/>
      <input type="submit" value="Login"/>
    </form>
  );
}

export default function LoginRoute({ match }: any) {
  const api = new FragioAPI(process.env.API_URL, window.localStorage.getItem("token"));
  const location = new QueryString(window.location.href);
  const globalState = useSelector<ApplicationState, ApplicationState>(state => state);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (api.token) login();
  }, []);

  async function login() {
    const user = await api.getCurrentUser();

    if (user) {
      dispatch({
        type: "LOGIN",
        data: {
          token: api.token,
          user
        }
      });
    }
  }

  async function onLoginHandler(info: LoginData) {
    const token = await api.getToken(info.username, info.password);
    if (token) {
      api.token = token;
      await login();
    }

    return false;
  }

  if (globalState.user) return <Redirect to={location.get("location") || "/"}/>
  return <LoginForm onLogin={onLoginHandler}/>;
}

import * as React from "react";
import { useSelector } from "react-redux";
import { Redirect, useHistory, RouteComponentProps } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  ApplicationState,
  Team,
  FragioAPI,
} from "../../../src/common";
import { Loading } from "../../components";

export default function NewBoardPage({ match }: RouteComponentProps<never>) {
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL as string, token as string);
  const history = useHistory();
  const { t } = useTranslation();
  const [localState, setLocalState] = React.useState<{
    teams: Team[],
    status: "DONE" | "LOADING" | "ERROR"
  }>({
    teams: [],
    status: "LOADING"
  });

  if (!user) {
    return <Redirect to="/landing"/>
  }

  React.useEffect(() => {
    document.title = t("pageTitle.newBoard", {name: process.env.APP_NAME});

    async function request() {
      try {
        if (user) {
          const teams = await api.getTeamsFromUser(user.username);
          setLocalState({
            teams,
            status: "DONE"
          });
        } else {
          throw "User is undefined";
        }
      } catch(err) {
        setLocalState({
          ...localState,
          status: "ERROR"
        });
      }
    }

    request();
  }, [match]);

  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    api.createBoard({
      name: data.get("name"),
      isPrivate: data.get("isPrivate") == "1",
      teamId: data.get("teamId") || null
    }).then(board => {
      history.push(`/board/${board.id}`);
    });
  }

  if (localState === undefined) {
    return (
      <div className="text-center">
        <Loading className="m-3 text-secondary"/>
      </div>
    );
  } else if (localState === null) {
    return (
      <span>Error</span>
    );
  }

  return (
    <div className="container-fluid h-100 bg-light">
      <div className="container h-100 py-4 bg-white border-left border-right">
        <h5>{t("action.createBoard")}</h5>
        <small className="text-muted">
          {t("desc.createBoard")}
        </small>
        <hr className="my-3" />
        <form
          onSubmit={onSubmitHandler}>
          <div className="form-group">
            <div className="input-group input-group-sm">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  htmlFor="name">
                  {t("name")}
                </label>
              </div>
              <input
                name="name"
                required
                className="form-control"
                autoFocus
                type="text"
                aria-describedby="name-help"/>
            </div>
          </div>
          <div className="form-group">
            <div className="input-group input-group-sm">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  htmlFor="select">
                  {t("team")}
                </label>
              </div>
              <select
                className="custom-select"
                name="teamId"
                id="select">
                <option
                  value=""
                  selected>
                  {t("none")}
                </option>
                {localState.teams.filter(team => team.owner.id == user.id).map(team =>
                  <option value={team.id}>{team.name}</option>
                )}
              </select>
            </div>
          </div>
          <div className="form-group">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="isPrivate"
                id="public-radio"
                value={0}/>
              <label
                className="form-check-label"
                htmlFor="public-radio">
                {t("public")}
              </label>
              <small
                id="public-radio-help"
                className="form-text text-muted mt-0">
                {t("desc.publicBoard")}
              </small>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="isPrivate"
                id="private-radio"
                value={1}
                checked
                aria-describedby="private-radio-help"/>
              <label
                className="form-check-label"
                htmlFor="private-radio">
                {t("private")}
              </label>
              <small
                id="private-radio-help"
                className="form-text text-muted mt-0">
                {t("desc.privateBoard")}
              </small>
            </div>
          </div>
          <hr className="my-3" />
          <button
            className="btn btn-primary btn-sm"
            type="submit">
            {t("action.create")}
          </button>
        </form>
      </div>
    </div>
  );
}

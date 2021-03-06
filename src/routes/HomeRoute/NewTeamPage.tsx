import * as React from "react";
import { useSelector } from "react-redux";
import { Redirect, useHistory, RouteComponentProps } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  ApplicationState,
  User,
  Team,
  Board,
  FragioAPI,
} from "../../../src/common";

export default function NewBoardPage({ match }: RouteComponentProps<never>) {
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL as string, token as string);
  const history = useHistory();
  const { t } = useTranslation();

  if (!user) {
    return <Redirect to="/landing"/>
  }

  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    api.createTeam({
      name: data.get("name"),
    }).then(team => {
      history.push(`/team/${team.id}`);
    });
  }

  document.title = t("pageTitle.newTeam", {name: process.env.APP_NAME});

  return (
    <div className="container-fluid h-100 bg-light">
      <div className="container h-100 py-4 bg-white border-left border-right">
        <h5>{t("action.createTeam")}</h5>
        <small className="text-muted">
          {t("desc.createTeam")}
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

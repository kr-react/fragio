import { useEffect, useState, FormEvent, HTMLFormElement } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import {
  ApplicationState,
  User,
  Team,
  Board,
  FragioAPI,
} from "../../common";

export default function NewBoardPage({ match }) {
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL, token);
  const history = useHistory();

  function onSubmitHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    api.createTeam({
      name: data.get("name"),
    }).then(team => {
      history.push(`/team/${team.id}`);
    });
  }

  return (
    <div className="container-fluid h-100 bg-light">
      <div className="container h-100 py-4 bg-white border-left border-right">
        <h5>Create a new team</h5>
        <small class="text-muted">
          {"Create and use a team to share your work on private way."}
        </small>
        <hr className="my-3" />
        <form
          onSubmit={onSubmitHandler}>
          <div className="form-group">
            <div className="input-group">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  for="name">
                  Name
                </label>
              </div>
              <input
                name="name"
                required
                className="form-control"
                autofocus
                type="text"
                aria-describedby="name-help"/>
            </div>
            <small
              id="name-help"
              class="form-text text-muted">
              {"Great team names are short and memorable. Need Inspiration?"}
            </small>
          </div>
          <hr className="my-3" />
          <button
            className="btn btn-primary"
            type="submit">
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

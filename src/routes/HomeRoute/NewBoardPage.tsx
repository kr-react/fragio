import * as React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import {
  ApplicationState,
  User,
  Team,
  Board,
  FragioAPI,
} from "~/src/common";

export default function NewBoardPage({ match }) {
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL, token);
  const history = useHistory();
  const [localState, setLocalState] = React.useState<{
    teams: Team[],
  }>(undefined);

  React.useEffect(() => {
    async function request() {
      const teams = await api.getTeamsFromUser(user.username);

      if (teams) {
        setLocalState({
          teams,
        });

        document.title = `New board - ${process.env.APP_NAME}`
      } else {
        setLocalState(null);
      }
    }

    request();
  }, []);

  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    api.createBoard({
      name: data.get("name"),
      isPrivate: data.get("isPrivate") == 1,
      teamId: data.get("teamId") || null
    }).then(board => {
      history.push(`/board/${board.id}`);
    });
  }

  if (localState === undefined) {
    return (
      <span>Loading</span>
    );
  } else if (localState === null) {
    return (
      <span>Error</span>
    );
  }

  return (
    <div className="container-fluid h-100 bg-light">
      <div className="container h-100 py-4 bg-white border-left border-right">
        <h5>Create a new board</h5>
        <small class="text-muted">
          {"Create and use a board to manage work at a personal or organizational level."}
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
              {"Great board names are short and memorable. Need Inspiration?"}
            </small>
          </div>
          <div className="form-group">
            <div className="input-group">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  for="select">
                  Team
                </label>
              </div>
              <select
                className="custom-select"
                name="teamId"
                id="select">
                <option
                  value=""
                  selected>
                  None
                </option>
                {localState.teams.map(team =>
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
                for="public-radio">
                Public
              </label>
              <small
                id="public-radio-help"
                class="form-text text-muted mt-0">
                {"Anyone can see this board. Team members can change."}
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
                for="private-radio">
                Private
              </label>
              <small
                id="private-radio-help"
                class="form-text text-muted mt-0">
                {"Only team members can see and change this board."}
              </small>
            </div>
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

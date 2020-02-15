import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";
import { Sticky, ActivityComponent } from "~/src/components";
import {
  ApplicationState,
  Board,
  Team,
  HistoryEntry,
  FragioAPI,
} from "~/src/common";

export default function HomePage({ match }) {
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL, token);
  const history = useHistory();
  const dispatch = useDispatch();
  const [localState, setLocalState] = React.useState<{
    boards: Board[],
    teams: Team[],
    history: HistoryEntry[],
    activities: Activity[],
  }>(undefined);
  const [searchState, setSearchState] = React.useState({
    board: "",
    team: ""
  });

  React.useEffect(() => {
    async function request() {
      const boards = await api.getBoardsFromUser(user.username);
      const teams = await api.getTeamsFromUser(user.username);
      const history = await api.getHistoryFromUser(user.username);
      const activities = await api.getActivitiesFromUser(user.username);

      if (boards && teams && history && activities) {
        setLocalState({
          boards,
          teams,
          history,
          activities
        });
      } else {
        setLocalState(null);
      }
    }

    request();
    document.title = `Home - ${process.env.APP_NAME}`;
  }, []);

  function createBoard(name: string) {
    api.createBoard({
      name
    }).then(board => {
      setLocalState({
        ...localState,
        boards: boards.concat([board])
      });
    });
  }

  function createTeam(name: string) {
    api.createTeam({
      name
    }).then(team => {
      setLocalState({
        ...localState,
        teams: teams.concat([team])
      });
    });
  }

  function refreshActivities() {
    // TODO: Query new activities
  }

  function getLastTimeOpen(boardId: string) {
    const h = localState.history.find(h => h.boardId == boardId);
    return h ? new Date(h.createdAt).toLocaleString() : "Never";
  }

  function includesIgnoreCase(str1: string, str2: string) {
    return str1.toUpperCase().includes(str2.toUpperCase());
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
    <div className="container-fluid h-100 bg-light overflow-auto">
      <div className="container h-100">
        <div className="row h-100">
          <Sticky>
            <div className="col-sm col-md-4 col-lg-3 p-3 overflow-auto h-100">
              <div className="d-flex flex-row align-items-center justify-content-between">
                <span>Boards</span>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => history.push("/newboard")}>
                  New
                </button>
              </div>
              <div className="input-group input-group-sm mt-2">
                <input
                  type="text"
                  className="form-control"
                  value={searchState.board}
                  onChange={e => setSearchState({...searchState, board: e.currentTarget.value})}
                  placeholder="Find a board..."
                  aria-label="Board"/>
              </div>
              <div className="d-flex flex-column mt-2">
                {localState.boards.filter(b => includesIgnoreCase(b.name, searchState.board)).map(board =>
                  <Link
                    className="mt-2"
                    to={`board/${board.id}`}>
                    {board.name}
                  </Link>
                )}
              </div>
              <hr className="my-3"/>
              <div className="d-flex flex-row align-items-center justify-content-between">
                <span>Teams</span>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => history.push("/newteam")}>
                  New
                </button>
              </div>
              <div className="input-group input-group-sm mt-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Find a team..."
                  value={searchState.team}
                  onChange={e => setSearchState({...searchState, team: e.currentTarget.value})}
                  aria-label="Team"/>
              </div>
              <div className="d-flex flex-column mt-2">
                {localState.teams.filter(t => includesIgnoreCase(t.name, searchState.team)).map(team =>
                  <Link
                    className="mt-2"
                    to={`team/${team.id}`}>
                    {team.name}
                  </Link>
                )}
              </div>
            </div>
          </Sticky>
          <main className="col flex-column bg-white pt-3 px-3 border-left border-right d-none d-sm-none d-md-flex">
            <div className="mb-2 d-flex flex-row align-items-center justify-content-between">
              <span>Activity</span>
              <button
                className="btn btn-outline-primary btn-sm float-right"
                onClick={() => refreshActivities()}>
                Refresh
              </button>
            </div>
            {localState.activities.map(activity =>
              <div className="mb-3">
                <ActivityComponent activity={activity}/>
              </div>
            )}
          </main>
          <Sticky>
            <div className="col-3 pt-3 px-3 d-none d-sm-none d-md-none d-lg-block overflow-auto h-100">
              <div>
                <span>Recents</span>
              </div>
              <div className="d-flex flex-column">
                {localState.history.map(entry =>
                  <Link
                    className="mt-2"
                    to={`board/${entry.board.id}`}>
                    {entry.board.name}
                  </Link>
                )}
              </div>
            </div>
          </Sticky>
        </div>
      </div>
    </div>
  );
}

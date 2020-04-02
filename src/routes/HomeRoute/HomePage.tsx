import * as React from "react";
import { useSelector } from "react-redux";
import { Link, Redirect, useHistory, RouteComponentProps } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Sticky, ActivityComponent } from "../../../src/components";
import {
  ApplicationState,
  Board,
  Team,
  HistoryEntry,
  Activity,
  FragioAPI,
} from "../../../src/common";

export default function HomePage({ match }: RouteComponentProps<{id: string}>) {
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL as string, token as string);
  const history = useHistory();
  const { t } = useTranslation();
  const [localState, setLocalState] = React.useState<{
    boards: Board[],
    teams: Team[],
    history: HistoryEntry[],
    activities: Activity[],
    status: "DONE" | "LOADING" | "ERROR"
  }>({
    boards: [],
    teams: [],
    history: [],
    activities: [],
    status: "LOADING",
  });
  const [searchState, setSearchState] = React.useState({
    board: "",
    team: ""
  });

  React.useEffect(() => {
    async function request() {
      try {
        if (user) {
          const boards = await api.getBoardsFromUser(user.username);
          const teams = await api.getTeamsFromUser(user.username);
          const history = await api.getHistoryFromUser(user.username);
          const activities = await api.getActivitiesFromUser(user.username);
          
          setLocalState({
            boards,
            teams,
            history,
            activities,
            status: "DONE",
          });
        } else {
          throw "User is undefined";
        }
      } catch (err) {
        setLocalState({
          ...localState,
          status: "ERROR",
        });
      }
    }

    request();
    document.title = `Home - ${process.env.APP_NAME}`;
  }, [match]);

  if (!user) {
    return <Redirect to="/landing"/>
  }

  function includesIgnoreCase(str1: string, str2: string) {
    return str1.toUpperCase().includes(str2.toUpperCase());
  }

  if (localState.status == "LOADING") {
    return (
      <span>Loading</span>
    );
  } else if (localState.status == "ERROR") {
    return (
      <span>Error</span>
    );
  }

  return (
    <div className="container-fluid h-100 bg-light overflow-auto">
      <div className="row h-100">
        <div className="col px-0">
          <Sticky>
            <div className="p-3 overflow-auto">
              <div className="d-flex flex-row align-items-center justify-content-between">
                <span>{t("board_plural")}</span>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => history.push("/newboard")}>
                  {t("action.new")}
                </button>
              </div>
              <div className="input-group input-group-sm mt-2">
                <input
                  type="text"
                  className="form-control"
                  value={searchState.board}
                  onChange={e => setSearchState({...searchState, board: e.currentTarget.value})}
                  placeholder={t("action.findBoard")}
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
                <span>{t("team_plural")}</span>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => history.push("/newteam")}>
                  {t("action.new")}
                </button>
              </div>
              <div className="input-group input-group-sm mt-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder={t("action.findTeam")}
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
        </div>
        <main className="col-md-8 col-lg-7 flex-column bg-white pt-3 px-3 border-left border-right d-none d-sm-none d-md-flex">
          {localState.activities.map(activity =>
            <React.Fragment>
              <ActivityComponent activity={activity}/>
              <hr className="w-100"/>
            </React.Fragment>
          )}
        </main>
        <div className="col p-0 d-none d-sm-none d-md-none d-lg-block">
          <Sticky>
            <div className="p-3 overflow-auto">
              <div>{t("recent")}</div>
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

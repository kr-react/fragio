import { Fragment, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";
import { createPopper } from "@popperjs/core";
import * as moment from 'moment';

import {
  ApplicationState,
  Board,
  Team,
  HistoryEntry,
  FragioAPI,
} from "../../common";

export default function HomePage({ match }) {
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL, token);
  const history = useHistory();
  const dispatch = useDispatch();
  const [localState, setLocalState] = useState<{
    boards: Board[],
    teams: Team[],
    history: HistoryEntry[],
    activities: Activity[],
  }>(undefined);
  const [searchState, setSearchState] = useState({
    board: "",
    team: ""
  });

  useEffect(() => {
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

  function ActivityComponent(props: { activity: Activity }) {
    const { activity } = props;

    function getBody() {
      switch (activity.activityType) {
        case 0: {
          const { board } = activity;

          return (
            <Fragment>
              <span>Added board </span>
              <Link to={`/board/${board.id}`}>
                <b>{board.name}</b>
              </Link>
            </Fragment>
          );
        } break;

        case 1: {
          const { list } = activity;

          return (
            <Fragment>
              <span>Added list </span>
              <b>{list.name}</b>
              <span> to </span>
              <Link to={`/board/${list.board.id}`}>
                <b>{list.board.name}</b>
              </Link>
            </Fragment>
          );
        } break;

        case 2: {
          const { card } = activity;

          return (
            <Fragment>
              <span>Added card </span>
              <b>{card.name}</b>
              <span> to </span>
              <b>{card.list.name}</b>
              <span> on board </span>
              <Link to={`/board/${card.list.board.id}`}>
                <b>{card.list.board.name}</b>
              </Link>
            </Fragment>
          );
        } break;

        case 3: {
          const { board, data } = activity;

          return (
            <Fragment>
              <span>Renamed board </span>
              <b>{data.oldName}</b>
              <span> to </span>
              <Link to={`/board/${board.id}`}>
                <b>{data.newName}</b>
              </Link>
            </Fragment>
          );
        } break;

        case 4: {
          const { list, data } = activity;

          return (
            <Fragment>
              <span>Renamed list </span>
              <b>{data.oldName}</b>
              <span> to </span>
              <b>{data.newName}</b>
              <span> on board </span>
              <Link to={`/board/${list.board.id}`}>
                <b>{list.board.name}</b>
              </Link>
            </Fragment>
          );
        } break;

        case 5: {
          const { card, data } = activity;

          return (
            <Fragment>
              <span>Renamed card </span>
              <b>{data.oldName}</b>
              <span> to </span>
              <b>{data.newName}</b>
              <span> on board </span>
              <Link to={`/board/${card.list.board.id}`}>
                <b>{card.list.board.name}</b>
              </Link>
            </Fragment>
          );
        } break;

        case 6: {
          const { card } = activity;

          return (
            <Fragment>
              <span>Moved card </span>
              <b>{card.name}</b>
              <span> to </span>
              <b>{card.list.name}</b>
              <span> on board </span>
              <Link to={`/board/${card.list.board.id}`}>
                <b>{card.list.board.name}</b>
              </Link>
            </Fragment>
          );
        } break;
      }
    }

    return (
      <div className="app-activity card shadow-sm">
        <div className="card-header">
          <img
            className="rounded mr-2"
            width="30px"
            height="30px"
            alt={activity.user.name}
            src={activity.user.imageUrl}/>
          <span>{activity.user.name}</span>
        </div>
        <div className="card-body text-muted">
          {getBody()}
        </div>
        <div className="card-footer text-muted">
          <span>{activity.team.name}</span>
          <span className="float-right">
            {moment(activity.createdAt).fromNow()}
          </span>
        </div>
      </div>
    );
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
          <div className="col-sm col-md-4 col-lg-3 pt-3 px-3 pt-3">
            <div className="sticky-top">
              <div className="d-flex flex-row align-items-center justify-content-between">
                <span>Teams</span>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm">
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
              <hr className="my-3"/>
              <div className="d-flex flex-row align-items-center justify-content-between">
                <span>Boards</span>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm">
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
            </div>
          </div>
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
          <div className="col-3 pt-3 px-3 d-none d-sm-none d-md-none d-lg-block">
            <div className="sticky-top">
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
          </div>
        </div>
      </div>
    </div>
  );
}

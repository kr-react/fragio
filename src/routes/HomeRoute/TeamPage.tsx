import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";

import {
  FragioAPI,
  ApplicationState,
  Team,
  Member,
  Board,
} from "../../common";

export default function TeamPage({ match }) {
  const { user, token } = useSelector<ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL, token);
  const history = useHistory();
  const [localState, setLocalState] = React.useState<{
    team: Team,
    boards: Board[],
    members: Member[],
    selectedTab: number
  }>(undefined);

  React.useEffect(() => {
    async function request() {
      const team = await api.getTeam(match.params.id);
      const members = await api.getTeamMembers(match.params.id);
      const boards = await api.getTeamBoards(match.params.id);

      if (team && members && boards) {
        setLocalState({
          team,
          members,
          boards,
          selectedTab: 0
        });
        document.title = `${team.name} - ${process.env.APP_NAME}`;
      } else {
        setLocalState(null);
      }
    }

    request();
  }, []);

  function removeMember(username: string) {
    api.leaveTeam(localState.team.id, username).then(() => {
      setLocalState({
        ...localState,
        members: localState.members.filter(member => member.user.username != username)
      });
    });
  }

  function setTab(index: number) {
    setLocalState({
      ...localState,
      selectedTab: index
    });
  }

  function BoardsTab() {
    const [searchText, setSearchText] = React.useState("");
    const boards = localState.boards.filter(board => {
      return board.name.toLowerCase().includes(searchText.toLowerCase());
    });

    return (
      <React.Fragment>
        <div className="card">
          <div className="card-header d-flex flex-row justify-content-between align-items-center">
            <b className="text-nowrap">{`${boards.length} board(s)`}</b>
            <div className="input-group input-group-sm ml-4">
              <div className="input-group-prepend">
                <span className="input-group-text">Search</span>
              </div>
              <input
                className="form-control"
                type="text"
                placeholder="Search all boards"
                aria-label="Search"
                onChange={e => setSearchText(e.currentTarget.value)}/>
            </div>
          </div>
          <ul className="list-group list-group-flush">
            {boards.map(board =>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <Link to={`board/${board.id}`}>
                  {board.name}
                </Link>
                <button className="btn btn-outline-danger btn-sm">
                  Delete
                </Button>
              </li>
            )}
          </ul>
        </div>
      </React.Fragment>
    );
  }

  if (localState === null) {
    return <div>Not Found</div>;
  } else if (localState === undefined) {
    return <div>Loading</div>;
  }

  return (
    <React.Fragment>
      <div className="bg-light border-bottom">
        <div className="container">
          <div className="py-3">
            <h6 className="m-0">
              <b>{localState.team.name}</b>
            </h6>
          </div>
          <ul className="nav nav-tabs border-bottom-0 text-nowrap flex-nowrap">
            <li
              className="nav-item pointer"
              onClick={() => setTab(0)}>
              <span className={`nav-link${localState.selectedTab === 0 ? " active" : ""}`}>
                Activities
              </span>
            </li>
            <li
              className="nav-item pointer"
              onClick={() => setTab(1)}>
              <span className={`nav-link${localState.selectedTab === 1 ? " active" : ""}`}>
                <span>Boards </span>
                <span className="badge badge-secondary">
                  {localState.boards.length}
                </span>
              </span>
            </li>
            <li
              className="nav-item pointer"
              onClick={() => setTab(2)}>
              <span className={`nav-link${localState.selectedTab === 2 ? " active" : ""}`}>
                <span>Members </span>
                <span className="badge badge-secondary">
                  {localState.members.length}
                </span>
              </span>
            </li>
            <li
              className="nav-item pointer"
              onClick={() => setTab(3)}>
              <span className={`nav-link${localState.selectedTab === 3 ? " active" : ""}`}>
                <span>Settings</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <main className="container py-4">
        {localState.selectedTab == 1 && <BoardsTab/>}
        <hr className="my-4"/>
      </main>
    </React.Fragment>
  );
}

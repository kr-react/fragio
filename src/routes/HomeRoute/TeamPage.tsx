import * as React from "react";
import { useSelector } from "react-redux";
import { Link, useHistory, RouteComponentProps } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  useSearch,
  useModal,
  Loading,
  ActivityComponent,
  Footer,
} from "../../../src/components";
import {
  FragioAPI,
  ApplicationState,
  Team,
  Member,
  Board,
  User,
  Activity
} from "../../../src/common";

export default function TeamPage({ match }: RouteComponentProps<{id: string}>) {
  const { t } = useTranslation();
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL as string, token as string);
  const modal = useModal();
  const history = useHistory();
  const [localState, setLocalState] = React.useState<{
    team: Team,
    boards: Board[],
    members: Member[],
    activities: Activity[],
    selectedTab: number,
    status: "DONE" | "LOADING" | "ERROR"
  }>({
    team: {} as Team,
    boards: [],
    members: [],
    activities: [],
    selectedTab: 0,
    status: "LOADING",
  });

  React.useEffect(() => {
    async function request() {
      try {
        const team = await api.getTeam(match.params.id);
        const members = await api.getTeamMembers(match.params.id);
        const boards = await api.getTeamBoards(match.params.id);
        const activities = await api.getTeamActivities(match.params.id);

        document.title = `${team.name} - ${process.env.APP_NAME}`;

        setLocalState({
          team,
          members,
          boards,
          activities,
          selectedTab: 0,
          status: "DONE"
        });
      } catch (err) {
        setLocalState({
          ...localState,
          status: "ERROR"
        });
      }
    }

    request();
  }, []);

  function isOwner(u?: User) {
    return u && u.id == localState.team.owner.id;
  }

  async function deleteMember(username: string) {
    await api.deleteMember(localState.team.id, username);
    setLocalState({
      ...localState,
      members: localState.members.filter(member => member.user.username != username)
    });
  }

  async function createMember(username: string) {
    const member = await api.createMember(localState.team.id, username);
    setLocalState({
      ...localState,
      members: localState.members.concat([member])
    });
  }

  async function removeBoard(id: string) {
    await api.updateBoard(id, {
      teamId: null
    });
    setLocalState({
      ...localState,
      boards: localState.boards.filter(board => board.id != id)
    });
  }

  function setTab(index: number) {
    setLocalState({
      ...localState,
      selectedTab: index
    });
  }

  function ActivitiesTab() {
    const {search, result} = useSearch(localState.activities, a => [
      a.user.name,
      a.user.username,
      a.board.name
    ]);

    return (
      <React.Fragment>
        <div className="card">
          <div className="card-header d-flex flex-row justify-content-between align-items-center sticky-top bg-light">
            <b className="text-nowrap">{t("activityCount", {count: result.length})}</b>
            <div className="input-group input-group-sm ml-4">
              <div className="input-group-prepend">
                <span className="input-group-text">{t("action.search")}</span>
              </div>
              <input
                className="form-control"
                type="text"
                placeholder={t("action.searchActivities")}
                aria-label="Search"
                onChange={e => search(e.currentTarget.value)}/>
            </div>
          </div>
          <ul className="list-group list-group-flush">
            {result.map(activity =>
              <ActivityComponent
                as={"li"}
                className="list-group-item"
                activity={activity}
                compact/>
            )}
          </ul>
        </div>
      </React.Fragment>
    );
  }

  function BoardsTab() {
    const {search, result} = useSearch(localState.boards, b => [
      b.name,
    ]);
    const [userBoards, setUserBoards] = React.useState<Board[]>([]);

    React.useEffect(() => {
      if (!user)
        return;

      api.getBoardsFromUser(user.username)
        .then(boards => {
          setUserBoards(boards.filter(board => !board.teamId));
        });
    }, []);

    return (
      <React.Fragment>
        <div className="card">
          <div className="card-header d-flex flex-row justify-content-between align-items-center sticky-top bg-light">
            <b className="text-nowrap">{t("boardCount", {count: result.length})}</b>
            <div className="input-group input-group-sm ml-4">
              <div className="input-group-prepend">
                <span className="input-group-text">{t("action.search")}</span>
              </div>
              <input
                className="form-control"
                type="text"
                placeholder={t("action.searchBoards")}
                aria-label="Search"
                onChange={e => search(e.currentTarget.value)}/>
            </div>
            {isOwner(user) &&
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary btn-sm dropdown-toggle ml-2"
                  id="boards-dropdown"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false">
                  {t("action.add")}
                </button>
                <div
                  className="dropdown-menu shadow-sm"
                  aria-labelledby="boards-dropdown">
                  {userBoards.map(board =>
                    <span
                      className="dropdown-item pointer"
                      onClick={() => {
                        api.updateBoard(board.id, {
                          teamId: localState.team.id,
                        }).then(board => {
                          setLocalState({
                            ...localState,
                            boards: localState.boards.concat([board]),
                          });
                        });
                      }}>
                      {board.name}
                    </span>
                  )}
                  {userBoards.length == 0 &&
                    <div className="text-center text-muted">
                      <small>
                        {t("desc.empty")}
                      </small>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
          <ul className="list-group list-group-flush">
            {result.map(board =>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <Link to={`/board/${board.id}`}>
                  {board.name}
                </Link>
                {isOwner(user) &&
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeBoard(board.id)}>
                    {t("action.remove")}
                  </button>
                }
              </li>
            )}
          </ul>
        </div>
      </React.Fragment>
    );
  }

  function MembersTab() {
    const {search, result} = useSearch(localState.members, m => [
      m.team.name,
      m.user.name,
      m.user.username,
    ]);

    function MembersModal() {
      return (
        <form
          noValidate
          className="modal-content"
          onSubmit={e => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            createMember(data.get("username") as string).then(() => modal());
          }}>
          <div className="modal-header">
            <h6 className="modal-title">
              {t("action.addMember")}
            </h6>
            <button
              className="close"
              aria-label="Close"
              onClick={() => modal()}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="input-group input-group-sm">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  htmlFor="username">
                  {t("username")}
                </label>
              </div>
              <input
                name="username"
                required
                className="form-control"
                autoFocus
                type="text"/>
            </div>
          </div>
          <div className="modal-footer">
            <input
              type="submit"
              className="btn btn-primary btn-sm"
              value={t("action.add") as string}/>
          </div>
        </form>
      );
    }

    return (
      <React.Fragment>
        <div className="card">
          <div className="card-header d-flex flex-row justify-content-between align-items-center sticky-top bg-light">
            <b className="text-nowrap">{t("memberCount", {count: result.length})}</b>
            <div className="input-group input-group-sm ml-4">
              <div className="input-group-prepend">
                <span className="input-group-text">{t("action.search")}</span>
              </div>
              <input
                className="form-control"
                type="text"
                placeholder={t("action.searchMembers")}
                aria-label="Search"
                onChange={e => search(e.currentTarget.value)}/>
            </div>
            {isOwner(user) &&
              <button
                className="btn btn-outline-primary btn-sm ml-2"
                onClick={() => modal(() => <MembersModal/>)}>
                {t("action.add")}
              </button>
            }
          </div>
          <ul className="list-group list-group-flush">
            {result.map(member =>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span className="d-flex flex-row align-items-center">
                  <Link
                    className="d-flex flex-row align-items-center"
                    to={`/user/${member.user.username}`}>
                    <img
                      className="rounded mr-3"
                      src={member.user.imageUrl}
                      width="25"
                      height="25"/>
                    <span>{member.user.name}</span>
                  </Link>
                  {isOwner(member.user) &&
                    <span className="ml-2 badge badge-secondary">
                      {t("owner")}
                    </span>
                  }
                </span>
                {(isOwner(user) && !isOwner(member.user)) &&
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => deleteMember(member.user.username)}>
                    {t("action.remove")}
                  </button>
                }
              </li>
            )}
          </ul>
        </div>
      </React.Fragment>
    );
  }

  function SettingsTab() {
    function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = new FormData(e.currentTarget);

      api.updateTeam(localState.team.id, {
        name: data.get("name"),
        imageUrl: data.get("imageUrl")
      }).then(team => {
        setLocalState({
          ...localState,
          team
        });
      });
    }

    function deleteTeam() {
      return api.deleteTeam(localState.team.id).then(() => {
        history.push("/");
      });
    }

    return (
      <React.Fragment>
        <h5>{t("settings")}</h5>
        <hr/>
        <form onSubmit={onSubmitHandler}>
          <div className="form-group">
            <label
              htmlFor="rename-input">
              {t("name")}
            </label>
            <input
              id="rename-input"
              type="text"
              name="name"
              className="form-control form-control-sm"
              defaultValue={localState.team.name}/>
          </div>
          <div className="d-flex flex-row justify-content-between">
            <button
              type="submit"
              className="btn btn-primary btn-sm">
              {t("action.save")}
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => deleteTeam()}>
              {t("action.delete")}
            </button>
          </div>
        </form>
      </React.Fragment>
    );
  }

  if (localState.status == "LOADING") {
    return (
      <div className="text-center">
        <Loading className="m-3 text-secondary"/>
      </div>
    );
  } else if (localState.status == "ERROR") {
    return <div>Not Found</div>;
  }

  return (
    <React.Fragment>
      <div className="bg-light border-bottom">
        <div className="container">
          <h6 className="m-0 py-3">
            <b>{localState.team.name}</b>
          </h6>
          <ul className="nav nav-tabs border-bottom-0 text-nowrap">
            <li
              className="nav-item pointer"
              onClick={() => setTab(0)}>
              <span className={`nav-link${localState.selectedTab === 0 ? " active" : ""}`}>
                {t("activity_plural")}
              </span>
            </li>
            <li
              className="nav-item pointer"
              onClick={() => setTab(1)}>
              <span className={`nav-link${localState.selectedTab === 1 ? " active" : ""}`}>
                <span>{t("board_plural")}</span>
                <span className="ml-2 badge badge-secondary">
                  {localState.boards.length}
                </span>
              </span>
            </li>
            <li
              className="nav-item pointer"
              onClick={() => setTab(2)}>
              <span className={`nav-link${localState.selectedTab === 2 ? " active" : ""}`}>
                <span>{t("member_plural")}</span>
                <span className="ml-2 badge badge-secondary">
                  {localState.members.length}
                </span>
              </span>
            </li>
            {isOwner(user) &&
              <li
                className="nav-item pointer"
                onClick={() => setTab(3)}>
                <span className={`nav-link${localState.selectedTab === 3 ? " active" : ""}`}>
                  <span>{t("settings")}</span>
                </span>
              </li>
            }
          </ul>
        </div>
      </div>
      <main className="container pt-4">
        {localState.selectedTab == 0 && <ActivitiesTab/>}
        {localState.selectedTab == 1 && <BoardsTab/>}
        {localState.selectedTab == 2 && <MembersTab/>}
        {(isOwner(user) && localState.selectedTab == 3) && <SettingsTab/>}
      </main>
      <Footer className="container"/>
    </React.Fragment>
  );
}

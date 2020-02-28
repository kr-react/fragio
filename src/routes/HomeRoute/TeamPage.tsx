import * as React from "react";
import * as moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ActivityComponent, Footer } from "~/src/components";
import { useTranslation } from 'react-i18next';
import {
  FragioAPI,
  ApplicationState,
  Team,
  Member,
  Board,
  User,
  Activity
} from "~/src/common";

export default function TeamPage({ match }) {
  const { t } = useTranslation();
  const { user, token } = useSelector<ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL, token);
  const [localState, setLocalState] = React.useState<{
    team: Team,
    boards: Board[],
    members: Member[],
    activities: Activity[],
    selectedTab: number
  }>(undefined);

  React.useEffect(() => {
    async function request() {
      const team = await api.getTeam(match.params.id);
      const members = await api.getTeamMembers(match.params.id);
      const boards = await api.getTeamBoards(match.params.id);
      const activities = await api.getTeamActivities(match.params.id);

      if (team && members && boards && activities) {
        setLocalState({
          team,
          members,
          boards,
          activities,
          selectedTab: 0
        });
        document.title = `${team.name} - ${process.env.APP_NAME}`;
      } else {
        setLocalState(null);
      }
    }

    request();
  }, []);

  function isOwner(u: User) {
    return u && u.id == localState.team.owner.id;
  }

  function removeMember(username: string) {
    api.leaveTeam(localState.team.id, username).then(() => {
      setLocalState({
        ...localState,
        members: localState.members.filter(member => member.user.username != username)
      });
    });
  }

  function removeBoard(id: string) {
    api.updateBoard(id, {
      teamId: null
    }).then(() => {
      setLocalState({
        ...localState,
        boards: localState.boards.filter(board => board.id != id)
      });
    });
  }

  function setTab(index: number) {
    setLocalState({
      ...localState,
      selectedTab: index
    });
  }

  function ActivitiesTab() {
    const [searchText, setSearchText] = React.useState("");
    const activities = localState.activities.filter(activity => {
      const text = searchText.toLowerCase();
      return activity.user.name.toLowerCase().includes(text)
      || activity.user.username.toLowerCase().includes(text);
    });

    return (
      <React.Fragment>
        <div className="card">
          <div className="card-header d-flex flex-row justify-content-between align-items-center sticky-top bg-light">
            <b className="text-nowrap">{t("activityCount", {count: activities.length})}</b>
            <div className="input-group input-group-sm ml-4">
              <div className="input-group-prepend">
                <span className="input-group-text">{t("action.search")}</span>
              </div>
              <input
                className="form-control"
                type="text"
                placeholder={t("action.searchActivities")}
                aria-label="Search"
                onChange={e => setSearchText(e.currentTarget.value)}/>
            </div>
          </div>
          <ul className="list-group list-group-flush">
            {activities.map(activity => 
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
    const [searchText, setSearchText] = React.useState("");
    const boards = localState.boards.filter(board => {
      return board.name.toLowerCase().includes(searchText.toLowerCase());
    });

    return (
      <React.Fragment>
        <div className="card">
          <div className="card-header d-flex flex-row justify-content-between align-items-center sticky-top bg-light">
            <b className="text-nowrap">{t("boardCount", {count: boards.length})}</b>
            <div className="input-group input-group-sm ml-4">
              <div className="input-group-prepend">
                <span className="input-group-text">{t("action.search")}</span>
              </div>
              <input
                className="form-control"
                type="text"
                placeholder={t("action.searchBoards")}
                aria-label="Search"
                onChange={e => setSearchText(e.currentTarget.value)}/>
            </div>
          </div>
          <ul className="list-group list-group-flush">
            {boards.map(board =>
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
    const [searchText, setSearchText] = React.useState("");
    const members = localState.members.filter(member => {
      return member.user.name.toLowerCase().includes(searchText.toLowerCase());
    });

    return (
      <React.Fragment>
        <div className="card">
          <div className="card-header d-flex flex-row justify-content-between align-items-center sticky-top bg-light">
            <b className="text-nowrap">{t("memberCount", {count: members.length})}</b>
            <div className="input-group input-group-sm ml-4">
              <div className="input-group-prepend">
                <span className="input-group-text">{t("action.search")}</span>
              </div>
              <input
                className="form-control"
                type="text"
                placeholder={t("action.searchMembers")}
                aria-label="Search"
                onChange={e => setSearchText(e.currentTarget.value)}/>
            </div>
          </div>
          <ul className="list-group list-group-flush">
            {members.map(member =>
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
                    onClick={() => removeMember(member.user.username)}>
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

    return (
      <React.Fragment>
        <h4>{t("settings")}</h4>
        <hr/>
        <form onSubmit={onSubmitHandler}>
          <div className="form-group">
            <label
              for="rename-input">
              {t("desc.teamName")}
            </label>
            <input
              id="rename-input"
              type="text"
              name="name"
              className="form-control form-control-sm"
              defaultValue={localState.team.name}/>
          </div>
          <div className="form-group">
            <label
              for="image-url-input">
              {t("desc.imageUrl")}
            </label>
            <input
              id="image-url-input"
              type="url"
              name="imageUrl"
              className="form-control form-control-sm"
              defaultValue={localState.team.imageUrl}/>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm">
            {t("action.save")}
          </button>
        </form>
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

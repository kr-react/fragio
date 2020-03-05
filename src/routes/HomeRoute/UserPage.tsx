import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  ActivityComponent,
  Footer,
} from "~/src/components"
import {
  FragioAPI,
  ApplicationState,
  User,
  Board,
  Team,
  Activity,
} from "~/src/common";

export default function UserPage({ match }) {
  const { user, token } = useSelector<ApplicationState>(state => state);
  const dispath = useDispatch();
  const { t } = useTranslation();
  const api = new FragioAPI(process.env.API_URL, token);
  const [localState, setLocalState] = React.useState<{
    user: User,
    boards: Board[],
    teams: Team[],
    activities: Activity[],
    selectedTab: 0,
  }>(undefined);

  React.useEffect(() => {
    async function request() {
      const user = await api.getUser(match.params.username);
      const boards = await api.getBoardsFromUser(match.params.username);
      const teams = await api.getTeamsFromUser(match.params.username);
      const activities = await api.getActivitiesFromUser(match.params.username);

      if (user && boards && teams && activities) {
        setLocalState({
          user,
          boards,
          teams,
          activities,
          selectedTab: 0,
        });
      }
    }

    request();
  }, [match]);

  function canEdit(user: User) {
    if (!user) {
      return false;
    }

    return user.id == localState.user.id;
  }

  function setTab(index: number) {
    setLocalState({
      ...localState,
      selectedTab: index,
    });
  }

  function ActivitiesTab() {
    return (
      <React.Fragment>
        <div className="d-flex flex-column pt-3 px-3">
          {localState.activities.map(activity =>
            <div className="mb-3">
              <ActivityComponent activity={activity}/>
            </div>
          )}
        </div>
        {localState.activities.length == 0 &&
          <div className="m-2">
            <span className="text-muted">
              {t("desc.empty")}
            </span>
          </div>
        }
      </React.Fragment>
    );
  }

  function BoardsTab() {
    return (
      <React.Fragment>
        <ul className="list-group list-group-flush">
          {localState.boards.map(board =>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <Link to={`/board/${board.id}`}>
                {board.name}
              </Link>
            </li>
          )}
        </ul>
        {localState.boards.length == 0 &&
          <div className="m-2">
            <span className="text-muted">
              {t("desc.empty")}
            </span>
          </div>
        }
      </React.Fragment>
    );
  }

  function TeamsTab() {
    return (
      <React.Fragment>
        <ul className="list-group list-group-flush">
          {localState.teams.map(team =>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <Link to={`/team/${team.id}`}>
                {team.name}
              </Link>
            </li>
          )}
        </ul>
        {localState.teams.length == 0 &&
          <div className="m-2">
            <span className="text-muted">
              {t("desc.empty")}
            </span>
          </div>
        }
      </React.Fragment>
    );
  }

  function SettingsTab() {
    let imgUrl = null;

    React.useEffect(() => {
      return () => {
        if (imgUrl) URL.revokeObjectURL(imgUrl);
      };
    });

    function formSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      const data = new FormData(e.currentTarget);
      const imageFile = data.get("image") || null;

      if (imageFile) {
        const reader = new FileReader();

        reader.onload = () => {
          fetch("", {
            method: "POST",
            body: reader.result,
          }).then(res => res.text().then(imageUrl => {
            api.updateUser(localState.user.username, {
              name: data.get("name"),
              username: data.get("username"),
              email: data.get("email"),
              imageUrl
            }).then(user => {
              dispath({
                type: "UPDATE_USER",
                data: {
                  user,
                }
              });
            });
          }));
        };

        reader.readAsArrayBuffer(imageFile);
      } else {
        api.updateUser(localState.user.username, {
          name: data.get("name"),
          username: data.get("username"),
          email: data.get("email"),
        }).then(user => {
          dispath({
            type: "UPDATE_USER",
            data: {
              user,
            }
          });
        });
      }
    }

    function fileInputHandler(e: React.FormEvent<HTMLInputElement>) {
      const input = e.currentTarget;
      const img = input.parentElement.querySelector("img");
      const file = input.files[0];

      if (file.size > 200000) {
        return;
      }

      if (imgUrl) {
        URL.revokeObjectURL(imgUrl);
      }

      imgUrl = URL.createObjectURL(file);
      img.src = imgUrl;
    }

    return (
      <React.Fragment>
        <form className="p-3" onSubmit={formSubmitHandler}>
          <div className="form-row">
            <label className="col-2 pointer">
              <img
                className="rounded border w-100"
                src={localState.user.imageUrl}/>
              <input
                type="file"
                name="image"
                accept="image/png, image/jpeg"
                onInput={fileInputHandler}
                className="d-none"/>
            </label>
            <div className="col form-group ml-3">
              <label for="nameInput">{t("name")}</label>
              <input
                type="text"
                id="nameInput"
                name="name"
                className="form-control form-control-sm"
                defaultValue={localState.user.name}
                aria-describedby="nameHelp"/>
              <small
                id="nameHelp"
                className="form-text text-muted">
                {"We'll never share your email with anyone else."}
              </small>
            </div>
          </div>
          <div className="form-group">
            <label for="usernameInput">{t("username")}</label>
            <input
              type="text"
              id="usernameInput"
              name="username"
              className="form-control form-control-sm"
              defaultValue={localState.user.username}
              aria-describedby="usernameHelp"/>
            <small
              id="usernameHelp"
              className="form-text text-muted">
              {"We'll never share your email with anyone else."}
            </small>
          </div>
          <div className="form-group">
            <label for="emailInput">{t("email")}</label>
            <input
              type="text"
              id="emailInput"
              name="email"
              className="form-control form-control-sm"
              defaultValue={localState.user.email}
              aria-describedby="emailHelp"/>
            <small
              id="emailHelp"
              className="form-text text-muted">
              {"We'll never share your email with anyone else."}
            </small>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm">
            {t("action.save")}
          </button>
        </form>
        <hr/>
        <h6 className="px-3">
          <b>Change password</b>
        </h6>
        <form className="p-3" onSubmit={formSubmitHandler}>
          <div className="form-group">
            <label for="usernameInput">{t("currentPassword")}</label>
            <input
              type="password"
              id="currentPasswordInput"
              name="currentPassword"
              className="form-control form-control-sm"/>
          </div>
          <div className="form-group">
            <label for="passwordInput">{t("password")}</label>
            <input
              type="password"
              id="passwordInput"
              name="password"
              pattern=".{8,100}"
              className="form-control form-control-sm"/>
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
    <div className="container-fluid h-100 overflow-auto bg-light">
      <div className="container">
        <div className="row h-100">
          <div className="col-sm col-md-4 col-lg-3 d-flex flex-column">
            <div className="sticky-top pt-3">
              <div className="card overflow-hidden shadow-sm">
              <img
                width="100%"
                height="auto"
                src={localState.user.imageUrl}/>
              <div className="card-body">
                <h5 className="card-title">{localState.user.name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">{localState.user.username}</h6>
              </div>
            </div>
           </div>
          </div>
          <div className="col mx-3 d-flex flex-column p-0">
            <div className="bg-light border-bottom sticky-top pt-3">
              <ul className="nav nav-tabs border-bottom-0">
                <li
                  className="nav-item pointer"
                  onClick={() => setTab(0)}>
                  <span className={`nav-link${localState.selectedTab == 0 ? ' active' : ''}`}>
                    {t("activity_plural")}
                  </span>
                </li>
                <li
                  className="nav-item pointer"
                  onClick={() => setTab(1)}>
                  <span className={`nav-link${localState.selectedTab == 1 ? ' active' : ''}`}>
                    {t("board_plural")}
                  </span>
                </li>
                <li
                  className="nav-item pointer"
                  onClick={() => setTab(2)}>
                  <span className={`nav-link${localState.selectedTab == 2 ? ' active' : ''}`}>
                    {t("team_plural")}
                  </span>
                </li>
                {canEdit(user) &&
                  <li
                    className="nav-item pointer"
                    onClick={() => setTab(3)}>
                    <span className={`nav-link${localState.selectedTab == 3 ? ' active' : ''}`}>
                      {t("settings")}
                    </span>
                  </li>
                }
              </ul>
            </div>
            <main className="bg-white border border-top-0 rounded-bottom">
              {localState.selectedTab == 0 && <ActivitiesTab/>}
              {localState.selectedTab == 1 && <BoardsTab/>}
              {localState.selectedTab == 2 && <TeamsTab/>}
              {localState.selectedTab == 3 && <SettingsTab/>}
            </main>
          </div>
        </div>
        <Footer/>
      </div>
    </div>
  );
}

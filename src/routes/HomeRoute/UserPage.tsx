import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, RouteComponentProps } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  Loading,
  ActivityComponent,
  Footer,
} from "../../../src/components"
import {
  FragioAPI,
  ApplicationState,
  User,
  Board,
  Team,
  Activity,
} from "../../../src/common";

export default function UserPage({ match }: RouteComponentProps<{username: string}>) {
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const dispath = useDispatch();
  const { t } = useTranslation();
  const api = new FragioAPI(process.env.API_URL as string, token as string);
  const [localState, setLocalState] = React.useState<{
    user: User,
    boards: Board[],
    teams: Team[],
    activities: Activity[],
    selectedTab: number,
    status: "DONE" | "LOADING" | "ERROR",
  }>({
    user: {} as User,
    boards: [],
    teams: [],
    activities: [],
    selectedTab: 0,
    status: "LOADING",
  });

  React.useEffect(() => {
    async function request() {
      try {
        const user = await api.getUser(match.params.username);
        const boards = await api.getBoardsFromUser(match.params.username);
        const teams = await api.getTeamsFromUser(match.params.username);
        const activities = await api.getActivitiesFromUser(match.params.username);

        setLocalState({
          user,
          boards,
          teams,
          activities,
          selectedTab: 0,
          status: "DONE"
        });
      } catch (err) {
        setLocalState({
          ...localState,
          status: "DONE",
        });
      }
    }

    request();
  }, [match]);

  function canEdit(user?: User) {
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
            <React.Fragment>
              <ActivityComponent activity={activity}/>
              <hr className="w-100"/>
            </React.Fragment>
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
    let imgUrl = "";

    React.useEffect(() => {
      return () => {
        if (imgUrl) URL.revokeObjectURL(imgUrl);
      };
    });

    async function formSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      const data = new FormData(e.currentTarget);
      const imageFile = data.get("image") as File || null;
      const name = data.get("name") || null;
      const username = data.get("username") || null;
      const email = data.get("email") || null;

      var imageUrl = user?.imageUrl;

      if (imageFile && user) {
        var imageFormData = new FormData();
        imageFormData.append("files", imageFile, imageFile.name);

        imageUrl = await api.uploadUserImage(user.username, imageFormData);
      }

      var res = await api.updateUser(localState.user.username, {
          name: name != localState.user.name ? name : null,
          username: username != localState.user.username ? username : null,
          email: email != localState.user.email ? email : null,
      });

      dispath({
        type: "UPDATE_USER",
        data: {
          user: {
            ...user,
            imageUrl
          },
        }
      });
    }

    function passwordFormSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      const data = new FormData(e.currentTarget);

      api.updateUser(localState.user.username, {
        password: data.get("password"),
        currentPassword: data.get("currentPassword"),
      }).then(user => {
        dispath({
          type: "UPDATE_USER",
          data: {
            user,
          }
        });
      });
    }

    function fileInputHandler(e: React.FormEvent<HTMLInputElement>) {
      const input = e.currentTarget;
      const img = (input.parentElement as HTMLLabelElement).querySelector("img") as HTMLImageElement;
      const file = input.files ? input.files[0] : null;
      
      if (file) {
        if (file.size > 200000) {
          return;
        }

        if (imgUrl) {
          URL.revokeObjectURL(imgUrl);
        }

        imgUrl = URL.createObjectURL(file);
        img.src = imgUrl;
      }
    }

    return (
      <React.Fragment>
        <form
          className="p-3"
          onSubmit={formSubmitHandler}>
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
              <label htmlFor="nameInput">{t("name")}</label>
              <input
                type="text"
                id="nameInput"
                name="name"
                className="form-control form-control-sm"
                defaultValue={localState.user.name}
                required
                aria-describedby="nameHelp"/>
              <small
                id="nameHelp"
                className="form-text text-muted">
                {t("desc.name")}
              </small>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="usernameInput">{t("username")}</label>
            <input
              type="text"
              id="usernameInput"
              name="username"
              className="form-control form-control-sm"
              defaultValue={localState.user.username}
              required
              aria-describedby="usernameHelp"/>
            <small
              id="usernameHelp"
              className="form-text text-muted">
              {t("desc.username")}
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="emailInput">{t("email")}</label>
            <input
              type="text"
              id="emailInput"
              name="email"
              className="form-control form-control-sm"
              defaultValue={localState.user.email}
              required
              aria-describedby="emailHelp"/>
            <small
              id="emailHelp"
              className="form-text text-muted">
              {t("desc.email")}
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
          <b>{t("security")}</b>
        </h6>
        <form
          className="p-3"
          onSubmit={passwordFormSubmitHandler}>
          <div className="form-group">
            <label htmlFor="usernameInput">{t("currentPassword")}</label>
            <input
              type="password"
              id="currentPasswordInput"
              name="currentPassword"
              pattern=".{8,100}"
              required
              autoComplete="current-password"
              className="form-control form-control-sm"/>
          </div>
          <div className="form-group">
            <label htmlFor="passwordInput">{t("password")}</label>
            <input
              type="password"
              id="passwordInput"
              name="password"
              pattern=".{8,100}"
              required
              autoComplete="new-password"
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

  if (localState.status == "LOADING") {
    return (
      <div className="text-center">
        <Loading className="m-3 text-secondary"/>
      </div>
    );
  } else if (localState.status == "ERROR") {
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
                <h6 className="card-subtitle mb-2 text-muted">{localState.user.username}</h6>
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

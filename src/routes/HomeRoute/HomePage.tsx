import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";

import {
  ApplicationState,
  Board,
  Team,
  HistoryEntry,
  FragioAPI,
} from "../../common";

import {
  Avatar,
  Header,
  HeaderItem,
  Button,
  Tabs,
  Table,
  Layout,
  Nav,
  NavItem,
  NavSection,
  NavSeparator,
  Grid,
  Text
} from "../../lazuli";

export default function HomePage() {
  const api = new FragioAPI(process.env.API_URL, window.localStorage.getItem("token"));
  const history = useHistory();
  const dispatch = useDispatch();
  const globalState = useSelector<ApplicationState, ApplicationState>(state => state);
  const [localState, setLocalState] = React.useState<{
    boards: Board[],
    teams: Team[],
    history: HistoryEntry[]
  }>(undefined);

  React.useEffect(() => {
    async function apiRequest() {
      const boards = await api.getBoardsFromUser(globalState.user.username);
      const teams = await api.getTeamsFromUser(globalState.user.username);
      const history = await api.getHistoryFromUser(globalState.user.username);

      if (boards && teams && history) {
        setLocalState({
          boards,
          teams,
          history
        });
      } else {
        setLocalState(null);
      }
    }

    apiRequest();
    document.title = `Home - ${process.env.APP_NAME}`;
  }, []);

  function getGridColumns() {
    if (globalState.viewMode == "Desktop") {
      return ["240px", "auto", "340px"];
    } else if (globalState.viewMode == "Tablet") {
      return ["240px", "auto", "0px"];
    } else {
      return ["0px", "auto", "0px"];
    }
  }

  function logout() {
    dispatch({
      type: "LOGOUT",
      data: null
    });
  }

  if (localState === null) {
    return <div>Loading</div>;
  } else if (localState === undefined) {
    return <div>Error</div>;
  }

  return (
    <Grid className="stretch" colums={getGridColumns()}>
      <Nav style={{borderRight: "solid 1px #ECECEC"}}>
        <NavItem onClick={() => api.createBoard({
          name: "New Board"
        }).then(board => setLocalState({
          ...localState,
          boards: localState.boards.concat([board])
        }))}>
          Create board
        </NavItem>
        <NavItem selected={true}>Home</NavItem>
        <NavItem onClick={() => logout()}>Logout</NavItem>
        <NavSeparator/>
        <NavSection header={
          <div className="flex-row flex-justify-between flex-align-baseline">
            <Text content="TEAMS" weight="bold"/>
            <Button text="Create" onClick={() => {
              api.createTeam({
                name: `Team ${localState.teams.length}`
              }).then(team => {
                setLocalState({
                  ...localState,
                  teams: localState.teams.concat([team])
                });
              });
            }}/>
          </div>
        }>
          {localState.teams.map(team =>
            <NavItem onClick={e => history.push(`/team/${team.id}`)}>
              {team.name}
            </NavItem>
          )}
        </NavSection>
      </Nav>
      <main className="overflow-y-auto p20 color-secondary">
        <Tabs defaultIndex={1}>
          {[
            {
              name: "My Boards",
              component: (
                <Table sources={localState.boards.map(board => {
                  const entry = localState.history.find(h => h.boardId == board.id);
                  return {
                    key: board.id,
                    unselectable: false,
                    fields: {
                      name: <Link to={`/board/${board.id}`}>{board.name}</Link>,
                      lastOpen: entry ? new Date(entry.createdAt).toLocaleString() : "Never",
                      team: board.team ? <Link to={`/team/${board.team.id}`}>{board.team.name}</Link> : "None",
                      owner: board.owner.name,
                      avatar: (
                        <Avatar src={board.owner.imageUrl} style={{
                          width: "25px",
                          height: "25px"
                        }}/>
                      )
                    }
                  };
                })}
                columns={[
                  {
                    title: "Name",
                    field: "name"
                  },
                  {
                    title: "Last open by you",
                    field: "lastOpen"
                  },
                  {
                    title: "Team",
                    field: "team"
                  },
                  {
                    title: "Owner",
                    field: "owner"
                  },
                  {
                    title: "",
                    field: "avatar"
                  }
                ]}/>
              )
            },
            {
              name: "Recent",
              component: (
                <Table sources={localState.history.map(entry => {
                  const {board, createdAt} = entry;
                  const date = new Date(createdAt);
                  return {
                    key: board.id,
                    unselectable: false,
                    fields: {
                      name: <Link to={`/board/${board.id}`}>{board.name}</Link>,
                      lastOpen: date.toLocaleString(),
                      team: board.team ? <Link to={`/team/${board.team.id}`}>{board.team.name}</Link> : "None",
                      owner: board.owner.name,
                      avatar: (
                        <Avatar src={board.owner.imageUrl} style={{
                          width: "25px",
                          height: "25px"
                        }}/>
                      )
                    }
                  };
                })}
                columns={[
                  {
                    title: "Name",
                    field: "name"
                  },
                  {
                    title: "Last open by you",
                    field: "lastOpen"
                  },
                  {
                    title: "Team",
                    field: "team"
                  },
                  {
                    title: "Owner",
                    field: "owner"
                  },
                  {
                    title: "",
                    field: "avatar"
                  }
                ]}/>
              )
            },
            {
              name: "Shared with me",
              component: <p>Nothing here yet</p>
            }
          ]}
        </Tabs>
      </main>
      <Nav style={{borderLeft: "solid 1px #ECECEC"}}>
        <NavSection text="Activity">
          <NavItem>Example</NavItem>
        </NavSection>
      </Nav>
    </Grid>
  );
}

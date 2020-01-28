import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";

import {
  FragioAPI,
  ApplicationState,
  Team,
  Member,
  Board,
} from "../../common";

import {
  Avatar,
  Button,
  ButtonGroup,
  Layout,
  Grid,
  Text,
  Tabs,
  Table,
} from "../../lazuli";

export default function TeamPage(props: { id: string }) {
  const api = new FragioAPI(process.env.API_URL, window.localStorage.getItem("token"));
  const history = useHistory();
  const globalState = useSelector<ApplicationState>(state => state);
  const [localState, setLocalState] = useState<{
    team: Team,
    boards: Board[],
    members: Member[],
  }>(undefined);

  useEffect(() => {
    async function apiRequest() {
      const team = await api.getTeam(props.id);
      const members = await api.getTeamMembers(props.id);
      const boards = await api.getTeamBoards(props.id);

      if (team && members && boards) {
        setLocalState({
          team,
          members,
          boards,
        });
        document.title = `${team.name} - ${process.env.APP_NAME}`;
      } else {
        setLocalState(null);
      }
    }

    apiRequest();
  }, []);

  if (localState === null) {
    return <div>Loading</div>;
  } else if (localState === undefined) {
    return <div>Not Found</div>;
  }

  return (
    <Grid rows={["53px", "auto"]}>
      <Layout className="border-bottom flex-row flex-align-center flex-justify-between overflow-x-auto"
        style={{padding: "10px 20px"}}>
        <Text className="nowrap" content={localState.team.name} weight="bold" size="1.2rem"
          style={{marginRight: "10px"}}/>
        <ButtonGroup className="self-flex-end" type="space-between">
          {(globalState.user && localState.members.some(m => m.userId == globalState.user.id)) &&
            <Button type="primary" text="Leave" onClick={() => {
              api.leaveTeam(localState.team.id, globalState.user.username)
                .then(() => {
                  setLocalState({
                    ...localState,
                    members: localState.members.filter(member => member.userId != globalState.user.id)
                  });
                });
            }}/>
          }
          <Button type="primary" text="Delete" onClick={() => {
            api.deleteTeam(localState.team.id)
              .then(() => {
                if (history.length > 1) {
                  history.goBack();
                } else {
                  history.push("/");
                }
              });
          }}/>
        </ButtonGroup>
      </Layout>
      <main className="overflow-y-auto p20 color-secondary">
        <Tabs defaultIndex={0}>
          {[
            {
              name: "Boards",
              component: (
                <Table sources={localState.boards.map(board => {
                  return {
                    key: board.id,
                    unselectable: false,
                    fields: {
                      name: <Link to={`/board/${board.id}`}>{board.name}</Link>,
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
              name: "Members",
              component: (
                <Table sources={localState.members.map(member => {
                  return {
                    key: member.id,
                    unselectable: false,
                    fields: {
                      avatar: (
                        <Avatar src={member.user.imageUrl} style={{
                          width: "25px",
                          height: "25px"
                        }}/>
                      ),
                      name: member.user.name,
                    }
                  };
                })}
                columns={[
                  {
                    title: "",
                    field: "avatar"
                  },
                  {
                    title: "Name",
                    field: "name"
                  },
                ]}/>
              )
            },
          ]}
        </Tabs>
        {globalState.user &&
          <form enctype="multipart/form-data" onSubmit={e => {
            e.preventDefault();
            const data = new FormData(e.currentTarget)
            api.joinTeam(localState.team.id, data.get("username"))
              .then(member => {
                setLocalState({
                  ...localState,
                  members: localState.members.concat([member])
                });
              });
          }}>
            <input name="username" aria-label="username" type="text"/>
            <input type="submit" value="Invite"/>
          </form>
        }
      </main>
    </Grid>
  );
}

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";

import {
  FragioAPI,
  ApplicationState,
  Team,
  Member,
} from "../../common";

import {
  Button,
  ButtonGroup,
  Layout,
  Grid,
  Text,
} from "../../lazuli";

export default function TeamPage(props: { id: string }) {
  const api = new FragioAPI(process.env.API_URL, window.localStorage.getItem("token"));
  const history = useHistory();
  const globalState = useSelector<ApplicationState>(state => state);
  const [localState, setLocalState] = useState<{
    team: Team,
    member: Members[],
  }>(undefined);

  useEffect(() => {
    async function apiRequest() {
      const team = await api.getTeam(props.id);
      const members = await api.getTeamMembers(props.id);

      if (team && members) {
        setLocalState({
          team,
          members,
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
      <div>
        {localState.members.map(member => <div>{member.user.name}</div>)}
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
      </div>
    </Grid>
  );
}

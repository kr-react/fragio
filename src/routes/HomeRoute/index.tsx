import * as React from "react";
import { useSelector } from "react-redux";
import { Switch, Route } from "react-router-dom";
import { Redirect } from "react-router-dom";

import HomePage from "./HomePage.tsx";
import TeamPage from "./TeamPage.tsx";
import BoardPage from "./BoardPage.tsx";

import {
  ApplicationState,
  User,
} from "../../common";

import {
  Avatar,
  Header,
  HeaderItem,
  Grid,
  Text,
} from "../../lazuli";

export default function HomeRoute({ match }: any) {
  const globalState = useSelector<ApplicationState, ApplicationState>(state => state);

  if (!globalState.user) {
    return <Redirect to={`/login?location=${match.url}`}/>;
  }

  const HeaderUserController = React.memo((props: { user: User }) => {
    return (
      <div className="user-ctl-com">
        <span>{props.user.name}</span>
        <Avatar src={props.user.imageUrl} style={{
          width: "25px",
          height: "25px"
        }}/>
      </div>
    );
  });

  return (
    <Grid rows={["50px", "auto"]} colums={["100%"]}>
      <Header>
        <HeaderItem>
          {globalState.viewMode == "Mobile" &&
            <Text content="F" weight="bold" size="1.5rem"/>
          }
          {globalState.viewMode != "Mobile" &&
            <Text content="Fragio" weight="bold" size="1.3rem"/>
          }
        </HeaderItem>
        <HeaderItem>
          <HeaderUserController user={globalState.user}/>
        </HeaderItem>
      </Header>
      <Switch>
        <Route exact path="/" render={() => <HomePage/>}/>
        <Route exact path="/board/:id" render={props => <BoardPage id={props.match.params.id}/>}/>
        <Route exact path="/team/:id" render={props => <TeamPage id={props.match.params.id}/>}/>
      </Switch>
    </Grid>
  );
}

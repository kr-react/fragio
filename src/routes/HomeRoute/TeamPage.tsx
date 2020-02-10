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

export default function TeamPage({ match }) {
  const { user, token } = useSelector<ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL, token);
  const history = useHistory();
  const [localState, setLocalState] = useState<{
    team: Team,
    boards: Board[],
    members: Member[],
  }>(undefined);

  useEffect(() => {
    async function request() {
      const team = await api.getTeam(match.params.id);
      const members = await api.getTeamMembers(match.params.id);
      const boards = await api.getTeamBoards(match.params.id);

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

  if (localState === null) {
    return <div>Not Found</div>;
  } else if (localState === undefined) {
    return <div>Loading</div>;
  }

  return <div>{localState.team.name}</div>;
}

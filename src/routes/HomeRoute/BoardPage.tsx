import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";

import {
  ApplicationState,
  User,
  Team,
  Board,
  List,
  Card,
  Label,
  FragioAPI,
} from "../../common";

export default function BoardPage({ match }) {
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL, token);
  const history = useHistory();
  const [localState, setLocalState] = useState<{
    board: Board,
    lists: List[],
    cards: Card[],
    teams: Team[],
    isPaneOpen: boolean,
    selectedCard: number,
  }>(undefined);

  useEffect(() => {
    async function request() {
      const board = await api.getBoard(match.params.id);
      const lists = await api.getLists(match.params.id);
      const cards = await api.getCards(match.params.id);
      const teams = await api.getTeamsFromUser(user.username);

      if (board && lists && cards) {
        setLocalState({
          board,
          lists,
          cards,
          teams,
          isPaneOpen: false,
          selectedCard: undefined,
        });

        document.title = `${board.name} - ${process.env.APP_NAME}`
      } else {
        setLocalState(null);
      }
    }

    request();
  }, []);

  function canEdit() {
    const { board, teams } = localState;
    const { user } = globalState;

    return (board.team && teams.some(team => team.id == board.team.id))
      || user.id == board.ownerId;
  }

  function isOwner() {
    return globalState.user && localState.board.ownerId == globalState.user.id;
  }

  function getLabels(ids: string[]) {
    const a = [...localState.board.labels]
      .filter(label => ids.includes(label.id))
      .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

    return a;
  }

  function getAvailableLabels(ids: string[]) {
    return localState.board.labels
      .filter(label => !ids.includes(label.id));
  }

  if (localState === null) {
    return <div>Not Found</div>;
  } else if (localState === undefined) {
    return <div>Loading</div>;
  }

  return <div>{localState.board.name}</div>;
}

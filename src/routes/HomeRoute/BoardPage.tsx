import * as React from "react";
import { useSelector } from "react-redux";
import { ActivityComponent } from "~/src/components";
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

interface ListComponentProps {
  card: Card;
}

interface ListComponentProps {
  list: List;
  cards: Card[];
}

interface BoardComponentProps {
  className?: string;
  as?: JSX.Element | string;
  board: Board;
  lists: List[];
  cards: Card[];
}

function BoardComponent(props: BoardComponentProps) {
  const { board, lists, cards } = props;

  function getUrlsFromString(str: string) {
      const pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
      return pattern.exec(str);
  }

  function getLabelById(id: string) {
    return board.labels.find(label => label.id == id);
  }

  function CardComponent(props: CardComponentProps) {
    const { card } = props;
    const images = getUrlsFromString(card.description);

    return (
      <div className="card shadow-sm mb-2 pointer">
        {(images && images[0].match(/\.(png|jpg)$/)) &&
          <img
            className="card-img-top"
            src={images[0]}
            alt="Card image"/>
        }
        <div className="card-body p-2">
          <div className="d-flex flex-row flex-wrap mb-2">
            {card.labelIds.map(id => getLabelById(id)).filter(label => label).map(label =>
              <span
                className="badge badge-secondary mr-1 mt-1"
                style={{
                  backgroundColor: `#${label.color.toString(16)}`
                }}>
                {label.name}
              </span>
            )}
          </div>
          <span>{card.name}</span>
        </div>
      </div>
    );
  }

  function ListComponent(props: ListComponentProps) {
    const { list, cards } = props;

    return (
      <div className="card shadow-sm mr-3 mh-100" style={{
        width: "300px",
        minWidth: "300px",
      }}>
        <div className="card-header d-flex flex-row justify-content-between align-items-center">
          <b>{list.name}</b>
          <span className="badge badge-secondary">
            {cards.length}
          </span>
        </div>
        <div className="card-body overflow-auto pt-2 pl-2 pr-2 pb-0 bg-light">
          {cards.map(card =>
            <CardComponent card={card}/>
          )}
        </div>
      </div>
    );
  }

  const elem = (
    <div className="overflow-auto p-3 d-flex flex-row align-items-start">
      {lists.map(list =>
        <ListComponent
          className="mr-3 mh-100"
          list={list}
          cards={cards.filter(card => card.listId == list.id)}/>
      )}
    </div>
  );

  if (props.as) {
    elem.type = props.as;
    elem.props = {
      ...props.as.props,
      ...elem.props
    };
  }

  if (props.className) {
    elem.props.className += " " + props.className;
  }

  return elem;
}

export default function BoardPage({ match }) {
  const { t } = useTranslation();
  const { user, token } = useSelector<ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL, token);
  const [localState, setLocalState] = React.useState<{
    board: Board,
    lists: List[],
    cards: Card[],
    teams: Team[],
    selectedTab: number,
  }>(undefined);

  React.useEffect(() => {
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
          selectedTab: 0,
        });

        document.title = `${board.name} - ${process.env.APP_NAME}`
      } else {
        setLocalState(null);
      }
    }

    request();
  }, []);

  function canEdit(user) {
    const { board, teams } = localState;

    return (board.team && teams.some(team => team.id == board.team.id))
      || user.id == board.ownerId;
  }

  function isOwner(u: User) {
    return u && u.id == localState.board.owner.id;
  }

  function setTab(index: number) {
    setLocalState({
      ...localState,
      selectedTab: index
    });
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
            <b>{localState.board.name}</b>
          </h6>
          <ul className="nav nav-tabs border-bottom-0 text-nowrap">
            <li
              className="nav-item pointer"
              onClick={() => setTab(0)}>
              <span className={`nav-link${localState.selectedTab === 0 ? " active" : ""}`}>
                <span>{t("board")}</span>
              </span>
            </li>
            <li
              className="nav-item pointer"
              onClick={() => setTab(1)}>
              <span className={`nav-link${localState.selectedTab === 1 ? " active" : ""}`}>
                {t("activity_plural")}
              </span>
            </li>
            {isOwner(user) &&
              <li
                className="nav-item pointer"
                onClick={() => setTab(2)}>
                <span className={`nav-link${localState.selectedTab === 2 ? " active" : ""}`}>
                  <span>{t("settings")}</span>
                </span>
              </li>
            }
          </ul>
        </div>
      </div>
      {localState.selectedTab == 0 &&
        <BoardComponent
          as={"main"}
          className="flex-fill"
          board={localState.board}
          lists={localState.lists}
          cards={localState.cards}/>
      }
    </React.Fragment>
  );
}

import * as React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { useDrag, useDrop, DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import {
  useSearch,
  ActivityComponent,
  Footer,
} from "~/src/components";
import {
  FragioAPI,
  ApplicationState,
  Board,
  List,
  Card,
  Activity,
} from "~/src/common";

interface ListComponentProps {
  card: Card;
}

interface ListComponentProps {
  list: List;
  cards: Card[];
  cardChanged?: (card: Card, changes: any) => void;
}

interface BoardComponentProps {
  className?: string;
  as?: JSX.Element | string;
  board: Board;
  lists: List[];
  cards: Card[];
  listChanged?: (list: List, changes: any) => void;
  cardChanged?: (card: Card, changes: any) => void;
}

const BoardContext = React.createContext(null);
const ListContext = React.createContext(null);

function useBoard() {
  return React.useContext(BoardContext);
}

function useList() {
  return React.useContext(ListContext);
}

function getPositionFromPoint(x: number, y: number, elems: HTMLElement[]) {
  let pos = 0;
  let dist = Number.MAX_VALUE;

  for (let i = 0; i < elems.length; i++) {
    const child = elems[i];
    const bounding = child.getBoundingClientRect();
    const x1 = bounding.x;
    const y1 = bounding.y;
    const res = Math.floor(Math.sqrt(x - x1) + Math.sqrt(y - y1));
    if (res < dist) {
      pos = i;
      dist = res;
    }
  }

  return pos;
}

const CardComponent = React.memo((props: CardComponentProps) => {
  const { card } = props;
  const board = useBoard();
  const [{ display }, dragRef] = useDrag({
    item: { type: "card", card },
    collect: monitor => ({
      display: monitor.isDragging() ? "none" : undefined,
    }),
  });

  function getUrlsFromString(str: string) {
      const pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
      return pattern.exec(str) || [];
  }

  function getImagesFromString(str: string) {
      const pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)\.(jpg|png)/;
      return pattern.exec(str) || [];
  }

  function getLabels() {
    return board.labels
      .filter(label => card.labelIds.includes(label.id));
  }

  return (
    <div
      ref={dragRef}
      className="card shadow-sm mb-2 pointer"
      style={{display}}>
      {getImagesFromString(card.description).length > 0 &&
        <img
          className="card-img-top"
          src={getImagesFromString(card.description)[0]}
          alt="Card image"/>
      }
      <div className="card-body p-2">
        <div className="d-flex flex-row flex-wrap mb-2">
          {getLabels().map(label =>
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
});

const ListComponent = React.memo((props: ListComponentProps) => {
  const { list, cards } = props;
  const { t } = useTranslation();
  const [{ display }, dragRef] = useDrag({
    item: { type: "list", list },
    collect: monitor => ({
      display: monitor.isDragging() ? "none" : undefined,
    }),
  });
  const [dropProps, dropRef] = useDrop({
    accept: ["card"],
    options: {
      arePropsEqual: (a, b) => a.card.id == b.card.id,
    },
    hover: (item, monitor) => {
      const { x, y } = monitor.getClientOffset();
      const elem = document.querySelector(`#list-${list.id} > .card-body`);
      const i = getPositionFromPoint(x, y, elem.children);
    },
    drop: (item, monitor) => {
      const { x, y } = monitor.getClientOffset();
      const elem = document.querySelector(`#list-${list.id} > .card-body`);

      if (props.cardChanged) {
        props.cardChanged({...item.card}, {
          position: getPositionFromPoint(x, y, elem.children),
          listId: list.id
        });
      }
    }
  });

  return (
    <div
      ref={dragRef}
      id={`list-${list.id}`}
      className="card shadow-sm mr-3 mh-100"
      style={{
      width: "300px",
      minWidth: "300px",
      display,
    }}>
      <div className="card-header d-flex flex-row justify-content-between align-items-center">
        <b>{list.name}</b>
        <span className="badge badge-secondary">
          {cards.length}
        </span>
      </div>
      <div
        ref={dropRef}
        className="card-body overflow-auto pt-2 pl-2 pr-2 pb-0 bg-light">
        <ListContext.Provider value={list}>
          {cards.sort((a, b) => a.position - b.position).map(card =>
            <CardComponent card={card}/>
          )}
          {cards.length == 0 &&
            <div className="text-muted mb-2 text-center">
              {t("desc.emptyCard")}
            </div>
          }
        </ListContext.Provider>
      </div>
    </div>
  );
});

function BoardComponent(props: BoardComponentProps) {
  const { board, lists, cards } = props;
  const [dropProps, dropRef] = useDrop({
    accept: ["list"],
    options: {
      arePropsEqual: (a, b) => a.list.id == b.list.id,
    },
    drop: (item, monitor) => {
      const { x, y } = monitor.getClientOffset();
      const elem = document.querySelector(`#board-${board.id}`);

      if (props.listChanged) {
        props.listChanged({...item.list}, {
          position: getPositionFromPoint(x, y, elem.children)
        });
      }
    }
  });

  const elem = (
    <div
      ref={dropRef}
      id={`board-${board.id}`}
      className="overflow-auto p-3 d-flex flex-row align-items-start">
      <BoardContext.Provider value={board}>
        {lists.sort((a, b) => a.position - b.position).map(list =>
          <ListComponent
            className="mr-3 mh-100"
            list={list}
            cards={cards.filter(card => card.listId == list.id)}
            cardChanged={props.cardChanged}/>
        )}
      </BoardContext.Provider>
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
    activities: Activity[],
    selectedTab: number,
  }>(undefined);

  React.useEffect(() => {
    async function request() {
      const board = await api.getBoard(match.params.id);
      const lists = await api.getLists(match.params.id);
      const cards = await api.getCards(match.params.id);
      const teams = await api.getTeamsFromUser(user.username);
      const activities = await api.getBoardActivities(match.params.id);

      if (board && lists && cards && teams && activities) {
        setLocalState({
          board,
          lists,
          cards,
          teams,
          activities,
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

  function BoardTab() {
    return (
      <DndProvider backend={Backend}>
        <BoardComponent
          as={"main"}
          className="flex-fill"
          board={localState.board}
          lists={localState.lists}
          cards={localState.cards}
          listChanged={(list, changes) => {
            const newLists = [...localState.lists];
            const index = newLists.findIndex(l => l.id == list.id);

            if (changes.position != null) {
              for (const l of newLists) {
                if (l.position > list.position) {
                  l.position--;
                }

                if (l.position >= changes.position) {
                  l.position++;
                }
              }

              newLists[index].position = changes.position;
            }

            setLocalState({
              ...localState,
              lists: newLists
            });

            api.updateList(list.boardId, list.id, {
              position: changes.position
            }).catch(() => {
              newLists[index].position = list.position;
              setLocalState({
                ...localState,
                lists: newLists
              });
            });
          }}
          cardChanged={(card, changes) => {
            const newCards = [...localState.cards];
            const index = newCards.findIndex(c => c.id == card.id);

            if (changes.position != null) {
              for (const c of newCards) {
                if (c.position > card.position && c.listId == card.listId) {
                  c.position--;
                }

                if (c.position >= changes.position && c.listId == changes.listId) {
                  c.position++;
                }
              }

              newCards[index].position = changes.position;
              newCards[index].listId = changes.listId;
              newCards[index].list = localState.lists.find(list => list.id == changes.listId);
            }

            setLocalState({
              ...localState,
              cards: newCards
            });

            api.updateCard(card.list.boardId, card.listId, card.id, {
              position: changes.position,
              listId: changes.listId,
            }).catch(() => {
              newCards[index].position = card.position;
              newCards[index].listId = card.listId;
              newCards[index].list = card.list;
              setLocalState({
                ...localState,
                cards: newCards
              });
            });
          }}/>
      </DndProvider>
    );
  }

  function ActivitiesTab() {
    const [search, activities] = useSearch(localState.activities, a => a.user.name.toLowerCase());

    return (
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
              onChange={e => search(e.currentTarget.value.toLowerCase())}/>
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
    );
  }

  function LabelsTab() {
    const [search, labels] = useSearch(localState.board.labels, a => a.name.toLowerCase());

    return (
      <div className="card">
        <div className="card-header d-flex flex-row justify-content-between align-items-center sticky-top bg-light">
          <b className="text-nowrap">{t("labelCount", {count: labels.length})}</b>
          <div className="input-group input-group-sm ml-4">
            <div className="input-group-prepend">
              <span className="input-group-text">{t("action.search")}</span>
            </div>
            <input
              className="form-control"
              type="text"
              placeholder={t("action.searchLabels")}
              aria-label="Search"
              onChange={e => search(e.currentTarget.value.toLowerCase())}/>
          </div>
        </div>
        <ul className="list-group list-group-flush">
          {labels.map(label =>
            <div className="list-group-item d-flex align-items-center">
              <div
                className="rounded-circle mr-3"
                style={{
                  width: "25px",
                  height: "25px",
                  backgroundColor: `#${label.color.toString(16)}`,
                }}></div>
              <span className="mr-auto">
                {label.name}
              </span>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={e => {
                  api.deleteLabel(localState.board.id, label.id)
                    .then(() => {
                      setLocalState({
                        ...localState,
                        board: {
                          ...localState.board,
                          labels: labels.filter(l => l.id != label.id)
                        },
                      });
                    });
                }}>
                {t("action.remove")}
              </button>
            </div>
          )}
        </ul>
      </div>
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
                <span>{t("activity_plural")}</span>
              </span>
            </li>
            <li
              className="nav-item pointer"
              onClick={() => setTab(2)}>
              <span className={`nav-link${localState.selectedTab === 2 ? " active" : ""}`}>
                <span>{t("label_plural")}</span>
                <span className="ml-2 badge badge-secondary">
                  {localState.board.labels.length}
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
      {localState.selectedTab == 0 && <BoardTab/>}
      {localState.selectedTab == 1 &&
        <main className="container pt-4">
          <ActivitiesTab/>
        </main>
      }
      {localState.selectedTab == 2 &&
        <main className="container pt-4">
          <LabelsTab/>
        </main>
      }
      {localState.selectedTab > 0 && <Footer className="container"/>}
    </React.Fragment>
  );
}

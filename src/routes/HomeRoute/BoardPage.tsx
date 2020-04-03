import * as React from "react";
import { useHistory, RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { useDrag, useDrop, DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import {
  useModal,
  useSearch,
  ActivityComponent,
  Icon,
  Footer,
  Loading,
} from "../../components";
import {
  FragioAPI,
  ApplicationState,
  Board,
  List,
  Card,
  Activity,
  Label,
  Team,
  User,
} from "../../common";

interface BoardComponentProps {
  className?: string;
  as?: JSX.Element | string;
  board: Board;
  lists: List[];
  cards: Card[];
  editable: boolean;
  onCardClick: (card: Card) => void;
  onCardUpdate: (card: Card, props: any) => void;
  onCardCreate: (boardId: string, listId: string) => void;
  onCardDelete: (card: Card) => void;
  onListUpdate: (list: List, props: any) => void;
  onListCreate: (boardId: string) => void;
  onListDelete: (list: List) => void;
}

function getClosestElementIndex(x1: number, y1: number, elems: ArrayLike<Element>) : number {
  let [index, dist] = [0, Number.MAX_VALUE];

  for (let i = 0; i < elems.length; i++) {
    const { x:x2, y:y2 } = elems[i].getBoundingClientRect();
    const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    if (d < dist) {
      index = i;
      dist = d;
    }
  }

  return index;
}

function getLabels(labels: Label[], card: Card) {
    return labels.filter(label => card.labelIds.includes(label.id));
}

function getUnusedLabels(labels: Label[], card: Card) {
    return labels.filter(label => !card.labelIds.includes(label.id));
}

function getImagesFromString(str: string) {
    const pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)\.(jpg|png)/;
    return pattern.exec(str) || [];
}

function BoardComponent(boardProps: BoardComponentProps) {
  const { board, lists, cards } = boardProps;
  const { t } = useTranslation();
  const [_, boardDropRef] = useDrop<{type: string, list: List}, any, any>({
    accept: ["list"],
    options: {
      arePropsEqual: (a: { list: List}, b: {list: List}) => a.list.id == b.list.id,
    },
    drop: (item, monitor) => {
      if (!boardProps.editable)
        return;

      const { x, y } = monitor.getClientOffset() ?? { x: 0, y: 0 };
      const elem = document.querySelector(`#board-${board.id}`);
      const children = elem?.querySelectorAll(":scope > div[draggable='true']");

      if (!children) return;

      boardProps.onListUpdate({...item.list}, {
        position: getClosestElementIndex(x, y, children)
      });
    }
  });

  function getCards(listId: string) {
    return cards.filter(card => card.listId == listId)
      .sort((a, b) => a.position - b.position);
  }

  function CardComponent(props: {card: Card}) {
    const { card } = props;
    const [{ opacity }, cardDragRef] = useDrag({
      item: { type: "card", card },
      collect: monitor => ({
        opacity: monitor.isDragging() ? 0.5 : 1.0,
      }),
    });

    const labels = getLabels(board.labels, card);
    const imageUrls = getImagesFromString(card.description);

    return (
      <div
        ref={cardDragRef}
        className="card shadow-sm mb-2 pointer"
        onClick={() => boardProps.onCardClick(card)}
        style={{opacity}}>
        {imageUrls.length > 0 &&
          <img
            className="card-img-top"
            src={imageUrls[0]}
            alt="Card image"/>
        }
        <div className="card-body p-2">
          {labels.length > 0 &&
            <div className="d-flex flex-row flex-wrap mb-2">
              {labels.map(label =>
                <span
                  className="badge badge-secondary mr-1 mt-1"
                  style={{
                    backgroundColor: `#${label.color.toString(16)}`
                  }}>
                  {label.name}
                </span>
              )}
            </div>
          }
          <span>{card.name}</span>
        </div>
      </div>
    );
  }

  function ListComponent(props: {list: List}) {
    const { list } = props;
    const [{ opacity }, listDragRef] = useDrag({
      item: { type: "list", list },
      collect: monitor => ({
        opacity: monitor.isDragging() ? 0.5 : 1.0,
      }),
    });
    const [_, listDropRef] = useDrop<{type: "string", card: Card}, any, any>({
      accept: ["card"],
      options: {
        arePropsEqual: (a: {card: Card}, b: {card: Card}) => a.card.id == b.card.id,
      },
      drop: (item, monitor) => {
        if (!boardProps.editable)
          return;

        const { x, y } = monitor.getClientOffset() ?? {x: 0, y: 0};
        const elem = document.querySelector(`#list-${list.id} > .card-body`);
        const children = elem?.querySelectorAll(":scope > div[draggable='true']");

        if (!children) return;

        boardProps.onCardUpdate({...item.card}, {
          position: getClosestElementIndex(x, y, children),
          listId: list.id,
        });
      }
    });

    const cards = getCards(list.id);

    return (
      <div
        ref={listDragRef}
        id={`list-${list.id}`}
        className="card shadow-sm mr-3 mh-100"
        style={{
        width: "300px",
        minWidth: "300px",
        opacity,
      }}>
        <div className="card-header d-flex flex-row justify-content-between align-items-center px-2">
          <b
            contentEditable={boardProps.editable}
            onBlur={e => {
              const name = e.currentTarget.innerText;

              if (name == list.name)
                return;

              boardProps.onListUpdate({...list}, {
                name,
              });
            }}>
            {list.name}
          </b>
          <span className="badge badge-secondary ml-auto">
            {cards.length}
          </span>
          {boardProps.editable &&
            <div className="dropdown ml-2">
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                id="list-menu-button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">
                <Icon
                  name="menu"
                  width="16"
                  height="16"/>
              </button>
              <div
                className="dropdown-menu shadow-sm"
                aria-labelledby="list-menu-button">
                <span
                  className="dropdown-item pointer"
                  onClick={() => {
                    boardProps.onListUpdate({...list}, {
                      position: Math.max(list.position - 1, 0)
                    });
                  }}>
                  {t("action.moveLeft")}
                </span>
                <span
                  className="dropdown-item pointer"
                  onClick={() => {
                    boardProps.onListUpdate({...list}, {
                      position: Math.min(list.position + 1, lists.length - 1)
                    });
                  }}>
                  {t("action.moveRight")}
                </span>
                <div className="dropdown-divider"></div>
                <span
                  className="dropdown-item pointer"
                  onClick={() => boardProps.onListDelete(list)}>
                  {t("action.delete")}
                </span>
              </div>
            </div>
          }
        </div>
        <div
          ref={listDropRef}
          className="card-body overflow-auto pt-2 pl-2 pr-2 pb-0 bg-light">
          {boardProps.editable &&
            <button
              type="button"
              className="btn btn-secondary btn-sm shadow-sm w-100 mb-2"
              onClick={() => boardProps.onCardCreate(board.id, list.id)}>
              {t("action.create")}
            </button>
          }
          {cards.map(card =>
            <CardComponent card={card}/>
          )}
          {cards.length == 0 &&
            <div className="text-muted mb-2 text-center">
              {t("desc.emptyList")}
            </div>
          }
        </div>
      </div>
    );
  }

  const elem = (
    <div
      ref={boardDropRef}
      id={`board-${board.id}`}
      className="overflow-auto p-3 d-flex flex-row align-items-start">
      {boardProps.editable &&
        <div
          className="shadow-sm card mh-100 bg-light p-2 mr-3 text-center pointer"
          onClick={() => boardProps.onListCreate(board.id)}
          style={{
            width: "300px",
            minWidth: "300px",
            borderStyle: "dashed",
          }}>
          <h6 className="text-muted my-auto">
            {t("action.create")}
          </h6>
        </div>
      }
      {lists.sort((a, b) => a.position - b.position).map(list =>
        <ListComponent list={list}/>
      )}
      <div className="p-1"/>
    </div>
  );

  if (boardProps.as) {
    elem.type = boardProps.as;
  }

  if (boardProps.className) {
    elem.props.className += " " + boardProps.className;
  }

  return elem;
}

export default function BoardPage({ match }: RouteComponentProps<{id: string}>) {
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const { t } = useTranslation();
  const history = useHistory();
  const modal = useModal();
  const api = new FragioAPI(process.env.API_URL as string, token as string);
  const [localState, setLocalState] = React.useState<{
    board: Board,
    lists: List[],
    cards: Card[],
    teams: Team[],
    activities: Activity[],
    selectedTab: number,
    selectedCardIndex: number,
    status: "DONE" | "LOADING" | "ERROR"
  }>({
    board: {} as Board,
    lists: [],
    cards: [],
    teams: [],
    activities: [],
    selectedTab: 0,
    selectedCardIndex: -1,
    status: "LOADING"
  });

  React.useEffect(() => {
    async function request() {
      try {
        const board = await api.getBoard(match.params.id);
        const lists = await api.getLists(match.params.id);
        const cards = await api.getCards(match.params.id);
        const teams = user ? await api.getTeamsFromUser(user.username) : [];
        const activities = await api.getBoardActivities(match.params.id);

        setLocalState({
          board,
          lists,
          cards,
          teams,
          activities,
          selectedTab: 0,
          selectedCardIndex: -1,
          status: "DONE",
        });
      } catch (err) {
        setLocalState({
          ...localState,
          status: "ERROR",
        });
      }
    }

    request();
  }, [match, user]);

  React.useEffect(() => {
    if (!localState) return;

    const index = localState.selectedCardIndex;

    if (index >= 0) {
      modal(() =>
        <CardModal
          card={localState.cards[index]}
          editable={canEdit(user)}/>
      );
    } else {
      modal();
    }
  }, [localState]);

  React.useEffect(() => {
    return () => modal();
  }, []);

  function CardModal(props: { card: Card, editable: boolean}) {
    const {card, editable} = props;
    const labels = getLabels(localState.board.labels, card);
    const unusedLabels = getUnusedLabels(localState.board.labels, card);

    React.useEffect(() => {
      setTimeout(() => {
        const target = document.querySelector("#use-modal textarea") as HTMLElement;
        resizeToScroll(target);
      }, 200);
    }, []);

    function resizeToScroll(element: HTMLElement) {
        element.style.height = `${element.scrollHeight}px`;
    }

    return (
      <div className="modal-content">
        <div className="modal-header">
          <h6 className="modal-title">
            <b
              contentEditable={editable}
              onBlur={e => {
                onCardUpdateHandler({...card}, {
                  name: e.currentTarget.innerText,
                });
              }}>
              {card.name}
            </b>
          </h6>
          <button
            className="close"
            aria-label="Close"
            onClick={() => selectCard(undefined)}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="d-flex flex-row flex-wrap">
            {labels.map(label =>
              <button
                className="btn btn-primary btn-sm mr-2 mb-2 font-weight-bold"
                onClick={() => {
                  if (!editable) return;

                  onCardUpdateHandler({...card}, {
                    labelIds: card.labelIds.filter(id => id != label.id)
                  });
                }}
                style={{
                  backgroundColor: `#${label.color.toString(16)}`,
                  borderColor: `#${label.color.toString(16)}`,
                }}>
                <span>{label.name}</span>
              </button>
            )}
            {editable &&
              <div className="dropdown">
                <button
                  className="btn btn-secondary btn-sm dropdown-toggle mr-2 mb-2"
                  id="labels-dropdown"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false">
                  {t("action.new")}
                </button>
                <div
                  className="dropdown-menu shadow-sm"
                  aria-labelledby="labels-dropdown">
                  {unusedLabels.map(label =>
                    <span
                      className="dropdown-item pointer"
                      onClick={() => {
                        if (!editable) return;

                        onCardUpdateHandler({...card}, {
                          labelIds: card.labelIds.concat([label.id])
                        });
                      }}>
                      {label.name}
                    </span>
                  )}
                  {unusedLabels.length == 0 &&
                    <div className="text-center text-muted">
                      <small>
                        {t("desc.empty")}
                      </small>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
          <textarea
            className="text-wrap rounded mt-2 w-100 border-0"
            placeholder={t("desc.noDescription")}
            disabled={!editable}
            defaultValue={card.description}
            onChange={e => resizeToScroll(e.currentTarget)}
            onBlur={e => {
              onCardUpdateHandler({...card}, {
                description: e.currentTarget.value,
              });
            }}>
          </textarea>
        </div>
        {editable &&
          <div className="modal-footer">
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onCardDeleteHandler(card)}>
              {t("action.remove")}
            </button>
          </div>
        }
      </div>
    );
  }

  function canEdit(u?: User) : boolean {
    const { board, teams } = localState;

    if (u && u.id == board.ownerId)
      return true;

    if (!board.team)
      return false;

    return teams.some(team => team.id == board.team?.id);
  }

  function isOwner(u?: User) {
    return u && u.id == localState.board.owner.id;
  }

  function setTab(index: number) {
    setLocalState({
      ...localState,
      selectedTab: index,
      selectedCardIndex: -1,
    });
  }

  function selectCard(card?: Card) {
    const index = card ? localState.cards.findIndex(c => c.id === card.id) : -1;

    setLocalState({
      ...localState,
      selectedCardIndex: index,
    });
  }

  function onCardUpdateHandler(card: Card, changes: any) {
    let newCards = [...localState.cards];
    let index = newCards.findIndex(c => c.id == card.id);

    if ("position" in changes) {
      for (const c of newCards) {
        if (c.position > card.position && c.listId == card.listId) {
          c.position--;
        }

        if (c.position >= changes.position && c.listId == changes.listId) {
          c.position++;
        }
      }

      newCards[index].position = changes.position;
    }

    if ("name" in changes) {
      newCards[index].name = changes.name;
    }

    if ("description" in changes) {
      newCards[index].description = changes.description;
    }

    if ("listId" in changes) {
      newCards[index].listId = changes.listId;
    }

    if ("labelIds" in changes) {
      newCards[index].labelIds = changes.labelIds;
    }

    setLocalState({
      ...localState,
      cards: newCards
    });

    api.updateCard(card.list.boardId, card.listId, card.id, changes)
      .catch(() => {
        newCards = [...localState.cards];
        index = newCards.findIndex(c => c.id == card.id);
        newCards[index] = card;

        setLocalState({
          ...localState,
          cards: newCards
        });
      });
  }

  function onCardCreateHandler(boardId: string, listId: string) {
    api.createCard(boardId, listId, {
      name: t("tempName.card"),
      position: 0,
    }).then(card => {
      const cards = [...localState.cards];

      for (const c of cards) {
        c.position++;
      }

      setLocalState({
        ...localState,
        cards: cards.concat([card])
      });
    });
  }

  function onCardDeleteHandler(card: Card) {
    api.deleteCard(card.list.boardId, card.listId, card.id)
      .then(() => {
        const selectedCard = localState.cards[localState.selectedCardIndex];
        const cards = [...localState.cards];

        for (const c of cards) {
          c.position++;
        }

        setLocalState({
          ...localState,
          cards: localState.cards.filter(c => c.id != card.id),
          selectedCardIndex: card.id == selectedCard.id ? -1 : localState.selectedCardIndex,
        });
      });
  }

  function onListUpdateHandler(list: List, changes: any) {
    let newLists = [...localState.lists];
    let index = newLists.findIndex(l => l.id == list.id);

    if ("position" in changes) {
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

    if ("name" in changes) {
      newLists[index].name = changes.name;
    }

    setLocalState({
      ...localState,
      lists: newLists
    });

    api.updateList(list.boardId, list.id, changes)
      .catch(() => {
        newLists = [...localState.lists];
        index = newLists.findIndex(l => l.id == list.id);
        newLists[index] = list;

        setLocalState({
          ...localState,
          lists: newLists
        });
      });
  }

  function onListCreateHandler(boardId: string) {
    api.createList(boardId, {
      name: t("tempName.list"),
      position: 0,
    }).then(list => {
      const lists = [...localState.lists];

      for (const l of lists) {
        l.position++;
      }

      setLocalState({
        ...localState,
        lists: lists.concat([list])
      });
    });
  }

  function onListDeleteHandler(list: List) {
    api.deleteList(list.boardId, list.id)
      .then(() => {
        const lists = [...localState.lists];

        for (const l of lists) {
          if (l.position > list.position) {
            l.position--;
          }
        }

        setLocalState({
          ...localState,
          lists: lists.filter(l => l.id != list.id)
        });
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
          editable={canEdit(user)}
          onCardClick={card => selectCard(card)}
          onCardUpdate={onCardUpdateHandler}
          onCardCreate={onCardCreateHandler}
          onCardDelete={onCardDeleteHandler}
          onListUpdate={onListUpdateHandler}
          onListCreate={onListCreateHandler}
          onListDelete={onListDeleteHandler}/>
      </DndProvider>
    );
  }

  function ActivitiesTab() {
    const {search, result} = useSearch(localState.activities, a => [
      a.user.name,
      a.user.username,
      a.board.name
    ]);

    return (
      <div className="card">
        <div className="card-header d-flex flex-row justify-content-between align-items-center sticky-top bg-light">
          <b className="text-nowrap">{t("activityCount", {count: result.length})}</b>
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
          {result.map(activity =>
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
    const {search, result} = useSearch(localState.board.labels, l => [
      l.name,
    ]);

    function randomNumber(min:number, max: number) {
      return Math.floor(Math.random() * (max - min) + min);
    }

    function LabelModal() {
      const [color, setColor] = React.useState((randomNumber(0x100000, 0xFFFFFF)).toString(16));

      return (
        <form
          noValidate
          className="modal-content"
          onSubmit={e => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);

            api.createLabel(localState.board.id, {
              name: data.get("name"),
              color: Number("0x" + data.get("color")),
            }).then(label => {
              setLocalState({
                ...localState,
                board: {
                  ...localState.board,
                  labels: localState.board.labels.concat([label])
                }
              });
            });
          }}>
          <div className="modal-header">
            <h6 className="modal-title">
              {t("action.createLabel")}
            </h6>
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={() => modal()}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group input-group">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  htmlFor="name">
                  {t("name")}
                </label>
              </div>
              <input
                name="name"
                required
                className="form-control"
                autoFocus
                type="text"/>
            </div>
            <div className="form-group input-group">
              <div className="input-group-prepend">
                <label
                  className="input-group-text"
                  htmlFor="color">
                  <div
                    className="rounded-circle"
                    style={{
                      backgroundColor: "#" + color,
                      width: "20px",
                      height: "20px"
                    }}></div>
                </label>
                <label
                  className="input-group-text"
                  htmlFor="color">
                  {"#"}
                </label>
              </div>
              <input
                name="color"
                className="form-control text-uppercase"
                pattern="[A-f0-9]{0,8}"
                value={color}
                onChange={e => setColor(e.currentTarget.value)}
                type="text"/>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="submit"
              className="btn btn-primary btn-sm">
              {t("action.create")}
            </button>
          </div>
        </form>
      );
    }

    return (
      <div className="card">
        <div className="card-header d-flex flex-row justify-content-between align-items-center sticky-top bg-light">
          <b className="text-nowrap">{t("labelCount", {count: result.length})}</b>
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
          {canEdit(user) &&
            <button
              className="btn btn-outline-primary btn-sm ml-2"
              onClick={() => modal(() => <LabelModal/>)}>
              {t("action.new")}
            </button>
          }
        </div>
        <ul className="list-group list-group-flush">
          {result.map(label =>
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
              {canEdit(user) &&
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={e => {
                    api.deleteLabel(localState.board.id, label.id)
                      .then(() => {
                        setLocalState({
                          ...localState,
                          board: {
                            ...localState.board,
                            labels: result.filter(l => l.id != label.id)
                          },
                        });
                      });
                  }}>
                  {t("action.remove")}
                </button>
              }
            </div>
          )}
        </ul>
      </div>
    );
  }

  function SettingsTab() {
    function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = new FormData(e.currentTarget);

      api.updateBoard(localState.board.id, {
        name: data.get("name"),
        isPrivate: data.get("isPrivate") == "1"
      }).then(board => {
        setLocalState({
          ...localState,
          board
        });
      });
    }

    function deleteBoard() {
      return api.deleteBoard(localState.board.id).then(() => {
        history.push("/");
      });
    }

    return (
      <React.Fragment>
        <h5>{t("settings")}</h5>
        <hr/>
        <form onSubmit={onSubmitHandler}>
          <div className="form-group">
            <label
              htmlFor="rename-input">
              {t("name")}
            </label>
            <input
              id="rename-input"
              type="text"
              name="name"
              className="form-control form-control-sm"
              defaultValue={localState.board.name}/>
          </div>
          <div className="form-group">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="isPrivate"
                id="public-radio"
                value={0}
                defaultChecked={!localState.board.isPrivate}/>
              <label
                className="form-check-label"
                htmlFor="public-radio">
                {t("public")}
              </label>
              <small
                id="public-radio-help"
                className="form-text text-muted mt-0">
                {t("desc.publicBoard")}
              </small>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="isPrivate"
                id="private-radio"
                value={1}
                defaultChecked={localState.board.isPrivate}
                aria-describedby="private-radio-help"/>
              <label
                className="form-check-label"
                htmlFor="private-radio">
                {t("private")}
              </label>
              <small
                id="private-radio-help"
                className="form-text text-muted mt-0">
                {t("desc.privateBoard")}
              </small>
            </div>
          </div>
          <div className="d-flex flex-row justify-content-between">
            <button
              type="submit"
              className="btn btn-primary btn-sm">
              {t("action.save")}
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => deleteBoard()}>
              {t("action.delete")}
            </button>
          </div>
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
    return (
      <span>Error</span>
    );
  }

  return (
    <React.Fragment>
      <div className="bg-light border-bottom">
        <div className="container">
          <div>
            <h6 className="m-0 py-3">
              <b>{localState.board.name}</b>
              {localState.board.team &&
                <span className="badge badge-secondary ml-2">
                  {localState.board.team.name}
                </span>
              }
            </h6>
          </div>
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
      {localState.selectedTab == 3 &&
        <main className="container pt-4">
          <SettingsTab/>
        </main>
      }
      {localState.selectedTab > 0 && <Footer className="container"/>}
    </React.Fragment>
  );
}

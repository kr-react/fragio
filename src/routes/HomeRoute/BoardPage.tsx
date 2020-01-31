import * as React from "react";
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

import {
  Button,
  ButtonGroup,
  Layout,
  Grid,
  Text,
  Table,
  SplitView,
  Dropdown,
  List as LZList,
} from "../../lazuli";

export default function BoardPage(props: { id: string }) {
  const api = new FragioAPI(process.env.API_URL, window.localStorage.getItem("token"));
  const history = useHistory();
  const globalState = useSelector<ApplicationState, ApplicationState>(state => state);
  const [localState, setLocalState] = React.useState<{
    board: Board,
    lists: List[],
    cards: Card[],
    teams: Team[],
    isPaneOpen: boolean,
    selectedCard: number,
  }>(undefined);

  React.useEffect(() => {
    async function apiRequest() {
      const board = await api.getBoard(props.id);
      const lists = await api.getLists(props.id);
      const cards = await api.getCards(props.id);
      const teams = await api.getTeamsFromUser(globalState.user.username);

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

    apiRequest();
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

  function randomNumber(min?: number, max?: number) {
    min = Math.ceil(min || Number.MIN_VALUE);
    max = Math.floor(max || Number.MAX_VALUE);
    return Math.floor(Math.random() * (max - min)) + min;
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

  const TaskListComponent = React.memo((props: {list: List}) => {
    const { list } = props;

    return (
      <div className="list-com flex-column">
        <div className="list-com-header border-bottom flex-row flex-align-center flex-justify-between">
          <Text className="nowrap" content={list.name} weight="bold" size="1rem"
            editable={localState.board.ownerId == globalState.user.id}
            onEditComplete={elem => {
              api.updateList(list.boardId, list.id, {
                name: elem.innerText,
                position: list.position
              }).then(list => {
                const listsCopy = [...localState.lists];
                const index = listsCopy.findIndex(item => item.id == list.id);
                listsCopy[index] = list;
                setLocalState({
                  ...localState,
                  lists: listsCopy
                });
              });

              return false;
            }}/>
          <ButtonGroup type="space-between">
            <Button text="C" onClick={() => {
              api.createCard(list.boardId, list.id, {
                name: "New Card",
                position: 0
              }).then(card => {
                const cardsCopy = [...localState.cards];
                for (const card of cardsCopy) card.position++;
                cardsCopy.push(card);
                setLocalState({
                  ...localState,
                  cards: cardsCopy
                });
              });
            }}/>
            <Button text="D" onClick={e => {
              api.deleteList(localState.board.id, list.id).then(() => {
                const lists = [...localState.lists];
                const currentList = list;

                for (const list of lists) {
                  if (list.position > currentList.position) list.position--;
                }

                setLocalState({
                  ...localState,
                  cards: localState.cards.filter(card => card.listId != currentList.id),
                  lists: lists.filter(list => list.id != currentList.id)
                });
              });
            }}/>
          </ButtonGroup>
        </div>
        <div className="list-com-content overflow-y-auto">
          <LZList source={localState.cards.filter(card => card.listId == list.id).sort((a, b) => a.position - b.position)}
            direction="column"
            gap={10} gapStart={10} gapEnd={10} itemDraggable={true}
            style={{padding: "0 10px"}}
            select={card => card.id}
            render={card => <CardComponent key={card.id} card={card}/>}
            onDrop={info => {
              const cards = [...localState.cards];
              const index = cards.findIndex(card => card.id == info.data);
              const current = cards[index];

              if (!current || info.to == info.from) return;

              api.updateCard(current.list.board.id, current.list.id, current.id, {
                listId: list.id,
                position: info.to
              }).then(card => {
                if (info.from == -1) {
                  for (const card of cards) {
                    if (card.listId == current.listId && card.position > current.position) {
                      card.position--;
                    }

                    if (card.listId == list.id && card.position >= info.to) {
                      card.position++;
                    }
                  }
                } else {
                  for (const card of cards.filter(card => card.listId == list.id)) {
                    if (card.position > info.from && card.position <= info.to) card.position--;
                    if (card.position < info.from && card.position >= info.to) card.position++;
                  }
                }

                cards[index].listId = list.id;
                cards[index].position = info.to;
                setLocalState({
                  ...localState,
                  cards
                });
              });
            }}/>
        </div>
      </div>
    );
  });

  const CardComponent = React.memo((props: {card: Card}) => {
    const {card} = props;
    const labels = getLabels(card.labelIds);

    return (
      <div key={card.id} className="card-com" draggable={true}
        onClick={e => setLocalState({
          ...localState,
          selectedCard: localState.cards.findIndex(c => c.id == card.id)
        })}
      >
        {labels.length > 0 &&
          <div className="card-com-labels flex-row flex-wrap">
            {labels.map(label => <div style={{backgroundColor: `#${label.color.toString(16)}`}}/>)}
          </div>
        }
        <div>{card.name}</div>
      </div>
    );
  });

  const CardPopupComponent = React.memo((props: {card: Card}) => {
    function CardPopupHeader() {
      return (
        <div className="card-com-popup-header flex-row flex-align-center flex-justify-between">
          <Text content={props.card.name} weight="bold" size="1.2rem"
            editable={true} 
            onEditComplete={elem => {
              api.updateCard(localState.board.id, props.card.listId, props.card.id, {
                name: elem.innerText,
                position: props.card.position
              }).then(card => {
                const cardsCopy = [...localState.cards];
                const index = cardsCopy.findIndex(item => item.id == card.id);
                cardsCopy[index] = card;
                setLocalState({
                  ...localState,
                  cards: cardsCopy
                });
              });
              return true;
            }}/>
            <ButtonGroup type="space-between">
              <Dropdown text="More">
                {[
                  (
                    <div onMouseDown={() => {
                      const { card } = props;

                      api.deleteCard(card.list.boardId, card.listId, card.id)
                        .then(() => {
                          const cards = localState.cards.filter(c => c.id != card.id);
                          for (const c of cards) {
                            if (c.listId == card.listId && c.position > card.position) {
                              c.position--;
                            }
                          }

                          setLocalState({
                            ...localState,
                            selectedCard: null,
                            cards
                          });
                        });
                    }}>Delete</div>
                  )
                ]}
              </Dropdown>
              <Button text="Close" type="primary" onClick={() => setLocalState({...localState, selectedCard: null})}/>
            </ButtonGroup>
        </div>
      );
    }

    function CardPopupContent() {
      return (
        <div className="card-popup-content">
          <div>
            <Text content="Labels" weight="bold"/>
            <div className="flex-row flex-wrap content-vhmargin"
              style={{
                marginLeft: "-5px"
              }}>
              {getLabels(props.card.labelIds).map(label => (
                <Button type="primary" text={label.name}
                  onClick={() => {
                    const { card } = props;

                    api.updateCard(card.list.boardId, card.listId, card.id, {
                      labelIds: card.labelIds.filter(lid => lid != label.id),
                      position: card.position
                    }).then(card => {
                      const cards = [...localState.cards];
                      const index = cards.findIndex(c => c.id == card.id);
                      cards[index] = card;

                      setLocalState({
                        ...localState,
                        cards
                      });
                    });
                  }}
                  style={{
                    backgroundColor: `#${label.color.toString(16)}`,
                    fontWeight: "bold",
                  }}
                />
              ))}
              <Dropdown text="Add Label">
                {getAvailableLabels(props.card.labelIds).map(label => (
                  <div className="flex flex-align-center"
                    onMouseDown={() => {
                      const { card } = props;

                      api.updateCard(card.list.boardId, card.listId, card.id, {
                        labelIds: card.labelIds.concat([label.id]),
                        position: card.position
                      }).then(card => {
                        const cards = [...localState.cards];
                        const index = cards.findIndex(c => c.id == card.id);
                        cards[index] = card;

                        setLocalState({
                          ...localState,
                          cards
                        });
                      });
                    }}>
                    <span
                      style={{
                        backgroundColor: `#${label.color.toString(16)}`,
                        width: "7px",
                        height: "7px",
                        marginRight: "5px",
                        borderRadius: "50%",
                        display: "inline-block",
                      }}
                    />
                    <span>{label.name}</span>
                  </div>
                ))}
              </Dropdown>
            </div>
          </div>
          <div>
            <Text content="Description" weight="bold"/>
            <Text className="block" style={{marginTop: "5px"}}
              breakWord={true}
              content={props.card.description || "No Description"}
              editable={true}
              onEditComplete={elem => {
                api.updateCard(localState.board.id, props.card.listId, props.card.id, {
                  description: elem.innerText,
                  position: props.card.position
                }).then(card => {
                  const cardsCopy = [...localState.cards];
                  const index = cardsCopy.findIndex(item => item.id == card.id);
                  cardsCopy[index] = card;
                  setLocalState({
                    ...localState,
                    cards: cardsCopy
                  });
                });
                return true;
              }}/>
          </div>
        </div>
      );
    }

    return (
      <div className="card-com-popup flex-column shadow-1 abs border-box overflow-hidden">
        <CardPopupHeader/>
        <CardPopupContent/>
      </div>
    );
  });

  if (localState === null) {
    return <div>Loading</div>;
  } else if (localState === undefined) {
    return <div>Not Found</div>;
  }

  return (
    <Grid rows={["53px", "auto"]}>
      <Layout className="border-bottom flex-row flex-align-center flex-justify-between overflow-x-auto" 
        style={{padding: "10px 20px"}}>
        <Text className="nowrap" content={localState.board.name} weight="bold" size="1.2rem" 
          editable={localState.board.ownerId == globalState.user.id}
          style={{marginRight: "10px"}}
          onEditComplete={elem => {
            api.updateBoard(props.id, {
              name: elem.innerText
            }).then(board => setLocalState({
              ...localState,
              board
            }));
            return true;
          }}/>
        <ButtonGroup className="self-flex-end" type="space-between">
          {canEdit() &&
            <Button type="standard" text="Create list" onClick={() => api.createList(props.id, {
              name: "New List",
              position: localState.lists.length
            }).then(list => setLocalState({
              ...localState,
              lists: localState.lists.concat([list])
            }))}/>
          }
          <Button type="primary" text="Menu" onClick={() => setLocalState({
            ...localState,
            isPaneOpen: !localState.isPaneOpen
          })}/>
        </ButtonGroup>
      </Layout>
      <SplitView open={localState.isPaneOpen} side="right"
        onCloseRequest={() => setLocalState({
          ...localState,
          isPaneOpen: false
        })}
        pane={
          <div className="flex-column content-vmargin p20">
            <Text content="Labels" weight="bold" size="1.1rem"/>
            <Table
              sources={localState.board.labels.map((label, index) => {
                return {
                  key: label.id,
                  unselectable: false,
                  fields: {
                    name: (
                      <Text content={label.name} editable={true}
                        onEditComplete={elem => {
                          api.updateLabel(localState.board.id, label.id, {
                            name: elem.innerText
                          }).then(l => {
                            const labels = [...localState.board.labels];
                            labels[index] = l;
                            setLocalState({
                              ...localState,
                              board: {
                                ...localState.board,
                                labels
                              }
                            });
                          });
                          return true;
                        }}
                      />
                    ),
                    color: (
                      <input type="color"
                        defaultValue={`#${label.color.toString(16)}`}
                        onFocus={e => {
                          const value = parseInt(e.currentTarget.value.substr(1), 16);
                          if (value == label.color) return;

                          api.updateLabel(localState.board.id, label.id, {
                            color: value
                          }).then(l => {
                            const labels = [...localState.board.labels];
                            labels[index] = l;
                            setLocalState({
                              ...localState,
                              board: {
                                ...localState.board,
                                labels
                              }
                            });
                          });
                        }}/>
                    ),
                    delete: (
                      <Button text="Delete"
                        onClick={() => {
                          api.deleteLabel(localState.board.id, label.id).then(() => {
                            setLocalState({
                              ...localState,
                              board: {
                                ...localState.board,
                                labels: localState.board.labels.filter(l => l.id != label.id)
                              }
                            });
                          });
                        }}
                      />
                    )
                  }
                };
              })}
              columns={[
                {
                  title: "Name",
                  field: "name",
                },
                {
                  title: "Color",
                  field: "color"
                },
                {
                  field: "delete",
                  style: {
                    textAlign: "right"
                  }
                }
              ]}
            />
            <Button type="primary" text="Add Label"
              onClick={() => {
                const num = randomNumber(0x000000, 0xFFFFFF);
                api.createLabel(localState.board.id, {
                  name: num.toString(),
                  color: num
                }).then(label => {
                  setLocalState({
                    ...localState,
                    board: {
                      ...localState.board,
                      labels: localState.board.labels.concat(label)
                    }
                  });
                });
              }}
            />
            <Button type="primary" text="Delete" onClick={() => api.deleteBoard(props.id).then(() => {
              if (history.length > 1) {
                history.goBack();
              } else {
                history.push("/");
              }
            })}/>
            {isOwner() &&
              <select onChange={e => {
                const value = e.currentTarget.value;
                api.updateBoard(localState.board.id, {
                  isPrivate: value == 1 ? true : false
                }).then(board => {
                    setLocalState({
                      ...localState,
                      board
                    });
                });
              }}>
                <option selected={!localState.board.isPrivate} value={0}>Public</option>
                <option selected={localState.board.isPrivate} value={1}>Private</option>
              </select>
            }
            {isOwner() &&
              <select onChange={e => {
                const value = e.currentTarget.value;
                api.updateBoard(localState.board.id, {
                  teamId: value == 0 ? null : value
                }).then(board => {
                    setLocalState({
                      ...localState,
                      board
                    });
                });
              }}>
                <option selected={!localState.board.team} value={0}>None</option>
                {localState.teams.map(team =>
                  <option selected={localState.board.team && team.id == localState.board.team.id}
                    value={team.id}>
                    {team.name}
                  </option>
                )}
              </select>
            }
          </div>
        }>
        {localState.selectedCard != null &&
          <div className="card-com-popup-bg overflow-y-auto overflow-x-hidden">
            <div onClick={() => setLocalState({...localState, selectedCard: null})}></div>
            <CardPopupComponent card={localState.cards[localState.selectedCard]}/>
          </div>
        }
        <main className="stretch color-secondary-dark board-com" style={{
          backgroundImage: localState.board.backgroundImage ? `url("${localState.board.backgroundImage}")` : undefined
        }}>
          <LZList source={localState.lists.sort((a, b) => a.position - b.position)}
            gap={10} gapStart={20} gapEnd={20} itemDraggable={true}
            select={list => list.id}
            render={list => <TaskListComponent key={list.id} list={list}/>}
            onDrop={info => {
              if (info.to == info.from) return;
              api.updateList(localState.board.id, info.data, {
                position: info.to
              }).then(({position}) => {
                const lists = [...localState.lists];

                for (const list of lists) {
                  if (list.position > info.from && list.position <= info.to) list.position--;
                  if (list.position < info.from && list.position >= info.to) list.position++;
                }

                lists.find(l => l.id == info.data).position = position;
                setLocalState({
                  ...localState,
                  lists
                });
              });
            }}/>
        </main>
      </SplitView>
    </Grid>
  );
}

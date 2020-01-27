import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import { Link, Redirect } from "react-router-dom";

import {
  ApplicationState,
  User,
  Team,
  Board,
  List,
  Card,
  Label,
  HistoryEntry,
  FragioAPI,
} from "../common";

import {
  Avatar,
  Header,
  HeaderItem,
  Button,
  ButtonGroup,
  Tabs,
  Layout,
  Table,
  Nav,
  NavItem,
  NavSection,
  NavSeparator,
  Grid,
  Text,
  SplitView,
  Dropdown,
  List as LZList,
} from "../lazuli";

const API_URL = process.env.API_URL;

function setTitle(title?: string) {
  if (title) {
    document.title = `${title} - Fragio`;
  } else {
    document.title = "Fragio";
  }
}

function HomePage() {
  const api = new FragioAPI(API_URL, window.localStorage.getItem("token"));

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
    setTitle();
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
            <NavItem onClick={e => e.currentTarget.firstElementChild.click()}>
              <Link to={`/team/${team.id}`}>{team.name}</Link>
            </NavItem>
          )}
        </NavSection>
      </Nav>
      <main style={{padding: "20px", backgroundColor: "#fff", overflow: "auto"}}>
        <Tabs defaultIndex={0}>
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
                      team: board.team ? board.team.name : "None",
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
                      team: board.team ? board.team.name : "None",
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

function TeamPage(props: { id: string }) {
  const token =  window.localStorage.getItem("token");
  const api = new FragioAPI(API_URL, token);

  const globalState = useSelector<ApplicationState, ApplicationState>(state => state);
  const [localState, setLocalState] = React.useState<{
    team: Team,
    member: Members[],
  }>(undefined);

  React.useEffect(() => {
    async function apiRequest() {
      const team = await api.getTeam(props.id);
      const members = await api.getTeamMembers(props.id);

      if (team && members) {
        setLocalState({
          team,
          members,
        });
        setTitle(team.name);
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
    <div>
      <strong>{localState.team.name}</strong>
      {localState.members.map(member => <div>{member.user.name}</div>)}
      {globalState.user &&
        <React.Fragment>
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
          <Button type="primary" text="Delete" onClick={() => {
            api.deleteTeam(localState.team.id)
              .then(() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.replace("/");
                }
              });
          }}/>
        </React.Fragment>
      }
    </div>
  );
}

function BoardPage(props: { id: string }) {
  const token =  window.localStorage.getItem("token");
  const api = new FragioAPI(API_URL, token);

  const globalState = useSelector<ApplicationState, ApplicationState>(state => state);
  const [localState, setLocalState] = React.useState<{
    board: Board,
    lists: List[],
    cards: Card[],
    isPaneOpen: boolean,
    selectedCard: number
  }>(undefined);

  React.useEffect(() => {
    async function apiRequest() {
      const board = await api.getBoard(props.id);
      const lists = await api.getLists(props.id);
      const cards = await api.getCards(props.id);

      if (board && lists && cards) {
        setLocalState({
          board,
          lists,
          cards,
          isPaneOpen: false
        });
        setTitle(board.name);
      } else {
        setLocalState(null);
      }
    }

    apiRequest();
  }, []);

  // TODO: Hide this on release
  React.useEffect(() => console.debug(localState, setLocalState), [localState]);

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
          <div className="card-com-labels flex-row flex-wrap content-hmargin">
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
          <Button type="standard" text="Create list" onClick={() => api.createList(props.id, {
            name: "New List",
            position: localState.lists.length
          }).then(list => setLocalState({
            ...localState,
            lists: localState.lists.concat([list])
          }))}/>
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
                      <div className="pointer"
                        style={{
                          backgroundColor: `#${label.color.toString(16)}`,
                          padding: "5px",
                          borderRadius: "5px"
                        }}
                      />
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
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.replace("/");
              }
            })}/>
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

export interface ReduxAction {
  type: "LOGIN" | "LOGOUT" | "UPDATE_USER";
  data: any;
}

export class ApplicationState {
  token?: string;
  user?: User;

  static AvailableLanguages = ["en-US", "pt-BR"];
};

export class QueryString {
  obj: any = {};
  baseurl: string;

  constructor(url: string) {
    const split = url.split("?", 2);
    this.baseurl = split[0];
    if (split.length > 1) {
      const params = split[1];
      const queries = params.match(/([\w\d]+(?:=([^&=]+))?)+/g) ?? [];
      for (let query of queries) {
        const pair = query.split("=");
        const key = pair[0];

        if (pair.length === 1) {
          this.obj[key] = true;
          continue;
        }

        this.obj[key] = pair[1];
      }
    }
  }

  url() : string {
    let result = this.baseurl + '?';
    for (let key in this.obj) {
      result += key;
      if (this.obj[key] !== true) {
        result += `=${this.obj[key]}`;
      }
      result += '&';
    }
    return result.substr(0, result.length - 1);
  }

  get<T>(key: string) : T | null {
    if (key in this.obj) {
      return this.obj[key] as T;
    }

    return null;
  }

  set(key: string, value: string | number | boolean) : void {
    this.obj[key] = value;
  }

  includes(key: string) : boolean {
    return key in this.obj;
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  imageUrl: string;
  creationDate: string;
}

export interface Team {
  id: string;
  owner: User;
  ownerId: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

export interface Member {
  id: string;
  userId: string;
  teamId: string;
  user: User;
  team: Team;
  joinedAt: string;
}

export interface Board {
  id: string;
  ownerId: string;
  owner: User;
  teamId?: string;
  team?: Team;
  name: string;
  isPrivate: boolean;
  createdAt: string;
  labels: Label[];
}

export interface Label {
  id: string;
  name: string;
  color: number;
}

export interface List {
  id: string;
  boardId: string;
  board: Board;
  name: string;
  position: number;
}

export interface Card {
  id: string;
  listId: string;
  list: List;
  name: string;
  description: string;
  position: number;
  labelIds: string[];
}

export interface HistoryEntry {
  id: string;
  userId: string;
  boardId: string;
  user: User;
  board: Board;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  boardId: string;
  listId?: string;
  cardId?: string;
  activityType: number;
  createdAt: string;
  user: User;
  board: Board;
  list?: List;
  card?: Card;
  data: any;
}

interface AuthInfo {
  id: string;
  username: string;
  token: string;
  expiration: string;
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  useToken?: boolean;
  isFormData?: boolean;
  body?: any;
}

export class FragioAPI {
  url: string;
  token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  async request<T>(endpoint: string, options: ApiRequestOptions) : Promise<T> {
    var headers: any = {};

    if (options.useToken && this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
    }

    if (!options.isFormData) {
        headers["Content-Type"] = "application/json";
    }

    return fetch(`${this.url}/${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.isFormData ? options.body : JSON.stringify(options.body)
    }).then(res => {
      if (res.ok) {
        const contentType = res.headers.get("Content-Type");

        if (contentType && contentType.includes("json")) {
          return res.json();
        } else if (contentType) {
          return res.text();
        }

        return Promise.resolve(null);
      }

      return Promise.reject([res.status, res.statusText]);
    });
  }

  async createAccount(data: any) : Promise<AuthInfo> {
    return this.request("api/v1/auth/new", {
      method: "POST",
      body: data
    });
  }

  async getToken(username: string, password: string) : Promise<AuthInfo> {
    return this.request("api/v1/auth/auth", {
      method: "POST",
      body: {username, password}
    });
  }

  async getCurrentUser() : Promise<User> {
    return this.request("api/v1/user", {
      useToken: true
    });
  }

  async getUser(username: string) : Promise<User> {
    return this.request(`api/v1/user/${username}`, {
      useToken: true
    });
  }

  async getBoardsFromUser(username: string) : Promise<Board[]> {
    return this.request(`api/v1/user/${username}/boards`, {
      useToken: true
    });
  }

  async getHistoryFromUser(username: string) : Promise<HistoryEntry[]> {
    return this.request(`api/v1/user/${username}/boards/recent`, {
      useToken: true
    });
  }

  async getTeamsFromUser(username: string) : Promise<Team[]> {
    return this.request(`api/v1/user/${username}/teams`, {
      useToken: true
    });
  }

  async getActivitiesFromUser(username: string, after: number = 0) : Promise<Activity[]> {
    return this.request(`api/v1/user/${username}/activities?after=${after}`, {
      useToken: true
    });
  }

  async updateUser(username: string, body: any) : Promise<User> {
    return this.request(`api/v1/user/${username}`, {
      method: "PATCH",
      useToken: true,
      body,
    });
  }

  async uploadUserImage(username: string, body: FormData) : Promise<string> {
    return this.request(`api/v1/user/${username}/image`, {
      method: "POST",
      useToken: true,
      isFormData: true,
      body,
    });
  }

  async getBoard(boardId: string) : Promise<Board> {
    return this.request(`api/v1/board/${boardId}`, {
      useToken: true
    });
  }

  async getLists(boardId: string) : Promise<List[]> {
    return this.request(`api/v1/board/${boardId}/lists`, {
      useToken: true
    });
  }

  async getCards(boardId: string, listId?: string) : Promise<Card[]> {
    return this.request(`api/v1/board/${boardId}/lists/${listId ? listId + "/" : ''}cards`, {
      useToken: true
    });
  }

  async createTeam(data: any) : Promise<Team> {
    return this.request(`api/v1/team/`, {
      method: "POST",
      useToken: true,
      body: data
    });
  }

  async updateTeam(teamId: string, data: any) : Promise<Team> {
    return this.request(`api/v1/team/${teamId}`, {
      method: "PATCH",
      useToken: true,
      body: data
    });
  }

  async getTeam(teamId: string) : Promise<Team> {
    return this.request(`api/v1/team/${teamId}`, {
      method: "GET",
      useToken: true,
    });
  }

  async getTeamMembers(teamId: string) : Promise<Member[]> {
    return this.request(`api/v1/team/${teamId}/members`, {
      method: "GET",
      useToken: true,
    });
  }

  async getTeamBoards(teamId: string) : Promise<Board[]> {
    return this.request(`api/v1/team/${teamId}/boards`, {
      method: "GET",
      useToken: true,
    });
  }

  async getTeamActivities(teamId: string) : Promise<Activity[]> {
    return this.request(`api/v1/team/${teamId}/activities`, {
      method: "GET",
      useToken: true,
    });
  }

  async createMember(teamId: string, username: string) : Promise<Member> {
    return this.request(`api/v1/team/${teamId}/members/${username}`, {
      method: "PUT",
      useToken: true,
    });
  }

  async deleteMember(teamId: string, username: string) : Promise<void> {
    return this.request(`api/v1/team/${teamId}/members/${username}`, {
      method: "DELETE",
      useToken: true,
    });
  }

  async deleteTeam(teamId: string) : Promise<void> {
    return this.request(`api/v1/team/${teamId}`, {
      method: "DELETE",
      useToken: true,
    });
  }

  async createBoard(data: any) : Promise<Board> {
    return this.request(`api/v1/board/`, {
      method: "POST",
      useToken: true,
      body: data
    });
  }

  async updateBoard(boardId: string, data: any) : Promise<Board> {
    return this.request(`api/v1/board/${boardId}`, {
      method: "PATCH",
      useToken: true,
      body: data
    });
  }

  async deleteBoard(boardId: string) : Promise<void> {
    return this.request(`api/v1/board/${boardId}`, {
      method: "DELETE",
      useToken: true
    });
  }

  async getBoardActivities(boardId: string) : Promise<Activity[]> {
    return this.request(`api/v1/board/${boardId}/activities`, {
      method: "GET",
      useToken: true,
    });
  }

  async createLabel(boardId: string, data: any) : Promise<Label> {
    return this.request(`api/v1/board/${boardId}/labels`, {
      method: "POST",
      useToken: true,
      body: data
    });
  }

  async updateLabel(boardId: string, labelId: string, data: any) : Promise<Label> {
    return this.request(`api/v1/board/${boardId}/labels/${labelId}`, {
      method: "PATCH",
      useToken: true,
      body: data
    });
  }

  async deleteLabel(boardId: string, labelId: string) : Promise<void> {
    return this.request(`api/v1/board/${boardId}/labels/${labelId}`, {
      method: "DELETE",
      useToken: true,
    });
  }

  async createList(boardId: string, data: any) : Promise<List> {
    return this.request(`api/v1/board/${boardId}/lists`, {
      method: "POST",
      useToken: true,
      body: data
    });
  }

  async updateList(boardId: string, listId: string, data: any) : Promise<List> {
    return this.request(`api/v1/board/${boardId}/lists/${listId}`, {
      method: "PATCH",
      useToken: true,
      body: data
    });
  }

  async deleteList(boardId: string, listId: string) : Promise<void> {
    return this.request(`api/v1/board/${boardId}/lists/${listId}`, {
      method: "DELETE",
      useToken: true
    });
  }

  async createCard(boardId: string, listId: string, data: any) : Promise<Card> {
    return this.request(`api/v1/board/${boardId}/lists/${listId}/cards`, {
      method: "POST",
      useToken: true,
      body: data
    });
  }

  async updateCard(boardId: string, listId: string, cardId: string, data: any) : Promise<Card> {
    return this.request(`api/v1/board/${boardId}/lists/${listId}/cards/${cardId}`, {
      method: "PATCH",
      useToken: true,
      body: data
    });
  }

  async deleteCard(boardId: string, listId: string, cardId: string) : Promise<void> {
    return this.request(`api/v1/board/${boardId}/lists/${listId}/cards/${cardId}`, {
      method: "DELETE",
      useToken: true
    });
  }
}

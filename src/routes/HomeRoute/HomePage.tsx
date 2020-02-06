import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";

import {
  ApplicationState,
  Board,
  Team,
  HistoryEntry,
  FragioAPI,
} from "../../common";

export default function HomePage() {
  const { user, token } = useSelector<ApplicationState, ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL, token);
  const history = useHistory();
  const dispatch = useDispatch();
  const [localState, setLocalState] = React.useState<{
    boards: Board[],
    teams: Team[],
    history: HistoryEntry[],
    activities: Activity[]
  }>(undefined);

  React.useEffect(() => {
    async function request() {
      const boards = await api.getBoardsFromUser(user.username);
      const teams = await api.getTeamsFromUser(user.username);
      const history = await api.getHistoryFromUser(user.username);
      const activities = await api.getActivitiesFromUser(user.username);

      if (boards && teams && history && activities) {
        setLocalState({
          boards,
          teams,
          history,
          activities
        });
      } else {
        setLocalState(null);
      }
    }

    request();
    document.title = `Home - ${process.env.APP_NAME}`;
  }, []);

  function getLastTimeOpen(boardId: string) {
    const h = localState.history.find(h => h.boardId == boardId);
    return h ? new Date(h.createdAt).toLocaleString() : "Never";
  }

  if (localState === undefined) {
    return (
      <span>Loading</span>
    );
  } else if (localState === null) {
    return (
      <span>Error</span>
    );
  }

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="w-240 ph-15 border-right d-none d-sm-none d-md-block">
          Hi
        </div>
        <main className="col-sm bg-light">
          Hi
        </main>
        <div className="of-auto w-340 ph-15 h-100 border-left d-none d-sm-none d-md-none d-lg-block">
          <h5 className="mt-3">Activites</h5>
          {localState.activities.map(activity =>
            <div className="card mt-3">
              <div className="card-header">
                {activity.user.name}
              </div>
              <div className="card-body">
                <h6 className="card-title">Activity</h6>
                <p className="card-text"></p>
              </div>
            </div>
         )}
        </div>
      </div>
    </div>
  );
}

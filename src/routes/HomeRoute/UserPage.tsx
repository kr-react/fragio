import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";

import {
  FragioAPI,
  ApplicationState,
  User
} from "../../common";

export default function UserPage({ match }) {
  const { user, token } = useSelector<ApplicationState>(state => state);
  const api = new FragioAPI(process.env.API_URL, token);
  const [localState, setLocalState] = React.useState<{
    user: User,
  }>(undefined);

  React.useEffect(() => {
    async function request() {
      const user = await api.getUser(match.params.username);

      if (user) {
        setLocalState({
          user
        });
      }
    }

    request();
  }, []);

  if (localState === null) {
    return <div>Not Found</div>;
  } else if (localState === undefined) {
    return <div>Loading</div>;
  }

  return (
    <div className="container-fluid h-100 overflow-auto">
      <div className="container">
        <div className="row h-100">
          <div className="col-sm col-md-4 col-lg-3 p-3 d-flex flex-column">
            <div className="sticky-top pt-3">
              <div className="card overflow-hidden shadow-sm">
              <img
                width="100%"
                height="auto"
                src={localState.user.imageUrl}/>
              <div className="card-body">
                <h5 className="card-title">{localState.user.name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">{localState.user.username}</h6>
              </div>
            </div>
           </div>
          </div>
          <div className="col p-3 flex-column p-0 d-none d-sm-none d-md-flex">
            <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top border-bottom">
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item active">
                    <a
                      className="nav-link"
                      href="#">
                      Home
                    </a>
                  </li>
                  <li className="nav-item active">
                    <a
                      className="nav-link"
                      href="#">
                      Members
                    </a>
                  </li>
                  <li className="nav-item active">
                    <a
                      className="nav-link"
                      href="#">
                      Settings
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
            <main>

            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

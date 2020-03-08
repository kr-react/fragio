import * as React from "react";
import * as ReactDOM from "react-dom";
import * as moment from "moment";
import * as $ from "jquery";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { Activity } from "~/src/common";

interface StickyProps {
  children: JSX.Element;
  onScroll: (e: HTMLElement) => void;
}

interface ActivityComponentProps {
  activity: Activity;
  compact: boolean;
  component?: string;
  className?: string;
}

interface FooterProps {
  className?: string;
}

interface IconProps {
  name: string;
  fill: string;
  width: React.ReactText;
  height: React.ReactText;
}

export function useSearch<T>(arr: T[], map: (T) => string) {
  const [state, setState] = React.useState(arr);
  const func = (text: string) => setState(arr.filter(item => {
    const m = map(item).toLowerCase();
    return m.includes(text.toLowerCase());
  }));

  return [func, state];
}

export function useModal() {
  const [state, setState] = React.useState({
    element: null,
  });

  React.useEffect(() => {
    const elem = document.createElement("div")
    const dialog = document.createElement("div");

    elem.setAttribute("class", "modal fade");
    elem.setAttribute("tabindex", "-1");
    elem.setAttribute("role", "dialog");

    dialog.setAttribute("class", "modal-dialog");
    dialog.setAttribute("role", "document");

    document.body.appendChild(elem);
    elem.appendChild(dialog);

    setState({
      ...state,
      element: elem,
    });

    return () => {
      $(elem).modal("hide");
      setTimeout(() => {
        document.body.removeChild(elem);
      }, 2000);
    };
  }, []);

  function modal(com?: (HTMLDivElement) => JSX.Element) {
    if (!com) {
      $(state.element).modal("hide");
      return;
    }

    ReactDOM.render(com(state.element), state.element.firstElementChild);
    $(state.element).modal();
  }

  return modal;
}

export function AsyncComponent(props: any) {
  const [state, setState] = React.useState({
    code: 1,
    result: null,
  });

  React.useEffect(() => {
    props.func.apply(props.args[0], props.args.slice(1, props.func.length + 1))
      .then(value => {
        setState({
          code: 2,
          result: value,
        });
      }, reason => {
        setState({
          code: 0,
          result: reason,
        });
      });
  }, []);

  switch(state.code) {
    case 2: {
      return props.ok(state.result);
    };

    case 1: {
      return props.loading();
    };

    default: {
      return props.fail(state.result);
    };
  }
}

export function Icon(props: IconProps) {
  function HamburgerIcon() {
    return (
      <svg
        viewBox={`0 0 515.555 515.555`}
        fill={props.fill}
        width={props.width}
        height={props.height}>
        <path d="m303.347 18.875c25.167 25.167 25.167 65.971 0 91.138s-65.971 25.167-91.138 0-25.167-65.971 0-91.138c25.166-25.167 65.97-25.167 91.138 0"/>
        <path d="m303.347 212.209c25.167 25.167 25.167 65.971 0 91.138s-65.971 25.167-91.138 0-25.167-65.971 0-91.138c25.166-25.167 65.97-25.167 91.138 0"/>
        <path d="m303.347 405.541c25.167 25.167 25.167 65.971 0 91.138s-65.971 25.167-91.138 0-25.167-65.971 0-91.138c25.166-25.167 65.97-25.167 91.138 0"/>
      </svg>
    );
  }

  switch (props.name) {
    case "menu": {
      return <HamburgerIcon/>;
    };

    default: {
      return <svg></svg>;
    };
  }
}

export function Sticky(props: StickyProps) {
  const ref = React.useRef<HTMLElement>();

  async function onScrollHandler(container: HTMLElement, target: HTMLElement) {
    target.style.transform = `translateY(${container.scrollTop}px)`;

    if (props.onScroll) {
      props.onScroll(container.scrollTop, target);
    }
  }

  React.useEffect(() => {
    if (ref.current) {
      const target = ref.current;
      let container = target.parentElement;

      while (true) {
        if (!container) return;

        const style = window.getComputedStyle(container);
        const overflowY = style.getPropertyValue("overflow-y");

        if (overflowY == "scroll" || overflowY == "auto") {
          break;
        }

        container = container.parentElement;
      }

      container.addEventListener("scroll", () => onScrollHandler(container, target));
      onScrollHandler(container, target);
    }
  }, [ref]);

  return {
    ...props.children,
    ref
  };
}

export function ActivityComponent(props: ActivityComponentProps) {
  const { t } = useTranslation();
  const { activity } = props;

  function getBody() {
    switch (activity.activityType) {
      case 0: {
        const { board } = activity;

        return (
          <React.Fragment>
            <span>{t("activityBody.createdBoard")}</span>
            <Link to={`/board/${board.id}`}>
              <b> {board.name}</b>
            </Link>
          </React.Fragment>
        );
      } break;

      case 1: {
        const { list } = activity;

        return (
          <React.Fragment>
            <span>{t("activityBody.createdList")}</span>
            <b> {list.name}</b>
          </React.Fragment>
        );
      } break;

      case 2: {
        const { card } = activity;

        return (
          <React.Fragment>
            <span>{t("activityBody.createdBoard")}</span>
            <b> {card.name}</b>
            <span> {t("activityBody.on")}</span>
            <b> {card.list.name}</b>
          </React.Fragment>
        );
      } break;

      case 3: {
        const { board, data } = activity;

        return (
          <React.Fragment>
            <span>{t("activityBody.renamedBoard")}</span>
            <b> {data.oldName}</b>
            <span> {t("activityBody.to")}</span>
            <Link to={`/board/${board.id}`}>
              <b> {data.newName}</b>
            </Link>
          </React.Fragment>
        );
      } break;

      case 4: {
        const { list, data } = activity;

        return (
          <React.Fragment>
            <span>{t("activityBody.renamedList")}</span>
            <b> {data.oldName}</b>
            <span> {t("activityBody.to")}</span>
            <b> {data.newName}</b>
          </React.Fragment>
        );
      } break;

      case 5: {
        const { card, data } = activity;

        return (
          <React.Fragment>
            <span>{t("activityBody.renamedCard")}</span>
            <b> {data.oldName}</b>
            <span> {t("activityBody.to")}</span>
            <b> {data.newName}</b>
          </React.Fragment>
        );
      } break;

      case 6: {
        const { card } = activity;

        return (
          <React.Fragment>
            <span>{t("activityBody.movedCard")}</span>
            <b> {card.name}</b>
            <span> {t("activityBody.to")}</span>
            <b> {card.list.name}</b>
          </React.Fragment>
        );
      } break;
    }
  }

  var element: JSX.Element;

  if (props.compact) {
    element = (
      <div className="d-flex align-items-center overflow-hidden text-nowrap text-muted">
        <span className="d-flex flex-row align-items-center">
          <Link
            className="d-flex flex-row align-items-center"
            to={`/user/${activity.user.username}`}>
            <img
              className="rounded mr-3"
              src={activity.user.imageUrl}
              width="25"
              height="25"/>
            <span>{activity.user.username}</span>
          </Link>
        </span>
        <span className="ml-3 mr-auto overflow-hidden text-truncate">
          {getBody()}
        </span>
        <span className="ml-3">
          {moment(activity.createdAt).fromNow()}
        </span>
      </div>
    );
  } else {
    element = (
      <div className="d-flex flex-column">
        <div className="mb-2 text-muted">
          <span><b>{activity.user.username}</b></span>
          <span> { t("activityBody.on")} </span>
          <Link to={`board/${activity.board.id}`}>
            <b>{activity.board.name}</b>
          </Link>
          {activity.board.team &&
            <small className="ml-2">
              {activity.board.team.name}
            </small>
          }
          <small className="ml-2 float-right">
            {moment(activity.createdAt).fromNow()}
          </small>
        </div>
        <div className="d-flex flex-row">
          <div>
            <Link to={`/user/${activity.user.username}`}>
              <img
                className="rounded"
                src={activity.user.imageUrl}
                alt={activity.user.name}
                width="35"
                height="35"/>
            </Link>
          </div>
          <div className="card bg-light ml-2 flex-grow-1">
            <div className="card-body text-muted">
              {getBody()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (props.className) {
    element.props.className += " " + props.className;
  }


  if (props.as) {
    element.type = props.as;
  }

  return element;
}

export function Footer(props: FooterProps) {
  const { t } = useTranslation();
  const date = new Date();

  return (
    <footer className={props.className}>
      <hr className="my-4"/>
      <div className="d-flex flex-row align-items-center justify-content-between text-muted pb-4">
        <div className="w-100 text-left d-none d-md-block">
          {`© ${date.getFullYear()} Fragio, Inc.`}
        </div>
        <h6 className="m-0 w-100 text-left d-md-none">
          <b>{process.env.APP_NAME}</b>
        </h6>
        <h6 className="m-0 w-100 text-center d-none d-md-inline-block">
          <b>{process.env.APP_NAME}</b>
        </h6>
        <div className="w-100 text-right">
          <a
            href="https://github.com/happotato/fragio"
            target="blank">
            {t("sourceCode")}
          </a>
        </div>
      </div>
    </footer>
  );
}

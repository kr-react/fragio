import * as React from "react";
import * as ReactDOM from "react-dom";
import * as moment from "moment";
import * as $ from "jquery";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { Activity } from "./common";
import { readFileSync } from "fs";

declare interface ResizeObserverEntry {
  target: Element | SVGElement;
}

declare class ResizeObserver {
  constructor(callback: (entries: ResizeObserverEntry[]) => void);
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

interface ActivityComponentProps {
  as?: string | JSX.Element;
  activity: Activity;
  compact?: boolean;
  component?: string;
  className?: string;
}

interface FooterProps {
  className?: string;
}

interface IconProps {
  name: string;
  fill?: string;
  width: React.ReactText;
  height: React.ReactText;
}

interface LoadingProps {
  className?: string;
  small?: boolean;
  type?: "spinner" | "growing";
}

export function useSearch<T>(arr: T[], map: (_: T) => string) {
  const [state, setState] = React.useState(arr);
  const func = (text: string) => setState(arr.filter(item => {
    return map(item).includes(text.toLowerCase());
  }));

  return {
    search: func,
    result: state,
  };
}

export function useModal() {
  React.useEffect(() => {
    if (!document.querySelector("#use-modal")) {
      const element = document.createElement("div")
      const dialog = document.createElement("div");

      element.setAttribute("id", "use-modal");
      element.setAttribute("class", "modal fade");
      element.setAttribute("tabindex", "-1");
      element.setAttribute("role", "dialog");
      element.setAttribute("data-backdrop", "static");
      element.setAttribute("data-keyboard", "false");

      dialog.setAttribute("class", "modal-dialog");
      dialog.setAttribute("role", "document");

      document.body.appendChild(element);
      element.appendChild(dialog);
    }
  }, []);

  function modal(action?: string | ((_: HTMLElement) => JSX.Element), callback: any = undefined) {
    const jqElement= $("#use-modal");

    if (!action) {
      jqElement.modal("hide");
    } else {
      if (typeof(action) === "string") {
        jqElement.on(action, callback);
      } else {
        ReactDOM.render(action(jqElement[0]), jqElement[0].firstElementChild);
        jqElement.modal();
      }
    }
  }

  return modal;
}

export function useSticky<T extends HTMLElement>(count: number) : React.RefObject<T>[] {
  const refs = [...Array(count).keys()].map(() => React.createRef<T>());
  
  React.useEffect(() => {
    const observers: ResizeObserver[] = [];
    
    for (const ref of refs) {
      const target = ref.current;
      
      if (target) {
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

        target.style.height = `${container.clientHeight}px`;
        target.classList.add("sticky-top");

        const resizeObserver = new ResizeObserver(() => {
            target.style.height = `${container?.clientHeight}px`;
        });

        resizeObserver.observe(container);
        resizeObserver.observe(document.body);
        observers.push(resizeObserver);
      }
    }

    return () => {
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, [...refs]);

  return refs;
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

export function Loading(props: LoadingProps) {
  let classes = props.className || "";

  switch (props.type) {
    case "growing":
      classes += " spinner-grow"
      break;
  
    default:
      classes += " spinner-border"
      break;
  }

  if (props.small) {
    classes += "-sm";
  }

  return (
    <div className={classes} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
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
            <Link to={`/board/${board?.id}`}>
              <b> {board?.name}</b>
            </Link>
          </React.Fragment>
        );
      } break;

      case 1: {
        const { list } = activity;

        return (
          <React.Fragment>
            <span>{t("activityBody.createdList")}</span>
            <b> {list?.name}</b>
          </React.Fragment>
        );
      } break;

      case 2: {
        const { card } = activity;

        return (
          <React.Fragment>
            <span>{t("activityBody.createdBoard")}</span>
            <b> {card?.name}</b>
            <span> {t("activityBody.on")}</span>
            <b> {card?.list.name}</b>
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
            <Link to={`/board/${board?.id}`}>
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
            <b> {card?.name}</b>
            <span> {t("activityBody.to")}</span>
            <b> {card?.list.name}</b>
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
          </Link>
          <b>{activity.user.username}</b>
        </span>
        <span className="ml-3 mr-auto overflow-hidden text-truncate">
          {getBody()}
        </span>
        <Link
          className="ml-3"
          to={`/board/${activity.board?.id}`}>
          <b>{activity.board?.name}</b>
        </Link>
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
          <Link to={`/board/${activity.board?.id}`}>
            <b>{activity.board?.name}</b>
          </Link>
          {activity.board?.team &&
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

  const links = [
    {
      name: t("roadmap"),
      href: process.env.ROADMAP_URL,
    },
    {
      name: t("sourceCode"),
      href: process.env.SOURCE_CODE_URL,
    },
  ];

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
          {links.map(link =>
            <a
              className="ml-2"
              href={link.href}
              target="blank">
              {link.name}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

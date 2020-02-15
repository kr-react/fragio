import * as React from "react";
import * as moment from "moment";
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
  const { activity } = props;

  function getBody() {
    switch (activity.activityType) {
      case 0: {
        const { board } = activity;

        return (
          <React.Fragment>
            <span>Added board </span>
            <Link to={`/board/${board.id}`}>
              <b>{board.name}</b>
            </Link>
          </React.Fragment>
        );
      } break;

      case 1: {
        const { list } = activity;

        return (
          <React.Fragment>
            <span>Added list </span>
            <b>{list.name}</b>
            <span> to </span>
            <Link to={`/board/${list.board.id}`}>
              <b>{list.board.name}</b>
            </Link>
          </React.Fragment>
        );
      } break;

      case 2: {
        const { card } = activity;

        return (
          <React.Fragment>
            <span>Added card </span>
            <b>{card.name}</b>
            <span> to </span>
            <b>{card.list.name}</b>
            <span> on board </span>
            <Link to={`/board/${card.list.board.id}`}>
              <b>{card.list.board.name}</b>
            </Link>
          </React.Fragment>
        );
      } break;

      case 3: {
        const { board, data } = activity;

        return (
          <React.Fragment>
            <span>Renamed board </span>
            <b>{data.oldName}</b>
            <span> to </span>
            <Link to={`/board/${board.id}`}>
              <b>{data.newName}</b>
            </Link>
          </React.Fragment>
        );
      } break;

      case 4: {
        const { list, data } = activity;

        return (
          <React.Fragment>
            <span>Renamed list </span>
            <b>{data.oldName}</b>
            <span> to </span>
            <b>{data.newName}</b>
            <span> on board </span>
            <Link to={`/board/${list.board.id}`}>
              <b>{list.board.name}</b>
            </Link>
          </React.Fragment>
        );
      } break;

      case 5: {
        const { card, data } = activity;

        return (
          <React.Fragment>
            <span>Renamed card </span>
            <b>{data.oldName}</b>
            <span> to </span>
            <b>{data.newName}</b>
            <span> on board </span>
            <Link to={`/board/${card.list.board.id}`}>
              <b>{card.list.board.name}</b>
            </Link>
          </React.Fragment>
        );
      } break;

      case 6: {
        const { card } = activity;

        return (
          <React.Fragment>
            <span>Moved card </span>
            <b>{card.name}</b>
            <span> to </span>
            <b>{card.list.name}</b>
            <span> on board </span>
            <Link to={`/board/${card.list.board.id}`}>
              <b>{card.list.board.name}</b>
            </Link>
          </React.Fragment>
        );
      } break;
    }
  }


  var element: JSX.Element;

  if (props.compact) {
    element = (
      <div className="d-flex justify-content-between align-items-center">
        <span className="d-flex flex-row align-items-center">
          <Link
            className="d-flex flex-row align-items-center"
            to={`/user/${activity.user.username}`}>
            <img
              className="rounded mr-3"
              src={activity.user.imageUrl}
              width="25"
              height="25"/>
            <span>{activity.user.name}</span>
          </Link>
        </span>
        <span className="text-nowrap text-muted">
          {moment(activity.createdAt).fromNow()}
        </span>
      </div>
    );
  } else {
    element = (
      <div className="card shadow-sm">
        <div className="card-header p-2">
          <img
            className="rounded mr-2"
            width="30px"
            height="30px"
            alt={activity.user.name}
            src={activity.user.imageUrl}/>
          <span>{activity.user.name}</span>
        </div>
        <div className="card-body text-muted px-2 py-1"
          style={{fontSize: ".9em"}}>
          {getBody()}
        </div>
        <div className="card-footer text-muted p-2">
          <span>{activity.team.name}</span>
          <span className="float-right">
            {moment(activity.createdAt).fromNow()}
          </span>
        </div>
      </div>
    );
  }

  element.props.className += " " + props.className;

  if (props.as) {
    element.type = props.as;
  }

  return element;
}

export function Footer(props: FooterProps) {
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
            Source Code
          </a>
        </div>
      </div>
    </footer>
  );
}

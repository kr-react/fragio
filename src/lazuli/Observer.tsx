import * as React from "react";
import * as ReactDOM from "react-dom";

interface ObserverProps<T> {
  children: JSX.Element;
  onIntersect: (e: T & Element) => void;
}

export default class Observer<T> extends React.Component<ObserverProps<T>> {
  constructor(props: ObserverProps<T>) {
    super(props);
  }

  componentDidMount() {
    let elem = ReactDOM.findDOMNode(this) as T & Element;
    if (elem) {
      const observer = new IntersectionObserver((entries, ob) => {
        if (entries[0].isIntersecting) {
          ob.unobserve(elem);
          ob.disconnect();
          this.props.onIntersect(elem);
        }
      });
      observer.observe(elem);
    }
  }

  render() {
    return this.props.children;
  }
}

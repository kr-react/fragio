import * as React from "react";

interface RequestProps {
  url: string,
  options?: RequestInit,
  success: (data: any) => JSX.Element,
  loading: () => JSX.Element,
  error: (code: any) => JSX.Element
}
  
export default function Request(props: RequestProps) {
  let [state, setState] = React.useState({
    status: 0,
    data: null
  });

  React.useEffect(() => {
    if (state.status === 0) {
    fetch(props.url, props.options)
      .then(res => {
        if (!res.ok) {
          return Promise.reject(res.status);
        }
          return res.text();
      }, reason => {
        setState({
          status: 1,
          data: reason
        });
      })
      .then(text => {
        setState({
          status: 2,
          data: text
        });
      }, reason => {
        setState({
          status: 1,
          data: reason
        });
      });
    }
  }, []);


  if (state.status === 0) {
    return props.loading();
  } else if (state.status === 1) {
    return props.error(state.data);
  } else {
    return props.success(state.data);
  }
}
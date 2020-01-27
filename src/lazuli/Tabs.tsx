import * as React from "react";
import { LazuliBaseCSSProperties, } from ".";

interface TabsProps extends LazuliBaseCSSProperties {
  defaultIndex?: number;
  panes?: TabPane[];
  children?: TabPane[];
}

interface TabPane {
  name: string;
  component: JSX.Element;
}

export default function Tabs(props: TabsProps) {
  const [currentIndex, setCurrentIndex] = React.useState(props.defaultIndex || 0);

  const classes: string[] = [
    "lz-tabs"
  ];

  if (props.className) {
    classes.push(props.className);
  }

  const panes = props.children || props.panes;

  return (
    <div className={classes.join(' ')} style={props.style}>
      <div>
        {panes.map((pane, index) => {
          return (
            <div data-selected={currentIndex == index} onClick={() => setCurrentIndex(index)}>
                {pane.name}
            </div>
          );
        })}
      </div>
      {panes[currentIndex].component}
    </div>
  );
}
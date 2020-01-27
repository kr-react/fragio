import * as React from "react";
import { LazuliBaseCSSProperties } from ".";

interface SplitViewProps extends LazuliBaseCSSProperties {
  children: React.ReactNode;
  pane: React.ReactNode;
  paneWidth?: React.ReactText;
  side?: "left" | "right";
  open?: boolean;
  onCloseRequest?: () => void;
}

export default function SplitView(props: SplitViewProps) {
  const ref = React.useRef<HTMLDivElement>();
  const width = props.paneWidth || "340px";
  const classes: string[] = [
    "lz-splitview",
    `lz-splitview-${props.side || "left"}`,
  ];

  if (props.className) {
    classes.push(props.className);
  }

  if (props.open === true) {
    classes.push("lz-splitview-open");
  }

  React.useEffect(() => {
    const current = ref.current;
    const children = ref.current.firstElementChild as HTMLDivElement;
    if (current) {
      function handler(_: MouseEvent) {
        if (props.open) props.onCloseRequest();
      }
      children.addEventListener("mousedown", handler);
      return () => children.removeEventListener("mousedown", handler);
    }
  }, [ref, props]);

  return (
    <div ref={ref} className={classes.join(' ')} style={props.style}>
      <div>
        {props.children}
      </div>
      <div className="overflow-y-auto" style={{
        width,
        left: props.side == "left" ? `-${width}` : undefined,
        right: props.side == "right" ? `-${width}` : undefined,
      }}>
        {props.pane}
      </div>
    </div>
  );
}

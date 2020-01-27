import * as React from "react";
import { LazuliBaseCSSProperties } from ".";

interface ButtonGroupProps extends LazuliBaseCSSProperties {
  children: React.ReactNode;
  type?: "joined" | "space-between"
}

export default function ButtonGroup(props: ButtonGroupProps) {
  const classes: string[] = [
    "lz-btn-grp",
    `lz-btn-grp-${props.type || "joined"}`
  ];

  if (props.className) {
    classes.push(props.className);
  }

  return (
    <div style={props.style} className={classes.join(' ')}>
      {props.children}
    </div>
  );
}
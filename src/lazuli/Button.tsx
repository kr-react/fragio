import * as React from "react";
import { LazuliBaseCSSProperties } from ".";

interface ButtonProps extends LazuliBaseCSSProperties {
  text?: string;
  size?: "normal" | "big";
  inative?: boolean;
  type?: "standard" | "primary";
  onClick?: (e: React.MouseEvent) => void;
}

export default function Button(props: ButtonProps) {
  const classes: string[] = [
    "lz-btn",
    `lz-btn-${props.size || "normal"}`,
    `lz-btn-${props.type || "standard"}`
  ];

  if (props.inative) {
    classes.push("lz-btn-inative");
  }

  if (props.className) {
    classes.push(props.className);
  }

  return (
    <button onClick={!props.inative && props.onClick} style={props.style}
      className={classes.join(' ')}>
      <span>{props.text}</span>
    </button>
  );
}

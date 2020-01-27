import * as React from "react";
import { LazuliBaseCSSProperties } from ".";

interface AvatarProps extends LazuliBaseCSSProperties {
  src: string,
  alt?: string,
  shape?: "circle" | "square",
}

export default function Avatar(props: AvatarProps) {
  const classes: string[] = [
    "lz-avatar",
    `lz-avatar-${props.shape || "square"}`
  ];

  if (props.className) {
    classes.push(props.className);
  }

  return (
    <span className={classes.join(' ')} style={props.style}>
      <img alt={props.alt || ""} draggable={false} src={props.src}/>
    </span>
  );
}


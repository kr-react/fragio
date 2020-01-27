import * as React from "react";
import { LazuliBaseCSSProperties, } from ".";

interface LayoutProps extends LazuliBaseCSSProperties {
  children: React.ReactNode;
  fluent?: boolean;
}

export default function Layout(props: LayoutProps) {
  const classes: string[] = [
    "lz-layout"
  ];

  if (props.className) {
    classes.push(props.className);
  }

  if (props.fluent) {
    classes.push("lz-layout-fluent");
  }

  return (
    <div style={props.style} className={classes.join(' ')}>
      {props.children}
    </div>
  );
}
import * as React from "react";
import { LazuliBaseCSSProperties } from ".";

interface HeaderProps extends LazuliBaseCSSProperties {
  children: React.ReactNode;
  fluent?: boolean;
}

interface HeaderItemsProps extends LazuliBaseCSSProperties {
  children: React.ReactNode;
}

export default function Header(props: HeaderProps) {
  const classes: string[] = [
    "lz-header"
  ];

  if (props.className) {
    classes.push(props.className);
  }

  if (props.fluent) {
    classes.push("lz-header-fluent");
  }

  return (
    <header className={classes.join(' ')} style={props.style}>
      <div>
        {props.children}
      </div>
    </header>
  );
}

export function HeaderItem(props: HeaderItemsProps) {
  const classes: string[] = [
    "lz-header-item"
  ];

  if (props.className) {
    classes.push(props.className);
  }

  return (
    <div className={classes.join(' ')} style={props.style}>
      {props.children}
    </div>
  )
}
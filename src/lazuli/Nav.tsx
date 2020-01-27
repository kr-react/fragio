import * as React from "react";
import { LazuliBaseCSSProperties } from ".";

interface NavProps extends LazuliBaseCSSProperties {
  children: React.ReactNode;
}

interface NavItemProps extends LazuliBaseCSSProperties {
  selected: boolean;
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface NavSectionProps extends LazuliBaseCSSProperties {
  header: React.ReactNode;
  children: React.ReactNode;
}

export function NavSeparator(props: never) {
  return (
    <div style={{
      height: "1px",
      width: "100%",
      margin: "5px 0",
      backgroundColor: "rgb(236, 236, 236)"
    }}/>
  );
}

export function NavItem(props: NavItemProps) {
  const classes: string[] = [
    "lz-nav-item",
  ];

  if (props.className) classes.push(props.className);
  if (props.selected) classes.push("lz-nav-item-selected");

  return (
    <div className={classes.join(' ')} style={props.style}
      onClick={props.onClick}>
      {props.children}
    </div>
  );
}

export function NavSection(props: NavSectionProps) {
  const classes: string[] = [
    "lz-nav-section",
  ];

  if (props.className) classes.push(props.className);

  return (
    <div className={classes.join(' ')} style={props.style}>
      <div>{props.header}</div>
      <div>{props.children}</div>
    </div>
  );
}

export default function Nav(props: NavProps) {
  const classes: string[] = [
    "lz-nav",
    "flex-column",
  ];

  if (props.className) classes.push(props.className);

  return (
    <nav className={classes.join(' ')} style={props.style}>
      {props.children}
    </nav>
  );
}

import * as React from "react";
import { LazuliBaseCSSProperties, Button } from ".";

interface DropdownProps extends LazuliBaseCSSProperties {
  text: string;
  children: React.JSXElement[];
}

export default function Dropdown(props: DropdownProps) {
  const popupRef = React.useRef<HTMLDivElement>();
  const classes = [
    "lz-dropdown"
  ];

  if (props.className) classes.push(props.className);

  return (
    <div className={classes.join(' ')} style={props.style}>
      <Button type="primary" text={props.text} onClick={() => popupRef.current.focus()}/>
      <div ref={popupRef} className="lz-dropdown-popup flex-column overflow-y-auto" tabIndex={0}>
        {props.children.map(elem => <div tabIndex={0}>{elem}</div>)}
      </div>
    </div>
  );
}

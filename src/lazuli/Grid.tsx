import * as React from "react";
import { LazuliBaseCSSProperties, } from ".";

interface GridProps extends LazuliBaseCSSProperties {
  rows?: string[];
  colums?: string[];
  gap?: string;
  children: React.ReactNode;
}

interface GridItemProps extends LazuliBaseCSSProperties {
  columnStart?: number;
  columnEnd?: number;
  rowStart?: number;
  rowEnd?: number;
  children?: React.ReactNode;
}

export default function Grid(props: GridProps) {
  const classes: string[] = [
    "lz-grid"
  ];

  if (props.className) {
    classes.push(props.className);
  }

  return (
    <div className={classes.join(' ')} style={{
        ...props.style,
        gridTemplateRows: props.rows ? props.rows.join(' ') : undefined,
        gridTemplateColumns: props.colums ? props.colums.join(' ') : undefined,
        gridGap: props.gap
      }}>
      {props.children}
    </div>
  );
}

export function GridItem(props: GridItemProps) {
  const classes: string[] = [
    "lz-grid-item"
  ];

  if (props.className) {
    classes.push(props.className);
  }

  return (
    <div className={classes.join(' ')} style={{
      ...props.style,
      gridColumnStart: props.columnStart,
      gridColumnEnd: props.columnEnd,
      gridRowStart: props.rowStart,
      gridRowEnd: props.rowEnd
    }}>
      {props.children}
    </div>
  );
}
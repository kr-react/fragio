import * as React from "react";
import { LazuliBaseCSSProperties } from ".";

interface ListProps extends LazuliBaseCSSProperties {
  direction?: "row" | "column";
  gap?: number;
  gapStart?: number;
  gapEnd?: number;
  itemDraggable?: boolean;
  source: any[];
  render: (data: any) => React.JSXElement;
  select?: (data: any) => any;
  onDrop?: (data: ListDropData) => void;
}

interface ListDropData {
  data: any;
  from: number;
  to: number;
}

const List = React.memo((props: ListProps) => {
  const ref = React.useRef<HTMLDivElement>();
  const classes = [
    "lz-list",
    `lz-list-${props.direction || "row"}`
  ];
  let placeholders: HTMLDivElement;

  if (props.className) classes.push(props.className);

  React.useEffect(() => {
    if (ref.current && props.gap) {
      const elem = ref.current;
      placeholders = Array.from(elem.querySelectorAll(":scope > .lz-list-item-placeholder"));
    }
  });

  function indexOfNearest(elems: Element[], xa: number, ya: number) {
    let closest = -1;
    let lowdist = Number.MAX_SAFE_INTEGER;

    elems.forEach((elem, index) => {
      const bounding = elem.getBoundingClientRect();
      const xb = bounding.x;
      const yb = bounding.y;
      const dist = Math.sqrt(Math.pow(xa - xb, 2) + Math.pow(ya - yb, 2));

      if (dist <= lowdist) {
        lowdist = dist;
        closest = index;
      }
    });

    return closest;
  }

  function clearPlaceholdersStyle() {
    for (const placeholder of placeholders) {
      placeholder.classList.remove("nearest");
    }
  }

  function onDragStartHandler(e: React.MouseEvent<HTMLDivElement>, data: any) {
    e.stopPropagation();
    const target = e.currentTarget;
    const str = JSON.stringify({
      data: props.select ? props.select(data) : data,
    });

    e.dataTransfer.setData("data", str);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(target.firstElementChild, target.clientWidth / 2, 10);
  }

  function onDragOverHandler(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    clearPlaceholdersStyle();

    const nearestIndex = indexOfNearest(placeholders, e.clientX, e.clientY);
    placeholders[nearestIndex].classList.add("nearest");
  }

  function onDragLeaveHandler(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    clearPlaceholdersStyle();
  }

  function onDropHandler(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    clearPlaceholdersStyle();

    const target = e.currentTarget;
    const data = JSON.parse(e.dataTransfer.getData("data")).data;
    const from = props.source.findIndex(item => props.select(item) === data);
    const to = indexOfNearest(placeholders, e.clientX, e.clientY);

    props.onDrop({
      data,
      from,
      to: from >= 0 && to > from && to - from >= 1 ? to - 1 : to
    });
  }

  return (
    <div ref={ref} className={classes.join(' ')}
      style={{
        ...props.style,
        "--gap-item": `${props.gap}px`,
        "--gap-start": `${props.gapStart}px`,
        "--gap-end": `${props.gapEnd}px`,
      }}
      onDragOver={onDragOverHandler}
      onDragLeave={onDragLeaveHandler}
      onDrop={onDropHandler}>
      <div className="lz-list-item-placeholder"/>
      {props.source.map(data => {
        return (
          <React.Fragment>
            <div className="lz-list-item"
              draggable={props.itemDraggable || false}
              onDragStart={e => onDragStartHandler(e, data)}>
              {props.render(data)}
            </div>
            <div className="lz-list-item-placeholder"/>
          </React.Fragment>
        );
      })}
    </div>
  );
});

export default List;

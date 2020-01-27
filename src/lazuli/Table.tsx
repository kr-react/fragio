import * as React from "react";
import { LazuliBaseCSSProperties, } from ".";

interface TableSource {
  key: string | number;
  unselectable?: boolean;
  fields: any;
}

interface TableColumn {
  title: string;
  field: string;
  style: React.CSSProperties;
}

interface TableProps extends LazuliBaseCSSProperties {
  sources: TableSource[];
  columns: TableColumn[];
  selectable?: boolean;
  onSelectionChange?: (indexes: number[]) => void
}

export default function Table(props: TableProps) {
  const [selectedIndexes, setSelectedIndexes] = React.useState<number[]>([]);
  const selectablesCount = props.sources.filter(src => !src.unselectable).length;

  const classes: string[] = [
    "lz-table"
  ];

  if (props.className) {
    classes.push(props.className);
  }

  return (
    <div className={classes.join(' ')} style={props.style}>
      <table>
        <colgroup>
          {props.columns.map(() => <col/>)}
        </colgroup>
        <thead>
          <tr>
            {props.selectable &&
              <th>
                <input type="checkbox" checked={selectablesCount > 0 && selectedIndexes.length == selectablesCount}
                  disabled={selectablesCount == 0}
                  onChange={e => {
                    const target = e.currentTarget;
                    if (target.checked) {
                      const indexes = props.sources.filter(src => !src.unselectable)
                        .map((_, index) => index);
                      if (props.onSelectionChange) props.onSelectionChange(indexes);
                      setSelectedIndexes(indexes);
                    } else {
                      if (props.onSelectionChange) props.onSelectionChange([]);
                      setSelectedIndexes([]);
                    }
                  }}/>
              </th>
            }
            {props.columns.map(column => <th>{column.title}</th>)}
          </tr>
        </thead>
        <tbody>
          {props.sources.map((src, index) => {
            let renderables: JSX.Element[] = [];

            if (props.selectable) {
              renderables.push(
                <td>
                  <input type="checkbox" checked={selectedIndexes.includes(index)}
                    disabled={src.unselectable}
                    onChange={e => {
                      const target = e.currentTarget;
                      if (target.checked) {
                        const indexes = selectedIndexes.concat([index]);
                        if (props.onSelectionChange) props.onSelectionChange(indexes);
                        setSelectedIndexes(indexes);
                      } else {
                        const indexes = selectedIndexes.filter(i => i != index);
                        if (props.onSelectionChange) props.onSelectionChange(indexes);
                        setSelectedIndexes(indexes);
                      }
                    }}
                  />
                </td>
              );
            }

            for (const column of props.columns) {
              renderables.push(<td style={column.style}>{src.fields[column.field]}</td>);
            }

            return <tr key={src.key}>{renderables}</tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

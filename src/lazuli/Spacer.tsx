import * as React from "react";

interface SpacerProps {
  orientation: "vertical" | "horizontal";
  size: string;
}

export default function Spacer(props: SpacerProps) {
  return (
    <div
      style={{
        display: "inline-block",
        width: props.orientation === "horizontal" ? `${props.size}` : "100%",
        height: props.orientation === "vertical" ? `${props.size}` : "100%"
      }}
    ></div>
  );
}

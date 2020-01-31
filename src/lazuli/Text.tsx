import * as React from "react";
import { LazuliBaseCSSProperties } from ".";
import {
  FontWeightProperty,
  FontFamilyProperty,
  FontSizeProperty
} from "csstype";

interface TextProps extends LazuliBaseCSSProperties {
  content: string;
  weight?: FontWeightProperty;
  size?: FontSizeProperty<string>;
  family?: FontFamilyProperty;
  editable?: boolean;
  spellcheck?: boolean;
  breakWord?: boolean;
  onEditComplete?: (elem: HTMLSpanElement) => boolean;
}

export default function Text(props: TextProps) {
  const classes = [props.className];
  let preEditContent = props.content;

  if (props.breakWord) {
    classes.push("pre-wrap break-word");
  }

  function onBlurHandler(e: React.FocusEvent<HTMLSpanElement>) {
    const target = e.currentTarget;
    if (target.innerText != preEditContent) {
      if (!props.onEditComplete || (props.onEditComplete && props.onEditComplete(target))) {
        preEditContent = target.innerText;
      } else {
        target.innerText = preEditContent;
      }
    }
  }

  return (
    <span className={classes.join(' ')}
      contentEditable={props.editable || false}
      spellcheck={props.spellcheck == true ? "true" : "false"}
      onBlur={onBlurHandler}
      style={{
        ...props.style,
        fontWeight: props.weight || "normal",
        fontSize: props.size || "1em",
        fontFamily: props.family || "inherit"
      }}>
      {props.content}
    </span>
  );
}

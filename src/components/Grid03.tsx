import { css } from "@emotion/react";
import React, { FC, useState } from "react";
import { Ease } from "yohak-react-tools";
import { gridPanels } from "./grid";

export type Grid01Props = {};

const colors = gridPanels;
const arr = new Array(colors.length * colors.length).fill(null);

export const Grid03: FC<Grid01Props> = ({}) => {
  const [rotate, setRotate] = useState(false);
  const onClickPanel = () => {
    setRotate((prevState) => !prevState);
  };

  return (
    <div css={wrapper}>
      <ul css={[grid, baseLine]}>
        {arr.map((val, i) => (
          <li key={i} />
        ))}
      </ul>
      <div css={panels} onClick={onClickPanel}>
        {colors.map((row, i) => (
          <div key={`row${i}`}>
            {row.map((color, j) => (
              <div
                key={`panel${j}`}
                css={[panel, makeBackground(color)]}
                data-delay-base={j + i}
                data-rotate={rotate ? "" : undefined}
                style={{ ["--delay" as any]: j + i }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const wrapper = css`
  width: min(calc(100vw - 100px), calc(100vh - 100px));
  aspect-ratio: 1 / 1;
  margin: 50px;
  position: relative;
`;

const grid = css`
  display: grid;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
`;

const baseLine = css`
  border-right: 1px solid black;
  border-bottom: 1px solid black;

  li {
    border-left: 1px solid black;
    border-top: 1px solid black;
  }
`;

const panels = css`
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  & > div {
    display: flex;
    flex-grow: 1;
    justify-content: space-between;
    //background-color: #0070f3;
  }
`;
const panel = css`
  flex-grow: 1;
  backface-visibility: hidden;
  will-change: transform;
  transition-duration: 400ms;
  transition-delay: calc(var(--delay) * 40ms);
  transition-timing-function: ${Ease._4_OUT_QUART};
  transform: scale(1.02);

  &[data-rotate] {
    transform: rotateX(15deg) rotateY(95deg);
    //transition-delay: 0s;
    //transition-duration: 0.5s;
  }
`;

const makeBackground = (color: string) => css`
  background-color: ${color};
`;

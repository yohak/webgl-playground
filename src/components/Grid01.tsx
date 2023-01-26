import { css } from "@emotion/react";
import React, { FC, useState } from "react";

export type Grid01Props = {};

const row1 = ["#211B19", "#1C1413", "#1D1614", "#1A1311"];
const row2 = ["#9C9D9E", "#514F4F", "#2E2A29", "#1D1614"];
const row3 = ["#DBDCDC", "#C4C5C5", "#514F4F", "#1C1413"];
const row4 = ["#F3F4F4", "#DBDCDC", "#9C9D9E", "#211B19"];
const colors = [...row1, ...row2, ...row3, ...row4];

export const Grid01: FC<Grid01Props> = ({}) => {
  const [rotate, setRotate] = useState(false);
  const onClickPanel = () => {
    setRotate((prevState) => !prevState);
  };

  return (
    <div css={wrapper}>
      <ul css={[grid, baseLine]}>
        {colors.map((val, i) => (
          <li key={i} />
        ))}
      </ul>
      <ul css={[grid, panels]} onClick={onClickPanel}>
        {colors.map((val, i) => (
          <li key={i} css={makeBackground(val)} data-rotate={rotate ? "" : undefined}></li>
        ))}
      </ul>
    </div>
  );
};

const wrapper = css`
  width: 50vw;
  height: 50vw;
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
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
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
  li {
    //
    opacity: 1;
    transition-property: transform, opacity;
    transition-timing-function: ease-out;
    transition-duration: 0.3s;
    &[data-rotate] {
      opacity: 0;
      transform: rotateX(30deg) rotateY(180deg);
    }
  }
`;
const makeBackground = (color: string) => css`
  background-color: ${color};
`;

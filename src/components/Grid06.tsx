import { css } from "@emotion/react";
import React, { FC, useEffect, useRef, useState } from "react";
import { Ease } from "yohak-react-tools";
import { qsa, setStyle } from "yohak-tools";
import { gridPanels } from "./grid";

export type Grid01Props = {};

const colors = gridPanels;
const arr = new Array(colors.length * colors.length).fill(null);

export const Grid06: FC<Grid01Props> = ({}) => {
  const [rotate, setRotate] = useState(true);
  const onClickPanel = () => {
    setRotate((prevState) => !prevState);
  };
  const { cursorRef } = useCustomCursor();
  const { panelScale, panelWrapperRef } = usePanelScale();

  return (
    <div css={wrapper}>
      <div css={gridWrapper}>
        <ul css={[grid, baseLine]}>
          {arr.map((val, i) => (
            <li key={i} />
          ))}
        </ul>
        <div css={panels} onClick={onClickPanel} ref={panelWrapperRef}>
          {colors.map((row, i) => (
            <div key={`row${i}`}>
              {row.map((color, j) => (
                <div
                  key={`panel${j}`}
                  css={panel}
                  data-delay-base={j + i}
                  data-rotate={rotate ? "" : undefined}
                  style={{
                    ["--delay" as any]: j + i,
                    ["--scale" as any]: panelScale,
                    ["--bgc" as any]: color,
                  }}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div css={pointerWrapper}>
        <div css={pointer} ref={cursorRef}>
          <span></span>
        </div>
      </div>
      <h1 css={hello}>HELLO WORLD!</h1>
    </div>
  );
};

const usePanelScale = () => {
  const [panelScale, setPanelScale] = useState(1.03);
  const panelWrapperRef = useRef<HTMLDivElement>();
  const updateScale = () => {
    const panel = qsa(":scope > div > div", panelWrapperRef.current!)[0];
    const currentSize = panel.offsetWidth;
    const targetSize = currentSize + 2;
    setPanelScale(targetSize / currentSize);
  };
  useEffect(() => {
    updateScale();
    window.addEventListener("resize", () => {
      updateScale();
    });
  }, []);
  return { panelScale, panelWrapperRef };
};
const useCustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>();
  document.addEventListener("mousemove", (e) => {
    if (cursorRef.current) {
      setStyle(cursorRef.current, { translateX: e.clientX, translateY: e.clientY });
    }
  });
  // return { cursorX, cursorY, cursorRef };
  return { cursorRef };
};

const wrapper = css`
  position: relative;
`;

const pointerWrapper = css`
  pointer-events: none;
  mix-blend-mode: difference;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;

const pointer = css`
  position: absolute;
  transition-duration: 0.7s;
  transition-property: transform;
  transition-timing-function: ${Ease._6_OUT_EXPO};

  span {
    display: block;
    width: 10px;
    height: 10px;
    //background-color: #d5d5d5;
    background-color: #fff;
    border-radius: 100%;
    transform: translate(-50%, -50%);
  }
`;

const gridWrapper = css`
  width: min(calc(80vw - 100px), calc(80vh - 100px));
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
  background-color: var(--bgc);
  backface-visibility: hidden;
  will-change: transform;
  transition-duration: 400ms;
  transition-delay: calc(var(--delay) * 40ms);
  transition-timing-function: ${Ease._4_OUT_QUART};
  transform: scale(var(--scale));

  &[data-rotate] {
    transform: rotateX(15deg) rotateY(95deg);
    //transition-delay: 0s;
    //transition-duration: 0.5s;
  }
`;

const hello = css`
  font-size: 12vw;
`;

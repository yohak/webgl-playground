import { css } from "@emotion/react";
import React, { FC, useEffect, useRef } from "react";
import { Ease } from "yohak-react-tools";
import { qsa, setStyle } from "yohak-tools";
import { gridPanels } from "./grid";

export type Grid01Props = {};

const colors = gridPanels;
const arr = new Array(colors.length * colors.length).fill(null);

export const Grid05: FC<Grid01Props> = ({}) => {
  const { cursorRef } = useCustomCursor();
  const { panelWrapperRef, onClickPanel } = usePanelSize();

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
                  css={[panel, makeBackground(color)]}
                  data-delay-base={j + i}
                  style={{ ["--delay" as any]: j + i }}
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
const useCustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>();
  useEffect(() => {
    document.addEventListener("mousemove", (e) => {
      if (cursorRef.current) {
        setStyle(cursorRef.current, { translateX: e.clientX, translateY: e.clientY });
      }
    });
  }, []);
  // return { cursorX, cursorY, cursorRef };
  return { cursorRef };
};

const usePanelSize = () => {
  let p: HTMLDivElement[] = [];
  let scaleRatio = 0;
  let isVisible = false;
  isVisible = true;
  isVisible = false;
  const panelWrapperRef = useRef<HTMLDivElement>();
  const onClickPanel = () => {};
  const setPanelRatio = () => {
    const currentSize = p[0].offsetWidth;
    const targetSize = currentSize + 2;
    scaleRatio = targetSize / currentSize;
  };
  const updatePanel = () => {
    if (isVisible) {
      setStyle(p, { transform: `scale(${scaleRatio},${scaleRatio})` });
    } else {
      setStyle(p, { transform: `rotate(15deg,95deg)` });
    }
    console.log(p[0].style);
  };
  useEffect(() => {
    p = qsa(":scope > div > div", panelWrapperRef.current!);
    setPanelRatio();
    updatePanel();
    window.addEventListener("resize", () => setPanelRatio());
  }, []);
  return { panelWrapperRef, onClickPanel };
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
    background-color: #d5d5d5;
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
  backface-visibility: hidden;
  will-change: transform;
  transition-duration: 400ms;
  transition-delay: calc(var(--delay) * 40ms);
  transition-timing-function: ${Ease._4_OUT_QUART};
  transform-origin: center center;

  &[data-rotate] {
    transform: rotateX(15deg) rotateY(95deg);
    //transition-delay: 0s;
    //transition-duration: 0.5s;
  }
`;

const makeBackground = (color: string) => css`
  background-color: ${color};
`;

const hello = css`
  font-size: 12vw;
`;

import { css } from "@emotion/react";
import React, { FC } from "react";

export type MobileWrapperProps = {};

export const MobileWrapper: FC<MobileWrapperProps> = ({ children }) => {
  return (
    <div css={wrapper}>
      <div css={inner}>{children}</div>
    </div>
  );
};

const wrapper = css`
  @media (min-width: 420px) {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  @media (max-width: 420px) {
  }
`;

const inner = css`
  position: relative;
  @media (min-width: 420px) {
    width: 375px;
    height: 600px;
  }
`;

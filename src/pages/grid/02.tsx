import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(() => import("../../components/Grid02").then((m) => m.Grid02), {
  ssr: false,
});

const Grid02: FC = ({}) => {
  return <NoSSR />;
};

export default Grid02;

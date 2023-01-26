import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(() => import("../../components/Grid01").then((m) => m.Grid01), {
  ssr: false,
});

const Grid01: FC = ({}) => {
  return <NoSSR />;
};

export default Grid01;

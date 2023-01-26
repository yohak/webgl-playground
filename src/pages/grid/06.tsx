import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(() => import("../../components/Grid06").then((m) => m.Grid06), {
  ssr: false,
});

const Grid05: FC = ({}) => {
  return <NoSSR />;
};

export default Grid05;

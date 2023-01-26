import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(() => import("../../components/Grid04").then((m) => m.Grid04), {
  ssr: false,
});

const Grid02: FC = ({}) => {
  return <NoSSR />;
};

export default Grid02;

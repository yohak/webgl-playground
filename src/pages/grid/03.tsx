import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(() => import("../../components/Grid03").then((m) => m.Grid03), {
  ssr: false,
});

const Grid02: FC = ({}) => {
  return <NoSSR />;
};

export default Grid02;

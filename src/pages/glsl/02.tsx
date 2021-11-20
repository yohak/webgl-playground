import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(() => import("../../components/GLSLTest02").then((m) => m.GLSLTest02), {
  ssr: false,
});

const Page: FC = ({}) => {
  return <NoSSR />;
};

export default Page;

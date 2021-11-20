import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(() => import("../../components/GLSLTest03").then((m) => m.GLSLTest03), {
  ssr: false,
});

const Page: FC = ({}) => {
  return <NoSSR />;
};

export default Page;

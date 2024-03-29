import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(() => import("../../components/GLSLTest01").then((m) => m.GLSLTest01), {
  ssr: false,
});

const Page: FC = ({}) => {
  return <NoSSR />;
};

export default Page;

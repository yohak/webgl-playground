import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(
  () => import("../../components/ThreeParticles07b").then((m) => m.ThreeParticles07b),
  {
    ssr: false,
  }
);

const Page: FC = ({}) => {
  return <NoSSR />;
};

export default Page;

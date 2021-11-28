import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(
  () => import("../../components/ThreeParticles06f").then((m) => m.ThreeParticles06f),
  {
    ssr: false,
  }
);

const Page: FC = ({}) => {
  return <NoSSR />;
};

export default Page;

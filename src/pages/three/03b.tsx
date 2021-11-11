import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(
  () => import("../../components/ThreeParticles03b").then((m) => m.ThreeParticles03b),
  {
    ssr: false,
  }
);

const Page: FC = ({}) => {
  return <NoSSR />;
};

export default Page;

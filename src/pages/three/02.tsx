import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(
  () => import("../../components/ThreeParticles02").then((m) => m.ThreeParticles02),
  {
    ssr: false,
  }
);

const Three01: FC = ({}) => {
  return <NoSSR />;
};

export default Three01;

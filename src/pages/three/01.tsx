import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(
  () => import("../../components/ThreeParticles01").then((m) => m.ThreeParticles01),
  {
    ssr: false,
  }
);

const Three01: FC = ({}) => {
  return <NoSSR />;
};

export default Three01;

import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(
  () => import("../../components/ThreeParticles01b").then((m) => m.ThreeParticles01b),
  {
    ssr: false,
  }
);

const Three01: FC = ({}) => {
  return <NoSSR />;
};

export default Three01;

import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(
  () => import("../../components/ThreeParticles01d").then((m) => m.ThreeParticles01d),
  {
    ssr: false,
  }
);

const Three01: FC = ({}) => {
  return <NoSSR />;
};

export default Three01;

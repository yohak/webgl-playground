import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(
  () => import("../../components/ThreeParticles03").then((m) => m.ThreeParticles03),
  {
    ssr: false,
  }
);

const Three01: FC = ({}) => {
  return <NoSSR />;
};

export default Three01;

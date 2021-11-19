import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(
  () => import("../../components/ThreeParticles05a").then((m) => m.ThreeParticles05a),
  {
    ssr: false,
  }
);

const Page: FC = ({}) => {
  return <NoSSR />;
};

export default Page;

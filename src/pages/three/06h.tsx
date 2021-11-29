import dynamic from "next/dynamic";
import React, { FC } from "react";

const NoSSR = dynamic<any>(
  () => import("../../components/ThreeParticles06h").then((m) => m.ThreeParticles06h),
  {
    ssr: false,
  }
);

const Page: FC = ({}) => {
  return <NoSSR />;
};

export default Page;

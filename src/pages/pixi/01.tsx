import dynamic from "next/dynamic";
import { FC, useState } from "react";
import { MobileWrapper } from "../../components/MobileWrapper";
import {
  defaultParticleParams,
  params2,
  PixiParticles01GUI,
} from "../../components/pixiParticles01GUI";

const NoSSR = dynamic<any>(
  () => import("../../components/pixiParticles01").then((m) => m.PixiParticles01),
  {
    ssr: false,
  }
);

const Pixi01: FC = () => {
  const [params, setParams] = useState(params2);

  return (
    <>
      <MobileWrapper>
        <NoSSR params={params} />
      </MobileWrapper>
      <PixiParticles01GUI setParams={setParams} />
    </>
  );
};

export default Pixi01;

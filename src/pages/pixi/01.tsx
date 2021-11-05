import dynamic from "next/dynamic";
import { FC } from "react";
import { MobileWrapper } from "../../components/MobileWrapper";

const NoSSR = dynamic<any>(
  () => import("../../components/pixiParticles01").then((m) => m.PixiParticles01),
  {
    ssr: false,
  }
);

const Pixi01: FC = () => {
  return (
    <MobileWrapper>
      <NoSSR />
    </MobileWrapper>
  );
};

export default Pixi01;

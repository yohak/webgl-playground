import dynamic from "next/dynamic";
import { FC } from "react";

const NoSSR = dynamic<any>(
  () => import("../../components/pixiParticles01").then((m) => m.PixiParticles01),
  {
    ssr: false,
  }
);

const Pixi01: FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#CCCCCC",
      }}
    >
      <NoSSR />
    </div>
  );
};

export default Pixi01;

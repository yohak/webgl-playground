import { useEffect, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BasicProps, BasicReturn, useThreeJS } from "./useThreeJS";

type Props = BasicProps & { update: any };

export const useOrbitControls = ({ update, bgColor = 0x000000 }: Props): BasicReturn => {
  const updateControl = () => {
    if (!controls) return;
    controls.update();
    update();
  };
  const [controls, setControls] = useState<OrbitControls>(null);
  const returnProps = useThreeJS({
    // update: updateControl,
    bgColor,
  });

  const { wrapperRef, camera } = returnProps;

  useEffect(() => {
    if (!(wrapperRef.current && camera)) return;
    setControls(new OrbitControls(camera, wrapperRef.current));
  }, [wrapperRef, camera]);
  //
  return { ...returnProps };
};

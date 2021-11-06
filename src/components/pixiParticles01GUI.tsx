import { css } from "@emotion/react";
import React, { Dispatch, FC, SetStateAction, useEffect, useRef } from "react";
import { Pane } from "tweakpane";

export type ParticleParams = {
  birthFreq: number;
  color: string;
  opacityBase: number;
  opacityRand: number;
  sizeBase: number;
  sizeRand: number;
  blur: number;
  waveSizeBase: number;
  waveSizeRand: number;
  waveFreqBase: number;
  waveFreqRand: number;
  angleA: number;
  angleB: number;
  angleC: number;
  speedBase: number;
  speedRand: number;
  buoyancyRatio: number;
};
export const defaultParticleParams: ParticleParams = {
  birthFreq: 50,
  color: "#00aee4",
  opacityBase: 0.3,
  opacityRand: 0.4,
  sizeBase: 10,
  sizeRand: 10,
  blur: 16,
  waveSizeBase: 5,
  waveSizeRand: 5,
  waveFreqBase: 2.5,
  waveFreqRand: 0.5,
  angleA: 0,
  angleB: 2,
  angleC: 5,
  speedBase: 1,
  speedRand: 2,
  buoyancyRatio: 1000,
};
export type PixiParticles01GUIProps = {
  setParams: Dispatch<SetStateAction<ParticleParams>>;
};

export const PixiParticles01GUI: FC<PixiParticles01GUIProps> = ({ setParams }) => {
  const wrapperRef = useRef();
  useEffect(() => {
    const pane = new Pane({ container: wrapperRef.current });
    const f1 = pane.addFolder({ title: "basic" });
    f1.addInput(defaultParticleParams, "birthFreq", { min: 16, max: 1000 });
    const f2 = pane.addFolder({ title: "particle" });
    f2.addInput(defaultParticleParams, "color");
    f2.addInput(defaultParticleParams, "opacityBase", { min: 0, max: 1 });
    f2.addInput(defaultParticleParams, "opacityRand", { min: 0, max: 1 });
    f2.addInput(defaultParticleParams, "sizeBase", { min: 1, max: 100 });
    f2.addInput(defaultParticleParams, "sizeRand", { min: 0, max: 100 });
    f2.addInput(defaultParticleParams, "blur", { min: 0, max: 64 });
    const f3 = pane.addFolder({ title: "motion" });
    f3.addInput(defaultParticleParams, "waveSizeBase", { min: 0, max: 50 });
    f3.addInput(defaultParticleParams, "waveSizeRand", { min: 0, max: 50 });
    f3.addInput(defaultParticleParams, "waveFreqBase", { min: 0, max: 10 });
    f3.addInput(defaultParticleParams, "waveFreqRand", { min: 0, max: 10 });
    f3.addInput(defaultParticleParams, "angleA", { min: -45, max: 45 });
    f3.addInput(defaultParticleParams, "angleB", { min: -45, max: 45 });
    f3.addInput(defaultParticleParams, "angleC", { min: -45, max: 45 });
    f3.addInput(defaultParticleParams, "speedBase", { min: 0, max: 20 });
    f3.addInput(defaultParticleParams, "speedRand", { min: 0, max: 20 });
    f3.addInput(defaultParticleParams, "buoyancyRatio", { min: 100, max: 2000, step: 1 });
    pane.addSeparator();

    // let changeTimeout = 0;
    // pane.on("change", () => {
    //   clearTimeout(changeTimeout);
    //   changeTimeout = window.setTimeout(() => {
    //     // console.log(setParams);
    //     setParams(pane.exportPreset() as ParticleParams);
    //   }, 100);
    // });
    const submitButton = pane.addButton({ title: "SUBMIT" });
    submitButton.on("click", () => {
      setParams(pane.exportPreset() as ParticleParams);
    });

    const copyButton = pane.addButton({ title: "COPY PARAMS" });
    copyButton.on("click", () => {
      navigator.clipboard.writeText(JSON.stringify(pane.exportPreset())).then(() => {
        window.alert("copied!");
      });
    });
    return () => {
      pane.dispose();
    };
  }, []);
  return <div ref={wrapperRef} css={wrapperCSS} />;
};

const wrapperCSS = css`
  position: fixed;
  right: 30px;
  top: 30px;
  @media (max-width: 420px) {
    display: none;
  }
`;

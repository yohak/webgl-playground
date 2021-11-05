import { useEffect } from "react";

export const useResizeComplete = () => {
  let timeOut: number;
  // console.log("foo");
  const func = () => {
    clearTimeout(timeOut);
    setTimeout(() => {
      console.log("resized");
    }, 300);
  };

  useEffect(() => {
    window.addEventListener("resize", func);
    return () => {
      window.removeEventListener("resize", func);
    };
  }, []);
};

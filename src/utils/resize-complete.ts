export const addResizeComplete = () => {
  window.addEventListener("resize", () => {});
};

export const removeResizeComplete = () => {
  window.removeEventListener("resize", () => {});
};

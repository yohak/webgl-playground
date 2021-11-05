export const insertAfter = (thisNode: Element, ref: Element) => {
  if (!thisNode || !ref) {
    return;
  }
  ref.parentElement.insertBefore(thisNode, ref.nextSibling);
};
export const insertBefore = (thisNode: Element, ref: Element) => {
  if (!thisNode || !ref) {
    return;
  }
  ref.parentElement.insertBefore(thisNode, ref);
};

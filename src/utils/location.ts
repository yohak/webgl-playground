export const parseSearchQuery = <T>(str: string): T => {
  if (!str) {
    return undefined;
  }
  const query = str.substring(1);
  const vars = query.split("&");
  const result: any = {};
  vars.forEach((item) => {
    const [key, value] = item.split("=");
    result[key] = decodeURIComponent(value);
  });
  return result as T;
};

export const setSearchQuery = (obj: any) => {
  const queryString = Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  if (queryString === "") {
    return;
  }
  const newURL =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    `?${queryString}`;
  window.history.pushState({ path: newURL }, "", newURL);
  // location.search = "?hoo";
};

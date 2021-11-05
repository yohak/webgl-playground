import { parseSearchQuery } from "./location";
type MyType = {
  hoo: string;
  bar: string;
};
describe("parseSearchQuery", () => {
  it("should return undefined when text is falsy", () => {
    const result = parseSearchQuery("");
    expect(result).toBe(undefined);
  });
  it("should work", () => {
    const result = parseSearchQuery<MyType>("?hoo=hoge&bar=moge");
    expect(result.hoo).toBe("hoge");
    expect(result.bar).toBe("moge");
  });
});

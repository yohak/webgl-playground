import { makeRangeNumbers } from "./array";

describe("makeRangeNumbers", () => {
  it("should generate array", () => {
    const result = makeRangeNumbers(1, 5);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
  it("should generate reversed array", () => {
    const result = makeRangeNumbers(5, -1);
    console.log(result);
    expect(result).toEqual([5, 4, 3, 2, 1, 0, -1]);
  });
});

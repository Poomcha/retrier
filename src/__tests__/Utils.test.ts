import { UtilsNumber } from "../helpers/Utils";

//#region Utils.isInteger
test("Utils.isInteger: returns false if n is not a number", () => {
  expect(UtilsNumber.isInteger("")).toBe(false);
  expect(UtilsNumber.isInteger("kjbefjbef")).toBe(false);
  expect(UtilsNumber.isInteger(true)).toBe(false);
  expect(UtilsNumber.isInteger(false)).toBe(false);
  expect(UtilsNumber.isInteger({})).toBe(false);
  expect(UtilsNumber.isInteger([])).toBe(false);
  expect(UtilsNumber.isInteger(undefined)).toBe(false);
  expect(UtilsNumber.isInteger(null)).toBe(false);
  expect(UtilsNumber.isInteger(NaN)).toBe(false);
});
test("Utils.isInteger: returns false if n is a float", () => {
  expect(UtilsNumber.isInteger(1.5)).toBe(false);
});
test("Utils.isInteger: returns false if n is not a safe integer", () => {
  expect(UtilsNumber.isInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
  expect(UtilsNumber.isInteger(Number.MIN_SAFE_INTEGER - 1)).toBe(false);
});
test("Utils.isInteger: returns true if n is an integer including 0", () => {
  expect(UtilsNumber.isInteger(0)).toBe(true);
  expect(UtilsNumber.isInteger(56)).toBe(true);
});
//#endregion

//#region Utils.isPositive
test("Utils.isPositive: returns true if n (assumed number) is positive including 0, else false", () => {
  expect(UtilsNumber.isPositive(-1)).toBe(false);
  expect(UtilsNumber.isPositive(0)).toBe(true);
  expect(UtilsNumber.isPositive(1)).toBe(true);
});
//#endregion

//#region Utils.checkIntegerNumber
test("Utils.checkIntegerNumber: throws NonSafeIntegerError if n is not an integer", () => {
  expect(() => UtilsNumber.checkIntegerNumber(1.87)).toThrow(
    new Error("NonSafeIntegerError")
  );
});
//#endregion

//#region Utils.checkPositiveNumber
test("Utils.checkPositiveNumber: throws NonPositiveError if n is not a positive number", () => {
  expect(() => UtilsNumber.checkIntegerPositive(-1)).toThrow(
    new Error("NonPositiveError")
  );
});
//#endregion

//#region Utils.checkIntegerPositive
test("Utils.checkIntegerPositive: returns n if n is a safe positive integer else throw error", () => {
  expect(() => UtilsNumber.checkIntegerPositive(1.2)).toThrow();
  expect(() => UtilsNumber.checkIntegerPositive(-1.2)).toThrow();
  expect(UtilsNumber.checkIntegerPositive(0)).toBe(0);
  expect(() => UtilsNumber.checkIntegerPositive(-1)).toThrow();
  expect(UtilsNumber.checkIntegerPositive(1)).toBe(1);
});
//#endregion

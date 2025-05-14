import { describe, expect, test } from "vitest";
import { max } from "../app/intro";

describe("max function", () => {
    test("should return the larger number when second argument is larger", () => {
        expect(max(1, 2)).toBe(2);
    });

    test("should return the larger number when first argument is larger", () => {
        expect(max(5, 3)).toBe(5);
    });

    test("should return the same number when both arguments are equal", () => {
        expect(max(4, 4)).toBe(4);
    });

    test("should handle negative numbers correctly", () => {
        expect(max(-5, -2)).toBe(-2);
        expect(max(-1, -10)).toBe(-1);
    });

    test("should handle zero values", () => {
        expect(max(0, 5)).toBe(5);
        expect(max(-3, 0)).toBe(0);
    });
});
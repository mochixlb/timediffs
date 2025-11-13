import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const result = cn("foo", false && "bar", "baz");
    expect(result).toBe("foo baz");
  });

  it("should merge Tailwind classes with conflicts", () => {
    // Tailwind merge should resolve conflicts (last one wins)
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("should handle empty strings", () => {
    const result = cn("foo", "", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle undefined and null values", () => {
    const result = cn("foo", undefined, null, "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle arrays", () => {
    const result = cn(["foo", "bar"], "baz");
    expect(result).toBe("foo bar baz");
  });

  it("should handle objects", () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toBe("foo baz");
  });

  it("should handle complex combinations", () => {
    const result = cn(
      "base-class",
      ["array-class-1", "array-class-2"],
      { conditional: true, hidden: false },
      "px-2",
      "px-4" // Should override px-2
    );
    expect(result).toContain("base-class");
    expect(result).toContain("array-class-1");
    expect(result).toContain("array-class-2");
    expect(result).toContain("conditional");
    expect(result).not.toContain("hidden");
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
  });

  it("should return empty string for no arguments", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle Tailwind responsive classes correctly", () => {
    const result = cn("md:flex", "md:grid");
    // Tailwind merge should handle responsive variants
    expect(result).toContain("md:");
  });
});

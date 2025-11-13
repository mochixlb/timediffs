import { describe, it, expect, beforeEach } from "vitest";
import {
  parseCommand,
  getSuggestions,
  preInitializeSearchIndex,
} from "./command-parser";
import type { CommandIntent } from "./command-parser";

describe("parseCommand", () => {
  beforeEach(() => {
    // Pre-initialize search index for consistent test results
    preInitializeSearchIndex();
  });

  describe("add commands", () => {
    it("should parse simple add commands", () => {
      const result = parseCommand("New York");
      expect(result.type).toBe("add");
      if (result.type === "add") {
        expect(result.timezones.length).toBeGreaterThan(0);
        expect(result.timezones[0]).toBe("America/New_York");
      }
    });

    it('should parse "add" keyword', () => {
      const result = parseCommand("add New York");
      expect(result.type).toBe("add");
    });

    it('should parse "show" keyword', () => {
      const result = parseCommand("show Tokyo");
      expect(result.type).toBe("add");
    });

    it('should parse "what timezone is" pattern', () => {
      const result = parseCommand("what timezone is London");
      expect(result.type).toBe("add");
      if (result.type === "add") {
        expect(result.timezones[0]).toBe("Europe/London");
      }
    });

    it('should parse "timezone in" pattern', () => {
      const result = parseCommand("timezone in Paris");
      expect(result.type).toBe("add");
      if (result.type === "add") {
        expect(result.timezones[0]).toBe("Europe/Paris");
      }
    });

    it("should parse multiple locations separated by commas", () => {
      const result = parseCommand("New York, London, Tokyo");
      expect(result.type).toBe("add");
      if (result.type === "add") {
        expect(result.timezones.length).toBeGreaterThanOrEqual(3);
      }
    });

    it("should handle common aliases", () => {
      const result = parseCommand("NYC");
      expect(result.type).toBe("add");
      if (result.type === "add") {
        expect(result.timezones[0]).toBe("America/New_York");
      }
    });

    it("should handle city names with spaces", () => {
      const result = parseCommand("San Francisco");
      expect(result.type).toBe("add");
      if (result.type === "add") {
        expect(result.timezones.length).toBeGreaterThan(0);
      }
    });
  });

  describe("compare commands", () => {
    it('should parse "compare X with Y" pattern', () => {
      const result = parseCommand("compare New York with London");
      expect(result.type).toBe("compare");
      if (result.type === "compare") {
        expect(result.timezones.length).toBeGreaterThanOrEqual(2);
        expect(result.timezones).toContain("America/New_York");
        expect(result.timezones).toContain("Europe/London");
      }
    });

    it('should parse "X vs Y" pattern', () => {
      const result = parseCommand("Tokyo vs Paris");
      expect(result.type).toBe("compare");
      if (result.type === "compare") {
        expect(result.timezones.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should parse "X and Y" pattern', () => {
      const result = parseCommand("New York and London");
      expect(result.type).toBe("compare");
      if (result.type === "compare") {
        expect(result.timezones.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should parse "time difference between X and Y" pattern', () => {
      const result = parseCommand("time difference between Tokyo and New York");
      expect(result.type).toBe("compare");
      if (result.type === "compare") {
        expect(result.timezones.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe("remove commands", () => {
    it('should parse "remove X" pattern', () => {
      const result = parseCommand("remove New York");
      expect(result.type).toBe("remove");
      if (result.type === "remove") {
        expect(result.timezones.length).toBeGreaterThan(0);
        expect(result.timezones[0]).toBe("America/New_York");
      }
    });

    it('should parse "delete X" pattern', () => {
      const result = parseCommand("delete London");
      expect(result.type).toBe("remove");
    });

    it('should parse "hide X" pattern', () => {
      const result = parseCommand("hide Tokyo");
      expect(result.type).toBe("remove");
    });
  });

  describe("clear commands", () => {
    it('should parse "clear all" command', () => {
      const result = parseCommand("clear all");
      expect(result.type).toBe("clear");
    });

    it('should parse "remove all" command', () => {
      const result = parseCommand("remove all");
      expect(result.type).toBe("clear");
    });

    it('should parse "reset" command', () => {
      const result = parseCommand("reset");
      expect(result.type).toBe("clear");
    });
  });

  describe("edge cases", () => {
    it("should return unknown for empty string", () => {
      const result = parseCommand("");
      expect(result.type).toBe("unknown");
    });

    it("should return unknown for whitespace only", () => {
      const result = parseCommand("   ");
      expect(result.type).toBe("unknown");
    });

    it("should return unknown for invalid location", () => {
      const result = parseCommand("xyzabc123");
      expect(result.type).toBe("unknown");
    });

    it("should handle case-insensitive commands", () => {
      const result1 = parseCommand("NEW YORK");
      const result2 = parseCommand("new york");
      expect(result1.type).toBe("add");
      expect(result2.type).toBe("add");
    });

    it("should handle punctuation", () => {
      const result = parseCommand("New York!");
      expect(result.type).toBe("add");
    });

    it('should handle trailing "timezone" text', () => {
      const result = parseCommand("New York timezone");
      expect(result.type).toBe("add");
    });
  });

  describe("fuzzy matching", () => {
    it("should handle slight misspellings", () => {
      const result = parseCommand("New Yrok"); // Typo
      // Should still match New York
      expect(result.type).toBe("add");
    });

    it("should handle partial city names", () => {
      const result = parseCommand("San Fran");
      expect(result.type).toBe("add");
      if (result.type === "add") {
        expect(result.timezones.length).toBeGreaterThan(0);
      }
    });
  });
});

describe("getSuggestions", () => {
  beforeEach(() => {
    preInitializeSearchIndex();
  });

  it("should return empty array for input shorter than 2 characters", () => {
    const result = getSuggestions("N");
    expect(result).toEqual([]);
  });

  it("should return empty array for empty input", () => {
    const result = getSuggestions("");
    expect(result).toEqual([]);
  });

  it("should return suggestions for valid input", () => {
    const result = getSuggestions("New");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("timezone");
    expect(result[0]).toHaveProperty("type");
  });

  it("should limit results to default limit (5)", () => {
    const result = getSuggestions("New");
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("should respect custom limit", () => {
    const result = getSuggestions("New", 3);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("should return suggestions with correct structure", () => {
    const result = getSuggestions("London");
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("timezone");
      expect(result[0]).toHaveProperty("type");
      expect(["city", "country", "timezone"]).toContain(result[0].type);
    }
  });

  it("should handle case-insensitive input", () => {
    const result1 = getSuggestions("london");
    const result2 = getSuggestions("LONDON");
    expect(result1.length).toBeGreaterThan(0);
    expect(result2.length).toBeGreaterThan(0);
  });

  it("should return city suggestions when available", () => {
    const result = getSuggestions("Tokyo");
    const cityResults = result.filter((s) => s.type === "city");
    expect(cityResults.length).toBeGreaterThan(0);
  });

  it("should deduplicate suggestions", () => {
    const result = getSuggestions("New York");
    const names = result.map((s) => `${s.name}-${s.timezone}`);
    const uniqueNames = new Set(names);
    expect(names.length).toBe(uniqueNames.size);
  });
});

describe("preInitializeSearchIndex", () => {
  it("should initialize search index without errors", () => {
    expect(() => preInitializeSearchIndex()).not.toThrow();
  });

  it("should allow multiple calls without errors", () => {
    expect(() => {
      preInitializeSearchIndex();
      preInitializeSearchIndex();
      preInitializeSearchIndex();
    }).not.toThrow();
  });
});

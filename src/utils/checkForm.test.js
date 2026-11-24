import { describe, test, expect, vi, afterEach } from "vitest";
import { checkField, showDate, nextDateFor } from "./checkForm.js";

// These tests check the time rules on their own, without the form.
// I set the clock to a fixed day so the tests give the same answer every day:
// Tuesday 24 November 2026 at 10:00 in the morning.

afterEach(() => {
  vi.useRealTimers();
});

function setClock() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 24, 10, 0));
}

describe("checking the time", () => {
  test("you must choose a service before a time", () => {
    expect(checkField("visitTime", "", { service: "" })).toMatch(/choose a service first/i);
  });

  test("a time is needed once a service is chosen", () => {
    expect(checkField("visitTime", "", { service: "5" })).toBe("Please choose a time.");
  });

  test("a time that has already gone past today is not allowed", () => {
    setClock();
    const values = { service: "5", visitDate: "2026-11-24" };
    expect(checkField("visitTime", "08:00", values)).toMatch(/already gone past today/i);
    expect(checkField("visitTime", "10:00", values)).toMatch(/already gone past today/i);
  });

  test("a later time today is fine", () => {
    setClock();
    expect(checkField("visitTime", "14:00", { service: "5", visitDate: "2026-11-24" })).toBe("");
  });

  test("any time is fine on a day in the future", () => {
    setClock();
    expect(checkField("visitTime", "08:00", { service: "5", visitDate: "2026-11-25" })).toBe("");
  });
});

describe("dates", () => {
  test("showDate writes the date out in words", () => {
    expect(showDate("2026-10-19")).toBe("Monday 19 October 2026");
  });

  test("nextDateFor gives the next day with that name, never today", () => {
    setClock();
    // today is a Tuesday, so the next Tuesday is a week away
    expect(nextDateFor("Tuesday")).toBe("2026-12-01");
    expect(nextDateFor("Monday")).toBe("2026-11-30");
    expect(nextDateFor("Thursday")).toBe("2026-11-26");
  });
});

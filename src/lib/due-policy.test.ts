import { describe, expect, it } from "vitest";
import { FRONTS } from "@/data/goals";
import { updateGoalDue, updateKrDue } from "@/lib/due-policy";
import { useGoals } from "@/lib/store";

const front = FRONTS[0];
if (!front) throw new Error("Missing base goal");
const kr = front.krs[0];
if (!kr) throw new Error("Missing KR");
const dates = { [front.id]: "2026-12-11" };

describe("KR deadline policy", () => {
  it("refuses 13/12/2026 before confirmation when the goal closes on 11/12/2026", () => {
    expect(updateKrDue(dates, front, kr.id, "2026-12-13")).toBeNull();
    expect(dates[front.id]).toBe("2026-12-11");
  });
  it("sets both KR and goal to 13/12/2026 on confirmation", () => {
    const next = updateKrDue(dates, front, kr.id, "2026-12-13", true);
    expect(next?.[kr.id]).toBe("2026-12-13");
    expect(next?.[front.id]).toBe("2026-12-13");
  });
  it("accepts an earlier KR date without changing the goal", () => {
    const next = updateKrDue(dates, front, kr.id, "2026-12-10");
    expect(next?.[kr.id]).toBe("2026-12-10");
    expect(next?.[front.id]).toBe("2026-12-11");
  });
  it("accepts a KR date equal to its goal date", () => {
    expect(updateKrDue(dates, front, kr.id, "2026-12-11")?.[kr.id]).toBe("2026-12-11");
  });
  it("does not permit shortening the goal below a saved KR deadline", () => {
    expect(updateGoalDue({ ...dates, [kr.id]: "2026-12-11" }, front, front.id, "2026-12-10")).toBeNull();
  });
  it("clears only the selected KR date", () => {
    const next = updateKrDue({ ...dates, [kr.id]: "2026-12-10" }, front, kr.id, null);
    expect(next?.[kr.id]).toBeUndefined();
    expect(next?.[front.id]).toBe("2026-12-11");
  });
  it("updates the store atomically only after confirmation", () => {
    useGoals.setState({ dueDates: dates });
    expect(useGoals.getState().setKrDueDate(front.id, kr.id, "2026-12-13")).toBe(false);
    expect(useGoals.getState().dueDates[kr.id]).toBeUndefined();
    expect(useGoals.getState().setKrDueDate(front.id, kr.id, "2026-12-13", true)).toBe(true);
    expect(useGoals.getState().dueDates[front.id]).toBe("2026-12-13");
    expect(useGoals.getState().dueDates[kr.id]).toBe("2026-12-13");
    expect(useGoals.getState().setDueDate(front.id, "2026-12-11")).toBe(false);
    useGoals.setState({ dueDates: {} });
  });
});
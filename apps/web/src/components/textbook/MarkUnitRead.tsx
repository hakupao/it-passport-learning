// D-180 Task 12 — records the first read of a unit when its reader page mounts
// (UnitReader stays a server component). Renders nothing; markUnitRead keeps an
// existing first-read time, so repeated mounts change nothing.

"use client";

import { useEffect } from "react";

import { useLearningActions } from "@/hooks/useLearningRecord";

export function MarkUnitRead({ unitId }: { unitId: string }): null {
  const { readUnit } = useLearningActions();
  useEffect(() => {
    readUnit(unitId);
  }, [readUnit, unitId]);
  return null;
}

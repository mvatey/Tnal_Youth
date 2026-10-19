"use client";

import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/context/LanguageContext";

const EMPTY = { mode: "", level: "", branchId: "" };

/*
 * State and matching for the one-box "branch / branch level" filter (see
 * BranchAreaFilter), for list pages that filter rows by the branch each row
 * belongs to.
 *
 * - choices / value / setValue are what BranchAreaFilter takes.
 * - coverageIds is the set of branch ids the current pick matches, or null
 *   when nothing is picked: a plain branch pick is just that one branch; a
 *   level pick is that branch plus everything under it (province -> its
 *   districts and communes, district -> its communes, commune -> itself --
 *   the same rule as a regional secretary's coverage).
 * - exactBranchId is set only for a plain branch pick, for pages that can
 *   also hand a single branchId to the server.
 * - available is false until there is actually more than one branch to
 *   choose between (a one-branch account has nothing to filter).
 *
 * The branch list comes from /api/lookups/branch-areas, which only returns
 * branches the caller can access, so a role never sees outside its scope.
 */
export default function useBranchAreaFilter({ enabled = true } = {}) {
  const { label } = useLanguage();
  const [areas, setAreas] = useState([]);
  const [value, setValue] = useState(EMPTY);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const controller = new AbortController();

    fetch("/api/lookups/branch-areas", {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message);
        setAreas(
          Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [],
        );
      })
      .catch((error) => {
        if (error.name !== "AbortError") setAreas([]);
      });

    return () => controller.abort();
  }, [enabled]);

  const choices = useMemo(
    () =>
      areas.map((area) => ({
        id: String(area.id),
        level: String(area.levelCode || "").toUpperCase(),
        name: label(area, area.branchCode || ""),
      })),
    [areas, label],
  );

  const coverageIds = useMemo(() => {
    if (!value.branchId) {
      return null;
    }

    const selected = areas.find(
      (area) => String(area.id) === String(value.branchId),
    );

    if (!selected) {
      return null;
    }

    if (value.mode !== "level") {
      return new Set([String(selected.id)]);
    }

    const level = String(selected.levelCode || "").toUpperCase();

    return new Set(
      areas
        .filter((area) => {
          if (level === "PROVINCE") {
            return (
              area.provinceId != null && area.provinceId === selected.provinceId
            );
          }

          if (level === "DISTRICT") {
            return (
              area.districtId != null && area.districtId === selected.districtId
            );
          }

          return area.id === selected.id;
        })
        .map((area) => String(area.id)),
    );
  }, [areas, value]);

  return {
    choices,
    value,
    setValue,
    coverageIds,
    exactBranchId: value.mode === "branch" ? String(value.branchId) : "",
    available: enabled && areas.length > 1,
  };
}

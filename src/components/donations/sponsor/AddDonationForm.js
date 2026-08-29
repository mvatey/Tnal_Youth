"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AddDonationFilters from "@/components/donations/monthlydonation/AddDonationFilters";
import Table from "../../tables/table";
import MemberCard from "../eventdonation/membercard";
import CashCard from "./cashcard";
import BankCard from "./bankcard";
import Button from "../../forms/button";
import useCurrentMember from "@/hooks/useCurrentMember";
import { useBranch, useBranchChangeGuard } from "@/context/BranchContext";
import { useLanguage } from "@/context/LanguageContext";
import useUsdKhrExchangeRate from "@/lib/useUsdKhrExchangeRate";

const BANK_PAYMENT_METHODS = new Set([
  "Bank Transfer",
  "ABA",
  "Wing",
  "ACLEDA",
]);



const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
];

async function fetchJson(url, options) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  return body?.data ?? body;
}

function normalizeOptions(items, label) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    value: String(item.value ?? item.id),
    label: label(item, item.code || String(item.value ?? item.id)),
  }));
}

function mapMonthlyMember(member, branchLabel, month, year) {
  return {
    id: member.memberId,
    memberId: member.memberId,
    branch: branchLabel,
    branchId: member.branchId,
    month,
    year,
    name: member.fullNameKm || member.fullNameEn || member.memberNo || `#${member.memberId}`,
    avatar: member.profilePhotoId ? `/api/files/${member.profilePhotoId}/content` : "",
    gender: member.gender || "-",
    dob: member.dateOfBirth || "-",
    realAmount: member.amountKhr ?? "0",
    dollarAmount: member.amountUsd ?? "0",
    paymentMethodId: member.paymentMethodId ?? "",
    paymentMethod: member.paymentMethodCode || "",
    receiptFileId: member.receiptFileId ?? null,
    alreadyPaid: Boolean(member.alreadyPaid),
  };
}
export default function AddDonationForm() {
  const { t, label } = useLanguage();
  const exchangeRateKhrPerUsd = useUsdKhrExchangeRate();
  const {
    member: currentMember,
    loading: currentMemberLoading,
    error: currentMemberError,
  } = useCurrentMember();
  // A secretary/branch_leader can be assigned to more than one branch —
  // useBranch() is the same server-scoped "which branches can this account
  // access" source the monthly-donation list page uses (see DonationTable.js).
  // currentMember.branchId is kept only as a fallback for the brief window
  // before that context resolves.
  const {
    branches: accessibleBranches = [],
    selectedBranch: globalSelectedBranch = "all",
  } = useBranch();
  const isBranchScoped = ["secretary", "branch_leader"].includes(
    currentMember?.role,
  );
  // A secretary/branch_leader is always scoped to exactly ONE branch — the
  // one currently active in the sidebar's global branch dropdown (see
  // BranchContext) — never a branch picked independently in this form.
  // The accessibleBranches[0]/currentMember.branchId fallbacks only cover
  // the brief window before BranchContext's own fetch resolves.
  const effectiveBranchId = useMemo(() => {
    if (!isBranchScoped) return null;

    if (globalSelectedBranch && globalSelectedBranch !== "all") {
      return String(globalSelectedBranch);
    }

    if (accessibleBranches.length > 0) {
      return String(accessibleBranches[0].id);
    }

    return currentMember?.branchId ? String(currentMember.branchId) : null;
  }, [
    isBranchScoped,
    globalSelectedBranch,
    accessibleBranches,
    currentMember?.branchId,
  ]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation"
    : "/donation";
  const queryString = searchParams.toString();
  const initialFilters = useMemo(() => {
    const params = new URLSearchParams(queryString);

    return {
      branch: params.get("branch") || "all",
      month: params.get("month") || "all",
      year: params.get("year") || "all",
    };
  }, [queryString]);
  const [selectedBranch, setSelectedBranch] = useState(initialFilters.branch);
  const [selectedMonth, setSelectedMonth] = useState(initialFilters.month);
  const [selectedYear, setSelectedYear] = useState(initialFilters.year);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [editableRows, setEditableRows] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const allFiltersSelected =
  selectedBranch !== "all" &&
  selectedMonth !== "all" &&
  selectedYear !== "all";

  const branches = useMemo(() => {
    if (!isBranchScoped) return branchOptions;
    // Only the ONE currently-active branch — see effectiveBranchId above;
    // the (disabled — see branchScoped on AddDonationFilters below)
    // dropdown just displays it, never a pick list, for this role.
    return branchOptions.filter(
      (option) => String(option.value) === effectiveBranchId,
    );
  }, [branchOptions, isBranchScoped, effectiveBranchId]);

  // Recomputed on every render (cheap) instead of memoized with an empty
  // dep array, so a tab left open across a month/year boundary picks up
  // the new "today" instead of staying stuck on whatever date the page
  // first loaded with.
  const now = new Date();
  const currentYear = now.getFullYear();

  // No future years — 2026 shouldn't offer 2027+ yet. The upper bound is
  // always `currentYear`, so this needs no manual bump when the calendar
  // rolls over; only the (arbitrary) look-back window is fixed.
  const years = useMemo(() => {
    const lookBackYears = 3;
    return Array.from(
      { length: lookBackYears + 1 },
      (_, index) => String(currentYear - lookBackYears + index),
    );
  }, [currentYear]);

  // Nothing to pick until a year is chosen (see AddDonationFilters, which
  // asks for branch -> year -> month in that order). Always all 12 months.
  const months = useMemo(() => {
    if (!selectedYear || selectedYear === "all") return [];

    return KHMER_MONTHS.map((label, index) => ({
      value: String(index + 1).padStart(2, "0"),
      label,
    }));
  }, [selectedYear]);

const summary = useMemo(() => {
  const riel = editableRows.reduce(
    (total, row) => total + (Number(row.realAmount) || 0),
    0,
  );

  const dollar = editableRows.reduce(
    (total, row) => total + (Number(row.dollarAmount) || 0),
    0,
  );

  return {
    riel,
    dollar,
    totalDollar: dollar + riel / (exchangeRateKhrPerUsd || 4000),
  };
}, [editableRows]);

const paymentSummary = useMemo(
  () => ({
    cash: editableRows.filter((row) => row.paymentMethod === "Cash").length,
    bank: editableRows.filter((row) =>
      BANK_PAYMENT_METHODS.has(row.paymentMethod),
    ).length,
  }),
  [editableRows],
);


  useEffect(() => {
    if (currentMemberLoading) return undefined;

    let cancelled = false;
    Promise.all([
      fetchJson("/api/lookups/branches"),
      fetchJson("/api/lookups/payment-methods?activeOnly=true&includeMaterial=false"),
    ])
      .then(([branchItems, methodItems]) => {
        if (cancelled) return;
        const normalizedBranches = normalizeOptions(branchItems, label);
        setBranchOptions(normalizedBranches);
        if (isBranchScoped) {
          if (!effectiveBranchId) {
            throw new Error(t("donationPage.accountBranchNotSet"));
          }
          // Always the one currently-active branch (see effectiveBranchId
          // above) — switching branches happens only via the sidebar's
          // global dropdown now, which the effect below also reacts to.
          setSelectedBranch(effectiveBranchId);
        }
        setPaymentMethods((Array.isArray(methodItems) ? methodItems : []).map((method) => ({
          id: String(method.id),
          code: method.code,
          label: label(method, method.code),
        })));
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || t("donationPage.loadDonationOptionsFailed"));
      });
    return () => { cancelled = true; };
  }, [currentMemberLoading, isBranchScoped, effectiveBranchId, label, t]);

  // If the currently selected month falls out of the valid list — the
  // year changed, or that period just got recorded elsewhere — snap it
  // back to the placeholder instead of silently keeping an invalid value.
  useEffect(() => {
    if (selectedMonth === "all") return;
    if (!months.some((month) => month.value === selectedMonth)) {
      setSelectedMonth("all");
    }
  }, [months, selectedMonth]);

  useEffect(() => {
    if (!allFiltersSelected) {
      setEditableRows([]);
      return undefined;
    }

    let cancelled = false;
    const params = new URLSearchParams({
      branchId: selectedBranch,
      month: String(Number(selectedMonth)),
      year: selectedYear,
      page: "0",
      size: "100",
    });
    if (searchQuery.trim()) params.set("search", searchQuery.trim());

    setLoadingMembers(true);
    setError("");
    fetchJson(`/api/backend/donations/monthly/members?${params}`)
      .then((page) => {
        if (cancelled) return;
        const branchLabel = branchOptions.find((option) => option.value === selectedBranch)?.label || selectedBranch;
        setEditableRows((Array.isArray(page?.items) ? page.items : []).map((member) =>
          mapMonthlyMember(member, branchLabel, selectedMonth, selectedYear),
        ));
        setHasUnsavedEdits(false);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setEditableRows([]);
          setError(loadError.message || t("donationPage.loadBranchMembersFailed"));
        }
      })
      .finally(() => { if (!cancelled) setLoadingMembers(false); });

    return () => { cancelled = true; };
  }, [allFiltersSelected, branchOptions, searchQuery, selectedBranch, selectedMonth, selectedYear]);

  useEffect(() => {
    if (isBranchScoped) {
      // Always the one currently-active branch — ignore any ?branch= in
      // the URL for this role; the sidebar's global dropdown is the only
      // thing that switches branches now (see effectiveBranchId above).
      if (effectiveBranchId) {
        setSelectedBranch(effectiveBranchId);
      }
    } else {
      setSelectedBranch((currentBranch) =>
        currentBranch === initialFilters.branch
          ? currentBranch
          : initialFilters.branch,
      );
    }
    setSelectedMonth((currentMonth) =>
      currentMonth === initialFilters.month ? currentMonth : initialFilters.month,
    );
    setSelectedYear((currentYearValue) =>
      currentYearValue === initialFilters.year ? currentYearValue : initialFilters.year,
    );
  }, [initialFilters, isBranchScoped, effectiveBranchId]);

  // The whole list is editable at once now (see isRowLocked on <Table>
  // below — only an already-recorded member's row stays locked) and saved
  // together in one click, so "dirty" just means any row changed since it
  // was loaded. Used below to ask before the sidebar switches branches out
  // from under in-progress typing.
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  useBranchChangeGuard({
    isDirty: () => hasUnsavedEdits,
    onSave: () => handleSave(editableRows),
    onReset: () => setHasUnsavedEdits(false),
  });

  const handleSave = async (rows) => {
    // alreadyPaid rows are excluded even if their (pre-filled, historical)
    // amount is nonzero -- the backend batch endpoint only creates new
    // records and rejects the WHOLE batch if any one member already has a
    // donation for this period, so resubmitting one would block every
    // legitimate new entry alongside it.
    const completed = rows.filter(
      (row) => !row.alreadyPaid && (Number(row.realAmount) > 0 || Number(row.dollarAmount) > 0),
    );
    if (completed.length === 0) {
      setSavedMessage(t("donationPage.memberAmountRequired"));
      return false;
    }

    const fallbackMethod = paymentMethods[0];
    const items = completed.map((row) => {
      const method = paymentMethods.find(
        (option) =>
          String(option.id) === String(row.paymentMethodId) ||
          option.code === row.paymentMethod,
      ) || fallbackMethod;

      return {
        member_id: Number(row.memberId),
        amount_khr: Number(row.realAmount || 0),
        amount_usd: Number(row.dollarAmount || 0),
        payment_method_id: Number(method?.id),
        receipt_file_id: row.receiptFileId || null,
      };
    });

    if (items.some((item) => !Number.isFinite(item.payment_method_id))) {
      setError(t("donationPage.paymentMethodResolveFailed"));
      return false;
    }

    setSaving(true);
    setError("");
    try {
      await fetchJson("/api/backend/donations/monthly/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: Number(selectedBranch),
          donation_period: `${selectedYear}-${selectedMonth}-01`,
          paid_at: new Date().toISOString(),
          items,
        }),
      });
    } catch (saveError) {
      setError(saveError.message || t("donationPage.eventDonationSaveFailed"));
      return false;
    } finally {
      setSaving(false);
    }

    // Stay on the page (the rest of this month's sponsors are still right
    // there) rather than navigating away after a bulk save.
    setSavedMessage(t("donationPage.savedMemberCount").replace("{count}", completed.length));
    setHasUnsavedEdits(false);
    return true;
  };

  const handleReset = (rows) => {
    const ids = new Set(rows.map((row) => row.id));
    setEditableRows((currentRows) => currentRows.map((row) =>
      ids.has(row.id) ? { ...row, realAmount: "0", dollarAmount: "0" } : row,
    ));
  };

  const handleReceiptSave = (id, receipt) => {
    setEditableRows((currentRows) => currentRows.map((row) =>
      row.id === id ? { ...row, receipt } : row,
    ));

    setSavedMessage(t("donationPage.receiptSaved"));
  };

  const handleCancel = () => {
    router.push(listPath);
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-6 lg:gap-[50px]">
        <MemberCard
          label={t("donationPage.member")}
          value={`${editableRows.length} ${t("donationPage.personUnit")}`}
          growth="+15%"
          note="ក្នុងខែនេះ"
        />
        <CashCard
          label={t("donationPage.cashPayment")}
          value={`${paymentSummary.cash} ${t("donationPage.personUnit")}`}
          growth="+15%"
          note="ក្នុងខែនេះ"
        />
        <BankCard
          label={t("donationPage.bankPayment")}
          value={`${paymentSummary.bank} ${t("donationPage.personUnit")}`}
          growth="+15%"
          note="ក្នុងខែនេះ"
        />
      </div>

      <section className="min-h-[545px] rounded-md border border-border bg-bg-page-white p-6">
        {error || currentMemberError ? (
          <div className="mb-4 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
            {error || currentMemberError}
          </div>
        ) : null}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-secondary">{t("donationPage.sponsorDonationRecordTitle")}</h1>
          {savedMessage && (
            <p className="text-sm font-medium text-success" role="status">
              {savedMessage}
            </p>
          )}
          {/*
            The whole list is directly editable at once now (see
            isRowLocked on <Table> below), and <Table>'s own bulk action bar
            (AddDonationActions) also offers Reset/Cancel/Save — this
            page-level pair is a shortcut alongside that: "ត្រឡប់ក្រោយ"
            always works as a plain way back to the list, and "រក្សាទុក"
            saves every currently-entered amount without needing to scroll
            down to the table's own Save button.
          */}
          <div className="flex items-center gap-3">
            <Button action="cancel" label={t("donationPage.back")} onClick={handleCancel} />
            <Button
              action="save"
              onClick={() => handleSave(editableRows)}
              disabled={saving || !allFiltersSelected || editableRows.length === 0}
            />
          </div>
        </div>

        <AddDonationFilters
          branches={branches}
          months={months}
          years={years}
          selectedBranch={selectedBranch}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          searchQuery={searchQuery}
          onBranchChange={setSelectedBranch}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onSearchChange={setSearchQuery}
          // A secretary/branch_leader is now always scoped to exactly one
          // branch (switched only via the sidebar's global dropdown — see
          // effectiveBranchId above), so this lock applies unconditionally
          // for that role, same as the monthly donation list page.
          branchScoped={isBranchScoped}
        />

        {loadingMembers ? (
          <div className="py-12 text-center text-sm text-text-secondary">{t("donationPage.loadingMembers")}</div>
        ) : null}

        {allFiltersSelected && !loadingMembers && editableRows.length > 0 && (
        <>
          <Table
              members={editableRows}
              selectedBranch={selectedBranch}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              searchQuery={searchQuery}
              onRowsChange={(rows) => {
                setEditableRows(rows);
                setHasUnsavedEdits(true);
              }}
              onReset={handleReset}
              onCancel={handleCancel}
              onSave={handleSave}
              onReceiptSave={handleReceiptSave}
              saving={saving}
              // A member who already has a recorded donation for this
              // period stays locked (see isRowLocked doc in table.js) —
              // everyone else is editable at once, saved together below.
              isRowLocked={(member) => member.alreadyPaid}
         />

    <div
      className="ml-auto mt-5 w-full max-w-[360px] rounded-lg border border-border bg-bg-page-white p-4"
      aria-live="polite"
    >
      <h3 className="mb-3 font-bold text-secondary">
        {t("donationPage.contributionTotal")}
      </h3>

      <div className="flex justify-between gap-5 text-sm text-text-secondary">
        <span>{t("donationPage.totalDonationKhr")}</span>

        <span className="font-semibold text-text-primary">
          {summary.riel.toLocaleString()} ៛
        </span>
      </div>

      <div className="mt-2 flex justify-between gap-5 text-sm text-text-secondary">
        <span>{t("donationPage.totalDonationUsd")}</span>

        <span className="font-semibold text-text-primary">
          {summary.dollar.toFixed(2)} $
        </span>
      </div>

      <div className="mt-3 flex justify-between gap-5 border-t border-border pt-3 font-bold text-secondary">
        <span>{t("donationPage.totalAllUsd")}</span>

        <span>
          {summary.totalDollar.toFixed(2)} $
        </span>
      </div>
    </div>
  </>
)}
      </section>
    </>
  );
}

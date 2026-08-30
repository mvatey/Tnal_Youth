"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AddDonationFilters from "./AddDonationFilters";
import Table from "../../tables/table";
import MemberCard from "../eventdonation/membercard";
import CashCard from "./cashcard";
import BankCard from "./bankcard";
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

const PAYMENT_METHOD_LABELS = {
  CASH: "Cash",
  ABA: "ABA",
  WING: "Wing",
  BANK_TRANSFER: "Bank Transfer",
  ACLEDA: "ACLEDA",
};

function normalizePaymentMethodCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function paymentMethodLabelFromCode(code) {
  const normalized = normalizePaymentMethodCode(code);
  return PAYMENT_METHOD_LABELS[normalized] || code || "Cash";
}



const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
];

const ENGLISH_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

// /monthly-donations' member rows only ever carry a plain gender code
// string ("MALE"/"FEMALE"), not the {code, label_km, label_en} lookup
// object other endpoints return -- so it has to be translated by code
// directly, the same fix already applied to the activity member-invite
// pages, rather than via label()/localizedValue(), which has nothing to
// resolve here.
function resolveGenderLabel(gender, t) {
  const code = String(gender || "").toUpperCase();

  if (code === "MALE") {
    return t("memberPage.male");
  }

  if (code === "FEMALE") {
    return t("memberPage.femaleGender");
  }

  return gender || "-";
}

function mapMonthlyMember(member, branchLabel, month, year, locale, t) {
  return {
    id: member.memberId,
    memberId: member.memberId,
    branch: branchLabel,
    branchId: member.branchId,
    month,
    year,
    name:
      locale === "en"
        ? member.fullNameEn || member.fullNameKm || member.memberNo || `#${member.memberId}`
        : member.fullNameKm || member.fullNameEn || member.memberNo || `#${member.memberId}`,
    avatar: member.profilePhotoId ? `/api/files/${member.profilePhotoId}/content` : "",
    gender: resolveGenderLabel(member.gender, t),
    dob: member.dateOfBirth || "-",
    realAmount: member.amountKhr ?? "0",
    dollarAmount: member.amountUsd ?? "0",
    paymentMethodId: member.paymentMethodId ?? "",
    paymentMethod: paymentMethodLabelFromCode(member.paymentMethodCode),
    receiptFileId: member.receiptFileId ?? null,
    donationId: member.existingDonationId ?? null,
    alreadyPaid: Boolean(member.alreadyPaid),
  };
}
export default function AddDonationForm() {
  const { t, label, locale } = useLanguage();
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
  const effectiveRole = String(
    currentMember?.effectiveRole || currentMember?.role || "",
  ).toLowerCase();
  const isViewer =
    Boolean(currentMember?.isViewer) ||
    String(currentMember?.role || "").toLowerCase() === "viewer";
  const isBranchScoped = ["secretary", "branch_leader"].includes(effectiveRole);
  const canManageMonthlyDonation =
    !isViewer && ["secretary", "branch_leader"].includes(effectiveRole);
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

    const monthNames = locale === "en" ? ENGLISH_MONTHS : KHMER_MONTHS;

    return monthNames.map((monthLabel, index) => ({
      value: String(index + 1).padStart(2, "0"),
      label: monthLabel,
    }));
  }, [selectedYear, locale]);

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

const paymentSummary = useMemo(() => {
  const paidRows = editableRows.filter(
    (row) =>
      (Number(row.realAmount) || 0) > 0 ||
      (Number(row.dollarAmount) || 0) > 0,
  );

  const methodCodeFor = (row) => {
    const matchedMethod = paymentMethods.find(
      (option) =>
        String(option.id) === String(row.paymentMethodId) ||
        normalizePaymentMethodCode(option.code) ===
          normalizePaymentMethodCode(row.paymentMethod),
    );

    return String(matchedMethod?.code || row.paymentMethod || "CASH")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
  };

  const cash = paidRows.filter((row) =>
    ["CASH", "CASH_PAYMENT", "DIRECT", "DIRECT_PAYMENT"].includes(
      methodCodeFor(row),
    ),
  ).length;

  return {
    cash,
    bank: paidRows.length - cash,
  };
}, [editableRows, paymentMethods]);


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
          mapMonthlyMember(member, branchLabel, selectedMonth, selectedYear, locale, t),
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
  }, [allFiltersSelected, branchOptions, searchQuery, selectedBranch, selectedMonth, selectedYear, locale, t]);

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
    const completed = rows.filter(
      (row) => Number(row.realAmount) > 0 || Number(row.dollarAmount) > 0,
    );
    // A reset changes the visible amount to zero. Existing donations with
    // zero on this save must be removed; otherwise their old value returns
    // when the page reloads.
    const removedRows = rows.filter(
      (row) =>
        row.donationId &&
        Number(row.realAmount || 0) <= 0 &&
        Number(row.dollarAmount || 0) <= 0,
    );

    if (completed.length === 0 && removedRows.length === 0) {
      setSavedMessage(t("donationPage.memberAmountRequired"));
      return false;
    }

    if (!canManageMonthlyDonation) {
      setError(t("donationPage.noEditPermission"));
      return false;
    }

    const fallbackMethod = paymentMethods[0];
    const resolveMethod = (row) => {
      const selectedCode = normalizePaymentMethodCode(row.paymentMethod);

      // Prefer the CURRENT dropdown choice. Only fall back to the loaded id
      // when the select value does not resolve. This allows Cash -> ABA/Wing/Bank.
      return (
        paymentMethods.find(
          (option) =>
            normalizePaymentMethodCode(option.code) === selectedCode,
        ) ||
        paymentMethods.find(
          (option) => String(option.id) === String(row.paymentMethodId),
        ) ||
        fallbackMethod
      );
    };

    const newRows = completed.filter((row) => !row.donationId);
    const existingRows = completed.filter((row) => row.donationId);

    setSaving(true);
    setError("");

    try {
      await Promise.all(
        removedRows.map((row) =>
          fetchJson(
            `/api/backend/donations/monthly/${encodeURIComponent(row.donationId)}`,
            { method: "DELETE" },
          ),
        ),
      );

      if (newRows.length > 0) {
        const items = newRows.map((row) => {
          const method = resolveMethod(row);
          return {
            member_id: Number(row.memberId),
            amount_khr: Number(row.realAmount || 0),
            amount_usd: Number(row.dollarAmount || 0),
            payment_method_id: Number(method?.id),
            receipt_file_id: row.receiptFileId || null,
          };
        });

        if (items.some((item) => !Number.isFinite(item.payment_method_id))) {
          throw new Error(t("donationPage.paymentMethodResolveFailed"));
        }

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
      }

      await Promise.all(
        existingRows.map((row) => {
          const method = resolveMethod(row);
          if (!Number.isFinite(Number(method?.id))) {
            throw new Error(t("donationPage.paymentMethodResolveFailed"));
          }

          return fetchJson(
            `/api/backend/donations/monthly/${encodeURIComponent(row.donationId)}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount_khr: Number(row.realAmount || 0),
                amount_usd: Number(row.dollarAmount || 0),
                payment_method_id: Number(method.id),
                receipt_file_id: row.receiptFileId || null,
              }),
            },
          );
        }),
      );

      // Reload from backend so newly-created rows receive donationId and
      // edited rows reflect the canonical server values. They remain editable.
      const params = new URLSearchParams({
        branchId: selectedBranch,
        month: String(Number(selectedMonth)),
        year: selectedYear,
        page: "0",
        size: "100",
      });
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const page = await fetchJson(`/api/backend/donations/monthly/members?${params}`);
      const branchLabel =
        branchOptions.find((option) => option.value === selectedBranch)?.label ||
        selectedBranch;

      setEditableRows(
        (Array.isArray(page?.items) ? page.items : []).map((member) =>
          mapMonthlyMember(member, branchLabel, selectedMonth, selectedYear, locale, t),
        ),
      );

      setSavedMessage(
        t("donationPage.savedMemberCount").replace(
          "{count}",
          completed.length + removedRows.length,
        ),
      );
      setHasUnsavedEdits(false);
      window.dispatchEvent(new Event("tnal-youth:donations-updated"));
      return true;
    } catch (saveError) {
      setError(saveError.message || t("donationPage.saveMonthlyDonationFailed"));
      return false;
    } finally {
      setSaving(false);
    }
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
          note={t("dashboard.thisMonth")}
        />
        <CashCard
          label={t("donationPage.cashPayment")}
          value={`${paymentSummary.cash} ${t("donationPage.personUnit")}`}
          growth="+15%"
          note={t("dashboard.thisMonth")}
        />
        <BankCard
          label={t("donationPage.bankPayment")}
          value={`${paymentSummary.bank} ${t("donationPage.personUnit")}`}
          growth="+15%"
          note={t("dashboard.thisMonth")}
        />
      </div>

      <section className="min-h-[545px] min-w-0 rounded-md border border-border bg-bg-page-white p-4 sm:p-6">
        {error || currentMemberError ? (
          <div className="mb-4 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
            {error || currentMemberError}
          </div>
        ) : null}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-secondary">{t("donationPage.monthlyDonationRecordTitle")}</h1>
          {savedMessage && (
            <p className="text-sm font-medium text-success" role="status">
              {savedMessage}
            </p>
          )}
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
              readOnly={!canManageMonthlyDonation}
              // Saved monthly donations remain editable for ADMIN/SECRETARY/
              // BRANCH_LEADER. VIEWER accounts can see the rows but cannot edit.
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

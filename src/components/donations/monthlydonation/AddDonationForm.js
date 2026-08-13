"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AddDonationFilters from "./AddDonationFilters";
import Table from "../../tables/table";
import SaveAlert from "../../forms/savealert";
import MemberCard from "../eventdonation/membercard";
import CashCard from "./cashcard";
import BankCard from "./bankcard";
import useCurrentMember from "@/hooks/useCurrentMember";

const BANK_PAYMENT_METHODS = new Set([
  "Bank Transfer",
  "ABA",
  "Wing",
  "ACLEDA",
]);

const KHR_PER_USD = 4000;

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

function normalizeOptions(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    value: String(item.value ?? item.id),
    label: item.labelKm || item.nameKm || item.labelEn || item.nameEn || item.label || item.code || String(item.value ?? item.id),
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
  const {
    member: currentMember,
    loading: currentMemberLoading,
    error: currentMemberError,
  } = useCurrentMember();
  const isBranchScoped = ["secretary", "branch_leader"].includes(
    currentMember?.role,
  );
  const scopedBranchId = isBranchScoped ? currentMember?.branchId : null;
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
  const [showSaveAlert, setShowSaveAlert] = useState(false);
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
    return branchOptions.filter(
      (option) => String(option.value) === String(scopedBranchId),
    );
  }, [branchOptions, isBranchScoped, scopedBranchId]);
  const months = useMemo(
    () => KHMER_MONTHS.map((label, index) => ({
      value: String(index + 1).padStart(2, "0"),
      label,
    })),
    [],
  );
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, index) => String(current - 3 + index));
  }, []);

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
    totalDollar: dollar + riel / KHR_PER_USD,
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
        const normalizedBranches = normalizeOptions(branchItems);
        setBranchOptions(normalizedBranches);
        if (isBranchScoped) {
          if (!scopedBranchId) {
            throw new Error("គណនីនេះមិនទាន់បានកំណត់សាខា។");
          }
          setSelectedBranch(String(scopedBranchId));
        }
        setPaymentMethods((Array.isArray(methodItems) ? methodItems : []).map((method) => ({
          id: String(method.id),
          code: method.code,
          label: method.labelKm || method.labelEn || method.code,
        })));
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || "Unable to load donation options.");
      });
    return () => { cancelled = true; };
  }, [currentMemberLoading, isBranchScoped, scopedBranchId]);

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
      })
      .catch((loadError) => {
        if (!cancelled) {
          setEditableRows([]);
          setError(loadError.message || "Unable to load branch members.");
        }
      })
      .finally(() => { if (!cancelled) setLoadingMembers(false); });

    return () => { cancelled = true; };
  }, [allFiltersSelected, branchOptions, searchQuery, selectedBranch, selectedMonth, selectedYear]);

  useEffect(() => {
    if (isBranchScoped && scopedBranchId) {
      setSelectedBranch(String(scopedBranchId));
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
    setSelectedYear((currentYear) =>
      currentYear === initialFilters.year ? currentYear : initialFilters.year,
    );
  }, [initialFilters, isBranchScoped, scopedBranchId]);

  useEffect(() => {
    if (!showSaveAlert) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowSaveAlert(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showSaveAlert]);

  const handleSave = async (rows) => {
    const completed = rows.filter(
      (row) => Number(row.realAmount) > 0 || Number(row.dollarAmount) > 0,
    );
    if (completed.length === 0) {
      setSavedMessage("សូមបញ្ចូលចំនួនទឹកប្រាក់យ៉ាងហោចណាស់ម្នាក់");
      return;
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
      setError("មិនអាចកំណត់វិធីសាស្ត្រទូទាត់បានទេ");
      return;
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
      setShowSaveAlert(true);
    } catch (saveError) {
      setError(saveError.message || "Unable to save monthly donations.");
      return;
    } finally {
      setSaving(false);
    }

    setSavedMessage(
      completed.length > 0
        ? `បានរក្សាទុកវិភាគទាន ${completed.length} នាក់`
        : "សូមបញ្ចូលចំនួនទឹកប្រាក់យ៉ាងហោចណាស់ម្នាក់",
    );
    router.push(listPath);
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

    setSavedMessage("បានរក្សាទុកវិក្ក័យបត្រដោយជោគជ័យ");
  };

  const handleCancel = () => {
    router.push(listPath);
  };

  return (
    <>
      {showSaveAlert && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/25 pt-10"
          role="status"
          aria-live="polite"
        >
          <SaveAlert message="អបអរសាទរ វិភាគទានត្រូវបានបន្ថែមដោយជោគជ័យ" />
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-6 lg:gap-[50px]">
        <MemberCard
          label="សមាជិក"
          value={`${editableRows.length} នាក់`}
          growth="+15%"
          note="ក្នុងខែនេះ"
        />
        <CashCard
          label="ទូទាត់ដោយផ្ទាល់"
          value={`${paymentSummary.cash} នាក់`}
          growth="+15%"
          note="ក្នុងខែនេះ"
        />
        <BankCard
          label="ទូតាត់តាមធនាគារ"
          value={`${paymentSummary.bank} នាក់`}
          growth="+15%"
          note="ក្នុងខែនេះ"
        />
      </div>

      <section className="min-h-[545px] rounded-md border border-border bg-[#fbfbfd] p-6">
        {error || currentMemberError ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || currentMemberError}
          </div>
        ) : null}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-secondary">ការកត់ត្រាវិភាគទានប្រចាំខែ</h1>
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
          branchScoped={isBranchScoped}
       
        />

        {loadingMembers ? (
          <div className="py-12 text-center text-sm text-text-secondary">កំពុងទាញយកសមាជិក...</div>
        ) : null}

        {allFiltersSelected && !loadingMembers && editableRows.length > 0 && (
        <>
          <Table
              members={editableRows}
              selectedBranch={selectedBranch}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              searchQuery={searchQuery}
              onRowsChange={setEditableRows}
              onReset={handleReset}
              onCancel={handleCancel}
              onSave={handleSave}
              onReceiptSave={handleReceiptSave}
              saving={saving}
         />

    <div
      className="ml-auto mt-5 w-full max-w-[360px] rounded-lg border border-border bg-white p-4"
      aria-live="polite"
    >
      <h3 className="mb-3 font-bold text-secondary">
        សរុបវិភាគទាន
      </h3>

      <div className="flex justify-between gap-5 text-sm text-text-secondary">
        <span>សរុបវិភាគទាន (រៀល)</span>

        <span className="font-semibold text-text-primary">
          {summary.riel.toLocaleString()} ៛
        </span>
      </div>

      <div className="mt-2 flex justify-between gap-5 text-sm text-text-secondary">
        <span>សរុបវិភាគទាន ($)</span>

        <span className="font-semibold text-text-primary">
          {summary.dollar.toFixed(2)} $
        </span>
      </div>

      <div className="mt-3 flex justify-between gap-5 border-t border-border pt-3 font-bold text-secondary">
        <span>សរុបទាំងអស់ ($)</span>

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

// app/variable/page.js

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  SquarePlus,
  PlusCircle,
  Search,
  X,
  SquarePen,
  Calendar,
} from "lucide-react";

import { HiSaveAs } from "react-icons/hi";
import Button from "@/components/ui/Button";
import FormSelect from "@/components/forms/FormSelect";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { normalizeRole } from "@/lib/navigation";
import { khmerErrorMessage } from "@/lib/khmerErrorMessage";

const ALL_STATUS = "ALL";

// Special sidebar entry that isn't part of the generic /admin/lookups
// category list — Exchange Rate has its own dedicated backend endpoints
// and doesn't fit the labelKm/labelEn/active lookup shape.
const EXCHANGE_RATE_KEY = "__exchange-rate__";

const PAYMENT_METHOD_PATH = "payment-methods";

const POSITION_PATH = "positions";

// The role a member holding this position is auto-assigned when created —
// see CreateMemberModal's position picker. Every position maps to one of
// these three; positions like "Support" simply map to MEMBER.
const EMPTY_FORM = {
  nameKm: "",
  nameEn: "",
  description: "",
  status: "ACTIVE",
  category: "OTHER",
  mappedRole: "MEMBER",
};

// Fixed currency pair — this app tracks donations in USD/KHR, so the
// Exchange Rate tool assumes that pair. Revisit if more pairs are needed.
const RATE_FROM_CURRENCY = "USD";
const RATE_TO_CURRENCY = "KHR";

const EMPTY_RATE_FORM = {
  rate: "",
  effectiveFrom: "",
};

function StatusBadge({ active, t }) {
  return (
    <span
      className={`inline-flex min-w-[68px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium ${
        active
          ? "bg-success-bg text-success"
          : "bg-error-bg text-error"
      }`}
    >
      {active ? t("variablePage.active") : t("variablePage.inactive")}
    </span>
  );
}

function formatDateTime(value, locale = "km") {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "km-KH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatRate(value) {
  if (value === null || value === undefined || value === "") return "-";

  const number = Number(value);
  if (Number.isNaN(number)) return String(value);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(number);
}

const LOOKUPS_BASE = "/api/backend/admin/lookups";
const EXCHANGE_BASE = "/api/backend/exchange-rates";

async function requestJson(fullPath, options = {}) {
  const response = await fetch(fullPath, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object"
        ? body?.message || body?.detail || body?.error
        : body;

    throw new Error(
      khmerErrorMessage(message, `សំណើមិនបានសម្រេច (${response.status})`),
    );
  }

  return body;
}

export default function VariablePage() {
  const { user } = useAuth();
  const { t, label, locale } = useLanguage();
  const isViewer = normalizeRole(user?.role) === "viewer";
  const paymentCategoryOptions = useMemo(() => [
    { label: t("variablePage.cash"), value: "CASH" },
    { label: t("variablePage.bank"), value: "BANK" },
    { label: t("variablePage.other"), value: "OTHER" },
  ], [t]);
  const positionRoleOptions = useMemo(() => [
    { label: t("variablePage.branchLeader"), value: "BRANCH_LEADER" },
    { label: t("variablePage.secretary"), value: "SECRETARY" },
    { label: t("variablePage.member"), value: "MEMBER" },
  ], [t]);
  const statusFilterOptions = useMemo(() => [
    { label: t("variablePage.allStatuses"), value: ALL_STATUS },
    { label: t("variablePage.active"), value: "ACTIVE" },
    { label: t("variablePage.inactive"), value: "INACTIVE" },
  ], [t]);
  const statusOptions = useMemo(() => [
    { label: t("variablePage.active"), value: "ACTIVE" },
    { label: t("variablePage.inactive"), value: "INACTIVE" },
  ], [t]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [selectedPath, setSelectedPath] = useState("");

  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(ALL_STATUS);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Exchange rate state (separate flow — not a generic lookup category)
  const [rateHistory, setRateHistory] = useState([]);
  const [rateCount, setRateCount] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState("");

  const [showRateModal, setShowRateModal] = useState(false);
  const rateDateInputRef = useRef(null);
  const [rateForm, setRateForm] = useState(EMPTY_RATE_FORM);
  const [rateSaving, setRateSaving] = useState(false);
  const [rateFormError, setRateFormError] = useState("");

  // Collapsed by default: only the single most-recent rate shows (the
  // history query is already sorted newest-first — see
  // OrderByEffectiveFromDesc on the backend). Expanding reveals the full
  // from/to history in the same table. A search implies wanting to browse
  // history, so it forces the expanded view rather than hiding a match
  // inside a collapsed single row.
  const [showRateHistory, setShowRateHistory] = useState(false);

  const isExchangeSelected = selectedPath === EXCHANGE_RATE_KEY;
  const isPaymentMethod = selectedPath === PAYMENT_METHOD_PATH;
  const isPosition = selectedPath === POSITION_PATH;
  const hasExtraColumn = isPaymentMethod || isPosition;

  const selectedCategory = useMemo(
    () => categories.find((category) => category.path === selectedPath),
    [categories, selectedPath],
  );
  const selectedCategoryLabel = label(selectedCategory, t("variablePage.variableFallback"));
  const createSelectedLabel =
    locale === "en"
      ? `${t("variablePage.createPrefix")} ${t("variablePage.newSuffix")} ${selectedCategoryLabel}`
      : `${t("variablePage.createPrefix")}${selectedCategoryLabel}${t("variablePage.newSuffix")}`;
  const editSelectedLabel =
    locale === "en"
      ? `${t("variablePage.editPrefix")} ${selectedCategoryLabel}`
      : `${t("variablePage.editPrefix")}${selectedCategoryLabel}`;

  /* =======================================================
   * LOAD CATEGORIES
   * ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const data = await requestJson(`${LOOKUPS_BASE}/categories`);
        const list = Array.isArray(data) ? data : [];

        if (!active) return;

        setCategories(list);
        setSelectedPath((current) =>
          current && (current === EXCHANGE_RATE_KEY ||
            list.some((category) => category.path === current))
            ? current
            : list[0]?.path || "",
        );
      } catch (loadError) {
        if (active) {
          setCategoriesError(
            loadError.message || t("variablePage.loadCategoriesFailed"),
          );
        }
      } finally {
        if (active) setCategoriesLoading(false);
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, [t]);

  /* =======================================================
   * LOAD EXCHANGE RATE COUNT (for the sidebar badge — fetched
   * once up front, same as the generic category counts)
   * ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadRateCount() {
      try {
        const params = new URLSearchParams({
          from: RATE_FROM_CURRENCY,
          to: RATE_TO_CURRENCY,
        });

        const history = await requestJson(
          `${EXCHANGE_BASE}/history?${params.toString()}`,
        );

        if (active) {
          setRateCount(Array.isArray(history) ? history.length : 0);
        }
      } catch {
        if (active) setRateCount(0);
      }
    }

    loadRateCount();

    return () => {
      active = false;
    };
  }, []);

  /* =======================================================
   * LOAD ITEMS FOR THE SELECTED CATEGORY
   * ======================================================= */

  useEffect(() => {
    if (!selectedPath || selectedPath === EXCHANGE_RATE_KEY) {
      setItems([]);
      return undefined;
    }

    let active = true;

    async function loadItems() {
      try {
        setItemsLoading(true);
        setItemsError("");

        const params = new URLSearchParams({ status: selectedStatus });
        const data = await requestJson(
          `${LOOKUPS_BASE}/${selectedPath}?${params.toString()}`,
        );

        if (!active) return;

        setItems(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (active) {
          setItems([]);
          setItemsError(
            loadError.message || t("variablePage.loadItemsFailed"),
          );
        }
      } finally {
        if (active) setItemsLoading(false);
      }
    }

    loadItems();

    return () => {
      active = false;
    };
  }, [selectedPath, selectedStatus, t]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return items;

    return items.filter(
      (item) =>
        item.labelKm?.toLowerCase().includes(query) ||
        item.labelEn?.toLowerCase().includes(query) ||
        item.code?.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  const filteredRateHistory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return rateHistory
      .filter((rate) => {
        if (selectedStatus === "ACTIVE") return Boolean(rate.is_active);
        if (selectedStatus === "INACTIVE") return !rate.is_active;
        return true;
      })
      .filter((rate) => {
        if (!query) return true;

        return (
          formatRate(rate.rate).toLowerCase().includes(query) ||
          formatDateTime(rate.effective_from, locale).toLowerCase().includes(query)
        );
      });
  }, [locale, rateHistory, searchQuery, selectedStatus]);

  const isRateHistoryExpanded = showRateHistory || Boolean(searchQuery.trim());

  const visibleRateHistory = isRateHistoryExpanded
    ? filteredRateHistory
    : filteredRateHistory.slice(0, 1);

  /* =======================================================
   * REFRESH HELPERS
   * ======================================================= */

  async function refreshCategoryCounts() {
    try {
      const data = await requestJson(`${LOOKUPS_BASE}/categories`);
      if (Array.isArray(data)) setCategories(data);
    } catch {
      // Non-fatal — the sidebar counts just stay slightly stale.
    }
  }

  async function refreshItems() {
    if (!selectedPath || selectedPath === EXCHANGE_RATE_KEY) return;

    const params = new URLSearchParams({ status: selectedStatus });
    const data = await requestJson(
      `${LOOKUPS_BASE}/${selectedPath}?${params.toString()}`,
    );
    setItems(Array.isArray(data) ? data : []);
  }

  /* =======================================================
   * EXCHANGE RATE — LOAD HISTORY
   * ======================================================= */

  async function loadExchangeRateData() {
    try {
      setRateLoading(true);
      setRateError("");

      const params = new URLSearchParams({
        from: RATE_FROM_CURRENCY,
        to: RATE_TO_CURRENCY,
      });

      const history = await requestJson(
        `${EXCHANGE_BASE}/history?${params.toString()}`,
      );
      const list = Array.isArray(history) ? history : [];
      setRateHistory(list);
      setRateCount(list.length);
    } catch (loadError) {
      setRateError(
        loadError.message || t("variablePage.loadRateFailed"),
      );
    } finally {
      setRateLoading(false);
    }
  }

  useEffect(() => {
    if (selectedPath !== EXCHANGE_RATE_KEY) return;

    loadExchangeRateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPath]);

  /* =======================================================
   * MODAL — GENERIC LOOKUP ITEM
   * ======================================================= */

  function openCreateModal() {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingItem(item);

    setForm({
      nameKm: item.labelKm || "",
      nameEn: item.labelEn || "",
      description: item.description || "",
      status: item.active ? "ACTIVE" : "INACTIVE",
      category: item.category || "OTHER",
      mappedRole: item.mappedRole || "MEMBER",
    });

    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function updateField(field) {
    return (event) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.nameKm.trim()) {
      setFormError(t("variablePage.nameKmRequired"));
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingItem) {
        await requestJson(`${LOOKUPS_BASE}/${selectedPath}/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify({
            labelKm: form.nameKm.trim(),
            labelEn: form.nameEn.trim() || null,
            description: form.description.trim() || null,
            sortOrder: editingItem.sortOrder ?? null,
            ...(isPaymentMethod ? { category: form.category } : {}),
            ...(isPosition ? { mappedRole: form.mappedRole } : {}),
          }),
        });

        const nextActive = form.status === "ACTIVE";
        const currentActive = Boolean(editingItem.active);

        if (nextActive !== currentActive) {
          await requestJson(
            `${LOOKUPS_BASE}/${selectedPath}/${editingItem.id}/status`,
            {
              method: "PATCH",
              body: JSON.stringify({ active: nextActive }),
            },
          );
        }
      } else {
        await requestJson(`${LOOKUPS_BASE}/${selectedPath}`, {
          method: "POST",
          body: JSON.stringify({
            labelKm: form.nameKm.trim(),
            labelEn: form.nameEn.trim() || null,
            description: form.description.trim() || null,
            active: form.status === "ACTIVE",
            ...(isPaymentMethod ? { category: form.category } : {}),
            ...(isPosition ? { mappedRole: form.mappedRole } : {}),
          }),
        });
      }

      await refreshItems();
      await refreshCategoryCounts();
      closeModal();
    } catch (saveError) {
      setFormError(saveError.message || t("variablePage.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
   * MODAL — EXCHANGE RATE
   * ======================================================= */

  function openRateModal() {
    setRateForm(EMPTY_RATE_FORM);
    setRateFormError("");
    setShowRateModal(true);
  }

  function closeRateModal() {
    if (rateSaving) return;

    setShowRateModal(false);
    setRateForm(EMPTY_RATE_FORM);
    setRateFormError("");
  }

  function updateRateField(field) {
    return (event) => {
      setRateForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };
  }

  async function handleRateSubmit(event) {
    event.preventDefault();

    const numericRate = Number(rateForm.rate);

    if (!rateForm.rate || Number.isNaN(numericRate) || numericRate <= 0) {
      setRateFormError(t("variablePage.invalidRate"));
      return;
    }

    if (!rateForm.effectiveFrom) {
      setRateFormError(t("variablePage.effectiveFromRequired"));
      return;
    }

    try {
      setRateSaving(true);
      setRateFormError("");

      await requestJson(EXCHANGE_BASE, {
        method: "POST",
        body: JSON.stringify({
          from_currency: RATE_FROM_CURRENCY,
          to_currency: RATE_TO_CURRENCY,
          rate: rateForm.rate,
          effective_from: rateForm.effectiveFrom,
        }),
      });

      await loadExchangeRateData();
      closeRateModal();
    } catch (saveError) {
      setRateFormError(saveError.message || t("variablePage.saveRateFailed"));
    } finally {
      setRateSaving(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-110px)] min-w-0 flex-col gap-5 lg:flex-row">
      {/* Left variable categories */}
      <aside className="w-full shrink-0 rounded-xl border border-border bg-bg-page-white p-3 lg:w-[250px]">
        <h2 className="px-3 py-2 text-lg font-semibold text-text-primary">
          {t("variablePage.categories")}
        </h2>

        {categoriesError && (
          <div className="mx-3 mb-2 rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-xs text-error">
            {categoriesError}
          </div>
        )}

        <div className="mt-2 space-y-1">
          {categoriesLoading && categories.length === 0 ? (
            <p className="px-3 py-3 text-xs text-text-secondary">
              {t("variablePage.loading")}
            </p>
          ) : (
            categories.map((category) => {
              const active = category.path === selectedPath;

              return (
                <button
                  key={category.path}
                  type="button"
                  onClick={() => {
                    setSelectedPath(category.path);
                    setSearchQuery("");
                    setSelectedStatus(ALL_STATUS);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border-l-2 px-3 py-3 text-left text-sm transition ${
                    active
                      ? "border-secondary bg-secondary-light text-secondary"
                      : "border-transparent text-text-secondary hover:bg-bg-page-gray"
                  }`}
                >
                  <span className="truncate">{label(category)}</span>

                  <span className="ml-3 inline-flex min-w-7 items-center justify-center rounded-md bg-primary-light px-2 py-1 text-[10px] text-primary">
                    {category.count}
                  </span>
                </button>
              );
            })
          )}

          {/* Exchange Rate — separate flow, not part of the generic
              /admin/lookups categories list */}
          <button
            type="button"
            onClick={() => {
              setSelectedPath(EXCHANGE_RATE_KEY);
              setSearchQuery("");
              setSelectedStatus(ALL_STATUS);
            }}
            className={`flex w-full items-center justify-between rounded-lg border-l-2 px-3 py-3 text-left text-sm transition ${
              isExchangeSelected
                ? "border-secondary bg-secondary-light text-secondary"
                : "border-transparent text-text-secondary hover:bg-bg-page-gray"
            }`}
          >
            <span className="truncate">{t("variablePage.exchangeRate")}</span>

            <span className="ml-3 inline-flex min-w-7 items-center justify-center rounded-md bg-primary-light px-2 py-1 text-[10px] text-primary">
              {rateCount ?? 0}
            </span>
          </button>
        </div>
      </aside>

      {/* Right content */}
      <section className="min-w-0 flex-1">
        {isExchangeSelected ? (
          <div className="rounded-xl border border-border bg-bg-page-white">
            <div className="border-b border-border p-4">
              <h1 className="text-lg font-semibold text-text-primary">
                {t("variablePage.exchangeRateTitle")}
              </h1>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="relative w-full min-w-0 flex-1 sm:min-w-[260px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t("variablePage.searchPlaceholder")}
                    className="h-10 w-full rounded-lg border border-border bg-bg-page-white pl-10 pr-4 text-sm outline-none transition focus:border-primary"
                  />
                </div>

                <div className="w-full sm:w-[180px]">
                  <FormSelect
                    name="variable-status-filter"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    placeholder=""
                    options={statusFilterOptions}
                  />
                </div>

                {!isViewer && <Button
                  type="button"
                  variant="success"
                  icon={<PlusCircle size={16} />}
                  onClick={openRateModal}
                >
                  {t("variablePage.setNewRate")}
                </Button>}
              </div>
            </div>

            {rateError && (
              <div className="mx-4 mt-4 rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
                {rateError}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] table-fixed border-collapse">
                <thead className="bg-bg-page-gray">
                  <tr className="border-b border-border">
                    <th className="w-[7%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                      {t("variablePage.no")}
                    </th>

                    <th className="w-[24%] px-4 py-3 text-left text-xs font-medium text-text-secondary">
                      {t("variablePage.rate")}
                    </th>

                    <th className="w-[16%] px-4 py-3 text-left text-xs font-medium text-text-secondary">
                      {t("variablePage.currency")}
                    </th>

                    <th className="w-[12%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                      {t("variablePage.status")}
                    </th>

                    <th className="w-[20%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                      {t("variablePage.effectiveFrom")}
                    </th>

                    <th className="w-[21%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                      {t("variablePage.effectiveTo")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rateLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-text-secondary"
                      >
                        {t("variablePage.loadingData")}
                      </td>
                    </tr>
                  ) : visibleRateHistory.length > 0 ? (
                    visibleRateHistory.map((rate, index) => (
                      <tr
                        key={rate.id ?? index}
                        className="border-b border-border last:border-b-0 hover:bg-bg-page-gray"
                      >
                        <td className="px-4 py-3 text-center text-sm text-text-secondary">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3 text-sm font-medium text-text-primary">
                          {formatRate(rate.rate)} KHR
                        </td>

                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {rate.from_currency || RATE_FROM_CURRENCY} →{" "}
                          {rate.to_currency || RATE_TO_CURRENCY}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <StatusBadge active={rate.is_active} t={t} />
                        </td>

                        <td className="px-4 py-3 text-center text-xs text-text-secondary">
                          {formatDateTime(rate.effective_from, locale)}
                        </td>

                        <td className="px-4 py-3 text-center text-xs text-text-secondary">
                          {formatDateTime(rate.effective_to, locale)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-text-secondary"
                      >
                        {t("variablePage.noData")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!searchQuery.trim() && filteredRateHistory.length > 1 && (
              <div className="border-t border-border p-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowRateHistory((current) => !current)}
                  className="text-sm font-semibold text-primary transition hover:opacity-80"
                >
                  {showRateHistory
                    ? t("variablePage.hideHistory")
                    : `${t("variablePage.viewAllHistory")} (${filteredRateHistory.length - 1})`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-bg-page-white">
            <div className="border-b border-border p-4">
              <h1 className="text-lg font-semibold text-text-primary">
                {label(selectedCategory, t("variablePage.title"))}
              </h1>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="relative w-full min-w-0 flex-1 sm:min-w-[260px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t("variablePage.searchPlaceholder")}
                    className="h-10 w-full rounded-lg border border-border bg-bg-page-white pl-10 pr-4 text-sm outline-none transition focus:border-primary"
                  />
                </div>

                <div className="w-full sm:w-[180px]">
                  <FormSelect
                    name="variable-status-filter"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    placeholder=""
                    options={statusFilterOptions}
                  />
                </div>

                {!isViewer && <Button
                  type="button"
                  variant="success"
                  icon={<PlusCircle size={16} />}
                  onClick={openCreateModal}
                  disabled={!selectedPath}
                >
                  {createSelectedLabel}
                </Button>}
              </div>
            </div>

            {itemsError && (
              <div className="mx-4 mt-4 rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
                {itemsError}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] table-fixed border-collapse">
                <thead className="bg-bg-page-gray">
                  <tr className="border-b border-border">
                    <th className="w-[6%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                      {t("variablePage.no")}
                    </th>

                    <th className="w-[14%] px-4 py-3 text-left text-xs font-medium text-text-secondary">
                      {t("variablePage.nameKm")}
                    </th>

                    <th className="w-[14%] px-4 py-3 text-left text-xs font-medium text-text-secondary">
                      {t("variablePage.nameEn")}
                    </th>

                    {isPaymentMethod && (
                      <th className="w-[10%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                        {t("variablePage.category")}
                      </th>
                    )}

                    {isPosition && (
                      <th className="w-[13%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                        {t("variablePage.role")}
                      </th>
                    )}

                    <th className="w-[11%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                      {t("variablePage.status")}
                    </th>

                    <th className="w-[13%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                      {t("variablePage.createdAt")}
                    </th>

                    <th className="w-[13%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                      {t("variablePage.updatedAt")}
                    </th>

                    {!isViewer && (
                      <th className="w-[7%] px-4 py-3 text-center text-xs font-medium text-text-secondary">
                        {t("variablePage.actions")}
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {itemsLoading ? (
                    <tr>
                      <td
                        colSpan={(hasExtraColumn ? 7 : 6) + (isViewer ? 0 : 1)}
                        className="px-4 py-12 text-center text-sm text-text-secondary"
                      >
                        {t("variablePage.loadingData")}
                      </td>
                    </tr>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-border last:border-b-0 hover:bg-bg-page-gray"
                      >
                        <td className="px-4 py-3 text-center text-sm text-text-secondary">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3 text-sm font-medium text-text-primary">
                          {item.labelKm || "-"}
                        </td>

                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {item.labelEn || "-"}
                        </td>

                        {isPaymentMethod && (
                          <td className="px-4 py-3 text-center text-xs text-text-secondary">
                            {paymentCategoryOptions.find(
                              (option) => option.value === item.category,
                            )?.label || item.category || "-"}
                          </td>
                        )}

                        {isPosition && (
                          <td className="px-4 py-3 text-center text-xs text-text-secondary">
                            {positionRoleOptions.find(
                              (option) => option.value === item.mappedRole,
                            )?.label || item.mappedRole || "-"}
                          </td>
                        )}

                        <td className="px-4 py-3 text-center">
                          <StatusBadge active={item.active} t={t} />
                        </td>

                        <td className="px-4 py-3 text-center text-xs text-text-secondary">
                          {formatDateTime(item.createdAt, locale)}
                        </td>

                        <td className="px-4 py-3 text-center text-xs text-text-secondary">
                          {formatDateTime(item.updatedAt, locale)}
                        </td>

                        {!isViewer && (
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-warning transition hover:bg-warning-bg"
                              aria-label={t("variablePage.edit")}
                            >
                              <SquarePen size={19} strokeWidth={1.8} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={(hasExtraColumn ? 7 : 6) + (isViewer ? 0 : 1)}
                        className="px-4 py-12 text-center text-sm text-text-secondary"
                      >
                        {t("variablePage.noData")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Create/Edit modal — generic lookup item */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-[580px] rounded-xl bg-bg-page-white shadow-2xl">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="flex items-start justify-between px-7 pb-3 pt-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-text-secondary">
                    {editingItem ? editSelectedLabel : createSelectedLabel}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-bg-page-gray"
                  aria-label={t("variablePage.close")}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-5 px-7 pb-7">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    {t("variablePage.nameKmFull")}
                  </label>

                  <input
                    type="text"
                    value={form.nameKm}
                    onChange={updateField("nameKm")}
                    placeholder={t("variablePage.enterNameKm")}
                    className="h-11 w-full rounded-lg border border-border px-4 text-sm leading-6 outline-none transition placeholder:text-text-mute focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    {t("variablePage.nameEnFull")}
                  </label>

                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={updateField("nameEn")}
                    placeholder={t("variablePage.enterNameEn")}
                    className="h-11 w-full rounded-lg border border-border px-4 text-sm leading-6 outline-none transition placeholder:text-text-mute focus:border-primary"
                  />
                </div>

                {isPaymentMethod && (
                  <FormSelect
                    label={t("variablePage.paymentCategory")}
                    name="variable-payment-category"
                    value={form.category}
                    onChange={updateField("category")}
                    placeholder=""
                    options={paymentCategoryOptions}
                  />
                )}

                {isPosition && (
                  <FormSelect
                    label={t("variablePage.mappedRole")}
                    name="variable-position-role"
                    value={form.mappedRole}
                    onChange={updateField("mappedRole")}
                    placeholder=""
                    options={positionRoleOptions}
                  />
                )}

                <FormSelect
                  label={t("variablePage.status")}
                  name="variable-status"
                  value={form.status}
                  onChange={updateField("status")}
                  placeholder=""
                  options={statusOptions}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    {t("variablePage.description")}
                  </label>

                  <textarea
                    value={form.description}
                    onChange={updateField("description")}
                    placeholder={t("variablePage.descriptionPlaceholder")}
                    rows={4}
                    className="min-h-[125px] w-full resize-none rounded-lg border border-border px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-text-mute focus:border-primary"
                  />
                </div>

                {formError && (
                  <p className="text-sm text-error">{formError}</p>
                )}

                {/* Footer */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="flex h-11 w-[120px] shrink-0 items-center justify-center rounded-lg border border-border bg-bg-page-gray text-sm font-semibold text-text-secondary transition hover:bg-bg-page-gray/70 disabled:opacity-60"
                  >
                    {t("variablePage.cancel")}
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {editingItem ? (
                      <HiSaveAs size={17} />
                    ) : (
                      <SquarePlus size={17} />
                    )}

                    {saving
                      ? t("variablePage.saving")
                      : editingItem
                        ? t("variablePage.save")
                        : t("variablePage.create")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create modal — exchange rate */}
      {showRateModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRateModal();
            }
          }}
        >
          <div className="w-full max-w-[480px] rounded-xl bg-bg-page-white shadow-2xl">
            <form onSubmit={handleRateSubmit}>
              <div className="flex items-start justify-between px-7 pb-3 pt-6">
                <h2 className="text-xl font-bold text-text-secondary">
                  {t("variablePage.setNewExchangeRate")}
                </h2>

                <button
                  type="button"
                  onClick={closeRateModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-bg-page-gray"
                  aria-label={t("variablePage.close")}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 px-7 pb-7">
                <p className="rounded-lg bg-bg-page-gray px-4 py-2 text-sm text-text-secondary">
                  {t("variablePage.usdToKhr")}
                </p>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    {t("variablePage.rateInputLabel")}
                  </label>

                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    value={rateForm.rate}
                    onChange={updateRateField("rate")}
                    placeholder={t("variablePage.ratePlaceholder")}
                    className="h-11 w-full rounded-lg border border-border px-4 text-sm leading-6 outline-none transition placeholder:text-text-mute focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    {t("variablePage.effectiveFromFull")}
                  </label>

                  {/*
                    globals.css hides the native calendar icon everywhere
                    (`input[type="date"]::-webkit-calendar-picker-indicator`)
                    and shrinks its real click target to an 18px box tucked
                    in the corner — it's meant to sit invisibly under a
                    field's own icon (see FormControl.js/KhmerDateField.js),
                    not to be the only way in. Without a paired icon here,
                    clicking the field did nothing. Same fix as those:
                    a visible icon plus showPicker() on click, so the whole
                    field opens the picker.
                  */}
                  <div className="relative">
                    <input
                      ref={rateDateInputRef}
                      type="date"
                      value={rateForm.effectiveFrom}
                      onChange={updateRateField("effectiveFrom")}
                      onClick={() => rateDateInputRef.current?.showPicker?.()}
                      className="h-11 w-full rounded-lg border border-border px-4 pr-10 text-sm leading-6 outline-none transition focus:border-primary"
                    />

                    <Calendar
                      size={18}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-mute"
                    />
                  </div>
                </div>

                {rateFormError && (
                  <p className="text-sm text-error">{rateFormError}</p>
                )}

                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={closeRateModal}
                    disabled={rateSaving}
                    className="flex h-11 w-[120px] shrink-0 items-center justify-center rounded-lg border border-border bg-bg-page-gray text-sm font-semibold text-text-secondary transition hover:bg-bg-page-gray/70 disabled:opacity-60"
                  >
                    {t("variablePage.cancel")}
                  </button>

                  <button
                    type="submit"
                    disabled={rateSaving}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    <SquarePlus size={17} />

                    {rateSaving ? t("variablePage.saving") : t("variablePage.save")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

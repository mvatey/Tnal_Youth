"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import DataTable from "@/components/table/DataTable.js";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
import ButtonSeeDetail from "@/components/forms/ButtonSeeDetail.js";
import { useLanguage } from "@/context/LanguageContext";

const TYPE_BADGE_STYLES = {
  INTERNAL:
    "bg-primary-light text-primary",

  EXTERNAL:
    "bg-success-bg text-success",

  កម្មវិធីផ្ទៃក្នុង:
    "bg-primary-light text-primary",

  កម្មវិធីខាងក្រៅ:
    "bg-success-bg text-success",
};

const STATUS_BADGE_STYLES = {
  PRESENT:
    "bg-success-bg text-success",

  ATTENDED:
    "bg-success-bg text-success",

  ABSENT:
    "bg-error-bg text-error",

  បានចូលរួម:
    "bg-success-bg text-success",

  មិនបានចូលរួម:
    "bg-error-bg text-error",
};

async function fetchJson(
  path,
  signal,
) {
  const response = await fetch(
    `/api${path}`,
    {
      method: "GET",

      headers: {
        Accept:
          "application/json",
      },

      cache: "no-store",
      signal,
    },
  );

  const text =
    await response.text();

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
        ? body?.message ||
          body?.detail ||
          body?.error
        : body;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

function getLabel(value, locale = "km") {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  const khmer = value?.label_km || value?.labelKm || value?.name_km ||
    value?.nameKm || value?.title_km || value?.titleKm;
  const english = value?.label_en || value?.labelEn || value?.name_en ||
    value?.nameEn || value?.title_en || value?.titleEn;

  return locale === "en"
    ? english || khmer || value?.name || value?.code || ""
    : khmer || english || value?.name || value?.code || "";
}


function getLocationLabel(value, locale = "km") {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value !== "object") {
    return String(value);
  }

  const nameKm = value?.name_km || value?.nameKm || value?.label_km || value?.labelKm;
  const nameEn = value?.name_en || value?.nameEn || value?.label_en || value?.labelEn;
  const addressKm = value?.address_km || value?.addressKm;
  const addressEn = value?.address_en || value?.addressEn;
  const name = locale === "en"
    ? nameEn || nameKm || value?.name || ""
    : nameKm || nameEn || value?.name || "";
  const address = locale === "en"
    ? addressEn || addressKm || value?.address || ""
    : addressKm || addressEn || value?.address || "";

  if (name && address && name !== address) {
    return `${name} - ${address}`;
  }

  return name || address || "";
}

function getCode(value) {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string"
  ) {
    return value.toUpperCase();
  }

  return String(
    value?.code ||
      value?.value ||
      "",
  ).toUpperCase();
}

function mapParticipation(item, locale) {
  const activity =
    item?.activity || {};

  const type =
    item?.type ||
    item?.activity_type ||
    item?.activityType ||
    activity?.type ||
    "";

  const attendance =
    item?.attendance_status ||
    item?.attendanceStatus ||
    item?.status ||
    "";

  const typeCode =
    getCode(type);

  const attendanceCode =
    getCode(attendance);

  return {
    id:
      item?.id ??
      item?.participation_id ??
      item?.participationId,

    activityId:
      item?.activity_id ??
      item?.activityId ??
      activity?.id,

    activity: locale === "en"
      ? item?.activity_title_en || item?.activityTitleEn || item?.activity_name_en ||
        item?.activityNameEn || activity?.title_en || activity?.titleEn ||
        activity?.name_en || activity?.nameEn || item?.activity_title_km ||
        item?.activityTitleKm || item?.activity_name_km || item?.activityNameKm ||
        activity?.title_km || activity?.titleKm || activity?.name_km || activity?.nameKm ||
        activity?.title || "-"
      : item?.activity_title_km || item?.activityTitleKm || item?.activity_name_km ||
        item?.activityNameKm || activity?.title_km || activity?.titleKm ||
        activity?.name_km || activity?.nameKm || item?.activity_title_en ||
        item?.activityTitleEn || activity?.title_en || activity?.titleEn || activity?.title || "-",

    sector:
      getLabel(
        item?.sector ||
          item?.activity_sector ||
          item?.activitySector ||
          activity?.sector, locale,
      ) || "-",

    type:
      getLabel(type, locale) || "-",

    typeCode,

    status:
      getLabel(attendance, locale) ||
      "-",

    statusCode:
      attendanceCode,

    location:
      getLocationLabel(
        item?.location_name ||
          item?.locationName ||
          activity?.location_name ||
          activity?.locationName ||
          activity?.location ||
          item?.location, locale,
      ) || "-",

    date:
      item?.attended_on ||
      item?.attendedOn ||
      item?.participation_date ||
      item?.participationDate ||
      item?.activity_date ||
      item?.activityDate ||
      activity?.starts_at ||
      activity?.startsAt ||
      activity?.date ||
      "-",
  };
}

export default function ParticipationPage() {
  const { t, label, locale } = useLanguage();

  const params =
    useParams();

  const router =
    useRouter();

  const memberId =
    Array.isArray(params?.id)
      ? params.id[0]
      : params?.id;

  const [
    participations,
    setParticipations,
  ] = useState([]);

  const [
    activityTypes,
    setActivityTypes,
  ] = useState([]);

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    debouncedQuery,
    setDebouncedQuery,
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * Debounce search
   */
  useEffect(() => {
    const timeoutId =
      window.setTimeout(
        () => {
          setDebouncedQuery(
            query.trim(),
          );
        },
        350,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [query]);

  /*
   * Load activity type dropdown
   *
   * GET /api/lookups/activity-types
   */
  useEffect(() => {
    const controller =
      new AbortController();

    async function loadActivityTypes() {
      try {
        const data =
          await fetchJson(
            "/lookups/activity-types",
            controller.signal,
          );

        console.log(
          "Activity type lookup:",
          data,
        );

        const list =
          Array.isArray(data)
            ? data
            : Array.isArray(
                  data?.data,
                )
              ? data.data
              : Array.isArray(
                    data?.content,
                  )
                ? data.content
                : [];

        setActivityTypes(
          list,
        );
      } catch (fetchError) {
        if (
          fetchError.name !==
          "AbortError"
        ) {
          console.error(
            "Cannot load activity types:",
            fetchError,
          );

          setActivityTypes([]);
        }
      }
    }

    loadActivityTypes();

    return () => {
      controller.abort();
    };
  }, []);

  /*
   * Load participation table
   *
   * GET
   * /api/members/{memberId}/participations
   */
  useEffect(() => {
    if (!memberId) {
      setParticipations(
        [],
      );

      setLoading(false);

      return undefined;
    }

    const controller =
      new AbortController();

    async function loadParticipations() {
      try {
        setLoading(true);
        setError("");

        const searchParams =
          new URLSearchParams({
            page: "0",
            size: "100",
          });

        if (debouncedQuery) {
          searchParams.set(
            "search",
            debouncedQuery,
          );
        }

        /*
         * Backend expects:
         *
         * typeId=<Short>
         */
        if (typeFilter) {
          searchParams.set(
            "typeId",
            typeFilter,
          );
        }

        const content = [];
        let page = 0;
        let totalPages = 1;

        do {
          searchParams.set("page", String(page));
          const data = await fetchJson(
            `/members/${memberId}/participations?${searchParams.toString()}`,
            controller.signal,
          );
          content.push(...(Array.isArray(data?.content) ? data.content : []));
          totalPages = Math.max(1, Number(data?.totalPages) || 1);
          page += 1;
        } while (page < totalPages);

        setParticipations(
          content.map((item) => mapParticipation(item, locale)),
        );
      } catch (fetchError) {
        if (
          fetchError.name !==
          "AbortError"
        ) {
          console.error(
            "Cannot load participation:",
            fetchError,
          );

          setError(
            fetchError.message ||
              t("memberPage.loadParticipationFailed"),
          );

          setParticipations(
            [],
          );
        }
      } finally {
        if (
          !controller
            .signal
            .aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadParticipations();

    return () => {
      controller.abort();
    };
  }, [
    memberId,
    debouncedQuery,
    typeFilter,
    t,
    locale,
  ]);

  /*
   * Build FormSelect options
   * from /lookups/activity-types
   */
  const typeOptions =
    useMemo(
      () =>
        activityTypes
          .map((type) => {
            const id =
              type?.id ??
              type?.type_id ??
              type?.typeId ??
              type?.value ??
              "";

            const typeLabel =
              label(type, type?.code || "");

            return {
              label: typeLabel,
              value:
                id !== ""
                  ? String(id)
                  : "",
            };
          })
          .filter(
            (type) =>
              type.value !== "" &&
              type.label !== "",
          ),
      [activityTypes, label],
    );

  const handleViewDetail =
    (item) => {
      if (!item?.activityId) {
        console.warn(
          "Activity ID missing:",
          item,
        );

        return;
      }

      router.push(
        `/activity/${item.activityId}`,
      );
    };

  const columns = [
    {
      header: t("memberPage.no"),
      width: "w-[5%]",
      align: "center",

      render: (_, index) =>
        index,
    },

    {
      header:
        t("memberPage.activityName"),

      width: "w-[16%]",
      align: "left",

      render: (item) => (
        <span className="block w-full truncate font-medium text-text-secondary">
          {item.activity}
        </span>
      ),
    },

    {
      header: t("memberPage.type"),
      width: "w-[13%]",
      align: "center",

      render: (item) => (
        <span
          className={`
            inline-flex
            max-w-full
            items-center
            justify-center
            truncate
            whitespace-nowrap
            rounded-full
            px-2
            py-1
            text-[11px]
            ${
              TYPE_BADGE_STYLES[
                item.typeCode
              ] ||
              TYPE_BADGE_STYLES[
                item.type
              ] ||
              "bg-bg-page-gray text-text-secondary"
            }
          `}
        >
          {item.type}
        </span>
      ),
    },

    {
      header: t("memberPage.attendance"),
      width: "w-[12%]",
      align: "center",

      render: (item) => (
        <span
          className={`
            inline-flex
            max-w-full
            items-center
            justify-center
            truncate
            whitespace-nowrap
            rounded-full
            px-2
            py-1
            text-[11px]
            ${
              STATUS_BADGE_STYLES[
                item.statusCode
              ] ||
              STATUS_BADGE_STYLES[
                item.status
              ] ||
              "bg-bg-page-gray text-text-secondary"
            }
          `}
        >
          {item.status}
        </span>
      ),
    },

    {
      header: t("memberPage.location"),
      width: "w-[25%]",
      align: "left",

      render: (item) => (
        <span className="block w-full truncate">
          {item.location}
        </span>
      ),
    },

    {
      header: t("memberPage.joinedAt"),
      width: "w-[10%]",
      align: "left",

      render: (item) => (
        <span className="block w-full truncate">
          {item.date}
        </span>
      ),
    },

    {
      header: t("memberPage.actions"),
      width: "w-[19%]",
      align: "center",

      render: (item) => (
        <ButtonSeeDetail
          onClick={() =>
            handleViewDetail(
              item,
            )
          }
        />
      ),
    },
  ];

  const filters = [
    {
      name:
        "activityType",

      value:
        typeFilter,

      onChange:
        setTypeFilter,

      options:
        typeOptions,

      placeholder:
        t("memberPage.type"),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[250px] items-center justify-center">
        <p className="text-sm text-text-secondary">
          {t("memberPage.loadingParticipation")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-error/30 bg-bg-page-white p-6 text-center">
        <p className="text-sm text-error">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <h2 className="mb-4 text-lg font-bold text-primary">
        {t("memberPage.participationHistory")}
      </h2>

      <DataTable
        data={
          participations
        }
        columns={
          columns
        }
        filters={
          filters
        }
        searchQuery={
          query
        }
        onSearchChange={
          setQuery
        }
        searchPlaceholder={t("memberPage.search")}
        pageSize={10}
        minTableWidth={560}
        emptyMessage={t("memberPage.noRecordsFound")}
        onDownload={() =>
          downloadTableAsExcel({
            data: participations,
            columns,
            fileName: t("memberPage.participationFile").replace("{id}", params.id),
          })
        }
      />
    </div>
  );
}

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

function getLabel(value) {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  return (
    value?.label_km ||
    value?.labelKm ||
    value?.name_km ||
    value?.nameKm ||
    value?.title_km ||
    value?.titleKm ||
    value?.label_en ||
    value?.labelEn ||
    value?.name_en ||
    value?.nameEn ||
    value?.name ||
    value?.code ||
    ""
  );
}


function getLocationLabel(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value !== "object") {
    return String(value);
  }

  const name =
    value?.name_km ||
    value?.nameKm ||
    value?.name_en ||
    value?.nameEn ||
    value?.name ||
    value?.label_km ||
    value?.labelKm ||
    value?.label_en ||
    value?.labelEn ||
    "";

  const address =
    value?.address_km ||
    value?.addressKm ||
    value?.address_en ||
    value?.addressEn ||
    value?.address ||
    "";

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

function mapParticipation(item) {
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

    activity:
      item?.activity_title_km ||
      item?.activityTitleKm ||
      item?.activity_name_km ||
      item?.activityNameKm ||
      activity?.title_km ||
      activity?.titleKm ||
      activity?.name_km ||
      activity?.nameKm ||
      activity?.title ||
      "-",

    sector:
      getLabel(
        item?.sector ||
          item?.activity_sector ||
          item?.activitySector ||
          activity?.sector,
      ) || "-",

    type:
      getLabel(type) || "-",

    typeCode,

    status:
      getLabel(attendance) ||
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
          item?.location,
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
          content.map(
            mapParticipation,
          ),
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
              "មិនអាចទាញយកប្រវត្តិការចូលរួមបានទេ",
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

            const label =
              type?.label_km ||
              type?.labelKm ||
              type?.name_km ||
              type?.nameKm ||
              type?.label_en ||
              type?.labelEn ||
              type?.name_en ||
              type?.nameEn ||
              type?.code ||
              "";

            return {
              label,
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
      [activityTypes],
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
      header: "ល.រ",
      width: "w-[5%]",
      align: "center",

      render: (_, index) =>
        index + 1,
    },

    {
      header:
        "ឈ្មោះកម្មវិធី",

      width: "w-[21%]",
      align: "left",

      render: (item) => (
        <span className="block w-full truncate font-medium text-text-secondary">
          {item.activity}
        </span>
      ),
    },

    {
      header: "វិស័យ",
      width: "w-[11%]",
      align: "left",

      render: (item) => (
        <span className="block w-full truncate">
          {item.sector}
        </span>
      ),
    },

    {
      header: "ប្រភេទ",
      width: "w-[14%]",
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
      header: "ការចូលរួម",
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
      header: "ទីតាំង",
      width: "w-[14%]",
      align: "left",

      render: (item) => (
        <span className="block w-full truncate">
          {item.location}
        </span>
      ),
    },

    {
      header: "ថ្ងៃចូលរួម",
      width: "w-[14%]",
      align: "left",

      render: (item) => (
        <span className="block w-full truncate">
          {item.date}
        </span>
      ),
    },

    {
      header: "សកម្មភាព",
      width: "w-[8%]",
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
        "ប្រភេទ",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[250px] items-center justify-center">
        <p className="text-sm text-text-secondary">
          កំពុងទាញយកប្រវត្តិការចូលរួម...
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
        ប្រវត្តិការចូលរួមសកម្មភាព
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
        searchPlaceholder="ស្វែងរក..."
        pageSize={10}
        onDownload={() =>
          downloadTableAsExcel({
            data: participations,
            columns,
            fileName: `ការចូលរួមសកម្មភាព-សមាជិក-${params.id}`,
          })
        }
      />
    </div>
  );
}

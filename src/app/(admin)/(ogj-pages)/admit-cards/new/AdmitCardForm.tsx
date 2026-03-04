"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"

import { Form } from "@/components/shadcn/ui/form"
import { Card, CardContent, CardHeader } from "@/components/shadcn/ui/card"
import { Button } from "@/components/shadcn/ui/button"

import { StepContent } from "./StepContent"
import { StepSEOAndAI } from "./StepSEOAndAI"
import { StepReviewAndSubmit } from "./StepReviewAndSubmit"
import { StepBasicInfo } from "./StepBasicInfo"
import { createEntity, getPaginatedEntity, updateEntity } from "@/lib/api/global/Generic"
import { IAdmitCard } from "@/app/helper/interfaces/IAdmitCard"
import { ADMIT_CARDS_API, CATEGORY_API, JOBS_API, NEWS_AND_NTFN_API, ORGANIZATION_API, STATE_API } from "@/app/envConfig"
import { AdmitCardFormValues, AdmitCardSchema } from "@/lib/schemas/AdmitCardSchema"
import { IJob } from "@/app/helper/interfaces/IJob"
import { IOrganization } from "@/app/helper/interfaces/IOrganization"
import { ICategory } from "@/app/helper/interfaces/ICategory"
import { IState } from "@/app/helper/interfaces/IState"
import { INewsAndNtfn } from "@/app/helper/interfaces/INewsAndNtfn"

interface Props {
  isAdmin: boolean;
  initialValues?: any;
  onSubmit?: (values: any) => Promise<any>;
  isEditMode?: boolean;
}

export const stepValidationMap: Record<number, any[]> = {
  0: ["title", "examName", "status", "lifecycleStatus", "jobId", "organizationId", "categoryId", "stateIds", "newsAndNotificationIds", "isFeatured", 
    "releaseDate", "examStartDate", "examEndDate", "modeOfExam", "examShifts", "examLocation",],

  1: ["descriptionJson", "dynamicFields", "cardTags", "tagIds", "importantDates", "importantLinks", "helpfullVideoLinks"], //"importantInstructions"

  2: ["seoSettings.metaTitle", "seoSettings.metaDescription", "seoSettings.seoKeywords", "seoSettings.seoCanonicalUrl", "seoSettings.schemaMarkupJson"],

  3: ["publishedAt"],
}

const admitCardDefaultValues = {
  title: "",
  examName: "",

  descriptionJson: null,
  descriptionHtml: null,

  organizationId: "",
  categoryId: null,

  status: "upcoming",
  lifecycleStatus: "draft",

  /* ================= Dates ================= */

  releaseDate: null,
  examStartDate: null,
  examEndDate: null,
  publishedAt: null,

  /* ================= Exam Details ================= */

  modeOfExam: null,

  examShifts: [],

  examLocation: null,

  // importantInstructions: [],

  /* ================= Relations ================= */

  jobId: null,
  relatedJobIds: [],

  stateIds: [],
  tagIds: [],
  newsAndNotificationIds: [],

  jobSnapshot: null,

  /* ================= Content Blocks ================= */

  cardTags: [],
  helpfullVideoLinks: [],

  importantDates: [],

  importantLinks: [],

  /* ================= Dynamic ================= */

  dynamicFields: [],

  /* ================= SEO ================= */

  seoSettings: {
    metaTitle: "",
    metaDescription: "",
    seoKeywords: [],
    seoCanonicalUrl: "",
    schemaMarkupJson: {},
  },

  /* ================= Flags ================= */

  isFeatured: false,

  /* ================= Admin ================= */
  lastUpdatedBy: null,
};

const normalizeDynamicFieldsFromApi = (fields: unknown) => {
  if (!Array.isArray(fields)) return [];

  return fields.map((rawField) => {
    if (!rawField || typeof rawField !== "object") return rawField;

    const field = rawField as Record<string, any>;
    const type = String(field.type ?? "");
    const label = String(field.label ?? "");
    const meta = field.meta && typeof field.meta === "object" ? field.meta : undefined;

    // Recover richtext fields that came back as legacy json + meta.originalType=richtext
    if (type === "json" && meta?.originalType === "richtext") {
      return {
        ...field,
        label,
        type: "richtext",
        value: {
          json: field.value ?? null,
          html: typeof meta?.html === "string" ? meta.html : "",
        },
      };
    }

    // Normalize richtext value shape to { json, html } expected by editor binding.
    if (type === "richtext") {
      const rawValue = field.value;
      if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
        return {
          ...field,
          label,
          type: "richtext",
          value: { json: rawValue ?? null, html: "" },
        };
      }

      const richValue = rawValue as Record<string, unknown>;
      const hasJson = "json" in richValue;
      const hasHtml = "html" in richValue;
      if (!hasJson || !hasHtml) {
        return {
          ...field,
          label,
          type: "richtext",
          value: {
            json: hasJson ? richValue.json : rawValue,
            html: typeof richValue.html === "string" ? richValue.html : "",
          },
        };
      }
    }

    return {
      ...field,
      label,
      type,
    };
  });
};

const mergeInitialWithDefaults = (initialValues?: any) => {
  if (!initialValues) return admitCardDefaultValues;

  return {
    ...admitCardDefaultValues,
    ...initialValues,
    dynamicFields: normalizeDynamicFieldsFromApi(initialValues?.dynamicFields),
    seoSettings: {
      ...admitCardDefaultValues.seoSettings,
      ...(initialValues?.seoSettings || {}),
    },
  };
};

export function AdmitCardForm({ isAdmin, initialValues, onSubmit, isEditMode }: Props) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const organizationsQuery = useQuery({
    queryKey: ["admit-card-form", "organizations"],
    queryFn: () => getPaginatedEntity<IOrganization>("type=organizations&page=1", ORGANIZATION_API, { entityName: "organizations" }),
  });
  const categoriesQuery = useQuery({
    queryKey: ["admit-card-form", "categories"],
    queryFn: () => getPaginatedEntity<ICategory>("type=categories&page=1", CATEGORY_API, { entityName: "categories" }),
  });
  const statesQuery = useQuery({
    queryKey: ["admit-card-form", "states"],
    queryFn: () => getPaginatedEntity<IState>("type=states&page=1", STATE_API, { entityName: "states" }),
  });
  const newsAndNotificationsQuery = useQuery({
    queryKey: ["admit-card-form", "news-and-notifications"],
    queryFn: () =>
      getPaginatedEntity<INewsAndNtfn>("type=news-and-notifications&page=1", NEWS_AND_NTFN_API, {
        entityName: "newsAndNotifications",
      }),
  });
  const jobsQuery = useQuery({
    queryKey: ["admit-card-form", "jobs"],
    queryFn: () => getPaginatedEntity<IJob>("type=jobs&page=1", JOBS_API, { entityName: "jobs" }),
  });

  const organizations = organizationsQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];
  const allStates = statesQuery.data?.data ?? [];
  const allNewsAndNotifications = newsAndNotificationsQuery.data?.data ?? [];
  const jobs = jobsQuery.data?.data ?? [];

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("AdmitCardForm : Initial values for form:", initialValues);
    }
  }, [initialValues]);

  const form = useForm<AdmitCardFormValues>({
    resolver: zodResolver(AdmitCardSchema),
    defaultValues: mergeInitialWithDefaults(initialValues),
    mode: "onTouched",
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(mergeInitialWithDefaults(initialValues));
    }
  }, [initialValues]);

  const handleJobChange = (jobId: string | null) => {
    const previousJobId = form.getValues("jobId");

    // CASE 1: switching FROM mapped → manual
    if (!jobId) {
      form.setValue("jobId", null, { shouldDirty: true });
      return; // snapshot stays manual
    }

    // CASE 2: same job re-selected → do nothing
    if (jobId === previousJobId) return;

    if (typeof window !== "undefined") {
      const shouldProceed = window.confirm(
        "Selecting a related job will overwrite auto-fill fields from the selected job. Continue?"
      );
      if (!shouldProceed) return;
    }

    // CASE 3: new job selected → autofill snapshot
    const selectedJob = jobs.find(j => j.id === jobId);
    if (!selectedJob) return;

    form.setValue("jobId", jobId, { shouldDirty: true });

    form.setValue("jobSnapshot", {
      advtNumber: selectedJob.advtNumber ?? "",
      sector: selectedJob.sector ?? "",
      qualificationSummary: selectedJob.qualificationSummary ?? "",
      totalVacancies: selectedJob.totalVacancies ?? undefined,
      jobType: selectedJob.jobType ?? "",
      ageLimitText: selectedJob.ageLimitText ?? "",
      applicationFee: selectedJob.applicationFee ?? "",
      minAge: selectedJob.minAge ?? undefined,
      maxAge: selectedJob.maxAge ?? undefined,
    }, { shouldDirty: true });
  };



  const steps = [
    <StepBasicInfo onJobChange={handleJobChange} jobs={jobs} organizations={organizations} categories={categories}
     allStates={allStates} allNewsAndNotifications={allNewsAndNotifications} key="basic" />,

    <StepContent key="content" />,

    <StepSEOAndAI key="seo-ai" />,
    
    <StepReviewAndSubmit key="review" isAdmin={isAdmin} />,
  ];

  async function nextStep() {
    if (step >= steps.length - 1) return;

    const valid = await form.trigger(stepValidationMap[step]);
    if (!valid) {
      console.error("Validation errors:", form.formState.errors);
      return;
    }

    setStep((s) => s + 1);
  }

  function prevStep() {
    setStep((s) => s - 1);
  }

  async function handleSubmit(values: any) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const normalizeDynamicFieldsForApi = (fields: any[] | null | undefined) => {
        if (!Array.isArray(fields)) return fields;

        const isObjectRow = (row: unknown): row is Record<string, unknown> =>
          !!row && typeof row === "object" && !Array.isArray(row);
        const toCellValue = (value: unknown): string | number | boolean | null => {
          if (value === null) return null;
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
          if (value === undefined) return "";
          return String(value);
        };

        return fields.map((field) => {
          if (!field || typeof field !== "object") return field;
          if (field.type !== "table") return field;

          const valueRows = Array.isArray(field.value) ? field.value : [];
          const isObjectRows = valueRows.length > 0 && valueRows.every(isObjectRow);
          const isMatrixRows = valueRows.length > 0 && valueRows.every((r: unknown) => Array.isArray(r));

          const columnsFromMeta = Array.isArray(field.meta?.columns)
            ? field.meta.columns.map((c: unknown) => String(c ?? ""))
            : null;
          const columnsFromField = Array.isArray(field.columns)
            ? field.columns.map((c: unknown) => String(c ?? ""))
            : null;
          let columns: string[] = columnsFromMeta?.length ? columnsFromMeta : columnsFromField?.length ? columnsFromField : [];
          let value: Record<string, string | number | boolean | null>[] = [];

          if (isObjectRows) {
            value = (valueRows as Record<string, unknown>[]).map((row) =>
              Object.fromEntries(
                Object.entries(row).map(([key, cell]) => [String(key), toCellValue(cell)])
              )
            );
            if (!columns.length) {
              const keySet = new Set<string>();
              value.forEach((row) => Object.keys(row).forEach((k) => keySet.add(k)));
              columns = Array.from(keySet);
            }
          } else {
            const rawMatrix =
              isMatrixRows
                ? (valueRows as unknown[][])
                : Array.isArray(field.rows)
                ? (field.rows as unknown[][])
                : [];

            const matrix = rawMatrix.map((row) =>
              Array.isArray(row) ? row.map((cell) => toCellValue(cell)) : [toCellValue(row)]
            );
            const fallbackColCount = Math.max(1, matrix[0]?.length ?? 0);
            if (!columns.length) {
              columns = Array.from({ length: fallbackColCount }, (_, i) => `Col ${i + 1}`);
            }
            value = matrix.map((row) =>
              Object.fromEntries(columns.map((col, idx) => [col, toCellValue(row[idx])]))
            );
          }

          return {
            ...field,
            rows: value.map((row) => columns.map((col) => String(row[col] ?? ""))),
            columns,
            value,
          };
        });
      };

      const payload = {
        ...values,
        dynamicFields: normalizeDynamicFieldsForApi(values.dynamicFields),
      };

      let res;
      if (isEditMode && initialValues && initialValues.id) {
        res = await updateEntity<IAdmitCard>(ADMIT_CARDS_API, initialValues?.id, payload, { entityName: "AdmitCard" });
        if (res.success) setSuccess("Admit Card updated successfully!");
      } else {
        res = await createEntity<IAdmitCard>(ADMIT_CARDS_API, payload, { entityName: "AdmitCard" });
        if (res.success) setSuccess("Admit Card created successfully!");
      }
      if (!res.success) setError(res.message || "Failed to submit");
      
      if (!isEditMode && res.success) {
        form.reset(admitCardDefaultValues);
      }

      if (onSubmit) await onSubmit(payload);
    } catch (e: any) {
      setError(e.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  }

  const getLoadingLabel = () => {
    return isEditMode ? "Saving..." : "Submitting...";
  };

  const getSubmitLabel = () => {
    if (isEditMode) return "Update";
    if (isAdmin) return "Publish";
    return "Submit for Review";
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit, (errors) => {
            console.log("FORM SUBMIT ERRORS:", errors);
            console.log("FORM STATE ERRORS:", form.formState.errors);
          })}
        >
          <Card className="">
            <CardHeader />
            <CardContent className="space-y-6">
              {steps[step]}

              <div className="flex justify-between pt-6">
                {/* Back Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 0}
                >
                  Back
                </Button>

                {/* Next / Submit Button */}
                {step === steps.length - 1 ? (
                  <Button type="submit" disabled={loading}>
                    {loading ? getLoadingLabel() : getSubmitLabel()}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      void nextStep();
                    }}
                    disabled={loading}
                  >
                    Next
                  </Button>
                )}

              </div>

              {/* Messages */}
              {error && (
                <div className="text-red-500 font-medium">{error}</div>
              )}
              {success && (
                <div className="text-green-600 font-medium">{success}</div>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/shadcn/ui/form"
import { Card, CardContent, CardHeader } from "@/components/shadcn/ui/card"
import { Button } from "@/components/shadcn/ui/button"

import { StepContent } from "./StepContent"
import { StepSEOAndAI } from "./StepSEOAndAI"
import { StepReviewAndSubmit } from "./StepReviewAndSubmit"
import { StepBasicInfo } from "./StepBasicInfo"
import { REVIEW_STATUS } from "../../../../helper/dto/global"
import { createEntity, getPaginatedEntity, updateEntity } from "@/lib/api/global/Generic"
import { AdmitCardStatus, IAdmitCard } from "@/app/helper/interfaces/IAdmitCard"
import { ADMIT_CARDS_API, JOBS_API } from "@/app/envConfig"
import { AdmitCardSchema } from "@/lib/schemas/AdmitCardSchema"
import { IJob } from "@/app/helper/interfaces/IJob"
import { AdmitCardFormDTO } from "@/app/helper/dto/AdmitCardFormDTO"

interface Props {
  isAdmin: boolean;
  initialValues?: any;
  onSubmit?: (values: any) => Promise<any>;
  isEditMode?: boolean;
}

export const stepValidationMap: Record<number, any[]> = {
  0: ["title", "examName", "status", "jobId", "organizationId", "categoryId", "stateIds", "newsAndNotificationIds", "isFeatured", 
    "releaseDate", "examStartDate", "examEndDate", "modeOfExam", "examShifts", "examLocation", "jobSnapshot",],

  1: ["descriptionJson", "dynamicFields", "cardTags", "tagIds", "importantDates", "importantLinks", "helpfullVideoLinks", "importantInstructions"],

  2: ["metaTitle", "metaDescription", "seoKeywords", "seoCanonicalUrl", "schemaMarkupJson"],

  3: ["reviewStatus", "publishedAt"],
}

// Only map jobSnapshot field for admit card autofill from job
const JOB_TO_ADMITCARD_MAP: Record<string, keyof AdmitCardFormDTO> = {
  jobSnapshot: 'jobSnapshot',
};

const admitCardDefaultValues = {
  title: "",
  examName: "",

  descriptionJson: null,
  descriptionHtml: null,

  organizationId: "",
  categoryId: null,

  status: AdmitCardStatus.DRAFT,

  /* ================= Dates ================= */

  releaseDate: null,
  examStartDate: null,
  examEndDate: null,
  publishedAt: null,

  /* ================= Exam Details ================= */

  modeOfExam: null,

  examShifts: [],

  examLocation: null,

  importantInstructions: [],

  /* ================= Relations ================= */

  jobId: null,

  stateIds: [],
  tagIds: [],
  newsAndNotificationIds: [],

  jobSnapshot: null,

  /* ================= Content Blocks ================= */

  cardTags: [],
  helpfullVideoLinks: [],

  importantDates: {},

  importantLinks: [],

  /* ================= Dynamic ================= */

  dynamicFields: [],

  /* ================= SEO ================= */

  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    canonicalUrl: "",
    schemaMarkupJson: null,
  },

  /* ================= Flags ================= */

  isFeatured: false,

  /* ================= Admin ================= */
  reviewStatus: REVIEW_STATUS.DRAFT,
  lastUpdatedBy: null,
};

export function AdmitCardForm({ isAdmin, initialValues, onSubmit, isEditMode }: Props) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [jobSearch, setJobSearch] = useState('');
  const [jobLoading, setJobLoading] = useState(false);

  // console.log("NotificationForm : Initial values for form:", initialValues);

  const form = useForm({
    resolver: zodResolver(AdmitCardSchema),
    defaultValues: initialValues || admitCardDefaultValues,
    mode: "onTouched",
  });

    useEffect(() => {
    setJobLoading(true);
    getPaginatedEntity<IJob>("type=jobs&page=1", JOBS_API, { entityName: "jobs" })
      .then((res) => {
        setJobs(res.data);
        setJobLoading(false);
      })
      .catch(() => setJobLoading(false));
  }, [jobSearch]);

  const handleJobSelect = (jobId: string) => {
    const selectedJob = jobs.find(j => j.id === jobId);
    if (!selectedJob) return;

    const jobSnapshot = {
      advtNumber: selectedJob.advtNumber,
      sector: selectedJob.sector,
      // qualifications: selectedJob.qualifications,
      totalVacancies: selectedJob.totalVacancies,
      jobType: selectedJob.jobType,
      ageLimitText: selectedJob.ageLimitText,
      applicationFee: selectedJob.applicationFee,
    };
    form.setValue('jobSnapshot', jobSnapshot, { shouldDirty: true });
    // Optionally set jobId for reference
    form.setValue('jobId', selectedJob.id, { shouldDirty: true });
  };

  const steps = [
    <StepBasicInfo handleJobSelect={handleJobSelect} jobs={jobs} key="basic" />,
    <StepContent key="content" />,
    <StepSEOAndAI key="seo-ai" />,
    <StepReviewAndSubmit key="review" isAdmin={isAdmin} />,
  ];

  async function nextStep() {
    const valid = await form.trigger(stepValidationMap[step]);
    if (!valid) {
      console.error("Validation errors:", form.formState.errors);
    }
    if (valid) setStep((s) => s + 1);
  }

  function prevStep() {
    setStep((s) => s - 1);
  }

  async function handleSubmit(values: any) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      let res;
      if (isEditMode && initialValues && initialValues.id) {
        res = await updateEntity<IAdmitCard>(ADMIT_CARDS_API, initialValues?.id, values, { entityName: "AdmitCard" });
        if (res.success) setSuccess("Admit Card updated successfully!");
      } else {
        res = await createEntity<IAdmitCard>(ADMIT_CARDS_API, values, { entityName: "AdmitCard" });
        if (res.success) setSuccess("Admit Card created successfully!");
      }
      if (!res.success) setError(res.message || "Failed to submit");
      if (res.success && form.reset) form.reset();
      if (onSubmit) await onSubmit(values);
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
            // console.log("FORM SUBMIT ERRORS:", errors);
            console.log("FORM STATE ERRORS:", form.formState.errors);
          })}
        >
          <Card className="bg-white">
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
                {step < steps.length - 1 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading}>
                    {loading ? getLoadingLabel() : getSubmitLabel()}
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

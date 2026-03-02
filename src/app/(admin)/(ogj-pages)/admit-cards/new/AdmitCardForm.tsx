"use client"

import React, { useEffect, useState } from "react"
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
import { ADMIT_CARDS_API, ANSWER_KEYS_API, CATEGORY_API, JOBS_API, NEWS_AND_NTFN_API, ORGANIZATION_API, QUALIFICATIONS_API, RESULTS_API, STATE_API } from "@/app/envConfig"
import { AdmitCardFormValues, AdmitCardSchema } from "@/lib/schemas/AdmitCardSchema"
import { IJob } from "@/app/helper/interfaces/IJob"
import { AdmitCardFormDTO } from "@/app/helper/dto/AdmitCardFormDTO"
import { IOrganization } from "@/app/helper/interfaces/IOrganization"
import { ICategory } from "@/app/helper/interfaces/ICategory"
import { IState } from "@/app/helper/interfaces/IState"
import { INewsAndNtfn } from "@/app/helper/interfaces/INewsAndNtfn"
import { IResult } from "@/app/helper/interfaces/IResult"
import { IAnswerKey } from "@/app/helper/interfaces/IAnswerKey"
import { IQualification } from "@/app/helper/interfaces/IQualification"

interface Props {
  isAdmin: boolean;
  initialValues?: any;
  onSubmit?: (values: any) => Promise<any>;
  isEditMode?: boolean;
}

export const stepValidationMap: Record<number, any[]> = {
  0: ["title", "examName", "status", "jobId", "organizationId", "categoryId", "stateIds", "newsAndNotificationIds", "isFeatured", 
    "releaseDate", "examStartDate", "examEndDate", "modeOfExam", "examShifts", "examLocation",],

  1: ["descriptionJson", "dynamicFields", "cardTags", "tagIds", "importantDates", "importantLinks", "helpfullVideoLinks"], //"importantInstructions"

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

  // importantInstructions: [],

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

  const [organizations, setOrganizations] = React.useState<IOrganization[]>([]);
  const [categories, setCategories] = React.useState<ICategory[]>([]);
  const [allStates, setAllStates] = React.useState<IState[]>([]);
  const [allNewsAndNotifications, setAllNewsAndNotifications] = React.useState<INewsAndNtfn[]>([]);
  const [allQualifications, setAllQualifications] = React.useState<any[]>([]);
  const [results, setResults] = React.useState<IResult[]>([]);
  const [answerKeys, setAnswerKeys] = React.useState<IAnswerKey[]>([]);

  useEffect(() => { getPaginatedEntity<IOrganization>("type=organizations&page=1", ORGANIZATION_API, { entityName: "organizations" }).then(res => setOrganizations(res.data)).catch(() => setOrganizations([])); }, []);
  useEffect(() => { getPaginatedEntity<ICategory>("type=categories&page=1", CATEGORY_API, { entityName: "categories" }).then((res) => setCategories(res.data)).catch(() => setCategories([])); }, []);
  useEffect(() => { getPaginatedEntity<IState>("type=states&page=1", STATE_API, { entityName: "states" }).then((res) => setAllStates(res.data)).catch(() => setAllStates([])); }, []);
  useEffect(() => { getPaginatedEntity<INewsAndNtfn>("type=news-and-notifications&page=1", NEWS_AND_NTFN_API, { entityName: "newsAndNotifications" }).then((res) => setAllNewsAndNotifications(res.data)).catch(() => setAllNewsAndNotifications([])); }, []);
  useEffect(() => { getPaginatedEntity<IResult>("type=results&page=1", RESULTS_API, { entityName: "results" }).then((response) => setResults(response.data)).catch(() => setResults([])); }, []);
  useEffect(() => { getPaginatedEntity<IAnswerKey>("type=answer-keys&page=1", ANSWER_KEYS_API, { entityName: "answerKeys" }).then((response) => setAnswerKeys(response.data)).catch(() => setAnswerKeys([])); }, []);
  useEffect(() => { getPaginatedEntity<IQualification>("type=qualifications&page=1", QUALIFICATIONS_API, { entityName: "qualifications" }).then((response) => setAllQualifications(response.data)).catch(() => setAllQualifications([])); }, []);

  console.log("AdmitCardForm : Initial values for form:", initialValues);

  const form = useForm<AdmitCardFormValues>({
    resolver: zodResolver(AdmitCardSchema),
    defaultValues: initialValues || admitCardDefaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues]);


  useEffect(() => {
    setJobLoading(true);
    getPaginatedEntity<IJob>("type=jobs&page=1", JOBS_API, { entityName: "jobs" })
      .then((res) => {
        setJobs(res.data);
        setJobLoading(false);
      })
      .catch(() => setJobLoading(false));
  }, [jobSearch]);

  const handleJobChange = (jobId: string | null) => {
    const previousJobId = form.getValues("jobId");

    // CASE 1: switching FROM mapped → manual
    if (!jobId) {
      form.setValue("jobId", null, { shouldDirty: true });
      return; // snapshot stays manual
    }

    // CASE 2: same job re-selected → do nothing
    if (jobId === previousJobId) return;

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
     allStates={allStates} allNewsAndNotifications={allNewsAndNotifications} allQualifications={allQualifications}
      results={results} answerKeys={answerKeys} key="basic" />,

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
    if (step >= steps.length - 1) return;
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
      
      if (!isEditMode && res.success) {
        form.reset(admitCardDefaultValues);
      }

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
                <Button
                  type={step === steps.length - 1 ? "submit" : "button"}
                  onClick={step === steps.length - 1 ? undefined : nextStep}
                  disabled={loading}
                >
                  {step === steps.length - 1
                    ? (loading ? getLoadingLabel() : getSubmitLabel())
                    : "Next"}
                </Button>

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

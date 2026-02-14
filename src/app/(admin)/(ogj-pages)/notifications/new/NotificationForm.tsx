"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/shadcn/ui/form"
import { Card, CardContent, CardHeader } from "@/components/shadcn/ui/card"
import { Button } from "@/components/shadcn/ui/button"

import { NewsAndNotificationSchema } from "@/app/lib/schemas/NewsAndNtfnSchema"
import { StepContent } from "./StepContent"
import { StepSEOAndAI } from "./StepSEOAndAI"
import { StepReviewAndSubmit } from "./StepReviewAndSubmit"
import { StepBasicInfo } from "./StepBasicInfo"
import { REVIEW_STATUS } from "../../form-interfaces/global"
import { createNewsAndNtfn } from "@/app/lib/api/notifications"
import { updateNewsAndNtfn } from "@/app/lib/api/notifications";

interface Props {
  isAdmin: boolean;
  initialValues?: any;
  onSubmit?: (values: any) => Promise<any>;
  isEditMode?: boolean;
}

export const stepValidationMap: Record<number, any[]> = {
  0: ["title", "shortTitle", "officialOrderNumber", "version", "status", "priority", "relatedEntityType", "officialLink",
    "downloadLink", "organizationId", "categoryId", "stateIds", "relatedJobIds", "relatedAdmitCardIds",
    "relatedResultIds", "relatedAnswerKeyIds", "isFeatured", "isVerified", "minAge", "maxAge", "qualifications"],

  1: ["descriptionJson", "headlineImage.url", "dynamicFields", "tags", "importantLinks"],

  2: ["metaTitle", "metaDescription", "seoKeywords", "seoCanonicalUrl", "schemaMarkupJson"],

  3: ["reviewStatus", "publishedAt"],
}

const newsAndNotificationDefaultValues = {
  title: "",
  shortTitle: "",
  slug: "",
  descriptionHtml: "",
  descriptionJson: "",
  headlineImage: { url: "", altText: "", caption: "" },
  officialOrderNumber: "",
  version: 1,
  status: "published",
  priority: "medium",
  relatedEntityType: undefined,
  language: "en",
  translations: {},
  officialLink: "",
  downloadLink: "",
  isFeatured: false,
  isVerified: false,
  sourceLinks: [],
  organizationId: null,
  categoryId: null,
  stateIds: [],
  relatedJobIds: [],
  relatedAdmitCardIds: [],
  relatedResultIds: [],
  relatedAnswerKeyIds: [],
  tags: [],
  importantLinks: [],
  dynamicFields: [],
  metaTitle: "",
  metaDescription: "",
  seoKeywords: [],
  seoCanonicalUrl: "",
  schemaMarkupJson: {},
  minAge: 0,
  maxAge: 0,
  qualifications: "",
  engagement: { view_count: 0, save_count: 0, share_count: 0, heat_index: 0, live_viewers: 0 },
  reviewStatus: REVIEW_STATUS.DRAFT,
  publishedAt: undefined,
};

export function NotificationForm({ isAdmin, initialValues, onSubmit, isEditMode }: Props) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(NewsAndNotificationSchema),
    defaultValues: initialValues || newsAndNotificationDefaultValues,
    mode: "onTouched",
  });

  const steps = [
    <StepBasicInfo key="basic" />,
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
        res = await updateNewsAndNtfn(initialValues.id, values);
        if (res.success) setSuccess("News And Notification updated successfully!");
      } else {
        res = await createNewsAndNtfn(values);
        if (res.success) setSuccess("News And Notification created successfully!");
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

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit, (errors) => {
            console.log("FORM SUBMIT ERRORS:", errors);
            console.log("FORM STATE ERRORS:", form.formState.errors);
          })}
        >
          <Card>
            <CardHeader></CardHeader>
            <CardContent className="space-y-6">
              {steps[step]}
              <div className="flex justify-between pt-6">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                )}
                {step < steps.length - 1 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading}>
                    {loading ? (isEditMode ? "Saving..." : "Submitting...") : isEditMode ? "Update" : isAdmin ? "Publish" : "Submit for Review"}
                  </Button>
                )}
              </div>
              {error && <div className="text-red-500 font-medium">{error}</div>}
              {success && <div className="text-green-600 font-medium">{success}</div>}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

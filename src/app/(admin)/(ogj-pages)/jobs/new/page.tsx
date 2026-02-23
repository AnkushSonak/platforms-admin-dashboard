"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { JobFormData, jobSchema } from "@/lib/schemas/JobSchema";
import FullJobFieldsSection from "../sections/FullJobFieldsSection";
import { convertLexicalToHtml } from "@/lib/utils/LaxicalToHtml";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/shadcn/ui/button";
import { ArrowLeft } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL;

export default function AddJobPage() {
  const router = useRouter();

  // -----------------------------
  // Form default values
  // -----------------------------
  const initialJob: JobFormData = {
    title: "",
    descriptionJson: null,
    descriptionHtml: "",
    states: [],
    isFeatured: false,
    status: "draft",
  };

  // -----------------------------
  // Local UI state
  // -----------------------------
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Latest HTML to avoid recomputation
  const latestHtmlRef = useRef<string>("");

  // -----------------------------
  // React Hook Form
  // -----------------------------
  const methods = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: initialJob,
    mode: "onSubmit",
    shouldFocusError: true,
  });

  const { handleSubmit, watch, setValue } = methods;

  // -----------------------------
  // Sync descriptionJson → descriptionHtml
  // -----------------------------
  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name !== "descriptionJson") return;
      try {
        const html = convertLexicalToHtml(values.descriptionJson);
        latestHtmlRef.current = html || "";
        setValue("descriptionHtml", latestHtmlRef.current, {
          shouldValidate: false,
          shouldDirty: false,
        });
      } catch {}
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // -----------------------------
  // Submit handler
  // -----------------------------
  const handleCreateJob = async (values: JobFormData) => {
    setSaving(true);
    setApiError(null);
    setSuccess(false);

    try {
      const payload: JobFormData = { ...values, descriptionHtml: latestHtmlRef.current };

      // Normalize date fields
      (["expiryDate", "autoPublishAt"] as const).forEach((key) => {
        const v = payload[key];
        if (v instanceof Date) payload[key] = v.toISOString() as any;
      });

      // Optional logo upload
      if (logoFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null)
            formData.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
        });
        formData.append("logoFile", logoFile);

        const res = await fetch(`${API_BASE_URL}/job/file`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!res.ok) throw new Error("Logo upload failed");
      }

      // Create job
      const res = await fetch(`${API_BASE_URL}/job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create job");
      }

      setSuccess(true);
      router.push("/jobs");
    } catch (err: any) {
      setApiError(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/jobs">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Create Job</h1>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleCreateJob)} className="space-y-6">
          <FullJobFieldsSection
            onLogoFileChange={(file) => {
              setLogoFile(file);
              if (!file) return setLogoError(null);

              const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
              if (!allowed.includes(file.type)) setLogoError("Invalid file type");
              else if (file.size > 1024 * 1024) setLogoError("Max file size is 1MB");
              else setLogoError(null);
            }}
            onHtmlChange={(html) => (latestHtmlRef.current = html)}
          />

          {logoError && <p className="text-red-500 text-xs">{logoError}</p>}

          <Button type="submit" disabled={saving || !!logoError}>
            {saving ? "Saving…" : "Create Job"}
          </Button>

          {success && <p className="text-green-600">Saved successfully!</p>}
          {apiError && <p className="text-red-600">{apiError}</p>}
        </form>
      </FormProvider>
    </div>
  );
}
